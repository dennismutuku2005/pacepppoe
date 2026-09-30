import { apiFetch } from '@/lib/api';

export const mpesaService = {
  async getMpesaTransactions({ search = '', status = 'all', mikrotik_status = 'all', isp_id = 0, page = 1, limit = 100 } = {}) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      if (mikrotik_status !== 'all') params.append('mikrotik_status', mikrotik_status);
      if (isp_id > 0) params.append('isp_id', isp_id.toString());
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await apiFetch(`/admin/mpesa.php?${params.toString()}`);
      if (res && res.status === 'success') {
        return {
          status: 'success',
          data: res.data?.transactions || [],
          stats: res.data?.stats || {},
          total: res.data?.total || 0
        };
      }
      return { status: 'error', message: res?.message || 'Failed to retrieve M-Pesa transactions' };
    } catch (e) {
      console.error("getMpesaTransactions failed", e);
      throw e;
    }
  }
};
