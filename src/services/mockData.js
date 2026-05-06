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
        totalRevenueMonth: 452000,
        totalExpensesMonth: 128000,
        netProfitMonth: 324000,
        collectionRate: "94.2%",
    },
    recentPayments: [
        { id: 1, customer: "John Doe", amount: 1500, date: "2026-05-06 08:30", method: "M-Pesa", receipt: "RK4S2L9X", plan: "5Mbps Home", status: "Success" },
        { id: 2, customer: "Jane Smith", amount: 2500, date: "2026-05-06 09:15", method: "M-Pesa", receipt: "RL1P0M8A", plan: "10Mbps Home", status: "Success" },
        { id: 3, customer: "Michael Chen", amount: 5000, date: "2026-05-06 14:20", method: "M-Pesa", receipt: "RM9Q3N7B", plan: "20Mbps Office", status: "Success" },
        { id: 4, customer: "Sarah Wilson", amount: 1500, date: "2026-05-05 16:45", method: "M-Pesa", receipt: "RN8R4O6C", plan: "5Mbps Home", status: "Success" },
        { id: 5, customer: "David Brown", amount: 2500, date: "2026-05-05 11:10", method: "M-Pesa", receipt: "RO7S5P5D", plan: "10Mbps Home", status: "Success" },
    ],
    smsLogs: [
        { id: 1, recipient: "254711222333", message: "Your 5Mbps Home subscription is active. Exp: 2026-06-06. Enjoy!", date: "2026-05-06 08:31", status: "Delivered", provider: "Advanta" },
        { id: 2, recipient: "254722333444", message: "Reminder: Your subscription expires in 2 days. Pay KES 2500 to 522533.", date: "2026-05-06 07:00", status: "Delivered", provider: "AfricasTalking" },
        { id: 3, recipient: "254733444555", message: "Alert: Node West-Station is currently offline. We are investigating.", date: "2026-05-05 22:15", status: "Sent", provider: "Advanta" },
        { id: 4, recipient: "254744555666", message: "M-Pesa payment of KES 5000 received. Account: MikeC. Receipt: RM9Q3N7B.", date: "2026-05-05 14:21", status: "Delivered", provider: "AfricasTalking" },
    ],
    expenses: [
        { id: 1, title: "KPLC Electricity - Hub A", amount: 2500, category: "Utilities", date: "2026-05-06", status: "Paid" },
        { id: 2, title: "Fibre Backhaul - Safaricom", amount: 45000, category: "Bandwidth", date: "2026-05-01", status: "Pending" },
        { id: 3, title: "Site Rent - Tower 1", amount: 15000, category: "Rent", date: "2026-04-25", status: "Paid" },
        { id: 4, title: "MikroTik RB5009 Upgrade", amount: 22000, category: "Hardware", date: "2026-04-20", status: "Paid" },
    ],
    tickets: [
        { id: 1, customer: "John Doe", subject: "Slow connection", priority: "High", status: "Open", date: "2026-05-06 10:00" },
        { id: 2, customer: "Jane Smith", subject: "Router configuration", priority: "Medium", status: "In Progress", date: "2026-05-06 11:30" },
        { id: 3, customer: "Alice Wanjiku", subject: "Payment not reflecting", priority: "High", status: "Resolved", date: "2026-05-05 09:15" },
    ],
    packagePopularity: [
        { name: "Bronze 5M", sales: 45, color: "#4B1D8F" },
        { name: "Silver 10M", sales: 28, color: "#6366F1" },
        { name: "Gold 20M", sales: 15, color: "#2CB34A" },
        { name: "Biz Pro 50M", sales: 5, color: "#F59E0B" },
    ],
    revenueByDay: [
        { day: "Mon", revenue: 45000 },
        { day: "Tue", revenue: 32000 },
        { day: "Wed", revenue: 58000 },
        { day: "Thu", revenue: 42000 },
        { day: "Fri", revenue: 65000 },
        { day: "Sat", revenue: 38000 },
        { day: "Sun", revenue: 25000 },
    ],
    incomeVsExpenses: [
        { month: "Jan", income: 380000, expenses: 120000 },
        { month: "Feb", income: 410000, expenses: 145000 },
        { month: "Mar", income: 435000, expenses: 130000 },
        { month: "Apr", income: 452000, expenses: 128000 },
    ]
};

export const mockCustomers = [
    { id: 1, name: "John Doe", username: "john_pppoe", phone: "0711223344", plan: "5M/5M", price: 1500, nextPayment: "2026-06-06", status: "enabled", secret: "p@ss123", router: "Main Tower A" },
    { id: 2, name: "Jane Smith", username: "jane_wifi", phone: "0722334455", plan: "10M/10M", price: 2500, nextPayment: "2026-06-02", status: "enabled", secret: "secret99", router: "Main Tower A" },
    { id: 3, name: "Robert Ngugi", username: "rob_ngugi", phone: "0733445566", plan: "20M/20M", price: 3500, nextPayment: "2026-04-10", status: "disabled", secret: "rob66", router: "Backup Site B" },
    { id: 4, name: "Alice Wanjiku", username: "ali_wanj", phone: "0744556677", plan: "5M/5M", price: 1500, nextPayment: "2026-06-15", status: "enabled", secret: "ali77", router: "Corporate Link" },
    { id: 5, name: "Mercy Mwangi", username: "mercy_m", phone: "0755667788", plan: "10M/10M", price: 2500, nextPayment: "2026-06-12", status: "enabled", secret: "mmm88", router: "Main Tower A" },
];

export const mockPackages = [
    { id: 1, name: "Bronze Plan", limit: "5M/5M", burstLimit: "10M/10M", price: 1500, priority: 8, poolName: "shared-pool" },
    { id: 2, name: "Silver Plan", limit: "10M/10M", burstLimit: "15M/15M", price: 2500, priority: 7, poolName: "shared-pool" },
    { id: 3, name: "Gold Plan", limit: "20M/20M", burstLimit: "30M/30M", price: 3500, priority: 6, poolName: "business-pool" },
    { id: 4, name: "Business Pro", limit: "50M/50M", burstLimit: "0/0", price: 7500, priority: 1, poolName: "dedicated-pool" }
];

export const mockRouters = [
    { id: 1, name: "Main Tower A", ip: "192.168.10.1", status: "online", users: 45, uptime: "15d 4h", model: "MikroTik RB5009" },
    { id: 2, name: "Backup Site B", ip: "192.168.20.1", status: "online", users: 22, uptime: "42d 12h", model: "MikroTik CCR2004" },
    { id: 3, name: "Residential Node 1", ip: "10.0.5.1", status: "offline", users: 0, uptime: "0d 0h", model: "MikroTik RB4011" },
    { id: 4, name: "Corporate Link", ip: "172.16.0.10", status: "online", users: 18, uptime: "128d 1h", model: "MikroTik CCR2116" },
];
