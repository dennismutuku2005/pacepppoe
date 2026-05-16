"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { LifeBuoy, Search, Filter, MessageSquare, Trash2, Edit2, Clock, User, AlertTriangle, CheckCircle2, Activity } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { TableRowSkeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'

function TicketsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [tickets, setTickets] = useState([])
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentTicket, setCurrentTicket] = useState(null)
    const [formData, setFormData] = useState({ 
        customer: '', subject: '', priority: 'Medium', status: 'Open', date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setTickets(mockDashboardData.tickets)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const customer = params.get('customer')
        if (customer) {
            handleOpenModal()
            setFormData(prev => ({ ...prev, customer }))
        }
    }, [])

    const handleOpenModal = (t = null) => {
        if (t) {
            setCurrentTicket(t)
            setFormData({ ...t })
        } else {
            setCurrentTicket(null)
            setFormData({ 
                customer: '', subject: '', priority: 'Medium', 
                status: 'Open', date: new Date().toISOString().split('T')[0]
            })
        }
        setIsModalOpen(true)
    }

    const handleSave = (e) => {
        e.preventDefault()
        if (!formData.customer || !formData.subject) {
            toast.error('Validation Failed', { description: 'Customer and subject are required.' })
            return
        }

        if (currentTicket) {
            setTickets(prev => prev.map(t => t.id === currentTicket.id ? { ...t, ...formData } : t))
            toast.success('Ticket Synchronized', { description: 'Support record has been updated.' })
        } else {
            const newTicket = { ...formData, id: Date.now(), date: new Date().toLocaleString() }
            setTickets(prev => [newTicket, ...prev])
            toast.success('Ticket Initialized', { description: 'New support request has been logged.' })
        }
        setIsModalOpen(false)
    }

    const handleDelete = (id) => {
        setTickets(prev => prev.filter(t => t.id !== id))
        toast.error('Ticket Terminated', { description: 'Support record removed from queue.' })
    }

    const filteredTickets = tickets.filter(t => 
        t.customer?.toLowerCase().includes(search.toLowerCase()) ||
        t.subject?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-semibold text-admin-value tracking-tight">Support Tickets</h1>
                    <p className="text-xs text-gray-500 mt-1">Incident tracking and resolution pipeline</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-xl shadow-pace-purple/20 active:scale-95"
                >
                    <MessageSquare size={14} /> Initialize Ticket
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search incident logs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all uppercase"
                    />
                </div>
            </div>

            {/* Ticket Matrix */}
            <div className="overflow-hidden bg-white dark:bg-card-bg border border-pace-border rounded-2xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap text-[12px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim tracking-widest text-[9px]">
                                <th className="px-6 py-4">Incident Subject</th>
                                <th className="px-6 py-4">Subscriber</th>
                                <th className="px-6 py-4">Priority Tier</th>
                                <th className="px-6 py-4">State</th>
                                <th className="px-6 py-4">Logged At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={6} rows={8} />
                            ) : filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim text-[10px] font-bold tracking-widest italic uppercase">Zero active incidents</td>
                                </tr>
                            ) : (
                                filteredTickets.map((t) => (
                                    <tr key={t.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group cursor-default">
                                        <td className="px-6 py-3">
                                            <span className="text-[13px] font-bold text-admin-value">{t.subject}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-[11px] font-bold text-admin-dim">{t.customer}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <Badge className={cn(
                                                "border-none px-2 py-0.5 text-[8px] font-black tracking-widest",
                                                t.priority === 'High' ? "bg-red-500/10 text-red-600" : t.priority === 'Medium' ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                                            )}>
                                                {t.priority}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3">
                                            <Badge className={cn(
                                                "border-none px-2 py-0.5 text-[8px] font-black tracking-widest",
                                                t.status === 'Open' ? "bg-red-500/10 text-red-600" : t.status === 'In Progress' ? "bg-amber-500/10 text-amber-600" : "bg-green-500/10 text-green-600"
                                            )}>
                                                {t.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <Clock size={11} className="text-admin-dim" />
                                                <span className="text-[10px] font-bold text-admin-value italic">{t.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button onClick={() => handleOpenModal(t)} className="p-1.5 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 rounded-lg transition-all"><Edit2 size={13} /></button>
                                                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-admin-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ticket Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentTicket ? 'Synchronize Ticket' : 'Initialize Support Incident'}
                description={currentTicket ? `Updating record for incident #${currentTicket.id}` : 'Create a new support request for subscriber tracking.'}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Subscriber Identity</label>
                        <input 
                            type="text" required
                            value={formData.customer}
                            onChange={(e) => setFormData({...formData, customer: e.target.value})}
                            placeholder="Customer Name"
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all uppercase"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Incident Subject</label>
                        <input 
                            type="text" required
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            placeholder="Brief description of issue"
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all uppercase"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Priority Tier</label>
                            <select 
                                value={formData.priority}
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                            >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Logic State</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                            >
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Resolved</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-5 py-2.5 border border-pace-border rounded-xl text-xs font-bold text-admin-dim tracking-widest hover:bg-pace-bg-subtle transition-all">Abort</button>
                        <button type="submit" className="flex-3 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-bold tracking-widest hover:opacity-90 shadow-xl shadow-pace-purple/20 transition-all active:scale-95">Commit Ticket</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function TicketsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse uppercase text-[10px] font-bold tracking-widest italic">Mapping Incidents...</div>}>
            <TicketsContent />
        </Suspense>
    )
}
