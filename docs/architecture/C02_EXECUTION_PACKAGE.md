# C02_EXECUTION_PACKAGE.md — SIGC&T Rural

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: C02_EXECUTION_PACKAGE.md
> - Destino: docs/architecture/C02_EXECUTION_PACKAGE.md

**Rama:** `toshiba/architecture-audit`  
**Hallazgo:** C-02 — Composition Root no conectado al arranque  
**Estado:** Aprobado conceptualmente · Listo para revisión arquitectónica  
**Fecha:** 2026-11-04  
**Instrucción:** Paquete de ejecución únicamente. No escribir código. No modificar nada. No ampliar alcance.

---

## 1. Archivos exactos a modificar

| # | Archivo | Acción |
|---|---|---|
| 1 | `src/backend/sigct_backend/settings.py` | Agregar una entrada a `INSTALLED_APPS` |
| 2 | `src/backend/sigct_backend/apps.py` | Crear archivo nuevo con `AppConfig.ready()` |

No se modifica ningún otro archivo. No se toca `wiring.py`, `dependencies.py`, `wsgi.py`, `verify_dia16_17_pilot.py` ni ningún test.

---

## 2. Cambios exactos esperados por archivo

### 2.1 `src/backend/sigct_backend/settings.py`

**Ubicación:** bloque `INSTALLED_APPS`, sección "Aplicaciones del Proyecto".

**Estado actual:**
```python
    # Aplicaciones del Proyecto
    'api', 
    'users',
],
```

**Cambio esperado:** agregar `'sigct_backend'` como entrada de aplicación propia:

```python
    # Aplicaciones del Proyecto
    'sigct_backend',
    'api', 
    'users',
],
```

**Nota:** `'sigct_backend'` se coloca antes de `'api'` y `'users'` porque es el paquete contenedor del composition root y no depende de ellas; el orden relativo entre `'api'` y `'users'` no cambia.

### 2.2 `src/backend/sigct_backend/apps.py` (archivo nuevo)

**Ruta completa:** `src/backend/sigct_backend/apps.py`  
**Contenido esperado:** una clase `AppConfig` con método `ready()` que invoque `get_telemetry_event_bus()`.

**Lógica del método `ready()`:**
1. Importar `get_telemetry_event_bus` desde `contexts.telemetry.infrastructure.config.dependencies` (import diferido dentro de `ready()` para evitar acoplar la carga del contexto telemetry al arranque de la app, tal como documenta `wiring.py`).
2. Invocar `get_telemetry_event_bus()`.
3. Debido al `lru_cache(maxsize=1)` en `get_telemetry_event_bus()`, la primera llamada crea el `InMemoryEventBus`, lo cablea mediante `wire_all()` (con guardia de idempotencia), y lo almacena en caché. Llamadas posteriores retornan el mismo bus ya cableado.

**No se escribe código en este documento.** El archivo `apps.py` se crea únicamente durante la ejecución aprobada por el proyecto.

---

## 3. Diff conceptual

```
diff --git a/src/backend/sigct_backend/settings.py b/src/backend/sigct_backend/settings.py
@@
     # Aplicaciones del Proyecto
+    'sigct_backend',
     'api', 
     'users',
 ],

diff --git a/src/backend/sigct_backend/apps.py b/src/backend/sigct_backend/apps.py
new file mode 100644
--- /dev/null
+++ b/src/backend/sigct_backend/apps.py
@@ -0,0 +1,9 @@
+from django.apps import AppConfig
+
+
+class SigctBackendConfig(AppConfig):
+    default_auto_field = 'django.db.models.BigAutoField'
+    name = 'sigct_backend'
+
+    def ready(self):
+        from contexts.telemetry.infrastructure.config.dependencies import (
+            get_telemetry_event_bus,
+        )
+        get_telemetry_event_bus()
```

**Nota:** El bloque anterior es representación conceptual para revisión técnica. No es código ejecutable ni se aplica automáticamente.

---

## 4. Orden de implementación

| Paso | Archivo | Acción | Dependencia previa |
|---|---|---|---|
| 1 | `src/backend/sigct_backend/settings.py` | Agregar `'sigct_backend'` a `INSTALLED_APPS` | Ninguna |
| 2 | `src/backend/sigct_backend/apps.py` | Crear archivo con `AppConfig.ready()` que llame a `get_telemetry_event_bus()` | Paso 1 (para que Django reconozca la app) |
| 3 | (Validación) | Iniciar contenedor `sigctiarural_backend` y verificar que el bus está cableado | Pasos 1 y 2 |

El orden es obligatorio: Django solo llama a `AppConfig.ready()` para aplicaciones listadas en `INSTALLED_APPS`. Sin el paso 1, el paso 2 no se ejecuta en el arranque.

---

## 5. Riesgos por paso

### Paso 1 — Agregar `'sigct_backend'` a `INSTALLED_APPS`

| Riesgo | Descripción | Mitigación |
|---|---|---|
| ImportError al arrancar Django | Si `sigct_backend` no es un paquete Python válido (falta `__init__.py`), Django falla al iniciar. | `src/backend/sigct_backend/__init__.py` ya existe (verificado en auditoría). |
| Orden de inicialización | Colocar `'sigct_backend'` antes de `'api'`/`'users'` no genera dependencia circular porque `sigct_backend` no importa de ellas en `apps.py`. | El import de `get_telemetry_event_bus` es diferido dentro de `ready()`, no a nivel de módulo. |

### Paso 2 — Crear `apps.py` con `ready()`

| Riesgo | Descripción | Mitigación |
|---|---|---|
| Excepción en `ready()` impide arranque de Django | Si `get_telemetry_event_bus()` lanza, Django no levanta. | `get_telemetry_event_bus()` solo crea un `InMemoryEventBus` en memoria y llama a `wire_all()`. No toca BD ni red. Riesgo mínimo. |
| Doble cableado del bus | Si `ready()` se invoca más de una vez, `wire_all()` podría duplicar suscripciones. | `wire_all()` tiene guardia de idempotencia vía `_wired_buses: WeakSet`. Es un no-op si el bus ya fue cableado. |
| Bus diferente al usado por tests | Los tests de `test_wiring.py` crean sus propios buses manualmente. No comparten el bus del arranque. | Sin impacto; los tests son independientes del arranque de Django. |

### Paso 3 — Validación en contenedor

| Riesgo | Descripción | Mitigación |
|---|---|---|
| Contenedor no levanta | Si hay un error de importación en `apps.py`, el contenedor `sigctiarural_backend` no se pone healthy. | Verificar `docker-compose logs sigctiarural_backend` y revertir inmediatamente (ver plan de rollback). |

---

## 6. Plan de rollback detallado

El cambio es estructuralmente reversible sin migración de datos ni modificación de lógica de negocio.

**Pasos de rollback (en orden inverso):**

1. **Revertir `src/backend/sigct_backend/settings.py`:** eliminar la línea `'sigct_backend',` de `INSTALLED_APPS`, restaurando el estado anterior (`'api'`, `'users'`).
2. **Eliminar `src/backend/sigct_backend/apps.py`:** borrar el archivo creado.
3. **Reiniciar el contenedor `sigctiarural_backend`:** para que Django cargue sin la app `sigct_backend` y sin invocar `ready()`.

**Resultado del rollback:** el sistema vuelve exactamente al estado pre-C-02: `get_telemetry_event_bus()` no se invoca al arranque; el bus solo se cablea si un caller lo invoca durante una petición. No hay migraciones de BD, no hay cambios en modelos, no hay cambios en API, no hay pérdida de datos.

**No se requiere:** `docker volume rm`, `git revert`, `git reset`, ni borrado de contenedores. El rollback es puramente de los dos archivos modificados/creados.

---

## 7. Plan de validación detallado

### 7.1 Validación 1 — Bus cableado al arranque

**Cómo verificar:** Iniciar el contenedor `sigctiarural_backend` con `gunicorn` + `wsgi.py` y ejecutar dentro del contenedor:

```python
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigct_backend.settings')
django.setup()
from contexts.telemetry.infrastructure.config.dependencies import get_telemetry_event_bus
bus = get_telemetry_event_bus()
# Verificar que el bus tiene al menos un suscriptor para signal_type="sensor_reading"
subs = bus._subscribers.get('sensor_reading', [])
assert len(subs) >= 1, "El bus no tiene suscriptores de sensor_reading al arranque"
```

**Criterio de éxito:** `len(subs) >= 1`. El handler `OnSensorReadingHandler.manejar` está registrado para `sensor_reading`.

### 7.2 Validación 2 — Idempotencia del cableado

**Cómo verificar:** Reiniciar el contenedor `sigctiarural_backend` varias veces y publicar una señal crítica cada vez:

```python
from shared_kernel.event_bus.domain.lab_signal import LabSignal
from datetime import datetime
from contexts.telemetry.domain.value_objects import Temperature, Humidity, SensorId

signal = LabSignal(
    source_context="telemetry",
    signal_type="sensor_reading",
    timestamp=datetime.now(),
    payload={"temperature": 38.5, "humidity": 18.0, "sensor_id": "BBB-VALIDATION"},
)
bus.publish(signal)
```

**Criterio de éxito:** La alerta "ALERTA S.O.S RURAL" se imprime exactamente una vez por publicación, no se duplica por reinicios del contenedor.

### 7.3 Validación 3 — Flujo extremo a extremo en producción

**Cómo verificar:** Ejecutar `RegistrarLecturaSensorCommand` con una lectura crítica (`temperature > 35`) en el contenedor backend y observar la salida de consola del handler.

**Criterio de éxito:** El contenedor imprime "ALERTA S.O.S RURAL" y "Estrés Hídrico/Térmico Crítico" (según `ProcesadorAgricultura`).

### 7.4 Validación 4 — No regresión en tests existentes

**Cómo verificar:** Ejecutar `tests/sigct_backend/test_wiring.py` y `verify_dia16_17_pilot.py`.

**Criterio de éxito:** Todos los tests pasan sin modificación:
- `test_wire_all_conecta_sensor_reading_al_handler_de_extremo_a_extremo`
- `test_wire_all_no_dispara_alerta_con_datos_normales`
- `test_wire_all_funciona_sobre_el_bus_singleton_get_event_bus`
- `test_wire_all_es_idempotente_no_duplica_suscripcion_en_el_mismo_bus`
- `test_wire_all_cablea_cada_bus_de_forma_independiente`

### 7.5 Validación 5 — Servicio operativo

**Cómo verificar:** `docker-compose ps` muestra `sigctiarural_backend` como `Up (healthy)`.

**Criterio de éxito:** El contenedor backend pasa su healthcheck (`pg_isready` para db, y el proceso gunicorn responde para backend).

---

## 8. Criterios de aceptación

C-02 se considera resuelto cuando se cumplen **todos** los siguientes criterios:

1. El archivo `src/backend/sigct_backend/settings.py` contiene `'sigct_backend'` en `INSTALLED_APPS`.
2. El archivo `src/backend/sigct_backend/apps.py` existe y define `SigctBackendConfig(AppConfig)` con `ready()` que invoca `get_telemetry_event_bus()`.
3. Al iniciar el contenedor `sigctiarural_backend`, el EventBus tiene al menos un suscriptor registrado para `signal_type="sensor_reading"`.
4. Publicar una `LabSignal(signal_type="sensor_reading", temperature > 35)` vía `RegistrarLecturaSensorCommand` dispara exactamente una alerta S.O.S.
5. Los tests de `tests/sigct_backend/test_wiring.py` pasan sin modificación.
6. `docker-compose ps` muestra `sigctiarural_backend` como `Up (healthy)`.
7. No se modificó ningún archivo fuera de `settings.py` y `apps.py`.

---

## 9. Condiciones para declarar C-02 resuelto

C-02 se declara resuelto cuando:

- Los criterios de aceptación (sección 8) están cumplidos.
- Se ha revisado y aprobado los cambios en `settings.py` y `apps.py`.
- Se ha ejecutado la validación en el contenedor `sigctiarural_backend` con resultado exitoso.
- No se han introducido cambios en otros archivos ni en otros hallazgos.
- No hay commits, push ni merge asociados (el paquete se entrega como documentación para ejecución posterior autorizada).

---

## 10. Impacto sobre bounded contexts y componentes

### Telemetry

| Aspecto | Impacto |
|---|---|
| Publicador (`RegistrarLecturaSensorCommand`) | Sus publicaciones de `LabSignal(signal_type="sensor_reading")` pasarán de no tener suscriptor garantizado a tener uno activo al arranque. |
| `get_telemetry_event_bus()` | Se convierte en el punto único de creación del bus al arranque (vía `ready()`). Su `lru_cache(maxsize=1)` garantiza un único bus cableado por proceso. |
| Sin cambios de código | El publicador no se modifica; solo cambia que el bus esté cableado antes de que se publiquen señales. |

### Labs

| Aspecto | Impacto |
|---|---|
| Suscriptor (`OnSensorReadingHandler`) | Comienza a recibir y procesar señales `sensor_reading` en flujo de producción (no solo en piloto/tests). |
| `LaboratorioService(AGRICULTURA)` | Se instanciará dentro del handler al suscribirse; comenzará a ejecutar análisis sobre lecturas de telemetría reales. |
| `ConsoleNotificationAdapter` | Se usará para salida de consola (alerta S.O.S) cuando lleguen lecturas críticas. |
| Sin cambios de código | El handler y sus dependencias no se modifican; solo cambian que estén suscritos al arranque. |

### Shared Kernel

| Aspecto | Impacto |
|---|---|
| `InMemoryEventBus` | Se instantiará una vez al arranque (vía `ready()` → `get_telemetry_event_bus()` → `lru_cache`). |
| `EventBusPort` | Sin cambios de código. |
| `LabSignal` | Sin cambios de código. |

### Event Bus

| Aspecto | Impacto |
|---|---|
| Cableado | El bus pasa de "no cableado garantizado al arranque" a "cableado al arranque mediante `ready()`". |
| Idempotencia | La guardia existente en `wire_all()` (`_wired_buses: WeakSet`) evita duplicación si `ready()` se invoca más de una vez. |
| Alcance | Mismo proceso, entrega síncrona, sin persistencia ni reintentos (alcance ya documentado). No hay cambio en el alcance del bus. |

---

**Fin del paquete de ejecución C-02. No se escribió código. No se modificó nada. Listo para revisión arquitectónica.**