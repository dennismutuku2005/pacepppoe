import { API_BASE } from './api-config';
const ADMIN_API_URL = 'https://api.pacewisp.co.ke/endpoints/admin';

export const themesService = {
    async getThemes(page = 1, limit = 10) {
        try {
            const url = `${ADMIN_API_URL}/themes.php?page=${page}&limit=${limit}`;
            console.log('Fetching themes directly from admin backend:', url);

            const response = await fetch(url, {
                method: 'GET',
                // Explicitly no headers for GET to avoid preflight if possible
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('API Error Response:', text);
                return { success: false, message: `Server error: ${response.status}` };
            }

            const data = await response.json();
            return { success: data.status === 'success', data: data.data, pagination: data.pagination, message: data.message };
        } catch (error) {
            console.error('Marketplace Fetch Exception:', error);
            // Check for common connection issues
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, message: 'Connection refused. Is XAMPP Apache running at localhost?' };
            }
            return { success: false, message: `Connection failed: ${error.message}` };
        }
    },

    async activateTheme(themeId, routerId) {
        try {
            const token = localStorage.getItem('pace_auth_token');
            const response = await fetch(`${API_BASE}/themes.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'activate',
                    theme_id: themeId,
                    router_id: routerId
                })
            });
            const data = await response.json();
            return { success: data.status === 'success', message: data.message };
        } catch (error) {
            return { success: false, message: 'Failed to connect to server' };
        }
    },

    async getRouters() {
        try {
            const token = localStorage.getItem('pace_auth_token');
            const response = await fetch(`${API_BASE}/routers.php`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            return { success: data.status === 'success', data: data.data };
        } catch (error) {
            return { success: false, message: 'Failed to connect to server' };
        }
    },

    async getActiveThemes() {
        try {
            const token = localStorage.getItem('pace_auth_token');
            const response = await fetch(`${API_BASE}/themes.php`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            return { success: data.status === 'success', data: data.data };
        } catch (error) {
            console.error('Active Themes Fetch Exception:', error);
            return { success: false, data: [] };
        }
    }
};
