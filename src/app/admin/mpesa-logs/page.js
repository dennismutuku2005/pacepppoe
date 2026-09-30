"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Smartphone,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  ShieldAlert,
  Coins,
  Network,
  Copy,
  Check,
  Code,
  User,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { AdminCardSkeleton } from '@/components/Skeleton'
import { mpesaService } from '@/services/admin/mpesa'
import { ispService } from '@/services/admin/isps'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatNairobiDateTime } from '@/lib/dateUtils'

export default function AdminMpesaLogsPage() {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({
    total_count: 0,
    total_volume: 0,
    mikrotik_connected: 0,
    mikrotik_failed: 0,
    mikrotik_pending: 0,
    unmatched_count: 0
  })
  const [ispsList, setIspsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all')
  const [mikrotikFilter, setMikrotikFilter] = useState('all')
  const [ispFilter, setIspFilter] = useState(0)

  // Inspection Modal states
  const [selectedTx, setSelectedTx] = useState(null)
  const [isInspectOpen, setIsInspectOpen] = useState(false)
  const [copiedPayload, setCopiedPayload] = useState(false)

  // Load Transactions & Logs
  const loadTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await mpesaService.getMpesaTransactions({
        search,
        status: statusFilter,
        mikrotik_status: mikrotikFilter,
        isp_id: ispFilter,
        page: 1,
        limit: 150
      })
      if (res && res.status === 'success') {
        setTransactions(res.data || [])
        if (res.stats) {
          setStats(res.stats)
        }
      } else {
        toast.error(res?.message || 'Failed to retrieve transaction logs')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error fetching transaction logs')
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter, mikrotikFilter, ispFilter])

  // Load ISPs for filtering
  useEffect(() => {
    const loadISPs = async () => {
      try {
        const res = await ispService.getISPs(1, 200)
        if (res && res.status === 'success') {
          setIspsList(res.data.isps || [])
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadISPs()
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const openInspectModal = (tx) => {
    setSelectedTx(tx)
    setCopiedPayload(false)
    setIsInspectOpen(true)
  }

  const handleCopyPayload = (payloadText) => {
    if (!payloadText) return
    navigator.clipboard.writeText(payloadText)
    setCopiedPayload(true)
    toast.success('Raw payload copied to clipboard')
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  const formatRawPayload = (payload) => {
    if (!payload) return 'No raw payload recorded for this transaction.'
    try {
      if (typeof payload === 'string') {
        const parsed = JSON.parse(payload)
        return JSON.stringify(parsed, null, 2)
      }
      return JSON.stringify(payload, null, 2)
    } catch (e) {
      return payload
    }
  }

  const getMikrotikBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle size={11} />
            Connected
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse">
            <AlertCircle size={11} />
            Failed (Cron Retry)
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock size={11} />
            Pending
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-pace-bg-subtle text-admin-dim border border-pace-border">
            N/A
          </span>
        )
    }
  }

  const cards = [
    {
      label: 'Total M-Pesa Inflow',
      value: `KES ${stats.total_volume.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subValue: 'Cumulative collections',
      icon: Coins,
      color: 'text-emerald-500',
      accent: 'bg-gradient-to-b from-emerald-400 to-teal-500'
    },
    {
      label: 'Logged Transactions',
      value: stats.total_count,
      subValue: 'All callback events',
      icon: Smartphone,
      color: 'text-pace-purple',
      accent: 'bg-gradient-to-b from-pace-purple to-indigo-500'
    },
    {
      label: 'MikroTik Connected',
      value: stats.mikrotik_connected,
      subValue: 'Direct router sync',
      icon: CheckCircle,
      color: 'text-blue-500',
      accent: 'bg-gradient-to-b from-blue-400 to-indigo-600'
    },
    {
      label: 'Router Sync Failed',
      value: stats.mikrotik_failed,
      subValue: 'Auto-retried by cron',
      icon: AlertCircle,
      color: 'text-rose-500',
      accent: 'bg-gradient-to-b from-rose-500 to-red-600',
      badge: stats.mikrotik_failed > 0 ? 'Cron Handles' : 'Healthy',
      badgeVariant: stats.mikrotik_failed > 0 ? 'warning' : 'success'
    }
  ]

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-admin-value tracking-tight">M-Pesa Transaction Logs</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pace-purple/10 text-pace-purple border border-pace-purple/20">
              Gateway Audit
            </span>
          </div>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Real-time audit log of all incoming M-Pesa payments, subscriber balance adjustments, and MikroTik router activations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={loadTransactions}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 text-xs font-semibold cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh Logs</span>
          </button>

          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, phone, subscriber, ref..."
              className="w-full pl-10 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all placeholder:text-admin-dim/60 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && transactions.length === 0 ? (
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

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">MikroTik Sync Status</label>
          <select
            value={mikrotikFilter}
            onChange={(e) => setMikrotikFilter(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-card-bg text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
          >
            <option value="all">All Router Statuses</option>
            <option value="connected">Connected (Synchronized)</option>
            <option value="failed">Failed (Pending Cron Retry)</option>
            <option value="pending">Pending</option>
            <option value="not_applicable">Not Applicable / Partial</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Payment Result</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-card-bg text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
          >
            <option value="all">All Payment Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">ISP Operator Filter</label>
          <select
            value={ispFilter}
            onChange={(e) => setIspFilter(Number(e.target.value))}
            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-card-bg text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
          >
            <option value={0}>All ISP Operators</option>
            {ispsList.map(isp => (
              <option key={isp.id} value={isp.id}>{isp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Database Table Card */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[1100px]">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Receipt Code</th>
                <th className="px-6 py-4">Account Ref</th>
                <th className="px-6 py-4">Subscriber</th>
                <th className="px-6 py-4">Sender Phone</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">MikroTik Router</th>
                <th className="px-6 py-4">Date Logged</th>
                <th className="px-6 py-4">ISP Owner</th>
                <th className="px-6 py-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-pace-bg-subtle rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-14 bg-pace-bg-subtle rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-admin-dim text-xs font-medium">
                    No transactions found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((txItem) => (
                  <tr key={txItem.id} className="hover:bg-pace-bg-subtle/30 transition-all duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-pace-purple text-xs">
                      {txItem.receipt_number}
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-admin-value text-xs">
                      {txItem.account_reference || '<NONE>'}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {txItem.pppoe_user_id ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-admin-value">{txItem.subscriber_name}</span>
                          <span className="text-[10px] text-admin-dim font-mono">User: {txItem.subscriber_username}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Unmatched Ref
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-admin-dim">
                      {txItem.phone_number}
                    </td>

                    <td className="px-6 py-4 text-xs font-bold text-admin-value">
                      KES {txItem.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4">
                      {getMikrotikBadge(txItem.mikrotik_status)}
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {formatNairobiDateTime(txItem.transaction_date)}
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {txItem.isp_name}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openInspectModal(txItem)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-admin-dim hover:text-admin-value hover:bg-pace-bg-subtle rounded-lg transition-all cursor-pointer"
                        title="Inspect Callback Payload & Diagnostics"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION MODAL */}
      <Modal
        isOpen={isInspectOpen}
        onClose={() => setIsInspectOpen(false)}
        title={`Transaction Inspection: ${selectedTx?.receipt_number}`}
        description="Comprehensive audit info, MikroTik router diagnostics, and raw callback JSON payload."
        maxWidth="max-w-2xl"
      >
        {selectedTx && (
          <div className="space-y-4 font-figtree">
            
            {/* Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Receipt Code</p>
                <p className="text-xs font-mono font-bold text-pace-purple">{selectedTx.receipt_number}</p>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Transacted Amount</p>
                <p className="text-xs font-bold text-admin-value">
                  KES {selectedTx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Sender MSISDN</p>
                <p className="text-xs font-mono text-admin-value">{selectedTx.phone_number}</p>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Account Ref</p>
                <p className="text-xs font-mono font-bold text-admin-value">{selectedTx.account_reference || '<EMPTY>'}</p>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">Transaction Date</p>
                <p className="text-xs font-medium text-admin-value">{formatNairobiDateTime(selectedTx.transaction_date)}</p>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">ISP Operator</p>
                <p className="text-xs font-semibold text-admin-value">{selectedTx.isp_name}</p>
              </div>
            </div>

            {/* Subscriber & Router Diagnostics */}
            <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-admin-value">
                  <Network size={14} className="text-pace-purple" />
                  <span>MikroTik Router & Subscriber State</span>
                </div>
                {getMikrotikBadge(selectedTx.mikrotik_status)}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs border-t border-pace-border/60 pt-2">
                <div>
                  <p className="text-[9px] uppercase text-admin-dim font-bold">Subscriber</p>
                  <p className="font-semibold text-admin-value">{selectedTx.subscriber_name || 'Unallocated'}</p>
                </div>

                <div>
                  <p className="text-[9px] uppercase text-admin-dim font-bold">PPPoE Username</p>
                  <p className="font-mono text-pace-purple">{selectedTx.subscriber_username || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[9px] uppercase text-admin-dim font-bold">Current Balance</p>
                  <p className={cn(
                    "font-bold",
                    (selectedTx.subscriber_balance ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {selectedTx.subscriber_balance !== null ? `KES ${selectedTx.subscriber_balance.toFixed(2)}` : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase text-admin-dim font-bold">Next Expiry Date</p>
                  <p className="font-medium text-admin-value">{selectedTx.subscriber_expiry || 'Not set'}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-[9px] uppercase text-admin-dim font-bold">Target Router</p>
                  <p className="font-medium text-admin-value">
                    {selectedTx.router_name ? `${selectedTx.router_name} (${selectedTx.router_ip})` : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedTx.mikrotik_response && (
                <div className="rounded-lg bg-card-bg p-2.5 border border-pace-border text-xs">
                  <p className="text-[9px] uppercase text-admin-dim font-bold mb-0.5">Router Response Message</p>
                  <p className="font-mono text-[11px] text-admin-value break-all">{selectedTx.mikrotik_response}</p>
                </div>
              )}
            </div>

            {/* RAW PAYLOAD INSPECTION */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-admin-dim flex items-center gap-1">
                  <Code size={12} />
                  Raw Callback JSON Payload
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyPayload(formatRawPayload(selectedTx.raw_payload))}
                  className="flex items-center gap-1 text-[11px] font-semibold text-pace-purple hover:underline cursor-pointer"
                >
                  {copiedPayload ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-3 bg-pace-bg-subtle border border-pace-border rounded-xl text-[11px] font-mono text-admin-value overflow-x-auto max-h-48 leading-relaxed">
                {formatRawPayload(selectedTx.raw_payload)}
              </pre>
            </div>

            <button
              onClick={() => setIsInspectOpen(false)}
              className="w-full bg-pace-bg-subtle border border-pace-border text-admin-value py-2.5 rounded-xl text-xs font-semibold hover:bg-pace-purple/5 hover:text-pace-purple transition-all cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        )}
      </Modal>

    </div>
  )
}
