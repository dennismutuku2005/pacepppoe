"use client";

import React, { useState, useEffect, Suspense } from 'react'
import { Search, Filter, Download, CreditCard, Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { TableRowSkeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'

function PaymentsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [transactions, setTransactions] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            // Mix mpesa and other payments
            const allPayments = [
                ...mockDashboardData.recentPayments,
                { id: 101, customer: "Hardware Vendor", amount: -15000, date: "2026-05-06 10:00", method: "Bank Transfer", receipt: "TX-9988", plan: "Expense", status: "Success" },
                { id: 102, customer: "Office Supplies", amount: -2500, date: "2026-05-05 14:30", method: "Cash", receipt: "CS-1234", plan: "Expense", status: "Success" },
            ].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            setTransactions(allPayments)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const filtered = transactions.filter(t =>
        t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.receipt.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <CreditCard size={18} className="text-green-600" />
                        </div>
                        Financial Transactions
                    </h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Unified payment and expense ledger</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-pace-bg-subtle border border-pace-border text-admin-dim rounded-xl hover:text-pace-purple hover:border-pace-purple transition-all text-sm font-medium shadow-sm active:scale-95">
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card-bg border border-pace-border rounded-xl p-5 group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim uppercase tracking-wider mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-admin-value tabular-nums">KES 152,400</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-green-600 font-medium">
                        <ArrowUpRight size={12} /> +12% from last month
                    </div>
                </div>
                <div className="bg-card-bg border border-pace-border rounded-xl p-5 group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim uppercase tracking-wider mb-1">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-admin-value tabular-nums">KES 42,600</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-500 font-medium">
                        <ArrowDownLeft size={12} /> +5% from last month
                    </div>
                </div>
                <div className="bg-card-bg border border-pace-border rounded-xl p-5 group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim uppercase tracking-wider mb-1">Net Balance</p>
                    <h3 className="text-2xl font-bold text-pace-purple tabular-nums">KES 109,800</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-admin-dim font-medium">
                        <Clock size={12} /> Updated 2 mins ago
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Filter by customer or receipt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Transaction Date</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Beneficiary / Source</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-center">Method</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Receipt</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={5} rows={8} />
                            ) : filtered.map((t) => (
                                <tr key={t.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                    <td className="px-6 py-2">
                                        <span className="font-semibold text-admin-value text-xs tabular-nums">{t.date}</span>
                                    </td>
                                    <td className="px-6 py-2">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-admin-value text-xs group-hover:text-pace-purple transition-colors">{t.customer}</span>
                                            <span className="text-[10px] font-medium text-admin-dim">{t.plan}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 text-center">
                                        <Badge variant="secondary" className="text-[10px] font-medium border-none">
                                            {t.method}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-2">
                                        <span className="font-mono text-[11px] font-semibold text-admin-dim tracking-tight">{t.receipt}</span>
                                    </td>
                                    <td className="px-6 py-2 text-right">
                                        <span className={cn(
                                            "font-bold text-xs tabular-nums",
                                            t.amount > 0 ? "text-green-600" : "text-red-500"
                                        )}>
                                            {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function PaymentsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Syncing transactions...</div>}>
            <PaymentsContent />
        </Suspense>
    )
}
