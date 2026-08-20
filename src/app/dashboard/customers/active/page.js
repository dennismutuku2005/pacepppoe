"use client"

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock, Ticket, Smartphone, Activity, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton, TableRowSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { activeConnectionsService } from '@/services/isp/activeConnections'

function ActiveConnectionsContent() {
    const router = useRouter()
    
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [entries, setEntries] = useState([])
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [total, setTotal] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const observer = useRef()
    const fetchLock = useRef(false)

    const loadEntries = async (pageNum, isAppend = false) => {
        if (fetchLock.current) return
        fetchLock.current = true

        try {
            if (!isAppend) setIsLoading(true)
            else setIsLoadingMore(true)

            const response = await activeConnectionsService.getActiveConnections({
                page: pageNum,
                limit: 15,
                search
            })

            if (response?.status === 'success') {
                const newItems = response.data || []
                const serverTotal = response.pagination?.total || 0
                const serverHasMore = response.pagination?.has_more ?? false

                if (isAppend) {
                    setEntries(prev => [...prev, ...newItems])
                } else {
                    setEntries(newItems)
                }

                setTotal(serverTotal)
                setHasMore(serverHasMore)
                setPage(pageNum)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error("Failed to load active connections", error)
            setHasMore(false)
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
            setIsRefreshing(false)
            fetchLock.current = false
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setEntries([])
            setPage(1)
            setHasMore(true)
            loadEntries(1, false)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    const handleRefresh = () => {
        setIsRefreshing(true)
        setEntries([])
        setPage(1)
        setHasMore(true)
        loadEntries(1, false)
    }

    const lastElementRef = useCallback(node => {
        if (isLoading || isLoadingMore) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !fetchLock.current) {
                loadEntries(page + 1, true)
            }
        })
        if (node) observer.current.observe(node)
    }, [isLoading, isLoadingMore, hasMore, page])

    if (isLoading && entries.length === 0) {
        return <TablePageSkeleton />
    }

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Active Sessions</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Real-time tracking of paid hotspot and PPPoE sessions</p>
                </div>

                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex flex-col items-end shadow-sm">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-lg font-bold text-emerald-600 tabular-nums">{total}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live Nodes</span>
                    </div>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search session identity..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
                <button 
                   onClick={handleRefresh}
                   className="p-2.5 bg-card-bg border border-pace-border rounded-xl text-admin-dim hover:text-pace-purple transition-all active:scale-95 shadow-sm"
                   title="Refresh live sessions"
                >
                    <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Main Data Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-3">Session Identity</th>
                                <th className="px-6 py-3">Service Profile</th>
                                <th className="px-6 py-3">Financial Nexus</th>
                                <th className="px-6 py-3">Session Start</th>
                                <th className="px-6 py-3">Expiration</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {entries.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim text-sm font-medium">No active sessions found</td>
                                </tr>
                            ) : (
                                entries.map((entry, index) => {
                                    const isLast = index === entries.length - 1
                                    return (
                                        <tr
                                            key={entry.id}
                                            ref={isLast ? lastElementRef : null}
                                            className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group"
                                        >
                                            <td className="px-6 py-2">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-admin-value text-xs group-hover:text-pace-purple transition-colors">{entry.phone}</span>
                                                    <span className="text-[10px] text-admin-dim font-mono">CONN-{entry.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-pace-purple/5 flex items-center justify-center text-pace-purple border border-pace-purple/10">
                                                        <Ticket size={14} />
                                                    </div>
                                                    <span className="font-semibold text-admin-value text-xs uppercase">{entry.plan}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 font-bold text-[9px] uppercase">
                                                        {entry.type === 'M-Pesa' ? (
                                                            <Smartphone size={10} className="text-green-600" />
                                                        ) : (
                                                            <Ticket size={10} className="text-pace-purple" />
                                                        )}
                                                        <span className={cn(
                                                            "tracking-widest",
                                                            entry.type === 'M-Pesa' ? "text-green-600" : "text-pace-purple"
                                                        )}>{entry.type}</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-admin-dim mt-0.5 tabular-nums">
                                                        {entry.mpesa_code} (KES {entry.amount})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex items-center gap-2 text-admin-dim">
                                                    <Clock size={12} />
                                                    <span className="font-medium text-[10px] tabular-nums">{entry.created_at}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 rounded bg-red-500/5 text-red-500 border border-red-500/10">
                                                        <Clock size={11} />
                                                    </div>
                                                    <span className="font-bold text-admin-value text-[10px] tabular-nums">{entry.expire_time}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 text-center">
                                                <Badge variant="success" className="text-[10px] font-medium border-none">
                                                    Live Session
                                                </Badge>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}

                            {isLoadingMore && (
                                <TableRowSkeleton cols={6} rows={3} />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function ActiveConnectionsPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-admin-dim text-sm font-medium animate-pulse">Syncing active sessions...</div>}>
            <ActiveConnectionsContent />
        </Suspense>
    )
}
