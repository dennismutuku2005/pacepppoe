"use client"

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { 
    FileText, Search, RefreshCw, Eye, ChevronLeft, ChevronRight, 
    Shield, Activity, Clock, Terminal, Globe, User, Filter, AlertCircle, CheckCircle2
} from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { logService } from '@/services/isp/logs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function LogsContent() {
    const [logs, setLogs] = useState([])
    const [totalLogs, setTotalLogs] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedActionFilter, setSelectedActionFilter] = useState('ALL')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(25)

    // Log detail modal
    const [selectedLog, setSelectedLog] = useState(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    const fetchLogs = async () => {
        setIsLoading(true)
        try {
            const offset = (currentPage - 1) * pageSize
            const res = await logService.getLogs(pageSize, offset)
            if (res && res.status === 'success') {
                setLogs(res.data || [])
                setTotalLogs(res.total || 0)
            } else {
                toast.error(res?.message || 'Failed to retrieve activity logs')
            }
        } catch (err) {
            console.error("Error fetching logs:", err)
            toast.error('Network error fetching activity logs')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [currentPage, pageSize])

    const handleReload = () => {
        fetchLogs()
    }

    // Extract unique actions for quick filtering
    const uniqueActions = useMemo(() => {
        const set = new Set()
        logs.forEach(l => { if (l.action) set.add(l.action) })
        return ['ALL', ...Array.from(set)]
    }, [logs])

    // Filter logs by search query and action filter
    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const desc = log.description || ''
            const action = log.action || ''
            const name = log.actor_name || ''
            const role = log.actor_role || ''
            const ip = log.ip_address || ''
            const id = log.id ? log.id.toString() : ''

            const matchesSearch = 
                desc.toLowerCase().includes(search.toLowerCase()) ||
                action.toLowerCase().includes(search.toLowerCase()) ||
                name.toLowerCase().includes(search.toLowerCase()) ||
                role.toLowerCase().includes(search.toLowerCase()) ||
                ip.includes(search) ||
                id.includes(search)

            const matchesAction = 
                selectedActionFilter === 'ALL' || log.action === selectedActionFilter

            return matchesSearch && matchesAction
        })
    }, [logs, search, selectedActionFilter])

    const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize))

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    const openViewModal = (log) => {
        setSelectedLog(log)
        setIsViewOpen(true)
    }

    const getActionBadgeVariant = (action) => {
        if (!action) return 'neutral'
        const act = action.toUpperCase()
        if (act.includes('DELETE') || act.includes('FAIL') || act.includes('ERROR') || act.includes('REVOKE')) return 'error'
        if (act.includes('ADD') || act.includes('CREATE') || act.includes('SUCCESS') || act.includes('PROVISION')) return 'success'
        if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('CHANGE') || act.includes('SYNC')) return 'info'
        if (act.includes('LOGIN') || act.includes('AUTH') || act.includes('STK')) return 'purple'
        return 'neutral'
    }

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
            
            {/* Top Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">System & Activity Logs</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Real-time audit trail of operator operations, subscriber provisioning, and system events.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-3 w-full sm:flex-1">
                        <button
                            onClick={handleReload}
                            disabled={isLoading}
                            className="p-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                            title="Refresh Logs"
                        >
                            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                        </button>
                        
                        <div className="relative flex-1 sm:w-80 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={15} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search action, description, IP, actor..."
                                className="w-full pl-10 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Filter Action Pills */}
            {uniqueActions.length > 2 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[10px] font-bold text-admin-dim uppercase tracking-wider mr-1 flex items-center gap-1">
                        <Filter size={11} /> Filter:
                    </span>
                    {uniqueActions.map(action => (
                        <button
                            key={action}
                            onClick={() => setSelectedActionFilter(action)}
                            className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all uppercase whitespace-nowrap cursor-pointer",
                                selectedActionFilter === action
                                    ? "bg-pace-purple text-white shadow-sm"
                                    : "bg-pace-bg-subtle text-admin-dim hover:bg-pace-purple/10 hover:text-pace-purple border border-pace-border"
                            )}
                        >
                            {action}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Logs Table Card */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left whitespace-nowrap min-w-[950px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle/60 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-3.5">Log ID</th>
                                <th className="px-6 py-3.5">Action Event</th>
                                <th className="px-6 py-3.5">Details & Description</th>
                                <th className="px-6 py-3.5">Actor Identity</th>
                                <th className="px-6 py-3.5">Origin IP</th>
                                <th className="px-6 py-3.5">Timestamp</th>
                                <th className="px-6 py-3.5 text-center">Inspect</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border/80">
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-3.5"><div className="h-4 w-12 bg-pace-bg-subtle rounded" /></td>
                                        <td className="px-6 py-3.5"><div className="h-4 w-28 bg-pace-bg-subtle rounded-full" /></td>
                                        <td className="px-6 py-3.5"><div className="h-4 w-64 bg-pace-bg-subtle rounded" /></td>
                                        <td className="px-6 py-3.5"><div className="h-4 w-24 bg-pace-bg-subtle rounded" /></td>
                                        <td className="px-6 py-3.5"><div className="h-4 w-20 bg-pace-bg-subtle rounded" /></td>
                                        <td className="px-6 py-3.5"><div className="h-4 w-28 bg-pace-bg-subtle rounded" /></td>
                                        <td className="px-6 py-3.5 text-center"><div className="h-4 w-8 bg-pace-bg-subtle rounded mx-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-pace-bg-subtle flex items-center justify-center text-admin-dim">
                                                <Activity size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-admin-value">No activity records found</p>
                                            <p className="text-xs text-admin-dim">Events and operations will be recorded here in real-time.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr 
                                        key={log.id} 
                                        className="hover:bg-pace-bg-subtle/50 transition-colors group cursor-pointer"
                                        onClick={() => openViewModal(log)}
                                    >
                                        {/* ID */}
                                        <td className="px-6 py-3.5 text-xs font-mono font-bold text-admin-dim">
                                            #{log.id}
                                        </td>

                                        {/* Action Badge */}
                                        <td className="px-6 py-3.5">
                                            <Badge variant={getActionBadgeVariant(log.action)} className="font-mono text-[10px] tracking-wide">
                                                {log.action || 'SYSTEM'}
                                            </Badge>
                                        </td>

                                        {/* Description */}
                                        <td className="px-6 py-3.5 text-xs font-medium text-admin-value max-w-[380px] truncate" title={log.description}>
                                            {log.description}
                                        </td>

                                        {/* Actor */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-pace-purple/10 flex items-center justify-center text-[10px] font-bold text-pace-purple">
                                                    {(log.actor_name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-admin-value leading-none">{log.actor_name || 'System Auto'}</p>
                                                    {log.actor_role && (
                                                        <span className="text-[9px] font-medium text-admin-dim uppercase tracking-wider">{log.actor_role}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* IP Address */}
                                        <td className="px-6 py-3.5 text-xs font-mono text-admin-dim">
                                            {log.ip_address || '127.0.0.1'}
                                        </td>

                                        {/* Timestamp */}
                                        <td className="px-6 py-3.5 text-xs font-medium text-admin-value tabular-nums">
                                            {log.created_at ? new Date(log.created_at).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            }) : 'N/A'}
                                        </td>

                                        {/* Inspect Button */}
                                        <td className="px-6 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => openViewModal(log)}
                                                className="p-1.5 hover:bg-pace-purple/10 rounded-lg text-admin-dim hover:text-pace-purple transition-colors cursor-pointer"
                                                title="Inspect Log Entry"
                                            >
                                                <Eye size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-pace-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-pace-bg-subtle/20 text-xs">
                    <div className="text-admin-dim font-medium">
                        Showing <span className="font-bold text-admin-value">{filteredLogs.length}</span> of <span className="font-bold text-admin-value">{totalLogs}</span> entries
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-admin-dim font-medium">Rows:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value))
                                    setCurrentPage(1)
                                }}
                                className="bg-card-bg border border-pace-border rounded-lg px-2 py-1 text-xs font-bold text-admin-value focus:outline-none focus:border-pace-purple"
                            >
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-admin-dim font-medium">Page {currentPage} of {totalPages}</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1 || isLoading}
                                    className="p-1.5 bg-card-bg border border-pace-border rounded-lg text-admin-dim hover:text-admin-value disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    title="Previous Page"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage >= totalPages || isLoading}
                                    className="p-1.5 bg-card-bg border border-pace-border rounded-lg text-admin-dim hover:text-admin-value disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    title="Next Page"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Log Detail Modal */}
            <Modal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title={`Audit Log #${selectedLog?.id || ''}`}
                description="Comprehensive event details and security metadata."
                maxWidth="max-w-xl"
            >
                {selectedLog && (
                    <div className="space-y-4 font-figtree">
                        <div className="p-4 bg-pace-bg-subtle rounded-xl border border-pace-border space-y-3">
                            <div className="flex items-center justify-between">
                                <Badge variant={getActionBadgeVariant(selectedLog.action)} className="font-mono text-xs">
                                    {selectedLog.action}
                                </Badge>
                                <span className="text-xs font-mono font-medium text-admin-dim">
                                    IP: {selectedLog.ip_address || '127.0.0.1'}
                                </span>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-admin-dim uppercase tracking-wider mb-1">Event Description</p>
                                <p className="text-xs font-semibold text-admin-value leading-relaxed bg-card-bg p-3 rounded-lg border border-pace-border">
                                    {selectedLog.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="p-2.5 bg-card-bg rounded-lg border border-pace-border">
                                    <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider mb-0.5">Actor</p>
                                    <p className="font-bold text-admin-value">{selectedLog.actor_name || 'System'}</p>
                                    {selectedLog.actor_role && (
                                        <p className="text-[10px] font-mono text-pace-purple uppercase mt-0.5">{selectedLog.actor_role}</p>
                                    )}
                                </div>

                                <div className="p-2.5 bg-card-bg rounded-lg border border-pace-border">
                                    <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider mb-0.5">Recorded At</p>
                                    <p className="font-bold text-admin-value">
                                        {selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    </p>
                                    <p className="text-[10px] font-mono text-admin-dim mt-0.5">
                                        {selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleTimeString('en-US') : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setIsViewOpen(false)}
                                className="px-4 py-2 bg-pace-purple text-white rounded-xl text-xs font-bold hover:bg-pace-purple/90 transition-all cursor-pointer shadow-sm"
                            >
                                Close Inspection
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    )
}

export default function LogsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-pace-purple border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <LogsContent />
        </Suspense>
    )
}
