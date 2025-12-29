const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function fixProfiles() {
    console.log('--- Syncing Profiles to Database ---');

    // 1. Read .env.local
    const envPath = path.resolve(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim().replace(/"/g, '');
        }
    });

    const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
    const supabase = createClient(supabaseUrl, supabaseKey);

    const users = [
        {
            email: 'ahmed@menuplus.io',
            password: 'admin123',
            profile: {
                name: 'Ahmed Hassan',
                role: 'admin',
                status: 'active',
                avatar_url: 'https://i.pravatar.cc/150?u=ahmed'
            }
        },
        {
            email: 'sarah@menuplus.io',
            password: 'sales123',
            profile: {
                name: 'Sarah Ali',
                role: 'sales_rep',
                status: 'active',
                allowed_provinces: ['Baghdad'],
                allowed_brands: ['brand-1'],
                avatar_url: 'https://i.pravatar.cc/150?u=sarah'
            }
        },
        {
            email: 'omar@menuplus.io',
            password: 'sales123',
            profile: {
                name: 'Omar Khalil',
                role: 'sales_rep',
                status: 'active',
                allowed_provinces: ['Basra'],
                allowed_brands: ['brand-2'],
                avatar_url: 'https://i.pravatar.cc/150?u=omar'
            }
        }
    ];

    for (const user of users) {
        console.log(`\nProcessing ${user.email}...`);

        // 1. Login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password
        });

        if (authError) {
            console.error(`❌ Login failed: ${authError.message}`);
            continue;
        }

        const userId = authData.session.user.id;
        console.log(`✅ Logged in (ID: ${userId})`);

        // 2. Check if profile exists
        const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).single();

        if (existing) {
            console.log('ℹ️ Profile already exists.');
        } else {
            // 3. Insert Profile
            // We must use the user's OWN ID due to RLS policy: (auth.uid() = id)
            const { error: insertError } = await supabase.from('profiles').insert({
                id: userId,
                email: user.email,
                ...user.profile
            });

            if (insertError) {
                console.error(`❌ Insert failed: ${insertError.message}`);
            } else {
                console.log('✅ Profile created successfully!');
            }
        }

        // Logout to be clean
        await supabase.auth.signOut();
    }
}

fixProfiles();
