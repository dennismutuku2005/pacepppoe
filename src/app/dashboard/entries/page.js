"use client"

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, Clock, Wifi, Hash, RefreshCw, CheckCircle2, X, Calendar, Router as RouterIcon, Smartphone } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, TableRowSkeleton } from '@/components/Skeleton'
import { GlobalFilters } from '@/components/GlobalFilters'
import { Modal } from '@/components/Modal'
import { entriesService } from '@/services/entries'
import { cn } from '@/lib/utils'

export default function EntriesPage() {
    // Core state
    const [allEntries, setAllEntries] = useState([])
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    // UI state
    const [isFirstLoad, setIsFirstLoad] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({ router: 'All Routers', dateRange: 'All Time' })
    const [selectedEntry, setSelectedEntry] = useState(null)

    // Refs
    const scrollTrigger = useRef(null)
    const fetchLock = useRef(false)

    // Dynamic limit: 12 as per performance optimization request
    const getLimit = () => 12


    // Date range parser
    const parseDates = (range) => {
        const now = new Date()
        const fmt = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        if (!range || range === 'All Time') return {}
        if (range === 'Today') return { startDate: fmt(now), endDate: fmt(now) }
        if (range === 'Yesterday') {
            const y = new Date(now); y.setDate(y.getDate() - 1)
            return { startDate: fmt(y), endDate: fmt(y) }
        }
        if (range === 'This Week') {
            const w = new Date(now); w.setDate(w.getDate() - 6)
            return { startDate: fmt(w), endDate: fmt(now) }
        }
        if (range === 'This Month') {
            return { startDate: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), endDate: fmt(now) }
        }
        if (range.includes(' - ')) {
            const [p1, p2] = range.split(' - ')
            return {
                startDate: fmt(new Date(`${p1} ${now.getFullYear()}`)),
                endDate: fmt(new Date(`${p2} ${now.getFullYear()}`))
            }
        }

        const singleDate = new Date(range);
        if (!isNaN(singleDate.getTime())) {
            return { startDate: fmt(singleDate), endDate: fmt(singleDate) };
        }

        return {}
    }

    // Main fetch function
    const loadPage = async (pageNum, isAppend) => {
        if (fetchLock.current) return

        fetchLock.current = true
        const currentLimit = getLimit()

        try {
            console.log(`[SCROLL] Fetching page ${pageNum} (limit: ${currentLimit})`)

            if (isAppend) setIsLoadingMore(true)
            else setIsFirstLoad(true)

            const dates = parseDates(filters.dateRange)
            const response = await entriesService.getEntries({
                router: filters.router,
                search: search,
                limit: currentLimit,
                page: pageNum,
                ...dates
            })

            if (response?.status === 'success') {
                const newItems = response.data || []
                const serverTotal = response.pagination?.total || 0
                const serverHasMore = response.pagination?.has_more ?? false

                if (isAppend) {
                    setAllEntries(prev => {
                        const existingIds = new Set(prev.map(item => item.id));
                        const uniqueNew = newItems.filter(item => !existingIds.has(item.id));
                        return [...prev, ...uniqueNew];
                    });
                } else {
                    setAllEntries(newItems)
                }

                setTotal(serverTotal)
                setHasMore(serverHasMore)
                setPage(pageNum)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('[SCROLL] Error:', error)
            setHasMore(false)
        } finally {
            setIsFirstLoad(false)
            setIsLoadingMore(false)
            fetchLock.current = false
        }
    }

    // Reset on filter/search change
    useEffect(() => {
        const timer = setTimeout(() => {
            setAllEntries([])
            setPage(1)
            setHasMore(true)
            loadPage(1, false)
        }, 300)

        return () => clearTimeout(timer)
    }, [filters, search])

    // Infinite scroll observer
    useEffect(() => {
        const target = scrollTrigger.current
        if (!target || !hasMore || isFirstLoad || isLoadingMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !fetchLock.current) {
                    loadPage(page + 1, true)
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        )

        observer.observe(target)
        return () => observer.disconnect()
    }, [hasMore, isFirstLoad, isLoadingMore, page])

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-2">
            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedEntry}
                onClose={() => setSelectedEntry(null)}
                title="Entry Details"
                type="info"
                icon={Smartphone}
                showCancel={false}
                confirmText="Close"
                onConfirm={() => setSelectedEntry(null)}
                description=""
            >
                {selectedEntry && (
                    <div className="space-y-4 text-left not-italic">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-medium tracking-widest">Phone Number</p>
                                <p className="text-sm font-mono font-medium text-pace-purple">{selectedEntry.phone}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-medium tracking-widest">M-Pesa Code</p>
                                <p className="text-sm font-mono font-medium text-pace-purple">{selectedEntry.code}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-medium tracking-widest">MAC Address</p>
                                <p className="text-[11px] font-mono text-admin-dim">{selectedEntry.mac}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">Station</p>
                                <p className="text-sm font-medium text-pace-purple">{selectedEntry.router}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">Amount Paid</p>
                                <p className="text-base font-medium text-pace-purple">KES {selectedEntry.amount}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">Status</p>
                                <Badge variant={selectedEntry.active ? 'success' : 'error'} className="text-[10px] px-2 py-0.5 font-medium uppercase">
                                    {selectedEntry.active ? 'Active' : 'Expired'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">Mikrotik Used</p>
                                <Badge variant={selectedEntry.used ? 'success' : 'error'} className="text-[10px] px-2 py-0.5 font-medium uppercase">
                                    {selectedEntry.used ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-pace-border">
                            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">Timeline</p>
                            <p className="text-[11px] font-medium text-admin-dim">Started: {selectedEntry.created}</p>
                            <p className="text-[11px] font-medium text-pace-purple">Expires: {selectedEntry.expires}</p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-pace-border pb-8 mt-4">
                <div>
                    <h1 className="text-2xl font-medium text-pace-purple tracking-tight">Entries</h1>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Real-time Connection Log</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <GlobalFilters
                        defaultDateRange="All Time"
                        onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f }))}
                    />
                    <button
                        onClick={() => loadPage(1, false)}
                        disabled={isFirstLoad || isLoadingMore}
                        className="flex items-center gap-2 px-6 py-2.5 bg-pace-purple text-white rounded-xl hover:bg-pace-purple/90 transition-all text-xs font-medium uppercase tracking-widest shadow-lg shadow-pace-purple/10 w-full sm:w-auto justify-center disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={cn((isFirstLoad || isLoadingMore) && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Search & Stats */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pace-purple transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search identification or activity details..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-pace-border bg-card-bg focus:border-pace-purple outline-none text-sm text-admin-value transition-all placeholder:text-admin-dim/40 font-bold"
                    />
                </div>
                <div className="hidden md:flex ml-auto items-center gap-2">
                    <div className="px-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl">
                        <span className="text-xs text-admin-dim font-bold">
                            {allEntries.length} of {total}
                        </span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="sticky top-0 bg-card-bg z-10">
                            <tr className="bg-pace-bg-subtle border-b border-pace-border text-admin-dim text-[10px] uppercase tracking-wider font-bold">
                                <th className="px-6 py-4">Identification</th>
                                <th className="px-6 py-4">Linked Device</th>
                                <th className="px-6 py-4">Transaction Code</th>
                                <th className="px-6 py-4">Router</th>
                                <th className="px-6 py-4">Paid</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Used</th>
                                <th className="px-6 py-4 text-right">Period</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isFirstLoad && allEntries.length === 0 ? (
                                <TableRowSkeleton cols={8} rows={10} />
                            ) : allEntries.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <Wifi size={40} />
                                            <p className="text-xs font-medium uppercase tracking-wider">No Records Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {allEntries.map((item, idx) => (
                                        <tr
                                            key={`entry-${item.id}-${idx}`}
                                            onClick={() => setSelectedEntry(item)}
                                            className="hover:bg-pace-bg-subtle transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-medium text-pace-purple tracking-tight">{item.phone}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-[10px] text-gray-400">{item.mac}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Hash size={12} className="text-pace-purple/30" />
                                                    <span className="font-mono text-[11px] font-medium text-pace-purple uppercase tracking-tight">{item.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-pace-bg-subtle text-admin-dim uppercase">
                                                    {item.router.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-pace-purple tracking-tight">KES {item.amount}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge
                                                    variant={item.active ? 'success' : 'secondary'}
                                                    className="inline-flex items-center text-[10px] font-medium uppercase px-2 py-0.5"
                                                >
                                                    {item.active ? 'Active' : 'Expired'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge
                                                    variant={item.used ? 'success' : 'error'}
                                                    className="inline-flex items-center text-[10px] font-medium uppercase px-2 py-0.5"
                                                >
                                                    {item.used ? 'Yes' : 'No'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span className="text-[10px] font-medium text-gray-400 uppercase flex items-center gap-1">
                                                        {item.created}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-pace-purple uppercase">
                                                        Exp: {item.expires}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    <tr ref={scrollTrigger} className="h-4">
                                        <td colSpan="7" className="p-0"></td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {isLoadingMore && (
                    <div className="py-8 flex flex-col items-center justify-center gap-3 border-t border-pace-border bg-pace-bg-subtle/30">
                        <div className="w-5 h-5 border-2 border-pace-purple/20 border-t-pace-purple rounded-full animate-spin" />
                        <span className="text-xs text-admin-dim uppercase tracking-wider">Loading more...</span>
                    </div>
                )}
            </div>

            {!hasMore && allEntries.length > 0 && !isFirstLoad && (
                <div className="flex flex-col items-center gap-6 py-12 opacity-40">
                    <div className="h-px w-24 bg-gray-200" />
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-green-500" />
                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                            All entries viewed
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
