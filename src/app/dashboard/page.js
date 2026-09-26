"use client"

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
    Users, Activity, CreditCard, Network, 
    RefreshCw, Smartphone, Wallet, Wifi, 
    ArrowUpRight, Clock, Ticket, Tag, Plus,
    MessageSquare, ShieldCheck, LifeBuoy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CardSkeleton, Skeleton } from '@/components/Skeleton'
import { Badge } from '@/components/Badge'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { GlobalFilters } from '@/components/GlobalFilters'
import { dashboardService } from '@/services/isp/dashboard'
import authService from '@/lib/auth'

const DashboardSkeleton = () => (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 sm:px-0">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-pace-border pb-6">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
    </div>
);

function DashboardContent() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isWidgetsLoading, setIsWidgetsLoading] = useState(true)
    const [isChartsLoading, setIsChartsLoading] = useState(true)
    const [isTxLoading, setIsTxLoading] = useState(true)
    
    const [widgets, setWidgets] = useState(null)
    const [charts, setCharts] = useState([])
    const [transactions, setTransactions] = useState([])
    const [routers, setRouters] = useState([])
    const [tickets, setTickets] = useState([])

    const [isRevenueBlurred, setIsRevenueBlurred] = useState(true)
    const [filters, setFilters] = useState({ router: 'All Routers', dateRange: 'Today' })

    const fetchData = () => {
        setIsRefreshing(true)
        setIsWidgetsLoading(true)
        setIsChartsLoading(true)
        setIsTxLoading(true)

        // 1. Fetch widgets in parallel (instant top metric cards)
        dashboardService.getWidgets().then(w => {
            setWidgets(w)
            setIsWidgetsLoading(false)
        }).catch(err => {
            console.error("Widgets fetch error:", err)
            setIsWidgetsLoading(false)
        })

        // 2. Fetch revenue charts in parallel
        dashboardService.getCharts().then(c => {
            setCharts(c)
            setIsChartsLoading(false)
        }).catch(err => {
            console.error("Charts fetch error:", err)
            setIsChartsLoading(false)
        })

        // 3. Fetch recent transactions in parallel
        dashboardService.getRecentTransactions().then(tx => {
            setTransactions(tx)
            setIsTxLoading(false)
        }).catch(err => {
            console.error("Transactions fetch error:", err)
            setIsTxLoading(false)
        })

        // 4. Fetch router telemetry in parallel
        dashboardService.getRouterStatus().then(r => {
            setRouters(r)
        }).catch(err => {
            console.error("Router status fetch error:", err)
        })

        // 5. Fetch recent tickets in parallel
        dashboardService.getRecentTickets().then(t => setTickets(t)).catch(console.error)

        setTimeout(() => setIsRefreshing(false), 400)
    }

    useEffect(() => {
        fetchData()
    }, [filters])

    const metrics = widgets ? [
        { 
            label: "Active Subscribers", 
            value: widgets.active_users.value.toLocaleString(), 
            sub: 'Live Sessions', 
            icon: Users, 
            color: 'text-pace-purple', 
            bg: 'bg-pace-purple/5', 
            iconBorder: 'border-pace-purple/10 group-hover:border-pace-purple/30',
            accent: 'bg-gradient-to-b from-pace-purple to-indigo-500', 
            href: '/dashboard/customers' 
        },
        { 
            label: "Monthly Users", 
            value: (widgets.monthly_users?.value || 0).toLocaleString(), 
            sub: 'Total unique users', 
            icon: Network, 
            color: 'text-blue-500', 
            bg: 'bg-blue-500/5', 
            iconBorder: 'border-blue-500/10 group-hover:border-blue-500/30',
            accent: 'bg-gradient-to-b from-blue-400 to-cyan-500',
            href: '/dashboard/customers'
        },
        { 
            label: "Today's Revenue", 
            value: `KES ${widgets.todays_earnings.value.toLocaleString()}`, 
            sub: 'M-Pesa Ledger', 
            icon: Wallet, 
            color: 'text-emerald-500', 
            bg: 'bg-emerald-500/5', 
            iconBorder: 'border-emerald-500/10 group-hover:border-emerald-500/30',
            accent: 'bg-gradient-to-b from-emerald-400 to-teal-500', 
            isRevenue: true 
        },
        { 
            label: "Wallet Balance", 
            value: `KES ${(widgets.sms_balance?.value || 0).toLocaleString()}`, 
            sub: 'Settlement Pool', 
            icon: CreditCard, 
            color: 'text-amber-500', 
            bg: 'bg-amber-500/5', 
            iconBorder: 'border-amber-500/10 group-hover:border-amber-500/30',
            accent: 'bg-gradient-to-b from-amber-400 to-orange-500', 
            href: '/dashboard/wallet' 
        },
    ] : []

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            {/* Title Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Dashboard</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Infrastructure orchestration and performance summary</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                    <div className="w-full sm:w-auto">
                        <GlobalFilters onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f }))} />
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                        <button
                            onClick={fetchData}
                            disabled={isRefreshing}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all text-xs font-semibold disabled:opacity-50 cursor-pointer"
                            title="Refresh dashboard"
                        >
                            <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} />
                            <span>Refresh Data</span>
                        </button>
                        <Link
                            href="/dashboard/customers"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:bg-pace-purple/90 transition-all text-xs font-semibold shadow-sm active:scale-95"
                        >
                            <Plus size={15} />
                            <span>Provision Subscriber</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isWidgetsLoading && !widgets ? (
                    [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
                ) : metrics.map((metric, i) => {
                    const CardWrapper = metric.href ? Link : 'div';
                    const wrapperProps = metric.href ? { href: metric.href } : {
                        onClick: () => metric.isRevenue && setIsRevenueBlurred(!isRevenueBlurred)
                    };

                    return (
                        <CardWrapper
                            key={i}
                            {...wrapperProps}
                            className={cn(
                                "relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0",
                                (metric.href || metric.isRevenue) && "cursor-pointer"
                            )}
                        >
                            {/* Left accent color strip */}
                            <div className={cn("absolute left-0 top-0 bottom-0 w-1", metric.accent)} />
                            
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={metric.label}>
                                        {metric.label}
                                    </p>
                                    <p className={cn(
                                        "text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate",
                                        metric.isRevenue && isRevenueBlurred && "blur-md select-none"
                                    )}>
                                        {metric.value}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] text-admin-dim truncate">{metric.sub}</p>
                                        {metric.isRevenue && (
                                            <span className="text-[9px] text-pace-purple font-bold">
                                                {isRevenueBlurred ? "Reveal" : "Hide"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-105", metric.iconBorder, metric.bg)}>
                                    <metric.icon className={cn(metric.color, "w-4 h-4")} />
                                </div>
                            </div>
                        </CardWrapper>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Router Table - Matching wispportal exactly */}
                <div className="lg:col-span-4 bg-card-bg border border-pace-border rounded-xl p-5 flex flex-col order-2 lg:order-1">
                    <div className="flex justify-between items-center mb-5">
                        <div>
                            <h4 className="text-sm font-medium text-admin-value">Your Mikrotiks</h4>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase tracking-wider">online/offline</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    </div>

                    <div className="space-y-2 flex-1">
                        {isWidgetsLoading && routers.length === 0 ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="p-2.5 border border-pace-border rounded-xl flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-8 h-8 rounded-lg" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-20" />
                                            <Skeleton className="h-2 w-16" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-12 rounded-full" />
                                </div>
                            ))
                        ) : routers.map((device, idx) => (
                            <div key={idx} className="p-2.5 border border-pace-border rounded-xl hover:bg-pace-bg-subtle transition-all group flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-pace-bg-subtle rounded-lg opacity-80 group-hover:bg-pace-purple/5 transition-colors">
                                        <Image src="/router.png" alt="R" width={20} height={20} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-admin-value">{device.name}</p>
                                        <p className="text-[9px] font-medium text-admin-dim font-mono">{device.ip}</p>
                                    </div>
                                </div>
                                <Badge 
                                    variant={device.status === 'Online' ? 'success' : 'error'} 
                                    className="text-[8px] font-semibold tracking-wider px-2 py-0.5 border-none"
                                >
                                    {device.status}
                                </Badge>
                            </div>
                        ))}
                    </div>

                    <Link href="/dashboard/routers" className="mt-6 py-2.5 border border-dashed border-pace-border rounded-xl text-[10px] font-bold text-admin-dim hover:text-pace-purple hover:border-pace-purple transition-all text-center uppercase tracking-widest">
                        Full View
                    </Link>
                </div>

                {/* Activity Trend Chart */}
                <div className="lg:col-span-8 bg-card-bg border border-pace-border rounded-xl p-6 order-1 lg:order-2">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h4 className="text-sm font-medium text-admin-value">Activity & Growth</h4>
                            <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Utilization Trends</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-pace-purple" />
                                <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">Revenue</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">Subscribers</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        {isChartsLoading ? <Skeleton className="w-full h-full rounded-xl" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4B1D8F" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4B1D8F" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2CB34A" stopOpacity={0.08}/>
                                            <stop offset="95%" stopColor="#2CB34A" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: '500' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#4B1D8F" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                                    <Area type="monotone" dataKey="entries" stroke="#2CB34A" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Collections */}
                <div className="lg:col-span-5 bg-card-bg border border-pace-border rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="text-sm font-medium text-admin-value">Recent Activity</h4>
                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Live collection stream</p>
                        </div>
                        <Link href="/dashboard/mpesa" className="p-2 bg-pace-bg-subtle rounded-lg text-admin-dim hover:text-pace-purple transition-all">
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {isTxLoading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-9 h-9 rounded-xl" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-24" />
                                            <Skeleton className="h-2 w-16" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            ))
                        ) : transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-pace-bg-subtle flex items-center justify-center text-admin-dim group-hover:bg-pace-purple/5 group-hover:text-pace-purple transition-colors">
                                        <Smartphone size={15} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-admin-value">{tx.user_phone}</p>
                                        <p className="text-[10px] text-admin-dim font-medium mt-0.5">{tx.mpesa_code} • {tx.time_ago}</p>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-green-600">KES {tx.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-7">
                    {/* Support Queue */}
                    <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h4 className="text-sm font-medium text-admin-value">Support Queue</h4>
                                <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5 tracking-wider">Active Customer Inquiries</p>
                            </div>
                            <Link href="/dashboard/tickets">
                                <Badge variant="info" className="px-2.5 py-0.5 text-[8px] font-bold cursor-pointer hover:bg-pace-purple/20 transition-all">
                                    {widgets?.open_tickets?.value ?? tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length} Active
                                </Badge>
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {isTxLoading && tickets.length === 0 ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className="p-3.5 border border-pace-border rounded-xl space-y-2">
                                        <Skeleton className="h-3 w-3/4" />
                                        <div className="flex justify-between items-center">
                                            <Skeleton className="h-2 w-20" />
                                            <Skeleton className="h-3 w-12 rounded-full" />
                                        </div>
                                    </div>
                                ))
                            ) : tickets.length === 0 ? (
                                <div className="p-10 border border-dashed border-pace-border rounded-xl text-center flex flex-col items-center justify-center gap-1.5">
                                    <LifeBuoy size={24} className="text-gray-300 mb-1" />
                                    <p className="text-xs font-semibold text-admin-value">No Pending Support Tickets</p>
                                    <p className="text-[10px] text-gray-400">All customer inquiries are resolved</p>
                                </div>
                            ) : (
                                tickets.slice(0, 5).map((ticket) => {
                                    const priorityVariant = 
                                        ticket.priority?.toLowerCase() === 'high' ? 'error' : 
                                        ticket.priority?.toLowerCase() === 'medium' ? 'warning' : 'info';
                                    return (
                                        <Link 
                                            key={ticket.id} 
                                            href="/dashboard/tickets"
                                            className="block p-3.5 border border-pace-border rounded-xl hover:bg-pace-bg-subtle hover:border-pace-purple/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-admin-value truncate group-hover:text-pace-purple transition-colors">{ticket.subject}</p>
                                                    <p className="text-[10px] text-admin-dim font-medium mt-0.5">{ticket.customer || 'Customer'}</p>
                                                </div>
                                                <Badge variant={priorityVariant} className="px-2 py-0.5 text-[8px] font-bold shrink-0">
                                                    {ticket.priority || 'Normal'}
                                                </Badge>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    )
}
