"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, ChevronRight, LayoutDashboard, Clock, Ticket, CreditCard, Users, Globe, Network, Settings, Smartphone, Bell, Activity, PlusCircle, Unlock, Fingerprint, Command } from 'lucide-react'
import { cn } from '@/lib/utils'
import authService from '@/lib/auth'

const SEARCH_ITEMS = [
    { id: 'p1', type: 'page', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, keywords: ['home', 'summary', 'overview', 'main'] },
    { id: 'p2', type: 'page', name: 'Entries', href: '/dashboard/entries', icon: Clock, keywords: ['logs', 'history', 'connections', 'activity'] },
    { id: 'p3', type: 'page', name: 'Prepaid Plans', href: '/dashboard/prepaid/plans', icon: Ticket, keywords: ['packages', 'pricing', 'tiers', 'bandwidth'] },
    { id: 'p4', type: 'page', name: 'Prepaid Vouchers', href: '/dashboard/prepaid/vouchers', icon: Ticket, keywords: ['tokens', 'scratch cards', 'pins', 'codes'] },
    { id: 'p5', type: 'page', name: 'Prepaid Users', href: '/dashboard/prepaid/users', icon: Ticket, keywords: ['active accounts', 'hotspot users', 'subscribers'] },
    { id: 'p6', type: 'page', name: 'Income', href: '/dashboard/income', icon: CreditCard, keywords: ['revenue', 'sales', 'earnings', 'payments', 'money'] },
    { id: 'p7', type: 'page', name: 'Customer List', href: '/dashboard/customers', icon: Users, keywords: ['clients', 'members', 'directory', 'phone numbers'] },
    { id: 'p8', type: 'page', name: 'Block STK', href: '/dashboard/customers/block-stk', icon: Users, keywords: ['blacklist', 'fraud', 'security', 'mpesa block'] },
    { id: 'p9', type: 'page', name: 'Hotspot Theme', href: '/dashboard/themes', icon: Globe, keywords: ['design', 'appearance', 'portal', 'branding', 'ui'] },
    { id: 'p10', type: 'page', name: 'Routers', href: '/dashboard/routers', icon: Network, keywords: ['mikrotik', 'gateways', 'hardware', 'devices', 'nodes'] },
    { id: 'p11', type: 'page', name: 'System Config', href: '/dashboard/config', icon: Settings, keywords: ['core', 'api', 'links', 'setup', 'backend'] },
    { id: 'p12', type: 'page', name: 'M-Pesa Transactions', href: '/dashboard/mpesa', icon: Smartphone, keywords: ['stk push', 'payments', 'mobile money', 'safaricom'] },
    { id: 'p13', type: 'page', name: 'Notifications', href: '/dashboard/notifications', icon: Bell, keywords: ['alerts', 'messages', 'updates', 'unread'] },
    { id: 'p14', type: 'page', name: 'System Logs', href: '/dashboard/logs', icon: Activity, keywords: ['debug', 'events', 'audit', 'errors', 'status'] },
    { id: 'p15', type: 'page', name: 'Settings', href: '/dashboard/settings', icon: Settings, keywords: ['profile', 'password', 'account', 'security'] },
]

const QUICK_ACTIONS = [
    { id: 'a1', type: 'action', name: 'New Prepaid Plan', href: '/dashboard/prepaid/plans?action=create', icon: PlusCircle, keywords: ['add', 'create', 'new plan'] },
    { id: 'a2', type: 'action', name: 'Generate Vouchers', href: '/dashboard/prepaid/vouchers?action=generate', icon: Ticket, keywords: ['bulk', 'creation', 'pins'] },
    { id: 'a3', type: 'action', name: 'Security Control', href: '/dashboard/customers/block-stk', icon: Fingerprint, keywords: ['stk', 'fraud', 'blocking'] },
]


export function GlobalSearch() {
    const router = useRouter()
    const pathname = usePathname()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const wrapperRef = useRef(null)
    const inputRef = useRef(null)

    // Keyboard shortcut to focus (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }
        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [])

    const [user, setUser] = useState(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setUser(authService.getUser())
    }, [])

    const role = user?.type || 'user'
    const isAdmin = role === 'admin' || role === 'superadmin'
    const policies = user?.policies || []

    const hasPolicy = (p) => isAdmin || policies.includes(p)

    useEffect(() => {
        const searchTerm = query.toLowerCase().trim()

        if (!searchTerm) {
            // Suggest actions when focused but empty
            setResults(QUICK_ACTIONS.slice(0, 3))
            setIsOpen(false)
            return
        }

        // 1. Check if it's a phone number (min 4 digits)
        const isNumeric = /^\d+$/.test(searchTerm)
        if (isNumeric && searchTerm.length >= 4) {
            setResults([{
                id: 'entity-phone',
                type: 'entity',
                name: `View History: ${searchTerm}`,
                href: `/dashboard/customer-history?phone=${searchTerm}`,
                icon: Clock,
                isEntity: true
            }])
            setIsOpen(true)
            return
        }

        // 2. Search Pages & Actions
        const filteredPages = SEARCH_ITEMS.filter(item => {
            const matchesQuery = item.name.toLowerCase().includes(searchTerm) ||
                item.keywords.some(k => k.toLowerCase().includes(searchTerm));
            
            if (!matchesQuery) return false;

            // Policy Checks
            if (item.href === '/dashboard/income') return hasPolicy('view_income')
            if (item.href === '/dashboard/mpesa') return hasPolicy('view_income')
            if (item.href === '/dashboard/staff') return hasPolicy('manage_users')
            if (item.href === '/dashboard/routers') return hasPolicy('view_routers')
            if (item.href.includes('/dashboard/prepaid')) return hasPolicy('create_voucher')
            if (item.href.includes('/dashboard/customers')) return hasPolicy('manage_customers')
            
            return true;
        })

        const filteredActions = QUICK_ACTIONS.filter(item => {
            const matchesQuery = item.name.toLowerCase().includes(searchTerm) ||
                item.keywords.some(k => k.toLowerCase().includes(searchTerm));

            if (!matchesQuery) return false;

            if (item.href.includes('vouchers?action=generate')) return hasPolicy('create_voucher')
            if (item.href.includes('plans?action=create')) return hasPolicy('create_voucher')
            
            return true;
        })

        const finalResults = [...filteredActions, ...filteredPages].slice(0, 6)

        setResults(finalResults)
        setIsOpen(finalResults.length > 0)
        setActiveIndex(0)
    }, [query, mounted])

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (item) => {
        router.push(item.href)
        setQuery('')
        setIsOpen(false)
        inputRef.current?.blur()
    }

    const handleKeyDown = (e) => {
        if (!isOpen && e.key === 'ArrowDown' && query.trim() === '') {
            setIsOpen(true)
            return
        }

        if (!isOpen) return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(prev => (prev + 1) % results.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(prev => (prev - 1 + results.length) % results.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (results[activeIndex]) {
                handleSelect(results[activeIndex])
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false)
            inputRef.current?.blur()
        }
    }

    return (
        <div className="relative group" ref={wrapperRef}>
            <div className="flex items-center">
                <Search className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 transition-colors z-10",
                    query ? "text-pace-purple" : "text-gray-400"
                )} size={12} />
                <input
                    ref={inputRef}
                    type="text"
                    autoComplete="off"
                    placeholder="Search anything (Press ⌘K)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(results.length > 0)}
                    className="pl-9 pr-12 py-1.5 w-64 bg-pace-bg-subtle border-pace-border border focus:bg-card-bg focus:border-pace-purple/30 rounded-xl text-[11px] outline-none transition-all placeholder:text-admin-dim font-medium text-foreground lg:w-80"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 pointer-events-none hidden lg:flex">
                    <Command size={10} />
                    <span className="text-[10px] font-bold">K</span>
                </div>
            </div>

            {/* Floating Results List */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-card-bg border border-pace-border rounded-xl shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1 space-y-1">
                        {results.map((item, idx) => (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setActiveIndex(idx)}
                                className={cn(
                                    "w-full flex items-center justify-between p-2.5 rounded-lg transition-all text-left group/item",
                                    idx === activeIndex ? "bg-pace-purple/10 text-pace-purple" : "text-admin-label hover:bg-pace-bg-subtle"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                        idx === activeIndex ? "bg-pace-purple text-white shadow-sm shadow-pace-purple/20 scale-105" : "bg-pace-bg-subtle text-admin-dim"
                                    )}>
                                        <item.icon size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold tracking-tight">{item.name}</span>
                                            {item.type === 'action' && (
                                                <span className="text-[7px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-1 py-0.5 rounded border border-emerald-500/20">Action</span>
                                            )}
                                            {item.type === 'entity' && (
                                                <span className="text-[7px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 px-1 py-0.5 rounded border border-blue-500/20">Record</span>
                                            )}
                                        </div>
                                        <span className="text-[9px] opacity-60 uppercase tracking-widest truncate max-w-[180px]">
                                            {item.href.split('?')[0].replace('/dashboard', 'PACE').replace(/\//g, ' / ')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {idx === activeIndex && (
                                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 animate-pulse">Go &rarr;</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="px-3 py-2 bg-pace-bg-subtle border-t border-pace-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5 opacity-40">
                            <span className="text-[8px] font-bold border border-admin-dim/30 px-1 rounded uppercase tracking-tighter">Enter</span>
                            <span className="text-[8px] font-medium text-admin-dim uppercase tracking-widest">Execute</span>
                        </div>
                        <span className="text-[8px] font-bold text-admin-dim uppercase tracking-widest opacity-30">Pace Intelligence</span>
                    </div>
                </div>
            )}
        </div>
    )
}

