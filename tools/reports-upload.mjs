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
      const value = args[i + 1];
      params[key] = value;
      i += 1;
    }
  }
  return params;
}

function inferContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

function toThumbUrl(publicUrl) {
  try {
    const url = new URL(publicUrl);
    if (!url.pathname.includes("/storage/v1/object/public/")) return publicUrl;
    url.pathname = url.pathname.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
    url.searchParams.set("width", "300");
    url.searchParams.set("height", "158");
    url.searchParams.set("quality", "75");
    url.searchParams.set("resize", "cover");
    return url.toString();
  } catch {
    return publicUrl;
  }
}

const env = fs.existsSync(".env.local") ? parseEnvFile(".env.local") : parseEnvFile(".env");
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY nao encontrados.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const { slug, file, title, cover } = parseArgs();

if (!slug || !file) {
  console.error("USO: node tools/reports-upload.mjs --slug <slug> --file <caminho-do-pdf> [--title <titulo-opcional>] [--cover <caminho-da-imagem>]");
  process.exit(1);
}

async function upload() {
  try {
    if (!fs.existsSync(file)) {
      throw new Error(`Arquivo nao encontrado: ${file}`);
    }
    if (cover && !fs.existsSync(cover)) {
      throw new Error(`Capa nao encontrada: ${cover}`);
    }

    const fileName = path.basename(file);
    const storagePath = `${slug}/${Date.now()}-${fileName}`;
    const fileBuffer = fs.readFileSync(file);

    console.log(`Enviando ${fileName} para storage: ${storagePath}...`);

    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(storagePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: pub } = supabase.storage.from("reports").getPublicUrl(storagePath);
    const publicUrl = pub.publicUrl;

    const payload = {
      pdf_url: publicUrl,
      ...(title ? { title } : {})
    };

    if (cover) {
      const coverExt = path.extname(cover).toLowerCase() || ".png";
      const coverPath = `${slug}/cover-${Date.now()}${coverExt}`;
      const coverBuffer = fs.readFileSync(cover);
      console.log(`Enviando capa para storage: ${coverPath}...`);
      const { error: coverError } = await supabase.storage
        .from("reports")
        .upload(coverPath, coverBuffer, {
          contentType: inferContentType(cover),
          upsert: true
        });

      if (coverError) throw coverError;

      const { data: coverPub } = supabase.storage.from("reports").getPublicUrl(coverPath);
      payload.cover_url = coverPub.publicUrl;
      payload.cover_thumb_url = toThumbUrl(coverPub.publicUrl);
    }

    const { error: updateError } = await supabase
      .from("reports")
      .update(payload)
      .eq("slug", slug);

    if (updateError) throw updateError;

    console.log(`OK: report atualizado para slug=${slug}`);
    console.log(`URL: ${publicUrl}`);
    if (payload.cover_url) {
      console.log(`Cover: ${payload.cover_url}`);
      console.log(`Thumb: ${payload.cover_thumb_url}`);
    }
    if (title) {
      console.log(`Titulo atualizado: ${title}`);
    }
    process.exit(0);
  } catch (error) {
    console.error("FALHA:", error.message || error);
    process.exit(1);
  }
}

void upload();
