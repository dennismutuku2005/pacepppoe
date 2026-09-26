"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Edit3, Trash2, Layers, Activity, Search, DollarSign, Network, Users, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { AdminCardSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { planService } from '@/services/isp/plans'
import { routerService } from '@/services/isp/routers'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'

function PackagesContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [packages, setPackages] = useState([])
    const [routersList, setRoutersList] = useState([])
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentPackage, setCurrentPackage] = useState(null)
    const [formData, setFormData] = useState({ 
        name: '', 
        price: '', 
        bandwidth_limit: '', 
        router_id: ''
    })

    const fetchData = async () => {
        try {
            const [plansRes, routersRes] = await Promise.all([
                planService.getPlans(),
                routerService.getRouters()
            ])

            if (plansRes.status === 'success') {
                setPackages(plansRes.data || [])
            }
            if (routersRes.status === 'success') {
                setRoutersList(routersRes.data || [])
            }
        } catch (err) {
            console.error("Failed to load service plans data:", err)
            toast.error("Data Load Error", { description: "Failed to load service plans or routers from server." })
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleRefresh = () => {
        setIsRefreshing(true)
        fetchData()
    }

    const handleOpenModal = (p = null) => {
        if (p) {
            setCurrentPackage(p)
            setFormData({ 
                name: p.name || '', 
                price: p.price !== undefined ? String(p.price) : '', 
                bandwidth_limit: p.bandwidth || '', 
                router_id: p.router_id ? String(p.router_id) : (routersList.length > 0 ? String(routersList[0].id) : '')
            })
        } else {
            setCurrentPackage(null)
            setFormData({ 
                name: '', 
                price: '', 
                bandwidth_limit: '', 
                router_id: routersList.length > 0 ? String(routersList[0].id) : ''
            })
        }
        setIsModalOpen(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.price || !formData.bandwidth_limit || !formData.router_id) {
            toast.error('Validation Failed', {
                description: 'Please specify the Plan Name, Speed / Bandwidth, Target Router, and Monthly Price.'
            })
            return
        }

        setIsSaving(true)
        const payload = {
            name: formData.name.trim(),
            bandwidth_limit: formData.bandwidth_limit.trim(),
            price: parseFloat(formData.price),
            router_id: parseInt(formData.router_id)
        }

        try {
            if (currentPackage) {
                const res = await planService.updatePlan(currentPackage.id, payload)
                if (res?.status === 'success') {
                    toast.success('Plan Updated', {
                        description: `Service plan "${payload.name}" has been updated.`
                    })
                    setIsModalOpen(false)
                    await fetchData()
                } else {
                    toast.error('Update Failed', { description: res?.message || 'Could not update plan.' })
                }
            } else {
                const res = await planService.createPlan(payload)
                if (res?.status === 'success') {
                    toast.success('Plan Created', {
                        description: `New service plan "${payload.name}" has been created.`
                    })
                    setIsModalOpen(false)
                    await fetchData()
                } else {
                    toast.error('Creation Failed', { description: res?.message || 'Could not create plan.' })
                }
            }
        } catch (err) {
            console.error("Save plan error:", err)
            toast.error('Network Error', { description: 'Failed to communicate with backend server.' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id, name, subscribersCount) => {
        if (subscribersCount > 0) {
            toast.error('Decommission Denied', {
                description: `Cannot delete plan "${name}". There are ${subscribersCount} active subscribers currently on this tier.`
            })
            return
        }

        if (!window.confirm(`Are you sure you want to delete plan "${name}"?`)) return

        try {
            const res = await planService.deletePlan(id)
            if (res?.status === 'success') {
                toast.success('Plan Deleted', {
                    description: `${name} has been removed from the service matrix.`
                })
                await fetchData()
            } else {
                toast.error('Delete Failed', { description: res?.message || 'Could not delete plan.' })
            }
        } catch (err) {
            console.error("Delete plan error:", err)
            toast.error('Delete Failed', { description: 'Failed to delete service plan.' })
        }
    }

    const filteredPackages = packages.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.bandwidth?.toLowerCase().includes(search.toLowerCase()) ||
        p.router_name?.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading && packages.length === 0) {
        return <TablePageSkeleton />
    }

    const totalPlans = packages.length
    const totalSubscribers = packages.reduce((sum, p) => sum + (p.subscribers || 0), 0)
    const avgPrice = totalPlans ? Math.round(packages.reduce((sum, p) => sum + Number(p.price || 0), 0) / totalPlans) : 0

    const cards = [
        {
            label: 'Total Tiers',
            value: totalPlans,
            icon: Layers,
            color: 'text-pace-purple',
            bg: 'bg-pace-purple/5',
            accent: 'bg-gradient-to-b from-pace-purple to-indigo-500',
            iconBorder: 'border-pace-purple/10 group-hover:border-pace-purple/30'
        },
        {
            label: 'Active Profiles',
            value: totalPlans,
            icon: Activity,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/5',
            accent: 'bg-gradient-to-b from-emerald-400 to-teal-500',
            iconBorder: 'border-emerald-500/10 group-hover:border-emerald-500/30'
        },
        {
            label: 'Avg Plan Price',
            value: `KES ${avgPrice.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-blue-500',
            bg: 'bg-blue-500/5',
            accent: 'bg-gradient-to-b from-blue-400 to-cyan-500',
            iconBorder: 'border-blue-500/10 group-hover:border-blue-500/30'
        },
        {
            label: 'Total Subscribers',
            value: totalSubscribers,
            icon: Users,
            color: 'text-orange-500',
            bg: 'bg-orange-500/5',
            accent: 'bg-gradient-to-b from-orange-400 to-amber-500',
            iconBorder: 'border-orange-500/10 group-hover:border-orange-500/30'
        }
    ]

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Service Plans</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">QoS Queuing Profiles & Subscription Pricing</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all text-xs font-semibold disabled:opacity-50 cursor-pointer"
                        title="Refresh plans"
                    >
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                        <span>Refresh Plans</span>
                    </button>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:bg-pace-purple/90 transition-all text-xs font-semibold shadow-sm active:scale-95 cursor-pointer"
                    >
                        <Plus size={15} />
                        <span>Create Plan</span>
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading && packages.length === 0 ? (
                    [...Array(4)].map((_, i) => <AdminCardSkeleton key={i} />)
                ) : (
                    cards.map((card) => (
                        <div 
                            key={card.label} 
                            className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0"
                        >
                            {/* Left accent color strip */}
                            <div className={cn("absolute left-0 top-0 bottom-0 w-1", card.accent)} />
                            
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={card.label}>
                                        {card.label}
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300">
                                        {card.value}
                                    </p>
                                </div>
                                <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-105", card.iconBorder, card.bg)}>
                                    <card.icon className={cn(card.color, "w-4 h-4")} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search service profiles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Standardized Table View */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-3.5">Plan Identity</th>
                                <th className="px-6 py-3.5 text-center">Speed Limit</th>
                                <th className="px-6 py-3.5">Router / Pool</th>
                                <th className="px-6 py-3.5 text-center">Subscribers</th>
                                <th className="px-6 py-3.5 text-right">Monthly Price</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredPackages.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim text-sm font-medium">
                                        No service plans defined in database. Click "Create Plan" to add your first QoS tier.
                                    </td>
                                </tr>
                            ) : (
                                filteredPackages.map((p) => {
                                    return (
                                        <tr key={p.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-pace-purple/10 flex items-center justify-center text-pace-purple font-bold text-xs shrink-0">
                                                        <Layers size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-admin-value">{p.name}</div>
                                                        <div className="text-[10px] text-admin-dim font-mono">{p.bandwidth}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <Badge variant="info" className="text-[11px] font-mono font-semibold px-2.5 py-0.5">
                                                    {p.bandwidth}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-admin-dim">
                                                    <Network size={14} className="text-admin-dim/70 shrink-0" />
                                                    <span>{p.router_name || 'MikroTik'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-pace-bg-subtle text-admin-value border border-pace-border tabular-nums">
                                                    {p.subscribers || 0} users
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <span className="text-xs font-bold text-admin-value tabular-nums font-mono">
                                                    KES {Number(p.price).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <button 
                                                        onClick={() => handleOpenModal(p)}
                                                        className="p-1.5 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 rounded-lg transition-all"
                                                        title="Edit Plan"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(p.id, p.name, p.subscribers)}
                                                        className="p-1.5 text-admin-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Delete Plan"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Plan Create / Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentPackage ? 'Edit Service Plan' : 'Create Service Plan'}
                description={currentPackage ? `Updating QoS profile configuration for ${currentPackage.name}` : 'Create a new bandwidth QoS queuing profile and price for MikroTik.'}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSave} className="space-y-4 font-figtree">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Plan Identity (Name)</label>
                        <input 
                            type="text" required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. Bronze 5Mbps"
                            className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Speed Limit</label>
                            <input 
                                type="text" required
                                value={formData.bandwidth_limit}
                                onChange={(e) => setFormData({...formData, bandwidth_limit: e.target.value})}
                                placeholder="5M/5M"
                                className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                            />
                            <p className="text-[9px] text-admin-dim pl-1">e.g. 5M/5M, 10M/10M</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Target Router</label>
                            <select 
                                required
                                value={formData.router_id}
                                onChange={(e) => setFormData({...formData, router_id: e.target.value})}
                                className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                            >
                                <option value="">Select Router</option>
                                {routersList.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                            <p className="text-[9px] text-admin-dim pl-1">NAS router assignment</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Monthly Price (KES)</label>
                        <input 
                            type="text" required inputMode="decimal"
                            value={formData.price}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                    setFormData(prev => ({ ...prev, price: val }));
                                }
                            }}
                            placeholder="1500"
                            className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-admin-value outline-none focus:border-pace-purple transition-all font-mono"
                        />
                    </div>

                    <div className="pt-3 grid grid-cols-2 gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="w-full px-5 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="w-full px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : (currentPackage ? 'Save Changes' : 'Create Plan')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function PackagesPage() {
    return (
        <Suspense fallback={<TablePageSkeleton />}>
            <PackagesContent />
        </Suspense>
    )
}