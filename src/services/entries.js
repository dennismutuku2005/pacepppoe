import authService from "@/lib/auth";
import { API_BASE } from "@/lib/api-config";

export const entriesService = {
    /**
     * Fetch entries/transactions
     * @param {Object} filters - { startDate, endDate, router, search, limit, offset }
     */
    async getEntries(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.router && filters.router !== 'All Routers') queryParams.append('router', filters.router);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.limit) queryParams.append('limit', filters.limit);
        if (filters.page) queryParams.append('page', filters.page);

        // API is expected at pace-apis/dashboard/v1/entries.php
        const url = `${API_BASE}/entries.php?${queryParams.toString()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch entries');
            return await response.json();
        } catch (error) {
            console.error("Get Entries Error:", error);
            throw error;
        }
    }
};
