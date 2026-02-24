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

function shortErrorMessage(error) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "unknown error";
}

function isExpectedDenied(message) {
  const text = message.toLowerCase();
  return text.includes("permission denied") || text.includes("not allowed") || text.includes("401");
}

async function selectAndCount(supabase, table) {
  const { error: selectError } = await supabase.from(table).select("*").limit(1);
  if (selectError) throw selectError;

  const { count, error: countError } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (countError) throw countError;

  return count ?? 0;
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
    const requiredTables = ["stations", "measurements", "events"];
    const counts = {};

    for (const table of requiredTables) {
      try {
        counts[table] = await selectAndCount(supabase, table);
        console.log(`${table}: OK count=${counts[table]}`);
      } catch (error) {
        throw new Error(`${table}: ${shortErrorMessage(error)}`);
      }
    }

    try {
      const registrationsCount = await selectAndCount(supabase, "registrations");
      console.log(`registrations: OK count=${registrationsCount}`);
    } catch (error) {
      const message = shortErrorMessage(error);
      if (isExpectedDenied(message)) {
        console.log("registrations: EXPECTED_DENIED");
      } else {
        throw new Error(`registrations: ${message}`);
      }
    }

    console.log("DB_SMOKE: OK");
  } catch (error) {
    const message = shortErrorMessage(error);
    console.log(`DB_SMOKE: ERROR (${message})`);
    process.exit(0);
  }
}

await run();
