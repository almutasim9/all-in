'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    CheckCircle,
    AlertTriangle,
    ChevronRight,
    CalendarCheck,
    MessageCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { type Client } from '@/lib/types';
import { TaskCompletionDialog } from './task-completion-dialog';
import { useState } from 'react';

interface TodayScheduleProps {
    onClientClick?: (client: Client) => void;
}

export function TodaySchedule({ onClientClick }: TodayScheduleProps) {
    // State for task completion
    const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
    const [selectedTaskClient, setSelectedTaskClient] = useState<Client | null>(null);

    const { user } = useAuth();
    const { clients, updateClient } = useData();

    if (!user) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get my clients with follow-ups due today or overdue
    const mySchedule = clients
        .filter(c => {
            if (c.assignedTo !== user.id) return false;
            if (!c.followUpDate) return false;
            // if (c.status === 'won' || c.status === 'lost') return false; // Show even if won/lost if follow-up exists
            const followUp = new Date(c.followUpDate);
            followUp.setHours(0, 0, 0, 0);
            return followUp <= today;
        })
        .sort((a, b) => {
            const dateA = new Date(a.followUpDate!);
            const dateB = new Date(b.followUpDate!);
            return dateA.getTime() - dateB.getTime();
        });

    const overdueCount = mySchedule.filter(c => {
        const followUp = new Date(c.followUpDate!);
        followUp.setHours(0, 0, 0, 0);
        return followUp < today;
    }).length;

    const todayCount = mySchedule.length - overdueCount;

    const handleMarkDoneClick = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedTaskClient(client);
        setCompletionDialogOpen(true);
    };

    const handleTaskComplete = (clientId: string, outcome: string, note: string, nextDate?: Date) => {
        // 1. Clear current follow-up
        const updateData: any = {
            followUpDate: undefined,
            followUpNote: undefined
        };

        // 2. Set next follow-up if provided
        if (nextDate) {
            updateData.followUpDate = nextDate.toISOString();
            updateData.followUpNote = note || `Follow up after ${outcome}`;
        }

        // 3. Update status if 'not-interested'
        if (outcome === 'not-interested') {
            updateData.status = 'lost';
            updateData.lossReason = 'Not Interested (Task Completion)';
        }

        // 4. Log activity (Simulated for now, as we don't have direct logActivity exposed here context-wise, 
        // usually would be useData().addActivity. For now we assume updateClient handles simulation or we just stick to data updates)
        // In a real app we'd dispatch addActivity here.

        updateClient(clientId, updateData);
    };

    const isOverdue = (date: string) => {
        const followUp = new Date(date);
        followUp.setHours(0, 0, 0, 0);
        return followUp < today;
    };

    if (mySchedule.length === 0) {
        return (
            <Card className="rounded-lg border-slate-200 shadow-sm mb-6">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                            <CalendarCheck className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Today&apos;s Schedule
                            </CardTitle>
                            <CardDescription className="text-xs text-emerald-600">
                                ✓ No follow-ups scheduled for today
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    return (
        <>
            <Card className="rounded-lg border-slate-200 shadow-sm mb-6">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                                <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-900">
                                    Today&apos;s Schedule
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500">
                                    {todayCount > 0 && `${todayCount} today`}
                                    {todayCount > 0 && overdueCount > 0 && ' • '}
                                    {overdueCount > 0 && (
                                        <span className="text-red-600 font-medium">{overdueCount} overdue</span>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {mySchedule.length} tasks
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {mySchedule.slice(0, 5).map((client, index) => {
                        const overdue = isOverdue(client.followUpDate!);

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
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-slate-900 truncate">{client.name}</p>
                                            {overdue && (
                                                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs px-1.5 py-0">
                                                    Overdue
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{client.followUpNote || 'Follow up required'}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                {new Date(client.followUpDate!).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                            {client.address && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <MapPin className="h-3 w-3" />
                                                    {client.address.split(',')[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    {client.phone && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-green-600 hover:bg-green-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const phone = client.phone?.replace(/\D/g, '').replace(/^0+/, ''); // basic cleanup
                                                // Assuming IQ +964 if not present, but for now just send as is or with prefix if needed
                                                // A safer way for local numbers:
                                                window.open(`https://wa.me/${phone}`, '_blank');
                                            }}
                                            title="WhatsApp"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`tel:${client.phone}`, '_self');
                                        }}
                                        title="Call"
                                    >
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    {client.googleMapsUrl && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-amber-600 hover:bg-amber-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(client.googleMapsUrl, '_blank');
                                            }}
                                            title="Map"
                                        >
                                            <MapPin className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <div className="w-px h-4 bg-slate-200 mx-1" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                        onClick={(e) => handleMarkDoneClick(client, e)}
                                        title="Complete Task"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    {mySchedule.length > 5 && (
                        <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-700">
                            View all {mySchedule.length} tasks
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    )}
                </CardContent>
            </Card>

            <TaskCompletionDialog
                client={selectedTaskClient}
                open={completionDialogOpen}
                onOpenChange={setCompletionDialogOpen}
                onComplete={handleTaskComplete}
            />
        </>
    );
}
