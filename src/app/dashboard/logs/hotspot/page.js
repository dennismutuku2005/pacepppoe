"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Smartphone, Search, RefreshCw, AlertCircle, Wifi, Database, CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { TableRowSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import { cn } from '@/lib/utils'

function HotspotLogsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [logs, setLogs] = useState([])

    useEffect(() => {
        const timer = setTimeout(() => {
            setLogs(mockDashboardData.hotspotLogs || [])
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const filteredLogs = logs.filter(log => 
        log.entry_id.toLowerCase().includes(search.toLowerCase()) ||
        log.mac.toLowerCase().includes(search.toLowerCase())
    )

    const StatusIcon = ({ condition }) => (
        condition === 'Yes' ? (
            <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px]">
                <CheckCircle2 size={12} /> YES
            </div>
        ) : (
            <div className="flex items-center gap-1.5 text-red-500 font-bold text-[10px]">
                <XCircle size={12} /> NO
            </div>
        )
    )

    if (isLoading) {
        return <TablePageSkeleton />
    }

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 text-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Hotspot Operations Logs</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Transaction lifecycle tracking and authentication diagnostics</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl flex flex-col items-end">
                        <span className="text-lg font-bold text-amber-600 tabular-nums">Failed Debugging</span>
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Last 3 Trans Checked</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search Entry ID or MAC..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* High-Density Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-3">Entry ID</th>
                                <th className="px-6 py-3 text-center">STK Sent</th>
                                <th className="px-6 py-3 text-center">Callback Rx</th>
                                <th className="px-6 py-3 text-center">NAS Connect</th>
                                <th className="px-6 py-3">Subscriber MAC</th>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">Diagnostic Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center text-admin-dim text-xs font-medium">No hotspot activity logged</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                        <td className="px-6 py-2">
                                            <span className="text-xs font-bold text-admin-value group-hover:text-pace-purple transition-colors">{log.entry_id}</span>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex justify-center">
                                                <StatusIcon condition={log.stk_sent} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex justify-center">
                                                <StatusIcon condition={log.callback} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex justify-center">
                                                <StatusIcon condition={log.connected} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-2">
                                            <span className="text-[10px] font-mono text-admin-dim">{log.mac}</span>
                                        </td>
                                        <td className="px-6 py-2">
                                            <span className="text-[11px] font-medium text-admin-value tabular-nums">{log.timestamp}</span>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex items-center gap-2">
                                                {log.reason !== '-' && <AlertCircle size={12} className="text-amber-500" />}
                                                <span className={cn(
                                                    "text-[10px] font-semibold",
                                                    log.reason === '-' ? "text-admin-dim" : "text-amber-600"
                                                )}>{log.reason}</span>
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

export default function HotspotLogsPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-admin-dim text-sm font-medium animate-pulse">Syncing hotspot diagnostics...</div>}>
            <HotspotLogsContent />
        </Suspense>
    )
}
