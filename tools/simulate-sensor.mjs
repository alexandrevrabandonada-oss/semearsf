import fs from "node:fs";

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

async function run() {
  const env = fs.existsSync(".env.local") ? parseEnvFile(".env.local") : parseEnvFile(".env");
  const functionUrl = env.FUNCTION_URL;
  const ingestApiKey = env.INGEST_API_KEY;
  const stationCode = env.STATION_CODE || "station-test";

  if (!functionUrl || !ingestApiKey) {
    console.log("SIMULATE_SENSOR: missing FUNCTION_URL or INGEST_API_KEY in .env.local/.env");
    process.exit(1);
  }

  const payload = {
    station_code: stationCode,
    ts: new Date().toISOString(),
    pm25: 12.4,
    pm10: 21.7,
    temp: 28.1,
    humidity: 63.2,
    quality_flag: "ok"
  };

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ingestApiKey}`
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log(`SIMULATE_SENSOR: status=${response.status} body=${text}`);
}

run().catch((error) => {
  const message =
    error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "unknown error";
  console.error(`SIMULATE_SENSOR: error=${message}`);
  process.exit(1);
});
