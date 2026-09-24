"use client"

import React, { useState, useEffect, useRef } from 'react'
import { 
  Users, ShieldCheck, AlertCircle, RefreshCw, Eye, EyeOff, Plus, Edit2, Trash2, 
  Info, Search, X, Loader2, Lock, Key 
} from 'lucide-react'
import { ispService } from '@/services/admin/isps'
import { Skeleton, AdminCardSkeleton } from '@/components/Skeleton'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminISPsPage() {
  const [isps, setIsps] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, suspended: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Modals state
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  // Selected items
  const [selectedIsp, setSelectedIsp] = useState(null)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'

  // Form fields
  const [form, setForm] = useState({
    id: '',
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    status: 'active'
  })

  const observerRef = useRef(null)

  // Fetch page data
  async function loadData(targetPage = 1, append = false) {
    if (targetPage === 1) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const res = await ispService.getISPs(targetPage, 10, search)
      if (res.status === 'success') {
        const { isps: fetchedIsps, stats: fetchedStats, has_more } = res.data
        if (append) {
          setIsps(prev => [...prev, ...fetchedIsps])
        } else {
          setIsps(fetchedIsps)
        }
        setStats(fetchedStats)
        setHasMore(has_more)
      } else {
        toast.error(res.message || "Failed to retrieve ISPs data")
      }
    } catch (e) {
      console.error(e)
      toast.error("Network error retrieving ISPs profile database")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // Reload trigger
  function handleReload() {
    setPage(1)
    loadData(1, false)
  }

  // Trigger search filters
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1)
      loadData(1, false)
    }, 400)
    return () => clearTimeout(delayDebounce)
  }, [search])

  // Infinite Scroll Trigger
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const nextPage = page + 1
        setPage(nextPage)
        loadData(nextPage, true)
      }
    }, { threshold: 0.1, rootMargin: '100px' })

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, isLoading, page])

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create')
    setShowPassword(false)
    setForm({
      id: '',
      first_name: '',
      last_name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      status: 'active'
    })
    setIsCreateEditModalOpen(true)
  }

  // Open Edit Modal
  const openEditModal = (isp, e) => {
    if (e) e.stopPropagation()
    setModalMode('edit')
    setShowPassword(false)
    
    // Split full name into first and last
    const nameParts = (isp.name || '').split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    setForm({
      id: isp.id,
      first_name: firstName,
      last_name: lastName,
      username: isp.username,
      password: '', // blank by default on edit
      email: isp.email || '',
      phone: isp.phone || '',
      status: isp.status
    })
    setIsCreateEditModalOpen(true)
  }

  // Open View Details Modal
  const openViewModal = (isp, e) => {
    if (e) e.stopPropagation()
    setSelectedIsp(isp)
    setIsViewModalOpen(true)
  }

  // Open Delete Confirmation
  const openDeleteModal = (isp, e) => {
    if (e) e.stopPropagation()
    setSelectedIsp(isp)
    setIsDeleteModalOpen(true)
  }

  // Submit CRUD (Create/Edit)
  const handleSaveSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      let res
      if (modalMode === 'create') {
        res = await ispService.createISP(form)
      } else {
        res = await ispService.updateISP(form)
      }

      if (res.status === 'success') {
        toast.success(res.message || "ISP record saved successfully")
        setIsCreateEditModalOpen(false)
        handleReload()
      } else {
        toast.error(res.message || "Failed to save ISP profile")
      }
    } catch (err) {
      console.error(err)
      toast.error("Network request failed while saving data")
    } finally {
      setIsSaving(false)
    }
  }

  // Submit Delete
  const handleDeleteSubmit = async () => {
    if (!selectedIsp) return
    setIsSaving(true)
    try {
      const res = await ispService.deleteISP(selectedIsp.id)
      if (res.status === 'success') {
        toast.success("ISP operator successfully removed")
        setIsDeleteModalOpen(false)
        handleReload()
      } else {
        toast.error(res.message || "Failed to delete ISP operator")
      }
    } catch (err) {
      console.error(err)
      toast.error("Network error executing profile deletion")
    } finally {
      setIsSaving(false)
    }
  }

  const cards = [
    { 
      label: 'Total ISPs', 
      value: stats.total, 
      icon: Users, 
      color: 'text-pace-purple', 
      bg: 'bg-pace-purple/5',
      accent: 'bg-gradient-to-b from-pace-purple to-indigo-500',
      iconBorder: 'border-pace-purple/10 group-hover:border-pace-purple/30'
    },
    { 
      label: 'Active ISPs', 
      value: stats.active, 
      icon: ShieldCheck, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/5',
      accent: 'bg-gradient-to-b from-emerald-400 to-teal-500',
      iconBorder: 'border-emerald-500/10 group-hover:border-emerald-500/30'
    },
    { 
      label: 'Inactive ISPs', 
      value: stats.inactive, 
      icon: AlertCircle, 
      color: 'text-gray-400', 
      bg: 'bg-gray-500/5',
      accent: 'bg-gradient-to-b from-gray-400 to-slate-500',
      iconBorder: 'border-gray-500/10 group-hover:border-gray-500/30'
    },
    { 
      label: 'Suspended ISPs', 
      value: stats.suspended, 
      icon: AlertCircle, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/5',
      accent: 'bg-gradient-to-b from-rose-500 to-red-600',
      iconBorder: 'border-rose-500/10 group-hover:border-rose-500/30'
    },
  ]

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">ISPs</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Manage partner ISP tenant accounts and administrative access.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 w-full sm:flex-1">
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="p-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 shrink-0 cursor-pointer"
              title="Refresh List"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
            
            <div className="relative flex-1 sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, username..."
                className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-[0.98] w-full sm:w-auto shrink-0 shadow-sm"
          >
            <Plus size={16} /> Create ISP
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && isps.length === 0 ? (
          [...Array(4)].map((_, i) => (
            <AdminCardSkeleton key={i} />
          ))
        ) : cards.map((card) => (
          <div key={card.label} className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-[0_12px_24px_-10px_rgba(75,29,143,0.1)] transition-all duration-300 min-w-0">
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
              <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-105", card.iconBorder, card.bg)}>
                <card.icon className={cn(card.color, "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5")} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Database Table View */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[900px]">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-semibold text-admin-dim text-xs">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border text-xs">
              {isLoading && isps.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-6 py-4">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : isps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-admin-dim">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle size={28} className="text-admin-dim opacity-40 mb-3" />
                      <p className="font-medium">No ISP accounts match your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                isps.map((isp) => (
                  <tr 
                    key={isp.id} 
                    onClick={(e) => openViewModal(isp, e)}
                    className="hover:bg-pace-bg-subtle/30 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-semibold text-admin-value">{isp.name}</td>
                    <td className="px-6 py-4 font-medium text-admin-value font-mono">{isp.username}</td>
                    <td className="px-6 py-4 text-admin-value">{isp.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-admin-value font-mono">{isp.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                        isp.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : isp.status === 'inactive' 
                          ? 'bg-gray-500/10 text-gray-600'
                          : 'bg-rose-500/10 text-rose-600'
                      )}>
                        {isp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-admin-dim">
                      {new Date(isp.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-admin-dim">
                      {isp.last_login !== 'Never' ? new Date(isp.last_login).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => openViewModal(isp, e)}
                          className="p-1.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-lg hover:border-pace-purple hover:text-pace-purple transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Info size={14} />
                        </button>
                        <button
                          onClick={(e) => openEditModal(isp, e)}
                          className="p-1.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-lg hover:border-pace-purple hover:text-pace-purple transition-all cursor-pointer"
                          title="Edit Profile & Password"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => openDeleteModal(isp, e)}
                          className="p-1.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-lg hover:border-rose-500 hover:text-rose-500 transition-all cursor-pointer"
                          title="Delete Profile"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {/* Load More Trigger Row */}
              {hasMore && (
                <tr ref={observerRef}>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-admin-dim py-2">
                      <Loader2 className="animate-spin text-pace-purple" size={16} />
                      <span>Loading additional records...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE & EDIT MODAL */}
      {isCreateEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-bg border border-pace-border rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-pace-border bg-pace-bg-subtle/50">
              <div>
                <h3 className="text-base font-semibold text-admin-value">
                  {modalMode === 'create' ? 'Create ISP Account' : `Edit ISP: ${form.username}`}
                </h3>
                <p className="text-xs text-admin-dim mt-0.5">
                  {modalMode === 'create' ? 'Register a new ISP operator profile and billing wallet.' : 'Update profile details or assign a new password.'}
                </p>
              </div>
              <button 
                onClick={() => setIsCreateEditModalOpen(false)}
                className="p-1.5 text-admin-dim hover:text-admin-value hover:bg-pace-bg-subtle rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-admin-dim">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-admin-dim">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Doe"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-admin-dim">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. johndoe"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs text-admin-value font-mono focus:outline-none focus:border-pace-purple transition-all"
                />
              </div>

              {/* Password update section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-admin-dim">
                    {modalMode === 'create' ? 'Account Password *' : 'Change Password'}
                  </label>
                  {modalMode === 'edit' && (
                    <span className="text-[10px] text-admin-dim italic">Leave blank to keep unchanged</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={modalMode === 'create'}
                    placeholder={modalMode === 'edit' ? "Enter new password (optional)" : "Enter account password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-dim hover:text-admin-value cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-admin-dim">Email Address</label>
                  <input
                    type="email"
                    placeholder="isp@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-admin-dim">Phone Number</label>
                  <input
                    type="text"
                    placeholder="254700000000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs text-admin-value font-mono focus:outline-none focus:border-pace-purple transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-admin-dim">Account Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs text-admin-value focus:outline-none focus:border-pace-purple transition-all cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Evenly Distributed Footer Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-5 border-t border-pace-border">
                <button
                  type="button"
                  onClick={() => setIsCreateEditModalOpen(false)}
                  className="w-full py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl text-xs font-semibold hover:text-admin-value hover:bg-pace-border/30 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm text-center"
                >
                  {isSaving && <Loader2 className="animate-spin" size={12} />}
                  {modalMode === 'create' ? 'Create ISP' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && selectedIsp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-bg border border-pace-border rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-pace-border bg-pace-bg-subtle/50">
              <div>
                <h3 className="text-base font-semibold text-admin-value">{selectedIsp.name}</h3>
                <p className="text-xs text-admin-dim font-mono">@{selectedIsp.username}</p>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 text-admin-dim hover:text-admin-value hover:bg-pace-bg-subtle rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold">Email Address</p>
                  <p className="font-semibold text-admin-value">{selectedIsp.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold">Phone Number</p>
                  <p className="font-semibold text-admin-value font-mono">{selectedIsp.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold">Account Status</p>
                  <span className={cn(
                    "inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider mt-1",
                    selectedIsp.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                  )}>
                    {selectedIsp.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold">Last Login</p>
                  <p className="font-medium text-admin-value mt-1">
                    {selectedIsp.last_login !== 'Never' ? new Date(selectedIsp.last_login).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold">Profile Created Date</p>
                <p className="font-medium text-admin-value">
                  {new Date(selectedIsp.created_at).toLocaleString()}
                </p>
              </div>
              
              {/* Evenly Distributed Footer Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-5 border-t border-pace-border">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    openEditModal(selectedIsp)
                  }}
                  className="w-full py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all cursor-pointer shadow-sm text-center"
                >
                  Edit ISP
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-full py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl text-xs font-semibold hover:text-admin-value hover:bg-pace-border/30 transition-all cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedIsp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-bg border border-pace-border rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-admin-value">Delete ISP Profile?</h3>
                <p className="text-xs text-admin-dim mt-2 leading-relaxed">
                  Are you sure you want to delete ISP operator <strong className="text-admin-value">'{selectedIsp.name}'</strong>? This will revoke their access and terminate the associated wallet.
                </p>
              </div>
              
              {/* Evenly Distributed Footer Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-pace-border">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isSaving}
                  className="w-full py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl text-xs font-semibold hover:text-admin-value transition-all disabled:opacity-50 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  disabled={isSaving}
                  className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-500 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm text-center"
                >
                  {isSaving && <Loader2 className="animate-spin" size={12} />}
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
