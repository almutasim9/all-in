'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useData } from '@/lib/data-context';
import { Button } from '@/components/ui/button';
import {
    MapPin,
    Phone,
    MoreVertical,
    GripVertical
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AssignmentsTab() {
    const { clients, teamMembers, updateClient } = useData();
    const [draggedClientId, setDraggedClientId] = useState<string | null>(null);

    // Get unassigned leads
    const unassignedLeads = clients.filter(c => !c.assignedTo && c.status === 'new');

    // Get active sales reps
    const salesReps = teamMembers.filter(m => m.role === 'sales_rep' && m.status === 'active');

    const handleDragStart = (e: React.DragEvent, clientId: string) => {
        setDraggedClientId(clientId);
        e.dataTransfer.setData('clientId', clientId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, repId: string) => {
        e.preventDefault();
        const clientId = e.dataTransfer.getData('clientId');

        if (clientId) {
            assignClientToRep(clientId, repId);
        }
        setDraggedClientId(null);
    };

    const assignClientToRep = (clientId: string, repId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            updateClient(clientId, {
                assignedTo: repId,
                status: 'new', // Keep as 'new' to indicate it's a fresh assignment waiting for acceptance/action
                notes: client.notes ? `${client.notes} | Assigned to ${teamMembers.find(m => m.id === repId)?.name}` : `Assigned to ${teamMembers.find(m => m.id === repId)?.name}`
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-900">Assignments</h2>
                <p className="text-sm text-slate-500">
                    Drag and drop unassigned clients to the appropriate representative
                </p>
            </div>

            <div className="flex gap-6 h-[calc(100vh-250px)] overflow-hidden">
                {/* Unassigned Column */}
                <div className="w-1/3 flex flex-col bg-slate-50 rounded-lg border border-slate-200">
                    <div className="p-4 border-b border-slate-200 bg-white rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-700">New Clients (Unassigned)</h3>
                            <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                                {unassignedLeads.length}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {unassignedLeads.map(client => (
                            <Card
                                key={client.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, client.id)}
                                className={`cursor-move hover:shadow-md transition-shadow border-slate-200 hover:border-blue-300 ${draggedClientId === client.id ? 'opacity-50' : ''}`}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="h-4 w-4 text-slate-400" />
                                            <h4 className="font-medium text-slate-900 text-sm">{client.name}</h4>
                                        </div>
                                        {client.province && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 h-5">
                                                {client.province}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="pl-6 space-y-1">
                                        {client.phone && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Phone className="h-3 w-3" />
                                                <span dir="ltr">{client.phone}</span>
                                            </div>
                                        )}
                                        {client.address && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate max-w-[200px]">{client.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {unassignedLeads.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                                No new clients found
                            </div>
                        )}
                    </div>
                </div>

                {/* Representatives Columns */}
                <div className="w-2/3 grid grid-cols-2 gap-4 overflow-y-auto pb-4">
                    {salesReps.map(rep => {
                        // Handover Logic: Only show clients that are assigned but still 'new' (waiting for action)
                        const assignedClients = clients.filter(c => c.assignedTo === rep.id && c.status === 'new');
                        return (
                            <div
                                key={rep.id}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, rep.id)}
                                className="flex flex-col bg-slate-50 rounded-lg border border-slate-200 h-full"
                            >
                                <div className="p-4 border-b border-slate-200 bg-white rounded-t-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-slate-200">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                                                {rep.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-sm">{rep.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                                    {assignedClients.length} active tasks
                                                </Badge>
                                                {rep.allowedProvinces && rep.allowedProvinces.length > 0 && (
                                                    <span className="text-[10px] text-slate-500">{rep.allowedProvinces.join(', ')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Show count of all active tasks */}
                                <div className="mb-2 px-1 flex items-center justify-between text-xs text-slate-500">
                                    <span>Recent Assignments</span>
                                    <span>{assignedClients.length} Total Active</span>
                                </div>

                                {assignedClients.length > 0 ? (
                                    <>
                                        {/* Show only last 5 assigned clients */}
                                        {assignedClients.slice(-5).reverse().map(client => (
                                            <Card
                                                key={client.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, client.id)}
                                                className={`cursor-move hover:shadow-md transition-shadow bg-white ${draggedClientId === client.id ? 'opacity-50' : ''}`}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex items-start justify-between">
                                                        <h4 className="font-medium text-slate-900 text-sm truncate pr-2">{client.name}</h4>
                                                        {client.province && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 h-5 shrink-0">
                                                                {client.province}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 flex items-center justify-between">
                                                        <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-600">
                                                            {client.status}
                                                        </Badge>
                                                        {client.phone && (
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                                <Phone className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {assignedClients.length > 5 && (
                                            <div className="text-center py-2 text-xs text-slate-400 italic">
                                                + {assignedClients.length - 5} more active clients
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="h-full border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm min-h-[100px] transition-colors hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500">
                                        Drop clients here to assign
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div >
    );
}
