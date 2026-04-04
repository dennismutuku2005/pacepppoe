import authService from "@/lib/auth";
import { API_BASE } from "@/lib/api-config";

export const routerService = {
    // Get all routers with pagination
    async getRouters({ page = 1, limit = 25 } = {}) {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        queryParams.append('t', new Date().getTime());

        const url = `${API_BASE}/routers.php?${queryParams.toString()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch routers');
            return await response.json();
        } catch (error) {
            console.error("Get Routers Error:", error);
            throw error;
        }
    },

    // Get specific router
    async getRouter(id) {
        const url = `${API_BASE}/routers.php?id=${id}&t=${new Date().getTime()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch router');
            return await response.json();
        } catch (error) {
            console.error("Get Router Error:", error);
            throw error;
        }
    },

    // Create new router
    async createRouter(routerData) {
        const url = `${API_BASE}/routers.php`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(routerData),
            });

            const data = await response.json();
            if (!response.ok && data.status === 'error') throw new Error(data.message || 'Failed to create router');
            return data;
        } catch (error) {
            console.error("Create Router Error:", error);
            throw error;
        }
    },

    // Update router
    async updateRouter(id, routerData) {
        const url = `${API_BASE}/routers.php`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, ...routerData }),
            });

            const data = await response.json();
            if (!response.ok && data.status === 'error') throw new Error(data.message || 'Failed to update router');
            return data;
        } catch (error) {
            console.error("Update Router Error:", error);
            throw error;
        }
    },

    // Delete router
    async deleteRouter(id) {
        const url = `${API_BASE}/routers.php?id=${id}`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok && data.status === 'error') throw new Error(data.message || 'Failed to delete router');
            return data;
        } catch (error) {
            console.error("Delete Router Error:", error);
            throw error;
        }
    },

    // Ping Router
    async pingRouter(ip, port) {
        const url = `${API_BASE}/routers.php?action=ping`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip, port: parseInt(port) })
            });
            return await response.json();
        } catch (error) {
            console.error("Ping Router Error:", error);
            throw error;
        }
    },

    // Restart Router
    async restartRouter(ip, port) {
        const url = `${API_BASE}/routers.php?action=restart`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip, port: parseInt(port) })
            });
            return await response.json();
        } catch (error) {
            console.error("Restart Router Error:", error);
            throw error;
        }
    }
};
