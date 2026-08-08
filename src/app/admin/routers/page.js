"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Search, Power, Settings, RefreshCw, Cpu, HardDrive, Users } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { mockRouters } from '@/services/mockData'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminRoutersPage() {
  const [routers, setRouters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRouter, setSelectedRouter] = useState(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newNodeName, setNewNodeName] = useState('')
  const [newNodeIp, setNewNodeIp] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setRouters(mockRouters)
      setIsLoading(false)
    }, 700)
    return () => clearTimeout(timer)
  }, [])

  const filteredRouters = routers.filter((router) =>
    router.name.toLowerCase().includes(search.toLowerCase()) ||
    router.ip.includes(search) ||
    router.model.toLowerCase().includes(search.toLowerCase())
  )

  const openRouterInfo = (router) => {
    setSelectedRouter(router)
    setIsInfoOpen(true)
  }

  const handleReboot = (name) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1300)),
      {
        loading: `Sending reboot command to ${name}...`,
        success: `Reboot command queued for ${name}.`,
        error: `Failed to queue reboot for ${name}.`
      }
    )
  }

  const handleAddNode = () => {
    if (!newNodeName || !newNodeIp) {
      toast.error('Provide node label and IP address before authorizing.')
      return
    }
    setRouters((current) => [
      ...current,
      {
        id: Date.now(),
        name: newNodeName,
        ip: newNodeIp,
        status: 'online',
        users: 0,
        uptime: '0d 0h',
        model: 'MikroTik RB3011',
        cpu: 0,
        ram: 0
      }
    ])
    toast.success('Node authorized successfully.', {
      description: `Node ${newNodeName} is now approved for monitoring.`
    })
    setNewNodeName('')
    setNewNodeIp('')
    setIsAddOpen(false)
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">Router Infrastructure</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Provision and monitor edge routers for ISP traffic.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all"
        >
          <Plus size={16} /> Authorize Node
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routers..."
            className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
          />
        </div>
      </div>

      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-3">Node</th>
                <th className="px-6 py-3">Model</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">CPU</th>
                <th className="px-6 py-3">RAM</th>
                <th className="px-6 py-3">Users</th>
                <th className="px-6 py-3">Uptime</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-admin-dim text-sm">Loading router inventory...</td>
                </tr>
              ) : filteredRouters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-admin-dim text-sm">No routers match the search.</td>
                </tr>
              ) : (
                filteredRouters.map((routerItem) => (
                  <tr key={routerItem.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200">
                    <td className="px-6 py-3">
                      <div className="text-xs font-semibold text-admin-value">{routerItem.name}</div>
                      <div className="text-[10px] text-admin-dim font-mono mt-1">{routerItem.ip}</div>
                    </td>
                    <td className="px-6 py-3 text-[11px] text-admin-dim uppercase tracking-tight">{routerItem.model}</td>
                    <td className="px-6 py-3">
                      <Badge variant={routerItem.status === 'online' ? 'success' : 'error'} className="text-[9px] font-black border-none px-2 py-0.5 uppercase">
                        {routerItem.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 w-24">
                        <div className="flex-1 h-1.5 bg-pace-bg-subtle rounded-full overflow-hidden">
                          <div className={cn(
                            'h-full transition-all duration-700',
                            routerItem.cpu > 70 ? 'bg-rose-500' : routerItem.cpu > 40 ? 'bg-amber-500' : 'bg-pace-purple'
                          )} style={{ width: `${routerItem.cpu}%` }} />
                        </div>
                        <span className="text-[10px] font-semibold text-admin-value tabular-nums">{routerItem.cpu}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 w-24">
                        <div className="flex-1 h-1.5 bg-pace-bg-subtle rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${routerItem.ram}%` }} />
                        </div>
                        <span className="text-[10px] font-semibold text-admin-value tabular-nums">{routerItem.ram}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center text-xs font-medium text-admin-value">{routerItem.users}</td>
                    <td className="px-6 py-3 text-xs font-semibold text-pace-purple">{routerItem.uptime}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openRouterInfo(routerItem)}
                          className="p-2 text-admin-dim hover:bg-pace-bg-subtle rounded-xl transition-all"
                          title="View Info"
                        >
                          <Settings size={14} />
                        </button>
                        <button
                          onClick={() => handleReboot(routerItem.name)}
                          className="p-2 text-admin-dim hover:bg-pace-bg-subtle rounded-xl transition-all"
                          title="Reboot"
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

      <Modal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title={selectedRouter?.name || 'Router Info'}
        description="Hardware and connectivity details for this node."
        maxWidth="max-w-xl"
      >
        {selectedRouter && (
          <div className="space-y-5 font-figtree">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'IP Address', value: selectedRouter.ip },
                { label: 'Model', value: selectedRouter.model },
                { label: 'Status', value: selectedRouter.status },
                { label: 'Uptime', value: selectedRouter.uptime }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-pace-border bg-pace-bg-subtle p-4">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-admin-dim font-semibold mb-2">{item.label}</p>
                  <p className="text-sm font-semibold text-admin-value">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-pace-border bg-pace-bg-subtle p-4">
                <p className="text-[10px] uppercase tracking-[0.35em] text-admin-dim font-semibold mb-2">CPU Load</p>
                <p className="text-2xl font-bold text-admin-value tabular-nums">{selectedRouter.cpu}%</p>
              </div>
              <div className="rounded-2xl border border-pace-border bg-pace-bg-subtle p-4">
                <p className="text-[10px] uppercase tracking-[0.35em] text-admin-dim font-semibold mb-2">RAM Used</p>
                <p className="text-2xl font-bold text-admin-value tabular-nums">{selectedRouter.ram}%</p>
              </div>
            </div>

            <button
              onClick={() => setIsInfoOpen(false)}
              className="w-full bg-pace-purple text-white py-3 rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Authorize New Node"
        description="Register a new router and add it to the admin inventory."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-figtree">
          <div>
            <label className="text-[10px] uppercase tracking-[0.35em] text-admin-dim font-semibold">Node Label</label>
            <input
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              placeholder="e.g. East Tower 2"
              className="w-full mt-2 px-4 py-3 rounded-2xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.35em] text-admin-dim font-semibold">IP Address</label>
            <input
              value={newNodeIp}
              onChange={(e) => setNewNodeIp(e.target.value)}
              placeholder="192.168.50.1"
              className="w-full mt-2 px-4 py-3 rounded-2xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all"
            />
          </div>
          <button
            onClick={handleAddNode}
            className="w-full bg-pace-purple text-white py-3 rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all"
          >
            Authorize Node
          </button>
        </div>
      </Modal>
    </div>
  )
}
