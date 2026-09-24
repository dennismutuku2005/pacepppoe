"use client"

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import {
    TrendingUp, Users, DollarSign, Zap, BarChart2,
    Activity, ArrowLeft, ArrowUpRight, ArrowDownRight, Award, Plus, AlertCircle
} from 'lucide-react'
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, AreaChart, Area
} from 'recharts'
import { planService } from '@/services/isp/plans'
import { cn } from '@/lib/utils'
import { AdminCardSkeleton } from '@/components/Skeleton'

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
                    {trend !== undefined && trend !== null && !isNaN(trend) && (
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
    const [isLoading, setIsLoading] = useState(true)
    const [analyticsData, setAnalyticsData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true

        async function fetchAnalytics() {
            try {
                setIsLoading(true)
                const res = await planService.getPlanAnalytics()
                if (isMounted) {
                    if (res?.status === 'success' && res.data) {
                        setAnalyticsData(res.data)
                    } else {
                        setError(res?.message || 'Failed to load live plan analytics')
                    }
                }
            } catch (err) {
                console.error("Failed to load plan analytics:", err)
                if (isMounted) setError(err.message || 'Error fetching analytics')
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        fetchAnalytics()
        return () => { isMounted = false }
    }, [])

    if (isLoading) {
        return (
            <div className="space-y-6 font-figtree max-w-[1600px] mx-auto pb-10">
                <div className="h-10 w-72 bg-pace-bg-subtle rounded-xl animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <AdminCardSkeleton key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-80 bg-pace-bg-subtle rounded-xl animate-pulse" />)}
                </div>
            </div>
        )
    }

    if (error && !analyticsData) {
        return (
            <div className="space-y-8 max-w-[1600px] mx-auto pb-10 font-figtree">
                <div className="flex items-center gap-2 mb-1">
                    <Link href="/dashboard/packages" className="text-admin-dim hover:text-pace-purple transition-colors p-1 rounded-lg hover:bg-pace-purple/5">
                        <ArrowLeft size={16} />
                    </Link>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Plan Analytics</h1>
                </div>
                <div className="bg-card-bg border border-pace-border rounded-2xl p-12 text-center max-w-lg mx-auto">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-admin-value mb-1">Unable to Load Analytics</h3>
                    <p className="text-xs text-admin-dim mb-6">{error}</p>
                    <Link
                        href="/dashboard/packages"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-pace-purple text-white text-xs font-semibold rounded-xl hover:bg-pace-purple/90"
                    >
                        Back to Plans
                    </Link>
                </div>
            </div>
        )
    }

    const plans = analyticsData?.plans || []
    const kpis = analyticsData?.kpis || {}
    const subDist = analyticsData?.subscriber_distribution || []
    const revDist = analyticsData?.revenue_distribution || []
    const monthlyRevHistory = analyticsData?.monthly_revenue_history || []
    const monthlySubHistory = analyticsData?.monthly_subscriber_history || []
    const summary = analyticsData?.performance_summary || []

    const totalSubs = kpis.total_subscribers || 0
    const totalRev = kpis.total_monthly_revenue || 0
    const avgRevPerSub = kpis.avg_revenue_per_sub || 0
    const subGrowth = kpis.sub_growth_pct || 0
    const revGrowth = kpis.rev_growth_pct || 0
    const topPlanUsers = kpis.top_plan_users
    const topPlanRev = kpis.top_plan_revenue

    const renderLegend = (data) => (
        <div className="flex flex-col gap-1.5 mt-2">
            {data.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-admin-value font-medium">
                        <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ background: d.color }} />
                        {d.name}
                    </span>
                    <span className="font-bold text-admin-dim tabular-nums">{d.pct}%</span>
                </div>
            ))}
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/dashboard/packages" className="text-admin-dim hover:text-pace-purple transition-colors p-1 rounded-lg hover:bg-pace-purple/5">
                            <ArrowLeft size={16} />
                        </Link>
                        <h1 className="text-xl font-medium text-admin-value tracking-tight">Plan Analytics</h1>
                    </div>
                    <p className="text-xs font-medium text-gray-400 pl-8">Live service plan performance — subscriber distribution &amp; revenue metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/packages"
                        className="flex items-center gap-2 px-4 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all w-full sm:w-auto justify-center"
                    >
                        <Zap size={14} />
                        View Plan Directory
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>

            {plans.length === 0 ? (
                <div className="bg-card-bg border border-pace-border rounded-2xl p-12 text-center max-w-md mx-auto">
                    <Zap className="w-10 h-10 text-pace-purple/40 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-admin-value mb-1">No Service Plans Found</h3>
                    <p className="text-xs text-admin-dim mb-5">Create your first service plan to view live subscriber distribution and revenue analytics.</p>
                    <Link
                        href="/dashboard/packages"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-pace-purple text-white text-xs font-semibold rounded-xl hover:bg-pace-purple/90"
                    >
                        <Plus size={14} />
                        Create Service Plan
                    </Link>
                </div>
            ) : (
                <>
                    {/* Row 1: Pie Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Subscriber Distribution Pie */}
                        <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={Users} title="Subscriber Distribution" sub="Current subscribers per service plan" />
                            {totalSubs === 0 ? (
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
                                                    innerRadius={60}
                                                    outerRadius={95}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {subDist.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color || PLAN_COLORS[i % PLAN_COLORS.length]} stroke="transparent" />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomPieTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 w-full">
                                        {renderLegend(subDist)}
                                        <div className="mt-4 pt-4 border-t border-pace-border space-y-2">
                                            {subDist.map((d, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 rounded-full bg-pace-bg-subtle overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700"
                                                            style={{ width: `${d.pct}%`, background: d.color }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-admin-dim tabular-nums w-12 text-right">{d.value} subs</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Revenue Distribution Pie */}
                        <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={DollarSign} title="Revenue Distribution" sub="Monthly revenue contribution per plan" />
                            {totalRev === 0 ? (
                                <div className="h-60 flex flex-col items-center justify-center text-center p-4">
                                    <DollarSign className="w-8 h-8 text-admin-dim/40 mb-2" />
                                    <p className="text-xs font-semibold text-admin-value">No Monthly Revenue Yet</p>
                                    <p className="text-[11px] text-admin-dim mt-1">Revenue will appear as subscriptions and plans are active</p>
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
                                                    innerRadius={60}
                                                    outerRadius={95}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {revDist.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color || PLAN_COLORS[i % PLAN_COLORS.length]} stroke="transparent" />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomPieTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 w-full">
                                        {renderLegend(revDist)}
                                        <div className="mt-4 pt-4 border-t border-pace-border space-y-2">
                                            {revDist.map((d, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 rounded-full bg-pace-bg-subtle overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700"
                                                            style={{ width: `${d.pct}%`, background: d.color }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-admin-dim tabular-nums w-24 text-right">
                                                        KES {Number(d.value || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Line + Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Monthly Revenue Line Chart */}
                        <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={TrendingUp} title="Monthly Revenue Trend" sub="Revenue per plan over the last 6 months (KES)" />
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={monthlyRevHistory} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`} />
                                    <Tooltip content={<CustomTooltip prefix="KES " />} />
                                    {plans.map((pkg, i) => (
                                        <Line
                                            key={pkg.id}
                                            type="monotone"
                                            dataKey={pkg.name}
                                            stroke={PLAN_COLORS[i % PLAN_COLORS.length]}
                                            strokeWidth={2.5}
                                            dot={{ r: 3, fill: PLAN_COLORS[i % PLAN_COLORS.length], strokeWidth: 0 }}
                                            activeDot={{ r: 5, strokeWidth: 0 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-4 mt-3">
                                {plans.map((pkg, i) => (
                                    <span key={pkg.id} className="flex items-center gap-1.5 text-[10px] font-semibold text-admin-dim">
                                        <span className="w-4 h-0.5 inline-block rounded-full" style={{ background: PLAN_COLORS[i % PLAN_COLORS.length] }} />
                                        {pkg.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Subscriber Growth Area Chart */}
                        <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={Activity} title="Subscriber Growth Trend" sub="Monthly subscribers per plan (last 6 months)" />
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={monthlySubHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <defs>
                                        {plans.map((pkg, i) => {
                                            const color = PLAN_COLORS[i % PLAN_COLORS.length]
                                            return (
                                                <linearGradient key={pkg.id} id={`subgrad${pkg.id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={color} stopOpacity={0.28} />
                                                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                                                </linearGradient>
                                            )
                                        })}
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    {plans.map((pkg, i) => (
                                        <Area
                                            key={pkg.id}
                                            type="monotone"
                                            dataKey={pkg.name}
                                            stroke={PLAN_COLORS[i % PLAN_COLORS.length]}
                                            strokeWidth={2}
                                            fill={`url(#subgrad${pkg.id})`}
                                            dot={{ r: 3, fill: PLAN_COLORS[i % PLAN_COLORS.length], strokeWidth: 0 }}
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-4 mt-3">
                                {plans.map((pkg, i) => (
                                    <span key={pkg.id} className="flex items-center gap-1.5 text-[10px] font-semibold text-admin-dim">
                                        <span className="w-2.5 h-2.5 inline-block rounded-sm" style={{ background: PLAN_COLORS[i % PLAN_COLORS.length] + '44', border: `2px solid ${PLAN_COLORS[i % PLAN_COLORS.length]}` }} />
                                        {pkg.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Bar Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Subscriber Count Bar */}
                        <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={BarChart2} title="Subscriber Count by Plan" sub="Current number of subscribers on each plan" />
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={subDist} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                                    <Bar dataKey="value" name="Subscribers" radius={[6, 6, 0, 0]}>
                                        {subDist.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Revenue per Plan Bar */}
                        <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={DollarSign} title="Revenue by Plan" sub="Total monthly revenue generated per plan" />
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={revDist} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`} />
                                    <Tooltip content={<CustomTooltip prefix="KES " />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                                    <Bar dataKey="value" name="Revenue" radius={[6, 6, 0, 0]}>
                                        {revDist.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Summary Table */}
                    <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-pace-border flex items-center gap-3">
                            <div className="p-2 bg-pace-purple/10 text-pace-purple rounded-lg"><Zap size={16} /></div>
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
                                    {summary.map((pkg, i) => {
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
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
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
