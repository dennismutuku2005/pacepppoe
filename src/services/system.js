import authService from '@/lib/auth'
import { API_BASE } from '@/lib/api-config'

export const systemService = {
    getSettings: async () => {
        try {
            const url = `${API_BASE}/system_data.php`
            const res = await authService.authenticatedFetch(url)
            return await res.json()
        } catch (error) {
            console.error('Error fetching system settings:', error)
            return { status: 'error', message: error.message }
        }
    },
    updateSettings: async (settings) => {
        try {
            const url = `${API_BASE}/system_data.php`
            const res = await authService.authenticatedFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            return await res.json()
        } catch (error) {
            console.error('Error updating system settings:', error)
            return { status: 'error', message: error.message }
        }
    },
    getNotifications: async (page = 1, limit = 15) => {
        try {
            const url = `${API_BASE}/notifications.php?page=${page}&limit=${limit}`
            const res = await authService.authenticatedFetch(url)
            return await res.json()
        } catch (error) {
            console.error('Error fetching notifications:', error)
            return { status: 'error', message: error.message }
        }
    },
    markNotificationAsRead: async (id = null) => {
        try {
            const url = `${API_BASE}/notifications.php`
            const res = await authService.authenticatedFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_read', id })
            })
            return await res.json()
        } catch (error) {
            console.error('Error updating notification:', error)
            return { status: 'error', message: error.message }
        }
    }
}
