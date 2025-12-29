'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import Link from 'next/link';

export function CompactAlertBar() {
    const { user } = useAuth();
    const { clients, getSalesReps } = useData();
    const [dismissed, setDismissed] = useState(false);

    const isAdmin = user?.role === 'admin';
    if (!isAdmin || dismissed) return null;

    // Count alerts
    const today = new Date();

    // Neglected clients (14+ days)
    const neglectedClients = clients.filter(client => {
        if (client.status === 'won' || client.status === 'lost') return false;
        if (!client.lastInteraction) return true;
        const lastDate = new Date(client.lastInteraction);
        const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= 14;
    }).length;

    // Overdue follow-ups
    const overdueFollowUps = clients.filter(client => {
        if (!client.followUpDate) return false;
        if (client.status === 'won' || client.status === 'lost') return false;
        const followUp = new Date(client.followUpDate);
        followUp.setHours(0, 0, 0, 0);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return followUp < todayStart;
    }).length;

    // Unassigned
    const unassignedCount = clients.filter(c => !c.assignedTo && c.status !== 'won' && c.status !== 'lost').length;

    const totalAlerts = (neglectedClients > 0 ? 1 : 0) + (overdueFollowUps > 0 ? 1 : 0) + (unassignedCount > 0 ? 1 : 0);

    if (totalAlerts === 0) return null;

    const isCritical = neglectedClients > 0 || overdueFollowUps > 0;

    return (
        <div className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-300 ${isCritical ? 'bg-red-50/50 border-red-100' : 'bg-amber-50/50 border-amber-100'}`}>
            <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isCritical ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    <AlertTriangle className={`h-4 w-4 ${isCritical ? 'animate-pulse' : ''}`} />
                </div>
                <div className="flex items-center gap-4 text-sm">
                    {unassignedCount > 0 && (
                        <span className="flex items-center gap-1.5">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {unassignedCount}
                            </Badge>
                            <span className="text-slate-700 font-medium">Unassigned Clients</span>
                        </span>
                    )}
                    {neglectedClients > 0 && (
                        <span className="flex items-center gap-1.5">
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                {neglectedClients}
                            </Badge>
                            <span className="text-slate-700 font-medium">Neglected Clients</span>
                        </span>
                    )}
                    {overdueFollowUps > 0 && (
                        <span className="flex items-center gap-1.5">
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                {overdueFollowUps}
                            </Badge>
                            <span className="text-slate-700 font-medium">Overdue Follow-ups</span>
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Link href="/clients">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-white/50 gap-1 rounded-lg">
                        View Details
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg"
                    onClick={() => setDismissed(true)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
