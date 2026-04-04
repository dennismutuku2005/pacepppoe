"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { Search, Users, ShieldCheck, ShieldAlert, Edit2, Calendar, Package, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton, TableRowSkeleton } from '@/components/Skeleton'
import { mockCustomers, mockPackages } from '@/services/mockData'
import Swal from 'sweetalert2'

function CustomersContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [customers, setCustomers] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        // Simulate initial load
        const timer = setTimeout(() => {
            setCustomers(mockCustomers)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.username.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    )

    const handleToggleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled'
        Swal.fire({
            title: `Are you sure?`,
            text: `You want to ${newStatus} this customer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4B1D8F',
            cancelButtonColor: '#E11D48',
            confirmButtonText: `Yes, ${newStatus} it!`
        }).then((result) => {
            if (result.isConfirmed) {
                setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
                Swal.fire('Updated!', `Customer has been ${newStatus}.`, 'success')
            }
        })
    }

    const handleEditPackage = (id, currentPlan) => {
        Swal.fire({
            title: 'Change Package',
            input: 'select',
            inputOptions: mockPackages.reduce((acc, p) => ({ ...acc, [p.name]: p.name }), {}),
            inputValue: currentPlan,
            showCancelButton: true,
            confirmButtonColor: '#4B1D8F',
            confirmButtonText: 'Change'
        }).then((result) => {
            if (result.isConfirmed) {
                setCustomers(prev => prev.map(c => c.id === id ? { ...c, plan: result.value, price: mockPackages.find(p => p.name === result.value).price } : c))
                Swal.fire('Updated!', 'Package has been updated.', 'success')
            }
        })
    }

    const handleEditDate = (id, currentDate) => {
        Swal.fire({
            title: 'Edit Next Payment Date',
            input: 'date',
            inputValue: currentDate,
            showCancelButton: true,
            confirmButtonColor: '#4B1D8F'
        }).then((result) => {
            if (result.isConfirmed) {
                setCustomers(prev => prev.map(c => c.id === id ? { ...c, nextPayment: result.value } : c))
                Swal.fire('Updated!', 'Next payment date has been updated.', 'success')
            }
        })
    }

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-bold text-pace-purple uppercase tracking-tight flex items-center gap-3">
                        <Users size={24} />
                        PPPoE Subscribers
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase">Manage active and inactive client secrets</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-pace-purple/5 border border-pace-purple/10 rounded-xl text-center">
                        <p className="text-sm font-bold text-pace-purple leading-none">{customers.filter(c => c.status === 'enabled').length}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Active</p>
                    </div>
                    <div className="px-4 py-2 bg-red-500/5 border border-red-500/10 rounded-xl text-center">
                        <p className="text-sm font-bold text-red-500 leading-none">{customers.filter(c => c.status === 'disabled').length}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Disabled</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search by name, username or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-card-bg border border-pace-border rounded-2xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap text-[12px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle border-b border-pace-border font-bold text-admin-dim uppercase tracking-widest text-[9px]">
                                <th className="px-6 py-5">Subscriber Info</th>
                                <th className="px-6 py-5">PPPoE Credentials</th>
                                <th className="px-6 py-5">Package & Price</th>
                                <th className="px-6 py-5">Next Bill Date</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={6} rows={8} />
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-pace-bg-subtle rounded-full flex items-center justify-center text-gray-300">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No customers found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((c) => (
                                    <tr key={c.id} className="hover:bg-pace-bg-subtle/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-admin-value text-[13px] group-hover:text-pace-purple transition-colors">{c.name}</span>
                                                <span className="text-[10px] text-admin-dim font-medium mt-0.5">{c.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-blue-500/10 text-blue-600 border-none font-mono text-[9px] lowercase">{c.username}</Badge>
                                                </div>
                                                <span className="text-[9px] text-gray-300 font-mono italic">Secret: {c.secret}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-admin-value flex items-center gap-1.5">
                                                    <Package size={12} className="text-admin-dim" />
                                                    {c.plan}
                                                </span>
                                                <span className="text-[10px] text-admin-dim font-medium mt-0.5">KES {c.price.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-admin-dim" />
                                                <span className={cn(
                                                    "font-bold",
                                                    new Date(c.nextPayment) < new Date() ? "text-red-500" : "text-admin-value"
                                                )}>
                                                    {c.nextPayment}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(c.id, c.status)}
                                                className={cn(
                                                    "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                                                    c.status === 'enabled' 
                                                        ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                                                        : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                                                )}
                                            >
                                                {c.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end items-center gap-1">
                                                <button 
                                                    onClick={() => handleEditPackage(c.id, c.plan)}
                                                    className="p-2 text-admin-dim hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-all"
                                                    title="Change Package"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleEditDate(c.id, c.nextPayment)}
                                                    className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 rounded-lg transition-all"
                                                    title="Extend Date"
                                                >
                                                    <Calendar size={14} />
                                                </button>
                                                <button className="p-2 text-admin-dim hover:text-admin-value hover:bg-pace-bg-subtle rounded-lg transition-all">
                                                    <MoreVertical size={14} />
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
    )
}

export default function CustomersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CustomersContent />
        </Suspense>
    )
}
