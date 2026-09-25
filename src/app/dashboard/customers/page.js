"use client"

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { Plus, Search, UserPlus, Edit2, Trash2, Smartphone, Network, LifeBuoy, Wallet, RefreshCw, X, MapPin, Users, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton, CardSkeleton, TablePageSkeleton } from '@/components/Skeleton'
import { customerService } from '@/services/isp/customers'
import { routerService } from '@/services/isp/routers'
import { planService } from '@/services/isp/plans'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'

const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
    ssr: false,
    loading: () => <div className="h-[220px] w-full bg-pace-bg-subtle animate-pulse rounded-xl border border-pace-border flex items-center justify-center text-[10px] font-bold uppercase text-admin-dim tracking-widest">Loading Location Picker...</div>
})

function CustomersContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [customers, setCustomers] = useState([])
    const [routersList, setRoutersList] = useState([])
    const [allPlansList, setAllPlansList] = useState([])
    
    const [search, setSearch] = useState('')
    const [filterRouter, setFilterRouter] = useState('')
    const [filterPlan, setFilterPlan] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    
    // Subscriber Add/Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentCustomer, setCurrentCustomer] = useState(null)
    const [accountType, setAccountType] = useState('phone')
    const [formData, setFormData] = useState({ 
        firstName: '', 
        lastName: '', 
        phone: '', 
        router_id: '',
        router: '',
        plan_id: '',
        plan: '', 
        price: 0, 
        username: '', 
        password: '', 
        status: 'enabled',
        accountNumber: '', 
        activationFee: 0, 
        nextPayment: '',
        lat: '', 
        lng: ''
    })

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [subRes, routerRes, planRes] = await Promise.all([
                customerService.getCustomers(),
                routerService.getRouters(),
                planService.getPlans()
            ]);

            if (subRes.status === 'success') {
                const enriched = subRes.data.map(c => {
                    const names = c.name ? c.name.split(' ') : ['Subscriber', '']
                    const firstName = names[0] || 'Subscriber'
                    const lastName = names.slice(1).join(' ') || ''
                    return {
                        ...c,
                        firstName,
                        lastName
                    }
                });
                setCustomers(enriched);
            }

            if (routerRes.status === 'success') {
                setRoutersList(routerRes.data || []);
            }

            if (planRes.status === 'success') {
                setAllPlansList(planRes.data || []);
            }
        } catch (err) {
            console.error("Failed to load initial customer data:", err);
            toast.error("Data Load Error", { description: "Failed to load live subscribers or routers from server." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleNameChange = (field, value) => {
        const nextData = { ...formData, [field]: value }
        const fName = (field === 'firstName' ? value : formData.firstName).toLowerCase().replace(/[^a-z0-9]/g, '')
        const lName = (field === 'lastName' ? value : formData.lastName).toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!currentCustomer && (fName || lName)) {
            nextData.username = `${fName}_${lName}`.replace(/^_|_$/, '')
        }
        setFormData(nextData)
    }

    const handleRouterChange = (routerId) => {
        const selected = routersList.find(r => String(r.id) === String(routerId));
        setFormData(prev => ({
            ...prev,
            router_id: routerId,
            router: selected ? selected.name : '',
            // Reset plan when router changes so user picks from this router's packages
            plan_id: '',
            plan: '',
            price: 0
        }));
    }

    const handlePlanChange = (planId) => {
        const selected = allPlansList.find(p => String(p.id) === String(planId));
        setFormData(prev => ({
            ...prev,
            plan_id: planId,
            plan: selected ? selected.name : '',
            price: selected ? Number(selected.price) : 0
        }));
    }

    const handleOpenModal = (c = null) => {
        const defaultNextPay = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (c) {
            setCurrentCustomer(c);
            setFormData({ 
                firstName: c.firstName || c.name?.split(' ')[0] || '',
                lastName: c.lastName || c.name?.split(' ').slice(1).join(' ') || '',
                phone: c.phone || '',
                router_id: c.router_id ? String(c.router_id) : '',
                router: c.router || '',
                plan_id: c.plan_id ? String(c.plan_id) : '',
                plan: c.plan || '',
                price: Number(c.price || 0),
                username: c.username || '',
                password: c.password || '',
                status: c.status || 'enabled',
                accountNumber: c.accountNumber || c.phone || '',
                activationFee: Number(c.totalSpent || 0),
                nextPayment: c.nextPayment ? c.nextPayment.split(' ')[0] : defaultNextPay,
                lat: c.lat ? String(c.lat) : '',
                lng: c.lng ? String(c.lng) : ''
            });
            setAccountType(c.accountNumber === c.phone ? 'phone' : 'generate');
        } else {
            setCurrentCustomer(null);
            setFormData({ 
                firstName: '', 
                lastName: '', 
                phone: '', 
                router_id: routersList.length > 0 ? String(routersList[0].id) : '',
                router: routersList.length > 0 ? routersList[0].name : '',
                plan_id: '',
                plan: '', 
                price: 0, 
                username: '', 
                password: '', 
                status: 'enabled',
                accountNumber: '', 
                activationFee: 0, 
                nextPayment: defaultNextPay,
                lat: '', 
                lng: ''
            });
            setAccountType('phone');
        }
        setIsModalOpen(true);
    }

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.username || !formData.password || !formData.router_id || !formData.plan_id) {
            toast.error('Missing Required Fields', {
                description: 'Please ensure First Name, Last Name, Phone, Router, QoS Plan, PPPoE Username, and Password are provided.'
            });
            return;
        }

        setIsSaving(true);
        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
        const payload = {
            name: fullName,
            username: formData.username.trim(),
            password: formData.password.trim(),
            phone: formData.phone.trim(),
            account_number: formData.accountNumber || formData.phone.trim(),
            router_id: Number(formData.router_id),
            plan_id: Number(formData.plan_id),
            activation_fee: Number(formData.activationFee || 0),
            next_payment: formData.nextPayment || null,
            status: formData.status || 'enabled'
        };

        try {
            if (currentCustomer) {
                const res = await customerService.updateCustomer(currentCustomer.id, payload);
                if (res?.status === 'success') {
                    toast.success('Subscriber Updated', {
                        description: `Profile for ${formData.username} has been saved.`
                    });
                    setIsModalOpen(false);
                    await fetchInitialData();
                } else {
                    toast.error('Update Failed', { description: res?.message || 'Could not update subscriber.' });
                }
            } else {
                const res = await customerService.createCustomer(payload);
                if (res?.status === 'success') {
                    toast.success('Subscriber Created', {
                        description: `New PPPoE subscriber ${formData.username} provisioned on ${formData.router}.`
                    });
                    setIsModalOpen(false);
                    await fetchInitialData();
                } else {
                    toast.error('Creation Failed', { description: res?.message || 'Could not create subscriber.' });
                }
            }
        } catch (err) {
            console.error("Save customer error:", err);
            toast.error('Network Error', { description: 'Failed to communicate with server.' });
        } finally {
            setIsSaving(false);
        }
    }

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete subscriber ${name}?`)) return;
        try {
            const res = await customerService.deleteCustomer(id);
            if (res?.status === 'success') {
                toast.success('Subscriber Deleted', {
                    description: `Subscriber ${name} has been removed.`
                });
                await fetchInitialData();
            } else {
                toast.error('Delete Failed', { description: res?.message || 'Could not delete subscriber.' });
            }
        } catch (err) {
            console.error("Delete customer error:", err);
            toast.error('Delete Failed', { description: 'Failed to contact backend.' });
        }
    }

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
        try {
            const res = await customerService.toggleStatus(id, newStatus);
            if (res?.status === 'success') {
                toast.info(newStatus === 'enabled' ? 'Access Enabled' : 'Access Suspended', {
                    description: `Subscriber state updated to ${newStatus}.`
                });
                await fetchInitialData();
            } else {
                toast.error('Status Toggle Failed', { description: res?.message || 'Could not update status.' });
            }
        } catch (err) {
            console.error("Toggle status error:", err);
            toast.error('Status Toggle Failed', { description: 'Network error.' });
        }
    }

    // Deep link status filter support (?status=active / ?status=suspended)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const st = searchParams.get('status');
            if (st) {
                const clean = st.toLowerCase();
                if (clean === 'active' || clean === 'enabled') setFilterStatus('enabled');
                else if (clean === 'suspended' || clean === 'disabled') setFilterStatus('disabled');
            }
        }
    }, [searchParams]);

    // Filter plans attached to the currently selected router in the modal
    const availablePlansForSelectedRouter = allPlansList.filter(
        p => String(p.router_id) === String(formData.router_id)
    );

    // Filter options
    const routerOptions = [...new Set(customers.map(c => c.router).filter(Boolean))];
    const planOptions = [...new Set(customers.map(c => c.plan).filter(Boolean))];

    // Calculated metrics
    const metrics = useMemo(() => {
        const total = customers.length;
        const active = customers.filter(c => c.status === 'enabled' || c.status === 'active').length;
        const suspended = customers.filter(c => c.status === 'disabled' || c.status === 'suspended').length;
        const billing = customers.reduce((sum, c) => sum + (parseFloat(c.price || 0)), 0);
        return { total, active, suspended, billing };
    }, [customers]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => {
            const fullName = c.name || `${c.firstName} ${c.lastName}`;
            const matchesSearch =
                fullName.toLowerCase().includes(search.toLowerCase()) ||
                c.username?.toLowerCase().includes(search.toLowerCase()) ||
                c.phone?.includes(search) ||
                c.accountNumber?.includes(search);
            const matchesRouter = filterRouter === '' || c.router === filterRouter;
            const matchesPlan = filterPlan === '' || c.plan === filterPlan;
            const matchesStatus = filterStatus === 'ALL' || 
                (filterStatus === 'enabled' && (c.status === 'enabled' || c.status === 'active')) ||
                (filterStatus === 'disabled' && (c.status === 'disabled' || c.status === 'suspended'));
            return matchesSearch && matchesRouter && matchesPlan && matchesStatus;
        });
    }, [customers, search, filterRouter, filterPlan, filterStatus]);

    if (isLoading) {
        return <TablePageSkeleton />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value tracking-tight">Subscriber Management</h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">PPPoE subscriber provisioning, authentication secrets, and QoS profiles</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchInitialData}
                        className="flex items-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all text-xs font-semibold cursor-pointer"
                        title="Refresh list"
                    >
                        <RefreshCw size={14} />
                        <span>Refresh</span>
                    </button>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-xs font-semibold shadow-sm active:scale-95 cursor-pointer"
                    >
                        <UserPlus size={15} />
                        <span>Add Subscriber</span>
                    </button>
                </div>
            </div>

            {/* Top Metrics Cards - Dashboard Theme */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Subscribers",
                        value: metrics.total.toLocaleString(),
                        sub: "All registered accounts",
                        icon: Users,
                        color: 'text-pace-purple',
                        bg: 'bg-pace-purple/5',
                        iconBorder: 'border-pace-purple/10 group-hover:border-pace-purple/30',
                        accent: 'bg-gradient-to-b from-pace-purple to-indigo-500',
                        filter: 'ALL'
                    },
                    {
                        label: "Active Accounts",
                        value: metrics.active.toLocaleString(),
                        sub: "Connected & provisioned",
                        icon: CheckCircle2,
                        color: 'text-emerald-500',
                        bg: 'bg-emerald-500/5',
                        iconBorder: 'border-emerald-500/10 group-hover:border-emerald-500/30',
                        accent: 'bg-gradient-to-b from-emerald-400 to-teal-500',
                        filter: 'enabled'
                    },
                    {
                        label: "Suspended Accounts",
                        value: metrics.suspended.toLocaleString(),
                        sub: "Disabled or disconnected",
                        icon: AlertCircle,
                        color: 'text-rose-500',
                        bg: 'bg-rose-500/5',
                        iconBorder: 'border-rose-500/10 group-hover:border-rose-500/30',
                        accent: 'bg-gradient-to-b from-rose-400 to-red-500',
                        filter: 'disabled'
                    },
                    {
                        label: "Monthly Billing Value",
                        value: `KES ${metrics.billing.toLocaleString()}`,
                        sub: "Combined package value",
                        icon: Wallet,
                        color: 'text-blue-500',
                        bg: 'bg-blue-500/5',
                        iconBorder: 'border-blue-500/10 group-hover:border-blue-500/30',
                        accent: 'bg-gradient-to-b from-blue-400 to-cyan-500',
                        filter: 'ALL'
                    },
                ].map((metric, i) => {
                    const isActive = filterStatus.toLowerCase() === metric.filter.toLowerCase();
                    return (
                        <div
                            key={i}
                            onClick={() => {
                                if (metric.filter === 'ALL') {
                                    setFilterStatus('ALL');
                                } else {
                                    setFilterStatus(prev => prev === metric.filter ? 'ALL' : metric.filter);
                                }
                            }}
                            className={cn(
                                "relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-300 min-w-0 cursor-pointer",
                                isActive && metric.filter !== 'ALL'
                                    ? "border-pace-purple ring-1 ring-pace-purple/30 shadow-md"
                                    : "border-pace-border hover:border-pace-purple/30 hover:shadow-md"
                            )}
                        >
                            {/* Left accent color strip */}
                            <div className={cn("absolute left-0 top-0 bottom-0 w-1", metric.accent)} />
                            
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={metric.label}>
                                        {metric.label}
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-admin-value mt-1.5 group-hover:scale-[1.02] transition-transform origin-left duration-300 truncate">
                                        {metric.value}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] text-admin-dim truncate">{metric.sub}</p>
                                    </div>
                                </div>
                                <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-105", metric.iconBorder, metric.bg)}>
                                    <metric.icon className={cn(metric.color, "w-4 h-4")} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search by name, username, phone, account…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Status filter pills */}
                    {[
                        { label: 'All', value: 'ALL' },
                        { label: 'Active', value: 'enabled' },
                        { label: 'Suspended', value: 'disabled' }
                    ].map((st) => (
                        <button
                            key={st.value}
                            onClick={() => setFilterStatus(st.value)}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer",
                                filterStatus.toLowerCase() === st.value.toLowerCase()
                                    ? "bg-pace-purple text-white shadow-sm"
                                    : "bg-pace-bg-subtle text-admin-dim hover:bg-pace-purple/10 hover:text-pace-purple border border-pace-border"
                            )}
                        >
                            {st.label}
                        </button>
                    ))}

                    {/* Router Filter */}
                    <select
                        value={filterRouter}
                        onChange={e => setFilterRouter(e.target.value)}
                        className="px-3 py-1.5 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all cursor-pointer"
                    >
                        <option value="">All Routers</option>
                        {routerOptions.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>

                    {/* Plan Filter */}
                    <select
                        value={filterPlan}
                        onChange={e => setFilterPlan(e.target.value)}
                        className="px-3 py-1.5 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all cursor-pointer"
                    >
                        <option value="">All Plans</option>
                        {planOptions.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>

                    {/* Clear filters */}
                    {(filterRouter || filterPlan || search || filterStatus !== 'ALL') && (
                        <button
                            onClick={() => { setSearch(''); setFilterRouter(''); setFilterPlan(''); setFilterStatus('ALL') }}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-admin-dim border border-pace-border rounded-xl hover:text-red-500 hover:border-red-400/40 transition-all cursor-pointer"
                        >
                            <X size={13} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Subscribers Matrix Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Subscriber / Account</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">PPPoE Credentials</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">MikroTik Router</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Assigned QoS Plan</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-center">Billing / Expiry</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center text-admin-dim text-sm font-medium">
                                        No subscribers found in database. Click "Add Subscriber" to provision one.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((c) => {
                                    const fullName = c.name || `${c.firstName} ${c.lastName}`;
                                    return (
                                        <tr key={c.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-admin-value text-xs group-hover:text-pace-purple transition-colors">{fullName}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-admin-dim font-mono">Acc: {c.accountNumber || c.phone}</span>
                                                        <span className="text-[10px] text-gray-400">•</span>
                                                        <span className="text-[10px] text-admin-dim">{c.phone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-semibold text-pace-purple font-mono">{c.username}</span>
                                                    <span className="text-[9px] text-gray-400 font-medium">PAP/CHAP Auth</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-xs font-semibold text-admin-value">{c.router || 'Unassigned'}</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-admin-value text-[11px]">{c.plan || 'Standard Plan'}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        {c.bandwidth && <span className="text-[9px] text-pace-purple font-mono font-bold">{c.bandwidth}</span>}
                                                        <span className="text-[9px] text-admin-dim font-mono font-medium">KES {Number(c.price || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[11px] font-bold text-admin-value font-mono">
                                                        {c.nextPayment ? c.nextPayment.split(' ')[0] : 'No Expiry'}
                                                    </span>
                                                    <span className="text-[9px] text-admin-dim font-medium mt-0.5">
                                                        {c.totalSpent > 0 ? `Setup: KES ${Number(c.totalSpent).toLocaleString()}` : 'Regular Plan'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button 
                                                    onClick={() => handleToggleStatus(c.id, c.status)}
                                                    className="transition-transform active:scale-95"
                                                    title="Click to toggle status"
                                                >
                                                    <Badge className={cn(
                                                        "border-none px-2.5 py-0.5 text-[8px] font-black tracking-widest uppercase min-w-[62px] block text-center transition-all cursor-pointer",
                                                        c.status === 'enabled' 
                                                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                                                            : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                                                    )}>
                                                        {c.status === 'enabled' ? 'Active' : 'Disabled'}
                                                    </Badge>
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end items-center gap-1.5">
                                                    <button 
                                                        onClick={() => handleOpenModal(c)}
                                                        className="p-1.5 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-lg transition-all"
                                                        title="Edit Subscriber"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button 
                                                        className="p-1.5 text-admin-dim hover:text-orange-500 hover:bg-orange-500/5 rounded-lg transition-all"
                                                        title="Open Support Ticket"
                                                        onClick={() => router.push(`/dashboard/tickets?customer=${encodeURIComponent(fullName)}`)}
                                                    >
                                                        <LifeBuoy size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(c.id, fullName)}
                                                        className="p-1.5 text-admin-dim hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                                        title="Delete Subscriber"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
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
                description={currentCustomer ? `Update PPPoE configuration for ${currentCustomer.username}` : 'Select target MikroTik router, attach QoS package, and configure credentials.'}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handleSave} className="space-y-4 font-figtree">
                    {/* First Name & Second Name */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">First Name</label>
                            <input 
                                type="text" required
                                value={formData.firstName}
                                onChange={(e) => handleNameChange('firstName', e.target.value)}
                                placeholder="First Name"
                                className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Last / Second Name</label>
                            <input 
                                type="text" required
                                value={formData.lastName}
                                onChange={(e) => handleNameChange('lastName', e.target.value)}
                                placeholder="Last Name"
                                className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                    </div>

                    {/* Mobile Contact & Billing Account Number */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Mobile Contact</label>
                            <input 
                                type="text" required
                                value={formData.phone}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        phone: val,
                                        accountNumber: accountType === 'phone' ? val : prev.accountNumber
                                    }));
                                }}
                                placeholder="07XXXXXXXX"
                                className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Billing Account Number</label>
                            <div className="flex gap-1.5">
                                <input 
                                    type="text" required
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                                    placeholder="Account Number"
                                    className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAccountType('generate');
                                        const rand = Math.floor(100000 + Math.random() * 900000).toString();
                                        setFormData({...formData, accountNumber: rand});
                                    }}
                                    className="px-2.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-[10px] font-bold text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 transition-all whitespace-nowrap"
                                    title="Generate 6-digit number"
                                >
                                    Gen
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* STEP 1: Select Router */}
                    <div className="space-y-1 border-t border-pace-border pt-3">
                        <label className="text-[10px] font-bold text-pace-purple uppercase tracking-wider pl-1">
                            1. Select MikroTik Router
                        </label>
                        <select 
                            required
                            value={formData.router_id}
                            onChange={(e) => handleRouterChange(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                        >
                            <option value="">-- Choose Router --</option>
                            {routersList.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name} ({r.ip || 'No IP'}) {r.status ? `• ${r.status}` : ''}
                                </option>
                            ))}
                        </select>
                        {routersList.length === 0 && (
                            <p className="text-[10px] text-red-500 font-medium pl-1">No routers registered. Please add a router first.</p>
                        )}
                    </div>

                    {/* STEP 2: Select Package / Plan Attached to that Router */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-pace-purple uppercase tracking-wider pl-1">
                            2. Service QoS Plan (Attached to Router)
                        </label>
                        <select 
                            required
                            disabled={!formData.router_id}
                            value={formData.plan_id}
                            onChange={(e) => handlePlanChange(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {!formData.router_id ? (
                                <option value="">Please select a router first</option>
                            ) : availablePlansForSelectedRouter.length === 0 ? (
                                <option value="">No service plans created for this router</option>
                            ) : (
                                <>
                                    <option value="">-- Choose QoS Plan --</option>
                                    {availablePlansForSelectedRouter.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.bandwidth}) — KES {Number(p.price).toLocaleString()}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                        {formData.router_id && availablePlansForSelectedRouter.length === 0 && (
                            <p className="text-[10px] text-amber-500 font-medium pl-1">
                                No plans attached to this router yet. Create a plan for this router under Service Plans.
                            </p>
                        )}
                    </div>

                    {/* Activation Fee & Next Payment Date */}
                    <div className="grid grid-cols-2 gap-3 border-t border-pace-border pt-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">
                                Activation Fee (KES)
                            </label>
                            <input 
                                type="number"
                                min="0"
                                value={formData.activationFee}
                                onChange={(e) => setFormData({...formData, activationFee: Number(e.target.value)})}
                                placeholder="0"
                                className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-admin-value outline-none focus:border-pace-purple transition-all font-mono"
                            />
                            <p className="text-[9px] text-admin-dim pl-1">Setup / installation fee (0 or any amount)</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">
                                Next Payment Due Date
                            </label>
                            <input 
                                type="date"
                                value={formData.nextPayment}
                                onChange={(e) => setFormData({...formData, nextPayment: e.target.value})}
                                className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                            <p className="text-[9px] text-admin-dim pl-1">Subscription expiry / renewal date</p>
                        </div>
                    </div>

                    {/* Connection State Policy */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-wider pl-1">Connection State Policy</label>
                        <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-medium text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                        >
                            <option value="enabled">Enabled (Active Internet Access)</option>
                            <option value="disabled">Disabled (Suspended Session)</option>
                        </select>
                    </div>

                    {/* PPPoE Credentials */}
                    <div className="grid grid-cols-2 gap-3 border-t border-pace-border pt-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-pace-purple uppercase tracking-wider pl-1">PPPoE Username</label>
                            <input 
                                type="text" required
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                placeholder="pppoe_user"
                                className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-pace-purple uppercase tracking-wider pl-1">PPPoE Password</label>
                            <input 
                                type="text" required
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="secret_password"
                                className="w-full px-3.5 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-sm font-semibold text-pace-purple outline-none focus:border-pace-purple transition-all font-mono"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 grid grid-cols-2 gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="w-full px-5 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="w-full px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : (currentCustomer ? 'Save Changes' : 'Provision Subscriber')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default function CustomersPage() {
    return (
        <Suspense fallback={<TablePageSkeleton />}>
            <CustomersContent />
        </Suspense>
    )
}
