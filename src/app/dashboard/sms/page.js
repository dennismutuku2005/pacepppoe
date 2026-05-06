"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Smartphone, Search, Filter, Send, Settings, CheckCircle2, XCircle, Clock, Database, ShieldCheck, Activity } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { TableRowSkeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'

function SMSContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [smsLogs, setSmsLogs] = useState([])
    const [providers, setProviders] = useState([])
    const [search, setSearch] = useState('')
    const [isConfigOpen, setIsConfigOpen] = useState(false)
    const [currentProvider, setCurrentProvider] = useState(null)
    const [formData, setFormData] = useState({ name: '', api_key: '', balance: '', status: 'Connected' })

    useEffect(() => {
        const timer = setTimeout(() => {
            setSmsLogs(mockDashboardData.smsLogs || [])
            setProviders(mockDashboardData.smsProviders || [])
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleConfigProvider = (p) => {
        setCurrentProvider(p)
        setFormData({ ...p })
        setIsConfigOpen(true)
    }

    const handleSaveConfig = (e) => {
        e.preventDefault()
        setProviders(prev => prev.map(p => p.id === currentProvider.id ? { ...p, ...formData } : p))
        toast.success('Gateway Synchronized', {
            description: `Configuration for ${formData.name} has been updated.`
        })
        setIsConfigOpen(false)
    }

    const filteredLogs = smsLogs.filter(log => 
        log.recipient?.includes(search) || 
        log.message?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree text-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">SMS Center</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Manage automated notifications and carrier gateways</p>
                </div>
            </div>

            {/* Provider Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                    [...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
                ) : providers.map((provider) => (
                    <div key={provider.id} className="p-5 border border-pace-border rounded-xl bg-card-bg hover:border-pace-purple/20 transition-all group shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-9 h-9 rounded-xl bg-pace-bg-subtle border border-pace-border flex items-center justify-center text-admin-dim group-hover:text-pace-purple transition-all">
                                <Activity size={18} />
                            </div>
                            <Badge variant={provider.status === 'Connected' ? 'success' : 'secondary'} className="text-[10px] font-medium border-none">
                                {provider.status}
                            </Badge>
                        </div>
                        <div>
                            <h5 className="text-sm font-semibold text-admin-value">{provider.name}</h5>
                            <p className="text-[11px] font-medium text-admin-dim mt-0.5">Credits: <span className="text-pace-purple font-semibold">{provider.balance}</span></p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-pace-border">
                            <button 
                                onClick={() => handleConfigProvider(provider)}
                                className="w-full py-2 bg-pace-bg-subtle border border-pace-border rounded-lg text-[11px] font-semibold text-admin-dim hover:bg-pace-purple/5 hover:text-pace-purple hover:border-pace-purple/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Settings size={14} /> Configure Gateway
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Logs Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-admin-dim uppercase tracking-wider">Dispatch History</h2>
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Filter by recipient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                        />
                    </div>
                </div>

                <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                                    <th className="px-6 py-3">Recipient</th>
                                    <th className="px-6 py-3">Message Content</th>
                                    <th className="px-6 py-3">Timestamp</th>
                                    <th className="px-6 py-3">Gateway</th>
                                    <th className="px-6 py-3 text-center">Delivery</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pace-border">
                                {isLoading ? (
                                    <TableRowSkeleton cols={5} rows={10} />
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center text-admin-dim text-xs font-medium italic">No dispatch records found</td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                            <td className="px-6 py-2">
                                                <span className="text-xs font-semibold text-admin-value">{log.recipient}</span>
                                            </td>
                                            <td className="px-6 py-2 max-w-md truncate">
                                                <span className="text-[11px] font-medium text-admin-dim">"{log.message}"</span>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} className="text-admin-dim" />
                                                    <span className="text-[11px] font-medium text-admin-value tabular-nums">{log.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <span className="text-[10px] font-bold text-pace-purple uppercase tracking-wider">{log.provider}</span>
                                            </td>
                                            <td className="px-6 py-2 text-center">
                                                <Badge variant={log.status === 'Delivered' ? 'success' : 'secondary'} className="text-[10px] font-medium border-none">
                                                    {log.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Config Modal */}
            <Modal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                title="Gateway Configuration"
                description={`Synchronizing API topology for ${currentProvider?.name}`}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSaveConfig} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">API Key / Token</label>
                        <input 
                            type="text" required
                            value={formData.api_key}
                            onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                            placeholder="Enter Provider API Key"
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-semibold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Status Policy</label>
                        <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                        >
                            <option>Connected</option>
                            <option>Disconnected</option>
                        </select>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsConfigOpen(false)} className="flex-1 px-5 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all">Cancel</button>
                        <button type="submit" className="flex-[2] px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-all active:scale-95">Update Gateway</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function SMSPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Syncing SMS Center...</div>}>
            <SMSContent />
        </Suspense>
    )
}
