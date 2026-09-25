'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/lib/auth';

export default function ProtectedRoute({ children, allowedRoles = null }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = authService.getToken();
            const isLocalValid = !!(token && !authService.isTokenExpired(token));

            if (!isLocalValid) {
                setIsAuthorized(false);
                setIsChecking(false);
                router.replace('/login');
                return;
            }

            // Verify with server
            const isValid = await authService.verifyToken();
            if (!isValid) {
                setIsAuthorized(false);
                setIsChecking(false);
                router.replace('/login');
                return;
            }

            // Role verification
            const user = authService.getUser();
            const userRole = (user?.type || user?.role || '').toLowerCase();
            const isAdmin = userRole === 'admin' || userRole === 'superadmin';
            const isIsp = userRole === 'isp';

            if (allowedRoles && allowedRoles.length > 0) {
                const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
                const isRolePermitted = normalizedAllowed.includes(userRole);

                if (!isRolePermitted) {
                    setIsAuthorized(false);
                    setIsChecking(false);

                    // Cross-portal guard: Admin trying to access ISP, or ISP trying to access Admin
                    if (isAdmin) {
                        router.replace('/admin');
                    } else if (isIsp) {
                        router.replace('/dashboard');
                    } else {
                        router.replace('/login');
                    }
                    return;
                }
            }

            setIsAuthorized(true);
            setIsChecking(false);
        };

        checkAuth();
    }, [router, allowedRoles]);

    if (isChecking || !isAuthorized) {
        return (
            <div className="min-h-screen w-screen flex items-center justify-center bg-card-bg font-figtree">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-pace-purple/20 border-t-pace-purple rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold text-admin-dim">Verifying access credentials...</span>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

