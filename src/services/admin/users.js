import { apiFetch } from '@/lib/api';

export const userService = {
    async getUsers() {
        try {
            const res = await apiFetch('/admin/users.php');
            if (res && res.status === 'success') {
                return {
                    status: 'success',
                    data: res.data.users || []
                };
            }
            return { status: 'error', message: res?.message || 'Failed to retrieve users' };
        } catch (e) {
            console.error("getUsers failed", e);
            throw e;
        }
    },

    async createUser(userData) {
        try {
            return await apiFetch('/admin/users.php', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        } catch (e) {
            console.error("createUser failed", e);
            throw e;
        }
    },

    async updateUser(id, userData) {
        try {
            return await apiFetch(`/admin/users.php?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        } catch (e) {
            console.error("updateUser failed", e);
            throw e;
        }
    },

    async deleteUser(id) {
        try {
            return await apiFetch(`/admin/users.php?id=${id}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error("deleteUser failed", e);
            throw e;
        }
    }
};
