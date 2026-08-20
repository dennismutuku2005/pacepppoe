import { apiFetch } from '@/lib/api';

export const walletService = {
    async getWallets() {
        try {
            const res = await apiFetch('/admin/wallets.php');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: res.data.wallets || []
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve wallets' };
        } catch (e) {
            console.error("getWallets failed", e);
            throw e;
        }
    },

    async updateWalletBalance(ispId, amount, action) {
        try {
            return await apiFetch('/admin/wallets.php', {
                method: 'POST',
                body: JSON.stringify({
                    isp_id: ispId,
                    amount: parseFloat(amount),
                    action
                })
            });
        } catch (e) {
            console.error("updateWalletBalance failed", e);
            throw e;
        }
    },

    async setWalletBalance(ispId, amount) {
        try {
            return await apiFetch('/admin/wallets.php', {
                method: 'PUT',
                body: JSON.stringify({
                    isp_id: ispId,
                    amount: parseFloat(amount)
                })
            });
        } catch (e) {
            console.error("setWalletBalance failed", e);
            throw e;
        }
    }
};
