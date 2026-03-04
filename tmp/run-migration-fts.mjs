import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

if (fs.existsSync(".env.local")) {
    const env = fs.readFileSync(".env.local", "utf8");
    env.split("\n").forEach(line => {
        const [key, ...vals] = line.split("=");
        if (key && vals.length > 0) {
            process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
        }
    });
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const sql = fs.readFileSync('supabase/migrations/20260304_000010_fts.sql', 'utf8');
    console.log("Running migration...");

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
