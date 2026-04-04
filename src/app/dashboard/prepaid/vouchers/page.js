"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Plus, Ticket, Filter, Download, Trash2, MoreHorizontal, CheckCircle2, Wifi, Tag, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Skeleton } from '@/components/Skeleton'
import { vouchersService } from '@/services/vouchers'
import { plansService } from '@/services/plans'
import { routerService } from '@/services/routers'
import { systemService } from '@/services/system'
import { authService } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function PrepaidVouchersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const routerIdParam = searchParams.get('router_id');

    const [isLoading, setIsLoading] = useState(true);
    const [isVouchersLoading, setIsVouchersLoading] = useState(false);
    const [isPlansLoading, setIsPlansLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

    const [vouchers, setVouchers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [routers, setRouters] = useState([]);
    const [activeRouterId, setActiveRouterId] = useState('all');

    // Pagination & Search
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);

    // Bulk actions
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Form state
    const [isVouchersAsSaleForced, setIsVouchersAsSaleForced] = useState(false);
    const [formData, setFormData] = useState({
        router_name: '',
        plan: '',
        count: 1,
        sale: 0 // Adding sale field
    });

    const observer = useRef();
    const lastVoucherElementRef = useCallback(node => {
        if (isVouchersLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isVouchersLoading, hasMore]);

    useEffect(() => {
        loadInitialData();
    }, []);

    // Derived activeRouterId from URL
    useEffect(() => {
        if (routerIdParam) {
            setActiveRouterId(routerIdParam);
        } else {
            setActiveRouterId('all');
        }

        // Open create modal if ?create=true is present
        if (searchParams.get('create') === 'true') {
            setIsCreateModalOpen(true);
            // Clean up the URL after opening
            const params = new URLSearchParams(searchParams);
            params.delete('create');
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }
    }, [routerIdParam, searchParams]);

    useEffect(() => {
        if (activeRouterId && routers.length > 0) {
            loadRouterSpecificData();
            setPage(1);
            loadVouchers(1, true);
        }
    }, [activeRouterId, routers]);

    const handleActiveRouterChange = (id) => {
        const params = new URLSearchParams(searchParams);
        if (id === 'all') params.delete('router_id');
        else params.set('router_id', id);
        router.push(`?${params.toString()}`);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            loadVouchers(1, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (page > 1) {
            loadVouchers(page);
        }
    }, [page]);

    const loadInitialData = async () => {
        try {
            const [routersRes, sysRes] = await Promise.all([
                routerService.getRouters(),
                systemService.getSettings()
            ])

            if (routersRes.status === 'success') {
                const fetchedRouters = routersRes.data || [];
                setRouters(fetchedRouters);
            }

            if (sysRes.status === 'success') {
                const isForced = parseInt(sysRes.data.vouchers_as_sale) === 1;
                setIsVouchersAsSaleForced(isForced);
                setFormData(prev => ({ ...prev, sale: isForced ? 1 : 0 }));
            }
        } catch (error) {
            console.error("Failed to load initial data", error);
            setIsLoading(false);
        }
    };

    const loadRouterSpecificData = async (routerId = activeRouterId) => {
        if (!routerId || routerId === 'all') {
            setPlans([]);
            setFormData(prev => ({
                ...prev,
                plan: '',
                router_name: activeRouterId !== 'all' ? (routers.find(r => r.id === activeRouterId)?.router_name || '') : ''
            }));
            setIsPlansLoading(false);
            return;
        }

        setIsPlansLoading(true);
        try {
            let targetRouterName = '';
            const activeRouter = routers.find(r => r.id === routerId);
            if (activeRouter) {
                targetRouterName = activeRouter.router_name;
            }

            const plansRes = await plansService.getPlans(routerId);

            if (plansRes.status === 'success') {
                const fetchedPlans = plansRes.plans || [];
                setPlans(fetchedPlans);

                // If we have plans, pre-select the first one
                if (fetchedPlans.length > 0) {
                    setFormData(prev => ({ ...prev, plan: fetchedPlans[0].name, router_name: targetRouterName }));
                } else {
                    setFormData(prev => ({ ...prev, plan: '', router_name: targetRouterName }));
                }
            }
        } catch (error) {
            console.error("Failed to load router specific data", error);
        } finally {
            setIsPlansLoading(false);
        }
    };

    const loadVouchers = async (pageNum, isNewSearch = false) => {
        setIsVouchersLoading(true);
        try {
            // Always load all vouchers regardless of active router filter
            const res = await vouchersService.getVouchers(pageNum, 10, search, 'all');
            if (res.status === 'success') {
                if (isNewSearch) {
                    setVouchers(res.data);
                } else {
                    setVouchers(prev => [...prev, ...res.data]);
                }
                setHasMore(res.pagination.has_more);
                setTotal(res.pagination.total);
            }
        } catch (error) {
            console.error("Failed to load vouchers", error);
        } finally {
            setIsLoading(false);
            setIsVouchersLoading(false);
        }
    };

    const handleCreateVouchers = async () => {
        if (!formData.plan) return;
        setIsSubmitting(true);
        try {
            await vouchersService.createVouchers(formData);
            toast.success(`${formData.count} voucher(s) created!`);

            // Close modal and reset form first
            // Close modal and reset form
            setIsCreateModalOpen(false);
            
            // Re-fetch or reuse current forced state
            const sysRes = await systemService.getSettings();
            const isForced = sysRes.status === 'success' ? (parseInt(sysRes.data.vouchers_as_sale) === 1) : false;
            setIsVouchersAsSaleForced(isForced);
            setFormData({ router_name: '', plan: '', count: 1, sale: isForced ? 1 : 0 });
            setPlans([]);

            // Then force a fresh reload of vouchers from page 1
            setPage(1);
            setVouchers([]);
            setHasMore(true);
            // Small delay to let React flush state before fetching
            setTimeout(() => loadVouchers(1, true), 100);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSelected = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        setIsSubmitting(true);
        try {
            await vouchersService.deleteVouchers(ids);
            setVouchers(prev => prev.filter(v => !selectedIds.has(v.id)));
            setSelectedIds(new Set());
            setShowDeleteAllConfirm(false);
            toast.success('Selected vouchers deleted.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSingle = async () => {
        if (!deleteModal) return;
        setIsSubmitting(true);
        try {
            await vouchersService.deleteVouchers([deleteModal.id]);
            setVouchers(prev => prev.filter(v => v.id !== deleteModal.id));
            setDeleteModal(null);
            toast.success('Voucher deleted.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSelection = (id) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const selectAll = () => {
        if (selectedIds.size === vouchers.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(vouchers.map(v => v.id)));
        }
    };

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-pace-border pb-4">
                <div className="flex-1">
                    <h1 className="text-xl font-medium text-pace-purple">Prepaid Vouchers</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-[11px] text-admin-dim font-bold uppercase tracking-wide">Selected Router:</p>
                        <Badge variant="success" className="bg-pace-purple/5 text-pace-purple border-none text-[10px] px-2 py-0 font-medium uppercase">
                            {activeRouterId === 'all' ? 'All Routers' : routers.find(r => r.id === activeRouterId)?.router_name || 'Loading...'}
                        </Badge>
                        <span className="text-[10px] text-gray-400 ml-2">Total: <span className="text-pace-purple font-medium">{total}</span></span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Router Selector */}
                    <div className="relative group">
                        <select
                            value={activeRouterId || ''}
                            onChange={(e) => handleActiveRouterChange(e.target.value)}
                            className="appearance-none bg-pace-bg-subtle border border-pace-border text-pace-purple text-[11px] font-bold rounded-xl px-4 py-2.5 pr-10 focus:ring-4 focus:ring-pace-purple/5 focus:border-pace-purple outline-none cursor-pointer transition-all min-w-[180px]"
                        >
                            <option value="all">All Stations</option>
                            {routers.map(router => (
                                <option key={router.id} value={router.id}>{router.router_name}</option>
                            ))}
                        </select>
                        <Wifi className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-hover:text-pace-purple" size={14} />
                    </div>

                    {selectedIds.size > 0 && (
                        <button
                            onClick={() => setShowDeleteAllConfirm(true)}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100"
                        >
                            <Trash2 size={14} /> Delete Selected ({selectedIds.size})
                        </button>
                    )}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-pace-purple text-white rounded-lg text-xs font-medium hover:bg-pace-purple/90 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> New Voucher
                    </button>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim" size={16} />
                    <input
                        type="text"
                        placeholder={`Search ${activeRouterId === 'all' ? 'all' : (routers.find(r => r.id === activeRouterId)?.router_name || 'node')} vouchers...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-pace-border bg-card-bg focus:bg-card-bg focus:ring-4 focus:ring-pace-purple/5 focus:border-pace-purple outline-none text-xs font-bold text-admin-value transition-all"
                    />
                </div>
            </div>

            {/* Vouchers Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead>
                            <tr className="bg-card-bg border-b border-pace-border text-admin-dim font-bold uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-pace-border text-pace-purple focus:ring-pace-purple cursor-pointer"
                                        checked={vouchers.length > 0 && selectedIds.size === vouchers.length}
                                        onChange={selectAll}
                                    />
                                </th>
                                <th className="px-6 py-4">Voucher PIN</th>
                                <th className="px-6 py-4">Access Plan</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4">Sale?</th>
                                <th className="px-6 py-4">Station</th>
                                <th className="px-6 py-4 text-right">Issued</th>
                                <th className="px-6 py-4 text-right">Manage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading && page === 1 ? (
                                [...Array(10)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-4" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-32 ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
                                    </tr>
                                ))
                            ) : vouchers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                                        No vouchers found for {activeRouterId === 'all' ? 'any node' : (routers.find(r => r.id === activeRouterId)?.router_name || 'this node')}
                                    </td>
                                </tr>
                            ) : (
                                vouchers.map((v, index) => {
                                    const isLastElement = vouchers.length === index + 1;
                                    return (
                                        <tr
                                            key={v.id}
                                            ref={isLastElement ? lastVoucherElementRef : null}
                                            className="hover:bg-pace-bg-subtle transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-pace-border text-pace-purple focus:ring-pace-purple cursor-pointer"
                                                    checked={selectedIds.has(v.id)}
                                                    onChange={() => toggleSelection(v.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-black">
                                                    <Ticket size={14} className="text-admin-dim" />
                                                    <span className="font-bold uppercase font-mono tracking-widest text-[12px] text-pace-purple">{v.voucher_code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-pace-purple uppercase text-[11px]">{v.plan}</span>
                                                    <span className="text-[9px] text-gray-400 font-medium uppercase">Prepaid Access</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant={v.used == 0 ? 'success' : 'secondary'} className="text-[9px] px-2 py-0.5 font-medium uppercase">
                                                    {v.used == 0 ? 'Available' : 'Used'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge 
                                                    variant={v.sale == 1 ? 'success' : 'secondary'} 
                                                    className={cn(
                                                        "text-[9px] px-2 py-0.5 font-medium uppercase", 
                                                        v.sale == 1 
                                                            ? "bg-emerald-50/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400" 
                                                            : "bg-gray-50 text-gray-400 border-gray-100 dark:bg-white/5 dark:text-gray-400 dark:border-white/10"
                                                    )}
                                                >
                                                    {v.sale == 1 ? 'YES' : 'NO'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 font-bold uppercase text-[10px] text-admin-value">
                                                    <Wifi size={12} className="text-admin-dim" />
                                                    <span>{v.router_name || 'DEFAULT'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-admin-dim font-mono text-[10px]">
                                                {v.created_at}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setDeleteModal(v)}
                                                    className="h-8 w-8 flex items-center justify-center text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {isVouchersLoading && page > 1 && (
                    <div className="py-8 flex justify-center border-t border-pace-border">
                        <div className="flex items-center gap-3 text-pace-purple">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Loading more vouchers...</span>
                        </div>
                    </div>
                )}

                {!hasMore && vouchers.length > 0 && (
                    <div className="py-8 text-center border-t border-pace-border">
                        <span className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">End of vouchers list reached</span>
                    </div>
                )}
            </div>

            {/* Create Voucher Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
                title="Generate Multi-Access Vouchers"
                maxWidth="max-w-md"
                footer={
                    <>
                        <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-gray-600 font-bold text-xs uppercase">Cancel</button>
                        <button
                            onClick={handleCreateVouchers}
                            disabled={isSubmitting || !formData.plan}
                            className="px-6 py-2 bg-pace-purple text-white rounded-lg font-bold text-xs hover:bg-[#3d1a75] shadow-lg shadow-pace-purple/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Generate Vouchers
                        </button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Select Router Node</label>
                        <select
                            className="w-full px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/5 focus:border-pace-purple text-[13px] font-bold transition-all appearance-none cursor-pointer text-admin-value"
                            value={routers.find(r => r.router_name === formData.router_name)?.id || ''}
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                if (!selectedId) {
                                    setFormData({ ...formData, router_name: '', plan: '' });
                                    setPlans([]);
                                    return;
                                }
                                const r = routers.find(x => x.id === selectedId);
                                if (r) {
                                    setFormData({ ...formData, router_name: r.router_name });
                                    loadRouterSpecificData(selectedId);
                                }
                            }}
                        >
                            <option value="">Select a router node...</option>
                            {routers.map(r => <option key={r.id} value={r.id}>{r.router_name}</option>)}
                        </select>
                        <p className="text-[9px] text-pace-purple font-bold uppercase tracking-wider mt-1">Vouchers will be assigned to this node</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Select Access Plan</label>
                        <div className="relative">
                            <select
                                className="w-full px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/5 focus:border-pace-purple text-[13px] font-bold transition-all appearance-none disabled:opacity-50 text-admin-value"
                                value={formData.plan}
                                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                disabled={isPlansLoading}
                            >
                                {isPlansLoading ? (
                                    <option>Fetching plans...</option>
                                ) : plans.length === 0 ? (
                                    <option value="">No plans configured for node</option>
                                ) : (
                                    <>
                                        <option value="">Select a plan...</option>
                                        {plans.map(p => <option key={p.name} value={p.name}>{p.name} - KES {p.price}</option>)}
                                    </>
                                )}
                            </select>
                            {isPlansLoading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="animate-spin text-pace-purple" size={14} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Bulk Quantity</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={formData.count}
                            onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/5 focus:border-pace-purple text-[13px] font-bold transition-all text-admin-value"
                        />
                        <p className="text-[9px] text-admin-dim font-bold uppercase tracking-wide mt-1">Generate up to 50 unique vouchers at once.</p>
                    </div>

                    <div className={cn("pt-2", isVouchersAsSaleForced && "opacity-60 cursor-not-allowed")}>
                        <label className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border border-pace-border bg-pace-bg-subtle transition-all group",
                            !isVouchersAsSaleForced && "cursor-pointer hover:bg-white dark:hover:bg-white/5"
                        )}>
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 appearance-none rounded-md border border-pace-border checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer disabled:cursor-not-allowed"
                                    checked={formData.sale === 1}
                                    onChange={(e) => !isVouchersAsSaleForced && setFormData({ ...formData, sale: e.target.checked ? 1 : 0 })}
                                    disabled={isVouchersAsSaleForced}
                                />
                                <CheckCircle2 className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                            </div>
                            <div className="flex flex-col">
                                <span className={cn("text-[11px] font-bold uppercase tracking-wide", isVouchersAsSaleForced ? "text-emerald-600" : "text-admin-value")}>
                                    {isVouchersAsSaleForced ? "Forced Sale Mode" : "Record a Sale"}
                                </span>
                                <span className="text-[9px] text-admin-dim font-medium">
                                    {isVouchersAsSaleForced ? "Global policy: All vouchers must be sales" : "When redeemed, this will record a payment entry."}
                                </span>
                            </div>
                        </label>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={showDeleteAllConfirm}
                onClose={() => !isSubmitting && setShowDeleteAllConfirm(false)}
                title="Bulk Delete Vouchers"
                maxWidth="max-w-sm"
                footer={
                    <>
                        <button onClick={() => setShowDeleteAllConfirm(false)} className="flex-1 py-2 text-gray-400 font-bold text-xs uppercase">Cancel</button>
                        <button
                            onClick={handleDeleteSelected}
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 shadow-lg shadow-red-200"
                        >
                            {isSubmitting ? "Deleting..." : `Delete ${selectedIds.size} Items`}
                        </button>
                    </>
                }
            >
                <div className="text-center py-4 space-y-3">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <Trash2 size={24} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Confirm Bulk Deletion</h3>
                    <p className="text-xs text-gray-500 px-4 leading-relaxed tracking-wide">Are you sure you want to permanently remove {selectedIds.size} selected vouchers? This action cannot be undone.</p>
                </div>
            </Modal>

            {/* Delete Single Modal */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => !isSubmitting && setDeleteModal(null)}
                title="Remove Voucher"
                maxWidth="max-w-sm"
                footer={
                    <>
                        <button onClick={() => setDeleteModal(null)} className="flex-1 py-2 text-gray-400 font-bold text-xs uppercase">Keep</button>
                        <button
                            onClick={handleDeleteSingle}
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 shadow-lg shadow-red-200"
                        >
                            {isSubmitting ? "Removing..." : "Delete Voucher"}
                        </button>
                    </>
                }
            >
                {deleteModal && (
                    <div className="text-center py-4 space-y-3">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                            <Ticket size={24} />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Delete Voucher</h3>
                        <p className="text-xs text-gray-600">Permanently remove code <span className="font-bold text-pace-purple">{deleteModal.voucher_code}</span>?</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default function PrepaidVouchersPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-pace-purple" />
            </div>
        }>
            <PrepaidVouchersContent />
        </Suspense>
    );
}
