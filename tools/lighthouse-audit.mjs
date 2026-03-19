import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import lighthouse from "lighthouse";
import { chromium } from "playwright";

const ROUTES = ["/", "/dados", "/relatorios", "/transparencia", "/mapa"];
const BASE_URL = "http://127.0.0.1:4173";
const PREVIEW_PORT = 4173;
const DEBUG_PORT = 9222;

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function spawnLogged(command, args, options = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: false,
    ...options
  });
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Process exited with code ${code ?? "null"}${signal ? ` signal ${signal}` : ""}`));
    });
  });
}

async function waitForHttp(url, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) return;
    } catch {
      // retry
    }
    await delay(1000);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function routeFileName(route) {
  if (route === "/") return "home";
  return route.replaceAll("/", "_").replaceAll("?", "_").replaceAll("&", "_").replaceAll("=", "_").replace(/^_+/, "");
}

async function run() {
  const build = spawnLogged(npmCommand(), ["run", "build"]);
  await waitForExit(build);

  const preview = spawnLogged(npmCommand(), ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(PREVIEW_PORT)]);
  const cleanup = async () => {
    if (!preview.killed) {
      preview.kill("SIGTERM");
    }
  };

  process.on("SIGINT", () => {
    void cleanup().finally(() => process.exit(130));
  });
  process.on("SIGTERM", () => {
    void cleanup().finally(() => process.exit(143));
  });

  try {
    await waitForHttp(`${BASE_URL}/`);

    const outputDir = path.join(process.cwd(), "reports", "lighthouse", new Date().toISOString().replace(/[:.]/g, "-"));
    await fs.mkdir(outputDir, { recursive: true });

    const summary = [];
    const browser = await chromium.launch({
      headless: true,
      args: [`--remote-debugging-port=${DEBUG_PORT}`]
    });

    try {
      for (const route of ROUTES) {
        const url = `${BASE_URL}${route}`;
        const result = await lighthouse(url, {
          port: DEBUG_PORT,
          output: ["html", "json"],
          onlyCategories: ["performance", "accessibility", "best-practices", "pwa"],
          logLevel: "error"
        });

        const reportBase = routeFileName(route);
        const htmlPath = path.join(outputDir, `${reportBase}.html`);
        const jsonPath = path.join(outputDir, `${reportBase}.json`);
        const [htmlReport, jsonReport] = Array.isArray(result.report) ? result.report : [String(result.report), ""];
        await fs.writeFile(htmlPath, htmlReport, "utf8");
        await fs.writeFile(jsonPath, jsonReport || JSON.stringify(result.lhr, null, 2), "utf8");

        const categories = result.lhr.categories;
        summary.push({
          route,
          performance: Math.round((categories.performance?.score ?? 0) * 100),
          accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
          bestPractices: Math.round((categories["best-practices"]?.score ?? 0) * 100),
          pwa: Math.round((categories.pwa?.score ?? 0) * 100)
        });
      }
    } finally {
      await browser.close();
    }

    const lines = [
      "# Lighthouse Audit Summary",
      "",
      `Base URL: ${BASE_URL}`,
      `Generated: ${new Date().toISOString()}`,
      ""
    ];

    for (const item of summary) {
      lines.push(
        `- ${item.route}: Performance ${item.performance}, A11y ${item.accessibility}, Best Practices ${item.bestPractices}, PWA ${item.pwa}`
      );
    }

    await fs.writeFile(path.join(outputDir, "summary.md"), `${lines.join("\n")}\n`, "utf8");
    console.log(`Lighthouse reports written to ${outputDir}`);
  } finally {
    await cleanup();
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
