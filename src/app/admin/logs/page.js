"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { FileText, Search, RefreshCw, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Skeleton } from '@/components/Skeleton'
import { logService } from '@/services/admin/logs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Modal details
  const [selectedLog, setSelectedLog] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const offset = (currentPage - 1) * pageSize
      const res = await logService.getSystemLogs(pageSize, offset)
      if (res && res.status === 'success') {
        setLogs(res.data || [])
        setTotalLogs(res.total || 0)
      } else {
        toast.error(res?.message || 'Failed to retrieve audit logs')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error fetching audit logs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [currentPage, pageSize])

  const handleReload = () => {
    fetchLogs()
  }

  // Filter logs locally by search query
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const desc = log.description || ''
      const action = log.action || ''
      const name = log.actor_name || ''
      const role = log.actor_role || ''
      const ip = log.ip_address || ''
      const id = log.id ? log.id.toString() : ''

      return (
        desc.toLowerCase().includes(search.toLowerCase()) ||
        action.toLowerCase().includes(search.toLowerCase()) ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        role.toLowerCase().includes(search.toLowerCase()) ||
        ip.includes(search) ||
        id.includes(search)
      )
    })
  }, [logs, search])

  // Pagination totals
  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize))

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const openViewModal = (log) => {
    setSelectedLog(log)
    setIsViewOpen(true)
  }

  const getActorRoleColor = (role) => {
    if (!role) return 'secondary'
    switch (role.toLowerCase()) {
      case 'superadmin':
      case 'admin':
        return 'error'
      case 'isp':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">System Audit logs</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Audit administrative operations, profile updates, wallet reloads, and API configurations.</p>
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
                placeholder="Search audit action, admin..."
                className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Database Table Card */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Log ID</th>
                <th className="px-6 py-4">Admin / Operator</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Description details</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-10 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-12 bg-pace-bg-subtle rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-64 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-pace-bg-subtle rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-admin-dim text-xs font-medium">
                    No system audit logs found in pagination scope.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((logItem) => (
                  <tr key={logItem.id} className="hover:bg-pace-bg-subtle/30 transition-all duration-150">
                    <td className="px-6 py-4 font-mono font-bold text-pace-purple text-xs">
                      #{logItem.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-admin-value text-xs">
                      {logItem.actor_name || 'System / Automated'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getActorRoleColor(logItem.actor_role)} className="text-[9px] font-bold border-none px-2.5 py-0.5 uppercase tracking-wider">
                        {logItem.actor_role || 'System'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-admin-value">
                      {logItem.action}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-admin-value max-w-sm truncate" title={logItem.description}>
                      {logItem.description}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-admin-dim">
                      {logItem.ip_address || '::1'}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {new Date(logItem.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openViewModal(logItem)}
                        className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-admin-value transition-all"
                        title="View Details"
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

        {/* Next Page / Pagination Controls Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-pace-border bg-pace-bg-subtle/30 text-xs font-semibold text-admin-dim">
          <div className="flex items-center gap-4">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10))
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 rounded-lg border border-pace-border bg-card-bg text-admin-value outline-none cursor-pointer focus:border-pace-purple transition-all"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
            <span>of {totalLogs} total operations</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading}
              className="p-1.5 bg-card-bg border border-pace-border rounded-xl text-admin-dim hover:text-admin-value disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
              className="p-1.5 bg-card-bg border border-pace-border rounded-xl text-admin-dim hover:text-admin-value disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Audit Log Details: #${selectedLog?.id}`}
        description="System logging particulars mapping actor, operations, and description payloads."
        maxWidth="max-w-md"
      >
        {selectedLog && (
          <div className="space-y-4 font-figtree">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Operation ID', value: '#' + selectedLog.id },
                { label: 'Actor Name', value: selectedLog.actor_name || 'System / Automated' },
                { label: 'Actor Console Role', value: selectedLog.actor_role || 'System' },
                { label: 'Action Tag', value: selectedLog.action },
                { label: 'Description Details', value: selectedLog.description },
                { label: 'Terminal IP Address', value: selectedLog.ip_address || '::1' },
                { label: 'Timestamp Date', value: new Date(selectedLog.created_at).toLocaleString('en-US') }
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

    </div>
  )
}
