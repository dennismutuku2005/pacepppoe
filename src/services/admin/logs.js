import { apiFetch } from '@/lib/api';

export const logService = {
    async getSystemLogs(limit = 50, offset = 0, params = {}) {
        try {
            const query = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
                ...(params.search ? { search: params.search } : {}),
                ...(params.role ? { role: params.role } : {}),
                ...(params.action ? { action: params.action } : {})
            });
            const res = await apiFetch(`/admin/logs.php?${query.toString()}`);
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    total: res.data.total || 0,
                    today_total: res.data.today_total || 0,
                    has_more: res.data.has_more ?? false,
                    data: res.data.logs || []
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve system logs', data: [] };
        } catch (e) {
            console.error("getSystemLogs failed", e);
            throw e;
        }
    },

    async logAction(action, description) {
        try {
            return await apiFetch('/admin/logs.php', {
                method: 'POST',
                body: JSON.stringify({ action, description })
            });
        } catch (e) {
            console.error("logAction failed", e);
            throw e;
        }
    }
};
