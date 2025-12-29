'use client';

import { useEffect } from 'react';

export function ServiceWorkerCleanup() {
    useEffect(() => {
        // Only run on client-side
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Check if we are in development mode (or if we just want to force cleanup)
            // Since we disabled SW in dev config, we want to make sure any existing ones are removed.

            navigator.serviceWorker.getRegistrations().then((registrations) => {
                if (registrations.length > 0) {
                    console.log(`🧹 [SW Cleanup] Found ${registrations.length} active Service Workers.`);

                    for (let registration of registrations) {
                        registration.unregister().then((boolean) => {
                            if (boolean) {
                                console.log('✅ [SW Cleanup] Successfully unregistered:', registration.scope);
                                // Optional: Force reload if we really want to be aggressive, but might annoy user.
                                // window.location.reload(); 
                            } else {
                                console.warn('❌ [SW Cleanup] Failed to unregister:', registration.scope);
                            }
                        });
                    }
                } else {
                    console.log('✨ [SW Cleanup] No active Service Workers found. Clean!');
                }
            });
        }
    }, []);

    return null;
}
