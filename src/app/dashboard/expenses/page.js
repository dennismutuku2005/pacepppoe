"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Search, Filter, Trash2, Edit2, DollarSign, Calendar, Tag, Activity } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { TableRowSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts'

function ExpensesContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [expenses, setExpenses] = useState([])
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentExpense, setCurrentExpense] = useState(null)
    const [formData, setFormData] = useState({ 
        title: '', amount: '', category: 'Bandwidth', date: new Date().toISOString().split('T')[0], status: 'Paid'
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setExpenses(mockDashboardData.expenses || [])
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const chartData = [
        { name: 'Jan', amount: 45000 },
        { name: 'Feb', amount: 52000 },
        { name: 'Mar', amount: 48000 },
        { name: 'Apr', amount: 61000 },
        { name: 'May', amount: 55000 },
        { name: 'Jun', amount: 67000 },
    ]

    const pieData = [
        { name: 'Bandwidth', value: 45, color: '#6366f1' },
        { name: 'Utilities', value: 15, color: '#10b981' },
        { name: 'Staff', value: 25, color: '#f59e0b' },
        { name: 'Other', value: 15, color: '#64748b' },
    ]

    const handleOpenModal = (e = null) => {
        if (e) {
            setCurrentExpense(e)
            setFormData({ ...e })
        } else {
            setCurrentExpense(null)
            setFormData({ 
                title: '', amount: '', category: 'Bandwidth', 
                date: new Date().toISOString().split('T')[0], status: 'Paid'
            })
        }
        setIsModalOpen(true)
    }

    const handleSave = (e) => {
        e.preventDefault()
        if (!formData.title || !formData.amount) {
            toast.error('Validation Failed', { description: 'Expense title and amount are required.' })
            return
        }

        if (currentExpense) {
            setExpenses(prev => prev.map(ex => ex.id === currentExpense.id ? { ...ex, ...formData } : ex))
            toast.success('Record Updated', { description: 'Expense entry has been modified.' })
        } else {
            const newEx = { ...formData, id: Date.now() }
            setExpenses(prev => [newEx, ...prev])
            toast.success('Record Created', { description: 'New expense has been logged.' })
        }
        setIsModalOpen(false)
    }

    const handleDelete = (id) => {
        setExpenses(prev => prev.filter(ex => ex.id !== id))
        toast.error('Record Removed', { description: 'Expense entry deleted from ledger.' })
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
                    <p className="text-xs text-gray-500 mt-1">Infrastructure costs and overhead tracking</p>
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
                        <h3 className="text-xs font-bold text-admin-dim uppercase tracking-wider">Expenditure Velocity</h3>
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
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm flex flex-col">
                    <h3 className="text-xs font-bold text-admin-dim uppercase tracking-wider mb-8">Category Allocation</h3>
                    <div className="flex-1 h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend 
                                    verticalAlign="bottom" 
                                    align="center"
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search ledger..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all uppercase"
                    />
                </div>
            </div>

            {/* Expense Matrix */}
            <div className="overflow-hidden bg-white dark:bg-card-bg border border-pace-border rounded-2xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap text-[12px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim tracking-widest text-[9px]">
                                <th className="px-6 py-4">Expense Particulars</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Filing Date</th>
                                <th className="px-6 py-4">Valuation</th>
                                <th className="px-6 py-4">State</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim text-[10px] font-bold tracking-widest italic uppercase">Zero records in ledger</td>
                                </tr>
                            ) : (
                                filteredExpenses.map((ex) => (
                                    <tr key={ex.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group cursor-default">
                                        <td className="px-6 py-3">
                                            <span className="text-[13px] font-bold text-admin-value">{ex.title}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-[10px] font-bold text-admin-dim">{ex.category}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-[10px] font-bold text-admin-value">{ex.date}</span>
                                        </td>
                                        <td className="px-6 py-3 font-mono">
                                            <span className="text-[12px] font-black text-admin-value tabular-nums">KES {Number(ex.amount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <Badge className={cn(
                                                "border-none px-2 py-0.5 text-[8px] font-black tracking-widest",
                                                ex.status === 'Paid' ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                                            )}>
                                                {ex.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button onClick={() => handleOpenModal(ex)} className="p-1.5 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 rounded-lg transition-all"><Edit2 size={13} /></button>
                                                <button onClick={() => handleDelete(ex.id)} className="p-1.5 text-admin-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expense Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentExpense ? 'Edit Ledger Entry' : 'Log Operational Expense'}
                description={currentExpense ? `Synchronizing record for ${currentExpense.title}` : 'Record a new infrastructure or operational cost.'}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Expense Title</label>
                        <input 
                            type="text" required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g. KPLC Power - Station A"
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all uppercase"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Amount (KES)</label>
                            <input 
                                type="number" required
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                placeholder="0.00"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Category</label>
                            <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                            >
                                <option>Bandwidth</option>
                                <option>Utilities</option>
                                <option>Rent</option>
                                <option>Hardware</option>
                                <option>Staff Salary</option>
                                <option>Marketing</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Date</label>
                            <input 
                                type="date" required
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Status</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                            >
                                <option>Paid</option>
                                <option>Pending</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-5 py-2.5 border border-pace-border rounded-xl text-xs font-bold text-admin-dim tracking-widest hover:bg-pace-bg-subtle transition-all">Cancel</button>
                        <button type="submit" className="flex-3 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-bold tracking-widest hover:opacity-90 shadow-xl shadow-pace-purple/20 transition-all active:scale-95">{currentExpense ? 'Save Changes' : 'Log Expense'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function ExpensesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse uppercase text-[10px] font-bold tracking-widest italic">Syncing Ledger...</div>}>
            <ExpensesContent />
        </Suspense>
    )
}
