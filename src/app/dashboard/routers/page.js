"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Search, Router, Activity, RefreshCw, Power, Settings, ShieldCheck, Network, MoreVertical, List } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, CardSkeleton, TableRowSkeleton } from '@/components/Skeleton'
import { mockRouters } from '@/services/mockData'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'

function RoutersContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [routers, setRouters] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            setRouters(mockRouters)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleReboot = (name) => {
        toast.promise(new Promise(res => setTimeout(res, 2000)), {
            loading: `Rebooting ${name}...`,
            success: 'Reboot signal sent successfully.',
            error: 'Failed to communicate with node.',
        });
    }

    const filteredRouters = routers.filter(r =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.ip?.includes(search)
    )

    if (isLoading) return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-10 text-center">
                    <TableRowSkeleton cols={6} rows={8} />
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree text-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Routers</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Manage and monitor your network infrastructure</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-sm active:scale-95">
                    <Plus size={16} />
                    <span>Add Router</span>
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search routers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* List View Only */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-3">Node Identity</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3">Utilization</th>
                                <th className="px-6 py-3 text-center">Sessions</th>
                                <th className="px-6 py-3">Uptime</th>
                                <th className="px-6 py-3 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredRouters.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim text-sm font-medium">No routers found</td>
                                </tr>
                            ) : (
                                filteredRouters.map((r) => (
                                    <tr key={r.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                        <td className="px-6 py-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-pace-bg-subtle border border-pace-border flex items-center justify-center text-admin-dim group-hover:text-pace-purple transition-colors">
                                                    <Router size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-admin-value">{r.name}</p>
                                                    <p className="text-[10px] text-admin-dim font-mono">{r.ip}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 text-center">
                                            <Badge variant={r.status === 'online' ? 'success' : 'error'} className="text-[10px] font-medium border-none">
                                                {r.status === 'online' ? 'Online' : 'Offline'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex items-center gap-3 w-32">
                                                <div className="flex-1 h-1 bg-pace-bg-subtle rounded-full overflow-hidden">
                                                    <div className="h-full bg-pace-purple w-[24%]" />
                                                </div>
                                                <span className="text-[10px] font-semibold text-admin-value tabular-nums">24%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 text-center text-xs font-semibold text-admin-value">{r.users}</td>
                                        <td className="px-6 py-2 text-xs font-semibold text-pace-purple">{r.uptime}</td>
                                        <td className="px-6 py-2 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button 
                                                    onClick={() => handleReboot(r.name)}
                                                    className="p-1 text-admin-dim hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                    title="Reboot"
                                                >
                                                    <Power size={14} />
                                                </button>
                                                <button className="p-1 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-lg transition-all">
                                                    <Settings size={14} />
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
        </div>
    )
}

export default function RoutersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Syncing infrastructure...</div>}>
            <RoutersContent />
        </Suspense>
    )
}
