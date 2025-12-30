'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    type Client,
    type Activity,
    type TeamMember,
    type Subscription,
    type MonthlyTarget,
    type Product,
    type Brand
} from './types';
import { supabase } from './supabase';
import { toast } from 'sonner';
import { useAuth } from './auth-context';

interface DataStore {
    clients: Client[];
    activities: Activity[];
    teamMembers: TeamMember[];
    subscriptions: Subscription[];
    monthlyTargets: MonthlyTarget[];
    products: Product[];
    brands: Brand[];
}

interface DataContextType {
    clients: Client[];
    activities: Activity[];
    teamMembers: TeamMember[];
    subscriptions: Subscription[];
    monthlyTargets: MonthlyTarget[];
    addClient: (client: Omit<Client, 'id'>) => Client;
    updateClient: (id: string, updates: Partial<Client>) => void;
    deleteClient: (id: string) => void;
    addActivity: (activity: Omit<Activity, 'id'>) => Activity;
    getClientActivities: (clientId: string) => Activity[];
    addSubscription: (subscription: Omit<Subscription, 'id'>) => Subscription;
    getClientSubscriptions: (clientId: string) => Subscription[];
    getTeamMemberById: (id: string) => TeamMember | undefined;
    getSalesReps: () => TeamMember[];
    addTeamMember: (member: Omit<TeamMember, 'id' | 'status'>) => TeamMember;
    updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
    deleteTeamMember: (id: string) => void;
    getMonthlyTarget: (memberId: string, month: number, year: number) => MonthlyTarget | undefined;
    setMonthlyTarget: (memberId: string, month: number, year: number, dealsTarget: number, visitsTarget: number) => void;
    getMonthlyTargetsForMonth: (month: number, year: number) => MonthlyTarget[];
    brands: Brand[];
    addBrand: (brand: Omit<Brand, 'id'>) => Brand;
    updateBrand: (id: string, updates: Partial<Brand>) => void;
    deleteBrand: (id: string) => void;
    products: Product[];
    addProduct: (product: Omit<Product, 'id'>) => Product;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function generateId(): string {
    return crypto.randomUUID();
}

export function DataProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Clients
                const { data: clientsData } = await supabase.from('clients').select('*');
                if (clientsData) {
                    setClients(clientsData.map(c => ({
                        id: c.id,
                        name: c.name,
                        status: c.status,
                        phone: c.phone || '',
                        productInterest: c.product_interest || '',
                        lastInteraction: c.last_interaction,
                        email: c.email || '',
                        address: c.address || '',
                        province: c.province,
                        category: c.category,
                        instagram: c.instagram,
                        googleMapsUrl: c.google_maps_url,
                        notes: c.notes,
                        assignedTo: c.assigned_to,
                        createdAt: c.created_at,
                        followUpDate: c.follow_up_date,
                        followUpNote: c.follow_up_note,
                        dealValue: c.deal_value,
                        lossReason: c.loss_reason,
                        lossNote: c.loss_note,
                    } as Client)));
                }

                // 2. Activities
                const { data: activitiesData } = await supabase.from('activities').select('*');
                if (activitiesData) {
                    setActivities(activitiesData.map(a => ({
                        id: a.id,
                        clientId: a.client_id,
                        type: a.type,
                        description: a.description,
                        timestamp: a.timestamp,
                        user: 'System',
                    } as Activity)));
                }

                // 3. Profiles (Team)
                const { data: profilesData } = await supabase.from('profiles').select('*');
                if (profilesData) {
                    setTeamMembers(profilesData.map(p => ({
                        id: p.id,
                        name: p.name || 'Unknown',
                        email: p.email || '',
                        phone: '',
                        role: p.role,
                        status: p.status,
                        avatar: p.avatar_url,
                        allowedProvinces: p.allowed_provinces,
                        allowedBrands: p.allowed_brands,
                    } as TeamMember)));
                }

                // 4. Products
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

                // 5. Brands
                const { data: brandsData } = await supabase.from('brands').select('*');
                if (brandsData) {
                    setBrands(brandsData);
                }

                // 6. Subscriptions
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

                // 7. Monthly Targets
                const { data: targetsData } = await supabase.from('monthly_targets').select('*');
                if (targetsData) {
                    setMonthlyTargets(targetsData.map(t => ({
                        id: t.id,
                        memberId: t.member_id,
                        month: t.month,
                        year: t.year,
                        dealsTarget: t.deals_target,
                        visitsTarget: t.visits_target,
                        createdAt: t.created_at,
                        updatedAt: t.updated_at,
                    } as MonthlyTarget)));
                }

            } catch (error) {
                console.error(error);
                toast.error('Failed to sync data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const addClient = (clientData: Omit<Client, 'id'>): Client => {
        const id = generateId();
        const newClient: Client = { ...clientData, id };
        setClients(prev => [newClient, ...prev]); // Optimistic update

        supabase.from('clients').insert({
            id,
            name: clientData.name,
            status: clientData.status,
            phone: clientData.phone,
            email: clientData.email,
            address: clientData.address,
            province: clientData.province,
            category: clientData.category,
            product_interest: clientData.productInterest,
            assigned_to: clientData.assignedTo,
            last_interaction: clientData.lastInteraction || new Date().toISOString(),
            notes: clientData.notes,
        }).then(({ error }) => {
            if (error) {
                console.error('Error creating client:', error);
                toast.error('Failed to create client in database');
            }
        });

        return newClient;
    };

    const updateClient = (id: string, updates: Partial<Client>) => {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        // Map updates to DB columns
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.phone) dbUpdates.phone = updates.phone;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.productInterest) dbUpdates.product_interest = updates.productInterest;
        if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo;
        if (updates.lastInteraction) dbUpdates.last_interaction = updates.lastInteraction;
        // ... map others as needed

        if (Object.keys(dbUpdates).length > 0) {
            supabase.from('clients').update(dbUpdates).eq('id', id).then(({ error }) => {
                if (error) console.error('Error updating client:', error);
            });
        }
    };

    const deleteClient = (id: string) => {
        setClients(prev => prev.filter(c => c.id !== id));
        supabase.from('clients').delete().eq('id', id).then(({ error }) => {
            if (error) console.error('Error deleting client:', error);
        });
    };

    const addActivity = (activityData: Omit<Activity, 'id'>): Activity => {
        const id = generateId();
        // Optimistic: Use current user name or fallback
        const newActivity: Activity = {
            ...activityData,
            id,
            user: user?.name || 'Unknown'
        };
        setActivities(prev => [newActivity, ...prev]);

        supabase.from('activities').insert({
            id,
            client_id: activityData.clientId,
            type: activityData.type,
            description: activityData.description,
            user_id: user?.id, // Correctly link to user
            timestamp: activityData.timestamp
        }).then(({ error }) => {
            if (error) console.error('Error creating activity:', error);
        });

        return newActivity;
    };

    const getClientActivities = (clientId: string): Activity[] => {
        return activities
            .filter(a => a.clientId === clientId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

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

    const getTeamMemberById = (id: string): TeamMember | undefined => {
        return teamMembers.find(m => m.id === id);
    };

    const getSalesReps = (): TeamMember[] => {
        return teamMembers.filter(m =>
            (m.role === 'sales_rep' || m.role === 'admin') && m.status === 'active'
        );
    };

    const addTeamMember = (memberData: Omit<TeamMember, 'id' | 'status'>): TeamMember => {
        // This should ideally be an Admin Function calling Supabase Admin API
        const newMember: TeamMember = {
            ...memberData,
            id: generateId(),
            status: 'active',
        };
        setTeamMembers(prev => [...prev, newMember]);
        return newMember;
    };

    const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
        setTeamMembers(prev => prev.map(m =>
            m.id === id ? { ...m, ...updates } : m
        ));

        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.role) dbUpdates.role = updates.role;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.allowedProvinces) dbUpdates.allowed_provinces = updates.allowedProvinces;
        if (updates.allowedBrands) dbUpdates.allowed_brands = updates.allowedBrands;

        if (Object.keys(dbUpdates).length > 0) {
            supabase.from('profiles').update(dbUpdates).eq('id', id).then(({ error }) => {
                if (error) {
                    console.error('Error updating team member:', error);
                    toast.error('Failed to update team member');
                }
            });
        }
    };

    const deleteTeamMember = (id: string) => {
        setTeamMembers(prev => prev.filter(m => m.id !== id));
        // Note: This might fail if the user is not authorized or due to foreign key constraints
        supabase.from('profiles').delete().eq('id', id).then(({ error }) => {
            if (error) {
                console.error('Error deleting team member:', error);
                // Don't show toast as this is likely restricted
            }
        });
    };

    const getMonthlyTarget = (memberId: string, month: number, year: number): MonthlyTarget | undefined => {
        return monthlyTargets.find(t =>
            t.memberId === memberId && t.month === month && t.year === year
        );
    };

    const setMonthlyTarget = (memberId: string, month: number, year: number, dealsTarget: number, visitsTarget: number) => {
        // Optimistic
        const now = new Date().toISOString();
        const existing = monthlyTargets.find(t => t.memberId === memberId && t.month === month && t.year === year);
        let id = existing ? existing.id : generateId();

        if (existing) {
            setMonthlyTargets(prev => prev.map(t => t.id === existing.id ? { ...t, dealsTarget, visitsTarget } : t));
        } else {
            const newTarget: MonthlyTarget = {
                id,
                memberId, month, year, dealsTarget, visitsTarget,
                createdAt: now, updatedAt: now
            };
            setMonthlyTargets(prev => [...prev, newTarget]);
        }

        // Upsert to DB
        supabase.from('monthly_targets').upsert({
            id: existing ? existing.id : undefined, // Let DB handle ID if new, or rely on constraint
            member_id: memberId,
            month,
            year,
            deals_target: dealsTarget,
            visits_target: visitsTarget,
            updated_at: now
        }, { onConflict: 'member_id, month, year' }).then(({ error }) => {
            if (error) {
                console.error('Error setting monthly target:', error);
                toast.error('Failed to save monthly target');
            }
        });
    };

    const getMonthlyTargetsForMonth = (month: number, year: number): MonthlyTarget[] => {
        return monthlyTargets.filter(t => t.month === month && t.year === year);
    };

    const brandsObj = {
        brands,
        addBrand: (brandData: Omit<Brand, 'id'>) => {
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
                    toast.error(`Failed to create brand: ${error.message} (Code: ${error.code})`);
                } else {
                    toast.success('Brand created successfully');
                }
            });

            return newBrand;
        },
        updateBrand: (id: string, updates: Partial<Brand>) => {
            setBrands(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

            supabase.from('brands').update(updates).eq('id', id).then(({ error }) => {
                if (error) {
                    console.error('Error updating brand:', error);
                    toast.error('Failed to update brand');
                }
            });
        },
        deleteBrand: (id: string) => {
            setBrands(prev => prev.filter(b => b.id !== id));

            supabase.from('brands').delete().eq('id', id).then(({ error }) => {
                if (error) {
                    console.error('Error deleting brand:', error);
                    toast.error('Failed to delete brand');
                }
            });
        }
    };

    const productsObj = {
        products,
        addProduct: (productData: Omit<Product, 'id'>) => {
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
        },
        updateProduct: (id: string, updates: Partial<Product>) => {
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
        },
        deleteProduct: (id: string) => {
            setProducts(prev => prev.filter(p => p.id !== id));
            supabase.from('products').delete().eq('id', id).then(({ error }) => {
                if (error) {
                    console.error('Error deleting product:', error);
                    toast.error('Failed to delete product');
                }
            });
        }
    };

    return (
        <DataContext.Provider value={{
            clients,
            activities,
            teamMembers,
            subscriptions,
            monthlyTargets,
            addClient,
            updateClient,
            deleteClient,
            addActivity,
            getClientActivities,
            addSubscription,
            getClientSubscriptions,
            getTeamMemberById,
            getSalesReps,
            addTeamMember,
            updateTeamMember,
            deleteTeamMember,
            getMonthlyTarget,
            setMonthlyTarget,
            getMonthlyTargetsForMonth,
            ...brandsObj,
            ...productsObj,
            isLoading
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
