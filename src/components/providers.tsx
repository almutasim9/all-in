'use client';

import { ReactNode } from 'react';
import { ClientProvider } from '@/contexts/client-context';
import { TeamProvider } from '@/contexts/team-context';
import { ProductProvider } from '@/contexts/product-context';
import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/contexts/language-context';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <LanguageProvider>
                <ClientProvider>
                    <TeamProvider>
                        <ProductProvider>
                            {children}
                        </ProductProvider>
                    </TeamProvider>
                </ClientProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}
