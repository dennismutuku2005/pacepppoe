"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react'
import { 
    Search, RefreshCw, Eye, Activity, Loader2
} from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { logService } from '@/services/isp/logs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const BATCH_SIZE = 50

function LogsContent() {
    const [logs, setLogs] = useState([])
    const [totalLogs, setTotalLogs] = useState(0)
    const [isLoadingInitial, setIsLoadingInitial] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [search, setSearch] = useState('')

    // Log detail modal
    const [selectedLog, setSelectedLog] = useState(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    // Sentinel ref for infinite scroll
    const sentinelRef = useRef(null)

    // Load initial logs
    const fetchInitialLogs = async () => {
        setIsLoadingInitial(true)
        try {
            const res = await logService.getLogs(BATCH_SIZE, 0)
            if (res && res.status === 'success') {
                const fetchedLogs = res.data || []
                const total = res.total || 0
                setLogs(fetchedLogs)
                setTotalLogs(total)
                setHasMore(fetchedLogs.length < total)
            } else {
                toast.error(res?.message || 'Failed to retrieve activity logs')
            }
        } catch (err) {
            console.error("Error fetching logs:", err)
            toast.error('Network error fetching activity logs')
        } finally {
            setIsLoadingInitial(false)
        }
    }

    // Load more logs on scroll
    const fetchMoreLogs = useCallback(async () => {
        if (isLoadingMore || !hasMore || isLoadingInitial) return

        setIsLoadingMore(true)
        try {
            const offset = logs.length
            const res = await logService.getLogs(BATCH_SIZE, offset)
            if (res && res.status === 'success') {
                const newLogs = res.data || []
                const total = res.total || totalLogs
                setTotalLogs(total)

                if (newLogs.length === 0) {
                    setHasMore(false)
                } else {
                    setLogs(prev => {
                        // Prevent duplicate IDs if any
                        const existingIds = new Set(prev.map(l => l.id))
                        const uniqueNew = newLogs.filter(l => !existingIds.has(l.id))
                        const updated = [...prev, ...uniqueNew]
                        setHasMore(updated.length < total)
                        return updated
                    })
                }
            }
        } catch (err) {
            console.error("Error loading more logs:", err)
        } finally {
            setIsLoadingMore(false)
        }
    }, [isLoadingMore, hasMore, isLoadingInitial, logs.length, totalLogs])

    useEffect(() => {
        fetchInitialLogs()
    }, [])

    // Setup IntersectionObserver on sentinel
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoadingInitial) {
                    fetchMoreLogs()
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        )

        const currentSentinel = sentinelRef.current
        if (currentSentinel) {
            observer.observe(currentSentinel)
        }

        return () => {
            if (currentSentinel) {
                observer.unobserve(currentSentinel)
            }
        }
    }, [fetchMoreLogs, hasMore, isLoadingMore, isLoadingInitial])

    const handleReload = () => {
        fetchInitialLogs()
    }

    // Filter logs by search query
    const filteredLogs = useMemo(() => {
        if (!search.trim()) return logs
        const query = search.toLowerCase()

        return logs.filter((log) => {
            const desc = log.description || ''
            const action = log.action || ''
            const name = log.actor_name || ''
            const role = log.actor_role || ''
            const ip = log.ip_address || ''
            const id = log.id ? log.id.toString() : ''

            return (
                desc.toLowerCase().includes(query) ||
                action.toLowerCase().includes(query) ||
                name.toLowerCase().includes(query) ||
                role.toLowerCase().includes(query) ||
                ip.includes(query) ||
                id.includes(query)
            )
        })
    }, [logs, search])

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
        <div className="space-y-6 font-figtree animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
            
            {/* Top Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">System & Activity Logs</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Real-time audit trail of operator operations, subscriber provisioning, and system events.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                    <button
                        onClick={handleReload}
                        disabled={isLoadingInitial}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 text-xs font-semibold cursor-pointer"
                        title="Refresh Logs"
                    >
                        <RefreshCw size={14} className={isLoadingInitial ? "animate-spin" : ""} />
                        <span>Refresh Logs</span>
                    </button>
                    
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={15} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search action, description, IP, actor..."
                            className="w-full pl-10 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-xs font-normal text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Main Logs Table with Infinite Scroll */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left whitespace-nowrap min-w-[950px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-semibold text-admin-dim uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-3.5">Log ID</th>
                                <th className="px-6 py-3.5">Action Event</th>
                                <th className="px-6 py-3.5">Details & Description</th>
                                <th className="px-6 py-3.5">Actor Identity</th>
                                <th className="px-6 py-3.5">Origin IP</th>
                                <th className="px-6 py-3.5">Timestamp</th>
                                <th className="px-6 py-3.5 text-center">Inspect</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border/70">
                            {isLoadingInitial ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-3.5"><div className="h-4 w-12 bg-pace-bg-subtle rounded" /></td>
                                        <td className="px-6 py-3.5"><div className="h-4 w-24 bg-pace-bg-subtle rounded" /></td>
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
                                            <p className="text-sm font-medium text-admin-value">No activity records found</p>
                                            <p className="text-xs text-admin-dim font-normal">Events and operations will be recorded here in real-time.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr 
                                        key={log.id} 
                                        className="hover:bg-pace-bg-subtle/40 transition-colors group cursor-pointer"
                                        onClick={() => openViewModal(log)}
                                    >
                                        {/* ID */}
                                        <td className="px-6 py-3.5 text-xs font-mono font-medium text-admin-dim">
                                            #{log.id}
                                        </td>

                                        {/* Action Badge */}
                                        <td className="px-6 py-3.5">
                                            <Badge variant={getActionBadgeVariant(log.action)} className="font-mono text-[10px] tracking-normal font-medium">
                                                {log.action || 'SYSTEM'}
                                            </Badge>
                                        </td>

                                        {/* Description */}
                                        <td className="px-6 py-3.5 text-xs font-normal text-admin-value max-w-[420px] truncate" title={log.description}>
                                            {log.description}
                                        </td>

                                        {/* Actor */}
                                        <td className="px-6 py-3.5 text-xs font-medium text-admin-value">
                                            <span>{log.actor_name || 'System'}</span>
                                            {log.actor_role && (
                                                <span className="text-[10px] text-admin-dim font-normal ml-2 uppercase">({log.actor_role})</span>
                                            )}
                                        </td>

                                        {/* IP Address */}
                                        <td className="px-6 py-3.5 text-xs font-mono font-normal text-admin-dim">
                                            {log.ip_address || '127.0.0.1'}
                                        </td>

                                        {/* Timestamp */}
                                        <td className="px-6 py-3.5 text-xs font-normal text-admin-dim tabular-nums">
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

                {/* Infinite Scroll Sentinel & Status Bar */}
                <div ref={sentinelRef} className="px-6 py-4 border-t border-pace-border flex items-center justify-between bg-pace-bg-subtle/20 text-xs">
                    <div className="text-admin-dim font-normal">
                        Loaded <span className="font-semibold text-admin-value">{filteredLogs.length}</span> of <span className="font-semibold text-admin-value">{totalLogs}</span> entries
                    </div>

                    <div className="flex items-center gap-2">
                        {isLoadingMore && (
                            <div className="flex items-center gap-2 text-pace-purple font-medium text-xs">
                                <Loader2 size={14} className="animate-spin" />
                                <span>Loading more logs...</span>
                            </div>
                        )}
                        {!hasMore && logs.length > 0 && (
                            <span className="text-[11px] text-admin-dim font-normal">All activity records loaded</span>
                        )}
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
                                <span className="text-xs font-mono font-normal text-admin-dim">
                                    IP: {selectedLog.ip_address || '127.0.0.1'}
                                </span>
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold text-admin-dim uppercase tracking-wider mb-1">Event Description</p>
                                <p className="text-xs font-normal text-admin-value leading-relaxed bg-card-bg p-3 rounded-lg border border-pace-border">
                                    {selectedLog.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="p-2.5 bg-card-bg rounded-lg border border-pace-border">
                                    <p className="text-[10px] text-admin-dim font-semibold uppercase tracking-wider mb-0.5">Actor</p>
                                    <p className="font-medium text-admin-value">{selectedLog.actor_name || 'System'}</p>
                                    {selectedLog.actor_role && (
                                        <p className="text-[10px] font-mono text-pace-purple uppercase mt-0.5">{selectedLog.actor_role}</p>
                                    )}
                                </div>

                                <div className="p-2.5 bg-card-bg rounded-lg border border-pace-border">
                                    <p className="text-[10px] text-admin-dim font-semibold uppercase tracking-wider mb-0.5">Recorded At</p>
                                    <p className="font-medium text-admin-value">
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
                                className="px-4 py-2 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all cursor-pointer shadow-sm"
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
