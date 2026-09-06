"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Network, Users, Wallet, Smartphone, ArrowUpRight, LifeBuoy, ServerCog } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardService } from '@/services/admin/dashboard'
import { Skeleton } from '@/components/Skeleton'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminHomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [charts, setCharts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [widgets, setWidgets] = useState(null)
  const [isWalletBlurred, setIsWalletBlurred] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await dashboardService.getDashboardData()
        if (res?.status === 'success') {
          setCharts(res.data.charts.revenue_over_time)
          setTransactions(res.data.recent_transactions || [])
          setWidgets(res.data.widgets || null)
        }
      } catch (e) {
        console.error("Admin dashboard fetch failed", e)
        toast.error("Failed to load dashboard data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const cards = widgets ? [
    { 
      label: 'Active Subscribers', 
      value: widgets.active_users?.value ?? 0, 
      icon: Users, 
      color: 'text-pace-purple', 
      bg: 'bg-pace-purple/5',
      accent: 'bg-gradient-to-b from-pace-purple to-indigo-500',
      iconBorder: 'border-pace-purple/10 group-hover:border-pace-purple/30'
    },
    { 
      label: 'Total Subscribers', 
      value: widgets.monthly_users?.value ?? 0, 
      icon: ServerCog, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/5',
      accent: 'bg-gradient-to-b from-blue-400 to-indigo-600',
      iconBorder: 'border-blue-500/10 group-hover:border-blue-500/30'
    },
    { 
      label: "Today's Revenue", 
      value: `KES ${(widgets.todays_earnings?.value ?? 0).toLocaleString()}`, 
      icon: Wallet, 
      color: 'text-green-500', 
      bg: 'bg-green-500/5',
      accent: 'bg-gradient-to-b from-emerald-400 to-teal-500',
      iconBorder: 'border-green-500/10 group-hover:border-green-500/30'
    },
    { 
      label: 'Total ISPs', 
      value: widgets.isp_tenants?.value ?? 0, 
      icon: Users, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/5',
      accent: 'bg-gradient-to-b from-amber-400 to-orange-500',
      iconBorder: 'border-orange-500/10 group-hover:border-orange-500/30'
    },
    { 
      label: 'Total ISP Wallets', 
      value: `KES ${(widgets.total_wallets_balance?.value ?? 0).toLocaleString()}`, 
      icon: Wallet, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-500/5',
      accent: 'bg-gradient-to-b from-rose-500 to-red-600',
      iconBorder: 'border-indigo-500/10 group-hover:border-indigo-500/30',
      isWallet: true 
    },
  ] : []

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">Admin Portal</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Router and ISP management for the admin console.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/admin/routers" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-purple text-white rounded-xl text-sm font-medium hover:bg-pace-purple/90 transition-all">
            <Network size={16} /> Manage Routers
          </Link>
          <Link href="/admin/isps" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl text-sm font-medium hover:border-pace-purple hover:text-pace-purple transition-all">
            <Users size={16} /> Manage ISPs
          </Link>
        </div>
      </div>

      {/* Stats Cards — Real data from API */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {isLoading && !widgets ? (
          [...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "relative overflow-hidden bg-card-bg border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm min-w-0",
                i === 4 && "col-span-2 md:col-span-1"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-16 sm:w-24" />
                  <Skeleton className="h-6 w-12 sm:w-16" />
                </div>
                <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0" />
              </div>
            </div>
          ))
        ) : cards.map((card) => (
          <div 
            key={card.label} 
            onClick={() => card.isWallet && setIsWalletBlurred(!isWalletBlurred)}
            className={cn(
              "relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0",
              card.isWallet ? "col-span-2 md:col-span-1 cursor-pointer select-none" : ""
            )}
          >
            {/* Left accent color strip */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", card.accent)} />
            
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={card.label}>
                  {card.label}
                </p>
                <div className="relative mt-1.5">
                  <p className={cn(
                    "text-base sm:text-2xl font-bold text-admin-value group-hover:scale-[1.02] transition-all origin-left duration-300",
                    card.isWallet && isWalletBlurred && "blur-md"
                  )}>
                    {card.value}
                  </p>
                  {card.isWallet && (
                    <span className="text-[10px] text-pace-purple font-semibold mt-1 block">
                      {isWalletBlurred ? "Reveal" : "Hide"}
                    </span>
                  )}
                </div>
              </div>
              <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 group-hover:scale-105", card.iconBorder, card.bg)}>
                <card.icon className={cn(card.color, "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5")} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Activity Trend Chart - Spanning 2 Columns */}
        <div className="xl:col-span-2 bg-card-bg border border-pace-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-sm font-medium text-admin-value">Activity & Growth</h4>
              <p className="text-xs text-gray-400 font-normal mt-0.5">Utilization Trends</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-pace-purple" />
              <span className="text-xs font-medium text-gray-500">Revenue</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {isLoading ? <Skeleton className="w-full h-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4B1D8F" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4B1D8F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: '500' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#4B1D8F" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Transactions — Real data from database */}
        <div className="bg-card-bg border border-pace-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-admin-value">Recent Transactions</h2>
              <p className="text-xs text-admin-dim font-normal mt-0.5">Live M-Pesa collection stream</p>
            </div>
            <Link href="/admin/mpesa" className="p-2 bg-pace-bg-subtle rounded-lg text-admin-dim hover:text-pace-purple transition-all">
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-14" />
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone size={28} className="mx-auto text-admin-dim mb-3 opacity-40" />
                <p className="text-xs text-admin-dim font-medium">No transactions yet</p>
                <p className="text-[10px] text-gray-400 mt-1">Payments will appear here in realtime</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pace-bg-subtle flex items-center justify-center text-admin-dim group-hover:bg-pace-purple/5 group-hover:text-pace-purple transition-colors">
                      <Smartphone size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-admin-value">{tx.user_phone}</p>
                      <p className="text-[10px] text-admin-dim font-medium mt-0.5">{tx.mpesa_code} • {tx.time_ago}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-green-600">KES {tx.amount?.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
