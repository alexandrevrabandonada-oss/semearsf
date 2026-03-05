import { spawnSync } from "node:child_process";

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32"
  });

  return {
    command: [command, ...args].join(" "),
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function summarizeLines(text, maxLines = 8) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-maxLines);
}

const repair = runCommand("npx", ["supabase", "migration", "repair", "--status", "reverted", "20260305"]);
const repairOutput = `${repair.stdout}\n${repair.stderr}`;
const repairNotFound = /not found/i.test(repairOutput);
const repairOk = repair.status === 0;

if (repairOk) {
  console.log("[db:push:safe] repair: applied legacy history fix for 20260305");
} else if (repairNotFound) {
  console.log("[db:push:safe] repair: version 20260305 not found remotely, continuing");
} else {
  console.log("[db:push:safe] repair: non-blocking failure, continuing to db push");
  const repairLines = summarizeLines(repairOutput, 6);
  if (repairLines.length > 0) {
    console.log(repairLines.join("\n"));
  }
}

const push = runCommand("npx", ["supabase", "db", "push", "--include-all"]);
const pushOutput = `${push.stdout}\n${push.stderr}`;
const pushLines = summarizeLines(pushOutput, 12);

console.log("[db:push:safe] db push summary:");
if (pushLines.length > 0) {
  console.log(pushLines.join("\n"));
} else {
  console.log("No output captured.");
}

if (push.status !== 0) {
  console.error(`[db:push:safe] failed with exit code ${push.status}`);
  process.exit(push.status);
}

console.log("[db:push:safe] done");
