import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i += 1) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      if (key === "lookup") {
        params.lookup = true;
        continue;
      }
      const value = args[i + 1];
      params[key] = value;
      i += 1;
    }
  }
  return params;
}

function detectContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

function parseAmountToCents(amountRaw) {
  const normalized = String(amountRaw).trim().replace(/\s+/g, "").replace("R$", "").replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    throw new Error(`Valor inválido em --amount: ${amountRaw}`);
  }
  return Math.round(value * 100);
}

const env = fs.existsSync(".env.local") ? parseEnvFile(".env.local") : parseEnvFile(".env");
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const args = parseArgs();
const expenseId = args["expense-id"];
const lookup = Boolean(args.lookup);
const file = args.file;

if (!file) {
  console.error("USO: node tools/transparency-upload.mjs --expense-id <uuid> --file <path>\n   OU: node tools/transparency-upload.mjs --lookup --date <YYYY-MM-DD> --vendor <nome> --amount <valor_reais> --file <path>");
  process.exit(1);
}

if (!expenseId && !lookup) {
  console.error("ERRO: informe --expense-id ou --lookup.");
  process.exit(1);
}

async function resolveExpenseByLookup() {
  const date = args.date;
  const vendor = args.vendor;
  const amount = args.amount;

  if (!date || !vendor || !amount) {
    throw new Error("Para --lookup, informe --date, --vendor e --amount.");
  }

  const amountCents = parseAmountToCents(amount);

  const { data, error } = await supabase
    .from("expenses")
    .select("id, occurred_on, vendor, amount_cents")
    .eq("occurred_on", date)
    .eq("amount_cents", amountCents)
    .ilike("vendor", `%${vendor}%`)
    .limit(5);

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("Nenhuma despesa encontrada com os critérios de lookup.");
  }
  if (data.length > 1) {
    const list = data.map((row) => `${row.id} | ${row.occurred_on} | ${row.vendor} | ${row.amount_cents}`).join("\n");
    throw new Error(`Lookup ambíguo (${data.length} resultados). Refine os critérios ou use --expense-id.\n${list}`);
  }

  return data[0].id;
}

async function run() {
  try {
    if (!fs.existsSync(file)) {
      throw new Error(`Arquivo não encontrado: ${file}`);
    }

    const targetExpenseId = expenseId || await resolveExpenseByLookup();
    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .select("id")
      .eq("id", targetExpenseId)
      .maybeSingle();

    if (expenseError) throw expenseError;
    if (!expense) throw new Error(`Despesa não encontrada: ${targetExpenseId}`);

    const fileName = path.basename(file);
    const storagePath = `${targetExpenseId}/${Date.now()}-${fileName}`;
    const fileBuffer = fs.readFileSync(file);

    const { error: uploadError } = await supabase.storage
      .from("transparency")
      .upload(storagePath, fileBuffer, {
        contentType: detectContentType(file),
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: pub } = supabase.storage.from("transparency").getPublicUrl(storagePath);
    const publicUrl = pub.publicUrl;

    const { error: updateError } = await supabase
      .from("expenses")
      .update({ document_url: publicUrl })
      .eq("id", targetExpenseId);

    if (updateError) throw updateError;

    console.log(`OK: expense_id=${targetExpenseId}`);
    console.log(`URL: ${publicUrl}`);
  } catch (error) {
    console.error("FALHA:", error.message || error);
    process.exit(1);
  }
}

void run();
