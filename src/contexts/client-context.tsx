'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { Client, Activity } from '@/lib/types';

interface ClientContextType {
    clients: Client[];
    activities: Activity[];
    isLoading: boolean;
    // Pagination
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    setPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;

    addClient: (client: Omit<Client, 'id'>) => Client;
    updateClient: (id: string, updates: Partial<Client>) => void;
    deleteClient: (id: string) => void;
    addActivity: (activity: Omit<Activity, 'id'>) => Activity;
    getClientActivities: (clientId: string) => Activity[];
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

function generateId(): string {
    return crypto.randomUUID();
}

export function ClientProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    const fetchClients = async (pageNumber: number) => {
        setIsLoading(true);
        try {
            const start = (pageNumber - 1) * pageSize;
            const end = start + pageSize - 1;

            // 1. Clients with Count
            let query = supabase
                .from('clients')
                .select('*', { count: 'exact' });

            // Apply data isolation for non-admins
            if (user?.role !== 'admin') {
                if (user?.allowedProvinces && user.allowedProvinces.length > 0) {
                    // Filter by allowed provinces
                    query = query.in('province', user.allowedProvinces);
                } else if (user?.id) {
                    // Filter by assignment
                    query = query.eq('assigned_to', user.id);
                }
            }

            const { data: clientsData, error: clientsError, count } = await query
                .range(start, end)
                .order('created_at', { ascending: false });

            if (clientsError) throw clientsError;

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

            if (count !== null) setTotalItems(count);

            // 2. Activities (Last 500)
            const { data: activitiesData, error: activitiesError } = await supabase
                .from('activities')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(500);

            if (activitiesError) throw activitiesError;

            if (activitiesData) {
                setActivities(activitiesData.map(a => ({
                    id: a.id,
                    clientId: a.client_id,
                    type: a.type,
                    description: a.description,
                    timestamp: a.timestamp,
                    user: a.user_id, // Map the user_id from DB
                } as Activity)));
            }

        } catch (error) {
            console.error('Error fetching client data:', error);
            toast.error('Failed to load clients');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients(page);
    }, [page]);

    const nextPage = () => {
        if (page * pageSize < totalItems) setPage(p => p + 1);
    };

    const prevPage = () => {
        if (page > 1) setPage(p => p - 1);
    };

    const addClient = (clientData: Omit<Client, 'id'>): Client => {
        const id = generateId();
        const newClient: Client = { ...clientData, id };
        setClients(prev => [newClient, ...prev]);

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
            } else {
                setTotalItems(prev => prev + 1);
            }
        });

        return newClient;
    };

    const updateClient = (id: string, updates: Partial<Client>) => {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.phone) dbUpdates.phone = updates.phone;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.productInterest) dbUpdates.product_interest = updates.productInterest;
        if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo;
        if (updates.lastInteraction) dbUpdates.last_interaction = updates.lastInteraction;
        if (updates.followUpDate) dbUpdates.follow_up_date = updates.followUpDate;
        if (updates.followUpNote) dbUpdates.follow_up_note = updates.followUpNote;
        if (updates.dealValue) dbUpdates.deal_value = updates.dealValue;
        if (updates.lossReason) dbUpdates.loss_reason = updates.lossReason;
        if (updates.lossNote) dbUpdates.loss_note = updates.lossNote;
        if (updates.notes) dbUpdates.notes = updates.notes;

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
            else setTotalItems(prev => prev - 1);
        });
    };

    const addActivity = (activityData: Omit<Activity, 'id'>): Activity => {
        const id = generateId();
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
            user_id: user?.id,
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

    return (
        <ClientContext.Provider value={{
            clients,
            activities,
            isLoading,
            page,
            pageSize,
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            setPage,
            nextPage,
            prevPage,
            addClient,
            updateClient,
            deleteClient,
            addActivity,
            getClientActivities
        }}>
            {children}
        </ClientContext.Provider>
    );
}

export function useClients() {
    const context = useContext(ClientContext);
    if (context === undefined) {
        throw new Error('useClients must be used within a ClientProvider');
    }
    return context;
}
