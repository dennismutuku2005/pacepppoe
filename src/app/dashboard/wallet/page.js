"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { 
    Wallet, ArrowUpRight, ArrowDownLeft, Building, 
    Send, Edit2, History, Smartphone, Search, RefreshCw, 
    Store, PlusCircle, Eye, Copy, Check
} from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { financeService } from '@/services/isp/finance'
import { AdminCardSkeleton } from '@/components/Skeleton'
import { formatNairobiDateTime } from '@/lib/dateUtils'

export default function IspWalletDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [wallet, setWallet] = useState({
    balance: 0.00,
    payment_details: {
      type: 'paybill',
      paybill_number: '',
      account_number: '',
      till_number: '',
      account_name: '',
      phone: '',
      status: 'active'
    },
    history: []
  })

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'deposit' | 'withdrawal'
  const [search, setSearch] = useState('')

  // Modals Control
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isEditSettlementOpen, setIsEditSettlementOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Transaction Detail Modal
  const [selectedTx, setSelectedTx] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Withdraw Form Fields
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawNotes, setWithdrawNotes] = useState('')

  // Edit Settlement Form Fields (Paybill vs Till)
  const [settlementType, setSettlementType] = useState('paybill') // 'paybill' | 'till'
  const [paybillNumber, setPaybillNumber] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [tillNumber, setTillNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [phone, setPhone] = useState('')

  const fetchWalletData = async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true)
      else setIsLoading(true)

      const res = await financeService.getWallet()
      if (res && res.status === 'success' && res.data) {
        const data = res.data
        const pd = data.payment_details || {}
        
        const pType = pd.type || 'paybill'
        const pNum  = pd.paybill_number || ''
        const accNo = pd.account_number || ''
        const tNum  = pd.till_number || ''
        const accNm = pd.account_name || ''
        const ph    = pd.phone || ''

        setWallet({
          balance: Number(data.balance || 0),
          payment_details: {
            type: pType,
            paybill_number: pNum,
            account_number: accNo,
            till_number: tNum,
            account_name: accNm,
            phone: ph,
            status: pd.status || 'active'
          },
          history: Array.isArray(data.history) ? data.history : []
        })

        setSettlementType(pType)
        setPaybillNumber(pNum)
        setAccountNumber(accNo)
        setTillNumber(tNum)
        setAccountName(accNm)
        setPhone(ph)
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
        tx.reference?.toLowerCase().includes(search.toLowerCase()) ||
        tx.date?.includes(search)
      return matchesTab && matchesSearch
    })
  }, [wallet.history, activeTab, search])

  const calculateWithdrawalFee = (amt) => {
    const amount = Number(amt) || 0
    if (amount <= 0) return 0
    const tiers = [
      [1, 49, 2],
      [50, 100, 3],
      [101, 500, 8],
      [501, 1000, 13],
      [1001, 1500, 18],
      [1501, 2500, 25],
      [2501, 3500, 30],
      [3501, 5000, 39],
      [5001, 7500, 48],
      [7501, 10000, 54],
      [10001, 15000, 63],
      [15001, 20000, 68],
      [20001, 25000, 74],
      [25001, 30000, 79],
      [30001, 35000, 90],
      [35001, 40000, 106],
      [40001, 45000, 110],
      [45001, 50000, 115],
      [50001, 70000, 115],
      [70001, 150000, 115],
      [150001, 250000, 115],
      [250001, 500000, 115],
      [500001, 1000000, 115]
    ]
    for (const tier of tiers) {
      if (amount >= tier[0] && amount <= tier[1]) {
        return tier[2]
      }
    }
    return 115
  }

  const pd = wallet.payment_details
  const isPaybillConfigured = Boolean(pd.type === 'paybill' && pd.paybill_number && pd.account_number)
  const isTillConfigured = Boolean(pd.type === 'till' && pd.till_number)
  const isConfigured = isPaybillConfigured || isTillConfigured

  const numericWithdrawAmount = Number(withdrawAmount) || 0
  const estimatedWithdrawFee = numericWithdrawAmount > 0 ? calculateWithdrawalFee(numericWithdrawAmount) : 0
  const totalDeductedFromWallet = numericWithdrawAmount > 0 ? numericWithdrawAmount + estimatedWithdrawFee : 0
  const isInsufficientForWithdrawal = totalDeductedFromWallet > wallet.balance

  // Handle Copy reference
  const handleCopy = (text) => {
    if (!text || text === '—') return
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    toast.success('Reference code copied to clipboard')
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Handle Withdraw Submit
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault()
    const amount = Number(withdrawAmount)
    if (!amount || amount < 10) {
      toast.error('Minimum withdrawal amount is KES 10.00')
      return
    }

    const fee = calculateWithdrawalFee(amount)
    const totalRequired = amount + fee

    if (totalRequired > wallet.balance) {
      toast.error('Insufficient wallet balance to cover payout and transaction fee.', {
        description: `Total required: KES ${totalRequired.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Amount: KES ${amount.toLocaleString()} + Fee: KES ${fee.toFixed(2)}). Available balance: KES ${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`
      })
      return
    }

    if (!isConfigured) {
      toast.error('Payment destination not configured', {
        description: 'Please set up your Paybill or Till number first.'
      })
      setIsWithdrawOpen(false)
      setIsEditSettlementOpen(true)
      return
    }

    const destLabel = pd.type === 'till' 
      ? `Till: ${pd.till_number}` 
      : `Paybill: ${pd.paybill_number} (Account: ${pd.account_number})`

    try {
      setIsSubmitting(true)
      const res = await financeService.withdrawWallet({
        amount,
        withdrawal_type: pd.type,
        type: pd.type,
        paybill_number: pd.paybill_number,
        account_number: pd.account_number,
        till_number: pd.till_number,
        phone: pd.phone,
        notes: withdrawNotes || `Withdrawal to ${destLabel}`
      })

      if (res && res.status === 'success') {
        toast.success('Withdrawal initiated successfully.', {
          description: `KES ${amount.toLocaleString()} payout to ${destLabel} (Fee: KES ${fee.toFixed(2)}).`
        })
        setIsWithdrawOpen(false)
        setWithdrawAmount('')
        setWithdrawNotes('')
        fetchWalletData(true)
      } else {
        toast.error('Withdrawal failed', { description: res?.message || 'Transaction could not be completed' })
      }
    } catch (err) {
      console.error("Error with withdrawal:", err)
      toast.error(err?.response?.data?.message || 'Failed to process withdrawal')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Settlement Edit
  const handleSettlementSubmit = async (e) => {
    e.preventDefault()
    if (settlementType === 'paybill') {
      if (!paybillNumber.trim()) {
        toast.error('Paybill number is required')
        return
      }
      if (!accountNumber.trim()) {
        toast.error('Account number is required')
        return
      }
    } else {
      if (!tillNumber.trim()) {
        toast.error('Buy Goods Till number is required')
        return
      }
    }

    try {
      setIsSubmitting(true)
      const res = await financeService.updateSettlement({
        type: settlementType,
        paybill_number: paybillNumber.trim(),
        account_number: accountNumber.trim(),
        till_number: tillNumber.trim(),
        account_name: accountName.trim(),
        phone: phone.trim()
      })

      if (res && res.status === 'success') {
        setWallet(prev => ({
          ...prev,
          payment_details: {
            ...prev.payment_details,
            type: settlementType,
            paybill_number: paybillNumber.trim(),
            account_number: accountNumber.trim(),
            till_number: tillNumber.trim(),
            account_name: accountName.trim(),
            phone: phone.trim()
          }
        }))
        toast.success('Payment destination saved successfully.')
        setIsEditSettlementOpen(false)
        fetchWalletData(true)
      } else {
        toast.error('Failed to save payment details', { description: res?.message })
      }
    } catch (err) {
      console.error("Error saving payment details:", err)
      toast.error('Failed to save payment settings')
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

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pace-purple/10 flex items-center justify-center">
              <Wallet size={18} className="text-pace-purple" />
            </div>
            Wallet &amp; Payments
          </h1>
          <p className="text-xs font-normal text-gray-400 mt-1">
            Subscriber collections, payment destination settings, and withdrawal history.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => fetchWalletData(true)}
            disabled={isRefreshing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all text-xs font-medium disabled:opacity-50 cursor-pointer"
            title="Refresh balance"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-medium hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Send size={14} /> <span>Withdraw Funds</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pace-purple to-indigo-500" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate">
                Available Balance
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                KES {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">Ready for withdrawal</p>
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
              <p className="text-xs font-medium text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate">
                Total Collections
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                KES {totalInflows.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">Subscriber payments</p>
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
              <p className="text-xs font-medium text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate">
                Total Withdrawals
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                KES {totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">Paid to Paybill / Till</p>
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
              <p className="text-xs font-medium text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate">
                Payment Destination
              </p>
              <p className="text-sm font-semibold text-admin-value mt-1.5 truncate">
                {isPaybillConfigured ? `Paybill ${pd.paybill_number}` : (isTillConfigured ? `Till ${pd.till_number}` : 'Not set up')}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate font-mono">
                {isPaybillConfigured ? `Account: ${pd.account_number}` : (isTillConfigured ? 'Buy Goods Till' : 'Click to configure')}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-blue-500/10 group-hover:border-blue-500/30 bg-blue-500/5 transition-all duration-300 shrink-0 group-hover:scale-105">
              {pd.type === 'till' ? <Store className="text-blue-500 w-4 h-4" /> : <Building className="text-blue-500 w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner: Payment Destination & Fast Withdrawal Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Destination Card */}
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pace-purple/10 flex items-center justify-center text-pace-purple shrink-0">
                {pd.type === 'till' ? <Store size={20} /> : <Building size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-admin-value">
                    {pd.type === 'till' ? 'Buy Goods Till Destination' : 'Paybill & Account Destination'}
                  </h3>
                  {isConfigured ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md font-medium">
                      Not set up
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Payout destination for receiving your wallet withdrawals
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditSettlementOpen(true)}
              className="px-3 py-1.5 bg-pace-bg-subtle text-pace-purple hover:bg-pace-purple/10 border border-pace-border rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Edit2 size={12} /> Configure
            </button>
          </div>

          <div className="p-3.5 bg-pace-bg-subtle border border-pace-border rounded-xl">
            {isPaybillConfigured ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Paybill Number</p>
                  <p className="font-mono font-semibold text-admin-value mt-0.5">{pd.paybill_number}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Account Number</p>
                  <p className="font-mono font-semibold text-pace-purple mt-0.5">{pd.account_number}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Account Name</p>
                  <p className="font-medium text-admin-value mt-0.5 truncate">{pd.account_name || '—'}</p>
                </div>
              </div>
            ) : isTillConfigured ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Till Number</p>
                  <p className="font-mono font-semibold text-pace-purple mt-0.5">{pd.till_number}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Business Name</p>
                  <p className="font-medium text-admin-value mt-0.5 truncate">{pd.account_name || '—'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between py-1 text-xs">
                <span className="text-amber-600 font-medium">No Paybill or Till destination configured yet.</span>
                <button
                  onClick={() => setIsEditSettlementOpen(true)}
                  className="text-pace-purple font-medium hover:underline flex items-center gap-1 text-xs cursor-pointer"
                >
                  <PlusCircle size={12} /> Set up Destination
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Withdrawal Action Card */}
        <div className="bg-gradient-to-br from-card-bg to-pace-purple/5 border border-pace-border rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Withdraw Revenue</span>
              <span className="text-[10px] font-mono text-admin-dim bg-pace-bg-subtle border border-pace-border px-2 py-0.5 rounded-md">Instant Payout</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-semibold text-admin-value tabular-nums font-mono">
                KES {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400">available</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Send your earnings directly to your configured Paybill or Till number.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="flex-1 py-2.5 px-4 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Send size={13} />
              <span>Withdraw Funds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Width Payment History Table Below */}
      <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm space-y-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-admin-value">Payment History</h3>
            <p className="text-xs text-gray-400 mt-0.5">Complete record of subscriber collections and withdrawals</p>
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
              All ({wallet.history?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                activeTab === 'deposit' ? "bg-card-bg text-emerald-600 shadow-xs" : "text-admin-dim hover:text-admin-value"
              )}
            >
              Collections
            </button>
            <button
              onClick={() => setActiveTab('withdrawal')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                activeTab === 'withdrawal' ? "bg-card-bg text-rose-600 shadow-xs" : "text-admin-dim hover:text-admin-value"
              )}
            >
              Withdrawals
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative group max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
          <input
            type="text"
            placeholder="Search by description, reference code, date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-normal text-admin-value focus:outline-none focus:border-pace-purple transition-all"
          />
        </div>

        {/* Payment History Table - Full Width */}
        <div className="overflow-x-auto rounded-xl border border-pace-border">
          <table className="w-full text-left whitespace-nowrap text-xs">
            <thead>
              <tr className="bg-pace-bg-subtle/70 border-b border-pace-border text-xs font-medium text-admin-dim">
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5">Reference Number</th>
                <th className="px-4 py-3.5">Date &amp; Time</th>
                <th className="px-4 py-3.5 text-right">Amount</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-400 text-xs font-normal">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((tx, idx) => {
                  const isDeposit = tx.type === 'deposit'
                  return (
                    <tr 
                      key={tx.id || idx} 
                      onClick={() => {
                        setSelectedTx(tx)
                        setIsDetailOpen(true)
                      }}
                      className="hover:bg-pace-bg-subtle/40 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center border shrink-0",
                            isDeposit 
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/15" 
                              : "bg-rose-500/10 text-rose-600 border-rose-500/15"
                          )}>
                            {isDeposit ? <ArrowUpRight size={15} /> : <ArrowDownLeft size={15} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-admin-value truncate">{tx.description}</p>
                            <p className="text-[11px] text-gray-400">{isDeposit ? 'Subscriber Payment' : 'Wallet Withdrawal'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-normal text-admin-dim bg-pace-bg-subtle border border-pace-border px-2.5 py-1 rounded-lg">
                          {tx.channel || (isDeposit ? 'M-Pesa' : 'Withdrawal')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-medium text-admin-value">
                          {tx.reference || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] text-gray-400">
                          {formatNairobiDateTime(tx.created_at || tx.date)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={cn(
                          "font-semibold text-xs tabular-nums font-mono block",
                          isDeposit ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {isDeposit ? '+' : '-'}KES {Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        {tx.transaction_cost > 0 && (
                          <span className="text-[10px] text-gray-400 font-mono block">Fee: KES {Number(tx.transaction_cost).toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge 
                          variant={tx.status === 'completed' || tx.status === 'Success' ? 'success' : (tx.status === 'pending' ? 'warning' : 'neutral')} 
                          className="text-[10px] font-medium border-none px-2.5 py-0.5 capitalize"
                        >
                          {tx.status || 'Completed'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTx(tx)
                            setIsDetailOpen(true)
                          }}
                          className="p-1.5 rounded-lg text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 transition-colors cursor-pointer"
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

      {/* REQUEST WITHDRAWAL MODAL */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="Withdraw Funds"
        description="Transfer available balance to your configured Paybill or Buy Goods Till."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4 pt-2 font-figtree">
          <div className="p-3.5 bg-pace-purple/5 border border-pace-purple/15 rounded-xl flex justify-between items-center text-xs">
            <span className="text-gray-400 font-normal">Available Balance:</span>
            <span className="font-semibold text-pace-purple text-sm tabular-nums">
              KES {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 bg-pace-bg-subtle border border-pace-border rounded-xl space-y-1.5 text-xs">
            <span className="text-gray-400 font-normal block">Destination:</span>
            {pd.type === 'till' && isTillConfigured ? (
              <div className="flex items-center gap-2 text-admin-value font-medium">
                <Store size={14} className="text-pace-purple" />
                <span>Buy Goods Till: <strong>{pd.till_number}</strong> {pd.account_name ? `(${pd.account_name})` : ''}</span>
              </div>
            ) : (isPaybillConfigured ? (
              <div className="flex items-center gap-2 text-admin-value font-medium">
                <Building size={14} className="text-pace-purple" />
                <span>Paybill: <strong>{pd.paybill_number}</strong> (Account: <strong>{pd.account_number}</strong>)</span>
              </div>
            ) : (
              <div className="text-amber-500 font-medium flex items-center justify-between">
                <span>No destination configured</span>
                <button
                  type="button"
                  onClick={() => { setIsWithdrawOpen(false); setIsEditSettlementOpen(true); }}
                  className="text-pace-purple underline text-[11px] cursor-pointer"
                >
                  Configure Now
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-admin-dim">Amount to Withdraw (KES) *</label>
              {wallet.balance > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    // Calculate max possible withdrawal accounting for fee
                    let maxAmt = Math.max(0, wallet.balance)
                    const fee = calculateWithdrawalFee(maxAmt)
                    if (maxAmt - fee >= 10) {
                      setWithdrawAmount(String(Math.floor(maxAmt - fee)))
                    } else {
                      setWithdrawAmount(String(Math.floor(maxAmt)))
                    }
                  }}
                  className="text-[11px] text-pace-purple hover:underline font-medium cursor-pointer"
                >
                  Use Max Available
                </button>
              )}
            </div>
            <input
              type="number"
              step="any"
              required
              min="10"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Min. 10 KES (e.g. 5000)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
            />
          </div>

          {/* Live Fee & Total Deduction Breakdown Card */}
          {numericWithdrawAmount > 0 && (
            <div className={cn(
              "p-3.5 rounded-xl border space-y-2 text-xs transition-all",
              isInsufficientForWithdrawal 
                ? "bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-400" 
                : "bg-pace-bg-subtle/80 border-pace-border text-admin-dim"
            )}>
              <div className="flex items-center justify-between text-[11px] font-medium text-admin-value border-b border-pace-border/60 pb-1.5">
                <span>Fee &amp; Deduction Summary</span>
                <span className="text-[10px] text-gray-400 font-mono">M-Pesa Tariff</span>
              </div>

              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Withdrawal Amount:</span>
                  <span className="font-mono font-medium text-admin-value">
                    KES {numericWithdrawAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Estimated Transaction Fee:</span>
                  <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                    KES {estimatedWithdrawFee.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-pace-border/60">
                  <span className="text-admin-value">Total Deducted from Wallet:</span>
                  <span className={cn("font-mono", isInsufficientForWithdrawal ? "text-rose-600 font-bold" : "text-pace-purple")}>
                    KES {totalDeductedFromWallet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                  <span>Remaining Wallet Balance:</span>
                  <span className="font-mono">
                    KES {Math.max(0, wallet.balance - totalDeductedFromWallet).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {isInsufficientForWithdrawal && (
                <div className="pt-1.5 text-[11px] text-rose-600 font-medium">
                  ⚠️ Insufficient balance to cover requested amount + fee (KES {totalDeductedFromWallet.toLocaleString(undefined, { minimumFractionDigits: 2 })}).
                </div>
              )}

              {numericWithdrawAmount < 10 && (
                <div className="pt-1.5 text-[11px] text-amber-600 font-medium">
                  ⚠️ Minimum withdrawal amount is KES 10.00
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-admin-dim mb-1">Note (Optional)</label>
            <input
              value={withdrawNotes}
              onChange={(e) => setWithdrawNotes(e.target.value)}
              placeholder="e.g. Weekly withdrawal"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            />
          </div>

          <div className="pt-4 flex items-center gap-3 border-t border-pace-border">
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(false)}
              className="flex-1 px-4 py-2 border border-pace-border rounded-xl text-xs font-medium text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isConfigured || isInsufficientForWithdrawal || numericWithdrawAmount < 10}
              className="flex-1 px-4 py-2 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={12} /> {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT SETTLEMENT DETAILS MODAL (PAYBILL VS TILL) */}
      <Modal
        isOpen={isEditSettlementOpen}
        onClose={() => setIsEditSettlementOpen(false)}
        title="Configure Payment Destination"
        description="Choose Paybill & Account Number or Buy Goods Till number for receiving your withdrawals."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSettlementSubmit} className="space-y-4 pt-2 font-figtree">
          {/* Destination Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-admin-dim mb-1.5">Destination Type *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSettlementType('paybill')}
                className={cn(
                  "py-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  settlementType === 'paybill' 
                    ? "bg-pace-purple text-white border-pace-purple shadow-sm" 
                    : "bg-pace-bg-subtle text-admin-dim border-pace-border hover:text-admin-value"
                )}
              >
                <Building size={14} /> Paybill &amp; Account
              </button>
              <button
                type="button"
                onClick={() => setSettlementType('till')}
                className={cn(
                  "py-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  settlementType === 'till' 
                    ? "bg-pace-purple text-white border-pace-purple shadow-sm" 
                    : "bg-pace-bg-subtle text-admin-dim border-pace-border hover:text-admin-value"
                )}
              >
                <Store size={14} /> Buy Goods Till
              </button>
            </div>
          </div>

          {/* Conditional Inputs based on Type */}
          {settlementType === 'paybill' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-admin-dim mb-1">Paybill Number *</label>
                <input
                  required
                  value={paybillNumber}
                  onChange={(e) => setPaybillNumber(e.target.value)}
                  placeholder="e.g. 247247"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-admin-dim mb-1">Account Number *</label>
                <input
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 11002345678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-admin-dim mb-1">Buy Goods Till Number *</label>
              <input
                required
                value={tillNumber}
                onChange={(e) => setTillNumber(e.target.value)}
                placeholder="e.g. 5432109"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-admin-dim mb-1">Account / Business Name</label>
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Dennis Muuo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-admin-dim mb-1">Contact Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0793527494"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
            />
          </div>

          <div className="pt-4 flex items-center gap-3 border-t border-pace-border">
            <button
              type="button"
              onClick={() => setIsEditSettlementOpen(false)}
              className="flex-1 px-4 py-2 border border-pace-border rounded-xl text-xs font-medium text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </form>
      </Modal>

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
              selectedTx.type === 'deposit' 
                ? "bg-emerald-500/5 border-emerald-500/20" 
                : "bg-rose-500/5 border-rose-500/20"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
                  selectedTx.type === 'deposit' 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                )}>
                  {selectedTx.type === 'deposit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <span className="text-[11px] font-medium text-gray-400 block uppercase tracking-wider">
                    {selectedTx.type === 'deposit' ? 'Incoming Collection' : (selectedTx.type === 'withdrawal' ? 'Revenue Withdrawal' : 'Operational Expense')}
                  </span>
                  <span className={cn(
                    "text-xl sm:text-2xl font-bold font-mono tracking-tight",
                    selectedTx.type === 'deposit' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {selectedTx.type === 'deposit' ? '+' : '-'}KES {Number(selectedTx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Badge 
                variant={selectedTx.status === 'completed' || selectedTx.status === 'Success' ? 'success' : (selectedTx.status === 'pending' ? 'warning' : 'neutral')}
                className="px-3 py-1 text-xs font-semibold capitalize"
              >
                {selectedTx.status || 'Completed'}
              </Badge>
            </div>

            {/* Summary Grid */}
            <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-2xl space-y-3 text-xs">
              {/* Reference Number with Copy */}
              <div className="flex items-center justify-between py-1 border-b border-pace-border/60">
                <span className="text-gray-400">Reference / Receipt:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-admin-value">{selectedTx.reference || '—'}</span>
                  {selectedTx.reference && selectedTx.reference !== '—' && (
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
                  {selectedTx.channel || (selectedTx.type === 'deposit' ? 'M-Pesa Collections' : 'Withdrawal')}
                </span>
              </div>

              {/* Date & Time */}
              <div className="flex items-center justify-between py-1 border-b border-pace-border/60">
                <span className="text-gray-400">Date &amp; Timestamp:</span>
                <span className="font-mono text-admin-value font-medium">{formatNairobiDateTime(selectedTx.created_at || selectedTx.date)}</span>
              </div>

              {/* Fee Breakdown if applicable */}
              {selectedTx.transaction_cost > 0 && (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-pace-border/60">
                    <span className="text-gray-400">Transaction Tariff / Fee:</span>
                    <span className="font-mono text-amber-600 font-semibold">
                      KES {Number(selectedTx.transaction_cost).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-pace-border/60">
                    <span className="text-gray-400">Net Disbursed to Destination:</span>
                    <span className="font-mono text-admin-value font-semibold">
                      KES {Number(selectedTx.amount - selectedTx.transaction_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              )}

              {/* Description / Beneficiary */}
              <div className="py-1">
                <span className="text-gray-400 block mb-1">Description:</span>
                <p className="font-medium text-admin-value bg-card-bg p-2.5 rounded-xl border border-pace-border break-words">
                  {selectedTx.description}
                </p>
              </div>

              {/* Destination specifics if withdrawal */}
              {(selectedTx.paybill_number || selectedTx.till_number) && (
                <div className="py-1 border-t border-pace-border/60 pt-2">
                  <span className="text-gray-400 block mb-1">Destination Target:</span>
                  <div className="font-mono text-admin-value text-xs bg-card-bg p-2.5 rounded-xl border border-pace-border space-y-1">
                    {selectedTx.till_number ? (
                      <div>Buy Goods Till: <strong>{selectedTx.till_number}</strong></div>
                    ) : (
                      <>
                        <div>Paybill: <strong>{selectedTx.paybill_number}</strong></div>
                        <div>Account: <strong>{selectedTx.account_number}</strong></div>
                      </>
                    )}
                    {selectedTx.phone && <div>Contact Phone: {selectedTx.phone}</div>}
                  </div>
                </div>
              )}

              {/* Response / Provider feedback if available */}
              {selectedTx.response_description && (
                <div className="py-1 border-t border-pace-border/60 pt-2">
                  <span className="text-gray-400 block mb-1">Provider Feedback:</span>
                  <p className="text-[11px] font-mono text-admin-dim bg-card-bg p-2 rounded-lg border border-pace-border">
                    {selectedTx.response_description}
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
