'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Package,
    UsersRound,
    BarChart3,
    LogOut,
    Menu,
    X,
    UtensilsCrossed,
    Target,
    KanbanSquare,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    roles: ('admin' | 'sales_rep' | 'data_entry')[];
}



const roleLabels = {
    admin: 'Admin',
    sales_rep: 'Sales Rep',
    data_entry: 'Data Entry',
};

const roleColors = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    sales_rep: 'bg-blue-100 text-blue-700 border-blue-200',
    data_entry: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isLoading } = useAuth();
    const { t } = useLanguage();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems: NavItem[] = [
        { label: t('sidebar.dashboard'), href: '/', icon: LayoutDashboard, roles: ['admin', 'sales_rep'] },
        { label: t('sidebar.pipeline'), href: '/pipeline', icon: KanbanSquare, roles: ['sales_rep'] },
        { label: t('sidebar.clients'), href: '/clients', icon: Users, roles: ['admin', 'sales_rep'] },
        { label: t('sidebar.products'), href: '/products', icon: Package, roles: ['admin', 'sales_rep'] },
        { label: t('sidebar.team'), href: '/team', icon: UsersRound, roles: ['admin'] },
        { label: t('sidebar.reports'), href: '/reports', icon: BarChart3, roles: ['admin'] },
    ];

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return null;
    }

    const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 px-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
                    <UtensilsCrossed className="h-5 w-5" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-slate-900">Menu Plus</span>
                        <span className="text-xs text-slate-500">CRM Dashboard</span>
                    </div>
                )}
            </div>

            <Separator className="my-2" />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-4">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                                isCollapsed && 'justify-center px-2'
                            )}
                        >
                            <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900')} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <Separator className="my-2" />

            {/* User Profile */}
            <div className="p-3">
                <div
                    className={cn(
                        'flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-100',
                        isCollapsed && 'justify-center'
                    )}
                >
                    <Avatar className="h-9 w-9 border-2 border-slate-200">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                            {user.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                            <Badge variant="outline" className={cn('text-xs mt-0.5', roleColors[user.role])}>
                                {roleLabels[user.role]}
                            </Badge>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <div className="mb-2 px-2">
                        <LanguageSwitcher />
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className={cn(
                        'mt-2 w-full justify-start gap-2 text-slate-600 hover:bg-red-50 hover:text-red-600',
                        isCollapsed && 'justify-center px-2'
                    )}
                >
                    <LogOut className="h-4 w-4" />
                    {!isCollapsed && <span>Logout</span>}
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed left-4 top-4 z-50 lg:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-xl transition-transform duration-300 lg:hidden',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'hidden h-screen border-r rtl:border-r-0 rtl:border-l border-slate-200 bg-white transition-all duration-300 lg:flex lg:flex-col relative',
                    isCollapsed ? 'w-16' : 'w-64'
                )}
            >
                <SidebarContent />

                {/* Collapse Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-3 top-10 z-20 h-8 w-8 rounded-full border border-slate-200 bg-white shadow-md hover:bg-slate-50 text-slate-600 transition-all duration-200"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </aside>
        </>
    );
}
