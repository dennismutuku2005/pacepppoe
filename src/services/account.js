import authService from '@/lib/auth';
import { API_BASE } from '@/lib/api-config';

export const accountService = {
    /**
     * Fetch account and subscription details from the central admin database
     */
    async getAccountDetails() {
        const url = `${API_BASE}/account.php`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch account details');
            }
            return await response.json();
        } catch (error) {
            console.error("Account Service Error:", error);
            throw error;
        }
    }
};

export default accountService;
