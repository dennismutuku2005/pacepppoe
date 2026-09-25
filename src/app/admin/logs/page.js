"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { 
  FileText, Search, RefreshCw, Eye, Filter, ShieldCheck, 
  Terminal, Activity, Clock, ShieldAlert, CheckCircle2, 
  ArrowUp, Layers, User, Globe, AlertCircle, X
} from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Skeleton } from '@/components/Skeleton'
import { logService } from '@/services/admin/logs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const BATCH_SIZE = 40

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [todayLogs, setTodayLogs] = useState(0)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedAction, setSelectedAction] = useState('all')

  // Modal details
  const [selectedLog, setSelectedLog] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Scroll sentinel & scroll to top
  const observerTarget = useRef(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  // Track scroll position for "Back to top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Initial / Filter-driven fetch
  const fetchInitialLogs = useCallback(async () => {
    setIsLoadingInitial(true)
    try {
      const params = {}
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
      if (selectedRole !== 'all') params.role = selectedRole
      if (selectedAction !== 'all') params.action = selectedAction

      const res = await logService.getSystemLogs(BATCH_SIZE, 0, params)
      if (res && res.status === 'success') {
        setLogs(res.data || [])
        setTotalLogs(res.total || 0)
        setTodayLogs(res.today_total || 0)
        setHasMore(res.has_more ?? ((res.data?.length || 0) < (res.total || 0)))
      } else {
        toast.error(res?.message || 'Failed to retrieve audit logs')
      }
    } catch (err) {
      console.error("fetchInitialLogs error:", err)
      toast.error('Network error fetching audit logs')
    } finally {
      setIsLoadingInitial(false)
    }
  }, [debouncedSearch, selectedRole, selectedAction])

  useEffect(() => {
    fetchInitialLogs()
  }, [fetchInitialLogs])

  // Load next chunk for Infinite Scrolling
  const loadMoreLogs = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoadingInitial) return

    setIsLoadingMore(true)
    try {
      const currentOffset = logs.length
      const params = {}
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
      if (selectedRole !== 'all') params.role = selectedRole
      if (selectedAction !== 'all') params.action = selectedAction

      const res = await logService.getSystemLogs(BATCH_SIZE, currentOffset, params)
      if (res && res.status === 'success') {
        const newLogs = res.data || []
        setLogs(prev => {
          // Avoid duplicate keys by id
          const existingIds = new Set(prev.map(l => l.id))
          const filteredNew = newLogs.filter(l => !existingIds.has(l.id))
          return [...prev, ...filteredNew]
        })
        setTotalLogs(res.total || 0)
        setHasMore(res.has_more ?? ((currentOffset + newLogs.length) < (res.total || 0)))
      }
    } catch (err) {
      console.error("loadMoreLogs error:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, isLoadingInitial, logs.length, debouncedSearch, selectedRole, selectedAction])

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const target = observerTarget.current
    if (!target) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingInitial && !isLoadingMore) {
          loadMoreLogs()
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [loadMoreLogs, hasMore, isLoadingInitial, isLoadingMore])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openViewModal = (log) => {
    setSelectedLog(log)
    setIsViewOpen(true)
  }

  const getActionBadgeVariant = (action = '') => {
    const act = action.toUpperCase()
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('DROP') || act.includes('FAIL')) return 'error'
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('INSERT') || act.includes('SUCCESS') || act.includes('PAYMENT')) return 'success'
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MODIFY') || act.includes('CHANGE')) return 'warning'
    if (act.includes('LOGIN') || act.includes('AUTH') || act.includes('SECURITY')) return 'info'
    return 'default'
  }

  const getActorRoleColor = (role) => {
    if (!role) return 'default'
    switch (role.toLowerCase()) {
      case 'superadmin':
      case 'admin':
        return 'bg-purple-500/10 text-pace-purple border-purple-500/20'
      case 'isp':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    }
  }

  // Quick action options extracted dynamically or standard
  const roleOptions = [
    { id: 'all', label: 'All Roles' },
    { id: 'admin', label: 'Admins' },
    { id: 'isp', label: 'ISP Tenants' }
  ]

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-pace-purple/10 text-pace-purple">
              <Activity size={12} /> Live Audit Stream
            </span>
            <span className="text-[11px] text-admin-dim font-medium">Infinite Real-time Feed</span>
          </div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight mt-1">System Audit Logs</h1>
          <p className="text-xs font-medium text-gray-400 mt-0.5">
            Real-time continuous audit trail for security operations, administrative actions, and configuration changes.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={fetchInitialLogs}
            disabled={isLoadingInitial}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 text-xs font-semibold cursor-pointer"
            title="Refresh Logs Feed"
          >
            <RefreshCw size={14} className={isLoadingInitial ? "animate-spin" : ""} />
            <span>Refresh Feed</span>
          </button>
          
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, admin, IP, details..."
              className="w-full pl-10 pr-9 py-2.5 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all placeholder:text-admin-dim/60 shadow-xs"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-dim hover:text-admin-value p-0.5 rounded cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Highlights Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pace-purple to-indigo-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-admin-dim">Total Audit Records</p>
              <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1">{totalLogs.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pace-purple/10 flex items-center justify-center text-pace-purple">
              <FileText size={18} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-admin-dim">Today's Operations</p>
              <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1">{todayLogs.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Clock size={18} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-600" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-admin-dim">Loaded in Memory</p>
              <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1">{logs.length.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Layers size={18} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-admin-dim">Active Filter Scope</p>
              <p className="text-sm font-bold text-admin-value mt-1 truncate capitalize">
                {selectedRole === 'all' ? 'All Roles' : `${selectedRole} only`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Filter size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-semibold text-admin-dim flex items-center gap-1 shrink-0 mr-1">
            <Filter size={13} /> Filter:
          </span>
          {roleOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedRole(opt.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border",
                selectedRole === opt.id
                  ? "bg-pace-purple text-white border-pace-purple shadow-xs"
                  : "bg-card-bg text-admin-dim border-pace-border hover:border-pace-purple/50 hover:text-admin-value"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-medium text-admin-dim">
          Showing <span className="font-bold text-admin-value">{logs.length}</span> of <span className="font-bold text-admin-value">{totalLogs}</span> events
        </div>
      </div>

      {/* Main Continuous Database Feed Table */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
            <thead>
              <tr className="bg-pace-bg-subtle/60 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Operator / Actor</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Action Event</th>
                <th className="px-6 py-4">Description Payload</th>
                <th className="px-6 py-4">Terminal IP</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {isLoadingInitial && logs.length === 0 ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-10 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 bg-pace-bg-subtle rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-64 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-7 w-7 bg-pace-bg-subtle rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-admin-dim">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-pace-bg-subtle flex items-center justify-center text-admin-dim mb-3">
                        <FileText size={24} />
                      </div>
                      <p className="text-sm font-semibold text-admin-value">No system audit logs found</p>
                      <p className="text-xs text-admin-dim mt-1">
                        {debouncedSearch ? 'Try broadening your search criteria.' : 'Audit events will stream here as operations occur.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((logItem) => (
                  <tr 
                    key={logItem.id} 
                    className="hover:bg-pace-bg-subtle/40 transition-all duration-150 group cursor-pointer"
                    onClick={() => openViewModal(logItem)}
                  >
                    <td className="px-6 py-4 font-mono font-bold text-pace-purple text-xs">
                      #{logItem.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-admin-value text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-pace-purple/10 flex items-center justify-center text-[10px] font-bold text-pace-purple">
                          {(logItem.actor_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span>{logItem.actor_name || 'System / Automated'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold border px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                        getActorRoleColor(logItem.actor_role)
                      )}>
                        {logItem.actor_role || 'System'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getActionBadgeVariant(logItem.action)} className="text-[10px] font-mono font-bold px-2.5 py-0.5">
                        {logItem.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-admin-value max-w-md truncate" title={logItem.description}>
                      {logItem.description}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-admin-dim">
                      {logItem.ip_address || '127.0.0.1'}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {new Date(logItem.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openViewModal(logItem)}
                        className="p-1.5 text-admin-dim hover:bg-pace-purple/10 hover:text-pace-purple rounded-lg transition-all cursor-pointer"
                        title="View Detailed Payload"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sentinel Intersection Observer Target for Continuous Infinite Scroll */}
        <div ref={observerTarget} className="py-6 border-t border-pace-border bg-pace-bg-subtle/20 flex items-center justify-center">
          {isLoadingMore ? (
            <div className="flex items-center gap-2.5 text-xs font-semibold text-pace-purple py-2 animate-pulse">
              <RefreshCw size={14} className="animate-spin" />
              <span>Streaming more audit logs ({logs.length} of {totalLogs})...</span>
            </div>
          ) : hasMore && logs.length > 0 ? (
            <button
              onClick={loadMoreLogs}
              className="text-xs font-semibold text-admin-dim hover:text-pace-purple px-4 py-2 rounded-xl hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Scroll down or click to load more records
            </button>
          ) : logs.length > 0 ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-admin-dim py-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>All {totalLogs} audit records loaded in feed</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Floating Scroll to Top Action Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-pace-purple text-white rounded-2xl shadow-lg hover:bg-pace-purple/90 transition-all z-40 active:scale-95 cursor-pointer animate-in fade-in duration-200"
          title="Back to Top"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* VIEW AUDIT DETAILS MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Audit Event Inspection: #${selectedLog?.id}`}
        description="Complete cryptographic trace of operator execution, terminal origin, and event payloads."
        maxWidth="max-w-lg"
      >
        {selectedLog && (
          <div className="space-y-4 font-figtree">
            <div className="grid grid-cols-1 gap-2.5">
              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Event ID & Action</p>
                  <p className="text-xs font-bold text-admin-value mt-0.5">#{selectedLog.id} • {selectedLog.action}</p>
                </div>
                <Badge variant={getActionBadgeVariant(selectedLog.action)} className="font-mono text-[10px]">
                  {selectedLog.action}
                </Badge>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3.5">
                <p className="text-[10px] uppercase tracking-wider text-admin-dim font-bold mb-1">Actor Information</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-admin-value">{selectedLog.actor_name || 'System / Automated'}</span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", getActorRoleColor(selectedLog.actor_role))}>
                    {selectedLog.actor_role || 'System'}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3.5">
                <p className="text-[10px] uppercase tracking-wider text-admin-dim font-bold mb-1">Description & Modifications</p>
                <p className="text-xs font-semibold text-admin-value leading-relaxed break-words bg-card-bg p-3 rounded-lg border border-pace-border/60">
                  {selectedLog.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                  <p className="text-[10px] uppercase tracking-wider text-admin-dim font-bold mb-1">Terminal IP</p>
                  <p className="text-xs font-mono font-bold text-admin-value">{selectedLog.ip_address || '127.0.0.1'}</p>
                </div>
                <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                  <p className="text-[10px] uppercase tracking-wider text-admin-dim font-bold mb-1">Recorded At</p>
                  <p className="text-xs font-medium text-admin-value">
                    {new Date(selectedLog.created_at).toLocaleString('en-US')}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsViewOpen(false)}
              className="w-full bg-pace-purple text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all mt-2 cursor-pointer active:scale-98"
            >
              Close Inspector
            </button>
          </div>
        )}
      </Modal>

    </div>
  )
}
