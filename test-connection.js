const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
    console.log('--- Supabase Connection Diagnostic ---');

    // 1. Read .env.local manually
    const envPath = path.resolve(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local file NOT found!');
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim().replace(/"/g, ''); // Remove quotes
        }
    });

    const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials in .env.local');
        console.log('URL:', supabaseUrl);
        console.log('Key:', supabaseKey ? 'Found' : 'Missing');
        return;
    }

    console.log('✅ Found credentials');
    console.log('URL:', supabaseUrl);

    // 2. Initialize Client
    console.log('\n--- Testing Initialization ---');
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Client initialized');

        // 3. Test Connection (Read public table)
        console.log('\n--- Testing Database Read (public.brands) ---');
        const { data, error: dbError } = await supabase.from('brands').select('count', { count: 'exact', head: true });

        if (dbError) {
            console.error('❌ Database connection FAILED:', dbError.message);
        } else {
            console.log('✅ Database connection SUCCESS. (Read test passed)');
        }

        // 4. Test Auth (Demo Account)
        console.log('\n--- Testing Authentication (ahmed@menuplus.io) ---');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'ahmed@menuplus.io',
            password: 'admin123'
        });

        if (authError) {
            console.error('❌ Auth FAILED:', authError.message);
            if (authError.message === 'Invalid login credentials') {
                console.log('💡 TIP: This means the user does NOT exist to Supabase Auth, or password is wrong.');
            }
        } else {
            console.log('✅ Auth SUCCESS. User ID:', authData.session.user.id);
        }

    } catch (e) {
        console.error('❌ Unexpected Error:', e);
    }
}

testConnection();
