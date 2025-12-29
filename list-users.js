const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function listUsers() {
    console.log('--- Listing All Users ---');

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

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('❌ Error fetching profiles:', error.message);
        return;
    }

    console.log(`✅ Found ${profiles.length} accounts:\n`);
    console.table(profiles.map(p => ({
        Name: p.name,
        Email: p.email,
        Role: p.role,
        Status: p.status
    })));
}

listUsers();
