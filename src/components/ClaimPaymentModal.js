"use client"

import React, { useState, useEffect, useRef } from 'react'
import { 
    Search, CheckCircle2, AlertCircle, RefreshCw, Smartphone, 
    User, Calendar, ShieldCheck, ArrowRight, Wallet, Radio, Zap,
    FileText, X, Check, Link as LinkIcon
} from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Badge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import { financeService } from '@/services/isp/finance'
import { toast } from 'sonner'

export function ClaimPaymentModal({ isOpen, onClose, onSuccess }) {
    const [rawInput, setRawInput] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [verifiedPayment, setVerifiedPayment] = useState(null)
    const [verifyError, setVerifyError] = useState(null)

    // Subscriber search & selection
    const [subSearchQuery, setSubSearchQuery] = useState('')
    const [isSearchingSubs, setIsSearchingSubs] = useState(false)
    const [subscriberOptions, setSubscriberOptions] = useState([])
    const [selectedSubscriber, setSelectedSubscriber] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset state on open/close
    useEffect(() => {
        if (!isOpen) {
            setRawInput('')
            setVerifiedPayment(null)
            setVerifyError(null)
            setSubSearchQuery('')
            setSubscriberOptions([])
            setSelectedSubscriber(null)
            setIsVerifying(false)
            setIsSubmitting(false)
        }
    }, [isOpen])

    // Handle M-Pesa Code Verification
    const handleVerify = async (e) => {
        if (e) e.preventDefault()
        if (!rawInput.trim()) {
            toast.error('Input Required', { description: 'Please enter an M-Pesa transaction code or paste the message.' })
            return
        }

        setIsVerifying(true)
        setVerifyError(null)
        setVerifiedPayment(null)
        setSelectedSubscriber(null)

        try {
            const res = await financeService.inspectPayment(rawInput.trim())
            if (res && res.status === 'success' && res.data) {
                setVerifiedPayment(res.data)
                toast.success('Unallocated Payment Found', {
                    description: `Transaction ${res.data.receipt_number} of KES ${Number(res.data.amount).toLocaleString()} is ready to be linked.`
                })
                // Pre-populate search query if phone is available
                if (res.data.phone_number) {
                    searchSubscribers(res.data.phone_number)
                }
            } else {
                const errMsg = res?.message || 'Transaction could not be verified'
                setVerifyError(errMsg)
                toast.error('Transaction Not Found', { description: errMsg })
            }
        } catch (err) {
            console.error("Payment inspect error:", err)
            const errMsg = err?.message || 'Network error verifying transaction'
            setVerifyError(errMsg)
            toast.error('Verification Error', { description: errMsg })
        } finally {
            setIsVerifying(false)
        }
    }

    // Search subscribers for suggestion
    const searchSubscribers = async (query) => {
        if (!query || query.trim().length === 0) {
            setSubscriberOptions([])
            return
        }
        setIsSearchingSubs(true)
        try {
            const res = await financeService.searchSubscribersForClaim(query.trim())
            if (res && res.status === 'success' && Array.isArray(res.data?.subscribers)) {
                setSubscriberOptions(res.data.subscribers)
            } else {
                setSubscriberOptions([])
            }
        } catch (err) {
            console.error("Subscriber search failed:", err)
            setSubscriberOptions([])
        } finally {
            setIsSearchingSubs(false)
        }
    }

    // Debounced search when typing
    useEffect(() => {
        if (!verifiedPayment) return
        const timer = setTimeout(() => {
            if (subSearchQuery.trim().length > 0) {
                searchSubscribers(subSearchQuery)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [subSearchQuery, verifiedPayment])

    // Submit and Link Payment
    const handleClaimSubmit = async () => {
        if (!verifiedPayment) {
            toast.error('Verify Payment First', { description: 'Please enter and verify a valid M-Pesa transaction code.' })
            return
        }
        if (!selectedSubscriber) {
            toast.error('Select Subscriber', { description: 'Please select which customer this payment belongs to.' })
            return
        }

        setIsSubmitting(true)
        try {
            const res = await financeService.claimPayment({
                code: verifiedPayment.receipt_number,
                subscriberId: selectedSubscriber.id
            })

            if (res && res.status === 'success') {
                toast.success('Payment Successfully Linked & Activated!', {
                    description: `KES ${Number(verifiedPayment.amount).toLocaleString()} credited to ${selectedSubscriber.name}. Status: ${res.data?.status || 'Active'}.`
                })
                if (onSuccess) onSuccess(res.data)
                onClose()
            } else {
                toast.error('Claim Failed', { description: res?.message || 'Could not link payment.' })
            }
        } catch (err) {
            console.error("Claim submit error:", err)
            toast.error('Processing Error', { description: err?.message || 'Server error while linking payment.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Claim & Link M-Pesa Payment"
            description="Reconcile payments made with wrong/missing account numbers directly to the intended subscriber and instantly restore their internet access."
            maxWidth="max-w-2xl"
        >
            <div className="space-y-5 font-figtree">
                
                {/* STEP 1: Enter Code / Paste SMS Message */}
                <div className="bg-card-bg/60 border border-pace-border/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-pace-border/50">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-pace-purple/10 text-pace-purple flex items-center justify-center">
                                <FileText size={13} />
                            </div>
                            <h4 className="text-xs font-bold text-admin-value uppercase tracking-wider">
                                1. M-Pesa Confirmation SMS or Receipt Code
                            </h4>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <textarea
                            rows={2}
                            value={rawInput}
                            onChange={(e) => {
                                setRawInput(e.target.value)
                                if (verifiedPayment) setVerifiedPayment(null)
                                if (verifyError) setVerifyError(null)
                            }}
                            placeholder="Paste the customer's full M-Pesa SMS message or type the transaction code (e.g. TK456789XY)..."
                            className="w-full px-3.5 py-2.5 bg-pace-bg-subtle/80 border border-pace-border rounded-xl text-xs font-mono font-medium text-admin-value outline-none focus:border-pace-purple focus:ring-1 focus:ring-pace-purple/30 transition-all resize-none"
                        />

                        <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] text-admin-dim">
                                Accepts full SMS (e.g. <i>"TK456789XY Confirmed. Ksh 1,500.00 received..."</i>) or direct code.
                            </p>
                            <button
                                type="button"
                                onClick={handleVerify}
                                disabled={isVerifying || !rawInput.trim()}
                                className="px-4 py-2 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:bg-pace-purple/90 transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw size={12} className={cn(isVerifying && "animate-spin")} />
                                <span>{isVerifying ? 'Verifying...' : 'Verify Transaction'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Verification Error */}
                    {verifyError && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs animate-in fade-in">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold">Unable to claim transaction: </span>
                                <span>{verifyError}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* STEP 2: Verified Transaction Card */}
                {verifiedPayment && (
                    <div className="bg-gradient-to-br from-emerald-500/5 to-pace-purple/5 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs animate-in fade-in zoom-in-98 duration-300">
                        <div className="flex items-center justify-between pb-1 border-b border-emerald-500/20">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <ShieldCheck size={13} />
                                </div>
                                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                    2. Verified Unallocated Payment
                                </h4>
                            </div>
                            <Badge variant="success" className="text-[10px] font-mono font-bold">
                                UNALLOCATED & CLAIMABLE
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-card-bg/70 border border-pace-border/60 rounded-xl p-3.5">
                            <div>
                                <p className="text-[10px] font-semibold text-admin-dim uppercase">Amount Paid</p>
                                <p className="text-sm font-bold text-pace-purple font-mono mt-0.5">
                                    KES {Number(verifiedPayment.amount).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-admin-dim uppercase">Receipt Code</p>
                                <p className="text-xs font-bold text-admin-value font-mono mt-0.5">
                                    {verifiedPayment.receipt_number}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-admin-dim uppercase">Payer Phone</p>
                                <p className="text-xs font-semibold text-admin-value font-mono mt-0.5">
                                    {verifiedPayment.phone_number || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-admin-dim uppercase">Typed Ref</p>
                                <p className="text-xs font-semibold text-rose-500 font-mono mt-0.5 truncate" title={verifiedPayment.account_reference}>
                                    {verifiedPayment.account_reference || 'UNKNOWN'}
                                </p>
                            </div>
                        </div>

                        {/* STEP 3: Assign to Subscriber Search */}
                        <div className="space-y-2 pt-1">
                            <label className="text-[11px] font-semibold text-admin-value flex items-center gap-1.5">
                                <span>3. Assign to Subscriber</span>
                                <span className="text-red-500">*</span>
                                <span className="text-[10px] text-admin-dim font-normal">(Search your registered customers)</span>
                            </label>

                            <div className="relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                                <input
                                    type="text"
                                    value={subSearchQuery}
                                    onChange={(e) => {
                                        setSubSearchQuery(e.target.value)
                                        if (selectedSubscriber) setSelectedSubscriber(null)
                                    }}
                                    placeholder="Search subscriber by name, username, phone, or account number..."
                                    className="w-full pl-10 pr-10 py-2.5 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value outline-none focus:border-pace-purple focus:ring-1 focus:ring-pace-purple/30 transition-all"
                                />
                                {isSearchingSubs && (
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                        <RefreshCw size={13} className="animate-spin text-pace-purple" />
                                    </div>
                                )}
                            </div>

                            {/* Subscriber Suggestions Dropdown List */}
                            {subscriberOptions.length > 0 && !selectedSubscriber && (
                                <div className="max-h-48 overflow-y-auto divide-y divide-pace-border border border-pace-border rounded-xl bg-card-bg shadow-md">
                                    {subscriberOptions.map((sub) => (
                                        <div
                                            key={sub.id}
                                            onClick={() => {
                                                setSelectedSubscriber(sub)
                                                setSubSearchQuery(`${sub.name} (${sub.username})`)
                                            }}
                                            className="p-3 hover:bg-pace-purple/5 transition-colors cursor-pointer flex items-center justify-between gap-3"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-admin-value truncate">{sub.name}</span>
                                                    <span className="text-[10px] font-mono text-pace-purple bg-pace-purple/10 px-1.5 py-0.5 rounded">
                                                        @{sub.username}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-admin-dim">
                                                    <span>Acc: <strong className="font-mono text-admin-value">{sub.account_number}</strong></span>
                                                    <span>•</span>
                                                    <span>{sub.phone}</span>
                                                    <span>•</span>
                                                    <span>Plan: {sub.plan_name || 'Standard'} (KES {Number(sub.plan_price || 0).toLocaleString()})</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="px-2.5 py-1 bg-pace-purple text-white text-[10px] font-bold rounded-lg shrink-0 hover:bg-pace-purple/90"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Selected Subscriber Preview Card */}
                            {selectedSubscriber && (
                                <div className="p-3.5 rounded-xl bg-card-bg border border-pace-purple/40 ring-1 ring-pace-purple/20 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-xl bg-pace-purple/10 text-pace-purple flex items-center justify-center shrink-0">
                                            <Check size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-admin-value truncate">
                                                {selectedSubscriber.name} <span className="font-normal font-mono text-pace-purple">(@{selectedSubscriber.username})</span>
                                            </p>
                                            <p className="text-[11px] text-admin-dim mt-0.5">
                                                Account: <strong className="font-mono text-admin-value">{selectedSubscriber.account_number}</strong> | Plan: {selectedSubscriber.plan_name || 'QoS'} (KES {Number(selectedSubscriber.plan_price || 0).toLocaleString()})
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedSubscriber(null)
                                            setSubSearchQuery('')
                                        }}
                                        className="p-1 text-admin-dim hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                                        title="Change selected subscriber"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Actions Confirmation */}
                        <div className="pt-2 flex items-center justify-end gap-3 border-t border-pace-border/50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle rounded-xl border border-pace-border transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleClaimSubmit}
                                disabled={isSubmitting || !selectedSubscriber}
                                className="px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-bold hover:bg-pace-purple/90 transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Zap size={13} className={cn(isSubmitting && "animate-spin")} />
                                <span>{isSubmitting ? 'Linking & Activating...' : `Link KES ${Number(verifiedPayment.amount).toLocaleString()} & Connect`}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}
