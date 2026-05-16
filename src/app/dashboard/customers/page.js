"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Search, Filter, UserPlus, Edit2, Trash2, Smartphone, Network, ShieldCheck, Activity, X, Database, MapPin, LifeBuoy } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, TableRowSkeleton } from '@/components/Skeleton'
import { mockCustomers, mockRouters, mockPackages } from '@/services/mockData'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/MapView'), { 
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-pace-bg-subtle animate-pulse rounded-xl border border-pace-border flex items-center justify-center text-[10px] font-bold uppercase text-admin-dim tracking-widest">Loading Mapping...</div>
})

function CustomersContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [customers, setCustomers] = useState([])
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentCustomer, setCurrentCustomer] = useState(null)
    const [accountType, setAccountType] = useState('phone')
    const [formData, setFormData] = useState({ 
        name: '', phone: '', plan: '', price: '', 
        username: '', password: '', status: 'enabled',
        router: '', accountNumber: ''
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setCustomers(mockCustomers)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleOpenModal = (c = null) => {
        if (c) {
            setCurrentCustomer(c)
            setFormData({ ...c })
            setAccountType(c.accountNumber === c.phone ? 'phone' : 'generate')
        } else {
            setCurrentCustomer(null)
            setFormData({ 
                name: '', phone: '', plan: '', price: '', 
                username: '', password: '', status: 'enabled',
                router: '', accountNumber: ''
            })
            setAccountType('phone')
        }
        setIsModalOpen(true)
    }

    const handleSave = (e) => {
        e.preventDefault()
        if (!formData.name || !formData.phone || !formData.username || !formData.router) {
            toast.error('Missing Required Parameters', {
                description: 'Please select a router and fill all identity fields.'
            })
            return
        }

        if (currentCustomer) {
            setCustomers(prev => prev.map(c => c.id === currentCustomer.id ? { ...c, ...formData } : c))
            toast.success('Identity Synchronized', {
                description: `PPPoE profile for ${formData.username} has been updated.`
            })
        } else {
            const newCust = { ...formData, id: Date.now() }
            setCustomers(prev => [newCust, ...prev])
            toast.success('Node Provisioned', {
                description: `New PPPoE identity authorized on ${formData.router}.`
            })
        }
        setIsModalOpen(false)
    }

    const handleDelete = (id, name) => {
        setCustomers(prev => prev.filter(c => c.id !== id))
        toast.error('Identity Revoked', {
            description: `PPPoE access for ${name} has been terminated.`
        })
    }

    const handleToggleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled'
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
        toast.info(newStatus === 'enabled' ? 'Access Restored' : 'Access Suspended', {
            description: `Subscriber state set to ${newStatus}.`
        })
    }

    const filteredCustomers = customers.filter(c => 
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.username?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Subscriber List</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">PPPoE node authentication and session control</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-sm active:scale-95"
                >
                    <UserPlus size={16} />
                    <span>Provision Node</span>
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search identity pool..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Subscriber / Account</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">PPPoE Credentials</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">NAS / Router</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Service Tier</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={6} rows={10} />
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim text-sm font-medium">No records found in identity pool</td>
                                </tr>
                            ) : (
                                filteredCustomers.map((c) => (
                                <tr key={c.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                    <td className="px-6 py-2">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-admin-value text-xs group-hover:text-pace-purple transition-colors">{c.name}</span>
                                            <span className="text-[10px] text-admin-dim font-medium uppercase tracking-tighter">Acc: {c.accountNumber}</span>
                                        </div>
                                    </td>
                                        <td className="px-6 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-semibold text-pace-purple font-mono">{c.username}</span>
                                                <span className="text-[9px] text-gray-400 font-medium">Secured CHAP</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2">
                                            <span className="text-xs font-semibold text-admin-value">{c.router || 'Unassigned'}</span>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-admin-value text-[11px]">{c.plan}</span>
                                                <span className="text-[10px] text-admin-dim font-medium tabular-nums">KES {Number(c.price).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(c.id, c.status)}
                                                className="transition-transform active:scale-95"
                                            >
                                                <Badge className={cn(
                                                    "border-none px-2 py-0.5 text-[8px] font-black tracking-widest uppercase min-w-[58px] block text-center transition-all",
                                                    c.status === 'enabled' 
                                                        ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                                                        : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                                                )}>
                                                    {c.status}
                                                </Badge>
                                            </button>
                                        </td>
                                        <td className="px-6 py-2 text-right">
                                            <div className="flex justify-end items-center gap-1">
                                                <button 
                                                    onClick={() => handleOpenModal(c)}
                                                    className="p-1 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-lg transition-all"
                                                    title="View Location & Edit"
                                                >
                                                    <MapPin size={13} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenModal(c)}
                                                    className="p-1 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button 
                                                    className="p-1 text-admin-dim hover:text-green-500 hover:bg-green-500/5 rounded-lg transition-all"
                                                    title="Quick SMS"
                                                >
                                                    <Smartphone size={13} />
                                                </button>
                                                <button 
                                                    className="p-1 text-admin-dim hover:text-orange-500 hover:bg-orange-500/5 rounded-lg transition-all"
                                                    title="Log Incident"
                                                    onClick={() => router.push(`/dashboard/tickets?customer=${c.name}`)}
                                                >
                                                    <LifeBuoy size={13} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(c.id, c.name)}
                                                    className="p-1 text-admin-dim hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
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

            {/* Provisioning Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentCustomer ? 'Update Identity' : 'Authorize PPPoE Node'}
                description={currentCustomer ? `Synchronizing credentials for ${currentCustomer.username}` : 'Provisioning a new encrypted tunnel session.'}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSave} className="p-6 space-y-5 font-figtree">
                    {currentCustomer && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Last Reported Location</label>
                            <MapView lat={currentCustomer.lat || -1.286389} lng={currentCustomer.lng || 36.817223} />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Subscriber Identity</label>
                        <input 
                            type="text" required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Full Subscriber Name"
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Mobile Contact</label>
                            <input 
                                type="text" required
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="07XXXXXXXX"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Target NAS</label>
                            <select 
                                required
                                value={formData.router}
                                onChange={(e) => setFormData({...formData, router: e.target.value})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                            >
                                <option value="">Select Router</option>
                                {mockRouters.map(r => (
                                    <option key={r.id} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Billing Account Number</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setAccountType('phone')
                                    setFormData({...formData, accountNumber: formData.phone})
                                }}
                                className={cn(
                                    "py-2 px-3 rounded-xl border text-[11px] font-bold transition-all",
                                    accountType === 'phone' ? "bg-pace-purple text-white border-pace-purple" : "bg-pace-bg-subtle text-admin-dim border-pace-border hover:bg-pace-purple/5"
                                )}
                            >
                                Use Phone Number
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setAccountType('generate')
                                    const rand = Math.floor(1000 + Math.random() * 9000).toString()
                                    setFormData({...formData, accountNumber: rand})
                                }}
                                className={cn(
                                    "py-2 px-3 rounded-xl border text-[11px] font-bold transition-all",
                                    accountType === 'generate' ? "bg-pace-purple text-white border-pace-purple" : "bg-pace-bg-subtle text-admin-dim border-pace-border hover:bg-pace-purple/5"
                                )}
                            >
                                Generate 4-Digit
                            </button>
                        </div>
                        {formData.accountNumber && (
                            <p className="text-[10px] font-bold text-pace-purple mt-1 pl-1">Assigned: {formData.accountNumber}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Service QoS Plan</label>
                        <select 
                            required
                            value={formData.plan}
                            onChange={(e) => {
                                const pkg = mockPackages.find(p => p.name === e.target.value || p.limit === e.target.value);
                                setFormData({...formData, plan: e.target.value, price: pkg?.price || 0});
                            }}
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                        >
                            <option value="">Select QoS Profile</option>
                            {mockPackages.map(p => (
                                <option key={p.id} value={p.limit}>{p.name} ({p.limit}) - KES {p.price}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-pace-border pt-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-pace-purple uppercase tracking-wider pl-1">PPPoE User</label>
                            <input 
                                type="text" required
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                placeholder="pppoe_user"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-pace-purple uppercase tracking-wider pl-1">PPPoE Secret</label>
                            <input 
                                type="password" required
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                            />
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
                            {currentCustomer ? 'Save Changes' : 'Authorize Node'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function CustomersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Mapping subscriber matrix...</div>}>
            <CustomersContent />
        </Suspense>
    )
}
