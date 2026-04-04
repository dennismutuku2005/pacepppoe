"use client"

import React, { useState, useEffect } from 'react'
import {
    Play,
    Pause,
    Trash2,
    Plus,
    Monitor,
    Cpu,
    Activity,
    Search,
    RefreshCw,
    Server,
    ChevronRight,
    Zap,
    CheckCircle2,
    Settings,
    ShieldCheck,
    Loader2,
    Info,
    ArrowUpRight,
    ArrowDown,
    X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Skeleton } from '@/components/Skeleton'
import { routerService } from '@/services/routers'
import { Modal } from '@/components/Modal'

const INITIAL_RUNNING_SCRIPTS = [
    { id: 'run1', name: 'Check Bandwidth', description: 'Monitors real-time bandwidth consumption per interface and logs spikes above 80% capacity.', lastRun: '2 mins ago', status: 'running', router: 'Core-Router-01', cpu: '1.2%', category: 'Monitoring' },
    { id: 'run2', name: 'Log Monitoring', description: 'Continuous log analysis for failed authentication attempts and brute force detection.', lastRun: 'Always', status: 'running', router: 'Edge-Router-Admin', cpu: '0.8%', category: 'Security' },
    { id: 'run3', name: 'User Auth Check', description: 'Verifies active sessions against the RADIUS database to ensure billing synchronization.', lastRun: '5 mins ago', status: 'idle', router: 'Core-Router-01', cpu: '0.0%', category: 'Auth' },
]

const AVAILABLE_SCRIPTS = [
    { id: 'avail1', name: 'Auto-Backup Config', description: 'Automatically backups configuration to cloud storage. Generates a .rsc and .backup file daily at 00:00.', category: 'Maintenance', longDescription: 'This script handles the full export of your Mikrotik configuration. It uses the export command to generate a script file and the backup save command for binary backups. The files are then encrypted and sent to the configured cloud storage endpoint via SFTP or FTP.' },
    { id: 'avail2', name: 'Clean Temporary Files', description: 'Removes unused files and cache from the system storage. Clears old log rotations and temp exported files.', category: 'Optimization', longDescription: 'Performs a system-wide cleanup. It targeted files in the /flash and /disk1 directories that match temporary patterns or are older than 30 days. This helps prevent disk-full errors which can crash the RouterOS management interface.' },
    { id: 'avail3', name: 'Reset IP Pool', description: 'Resets the DHCP IP pool to clear expired leases and resolve conflicts.', category: 'Network', longDescription: 'Forces the DHCP server to release all current dynamic leases. Useful during network maintenance or when CIDR changes are applied. Warning: This will cause a brief reconnection flicker for clients as they request new IP addresses.' },
    { id: 'avail4', name: 'Upgrade RouterOS', description: 'Checks for and applies the latest stable RouterOS version and firmware updates.', category: 'Update', longDescription: 'Connects to the Mikrotik update server, downloads the latest NPK files for your architecture, and schedules a reboot for installation. It also automatically updates the bios/firmware version to match the new software branch.' },
    { id: 'avail5', name: 'Flush DNS Resolver', description: 'Clears the DNS cache to resolve hostname issues and update upstream records.', category: 'Network', longDescription: 'Executes /ip dns cache flush. This is essential when internal server IPs have changed or when upstream DNS providers have updated their records, ensuring the router doesn\'t serve stale IP mappings to local clients.' },
]

export default function ScriptsPage() {
    const [runningScripts, setRunningScripts] = useState(INITIAL_RUNNING_SCRIPTS)
    const [availableScripts, setAvailableScripts] = useState(AVAILABLE_SCRIPTS)
    const [routers, setRouters] = useState([])
    const [selectedRouterId, setSelectedRouterId] = useState('')
    const [isApplying, setIsApplying] = useState(null)
    const [loading, setLoading] = useState(true)
    const [routersLoading, setRoutersLoading] = useState(true)
    const [detailScript, setDetailScript] = useState(null) // Script for the modal
    const [showRouterModal, setShowRouterModal] = useState(null) // Script for the router selection modal
    const [deleteTarget, setDeleteTarget] = useState(null) // Target script for deletion confirmation

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800)
        fetchRouters()
        return () => clearTimeout(timer)
    }, [])

    const fetchRouters = async () => {
        try {
            const res = await routerService.getRouters({ limit: 100 })
            if (res.status === 'success') {
                setRouters(res.data || [])
            }
        } catch (err) {
            console.error("Failed to load routers", err)
        } finally {
            setRoutersLoading(false)
        }
    }

    const handleApplyScript = (script, routerId) => {
        if (!routerId) {
            setShowRouterModal(script)
            return
        }

        setIsApplying(script.id)
        setShowRouterModal(null)

        // Simulate API call
        setTimeout(() => {
            const targetRouter = routers.find(r => r.id === routerId)
            const newRunningScript = {
                ...script,
                id: `run-${Date.now()}`,
                lastRun: 'Just now',
                status: 'running',
                router: targetRouter?.router_name || 'Manual-Node',
                cpu: '0.1%'
            }

            setRunningScripts([newRunningScript, ...runningScripts])
            setAvailableScripts(prev => prev.filter(s => s.id !== script.id))
            setIsApplying(null)
            toast.success(`${script.name} activated on ${newRunningScript.router}`)
        }, 1200)
    }

    const handleDeleteRunning = (id) => {
        const scriptToRemove = runningScripts.find(s => s.id === id)
        if (scriptToRemove) {
            // Check if this script exists as a template in our master library
            const template = AVAILABLE_SCRIPTS.find(s => s.name === scriptToRemove.name)
            if (template) {
                setAvailableScripts(prev => {
                    // Only add back if not already there (prevents duplicates)
                    if (!prev.find(s => s.id === template.id)) {
                        return [...prev, template].sort((a, b) => a.id.localeCompare(b.id))
                    }
                    return prev
                })
            }
        }
        setRunningScripts(prev => prev.filter(s => s.id !== id))
        toast.info('Script terminated and returned to library')
    }

    if (loading) {
        return (
            <div className="space-y-10 font-figtree pb-10">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-48 rounded" />
                    <Skeleton className="h-4 w-64 rounded" />
                </div>
                <div className="space-y-12 mt-8">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-[300px] rounded-2xl" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-[300px] rounded-2xl" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-10 font-figtree pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-pace-border pb-8">
                <div>
                    <h1 className="text-xl font-semibold text-pace-purple leading-tight tracking-tight uppercase">Script Orchestration</h1>
                    <p className="text-[10px] text-admin-dim mt-1 font-medium uppercase tracking-widest max-w-lg">
                        Manage automated RouterOS processes. Activate scripts from your library to specific network nodes.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Router selector removed from header */}
                </div>
            </div>

            {/* Table 1: Active Scripts */}
            <div className="space-y-5">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[13px] font-semibold text-admin-value uppercase tracking-widest">Active Processes</h2>
                    </div>
                    <p className="text-[9px] font-medium text-admin-dim uppercase tracking-widest">{runningScripts.length} SCRIPTS EXECUTING</p>
                </div>

                <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b-4 border-b-pace-purple">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left whitespace-nowrap text-[11px]">
                            <thead className="bg-pace-bg-subtle/50 border-b border-pace-border font-semibold text-admin-dim uppercase tracking-widest text-[9px]">
                                <tr>
                                    <th className="px-6 py-4">Process Identity</th>
                                    <th className="px-6 py-4">Assigned Node</th>
                                    <th className="px-6 py-4">Runtime Info</th>
                                    <th className="px-6 py-4">System Impact</th>
                                    <th className="px-6 py-4">Process Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pace-border">
                                {runningScripts.map((script) => (
                                    <tr key={script.id} className="hover:bg-pace-bg-subtle transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-admin-value uppercase tracking-tight text-[11px]">{script.name}</p>
                                                <p className="text-[8px] text-admin-dim font-medium uppercase tracking-tighter mt-0.5">{script.category}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Server size={12} className="text-pace-purple" />
                                                <span className="text-admin-label font-semibold uppercase text-[10px] tracking-tighter">{script.router}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-admin-dim font-medium uppercase text-[9px] tracking-widest text-gray-400">
                                            {script.lastRun}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between w-24">
                                                    <span className="text-[9px] font-semibold text-admin-value uppercase tracking-tighter">CPU</span>
                                                    <span className="text-[9px] font-semibold text-pace-purple">{script.cpu}</span>
                                                </div>
                                                <div className="w-24 h-1.5 bg-pace-border rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-pace-purple transition-all duration-1000"
                                                        style={{ width: script.status === 'running' ? (parseInt(script.cpu) || 5) + '%' : '0%' }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {script.status === 'running' ? (
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[8px] font-semibold uppercase tracking-[0.1em] border border-emerald-500/10">
                                                    Running
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pace-bg-subtle text-admin-dim text-[8px] font-semibold uppercase tracking-[0.1em] border border-pace-border">
                                                    <Pause size={10} />
                                                    Idle
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setDetailScript(script)}
                                                    className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Info size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(script)}
                                                    className="p-2 text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                                    title="Terminate Script"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {runningScripts.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-pace-bg-subtle rounded-3xl flex items-center justify-center border border-dashed border-pace-border opacity-50">
                                                    <Zap size={32} className="text-admin-dim" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[13px] font-semibold text-admin-value uppercase tracking-widest">No Active Scripts</p>
                                                    <p className="text-[10px] text-admin-dim font-medium uppercase tracking-tighter">Your system nodes are currently in manual operation mode.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Table 2: Available Scripts */}
            <div className="space-y-5 pt-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[13px] font-semibold text-admin-value uppercase tracking-widest">Available Library</h2>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search Library..."
                            className="pl-10 pr-6 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-[10px] font-medium uppercase focus:outline-none focus:border-pace-purple transition-all w-64 placeholder:text-admin-dim/50 text-admin-value"
                        />
                    </div>
                </div>

                <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left whitespace-nowrap text-[11px]">
                            <thead className="bg-pace-bg-subtle/50 border-b border-pace-border font-semibold text-admin-dim uppercase tracking-widest text-[9px]">
                                <tr>
                                    <th className="px-6 py-4">Process name</th>
                                    <th className="px-6 py-4">Overview</th>
                                    <th className="px-6 py-4">Trust</th>
                                    <th className="px-6 py-4">Node</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pace-border">
                                {availableScripts.map((script) => {
                                    const applying = isApplying === script.id;
                                    return (
                                        <tr key={script.id} className="hover:bg-pace-bg-subtle/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-admin-value uppercase tracking-tight text-[10px]">{script.name}</p>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="text-[10px] text-admin-dim font-medium uppercase tracking-tighter truncate opacity-80 group-hover:opacity-100 transition-opacity whitespace-normal line-clamp-1">{script.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/5 px-2.5 py-1 rounded-xl border border-emerald-500/10 w-fit text-[8px] font-semibold uppercase tracking-widest">
                                                    <ShieldCheck size={12} />
                                                    Verified
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] text-admin-dim font-medium uppercase tracking-widest italic opacity-50">Not Deployed</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => setDetailScript(script)}
                                                        className="text-[8px] font-semibold uppercase tracking-[0.1em] text-admin-dim hover:text-pace-purple transition-colors"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleApplyScript(script)}
                                                        disabled={applying}
                                                        className={cn(
                                                            "flex items-center justify-center w-16 px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-[0.05em] transition-all",
                                                            applying
                                                                ? "bg-pace-purple text-white opacity-50 cursor-wait"
                                                                : "bg-pace-purple text-white hover:bg-[#3d1a75]"
                                                        )}
                                                    >
                                                        {applying ? <Loader2 size={10} className="animate-spin" /> : "Active"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {
                                    availableScripts.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center text-admin-dim font-medium uppercase tracking-widest text-[10px]">Library Catalog Fully Deployed</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Script Detail Modal */}
            <Modal
                isOpen={!!detailScript}
                onClose={() => setDetailScript(null)}
                title={detailScript?.name?.toUpperCase()}
                description={detailScript?.category?.toUpperCase()}
                maxWidth="max-w-[500px]"
                footer={
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setDetailScript(null)}
                            className="flex-1 py-3 text-admin-dim font-semibold text-[11px] uppercase tracking-widest border border-pace-border rounded-xl hover:bg-pace-bg-subtle transition-all"
                        >
                            Dismiss
                        </button>
                        {!runningScripts.find(s => s.name === detailScript?.name) && (
                            <button
                                onClick={() => {
                                    handleApplyScript(detailScript);
                                    setDetailScript(null);
                                }}
                                className="flex-1 py-3 bg-pace-purple text-white font-semibold text-[11px] uppercase tracking-widest rounded-xl hover:bg-[#3d1a75] transition-all shadow-lg shadow-pace-purple/20 flex items-center justify-center"
                            >
                                Deploy Now
                            </button>
                        )}
                    </div>
                }
            >
                {detailScript && (
                    <div className="space-y-6 py-2">
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-black text-pace-purple uppercase tracking-[0.2em] border-l-4 border-pace-purple pl-3">Architecture Brief</h4>
                            <p className="text-[13px] text-admin-value font-bold leading-relaxed tracking-tighter uppercase">{detailScript.description}</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[11px] font-black text-pace-purple uppercase tracking-[0.2em] border-l-4 border-pace-purple pl-3">Technical Implementation</h4>
                            <div className="bg-pace-bg-subtle p-5 rounded-3xl border border-pace-border">
                                <p className="text-[12px] text-admin-dim font-bold leading-relaxed tracking-tighter uppercase whitespace-pre-wrap">
                                    {detailScript.longDescription || "This script executes within the RouterOS management environment using standard shell commands. It is optimized for minimal resource impact and designed to run as a background task. Detailed technical documentation is available in the main system manual."}
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </Modal>

            {/* Router Selection Modal */}
            <Modal
                isOpen={!!showRouterModal}
                onClose={() => setShowRouterModal(null)}
                title="Select Deployment Node"
                description={`Choose a router to execute ${showRouterModal?.name}`}
                maxWidth="max-w-[450px]"
            >
                <div className="space-y-4 py-2">
                    {routersLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {routers.map(router => (
                                <button
                                    key={router.id}
                                    onClick={() => handleApplyScript(showRouterModal, router.id)}
                                    className="flex items-center justify-between p-4 bg-pace-bg-subtle border border-pace-border rounded-xl hover:border-pace-purple hover:bg-pace-purple/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white rounded-lg border border-pace-border group-hover:border-pace-purple/20 transition-colors">
                                            <Server size={18} className="text-pace-purple" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-semibold text-admin-value uppercase tracking-tight">{router.router_name}</p>
                                            <p className="text-[10px] text-admin-dim font-medium uppercase tracking-widest">{router.ip_address}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-admin-dim group-hover:text-pace-purple transition-colors" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Deletion Confirmation Modal */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Terminate Process?"
                description="Are you sure you want to stop this script? This action cannot be undone."
                maxWidth="max-w-[400px]"
                footer={
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setDeleteTarget(null)}
                            className="flex-1 py-3 text-admin-dim font-semibold text-[11px] uppercase tracking-widest border border-pace-border rounded-xl hover:bg-pace-bg-subtle transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                handleDeleteRunning(deleteTarget.id);
                                setDeleteTarget(null);
                            }}
                            className="flex-1 py-3 bg-red-500 text-white font-semibold text-[11px] uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                        >
                            Confirm Stop
                        </button>
                    </div>
                }
            >
                <div className="py-2">
                    <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
                            <Trash2 className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-admin-value uppercase tracking-tight">{deleteTarget?.name}</p>
                            <p className="text-[10px] text-admin-dim font-medium uppercase tracking-widest">Active on {deleteTarget?.router}</p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

function Terminal({ size }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
    )
}
