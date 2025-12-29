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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PhoneCall, MapPin, FileText, Mail, Check } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { type Client, type Activity } from '@/lib/types';

interface LogActivityDialogProps {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onActivityAdded?: (activity: Activity) => void;
}

const activityTypes = [
    { type: 'call' as const, label: 'Phone Call', icon: PhoneCall, color: 'blue' },
    { type: 'visit' as const, label: 'Site Visit', icon: MapPin, color: 'emerald' },
    { type: 'email' as const, label: 'Email', icon: Mail, color: 'purple' },
    { type: 'note' as const, label: 'Note', icon: FileText, color: 'amber' },
];

export function LogActivityDialog({ client, open, onOpenChange, onActivityAdded }: LogActivityDialogProps) {
    const [selectedType, setSelectedType] = useState<'call' | 'visit' | 'email' | 'note'>('call');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const { addActivity } = useData();
    const { user } = useAuth();

    if (!client) return null;

    const handleSubmit = async () => {
        if (!description.trim()) return;

        setIsSubmitting(true);

        // Simulate small delay
        await new Promise(resolve => setTimeout(resolve, 200));

        const newActivity = addActivity({
            clientId: client.id,
            type: selectedType,
            description: description.trim(),
            timestamp: new Date().toISOString(),
            user: user?.name || 'Unknown',
        });

        setShowSuccess(true);

        // Reset after short delay
        setTimeout(() => {
            setShowSuccess(false);
            setDescription('');
            setSelectedType('call');
            setIsSubmitting(false);
            onOpenChange(false);
            onActivityAdded?.(newActivity);
        }, 1000);
    };

    const getColorClasses = (color: string, isSelected: boolean) => {
        const colors: Record<string, { selected: string; unselected: string }> = {
            blue: {
                selected: 'border-blue-500 bg-blue-50 ring-1 ring-blue-500',
                unselected: 'border-slate-200 hover:bg-slate-50',
            },
            emerald: {
                selected: 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500',
                unselected: 'border-slate-200 hover:bg-slate-50',
            },
            purple: {
                selected: 'border-purple-500 bg-purple-50 ring-1 ring-purple-500',
                unselected: 'border-slate-200 hover:bg-slate-50',
            },
            amber: {
                selected: 'border-amber-500 bg-amber-50 ring-1 ring-amber-500',
                unselected: 'border-slate-200 hover:bg-slate-50',
            },
        };
        return isSelected ? colors[color].selected : colors[color].unselected;
    };

    const getIconClasses = (color: string, isSelected: boolean) => {
        const colors: Record<string, { selected: string; unselected: string }> = {
            blue: { selected: 'bg-blue-100 text-blue-600', unselected: 'bg-slate-100 text-slate-500' },
            emerald: { selected: 'bg-emerald-100 text-emerald-600', unselected: 'bg-slate-100 text-slate-500' },
            purple: { selected: 'bg-purple-100 text-purple-600', unselected: 'bg-slate-100 text-slate-500' },
            amber: { selected: 'bg-amber-100 text-amber-600', unselected: 'bg-slate-100 text-slate-500' },
        };
        return isSelected ? colors[color].selected : colors[color].unselected;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Log Activity</DialogTitle>
                    <DialogDescription>
                        Record an interaction with {client.name}
                    </DialogDescription>
                </DialogHeader>

                {showSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                            <Check className="h-8 w-8 text-emerald-600" />
                        </div>
                        <p className="text-lg font-medium text-slate-900">Activity Logged!</p>
                        <p className="text-sm text-slate-500">The timeline has been updated</p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {/* Activity Type Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Activity Type</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {activityTypes.map(({ type, label, icon: Icon, color }) => {
                                    const isSelected = selectedType === type;
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setSelectedType(type)}
                                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${getColorClasses(color, isSelected)}`}
                                        >
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${getIconClasses(color, isSelected)}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Description</Label>
                            <Textarea
                                placeholder={
                                    selectedType === 'call'
                                        ? 'What did you discuss?'
                                        : selectedType === 'visit'
                                            ? 'What happened during the visit?'
                                            : selectedType === 'email'
                                                ? 'What was the email about?'
                                                : 'Add your note...'
                                }
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-24 resize-none"
                            />
                        </div>
                    </div>
                )}

                {!showSuccess && (
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!description.trim() || isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Saving...
                                </span>
                            ) : (
                                'Log Activity'
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
