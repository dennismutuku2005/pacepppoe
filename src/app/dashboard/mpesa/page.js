"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Wallet, Search, Download, Clock, User, Activity, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { TablePageSkeleton } from '@/components/Skeleton'
import { financeService } from '@/services/isp/finance'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function AccountsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [accounts, setAccounts] = useState([])
    const [stats, setStats] = useState({
        current_subscribers: 0,
        expired_owing: 0,
        total_due: 0,
        collected_wallet: 0
    })
    const [search, setSearch] = useState('')

    const fetchAccounts = async () => {
        try {
            setIsLoading(true)
            const res = await financeService.getAccounts()
            if (res && res.status === 'success') {
                setAccounts(res.accounts || [])
                setStats(res.stats || {
                    current_subscribers: 0,
                    expired_owing: 0,
                    total_due: 0,
                    collected_wallet: 0
                })
            } else {
                toast.error('Failed to load accounts', { description: res?.message })
            }
        } catch (err) {
            console.error("Error loading accounts:", err)
            toast.error('Failed to connect to backend service')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    const filteredAccounts = accounts.filter(account => {
        const query = search.toLowerCase()
        return (
            account.name?.toLowerCase().includes(query) ||
            account.username?.toLowerCase().includes(query) ||
            account.phone?.includes(search) ||
            account.accountNumber?.includes(search) ||
            account.packageName?.toLowerCase().includes(query)
        )
    })

    if (isLoading) {
        return <TablePageSkeleton />
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 font-figtree">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-admin-value flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-pace-purple/10 flex items-center justify-center">
                            <Wallet size={18} className="text-pace-purple" />
                        </div>
                        Accounts
                    </h1>
                    <p className="text-xs font-medium text-gray-400 mt-1">Live wallet balances, arrears, and package billing status</p>
                </div>
                <button 
                    onClick={() => {
                        toast.success('Account statement exported', { description: 'Subscriber wallet records ready for download.' })
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-card-bg border border-pace-border text-admin-dim rounded-xl hover:text-pace-purple hover:border-pace-purple transition-all text-sm font-medium shadow-sm active:scale-95"
                >
                    <Download size={16} />
                    <span>Export Accounts</span>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 border border-pace-border rounded-xl bg-card-bg group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim tracking-wider mb-1 uppercase">Current Subscribers</p>
                    <h3 className="text-2xl font-bold text-admin-value tabular-nums">{stats.current_subscribers}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-green-600 font-medium">
                        <Activity size={12} /> Active and in good standing
                    </div>
                </div>
                <div className="p-5 border border-pace-border rounded-xl bg-card-bg group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim tracking-wider mb-1 uppercase">Expired / Owing</p>
                    <h3 className="text-2xl font-bold text-admin-value tabular-nums">{stats.expired_owing}</h3>
                    <p className="text-[11px] font-medium text-admin-dim mt-2">Suspended / pending payment</p>
                </div>
                <div className="p-5 border border-pace-border rounded-xl bg-card-bg group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim tracking-wider mb-1 uppercase">Total Due</p>
                    <h3 className="text-2xl font-bold text-rose-500 tabular-nums">KES {stats.total_due.toLocaleString()}</h3>
                    <p className="text-[11px] font-medium text-admin-dim mt-2">Outstanding subscriber arrears</p>
                </div>
                <div className="p-5 border border-pace-border rounded-xl bg-card-bg group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim tracking-wider mb-1 uppercase">Collected Wallet Funds</p>
                    <h3 className="text-xl font-bold text-admin-value truncate">KES {stats.collected_wallet.toLocaleString()}</h3>
                    <p className="text-[11px] font-medium text-admin-dim mt-2">Total positive subscriber balances</p>
                </div>
            </div>

            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Search subscriber, account or package..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                />
            </div>

            <div className="overflow-hidden bg-card-bg border border-pace-border rounded-xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border">
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Subscriber</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Account</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Package</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Balance / Unit Price</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Next Payment</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim text-sm font-medium">No subscriber accounts found.</td>
                                </tr>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-pace-bg-subtle border border-pace-border flex items-center justify-center text-admin-dim group-hover:text-pace-purple transition-colors">
                                                    <User size={13} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-admin-value">{account.name}</span>
                                                    <span className="text-[10px] text-admin-dim uppercase tracking-tighter">{account.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-[11px] font-semibold text-pace-purple font-mono tracking-tight">{account.accountNumber}</span>
                                            <div className="text-[9px] text-admin-dim mt-0.5">{account.username}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-admin-value text-[11px]">{account.packageName}</span>
                                                <span className="text-[9px] text-gray-400 font-medium">KES {account.price.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={cn(
                                                'text-xs font-bold tabular-nums',
                                                account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                                            )}>
                                                KES {account.balance.toLocaleString()}
                                            </span>
                                            {account.status === 'expired' && (
                                                <div className="text-[9px] text-red-500 font-medium mt-0.5">Owes KES {account.overdue.toLocaleString()}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-[11px] font-mono text-admin-dim">{account.nextPayment || '—'}</span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <Badge variant={account.status === 'current' ? 'success' : 'error'} className="text-[10px] font-medium border-none">
                                                {account.status === 'current' ? 'Current' : 'Expired'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default function AccountsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse text-sm font-medium">Syncing subscriber wallet accounts...</div>}>
            <AccountsContent />
        </Suspense>
    )
}
