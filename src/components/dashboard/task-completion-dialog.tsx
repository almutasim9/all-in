'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Client } from '@/lib/types';

interface TaskCompletionDialogProps {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (clientId: string, outcome: string, note: string, nextDate?: Date) => void;
}

export function TaskCompletionDialog({ client, open, onOpenChange, onComplete }: TaskCompletionDialogProps) {
    const [outcome, setOutcome] = useState<'interested' | 'busy' | 'not-interested' | 'done'>('interested');
    const [note, setNote] = useState('');
    const [nextDate, setNextDate] = useState<Date | undefined>(addDays(new Date(), 3));
    const [hasNextStep, setHasNextStep] = useState(true);

    if (!client) return null;

    const handleSubmit = () => {
        if (!client) return;
        onComplete(client.id, outcome, note, hasNextStep ? nextDate : undefined);
        onOpenChange(false);
        // Reset form
        setOutcome('interested');
        setNote('');
        setNextDate(addDays(new Date(), 3));
        setHasNextStep(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        Complete Task
                    </DialogTitle>
                    <DialogDescription>
                        Log the outcome for <span className="font-medium text-slate-900">{client.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-3">
                        <Label className="text-base">What was the outcome?</Label>
                        <RadioGroup value={outcome} onValueChange={(v: string) => {
                            setOutcome(v as any);
                            if (v === 'not-interested' || v === 'done') {
                                setHasNextStep(false);
                            } else {
                                setHasNextStep(true);
                            }
                        }}>
                            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                                <RadioGroupItem value="interested" id="r1" />
                                <Label htmlFor="r1" className="cursor-pointer flex-1">
                                    <span className="block font-medium">Interested / Ongoing</span>
                                    <span className="block text-xs text-slate-500">Scheduled next step</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                                <RadioGroupItem value="busy" id="r2" />
                                <Label htmlFor="r2" className="cursor-pointer flex-1">
                                    <span className="block font-medium">Busy / No Answer</span>
                                    <span className="block text-xs text-slate-500">Try again later</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                                <RadioGroupItem value="not-interested" id="r3" />
                                <Label htmlFor="r3" className="cursor-pointer flex-1">
                                    <span className="block font-medium">Not Interested</span>
                                    <span className="block text-xs text-slate-500">Close this lead</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label>Note (Optional)</Label>
                        <Textarea
                            placeholder="Key takeaways from the interaction..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="resize-none"
                            rows={2}
                        />
                    </div>

                    {hasNextStep && (
                        <div className="space-y-2 pt-2 border-t mt-2">
                            <Label>Next Follow-up Date</Label>
                            <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !nextDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {nextDate ? format(nextDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={nextDate}
                                            onSelect={setNextDate}
                                            initialFocus
                                            disabled={(date) => date < new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Button
                                    variant="outline"
                                    onClick={() => setNextDate(addDays(new Date(), 1))}
                                    className="px-3"
                                    type="button"
                                >
                                    Tmrw
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setNextDate(addDays(new Date(), 7))}
                                    className="px-3"
                                    type="button"
                                >
                                    +1 Wk
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Complete Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
