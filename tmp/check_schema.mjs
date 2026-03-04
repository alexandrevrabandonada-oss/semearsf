import { createClient } from "@supabase/supabase-js";
import fs from "fs";

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
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from("acervo_items").select("*").limit(1);
    if (error) console.error("Error:", error);
    else if (data && data.length > 0) console.log(Object.keys(data[0]));
    else console.log("No data");
}
check();
