import { apiFetch } from '@/lib/api';

export const smsService = {
    async getSMSLogs() {
        try {
            const res = await apiFetch('/admin/sms.php');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: res.data.logs || []
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve SMS logs' };
        } catch (e) {
            console.error("getSMSLogs failed", e);
            throw e;
        }
    },

    async sendSMS(payload) {
        try {
            return await apiFetch('/admin/sms.php', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error("sendSMS failed", e);
            throw e;
        }
    }
};
