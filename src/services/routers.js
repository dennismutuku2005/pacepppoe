export const routerService = {
    async pingRouter(ip, port) {
        // Mock ping
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 'success',
                    data: {
                        status: 'Online',
                        cpu: '24%',
                        uptime: '15d 4h 23m'
                    }
                });
            }, 500);
        });
    }
};
