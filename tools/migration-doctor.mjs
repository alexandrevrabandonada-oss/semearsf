import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TIMEOUT_MS = 15000;

function run(cmd) {
    try {
        const stdout = execSync(cmd, {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
            timeout: TIMEOUT_MS
        });
        return { success: true, output: stdout };
    } catch (error) {
        const stderr = (error.stderr || "").toString();
        const stdout = (error.stdout || "").toString();
        return {
            success: false,
            output: stdout,
            error: stderr || error.message,
            isTimeout: error.code === 'ETIMEDOUT'
        };
    }
}

console.log("=== SUPABASE MIGRATION DOCTOR (Hardened) ===");

// 1. Check Status
const statusRes = run("npx supabase db status");
const statusOutput = statusRes.output;
const isRunning = statusOutput.includes("Manage Postgres databases") || statusOutput.includes("Local Version");
const isLinked = !statusOutput.includes("not linked") && !statusOutput.includes("not logged in") && !statusOutput.includes("failed to initialise logging role");

if (isRunning) {
    console.log("[OK] DB Local: Rodando");
} else {
    console.log("[OK] DB Local: Not running (remote-first mode)");
}

if (isLinked) {
    console.log("[OK] CLI Link: Autenticado");
} else {
    console.log("[SKIP] CLI Link: Não autenticado ou expirado");
}

// 2. Local Migrations (CLI + Fallback)
console.log("\n--- LOCAL STATE ---");
const localListRes = isRunning ? run("npx supabase migration list --local") : { success: false };

if (localListRes.success) {
    console.log("[OK] CLI local list: Sucesso");
} else {
    console.log("[WARN] CLI local list: Falhou (Usando fallback de Filesystem)");
    if (localListRes.error) {
        process.stdout.write("      Motivo: " + localListRes.error.split("\n").slice(0, 2).join(" ") + "\n");
    }
}

// Filesystem Scan
const migrationsDir = "supabase/migrations";
if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
    console.log(`[OK] Filesystem Scan: ${files.length} arquivos encontrados`);

    const legacyFiles = files.filter(f => !/^\d{14}_/.test(f));
    if (legacyFiles.length > 0) {
        console.warn(`[WARN] Nomenclatura: ${legacyFiles.length} arquivos sem o prefixo de 14 dígitos.`);
    }

    const sorted = files.sort().reverse();
    console.log("      Últimas 5 migrações locais:");
    sorted.slice(0, 5).forEach(f => console.log(`      - ${f}`));
} else {
    console.log("[ERROR] Filesystem Scan: Pasta supabase/migrations não encontrada");
}

// 3. Linked Migrations
if (isLinked) {
    console.log("\n--- REMOTE STATE ---");
    const linkedListRes = run("npx supabase migration list --linked");
    if (linkedListRes.success) {
        console.log("[OK] CLI remote list: Sucesso");
        const lines = linkedListRes.output.trim().split("\n");
        if (lines.length > 2) {
            console.log(`      Total: ${lines.length - 2} migrações no ambiente remoto.`);
        }
    } else {
        console.log("[ERROR] CLI remote list: Falhou");
        if (linkedListRes.error) {
            process.stdout.write("      Erro: " + linkedListRes.error.split("\n")[0] + "\n");
        }
    }
}

console.log("\nDoctor analysis completed.");
process.exit(0);
