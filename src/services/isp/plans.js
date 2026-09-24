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
                        router_name: p.router_name || 'Router',
                        subscribers: parseInt(p.subscriber_count || 0),
                        createdAt: p.created_at
                    }))
                };
            }
            return { status: 'error', message: res?.message || 'Failed to load service plans', data: [] };
        } catch (e) {
            console.error("getPlans failed", e);
            throw e;
        }
    },

    createPlan: async (planData) => {
        try {
            return await apiFetch('/isp/plans.php', {
                method: 'POST',
                body: JSON.stringify(planData)
            });
        } catch (e) {
            console.error("createPlan failed", e);
            throw e;
        }
    },

    updatePlan: async (id, planData) => {
        try {
            return await apiFetch(`/isp/plans.php?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(planData)
            });
        } catch (e) {
            console.error("updatePlan failed", e);
            throw e;
        }
    },

    deletePlan: async (id) => {
        try {
            return await apiFetch(`/isp/plans.php?id=${id}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error("deletePlan failed", e);
            throw e;
        }
    }
};
