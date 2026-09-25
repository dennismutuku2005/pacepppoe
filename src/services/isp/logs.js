import { apiFetch } from '@/lib/api';

export const logService = {
    async getLogs(limit = 50, offset = 0) {
        try {
            const res = await apiFetch(`/isp/logs.php?limit=${limit}&offset=${offset}`);
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    total: res.data.total || 0,
                    data: res.data.logs || []
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve logs' };
        } catch (e) {
            console.error("getLogs failed", e);
            throw e;
        }
    },

    async getSystemLogs(limit = 50, offset = 0) {
        return this.getLogs(limit, offset);
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
