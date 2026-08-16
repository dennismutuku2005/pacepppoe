"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
    Router as RouterIcon, Cpu, HardDrive, Users, Clock, 
    ChevronLeft, RefreshCw, Power, Settings, ShieldCheck,
    Activity, Globe, Zap, Network, List, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { Badge } from '@/components/Badge'
import { mockRouters, mockCustomers } from '@/services/mockData'
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, LineChart, Line 
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
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!id) {
            router.push('/dashboard/routers')
            return
        }

        // Simulate API fetch
        const timer = setTimeout(() => {
            const foundNode = mockRouters.find(r => r.id === parseInt(id)) || mockRouters[0]
            setNode(foundNode)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [id, router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-pace-purple border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-admin-dim uppercase tracking-widest animate-pulse">Establishing Node Handshake...</p>
                </div>
            </div>
        )
    }

    const nodeSubscribers = mockCustomers.filter(c => c.router === node.name)

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
                
                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-fit"
                    >
                        <ChevronLeft size={20} />
                        <span className="text-sm font-medium">Back to Infrastructure</span>
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">{node.name}</h1>
                                    <Badge className="bg-green-500/20 text-green-400 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                                        {node.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-white/70 text-sm font-medium">
                                    <span className="flex items-center gap-1.5">{node.ip}</span>
                                    <span className="flex items-center gap-1.5">{node.model}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="px-5 py-2.5 bg-white text-[#501DAA] rounded-xl text-sm font-bold shadow-lg hover:bg-opacity-90 transition-all active:scale-95 flex items-center gap-2">
                                <RefreshCw size={16} />
                                Synchronize
                            </button>
                            <button className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-all active:scale-95">
                                <Power size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'CPU Load', value: `${node.cpu}%`, icon: Cpu, color: 'text-pace-purple', bg: 'bg-pace-purple/5' },
                    { label: 'RAM Memory', value: `${node.ram}%`, icon: HardDrive, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                    { label: 'Active Sessions', value: node.users, icon: Users, color: 'text-green-500', bg: 'bg-green-500/5' },
                    { label: 'System Uptime', value: node.uptime, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/5' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-pace-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div className={cn("p-2 rounded-xl transition-colors", stat.bg)}>
                                <stat.icon className={stat.color} size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Real-time</span>
                        </div>
                        <h3 className="text-2xl font-bold text-admin-value tracking-tight">{stat.value}</h3>
                        <p className="text-xs font-medium text-admin-dim mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Chart */}
                <div className="lg:col-span-2 bg-white border border-pace-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-admin-value">Traffic Performance</h3>
                            <p className="text-[10px] text-admin-dim font-medium uppercase tracking-wider mt-1">Last 30 minutes analysis</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-pace-purple" />
                                <span className="text-[10px] font-bold text-admin-dim uppercase">Downlink</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                <span className="text-[10px] font-bold text-admin-dim uppercase">Uplink</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
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
                <div className="bg-white border border-pace-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-admin-value mb-6">Hardware Identity</h3>
                    
                    <div className="space-y-4">
                        {[
                            { label: 'OS Version', value: 'v7.12.1 stable' },
                            { label: 'Architecture', value: 'arm64' },
                            { label: 'Total Memory', value: '1024 MB' },
                            { label: 'Storage Free', value: '84.2 MB' },
                            { label: 'Temperature', value: '42°C' },
                            { label: 'Board Name', value: node.model },
                            { label: 'Serial Number', value: 'E452-9A2C-B1F0' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-pace-border last:border-0">
                                <span className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">{item.label}</span>
                                <span className="text-xs font-black text-admin-value">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-pace-bg-subtle rounded-xl border border-pace-border">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-bold text-admin-value">Identity Verified</span>
                        </div>
                        <p className="text-[10px] text-admin-dim leading-relaxed font-medium">
                            This node is authorized and communicating via encrypted API tunnel. Last synchronization was successful.
                        </p>
                    </div>
                </div>
            </div>

            {/* Subscriber Matrix for this Router */}
            <div className="bg-white border border-pace-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-pace-border flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-admin-value">Subscriber Matrix</h3>
                        <p className="text-[10px] text-admin-dim font-medium uppercase tracking-wider mt-1">Sessions active on this interface</p>
                    </div>
                    <button className="px-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value hover:bg-white transition-all flex items-center gap-2">
                        <List size={14} />
                        Full Ledger
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/30 text-[10px] font-bold text-admin-dim uppercase tracking-widest border-b border-pace-border">
                                <th className="px-6 py-4">Identity</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">IP Address</th>
                                <th className="px-6 py-4">Uptime</th>
                                <th className="px-6 py-4 text-right">Traffic</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {nodeSubscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-admin-dim text-xs font-medium">
                                        No active sessions detected on this node
                                    </td>
                                </tr>
                            ) : (
                                nodeSubscribers.map((sub, i) => (
                                    <tr key={i} className="hover:bg-pace-bg-subtle/30 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-pace-purple/5 border border-pace-purple/10 flex items-center justify-center text-[10px] font-bold text-pace-purple shrink-0">
                                                    {sub.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-admin-value">{sub.name}</span>
                                                    <span className="text-[10px] text-pace-purple font-mono">{sub.username}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className="border-none bg-pace-purple/5 text-pace-purple text-[9px] font-black uppercase">
                                                {sub.plan}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-admin-dim font-mono">10.10.20.{10 + i}</td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-admin-value tabular-nums">12h 45m</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-bold text-green-600">
                                                    1.2 Mbps Up
                                                </span>
                                                <span className="text-[10px] font-bold text-blue-600">
                                                    15.8 Mbps Down
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function RouterDetailsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-pace-purple border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-admin-dim uppercase tracking-widest animate-pulse">Initializing QoS Parameters...</p>
                </div>
            </div>
        }>
            <RouterDetailsContent />
        </Suspense>
    )
}
