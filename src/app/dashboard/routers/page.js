"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Router as RouterIcon, Activity, RefreshCw, Power, Settings, ShieldCheck, Network, MoreVertical, List, Cpu, HardDrive, CpuIcon, Radio, Server, Clock } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, CardSkeleton, TableRowSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { routerService } from '@/services/isp/routers'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'

function RoutersContent() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [routers, setRouters] = useState([])
    const [search, setSearch] = useState('')

    const [selectedRouter, setSelectedRouter] = useState(null)
    const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false)
    const [systemInfoData, setSystemInfoData] = useState(null)
    const [isLoadingSystemInfo, setIsLoadingSystemInfo] = useState(false)

    const [pingingMap, setPingingMap] = useState({})
    const [rebootingRouterId, setRebootingRouterId] = useState(null)

    const pingSingleRouter = async (r, showToast = false) => {
        setPingingMap(prev => ({ ...prev, [r.id]: true }))
        try {
            const res = await routerService.pingRouter(r.id)
            if (res && res.status === 'success') {
                const isOnline = res.data?.status === 'online'
                const latency = res.data?.latency_ms || 12
                if (showToast) {
                    if (isOnline) {
                        toast.success(`${r.name} is ONLINE (${latency}ms latency)`)
                    } else {
                        toast.error(`${r.name} is OFFLINE: ${res.data?.error || 'Node unreachable'}`)
                    }
                }
                setRouters(prev => prev.map(item => item.id === r.id ? { 
                    ...item, 
                    status: isOnline ? 'Online' : 'Offline',
                    latency: isOnline ? latency : null,
                    pinging: false 
                } : item))
            } else {
                if (showToast) toast.error(res?.message || `Ping failed for ${r.name}`)
                setRouters(prev => prev.map(item => item.id === r.id ? { ...item, status: 'Offline', latency: null, pinging: false } : item))
            }
        } catch (err) {
            if (showToast) toast.error(`Connection test failed for ${r.name}`)
            setRouters(prev => prev.map(item => item.id === r.id ? { ...item, status: 'Offline', latency: null, pinging: false } : item))
        } finally {
            setPingingMap(prev => ({ ...prev, [r.id]: false }))
        }
    }

    const fetchRouters = async () => {
        setIsLoading(true)
        try {
            const res = await routerService.getRouters()
            if (res.status === 'success') {
                const list = (res.data || []).map(r => ({ ...r, pinging: true }))
                setRouters(list)
                setIsLoading(false)
                // Ping all routers live on load to verify reachability
                list.forEach(r => {
                    pingSingleRouter(r, false)
                })
            } else {
                throw new Error(res.message)
            }
        } catch (err) {
            console.warn("Failed to load routers:", err)
            toast.error("Failed to load network routers")
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRouters()
    }, [])

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
            console.warn("Telemetry fetch error:", e)
            setSystemInfoData(null)
        } finally {
            setIsLoadingSystemInfo(false)
        }
    }

    const handleOpenSystemInfo = (r) => {
        setSelectedRouter(r)
        setIsSystemInfoOpen(true)
        fetchLiveTelemetry(r.id)
    }

    const handlePing = async (r, e) => {
        if (e) e.stopPropagation()
        await pingSingleRouter(r, true)
        if (selectedRouter?.id === r.id) {
            fetchLiveTelemetry(r.id)
        }
    }

    const handleReboot = async (r, e) => {
        if (e) e.stopPropagation()
        if (!window.confirm(`Are you sure you want to reboot MikroTik node '${r.name}'? Active subscriber tunnels will temporarily disconnect.`)) {
            return
        }
        setRebootingRouterId(r.id)
        try {
            const res = await routerService.rebootRouter(r.id)
            if (res && res.status === 'success') {
                toast.success(res.message || `Reboot command sent to ${r.name}`)
                if (selectedRouter?.id === r.id) {
                    setIsSystemInfoOpen(false)
                }
            } else {
                toast.error(res?.message || `Failed to reboot ${r.name}`)
            }
        } catch (err) {
            toast.error(`Error sending reboot signal to ${r.name}`)
        } finally {
            setRebootingRouterId(null)
        }
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Routers</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Manage and monitor your assigned edge router infrastructure</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={fetchRouters}
                        disabled={isLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 text-xs font-semibold cursor-pointer"
                        title="Refresh routers"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        <span>Refresh Routers</span>
                    </button>
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
                                <th className="px-6 py-3">Router Name</th>
                                <th className="px-6 py-3">Hardware Model</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3">CPU Usage</th>
                                <th className="px-6 py-3">RAM Usage</th>
                                <th className="px-6 py-3 text-center">Subscribers</th>
                                <th className="px-6 py-3">Uptime</th>
                                <th className="px-6 py-3 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredRouters.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-24 text-center text-admin-dim text-sm font-medium">No routers found</td>
                                </tr>
                            ) : (
                                filteredRouters.map((r) => (
                                    <tr key={r.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                        <td className="px-6 py-3">
                                            <div 
                                                className="cursor-pointer group/node"
                                                onClick={() => handleOpenSystemInfo(r)}
                                            >
                                                <p className="text-xs font-semibold text-admin-value group-hover/node:text-pace-purple transition-colors">{r.name}</p>
                                                <p className="text-[10px] text-admin-dim font-mono">{r.ip}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-[11px] font-medium text-admin-dim uppercase tracking-tight">{r.model}</span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            {r.pinging || pingingMap[r.id] ? (
                                                <Badge variant="warning" className="text-[10px] font-medium inline-flex items-center gap-1.5 px-2 py-0.5">
                                                    <Activity size={11} className="animate-spin text-amber-500" />
                                                    <span>Pinging...</span>
                                                </Badge>
                                            ) : r.status === 'Online' ? (
                                                <Badge variant="success" className="text-[10px] font-medium inline-flex items-center gap-1.5 px-2 py-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span>Online {r.latency ? `(${r.latency}ms)` : ''}</span>
                                                </Badge>
                                            ) : (
                                                <Badge variant="error" className="text-[10px] font-medium inline-flex items-center gap-1.5 px-2 py-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    <span>Offline</span>
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3 w-28">
                                                <div className="flex-1 h-1.5 bg-pace-bg-subtle rounded-full overflow-hidden">
                                                    <div className={cn(
                                                        "h-full transition-all duration-1000",
                                                        parseInt(r.cpu) > 70 ? "bg-red-500" : parseInt(r.cpu) > 40 ? "bg-amber-500" : "bg-pace-purple"
                                                    )} style={{ width: `${parseInt(r.cpu) || 0}%` }} />
                                                </div>
                                                <span className="text-[10px] font-medium text-admin-value tabular-nums">{r.cpu}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3 w-28">
                                                <div className="flex-1 h-1.5 bg-pace-bg-subtle rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${parseInt(r.ram) || 0}%` }} />
                                                </div>
                                                <span className="text-[10px] font-medium text-admin-value tabular-nums">{r.ram}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-center text-xs font-medium text-admin-value tabular-nums">{r.subscribers}</td>
                                        <td className="px-6 py-3 text-xs font-medium text-pace-purple tabular-nums">{r.uptime}</td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end items-center gap-1.5">
                                                {/* Ping Button */}
                                                <button 
                                                    onClick={(e) => handlePing(r, e)}
                                                    disabled={pingingMap[r.id]}
                                                    className="p-2 text-admin-dim hover:text-emerald-600 hover:bg-emerald-500/10 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                                    title="Ping / Test Connection"
                                                >
                                                    <Activity size={14} className={pingingMap[r.id] ? "animate-spin text-emerald-600" : ""} />
                                                </button>

                                                {/* Emergency Reboot */}
                                                <button 
                                                    onClick={(e) => handleReboot(r, e)}
                                                    disabled={rebootingRouterId === r.id}
                                                    className="p-2 text-admin-dim hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                                    title="Remote Reboot Router"
                                                >
                                                    <Power size={14} className={rebootingRouterId === r.id ? "animate-spin text-rose-600" : ""} />
                                                </button>

                                                {/* Node Telemetry View */}
                                                <button 
                                                    onClick={() => handleOpenSystemInfo(r)}
                                                    className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-xl transition-all cursor-pointer"
                                                    title="View Hardware Telemetry"
                                                >
                                                    <Server size={14} />
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
                title={selectedRouter?.name || "Node Telemetry"}
                description={`Real-time hardware specifications and RouterOS health for ${selectedRouter?.name}`}
                maxWidth="max-w-md"
            >
                {selectedRouter && (
                    <div className="space-y-5 font-figtree">
                        {/* Quick Controls */}
                        <div className="flex items-center justify-between p-3.5 bg-pace-bg-subtle border border-pace-border rounded-xl">
                            <div>
                                <p className="text-xs font-bold text-admin-value">{selectedRouter.name}</p>
                                <p className="text-[10px] text-admin-dim font-mono">{selectedRouter.ip} • Port: {selectedRouter.port}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePing(selectedRouter)}
                                    disabled={pingingMap[selectedRouter.id]}
                                    className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                >
                                    <Activity size={12} className={pingingMap[selectedRouter.id] ? "animate-spin" : ""} />
                                    <span>{pingingMap[selectedRouter.id] ? "Pinging..." : "Ping"}</span>
                                </button>
                                <button
                                    onClick={() => handleReboot(selectedRouter)}
                                    disabled={rebootingRouterId === selectedRouter.id}
                                    className="px-2.5 py-1 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                >
                                    <Power size={12} className={rebootingRouterId === selectedRouter.id ? "animate-spin" : ""} />
                                    <span>Reboot</span>
                                </button>
                            </div>
                        </div>

                        {/* Live Telemetry Display */}
                        {isLoadingSystemInfo ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-xl space-y-2 animate-pulse h-24" />
                                <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-xl space-y-2 animate-pulse h-24" />
                            </div>
                        ) : systemInfoData ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 text-admin-dim">
                                            <CpuIcon size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">CPU Load</span>
                                        </div>
                                        <p className="text-2xl font-bold text-admin-value tabular-nums">{systemInfoData.cpuLoad || systemInfoData.cpu || 0}%</p>
                                        <div className="h-1 bg-pace-border rounded-full overflow-hidden">
                                            <div className="h-full bg-pace-purple" style={{ width: `${systemInfoData.cpuLoad || systemInfoData.cpu || 0}%` }} />
                                        </div>
                                        <p className="text-[9px] text-admin-dim">{systemInfoData.cpuCount || 1} Cores @ {systemInfoData.cpuFrequency || 0}MHz</p>
                                    </div>
                                    <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 text-admin-dim">
                                            <HardDrive size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">RAM Memory</span>
                                        </div>
                                        <p className="text-2xl font-bold text-admin-value tabular-nums">{systemInfoData.memoryUsage || '0%'}</p>
                                        <div className="h-1 bg-pace-border rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${systemInfoData.memoryUsage || '0%'}` }} />
                                        </div>
                                        <p className="text-[9px] text-admin-dim">{systemInfoData.usedMemory || '0 MB'} / {systemInfoData.totalMemory || '0 MB'}</p>
                                    </div>
                                </div>

                                <div className="space-y-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl p-4 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-admin-dim font-medium uppercase tracking-wider text-[9px]">Hardware Model</span>
                                        <span className="font-bold text-admin-value">{systemInfoData.boardName || selectedRouter.model}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-pace-border pt-2">
                                        <span className="text-admin-dim font-medium uppercase tracking-wider text-[9px]">RouterOS Version</span>
                                        <span className="font-bold text-pace-purple">v{systemInfoData.version || '7.x'} ({systemInfoData.architecture || 'arch'})</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-pace-border pt-2">
                                        <span className="text-admin-dim font-medium uppercase tracking-wider text-[9px]">Free Storage</span>
                                        <span className="font-bold text-admin-value">{systemInfoData.freeHdd || '0 MB'} / {systemInfoData.totalHdd || '0 MB'}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-pace-border pt-2">
                                        <span className="text-admin-dim font-medium uppercase tracking-wider text-[9px]">System Uptime</span>
                                        <span className="font-bold text-admin-value">{systemInfoData.uptime || selectedRouter.uptime}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-pace-border pt-2">
                                        <span className="text-admin-dim font-medium uppercase tracking-wider text-[9px]">Subscribers</span>
                                        <span className="font-bold text-admin-value">{selectedRouter.subscribers} Online</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center space-y-1">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Router Unreachable</p>
                                <p className="text-[11px] text-admin-dim">Could not query RouterOS API on {selectedRouter.ip}:{selectedRouter.port}. Check VPN tunnel.</p>
                            </div>
                        )}

                        <button 
                            onClick={() => setIsSystemInfoOpen(false)}
                            className="w-full bg-pace-purple text-white py-3 rounded-xl font-semibold text-xs hover:opacity-95 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center cursor-pointer"
                        >
                            Close Telemetry
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default function RoutersPage() {
    return (
        <Suspense fallback={<TablePageSkeleton />}>
            <RoutersContent />
        </Suspense>
    )
}
