"use client"

import React, { useState, useEffect } from 'react'
import { 
    Wallet, Calendar, Plus, CreditCard, 
    TrendingDown, FileText, Filter, Printer, 
    MoreVertical, Trash2, Edit, Check, X,
    ChevronLeft, ChevronRight, BarChart3, Receipt
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/Skeleton'
import { expenseService } from '@/services/expenses'
import { Modal } from '@/components/Modal'

export default function ExpensesPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Filters
    const now = new Date();
    const [filters, setFilters] = useState({
        month: now.getMonth() + 1,
        year: now.getFullYear()
    });

    const [formState, setFormState] = useState({
        date: now.toISOString().split('T')[0],
        amount: '',
        description: '',
        category: 'running expenses'
    });

    const categories = [
        { value: 'bill', label: 'Bill', color: 'bg-blue-500' },
        { value: 'running expenses', label: 'Running Expenses', color: 'bg-green-500' },
        { value: 'upgrade', label: 'Upgrade', color: 'bg-orange-500' }
    ];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchExpenses = async () => {
        try {
            setIsLoading(true);
            const res = await expenseService.getExpenses(filters);
            if (res && res.status === 'success') {
                setExpenses(res.data || []);
                setMetrics(res.metrics || null);
            }
        } catch (error) {
            console.error("Expense fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isMounted) fetchExpenses();
    }, [filters, isMounted]);

    const handleOpenAdd = () => {
        setEditingExpense(null);
        setFormState({
            date: now.toISOString().split('T')[0],
            amount: '',
            description: '',
            category: 'running expenses'
        });
        setShowAddModal(true);
    };

    const handleOpenEdit = (expense) => {
        setEditingExpense(expense);
        setFormState({
            date: expense.date,
            amount: expense.amount,
            description: expense.description,
            category: expense.category
        });
        setShowAddModal(true);
    };

    const handleSaveExpense = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (editingExpense) {
                await expenseService.updateExpense({ ...formState, id: editingExpense.id });
            } else {
                await expenseService.addExpense(formState);
            }
            setShowAddModal(false);
            fetchExpenses();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenDelete = (expense) => {
        setExpenseToDelete(expense);
        setShowDeleteModal(true);
    };

    const handleDeleteExpense = async () => {
        if (!expenseToDelete) return;
        try {
            setIsDeleting(true);
            await expenseService.deleteExpense(expenseToDelete.id);
            setShowDeleteModal(false);
            fetchExpenses();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentMonthLabel = `${months[filters.month - 1]} ${filters.year}`;

    const changeMonth = (offset) => {
        let newMonth = filters.month + offset;
        let newYear = filters.year;
        
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        
        setFilters({ month: newMonth, year: newYear });
    };

    if (!isMounted) return null;

    return (
        <div className="space-y-8 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-pace-purple uppercase tracking-tight">Expenses Management</h1>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5 tracking-widest uppercase">Track and manage operational costs</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    {/* Month Navigator */}
                    <div className="flex w-full sm:w-auto items-center justify-between bg-card-bg border border-pace-border rounded-xl p-1 shadow-sm">
                        <button 
                            onClick={() => changeMonth(-1)}
                            className="p-2 hover:bg-pace-bg-subtle rounded-lg text-gray-500 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="px-4 py-1 flex-1 text-center text-xs font-bold text-pace-purple uppercase tracking-wider">
                            {currentMonthLabel}
                        </div>
                        <button 
                            onClick={() => changeMonth(1)}
                            className="p-2 hover:bg-pace-bg-subtle rounded-lg text-gray-500 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <button 
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 px-6 py-2.5 bg-pace-purple text-white rounded-xl hover:bg-pace-purple/90 transition-all text-xs font-medium uppercase tracking-widest shadow-lg shadow-pace-purple/20 w-full sm:w-auto justify-center"
                    >
                        <Plus size={14} /> Add New Expense
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    label="Total Expenses"
                    value={`KSH ${(metrics?.total || 0).toLocaleString()}`}
                    icon={TrendingDown}
                    color="text-red-600"
                    bg="bg-red-500/10"
                    isLoading={isLoading}
                />
                <MetricCard 
                    label="Bills"
                    value={`KSH ${(metrics?.summary?.bill || 0).toLocaleString()}`}
                    icon={Receipt}
                    color="text-blue-600"
                    bg="bg-blue-500/10"
                    isLoading={isLoading}
                />
                <MetricCard 
                    label="Running"
                    value={`KSH ${(metrics?.summary?.['running expenses'] || 0).toLocaleString()}`}
                    icon={Activity}
                    color="text-green-600"
                    bg="bg-green-500/10"
                    isLoading={isLoading}
                />
                 <MetricCard 
                    label="Upgrades"
                    value={`KSH ${(metrics?.summary?.upgrade || 0).toLocaleString()}`}
                    icon={BarChart3}
                    color="text-orange-600"
                    bg="bg-orange-500/10"
                    isLoading={isLoading}
                />
            </div>

            {/* Expenses Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-pace-border flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-pace-purple uppercase tracking-tight">Recent Expenses</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Showing records for {currentMonthLabel}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest min-w-[300px]">Description</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-right w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-6 py-4"><Skeleton className="h-6 w-full" /></td>
                                    </tr>
                                ))
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">
                                        No expenses recorded for this period
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-pace-bg-subtle/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span className="text-xs font-bold text-pace-purple">{expense.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider",
                                                expense.category === 'bill' ? "bg-blue-100 text-blue-700" :
                                                expense.category === 'upgrade' ? "bg-orange-100 text-orange-700" :
                                                "bg-green-100 text-green-700"
                                            )}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-600 font-bold max-w-lg break-words line-clamp-2">{expense.description}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <span className="text-xs font-bold text-pace-purple tracking-tight">KSH {expense.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={() => handleOpenEdit(expense)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenDelete(expense)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
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

            {/* Add/Edit Expense Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingExpense ? "Update Expense" : "Log New Expense"}
                description={editingExpense ? "Modify existing expense details" : "Record a business expense for operational tracking"}
            >
                <form onSubmit={handleSaveExpense} className="space-y-4 p-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
                            <input 
                                type="date" 
                                required
                                value={formState.date}
                                onChange={e => setFormState({...formState, date: e.target.value})}
                                className="w-full bg-pace-bg-subtle border border-pace-border rounded-xl px-4 py-2.5 text-xs font-bold text-pace-purple focus:ring-2 focus:ring-pace-purple/20 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                            <select 
                                value={formState.category}
                                onChange={e => setFormState({...formState, category: e.target.value})}
                                className="w-full bg-pace-bg-subtle border border-pace-border rounded-xl px-4 py-2.5 text-xs font-bold text-pace-purple focus:ring-2 focus:ring-pace-purple/20 outline-none transition-all appearance-none cursor-pointer"
                            >
                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Amount (KSH)</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">KSH</div>
                            <input 
                                type="number" 
                                placeholder="0.00"
                                required
                                value={formState.amount}
                                onChange={e => setFormState({...formState, amount: e.target.value})}
                                className="w-full bg-pace-bg-subtle border border-pace-border rounded-xl px-12 py-2.5 text-xs font-bold text-pace-purple focus:ring-2 focus:ring-pace-purple/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                        <textarea 
                            rows="3"
                            placeholder="What was this expense for?"
                            required
                            value={formState.description}
                            onChange={e => setFormState({...formState, description: e.target.value})}
                            className="w-full bg-pace-bg-subtle border border-pace-border rounded-xl px-4 py-2.5 text-xs font-medium text-pace-purple focus:ring-2 focus:ring-pace-purple/20 outline-none transition-all"
                        ></textarea>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setShowAddModal(false)}
                            className="flex-1 px-6 py-2.5 border border-pace-border text-gray-600 rounded-xl hover:bg-pace-bg-subtle transition-all text-xs font-bold uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="flex-2 px-8 py-2.5 bg-pace-purple text-white rounded-xl hover:bg-[#3d1a75] disabled:opacity-50 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-pace-purple/20 flex items-center justify-center gap-2"
                        >
                            {isSaving ? "Saving..." : <><Check size={14} /> {editingExpense ? 'Update' : 'Save'}</>}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Expense"
                description="Are you sure you want to delete this expense? This action cannot be undone."
                type="danger"
                icon={Trash2}
            >
                <div className="p-1 space-y-4">
                    {expenseToDelete && (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Deleting Expense</p>
                            <p className="text-xs font-bold text-red-700">{expenseToDelete.description}</p>
                            <p className="text-lg font-bold text-red-800 mt-1">KSH {expenseToDelete.amount.toLocaleString()}</p>
                        </div>
                    )}
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-6 py-2.5 border border-pace-border text-gray-600 rounded-xl hover:bg-pace-bg-subtle transition-all text-xs font-bold uppercase tracking-widest"
                        >
                            No, Keep it
                        </button>
                        <button 
                            onClick={handleDeleteExpense}
                            disabled={isDeleting}
                            className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/20"
                        >
                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

function MetricCard({ label, value, icon: Icon, color, bg, isLoading }) {
    if (isLoading) return <Skeleton className="h-28 rounded-2xl" />;
    
    return (
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg, color)}>
                    <Icon size={20} />
                </div>
            </div>
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</h3>
                <p className="text-xl font-bold text-pace-purple tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function Activity(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    )
  }
