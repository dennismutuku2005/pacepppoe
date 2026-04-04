"use client";

import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { Search, Plus, Network, Activity, CheckCircle2, XCircle, MoreHorizontal, Power, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import Swal from 'sweetalert2'

function RoutersContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [routers, setRouters] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            setRouters(mockDashboardData.routerStatus)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const filteredRouters = routers.filter(router =>
        router.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        router.ip?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleReboot = (name) => {
        Swal.fire({
            title: 'Reboot Router?',
            text: `Confirming reboot for ${name}. This will disconnect all PPPoE sessions.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E11D48',
            confirmButtonText: 'Yes, Reboot'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Command Sent!', 'The reboot command has been transmitted to the MikroTik.', 'success')
            }
        })
    }

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-bold text-pace-purple uppercase tracking-tight flex items-center gap-3">
                        <Network size={24} />
                        MikroTik Infrastructure
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase italic">Real-time health of core ISP nodes.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-pace-purple text-white rounded-xl hover:bg-pace-purple/90 transition-all text-xs font-bold uppercase tracking-widest">
                    <Plus size={14} /> Add Router
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search by name or IP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-card-bg border border-pace-border rounded-2xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(6)].map((_, i) => <Skeleton key={i} className="h-[200px] rounded-2xl" />)
                ) : filteredRouters.length === 0 ? (
                    <div className="col-span-full py-32 text-center border border-dashed border-pace-border rounded-2xl">
                        <Activity size={32} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No routers found matching search</p>
                    </div>
                ) : (
                    filteredRouters.map((r) => (
                        <div key={r.id} className={cn(
                            "bg-card-bg border rounded-2xl p-6 transition-all group relative overflow-hidden",
                            r.status === 'online' ? "border-pace-border hover:border-pace-purple/30" : "border-red-100 bg-red-50/20"
                        )}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 border",
                                        r.status === 'online' ? "bg-pace-purple/5 border-pace-purple/10 text-pace-purple" : "bg-red-500/10 border-red-500/20 text-red-500"
                                    )}>
                                        <Network size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-admin-value text-[14px] uppercase tracking-tight">{r.name}</h3>
                                        <p className="text-[10px] font-bold text-admin-dim font-mono mt-0.5">{r.ip}</p>
                                    </div>
                                </div>
                                <Badge variant={r.status === 'online' ? 'success' : 'error'} className="text-[9px] font-bold border-none px-3 py-1 uppercase italic tracking-tighter">
                                    {r.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-pace-border">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">PPPoE Sessions</span>
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-pace-purple" />
                                        <span className="text-sm font-bold text-admin-value">{r.users} Customers</span>
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">System Health</span>
                                    <div className="flex items-center justify-end gap-2">
                                        <span className="text-sm font-bold text-admin-value">{r.status === 'online' ? '98.5%' : '0%'}</span>
                                        {r.status === 'online' ? <ShieldCheck size={14} className="text-green-500" /> : <ShieldAlert size={14} className="text-red-500" />}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button 
                                    onClick={() => handleReboot(r.name)}
                                    className="flex-1 py-2.5 bg-pace-bg-subtle hover:bg-red-500 hover:text-white border border-pace-border rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <Power size={14} /> Reboot
                                </button>
                                <button className="px-3 py-2.5 bg-pace-bg-subtle hover:bg-pace-purple hover:text-white border border-pace-border rounded-xl text-[9px] font-bold uppercase transition-all">
                                    <MoreHorizontal size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default function RoutersPage() {
    return (
        <Suspense fallback={<div>Loading Infrastructure...</div>}>
            <RoutersContent />
        </Suspense>
    )
}
