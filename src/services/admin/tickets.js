import { apiFetch } from '@/lib/api';

export const ticketService = {
    async getTickets(status = '') {
        try {
            const url = status ? `/admin/tickets.php?status=${status}` : '/admin/tickets.php';
            return await apiFetch(url);
        } catch (e) {
            console.error("getTickets failed", e);
            throw e;
        }
    },

    async updateTicket(id, data) {
        try {
            return await apiFetch(`/admin/tickets.php?id=${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("updateTicket failed", e);
            throw e;
        }
    },

    async deleteTicket(id) {
        try {
            return await apiFetch(`/admin/tickets.php?id=${id}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error("deleteTicket failed", e);
            throw e;
        }
    }
};
