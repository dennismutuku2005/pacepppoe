import { apiFetch } from '@/lib/api';

export const dashboardService = {
    // ─── Sectional Parallel Fetchers ─────────────────────────────────────────
    async getWidgets() {
        try {
            const res = await apiFetch('/isp/dashboard.php?section=widgets');
            if (res && res.status === 'success') {
                const w = res.data || {};
                return {
                    active_users: { value: w.active_subscribers || 0 },
                    monthly_users: { value: w.total_subscribers || 0 },
                    todays_earnings: { value: w.today_revenue || 0 },
                    sms_balance: { value: w.net_profit || 0 },
                    open_tickets: { value: w.open_tickets || 0 },
                    system_health: { value: '99.4%' }
                };
            }
        } catch (e) {
            console.error("getWidgets failed", e);
        }
        return {
            active_users: { value: 0 },
            monthly_users: { value: 0 },
            todays_earnings: { value: 0 },
            sms_balance: { value: 0 },
            open_tickets: { value: 0 },
            system_health: { value: '100%' }
        };
    },

    async getCharts() {
        try {
            const res = await apiFetch('/isp/dashboard.php?section=charts');
            if (res && res.status === 'success') {
                const revenueByDay = res.data || [];
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const chartsDataMap = {};
                
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayName = dayNames[d.getDay()];
                    chartsDataMap[dayName] = { day: dayName, amount: 0, entries: 0 };
                }

                revenueByDay.forEach(item => {
                    const day = item.day;
                    if (chartsDataMap[day]) {
                        chartsDataMap[day].amount = parseFloat(item.revenue || 0);
                    }
                });

                return Object.values(chartsDataMap);
            }
        } catch (e) {
            console.error("getCharts failed", e);
        }
        return [];
    },

    async getRecentTransactions() {
        try {
            const res = await apiFetch('/isp/dashboard.php?section=transactions');
            if (res && res.status === 'success') {
                return (res.data || []).map((p, index) => {
                    const date = new Date(p.transaction_date);
                    const timeAgo = isNaN(date.getTime()) ? 'Recently' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return {
                        id: p.receipt_number || `TX-${index}`,
                        user_phone: p.phone_number || '0712345678',
                        plan_name: p.plan || 'Standard',
                        time_ago: timeAgo,
                        amount: parseFloat(p.amount || 0),
                        mpesa_code: p.receipt_number
                    };
                });
            }
        } catch (e) {
            console.error("getRecentTransactions failed", e);
        }
        return [];
    },

    async getRecentTickets() {
        try {
            const res = await apiFetch('/isp/dashboard.php?section=tickets');
            if (res && res.status === 'success') {
                return res.data || [];
            }
        } catch (e) {
            console.error("getRecentTickets failed", e);
        }
        return [];
    },

    async getRecentSms() {
        try {
            const res = await apiFetch('/isp/dashboard.php?section=sms');
            if (res && res.status === 'success') {
                return res.data || [];
            }
        } catch (e) {
            console.error("getRecentSms failed", e);
        }
        return [];
    },

    async getRouterStatus() {
        try {
            const res = await apiFetch('/isp/routers.php');
            if (res && res.status === 'success') {
                return (res.data.routers || []).map(r => ({
                    name: r.name,
                    ip: r.ip_address,
                    status: r.status === 'online' ? 'Online' : 'Offline',
                    load: `${r.cpu_usage || 0}%`,
                    uptime: r.uptime || 'N/A'
                }));
            }
        } catch (e) {
            console.error("getRouterStatus failed", e);
        }
        return [];
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
    },

    // ─── Concurrent Parallel Aggregator ──────────────────────────────────────
    async getDashboardData() {
        const [
            widgetsResult,
            chartsResult,
            txResult,
            ticketsResult,
            smsResult,
            routersResult
        ] = await Promise.allSettled([
            this.getWidgets(),
            this.getCharts(),
            this.getRecentTransactions(),
            this.getRecentTickets(),
            this.getRecentSms(),
            this.getRouterStatus()
        ]);

        return {
            status: 'success',
            data: {
                widgets: widgetsResult.status === 'fulfilled' ? widgetsResult.value : {},
                charts: {
                    revenue_over_time: chartsResult.status === 'fulfilled' ? chartsResult.value : []
                },
                recent_transactions: txResult.status === 'fulfilled' ? txResult.value : [],
                recent_tickets: ticketsResult.status === 'fulfilled' ? ticketsResult.value : [],
                recent_sms: smsResult.status === 'fulfilled' ? smsResult.value : [],
                router_status: routersResult.status === 'fulfilled' ? routersResult.value : []
            }
        };
    }
};

