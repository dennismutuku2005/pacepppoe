"use client"

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Wifi, Hash, Router as RouterIcon, CheckCircle2, History, Fingerprint } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, TableRowSkeleton } from '@/components/Skeleton'
import { Modal } from '@/components/Modal'
import { customerService } from '@/services/customers'
import { blockStkService } from '@/services/blockStk'

function CustomerHistoryContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Get phone from query params
    const phone = searchParams.get('phone')

    const [history, setHistory] = useState([])
    const [summary, setSummary] = useState(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [total, setTotal] = useState(0)
    const [isBlocked, setIsBlocked] = useState(false)
    const [isBlockLoading, setIsBlockLoading] = useState(false)

    // Modal State
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', description: '', onConfirm: null })

    const observer = useRef()
    const fetchLock = useRef(false)

    // Check if user is blocked
    const checkBlockStatus = async () => {
        if (!phone) return
        try {
            const response = await blockStkService.getBlockedNumbers({ phone })
            setIsBlocked(response.is_blocked)
        } catch (error) {
            console.error("Failed to check block status", error)
        }
    }

    const handleBlockToggle = async () => {
        if (!phone) return

        const action = isBlocked ? 'Unblock' : 'Block'
        const confirmText = isBlocked
            ? `Are you sure you want to unblock ${phone}? This user will be able to make STK push requests again.`
            : `Are you sure you want to block ${phone}? This will blacklist the number from making any M-Pesa payments on the portal.`

        setModal({
            isOpen: true,
            type: isBlocked ? 'info' : 'danger',
            title: `${action} Customer?`,
            description: confirmText,
            confirmText: `Yes, ${action}`,
            onConfirm: executeBlockToggle
        })
    }

    const executeBlockToggle = async () => {
        setIsBlockLoading(true)
        const action = isBlocked ? 'Unblock' : 'Block'
        try {
            if (isBlocked) {
                await blockStkService.unblockNumber(phone)
                setIsBlocked(false)
            } else {
                await blockStkService.blockNumber(phone)
                setIsBlocked(true)
            }

            setModal({
                isOpen: true,
                type: 'success',
                title: 'Action Successful',
                description: `Customer ${phone} has been ${isBlocked ? 'unblocked' : 'blocked'} successfully.`,
                showCancel: false,
                confirmText: 'Done',
                onConfirm: () => setModal({ isOpen: false })
            })
        } catch (error) {
            console.error("Block toggle error:", error)
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Operation Failed',
                description: `Failed to ${action.toLowerCase()} customer. Please check your connection and try again.`,
                showCancel: false,
                onConfirm: () => setModal({ isOpen: false })
            })
        } finally {
            setIsBlockLoading(false)
        }
    }

    const loadHistory = async (pageNum, isAppend = false) => {
        if (!phone || fetchLock.current) return
        fetchLock.current = true

        try {
            if (isAppend) setIsLoadingMore(true)
            else setIsLoading(true)

            const response = await customerService.getCustomerHistory({
                phone,
                page: pageNum,
                limit: 12

            })

            if (response?.status === 'success') {
                const newItems = response.data || []
                const serverTotal = response.pagination?.total || 0
                const serverHasMore = response.pagination?.has_more ?? false

                if (!isAppend && response.summary) {
                    setSummary(response.summary)
                }

                if (isAppend) {
                    setHistory(prev => [...prev, ...newItems])
                } else {
                    setHistory(newItems)
                }

                setTotal(serverTotal)
                setHasMore(serverHasMore)
                setPage(pageNum)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error("Failed to load history", error)
            setHasMore(false)
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
            fetchLock.current = false
        }
    }

    useEffect(() => {
        if (phone) {
            loadHistory(1, false)
            checkBlockStatus()
        }
    }, [phone])

    // Infinite scroll observer
    const lastElementRef = useCallback(node => {
        if (isLoading || isLoadingMore) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !fetchLock.current) {
                loadHistory(page + 1, true)
            }
        })
        if (node) observer.current.observe(node)
    }, [isLoading, isLoadingMore, hasMore, page])

    if (!phone) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400 gap-4">
                <History size={48} className="opacity-20" />
                <p>No customer selected</p>
                <button
                    onClick={() => router.back()}
                    className="text-sm font-bold text-pace-purple hover:underline"
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10 px-2">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-pace-border pb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-admin-value flex items-center gap-2">
                            Customer History
                            <span className="text-sm font-mono font-normal text-admin-dim bg-pace-bg-subtle px-2 py-0.5 rounded border border-pace-border">{phone}</span>
                            {isBlocked && (
                                <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                    <Fingerprint size={12} /> Blocked
                                </span>
                            )}
                        </h1>
                    </div>
                </div>

                <button
                    onClick={handleBlockToggle}
                    disabled={isBlockLoading}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
                        ${isBlocked
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20'
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                        }
                    `}
                >
                    {isBlockLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isBlocked ? (
                        <> <Fingerprint size={16} /> Unblock Customer </>
                    ) : (
                        <> <Fingerprint size={16} /> Block Customer </>
                    )}
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-card-bg border border-pace-border rounded-xl shadow-sm">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
                        <p className="text-xl font-bold text-pace-purple">KES {summary.total_spent}</p>
                    </div>
                    <div className="p-4 bg-card-bg border border-pace-border rounded-xl shadow-sm">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Entries</p>
                        <p className="text-xl font-bold text-admin-value">{summary.sessions}</p>
                    </div>
                    <div className="p-4 bg-card-bg border border-pace-border rounded-xl shadow-sm">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Last Seen</p>
                        <p className="text-sm font-semibold text-admin-value">{summary.last_seen}</p>
                    </div>
                    <div className="p-4 bg-card-bg border border-pace-border rounded-xl shadow-sm">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Latest MAC</p>
                        <p className="text-xs font-mono text-gray-500">{summary.last_mac}</p>
                    </div>
                </div>
            )}

            {/* History Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap text-[11px]">
                        <thead className="bg-pace-bg-subtle border-b border-pace-border font-bold text-admin-dim uppercase tracking-widest text-[9px]">
                            <tr>
                                <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide text-[9px]">M-Pesa Code</th>
                                <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide text-[9px]">MAC Address</th>
                                <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide text-[9px]">Amount</th>
                                <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide text-[9px]">Router</th>
                                <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide text-[9px] text-center">Status</th>
                                <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide text-[9px] text-center">Used</th>
                                <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wide text-[9px] text-right">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading && history.length === 0 ? (
                                <TableRowSkeleton cols={7} rows={8} />
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <History size={32} className="opacity-20" />
                                            <p className="text-xs font-semibold uppercase tracking-wider">No history found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                history.map((item, index) => {
                                    const isLast = index === history.length - 1
                                    return (
                                        <tr
                                            key={`${item.id}-${index}`}
                                            ref={isLast ? lastElementRef : null}
                                            className="hover:bg-pace-bg-subtle transition-colors group"
                                        >
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs font-medium text-admin-dim uppercase tracking-tight">{item.code}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-gray-500">{item.mac}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-semibold text-admin-value">KES {item.amount}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-medium text-admin-dim">{item.router.replace(/_/g, ' ')}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge
                                                    variant={item.active ? 'success' : 'error'}
                                                    className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-2 py-0.5"
                                                >
                                                    {item.active ? 'Active' : 'Expired'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge
                                                    variant={item.used ? 'success' : 'error'}
                                                    className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-2 py-0.5"
                                                >
                                                    {item.used ? 'Yes' : 'No'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight">
                                                        {item.created}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-pace-purple/70 uppercase tracking-wide">
                                                        Exp: {item.expires}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}

                            {isLoadingMore && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-400 text-sm">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-pace-purple border-t-transparent rounded-full animate-spin"></div>
                                            Loading more history...
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!hasMore && history.length > 0 && (
                <div className="flex justify-center py-8 opacity-40">
                    <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
                        <CheckCircle2 size={12} className="text-green-500" />
                        End of history
                    </div>
                </div>
            )}

            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                description={modal.description}
                type={modal.type}
                confirmText={modal.confirmText || 'Confirm'}
                onConfirm={modal.onConfirm}
                isLoading={isBlockLoading}
                showCancel={modal.showCancel !== false}
            />
        </div>
    )
}

export default function CustomerHistoryPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-pace-purple border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CustomerHistoryContent />
        </Suspense>
    )
}
