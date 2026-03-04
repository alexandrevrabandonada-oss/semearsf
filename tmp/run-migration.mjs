import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const sql = fs.readFileSync('supabase/migrations/20260304_000009_dossies.sql', 'utf8');
    console.log("Running migration...");

    // We use postgres directly via REST if RPC is not available, 
    // but usually we have a helper or can use the management API.
    // Since we don't have exec_sql RPC by default in all projects, 
    // we might need to use the CLI if possible or just assume it exists if added previously.
    // If not, we'll try to use the CLI with a better environment.

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
        if (error.message.includes("method not found")) {
            console.warn("exec_sql RPC not found. Trying CLI again with explicit env...");
            return "CLI_RETRY";
        }
        console.error("SQL Error:", error);
        process.exit(1);
    }
    console.log("Migration successful:", data);
}

run().then(res => {
    if (res === "CLI_RETRY") process.exit(2);
    process.exit(0);
});
