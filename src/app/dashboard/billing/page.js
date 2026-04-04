"use client"

import React, { useState, useEffect } from 'react'
import { Receipt, Users, Calendar, AlertCircle, ShieldCheck, Info, TrendingUp, Wallet, ArrowRight, Printer } from 'lucide-react'
import { accountService } from '@/services/account'

import { Skeleton } from '@/components/Skeleton'

export default function BillingPage() {
    const [account, setAccount] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchBillingData()
    }, [])

    const fetchBillingData = async () => {
        setLoading(true)
        try {
            const result = await accountService.getAccountDetails()
            if (result.status === 'success') {
                setAccount(result.data)
            } else {
                throw new Error(result.message)
            }
        } catch (err) {
            setError(err.message)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500 pb-10 font-figtree max-w-[1400px] mx-auto px-4 sm:px-0">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-pace-border pb-3">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32 bg-gray-100 dark:bg-gray-800" />
                        <Skeleton className="h-3 w-64 bg-gray-100 dark:bg-gray-800" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-40 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
                        <Skeleton className="h-64 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
                        <Skeleton className="h-32 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                    <AlertCircle size={20} />
                </div>
                <h2 className="text-sm font-semibold text-admin-value">Connection Issue</h2>
                <p className="text-xs text-admin-dim mt-2 max-w-sm">{error}</p>
                <button
                    onClick={fetchBillingData}
                    className="mt-6 px-4 py-2 bg-pace-purple text-white rounded text-xs font-medium"
                >
                    Retry
                </button>
            </div>
        )
    }

    const { billing, subscription } = account;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 font-figtree text-left max-w-[1400px] mx-auto px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-pace-border pb-3">
                <div>
                    <h1 className="text-lg font-semibold text-admin-value tracking-tight">Your Bill</h1>
                    <p className="text-xs text-admin-dim mt-0.5">Live usage cycle summary.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-pace-bg-subtle rounded-md transition-all text-admin-dim hover:text-admin-value" title="Print Receipt">
                        <Printer size={16} />
                    </button>
                    <div className="h-4 w-px bg-pace-border mx-1"></div>
                    <p className="text-[10px] text-admin-dim font-medium uppercase tracking-wider">Account ID: {account.customer_id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Main Receipt-style Card */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-card-bg border border-pace-border rounded-xl shadow-sm overflow-hidden border-t-4 border-t-pace-purple">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] text-admin-dim font-semibold uppercase tracking-widest">Amount Due to Date</span>
                                <Receipt className="text-admin-dim" size={16} />
                            </div>

                            <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-medium text-admin-dim">KSH</span>
                                <h2 className="text-3xl font-semibold text-admin-value tracking-tight">
                                    {billing.current_estimated_bill.toLocaleString()}
                                </h2>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] text-admin-dim font-medium">
                                    <Calendar size={12} />
                                    <span>Cycle Ends in {subscription.days_left} days</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-admin-dim font-medium">
                                    <Users size={12} />
                                    <span>{billing.user_count} Total Clients</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="px-6 py-3 bg-pace-bg-subtle border-t border-pace-border flex items-center justify-between gap-4">
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-pace-purple transition-all duration-700 ease-out"
                                    style={{ width: `${billing.cycle_progress}%` }}
                                ></div>
                            </div>
                            <span className="text-[10px] font-semibold text-pace-purple whitespace-nowrap">{billing.cycle_progress}% Cycle</span>
                        </div>
                    </div>

                    {/* Breakdown Algorithm */}
                    <div className="bg-card-bg border border-pace-border rounded-xl p-5 shadow-sm">
                        <h3 className="text-xs font-semibold text-admin-value uppercase tracking-wider mb-4">Calculation Detail</h3>

                        <div className="space-y-2.5">
                            {/* Base Tier */}
                            <div className="flex items-center justify-between py-2 border-b border-dashed border-pace-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded bg-pace-bg-subtle text-admin-dim flex items-center justify-center font-bold text-[9px] border border-pace-border">
                                        BASE
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-xs font-medium text-admin-value leading-none">Starter Plan (Pro-rated)</h4>
                                        <p className="text-[9px] text-admin-dim font-medium tracking-tight">KSH 1,499 &times; {billing.cycle_progress}% cycle time elapsed.</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-admin-value">KSH {Math.round(billing.base_fee * billing.cycle_progress / 100).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Additional Clients */}
                            <div className="flex items-center justify-between py-2 border-b border-dashed border-pace-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded bg-orange-500/5 text-orange-600 flex items-center justify-center font-bold text-[9px] border border-orange-200/50">
                                        ADD
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-xs font-medium text-admin-value leading-none">Extra Clients Surcharge</h4>
                                        <p className="text-[9px] text-admin-dim font-medium tracking-tight">{billing.additional_users} clients above the 110-client base limit.</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-admin-value">KSH {billing.extra_fee.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Current Total */}
                            <div className="flex items-center justify-between pt-1 font-semibold text-admin-value text-xs uppercase tracking-tight">
                                <span>Running Total Due</span>
                                <span>KSH {billing.current_estimated_bill.toLocaleString()}</span>
                            </div>

                            {/* Monthly Projection */}
                            <div className="mt-4 pt-4 border-t border-pace-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Info size={12} className="text-admin-dim" />
                                    <span className="text-[10px] font-semibold text-admin-dim uppercase tracking-wider">End of Month Estimate</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-semibold text-pace-purple tracking-tight">KSH {billing.total_monthly_projection.toLocaleString()}</span>
                                    <ArrowRight size={14} className="text-admin-dim" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info Section */}
                <div className="space-y-3">
                    {/* Active Clients Stat */}
                    <div className="bg-card-bg border border-pace-border rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded bg-pace-purple/5 flex items-center justify-center text-pace-purple opacity-70">
                                <Users size={16} />
                            </div>
                            <h4 className="text-[10px] text-admin-dim font-semibold uppercase tracking-wider leading-none pt-1">Current Clients</h4>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-semibold text-admin-value leading-none">{billing.user_count}</span>
                            <span className="text-[9px] text-admin-dim font-semibold uppercase">Total</span>
                        </div>
                    </div>

                    {/* Policy Card */}
                    <div className="bg-pace-bg-subtle border border-pace-border rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="text-admin-dim" size={14} />
                            <h4 className="text-[10px] text-admin-dim font-semibold uppercase tracking-wider pt-0.5">Billing Policy</h4>
                        </div>
                        <p className="text-[11px] text-admin-value font-medium leading-relaxed">
                            KSH 1,499 (110 clients).
                            <br />
                            KSH 8 per client beyond that.
                        </p>
                    </div>

                    {/* Next Payment */}
                    <div className="bg-pace-bg-subtle border border-pace-border rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar size={14} className="text-admin-dim" />
                            <span className="text-[10px] font-semibold text-admin-dim uppercase tracking-wider pt-0.5">Next Invoice</span>
                        </div>
                        <p className="text-xs font-semibold text-admin-value">{new Date(subscription.next_payment).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
