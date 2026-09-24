import { customerService } from '@/services/isp/customers';

export const activeConnectionsService = {
    getActiveConnections: async ({ page = 1, limit = 50, search = '' } = {}) => {
        try {
            const res = await customerService.getCustomers({
                status: 'enabled',
                search,
                limit
            });

            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: res.data || [],
                    pagination: {
                        total: (res.data || []).length,
                        has_more: false
                    }
                };
            }
            return {
                status: 'error',
                message: res?.message || 'Failed to fetch active subscribers',
                data: [],
                pagination: { total: 0, has_more: false }
            };
        } catch (e) {
            console.error("getActiveConnections failed:", e);
            throw e;
        }
    }
};
