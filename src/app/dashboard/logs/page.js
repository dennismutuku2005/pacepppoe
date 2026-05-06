"use client";

import React, { useState, useEffect, Suspense } from 'react'
import { Activity, Shield, Terminal, Clock, Search, Filter, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { TableRowSkeleton } from '@/components/Skeleton'

function LogsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [logs, setLogs] = useState([])
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        const timer = setTimeout(() => {
            const mockLogs = [
                { id: 1, event: "Admin Login", user: "admin", ip: "192.168.1.50", level: "info", timestamp: "2026-05-06 10:45:22", detail: "Successful session initialization via Web Interface" },
                { id: 2, event: "PPPoE Authentication", user: "john_pppoe", ip: "10.0.10.5", level: "info", timestamp: "2026-05-06 10:42:01", detail: "Session started on Main Tower A" },
                { id: 3, event: "M-Pesa API Webhook", user: "System", ip: "196.201.214.X", level: "success", timestamp: "2026-05-06 10:30:15", detail: "Payment received: RK4S2L9X (KES 1500)" },
                { id: 4, event: "Router Disconnected", user: "Residential Node 1", ip: "10.0.5.1", level: "error", timestamp: "2026-05-06 10:15:00", detail: "Heartbeat failed for more than 300 seconds" },
                { id: 5, event: "Package Modified", user: "admin", ip: "192.168.1.50", level: "warning", timestamp: "2026-05-06 09:20:44", detail: "Changed Silver Plan price from 2200 to 2500" },
                { id: 6, event: "SMS Broadcast", user: "System", ip: "Localhost", level: "info", timestamp: "2026-05-06 08:00:10", detail: "Sent 42 renewal reminders via Advanta" },
                { id: 7, event: "Database Backup", user: "System", ip: "Cron", level: "success", timestamp: "2026-05-06 00:00:01", detail: "Encrypted snapshot generated successfully" },
            ];
            setLogs(mockLogs)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-pace-purple/10 flex items-center justify-center">
                            <Terminal size={18} className="text-pace-purple" />
                        </div>
                        System Audit Logs
                    </h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Infrastructure and administrative orchestration history</p>
                </div>
                <div className="flex items-center gap-2">
                    {['all', 'info', 'success', 'warning', 'error'].map((l) => (
                        <button
                            key={l}
                            onClick={() => setFilter(l)}
                            className={cn(
                                "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                                filter === l 
                                    ? "bg-pace-purple text-white border-pace-purple shadow-sm"
                                    : "bg-pace-bg-subtle text-admin-dim border-pace-border hover:border-pace-purple/30"
                            )}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Event Identity</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Actor</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Details</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-right">Origin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={5} rows={10} />
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                    <td className="px-6 py-2">
                                        <span className="text-[11px] font-medium text-admin-dim tabular-nums">{log.timestamp}</span>
                                    </td>
                                    <td className="px-6 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                log.level === 'success' ? "bg-green-500" :
                                                log.level === 'error' ? "bg-red-500" :
                                                log.level === 'warning' ? "bg-amber-500" : "bg-blue-500"
                                            )} />
                                            <span className="font-semibold text-admin-value group-hover:text-pace-purple transition-colors text-xs">{log.event}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2">
                                        <Badge variant="secondary" className="text-[10px] font-medium border-none">
                                            {log.user}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-2">
                                        <span className="text-[11px] font-medium text-admin-dim">"{log.detail}"</span>
                                    </td>
                                    <td className="px-6 py-2 text-right">
                                        <span className="font-mono text-[10px] font-medium text-admin-dim">{log.ip}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function LogsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Syncing audit logs...</div>}>
            <LogsContent />
        </Suspense>
    )
}
