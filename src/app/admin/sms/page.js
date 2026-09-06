"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Search, MessageSquare, Send, Calendar, Layers, Smartphone, AlertCircle, RefreshCw, Eye, ShieldCheck, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Skeleton } from '@/components/Skeleton'
import { smsService } from '@/services/admin/sms'
import { ispService } from '@/services/admin/isps'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminSmsLogsPage() {
  const [smsLogs, setSmsLogs] = useState([])
  const [ispsList, setIspsList] = useState([])
  const [suggestionsList, setSuggestionsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all')
  const [ispFilter, setIspFilter] = useState('all')

  // Modal states
  const [isSendOpen, setIsSendOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form fields
  const [target, setTarget] = useState('all') // all (broadcast to active ISPs), specific
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [targetIspId, setTargetIspId] = useState('')
  const [ispSearchQuery, setIspSearchQuery] = useState('')

  // Fetch SMS logs from API
  const loadSMSLogs = async () => {
    setIsLoading(true)
    try {
      const res = await smsService.getSMSLogs()
      if (res && res.status === 'success') {
        setSmsLogs(res.data || [])
      } else {
        toast.error(res?.message || 'Failed to retrieve SMS logs')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error fetching SMS logs')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch ISPs suggestions and full listing
  const loadISPs = async () => {
    try {
      const res = await ispService.getISPs(1, 200)
      if (res && res.status === 'success') {
        setIspsList(res.data.isps || [])
      }

      // Fetch specific suggestion objects (id, name, phone)
      const suggRes = await ispService.getISPSuggestions()
      if (suggRes && suggRes.status === 'success') {
        setSuggestionsList(suggRes.data || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadSMSLogs()
    loadISPs()
  }, [])

  const handleIspSearchChange = (e) => {
    const val = e.target.value
    setIspSearchQuery(val)
    
    // Check if the typed value matches one of the ISP suggestions exactly
    const matched = suggestionsList.find(s => s.name.toLowerCase() === val.toLowerCase())
    if (matched) {
      setPhone(matched.phone || '')
      setTargetIspId(matched.id.toString())
    }
  }

  const handleReload = () => {
    loadSMSLogs()
  }

  // Filters logic
  const filteredLogs = useMemo(() => {
    return smsLogs.filter((log) => {
      const matchesSearch = 
        log.phone.includes(search) ||
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.id.toString().includes(search)
      
      const matchesStatus = statusFilter === 'all' ? true : log.status.toLowerCase() === statusFilter.toLowerCase()
      const matchesIsp = ispFilter === 'all' ? true : log.isp_name.toLowerCase() === ispFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesIsp
    })
  }, [smsLogs, search, statusFilter, ispFilter])

  // Statistics calculation
  const stats = useMemo(() => {
    const total = smsLogs.length
    const success = smsLogs.filter(s => s.status.toLowerCase() === 'success').length
    const failed = smsLogs.filter(s => s.status.toLowerCase() === 'failed').length
    const pending = smsLogs.filter(s => s.status.toLowerCase() === 'pending').length

    return { total, success, failed, pending }
  }, [smsLogs])

  const openViewModal = (log) => {
    setSelectedLog(log)
    setIsViewOpen(true)
  }

  const openSendModal = () => {
    setTarget('all')
    setPhone('')
    setMessage('')
    setTargetIspId('')
    setIspSearchQuery('')
    setIsSendOpen(true)
  }

  // Send SMS broadcast
  const handleSendSubmit = async () => {
    if (!message.trim()) {
      toast.error('SMS message content is required.')
      return
    }

    if (target === 'specific' && !phone.trim()) {
      toast.error('Please specify the recipient phone number.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        message: message.trim(),
        target: target
      }

      if (target === 'specific') {
        payload.phone = phone.trim()
        if (targetIspId) {
          payload.isp_id = parseInt(targetIspId, 10)
        }
      }

      const res = await smsService.sendSMS(payload)
      if (res && res.status === 'success') {
        toast.success(`SMS broadcast dispatched successfully to ${res.data?.sent_count || 1} recipient(s).`)
        setIsSendOpen(false)
        loadSMSLogs()
      } else {
        toast.error(res?.message || 'Failed to dispatch SMS broadcast')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error executing SMS broadcast')
    } finally {
      setIsSaving(false)
    }
  }

  const cards = [
    { 
      label: 'Total Sent', 
      value: stats.total, 
      icon: MessageSquare, 
      color: 'text-pace-purple', 
      bg: 'bg-pace-purple/10',
      accent: 'bg-gradient-to-b from-pace-purple to-indigo-500'
    },
    { 
      label: 'Delivered', 
      value: stats.success, 
      icon: CheckCircle, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      accent: 'bg-gradient-to-b from-emerald-400 to-teal-500'
    },
    { 
      label: 'Failed Delivery', 
      value: stats.failed, 
      icon: AlertCircle, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10',
      accent: 'bg-gradient-to-b from-rose-500 to-red-600'
    },
    { 
      label: 'Pending Queue', 
      value: stats.pending, 
      icon: RefreshCw, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      accent: 'bg-gradient-to-b from-amber-400 to-orange-500'
    }
  ]

  const getStatusBadgeVariant = (s) => {
    switch (s.toLowerCase()) {
      case 'success': return 'success'
      case 'failed': return 'error'
      case 'pending': return 'warning'
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
          <h1 className="text-xl font-medium text-admin-value tracking-tight">SMS Dispatch Center</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Audit outgoing SMS notifications, alerts, and system broadcasts.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 w-full sm:flex-1">
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="p-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 shrink-0"
              title="Refresh Logs"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
            
            <div className="relative flex-1 sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search phone, message logs..."
                className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>

          <button
            onClick={openSendModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-[0.98] w-full sm:w-auto shrink-0"
          >
            <Send size={16} /> Compose SMS
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && smsLogs.length === 0 ? (
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
                <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={card.label}>
                  {card.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300">
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

      {/* Filtering Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-admin-dim">Delivery Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-card-bg text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
          >
            <option value="all">All Logs</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-admin-dim">ISP Operator Linkage</label>
          <select
            value={ispFilter}
            onChange={(e) => setIspFilter(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-card-bg text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
          >
            <option value="all">All Operator Scopes</option>
            {ispsList.map(isp => (
              <option key={isp.id} value={isp.name}>{isp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Database Table Card */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[900px]">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-semibold text-admin-dim text-xs">
                <th className="px-6 py-4">Log ID</th>
                <th className="px-6 py-4">Recipient Phone</th>
                <th className="px-6 py-4">ISP Operator</th>
                <th className="px-6 py-4">Message Particulars</th>
                <th className="px-6 py-4">Delivery Status</th>
                <th className="px-6 py-4">Date Dispatched</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-10 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-60 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-12 bg-pace-bg-subtle rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-pace-bg-subtle rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-admin-dim text-xs font-medium">
                    No matching SMS dispatch logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((logItem) => (
                  <tr key={logItem.id} className="hover:bg-pace-bg-subtle/30 transition-all duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-pace-purple text-xs">
                      #{logItem.id}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-admin-value">
                      {logItem.phone}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {logItem.isp_name}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-admin-value max-w-sm truncate" title={logItem.message}>
                      {logItem.message}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(logItem.status)} className="text-[9px] font-bold border-none px-2 py-0.5 uppercase tracking-wider">
                        {logItem.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {formatDate(logItem.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openViewModal(logItem)}
                        className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-admin-value transition-all"
                        title="View Log Details"
                      >
                        <Eye size={14} />
                      </button>
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
        title={`SMS Log Details: #${selectedLog?.id}`}
        description="Parameters for the outgoing system SMS message log."
        maxWidth="max-w-md"
      >
        {selectedLog && (
          <div className="space-y-4 font-figtree">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Recipient Phone', value: selectedLog.phone },
                { label: 'ISP Scope Name', value: selectedLog.isp_name },
                { label: 'SMS Content Message', value: selectedLog.message },
                { label: 'Delivery Status Code', value: selectedLog.status.toUpperCase() },
                { label: 'Date Logged', value: formatDate(selectedLog.created_at) }
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                  <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">{item.label}</p>
                  <p className="text-xs font-bold text-admin-value leading-relaxed whitespace-pre-wrap">{item.value}</p>
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

      {/* COMPOSE SMS MODAL */}
      <Modal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        title="Compose SMS Broadcast"
        description="Dispatch SMS alerts or system notifications to ISP operator recipients."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-figtree">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Target Audience</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
            >
              <option value="all">Broadcast to All Active ISPs</option>
              <option value="specific">Custom Specific Recipient</option>
            </select>
          </div>

          {target === 'specific' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Search ISP / Recipient Suggestion</label>
                <input
                  list="sms-compose-isp-sugg"
                  value={ispSearchQuery}
                  onChange={handleIspSearchChange}
                  placeholder="Type to search active ISP operator..."
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                />
                <datalist id="sms-compose-isp-sugg">
                  {suggestionsList.map(item => (
                    <option key={item.id} value={item.name}>
                      {item.phone ? `Phone: ${item.phone}` : ''}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 254711223344"
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Link to ISP Owner</label>
                  <select
                    value={targetIspId}
                    onChange={(e) => setTargetIspId(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple cursor-pointer transition-all"
                  >
                    <option value="">Admin / None</option>
                    {ispsList.map(isp => (
                      <option key={isp.id} value={isp.id}>{isp.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">SMS Message Content</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your broadcast alert here..."
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-medium text-admin-value leading-relaxed outline-none focus:border-pace-purple resize-none transition-all"
            />
          </div>

          <button
            onClick={handleSendSubmit}
            disabled={isSaving}
            className="w-full bg-pace-purple text-white py-2.5 rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all disabled:opacity-50 mt-2"
          >
            {isSaving ? "Dispatching..." : "Send Message"}
          </button>
        </div>
      </Modal>

    </div>
  )
}
