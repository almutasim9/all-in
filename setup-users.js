const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function setupUsers() {
    console.log('--- Setting up Demo Users ---');

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

    const supabase = createClient(envVars['NEXT_PUBLIC_SUPABASE_URL'], envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

    const users = [
        {
            email: 'ahmed@menuplus.io',
            password: 'admin123',
            data: {
                name: 'Ahmed Hassan',
                role: 'admin',
                full_name: 'Ahmed Hassan'
            }
        },
        {
            email: 'sarah@menuplus.io',
            password: 'sales123',
            data: {
                name: 'Sarah Ali',
                role: 'sales_rep',
                full_name: 'Sarah Ali',
                allowedProvinces: ['Baghdad'],
                allowedBrands: ['brand-1']
            }
        },
        {
            email: 'omar@menuplus.io',
            password: 'sales123',
            data: {
                name: 'Omar Khalil',
                role: 'sales_rep',
                full_name: 'Omar Khalil',
                allowedProvinces: ['Basra'],
                allowedBrands: ['brand-2']
            }
        }
    ];

    for (const user of users) {
        console.log(`\nProcessing ${user.email}...`);

        // Try to sign up
        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                data: user.data
            }
        });

        if (error) {
            console.error(`❌ Error: ${error.message}`);
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
            console.log(`⚠️ User already exists (Auth), maybe updating profile/password needed?`);
            // If user exists, we can't update password easily with Client API without being logged in.
            // But if 'Invalid login credentials' was the error, it likely means they don't exist OR password wrong.
            // If they exist but password wrong, signUp returns identities: [] usually.
        } else {
            console.log(`✅ User created successfully! ID: ${data.user.id}`);
        }
    }
}

setupUsers();
