import authService from '@/lib/auth';
import { API_BASE } from '@/lib/api-config';

export const expenseService = {
    /**
     * Fetch expenses for a specific month/year
     * @param {Object} filters - { month, year }
     */
    async getExpenses(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.month) queryParams.append('month', filters.month);
        if (filters.year) queryParams.append('year', filters.year);

        const url = `${API_BASE}/expenses.php?${queryParams.toString()}`;

        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) {
                if (response.status === 401) {
                    await authService.logout();
                    window.location.href = '/login';
                    return null;
                }
                throw new Error('Failed to fetch expenses');
            }
            return await response.json();
        } catch (error) {
            console.error("Expense Service Error:", error);
            return null;
        }
    },

    /**
     * Add a new expense
     * @param {Object} data - { date, amount, description, category }
     */
    async addExpense(data) {
        const url = `${API_BASE}/expenses.php`;

        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to add expense');
            }

            return await response.json();
        } catch (error) {
            console.error("Add Expense Error:", error);
            throw error;
        }
    },

    /**
     * Update an existing expense
     * @param {Object} data - { id, date, amount, description, category }
     */
    async updateExpense(data) {
        const url = `${API_BASE}/expenses.php`;

        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update expense');
            }

            return await response.json();
        } catch (error) {
            console.error("Update Expense Error:", error);
            throw error;
        }
    },

    /**
     * Delete an expense
     * @param {number} id
     */
    async deleteExpense(id) {
        const url = `${API_BASE}/expenses.php?id=${id}`;

        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete expense');
            }

            return await response.json();
        } catch (error) {
            console.error("Delete Expense Error:", error);
            throw error;
        }
    }
};
