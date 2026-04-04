"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
    Users, CreditCard, Ticket, Settings,
    Activity, FileText, Network, Receipt,
    UserRoundCheck, MessageSquare, Globe, ChevronDown,
    LogOut, LayoutDashboard, Clock, Smartphone, Bell, Code, BookOpen
} from 'lucide-react'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'

import authService from '@/lib/auth'

export function Sidebar({ isSidebarOpen, setIsSidebarOpen, isMobile, pathname }) {
    const [openMenus, setOpenMenus] = useState([])
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [mounted, setMounted] = useState(false)
    const searchParams = useSearchParams()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Helper to persist query params
    const createHref = (href) => {
        if (!searchParams) return href
        const params = new URLSearchParams(searchParams)

        // Remove specific identifiers that shouldn't persist across different pages
        const keysToClear = ['phone', 'mac', 'id', 'code', 'v']
        keysToClear.forEach(key => params.delete(key))

        const queryString = params.toString()
        return queryString ? `${href}?${queryString}` : href
    }

    const toggleMenu = (id) => {
        setOpenMenus(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        )
    }

    const user = mounted ? authService.getUser() : null
    const role = user?.type || 'user'
    const isAdmin = role === 'admin' || role === 'superadmin'
    const policies = user?.policies || []

    const hasPolicy = (policy) => isAdmin || policies.includes(policy)

    // Add body scroll lock when mobile sidebar is open
    useEffect(() => {
        if (isMobile && isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobile, isSidebarOpen]);

    const navigation = [
        { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        {
            id: 'customers',
            name: 'Customers',
            icon: Users,
            children: [
                { name: 'All Customers', href: '/dashboard/customers' },
                { name: 'Active Sessions', href: '/dashboard/customers?status=active' },
                { name: 'Add Subscriber', href: '/dashboard/customers/new' },
            ]
        },
        {
            id: 'billing',
            name: 'Finance',
            icon: CreditCard,
            children: [
                { name: 'M-Pesa Ledger', href: '/dashboard/mpesa' },
                { name: 'Business Expenses', href: '/dashboard/expenses' },
                { name: 'Financial Reports', href: '/dashboard/reports' },
            ]
        },
        {
            id: 'network',
            name: 'Infrastructure',
            icon: Network,
            children: [
                { name: 'MikroTik Routers', href: '/dashboard/routers' },
                { name: 'Service Packages', href: '/dashboard/packages' },
                { name: 'Network Alerts', href: '/dashboard/notifications' },
            ]
        },
        { id: 'sms', name: 'SMS Center', href: '/dashboard/sms', icon: Send },
        { id: 'staff', name: 'Staff & Policy', href: '/dashboard/staff', icon: ShieldCheck },
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
                    <Link href={createHref("/dashboard")} className="flex items-center justify-center gap-2">
                        {showText ? (
                            <Image
                                src="/logoc.png"
                                alt="Pace"
                                width={12}
                                height={12}
                                className="h-7 w-auto object-contain"
                                priority
                            />
                        ) : (
                            <span className="text-sm font-black text-pace-purple tracking-tighter uppercase">PPPoE Control</span>
                        )}
                    </Link>
                </div>

                {/* Navigation - Flex-1 with scroll */}
                <nav className={cn(
                    "flex-1 overflow-y-auto custom-scrollbar space-y-1",
                    showText ? "p-3" : "px-2 py-3"
                )}>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || item.children?.some(child => child.href === pathname);
                        const isExpanded = openMenus.includes(item.id);

                        return (
                            <div key={item.id} className="space-y-0.5">
                                {item.children ? (
                                    <div className="space-y-0.5">
                                        <button
                                            onClick={() => toggleMenu(item.id)}
                                            className={cn(
                                                "w-full flex items-center rounded-xl transition-all group relative text-[13px] cursor-pointer py-2.5",
                                                showText ? "px-3 gap-3" : "px-0 justify-center",
                                                isActive && !isExpanded ? "bg-pace-purple/10 text-pace-purple font-semibold" : "text-admin-label hover:bg-pace-bg-subtle hover:text-foreground"
                                            )}
                                        >
                                            <item.icon size={18} className={cn("shrink-0 transition-colors", isActive ? "text-pace-purple" : "text-admin-dim group-hover:text-admin-label")} />
                                            {showText && (
                                                <div className="flex-1 flex items-center justify-between transition-opacity duration-200">
                                                    <span className="truncate">{item.name}</span>
                                                    <ChevronDown size={14} className={cn("transition-transform duration-200 text-admin-dim", isExpanded ? "rotate-180" : "")} />
                                                </div>
                                            )}
                                        </button>
                                        {/* Submenu */}
                                        {showText && isExpanded && (
                                            <div className="ml-4 space-y-0.5 border-l border-pace-border pl-2 my-1">
                                                {item.children.map((child) => {
                                                    const isChildActive = pathname === child.href;
                                                    return (
                                                        <Link
                                                            key={child.name}
                                                            href={createHref(child.href)}
                                                            className={cn(
                                                                "block px-3 py-2 rounded-lg text-[12px] transition-all",
                                                                isChildActive
                                                                    ? "text-pace-purple font-semibold bg-pace-purple/10"
                                                                    : "text-admin-dim hover:text-foreground hover:bg-pace-bg-subtle"
                                                            )}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={createHref(item.href)}
                                        className={cn(
                                            "flex items-center rounded-xl transition-all group relative text-[13px] py-2.5",
                                            showText ? "px-3 gap-3" : "px-0 justify-center",
                                            isActive
                                                ? "bg-pace-purple text-white shadow-sm font-semibold"
                                                : "text-admin-label hover:bg-pace-bg-subtle hover:text-foreground"
                                        )}
                                    >
                                        <item.icon size={18} className={cn("shrink-0 transition-colors", isActive ? "text-white" : "text-admin-dim group-hover:text-admin-label")} />
                                        {showText && (
                                            <div className="flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden transition-opacity duration-200">
                                                <span>{item.name}</span>
                                                {item.badge && (
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium min-w-[20px] text-center",
                                                        isActive ? "bg-white/20 text-white" : "bg-pace-purple/10 text-pace-purple"
                                                    )}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </nav>

                {/* Footer Section - Outside nav to stay at bottom but part of flex layout */}
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
                        <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                        {showText && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Standardized Logout Modal */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Confirm Logout"
                description="Are you sure you want to sign out?"
                type="danger"
                icon={LogOut}
                confirmText="Sign Out"
                onConfirm={() => {
                    authService.logout();
                    window.location.href = '/login';
                }}
            />
        </>
    )
}

