"use client"

import React, { useState, useEffect } from 'react'
import { 
  User, ShieldCheck, Mail, Phone, Lock, 
  Save, RefreshCw, Key, Eye, EyeOff, CheckCircle2, Shield
} from 'lucide-react'
import { profileService } from '@/services/profile'
import authService from '@/lib/auth'
import { toast } from 'sonner'

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const getInitials = (nameVal) => {
    if (!nameVal) return 'AD'
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

        // Keep local auth storage in sync
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
      toast.error('Network error fetching profile details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Display Name cannot be empty')
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
        loadProfile()
      } else {
        toast.error(res?.message || 'Failed to save profile changes')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error updating profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error('Current password is required')
      return
    }

    if (!password) {
      toast.error('New password cannot be empty')
      return
    }

    if (password.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setIsChangingPassword(true)
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        current_password: currentPassword,
        password: password
      }

      const res = await profileService.updateProfile(payload)
      if (res && res.status === 'success') {
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setPassword('')
        setConfirmPassword('')
      } else {
        toast.error(res?.message || 'Failed to update password')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error changing password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">Admin Profile Settings</h1>
          <p className="text-xs font-medium text-admin-dim mt-1">Manage your administrator credentials and security settings.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadProfile}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-card-bg hover:text-admin-value transition-all text-xs font-medium cursor-pointer disabled:opacity-50"
            title="Reload Profile"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        /* Skeleton Loading State */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Card Skeleton */}
          <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-xs flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-pace-bg-subtle border border-pace-border animate-pulse mb-4" />
            <div className="h-4 w-32 bg-pace-bg-subtle rounded-md animate-pulse mb-2" />
            <div className="h-3 w-24 bg-pace-bg-subtle rounded-md animate-pulse mb-6" />
            
            <div className="w-full border-t border-pace-border my-4" />
            
            <div className="w-full space-y-4">
              <div>
                <div className="h-2.5 w-24 bg-pace-bg-subtle rounded animate-pulse mb-1.5" />
                <div className="h-4 w-36 bg-pace-bg-subtle/80 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-2.5 w-20 bg-pace-bg-subtle rounded animate-pulse mb-1.5" />
                <div className="h-5 w-24 bg-pace-bg-subtle/80 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="h-2.5 w-24 bg-pace-bg-subtle rounded animate-pulse mb-1.5" />
                <div className="h-4 w-40 bg-pace-bg-subtle/80 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Card Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="h-4 w-40 bg-pace-bg-subtle rounded animate-pulse mb-2" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-20 bg-pace-bg-subtle rounded animate-pulse" />
                  <div className="h-9 w-full bg-pace-bg-subtle/70 rounded-xl border border-pace-border animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-pace-bg-subtle rounded animate-pulse" />
                  <div className="h-9 w-full bg-pace-bg-subtle/70 rounded-xl border border-pace-border animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-pace-bg-subtle rounded animate-pulse" />
                  <div className="h-9 w-full bg-pace-bg-subtle/70 rounded-xl border border-pace-border animate-pulse" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <div className="h-9 w-32 bg-pace-bg-subtle rounded-xl animate-pulse" />
              </div>
            </div>

            <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="h-4 w-36 bg-pace-bg-subtle rounded animate-pulse mb-2" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-28 bg-pace-bg-subtle rounded animate-pulse" />
                  <div className="h-9 w-full bg-pace-bg-subtle/70 rounded-xl border border-pace-border animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-pace-bg-subtle rounded animate-pulse" />
                  <div className="h-9 w-full bg-pace-bg-subtle/70 rounded-xl border border-pace-border animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-pace-bg-subtle rounded animate-pulse" />
                  <div className="h-9 w-full bg-pace-bg-subtle/70 rounded-xl border border-pace-border animate-pulse" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <div className="h-9 w-36 bg-pace-bg-subtle rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Loaded Profile Content */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Info summary */}
          <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-pace-purple/10 border border-pace-purple/20 flex items-center justify-center text-pace-purple text-xl font-bold tracking-tight mb-3">
                {getInitials(name || profile?.name)}
              </div>
              
              <h2 className="text-base font-semibold text-admin-value">{name || profile?.name || 'Administrator'}</h2>
              <p className="text-xs font-medium text-admin-dim mt-0.5 capitalize">{profile?.role || 'Administrator'}</p>
              
              <div className="w-full border-t border-pace-border my-5" />
              
              <div className="w-full space-y-4 text-left">
                <div>
                  <p className="text-xs font-medium text-admin-dim">System username</p>
                  <p className="text-xs font-mono font-semibold text-admin-value mt-1">{profile?.username || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-admin-dim">Console status</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <ShieldCheck size={12} /> Active
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-admin-dim">Registered since</p>
                  <p className="text-xs font-medium text-admin-value mt-1">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
                {profile?.last_login && (
                  <div>
                    <p className="text-xs font-medium text-admin-dim">Last login</p>
                    <p className="text-xs font-medium text-admin-value mt-1">
                      {new Date(profile.last_login).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Edit Form & Password Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Information Card */}
            <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-pace-border">
                <User size={16} className="text-pace-purple" />
                <h3 className="text-sm font-semibold text-admin-value">Profile Information</h3>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-admin-dim">Display Name</label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim w-4 h-4" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Admin Name"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-medium text-admin-value outline-none focus:bg-card-bg focus:border-pace-purple transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-admin-dim">Email Address</label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim w-4 h-4" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@pace.com"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-medium text-admin-value outline-none focus:bg-card-bg focus:border-pace-purple transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-admin-dim">Phone Number</label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim w-4 h-4" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="254711223344"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-medium text-admin-value outline-none focus:bg-card-bg focus:border-pace-purple transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 shadow-xs"
                  >
                    {isSaving ? (
                      <RefreshCw className="animate-spin w-3.5 h-3.5" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Profile</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-pace-border">
                <Key size={16} className="text-pace-purple" />
                <h3 className="text-sm font-semibold text-admin-value">Change Password</h3>
              </div>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-admin-dim">Current Password</label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim w-4 h-4" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-medium text-admin-value outline-none focus:bg-card-bg focus:border-pace-purple transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-dim hover:text-admin-value transition-colors p-0.5"
                      >
                        {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-admin-dim">New Password</label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim w-4 h-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-medium text-admin-value outline-none focus:bg-card-bg focus:border-pace-purple transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-dim hover:text-admin-value transition-colors p-0.5"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-admin-dim">Confirm New Password</label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim w-4 h-4" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-medium text-admin-value outline-none focus:bg-card-bg focus:border-pace-purple transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-dim hover:text-admin-value transition-colors p-0.5"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword || !currentPassword || !password}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 shadow-xs"
                  >
                    {isChangingPassword ? (
                      <RefreshCw className="animate-spin w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}
