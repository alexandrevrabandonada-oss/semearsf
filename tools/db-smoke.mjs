import fs from "node:fs";

import { createClient } from "@supabase/supabase-js";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

async function run() {
  const env = fs.existsSync(".env.local") ? parseEnvFile(".env.local") : parseEnvFile(".env");
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.log("DB_SMOKE: SKIP (missing env)");
    process.exit(0);
  }

  try {
    const supabase = createClient(url, anonKey);
    const tables = ["stations", "measurements", "events", "registrations"];
    const counts = [];

    for (const table of tables) {
      const { error: selectError } = await supabase.from(table).select("*").limit(1);
      if (selectError) throw new Error(`${table}: ${selectError.message}`);

      const { count, error: countError } = await supabase.from(table).select("*", { count: "exact", head: true });
      if (countError) throw new Error(`${table}: ${countError.message}`);

      counts.push(`${table}=${count ?? 0}`);
    }

    console.log(`DB_SMOKE: OK (${counts.join(", ")})`);
  } catch (error) {
    const message =
      error && typeof error === "object" && "message" in error && typeof error.message === "string"
        ? error.message
        : "unknown error";
    console.log(`DB_SMOKE: ERROR (${message})`);
    process.exit(0);
  }
}

await run();
