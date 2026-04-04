'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/lib/auth';

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    // To avoid hydration mismatch, we must ensure the server and initial client render match.
    // The user wants to see the dashboard immediately, so we default to isAuthorized=true.
    // If subsequent verification fails, we redirect to login.
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            // Check locally first
            const token = authService.getToken();
            const isLocalValid = !!(token && !authService.isTokenExpired(token));

            if (!isLocalValid) {
                setIsAuthorized(false);
                router.push('/login');
                return;
            }

            // Verify with server in background
            const isValid = await authService.verifyToken();

            if (!isValid) {
                // If server says no, redirect to login
                setIsAuthorized(false);
                router.push('/login');
            } else {
                setIsAuthorized(true);
            }

            setIsChecking(false);
        };

        checkAuth();
    }, [router]);

    if (isChecking) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background font-figtree">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-pace-purple/20 border-t-pace-purple rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
