import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const VERSION_REGEX = /\b\d{14}\b/g;

function run(cmd) {
  return execSync(cmd, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function extractVersions(text) {
  const matches = text.match(VERSION_REGEX) ?? [];
  return Array.from(new Set(matches)).sort();
}

function listLocalVersions() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
  }

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((name) => name.endsWith(".sql"));
  const versions = files
    .map((name) => {
      const match = name.match(/^(\d{14})/);
      return match ? match[1] : null;
    })
    .filter((value) => value !== null);

  return Array.from(new Set(versions)).sort();
}

function createStub(version) {
  const filename = `${version}__remote_stub.sql`;
  const filePath = path.join(MIGRATIONS_DIR, filename);

  if (fs.existsSync(filePath)) return filename;

  const content = [
    "-- Remote migration stub",
    `-- version: ${version}`,
    "-- This migration exists in the linked remote environment and was stubbed locally",
    "-- to align migration history in a repo-first workflow.",
    ""
  ].join("\n");

  fs.writeFileSync(filePath, content, "utf8");
  return filename;
}

function main() {
  let remoteOutput = "";
  try {
    remoteOutput = run("npx supabase migration list --linked");
  } catch (error) {
    const stderr = (error.stderr || "").toString().trim();
    const stdout = (error.stdout || "").toString().trim();
    const message = stderr || stdout || error.message;
    console.error(`[migration-sync] ERROR failed to read linked migrations: ${message}`);
    process.exit(1);
  }

  const remoteVersions = extractVersions(remoteOutput);
  const localVersions = listLocalVersions();
  const localSet = new Set(localVersions);

  const missing = remoteVersions.filter((version) => !localSet.has(version));

  console.log(`[migration-sync] remote versions: ${remoteVersions.length}`);
  console.log(`[migration-sync] local versions: ${localVersions.length}`);
  console.log(`[migration-sync] missing local versions: ${missing.length}`);

  if (missing.length === 0) {
    console.log("[migration-sync] already aligned");
    process.exit(0);
  }

  const created = missing.map((version) => createStub(version));

  console.log("[migration-sync] created stubs:");
  created.forEach((name) => console.log(`- ${name}`));
}

main();