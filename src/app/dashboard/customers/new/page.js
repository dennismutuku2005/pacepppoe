"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Network, CreditCard, ChevronRight,
    ChevronLeft, CheckCircle2, Building2,
    MapPin, Globe, Calendar, BadgeDollarSign,
    ArrowLeft, Send, Sparkles, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NewClientPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        // Step 1: Profile
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        region: 'Nairobi',

        // Step 2: Router
        routerModel: 'MikroTik CCR2004',
        routerIp: '',
        serialNumber: '',

        // Step 3: Financials
        paymentPlan: 'Enterprise',
        billingCycle: 'Monthly',
        accountNumber: 'ACC-' + Math.floor(100000 + Math.random() * 900000),
        nextPayment: (() => {
            const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })()
    })

    const handleNext = () => setStep(s => s + 1)
    const handleBack = () => setStep(s => s - 1)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        // Simulate API call
        await new Promise(r => setTimeout(r, 2000))
        setIsSubmitting(false)
        setStep(4) // Success Step
    }

    const steps = [
        { id: 1, name: 'Client Profile', icon: User },
        { id: 2, name: 'Network Setup', icon: Network },
        { id: 3, name: 'Financial Setup', icon: CreditCard },
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-8 font-figtree pb-20">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-admin-label hover:text-admin-value transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Back to Directory</span>
                </button>
                <div className="text-right">
                    <h1 className="text-[20px] font-bold text-admin-value leading-none">Register New ISP</h1>
                    <p className="text-[11px] text-admin-label mt-2 font-medium uppercase tracking-tighter">Step {step} of 3</p>
                </div>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center justify-between px-10 relative">
                <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-pace-border -translate-y-1/2 z-0"></div>
                {steps.map((s) => (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                            step >= s.id ? "bg-pace-purple border-pace-purple text-white" : "bg-card-bg border-pace-border text-admin-dim"
                        )}>
                            <s.icon size={18} />
                        </div>
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            step >= s.id ? "text-pace-purple" : "text-admin-dim"
                        )}>{s.name}</span>
                    </div>
                ))}
            </div>

            {/* Form Content Area */}
            <div className="bg-card-bg border border-pace-border rounded overflow-hidden shadow-none">
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-bold text-admin-label uppercase tracking-widest">Business Entity Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" size={16} />
                                            <input
                                                value={formData.businessName}
                                                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 rounded border border-pace-border focus:border-pace-purple focus:ring-1 focus:ring-pace-purple/5 outline-none font-bold text-admin-value"
                                                placeholder="e.g. Starlink Connect Ltd"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-admin-label uppercase tracking-widest">Contact Person</label>
                                        <input
                                            value={formData.contactPerson}
                                            onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                            className="w-full px-4 py-3 rounded border border-pace-border focus:border-pace-purple outline-none font-bold text-admin-value"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-admin-label uppercase tracking-widest">Operating Region</label>
                                        <select
                                            value={formData.region}
                                            onChange={e => setFormData({ ...formData, region: e.target.value })}
                                            className="w-full px-4 py-3 rounded border border-pace-border focus:border-pace-purple outline-none font-bold text-admin-value bg-pace-bg-subtle"
                                        >
                                            <option>Nairobi</option>
                                            <option>Mombasa</option>
                                            <option>Kisumu</option>
                                            <option>Nakuru</option>
                                            <option>Eldoret</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-admin-label uppercase tracking-widest">Email Address</label>
                                        <input
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded border border-pace-border focus:border-pace-purple outline-none font-bold text-admin-value"
                                            placeholder="admin@isp.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-admin-label uppercase tracking-widest">Phone Number</label>
                                        <input
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 rounded border border-pace-border focus:border-pace-purple outline-none font-bold text-admin-value"
                                            placeholder="+254..."
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-4 bg-pace-purple/5 border border-pace-purple/10 rounded-sm flex gap-3 text-pace-purple">
                                    <Sparkles size={18} className="shrink-0" />
                                    <p className="text-[11px] font-bold uppercase tracking-tight leading-relaxed">Pace will automatically provision this router once the client is finalized.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-admin-label uppercase tracking-widest">Router Model</label>
                                        <select
                                            value={formData.routerModel}
                                            onChange={e => setFormData({ ...formData, routerModel: e.target.value })}
                                            className="w-full px-4 py-3 rounded border border-pace-border focus:border-pace-purple outline-none font-bold text-admin-value bg-pace-bg-subtle"
                                        >
                                            <option>MikroTik CCR2004</option>
                                            <option>MikroTik CCR2116</option>
                                            <option>Ubiquiti EdgeRouter 8</option>
                                            <option>Custom PC / RouterOS</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-admin-label uppercase tracking-widest">Management IP (Public)</label>
                                        <input
                                            value={formData.routerIp}
                                            onChange={e => setFormData({ ...formData, routerIp: e.target.value })}
                                            className="w-full px-4 py-3 rounded border border-pace-border focus:border-pace-purple outline-none font-mono font-bold text-admin-value"
                                            placeholder="197.xxx.xxx.xxx"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-bold text-admin-label uppercase tracking-widest">Hardware Serial Number</label>
                                        <input
                                            value={formData.serialNumber}
                                            onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                            className="w-full px-4 py-3 rounded border border-pace-border focus:border-pace-purple outline-none font-bold text-admin-value"
                                            placeholder="SN-XXXX-XXXX-XXXX"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-pace-bg-subtle p-6 rounded border border-pace-border divide-y divide-pace-border">
                                    <div className="pb-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-pace-purple/10 flex items-center justify-center text-pace-purple">
                                                <BadgeDollarSign size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-admin-label uppercase tracking-widest">Generated Account #</p>
                                                <p className="text-[16px] font-bold text-admin-value">{formData.accountNumber}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-pace-green/10 text-pace-green rounded text-[9px] font-bold uppercase tracking-widest">Verified</span>
                                    </div>
                                    <div className="pt-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-admin-label uppercase tracking-widest">License Tier</label>
                                                <select
                                                    value={formData.paymentPlan}
                                                    onChange={e => setFormData({ ...formData, paymentPlan: e.target.value })}
                                                    className="w-full px-4 py-2 rounded border border-pace-border bg-pace-bg-subtle focus:border-pace-purple outline-none font-bold text-admin-value"
                                                >
                                                    <option>Startup</option>
                                                    <option>Standard</option>
                                                    <option>Enterprise</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-admin-label uppercase tracking-widest">First Billing Date</label>
                                                <input
                                                    type="date"
                                                    value={formData.nextPayment}
                                                    onChange={e => setFormData({ ...formData, nextPayment: e.target.value })}
                                                    className="w-full px-4 py-2 rounded border border-pace-border bg-pace-bg-subtle focus:border-pace-purple outline-none font-bold text-admin-value"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-10 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-pace-green/10 flex items-center justify-center text-pace-green mb-6">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h2 className="text-[24px] font-bold text-admin-value leading-none">Registration Successful</h2>
                                <p className="text-admin-label text-[13px] mt-4 max-w-sm font-medium leading-relaxed">
                                    Client **{formData.businessName}** has been added to the registry. Their payment account number is **{formData.accountNumber}**.
                                </p>
                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => router.push('/dashboard/customers')}
                                        className="px-8 py-3 bg-pace-purple text-white rounded font-bold uppercase text-[11px] tracking-widest hover:bg-[#3d1a75] transition-all"
                                    >
                                        View Client Profile
                                    </button>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-8 py-3 border border-pace-border text-admin-label rounded font-bold uppercase text-[11px] tracking-widest hover:bg-pace-bg-subtle transition-all"
                                    >
                                        Add Another
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {step < 4 && (
                    <div className="px-8 py-4 bg-pace-bg-subtle border-t border-pace-border flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-6 py-2 text-admin-label font-bold uppercase text-[11px] tracking-widest hover:text-admin-value disabled:opacity-30"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                        <button
                            onClick={step === 3 ? handleSubmit : handleNext}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-10 py-3 bg-pace-purple text-white rounded font-bold uppercase text-[11px] tracking-widest hover:bg-[#3d1a75] transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processing...' : (step === 3 ? 'Finalize Registration' : 'Continue')}
                            {step < 3 && !isSubmitting && <ChevronRight size={16} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Final Step Summary Side Panel (Desktop only) */}
            {step < 4 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
                    {[
                        { label: 'Automated Account Generation', sub: 'Instant KES collection ID setup.' },
                        { label: 'Router Provisioning', sub: 'Live config push upon registration.' },
                        { label: 'Client Notification', sub: 'Login details sent via email & SMS.' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4 items-start">
                            <div className="w-5 h-5 rounded-full bg-pace-bg-subtle flex items-center justify-center text-admin-dim shrink-0">
                                <CheckCircle2 size={12} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-admin-value uppercase tracking-tight">{item.label}</p>
                                <p className="text-[10px] text-admin-label font-medium mt-1 leading-tight">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
