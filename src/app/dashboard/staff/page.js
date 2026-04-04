"use client"

import React, { useState, useEffect } from 'react'
import {
    Users, Search, Plus, Trash2, Edit2,
    Loader2, CheckCircle2, Eye, EyeOff,
    UserCheck, Key, Fingerprint, RefreshCw,
    AtSign, Phone, Clock, UserX, UserRoundCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton, TableRowSkeleton } from '@/components/Skeleton'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { dashboardService } from '@/services/dashboard'
import authService from '@/lib/auth'
import { Shield, ShieldAlert, BadgeCheck, Lock } from 'lucide-react'
import { toast } from 'sonner'

const AVAILABLE_POLICIES = [
    { id: 'create_voucher', label: 'Create Vouchers', description: 'Generate new access codes' },
    { id: 'manage_users', label: 'Manage Staff', description: 'Create and edit other staff' },
    { id: 'view_income', label: 'View Income', description: 'Access earnings and reports' },
    { id: 'view_routers', label: 'View Routers', description: 'Monitor station connectivity' },
    { id: 'change_payment', label: 'Payment Settings', description: 'Modify M-Pesa/KCB details' },
    { id: 'manage_customers', label: 'Manage Customers', description: 'Edit or block user accounts' }
]

export default function StaffManagementPage() {
    const [staff, setStaff] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal states
    const [showModal, setShowModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState(null)
    const [selectedStaff, setSelectedStaff] = useState(null)
    const [showPassword, setShowPassword] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        phone: '',
        type: 'user',
        status: 'active',
        policies: []
    })

    const fetchStaff = async () => {
        setIsRefreshing(true)
        try {
            const res = await dashboardService.getStaff()
            if (res?.status === 'success') {
                setStaff(res.data || [])
            }
        } catch (e) {
            console.error("Failed to fetch staff:", e)
            toast.error("Failed to load staff list")
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchStaff()
    }, [])

    const currentUser = authService.getUser()
    const isSuperAdmin = currentUser?.type === 'superadmin'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = editingStaff
                ? await dashboardService.updateStaff(editingStaff.id, formData)
                : await dashboardService.createStaff(formData)

            if (res?.status === 'success') {
                toast.success(editingStaff ? "Staff member updated" : "Staff member created")
                setShowModal(false)
                setEditingStaff(null)
                resetForm()
                fetchStaff()
            } else {
                toast.error(res?.message || "Failed to process request")
            }
        } catch (e) {
            console.error(e)
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteUser = async () => {
        try {
            const res = await dashboardService.deleteStaff(selectedStaff.id)
            if (res?.status === 'success') {
                toast.success("Staff member deleted successfully")
                setIsDeleteModalOpen(false)
                fetchStaff()
            } else {
                toast.error(res?.message || "Failed to delete staff")
            }
        } catch (e) {
            toast.error("An error occurred")
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            username: '',
            password: '',
            phone: '',
            type: 'user',
            status: 'active',
            policies: []
        })
    }

    const togglePolicy = (policyId) => {
        setFormData(prev => {
            const currentPolicies = prev.policies || []
            if (currentPolicies.includes(policyId)) {
                return { ...prev, policies: currentPolicies.filter(id => id !== policyId) }
            } else {
                return { ...prev, policies: [...currentPolicies, policyId] }
            }
        })
    }

    const openEdit = (user) => {
        setEditingStaff(user)
        setFormData({
            name: user.name,
            username: user.username,
            password: '',
            phone: user.phone,
            type: user.type,
            status: user.status,
            policies: user.policies || []
        })
        setShowModal(true)
    }

    const viewDetails = (user) => {
        setSelectedStaff(user)
        setShowDetailModal(true)
    }

    const filteredStaff = staff.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-pace-border pb-4">
                <div>
                    <h1 className="text-xl font-bold text-admin-value leading-tight uppercase font-medium tracking-tight">Staff Management</h1>
                    <p className="text-sm text-admin-dim mt-1">Manage portal access and administrator accounts.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pace-purple transition-colors" size={12} />
                        <input
                            type="text"
                            autoComplete="off"
                            placeholder="Search staff members..."
                            className="w-full pl-9 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-[11px] font-bold text-admin-value focus:outline-none focus:ring-2 focus:ring-pace-purple/10 focus:border-pace-purple transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingStaff(null);
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2 bg-pace-purple text-white rounded-xl hover:bg-[#3d1a75] transition-all text-[11px] font-medium uppercase tracking-widest shadow-lg shadow-pace-purple/10 w-full sm:w-auto justify-center"
                    >
                        <Plus size={12} />
                        Add Staff User
                    </button>
                    <button
                        onClick={fetchStaff}
                        disabled={isRefreshing}
                        className="p-2 bg-card-bg border border-pace-border rounded-xl text-admin-dim hover:text-pace-purple transition-all"
                    >
                        <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Staff Table Container */}
            <div className="border border-pace-border rounded-2xl overflow-hidden bg-card-bg shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap border-collapse text-[11px]">
                        <thead>
                            <tr className="bg-pace-bg-subtle border-b border-pace-border font-bold text-admin-dim uppercase tracking-widest text-[9px]">
                                <th className="px-6 py-4">Team Member</th>
                                <th className="px-6 py-4 text-center">Authorization</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Contact Identity</th>
                                <th className="px-6 py-4 text-right">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pace-border">
                            {isLoading ? (
                                <TableRowSkeleton cols={5} rows={5} />
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-gray-400 font-medium text-[10px] uppercase tracking-widest">
                                        No staff members found in directory
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((user) => (
                                    <tr key={user.id} className="hover:bg-pace-bg-subtle transition-colors group cursor-default">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-medium shadow-sm border transition-all",
                                                    user.type === 'admin'
                                                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                                                        : "bg-pace-bg-subtle text-admin-dim border-pace-border"
                                                )}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-admin-value leading-none uppercase text-[11px] group-hover:text-pace-purple transition-colors">{user.name}</span>
                                                    <span className="text-[8px] font-normal text-gray-400 mt-1.5 uppercase tracking-tight flex items-center gap-1.5 opacity-80">
                                                        <AtSign size={8} /> {user.username}
                                                        <span className="mx-0.5 opacity-30">•</span>
                                                        ID: {user.id.substring(0, 8)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={cn(
                                                    "text-[9px] font-medium uppercase tracking-widest",
                                                    user.type === 'admin' ? "text-red-400" : "text-gray-400"
                                                )}>
                                                    {user.type === 'admin' ? 'SYSTEM ADMIN' : 'STAFF USER'}
                                                </span>
                                                <span className="text-[7px] font-normal text-gray-300 mt-0.5 uppercase tracking-widest flex items-center gap-1 opacity-70">
                                                    <Clock size={8} /> {new Date(user.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <Badge variant={user.status === 'active' ? 'success' : 'error'} className="text-[8px] font-medium px-2 py-0.5 border-none uppercase tracking-widest rounded-md">
                                                    {user.status}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center opacity-80">
                                                <span className="text-[10px] font-normal text-gray-500 font-mono tracking-tighter flex items-center gap-1.5">
                                                    <Phone size={9} className="text-gray-300" />
                                                    {user.phone || 'N/A'}
                                                </span>
                                            </div>
                                        </td>                                         <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => viewDetails(user)}
                                                    className="p-1.5 bg-card-bg border border-pace-border rounded-lg text-admin-dim hover:text-admin-value hover:border-pace-border transition-all"
                                                    title="View Details"
                                                >
                                                    <Fingerprint size={12} />
                                                </button>
                                                
                                                {/* Only Superadmin can edit/delete other Admins. Admins can only manage Staff. */}
                                                {!user.is_primary && (user.type !== 'admin' || isSuperAdmin || user.id === currentUser?.id) ? (
                                                    <>
                                                        <button
                                                            onClick={() => openEdit(user)}
                                                            className="p-1.5 bg-card-bg border border-pace-border rounded-lg text-admin-dim hover:text-pace-purple hover:border-pace-purple/50 transition-all"
                                                            title="Edit Permissions"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        {user.id !== currentUser?.id && (
                                                            <button
                                                                onClick={() => { setSelectedStaff(user); setIsDeleteModalOpen(true); }}
                                                                className="p-1.5 bg-card-bg border border-pace-border rounded-lg text-admin-dim hover:text-red-400 hover:border-red-100 transition-all"
                                                                title="Revoke Access"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="p-1.5 bg-pace-bg-subtle border border-pace-border rounded-lg text-gray-300 cursor-not-allowed opacity-50" title={user.is_primary ? "System Protected" : "Admin Account Restricted"}>
                                                        <Lock size={12} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Staff Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingStaff(null); resetForm(); }}
                title={editingStaff ? "Update Access" : "Provision Account"}
                description={editingStaff ? `Updating ${editingStaff.username}` : "Assign credentials for new personnel"}
                maxWidth="max-w-md"
                footer={null}
            >
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-admin-dim uppercase ml-1">Full Name</label>
                            <input
                                required
                                autoComplete="off"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-[11px] font-bold text-admin-value focus:border-pace-purple focus:bg-card-bg outline-none transition-all"
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-admin-dim uppercase ml-1">Username</label>
                            <input
                                required
                                disabled={editingStaff}
                                autoComplete="off"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-[11px] font-bold text-admin-value focus:border-pace-purple focus:bg-card-bg outline-none transition-all disabled:opacity-50"
                                placeholder="Username"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-admin-dim uppercase ml-1">Phone</label>
                            <input
                                autoComplete="off"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-[11px] font-bold text-admin-value focus:border-pace-purple focus:bg-card-bg outline-none transition-all"
                                placeholder="+254..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-medium text-gray-400 uppercase ml-1">
                                {editingStaff ? "New Password" : "Password"}
                            </label>
                            <div className="relative">
                                <Key size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    required={!editingStaff}
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-9 pr-12 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-[11px] font-bold text-admin-value focus:border-pace-purple focus:bg-card-bg outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-pace-purple"
                                >
                                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-medium text-gray-400 uppercase ml-1">Role</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-[11px] font-bold text-admin-value focus:border-pace-purple focus:bg-card-bg outline-none transition-all"
                            >
                                <option value="user">STAFF</option>
                                <option value="admin">ADMIN</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-medium text-gray-400 uppercase ml-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 bg-pace-bg-subtle border border-pace-border rounded-xl text-[11px] font-bold text-admin-value focus:border-pace-purple focus:bg-card-bg outline-none transition-all"
                            >
                                <option value="active">ACTIVE</option>
                                <option value="suspended">SUSPENDED</option>
                                <option value="inactive">INACTIVE</option>
                            </select>
                        </div>
                    </div>

                    {formData.type === 'user' ? (
                        <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-bold text-admin-dim uppercase tracking-widest flex items-center gap-2">
                                <Shield size={12} className="text-pace-purple" />
                                System Policies & Permissions
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {AVAILABLE_POLICIES.map(policy => {
                                    const isSelected = formData.policies?.includes(policy.id)
                                    return (
                                        <div
                                            key={policy.id}
                                            onClick={() => togglePolicy(policy.id)}
                                            className={cn(
                                                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group",
                                                isSelected 
                                                    ? "bg-pace-purple/5 border-pace-purple/30 ring-1 ring-pace-purple/10" 
                                                    : "bg-pace-bg-subtle border-pace-border hover:border-pace-purple/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded-md border flex items-center justify-center transition-all mt-0.5",
                                                isSelected 
                                                    ? "bg-pace-purple border-pace-purple" 
                                                    : "bg-white border-pace-border group-hover:border-pace-purple/40"
                                            )}>
                                                {isSelected && <BadgeCheck size={10} className="text-white" />}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-tight",
                                                    isSelected ? "text-pace-purple" : "text-admin-value"
                                                )}>
                                                    {policy.label}
                                                </span>
                                                <span className="text-[8px] text-admin-dim font-medium leading-tight">
                                                    {policy.description}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex items-center gap-3">
                            <ShieldAlert className="text-red-400 shrink-0" size={16} />
                            <p className="text-[10px] text-red-700/70 font-bold uppercase tracking-tight leading-relaxed">
                                Administrator accounts have full system access by default. Multi-user policies are not required for this role.
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 bg-pace-purple text-white rounded-xl font-medium text-[11px] uppercase tracking-widest hover:bg-[#3d1a75] transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center relative overflow-hidden"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <span>{editingStaff ? "Update Account" : "Create Account"}</span>
                        )}
                    </button>
                </form>
            </Modal>

            {/* Account Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Account Details"
                maxWidth="max-w-sm"
                footer={null}
            >
                {selectedStaff && (
                    <div className="space-y-6 text-center py-4">
                        <div className="w-16 h-16 bg-pace-bg-subtle rounded-full flex items-center justify-center mx-auto border border-pace-border text-admin-dim">
                            <Fingerprint size={32} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-admin-value uppercase leading-none">{selectedStaff.name}</h3>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <Badge variant={selectedStaff.type === 'admin' ? 'success' : 'secondary'} className="text-[8px] font-medium uppercase tracking-widest px-2">
                                    {selectedStaff.type === 'admin' ? 'SYSTEM ADMIN' : 'STAFF'}
                                </Badge>
                                <Badge variant={selectedStaff.status === 'active' ? 'success' : 'error'} className="text-[8px] font-medium uppercase tracking-widest px-2">
                                    {selectedStaff.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 text-left">
                            <div className="bg-pace-bg-subtle p-3 rounded-xl border border-pace-border">
                                <p className="text-[8px] font-bold text-admin-dim uppercase tracking-widest">Username</p>
                                <p className="text-[11px] font-bold text-admin-value mt-0.5">{selectedStaff.username}</p>
                            </div>
                            <div className="bg-pace-bg-subtle p-3 rounded-xl border border-pace-border">
                                <p className="text-[8px] font-bold text-pace-purple uppercase tracking-widest">Created</p>
                                <p className="text-[11px] font-bold text-admin-value mt-0.5">{new Date(selectedStaff.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        {selectedStaff.policies && selectedStaff.policies.length > 0 && (
                            <div className="space-y-3 text-left">
                                <p className="text-[9px] font-bold text-admin-dim uppercase tracking-widest flex items-center gap-2">
                                    <ShieldAlert size={12} className="text-pace-purple" />
                                    Active Permissions
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedStaff.policies.map(pId => {
                                        const p = AVAILABLE_POLICIES.find(pol => pol.id === pId)
                                        return (
                                            <Badge key={pId} variant="success" className="bg-pace-purple/5 text-pace-purple border-none text-[8px] py-1 px-2 uppercase font-bold tracking-tight">
                                                {p?.label || pId}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="w-full py-2.5 border border-pace-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-admin-dim hover:bg-pace-bg-subtle transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </Modal>

            {/* Termination Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Removal"
                description={`Revoke access for ${selectedStaff?.name}?`}
                type="danger"
                icon={Trash2}
                footer={null}
            >
                <div className="space-y-4 pt-2">
                    <div className="flex-1 bg-card-bg border border-pace-border rounded-xl p-3 flex items-center gap-3">
                        <UserX className="text-red-400 shrink-0" size={16} />
                        <p className="text-[10px] text-red-700/70 font-medium leading-relaxed uppercase tracking-tight">
                            Warning: This action will immediately terminate all active sessions and permanently revoke system access for this member.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 py-3 border border-pace-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-admin-dim hover:bg-pace-bg-subtle transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteUser}
                            className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-medium uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95"
                        >
                            Confirm Revoke
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
