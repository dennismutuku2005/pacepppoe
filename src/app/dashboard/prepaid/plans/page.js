"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, Tag, Edit3, Trash2, Info, CheckCircle2, AlertCircle, Search, Save, Wifi, Link as LinkIcon, Smartphone, ChevronDown, Network, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Skeleton } from '@/components/Skeleton'
import { plansService } from '@/services/plans'
import { routerService } from '@/services/routers'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'

// ── Duration normalization (mirrors PHP normalizeDurationName) ────────────────
const TYPO_FIXES = [
    [/\bminuets?\b/gi, 'minutes'],
    [/\bminites\b/gi, 'minutes'],
    [/\bminets\b/gi, 'minutes'],
    [/\bminte s?\b/gi, 'minutes'],
    [/\bminute s\b/gi, 'minutes'],
    [/\bminut\b/gi, 'minute'],
    [/\bhoures\b/gi, 'hours'],
    [/\bhours s\b/gi, 'hours'],
    [/\bhors\b/gi, 'hours'],
    [/\bhoure\b/gi, 'hour'],
    [/\bhor\b/gi, 'hour'],
    [/\bdasy\b/gi, 'days'],
    [/\bdeys\b/gi, 'days'],
    [/\bdais\b/gi, 'days'],
    [/\bdai\b/gi, 'day'],
    [/\bweks\b/gi, 'weeks'],
    [/\bwek\b/gi, 'week'],
    [/\bwks\b/gi, 'weeks'],
    [/\bwk\b/gi, 'week'],
    [/\bmonthes\b/gi, 'months'],
    [/\bmonthe\b/gi, 'month'],
    [/\bmnths?\b/gi, 'months'],
    [/\bmnth\b/gi, 'month'],
    [/\bmnts?\b/gi, 'months'],
    [/\bmnt\b/gi, 'month'],
];

function normalizeDuration(raw) {
    if (!raw || !raw.trim()) return null;
    let s = raw.trim().toLowerCase();
    for (const [pattern, repl] of TYPO_FIXES) s = s.replace(pattern, repl);

    // Match all pairs of numbers (integers or decimals) and units
    const pattern = /(\d+(?:\.\d+)?)\s*(month|week|day|hour|min)/gi;
    const matches = [...s.matchAll(pattern)];

    if (matches.length === 0) return null;

    const normalizedParts = matches.map(m => {
        const num = parseFloat(m[1]);
        const unitPart = m[2];
        let unit;

        if (/^min(ute)?s?$/.test(unitPart)) unit = (num === 1) ? 'minute' : 'minutes';
        else if (/^h(r?s?|ours?)$/.test(unitPart)) unit = (num === 1) ? 'hour' : 'hours';
        else if (/^d(ays?)?$/.test(unitPart)) unit = (num === 1) ? 'day' : 'days';
        else if (/^(wk?s?|weeks?)$/.test(unitPart)) unit = (num === 1) ? 'week' : 'weeks';
        else if (/^(mo?s?|months?)$/.test(unitPart)) unit = (num === 1) ? 'month' : 'months';
        else return null;

        return `${num} ${unit}`;
    });

    if (normalizedParts.includes(null)) return null;
    return normalizedParts.join(' ');
}

function isValidDuration(raw) {
    return normalizeDuration(raw) !== null;
}

/**
 * Calculates total minutes for a duration string to allow comparison.
 */
function durationToMinutes(raw) {
    if (!raw) return 0;
    let s = raw.toLowerCase().trim();
    for (const [pattern, repl] of TYPO_FIXES) s = s.replace(pattern, repl);
    const pattern = /(\d+(?:\.\d+)?)\s*(month|week|day|hour|min)/gi;
    const matches = [...s.matchAll(pattern)];
    let total = 0;
    for (const m of matches) {
        const num = parseFloat(m[1]);
        const unit = m[2];
        if (/^min/i.test(unit)) total += num;
        else if (/^h/i.test(unit)) total += num * 60;
        else if (/^d/i.test(unit)) total += num * 1440;
        else if (/^w/i.test(unit)) total += num * 10080;
        else if (/^m/i.test(unit)) total += num * 43200;
    }
    return total;
}

/**
 * Sorts plans by duration (with price as tie-breaker).
 */
function sortPlans(plans) {
    if (!plans || !Array.isArray(plans)) return [];
    return [...plans].sort((a, b) => {
        const da = durationToMinutes(a.duration || a.time || '');
        const db = durationToMinutes(b.duration || b.time || '');
        if (da === db) {
            return parseFloat(a.price || 0) - parseFloat(b.price || 0);
        }
        return da - db;
    });
}
// ─────────────────────────────────────────────────────────────────────────────

function PrepaidPlansContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const routerIdParam = searchParams.get('router_id');

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);
    const [plans, setPlans] = useState([]);
    const [search, setSearch] = useState('');

    // Router State
    const [routers, setRouters] = useState([]);
    const [activeRouterId, setActiveRouterId] = useState(null);

    // New Plan Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: '',
        speed: 'UNLIMITED',
        rate_limit: '6M/6M'
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    // Derived activeRouterId from URL or first router
    useEffect(() => {
        if (routers.length > 0 && !routerIdParam) {
            handleRouterChange(routers[0].id);
        } else if (routerIdParam) {
            setActiveRouterId(routerIdParam);
        }
    }, [routerIdParam, routers]);

    useEffect(() => {
        if (activeRouterId) {
            loadConfig();
        }
    }, [activeRouterId]);

    const handleRouterChange = (id) => {
        const params = new URLSearchParams(searchParams);
        params.set('router_id', id);
        router.push(`?${params.toString()}`);
    };

    const loadInitialData = async () => {
        try {
            const res = await routerService.getRouters({ limit: 100 });
            if (res.status === 'success') {
                const fetchedRouters = res.data || [];
                setRouters(fetchedRouters);
            }
        } catch (error) {
            console.error("Failed to load routers", error);
        }
    };

    const loadConfig = async () => {
        setIsLoading(true);
        try {
            const res = await plansService.getPlans(activeRouterId);
            if (res.status === 'success') {
                const fetchedPlans = res.plans || [];
                setPlans(sortPlans(fetchedPlans));
            }
        } catch (error) {
            console.error("Failed to load plans", error);
        } finally {
            setIsLoading(false);
        }
    };

    // handleSaveConfig accepts full plans list + info about what changed
    const handleSaveConfig = async (updatedPlans, changedPlan = null, action = 'add', deletedPlanName = null) => {
        if (!activeRouterId) {
            toast.error('No active router selected.');
            return;
        }
        setIsSaving(true);
        try {
            const sortedPlans = sortPlans(updatedPlans);
            const res = await plansService.savePlans(activeRouterId, sortedPlans, changedPlan, action, deletedPlanName);
            setPlans(sortedPlans);
            setIsCreateModalOpen(false);
            setEditingPlan(null);
            setDeleteModal(null);
            if (res.router_warnings && res.router_warnings.length > 0) {
                toast.warning('Saved, but router had alerts: ' + res.router_warnings.join(', '));
            } else {
                toast.success(action === 'delete' ? 'Plan deleted successfully!' : 'Plan saved and synced!');
            }
        } catch (error) {
            toast.error('Failed to save: ' + (error.message || 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateOrUpdate = () => {
        if (!formData.price) return;
        const duration = (formData.duration || '').trim();
        if (!duration || !isValidDuration(duration)) {
            toast.error('Duration needs to be checked — use formats like: 1 hour, 30 minutes, 2 days, 1 week, 1 month.');
            return;
        }
        const normalizedName = normalizeDuration(duration);
        const planToSave = { ...formData, name: normalizedName };

        let newPlans;
        if (editingPlan !== null) {
            newPlans = [...plans];
            newPlans[editingPlan] = planToSave;
            handleSaveConfig(newPlans, planToSave, 'update');
        } else {
            newPlans = [...plans, planToSave];
            handleSaveConfig(newPlans, planToSave, 'add');
        }
    };

    const openEdit = (plan, index) => {
        setEditingPlan(index);
        setFormData(plan);
        setIsCreateModalOpen(true);
    };

    const confirmDelete = () => {
        const deletedPlan = plans[deleteModal];
        const newPlans = plans.filter((_, i) => i !== deleteModal);
        // Pass the deleted plan name and 'delete' action
        handleSaveConfig(newPlans, null, 'delete', deletedPlan?.name);
    };

    const filteredPlans = plans.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const activeRouterName = routers.find(r => r.id === activeRouterId)?.router_name || 'Global Default';

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            {/* Top Navigation & Router Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-bg p-4 rounded-2xl border border-pace-border shadow-sm overflow-visible">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-xl font-medium text-pace-purple">Plans</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Active Router:</span>
                            <span className="text-[11px] font-bold text-pace-purple uppercase">{activeRouterName}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={activeRouterId || ''}
                            onChange={(e) => handleRouterChange(e.target.value)}
                            className="appearance-none bg-pace-bg-subtle border border-pace-border text-pace-purple text-[11px] font-bold rounded-xl px-4 py-2.5 pr-10 focus:ring-4 focus:ring-pace-purple/5 focus:border-pace-purple outline-none cursor-pointer transition-all min-w-[180px]"
                        >
                            {routers.map(router => (
                                <option key={router.id} value={router.id}>{router.router_name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
                    </div>
                    <button
                        onClick={() => {
                            setEditingPlan(null);
                            setFormData({ name: '', price: '', duration: '', speed: 'UNLIMITED', rate_limit: '6M/6M' });
                            setIsCreateModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-medium hover:bg-pace-purple/90 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> New Plan
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" size={16} />
                        <input
                            type="text"
                            placeholder={`Search access plans for ${activeRouterName}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-pace-border bg-card-bg focus:bg-card-bg focus:ring-4 focus:ring-pace-purple/5 focus:border-pace-purple outline-none text-xs font-bold text-admin-value transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] whitespace-nowrap">
                            <thead>
                                <tr className="bg-card-bg border-b border-pace-border text-admin-dim font-bold uppercase tracking-wider text-[10px]">
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Plan Name</th>
                                    <th className="px-6 py-4">Cost</th>
                                    <th className="px-6 py-4">Validity</th>
                                    <th className="px-6 py-4">Speed</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4 text-right">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pace-border">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-4" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredPlans.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center w-full">
                                                <div className="w-20 h-20 bg-pace-bg-subtle rounded-full flex items-center justify-center text-admin-dim mb-5">
                                                    <Wifi size={40} />
                                                </div>
                                                <h3 className="text-[11px] text-admin-value uppercase tracking-[0.2em] font-black text-center">No bandwidth plans found for this router</h3>
                                                <p className="text-[10px] text-admin-dim mt-2 uppercase tracking-widest font-bold text-center">Click "New Plan" to start configuring this node.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlans.map((p, i) => (
                                        <tr key={i} className="hover:bg-pace-bg-subtle transition-colors group">
                                            <td className="px-6 py-4 text-gray-300 font-mono">{(i + 1).toString().padStart(2, '0')}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-pace-purple uppercase text-[12px]">{p.name}</span>
                                                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Active</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="bg-pace-bg-subtle inline-flex px-2 py-1 rounded-md border border-pace-border">
                                                    <span className="font-bold text-pace-purple text-[11px]">KES {p.price}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-pace-purple font-bold uppercase">{p.duration}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="text-[10px] font-mono font-bold border-pace-border text-foreground bg-pace-bg-subtle px-2 py-0.5">
                                                    {p.rate_limit || '6M/6M'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold text-admin-dim uppercase tracking-wider">{p.speed || 'STATIC'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(p, i)}
                                                        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-pace-purple hover:bg-pace-purple/10 rounded-xl transition-all border border-transparent hover:border-pace-purple/20"
                                                        title="Edit Configuration"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal(i)}
                                                        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                        title="Remove Plan"
                                                    >
                                                        <Trash2 size={15} />
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
            </div>

            {/* Create/Edit Plan Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => !isSaving && setIsCreateModalOpen(false)}
                title={editingPlan !== null ? "Edit Plan Identity" : "Generate New Asset"}
                maxWidth="max-w-md"
                footer={
                    <>
                        <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-gray-600 font-bold text-xs uppercase">Cancel</button>
                        <button
                            onClick={handleCreateOrUpdate}
                            disabled={isSaving || !formData.price || !isValidDuration(formData.duration || '')}
                            className="px-6 py-2 bg-pace-purple text-white rounded-lg font-bold text-xs hover:bg-[#3d1a75] shadow-lg shadow-pace-purple/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <span className="animate-spin border-2 border-white/30 border-t-white w-3 h-3 rounded-full" /> : <Save size={14} />}
                            {editingPlan !== null ? "Update Identity" : "Commit Plan"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 mb-4">
                        <div className="flex items-center gap-2 text-blue-500 mb-1.5">
                            <Info size={16} />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Note</span>
                        </div>
                        <p className="text-[11px] text-admin-value font-medium leading-relaxed">Configuring plan for router node: <span className="font-bold text-pace-purple uppercase">{activeRouterName}</span></p>
                        <p className="text-[10px] text-admin-dim font-bold mt-1.5 uppercase tracking-tight">The package name is auto-generated from the duration you enter.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Price (KES)</label>
                            <input
                                type="text"
                                value={formData.price || ''}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="10"
                                className="w-full px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/5 focus:border-pace-purple text-[13px] font-bold transition-all text-admin-value"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Duration</label>
                            <input
                                type="text"
                                value={formData.duration || ''}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="e.g. 1 hour, 30 minutes"
                                className={cn(
                                    "w-full px-3 py-2.5 rounded-xl border bg-pace-bg-subtle outline-none text-[13px] font-bold transition-all text-admin-value",
                                    formData.duration && !isValidDuration(formData.duration)
                                        ? "border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400"
                                        : "border-pace-border focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/5 focus:border-pace-purple"
                                )}
                            />
                            {/* Inline feedback */}
                            {formData.duration && (
                                isValidDuration(formData.duration) ? (
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                                            Package name: &ldquo;{normalizeDuration(formData.duration)}&rdquo;
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <AlertCircle size={11} className="text-red-500 shrink-0" />
                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                                            Duration needs to be checked
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Speed Identity</label>
                            <input
                                type="text"
                                value={formData.speed || ''}
                                onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                                placeholder="UNLIMITED"
                                className="w-full px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/5 focus:border-pace-purple text-[13px] font-bold transition-all text-admin-value"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Rate Limit (TX/RX)</label>
                            <input
                                type="text"
                                value={formData.rate_limit || ''}
                                onChange={(e) => setFormData({ ...formData, rate_limit: e.target.value })}
                                placeholder="6M/6M"
                                className="w-full px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-pace-purple/5 focus:border-pace-purple text-[13px] font-bold transition-all text-admin-value"
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal !== null}
                onClose={() => !isSaving && setDeleteModal(null)}
                title="Decommit Plan asset"
                maxWidth="max-w-sm"
                footer={
                    <>
                        <button onClick={() => setDeleteModal(null)} className="flex-1 py-2 text-gray-400 font-bold text-xs uppercase">Keep</button>
                        <button
                            onClick={confirmDelete}
                            disabled={isSaving}
                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 shadow-lg shadow-red-200"
                        >
                            {isSaving ? "Removing..." : "Delete Plan"}
                        </button>
                    </>
                }
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Confirm Deletion</h3>
                    <p className="text-xs text-gray-500 mt-2 px-4 leading-relaxed tracking-wide">Are you sure you want to remove this plan from the hotspot configuration for <span className="text-red-600 font-bold">{activeRouterName}</span>?</p>
                </div>
            </Modal>
        </div>
    );
}

export default function PrepaidPlansPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-pace-purple" />
            </div>
        }>
            <PrepaidPlansContent />
        </Suspense>
    );
}