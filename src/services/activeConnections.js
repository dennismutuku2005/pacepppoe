import authService from "@/lib/auth";
import { API_BASE } from "@/lib/api-config";

export const activeConnectionsService = {
    /**
     * Fetch paid and active connections
     * @param {Object} filters - { page, limit, search }
     */
    async getActiveConnections(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.limit) queryParams.append('limit', filters.limit);
        if (filters.search) queryParams.append('search', filters.search);

        const url = `${API_BASE}/active_connections.php?${queryParams.toString()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch active connections');
            return await response.json();
        } catch (error) {
            console.error("Get Active Connections Error:", error);
            throw error;
        }
    }
};
