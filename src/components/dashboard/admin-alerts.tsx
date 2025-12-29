'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    AlertTriangle,
    Clock,
    UserX,
    TrendingDown,
    ChevronRight,
    X
} from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

interface Alert {
    id: string;
    type: 'warning' | 'danger' | 'info';
    title: string;
    description: string;
    icon: React.ReactNode;
    action?: () => void;
    actionLabel?: string;
}

export function AdminAlerts() {
    const { user } = useAuth();
    const { clients, getSalesReps, getClientActivities } = useData();
    const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

    const isAdmin = user?.role === 'admin';
    if (!isAdmin) return null;

    const salesReps = getSalesReps();
    const today = new Date();

    // Generate alerts
    const alerts: Alert[] = [];

    // 1. Inactive reps (no activity in 3+ days)
    salesReps.forEach(rep => {
        const repClients = clients.filter(c => c.assignedTo === rep.id);
        let lastActivity: Date | null = null;

        repClients.forEach(client => {
            const activities = getClientActivities(client.id);
            activities.forEach(activity => {
                if (activity.user === rep.name) {
                    const actDate = new Date(activity.timestamp);
                    if (!lastActivity || actDate > lastActivity) {
                        lastActivity = actDate;
                    }
                }
            });
        });

        if (lastActivity) {
            const activityTime = (lastActivity as Date).getTime();
            const daysSinceActivity = Math.floor((today.getTime() - activityTime) / (1000 * 60 * 60 * 24));
            if (daysSinceActivity >= 3) {
                alerts.push({
                    id: `inactive-${rep.id}`,
                    type: daysSinceActivity >= 7 ? 'danger' : 'warning',
                    title: `${rep.name.split(' ')[0]} inactive`,
                    description: `No logged activity for ${daysSinceActivity} days`,
                    icon: <UserX className="h-4 w-4" />
                });
            }
        }
    });

    // 2. Neglected clients (no follow-up in 14+ days)
    const neglectedClients = clients.filter(client => {
        if (client.status === 'won' || client.status === 'lost') return false;
        if (!client.lastInteraction) return true;

        const lastDate = new Date(client.lastInteraction);
        const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= 14;
    });

    if (neglectedClients.length > 0) {
        alerts.push({
            id: 'neglected-clients',
            type: 'danger',
            title: `${neglectedClients.length} neglected clients`,
            description: 'No contact for 14+ days',
            icon: <Clock className="h-4 w-4" />
        });
    }

    // 3. Low conversion rate reps
    salesReps.forEach(rep => {
        const repClients = clients.filter(c => c.assignedTo === rep.id);
        if (repClients.length >= 5) {
            const wonDeals = repClients.filter(c => c.status === 'won').length;
            const conversionRate = (wonDeals / repClients.length) * 100;
            if (conversionRate < 10) {
                alerts.push({
                    id: `low-conversion-${rep.id}`,
                    type: 'warning',
                    title: `${rep.name.split(' ')[0]}'s conversion low`,
                    description: `Only ${Math.round(conversionRate)}% conversion rate`,
                    icon: <TrendingDown className="h-4 w-4" />
                });
            }
        }
    });

    // 4. Overdue follow-ups
    const overdueFollowUps = clients.filter(client => {
        if (!client.followUpDate) return false;
        if (client.status === 'won' || client.status === 'lost') return false;

        const followUp = new Date(client.followUpDate);
        followUp.setHours(0, 0, 0, 0);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        return followUp < todayStart;
    });

    if (overdueFollowUps.length > 3) {
        alerts.push({
            id: 'overdue-followups',
            type: 'warning',
            title: `${overdueFollowUps.length} overdue follow-ups`,
            description: 'Team needs to catch up',
            icon: <AlertTriangle className="h-4 w-4" />
        });
    }

    // Filter dismissed alerts
    const visibleAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));

    const handleDismiss = (alertId: string) => {
        setDismissedAlerts(prev => [...prev, alertId]);
    };

    if (visibleAlerts.length === 0) {
        return null;
    }

    const getAlertStyle = (type: string) => {
        switch (type) {
            case 'danger':
                return 'bg-red-50 border-red-200 text-red-700';
            case 'warning':
                return 'bg-amber-50 border-amber-200 text-amber-700';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-700';
        }
    };

    const getIconBg = (type: string) => {
        switch (type) {
            case 'danger':
                return 'bg-red-100 text-red-600';
            case 'warning':
                return 'bg-amber-100 text-amber-600';
            default:
                return 'bg-blue-100 text-blue-600';
        }
    };

    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm mb-6">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                            <Bell className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Alerts
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Issues requiring attention
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {visibleAlerts.length} active
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {visibleAlerts.slice(0, 4).map(alert => (
                    <div
                        key={alert.id}
                        className={`flex items-center justify-between rounded-lg border p-2.5 ${getAlertStyle(alert.type)}`}
                    >
                        <div className="flex items-center gap-2">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-md ${getIconBg(alert.type)}`}>
                                {alert.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{alert.title}</p>
                                <p className="text-xs opacity-80">{alert.description}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-50 hover:opacity-100"
                            onClick={() => handleDismiss(alert.id)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
