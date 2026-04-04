"use client"

import React from 'react'
import Link from 'next/link'
import {
    Terminal,
    Zap,
    Network,
    Cpu,
    ChevronRight,
    Activity,
    ShieldCheck,
    Settings,
    LayoutGrid,
    Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

const UTILITY_MODULES = [
    {
        id: 'scripts',
        name: 'Automation Scripts',
        href: '/dashboard/utilities/scripts',
        description: 'Deploy and monitor Mikrotik shell scripts for network automation and monitoring.',
        icon: Terminal,
        tag: 'Advanced',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        stats: '12 Available'
    },
    {
        id: 'helpers',
        name: 'System Helpers',
        href: '/dashboard/utilities/helpers',
        description: 'Quick action tools to maintain system health, clear caches, and optimize your router.',
        icon: Zap,
        tag: 'Quick Access',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        stats: '8 Ready'
    }
]

export default function UtilitiesPage() {
    return (
        <div className="space-y-10 font-figtree pb-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-pace-border pb-10">
                <div className="space-y-3">
                    <h1 className="text-2xl font-bold text-pace-purple leading-tight tracking-tight uppercase">Network Utilities</h1>
                    <p className="text-[12px] text-admin-dim font-bold uppercase tracking-tighter max-w-lg leading-relaxed">
                        A centralized suite of high-performance tools for microtik infrastructure management and network orchestration.
                    </p>
                </div>
                <div className="flex items-center gap-4 text-admin-dim font-bold text-[10px] uppercase tracking-[0.15em] shrink-0">
                    <div className="flex items-center gap-2 px-4 py-2 bg-pace-bg-subtle rounded-xl border border-pace-border shadow-sm">
                        <Activity size={14} className="text-emerald-500" />
                        Node Stability Optimal
                    </div>
                </div>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {UTILITY_MODULES.map((module) => (
                    <Link
                        key={module.id}
                        href={module.href}
                        className="group relative bg-card-bg border border-pace-border rounded-3xl p-10 hover:border-pace-purple transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-500">
                            <module.icon size={160} />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-start justify-between">
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-xl shadow-xl border", module.color)}>
                                    <module.icon size={32} />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl bg-pace-bg-subtle text-admin-dim border border-pace-border shadow-sm">
                                    {module.tag}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-xl font-bold text-admin-value uppercase tracking-tight">{module.name}</h2>
                                <p className="text-[13px] text-admin-dim font-bold leading-relaxed tracking-tighter uppercase min-h-[52px]">
                                    {module.description}
                                </p>
                            </div>

                            <div className="pt-8 border-t border-pace-border flex items-center justify-between">
                                <div className={cn("text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-xl border", module.color)}>
                                    {module.stats}
                                </div>
                                <div className="flex items-center gap-2 text-pace-purple font-bold text-[12px] uppercase tracking-[0.1em] group-hover:gap-4 transition-all">
                                    Initialize Module
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Bottom Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16 pt-12 border-t border-pace-border">
                {[
                    { label: 'Security Layer', val: 'V3 (AES-256)', icon: ShieldCheck, color: 'text-emerald-500' },
                    { label: 'Protocols Active', val: 'SSH / SSL-SSL', icon: Network, color: 'text-blue-500' },
                    { label: 'Latency Pulse', val: 'Real-Time Sync', icon: Activity, color: 'text-rose-500' }
                ].map((meta, i) => (
                    <div key={i} className="flex items-center gap-5 group">
                        <div className="w-12 h-12 rounded-2xl bg-pace-bg-subtle flex items-center justify-center text-admin-dim border border-pace-border shadow-sm group-hover:border-pace-purple transition-colors">
                            <meta.icon size={22} className={meta.color} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-admin-dim uppercase tracking-widest leading-none mb-1.5">{meta.label}</p>
                            <p className="text-[13px] font-bold text-admin-value uppercase tracking-tight">{meta.val}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
