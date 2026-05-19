"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { CreditCard, Shield, Key, Smartphone, Globe, Save, RefreshCw, Lock, Activity } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { FormPageSkeleton } from '@/components/Skeleton'

function PaymentConfigContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [config, setConfig] = useState({
        paybill: '522533',
        account_name: 'PACE ISP',
        shortcode: '174379',
        consumer_key: 'XXXXXXXXXXXXXX',
        consumer_secret: 'XXXXXXXXXXXXXX',
        passkey: 'XXXXXXXXXXXXXX',
        callback_url: 'https://api.pace.com/mpesa/callback',
        min_amount: '500',
        max_amount: '100000',
        env: 'production'
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleSave = (e) => {
        e.preventDefault()
        setIsSaving(true)
        setTimeout(() => {
            setIsSaving(false)
            toast.success('Financial Logic Updated', {
                description: 'M-Pesa Daraja configuration has been synchronized with the orchestration layer.'
            })
        }, 1500)
    }

    if (isLoading) {
        return <FormPageSkeleton />
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1200px] mx-auto pb-10 px-4 sm:px-0 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-semibold text-admin-value tracking-tight">Payment Gateway Core</h1>
                    <p className="text-xs text-gray-500 mt-1">M-Pesa Daraja API and automation topology</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-xl shadow-pace-purple/20 active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* General Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-pace-border">
                            <Smartphone size={16} className="text-pace-purple" />
                            <h2 className="text-[11px] font-black tracking-widest">Business Particulars</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Service Paybill</label>
                                <input 
                                    type="text"
                                    value={config.paybill}
                                    onChange={(e) => setConfig({...config, paybill: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all tabular-nums"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Business Name</label>
                                <input 
                                    type="text"
                                    value={config.account_name}
                                    onChange={(e) => setConfig({...config, account_name: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">LIPA NA MPESA SHORTCODE</label>
                                <input 
                                    type="text"
                                    value={config.shortcode}
                                    onChange={(e) => setConfig({...config, shortcode: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all tabular-nums"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Environment State</label>
                                <select 
                                    value={config.env}
                                    onChange={(e) => setConfig({...config, env: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                                >
                                    <option value="sandbox">Sandbox (Testing)</option>
                                    <option value="production">Production (Live)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-pace-border">
                            <Shield size={16} className="text-pace-purple" />
                            <h2 className="text-[11px] font-black tracking-widest">Daraja API Credentials</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Consumer Key</label>
                                <div className="relative">
                                    <input 
                                        type="password"
                                        value={config.consumer_key}
                                        onChange={(e) => setConfig({...config, consumer_key: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                                    />
                                    <Lock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Consumer Secret</label>
                                <div className="relative">
                                    <input 
                                        type="password"
                                        value={config.consumer_secret}
                                        onChange={(e) => setConfig({...config, consumer_secret: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                                    />
                                    <Lock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Online Passkey</label>
                                <div className="relative">
                                    <input 
                                        type="password"
                                        value={config.passkey}
                                        onChange={(e) => setConfig({...config, passkey: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                                    />
                                    <Key size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-admin-dim" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Automation & Limits */}
                <div className="space-y-6">
                    <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-pace-border">
                            <Globe size={16} className="text-pace-purple" />
                            <h2 className="text-[11px] font-black tracking-widest">Callback Topology</h2>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Endpoint URL</label>
                            <input 
                                type="text"
                                value={config.callback_url}
                                onChange={(e) => setConfig({...config, callback_url: e.target.value})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-dim outline-none focus:border-pace-purple transition-all font-mono lowercase"
                            />
                        </div>
                        <div className="p-3 bg-pace-purple/5 border border-pace-purple/10 rounded-xl">
                            <p className="text-[9px] text-pace-purple font-bold leading-relaxed">
                                This endpoint must be publicly accessible and protected by TLS/SSL to receive M-Pesa push notifications.
                            </p>
                        </div>
                    </div>

                    <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-pace-border">
                            <Activity size={16} className="text-pace-purple" />
                            <h2 className="text-[11px] font-black tracking-widest">Transaction Guard</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Min Threshold</label>
                                <input 
                                    type="number"
                                    value={config.min_amount}
                                    onChange={(e) => setConfig({...config, min_amount: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all tabular-nums"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-admin-dim tracking-widest pl-1">Max Threshold</label>
                                <input 
                                    type="number"
                                    value={config.max_amount}
                                    onChange={(e) => setConfig({...config, max_amount: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all tabular-nums"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PaymentConfigPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse uppercase text-[10px] font-bold tracking-widest">Syncing Gateway Topology...</div>}>
            <PaymentConfigContent />
        </Suspense>
    )
}
