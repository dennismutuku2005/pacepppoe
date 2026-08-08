"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, LayoutDashboard, Network, Users, Wallet, FileText, Activity, AlertCircle } from 'lucide-react'
import { Modal } from '@/components/Modal'
import ProtectedRoute from '@/components/ProtectedRoute'
import authService from '@/lib/auth'
import { cn } from '@/lib/utils'

const ADMIN_NAVIGATION = [
  { id: 'overview', name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { id: 'dashboard', name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { id: 'routers', name: 'Routers', href: '/admin/routers', icon: Network },
  { id: 'mpesa', name: 'Accounts', href: '/admin/mpesa', icon: Wallet },
  { id: 'reports', name: 'Reports', href: '/admin/reports', icon: FileText },
  { id: 'logs', name: 'Audit Logs', href: '/admin/logs', icon: FileText },
  { id: 'hotspot', name: 'Hotspot Logs', href: '/admin/logs/hotspot', icon: AlertCircle },
  { id: 'isps', name: 'ISP Management', href: '/admin/isps', icon: Users }
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdminVerified, setIsAdminVerified] = useState(false)
  const [hasCheckedAdmin, setHasCheckedAdmin] = useState(false)

  useEffect(() => {
    const userData = authService.getUser()
    setUser(userData)
    const isAdmin = userData && (userData.type === 'admin' || userData.type === 'superadmin')
    if (!isAdmin) {
      router.push('/login')
      setHasCheckedAdmin(true)
      return
    }
    setIsAdminVerified(true)
    setHasCheckedAdmin(true)
  }, [router])

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setIsSidebarOpen(!mobile)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [pathname, isMobile])

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pace_session_last_active')
    }
    await authService.logout()
    router.push('/login')
  }

  const getUserInitials = () => {
    if (!user || !user.name) return 'AD'
    return user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const getPageName = () => {
    const path = pathname?.split('/').pop() || 'Overview'
    return path
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const showText = isMobile || isSidebarOpen
  const sidebarClass = isMobile
    ? cn(
        'fixed inset-y-0 left-0 z-50 bg-card-bg border-r border-pace-border transition-transform duration-300 w-64 flex flex-col shadow-sm',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )
    : cn(
        'fixed inset-y-0 left-0 z-50 bg-card-bg border-r border-pace-border transition-all duration-300 flex flex-col shadow-sm',
        isSidebarOpen ? 'w-60' : 'w-16'
      )

  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobile, isSidebarOpen])

  if (!hasCheckedAdmin) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex font-figtree text-[13px] text-foreground transition-colors duration-300">
        <Modal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          title="Confirm Logout"
          description="Are you sure you want to sign out of the admin portal?"
          type="danger"
          icon={LogOut}
          confirmText="Sign Out"
          onConfirm={handleLogout}
        />

        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside className={sidebarClass}>
          <div className="h-16 flex items-center justify-center border-b border-pace-border px-3">
            <Link href="/admin" className="flex items-center gap-2 w-full">
              {showText ? (
                <span className="text-lg font-black tracking-tight text-admin-value">Admin Portal</span>
              ) : (
                <span className="text-lg font-black text-admin-value">AP</span>
              )}
            </Link>
          </div>

          <nav className={cn('flex-1 overflow-y-auto custom-scrollbar', showText ? 'p-3' : 'px-2 py-3')}>
            {ADMIN_NAVIGATION.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-center transition-all rounded-xl text-[13px] py-2',
                    showText ? 'px-3 gap-3' : 'px-0 justify-center',
                    isActive
                      ? 'bg-pace-purple text-white shadow-sm font-medium'
                      : 'text-admin-label hover:bg-pace-bg-subtle hover:text-foreground'
                  )}
                >
                  <item.icon size={18} className={cn(isActive ? 'text-white' : 'text-admin-dim')} />
                  {showText && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          <div className={cn('mt-auto border-t border-pace-border py-4', showText ? 'px-3' : 'px-2')}>
            <button
              onClick={() => setShowLogoutModal(true)}
              className={cn(
                'w-full flex items-center rounded-xl transition-all text-[13px] py-2.5',
                showText ? 'px-3 gap-3 justify-start' : 'px-0 justify-center',
                'text-admin-dim hover:text-red-500 hover:bg-red-500/10'
              )}
            >
              <LogOut size={18} />
              {showText && <span>Sign Out</span>}
            </button>

            {showText && (
              <div className="mt-4 px-2 py-3 rounded-2xl bg-pace-bg-subtle border border-pace-border text-[12px] text-admin-dim">
                <p className="font-semibold text-admin-value">{user?.name || 'Administrator'}</p>
                <p className="mt-1 text-xs uppercase tracking-widest">{user?.type || 'admin'}</p>
              </div>
            )}
          </div>
        </aside>

        <main
          className={cn(
            'flex-1 min-h-screen flex flex-col transition-all duration-300',
            !isMobile && (isSidebarOpen ? 'ml-60' : 'ml-16')
          )}
        >
          <header className="h-16 bg-card-bg/80 backdrop-blur-md border-b border-pace-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-admin-dim hover:text-admin-value hover:bg-pace-bg-subtle transition-colors"
              >
                {isSidebarOpen && isMobile ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-admin-dim">
                {getPageName()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-admin-value">{user?.name || 'Admin User'}</span>
                <span className="text-[10px] uppercase tracking-[0.35em] text-admin-dim">{user?.type || 'administrator'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-pace-bg-subtle border border-pace-border flex items-center justify-center text-[11px] font-bold text-admin-dim">
                {getUserInitials()}
              </div>
            </div>
          </header>

          <div className="p-3 sm:p-6 flex-1 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
