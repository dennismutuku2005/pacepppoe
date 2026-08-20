"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Search, Power, Settings, RefreshCw, Cpu, HardDrive, Users, Edit, Trash2, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { routerService } from '@/services/admin/routers'
import { ispService } from '@/services/admin/isps'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminRoutersPage() {
  const [routers, setRouters] = useState([])
  const [ispsList, setIspsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Modal states
  const [selectedRouter, setSelectedRouter] = useState(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [showPassword, setShowPassword] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    ip_address: '',
    api_port: 8728,
    winbox_port: 8291,
    username: '',
    password: '',
    model: 'MikroTik',
    ownerSearch: '',
    isp_id: ''
  })
  const [editForm, setEditForm] = useState({
    id: null,
    name: '',
    ip_address: '',
    api_port: 8728,
    winbox_port: 8291,
    username: '',
    password: '',
    model: 'MikroTik',
    status: 'offline',
    ownerSearch: '',
    isp_id: ''
  })

  // Fetch routers on load
  const loadRouters = async () => {
    setIsLoading(true)
    try {
      const res = await routerService.getRouters()
      if (res && res.status === 'success') {
        setRouters(res.data || [])
      } else {
        toast.error(res?.message || 'Failed to load routers')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error fetching routers inventory')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch ISPs on load for autocomplete
  const loadISPs = async () => {
    try {
      const res = await ispService.getISPs(1, 300)
      if (res && res.status === 'success') {
        setIspsList(res.data.isps || [])
      }
    } catch (err) {
      console.error("Failed to fetch ISPs", err)
    }
  }

  useEffect(() => {
    loadRouters()
    loadISPs()
  }, [])

  const handleReload = () => {
    loadRouters()
  }

  // Search filtering
  const filteredRouters = routers.filter((router) =>
    router.name.toLowerCase().includes(search.toLowerCase()) ||
    router.ip.includes(search) ||
    router.model.toLowerCase().includes(search.toLowerCase()) ||
    (router.owner_name && router.owner_name.toLowerCase().includes(search.toLowerCase()))
  )

  // Autocomplete change handlers
  const handleCreateOwnerChange = (e) => {
    const val = e.target.value
    const matched = ispsList.find(isp => isp.name === val)
    setCreateForm(prev => ({
      ...prev,
      ownerSearch: val,
      isp_id: matched ? matched.id : ''
    }))
  }

  const handleEditOwnerChange = (e) => {
    const val = e.target.value
    const matched = ispsList.find(isp => isp.name === val)
    setEditForm(prev => ({
      ...prev,
      ownerSearch: val,
      isp_id: matched ? matched.id : ''
    }))
  }

  // Modal trigger actions
  const openInfoModal = (router) => {
    setSelectedRouter(router)
    setIsInfoOpen(true)
  }

  const openCreateModal = () => {
    setCreateForm({
      name: '',
      ip_address: '',
      api_port: 8728,
      winbox_port: 8291,
      username: '',
      password: '',
      model: 'MikroTik',
      ownerSearch: '',
      isp_id: ''
    })
    setShowPassword(false)
    setIsCreateOpen(true)
  }

  const openEditModal = (router) => {
    setEditForm({
      id: router.id,
      name: router.name,
      ip_address: router.ip,
      api_port: router.port,
      winbox_port: router.winbox_port || 8291,
      username: router.username || '',
      password: '', // blank by default (update optional)
      model: router.model || 'MikroTik',
      status: router.status === 'Online' ? 'online' : 'offline',
      ownerSearch: router.owner_name === 'Admin / Shared' ? '' : router.owner_name,
      isp_id: router.isp_id || ''
    })
    setShowPassword(false)
    setIsEditOpen(true)
  }

  const openDeleteModal = (router) => {
    setSelectedRouter(router)
    setIsDeleteOpen(true)
  }

  // CRUD API Calls
  const handleCreateSubmit = async () => {
    if (!createForm.name || !createForm.ip_address || !createForm.username || !createForm.password) {
      toast.error('Name, IP Address, Username, and Password are required fields.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: createForm.name,
        ip_address: createForm.ip_address,
        api_port: parseInt(createForm.api_port, 10) || 8728,
        winbox_port: parseInt(createForm.winbox_port, 10) || 8291,
        username: createForm.username,
        password: createForm.password,
        model: createForm.model || 'MikroTik',
        isp_id: createForm.isp_id || null
      }

      const res = await routerService.authorizeRouter(payload)
      if (res && res.status === 'success') {
        toast.success(`Router ${createForm.name} authorized successfully.`)
        setIsCreateOpen(false)
        loadRouters()
      } else {
        toast.error(res?.message || 'Failed to authorize router')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error during router authorization')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!editForm.name || !editForm.ip_address || !editForm.username) {
      toast.error('Name, IP Address, and Username are required.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: editForm.name,
        ip_address: editForm.ip_address,
        api_port: parseInt(editForm.api_port, 10) || 8728,
        winbox_port: parseInt(editForm.winbox_port, 10) || 8291,
        username: editForm.username,
        model: editForm.model || 'MikroTik',
        status: editForm.status,
        isp_id: editForm.isp_id || null
      }

      if (editForm.password && editForm.password.trim() !== '') {
        payload.password = editForm.password
      }

      const res = await routerService.updateRouter(editForm.id, payload)
      if (res && res.status === 'success') {
        toast.success(`Router ${editForm.name} updated successfully.`)
        setIsEditOpen(false)
        loadRouters()
      } else {
        toast.error(res?.message || 'Failed to update router settings')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error updating router settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedRouter) return
    setIsSaving(true)
    try {
      const res = await routerService.deleteRouter(selectedRouter.id)
      if (res && res.status === 'success') {
        toast.success(`Router ${selectedRouter.name} de-authorized successfully.`)
        setIsDeleteOpen(false)
        loadRouters()
      } else {
        toast.error(res?.message || 'Cannot delete router. Check if plans/subscribers are linked.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error during router deletion')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReboot = (name) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Sending reboot command to ${name}...`,
        success: `Reboot command queued for ${name}.`,
        error: `Failed to queue reboot for ${name}.`
      }
    )
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">Router Infrastructure</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Provision and monitor edge routers for ISP traffic.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 w-full sm:flex-1">
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="p-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 shrink-0"
              title="Refresh List"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
            
            <div className="relative flex-1 sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search routers, IPs, owners..."
                className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-[0.98] w-full sm:w-auto shrink-0"
          >
            <Plus size={16} /> Add Router
          </button>
        </div>
      </div>

      {/* Main Database Table Card */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Node Info</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Owner / ISP</th>
                <th className="px-6 py-4">Ports (API/Winbox)</th>
                <th className="px-6 py-4">Model</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">CPU</th>
                <th className="px-6 py-4">RAM</th>
                <th className="px-6 py-4">Users</th>
                <th className="px-6 py-4">Uptime</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-12 bg-pace-bg-subtle rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-2 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-2 w-20 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-pace-bg-subtle rounded-md" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-pace-bg-subtle rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : filteredRouters.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-16 text-center text-admin-dim text-xs font-medium">
                    No edge routers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRouters.map((routerItem) => (
                  <tr key={routerItem.id} className="hover:bg-pace-bg-subtle/30 transition-all duration-150">
                    <td className="px-6 py-4 font-semibold text-admin-value text-xs">
                      {routerItem.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-admin-value">
                      {routerItem.ip}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      {routerItem.owner_name === 'Admin / Shared' ? (
                        <span className="text-[10px] bg-pace-bg-subtle text-admin-dim font-bold border border-pace-border/60 px-2 py-0.5 rounded-md uppercase tracking-tight">Shared</span>
                      ) : (
                        <span className="text-[10px] bg-pace-purple/5 text-pace-purple font-bold border border-pace-purple/15 px-2 py-0.5 rounded-md uppercase tracking-tight">{routerItem.owner_name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-admin-value">
                      API: <span className="font-mono text-pace-purple">{routerItem.port}</span> | WB: <span className="font-mono text-admin-dim">{routerItem.winbox_port || 8291}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-admin-dim">
                      {routerItem.model}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={routerItem.status === 'Online' ? 'success' : 'error'} className="text-[9px] font-bold border-none px-2 py-0.5 uppercase tracking-wider">
                        {routerItem.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 w-24">
                        <div className="flex-1 h-1.5 bg-pace-bg-subtle rounded-full overflow-hidden">
                          <div className={cn(
                            'h-full transition-all duration-700',
                            routerItem.cpu > 70 ? 'bg-rose-500' : routerItem.cpu > 40 ? 'bg-amber-500' : 'bg-pace-purple'
                          )} style={{ width: `${routerItem.cpu}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-admin-value tabular-nums">{routerItem.cpu}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 w-24">
                        <div className="flex-1 h-1.5 bg-pace-bg-subtle rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${routerItem.ram}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-admin-value tabular-nums">{routerItem.ram}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-admin-value text-center">
                      {routerItem.subscribers}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-pace-purple">
                      {routerItem.uptime}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openInfoModal(routerItem)}
                          className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-admin-value transition-all"
                          title="View Info"
                        >
                          <Settings size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(routerItem)}
                          className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-pace-purple transition-all"
                          title="Edit Router"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(routerItem)}
                          className="p-1.5 text-admin-dim hover:bg-red-500/10 rounded-lg hover:text-red-500 transition-all"
                          title="Delete Router"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => handleReboot(routerItem.name)}
                          className="p-1.5 text-admin-dim hover:bg-pace-bg-subtle rounded-lg hover:text-admin-value transition-all"
                          title="Reboot Edge Node"
                        >
                          <Power size={14} />
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

      {/* Datalists for Suggestions */}
      <datalist id="isp-owners-create">
        <option value="Admin / Shared" />
        {ispsList.map((isp) => (
          <option key={isp.id} value={isp.name} />
        ))}
      </datalist>
      <datalist id="isp-owners-edit">
        <option value="Admin / Shared" />
        {ispsList.map((isp) => (
          <option key={isp.id} value={isp.name} />
        ))}
      </datalist>

      {/* VIEW MODAL */}
      <Modal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title={selectedRouter?.name || 'Router Detail'}
        description="Comprehensive configuration and hardware resource details."
        maxWidth="max-w-xl"
      >
        {selectedRouter && (
          <div className="space-y-5 font-figtree">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Router ID', value: `#${selectedRouter.id}` },
                { label: 'Owner ISP', value: selectedRouter.owner_name },
                { label: 'IP Address', value: selectedRouter.ip },
                { label: 'Model Type', value: selectedRouter.model },
                { label: 'API Port', value: selectedRouter.port },
                { label: 'Winbox Port', value: selectedRouter.winbox_port || 8291 },
                { label: 'Username', value: selectedRouter.username || 'Not set' },
                { label: 'Active Uptime', value: selectedRouter.uptime }
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3">
                  <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">{item.label}</p>
                  <p className="text-xs font-bold text-admin-value truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3 text-center">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">CPU Usage</p>
                <p className="text-lg font-extrabold text-pace-purple">{selectedRouter.cpu}%</p>
              </div>
              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3 text-center">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">RAM Used</p>
                <p className="text-lg font-extrabold text-blue-500">{selectedRouter.ram}%</p>
              </div>
              <div className="rounded-xl border border-pace-border bg-pace-bg-subtle p-3 text-center">
                <p className="text-[9px] uppercase tracking-wider text-admin-dim font-bold mb-1">PPPoE Users</p>
                <p className="text-lg font-extrabold text-emerald-500">{selectedRouter.subscribers}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setIsInfoOpen(false)
                  openEditModal(selectedRouter)
                }}
                className="flex-1 bg-pace-bg-subtle text-admin-value border border-pace-border py-2.5 rounded-xl text-sm font-medium hover:bg-pace-purple/5 hover:text-pace-purple transition-all"
              >
                Edit Credentials
              </button>
              <button
                onClick={() => setIsInfoOpen(false)}
                className="flex-1 bg-pace-purple text-white py-2.5 rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all"
              >
                Dismiss Detail
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Router"
        description="Register a new MikroTik access router into the billing directory."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-figtree">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Node Identifier</label>
              <input
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. East edge 1"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">IP Address</label>
              <input
                value={createForm.ip_address}
                onChange={(e) => setCreateForm(prev => ({ ...prev, ip_address: e.target.value }))}
                placeholder="192.168.88.1"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">API Port</label>
              <input
                type="number"
                value={createForm.api_port}
                onChange={(e) => setCreateForm(prev => ({ ...prev, api_port: e.target.value }))}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Winbox Port</label>
              <input
                type="number"
                value={createForm.winbox_port}
                onChange={(e) => setCreateForm(prev => ({ ...prev, winbox_port: e.target.value }))}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">API Username</label>
              <input
                value={createForm.username}
                onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="admin"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">API Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Secret key"
                  className="w-full mt-1.5 pl-3 pr-10 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-admin-dim hover:text-admin-value"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Hardware Model</label>
              <input
                value={createForm.model}
                onChange={(e) => setCreateForm(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g. CCR2004"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Owner / ISP Suggestion</label>
              <input
                list="isp-owners-create"
                value={createForm.ownerSearch}
                onChange={handleCreateOwnerChange}
                placeholder="Admin / Shared"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleCreateSubmit}
            disabled={isSaving}
            className="w-full bg-pace-purple text-white py-2.5 rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all disabled:opacity-50 mt-2"
          >
            {isSaving ? "Adding..." : "Add Router"}
          </button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Modify Router: ${editForm.name}`}
        description="Update network credentials, connection ports, or system owner mapping."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-figtree">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Node Identifier</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Name"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">IP Address</label>
              <input
                value={editForm.ip_address}
                onChange={(e) => setEditForm(prev => ({ ...prev, ip_address: e.target.value }))}
                placeholder="IP Address"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">API Port</label>
              <input
                type="number"
                value={editForm.api_port}
                onChange={(e) => setEditForm(prev => ({ ...prev, api_port: e.target.value }))}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Winbox Port</label>
              <input
                type="number"
                value={editForm.winbox_port}
                onChange={(e) => setEditForm(prev => ({ ...prev, winbox_port: e.target.value }))}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">API Username</label>
              <input
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Username"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Change Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={editForm.password}
                  onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave blank to keep current"
                  className="w-full mt-1.5 pl-3 pr-10 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-admin-dim hover:text-admin-value"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Hardware Model</label>
              <input
                value={editForm.model}
                onChange={(e) => setEditForm(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Model"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Owner / ISP Suggestion</label>
              <input
                list="isp-owners-edit"
                value={editForm.ownerSearch}
                onChange={handleEditOwnerChange}
                placeholder="Admin / Shared"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Status Profile</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all cursor-pointer"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <button
            onClick={handleEditSubmit}
            disabled={isSaving}
            className="w-full bg-pace-purple text-white py-2.5 rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all disabled:opacity-50 mt-2"
          >
            {isSaving ? "Saving changes..." : "Save Configuration"}
          </button>
        </div>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Remove Router Authorization"
        description="Are you absolutely sure you want to remove this router from PPPoE monitoring? This cannot be undone."
        type="danger"
        confirmText="De-authorize"
        onConfirm={handleDeleteSubmit}
        loading={isSaving}
      />
      
    </div>
  )
}
