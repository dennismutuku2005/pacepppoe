"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Search, Filter, Trash2, Edit2, DollarSign, Calendar, Tag, Activity, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { TableRowSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { financeService } from '@/services/isp/finance'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts'

const CATEGORY_COLORS = {
    'Bandwidth': '#6366f1',
    'Utilities': '#10b981',
    'Staff': '#f59e0b',
    'Hardware': '#3b82f6',
    'Maintenance': '#ec4899',
    'General': '#64748b'
}

function ExpensesContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [expenses, setExpenses] = useState([])
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({ 
        description: '', amount: '', category: 'Bandwidth'
    })

    const fetchExpenses = async () => {
        try {
            setIsLoading(true)
            const res = await financeService.getExpenses()
            if (res && res.status === 'success') {
                setExpenses(res.expenses || [])
            } else {
                toast.error('Failed to load expenses', { description: res?.message })
            }
        } catch (err) {
            console.error("Error loading expenses:", err)
            toast.error('Could not connect to expense service')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchExpenses()
    }, [])

    // Dynamic Expenditure Velocity from live records
    const monthsMap = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currYear = new Date().getFullYear()
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const mKey = months[d.getMonth()]
        monthsMap[mKey] = 0
    }

    expenses.forEach(e => {
        if (e.date) {
            const expDate = new Date(e.date)
            const mKey = months[expDate.getMonth()]
            if (monthsMap[mKey] !== undefined) {
                monthsMap[mKey] += Number(e.amount || 0)
            }
        }
    })

    const chartData = Object.keys(monthsMap).map(m => ({
        name: m,
        amount: monthsMap[m]
    }))

    // Dynamic Category Allocation
    const catMap = {}
    expenses.forEach(e => {
        const cat = e.category || 'General'
        catMap[cat] = (catMap[cat] || 0) + Number(e.amount || 0)
    })

    const totalExpenseAmount = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0)
    const pieData = Object.keys(catMap).map(cat => ({
        name: cat,
        value: totalExpenseAmount > 0 ? Math.round((catMap[cat] / totalExpenseAmount) * 100) : 0,
        amount: catMap[cat],
        color: CATEGORY_COLORS[cat] || '#8b5cf6'
    }))

    const handleOpenModal = () => {
        setFormData({ 
            description: '', amount: '', category: 'Bandwidth'
        })
        setIsModalOpen(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!formData.description || !formData.amount) {
            toast.error('Validation Failed', { description: 'Expense description and amount are required.' })
            return
        }

        try {
            setIsSubmitting(true)
            const res = await financeService.createExpense({
                description: formData.description,
                amount: parseFloat(formData.amount),
                category: formData.category
            })

            if (res && res.status === 'success') {
                toast.success('Expense Logged', { description: `Logged KES ${Number(formData.amount).toLocaleString()} for ${formData.description}` })
                setIsModalOpen(false)
                fetchExpenses()
            } else {
                toast.error('Failed to save expense', { description: res?.message })
            }
        } catch (err) {
            console.error("Error creating expense:", err)
            toast.error('Failed to create expense')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this expense record?')) return

        try {
            const res = await financeService.deleteExpense(id)
            if (res && res.status === 'success') {
                toast.success('Record Removed', { description: 'Expense deleted from ledger.' })
                setExpenses(prev => prev.filter(ex => ex.id !== id))
            } else {
                toast.error('Failed to delete expense', { description: res?.message })
            }
        } catch (err) {
            console.error("Error deleting expense:", err)
            toast.error('Failed to delete expense')
        }
    }

    const filteredExpenses = expenses.filter(ex => 
        ex.title?.toLowerCase().includes(search.toLowerCase()) ||
        ex.category?.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) {
        return <TablePageSkeleton />
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-semibold text-admin-value tracking-tight">Operational Ledger</h1>
                    <p className="text-xs text-gray-500 mt-1">Live infrastructure costs, power, bandwidth, and overhead tracking</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-pace-purple text-white rounded-xl hover:opacity-95 transition-all text-sm font-medium shadow-sm active:scale-[0.98]"
                >
                    <Plus size={14} /> Log Expense
                </button>
            </div>

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xs font-bold text-admin-dim uppercase tracking-wider">Expenditure Velocity</h3>
                            <p className="text-[11px] text-admin-dim mt-0.5">Total Outflows: KES {totalExpenseAmount.toLocaleString()}</p>
                        </div>
                        <Activity size={14} className="text-pace-purple" />
                    </div>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : `${v}`}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(val) => [`KES ${Number(val).toLocaleString()}`, 'Expenses']}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm flex flex-col">
                    <h3 className="text-xs font-bold text-admin-dim uppercase tracking-wider mb-4">Category Allocation</h3>
                    {pieData.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                            <Tag className="w-8 h-8 text-admin-dim/40 mb-2" />
                            <p className="text-xs font-semibold text-admin-value">No Expenses Logged</p>
                            <p className="text-[11px] text-admin-dim mt-1">Add expenses to view category breakdown</p>
                        </div>
                    ) : (
                        <div className="flex-1 h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(val, name, item) => [`KES ${Number(item.payload.amount).toLocaleString()} (${val}%)`, name]}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} 
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        iconType="circle"
                                        formatter={(value) => <span className="text-[11px] font-semibold text-admin-value">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Search expenses by title or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                />
            </div>

            {/* Table */}
            <div className="overflow-hidden bg-card-bg border border-pace-border rounded-xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Expense Item</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Logged Date</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center text-admin-dim text-sm font-medium">No expense records found.</td>
                                </tr>
                            ) : (
                                filteredExpenses.map((ex) => (
                                    <tr key={ex.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-pace-bg-subtle border border-pace-border flex items-center justify-center text-admin-dim group-hover:text-pace-purple transition-colors">
                                                    <DollarSign size={14} />
                                                </div>
                                                <span className="text-xs font-semibold text-admin-value">{ex.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <Badge variant="secondary" className="text-[10px] font-medium border-none">
                                                {ex.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-[11px] font-mono text-admin-dim">{ex.date}</span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <span className="text-xs font-bold text-rose-500 tabular-nums">
                                                -KES {Number(ex.amount || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <button 
                                                onClick={() => handleDelete(ex.id)}
                                                className="p-1.5 text-admin-dim hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                title="Delete expense"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Operating Expense">
                <form onSubmit={handleSave} className="space-y-4 pt-2">
                    <div>
                        <label className="block text-xs font-medium text-admin-dim mb-1">Expense Description *</label>
                        <input
                            type="text"
                            placeholder="e.g., Upstream Fiber Lease, Power Generator Fuel"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-admin-dim mb-1">Amount (KES) *</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-admin-dim mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                            >
                                <option value="Bandwidth">Bandwidth / Transit</option>
                                <option value="Utilities">Utilities & Power</option>
                                <option value="Staff">Staff & Field Technicians</option>
                                <option value="Hardware">Hardware & Routers</option>
                                <option value="Maintenance">Site Maintenance</option>
                                <option value="General">General Operating</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-pace-border">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-pace-border text-admin-dim hover:text-admin-value rounded-xl text-xs font-semibold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Record Expense'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function ExpensesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Syncing operational ledger...</div>}>
            <ExpensesContent />
        </Suspense>
    )
}
