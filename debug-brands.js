const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function debugBrands() {
    console.log('--- Debugging Brand Creation ---');

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

    // 1. Login
    console.log('Logging in...');
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'almutsim.abed@gmail.com',
        password: 'as123as##'
    });

    if (loginError) {
        console.error('❌ Login failed:', loginError.message);
        return;
    }
    console.log(`✅ Logged in as ${user.email} (${user.id})`);

    // 2. Check Profile Role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('❌ Failed to fetch profile:', profileError.message);
    } else {
        console.log(`ℹ️ Profile Role: ${profile.role}`);
        if (profile.role !== 'admin') {
            console.warn('⚠️ WARNING: User is NOT admin!');
        }
    }

    // 3. Try to Insert Brand
    const testBrand = {
        name: `Test Brand ${Date.now()}`,
        description: 'Debug brand'
    };

    console.log('Attempting to insert brand...');
    const { data: brand, error: insertError } = await supabase
        .from('brands')
        .insert(testBrand)
        .select();

    if (insertError) {
        console.error('❌ Insert Failed:', insertError);
        console.error('   (Likely RLS Policy missing or incorrect)');
    } else {
        console.log('✅ Insert Successful:', brand);

        // Clean up
        await supabase.from('brands').delete().eq('id', brand[0].id);
        console.log('Cleaned up test brand.');
    }
}

debugBrands();
