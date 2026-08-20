import { apiFetch } from '@/lib/api';

export const dashboardService = {
    async getDashboardData(filters = {}) {
        try {
            const res = await apiFetch('/isp/dashboard.php');
            if (res && res.status === 'success') {
                const widgetsData = res.data.widgets || {};
                const revenueByDay = res.data.revenue_by_day || [];
                const recentTransactions = res.data.recent_transactions || [];
                
                // Format revenue charts (fill in missing days from the last 7 days)
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const chartsDataMap = {};
                
                // Initialize last 7 days with 0
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayName = dayNames[d.getDay()];
                    chartsDataMap[dayName] = { day: dayName, amount: 0, entries: 0 };
                }

                // Fill in real values from API
                revenueByDay.forEach(item => {
                    const day = item.day;
                    if (chartsDataMap[day]) {
                        chartsDataMap[day].amount = parseFloat(item.revenue || 0);
                    }
                });

                const charts = Object.values(chartsDataMap);

                // Format recent transactions
                const transactions = recentTransactions.map((p, index) => {
                    const date = new Date(p.transaction_date);
                    const timeAgo = isNaN(date.getTime()) ? 'Recently' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return {
                        id: p.receipt_number || `TX-${index}`,
                        user_phone: p.phone_number || '0712345678',
                        plan_name: p.plan || 'Bronze',
                        time_ago: timeAgo,
                        amount: parseFloat(p.amount),
                        mpesa_code: p.receipt_number
                    };
                });

                // Get routers list and map it
                let routers = [];
                try {
                    const routersRes = await apiFetch('/isp/routers.php');
                    if (routersRes && routersRes.status === 'success') {
                        routers = (routersRes.data.routers || []).map(r => ({
                            name: r.name,
                            ip: r.ip_address,
                            status: r.status === 'online' ? 'Online' : 'Offline',
                            load: `${r.cpu_usage || 0}%`,
                            uptime: r.uptime || 'N/A'
                        }));
                    }
                } catch (e) {
                    console.error("Dashboard router fetch failed, falling back", e);
                }

                return {
                    status: 'success',
                    data: {
                        widgets: {
                            active_users: { value: widgetsData.active_subscribers || 0 },
                            monthly_users: { value: widgetsData.total_subscribers || 0 },
                            todays_earnings: { value: widgetsData.today_revenue || 0 },
                            sms_balance: { value: widgetsData.net_profit || 0 },
                            system_health: { value: '98%' }
                        },
                        charts: {
                            revenue_over_time: charts
                        },
                        recent_transactions: transactions,
                        router_status: routers
                    }
                };
            }
            return { status: 'error', message: 'Failed to fetch dashboard' };
        } catch (e) {
            console.error("getDashboardData failed", e);
            throw e;
        }
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
        try {
            const res = await apiFetch('/isp/routers.php');
            if (res && res.status === 'success') {
                return ['All Routers', ...(res.data.routers || []).map(r => r.name)];
            }
        } catch (e) {
            console.error("getRouters failed", e);
        }
        return ['All Routers'];
    }
};
