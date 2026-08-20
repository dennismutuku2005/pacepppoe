"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { TrendingUp, RefreshCw, Eye, EyeOff, ShieldAlert, Coins, AreaChart as AreaIcon, PieChart as PieIcon, LineChart as LineIcon, DollarSign } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { mpesaService } from '@/services/admin/mpesa'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminFinancialAnalyticsPage() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMasked, setIsMasked] = useState(true) // Privacy masking toggled by default

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
    <div className="space-y-6 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-pace-border pb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-value tracking-tight">Financial Analytics Dashboard</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Audit paybill revenue charts, cash distributions, and monthly income curves.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 w-full sm:flex-1">
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="p-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl hover:bg-pace-purple/5 hover:text-pace-purple transition-all disabled:opacity-50 shrink-0"
              title="Refresh Analytics"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>

            {/* Toggle Privacy Mask Button */}
            <button
              onClick={() => setIsMasked(!isMasked)}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-[0.98] shrink-0",
                isMasked 
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/25" 
                  : "bg-pace-bg-subtle text-admin-dim border-pace-border hover:border-pace-purple hover:text-pace-purple"
              )}
            >
              {isMasked ? (
                <>
                  <EyeOff size={16} /> Reveal Financials
                </>
              ) : (
                <>
                  <Eye size={16} /> Mask Financials
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Warning privacy status notice banner */}
      {isMasked && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-amber-500 max-w-xl">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Privacy Mask Engaged:</span> High-sensitivity financial data, transaction figures, and line graphs are hidden. Toggle visibility using the control at the top right to verify audit figures.
          </div>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue Volume', value: totals.volume, icon: Coins, color: 'text-emerald-500', bg: 'bg-emerald-500/10', accent: 'bg-gradient-to-b from-emerald-400 to-teal-500', isCurrency: true },
          { label: 'Completed Transactions', value: totals.transactionCount, icon: AreaIcon, color: 'text-pace-purple', bg: 'bg-pace-purple/10', accent: 'bg-gradient-to-b from-pace-purple to-indigo-500', isCurrency: false },
          { label: 'Average Paybill Ticket', value: totals.averageTicket, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10', accent: 'bg-gradient-to-b from-blue-400 to-indigo-600', isCurrency: true }
        ].map((card) => (
          <div key={card.label} className="relative overflow-hidden group bg-gradient-to-br from-card-bg to-card-bg-subtle/70 border border-pace-border rounded-2xl p-5 shadow-sm hover:border-pace-purple/30 hover:shadow-md transition-all duration-300 min-w-0">
            {/* Left accent color strip */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", card.accent)} />
            
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-admin-dim group-hover:text-admin-value transition-colors duration-300 truncate" title={card.label}>
                  {card.label}
                </p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-pace-bg-subtle rounded-md animate-pulse mt-2" />
                ) : (
                  <p className={cn(
                    "text-xl sm:text-2xl font-bold text-admin-value mt-2 tracking-tight group-hover:scale-[1.02] transition-all origin-left duration-300",
                    isMasked && "blur-md"
                  )}>
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
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-pace-border pb-4 mb-6">
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-admin-dim flex items-center gap-1.5">
                <AreaIcon size={14} className="text-pace-purple" /> Daily Revenue Influx
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Area graph of amount received per day.</p>
            </div>
          </div>

          <div className="h-80 w-full relative">
            {isMasked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card-bg/60 backdrop-blur-md z-10 p-6 text-center border border-pace-border/50 rounded-xl">
                <ShieldAlert size={32} className="text-amber-500 mb-2" />
                <p className="text-xs font-bold text-admin-value">Financial Area Graph Masked</p>
                <p className="text-[10px] text-gray-400 mt-1">Unmask the profile at the top header to render active charts.</p>
              </div>
            ) : null}
            
            {isLoading ? (
              <div className="h-full w-full bg-pace-bg-subtle rounded-xl animate-pulse" />
            ) : dailyData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-admin-dim">
                No transaction data available to plot chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D3A" vertical={false} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E1E2A', borderColor: '#2D2D3A', borderRadius: '12px' }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ color: '#8B5CF6', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="amount" name="Revenue Volume" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Line Chart: Cumulative Income Trend */}
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-pace-border pb-4 mb-6">
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-admin-dim flex items-center gap-1.5">
                <LineIcon size={14} className="text-emerald-500" /> Cumulative Cash Growth
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Line graph displaying cumulative growth of funds.</p>
            </div>
          </div>

          <div className="h-80 w-full relative">
            {isMasked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card-bg/60 backdrop-blur-md z-10 p-6 text-center border border-pace-border/50 rounded-xl">
                <ShieldAlert size={32} className="text-amber-500 mb-2" />
                <p className="text-xs font-bold text-admin-value">Financial Line Graph Masked</p>
                <p className="text-[10px] text-gray-400 mt-1">Unmask the profile at the top header to render active charts.</p>
              </div>
            ) : null}

            {isLoading ? (
              <div className="h-full w-full bg-pace-bg-subtle rounded-xl animate-pulse" />
            ) : cumulativeData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-admin-dim">
                No transaction data available to plot chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D3A" vertical={false} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E1E2A', borderColor: '#2D2D3A', borderRadius: '12px' }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ color: '#10B981', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="cumulativeAmount" name="Total Cumulative" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart: Distribution across ISPs */}
        <div className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm relative overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-pace-border pb-4 mb-6">
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-admin-dim flex items-center gap-1.5">
                <PieIcon size={14} className="text-blue-500" /> Revenue Share by Operator
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Cash distribution percentage mapped per active ISP tenant.</p>
            </div>
          </div>

          <div className="h-80 w-full relative flex flex-col md:flex-row items-center justify-center gap-6">
            {isMasked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card-bg/60 backdrop-blur-md z-10 p-6 text-center border border-pace-border/50 rounded-xl">
                <ShieldAlert size={32} className="text-amber-500 mb-2" />
                <p className="text-xs font-bold text-admin-value">Financial Share Chart Masked</p>
                <p className="text-[10px] text-gray-400 mt-1">Unmask the profile at the top header to render active charts.</p>
              </div>
            ) : null}

            {isLoading ? (
              <div className="h-full w-full bg-pace-bg-subtle rounded-xl animate-pulse" />
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
                        contentStyle={{ backgroundColor: '#1E1E2A', borderColor: '#2D2D3A', borderRadius: '12px' }}
                        itemStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Distribution Legend List */}
                <div className="w-full md:w-1/2 space-y-3 font-figtree">
                  {ispDistributionData.map((entry, index) => {
                    const totalVal = ispDistributionData.reduce((sum, e) => sum + e.value, 0)
                    const percentage = totalVal > 0 ? ((entry.value / totalVal) * 100).toFixed(1) : 0
                    return (
                      <div key={entry.name} className="flex items-center justify-between p-2.5 rounded-xl border border-pace-border/50 bg-pace-bg-subtle/50 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-3 h-3 rounded-md shrink-0" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                          />
                          <span className="font-semibold text-admin-value">{entry.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-admin-value">{percentage}%</span>
                          <span className="text-[10px] text-admin-dim block mt-0.5">{formatCurrency(entry.value)}</span>
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
