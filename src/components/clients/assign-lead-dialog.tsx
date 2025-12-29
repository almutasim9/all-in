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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Check } from 'lucide-react';
import { type Client, type TeamMember } from '@/lib/types';
import { useData } from '@/lib/data-context';

interface AssignLeadDialogProps {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAssign: (clientId: string, assigneeId: string) => void;
}

export function AssignLeadDialog({ client, open, onOpenChange, onAssign }: AssignLeadDialogProps) {
    const [selectedRep, setSelectedRep] = useState<string | null>(null);
    const { getSalesReps } = useData();
    const salesReps = getSalesReps();

    if (!client) return null;

    const handleAssign = () => {
        if (selectedRep) {
            onAssign(client.id, selectedRep);
            setSelectedRep(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <UserPlus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle>Assign Lead</DialogTitle>
                            <DialogDescription>{client.name}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-2 py-4">
                    <p className="text-sm text-slate-600 mb-3">Select a sales representative:</p>

                    {salesReps.map((rep) => (
                        <button
                            key={rep.id}
                            onClick={() => setSelectedRep(rep.id)}
                            className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${selectedRep === rep.id
                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                : 'border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className={`${selectedRep === rep.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {rep.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">{rep.name}</p>
                                <p className="text-xs text-slate-500">{rep.email}</p>
                            </div>
                            <Badge variant="outline" className={`text-xs ${rep.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                {rep.role === 'admin' ? 'Admin' : 'Sales Rep'}
                            </Badge>
                            {selectedRep === rep.id && (
                                <Check className="h-5 w-5 text-blue-600" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedRep}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Lead
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
