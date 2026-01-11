'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const PUBLIC_ROUTES = ['/login', '/signup', '/'];

export function RouteProtector({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const hasCheckedAuth = useRef(false);

    useEffect(() => {
        // Wait for Firebase to complete initial auth state check
        if (loading) {
            hasCheckedAuth.current = false;
            return;
        }

        // Only perform redirects after we've confirmed auth state
        hasCheckedAuth.current = true;

        // If user is not authenticated and trying to access protected route
        if (!user && !isPublicRoute) {
            router.push('/login');
        }

        // If user is authenticated and trying to access login/signup, redirect to dashboard
        if (user && (pathname === '/login' || pathname === '/signup')) {
            router.push('/dashboard');
        }
    }, [user, loading, pathname, router, isPublicRoute]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
