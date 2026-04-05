"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Package, Edit3, Trash2, ShieldCheck, Zap, Download, Search, Save, X, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mockPackages } from '@/services/mockData'
import Swal from 'sweetalert2'
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
            setPackages(mockPackages.map(p => ({ ...p, burstLimit: '0/0', priority: '8', poolName: 'shared-pool' })))
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
            Swal.fire('Error', 'Please fill required fields (Name, Price, Limit)', 'error')
            return
        }

        if (currentPackage) {
            setPackages(prev => prev.map(p => p.id === currentPackage.id ? { ...p, ...formData } : p))
            Swal.fire('Updated!', 'Advanced package profiles synchronized.', 'success')
        } else {
            const newPkg = { ...formData, id: Date.now() }
            setPackages(prev => [newPkg, ...prev])
            Swal.fire('Created!', 'New subscription profile deployed.', 'success')
        }
        setIsModalOpen(false)
    }

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Delete Profile?',
            text: `Revoke the ${name} service profile?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E11D48',
            confirmButtonText: 'Yes, Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                setPackages(prev => prev.filter(p => p.id !== id))
                Swal.fire('Deleted!', 'Service profile offboarded.', 'success')
            }
        })
    }

    const filteredPackages = packages.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-lg font-bold text-admin-value flex items-center gap-3 tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-pace-purple/10 flex items-center justify-center">
                            <Package size={20} className="text-pace-purple" />
                        </div>
                        Service Plan Matrix
                    </h1>
                    <p className="text-[10px] font-bold text-admin-dim mt-1 tracking-widest uppercase italic">Advanced QoS Queuing & Subscription Pricing</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-xs font-bold uppercase tracking-widest shadow-xl shadow-pace-purple/20 active:scale-95"
                >
                    <Plus size={14} /> New Profile
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search service profiles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* High Density Table */}
            <div className="overflow-hidden bg-white dark:bg-card-bg border border-pace-border rounded-2xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap text-[12px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-widest text-[9px]">
                                <th className="px-6 py-4">Service Profile</th>
                                <th className="px-6 py-4">Sustained / Burst</th>
                                <th className="px-6 py-4">QoS Priority</th>
                                <th className="px-6 py-4">IP Pool</th>
                                <th className="px-6 py-4">Subscription</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-4"><div className="h-4 bg-pace-bg-subtle rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredPackages.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim uppercase text-[10px] font-bold tracking-widest italic">No service tiers mapped</td>
                                </tr>
                            ) : (
                                filteredPackages.map((p) => (
                                    <tr key={p.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group cursor-default">
                                        <td className="px-6 py-3">
                                            <span className="text-[13px] font-bold text-admin-value transition-colors">{p.name}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] font-mono border-pace-border bg-white dark:bg-pace-bg-subtle px-2 py-0.5 lowercase text-pace-purple">
                                                    {p.limit}
                                                </Badge>
                                                <span className="text-[8px] text-admin-dim font-bold uppercase tracking-tighter">/</span>
                                                <span className="text-[10px] font-mono text-admin-dim italic">{p.burstLimit || 'none'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-black italic">P-{p.priority || 8}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">{p.poolName || 'default'}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-[12px] font-black text-admin-value tabular-nums">KES {Number(p.price).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(p)}
                                                    className="p-1.5 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 rounded-lg transition-all"
                                                >
                                                    <Edit3 size={13} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(p.id, p.name)}
                                                    className="p-1.5 text-admin-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={13} />
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

            {/* Advanced CRUD Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentPackage ? 'Synchronize Plan Profile' : 'Initialize Plan Profile'}
                description={currentPackage ? `Advanced QoS modification for ${currentPackage.name}` : 'Construct a new bandwidth queuing profile with burst support.'}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSave} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Plan Identity (PPPoE Profile Name)</label>
                            <input 
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Bronze 5Mbps"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Sustained limit (RX/TX)</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.limit}
                                    onChange={(e) => setFormData({...formData, limit: e.target.value})}
                                    placeholder="5M/5M"
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Burst limit (Peak RX/TX)</label>
                                <input 
                                    type="text"
                                    value={formData.burstLimit}
                                    onChange={(e) => setFormData({...formData, burstLimit: e.target.value})}
                                    placeholder="10M/10M"
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-dim outline-none focus:border-pace-purple transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">QoS Priority Queue</label>
                                <select 
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                                >
                                    {[1,2,3,4,5,6,7,8].map(p => (
                                        <option key={p} value={p}>Priority {p} {p === 1 ? '(Critical)' : p === 8 ? '(Best Effort)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Assigned Address Pool</label>
                                <input 
                                    type="text"
                                    value={formData.poolName}
                                    onChange={(e) => setFormData({...formData, poolName: e.target.value})}
                                    placeholder="pppoe-pool"
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-dim outline-none focus:border-pace-purple transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Monthly cost (KES)</label>
                                <input 
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    placeholder="1500"
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all tabular-nums"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Service Visibility</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                                >
                                    <option value="active">Active - Synchronize with NAS</option>
                                    <option value="inactive">Inactive - System Lockdown</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-5 py-2.5 border border-pace-border rounded-xl text-xs font-bold text-admin-dim uppercase tracking-widest hover:bg-pace-bg-subtle transition-all"
                        >
                            Abort
                        </button>
                        <button 
                            type="submit"
                            className="flex-3 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 shadow-xl shadow-pace-purple/20 transition-all active:scale-95"
                        >
                            {currentPackage ? 'Commit Advanced QoS' : 'Initialize Plan Matrix'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function PackagesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse uppercase text-[10px] font-bold tracking-widest italic">Syncing QoS Matrix...</div>}>
            <PackagesContent />
        </Suspense>
    )
}