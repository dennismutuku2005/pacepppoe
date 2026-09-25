"use client";

import React, { useState, useEffect, Suspense } from 'react'
import { 
    User, Mail, Phone, Shield, Lock, 
    CheckCircle2, AlertCircle, Save, Smartphone, 
    Key, RefreshCw, Wallet, Clock, ShieldCheck, Eye, EyeOff, Calendar, Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'
import authService from '@/lib/auth'
import { profileService } from '@/services/profile'
import { toast } from 'sonner'
import { Badge } from '@/components/Badge'

function ProfileContent() {
    const [profile, setProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)

    // Profile form state
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const getInitials = (nameVal) => {
        if (!nameVal) return 'US'
        const parts = nameVal.trim().split(/\s+/)
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return nameVal.substring(0, 2).toUpperCase()
    }

    const loadProfile = async () => {
        setIsLoading(true)
        try {
            const res = await profileService.getProfile()
            if (res && res.status === 'success' && res.data) {
                setProfile(res.data)
                setName(res.data.name || '')
                setEmail(res.data.email || '')
                setPhone(res.data.phone || '')

                // Sync with local session cache
                const currentUser = authService.getUser() || {}
                authService.setUser({
                    ...currentUser,
                    id: res.data.id,
                    name: res.data.name,
                    username: res.data.username,
                    email: res.data.email,
                    phone: res.data.phone,
                    type: res.data.role
                })
            } else {
                toast.error(res?.message || 'Failed to retrieve profile details')
            }
        } catch (err) {
            console.error("Error loading profile:", err)
            toast.error('Network error loading profile details')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadProfile()
    }, [])

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) {
            toast.error('Full Name is required')
            return
        }

        setIsSaving(true)
        try {
            const payload = {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim()
            }

            const res = await profileService.updateProfile(payload)
            if (res && res.status === 'success') {
                toast.success('Profile details updated successfully')
                
                // Update local storage user data
                const currentUser = authService.getUser() || {}
                authService.setUser({
                    ...currentUser,
                    name: payload.name,
                    email: payload.email,
                    phone: payload.phone
                })

                loadProfile()
            } else {
                toast.error(res?.message || 'Failed to update profile')
            }
        } catch (err) {
            console.error("Error updating profile:", err)
            toast.error('Network error updating profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        if (!currentPassword) {
            toast.error('Please enter your current password')
            return
        }

        if (!newPassword) {
            toast.error('Please enter a new password')
            return
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match')
            return
        }

        setIsSavingPassword(true)
        try {
            const res = await profileService.updateProfile({
                name: name || profile?.name,
                email: email || profile?.email,
                phone: phone || profile?.phone,
                current_password: currentPassword,
                password: newPassword
            })

            if (res && res.status === 'success') {
                toast.success('Security password updated successfully')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            } else {
                toast.error(res?.message || 'Failed to change password. Check your current password.')
            }
        } catch (err) {
            console.error("Error changing password:", err)
            toast.error('Network error changing password')
        } finally {
            setIsSavingPassword(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6 font-figtree animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
                <div className="flex items-center justify-between border-b border-pace-border pb-6">
                    <div className="space-y-2">
                        <div className="h-6 w-48 bg-pace-bg-subtle rounded-lg animate-pulse" />
                        <div className="h-3 w-72 bg-pace-bg-subtle rounded-md animate-pulse" />
                    </div>
                </div>
                <div className="h-44 bg-card-bg border border-pace-border rounded-2xl animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-96 bg-card-bg border border-pace-border rounded-2xl animate-pulse" />
                    <div className="h-96 bg-card-bg border border-pace-border rounded-2xl animate-pulse" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
            
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Account & Profile</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Manage your administrator identity, contact channels, and authentication credentials.</p>
                </div>
                <button
                    onClick={loadProfile}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all text-xs font-semibold cursor-pointer shrink-0 self-start sm:self-auto"
                    title="Reload Profile"
                >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Full-width Horizontal Profile Summary Card */}
            <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pace-purple via-indigo-500 to-purple-600" />
                
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 pt-1">
                    
                    {/* User Identity Column */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-pace-purple/10 border border-pace-purple/25 flex items-center justify-center text-pace-purple text-xl sm:text-2xl font-bold tracking-wider shadow-sm shrink-0">
                            {getInitials(name || profile?.name)}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h2 className="text-base sm:text-lg font-bold text-admin-value">{name || profile?.name || 'Administrator'}</h2>
                                <Badge variant={profile?.status === 'active' ? 'success' : 'neutral'}>
                                    {profile?.status === 'active' ? 'Active Account' : (profile?.status || 'Active')}
                                </Badge>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pace-purple/10 text-pace-purple uppercase tracking-wider">
                                    {profile?.role === 'isp' ? 'ISP Operator' : (profile?.role || 'Admin')}
                                </span>
                            </div>
                            <p className="text-xs font-mono font-medium text-admin-dim mt-1">@{profile?.username || 'user'}</p>
                        </div>
                    </div>

                    {/* Horizontal Info Tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full xl:w-auto xl:flex-1 xl:max-w-3xl">
                        
                        <div className="p-3 bg-pace-bg-subtle/70 rounded-xl border border-pace-border/60">
                            <div className="flex items-center gap-1.5 text-admin-dim text-[10px] font-bold uppercase tracking-wider mb-1">
                                <Phone size={12} className="text-pace-purple" />
                                Contact Phone
                            </div>
                            <p className="text-xs font-semibold text-admin-value truncate">{profile?.phone || 'Not set'}</p>
                        </div>

                        <div className="p-3 bg-pace-bg-subtle/70 rounded-xl border border-pace-border/60">
                            <div className="flex items-center gap-1.5 text-admin-dim text-[10px] font-bold uppercase tracking-wider mb-1">
                                <Mail size={12} className="text-pace-purple" />
                                Email Address
                            </div>
                            <p className="text-xs font-semibold text-admin-value truncate" title={profile?.email}>{profile?.email || 'Not set'}</p>
                        </div>

                        <div className="p-3 bg-pace-bg-subtle/70 rounded-xl border border-pace-border/60">
                            <div className="flex items-center gap-1.5 text-admin-dim text-[10px] font-bold uppercase tracking-wider mb-1">
                                <Hash size={12} className="text-pace-purple" />
                                System Username
                            </div>
                            <p className="text-xs font-mono font-bold text-admin-value truncate">{profile?.username}</p>
                        </div>

                        <div className="p-3 bg-pace-bg-subtle/70 rounded-xl border border-pace-border/60">
                            <div className="flex items-center gap-1.5 text-admin-dim text-[10px] font-bold uppercase tracking-wider mb-1">
                                <Calendar size={12} className="text-pace-purple" />
                                Member Since
                            </div>
                            <p className="text-xs font-semibold text-admin-value truncate">
                                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </p>
                        </div>

                    </div>

                    {/* Wallet Balance (For ISP) */}
                    {profile?.role === 'isp' && profile?.wallet_balance !== undefined && (
                        <div className="p-3.5 bg-gradient-to-br from-pace-purple/10 to-indigo-500/5 rounded-xl border border-pace-purple/20 flex flex-col justify-center min-w-[170px] shrink-0 w-full xl:w-auto">
                            <div className="flex items-center gap-2 text-admin-dim text-[10px] font-bold uppercase tracking-wider mb-1">
                                <Wallet size={13} className="text-pace-purple" />
                                <span>Wallet Balance</span>
                            </div>
                            <span className="font-mono font-black text-admin-value text-base">
                                KES {Number(profile.wallet_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}

                </div>
            </div>

            {/* Bottom 2-Column Side-by-Side Cards on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* Card 1: Identity & Communication Channels Form */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-pace-border">
                            <div className="w-10 h-10 rounded-xl bg-pace-purple/10 flex items-center justify-center text-pace-purple shrink-0">
                                <User size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-admin-value">Identity & Communication Channels</h2>
                                <p className="text-[11px] text-admin-dim font-medium">Update your display name, official contact phone, and notification email.</p>
                            </div>
                        </div>

                        <form id="profile-identity-form" onSubmit={handleProfileSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-admin-value uppercase tracking-wider">Full Name *</label>
                                <div className="relative">
                                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Dennis Muuo"
                                        className="w-full pl-10 pr-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-admin-value uppercase tracking-wider">Phone Contact</label>
                                    <div className="relative">
                                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="e.g. 0712345678"
                                            className="w-full pl-10 pr-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-admin-value uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="e.g. dennis@gmail.com"
                                            className="w-full pl-10 pr-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-admin-dim uppercase tracking-wider">System Username (Read-Only)</label>
                                <div className="relative">
                                    <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" />
                                    <input
                                        type="text"
                                        disabled
                                        value={profile?.username || ''}
                                        className="w-full pl-10 pr-4 py-2.5 bg-pace-bg-subtle/50 border border-pace-border/60 rounded-xl text-xs font-mono font-medium text-admin-dim cursor-not-allowed opacity-80"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="pt-6 border-t border-pace-border/70 flex justify-end">
                        <button
                            type="submit"
                            form="profile-identity-form"
                            disabled={isSaving}
                            className="px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-bold hover:bg-pace-purple/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save size={14} />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Card 2: Security & Password Form */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-pace-border">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                                <Key size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-admin-value">Security & Password</h2>
                                <p className="text-[11px] text-admin-dim font-medium">Verify your current credentials and update your password.</p>
                            </div>
                        </div>

                        <form id="profile-password-form" onSubmit={handlePasswordSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-admin-value uppercase tracking-wider">Current (Old) Password *</label>
                                <div className="relative">
                                    <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" />
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter your current password"
                                        className="w-full pl-10 pr-10 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-admin-dim hover:text-admin-value transition-colors cursor-pointer"
                                    >
                                        {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-admin-value uppercase tracking-wider">New Password *</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min 6 characters"
                                            className="w-full pl-10 pr-10 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-admin-dim hover:text-admin-value transition-colors cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-admin-value uppercase tracking-wider">Confirm New Password *</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter new password"
                                            className="w-full pl-10 pr-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="pt-6 border-t border-pace-border/70 flex justify-end">
                        <button
                            type="submit"
                            form="profile-password-form"
                            disabled={isSavingPassword || !newPassword || !currentPassword}
                            className="px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-bold hover:bg-pace-purple/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                            {isSavingPassword ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Updating Password...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={14} />
                                    Update Password
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-pace-purple border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    )
}
