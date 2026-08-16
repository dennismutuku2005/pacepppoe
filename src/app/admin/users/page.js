"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Users, ShieldAlert, CheckCircle, Power, Edit, Trash2, ShieldCheck, Mail, Phone, Layers, Server, DollarSign, Ban } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { mockRouters, mockPackages } from '@/services/mockData'

// Initial Mock System Users
const INITIAL_SYSTEM_USERS = [
  {
    id: 1,
    name: 'System Administrator',
    username: 'admin',
    role: 'admin',
    email: 'admin@pacewisp.co.ke',
    phone: '0712345678',
    status: 'active',
    createdAt: '2026-01-10'
  },
  {
    id: 2,
    name: 'Pace Networks Ltd',
    username: 'pacenet',
    role: 'isp',
    email: 'ops@pacewisp.co.ke',
    phone: '0701020304',
    status: 'active',
    createdAt: '2026-03-15'
  },
  {
    id: 3,
    name: 'Eastlink Communications',
    username: 'eastlink',
    role: 'isp',
    email: 'support@eastlink.co.ke',
    phone: '0722334455',
    status: 'active',
    createdAt: '2026-04-20'
  },
  {
    id: 4,
    name: 'Rift Valley Fiber',
    username: 'riftfiber',
    role: 'isp',
    email: 'accounts@riftfiber.co.ke',
    phone: '0733445566',
    status: 'inactive',
    createdAt: '2026-05-02'
  }
]

// Initial Mock PPPoE Users (Subscribers)
const INITIAL_PPPOE_USERS = [
  {
    id: 1,
    name: 'John Doe',
    username: 'john_pppoe',
    secret: 'p@ss123',
    phone: '0711223344',
    accountNumber: '0711223344',
    planId: 1, // Bronze Plan 5M
    routerId: 1, // Main Tower A
    ispId: 2, // Pace Networks
    status: 'enabled',
    account: 0.00, // OK
    nextPayment: '2026-09-06'
  },
  {
    id: 2,
    name: 'Jane Smith',
    username: 'jane_wifi',
    secret: 'secret99',
    phone: '0722334455',
    accountNumber: '234455',
    planId: 2, // Silver Plan 10M
    routerId: 1, // Main Tower A
    ispId: 3, // Eastlink
    status: 'enabled',
    account: 500.00, // OK (Credit balance)
    nextPayment: '2026-09-02'
  },
  {
    id: 3,
    name: 'Robert Ngugi',
    username: 'rob_ngugi',
    secret: 'rob66',
    phone: '0733445566',
    accountNumber: '0733445566',
    planId: 3, // Gold Plan 20M
    routerId: 2, // Backup Site B
    ispId: 4, // Rift Valley Fiber
    status: 'suspended', // Suspended
    account: -3500.00, // Owes money
    nextPayment: '2026-08-10'
  },
  {
    id: 4,
    name: 'Alice Wanjiku',
    username: 'ali_wanj',
    secret: 'ali77',
    phone: '0744556677',
    accountNumber: '246677',
    planId: 1, // Bronze Plan 5M
    routerId: 4, // Corporate Link
    ispId: 2, // Pace Networks
    status: 'disabled', // Disabled
    account: -1500.00, // Owes money
    nextPayment: '2026-09-15'
  }
]

export default function UserManagementPage() {
  // Tabs: 'system' or 'pppoe'
  const [activeTab, setActiveTab] = useState('system')
  
  // Data States
  const [systemUsers, setSystemUsers] = useState(INITIAL_SYSTEM_USERS)
  const [pppoeUsers, setPppoeUsers] = useState(INITIAL_PPPOE_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals States
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false)
  const [isPppoeModalOpen, setIsPppoeModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Current entity being added/edited
  const [editingSystemUser, setEditingSystemUser] = useState(null)
  const [editingPppoeUser, setEditingPppoeUser] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null) // { type: 'system'|'pppoe', id: number }

  // Form Fields for System User
  const [sysName, setSysName] = useState('')
  const [sysUsername, setSysUsername] = useState('')
  const [sysPassword, setSysPassword] = useState('')
  const [sysEmail, setSysEmail] = useState('')
  const [sysPhone, setSysPhone] = useState('')
  const [sysRole, setSysRole] = useState('isp')
  const [sysStatus, setSysStatus] = useState('active')

  // Form Fields for PPPoE User
  const [pppoeName, setPppoeName] = useState('')
  const [pppoeUsername, setPppoeUsername] = useState('')
  const [pppoeSecret, setPppoeSecret] = useState('')
  const [pppoePhone, setPppoePhone] = useState('')
  const [pppoeAccount, setPppoeAccount] = useState('')
  const [pppoePlanId, setPppoePlanId] = useState(1)
  const [pppoeRouterId, setPppoeRouterId] = useState(1)
  const [pppoeIspId, setPppoeIspId] = useState(2)
  const [pppoeStatus, setPppoeStatus] = useState('enabled')
  const [pppoeNextPayment, setPppoeNextPayment] = useState('2026-09-01')
  const [pppoeAccountBalance, setPppoeAccountBalance] = useState(0)

  // Reset Filters when changing tabs
  useEffect(() => {
    setSearch('')
  }, [activeTab])

  // Get only ISPs list for PPPoE assignment dropdown
  const ispAccounts = useMemo(() => {
    return systemUsers.filter(u => u.role === 'isp')
  }, [systemUsers])

  // Helpers for mapping foreign keys
  const getPlanDetails = (planId) => {
    return mockPackages.find(p => p.id === Number(planId)) || { name: 'Custom Plan', limit: 'N/A', price: 0 }
  }

  const getRouterDetails = (routerId) => {
    return mockRouters.find(r => r.id === Number(routerId)) || { name: 'Unknown Router', ip: '' }
  }

  const getISPDetails = (ispId) => {
    return systemUsers.find(u => u.id === Number(ispId)) || { name: 'Independent / System' }
  }

  // Filter lists based on tab and input filters
  const filteredSystemUsers = useMemo(() => {
    return systemUsers.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase())) ||
        (user.phone && user.phone.includes(search))
      
      const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter
      const matchesStatus = statusFilter === 'all' ? true : user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [systemUsers, search, roleFilter, statusFilter])

  const filteredPppoeUsers = useMemo(() => {
    return pppoeUsers.filter((sub) => {
      const plan = getPlanDetails(sub.planId)
      const router = getRouterDetails(sub.routerId)
      const isp = getISPDetails(sub.ispId)

      const matchesSearch = 
        sub.name.toLowerCase().includes(search.toLowerCase()) ||
        sub.username.toLowerCase().includes(search.toLowerCase()) ||
        sub.phone.includes(search) ||
        (sub.accountNumber && sub.accountNumber.includes(search)) ||
        plan.name.toLowerCase().includes(search.toLowerCase()) ||
        router.name.toLowerCase().includes(search.toLowerCase()) ||
        isp.name.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'all' ? true : sub.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [pppoeUsers, search, statusFilter, systemUsers])

  // Stats calculation
  const stats = useMemo(() => {
    const totalSys = systemUsers.length
    const admins = systemUsers.filter(u => u.role === 'admin').length
    const isps = systemUsers.filter(u => u.role === 'isp').length
    
    const totalPppoe = pppoeUsers.length
    const activePppoe = pppoeUsers.filter(u => u.status === 'enabled').length
    const suspendedPppoe = pppoeUsers.filter(u => u.status === 'suspended').length
    const disabledPppoe = pppoeUsers.filter(u => u.status === 'disabled').length

    return { totalSys, admins, isps, totalPppoe, activePppoe, suspendedPppoe, disabledPppoe }
  }, [systemUsers, pppoeUsers])

  // Open System User form for editing or adding
  const openSystemModal = (user = null) => {
    if (user) {
      setEditingSystemUser(user)
      setSysName(user.name)
      setSysUsername(user.username)
      setSysPassword('')
      setSysEmail(user.email || '')
      setSysPhone(user.phone || '')
      setSysRole(user.role)
      setSysStatus(user.status)
    } else {
      setEditingSystemUser(null)
      setSysName('')
      setSysUsername('')
      setSysPassword('')
      setSysEmail('')
      setSysPhone('')
      setSysRole('isp')
      setSysStatus('active')
    }
    setIsSystemModalOpen(true)
  }

  // Handle System User submit
  const handleSystemSubmit = (e) => {
    e.preventDefault()
    if (!sysName || !sysUsername) {
      toast.error('Name and username are required.')
      return
    }

    if (!editingSystemUser) {
      // Adding new user
      const isUsernameTaken = systemUsers.some(u => u.username.toLowerCase() === sysUsername.toLowerCase())
      if (isUsernameTaken) {
        toast.error(`Username '${sysUsername}' is already taken.`)
        return
      }

      const newUser = {
        id: Date.now(),
        name: sysName,
        username: sysUsername,
        role: sysRole,
        email: sysEmail,
        phone: sysPhone,
        status: sysStatus,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setSystemUsers([...systemUsers, newUser])
      toast.success(`User '${sysName}' created successfully as ${sysRole.toUpperCase()}.`)
    } else {
      // Editing existing user
      setSystemUsers(systemUsers.map(u => u.id === editingSystemUser.id ? {
        ...u,
        name: sysName,
        username: sysUsername,
        role: sysRole,
        email: sysEmail,
        phone: sysPhone,
        status: sysStatus
      } : u))
      toast.success(`User '${sysName}' updated.`)
    }
    setIsSystemModalOpen(false)
  }

  // Open PPPoE User form for editing or adding
  const openPppoeModal = (sub = null) => {
    if (sub) {
      setEditingPppoeUser(sub)
      setPppoeName(sub.name)
      setPppoeUsername(sub.username)
      setPppoeSecret(sub.secret)
      setPppoePhone(sub.phone)
      setPppoeAccount(sub.accountNumber || '')
      setPppoePlanId(sub.planId)
      setPppoeRouterId(sub.routerId)
      setPppoeIspId(sub.ispId)
      setPppoeStatus(sub.status)
      setPppoeNextPayment(sub.nextPayment || '')
      setPppoeAccountBalance(sub.account || 0)
    } else {
      setEditingPppoeUser(null)
      setPppoeName('')
      setPppoeUsername('')
      setPppoeSecret('')
      setPppoePhone('')
      setPppoeAccount('')
      setPppoePlanId(mockPackages[0]?.id || 1)
      setPppoeRouterId(mockRouters[0]?.id || 1)
      setPppoeIspId(ispAccounts[0]?.id || 2)
      setPppoeStatus('enabled')
      setPppoeNextPayment(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      setPppoeAccountBalance(0)
    }
    setIsPppoeModalOpen(true)
  }

  // Handle PPPoE Subscriber Submit
  const handlePppoeSubmit = (e) => {
    e.preventDefault()
    if (!pppoeName || !pppoeUsername || !pppoeSecret || !pppoePhone) {
      toast.error('All asterisk fields are required.')
      return
    }

    if (!editingPppoeUser) {
      // Adding new PPPoE subscriber
      const isUsernameTaken = pppoeUsers.some(p => p.username.toLowerCase() === pppoeUsername.toLowerCase())
      if (isUsernameTaken) {
        toast.error(`PPPoE Username '${pppoeUsername}' already exists.`)
        return
      }

      const newSub = {
        id: Date.now(),
        name: pppoeName,
        username: pppoeUsername,
        secret: pppoeSecret,
        phone: pppoePhone,
        accountNumber: pppoeAccount || pppoePhone,
        planId: Number(pppoePlanId),
        routerId: Number(pppoeRouterId),
        ispId: Number(pppoeIspId),
        status: pppoeStatus,
        account: Number(pppoeAccountBalance),
        nextPayment: pppoeNextPayment
      }
      setPppoeUsers([...pppoeUsers, newSub])
      toast.success(`PPPoE Subscriber '${pppoeName}' provisioned.`)
    } else {
      // Editing existing PPPoE subscriber
      setPppoeUsers(pppoeUsers.map(p => p.id === editingPppoeUser.id ? {
        ...p,
        name: pppoeName,
        username: pppoeUsername,
        secret: pppoeSecret,
        phone: pppoePhone,
        accountNumber: pppoeAccount,
        planId: Number(pppoePlanId),
        routerId: Number(pppoeRouterId),
        ispId: Number(pppoeIspId),
        status: pppoeStatus,
        account: Number(pppoeAccountBalance),
        nextPayment: pppoeNextPayment
      } : p))
      toast.success(`PPPoE Subscriber '${pppoeName}' updated.`)
    }
    setIsPppoeModalOpen(false)
  }

  // Toggle user statuses directly in the tables
  const toggleSystemStatus = (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active'
    setSystemUsers(systemUsers.map(u => u.id === user.id ? { ...u, status: nextStatus } : u))
    toast.success(`User '${user.name}' is now ${nextStatus.toUpperCase()}.`)
  }

  // Cycles through: enabled -> suspended -> disabled -> enabled
  const togglePppoeStatus = (sub) => {
    let nextStatus = 'enabled'
    if (sub.status === 'enabled') nextStatus = 'suspended'
    else if (sub.status === 'suspended') nextStatus = 'disabled'
    else nextStatus = 'enabled'

    setPppoeUsers(pppoeUsers.map(p => p.id === sub.id ? { ...p, status: nextStatus } : p))
    toast.success(`PPPoE secret '${sub.username}' is now ${nextStatus.toUpperCase()} on MikroTik.`)
  }

  // Trigger Delete confirmation
  const confirmDelete = (type, item) => {
    setDeletingItem({ type, id: item.id, name: item.name || item.username })
    setIsDeleteModalOpen(true)
  }

  const handleDeleteExecute = () => {
    if (deletingItem.type === 'system') {
      const u = systemUsers.find(x => x.id === deletingItem.id)
      if (u && u.username === 'admin') {
        toast.error('System Administrator cannot be removed.')
        setIsDeleteModalOpen(false)
        return
      }

      setSystemUsers(systemUsers.filter(x => x.id !== deletingItem.id))
      setPppoeUsers(pppoeUsers.map(sub => sub.ispId === deletingItem.id ? { ...sub, ispId: 1 } : sub))
      toast.success(`System account '${deletingItem.name}' removed.`)
    } else if (deletingItem.type === 'pppoe') {
      setPppoeUsers(pppoeUsers.filter(x => x.id !== deletingItem.id))
      toast.success(`PPPoE Subscriber '${deletingItem.name}' removed.`)
    }
    setIsDeleteModalOpen(false)
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">User Management Console</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">
            Manage system operators (Admins/ISPs) and configure client PPPoE network parameters.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {activeTab === 'system' ? (
            <button
              onClick={() => openSystemModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Plus size={16} /> Authorize System Operator
            </button>
          ) : (
            <button
              onClick={() => openPppoeModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Plus size={16} /> Add PPPoE Subscriber
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex border border-pace-border p-1 bg-pace-bg-subtle/80 rounded-xl max-w-sm w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('system')}
            className={cn(
              "flex-1 sm:flex-initial text-xs px-5 py-2 font-medium rounded-lg transition-all cursor-pointer",
              activeTab === 'system'
                ? "bg-card-bg text-pace-purple shadow-sm border border-pace-border/30"
                : "text-admin-dim hover:text-admin-value"
            )}
          >
            System Operators ({systemUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('pppoe')}
            className={cn(
              "flex-1 sm:flex-initial text-xs px-5 py-2 font-medium rounded-lg transition-all cursor-pointer",
              activeTab === 'pppoe'
                ? "bg-card-bg text-pace-purple shadow-sm border border-pace-border/30"
                : "text-admin-dim hover:text-admin-value"
            )}
          >
            PPPoE Subscribers ({pppoeUsers.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-admin-dim" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'system' ? "Search operators..." : "Search subscribers, routers..."}
              className="w-full pl-9 pr-4 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
            />
          </div>

          {/* Role filter (System users tab) */}
          {activeTab === 'system' && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value outline-none focus:border-pace-purple"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="isp">ISPs</option>
            </select>
          )}

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card-bg border border-pace-border rounded-xl text-xs font-medium text-admin-value outline-none focus:border-pace-purple"
          >
            <option value="all">All Statuses</option>
            {activeTab === 'system' ? (
              <>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </>
            ) : (
              <>
                <option value="enabled">Enabled</option>
                <option value="suspended">Suspended</option>
                <option value="disabled">Disabled</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Dynamic Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {activeTab === 'system' ? (
          <>
            <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Total Operators</span>
                <div className="p-2 rounded-xl bg-pace-purple/10 text-pace-purple"><Users size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-admin-value">{stats.totalSys}</div>
              <p className="text-[10px] text-gray-400 mt-2">Active operator profiles</p>
            </div>
            <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">System Admins</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600"><ShieldCheck size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-admin-value">{stats.admins}</div>
              <p className="text-[10px] text-gray-400 mt-2">Global control operators</p>
            </div>
            <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Partner ISPs</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600"><Layers size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-admin-value">{stats.isps}</div>
              <p className="text-[10px] text-gray-400 mt-2">Configured virtual tenants</p>
            </div>
            <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Active Status</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600"><CheckCircle size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-admin-value">
                {systemUsers.filter(u => u.status === 'active').length}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Allowed dashboard operators</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Total Secrets</span>
                <div className="p-2 rounded-xl bg-pace-purple/10 text-pace-purple"><Users size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-admin-value">{stats.totalPppoe}</div>
              <p className="text-[10px] text-gray-400 mt-2">Registered PPPoE subscribers</p>
            </div>
            <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Online (Active)</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600"><CheckCircle size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-admin-value">{stats.activePppoe}</div>
              <p className="text-[10px] text-gray-400 mt-2">Authenticated on routers</p>
            </div>
            <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Suspended</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600"><Ban size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-admin-value">{stats.suspendedPppoe}</div>
              <p className="text-[10px] text-gray-400 mt-2">Throttled due to negative balance</p>
            </div>
            <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-admin-dim font-bold">Outstanding Dues</span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600"><DollarSign size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-admin-value">
                KSH {Math.abs(pppoeUsers.reduce((sum, u) => u.account < 0 ? sum + u.account : sum, 0)).toLocaleString()}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Total unpaid customer balance</p>
            </div>
          </>
        )}
      </div>

      {/* Main Table Content */}
      {activeTab === 'system' ? (
        /* SYSTEM OPERATORS TABLE */
        <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-3.5">Operator Name</th>
                  <th className="px-6 py-3.5">Username</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pace-border">
                {filteredSystemUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-admin-dim text-xs">
                      No system operators match the filtered criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSystemUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-pace-bg-subtle/40 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pace-purple-light text-pace-purple flex items-center justify-center font-bold text-xs">
                            {user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-admin-value">{user.name}</p>
                            <p className="text-[10px] text-gray-400">ID: USR-{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-admin-value">{user.username}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                          user.role === 'admin' 
                            ? "bg-pace-purple/10 text-pace-purple" 
                            : "bg-indigo-500/10 text-indigo-600"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.status === 'active' ? 'success' : 'outline'} className="text-[9px] uppercase font-bold">
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {user.email && (
                            <div className="flex items-center gap-1 text-[10px] text-admin-label">
                              <Mail size={12} className="text-admin-dim" />
                              <span>{user.email}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1 text-[10px] text-admin-label">
                              <Phone size={12} className="text-admin-dim" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-admin-dim">{user.createdAt}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleSystemStatus(user)}
                            className={cn(
                              "p-2 rounded-xl transition-all border border-transparent hover:bg-pace-bg-subtle cursor-pointer",
                              user.status === 'active' ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-600'
                            )}
                            title={user.status === 'active' ? 'Deactivate Operator' : 'Activate Operator'}
                          >
                            <Power size={13} />
                          </button>
                          <button
                            onClick={() => openSystemModal(user)}
                            className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-bg-subtle rounded-xl border border-transparent transition-all cursor-pointer"
                            title="Edit Operator Profile"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => confirmDelete('system', user)}
                            className="p-2 text-admin-dim hover:text-rose-600 hover:bg-rose-50/50 rounded-xl border border-transparent transition-all cursor-pointer"
                            title="Delete Operator"
                          >
                            <Trash2 size={13} />
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
      ) : (
        /* PPPoE SUBSCRIBERS TABLE */
        <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap font-figtree">
              <thead>
                <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-3.5">Subscriber</th>
                  <th className="px-6 py-3.5">PPPoE Credentials</th>
                  <th className="px-6 py-3.5">Speed Plan</th>
                  <th className="px-6 py-3.5">Router Node</th>
                  <th className="px-6 py-3.5">Managing ISP</th>
                  <th className="px-6 py-3.5">QoS Queue Status</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pace-border">
                {filteredPppoeUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center text-admin-dim text-xs">
                      No PPPoE subscribers match the filtered criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPppoeUsers.map((sub) => {
                    const plan = getPlanDetails(sub.planId)
                    const router = getRouterDetails(sub.routerId)
                    const isp = getISPDetails(sub.ispId)

                    // Outstanding account dues check: account < 0 means unpaid dues
                    const isOwed = sub.account < 0

                    return (
                      <tr key={sub.id} className="hover:bg-pace-bg-subtle/40 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border",
                              sub.status === 'enabled' 
                                ? "bg-green-500/10 text-green-600 border-green-500/10" 
                                : sub.status === 'suspended'
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/10"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/10"
                            )}>
                              {sub.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-admin-value">{sub.name}</p>
                              <div className="flex items-center gap-1 text-[10px] text-admin-dim mt-0.5">
                                <Phone size={10} />
                                <span>{sub.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-xs font-mono font-semibold text-admin-value flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-400">U:</span>
                              {sub.username}
                            </div>
                            <div className="text-[10px] font-mono text-admin-dim flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-400">P:</span>
                              {sub.secret}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs font-medium text-admin-value">{plan.name}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] text-pace-purple font-mono font-bold uppercase tracking-wider bg-pace-purple-light px-1.5 py-0.25 rounded-md mt-1">
                              {plan.limit}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Server size={12} className="text-admin-dim" />
                            <div>
                              <p className="text-xs font-semibold text-admin-value">{router.name}</p>
                              <p className="text-[9px] font-mono text-gray-400">{router.ip}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-indigo-500/20 border border-indigo-500/40" />
                            <span className="text-xs font-medium text-admin-value">{isp.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant={sub.status === 'enabled' ? 'success' : sub.status === 'suspended' ? 'warning' : 'error'} 
                            className="text-[9px] font-bold uppercase"
                          >
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className={cn(
                              "text-xs font-bold font-mono px-2 py-0.5 rounded-lg border",
                              isOwed 
                                ? "bg-rose-500/5 text-rose-600 border-rose-500/20" 
                                : sub.account === 0 
                                ? "bg-green-500/5 text-green-600 border-green-500/20"
                                : "bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                            )}>
                              {isOwed ? `- KSH ${Math.abs(sub.account).toLocaleString()}` : `KSH ${sub.account.toLocaleString()}`}
                            </span>
                            <p className="text-[9px] text-admin-dim">
                              {isOwed ? "⚠️ Outstanding Balance" : "✅ Account Clear"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => togglePppoeStatus(sub)}
                              className={cn(
                                "p-2 rounded-xl transition-all border border-transparent hover:bg-pace-bg-subtle cursor-pointer",
                                sub.status === 'enabled' ? 'text-amber-500' : sub.status === 'suspended' ? 'text-rose-500' : 'text-emerald-500'
                              )}
                              title="Cycle Status (Active -> Suspended -> Disable)"
                            >
                              <Power size={13} />
                            </button>
                            <button
                              onClick={() => openPppoeModal(sub)}
                              className="p-2 text-admin-dim hover:text-pace-purple hover:bg-pace-bg-subtle rounded-xl border border-transparent transition-all cursor-pointer"
                              title="Edit Subscriber Parameters"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => confirmDelete('pppoe', sub)}
                              className="p-2 text-admin-dim hover:text-rose-600 hover:bg-rose-50/50 rounded-xl border border-transparent transition-all cursor-pointer"
                              title="Delete Subscriber"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SYSTEM USER MODAL (ADD & EDIT) */}
      <Modal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        title={editingSystemUser ? "Edit System Operator" : "Authorize System Operator"}
        description={editingSystemUser ? `Modify operator profile for USR-${editingSystemUser.id}` : "Authorize new admin or ISP login to the management hub."}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSystemSubmit} className="space-y-4 text-left font-figtree">
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Operator Name *</label>
            <input
              required
              value={sysName}
              onChange={(e) => setSysName(e.target.value)}
              placeholder="e.g. Dennis Mutuku"
              className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Username *</label>
              <input
                required
                value={sysUsername}
                onChange={(e) => setSysUsername(e.target.value)}
                placeholder="e.g. dennis_isp"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">
                {editingSystemUser ? "Password (Leave empty)" : "Password *"}
              </label>
              <input
                type="password"
                required={!editingSystemUser}
                value={sysPassword}
                onChange={(e) => setSysPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Operator Role *</label>
              <select
                value={sysRole}
                onChange={(e) => setSysRole(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              >
                <option value="isp">ISP Partner (Isolated access)</option>
                <option value="admin">System Administrator (Full access)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Status *</label>
              <select
                value={sysStatus}
                onChange={(e) => setSysStatus(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              >
                <option value="active">Active (Access allowed)</option>
                <option value="inactive">Inactive (Access blocked)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-pace-border/60 my-4 pt-4 space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Contact Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-admin-dim">Email Address</label>
                <input
                  type="email"
                  value={sysEmail}
                  onChange={(e) => setSysEmail(e.target.value)}
                  placeholder="dennis@isp.co.ke"
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-admin-dim">Phone Number</label>
                <input
                  value={sysPhone}
                  onChange={(e) => setSysPhone(e.target.value)}
                  placeholder="0712345678"
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSystemModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              {editingSystemUser ? "Save Changes" : "Authorize Operator"}
            </button>
          </div>
        </form>
      </Modal>

      {/* PPPOE SUBSCRIBER MODAL (ADD & EDIT) */}
      <Modal
        isOpen={isPppoeModalOpen}
        onClose={() => setIsPppoeModalOpen(false)}
        title={editingPppoeUser ? "Edit PPPoE Secret" : "Add PPPoE Subscriber"}
        description={editingPppoeUser ? "Modify router queue and client credential variables." : "Register a new subscriber account and push secrets to MikroTik queues."}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handlePppoeSubmit} className="space-y-4 text-left font-figtree">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Subscriber Full Name *</label>
              <input
                required
                value={pppoeName}
                onChange={(e) => setPppoeName(e.target.value)}
                placeholder="e.g. Alice Wanjiku"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Phone Number *</label>
              <input
                required
                value={pppoePhone}
                onChange={(e) => setPppoePhone(e.target.value)}
                placeholder="e.g. 0744556677"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">PPPoE Username *</label>
              <input
                required
                value={pppoeUsername}
                onChange={(e) => setPppoeUsername(e.target.value)}
                placeholder="e.g. alice_wanj"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">PPPoE Password / Secret *</label>
              <input
                required
                value={pppoeSecret}
                onChange={(e) => setPppoeSecret(e.target.value)}
                placeholder="e.g. secret99"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">M-Pesa Account Ref</label>
              <input
                value={pppoeAccount}
                onChange={(e) => setPppoeAccount(e.target.value)}
                placeholder="Defaults to phone number"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple transition-all text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Subscriber Status *</label>
              <select
                value={pppoeStatus}
                onChange={(e) => setPppoeStatus(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
              >
                <option value="enabled">Enabled (MikroTik active)</option>
                <option value="suspended">Suspended (Redirect/Throttle active)</option>
                <option value="disabled">Disabled (Unauthenticated)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-pace-border/60 my-4 pt-4 space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-admin-dim font-bold">Service & Routing Allocations</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-admin-dim">Service Plan *</label>
                <select
                  value={pppoePlanId}
                  onChange={(e) => setPppoePlanId(e.target.value)}
                  className="w-full mt-2 px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
                >
                  {mockPackages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.limit} - KSH {pkg.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-admin-dim">Router Node *</label>
                <select
                  value={pppoeRouterId}
                  onChange={(e) => setPppoeRouterId(e.target.value)}
                  className="w-full mt-2 px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
                >
                  {mockRouters.map(router => (
                    <option key={router.id} value={router.id}>
                      {router.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-admin-dim">Managing ISP *</label>
                <select
                  value={pppoeIspId}
                  onChange={(e) => setPppoeIspId(e.target.value)}
                  className="w-full mt-2 px-3 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs"
                >
                  <option value={1}>Administrator</option>
                  {ispAccounts.map(isp => (
                    <option key={isp.id} value={isp.id}>
                      {isp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-admin-dim">Next Payment Date</label>
                <input
                  type="date"
                  value={pppoeNextPayment}
                  onChange={(e) => setPppoeNextPayment(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-admin-dim">Account Balance (KSH) *</label>
                <div className="relative mt-2">
                  <input
                    type="number"
                    value={pppoeAccountBalance}
                    onChange={(e) => setPppoeAccountBalance(Number(e.target.value))}
                    placeholder="0.00 (Negative if unpaid)"
                    className="w-full px-4 py-2.5 rounded-xl border border-pace-border bg-pace-bg-subtle text-admin-value outline-none focus:border-pace-purple text-xs font-mono"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 font-bold">
                    {pppoeAccountBalance < 0 ? "⚠️ Owes payment" : "✅ Clear"}
                  </span>
                </div>
                <p className="text-[9px] text-gray-400 mt-1 pl-1">Use a negative value (e.g. -1500) to log overdue dues.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPppoeModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-pace-border rounded-xl text-xs font-semibold text-admin-dim hover:bg-pace-bg-subtle transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-pace-purple hover:bg-pace-purple/90 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              {editingPppoeUser ? "Save Queue Params" : "Provision Subscriber"}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Permanent Deletion"
        description="This action cannot be undone. All credentials will be immediately purged from the active server queue."
        type="danger"
        confirmText="Confirm Delete"
        onConfirm={handleDeleteExecute}
      >
        {deletingItem && (
          <div className="mt-4 p-4 border border-rose-100 bg-rose-50/30 rounded-xl">
            <p className="text-xs text-rose-700 leading-relaxed flex items-start gap-2">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>
                Are you sure you want to remove the {deletingItem.type === 'system' ? 'system user account' : 'PPPoE subscriber secret'}{" "}
                <strong>&apos;{deletingItem.name}&apos;</strong>? Active connections using this secret will disconnect.
              </span>
            </p>
          </div>
        )}
      </Modal>

    </div>
  )
}
