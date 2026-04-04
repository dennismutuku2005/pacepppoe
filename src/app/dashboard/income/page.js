"use client"

import React, { useState, useEffect } from 'react'
import { Wallet, Calendar, TrendingUp, TrendingDown, DollarSign, Download, Clock, BarChart3, Layers, LineChart, PieChart as PieIcon, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/Skeleton'
import { GlobalFilters } from '@/components/GlobalFilters'
import { incomeService } from '@/services/income'

export default function IncomePage() {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [incomeData, setIncomeData] = useState(null);
    const [filters, setFilters] = useState({ router: 'All Routers', dateRange: 'This Month' });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const parseDates = (range) => {
        const now = new Date();
        const fmt = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        if (range === 'Today') return { startDate: fmt(now), endDate: fmt(now) };
        if (range === 'Yesterday') {
            const y = new Date(now); y.setDate(y.getDate() - 1);
            return { startDate: fmt(y), endDate: fmt(y) };
        }
        if (range === 'This Week') {
            const w = new Date(now); w.setDate(w.getDate() - 6); // Last 7 days, or could be monday
            return { startDate: fmt(w), endDate: fmt(now) };
        }
        if (range === 'This Month') {
            return { startDate: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), endDate: fmt(now) };
        }
        if (range.includes(' - ')) {
            const [p1, p2] = range.split(' - ');
            return {
                startDate: fmt(new Date(`${p1} ${now.getFullYear()}`)),
                endDate: fmt(new Date(`${p2} ${now.getFullYear()}`))
            };
        }

        const singleDate = new Date(range);
        if (!isNaN(singleDate.getTime())) {
            return { startDate: fmt(singleDate), endDate: fmt(singleDate) };
        }

        // Default to last 30 days if 'All Time' or unknown (for charts context)
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return { startDate: fmt(d), endDate: fmt(now) };
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const dates = parseDates(filters.dateRange);
            const data = await incomeService.getIncomeData({
                router: filters.router,
                ...dates
            });

            if (data && data.status === 'success') {
                setIncomeData(data);
            }
        } catch (error) {
            console.error("Income fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isMounted) fetchData();
    }, [filters, isMounted]);

    // Data Transformation for Charts
    const revenuePerformance = incomeData?.charts?.revenue_trend?.map(item => ({
        day: item.day,
        amount: item.amount,
        entries: item.entries,
        avgPerUser: item.entries > 0 ? Math.round(item.amount / item.entries) : 0
    })) || [];

    const categoryData = incomeData?.charts?.plan_distribution || [];

    // Metrics Preparation
    const getTrendIcon = (trend) => trend >= 0 ? TrendingUp : TrendingDown;
    const getTrendColor = (trend) => trend >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";

    const metrics = incomeData ? [
        {
            label: "Today",
            value: `KSH ${(incomeData.metrics.today.value).toLocaleString()}`,
            trend: `${incomeData.metrics.today.trend > 0 ? '+' : ''}${incomeData.metrics.today.trend}%`,
            trendUp: incomeData.metrics.today.trend >= 0,
            icon: Wallet,
            color: "text-pace-purple",
            bg: "bg-pace-purple/10"
        },
        {
            label: "This Week",
            value: `KSH ${(incomeData.metrics.week.value).toLocaleString()}`,
            trend: `${incomeData.metrics.week.trend > 0 ? '+' : ''}${incomeData.metrics.week.trend}%`,
            trendUp: incomeData.metrics.week.trend >= 0,
            icon: Calendar,
            color: "text-blue-600",
            bg: "bg-blue-500/10"
        },
        {
            label: "This Month",
            value: `KSH ${(incomeData.metrics.month.value).toLocaleString()}`,
            trend: `${incomeData.metrics.month.trend > 0 ? '+' : ''}${incomeData.metrics.month.trend}%`,
            trendUp: incomeData.metrics.month.trend >= 0,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-500/10"
        },
        {
            label: "Last Month",
            value: `KSH ${(incomeData.metrics.last_month.value).toLocaleString()}`,
            trend: "0%",
            trendUp: true,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-500/10"
        },
        {
            label: "This Year",
            value: `KSH ${(incomeData.metrics.year.value).toLocaleString()}`,
            trend: `${incomeData.metrics.year.trend > 0 ? '+' : ''}${incomeData.metrics.year.trend}%`,
            trendUp: incomeData.metrics.year.trend >= 0,
            icon: DollarSign,
            color: "text-teal-600",
            bg: "bg-teal-500/10"
        },
        {
            label: "Last Year",
            value: `KSH ${(incomeData.metrics.last_year.value).toLocaleString()}`,
            trend: "0%",
            trendUp: true,
            icon: TrendingDown,
            color: "text-gray-600",
            bg: "bg-pace-bg-subtle"
        },
        {
            label: "Average Daily",
            value: `KSH ${(Math.round(incomeData.metrics.avg_daily || 0)).toLocaleString()}`,
            trend: "Last 30 Days",
            trendUp: true,
            icon: BarChart3,
            color: "text-indigo-600",
            bg: "bg-indigo-500/10"
        },
        {
            label: "Average Weekly",
            value: `KSH ${(Math.round(incomeData.metrics.avg_weekly || 0)).toLocaleString()}`,
            trend: "Last 12 Weeks",
            trendUp: true,
            icon: Layers,
            color: "text-pink-600",
            bg: "bg-pink-500/10"
        },
        {
            label: "Average Monthly",
            value: `KSH ${(Math.round(incomeData.metrics.avg_monthly || 0)).toLocaleString()}`,
            trend: "Last 6 Months",
            trendUp: true,
            icon: LineChart,
            color: "text-violet-600",
            bg: "bg-violet-500/10"
        },
    ] : [];

    return (
        <div className="space-y-8 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-pace-purple uppercase tracking-tight">Revenue Analytics</h1>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5 tracking-widest uppercase">Financial Performance &amp; Insights</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <GlobalFilters
                        defaultDateRange="This Month"
                        showDateFilter={false}
                        onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f }))}
                    />
                    <button className="px-6 py-2.5 bg-pace-purple text-white rounded-xl hover:bg-[#3d1a75] transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-pace-purple/20 flex items-center gap-2">
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>



            {/* Metric Cards Grid */}
            {isLoading && !incomeData ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {metrics.map((metric, i) => (
                        <div key={i} className="group bg-card-bg border border-pace-border rounded-xl p-3 sm:p-5 hover:border-pace-border transition-all">
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                                <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors", metric.bg, metric.color)}>
                                    <metric.icon size={16} className="sm:w-5 sm:h-5" />
                                </div>
                                <span className={cn("text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1",
                                    metric.trendUp
                                        ? "bg-pace-green-light text-pace-green"
                                        : "bg-pace-red-light text-pace-red"
                                )}>
                                    {metric.trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {metric.trend}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-pace-purple uppercase tracking-tight">{metric.label}</h3>
                                <p className="text-lg sm:text-2xl font-medium text-pace-purple tracking-tight mt-0.5 sm:mt-1">{metric.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Weekly Area Graph */}
            <div className="bg-card-bg border border-pace-border rounded-xl p-6 overflow-hidden">
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-pace-purple uppercase tracking-tight">Income Trend</h3>
                    <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest">Daily revenue trend for selected period</p>
                </div>

                <div className="overflow-x-auto w-full pb-2">
                    <div className="h-[350px] min-w-[600px]">
                        {isMounted && !isLoading ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenuePerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }}
                                        interval="preserveStartEnd"
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }}
                                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                        cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                                        formatter={(value) => [`KSH ${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#7c3aed"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorIncome)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-pace-bg-subtle rounded-lg">
                                <span className="text-gray-400 text-sm font-medium animate-pulse">Loading Chart...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Plan Distribution Donut Chart */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-sm font-medium text-pace-purple uppercase tracking-tight">Plan Distribution</h3>
                            <p className="text-[10px] font-medium text-gray-400 mt-0.5 uppercase tracking-widest">Revenue by plan type</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                            <PieIcon size={20} />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:h-[320px]">
                        <div className="w-full h-[300px] sm:h-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                                    <Pie
                                        data={categoryData}
                                        innerRadius="55%"
                                        outerRadius="75%"
                                        paddingAngle={5}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || '#7c3aed'} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2.5 w-full sm:max-w-[170px] pb-4 sm:pb-0 h-full overflow-y-auto max-h-[300px]">
                            {categoryData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-default">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-tight group-hover:text-gray-900 transition-colors">{item.name}</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ticket Value Bar Chart */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-sm font-medium text-pace-purple uppercase tracking-tight">Ticket Value</h3>
                            <p className="text-[10px] font-medium text-gray-400 mt-0.5 uppercase tracking-widest">Avg revenue per transaction</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenuePerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`KSH ${value}`, 'Avg Value']}
                                />
                                <Bar dataKey="avgPerUser" radius={[6, 6, 6, 6]} barSize={24} fill="#3b82f6">
                                    {revenuePerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === revenuePerformance.length - 1 ? '#3b82f6' : '#bfdbfe'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
