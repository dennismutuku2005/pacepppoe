"use client"

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { 
    Search, Plus, RefreshCw, Eye, Edit2, Trash2, 
    AlertCircle, CheckCircle2, Clock, LifeBuoy, 
    MessageSquare, User, Tag, HelpCircle, ShieldAlert, CheckCircle, ChevronDown
} from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { ticketService } from '@/services/isp/tickets'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function TicketsContent() {
    const [tickets, setTickets] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [priorityFilter, setPriorityFilter] = useState('ALL')

    // Modals
    const [isCreateOrEditOpen, setIsCreateOrEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [editingTicket, setEditingTicket] = useState(null)

    // Form state
    const [formData, setFormData] = useState({
        customer: '',
        subject: '',
        description: '',
        priority: 'Medium',
        status: 'Open'
    })

    const loadTickets = async () => {
        setIsLoading(true)
        try {
            const res = await ticketService.getTickets()
            if (res && res.status === 'success') {
                setTickets(res.data || [])
            } else {
                toast.error(res?.message || 'Failed to retrieve support tickets')
            }
        } catch (err) {
            console.error("Error loading tickets:", err)
            toast.error('Network error loading support tickets')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadTickets()
    }, [])

    // Handle deep link from subscriber page: ?customer=John
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const customer = params.get('customer')
            if (customer) {
                openCreateModal(customer)
            }
        }
    }, [])

    // Open Create / Edit modal
    const openCreateModal = (customerName = '') => {
        setEditingTicket(null)
        setFormData({
            customer: customerName,
            subject: '',
            description: '',
            priority: 'Medium',
            status: 'Open'
        })
        setIsCreateOrEditOpen(true)
    }

    const openEditModal = (ticket) => {
        setEditingTicket(ticket)
        setFormData({
            customer: ticket.customer || '',
            subject: ticket.subject || '',
            description: ticket.description || '',
            priority: ticket.priority || 'Medium',
            status: ticket.status || 'Open'
        })
        setIsCreateOrEditOpen(true)
    }

    const openViewModal = (ticket) => {
        setSelectedTicket(ticket)
        setIsViewOpen(true)
    }

    const openDeleteModal = (ticket) => {
        setSelectedTicket(ticket)
        setIsDeleteOpen(true)
    }

    // Submit handler (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.customer.trim() || !formData.subject.trim()) {
            toast.error('Subscriber name and subject are required.')
            return
        }

        setIsSaving(true)
        try {
            const payload = {
                customer: formData.customer.trim(),
                subject: formData.subject.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
                status: formData.status
            }

            if (editingTicket) {
                const res = await ticketService.updateTicket(editingTicket.id, payload)
                if (res && res.status === 'success') {
                    toast.success(`Ticket #${editingTicket.id} updated successfully`)
                    setIsCreateOrEditOpen(false)
                    loadTickets()
                } else {
                    toast.error(res?.message || 'Failed to update ticket')
                }
            } else {
                const res = await ticketService.createTicket(payload)
                if (res && res.status === 'success') {
                    toast.success('Support incident logged successfully')
                    setIsCreateOrEditOpen(false)
                    loadTickets()
                } else {
                    toast.error(res?.message || 'Failed to create ticket')
                }
            }
        } catch (err) {
            console.error("Error saving ticket:", err)
            toast.error('Network error saving ticket')
        } finally {
            setIsSaving(false)
        }
    }

    // Delete handler
    const handleDelete = async () => {
        if (!selectedTicket) return
        setIsSaving(true)
        try {
            const res = await ticketService.deleteTicket(selectedTicket.id)
            if (res && res.status === 'success') {
                toast.success(`Ticket #${selectedTicket.id} removed from queue`)
                setIsDeleteOpen(false)
                loadTickets()
            } else {
                toast.error(res?.message || 'Failed to delete ticket')
            }
        } catch (err) {
            console.error("Error deleting ticket:", err)
            toast.error('Network error deleting ticket')
        } finally {
            setIsSaving(false)
        }
    }

    // Quick status toggle directly from view modal or table
    const handleQuickStatusChange = async (ticket, newStatus) => {
        try {
            const res = await ticketService.updateTicket(ticket.id, { status: newStatus })
            if (res && res.status === 'success') {
                toast.success(`Ticket #${ticket.id} marked as ${newStatus}`)
                if (selectedTicket && selectedTicket.id === ticket.id) {
                    setSelectedTicket(prev => ({ ...prev, status: newStatus }))
                }
                loadTickets()
            }
        } catch (err) {
            console.error("Error updating ticket status:", err)
            toast.error('Failed to change ticket status')
        }
    }

    // Filter tickets
    const filteredTickets = useMemo(() => {
        return tickets.filter((t) => {
            const customer = (t.customer || '').toLowerCase()
            const subject = (t.subject || '').toLowerCase()
            const desc = (t.description || '').toLowerCase()
            const id = (t.id || '').toString()
            const query = search.toLowerCase()

            const matchesSearch = customer.includes(query) || subject.includes(query) || desc.includes(query) || id.includes(query)
            const matchesStatus = statusFilter === 'ALL' || t.status?.toUpperCase() === statusFilter.toUpperCase()
            const matchesPriority = priorityFilter === 'ALL' || t.priority?.toUpperCase() === priorityFilter.toUpperCase()

            return matchesSearch && matchesStatus && matchesPriority
        })
    }, [tickets, search, statusFilter, priorityFilter])

    // Metric counters
    const metrics = useMemo(() => {
        const total = tickets.length
        const open = tickets.filter(t => t.status === 'Open').length
        const inProgress = tickets.filter(t => t.status === 'In Progress').length
        const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length
        return { total, open, inProgress, resolved }
    }, [tickets])

    const getPriorityBadgeVariant = (priority) => {
        const p = (priority || '').toUpperCase()
        if (p === 'HIGH') return 'error'
        if (p === 'MEDIUM') return 'warning'
        return 'info'
    }

    const getStatusBadgeVariant = (status) => {
        const s = (status || '').toUpperCase()
        if (s === 'OPEN') return 'warning'
        if (s === 'IN PROGRESS') return 'purple'
        if (s === 'RESOLVED') return 'success'
        return 'neutral'
    }

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
            
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Support Tickets & Incidents</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Incident tracking, subscriber troubleshooting, and resolution pipeline.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={loadTickets}
                        disabled={isLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 text-xs font-semibold cursor-pointer"
                        title="Reload Tickets"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        <span>Refresh Tickets</span>
                    </button>

                    <button
                        onClick={() => openCreateModal()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                        <Plus size={15} />
                        <span>Create Ticket</span>
                    </button>
                </div>
            </div>

            {/* Top Metrics Cards - Dashboard Theme */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Incidents",
                        value: metrics.total.toLocaleString(),
                        sub: "All logged tickets",
                        icon: LifeBuoy,
                        color: 'text-pace-purple',
                        bg: 'bg-pace-purple/5',
                        iconBorder: 'border-pace-purple/10 group-hover:border-pace-purple/30',
                        accent: 'bg-gradient-to-b from-pace-purple to-indigo-500',
                        filter: 'ALL'
                    },
                    {
                        label: "Open Tickets",
                        value: metrics.open.toLocaleString(),
                        sub: "Requires attention",
                        icon: AlertCircle,
                        color: 'text-amber-500',
                        bg: 'bg-amber-500/5',
                        iconBorder: 'border-amber-500/10 group-hover:border-amber-500/30',
                        accent: 'bg-gradient-to-b from-amber-400 to-orange-500',
                        filter: 'Open'
                    },
                    {
                        label: "In Progress",
                        value: metrics.inProgress.toLocaleString(),
                        sub: "Active troubleshooting",
                        icon: Clock,
                        color: 'text-blue-500',
                        bg: 'bg-blue-500/5',
                        iconBorder: 'border-blue-500/10 group-hover:border-blue-500/30',
                        accent: 'bg-gradient-to-b from-blue-400 to-cyan-500',
                        filter: 'In Progress'
                    },
                    {
                        label: "Resolved",
                        value: metrics.resolved.toLocaleString(),
                        sub: "Closed issues",
                        icon: CheckCircle2,
                        color: 'text-emerald-500',
                        bg: 'bg-emerald-500/5',
                        iconBorder: 'border-emerald-500/10 group-hover:border-emerald-500/30',
                        accent: 'bg-gradient-to-b from-emerald-400 to-teal-500',
                        filter: 'Resolved'
                    },
                ].map((metric, i) => {
                    const isActive = statusFilter.toUpperCase() === metric.filter.toUpperCase();
                    return (
                        <div
                            key={i}
                            onClick={() => setStatusFilter(metric.filter)}
                            className={cn(
                                "relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-300 min-w-0 cursor-pointer",
                                isActive 
                                    ? "border-pace-purple ring-1 ring-pace-purple/30 shadow-md" 
                                    : "border-pace-border hover:border-pace-purple/30 hover:shadow-md"
                            )}
                        >
                            {/* Left accent color strip */}
                            <div className={cn("absolute left-0 top-0 bottom-0 w-1", metric.accent)} />
                            
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={metric.label}>
                                        {metric.label}
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                                        {isLoading ? '...' : metric.value}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] text-admin-dim truncate">{metric.sub}</p>
                                    </div>
                                </div>
                                <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-105", metric.iconBorder, metric.bg)}>
                                    <metric.icon className={cn(metric.color, "w-4 h-4")} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search & Filters Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={15} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search ticket subject, subscriber, description..."
                        className="w-full pl-10 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-normal text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Status filter pills */}
                    {['ALL', 'Open', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer",
                                statusFilter.toUpperCase() === st.toUpperCase()
                                    ? "bg-pace-purple text-white shadow-sm"
                                    : "bg-pace-bg-subtle text-admin-dim hover:bg-pace-purple/10 hover:text-pace-purple border border-pace-border"
                            )}
                        >
                            {st}
                        </button>
                    ))}

                    {/* Priority Selector */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="bg-card-bg border border-pace-border rounded-xl px-3 py-1.5 text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple cursor-pointer"
                    >
                        <option value="ALL">All Priorities</option>
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                    </select>
                </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left whitespace-nowrap min-w-[950px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-semibold text-admin-dim uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-3.5">Ticket ID</th>
                                <th className="px-6 py-3.5">Incident Subject</th>
                                <th className="px-6 py-3.5">Subscriber</th>
                                <th className="px-6 py-3.5">Priority</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5">Logged At</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border/70">
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-pace-bg-subtle rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-48 bg-pace-bg-subtle rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-pace-bg-subtle rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-18 bg-pace-bg-subtle rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-pace-bg-subtle rounded" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-14 bg-pace-bg-subtle rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-pace-bg-subtle flex items-center justify-center text-admin-dim">
                                                <LifeBuoy size={24} />
                                            </div>
                                            <p className="text-sm font-medium text-admin-value">No support tickets found</p>
                                            <p className="text-xs text-admin-dim font-normal">Create a new ticket or adjust your filters above.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTickets.map((t) => (
                                    <tr 
                                        key={t.id} 
                                        className="hover:bg-pace-bg-subtle/40 transition-colors group cursor-pointer"
                                        onClick={() => openViewModal(t)}
                                    >
                                        {/* ID */}
                                        <td className="px-6 py-3.5 text-xs font-mono font-medium text-admin-dim">
                                            #{t.id}
                                        </td>

                                        {/* Subject */}
                                        <td className="px-6 py-3.5">
                                            <div className="max-w-[340px]">
                                                <p className="text-xs font-medium text-admin-value truncate" title={t.subject}>{t.subject}</p>
                                                {t.description && (
                                                    <p className="text-[11px] text-admin-dim font-normal truncate mt-0.5" title={t.description}>{t.description}</p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Subscriber */}
                                        <td className="px-6 py-3.5 text-xs font-medium text-admin-value">
                                            <span>{t.customer || 'General'}</span>
                                        </td>

                                        {/* Priority */}
                                        <td className="px-6 py-3.5">
                                            <Badge variant={getPriorityBadgeVariant(t.priority)} className="text-[10px] font-medium">
                                                {t.priority || 'Medium'}
                                            </Badge>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-3.5">
                                            <Badge variant={getStatusBadgeVariant(t.status)} className="text-[10px] font-medium">
                                                {t.status || 'Open'}
                                            </Badge>
                                        </td>

                                        {/* Timestamp */}
                                        <td className="px-6 py-3.5 text-xs font-normal text-admin-dim tabular-nums">
                                            {t.created_at ? new Date(t.created_at).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A'}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openViewModal(t)}
                                                    className="p-1.5 hover:bg-pace-purple/10 rounded-lg text-admin-dim hover:text-pace-purple transition-colors cursor-pointer"
                                                    title="Inspect Ticket"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(t)}
                                                    className="p-1.5 hover:bg-pace-purple/10 rounded-lg text-admin-dim hover:text-pace-purple transition-colors cursor-pointer"
                                                    title="Edit Ticket"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(t)}
                                                    className="p-1.5 hover:bg-rose-500/10 rounded-lg text-admin-dim hover:text-rose-600 transition-colors cursor-pointer"
                                                    title="Delete Ticket"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Bottom Total Footer */}
                <div className="px-6 py-4 border-t border-pace-border flex items-center justify-between bg-pace-bg-subtle/20 text-xs">
                    <span className="text-admin-dim font-normal">
                        Displaying <span className="font-semibold text-admin-value">{filteredTickets.length}</span> of <span className="font-semibold text-admin-value">{tickets.length}</span> total incident tickets
                    </span>
                </div>
            </div>

            {/* CREATE / EDIT MODAL */}
            <Modal
                isOpen={isCreateOrEditOpen}
                onClose={() => setIsCreateOrEditOpen(false)}
                title={editingTicket ? `Edit Ticket #${editingTicket.id}` : 'Log New Support Ticket'}
                description={editingTicket ? 'Update incident parameters, subscriber assignment, and status.' : 'Register a new support incident or subscriber issue.'}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4 font-figtree">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-admin-value uppercase tracking-wider">Subscriber / Customer Name *</label>
                        <div className="relative">
                            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" />
                            <input
                                type="text"
                                required
                                value={formData.customer}
                                onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                                placeholder="e.g. John Doe / 0712345678"
                                className="w-full pl-10 pr-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-normal text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-admin-value uppercase tracking-wider">Incident Subject *</label>
                        <div className="relative">
                            <MessageSquare size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" />
                            <input
                                type="text"
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                placeholder="e.g. PPPoE link down in Westlands sector"
                                className="w-full pl-10 pr-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-normal text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-admin-value uppercase tracking-wider">Priority Tier</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple"
                            >
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-admin-value uppercase tracking-wider">Incident Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple"
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-admin-value uppercase tracking-wider">Description & Notes</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Provide technical notes, troubleshooting steps, or subscriber comments..."
                            className="w-full p-3 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-normal text-admin-value focus:outline-none focus:border-pace-purple transition-all resize-none"
                        />
                    </div>

                    <div className="pt-3 border-t border-pace-border flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsCreateOrEditOpen(false)}
                            className="px-4 py-2 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-5 py-2 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                            {isSaving ? 'Saving...' : editingTicket ? 'Update Ticket' : 'Create Ticket'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* VIEW / INSPECT MODAL */}
            <Modal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title={`Ticket #${selectedTicket?.id || ''}`}
                description="Comprehensive ticket history and resolution management."
                maxWidth="max-w-lg"
            >
                {selectedTicket && (
                    <div className="space-y-4 font-figtree">
                        <div className="p-4 bg-pace-bg-subtle rounded-xl border border-pace-border space-y-3">
                            <div className="flex items-center justify-between">
                                <Badge variant={getStatusBadgeVariant(selectedTicket.status)}>
                                    {selectedTicket.status}
                                </Badge>
                                <Badge variant={getPriorityBadgeVariant(selectedTicket.priority)}>
                                    {selectedTicket.priority} Priority
                                </Badge>
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold text-admin-dim uppercase tracking-wider mb-1">Incident Subject</p>
                                <h3 className="text-sm font-bold text-admin-value">{selectedTicket.subject}</h3>
                            </div>

                            {selectedTicket.description && (
                                <div>
                                    <p className="text-[10px] font-semibold text-admin-dim uppercase tracking-wider mb-1">Description / Notes</p>
                                    <p className="text-xs font-normal text-admin-value leading-relaxed bg-card-bg p-3 rounded-lg border border-pace-border">
                                        {selectedTicket.description}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                                <div className="p-2.5 bg-card-bg rounded-lg border border-pace-border">
                                    <p className="text-[10px] text-admin-dim font-semibold uppercase tracking-wider mb-0.5">Subscriber</p>
                                    <p className="font-medium text-admin-value">{selectedTicket.customer || 'General'}</p>
                                </div>
                                <div className="p-2.5 bg-card-bg rounded-lg border border-pace-border">
                                    <p className="text-[10px] text-admin-dim font-semibold uppercase tracking-wider mb-0.5">Logged Date</p>
                                    <p className="font-medium text-admin-value">
                                        {selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleString('en-US') : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Status Changers */}
                            <div className="pt-2 border-t border-pace-border/70">
                                <p className="text-[10px] font-semibold text-admin-dim uppercase tracking-wider mb-2">Update Incident Status</p>
                                <div className="flex flex-wrap items-center gap-2">
                                    {['Open', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => handleQuickStatusChange(selectedTicket, st)}
                                            className={cn(
                                                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                                selectedTicket.status === st
                                                    ? "bg-pace-purple text-white font-bold"
                                                    : "bg-card-bg border border-pace-border text-admin-dim hover:text-admin-value hover:bg-pace-bg-subtle"
                                            )}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <button
                                onClick={() => {
                                    setIsViewOpen(false)
                                    openEditModal(selectedTicket)
                                }}
                                className="px-3.5 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-semibold text-admin-value hover:bg-pace-bg-subtle transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <Edit2 size={13} />
                                Edit Incident
                            </button>
                            <button
                                onClick={() => setIsViewOpen(false)}
                                className="px-4 py-2 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all cursor-pointer shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* DELETE CONFIRMATION MODAL */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Terminate Support Ticket"
                description={`Are you sure you want to delete incident ticket #${selectedTicket?.id} (${selectedTicket?.subject})? This action cannot be undone.`}
                type="danger"
                confirmText="Delete Incident"
                onConfirm={handleDelete}
            />

        </div>
    )
}

export default function TicketsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-pace-purple border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <TicketsContent />
        </Suspense>
    )
}
