import fs from "node:fs";
import path from "node:path";
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

function ensureFileExists(filePath, label) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo de seed ausente (${label}): ${filePath}`);
    }
}

const repoRoot = process.cwd();
const envLocalPath = path.resolve(repoRoot, ".env.local");
const envPath = path.resolve(repoRoot, ".env");
const env = fs.existsSync(envLocalPath) ? parseEnvFile(envLocalPath) : parseEnvFile(envPath);

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no ambiente.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCollections(collectionsFile) {
    ensureFileExists(collectionsFile, "collections");

    const collections = JSON.parse(fs.readFileSync(collectionsFile, "utf8"));
    console.log(`Importando ${collections.length} coleções...`);

    let insertedCount = 0;
    let errors = 0;

    for (const collection of collections) {
        const { error } = await supabase
            .from("acervo_collections")
            .upsert(collection, { onConflict: "slug" });

        if (error) {
            console.error(`[ERRO] coleção ${collection.slug}: ${error.message}`);
            errors++;
        } else {
            insertedCount++;
        }
    }

    console.log(`[OK] ${insertedCount} coleções processadas (insert/update).`);
    return errors;
}

async function importCollectionItems(itemsFile) {
    ensureFileExists(itemsFile, "collection_items");

    const items = JSON.parse(fs.readFileSync(itemsFile, "utf8"));
    console.log(`Vinculando ${items.length} itens a coleções...`);

    const [{ data: collections, error: collectionsError }, { data: acervoItems, error: acervoError }] = await Promise.all([
        supabase.from("acervo_collections").select("id, slug"),
        supabase.from("acervo_items").select("id, slug")
    ]);

    if (collectionsError) {
        throw new Error(`Falha ao carregar coleções: ${collectionsError.message}`);
    }
    if (acervoError) {
        throw new Error(`Falha ao carregar itens do acervo: ${acervoError.message}`);
    }

    const collectionMap = Object.fromEntries((collections || []).map((c) => [c.slug, c.id]));
    const itemMap = Object.fromEntries((acervoItems || []).map((i) => [i.slug, i.id]));

    let linkedCount = 0;
    let skippedCount = 0;
    let errors = 0;

    for (const link of items) {
        const cid = collectionMap[link.collection_slug];
        const iid = itemMap[link.item_slug];

        if (!cid || !iid) {
            skippedCount++;
            continue;
        }

        const { error } = await supabase
            .from("acervo_collection_items")
            .upsert({
                collection_id: cid,
                item_id: iid,
                position: link.position || 0
            });

        if (error) {
            console.error(`[ERRO] vínculo ${link.item_slug} -> ${link.collection_slug}: ${error.message}`);
            errors++;
        } else {
            linkedCount++;
        }
    }

    console.log(`[OK] ${linkedCount} itens vinculados. (${skippedCount} ignorados por ausência de referência).`);
    return errors;
}

async function main() {
    const collectionsFile = path.resolve(repoRoot, "data", "collections.seed.json");
    const itemsFile = path.resolve(repoRoot, "data", "collection_items.seed.json");

    ensureFileExists(collectionsFile, "collections");
    ensureFileExists(itemsFile, "collection_items");

    console.log("=== ACERVO COLLECTIONS IMPORTER ===");
    console.log(`repoRoot: ${repoRoot}`);

    const collectionsErrors = await importCollections(collectionsFile);
    const linksErrors = await importCollectionItems(itemsFile);

    const totalErrors = collectionsErrors + linksErrors;
    if (totalErrors > 0) {
        throw new Error(`Importação concluída com ${totalErrors} erro(s).`);
    }

    console.log("Done.");
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
