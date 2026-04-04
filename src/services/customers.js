import authService from "@/lib/auth";
import { API_BASE } from "@/lib/api-config";

export const customerService = {
    async getCustomers({ search = '', page = 1, limit = 12, routerName = '' } = {}) {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (routerName) queryParams.append('router_name', routerName);
        queryParams.append('page', page);
        queryParams.append('limit', limit);

        const url = `${API_BASE}/customers.php?${queryParams.toString()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch customers');
            return await response.json();
        } catch (error) {
            console.error("Get Customers Error:", error);
            throw error;
        }
    },

    async getCustomerHistory({ phone, page = 1, limit = 12 }) {
        const queryParams = new URLSearchParams();
        queryParams.append('phone', phone);
        queryParams.append('page', page);
        queryParams.append('limit', limit);

        const url = `${API_BASE}/customer_history.php?${queryParams.toString()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch customer history');
            return await response.json();
        } catch (error) {
            console.error("Get Customer History Error:", error);
            throw error;
        }
    }
};
