import { mockDashboardData, mockRouters } from './mockData';

export const dashboardService = {
    async getDashboardData(filters = {}) {
        // Mock implementation
        return {
            status: 'success',
            data: {
                widgets: {
                    active_users: { value: mockDashboardData.stats.activeCustomers },
                    todays_earnings: { value: mockDashboardData.stats.totalRevenueToday },
                    sms_balance: { value: mockDashboardData.stats.smsBalance },
                    system_health: { value: '98%' },
                    customers_month: { value: 1240 },
                    online_customers: { value: 856 }
                },
                charts: {
                    revenue_over_time: [
                        { day: 'Mon', amount: 4000, entries: 240 },
                        { day: 'Tue', amount: 3000, entries: 198 },
                        { day: 'Wed', amount: 2000, entries: 380 },
                        { day: 'Thu', amount: 2780, entries: 308 },
                        { day: 'Fri', amount: 1890, entries: 480 },
                        { day: 'Sat', amount: 2390, entries: 380 },
                        { day: 'Sun', amount: 3490, entries: 430 },
                    ]
                },
                recent_transactions: mockDashboardData.recentPayments.map(p => ({
                    id: p.id,
                    user_phone: p.phone || '0712345678',
                    plan_name: p.plan || 'Bronze',
                    time_ago: '2 mins ago',
                    amount: p.amount,
                    mpesa_code: p.receipt
                })),
                router_status: mockRouters.map(r => ({
                    name: r.name,
                    ip: r.ip,
                    status: r.status === 'online' ? 'Online' : 'Offline',
                    load: '24%',
                    uptime: r.uptime
                }))
            },
            pagination: { page: 1, has_more: false }
        };
    },

    async getWidgets(filters = {}) {
        const res = await this.getDashboardData(filters);
        return res;
    },

    async getCharts(filters = {}) {
        const res = await this.getDashboardData(filters);
        return res;
    },

    async getRecentTransactions(filters = {}) {
        const res = await this.getDashboardData(filters);
        return res;
    },

    async getRouterStatus(filters = {}) {
        const res = await this.getDashboardData(filters);
        return res;
    },

    async getRouters() {
        return ['All Routers', ...mockRouters.map(r => r.name)];
    }
};
