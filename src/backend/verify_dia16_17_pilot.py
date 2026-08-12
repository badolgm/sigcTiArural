
"""
Verificación manual end-to-end del piloto Telemetría -> Labs/Agricultura
(Día 16-17, Sub-bloque E). Ver docs/local/PLAN_DIA16-17_INTERCONEXION.md.

Hace fluir una lectura de sensor crítica (temperature > 35) por el camino
nuevo -- RegistrarLecturaSensorCommand -> EventBusPort (composition root:
wire_all()) -> OnSensorReadingHandler -- y confirma que la alerta S.O.S de
Agricultura suena por primera vez ante datos "reales" en este proceso.

Regla de oro respetada: NO se toca create_test_data.py ni el ORM legacy. El
dato de este piloto vive solo en memoria (InMemorySensorReadingRepository) y
nunca se escribe en la BD real.

Uso: python verify_dia16_17_pilot.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigct_backend.settings')
django.setup()

from datetime import datetime

from contexts.telemetry.application.commands.registrar_lectura_sensor_command import (
    RegistrarLecturaSensorCommand,
)
from contexts.telemetry.domain.entities import SensorReading
from contexts.telemetry.domain.value_objects import Temperature, Humidity, SensorId
from contexts.telemetry.infrastructure.persistence.in_memory.in_memory_sensor_reading_repository import (
    InMemorySensorReadingRepository,
)
from shared_kernel.event_bus.infrastructure.in_memory_event_bus import InMemoryEventBus
from shared_kernel.event_bus.wiring import wire_all


def main():
    # 1. Composition root: bus + wiring, invocado a mano (Sub-bloque D) --
    #    no hay AppConfig.ready() ni magia de framework detrás.
    bus = InMemoryEventBus()
    wire_all(bus)

    # 2. Repositorio en memoria: el dato de este piloto no toca la BD real.
    repository = InMemorySensorReadingRepository()
    command = RegistrarLecturaSensorCommand(repository=repository, event_bus=bus)

    # 3. Lectura crítica: temperature > 35 -> nivel_estres "Crítico" en
    #    ProcesadorAgricultura (contexts/labs/domain/strategies/agricultura.py).
    lectura_critica = SensorReading(
        sensor_id=SensorId("BBB-PILOT-01"),
        temperature=Temperature(38.5),
        humidity=Humidity(18.0),
        timestamp=datetime.now(),
    )

    print("--- Publicando lectura crítica por el camino nuevo (evento) ---")
    print(f"Lectura: {lectura_critica}")
    print()

    command.ejecutar(lectura_critica)

    print()
    print("--- Fin del flujo. Si viste la alerta S.O.S RURAL arriba, el piloto funcionó de punta a punta. ---")


if __name__ == "__main__":
    main()
