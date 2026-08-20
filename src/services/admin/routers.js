import { apiFetch } from '@/lib/api';

export const routerService = {
    async getRouters() {
        try {
            const res = await apiFetch('/admin/routers.php');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: (res.data.routers || []).map(r => ({
                        id: r.id,
                        isp_id: r.isp_id,
                        owner_name: r.owner_name || 'Admin / Shared',
                        name: r.name,
                        ip: r.ip_address,
                        port: r.api_port,
                        winbox_port: r.winbox_port,
                        username: r.username,
                        password: r.password,
                        model: r.model || 'MikroTik',
                        status: r.status === 'online' ? 'Online' : 'Offline',
                        subscribers: r.users_count || 0,
                        cpu: r.cpu_usage || 0,
                        ram: r.ram_usage || 0,
                        uptime: r.uptime || 'N/A'
                    }))
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve routers' };
        } catch (e) {
            console.error("getRouters failed", e);
            throw e;
        }
    },

    async getRouterDetails(id) {
        try {
            const res = await apiFetch(`/admin/routers.php?id=${id}`);
            if (res && res.status === 'success') {
                const r = res.data;
                return {
                    status: 'success',
                    data: {
                        id: r.id,
                        isp_id: r.isp_id,
                        owner_name: r.owner_name || 'Admin / Shared',
                        name: r.name,
                        ip: r.ip_address,
                        port: r.api_port,
                        winbox_port: r.winbox_port,
                        username: r.username,
                        password: r.password,
                        model: r.model || 'MikroTik',
                        status: r.status === 'online' ? 'Online' : 'Offline',
                        subscribers: r.users_count || 0,
                        activeSubscribers: r.users_count || 0,
                        cpu: r.cpu_usage || 0,
                        ram: r.ram_usage || 0,
                        uptime: r.uptime || 'N/A',
                        createdAt: r.created_at
                    }
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve router details' };
        } catch (e) {
            console.error("getRouterDetails failed", e);
            throw e;
        }
    },

    async authorizeRouter(routerData) {
        try {
            return await apiFetch('/admin/routers.php', {
                method: 'POST',
                body: JSON.stringify(routerData)
            });
        } catch (e) {
            console.error("authorizeRouter failed", e);
            throw e;
        }
    },

    async updateRouter(id, routerData) {
        try {
            return await apiFetch(`/admin/routers.php?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(routerData)
            });
        } catch (e) {
            console.error("updateRouter failed", e);
            throw e;
        }
    },

    async deleteRouter(id) {
        try {
            return await apiFetch(`/admin/routers.php?id=${id}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error("deleteRouter failed", e);
            throw e;
        }
    }
};
