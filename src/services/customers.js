import { apiFetch } from '@/lib/api';

export const customerService = {
    getCustomers: async ({ search = '', limit = 100, status = '' } = {}) => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (limit) queryParams.append('limit', limit);
        if (status) queryParams.append('status', status);

        const queryString = queryParams.toString();
        const endpoint = `/isp/subscribers.php${queryString ? `?${queryString}` : ''}`;
        
        try {
            const res = await apiFetch(endpoint);
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: (res.data.subscribers || []).map(c => ({
                        id: c.id,
                        name: c.name,
                        username: c.username,
                        phone: c.phone || '0712345678',
                        status: c.status === 'enabled' ? 'Active' : (c.status === 'suspended' ? 'Suspended' : 'Disabled'),
                        totalSpent: parseFloat(c.balance || 0),
                        mac: '00:00:00:00:00:00', // Mock/default value
                        accountNumber: c.account_number,
                        plan: c.plan,
                        bandwidth: c.bandwidth_limit,
                        price: parseFloat(c.price || 0),
                        router: c.router,
                        nextPayment: c.next_payment,
                        createdAt: c.created_at
                    }))
                };
            }
            return { status: 'error', message: res?.message || 'Failed to load customers' };
        } catch (e) {
            console.error("getCustomers failed", e);
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
