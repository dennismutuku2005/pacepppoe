"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { 
    Search, Download, CreditCard, ArrowUpRight, ArrowDownLeft, 
    RefreshCw, Clock, Wallet, Building, Store, Filter, Eye, Copy, 
    Check, Phone, User, Calendar, Tag, ShieldCheck, AlertCircle, FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { TablePageSkeleton } from '@/components/Skeleton'
import { financeService } from '@/services/isp/finance'
import { toast } from 'sonner'

function PaymentsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [ledger, setLedger] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('all') // 'all' | 'in' | 'out'

    // Transaction Detail Modal
    const [selectedTx, setSelectedTx] = useState(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const fetchLedger = async (isManual = false) => {
        try {
            if (isManual) setIsRefreshing(true)
            else setIsLoading(true)

            // Fetch from wallet API (which aggregates mpesa_transactions, withdrawals, and expenses)
            const walletRes = await financeService.getWallet()
            
            let unifiedLedger = []

            if (walletRes?.status === 'success' && Array.isArray(walletRes?.data?.history)) {
                unifiedLedger = walletRes.data.history.map(item => {
                    const isDeposit = item.type === 'deposit'
                    const isWithdrawal = item.type === 'withdrawal'
                    const isExpense = item.type === 'expense'

                    const direction = isDeposit ? 'in' : 'out'
                    const amount = Number(item.amount || 0)
                    const fee = Number(item.transaction_cost || 0)

                    return {
                        id: item.id || `${item.type}-${item.reference}`,
                        type: item.type,
                        direction, // 'in' | 'out'
                        description: item.description || (isDeposit ? 'Subscriber Payment' : (isWithdrawal ? 'Wallet Withdrawal' : 'Operational Expense')),
                        category: isDeposit ? 'Subscriber Collection' : (isWithdrawal ? 'Revenue Payout' : 'Operational Expense'),
                        channel: item.channel || (isDeposit ? 'M-Pesa' : (isWithdrawal ? 'Payout' : 'Expense')),
                        reference: item.reference || '—',
                        amount: amount,
                        fee: fee,
                        netAmount: isWithdrawal ? (amount - fee) : amount,
                        date: item.created_at || item.date || '—',
                        status: item.status || 'completed',
                        paybillNumber: item.paybill_number || '',
                        accountNumber: item.account_number || '',
                        tillNumber: item.till_number || '',
                        phone: item.phone || '',
                        remarks: item.remarks || item.notes || item.description || '',
                        conversationId: item.conversation_id || '',
                        originatorConversationId: item.originator_conversation_id || '',
                        responseDescription: item.response_description || ''
                    }
                })
            } else {
                // Fallback parallel fetch
                const [txRes, expRes] = await Promise.allSettled([
                    financeService.getTransactions(),
                    financeService.getExpenses()
                ])

                const txList = txRes.status === 'fulfilled' && txRes.value?.transactions ? txRes.value.transactions : []
                const expList = expRes.status === 'fulfilled' && expRes.value?.expenses ? expRes.value.expenses : []

                const mappedInflows = txList.map(t => ({
                    id: `tx-${t.id}`,
                    type: 'deposit',
                    direction: 'in',
                    description: t.customer ? `${t.customer} (${t.plan || 'M-Pesa'})` : 'Subscriber Payment',
                    category: 'Subscriber Collection',
                    channel: t.method || 'M-Pesa',
                    reference: t.receipt || '—',
                    amount: Number(t.amount || 0),
                    fee: 0,
                    netAmount: Number(t.amount || 0),
                    date: t.date || '—',
                    status: t.status || 'completed',
                    phone: t.phone || '',
                    customerName: t.customer || ''
                }))

                const mappedExpenses = expList.map(e => ({
                    id: `exp-${e.id}`,
                    type: 'expense',
                    direction: 'out',
                    description: e.title || e.description || 'Operational Expense',
                    category: `Expense: ${e.category || 'General'}`,
                    channel: 'Expense',
                    reference: `EXP-${e.id}`,
                    amount: Number(e.amount || 0),
                    fee: 0,
                    netAmount: Number(e.amount || 0),
                    date: e.date || '—',
                    status: 'completed'
                }))

                unifiedLedger = [...mappedInflows, ...mappedExpenses]
            }

            // Sort by latest date
            unifiedLedger.sort((a, b) => new Date(b.date) - new Date(a.date))
            setLedger(unifiedLedger)

        } catch (err) {
            console.error("Error loading transaction ledger:", err)
            toast.error('Failed to load transaction records')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchLedger()
    }, [])

    // Metrics calculations
    const totalInflow = useMemo(() => {
        return ledger
            .filter(t => t.direction === 'in')
            .reduce((acc, t) => acc + Number(t.amount || 0), 0)
    }, [ledger])

    const totalOutflow = useMemo(() => {
        return ledger
            .filter(t => t.direction === 'out')
            .reduce((acc, t) => acc + Number(t.amount || 0), 0)
    }, [ledger])

    const netCashflow = totalInflow - totalOutflow

    // Filtering
    const filteredLedger = useMemo(() => {
        return ledger.filter(item => {
            const matchesTab = activeTab === 'all' || item.direction === activeTab
            const term = searchTerm.toLowerCase().trim()
            const matchesSearch = !term ||
                item.description?.toLowerCase().includes(term) ||
                item.reference?.toLowerCase().includes(term) ||
                item.channel?.toLowerCase().includes(term) ||
                item.category?.toLowerCase().includes(term) ||
                item.date?.toLowerCase().includes(term)

            return matchesTab && matchesSearch
        })
    }, [ledger, activeTab, searchTerm])

    // Copy reference
    const handleCopy = (text) => {
        if (!text || text === '—') return
        navigator.clipboard.writeText(text)
        setIsCopied(true)
        toast.success('Reference code copied to clipboard')
        setTimeout(() => setIsCopied(false), 2000)
    }

    // Open detail
    const handleOpenDetail = (tx) => {
        setSelectedTx(tx)
        setIsDetailOpen(true)
    }

    // Export CSV
    const exportCSV = () => {
        if (filteredLedger.length === 0) {
            toast.error('No transactions to export')
            return
        }

        const headers = ["ID", "Type", "Direction", "Description", "Channel", "Reference", "Amount (KES)", "Fee (KES)", "Date", "Status"]
        const rows = filteredLedger.map(t => [
            t.id,
            t.type,
            t.direction === 'in' ? 'Inflow' : 'Outflow',
            `"${(t.description || '').replace(/"/g, '""')}"`,
            t.channel,
            t.reference,
            t.amount,
            t.fee,
            t.date,
            t.status
        ])

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `transactions_ledger_${new Date().toISOString().slice(0,10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Transactions exported to CSV')
    }

    if (isLoading) {
        return <TablePageSkeleton />
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-pace-purple/10 flex items-center justify-center">
                            <CreditCard size={18} className="text-pace-purple" />
                        </div>
                        Financial Transactions
                    </h1>
                    <p className="text-xs font-normal text-gray-400 mt-1">
                        Unified ledger showing all incoming collections and outgoing disbursements. Click any transaction for full audit details.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={() => fetchLedger(true)}
                        disabled={isRefreshing}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 text-xs font-medium cursor-pointer"
                        title="Refresh transactions"
                    >
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>
                    <button 
                        onClick={exportCSV}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:bg-pace-purple/90 transition-all text-xs font-medium shadow-sm active:scale-95 cursor-pointer"
                    >
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Collections / Inflows */}
                <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate">
                                Total Inflows (IN)
                            </p>
                            <p className="text-xl sm:text-2xl font-semibold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                                KES {totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">Subscriber M-Pesa deposits</p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-emerald-500/10 group-hover:border-emerald-500/30 bg-emerald-500/5 transition-all duration-300 shrink-0 group-hover:scale-105">
                            <ArrowUpRight className="text-emerald-500 w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Total Outflows / Withdrawals & Expenses */}
                <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-red-500" />
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate">
                                Total Outflows (OUT)
                            </p>
                            <p className="text-xl sm:text-2xl font-semibold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                                KES {totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">Payouts, withdrawals &amp; expenses</p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-rose-500/10 group-hover:border-rose-500/30 bg-rose-500/5 transition-all duration-300 shrink-0 group-hover:scale-105">
                            <ArrowDownLeft className="text-rose-500 w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Net Cashflow */}
                <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pace-purple to-indigo-500" />
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate">
                                Net Cashflow
                            </p>
                            <p className={cn(
                                "text-xl sm:text-2xl font-semibold mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate",
                                netCashflow >= 0 ? "text-pace-purple" : "text-rose-600"
                            )}>
                                KES {netCashflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">Total Inflows − Total Outflows</p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-pace-purple/10 group-hover:border-pace-purple/30 bg-pace-purple/5 transition-all duration-300 shrink-0 group-hover:scale-105">
                            <Wallet className="text-pace-purple w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls: Search & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search by customer, description, receipt, channel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-normal text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-pace-bg-subtle border border-pace-border rounded-xl p-1 text-xs">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                            activeTab === 'all' ? "bg-card-bg text-admin-value shadow-xs" : "text-admin-dim hover:text-admin-value"
                        )}
                    >
                        All ({ledger.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('in')}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                            activeTab === 'in' ? "bg-card-bg text-emerald-600 shadow-xs font-semibold" : "text-admin-dim hover:text-admin-value"
                        )}
                    >
                        <ArrowUpRight size={13} className="text-emerald-500" />
                        Transactions In ({ledger.filter(l => l.direction === 'in').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('out')}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                            activeTab === 'out' ? "bg-card-bg text-rose-600 shadow-xs font-semibold" : "text-admin-dim hover:text-admin-value"
                        )}
                    >
                        <ArrowDownLeft size={13} className="text-rose-500" />
                        Transactions Out ({ledger.filter(l => l.direction === 'out').length})
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap text-xs">
                        <thead>
                            <tr className="bg-pace-bg-subtle/70 border-b border-pace-border text-xs font-medium text-admin-dim">
                                <th className="px-4 py-3.5">Transaction &amp; Beneficiary</th>
                                <th className="px-4 py-3.5 text-center">Flow</th>
                                <th className="px-4 py-3.5">Payment Method</th>
                                <th className="px-4 py-3.5">Reference / Receipt</th>
                                <th className="px-4 py-3.5">Date &amp; Time</th>
                                <th className="px-4 py-3.5 text-right">Amount</th>
                                <th className="px-4 py-3.5 text-center">Status</th>
                                <th className="px-4 py-3.5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredLedger.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-20 text-center text-gray-400 text-xs font-normal">
                                        No financial transactions matching the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredLedger.map((t) => {
                                    const isInflow = t.direction === 'in'
                                    return (
                                        <tr 
                                            key={t.id} 
                                            onClick={() => handleOpenDetail(t)}
                                            className="hover:bg-pace-bg-subtle/50 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-xl flex items-center justify-center border shrink-0",
                                                        isInflow 
                                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/15" 
                                                            : "bg-rose-500/10 text-rose-600 border-rose-500/15"
                                                    )}>
                                                        {isInflow ? <ArrowUpRight size={15} /> : <ArrowDownLeft size={15} />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-admin-value truncate">{t.description}</p>
                                                        <p className="text-[11px] text-gray-400">{t.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className={cn(
                                                    "text-[10px] font-medium px-2 py-0.5 rounded-md inline-flex items-center gap-1",
                                                    isInflow 
                                                        ? "bg-emerald-500/10 text-emerald-600" 
                                                        : "bg-rose-500/10 text-rose-600"
                                                )}>
                                                    {isInflow ? 'IN (Collection)' : 'OUT (Disbursement)'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-[11px] font-normal text-admin-dim bg-pace-bg-subtle border border-pace-border px-2.5 py-1 rounded-lg">
                                                    {t.channel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="font-mono text-xs font-medium text-admin-value">
                                                    {t.reference}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="font-mono text-[11px] text-gray-400">
                                                    {t.date}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <span className={cn(
                                                    "font-semibold text-xs tabular-nums font-mono block",
                                                    isInflow ? "text-emerald-600" : "text-rose-600"
                                                )}>
                                                    {isInflow ? '+' : '-'}KES {Number(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                {t.fee > 0 && (
                                                    <span className="text-[10px] text-gray-400 font-mono block">Fee: KES {Number(t.fee).toFixed(2)}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <Badge 
                                                    variant={t.status === 'completed' || t.status === 'Success' ? 'success' : (t.status === 'pending' ? 'warning' : 'neutral')} 
                                                    className="text-[10px] font-medium border-none px-2.5 py-0.5 capitalize"
                                                >
                                                    {t.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleOpenDetail(t)
                                                    }}
                                                    className="p-1.5 rounded-lg text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 transition-colors"
                                                    title="View Transaction Details"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* TRANSACTION AUDIT DETAIL MODAL */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Transaction Details"
                description="Complete financial audit and ledger record."
                maxWidth="max-w-lg"
            >
                {selectedTx && (
                    <div className="space-y-4 pt-1 font-figtree">
                        {/* Amount & Direction Top Banner */}
                        <div className={cn(
                            "p-4 rounded-2xl border flex items-center justify-between",
                            selectedTx.direction === 'in' 
                                ? "bg-emerald-500/5 border-emerald-500/20" 
                                : "bg-rose-500/5 border-rose-500/20"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
                                    selectedTx.direction === 'in' 
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                        : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                )}>
                                    {selectedTx.direction === 'in' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                </div>
                                <div>
                                    <span className="text-[11px] font-medium text-gray-400 block uppercase tracking-wider">
                                        {selectedTx.direction === 'in' ? 'Incoming Collection' : 'Outgoing Disbursement'}
                                    </span>
                                    <span className={cn(
                                        "text-xl sm:text-2xl font-bold font-mono tracking-tight",
                                        selectedTx.direction === 'in' ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {selectedTx.direction === 'in' ? '+' : '-'}KES {Number(selectedTx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <Badge 
                                variant={selectedTx.status === 'completed' || selectedTx.status === 'Success' ? 'success' : (selectedTx.status === 'pending' ? 'warning' : 'neutral')}
                                className="px-3 py-1 text-xs font-semibold capitalize"
                            >
                                {selectedTx.status}
                            </Badge>
                        </div>

                        {/* Summary Grid */}
                        <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-2xl space-y-3 text-xs">
                            {/* Reference Number with Copy */}
                            <div className="flex items-center justify-between py-1 border-b border-pace-border/60">
                                <span className="text-gray-400">Reference / Receipt:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-semibold text-admin-value">{selectedTx.reference}</span>
                                    {selectedTx.reference !== '—' && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(selectedTx.reference)}
                                            className="p-1 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 rounded transition-colors cursor-pointer"
                                            title="Copy reference code"
                                        >
                                            {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Payment Channel */}
                            <div className="flex items-center justify-between py-1 border-b border-pace-border/60">
                                <span className="text-gray-400">Payment Channel:</span>
                                <span className="font-medium text-admin-value bg-card-bg border border-pace-border px-2.5 py-0.5 rounded-lg">
                                    {selectedTx.channel}
                                </span>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-center justify-between py-1 border-b border-pace-border/60">
                                <span className="text-gray-400">Date &amp; Timestamp:</span>
                                <span className="font-mono text-admin-value font-medium">{selectedTx.date}</span>
                            </div>

                            {/* Fee Breakdown if applicable */}
                            {selectedTx.fee > 0 && (
                                <>
                                    <div className="flex items-center justify-between py-1 border-b border-pace-border/60">
                                        <span className="text-gray-400">Transaction Tariff / Fee:</span>
                                        <span className="font-mono text-amber-600 font-semibold">
                                            KES {Number(selectedTx.fee).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-pace-border/60">
                                        <span className="text-gray-400">Net Disbursed Amount:</span>
                                        <span className="font-mono text-admin-value font-semibold">
                                            KES {Number(selectedTx.netAmount || (selectedTx.amount - selectedTx.fee)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Description / Beneficiary */}
                            <div className="py-1">
                                <span className="text-gray-400 block mb-1">Details &amp; Description:</span>
                                <p className="font-medium text-admin-value bg-card-bg p-2.5 rounded-xl border border-pace-border break-words">
                                    {selectedTx.description}
                                </p>
                            </div>

                            {/* Destination specifics if withdrawal */}
                            {(selectedTx.paybillNumber || selectedTx.tillNumber) && (
                                <div className="py-1 border-t border-pace-border/60 pt-2">
                                    <span className="text-gray-400 block mb-1">Destination Target:</span>
                                    <div className="font-mono text-admin-value text-xs bg-card-bg p-2.5 rounded-xl border border-pace-border space-y-1">
                                        {selectedTx.tillNumber ? (
                                            <div>Buy Goods Till: <strong>{selectedTx.tillNumber}</strong></div>
                                        ) : (
                                            <>
                                                <div>Paybill: <strong>{selectedTx.paybillNumber}</strong></div>
                                                <div>Account: <strong>{selectedTx.accountNumber}</strong></div>
                                            </>
                                        )}
                                        {selectedTx.phone && <div>Contact Phone: {selectedTx.phone}</div>}
                                    </div>
                                </div>
                            )}

                            {/* Response / Result Description if present */}
                            {selectedTx.responseDescription && (
                                <div className="py-1 border-t border-pace-border/60 pt-2">
                                    <span className="text-gray-400 block mb-1">Provider Feedback:</span>
                                    <p className="text-[11px] font-mono text-admin-dim bg-card-bg p-2 rounded-lg border border-pace-border">
                                        {selectedTx.responseDescription}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-3 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => setIsDetailOpen(false)}
                                className="w-full sm:w-auto px-5 py-2.5 bg-pace-bg-subtle hover:bg-pace-purple/10 text-pace-purple border border-pace-border rounded-xl text-xs font-medium transition-all cursor-pointer"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default function PaymentsPage() {
    return (
        <Suspense fallback={<TablePageSkeleton />}>
            <PaymentsContent />
        </Suspense>
    )
}
