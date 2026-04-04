import authService from "@/lib/auth";
import { API_BASE } from "@/lib/api-config";

export const mpesaService = {
    // Get M-Pesa transactions with pagination and search
    async getTransactions({ page = 1, limit = 25, search = '' } = {}) {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);
        queryParams.append('t', new Date().getTime());

        const url = `${API_BASE}/mpesa_transactions.php?${queryParams.toString()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch M-Pesa transactions');
            return await response.json();
        } catch (error) {
            console.error("Get M-Pesa Transactions Error:", error);
            throw error;
        }
    }
};
