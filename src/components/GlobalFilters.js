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
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto font-figtree">
            {/* Router Filter */}
            {showRouterFilter && (
                <div className="relative w-full sm:w-auto">
                    <button
                        onClick={() => { setIsRouterOpen(!isRouterOpen); setIsDateOpen(false); }}
                        className="flex items-center justify-between gap-3 px-4 py-2 bg-card-bg border border-pace-border rounded-xl hover:border-pace-purple/30 transition-all w-full sm:w-44 text-left group"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Router size={15} className="text-admin-dim group-hover:text-pace-purple transition-colors shrink-0" />
                            <span className="text-xs font-medium text-admin-value truncate">{selectedRouter || 'Select Router'}</span>
                        </div>
                        <ChevronDown size={14} className={cn("text-admin-dim transition-transform duration-300", isRouterOpen && "rotate-180")} />
                    </button>

                    {isRouterOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsRouterOpen(false)} />
                            <div className="absolute top-full left-0 mt-2 w-full sm:w-52 bg-card-bg border border-pace-border rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in duration-200 max-h-[300px] overflow-y-auto">
                                {routers.map((router) => (
                                    <button
                                        key={router}
                                        onClick={() => {
                                            setSelectedRouter(router);
                                            setIsRouterOpen(false);
                                            onFilterChange?.({ router, dateRange: selectedDateRange });
                                        }}
                                        className="flex items-center justify-between w-full px-4 py-2 text-xs font-medium hover:bg-pace-bg-subtle transition-colors text-admin-value"
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
                        className="flex items-center justify-between gap-3 px-4 py-2 bg-card-bg border border-pace-border rounded-xl hover:border-pace-purple/30 transition-all w-full sm:w-48 text-left group"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <CalendarIcon size={15} className="text-admin-dim group-hover:text-pace-purple transition-colors shrink-0" />
                            <span className="text-xs font-medium text-admin-value truncate">{selectedDateRange}</span>
                        </div>
                        <ChevronDown size={14} className={cn("text-admin-dim transition-transform duration-300", isDateOpen && "rotate-180")} />
                    </button>

                    {isDateOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsDateOpen(false)} />
                            <div className="absolute top-full right-0 mt-2 w-full sm:w-64 bg-card-bg border border-pace-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                {dateView === 'presets' ? (
                                    <div className="py-2">
                                        <div className="px-4 py-1.5 border-b border-pace-border mb-1">
                                            <span className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">Select Period</span>
                                        </div>
                                        {dateRanges.map((range) => (
                                            <button
                                                key={range}
                                                onClick={() => {
                                                    setSelectedDateRange(range);
                                                    setIsDateOpen(false);
                                                    onFilterChange?.({ router: selectedRouter, dateRange: range });
                                                }}
                                                className="flex items-center justify-between w-full px-4 py-2 text-xs font-medium hover:bg-pace-bg-subtle transition-colors text-admin-value"
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
                                                onClick={() => setDateView('calendar')}
                                                className="w-full py-2 bg-pace-bg-subtle hover:bg-pace-purple/10 text-pace-purple rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                                            >
                                                Custom Range
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in slide-in-from-right duration-300">
                                        <div className="px-4 py-3 border-b border-pace-border flex items-center justify-between bg-pace-bg-subtle">
                                            <button
                                                onClick={() => setDateView('presets')}
                                                className="p-1 hover:bg-pace-bg-subtle rounded-md text-admin-dim hover:text-admin-value transition-all"
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
                                        <div className="p-3 border-t border-pace-border bg-pace-bg-subtle/50">
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
