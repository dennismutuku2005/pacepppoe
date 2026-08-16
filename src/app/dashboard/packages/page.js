"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Package, Edit3, Trash2, Zap, Search, Activity, Sliders, DollarSign, Shield, Network, Users } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, TableRowSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { mockPackages, mockCustomers } from '@/services/mockData'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'

function PackagesContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [packages, setPackages] = useState([])
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentPackage, setCurrentPackage] = useState(null)
    const [formData, setFormData] = useState({ 
        name: '', price: '', limit: '', router: '', active: true 
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setPackages(mockPackages.map(p => ({ ...p, active: p.active !== false })))
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleOpenModal = (p = null) => {
        if (p) {
            setCurrentPackage(p)
            setFormData({ ...p, active: p.active !== false })
        } else {
            setCurrentPackage(null)
            setFormData({ 
                name: '', price: '', limit: '', router: '', active: true 
            })
        }
        setIsModalOpen(true)
    }

    const handleSave = (e) => {
        e.preventDefault()
        if (!formData.name || !formData.price || !formData.limit) {
            toast.error('Validation Failed', {
                description: 'Please specify the Plan Name, Monthly Price, and Speed Limit.'
            })
            return
        }

        if (currentPackage) {
            setPackages(prev => prev.map(p => p.id === currentPackage.id ? { ...p, ...formData } : p))
            toast.success('Profile Synchronized', {
                description: `QoS parameters for ${formData.name} have been updated.`
            })
        } else {
            const newPkg = { ...formData, id: Date.now() }
            setPackages(prev => [newPkg, ...prev])
            toast.success('Profile Initialized', {
                description: `New service tier ${formData.name} is now available.`
            })
        }
        setIsModalOpen(false)
    }

    const handleToggleActive = (id) => {
        setPackages(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
        toast.success('Plan Status Updated', {
            description: 'The package availability has been changed.'
        })
    }

    const handleDelete = (id, name, limit) => {
        const activeUsers = mockCustomers.filter(c => c.plan === limit || c.plan === name)
        if (activeUsers.length > 0) {
            toast.error('Decommission Denied', {
                description: `Cannot delete plan "${name}". There are ${activeUsers.length} active subscribers currently on this tier.`
            })
            return
        }

        setPackages(prev => prev.filter(p => p.id !== id))
        toast.success('Plan Decommissioned', {
            description: `${name} has been removed from the service matrix.`
        })
    }

    const filteredPackages = packages.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.limit?.toLowerCase().includes(search.toLowerCase()) ||
        p.router?.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) {
        return <TablePageSkeleton />
    }

    const totalPlans = packages.length
    const activePlans = packages.filter(p => p.active).length
    const avgPrice = totalPlans ? Math.round(packages.reduce((sum, p) => sum + Number(p.price || 0), 0) / totalPlans) : 0

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Service Plans</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">QoS Queuing Profiles & Subscription Pricing</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-sm active:scale-95"
                >
                    <Plus size={16} />
                    <span>Create Plan</span>
                </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card-bg border border-pace-border rounded-xl p-5 hover:border-pace-purple/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-pace-purple/10">
                            <Zap size={20} className="text-pace-purple" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-admin-value tracking-tight tabular-nums">{totalPlans}</h3>
                    <p className="text-[11px] font-medium text-gray-400 mt-1">Total Tiers</p>
                </div>
                <div className="bg-card-bg border border-pace-border rounded-xl p-5 hover:border-pace-purple/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
                            <Activity size={20} className="text-emerald-500" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-admin-value tracking-tight tabular-nums">{activePlans}</h3>
                    <p className="text-[11px] font-medium text-gray-400 mt-1">Active Profiles</p>
                </div>
                <div className="bg-card-bg border border-pace-border rounded-xl p-5 hover:border-pace-purple/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10">
                            <DollarSign size={20} className="text-blue-500" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-admin-value tracking-tight tabular-nums">KES {avgPrice.toLocaleString()}</h3>
                    <p className="text-[11px] font-medium text-gray-400 mt-1">Avg Plan Price</p>
                </div>
                <div className="bg-card-bg border border-pace-border rounded-xl p-5 hover:border-pace-purple/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500/10">
                            <Users size={20} className="text-orange-500" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-admin-value tracking-tight tabular-nums">{mockCustomers.length}</h3>
                    <p className="text-[11px] font-medium text-gray-400 mt-1">Total Subscribers</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search service profiles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
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
                                    <td colSpan="6" className="py-24 text-center text-admin-dim text-sm font-medium">No service tiers defined</td>
                                </tr>
                            ) : (
                                filteredPackages.map((p) => {
                                    const subCount = mockCustomers.filter(c => c.plan === p.limit || c.plan === p.name).length
                                    return (
                                        <tr key={p.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-pace-purple/10 flex items-center justify-center text-pace-purple font-bold text-xs shrink-0">
                                                        <Zap size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-admin-value">{p.name}</div>
                                                        {p.burstLimit && (
                                                            <div className="text-[10px] text-admin-dim">Burst: {p.burstLimit}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <Badge variant="info" className="text-[11px] font-mono font-semibold px-2.5 py-1">
                                                    {p.limit}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-admin-dim">
                                                    <Network size={14} className="text-admin-dim/70 shrink-0" />
                                                    <span>{p.router || p.poolName || 'Default Router'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pace-bg-subtle text-admin-value border border-pace-border tabular-nums">
                                                    {subCount} users
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <span className="text-xs font-bold text-admin-value tabular-nums">KES {Number(p.price).toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleActive(p.id)}
                                                        className={cn(
                                                            "relative inline-flex h-5 w-9 items-center rounded-full transition-all shrink-0",
                                                            p.active ? "bg-pace-purple" : "bg-pace-border"
                                                        )}
                                                        title={p.active ? 'Disable package' : 'Enable package'}
                                                        aria-label={p.active ? 'Disable package' : 'Enable package'}
                                                    >
                                                        <span className={cn(
                                                            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-all",
                                                            p.active ? "translate-x-4" : "translate-x-0.5"
                                                        )} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenModal(p)}
                                                        className="p-1.5 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 rounded-lg transition-all"
                                                        title="Edit Plan"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(p.id, p.name, p.limit)}
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

            {/* Plan Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentPackage ? 'Edit Plan Profile' : 'Create Plan Profile'}
                description={currentPackage ? `Synchronizing QoS for ${currentPackage.name}` : 'Construct a new bandwidth queuing profile.'}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Plan Identity (PPPoE Profile)</label>
                            <input 
                                type="text" required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Bronze 5Mbps"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Speed</label>
                                <input 
                                    type="text" required
                                    value={formData.limit}
                                    onChange={(e) => setFormData({...formData, limit: e.target.value})}
                                    placeholder="5M/5M"
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Router / Pool</label>
                                <input 
                                    type="text"
                                    value={formData.router || ''}
                                    onChange={(e) => setFormData({...formData, router: e.target.value})}
                                    placeholder="MikroTik / shared-pool"
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-dim outline-none focus:border-pace-purple transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Price (KES)</label>
                            <input 
                                type="number" required
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                placeholder="1500"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-admin-value outline-none focus:border-pace-purple transition-all font-mono"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-pace-border bg-pace-bg-subtle px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-admin-value">Enable package</p>
                                <p className="text-[11px] text-admin-dim">Turn this plan on or off without deleting it.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, active: !formData.active})}
                                className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-all shrink-0",
                                    formData.active ? "bg-pace-purple" : "bg-pace-border"
                                )}
                            >
                                <span className={cn(
                                    "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-all",
                                    formData.active ? "translate-x-5" : "translate-x-0.5"
                                )} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-5 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-[2] px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-all active:scale-95"
                        >
                            {currentPackage ? 'Save Changes' : 'Create Plan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function PackagesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Syncing QoS matrix...</div>}>
            <PackagesContent />
        </Suspense>
    )
}