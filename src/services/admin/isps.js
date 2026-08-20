import { apiFetch } from '@/lib/api';

export const ispService = {
    async getISPs(page = 1, limit = 10, search = '') {
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: search
            });
            const res = await apiFetch(`/admin/isps.php?${queryParams.toString()}`);
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: {
                        isps: (res.data.isps || []).map(isp => ({
                            id: isp.id,
                            name: isp.name,
                            username: isp.username,
                            email: isp.email || '',
                            phone: isp.phone || '',
                            status: isp.status, // keep raw string: 'active', 'inactive', 'suspended'
                            created_at: isp.created_at,
                            last_login: isp.last_login || 'Never'
                        })),
                        stats: res.data.stats || { total: 0, active: 0, inactive: 0, suspended: 0 },
                        has_more: !!res.data.has_more,
                        total_filtered: res.data.total_filtered || 0
                    }
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve ISPs' };
        } catch (e) {
            console.error("getISPs failed", e);
            throw e;
        }
    },

    async createISP(data) {
        try {
            return await apiFetch('/admin/isps.php', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("createISP failed", e);
            throw e;
        }
    },

    async updateISP(data) {
        try {
            return await apiFetch('/admin/isps.php', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("updateISP failed", e);
            throw e;
        }
    },

    async deleteISP(id) {
        try {
            return await apiFetch(`/admin/isps.php?id=${id}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error("deleteISP failed", e);
            throw e;
        }
    },

    async getISPSuggestions() {
        try {
            const res = await apiFetch('/admin/isp_suggestions.php');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: res.data.suggestions || []
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve ISP suggestions' };
        } catch (e) {
            console.error("getISPSuggestions failed", e);
            throw e;
        }
    }
};
