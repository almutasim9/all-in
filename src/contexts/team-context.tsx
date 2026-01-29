'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { TeamMember, MonthlyTarget } from '@/lib/types';
import { createTeamMemberAction } from '@/app/actions/team'; // Import Server Action directly

interface TeamContextType {
    teamMembers: TeamMember[];
    monthlyTargets: MonthlyTarget[];
    isLoading: boolean;
    addTeamMember: (member: Omit<TeamMember, 'id' | 'status'>) => Promise<TeamMember | null>;
    updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
    deleteTeamMember: (id: string) => void;
    getTeamMemberById: (id: string) => TeamMember | undefined;
    getSalesReps: () => TeamMember[];
    getMonthlyTarget: (memberId: string, month: number, year: number) => MonthlyTarget | undefined;
    setMonthlyTarget: (memberId: string, month: number, year: number, dealsTarget: number, visitsTarget: number) => void;
    getMonthlyTargetsForMonth: (month: number, year: number) => MonthlyTarget[];
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

function generateId(): string {
    return crypto.randomUUID();
}

export function TeamProvider({ children }: { children: ReactNode }) {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeamData = async () => {
            setIsLoading(true);
            try {
                // 1. Profiles (Team)
                const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');
                if (profilesError) throw profilesError;

                if (profilesData) {
                    setTeamMembers(profilesData.map(p => ({
                        id: p.id,
                        name: p.name || 'Unknown',
                        email: p.email || '',
                        phone: p.phone || '', // Check if phone exists in schema, mapped safely
                        role: p.role,
                        status: p.status,
                        avatar: p.avatar_url,
                        allowedProvinces: p.allowed_provinces,
                        allowedBrands: p.allowed_brands,
                    } as TeamMember)));
                }

                // 2. Monthly Targets
                const { data: targetsData, error: targetsError } = await supabase.from('monthly_targets').select('*');
                if (targetsError) throw targetsError;

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
                console.error('Error fetching team data:', error);
                toast.error('Failed to load team data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeamData();
    }, []);

    const addTeamMember = async (memberData: Omit<TeamMember, 'id' | 'status'>): Promise<TeamMember | null> => {
        // Optimistic UI update
        const tempId = generateId();
        const optimisticMember: TeamMember = {
            ...memberData,
            id: tempId,
            status: 'active',
        };
        setTeamMembers(prev => [...prev, optimisticMember]);

        try {
            const result = await createTeamMemberAction({
                name: memberData.name,
                email: memberData.email,
                role: memberData.role,
                password: memberData.password,
                phone: memberData.phone,
                allowedProvinces: memberData.allowedProvinces,
                allowedBrands: memberData.allowedBrands
            });

            if (result.success && result.userId) {
                toast.success('Team member created successfully (Login enabled)');
                setTeamMembers(prev => prev.map(m => m.id === tempId ? { ...m, id: result.userId! } : m));
                return { ...optimisticMember, id: result.userId };
            } else {
                console.error('Failed to create team member:', result.error);
                toast.error(`Failed to create account: ${result.error}`);
                setTeamMembers(prev => prev.filter(m => m.id !== tempId));
                return null;
            }
        } catch (error) {
            console.error('Unexpected error creating team member:', error);
            toast.error('An unexpected error occurred');
            setTeamMembers(prev => prev.filter(m => m.id !== tempId));
            return null;
        }
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
        // Phone?

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
        supabase.from('profiles').delete().eq('id', id).then(({ error }) => {
            if (error) {
                console.error('Error deleting team member:', error);
            }
        });
    };

    const getTeamMemberById = (id: string): TeamMember | undefined => {
        return teamMembers.find(m => m.id === id);
    };

    const getSalesReps = (): TeamMember[] => {
        return teamMembers.filter(m =>
            (m.role === 'sales_rep' || m.role === 'admin') && m.status === 'active'
        );
    };

    const getMonthlyTarget = (memberId: string, month: number, year: number): MonthlyTarget | undefined => {
        return monthlyTargets.find(t =>
            t.memberId === memberId && t.month === month && t.year === year
        );
    };

    const setMonthlyTarget = (memberId: string, month: number, year: number, dealsTarget: number, visitsTarget: number) => {
        const now = new Date().toISOString();
        const existing = monthlyTargets.find(t => t.memberId === memberId && t.month === month && t.year === year);
        const id = existing ? existing.id : generateId();

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

        supabase.from('monthly_targets').upsert({
            id: existing ? existing.id : undefined,
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

    return (
        <TeamContext.Provider value={{
            teamMembers,
            monthlyTargets,
            isLoading,
            addTeamMember,
            updateTeamMember,
            deleteTeamMember,
            getTeamMemberById,
            getSalesReps,
            getMonthlyTarget,
            setMonthlyTarget,
            getMonthlyTargetsForMonth
        }}>
            {children}
        </TeamContext.Provider>
    );
}

export function useTeam() {
    const context = useContext(TeamContext);
    if (context === undefined) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
}
