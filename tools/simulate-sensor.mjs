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

async function runRetryTest() {
  const env = fs.existsSync(".env.local") ? parseEnvFile(".env.local") : parseEnvFile(".env");
  const functionUrl = env.FUNCTION_URL;
  const ingestApiKey = env.INGEST_API_KEY;
  const stationCode = env.STATION_CODE || "station-test";

  if (!functionUrl || !ingestApiKey) {
    console.log("SIMULATE_SENSOR_RETRY: missing FUNCTION_URL or INGEST_API_KEY in .env.local/.env");
    process.exit(1);
  }

  // Use fixed timestamp to simulate retry scenario
  const fixedTs = new Date(Date.now() - 5000).toISOString(); // 5 seconds ago
  
  const payload = {
    station_code: stationCode,
    ts: fixedTs,
    pm25: 15.5,
    pm10: 28.3,
    temp: 25.0,
    humidity: 65.0,
    battery_v: 4.2,
    rssi: -70,
    firmware: "v1.0.0",
    device_temp: 32.5
  };

  console.log("\n📡 RETRY TEST: Sending first measurement (should insert)...");
  const response1 = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ingestApiKey}`
    },
    body: JSON.stringify(payload)
  });

  const text1 = await response1.text();
  const data1 = JSON.parse(text1);
  console.log(`  Status: ${response1.status}`);
  console.log(`  Response: ${JSON.stringify(data1, null, 2)}`);
  console.log(`  Result: ${data1.inserted ? "✓ INSERTED" : "✗ NOT INSERTED"}`);

  // Wait 1 second before retry
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log("\n📡 RETRY TEST: Sending same measurement again (should detect duplicate)...");
  const response2 = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ingestApiKey}`
    },
    body: JSON.stringify(payload)
  });

  const text2 = await response2.text();
  const data2 = JSON.parse(text2);
  console.log(`  Status: ${response2.status}`);
  console.log(`  Response: ${JSON.stringify(data2, null, 2)}`);
  console.log(`  Result: ${data2.duplicated ? "✓ DUPLICATE DETECTED" : "✗ NO DUPLICATE"}`);

  // Verify idempotence
  const success = data1.inserted && !data1.duplicated && !data2.inserted && data2.duplicated;
  console.log(`\n${success ? "✅" : "❌"} RETRY IDEMPOTENCE: ${success ? "PASSED" : "FAILED"}`);

  process.exit(success ? 0 : 1);
}

// Check if retry mode is enabled
const args = process.argv.slice(2);
if (args.includes("--retry")) {
  runRetryTest().catch((error) => {
    const message =
      error && typeof error === "object" && "message" in error && typeof error.message === "string"
        ? error.message
        : "unknown error";
    console.error(`SIMULATE_SENSOR_RETRY: error=${message}`);
    process.exit(1);
  });
} else {
  run().catch((error) => {
  const message =
    error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "unknown error";
  console.error(`SIMULATE_SENSOR: error=${message}`);
  process.exit(1);
  });
}
