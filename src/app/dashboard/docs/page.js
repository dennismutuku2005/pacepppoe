"use client"

import React, { useState, useEffect } from 'react'
import { 
    ChevronDown, Book, UserPlus, ShieldCheck, 
    Lock, HardDrive, Info, Terminal, ChevronRight,
    Search, Server, Settings, CreditCard, Activity,
    Globe, Smartphone, Ticket, Database
} from 'lucide-react'
import { cn } from '@/lib/utils'
import authService from '@/lib/auth'
import { redirect } from 'next/navigation'

const SYSTEM_CONFIG = {
    version: "2.4.0",
    codename: "PaceWisp Pro",
    engine: "Inguna v2",
    release_date: "2024.03.22"
}

const DOCS_CONTENT = [
    {
        id: "getting-started",
        title: "Section 01: Core Infrastructure",
        icon: Terminal,
        items: [
            {
                heading: "What is PaceWisp (Inguna Engine)?",
                content: "PaceWisp is an Enterprise ISP Management Unit. Unlike standard Billing systems, it integrates directly via the MikroTik API port to control bandwidth, device access, and plan enforcement in real-time. The Inguna v2 engine ensures that if your database goes down, the router maintains user session stability until the next sync cycle."
            },
            {
                heading: "The Triple-Role Hierarchy",
                content: "To maintain security, the system uses three roles: 1. SUPERADMIN: Master account with total control including deleting other admins. 2. ADMIN: Business manager who can create staff and view financials. 3. STAFF: Daily operator with specific policy-based restrictions."
            },
            {
                heading: "Primary Account Protection",
                content: "The master ID USR-8A1E921F is hard-coded for protection. It cannot be modified, suspended, or deleted via any interface. This is your 'emergency key' to the entire infrastructure."
            }
        ]
    },
    {
        id: "user-management",
        title: "Section 02: Staff & Personnel Operations",
        icon: UserPlus,
        items: [
            {
                heading: "How to Create a New Staff User",
                content: "1. Access 'Users & Policies' from the sidebar. 2. Click 'Add Staff User'. 3. Enter Full Name and a unique Username. 4. Choose Role: 'Admin' (all access) or 'Staff' (limited). 5. Assign specific Policies if role is Staff. 6. Save Account. The user can now login immediately."
            },
            {
                heading: "Administrator Isolation Protocol",
                content: "For stability, standard Administrators are isolated from each other. An Admin cannot delete or downgrade another Admin. This prevents unauthorized personnel from trying to seize control of the ISP portal."
            },
            {
                heading: "Policy Enforcement on Staff",
                content: "Staff users follow a 'Zero Trust' model. If no policies are ticked, they see a dashboard with zero data. You must manually tick permissions like 'Create Voucher' or 'View Income' to grant them functionality."
            }
        ]
    },
    {
        id: "vouchers-hotspot",
        title: "Section 03: Vouchers & Active Users",
        icon: Ticket,
        items: [
            {
                heading: "Voucher Generation Cycle",
                content: "When you generate a voucher, it is first created in the local database and then pushed to the MikroTik router's 'Hotspot Users' list. A voucher is only 'Active' when it exists in both locations simultaneously."
            },
            {
                heading: "Automatic MAC Binding",
                content: "By default, the system binds a voucher to the FIRST device that uses it. Subsequent devices will be blocked even if they have the correct code. This prevents account sharing across households."
            },
            {
                heading: "Data Plan Enforcement",
                content: "Plans (e.g., 2Hrs, 24Hrs, 1Month) are converted into 'MikroTik Profiles'. Speed limits (Tx/Rx) are enforced by the router's hardware queues, ensuring that one high-use customer doesn't slow down others."
            }
        ]
    },
    {
        id: "payments-finance",
        title: "Section 04: Financial & M-Pesa Integration",
        icon: CreditCard,
        items: [
            {
                heading: "Automatic Payment Flow",
                content: "1. Customer enters phone on portal. 2. System triggers STK Push via Daraja API or KCB. 3. Payment is processed by Safaricom. 4. Safaricom sends 'Success' to our Callback URL. 5. Router automatically enables user session within 2-3 seconds."
            },
            {
                heading: "Manual Payment Confirmation",
                content: "Admins can 'Manually Activate' users if an M-Pesa delay occurs. This bypasses the API check but logs the action as a 'Manual Override' for auditing purposes."
            },
            {
                heading: "The change_payment Restriction",
                content: "This policy controls access to the Till/Paybill numbers. If a staff member doesn't have this policy, they cannot see or change where your money is going. This is the most critical security setting."
            }
        ]
    },
    {
        id: "infrastructure",
        title: "Section 05: Network & Database Hardware",
        icon: Database,
        items: [
            {
                heading: "MikroTik Connectivity (Port 8728)",
                content: "The dashboard communicates with your stations via the API port. Ensure your router has '/ip service enable api'. For remote connections, ensure you have a static IP or a reliable DDNS address configured."
            },
            {
                heading: "Database Integrity",
                content: "All transactions are logged with 'Idempotent' IDs. If the system crashes during a voucher sale, the 'Record a Sale' flag ensures that it either completes successfully or fails entirely, preventing double-entry errors."
            },
            {
                heading: "System Logs & Auditing",
                content: "Every single action (Login, Delete Customer, Create User, Change Plan) is written to a permanent log. You can view these in the 'Logs' tab to track which staff member performed which action."
            }
        ]
    }
]

export default function DocsPage() {
    const [mounted, setMounted] = useState(false)
    const [openItem, setOpenItem] = useState("getting-started-0")

    useEffect(() => {
        const user = authService.getUser()
        if (!user || (user.type !== 'admin' && user.type !== 'superadmin')) {
            window.location.href = '/dashboard'
            return
        }
        setMounted(true)
    }, [])

    if (!mounted) return null

    const toggleItem = (id) => {
        setOpenItem(openItem === id ? null : id)
    }

    return (
        <div className="space-y-12 font-figtree animate-in fade-in duration-700 max-w-4xl mx-auto pb-32 px-6 pt-10 text-admin-value">
            {/* Massive Header */}
            <div className="pb-10 border-b border-pace-border flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <BadgeCheck size={16} className="text-pace-purple" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pace-purple">Authenticated Administrator Access Only</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter uppercase">{SYSTEM_CONFIG.codename} <span className="text-pace-purple">Internal Manual</span></h1>
                    <p className="text-admin-dim text-sm max-w-xl font-medium leading-relaxed">
                        Comprehensive documentation for the {SYSTEM_CONFIG.engine} infrastructure. 
                        This guide covers deployment, security, and financial orchestration.
                    </p>
                </div>
                <div className="bg-card-bg border border-pace-border p-4 rounded-2xl flex items-center gap-6 shadow-sm">
                    <div className="text-center">
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Build</p>
                        <p className="text-[11px] font-bold text-admin-value">{SYSTEM_CONFIG.release_date}</p>
                    </div>
                    <div className="w-px h-8 bg-pace-border"></div>
                    <div className="text-center">
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Type</p>
                        <p className="text-[11px] font-bold text-pace-purple">ENTERPRISE</p>
                    </div>
                </div>
            </div>

            {/* Single Column Content Flow */}
            <div className="space-y-24">
                {DOCS_CONTENT.map((category) => (
                    <section id={category.id} key={category.id} className="space-y-8">
                        <div className="flex items-center gap-4 text-pace-purple px-2 border-l-2 border-pace-purple pl-6">
                            <category.icon size={20} />
                            <h2 className="text-[16px] font-black uppercase tracking-[0.2em]">{category.title}</h2>
                        </div>

                        <div className="bg-card-bg border border-pace-border rounded-2xl overflow-hidden shadow-sm">
                                {category.items.map((item, idx) => {
                                    const itemId = `${category.id}-${idx}`
                                    const isOpen = openItem === itemId
                                    
                                    return (
                                        <div key={itemId} className="border-b border-pace-border last:border-none">
                                            <button
                                                onClick={() => toggleItem(itemId)}
                                                className="w-full flex items-center justify-between p-6 hover:bg-pace-bg-subtle/50 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[11px] font-black text-pace-purple/30 group-hover:text-pace-purple/60 transition-colors">0{idx + 1}</span>
                                                    <span className={cn(
                                                        "text-[13px] font-bold uppercase tracking-tight transition-colors",
                                                        isOpen ? "text-pace-purple" : "text-admin-value group-hover:text-pace-purple/80"
                                                    )}>
                                                        {item.heading}
                                                    </span>
                                                </div>
                                                <ChevronDown 
                                                    size={16} 
                                                    className={cn(
                                                        "text-gray-300 transition-transform duration-300",
                                                        isOpen && "rotate-180 text-pace-purple"
                                                    )} 
                                                />
                                            </button>
                                            
                                            <div className={cn(
                                                "overflow-hidden transition-all duration-300 ease-in-out bg-pace-bg-subtle/20",
                                                isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                            )}>
                                                <div className="p-6 pt-0 text-[13px] text-admin-dim leading-relaxed font-medium">
                                                    {item.content}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                ))}
            </div>

            {/* Massive Footer */}
            <div className="pt-20 border-t border-pace-border flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <Globe size={16} className="text-gray-300" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">PaceWisp Infrastructure Manual v{SYSTEM_CONFIG.version}</span>
                </div>
                <div className="font-mono text-[9px] text-gray-300 uppercase tracking-tighter">System State: Encrypted & Secure</div>
            </div>
        </div>
    )
}

import { BadgeCheck } from 'lucide-react'
