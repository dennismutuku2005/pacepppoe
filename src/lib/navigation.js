import {
    Users, CreditCard, Ticket, Settings,
    Activity, Network, LifeBuoy,
    MessageSquare, UserRoundCheck, LayoutDashboard, FileText, Wallet
} from 'lucide-react'

export const NAVIGATION_SCHEMA = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        policy: 'view_dashboard',
        keywords: ['home', 'summary', 'overview', 'main']
    },
    {
        id: 'subscribers',
        name: 'Subscribers',
        icon: Users,
        children: [
            {
                name: 'Subscriber List',
                href: '/dashboard/customers',
                policy: 'manage_customers',
                keywords: ['clients', 'members', 'directory', 'phone numbers', 'list']
            },
            {
                name: 'Active Connections',
                href: '/dashboard/customers/active',
                policy: 'view_active_users',
                keywords: ['logs', 'history', 'connections', 'activity', 'live', 'sessions']
            }
        ]
    },
    {
        id: 'routers',
        name: 'Routers',
        href: '/dashboard/routers',
        icon: Network,
        policy: 'view_routers',
        keywords: ['mikrotik', 'gateways', 'hardware', 'devices', 'nodes']
    },
    {
        id: 'packages',
        name: 'Service Plans',
        icon: Ticket,
        children: [
            {
                name: 'Pppoe Packages',
                href: '/dashboard/packages',
                policy: 'manage_packages',
                keywords: ['plans', 'pricing', 'tiers', 'bandwidth', 'packages']
            },
            {
                name: 'Plan Analytics',
                href: '/dashboard/packages/analytics',
                policy: 'manage_packages',
                keywords: ['plan analytics', 'service distribution', 'revenue per plan', 'subscriber growth']
            }
        ]
    },
    {
        id: 'finance',
        name: 'Financials',
        icon: CreditCard,
        children: [
            {
                name: 'Transactions',
                href: '/dashboard/payments',
                policy: 'view_payments',
                keywords: ['revenue', 'sales', 'earnings', 'payments', 'money']
            },
            {
                name: 'Accounts',
                href: '/dashboard/mpesa',
                policy: 'view_mpesa',
                keywords: ['accounts', 'wallet', 'subscriber balance', 'payments']
            },
            {
                name: 'Financial Reports',
                href: '/dashboard/reports',
                policy: 'view_reports',
                keywords: ['analytics', 'profits', 'summary', 'reports']
            },
            {
                name: 'Expenses',
                href: '/dashboard/expenses',
                policy: 'manage_expenses',
                keywords: ['payouts', 'operational cost', 'bills', 'outgoing']
            }
        ]
    },
    {
        id: 'wallet',
        name: 'My Wallet',
        href: '/dashboard/wallet',
        icon: Wallet,
        policy: 'view_mpesa',
        keywords: ['wallet', 'withdraw', 'balance', 'payout', 'settlement']
    },
    {
        id: 'tickets',
        name: 'Support Tickets',
        href: '/dashboard/tickets',
        icon: LifeBuoy,
        policy: 'view_tickets',
        keywords: ['helpdesk', 'issues', 'tasks', 'support']
    },
    {
        id: 'sms',
        name: 'SMS Center',
        href: '/dashboard/sms',
        icon: MessageSquare,
        policy: 'view_sms',
        keywords: ['bulk sms', 'notifications', 'carrier', 'gateways']
    },
    {
        id: 'system',
        name: 'System',
        icon: Settings,
        children: [
            {
                name: 'Activity Logs',
                href: '/dashboard/logs',
                policy: 'view_logs',
                keywords: ['audit trail', 'events', 'debugging', 'logs', 'system']
            }
        ]
    },
    {
        id: 'profile',
        name: 'My Profile',
        href: '/dashboard/profile',
        icon: UserRoundCheck,
        keywords: ['settings', 'credentials', 'change password', 'user', 'profile']
    }
]

export function getFilteredNavigation(hasPolicy) {
    return NAVIGATION_SCHEMA.map(item => {
        if (item.children) {
            const activeChildren = item.children.filter(child => !child.policy || hasPolicy(child.policy));
            if (activeChildren.length > 0) {
                return { ...item, children: activeChildren };
            }
            return null;
        }
        if (!item.policy || hasPolicy(item.policy)) {
            return { ...item };
        }
        return null;
    }).filter(Boolean);
}
