"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Network, Users, Wallet, Smartphone, ArrowUpRight, 
  LifeBuoy, ServerCog, RefreshCw, Activity, Layers, 
  PieChart as PieIcon, TrendingUp, BarChart2, CheckCircle2, 
  AlertTriangle, CreditCard, ArrowRight, ShieldCheck, 
  CheckCircle, XCircle, Clock
} from 'lucide-react'
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { dashboardService } from '@/services/admin/dashboard'
import { Skeleton, AdminCardSkeleton } from '@/components/Skeleton'
import { Badge } from '@/components/Badge'
import { cn } from '@/lib/utils'

export default function AdminHomePage() {
  const [isWidgetsLoading, setIsWidgetsLoading] = useState(true)
  const [isChartLoading, setIsChartLoading] = useState(true)
  const [isFiscalLoading, setIsFiscalLoading] = useState(true)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true)
  const [isTxLoading, setIsTxLoading] = useState(true)
  const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false)

  const [widgets, setWidgets] = useState(null)
  const [charts, setCharts] = useState([])
  const [incomeExpenses, setIncomeExpenses] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [isWalletBlurred, setIsWalletBlurred] = useState(true)

  // 1. Fetch Top KPI Widgets
  const fetchWidgets = async () => {
    setIsWidgetsLoading(true)
    try {
      const res = await dashboardService.getWidgets()
      if (res?.status === 'success' && res.data) {
        setWidgets(res.data)
      }
    } catch (e) {
      console.error("Admin widgets fetch error", e)
    } finally {
      setIsWidgetsLoading(false)
    }
  }

  // 2. Fetch 7-Day Revenue Trend
  const fetchCharts = async () => {
    setIsChartLoading(true)
    try {
      const res = await dashboardService.getRevenueChart()
      if (res?.status === 'success' && Array.isArray(res.data)) {
        setCharts(res.data)
      }
    } catch (e) {
      console.error("Admin charts fetch error", e)
    } finally {
      setIsChartLoading(false)
    }
  }

  // 3. Fetch 6-Month Income vs Expenses
  const fetchIncomeExpenses = async () => {
    setIsFiscalLoading(true)
    try {
      const res = await dashboardService.getIncomeVsExpenses()
      if (res?.status === 'success' && Array.isArray(res.data)) {
        setIncomeExpenses(res.data)
      }
    } catch (e) {
      console.error("Admin fiscal chart fetch error", e)
    } finally {
      setIsFiscalLoading(false)
    }
  }

  // 4. Fetch Distributions & Top ISPs
  const fetchAnalytics = async () => {
    setIsAnalyticsLoading(true)
    try {
      const res = await dashboardService.getAnalytics()
      if (res?.status === 'success' && res.data) {
        setAnalytics(res.data)
      }
    } catch (e) {
      console.error("Admin analytics fetch error", e)
    } finally {
      setIsAnalyticsLoading(false)
    }
  }

  // 5. Fetch Live Transactions Stream
  const fetchTransactions = async () => {
    setIsTxLoading(true)
    try {
      const res = await dashboardService.getRecentTransactions(6)
      if (res?.status === 'success' && Array.isArray(res.data)) {
        setTransactions(res.data)
      }
    } catch (e) {
      console.error("Admin transactions fetch error", e)
    } finally {
      setIsTxLoading(false)
    }
  }

  // Global Parallel Refresh Trigger
  const handleRefreshAll = async () => {
    setIsGlobalRefreshing(true)
    await Promise.allSettled([
      fetchWidgets(),
      fetchCharts(),
      fetchIncomeExpenses(),
      fetchAnalytics(),
      fetchTransactions()
    ])
    setIsGlobalRefreshing(false)
  }

  // Parallel non-blocking initial mount
  useEffect(() => {
    fetchWidgets()
    fetchCharts()
    fetchIncomeExpenses()
    fetchAnalytics()
    fetchTransactions()
  }, [])

  const cards = widgets ? [
    { 
      label: 'Active Subscribers', 
      value: (widgets.active_users?.value ?? 0).toLocaleString(), 
      sub: `${widgets.monthly_users?.value ?? 0} Total Pool`,
      icon: Users, 
      color: 'text-pace-purple', 
      bg: 'bg-pace-purple/5',
      accent: 'bg-gradient-to-b from-pace-purple to-indigo-500',
      iconBorder: 'border-pace-purple/10 group-hover:border-pace-purple/30',
      href: '/admin/isps'
    },
    { 
      label: 'NAS Routers', 
      value: `${widgets.routers_online ?? 0} / ${widgets.routers_total ?? 0}`, 
      sub: `${widgets.routers_offline ?? 0} Offline`,
      icon: ServerCog, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/5',
      accent: 'bg-gradient-to-b from-blue-400 to-indigo-600',
      iconBorder: 'border-blue-500/10 group-hover:border-blue-500/30',
      href: '/admin/routers'
    },
    { 
      label: "Today's Revenue", 
      value: `KES ${(widgets.todays_earnings?.value ?? 0).toLocaleString()}`, 
      sub: `${widgets.today_transactions_count ?? 0} Collections`,
      icon: Wallet, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/5',
      accent: 'bg-gradient-to-b from-emerald-400 to-teal-500',
      iconBorder: 'border-emerald-500/10 group-hover:border-emerald-500/30',
      href: '/admin/mpesa'
    },
    { 
      label: 'Registered ISPs', 
      value: (widgets.isp_tenants?.value ?? 0).toLocaleString(), 
      sub: 'Tenant Accounts',
      icon: Layers, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/5',
      accent: 'bg-gradient-to-b from-amber-400 to-orange-500',
      iconBorder: 'border-orange-500/10 group-hover:border-orange-500/30',
      href: '/admin/isps'
    },
    { 
      label: 'Total ISP Wallets', 
      value: `KES ${(widgets.total_wallets_balance?.value ?? 0).toLocaleString()}`, 
      sub: 'Combined Balances',
      icon: CreditCard, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-500/5',
      accent: 'bg-gradient-to-b from-rose-500 to-red-600',
      iconBorder: 'border-indigo-500/10 group-hover:border-indigo-500/30',
      isWallet: true,
      href: '/admin/wallets'
    },
  ] : []

  // Dynamic Pie Distributions
  const routerPieData = analytics?.router_distribution?.filter(d => d.value > 0) || [
    { name: 'Online', value: widgets?.routers_online || 0, color: '#10B981' },
    { name: 'Offline', value: widgets?.routers_offline || 0, color: '#F43F5E' }
  ]

  const subscriberPieData = analytics?.subscriber_distribution?.filter(d => d.value > 0) || [
    { name: 'Active', value: widgets?.active_users?.value || 0, color: '#4B1D8F' },
    { name: 'Disabled', value: Math.max(0, (widgets?.monthly_users?.value || 0) - (widgets?.active_users?.value || 0)), color: '#F59E0B' }
  ]

  const ticketPieData = analytics?.ticket_distribution?.filter(d => d.value > 0) || []

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">Admin Portal</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Multi-tenant network infrastructure orchestration & fiscal intelligence</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleRefreshAll}
            disabled={isGlobalRefreshing || (isWidgetsLoading && isChartLoading && isFiscalLoading)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all text-xs font-semibold disabled:opacity-50 cursor-pointer"
            title="Refresh Admin Overview"
          >
            <RefreshCw size={14} className={isGlobalRefreshing ? "animate-spin" : ""} />
            <span>Refresh Overview</span>
          </button>
          <Link href="/admin/routers" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all shadow-sm active:scale-95 cursor-pointer">
            <Network size={15} /> <span>Manage Routers</span>
          </Link>
          <Link href="/admin/isps" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl text-xs font-semibold hover:border-pace-purple hover:text-pace-purple transition-all active:scale-95 cursor-pointer">
            <Users size={15} /> <span>Manage ISPs</span>
          </Link>
        </div>
      </div>

      {/* Top 5 KPI Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {isWidgetsLoading && !widgets ? (
          [...Array(5)].map((_, i) => (
            <AdminCardSkeleton 
              key={i} 
              className={cn(i === 4 && "col-span-2 md:col-span-1")} 
            />
          ))
        ) : cards.map((card) => {
          const CardWrapper = card.href ? Link : 'div'
          const wrapperProps = card.href ? { href: card.href } : {
            onClick: () => card.isWallet && setIsWalletBlurred(!isWalletBlurred)
          }

          return (
            <CardWrapper 
              key={card.label} 
              {...wrapperProps}
              className={cn(
                "relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-3.5 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0 cursor-pointer",
                card.isWallet && "col-span-2 md:col-span-1"
              )}
            >
              {/* Left accent color strip */}
              <div className={cn("absolute left-0 top-0 bottom-0 w-1", card.accent)} />
              
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-medium text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={card.label}>
                    {card.label}
                  </p>
                  <div className="relative mt-1">
                    <p className={cn(
                      "text-sm sm:text-base font-medium text-admin-value group-hover:scale-[1.02] transition-all origin-left duration-300 truncate tabular-nums",
                      card.isWallet && isWalletBlurred && "blur-md select-none"
                    )}>
                      {card.value}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      {card.sub}
                    </p>
                  </div>
                </div>
                <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-105", card.iconBorder, card.bg)}>
                  <card.icon className={cn(card.color, "w-3.5 h-3.5 sm:w-4 sm:h-4")} />
                </div>
              </div>
            </CardWrapper>
          )
        })}
      </div>

      {/* Row 1: Dual Main Analytics Charts (Revenue Trend + 6-Month Fiscal Bar Chart) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* 7-Day Revenue Velocity (Area Chart) */}
        <div className="xl:col-span-7 bg-card-bg border border-pace-border rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-pace-purple" />
                <h3 className="text-sm font-semibold text-admin-value">Revenue Collection Velocity</h3>
              </div>
              <p className="text-[11px] text-admin-dim mt-0.5">7-day daily M-Pesa throughput across all ISPs</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-pace-purple" />
              <span className="text-[10px] font-medium text-admin-dim">Daily M-Pesa Collections (KES)</span>
            </div>
          </div>
          
          <div className="h-[260px] w-full">
            {isChartLoading && charts.length === 0 ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4B1D8F" stopOpacity={0.18}/>
                      <stop offset="95%" stopColor="#4B1D8F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip 
                    formatter={(val) => [`KES ${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: '500', backgroundColor: 'var(--card-bg, #fff)' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#4B1D8F" strokeWidth={2.5} fillOpacity={1} fill="url(#adminRevenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 6-Month Fiscal Performance (Bar Chart) */}
        <div className="xl:col-span-5 bg-card-bg border border-pace-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-emerald-500" />
                <h3 className="text-sm font-semibold text-admin-value">6-Month Fiscal Flow</h3>
              </div>
              <p className="text-[11px] text-admin-dim mt-0.5">Monthly revenue versus recorded operating expenses</p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-admin-dim">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-medium text-admin-dim">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-[260px] w-full">
            {isFiscalLoading && incomeExpenses.length === 0 ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : incomeExpenses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-admin-dim text-xs">
                <BarChart2 size={24} className="opacity-40 mb-1" />
                <span>No historical fiscal data recorded yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeExpenses} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip 
                    formatter={(val, name) => [`KES ${Number(val).toLocaleString()}`, name === 'income' ? 'Total Inflow' : 'Expenses']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: '500', backgroundColor: 'var(--card-bg, #fff)' }}
                  />
                  <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Visual Distribution Doughnut / Pie Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pie Chart 1: Router Fleet Health */}
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-admin-value flex items-center gap-1.5">
                <Network size={15} className="text-pace-purple" /> Router Fleet Health
              </h3>
              <p className="text-[11px] text-admin-dim mt-0.5">Live NAS operational availability</p>
            </div>
            <Link href="/admin/routers" className="text-[11px] font-medium text-pace-purple hover:underline">
              View
            </Link>
          </div>

          <div className="h-[180px] w-full relative flex items-center justify-center">
            {isAnalyticsLoading && !analytics ? (
              <Skeleton className="w-28 h-28 rounded-full" />
            ) : routerPieData.reduce((a, b) => a + b.value, 0) === 0 ? (
              <div className="text-center text-xs text-admin-dim">No routers configured</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={routerPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {routerPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val, name) => [`${val} Routers`, name]}
                    contentStyle={{ borderRadius: '10px', fontSize: '11px', fontWeight: '500' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 pt-2 border-t border-pace-border/60">
            <div className="flex items-center gap-1.5 text-xs font-medium text-admin-value">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Online ({widgets?.routers_online ?? 0})</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-admin-value">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Offline ({widgets?.routers_offline ?? 0})</span>
            </div>
          </div>
        </div>

        {/* Pie Chart 2: Subscriber Status Ratio */}
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-admin-value flex items-center gap-1.5">
                <Users size={15} className="text-blue-500" /> Subscriber Status
              </h3>
              <p className="text-[11px] text-admin-dim mt-0.5">Active sessions vs expired / disabled</p>
            </div>
            <Link href="/admin/isps" className="text-[11px] font-medium text-pace-purple hover:underline">
              Matrix
            </Link>
          </div>

          <div className="h-[180px] w-full relative flex items-center justify-center">
            {isAnalyticsLoading && !analytics ? (
              <Skeleton className="w-28 h-28 rounded-full" />
            ) : subscriberPieData.reduce((a, b) => a + b.value, 0) === 0 ? (
              <div className="text-center text-xs text-admin-dim">No subscribers provisioned</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriberPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {subscriberPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val, name) => [`${val} Users`, name]}
                    contentStyle={{ borderRadius: '10px', fontSize: '11px', fontWeight: '500' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 pt-2 border-t border-pace-border/60">
            <div className="flex items-center gap-1.5 text-xs font-medium text-admin-value">
              <span className="w-2.5 h-2.5 rounded-full bg-pace-purple" />
              <span>Active ({widgets?.active_users?.value ?? 0})</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-admin-value">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Disabled ({Math.max(0, (widgets?.monthly_users?.value ?? 0) - (widgets?.active_users?.value ?? 0))})</span>
            </div>
          </div>
        </div>

        {/* Pie Chart 3: Global Incident Resolution */}
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-admin-value flex items-center gap-1.5">
                <LifeBuoy size={15} className="text-amber-500" /> Support Queue
              </h3>
              <p className="text-[11px] text-admin-dim mt-0.5">Tickets by lifecycle resolution state</p>
            </div>
            <Link href="/admin/tickets" className="text-[11px] font-medium text-pace-purple hover:underline">
              Tickets
            </Link>
          </div>

          <div className="h-[180px] w-full relative flex items-center justify-center">
            {isAnalyticsLoading && !analytics ? (
              <Skeleton className="w-28 h-28 rounded-full" />
            ) : ticketPieData.length === 0 ? (
              <div className="text-center text-xs text-admin-dim flex flex-col items-center">
                <CheckCircle2 size={22} className="text-emerald-500 mb-1" />
                <span>All support tickets resolved</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ticketPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val, name) => [`${val} Tickets`, name]}
                    contentStyle={{ borderRadius: '10px', fontSize: '11px', fontWeight: '500' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-pace-border/60 text-[11px] font-medium text-admin-value">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Open ({widgets?.open_tickets ?? 0})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Progress</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Resolved</span>
          </div>
        </div>
      </div>

      {/* Row 3: Top ISPs Leaderboard + Live Transactions Stream */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Top ISP Tenants Leaderboard */}
        <div className="xl:col-span-7 bg-card-bg border border-pace-border rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-pace-purple" />
                <h3 className="text-sm font-semibold text-admin-value">Leading ISP Tenants</h3>
              </div>
              <p className="text-[11px] text-admin-dim mt-0.5">Top providers ranked by active subscriber base and throughput</p>
            </div>
            <Link href="/admin/isps" className="flex items-center gap-1 text-xs font-semibold text-pace-purple hover:underline">
              <span>View All ISPs</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead>
                <tr className="bg-pace-bg-subtle/60 border-b border-pace-border text-[10px] uppercase font-bold text-admin-dim tracking-wider">
                  <th className="px-4 py-3">ISP Provider</th>
                  <th className="px-4 py-3 text-center">Routers</th>
                  <th className="px-4 py-3 text-center">Subscribers</th>
                  <th className="px-4 py-3 text-right">Wallet Balance</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pace-border">
                {isAnalyticsLoading && !analytics ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    </tr>
                  ))
                ) : (!analytics?.top_isps || analytics.top_isps.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-admin-dim">
                      No ISP tenants registered yet. Click "Manage ISPs" to onboard new providers.
                    </td>
                  </tr>
                ) : (
                  analytics.top_isps.map((isp) => (
                    <tr key={isp.id} className="hover:bg-pace-bg-subtle/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-pace-purple/10 flex items-center justify-center text-pace-purple font-bold text-xs shrink-0">
                            {isp.name?.charAt(0)?.toUpperCase() || 'I'}
                          </div>
                          <div>
                            <p className="font-semibold text-admin-value group-hover:text-pace-purple transition-colors">{isp.name}</p>
                            <p className="text-[10px] text-admin-dim font-mono">@{isp.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        <Badge variant="default" className="text-[10px] px-2 py-0.5 font-semibold">
                          {isp.routers_count} NAS
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-admin-value tabular-nums font-mono">
                          {isp.subscribers_count.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-admin-value">
                        KES {Number(isp.wallet_balance).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/isps`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-admin-dim hover:text-pace-purple transition-colors"
                        >
                          <span>Manage</span>
                          <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Transactions Stream */}
        <div className="xl:col-span-5 bg-card-bg border border-pace-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-emerald-500" />
                  <h3 className="text-sm font-semibold text-admin-value">Live M-Pesa Feed</h3>
                </div>
                <p className="text-[11px] text-admin-dim mt-0.5">Realtime global collections stream</p>
              </div>
              <Link href="/admin/mpesa" className="p-1.5 bg-pace-bg-subtle border border-pace-border rounded-lg text-admin-dim hover:text-pace-purple transition-all cursor-pointer" title="All M-Pesa Logs">
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {isTxLoading && transactions.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))
              ) : transactions.length === 0 ? (
                <div className="text-center py-10">
                  <Smartphone size={28} className="mx-auto text-admin-dim mb-2 opacity-40" />
                  <p className="text-xs text-admin-dim font-medium">No recent M-Pesa transactions</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Incoming STK & C2B payments appear here</p>
                </div>
              ) : (
                transactions.map((tx) => {
                  const isHash = (str) => typeof str === 'string' && (str.length > 20 || /^[a-f0-9]{32,64}$/i.test(str));
                  const displayName = tx.customer_name 
                    || (!isHash(tx.user_phone) ? tx.user_phone : null)
                    || (!isHash(tx.subscriber_phone) ? tx.subscriber_phone : null)
                    || (tx.account_reference ? `Acc: ${tx.account_reference}` : 'M-Pesa Customer');

                  return (
                    <div key={tx.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-pace-bg-subtle/60 transition-colors group">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shrink-0">
                          <Smartphone size={14} />
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="text-xs font-semibold text-admin-value truncate" title={displayName}>{displayName}</p>
                          <p className="text-[10px] text-admin-dim font-mono">{tx.mpesa_code} • {tx.time_ago}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-emerald-600 shrink-0 font-mono">
                        +KES {Number(tx.amount || 0).toLocaleString()}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link href="/admin/mpesa" className="mt-4 pt-3 border-t border-pace-border/60 text-center text-[11px] font-semibold text-pace-purple hover:underline block">
            View Complete Transaction Ledger &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}


