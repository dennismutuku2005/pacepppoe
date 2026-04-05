"use client"

import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Globe, Shield, Loader2, CheckCircle2, AlertCircle, Activity, CreditCard } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { authService } from '@/lib/auth'
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
    }

    const handleUpdateSystem = async (field, value) => {
        setSysSaving(true)
        const newSettings = { ...systemSettings, [field]: value ? 1 : 0 }
        
        try {
            const res = await systemService.updateSettings({ [field]: value ? 1 : 0 })
            if (res.status === 'success') {
                setSystemSettings(newSettings)
                setSuccessMsg(`Setting updated: ${field.replace(/_/g, ' ')}`)
            } else {
                setError(res.message || "Failed to update setting")
            }
        } catch (err) {
            setError("Network error updating system data")
        } finally {
            setSysSaving(false)
            setTimeout(() => setSuccessMsg(null), 3000)
        }
    }

    const ToggleSwitch = ({ checked, onChange, label, sublabel, icon: Icon, disabled }) => (
        <div className="flex items-center justify-between p-4 bg-pace-bg-subtle border border-pace-border rounded-xl group hover:border-pace-purple/30 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-card-bg border border-pace-border flex items-center justify-center text-pace-purple shrink-0 group-hover:scale-105 transition-transform">
                    {Icon && <Icon size={18} />}
                </div>
                <div>
                    <h4 className="text-[11px] font-bold text-admin-value uppercase tracking-tight">{label}</h4>
                    <p className="text-[9px] text-admin-dim font-medium uppercase tracking-tighter mt-1">{sublabel}</p>
                </div>
            </div>
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pace-purple/20 border-2 border-transparent",
                    checked ? "bg-pace-purple" : "bg-gray-200",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <span
                    className={cn(
                        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    )

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
            <div className="space-y-4 animate-in fade-in duration-500 pb-6 max-w-4xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-pace-border pb-3">
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                </div>
                <div className="bg-card-bg border border-pace-border rounded-xl p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500 max-w-4xl mx-auto pb-6 px-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-pace-border pb-3">
                <div>
                    <h1 className="text-lg font-semibold text-admin-value leading-tight">Account Settings</h1>
                    <p className="text-xs text-admin-dim mt-0.5">View personal profile and account information.</p>
                </div>
                {(error || successMsg) && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium animate-in slide-in-from-right-4 ${error ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                        <span>{error || successMsg}</span>
                    </div>
                )}
            </div>

            {/* Profile Header */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-pace-border bg-pace-bg-subtle">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                        <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-card-bg border-4 border-pace-border flex items-center justify-center text-pace-purple font-bold text-2xl sm:text-3xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-pace-purple to-purple-800 opacity-10"></div>
                                <span className="relative z-10">{getUserInitials()}</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-admin-value">{user?.name}</h3>

                            <div className="flex gap-2 mt-3 justify-center sm:justify-start flex-wrap">
                                <Badge variant="success" className="text-[9px] px-2 py-0.5 font-medium border-none bg-green-500/10 text-green-500">Verified Account</Badge>
                                <Badge variant="outline" className="text-[9px] px-2 py-0.5 font-medium border-gray-200 text-gray-500">2FA Enabled</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Grid */}
                <form onSubmit={handleUpdateProfile} className="p-4 sm:p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-3 sm:gap-6">
                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-[9px] sm:text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <User size={14} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-2 sm:py-2.5 rounded-lg border border-pace-border bg-pace-bg-subtle text-[11px] sm:text-sm font-medium text-admin-value focus:bg-card-bg focus:border-pace-purple outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Username (Read Only) */}
                        <div className="space-y-1">
                            <label className="text-[9px] sm:text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">Username</label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={user?.username}
                                    readOnly
                                    className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-2 sm:py-2.5 rounded-lg border border-pace-border bg-pace-bg-subtle/60 text-[11px] sm:text-sm font-medium text-admin-dim cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1">
                            <label className="text-[9px] sm:text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">Phone</label>
                            <div className="relative">
                                <Phone size={14} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-2 sm:py-2.5 rounded-lg border border-pace-border bg-pace-bg-subtle text-[11px] sm:text-sm font-medium text-admin-value focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/5 focus:border-pace-purple outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Organization */}
                        <div className="space-y-1">
                            <label className="text-[9px] sm:text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">Organization</label>
                            <div className="relative">
                                <Globe size={14} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={account?.isp_name || 'Pace Wisp'}
                                    readOnly
                                    className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-2 sm:py-2.5 rounded-lg border border-pace-border bg-pace-bg-subtle/60 text-[11px] sm:text-sm font-medium text-admin-dim cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-pace-border">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-pace-purple text-white rounded-lg text-xs font-semibold hover:bg-pace-purple/90 transition-all shadow-sm flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-70"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin text-white" /> : 'Save Changes'}
                        </button>
                    </div>

                    {/* Password Section */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="space-y-1">
                            <label className="text-[9px] sm:text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">Password</label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    defaultValue="••••••••••••"
                                    readOnly
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-pace-border bg-pace-bg-subtle text-sm font-medium text-admin-dim cursor-not-allowed outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(true)}
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-pace-bg-subtle text-admin-dim rounded-lg font-medium text-[11px] sm:text-sm hover:bg-card-bg transition-all border border-pace-border"
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* System Settings for Admin Only */}
            {/* Payment Gateway Settings for Admin Only */}
            {user && ['admin', 'superadmin'].includes(user.type) && (
                <div className="bg-card-bg border border-pace-border rounded-xl p-6 sm:p-8 space-y-6 mt-6 shadow-sm border-t-4 border-t-pace-purple">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-pace-purple uppercase tracking-tight flex items-center gap-2">
                                <CreditCard size={18} />
                                M-Pesa Gateway Integration
                            </h2>
                            <p className="text-[10px] text-admin-dim uppercase tracking-widest mt-1">Configure your STK Push & C2B credentials</p>
                        </div>
                        <Badge className="bg-pace-purple/10 text-pace-purple border-none uppercase font-black tracking-tighter text-[9px]">Daraja API v2</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Business Shortcode (Paybill)</label>
                            <input 
                                type="text"
                                defaultValue="400200"
                                className="w-full px-4 py-3 bg-pace-bg-subtle border border-pace-border rounded-xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                placeholder="e.g. 174379"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Store / Till Number</label>
                            <input 
                                type="text"
                                defaultValue="987654"
                                className="w-full px-4 py-3 bg-pace-bg-subtle border border-pace-border rounded-xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                placeholder="e.g. 522522"
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Consumer Key</label>
                            <div className="relative">
                                <input 
                                    type="password"
                                    defaultValue="••••••••••••••••••••••••••••••••"
                                    className="w-full px-4 py-3 bg-pace-bg-subtle border border-pace-border rounded-xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-pace-purple uppercase">Reveal</button>
                            </div>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Consumer Secret</label>
                            <div className="relative">
                                <input 
                                    type="password"
                                    defaultValue="••••••••••••••••••••••••••••••••"
                                    className="w-full px-4 py-3 bg-pace-bg-subtle border border-pace-border rounded-xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-pace-purple uppercase">Reveal</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-pace-border mt-2">
                        <button className="px-6 py-2.5 bg-pace-purple text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-pace-purple/20">
                            Update Gateway
                        </button>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Change Password"
                maxWidth="max-w-md"
                footer={
                    <>
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="px-4 py-2 border border-pace-border text-admin-dim rounded-lg text-xs font-medium hover:bg-pace-bg-subtle transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleChangePassword}
                            disabled={saving}
                            className="px-4 py-2 bg-pace-purple text-white rounded-lg text-xs font-medium hover:bg-pace-purple/90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
                        >
                            {saving && <Loader2 size={12} className="animate-spin" />}
                            Update Password
                        </button>
                    </>
                }
            >
                <div className="space-y-4 p-1">
                    <p className="text-xs text-gray-500">Update your account password. You will be able to use the new password immediately.</p>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">New Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-pace-border bg-pace-bg-subtle text-sm font-medium outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple transition-all"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Confirm New Password</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-pace-border bg-pace-bg-subtle text-sm font-medium outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple transition-all"
                            placeholder="Confirm new password"
                        />
                    </div>
                    {error && <p className="text-[10px] text-red-500 font-medium px-1">{error}</p>}
                </div>
            </Modal>

            {/* Save Confirmation Modal */}
            <Modal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                title="Account Updated"
                maxWidth="max-w-sm"
                footer={
                    <button
                        onClick={() => setShowSaveModal(false)}
                        className="px-4 py-2 bg-pace-purple text-white rounded-lg text-xs font-medium hover:bg-pace-purple/90 transition-all shadow-sm w-full"
                    >
                        Done
                    </button>
                }
            >
                <div className="p-1">
                    <p className="text-sm text-admin-dim leading-relaxed">
                        Your account information has been successfully updated.
                    </p>
                </div>
            </Modal>
        </div >
    )
}
