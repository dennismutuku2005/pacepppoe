import { apiFetch } from '@/lib/api';

export const profileService = {
    async getProfile() {
        try {
            return await apiFetch('/isp/profile.php');
        } catch (e) {
            console.error("getProfile failed", e);
            throw e;
        }
    },

    async updateProfile(data) {
        try {
            return await apiFetch('/isp/profile.php', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("updateProfile failed", e);
            throw e;
        }
    }
};
