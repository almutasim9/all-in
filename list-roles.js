const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function listRoles() {
    console.log('--- Listing User Roles ---');

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

    const { data: profiles, error } = await supabase.from('profiles').select('id, email, name, role');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.table(profiles);
}

listRoles();
