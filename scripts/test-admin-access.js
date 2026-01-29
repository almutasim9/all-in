const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually since we are running standalone
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

const url = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Verifying Supabase Admin Access ---');
console.log('URL:', url);
console.log('Service Key stored:', serviceKey ? 'Yes (Starts with ' + serviceKey.substring(0, 5) + '...)' : 'No');

if (!url || !serviceKey) {
    console.error('❌ Missing URL or Service Key');
    process.exit(1);
}

const supabase = createClient(url, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testAdmin() {
    console.log('Attempting to list users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('❌ Admin Access Failed:', error.message);
        console.log('Hint: Check if the Service Role Key is correct.');
    } else {
        console.log(`✅ Admin Access Successful! Found ${users.length} users.`);
        console.log('The system is ready to create team members.');
    }
}

testAdmin();
