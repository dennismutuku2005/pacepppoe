"use client"

import React, { useState, useMemo } from 'react'
import { Plus, Search, Trash2, Edit, CreditCard, Tag, Calendar, Layers, DollarSign } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Initial Mock Expenses scoped by ISP
const INITIAL_EXPENSES = [
  {
    id: 1,
    ispId: 2, // Pace Networks
    ispName: 'Pace Networks Ltd',
    amount: 45000.00,
    category: 'Bandwidth Backhaul',
    description: 'Safaricom 1Gbps fiber lease - Main Node',
    date: '2026-08-01'
  },
  {
    id: 2,
    ispId: 3, // Eastlink
    ispName: 'Eastlink Communications',
    amount: 15000.00,
    category: 'Tower Rent',
    description: 'Tower lease rental - West Ridge Station',
    date: '2026-08-05'
  },
  {
    id: 3,
    ispId: 2, // Pace Networks
    ispName: 'Pace Networks Ltd',
    amount: 2500.00,
    category: 'Utilities',
    description: 'KPLC Electricity payment token - East Hub',
    date: '2026-08-07'
  },
  {
    id: 4,
    ispId: 4, // Rift Valley Fiber
    ispName: 'Rift Valley Fiber',
    amount: 22000.00,
    category: 'Hardware Upgrade',
    description: 'MikroTik CCR2004 core router replacement',
    date: '2026-08-08'
  }
]

// Mock ISPs options
const MOCK_ISPS = [
  { id: 2, name: 'Pace Networks Ltd' },
  { id: 3, name: 'Eastlink Communications' },
  { id: 4, name: 'Rift Valley Fiber' }
]

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [ispFilter, setIspFilter] = useState('all')

  // Modal Control
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deletingExpense, setDeletingExpense] = useState(null)

  // Form Fields
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Bandwidth Backhaul')
  const [description, setDescription] = useState('')
  const [ispId, setIspId] = useState(2)
  const [date, setDate] = useState('')

  // Filter calculations
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch = 
        exp.description.toLowerCase().includes(search.toLowerCase()) ||
        exp.category.toLowerCase().includes(search.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' ? true : exp.category === categoryFilter
      const matchesIsp = ispFilter === 'all' ? true : exp.ispId === Number(ispFilter)

      return matchesSearch && matchesCategory && matchesIsp
    })
  }, [expenses, search, categoryFilter, ispFilter])

  // Stats calculation
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)
    const count = expenses.length
    const average = count > 0 ? total / count : 0
    const highest = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0

    return { total, count, average, highest }
  }, [expenses])

  // Open modal for add or edit
  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense)
      setAmount(expense.amount.toString())
      setCategory(expense.category)
      setDescription(expense.description)
      setIspId(expense.ispId)
      setDate(expense.date)
    } else {
      setEditingExpense(null)
      setAmount('')
      setCategory('Bandwidth Backhaul')
      setDescription('')
      setIspId(2)
      setDate(new Date().toISOString().split('T')[0])
    }
    setIsOpen(true)
  }

  // Handle Expense Submit
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || !description || !date) {
      toast.error('All fields are required.')
      return
    }

    const selectedIsp = MOCK_ISPS.find(isp => isp.id === Number(ispId)) || { name: 'Independent / System' }

    if (!editingExpense) {
      // Create new expense
      const newExp = {
        id: Date.now(),
        ispId: Number(ispId),
        ispName: selectedIsp.name,
        amount: Number(amount),
        category,
        description,
        date
      }
      setExpenses([newExp, ...expenses])
      toast.success(`Expense logged successfully.`, {
        description: `KSH ${Number(amount).toLocaleString()} allocated to ${selectedIsp.name}.`
      })
    } else {
      // Edit existing expense
      setExpenses(expenses.map(exp => exp.id === editingExpense.id ? {
        ...exp,
        ispId: Number(ispId),
        ispName: selectedIsp.name,
        amount: Number(amount),
        category,
        description,
        date
      } : exp))
      toast.success(`Expense updated successfully.`)
    }
    setIsOpen(false)
  }

  // Delete Trigger
  const triggerDelete = (expense) => {
    setDeletingExpense(expense)
    setIsDeleteOpen(true)
  }

  const handleDeleteExecute = () => {
    setExpenses(expenses.filter(exp => exp.id !== deletingExpense.id))
    toast.success(`Expense record removed.`)
    setIsDeleteOpen(false)
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">ISP Operations Expenses</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Track and audit infrastructure costs, link leasing, rent, and utility expenses logged across virtual ISP networks.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all cursor-pointer"
        >
          <Plus size={16} /> Log Expense
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search descriptions..."
            className="w-full pl-9 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value outline-none focus:border-pace-purple"
          >
            <option value="all">All Categories</option>
            <option value="Bandwidth Backhaul">Bandwidth Backhaul</option>
            <option value="Tower Rent">Tower Rent</option>
            <option value="Utilities">Utilities</option>
            <option value="Hardware Upgrade">Hardware Upgrade</option>
          </select>

          <select
            value={ispFilter}
            onChange={(e) => setIspFilter(e.target.value)}
            className="px-3 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value outline-none focus:border-pace-purple"
          >
            <option value="all">All ISPs</option>
            {MOCK_ISPS.map(isp => (
              <option key={isp.id} value={isp.id}>{isp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Total Operations Cost</span>
            <div className="p-2 rounded-xl bg-pace-purple/10 text-pace-purple"><CreditCard size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">
            KSH {stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Combined expenditures of all ISPs</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Logged Events</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600"><Calendar size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">{stats.count}</div>
          <p className="text-[10px] text-gray-400 mt-2">Invoice slips currently registered</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Average Expense</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600"><DollarSign size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">
            KSH {stats.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Average cost allocated per invoice</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Highest Invoice</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600"><Trash2 size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">
            KSH {stats.highest.toLocaleString()}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Max single invoice logged this term</p>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-3.5">Expense Details</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Managing ISP</th>
                <th className="px-6 py-3.5">Cost (KSH)</th>
                <th className="px-6 py-3.5">Billing Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-admin-dim text-xs">
                    No expense entries match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-pace-bg-subtle/40 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-semibold text-admin-value">{exp.description}</p>
                        <p className="text-[10px] text-gray-400">ID: EXP-{exp.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-admin-value">
                        <Tag size={12} className="text-admin-dim" />
                        <span>{exp.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Layers size={12} className="text-admin-dim" />
                        <span className="text-xs font-semibold text-admin-value">{exp.ispName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold font-mono text-rose-600 bg-rose-500/5 px-2 py-0.5 border border-rose-500/10 rounded-lg">
                        KSH {exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-admin-dim font-mono">{exp.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(exp)}
                          className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-bg-subtle rounded-xl border border-transparent transition-all cursor-pointer"
                          title="Edit Invoice details"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => triggerDelete(exp)}
                          className="p-2 text-admin-dim hover:text-rose-600 hover:bg-rose-50/50 rounded-xl border border-transparent transition-all cursor-pointer"
                          title="Delete Invoice"
                        >
                          <Trash2 size={13} />
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

      {/* LOG EXPENSE MODAL */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingExpense ? "Edit Expense Slip" : "Log Operational Expense"}
        description={editingExpense ? `Update expense particulars for EXP-${editingExpense.id}` : "Log outgoing operational bills, bandwidth cost, or node hardware expenses."}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left font-figtree">
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Expense Description *</label>
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fiber Tower Rent - Site A"
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Cost Amount (KSH) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Billing Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              >
                <option value="Bandwidth Backhaul">Bandwidth Backhaul</option>
                <option value="Tower Rent">Tower Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Hardware Upgrade">Hardware Upgrade</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Managing ISP *</label>
              <select
                value={ispId}
                onChange={(e) => setIspId(Number(e.target.value))}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              >
                {MOCK_ISPS.map(isp => (
                  <option key={isp.id} value={isp.id}>{isp.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              {editingExpense ? "Save Invoice" : "Log Expense"}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Expense Slip"
        description="Are you sure you want to delete this operational cost record? This will change the consolidated reports data."
        type="danger"
        confirmText="Confirm Delete"
        onConfirm={handleDeleteExecute}
      />

    </div>
  )
}
