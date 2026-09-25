import { apiFetch } from '@/lib/api';

export const ticketService = {
    async getTickets(status = '', priority = '') {
        try {
            const params = new URLSearchParams();
            if (status && status !== 'ALL') params.append('status', status);
            if (priority && priority !== 'ALL') params.append('priority', priority);
            const queryString = params.toString();
            const url = queryString ? `/isp/tickets.php?${queryString}` : '/isp/tickets.php';

            const res = await apiFetch(url);
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: res.data || []
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve support tickets' };
        } catch (e) {
            console.error("getTickets failed", e);
            throw e;
        }
    },

    async getTicket(id) {
        try {
            const res = await apiFetch(`/isp/tickets.php?id=${id}`);
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: res.data
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve ticket' };
        } catch (e) {
            console.error("getTicket failed", e);
            throw e;
        }
    },

    async createTicket(data) {
        try {
            return await apiFetch('/isp/tickets.php', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("createTicket failed", e);
            throw e;
        }
    },

    async updateTicket(id, data) {
        try {
            return await apiFetch(`/isp/tickets.php?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("updateTicket failed", e);
            throw e;
        }
    },

    async deleteTicket(id) {
        try {
            return await apiFetch(`/isp/tickets.php?id=${id}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error("deleteTicket failed", e);
            throw e;
        }
    }
};
