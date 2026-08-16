"use client"

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import {
    TrendingUp, Users, DollarSign, Zap, BarChart2,
    Activity, ArrowLeft, ArrowUpRight, ArrowDownRight, Award
} from 'lucide-react'
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, AreaChart, Area
} from 'recharts'
import { mockPackages, mockCustomers, mockPlanMonthlyRevenue, mockPlanSubscriberHistory } from '@/services/mockData'
import { cn } from '@/lib/utils'

const PLAN_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b']

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
                        {prefix}{entry.value?.toLocaleString()}
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
            <p className="text-admin-dim mt-0.5">Value: <span className="text-admin-value font-semibold">{d.value?.toLocaleString()}</span></p>
            <p className="text-admin-dim">Share: <span className="text-pace-purple font-semibold">{d.payload.pct}%</span></p>
        </div>
    )
}

const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
    <div className="bg-card-bg border border-pace-border rounded-xl p-5 hover:border-pace-purple/20 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
                <Icon size={20} />
            </div>
            {trend !== undefined && (
                <div className={cn("flex items-center gap-0.5 text-[10px] font-bold",
                    trend >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                    {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <h3 className="text-xl font-bold text-admin-value tracking-tight tabular-nums">{value}</h3>
        <p className="text-[11px] font-medium text-gray-400 mt-1">{label}</p>
        {sub && <p className="text-[10px] text-admin-dim mt-0.5">{sub}</p>}
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

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 700)
        return () => clearTimeout(t)
    }, [])

    const planSubCounts = mockPackages.map((pkg, i) => {
        const count = mockCustomers.filter(c => c.plan === pkg.limit || c.plan === pkg.name).length
        return { name: pkg.name, value: count, price: pkg.price, color: PLAN_COLORS[i] }
    })
    const totalSubs = planSubCounts.reduce((s, p) => s + p.value, 0) || 1

    const userPieData = planSubCounts.map(p => ({
        ...p,
        pct: ((p.value / totalSubs) * 100).toFixed(1)
    }))

    const latestRevMonth = mockPlanMonthlyRevenue[mockPlanMonthlyRevenue.length - 1]
    const planRevData = mockPackages.map((pkg, i) => ({
        name: pkg.name,
        value: latestRevMonth[pkg.name] || 0,
        color: PLAN_COLORS[i]
    }))
    const totalRev = planRevData.reduce((s, p) => s + p.value, 0) || 1
    const revPieData = planRevData.map(p => ({
        ...p,
        pct: ((p.value / totalRev) * 100).toFixed(1)
    }))

    const totalMonthlyRev = totalRev
    const avgRevPerSub = totalSubs ? Math.round(totalMonthlyRev / totalSubs) : 0
    const topPlan = [...planSubCounts].sort((a, b) => b.value - a.value)[0]
    const topRevPlan = [...planRevData].sort((a, b) => b.value - a.value)[0]

    const prevMonth = mockPlanSubscriberHistory[mockPlanSubscriberHistory.length - 2]
    const currMonth = mockPlanSubscriberHistory[mockPlanSubscriberHistory.length - 1]
    const totalPrevSubs = mockPackages.reduce((s, p) => s + (prevMonth[p.name] || 0), 0)
    const totalCurrSubs = mockPackages.reduce((s, p) => s + (currMonth[p.name] || 0), 0)
    const subGrowth = totalPrevSubs ? +(((totalCurrSubs - totalPrevSubs) / totalPrevSubs) * 100).toFixed(1) : 0

    const prevRevMonth = mockPlanMonthlyRevenue[mockPlanMonthlyRevenue.length - 2]
    const prevTotalRev = mockPackages.reduce((s, p) => s + (prevRevMonth[p.name] || 0), 0)
    const revGrowth = prevTotalRev ? +(((totalMonthlyRev - prevTotalRev) / prevTotalRev) * 100).toFixed(1) : 0

    const subBarData = planSubCounts.map(p => ({ name: p.name, value: p.value, color: p.color }))

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

    if (isLoading) {
        return (
            <div className="space-y-6 font-figtree max-w-[1600px] mx-auto pb-10">
                <div className="h-10 w-72 bg-pace-bg-subtle rounded-xl animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-pace-bg-subtle rounded-xl animate-pulse" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-80 bg-pace-bg-subtle rounded-xl animate-pulse" />)}
                </div>
            </div>
        )
    }

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
                    <p className="text-xs font-medium text-gray-400 pl-8">Service plan performance — subscriber distribution &amp; revenue breakdown</p>
                </div>
                <Link
                    href="/dashboard/packages"
                    className="flex items-center gap-2 px-4 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all w-full sm:w-auto justify-center"
                >
                    <Zap size={14} />
                    View Plan Directory
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label="Total Subscribers"
                    value={totalCurrSubs}
                    sub="Active this month"
                    color="bg-pace-purple/10 text-pace-purple"
                    trend={subGrowth}
                />
                <StatCard
                    icon={DollarSign}
                    label="Monthly Revenue"
                    value={`KES ${totalMonthlyRev.toLocaleString()}`}
                    sub="All plans combined"
                    color="bg-emerald-500/10 text-emerald-600"
                    trend={revGrowth}
                />
                <StatCard
                    icon={Award}
                    label="Top Plan by Users"
                    value={topPlan?.name?.split(' ')[0] || '—'}
                    sub={`${topPlan?.value || 0} subscribers`}
                    color="bg-blue-500/10 text-blue-600"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg Revenue / Sub"
                    value={`KES ${avgRevPerSub.toLocaleString()}`}
                    sub={topRevPlan ? `Top earner: ${topRevPlan.name.split(' ')[0]}` : ''}
                    color="bg-amber-500/10 text-amber-600"
                />
            </div>

            {/* Row 1: Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Subscriber Distribution Pie */}
                <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                    <SectionTitle icon={Users} title="Subscriber Distribution" sub="Current subscribers per service plan" />
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-full sm:w-[220px] h-[220px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={95}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {userPieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 w-full">
                            {renderLegend(userPieData)}
                            <div className="mt-4 pt-4 border-t border-pace-border space-y-2">
                                {userPieData.map((d, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 rounded-full bg-pace-bg-subtle overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${d.pct}%`, background: d.color }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-admin-dim tabular-nums w-8 text-right">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Distribution Pie */}
                <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                    <SectionTitle icon={DollarSign} title="Revenue Distribution" sub="Monthly revenue contribution per plan" />
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-full sm:w-[220px] h-[220px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={95}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {revPieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 w-full">
                            {renderLegend(revPieData)}
                            <div className="mt-4 pt-4 border-t border-pace-border space-y-2">
                                {revPieData.map((d, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 rounded-full bg-pace-bg-subtle overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${d.pct}%`, background: d.color }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-admin-dim tabular-nums w-20 text-right">
                                            KES {(d.value / 1000).toFixed(0)}K
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Line + Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Monthly Revenue Line Chart */}
                <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                    <SectionTitle icon={TrendingUp} title="Monthly Revenue Trend" sub="Revenue per plan over the last 6 months (KES)" />
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={mockPlanMonthlyRevenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                            <Tooltip content={<CustomTooltip prefix="KES " />} />
                            {mockPackages.map((pkg, i) => (
                                <Line
                                    key={pkg.id}
                                    type="monotone"
                                    dataKey={pkg.name}
                                    stroke={PLAN_COLORS[i]}
                                    strokeWidth={2.5}
                                    dot={{ r: 3, fill: PLAN_COLORS[i], strokeWidth: 0 }}
                                    activeDot={{ r: 5, strokeWidth: 0 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-4 mt-3">
                        {mockPackages.map((pkg, i) => (
                            <span key={pkg.id} className="flex items-center gap-1.5 text-[10px] font-semibold text-admin-dim">
                                <span className="w-4 h-0.5 inline-block rounded-full" style={{ background: PLAN_COLORS[i] }} />
                                {pkg.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Subscriber Growth Area Chart */}
                <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                    <SectionTitle icon={Activity} title="Subscriber Growth Trend" sub="Monthly active subscribers per plan (last 6 months)" />
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={mockPlanSubscriberHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                {mockPackages.map((pkg, i) => (
                                    <linearGradient key={pkg.id} id={`subgrad${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={PLAN_COLORS[i]} stopOpacity={0.28} />
                                        <stop offset="95%" stopColor={PLAN_COLORS[i]} stopOpacity={0.02} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            {mockPackages.map((pkg, i) => (
                                <Area
                                    key={pkg.id}
                                    type="monotone"
                                    dataKey={pkg.name}
                                    stroke={PLAN_COLORS[i]}
                                    strokeWidth={2}
                                    fill={`url(#subgrad${i})`}
                                    dot={{ r: 3, fill: PLAN_COLORS[i], strokeWidth: 0 }}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-4 mt-3">
                        {mockPackages.map((pkg, i) => (
                            <span key={pkg.id} className="flex items-center gap-1.5 text-[10px] font-semibold text-admin-dim">
                                <span className="w-2.5 h-2.5 inline-block rounded-sm" style={{ background: PLAN_COLORS[i] + '44', border: `2px solid ${PLAN_COLORS[i]}` }} />
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
                        <BarChart data={subBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                            <Bar dataKey="value" name="Subscribers" radius={[6, 6, 0, 0]}>
                                {subBarData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue per Plan Bar */}
                <div className="bg-card-bg border border-pace-border rounded-xl p-6 shadow-sm">
                    <SectionTitle icon={DollarSign} title="Revenue by Plan — This Month" sub="Total KES collected per plan in August" />
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={planRevData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                            <Tooltip content={<CustomTooltip prefix="KES " />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                            <Bar dataKey="value" name="Revenue" radius={[6, 6, 0, 0]}>
                                {planRevData.map((entry, i) => (
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
                                <th className="px-6 py-3.5 text-right">This Month Rev.</th>
                                <th className="px-6 py-3.5 text-right">Share of Rev.</th>
                                <th className="px-6 py-3.5 text-center">MoM Growth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {mockPackages.map((pkg, i) => {
                                const subs = planSubCounts[i].value
                                const rev = planRevData[i].value
                                const pct = ((rev / totalRev) * 100).toFixed(1)
                                const prevSubs = prevMonth[pkg.name] || 0
                                const currSubs2 = currMonth[pkg.name] || 0
                                const growth = prevSubs ? +(((currSubs2 - prevSubs) / prevSubs) * 100).toFixed(1) : 0
                                return (
                                    <tr key={pkg.id} className="hover:bg-pace-bg-subtle/40 transition-colors">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PLAN_COLORS[i] }} />
                                                <div>
                                                    <div className="font-semibold text-admin-value">{pkg.name}</div>
                                                    <div className="text-[10px] text-admin-dim">{pkg.poolName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <span className="font-mono font-semibold text-pace-purple text-[11px]">{pkg.limit}</span>
                                        </td>
                                        <td className="px-6 py-3.5 text-center font-semibold text-admin-value tabular-nums">{subs}</td>
                                        <td className="px-6 py-3.5 text-right font-semibold text-admin-value tabular-nums">KES {pkg.price.toLocaleString()}</td>
                                        <td className="px-6 py-3.5 text-right font-bold text-admin-value tabular-nums">KES {rev.toLocaleString()}</td>
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 h-1.5 rounded-full bg-pace-bg-subtle overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PLAN_COLORS[i] }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-admin-dim w-8 text-right">{pct}%</span>
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
