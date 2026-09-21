# SIGCTiArural — BBB-03 · EXECUTION PLAYBOOK (Primer Sensor Físico Real)

Estado: **OPERATIVO / PLAYBOOK EJECUTABLE (listo para Bernardo)** · Fecha: 2026-09-21 · Rama: `feature/ubtn-biological-telemetry`
Origen: `docs/SIGCTIARURAL_BBB03_DEPLOYMENT_GUIDE.md` (guía) → playbook ejecutable · Contrato: `docs/SIGCTIARURAL_F1_FIRST_REAL_SENSOR.md` §1/§6.
Estado anterior: **DISEÑO / PLAYBOOK OPERATIVO EJECUTABLE** — actualizado 2026-09-21 (STATE SYNCHRONIZATION): el lado servidor (F1) quedó **commiteado en `941a55d`** y verificado 60/60; el playbook despliega solo el nodo.
Regla: **NO IMPLEMENTAR en el repositorio.** Este documento NO toca código del repositorio: entrega comandos y scripts que **Bernardo ejecuta sobre la BeagleBone Black Rev C** (archivos locales del nodo; `src/embedded/**`, backend y frontend permanecen intactos).
Alcance: **Debian limpio → Python → DHT22 → script → POST → prueba → Dashboard 🟢 LIVE.** Sin MQTT/BBB-01/BBB-02/V2/IA.

---

## 0. Flujo que este playbook valida (cadena completa YA implementada)

```text
BBB-03 (Debian + DHT22)  ──POST──▶ TelemetryIngestV3View ──▶ RegistrarLecturaSensorCommand
        │                          (api/views.py, F1·F1.1)        (contexts/telemetry)
        │                                                          │ save
        ▼                                                                  ▼
   {sensor_id, temperature, humidity, timestamp}          DjangoSensorReadingRepository → PostgreSQL
                                                                    │ + LabSignal (no bloquea)
   Dashboard 5173 ◀──GET── /api/v3/telemetry/history/?tipo=AGRICULTURA◀─┘ source_mode:"live"
```

Todo el lado servidor **ya existe, está probado (60/60) y opera en 8010**. Este playbook despliega **solo el nodo**:
lectura DHT22 → HTTP POST con el contrato V3 exacto.

**Contrato de ingesta (fijo):** `POST /api/v3/telemetry/readings/` · `Content-Type: application/json`
```json
{ "sensor_id": "BBB-03", "temperature": 24.5, "humidity": 78.1, "timestamp": "2026-09-21T06:00:00Z" }
```
Éxito → `201` + `{source_mode:"live", item:{reading_id,...}}` · Error de contrato → `400` + `{source_mode:"fallback", error:{code:"invalid_payload",...}}`.

---

## 1. Variables del despliegue (completar UNA vez)

| Variable | Valor | Dónde se usa |
|---|---|---|
| `BACKEND_HOST` | IP LAN del host Docker (ej. `192.168.1.50`) | En `sensor_post.py` / `sensor_bbb03.py` (`BACKEND_URL`) |
| `BBB_HOSTNAME` | `bbb-03-sigcti` | Paso 1 (hostname) |
| `BBB_ZONE` | `America/Bogota` (zona real del lab) | Paso 1 (reloj) |
| `POST_INTERVALO` | `10` (segundos) | Script (constante `INTERVALO`) |

> `timestamp` lo genera el **nodo** (UTC ISO-8601 + `Z`) para que el servidor nunca lo rechace por futuro/naive (hardening F1.1).

---

## 2. Paso 0 — Verificar el lado servidor (host Docker, una vez)

```bash
# Contenedores clave:
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "sigctiarural_(postgres|backend)"
#   → sigctiarural_postgres_db Up (healthy)   si no: docker compose up -d db
#   → sigctiarural_backend Up                 si no: docker compose up -d backend

# Endpoints:
curl -s http://localhost:8010/api/v3/telemetry/history/ | head -c 200 ; echo
curl -s -X POST http://localhost:8010/api/v3/telemetry/readings/ \
  -H "Content-Type: application/json" \
  -d '{"sensor_id":"BBB-03","temperature":24.5,"humidity":78.1}' -o /dev/null -w "POST sin timestamp → %{http_code}\n"
#   → history: {"context":"telemetry","contract_version":"v1","source_mode":"...",...}
#   → POST    → 201 (timestamp opcional). Un 500 aquí = problema de servidor, NO seguir.
```

**Anotar `BACKEND_HOST`** = IP LAN del host Docker (no `localhost`: el nodo es otra máquina).

---

## 3. Paso 1 — Debian limpio: hostname · red · reloj

> Ejecutar **en la BBB-03** (login `debian@<ip-bbb03>`). Con `sudo`.

```bash
# 3.1 Hostname recomendado:
sudo hostnamectl set-hostname bbb-03-sigcti
echo "127.0.1.1 bbb-03-sigcti" | sudo tee -a /etc/hosts

# 3.2 Red: DHCP por defecto (recomendado: IP fija por MAC en el router).
ip addr show eth0 | grep "inet "           # anotar IP actual
#    (Opcional) IPv4 estática — ajustar a la red real:
sudo tee /etc/network/interfaces.d/eth0 <<'EOF'
auto eth0
iface eth0 inet static
    address 192.168.1.180      # elegir libre en tu LAN
    netmask 255.255.255.0
    gateway 192.168.1.1
    dns-nameservers 192.168.1.1 8.8.8.8
EOF
sudo systemctl restart networking

# 3.3 Reloj (crítico: timestamps futuros → 400 en dominio):
sudo timedatectl set-timezone America/Bogota     # = BBB_ZONE
sudo timedatectl set-ntp true
timedatectl                                      # "System clock synchronized: yes"

# 3.4 Actualización del sistema:
sudo apt update && sudo apt upgrade -y
```

**Salida esperada de este paso:** `timedatectl` sincronizado + `apt upgrade` sin errores.

---

## 4. Paso 2 — Instalación de Python (aislada)

```bash
sudo apt install -y python3 python3-pip python3-venv python3-libgpiod git curl
mkdir -p /opt/sigcti && cd /opt/sigcti
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
python --version          # ≥ 3.9
```

---

## 5. Paso 3 — DHT22: cableado, pin y firmware

**Cableado (BeagleBone Black Rev C → DHT22/AM2302):**

| DHT22 | Pin BBB-03 Rev C | Nota |
|---|---|---|
| VCC (pin 1) | `P8_03` **o** `P8_04` (3.3 V) | ⚠️ **NUNCA 5 V** (daña sensor/placa) |
| DATA (pin 2) | `P8_11` (GPIO) | **Pull-up 4.7 kΩ → VCC** |
| NC (pin 3) | — | sin conectar |
| GND (pin 4) | `P8_02` (GND) | común |

**Habilitar el pin como GPIO:**
```bash
sudo /opt/scripts/tools/config-pin P8_11 gpio_pu          # intento 1 (overlays explícito)
sudo /opt/scripts/tools/config-pin -l P8_11               # debe listar modos
ls /dev/gpiochip*                                          # libgpiod disponible
```

> **Honestidad técnica:** en Debian Bookworm + Blinka, `adafruit-circuitpython-dht` accede `P8_11` vía `libgpiod`
> (timing en µs). Si el pin rechaza acceso, activar el overlay (`config-pin P8_11 gpio`) y revisar permisos de
> `/dev/gpiochip*`. El DHT22 es sensible: si `timed out`, revisar pull-up y cables (ver §13).

---

## 6. Paso 4 — Dependencias exactas

```bash
# requirements_bbb03.txt  (en /opt/sigcti)  — lecturas DHT22 + HTTP backend V3
cat > /opt/sigcti/requirements_bbb03.txt <<'EOF'
adafruit-circuitpython-dht==3.6.0
adafruit-blinka==8.42.0
board==1.0
requests==2.32.3
EOF

cd /opt/sigcti && source venv/bin/activate
pip install -r requirements_bbb03.txt
python -c "import board, adafruit_dht, requests; print('deps OK')"
```

> `Adafruit_DHT` clásica (de `EDGE_SETUP.md`) **NO se instala**: está retirada y no compila en Python 3.11+. El contrato
> HTTP es idéntico; solo cambia la librería de acceso al sensor.

---

## 7. Paso 5 — Script de LECTURA · `/opt/sigcti/sensor_lectura.py`

```python
#!/usr/bin/env python3
"""BBB-03 · lectura DHT22 (P8_11). Devuelve (temperature, humidity) saneadas."""
import time
import adafruit_dht
import board

PIN = board.P8_11
RETRIES = 15          # DHT22 propenso a glitches intermitentes
RETRY_DELAY = 2.0     # segundos entre reintentos


def nuevo_sensor():
    return adafruit_dht.DHT22(PIN)


def leer():
    """Retorna (temperature, humidity) con rango saneado, o lanza."""
    sensor = nuevo_sensor()
    try:
        for _ in range(RETRIES):
            try:
                temp, hum = sensor.temperature, sensor.humidity
                if temp is None or hum is None:
                    time.sleep(RETRY_DELAY)
                    continue
                temp, hum = float(temp), float(hum)
                if not (-50.0 <= temp <= 60.0 and 0.0 <= hum <= 100.0):
                    time.sleep(RETRY_DELAY)
                    continue
                return temp, hum
            except RuntimeError:
                time.sleep(RETRY_DELAY)
        raise RuntimeError("DHT22 no respondió tras %d intentos" % RETRIES)
    finally:
        try:
            sensor.exit()
        except Exception:
            pass


if __name__ == "__main__":
    while True:
        try:
            t, h = leer()
            print(f"lectura: {t:.2f} C · {h:.2f} %")
        except Exception as e:
            print(f"ERROR lectura: {e}")
        time.sleep(5)
```

**Prueba local:**
```bash
cd /opt/sigcti && source venv/bin/activate
python sensor_lectura.py       # → (repetido) "lectura: 24.63 C · 57.90 %"
```

## 8. Paso 6 — Script de POST · `/opt/sigcti/sensor_post.py`

```python
#!/usr/bin/env python3
"""BBB-03 · envía lecturas al backend SIGCTiArural (contrato V3, F1).

Payload SIEMPRE: {sensor_id, temperature, humidity, timestamp} — el payload
legacy {nodo_id, sensor_tipo, valor} NO es compatible (400 invalid_payload).
"""
import sys
import requests
from datetime import datetime, timezone


def build_payload(temp, hum, sensor_id="BBB-03"):
    return {
        "sensor_id": sensor_id,
        "temperature": round(float(temp), 2),
        "humidity": round(float(hum), 2),
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }


def enviar(payload, backend_url):
    resp = requests.post(backend_url, json=payload, timeout=10)
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    # Uso: python sensor_post.py <temp> <hum> [backend_url]
    temp = float(sys.argv[1])
    hum = float(sys.argv[2])
    url = sys.argv[3] if len(sys.argv) > 3 else "http://BACKEND_HOST:8010/api/v3/telemetry/readings/"
    payload = build_payload(temp, hum)
    try:
        data = enviar(payload, url)
        print("OK %s · %s · %s C · %s %% · %s" % (
            data["item"]["reading_id"], data["item"]["sensor_id"],
            data["item"]["temperature"], data["item"]["humidity"], payload["timestamp"]))
    except requests.exceptions.HTTPError as e:
        print("HTTP %s: %s" % (e.response.status_code, e.response.text[:200]))
        sys.exit(1)
```

> Reemplazar `BACKEND_HOST` por la IP anotada en Paso 0. **Prueba rápida:**
> ```bash
> cd /opt/sigcti && source venv/bin/activate
> python sensor_post.py 24.5 78.1
> # → OK 42 · BBB-03 · 24.5 C · 78.1 % · 2026-09-21T06:00:00Z
> ```

---

## 9. Paso 7 — Script de producción: leer + enviar · `/opt/sigcti/sensor_bbb03.py`

```python
#!/usr/bin/env python3
"""BBB-03 → SIGCTiArural · bucle continuo: DHT22 → POST telemetry V3."""
import time
import requests
import sensor_lectura as lectura
import sensor_post as post

BACKEND_URL = "http://BACKEND_HOST:8010/api/v3/telemetry/readings/"
SENSOR_ID = "BBB-03"
INTERVALO = 10          # segundos entre envíos (= POST_INTERVALO)


def main():
    while True:
        try:
            temp, hum = lectura.leer()
            payload = post.build_payload(temp, hum, SENSOR_ID)
            data = post.enviar(payload, BACKEND_URL)
            print("[BBB-03] %s · %.2f C %.2f %% → reading_id=%s source_mode=live" % (
                payload["timestamp"], temp, hum, data["item"]["reading_id"]))
        except requests.exceptions.HTTPError as e:
            print("[BBB-03] HTTP %s: %s" % (e.response.status_code, e.response.text[:200]))
        except Exception as e:
            print("[BBB-03] ERROR: %s" % e)
        time.sleep(INTERVALO)


if __name__ == "__main__":
    main()
```

---

## 10. Paso 8 — Desplegar, probar contra backend y contra Dashboard

```bash
cd /opt/sigcti && source venv/bin/activate

# 10.1 Prueba LOCAL del flujo completo (unos segundos; ver reading_id → Ctrl+C):
python sensor_bbb03.py

# 10.2 (En host Docker) confirmar que llegó y el historial es LIVE:
curl -s "http://localhost:8010/api/v3/telemetry/history/?tipo=AGRICULTURA" | python3 -m json.tool
# Esperado: {"source_mode":"live", "items":[{...,"sensor_id":"BBB-03","temperature":24.6,...}]}

# 10.3 (En host Docker) las falsificaciones deben seguir rechazándose (hardening F1.1):
curl -s -o /dev/null -w "temp 120 → %{http_code}\n" -X POST http://localhost:8010/api/v3/telemetry/readings/ \
  -H "Content-Type: application/json" -d '{"sensor_id":"BBB-03","temperature":120,"humidity":78.1}'
#   → 400 invalid_payload
curl -s -o /dev/null -w "payload legacy → %{http_code}\n" -X POST http://localhost:8010/api/v3/telemetry/readings/ \
  -H "Content-Type: application/json" -d '{"nodo_id":"BBB-03","sensor_tipo":"temperatura","valor":24.5}'
#   → 400 invalid_payload (payload heredado NO compatible)
```

**Dashboard (prueba visual):**
1. Abrir `http://localhost:5173` (Vite dev; proxy `/api` → `8010`, `vite.config.js`).
2. Ir a la vista Telemetría.
3. Con `sensor_bbb03.py` corriendo: el indicador pasa de `⚪ SIM`/`REF` a **🟢 LIVE**; el panel y el grafo pintan valores reales; `BBB-03` deja de verse offline.

---

## 11. Paso 9 — Operar como servicio (recomendado en campo)

```bash
sudo tee /etc/systemd/system/bbb03-sensor.service >/dev/null <<'EOF'
[Unit]
Description=SIGCTiArural BBB-03 DHT22 → telemetry V3
After=network-online.target
Wants=network-online.target

[Service]
WorkingDirectory=/opt/sigcti
ExecStart=/opt/sigcti/venv/bin/python /opt/sigcti/sensor_bbb03.py
Restart=always
RestartSec=10
User=debian
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now bbb03-sensor
sudo systemctl status bbb03-sensor          # active (running)
journalctl -u bbb03-sensor -f               # lecturas en vivo
```

---

## 12. Paso 10 — Validación final del LIVE (checklist duro)

| # | Verificación | Comando | Esperado |
|---|---|---|---|
| 1 | Nodo envía | `journalctl -u bbb03-sensor -n 5` | `reading_id=...` creciente, `source_mode=live` |
| 2 | Persistencia | `curl -s :8010/api/v3/telemetry/history/` | `source_mode:"live"`, `items[0].sensor_id="BBB-03"` |
| 3 | Cadena end-to-end | Paso 0 de nuevo | POST → 201 continuado |
| 4 | Dashboard | navegador 5173 | 🟢 **LIVE**, serie real en el grafo |
| 5 | Anti-falsificación | Paso 10.3 | 400 en payload legacy/fuera de rango |
| 6 | Regresión backend | `pytest tests/api/test_telemetry_ingest_v3_view.py tests/contexts/telemetry -q` | **60 passed** |
| 7 | Repo intacto | `git status` | Sin cambios de código (solo docs) |

---

## 13. Solución de problemas

| Síntoma | Causa probable | Acción |
|---|---|---|
| `RuntimeError: Error accessing P8_11` | Pin no habilitado / perms `/dev/gpiochip*` | `sudo config-pin P8_11 gpio`; añadir usuario al grupo `gpio` |
| `timeout waiting for PulseIn` | Pull-up ausente o cables largos | Verificar pull-up 4.7 kΩ en DATA; acortar cables; subir `RETRIES` |
| `HTTP 400 invalid_payload` | Payload legacy o campo fuera de rango | Enviar contrato V3 exacto (ver §0) |
| `HTTP 404` | URL o puerto equivocado | Revisar `BACKEND_URL` = `http://BACKEND_HOST:8010/api/v3/telemetry/readings/` |
| `connection refused` | Backend abajo o IP incorrecta | `docker compose up -d backend`; verificar `BACKEND_HOST` en la LAN |
| `HTTP 500` | Problema de servidor (no del nodo) | No seguir; revisar logs backend |
| Dashboard no muestra serie | Frontend no levantado o proxy | Vite en 5173; proxy `/api` → `8010` |
| temp leída como `nan` | Sensor sin datos | Esperar next ciclo; revisar cableado |

---

## 14. Pasos mínimos (resumen ejecutivo para Bernardo)

1. **Host Docker**: verificar contenedores (Paso 0) y anotar más la IP LAN (`BACKEND_HOST`).
2. **BBB-03**: cableado DHT22 (P8_11, pull-up, 3.3V) y encender.
3. **BBB-03**: copiar/pegar Pasos 1–4 (hostname, red, reloj, apt, Python, deps).
4. **BBB-03**: crear los 3 scripts (Pasos 5–7) reemplazando `BACKEND_HOST`.
5. **BBB-03**: `python sensor_lectura.py` (ver lectura local) → `python sensor_bbb03.py` (ver `source_mode=live`).
6. **Host Docker**: confirmar en `history/` y en el Dashboard (Paso 8).
7. **BBB-03 (opcional, recomendado)**: instalar servicio systemd (Paso 9).
8. **Checklist final** (Paso 10) completo.

**Tiempo estimado para 🟢 LIVE (reference: F1 estimaba 2–3 h):**

| Fase | Tiempo |
|---|---|
| Paso 0 servidor (host) | 10 min |
| Pasos 1–4 Debian/Python/deps | 45–60 min |
| Paso 3 cableado + pin | 15–30 min |
| Pasos 5–7 scripts + prueba local | 30–45 min |
| Paso 8 backend + Dashboard LIVE | 15–30 min |
| **Total BBB-03 enviando datos reales** | **≈ 2 h (1.5–3 h según hardware y novedades)** |

**Resultado final del playbook:** BBB-03 publicando temperatura/humedad reales cada 10 s → `201` continuo, `source_mode:"live"` en historial y Dashboard 🟢 **LIVE**, con 0 cambios de código en el repositorio.