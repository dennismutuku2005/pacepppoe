"use client"

import React, { useState, useEffect } from 'react'
import { User, ShieldCheck, Mail, Phone, Lock, Save, RefreshCw, Key, ShieldAlert } from 'lucide-react'
import { profileService } from '@/services/profile'
import { toast } from 'sonner'

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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
      if (res && res.status === 'success') {
        setProfile(res.data)
        setName(res.data.name || '')
        setEmail(res.data.email || '')
        setPhone(res.data.phone || '')
      } else {
        toast.error(res?.message || 'Failed to retrieve profile details')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error fetching profile details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name field cannot be empty.')
      return
    }

    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setIsSaving(true)
    try {
      const payload = { name, email, phone }
      if (password) {
        payload.password = password
      }

      const res = await profileService.updateProfile(payload)
      if (res && res.status === 'success') {
        toast.success('Profile details successfully updated.')
        setPassword('')
        setConfirmPassword('')
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

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1200px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">Admin Profile Settings</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Manage your administrative credentials and security tokens.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-pace-purple w-8 h-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Info summary */}
          <div className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-6 shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pace-purple to-indigo-500" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-pace-purple/10 border border-pace-purple/35 flex items-center justify-center text-pace-purple text-xl font-bold tracking-wider mb-4 shadow-inner">
                {getInitials(name || profile?.name)}
              </div>
              
              <h2 className="text-base font-bold text-admin-value">{name || profile?.name}</h2>
              <p className="text-xs font-semibold text-pace-purple mt-1 uppercase tracking-wider">System Administrator</p>
              
              <div className="w-full border-t border-pace-border my-6" />
              
              <div className="w-full space-y-4 text-left">
                <div>
                  <p className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">System Username</p>
                  <p className="text-xs font-mono font-bold text-admin-value mt-1">{profile?.username}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">Console Status</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-wider">
                      <ShieldCheck size={10} /> Active Secure
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">Registered Since</p>
                  <p className="text-xs font-semibold text-admin-value mt-1">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Edit Form */}
          <div className="lg:col-span-2 relative overflow-hidden bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-admin-value mb-4">Modify Credentials</h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Display Name</label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim w-4 h-4" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Admin Name"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Email Address</label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@pace.com"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Mobile Phone</label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim w-4 h-4" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="254711223344"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full border-t border-pace-border my-6" />
              
              <h3 className="text-sm font-bold text-admin-value mb-4 flex items-center gap-1.5">
                <Key size={16} className="text-pace-purple" /> Change Password
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">New Password</label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim w-4 h-4" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-admin-dim font-bold">Confirm New Password</label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim w-4 h-4" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-row items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={loadProfile}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl text-xs font-semibold hover:border-pace-purple hover:text-pace-purple transition-all"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="animate-spin w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

    </div>
  )
}
