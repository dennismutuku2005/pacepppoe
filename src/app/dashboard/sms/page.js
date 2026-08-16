"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Smartphone, Search, Send, Settings, CheckCircle2, XCircle, Clock, Database, MessageSquare, Info, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { TablePageSkeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'

// ── Mock data fallback ─────────────────────────────────────────────────────────
const MOCK_LOGS = [
    { id: 1, recipient: '254711222333', message: 'Your 5Mbps Home subscription is active. Exp: 2026-06-06. Enjoy!', date: '2026-05-06 08:31', provider: 'Advanta', status: 'Delivered' },
    { id: 2, recipient: '254722333444', message: 'Reminder: Your subscription expires in 2 days. Pay KES 2500 to 522533.', date: '2026-05-06 07:00', provider: 'AfricasTalking', status: 'Delivered' },
    { id: 3, recipient: '254733444555', message: 'Alert: Node West-Station is currently offline. We are investigating.', date: '2026-05-05 22:15', provider: 'Advanta', status: 'Sent' },
    { id: 4, recipient: '254744555666', message: 'M-Pesa payment of KES 5000 received. Account: MikeC. Receipt: RM9Q3N7B.', date: '2026-05-05 14:21', provider: 'AfricasTalking', status: 'Delivered' },
]

const MOCK_PROVIDERS = [
    { id: 1, name: 'Advanta', api_key: 'adv-xxxx-xxxx', balance: 'KES 5,400', credits: 5400, status: 'Connected' },
    { id: 2, name: 'AfricasTalking', api_key: 'at-xxxx-xxxx', balance: 'KES 1,200', credits: 1200, status: 'Connected' },
    { id: 3, name: 'Sema', api_key: '', balance: 'KES 0', credits: 0, status: 'Disconnected' },
]

// ── Status icon helper ─────────────────────────────────────────────────────────
function StatusIcon({ status }) {
    if (status === 'Delivered') return <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
    if (status === 'Sent') return <Clock size={13} className="text-amber-400 shrink-0" />
    return <XCircle size={13} className="text-red-400 shrink-0" />
}

// ── SMS Log Row ────────────────────────────────────────────────────────────────
function LogRow({ log, onClick }) {
    return (
        <tr
            onClick={() => onClick(log)}
            className="hover:bg-pace-bg-subtle/50 transition-colors duration-150 cursor-pointer group"
        >
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                    <Smartphone size={12} className="text-admin-dim shrink-0" />
                    <span className="text-xs font-semibold text-admin-value">+{log.recipient}</span>
                </div>
            </td>
            <td className="px-5 py-3.5 max-w-xs">
                <p className="text-xs text-admin-dim truncate">{log.message}</p>
            </td>
            <td className="px-5 py-3.5">
                <span className="text-xs text-admin-dim">{log.date}</span>
            </td>
            <td className="px-5 py-3.5">
                <span className="text-xs font-semibold text-admin-value">{log.provider}</span>
            </td>
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                    <StatusIcon status={log.status} />
                    <span className={`text-xs font-semibold ${
                        log.status === 'Delivered' ? 'text-emerald-500' :
                        log.status === 'Sent' ? 'text-amber-400' : 'text-red-400'
                    }`}>{log.status}</span>
                </div>
            </td>
            <td className="px-5 py-3.5">
                <ChevronRight size={14} className="text-admin-dim/40 group-hover:text-pace-purple transition-colors" />
            </td>
        </tr>
    )
}

// ── Main component ─────────────────────────────────────────────────────────────
function SMSContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [smsLogs, setSmsLogs] = useState([])
    const [providers, setProviders] = useState([])
    const [search, setSearch] = useState('')

    // Modal states
    const [isConfigOpen, setIsConfigOpen] = useState(false)
    const [currentProvider, setCurrentProvider] = useState(null)
    const [formData, setFormData] = useState({ name: '', api_key: '', balance: '', status: 'Connected' })
    const [isSendModalOpen, setIsSendModalOpen] = useState(false)
    const [selectedLog, setSelectedLog] = useState(null)
    const [newMessage, setNewMessage] = useState({ recipient: '', content: '' })
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setSmsLogs(mockDashboardData?.smsLogs?.length ? mockDashboardData.smsLogs : MOCK_LOGS)
            setProviders(mockDashboardData?.smsProviders?.length ? mockDashboardData.smsProviders : MOCK_PROVIDERS)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleConfigProvider = (p) => {
        setCurrentProvider(p)
        setFormData({ ...p })
        setIsConfigOpen(true)
    }

    const handleSaveConfig = (e) => {
        e.preventDefault()
        setProviders(prev => prev.map(p => p.id === currentProvider.id ? { ...p, ...formData } : p))
        toast.success('Gateway updated', { description: `${formData.name} configuration saved.` })
        setIsConfigOpen(false)
    }

    const handleSendMessage = (e) => {
        e.preventDefault()
        setIsSending(true)
        setTimeout(() => {
            const newLog = {
                id: Date.now(),
                recipient: newMessage.recipient.replace(/^\+/, ''),
                message: newMessage.content,
                date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                provider: providers.find(p => p.status === 'Connected')?.name || 'Advanta',
                status: 'Sent',
            }
            setSmsLogs(prev => [newLog, ...prev])
            toast.success('Message dispatched', { description: `SMS sent to +${newLog.recipient}` })
            setIsSending(false)
            setIsSendModalOpen(false)
            setNewMessage({ recipient: '', content: '' })
        }, 1500)
    }

    const filteredLogs = smsLogs.filter(log =>
        log.recipient?.includes(search) ||
        log.message?.toLowerCase().includes(search.toLowerCase()) ||
        log.provider?.toLowerCase().includes(search.toLowerCase())
    )

    // Aggregate stats
    const totalCredits = providers.reduce((sum, p) => sum + (p.credits || 0), 0)
    const deliveredCount = smsLogs.filter(l => l.status === 'Delivered').length
    const sentCount = smsLogs.filter(l => l.status === 'Sent').length

    if (isLoading) return <TablePageSkeleton />

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-5">
                <div>
                    <h1 className="text-xl font-bold text-admin-value">SMS Center</h1>
                    <p className="text-xs text-admin-dim mt-0.5">Manage automated notifications and carrier gateways</p>
                </div>
                <button
                    onClick={() => setIsSendModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-pace-purple text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-sm"
                >
                    <Send size={14} /> Dispatch Message
                </button>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Credits */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim">Available Credits</p>
                        <div className="w-7 h-7 rounded-lg bg-pace-purple/10 flex items-center justify-center">
                            <Database size={13} className="text-pace-purple" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-admin-value">{totalCredits.toLocaleString()}</p>
                    <p className="text-[11px] text-admin-dim">Across all gateways</p>
                </div>

                {/* This month */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim">Sent This Month</p>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <MessageSquare size={13} className="text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-admin-value">{smsLogs.length}</p>
                    <p className="text-[11px] text-admin-dim">Total dispatched</p>
                </div>

                {/* Delivered */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim">Delivered</p>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 size={13} className="text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">{deliveredCount}</p>
                    <p className="text-[11px] text-admin-dim">Confirmed delivery</p>
                </div>

                {/* Pending */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim">Pending</p>
                        <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center">
                            <Clock size={13} className="text-amber-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-amber-400">{sentCount}</p>
                    <p className="text-[11px] text-admin-dim">Awaiting confirmation</p>
                </div>
            </div>

            {/* ── Gateway Credit Pills ── */}
            <div className="flex flex-wrap gap-3">
                {providers.map(p => (
                    <div
                        key={p.id}
                        className="bg-card-bg border border-pace-border rounded-xl px-4 py-2.5 flex items-center gap-3"
                    >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.status === 'Connected' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        <span className="text-xs font-semibold text-admin-value">{p.name}</span>
                        <span className="text-xs text-admin-dim">{p.balance}</span>
                        <button
                            onClick={() => handleConfigProvider(p)}
                            className="text-admin-dim hover:text-pace-purple transition-colors"
                            title="Configure gateway"
                        >
                            <Settings size={13} />
                        </button>
                    </div>
                ))}
            </div>

            {/* ── Dispatch Log Table ── */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
                {/* Table header bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-pace-border">
                    <h2 className="text-xs font-semibold text-admin-value uppercase tracking-wider">Dispatch Log</h2>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim" size={13} />
                        <input
                            type="text"
                            placeholder="Search recipient, message, gateway…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs text-admin-value placeholder:text-admin-dim focus:outline-none focus:border-pace-purple transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/40 border-b border-pace-border text-[10px] font-semibold uppercase tracking-wider text-admin-dim">
                                <th className="px-5 py-3">Recipient</th>
                                <th className="px-5 py-3">Message</th>
                                <th className="px-5 py-3">Timestamp</th>
                                <th className="px-5 py-3">Gateway</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-xs text-admin-dim">
                                        No dispatch records found
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map(log => (
                                    <LogRow key={log.id} log={log} onClick={setSelectedLog} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length > 0 && (
                    <div className="px-5 py-3 border-t border-pace-border bg-pace-bg-subtle/30 text-[11px] text-admin-dim">
                        Showing {filteredLogs.length} of {smsLogs.length} records · click a row to view full message
                    </div>
                )}
            </div>

            {/* ── Log Detail Modal ── */}
            <Modal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title="Message Detail"
                description={selectedLog ? `Sent to +${selectedLog.recipient} via ${selectedLog.provider}` : ''}
                maxWidth="max-w-md"
            >
                {selectedLog && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-pace-bg-subtle border border-pace-border rounded-xl p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim mb-1">Recipient</p>
                                <p className="text-xs font-semibold text-admin-value">+{selectedLog.recipient}</p>
                            </div>
                            <div className="bg-pace-bg-subtle border border-pace-border rounded-xl p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim mb-1">Gateway</p>
                                <p className="text-xs font-semibold text-admin-value">{selectedLog.provider}</p>
                            </div>
                            <div className="bg-pace-bg-subtle border border-pace-border rounded-xl p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim mb-1">Timestamp</p>
                                <p className="text-xs font-semibold text-admin-value">{selectedLog.date}</p>
                            </div>
                            <div className="bg-pace-bg-subtle border border-pace-border rounded-xl p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim mb-1">Status</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <StatusIcon status={selectedLog.status} />
                                    <span className={`text-xs font-semibold ${
                                        selectedLog.status === 'Delivered' ? 'text-emerald-500' :
                                        selectedLog.status === 'Sent' ? 'text-amber-400' : 'text-red-400'
                                    }`}>{selectedLog.status}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-pace-bg-subtle border border-pace-border rounded-xl p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim mb-2">Message Content</p>
                            <p className="text-xs text-admin-value leading-relaxed">{selectedLog.message}</p>
                        </div>
                        <button
                            onClick={() => setSelectedLog(null)}
                            className="w-full py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all"
                        >
                            Close
                        </button>
                    </div>
                )}
            </Modal>

            {/* ── Gateway Config Modal ── */}
            <Modal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                title="Configure Gateway"
                description={`Update API credentials for ${currentProvider?.name}`}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSaveConfig} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim pl-1">API Key / Token</label>
                        <input
                            type="text" required
                            value={formData.api_key || ''}
                            onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                            placeholder="Enter provider API key"
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim pl-1">Connection Status</label>
                        <select
                            value={formData.status || 'Connected'}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                        >
                            <option>Connected</option>
                            <option>Disconnected</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsConfigOpen(false)}
                            className="flex-1 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-[2] py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all active:scale-95">
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Dispatch Modal ── */}
            <Modal
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                title="Dispatch Manual SMS"
                description="Send a message to a subscriber. Usage is billed to the active default gateway."
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSendMessage} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim pl-1">Recipient Number</label>
                        <input
                            type="text" required
                            value={newMessage.recipient}
                            onChange={e => setNewMessage({ ...newMessage, recipient: e.target.value })}
                            placeholder="e.g. 254712345678"
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between px-1">
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-admin-dim">Message</label>
                            <span className="text-[10px] text-admin-dim">{newMessage.content.length}/160</span>
                        </div>
                        <textarea
                            required rows={4}
                            value={newMessage.content}
                            onChange={e => setNewMessage({ ...newMessage, content: e.target.value })}
                            placeholder="Type your message here…"
                            className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs text-admin-value outline-none focus:border-pace-purple transition-all resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsSendModalOpen(false)}
                            className="flex-1 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSending}
                            className="flex-[2] py-2.5 bg-pace-purple text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60">
                            {isSending ? 'Sending…' : <><Send size={13} /> Send Message</>}
                        </button>
                    </div>
                </form>
            </Modal>

        </div>
    )
}

export default function SMSPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm">Loading SMS Center…</div>}>
            <SMSContent />
        </Suspense>
    )
}
