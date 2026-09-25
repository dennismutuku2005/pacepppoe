"use client"

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import {
    TrendingUp, Users, DollarSign, Layers, Package, BarChart2,
    Activity, ArrowUpRight, ArrowDownRight, Award, Plus, AlertCircle, RefreshCw
} from 'lucide-react'
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, AreaChart, Area
} from 'recharts'
import { planService } from '@/services/isp/plans'
import { cn } from '@/lib/utils'
import { CardSkeleton, AdminCardSkeleton } from '@/components/Skeleton'

const PLAN_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#6366f1']

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-card-bg border border-pace-border rounded-xl shadow-xl p-3 text-xs font-figtree min-w-[160px]">
            {label && <p className="text-admin-dim font-semibold mb-2 uppercase tracking-wider text-[10px]">{label}</p>}
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                    <span className="flex items-center gap-1.5 text-admin-value">
                        <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: entry.color || entry.fill }} />
                        {entry.name}
                    </span>
                    <span className="font-bold text-admin-value tabular-nums">
                        {prefix}{Number(entry.value || 0).toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    )
}

const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
        <div className="bg-card-bg border border-pace-border rounded-xl shadow-xl p-3 text-xs font-figtree">
            <p className="font-bold text-admin-value">{d.name}</p>
            <p className="text-admin-dim mt-0.5">Value: <span className="text-admin-value font-semibold">{Number(d.value || 0).toLocaleString()}</span></p>
            <p className="text-admin-dim">Share: <span className="text-pace-purple font-semibold">{d.payload?.pct || 0}%</span></p>
        </div>
    )
}

const StatCard = ({ icon: Icon, label, value, sub, accent, color, bg, iconBorder, trend }) => (
    <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
        {/* Left accent color strip */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1", accent)} />
        
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={label}>
                        {label}
                    </p>
                    {trend !== undefined && trend !== null && !isNaN(trend) && trend !== 0 && (
                        <span className={cn(
                            "inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                            trend >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        )}>
                            {trend >= 0 ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
                <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                    {value}
                </p>
                {sub && <p className="text-[10px] text-admin-dim mt-0.5 truncate">{sub}</p>}
            </div>
            <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-105", iconBorder, bg)}>
                <Icon className={cn(color, "w-4 h-4")} />
            </div>
        </div>
    </div>
)

const SectionTitle = ({ icon: Icon, title, sub }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-pace-purple/10 text-pace-purple rounded-lg shrink-0"><Icon size={16} /></div>
        <div>
            <h2 className="text-sm font-bold text-admin-value">{title}</h2>
            {sub && <p className="text-[10px] text-admin-dim">{sub}</p>}
        </div>
    </div>
)

function AnalyticsContent() {
    const [isKpisLoading, setIsKpisLoading] = useState(true)
    const [isDistLoading, setIsDistLoading] = useState(true)
    const [isHistoryLoading, setIsHistoryLoading] = useState(true)
    const [isSummaryLoading, setIsSummaryLoading] = useState(true)

    const [kpis, setKpis] = useState({
        total_subscribers: 0,
        total_monthly_revenue: 0,
        avg_revenue_per_sub: 0,
        sub_growth_pct: 0,
        rev_growth_pct: 0,
        top_plan_users: null,
        top_plan_revenue: null
    })
    const [distribution, setDistribution] = useState({ subscriber_distribution: [], revenue_distribution: [] })
    const [history, setHistory] = useState({ monthly_revenue_history: [], monthly_subscriber_history: [] })
    const [summaryData, setSummaryData] = useState({ performance_summary: [], plans: [] })

    const fetchAllParallel = () => {
        setIsKpisLoading(true)
        setIsDistLoading(true)
        setIsHistoryLoading(true)
        setIsSummaryLoading(true)

        // 1. Fetch KPIs in parallel (instant top metric cards)
        planService.getPlanKPIs().then(res => {
            if (res) setKpis(res)
            setIsKpisLoading(false)
        }).catch(err => {
            console.error("KPIs fetch error:", err)
            setIsKpisLoading(false)
        })

        // 2. Fetch Distribution in parallel
        planService.getPlanDistribution().then(res => {
            if (res) setDistribution(res)
            setIsDistLoading(false)
        }).catch(err => {
            console.error("Distribution fetch error:", err)
            setIsDistLoading(false)
        })

        // 3. Fetch History Curves in parallel
        planService.getPlanHistory().then(res => {
            if (res) setHistory(res)
            setIsHistoryLoading(false)
        }).catch(err => {
            console.error("History fetch error:", err)
            setIsHistoryLoading(false)
        })

        // 4. Fetch Summary in parallel
        planService.getPlanSummary().then(res => {
            if (res) setSummaryData(res)
            setIsSummaryLoading(false)
        }).catch(err => {
            console.error("Summary fetch error:", err)
            setIsSummaryLoading(false)
        })
    }

    useEffect(() => {
        fetchAllParallel()
    }, [])

    const totalSubs = kpis.total_subscribers || 0
    const totalRev = kpis.total_monthly_revenue || 0
    const avgRevPerSub = kpis.avg_revenue_per_sub || 0
    const subGrowth = kpis.sub_growth_pct || 0
    const revGrowth = kpis.rev_growth_pct || 0
    const topPlanUsers = kpis.top_plan_users
    const topPlanRev = kpis.top_plan_revenue

    const subDist = distribution.subscriber_distribution || []
    const revDist = distribution.revenue_distribution || []
    const monthlyRevHistory = history.monthly_revenue_history || []
    const monthlySubHistory = history.monthly_subscriber_history || []
    const summary = summaryData.performance_summary || []
    const plans = summaryData.plans || []

    const isGlobalRefreshing = isKpisLoading || isDistLoading || isHistoryLoading || isSummaryLoading

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Plan Analytics</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Live service plan performance, subscriber distribution &amp; revenue metrics</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={fetchAllParallel}
                        disabled={isGlobalRefreshing}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all text-xs font-semibold disabled:opacity-50 cursor-pointer"
                        title="Refresh analytics"
                    >
                        <RefreshCw size={14} className={isGlobalRefreshing ? "animate-spin" : ""} />
                        <span>Refresh Analytics</span>
                    </button>
                    <Link
                        href="/dashboard/packages"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                        <Layers size={15} />
                        <span>View Plans</span>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isKpisLoading ? (
                    [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
                ) : (
                    <>
                        <StatCard
                            icon={Users}
                            label="Total Subscribers"
                            value={totalSubs.toLocaleString()}
                            sub="Assigned to plans"
                            accent="bg-gradient-to-b from-pace-purple to-indigo-500"
                            color="text-pace-purple"
                            bg="bg-pace-purple/5"
                            iconBorder="border-pace-purple/10 group-hover:border-pace-purple/30"
                            trend={subGrowth}
                        />
                        <StatCard
                            icon={DollarSign}
                            label="Monthly Revenue"
                            value={`KES ${totalRev.toLocaleString()}`}
                            sub="Active monthly run-rate"
                            accent="bg-gradient-to-b from-emerald-400 to-teal-500"
                            color="text-emerald-500"
                            bg="bg-emerald-500/5"
                            iconBorder="border-emerald-500/10 group-hover:border-emerald-500/30"
                            trend={revGrowth}
                        />
                        <StatCard
                            icon={Award}
                            label="Top Plan by Users"
                            value={topPlanUsers?.name || '—'}
                            sub={topPlanUsers ? `${topPlanUsers.subscribers} subscriber${topPlanUsers.subscribers === 1 ? '' : 's'}` : 'No subscribers yet'}
                            accent="bg-gradient-to-b from-blue-400 to-cyan-500"
                            color="text-blue-500"
                            bg="bg-blue-500/5"
                            iconBorder="border-blue-500/10 group-hover:border-blue-500/30"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Avg Revenue / Sub"
                            value={`KES ${avgRevPerSub.toLocaleString()}`}
                            sub={topPlanRev ? `Top earner: ${topPlanRev.name}` : 'Calculated average'}
                            accent="bg-gradient-to-b from-amber-400 to-orange-500"
                            color="text-amber-500"
                            bg="bg-amber-500/5"
                            iconBorder="border-amber-500/10 group-hover:border-amber-500/30"
                        />
                    </>
                )}
            </div>

            {/* Row 1: Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Subscriber Distribution Pie */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
                    <SectionTitle icon={Users} title="Subscriber Distribution" sub="Current subscribers per service plan" />
                    {isDistLoading ? (
                        <div className="h-60 bg-pace-bg-subtle/50 rounded-xl animate-pulse" />
                    ) : subDist.length === 0 ? (
                        <div className="h-60 flex flex-col items-center justify-center text-center p-4">
                            <Users className="w-8 h-8 text-admin-dim/40 mb-2" />
                            <p className="text-xs font-semibold text-admin-value">No Active Subscribers</p>
                            <p className="text-[11px] text-admin-dim mt-1">Assign subscribers to plans to populate this chart</p>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-full sm:w-[220px] h-[220px] shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={subDist}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {subDist.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                {subDist.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-pace-bg-subtle/50 hover:bg-pace-bg-subtle transition-colors">
                                        <span className="flex items-center gap-2 text-admin-value font-medium">
                                            <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ background: d.color }} />
                                            <span className="truncate max-w-[120px]">{d.name}</span>
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-admin-value tabular-nums">{d.value}</span>
                                            <span className="text-[10px] font-bold text-admin-dim w-10 text-right">{d.pct}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Revenue Share Pie */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
                    <SectionTitle icon={DollarSign} title="Revenue Contribution" sub="Monthly run-rate share by service tier" />
                    {isDistLoading ? (
                        <div className="h-60 bg-pace-bg-subtle/50 rounded-xl animate-pulse" />
                    ) : revDist.length === 0 ? (
                        <div className="h-60 flex flex-col items-center justify-center text-center p-4">
                            <DollarSign className="w-8 h-8 text-admin-dim/40 mb-2" />
                            <p className="text-xs font-semibold text-admin-value">No Revenue Data</p>
                            <p className="text-[11px] text-admin-dim mt-1">Assign subscribers to plans to calculate run-rate</p>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-full sm:w-[220px] h-[220px] shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={revDist}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {revDist.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                {revDist.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-pace-bg-subtle/50 hover:bg-pace-bg-subtle transition-colors">
                                        <span className="flex items-center gap-2 text-admin-value font-medium">
                                            <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ background: d.color }} />
                                            <span className="truncate max-w-[120px]">{d.name}</span>
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-admin-value tabular-nums">KES {Number(d.value).toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-admin-dim w-10 text-right">{d.pct}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Row 2: Trend Lines & Histograms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 6-Month Subscriber Trend */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
                    <SectionTitle icon={TrendingUp} title="Subscriber Growth (Last 6 Months)" sub="Cumulative assigned subscribers per tier" />
                    {isHistoryLoading ? (
                        <div className="h-[260px] bg-pace-bg-subtle/50 rounded-xl animate-pulse" />
                    ) : (
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlySubHistory}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    {plans.map((p, idx) => (
                                        <Line
                                            key={p.id}
                                            type="monotone"
                                            dataKey={p.name}
                                            stroke={PLAN_COLORS[idx % PLAN_COLORS.length]}
                                            strokeWidth={2.5}
                                            dot={{ r: 3, fill: PLAN_COLORS[idx % PLAN_COLORS.length] }}
                                            activeDot={{ r: 5 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* 6-Month Revenue Run-Rate */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
                    <SectionTitle icon={BarChart2} title="Revenue Run-Rate History" sub="Monthly billing output by plan tier (KES)" />
                    {isHistoryLoading ? (
                        <div className="h-[260px] bg-pace-bg-subtle/50 rounded-xl animate-pulse" />
                    ) : (
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyRevHistory}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                                    />
                                    <Tooltip content={<CustomTooltip prefix="KES " />} />
                                    {plans.map((p, idx) => (
                                        <Bar
                                            key={p.id}
                                            dataKey={p.name}
                                            stackId="a"
                                            fill={PLAN_COLORS[idx % PLAN_COLORS.length]}
                                            radius={idx === plans.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

            </div>

            {/* Summary Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-pace-border flex items-center gap-3">
                    <div className="p-2 bg-pace-purple/10 text-pace-purple rounded-lg"><Layers size={16} /></div>
                    <div>
                        <h2 className="text-sm font-bold text-admin-value">Plan Performance Summary</h2>
                        <p className="text-[10px] text-admin-dim">Detailed breakdown for each service tier</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap text-xs">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border text-[10px] font-bold text-admin-dim uppercase tracking-wider">
                                <th className="px-6 py-3.5">Plan</th>
                                <th className="px-6 py-3.5 text-center">Speed</th>
                                <th className="px-6 py-3.5 text-center">Subscribers</th>
                                <th className="px-6 py-3.5 text-right">Unit Price</th>
                                <th className="px-6 py-3.5 text-right">Monthly Rev.</th>
                                <th className="px-6 py-3.5 text-right">Share of Rev.</th>
                                <th className="px-6 py-3.5 text-center">MoM Growth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isSummaryLoading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-3.5"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                                        <td className="px-6 py-3.5 text-center"><div className="h-4 w-16 bg-pace-bg-subtle rounded-md mx-auto" /></td>
                                        <td className="px-6 py-3.5 text-center"><div className="h-4 w-10 bg-pace-bg-subtle rounded-md mx-auto" /></td>
                                        <td className="px-6 py-3.5 text-right"><div className="h-4 w-16 bg-pace-bg-subtle rounded-md ml-auto" /></td>
                                        <td className="px-6 py-3.5 text-right"><div className="h-4 w-20 bg-pace-bg-subtle rounded-md ml-auto" /></td>
                                        <td className="px-6 py-3.5 text-right"><div className="h-4 w-14 bg-pace-bg-subtle rounded-md ml-auto" /></td>
                                        <td className="px-6 py-3.5 text-center"><div className="h-4 w-12 bg-pace-bg-subtle rounded-md mx-auto" /></td>
                                    </tr>
                                ))
                            ) : summary.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-admin-dim text-xs font-medium">
                                        No service plans found.
                                    </td>
                                </tr>
                            ) : (
                                summary.map((pkg) => {
                                    const growth = pkg.growth_pct || 0
                                    return (
                                        <tr key={pkg.id} className="hover:bg-pace-bg-subtle/40 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: pkg.color }} />
                                                    <div>
                                                        <div className="font-semibold text-admin-value">{pkg.name}</div>
                                                        <div className="text-[10px] text-admin-dim">{pkg.router}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 text-center">
                                                <span className="font-mono font-semibold text-pace-purple text-[11px]">{pkg.limit}</span>
                                            </td>
                                            <td className="px-6 py-3.5 text-center font-semibold text-admin-value tabular-nums">{pkg.subscribers}</td>
                                            <td className="px-6 py-3.5 text-right font-semibold text-admin-value tabular-nums">KES {Number(pkg.price || 0).toLocaleString()}</td>
                                            <td className="px-6 py-3.5 text-right font-bold text-admin-value tabular-nums">KES {Number(pkg.revenue || 0).toLocaleString()}</td>
                                            <td className="px-6 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-1.5 rounded-full bg-pace-bg-subtle overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${pkg.revenue_share_pct}%`, background: pkg.color }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-admin-dim w-8 text-right">{pkg.revenue_share_pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 text-center">
                                                <span className={cn(
                                                    "inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                    growth > 0 ? "bg-emerald-500/10 text-emerald-600" : growth < 0 ? "bg-red-500/10 text-red-500" : "bg-pace-bg-subtle text-admin-dim"
                                                )}>
                                                    {growth > 0 ? <ArrowUpRight size={10} /> : growth < 0 ? <ArrowDownRight size={10} /> : null}
                                                    {growth > 0 ? '+' : ''}{growth}%
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function PlanAnalyticsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Loading analytics...</div>}>
            <AnalyticsContent />
        </Suspense>
    )
}
