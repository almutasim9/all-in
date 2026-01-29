'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Product, Brand, Subscription } from '@/lib/types';

interface ProductContextType {
    products: Product[];
    brands: Brand[];
    subscriptions: Subscription[];
    isLoading: boolean;
    addProduct: (product: Omit<Product, 'id'>) => Product;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    addBrand: (brand: Omit<Brand, 'id'>) => Brand;
    updateBrand: (id: string, updates: Partial<Brand>) => void;
    deleteBrand: (id: string) => void;
    addSubscription: (subscription: Omit<Subscription, 'id'>) => Subscription;
    getClientSubscriptions: (clientId: string) => Subscription[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

function generateId(): string {
    return crypto.randomUUID();
}

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProductData = async () => {
            setIsLoading(true);
            try {
                // 1. Products
                const { data: productsData } = await supabase.from('products').select('*');
                if (productsData) {
                    setProducts(productsData.map(p => ({
                        id: p.id,
                        brandId: p.brand_id,
                        name: p.name,
                        description: p.description,
                        price: p.price,
                        currency: p.currency,
                        period: p.period,
                        features: p.features,
                        isPopular: p.is_popular,
                    } as Product)));
                }

                // 2. Brands
                const { data: brandsData } = await supabase.from('brands').select('*');
                if (brandsData) {
                    setBrands(brandsData);
                }

                // 3. Subscriptions
                const { data: subsData } = await supabase.from('subscriptions').select('*');
                if (subsData) {
                    setSubscriptions(subsData.map(s => ({
                        id: s.id,
                        clientId: s.client_id,
                        productId: s.product_id,
                        productName: s.product_name,
                        startDate: s.start_date,
                        endDate: s.end_date,
                        status: s.status,
                        amount: s.amount,
                    } as Subscription)));
                }

            } catch (error) {
                console.error('Error fetching product data:', error);
                toast.error('Failed to load product data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductData();
    }, []);

    // --- Products ---
    const addProduct = (productData: Omit<Product, 'id'>) => {
        const id = generateId();
        const newProduct = { ...productData, id };
        setProducts(prev => [...prev, newProduct]);

        supabase.from('products').insert({
            id,
            brand_id: productData.brandId,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            currency: productData.currency,
            period: productData.period,
            features: productData.features,
            is_popular: productData.isPopular
        }).then(({ error }) => {
            if (error) {
                console.error('Error creating product:', error);
                toast.error('Failed to create product');
            }
        });

        return newProduct;
    };

    const updateProduct = (id: string, updates: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.price) dbUpdates.price = updates.price;
        if (updates.features) dbUpdates.features = updates.features;
        if (updates.isPopular !== undefined) dbUpdates.is_popular = updates.isPopular;

        if (Object.keys(dbUpdates).length > 0) {
            supabase.from('products').update(dbUpdates).eq('id', id).then(({ error }) => {
                if (error) {
                    console.error('Error updating product:', error);
                    toast.error('Failed to update product');
                }
            });
        }
    };

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        supabase.from('products').delete().eq('id', id).then(({ error }) => {
            if (error) {
                console.error('Error deleting product:', error);
                toast.error('Failed to delete product');
            }
        });
    };

    // --- Brands ---
    const addBrand = (brandData: Omit<Brand, 'id'>) => {
        const id = generateId();
        const newBrand = { ...brandData, id };
        setBrands(prev => [...prev, newBrand]);

        supabase.from('brands').insert({
            id,
            name: brandData.name,
            description: brandData.description
        }).then(({ error }) => {
            if (error) {
                console.error('Error creating brand:', error);
                toast.error(`Failed to create brand: ${error.message}`);
            } else {
                toast.success('Brand created successfully');
            }
        });

        return newBrand;
    };

    const updateBrand = (id: string, updates: Partial<Brand>) => {
        setBrands(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

        supabase.from('brands').update(updates).eq('id', id).then(({ error }) => {
            if (error) {
                console.error('Error updating brand:', error);
                toast.error('Failed to update brand');
            }
        });
    };

    const deleteBrand = (id: string) => {
        setBrands(prev => prev.filter(b => b.id !== id));

        supabase.from('brands').delete().eq('id', id).then(({ error }) => {
            if (error) {
                console.error('Error deleting brand:', error);
                toast.error('Failed to delete brand');
            }
        });
    };

    // --- Subscriptions ---
    const addSubscription = (subscriptionData: Omit<Subscription, 'id'>): Subscription => {
        const id = generateId();
        const newSubscription: Subscription = { ...subscriptionData, id };
        setSubscriptions(prev => [newSubscription, ...prev]);

        supabase.from('subscriptions').insert({
            id,
            client_id: subscriptionData.clientId,
            product_id: subscriptionData.productId,
            product_name: subscriptionData.productName,
            start_date: subscriptionData.startDate,
            end_date: subscriptionData.endDate,
            status: subscriptionData.status,
            amount: subscriptionData.amount
        }).then(({ error }) => {
            if (error) {
                console.error('Error creating subscription:', error);
                toast.error('Failed to save subscription');
            }
        });

        return newSubscription;
    };

    const getClientSubscriptions = (clientId: string): Subscription[] => {
        return subscriptions.filter(s => s.clientId === clientId);
    };

    return (
        <ProductContext.Provider value={{
            products,
            brands,
            subscriptions,
            isLoading,
            addProduct,
            updateProduct,
            deleteProduct,
            addBrand,
            updateBrand,
            deleteBrand,
            addSubscription,
            getClientSubscriptions
        }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
}
