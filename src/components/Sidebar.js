"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import Image from 'next/image'
import {
    LayoutDashboard, Ticket, CreditCard, Users, Network, 
    Settings, Activity, LogOut, ChevronDown, MessageSquare, BookOpen, Wallet
} from 'lucide-react'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'
import authService from '@/lib/auth'

export function Sidebar({ isSidebarOpen, setIsSidebarOpen, isMobile }) {
    const pathname = usePathname()
    const [openMenus, setOpenMenus] = useState([])
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [mounted, setMounted] = useState(false)
    const searchParams = useSearchParams()

    useEffect(() => {
        setMounted(true)
    }, [])

    const createHref = (href) => {
        if (!searchParams) return href
        const params = new URLSearchParams(searchParams)
        const keysToClear = ['phone', 'mac', 'id', 'code', 'v']
        keysToClear.forEach(key => params.delete(key))
        const queryString = params.toString()
        return queryString ? `${href}?${queryString}` : href
    }

    const user = mounted ? authService.getUser() : null

    const navigation = [
        { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { id: 'customers', name: 'Customers', href: '/dashboard/customers', icon: Users },
        { id: 'packages', name: 'Service Packages', href: '/dashboard/packages', icon: Ticket },
        { id: 'routers', name: 'MikroTik Hub', href: '/dashboard/routers', icon: Network },
        { id: 'billing', name: 'My Subscription', href: '/dashboard/billing', icon: CreditCard }, // New
        { id: 'mpesa', name: 'Payments Ledger', href: '/dashboard/mpesa', icon: Wallet },
        { id: 'staff', name: 'Staff & Policy', href: '/dashboard/staff', icon: Users },
        { id: 'expenses', name: 'Expenses Ledger', href: '/dashboard/expenses', icon: Activity },
        { id: 'reports', name: 'Intelligence Reports', href: '/dashboard/reports', icon: BookOpen },
        { id: 'logs', name: 'System Logs', href: '/dashboard/logs', icon: Activity },
        { id: 'sms', name: 'SMS Hub', href: '/dashboard/sms', icon: MessageSquare },
        { id: 'settings', name: 'System Settings', href: '/dashboard/settings', icon: Settings },
    ]

    const sidebarClass = isMobile
        ? cn(
            "fixed inset-y-0 left-0 z-50 bg-card-bg border-r border-pace-border transition-transform duration-300 w-64 shadow-2xl flex flex-col",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )
        : cn(
            "fixed inset-y-0 left-0 z-50 bg-card-bg border-r border-pace-border transition-all duration-300 flex flex-col",
            isSidebarOpen ? "w-60" : "w-16"
        );

    const showText = isMobile || isSidebarOpen;

    return (
        <>
            <aside className={sidebarClass}>
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-center border-b border-pace-border">
                    <Link href="/dashboard" className="flex items-center justify-center gap-2">
                        {showText ? (
                            <Image src="/logoc.png" alt="Pace" width={32} height={32} className="h-8 w-auto object-contain" priority />
                        ) : (
                            <span className="text-xl font-black text-pace-purple">P</span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className={cn(
                    "flex-1 overflow-y-auto custom-scrollbar space-y-1",
                    showText ? "p-3" : "px-2 py-3"
                )}>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <div key={item.id} className="space-y-0.5">
                                <Link
                                    href={createHref(item.href)}
                                    className={cn(
                                        "flex items-center rounded-xl transition-all group relative text-[13px] py-2.5 px-4 gap-3",
                                        isActive
                                            ? "bg-pace-purple text-white shadow-sm font-semibold"
                                            : "text-admin-label hover:bg-pace-bg-subtle hover:text-foreground"
                                    )}
                                >
                                    {showText && (
                                        <div className="flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden transition-opacity duration-200">
                                            <span>{item.name}</span>
                                        </div>
                                    )}
                                    {!showText && <span className={cn("text-[10px] font-black uppercase", isActive ? "text-white" : "text-pace-purple")}>{item.name[0]}</span>}
                                </Link>
                            </div>
                        )
                    })}
                </nav>

                {/* Footer Section */}
                <div className={cn(
                    "mt-auto border-t border-pace-border py-4",
                    showText ? "px-3" : "px-2"
                )}>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className={cn(
                            "w-full flex items-center text-admin-dim hover:text-red-500 transition-all rounded-xl hover:bg-red-500/10 text-[13px] font-semibold group cursor-pointer py-2.5",
                            showText ? "px-3 gap-3" : "px-0 justify-center"
                        )}
                    >
                        {showText ? <span>Sign Out</span> : <span className="text-red-500 font-bold">X</span>}
                    </button>
                </div>
            </aside>

            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Confirm Logout"
                description="Are you sure you want to sign out of the Sovereignty Hub?"
                type="danger"
                onConfirm={() => {
                    authService.logout();
                    window.location.href = '/login';
                }}
            />
        </>
    )
}
