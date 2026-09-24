"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, RefreshCw, Users, ShieldCheck, CreditCard, Network, ArrowUpRight, LifeBuoy, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { TablePageSkeleton } from '@/components/Skeleton'
import { activeConnectionsService } from '@/services/isp/activeConnections'

function ActiveUsersContent() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [entries, setEntries] = useState([])
    const [search, setSearch] = useState('')
    const [isRefreshing, setIsRefreshing] = useState(false)

    const loadEntries = async (searchTerm = search) => {
        try {
            const response = await activeConnectionsService.getActiveConnections({
                search: searchTerm,
                limit: 100
            })

            if (response?.status === 'success') {
                setEntries(response.data || [])
            } else {
                setEntries([])
            }
        } catch (error) {
            console.error("Failed to load active subscribers", error)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        setIsLoading(true)
        const timer = setTimeout(() => {
            loadEntries(search)
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const handleRefresh = () => {
        setIsRefreshing(true)
        loadEntries(search)
    }

    if (isLoading && entries.length === 0) {
        return <TablePageSkeleton />
    }

    const totalActive = entries.length
    const totalRevenuePaid = entries.reduce((acc, curr) => acc + Number(curr.totalPaid || 0), 0)

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Active Users</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">
                        Real-time active subscribers, PPPoE credentials, QoS profiles, payment history, and account balances
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all text-xs font-semibold disabled:opacity-50"
                        title="Refresh active users"
                    >
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search by name, username, phone, account…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
                <button 
                   onClick={handleRefresh}
                   disabled={isRefreshing}
                   className="flex items-center gap-2 px-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                   title="Refresh active users"
                >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* Main Data Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-3">Subscriber Identity</th>
                                <th className="px-6 py-3">MikroTik Gateway</th>
                                <th className="px-6 py-3">Service QoS Plan</th>
                                <th className="px-6 py-3 text-right">Plan Rate</th>
                                <th className="px-6 py-3">Latest M-Pesa Payment</th>
                                <th className="px-6 py-3 text-center">Renewal Expiry</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {entries.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-20 text-center text-admin-dim text-sm font-medium">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Users size={28} className="text-gray-300" />
                                            <p className="font-semibold text-admin-value">No active subscribers found</p>
                                            <p className="text-xs text-gray-400">All suspended or disabled users are excluded from this list.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                entries.map((user) => {
                                    const hasPayment = Boolean(user.lastReceipt || user.lastPaymentAmount);
                                    return (
                                        <tr key={user.id} className="hover:bg-pace-bg-subtle/50 transition-colors group">
                                            {/* Subscriber Identity */}
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-admin-value group-hover:text-pace-purple transition-colors">
                                                        {user.name}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-mono font-bold text-pace-purple">
                                                            {user.username}
                                                        </span>
                                                        <span className="text-[10px] text-gray-300">•</span>
                                                        <span className="text-[10px] text-admin-dim font-mono">
                                                            Acc: {user.accountNumber || user.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Router / NAS */}
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-semibold text-admin-value font-mono">
                                                        {user.router || 'Default Router'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* QoS Plan & Bandwidth */}
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-admin-value">
                                                        {user.plan || 'Standard Plan'}
                                                    </span>
                                                    {user.bandwidth && (
                                                        <span className="text-[10px] text-pace-purple font-mono font-bold">
                                                            {user.bandwidth}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Plan Rate & Balance */}
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-admin-value font-mono">
                                                        KES {Number(user.price || 0).toLocaleString()}
                                                    </span>
                                                    <span className="text-[9px] text-admin-dim font-medium">
                                                        Total Paid: KES {Number(user.totalPaid || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Latest M-Pesa Payment */}
                                            <td className="px-6 py-3">
                                                {hasPayment ? (
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-bold text-emerald-600 font-mono">
                                                                KES {Number(user.lastPaymentAmount || 0).toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 px-1.5 py-0.2 rounded">
                                                                {user.lastReceipt}
                                                            </span>
                                                        </div>
                                                        {user.lastPaymentDate && (
                                                            <span className="text-[9px] text-admin-dim font-medium mt-0.5">
                                                                {user.lastPaymentDate}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-medium text-admin-dim">
                                                            Setup Balance: KES {Number(user.balance || 0).toLocaleString()}
                                                        </span>
                                                        <span className="text-[9px] text-gray-400 italic">No M-Pesa tx yet</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Renewal Due Date */}
                                            <td className="px-6 py-3 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-semibold text-admin-value font-mono">
                                                        {user.nextPayment ? user.nextPayment.split(' ')[0] : 'N/A'}
                                                    </span>
                                                    <span className="text-[9px] text-emerald-600 font-medium">
                                                        Active Session
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Connection Status */}
                                            <td className="px-6 py-3 text-center">
                                                <Badge className="border-none px-2.5 py-0.5 text-[8px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-600">
                                                    Active
                                                </Badge>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link 
                                                        href={`/dashboard/tickets?customer=${encodeURIComponent(user.name)}`}
                                                        className="p-1.5 text-admin-dim hover:text-orange-500 hover:bg-orange-500/5 rounded-lg transition-all"
                                                        title="Open Support Ticket"
                                                    >
                                                        <LifeBuoy size={14} />
                                                    </Link>
                                                    <Link 
                                                        href="/dashboard/customers"
                                                        className="p-1.5 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-lg transition-all"
                                                        title="View in Subscribers"
                                                    >
                                                        <ArrowUpRight size={14} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function ActiveUsersPage() {
    return (
        <Suspense fallback={<TablePageSkeleton />}>
            <ActiveUsersContent />
        </Suspense>
    )
}
