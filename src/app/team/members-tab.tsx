'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Mail, Phone, MoreVertical, Users, Target, TrendingUp, Edit, Trash2, MapPin, Search } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useData } from '@/lib/data-context';

export function MembersTab() {
    const { clients, teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, brands, getMonthlyTarget, setMonthlyTarget } = useData();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingMember, setEditingMember] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'sales_rep'>('all');

    // Form Data State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        allowedProvinces: [] as string[],
        allowedBrands: [] as string[],
        role: 'sales_rep' as 'admin' | 'sales_rep' | 'data_entry',
        // Targets
        monthDealsTarget: 0,
        monthVisitsTarget: 0,
    });

    // ... provinces array code ...
    const provinces = [
        'Baghdad', 'Basra', 'Nineveh', 'Erbil', 'Najaf',
        'Karbala', 'Sulaymaniyah', 'Duhok', 'Kirkuk', 'Dhi Qar',
        'Diyala', 'Wasit', 'Maysan', 'Al Muthanna', 'Babil',
        'Anbar', 'Al-Qadisiyyah', 'Saladin'
    ];

    // ... getMemberStats code ...
    const getMemberStats = (memberId: string) => {
        const memberClients = clients.filter(c => c.assignedTo === memberId);
        const wonDeals = memberClients.filter(c => c.status === 'won').length;
        const conversionRate = memberClients.length > 0
            ? Math.round((wonDeals / memberClients.length) * 100)
            : 0;

        return {
            totalClients: memberClients.length,
            wonDeals,
            conversionRate
        };
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || (!editingMember && !formData.password)) return;

        const memberData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            allowedProvinces: formData.allowedProvinces,
            allowedBrands: formData.allowedBrands,
            role: formData.role,
            ...(formData.password && { password: formData.password }),
        };

        if (editingMember) {
            updateTeamMember(editingMember, memberData);

            // Save Targets for Current Month
            const now = new Date();
            setMonthlyTarget(
                editingMember,
                now.getMonth() + 1,
                now.getFullYear(),
                Number(formData.monthDealsTarget),
                Number(formData.monthVisitsTarget)
            );

        } else {
            const newMember = await addTeamMember({
                ...memberData,
                password: formData.password,
            });

            if (newMember) {
                // Create initial target for new member
                const now = new Date();
                setMonthlyTarget(
                    newMember.id,
                    now.getMonth() + 1,
                    now.getFullYear(),
                    Number(formData.monthDealsTarget),
                    Number(formData.monthVisitsTarget)
                );
            }
        }

        setShowAddDialog(false);
        setEditingMember(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            allowedProvinces: [],
            allowedBrands: [],
            role: 'sales_rep',
            monthDealsTarget: 0,
            monthVisitsTarget: 0,
        });
    };

    const handleEdit = (member: typeof teamMembers[0]) => {
        // Load targets
        const now = new Date();
        const target = getMonthlyTarget(member.id, now.getMonth() + 1, now.getFullYear());

        setFormData({
            name: member.name,
            email: member.email,
            password: '',
            phone: member.phone,
            allowedProvinces: member.allowedProvinces || [],
            allowedBrands: member.allowedBrands || [],
            role: member.role,
            monthDealsTarget: target?.dealsTarget || 10, // Default values
            monthVisitsTarget: target?.visitsTarget || 40,
        });
        setEditingMember(member.id);
        setShowAddDialog(true);
    };

    // ... handleDelete, getRoleLabel, toggleProvince, toggleBrand ...
    const handleDelete = (memberId: string) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            deleteTeamMember(memberId);
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Admin';
            case 'sales_rep': return 'Sales Rep';
            default: return role;
        }
    };

    const toggleProvince = (province: string) => {
        setFormData(prev => {
            const current = prev.allowedProvinces;
            if (current.includes(province)) {
                return { ...prev, allowedProvinces: current.filter(p => p !== province) };
            } else {
                return { ...prev, allowedProvinces: [...current, province] };
            }
        });
    };

    const toggleBrand = (brandId: string) => {
        setFormData(prev => {
            const current = prev.allowedBrands;
            if (current.includes(brandId)) {
                return { ...prev, allowedBrands: current.filter(id => id !== brandId) };
            } else {
                return { ...prev, allowedBrands: [...current, brandId] };
            }
        });
    };

    const renderMemberCard = (member: typeof teamMembers[0]) => {
        // ... existing render logic ...
        const stats = getMemberStats(member.id);
        const provinceCount = member.allowedProvinces?.length || 0;
        const brandCount = member.allowedBrands?.length || 0;

        return (
            <Card key={member.id} className="rounded-lg border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-slate-200">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                                    {member.name.split(' ').map((n) => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-sm font-semibold text-slate-900">
                                    {member.name}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">
                                    <Badge variant="secondary" className="text-[10px] font-normal mr-1">
                                        {getRoleLabel(member.role)}
                                    </Badge>
                                </CardDescription>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(member)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                {member.id !== '1' && (
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                        onClick={() => handleDelete(member.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {member.email}
                    </div>
                    {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="h-4 w-4 text-slate-400" />
                            {member.phone}
                        </div>
                    )}

                    <div className="pt-2 flex flex-wrap gap-2">
                        {provinceCount > 0 ? (
                            <Badge variant="outline" className="text-[10px] bg-slate-50">
                                <MapPin className="h-3 w-3 mr-1" />
                                {provinceCount === provinces.length ? 'All Provinces' : `${provinceCount} Provinces`}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-100">
                                No Provinces
                            </Badge>
                        )}

                        {brandCount > 0 ? (
                            <Badge variant="outline" className="text-[10px] bg-slate-50">
                                <Target className="h-3 w-3 mr-1" />
                                {brandCount} Brands
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-100">
                                No Brands
                            </Badge>
                        )}
                    </div>

                    {member.role === 'sales_rep' && (
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                            <div className="text-center">
                                <p className="text-lg font-semibold text-slate-900">{stats.totalClients}</p>
                                <p className="text-xs text-slate-500">Clients</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-emerald-600">{stats.wonDeals}</p>
                                <p className="text-xs text-slate-500">Won</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-blue-600">{stats.conversionRate}%</p>
                                <p className="text-xs text-slate-500">Rate</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Team Members</h2>
                    <p className="text-sm text-slate-500">Manage representatives, permissions, and territories</p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                        resetForm();
                        setEditingMember(null);
                        setShowAddDialog(true);
                    }}
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                </Button>
            </div>

            {/* Filters Bar */}
            <Card className="border-slate-200 bg-slate-50/50 shadow-sm">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search members by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white border-slate-200"
                        />
                    </div>
                    <Select
                        value={filterRole}
                        onValueChange={(value: 'all' | 'admin' | 'sales_rep') => setFilterRole(value)}
                    >
                        <SelectTrigger className="w-full sm:w-[180px] bg-white border-slate-200">
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="sales_rep">Sales Representatives</SelectItem>
                            <SelectItem value="admin">Admins</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Team Members Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teamMembers
                    .filter(member => {
                        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            member.email.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesRole = filterRole === 'all' || member.role === filterRole;
                        return matchesSearch && matchesRole;
                    })
                    .map(renderMemberCard)}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingMember ? 'Edit Member Details' : 'Add New Member'}</DialogTitle>
                        <DialogDescription>
                            Define personal information, geographical access, and products.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Tabs defaultValue="profile" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="profile">Profile Details</TabsTrigger>
                                <TabsTrigger value="permissions" disabled={formData.role === 'admin'}>Permissions</TabsTrigger>
                                <TabsTrigger value="targets" disabled={formData.role === 'admin'}>Sales Targets</TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile" className="space-y-4 focus-visible:outline-none">
                                {/* ... profile form fields ... */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(value: 'admin' | 'sales_rep') => setFormData({ ...formData, role: value })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sales_rep">Sales Rep</SelectItem>
                                                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="password">Password {!editingMember && <span className="text-red-500">*</span>}</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="permissions" className="space-y-6 focus-visible:outline-none mt-2">
                                <div className="space-y-3">
                                    <h3 className="font-medium text-slate-900 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        Geographic Scope (Allowed Provinces)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-[150px] overflow-y-auto pr-2 border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                                        {provinces.map(province => (
                                            <div key={province} className="flex items-center space-x-2 p-1.5 rounded hover:bg-slate-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    id={`prov-${province}`}
                                                    checked={formData.allowedProvinces.includes(province)}
                                                    onChange={() => toggleProvince(province)}
                                                    className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                                />
                                                <label htmlFor={`prov-${province}`} className="text-xs font-medium text-slate-700 cursor-pointer select-none flex-1">
                                                    {province}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-medium text-slate-900 flex items-center gap-2">
                                        <Target className="h-4 w-4 text-emerald-600" />
                                        Allowed Products (Brands)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {brands.map(brand => (
                                            <div key={brand.id} className="flex items-center space-x-2 bg-slate-50 p-2 rounded border border-slate-100">
                                                <input
                                                    type="checkbox"
                                                    id={`brand-${brand.id}`}
                                                    checked={formData.allowedBrands.includes(brand.id)}
                                                    onChange={() => toggleBrand(brand.id)}
                                                    className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                                />
                                                <label htmlFor={`brand-${brand.id}`} className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                                    {brand.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="targets" className="space-y-4 focus-visible:outline-none mt-2">
                                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                                    <p className="text-sm text-amber-800 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Targets are set for the current month ({new Date().toLocaleString('default', { month: 'long' })})
                                    </p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="dealsTarget">Monthly Deals Goal</Label>
                                        <Input
                                            id="dealsTarget"
                                            type="number"
                                            min="0"
                                            value={formData.monthDealsTarget}
                                            onChange={(e) => setFormData({ ...formData, monthDealsTarget: Number(e.target.value) })}
                                        />
                                        <p className="text-xs text-slate-500">Target number of won deals</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="visitsTarget">Monthly Visits/Activities Goal</Label>
                                        <Input
                                            id="visitsTarget"
                                            type="number"
                                            min="0"
                                            value={formData.monthVisitsTarget}
                                            onChange={(e) => setFormData({ ...formData, monthVisitsTarget: Number(e.target.value) })}
                                        />
                                        <p className="text-xs text-slate-500">Target number of visits or logged activities</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!formData.name || !formData.email || (!editingMember && !formData.password)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {editingMember ? 'Save Changes' : 'Add Member'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
