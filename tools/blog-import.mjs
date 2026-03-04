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

    const seedPath = "data/blog.seed.json";
    if (!fs.existsSync(seedPath)) {
        console.error(`ERRO: Arquivo ${seedPath} não encontrado.`);
        process.exit(1);
    }

    const items = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    const supabase = createClient(url, serviceRoleKey);

    console.log(`Iniciando importação de ${items.length} posts do blog...`);

    // Fetch existing slugs to determine inserted vs updated
    const { data: existing, error: selectError } = await supabase.from("blog_posts").select("slug");
    if (selectError) {
        console.error(`[ERRO CRÍTICO] Falha ao buscar posts do blog: ${selectError.message}`);
        process.exit(1);
    }
    const existingSlugs = new Set((existing ?? []).map(row => row.slug));

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const item of items) {
        const isUpdate = existingSlugs.has(item.slug);

        const { error } = await supabase
            .from("blog_posts")
            .upsert(item, { onConflict: "slug" });

        if (error) {
            console.error(`[ERRO] ${item.slug}: ${error.message}`);
            errors++;
        } else {
            if (isUpdate) updated++;
            else inserted++;
        }
    }

    console.log("\n--- Resumo Final (Blog) ---");
    console.log(`Inseridos: ${inserted}`);
    console.log(`Atualizados: ${updated}`);
    console.log(`Erros: ${errors}`);
    console.log("---------------------------\n");

    if (errors > 0) {
        console.log("Saindo com ERRO.");
        process.exit(1);
    }
    console.log("Saindo com SUCESSO.");
    process.exit(0);
}

await run();
