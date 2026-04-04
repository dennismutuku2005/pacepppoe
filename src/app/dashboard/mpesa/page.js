"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { CreditCard, Search, Download, TrendingUp, TrendingDown, DollarSign, Smartphone, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mockDashboardData, mockRecentPayments } from '@/services/mockData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function PaymentsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [payments, setPayments] = useState([])

    useEffect(() => {
        const timer = setTimeout(() => {
            setPayments(mockDashboardData.recentPayments)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const filteredPayments = payments.filter(p => 
        p.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.receipt.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header with Paybill Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-bold text-admin-value uppercase tracking-tight flex items-center gap-3">
                        <CreditCard size={24} className="text-pace-purple" />
                        Collection Ledger
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase">M-Pesa C2B reconciliation and real-time payment feed</p>
                </div>
                
                <div className="flex items-center gap-6 bg-card-bg border border-pace-border p-4 rounded-2xl shadow-sm">
                    <div className="flex flex-col border-r border-pace-border pr-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Active Paybill</p>
                        <h3 className="text-lg font-black text-pace-purple mt-1 select-all">{mockDashboardData.stats.paybill}</h3>
                    </div>
                    <div className="flex flex-col pl-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Account Name</p>
                        <h3 className="text-sm font-bold text-admin-value mt-1">{mockDashboardData.stats.accountName}</h3>
                    </div>
                </div>
            </div>

            {/* Financial Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card-bg border border-pace-border p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Net Banked</p>
                            <h3 className="text-lg font-black text-admin-value mt-1">KES {mockDashboardData.stats.totalRevenueToday.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-card-bg border border-pace-border p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Average Ticket</p>
                            <h3 className="text-lg font-black text-admin-value mt-1">KES {(mockDashboardData.stats.totalRevenueToday / mockDashboardData.stats.todayPayments).toFixed(0)}</h3>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 bg-card-bg border border-pace-border p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <MessageSquare size={80} className="text-pace-purple" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <Smartphone size={16} className="text-pace-purple" />
                        <h4 className="text-[11px] font-black uppercase text-admin-dim tracking-widest">Automation Status</h4>
                    </div>
                    <p className="text-[11px] font-medium text-admin-value leading-relaxed">
                        STK Push automation is active. Payment notifications are currently being dispatched to <span className="font-bold text-pace-purple">{mockDashboardData.stats.activeCustomers} subscribers</span> via SMS gateway.
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search by receipt or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-card-bg border border-pace-border rounded-2xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap text-[12px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle border-b border-pace-border font-bold text-admin-dim uppercase tracking-widest text-[9px]">
                                <th className="px-6 py-5">Receipt Code</th>
                                <th className="px-6 py-5">Subscriber Info</th>
                                <th className="px-6 py-5">Package Tier</th>
                                <th className="px-6 py-5">Amount</th>
                                <th className="px-6 py-5">Timestamp</th>
                                <th className="px-6 py-5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-40" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-28" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-16" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-5 text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
                                    </tr>
                                ))
                            ) : filteredPayments.map((p) => (
                                <tr key={p.id} className="hover:bg-pace-bg-subtle/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <span className="font-black text-pace-purple tracking-wider select-all">{p.receipt}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-admin-value">{p.customer}</span>
                                            <span className="text-[10px] text-admin-dim font-medium lowercase tracking-tighter">via M-Pesa C2B</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge variant="outline" className="text-[10px] font-bold border-gray-200 uppercase tracking-widest bg-pace-bg-subtle">
                                            {p.plan}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-admin-value">KES {p.amount.toLocaleString()}</span>
                                            <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest">Banked</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-admin-dim font-bold text-[10px] uppercase">
                                        {p.date}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full text-[9px] font-black uppercase border border-green-500/10">
                                            Validated
                                        </div>
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

export default function PaymentsPage() {
    return (
        <Suspense fallback={<div>Loading Ledger...</div>}>
            <PaymentsContent />
        </Suspense>
    )
}
