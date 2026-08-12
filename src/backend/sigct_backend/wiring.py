
"""
Composition root del proceso para shared_kernel/event_bus/.

Este es el ÚNICO lugar del sistema donde se cablean explícitamente los
suscriptores (Pub/Sub) de un EventBusPort a un signal_type concreto. No hay
descubrimiento automático de framework detrás (Django no escanea nada, no hay
AppConfig.ready() involucrado) — la conexión entre "quién publica" y "quién
escucha" queda escrita aquí, a la vista, en vez de implícita.

Vive en sigct_backend/ (junto a settings.py/wsgi.py) y no dentro de
shared_kernel/event_bus/: shared_kernel es "solo lo que genuinamente comparten
todos los contextos" (ver docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md)
y debe permanecer neutral, sin depender de ningún bounded context concreto. Un
composition root, por definición, se sienta POR ENCIMA tanto del shared kernel
como de los contextos que cablea entre sí — por eso importa de contexts.labs,
cosa que shared_kernel/ nunca debe hacer (hallazgo de arquitectura del
ultrareview sobre el Día 16-17, corregido en el mismo Sub-bloque).

Decisión explícita del Sub-bloque D (Día 16-17, ver
docs/local/PLAN_DIA16-17_INTERCONEXION.md): se eligió un composition root
invocado a mano en vez de un AppConfig.ready() de Django, por coherencia con
la arquitectura hexagonal del proyecto, que privilegia dependencias explícitas
sobre inversión de control implícita del framework.

Deliberadamente NO se invoca todavía desde ningún punto de arranque real del
proceso (wsgi.py/asgi.py/settings.py/apps.py) — enganchar wire_all() al
arranque de Django es una decisión de alcance aparte, fuera de este piloto.
Hoy se invoca a mano: desde el test de integración (Sub-bloque D) y desde el
script de verificación manual (Sub-bloque E).
"""
from weakref import WeakSet

from contexts.labs.application.commands.on_sensor_reading_handler import (
    OnSensorReadingHandler,
)
from shared_kernel.event_bus.ports.event_bus import EventBusPort

# Registro de bus ya cableados en este proceso -- WeakSet para no impedir que
# un EventBusPort sin más referencias sea recolectado por el GC.
_wired_buses: "WeakSet[EventBusPort]" = WeakSet()


def wire_all(event_bus: EventBusPort) -> None:
    """
    Registra, sobre el puerto EventBusPort recibido, todas las suscripciones
    (adaptador -> handler) que conforman el caso piloto Telemetría ->
    Labs/Agricultura.

    Idempotente por instancia de event_bus: si el mismo bus ya fue cableado
    por una llamada previa en este proceso, la llamada es un no-op. Esto
    importa porque cada invocación construye un OnSensorReadingHandler nuevo
    -- dos handlers distintos no son el mismo objeto, así que un dedup
    genérico dentro de subscribe() no alcanzaría a detectar la repetición; la
    idempotencia se garantiza aquí, en el composition root, que es quien sabe
    qué significa "ya cableado" para este caso piloto. Sin esto, una segunda
    llamada duplicaría cada reacción -- incluida la alerta S.O.S. -- por cada
    lectura crítica que pase por el bus.

    Hoy solo existe una suscripción: OnSensorReadingHandler queda suscrito a
    las señales signal_type="sensor_reading" publicadas por telemetry (ver
    RegistrarLecturaSensorCommand). Nuevas interconexiones futuras entre
    laboratorios se agregarían aquí mismo, como líneas adicionales, sin tocar
    ni el puerto ni los handlers existentes.
    """
    if event_bus in _wired_buses:
        return

    handler = OnSensorReadingHandler()
    event_bus.subscribe("sensor_reading", handler.manejar)

    _wired_buses.add(event_bus)
