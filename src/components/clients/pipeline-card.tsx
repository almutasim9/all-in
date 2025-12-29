import { useState } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Client } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { differenceInDays } from 'date-fns';
import { Phone, Calendar, MoreHorizontal, ArrowRight, AlertCircle, Flame, Snowflake, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/lib/data-context';

interface PipelineCardProps {
    client: Client;
    onClick?: () => void;
}

const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    qualifying: 'bg-yellow-100 text-yellow-700',
    proposal: 'bg-purple-100 text-purple-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
};

const statusLabels = {
    new: 'New Lead',
    qualifying: 'Qualifying',
    proposal: 'Proposal Sent',
    won: 'Won Deal',
    lost: 'Lost',
};

export function PipelineCard({ client, onClick }: PipelineCardProps) {
    const { updateClient } = useData();
    const [showLossDialog, setShowLossDialog] = useState(false);
    const [lossReason, setLossReason] = useState<string>('');
    const [lossNote, setLossNote] = useState('');

    const handleStatusChange = (newStatus: Client['status']) => {
        if (newStatus === 'lost') {
            setShowLossDialog(true);
            return;
        }

        performStatusUpdate(newStatus);
    };

    const performStatusUpdate = (newStatus: Client['status'], updates?: Partial<Client>) => {
        updateClient(client.id, { status: newStatus, ...updates });

        if (newStatus === 'won') {
            // Trigger Confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#3B82F6', '#F59E0B'],
            });

            // Show Toast
            toast.success('Congratulations! Deal closed successfully 🎉', {
                description: `${client.name} has been converted to an active client.`,
                duration: 5000,
            });
        } else if (newStatus === 'lost') {
            toast.info('Deal Lost', {
                description: `Client marked as lost. Reason recorded.`,
            });
        } else {
            toast.info('Status Updated', {
                description: `Client moved to ${statusLabels[newStatus]} stage`,
            });
        }
    };

    const handleLossSubmit = () => {
        if (!lossReason) {
            toast.error('Please select a reason for loss');
            return;
        }

        performStatusUpdate('lost', {
            lossReason: lossReason as any,
            lossNote: lossNote
        });
        setShowLossDialog(false);
    };

    const salesReps = useData().getSalesReps();
    const isUnassigned = !client.assignedTo && client.status !== 'won' && client.status !== 'lost';

    const handleAssign = (repId: string) => {
        updateClient(client.id, { assignedTo: repId });
        toast.success('Client Assigned', {
            description: `Client successfully assigned to representative`,
        });
    };

    const getDealHealth = (lastInteractionDate: string) => {
        const lastDate = new Date(lastInteractionDate);
        if (isNaN(lastDate.getTime())) return null; // Safety check

        const days = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (days <= 3) return { label: 'Hot', icon: Flame, color: 'text-orange-600 bg-orange-50 border-orange-200' };
        if (days > 30) return { label: 'Stagnant', icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200' };
        if (days > 14) return { label: 'Cold', icon: Snowflake, color: 'text-blue-600 bg-blue-50 border-blue-200' };
        return null;
    };

    const health = getDealHealth(client.lastInteraction);

    return (
        <>
            <Card
                className={cn(
                    "mb-3 hover:shadow-md transition-shadow duration-200 border-slate-200 cursor-move active:cursor-grabbing", // Changed to cursor-move for clear drag indication
                    isUnassigned && "border-l-4 border-l-orange-400"
                )}
            >
                <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-semibold text-slate-900 line-clamp-1">{client.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-slate-500 line-clamp-1">{client.productInterest}</p>
                                {isUnassigned && (
                                    <Badge variant="secondary" className="text-[10px] px-1 bg-orange-100 text-orange-700 h-5">
                                        Unassigned
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1" onMouseDown={(e) => e.stopPropagation()}> {/* Prevent drag start from buttons */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClick?.();
                                }}
                                title="View Details"
                            >
                                <ArrowRight className="h-4 w-4" /> {/* Using ArrowRight as 'Go to details' */}
                            </Button>

                            {isUnassigned && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                            <AlertCircle className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Assign directly to...</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {salesReps.map((rep) => (
                                            <DropdownMenuItem key={rep.id} onClick={() => handleAssign(rep.id)}>
                                                <span className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                                        {rep.name[0]}
                                                    </div>
                                                    {rep.name}
                                                </span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Move to...</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleStatusChange('new')} disabled={client.status === 'new'}>
                                        New Lead
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange('qualifying')} disabled={client.status === 'qualifying'}>
                                        Qualifying
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange('proposal')} disabled={client.status === 'proposal'}>
                                        Proposal Sent
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange('won')} disabled={client.status === 'won'}>
                                        Won Deal
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange('lost')} disabled={client.status === 'lost'}>
                                        Lost
                                    </DropdownMenuItem>
                                    {client.status === 'lost' && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => performStatusUpdate('new', { lossReason: undefined, lossNote: undefined })}>
                                                <ArrowRight className="mr-2 h-4 w-4" />
                                                Re-target Lead
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>{client.lastInteraction}</span>
                        </div>
                        {health && (
                            <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 gap-1 font-normal", health.color)}>
                                <health.icon className="h-3 w-3" />
                                {health.label}
                            </Badge>
                        )}
                    </div>

                    {client.phone && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-slate-400" />
                                {client.phone}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`tel:${client.phone}`, '_self');
                                }}
                            >
                                <Phone className="h-3 w-3" />
                            </Button>
                        </div>
                    )}

                    {client.notes && (
                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                            {client.notes}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showLossDialog} onOpenChange={setShowLossDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Deal as Lost</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for losing this deal. This helps in future analytics.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Primary Reason</Label>
                            <Select value={lossReason} onValueChange={setLossReason}>
                                <SelectTrigger id="reason">
                                    <SelectValue placeholder="Select reason..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="price">Price too high</SelectItem>
                                    <SelectItem value="competitor">Competitor selected</SelectItem>
                                    <SelectItem value="timing">Bad timing</SelectItem>
                                    <SelectItem value="features">Missing features</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="note">Additional Notes</Label>
                            <Textarea
                                id="note"
                                placeholder="Any specific details..."
                                value={lossNote}
                                onChange={(e) => setLossNote(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLossDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleLossSubmit}>Confirm Loss</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
