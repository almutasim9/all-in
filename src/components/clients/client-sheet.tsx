'use client';

import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Phone,
    Mail,
    MapPin,
    Instagram,
    Map,
    Calendar,
    PhoneCall,
    FileText,
    Package,
    XCircle,
    ClipboardList,
    User,
    Plus,
    Lock,
    MessageCircle,
} from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { type Client } from '@/lib/types';
import { LogActivityDialog } from './log-activity-dialog';

interface ClientSheetProps {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const statusStyles = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    qualifying: 'bg-amber-50 text-amber-700 border-amber-200',
    proposal: 'bg-purple-50 text-purple-700 border-purple-200',
    won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    lost: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels = {
    new: 'New',
    qualifying: 'Qualifying',
    proposal: 'Proposal Sent',
    won: 'Won',
    lost: 'Lost',
};

const activityIcons = {
    call: PhoneCall,
    visit: User,
    note: FileText,
    email: Mail,
    assignment: User,
    reminder: Calendar,
};

const activityColors = {
    call: 'bg-blue-100 text-blue-600',
    visit: 'bg-emerald-100 text-emerald-600',
    note: 'bg-amber-100 text-amber-600',
    email: 'bg-purple-100 text-purple-600',
    assignment: 'bg-slate-100 text-slate-600',
    reminder: 'bg-pink-100 text-pink-600',
};

export function ClientSheet({ client, open, onOpenChange }: ClientSheetProps) {
    const { getClientActivities, getClientSubscriptions, updateClient } = useData();
    const { user } = useAuth();
    const [activityDialogOpen, setActivityDialogOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    if (!client) return null;

    const isAdmin = user?.role === 'admin';
    const canInteract = isAdmin || client.assignedTo === user?.id;

    const clientActivities = getClientActivities(client.id);
    const clientSubscriptions = getClientSubscriptions(client.id);

    const handleActivityAdded = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleMarkAsLost = () => {
        if (!canInteract) return;
        updateClient(client.id, { status: 'lost' });
        onOpenChange(false);
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
                    <div className="flex-1 overflow-y-auto p-6">
                        <SheetHeader className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <SheetTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        {client.name}
                                        {!canInteract && <Lock className="h-4 w-4 text-slate-400" />}
                                    </SheetTitle>
                                    <SheetDescription className="mt-1">
                                        {canInteract ? 'Client details and activity history' : 'View only - assigned to another rep'}
                                    </SheetDescription>
                                </div>
                                <Badge variant="outline" className={statusStyles[client.status]}>
                                    {statusLabels[client.status]}
                                </Badge>
                            </div>
                        </SheetHeader>

                        <Separator className="my-4" />

                        <Tabs defaultValue="overview" className="w-full" key={refreshKey}>
                            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="activity">
                                    Activity
                                    {clientActivities.length > 0 && (
                                        <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 rounded-full">
                                            {clientActivities.length}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="products">Products</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="mt-4 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                            <Phone className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500">Phone</p>
                                            <p className="text-sm font-medium text-slate-900">
                                                {canInteract ? client.phone : '••••••••••'}
                                            </p>
                                        </div>
                                    </div>

                                    {client.email && canInteract && (
                                        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                                <Mail className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500">Email</p>
                                                <p className="text-sm font-medium text-slate-900">{client.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {client.productInterest && (
                                        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                                                <Package className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500">Product Interest</p>
                                                <p className="text-sm font-medium text-slate-900">{client.productInterest}</p>
                                            </div>
                                        </div>
                                    )}

                                    {client.province && (
                                        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                                                <Map className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500">Province</p>
                                                <p className="text-sm font-medium text-slate-900">{client.province}</p>
                                            </div>
                                        </div>
                                    )}

                                    {client.address && (
                                        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                                <MapPin className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500">Address</p>
                                                <p className="text-sm font-medium text-slate-900">{client.address}</p>
                                            </div>
                                        </div>
                                    )}

                                    {client.googleMapsUrl && canInteract && (
                                        <a
                                            href={client.googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                                                <Map className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500">Google Maps</p>
                                                <p className="text-sm font-medium text-blue-600">Open in Maps →</p>
                                            </div>
                                        </a>
                                    )}

                                    {client.instagram && canInteract && (
                                        <a
                                            href={`https://instagram.com/${client.instagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100">
                                                <Instagram className="h-4 w-4 text-pink-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500">Instagram</p>
                                                <p className="text-sm font-medium text-blue-600">{client.instagram}</p>
                                            </div>
                                        </a>
                                    )}

                                    {client.notes && canInteract && (
                                        <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100 shrink-0">
                                                <FileText className="h-4 w-4 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500">Notes & Owner Info</p>
                                                <p className="text-sm font-medium text-slate-900 whitespace-pre-wrap">
                                                    {client.notes}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {!canInteract && (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                                            <div className="flex items-center gap-2 text-amber-700">
                                                <Lock className="h-4 w-4" />
                                                <p className="text-sm font-medium">Contact info hidden</p>
                                            </div>
                                            <p className="text-xs text-amber-600 mt-1">
                                                This client is assigned to another rep
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Activity Tab */}
                            <TabsContent value="activity" className="mt-4">
                                {clientActivities.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <ClipboardList className="h-12 w-12 text-slate-300 mb-3" />
                                        <p className="text-sm text-slate-500">No activity recorded yet</p>
                                    </div>
                                ) : (
                                    <div className="relative space-y-0">
                                        <div className="absolute left-5 top-3 bottom-3 w-px bg-slate-200" />
                                        {clientActivities.map((activity) => {
                                            const Icon = activityIcons[activity.type] || FileText;
                                            const colorClass = activityColors[activity.type] || 'bg-slate-100 text-slate-600';
                                            return (
                                                <div key={activity.id} className="relative flex gap-4 pb-4">
                                                    <div
                                                        className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 pt-1">
                                                        <p className="text-sm font-medium text-slate-900 capitalize">
                                                            {activity.type}
                                                        </p>
                                                        <p className="text-sm text-slate-600 mt-0.5">{activity.description}</p>
                                                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>
                                                                {new Date(activity.timestamp).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{activity.user}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Products Tab */}
                            <TabsContent value="products" className="mt-4">
                                {clientSubscriptions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Package className="h-12 w-12 text-slate-300 mb-3" />
                                        <p className="text-sm text-slate-500">No subscriptions yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {clientSubscriptions.map((sub) => (
                                            <div
                                                key={sub.id}
                                                className="rounded-lg border border-slate-200 bg-white p-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-900">{sub.productName}</p>
                                                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>
                                                                {new Date(sub.startDate).toLocaleDateString()} -{' '}
                                                                {new Date(sub.endDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            sub.status === 'active'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : sub.status === 'pending'
                                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                    : 'bg-red-50 text-red-700 border-red-200'
                                                        }
                                                    >
                                                        {sub.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        {/* Desktop Actions (Hidden on Mobile) */}
                        <div className="hidden sm:block space-y-2 mt-6">
                            <Separator className="my-6" />
                            {canInteract ? (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Quick Actions
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            className="justify-start"
                                            onClick={() => setActivityDialogOpen(true)}
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Log Visit
                                        </Button>
                                        <Button variant="outline" className="justify-start">
                                            <Package className="mr-2 h-4 w-4" />
                                            Create Order
                                        </Button>
                                    </div>
                                    {client.status !== 'lost' && client.status !== 'won' && (
                                        <Button
                                            variant="outline"
                                            onClick={handleMarkAsLost}
                                            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Mark as Lost
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                                    <Lock className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-slate-600">View Only Mode</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Actions are disabled for clients assigned to other reps
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Sticky Action Bar */}
                    {canInteract && (
                        <div className="p-3 border-t border-slate-200 bg-white grid grid-cols-4 gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:hidden z-50">
                            {client.phone ? (
                                <>
                                    <Button
                                        className="flex flex-col gap-0.5 h-auto py-2 bg-blue-600 hover:bg-blue-700 p-0"
                                        onClick={() => window.open(`tel:${client.phone}`, '_self')}
                                    >
                                        <Phone className="h-5 w-5" />
                                        <span className="text-[9px] font-medium">Call</span>
                                    </Button>
                                    <Button
                                        className="flex flex-col gap-0.5 h-auto py-2 bg-green-600 hover:bg-green-700 p-0"
                                        onClick={() => {
                                            const phone = client.phone?.replace(/\D/g, '').replace(/^0+/, '');
                                            window.open(`https://wa.me/${phone}`, '_blank');
                                        }}
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        <span className="text-[9px] font-medium">WhatsApp</span>
                                    </Button>
                                </>
                            ) : (
                                <div className="col-span-2 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">
                                    No Phone
                                </div>
                            )}

                            {client.googleMapsUrl ? (
                                <Button
                                    className="flex flex-col gap-0.5 h-auto py-2 bg-amber-500 hover:bg-amber-600 text-white p-0"
                                    onClick={() => window.open(client.googleMapsUrl, '_blank')}
                                >
                                    <MapPin className="h-5 w-5" />
                                    <span className="text-[9px] font-medium">Map</span>
                                </Button>
                            ) : (
                                <Button variant="outline" className="flex flex-col gap-0.5 h-auto py-2 p-0 opacity-50" disabled>
                                    <MapPin className="h-5 w-5" />
                                    <span className="text-[9px] font-medium">No Map</span>
                                </Button>
                            )}

                            <Button
                                className="flex flex-col gap-0.5 h-auto py-2 bg-slate-900 hover:bg-slate-800 p-0"
                                onClick={() => setActivityDialogOpen(true)}
                            >
                                <Plus className="h-5 w-5" />
                                <span className="text-[9px] font-medium">Log Visit</span>
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Activity Dialog */}
            {canInteract && (
                <LogActivityDialog
                    client={client}
                    open={activityDialogOpen}
                    onOpenChange={setActivityDialogOpen}
                    onActivityAdded={handleActivityAdded}
                />
            )}
        </>
    );
}
