import { apiFetch } from '@/lib/api';

export const customerService = {
    getCustomers: async ({ page = 1, limit = 13, search = '', status = '', router_id = '', plan_id = '' } = {}) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);
        if (status && status !== 'ALL') queryParams.append('status', status);
        if (router_id) queryParams.append('router_id', router_id);
        if (plan_id) queryParams.append('plan_id', plan_id);

        const queryString = queryParams.toString();
        const endpoint = `/isp/subscribers.php${queryString ? `?${queryString}` : ''}`;
        
        try {
            const res = await apiFetch(endpoint);
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    total: res.data.total ?? 0,
                    has_more: res.data.has_more ?? false,
                    page: res.data.page ?? page,
                    limit: res.data.limit ?? limit,
                    stats: res.data.stats ?? { total: 0, active: 0, suspended: 0, total_billing: 0 },
                    data: (res.data.subscribers || []).map(c => ({
                        id: c.id,
                        name: c.name,
                        username: c.username,
                        password: c.password || '',
                        phone: c.phone || '0712345678',
                        status: c.status === 'enabled' ? 'enabled' : (c.status === 'suspended' ? 'suspended' : 'disabled'),
                        balance: parseFloat(c.balance || 0),
                        totalSpent: parseFloat(c.balance || 0),
                        totalPaid: parseFloat(c.total_paid || 0),
                        lastPaymentAmount: c.last_payment_amount ? parseFloat(c.last_payment_amount) : null,
                        lastPaymentDate: c.last_payment_date || null,
                        lastReceipt: c.last_receipt || null,
                        mac: '00:00:00:00:00:00',
                        accountNumber: c.account_number,
                        plan: c.plan,
                        plan_id: c.plan_id,
                        bandwidth: c.bandwidth_limit,
                        price: parseFloat(c.price || 0),
                        router: c.router,
                        router_id: c.router_id,
                        nextPayment: c.next_payment,
                        createdAt: c.created_at
                    }))
                };
            }
            return { status: 'error', message: res?.message || 'Failed to load customers', total: 0, has_more: false, stats: {}, data: [] };
        } catch (e) {
            console.error("getCustomers failed", e);
            throw e;
        }
    },

    generateAccountNumber: async (length = 6) => {
        try {
            return await apiFetch(`/isp/subscribers.php?action=generate_account&length=${length}`);
        } catch (e) {
            console.error("generateAccountNumber failed", e);
            throw e;
        }
    },

    checkAccountNumber: async (accountNumber, excludeId = null) => {
        try {
            const excludeParam = excludeId ? `&exclude_id=${excludeId}` : '';
            return await apiFetch(`/isp/subscribers.php?action=check_account&account_number=${encodeURIComponent(accountNumber)}${excludeParam}`);
        } catch (e) {
            console.error("checkAccountNumber failed", e);
            throw e;
        }
    },

    createCustomer: async (customerData) => {
        try {
            return await apiFetch('/isp/subscribers.php', {
                method: 'POST',
                body: JSON.stringify(customerData)
            });
        } catch (e) {
            console.error("createCustomer failed", e);
            throw e;
        }
    },

    updateCustomer: async (id, customerData) => {
        try {
            return await apiFetch(`/isp/subscribers.php?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(customerData)
            });
        } catch (e) {
            console.error("updateCustomer failed", e);
            throw e;
        }
    },

    toggleStatus: async (id, status) => {
        try {
            return await apiFetch(`/isp/subscribers.php?id=${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
        } catch (e) {
            console.error("toggleStatus failed", e);
            throw e;
        }
    },

    deleteCustomer: async (id) => {
        try {
            return await apiFetch(`/isp/subscribers.php?id=${id}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error("deleteCustomer failed", e);
            throw e;
        }
    }
};
