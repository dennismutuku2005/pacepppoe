"use client"

import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle, Clock, Search, Trash2, User, AlertCircle, Loader2, RefreshCw, Eye } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { systemService } from '@/services/system'
import { format } from 'date-fns'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, has_more: false })
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchNotifications(1)
    }, [])

    const fetchNotifications = async (page = 1) => {
        setLoading(page === 1)
        setRefreshing(page !== 1)
        try {
            const res = await systemService.getNotifications(page, 15)
            if (res.status === 'success') {
                setNotifications(res.data)
                setPagination(res.pagination)
            } else {
                setError(res.message)
            }
        } catch (err) {
            setError("Failed to load notifications")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleMarkAsRead = async (id = null) => {
        try {
            const res = await systemService.markNotificationAsRead(id)
            if (res.status === 'success') {
                if (id) {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
                } else {
                    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
                }
            }
        } catch (err) {
            console.error("Error marking as read:", err)
        }
    }

    const unreadCount = notifications.filter(n => n.is_read == 0).length

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-5">
                <div>
                    <h1 className="text-xl font-medium text-pace-purple flex items-center gap-2">
                        <Bell size={20} />
                        Notifications
                    </h1>
                    <p className="text-[11px] text-admin-dim mt-0.5 font-medium">
                        View and manage MikroTik connection errors and system alerts.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchNotifications(pagination.page)}
                        disabled={refreshing}
                        className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/5 rounded-xl transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => handleMarkAsRead()}
                        className="px-4 py-2 bg-pace-bg-subtle border border-pace-border text-admin-dim rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-card-bg hover:text-pace-purple transition-all"
                    >
                        Mark All as Read
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 text-xs">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Notifications Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle border-b border-pace-border text-admin-dim font-bold uppercase tracking-wider text-[10px]">
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">User MAC</th>
                                <th className="px-6 py-4">Error Details</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4 w-12"><Skeleton className="h-4 w-4 rounded-full" /></td>
                                        <td className="px-6 py-4 w-24"><Skeleton className="h-4 w-20 rounded-lg" /></td>
                                        <td className="px-6 py-4 w-40"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                                        <td className="px-6 py-4 w-32"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4 text-right w-24"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : notifications.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-gray-400">
                                        <Bell size={48} className="mx-auto mb-4 opacity-10" />
                                        <p className="font-medium text-xs uppercase tracking-widest">No notifications to show</p>
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((notif) => (
                                    <tr key={notif.id} className={`hover:bg-pace-bg-subtle/50 transition-colors group ${notif.is_read == 0 ? 'bg-pace-purple/[0.02]' : ''}`}>
                                        <td className="px-6 py-4">
                                            {notif.is_read == 0 ? (
                                                <div className="w-2 h-2 rounded-full bg-pace-purple animate-pulse" title="Unread" />
                                            ) : (
                                                <CheckCircle size={14} className="text-admin-dim opacity-40" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge 
                                                variant={
                                                    notif.type === 'normal_payment' ? 'success' :
                                                    notif.type === 'reconnection' ? 'info' :
                                                    notif.type === 'mac_reconnection' ? 'warning' :
                                                    notif.type === 'voucher_reconnection' ? 'info' : 'secondary'
                                                }
                                                className="text-[8px] uppercase tracking-tighter whitespcae-nowrap px-1.5"
                                            >
                                                {notif.type?.replace('_', ' ') || 'error'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-mono text-pace-purple font-medium">
                                                <User size={12} className="text-admin-dim" />
                                                {notif.user_mac}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                                                <span className="text-admin-value leading-relaxed font-medium">{notif.error_message}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-admin-dim">
                                            <div className="flex items-center gap-1.5 whitespace-nowrap font-medium">
                                                <Clock size={12} />
                                                {format(new Date(notif.created_at), 'MMM d, HH:mm')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {notif.is_read == 0 && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className="p-1.5 text-pace-purple hover:bg-pace-purple/10 rounded-lg transition-all"
                                                        title="Mark as read"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && notifications.length > 0 && (
                    <div className="px-6 py-4 border-t border-pace-border flex items-center justify-between bg-pace-bg-subtle/30">
                        <p className="text-[10px] text-admin-dim uppercase font-bold tracking-wider">
                            Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchNotifications(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border border-pace-border bg-card-bg rounded-xl text-[10px] font-bold uppercase tracking-wider text-admin-dim hover:text-pace-purple disabled:opacity-30 disabled:hover:text-admin-dim transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchNotifications(pagination.page + 1)}
                                disabled={!pagination.has_more}
                                className="px-4 py-2 border border-pace-border bg-card-bg rounded-xl text-[10px] font-bold uppercase tracking-wider text-admin-dim hover:text-pace-purple disabled:opacity-30 disabled:hover:text-admin-dim transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
