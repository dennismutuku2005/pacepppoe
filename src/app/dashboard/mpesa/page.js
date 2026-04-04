"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Filter, CheckCircle2, XCircle, Clock, Smartphone, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mpesaService } from '@/services/mpesa'

export default function MpesaTransactionsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [transactions, setTransactions] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [total, setTotal] = useState(0)

    const observer = useRef()
    const fetchLock = useRef(false)

    const loadTransactions = async (pageNum, isAppend = false) => {
        if (fetchLock.current) return
        fetchLock.current = true

        try {
            if (isAppend) setIsLoadingMore(true)
            else setIsLoading(true)

            const response = await mpesaService.getTransactions({
                page: pageNum,
                limit: 12,

                search: searchTerm
            })

            if (response?.status === 'success') {
                const newItems = response.data || []
                const serverTotal = response.pagination?.total || 0
                const serverHasMore = response.pagination?.has_more ?? false

                if (isAppend) {
                    setTransactions(prev => {
                        const existingIds = new Set(prev.map(item => item.id));
                        const uniqueNew = newItems.filter(item => !existingIds.has(item.id));
                        return [...prev, ...uniqueNew];
                    });
                } else {
                    setTransactions(newItems)
                }

                setTotal(serverTotal)
                setHasMore(serverHasMore)
                setPage(pageNum)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error("Failed to load transactions", error)
            setHasMore(false)
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
            fetchLock.current = false
        }
    }

    useEffect(() => {
        loadTransactions(1, false)
    }, [])

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== undefined) {
                loadTransactions(1, false)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    // Infinite scroll observer
    const lastElementRef = useCallback(node => {
        if (isLoading || isLoadingMore) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !fetchLock.current) {
                loadTransactions(page + 1, true)
            }
        })
        if (node) observer.current.observe(node)
    }, [isLoading, isLoadingMore, hasMore, page])

    const handleRefresh = () => {
        setSearchTerm('')
        loadTransactions(1, false)
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Success':
                return { variant: 'success', icon: CheckCircle2, color: 'text-green-600' }
            case 'Failed':
                return { variant: 'error', icon: XCircle, color: 'text-red-500' }
            default:
                return { variant: 'default', icon: Clock, color: 'text-gray-500' }
        }
    }

    return (
        <div className="space-y-4 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Control Bar with Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card-bg p-4 rounded-xl border border-pace-border">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by phone or M-Pesa code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-pace-border bg-pace-bg-subtle focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple outline-none text-sm text-admin-value transition-all font-bold"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-pace-border text-admin-value rounded-lg hover:bg-pace-bg-subtle transition-all bg-card-bg text-sm font-bold disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
                        {isLoading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead className="bg-pace-bg-subtle border-b border-pace-border">
                            <tr className="text-admin-dim">
                                <th className="px-4 py-3 font-semibold uppercase tracking-widest text-[9px]">M-Pesa Code</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-widest text-[9px]">Mobile Number</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-widest text-[9px] text-right">Amount</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-widest text-[9px] text-center">Status</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-widest text-[9px] text-right">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading && transactions.length === 0 ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
                                        <td className="px-4 py-3"><Skeleton className="h-4 w-32 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={32} className="opacity-20" />
                                            <p className="text-xs font-semibold uppercase tracking-wider">No transactions found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((txn, index) => {
                                    const statusConfig = getStatusConfig(txn.status)
                                    const isLast = index === transactions.length - 1
                                    return (
                                        <tr
                                            key={txn.id}
                                            ref={isLast ? lastElementRef : null}
                                            className="hover:bg-pace-bg-subtle transition-colors group"
                                        >
                                            <td className="px-4 py-3">
                                                <span className="font-bold text-admin-value tracking-tight">{txn.mpesa_receipt_number || 'N/A'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                                                {txn.phone_number || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-bold text-admin-value tabular-nums">KES {parseFloat(txn.amount || 0).toFixed(2)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant={statusConfig.variant} className="text-[9px] px-2 py-0.5 font-bold uppercase rounded-full">
                                                    {txn.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right text-admin-dim text-[10px] font-bold uppercase tracking-wide">
                                                {txn.transaction_date_formatted}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Loading More Indicator */}
                {isLoadingMore && (
                    <div className="py-8 flex justify-center items-center gap-3 border-t border-pace-border bg-pace-bg-subtle">
                        <Loader2 className="animate-spin text-pace-purple" size={20} />
                        <span className="text-sm font-bold text-admin-dim">Loading more transactions...</span>
                    </div>
                )}

                {!hasMore && transactions.length > 0 && (
                    <div className="py-8 text-center text-admin-dim text-xs font-bold border-t border-pace-border">
                        All {total} transactions loaded
                    </div>
                )}
            </div>
        </div>
    )
}
