'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    Building2, User, Phone, MapPin, Instagram, Plus, Check, ArrowRight,
    AlertTriangle, Info, Map, Tag
} from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';

interface LeadFormData {
    businessName: string;
    ownerName: string;
    phoneNumber: string;
    address: string;
    googleMapsUrl: string;
    province: string;
    category: string;
    productInterest: string;
    instagramUrl: string;
}

const initialFormData: LeadFormData = {
    businessName: '',
    ownerName: '',
    phoneNumber: '',
    address: '',
    googleMapsUrl: '',
    province: '',
    category: '',
    productInterest: '',
    instagramUrl: '',
};

const provinces = [
    'Baghdad', 'Basra', 'Nineveh', 'Erbil', 'Najaf',
    'Karbala', 'Sulaymaniyah', 'Duhok', 'Kirkuk', 'Dhi Qar',
    'Diyala', 'Wasit', 'Maysan', 'Al Muthanna', 'Babil',
    'Anbar', 'Al-Qadisiyyah', 'Saladin'
];

export function AddLeadForm() {
    const { user } = useAuth();
    // Pre-fill province if available
    const [formData, setFormData] = useState<LeadFormData>({
        ...initialFormData,
        province: (user?.allowedProvinces && user.allowedProvinces.length > 0) ? user.allowedProvinces[0] : ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastAddedClient, setLastAddedClient] = useState<string | null>(null);
    const [duplicateError, setDuplicateError] = useState<string | null>(null);

    const { addClient, clients, products, brands } = useData();
    const router = useRouter();

    const handleInputChange = (field: keyof LeadFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Check for duplicate phone when phone changes
        if (field === 'phoneNumber') {
            checkDuplicate(value);
        }
    };

    // Check for duplicate by phone number
    const checkDuplicate = (phone: string) => {
        if (!phone || phone.length < 5) {
            setDuplicateError(null);
            return;
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const existing = clients.find(c =>
            c.phone.replace(/[^0-9]/g, '').includes(cleanPhone) ||
            cleanPhone.includes(c.phone.replace(/[^0-9]/g, ''))
        );

        if (existing) {
            setDuplicateError(`This number is registered to: "${existing.name}"`);
        } else {
            setDuplicateError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Block if duplicate
        if (duplicateError) {
            return;
        }

        setIsSubmitting(true);

        // Simulate small delay for UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Find selected product to get price snapshot
        const product = products.find(p => p.id === formData.productInterest);

        // Add client to store - ALWAYS Unassigned, Admin will assign later
        const newClient = addClient({
            name: formData.businessName,
            status: 'new',
            phone: formData.phoneNumber,
            productInterest: product?.name || 'Menu Plus Basic',
            dealValue: product?.price || 0,
            lastInteraction: new Date().toISOString().split('T')[0],
            email: '',
            address: formData.address || formData.province,
            province: formData.province || undefined,
            category: formData.category || undefined,
            instagram: formData.instagramUrl || undefined,
            googleMapsUrl: formData.googleMapsUrl,
            notes: [
                formData.ownerName ? `Owner: ${formData.ownerName}` : '',
                `Added by: ${user?.name || 'Unknown'}`,
            ].filter(Boolean).join(' | '),
            // NO assignedTo - stays Unassigned for Admin to assign
            assignedTo: undefined,
        });

        setLastAddedClient(newClient.name);
        setShowSuccess(true);
        setFormData({
            ...initialFormData,
            province: (user?.allowedProvinces && user.allowedProvinces.length > 0) ? user.allowedProvinces[0] : '' // Keep province pre-filled
        });
        setDuplicateError(null);
        setIsSubmitting(false);

        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
    };

    const handleGoToClients = () => {
        router.push('/clients');
    };

    const isFormValid =
        formData.businessName.trim() !== '' &&
        formData.phoneNumber.trim() !== '' &&
        formData.category !== '' &&
        formData.productInterest !== '' &&
        formData.googleMapsUrl.trim() !== '' &&
        !duplicateError;

    const isAdmin = user?.role === 'admin';

    const provincesList = user?.role === 'admin'
        ? provinces
        : (user?.allowedProvinces && user.allowedProvinces.length > 0 ? user.allowedProvinces : provinces);

    const allowedBrands = user?.role === 'admin'
        ? brands
        : brands.filter(b => user?.allowedBrands?.includes(b.id));

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4" dir="ltr">
            <Card className="w-full max-w-lg rounded-lg border-slate-200 bg-white shadow-lg">
                {/* ... existing header ... */}
                <CardHeader className="space-y-1 pb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white mb-2">
                        <Plus className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Add New Lead</CardTitle>
                    <CardDescription className="text-slate-500">
                        Enter potential client/restaurant details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* ... existing info banner ... */}
                    <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 mb-5 border border-blue-200">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-700">
                            <p className="font-medium">Client will be saved as "Unassigned"</p>
                            <p className="text-xs text-blue-600 mt-0.5">
                                Admin will review and assign to the appropriate representative
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Business Name */}
                        <div className="space-y-2">
                            <Label htmlFor="businessName" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                Business Name <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Building2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="businessName"
                                    placeholder="e.g. Al Rashid Restaurant"
                                    value={formData.businessName}
                                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                                    className="pr-10 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                                    required
                                />
                            </div>
                        </div>

                        {/* Owner Name */}
                        <div className="space-y-2">
                            <Label htmlFor="ownerName" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                Owner Name
                            </Label>
                            <div className="relative">
                                <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="ownerName"
                                    placeholder="e.g. Ahmed Ali"
                                    value={formData.ownerName}
                                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                                    className="pr-10 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                Category <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => handleInputChange('category', value)}
                            >
                                <SelectTrigger className="border-slate-200" dir="rtl">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-slate-400" />
                                        <SelectValue placeholder="Select Category" />
                                    </div>
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

                        {/* Product Interest */}
                        <div className="space-y-2">
                            <Label htmlFor="productInterest" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                Product Interest <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.productInterest}
                                onValueChange={(value) => handleInputChange('productInterest', value)}
                            >
                                <SelectTrigger className="border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-slate-400" />
                                        <SelectValue placeholder="Select Product" />
                                    </div>
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
                                    {/* Handle orphaned products if any - ONLY for Admins or if no restrictions */}
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

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    dir="ltr"
                                    placeholder="+964 770 123 4567"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    className={`pr-10 text-right border-slate-200 focus:border-blue-300 focus:ring-blue-200 ${duplicateError ? 'border-red-300 bg-red-50' : ''
                                        }`}
                                    required
                                />
                            </div>
                            {/* Duplicate Warning */}
                            {duplicateError && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>{duplicateError}</span>
                                </div>
                            )}
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                Address <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="address"
                                    placeholder="e.g. Al Mansour, St 14..."
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    className="pr-10 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Google Maps URL */}
                        <div className="space-y-2">
                            <Label htmlFor="googleMapsUrl" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                Google Maps Link <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Map className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="googleMapsUrl"
                                    dir="ltr"
                                    placeholder="https://maps.app.goo.gl/..."
                                    value={formData.googleMapsUrl}
                                    onChange={(e) => handleInputChange('googleMapsUrl', e.target.value)}
                                    className="pr-10 text-right border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                                    required
                                />
                            </div>
                        </div>

                        {/* Province */}
                        <div className="space-y-2">
                            <Label htmlFor="province" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                Province
                            </Label>
                            <Select
                                value={formData.province}
                                onValueChange={(value) => handleInputChange('province', value)}
                            >
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Select Province" />
                                </SelectTrigger>
                                <SelectContent>
                                    {provincesList.map(p => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Instagram URL */}
                        <div className="space-y-2">
                            <Label htmlFor="instagramUrl" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                Instagram Page
                            </Label>
                            <div className="relative">
                                <Instagram className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="instagramUrl"
                                    dir="ltr"
                                    placeholder="@restaurantname"
                                    value={formData.instagramUrl}
                                    onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                                    className="pr-10 text-right border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Success Message */}
                        {showSuccess && (
                            <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 text-emerald-700 border border-emerald-200">
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5" />
                                    <div>
                                        <span className="text-sm font-medium">Successfully added "{lastAddedClient}"!</span>
                                        <p className="text-xs text-emerald-600">Pending assignment by admin</p>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleGoToClients}
                                        className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
                                    >
                                        Go to Profile
                                        <ArrowRight className="mr-1 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={!isFormValid || isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Save & Add Another
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
