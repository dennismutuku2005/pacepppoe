import authService from "@/lib/auth";
import { API_BASE } from "@/lib/api-config";

export const vouchersService = {
    async getVouchers(page = 1, limit = 10, search = '', routerName = '') {
        const url = `${API_BASE}/vouchers.php?page=${page}&limit=${limit}&search=${search}&router_name=${routerName}&t=${new Date().getTime()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch vouchers');
            return await response.json();
        } catch (error) {
            console.error("Get Vouchers Error:", error);
            throw error;
        }
    },

    async createVouchers(data) {
        const url = `${API_BASE}/vouchers.php`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.status !== 'success') throw new Error(result.message || 'Creation failed');
            return result;
        } catch (error) {
            console.error("Create Vouchers Error:", error);
            throw error;
        }
    },

    async deleteVouchers(ids) {
        const url = `${API_BASE}/vouchers.php`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            });
            const result = await response.json();
            if (result.status !== 'success') throw new Error(result.message || 'Delete failed');
            return result;
        } catch (error) {
            console.error("Delete Vouchers Error:", error);
            throw error;
        }
    }
};
