export const activeConnectionsService = {
    getActiveConnections: async ({ page = 1, limit = 15, search = '' }) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockData = [
            { id: 1, phone: "0711223344", plan: "1 Hour", amount: 20, type: "M-Pesa", mpesa_code: "RK4S2L9X", created_at: "2026-05-06 10:45", expire_time: "2026-05-06 11:45" },
            { id: 2, phone: "0722334455", plan: "Daily", amount: 50, type: "M-Pesa", mpesa_code: "RL5T3M1A", created_at: "2026-05-06 09:30", expire_time: "2026-05-07 09:30" },
            { id: 3, phone: "0733445566", plan: "Weekly", amount: 350, type: "Voucher", mpesa_code: "VCH-8821", created_at: "2026-05-01 15:00", expire_time: "2026-05-08 15:00" },
            { id: 4, phone: "0744556677", plan: "1 Hour", amount: 20, type: "M-Pesa", mpesa_code: "RM6U4N2B", created_at: "2026-05-06 10:50", expire_time: "2026-05-06 11:50" },
            { id: 5, phone: "0755667788", plan: "Daily", amount: 50, type: "M-Pesa", mpesa_code: "RN7V5P3C", created_at: "2026-05-06 08:15", expire_time: "2026-05-07 08:15" },
        ];

        let filtered = mockData.filter(item => 
            item.phone.includes(search) || 
            item.plan.toLowerCase().includes(search.toLowerCase())
        );

        return {
            status: 'success',
            data: filtered,
            pagination: {
                total: filtered.length,
                has_more: false
            }
        };
    }
};
