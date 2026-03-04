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

    for (const collection of collections) {
        const { error } = await supabase
            .from("acervo_collections")
            .upsert(collection, { onConflict: "slug" });

        if (error) {
            console.error(`ERRO ao importar coleção ${collection.slug}:`, error.message);
        } else {
            console.log(`[OK] Coleção: ${collection.slug}`);
        }
    }
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

    for (const link of items) {
        const cid = collectionMap[link.collection_slug];
        const iid = itemMap[link.item_slug];

        if (!cid || !iid) {
            console.warn(`[SKIP] Vínculo falhou: collection ${link.collection_slug} ou item ${link.item_slug} não encontrados.`);
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
            console.error(`ERRO ao vincular ${link.item_slug} -> ${link.collection_slug}:`, error.message);
        } else {
            console.log(`[OK] Vínculo: ${link.item_slug} -> ${link.collection_slug}`);
        }
    }
}

async function main() {
    console.log("=== ACERVO COLLECTIONS IMPORTER ===");
    await importCollections();
    await importCollectionItems();
    console.log("Done.");
}

main().catch(console.error);
