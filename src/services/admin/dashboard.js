import { apiFetch } from '@/lib/api';

export const dashboardService = {
    // ── 1. Top KPI Widgets (Fastest) ──
    async getWidgets() {
        try {
            const res = await apiFetch('/admin/dashboard.php?section=widgets');
            if (res && res.status === 'success') {
                const w = res.data || {};
                return {
                    status: 'success',
                    data: {
                        active_users: { value: w.active_subscribers || 0 },
                        monthly_users: { value: w.total_subscribers || 0 },
                        todays_earnings: { value: w.todays_revenue ?? w.total_revenue ?? 0 },
                        sms_balance: { value: w.net_profit || 0 },
                        isp_tenants: { value: w.isp_tenants || 0 },
                        open_tickets: { value: w.open_tickets || 0 },
                        total_wallets_balance: { value: w.total_wallets_balance || 0 },
                        today_transactions_count: { value: w.today_transactions_count || 0 }
                    }
                };
            }
            return { status: 'error', data: null };
        } catch (e) {
            console.error("Admin getWidgets failed", e);
            return { status: 'error', data: null };
        }
    },

    // ── 2. 7-Day Revenue Trend Chart ──
    async getRevenueChart() {
        try {
            const res = await apiFetch('/admin/dashboard.php?section=revenue_chart');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: Array.isArray(res.data) ? res.data : []
                };
            }
            return { status: 'error', data: [] };
        } catch (e) {
            console.error("Admin getRevenueChart failed", e);
            return { status: 'error', data: [] };
        }
    },

    // ── 3. Recent Live Transactions Stream ──
    async getRecentTransactions(limit = 5) {
        try {
            const res = await apiFetch(`/admin/dashboard.php?section=transactions&limit=${limit}`);
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: Array.isArray(res.data) ? res.data : []
                };
            }
            return { status: 'error', data: [] };
        } catch (e) {
            console.error("Admin getRecentTransactions failed", e);
            return { status: 'error', data: [] };
        }
    },

    // ── 4. 6-Month Income vs Expenses ──
    async getIncomeVsExpenses() {
        try {
            const res = await apiFetch('/admin/dashboard.php?section=income_vs_expenses');
            return res;
        } catch (e) {
            console.error("Admin getIncomeVsExpenses failed", e);
            return { status: 'error', data: [] };
        }
    },

    // ── 5. Full Dashboard (Parallel Aggregator) ──
    async getDashboardData() {
        try {
            const [widgetsRes, chartRes, txRes] = await Promise.allSettled([
                this.getWidgets(),
                this.getRevenueChart(),
                this.getRecentTransactions()
            ]);

            return {
                status: 'success',
                data: {
                    widgets: widgetsRes.status === 'fulfilled' && widgetsRes.value.status === 'success' ? widgetsRes.value.data : {},
                    charts: {
                        revenue_over_time: chartRes.status === 'fulfilled' && chartRes.value.status === 'success' ? chartRes.value.data : []
                    },
                    recent_transactions: txRes.status === 'fulfilled' && txRes.value.status === 'success' ? txRes.value.data : []
                }
            };
        } catch (e) {
            console.error("Admin getDashboardData failed", e);
            throw e;
        }
    }
};

