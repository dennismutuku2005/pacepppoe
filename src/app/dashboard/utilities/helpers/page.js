"use client"

import React, { useState, useEffect } from 'react'
import {
    Trash2,
    RefreshCw,
    Network,
    HardDrive,
    Zap,
    Cookie,
    Radio,
    ShieldAlert,
    Clock,
    CheckCircle2,
    ChevronRight,
    Activity,
    Settings,
    LayoutGrid,
    Search,
    Wind,
    Eraser,
    Power,
    Loader2,
    Server
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { routerService } from '@/services/routers'
import { Skeleton } from '@/components/Skeleton'
import { Modal } from '@/components/Modal'

const HELPERS = [
    {
        id: 'h1',
        name: 'Flush DNS Cache',
        description: 'Clear all cached DNS entries to resolve routing and connection issues.',
        icon: Wind,
        color: 'bg-emerald-500',
        action: 'Flushing'
    },
    {
        id: 'h2',
        name: 'Clean Cookies',
        description: 'Wipe session tokens and browser footprint stored on the router gateway.',
        icon: Cookie,
        color: 'bg-amber-500',
        action: 'Cleaning'
    },
    {
        id: 'h3',
        name: 'Renew DHCP Lease',
        description: 'Force a renewal of IP assignments for all currently connected clients.',
        icon: Radio,
        color: 'bg-blue-500',
        action: 'Renewing'
    },
    {
        id: 'h4',
        name: 'Optimize Storage',
        description: 'Defragment and compress log files to reclaim system disk space.',
        icon: HardDrive,
        color: 'bg-purple-500',
        action: 'Optimizing'
    },
    {
        id: 'h5',
        name: 'Restart Queues',
        description: 'Kill and restart all bottleneck management queues for traffic smoothing.',
        icon: Zap,
        color: 'bg-red-500',
        action: 'Restarting'
    },
    {
        id: 'h6',
        name: 'Reset Counters',
        description: 'Zero out the interface traffic and uptime counters for a fresh baseline.',
        icon: Activity,
        color: 'bg-teal-500',
        action: 'Resetting'
    },
    {
        id: 'h7',
        name: 'Clear ARP Table',
        description: 'Force the router to rebuild the Address Resolution Protocol mapping.',
        icon: Eraser,
        color: 'bg-indigo-500',
        action: 'Clearing'
    },
    {
        id: 'h8',
        name: 'Hard Reboot',
        description: 'Trigger an immediate system power cycle. WARNING: Will cause downtime.',
        icon: Power,
        color: 'bg-rose-500',
        action: 'Rebooting',
        dangerous: true
    }
]

export default function HelpersPage() {
    const [runningId, setRunningId] = useState(null)
    const [search, setSearch] = useState('')
    const [routers, setRouters] = useState([])
    const [selectedRouterId, setSelectedRouterId] = useState('')
    const [loading, setLoading] = useState(true)
    const [routersLoading, setRoutersLoading] = useState(true)
    const [showRouterModal, setShowRouterModal] = useState(null) // Helper for the router selection modal

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800)
        fetchRouters()
        return () => clearTimeout(timer)
    }, [])

    const fetchRouters = async () => {
        try {
            const res = await routerService.getRouters({ limit: 100 })
            if (res.status === 'success') {
                setRouters(res.data || [])
            }
        } catch (err) {
            console.error("Failed to load routers", err)
        } finally {
            setRoutersLoading(false)
        }
    }

    const handleAction = (helper, routerId) => {
        if (!routerId) {
            setShowRouterModal(helper)
            return
        }

        setRunningId(helper.id)
        setShowRouterModal(null)
        toast.info(`${helper.action} ${helper.name.toLowerCase()} on node...`)

        // Simulate API call
        setTimeout(() => {
            setRunningId(null)
            toast.success(`${helper.name} process completed successfully.`)
        }, 2000)
    }

    const filtered = HELPERS.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.description.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return (
            <div className="space-y-8 font-figtree pb-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-pace-border pb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48 rounded-lg" />
                        <Skeleton className="h-3 w-72 rounded-lg opacity-50" />
                    </div>
                    <Skeleton className="h-10 w-80 rounded-xl" />
                </div>
                <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                    {/* Header Skeleton */}
                    <div className="bg-pace-bg-subtle/50 border-b border-pace-border px-6 py-4 flex justify-between">
                        <Skeleton className="h-3 w-24 rounded opaticy-20" />
                        <Skeleton className="h-3 w-48 rounded opaticy-20" />
                        <Skeleton className="h-3 w-16 rounded opaticy-20" />
                        <Skeleton className="h-3 w-16 rounded opaticy-20" />
                    </div>
                    <div className="divide-y divide-pace-border">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                    <Skeleton className="h-4 w-32 rounded" />
                                </div>
                                <Skeleton className="h-3 w-48 rounded opacity-50" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-8 w-16 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 font-figtree pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-pace-border pb-8">
                <div>
                    <h1 className="text-xl font-semibold text-pace-purple leading-tight tracking-tight uppercase">System Helpers</h1>
                    <p className="text-[10px] text-admin-dim mt-0.5 font-medium uppercase tracking-widest">
                        Quick-access maintenance tools for optimizing microtik router performance.
                    </p>
                </div>
                <div className="relative group min-w-[320px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Quick Tools..."
                        className="w-full pl-9 pr-5 py-2.5 border border-pace-border rounded-xl text-[10px] font-medium uppercase bg-pace-bg-subtle text-admin-value focus:outline-none focus:ring-4 focus:ring-pace-purple/5 focus:border-pace-purple placeholder:text-admin-dim/40 shadow-sm transition-all"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Router selector removed from header */}
                </div>
            </div>

            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap text-[11px]">
                        <thead className="bg-pace-bg-subtle/50 border-b border-pace-border font-semibold text-admin-dim uppercase tracking-widest text-[9px]">
                            <tr>
                                <th className="px-6 py-4">Helper Tool</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filtered.map((helper) => {
                                const active = runningId === helper.id;
                                return (
                                    <tr key={helper.id} className="hover:bg-pace-bg-subtle transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg bg-pace-bg-subtle border border-pace-border flex items-center justify-center transition-all group-hover:border-pace-purple/30 group-hover:bg-pace-purple/5",
                                                    active && "animate-spin border-pace-purple/50 bg-pace-purple/10"
                                                )}>
                                                    <helper.icon size={14} className={cn("text-admin-dim group-hover:text-pace-purple transition-colors", active && "text-pace-purple")} />
                                                </div>
                                                <p className="font-semibold text-admin-value uppercase tracking-tight text-[10px]">{helper.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] text-admin-dim font-medium uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity whitespace-normal line-clamp-1">
                                                {helper.description}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {active ? (
                                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[8px] font-semibold uppercase tracking-widest border border-emerald-500/10">
                                                    <Loader2 size={10} className="animate-spin" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="text-[9px] text-admin-dim font-medium uppercase tracking-widest opacity-50 italic">Standby</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleAction(helper)}
                                                disabled={runningId !== null}
                                                className={cn(
                                                    "inline-flex items-center justify-center w-16 px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-[0.05em] transition-all",
                                                    active
                                                        ? "bg-pace-purple text-white shadow-md shadow-pace-purple/10 cursor-wait"
                                                        : helper.dangerous
                                                            ? "bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/20"
                                                            : "bg-pace-bg-subtle text-admin-value hover:bg-pace-purple hover:text-white border border-pace-border"
                                                )}
                                            >
                                                {active ? <Loader2 size={10} className="animate-spin" /> : "Run"}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {!loading && filtered.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center text-center px-10 border border-dashed border-pace-border rounded-xl bg-pace-bg-subtle/30">
                    <div className="w-16 h-16 bg-pace-bg-subtle rounded-xl flex items-center justify-center mb-6 border border-pace-border">
                        <LayoutGrid size={32} className="text-admin-dim opacity-30" />
                    </div>
                    <h3 className="text-[13px] font-semibold text-admin-value uppercase tracking-widest leading-none">Tool Search Failure</h3>
                    <p className="text-[10px] text-admin-dim mt-2 uppercase font-medium tracking-widest">System library does not contain a helper matching your query.</p>
                </div>
            )}

            {/* Router Selection Modal */}
            <Modal
                isOpen={!!showRouterModal}
                onClose={() => setShowRouterModal(null)}
                title="Select Target Node"
                description={`Choose a router to run ${showRouterModal?.name}`}
                maxWidth="max-w-[450px]"
            >
                <div className="space-y-4 py-2">
                    {routersLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {routers.map(router => (
                                <button
                                    key={router.id}
                                    onClick={() => handleAction(showRouterModal, router.id)}
                                    className="flex items-center justify-between p-4 bg-pace-bg-subtle border border-pace-border rounded-xl hover:border-pace-purple hover:bg-pace-purple/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white rounded-lg border border-pace-border group-hover:border-pace-purple/20 transition-colors">
                                            <Server size={18} className="text-pace-purple" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-semibold text-admin-value uppercase tracking-tight">{router.router_name}</p>
                                            <p className="text-[10px] text-admin-dim font-medium uppercase tracking-widest">{router.ip_address}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-admin-dim group-hover:text-pace-purple transition-colors" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}
