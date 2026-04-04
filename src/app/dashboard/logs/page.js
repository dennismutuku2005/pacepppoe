"use client"

import React, { useState, useEffect } from 'react'
import { Activity, Clock, LogIn, LogOut, Key, Search, ChevronRight, AlertCircle, CheckCircle2, Info, ChevronDown, User, Server, Terminal, RefreshCw, ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, TableRowSkeleton } from '@/components/Skeleton'
import { cn } from '@/lib/utils'
import { logsService } from '@/services/logs'

export default function SystemLogsPage() {
    const [logs, setLogs] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)

    const fetchLogs = async (pageNum = 1, search = '') => {
        setIsRefreshing(true)
        try {
            const res = await logsService.getLogs({ page: pageNum, limit: 20, search: search })
            if (res?.status === 'success') {
                setLogs(res.data || [])
                setTotal(res.pagination?.total || 0)
                setPage(pageNum)
            }
        } catch (e) {
            console.error("Failed to fetch logs:", e)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs(1, searchTerm)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const filteredLogs = logs.filter(log => {
        const matchesStatus = statusFilter === 'all' || log.status === statusFilter
        return matchesStatus
    })

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-bold text-admin-value leading-tight">System Logs</h1>
                    <p className="text-sm text-admin-dim mt-1 uppercase tracking-widest text-[10px] font-bold">Activity Tracking & Audits</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={12} />
                        <input
                            type="text"
                            autoComplete="off"
                            placeholder="Search logs..."
                            className="w-full pl-9 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-[11px] font-bold text-admin-value focus:outline-none focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 bg-card-bg border border-pace-border rounded-xl text-[11px] font-bold text-admin-dim focus:outline-none cursor-pointer uppercase tracking-widest text-admin-value"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">ALL ENTRIES</option>
                        <option value="success">SUCCESS ONLY</option>
                        <option value="failed">FAILED ONLY</option>
                    </select>
                    <button
                        onClick={fetchLogs}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-6 py-2 bg-pace-purple text-white rounded-xl hover:bg-[#3d1a75] transition-all text-[11px] font-medium uppercase tracking-widest shadow-lg shadow-pace-purple/10 disabled:opacity-50"
                    >
                        <RefreshCw size={12} className={cn(isRefreshing && "animate-spin")} />
                        {isRefreshing ? "Syncing" : "Refresh"}
                    </button>
                </div>
            </div>

            {/* Logs Main Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-[11px]">
                        <thead className="bg-pace-bg-subtle border-b border-pace-border font-bold text-admin-dim uppercase tracking-widest text-[9px]">
                            <tr>
                                <th className="py-4 px-6">User / Identity</th>
                                <th className="py-4 px-6">System Action</th>
                                <th className="py-4 px-6">Audit Description</th>
                                <th className="py-4 px-6">Network IP</th>
                                <th className="py-4 px-6">Timeline</th>
                                <th className="py-4 px-6 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={6} rows={8} />
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 bg-pace-bg-subtle rounded-full flex items-center justify-center text-admin-dim">
                                                <Activity size={24} />
                                            </div>
                                            <p className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">No activity matches your filter</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-pace-bg-subtle transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-pace-bg-subtle flex items-center justify-center text-[10px] font-bold text-admin-dim border border-pace-border group-hover:text-pace-purple transition-all">
                                                    {log.user.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-admin-value uppercase group-hover:text-pace-purple transition-colors">{log.user}</p>
                                                    <p className="text-[8px] text-gray-400 font-normal uppercase tracking-tighter opacity-80">REF: {log.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant="outline" className="text-[8px] font-bold uppercase py-0.5 px-2 bg-pace-bg-subtle border-pace-border text-admin-dim">
                                                {log.action}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-[10px] text-admin-dim max-w-xs font-medium leading-relaxed">
                                            {log.description}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-[10px] font-mono font-medium text-gray-400 opacity-80">
                                                {log.ip || '0.0.0.0'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-[10px] font-medium text-gray-400 uppercase">
                                            <div className="flex items-center gap-1.5 opacity-80">
                                                <Clock size={10} className="text-admin-dim" />
                                                {log.time}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    log.status === 'failed' ? "bg-red-400" : "bg-green-400"
                                                )} />
                                                <span className={cn(
                                                    "text-[9px] font-medium uppercase tracking-widest",
                                                    log.status === 'failed' ? "text-red-400" : "text-green-500"
                                                )}>{log.status}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section */}
                <div className="bg-pace-bg-subtle border-t border-pace-border p-4 flex items-center justify-between">
                    <p className="text-[9px] font-bold text-admin-dim uppercase tracking-widest">
                        Total Trace: {filteredLogs.length} Records Visualized
                    </p>
                    <div className="flex gap-1.5">
                        <button className="p-1.5 border border-pace-border rounded-lg text-admin-dim hover:text-admin-value hover:bg-pace-bg-subtle disabled:opacity-30 transition-all"><ChevronLeft size={14} /></button>
                        <button className="p-1.5 border border-pace-border rounded-lg text-admin-dim hover:text-admin-value hover:bg-pace-bg-subtle disabled:opacity-30 transition-all"><ChevronRight size={14} /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}
