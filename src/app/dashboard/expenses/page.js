"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Wallet, Plus, Search, Trash2, Calendar, FileText, TrendingDown, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import Swal from 'sweetalert2'

function ExpensesContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [expenses, setExpenses] = useState([])

    useEffect(() => {
        const timer = setTimeout(() => {
            setExpenses(mockDashboardData.expenses)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleAddExpense = () => {
        Swal.fire({
            title: 'Record Expense',
            html: `
                <div class="space-y-4 text-left">
                    <div>
                        <label class="text-[10px] font-bold uppercase text-gray-400">Title / Description</label>
                        <input id="exp-title" class="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Node B Maintenance">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-[10px] font-bold uppercase text-gray-400">Amount (KES)</label>
                            <input id="exp-amount" type="number" class="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" placeholder="1500">
                        </div>
                        <div>
                            <label class="text-[10px] font-bold uppercase text-gray-400">Category</label>
                            <select id="exp-category" class="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm">
                                <option>Utilities</option>
                                <option>Bandwidth</option>
                                <option>Rent</option>
                                <option>Hardware</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#4B1D8F',
            confirmButtonText: 'Record Expense',
        }).then((result) => {
            if (result.isConfirmed) {
                const title = document.getElementById('exp-title').value
                const amount = document.getElementById('exp-amount').value
                const category = document.getElementById('exp-category').value
                
                if (title && amount) {
                    const newExp = {
                        id: Date.now(),
                        title,
                        amount: parseFloat(amount),
                        category,
                        date: new Date().toISOString().split('T')[0],
                        status: 'Paid'
                    }
                    setExpenses(prev => [newExp, ...prev])
                    Swal.fire('Success!', 'Expense recorded.', 'success')
                }
            }
        })
    }

    const filteredExpenses = expenses.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalSpent = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0)

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-bold text-pace-purple uppercase tracking-tight flex items-center gap-3">
                        <Wallet size={24} />
                        Expense Ledger
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase">Track business operational costs and hardware investments</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-red-500/5 border border-red-500/10 rounded-xl text-center">
                        <p className="text-sm font-bold text-red-600 leading-none">KES {totalSpent.toLocaleString()}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Filtered Total</p>
                    </div>
                    <button 
                        onClick={handleAddExpense}
                        className="flex items-center gap-2 px-4 py-2 bg-pace-purple text-white rounded-xl hover:bg-pace-purple/90 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <Plus size={14} /> Record Cost
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card-bg border border-pace-border p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Burn Rate (Today)</p>
                            <h3 className="text-lg font-bold text-admin-value mt-1">KES {mockDashboardData.stats.totalExpensesToday.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-card-bg border border-pace-border p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Net Revenue (Today)</p>
                            <h3 className="text-lg font-bold text-admin-value mt-1">KES {(mockDashboardData.stats.totalRevenueToday - mockDashboardData.stats.totalExpensesToday).toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search by description or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-card-bg border border-pace-border rounded-2xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Expenses List */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap text-[12px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle border-b border-pace-border font-bold text-admin-dim uppercase tracking-widest text-[9px]">
                                <th className="px-6 py-5">Expense Title</th>
                                <th className="px-6 py-5">Category</th>
                                <th className="px-6 py-5">Amount</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-48" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-5 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredExpenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-pace-bg-subtle/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
                                                <FileText size={14} />
                                            </div>
                                            <span className="font-bold text-admin-value tracking-tight">{exp.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge variant="outline" className="text-[9px] font-bold border-gray-200 uppercase tracking-widest">
                                            {exp.category}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="font-black text-red-600 tabular-nums">KES {exp.amount.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-admin-dim font-bold text-[10px] uppercase">
                                            <Calendar size={10} />
                                            {exp.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function ExpensesPage() {
    return (
        <Suspense fallback={<div>Loading Ledger...</div>}>
            <ExpensesContent />
        </Suspense>
    )
}
