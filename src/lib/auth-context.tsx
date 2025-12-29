'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

export type UserRole = 'admin' | 'sales_rep' | 'data_entry';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    allowedProvinces?: string[];
    allowedBrands?: string[];
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts - only Admin and Sales Rep
export const demoAccounts: { email: string; password: string; user: User }[] = [
    {
        email: 'ahmed@menuplus.io',
        password: 'admin123',
        user: {
            id: '1',
            name: 'Ahmed Hassan',
            email: 'ahmed@menuplus.io',
            role: 'admin',
        },
    },
    {
        email: 'sarah@menuplus.io',
        password: 'sales123',
        user: {
            id: '2',
            name: 'Sarah Ali',
            email: 'sarah@menuplus.io',
            role: 'sales_rep',
            allowedProvinces: ['Baghdad'],
            allowedBrands: ['brand-1'],
        },
    },
    {
        email: 'omar@menuplus.io',
        password: 'sales123',
        user: {
            id: '4',
            name: 'Omar Khalil',
            email: 'omar@menuplus.io',
            role: 'sales_rep',
            allowedProvinces: ['Basra'],
            allowedBrands: ['brand-2'],
        },
    },
];

import { supabase } from './supabase';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isLoadedRef = useRef(false);

    useEffect(() => {
        let mounted = true;

        // Safety Force Timeout
        const safetyTimer = setTimeout(() => {
            if (mounted && !isLoadedRef.current) {
                console.warn('Auth: Safety timeout triggered. Forcing app load.');
                setIsLoading(false);
                isLoadedRef.current = true;
            }
        }, 3000);

        // Helper to update state and ref
        const finishLoading = () => {
            if (mounted) {
                setIsLoading(false);
                isLoadedRef.current = true;
            }
        };

        // Check active session
        const initSession = async () => {
            console.log('Auth: Starting session check...');

            // OPTIMIZATION: Check localStorage first!
            // Supabase default key is usually: 'sb-<project-ref>-auth-token'
            // But checking *any* key starting with 'sb-' or just assuming checking supabase is fast for valid config
            // Better: If we are on client, we can rely on supabase.auth.getSession() usually being fast for "no session"
            // unless the environment is network restricted.

            // Let's rely on the fact that if there are no env vars we skip.
            // And here we add a check: if process.env.NEXT_PUBLIC_SUPABASE_URL is missing, we already skip.

            try {
                // Quick check for env vars - if missing, fail fast
                if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                    console.warn('Auth: Missing env vars, skipping Supabase check');
                    if (mounted) {
                        setUser(null);
                        finishLoading();
                    }
                    return;
                }

                // Race between Supabase getSession and timeout
                const timeoutPromise = new Promise<{ data: { session: any }, error: any }>((_, reject) =>
                    setTimeout(() => reject(new Error('Auth check timed out')), 2000) // Lowered to 2s
                );

                const { data, error } = await Promise.race([
                    supabase.auth.getSession(),
                    timeoutPromise
                ]) as any;

                if (mounted) {
                    if (data?.session?.user) {
                        console.log('Auth: User found via getSession');
                        mapUser(data.session.user);
                    } else {
                        console.log('Auth: No user session found');
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Error checking session:', error);
                if (mounted) setUser(null);
            } finally {
                finishLoading();
            }
        };

        initSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('Auth: State change event:', _event);
            if (!mounted) return;

            if (session?.user) {
                mapUser(session.user);
            } else {
                setUser(null);
                finishLoading();
            }
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimer);
            subscription.unsubscribe();
        };
    }, []);

    const mapUser = (supabaseUser: any) => {
        const metadata = supabaseUser.user_metadata || {};
        setUser({
            id: supabaseUser.id,
            name: metadata.full_name || metadata.name || supabaseUser.email?.split('@')[0] || 'User',
            email: supabaseUser.email || '',
            role: (metadata.role as UserRole) || 'sales_rep', // Default to sales_rep
            avatar: metadata.avatar_url,
            allowedProvinces: metadata.allowedProvinces,
            allowedBrands: metadata.allowedBrands,
        });
        setIsLoading(false);
        isLoadedRef.current = true;
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setIsLoading(false);
            return { success: false, error: error.message };
        }

        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('menuplus_user'); // Clear legacy data if any
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                logout,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
