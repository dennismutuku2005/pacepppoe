"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Search, Power, Settings, RefreshCw, Cpu, HardDrive, Users, Edit, Trash2, ShieldCheck, AlertCircle, Eye, EyeOff, Download, ExternalLink, FileText, Sparkles, Lock, Key, Shield, CheckCircle2, ChevronDown, Activity, Radio, Server, Clock, Zap } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { IspAutocomplete } from '@/components/IspAutocomplete'
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
  const [isLoadingNextResources, setIsLoadingNextResources] = useState(false)
  const [isResourcesConfirmed, setIsResourcesConfirmed] = useState(false)

  // Live Telemetry & Quick Action states
  const [pingingRouterId, setPingingRouterId] = useState(null)
  const [rebootingRouterId, setRebootingRouterId] = useState(null)
  const [systemInfoData, setSystemInfoData] = useState(null)
  const [isLoadingSystemInfo, setIsLoadingSystemInfo] = useState(false)

  // Form states
  const [showPassword, setShowPassword] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    ip_address: '',
    public_ip: '178.62.36.148',
    api_port: '',
    winbox_port: '',
    username: 'admin',
    password: '',
    model: 'MikroTik',
    ownerSearch: '',
    isp_id: ''
  })
  const [editForm, setEditForm] = useState({
    id: null,
    name: '',
    ip_address: '',
    public_ip: '178.62.36.148',
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

  // Live Telemetry loader
  const fetchLiveTelemetry = async (routerId) => {
    setIsLoadingSystemInfo(true)
    setSystemInfoData(null)
    try {
      const res = await routerService.getSystemInfo(routerId)
      if (res && res.status === 'success' && res.data) {
        setSystemInfoData(res.data)
      } else {
        setSystemInfoData(null)
      }
    } catch (e) {
      console.warn("Could not load live telemetry for router", e)
      setSystemInfoData(null)
    } finally {
      setIsLoadingSystemInfo(false)
    }
  }

  // Ping router handler
  const handlePing = async (routerItem, e) => {
    if (e) e.stopPropagation()
    setPingingRouterId(routerItem.id)
    try {
      const res = await routerService.pingRouter(routerItem.id)
      if (res && res.status === 'success') {
        const isOnline = res.data?.status === 'online'
        if (isOnline) {
          toast.success(`${routerItem.name} is ONLINE (${res.data.latency_ms || 12}ms latency)`)
        } else {
          toast.error(`${routerItem.name} is OFFLINE: ${res.data?.error || 'Node unreachable'}`)
        }
        setRouters(prev => prev.map(r => r.id === routerItem.id ? { ...r, status: isOnline ? 'Online' : 'Offline' } : r))
        if (selectedRouter?.id === routerItem.id) {
          fetchLiveTelemetry(routerItem.id)
        }
      } else {
        toast.error(res?.message || `Ping failed for ${routerItem.name}`)
      }
    } catch (err) {
      toast.error(`Connection test failed for ${routerItem.name}`)
    } finally {
      setPingingRouterId(null)
    }
  }

  // Reboot router handler
  const handleReboot = async (routerItem, e) => {
    if (e) e.stopPropagation()
    if (!window.confirm(`Are you sure you want to reboot MikroTik node '${routerItem.name}'? All active PPPoE subscriber tunnels will temporarily restart.`)) {
      return
    }
    setRebootingRouterId(routerItem.id)
    try {
      const res = await routerService.rebootRouter(routerItem.id)
      if (res && res.status === 'success') {
        toast.success(res.message || `Reboot command sent to ${routerItem.name}`)
        if (selectedRouter?.id === routerItem.id) {
          setIsInfoOpen(false)
        }
      } else {
        toast.error(res?.message || `Failed to reboot ${routerItem.name}`)
      }
    } catch (err) {
      toast.error(`Error sending reboot signal to ${routerItem.name}`)
    } finally {
      setRebootingRouterId(null)
    }
  }

  // Search filtering
  const filteredRouters = routers.filter((router) =>
    router.name.toLowerCase().includes(search.toLowerCase()) ||
    router.ip.includes(search) ||
    router.model.toLowerCase().includes(search.toLowerCase()) ||
    (router.owner_name && router.owner_name.toLowerCase().includes(search.toLowerCase()))
  )

  // Fetch next resource allocation strictly from server
  const fetchAndConfirmResources = async () => {
    setIsLoadingNextResources(true)
    setIsResourcesConfirmed(false)
    try {
      const res = await routerService.getNextResources()
      if (res && res.status === 'success' && res.data) {
        setCreateForm(prev => ({
          ...prev,
          ip_address: res.data.next_ip || '10.8.0.2',
          api_port: res.data.next_api_port || 8729,
          winbox_port: res.data.next_winbox_port || 8292,
          public_ip: res.data.public_ip || '178.62.36.148'
        }))
        setIsResourcesConfirmed(true)
      } else {
        toast.error('Failed to confirm next IP & Port allocation from server pool')
      }
    } catch (e) {
      console.error("Could not fetch resources pool", e)
      toast.error('Network error confirming resource allocation')
    } finally {
      setIsLoadingNextResources(false)
    }
  }

  // Modal trigger actions
  const openInfoModal = (router) => {
    setSelectedRouter(router)
    setIsInfoOpen(true)
    fetchLiveTelemetry(router.id)
  }

  const openCreateModal = () => {
    setCreateForm({
      name: '',
      ip_address: '',
      public_ip: '178.62.36.148',
      api_port: '',
      winbox_port: '',
      username: 'admin',
      password: '',
      model: 'MikroTik',
      ownerSearch: '',
      isp_id: ''
    })
    setShowPassword(false)
    setIsCreateOpen(true)
    fetchAndConfirmResources()
  }

  const openEditModal = (router) => {
    setEditForm({
      id: router.id,
      name: router.name,
      ip_address: router.ip,
      public_ip: router.public_ip || '178.62.36.148',
      api_port: router.port,
      winbox_port: router.winbox_port || 8291,
      username: router.username || '',
      password: '',
      model: router.model || 'MikroTik',
      status: router.status === 'Online' ? 'online' : (router.status === 'Inactive' ? 'inactive' : 'offline'),
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
    const cleanName = (createForm.name || '').replace(/\s+/g, '')
    if (!cleanName) {
      toast.error('MikroTik Name is required.')
      return
    }

    if (!isResourcesConfirmed) {
      toast.error('Resource allocation must be confirmed by the server before creating.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: cleanName,
        username: createForm.username || 'admin',
        password: createForm.password || '',
        model: createForm.model || 'MikroTik',
        isp_id: createForm.isp_id || null
      }

      const res = await routerService.authorizeRouter(payload)
      if (res && res.status === 'success') {
        toast.success(`Router ${createForm.name} added successfully!`)
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
    if (!editForm.name) {
      toast.error('Name is required.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: editForm.name,
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

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">Router Infrastructure</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Manage edge routers with automated (+1) IP/port pools and OpenVPN tunnel keys.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search routers, IPs, owners..."
              className="w-full pl-10 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all placeholder:text-admin-dim/60 shadow-xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 text-xs font-semibold cursor-pointer"
              title="Refresh List"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh List</span>
            </button>

            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <Plus size={15} /> <span>Add Router</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Database Table Card */}
      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left whitespace-nowrap min-w-[1050px]">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-semibold text-admin-dim text-xs">
                <th className="px-6 py-4">MikroTik / Router Info</th>
                <th className="px-6 py-4">Assigned VPN IP</th>
                <th className="px-6 py-4">Owner / ISP</th>
                <th className="px-6 py-4">Ports (API / Winbox)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">OVPN Download Files</th>
                <th className="px-6 py-4">Subscribers</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-pace-border/50 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-pace-border/50 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-pace-border/50 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-pace-border/50 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-pace-border/50 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-36 bg-pace-border/50 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-pace-border/50 rounded animate-pulse" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-pace-border/50 rounded ml-auto animate-pulse" /></td>
                  </tr>
                ))
              ) : filteredRouters.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-admin-dim text-xs font-semibold">
                    No MikroTik routers found
                  </td>
                </tr>
              ) : (
                filteredRouters.map((routerItem) => (
                  <tr key={routerItem.id} className="hover:bg-pace-purple/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-pace-purple/5 border border-pace-purple/10 flex items-center justify-center text-pace-purple shrink-0 group-hover:scale-105 transition-transform">
                          <Cpu size={15} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-admin-value group-hover:text-pace-purple transition-colors">{routerItem.name}</p>
                          <p className="text-[10px] text-admin-dim font-medium">{routerItem.model || 'MikroTik'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-admin-value font-mono block">{routerItem.ip}</span>
                      {routerItem.public_ip && (
                        <span className="text-[10px] text-admin-dim font-mono block">WAN: {routerItem.public_ip}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {routerItem.owner_name === 'Admin / Shared' ? (
                        <span className="text-[10px] bg-pace-bg-subtle text-admin-dim font-bold border border-pace-border/60 px-2 py-0.5 rounded-md uppercase tracking-tight">Shared</span>
                      ) : (
                        <span className="text-[10px] bg-pace-purple/5 text-pace-purple font-bold border border-pace-purple/15 px-2 py-0.5 rounded-md uppercase tracking-tight">{routerItem.owner_name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-admin-dim">
                      API: <span className="font-semibold text-admin-value">{routerItem.port}</span> • Winbox: <span className="font-semibold text-admin-value">{routerItem.winbox_port || 8291}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={routerItem.status === 'Online' ? 'success' : 'error'} className="text-[9px] font-bold border-none px-2 py-0.5 uppercase tracking-wider">
                        {routerItem.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {routerItem.ovpn_links ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* 1. CA Cert */}
                          {routerItem.ovpn_links.ca && (
                            <a
                              href={routerItem.ovpn_links.ca}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Download CA Certificate (ca.crt)"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg text-[10px] font-bold hover:bg-amber-500/20 transition-all"
                            >
                              <Shield size={10} /> CA
                            </a>
                          )}
                          {/* 2. Client Cert */}
                          {routerItem.ovpn_links.cert && (
                            <a
                              href={routerItem.ovpn_links.cert}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Download Client Certificate (client.crt)"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-lg text-[10px] font-bold hover:bg-blue-500/20 transition-all"
                            >
                              <FileText size={10} /> Cert
                            </a>
                          )}
                          {/* 3. Client Key */}
                          {routerItem.ovpn_links.key && (
                            <a
                              href={routerItem.ovpn_links.key}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Download Client Private Key (client.key)"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg text-[10px] font-bold hover:bg-rose-500/20 transition-all"
                            >
                              <Key size={10} /> Key
                            </a>
                          )}
                          {/* 4. Complete .OVPN */}
                          {routerItem.ovpn_links.ovpn && (
                            <a
                              href={routerItem.ovpn_links.ovpn}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Download Full .OVPN Profile"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg text-[10px] font-bold hover:bg-emerald-500/20 transition-all"
                            >
                              <Download size={10} /> .OVPN
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-admin-dim font-medium italic">Standard (No OVPN)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-admin-value">{routerItem.subscribers}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                        {/* Ping Quick Action */}
                        <button
                          onClick={(e) => handlePing(routerItem, e)}
                          disabled={pingingRouterId === routerItem.id}
                          title="Ping / Test Node Reachability"
                          className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-admin-dim hover:text-emerald-600 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Activity size={15} className={pingingRouterId === routerItem.id ? "animate-spin text-emerald-600" : ""} />
                        </button>

                        {/* Reboot Quick Action */}
                        <button
                          onClick={(e) => handleReboot(routerItem, e)}
                          disabled={rebootingRouterId === routerItem.id}
                          title="Remote Reboot MikroTik"
                          className="p-1.5 hover:bg-amber-500/10 rounded-lg text-admin-dim hover:text-amber-600 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Power size={15} className={rebootingRouterId === routerItem.id ? "animate-spin text-amber-600" : ""} />
                        </button>

                        {/* View Telemetry */}
                        <button
                          onClick={() => openInfoModal(routerItem)}
                          title="View Live Telemetry & OVPN"
                          className="p-1.5 hover:bg-pace-purple/10 rounded-lg text-admin-dim hover:text-pace-purple transition-all cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Edit Settings */}
                        <button
                          onClick={() => openEditModal(routerItem)}
                          title="Edit Router Configuration"
                          className="p-1.5 hover:bg-pace-purple/10 rounded-lg text-admin-dim hover:text-pace-purple transition-all cursor-pointer"
                        >
                          <Edit size={15} />
                        </button>

                        {/* Delete Router */}
                        <button
                          onClick={() => openDeleteModal(routerItem)}
                          title="De-authorize Router"
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-admin-dim hover:text-rose-600 transition-all cursor-pointer"
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
      </div>


      {/* VIEW / TELEMETRY MODAL */}
      <Modal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title={selectedRouter?.name || 'Router Detail'}
        description="Real-time hardware telemetry, RouterOS health, and downloadable OpenVPN credentials."
        maxWidth="max-w-xl"
      >
        {selectedRouter && (
          <div className="space-y-6 font-figtree">
            {/* Quick Status & Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-pace-bg-subtle border border-pace-border rounded-xl gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pace-purple/10 border border-pace-purple/20 flex items-center justify-center text-pace-purple">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-admin-value">{selectedRouter.name}</h3>
                  <p className="text-xs font-mono text-admin-dim">VPN: {selectedRouter.ip} • API: {selectedRouter.port}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePing(selectedRouter)}
                  disabled={pingingRouterId === selectedRouter.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                  title="Test Connectivity"
                >
                  <Activity size={13} className={pingingRouterId === selectedRouter.id ? "animate-spin" : ""} />
                  <span>Ping</span>
                </button>
                <button
                  onClick={() => handleReboot(selectedRouter)}
                  disabled={rebootingRouterId === selectedRouter.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                  title="Reboot Node"
                >
                  <Power size={13} className={rebootingRouterId === selectedRouter.id ? "animate-spin" : ""} />
                  <span>Reboot</span>
                </button>
                <Badge variant={selectedRouter.status === 'Online' ? 'success' : 'error'}>
                  {selectedRouter.status}
                </Badge>
              </div>
            </div>

            {/* Live Hardware Telemetry Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-admin-value uppercase tracking-wider flex items-center gap-2">
                  <Server size={14} className="text-pace-purple" />
                  <span>Live System Telemetry</span>
                </h4>
                <button
                  onClick={() => fetchLiveTelemetry(selectedRouter.id)}
                  disabled={isLoadingSystemInfo}
                  className="text-[11px] font-semibold text-pace-purple hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={11} className={isLoadingSystemInfo ? "animate-spin" : ""} />
                  <span>{isLoadingSystemInfo ? "Querying Router..." : "Refresh Stats"}</span>
                </button>
              </div>

              {isLoadingSystemInfo ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-3 bg-card-bg border border-pace-border rounded-xl space-y-2">
                      <div className="h-3 w-16 bg-pace-border/50 rounded animate-pulse" />
                      <div className="h-5 w-20 bg-pace-border/50 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : systemInfoData ? (
                <div className="space-y-3">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-3 bg-card-bg border border-pace-border rounded-xl">
                      <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider mb-1">CPU Load</p>
                      <p className="text-base font-bold text-admin-value tabular-nums">{systemInfoData.cpuLoad || systemInfoData.cpu || 0}%</p>
                      <p className="text-[9px] text-admin-dim font-medium">{systemInfoData.cpuCount || 1} Cores @ {systemInfoData.cpuFrequency || 0}MHz</p>
                    </div>
                    <div className="p-3 bg-card-bg border border-pace-border rounded-xl">
                      <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider mb-1">RAM Memory</p>
                      <p className="text-base font-bold text-admin-value tabular-nums">{systemInfoData.memoryUsage || '0%'}</p>
                      <p className="text-[9px] text-admin-dim font-medium">{systemInfoData.usedMemory || '0 MB'} / {systemInfoData.totalMemory || '0 MB'}</p>
                    </div>
                    <div className="p-3 bg-card-bg border border-pace-border rounded-xl">
                      <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider mb-1">Free Storage</p>
                      <p className="text-base font-bold text-admin-value tabular-nums">{systemInfoData.freeHdd || '0 MB'}</p>
                      <p className="text-[9px] text-admin-dim font-medium">Total: {systemInfoData.totalHdd || '0 MB'}</p>
                    </div>
                    <div className="p-3 bg-card-bg border border-pace-border rounded-xl">
                      <p className="text-[10px] text-admin-dim font-bold uppercase tracking-wider mb-1">System Uptime</p>
                      <p className="text-sm font-bold text-pace-purple truncate tabular-nums">{systemInfoData.uptime || 'N/A'}</p>
                      <p className="text-[9px] text-admin-dim font-medium">Online</p>
                    </div>
                  </div>

                  {/* Hardware & OS Version Info */}
                  <div className="p-3 bg-pace-bg-subtle/50 border border-pace-border rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Radio size={14} className="text-emerald-500 shrink-0" />
                      <span className="font-semibold text-admin-value">{systemInfoData.boardName || selectedRouter.model}</span>
                      <span className="text-[10px] text-admin-dim font-mono">({systemInfoData.architecture || 'RouterOS'})</span>
                    </div>
                    <span className="text-[10px] font-bold bg-pace-purple/10 text-pace-purple px-2 py-0.5 rounded-md">
                      RouterOS v{systemInfoData.version || '7.x'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center space-y-1">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Unable to query live telemetry from RouterOS API</p>
                  <p className="text-[11px] text-admin-dim">Check if router OpenVPN client is connected to VPN IP <span className="font-mono">{selectedRouter.ip}</span> on API port <span className="font-mono">{selectedRouter.port}</span>.</p>
                </div>
              )}
            </div>

            {/* Detail Key-Values */}
            <div className="space-y-2 border border-pace-border rounded-xl p-4 bg-card-bg">
              <div className="flex justify-between py-1.5 border-b border-pace-border/60 text-xs">
                <span className="text-admin-dim font-medium">MikroTik Model</span>
                <span className="font-bold text-admin-value">{selectedRouter.model}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-pace-border/60 text-xs">
                <span className="text-admin-dim font-medium">Owner / ISP Scope</span>
                <span className="font-bold text-admin-value">{selectedRouter.owner_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-pace-border/60 text-xs">
                <span className="text-admin-dim font-medium">Assigned VPN IP</span>
                <span className="font-mono font-bold text-admin-value">{selectedRouter.ip}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-pace-border/60 text-xs">
                <span className="text-admin-dim font-medium">Public Gateway IP</span>
                <span className="font-mono font-bold text-admin-value">{selectedRouter.public_ip || '178.62.36.148'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-pace-border/60 text-xs">
                <span className="text-admin-dim font-medium">API Connection Port</span>
                <span className="font-mono font-bold text-admin-value">{selectedRouter.port}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-pace-border/60 text-xs">
                <span className="text-admin-dim font-medium">Winbox Remote Port</span>
                <span className="font-mono font-bold text-admin-value">{selectedRouter.winbox_port || 8291}</span>
              </div>
              <div className="flex justify-between py-1.5 text-xs">
                <span className="text-admin-dim font-medium">API Username</span>
                <span className="font-mono font-bold text-admin-value">{selectedRouter.username || 'admin'}</span>
              </div>
            </div>

            {/* OpenVPN Certificate / Config Downloads (3 Keys + Profile) */}
            {selectedRouter.ovpn_links && (
              <div className="border border-pace-border rounded-xl p-4 bg-pace-bg-subtle/50 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <h4 className="text-xs font-bold text-admin-value">Download OpenVPN Certificate & Key Files</h4>
                </div>
                <p className="text-[11px] text-admin-dim">
                  Download the individual CA, client cert, private key, or unified configuration to configure the MikroTik OpenVPN client.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* CA Certificate */}
                  {selectedRouter.ovpn_links.ca && (
                    <a
                      href={selectedRouter.ovpn_links.ca}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                          <Shield size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-admin-value">CA Certificate</p>
                          <p className="text-[10px] text-admin-dim font-mono">ca.crt</p>
                        </div>
                      </div>
                      <Download size={14} className="text-amber-600 group-hover:scale-110 transition-transform" />
                    </a>
                  )}

                  {/* Client Certificate */}
                  {selectedRouter.ovpn_links.cert && (
                    <a
                      href={selectedRouter.ovpn_links.cert}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                          <FileText size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-admin-value">Client Certificate</p>
                          <p className="text-[10px] text-admin-dim font-mono">client.crt</p>
                        </div>
                      </div>
                      <Download size={14} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    </a>
                  )}

                  {/* Client Private Key */}
                  {selectedRouter.ovpn_links.key && (
                    <a
                      href={selectedRouter.ovpn_links.key}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                          <Key size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-admin-value">Client Key</p>
                          <p className="text-[10px] text-admin-dim font-mono">client.key</p>
                        </div>
                      </div>
                      <Download size={14} className="text-rose-600 group-hover:scale-110 transition-transform" />
                    </a>
                  )}

                  {/* Unified .OVPN Profile */}
                  {selectedRouter.ovpn_links.ovpn && (
                    <a
                      href={selectedRouter.ovpn_links.ovpn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <Download size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-admin-value">Full OVPN Profile</p>
                          <p className="text-[10px] text-admin-dim font-mono">client.ovpn</p>
                        </div>
                      </div>
                      <Download size={14} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Operational Actions */}
            <div className="pt-4 border-t border-pace-border">
              <button
                onClick={() => setIsInfoOpen(false)}
                className="w-full py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:text-admin-value hover:bg-pace-border/30 transition-all cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add MikroTik Router"
        description="Network IP and Ports are strictly allocated from the server (+1 increment pool) and cannot be manually modified."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-figtree">
          {/* Server Confirmation State Banner */}
          {isLoadingNextResources ? (
            <div className="flex items-center gap-2 p-3 bg-pace-purple/5 border border-pace-purple/20 rounded-xl text-xs text-pace-purple font-medium animate-pulse">
              <Sparkles size={15} /> Confirming next available IP & Ports from database pool...
            </div>
          ) : isResourcesConfirmed ? (
            <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Pool Confirmed: Next available network resources locked</span>
              </div>
              <button
                type="button"
                onClick={fetchAndConfirmResources}
                className="text-[10px] underline font-bold hover:text-emerald-800"
                title="Re-query server pool"
              >
                Re-check
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-700 font-medium">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} />
                <span>Failed to verify server pool</span>
              </div>
              <button
                type="button"
                onClick={fetchAndConfirmResources}
                className="text-[10px] underline font-bold"
              >
                Retry
              </button>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-admin-dim">MikroTik Router Name *</label>
            <input
              value={createForm.name}
              onChange={(e) => {
                const noSpace = e.target.value.replace(/\s+/g, '')
                setCreateForm(prev => ({ ...prev, name: noSpace }))
              }}
              placeholder="e.g. Node-Router-01 (no spaces)"
              className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
            />
          </div>

          {/* LOCKED / SERVER ALLOCATED VALUES */}
          <div className="p-3 bg-pace-bg-subtle/70 border border-pace-border rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-pace-border/60 pb-2">
              <div className="flex items-center gap-1.5 text-admin-dim text-xs font-bold">
                <Lock size={13} className="text-pace-purple" />
                <span>Auto-Allocated by Server (+1 Pool)</span>
              </div>
              {isLoadingNextResources ? (
                <div className="flex items-center gap-1.5 text-[10px] text-pace-purple font-semibold">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-pace-purple/30 border-t-pace-purple animate-spin" />
                  <span>Allocating pool...</span>
                </div>
              ) : isResourcesConfirmed ? (
                <span className="text-[10px] bg-pace-purple/10 text-pace-purple font-bold px-2 py-0.5 rounded-md">
                  Locked & Confirmed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={fetchAndConfirmResources}
                  className="text-[10px] text-red-500 hover:text-red-600 underline font-semibold"
                >
                  Retry Allocation
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-admin-dim block mb-1">
                  VPN Tunnel IP
                </label>
                {isLoadingNextResources ? (
                  <div className="h-[34px] w-full rounded-lg border border-pace-border bg-card-bg/60 animate-pulse flex items-center px-3">
                    <div className="h-2.5 w-20 bg-admin-dim/20 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      readOnly
                      disabled
                      value={createForm.ip_address || ''}
                      placeholder="—"
                      className="w-full px-3 py-2 rounded-lg border border-pace-border bg-card-bg text-xs font-bold text-admin-value font-mono opacity-80 cursor-not-allowed select-all"
                    />
                    <Lock size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-dim/60" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-admin-dim block mb-1">
                  Server Public IP
                </label>
                {isLoadingNextResources ? (
                  <div className="h-[34px] w-full rounded-lg border border-pace-border bg-card-bg/60 animate-pulse flex items-center px-3">
                    <div className="h-2.5 w-24 bg-admin-dim/20 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      readOnly
                      disabled
                      value={createForm.public_ip || '178.62.36.148'}
                      className="w-full px-3 py-2 rounded-lg border border-pace-border bg-card-bg text-xs font-bold text-admin-value font-mono opacity-80 cursor-not-allowed"
                    />
                    <Lock size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-dim/60" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-admin-dim block mb-1">
                  API Port
                </label>
                {isLoadingNextResources ? (
                  <div className="h-[34px] w-full rounded-lg border border-pace-border bg-card-bg/60 animate-pulse flex items-center px-3">
                    <div className="h-2.5 w-14 bg-admin-dim/20 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      readOnly
                      disabled
                      value={createForm.api_port || ''}
                      placeholder="—"
                      className="w-full px-3 py-2 rounded-lg border border-pace-border bg-card-bg text-xs font-bold text-admin-value font-mono opacity-80 cursor-not-allowed"
                    />
                    <Lock size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-dim/60" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-admin-dim block mb-1">
                  Winbox Port
                </label>
                {isLoadingNextResources ? (
                  <div className="h-[34px] w-full rounded-lg border border-pace-border bg-card-bg/60 animate-pulse flex items-center px-3">
                    <div className="h-2.5 w-14 bg-admin-dim/20 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      readOnly
                      disabled
                      value={createForm.winbox_port || ''}
                      placeholder="—"
                      className="w-full px-3 py-2 rounded-lg border border-pace-border bg-card-bg text-xs font-bold text-admin-value font-mono opacity-80 cursor-not-allowed"
                    />
                    <Lock size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-dim/60" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-admin-dim">API Username</label>
              <input
                value={createForm.username}
                onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="admin"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-admin-dim">API Password</label>
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
              <label className="text-xs font-semibold text-admin-dim">Hardware Model</label>
              <input
                value={createForm.model}
                onChange={(e) => setCreateForm(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g. CCR2004 / hEX"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-admin-dim mb-1 block">Owner / ISP</label>
              <IspAutocomplete
                value={createForm.isp_id}
                onChange={(selected) => setCreateForm(prev => ({ ...prev, isp_id: selected?.id || '' }))}
                isps={ispsList}
                placeholder="Search ISP..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-pace-border">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl text-xs font-semibold hover:text-admin-value hover:bg-pace-border/30 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSubmit}
              disabled={isSaving || isLoadingNextResources || !isResourcesConfirmed}
              className="px-5 py-2 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all disabled:opacity-50 shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{isSaving ? "Adding Router..." : "Add Router"}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Modify Router: ${editForm.name}`}
        description="Update network credentials, hardware model, or system owner mapping."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-figtree">
          <div>
            <label className="text-xs font-semibold text-admin-dim">MikroTik Name</label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. East Edge MikroTik 1"
              className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-admin-dim">API Username</label>
              <input
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Username"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-admin-dim">Change Password</label>
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
              <label className="text-xs font-semibold text-admin-dim">Hardware Model</label>
              <input
                value={editForm.model}
                onChange={(e) => setEditForm(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Model"
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-admin-dim mb-1 block">Owner / ISP</label>
              <IspAutocomplete
                value={editForm.isp_id}
                onChange={(selected) => setEditForm(prev => ({ ...prev, isp_id: selected?.id || '' }))}
                isps={ispsList}
                placeholder="Search ISP..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-admin-dim">Status Profile</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full mt-1.5 px-3 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all cursor-pointer"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-pace-border">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl text-xs font-semibold hover:text-admin-value hover:bg-pace-border/30 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSubmit}
              disabled={isSaving}
              className="px-5 py-2 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all disabled:opacity-50 shadow-sm cursor-pointer flex items-center gap-2"
            >
              {isSaving && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{isSaving ? "Saving..." : "Save Configuration"}</span>
            </button>
          </div>
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
