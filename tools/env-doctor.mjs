import fs from "node:fs";

function parseEnv(content) {
    const env = {};
    if (!content) return env;
    content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const idx = trimmed.indexOf("=");
        if (idx <= 0) return;
        const key = trimmed.slice(0, idx).trim();
        env[key] = true;
    });
    return env;
}

console.log("=== ENV DOCTOR (Vite-only Hardening) ===");

let allKeys = {};
[".env", ".env.local"].forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, "utf8");
        const env = parseEnv(content);
        allKeys = { ...allKeys, ...env };
    }
});

const legacyKeys = Object.keys(allKeys).filter(key => key.startsWith("NEXT_PUBLIC_"));
const viteKeys = Object.keys(allKeys).filter(key => key.startsWith("VITE_"));

if (legacyKeys.length > 0 && viteKeys.length > 0) {
    console.warn("[!] CONFLITO: Chaves herdadas e novas detectadas simultaneamente.");
    console.warn("    Este projeto usa Vite. Remova as chaves NEXT_PUBLIC_* imediatamente.");
    console.warn("    Rode: npm run env:clean");
    legacyKeys.forEach(key => console.warn(`    - ${key} (CONFLICT)`));
} else if (legacyKeys.length > 0) {
    console.warn(`[WARN] Uso de chaves herdadas detectado: ${legacyKeys.join(", ")}`);
    console.warn("    Vite usa prefixo VITE_*. Essas chaves podem não estar sendo carregadas corretamente.");
    console.warn("    Rode: npm run env:clean");
}

if (viteKeys.length > 0) {
    console.log("[OK] Chaves Vite detectadas:");
    viteKeys.forEach(key => console.log(`    - ${key}`));
}

if (legacyKeys.length === 0 && viteKeys.length === 0) {
    console.log("[?] Nenhuma variável de ambiente pública (VITE_/NEXT_) encontrada.");
} else if (legacyKeys.length === 0) {
    console.log("[OK] Ambiente limpo de chaves NEXT_PUBLIC_*.");
}

const hasProjectRef = allKeys["SUPABASE_PROJECT_REF"];
if (hasProjectRef) {
    console.log("[OK] SUPABASE_PROJECT_REF detectado. Remote-first habilitado.");
    console.log("    Use: npm run db:types:remote para atualizar tipos do Supabase.");
}

process.exit(0);
