"use client"

import React, { useState, useMemo } from 'react'
import { Coins, Search, Plus, Wallet, RefreshCw, ArrowUpRight, ArrowDownLeft, Calendar, FileText, Trash2, Edit, Smartphone, CheckCircle, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Mock Initial ISP Wallets
const INITIAL_WALLETS = [
  {
    id: 1,
    ispId: 2,
    ispName: 'Pace Networks Ltd',
    username: 'pacenet',
    amount: 128500.00,
    created_at: '2026-03-15 10:00:00',
    updated_at: '2026-08-09 14:30:11',
    history: [
      { id: 1, type: 'deposit', amount: 50000, description: 'Bank Transfer clearance', date: '2026-08-09' },
      { id: 2, type: 'charge', amount: 15000, description: 'Monthly router link lease fee', date: '2026-08-01' }
    ]
  },
  {
    id: 2,
    ispId: 3,
    ispName: 'Eastlink Communications',
    username: 'eastlink',
    amount: 94200.00,
    created_at: '2026-04-20 11:30:00',
    updated_at: '2026-08-09 16:15:22',
    history: [
      { id: 1, type: 'deposit', amount: 40000, description: 'M-Pesa Paybill automatic top-up', date: '2026-08-08' }
    ]
  },
  {
    id: 3,
    ispId: 4,
    ispName: 'Rift Valley Fiber',
    username: 'riftfiber',
    amount: -12500.00,
    created_at: '2026-05-02 09:15:00',
    updated_at: '2026-08-08 17:45:00',
    history: [
      { id: 1, type: 'charge', amount: 22000, description: 'MikroTik CCR lease quarterly charge', date: '2026-08-08' }
    ]
  }
]

// Mock M-Pesa Transactions across all ISPs/Users
const INITIAL_MPESA_TRANSACTIONS = [
  {
    id: 1,
    receiptNumber: 'RK4S2L9X',
    customerName: 'John Doe',
    phone: '254711223344',
    accountReference: 'john_pppoe',
    amount: 1500.00,
    ispName: 'Pace Networks Ltd',
    date: '2026-08-09 08:30',
    status: 'completed'
  },
  {
    id: 2,
    receiptNumber: 'RL1P0M8A',
    customerName: 'Jane Smith',
    phone: '254722334455',
    accountReference: 'jane_wifi',
    amount: 2500.00,
    ispName: 'Eastlink Communications',
    date: '2026-08-09 09:15',
    status: 'completed'
  },
  {
    id: 3,
    receiptNumber: 'RM9Q3N7B',
    customerName: 'Robert Ngugi',
    phone: '254733445566',
    accountReference: 'rob_ngugi',
    amount: 3500.00,
    ispName: 'Rift Valley Fiber',
    date: '2026-08-08 14:20',
    status: 'failed'
  },
  {
    id: 4,
    receiptNumber: 'RN8R4O6C',
    customerName: 'Alice Wanjiku',
    phone: '254744556677',
    accountReference: 'ali_wanj',
    amount: 1500.00,
    ispName: 'Pace Networks Ltd',
    date: '2026-08-07 16:45',
    status: 'completed'
  }
]

const MOCK_ISPS = [
  { id: 2, name: 'Pace Networks Ltd', username: 'pacenet' },
  { id: 3, name: 'Eastlink Communications', username: 'eastlink' },
  { id: 4, name: 'Rift Valley Fiber', username: 'riftfiber' }
]

export default function AdminWalletsCrudPage() {
  // Tabs: 'wallets' or 'mpesa'
  const [activeTab, setActiveTab] = useState('wallets')
  
  // Data States
  const [wallets, setWallets] = useState(INITIAL_WALLETS)
  const [transactions, setTransactions] = useState(INITIAL_MPESA_TRANSACTIONS)
  const [search, setSearch] = useState('')
  const [ispFilter, setIspFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal control
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isWalletFormOpen, setIsWalletFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Current selected entities
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [editingWallet, setEditingWallet] = useState(null)
  const [deletingWallet, setDeletingWallet] = useState(null)

  // Adjustment fields
  const [adjustType, setAdjustType] = useState('deposit')
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')

  // Wallet form fields (CRUD)
  const [walletIspId, setWalletIspId] = useState(2)
  const [walletAmount, setWalletAmount] = useState('')

  // Filter wallets lists
  const filteredWallets = useMemo(() => {
    return wallets.filter((w) => {
      const matchesSearch = 
        w.ispName.toLowerCase().includes(search.toLowerCase()) ||
        w.username.toLowerCase().includes(search.toLowerCase())
      
      const isNegative = w.amount < 0
      const matchesStatus = 
        statusFilter === 'all' 
          ? true 
          : statusFilter === 'ok' 
          ? !isNegative 
          : isNegative

      return matchesSearch && matchesStatus
    })
  }, [wallets, search, statusFilter])

  // Filter M-Pesa transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = 
        tx.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
        tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
        tx.phone.includes(search) ||
        tx.accountReference.toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' ? true : tx.status === statusFilter
      const matchesIsp = ispFilter === 'all' ? true : tx.ispName === ispFilter

      return matchesSearch && matchesStatus && matchesIsp
    })
  }, [transactions, search, statusFilter, ispFilter])

  // Statistics
  const stats = useMemo(() => {
    const totalBalance = wallets.reduce((sum, w) => sum + w.amount, 0)
    const negativeCount = wallets.filter(w => w.amount < 0).length
    const positiveCount = wallets.filter(w => w.amount >= 0).length
    
    const mpesaVolume = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)

    return { totalBalance, negativeCount, positiveCount, mpesaVolume }
  }, [wallets, transactions])

  // Open Wallet CRUD form (Add or Edit)
  const openWalletForm = (wallet = null) => {
    if (wallet) {
      setEditingWallet(wallet)
      setWalletIspId(wallet.ispId)
      setWalletAmount(wallet.amount.toString())
    } else {
      setEditingWallet(null)
      setWalletIspId(2)
      setWalletAmount('')
    }
    setIsWalletFormOpen(true)
  }

  // Handle Wallet Create or Update
  const handleWalletSubmit = (e) => {
    e.preventDefault()
    if (!walletAmount) {
      toast.error('Wallet balance is required.')
      return
    }

    const selectedIsp = MOCK_ISPS.find(isp => isp.id === Number(walletIspId)) || { name: 'Independent', username: 'unknown' }

    if (!editingWallet) {
      // Check if wallet already exists for this ISP
      const exists = wallets.some(w => w.ispId === Number(walletIspId))
      if (exists) {
        toast.error(`A prepaid wallet already exists for ${selectedIsp.name}.`)
        return
      }

      // Create
      const newWallet = {
        id: Date.now(),
        ispId: Number(walletIspId),
        ispName: selectedIsp.name,
        username: selectedIsp.username,
        amount: Number(walletAmount),
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        history: [{ id: 1, type: 'deposit', amount: Number(walletAmount), description: 'Wallet creation deposit', date: new Date().toISOString().split('T')[0] }]
      }
      setWallets([...wallets, newWallet])
      toast.success(`Prepaid wallet created for ${selectedIsp.name}.`)
    } else {
      // Edit
      setWallets(wallets.map(w => w.id === editingWallet.id ? {
        ...w,
        amount: Number(walletAmount),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      } : w))
      toast.success(`Wallet balance modified.`)
    }
    setIsWalletFormOpen(false)
  }

  // Open adjustment modal (Deposit/Charge)
  const openAdjustModal = (wallet) => {
    setSelectedWallet(wallet)
    setAdjustType('deposit')
    setAdjustAmount('')
    setAdjustReason('')
    setIsAdjustOpen(true)
  }

  // Handle Balance Adjustment
  const handleAdjustSubmit = (e) => {
    e.preventDefault()
    const value = Number(adjustAmount)
    if (!value || value <= 0) {
      toast.error('Enter a valid amount.')
      return
    }

    const netAdjustment = value * (adjustType === 'deposit' ? 1 : -1)

    setWallets(wallets.map((w) => {
      if (w.id === selectedWallet.id) {
        const nextAmount = w.amount + netAdjustment
        const nextHistory = [
          {
            id: Date.now(),
            type: adjustType,
            amount: value,
            description: adjustReason || (adjustType === 'deposit' ? 'Admin deposit Adjustment' : 'Admin charge adjustment'),
            date: new Date().toISOString().split('T')[0]
          },
          ...w.history
        ]
        return {
          ...w,
          amount: nextAmount,
          history: nextHistory,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      }
      return w
    }))

    toast.success(`Wallet balance adjusted.`, {
      description: `${adjustType === 'deposit' ? 'Deposited' : 'Debited'} KSH ${value.toLocaleString()} to ${selectedWallet.ispName}`
    })
    setIsAdjustOpen(false)
  }

  // Trigger Delete Wallet
  const confirmDelete = (wallet) => {
    setDeletingWallet(wallet)
    setIsDeleteOpen(true)
  }

  const handleDeleteExecute = () => {
    setWallets(wallets.filter(w => w.id !== deletingWallet.id))
    toast.success(`Prepaid wallet deleted successfully.`)
    setIsDeleteOpen(false)
  }

  // Open ledger logs
  const openHistoryModal = (wallet) => {
    setSelectedWallet(wallet)
    setIsHistoryOpen(true)
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">ISP Wallet & Transactions</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Perform CRUD on virtual ISP wallets, adjust balances, and audit all mobile M-Pesa payments globally.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => openWalletForm()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-95"
          >
            <Plus size={16} /> Authorize Prepaid Wallet
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex border border-pace-border p-1 bg-pace-bg-subtle/80 rounded-xl max-w-sm w-full sm:w-auto">
          <button
            onClick={() => { setActiveTab('wallets'); setSearch(''); }}
            className={cn(
              "flex-1 sm:flex-initial text-xs px-5 py-2 font-medium rounded-lg transition-all cursor-pointer",
              activeTab === 'wallets'
                ? "bg-card-bg text-pace-purple shadow-sm border border-pace-border/30"
                : "text-admin-dim hover:text-admin-value"
            )}
          >
            ISP Wallets ({wallets.length})
          </button>
          <button
            onClick={() => { setActiveTab('mpesa'); setSearch(''); }}
            className={cn(
              "flex-1 sm:flex-initial text-xs px-5 py-2 font-medium rounded-lg transition-all cursor-pointer",
              activeTab === 'mpesa'
                ? "bg-card-bg text-pace-purple shadow-sm border border-pace-border/30"
                : "text-admin-dim hover:text-admin-value"
            )}
          >
            M-Pesa Audits ({transactions.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-60 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'wallets' ? "Search ISP..." : "Search receipt, client..."}
              className="w-full pl-9 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
            />
          </div>

          {activeTab === 'mpesa' && (
            <select
              value={ispFilter}
              onChange={(e) => setIspFilter(e.target.value)}
              className="px-3 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value outline-none focus:border-pace-purple"
            >
              <option value="all">All ISPs</option>
              {MOCK_ISPS.map(isp => (
                <option key={isp.id} value={isp.name}>{isp.name}</option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value outline-none focus:border-pace-purple"
          >
            <option value="all">All Statuses</option>
            {activeTab === 'wallets' ? (
              <>
                <option value="ok">Credit Ok (KSH &gt;= 0)</option>
                <option value="debt">Outstanding Debt (KSH &lt; 0)</option>
              </>
            ) : (
              <>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Consolidated Holdings</span>
            <div className="p-2 rounded-xl bg-pace-purple/10 text-pace-purple"><Wallet size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">
            KSH {stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Sum balance of all authorized wallets</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">M-Pesa Vol (Completed)</span>
            <div className="p-2 rounded-xl bg-green-500/10 text-green-600"><CheckCircle size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">
            KSH {stats.mpesaVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Aggregate transaction collection</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Deficit ISP Accounts</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600"><ArrowDownLeft size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">{stats.negativeCount}</div>
          <p className="text-[10px] text-gray-400 mt-2">ISPs with outstanding debit</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Credit Allowed Tiers</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600"><Coins size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">{stats.positiveCount}</div>
          <p className="text-[10px] text-gray-400 mt-2">ISPs holding active credit lines</p>
        </div>
      </div>

      {/* Main Table Content */}
      {activeTab === 'wallets' ? (
        /* WALLETS TABLE (CRUD) */
        <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-3.5">ISP Organization</th>
                  <th className="px-6 py-3.5">Username</th>
                  <th className="px-6 py-3.5">Current Balance</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5">Last Sync Time</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pace-border">
                {filteredWallets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-admin-dim text-xs">
                      No ISP wallets match your search.
                    </td>
                  </tr>
                ) : (
                  filteredWallets.map((wallet) => {
                    const isNegative = wallet.amount < 0
                    return (
                      <tr key={wallet.id} className="hover:bg-pace-bg-subtle/40 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border",
                              isNegative 
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/10" 
                                : "bg-pace-purple-light text-pace-purple border-pace-purple/10"
                            )}>
                              {wallet.ispName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-admin-value">{wallet.ispName}</p>
                              <p className="text-[10px] text-gray-400">ID: WLT-{wallet.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-admin-value">{wallet.username}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-xs font-bold font-mono px-2 py-0.5 rounded-lg border",
                            isNegative 
                              ? "bg-rose-500/5 text-rose-600 border-rose-500/20" 
                              : wallet.amount === 0 
                              ? "bg-green-500/5 text-green-600 border-green-500/20"
                              : "bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                          )}>
                            {isNegative ? `- KSH ${Math.abs(wallet.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `KSH ${wallet.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={!isNegative ? 'success' : 'error'} className="text-[9px] uppercase font-bold">
                            {!isNegative ? 'Active Credit' : 'Suspended Arrears'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-admin-dim">{wallet.created_at}</td>
                        <td className="px-6 py-4 text-xs text-admin-dim">{wallet.updated_at}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openHistoryModal(wallet)}
                              className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-bg-subtle rounded-xl border border-transparent transition-all cursor-pointer"
                              title="Audit Ledger history"
                            >
                              <FileText size={13} />
                            </button>
                            <button
                              onClick={() => openAdjustModal(wallet)}
                              className="p-2 text-admin-dim hover:text-emerald-600 hover:bg-pace-bg-subtle rounded-xl border border-transparent transition-all cursor-pointer"
                              title="Quick Deposit/Charge"
                            >
                              <RefreshCw size={13} />
                            </button>
                            <button
                              onClick={() => openWalletForm(wallet)}
                              className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-bg-subtle rounded-xl border border-transparent transition-all cursor-pointer"
                              title="Edit Wallet Info"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => confirmDelete(wallet)}
                              className="p-2 text-admin-dim hover:text-rose-600 hover:bg-rose-50/50 rounded-xl border border-transparent transition-all cursor-pointer"
                              title="Deauthorize Wallet"
                            >
                              <Trash2 size={13} />
                            </button>
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
      ) : (
        /* M-PESA TRANSACTIONS AUDIT TABLE */
        <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-3.5">Receipt Number</th>
                  <th className="px-6 py-3.5">Subscriber Detail</th>
                  <th className="px-6 py-3.5">M-Pesa Mobile</th>
                  <th className="px-6 py-3.5">Account Reference</th>
                  <th className="px-6 py-3.5">Target ISP</th>
                  <th className="px-6 py-3.5">Amount (KSH)</th>
                  <th className="px-6 py-3.5">Transaction Date</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pace-border font-figtree">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center text-admin-dim text-xs">
                      No M-Pesa transactions found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-pace-bg-subtle/40 transition-all duration-200">
                      <td className="px-6 py-4 font-mono font-semibold text-xs text-pace-purple">
                        {tx.receiptNumber}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-admin-value">
                        {tx.customerName}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-admin-value">
                        +{tx.phone}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-admin-label">
                        {tx.accountReference}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-admin-value">
                        {tx.ispName}
                      </td>
                      <td className="px-6 py-4 font-bold font-mono text-xs text-admin-value">
                        KSH {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-xs text-admin-dim font-mono">
                        {tx.date}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge 
                          variant={tx.status === 'completed' ? 'success' : 'error'} 
                          className="text-[9px] font-bold uppercase"
                        >
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADJUST WALLET BALANCE MODAL */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Quick Balance Adjustment"
        description={selectedWallet ? `Change account balances for ${selectedWallet.ispName}` : ''}
        maxWidth="max-w-md"
      >
        {selectedWallet && (
          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-left font-figtree">
            <div className="p-3 bg-pace-bg-subtle border border-pace-border rounded-xl space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-admin-dim">Current Balance:</span>
                <span className="font-bold text-admin-value font-mono">
                  KSH {selectedWallet.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Adjustment Type *</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('deposit')}
                  className={cn(
                    "py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    adjustType === 'deposit' 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" 
                      : "bg-pace-bg-subtle text-admin-dim border-pace-border"
                  )}
                >
                  <ArrowUpRight size={14} /> Deposit (Credit)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('charge')}
                  className={cn(
                    "py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    adjustType === 'charge' 
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/30" 
                      : "bg-pace-bg-subtle text-admin-dim border-pace-border"
                  )}
                >
                  <ArrowDownLeft size={14} /> Charge (Debit)
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Amount (KSH) *</label>
              <input
                type="number"
                required
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Adjustment Memo / Reference *</label>
              <textarea
                required
                rows={2}
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Bank slip clearance ref: DP-9923"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              />
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAdjustOpen(false)}
                className="flex-1 px-4 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Apply Adjustment
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* WALLET LEDGER HISTORY */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={selectedWallet ? `${selectedWallet.ispName} Wallet Ledger` : ''}
        description="List of credit deposits and charges for this ISP."
        maxWidth="max-w-lg"
      >
        {selectedWallet && (
          <div className="space-y-4 font-figtree animate-in fade-in">
            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
              {selectedWallet.history.map((tx) => (
                <div key={tx.id} className="p-3 border border-pace-border rounded-xl flex justify-between items-center bg-pace-bg-subtle/50 hover:bg-pace-bg-subtle transition-all">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center border",
                      tx.type === 'deposit' 
                        ? "bg-green-500/10 text-green-600 border-green-500/10" 
                        : "bg-rose-500/10 text-rose-600 border-rose-500/10"
                    )}>
                      {tx.type === 'deposit' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-admin-value">{tx.description}</p>
                      <div className="flex items-center gap-1 text-[9px] text-admin-dim mt-0.5">
                        <Calendar size={10} />
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-bold font-mono",
                    tx.type === 'deposit' ? "text-green-600" : "text-rose-600"
                  )}>
                    {tx.type === 'deposit' ? `+` : `-`} KSH {tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsHistoryOpen(false)}
              className="w-full bg-pace-bg-subtle border border-pace-border text-admin-dim py-2.5 rounded-xl text-xs font-semibold hover:text-admin-value transition-all cursor-pointer mt-4"
            >
              Close Ledger Logs
            </button>
          </div>
        )}
      </Modal>

      {/* CREATE & EDIT PREPAID WALLET MODAL (CRUD) */}
      <Modal
        isOpen={isWalletFormOpen}
        onClose={() => setIsWalletFormOpen(false)}
        title={editingWallet ? "Edit Prepaid Wallet" : "Authorize Prepaid Wallet"}
        description={editingWallet ? `Modify parameters for WLT-${editingWallet.id}` : "Authorize new prepaid credit wallet for partner ISP."}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleWalletSubmit} className="space-y-4 text-left font-figtree">
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Select Partner ISP *</label>
            <select
              disabled={!!editingWallet}
              value={walletIspId}
              onChange={(e) => setWalletIspId(Number(e.target.value))}
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            >
              {MOCK_ISPS.map(isp => (
                <option key={isp.id} value={isp.id}>{isp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Initial Wallet Balance (KSH) *</label>
            <input
              type="number"
              required
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
              placeholder="e.g. 100000"
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
            />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsWalletFormOpen(false)}
              className="flex-1 px-4 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              {editingWallet ? "Save Wallet Config" : "Authorize Wallet"}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL (CRUD) */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Wallet Deauthorization"
        description="Are you sure you want to delete this prepaid wallet? Deleting the wallet prevents this ISP from clearing traffic queues."
        type="danger"
        confirmText="Deauthorize Wallet"
        onConfirm={handleDeleteExecute}
      >
        {deletingWallet && (
          <div className="mt-4 p-4 border border-rose-100 bg-rose-50/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-figtree">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>
              You are deleting the wallet for <strong>{deletingWallet.ispName}</strong>. If their balance is deleted, they will lose ability to clear active subscriptions.
            </span>
          </div>
        )}
      </Modal>

    </div>
  )
}
