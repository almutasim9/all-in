'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { type Client } from '@/lib/types';

interface SetFollowUpDialogProps {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSetFollowUp: (clientId: string, date: string, note: string) => void;
}

export function SetFollowUpDialog({ client, open, onOpenChange, onSetFollowUp }: SetFollowUpDialogProps) {
    const [date, setDate] = useState<Date>();
    const [note, setNote] = useState('');
    const [calendarOpen, setCalendarOpen] = useState(false);

    if (!client) return null;

    const handleSubmit = () => {
        if (date) {
            onSetFollowUp(client.id, date.toISOString().split('T')[0], note);
            setDate(undefined);
            setNote('');
        }
    };

    const quickDates = [
        { label: 'Tomorrow', days: 1 },
        { label: 'In 3 days', days: 3 },
        { label: 'In 1 week', days: 7 },
        { label: 'In 2 weeks', days: 14 },
    ];

    const setQuickDate = (days: number) => {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + days);
        setDate(newDate);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                            <Bell className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <DialogTitle>Set Follow-up Reminder</DialogTitle>
                            <DialogDescription>{client.name}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Quick Date Buttons */}
                    <div>
                        <Label className="text-sm font-medium text-slate-700">Quick Select</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {quickDates.map(({ label, days }) => (
                                <Button
                                    key={days}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuickDate(days)}
                                    className={cn(
                                        "text-xs",
                                        date && Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) === days
                                            ? "border-amber-500 bg-amber-50 text-amber-700"
                                            : ""
                                    )}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Follow-up Date</Label>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => {
                                        setDate(d);
                                        setCalendarOpen(false);
                                    }}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Reminder Note</Label>
                        <Textarea
                            placeholder="e.g., Call to discuss pricing, Send proposal, Schedule demo..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-20 resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!date}
                        className="bg-amber-600 hover:bg-amber-700"
                    >
                        <Bell className="mr-2 h-4 w-4" />
                        Set Reminder
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
