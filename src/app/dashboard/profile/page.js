"use client";

import React, { useState, useEffect, Suspense } from 'react'
import { Users, Mail, Phone, Shield, Camera, Lock, CheckCircle2, AlertCircle, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import authService from '@/lib/auth'
import { toast } from 'sonner'

function ProfileContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const userData = authService.getUser()
        setUser(userData)
        setIsLoading(false)
    }, [])

    const handleSave = (e) => {
        e.preventDefault()
        setIsSaving(true)
        setTimeout(() => {
            toast.success('Identity Updated', {
                description: 'Administrative profile parameters synchronized successfully.'
            })
            setIsSaving(false)
        }, 1000)
    }

    if (isLoading || !user) return <div className="p-8 text-center animate-pulse text-sm font-medium text-admin-dim">Authenticating Profile...</div>

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-20 font-figtree">
            {/* Header */}
            <div className="text-center space-y-4 border-b border-pace-border pb-10">
                <div className="relative inline-block group">
                    <div className="w-20 h-20 rounded-3xl bg-pace-purple/5 border border-pace-purple/20 flex items-center justify-center text-2xl font-bold text-pace-purple shadow-sm transition-transform group-hover:scale-105">
                        {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-card-bg border border-pace-border flex items-center justify-center text-admin-dim hover:text-pace-purple transition-all shadow-sm">
                        <Camera size={14} />
                    </button>
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-admin-value tracking-tight">{user.name}</h1>
                    <div className="flex items-center justify-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold tracking-wider uppercase">Verified Admin</span>
                        <span className="text-[11px] font-medium text-admin-dim">Root Identity</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Summary */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card-bg border border-pace-border rounded-xl p-6 space-y-4 shadow-sm">
                        <h4 className="text-[11px] font-bold text-admin-value tracking-wider uppercase border-b border-pace-border pb-3">Session Stats</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-admin-dim font-medium">Access Level</span>
                                <span className="font-semibold text-pace-purple">Root</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-admin-dim font-medium">Last Login</span>
                                <span className="font-semibold text-admin-value tabular-nums">2h 15m ago</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-admin-dim font-medium">MFA Status</span>
                                <span className="font-semibold text-green-600">Enabled</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-pace-purple/5 border border-pace-purple/10 rounded-xl p-6 text-center space-y-3">
                        <Shield size={22} className="text-pace-purple mx-auto" />
                        <p className="text-[11px] font-bold text-pace-purple uppercase tracking-wider">Security Protocol</p>
                        <p className="text-[11px] text-admin-dim font-medium leading-relaxed italic">Your session is protected by 256-bit encryption.</p>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSave} className="bg-card-bg border border-pace-border rounded-xl p-8 space-y-8 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-wider uppercase pl-1">Full Identity</label>
                                <div className="relative">
                                    <input 
                                        type="text" defaultValue={user.name}
                                        className="w-full pl-11 pr-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:border-pace-purple outline-none transition-all"
                                    />
                                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-wider uppercase pl-1">Email Coordinates</label>
                                <div className="relative">
                                    <input 
                                        type="email" defaultValue={user.email}
                                        className="w-full pl-11 pr-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:border-pace-purple outline-none transition-all"
                                    />
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-wider uppercase pl-1">Phone Nexus</label>
                                <div className="relative">
                                    <input 
                                        type="text" defaultValue={user.phone}
                                        className="w-full pl-11 pr-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:border-pace-purple outline-none transition-all tabular-nums"
                                    />
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-wider uppercase pl-1">Access Tier</label>
                                <div className="relative">
                                    <input 
                                        type="text" defaultValue={user.type} disabled
                                        className="w-full pl-11 pr-4 py-2.5 bg-pace-bg-subtle/50 border border-pace-border rounded-xl text-sm font-medium text-admin-dim outline-none cursor-not-allowed uppercase"
                                    />
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim opacity-50" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-pace-border flex items-center justify-between gap-4">
                            <button type="button" className="text-[11px] font-semibold text-admin-dim hover:text-red-500 transition-colors uppercase tracking-wider">
                                Deactivate Account
                            </button>
                            <button 
                                type="submit" disabled={isSaving}
                                className="flex items-center gap-2 px-8 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? 'Synchronizing...' : <><Save size={16} /> Commit Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Authenticating identity...</div>}>
            <ProfileContent />
        </Suspense>
    )
}
