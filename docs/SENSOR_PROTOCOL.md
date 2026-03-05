# 📡 SENSOR Protocol - Ingestão de Dados (HTTP)

Documentação técnica para integração de sensores IoT na rede SEMEAR.

---

## 📍 Endpoint

```
POST https://[FUNCTION_URL]/functions/v1/ingest-measurement
```

**Onde `[FUNCTION_URL]` é obtido via:**
- Dashboard Supabase → Functions → ingest-measurement → Details → Function URL
- Ou via `.env.local`: `FUNCTION_URL=https://ojedgswernwbzrcfomqq.supabase.co/functions/v1/ingest-measurement`

---

## 🔐 Autenticação

### Headers Obrigatórios

```http
Authorization: Bearer {INGEST_API_KEY}
Content-Type: application/json
```

**Exemplo:**
```bash
curl -X POST https://[FUNCTION_URL]/ingest-measurement \
  -H "Authorization: Bearer sk_ingest_abc123xyz..." \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Onde obter `INGEST_API_KEY`:**
- Variável de ambiente em `.env.local`
- Configurada pelo time DevOps no Vercel/production
- ⚠️ **NUNCA** commit na código! Usar apenas em firmware de sensor ou backend privado

---

## 📨 Payload JSON

### Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `station_code` | string | Identificador único do sensor | `"volta-redonda-001"` |
| `ts` | ISO 8601 | Timestamp do conjunto de dados (UTC) | `"2026-03-05T10:30:45.123Z"` |

### Campos Opcionais (Medições)

| Campo | Tipo | Descrição | Intervalo | Exemplo |
|-------|------|-----------|-----------|---------|
| `pm25` | float | Material particulado 2.5µm (µg/m³) | 0–500 | `12.4` |
| `pm10` | float | Material particulado 10µm (µg/m³) | 0–500 | `21.7` |
| `temp` | float | Temperatura do ar (°C) | -10–50 | `28.1` |
| `humidity` | float | Umidade relativa (%) | 0–100 | `63.2` |
| `quality_flag` | string | Status do sensor | `"ok"`, `"warning"`, `"error"` | `"ok"` |

### Campos Opcionais (Metadados de Dispositivo)

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `battery_v` | float | Voltagem da bateria (V) | `4.2` |
| `rssi` | int | Sinal WiFi (RSSI dBm) | `-65` |
| `firmware` | string | Versão do firmware | `"v1.2.3"` |
| `device_temp` | float | Temperatura interna do sensor (°C) | `32.5` |

---

## 📤 Payload Mínimo

```json
{
  "station_code": "volta-redonda-001",
  "ts": "2026-03-05T10:30:45.123Z"
}
```

---

## 📤 Payload Completo (Exemplo)

```json
{
  "station_code": "volta-redonda-001",
  "ts": "2026-03-05T10:30:45.123Z",
  "pm25": 12.4,
  "pm10": 21.7,
  "temp": 28.1,
  "humidity": 63.2,
  "quality_flag": "ok",
  "battery_v": 4.15,
  "rssi": -65,
  "firmware": "v1.2.3",
  "device_temp": 32.5
}
```

---

## ✅ Response - Sucesso (HTTP 200)

```json
{
  "ok": true,
  "inserted": true,
  "duplicated": false,
  "station_code": "volta-redonda-001"
}
```

### Interpretação

| Campo | Significado |
|-------|-------------|
| `inserted: true` | Novo registro criado em `measurements` |
| `inserted: false, duplicated: true` | Duplicate (retry) - mesmo `station_id + ts` já existe |
| `duplicated: false` | Update não ocorreu (unique constraint) |

---

## ❌ Responses de Erro

### 400 Bad Request

```json
{
  "ok": false,
  "error": "station_code_required"
}
```

**Possíveis erros:**
- `"station_code_required"` - station_code não fornecido ou vazio
- `"invalid_ts"` - ts não é ISO 8601 válido
- `"ts_too_far_in_future"` - ts > 10 minutos no futuro
- `"ts_too_old"` - ts > 7 dias no passado
- `"invalid_json"` - JSON não é parseável

### 401 Unauthorized

```json
{
  "ok": false,
  "error": "unauthorized"
}
```

- Authorization header ausente ou inválido
- INGEST_API_KEY incorreta

### 404 Not Found

```json
{
  "ok": false,
  "error": "station_not_found"
}
```

- `station_code` não existe na tabela `stations`
- **Ação:** Registrar sensor no dashboard UFF antes de ingestão

### 405 Method Not Allowed

```json
{
  "ok": false,
  "error": "method_not_allowed"
}
```

- Method não é POST

### 500 Internal Server Error

```json
{
  "ok": false,
  "error": "measurement_insert_failed"
}
```

- Erro ao inserir em `measurements` (além de duplicatas)
- Erro ao atualizar `stations`
- Erro ao logar em `ingest_logs`

---

## 🔄 Comportamento de Retry

### Idempotência (Única Índex)

Existe um **unique index** em `measurements(station_id, ts)`:

```sql
CREATE UNIQUE INDEX idx_measurements_station_ts
ON measurements(station_id, ts) WHERE deleted_at IS NULL;
```

### Cenário: Retry Automático

1. Cliente envia payload com `ts="2026-03-05T10:30:45.123Z"`
2. Servidor insere com sucesso → `inserted: true`
3. Network falha, cliente não recebe response
4. Cliente retenta com **mesmo payload**
5. Servidor detecta duplicate (unique constraint)
6. **Resposta:** `inserted: false, duplicated: true` (não duplica)
7. Cliente pode considerar como sucesso (idempotente)

### Backoff Recomendado

```javascript
const MAX_RETRIES = 3;
const BACKOFF_MS = [1000, 5000, 15000]; // 1s, 5s, 15s

for (let i = 0; i < MAX_RETRIES; i++) {
  const response = await sendMeasurement(payload);
  
  if (response.ok || response.duplicated) {
    console.log("✓ Sucesso ou retry detectado");
    break;
  }
  
  if (i < MAX_RETRIES - 1) {
    await sleep(BACKOFF_MS[i]);
  }
}
```

---

## 🕐 Regras de Timestamp

### Validação de Data/Hora

- **Formato:** ISO 8601 com `Z` (UTC)
  - ✅ `2026-03-05T10:30:45.123Z`
  - ❌ `2026-03-05T10:30:45` (sem Z)
  - ❌ `03/05/2026 10:30:45` (format inválido)

### Janela de Aceitação

- **Futuro:** até +10 minutos (compensar clock drift)
- **Passado:** até -7 dias (backlog aceito)
- **Fora:** resposta `400` com `ts_too_far_in_future` ou `ts_too_old`

### Recomendação

```javascript
new Date().toISOString()  // ✅ Sempre usar
// "2026-03-05T10:30:45.123Z"
```

---

## 📊 Monitoramento de Ingestão

### Tabela `ingest_logs`

Todos os eventos de ingestão são registrados:

```sql
SELECT 
  occurred_at,
  station_code,
  pm25, pm10,
  battery_v, rssi,
  firmware,
  inserted,
  duplicated,
  error_reason
FROM public.ingest_logs
ORDER BY occurred_at DESC
LIMIT 100;
```

### Status Report

```sql
-- Últimas 24h por station
SELECT 
  station_code,
  COUNT(*) as total,
  SUM(CASE WHEN inserted THEN 1 ELSE 0 END) as novos,
  SUM(CASE WHEN duplicated THEN 1 ELSE 0 END) as duplicados,
  SUM(CASE WHEN error_reason IS NOT NULL THEN 1 ELSE 0 END) as erros
FROM ingest_logs
WHERE occurred_at > now() - interval '24 hours'
GROUP BY station_code
ORDER BY total DESC;
```

---

## 🧪 Teste Local

### Via cURL

```bash
# 1. Verificar endpoint
FUNCTION_URL="https://ojedgswernwbzrcfomqq.supabase.co/functions/v1/ingest-measurement"
INGEST_KEY="sk_ingest_test_..."

# 2. Enviar medição
curl -X POST "$FUNCTION_URL" \
  -H "Authorization: Bearer $INGEST_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "station_code": "test-sensor-001",
    "ts": "'$(date -u +'%Y-%m-%dT%H:%M:%S.000Z')'",
    "pm25": 15.5,
    "pm10": 28.3,
    "temp": 25.0,
    "humidity": 65.0,
    "battery_v": 4.2,
    "rssi": -70,
    "firmware": "v1.0.0"
  }'

# Esperado:
# {"ok":true,"inserted":true,"duplicated":false,"station_code":"test-sensor-001"}
```

### Via Node.js

```bash
npm run simulate:sensor          # Insert novo
npm run simulate:sensor:retry    # Teste retry (duplicata)
```

---

## 🔧 Integração em Firmware Arduino/ESP8266

### Exemplo ESP8266 com WiFi

```cpp
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

const char* INGEST_URL = "your-function-url-here";
const char* API_KEY = "sk_ingest_...";
const char* SSID = "...";
const char* PASSWORD = "...";

void sendMeasurement(float pm25, float pm10, float temp, float humidity) {
  WiFiClientSecure client;
  client.setInsecure(); // Para dev; usar CA cert em prod
  
  if (!client.connect(INGEST_URL, 443)) {
    Serial.println("Connection failed");
    return;
  }
  
  // Build JSON
  StaticJsonDocument<512> doc;
  doc["station_code"] = "sensor-001";
  doc["ts"] = getISOTimestamp(); // Implementar NTP sync
  doc["pm25"] = pm25;
  doc["pm10"] = pm10;
  doc["temp"] = temp;
  doc["humidity"] = humidity;
  doc["battery_v"] = analogRead(A0) / 1023.0 * 5.0; // Exemplo
  doc["rssi"] = WiFi.RSSI();
  doc["firmware"] = "v1.0.0";
  
  // HTTP Request
  String payload;
  serializeJson(doc, payload);
  
  client.println("POST /functions/v1/ingest-measurement HTTP/1.1");
  client.println("Host: [HOST]");
  client.println("Content-Type: application/json");
  client.print("Content-Length: ");
  client.println(payload.length());
  client.print("Authorization: Bearer ");
  client.println(API_KEY);
  client.println();
  client.println(payload);
  
  // Read response
  while (client.connected()) {
    String line = client.readStringUntil('\n');
    if (line == "\r") {
      String response = client.readString();
      deserializeJson(doc, response);
      bool ok = doc["ok"];
      Serial.println(ok ? "✓ Ingestão OK" : "✗ Ingestão falhou");
      break;
    }
  }
  
  client.stop();
}
```

---

## 🚀 Deploy & Secrets

### Variáveis Necessárias (Vercel/Production)

```env
INGEST_API_KEY=sk_ingest_prod_...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_URL=https://....supabase.co
VAPID_PRIVATE_KEY=...
VAPID_PUBLIC_KEY=...
```

### Deploy Function

```bash
npm run fn:deploy  # Redeploy ingest-measurement
```

---

## 📚 Referências

- **Database Schema:** [docs/DB_WORKFLOW.md](./DB_WORKFLOW.md)
- **Full-Text Search:** [docs/ACERVO.md](./ACERVO.md#busca)
- **Push Notifications:** [docs/PUSH.md](./PUSH.md)
- **Deployment:** [docs/DEPLOY.md](./DEPLOY.md#ship-infra)

---

**Last Updated:** 2026-03-05  
**Protocol Version:** 1.0  
**Status:** Production Ready
