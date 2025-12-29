'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    UserPlus,
    AlertTriangle,
    Shuffle,
    ArrowRight
} from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function UnassignedLeadsCard() {
    const { user } = useAuth();
    const { clients, getSalesReps, updateClient } = useData();
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [selectedRep, setSelectedRep] = useState<string>('');
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);

    const isAdmin = user?.role === 'admin';
    if (!isAdmin) return null;

    const unassignedClients = clients.filter(c => !c.assignedTo);
    const salesReps = getSalesReps();

    // Count clients per rep for load balancing
    const clientsPerRep = salesReps.map(rep => ({
        ...rep,
        clientCount: clients.filter(c => c.assignedTo === rep.id).length
    })).sort((a, b) => a.clientCount - b.clientCount);

    const handleAutoAssign = async () => {
        if (unassignedClients.length === 0 || salesReps.length === 0) return;

        setIsAutoAssigning(true);

        // Distribute evenly based on current load
        let repIndex = 0;
        const repsWithLoad = [...clientsPerRep];

        for (const client of unassignedClients) {
            // Find rep with least clients
            repsWithLoad.sort((a, b) => a.clientCount - b.clientCount);
            const targetRep = repsWithLoad[0];

            updateClient(client.id, { assignedTo: targetRep.id });
            targetRep.clientCount++;

            // Small delay for visual effect
            await new Promise(r => setTimeout(r, 100));
        }

        setIsAutoAssigning(false);
    };

    const handleAssignToRep = () => {
        if (!selectedRep) return;

        unassignedClients.forEach(client => {
            updateClient(client.id, { assignedTo: selectedRep });
        });

        setShowAssignDialog(false);
        setSelectedRep('');
    };

    if (unassignedClients.length === 0) {
        return (
            <Card className="rounded-lg border-emerald-200 bg-emerald-50 shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                            <Users className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-emerald-800">
                                All Leads Assigned ✓
                            </CardTitle>
                            <CardDescription className="text-xs text-emerald-600">
                                No pending leads to assign
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    return (
        <>
            <Card className={`rounded-lg shadow-sm ${unassignedClients.length > 5
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
                }`}>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${unassignedClients.length > 5 ? 'bg-red-100' : 'bg-amber-100'
                                }`}>
                                {unassignedClients.length > 5 ? (
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                ) : (
                                    <UserPlus className="h-5 w-5 text-amber-600" />
                                )}
                            </div>
                            <div>
                                <CardTitle className={`text-base font-semibold ${unassignedClients.length > 5 ? 'text-red-800' : 'text-amber-800'
                                    }`}>
                                    Unassigned Leads
                                </CardTitle>
                                <CardDescription className={`text-xs ${unassignedClients.length > 5 ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                    {unassignedClients.length > 5
                                        ? 'Needs immediate attention!'
                                        : 'Waiting for assignment'
                                    }
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className={`text-lg font-bold px-3 py-1 ${unassignedClients.length > 5
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                            {unassignedClients.length}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-3">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-white hover:bg-slate-50"
                            onClick={() => setShowAssignDialog(true)}
                        >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign to Rep
                        </Button>
                        <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={handleAutoAssign}
                            disabled={isAutoAssigning || salesReps.length === 0}
                        >
                            {isAutoAssigning ? (
                                <>
                                    <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Distributing...
                                </>
                            ) : (
                                <>
                                    <Shuffle className="h-4 w-4 mr-1" />
                                    Auto-Assign
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Show distribution preview */}
                    <div className="mt-3 pt-3 border-t border-amber-200">
                        <p className="text-xs text-slate-600 mb-2">Current workload:</p>
                        <div className="flex flex-wrap gap-2">
                            {clientsPerRep.map(rep => (
                                <Badge
                                    key={rep.id}
                                    variant="outline"
                                    className="bg-white text-slate-600"
                                >
                                    {rep.name.split(' ')[0]}: {rep.clientCount}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assign Dialog */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign All Unassigned Leads</DialogTitle>
                        <DialogDescription>
                            Assign all {unassignedClients.length} unassigned leads to a sales rep
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={selectedRep} onValueChange={setSelectedRep}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a sales rep" />
                            </SelectTrigger>
                            <SelectContent>
                                {clientsPerRep.map(rep => (
                                    <SelectItem key={rep.id} value={rep.id}>
                                        {rep.name} ({rep.clientCount} clients)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignToRep} disabled={!selectedRep}>
                            Assign {unassignedClients.length} Leads
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
