"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Search, Filter, Download, MoreHorizontal, UserPlus, ShieldCheck, Edit2, Trash2, Smartphone, Globe, Activity, CheckCircle2, X } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import Swal from 'sweetalert2'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'

function TableRowSkeleton({ cols, rows }) {
    return (
        <>
            {[...Array(rows)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                    {[...Array(cols)].map((_, j) => (
                        <td key={j} className="px-6 py-3">
                            <div className="h-2.5 bg-pace-bg-subtle rounded w-full" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    )
}

function CustomersContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [customers, setCustomers] = useState([])
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentCustomer, setCurrentCustomer] = useState(null)
    const [formData, setFormData] = useState({ name: '', phone: '', plan: '', price: '', username: '', password: '', status: 'enabled' })

    useEffect(() => {
        const timer = setTimeout(() => {
            setCustomers(mockDashboardData.subscribers)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleOpenModal = (c = null) => {
        if (c) {
            setCurrentCustomer(c)
            setFormData({ ...c })
        } else {
            setCurrentCustomer(null)
            setFormData({ name: '', phone: '', plan: '', price: '', username: '', password: '', status: 'enabled' })
        }
        setIsModalOpen(true)
    }

    const handleSave = (e) => {
        e.preventDefault()
        if (!formData.name || !formData.phone || !formData.username) {
            Swal.fire('Error', 'Please fill all required fields', 'error')
            return
        }

        if (currentCustomer) {
            setCustomers(prev => prev.map(c => c.id === currentCustomer.id ? { ...c, ...formData } : c))
            Swal.fire('Updated!', 'Subscriber profile has been synchronized.', 'success')
        } else {
            const newCust = { ...formData, id: Date.now(), nextPayment: 'Nov 12, 2023', lastActive: '2m ago' }
            setCustomers(prev => [newCust, ...prev])
            Swal.fire('Provisioned!', 'New subscriber is now active in PPPoE pool.', 'success')
        }
        setIsModalOpen(false)
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Revoke Access?',
            text: "This will terminate all active PPPoE sessions for this user.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E11D48',
            confirmButtonText: 'Yes, Revoke'
        }).then((result) => {
            if (result.isConfirmed) {
                setCustomers(prev => prev.filter(c => c.id !== id))
                Swal.fire('Revoked!', 'Subscriber access has been terminated.', 'success')
            }
        })
    }

    const handleToggleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled'
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
        Swal.fire({
            title: newStatus === 'enabled' ? 'Access Restored' : 'Access Suspended',
            text: `Subscriber is now ${newStatus}.`,
            icon: 'info',
            timer: 1500,
            showConfirmButton: false
        })
    }

    const filteredCustomers = customers.filter(c => 
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.username?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-4">
                <div>
                    <h1 className="text-lg font-bold text-admin-value flex items-center gap-3 tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-pace-purple/10 flex items-center justify-center">
                            <Users size={20} className="text-pace-purple" />
                        </div>
                        Subscribers Matrix
                    </h1>
                    <p className="text-[10px] font-bold text-admin-dim mt-1 tracking-widest uppercase italic">Provisioning and Real-time Policy Management</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-xs font-bold uppercase tracking-widest shadow-xl shadow-pace-purple/20 active:scale-95"
                >
                    <UserPlus size={14} /> New Subscriber
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search matrix..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-[11px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Ultra High Density Table */}
            <div className="bg-white dark:bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap text-[11px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle border-b border-pace-border font-bold text-admin-dim uppercase tracking-widest text-[8px]">
                                <th className="px-6 py-3">Identity</th>
                                <th className="px-6 py-3">PPPoE Logic</th>
                                <th className="px-6 py-3">Service Tier</th>
                                <th className="px-6 py-3">Renewal</th>
                                <th className="px-6 py-3 text-center">Connectivity</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={6} rows={12} />
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim uppercase text-[9px] font-bold tracking-widest italic">No matching records</td>
                                </tr>
                            ) : (
                                filteredCustomers.map((c) => (
                                    <tr key={c.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group cursor-default">
                                        <td className="px-6 py-2.5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-admin-value text-[11px] group-hover:text-pace-purple transition-colors">{c.name}</span>
                                                <span className="text-[9px] text-admin-dim font-bold lowercase italic tracking-tight">{c.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2.5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-mono font-bold text-pace-purple lowercase">{c.username}</span>
                                                <span className="text-[8px] text-gray-400 font-mono tracking-tighter">SECURED-MD5</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2.5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-admin-value text-[10px] uppercase tracking-tighter">{c.plan}</span>
                                                <span className="text-[9px] text-admin-dim font-black italic">KES {c.price.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2.5">
                                            <span className={cn(
                                                "font-black text-[9px] uppercase tracking-tighter",
                                                new Date(c.nextPayment) < new Date() ? "text-red-500" : "text-admin-dim"
                                            )}>
                                                {c.nextPayment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2.5 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(c.id, c.status)}
                                                className={cn(
                                                    "px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition-all active:scale-95",
                                                    c.status === 'enabled' 
                                                        ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                                                        : "bg-red-500/10 text-red-600 border border-red-500/20"
                                                )}
                                            >
                                                {c.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-2.5 text-right">
                                            <div className="flex justify-end items-center gap-1.5">
                                                <button 
                                                    onClick={() => handleOpenModal(c)}
                                                    className="p-1 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 rounded transition-all"
                                                    title="Modify Profile"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(c.id)}
                                                    className="p-1 text-admin-dim hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                                    title="Revoke Node"
                                                >
                                                    <Trash2 size={12} />
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

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentCustomer ? 'Update Subscriber' : 'Provision Access'}
                description={currentCustomer ? `Synchronizing credentials for ${currentCustomer.name}` : 'Construct a new pppoe identity for network access.'}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Legal Identity</label>
                        <input 
                            type="text" required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Full Subscriber Name"
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Mobile Ledger</label>
                            <input 
                                type="text" required
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="07XXXXXXXX"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Service Plan</label>
                            <select 
                                value={formData.plan}
                                onChange={(e) => setFormData({...formData, plan: e.target.value, price: e.target.options[e.target.selectedIndex].dataset.price})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                            >
                                <option value="">Select Plan</option>
                                <option value="Bronze 5Mbps" data-price="1500">Bronze 5Mbps</option>
                                <option value="Silver 10Mbps" data-price="2500">Silver 10Mbps</option>
                                <option value="Gold 20Mbps" data-price="4500">Gold 20Mbps</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-pace-border pt-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-pace-purple uppercase tracking-widest pl-1">PPPoE User</label>
                            <input 
                                type="text" required
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                placeholder="secret-user"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-pace-purple uppercase tracking-widest pl-1">PPPoE Secret</label>
                            <input 
                                type="password" required
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                            />
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
                            {currentCustomer ? 'Modify Identity' : 'Authorize Node'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function CustomersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse uppercase text-[10px] font-bold tracking-widest italic">Syncing Identity Pool...</div>}>
            <CustomersContent />
        </Suspense>
    )
}
