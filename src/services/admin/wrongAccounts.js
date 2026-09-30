import { apiFetch } from '@/lib/api';

export const wrongAccountsService = {
  /**
   * Fetch paginated wrong accounts list and summary metrics
   */
  async getWrongAccounts({ search = '', status = 'all', page = 1, limit = 50 } = {}) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await apiFetch(`/admin/wrong_accounts.php?${params.toString()}`);
      return res;
    } catch (e) {
      console.error('getWrongAccounts error:', e);
      throw e;
    }
  },

  /**
   * Search PPPoE subscribers by keyword for resolution allocation
   */
  async searchSubscribers(query) {
    try {
      const res = await apiFetch(`/admin/wrong_accounts.php?action=search_subscribers&q=${encodeURIComponent(query)}`);
      return res;
    } catch (e) {
      console.error('searchSubscribers error:', e);
      throw e;
    }
  },

  /**
   * Resolve an unmatched transaction (with optional subscriber allocation)
   */
  async resolveAccount({ id, pppoe_user_id = null, notes = '' }) {
    try {
      const res = await apiFetch('/admin/wrong_accounts.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'resolve',
          id,
          pppoe_user_id,
          notes
        })
      });
      return res;
    } catch (e) {
      console.error('resolveAccount error:', e);
      throw e;
    }
  },

  /**
   * Reopen a resolved transaction
   */
  async reopenAccount({ id, notes = '' }) {
    try {
      const res = await apiFetch('/admin/wrong_accounts.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'reopen',
          id,
          notes
        })
      });
      return res;
    } catch (e) {
      console.error('reopenAccount error:', e);
      throw e;
    }
  }
};
