import { apiFetch } from '@/lib/api';

export const planService = {
    getPlans: async (routerId = null) => {
        try {
            const url = routerId ? `/isp/plans.php?router_id=${routerId}` : '/isp/plans.php';
            const res = await apiFetch(url);
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: (res.data.plans || []).map(p => ({
                        id: p.id,
                        name: p.name,
                        bandwidth: p.bandwidth_limit,
                        price: parseFloat(p.price || 0),
                        router_id: p.router_id,
                        router_name: p.router_name || 'Router'
                    }))
                };
            }
            return { status: 'error', message: res?.message || 'Failed to load service plans' };
        } catch (e) {
            console.error("getPlans failed", e);
            throw e;
        }
    }
};
