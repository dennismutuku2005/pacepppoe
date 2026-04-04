"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Smartphone, Layout, Image as ImageIcon, Loader2, Check, AlertTriangle, Info, ChevronLeft, ChevronRight, Monitor, X } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { themesService } from '@/lib/themes'
import { toast } from 'sonner'

export default function ThemesPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isActivating, setIsActivating] = useState(false);
    const [themes, setThemes] = useState([]);
    const [routers, setRouters] = useState([]);
    const [activeThemes, setActiveThemes] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, has_more: false });
    const [error, setError] = useState(null);

    const [selectedTheme, setSelectedTheme] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);

    const [activationData, setActivationData] = useState({
        themeId: null,
        routerId: ''
    });

    // Infinite Scroll Observer
    const observer = useRef();
    const lastThemeElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && pagination.page < pagination.pages) {
                fetchThemes(pagination.page + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, pagination.page, pagination.pages]);

    useEffect(() => {
        initData();
    }, []);

    const initData = async () => {
        setIsInitialLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchThemes(1, true),
                fetchRouters(),
                fetchActiveThemes()
            ]);
        } catch (err) {
            setError("Connectivity error. Please check your network.");
        } finally {
            setIsInitialLoading(false);
        }
    };

    const fetchActiveThemes = async () => {
        const res = await themesService.getActiveThemes();
        if (res.success) setActiveThemes(res.data);
    };

    const fetchThemes = async (page = 1, isInitial = false) => {
        setIsLoading(true);
        try {
            const result = await themesService.getThemes(page, 10);
            if (result.success) {
                if (isInitial) {
                    setThemes(result.data);
                } else {
                    setThemes(prev => {
                        // Avoid duplicates
                        const existingIds = new Set(prev.map(t => t.id));
                        const newThemes = result.data.filter(t => !existingIds.has(t.id));
                        return [...prev, ...newThemes];
                    });
                }
                setPagination({
                    ...result.pagination,
                    has_more: result.pagination.page < result.pagination.pages
                });
            } else {
                if (isInitial) setError(result.message);
            }
        } catch (err) {
            if (isInitial) setError("Failed to connect to the marketplace server.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRouters = async () => {
        const result = await themesService.getRouters();
        if (result.success) {
            setRouters(result.data);
            if (result.data.length > 0 && !activationData.routerId) {
                setActivationData(prev => ({ ...prev, routerId: result.data[0].id }));
            }
        }
    };

    const handleOpenActivate = (theme) => {
        setActivationData(prev => ({
            ...prev,
            themeId: theme.id
        }));
        setSelectedTheme(theme);
        setIsActivateModalOpen(true);
    };

    const handleActivate = async () => {
        if (!activationData.routerId) {
            toast.error('Please select a target router.');
            return;
        }

        setIsActivating(true);
        const result = await themesService.activateTheme(activationData.themeId, activationData.routerId);
        if (result.success) {
            setIsActivateModalOpen(false);
            toast.success('Theme activated and synced successfully!');
        } else {
            toast.error(result.message || 'Activation failed');
        }
        setIsActivating(false);
        // Refresh active themes to show "Current" immediately
        const activeRes = await themesService.getActiveThemes();
        if (activeRes.success) {
            setActiveThemes(activeRes.data);
        }
    };

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            {/* Branded Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-pace-border pb-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-admin-value tracking-tight">Theme Library</h1>
                    <p className="text-sm text-sm text-gray-500">Infinite scroll through our premium designs. Preview before you activate.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Router filter removed as requested */}
                </div>
            </div>

            {/* Simple Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between text-red-500 mb-6 group">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={18} />
                        <span className="text-[13px] font-medium">{error}</span>
                    </div>
                    <button
                        onClick={() => initData()}
                        className="text-[11px] font-bold uppercase tracking-widest hover:underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Themes Table */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap compact-table">
                        <thead>
                            <tr className="bg-pace-bg-subtle border-b border-pace-border text-admin-dim font-bold uppercase tracking-widest text-[8px]">
                                <th className="px-4 py-2 w-16 text-center text-gray-400">Preview</th>
                                <th className="px-4 py-2">Theme Details</th>
                                <th className="px-4 py-2">Category</th>
                                <th className="px-4 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {themes.map((theme, index) => {
                                const isLast = themes.length === index + 1;

                                // Determine active status across all routers
                                const activeInstances = activeThemes.filter(at => parseInt(at.theme_id) === parseInt(theme.id));
                                const isCurrent = activeInstances.length > 0;
                                const activeCount = activeInstances.length;

                                return (
                                    <tr
                                        key={theme.id}
                                        ref={isLast ? lastThemeElementRef : null}
                                        className="hover:bg-pace-bg-subtle transition-colors group"
                                    >
                                        <td className="px-4 py-2">
                                            <div
                                                className="w-12 h-8 bg-pace-bg-subtle rounded overflow-hidden cursor-pointer hover:ring-2 ring-pace-purple transition-all mx-auto shadow-sm"
                                                onClick={() => { setSelectedTheme(theme); setIsPreviewOpen(true); }}
                                            >
                                                {theme.preview_url ? (
                                                    <img src={theme.preview_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <ImageIcon size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-admin-value text-[11px]">{theme.theme_name}</span>
                                                    {isCurrent && (
                                                        <Badge variant="success" className="text-[7px] py-0 px-1 font-black uppercase tracking-widest">
                                                            Active {activeCount > 1 ? `(${activeCount})` : ''}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-gray-400 truncate max-w-[200px] leading-tight font-medium">ID: {theme.id} • {theme.theme_description || "Modern responsive landing page design."}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <Badge variant="outline" className="text-[8px] font-bold tracking-widest uppercase border-pace-border px-1.5 py-0">
                                                {theme.theme_category}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedTheme(theme); setIsPreviewOpen(true); }}
                                                    className="p-1 text-admin-dim hover:text-pace-purple hover:bg-pace-bg-subtle rounded transition-all border border-transparent hover:border-pace-border font-bold text-[9px] uppercase tracking-tighter"
                                                    title="Quick Preview"
                                                >
                                                    <Smartphone size={12} /> Preview
                                                </button>
                                                <button
                                                    onClick={() => handleOpenActivate(theme)}
                                                    className="px-3 py-1 bg-pace-purple text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-[#3d1a75] transition-all"
                                                >
                                                    Activate
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {!isLoading && !isInitialLoading && themes.length === 0 && !error && (
                    <div className="p-20 text-center space-y-4 opacity-50">
                        <Layout size={48} className="text-admin-dim mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-admin-value font-bold">No themes found</h3>
                            <p className="text-admin-dim text-sm">Our library is being updated. Check back later.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Infinite Scroll Status */}
            {!isLoading && !isInitialLoading && themes.length > 0 && pagination.has_more && (
                <div className="flex justify-center py-10">
                    <Loader2 size={24} className="text-pace-purple animate-spin opacity-50" />
                </div>
            )}

            {/* End Message */}
            {!isLoading && !isInitialLoading && themes.length > 0 && !pagination.has_more && (
                <div className="py-20 text-center">
                    <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em]">Library Completed</p>
                </div>
            )}

            {/* Activation Modal */}
            <Modal
                isOpen={isActivateModalOpen}
                onClose={() => setIsActivateModalOpen(false)}
                title="Activate Design"
                maxWidth="max-w-md"
                footer={
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setIsActivateModalOpen(false)}
                            className="flex-1 py-3 border border-pace-border text-admin-dim rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-pace-bg-subtle transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleActivate}
                            disabled={isActivating || !activationData.routerId}
                            className="flex-1 py-3 bg-pace-purple text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#3d1a75] transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {isActivating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Activate Now
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 pt-2">
                    {selectedTheme && (
                        <div className="bg-pace-bg-subtle p-5 rounded-2xl border border-pace-border flex items-center gap-4">
                            <div className="w-16 h-12 bg-card-bg rounded-lg overflow-hidden shrink-0 border border-pace-border">
                                <img src={selectedTheme.preview_url} alt="Theme" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-admin-value">{selectedTheme.theme_name}</h4>
                                <span className="text-[10px] text-admin-dim uppercase font-black tracking-tight">{selectedTheme.theme_category} portal</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 border-l-2 border-pace-purple pl-2 uppercase tracking-widest">Target Router</label>
                        <select
                            value={activationData.routerId}
                            onChange={(e) => setActivationData({ ...activationData, routerId: e.target.value })}
                            className="w-full px-4 py-3 bg-card-bg border border-pace-border rounded-xl text-[13px] font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
                        >
                            <option value="">Choose a router...</option>
                            {routers.map(router => (
                                <option key={router.id} value={router.id}>
                                    {router.router_name} ({router.ip_address})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20 space-y-3">
                        <div className="flex items-center gap-2 text-amber-500 font-black text-[11px] uppercase tracking-widest">
                            <AlertTriangle size={16} /> Attention
                        </div>
                        <p className="text-[12px] text-amber-200/60 leading-relaxed font-medium">
                            Make sure the router is <span className="font-bold underline">online</span>.
                            Sync will update files for the specific selected router.
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Preview Modal */}
            <Modal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="Portal Mockup"
                maxWidth="max-w-[280px]"
            >
                {selectedTheme && (
                    <div className="flex flex-col items-center pt-2">
                        <div className="relative w-[220px] h-[440px] bg-black rounded-[40px] border-[6px] border-pace-border shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-pace-border rounded-b-xl z-30"></div>
                            <div className="w-full h-full bg-card-bg">
                                <img src={selectedTheme.preview_url} className="w-full h-full object-cover" alt="Mockup" />
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
                                    <div className="w-full h-8 bg-white/20 backdrop-blur-xl rounded-lg border border-white/20 mb-2"></div>
                                    <div className="w-3/4 h-2 bg-white/30 rounded-full mx-auto"></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 text-center">
                            <h3 className="text-xs font-bold text-gray-900">{selectedTheme.theme_name}</h3>
                            <button
                                onClick={() => { setIsPreviewOpen(false); handleOpenActivate(selectedTheme); }}
                                className="mt-3 px-5 py-2 bg-pace-purple text-white rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg"
                            >
                                Activate This Theme
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

