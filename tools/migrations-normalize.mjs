import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationsDir = path.join(root, "supabase", "migrations");
const archiveDir = path.join(root, "supabase", "_archive_migrations");

if (!fs.existsSync(migrationsDir)) {
  console.error(`[migrations-normalize] ERROR migrations directory not found: ${migrationsDir}`);
  process.exit(1);
}

if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

const files = fs.readdirSync(migrationsDir).filter((name) => name.endsWith(".sql"));

// A migration is valid when its filename starts with a 14-digit timestamp prefix.
const isValidTimestampedMigration = (name) => /^\d{14}/.test(name);
const invalid = files.filter((name) => !isValidTimestampedMigration(name));

if (invalid.length === 0) {
  console.log("[migrations-normalize] moved: 0");
  console.log("[migrations-normalize] already normalized");
  process.exit(0);
}

const moved = [];
for (const file of invalid) {
  const from = path.join(migrationsDir, file);
  let to = path.join(archiveDir, file);

  if (fs.existsSync(to)) {
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    to = path.join(archiveDir, `${stamp}__${file}`);
  }

  fs.renameSync(from, to);
  moved.push(path.basename(to));
}

console.log(`[migrations-normalize] moved: ${moved.length}`);
console.log("[migrations-normalize] files:");
moved.forEach((name) => console.log(`- ${name}`));
process.exit(0);