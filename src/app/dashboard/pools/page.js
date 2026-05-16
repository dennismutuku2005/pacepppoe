"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Layers, Search, Edit3, Trash2, Network, Activity, Database, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, TableRowSkeleton } from '@/components/Skeleton'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'

function PoolsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [pools, setPools] = useState([])
    const [search, setSearch] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Mock data for pools
    useEffect(() => {
        const timer = setTimeout(() => {
            setPools([
                { id: 1, name: 'Main-Pool', range: '192.168.100.2-192.168.100.254', gateway: '192.168.100.1', used: 45, total: 253, status: 'Active' },
                { id: 2, name: 'Business-Static', range: '10.10.20.2-10.10.20.100', gateway: '10.10.20.1', used: 12, total: 99, status: 'Active' },
                { id: 3, name: 'Guest-Lease', range: '172.16.0.2-172.16.0.254', gateway: '172.16.0.1', used: 0, total: 253, status: 'Inactive' },
            ])
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const filteredPools = pools.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.range.includes(search)
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">PPPoE Pools</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">IP address allocation and network segment management</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-sm active:scale-95"
                >
                    <Plus size={16} />
                    <span>Create New Pool</span>
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input 
                        type="text"
                        placeholder="Search pools..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pace-purple/20 transition-all"
                    />
                </div>
            </div>

            {/* Pools Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <th className="px-6 py-4 text-[11px] font-bold text-admin-dim uppercase tracking-widest">Pool Identity</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-admin-dim uppercase tracking-widest">Address Range</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-admin-dim uppercase tracking-widest">Utilization</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-admin-dim uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={4} rows={5} />
                            ) : filteredPools.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-admin-dim">
                                            <Database size={32} className="opacity-20" />
                                            <p className="text-sm font-medium">No IP pools found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPools.map((pool) => (
                                <tr key={pool.id} className="hover:bg-pace-bg-subtle/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-semibold text-admin-value">{pool.name}</p>
                                            <p className="text-[10px] text-admin-dim font-medium uppercase tracking-tighter">Gateway: {pool.gateway}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[11px] font-mono text-admin-label bg-pace-bg-subtle px-2 py-1 rounded border border-pace-border/50">
                                            {pool.range}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                                                <span className="text-admin-dim">Usage</span>
                                                <span className="text-admin-value">{pool.used} / {pool.total}</span>
                                            </div>
                                            <div className="w-32 h-1.5 bg-pace-bg-subtle rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-pace-purple rounded-full transition-all duration-1000" 
                                                    style={{ width: `${(pool.used / pool.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-lg transition-all" title="Edit Pool">
                                                <Edit3 size={14} />
                                            </button>
                                            <button className="p-2 text-admin-dim hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Pool">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Network size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-admin-value">Subnet Mask</h3>
                    </div>
                    <p className="text-xs text-admin-dim leading-relaxed">
                        Ensure your pool ranges match the subnet masks configured on the MikroTik interfaces to avoid routing conflicts.
                    </p>
                </div>
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-admin-value">IP Exhaustion</h3>
                    </div>
                    <p className="text-xs text-admin-dim leading-relaxed">
                        The system will automatically alert you when a pool reaches 90% utilization to prevent provisioning failures.
                    </p>
                </div>
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm text-center flex flex-col items-center justify-center border-dashed">
                    <Activity size={24} className="text-admin-dim mb-2 opacity-50" />
                    <p className="text-[11px] font-bold text-admin-dim uppercase tracking-widest">Real-time Sync Active</p>
                </div>
            </div>

            {/* Modals */}
            <Modal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Create PPPoE Pool"
                description="Configure a new IP address range for automatic subscriber provisioning."
            >
                <div className="space-y-4 py-4 text-left">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Pool Name</label>
                        <input type="text" placeholder="e.g. DHCP-Pool-1" className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pace-purple/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Start IP</label>
                            <input type="text" placeholder="192.168.1.2" className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pace-purple/20" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">End IP</label>
                            <input type="text" placeholder="192.168.1.254" className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pace-purple/20" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Associated Gateway</label>
                        <input type="text" placeholder="192.168.1.1" className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pace-purple/20" />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 border border-pace-border rounded-xl text-sm font-medium hover:bg-pace-bg-subtle transition-all">Cancel</button>
                        <button className="flex-1 py-3 bg-pace-purple text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all">Create Pool</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default function PoolsPage() {
    return (
        <Suspense fallback={<Skeleton className="w-full h-screen rounded-2xl" />}>
            <PoolsContent />
        </Suspense>
    )
}
