'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';

export function DashboardHeader() {
    const { user } = useAuth();
    const { clients, getClientActivities } = useData();
    const [date, setDate] = useState<Date>(new Date());

    // Calculate streak
    let activityStreak = 0;
    if (user && user.role === 'sales_rep') {
        const myClients = clients.filter(c => c.assignedTo === user.id);
        const checkDate = new Date();
        for (let i = 0; i < 30; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            let hasActivity = false;
            myClients.forEach(client => {
                const activities = getClientActivities(client.id);
                // Also check if any clients were created today/that day as 'activity'? 
                // For now sticking to activities log match
                activities.forEach(activity => {
                    if (activity.timestamp.startsWith(dateStr) && activity.user === user.name) {
                        hasActivity = true;
                    }
                });
            });
            if (hasActivity) {
                activityStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
    }

    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Sales Overview</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Track your sales performance and team metrics
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Activity Streak (Only for Sales Reps) */}
                {user?.role === 'sales_rep' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-100 mr-2">
                        <Zap className="h-4 w-4 text-orange-500 fill-orange-500" />
                        <div className="flex flex-col leading-none">
                            <span className="text-sm font-bold text-orange-700">{activityStreak} Day Streak</span>
                        </div>
                    </div>
                )}

                {/* Date Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'w-[200px] justify-start border-slate-200 bg-white text-left font-normal hover:bg-slate-50',
                                !date && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                            {date ? format(date, 'PPP') : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && setDate(d)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                {/* Add New Client Button - Hidden for Admin */}
                {user?.role !== 'admin' && (
                    <Link href="/add-lead">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Client
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
