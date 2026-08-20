import { apiFetch } from '@/lib/api';

export const routerService = {
    async getRouters() {
        try {
            const res = await apiFetch('/isp/routers.php');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: (res.data.routers || []).map(r => ({
                        id: r.id,
                        name: r.name,
                        ip: r.ip_address,
                        port: r.api_port,
                        model: r.model || 'MikroTik',
                        status: r.status === 'online' ? 'Online' : 'Offline',
                        subscribers: r.users_count || 0,
                        cpu: `${r.cpu_usage || 0}%`,
                        ram: `${r.ram_usage || 0}%`,
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
            const res = await apiFetch(`/isp/routers.php?id=${id}`);
            if (res && res.status === 'success') {
                const r = res.data;
                return {
                    status: 'success',
                    data: {
                        id: r.id,
                        name: r.name,
                        ip: r.ip_address,
                        port: r.api_port,
                        model: r.model || 'MikroTik',
                        status: r.status === 'online' ? 'Online' : 'Offline',
                        subscribers: r.users_count || 0,
                        activeSubscribers: r.active_subscribers_count || 0,
                        cpu: `${r.cpu_usage || 0}%`,
                        ram: `${r.ram_usage || 0}%`,
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

    async pingRouter(ip, port) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    const res = await apiFetch('/isp/routers.php');
                    if (res && res.status === 'success') {
                        const match = (res.data.routers || []).find(r => r.ip_address === ip);
                        if (match) {
                            resolve({
                                status: 'success',
                                data: {
                                    status: match.status === 'online' ? 'Online' : 'Offline',
                                    cpu: `${match.cpu_usage || 0}%`,
                                    uptime: match.uptime || 'N/A'
                                }
                            });
                            return;
                        }
                    }
                } catch (err) {
                    console.error("pingRouter fetch failed", err);
                }
                
                resolve({
                    status: 'success',
                    data: {
                        status: 'Offline',
                        cpu: '0%',
                        uptime: 'N/A'
                    }
                });
            }, 500);
        });
    }
};
