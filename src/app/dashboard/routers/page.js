"use client";

import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { Search, Plus, Network, Activity, CheckCircle2, XCircle, MoreHorizontal, Power, Loader2, ShieldCheck, ShieldAlert, Users, Edit2, Trash2, Cpu, MapPin, Key } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import Swal from 'sweetalert2'
import { Modal } from '@/components/Modal'

function RoutersContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [routers, setRouters] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentRouter, setCurrentRouter] = useState(null)
    const [formData, setFormData] = useState({ 
        name: '', ip: '', status: 'online', users: 0,
        apiPort: '8728', username: 'admin', password: '', 
        model: 'CCR1036-8G-2S+', location: 'Nairobi Data-Center'
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setRouters(mockDashboardData.routerStatus.map(r => ({
                ...r,
                apiPort: '8728',
                model: 'RB4011iGS+',
                location: 'Core Node A1'
            })))
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleOpenModal = (r = null) => {
        if (r) {
            setCurrentRouter(r)
            setFormData({ ...r })
        } else {
            setCurrentRouter(null)
            setFormData({ 
                name: '', ip: '', status: 'online', users: 0,
                apiPort: '8728', username: 'admin', password: '',
                model: 'RB4011iGS+', location: 'Data Center'
            })
        }
        setIsModalOpen(true)
    }

    const handleSave = (e) => {
        e.preventDefault()
        if (!formData.name || !formData.ip) {
            Swal.fire('Error', 'Sovereign Node Name & Host IP are required.', 'error')
            return
        }

        if (currentRouter) {
            setRouters(prev => prev.map(r => r.id === currentRouter.id ? { ...r, ...formData } : r))
            Swal.fire('Synchronized!', 'Infrastructure parameters updated.', 'success')
        } else {
            const newRouter = { ...formData, id: Date.now() }
            setRouters(prev => [...prev, newRouter])
            Swal.fire('Deployed!', 'New network node integrated into Hub.', 'success')
        }
        setIsModalOpen(false)
    }

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Decommission Node?',
            text: `Detach ${name} from the orchestration layer?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E11D48',
            confirmButtonText: 'Yes, Detach'
        }).then((result) => {
            if (result.isConfirmed) {
                setRouters(prev => prev.filter(r => r.id !== id))
                Swal.fire('Detached!', 'Node decommissioned successfully.', 'success')
            }
        })
    }

    const handleReboot = (name) => {
        Swal.fire({
            title: 'Reboot Router?',
            text: `Confirming reboot for ${name}. Physical sessions will drop.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E11D48',
            confirmButtonText: 'Yes, Reboot'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Signal Transmitted!', 'MikroTik reboot command issued.', 'success')
            }
        })
    }

    const filteredRouters = routers.filter(router =>
        router.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        router.ip?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-pace-purple/10 flex items-center justify-center p-2 border border-pace-purple/20">
                        <Network size={20} className="text-pace-purple" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-admin-value flex items-center gap-2">
                             Network Infrastructure Hub
                        </h1>
                        <p className="text-[10px] font-bold text-admin-dim mt-1 tracking-widest uppercase italic">Node Orchestration & API Synchronization</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-xs font-bold uppercase tracking-widest shadow-xl shadow-pace-purple/20 active:scale-95"
                >
                    <Plus size={14} /> Add Infrastructure
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search infrastructure nodes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                <th className="px-6 py-4">Node Identity</th>
                                <th className="px-6 py-4">Hardware & Site</th>
                                <th className="px-6 py-4 text-center">Concurrency</th>
                                <th className="px-6 py-4">API Topology</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4"><div className="h-4 bg-pace-bg-subtle rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredRouters.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center text-admin-dim uppercase text-[10px] font-bold tracking-widest italic">No infrastructure mapped</td>
                                </tr>
                            ) : (
                                filteredRouters.map((r) => (
                                    <tr key={r.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group cursor-default">
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-admin-value leading-tight transition-colors flex items-center gap-2">
                                                    {r.name}
                                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", r.status === 'online' ? "bg-pace-green" : "bg-red-500")} />
                                                </span>
                                                <span className="text-[10px] font-bold text-admin-dim font-mono mt-0.5 tracking-tight">{r.ip} <span className="opacity-50">:{r.apiPort}</span></span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                             <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-admin-value">
                                                    <Cpu size={11} className="text-pace-purple" /> {r.model || 'Generic MikroTik'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] text-admin-dim font-bold uppercase mt-0.5 tracking-tighter">
                                                    <MapPin size={10} /> {r.location || 'Local Site'}
                                                </div>
                                             </div>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[12px] font-bold text-admin-value tabular-nums">{r.users}</span>
                                                <span className="text-[8px] font-bold text-admin-dim uppercase tracking-tighter italic">Live PPPoE</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={r.status === 'online' ? 'success' : 'error'} className="border-none px-2 py-0.5 uppercase text-[9px]">
                                                    {r.status === 'online' ? 'Connected' : 'Offline'}
                                                </Badge>
                                                <span className="text-[10px] font-mono font-bold text-pace-purple px-1.5 py-0.5 bg-pace-purple/5 rounded">API:{r.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button 
                                                    onClick={() => handleOpenModal(r)}
                                                    className="p-1.5 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 rounded-lg transition-all"
                                                    title="Modify Node"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button 
                                                    onClick={() => handleReboot(r.name)}
                                                    className="p-1.5 text-admin-dim hover:text-amber-600 hover:bg-amber-500/10 rounded-lg transition-all"
                                                    title="Hard Reboot"
                                                >
                                                    <Power size={13} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(r.id, r.name)}
                                                    className="p-1.5 text-admin-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Decommission Node"
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

            {/* Advanced Router Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentRouter ? 'Modify Infrastructure Node' : 'Register Service Gateway'}
                description={currentRouter ? `Advanced parameters for ${currentRouter.name}` : 'Provision a new MikroTik gateway node with API credentials.'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSave} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-admin-dim uppercase tracking-widest pl-1">Network Identity</label>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-admin-value pl-1">Display Alias</label>
                                    <input 
                                        type="text" required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g. CORE-ROUTER-01"
                                        className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-admin-value pl-1">Host/IP</label>
                                        <input 
                                            type="text" required
                                            value={formData.ip}
                                            onChange={(e) => setFormData({...formData, ip: e.target.value})}
                                            placeholder="192.168.X.X"
                                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-admin-value pl-1">API Port</label>
                                        <input 
                                            type="text" required
                                            value={formData.apiPort}
                                            onChange={(e) => setFormData({...formData, apiPort: e.target.value})}
                                            placeholder="8728"
                                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-dim outline-none focus:border-pace-purple transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-admin-value pl-1">Hardware Model</label>
                                    <input 
                                        type="text"
                                        value={formData.model}
                                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                                        placeholder="e.g. CCR2004-16G-2S+"
                                        className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-dim outline-none focus:border-pace-purple transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-admin-dim uppercase tracking-widest pl-1">API Credentials</label>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-admin-value pl-1">Username</label>
                                    <input 
                                        type="text" required
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        placeholder="API Username"
                                        className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-admin-value pl-1">Password</label>
                                    <div className="relative">
                                        <input 
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            placeholder="Secure Password"
                                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-pace-purple outline-none focus:border-pace-purple transition-all"
                                        />
                                        <Key size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-admin-value pl-1">Physical Location</label>
                                    <input 
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        placeholder="e.g. Tower B Floor 4"
                                        className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-dim outline-none focus:border-pace-purple transition-all"
                                    />
                                </div>
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
                            {currentRouter ? 'Apply Synchronization' : 'Finalize Deployment'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function RoutersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse uppercase text-[10px] font-bold tracking-widest italic">Syncing Infrastructure...</div>}>
            <RoutersContent />
        </Suspense>
    )
}
