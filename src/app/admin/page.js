import Link from 'next/link'
import { Network, Users, ShieldCheck, ServerCog } from 'lucide-react'
import { mockRouters, mockCustomers } from '@/services/mockData'

const uniqueRouters = new Set(mockCustomers.map((customer) => customer.router)).size
const onlineRouters = mockRouters.filter((router) => router.status === 'online').length
const offlineRouters = mockRouters.filter((router) => router.status !== 'online').length
const totalSubscribers = mockCustomers.length

export default function AdminHomePage() {
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
          <Link href="/admin/users" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pace-bg-subtle text-admin-dim border border-pace-border rounded-xl text-sm font-medium hover:border-pace-purple hover:text-pace-purple transition-all">
            <Users size={16} /> Manage Users
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Online Routers', value: onlineRouters, icon: Network, badge: 'status' },
          { label: 'Offline Routers', value: offlineRouters, icon: ShieldCheck, badge: 'alert' },
          { label: 'Subscriber Count', value: totalSubscribers, icon: Users, badge: 'info' },
          { label: 'Managed Points', value: uniqueRouters, icon: ServerCog, badge: 'action' }
        ].map((card) => (
          <div key={card.label} className="bg-card-bg border border-pace-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="text-sm font-semibold text-admin-value">{card.label}</div>
              <div className="w-10 h-10 rounded-2xl bg-pace-bg-subtle flex items-center justify-center text-pace-purple">
                <card.icon size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold text-admin-value tracking-tight">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-admin-value">Infrastructure Summary</h2>
              <p className="text-[10px] text-admin-dim uppercase tracking-wide mt-1">View health and operations at a glance</p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-pace-purple">Realtime</span>
          </div>
          <div className="space-y-3">
            {mockRouters.map((router) => (
              <div key={router.id} className="rounded-2xl border border-pace-border bg-pace-bg-subtle p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-admin-value">{router.name}</p>
                  <p className="text-[10px] text-admin-dim uppercase tracking-wider">{router.ip} · {router.model}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-admin-value tabular-nums">{router.users} users</p>
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${router.status === 'online' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    {router.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card-bg border border-pace-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-admin-value mb-4">ISP Overview</h2>
          <p className="text-xs text-admin-dim leading-relaxed">Manage partner ISPs, review account health, and route provisioning status from one place.</p>
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-pace-border bg-white p-4">
              <div className="text-xs uppercase tracking-[0.35em] text-admin-dim font-bold">ISP Partners</div>
              <div className="text-3xl font-bold text-admin-value mt-3">4</div>
            </div>
            <div className="rounded-2xl border border-pace-border bg-white p-4">
              <div className="text-xs uppercase tracking-[0.35em] text-admin-dim font-bold">Service Regions</div>
              <div className="text-3xl font-bold text-admin-value mt-3">7</div>
            </div>
            <div className="rounded-2xl border border-pace-border bg-white p-4">
              <div className="text-xs uppercase tracking-[0.35em] text-admin-dim font-bold">Pending Reviews</div>
              <div className="text-3xl font-bold text-admin-value mt-3">1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
