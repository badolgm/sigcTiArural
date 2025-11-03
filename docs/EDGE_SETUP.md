# Edge Setup — BeagleBone Black y Sensores

Guía práctica para configurar los nodos Edge del laboratorio físico con **BeagleBone Black Rev C**, sensores y servicios básicos.

## Requisitos de hardware

- 3× BeagleBone Black Rev C (BBB-01 Gateway, BBB-02 IA, BBB-03 Sensores)
- Sensor DHT22 (temperatura + humedad)
- Sensor de humedad de suelo (analógico)
- Cámara USB (mínimo 640×480)
- Switch/Router para red local
- Cables Ethernet y jumper wires

## Roles de nodos

- BBB-01: Gateway MQTT (Mosquitto) y puente hacia el backend
- BBB-02: Inferencia de IA en **TensorFlow Lite** (servicio Flask ligero)
- BBB-03: Lectura de sensores (DHT22, humedad suelo) y publicación MQTT

## Sistema operativo y actualización

En cada BBB:

```bash
sudo apt update && sudo apt upgrade -y
```

## BBB-01 — Gateway MQTT

Instalar broker y clientes:

```bash
sudo apt install mosquitto mosquitto-clients -y
```

Dependencias de Python:

```bash
sudo pip3 install paho-mqtt requests pyyaml
```

Clonar el proyecto y configurar:

```bash
cd /opt/
sudo git clone https://github.com/badolgm/sigcTiArural.git
cd sigcTiArural/src/embedded/bbb_01_gateway/
sudo cp config.yaml.example config.yaml
sudo nano config.yaml  # Ajustar CLOUD_API_URL y API_KEY si aplica
```

Servicio systemd (opcional):

```bash
sudo cp systemd/mqtt-gateway.service /etc/systemd/system/
sudo systemctl enable mqtt-gateway.service
sudo systemctl start mqtt-gateway.service
sudo systemctl status mqtt-gateway.service
```

## BBB-02 — IA en Edge (TensorFlow Lite)

Instalar dependencias mínimas:

```bash
sudo apt install python3-pip -y
sudo pip3 install flask numpy pillow tflite-runtime
```

Estructura y servicio:

```bash
cd /opt/sigcTiArural/src/embedded/bbb_02_ia_edge/
# Ajustar ruta del modelo TFLite en config si aplica
python app.py  # levantar servicio local (puerto configurable)
```

## BBB-03 — Sensores y publicación MQTT

Instalar librerías:

```bash
sudo pip3 install Adafruit_DHT paho-mqtt
```

Ejemplo de lectura y publicación (DHT22):

```python
import Adafruit_DHT
import paho.mqtt.client as mqtt
import json, time
from datetime import datetime

DHT_SENSOR = Adafruit_DHT.DHT22
DHT_PIN = "P8_11"

client = mqtt.Client()
client.connect("<IP_GATEWAY>", 1883, 60)

while True:
    humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
    if humidity and temperature:
        payload = {
            "nodo_id": "BBB-03",
            "sensor_tipo": "temperatura",
            "valor": round(temperature, 2),
            "timestamp": datetime.utcnow().isoformat()
        }
        client.publish("sigct/sensors/bbb03/temperatura", json.dumps(payload))
        print(f"✅ Publicado: {temperature}°C")
    time.sleep(10)
```

## Flujo de datos

1. BBB-03 mide variables y publica en MQTT (`sigct/sensors/...`).
2. BBB-01 enruta mensajes, opcionalmente reenvía al backend por HTTPS.
3. BBB-02 expone servicio de IA en TFLite y opcionalmente notifica alertas.

## Directorios relevantes

- `src/embedded/bbb_01_gateway/` — Scripts y servicio del gateway
- `src/embedded/bbb_02_ia_edge/` — Servicio de inferencia TFLite
- `src/embedded/bbb_03_sensors/` — Lectura de sensores y ejemplos

> Ajusta IPs, claves y rutas en archivos de configuración antes de desplegar.