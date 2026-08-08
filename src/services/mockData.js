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
        { id: 2, customer: "Jane Smith", subject: "Router configuration", priority: "Medium", status: "Resolved", date: "2026-05-06 11:30" },
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
    ],
    smsProviders: [
        { id: 1, name: "Advanta", balance: "KES 5,400", status: "Connected", api_key: "ADV-XXXX-XXXX" },
        { id: 2, name: "AfricasTalking", balance: "KES 1,200", status: "Connected", api_key: "AT-XXXX-XXXX" },
        { id: 3, name: "Sema", balance: "KES 0", status: "Disconnected", api_key: "SEMA-XXXX-XXXX" },
    ],
    hotspotLogs: [
        { id: 1, entry_id: "TX-9921", stk_sent: "Yes", callback: "Yes", connected: "Yes", mac: "DE:AD:BE:EF:01:23", timestamp: "2026-05-06 14:20:11", reason: "-" },
        { id: 2, entry_id: "TX-9922", stk_sent: "Yes", callback: "No", connected: "No", mac: "AA:BB:CC:DD:EE:FF", timestamp: "2026-05-06 14:22:45", reason: "Callback Timeout (Last 3 checked)" },
        { id: 3, entry_id: "TX-9923", stk_sent: "Yes", callback: "Yes", connected: "No", mac: "11:22:33:44:55:66", timestamp: "2026-05-06 14:25:02", reason: "MikroTik Auth Refused" },
        { id: 4, entry_id: "TX-9924", stk_sent: "No", callback: "No", connected: "No", mac: "77:88:99:AA:BB:CC", timestamp: "2026-05-06 14:28:15", reason: "STK Push Denied" },
        { id: 5, entry_id: "TX-9925", stk_sent: "Yes", callback: "Yes", connected: "Yes", mac: "00:11:22:33:44:55", timestamp: "2026-05-06 14:30:59", reason: "-" },
    ]
};

export const mockCustomers = [
    { id: 1, name: "John Doe", username: "john_pppoe", phone: "0711223344", accountNumber: "0711223344", plan: "5M/5M", price: 1500, amountPaid: 1500, nextPayment: "2026-06-06", status: "enabled", secret: "p@ss123", router: "Main Tower A" },
    { id: 2, name: "Jane Smith", username: "jane_wifi", phone: "0722334455", accountNumber: "4455", plan: "10M/10M", price: 2500, amountPaid: 1250, nextPayment: "2026-06-02", status: "enabled", secret: "secret99", router: "Main Tower A" },
    { id: 3, name: "Robert Ngugi", username: "rob_ngugi", phone: "0733445566", accountNumber: "0733445566", plan: "20M/20M", price: 3500, amountPaid: 0, nextPayment: "2026-04-10", status: "disabled", secret: "rob66", router: "Backup Site B" },
    { id: 4, name: "Alice Wanjiku", username: "ali_wanj", phone: "0744556677", accountNumber: "6677", plan: "5M/5M", price: 1500, amountPaid: 1500, nextPayment: "2026-06-15", status: "enabled", secret: "ali77", router: "Corporate Link" },
    { id: 5, name: "Mercy Mwangi", username: "mercy_m", phone: "0755667788", accountNumber: "0755667788", plan: "10M/10M", price: 2500, amountPaid: 0, nextPayment: "2026-06-12", status: "enabled", secret: "mmm88", router: "Main Tower A" },
];

export const mockPackages = [
    { id: 1, name: "Bronze Plan", limit: "5M/5M", burstLimit: "10M/10M", price: 1500, priority: 8, poolName: "shared-pool" },
    { id: 2, name: "Silver Plan", limit: "10M/10M", burstLimit: "15M/15M", price: 2500, priority: 7, poolName: "shared-pool" },
    { id: 3, name: "Gold Plan", limit: "20M/20M", burstLimit: "30M/30M", price: 3500, priority: 6, poolName: "business-pool" },
    { id: 4, name: "Business Pro", limit: "50M/50M", burstLimit: "0/0", price: 7500, priority: 1, poolName: "dedicated-pool" }
];

export const mockRouters = [
    { id: 1, name: "Main Tower A", ip: "192.168.10.1", status: "online", users: 45, uptime: "15d 4h", model: "MikroTik RB5009", cpu: 12, ram: 45 },
    { id: 2, name: "Backup Site B", ip: "192.168.20.1", status: "online", users: 22, uptime: "42d 12h", model: "MikroTik CCR2004", cpu: 28, ram: 62 },
    { id: 3, name: "Residential Node 1", ip: "10.0.5.1", status: "offline", users: 0, uptime: "0d 0h", model: "MikroTik RB4011", cpu: 0, ram: 0 },
    { id: 4, name: "Corporate Link", ip: "172.16.0.10", status: "online", users: 18, uptime: "128d 1h", model: "MikroTik CCR2116", cpu: 8, ram: 34 },
];
