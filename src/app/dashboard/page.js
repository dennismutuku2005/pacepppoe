"use client"

import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    Users, Activity, CreditCard, Network,
    RefreshCw, Smartphone, Hash,
    Wallet, Wifi, ArrowUpRight, Clock, Plus, ShieldCheck, ShieldAlert
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CardSkeleton, Skeleton } from '@/components/Skeleton'
import { Badge } from '@/components/Badge'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockDashboardData } from '@/services/mockData'

const DashboardSkeleton = () => (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-6">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-card-bg border border-pace-border rounded-xl p-6 h-[400px]">
                <Skeleton className="w-full h-full rounded-lg" />
            </div>
            <div className="lg:col-span-4 bg-card-bg border border-pace-border rounded-xl p-6 h-[400px]">
                <Skeleton className="w-full h-full rounded-lg" />
            </div>
        </div>
    </div>
);

function DashboardContent() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [recentPayments, setRecentPayments] = useState([]);
    const [routers, setRouters] = useState([]);

    useEffect(() => {
        // Simulate initial load
        const timer = setTimeout(() => {
            setStats(mockDashboardData.stats);
            setRecentPayments(mockDashboardData.recentPayments);
            setRouters(mockDashboardData.routerStatus);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <DashboardSkeleton />;

    const metrics = [
        { label: "Active Customers", value: stats.activeCustomers.toString(), note: 'Active PPPoE Sessions', icon: Users, color: 'text-pace-purple', bg: 'bg-pace-purple/10' },
        { label: "Today's Payments", value: `KSH ${stats.totalRevenueToday.toLocaleString()}`, note: `${stats.todayPayments} transactions today`, icon: Wallet, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: "Online Routers", value: `${stats.routersOnline}/${stats.routersTotal}`, note: 'MikroTik connectivity', icon: Network, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: "Expiring Soon", value: stats.expiringSoon.toString(), note: 'In next 48 hours', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    ];

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-bold text-pace-purple uppercase tracking-tight">PPPoE Control Center</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-widest uppercase">Network Performance & Revenue Overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-pace-purple text-white rounded-xl hover:bg-pace-purple/90 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-pace-purple/10">
                        <Plus size={14} /> New Customer
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {metrics.map((metric, i) => (
                    <div key={i} className="bg-card-bg border border-pace-border rounded-xl p-4 sm:p-5 hover:border-pace-purple/20 transition-all group">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", metric.bg, metric.color)}>
                            <metric.icon size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-admin-value tracking-tight">{metric.value}</h3>
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">{metric.label}</p>
                            <div className="flex items-center gap-1.5 mt-2 text-[9px] text-admin-dim font-medium uppercase tracking-tighter">
                                <Activity size={10} /> {metric.note}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue vs Activity Chart */}
                <div className="lg:col-span-8 bg-card-bg border border-pace-border rounded-xl p-4 sm:p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h4 className="text-sm font-bold text-pace-purple uppercase tracking-tight">Financial Pulse</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Daily revenue collection trend</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-pace-purple" />
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Revenue</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { day: 'Mon', amount: 4500 },
                                { day: 'Tue', amount: 5200 },
                                { day: 'Wed', amount: 3800 },
                                { day: 'Thu', amount: 6100 },
                                { day: 'Fri', amount: 5900 },
                                { day: 'Sat', amount: 7200 },
                                { day: 'Sun', amount: stats.totalRevenueToday },
                            ]}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4B1D8F" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#4B1D8F" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="amount" stroke="#4B1D8F" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Today's Payments List */}
                <div className="lg:col-span-4 bg-card-bg border border-pace-border rounded-xl p-5 shadow-sm flex flex-col h-full uppercase">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="text-sm font-bold text-pace-purple uppercase tracking-tight">Today's Payments</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Real-time M-Pesa tracking</p>
                        </div>
                        <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded-lg border border-green-500/10 text-[9px] font-bold">KSH {stats.totalRevenueToday.toLocaleString()}</div>
                    </div>

                    <div className="flex-1 space-y-1">
                        {recentPayments.map((pay) => (
                            <div key={pay.id} className="flex items-center justify-between p-3 border border-pace-border rounded-xl hover:bg-pace-bg-subtle transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-pace-bg-subtle border border-pace-border flex items-center justify-center text-admin-dim group-hover:text-pace-purple transition-all">
                                        <CreditCard size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-admin-value group-hover:text-pace-purple transition-colors">{pay.customer}</p>
                                        <p className="text-[8px] font-medium text-admin-dim flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
                                            <Clock size={8} /> {pay.date.split(' ')[1]} • {pay.plan}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] font-bold text-admin-value">KSH {pay.amount.toLocaleString()}</p>
                                    <div className="flex items-center gap-1 justify-end mt-0.5">
                                        <div className="w-1 h-1 rounded-full bg-green-500" />
                                        <span className="text-[8px] font-bold text-green-500 tracking-widest">{pay.method}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link href="/dashboard/mpesa" className="mt-5 w-full py-2.5 border border-dashed border-pace-border rounded-xl text-[10px] font-bold text-admin-dim hover:text-pace-purple hover:border-pace-purple transition-all text-center uppercase tracking-widest">
                        View All Collections
                    </Link>
                </div>
            </div>

            {/* Router Status Grid */}
            <div className="bg-card-bg border border-pace-border rounded-xl p-6">
                <div className="flex justify-between items-center mb-6 border-b border-pace-border pb-4">
                    <div>
                        <h4 className="text-sm font-bold text-pace-purple uppercase tracking-tight">MikroTik Infrastructure</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Core router health & session count</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    {routers.map((device) => (
                        <div key={device.id} className="p-4 border border-pace-border rounded-2xl hover:border-pace-purple/30 transition-all group bg-pace-bg-subtle/50">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-pace-border flex items-center justify-center text-admin-dim group-hover:text-pace-purple transition-all group-hover:rotate-12">
                                    <Network size={18} />
                                </div>
                                <Badge variant={device.status === 'online' ? 'success' : 'error'} className="text-[8px] font-bold uppercase tracking-tighter border-none px-2 py-0.5">
                                    {device.status}
                                </Badge>
                            </div>
                            <div>
                                <h5 className="text-[11px] font-bold text-admin-value uppercase truncate">{device.name}</h5>
                                <p className="text-[9px] font-medium text-admin-dim font-mono mt-0.5">{device.ip}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-pace-border flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold text-admin-dim uppercase tracking-tighter">Sessions</span>
                                    <span className="text-xs font-bold text-pace-purple">{device.users}</span>
                                </div>
                                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", device.status === 'online' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                                    {device.status === 'online' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    )
}
