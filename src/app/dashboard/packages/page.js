"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Package, Edit3, Trash2, ShieldCheck, Zap, Download, Search, Save } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mockPackages } from '@/services/mockData'
import Swal from 'sweetalert2'

function PackagesContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [packages, setPackages] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            setPackages(mockPackages)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleDelete = (name) => {
        Swal.fire({
            title: 'Delete Package?',
            text: `Remove ${name} from available tiers?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E11D48',
            confirmButtonText: 'Yes, Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                setPackages(prev => prev.filter(p => p.name !== name))
                Swal.fire('Deleted!', 'Package tier removed.', 'success')
            }
        })
    }

    const filteredPackages = packages.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-bold text-pace-purple uppercase tracking-tight flex items-center gap-3">
                        <Package size={24} />
                        Service Packages
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase">Bandwidth tiers & monthly subscription pricing</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-pace-purple text-white rounded-xl hover:bg-pace-purple/90 transition-all text-xs font-bold uppercase tracking-widest">
                    <Plus size={14} /> New Tier
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search service name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-card-bg border border-pace-border rounded-2xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[220px] rounded-2xl" />)
                ) : filteredPackages.map((p, i) => (
                    <div key={i} className="bg-card-bg border border-pace-border rounded-2xl p-6 hover:border-pace-purple/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-pace-purple/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-pace-purple/10 transition-all" />
                        
                        <div className="flex justify-between items-start mb-6 relative">
                            <div className="w-12 h-12 rounded-2xl bg-pace-purple/5 text-pace-purple flex items-center justify-center border border-pace-purple/10 group-hover:scale-110 transition-transform">
                                <Zap size={22} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Monthly</p>
                                <h3 className="text-lg font-bold text-admin-value mt-1 tabular-nums">KES {p.price.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6 relative">
                            <div>
                                <h3 className="font-bold text-pace-purple text-[15px] uppercase tracking-tight">{p.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-[9px] font-mono border-pace-border bg-pace-bg-subtle px-2 py-0.5">
                                        {p.limit}
                                    </Badge>
                                    <ShieldCheck size={12} className="text-green-500" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 relative">
                            <button className="flex-1 py-2 bg-pace-bg-subtle hover:bg-pace-purple/10 border border-pace-border rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all">
                                Edit Tier
                            </button>
                            <button 
                                onClick={() => handleDelete(p.name)}
                                className="px-3 py-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 border border-red-100 rounded-xl transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function PackagesPage() {
    return (
        <Suspense fallback={<div>Loading Tiers...</div>}>
            <PackagesContent />
        </Suspense>
    )
}