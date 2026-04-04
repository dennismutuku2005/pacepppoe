import authService from '@/lib/auth';
import { API_BASE } from '@/lib/api-config';

export const incomeService = {
    /**
     * Fetch income analytics data
     * @param {Object} filters - { startDate, endDate, router }
     */
    async getIncomeData(filters = {}) {
        const queryParams = new URLSearchParams();

        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.router && filters.router !== 'All Routers') queryParams.append('router', filters.router);

        const url = `${API_BASE}/income.php?${queryParams.toString()}`;

        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) {
                if (response.status === 401) {
                    await authService.logout();
                    window.location.href = '/login';
                    return null;
                }
                throw new Error('Failed to fetch income data');
            }
            return await response.json();
        } catch (error) {
            console.error("Income Service Error:", error);
            return null;
        }
    }
};
