"use client"

import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronDown, Router, Check, Clock, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CalendarUI } from './Calendar'
import { dashboardService } from '@/services/dashboard'

export function GlobalFilters({ onFilterChange, defaultDateRange = 'Today', showDateFilter = true, showRouterFilter = true }) {
    const [selectedRouter, setSelectedRouter] = useState('All Routers')
    const [selectedDateRange, setSelectedDateRange] = useState(defaultDateRange)
    const [isRouterOpen, setIsRouterOpen] = useState(false)
    const [isDateOpen, setIsDateOpen] = useState(false)
    const [dateView, setDateView] = useState('presets') // 'presets' | 'calendar'

    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [routers, setRouters] = useState(['All Routers'])
    const dateRanges = ['All Time', 'Today', 'Yesterday', 'This Week', 'This Month']

    useEffect(() => {
        const loadRouters = async () => {
            try {
                const list = await dashboardService.getRouters();
                if (list && Array.isArray(list)) {
                    // Ensure 'All Routers' is always at the top if not already present
                    const formattedList = list.includes('All Routers') ? list : ['All Routers', ...list];
                    setRouters(formattedList);
                }
            } catch (error) {
                console.error("Failed to load routers:", error);
            }
        };
        loadRouters();
    }, [])

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Router Filter */}
            {showRouterFilter && (
                <div className="relative w-full sm:w-auto">
                    <button
                        onClick={() => { setIsRouterOpen(!isRouterOpen); setIsDateOpen(false); }}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-card-bg border border-pace-border rounded-xl hover:border-pace-purple/30 transition-all w-full sm:w-48 text-left group"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Router size={16} className="text-admin-dim group-hover:text-pace-purple transition-colors shrink-0" />
                            <span className="text-xs font-bold text-admin-value truncate">{selectedRouter || 'Select Router'}</span>
                        </div>
                        <ChevronDown size={14} className={cn("text-admin-dim transition-transform duration-300", isRouterOpen && "rotate-180")} />
                    </button>

                    {isRouterOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsRouterOpen(false)} />
                            <div className="absolute top-full left-0 mt-2 w-full sm:w-56 bg-card-bg border border-pace-border rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200 max-h-[300px] overflow-y-auto transition-colors duration-300">
                                {routers.map((router) => (
                                    <button
                                        key={router}
                                        onClick={() => {
                                            setSelectedRouter(router);
                                            setIsRouterOpen(false);
                                            onFilterChange?.({ router, dateRange: selectedDateRange });
                                        }}
                                        className="flex items-center justify-between w-full px-4 py-2 text-xs font-bold hover:bg-pace-bg-subtle transition-colors text-admin-value"
                                    >
                                        {router}
                                        {selectedRouter === router && <Check size={14} className="text-pace-purple" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Date Range Filter */}
            {showDateFilter && (
                <div className="relative w-full sm:w-auto">
                    <button
                        onClick={() => {
                            setIsDateOpen(!isDateOpen);
                            setIsRouterOpen(false);
                            setDateView('presets');
                        }}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-card-bg border border-pace-border rounded-xl hover:border-pace-purple/30 transition-all w-full sm:w-52 text-left group"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <CalendarIcon size={16} className="text-admin-dim group-hover:text-pace-purple transition-colors shrink-0" />
                            <span className="text-xs font-bold text-admin-value truncate">{selectedDateRange}</span>
                        </div>
                        <ChevronDown size={14} className={cn("text-admin-dim transition-transform duration-300", isDateOpen && "rotate-180")} />
                    </button>

                    {isDateOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsDateOpen(false)} />
                            <div className="absolute top-full right-0 mt-2 w-full sm:w-72 bg-card-bg border border-pace-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors duration-300">
                                {dateView === 'presets' ? (
                                    <div className="py-2">
                                        <div className="px-4 py-2 border-b border-pace-border mb-1">
                                            <span className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Select Period</span>
                                        </div>
                                        {dateRanges.map((range) => (
                                            <button
                                                key={range}
                                                onClick={() => {
                                                    setSelectedDateRange(range);
                                                    setIsDateOpen(false);
                                                    onFilterChange?.({ router: selectedRouter, dateRange: range });
                                                }}
                                                className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold hover:bg-pace-bg-subtle transition-colors text-admin-value"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className={cn("text-admin-dim", selectedDateRange === range && "text-pace-purple")} />
                                                    {range}
                                                </div>
                                                {selectedDateRange === range && <Check size={14} className="text-pace-purple" />}
                                            </button>
                                        ))}

                                        <div className="px-2 mt-2 pt-2 border-t border-pace-border flex flex-col gap-1">
                                            <button
                                                onClick={() => setDateView('single')}
                                                className="w-full py-2 bg-pace-bg-subtle hover:bg-pace-purple/10 text-pace-purple rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                                            >
                                                Select Specific Date
                                            </button>
                                            <button
                                                onClick={() => setDateView('month')}
                                                className="w-full py-2 bg-pace-bg-subtle hover:bg-pace-purple/10 text-pace-purple rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                                            >
                                                Select Specific Month
                                            </button>
                                            <button
                                                onClick={() => setDateView('calendar')}
                                                className="w-full py-2 bg-pace-bg-subtle hover:bg-pace-purple/10 text-pace-purple rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                                            >
                                                Custom Range
                                            </button>
                                        </div>
                                    </div>
                                ) : dateView === 'single' ? (
                                    <div className="animate-in slide-in-from-right duration-300">
                                        <div className="px-4 py-3 border-b border-pace-border flex items-center justify-between bg-pace-bg-subtle">
                                            <button
                                                onClick={() => setDateView('presets')}
                                                className="p-1 hover:bg-pace-bg-subtle rounded-md text-admin-dim hover:text-admin-value transition-all border border-transparent hover:border-pace-border"
                                            >
                                                <ArrowLeft size={16} />
                                            </button>
                                            <span className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Select Date</span>
                                            <div className="w-6" />
                                        </div>
                                        <CalendarUI
                                            selectedDate={startDate}
                                            onDateSelect={(date) => {
                                                setStartDate(date);
                                                setEndDate(date); // Same start/end for single date

                                                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                                setSelectedDateRange(formattedDate);
                                                setIsDateOpen(false);
                                                onFilterChange?.({ router: selectedRouter, dateRange: formattedDate });
                                            }}
                                        />
                                        <div className="p-3 border-t border-pace-border bg-pace-bg-subtle">
                                            <div className="flex items-center justify-center text-[10px] text-admin-dim font-bold uppercase tracking-tighter">
                                                <span>{startDate ? startDate.toLocaleDateString() : 'Select a date'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : dateView === 'month' ? (
                                    <div className="animate-in slide-in-from-right duration-300">
                                        <div className="px-4 py-3 border-b border-pace-border flex items-center justify-between bg-pace-bg-subtle">
                                            <button
                                                onClick={() => setDateView('presets')}
                                                className="p-1 hover:bg-pace-bg-subtle rounded-md text-admin-dim hover:text-admin-value transition-all border border-transparent hover:border-pace-border"
                                            >
                                                <ArrowLeft size={16} />
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        const newDate = new Date(startDate || new Date());
                                                        newDate.setFullYear(newDate.getFullYear() - 1);
                                                        setStartDate(newDate);
                                                    }}
                                                    className="p-1 hover:bg-pace-bg-subtle rounded-lg text-admin-dim hover:text-admin-value"
                                                >
                                                    <ChevronDown size={14} className="rotate-90" />
                                                </button>
                                                <span className="text-[10px] font-bold text-admin-value uppercase tracking-widest">
                                                    {(startDate || new Date()).getFullYear()}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        const newDate = new Date(startDate || new Date());
                                                        newDate.setFullYear(newDate.getFullYear() + 1);
                                                        setStartDate(newDate);
                                                    }}
                                                    className="p-1 hover:bg-pace-bg-subtle rounded-lg text-admin-dim hover:text-admin-value"
                                                >
                                                    <ChevronDown size={14} className="-rotate-90" />
                                                </button>
                                            </div>
                                            <div className="w-6" />
                                        </div>
                                        <div className="p-4 grid grid-cols-3 gap-2">
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                                                const currentYear = (startDate || new Date()).getFullYear();
                                                const isSelected = selectedDateRange === `${month} ${currentYear}`; // Approximation

                                                return (
                                                    <button
                                                        key={month}
                                                        onClick={() => {
                                                            const start = new Date(currentYear, index, 1);
                                                            const end = new Date(currentYear, index + 1, 0); // Last day of month

                                                            setStartDate(start);
                                                            setEndDate(end);

                                                            const rangeStr = `${month} ${currentYear}`; // e.g., "Jan 2026"
                                                            setSelectedDateRange(rangeStr);
                                                            setIsDateOpen(false);
                                                            onFilterChange?.({ router: selectedRouter, dateRange: rangeStr });
                                                        }}
                                                        className={cn(
                                                            "py-2.5 rounded-lg text-xs font-bold transition-all border",
                                                            isSelected
                                                                ? "bg-pace-purple text-white border-pace-purple shadow-sm"
                                                                : "bg-card-bg text-admin-value border-pace-border hover:border-pace-purple/30 hover:bg-pace-purple/5 hover:text-pace-purple"
                                                        )}
                                                    >
                                                        {month}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in slide-in-from-right duration-300">
                                        <div className="px-4 py-3 border-b border-pace-border flex items-center justify-between bg-pace-bg-subtle">
                                            <button
                                                onClick={() => setDateView('presets')}
                                                className="p-1 hover:bg-pace-bg-subtle rounded-md text-admin-dim hover:text-admin-value transition-all border border-transparent hover:border-pace-border"
                                            >
                                                <ArrowLeft size={16} />
                                            </button>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custom Range</span>
                                            <div className="w-6" />
                                        </div>
                                        <CalendarUI
                                            range
                                            selectedRange={{ start: startDate, end: endDate }}
                                            onDateSelect={(date) => {
                                                if (!startDate || (startDate && endDate)) {
                                                    setStartDate(date);
                                                    setEndDate(null);
                                                } else if (date < startDate) {
                                                    setStartDate(date);
                                                    setEndDate(null);
                                                } else {
                                                    setEndDate(date);
                                                    const rangeStr = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                                                    setSelectedDateRange(rangeStr);
                                                    setIsDateOpen(false);
                                                    onFilterChange?.({ router: selectedRouter, dateRange: rangeStr });
                                                }
                                            }}
                                        />
                                        <div className="p-3 border-t border-gray-50 bg-gray-50/30">
                                            <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                                <span>{startDate ? startDate.toLocaleDateString() : 'Start'}</span>
                                                <span>→</span>
                                                <span>{endDate ? endDate.toLocaleDateString() : 'End'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
