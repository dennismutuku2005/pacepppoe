"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Router as RouterIcon, Activity, RefreshCw, Power, Settings, ShieldCheck, Network, MoreVertical, List } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, CardSkeleton, TableRowSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { mockRouters } from '@/services/mockData'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'
import { Cpu, HardDrive, CpuIcon } from 'lucide-react'

function RoutersContent() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [routers, setRouters] = useState([])
    const [search, setSearch] = useState('')

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedRouter, setSelectedRouter] = useState(null)
    const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setRouters(mockRouters)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleOpenSystemInfo = (r) => {
        setSelectedRouter(r)
        setIsSystemInfoOpen(true)
    }

    const handleReboot = (name) => {
        toast.promise(new Promise(res => setTimeout(res, 2000)), {
            loading: `Rebooting ${name}...`,
            success: 'Reboot signal sent successfully.',
            error: 'Failed to communicate with node.',
        });
    }

    const filteredRouters = routers.filter(r =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.ip?.includes(search)
    )

    if (isLoading) {
        return <TablePageSkeleton />
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree text-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Routers</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Manage and monitor your network infrastructure</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search routers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* List View Only */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-3">Node Identity</th>
                                <th className="px-6 py-3">Hardware Model</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3">CPU Usage</th>
                                <th className="px-6 py-3">RAM Usage</th>
                                <th className="px-6 py-3 text-center">Sessions</th>
                                <th className="px-6 py-3">Uptime</th>
                                <th className="px-6 py-3 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredRouters.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim text-sm font-medium">No routers found</td>
                                </tr>
                            ) : (
                                filteredRouters.map((r) => (
                                    <tr key={r.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                        <td className="px-6 py-2">
                                            <div 
                                                className="cursor-pointer group/node"
                                                onClick={() => router.push(`/dashboard/routers/details?id=${r.id}`)}
                                            >
                                                <p className="text-xs font-medium text-admin-value group-hover/node:text-pace-purple transition-colors">{r.name}</p>
                                                <p className="text-[10px] text-admin-dim font-mono">{r.ip}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2">
                                            <span className="text-[11px] font-medium text-admin-dim uppercase tracking-tight">{r.model}</span>
                                        </td>
                                        <td className="px-6 py-2 text-center">
                                            <Badge variant={r.status === 'online' ? 'success' : 'error'} className="text-[8px] font-black border-none px-2 py-0.5 uppercase tracking-widest">
                                                {r.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex items-center gap-3 w-28">
                                                <div className="flex-1 h-1.5 bg-pace-bg-subtle rounded-full overflow-hidden">
                                                    <div className={cn(
                                                        "h-full transition-all duration-1000",
                                                        r.cpu > 70 ? "bg-red-500" : r.cpu > 40 ? "bg-amber-500" : "bg-pace-purple"
                                                    )} style={{ width: `${r.cpu}%` }} />
                                                </div>
                                                <span className="text-[10px] font-medium text-admin-value tabular-nums">{r.cpu}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex items-center gap-3 w-28">
                                                <div className="flex-1 h-1.5 bg-pace-bg-subtle rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${r.ram}%` }} />
                                                </div>
                                                <span className="text-[10px] font-medium text-admin-value tabular-nums">{r.ram}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 text-center text-xs font-medium text-admin-value tabular-nums">{r.users}</td>
                                        <td className="px-6 py-2 text-xs font-medium text-pace-purple tabular-nums">{r.uptime}</td>
                                        <td className="px-6 py-2 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleReboot(r.name)}
                                                    className="p-2 text-admin-dim hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-90"
                                                    title="Emergency Reboot"
                                                >
                                                    <Power size={14} />
                                                </button>
                                                <button className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-xl transition-all active:scale-90">
                                                    <Settings size={14} />
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

            {/* System Info Modal */}
            <Modal
                isOpen={isSystemInfoOpen}
                onClose={() => setIsSystemInfoOpen(false)}
                title="Node System Identity"
                description={`Hardware specifications and performance metrics for ${selectedRouter?.name}`}
                maxWidth="max-w-md"
            >
                {selectedRouter && (
                    <div className="space-y-6 font-figtree">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-admin-dim">
                                    <CpuIcon size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">CPU Load</span>
                                </div>
                                <p className="text-2xl font-bold text-admin-value tabular-nums">{selectedRouter.cpu}%</p>
                                <div className="h-1 bg-pace-border rounded-full overflow-hidden">
                                    <div className="h-full bg-pace-purple" style={{ width: `${selectedRouter.cpu}%` }} />
                                </div>
                            </div>
                            <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-admin-dim">
                                    <HardDrive size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">RAM Memory</span>
                                </div>
                                <p className="text-2xl font-bold text-admin-value tabular-nums">{selectedRouter.ram}%</p>
                                <div className="h-1 bg-pace-border rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${selectedRouter.ram}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 bg-pace-bg-subtle border border-pace-border rounded-xl p-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-admin-dim font-medium uppercase tracking-wider text-[9px]">Model Identifier</span>
                                <span className="font-bold text-admin-value">{selectedRouter.model}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-pace-border pt-3">
                                <span className="text-admin-dim font-medium uppercase tracking-wider text-[9px]">Management IP</span>
                                <span className="font-mono font-bold text-pace-purple">{selectedRouter.ip}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-pace-border pt-3">
                                <span className="text-admin-dim font-medium uppercase tracking-wider text-[9px]">System Uptime</span>
                                <span className="font-bold text-admin-value">{selectedRouter.uptime}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-pace-border pt-3">
                                <span className="text-admin-dim font-medium uppercase tracking-wider text-[9px]">Active Sessions</span>
                                <span className="font-bold text-admin-value">{selectedRouter.users} Subscribers</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsSystemInfoOpen(false)}
                            className="w-full bg-pace-purple text-white py-3.5 rounded-xl font-medium text-sm hover:opacity-95 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center"
                        >
                            Dismiss Identity
                        </button>
                    </div>
                )}
            </Modal>

            {/* Add Router Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Authorize Network Node"
                description="Establish a secure connection with a new MikroTik or Ubiquiti router."
                maxWidth="max-w-md"
            >
                <div className="space-y-4 font-figtree">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Node Label</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-pace-border bg-pace-bg-subtle focus:bg-white focus:border-pace-purple outline-none transition-all font-medium text-admin-value" placeholder="e.g. West-Station-01" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Management IP</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-pace-border bg-pace-bg-subtle focus:bg-white focus:border-pace-purple outline-none transition-all font-mono font-bold text-admin-value" placeholder="192.168.x.x" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">API Username</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-pace-border bg-pace-bg-subtle focus:bg-white focus:border-pace-purple outline-none transition-all font-medium text-admin-value" placeholder="admin" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">API Password</label>
                            <input type="password" className="w-full px-4 py-3 rounded-xl border border-pace-border bg-pace-bg-subtle focus:bg-white focus:border-pace-purple outline-none transition-all font-medium text-admin-value" placeholder="••••••••" />
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            toast.success("Node Initialized", { description: "Infrastructure handshake completed successfully." });
                            setIsAddModalOpen(false);
                        }}
                        className="w-full bg-pace-purple text-white py-3.5 rounded-xl font-medium text-sm hover:opacity-95 transition-all active:scale-[0.98] mt-4 shadow-sm flex items-center justify-center gap-2"
                    >
                        <ShieldCheck size={18} />
                        Authorize Connection
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default function RoutersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Syncing infrastructure...</div>}>
            <RoutersContent />
        </Suspense>
    )
}
