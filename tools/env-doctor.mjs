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

if (legacyKeys.length > 0) {
    console.warn(`[!] CONFLITO: ${legacyKeys.length} chaves herdadas detectadas.`);
    console.warn("    Este projeto usa Vite. Remova ou renomeie as seguintes chaves do seu .env.local:");
    legacyKeys.forEach(key => {
        const suggested = key.replace("NEXT_PUBLIC_", "VITE_");
        console.warn(`    - ${key} -> (sugerido: ${suggested})`);
    });
} else {
    console.log("[OK] Nenhuma variável NEXT_PUBLIC_* encontrada. Ambiente limpo para Vite.");
}

process.exit(0);
