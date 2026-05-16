"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Package, Edit3, Trash2, Zap, Search, Activity, Sliders, DollarSign, Shield, Network, Layers } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, TableRowSkeleton } from '@/components/Skeleton'
import { mockPackages } from '@/services/mockData'
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
        name: '', price: '', limit: '', status: 'active', 
        burstLimit: '', priority: '8', poolName: '' 
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setPackages(mockPackages)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleOpenModal = (p = null) => {
        if (p) {
            setCurrentPackage(p)
            setFormData({ ...p })
        } else {
            setCurrentPackage(null)
            setFormData({ 
                name: '', price: '', limit: '', status: 'active', 
                burstLimit: '0/0', priority: '8', poolName: 'shared-pool' 
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

    const handleDelete = (id, name) => {
        setPackages(prev => prev.filter(p => p.id !== id))
        toast.error('Profile Decommissioned', {
            description: `${name} has been removed from the service matrix.`
        })
    }

    const filteredPackages = packages.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase())
    )

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
                                <th className="px-6 py-3">Plan Identity</th>
                                <th className="px-6 py-3 text-center">Speed Limit</th>
                                <th className="px-6 py-3">Burst / Priority</th>
                                <th className="px-6 py-3">Network Pool</th>
                                <th className="px-6 py-3 text-right">Monthly Cost</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={6} rows={8} />
                            ) : filteredPackages.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim text-sm font-medium">No service tiers defined</td>
                                </tr>
                            ) : (
                                filteredPackages.map((p) => (
                                    <tr key={p.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                        <td className="px-6 py-2">
                                            <span className="text-xs font-semibold text-admin-value">{p.name}</span>
                                        </td>
                                        <td className="px-6 py-2 text-center">
                                            <Badge variant="success" className="text-[10px] font-medium border-none">
                                                {p.limit}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-semibold text-admin-value font-mono">{p.burstLimit || 'No Burst'}</span>
                                                <span className="text-[9px] text-admin-dim font-medium uppercase tracking-wider">Priority: {p.priority}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 text-xs font-medium text-admin-dim">
                                            {p.poolName || 'Default Pool'}
                                        </td>
                                        <td className="px-6 py-2 text-right">
                                            <span className="text-xs font-bold text-admin-value tabular-nums">KES {Number(p.price).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-2 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button 
                                                    onClick={() => handleOpenModal(p)}
                                                    className="p-1 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-lg transition-all"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(p.id, p.name)}
                                                    className="p-1 text-admin-dim hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Plan Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentPackage ? 'Update Plan Profile' : 'Initialize Plan Profile'}
                description={currentPackage ? `Synchronizing QoS for ${currentPackage.name}` : 'Construct a new bandwidth queuing profile.'}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSave} className="p-6 space-y-6">
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
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Sustained limit</label>
                                <input 
                                    type="text" required
                                    value={formData.limit}
                                    onChange={(e) => setFormData({...formData, limit: e.target.value})}
                                    placeholder="5M/5M"
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Burst limit</label>
                                <input 
                                    type="text"
                                    value={formData.burstLimit}
                                    onChange={(e) => setFormData({...formData, burstLimit: e.target.value})}
                                    placeholder="10M/10M"
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-dim outline-none focus:border-pace-purple transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">QoS Priority</label>
                                <select 
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                                >
                                    {[1,2,3,4,5,6,7,8].map(p => (
                                        <option key={p} value={p}>Priority {p} {p === 1 ? '(Critical)' : p === 8 ? '(Best Effort)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Address Pool</label>
                                <input 
                                    type="text"
                                    value={formData.poolName}
                                    onChange={(e) => setFormData({...formData, poolName: e.target.value})}
                                    placeholder="pppoe-pool"
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-dim outline-none focus:border-pace-purple transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Monthly cost (KES)</label>
                                <input 
                                    type="number" required
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    placeholder="1500"
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-admin-value outline-none focus:border-pace-purple transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Visibility</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                                >
                                    <option value="active">Active - NAS Synchronized</option>
                                    <option value="inactive">Inactive - System Lockdown</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-5 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all"
                        >
                            Abort
                        </button>
                        <button 
                            type="submit"
                            className="flex-[2] px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-all active:scale-95"
                        >
                            {currentPackage ? 'Commit Changes' : 'Initialize Tier'}
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