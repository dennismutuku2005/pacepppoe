"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Coins,
  ShieldAlert,
  UserCheck,
  UserX,
  RotateCcw,
  Check,
  Calendar,
  FileText,
  Smartphone,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  ArrowRight
} from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { AdminCardSkeleton } from '@/components/Skeleton'
import { wrongAccountsService } from '@/services/admin/wrongAccounts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatNairobiDateTime } from '@/lib/dateUtils'

export default function AdminWrongAccountsPage() {
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState({
    total_count: 0,
    total_volume: 0,
    unresolved_count: 0,
    resolved_count: 0,
    unresolved_volume: 0,
    resolved_volume: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals state
  const [selectedItem, setSelectedItem] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isResolveOpen, setIsResolveOpen] = useState(false)
  const [isReopenOpen, setIsReopenOpen] = useState(false)

  // Resolve form state
  const [resolveMode, setResolveMode] = useState('allocate') // 'allocate' | 'manual'
  const [subscriberQuery, setSubscriberQuery] = useState('')
  const [subscriberResults, setSubscriberResults] = useState([])
  const [selectedSubscriber, setSelectedSubscriber] = useState(null)
  const [isSearchingSubs, setIsSearchingSubs] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isSubmittingResolve, setIsSubmittingResolve] = useState(false)

  // Fetch wrong accounts data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await wrongAccountsService.getWrongAccounts({
        search,
        status: statusFilter,
        page: 1,
        limit: 100
      })
      if (res && res.status === 'success') {
        setRecords(res.data.records || [])
        if (res.data.stats) {
          setStats(res.data.stats)
        }
      } else {
        toast.error(res?.message || 'Failed to retrieve wrong accounts list')
      }
    } catch (err) {
      console.error('Error fetching wrong accounts:', err)
      toast.error('Network error fetching wrong accounts records')
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Live search for subscribers during allocation
  useEffect(() => {
    if (!subscriberQuery.trim() || resolveMode !== 'allocate') {
      setSubscriberResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingSubs(true)
      try {
        const res = await wrongAccountsService.searchSubscribers(subscriberQuery.trim())
        if (res && res.status === 'success') {
          setSubscriberResults(res.data.subscribers || [])
        }
      } catch (err) {
        console.error('Subscriber search error:', err)
      } finally {
        setIsSearchingSubs(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [subscriberQuery, resolveMode])

  const handleOpenView = (item) => {
    setSelectedItem(item)
    setIsViewOpen(true)
  }

  const handleOpenResolve = (item) => {
    setSelectedItem(item)
    setResolveMode('allocate')
    setSelectedSubscriber(null)
    setSubscriberQuery('')
    setSubscriberResults([])
    setResolutionNotes(`Resolved unmatched payment for Ref: ${item.account_reference || 'N/A'}`)
    setIsResolveOpen(true)
  }

  const handleOpenReopen = (item) => {
    setSelectedItem(item)
    setResolutionNotes('')
    setIsReopenOpen(true)
  }

  const handleSubmitResolve = async (e) => {
    e.preventDefault()
    if (!selectedItem) return

    if (resolveMode === 'allocate' && !selectedSubscriber) {
      toast.error('Please search and select a subscriber to allocate this payment to')
      return
    }

    setIsSubmittingResolve(true)
    try {
      const payload = {
        id: selectedItem.id,
        pppoe_user_id: resolveMode === 'allocate' ? selectedSubscriber.id : null,
        notes: resolutionNotes.trim()
      }

      const res = await wrongAccountsService.resolveAccount(payload)
      if (res && res.status === 'success') {
        toast.success(res.message || 'Payment resolved successfully')
        setIsResolveOpen(false)
        loadData()
      } else {
        toast.error(res?.message || 'Failed to resolve payment')
      }
    } catch (err) {
      console.error('Resolve error:', err)
      toast.error(err?.message || 'Error occurred while resolving payment')
    } finally {
      setIsSubmittingResolve(false)
    }
  }

  const handleSubmitReopen = async (e) => {
    e.preventDefault()
    if (!selectedItem) return

    setIsSubmittingResolve(true)
    try {
      const res = await wrongAccountsService.reopenAccount({
        id: selectedItem.id,
        notes: resolutionNotes.trim()
      })
      if (res && res.status === 'success') {
        toast.success(res.message || 'Transaction reopened successfully')
        setIsReopenOpen(false)
        loadData()
      } else {
        toast.error(res?.message || 'Failed to reopen transaction')
      }
    } catch (err) {
      console.error('Reopen error:', err)
      toast.error(err?.message || 'Error occurred while reopening')
    } finally {
      setIsSubmittingResolve(false)
    }
  }

  const cards = [
    {
      label: 'Unresolved Payments',
      value: stats.unresolved_count,
      subValue: `KES ${stats.unresolved_volume.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: AlertTriangle,
      color: 'text-amber-500',
      accent: 'bg-gradient-to-b from-amber-400 to-orange-500',
      badge: stats.unresolved_count > 0 ? 'Requires Action' : 'All Clear',
      badgeVariant: stats.unresolved_count > 0 ? 'warning' : 'success'
    },
    {
      label: 'Total Unmatched Count',
      value: stats.total_count,
      subValue: 'All Time Inflow',
      icon: ShieldAlert,
      color: 'text-pace-purple',
      accent: 'bg-gradient-to-b from-pace-purple to-indigo-500'
    },
    {
      label: 'Resolved Records',
      value: stats.resolved_count,
      subValue: `KES ${stats.resolved_volume.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      accent: 'bg-gradient-to-b from-emerald-400 to-teal-500'
    },
    {
      label: 'Total Unmatched Volume',
      value: `KES ${stats.total_volume.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subValue: 'Gross Unallocated',
      icon: Coins,
      color: 'text-blue-500',
      accent: 'bg-gradient-to-b from-blue-400 to-indigo-600'
    }
  ]

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-admin-value tracking-tight">Wrong Accounts & Unmatched Payments</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Audit Queue
            </span>
          </div>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Reconcile and allocate M-Pesa payments received with invalid, unknown, or mistyped account reference codes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 text-xs font-semibold cursor-pointer"
            title="Refresh Unmatched Ledger"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh Ledger</span>
          </button>

          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search receipt, ref, phone, notes..."
              className="w-full pl-10 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all placeholder:text-admin-dim/60 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && records.length === 0 ? (
          [...Array(4)].map((_, i) => <AdminCardSkeleton key={i} />)
        ) : (
          cards.map((card) => (
            <div
              key={card.label}
              className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0"
            >
              <div className={cn("absolute left-0 top-0 bottom-0 w-1", card.accent)} />
              
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate">
                      {card.label}
                    </p>
                    {card.badge && (
                      <Badge variant={card.badgeVariant} className="text-[9px] px-1.5 py-0">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 tracking-tight group-hover:scale-[1.02] transition-transform origin-left duration-300">
                    {card.value}
                  </p>
                  <p className="text-[11px] font-medium text-admin-dim/80 mt-1">
                    {card.subValue}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-pace-border/5 bg-pace-bg-subtle shrink-0">
                  <card.icon className={cn(card.color, "w-4 h-4 sm:w-4.5 sm:h-4.5")} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-pace-bg-subtle p-1 rounded-xl border border-pace-border">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: '0', label: 'Unresolved (0)', count: stats.unresolved_count },
            { id: '1', label: 'Resolved (1)', count: stats.resolved_count }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                statusFilter === tab.id
                  ? "bg-card-bg text-admin-value shadow-xs border border-pace-border"
                  : "text-admin-dim hover:text-admin-value hover:bg-card-bg/40"
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                  tab.id === '0' && tab.count > 0 ? "bg-amber-500/15 text-amber-600" : "bg-pace-bg text-admin-dim"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="text-xs text-admin-dim font-medium">
          Showing <span className="font-bold text-admin-value">{records.length}</span> record{records.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[1050px]">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Receipt Code</th>
                <th className="px-6 py-4">Invalid Account Ref</th>
                <th className="px-6 py-4">Sender Phone</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Trans Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Resolution Details</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 bg-pace-bg-subtle rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-20 bg-pace-bg-subtle rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-admin-dim text-xs font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-pace-bg-subtle flex items-center justify-center text-admin-dim">
                        <CheckCircle2 size={24} className="text-emerald-500" />
                      </div>
                      <p className="font-semibold text-admin-value mt-1">No wrong account records found</p>
                      <p className="text-admin-dim text-[11px]">All incoming payments matched valid subscriber accounts.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((item) => {
                  const isResolved = Number(item.resolved) === 1

                  return (
                    <tr key={item.id} className="hover:bg-pace-bg-subtle/30 transition-all duration-150">
                      <td className="px-6 py-4 font-mono font-bold text-pace-purple text-xs">
                        {item.receipt_number}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          {item.account_reference || '<EMPTY>'}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-admin-dim">
                        {item.phone_number}
                      </td>

                      <td className="px-6 py-4 text-xs font-bold text-admin-value">
                        KES {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                        {formatNairobiDateTime(item.transaction_date)}
                      </td>

                      <td className="px-6 py-4">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <Check size={11} />
                            Resolved (1)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
                            <AlertCircle size={11} />
                            Unresolved (0)
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {item.allocated_user_name ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-admin-value flex items-center gap-1">
                              <UserCheck size={12} className="text-emerald-500 shrink-0" />
                              {item.allocated_user_name}
                            </span>
                            <span className="text-[10px] text-admin-dim font-mono">
                              Acc: {item.allocated_account_number || item.allocated_username}
                            </span>
                          </div>
                        ) : item.notes ? (
                          <span className="text-admin-dim line-clamp-1 max-w-[200px]" title={item.notes}>
                            {item.notes}
                          </span>
                        ) : (
                          <span className="text-admin-dim/50 italic text-[11px]">Pending follow-up</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(item)}
                            className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-admin-value transition-all cursor-pointer"
                            title="View Payload Details"
                          >
                            <Eye size={14} />
                          </button>

                          {!isResolved ? (
                            <button
                              onClick={() => handleOpenResolve(item)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-pace-purple text-white text-[11px] font-semibold rounded-lg hover:bg-pace-purple/90 transition-all cursor-pointer shadow-xs"
                              title="Resolve / Allocate Payment"
                            >
                              <CheckCircle2 size={12} />
                              <span>Resolve</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenReopen(item)}
                              className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-amber-600 transition-all cursor-pointer"
                              title="Re-open Transaction"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW DETAILS */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Unmatched Receipt: ${selectedItem?.receipt_number}`}
        description="M-Pesa payment payload and audit information."
        maxWidth="max-w-lg"
      >
        {selectedItem && (
          <div className="space-y-4 font-figtree">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Receipt Code</p>
                <p className="text-xs font-mono font-bold text-pace-purple">{selectedItem.receipt_number}</p>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Transacted Amount</p>
                <p className="text-xs font-bold text-admin-value">
                  KES {selectedItem.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Entered BillRef</p>
                <p className="text-xs font-mono font-bold text-amber-600">{selectedItem.account_reference || '<NONE>'}</p>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Sender MSISDN</p>
                <p className="text-xs font-mono text-admin-value">{selectedItem.phone_number}</p>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Transaction Date</p>
                <p className="text-xs font-medium text-admin-value">{formatNairobiDateTime(selectedItem.transaction_date)}</p>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Resolved Status</p>
                <p className="text-xs font-bold text-admin-value">
                  {Number(selectedItem.resolved) === 1 ? 'RESOLVED (1)' : 'UNRESOLVED (0)'}
                </p>
              </div>
            </div>

            {selectedItem.allocated_user_name && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-[9px] uppercase tracking-wider text-emerald-600 font-bold mb-1">Allocated Subscriber</p>
                <p className="text-xs font-bold text-admin-value">{selectedItem.allocated_user_name} ({selectedItem.allocated_username})</p>
                <p className="text-[11px] text-admin-dim mt-0.5">Account Code: {selectedItem.allocated_account_number}</p>
              </div>
            )}

            {selectedItem.notes && (
              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Resolution Notes</p>
                <p className="text-xs text-admin-value leading-relaxed">{selectedItem.notes}</p>
                {selectedItem.resolver_admin_name && (
                  <p className="text-[10px] text-admin-dim mt-1.5">
                    By admin: <span className="font-semibold">{selectedItem.resolver_admin_name}</span> at {formatNairobiDateTime(selectedItem.resolved_at)}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => setIsViewOpen(false)}
              className="w-full bg-pace-bg-subtle border border-pace-border text-admin-value py-2.5 rounded-xl text-xs font-semibold hover:bg-pace-purple/5 hover:text-pace-purple transition-all cursor-pointer"
            >
              Close Details
            </button>
          </div>
        )}
      </Modal>

      {/* MODAL 2: RESOLVE / ALLOCATE */}
      <Modal
        isOpen={isResolveOpen}
        onClose={() => !isSubmittingResolve && setIsResolveOpen(false)}
        title="Resolve Wrong Account Payment"
        description={`Allocate Receipt ${selectedItem?.receipt_number} (KES ${selectedItem?.amount?.toFixed(2)}) to a subscriber or mark as resolved.`}
        maxWidth="max-w-lg"
      >
        {selectedItem && (
          <form onSubmit={handleSubmitResolve} className="space-y-4 font-figtree">
            
            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-pace-bg-subtle rounded-xl border border-pace-border">
              <button
                type="button"
                onClick={() => {
                  setResolveMode('allocate')
                  setSelectedSubscriber(null)
                }}
                className={cn(
                  "py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  resolveMode === 'allocate'
                    ? "bg-card-bg text-admin-value shadow-xs border border-pace-border"
                    : "text-admin-dim hover:text-admin-value"
                )}
              >
                <UserCheck size={14} />
                <span>Credit Subscriber</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResolveMode('manual')
                  setSelectedSubscriber(null)
                }}
                className={cn(
                  "py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  resolveMode === 'manual'
                    ? "bg-card-bg text-admin-value shadow-xs border border-pace-border"
                    : "text-admin-dim hover:text-admin-value"
                )}
              >
                <FileText size={14} />
                <span>Manual Note</span>
              </button>
            </div>

            {/* ALLOCATE MODE */}
            {resolveMode === 'allocate' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold block mb-1">
                    Search PPPoE Subscriber
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={14} />
                    <input
                      value={subscriberQuery}
                      onChange={(e) => setSubscriberQuery(e.target.value)}
                      placeholder="Type subscriber name, username, phone or account..."
                      className="w-full pl-9 pr-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                    {isSearchingSubs && (
                      <RefreshCw size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-pace-purple" />
                    )}
                  </div>
                </div>

                {/* Search Results Dropdown */}
                {subscriberResults.length > 0 && !selectedSubscriber && (
                  <div className="border border-pace-border rounded-xl bg-card-bg max-h-48 overflow-y-auto divide-y divide-pace-border shadow-md">
                    {subscriberResults.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubscriber(sub)}
                        className="p-2.5 hover:bg-pace-purple/5 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-admin-value">{sub.name}</p>
                          <p className="text-[10px] text-admin-dim">
                            User: <span className="font-mono text-pace-purple">{sub.username}</span> | Acc: <span className="font-mono">{sub.account_number}</span> | Phone: {sub.phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "text-[11px] font-bold",
                            sub.account_balance >= 0 ? "text-emerald-500" : "text-rose-500"
                          )}>
                            Bal: KES {sub.account_balance.toFixed(2)}
                          </p>
                          <span className="text-[9px] uppercase font-bold text-admin-dim">{sub.isp_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Subscriber Preview */}
                {selectedSubscriber && (
                  <div className="rounded-xl border border-pace-purple/30 bg-pace-purple/5 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck size={16} className="text-pace-purple" />
                        <span className="text-xs font-bold text-admin-value">{selectedSubscriber.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSubscriber(null)}
                        className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-pace-purple/15 pt-2">
                      <div>
                        <p className="text-[9px] uppercase text-admin-dim font-bold">Current Balance</p>
                        <p className={cn(
                          "font-bold",
                          selectedSubscriber.account_balance >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          KES {selectedSubscriber.account_balance.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase text-admin-dim font-bold">New Balance (After +{selectedItem.amount})</p>
                        <p className="font-bold text-emerald-600">
                          KES {(selectedSubscriber.account_balance + selectedItem.amount).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase text-admin-dim font-bold">Plan Profile</p>
                        <p className="font-medium text-admin-value">{selectedSubscriber.plan_name || 'Standard Plan'}</p>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase text-admin-dim font-bold">ISP Operator</p>
                        <p className="font-medium text-admin-value">{selectedSubscriber.isp_name || 'Direct'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes Input */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold block mb-1">
                Resolution Follow-Up Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={2}
                placeholder="Add audit or explanation note..."
                className="w-full p-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResolveOpen(false)}
                disabled={isSubmittingResolve}
                className="w-1/3 bg-pace-bg-subtle border border-pace-border text-admin-dim py-2.5 rounded-xl text-xs font-semibold hover:text-admin-value transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmittingResolve || (resolveMode === 'allocate' && !selectedSubscriber)}
                className="w-2/3 bg-pace-purple text-white py-2.5 rounded-xl text-xs font-bold hover:bg-pace-purple/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isSubmittingResolve ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Confirm Resolution</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </Modal>

      {/* MODAL 3: REOPEN TRANSACTION */}
      <Modal
        isOpen={isReopenOpen}
        onClose={() => !isSubmittingResolve && setIsReopenOpen(false)}
        title="Re-open Wrong Account Transaction"
        description={`Set status back to Unresolved (0) for receipt ${selectedItem?.receipt_number}.`}
        maxWidth="max-w-md"
      >
        {selectedItem && (
          <form onSubmit={handleSubmitReopen} className="space-y-4 font-figtree">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold block mb-1">
                Reason for Re-opening
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                placeholder="Reason why this transaction is being marked back as unresolved..."
                className="w-full p-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReopenOpen(false)}
                disabled={isSubmittingResolve}
                className="w-1/3 bg-pace-bg-subtle border border-pace-border text-admin-dim py-2.5 rounded-xl text-xs font-semibold hover:text-admin-value transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmittingResolve}
                className="w-2/3 bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isSubmittingResolve ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Reopening...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} />
                    <span>Reopen Transaction</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  )
}
