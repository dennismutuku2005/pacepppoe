"use client"

import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Globe, Shield, Loader2, CheckCircle2, AlertCircle, Activity, CreditCard, Lock } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import authService from '@/lib/auth'
import { accountService } from '@/services/account'
import { systemService } from '@/services/system'
import { Skeleton } from '@/components/Skeleton'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
    const [user, setUser] = useState(null)
    const [account, setAccount] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [sysLoading, setSysLoading] = useState(false)
    const [sysSaving, setSysSaving] = useState(false)
    const [systemSettings, setSystemSettings] = useState({
        doublepayment_lock: 0,
        receive_error_info: 0,
        vouchers_as_sale: 0
    })
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    // Fetch profile and account on mount
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [profileRes, accountRes] = await Promise.all([
                authService.getProfile(),
                accountService.getAccountDetails().catch(() => null)
            ])

            if (profileRes.success) {
                const u = profileRes.data
                setUser(u)
                setFormData(prev => ({
                    ...prev,
                    name: u.name,
                    phone: u.phone
                }))

                // Fetch System Settings if Admin
                if (['admin', 'superadmin'].includes(u.type)) {
                    setSysLoading(true)
                    const sysRes = await systemService.getSettings()
                    if (sysRes.status === 'success') {
                        setSystemSettings(sysRes.data)
                    }
                    setSysLoading(false)
                }
            } else {
                setError(profileRes.message)
            }

            if (accountRes && accountRes.status === 'success') {
                setAccount(accountRes.data)
            }
        } catch (err) {
            console.error("Error fetching settings data:", err)
        }
        setLoading(false)
    }

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccessMsg(null)

        const result = await authService.updateProfile({
            name: formData.name,
            phone: formData.phone
        })

        if (result.success) {
            setSuccessMsg("Profile updated successfully")
            setUser(prev => ({ ...prev, name: formData.name, phone: formData.phone }))
        } else {
            setError(result.message)
        }
        setSaving(false)
        setTimeout(() => setSuccessMsg(null), 3000)
    }

    const handleChangePassword = async () => {
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (!formData.password) {
            setError("Password cannot be empty")
            return
        }

        setSaving(true)
        setError(null)

        const result = await authService.updateProfile({
            name: formData.name,
            phone: formData.phone,
            password: formData.password
        })

        if (result.success) {
            setShowPasswordModal(false)
            setShowSaveModal(true)
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
        } else {
            setError(result.message)
        }
        setSaving(false)
    }

    const getUserInitials = () => {
        if (!user || !user.name) return '??'
        return user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-4xl mx-auto px-4 font-figtree">
                <div className="border-b border-pace-border pb-6">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="bg-card-bg border border-pace-border rounded-xl p-8 space-y-8">
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10 px-4 font-figtree">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">System Settings</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Configure your administrative profile and gateway integration</p>
                </div>
                {(error || successMsg) && (
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium animate-in slide-in-from-right-4",
                        error ? "bg-red-500/5 text-red-500 border border-red-500/10" : "bg-green-500/5 text-green-500 border border-green-500/10"
                    )}>
                        <span>{error || successMsg}</span>
                    </div>
                )}
            </div>

            {/* Profile Section */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-pace-border bg-pace-bg-subtle/50">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-card-bg border border-pace-border flex items-center justify-center text-pace-purple font-bold text-2xl sm:text-3xl shadow-sm">
                            {getUserInitials()}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-admin-value">{user?.name}</h3>
                            <div className="flex gap-2 justify-center sm:justify-start">
                                <Badge variant="success" className="text-[9px] px-2 py-0.5 font-bold tracking-wider border-none uppercase">Verified Admin</Badge>
                                <Badge variant="secondary" className="text-[9px] px-2 py-0.5 font-bold tracking-wider border-none uppercase">2FA Active</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Full Identity</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-sm font-medium text-admin-value focus:bg-card-bg focus:border-pace-purple outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Authorized Username</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim opacity-50" />
                                <input
                                    type="text"
                                    value={user?.username}
                                    readOnly
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle/50 text-sm font-medium text-admin-dim cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Phone Nexus</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-sm font-medium text-admin-value focus:bg-card-bg focus:border-pace-purple outline-none transition-all tabular-nums"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Infrastructure Organization</label>
                            <div className="relative">
                                <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim opacity-50" />
                                <input
                                    type="text"
                                    value={account?.isp_name || 'Pace PPPoE'}
                                    readOnly
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle/50 text-sm font-medium text-admin-dim cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-8 border-t border-pace-border">
                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(true)}
                            className="text-xs font-semibold text-admin-dim hover:text-pace-purple transition-colors uppercase tracking-wider"
                        >
                            Rotate Password
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:opacity-95 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Commit Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Gateway Settings */}
            {user && ['admin', 'superadmin'].includes(user.type) && (
                <div className="bg-card-bg border border-pace-border rounded-xl p-8 space-y-8 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-admin-value flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <CreditCard size={18} className="text-green-600" />
                                </div>
                                M-Pesa Gateway Integration
                            </h2>
                            <p className="text-xs font-medium text-admin-dim mt-1">Configure your STK Push & C2B credentials</p>
                        </div>
                        <Badge variant="secondary" className="text-[9px] font-bold tracking-widest border-none uppercase px-2 py-0.5">Daraja v2.0</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Business Shortcode</label>
                            <input 
                                type="text"
                                defaultValue="400200"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Store / Till Number</label>
                            <input 
                                type="text"
                                defaultValue="987654"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Consumer Key</label>
                            <div className="relative">
                                <input 
                                    type="password"
                                    defaultValue="••••••••••••••••••••••••••••••••"
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-pace-purple uppercase">Reveal</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-8 border-t border-pace-border">
                        <button className="px-8 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:opacity-95 transition-all shadow-sm active:scale-95">
                            Update Gateway
                        </button>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Rotate Password"
                description="Update your administrative access key"
                footer={
                    <>
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="px-4 py-2 border border-pace-border text-admin-dim rounded-xl text-xs font-medium hover:bg-pace-bg-subtle transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleChangePassword}
                            disabled={saving}
                            className="px-6 py-2 bg-pace-purple text-white rounded-xl text-xs font-medium hover:opacity-90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving && <Loader2 size={12} className="animate-spin" />}
                            Update Key
                        </button>
                    </>
                }
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">New Key</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-sm font-medium outline-none focus:border-pace-purple transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Confirm Key</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-sm font-medium outline-none focus:border-pace-purple transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </Modal>

            {/* Save Modal */}
            <Modal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                title="Identity Updated"
                description="Your administrative parameters have been synchronized"
                type="success"
                confirmText="Continue"
                onConfirm={() => setShowSaveModal(false)}
            />
        </div>
    )
}
