import { apiFetch } from '@/lib/api';

export const dashboardService = {
    async getDashboardData() {
        try {
            const res = await apiFetch('/admin/dashboard.php');
            if (res && res.status === 'success') {
                const widgets = res.data.widgets || {};
                const incomeVsExpenses = res.data.income_vs_expenses || [];
                const recentActivities = res.data.recent_activities || [];

                // Fetch recent transactions globally (since admin scope sees all)
                let recentTransactions = [];
                try {
                    const txRes = await apiFetch('/isp/finance/transactions.php?limit=5');
                    if (txRes && txRes.status === 'success') {
                        recentTransactions = (txRes.data.transactions || []).map(p => {
                            const date = new Date(p.transaction_date);
                            const timeAgo = isNaN(date.getTime()) ? 'Recently' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return {
                                id: p.receipt_number || p.id,
                                user_phone: p.phone_number || '0712345678',
                                plan_name: p.pppoe_username || 'Bronze',
                                time_ago: timeAgo,
                                amount: parseFloat(p.amount),
                                mpesa_code: p.receipt_number
                            };
                        });
                    }
                } catch (e) {
                    console.error("Admin dashboard failed to fetch recent transactions", e);
                }

                // Format revenue charts (fill in missing days from the last 7 days)
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const chartsDataMap = {};
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayName = dayNames[d.getDay()];
                    chartsDataMap[dayName] = { day: dayName, amount: 0 };
                }

                // Get revenue for charts using the global transaction log
                try {
                    const chartTxRes = await apiFetch('/isp/finance/transactions.php?limit=100');
                    if (chartTxRes && chartTxRes.status === 'success') {
                        const txs = chartTxRes.data.transactions || [];
                        txs.forEach(item => {
                            if (item.status === 'completed') {
                                const date = new Date(item.transaction_date);
                                if (!isNaN(date.getTime())) {
                                    const dayName = dayNames[date.getDay()];
                                    if (chartsDataMap[dayName]) {
                                        chartsDataMap[dayName].amount += parseFloat(item.amount || 0);
                                    }
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.error("Admin dashboard chart generation failed", e);
                }

                const charts = Object.values(chartsDataMap);

                return {
                    status: 'success',
                    data: {
                        widgets: {
                            active_users: { value: widgets.active_subscribers || 0 },
                            monthly_users: { value: widgets.total_subscribers || 0 },
                            todays_earnings: { value: widgets.todays_revenue ?? widgets.total_revenue ?? 0 },
                            sms_balance: { value: widgets.net_profit || 0 },
                            isp_tenants: { value: widgets.isp_tenants || 0 },
                            open_tickets: { value: widgets.open_tickets || 0 },
                            total_wallets_balance: { value: widgets.total_wallets_balance || 0 },
                            today_transactions_count: { value: widgets.today_transactions_count || 0 }
                        },
                        charts: {
                            revenue_over_time: charts
                        },
                        recent_transactions: recentTransactions,
                        recent_activities: recentActivities,
                        income_vs_expenses: incomeVsExpenses
                    }
                };
            }
            return { status: 'error', message: 'Failed to fetch admin dashboard data' };
        } catch (e) {
            console.error("Admin getDashboardData failed", e);
            throw e;
        }
    }
};
