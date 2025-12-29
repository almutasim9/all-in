'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Layers, Briefcase, Star, Plus, Edit, Trash2, MoreVertical, Check } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { type Product, type Brand } from '@/lib/types';

export default function ProductsPage() {
    const { products, addProduct, updateProduct, deleteProduct, brands, addBrand, updateBrand, deleteBrand } = useData();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // State for Brand Dialog
    const [brandDialogOpen, setBrandDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [brandFormData, setBrandFormData] = useState({ name: '', description: '' });

    // State for Product Dialog
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
    const [productFormData, setProductFormData] = useState({
        name: '',
        description: '',
        price: '',
        currency: 'USD',
        period: 'month',
        features: '',
        isPopular: false,
    });

    // --- Brand Handlers ---

    const resetBrandForm = () => {
        setBrandFormData({ name: '', description: '' });
        setEditingBrand(null);
    };

    const handleEditBrand = (brand: Brand, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingBrand(brand);
        setBrandFormData({ name: brand.name, description: brand.description || '' });
        setBrandDialogOpen(true);
    };

    const handleBrandSubmit = () => {
        if (!brandFormData.name) return;

        if (editingBrand) {
            updateBrand(editingBrand.id, brandFormData);
        } else {
            addBrand(brandFormData);
        }
        setBrandDialogOpen(false);
        resetBrandForm();
    };

    const handleDeleteBrand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this brand? All associated products will be deleted!')) {
            // Delete associated products first
            products.filter(p => p.brandId === id).forEach(p => deleteProduct(p.id));
            deleteBrand(id);
        }
    };

    // --- Product Handlers ---

    const resetProductForm = () => {
        setProductFormData({
            name: '',
            description: '',
            price: '',
            currency: 'USD',
            period: 'month',
            features: '',
            isPopular: false,
        });
        setEditingProduct(null);
    };

    const handleAddProduct = (brandId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedBrandId(brandId);
        resetProductForm();
        setProductDialogOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setSelectedBrandId(product.brandId);
        setProductFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            currency: product.currency,
            period: product.period || 'month',
            features: product.features.join('\n'),
            isPopular: product.isPopular || false,
        });
        setProductDialogOpen(true);
    };

    const handleProductSubmit = () => {
        if (!productFormData.name || !productFormData.price || !selectedBrandId) return;

        const productData = {
            brandId: selectedBrandId,
            name: productFormData.name,
            description: productFormData.description,
            price: parseFloat(productFormData.price),
            currency: productFormData.currency,
            period: productFormData.period,
            features: productFormData.features.split('\n').filter(f => f.trim()),
            isPopular: productFormData.isPopular,
        };

        if (editingProduct) {
            updateProduct(editingProduct.id, productData);
        } else {
            addProduct(productData);
        }

        setProductDialogOpen(false);
        resetProductForm();
    };

    const handleDeleteProduct = (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };

    return (
        <MainLayout>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">📦 Products & Services</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage products and pricing by Brand
                    </p>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => { resetBrandForm(); setBrandDialogOpen(true); }}
                        className="bg-slate-900 hover:bg-slate-800 gap-2"
                    >
                        <Briefcase className="h-4 w-4" />
                        Add New Brand
                    </Button>
                )}
            </div>

            {brands.length === 0 ? (
                <div className="text-center py-12 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
                    <Layers className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No Brands Found</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Add a brand (e.g. Menu Plus) to start adding products.</p>
                    {isAdmin && (
                        <Button onClick={() => { resetBrandForm(); setBrandDialogOpen(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Brand
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {brands.map((brand) => (
                        <Card key={brand.id} className="overflow-hidden border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                            <Layers className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-slate-900">{brand.name}</CardTitle>
                                            <CardDescription>{brand.description}</CardDescription>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => handleAddProduct(brand.id, e)}
                                                className="text-blue-600 hover:bg-blue-50"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Product
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditBrand(brand, e as any); }}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Brand
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteBrand(brand.id, e as any); }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Brand
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {products.filter(p => p.brandId === brand.id).length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <p>No products added for this brand.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {products.filter(p => p.brandId === brand.id).map((product) => (
                                            <div
                                                key={product.id}
                                                className={`relative group rounded-lg border border-slate-200 bg-white p-5 transition-all hover:shadow-md ${product.isPopular ? 'ring-1 ring-blue-500 border-blue-500' : ''
                                                    }`}
                                            >
                                                {product.isPopular && (
                                                    <div className="absolute -top-2.5 left-4">
                                                        <Badge className="bg-blue-600 text-white text-[10px] px-2 h-5">
                                                            <Star className="mr-1 h-3 w-3 fill-current" />
                                                            Best Seller
                                                        </Badge>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-slate-900">{product.name}</h4>
                                                    {isAdmin && (
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-slate-400 hover:text-blue-600"
                                                                onClick={() => handleEditProduct(product)}
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-slate-400 hover:text-red-600"
                                                                onClick={() => handleDeleteProduct(product.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                                                    {product.description}
                                                </p>

                                                <div className="flex items-baseline mb-4">
                                                    <span className="text-2xl font-bold text-slate-900">
                                                        {product.currency === 'IQD' ? product.price.toLocaleString() : product.price}
                                                    </span>
                                                    <span className="text-xs text-slate-500 ml-1 font-medium">
                                                        {product.currency === 'USD' ? '$' : 'IQD'} / {product.period === 'once' ? 'One-time' : product.period === 'year' ? 'Yearly' : 'Monthly'}
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5 border-t border-slate-100 pt-4">
                                                    {product.features.slice(0, 3).map((feature, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                                                            <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                                                            <span className="truncate">{feature}</span>
                                                        </div>
                                                    ))}
                                                    {product.features.length > 3 && (
                                                        <p className="text-xs text-slate-400 pt-1">
                                                            +{product.features.length - 3} additional features
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Brand Dialog */}
            <Dialog open={brandDialogOpen} onOpenChange={(open) => { setBrandDialogOpen(open); if (!open) resetBrandForm(); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                        </DialogTitle>
                        <DialogDescription>
                            e.g. Menu Plus, Gym System
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Brand Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={brandFormData.name}
                                onChange={(e) => setBrandFormData({ ...brandFormData, name: e.target.value })}
                                placeholder="e.g. Menu Plus"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Short Description</Label>
                            <Input
                                value={brandFormData.description}
                                onChange={(e) => setBrandFormData({ ...brandFormData, description: e.target.value })}
                                placeholder="e.g. Digital Menu Solutions"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleBrandSubmit} className="bg-slate-900 text-white" disabled={!brandFormData.name}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Product Dialog */}
            <Dialog open={productDialogOpen} onOpenChange={(open) => { setProductDialogOpen(open); if (!open) resetProductForm(); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                        <DialogDescription>
                            Adding under: <span className="font-bold text-blue-600">{brands.find(b => b.id === selectedBrandId)?.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <Label>Product Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={productFormData.name}
                                onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                                placeholder="e.g. Basic Package"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={productFormData.description}
                                onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Price <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    value={productFormData.price}
                                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <select
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={productFormData.currency}
                                    onChange={(e) => setProductFormData({ ...productFormData, currency: e.target.value })}
                                >
                                    <option value="USD">USD</option>
                                    <option value="IQD">IQD</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Features (one per line)</Label>
                            <Textarea
                                value={productFormData.features}
                                onChange={(e) => setProductFormData({ ...productFormData, features: e.target.value })}
                                rows={4}
                                placeholder="- Feature 1&#10;- Feature 2"
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <Switch
                                checked={productFormData.isPopular}
                                onCheckedChange={(checked) => setProductFormData({ ...productFormData, isPopular: checked })}
                            />
                            <Label>Mark as "Best Seller"</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleProductSubmit} className="bg-blue-600 text-white" disabled={!productFormData.name || !productFormData.price}>
                            {editingProduct ? 'Save Changes' : 'Add Product'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
