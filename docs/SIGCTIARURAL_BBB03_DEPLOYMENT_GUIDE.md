# SIGCTiArural — BBB-03 READY · Guía de Despliegue (Operativa)

Estado: **DISEÑO / GUÍA OPERATIVA** · Fecha: 2026-09-21 · Rama: `feature/ubtn-biological-telemetry`
Origen: `docs/SIGCTIARURAL_F1_FIRST_REAL_SENSOR.md` (contrato de ingesta V3) + `docs/SIGCTIARURAL_BBB_TELEMETRY_READINESS.md` (brechas F1–F7).
Regla: **NO IMPLEMENTAR.** Documento estrictamente operativo: guía paso a paso para llevar a BBB-03 de un Debian limpio a enviar lecturas reales al backend y verlas 📡 LIVE en la Dashboard. Nada de este documento crea o modifica código del repositorio.

Alcance: **Debian limpio → Python → DHT22 → script → POST → prueba → Dashboard LIVE.**
Fuera de alcance: MQTT, bridge, broker, `ubtn_bridge.py`, IA edge (BBB-02), Dataset V2, frontend.

---

## 0. Contexto (qué se va a lograr)

```text
BBB-03 (Debian + DHT22)
  │  Python script: lee DHT22 → construye payload V3
  ▼
POST /api/v3/telemetry/readings/        ← YA EXISTE (misión F1·F1.1)
  ▼  valida (VOs: Temperature -50..60, Humidity 0..100, SensorId no vacío)
RegistrarLecturaSensorCommand
  ▼
DjangoSensorReadingRepository → PostgreSQL
  ▼  EventBus LabSignal(sensor_reading) (no bloquea)
GET /api/v3/telemetry/history/  → source_mode:"live"
  ▼
Dashboard (Vite 5173) → 🟢 LIVE con temperature/humidity reales
```

**Todo el eslabón servidor ya existe y está probado** (F1 + F1.1: 60/60 tests, validaciones de hardening activas).
Este documento solo describe **cómo hacer el paso del nodo**: instalar, cablear, leer, enviar y verificar.

### Contrato de ingesta (fijo, no negociable)
| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| `sensor_id` | `string` | ✅ | No vacío, ≤ 50 chars, se normaliza con `strip()`; convención `BBB-*` |
| `temperature` | `number` | ✅ | °C; rango `[-50.0, 60.0]` |
| `humidity` | `number` | ✅ | % relativo; rango `[0.0, 100.0]` |
| `timestamp` | `string` ISO-8601 | ⬜ | Opcional; no en el futuro; si falta → `datetime.now()` |

**Advertencia de honestidad (crítica):** el payload del ejemplo heredado de `EDGE_SETUP.md`
(`{"nodo_id":"BBB-03","sensor_tipo":"temperatura","valor":24.5}`) **NO es compatible** con este contrato y produce
`400 invalid_payload`. El script de esta guía usa **siempre el payload V3 de 4 campos** `sensor_id`/`temperature`/`humidity`/`timestamp`.

---

## 1. Prerrequisitos de servidor (verificar antes de tocar la BBB)

El backend debe estar arriba y con el endpoint de ingesta activo. Verificar en la máquina que corre Docker:

```bash
# 1. Postgres sano + backend levantado
docker ps

# Nombre esperado: sigctiarural_postgres_db (healthy) y sigctiarural_backend (up)
# Si backend está Exited:
docker compose up -d backend

# 2. Endpoint de lectura responde:
curl -s http://localhost:8010/api/v3/telemetry/history/ | head -c 400
# Esperado: {"context":"telemetry","contract_version":"v1","source_mode":"simulated|live",...}

# 3. Endpoint de ingesta responde (no debe estar roto):
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8010/api/v3/telemetry/readings/ \
  -H "Content-Type: application/json" \
  -d '{"sensor_id":"BBB-03","temperature":24.5,"humidity":61.0}'
# Esperado: 400 (payload sin timestamp NO es inválido: timestamp es opcional)
# NOTA: con payload completo y válido responde 201. Un 500 aquí es un fallo de servidor, reportar.
```

**Anotar la IP/lan del host del backend** (ej. `192.168.1.50`) — la BBB-03 enviará el POST a ese host,
**no a `localhost`** desde el nodo.

---

## 2. Paso 1 — Debian limpio

> Para esta guía se asume un **BeagleBone Black Rev C (BBB-03) con Debian (Bookworm/Bullseye)** recién provisionado y
> con acceso por SSH. Los mismos comandos shell valen para cualquier Debian/x86 si se sustituye el pin del sensor.

```bash
# 2.1 Login y actualización
ssh debian@<ip-bbb03>
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git python3 python3-pip python3-venv

# 2.2 Configuración mínima
hostnamectl set-hostname bbb-03-sigcti
sudo timedatectl set-timezone America/Bogota      # ajustar a la zona del lab
sudo timedatectl set-ntp true                     # reloj correcto (clave para timestamps)

# 2.3 Ubicación del trabajo
mkdir -p /opt/sigcti
cd /opt/sigcti

# 2.4 Verificación
python3 --version            # >= 3.9 esperado
curl -sI http://<host-backend>:8010/api/v3/telemetry/history/ -o /dev/null -w "%{http_code}\n"
# 200 = red hacia el backend OK
```

---

## 3. Paso 2 — Instalación de Python (aislada)

```bash
cd /opt/sigcti
python3 -m venv venv        # entorno aislado (evita romper Python del sistema)
source venv/bin/activate
pip install --upgrade pip

# Librerías del sensor + cliente HTTP
pip install adafruit-circuitpython-dht board adafruit-blinka requests

# Verificación
python -c "import board, adafruit_dht, requests; print('librerías OK')"
```

> **Nota de compatibilidad (honestidad):** la librería clásica `Adafruit_DHT` (referenciada en `EDGE_SETUP.md`) está
> retirada y **no compila con Python 3.11+**. Esta guía usa `adafruit-circuitpython-dht` (capa Blinka) que sí funciona
> en Debian moderno sobre BeagleBone. Si el lab usa aún Bullseye + Python 3.9, puede mantenerse `Adafruit_DHT`; el
> contrato HTTP no cambia.

---

## 4. Paso 3 — Conexión física del DHT22

| Pin del sensor DHT22 | Pin en BBB-03 (Rev C) | Notas |
|---|---|---|
| `VCC` (pin 1, o 3.3 V) | `P8_03` / `P8_04` (3.3 V) | **Nunca 5 V**: puede dañar el sensor o la placa |
| `DATA` (pin 2) | `P8_11` (GPIO) | Con resistencia pull-up 4.7 kΩ entre DATA y VCC |
| `GND` (pin 4) | `P8_02` (GND) | Común de referencia |

Verificación eléctrica (sin script aún):

```bash
# Ver el estado de los pines (Debian BBB)
sudo apt install -y util-linux
cat /sys/class/gpio/export    # debería listar /sys/class/gpio (gpiochip presente)
ls /sys/class/lego-sensor/ 2>/dev/null || echo "sin cape de robot — normal para DHT22 directo"
```

> El DHT22 (AM2302) con Blinka se lee por el pin del sensor (`board.P8_11`). Confirmar que `P8_11` está habilitado en
> la configuración del device tree; si el overlay no está activo, `adafruit-blinka` lo reclamará al primer acceso y
> hay que habilitarlo (ver §9 solución de problemas).

---

## 5. Paso 4 — Script de lectura y envío (BBB-03 LOCAL, no se escribe en el repo)

> Este script vive **en el nodo** (`/opt/sigcti/sensor_bbb03.py`). NO se modifica nada de `src/embedded/`
> del repositorio en esta misión (regla de gobernanza: script real de BBB-03 se implementa en fase futura).

```python
#!/usr/bin/env python3
"""BBB-03 · DHT22 → POST /api/v3/telemetry/readings/  (contrato V3 F1)

Lee temperatura/humedad del DHT22 en P8_11 y las envía al backend SIGCTiArural.
Payload SIEMPRE V3: {sensor_id, temperature, humidity, timestamp}.
"""
import json
import time
from datetime import datetime, timezone

import adafruit_dht
import board
import requests

SENSOR_ID = "BBB-03"
BACKEND_URL = "http://<host-backend>:8010/api/v3/telemetry/readings/"  # ← IP LAN del host Docker
INTERVALO = 10  # segundos entre lecturas

sensor = adafruit_dht.DHT22(board.P8_11)


def leer_sensor():
    """Reintenta hasta 15 veces antes de fallar (DHT22 es propenso a glitches de lectura)."""
    for _ in range(15):
        try:
            return sensor.temperature, sensor.humidity
        except RuntimeError as e:
            time.sleep(2)
    raise RuntimeError("DHT22 no respondió tras 15 intentos")


def enviar(temp, hum):
    payload = {
        "sensor_id": SENSOR_ID,
        "temperature": round(temp, 2),
        "humidity": round(hum, 2),
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }
    resp = requests.post(BACKEND_URL, json=payload, timeout=10)
    resp.raise_for_status()
    return payload, resp.json()


def main():
    while True:
        try:
            temp, hum = leer_sensor()
            if not (-50.0 <= temp <= 60.0 and 0.0 <= hum <= 100.0):
                print(f"[{SENSOR_ID}] fuera de rango: {temp}°C {hum}% — ignorado")
                time.sleep(INTERVALO)
                continue
            payload, resp = enviar(temp, hum)
            print(f"[{SENSOR_ID}] OK {payload['timestamp']} · {temp}°C {hum}% → "
                  f"reading_id={resp['item']['reading_id']} source_mode={resp['item'].get('source_mode', 'live')}")
        except requests.exceptions.HTTPError as e:
            print(f"[{SENSOR_ID}] HTTP {e.response.status_code}: {e.response.text[:200]}")
        except Exception as e:
            print(f"[{SENSOR_ID}] ERROR: {e}")
        time.sleep(INTERVALO)


if __name__ == "__main__":
    main()
```

Reemplazar `<host-backend>` por la IP LAN real del host Docker (la misma usada en §1). Guardar y ejecutar una vez:

```bash
cd /opt/sigcti && source venv/bin/activate
python sensor_bbb03.py
# Esperado (repitiendo cada 10 s):
# [BBB-03] OK 2026-09-21T12:00:05Z · 24.6°C 58.2% → reading_id=42 source_mode=live
```

---

## 6. Paso 5 — Prueba (verificación del dato que realmente llega)

Dejar el script corriendo (Ctrl+Z + `bg`, o en otra terminal) y desde la máquina Docker verificar:

```bash
# Lectura persistida con source_mode LIVE:
curl -s http://localhost:8010/api/v3/telemetry/history/?tipo=AGRICULTURA | python3 -m json.tool
# Esperado: {..., "source_mode": "live", "items": [{..., "sensor_id": "BBB-03",
#            "temperature": 24.6, "humidity": 58.2, ...}]}

# Contrarrestar con una falsificación (debe ser rechazada = hardening F1.1):
curl -s -X POST http://localhost:8010/api/v3/telemetry/readings/ \
  -H "Content-Type: application/json" \
  -d '{"sensor_id":"falta","temperature":120,"humidity":200}'
# Esperado: 400 {"context":"telemetry",...,"source_mode":"fallback","error":{"code":"invalid_payload",...}}

# Y el payload heredado NO-compatible (EDGE_SETUP legacy) también 400:
curl -s -X POST http://localhost:8010/api/v3/telemetry/readings/ \
  -H "Content-Type: application/json" \
  -d '{"nodo_id":"BBB-03","sensor_tipo":"temperatura","valor":24.5}'
# Esperado: 400 invalid_payload (campo sensor_id ausente)
```

---

## 7. Paso 6 — Dashboard 📡 LIVE

1. Abrir el frontend en la máquina Docker: `http://localhost:5173` (Vite dev) o el contenedor `frontend` si está arriba.
2. Navegar a la vista **Telemetría / Dashboard**.
3. Con el script de BBB-03 enviando lecturas:
   - Indicador de flujo: debe pasar de `⚪ SIM` (o `REF`) a **🟢 LIVE** (el conector `fetchTelemetryEnvelope()` obtiene
     `source_mode:"live"` de `GET /api/v3/telemetry/history/` — ver `Dashboard.jsx:64-87`).
   - `TelemetryPanel`: Temp. Aire y Humedad con valores **no sintéticos** (≈ 24–28 °C / 50–80 % si es interior).
   - `TelemetryChart`: series dibujadas con lecturas reales (crecen cada `INTERVALO`).
   - Contador "Lecturas (flujo)" ≠ 0; el nodo **BBB-03** deja de verse offline.

> Si la Dashboard marca `SIM`/`REF` aunque el script envíe 201: el backend que sirve 8010 y el proxy de Vite
> (`/api` → 8010) deben apuntar al **mismo** servicio que persistió la lectura. Revisar §9.3.

---

## 8. Paso 7 — Operar como servicio (opcional pero recomendado)

Para que BBB-03 envíe de forma continua e independiente del SSH:

```bash
# Crear unidad systemd
sudo tee /etc/systemd/system/bbb03-sensor.service >/dev/null <<'EOF'
[Unit]
Description=SIGCTiArural BBB-03 sensor → telemetry V3
After=network-online.target
Wants=network-online.target

[Service]
WorkingDirectory=/opt/sigcti
ExecStart=/opt/sigcti/venv/bin/python /opt/sigcti/sensor_bbb03.py
Restart=always
RestartSec=10
User=debian
# Hardening básico del servicio
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now bbb03-sensor
sudo systemctl status bbb03-sensor      # active (running)
journalctl -u bbb03-sensor -f           # seguir lecturas en vivo
```

---

## 9. Solución de problemas

| Síntoma | Causa probable | Acción |
|---|---|---|
| `RuntimeError: Error accessing P8_11` | Overlay del pin no habilitado / permisos GPIO | Activar overlay del cape en `uEnv.txt` o `config-pin P8_11 gpio`; `sudo` si apatridaude `gpiod` |
| `DHT22: timed out` persistente | Cableado (pull-up 4.7 kΩ faltante) o VCC a 5 V | Revisar §4; restablecer sensor (ciclo de alimentación) |
| POST → `400 invalid_payload` | Payload no-V3 (ej. `nodo_id/sensor_tipo/valor`) o valores fuera de rango | Usar el payload exacto de §5; valores dentro de `[-50,60]` / `[0,100]` |
| POST → `500 storage_error` | Backend sin BD o migraciones | Verificar `docker ps` (postgres healthy) y `manage.py migrate` no pendiente |
| `201` pero Dashboard `SIM/REF` | Descuadre de backend entre 8010 (ingesta) y el proxy del frontend | Verificar que el proxy `/api` → `8010` (no 8081) y que la lectura persistió en el mismo PG |
| Reloj del nodo desfasado | NTP apagado | `sudo timedatectl set-ntp true`; timestamps futuros son `400` (dominio) |
| `Adafruit_DHT` no instala (Python 3.11+) | Librería retirada | Usar `adafruit-circuitpython-dht` de esta guía (contrato HTTP idéntico) |

---

## 10. Checklist de validación operativa

- [ ] Backend `up` + endpoint V3 responde (200 GET history / 400 o 201 en POST)
- [ ] BBB-03: Debian actualizado, Python ≥ 3.9, venv creado
- [ ] DHT22 cableado según §4 (pull-up 4.7 kΩ, sin 5 V en VCC)
- [ ] Script local lee y publica: `[BBB-03] OK ... reading_id=N source_mode=live`
- [ ] `GET /api/v3/telemetry/history/` → `source_mode:"live"` con `sensor_id="BBB-03"`
- [ ] Dashboard 5173: indicador 🟢 LIVE, valores reales, contador > 0
- [ ] Falsificación y payload legacy → 400 (hardening F1.1 intacto)
- [ ] Servicio systemd `active (running)` con `Restart=always`
- [ ] Sin cambios en el repositorio (solo archivo local en el nodo)

---

## 11. Referencias
- Contrato de ingesta y endpoint: `docs/SIGCTIARURAL_F1_FIRST_REAL_SENSOR.md` (§1, §6, §9).
- Brechas de la cadena (F1–F7) y decisiones: `docs/SIGCTIARURAL_BBB_TELEMETRY_READINESS.md` (§2, §3, §4).
- Hardware: `docs/EDGE_SETUP.md` (roles BBB, wiring DHT22 P8_11), `docs/UBTN_BBB_EDGE_GATEWAY.md`.
- Backend (no tocar en esta misión): `src/backend/api/views.py` (`TelemetryIngestV3View`), `api/urls.py`, `contexts/telemetry/**`.
- Frontend (no tocar): `src/frontend/src/pages/Dashboard.jsx` (fetch V3 + badge LIVE).
- Honor / gobernanza: `AGENTS.md` (NADA DESAPARECE · honestidad de estado; sin commits sin orden).

*Guía operativa de fase — sin implementación en esta rama. El script real de `src/embedded/bbb_03_sensors/` y el
despliegue definitivo se materializan solo si Bernardo lo ordena como misión nueva.*