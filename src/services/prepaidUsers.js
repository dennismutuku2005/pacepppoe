import authService from "@/lib/auth";
import { API_BASE } from "@/lib/api-config";

export const prepaidUsersService = {
    async getUsers({ routerId, search = '', page = 1, limit = 25 } = {}) {
        const queryParams = new URLSearchParams();
        queryParams.append('router_id', routerId);
        if (search) queryParams.append('search', search);
        queryParams.append('page', page);
        queryParams.append('limit', limit);

        const url = `${API_BASE}/prepaid_users.php?${queryParams.toString()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch prepaid users');
            return await response.json();
        } catch (error) {
            console.error("Get Prepaid Users Error:", error);
            throw error;
        }
    },

    async createUser(userData) {
        const url = `${API_BASE}/prepaid_users.php`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (data.status !== 'success') throw new Error(data.message || 'Create failed');
            return data;
        } catch (error) {
            console.error("Create Prepaid User Error:", error);
            throw error;
        }
    },

    async deleteUser(id) {
        const url = `${API_BASE}/prepaid_users.php?id=${id}`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.status !== 'success') throw new Error(data.message || 'Delete failed');
            return data;
        } catch (error) {
            console.error("Delete Prepaid User Error:", error);
            throw error;
        }
    },

    async readdUser(id) {
        const url = `${API_BASE}/prepaid_users.php`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action: 'readd' }),
            });
            const data = await response.json();
            if (data.status !== 'success') throw new Error(data.message || 'Re-add failed');
            return data;
        } catch (error) {
            console.error("Re-add Prepaid User Error:", error);
            throw error;
        }
    }
};
