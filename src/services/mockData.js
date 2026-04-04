export const mockDashboardData = {
    stats: {
        activeCustomers: 85,
        todayPayments: 12,
        totalRevenueToday: 15600,
        routersOnline: 3,
        routersTotal: 5,
        expiringSoon: 7
    },
    recentPayments: [
        { id: 1, customer: "John Doe", amount: 2500, plan: "10Mbps Home", date: "2026-04-04 14:30", method: "M-Pesa" },
        { id: 2, customer: "Jane Smith", amount: 3500, plan: "20Mbps Pro", date: "2026-04-04 12:15", method: "M-Pesa" },
        { id: 3, customer: "Robert Ngugi", amount: 2500, plan: "10Mbps Home", date: "2026-04-04 10:45", method: "M-Pesa" },
        { id: 4, customer: "Alice Wanjiku", amount: 1500, plan: "5Mbps Basic", date: "2026-04-04 09:20", method: "M-Pesa" },
        { id: 5, customer: "Mercy Mwangi", amount: 2500, plan: "10Mbps Home", date: "2026-04-04 08:05", method: "M-Pesa" }
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
