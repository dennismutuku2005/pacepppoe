"use client"

import React, { useState, useEffect } from 'react'
import { 
    Wallet, TrendingUp, TrendingDown, DollarSign, 
    Calendar, Download, Activity, PieChart as PieIcon,
    ChevronLeft, ChevronRight, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar, 
    Cell, PieChart, Pie, Legend 
} from 'recharts'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/Skeleton'
import { reportService } from '@/services/report'

export default function IncomeReportPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    
    // Filters
    const now = new Date();
    const [filters, setFilters] = useState({
        rangeType: 'monthly',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        startDate: now.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchReport = async () => {
        try {
            setIsLoading(true);
            const res = await reportService.getIncomeReport(filters);
            if (res && res.status === 'success') {
                setReportData(res.report);
            }
        } catch (error) {
            console.error("Report fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isMounted) fetchReport();
    }, [filters, isMounted]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentMonthLabel = filters.rangeType === 'monthly' 
        ? `${months[filters.month - 1]} ${filters.year}`
        : `${filters.startDate} to ${filters.endDate}`;

    const changeMonth = (offset) => {
        let newMonth = filters.month + offset;
        let newYear = filters.year;
        
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        
        setFilters({ ...filters, month: newMonth, year: newYear });
    };

    if (!isMounted) return null;

    const summaryMetrics = reportData ? [
        {
            label: "Total Income",
            value: `KSH ${reportData.total_income.toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-500/10",
            trend: "Revenue Received"
        },
        {
            label: "Total Expenses",
            value: `KSH ${reportData.total_expenses.toLocaleString()}`,
            icon: TrendingDown,
            color: "text-red-600",
            bg: "bg-red-500/10",
            trend: "Operational Costs"
        },
        {
            label: "Net Profit",
            value: `KSH ${reportData.net_profit.toLocaleString()}`,
            icon: Activity,
            color: reportData.net_profit >= 0 ? "text-pace-purple" : "text-red-600",
            bg: reportData.net_profit >= 0 ? "bg-pace-purple/10" : "bg-red-500/10",
            trend: `Margin: ${reportData.margin}%`
        }
    ] : [];

    // Chart Data
    const trendData = reportData?.daily_trend || [];
    const expenseBreakdown = reportData?.expense_breakdown || [];
    const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-8 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-pace-purple uppercase tracking-tight">Income Report</h1>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5 tracking-widest uppercase">Financial Performance Analysis</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    {/* Range Type Toggle */}
                    <div className="flex bg-pace-bg-subtle p-1 rounded-xl border border-pace-border w-full sm:w-auto">
                        <button 
                            onClick={() => setFilters({...filters, rangeType: 'monthly'})}
                            className={cn(
                                "flex-1 sm:px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                                filters.rangeType === 'monthly' ? "bg-white shadow-sm text-pace-purple" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setFilters({...filters, rangeType: 'custom'})}
                            className={cn(
                                "flex-1 sm:px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                                filters.rangeType === 'custom' ? "bg-white shadow-sm text-pace-purple" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Custom
                        </button>
                    </div>

                    {filters.rangeType === 'monthly' ? (
                        <div className="flex w-full sm:w-auto items-center justify-between bg-card-bg border border-pace-border rounded-xl p-1 shadow-sm">
                            <button 
                                onClick={() => changeMonth(-1)}
                                className="p-2 hover:bg-pace-bg-subtle rounded-lg text-gray-400 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="px-4 py-1 flex-1 text-center text-[10px] font-bold text-pace-purple uppercase tracking-wider min-w-[120px]">
                                {currentMonthLabel}
                            </div>
                            <button 
                                onClick={() => changeMonth(1)}
                                className="p-2 hover:bg-pace-bg-subtle rounded-lg text-gray-400 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input 
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                                className="bg-card-bg border border-pace-border rounded-xl px-3 py-2 text-[10px] font-bold text-pace-purple outline-none w-full sm:w-auto"
                            />
                            <span className="text-gray-400 text-xs">to</span>
                            <input 
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                                className="bg-card-bg border border-pace-border rounded-xl px-3 py-2 text-[10px] font-bold text-pace-purple outline-none w-full sm:w-auto"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {isLoading ? (
                    [...Array(3)].map((_, i) => <Skeleton key={i} className={cn("h-32 rounded-2xl", i === 2 && "col-span-2 md:col-span-1")} />)
                ) : (
                    summaryMetrics.map((metric, i) => (
                        <div key={i} className={cn("bg-card-bg border border-pace-border rounded-2xl p-4 md:p-6 hover:shadow-md transition-all", i === 2 && "col-span-2 md:col-span-1")}>
                            <div className="flex items-start justify-between mb-3 md:mb-4">
                                <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-colors", metric.bg, metric.color)}>
                                    <metric.icon size={20} className="md:w-6 md:h-6" />
                                </div>
                                <span className={cn("text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-full", metric.bg, metric.color)}>
                                    {metric.trend}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{metric.label}</h3>
                                <p className="text-lg md:text-2xl font-bold text-pace-purple tracking-tight">{metric.value}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 bg-card-bg border border-pace-border rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-pace-purple uppercase tracking-tight">Income vs Expenses</h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Daily comparison for {currentMonthLabel}</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        {isLoading ? (
                            <Skeleton className="h-full w-full rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="99%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }}
                                        tickFormatter={(value) => `KSH ${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="income" 
                                        name="Income"
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorIncome)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="expenses" 
                                        name="Expenses"
                                        stroke="#ef4444" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorExpense)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-pace-purple uppercase tracking-tight">Expense Breakdown</h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Distribution across categories</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                            <PieIcon size={20} />
                        </div>
                    </div>
                    <div className="h-[250px] w-full relative">
                        {isLoading ? (
                            <Skeleton className="h-full w-full rounded-2xl" />
                        ) : expenseBreakdown.length > 0 ? (
                            <ResponsiveContainer width="99%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expenseBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                No expense data
                            </div>
                        )}
                    </div>
                    <div className="mt-8 space-y-3">
                        {expenseBreakdown.map((item, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-tight">{item.name}</span>
                                </div>
                                <span className="text-[11px] font-bold text-gray-900">KSH {item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Bar Chart - Daily Net Profit/Loss */}
            <div className="bg-card-bg border border-pace-border rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-sm font-bold text-pace-purple uppercase tracking-tight">Net Profit/Loss Trend</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Daily profit/loss for {currentMonthLabel}</p>
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    {isLoading ? (
                        <Skeleton className="h-full w-full rounded-xl" />
                    ) : (
                        <ResponsiveContainer width="99%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} />
                                <Bar dataKey="profit" radius={[4, 4, 4, 4]}>
                                    {trendData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    )
}
