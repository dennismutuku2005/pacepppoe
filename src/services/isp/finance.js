import { apiFetch } from '@/lib/api';

export const financeService = {
    // ── Subscriber Accounts & Balances ──────────────────────────────────────────
    getAccounts: async () => {
        try {
            const res = await apiFetch('/isp/finance/accounts.php');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    stats: res.data.stats || {
                        current_subscribers: 0,
                        expired_owing: 0,
                        total_due: 0,
                        collected_wallet: 0
                    },
                    accounts: (res.data.accounts || []).map(a => ({
                        id: a.id,
                        name: a.name,
                        username: a.username,
                        phone: a.phone || '—',
                        accountNumber: a.account_number || `PAC-${a.id}`,
                        plan: a.plan_name || 'Standard',
                        packageName: a.plan_name || 'Standard',
                        price: parseFloat(a.plan_price || 0),
                        balance: parseFloat(a.balance || 0),
                        paid: parseFloat(a.paid || 0),
                        overdue: parseFloat(a.overdue || 0),
                        status: a.status === 'enabled' ? 'current' : 'expired',
                        nextPayment: a.next_payment
                    }))
                };
            }
            return { status: 'error', message: res?.message || 'Failed to fetch accounts', stats: {}, accounts: [] };
        } catch (e) {
            console.error("getAccounts failed", e);
            throw e;
        }
    },

    // ── Unified Financial Transactions ──────────────────────────────────────────
    getTransactions: async ({ search = '', status = '', limit = 100, offset = 0 } = {}) => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status) params.append('status', status);
            if (limit) params.append('limit', limit);
            if (offset) params.append('offset', offset);

            const queryString = params.toString();
            const res = await apiFetch(`/isp/finance/transactions.php${queryString ? `?${queryString}` : ''}`);
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    total: res.data.total || 0,
                    transactions: (res.data.transactions || []).map(t => ({
                        id: t.id,
                        customer: t.customer_name || t.account_reference || 'Subscriber',
                        plan: t.account_reference ? `Ref: ${t.account_reference}` : 'Subscription',
                        amount: parseFloat(t.amount || 0),
                        date: t.transaction_date || t.created_at,
                        method: 'M-Pesa',
                        receipt: t.receipt_number,
                        phone: t.phone_number,
                        status: t.status === 'completed' ? 'Success' : (t.status || 'Pending')
                    }))
                };
            }
            return { status: 'error', message: res?.message || 'Failed to fetch transactions', total: 0, transactions: [] };
        } catch (e) {
            console.error("getTransactions failed", e);
            throw e;
        }
    },

    recordTransaction: async (data) => {
        try {
            return await apiFetch('/isp/finance/transactions.php', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("recordTransaction failed", e);
            throw e;
        }
    },

    // ── Expenses ─────────────────────────────────────────────────────────────────
    getExpenses: async () => {
        try {
            const res = await apiFetch('/isp/finance/expenses.php');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    expenses: (res.data.expenses || []).map(e => ({
                        id: e.id,
                        title: e.description,
                        description: e.description,
                        amount: parseFloat(e.amount || 0),
                        category: e.category || 'General',
                        date: e.created_at ? e.created_at.split(' ')[0] : new Date().toISOString().split('T')[0],
                        status: 'Paid'
                    }))
                };
            }
            return { status: 'error', message: res?.message || 'Failed to fetch expenses', expenses: [] };
        } catch (e) {
            console.error("getExpenses failed", e);
            throw e;
        }
    },

    createExpense: async (data) => {
        try {
            return await apiFetch('/isp/finance/expenses.php', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("createExpense failed", e);
            throw e;
        }
    },

    deleteExpense: async (id) => {
        try {
            return await apiFetch(`/isp/finance/expenses.php?id=${id}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error("deleteExpense failed", e);
            throw e;
        }
    },

    // ── Reports & Financial Intelligence ─────────────────────────────────────────
    getReports: async () => {
        try {
            const res = await apiFetch('/isp/finance/reports.php');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: res.data
                };
            }
            return { status: 'error', message: res?.message || 'Failed to fetch financial reports', data: null };
        } catch (e) {
            console.error("getReports failed", e);
            throw e;
        }
    },

    // ── Wallet & Settlements ─────────────────────────────────────────────────────
    getWallet: async () => {
        try {
            const res = await apiFetch('/isp/wallet.php');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: res.data
                };
            }
            return { status: 'error', message: res?.message || 'Failed to fetch wallet', data: null };
        } catch (e) {
            console.error("getWallet failed", e);
            throw e;
        }
    },

    withdrawWallet: async ({ amount, channel, notes }) => {
        try {
            return await apiFetch('/isp/wallet.php', {
                method: 'POST',
                body: JSON.stringify({ action: 'withdraw', amount, channel, notes })
            });
        } catch (e) {
            console.error("withdrawWallet failed", e);
            throw e;
        }
    },

    updateSettlement: async (settlementData) => {
        try {
            return await apiFetch('/isp/wallet.php', {
                method: 'POST',
                body: JSON.stringify({ action: 'settlement', ...settlementData })
            });
        } catch (e) {
            console.error("updateSettlement failed", e);
            throw e;
        }
    }
};
