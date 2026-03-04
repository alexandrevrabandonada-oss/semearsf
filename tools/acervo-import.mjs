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
    const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        console.error("ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no ambiente.");
        process.exit(1);
    }

    const seedPath = "data/acervo.seed.json";
    if (!fs.existsSync(seedPath)) {
        console.error(`ERRO: Arquivo ${seedPath} não encontrado.`);
        process.exit(1);
    }

    const items = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    const supabase = createClient(url, serviceRoleKey);

    console.log(`Iniciando importação de ${items.length} itens...`);

    let countSuccess = 0;
    let countError = 0;

    for (const item of items) {
        // published_at is optional in seed, default to null if missing
        // table uses generated year, city has default, search_vec is generated
        const { error } = await supabase
            .from("acervo_items")
            .upsert(item, { onConflict: "slug" });

        if (error) {
            console.error(`[ERRO] Slug: ${item.slug} - ${error.message}`);
            countError++;
        } else {
            countSuccess++;
        }
    }

    console.log("-----------------------------------------");
    console.log(`Importação concluída.`);
    console.log(`Sucesso: ${countSuccess}`);
    console.log(`Erros:   ${countError}`);
    console.log("-----------------------------------------");

    if (countError > 0) process.exit(1);
    process.exit(0);
}

await run();
