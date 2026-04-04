import authService from '@/lib/auth';
import { API_BASE } from '@/lib/api-config';

export const dashboardService = {
    /**
     * Fetch dashboard data using authenticated user token
     * @param {Object} filters - Optional filters { startDate, endDate, router, action, page, limit }
     */
    async getDashboardData(filters = {}) {
        const queryParams = new URLSearchParams();

        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.router && filters.router !== 'All Routers') queryParams.append('router', filters.router);
        if (filters.action) queryParams.append('action', filters.action);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.limit) queryParams.append('limit', filters.limit);

        const url = `${API_BASE}/dashboard.php?${queryParams.toString()}`;

        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) {
                if (response.status === 401) {
                    await authService.logout();
                    window.location.href = '/login';
                    return null;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch dashboard data');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Dashboard Service Error:", error);
            throw error;
        }
    },

    /**
     * Specifically fetch widgets (cards)
     */
    async getWidgets(filters = {}) {
        return this.getDashboardData({ ...filters, action: 'widgets' });
    },

    /**
     * Specifically fetch charts
     */
    async getCharts(filters = {}) {
        return this.getDashboardData({ ...filters, action: 'charts' });
    },

    /**
     * Specifically fetch recent transactions
     */
    async getRecentTransactions(filters = {}) {
        return this.getDashboardData({ ...filters, action: 'recent_transactions', limit: 5 });
    },

    /**
     * Specifically fetch router status
     */
    async getRouterStatus(filters = {}) {
        return this.getDashboardData({ ...filters, action: 'router_status', limit: 5 });
    },


    /**
     * Fetch list of routers
     */
    async getRouters() {
        const url = `${API_BASE}/dashboard.php?action=get_routers`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch routers');
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error("Get Routers Error:", error);
            return ['All Routers'];
        }
    },

    /**
     * Staff Management APIs
     */
    async getStaff() {
        try {
            const response = await authService.authenticatedFetch(`${API_BASE}/staff.php`);
            return await response.json();
        } catch (error) {
            console.error("Staff Management Error:", error);
            throw error;
        }
    },

    async createStaff(formData) {
        try {
            const response = await authService.authenticatedFetch(`${API_BASE}/staff.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            return await response.json();
        } catch (error) {
            console.error("Staff Creation Error:", error);
            throw error;
        }
    },

    async updateStaff(id, formData) {
        try {
            const response = await authService.authenticatedFetch(`${API_BASE}/staff.php?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            return await response.json();
        } catch (error) {
            console.error("Staff Update Error:", error);
            throw error;
        }
    },

    async deleteStaff(id) {
        try {
            const response = await authService.authenticatedFetch(`${API_BASE}/staff.php?id=${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error("Staff Deletion Error:", error);
            throw error;
        }
    }
};