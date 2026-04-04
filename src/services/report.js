import authService from '@/lib/auth';
import { API_BASE } from '@/lib/api-config';

export const reportService = {
    /**
     * Fetch financial report data
     * @param {Object} filters - { month, year }
     */
    async getIncomeReport(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.month) queryParams.append('month', filters.month);
        if (filters.year) queryParams.append('year', filters.year);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);

        const url = `${API_BASE}/income_report.php?${queryParams.toString()}`;

        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) {
                if (response.status === 401) {
                    await authService.logout();
                    window.location.href = '/login';
                    return null;
                }
                throw new Error('Failed to fetch income report');
            }
            return await response.json();
        } catch (error) {
            console.error("Report Service Error:", error);
            return null;
        }
    },

    /**
     * Fetch raw data for PDF reports
     * @param {Object} params - { type, date, month, year }
     */
    async getReportData(params = {}) {
        const queryParams = new URLSearchParams(params);
        const url = `${API_BASE}/report_data.php?${queryParams.toString()}`;

        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch report data');
            return await response.json();
        } catch (error) {
            console.error("Report Data Service Error:", error);
            return null;
        }
    }
};
