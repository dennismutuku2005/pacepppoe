"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Smartphone, Search, RefreshCw, Eye, CheckCircle, AlertCircle, TrendingUp, ShieldAlert, Coins } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Skeleton } from '@/components/Skeleton'
import { mpesaService } from '@/services/admin/mpesa'
import { ispService } from '@/services/admin/isps'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminMpesaTransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [ispsList, setIspsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all')
  const [ispFilter, setIspFilter] = useState('all')

  // Modal states
  const [selectedTx, setSelectedTx] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Fetch transactions from API
  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const res = await mpesaService.getMpesaTransactions()
      if (res && res.status === 'success') {
        setTransactions(res.data || [])
      } else {
        toast.error(res?.message || 'Failed to retrieve transactions')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error fetching transactions')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch ISPs list for filter
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

  useEffect(() => {
    loadTransactions()
    loadISPs()
  }, [])

  const handleReload = () => {
    loadTransactions()
  }

  // Filters logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = 
        tx.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
        tx.phone_number.includes(search) ||
        tx.subscriber_name.toLowerCase().includes(search.toLowerCase()) ||
        tx.account_reference.toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' ? true : tx.status.toLowerCase() === statusFilter.toLowerCase()
      const matchesIsp = ispFilter === 'all' ? true : tx.isp_name.toLowerCase() === ispFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesIsp
    })
  }, [transactions, search, statusFilter, ispFilter])

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCount = transactions.length
    const totalVolume = transactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.amount : 0), 0)
    const completedCount = transactions.filter(t => t.status === 'completed').length
    const failedCount = transactions.filter(t => t.status === 'failed').length

    return { totalCount, totalVolume, completedCount, failedCount }
  }, [transactions])

  const openViewModal = (tx) => {
    setSelectedTx(tx)
    setIsViewOpen(true)
  }

  const getStatusBadgeVariant = (s) => {
    switch (s.toLowerCase()) {
      case 'completed': return 'success'
      case 'failed': return 'error'
      case 'refunded': return 'warning'
      default: return 'secondary'
    }
  }

  const cards = [
    { 
      label: 'Total Volume', 
      value: `KES ${stats.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
      icon: Coins, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      accent: 'bg-gradient-to-b from-emerald-400 to-teal-500'
    },
    { 
      label: 'Transactions Count', 
      value: stats.totalCount, 
      icon: Smartphone, 
      color: 'text-pace-purple', 
      bg: 'bg-pace-purple/10',
      accent: 'bg-gradient-to-b from-pace-purple to-indigo-500'
    },
    { 
      label: 'Completed Receipts', 
      value: stats.completedCount, 
      icon: CheckCircle, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      accent: 'bg-gradient-to-b from-blue-400 to-indigo-600'
    },
    { 
      label: 'Failed Requests', 
      value: stats.failedCount, 
      icon: AlertCircle, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10',
      accent: 'bg-gradient-to-b from-rose-500 to-red-600'
    }
  ]

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">M-Pesa Transaction ledger</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Audit customer paybill transactions, payments, and subscriptions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 w-full sm:flex-1">
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="p-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 shrink-0"
              title="Refresh Ledger"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
            
            <div className="relative flex-1 sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code, phone, client..."
                className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && transactions.length === 0 ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-card-bg border border-pace-border rounded-xl p-3.5 sm:p-5 shadow-sm min-w-0">
              <div className="flex items-center justify-between gap-2 mb-4">
                <Skeleton className="h-4 w-16 sm:w-24" />
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shrink-0" />
              </div>
              <Skeleton className="h-7 w-12 sm:w-16" />
            </div>
          ))
        ) : cards.map((card) => (
          <div key={card.label} className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
            {/* Left accent color strip */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", card.accent)} />
            
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={card.label}>
                  {card.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 tracking-tight group-hover:scale-[1.02] transition-transform origin-left duration-300">
                  {card.value}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-pace-border/5 bg-pace-bg-subtle shrink-0">
                <card.icon className={cn(card.color, "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5")} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Transaction Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-card-bg text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">ISP Operator Linkage</label>
          <select
            value={ispFilter}
            onChange={(e) => setIspFilter(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-card-bg text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
          >
            <option value="all">All Operators</option>
            {ispsList.map(isp => (
              <option key={isp.id} value={isp.name}>{isp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Database Table Card */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Receipt</th>
                <th className="px-6 py-4">Subscriber</th>
                <th className="px-6 py-4">Sender Phone</th>
                <th className="px-6 py-4">Account Ref</th>
                <th className="px-6 py-4">ISP Owner</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date Logged</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-12 bg-pace-bg-subtle rounded-full" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-pace-bg-subtle rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-admin-dim text-xs font-medium">
                    No transactions found in paybill ledger.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txItem) => (
                  <tr key={txItem.id} className="hover:bg-pace-bg-subtle/30 transition-all duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-pace-purple text-xs">
                      {txItem.receipt_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-admin-value text-xs">
                      {txItem.subscriber_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-admin-dim">
                      {txItem.phone_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-admin-value text-xs">
                      {txItem.account_reference}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {txItem.isp_name}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-admin-value">
                      KES {txItem.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {new Date(txItem.transaction_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(txItem.status)} className="text-[9px] font-bold border-none px-2 py-0.5 uppercase tracking-wider">
                        {txItem.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openViewModal(txItem)}
                        className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-admin-value transition-all"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Paybill Code: ${selectedTx?.receipt_number}`}
        description="M-Pesa transaction validation records."
        maxWidth="max-w-md"
      >
        {selectedTx && (
          <div className="space-y-4 font-figtree">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Receipt Code', value: selectedTx.receipt_number },
                { label: 'Subscriber Profile', value: selectedTx.subscriber_name },
                { label: 'Sender Phone number', value: selectedTx.phone_number },
                { label: 'Account Code Ref', value: selectedTx.account_reference },
                { label: 'ISP Scope Name', value: selectedTx.isp_name },
                { label: 'Transacted Amount', value: `KES ${selectedTx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                { label: 'Date Logged', value: new Date(selectedTx.transaction_date).toLocaleString('en-US') },
                { label: 'M-Pesa Status', value: selectedTx.status.toUpperCase() }
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                  <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">{item.label}</p>
                  <p className="text-xs font-bold text-admin-value leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsViewOpen(false)}
              className="w-full bg-pace-purple text-white py-2.5 rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all mt-2"
            >
              Dismiss Info
            </button>
          </div>
        )}
      </Modal>

    </div>
  )
}
