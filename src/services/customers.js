import { mockCustomers } from './mockData';

export const customerService = {
    getCustomers: async ({ search = '', limit = 100 }) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let filtered = mockCustomers.filter(c => 
            (c.phone && c.phone.includes(search)) || 
            (c.name && c.name.toLowerCase().includes(search.toLowerCase()))
        );

        if (limit) {
            filtered = filtered.slice(0, limit);
        }

        return {
            status: 'success',
            data: filtered.map(c => ({
                id: c.id,
                phone: c.phone || '0712345678',
                status: c.status || 'Active',
                totalSpent: c.walletBalance || 0,
                mac: c.mac || '00:00:00:00:00:00'
            }))
        };
    }
};
