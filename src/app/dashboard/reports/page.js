"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { FileText, Download, TrendingUp, Filter, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function ReportsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [reportType, setReportType] = useState('packages')

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-lg font-bold text-pace-purple dark:text-pace-purple-light flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pace-purple/10 flex items-center justify-center">
                            <FileText size={20} className="text-pace-purple" />
                        </div>
                        Intelligence Reports
                    </h1>
                    <p className="text-[10px] font-bold text-admin-dim mt-1 tracking-widest uppercase">Deep analytics on bandwidth usage, revenue, and package performance</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button className="px-5 py-2.5 bg-card-bg border border-pace-border rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-pace-bg-subtle transition-all flex items-center gap-2 active:scale-95 shadow-sm">
                        <Calendar size={14} /> This Month
                    </button>
                    <button className="px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-pace-purple/20 active:scale-95">
                        <Download size={14} /> Export XLS
                    </button>
                </div>
            </div>

            {/* Performance Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-admin-value uppercase tracking-tight">Package Popularity</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Number of active subscriptions by tier</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-pace-purple/5 text-pace-purple flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    
                    <div className="h-72 w-full">
                        {isLoading ? (
                            <Skeleton className="w-full h-full rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mockDashboardData.packagePopularity}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} 
                                    />
                                    <Tooltip 
                                        cursor={{fill: '#F8FAFC'}}
                                        contentStyle={{borderRadius: '12px', border: '1px solid #E2E8F0', padding: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        itemStyle={{fontSize: '11px', fontWeight: 700, color: '#4B1D8F'}}
                                    />
                                    <Bar dataKey="sales" radius={[6, 6, 0, 0]} barSize={40}>
                                        {mockDashboardData.packagePopularity.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4B1D8F' : '#6366F1'} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-admin-value uppercase tracking-tight mb-6">Revenue Attribution</h3>
                    <div className="space-y-6 flex-1">
                        {isLoading ? (
                            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
                        ) : mockDashboardData.packagePopularity.map((pkg, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-[11px] font-black text-admin-value uppercase tracking-tight">{pkg.name}</p>
                                        <p className="text-[9px] font-bold text-admin-dim uppercase tracking-widest">{pkg.sales} Subscribers</p>
                                    </div>
                                    <p className="text-sm font-black text-pace-purple tabular-nums">KES {pkg.revenue.toLocaleString()}</p>
                                </div>
                                <div className="h-1.5 w-full bg-pace-bg-subtle rounded-full overflow-hidden border border-pace-border/50">
                                    <div 
                                        className={cn("h-full transition-all duration-1000", i % 2 === 0 ? "bg-pace-purple" : "bg-indigo-500")}
                                        style={{ width: `${(pkg.revenue / 70000) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<div>Loading Insights...</div>}>
            <ReportsContent />
        </Suspense>
    )
}
