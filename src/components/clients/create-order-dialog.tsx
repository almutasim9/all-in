'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Assuming you have input for quantity if needed, or just duration
import { toast } from 'sonner';
import { useData } from '@/lib/data-context';
import { Client } from '@/lib/types';

interface CreateOrderDialogProps {
    client: Client;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOrderCreated?: () => void;
}

const products = [
    { id: 'menu-plus-pro', name: 'Menu Plus Pro', price: 50 },
    { id: 'menu-plus-lite', name: 'Menu Plus Lite', price: 30 },
    { id: 'marketing-package', name: 'Marketing Package', price: 100 },
];

const durations = [
    { label: '1 Year', value: '1_year' },
    { label: '2 Years', value: '2_years' },
    { label: '3 Years', value: '3_years' },
    { label: '6 Months', value: '6_months' },
];

export function CreateOrderDialog({ client, open, onOpenChange, onOrderCreated }: CreateOrderDialogProps) {
    const { addSubscription, updateClient } = useData();
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [selectedDuration, setSelectedDuration] = useState<string>('1_year');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!selectedProduct) {
            toast.error('Please select a product');
            return;
        }

        setIsLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const product = products.find(p => p.id === selectedProduct);
        const startDate = new Date();
        const endDate = new Date();

        if (selectedDuration.includes('year')) {
            const years = parseInt(selectedDuration.split('_')[0]);
            endDate.setFullYear(endDate.getFullYear() + years);
        } else if (selectedDuration.includes('months')) {
            const months = parseInt(selectedDuration.split('_')[0]);
            endDate.setMonth(endDate.getMonth() + months);
        }

        addSubscription({
            clientId: client.id,
            productId: product?.id || 'unknown', // Added productId
            productName: product?.name || 'Unknown Product',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: 'active',
            amount: product?.price || 0,
        });

        // Optionally move client to 'Won' if not already
        if (client.status !== 'won') {
            updateClient(client.id, { status: 'won' });
            toast.success('Deal Won!', {
                description: 'Client status updated to Won Deals.',
            });
        }

        toast.success('Order Created Successfully', {
            description: `Subscription added for ${product?.name}`,
        });

        setIsLoading(false);
        onOpenChange(false);
        onOrderCreated?.();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>
                        Create a subscription order for {client.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="product">Product</Label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                            <SelectTrigger id="product">
                                <SelectValue placeholder="Select product..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.name} (${product.price}/mo)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                            <SelectTrigger id="duration">
                                <SelectValue placeholder="Select duration..." />
                            </SelectTrigger>
                            <SelectContent>
                                {durations.map((duration) => (
                                    <SelectItem key={duration.value} value={duration.value}>
                                        {duration.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Order'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
