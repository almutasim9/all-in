const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function testSalesRep() {
    console.log('--- Testing Sales Rep Flow ---');

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

    // 1. Login as Sales Rep (Sarah)
    console.log('Logging in as Sarah (Sales Rep)...');
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'sarah@menuplus.io',
        password: 'sales123'
    });

    if (loginError) {
        console.error('❌ Login failed:', loginError.message);
        return;
    }
    console.log(`✅ Logged in as ${user.email} (${user.id})`);

    // 2. Fetch Clients (Should see all or assigned?)
    // RLS said: "Authenticated users can view clients" (All)
    const { data: clients, error: fetchError } = await supabase
        .from('clients')
        .select('id, name, assigned_to');

    if (fetchError) {
        console.error('❌ Failed to fetch clients:', fetchError.message);
    } else {
        console.log(`✅ Fetched ${clients.length} clients.`);
        const myClients = clients.filter(c => c.assigned_to === user.id);
        console.log(`   - Assigned to Sarah: ${myClients.map(c => c.name).join(', ')}`);
    }

    // 3. Try to Update a Client Assigned to Sarah
    // Find a client assigned to her
    // Sarah ID: d847b0b4-eaa0-452a-b13a-5d7aafb25a54 (from list-roles output)

    // Note: seed-data.js might not have assigned anything to her REAL ID if map was used.
    // Let's check if she has any clients.

    const sarahClient = clients.find(c => c.assigned_to === user.id);

    if (sarahClient) {
        console.log(`Attempting to update client ${sarahClient.name}...`);
        const { error: updateError } = await supabase
            .from('clients')
            .update({ notes: 'Updated by Sarah ' + new Date().toISOString() })
            .eq('id', sarahClient.id);

        if (updateError) console.error('❌ Update Failed:', updateError.message);
        else console.log('✅ Update Successful (Own Client).');
    } else {
        console.warn('⚠️ No clients assigned to Sarah to test update.');
    }

    // 4. Try to Update a Client NOT Assigned to Sarah (Should fail or pass?)
    // RLS: "Admins and Assigned Reps can update clients"
    // So Sarah should NOT be able to update Omar's client.

    const otherClient = clients.find(c => c.assigned_to && c.assigned_to !== user.id);
    if (otherClient) {
        console.log(`Attempting to update OTHER client ${otherClient.name}...`);
        const { error: illegalUpdateError } = await supabase
            .from('clients')
            .update({ notes: 'Hacked by Sarah' })
            .eq('id', otherClient.id);

        if (illegalUpdateError) console.error('✅ Blocked as expected:', illegalUpdateError.message); // This implies success of security
        else {
            // If no error, check if row was actually modified (RLS 'using' vs 'check')
            // Postgres RLS for UPDATE 'using' clause filters rows visible for update. 
            // If row is not visible for update, update returns success with 0 rows affected or error depending on config.
            // Supabase JS client usually returns count.
            console.warn('⚠️ Update apparently succeeded? Checking count...');
        }
    }

    // 5. Try to Create a Brand (Should Fail)
    console.log('Attempting to create a Brand (Should fail)...');
    const { error: brandError } = await supabase
        .from('brands')
        .insert({ name: 'Hacker Brand' });

    if (brandError) console.log('✅ Blocked as expected (Brand):', brandError.message);
    else console.error('❌ Sarah could create a brand! Security Issue.');
}

testSalesRep();
