"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { CreditCard, History, Wallet, Smartphone, ShieldCheck, Download, RefreshCw, Send, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import Swal from 'sweetalert2'

function BillingContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [isStkLoading, setIsStkLoading] = useState(false)
    const [isAddCardOpen, setIsAddCardOpen] = useState(false)
    const [balance, setBalance] = useState(2450.50)
    const [phone, setPhone] = useState('0712345678')

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    const handleStkPush = () => {
        setIsStkLoading(true)
        setTimeout(() => {
            setIsStkLoading(false)
            Swal.fire({
                title: 'STK PUSH SENT',
                text: 'Please enter your M-Pesa PIN on your phone to complete the transaction.',
                icon: 'success',
                confirmButtonColor: '#4B1D8F'
            })
        }, 1500)
    }

    const transactions = [
        { id: 'TRX_001', date: 'Oct 24, 2023', type: 'System Fee', amount: 1500, status: 'Completed', method: 'M-Pesa STK' },
        { id: 'TRX_002', date: 'Sep 24, 2023', type: 'Infrastructure', amount: 950.50, status: 'Completed', method: 'M-Pesa C2B' },
        { id: 'TRX_003', date: 'Aug 24, 2023', type: 'System Fee', amount: 1500, status: 'Completed', method: 'M-Pesa STK' }
    ]

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-lg font-bold text-admin-value flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pace-purple/10 flex items-center justify-center">
                            <CreditCard size={20} className="text-pace-purple" />
                        </div>
                        My Subscription & Billing
                    </h1>
                    <p className="text-[10px] font-bold text-admin-dim mt-1 tracking-widest uppercase italic">Manage system licensing and operational recurring costs</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-pace-purple text-white relative overflow-hidden shadow-2xl shadow-pace-purple/20 group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
                                <Wallet size={80} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[11px] font-black uppercase tracking-widest opacity-60">Pending Balance</p>
                                <h2 className="text-3xl font-black mt-2">KES {balance.toLocaleString()}</h2>
                                <p className="text-[10px] mt-4 font-bold bg-white/20 inline-block px-2 py-0.5 rounded-lg border border-white/10 uppercase italic">Renewal Date: Nov 24, 2023</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white dark:bg-card-bg border border-pace-border shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[11px] font-bold text-admin-dim uppercase tracking-widest">Active Plan</p>
                                    <h3 className="text-xl font-black text-admin-value mt-1">Enterprise Hub</h3>
                                </div>
                                <div className="p-2 bg-pace-green/10 text-pace-green rounded-xl">
                                    <ShieldCheck size={20} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <Badge variant="success" className="text-[9px] uppercase px-3 py-1 font-black italic">Verified</Badge>
                                <span className="text-[10px] text-admin-dim font-bold uppercase tracking-widest">Unlimited Nodes</span>
                            </div>
                        </div>
                    </div>

                    {/* Pay Area */}
                    <div className="p-8 rounded-3xl bg-white dark:bg-card-bg border border-pace-border shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Smartphone size={24} className="text-pace-purple" />
                            <h4 className="text-[15px] font-black text-admin-value uppercase tracking-tight">Pay Instantly via STK Push</h4>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black text-admin-dim uppercase tracking-widest pl-1">Target Phone Number</label>
                                <input 
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. 0712345678"
                                    className="w-full px-5 py-4 bg-pace-bg-subtle border border-transparent focus:border-pace-purple rounded-2xl text-lg font-black text-admin-value outline-none transition-all tabular-nums"
                                />
                            </div>
                            <button 
                                onClick={handleStkPush}
                                disabled={isStkLoading}
                                className={cn(
                                    "px-10 py-5 bg-pace-purple text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-pace-purple/20 transition-all active:scale-95 flex items-center gap-3 h-[60px]",
                                    isStkLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                                )}
                            >
                                {isStkLoading ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                                {isStkLoading ? "Processing" : "Charge M-Pesa"}
                            </button>
                        </div>
                        
                        <div className="mt-10 pt-8 border-t border-pace-border border-dashed grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Alternative: Pay via Paybill</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-pace-bg-subtle rounded-2xl border border-pace-border/50">
                                        <span className="text-[11px] font-bold text-admin-dim uppercase">Business Number</span>
                                        <span className="text-lg font-black text-pace-purple tracking-widest">4081078</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-pace-bg-subtle rounded-2xl border border-pace-border/50">
                                        <span className="text-[11px] font-bold text-admin-dim uppercase">Account Number</span>
                                        <span className="text-lg font-black text-admin-value tracking-widest">PACE-7708</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-pace-purple/5 p-6 rounded-2xl border border-pace-purple/10 flex flex-col justify-center">
                                <p className="text-[10px] font-bold text-pace-purple uppercase tracking-widest text-center mb-2">Automated Activation</p>
                                <p className="text-xs text-admin-dim text-center font-medium leading-relaxed italic">Once payment is completed via M-Pesa, the system will automatically reconcile and extend your subscription license within 60 seconds.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-white dark:bg-card-bg border border-pace-border shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <History size={20} className="text-admin-dim" />
                                <h4 className="text-[13px] font-black text-admin-value uppercase tracking-tight">Recent Ledger</h4>
                            </div>
                            <button className="text-[10px] font-black text-pace-purple uppercase tracking-widest hover:underline">Full Audit</button>
                        </div>
                        <div className="space-y-4 flex-1">
                            {transactions.map((trx) => (
                                <div key={trx.id} className="p-4 rounded-2xl border border-pace-border hover:bg-pace-bg-subtle transition-all group flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[12px] font-bold text-admin-value group-hover:text-pace-purple transition-colors">{trx.type}</p>
                                            <p className="text-[9px] text-admin-dim font-bold uppercase mt-0.5">{trx.id} • {trx.date}</p>
                                        </div>
                                        <span className="text-[13px] font-black text-admin-value tabular-nums">KES {trx.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-pace-border/50">
                                        <Badge variant="success" className="text-[8px] font-bold uppercase border-none px-2 py-0.5">{trx.status}</Badge>
                                        <span className="text-[9px] text-admin-dim font-bold lowercase italic">{trx.method}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8">
                            <button className="w-full py-4 border-2 border-dashed border-pace-border text-admin-dim hover:text-pace-purple hover:border-pace-purple/50 rounded-2xl transition-all flex items-center justify-center gap-2">
                                <Download size={14} />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Download E-Receipt</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function BillingPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse uppercase text-[10px] font-bold tracking-widest italic">Syncing Ledger Credentials...</div>}>
            <BillingContent />
        </Suspense>
    )
}
