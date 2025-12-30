'use client';

import { LayoutDashboard, Users, Map, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNav() {
    const pathname = usePathname();

    const links = [
        {
            label: 'Home',
            icon: LayoutDashboard,
            href: '/',
            active: pathname === '/'
        },
        {
            label: 'Clients',
            icon: Users,
            href: '/my-clients', // We might need to handle tab switching if purely client-side
            active: pathname.includes('/my-clients')
        },
        // Map feature placeholder - normally would route to a map page or tab
        {
            label: 'Map',
            icon: Map,
            href: '/map', // Placeholder route
            active: pathname.includes('/map')
        },
        {
            label: 'Profile',
            icon: UserCircle,
            href: '/profile', // Placeholder route
            active: pathname.includes('/profile')
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-6 py-2 pb-safe md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
                {links.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className={`flex flex-col items-center gap-1 min-w-[64px] ${link.active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <link.icon className={`h-6 w-6 ${link.active ? 'fill-current' : ''}`} strokeWidth={link.active ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{link.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
