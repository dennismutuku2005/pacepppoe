"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import Image from 'next/image'
import {
    Users, CreditCard, Ticket, Settings,
    Activity, FileText, Network, Receipt,
    UserRoundCheck, MessageSquare, Globe, ChevronDown,
    LogOut, LayoutDashboard, Clock, Smartphone, Bell,
    Wallet, ShieldCheck, LifeBuoy, Layers
} from 'lucide-react'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'

import authService from '@/lib/auth'

export function Sidebar({ isSidebarOpen, setIsSidebarOpen, isMobile }) {
    const pathname = usePathname()
    const [openMenus, setOpenMenus] = useState([])
    const [showLogoutModal, setShowLogoutModal] = useState(false)


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

    // Move navigation logic to useMemo and ensure it's stable during hydration
    const searchParams = useSearchParams()
    const navigation = useMemo(() => {
        const user = typeof window !== 'undefined' ? authService.getUser() : { type: 'admin' }
        const isAdmin = !user || user.type === 'admin' || user.type === 'superadmin'
        const hasPolicy = (policy) => {
            if (typeof window === 'undefined') return true;
            return authService.hasPolicy(policy);
        };

        return [
            ...(hasPolicy('view_dashboard') ? [{ id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] : []),

            ...((hasPolicy('manage_customers') || hasPolicy('view_active_users')) ? [{
                id: 'subscribers',
                name: 'Subscribers',
                icon: Users,
                children: [
                    ...(hasPolicy('manage_customers') ? [{ name: 'Subscriber List', href: '/dashboard/customers' }] : []),
                    ...(hasPolicy('view_active_users') ? [{ name: 'Active Connections', href: '/dashboard/customers/active' }] : []),
                ]
            }] : []),

            ...(hasPolicy('view_routers') ? [
                { id: 'routers', name: 'Routers', href: '/dashboard/routers', icon: Network },
            ] : []),

            ...(hasPolicy('manage_packages') ? [
                { id: 'packages', name: 'Service Plans', href: '/dashboard/packages', icon: Ticket },
                { id: 'pools', name: 'PPPoE Pools', href: '/dashboard/pools', icon: Layers },
            ] : []),

            ...((hasPolicy('view_payments') || hasPolicy('view_mpesa') || hasPolicy('manage_expenses') || hasPolicy('view_reports')) ? [{
                id: 'finance',
                name: 'Financials',
                icon: CreditCard,
                children: [
                    ...(hasPolicy('view_payments') ? [{ name: 'Transactions', href: '/dashboard/payments' }] : []),
                    ...(hasPolicy('view_mpesa') ? [{ name: 'M-Pesa Ledger', href: '/dashboard/mpesa' }] : []),
                    ...(hasPolicy('view_reports') ? [{ name: 'Financial Reports', href: '/dashboard/reports' }] : []),
                    ...(hasPolicy('manage_expenses') ? [{ name: 'Expenses', href: '/dashboard/expenses' }] : []),
                ]
            }] : []),

            ...(hasPolicy('view_tickets') ? [
                { id: 'tickets', name: 'Support Tickets', href: '/dashboard/tickets', icon: LifeBuoy },
            ] : []),

            ...(hasPolicy('view_sms') ? [
                { id: 'sms', name: 'SMS Center', href: '/dashboard/sms', icon: MessageSquare },
            ] : []),

            ...((isAdmin || hasPolicy('system_config')) ? [{
                id: 'system',
                name: 'System',
                icon: Settings,
                children: [
                    ...(hasPolicy('system_config') ? [{ name: 'Gateway Config', href: '/dashboard/payment-config' }] : []),
                    ...(hasPolicy('view_logs') ? [{ name: 'Activity Logs', href: '/dashboard/logs' }] : []),
                ]
            }] : []),

            { id: 'profile', name: 'My Profile', href: '/dashboard/profile', icon: UserRoundCheck },
        ]
    }, [])

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

    const sidebarClass = isMobile
        ? cn(
            "fixed inset-y-0 left-0 z-50 bg-card-bg border-r border-pace-border transition-transform duration-300 w-64 flex flex-col font-figtree shadow-sm",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )
        : cn(
            "fixed inset-y-0 left-0 z-50 bg-card-bg border-r border-pace-border transition-all duration-300 flex flex-col font-figtree shadow-sm",
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
                                width={140}
                                height={46}
                                className="h-8 w-auto object-contain"
                                priority
                            />
                        ) : (
                            <Image
                                src="/logoc.png"
                                alt="Pace"
                                width={40}
                                height={40}
                                className="h-7 w-auto object-contain"
                                priority
                            />
                        )}
                    </Link>
                </div>

                {/* Navigation - Flex-1 with scroll */}
                <nav 
                    suppressHydrationWarning
                    className={cn(
                        "flex-1 overflow-y-auto custom-scrollbar space-y-1",
                        showText ? "p-3" : "px-2 py-3"
                    )}
                >
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
                                                "w-full flex items-center rounded-xl transition-all group relative text-[13px] cursor-pointer py-2",
                                                showText ? "px-3 gap-3" : "px-0 justify-center",
                                                isActive && !isExpanded ? "bg-pace-purple/5 text-pace-purple font-medium" : "text-admin-label hover:bg-pace-bg-subtle hover:text-foreground"
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
                                                                "block px-3 py-1.5 rounded-lg text-[12px] transition-all",
                                                                isChildActive
                                                                    ? "text-pace-purple font-medium bg-pace-purple/10"
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
                                            "flex items-center rounded-xl transition-all group relative text-[13px] py-2",
                                            showText ? "px-3 gap-3" : "px-0 justify-center",
                                            isActive
                                                ? "bg-pace-purple text-white shadow-sm font-medium"
                                                : "text-admin-label hover:bg-pace-bg-subtle hover:text-foreground"
                                        )}
                                    >
                                        <item.icon size={18} className={cn("shrink-0 transition-colors", isActive ? "text-white" : "text-admin-dim group-hover:text-admin-label")} />
                                        {showText && (
                                            <div className="flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden transition-opacity duration-200">
                                                <span>{item.name}</span>
                                            </div>
                                        )}
                                    </Link>
                                )}
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
                            "w-full flex items-center text-admin-dim hover:text-red-500 transition-all rounded-xl hover:bg-red-500/10 text-[13px] font-medium group cursor-pointer py-2.5",
                            showText ? "px-3 gap-3" : "px-0 justify-center"
                        )}
                    >
                        <LogOut size={18} className="transition-transform group-hover:translate-x-1" />
                        {showText && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Standardized Logout Modal */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Sign Out"
                description="Are you sure you want to terminate your session?"
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
