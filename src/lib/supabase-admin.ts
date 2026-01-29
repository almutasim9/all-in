import { createClient } from '@supabase/supabase-js';

// Note: This client should ONLY be used in Server Actions or API Routes
// NEVER import this in a client-side component

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    // We log a warning but don't crash, to allow build to pass if key is missing locally
    // Logic consuming this should check for null
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is missing. Admin functions will fail.');
}

export const supabaseAdmin = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceKey || 'placeholder-key',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);
