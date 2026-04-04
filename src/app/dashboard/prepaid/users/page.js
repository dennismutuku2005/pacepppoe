"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Plus, Filter, Smartphone, User, Clock, Trash2, Wifi, Hash, Tag, UserPlus, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Skeleton, TableRowSkeleton } from '@/components/Skeleton'
import { routerService } from '@/services/routers'
import { plansService } from '@/services/plans'
import { prepaidUsersService } from '@/services/prepaidUsers'

export default function PrepaidUsersPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);

    // Data State
    const [users, setUsers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [routers, setRouters] = useState([]);
    const [activeRouterId, setActiveRouterId] = useState('all');

    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        phone: '',
        plan_id: '',
        router_id: '',
        mac: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadRouterSpecificData();
        fetchUsers(1, true);
    }, [activeRouterId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const loadInitialData = async () => {
        try {
            const res = await routerService.getRouters();
            if (res.status === 'success') {
                const fetchedRouters = res.data || [];
                setRouters(fetchedRouters);
            }
        } catch (error) {
            console.error("Failed to load routers", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRouterSpecificData = async () => {
        try {
            const res = await plansService.getPlans(activeRouterId === 'all' ? 'default' : activeRouterId);
            if (res.status === 'success') {
                setPlans(res.plans || []);
            }
            if (activeRouterId !== 'all') {
                setFormData(prev => ({ ...prev, router_id: activeRouterId }));
            }
        } catch (error) {
            console.error("Failed to load plans", error);
        }
    };

    const fetchUsers = async (pageNum, isNewSearch = false) => {
        if (!activeRouterId) return;
        try {
            const res = await prepaidUsersService.getUsers({
                routerId: activeRouterId,
                search,
                page: pageNum
            });
            if (res.status === 'success') {
                if (isNewSearch) {
                    setUsers(res.data);
                } else {
                    setUsers(prev => [...prev, ...res.data]);
                }
                setHasMore(res.pagination.has_more);
                setTotal(res.pagination.total);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    // Fetch plans when router changes in modal
    useEffect(() => {
        if (formData.router_id && isCreateModalOpen) {
            const fetchModalPlans = async () => {
                try {
                    const res = await plansService.getPlans(formData.router_id);
                    if (res.status === 'success') {
                        setPlans(res.plans || []);
                        // Clear plan if not in new list
                        if (!res.plans.some(p => p.name === formData.plan_id)) {
                            setFormData(prev => ({ ...prev, plan_id: '' }));
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch modal plans", error);
                }
            };
            fetchModalPlans();
        }
    }, [formData.router_id, isCreateModalOpen]);

    const handleCreateUser = async () => {
        if (!formData.username || !formData.password || !formData.plan_id || !formData.router_id) return;
        setIsSubmitting(true);
        try {
            const res = await prepaidUsersService.createUser(formData);
            if (res.status === 'success') {
                setIsCreateModalOpen(false);
                // Switch dashboard to the router the user was just added to
                if (activeRouterId !== formData.router_id) {
                    setActiveRouterId(formData.router_id);
                } else {
                    fetchUsers(1, true);
                }
                setFormData({
                    username: '',
                    password: '',
                    phone: '',
                    plan_id: '',
                    router_id: activeRouterId,
                    mac: ''
                });
                toast.success('Prepaid user registered!');
            } else {
                toast.error(res.message || 'Failed to create user');
            }
        } catch (error) {
            toast.error(error.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal) return;
        setIsSubmitting(true);
        try {
            await prepaidUsersService.deleteUser(deleteModal.id);
            setUsers(prev => prev.filter(u => u.id !== deleteModal.id));
            setDeleteModal(null);
            toast.success('User account removed.');
        } catch (error) {
            toast.error(error.message || 'Delete failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReaddUser = async (user) => {
        const loadingToast = toast.loading(`Re-adding ${user.username} to router...`);
        try {
            await prepaidUsersService.readdUser(user.id);
            toast.success(`${user.username} re-added successfully!`, { id: loadingToast });
            fetchUsers(page, true);
        } catch (error) {
            toast.error(error.message || 'Re-add failed', { id: loadingToast });
        }
    };

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-pace-border pb-4">
                <div className="flex-1">
                    <h1 className="text-xl font-medium text-pace-purple">Prepaid Users</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-[11px] text-admin-dim font-medium">Selected Router:</p>
                        <Badge variant="success" className="bg-pace-purple/5 text-pace-purple border-none text-[10px] px-2 py-0 font-medium uppercase">
                            {activeRouterId === 'all' ? 'All Routers' : routers.find(r => r.id === activeRouterId)?.router_name || 'Loading...'}
                        </Badge>
                        <span className="text-[10px] text-admin-dim font-bold ml-2">Total Users: <span className="text-pace-purple font-bold">{total}</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Router Selector */}
                    <div className="relative group">
                        <select
                            value={activeRouterId || ''}
                            onChange={(e) => setActiveRouterId(e.target.value)}
                            className="appearance-none bg-card-bg border border-pace-border text-pace-purple text-[11px] font-bold rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple outline-none cursor-pointer transition-all min-w-[180px]"
                        >
                            <option value="all">All Stations</option>
                            {routers.map(router => (
                                <option key={router.id} value={router.id}>{router.router_name}</option>
                            ))}
                        </select>
                        <Wifi className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-hover:text-pace-purple" size={14} />
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-pace-purple text-white rounded-lg text-xs font-medium hover:bg-pace-purple/90 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> New Account
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Node Users', val: total, icon: User, color: 'text-pace-purple', bg: 'bg-pace-purple/10' },
                    { label: 'Active Sessions', val: '-', icon: Wifi, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Plan Types', val: plans.length, icon: Hash, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Node Status', val: 'Online', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                ].map((m, i) => (
                    <div key={i} className="bg-card-bg border border-pace-border p-4 rounded-xl shadow-sm">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${m.bg} ${m.color}`}>
                            <m.icon size={16} />
                        </div>
                        <p className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">{m.label}</p>
                        <p className="text-lg font-bold text-pace-purple mt-1">{m.val}</p>
                    </div>
                ))}
            </div>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder={`Search ${activeRouterId === 'all' ? 'all' : (routers.find(r => r.id === activeRouterId)?.router_name || 'node')} users...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-pace-border bg-card-bg focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple outline-none text-xs font-bold text-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle border-b border-pace-border text-admin-dim font-bold uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Phone Number</th>
                                <th className="px-6 py-4">Active Plan</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-6 py-4">Expires</th>
                                <th className="px-6 py-4 text-right">Manage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading && users.length === 0 ? (
                                <TableRowSkeleton cols={6} rows={10} />
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                                        No prepaid accounts found for {activeRouterId === 'all' ? 'any node' : (routers.find(r => r.id === activeRouterId)?.router_name || 'this node')}
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-pace-bg-subtle transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-pace-purple text-[12px] uppercase">{user.username}</span>
                                                <span className="text-[9px] text-gray-400 font-mono">{user.mac || 'No linked device'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-pace-purple font-medium">
                                                <Smartphone size={12} className="text-gray-300" />
                                                <span className="text-[11px]">{user.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 font-medium text-pace-purple uppercase">
                                                <Tag size={12} className="text-gray-300" />
                                                {user.plan_id}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={user.active ? 'success' : 'secondary'} className="text-[9px] px-2 py-0.5 font-medium uppercase">
                                                {user.active ? 'Active' : 'Suspended'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-[10px]">
                                            {user.expire_at}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!user.active && (
                                                    <button
                                                        onClick={() => handleReaddUser(user)}
                                                        title="Re-add to Router"
                                                        className="h-8 w-8 flex items-center justify-center text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all border border-transparent hover:border-blue-500/20"
                                                    >
                                                        <UserPlus size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDeleteModal(user)}
                                                    className="h-8 w-8 flex items-center justify-center text-admin-dim hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Prepaid User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
                title="Register Prepaid Account"
                maxWidth="max-w-md"
                footer={
                    <>
                        <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-gray-600 font-bold text-xs uppercase">Cancel</button>
                        <button
                            onClick={handleCreateUser}
                            disabled={isSubmitting || !formData.username || !formData.plan_id || !formData.router_id}
                            className="px-6 py-2 bg-pace-purple text-white rounded-lg font-bold text-xs hover:bg-[#3d1a75] shadow-lg shadow-pace-purple/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                            Register Account
                        </button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Username</label>
                            <input
                                type="text"
                                placeholder="john_doe"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple text-[13px] font-bold text-admin-value transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple text-[13px] font-bold text-admin-value transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Node (MicroTik Router)</label>
                        <select
                            className="w-full px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple text-[13px] font-bold text-admin-value transition-all appearance-none cursor-pointer"
                            value={formData.router_id}
                            onChange={(e) => setFormData({ ...formData, router_id: e.target.value })}
                        >
                            <option value="">Select a router node...</option>
                            {routers.map(r => <option key={r.id} value={r.id}>{r.router_name}</option>)}
                        </select>
                        <p className="text-[9px] text-pace-purple font-bold uppercase tracking-wider mt-1 italic">
                            * User will be automatically pushed to this router.
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Access Plan / Package</label>
                        <select
                            className="w-full px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple text-[13px] font-bold text-admin-value transition-all appearance-none cursor-pointer"
                            value={formData.plan_id}
                            onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                            disabled={!formData.router_id}
                        >
                            <option value="">{formData.router_id ? "Select a plan profile..." : "Select a router first..."}</option>
                            {plans.map(p => <option key={p.name} value={p.name}>{p.name} (KES {p.price} | {p.duration})</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-pace-border">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Phone (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. 0712345678"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple text-[13px] font-bold text-admin-value transition-all"
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => !isSubmitting && setDeleteModal(null)}
                title="Remove Account"
                maxWidth="max-w-sm"
                footer={
                    <>
                        <button onClick={() => setDeleteModal(null)} className="flex-1 py-2 text-gray-400 font-bold text-xs uppercase">Cancel</button>
                        <button
                            onClick={handleDeleteUser}
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 shadow-lg shadow-red-200"
                        >
                            {isSubmitting ? "Removing..." : "Delete User"}
                        </button>
                    </>
                }
            >
                {deleteModal && (
                    <div className="text-center py-4 space-y-3">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                            <User size={24} />
                        </div>
                        <h3 className="text-base font-bold text-admin-value">Delete Account</h3>
                        <p className="text-xs text-admin-dim px-4">Permanently remove user <span className="font-bold text-pace-purple">{deleteModal.username}</span> from this node?</p>
                    </div>
                )}
            </Modal>
        </div>
    )
}
