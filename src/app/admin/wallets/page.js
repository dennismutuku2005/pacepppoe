"use client"

import React, { useState, useEffect } from 'react'
import { Wallet, Search, RefreshCw, Edit, Eye, ShieldAlert, Coins } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { walletService } from '@/services/admin/wallets'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals state
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [newAmount, setNewAmount] = useState('')

  // Load wallets from API
  const loadWallets = async () => {
    setIsLoading(true)
    try {
      const res = await walletService.getWallets()
      if (res && res.status === 'success') {
        setWallets(res.data || [])
      } else {
        toast.error(res?.message || 'Failed to retrieve wallets balance')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error fetching wallets balance')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWallets()
  }, [])

  const handleReload = () => {
    loadWallets()
  }

  // Calculate total balance across all wallets
  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0)

  // Filter wallets by search input
  const filteredWallets = wallets.filter(w =>
    w.isp_name.toLowerCase().includes(search.toLowerCase()) ||
    w.isp_username.toLowerCase().includes(search.toLowerCase())
  )

  const openViewModal = (wallet) => {
    setSelectedWallet(wallet)
    setIsViewOpen(true)
  }

  const openEditModal = (wallet) => {
    setSelectedWallet(wallet)
    setNewAmount(parseFloat(wallet.amount).toFixed(2))
    setIsEditOpen(false) // Reset
    setTimeout(() => {
      setIsEditOpen(true)
    }, 50)
  }

  // Edit form trigger to confirm dialog
  const handleEditSubmit = () => {
    if (newAmount === '' || isNaN(parseFloat(newAmount))) {
      toast.error('Please specify a valid balance amount.')
      return
    }
    if (parseFloat(newAmount) < 0) {
      toast.error('Wallet balance cannot be negative.')
      return
    }
    setIsConfirmOpen(true)
  }

  // Confirm manual balance rewrite API call
  const handleConfirmSubmit = async () => {
    setIsSaving(true)
    try {
      const res = await walletService.setWalletBalance(selectedWallet.id, parseFloat(newAmount))
      if (res && res.status === 'success') {
        toast.success(`Wallet for ${selectedWallet.isp_name} manually set to KES ${parseFloat(newAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
        setIsConfirmOpen(false)
        setIsEditOpen(false)
        loadWallets()
      } else {
        toast.error(res?.message || 'Failed to update wallet balance')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error updating wallet balance')
    } finally {
      setIsSaving(false)
    }
  }

  // Helper to format currency
  const formatCurrency = (val) => {
    const num = parseFloat(val || 0)
    return 'KES ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Format date cleanly
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00 00:00:00') return 'Never'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">ISP Wallets Console</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Manage tenant balances and manual billing overrides.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 w-full sm:flex-1">
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="p-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 shrink-0"
              title="Refresh Balance"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
            
            <div className="relative flex-1 sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ISP operator..."
                className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Single Card: Total in Wallets */}
      <div className="max-w-md">
        <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/80 border border-pace-border rounded-2xl p-5 shadow-sm min-w-0 transition-all duration-300">
          {/* Accent vertical left strip */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pace-purple to-indigo-500" />
          
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-admin-dim">
                Total in ISP Wallets
              </p>
              {isLoading ? (
                <div className="h-8 w-32 bg-pace-bg-subtle rounded-md animate-pulse mt-2" />
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-admin-value mt-2">
                  {formatCurrency(totalBalance)}
                </p>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-pace-purple/10 bg-pace-purple/5 shrink-0">
              <Coins className="text-pace-purple w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Database Table Card */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-semibold text-admin-dim text-xs">
                <th className="px-6 py-4">ISP Operator</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Wallet Balance</th>
                <th className="px-6 py-4">Last Update</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-36 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-pace-bg-subtle rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-admin-dim text-xs font-medium">
                    No active ISP operator wallets found.
                  </td>
                </tr>
              ) : (
                filteredWallets.map((walletItem) => (
                  <tr key={walletItem.id} className="hover:bg-pace-bg-subtle/30 transition-all duration-150">
                    <td className="px-6 py-4 font-semibold text-admin-value text-xs">
                      {walletItem.isp_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-admin-dim">
                      {walletItem.isp_username}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-admin-value">
                      {formatCurrency(walletItem.amount)}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {formatDate(walletItem.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(walletItem)}
                          className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-admin-value transition-all"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(walletItem)}
                          className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-pace-purple transition-all"
                          title="Adjust Balance"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
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
        title={selectedWallet?.isp_name || 'Wallet Details'}
        description="Tenant billing profile parameters."
        maxWidth="max-w-md"
      >
        {selectedWallet && (
          <div className="space-y-4 font-figtree">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'ISP Operator', value: selectedWallet.isp_name },
                { label: 'System Username', value: selectedWallet.isp_username },
                { label: 'Current Balance', value: formatCurrency(selectedWallet.amount) },
                { label: 'Last Balance Update', value: formatDate(selectedWallet.updated_at) }
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                  <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">{item.label}</p>
                  <p className="text-xs font-bold text-admin-value">{item.value}</p>
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

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Adjust Balance: ${selectedWallet?.isp_name}`}
        description="Enter the target balance to overwrite this operator's wallet value."
        maxWidth="max-w-md"
      >
        {selectedWallet && (
          <div className="space-y-4 font-figtree">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">ISP Operator</label>
              <div className="mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value/70">
                {selectedWallet.isp_name}
              </div>
            </div>
            
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Current Value</label>
              <div className="mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-mono font-bold text-admin-value/70">
                {formatCurrency(selectedWallet.amount)}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">New Amount (KES)</label>
              <input
                type="number"
                step="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0.00"
                className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-mono font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>

            <button
              onClick={handleEditSubmit}
              className="w-full bg-pace-purple text-white py-2.5 rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all mt-2"
            >
              Adjust Balance
            </button>
          </div>
        )}
      </Modal>

      {/* CONFIRMATION MODAL */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Balance Adjustment"
        description="Are you absolutely sure you want to adjust this operator's wallet balance directly? This transaction will override their current funds."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-figtree">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-500">
            <ShieldAlert size={20} className="shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">Caution:</span> Setting the raw wallet balance directly bypasses normal automated Paybill deposits. Please confirm the new values match your physical accounts ledger.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-pace-bg-subtle border border-pace-border rounded-xl">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold">From Current</p>
              <p className="text-xs font-mono font-bold text-admin-value mt-1">{selectedWallet && formatCurrency(selectedWallet.amount)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold">To Target</p>
              <p className="text-xs font-mono font-bold text-pace-purple mt-1">{formatCurrency(newAmount)}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 bg-pace-bg-subtle text-admin-value border border-pace-border py-2.5 rounded-xl text-sm font-medium hover:bg-pace-purple/5 hover:text-pace-purple transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSubmit}
              disabled={isSaving}
              className="flex-1 bg-pace-purple text-white py-2.5 rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all disabled:opacity-50"
            >
              {isSaving ? "Updating..." : "Confirm & Save"}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
