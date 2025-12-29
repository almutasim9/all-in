'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function DashboardHeader() {
    const { user } = useAuth();
    const [date, setDate] = useState<Date>(new Date());

    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Sales Overview</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Track your sales performance and team metrics
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                            Add New Client
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
