"use client"

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CalendarUI({ selectedDate, onDateSelect, range = false, selectedRange = { start: null, end: null } }) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const totalDays = daysInMonth(year, month)
    const firstDay = firstDayOfMonth(year, month)

    const isSelected = (d) => {
        if (!selectedDate) return false
        return selectedDate.getDate() === d &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year
    }

    const isInRange = (d) => {
        if (!range || !selectedRange.start || !selectedRange.end) return false
        const date = new Date(year, month, d)
        return date >= selectedRange.start && date <= selectedRange.end
    }

    const isRangeStart = (d) => {
        if (!range || !selectedRange.start) return false
        return selectedRange.start.getDate() === d &&
            selectedRange.start.getMonth() === month &&
            selectedRange.start.getFullYear() === year
    }

    const isRangeEnd = (d) => {
        if (!range || !selectedRange.end) return false
        return selectedRange.end.getDate() === d &&
            selectedRange.end.getMonth() === month &&
            selectedRange.end.getFullYear() === year
    }

    return (
        <div className="p-4 bg-card-bg select-none font-figtree">
            <div className="flex items-center justify-between mb-4">
                <h6 className="text-xs font-bold text-admin-value uppercase tracking-widest">
                    {monthNames[month]} {year}
                </h6>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-pace-bg-subtle rounded-lg text-admin-dim hover:text-admin-value transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-pace-bg-subtle rounded-lg text-admin-dim hover:text-admin-value transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {days.map(day => (
                    <div key={day} className="text-[10px] font-bold text-admin-dim text-center uppercase py-1">
                        {day[0]}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: totalDays }).map((_, i) => {
                    const d = i + 1
                    const start = isRangeStart(d)
                    const end = isRangeEnd(d)
                    const mid = isInRange(d)

                    return (
                        <div
                            key={d}
                            onClick={() => onDateSelect(new Date(year, month, d))}
                            className={cn(
                                "h-8 flex items-center justify-center text-[11px] font-bold cursor-pointer rounded-lg transition-all relative z-10",
                                !isSelected(d) && !mid && "hover:bg-pace-bg-subtle text-admin-value",
                                isSelected(d) && "bg-pace-purple text-white shadow-md shadow-pace-purple/20",
                                mid && !start && !end && "bg-pace-purple/5 text-pace-purple rounded-none",
                                start && "bg-pace-purple text-white rounded-r-none rounded-l-lg",
                                end && "bg-pace-purple text-white rounded-l-none rounded-r-lg",
                                range && mid && "z-20"
                            )}
                        >
                            {d}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
