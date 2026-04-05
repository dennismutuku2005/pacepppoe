"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Send, MessageSquare, Search, Trash2, CheckCircle2, Clock, Smartphone, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mockDashboardData, mockCustomers } from '@/services/mockData'
import Swal from 'sweetalert2'

function SMSContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [logs, setLogs] = useState([])
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setLogs(mockDashboardData.smsLogs)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleSendSMS = () => {
        Swal.fire({
            title: 'Send Custom SMS',
            html: `
                <div class="space-y-4 text-left">
                    <div>
                        <label class="text-[10px] font-bold uppercase text-gray-400">Recipient</label>
                        <select id="sms-recipient" class="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm">
                            ${mockCustomers.map(c => `<option value="${c.phone}">${c.name} (${c.phone})</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold uppercase text-gray-400">Message</label>
                        <textarea id="sms-message" class="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm h-24" placeholder="Type your message..."></textarea>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#4B1D8F',
            confirmButtonText: 'Send Now',
            preConfirm: () => {
                const recipient = document.getElementById('sms-recipient').value
                const message = document.getElementById('sms-message').value
                if (!message) {
                    Swal.showValidationMessage('Message cannot be empty')
                }
                return { recipient, message }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                setIsSending(true)
                setTimeout(() => {
                    const newLog = {
                        id: Date.now(),
                        recipient: result.value.recipient,
                        message: result.value.message,
                        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
                        status: 'Delivered'
                    }
                    setLogs(prev => [newLog, ...prev])
                    setIsSending(false)
                    Swal.fire('Sent!', 'Message delivered successfully.', 'success')
                }, 1500)
            }
        })
    }

    const filteredLogs = logs.filter(l => 
        l.recipient.includes(searchTerm) || 
        l.message.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-lg font-bold text-pace-purple dark:text-pace-purple-light flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pace-purple/10 flex items-center justify-center">
                            <MessageSquare size={20} className="text-pace-purple" />
                        </div>
                        Communications Hub
                    </h1>
                    <p className="text-[10px] font-bold text-admin-dim mt-1 tracking-widest uppercase">Manage automated alerts and custom client messages</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="px-5 py-2.5 bg-pace-purple/5 border border-pace-purple/10 rounded-xl text-center shadow-sm">
                        <p className="text-sm font-bold text-pace-purple leading-none">{mockDashboardData.stats.smsBalance}</p>
                        <p className="text-[8px] font-bold text-admin-dim uppercase tracking-widest mt-1">SMS Balance</p>
                    </div>
                    <button 
                        onClick={handleSendSMS}
                        disabled={isSending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-xs font-bold uppercase tracking-widest shadow-xl shadow-pace-purple/20 active:scale-95 disabled:opacity-50"
                    >
                        {isSending ? <Clock size={14} className="animate-spin" /> : <Plus size={14} />} 
                        Send SMS
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search logs by phone or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-card-bg border border-pace-border rounded-2xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap text-[12px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle border-b border-pace-border font-bold text-admin-dim uppercase tracking-widest text-[9px]">
                                <th className="px-6 py-5">Recipient</th>
                                <th className="px-6 py-5">Message Content</th>
                                <th className="px-6 py-5">Dispatch Time</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-right">Options</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-96" /></td>
                                        <td className="px-6 py-5"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-5 text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
                                        <td className="px-6 py-5 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Send size={32} className="opacity-20 translate-x-2 -translate-y-2" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">No dispatch history found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-pace-bg-subtle/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                                    <Smartphone size={14} />
                                                </div>
                                                <span className="font-bold text-admin-value tracking-tight">{log.recipient}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-[11px] font-medium text-admin-dim max-w-sm overflow-hidden text-ellipsis whitespace-normal line-clamp-2 leading-relaxed">
                                                {log.message}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-admin-dim text-[10px] uppercase tracking-wide">
                                            <div className="flex items-center gap-2">
                                                <Clock size={10} />
                                                {log.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full text-[9px] font-bold uppercase border border-green-500/10 shadow-sm">
                                                <CheckCircle2 size={10} />
                                                {log.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function SMSPage() {
    return (
        <Suspense fallback={<div>Loading Messenger...</div>}>
            <SMSContent />
        </Suspense>
    )
}
