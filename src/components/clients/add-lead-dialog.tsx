'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    Plus,
    Building2,
    UserPlus,
    Phone,
    MapPin,
    Map,
    Tag,
    Instagram
} from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';

interface AddLeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddLeadDialog({ open, onOpenChange }: AddLeadDialogProps) {
    const { clients, addClient, products, brands } = useData();
    const { user } = useAuth();
    const [duplicateError, setDuplicateError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
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

    // Update province when dialog opens
    useEffect(() => {
        if (open && user?.allowedProvinces && user.allowedProvinces.length > 0 && !formData.province) {
            setFormData(prev => ({ ...prev, province: user.allowedProvinces![0] }));
        }
        if (!open) {
            setDuplicateError(null);
        }
    }, [open, user?.allowedProvinces]);

    // Handle Add Lead submit
    const handleAddLead = () => {
        // Validate mandatory fields
        if (!formData.businessName || !formData.phone || !formData.province || !formData.category || !formData.productInterest || !formData.googleMapsUrl) return;

        // Check for duplicate phone
        const existingClient = clients.find(c => c.phone === formData.phone);
        if (existingClient) {
            setDuplicateError(`This number is already registered for client: ${existingClient.name}`);
            return;
        }

        // Find selected product
        const product = products.find(p => p.id === formData.productInterest);

        // Add new lead
        addClient({
            name: formData.businessName,
            email: '',
            phone: formData.phone,
            productInterest: product?.name || 'Menu Plus Basic',
            dealValue: product?.price || 0,
            status: 'new',
            address: formData.address || formData.province,
            province: formData.province,
            category: formData.category || undefined,
            instagram: formData.instagram || undefined,
            googleMapsUrl: formData.googleMapsUrl,
            notes: `Owner: ${formData.ownerName} | Added by: ${user?.name}`,
            assignedTo: undefined, // Stays unassigned by default, usually
            lastInteraction: new Date().toISOString(),
        });

        // Reset form
        setFormData({
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
        onOpenChange(false);
    };

    // Filter brands based on user permissions
    const allowedBrands = user?.role === 'admin'
        ? brands
        : brands.filter(b => user?.allowedBrands?.includes(b.id));

    // Provinces List
    const provincesList = user?.role === 'admin' ? [
        'Baghdad', 'Basra', 'Nineveh', 'Erbil', 'Najaf', 'Karbala',
        'Sulaymaniyah', 'Duhok', 'Kirkuk', 'Dhi Qar', 'Diyala',
        'Wasit', 'Maysan', 'Al-Muthanna', 'Babylon', 'Anbar',
        'Al-Qadisiyah', 'Saladin'
    ] : (user?.allowedProvinces || []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md h-[90vh] overflow-y-auto sm:h-auto">
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
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
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
                            value={formData.ownerName}
                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
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
                            value={formData.phone}
                            onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setDuplicateError(null); }}
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
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                            value={formData.googleMapsUrl}
                            onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="leadCategory" className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-slate-400" />
                            Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                            value={formData.productInterest}
                            onValueChange={(value) => setFormData({ ...formData, productInterest: value })}
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
                            Province <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.province}
                            onValueChange={(value) => setFormData({ ...formData, province: value })}
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
                            value={formData.instagram}
                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={handleAddLead}
                        disabled={!formData.businessName || !formData.phone || !formData.category || !formData.productInterest || !formData.googleMapsUrl}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lead
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
