"use client";

import React, { useState, useEffect, Suspense } from 'react'
import { Search, Filter, Download, CreditCard, Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, MoreHorizontal, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { TableRowSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { financeService } from '@/services/isp/finance'
import { toast } from 'sonner'

function PaymentsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [transactions, setTransactions] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [totalExpenses, setTotalExpenses] = useState(0)

    const fetchLedger = async () => {
        try {
            setIsLoading(true)
            const [txRes, expRes] = await Promise.all([
                financeService.getTransactions(),
                financeService.getExpenses()
            ])

            const txList = txRes?.status === 'success' ? (txRes.transactions || []) : []
            const expList = expRes?.status === 'success' ? (expRes.expenses || []) : []

            const unifiedExpenses = expList.map(e => ({
                id: `exp-${e.id}`,
                customer: e.title,
                plan: `Category: ${e.category}`,
                amount: -Math.abs(e.amount),
                date: e.date,
                method: 'Direct Expense',
                receipt: `EXP-${e.id}`,
                status: 'Success'
            }))

            const allTransactions = [...txList, ...unifiedExpenses].sort((a, b) => new Date(b.date) - new Date(a.date))

            const rev = txList.reduce((acc, t) => acc + (t.amount > 0 ? t.amount : 0), 0)
            const exp = expList.reduce((acc, e) => acc + (e.amount || 0), 0)

            setTransactions(allTransactions)
            setTotalRevenue(rev)
            setTotalExpenses(exp)
        } catch (err) {
            console.error("Error loading ledger:", err)
            toast.error('Failed to load live ledger data')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLedger()
    }, [])

    const filtered = transactions.filter(t =>
        t.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.receipt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.method?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return <TablePageSkeleton />
    }

    const netBalance = totalRevenue - totalExpenses

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <CreditCard size={18} className="text-green-600" />
                        </div>
                        Financial Transactions
                    </h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Live unified payment and expense ledger</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={fetchLedger}
                        disabled={isLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 text-xs font-semibold cursor-pointer"
                        title="Refresh transactions"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        <span>Refresh Ledger</span>
                    </button>
                    <button 
                        onClick={() => toast.success('Transactions exported', { description: 'CSV format ready.' })}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:bg-pace-purple/90 transition-all text-xs font-semibold shadow-sm active:scale-95 cursor-pointer"
                    >
                        <Download size={15} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title="Total Revenue">
                                Total Revenue
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                                KES {totalRevenue.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-admin-dim mt-0.5 truncate">Subscriber Collections</p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-emerald-500/10 group-hover:border-emerald-500/30 bg-emerald-500/5 transition-all duration-300 shrink-0 group-hover:scale-105">
                            <ArrowUpRight className="text-emerald-500 w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-red-500" />
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title="Total Expenses">
                                Total Expenses
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                                KES {totalExpenses.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-admin-dim mt-0.5 truncate">Direct ISP Outflows</p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-rose-500/10 group-hover:border-rose-500/30 bg-rose-500/5 transition-all duration-300 shrink-0 group-hover:scale-105">
                            <ArrowDownLeft className="text-rose-500 w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pace-purple to-indigo-500" />
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title="Net Balance">
                                Net Balance
                            </p>
                            <p className={cn("text-xl sm:text-2xl font-bold mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate", netBalance >= 0 ? "text-pace-purple" : "text-rose-600")}>
                                KES {netBalance.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-admin-dim mt-0.5 truncate">Live synchronized</p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-pace-purple/10 group-hover:border-pace-purple/30 bg-pace-purple/5 transition-all duration-300 shrink-0 group-hover:scale-105">
                            <Clock className="text-pace-purple w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Filter by customer, category or receipt..."
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
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center text-admin-dim text-sm font-medium">No transactions found.</td>
                                </tr>
                            ) : (
                                filtered.map((t) => (
                                    <tr key={t.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                        <td className="px-6 py-2.5">
                                            <span className="font-semibold text-admin-value text-xs tabular-nums">{t.date}</span>
                                        </td>
                                        <td className="px-6 py-2.5">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-admin-value text-xs group-hover:text-pace-purple transition-colors">{t.customer}</span>
                                                <span className="text-[10px] font-medium text-admin-dim">{t.plan}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2.5 text-center">
                                            <Badge variant="secondary" className="text-[10px] font-medium border-none">
                                                {t.method}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-2.5">
                                            <span className="font-mono text-[11px] font-semibold text-admin-dim tracking-tight">{t.receipt}</span>
                                        </td>
                                        <td className="px-6 py-2.5 text-right">
                                            <span className={cn(
                                                "font-bold text-xs tabular-nums",
                                                t.amount > 0 ? "text-green-600" : "text-rose-500"
                                            )}>
                                                {t.amount > 0 ? '+' : ''}KES {Math.abs(t.amount).toLocaleString()}
                                            </span>
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

export default function PaymentsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Syncing transactions...</div>}>
            <PaymentsContent />
        </Suspense>
    )
}
