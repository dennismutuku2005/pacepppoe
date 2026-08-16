"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Wallet, ArrowUpRight, ArrowDownLeft, Building, CreditCard, Send, Edit, ShieldCheck, History, Landmark, Smartphone } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import authService from '@/lib/auth'

// Mock Wallet Data for the currently logged-in ISP
const INITIAL_ISP_WALLET = {
  balance: 128500.00,
  bankName: 'Equity Bank Kenya',
  bankAccount: '1280281294821',
  bankAccountName: 'Pace Networks Limited',
  bankBranch: 'Westlands Branch',
  mpesaNumber: '0701020304',
  history: [
    { id: 1, type: 'deposit', amount: 50000.00, channel: 'Bank Transfer', status: 'completed', description: 'Monthly credit top-up', date: '2026-08-09' },
    { id: 2, type: 'withdrawal', amount: 20000.00, channel: 'Bank Account', status: 'completed', description: 'Revenue settlement payout', date: '2026-08-05' },
    { id: 3, type: 'charge', amount: 15000.00, channel: 'System billing', status: 'completed', description: 'MikroTik lease fee - West Node', date: '2026-08-01' },
    { id: 4, type: 'deposit', amount: 93500.00, channel: 'M-Pesa STK', status: 'completed', description: 'Automated subscriber billing collections sync', date: '2026-07-28' },
    { id: 5, type: 'withdrawal', amount: 10000.00, channel: 'M-Pesa Number', status: 'completed', description: 'Emergency petty cash payout', date: '2026-07-15' }
  ]
}

export default function IspWalletDashboard() {
  const [wallet, setWallet] = useState(INITIAL_ISP_WALLET)
  const [user, setUser] = useState(null)

  // Modals Control
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isEditSettlementOpen, setIsEditSettlementOpen] = useState(false)

  // Withdraw Form Fields
  const [withdrawChannel, setWithdrawChannel] = useState('bank')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawNotes, setWithdrawNotes] = useState('')

  // Edit Settlement Form Fields
  const [bankName, setBankName] = useState(wallet.bankName)
  const [bankAccount, setBankAccount] = useState(wallet.bankAccount)
  const [bankAccountName, setBankAccountName] = useState(wallet.bankAccountName)
  const [bankBranch, setBankBranch] = useState(wallet.bankBranch)
  const [mpesaNumber, setMpesaNumber] = useState(wallet.mpesaNumber)

  useEffect(() => {
    setUser(authService.getUser())
  }, [])

  // Handle Withdraw
  const handleWithdrawSubmit = (e) => {
    e.preventDefault()
    const amount = Number(withdrawAmount)
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount to withdraw.')
      return
    }

    if (amount > wallet.balance) {
      toast.error('Insufficient wallet balance.', {
        description: `You can withdraw up to KSH ${wallet.balance.toLocaleString()}.`
      })
      return
    }

    const channelLabel = withdrawChannel === 'bank' ? 'Bank Account' : 'M-Pesa Number'
    const nextBalance = wallet.balance - amount
    const newTx = {
      id: Date.now(),
      type: 'withdrawal',
      amount,
      channel: channelLabel,
      status: 'completed',
      description: withdrawNotes || `Settlement request to ${channelLabel}`,
      date: new Date().toISOString().split('T')[0]
    }

    setWallet({
      ...wallet,
      balance: nextBalance,
      history: [newTx, ...wallet.history]
    })

    toast.success(`Withdrawal queued successfully.`, {
      description: `KSH ${amount.toLocaleString()} sent to ${channelLabel}.`
    })
    setIsWithdrawOpen(false)
    setWithdrawAmount('')
    setWithdrawNotes('')
  }

  // Handle Settlement Edit
  const handleSettlementSubmit = (e) => {
    e.preventDefault()
    setWallet({
      ...wallet,
      bankName,
      bankAccount,
      bankAccountName,
      bankBranch,
      mpesaNumber
    })
    toast.success('Settlement parameters updated successfully.')
    setIsEditSettlementOpen(false)
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">Wallet & Payouts</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Manage your ISP pre-paid balance, request bank or mobile wallet settlements, and view accounting ledgers.
          </p>
        </div>
        <button
          onClick={() => setIsWithdrawOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-95"
        >
          <Send size={14} /> Request Payout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Balance and bank details */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Elegant Wallet Card */}
          <div className="bg-gradient-to-br from-pace-purple to-indigo-900 border border-pace-purple/30 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Virtual ISP Wallet</span>
              <Wallet size={20} className="text-white/80" />
            </div>
            <div className="text-[10px] font-medium text-white/60">AVAILABLE BALANCE</div>
            <div className="text-3xl font-bold mt-1">
              KSH {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/10 text-[11px] text-white/80 font-medium">
              <span>Account Status:</span>
              <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                ● Connected / Active
              </span>
            </div>
          </div>

          {/* Bank Settlement Info Card */}
          <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-admin-value uppercase tracking-wider">Settle To Bank</h3>
              <button
                onClick={() => setIsEditSettlementOpen(true)}
                className="text-xs text-pace-purple hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit size={12} /> Edit Details
              </button>
            </div>

            <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <Landmark className="text-admin-dim shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider">Settlement Bank</p>
                  <p className="text-xs font-semibold text-admin-value mt-0.5">{wallet.bankName}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{wallet.bankBranch}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-pace-border/60 pt-3">
                <CreditCard className="text-admin-dim shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider">Account Number</p>
                  <p className="text-xs font-semibold text-admin-value mt-0.5 font-mono">{wallet.bankAccount}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-pace-border/60 pt-3">
                <ShieldCheck className="text-admin-dim shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider">Account Name</p>
                  <p className="text-xs font-semibold text-admin-value mt-0.5">{wallet.bankAccountName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-pace-border/60 pt-3">
                <Smartphone className="text-admin-dim shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider">Backup M-Pesa Number</p>
                  <p className="text-xs font-semibold text-admin-value mt-0.5 font-mono">{wallet.mpesaNumber}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Ledger Log Transactions */}
        <div className="lg:col-span-2 space-y-4 bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-admin-value uppercase tracking-wider">Wallet Transaction History</h3>
              <p className="text-[10px] text-admin-dim mt-0.5">Comprehensive audit ledger of credits, charges, and payouts.</p>
            </div>
            <History size={16} className="text-admin-dim" />
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {wallet.history.map((tx) => {
              const isDeposit = tx.type === 'deposit'
              const isWithdrawal = tx.type === 'withdrawal'
              return (
                <div key={tx.id} className="p-3.5 border border-pace-border rounded-xl flex justify-between items-center bg-pace-bg-subtle/50 hover:bg-pace-bg-subtle transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center border",
                      isDeposit 
                        ? "bg-green-500/10 text-green-600 border-green-500/10" 
                        : isWithdrawal
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/10"
                        : "bg-rose-500/10 text-rose-600 border-rose-500/10"
                    )}>
                      {isDeposit ? <ArrowUpRight size={16} /> : isWithdrawal ? <ArrowDownLeft size={16} /> : <CreditCard size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-admin-value">{tx.description}</p>
                      <div className="flex items-center gap-2 text-[9px] text-admin-dim mt-1">
                        <span className="font-medium bg-pace-border/40 px-1.5 py-0.25 rounded-md uppercase">{tx.channel}</span>
                        <span>·</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-bold font-mono",
                      isDeposit ? "text-green-600" : isWithdrawal ? "text-blue-600" : "text-rose-600"
                    )}>
                      {isDeposit ? `+` : `-`} KSH {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant="success" className="text-[8px] font-black uppercase border-none tracking-widest px-1 py-0 px-1.5 mt-1">{tx.status}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* REQUEST WITHDRAWAL MODAL */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="Request Revenue Settlement"
        description="Withdraw balance earnings directly to your mobile wallet or settlement bank account."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-left font-figtree">
          <div className="p-3.5 bg-pace-purple-light/50 border border-pace-purple/10 rounded-xl flex justify-between items-center text-xs">
            <span className="text-admin-dim font-medium">Available Payout balance:</span>
            <span className="font-extrabold text-pace-purple font-mono">
              KSH {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Settlement Channel *</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setWithdrawChannel('bank')}
                className={cn(
                  "py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  withdrawChannel === 'bank' 
                    ? "bg-pace-purple text-white border-pace-purple" 
                    : "bg-pace-bg-subtle text-admin-dim border-pace-border"
                )}
              >
                <Building size={14} /> Bank Account
              </button>
              <button
                type="button"
                onClick={() => setWithdrawChannel('mpesa')}
                className={cn(
                  "py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  withdrawChannel === 'mpesa' 
                    ? "bg-pace-purple text-white border-pace-purple" 
                    : "bg-pace-bg-subtle text-admin-dim border-pace-border"
                )}
              >
                <Smartphone size={14} /> M-Pesa Wallet
              </button>
            </div>
            {withdrawChannel === 'bank' ? (
              <p className="text-[9px] text-gray-400 mt-2 pl-1 leading-normal">
                Funds will be settled to: <strong>{wallet.bankName} (A/C: {wallet.bankAccount})</strong>. Settles within 24 business hours.
              </p>
            ) : (
              <p className="text-[9px] text-gray-400 mt-2 pl-1 leading-normal">
                Funds will be settled to M-Pesa Number: <strong>{wallet.mpesaNumber}</strong>. Settles instantly via STK payouts.
              </p>
            )}
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Amount to Withdraw (KSH) *</label>
            <input
              type="number"
              required
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="e.g. 20000"
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Withdrawal Reference Notes (Optional)</label>
            <input
              value={withdrawNotes}
              onChange={(e) => setWithdrawNotes(e.target.value)}
              placeholder="e.g. Q3 billing payouts"
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(false)}
              className="flex-1 px-4 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send size={12} /> Confirm Withdrawal
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT SETTLEMENT DETAILS MODAL */}
      <Modal
        isOpen={isEditSettlementOpen}
        onClose={() => setIsEditSettlementOpen(false)}
        title="Configure Settlement Details"
        description="Update your primary bank clearing and mobile payout accounts."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSettlementSubmit} className="space-y-4 text-left font-figtree">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Bank Name *</label>
              <input
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Equity Bank"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Branch Name *</label>
              <input
                required
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                placeholder="e.g. Westlands Branch"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Account Holder Name *</label>
            <input
              required
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              placeholder="e.g. Pace Networks Ltd"
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Account Number *</label>
              <input
                required
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="e.g. 12809281294821"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">M-Pesa Payout Mobile *</label>
              <input
                required
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
                placeholder="e.g. 0701020304"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditSettlementOpen(false)}
              className="flex-1 px-4 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
