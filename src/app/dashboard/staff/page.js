"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { ShieldCheck, UserPlus, Search, Trash2, Mail, Phone, Lock, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mockDashboardData, mockStaff } from '@/services/mockData'
import Swal from 'sweetalert2'

function StaffContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [staffList, setStaffList] = useState([])

    useEffect(() => {
        const timer = setTimeout(() => {
            setStaffList(mockDashboardData.staff)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleAddStaff = () => {
        Swal.fire({
            title: 'Invite Staff Member',
            html: `
                <div class="space-y-4 text-left">
                    <div>
                        <label class="text-[10px] font-bold uppercase text-gray-400">Full Name</label>
                        <input id="staff-name" class="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" placeholder="Dennis Mutuku">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold uppercase text-gray-400">Email Address</label>
                        <input id="staff-email" type="email" class="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" placeholder="dennis@pace.com">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-[10px] font-bold uppercase text-gray-400">Role</label>
                            <select id="staff-role" class="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm">
                                <option>Super Admin</option>
                                <option>Technical Lead</option>
                                <option>Accounts</option>
                                <option>Support</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold uppercase text-gray-400">Phone</label>
                            <input id="staff-phone" class="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" placeholder="07...">
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#4B1D8F',
            confirmButtonText: 'Create Member',
        }).then((result) => {
            if (result.isConfirmed) {
                const name = document.getElementById('staff-name').value
                const email = document.getElementById('staff-email').value
                const role = document.getElementById('staff-role').value
                const phone = document.getElementById('staff-phone').value
                
                if (name && email) {
                    const newStaff = {
                        id: Date.now(),
                        name,
                        email,
                        role,
                        phone,
                        status: 'Active',
                        policies: role === 'Super Admin' ? ['all'] : ['customers', 'sms']
                    }
                    setStaffList(prev => [newStaff, ...prev])
                    Swal.fire('Success!', 'Staff member invited.', 'success')
                }
            }
        })
    }

    const filteredStaff = staffList.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-bold text-pace-purple uppercase tracking-tight flex items-center gap-3">
                        <ShieldCheck size={24} />
                        Team & Policies
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 tracking-widest uppercase">Manage administrative access and role-based permissions</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-pace-purple/5 border border-pace-purple/10 rounded-xl text-center">
                        <p className="text-sm font-bold text-pace-purple leading-none">{mockDashboardData.stats.activeStaff}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Members</p>
                    </div>
                    <button 
                        onClick={handleAddStaff}
                        className="flex items-center gap-2 px-4 py-2 bg-pace-purple text-white rounded-xl hover:bg-pace-purple/90 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <UserPlus size={14} /> New Member
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search by name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-card-bg border border-pace-border rounded-2xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
                ) : filteredStaff.map((member) => (
                    <div key={member.id} className="bg-card-bg border border-pace-border rounded-2xl p-6 hover:border-pace-purple/30 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-xl bg-pace-purple/5 border border-pace-purple/10 flex items-center justify-center text-pace-purple font-black text-lg">
                                {member.name.charAt(0)}
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={cn(
                                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5",
                                    member.status === 'Active' ? "bg-green-500/10 text-green-600" : "bg-gray-100 text-gray-400"
                                )}>
                                    {member.status}
                                </Badge>
                                <button className="p-1 text-gray-300 hover:text-admin-value transition-colors">
                                    <MoreVertical size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-[15px] font-black text-admin-value tracking-tight leading-none">{member.name}</h3>
                                <p className="text-[10px] font-bold text-pace-purple uppercase tracking-widest mt-1.5">{member.role}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-pace-border/50 pt-4">
                                <div className="flex items-center gap-2">
                                    <Phone size={10} className="text-gray-400" />
                                    <span className="text-[10px] font-bold text-admin-dim">{member.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock size={10} className="text-gray-400" />
                                    <span className="text-[10px] font-bold text-admin-dim uppercase">{member.policies.length} Policies</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {member.policies.map((p, idx) => (
                                <span key={idx} className="text-[8px] font-black text-gray-400 uppercase tracking-tighter bg-pace-bg-subtle px-1.5 py-0.5 rounded border border-pace-border/30">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function StaffPage() {
    return (
        <Suspense fallback={<div>Loading Team...</div>}>
            <StaffContent />
        </Suspense>
    )
}
