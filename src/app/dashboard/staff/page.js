"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { ShieldCheck, UserPlus, Search, Trash2, Mail, Phone, Lock, MoreVertical, CheckCircle2, ChevronRight, X, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { mockDashboardData } from '@/services/mockData'
import Swal from 'sweetalert2'
import { Modal } from '@/components/Modal'

const POLICY_OPTIONS = [
    { id: 'all', name: 'Master Access', desc: 'Complete system override & permission control' },
    { id: 'customers', name: 'Identity Policy', desc: 'Provisioning and secret management' },
    { id: 'routers', name: 'Infrastructure Node', desc: 'Hardware node & status orchestration' },
    { id: 'finance', name: 'Financial Matrix', desc: 'Revenue audits & operational expenses' },
    { id: 'staff', name: 'Sovereignty Control', desc: 'Team invites & policy modifications' },
    { id: 'sms', name: 'Communication Hub', desc: 'System alerts & manual SMS dispatches' }
]

function StaffContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [staffList, setStaffList] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentMember, setCurrentMember] = useState(null)
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        role: 'Support', 
        phone: '',
        policies: ['customers', 'sms']
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setStaffList(mockDashboardData.staff)
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const handleOpenModal = (member = null) => {
        if (member) {
            setCurrentMember(member)
            setFormData({ ...member })
        } else {
            setCurrentMember(null)
            setFormData({ 
                name: '', 
                email: '', 
                role: 'Support', 
                phone: '',
                policies: ['customers', 'sms']
            })
        }
        setIsModalOpen(true)
    }

    const togglePolicy = (policyId) => {
        setFormData(prev => {
            if (policyId === 'all') {
                return { ...prev, policies: prev.policies.includes('all') ? [] : ['all'] }
            }
            if (prev.policies.includes('all')) return prev // locked if all
            
            const newPolicies = prev.policies.includes(policyId)
                ? prev.policies.filter(p => p !== policyId)
                : [...prev.policies, policyId]
            return { ...prev, policies: newPolicies }
        })
    }

    const handleSaveStaff = () => {
        if (!formData.name || !formData.email) {
            Swal.fire('Error', 'Full name and email are required.', 'error')
            return
        }
        
        if (currentMember) {
            setStaffList(prev => prev.map(s => s.id === currentMember.id ? { ...s, ...formData } : s))
            Swal.fire('Updated!', 'Staff credentials synchronized.', 'success')
        } else {
            const newStaff = {
                id: Date.now(),
                ...formData,
                status: 'Active'
            }
            setStaffList(prev => [newStaff, ...prev])
            Swal.fire('Success!', 'Staff member invited with requested policies.', 'success')
        }
        setIsModalOpen(false)
    }

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Remove Staff?',
            text: `Revoke administrative credentials for ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E11D48',
            confirmButtonText: 'Yes, Revoke'
        }).then((result) => {
            if (result.isConfirmed) {
                setStaffList(prev => prev.filter(s => s.id !== id))
                Swal.fire('Revoked!', 'Access terminated immediately.', 'success')
            }
        })
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-lg font-bold text-admin-value flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pace-purple/10 flex items-center justify-center">
                            <ShieldCheck size={20} className="text-pace-purple" />
                        </div>
                        Team & Policy Matrix
                    </h1>
                    <p className="text-[10px] font-bold text-admin-dim mt-1 tracking-widest uppercase italic">Administrative Sovereignty & Role-Based Policy Control</p>
                </div>
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-pace-purple text-white rounded-xl hover:opacity-90 transition-all text-xs font-bold uppercase tracking-widest shadow-xl shadow-pace-purple/20 active:scale-95"
                    >
                        <UserPlus size={14} /> New Sovereignty
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim group-focus-within:text-pace-purple transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search team members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-[12px] font-bold text-admin-value focus:outline-none focus:border-pace-purple transition-all"
                    />
                </div>
            </div>

            {/* High Density Table */}
            <div className="overflow-hidden bg-white dark:bg-card-bg border border-pace-border rounded-2xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap text-[12px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-widest text-[9px]">
                                <th className="px-6 py-4">Full Identity</th>
                                <th className="px-6 py-4">Sovereignty Role</th>
                                <th className="px-6 py-4">Policy Clearance</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4"><div className="h-4 bg-pace-bg-subtle rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : staffList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((member) => (
                                <tr key={member.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200 group cursor-default">
                                    <td className="px-6 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-admin-value tracking-tight group-hover:text-pace-purple transition-colors">{member.name}</span>
                                            <span className="text-[10px] text-admin-dim flex items-center gap-1.5 mt-0.5 lowercase italic tracking-tight">
                                                <Mail size={10} strokeWidth={3} /> {member.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-pace-purple uppercase tracking-widest">{member.role}</span>
                                            <span className="text-[9px] text-admin-dim flex items-center gap-1.5 mt-0.5 font-bold">
                                                <Phone size={10} /> {member.phone || 'No contact'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                            {member.policies?.map((p, idx) => (
                                                <span key={idx} className="text-[8px] font-black text-admin-dim uppercase tracking-tighter bg-pace-bg-subtle px-2 py-0.5 rounded border border-pace-border/50">
                                                    {p === 'all' ? 'FULL CLEARANCE' : p}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <Badge variant={member.status === 'Active' ? 'success' : 'secondary'} className="px-3 py-1 italic uppercase font-black tracking-tighter border-none">
                                            {member.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end gap-2 px-2">
                                            <button 
                                                onClick={() => handleOpenModal(member)}
                                                className="p-1.5 text-admin-dim hover:text-pace-purple hover:bg-pace-purple/10 rounded-lg transition-all"
                                                title="Modify Clearance"
                                            >
                                                <Edit2 size={13} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(member.id, member.name)}
                                                className="p-1.5 text-admin-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Revoke Control"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentMember ? "Modify Sovereignty" : "Sovereignty Provisioning"}
                description={currentMember ? `Updating clearances for ${currentMember.name}` : "Populate identity and select clearance levels for the new administrator."}
                maxWidth="max-w-2xl"
            >
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Legal Name</label>
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Admin Name"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Secured Contact</label>
                            <input 
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="07XXXXXXXX"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Email Hash</label>
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="admin@pace.com"
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest pl-1">Primary Role</label>
                            <select 
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="w-full px-4 py-2.5 bg-pace-bg-subtle border border-pace-border rounded-xl text-xs font-bold text-admin-value outline-none focus:border-pace-purple transition-all appearance-none"
                            >
                                <option value="Super Admin">Super Administrator</option>
                                <option value="Systems Architect">Systems Architect</option>
                                <option value="Accounts Auditor">Accounts Auditor</option>
                                <option value="Support Engineer">Support Engineer</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest">Clearance Policies</label>
                            <span className="text-[9px] text-pace-purple font-black uppercase tracking-tighter italic">Selective access lockdown</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {POLICY_OPTIONS.map((policy) => (
                                <button
                                    key={policy.id}
                                    type="button"
                                    onClick={() => togglePolicy(policy.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                        formData.policies.includes(policy.id)
                                            ? "border-pace-purple/50 bg-pace-purple/5 ring-1 ring-pace-purple/10"
                                            : "border-pace-border bg-pace-bg-subtle hover:border-admin-dim/30"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded flex items-center justify-center transition-colors",
                                        formData.policies.includes(policy.id) ? "bg-pace-purple text-white" : "border border-admin-dim/30"
                                    )}>
                                        {formData.policies.includes(policy.id) && <CheckCircle2 size={12} />}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-admin-value leading-tight">{policy.name}</p>
                                        <p className="text-[9px] text-admin-dim font-medium leading-tight mt-0.5">{policy.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-5 py-2.5 border border-pace-border rounded-xl text-xs font-bold text-admin-dim uppercase tracking-widest hover:bg-pace-bg-subtle transition-all"
                        >
                            Discard
                        </button>
                        <button 
                            type="button"
                            onClick={handleSaveStaff}
                            className="flex-3 px-5 py-2.5 bg-pace-purple text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 shadow-xl shadow-pace-purple/20 transition-all active:scale-95"
                        >
                            {currentMember ? "Commit Changes" : "Grant Credentials"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default function StaffPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-admin-dim animate-pulse uppercase text-[10px] font-bold tracking-widest">Initialising Team Matrix...</div>}>
            <StaffContent />
        </Suspense>
    )
}
