"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { 
    TrendingUp, TrendingDown, DollarSign, PieChart, 
    Calendar, Download, ArrowUpRight, ArrowDownLeft, 
    BarChart3, LineChart, Wallet, CreditCard, Activity, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton, CardSkeleton } from '@/components/Skeleton'
import { financeService } from '@/services/isp/finance'
import { toast } from 'sonner'
import { 
    AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts'

function ReportsContent() {
    const [isStatsLoading, setIsStatsLoading] = useState(true)
    const [isChartsLoading, setIsChartsLoading] = useState(true)
    const [isRecentLoading, setIsRecentLoading] = useState(true)

    const [stats, setStats] = useState({
        totalRevenueMonth: 0,
        totalExpensesMonth: 0,
        netProfitMonth: 0,
        revenueGrowthPct: 0,
        expenseGrowthPct: 0,
        profitGrowthPct: 0,
        collectionRate: '100%'
    })
    const [revenueByDay, setRevenueByDay] = useState([])
    const [incomeVsExpenses, setIncomeVsExpenses] = useState([])
    const [packagePopularity, setPackagePopularity] = useState([])
    const [recentPayments, setRecentPayments] = useState([])
    const [expenses, setExpenses] = useState([])

    const fetchReportsParallel = () => {
        setIsStatsLoading(true)
        setIsChartsLoading(true)
        setIsRecentLoading(true)

        // 1. Fetch Stats in parallel (instant top cards)
        financeService.getReportStats().then(s => {
            if (s) setStats(s)
            setIsStatsLoading(false)
        }).catch(err => {
            console.error("Stats fetch error:", err)
            setIsStatsLoading(false)
        })

        // 2. Fetch Charts & breakdown in parallel
        Promise.allSettled([
            financeService.getReportRevenueByDay(),
            financeService.getReportIncomeVsExpenses(),
            financeService.getReportPackagePopularity()
        ]).then(([revRes, incRes, packRes]) => {
            if (revRes.status === 'fulfilled') setRevenueByDay(revRes.value)
            if (incRes.status === 'fulfilled') setIncomeVsExpenses(incRes.value)
            if (packRes.status === 'fulfilled') setPackagePopularity(packRes.value)
            setIsChartsLoading(false)
        }).catch(err => {
            console.error("Charts fetch error:", err)
            setIsChartsLoading(false)
        })

        // 3. Fetch Recent payments and expenses in parallel
        financeService.getReportRecent().then(r => {
            if (r) {
                setRecentPayments(r.recentPayments || [])
                setExpenses(r.expenses || [])
            }
            setIsRecentLoading(false)
        }).catch(err => {
            console.error("Recent records fetch error:", err)
            setIsRecentLoading(false)
        })
    }

    useEffect(() => {
        fetchReportsParallel()
    }, [])

    const financialMetrics = [
        { 
            label: "Total Revenue", 
            value: `KES ${Number(stats.totalRevenueMonth || 0).toLocaleString()}`, 
            sub: "Active monthly billing", 
            icon: TrendingUp, 
            color: "text-emerald-500", 
            bg: "bg-emerald-500/5", 
            iconBorder: "border-emerald-500/10 group-hover:border-emerald-500/30",
            accent: "bg-gradient-to-b from-emerald-400 to-teal-500",
            trend: stats.revenueGrowthPct !== undefined ? stats.revenueGrowthPct : 0
        },
        { 
            label: "Total Expenses", 
            value: `KES ${Number(stats.totalExpensesMonth || 0).toLocaleString()}`, 
            sub: "Operational overhead", 
            icon: TrendingDown, 
            color: "text-rose-500", 
            bg: "bg-rose-500/5", 
            iconBorder: "border-rose-500/10 group-hover:border-rose-500/30",
            accent: "bg-gradient-to-b from-rose-400 to-red-500",
            trend: stats.expenseGrowthPct !== undefined ? stats.expenseGrowthPct : 0
        },
        { 
            label: "Net Profit", 
            value: `KES ${Number(stats.netProfitMonth || 0).toLocaleString()}`, 
            sub: "Net monthly margin", 
            icon: DollarSign, 
            color: "text-pace-purple", 
            bg: "bg-pace-purple/5", 
            iconBorder: "border-pace-purple/10 group-hover:border-pace-purple/30",
            accent: "bg-gradient-to-b from-pace-purple to-indigo-500",
            trend: stats.profitGrowthPct !== undefined ? stats.profitGrowthPct : 0
        },
        { 
            label: "Collection Rate", 
            value: stats.collectionRate || '100%', 
            sub: "Payment efficiency", 
            icon: Activity, 
            color: "text-blue-500", 
            bg: "bg-blue-500/5", 
            iconBorder: "border-blue-500/10 group-hover:border-blue-500/30",
            accent: "bg-gradient-to-b from-blue-400 to-cyan-500"
        },
    ]

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 text-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Income & Performance Report</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Live consolidated financial intelligence and growth metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => toast.success('Report generated', { description: 'Live financial summary prepared.' })}
                        className="flex items-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-sm active:scale-95"
                    >
                        <Download size={16} />
                        <span>Export Statement</span>
                    </button>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isStatsLoading ? (
                    [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
                ) : financialMetrics.map((m, i) => (
                    <div 
                        key={i} 
                        className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0"
                    >
                        {/* Left accent color strip */}
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1", m.accent)} />
                        
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={m.label}>
                                        {m.label}
                                    </p>
                                    {m.trend !== undefined && (
                                        <span className={cn(
                                            "inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                                            m.trend >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                                        )}>
                                            {m.trend >= 0 ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownLeft size={10} className="mr-0.5" />}
                                            {Math.abs(m.trend)}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                                    {m.value}
                                </p>
                                {m.sub && <p className="text-[10px] text-admin-dim mt-0.5 truncate">{m.sub}</p>}
                            </div>
                            <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-105", m.iconBorder, m.bg)}>
                                <m.icon className={cn(m.color, "w-4 h-4")} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Trend Area Chart */}
                <div className="lg:col-span-8 bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h4 className="text-sm font-semibold text-admin-value">Weekly Revenue Stream</h4>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Daily Collections Breakdown</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-pace-purple" />
                            <span className="text-[9px] font-bold text-admin-dim uppercase tracking-widest">Revenue Flow</span>
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueByDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : `${v}`} />
                                <Tooltip 
                                    formatter={(val) => [`KES ${Number(val).toLocaleString()}`, 'Collections']}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: '600', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Package Popularity Pie Chart */}
                <div className="lg:col-span-4 bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm flex flex-col">
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-admin-value">Service Distribution</h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Subscribers per Plan</p>
                    </div>
                    {packagePopularity.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                            <PieChart className="w-8 h-8 text-admin-dim/40 mb-2" />
                            <p className="text-xs font-semibold text-admin-value">No Plans Configured</p>
                        </div>
                    ) : (
                        <>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={packagePopularity}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={6}
                                            dataKey="value"
                                        >
                                            {packagePopularity.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val, name) => [`${val} subscribers`, name]} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-2">
                                {packagePopularity.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                            <span className="text-[11px] font-semibold text-admin-dim">{p.name}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-admin-value tabular-nums">{p.value} Subscribers</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
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
                            <BarChart data={incomeVsExpenses} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : `${v}`} />
                                <Tooltip 
                                    formatter={(val, name) => [`KES ${Number(val).toLocaleString()}`, name]}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: '600' }}
                                />
                                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '20px' }} />
                                <Bar dataKey="income" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Operating Revenue" />
                                <Bar dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Operating Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent High-Value Transactions */}
                <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-pace-border">
                        <h4 className="text-sm font-semibold text-admin-value">Significant Operations</h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Latest revenue and expense items</p>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <tr className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">
                                    <th className="px-6 py-3">Event Identity</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3 text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pace-border">
                                {expenses.length === 0 && recentPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="py-12 text-center text-admin-dim text-xs">No recent financial events logged.</td>
                                    </tr>
                                ) : (
                                    <>
                                        {expenses.map((exp) => (
                                            <tr key={`exp-${exp.id}`} className="hover:bg-pace-bg-subtle/50 transition-colors group">
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
                                                    <span className="text-xs font-bold text-red-500 tabular-nums">- KES {Number(exp.amount).toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {recentPayments.map((pay) => (
                                            <tr key={`pay-${pay.id}`} className="hover:bg-pace-bg-subtle/50 transition-colors group">
                                                <td className="px-6 py-2.5">
                                                    <p className="text-xs font-semibold text-admin-value">{pay.customer}</p>
                                                    <p className="text-[10px] text-admin-dim font-medium">{pay.date}</p>
                                                </td>
                                                <td className="px-6 py-2.5">
                                                    <Badge variant="success" className="text-[9px] font-bold uppercase tracking-wider border-none">
                                                        {pay.plan || 'Subscription'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-2.5 text-right">
                                                    <span className="text-xs font-bold text-green-600 tabular-nums">+ KES {Number(pay.amount).toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                )}
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
