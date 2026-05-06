"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { 
    TrendingUp, TrendingDown, DollarSign, PieChart, 
    Calendar, Download, ArrowUpRight, ArrowDownLeft, 
    BarChart3, LineChart, Wallet, CreditCard, Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton, CardSkeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import { 
    AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts'

function ReportsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [timeframe, setTimeframe] = useState('This Month')

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    if (isLoading) return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[400px] w-full rounded-2xl" />
                <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
        </div>
    )

    const financialMetrics = [
        { label: "Total Revenue", value: `KES ${mockDashboardData.stats.totalRevenueMonth.toLocaleString()}`, change: "+14.5%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-500/10" },
        { label: "Total Expenses", value: `KES ${mockDashboardData.stats.totalExpensesMonth.toLocaleString()}`, change: "+5.2%", icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
        { label: "Net Profit", value: `KES ${mockDashboardData.stats.netProfitMonth.toLocaleString()}`, change: "+18.2%", icon: DollarSign, color: "text-pace-purple", bg: "bg-pace-purple/10" },
        { label: "Collection Rate", value: mockDashboardData.stats.collectionRate, change: "+2.1%", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
    ]

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 text-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Income & Performance Report</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Consolidated financial intelligence and growth metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="bg-card-bg border border-pace-border rounded-xl px-4 py-2 text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                    >
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>Last Quarter</option>
                    </select>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-sm active:scale-95">
                        <Download size={16} />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {financialMetrics.map((m, i) => (
                    <div key={i} className="bg-card-bg border border-pace-border rounded-xl p-5 shadow-sm hover:border-pace-purple/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", m.bg)}>
                                <m.icon size={20} className={m.color} />
                            </div>
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", m.color === 'text-red-500' ? 'bg-red-500/10' : 'bg-green-500/10')}>
                                {m.change}
                            </span>
                        </div>
                        <p className="text-[11px] font-bold text-admin-dim uppercase tracking-wider mb-1">{m.label}</p>
                        <h3 className="text-xl font-bold text-admin-value tabular-nums tracking-tight">{m.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Trend Area Chart */}
                <div className="lg:col-span-8 bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h4 className="text-sm font-semibold text-admin-value">Weekly Revenue Stream</h4>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Historical Collection Trend</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-pace-purple" />
                            <span className="text-[9px] font-bold text-admin-dim uppercase tracking-widest">Revenue Flow</span>
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockDashboardData.revenueByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4B1D8F" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#4B1D8F" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: '600', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4B1D8F" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Package Popularity Pie Chart */}
                <div className="lg:col-span-4 bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-admin-value">Service Distribution</h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Plan Popularity Matrix</p>
                    </div>
                    <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={mockDashboardData.packagePopularity}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="sales"
                                >
                                    {mockDashboardData.packagePopularity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {mockDashboardData.packagePopularity.map((p, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                    <span className="text-[11px] font-semibold text-admin-dim uppercase">{p.name}</span>
                                </div>
                                <span className="text-[11px] font-bold text-admin-value tabular-nums">{p.sales} Sales</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expenses Bar Chart */}
                <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h4 className="text-sm font-semibold text-admin-value">Financial Balance</h4>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Monthly Operating Nexus</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockDashboardData.incomeVsExpenses} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: '600' }}
                                />
                                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '20px' }} />
                                <Bar dataKey="income" fill="#4B1D8F" radius={[4, 4, 0, 0]} name="Operating Revenue" />
                                <Bar dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Operating Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent High-Value Transactions */}
                <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-pace-border">
                        <h4 className="text-sm font-semibold text-admin-value">Significant Operations</h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Top financial events this month</p>
                    </div>
                    <div className="flex-1">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <tr className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">
                                    <th className="px-6 py-3">Event Identity</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3 text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pace-border">
                                {mockDashboardData.expenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-pace-bg-subtle/50 transition-colors group">
                                        <td className="px-6 py-2.5">
                                            <p className="text-xs font-semibold text-admin-value">{exp.title}</p>
                                            <p className="text-[10px] text-admin-dim font-medium">{exp.date}</p>
                                        </td>
                                        <td className="px-6 py-2.5">
                                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider">
                                                {exp.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-2.5 text-right">
                                            <span className="text-xs font-bold text-red-500 tabular-nums">- KES {exp.amount.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                                {mockDashboardData.recentPayments.slice(0, 2).map((pay) => (
                                    <tr key={`pay-${pay.id}`} className="hover:bg-pace-bg-subtle/50 transition-colors group">
                                        <td className="px-6 py-2.5">
                                            <p className="text-xs font-semibold text-admin-value">{pay.customer}</p>
                                            <p className="text-[10px] text-admin-dim font-medium">{pay.date}</p>
                                        </td>
                                        <td className="px-6 py-2.5">
                                            <Badge variant="success" className="text-[9px] font-bold uppercase tracking-wider border-none">
                                                Subscription
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-2.5 text-right">
                                            <span className="text-xs font-bold text-green-600 tabular-nums">+ KES {pay.amount.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-admin-dim text-sm font-medium animate-pulse">Orchestrating financial intelligence...</div>}>
            <ReportsContent />
        </Suspense>
    )
}
