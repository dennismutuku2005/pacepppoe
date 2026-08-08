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
        <div className="font-figtree pb-8 sm:pb-12 text-admin-value">
            {/* Minimal Header */}
            <div className="py-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-pace-bg-subtle flex items-center justify-center text-admin-dim font-black">{initials}</div>
                        <div>
                            <h1 className="text-xl font-black">{user.name}</h1>
                            <div className="text-xs text-admin-dim uppercase tracking-wide">{user.type}</div>
                        </div>
                    </div>
                    <div>
                        <button className="py-2 px-4 bg-pace-purple text-white rounded-lg font-bold">Edit Profile</button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-2 space-y-6">
                {/* Identity Settings - Minimal */}
                <section className="space-y-3">
                    <div className="text-sm font-bold text-admin-value">Identity Settings</div>
                    <div className="bg-card-bg border border-pace-border rounded-lg p-4">
                        <form onSubmit={handleSave} className="space-y-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-admin-dim">Full name</label>
                                <input type="text" defaultValue={user.name} className="py-2 px-3 rounded-md border border-pace-border bg-transparent text-sm" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-admin-dim">Phone</label>
                                <input type="tel" defaultValue={user.phone} className="py-2 px-3 rounded-md border border-pace-border bg-transparent text-sm" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-admin-dim">Email</label>
                                <input type="email" defaultValue={user.username} className="py-2 px-3 rounded-md border border-pace-border bg-transparent text-sm" />
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="py-2 px-4 bg-pace-purple text-white rounded-md font-bold">Save</button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Security & Access Section - Consolidated Clean Card */}
                <section className="space-y-4 sm:space-y-6 font-figtree">
                    <div className="flex items-center gap-3 sm:gap-4 px-1 sm:px-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                            <Shield size={18} />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-admin-value">Security & Access</h2>
                            <p className="text-[10px] sm:text-xs text-admin-dim font-medium">Manage your password, PIN and two-factor authentication</p>
                        </div>
                    </div>

                    <div className="bg-card-bg border border-pace-border rounded-[1.5rem] sm:rounded-[2.75rem] p-5 sm:p-8 space-y-6">
                        {/* Change Password */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-pace-purple/5 flex items-center justify-center text-pace-purple">
                                    <Lock size={16} />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-admin-value">Change Password</h3>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                toast.success('Password updated locally');
                            }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input type="password" placeholder="Current password" className="col-span-1 sm:col-span-1 py-2 px-3 rounded-xl border border-pace-border bg-pace-bg-subtle text-sm" />
                                <input type="password" placeholder="New password" className="col-span-1 py-2 px-3 rounded-xl border border-pace-border bg-pace-bg-subtle text-sm" />
                                <input type="password" placeholder="Confirm new" className="col-span-1 py-2 px-3 rounded-xl border border-pace-border bg-pace-bg-subtle text-sm" />
                                <div className="col-span-1 sm:col-span-3 flex justify-center mt-2">
                                    <button type="submit" className="w-full sm:w-72 py-3 bg-pace-purple text-white rounded-2xl font-bold text-sm shadow-md">Update Password</button>
                                </div>
                            </form>
                        </div>

                        {/* Admin PIN */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-pace-purple/5 flex items-center justify-center text-pace-purple">
                                    <Key size={16} />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-admin-value">Administrative PIN</h3>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); toast.success('Admin PIN updated'); }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input type="password" inputMode="numeric" placeholder="New 4-digit PIN" maxLength={6} className="col-span-1 py-2 px-3 rounded-xl border border-pace-border bg-pace-bg-subtle text-sm" />
                                <input type="password" inputMode="numeric" placeholder="Confirm PIN" maxLength={6} className="col-span-1 py-2 px-3 rounded-xl border border-pace-border bg-pace-bg-subtle text-sm" />
                                <div className="col-span-1 sm:col-span-3 flex justify-center mt-2">
                                    <button type="submit" className="w-full sm:w-72 py-3 bg-white text-pace-purple rounded-2xl font-bold text-sm border border-pace-purple/10 shadow-sm">Set Admin PIN</button>
                                </div>
                            </form>
                        </div>

                        {/* 2FA Setup */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                                    <Smartphone size={16} />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-admin-value">Two-Factor Authentication</h3>
                            </div>
                            <p className="text-[12px] text-admin-dim">Secure your account with an authenticator app. We recommend using Google Authenticator or Authy.</p>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="w-full sm:w-48 h-48 bg-pace-bg-subtle border border-pace-border rounded-xl flex items-center justify-center text-admin-dim">
                                    <div className="text-center">
                                        <div className="mb-2 font-semibold">QR Placeholder</div>
                                        <div className="text-xs">Scan with your authenticator</div>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Enter verification code" className="flex-1 py-2 px-3 rounded-xl border border-pace-border bg-pace-bg-subtle text-sm" />
                                        <button onClick={() => toast.success('2FA enabled (mock)')} className="py-2 px-4 bg-pace-purple text-white rounded-xl font-bold">Enable</button>
                                    </div>
                                    <div className="text-[12px] text-admin-dim">If you already have 2FA enabled, you can regenerate recovery codes from here.</div>
                                </div>
                            </div>
                        </div>

                        {/* Primary CTA */}
                        <div className="pt-2 border-t border-pace-border"></div>
                        <div className="flex justify-center">
                            <button onClick={() => toast.success('Security settings saved (mock)')} className="w-full sm:w-96 py-3 bg-pace-purple text-white rounded-3xl font-black text-sm shadow-lg">Save Security Settings</button>
                        </div>
                    </div>
                </section>

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
