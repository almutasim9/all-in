'use client';

import { useState } from 'react';
import { Client } from '@/lib/types';
import { PipelineCard } from './pipeline-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useData } from '@/lib/data-context';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Star, Lightbulb, FileText, Trophy, XCircle, LucideIcon } from 'lucide-react';

// ...

interface PipelineViewProps {
    clients: Client[];
    repId?: string; // Optional filter by Sales Representative
    allowedProvinces?: string[]; // Optional restriction for province filter
    onClientClick?: (client: Client) => void; // Handler for clicking a client card
}

type Status = 'new' | 'qualifying' | 'proposal' | 'won' | 'lost';

const columns: { id: Status; label: string; color: string; icon: LucideIcon; bg: string }[] = [
    { id: 'new', label: 'New Leads', color: 'border-blue-500', icon: Star, bg: 'bg-blue-50/30' },
    { id: 'qualifying', label: 'Qualifying', color: 'border-amber-500', icon: Lightbulb, bg: 'bg-amber-50/30' },
    { id: 'proposal', label: 'Proposal Sent', color: 'border-purple-500', icon: FileText, bg: 'bg-purple-50/30' },
    { id: 'won', label: 'Won Deals', color: 'border-green-500', icon: Trophy, bg: 'bg-green-50/30' },
    { id: 'lost', label: 'Lost', color: 'border-red-500', icon: XCircle, bg: 'bg-red-50/30' },
];

interface PipelineColumnProps {
    status: Status;
    label: string;
    color: string;
    icon: LucideIcon;
    bg: string;
    clients: Client[];
    draggedClientId: string | null;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragEnd: () => void;
    onDrop: (e: React.DragEvent, status: Status) => void;
    onClientClick?: (client: Client) => void;
}

const PipelineColumn = ({
    status,
    label,
    color,
    icon: Icon,
    bg,
    clients,
    draggedClientId,
    onDragStart,
    onDragEnd,
    onDrop,
    onClientClick
}: PipelineColumnProps) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const isDragOver = draggedClientId && draggedClientId !== null;

    return (
        <div
            className={cn(
                "flex flex-col h-full rounded-xl border transition-colors duration-200 overflow-hidden",
                isDragOver ? "border-slate-300 bg-slate-50" : "border-slate-200",
                bg
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => onDrop(e, status)}
        >
            {/* Header */}
            <div className={cn('p-4 border-t-4 bg-white/80 backdrop-blur-sm border-b border-b-slate-100 flex items-center gap-3 sticky top-0 z-10', color)}>
                <div className={cn("p-2 rounded-lg bg-slate-100", getIconColor(status))}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight">{label}</h3>
                    <span className={cn(
                        "text-xs px-2 py-1 rounded-full font-semibold",
                        clients.length > 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                    )}>
                        {clients.length}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-hide space-y-3">
                {clients.length > 0 ? (
                    clients.map((client) => (
                        <div
                            key={client.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, client.id)}
                            onDragEnd={onDragEnd}
                            onClick={() => { }}
                            className={cn(
                                "cursor-move transition-transform duration-200",
                                draggedClientId === client.id ? "opacity-50 scale-95" : "opacity-100 hover:scale-[1.02]"
                            )}
                        >
                            <PipelineCard
                                client={client}
                                onClick={() => onClientClick?.(client)}
                            />
                        </div>
                    ))
                ) : (
                    <div className={cn(
                        "h-32 flex flex-col items-center justify-center text-slate-400 text-xs italic border-2 border-dashed rounded-xl m-1 transition-colors",
                        draggedClientId ? "border-blue-400 bg-blue-50/50 text-blue-600" : "border-slate-200"
                    )}>
                        <Icon className={cn("h-6 w-6 mb-2 opacity-50", draggedClientId ? "animate-bounce" : "")} />
                        {draggedClientId ? 'Drop here to move' : 'No clients'}
                    </div>
                )}
            </div>
        </div>
    );
};

function getIconColor(status: Status) {
    switch (status) {
        case 'new': return 'text-blue-600 bg-blue-50';
        case 'qualifying': return 'text-amber-600 bg-amber-50';
        case 'proposal': return 'text-purple-600 bg-purple-50';
        case 'won': return 'text-green-600 bg-green-50';
        case 'lost': return 'text-red-600 bg-red-50';
        default: return 'text-slate-600 bg-slate-50';
    }
}

export function PipelineView({ clients, repId, allowedProvinces, onClientClick }: PipelineViewProps) {
    const [draggedClientId, setDraggedClientId] = useState<string | null>(null);
    const { updateClient } = useData(); // Needed for DnD updates
    const [activeTab, setActiveTab] = useState<Status>('new');
    const [selectedProvince, setSelectedProvince] = useState<string>('all');

    // List of governorates
    const allProvinces = [
        'Baghdad', 'Basra', 'Nineveh', 'Erbil', 'Najaf',
        'Karbala', 'Sulaymaniyah', 'Duhok', 'Kirkuk', 'Dhi Qar',
        'Diyala', 'Wasit', 'Maysan', 'Al-Muthanna', 'Babylon',
        'Anbar', 'Al-Qadisiyah', 'Saladin'
    ];

    // Filter provinces if user has restrictions
    const provinces = allowedProvinces && allowedProvinces.length > 0
        ? allProvinces.filter(p => allowedProvinces.includes(p))
        : allProvinces;

    const getClientsByStatus = (status: Status) => {
        return clients.filter((client) => {
            // Rep filter
            if (repId && repId !== 'all' && client.assignedTo !== repId) {
                return false;
            }

            // Province filter
            if (selectedProvince !== 'all') {
                if (client.province !== selectedProvince) return false;
            } else {
                // If 'all' is selected but user has restrictions, only show allowed provinces
                if (allowedProvinces && allowedProvinces.length > 0 && !allowedProvinces.includes(client.province!)) {
                    return false;
                }
            }

            // Unassigned clients (who are not Won/Lost) always go to 'New'
            const isUnassigned = !client.assignedTo;
            const isActive = client.status !== 'won' && client.status !== 'lost';

            if (status === 'new') {
                return client.status === 'new' || (isUnassigned && isActive);
            }

            // For other active columns (contacted), exclude unassigned (since they are in 'new')
            if (status === 'qualifying') {
                return client.status === 'qualifying' && !isUnassigned;
            }

            if (status === 'proposal') {
                return client.status === 'proposal' && !isUnassigned;
            }

            // Won/Lost show regardless of assignment
            return client.status === status;
        });
    };

    const handleDragStart = (e: React.DragEvent, clientId: string) => {
        setDraggedClientId(clientId);
        e.dataTransfer.setData('clientId', clientId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedClientId(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, newStatus: Status) => {
        e.preventDefault();
        const clientId = e.dataTransfer.getData('clientId');

        if (clientId) {
            updateClient(clientId, { status: newStatus });
        }
        setDraggedClientId(null);
    };

    const Column = ({ status, label, color }: { status: Status; label: string; color: string }) => {
        const statusClients = getClientsByStatus(status);
        const totalClients = statusClients.length;
        const totalValue = statusClients.reduce((sum, c) => sum + (c.dealValue || 0), 0);

        return (
            <div
                className="flex flex-col h-full bg-slate-50/50 rounded-lg border border-slate-200 overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
            >
                {/* Header */}
                <div className={cn('p-3 border-t-4 bg-white border-b border-b-slate-100', color)}>
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 text-sm">{label}</h3>
                        <div className="flex flex-col items-end">
                            <span className="text-slate-900 text-xs font-bold">${totalValue.toLocaleString()}</span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                {totalClients}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-hide space-y-3">
                    {statusClients.length > 0 ? (
                        statusClients.map((client) => (
                            <div
                                key={client.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, client.id)}
                                onClick={() => { }} // Remove onClick from drag wrapper, only use it on Card
                                className={cn(
                                    "cursor-move transition-opacity",
                                    draggedClientId === client.id ? "opacity-50" : "opacity-100"
                                )}
                            >
                                <PipelineCard
                                    client={client}
                                    onClick={() => onClientClick?.(client)}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="h-24 flex items-center justify-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-lg m-1">
                            {draggedClientId ? 'Drop here' : 'No clients in this stage'}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Imports moved to top

    return (
        <div className="space-y-4">
            {/* Filter Control */}
            <div className="flex justify-end p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger className="w-[180px] bg-white text-left" dir="ltr">
                        <SelectValue placeholder="Province" />
                    </SelectTrigger>
                    <SelectContent dir="ltr">
                        <SelectItem value="all">All Provinces</SelectItem>
                        {provinces.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Mobile View (< md) */}
            <div className="md:hidden">
                <Tabs defaultValue="new" value={activeTab} onValueChange={(val) => setActiveTab(val as Status)}>
                    <TabsList className="grid grid-cols-5 w-full h-auto p-1 bg-slate-100 mb-4 overflow-x-auto">
                        {columns.map((col) => (
                            <TabsTrigger
                                key={col.id}
                                value={col.id}
                                className="text-xs py-2 min-w-[70px] data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                {col.label.split(' ')[0]} {/* Show short label on mobile */}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {columns.map((col) => (
                        <TabsContent key={col.id} value={col.id} className="mt-0 h-[calc(100vh-250px)]">
                            <PipelineColumn
                                status={col.id}
                                label={col.label}
                                color={col.color}
                                icon={col.icon}
                                bg={col.bg}
                                clients={getClientsByStatus(col.id)}
                                draggedClientId={draggedClientId}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onDrop={handleDrop}
                                onClientClick={onClientClick}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            {/* Desktop View (>= md) */}
            <div className="hidden md:grid md:grid-cols-5 gap-4 h-[calc(100vh-260px)]">
                {columns.map((col) => (
                    <PipelineColumn
                        key={col.id}
                        status={col.id}
                        label={col.label}
                        color={col.color}
                        icon={col.icon}
                        bg={col.bg}
                        clients={getClientsByStatus(col.id)}
                        draggedClientId={draggedClientId}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        onClientClick={onClientClick}
                    />
                ))}
            </div>
        </div>
    );
}
