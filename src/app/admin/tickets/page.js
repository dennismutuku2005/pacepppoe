"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Trash2, LifeBuoy, CheckCircle, Tag, Calendar, Layers, AlertTriangle, RefreshCw, Eye, Edit, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Skeleton } from '@/components/Skeleton'
import { ticketService } from '@/services/admin/tickets'
import { ispService } from '@/services/admin/isps'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [ispsList, setIspsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Filter states
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ispFilter, setIspFilter] = useState('all')

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit fields
  const [editStatus, setEditStatus] = useState('Open')
  const [editPriority, setEditPriority] = useState('Medium')

  // Load tickets from API
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
      console.error(err)
      toast.error('Network error fetching support tickets')
    } finally {
      setIsLoading(false)
    }
  }

  // Load ISPs for filter dropdown
  const loadISPs = async () => {
    try {
      const res = await ispService.getISPs(1, 200)
      if (res && res.status === 'success') {
        setIspsList(res.data.isps || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadTickets()
    loadISPs()
  }, [])

  const handleReload = () => {
    loadTickets()
  }

  // Filters logic
  const filteredTickets = useMemo(() => {
    return tickets.filter((tk) => {
      const matchesSearch = 
        tk.customer.toLowerCase().includes(search.toLowerCase()) ||
        tk.subject.toLowerCase().includes(search.toLowerCase()) ||
        tk.id.toString().includes(search)
      
      const matchesPriority = priorityFilter === 'all' ? true : tk.priority.toLowerCase() === priorityFilter.toLowerCase()
      const matchesStatus = statusFilter === 'all' ? true : tk.status.toLowerCase() === statusFilter.toLowerCase()
      const matchesIsp = ispFilter === 'all' ? true : tk.isp_name.toLowerCase() === ispFilter.toLowerCase()

      return matchesSearch && matchesPriority && matchesStatus && matchesIsp
    })
  }, [tickets, search, priorityFilter, statusFilter, ispFilter])

  // Aggregate stats calculations
  const stats = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter(t => t.status.toLowerCase() === 'open').length
    const resolved = tickets.filter(t => t.status.toLowerCase() === 'resolved').length
    const critical = tickets.filter(t => t.priority.toLowerCase() === 'high' && t.status.toLowerCase() === 'open').length

    return { total, open, resolved, critical }
  }, [tickets])

  const openViewModal = (ticket) => {
    setSelectedTicket(ticket)
    setIsViewOpen(true)
  }

  const openEditModal = (ticket) => {
    setSelectedTicket(ticket)
    setEditStatus(ticket.status)
    setEditPriority(ticket.priority)
    setIsEditOpen(true)
  }

  const openDeleteModal = (ticket) => {
    setSelectedTicket(ticket)
    setIsDeleteOpen(true)
  }

  // PATCH ticket status/priority
  const handleEditSubmit = async () => {
    setIsSaving(true)
    try {
      const res = await ticketService.updateTicket(selectedTicket.id, {
        status: editStatus,
        priority: editPriority
      })
      if (res && res.status === 'success') {
        toast.success(`Ticket #${selectedTicket.id} updated successfully.`)
        setIsEditOpen(false)
        loadTickets()
      } else {
        toast.error(res?.message || 'Failed to update ticket parameters')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error updating ticket')
    } finally {
      setIsSaving(false)
    }
  }

  // DELETE ticket
  const handleDeleteSubmit = async () => {
    setIsSaving(true)
    try {
      const res = await ticketService.deleteTicket(selectedTicket.id)
      if (res && res.status === 'success') {
        toast.success(`Ticket #${selectedTicket.id} deleted successfully.`)
        setIsDeleteOpen(false)
        loadTickets()
      } else {
        toast.error(res?.message || 'Failed to delete ticket')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error deleting ticket')
    } finally {
      setIsSaving(false)
    }
  }

  const cards = [
    { 
      label: 'Total Tickets', 
      value: stats.total, 
      icon: LifeBuoy, 
      color: 'text-pace-purple', 
      bg: 'bg-pace-purple/10',
      accent: 'bg-gradient-to-b from-pace-purple to-indigo-500'
    },
    { 
      label: 'Open Issues', 
      value: stats.open, 
      icon: AlertTriangle, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      accent: 'bg-gradient-to-b from-amber-400 to-orange-500'
    },
    { 
      label: 'Resolved Issues', 
      value: stats.resolved, 
      icon: CheckCircle, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      accent: 'bg-gradient-to-b from-emerald-400 to-teal-500'
    },
    { 
      label: 'Critical / Open', 
      value: stats.critical, 
      icon: Tag, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10',
      accent: 'bg-gradient-to-b from-rose-500 to-red-600'
    }
  ]

  // Formats priority badge variant
  const getPriorityBadgeVariant = (p) => {
    switch (p.toLowerCase()) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'secondary'
    }
  }

  // Formats status badge variant
  const getStatusBadgeVariant = (s) => {
    switch (s.toLowerCase()) {
      case 'open': return 'warning'
      case 'resolved': return 'success'
      case 'closed': return 'secondary'
      default: return 'secondary'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">Support Tickets Console</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Audit customer complaints, technical issues, and operator queries.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 w-full sm:flex-1">
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="p-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 shrink-0"
              title="Refresh Tickets"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
            
            <div className="relative flex-1 sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket subject, client name..."
                className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && tickets.length === 0 ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-card-bg border border-pace-border rounded-xl p-3.5 sm:p-5 shadow-sm min-w-0">
              <div className="flex items-center justify-between gap-2 mb-4">
                <Skeleton className="h-4 w-16 sm:w-24" />
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shrink-0" />
              </div>
              <Skeleton className="h-7 w-12 sm:w-16" />
            </div>
          ))
        ) : cards.map((card) => (
          <div key={card.label} className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
            {/* Left accent color strip */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", card.accent)} />
            
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={card.label}>
                  {card.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 tracking-tight group-hover:scale-[1.02] transition-transform origin-left duration-300">
                  {card.value}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-pace-border/5 bg-pace-bg-subtle shrink-0">
                <card.icon className={cn(card.color, "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5")} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtering Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Priority Grade</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-card-bg text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Issue Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-card-bg text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open Issues</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">ISP Operator</label>
          <select
            value={ispFilter}
            onChange={(e) => setIspFilter(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-card-bg text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
          >
            <option value="all">All ISPs</option>
            {ispsList.map(isp => (
              <option key={isp.id} value={isp.name}>{isp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Database Table View */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">ISP Operator</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-48 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-12 bg-pace-bg-subtle rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-12 bg-pace-bg-subtle rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-pace-bg-subtle rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-admin-dim text-xs font-medium">
                    No support tickets found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticketItem) => (
                  <tr key={ticketItem.id} className="hover:bg-pace-bg-subtle/30 transition-all duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-pace-purple text-xs">
                      #{ticketItem.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-admin-value text-xs">
                      {ticketItem.customer}
                    </td>
                    <td className="px-6 py-4 font-semibold text-admin-value text-xs max-w-xs truncate" title={ticketItem.subject}>
                      {ticketItem.subject}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {ticketItem.isp_name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getPriorityBadgeVariant(ticketItem.priority)} className="text-[9px] font-bold border-none px-2 py-0.5 uppercase tracking-wider">
                        {ticketItem.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(ticketItem.status)} className="text-[9px] font-bold border-none px-2 py-0.5 uppercase tracking-wider">
                        {ticketItem.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {formatDate(ticketItem.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openViewModal(ticketItem)}
                          className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-admin-value transition-all"
                          title="View Ticket Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(ticketItem)}
                          className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-pace-purple transition-all"
                          title="Edit Status"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(ticketItem)}
                          className="p-1.5 text-admin-dim hover:bg-red-500/10 rounded-lg hover:text-red-500 transition-all"
                          title="Delete Ticket"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Support Ticket #${selectedTicket?.id}`}
        description="Comprehensive customer complaint parameters."
        maxWidth="max-w-md"
      >
        {selectedTicket && (
          <div className="space-y-4 font-figtree">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Customer Name', value: selectedTicket.customer },
                { label: 'ISP Operator Mapping', value: selectedTicket.isp_name },
                { label: 'Subject Description', value: selectedTicket.subject },
                { label: 'Priority Urgency', value: selectedTicket.priority },
                { label: 'Current Status', value: selectedTicket.status },
                { label: 'Date Opened', value: formatDate(selectedTicket.created_at) },
                { label: 'Last Updated', value: formatDate(selectedTicket.updated_at) }
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                  <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">{item.label}</p>
                  <p className="text-xs font-bold text-admin-value leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsViewOpen(false)}
              className="w-full bg-pace-purple text-white py-2.5 rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all mt-2"
            >
              Dismiss Info
            </button>
          </div>
        )}
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Modify Ticket Parameter: #${selectedTicket?.id}`}
        description="Override support ticket status and priority levels."
        maxWidth="max-w-md"
      >
        {selectedTicket && (
          <div className="space-y-4 font-figtree">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Customer Name</label>
              <div className="mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value/70">
                {selectedTicket.customer}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Subject Particulars</label>
              <div className="mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value/70 leading-relaxed whitespace-pre-wrap">
                {selectedTicket.subject}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Priority Status</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Current Issue Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
              >
                <option value="Open">Open Issue</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <button
              onClick={handleEditSubmit}
              disabled={isSaving}
              className="w-full bg-pace-purple text-white py-2.5 rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all disabled:opacity-50 mt-2"
            >
              {isSaving ? "Saving..." : "Save Parameters"}
            </button>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Support Ticket"
        description="Are you absolutely sure you want to delete this ticket permanently? This cannot be undone."
        type="danger"
        confirmText="Confirm Delete"
        onConfirm={handleDeleteSubmit}
        loading={isSaving}
      />

    </div>
  )
}
