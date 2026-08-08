"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Wallet, Search, Download, Clock, User, Activity } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { TablePageSkeleton } from '@/components/Skeleton'
import { mockCustomers, mockPackages } from '@/services/mockData'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function AccountsContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [accounts, setAccounts] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            const enriched = mockCustomers.map((customer) => {
                const price = Number(customer.price || 0)
                const paid = Number(customer.amountPaid || 0)
                const balance = paid - price
                const overdue = balance < 0 ? Math.abs(balance) : 0
                const status = balance >= 0 ? 'current' : 'expired'
                const packageItem = mockPackages.find(p => p.limit === customer.plan || p.name === customer.plan)
                return {
                    ...customer,
                    price,
                    paid,
                    balance,
                    overdue,
                    status,
                    packageName: packageItem ? packageItem.name : customer.plan
                }
            })
            setAccounts(enriched)
            setIsLoading(false)
        }, 600)
        return () => clearTimeout(timer)
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
                    <p className="text-xs font-medium text-gray-400 mt-1">Wallet balance and package payment status for every subscriber</p>
                </div>
                <button 
                    onClick={() => toast.info('Account report requested', { description: 'Preparing subscriber wallet statements...' })}
                    className="flex items-center gap-2 px-5 py-2.5 bg-card-bg border border-pace-border text-admin-dim rounded-xl hover:text-pace-purple hover:border-pace-purple transition-all text-sm font-medium shadow-sm active:scale-95"
                >
                    <Download size={16} />
                    <span>Export Accounts</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 border border-pace-border rounded-xl bg-card-bg group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim tracking-wider mb-1 uppercase">Current Subscribers</p>
                    <h3 className="text-2xl font-bold text-admin-value tabular-nums">{accounts.filter(account => account.status === 'current').length}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-green-600 font-medium">
                        <Activity size={12} /> Paid in full or ahead
                    </div>
                </div>
                <div className="p-5 border border-pace-border rounded-xl bg-card-bg group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim tracking-wider mb-1 uppercase">Expired / Owing</p>
                    <h3 className="text-2xl font-bold text-admin-value tabular-nums">{accounts.filter(account => account.status === 'expired').length}</h3>
                    <p className="text-[11px] font-medium text-admin-dim mt-2">Needs payment to recover access</p>
                </div>
                <div className="p-5 border border-pace-border rounded-xl bg-card-bg group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim tracking-wider mb-1 uppercase">Total Due</p>
                    <h3 className="text-2xl font-bold text-pace-purple tabular-nums">KES {accounts.reduce((sum, account) => sum + account.overdue, 0).toLocaleString()}</h3>
                    <p className="text-[11px] font-medium text-admin-dim mt-2">Outstanding subscriber arrears</p>
                </div>
                <div className="p-5 border border-pace-border rounded-xl bg-card-bg group hover:border-pace-purple/20 transition-all shadow-sm">
                    <p className="text-[10px] font-bold text-admin-dim tracking-wider mb-1 uppercase">Collected Wallet Funds</p>
                    <h3 className="text-xl font-bold text-admin-value truncate">KES {accounts.reduce((sum, account) => sum + account.paid, 0).toLocaleString()}</h3>
                    <p className="text-[11px] font-medium text-admin-dim mt-2">Total subscriber wallet payments</p>
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
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Paid / Due</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider">Wallet Balance</th>
                                <th className="px-6 py-3 text-[10px] font-semibold text-admin-dim uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-admin-dim text-sm font-medium">No subscriber accounts match your search.</td>
                                </tr>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group">
                                        <td className="px-6 py-2">
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
                                        <td className="px-6 py-2">
                                            <span className="text-[11px] font-semibold text-pace-purple font-mono tracking-tight">{account.accountNumber}</span>
                                            <div className="text-[9px] text-admin-dim mt-1">{account.username}</div>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-admin-value text-[11px]">{account.packageName}</span>
                                                <span className="text-[9px] text-gray-400 font-medium">{account.plan}</span>
                                                <span className="text-[9px] text-admin-dim italic mt-0.5">Expiry: {account.nextPayment || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="text-[11px] font-semibold text-admin-value">KES {account.paid.toLocaleString()} / KES {account.price.toLocaleString()}</div>
                                            {account.status === 'expired' && (
                                                <div className="text-[9px] text-red-500 font-medium mt-1">Owes KES {account.overdue.toLocaleString()}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-2">
                                            <span className={cn(
                                                'text-xs font-bold tabular-nums',
                                                account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                                            )}>
                                                KES {account.balance.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 text-center">
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
