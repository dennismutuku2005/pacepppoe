import authService from '@/lib/auth';
import { API_BASE } from '@/lib/api-config';

export const logsService = {
    /**
     * Fetch system logs with pagination and search
     */
    async getLogs(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);

        const url = `${API_BASE}/logs.php?${queryParams.toString()}`;

        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch logs');
            }
            return await response.json();
        } catch (error) {
            console.error("Logs Service Error:", error);
            throw error;
        }
    }
};
