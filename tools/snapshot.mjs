import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function sh(cmd) {
  try { return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim(); }
  catch (e) { return (e.stdout?.toString() || "") + (e.stderr?.toString() || ""); }
}

function listDir(p) {
  if (!fs.existsSync(p)) return [];
  const out = [];
  for (const item of fs.readdirSync(p)) {
    if (item.startsWith(".next") || item === "node_modules") continue;
    const full = path.join(p, item);
    const stat = fs.statSync(full);
    out.push(stat.isDirectory() ? `${item}/` : item);
  }
  return out.sort();
}

const report = [];
report.push(`# Project State Snapshot`);
report.push(`**Date:** ${new Date().toISOString()}`);
report.push(``);
report.push(`## Git`);
report.push("```");
report.push(sh("git status -sb"));
report.push("```");
report.push(``);
report.push(`## Package scripts`);
report.push("```json");
report.push(sh("node -e \"const p=require('./package.json'); console.log(JSON.stringify(p.scripts,null,2))\""));
report.push("```");
report.push(``);
report.push(`## App routes (src/app)`);
report.push("```");
report.push(listDir("src/app").join("\n"));
report.push("```");
report.push(``);
report.push(`## Tools`);
report.push("```");
report.push(listDir("tools").join("\n"));
report.push("```");
report.push(``);
report.push(`## Env keys present (names only)`);
const envPath = ".env.local";
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath,"utf8");
  const keys = raw.split(/\r?\n/).map(l=>l.trim()).filter(l=>l && !l.startsWith("#") && l.includes("=")).map(l=>l.split("=")[0].trim());
  report.push("```");
  report.push(keys.join("\n"));
  report.push("```");
} else {
  report.push("_No .env.local found_");
}

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/state.md", report.join("\n") + "\n", "utf8");
console.log("Wrote reports/state.md");
