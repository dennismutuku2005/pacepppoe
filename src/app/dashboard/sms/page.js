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
            setSmsLogs(mockDashboardData.smsLogs)
            setProviders(mockDashboardData.smsProviders)
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
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0 font-figtree uppercase">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-lg font-bold text-admin-value flex items-center gap-3 tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-pace-purple/10 flex items-center justify-center">
                            <Smartphone size={20} className="text-pace-purple" />
                        </div>
                        SMS Communication Hub
                    </h1>
                    <p className="text-[10px] font-bold text-admin-dim mt-1 tracking-widest italic">Automated Notifications & Gateway Management</p>
                </div>
            </div>

            {/* Provider Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {providers.map((provider) => (
                    <div key={provider.id} className="p-5 border border-pace-border rounded-2xl bg-card-bg hover:border-pace-purple/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Database size={48} className="text-pace-purple" />
                        </div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white border border-pace-border flex items-center justify-center text-admin-dim group-hover:text-pace-purple transition-all group-hover:rotate-6">
                                <Activity size={18} />
                            </div>
                            <Badge className={cn(
                                "border-none px-2 py-0.5 text-[8px] font-black tracking-widest",
                                provider.status === 'Connected' ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                            )}>
                                {provider.status}
                            </Badge>
                        </div>
                        <div className="relative z-10">
                            <h5 className="text-[14px] font-black text-admin-value">{provider.name}</h5>
                            <p className="text-[10px] font-bold text-admin-dim mt-0.5 tracking-widest">CREDITS: <span className="text-pace-purple">{provider.balance}</span></p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-pace-border relative z-10">
                            <button 
                                onClick={() => handleConfigProvider(provider)}
                                className="w-full py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-[9px] font-black tracking-widest hover:bg-pace-purple hover:text-white hover:border-pace-purple transition-all flex items-center justify-center gap-2"
                            >
                                <Settings size={12} /> Configure Gateway
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Logs Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-black text-admin-dim tracking-[0.2em] italic">Recent Dispatch Logs</h2>
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={12} />
                        <input
                            type="text"
                            placeholder="Filter by recipient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-[10px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all uppercase"
                        />
                    </div>
                </div>

                <div className="overflow-hidden bg-white dark:bg-card-bg border border-pace-border rounded-2xl shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap text-[11px]">
                            <thead>
                                <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim tracking-widest text-[9px]">
                                    <th className="px-6 py-4">Recipient</th>
                                    <th className="px-6 py-4">Message Content</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Gateway</th>
                                    <th className="px-6 py-4">Delivery</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pace-border">
                                {isLoading ? (
                                    <TableRowSkeleton cols={5} rows={8} />
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center text-admin-dim text-[10px] font-bold tracking-widest italic uppercase">Zero dispatch records</td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group cursor-default">
                                            <td className="px-6 py-3">
                                                <span className="text-[11px] font-black text-admin-value">{log.recipient}</span>
                                            </td>
                                            <td className="px-6 py-3 max-w-md truncate">
                                                <span className="text-[10px] font-medium text-admin-dim italic lowercase">"{log.message}"</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={11} className="text-admin-dim" />
                                                    <span className="text-[10px] font-bold text-admin-value">{log.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-[9px] font-black text-pace-purple tracking-widest">{log.provider}</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge className={cn(
                                                    "border-none px-2 py-0.5 text-[8px] font-black tracking-widest",
                                                    log.status === 'Delivered' ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                                                )}>
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
                <form onSubmit={handleSaveConfig} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">API Key / Token</label>
                        <input 
                            type="text" required
                            value={formData.api_key}
                            onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                            placeholder="Enter Provider API Key"
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Status Policy</label>
                        <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                        >
                            <option>Connected</option>
                            <option>Disconnected</option>
                        </select>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsConfigOpen(false)} className="flex-1 px-5 py-2.5 border border-pace-border rounded-xl text-xs font-bold text-admin-dim tracking-widest hover:bg-pace-bg-subtle transition-all">Abort</button>
                        <button type="submit" className="flex-3 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-bold tracking-widest hover:opacity-90 shadow-xl shadow-pace-purple/20 transition-all active:scale-95">Update Gateway</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function SMSPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse uppercase text-[10px] font-bold tracking-widest italic">Syncing Gateways...</div>}>
            <SMSContent />
        </Suspense>
    )
}
