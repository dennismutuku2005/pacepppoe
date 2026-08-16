"use client"

import React, { useState, useMemo } from 'react'
import { Plus, Search, MessageSquare, Send, Calendar, Layers, Smartphone, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Initial Mock SMS logs scoped by ISP
const INITIAL_SMS_LOGS = [
  {
    id: 1,
    ispId: 2, // Pace Networks
    ispName: 'Pace Networks Ltd',
    phone: '254711223344',
    message: 'Your Bronze Plan 5M PPPoE service is active. Exp: 2026-09-06. Thank you for choosing Pace Networks!',
    status: 'success',
    date: '2026-08-09 08:31'
  },
  {
    id: 2,
    ispId: 3, // Eastlink
    ispName: 'Eastlink Communications',
    phone: '254722334455',
    message: 'Reminder: Your Eastlink 10M PPPoE subscription expires in 2 days. Clear outstanding KSH 2500 balance.',
    status: 'success',
    date: '2026-08-09 07:00'
  },
  {
    id: 3,
    ispId: 4, // Rift Valley Fiber
    ispName: 'Rift Valley Fiber',
    phone: '254733445566',
    message: 'Alert: Your Rift Valley connection is suspended due to KSH 12500 outstanding dues.',
    status: 'failed',
    date: '2026-08-08 17:46'
  },
  {
    id: 4,
    ispId: 2, // Pace Networks
    ispName: 'Pace Networks Ltd',
    phone: '254744556677',
    message: 'Quick OTP: Your security verification code for edit profile is 849202. Valid for 5 min.',
    status: 'success',
    date: '2026-08-09 15:10'
  },
  {
    id: 5,
    ispId: 3, // Eastlink
    ispName: 'Eastlink Communications',
    phone: '254722334455',
    message: 'System Alert: Network node West Ridge Station is back online. Connection restored.',
    status: 'pending',
    date: '2026-08-09 16:20'
  }
]

const MOCK_ISPS = [
  { id: 2, name: 'Pace Networks Ltd' },
  { id: 3, name: 'Eastlink Communications' },
  { id: 4, name: 'Rift Valley Fiber' }
]

export default function AdminSmsLogsPage() {
  const [smsLogs, setSmsLogs] = useState(INITIAL_SMS_LOGS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ispFilter, setIspFilter] = useState('all')

  // Modal
  const [isOpen, setIsOpen] = useState(false)

  // Form fields
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [ispId, setIspId] = useState(2)

  // Filters calculation
  const filteredLogs = useMemo(() => {
    return smsLogs.filter((log) => {
      const matchesSearch = 
        log.phone.includes(search) ||
        log.message.toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' ? true : log.status === statusFilter
      const matchesIsp = ispFilter === 'all' ? true : log.ispId === Number(ispFilter)

      return matchesSearch && matchesStatus && matchesIsp
    })
  }, [smsLogs, search, statusFilter, ispFilter])

  // Statistics calculation
  const stats = useMemo(() => {
    const total = smsLogs.length
    const success = smsLogs.filter(s => s.status === 'success').length
    const failed = smsLogs.filter(s => s.status === 'failed').length
    const pending = smsLogs.filter(s => s.status === 'pending').length

    return { total, success, failed, pending }
  }, [smsLogs])

  // Handle Send SMS submit
  const handleSendSms = (e) => {
    e.preventDefault()
    if (!phone || !message) {
      toast.error('Recipient phone and message content are required.')
      return
    }

    const selectedIsp = MOCK_ISPS.find(isp => isp.id === Number(ispId)) || { name: 'Independent / System' }

    // Format phone to standard E.164 if typed locally
    let formattedPhone = phone
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    }

    const newSms = {
      id: Date.now(),
      ispId: Number(ispId),
      ispName: selectedIsp.name,
      phone: formattedPhone,
      message,
      status: 'success', // Mock automatically success
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }

    setSmsLogs([newSms, ...smsLogs])
    toast.success(`Message sent successfully.`, {
      description: `Dispatched text to ${formattedPhone} via ${selectedIsp.name} gateway.`
    })
    setIsOpen(false)
    setPhone('')
    setMessage('')
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">ISP SMS Notification Logs</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Dispatch history, OTP codes, and payment reminders triggered by virtual ISPs.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all cursor-pointer"
        >
          <Send size={14} /> Send Outbound SMS
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phone, message text..."
            className="w-full pl-9 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value outline-none focus:border-pace-purple"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success / Delivered</option>
            <option value="pending">Pending Dispatch</option>
            <option value="failed">Failed Delivery</option>
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
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Total Dispatched</span>
            <div className="p-2 rounded-xl bg-pace-purple/10 text-pace-purple"><MessageSquare size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">{stats.total}</div>
          <p className="text-[10px] text-gray-400 mt-2">Combined outbound messages</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Delivered</span>
            <div className="p-2 rounded-xl bg-green-500/10 text-green-600"><Smartphone size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">{stats.success}</div>
          <p className="text-[10px] text-gray-400 mt-2">Successfully delivered to handset</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Failed Delivery</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600"><AlertCircle size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value text-rose-600">{stats.failed}</div>
          <p className="text-[10px] text-gray-400 mt-2">Bounced or provider network errors</p>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Queue Pending</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600"><Calendar size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-admin-value">{stats.pending}</div>
          <p className="text-[10px] text-gray-400 mt-2">Awaiting network carrier handshake</p>
        </div>
      </div>

      {/* SMS Logs Table */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-3.5">Recipient Phone</th>
                <th className="px-6 py-3.5">Message Content</th>
                <th className="px-6 py-3.5">Sending ISP</th>
                <th className="px-6 py-3.5">Delivery Status</th>
                <th className="px-6 py-3.5">Dispatch Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-admin-dim text-xs">
                    No SMS logs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-pace-bg-subtle/40 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Smartphone size={12} className="text-admin-dim" />
                        <span className="text-xs font-semibold text-admin-value font-mono">+{log.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-admin-value whitespace-pre-wrap max-w-lg leading-relaxed">{log.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Layers size={12} className="text-admin-dim" />
                        <span className="text-xs font-semibold text-admin-value">{log.ispName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={log.status === 'success' ? 'success' : log.status === 'pending' ? 'warning' : 'error'} 
                        className="text-[9px] font-bold uppercase"
                      >
                        {log.status === 'success' ? 'Delivered' : log.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-admin-dim font-mono">{log.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISPATCH OUTBOUND SMS MODAL */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Send Outbound SMS"
        description="Verify carrier gateway connection and dispatch quick custom SMS text."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSendSms} className="space-y-4 text-left font-figtree">
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Recipient Mobile *</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0711223344 or 254711223344"
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Message Content *</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message text here..."
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
            />
            <p className="text-[9px] text-gray-400 mt-1 pl-1">
              Length: {message.length} characters ({Math.ceil(message.length / 160)} SMS units)
            </p>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Billing ISP Gateway *</label>
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
              className="flex-1 px-4 py-2.5 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send size={12} /> Dispatch SMS
            </button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
