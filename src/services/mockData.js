export const mockDashboardData = {
    stats: {
        activeCustomers: 85,
        todayPayments: 12,
        totalRevenueToday: 15600,
        routersOnline: 3,
        routersTotal: 5,
        expiringSoon: 7,
        paybill: "522533",
        accountName: "PACE ISP",
        totalExpensesToday: 4200,
        activeStaff: 4,
        smsBalance: 1250,
    },
    recentPayments: [
        { id: 1, customer: "John Doe", amount: 1500, date: "2024-04-04 08:30", method: "M-Pesa", receipt: "RK4S2L9X", plan: "5Mbps Home", status: "Success" },
        { id: 2, customer: "Jane Smith", amount: 2500, date: "2024-04-04 09:15", method: "M-Pesa", receipt: "RL1P0M8A", plan: "10Mbps Home", status: "Success" },
        { id: 3, customer: "Michael Chen", amount: 5000, date: "2024-04-03 14:20", method: "M-Pesa", receipt: "RM9Q3N7B", plan: "20Mbps Office", status: "Success" },
        { id: 4, customer: "Sarah Wilson", amount: 1500, date: "2024-04-03 16:45", method: "M-Pesa", receipt: "RN8R4O6C", plan: "5Mbps Home", status: "Success" },
        { id: 5, customer: "David Brown", amount: 2500, date: "2024-04-02 11:10", method: "M-Pesa", receipt: "RO7S5P5D", plan: "10Mbps Home", status: "Success" },
    ],

    smsLogs: [
        { id: 1, recipient: "0711222333", message: "Your 5Mbps Home subscription is active. Exp: 2024-05-04. Enjoy!", date: "2024-04-04 08:31", status: "Delivered" },
        { id: 2, recipient: "0722333444", message: "Reminder: Your subscription expires in 2 days. Pay KES 2500 to 522533.", date: "2024-04-04 07:00", status: "Delivered" },
        { id: 3, recipient: "0733444555", message: "Alert: Node West-Station is currently offline. We are investigating.", date: "2024-04-03 22:15", status: "Sent" },
        { id: 4, recipient: "0744555666", message: "M-Pesa payment of KES 5000 received. Account: MikeC. Receipt: RM9Q3N7B.", date: "2024-04-03 14:21", status: "Delivered" },
    ],

    expenses: [
        { id: 1, title: "KPLC Electricity - Hub A", amount: 2500, category: "Utilities", date: "2024-04-04", status: "Paid" },
        { id: 2, title: "Fibre Backhaul - Safaricom", amount: 45000, category: "Bandwidth", date: "2024-04-01", status: "Pending" },
        { id: 3, title: "Site Rent - Tower 1", amount: 15000, category: "Rent", date: "2024-03-25", status: "Paid" },
        { id: 4, title: "MikroTik RB5009 Upgrade", amount: 22000, category: "Hardware", date: "2024-03-20", status: "Paid" },
    ],

    staff: [
        { id: 1, name: "Admin User", role: "Super Admin", phone: "0712345678", email: "admin@pace.com", status: "Active", policies: ["all"] },
        { id: 2, name: "Dennis Mutuku", role: "Technical Lead", phone: "0723456789", email: "dennis@pace.com", status: "Active", policies: ["routers", "customers", "sms"] },
        { id: 3, name: "Mercy Wanjiku", role: "Accounts", phone: "0734567890", email: "mercy@pace.com", status: "Active", policies: ["billing", "expenses"] },
        { id: 4, name: "Kelvin Kibet", role: "Support", phone: "0745678901", email: "kelvin@pace.com", status: "Inactive", policies: ["customers", "sms"] },
    ],

    packagePopularity: [
        { name: "5Mbps Home", sales: 45, revenue: 67500 },
        { name: "10Mbps Home", sales: 32, revenue: 80000 },
        { name: "20Mbps Office", sales: 12, revenue: 60000 },
        { name: "50Mbps Gaming", sales: 5, revenue: 37500 },
    ],
    routerStatus: [
        { id: 1, name: "Main Tower A", ip: "192.168.10.1", status: "online", users: 45 },
        { id: 2, name: "Backup Site B", ip: "192.168.20.1", status: "online", users: 22 },
        { id: 3, name: "Residential Node 1", ip: "10.0.5.1", status: "offline", users: 0 },
        { id: 4, name: "Corporate Link", ip: "172.16.0.10", status: "online", users: 18 },
        { id: 5, name: "Downtown AP", ip: "10.10.30.5", status: "offline", users: 0 }
    ]
};

export const mockCustomers = [
    { id: 1, name: "John Doe", username: "john_pppoe", phone: "0711223344", plan: "10Mbps Home", price: 2500, nextPayment: "2026-05-04", status: "enabled", secret: "p@ss123" },
    { id: 2, name: "Jane Smith", username: "jane_wifi", phone: "0722334455", plan: "20Mbps Pro", price: 3500, nextPayment: "2026-05-02", status: "enabled", secret: "secret99" },
    { id: 3, name: "Robert Ngugi", username: "rob_ngugi", phone: "0733445566", plan: "10Mbps Home", price: 2500, nextPayment: "2026-04-10", status: "disabled", secret: "rob66" },
    { id: 4, name: "Alice Wanjiku", username: "ali_wanj", phone: "0744556677", plan: "5Mbps Basic", price: 1500, nextPayment: "2026-05-15", status: "enabled", secret: "ali77" },
    { id: 5, name: "Mercy Mwangi", username: "mercy_m", phone: "0755667788", plan: "10Mbps Home", price: 2500, nextPayment: "2026-05-12", status: "enabled", secret: "mmm88" },
    { id: 6, name: "Dennis Mutuku", username: "denno_isp", phone: "0766778899", plan: "50Mbps Business", price: 7500, nextPayment: "2026-05-01", status: "enabled", secret: "denno50" },
    { id: 7, name: "Sarah King", username: "sarah_k", phone: "0777889900", plan: "10Mbps Home", price: 2500, nextPayment: "2026-04-01", status: "disabled", secret: "sking01" }
];

export const mockPayments = [
    { id: 1, customer: "John Doe", amount: 2500, plan: "10Mbps Home", date: "2026-04-04 14:30", receipt: "RKD45G67J", status: "completed" },
    { id: 2, customer: "Jane Smith", amount: 3500, plan: "20Mbps Pro", date: "2026-04-04 12:15", receipt: "RKE90F21K", status: "completed" },
    { id: 3, customer: "Robert Ngugi", amount: 2500, plan: "10Mbps Home", date: "2026-03-10 10:45", receipt: "RJB12H88L", status: "completed" },
    { id: 4, customer: "Sarah King", amount: 2500, plan: "10Mbps Home", date: "2026-03-01 09:00", receipt: "RIA55T22M", status: "completed" }
];

export const mockPackages = [
    { id: 1, name: "5Mbps Basic", speed: "5M/5M", price: 1500 },
    { id: 2, name: "10Mbps Home", speed: "10M/10M", price: 2500 },
    { id: 3, name: "20Mbps Pro", speed: "20M/20M", price: 3500 },
    { id: 4, name: "50Mbps Business", speed: "50M/50M", price: 7500 }
];
