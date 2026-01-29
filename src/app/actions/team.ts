'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

interface CreateMemberParams {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'sales_rep' | 'data_entry';
    phone?: string;
    allowedProvinces?: string[];
    allowedBrands?: string[];
}

export async function createTeamMemberAction(params: CreateMemberParams) {
    console.log('--- Creating Team Member (Server Action) ---');

    // 1. Check for Service Key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return {
            success: false,
            error: 'Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing. Cannot create users.'
        };
    }

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: params.email,
        password: params.password || 'temp12345', // Default temp password if none provided
        email_confirm: true, // Auto-confirm email
        user_metadata: {
            name: params.name,
            role: params.role
        }
    });

    if (authError) {
        console.error('Auth Creation Error:', authError);
        return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;
    if (!userId) {
        return { success: false, error: 'Failed to retrieve User ID after creation' };
    }

    // 3. Insert Profile
    // We used admin client, so RLS is bypassed.
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        email: params.email,
        name: params.name,
        role: params.role,
        status: 'active',
        phone: params.phone || null, // Ensure field exists in schema or modify here
        allowed_provinces: params.allowedProvinces || [],
        allowed_brands: params.allowedBrands || [],
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(params.name)}&background=random`
    });

    if (profileError) {
        console.error('Profile Creation Error:', profileError);
        // Clean up auth user to avoid orphan record
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return { success: false, error: `Profile Error: ${profileError.message}` };
    }

    revalidatePath('/team');
    return { success: true, userId, message: 'User created successfully' };
}
