"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { TrendingUp, RefreshCw, Coins, AreaChart as AreaIcon, PieChart as PieIcon, LineChart as LineIcon, DollarSign } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { mpesaService } from '@/services/admin/mpesa'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminFinancialAnalyticsPage() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load transactions data
  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await mpesaService.getMpesaTransactions()
      if (res && res.status === 'success') {
        // Only aggregate completed transactions for financial charts
        setTransactions(res.data || [])
      } else {
        toast.error(res?.message || 'Failed to retrieve transactions for analytics')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error fetching analytics details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleReload = () => {
    loadData()
  }

  // Filter completed payments
  const completedTx = useMemo(() => {
    return transactions.filter(t => t.status.toLowerCase() === 'completed')
  }, [transactions])

  // Aggregate daily transactions (Area chart dataset)
  const dailyData = useMemo(() => {
    const datesMap = {}
    
    // Sort transactions chronologically
    const sorted = [...completedTx].sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date))
    
    sorted.forEach((tx) => {
      const dateStr = new Date(tx.transaction_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      datesMap[dateStr] = (datesMap[dateStr] || 0) + parseFloat(tx.amount || 0)
    })

    return Object.keys(datesMap).map(date => ({
      date,
      amount: parseFloat(datesMap[date].toFixed(2))
    }))
  }, [completedTx])

  // Cumulative daily income dataset (Line chart dataset)
  const cumulativeData = useMemo(() => {
    let sum = 0
    return dailyData.map(d => {
      sum += d.amount
      return {
        date: d.date,
        cumulativeAmount: parseFloat(sum.toFixed(2))
      }
    })
  }, [dailyData])

  // Aggregate total received amount per ISP operator (Pie chart dataset)
  const ispDistributionData = useMemo(() => {
    const distribution = {}
    completedTx.forEach((tx) => {
      const name = tx.isp_name || 'Admin / Direct'
      distribution[name] = (distribution[name] || 0) + parseFloat(tx.amount || 0)
    })

    return Object.keys(distribution).map((isp) => ({
      name: isp,
      value: parseFloat(distribution[isp].toFixed(2))
    })).sort((a, b) => b.value - a.value)
  }, [completedTx])

  // Overall financial sums
  const totals = useMemo(() => {
    const volume = completedTx.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    const transactionCount = completedTx.length
    const averageTicket = transactionCount > 0 ? (volume / transactionCount) : 0

    return { volume, transactionCount, averageTicket }
  }, [completedTx])

  // Custom colors for Pie chart segments
  const COLORS = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#6366F1']

  const formatCurrency = (val) => {
    return 'KES ' + parseFloat(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  return (
    <div className="space-y-6 font-figtree animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">Financial Analytics Dashboard</h1>
          <p className="text-xs font-medium text-admin-dim mt-1">Audit paybill revenue charts, cash distributions, and monthly income curves.</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReload}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-card-bg hover:text-admin-value transition-all disabled:opacity-50 text-xs font-medium cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue Volume', value: totals.volume, icon: Coins, color: 'text-emerald-500', bg: 'bg-emerald-500/10', accent: 'bg-gradient-to-b from-emerald-400 to-teal-500', isCurrency: true },
          { label: 'Completed Transactions', value: totals.transactionCount, icon: AreaIcon, color: 'text-pace-purple', bg: 'bg-pace-purple/10', accent: 'bg-gradient-to-b from-pace-purple to-indigo-500', isCurrency: false },
          { label: 'Average Paybill Ticket', value: totals.averageTicket, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10', accent: 'bg-gradient-to-b from-blue-400 to-indigo-600', isCurrency: true }
        ].map((card) => (
          <div key={card.label} className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-5 shadow-xs hover:border-pace-purple/30 hover:shadow-sm transition-all duration-300 min-w-0">
            {/* Left accent color strip */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", card.accent)} />
            
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={card.label}>
                  {card.label}
                </p>
                {isLoading ? (
                  <div className="h-7 w-28 bg-pace-bg-subtle rounded-md animate-pulse mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-admin-value mt-2 tracking-tight group-hover:scale-[1.01] transition-transform origin-left duration-300">
                    {card.isCurrency ? formatCurrency(card.value) : card.value}
                  </p>
                )}
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-pace-border/5 bg-pace-bg-subtle shrink-0">
                <card.icon className={cn(card.color, "w-4 h-4")} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Area Chart: Daily Amount Received */}
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-pace-border pb-4 mb-6">
            <div>
              <h3 className="text-xs font-semibold text-admin-value flex items-center gap-1.5">
                <AreaIcon size={14} className="text-pace-purple" /> Daily Revenue Influx
              </h3>
              <p className="text-[11px] text-admin-dim mt-0.5">Area graph of amount received per day.</p>
            </div>
          </div>

          <div className="h-80 w-full relative">
            {isLoading ? (
              <div className="h-full w-full bg-pace-bg-subtle/70 rounded-xl animate-pulse" />
            ) : dailyData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-admin-dim">
                No transaction data available to plot chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card-bg, #1E1E2A)', borderColor: 'var(--color-pace-border, #2D2D3A)', borderRadius: '12px', fontSize: '11px' }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                    itemStyle={{ color: '#8B5CF6' }}
                  />
                  <Area type="monotone" dataKey="amount" name="Revenue Volume" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Line Chart: Cumulative Income Trend */}
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-pace-border pb-4 mb-6">
            <div>
              <h3 className="text-xs font-semibold text-admin-value flex items-center gap-1.5">
                <LineIcon size={14} className="text-emerald-500" /> Cumulative Cash Growth
              </h3>
              <p className="text-[11px] text-admin-dim mt-0.5">Line graph displaying cumulative growth of funds.</p>
            </div>
          </div>

          <div className="h-80 w-full relative">
            {isLoading ? (
              <div className="h-full w-full bg-pace-bg-subtle/70 rounded-xl animate-pulse" />
            ) : cumulativeData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-admin-dim">
                No transaction data available to plot chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card-bg, #1E1E2A)', borderColor: 'var(--color-pace-border, #2D2D3A)', borderRadius: '12px', fontSize: '11px' }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                    itemStyle={{ color: '#10B981' }}
                  />
                  <Line type="monotone" dataKey="cumulativeAmount" name="Total Cumulative" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart: Distribution across ISPs */}
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-xs relative overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-pace-border pb-4 mb-6">
            <div>
              <h3 className="text-xs font-semibold text-admin-value flex items-center gap-1.5">
                <PieIcon size={14} className="text-blue-500" /> Revenue Share by Operator
              </h3>
              <p className="text-[11px] text-admin-dim mt-0.5">Cash distribution percentage mapped per active ISP tenant.</p>
            </div>
          </div>

          <div className="h-80 w-full relative flex flex-col md:flex-row items-center justify-center gap-6">
            {isLoading ? (
              <div className="h-full w-full bg-pace-bg-subtle/70 rounded-xl animate-pulse" />
            ) : ispDistributionData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-admin-dim">
                No operator transaction records.
              </div>
            ) : (
              <>
                <div className="w-full md:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ispDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {ispDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-card-bg, #1E1E2A)', borderColor: 'var(--color-pace-border, #2D2D3A)', borderRadius: '12px', fontSize: '11px' }}
                        itemStyle={{ color: '#E2E8F0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Distribution Legend List */}
                <div className="w-full md:w-1/2 space-y-2.5 font-figtree max-h-72 overflow-y-auto pr-1">
                  {ispDistributionData.map((entry, index) => {
                    const totalVal = ispDistributionData.reduce((sum, e) => sum + e.value, 0)
                    const percentage = totalVal > 0 ? ((entry.value / totalVal) * 100).toFixed(1) : 0
                    return (
                      <div key={entry.name} className="flex items-center justify-between p-2.5 rounded-xl border border-pace-border/60 bg-pace-bg-subtle/60 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div 
                            className="w-3 h-3 rounded-md shrink-0" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                          />
                          <span className="font-semibold text-admin-value truncate">{entry.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-admin-value">{percentage}%</span>
                          <span className="text-[11px] font-mono text-admin-dim block mt-0.5">{formatCurrency(entry.value)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
