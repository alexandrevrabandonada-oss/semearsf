import { execSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

const TIMEOUT_MS = 15000;
const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const VERSION_REGEX = /\b\d{14}\b/g;

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
      isTimeout: error.code === "ETIMEDOUT"
    };
  }
}

function checkPort(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function extractVersions(text) {
  const matches = text.match(VERSION_REGEX) ?? [];
  return Array.from(new Set(matches)).sort();
}

function getLocalMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs.readdirSync(MIGRATIONS_DIR).filter((file) => file.endsWith(".sql"));
}

function getLocalVersions(files) {
  return Array.from(
    new Set(
      files
        .map((file) => {
          const match = file.match(/^(\d{14})/);
          return match ? match[1] : null;
        })
        .filter((value) => value !== null)
    )
  ).sort();
}

console.log("=== SUPABASE MIGRATION DOCTOR (Hardened) ===");

const isRunning = await checkPort(54322);
if (isRunning) {
  console.log("[OK] DB Local: Rodando");
} else {
  console.log("[OK] DB Local: Not running (remote-first mode)");
}

const linkRes = run("npx supabase projects list");
const isLinked = linkRes.success && !linkRes.output.includes("You are not logged in") && linkRes.output.trim().length > 0;

if (isLinked) {
  console.log("[OK] CLI Link: Autenticado");
} else {
  console.log("[SKIP] CLI Link: Nao autenticado ou status desconhecido");
}

console.log("\n--- LOCAL STATE ---");
const localListRes = isRunning ? run("npx supabase migration list --local") : { success: false, skipped: true };

if (localListRes.success) {
  console.log("[OK] CLI local list: Sucesso");
} else if (localListRes.skipped) {
  console.log("[OK] CLI local list: Ignorado (DB Local offline)");
} else {
  console.log("[WARN] CLI local list: Falhou (Usando fallback de Filesystem)");
  if (localListRes.error) {
    process.stdout.write(`      Motivo: ${localListRes.error.split("\n").slice(0, 2).join(" ")}\n`);
  }
}

const localFiles = getLocalMigrationFiles();
if (localFiles.length > 0) {
  console.log(`[OK] Filesystem Scan: ${localFiles.length} arquivos encontrados`);

  const legacyFiles = localFiles.filter((file) => !/^\d{14}_/.test(file));
  if (legacyFiles.length > 0) {
    console.warn(`[WARN] Nomenclatura: ${legacyFiles.length} arquivos sem o prefixo de 14 digitos.`);
  }

  const sorted = [...localFiles].sort().reverse();
  console.log("      Ultimas 5 migracoes locais:");
  sorted.slice(0, 5).forEach((file) => console.log(`      - ${file}`));
} else {
  console.log("[ERROR] Filesystem Scan: Pasta supabase/migrations nao encontrada");
}

if (isLinked) {
  console.log("\n--- REMOTE STATE ---");
  const linkedListRes = run("npx supabase migration list --linked");
  if (linkedListRes.success) {
    console.log("[OK] CLI remote list: Sucesso");

    const remoteVersions = extractVersions(linkedListRes.output);
    const localVersions = getLocalVersions(localFiles);
    const localSet = new Set(localVersions);
    const missingLocal = remoteVersions.filter((version) => !localSet.has(version));

    console.log(`      Total remoto (versoes 14 digitos): ${remoteVersions.length}`);
    console.log(`      Total local (versoes 14 digitos): ${localVersions.length}`);

    if (missingLocal.length > 0) {
      console.log(`      Faltando localmente: ${missingLocal.length}`);
      missingLocal.forEach((version) => console.log(`      - ${version}`));
    } else {
      console.log("      [OK] Historico remoto/local alinhado (versoes 14 digitos).");
    }
  } else {
    console.log("[ERROR] CLI remote list: Falhou");
    if (linkedListRes.error) {
      process.stdout.write(`      Erro: ${linkedListRes.error.split("\n")[0]}\n`);
    }
  }
}

console.log("\nDoctor analysis completed.");
process.exit(0);