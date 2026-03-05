import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

if (fs.existsSync(".env.local")) {
    const env = fs.readFileSync(".env.local", "utf8");
    env.split("\n").forEach(line => {
        const [key, ...vals] = line.split("=");
        if (key && vals.length > 0) {
            process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
        }
    });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DATA_DIR = path.join(process.cwd(), "data", "demo");

async function safelyLoadJson(filename) {
    const p = path.join(DATA_DIR, filename);
    if (!fs.existsSync(p)) {
        console.warn(`⚠️ Skipped: File ${filename} not found.`);
        return null;
    }
    return JSON.parse(fs.readFileSync(p, "utf-8"));
}

async function run() {
    console.log(`\n🌱 Loading DEMO seeds into ${SUPABASE_URL}...\n`);

    // 1. Acervo
    const acervoData = await safelyLoadJson("acervo.demo.json");
    if (acervoData) {
        console.log(`📦 Inserting ${acervoData.length} Acervo artifacts...`);
        const { error } = await supabase.from("acervo_items").upsert(acervoData, { onConflict: "slug" });
        if (error) console.error("❌ Error Acervo:", error.message);
    }

    // 2. Blog
    const blogData = await safelyLoadJson("blog.demo.json");
    if (blogData) {
        console.log(`📝 Inserting ${blogData.length} Blog posts...`);
        const { error } = await supabase.from("blog_posts").upsert(blogData, { onConflict: "slug" });
        if (error) console.error("❌ Error Blog:", error.message);
    }

    // 3. Transparência
    const transData = await safelyLoadJson("transparencia.demo.json");
    if (transData) {
        if (transData.portal_links) {
            console.log(`🔗 Inserting ${transData.portal_links.length} portal links...`);
            const { error: e1 } = await supabase.from("transparency_links").upsert(transData.portal_links);
            if (e1) console.error("❌ Error Transparency Links:", e1.message);
        }
        if (transData.finances) {
            console.log(`💸 Inserting ${transData.finances.length} finance records...`);
            const { error: e2 } = await supabase.from("transparency_expenses").upsert(transData.finances);
            if (e2) console.error("❌ Error Transparency Finances:", e2.message);
        }
    }

    // 4. Collections
    const collData = await safelyLoadJson("collections.demo.json");
    if (collData) {
        console.log(`📚 Inserting ${collData.length} Dossiês Collections...`);
        // We separate relationships
        const withoutItems = collData.map(c => {
            const { items, ...rest } = c;
            return rest;
        });

        const { error: e1 } = await supabase.from("acervo_collections").upsert(withoutItems, { onConflict: "slug" });
        if (e1) {
            console.error("❌ Error Dossiês:", e1.message);
        } else {
            console.log("🔗 Binding Dossiê <-> Acervo relatonships...");
            let rels = [];
            for (const col of collData) {
                if (col.items && col.items.length > 0) {
                    // find collection uuid
                    const { data: colDb } = await supabase.from("acervo_collections").select("id").eq("slug", col.slug).single();
                    if (!colDb) continue;

                    for (let i = 0; i < col.items.length; i++) {
                        const itemSlug = col.items[i];
                        const { data: itemDb } = await supabase.from("acervo_items").select("id").eq("slug", itemSlug).single();
                        if (itemDb) {
                            rels.push({ collection_id: colDb.id, item_id: itemDb.id, position: i });
                        }
                    }
                }
            }

            if (rels.length > 0) {
                const { error: e2 } = await supabase.from("acervo_collection_items").upsert(rels, { onConflict: "collection_id,item_id" });
                if (e2) console.error("❌ Error Dossiê bindings:", e2.message);
            }
        }
    }

    console.log(`\n✅ DEMO OK`);
    process.exit(0);
}

run();
