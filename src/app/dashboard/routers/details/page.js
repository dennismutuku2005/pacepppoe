"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
    Router as RouterIcon, Cpu, HardDrive, Users, Clock, 
    RefreshCw, Power, Settings, ShieldCheck,
    Activity, Globe, Layers, Network, List, ArrowUpRight, ArrowDownRight, Radio, Server
} from 'lucide-react'
import { Badge } from '@/components/Badge'
import { routerService } from '@/services/isp/routers'
import { toast } from 'sonner'
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer 
} from 'recharts'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const performanceData = [
    { time: '10:00', cpu: 12, traffic: 45, users: 120 },
    { time: '10:05', cpu: 25, traffic: 52, users: 122 },
    { time: '10:10', cpu: 18, traffic: 48, users: 125 },
    { time: '10:15', cpu: 45, traffic: 80, users: 128 },
    { time: '10:20', cpu: 32, traffic: 65, users: 130 },
    { time: '10:25', cpu: 28, traffic: 58, users: 132 },
    { time: '10:30', cpu: 35, traffic: 70, users: 135 },
]

function RouterDetailsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const id = searchParams.get('id')
    
    const [node, setNode] = useState(null)
    const [telemetry, setTelemetry] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [latency, setLatency] = useState(null)

    const runPing = async (targetNode, showToast = false) => {
        if (!targetNode) return
        setIsPinging(true)
        try {
            const res = await routerService.pingRouter(targetNode.id)
            if (res && res.status === 'success') {
                const isOnline = res.data?.status === 'online'
                const lat = res.data?.latency_ms || 12
                setLatency(isOnline ? lat : null)
                setNode(prev => prev ? { ...prev, status: isOnline ? 'Online' : 'Offline' } : prev)
                if (showToast) {
                    if (isOnline) {
                        toast.success(`${targetNode.name} is ONLINE (${lat}ms latency)`)
                    } else {
                        toast.error(`${targetNode.name} is OFFLINE: ${res.data?.error || 'Node unreachable'}`)
                    }
                }
                if (isOnline && res.data?.system) {
                    setTelemetry(res.data.system)
                }
            } else {
                setNode(prev => prev ? { ...prev, status: 'Offline' } : prev)
                setLatency(null)
                if (showToast) toast.error(res?.message || "Ping failed")
            }
        } catch (e) {
            setNode(prev => prev ? { ...prev, status: 'Offline' } : prev)
            setLatency(null)
            if (showToast) toast.error("Connection test failed")
        } finally {
            setIsPinging(false)
        }
    }

    const fetchNodeData = async () => {
        if (!id) {
            router.push('/dashboard/routers')
            return
        }
        setIsLoading(true)
        try {
            const res = await routerService.getRouterDetails(id)
            if (res.status === 'success' && res.data) {
                setNode(res.data)
                setIsLoading(false)
                // Trigger live reachability ping on load
                runPing(res.data, false)
                // Also fetch live telemetry
                try {
                    const teleRes = await routerService.getSystemInfo(id)
                    if (teleRes && teleRes.status === 'success' && teleRes.data) {
                        setTelemetry(teleRes.data)
                    }
                } catch (e) {
                    console.warn("Could not query telemetry:", e)
                }
            } else {
                setIsLoading(false)
                toast.error(res.message || "Failed to load router details")
            }
        } catch (e) {
            setIsLoading(false)
            console.error("Error fetching router:", e)
            toast.error("Network error loading router")
        }
    }

    useEffect(() => {
        fetchNodeData()
    }, [id])

    const handlePing = async () => {
        if (!node) return
        await runPing(node, true)
    }

    const handleReboot = async () => {
        if (!node) return
        if (!window.confirm(`Are you sure you want to reboot '${node.name}'? Active subscriber tunnels will temporarily restart.`)) {
            return
        }
        setIsRebooting(true)
        try {
            const res = await routerService.rebootRouter(node.id)
            if (res && res.status === 'success') {
                toast.success(res.message || `Reboot command sent to ${node.name}`)
                setTimeout(() => runPing(node, false), 5000)
            } else {
                toast.error(res?.message || "Failed to reboot router")
            }
        } catch (e) {
            toast.error("Error sending reboot command")
        } finally {
            setIsRebooting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-pace-purple border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-admin-dim uppercase tracking-widest animate-pulse">Pinging Router and Loading Telemetry...</p>
                </div>
            </div>
        )
    }

    if (!node) {
        return (
            <div className="text-center py-20">
                <p className="text-sm text-admin-dim">Router not found.</p>
                <button onClick={() => router.push('/dashboard/routers')} className="mt-4 px-4 py-2 bg-pace-purple text-white rounded-xl text-xs font-semibold">
                    Back to Routers
                </button>
            </div>
        )
    }

    const cpuVal = telemetry?.cpuLoad || telemetry?.cpu || node.cpu || '0%'
    const ramVal = telemetry?.memoryUsage || node.ram || '0%'
    const uptimeVal = telemetry?.uptime || node.uptime || 'N/A'
    const modelVal = telemetry?.boardName || node.model || 'MikroTik'

    return (
        <div className="space-y-6 animate-in fade-in duration-700 font-figtree pb-20">
            {/* Premium Header */}
            <div className="relative rounded-3xl overflow-hidden bg-[#501DAA] h-64 sm:h-72 shadow-xl shadow-pace-purple/10">
                <Image 
                    src="/sidesvg.svg" 
                    alt="Network Pattern" 
                    fill
                    className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#501DAA] via-transparent to-black/10" />
                
                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">{node.name}</h1>
                                    {isPinging ? (
                                        <Badge variant="warning" className="text-[10px] font-medium inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                            <Activity size={11} className="animate-spin text-amber-400" />
                                            <span>Pinging...</span>
                                        </Badge>
                                    ) : (node.status === 'Online' || node.status === 'online') ? (
                                        <Badge variant="success" className="text-[10px] font-medium inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <span>Online {latency ? `(${latency}ms)` : ''}</span>
                                        </Badge>
                                    ) : (
                                        <Badge variant="error" className="text-[10px] font-medium inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                            <span>Offline</span>
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-white/70 text-sm font-medium">
                                    <span className="flex items-center gap-1.5">{node.ip}:{node.port}</span>
                                    <span className="flex items-center gap-1.5">{modelVal}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                            <button 
                                onClick={handlePing}
                                disabled={isPinging}
                                className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#501DAA] rounded-xl text-xs font-bold shadow-lg hover:bg-opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Activity size={14} className={isPinging ? "animate-spin" : ""} />
                                <span>{isPinging ? "Pinging Node..." : "Ping / Sync Node"}</span>
                            </button>
                            <button 
                                onClick={handleReboot}
                                disabled={isRebooting}
                                className="w-full sm:w-auto px-4 py-2.5 bg-red-500/90 text-white rounded-xl shadow-lg hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
                            >
                                <Power size={14} className={isRebooting ? "animate-spin" : ""} />
                                <span>{isRebooting ? "Rebooting..." : "Emergency Reboot"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'CPU Load', value: `${cpuVal}`, icon: Cpu, color: 'text-pace-purple', bg: 'bg-pace-purple/5', sub: telemetry ? `${telemetry.cpuCount || 1} Cores @ ${telemetry.cpuFrequency || 0}MHz` : 'Telemetry' },
                    { label: 'RAM Memory', value: `${ramVal}`, icon: HardDrive, color: 'text-blue-500', bg: 'bg-blue-500/5', sub: telemetry ? `${telemetry.usedMemory || ''} / ${telemetry.totalMemory || ''}` : 'Memory' },
                    { label: 'Subscribers', value: node.activeSubscribers || node.subscribers || 0, icon: Users, color: 'text-green-500', bg: 'bg-green-500/5', sub: 'Assigned accounts' },
                    { label: 'System Uptime', value: uptimeVal, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/5', sub: 'Live connection' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-pace-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div className={cn("p-2 rounded-xl transition-colors", stat.bg)}>
                                <stat.icon className={stat.color} size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Real-time</span>
                        </div>
                        <h3 className="text-xl font-bold text-admin-value tracking-tight">{stat.value}</h3>
                        <p className="text-xs font-medium text-admin-dim mt-0.5">{stat.label}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Performance */}
                <div className="lg:col-span-2 bg-white border border-pace-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-admin-value">Traffic & Load Performance</h3>
                            <p className="text-[10px] text-admin-dim font-medium uppercase tracking-wider mt-1">Live telemetry streaming</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-pace-purple" />
                                <span className="text-[10px] font-bold text-admin-dim uppercase">Throughput</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="time" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        borderRadius: '12px', 
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px'
                                    }} 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="traffic" 
                                    stroke="#6366f1" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorTraffic)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Node Identity Details */}
                <div className="bg-white border border-pace-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-admin-value mb-5 flex items-center gap-2">
                            <Server size={16} className="text-pace-purple" />
                            <span>Hardware Identity</span>
                        </h3>
                        
                        <div className="space-y-3.5">
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-pace-border">
                                <span className="text-admin-dim">Board Model</span>
                                <span className="font-bold text-admin-value">{modelVal}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-pace-border">
                                <span className="text-admin-dim">OS Version</span>
                                <span className="font-bold text-pace-purple">v{telemetry?.version || '7.x'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-pace-border">
                                <span className="text-admin-dim">Architecture</span>
                                <span className="font-mono font-semibold text-admin-value">{telemetry?.architecture || 'RouterOS'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-pace-border">
                                <span className="text-admin-dim">Free Storage</span>
                                <span className="font-bold text-admin-value">{telemetry?.freeHdd || 'N/A'} / {telemetry?.totalHdd || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-admin-dim">API Service Port</span>
                                <span className="font-mono font-bold text-admin-value">{node.port}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={handlePing}
                            disabled={isPinging}
                            className="w-full py-2.5 bg-pace-bg-subtle text-admin-value border border-pace-border rounded-xl text-xs font-semibold hover:bg-pace-purple/5 hover:text-pace-purple transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw size={13} className={isPinging ? "animate-spin" : ""} />
                            <span>{isPinging ? "Refreshing..." : "Re-query Telemetry"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function RouterDetailsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim">Loading node telemetry...</div>}>
            <RouterDetailsContent />
        </Suspense>
    )
}
