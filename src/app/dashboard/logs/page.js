"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { FileText, Search, Clock, Shield, AlertCircle, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { TableRowSkeleton } from '@/components/Skeleton'

function LogsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')

    const mockLogs = [
        { id: 1, event: 'Policy Updated', user: 'admin', ip: '192.168.1.10', date: '2026-05-06 14:22:11', status: 'Success' },
        { id: 2, event: 'Subscriber Provisioned', user: 'support_staff', ip: '10.0.0.5', date: '2026-05-06 13:45:02', status: 'Success' },
        { id: 3, event: 'Auth Failure', user: 'unknown', ip: '172.16.5.22', date: '2026-05-06 12:10:55', status: 'Error' },
        { id: 4, event: 'MikroTik Sync', user: 'system', ip: '127.0.0.1', date: '2026-05-06 11:30:00', status: 'Success' },
        { id: 5, event: 'M-Pesa STK Push', user: 'mpesa_service', ip: '10.0.0.1', date: '2026-05-06 10:15:33', status: 'Success' },
    ]

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    const filteredLogs = mockLogs.filter(log => 
        log.event.toLowerCase().includes(search.toLowerCase()) ||
        log.user.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 text-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">System Audit Logs</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Real-time trail of administrative actions and system events</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search event or identity..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Compact Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-3">Event Signature</th>
                                <th className="px-6 py-3">Actor Identity</th>
                                <th className="px-6 py-3">IPv4 Address</th>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={5} rows={10} />
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center text-admin-dim text-xs font-medium">No system events logged</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                        <td className="px-6 py-2 text-xs font-semibold text-admin-value">{log.event}</td>
                                        <td className="px-6 py-2 text-xs font-medium text-pace-purple">@{log.user}</td>
                                        <td className="px-6 py-2 text-[10px] font-mono text-admin-dim">{log.ip}</td>
                                        <td className="px-6 py-2 text-[11px] font-medium text-admin-value tabular-nums">{log.date}</td>
                                        <td className="px-6 py-2 text-center">
                                            <Badge variant={log.status === 'Success' ? 'success' : 'error'} className="text-[10px] font-medium border-none">
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
    )
}

export default function LogsPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-admin-dim text-sm font-medium animate-pulse">Syncing system logs...</div>}>
            <LogsContent />
        </Suspense>
    )
}
