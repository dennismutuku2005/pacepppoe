"use client"

import React, { useState, useEffect } from 'react'
import { Search, Fingerprint, Phone, UserX, AlertCircle, Unlock, Ban, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { Skeleton, TableRowSkeleton } from '@/components/Skeleton'
import { blockStkService } from '@/services/blockStk'
import { customerService } from '@/services/customers'

export default function BlockStkPage() {
    const [mobile, setMobile] = useState('')
    const [searchResult, setSearchResult] = useState(null)
    const [isSearching, setIsSearching] = useState(false)
    const [blockReason, setBlockReason] = useState('')

    // Modal & Action States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false)
    const [selectedBlockedUser, setSelectedBlockedUser] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Notification Modal
    const [notification, setNotification] = useState({ show: false, type: 'success', title: '', message: '' })

    // Real data from API
    const [blockedNumbers, setBlockedNumbers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const showNotification = (type, title, message) => {
        setNotification({ show: true, type, title, message })
        setTimeout(() => setNotification({ show: false, type: 'success', title: '', message: '' }), 3000)
    }

    // Load blocked numbers on mount
    useEffect(() => {
        loadBlockedNumbers()
    }, [])

    const loadBlockedNumbers = async () => {
        setIsLoading(true)
        try {
            const response = await blockStkService.getBlockedNumbers({ limit: 100 })
            if (response?.status === 'success') {
                setBlockedNumbers(response.data || [])
            }
        } catch (error) {
            console.error("Failed to load blocked numbers", error)
            showNotification('error', 'Error', 'Failed to load blocked numbers')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!mobile) return
        setIsSearching(true)
        try {
            // Check if already blocked
            const blockCheck = await blockStkService.getBlockedNumbers({ phone: mobile })
            if (blockCheck.is_blocked) {
                showNotification('info', 'Already Blocked', 'This number is already in the block list.')
                setIsSearching(false)
                return
            }

            // Search for customer
            const response = await customerService.getCustomers({ search: mobile, limit: 1 })
            if (response?.status === 'success' && response.data?.length > 0) {
                const customer = response.data[0]
                setSearchResult({
                    name: `Customer ${customer.phone}`,
                    mobile: customer.phone,
                    status: customer.status,
                    lastTransaction: `KES ${customer.totalSpent}`,
                    macAddress: customer.mac
                })
                setIsModalOpen(true)
            } else {
                // Customer not found, but allow blocking anyway
                setSearchResult({
                    name: 'Unknown Customer',
                    mobile: mobile,
                    status: 'Not Found',
                    lastTransaction: 'N/A',
                    macAddress: 'N/A'
                })
                setIsModalOpen(true)
            }
        } catch (error) {
            console.error("Search failed:", error)
            showNotification('error', 'Error', 'Failed to search for customer')
        } finally {
            setIsSearching(false)
        }
    }

    const handleBlock = async () => {
        if (!searchResult) return
        setIsProcessing(true)
        try {
            await blockStkService.blockNumber(searchResult.mobile, blockReason || 'Manual Block')
            showNotification('success', 'Blocked!', `${searchResult.mobile} has been blocked successfully.`)

            // Reload blocked list
            await loadBlockedNumbers()

            // Reset form
            setIsModalOpen(false)
            setMobile('')
            setSearchResult(null)
            setBlockReason('')
        } catch (error) {
            console.error("Block failed:", error)
            showNotification('error', 'Error', error.message || 'Failed to block number')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleUnblockClick = (user) => {
        setSelectedBlockedUser(user)
        setIsUnblockModalOpen(true)
    }

    const confirmUnblock = async () => {
        if (!selectedBlockedUser) return
        setIsProcessing(true)
        try {
            await blockStkService.unblockNumber(selectedBlockedUser.phone)
            showNotification('success', 'Unblocked!', `${selectedBlockedUser.phone} has been unblocked.`)

            // Reload blocked list
            await loadBlockedNumbers()

            setIsUnblockModalOpen(false)
            setSelectedBlockedUser(null)
        } catch (error) {
            console.error("Unblock failed:", error)
            showNotification('error', 'Error', error.message || 'Failed to unblock number')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 font-figtree animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-pace-border pb-4">
                <div>
                    <h1 className="text-xl font-bold text-admin-value leading-tight">STK Security Control</h1>
                    <p className="text-sm text-admin-dim mt-1">Manage and restrict customers from initiating STK push payments.</p>
                </div>
            </div>

            {/* Search Section - Stacked on top */}
            <div className="bg-card-bg border border-pace-border rounded-xl p-6">
                <div className="max-w-3xl">
                    <h3 className="text-base font-bold text-admin-value mb-4 flex items-center gap-2">
                        <Fingerprint size={18} className="text-red-500" />
                        Block New Number
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-semibold text-admin-label mb-1.5 block">Customer Mobile Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="e.g. 0712345678"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-pace-border bg-pace-bg-subtle focus:ring-1 focus:ring-pace-purple focus:border-pace-purple outline-none text-sm text-admin-value placeholder:text-admin-dim/50 transition-all"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isSearching || !mobile}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                        >
                            {isSearching ? (
                                <span className="animate-pulse">Searching...</span>
                            ) : (
                                <>
                                    <Search size={16} />
                                    Find Customer
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Blocked List Table - Stacked below */}
            <div className="bg-card-bg border border-pace-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-pace-border flex justify-between items-center">
                    <h3 className="text-base font-bold text-admin-value">Blocked Numbers</h3>
                    <Badge variant="error" className="text-xs">{blockedNumbers.length} Blocked</Badge>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead className="bg-pace-bg-subtle border-b border-pace-border">
                            <tr className="text-gray-500">
                                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[9px]">Mobile Number</th>
                                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[9px]">Block Reason</th>
                                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[9px]">Trials</th>
                                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[9px]">Last Attempt</th>
                                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[9px]">Date Blocked</th>
                                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[9px] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={6} rows={8} />
                            ) : blockedNumbers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center text-gray-400">
                                        <Fingerprint size={32} className="mx-auto mb-3 opacity-20" />
                                        <p className="font-medium text-xs uppercase tracking-wider">No blocked numbers found</p>
                                    </td>
                                </tr>
                            ) : (
                                blockedNumbers.map((user) => (
                                    <tr key={user.id} className="hover:bg-pace-bg-subtle transition-colors group">
                                        <td className="px-4 py-3">
                                            <span className="font-mono font-bold text-admin-value">{user.phone}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-normal text-[9px]">
                                                {user.reason?.replace(/_/g, ' ') || 'No reason'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "font-bold text-[10px]",
                                                user.trial_count > 0 ? "text-red-500" : "text-gray-400"
                                            )}>
                                                {user.trial_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-[10px] font-medium uppercase">
                                            {user.last_trial ? new Date(user.last_trial).toLocaleString() : '---'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-[10px] font-bold uppercase tracking-wide">
                                            {new Date(user.blocked_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleUnblockClick(user)}
                                                className="px-3 py-1.5 bg-card-bg border border-pace-border text-admin-label rounded-lg text-xs font-medium hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/20 transition-all flex items-center gap-1.5 ml-auto"
                                            >
                                                <Unlock size={14} />
                                                Unblock
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}

                        </tbody>
                    </table>
                </div>
            </div>

            {/* Block Confirmation Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => !isProcessing && setIsModalOpen(false)}
                title="Confirm STK Block"
                maxWidth="max-w-lg"
                footer={
                    <>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            disabled={isProcessing}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBlock}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Ban size={16} />}
                            {isProcessing ? 'Processing...' : 'Confirm Block'}
                        </button>
                    </>
                }
            >
                {searchResult && (
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 bg-pace-bg-subtle rounded-xl border border-pace-border">
                            <div className="w-12 h-12 rounded-full bg-card-bg border border-pace-border flex items-center justify-center text-admin-dim shrink-0">
                                <UserX size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-admin-value">{searchResult.name}</h4>
                                <p className="text-sm text-admin-dim font-medium">{searchResult.mobile}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={searchResult.status === 'Active' ? 'success' : 'default'} className="text-[10px] px-2 py-0.5">{searchResult.status}</Badge>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-admin-dim/60 font-mono">{searchResult.macAddress}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20 flex gap-3">
                            <AlertTriangle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-orange-400">Warning: Action is immediate</p>
                                <p className="text-xs text-orange-200/70 leading-relaxed font-medium">
                                    Blocking this number will prevent all future M-Pesa push requests. This should only be done for flagged fraudulent numbers or excessive failed attempts.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-700 ml-1">Reason for blocking (Optional)</label>
                            <textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                className="w-full p-3 rounded-lg border border-pace-border bg-pace-bg-subtle text-sm text-admin-value focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none min-h-[80px]"
                                placeholder="e.g. Excessive failed transactions..."
                            ></textarea>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Unblock Confirmation Modal */}
            <Modal
                isOpen={isUnblockModalOpen}
                onClose={() => !isProcessing && setIsUnblockModalOpen(false)}
                title="Confirm Unblock Number"
                maxWidth="max-w-lg"
                footer={
                    <>
                        <button
                            onClick={() => setIsUnblockModalOpen(false)}
                            disabled={isProcessing}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmUnblock}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Unlock size={16} />}
                            {isProcessing ? 'Processing...' : 'Unblock Access'}
                        </button>
                    </>
                }
            >
                {selectedBlockedUser && (
                    <div className="space-y-6">
                        <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 flex gap-3">
                            <Fingerprint size={24} className="text-green-500 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-green-500">Restore M-Pesa Access?</p>
                                <p className="text-xs text-green-200/70 mt-1 leading-relaxed font-medium">
                                    You are about to unblock <span className="font-bold">{selectedBlockedUser.phone}</span>.
                                    They will immediately be able to initiate STK push requests again.
                                </p>
                            </div>
                        </div>

                        <div className="bg-pace-bg-subtle rounded-lg p-4 text-xs text-admin-dim border border-pace-border">
                            <strong>Original Block Reason:</strong><br />
                            {selectedBlockedUser.reason || 'No reason provided'}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Custom Notification Modal */}
            {notification.show && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className={cn(
                        "flex items-start gap-3 p-4 rounded-xl shadow-lg border min-w-[320px] max-w-md",
                        notification.type === 'success' && "bg-green-500/10 border-green-500/20",
                        notification.type === 'error' && "bg-red-500/10 border-red-500/20",
                        notification.type === 'info' && "bg-blue-500/10 border-blue-500/20"
                    )}>
                        {notification.type === 'success' && <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />}
                        {notification.type === 'error' && <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />}
                        {notification.type === 'info' && <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />}
                        <div className="flex-1">
                            <h4 className={cn(
                                "font-bold text-sm",
                                notification.type === 'success' && "text-green-500",
                                notification.type === 'error' && "text-red-500",
                                notification.type === 'info' && "text-blue-500"
                            )}>{notification.title}</h4>
                            <p className={cn(
                                "text-xs mt-0.5",
                                notification.type === 'success' && "text-green-500",
                                notification.type === 'error' && "text-red-500",
                                notification.type === 'info' && "text-blue-500"
                            )}>{notification.message}</p>
                        </div>
                        <button
                            onClick={() => setNotification({ ...notification, show: false })}
                            className={cn(
                                "text-gray-400 hover:text-gray-600 transition-colors",
                                notification.type === 'success' && "hover:text-green-600",
                                notification.type === 'error' && "hover:text-red-600",
                                notification.type === 'info' && "hover:text-blue-600"
                            )}
                        >
                            <XCircle size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
