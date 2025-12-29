const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function createAdmin() {
    console.log('--- Creating Admin Account ---');

    const envPath = path.resolve(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim().replace(/"/g, '');
        }
    });

    const supabase = createClient(envVars['NEXT_PUBLIC_SUPABASE_URL'], envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

    const email = 'almutsim.abed@gmail.com';
    const password = 'as123as##';
    const name = 'Almutasim Abed'; // Taking a guess at the name format based on email

    console.log(`Processing ${email}...`);

    // 1. Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                name: name,
                role: 'admin' // Metadata role
            }
        }
    });

    if (authError) {
        console.error(`❌ Sign up failed: ${authError.message}`);
        // If user already exists, we might want to try signing in and updating profile?
        // But for "create account" request, failure is the default if exists.
        return;
    }

    const userId = authData.user?.id;

    if (!userId) {
        console.error('❌ User ID missing after sign up (maybe confirm email needed?)');
        return;
    }

    console.log(`✅ Auth created (ID: ${userId})`);

    // 2. Create Profile (Login first ensuring triggers or manual insert works)
    // We can try inserting directly since we are using anon key but with RLS...
    // RLS "Users can insert their own profile" requires auth.uid() = id.
    // So we MUST sign in as this user to insert the profile.

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (signInError) {
        console.error(`❌ Could not sign in to create profile: ${signInError.message}`);
        return;
    }

    // Insert Profile
    // Check if exists first
    const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).single();

    if (!existing) {
        const { error: insertError } = await supabase.from('profiles').insert({
            id: userId,
            email: email,
            name: name,
            role: 'admin',
            status: 'active',
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });

        if (insertError) {
            console.error(`❌ Profile creation failed: ${insertError.message}`);
        } else {
            console.log('✅ Admin Profile created successfully in database!');
        }
    } else {
        console.log('ℹ️ Profile already exists. updating role to admin...');
        const { error: updateError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
        if (updateError) console.error('❌ Failed to update role');
        else console.log('✅ Role confirmed as Admin.');
    }

    // Sign out
    await supabase.auth.signOut();
}

createAdmin();
