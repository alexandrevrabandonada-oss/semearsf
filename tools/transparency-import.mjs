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

// Helper to generate an idempotent ID for expenses based on its content
function generateExpenseId(expense) {
    const raw = `${expense.occurred_on}|${expense.vendor}|${expense.amount_cents}|${expense.description}`;
    return crypto.createHash("md5").update(raw).digest("hex");
}

async function run() {
    const env = fs.existsSync(".env.local") ? parseEnvFile(".env.local") : parseEnvFile(".env");
    const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        console.error("ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no ambiente.");
        process.exit(1);
    }

    const supabase = createClient(url, serviceRoleKey);

    // 1. Import Links
    const linksPath = "data/transparencia.links.json";
    if (fs.existsSync(linksPath)) {
        const links = JSON.parse(fs.readFileSync(linksPath, "utf8"));
        console.log(`Importando ${links.length} links...`);
        let linkSuccess = 0;
        for (const link of links) {
            const { error } = await supabase.from("transparency_links").upsert(link, { onConflict: "url" });
            if (error) console.error(`[ERRO LINK] ${link.url}: ${error.message}`);
            else linkSuccess++;
        }
        console.log(`Links: ${linkSuccess} sucesso.`);
    }

    // 2. Import Expenses
    const expensesPath = "data/transparencia.expenses.json";
    if (fs.existsSync(expensesPath)) {
        const expenses = JSON.parse(fs.readFileSync(expensesPath, "utf8"));
        console.log(`Importando ${expenses.length} despesas...`);
        let expSuccess = 0;
        for (const exp of expenses) {
            // Add idempotent ID in meta if not present, or use id directly if we had a natural key
            // For now, we use the hash as the UUID if we want pure idempotency
            const id = generateExpenseId(exp);
            const { error } = await supabase.from("expenses").upsert({ ...exp, id }, { onConflict: "id" });
            if (error) console.error(`[ERRO DESPESA] ${exp.vendor}: ${error.message}`);
            else expSuccess++;
        }
        console.log(`Despesas: ${expSuccess} sucesso.`);
    }

    console.log("Importação de transparência concluída.");
    process.exit(0);
}

await run();
