"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { 
    Wallet, ArrowUpRight, ArrowDownLeft, Building, 
    CreditCard, Send, Edit2, ShieldCheck, History, 
    Landmark, Smartphone, Search, RefreshCw, CheckCircle2,
    Clock, DollarSign, AlertCircle, PlusCircle
} from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { financeService } from '@/services/isp/finance'
import { AdminCardSkeleton } from '@/components/Skeleton'

export default function IspWalletDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [wallet, setWallet] = useState({
    balance: 0.00,
    bankName: '',
    bankAccount: '',
    bankAccountName: '',
    bankBranch: '',
    mpesaNumber: '',
    history: []
  })

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'deposit' | 'withdrawal'
  const [search, setSearch] = useState('')

  // Modals Control
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isEditSettlementOpen, setIsEditSettlementOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Withdraw Form Fields
  const [withdrawChannel, setWithdrawChannel] = useState('mpesa')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawNotes, setWithdrawNotes] = useState('')

  // Edit Settlement Form Fields
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [bankBranch, setBankBranch] = useState('')
  const [mpesaNumber, setMpesaNumber] = useState('')

  const fetchWalletData = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true)
      else setIsLoading(true)

      const res = await financeService.getWallet()
      if (res && res.status === 'success' && res.data) {
        const data = res.data
        const bName = data.bankName || ''
        const bAcc = data.bankAccount || ''
        const bAccName = data.bankAccountName || ''
        const bBranch = data.bankBranch || ''
        const mpesa = data.mpesaNumber || ''

        setWallet({
          balance: Number(data.balance || 0),
          bankName: bName,
          bankAccount: bAcc,
          bankAccountName: bAccName,
          bankBranch: bBranch,
          mpesaNumber: mpesa,
          history: Array.isArray(data.history) ? data.history : []
        })

        setBankName(bName)
        setBankAccount(bAcc)
        setBankAccountName(bAccName)
        setBankBranch(bBranch)
        setMpesaNumber(mpesa)

        // Default withdrawal channel to available method
        if (mpesa) {
          setWithdrawChannel('mpesa')
        } else if (bAcc) {
          setWithdrawChannel('bank')
        }
      }
    } catch (err) {
      console.error("Error loading wallet:", err)
      toast.error('Failed to load wallet records')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [])

  // Aggregate stats from history
  const totalInflows = useMemo(() => {
    return (wallet.history || [])
      .filter(h => h.type === 'deposit')
      .reduce((acc, h) => acc + Number(h.amount || 0), 0)
  }, [wallet.history])

  const totalWithdrawals = useMemo(() => {
    return (wallet.history || [])
      .filter(h => h.type === 'withdrawal')
      .reduce((acc, h) => acc + Number(h.amount || 0), 0)
  }, [wallet.history])

  // Filtered History
  const filteredHistory = useMemo(() => {
    return (wallet.history || []).filter(tx => {
      const matchesTab = activeTab === 'all' || tx.type === activeTab
      const matchesSearch = 
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        tx.channel?.toLowerCase().includes(search.toLowerCase()) ||
        tx.date?.includes(search)
      return matchesTab && matchesSearch
    })
  }, [wallet.history, activeTab, search])

  // Handle Withdraw
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault()
    const amount = Number(withdrawAmount)
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount to withdraw.')
      return
    }

    if (amount > wallet.balance) {
      toast.error('Insufficient wallet balance.', {
        description: `You can withdraw up to KES ${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`
      })
      return
    }

    if (withdrawChannel === 'bank' && (!wallet.bankAccount || !wallet.bankName)) {
      toast.error('Bank account not configured', {
        description: 'Please add and save your Bank Name and Account Number first.'
      })
      setIsWithdrawOpen(false)
      setIsEditSettlementOpen(true)
      return
    }

    if (withdrawChannel === 'mpesa' && !wallet.mpesaNumber) {
      toast.error('M-Pesa number not configured', {
        description: 'Please add and save your M-Pesa mobile number first.'
      })
      setIsWithdrawOpen(false)
      setIsEditSettlementOpen(true)
      return
    }

    const channelLabel = withdrawChannel === 'bank' 
      ? `Bank: ${wallet.bankName} (${wallet.bankAccount})` 
      : `M-Pesa: ${wallet.mpesaNumber}`

    try {
      setIsSubmitting(true)
      const res = await financeService.withdrawWallet({
        amount,
        channel: withdrawChannel === 'bank' ? 'Bank Transfer' : 'M-Pesa Payout',
        notes: withdrawNotes || `Disbursement payout to ${channelLabel}`
      })

      if (res && res.status === 'success') {
        toast.success(`Withdrawal queued successfully.`, {
          description: `KES ${amount.toLocaleString()} sent to ${channelLabel}.`
        })
        setIsWithdrawOpen(false)
        setWithdrawAmount('')
        setWithdrawNotes('')
        fetchWalletData(true)
      } else {
        toast.error('Withdrawal failed', { description: res?.message })
      }
    } catch (err) {
      console.error("Error with payout:", err)
      toast.error('Failed to process withdrawal')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Settlement Edit
  const handleSettlementSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const res = await financeService.updateSettlement({
        bankName: bankName.trim(),
        bankAccount: bankAccount.trim(),
        bankAccountName: bankAccountName.trim(),
        bankBranch: bankBranch.trim(),
        mpesaNumber: mpesaNumber.trim()
      })

      if (res && res.status === 'success') {
        setWallet(prev => ({
          ...prev,
          bankName: bankName.trim(),
          bankAccount: bankAccount.trim(),
          bankAccountName: bankAccountName.trim(),
          bankBranch: bankBranch.trim(),
          mpesaNumber: mpesaNumber.trim()
        }))
        toast.success('Disbursement credentials updated successfully.')
        setIsEditSettlementOpen(false)
      } else {
        toast.error('Failed to update settlement details', { description: res?.message })
      }
    } catch (err) {
      console.error("Error updating settlement:", err)
      toast.error('Failed to save settlement settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 font-figtree max-w-[1600px] mx-auto pb-10">
        <div className="h-8 w-64 bg-pace-bg-subtle rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <AdminCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  const hasBank = Boolean(wallet.bankName && wallet.bankAccount)
  const hasMpesa = Boolean(wallet.mpesaNumber)

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pace-purple/10 flex items-center justify-center">
              <Wallet size={18} className="text-pace-purple" />
            </div>
            Wallet &amp; Payouts
          </h1>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Prepaid balance, automated subscriber collections, and settlement disbursements.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => fetchWalletData(true)}
            disabled={isRefreshing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all text-xs font-semibold disabled:opacity-50 cursor-pointer"
            title="Refresh balance"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh Wallet</span>
          </button>
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Send size={14} /> <span>Request Payout</span>
          </button>
        </div>
      </div>

      {/* Top 4 Standardized Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pace-purple to-indigo-500" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title="Available Balance">
                Available Balance
              </p>
              <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                KES {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-admin-dim mt-0.5 truncate">Ready for settlement</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-pace-purple/10 group-hover:border-pace-purple/30 bg-pace-purple/5 transition-all duration-300 shrink-0 group-hover:scale-105">
              <Wallet className="text-pace-purple w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Total Inflows */}
        <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title="Subscriber Inflows">
                Total Collections
              </p>
              <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                KES {totalInflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-admin-dim mt-0.5 truncate">M-Pesa deposits</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-emerald-500/10 group-hover:border-emerald-500/30 bg-emerald-500/5 transition-all duration-300 shrink-0 group-hover:scale-105">
              <ArrowUpRight className="text-emerald-500 w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Total Payouts */}
        <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-red-500" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title="Total Payouts">
                Total Disbursed
              </p>
              <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                KES {totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-admin-dim mt-0.5 truncate">Settled to bank/mobile</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-rose-500/10 group-hover:border-rose-500/30 bg-rose-500/5 transition-all duration-300 shrink-0 group-hover:scale-105">
              <ArrowDownLeft className="text-rose-500 w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Primary Destination */}
        <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-cyan-500" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title="Settlement Channel">
                Settlement Channel
              </p>
              <p className="text-sm font-bold text-admin-value mt-1.5 truncate">
                {hasBank ? wallet.bankName : (hasMpesa ? `M-Pesa (${wallet.mpesaNumber})` : 'Not Configured')}
              </p>
              <p className="text-[10px] text-admin-dim mt-0.5 truncate font-mono">
                {hasBank ? `A/C: ${wallet.bankAccount}` : (hasMpesa ? 'Mobile STK Payout' : 'Click Edit to setup')}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-blue-500/10 group-hover:border-blue-500/30 bg-blue-500/5 transition-all duration-300 shrink-0 group-hover:scale-105">
              <Landmark className="text-blue-500 w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Settlement Targets */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-admin-value uppercase tracking-wider">Settlement Routing</h3>
                <p className="text-[10px] text-admin-dim mt-0.5">Primary disbursement credentials</p>
              </div>
              <button
                onClick={() => setIsEditSettlementOpen(true)}
                className="text-xs text-pace-purple hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit2 size={12} /> Edit
              </button>
            </div>

            <div className="space-y-3">
              {/* Bank Account Details */}
              <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-card-bg border border-pace-border flex items-center justify-center text-admin-dim shrink-0 mt-0.5">
                    <Landmark size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider">Bank Account</p>
                    {hasBank ? (
                      <>
                        <p className="text-xs font-semibold text-admin-value mt-0.5 truncate">{wallet.bankName}</p>
                        <p className="text-[11px] font-mono text-pace-purple font-medium mt-0.5">A/C: {wallet.bankAccount}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                          {wallet.bankAccountName ? wallet.bankAccountName : 'Account Holder'}{wallet.bankBranch ? ` · ${wallet.bankBranch}` : ''}
                        </p>
                      </>
                    ) : (
                      <div className="mt-1">
                        <p className="text-xs text-amber-600 font-medium">No bank account linked</p>
                        <button
                          onClick={() => setIsEditSettlementOpen(true)}
                          className="text-[10px] text-pace-purple font-semibold hover:underline mt-0.5 cursor-pointer flex items-center gap-1"
                        >
                          <PlusCircle size={10} /> Add Bank Credentials
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* M-Pesa Details */}
              <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-card-bg border border-pace-border flex items-center justify-center text-admin-dim shrink-0 mt-0.5">
                    <Smartphone size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider">Mobile Payout</p>
                    <p className="text-xs font-semibold text-admin-value mt-0.5">M-Pesa STK Disbursement</p>
                    {hasMpesa ? (
                      <>
                        <p className="text-[11px] font-mono text-emerald-600 font-medium mt-0.5">{wallet.mpesaNumber}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Instant settlement channel</p>
                      </>
                    ) : (
                      <div className="mt-1">
                        <p className="text-xs text-amber-600 font-medium">No M-Pesa number linked</p>
                        <button
                          onClick={() => setIsEditSettlementOpen(true)}
                          className="text-[10px] text-pace-purple font-semibold hover:underline mt-0.5 cursor-pointer flex items-center gap-1"
                        >
                          <PlusCircle size={10} /> Link M-Pesa Number
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsWithdrawOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-semibold text-admin-value hover:border-pace-purple hover:text-pace-purple transition-all cursor-pointer"
              >
                <Send size={13} />
                <span>Initiate Settlement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction History Table */}
        <div className="lg:col-span-8 bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-admin-value uppercase tracking-wider">Wallet Audit Ledger</h3>
              <p className="text-[10px] text-admin-dim mt-0.5">Real-time ledger of subscriber payments and disbursements</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-pace-bg-subtle border border-pace-border rounded-xl p-1 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeTab === 'all' ? "bg-card-bg text-admin-value shadow-xs" : "text-admin-dim hover:text-admin-value"
                )}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('deposit')}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeTab === 'deposit' ? "bg-card-bg text-emerald-600 shadow-xs" : "text-admin-dim hover:text-admin-value"
                )}
              >
                Inflows
              </button>
              <button
                onClick={() => setActiveTab('withdrawal')}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  activeTab === 'withdrawal' ? "bg-card-bg text-rose-600 shadow-xs" : "text-admin-dim hover:text-admin-value"
                )}
              >
                Payouts
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative group max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
            <input
              type="text"
              placeholder="Search by description, channel or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
            />
          </div>

          {/* Ledger List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead>
                <tr className="bg-pace-bg-subtle/50 border-b border-pace-border text-[10px] font-bold text-admin-dim uppercase tracking-wider">
                  <th className="px-4 py-3">Event Identity</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pace-border">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-admin-dim text-xs font-medium">
                      No wallet transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((tx, idx) => {
                    const isDeposit = tx.type === 'deposit'
                    return (
                      <tr key={tx.id || idx} className="hover:bg-pace-bg-subtle/40 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center border shrink-0",
                              isDeposit 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" 
                                : "bg-rose-500/10 text-rose-600 border-rose-500/10"
                            )}>
                              {isDeposit ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                            </div>
                            <span className="font-semibold text-admin-value">{tx.description}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-semibold text-admin-dim uppercase tracking-wider bg-pace-bg-subtle border border-pace-border px-2 py-0.5 rounded-md">
                            {tx.channel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] text-admin-dim">{tx.date}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "font-bold text-xs tabular-nums font-mono",
                            isDeposit ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {isDeposit ? '+' : '-'}KES {Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="success" className="text-[9px] font-bold uppercase border-none px-2 py-0.5">
                            {tx.status || 'Completed'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* REQUEST WITHDRAWAL MODAL */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="Request Revenue Settlement"
        description="Transfer your available balance to your bank account or M-Pesa mobile number."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4 pt-2 font-figtree">
          <div className="p-3.5 bg-pace-purple/5 border border-pace-purple/15 rounded-xl flex justify-between items-center text-xs">
            <span className="text-admin-dim font-medium">Available Balance:</span>
            <span className="font-bold text-pace-purple text-sm tabular-nums">
              KES {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-admin-dim mb-1.5">Settlement Channel *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWithdrawChannel('mpesa')}
                className={cn(
                  "py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  withdrawChannel === 'mpesa' 
                    ? "bg-pace-purple text-white border-pace-purple shadow-sm" 
                    : "bg-pace-bg-subtle text-admin-dim border-pace-border hover:text-admin-value"
                )}
              >
                <Smartphone size={14} /> M-Pesa Wallet
              </button>
              <button
                type="button"
                onClick={() => setWithdrawChannel('bank')}
                className={cn(
                  "py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  withdrawChannel === 'bank' 
                    ? "bg-pace-purple text-white border-pace-purple shadow-sm" 
                    : "bg-pace-bg-subtle text-admin-dim border-pace-border hover:text-admin-value"
                )}
              >
                <Building size={14} /> Bank Account
              </button>
            </div>
            {withdrawChannel === 'bank' ? (
              <p className="text-[10px] text-gray-400 mt-1.5">
                Target: {hasBank ? <strong>{wallet.bankName} (A/C: {wallet.bankAccount})</strong> : <span className="text-amber-500 font-medium">Bank not set up yet</span>}
              </p>
            ) : (
              <p className="text-[10px] text-gray-400 mt-1.5">
                Target: {hasMpesa ? <strong>M-Pesa ({wallet.mpesaNumber})</strong> : <span className="text-amber-500 font-medium">M-Pesa number not set up yet</span>}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-admin-dim mb-1">Amount (KES) *</label>
            <input
              type="number"
              step="any"
              required
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-admin-dim mb-1">Memo / Reference Note (Optional)</label>
            <input
              value={withdrawNotes}
              onChange={(e) => setWithdrawNotes(e.target.value)}
              placeholder="e.g., Weekly settlement payout"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            />
          </div>

          <div className="pt-4 flex items-center gap-3 border-t border-pace-border">
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(false)}
              className="flex-1 px-4 py-2 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send size={12} /> {isSubmitting ? 'Processing...' : 'Confirm Payout'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT SETTLEMENT DETAILS MODAL */}
      <Modal
        isOpen={isEditSettlementOpen}
        onClose={() => setIsEditSettlementOpen(false)}
        title="Configure Disbursement Credentials"
        description="Save your actual bank account details and M-Pesa mobile number for receiving payouts."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSettlementSubmit} className="space-y-4 pt-2 font-figtree">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-admin-dim mb-1">Bank Name</label>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. KCB Bank / Equity"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-admin-dim mb-1">Branch Name</label>
              <input
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                placeholder="e.g. Nairobi CBD"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-admin-dim mb-1">Account Holder Name</label>
            <input
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              placeholder="e.g. DENNIS MUUO"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-admin-dim mb-1">Account Number</label>
              <input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="e.g. 11002345678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-admin-dim mb-1">M-Pesa Mobile Number *</label>
              <input
                required
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
                placeholder="e.g. 0793527494"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3 border-t border-pace-border">
            <button
              type="button"
              onClick={() => setIsEditSettlementOpen(false)}
              className="flex-1 px-4 py-2 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Credentials'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
