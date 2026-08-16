"use client"

import React, { useState, useMemo } from 'react'
import { Plus, Search, Trash2, LifeBuoy, CheckCircle, Tag, Calendar, Layers, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Initial Mock Support Tickets scoped by ISP
const INITIAL_TICKETS = [
  {
    id: 1,
    ispId: 2, // Pace Networks
    ispName: 'Pace Networks Ltd',
    customerName: 'John Doe',
    subject: 'Frequent connection drops during peak hours',
    priority: 'high',
    status: 'open',
    date: '2026-08-08 14:20'
  },
  {
    id: 2,
    ispId: 3, // Eastlink
    ispName: 'Eastlink Communications',
    customerName: 'Jane Smith',
    subject: 'Router replacement authorization required',
    priority: 'medium',
    status: 'resolved',
    date: '2026-08-07 10:15'
  },
  {
    id: 3,
    ispId: 2, // Pace Networks
    ispName: 'Pace Networks Ltd',
    customerName: 'Alice Wanjiku',
    subject: 'M-Pesa payment validation lag',
    priority: 'low',
    status: 'open',
    date: '2026-08-09 08:30'
  },
  {
    id: 4,
    ispId: 4, // Rift Valley Fiber
    ispName: 'Rift Valley Fiber',
    customerName: 'Robert Ngugi',
    subject: 'Fiber line cut near primary bypass',
    priority: 'high',
    status: 'open',
    date: '2026-08-09 11:00'
  }
]

const MOCK_ISPS = [
  { id: 2, name: 'Pace Networks Ltd' },
  { id: 3, name: 'Eastlink Communications' },
  { id: 4, name: 'Rift Valley Fiber' }
]

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ispFilter, setIspFilter] = useState('all')

  // Modals
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState(null)
  const [deletingTicket, setDeletingTicket] = useState(null)

  // Form Fields
  const [customerName, setCustomerName] = useState('')
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('open')
  const [ispId, setIspId] = useState(2)

  // Filtering
  const filteredTickets = useMemo(() => {
    return tickets.filter((tk) => {
      const matchesSearch = 
        tk.customerName.toLowerCase().includes(search.toLowerCase()) ||
        tk.subject.toLowerCase().includes(search.toLowerCase())
      
      const matchesPriority = priorityFilter === 'all' ? true : tk.priority === priorityFilter
      const matchesStatus = statusFilter === 'all' ? true : tk.status === statusFilter
      const matchesIsp = ispFilter === 'all' ? true : tk.ispId === Number(ispFilter)

      return matchesSearch && matchesPriority && matchesStatus && matchesIsp
    })
  }, [tickets, search, priorityFilter, statusFilter, ispFilter])

  // Statistics
  const stats = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter(t => t.status === 'open').length
    const resolved = tickets.filter(t => t.status === 'resolved').length
    const critical = tickets.filter(t => t.priority === 'high' && t.status === 'open').length

    return { total, open, resolved, critical }
  }, [tickets])

  // Open Add/Edit Modal
  const openModal = (ticket = null) => {
    if (ticket) {
      setEditingTicket(ticket)
      setCustomerName(ticket.customerName)
      setSubject(ticket.subject)
      setPriority(ticket.priority)
      setStatus(ticket.status)
      setIspId(ticket.ispId)
    } else {
      setEditingTicket(null)
      setCustomerName('')
      setSubject('')
      setPriority('medium')
      setStatus('open')
      setIspId(2)
    }
    setIsOpen(true)
  }

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customerName || !subject) {
      toast.error('All fields are required.')
      return
    }

    const selectedIsp = MOCK_ISPS.find(isp => isp.id === Number(ispId)) || { name: 'Independent / System' }

    if (!editingTicket) {
      // Add Ticket
      const newTk = {
        id: Date.now(),
        ispId: Number(ispId),
        ispName: selectedIsp.name,
        customerName,
        subject,
        priority,
        status,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }
      setTickets([newTk, ...tickets])
      toast.success(`Support ticket logged.`, {
        description: `Registered ticket for ${customerName} under ${selectedIsp.name}.`
      })
    } else {
      // Edit Ticket
      setTickets(tickets.map(tk => tk.id === editingTicket.id ? {
        ...tk,
        ispId: Number(ispId),
        ispName: selectedIsp.name,
        customerName,
        subject,
        priority,
        status
      } : tk))
      toast.success(`Ticket details updated.`)
    }
    setIsOpen(false)
  }

  // Quick Resolve Toggle
  const quickResolve = (ticket) => {
    const nextStatus = ticket.status === 'open' ? 'resolved' : 'open'
    setTickets(tickets.map(tk => tk.id === ticket.id ? { ...tk, status: nextStatus } : tk))
    toast.success(`Ticket status set to ${nextStatus.toUpperCase()}`)
  }

  // Delete
  const triggerDelete = (ticket) => {
    setDeletingTicket(ticket)
    setIsDeleteOpen(true)
  }

  const handleDeleteExecute = () => {
    setTickets(tickets.filter(t => t.id !== deletingTicket.id))
    toast.success(`Ticket record purged.`)
    setIsDeleteOpen(false)
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">ISP Support Tickets</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Consolidated helpdesk issues and tickets submitted by subscribers across partner ISP subnetworks.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all cursor-pointer"
        >
          <Plus size={16} /> File Support Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets, customers..."
            className="w-full pl-9 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value outline-none focus:border-pace-purple"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value outline-none focus:border-pace-purple"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open Issues</option>
            <option value="resolved">Resolved Issues</option>
            <option value="closed">Closed Issues</option>
          </select>

          <select
            value={ispFilter}
            onChange={(e) => setIspFilter(e.target.value)}
            className="px-3 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value outline-none focus:border-pace-purple"
          >
            <option value="all">All ISPs</option>
            {MOCK_ISPS.map(isp => (
              <option key={isp.id} value={isp.id}>{isp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Open Tickets</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600"><AlertTriangle size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">{stats.open}</div>
          <p className="text-[10px] text-gray-400 mt-2">Active queries awaiting review</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Resolved Cases</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600"><CheckCircle size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">{stats.resolved}</div>
          <p className="text-[10px] text-gray-400 mt-2">Closed subscriber incidents</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Escalated Critical</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600"><LifeBuoy size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value text-rose-600">{stats.critical}</div>
          <p className="text-[10px] text-gray-400 mt-2">High severity unresolved links</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Total File Records</span>
            <div className="p-2 rounded-xl bg-pace-purple/10 text-pace-purple"><LifeBuoy size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">{stats.total}</div>
          <p className="text-[10px] text-gray-400 mt-2">Incidents in database history</p>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-3.5">Ticket ID / Subscriber</th>
                <th className="px-6 py-3.5">Subject Issue</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Responsible ISP</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date Logged</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-admin-dim text-xs">
                    No tickets match the filtered criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((tk) => (
                  <tr key={tk.id} className="hover:bg-pace-bg-subtle/40 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-semibold text-admin-value">{tk.customerName}</p>
                        <p className="text-[10px] text-gray-400">ID: TKT-{tk.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-admin-value max-w-sm truncate" title={tk.subject}>{tk.subject}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={tk.priority === 'high' ? 'error' : tk.priority === 'medium' ? 'warning' : 'outline'} 
                        className="text-[9px] font-bold uppercase"
                      >
                        {tk.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Layers size={12} className="text-admin-dim" />
                        <span className="text-xs font-semibold text-admin-value">{tk.ispName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={tk.status === 'resolved' ? 'success' : tk.status === 'open' ? 'warning' : 'secondary'} 
                        className="text-[9px] font-bold uppercase"
                      >
                        {tk.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-admin-dim font-mono">{tk.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => quickResolve(tk)}
                          className={cn(
                            "p-2 rounded-xl border border-transparent hover:bg-pace-bg-subtle cursor-pointer",
                            tk.status === 'open' ? 'text-emerald-500 hover:text-emerald-600' : 'text-amber-500 hover:text-amber-600'
                          )}
                          title={tk.status === 'open' ? 'Mark Resolved' : 'Mark Open'}
                        >
                          {tk.status === 'open' ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                        </button>
                        <button
                          onClick={() => openModal(tk)}
                          className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-bg-subtle rounded-xl border border-transparent transition-all cursor-pointer"
                          title="Edit Ticket Details"
                        >
                          <LifeBuoy size={13} />
                        </button>
                        <button
                          onClick={() => triggerDelete(tk)}
                          className="p-2 text-admin-dim hover:text-rose-600 hover:bg-rose-50/50 rounded-xl border border-transparent transition-all cursor-pointer"
                          title="Delete Ticket"
                        >
                          <Trash2 size={13} />
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

      {/* CREATE/EDIT TICKET MODAL */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingTicket ? "Edit Incident Ticket" : "File Incident Ticket"}
        description={editingTicket ? `Edit helpdesk logs for TKT-${editingTicket.id}` : "Log a new support ticket submitted by a subscriber."}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left font-figtree">
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Subscriber Name *</label>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Issue Subject *</label>
            <textarea
              required
              rows={2}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Slow speed and latency spikes on Bronze package"
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Priority Severity *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority / Escalated</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Incident Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              >
                <option value="open">Open / Unresolved</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Responsible ISP *</label>
            <select
              value={ispId}
              onChange={(e) => setIspId(Number(e.target.value))}
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            >
              {MOCK_ISPS.map(isp => (
                <option key={isp.id} value={isp.id}>{isp.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              {editingTicket ? "Save Updates" : "File Ticket"}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Purge Ticket Records"
        description="Are you sure you want to delete this helpdesk ticket record? Deleted tickets are permanently archived."
        type="danger"
        confirmText="Confirm Delete"
        onConfirm={handleDeleteExecute}
      />

    </div>
  )
}
