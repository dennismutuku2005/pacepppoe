"use client"

import React, { useState, useEffect, Suspense } from 'react'

import { Settings, Save, Wifi, Link as LinkIcon, Smartphone, ShieldAlert, CheckCircle2, AlertCircle, Info, Lock, Unlock, ChevronDown, Network, Loader2 } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Skeleton } from '@/components/Skeleton'
import { plansService } from '@/services/plans'
import { routerService } from '@/services/routers'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'

function SystemConfigContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const routerIdParam = searchParams.get('router_id');

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLinksLocked, setIsLinksLocked] = useState(true);
    const [unlockStep, setUnlockStep] = useState(0); // 0: Locked, 1: First Confirmation, 2: Unlocked

    // Router State
    const [routers, setRouters] = useState([]);
    const [activeRouterId, setActiveRouterId] = useState(null);

    // Form states
    const [metadata, setMetadata] = useState({ wifiname: '', customercare: '' });
    const [links, setLinks] = useState({
        lnmoapi: '', lnmoapi2: '', lnmoapi3: '', lnmoapi4: '', lnmoapi5: '', router: ''
    });

    // Alert states
    const [alert, setAlert] = useState(null);

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
            const res = await plansService.getSystemConfig(activeRouterId);
            if (res.status === 'success') {
                const fetchedMetadata = res.metadata || {};
                setMetadata({
                    wifiname: fetchedMetadata.wifiname || '',
                    customercare: fetchedMetadata.customercare || ''
                });

                const fetchedLinks = res.links || {};
                setLinks({
                    lnmoapi: fetchedLinks.lnmoapi || '',
                    lnmoapi2: fetchedLinks.lnmoapi2 || '',
                    lnmoapi3: fetchedLinks.lnmoapi3 || '',
                    lnmoapi4: fetchedLinks.lnmoapi4 || '',
                    lnmoapi5: fetchedLinks.lnmoapi5 || '',
                    router: fetchedLinks.router || ''
                });
            }
        } catch (error) {
            console.error("Failed to load config", error);
            setAlert({ type: 'error', message: "Failed to load system configuration." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!activeRouterId) {
            setAlert({ type: 'error', message: "No active router selected." });
            return;
        }
        setIsSaving(true);
        try {
            const configData = {
                metadata: metadata,
                links: links
            };
            await plansService.saveSystemConfig(activeRouterId, configData);
            setAlert({ type: 'success', message: "System configuration updated successfully!" });
            setIsLinksLocked(true);
            setUnlockStep(0);

            // Auto hide success alert
            setTimeout(() => setAlert(null), 3000);
        } catch (error) {
            setAlert({ type: 'error', message: error.message || "Save failed." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUnlockNext = () => {
        if (unlockStep === 0) setUnlockStep(1);
        else if (unlockStep === 1) {
            setUnlockStep(2);
            setIsLinksLocked(false);
        }
    };

    const activeRouterName = routers.find(r => r.id === activeRouterId)?.router_name || 'Global Default';

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1200px] mx-auto pb-10 px-2">
            {/* Top Navigation & Router Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-bg p-4 rounded-2xl border border-pace-border overflow-visible">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pace-purple/10 rounded-xl flex items-center justify-center text-pace-purple">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-admin-value leading-tight">System Core Configuration</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Node:</span>
                            <span className="text-[11px] font-bold text-pace-purple uppercase">{activeRouterName}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={activeRouterId || ''}
                            onChange={(e) => handleRouterChange(e.target.value)}
                            className="appearance-none bg-pace-bg-subtle border border-pace-border text-admin-value text-[12px] font-bold rounded-xl px-4 py-2.5 pr-10 focus:ring-4 focus:ring-pace-purple/5 focus:border-pace-purple outline-none cursor-pointer transition-all min-w-[180px]"
                        >
                            {routers.map(router => (
                                <option key={router.id} value={router.id}>{router.router_name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="px-6 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-bold hover:bg-[#3d1a75] transition-all shadow-lg shadow-pace-purple/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                        save
                    </button>
                </div>
            </div>

            {alert && (
                <div className={cn(
                    "p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2",
                    alert.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                    {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-xs font-bold uppercase tracking-wide">{alert.message}</span>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-64 rounded-xl" />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Hotspot Identity & Metadata */}
                    <div className="lg:col-span-12">
                        <div className="bg-card-bg border border-pace-border rounded-2xl p-6 space-y-6">
                            <div className="flex items-center justify-between border-b border-pace-border pb-4">
                                <h2 className="text-xs font-bold text-admin-value uppercase tracking-widest flex items-center gap-2">
                                    <Wifi size={16} className="text-pace-purple" />
                                    Identity for {activeRouterName}
                                </h2>
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Live Config</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WiFi SSID (Network Name)</label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pace-purple transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={metadata.wifiname || ''}
                                            onChange={(e) => setMetadata({ ...metadata, wifiname: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-4 focus:ring-pace-purple/5 focus:border-pace-purple text-sm font-bold text-admin-value transition-all"
                                            placeholder="e.g. PACE_HOTSPOT"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400">This name appears on the customer login portal and receipts.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Support / Customer Care Number</label>
                                    <div className="relative group">
                                        <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pace-purple transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={metadata.customercare || ''}
                                            onChange={(e) => setMetadata({ ...metadata, customercare: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-4 focus:ring-pace-purple/5 focus:border-pace-purple text-sm font-bold text-admin-value transition-all"
                                            placeholder="e.g. 07XXXXXXXX"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400">Provided to customers for STK push / connectivity issues.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API Links & Credentials */}
                    <div className="lg:col-span-12">
                        <div className={cn(
                            "bg-card-bg border border-pace-border rounded-2xl p-6 space-y-6 overflow-hidden relative transition-all duration-500",
                            isLinksLocked && "blur-[2px]"
                        )}>
                            {/* Lock Overlay simplified to just a button and message */}
                            {isLinksLocked && (
                                <div className="absolute inset-0 z-20 bg-white/10 backdrop-blur-[2px] flex items-center justify-center p-6 cursor-pointer group" onClick={handleUnlockNext}>
                                    <div className="bg-pace-purple/90 text-white px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transform group-hover:scale-105 transition-all animate-in zoom-in-95">
                                        <Lock size={18} />
                                        <span className="text-xs font-bold uppercase tracking-widest">
                                            {unlockStep === 0 ? "Unlock System Links" : "Confirm Vulnerable Action"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between border-b border-pace-border pb-4">
                                <h2 className="text-xs font-bold text-admin-value uppercase tracking-widest flex items-center gap-2">
                                    <LinkIcon size={16} className="text-blue-500" />
                                    API Endpoints for {activeRouterName}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {!isLinksLocked && (
                                        <button
                                            onClick={() => { setIsLinksLocked(true); setUnlockStep(0); }}
                                            className="text-[10px] font-bold text-pace-purple uppercase flex items-center gap-1 hover:underline"
                                        >
                                            <Lock size={12} /> Lock Editor
                                        </button>
                                    )}
                                    <Badge variant="error" className="bg-red-500/10 text-red-500 border-red-500/20">Critical Access</Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Primary STK API */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">LNMO API (Primary)</label>
                                    <input
                                        type="text"
                                        disabled={isLinksLocked}
                                        value={links.lnmoapi}
                                        onChange={(e) => setLinks({ ...links, lnmoapi: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle outline-none focus:bg-card-bg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-mono font-bold text-admin-value transition-all disabled:opacity-70"
                                    />
                                </div>

                                {/* Secondary API 1 */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-opacity-50">LNMO API 2</label>
                                    <input
                                        type="text"
                                        disabled={isLinksLocked}
                                        value={links.lnmoapi2}
                                        onChange={(e) => setLinks({ ...links, lnmoapi2: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle/50 outline-none focus:bg-card-bg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-[10px] font-mono text-admin-value transition-all disabled:opacity-50"
                                    />
                                </div>

                                {/* Secondary API 2 */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-opacity-50">LNMO API 3</label>
                                    <input
                                        type="text"
                                        disabled={isLinksLocked}
                                        value={links.lnmoapi3}
                                        onChange={(e) => setLinks({ ...links, lnmoapi3: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle/50 outline-none focus:bg-card-bg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-[10px] font-mono text-admin-value transition-all disabled:opacity-50"
                                    />
                                </div>

                                {/* Router Identity */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-900 uppercase flex items-center gap-1">
                                        <NetworkPrimitive size={12} className="text-pace-purple" />
                                        Router Identity
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isLinksLocked}
                                        value={links.router}
                                        onChange={(e) => setLinks({ ...links, router: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-pace-border bg-pace-purple/5 outline-none focus:bg-card-bg focus:ring-4 focus:ring-pace-purple/5 focus:border-pace-purple text-sm font-bold text-pace-purple transition-all disabled:opacity-80"
                                        placeholder="e.g. pace"
                                    />
                                    <p className="text-[9px] text-gray-400 px-1 font-medium italic">Crucial for matching payment records to this specific gateway.</p>
                                </div>

                                {/* More APIs */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-opacity-50">LNMO API 4</label>
                                    <input
                                        type="text"
                                        disabled={isLinksLocked}
                                        value={links.lnmoapi4}
                                        onChange={(e) => setLinks({ ...links, lnmoapi4: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle/50 outline-none focus:bg-card-bg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-[10px] font-mono text-admin-value transition-all disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-opacity-50">LNMO API 5</label>
                                    <input
                                        type="text"
                                        disabled={isLinksLocked}
                                        value={links.lnmoapi5}
                                        onChange={(e) => setLinks({ ...links, lnmoapi5: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle/50 outline-none focus:bg-card-bg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-[10px] font-mono text-admin-value transition-all disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {!isLinksLocked && (
                                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 mt-6 flex items-start gap-3">
                                    <AlertCircle size={20} className="text-amber-500 shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-tight">Experimental Feature</h4>
                                        <p className="text-[10px] text-amber-200/60 leading-relaxed font-medium mt-0.5">
                                            Advanced LNMO multi-endpoint routing allows the portal to fallback to secondary STK gateways if the primary fails.
                                            Only modify these if provided by your system administrator.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation Modal */}
            <Modal
                isOpen={unlockStep === 2 && !isLinksLocked && isSaving}
                onClose={() => { }}
                title="Updating System Core..."
                maxWidth="max-w-xs"
            >
                <div className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-pace-purple border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Applying and Propagating Changes...</p>
                </div>
            </Modal>
        </div>
    );
}

export default function SystemConfigPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-pace-purple" />
            </div>
        }>
            <SystemConfigContent />
        </Suspense>
    );
}

const NetworkPrimitive = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="16" y="16" width="6" height="6" rx="1" />
        <rect x="2" y="16" width="6" height="6" rx="1" />
        <rect x="9" y="2" width="6" height="6" rx="1" />
        <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
        <path d="M12 12V8" />
    </svg>
);
