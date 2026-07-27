"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Wallet, Search, Filter, Download, CreditCard, Clock, User, CheckCircle2, Activity } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { TableRowSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function MpesaContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [payments, setPayments] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            setPayments(mockDashboardData.recentPayments)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const filteredPayments = payments.filter(p => 
        p.customer?.toLowerCase().includes(search.toLowerCase()) ||
        p.receipt?.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) {
        return <TablePageSkeleton />
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-pace-purple/10 flex items-center justify-center">
                            <Wallet size={18} className="text-pace-purple" />
                        </div>
                        M-Pesa Ledger
                    </h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Real-time C2B/B2C reconciliation matrix</p>
                </div>
                <button 
                    onClick={() => toast.info('Audit Report Requested', { description: 'Generating secure data export...' })}
                    className="flex items-center gap-2 px-5 py-2.5 bg-card-bg border border-pace-border text-admin-dim rounded-xl hover:text-pace-purple hover:border-pace-purple transition-all text-sm font-medium shadow-sm active:scale-95"
                >
                    <Download size={16} />
                    <span>Export Ledger</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 border border-pace-border rounded-xl bg-card-bg group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim tracking-wider mb-1 uppercase">Today's Revenue</p>
                    <h3 className="text-2xl font-bold text-admin-value tabular-nums">KES {mockDashboardData.stats.totalRevenueToday.toLocaleString()}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-green-600 font-medium">
                        <Activity size={12} /> +12% vs yesterday
                    </div>
                </div>
                <div className="p-5 border border-pace-border rounded-xl bg-card-bg group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim tracking-wider mb-1 uppercase">Transaction Count</p>
                    <h3 className="text-2xl font-bold text-admin-value tabular-nums">{mockDashboardData.stats.todayPayments}</h3>
                    <p className="text-[11px] font-medium text-admin-dim mt-2">Successful completions</p>
                </div>
                <div className="p-5 border border-pace-border rounded-xl bg-card-bg group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim tracking-wider mb-1 uppercase">Active Paybill</p>
                    <h3 className="text-2xl font-bold text-pace-purple tabular-nums">{mockDashboardData.stats.paybill}</h3>
                    <p className="text-[11px] font-medium text-admin-dim mt-2">Disbursement node</p>
                </div>

            </div>

            {/* Controls */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Search receipt or customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                />
            </div>

            {/* Transaction Matrix */}
            <div className="overflow-hidden bg-card-bg border border-pace-border rounded-xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Customer Identity</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">M-Pesa Receipt</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center text-admin-dim text-sm font-medium">No records found in financial pool</td>
                                </tr>
                            ) : (
                                filteredPayments.map((pay) => (
                                    <tr key={pay.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                        <td className="px-6 py-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-pace-bg-subtle border border-pace-border flex items-center justify-center text-admin-dim group-hover:text-pace-purple transition-colors">
                                                    <User size={13} />
                                                </div>
                                                <span className="text-xs font-semibold text-admin-value">{pay.customer}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2">
                                            <span className="text-[11px] font-semibold text-pace-purple font-mono tracking-tight">{pay.receipt}</span>
                                        </td>
                                        <td className="px-6 py-2">
                                            <span className="text-xs font-bold text-admin-value tabular-nums">KES {Number(pay.amount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex items-center gap-2 text-admin-dim">
                                                <Clock size={12} />
                                                <span className="text-[10px] font-medium">{pay.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 text-center">
                                            <Badge variant={pay.status === 'Success' ? 'success' : 'warning'} className="text-[10px] font-medium border-none">
                                                {pay.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function MpesaPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Syncing M-Pesa ledger...</div>}>
            <MpesaContent />
        </Suspense>
    )
}
