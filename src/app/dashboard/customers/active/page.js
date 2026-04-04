"use client"

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock, Ticket, Smartphone, Activity, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton, TableRowSkeleton } from '@/components/Skeleton'

import { activeConnectionsService } from '@/services/activeConnections'

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

    // Load data function
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

    // Initial load & Search effect
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

    // Infinite Scroll Observer
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

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-lg font-medium text-pace-purple leading-tight uppercase tracking-tight flex items-center gap-2">
                        <Activity className="text-pace-purple" size={20} />
                        Active Connections
                    </h1>
                    <p className="text-[10px] font-medium text-gray-400 mt-1 tracking-widest uppercase italic border-l-2 border-pace-purple/20 pl-2">
                        Real-time tracking of paid hotspot sessions (Both M-Pesa & Vouchers).
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-end">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[14px] font-bold text-emerald-500 leading-none">{total}</span>
                        </div>
                        <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Total Online</span>
                    </div>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pace-purple transition-colors" size={12} />
                    <input
                        type="text"
                        autoComplete="off"
                        placeholder="Search phone or plan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-[11px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
                <button 
                   onClick={handleRefresh}
                   className="p-2.5 bg-card-bg border border-pace-border rounded-xl text-admin-dim hover:text-pace-purple transition-all active:scale-95 shadow-sm"
                   title="Refresh live data"
                >
                    <RefreshCcw size={14} className={isRefreshing ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Main Data Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap text-[11px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle border-b border-pace-border font-bold text-admin-dim uppercase tracking-widest text-[9px]">
                                <th className="px-6 py-4">User Identity</th>
                                <th className="px-6 py-4">Subscription Plan</th>
                                <th className="px-6 py-4">Financial Details</th>
                                <th className="px-6 py-4">Connection Start</th>
                                <th className="px-6 py-4">Expiration Time</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading && entries.length === 0 ? (
                                <TableRowSkeleton cols={6} rows={8} />
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 text-admin-dim uppercase tracking-widest text-[10px] font-bold">
                                            No active connections found
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                entries.map((entry, index) => {
                                    const isLast = index === entries.length - 1
                                    return (
                                        <tr
                                            key={entry.id}
                                            ref={isLast ? lastElementRef : null}
                                            className="hover:bg-pace-bg-subtle transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-bold text-pace-purple text-[12px] tracking-tight">{entry.phone}</span>
                                                    <span className="text-[8px] font-mono text-admin-dim uppercase mt-0.5 tracking-tighter">ID: CONN-{entry.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-pace-purple/5 flex items-center justify-center text-pace-purple border border-pace-purple/10">
                                                        <Ticket size={14} />
                                                    </div>
                                                    <span className="font-bold text-admin-value uppercase">{entry.plan}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 uppercase font-bold text-[10px]">
                                                        {entry.type === 'M-Pesa' ? (
                                                            <Smartphone size={10} className="text-pace-green" />
                                                        ) : (
                                                            <Ticket size={10} className="text-pace-purple" />
                                                        )}
                                                        <span className={cn(
                                                            "tracking-widest font-black uppercase",
                                                            entry.type === 'M-Pesa' ? "text-pace-green" : "text-pace-purple"
                                                        )}>{entry.type}</span>
                                                    </div>
                                                    <span className="text-[9px] font-mono text-admin-dim uppercase tracking-widest mt-0.5">
                                                        {entry.mpesa_code} (KES {entry.amount})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-admin-dim">
                                                    <Clock size={10} />
                                                    <span className="font-medium text-[10px] uppercase">{entry.created_at}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                                                        <Clock size={10} />
                                                    </div>
                                                    <span className="font-bold text-admin-value text-[10px] uppercase">{entry.expire_time}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant="success" className="text-[8px] px-2 py-0.5 border-none uppercase tracking-widest rounded-md font-bold">
                                                    Active
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
        <Suspense fallback={<div className="p-10 text-center uppercase tracking-widest text-[10px] font-bold text-admin-dim">Loading Active Sessions...</div>}>
            <ActiveConnectionsContent />
        </Suspense>
    )
}
