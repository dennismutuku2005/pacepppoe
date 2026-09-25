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
    },

    getPlanAnalytics: async (section = null) => {
        try {
            const url = section ? `/isp/plans.php?analytics=1&section=${section}` : '/isp/plans.php?analytics=1';
            const res = await apiFetch(url);
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: res.data
                };
            }
            return { status: 'error', message: res?.message || 'Failed to load plan analytics', data: null };
        } catch (e) {
            console.error("getPlanAnalytics failed", e);
            throw e;
        }
    },

    getPlanKPIs: async () => {
        try {
            const res = await apiFetch('/isp/plans.php?analytics=1&section=kpis');
            return res?.status === 'success' ? res.data : null;
        } catch (e) {
            console.error("getPlanKPIs failed", e);
            return null;
        }
    },

    getPlanDistribution: async () => {
        try {
            const res = await apiFetch('/isp/plans.php?analytics=1&section=distribution');
            return res?.status === 'success' ? res.data : null;
        } catch (e) {
            console.error("getPlanDistribution failed", e);
            return null;
        }
    },

    getPlanHistory: async () => {
        try {
            const res = await apiFetch('/isp/plans.php?analytics=1&section=history');
            return res?.status === 'success' ? res.data : null;
        } catch (e) {
            console.error("getPlanHistory failed", e);
            return null;
        }
    },

    getPlanSummary: async () => {
        try {
            const res = await apiFetch('/isp/plans.php?analytics=1&section=summary');
            return res?.status === 'success' ? res.data : null;
        } catch (e) {
            console.error("getPlanSummary failed", e);
            return null;
        }
    }
};
