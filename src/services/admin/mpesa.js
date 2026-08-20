import { apiFetch } from '@/lib/api';

export const mpesaService = {
    async getMpesaTransactions() {
        try {
            const res = await apiFetch('/admin/mpesa.php');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: res.data.transactions || []
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve M-Pesa transactions' };
        } catch (e) {
            console.error("getMpesaTransactions failed", e);
            throw e;
        }
    }
};
