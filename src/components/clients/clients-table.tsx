'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Search,
    MoreVertical,
    Eye,
    Trash2,
    Edit,
    UserPlus,
    Bell,
    AlertTriangle,
    Calendar,
    ClipboardList,
    MessageCircle,
    PhoneCall,
    Lock,
    Clock,
    Plus,
    Building2,
    Phone,
    MapPin,
    Instagram,
    Map,
    Tag
} from 'lucide-react';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { type Client } from '@/lib/types';
import { ClientSheet } from './client-sheet';
import { AssignLeadDialog } from './assign-lead-dialog';
import { SetFollowUpDialog } from './set-follow-up-dialog';
import { LogActivityDialog } from './log-activity-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

const statusStyles = {
    new: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    qualifying: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    proposal: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    won: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    lost: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
};

const statusLabels = {
    new: 'New',
    qualifying: 'Qualifying',
    proposal: 'Proposal Sent',
    won: 'Won',
    lost: 'Lost',
};

export function ClientsTable() {
    const {
        clients,
        updateClient,
        getSalesReps,
        getTeamMemberById,
        addActivity,
        addClient,
        products,
        brands,
        // Pagination
        page,
        totalPages,
        totalItems,
        nextPage,
        prevPage,
        isLoading
    } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
    const [myClientsOnly, setMyClientsOnly] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
    const [activityDialogOpen, setActivityDialogOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
    const [bulkAssignRep, setBulkAssignRep] = useState<string>('');
    const [provinceFilter, setProvinceFilter] = useState<string>('all');

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        status: true,
        assignedTo: true,
        followUp: true,
        quickActions: true,
        more: true
    });

    const toggleColumn = (column: keyof typeof visibleColumns) => {
        setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
    };

    const provinces = [
        'Baghdad', 'Basra', 'Nineveh', 'Erbil', 'Najaf',
        'Karbala', 'Sulaymaniyah', 'Duhok', 'Kirkuk', 'Dhi Qar',
        'Diyala', 'Wasit', 'Maysan', 'Al Muthanna', 'Babil',
        'Anbar', 'Al-Qadisiyyah', 'Saladin'
    ];

    const salesReps = getSalesReps();
    const isAdmin = user?.role === 'admin';

    // Add Lead Dialog state
    const [addLeadOpen, setAddLeadOpen] = useState(false);
    const [duplicateError, setDuplicateError] = useState<string | null>(null);

    const provincesList = user?.role === 'admin'
        ? provinces
        : (user?.allowedProvinces && user.allowedProvinces.length > 0 ? user.allowedProvinces : provinces);

    const allowedBrands = user?.role === 'admin'
        ? brands
        : brands.filter(b => user?.allowedBrands?.includes(b.id));

    const [leadFormData, setLeadFormData] = useState({
        businessName: '',
        ownerName: '',
        phone: '',
        province: (user?.allowedProvinces && user.allowedProvinces.length > 0) ? user.allowedProvinces[0] : '',
        address: '',
        googleMapsUrl: '',
        instagram: '',

        productInterest: '',
        category: '',
    });

    // Update province when user loads or dialog opens (if not already set)
    useEffect(() => {
        if (user?.allowedProvinces && user.allowedProvinces.length > 0 && !leadFormData.province) {
            setLeadFormData(prev => ({ ...prev, province: user.allowedProvinces![0] }));
        }
    }, [user?.allowedProvinces, addLeadOpen]);

    // Check if user can interact with a client
    const canInteract = (client: Client): boolean => {
        if (isAdmin) return true; // Admin can interact with all
        return client.assignedTo === user?.id; // Sales rep only their own
    };

    // Load myClientsOnly preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('menuplus_my_clients_only');
        if (saved === 'true') {
            setMyClientsOnly(true);
        }
    }, []);

    // Save preference when changed
    const handleMyClientsToggle = (checked: boolean) => {
        setMyClientsOnly(checked);
        localStorage.setItem('menuplus_my_clients_only', checked.toString());
    };

    // Handle Add Lead submit
    const handleAddLead = () => {
        // Validate mandatory fields
        if (!leadFormData.businessName || !leadFormData.phone || !leadFormData.province || !leadFormData.category || !leadFormData.productInterest || !leadFormData.googleMapsUrl) return;

        // Check for duplicate phone
        const existingClient = clients.find(c => c.phone === leadFormData.phone);
        if (existingClient) {
            setDuplicateError(`This number is already registered for client: ${existingClient.name}`);
            return;
        }

        // Find selected product
        const product = products.find(p => p.id === leadFormData.productInterest);

        // Add new lead
        addClient({
            name: leadFormData.businessName,
            email: '',
            phone: leadFormData.phone,
            productInterest: product?.name || 'Menu Plus Basic',
            dealValue: product?.price || 0,
            status: 'new',
            address: leadFormData.address || leadFormData.province, // Use detailed address if available, else province
            province: leadFormData.province,
            category: leadFormData.category || undefined,
            instagram: leadFormData.instagram || undefined,
            googleMapsUrl: leadFormData.googleMapsUrl,
            notes: `Owner: ${leadFormData.ownerName} | Added by: ${user?.name}`,
            assignedTo: undefined, // Stays unassigned
            lastInteraction: new Date().toISOString(),
        });

        // Reset form
        setLeadFormData({
            businessName: '',
            ownerName: '',
            phone: '',
            province: (user?.allowedProvinces && user.allowedProvinces.length > 0) ? user.allowedProvinces[0] : '',
            address: '',
            googleMapsUrl: '',
            instagram: '',

            productInterest: '',
            category: '',
        });
        setDuplicateError(null);
        setAddLeadOpen(false);
    };

    const filteredClients = clients.filter((client) => {
        const matchesSearch =
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.phone.includes(searchQuery) ||
            client.productInterest.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
        const matchesAssignee = assigneeFilter === 'all' ||
            (assigneeFilter === 'unassigned' ? !client.assignedTo : client.assignedTo === assigneeFilter);
        const matchesMyClients = !myClientsOnly || client.assignedTo === user?.id;
        const matchesProvince = provinceFilter === 'all' || client.province === provinceFilter;
        return matchesSearch && matchesStatus && matchesAssignee && matchesMyClients && matchesProvince;
    });

    const handleClientClick = (client: Client) => {
        setSelectedClient(client);
        setSheetOpen(true);
    };

    const handleAssignClick = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAdmin) return; // Only admin can assign
        setClientToEdit(client);
        setAssignDialogOpen(true);
    };

    const handleFollowUpClick = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canInteract(client)) return;
        setClientToEdit(client);
        setFollowUpDialogOpen(true);
    };

    const handleActivityClick = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canInteract(client)) return;
        setClientToEdit(client);
        setActivityDialogOpen(true);
    };

    const handleAssign = (clientId: string, assigneeId: string) => {
        updateClient(clientId, { assignedTo: assigneeId });
        setAssignDialogOpen(false);
    };

    const handleSetFollowUp = (clientId: string, date: string, note: string) => {
        updateClient(clientId, { followUpDate: date, followUpNote: note });
        setFollowUpDialogOpen(false);
    };

    // Bulk selection handlers
    const handleSelectClient = (clientId: string, checked: boolean) => {
        if (checked) {
            setSelectedClients(prev => [...prev, clientId]);
        } else {
            setSelectedClients(prev => prev.filter(id => id !== clientId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            // Only select unassigned clients for bulk assign
            const unassignedIds = filteredClients
                .filter(c => !c.assignedTo)
                .map(c => c.id);
            setSelectedClients(unassignedIds);
        } else {
            setSelectedClients([]);
        }
    };

    const handleBulkAssign = () => {
        if (!bulkAssignRep || selectedClients.length === 0) return;

        selectedClients.forEach(clientId => {
            updateClient(clientId, { assignedTo: bulkAssignRep });
        });

        setSelectedClients([]);
        setBulkAssignDialogOpen(false);
        setBulkAssignRep('');
    };

    const unassignedInSelection = selectedClients.filter(id => {
        const client = clients.find(c => c.id === id);
        return client && !client.assignedTo;
    }).length;

    // Quick Actions
    const handleQuickCall = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canInteract(client)) return;
        window.open(`tel:${client.phone}`, '_self');
        addActivity({
            clientId: client.id,
            type: 'call',
            description: 'Called client',
            timestamp: new Date().toISOString(),
            user: user?.name || 'Unknown',
        });
    };

    const handleWhatsApp = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canInteract(client)) return;
        const phone = client.phone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${phone}`, '_blank');
    };

    const isOverdue = (date?: string) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const followUp = new Date(date);
        followUp.setHours(0, 0, 0, 0);
        return followUp < today;
    };

    // Calculate days since last interaction
    const getDaysSinceContact = (lastInteraction?: string): number => {
        if (!lastInteraction) return 999; // Very high number if never contacted
        const last = new Date(lastInteraction);
        const today = new Date();
        const diffTime = today.getTime() - last.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getDaysBadgeStyle = (days: number) => {
        if (days >= 14) return 'bg-red-100 text-red-700 border-red-200';
        if (days >= 7) return 'bg-amber-100 text-amber-700 border-amber-200';
        if (days >= 3) return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };

    if (isLoading) {
        return <TableSkeleton />;
    }

    return (
        <TooltipProvider>
            <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search clients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px] border-slate-200">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="qualifying">Qualifying</SelectItem>
                                    <SelectItem value="proposal">Proposal Sent</SelectItem>
                                    <SelectItem value="won">Won</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                            {isAdmin && (
                                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                    <SelectTrigger className="w-[150px] border-slate-200">
                                        <SelectValue placeholder="Assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Assignees</SelectItem>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {salesReps.map(rep => (
                                            <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Province Filter */}
                            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                                <SelectTrigger className="w-[140px] border-slate-200">
                                    <SelectValue placeholder="Province" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Provinces</SelectItem>
                                    {provincesList.map(p => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* My Clients Toggle */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-2 bg-slate-50 rounded-lg px-3 py-2">
                            <Switch
                                id="my-clients"
                                checked={myClientsOnly}
                                onCheckedChange={handleMyClientsToggle}
                            />
                            <Label htmlFor="my-clients" className="text-sm font-medium text-slate-700 cursor-pointer">
                                My Clients Only
                            </Label>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 bg-white border-slate-200 text-slate-700">
                                    <Eye className="h-4 w-4" />
                                    Columns
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Checkbox
                                        checked={true}
                                        disabled
                                        className="mr-2"
                                    />
                                    Client Name (Required)
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleColumn('status'); }}>
                                    <Checkbox
                                        checked={visibleColumns.status}
                                        onCheckedChange={() => toggleColumn('status')}
                                        className="mr-2"
                                    />
                                    Status
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleColumn('assignedTo'); }}>
                                    <Checkbox
                                        checked={visibleColumns.assignedTo}
                                        onCheckedChange={() => toggleColumn('assignedTo')}
                                        className="mr-2"
                                    />
                                    Assigned To
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleColumn('followUp'); }}>
                                    <Checkbox
                                        checked={visibleColumns.followUp}
                                        onCheckedChange={() => toggleColumn('followUp')}
                                        className="mr-2"
                                    />
                                    Follow-up
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleColumn('quickActions'); }}>
                                    <Checkbox
                                        checked={visibleColumns.quickActions}
                                        onCheckedChange={() => toggleColumn('quickActions')}
                                        className="mr-2"
                                    />
                                    Quick Actions
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleColumn('more'); }}>
                                    <Checkbox
                                        checked={visibleColumns.more}
                                        onCheckedChange={() => toggleColumn('more')}
                                        className="mr-2"
                                    />
                                    More Options
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {isAdmin && (
                            <Button
                                onClick={() => setAddLeadOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Lead
                            </Button>
                        )}
                    </div>
                </div>

                {/* Bulk Assign Toolbar (Admin only) */}
                {isAdmin && selectedClients.length > 0 && (
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 p-3">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600">{selectedClients.length} selected</Badge>
                            <span className="text-sm text-blue-700">
                                {unassignedInSelection > 0 && `(${unassignedInSelection} unassigned)`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={bulkAssignRep} onValueChange={setBulkAssignRep}>
                                <SelectTrigger className="w-[180px] bg-white">
                                    <SelectValue placeholder="Select rep..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {salesReps.map(rep => (
                                        <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                size="sm"
                                onClick={handleBulkAssign}
                                disabled={!bulkAssignRep}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Assign
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedClients([])}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                {isAdmin && (
                                    <TableHead className="w-10">
                                        <Checkbox
                                            checked={selectedClients.length > 0 &&
                                                filteredClients.filter(c => !c.assignedTo).every(c => selectedClients.includes(c.id))}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                )}
                                <TableHead className="font-semibold text-slate-700">{t('clients.clientName')}</TableHead>
                                {visibleColumns.status && <TableHead className="font-semibold text-slate-700">{t('clients.status')}</TableHead>}
                                {visibleColumns.assignedTo && <TableHead className="font-semibold text-slate-700">{t('clients.assignedTo')}</TableHead>}
                                {visibleColumns.followUp && <TableHead className="font-semibold text-slate-700">{t('clients.followUp')}</TableHead>}
                                {visibleColumns.quickActions && <TableHead className="font-semibold text-slate-700">{t('clients.quickActions')}</TableHead>}
                                {visibleColumns.more && <TableHead className="font-semibold text-slate-700 text-right">{t('common.actions')}</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 7 : 6} className="h-24 text-center text-slate-500">
                                        {myClientsOnly ? t('clients.noClientsAssigned') : t('clients.noClientsFound')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClients.map((client) => {
                                    const assignee = client.assignedTo ? getTeamMemberById(client.assignedTo) : null;
                                    const overdue = isOverdue(client.followUpDate);
                                    const canEdit = canInteract(client);
                                    const daysSince = getDaysSinceContact(client.lastInteraction);
                                    const isSelected = selectedClients.includes(client.id);

                                    return (
                                        <TableRow
                                            key={client.id}
                                            className={`cursor-pointer transition-colors hover:bg-slate-50 ${!canEdit ? 'opacity-70' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                                            onClick={() => handleClientClick(client)}
                                        >
                                            {isAdmin && (
                                                <TableCell onClick={e => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => handleSelectClient(client.id, !!checked)}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-slate-900 truncate">{client.name}</p>
                                                            {!canEdit && (
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <Lock className="h-3 w-3 text-slate-400" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>View only - assigned to another rep</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-xs text-slate-500">
                                                                {canEdit ? client.phone : '••••••••••'}
                                                            </p>
                                                            {canEdit && client.status !== 'won' && client.status !== 'lost' && daysSince >= 3 && (
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={`text-[10px] px-1.5 py-0 ${getDaysBadgeStyle(daysSince)}`}
                                                                        >
                                                                            <Clock className="h-2.5 w-2.5 mr-0.5" />
                                                                            {daysSince}d
                                                                        </Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{daysSince} days since last contact</p>
                                                                        {daysSince >= 7 && <p className="text-amber-300 text-xs">⚠️ Needs attention!</p>}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {visibleColumns.status && (
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={statusStyles[client.status]}
                                                    >
                                                        {statusLabels[client.status]}
                                                    </Badge>
                                                </TableCell>
                                            )}
                                            {visibleColumns.assignedTo && (
                                                <TableCell>
                                                    {assignee ? (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                                                    {assignee.name.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm text-slate-600">{assignee.name.split(' ')[0]}</span>
                                                        </div>
                                                    ) : isAdmin ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-slate-400 hover:text-blue-600 h-7 px-2"
                                                            onClick={(e) => handleAssignClick(client, e)}
                                                        >
                                                            <UserPlus className="h-4 w-4 mr-1" />
                                                            Assign
                                                        </Button>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">Unassigned</span>
                                                    )}
                                                </TableCell>
                                            )}
                                            {visibleColumns.followUp && (
                                                <TableCell>
                                                    {client.followUpDate ? (
                                                        <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600' : 'text-slate-600'
                                                            }`}>
                                                            {overdue && <AlertTriangle className="h-3 w-3" />}
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(client.followUpDate).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </div>
                                                    ) : canEdit ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-slate-400 hover:text-amber-600 h-7 px-2"
                                                            onClick={(e) => handleFollowUpClick(client, e)}
                                                        >
                                                            <Bell className="h-4 w-4 mr-1" />
                                                            Set
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                </TableCell>
                                            )}
                                            {visibleColumns.quickActions && (
                                                <TableCell>
                                                    {canEdit ? (
                                                        <div className="flex items-center gap-1">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                                                        onClick={(e) => handleQuickCall(client, e)}
                                                                    >
                                                                        <PhoneCall className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Call</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                                                        onClick={(e) => handleWhatsApp(client, e)}
                                                                    >
                                                                        <MessageCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>WhatsApp</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                                                                        onClick={(e) => handleActivityClick(client, e)}
                                                                    >
                                                                        <ClipboardList className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Log Activity</TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-slate-300">
                                                            <Lock className="h-4 w-4" />
                                                            <span className="text-xs">View only</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            )}
                                            {visibleColumns.more && (
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4 text-slate-500" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleClientClick(client);
                                                                }}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            {canEdit && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    {isAdmin && (
                                                                        <DropdownMenuItem onClick={(e) => handleAssignClick(client, e)}>
                                                                            <UserPlus className="mr-2 h-4 w-4" />
                                                                            Assign to Rep
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem onClick={(e) => handleFollowUpClick(client, e)}>
                                                                        <Bell className="mr-2 h-4 w-4" />
                                                                        Set Follow-up
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={(e) => handleActivityClick(client, e)}>
                                                                        <ClipboardList className="mr-2 h-4 w-4" />
                                                                        Log Activity
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    {isAdmin && (
                                                                        <DropdownMenuItem
                                                                            className="text-red-600 focus:text-red-600"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Results Count */}
                <p className="text-sm text-slate-500">
                    Showing {filteredClients.length} of {clients.length} clients
                    {myClientsOnly && ' (My Clients Only)'}
                </p>

                {/* Dialogs */}
                <ClientSheet client={selectedClient} open={sheetOpen} onOpenChange={setSheetOpen} />
                <AssignLeadDialog client={clientToEdit} open={assignDialogOpen} onOpenChange={setAssignDialogOpen} onAssign={handleAssign} />
                <SetFollowUpDialog client={clientToEdit} open={followUpDialogOpen} onOpenChange={setFollowUpDialogOpen} onSetFollowUp={handleSetFollowUp} />
                <LogActivityDialog client={clientToEdit} open={activityDialogOpen} onOpenChange={setActivityDialogOpen} />

                {/* Add Lead Dialog */}
                <Dialog open={addLeadOpen} onOpenChange={(open) => { setAddLeadOpen(open); setDuplicateError(null); }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-blue-600" />
                                Add New Lead
                            </DialogTitle>
                            <DialogDescription>Enter potential client details</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {duplicateError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                    ⚠️ {duplicateError}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="businessName" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-slate-400" />
                                    Business Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="businessName"
                                    placeholder="e.g. Al Rashid Restaurant"
                                    value={leadFormData.businessName}
                                    onChange={(e) => setLeadFormData({ ...leadFormData, businessName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ownerName" className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4 text-slate-400" />
                                    Owner Name
                                </Label>
                                <Input
                                    id="ownerName"
                                    placeholder="e.g. Ahmed Ali"
                                    value={leadFormData.ownerName}
                                    onChange={(e) => setLeadFormData({ ...leadFormData, ownerName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leadPhone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    Phone Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="leadPhone"
                                    type="tel"
                                    placeholder="+964 7XX XXX XXXX"
                                    value={leadFormData.phone}
                                    onChange={(e) => { setLeadFormData({ ...leadFormData, phone: e.target.value }); setDuplicateError(null); }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leadAddress" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="leadAddress"
                                    placeholder="e.g. Al Mansour, St 14..."
                                    value={leadFormData.address}
                                    onChange={(e) => setLeadFormData({ ...leadFormData, address: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="googleMapsUrl" className="flex items-center gap-2">
                                    <Map className="h-4 w-4 text-slate-400" />
                                    Google Maps Link <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="googleMapsUrl"
                                    dir="ltr"
                                    placeholder="https://maps.app.goo.gl/..."
                                    value={leadFormData.googleMapsUrl}
                                    onChange={(e) => setLeadFormData({ ...leadFormData, googleMapsUrl: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leadCategory" className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-slate-400" />
                                    Category
                                </Label>
                                <Select
                                    value={leadFormData.category}
                                    onValueChange={(value) => setLeadFormData({ ...leadFormData, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Restaurant">Restaurant</SelectItem>
                                        <SelectItem value="Cafe">Cafe</SelectItem>
                                        <SelectItem value="Bakery">Bakery</SelectItem>
                                        <SelectItem value="Hotel">Hotel</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leadProduct" className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-slate-400" />
                                    Product Interest <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={leadFormData.productInterest}
                                    onValueChange={(value) => setLeadFormData({ ...leadFormData, productInterest: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allowedBrands.map(brand => {
                                            const brandProducts = products.filter(p => p.brandId === brand.id);
                                            if (brandProducts.length === 0) return null;

                                            return (
                                                <SelectGroup key={brand.id}>
                                                    <SelectLabel className="text-xs font-bold text-slate-500 px-2 py-1 bg-slate-50 w-full block text-right">
                                                        {brand.name}
                                                    </SelectLabel>
                                                    {brandProducts.map(p => (
                                                        <SelectItem key={p.id} value={p.id} className="pr-4">
                                                            {p.name} - ${p.price}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            );
                                        })}
                                        {(user?.role === 'admin' && products.filter(p => !p.brandId).length > 0) && (
                                            <SelectGroup>
                                                <SelectLabel>Other</SelectLabel>
                                                {products.filter(p => !p.brandId).map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leadProvince" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    Province
                                </Label>
                                <Select
                                    value={leadFormData.province}
                                    onValueChange={(value) => setLeadFormData({ ...leadFormData, province: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Province" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provincesList.map(p => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leadInstagram" className="flex items-center gap-2">
                                    <Instagram className="h-4 w-4 text-slate-400" />
                                    Instagram Page
                                </Label>
                                <Input
                                    id="leadInstagram"
                                    placeholder="@example"
                                    value={leadFormData.instagram}
                                    onChange={(e) => setLeadFormData({ ...leadFormData, instagram: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddLeadOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleAddLead}
                                disabled={!leadFormData.businessName || !leadFormData.phone || !leadFormData.category}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <Button variant="outline" size="sm" onClick={prevPage} disabled={page <= 1}>
                            {t('common.previous')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={nextPage} disabled={page >= totalPages}>
                            {t('common.next')}
                        </Button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-700">
                                {t('common.showing')} <span className="font-medium">{page}</span> {t('common.of')}{' '}
                                <span className="font-medium">{totalPages}</span>
                                {' '}({t('common.total')} <span className="font-medium">{totalItems}</span>)
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <Button
                                    variant="outline"
                                    className="rounded-l-md"
                                    onClick={prevPage}
                                    disabled={page <= 1}
                                >
                                    {t('common.previous')}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="rounded-r-md ml-2"
                                    onClick={nextPage}
                                    disabled={page >= totalPages}
                                >
                                    {t('common.next')}
                                </Button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
