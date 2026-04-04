"use client"

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
    Menu, Search, Bell, ChevronRight, X, LogOut
} from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'
import ProtectedRoute from '@/components/ProtectedRoute'
import authService from '@/lib/auth'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GlobalSearch } from '@/components/GlobalSearch'

export default function DashboardLayout({ children }) {
    const router = useRouter()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [user, setUser] = useState(null)
    const pathname = usePathname()

    // Get user data on mount
    useEffect(() => {
        const userData = authService.getUser()
        setUser(userData)
    }, [])

    // Handle screen resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false)
        }
    }, [pathname, isMobile])

    // Helper to format path name for breadcrumbs
    const getPageName = () => {
        const path = pathname.split('/').pop() || 'Summary';
        return path
            .replace(/[-_]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Handle logout
    const handleLogout = async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('pace_session_last_active')
        }
        await authService.logout()
        router.push('/login')
    }

    // Session timeout logic (10 minutes)
    useEffect(() => {
        const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
        const STORAGE_KEY = 'pace_session_last_active';

        // Check availability on mount
        const checkSession = () => {
            const lastActive = localStorage.getItem(STORAGE_KEY);
            if (lastActive) {
                const diff = Date.now() - parseInt(lastActive, 10);
                if (diff > SESSION_TIMEOUT) {
                    handleLogout();
                    return false;
                }
            }
            // If valid or new session, update timestamp
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
            return true;
        };

        const isSessionValid = checkSession();
        if (!isSessionValid) return;

        // Activity tracker
        const updateActivity = () => {
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
        };

        // Throttle updates to avoid excessive writes
        let lastUpdate = Date.now();
        const throttledUpdate = () => {
            const now = Date.now();
            if (now - lastUpdate > 30000) { // Update every 30s max on interaction
                updateActivity();
                lastUpdate = now;
            }
        };

        // Activity events
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, throttledUpdate));

        // Heartbeat (updates every minute to handle "tab closed" logic)
        // If tab is open, this keeps session alive. If closed, time freezes.
        const intervalId = setInterval(() => {
            const lastActive = localStorage.getItem(STORAGE_KEY);
            // Also check if we should timeout while open (idle) - though interaction listener above handles active usage.
            // If user receives no input but app is open, do we logout?
            // The requirement emphasizes "close tab... after 10 mins".
            // So if tab is open, we can optionally keep it alive or let it expire if idle.
            // Let's safe-guard: if we are IDLE (no interaction for 10m), we should also logout.

            if (lastActive && (Date.now() - parseInt(lastActive, 10) > SESSION_TIMEOUT)) {
                handleLogout();
            } else {
                // We don't auto-update here if we want "Idle Timeout". 
                // If we want "Keep alive if open", we would update here.
                // Assuming "Idle Timeout" covers "Close Tab Timeout", we do NOT update here.
            }
        }, 60000); // Check every minute

        // Ensure we save state on close/hide
        const handleUnload = () => {
            updateActivity();
        };
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            events.forEach(event => window.removeEventListener(event, throttledUpdate));
            clearInterval(intervalId);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);

    // Get user initials
    const getUserInitials = () => {
        if (!user || !user.name) return 'U'
        return user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background flex font-figtree text-[13px] text-foreground transition-colors duration-300">
                {/* Standardized Logout Modal */}
                <Modal
                    isOpen={showLogoutModal}
                    onClose={() => setShowLogoutModal(false)}
                    title="Confirm Logout"
                    description="Are you sure you want to sign out? This will end your current session."
                    type="danger"
                    icon={LogOut}
                    confirmText="Sign Out"
                    onConfirm={handleLogout}
                />

                {/* Mobile Overlay */}
                {isMobile && isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Component */}
                <Suspense fallback={<div className="fixed inset-y-0 left-0 w-60 bg-card-bg border-r border-pace-border z-50 animate-pulse" />}>
                    <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isMobile={isMobile} pathname={pathname} />
                </Suspense>

                {/* Main Content Area */}
                <main className={cn(
                    "flex-1 min-h-screen flex flex-col transition-all duration-300 w-full",
                    // On desktop, add margin based on sidebar state. On mobile, no margin (overlay)
                    !isMobile && (isSidebarOpen ? "ml-60" : "ml-16")
                )}>
                    {/* Header */}
                    <header className="h-16 bg-card-bg/80 backdrop-blur-md border-b border-pace-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-300">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                                title="Toggle Sidebar"
                            >
                                {isSidebarOpen && isMobile ? <X size={20} /> : <Menu size={20} />}
                            </button>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-admin-dim border-l border-pace-border pl-4 uppercase tracking-widest">
                                <span>{getPageName()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="hidden sm:block">
                                <GlobalSearch />
                            </div>
                            <div className="flex items-center gap-4 border-l border-pace-border pl-6 h-6">
                                <ThemeToggle />
                                <Link href="/dashboard/notifications" className="relative p-1.5 text-admin-dim hover:text-foreground transition-colors rounded-lg hover:bg-pace-bg-subtle">
                                    <Bell size={16} />
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full border border-background"></span>
                                </Link>
                                <div className="flex items-center gap-2.5 relative group">
                                    <div className="text-right hidden sm:block leading-none">
                                        <p className="text-[11px] font-bold text-admin-value uppercase tracking-tight">{user?.name || 'User'}</p>
                                        <p className="text-[9px] text-admin-dim font-medium uppercase tracking-tighter opacity-70 mt-0.5">{user?.type || 'user'}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowLogoutModal(true)}
                                        className="w-9 h-9 rounded-xl bg-pace-bg-subtle border border-pace-border flex items-center justify-center text-[10px] font-bold text-admin-dim hover:bg-card-bg hover:text-pace-purple transition-all"
                                        title="Account"
                                    >
                                        {getUserInitials()}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="p-3 sm:p-6 flex-1 overflow-x-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
