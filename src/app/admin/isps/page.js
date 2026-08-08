"use client"

import React, { useMemo, useState } from 'react'
import { Search, Users, ShieldCheck, MapPin } from 'lucide-react'
import { mockCustomers } from '@/services/mockData'

const ISP_ACCOUNTS = [
  {
    id: 1,
    name: 'Pace Networks Ltd',
    nodes: 5,
    subscribers: 84,
    balance: 'KSH 128,500',
    status: 'Active',
    contact: 'ops@pacewisp.co.ke'
  },
  {
    id: 2,
    name: 'Eastlink Communications',
    nodes: 3,
    subscribers: 46,
    balance: 'KSH 94,200',
    status: 'Active',
    contact: 'support@eastlink.co.ke'
  },
  {
    id: 3,
    name: 'Rift Valley Fiber',
    nodes: 2,
    subscribers: 30,
    balance: 'KSH 52,100',
    status: 'Review',
    contact: 'accounts@riftfiber.co.ke'
  }
]

export default function AdminISPsPage() {
  const [search, setSearch] = useState('')
  const filteredIsps = useMemo(() => {
    return ISP_ACCOUNTS.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.contact.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const totalSubscribers = mockCustomers.length

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">ISP Management</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Manage partner ISPs, billing, and route access status.</p>
        </div>
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-admin-dim" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ISPs or contacts..."
            className="w-full pl-11 pr-4 py-2.5 bg-card-bg border border-pace-border rounded-xl text-sm font-medium text-admin-value focus:outline-none focus:border-pace-purple transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-admin-dim font-bold">Total Subscribers</p>
              <p className="text-3xl font-bold text-admin-value mt-3">{totalSubscribers}</p>
            </div>
            <div className="p-3 rounded-2xl bg-pace-bg-subtle text-pace-purple">
              <Users size={18} />
            </div>
          </div>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-admin-dim font-bold">Partner ISPs</p>
              <p className="text-3xl font-bold text-admin-value mt-3">{ISP_ACCOUNTS.length}</p>
            </div>
            <div className="p-3 rounded-2xl bg-pace-bg-subtle text-pace-purple">
              <ShieldCheck size={18} />
            </div>
          </div>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-admin-dim font-bold">Connected Nodes</p>
              <p className="text-3xl font-bold text-admin-value mt-3">{ISP_ACCOUNTS.reduce((sum, item) => sum + item.nodes, 0)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-pace-bg-subtle text-pace-purple">
              <MapPin size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-pace-bg-subtle/50 border-b border-pace-border font-bold text-admin-dim uppercase tracking-wider text-[10px]">
                <th className="px-6 py-3">ISP Name</th>
                <th className="px-6 py-3">Nodes</th>
                <th className="px-6 py-3">Subscribers</th>
                <th className="px-6 py-3">Balance</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pace-border">
              {filteredIsps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-admin-dim text-sm">No ISP accounts match your search.</td>
                </tr>
              ) : (
                filteredIsps.map((isp) => (
                  <tr key={isp.id} className="hover:bg-pace-bg-subtle/50 transition-all duration-200">
                    <td className="px-6 py-3">
                      <p className="text-sm font-semibold text-admin-value">{isp.name}</p>
                    </td>
                    <td className="px-6 py-3 text-xs uppercase tracking-widest text-admin-dim">{isp.nodes}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-admin-value">{isp.subscribers}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-admin-value">{isp.balance}</td>
                    <td className="px-6 py-3">
                      <span className={
                        `inline-flex px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.25em] ${
                          isp.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : isp.status === 'Review'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-slate-500/10 text-slate-600'
                        }`
                      }>
                        {isp.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[10px] text-admin-dim font-mono">{isp.contact}</td>
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
