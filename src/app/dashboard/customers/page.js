"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Search, Filter, UserPlus, Edit2, Trash2, Smartphone, Network, ShieldCheck, Activity, X, Database, MapPin, LifeBuoy, Wallet } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, TableRowSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { mockCustomers, mockRouters, mockPackages } from '@/services/mockData'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const MapView = dynamic(() => import('@/components/MapView'), { 
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-pace-bg-subtle animate-pulse rounded-xl border border-pace-border flex items-center justify-center text-[10px] font-bold uppercase text-admin-dim tracking-widest">Loading Mapping...</div>
})

const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
    ssr: false,
    loading: () => <div className="h-[220px] w-full bg-pace-bg-subtle animate-pulse rounded-xl border border-pace-border flex items-center justify-center text-[10px] font-bold uppercase text-admin-dim tracking-widest">Loading Location Picker...</div>
})

function CustomersContent() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [customers, setCustomers] = useState([])
    const [search, setSearch] = useState('')
    
    // Subscriber Add/Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentCustomer, setCurrentCustomer] = useState(null)
    const [accountType, setAccountType] = useState('phone')
    const [formData, setFormData] = useState({ 
        firstName: '', lastName: '', phone: '', plan: '', price: 0, 
        username: '', password: '', status: 'disabled',
        router: '', accountNumber: '', activationFee: 1000, amountPaid: 0,
        nextPayment: '',
        lat: '', lng: '', walletHistory: []
    })

    // Wallet & Reconnect Modal State
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
    const [walletCustomer, setWalletCustomer] = useState(null)
    const [walletPaymentAmount, setWalletPaymentAmount] = useState('')
    const [walletNextPayment, setWalletNextPayment] = useState('')
    const [walletStatusChange, setWalletStatusChange] = useState('enabled')

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }))
        const timer = setTimeout(() => {
            const enriched = mockCustomers.map(c => {
                const names = c.name ? c.name.split(' ') : ['Subscriber', 'Node']
                const firstName = names[0] || 'Subscriber'
                const lastName = names.slice(1).join(' ') || 'Node'
                const activationFee = 0 // Setup fee assumed paid for existing ones
                let amountPaid = c.price
                let walletStatus = 'complete'
                
                if (c.id === 2 || c.id === 5) {
                    walletStatus = 'pending'
                    amountPaid = c.price / 2
                } else if (c.id === 3) {
                    walletStatus = 'not-paid'
                    amountPaid = 0
                }

                return {
                    ...c,
                    firstName,
                    lastName,
                    activationFee,
                    amountPaid,
                    walletStatus,
                    lat: c.lat || -1.286389,
                    lng: c.lng || 36.817223,
                    walletHistory: [
                        { date: '2026-05-01', type: 'Package Cost', amount: c.price, description: `${c.plan} Subscription` },
                        { date: '2026-05-01', type: 'Payment', amount: amountPaid, description: 'Automatic check-in payment' }
                    ]
                }
            })
            setCustomers(enriched)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleNameChange = (field, value) => {
        const nextData = { ...formData, [field]: value }
        const fName = nextData.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')
        const lName = nextData.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (fName || lName) {
            nextData.username = `${fName}_${lName}`.replace(/^_|_$/, '')
        }
        setFormData(nextData)
    }

    const handleOpenModal = (c = null) => {
        if (c) {
            setCurrentCustomer(c)
            setFormData({ 
                ...c,
                firstName: c.firstName || c.name.split(' ')[0] || '',
                lastName: c.lastName || c.name.split(' ').slice(1).join(' ') || '',
                nextPayment: c.nextPayment || new Date().toISOString().split('T')[0],
                activationFee: c.activationFee !== undefined ? c.activationFee : 0,
                amountPaid: c.amountPaid || 0,
                lat: c.lat ? c.lat.toString() : '',
                lng: c.lng ? c.lng.toString() : ''
            })
            setAccountType(c.accountNumber === c.phone ? 'phone' : 'generate')
        } else {
            setCurrentCustomer(null)
            setFormData({ 
                firstName: '', lastName: '', phone: '', plan: '', price: 0, 
                username: '', password: '', status: 'disabled',
                router: '', accountNumber: '', activationFee: 1000, amountPaid: 0,
                nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                lat: '', lng: '', walletHistory: []
            })
            setAccountType('phone')
        }
        setIsModalOpen(true)
    }

    const handleSave = (e) => {
        e.preventDefault()
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.username || !formData.router || !formData.plan) {
            toast.error('Missing Required Parameters', {
                description: 'Please fill all subscriber fields and choose a service plan.'
            })
            return
        }

        const planPrice = Number(formData.price || 0)
        const activationFee = Number(formData.activationFee || 0)
        const requiredToConnect = planPrice + activationFee
        const initialPayment = Number(formData.amountPaid || 0)
        
        const meetsReq = initialPayment >= requiredToConnect
        const status = meetsReq ? formData.status : 'disabled' // Force disabled if not paid enough!
        const walletStatus = initialPayment >= requiredToConnect 
            ? 'complete' 
            : (initialPayment > 0 ? 'pending' : 'not-paid')

        const fullName = `${formData.firstName} ${formData.lastName}`

        if (currentCustomer) {
            const nextHistory = [
                ...(formData.walletHistory || []),
            ]
            if (Number(formData.amountPaid) !== Number(currentCustomer.amountPaid)) {
                const diff = Number(formData.amountPaid) - Number(currentCustomer.amountPaid)
                if (diff > 0) {
                    nextHistory.push({
                        date: new Date().toISOString().split('T')[0],
                        type: 'Payment',
                        amount: diff,
                        description: 'Manual wallet update'
                    })
                }
            }

            setCustomers(prev => prev.map(c => c.id === currentCustomer.id ? { 
                ...c, 
                ...formData, 
                name: fullName, 
                status, 
                walletStatus,
                walletHistory: nextHistory
            } : c))
            
            toast.success('Subscriber Saved', {
                description: `Subscriber profile for ${formData.username} has been updated.`
            })
        } else {
            const history = []
            if (activationFee > 0) {
                history.push({
                    date: new Date().toISOString().split('T')[0],
                    type: 'Activation Fee',
                    amount: activationFee,
                    description: 'Subscriber setup fee'
                })
            }
            if (planPrice > 0) {
                history.push({
                    date: new Date().toISOString().split('T')[0],
                    type: 'Package Cost',
                    amount: planPrice,
                    description: `${formData.plan} monthly cost`
                })
            }
            if (initialPayment > 0) {
                history.push({
                    date: new Date().toISOString().split('T')[0],
                    type: 'Payment',
                    amount: initialPayment,
                    description: 'Initial setup payment'
                })
            }

            const newCust = { 
                ...formData, 
                id: Date.now(),
                name: fullName,
                status,
                walletStatus,
                walletHistory: history
            }
            setCustomers(prev => [newCust, ...prev])
            toast.success('Subscriber Added', {
                description: `New subscriber profile created on ${formData.router}.`
            })
        }
        setIsModalOpen(false)
    }

    const handleDelete = (id, name) => {
        setCustomers(prev => prev.filter(c => c.id !== id))
        toast.error('Subscriber Deleted', {
            description: `Subscriber ${name} has been deleted.`
        })
    }

    const handleToggleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled'
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
        toast.info(newStatus === 'enabled' ? 'Access Restored' : 'Access Suspended', {
            description: `Subscriber state set to ${newStatus}.`
        })
    }

    // Wallet / Reconnect Actions
    const handleOpenWalletModal = (c) => {
        setWalletCustomer(c)
        setWalletPaymentAmount('')
        setWalletNextPayment(c.nextPayment || new Date().toISOString().split('T')[0])
        setWalletStatusChange(c.status || 'enabled')
        setIsWalletModalOpen(true)
    }

    const handleSaveWallet = (e) => {
        e.preventDefault()
        if (!walletCustomer) return

        const price = Number(walletCustomer.price || 0)
        const activationFee = Number(walletCustomer.activationFee || 0)
        const required = price + activationFee
        const additionalPayment = Number(walletPaymentAmount || 0)
        const totalPaid = Number(walletCustomer.amountPaid || 0) + additionalPayment

        let newWalletStatus = 'not-paid'
        if (totalPaid >= required) {
            newWalletStatus = 'complete'
        } else if (totalPaid > 0) {
            newWalletStatus = 'pending'
        }

        // Auto-enable if fully paid
        const finalStatus = totalPaid >= required ? walletStatusChange : 'disabled'

        const nextHistory = [
            ...(walletCustomer.walletHistory || []),
        ]
        if (additionalPayment > 0) {
            nextHistory.push({
                date: new Date().toISOString().split('T')[0],
                type: 'Payment',
                amount: additionalPayment,
                description: 'Manual wallet replenishment'
            })
        }

        setCustomers(prev => prev.map(c => {
            if (c.id === walletCustomer.id) {
                return {
                    ...c,
                    amountPaid: totalPaid,
                    walletStatus: newWalletStatus,
                    nextPayment: walletNextPayment,
                    status: finalStatus,
                    walletHistory: nextHistory
                }
            }
            return c
        }))

        toast.success('Wallet & Access Synchronized', {
            description: `Payment of KES ${additionalPayment} recorded for ${walletCustomer.name}. Expiry updated to ${walletNextPayment}.`
        })
        setIsWalletModalOpen(false)
    }

    const handleQuickFullPay = () => {
        if (!walletCustomer) return
        const price = Number(walletCustomer.price || 0)
        const activationFee = Number(walletCustomer.activationFee || 0)
        const required = price + activationFee
        const remaining = required - Number(walletCustomer.amountPaid || 0)

        const nextHistory = [
            ...(walletCustomer.walletHistory || []),
        ]
        if (remaining > 0) {
            nextHistory.push({
                date: new Date().toISOString().split('T')[0],
                type: 'Payment',
                amount: remaining,
                description: 'Quick payment clearance'
            })
        }

        setCustomers(prev => prev.map(c => {
            if (c.id === walletCustomer.id) {
                return {
                    ...c,
                    amountPaid: required,
                    walletStatus: 'complete',
                    nextPayment: walletNextPayment,
                    status: 'enabled',
                    walletHistory: nextHistory
                }
            }
            return c
        }))

        toast.success('Account Reconnected', {
            description: `${walletCustomer.name} marked as Fully Paid. Status set to enabled.`
        })
        setIsWalletModalOpen(false)
    }

    const filteredCustomers = customers.filter(c => {
        const fullName = c.name || `${c.firstName} ${c.lastName}`
        return fullName.toLowerCase().includes(search.toLowerCase()) ||
            c.username?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search)
    })

    if (isLoading) {
        return <TablePageSkeleton />
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Subscriber List</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">PPPoE node authentication and session control</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-sm active:scale-95"
                >
                    <UserPlus size={16} />
                    <span>Add Subscriber</span>
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search identity pool..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Subscriber / Account</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">PPPoE Credentials</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">NAS / Router</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Service Tier</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-center">Wallet Status</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center text-admin-dim text-sm font-medium">No records found in identity pool</td>
                                </tr>
                            ) : (
                                filteredCustomers.map((c) => {
                                    const fullName = c.name || `${c.firstName} ${c.lastName}`
                                    const requiredAmount = Number(c.price || 0) + Number(c.activationFee || 0)
                                    const pkg = mockPackages.find(p => p.limit === c.plan || p.name === c.plan)
                                    const packageName = pkg ? pkg.name : c.plan
                                    return (
                                        <tr key={c.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                            <td className="px-6 py-2">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-admin-value text-xs group-hover:text-pace-purple transition-colors">{fullName}</span>
                                                    <span className="text-[10px] text-admin-dim font-medium uppercase tracking-tighter">Acc: {c.accountNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-semibold text-pace-purple font-mono">{c.username}</span>
                                                    <span className="text-[9px] text-gray-400 font-medium">Secured CHAP</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <span className="text-xs font-semibold text-admin-value">{c.router || 'Unassigned'}</span>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-admin-value text-[11px]">{packageName}</span>
                                                    <span className="text-[9px] text-gray-400 font-mono">{c.plan}</span>
                                                    <span className="text-[9px] text-admin-dim font-medium italic mt-0.5">Expires: {c.nextPayment || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 text-center">
                                                <div className="flex flex-col items-center">
                                                    <Badge className={cn(
                                                        "border-none px-2 py-0.5 text-[8px] font-black tracking-widest uppercase min-w-[70px] text-center",
                                                        c.walletStatus === 'complete' 
                                                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                                                            : c.walletStatus === 'pending'
                                                                ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                                                                : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                                                    )}>
                                                        {c.walletStatus === 'complete' ? 'Complete' : c.walletStatus === 'pending' ? 'Pending' : 'Not Paid'}
                                                    </Badge>
                                                    <span className="text-[9px] text-admin-dim font-mono mt-0.5">
                                                        Paid: {c.amountPaid || 0} / Target: {requiredAmount}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 text-center">
                                                <button 
                                                    onClick={() => handleToggleStatus(c.id, c.status)}
                                                    className="transition-transform active:scale-95"
                                                >
                                                    <Badge className={cn(
                                                        "border-none px-2 py-0.5 text-[8px] font-black tracking-widest uppercase min-w-[58px] block text-center transition-all",
                                                        c.status === 'enabled' 
                                                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                                                            : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                                                    )}>
                                                        {c.status}
                                                    </Badge>
                                                </button>
                                            </td>
                                            <td className="px-6 py-2 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    <button 
                                                        onClick={() => handleOpenWalletModal(c)}
                                                        className="p-1 text-admin-dim hover:text-green-600 hover:bg-green-500/5 rounded-lg transition-all"
                                                        title="Wallet & Manual Reconnect"
                                                    >
                                                        <Wallet size={13} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenModal(c)}
                                                        className="p-1 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-lg transition-all"
                                                        title="View Location & Edit"
                                                    >
                                                        <MapPin size={13} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenModal(c)}
                                                        className="p-1 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-lg transition-all"
                                                        title="Edit Details"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button 
                                                        className="p-1 text-admin-dim hover:text-green-500 hover:bg-green-500/5 rounded-lg transition-all"
                                                        title="Quick SMS"
                                                    >
                                                        <Smartphone size={13} />
                                                    </button>
                                                    <button 
                                                        className="p-1 text-admin-dim hover:text-orange-500 hover:bg-orange-500/5 rounded-lg transition-all"
                                                        title="Log Incident"
                                                        onClick={() => router.push(`/dashboard/tickets?customer=${fullName}`)}
                                                    >
                                                        <LifeBuoy size={13} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(c.id, fullName)}
                                                        className="p-1 text-admin-dim hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                                        title="Delete Subscriber"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Subscriber Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentCustomer ? 'Edit Subscriber' : 'Add Subscriber'}
                description={currentCustomer ? `Updating subscriber info for ${currentCustomer.username}` : 'Configure credentials and billing rules for a new subscriber.'}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSave} className="space-y-5 font-figtree">
                    {/* First Name & Second Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">First Name</label>
                            <input 
                                type="text" required
                                value={formData.firstName}
                                onChange={(e) => handleNameChange('firstName', e.target.value)}
                                placeholder="First Name"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Second Name</label>
                            <input 
                                type="text" required
                                value={formData.lastName}
                                onChange={(e) => handleNameChange('lastName', e.target.value)}
                                placeholder="Second Name"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Mobile Contact</label>
                            <input 
                                type="text" required
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="07XXXXXXXX"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Target NAS</label>
                            <select 
                                required
                                value={formData.router}
                                onChange={(e) => setFormData({...formData, router: e.target.value})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                            >
                                <option value="">Select Router</option>
                                {mockRouters.map(r => (
                                    <option key={r.id} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Optional Site Pin */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Location Pin (Optional)</label>
                            {formData.lat && formData.lng ? (
                                <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Pinned</span>
                            ) : (
                                <span className="text-[9px] font-black uppercase tracking-widest text-admin-dim">Optional</span>
                            )}
                        </div>
                        <MapPicker
                            value={formData.lat && formData.lng ? { lat: Number(formData.lat), lng: Number(formData.lng) } : null}
                            onChange={(pos) => setFormData({ ...formData, lat: pos.lat.toString(), lng: pos.lng.toString() })}
                        />
                        <p className="text-[10px] text-admin-dim font-medium pl-1">Pick a site on the map if you want to pin the subscriber location. Leaving it blank is fine.</p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Billing Account Number</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setAccountType('phone')
                                    setFormData({...formData, accountNumber: formData.phone})
                                }}
                                className={cn(
                                    "py-2 px-3 rounded-xl border text-[11px] font-bold transition-all",
                                    accountType === 'phone' ? "bg-pace-purple text-white border-pace-purple" : "bg-pace-bg-subtle text-admin-dim border-pace-border hover:bg-pace-purple/5"
                                )}
                            >
                                Use Phone Number
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setAccountType('generate')
                                    const rand = Math.floor(1000 + Math.random() * 9000).toString()
                                    setFormData({...formData, accountNumber: rand})
                                }}
                                className={cn(
                                    "py-2 px-3 rounded-xl border text-[11px] font-bold transition-all",
                                    accountType === 'generate' ? "bg-pace-purple text-white border-pace-purple" : "bg-pace-bg-subtle text-admin-dim border-pace-border hover:bg-pace-purple/5"
                                )}
                            >
                                Generate 4-Digit
                            </button>
                        </div>
                        {formData.accountNumber && (
                            <p className="text-[10px] font-bold text-pace-purple mt-1 pl-1">Assigned: {formData.accountNumber}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Service QoS Plan</label>
                        <select 
                            required
                            value={formData.plan}
                            onChange={(e) => {
                                const pkg = mockPackages.find(p => p.name === e.target.value || p.limit === e.target.value || p.limit === e.target.value);
                                const selectedLimit = pkg ? pkg.limit : e.target.value
                                const selectedPrice = pkg ? pkg.price : 0
                                setFormData({...formData, plan: selectedLimit, price: selectedPrice});
                            }}
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                        >
                            <option value="">Select QoS Profile</option>
                            {mockPackages.map(p => (
                                <option key={p.id} value={p.limit}>{p.name} ({p.limit}) - KES {p.price}</option>
                            ))}
                        </select>
                    </div>

                    {/* Activation Pay & Initial Wallet Deposit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Activation Fee (KES)</label>
                            <input 
                                type="number" required
                                value={formData.activationFee}
                                onChange={(e) => setFormData({...formData, activationFee: Number(e.target.value)})}
                                placeholder="1000"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-admin-value outline-none focus:border-pace-purple transition-all font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Initial Pay Deposit (KES)</label>
                            <input 
                                type="number" required
                                value={formData.amountPaid}
                                onChange={(e) => setFormData({...formData, amountPaid: Number(e.target.value)})}
                                placeholder="0"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-admin-value outline-none focus:border-pace-purple transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Payment Due Date</label>
                            <input 
                                type="date"
                                value={formData.nextPayment ? formData.nextPayment.split(' ')[0] : ''}
                                onChange={(e) => setFormData({...formData, nextPayment: e.target.value})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Connection State Policy</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                            >
                                <option value="enabled">Enabled (Active)</option>
                                <option value="disabled">Disabled (Suspended)</option>
                            </select>
                        </div>
                    </div>

                    {/* Calculated connection eligibility */}
                    {(() => {
                        const req = Number(formData.price || 0) + Number(formData.activationFee || 0)
                        const paid = Number(formData.amountPaid || 0)
                        const meetsReq = paid >= req
                        return (
                            <div className={cn(
                                "p-3.5 rounded-xl border text-xs font-medium space-y-1 transition-all",
                                meetsReq 
                                    ? "bg-green-500/5 border-green-500/20 text-green-600" 
                                    : "bg-red-500/5 border-red-500/20 text-red-500"
                            )}>
                                <div className="flex justify-between font-bold">
                                    <span>Total Required: KES {req.toLocaleString()}</span>
                                    <span>Paid Now: KES {paid.toLocaleString()}</span>
                                </div>
                                <p className="text-[11px] font-semibold mt-1">
                                    {meetsReq 
                                        ? "✅ Subscriber is eligible to connect. Account status will be set to Enabled." 
                                        : `❌ Insufficient payment to connect. Subscriber requires KES ${(req - paid).toLocaleString()} more and status will be Disabled.`
                                    }
                                </p>
                            </div>
                        )
                    })()}

                    <div className="grid grid-cols-2 gap-4 border-t border-pace-border pt-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-pace-purple uppercase tracking-wider pl-1">PPPoE Username</label>
                            <input 
                                type="text" required
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                placeholder="pppoe_user"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-pace-purple uppercase tracking-wider pl-1">PPPoE Password</label>
                            <input 
                                type="text" required
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="secret_password"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-5 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-[2] px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-all active:scale-95"
                        >
                            {currentCustomer ? 'Save Changes' : 'Add Subscriber'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Wallet & Manual Reconnect Modal */}
            <Modal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
                title="Wallet & Manual Reconnect"
                description={walletCustomer ? `Manage billing state and connection status for ${walletCustomer.name}` : ''}
                maxWidth="max-w-md"
            >
                {walletCustomer && (
                    <form onSubmit={handleSaveWallet} className="space-y-5 font-figtree">
                        {/* Summary Box */}
                        <div className="p-4 bg-pace-bg-subtle border border-pace-border rounded-2xl space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-admin-dim font-medium">Customer:</span>
                                <span className="font-semibold text-admin-value">{walletCustomer.name}</span>
                            </div>
                            {(() => {
                                const pkg = mockPackages.find(p => p.limit === walletCustomer.plan || p.name === walletCustomer.plan)
                                const packageName = pkg ? pkg.name : walletCustomer.plan
                                return (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-admin-dim font-medium">Plan:</span>
                                        <span className="font-semibold text-admin-value">{packageName} ({walletCustomer.plan})</span>
                                    </div>
                                )
                            })()}
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-admin-dim font-medium">Monthly Cost:</span>
                                <span className="font-semibold text-pace-purple font-mono">KES {Number(walletCustomer.price).toLocaleString()}</span>
                            </div>
                            {Number(walletCustomer.activationFee || 0) > 0 && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-admin-dim font-medium">Activation Fee:</span>
                                    <span className="font-semibold text-admin-value font-mono">KES {Number(walletCustomer.activationFee).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="border-t border-pace-border my-2 pt-2 flex justify-between items-center text-xs">
                                <span className="text-admin-dim font-medium">Total Paid So Far:</span>
                                <span className="font-semibold text-green-600 font-mono">KES {Number(walletCustomer.amountPaid || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-admin-dim font-medium">Remaining Due:</span>
                                <span className={cn(
                                    "font-semibold font-mono",
                                    Number((walletCustomer.price + (walletCustomer.activationFee || 0)) - (walletCustomer.amountPaid || 0)) > 0 ? "text-red-500" : "text-green-600"
                                )}>
                                    KES {Number(Math.max(0, (walletCustomer.price + (walletCustomer.activationFee || 0)) - (walletCustomer.amountPaid || 0))).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] mt-1 pt-1">
                                <span className="text-admin-dim font-medium uppercase tracking-wider">Wallet Status:</span>
                                <Badge className={cn(
                                    "border-none px-2 py-0.5 text-[8px] font-black tracking-widest uppercase",
                                    walletCustomer.walletStatus === 'complete' 
                                        ? "bg-green-500/10 text-green-600" 
                                        : walletCustomer.walletStatus === 'pending'
                                            ? "bg-amber-500/10 text-amber-600"
                                            : "bg-red-500/10 text-red-600"
                                )}>
                                    {walletCustomer.walletStatus || 'not-paid'}
                                </Badge>
                            </div>
                        </div>

                        {/* Payment Recording */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">Record New Payment</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="relative">
                                    <input 
                                        type="number"
                                        value={walletPaymentAmount}
                                        onChange={(e) => setWalletPaymentAmount(e.target.value)}
                                        placeholder="Enter KES amount paid"
                                        className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-admin-value outline-none focus:border-pace-purple transition-all font-mono"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-admin-dim">KES</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleQuickFullPay}
                                    className="py-2.5 px-3 bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 rounded-xl text-xs font-bold transition-all text-center animate-in duration-200"
                                >
                                    Mark as Fully Paid (Complete)
                                </button>
                            </div>
                        </div>

                        {/* Manual Reconnect / Expiry Adjustment */}
                        <div className="space-y-3 border-t border-pace-border pt-4">
                            <h4 className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">Manual Reconnect & Expiry</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-admin-dim pl-1">Account Access Status</label>
                                    <select 
                                        value={walletStatusChange}
                                        onChange={(e) => setWalletStatusChange(e.target.value)}
                                        className="w-full px-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                                    >
                                        <option value="enabled">Enabled (Active)</option>
                                        <option value="disabled">Disabled (Suspended)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-admin-dim pl-1">Next Payment Due Date</label>
                                    <input 
                                        type="date"
                                        value={walletNextPayment}
                                        onChange={(e) => setWalletNextPayment(e.target.value)}
                                        className="w-full px-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Transaction History Log */}
                        <div className="space-y-2 border-t border-pace-border pt-4">
                            <h4 className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">Wallet Transaction Log</h4>
                            <div className="max-h-24 overflow-y-auto space-y-1 bg-pace-bg-subtle/50 p-2 rounded-xl border border-pace-border custom-scrollbar">
                                {(walletCustomer.walletHistory && walletCustomer.walletHistory.length > 0) ? (
                                    walletCustomer.walletHistory.map((h, index) => (
                                        <div key={index} className="flex justify-between items-center text-[10px] font-medium border-b border-pace-border/5 pb-1">
                                            <span className="text-admin-dim font-mono">{h.date}</span>
                                            <span className="text-admin-value font-semibold">{h.description || h.type}</span>
                                            <span className={cn(
                                                "font-bold font-mono",
                                                h.type === 'Payment' ? "text-green-600" : "text-red-500"
                                            )}>
                                                {h.type === 'Payment' ? '+' : '-'}KES {Number(h.amount).toLocaleString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-admin-dim italic text-center py-2">No transaction logs available</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsWalletModalOpen(false)}
                                className="flex-1 px-5 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-[2] px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-all active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    )
}

export default function CustomersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Mapping subscriber matrix...</div>}>
            <CustomersContent />
        </Suspense>
    )
}
