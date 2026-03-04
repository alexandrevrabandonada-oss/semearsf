import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// Manual env parsing since dotenv is missing
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
    console.error("ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCollections() {
    const collectionsFile = path.resolve("data/collections.seed.json");
    if (!fs.existsSync(collectionsFile)) {
        console.log("SKIP: Arquivo collections.seed.json não encontrado.");
        return;
    }

    const collections = JSON.parse(fs.readFileSync(collectionsFile, "utf8"));
    console.log(`Importando ${collections.length} coleções...`);

    let insertedCount = 0;
    for (const collection of collections) {
        const { error } = await supabase
            .from("acervo_collections")
            .upsert(collection, { onConflict: "slug" });

        if (error) {
            console.error(`ERRO ao importar coleção ${collection.slug} - Verifique permissões ou schema.`);
        } else {
            insertedCount++;
        }
    }
    console.log(`[OK] ${insertedCount} coleções processadas (inserted/updated).`);
}

async function importCollectionItems() {
    const itemsFile = path.resolve("data/collection_items.seed.json");
    if (!fs.existsSync(itemsFile)) {
        console.log("SKIP: Arquivo collection_items.seed.json não encontrado.");
        return;
    }

    const items = JSON.parse(fs.readFileSync(itemsFile, "utf8"));
    console.log(`Vinculando ${items.length} itens a coleções...`);

    // We need to resolve slugs to IDs
    const { data: collections } = await supabase.from("acervo_collections").select("id, slug");
    const { data: acervoItems } = await supabase.from("acervo_items").select("id, slug");

    if (!collections || !acervoItems) {
        console.error("ERRO: Falha ao carregar metadados para vínculo.");
        return;
    }

    const collectionMap = Object.fromEntries(collections.map(c => [c.slug, c.id]));
    const itemMap = Object.fromEntries(acervoItems.map(i => [i.slug, i.id]));

    let linkedCount = 0;
    let skippedCount = 0;

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
            console.error(`ERRO ao vincular ${link.item_slug} -> ${link.collection_slug} - Falha no BD.`);
        } else {
            linkedCount++;
        }
    }

    console.log(`[OK] ${linkedCount} itens vinculados. (${skippedCount} ignorados por ausência do Acervo).`);
}

async function main() {
    console.log("=== ACERVO COLLECTIONS IMPORTER ===");
    await importCollections();
    await importCollectionItems();
    console.log("Done.");
}

main().catch(console.error);
