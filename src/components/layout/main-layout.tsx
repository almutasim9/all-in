'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

interface MainLayoutProps {
    children: React.ReactNode;
    allowedRoles?: ('admin' | 'sales_rep' | 'data_entry')[];
}

export function MainLayout({ children, allowedRoles }: MainLayoutProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }

        // Check role access if allowedRoles is specified
        if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
            // Redirect to appropriate page based on role
            if (user.role === 'data_entry') {
                router.push('/add-lead');
            } else {
                router.push('/');
            }
        }
    }, [user, isLoading, router, allowedRoles]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="text-sm text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <div className="min-h-full p-6 pt-16 lg:p-8 pb-24 md:pb-8">
                    {children}
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
