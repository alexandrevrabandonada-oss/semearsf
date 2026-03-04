import fs from "node:fs";
import crypto from "node:crypto";
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

function generateDeterministicUuid(seedContent) {
    const hash = crypto.createHash("md5").update(seedContent).digest("hex");
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

async function run() {
    try {
        const env = fs.existsSync(".env.local") ? parseEnvFile(".env.local") : parseEnvFile(".env");
        const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
        const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !serviceRoleKey) {
            console.error("ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no ambiente.");
            process.exit(1);
        }

        const supabase = createClient(url, serviceRoleKey);

        // 1. Links
        const linksPath = "data/transparencia.links.json";
        let linkInserted = 0;
        let linkUpdated = 0;
        let linkErrors = 0;

        if (fs.existsSync(linksPath)) {
            const links = JSON.parse(fs.readFileSync(linksPath, "utf8"));
            console.log(`Importando ${links.length} links de transparência...`);
            const { data: existing, error: selectError } = await supabase.from("transparency_links").select("id");
            if (selectError) {
                console.error(`[ERRO CRÍTICO] Falha ao buscar links: ${selectError.message}`);
                process.exit(1);
            }
            const existingIds = new Set((existing ?? []).map(r => r.id));

            for (const link of links) {
                const id = generateDeterministicUuid(link.url);
                const isUpdate = existingIds.has(id);
                const { error } = await supabase.from("transparency_links").upsert({ ...link, id }, { onConflict: "id" });
                if (error) {
                    console.error(`[ERRO LINK] ${link.url}: ${error.message}`);
                    linkErrors++;
                } else {
                    if (isUpdate) linkUpdated++; else linkInserted++;
                }
            }
        }

        // 2. Expenses
        const expensesPath = "data/transparencia.expenses.json";
        let expInserted = 0;
        let expUpdated = 0;
        let expErrors = 0;

        if (fs.existsSync(expensesPath)) {
            const expenses = JSON.parse(fs.readFileSync(expensesPath, "utf8"));
            console.log(`Importando ${expenses.length} despesas...`);
            const { data: existing, error: selectError } = await supabase.from("expenses").select("id");
            if (selectError) {
                console.error(`[ERRO CRÍTICO] Falha ao buscar despesas: ${selectError.message}`);
                process.exit(1);
            }
            const existingIds = new Set((existing ?? []).map(r => r.id));

            for (const exp of expenses) {
                const seed = `${exp.occurred_on}|${exp.vendor}|${exp.amount_cents}|${exp.description}`;
                const id = generateDeterministicUuid(seed);
                const isUpdate = existingIds.has(id);
                const { error } = await supabase.from("expenses").upsert({ ...exp, id }, { onConflict: "id" });
                if (error) {
                    console.error(`[ERRO DESPESA] ${exp.vendor}: ${error.message}`);
                    expErrors++;
                } else {
                    if (isUpdate) expUpdated++; else expInserted++;
                }
            }
        }

        console.log("\n--- Resumo Final (Transparência) ---");
        console.log(`Links: ${linkInserted} inseridos, ${linkUpdated} atualizados, ${linkErrors} erros.`);
        console.log(`Despesas: ${expInserted} inseridas, ${expUpdated} atualizadas, ${expErrors} erros.`);
        console.log("------------------------------------\n");

        if (linkErrors > 0 || expErrors > 0) {
            process.exit(1);
        }
        process.exit(0);
    } catch (err) {
        console.error(`[EXCEÇÃO] Erro inesperado: ${err.message}`);
        process.exit(1);
    }
}

await run();
