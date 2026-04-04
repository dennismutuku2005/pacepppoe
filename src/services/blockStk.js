import authService from "@/lib/auth";
import { API_BASE } from "@/lib/api-config";

export const blockStkService = {
    // List blocked numbers or check specific
    async getBlockedNumbers({ phone = '', page = 1, limit = 25 } = {}) {
        const queryParams = new URLSearchParams();
        if (phone) queryParams.append('phone', phone);
        queryParams.append('page', page);
        queryParams.append('limit', limit);

        queryParams.append('t', new Date().getTime());
        const url = `${API_BASE}/block_stk.php?${queryParams.toString()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            // block_stk check might return 404 or just empty
            if (!response.ok) throw new Error('Failed to fetch blocked numbers');
            return await response.json();
        } catch (error) {
            console.error("Get Blocked Numbers Error:", error);
            throw error;
        }
    },

    // Block a number
    async blockNumber(phone, reason = 'Manual Block') {
        const url = `${API_BASE}/block_stk.php`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone, reason }),
            });

            const data = await response.json();
            if (!response.ok && data.status === 'error') throw new Error(data.message || 'Failed to block number');
            return data;
        } catch (error) {
            console.error("Block Number Error:", error);
            throw error;
        }
    },

    // Unblock a number
    async unblockNumber(phone) {
        const queryParams = new URLSearchParams();
        queryParams.append('phone', phone);

        const url = `${API_BASE}/block_stk.php?${queryParams.toString()}`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok && data.status === 'error') throw new Error(data.message || 'Failed to unblock number');
            return data;
        } catch (error) {
            console.error("Unblock Number Error:", error);
            throw error;
        }
    }
};
