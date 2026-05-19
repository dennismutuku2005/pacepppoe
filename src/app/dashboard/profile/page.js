"use client";

import React, { useState, useEffect, Suspense } from 'react'
import { 
    Users, Mail, Phone, Shield, Camera, Lock, 
    CheckCircle2, AlertCircle, Save, Smartphone, 
    Globe, ChevronRight, User, Key, Bell, CreditCard, Settings
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import authService from '@/lib/auth'
import { toast } from 'sonner'
import { Skeleton } from '@/components/Skeleton'

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
            toast.success('Identity Synchronized', {
                description: 'Your administrative profile has been updated successfully.'
            })
            setIsSaving(false)
        }, 1000)
    }

    if (isLoading || !user) {
        return (
            <div className="space-y-12 font-figtree animate-in fade-in duration-700 pb-20">
                {/* Elegant Banner Skeleton */}
                <div className="relative rounded-[2.5rem] overflow-hidden bg-gray-200 dark:bg-gray-800 h-64 sm:h-80 animate-pulse flex items-end p-8 sm:p-12">
                    <div className="flex items-center gap-6 w-full">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gray-300 dark:bg-gray-700" />
                        <div className="space-y-3 flex-1">
                            <Skeleton className="h-8 w-48 bg-gray-300 dark:bg-gray-700" />
                            <Skeleton className="h-4 w-64 bg-gray-300 dark:bg-gray-700" />
                        </div>
                    </div>
                </div>
                {/* Forms Skeleton */}
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-3 w-60" />
                            </div>
                        </div>
                        <div className="bg-card-bg border border-pace-border rounded-[2.5rem] p-8 sm:p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-12 w-full rounded-2xl" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-12 w-full rounded-2xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-12 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="animate-in fade-in duration-1000 font-figtree pb-20">
            {/* Elegant Header */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-[#501DAA] h-64 sm:h-80 shadow-2xl shadow-pace-purple/10">
                <Image 
                    src="/sidesvg.svg" 
                    alt="Network Pattern" 
                    fill
                    className="object-cover opacity-20"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#501DAA]/80 via-transparent to-black/5" />
                
                <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-end">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-2xl overflow-hidden">
                                    {initials}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">{user.name}</h1>
                                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest">
                                        {user.type}
                                    </div>
                                </div>
                                <p className="text-white/70 text-sm font-medium flex items-center gap-2">
                                    <Globe size={14} className="opacity-50" />
                                    Systems Administrator • Pace Networks
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-12 space-y-12">
                {/* Identity Settings Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-10 h-10 rounded-xl bg-pace-purple/10 flex items-center justify-center text-pace-purple">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-admin-value">Identity Settings</h2>
                            <p className="text-xs text-admin-dim font-medium">Update your legal identity and communication channels</p>
                        </div>
                    </div>

                    <div className="bg-white border border-pace-border rounded-[2.5rem] shadow-sm overflow-hidden">
                        <form onSubmit={handleSave} className="p-8 sm:p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-admin-value ml-1">Full Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                        <input 
                                            type="text" 
                                            defaultValue={user.name}
                                            className="w-full pl-12 pr-4 py-4 bg-pace-bg-subtle/50 border border-pace-border rounded-2xl text-sm font-semibold text-admin-value focus:bg-white focus:border-pace-purple outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-admin-value ml-1">Phone Contact</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                        <input 
                                            type="tel" 
                                            defaultValue={user.phone}
                                            className="w-full pl-12 pr-4 py-4 bg-pace-bg-subtle/50 border border-pace-border rounded-2xl text-sm font-semibold text-admin-value focus:bg-white focus:border-pace-purple outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-admin-value ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                    <input 
                                        type="email" 
                                        defaultValue={user.username}
                                        className="w-full pl-12 pr-4 py-4 bg-pace-bg-subtle/50 border border-pace-border rounded-2xl text-sm font-semibold text-admin-value focus:bg-white focus:border-pace-purple outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full sm:w-auto px-12 py-4 bg-pace-purple text-white rounded-2xl text-sm font-bold shadow-lg shadow-pace-purple/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Synchronizing...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Security & Access Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-admin-value">Security & Access</h2>
                            <p className="text-xs text-admin-dim font-medium">Manage your password and authentication protocols</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-pace-border rounded-[2rem] p-8 flex flex-col justify-between group hover:border-pace-purple/30 transition-all">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-pace-purple/5 flex items-center justify-center text-pace-purple">
                                    <Key size={18} />
                                </div>
                                <h3 className="font-bold text-admin-value">Authentication Pin</h3>
                                <p className="text-xs text-admin-dim leading-relaxed font-medium">Update your administrative access pin used for critical operations.</p>
                            </div>
                            <button className="mt-6 text-xs font-bold text-pace-purple flex items-center gap-2 group-hover:gap-3 transition-all">
                                Change Password <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="bg-white border border-pace-border rounded-[2rem] p-8 flex flex-col justify-between group hover:border-pace-purple/30 transition-all">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                    <Smartphone size={18} />
                                </div>
                                <h3 className="font-bold text-admin-value">2FA Verification</h3>
                                <p className="text-xs text-admin-dim leading-relaxed font-medium">Add an extra layer of security to your account with mobile verification.</p>
                            </div>
                            <button className="mt-6 text-xs font-bold text-orange-600 flex items-center gap-2 group-hover:gap-3 transition-all">
                                Setup Authenticator <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Notifications & ISP Accounts Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Bell size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-admin-value">Notifications</h2>
                        </div>
                        <div className="bg-white border border-pace-border rounded-[2rem] p-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-admin-value">Email Alerts</span>
                                <div className="w-10 h-5 bg-pace-purple rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-admin-value">SMS Dispatch</span>
                                <div className="w-10 h-5 bg-pace-bg-subtle border border-pace-border rounded-full relative cursor-pointer">
                                    <div className="absolute left-1 top-1 w-3 h-3 bg-admin-dim rounded-full" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="w-10 h-10 rounded-xl bg-pace-green/10 flex items-center justify-center text-pace-green">
                                <CreditCard size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-admin-value">ISP Accounts</h2>
                        </div>
                        <div className="bg-white border border-pace-border rounded-[2rem] p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold text-admin-value">Pace Networks Ltd</span>
                                <div className="px-2 py-0.5 bg-green-500/10 text-green-600 text-[8px] font-black uppercase rounded-md">Primary</div>
                            </div>
                            <p className="text-[11px] text-admin-dim font-medium">Enterprise Gateway License #842C-B1F0</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-pace-purple border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    )
}
