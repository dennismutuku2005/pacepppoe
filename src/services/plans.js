import authService from "@/lib/auth";
import { API_BASE } from "@/lib/api-config";

export const plansService = {
    // Hotspot Plans Management
    async getPlans(routerId = 'default') {
        const url = `${API_BASE}/hotspot_plans.php?router_id=${routerId}&t=${new Date().getTime()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch plans');
            return await response.json();
        } catch (error) {
            console.error("Get Plans Error:", error);
            throw error;
        }
    },

    async savePlans(routerId, plans, changedPlan = null, action = 'add', deletedPlanName = null) {
        const url = `${API_BASE}/hotspot_plans.php`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    router_id: routerId,
                    plans: plans,
                    changed_plan: changedPlan,
                    action: action,
                    deleted_plan_name: deletedPlanName
                }),
            });
            const data = await response.json();
            if (data.status !== 'success') throw new Error(data.message || 'Save failed');
            return data;
        } catch (error) {
            console.error("Save Plans Error:", error);
            throw error;
        }
    },

    // System Configuration Management (Links & Metadata)
    async getSystemConfig(routerId = 'default') {
        const url = `${API_BASE}/system_config.php?router_id=${routerId}&t=${new Date().getTime()}`;
        try {
            const response = await authService.authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch system config');
            return await response.json();
        } catch (error) {
            console.error("Get System Config Error:", error);
            throw error;
        }
    },

    async saveSystemConfig(routerId, configData) {
        const url = `${API_BASE}/system_config.php`;
        try {
            const response = await authService.authenticatedFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    router_id: routerId,
                    links: configData.links,
                    metadata: configData.metadata
                }),
            });
            const data = await response.json();
            if (data.status !== 'success') throw new Error(data.message || 'Save failed');
            return data;
        } catch (error) {
            console.error("Save System Config Error:", error);
            throw error;
        }
    }
};
