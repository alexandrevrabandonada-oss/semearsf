import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const REQUIRED_KEYS = ['INGEST_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

function parseEnvFile(filePath) {
  const env = {};
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function loadEnvFromProjectRoot() {
  const cwd = process.cwd();
  const envLocalPath = join(cwd, '.env.local');
  const envPath = join(cwd, '.env');

  if (existsSync(envLocalPath)) return parseEnvFile(envLocalPath);
  if (existsSync(envPath)) return parseEnvFile(envPath);

  throw new Error('Nenhum arquivo .env.local ou .env encontrado.');
}

function validateRequired(envVars) {
  const missing = REQUIRED_KEYS.filter((key) => !envVars[key]);
  if (missing.length > 0) {
    throw new Error(`Variaveis obrigatorias ausentes: ${missing.join(', ')}`);
  }
}

function setSecrets(envVars) {
  return new Promise((resolve, reject) => {
    const args = [
      'supabase',
      'secrets',
      'set',
      `INGEST_API_KEY=${envVars.INGEST_API_KEY}`,
      `SUPABASE_URL=${envVars.SUPABASE_URL}`,
      `SUPABASE_SERVICE_ROLE_KEY=${envVars.SUPABASE_SERVICE_ROLE_KEY}`,
    ];

    const child = spawn('npx', args, {
      stdio: 'ignore',
      shell: process.platform === 'win32',
    });

    child.on('error', () => {
      reject(new Error('Falha ao executar o comando do Supabase CLI.'));
    });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error('Supabase CLI retornou erro ao definir secrets.'));
    });
  });
}

async function main() {
  try {
    const envVars = loadEnvFromProjectRoot();
    validateRequired(envVars);
    await setSecrets(envVars);
    process.stdout.write('OK\n');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    process.stderr.write(`Erro: ${message}\n`);
    process.exit(1);
  }
}

await main();
