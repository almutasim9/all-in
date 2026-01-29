'use client';

import { ReactNode } from 'react';
import { useClients } from '@/contexts/client-context';
import { useTeam } from '@/contexts/team-context';
import { useProducts } from '@/contexts/product-context';
import {
    Client, Activity, TeamMember, Subscription, MonthlyTarget, Product, Brand
} from './types';

// Re-export types for compatibility
export type { Client, Activity, TeamMember, Subscription, MonthlyTarget, Product, Brand };

// Legacy DataProvider - no longer needed essentially but kept for compatibility if imported elsewhere
export function DataProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function useData() {
    const {
        clients,
        activities,
        isLoading: loadingClients,
        addClient,
        updateClient,
        deleteClient,
        addActivity,
        getClientActivities,
        // Pagination
        page,
        pageSize,
        totalItems,
        totalPages,
        nextPage,
        prevPage,
        setPage
    } = useClients();

    const {
        teamMembers,
        monthlyTargets,
        isLoading: loadingTeam,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        getTeamMemberById,
        getSalesReps,
        getMonthlyTarget,
        setMonthlyTarget,
        getMonthlyTargetsForMonth
    } = useTeam();

    const {
        products,
        brands,
        subscriptions,
        isLoading: loadingProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        addBrand,
        updateBrand,
        deleteBrand,
        addSubscription,
        getClientSubscriptions
    } = useProducts();

    return {
        // Clients
        clients,
        activities,
        addClient,
        updateClient,
        deleteClient,
        addActivity,
        getClientActivities,
        page,
        pageSize,
        totalItems,
        totalPages,
        nextPage,
        prevPage,
        setPage,

        // Team
        teamMembers,
        monthlyTargets,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        getTeamMemberById,
        getSalesReps,
        getMonthlyTarget,
        setMonthlyTarget,
        getMonthlyTargetsForMonth,

        // Products
        products,
        brands,
        subscriptions,
        addProduct,
        updateProduct,
        deleteProduct,
        addBrand,
        updateBrand,
        deleteBrand,
        addSubscription,
        getClientSubscriptions,

        // Global
        isLoading: loadingClients || loadingTeam || loadingProducts
    };
}
