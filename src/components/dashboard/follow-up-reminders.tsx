'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Calendar, Phone, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { type Client } from '@/lib/types';

interface FollowUpRemindersProps {
    onClientClick?: (client: Client) => void;
}

export function FollowUpReminders({ onClientClick }: FollowUpRemindersProps) {
    const { clients, getTeamMemberById, updateClient } = useData();
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isOverdue = (date: string) => {
        const followUp = new Date(date);
        followUp.setHours(0, 0, 0, 0);
        return followUp < today;
    };

    const isToday = (date: string) => {
        const followUp = new Date(date);
        followUp.setHours(0, 0, 0, 0);
        return followUp.getTime() === today.getTime();
    };

    const allReminders = clients.filter(client => {
        if (!client.followUpDate) return false;
        if (dismissedIds.includes(client.id)) return false;
        if (client.status === 'won' || client.status === 'lost') return false;
        const followUp = new Date(client.followUpDate);
        followUp.setHours(0, 0, 0, 0);
        return followUp <= today;
    });

    const overdueCount = allReminders.filter(c => c.followUpDate && isOverdue(c.followUpDate) && !isToday(c.followUpDate)).length;

    const handleDismiss = (clientId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDismissedIds(prev => [...prev, clientId]);
    };

    const handleMarkDone = (clientId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // Clear the follow-up
        updateClient(clientId, { followUpDate: undefined, followUpNote: undefined });
        setDismissedIds(prev => [...prev, clientId]);
    };

    if (allReminders.length === 0) {
        return null;
    }

    return (
        <Card className="rounded-lg border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                            <Bell className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Follow-up Reminders
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                {overdueCount > 0 && (
                                    <span className="text-red-600 font-medium">
                                        {overdueCount} overdue •
                                    </span>
                                )}{' '}
                                {allReminders.length} total pending
                            </CardDescription>
                        </div>
                    </div>
                    {overdueCount > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {allReminders.slice(0, 5).map((client) => {
                    const assignee = client.assignedTo ? getTeamMemberById(client.assignedTo) : null;
                    const overdue = client.followUpDate ? isOverdue(client.followUpDate) && !isToday(client.followUpDate) : false;

                    return (
                        <div
                            key={client.id}
                            onClick={() => onClientClick?.(client)}
                            className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md ${overdue
                                    ? 'bg-red-50 border-red-200 hover:bg-red-100'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${overdue ? 'bg-red-100' : 'bg-blue-100'
                                    }`}>
                                    <Phone className={`h-4 w-4 ${overdue ? 'text-red-600' : 'text-blue-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{client.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{client.followUpNote}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600 font-medium' : 'text-slate-500'
                                            }`}>
                                            {overdue ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                                            {client.followUpDate && new Date(client.followUpDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                        {assignee && (
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Avatar className="h-4 w-4">
                                                    <AvatarFallback className="text-[8px] bg-slate-200">
                                                        {assignee.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {assignee.name.split(' ')[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-emerald-600 hover:bg-emerald-100"
                                    onClick={(e) => handleMarkDone(client.id, e)}
                                    title="Mark as done"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-slate-400 hover:bg-slate-100"
                                    onClick={(e) => handleDismiss(client.id, e)}
                                    title="Dismiss"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}

                {allReminders.length > 5 && (
                    <p className="text-xs text-center text-slate-500 pt-2">
                        +{allReminders.length - 5} more reminders
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
