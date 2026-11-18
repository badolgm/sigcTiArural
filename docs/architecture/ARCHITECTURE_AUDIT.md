# ARCHITECTURE_AUDIT.md — SIGC&T Rural

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: ARCHITECTURE_AUDIT.md
> - Destino: docs/architecture/ARCHITECTURE_AUDIT.md

**Rama auditada:** `toshiba/architecture-audit` (base `feature/cmsc-f3c-v1-implementation`)
**Fecha de auditoría:** 2026-11-04
**Alcance:** código fuente (`src/`), infraestructura Docker, configuración. Excluye `vendor/` y `node_modules`.
**Método:** análisis estático, inspección de estructura, imports, duplicación, tamaños, dependencias. **No se modificó código.**

---

## 1. Resumen ejecutivo

El repositorio presenta una **arquitectura en transición** con **dos modelos de dominio paralelos** (legacy `api/logic` y hexagonal `core` + `contexts`) que coexisten sin una frontera clara. Hay duplicación masiva de entidades, value objects, estrategias y repositorios; componentes frontend gigantes sin tests; un composition root deliberadamente no conectado al arranque; y endpoints versionados (v1/v2/v3) registrados de forma condicional con `try/except`, lo que oculta fallos.

**Clasificación global de la deuda:** Alta. El sistema es operativo, pero la evolución sostenible requiere consolidación arquitectónica antes de añadir funcionalidad.

---

## 2. Métricas base

| Métrica | Valor |
|---|---|
| Backend Python (sin migraciones/tests) | 172 archivos / ~5.2 kLOC |
| Frontend JS/JSX | 89 archivos / ~16.8 kLOC |
| AI service Python | 6 archivos / ~1.1 kLOC |
| Tests backend | 27 archivos |
| Tests frontend | 0 |
| Componentes >1000 líneas | 3 (SchematicEditor 1788, ElectronicsLab 1266, AdvancedMathLabV2 1100) |
| Estrategias de laboratorio duplicadas | 3 implementaciones paralelas |
| Contextos DDD duplicados | `core/` y `contexts/telemetry/` (entidades idénticas) |
| Endpoints registrados condicionalmente | v3 (try/except ImportError) |

---

## 3. Arquitectura declarada vs. real

### Declarada (documentos)
- DDD + Hexagonal (Ports & Adapters).
- Bounded Contexts: `Telemetry`, `Labs`, `AI`, `Robotics`.
- Shared Kernel: `event_bus`.
- Composition root explícito en `sigct_backend/wiring.py`.

### Real
- **Dos capas de dominio paralelas:** `core/domain/*` y `contexts/telemetry/domain/*` con entidades y value objects **idénticos** (hash idéntico en `SensorReading`, `Temperature`, etc.).
- **Tres implementaciones de estrategias de laboratorio:** `api/logic/domain/*`, `core/domain/strategies/*`, `contexts/labs/domain/strategies/*`.
- **Dos sistemas de inyección de dependencias:** `infrastructure/config/dependencies.py` y `contexts/telemetry/infrastructure/config/dependencies.py`.
- El composition root (`wiring.py`) **no se invoca en `wsgi.py`/`settings.py`** (documentado como decisión pendiente). El EventBus puede no estar cableado en producción.
- Endpoints v3 dependen de importar ambas capas duplicadas (`HEXAGONAL_V3_AVAILABLE`); si falla, se desactivan silenciosamente.

---

## 4. Hallazgos clasificados

### 4.1 CRÍTICO

| ID | Hallazgo | Evidencia | Impacto |
|---|---|---|---|
| C-01 | Duplicación exacta de dominio (`core` vs `contexts/telemetry`) | Hash idéntico `SensorReading`, `Temperature`, `Humidity`, `SensorId` | Doble fuente de verdad; cambios en uno no se propagan al otro |
| C-02 | Composition root no conectado al arranque | `wiring.py` docstring: "Deliberadamente NO se invoca todavía desde wsgi/asgi/settings" | Event Bus Pub/Sub puede no estar activo en producción; interconexión Telemetry→Labs inoperante |
| C-03 | Endpoints v3 registrados con `try/except ImportError` silencioso | `api/urls.py` líneas 30-42; `HEXAGONAL_V3_AVAILABLE` | Fallos de importación se ocultan; API surface indeterminado en runtime |
| C-04 | `readRobotStatus()` hardcodea estado ROTO y no llama al cliente | `services/cmscAdapters.js` | Frontend declara robótica rota permanentemente; funcionalidad inaccesible |
| C-05 | Frontend sin tests (0) | Conteo de `*.test.*`/`*.spec.*` = 0 | Sin red de seguridad para refactor |

### 4.2 ALTO

| ID | Hallazgo | Evidencia | Impacto |
|---|---|---|---|
| A-01 | Tres implementaciones paralelas de estrategias de laboratorio | `api/logic/domain/*`, `core/domain/strategies/*`, `contexts/labs/domain/strategies/*` | Duplicación de lógica de simulación; divergencia de comportamiento |
| A-02 | Dos sistemas de DI (`dependencies.py`) con comportamiento distinto | `infrastructure/config/dependencies.py` (siempre Django repo) vs `contexts/telemetry/.../dependencies.py` (InMemory en tests) | Inconsistencia en tests vs producción; confusión de cuál usar |
| A-03 | God components en frontend | `SchematicEditor.jsx` 1788 LOC, `ElectronicsLab.jsx` 1266, `AdvancedMathLabV2.jsx` 1100 | Baja mantenibilidad, alto riesgo de regresión |
| A-04 | `api/views.py` es un mega-módulo (434 líneas) que importa ambas arquitecturas | Views V1/V2/V3 en un solo archivo | Acoplamiento; viola SRP |
| A-05 | `AICropAdviceView` y adaptadores de IA acoplados a implementación concreta | `FastAPI_AIAdapter`, `DjangoRepository` instanciados en `__init__` | Difícil sustituir; viola DIP |
| A-06 | `services/cloud.js` hardcodea URLs de producción (Render) | `https://sigct-backend.onrender.com/...` | Acoplamiento a infraestructura; no portable |
| A-07 | `contexts/telemetry/infrastructure/persistence/django/*` duplica `infrastructure/persistence/django/*` con solo import paths distintos | Diff muestra solo imports | Doble mantenimiento |
| A-08 | `api/logic` (V2) y `contexts` (V3) coexisten sin deprecación clara | `api/views.py` importa ambos | Deuda de migración a medio camino |

### 4.3 MEDIO

| ID | Hallazgo | Evidencia | Impacto |
|---|---|---|---|
| M-01 | `AdvancedMathLab.jsx` y `AdvancedMathLabV2.jsx` coexisten | Ambos registrados en `App.jsx` (`/advanced-math`, `/advanced-math-v2`) | Duplicación de UI; confusión de cuál es canónico |
| M-02 | `core/domain/strategies/*` y `contexts/labs/domain/strategies/*` tienen bases distintas (`LabStrategy` vs `ProcesadorLaboratorioStrategy`) | Diferente jerarquía | Inconsistencia de abstracciones |
| M-03 | `api/logic/domain/interfaces.py` y `contexts/labs/ports/notifications.py` duplican puertos | Mismo concepto, nombres distintos | Fragmentación de contratos |
| M-04 | Archivos sueltos en raíz de `backend/` (`create_test_data.py`, `test_endpoints.py`, `verify_dia16_17_pilot.py`) | Listado de archivos | Clutter; no pertenecen a la estructura |
| M-05 | `shared_kernel/event_bus` es el único shared kernel real; pero `core/` y `contexts/` duplican dominio en vez de compartir | Estructura de directorios | Violación del principio de shared kernel mínimo |
| M-06 | `settings.py` concentra 180 líneas con lógica de DB/seguridad | `sigct_backend/settings.py` | Mezcla de responsabilidades (config vs seguridad) |
| M-07 | Frontend `useLabStore` usa `localStorage` directamente sin abstracción | `stores/useLabStore.js` | Acoplamiento a storage; difícil testear |
| M-08 | `config/endpoints.js` resuelve endpoints en build-time con heurísticas | `resolveEndpoint()` | Comportamiento opaco; debugging difícil |
| M-09 | `AIInferenceV3View` y `TelemetryIngestV3View` definidos dentro de `views.py` condicionalmente | `api/views.py` líneas 101+ | Clases ocultas; IDE/análisis no las ve si import falla |
| M-10 | AI service (`fastapi_app.py`, 471 líneas) mezcla DB, voz, modelo, endpoints | Un solo archivo | Violación SRP; difícil de testear |

### 4.4 BAJO

| ID | Hallazgo | Evidencia | Impacto |
|---|---|---|---|
| B-01 | `backup_ubtn_docs/` y `docs` duplicados en raíz | Directorio `backup_ubtn_docs/` | Ruido en el repo |
| B-02 | `UBTN_RESCATE_*.diff/txt` en raíz | Archivos sueltos | Ruido |
| B-03 | `__pycache__` commiteado? (`.gitignore` lo ignora, pero existe en disco) | Directorio `tests/__pycache__` | Inocuo |
| B-04 | Comentarios en español mezclados con código en inglés | Varios archivos | Consistencia de idioma |
| B-05 | `ElectronicsLab.jsx` incluye SchematicEditor cuarentenado (`_quarantine`) | `frontend/_quarantine` | Código muerto potencial |
| B-06 | `knowledgeRegistry.generated.json` (892 líneas) auto-generado en repo | `knowledge-hub/registry/` | Artefacto de build versionado |
| B-07 | `verify_dia16_17_pilot.py` y `verify_refactor.ps1` asumen puerto 8000 (real 8010) | Scripts de verificación | Falsos negativos en CI manual |

---

## 5. Análisis por principio

### 5.1 DDD
- **Bounded Contexts** existen como directorios (`contexts/telemetry`, `contexts/labs`), pero `core/` duplica el contexto de telemetría sin ser un context propio → viola la regla de un modelo por context.
- **Ubiquitous Language** fragmentada: `ProcesadorLaboratorioStrategy` vs `LabStrategy` vs `ProcesadorRobotica`.
- **Aggregates/Entities:** `SensorReading` existe en 3 lugares (Django model en `api/models.py`, dataclass en `core`, dataclass en `contexts`). Sin un único aggregate root.

### 5.2 Hexagonal
- Puertos definidos (`core/ports/*`, `contexts/.../ports/*`, `api/logic/ports/*`) pero **múltiples versiones** del mismo puerto.
- Adaptadores concretos instanciados directamente en views (`DjangoRepository()`, `FastAPI_AIAdapter()`) → no hay composition root real para V2.
- V3 sí usa `infrastructure/config/dependencies.py`, pero coexiste con V2 que instancia directamente.

### 5.3 SOLID
- **SRP:** `api/views.py` (434 LOC) y `ElectronicsLab.jsx` (1266 LOC) violan SRP.
- **OCP:** endpoints añadidos por `try/except` en vez de registro explícito.
- **LSP:** estrategias con bases distintas impiden sustitución polimórfica uniforme.
- **ISP:** puertos como `AIServicePort` probablemente bien acotados, pero duplicados.
- **DIP:** vistas V2 instancian adaptadores concretos en `__init__`.

### 5.4 POO
- Herencia de estrategias inconsistente (`LabStrategy` vs `ProcesadorLaboratorioStrategy`).
- Dataclasses bien usadas en dominio (inmutabilidad parcial).
- `SensorReading` dataclass en dos lugares exactamente iguales → violación de DRY.

### 5.5 Acoplamiento
- Frontend ↔ Backend: `cloud.js` hardcodea host de producción; `cmscAdapters.js` asume V3 disponible.
- Backend ↔ AI: `FastAPIAIAdapter` acoplado a URL de AI service (configurable por env, OK).
- Backend ↔ DB: dos repositorios (Django) con imports distintos.

### 5.6 Código duplicado (DRY)
- Dominio: `core/domain` ≡ `contexts/telemetry/domain` (entidades + VOs idénticos).
- Estrategias: `api/logic/domain/*` ≈ `contexts/labs/domain/strategies/*` (casi idénticas).
- Persistencia: dos `django_sensor_reading_repository.py` con solo imports distintos.
- DI: dos `dependencies.py`.

### 5.7 Deuda técnica
- Migración V1→V2→V3 a medio camino; V1 (legacy) y V2/V3 coexisten.
- `api/logic` marcado como "legacy" pero aún usado por `TelemetryHistoryV2View`.
- `contexts/telemetry/infrastructure/compat/legacy_sensor_reading_adapter.py` mantiene compatibilidad con V1.
- Sin tests frontend; backend tests son de caracterización (no cobertura de integración real).

---

## 6. Riesgos si se continúa sin consolidación

1. **Divergencia silenciosa:** un fix en `core/domain` no se propaga a `contexts/telemetry/domain` (idénticos hoy, pero cualquier cambio futuro rompe la equivalencia).
2. **Event Bus inoperante en producción** por falta de wiring en arranque.
3. **Endpoints V3 desaparecen** si un import falla, sin log visible.
4. **Refactor frontend de alto riesgo** por ausencia de tests y componentes gigantes.
5. **Confusión de desarrolladores** por 3 implementaciones de estrategias.

---

## 7. Recomendaciones (sin implementar)

1. **Consolidar dominio:** elegir `contexts/` como única fuente; eliminar `core/` y `api/logic` tras migrar callers.
2. **Conectar composition root** (`wiring.py`) al arranque de Django (`AppConfig.ready()` o `wsgi.py`), una vez validado.
3. **Registrar endpoints V3 explícitamente** (no `try/except`); fallar rápido con error claro.
4. **Unificar DI** en un solo módulo con perfiles (prod/test) vía settings.
5. **Dividir god components** frontend en módulos por responsabilidad; añadir tests (Vitest/RTL).
6. **Deprecar `AdvancedMathLab`** (v1) y `api/logic` con plan de eliminación.
7. **Externalizar URLs de producción** a configuración, no hardcodear en `cloud.js`.
8. **Añadir tests de integración** para V3 endpoints y Event Bus.
9. **Limpiar raíz de `backend/`** moviendo scripts de verificación a `scripts/`.

---

## 8. Anexo: archivos clave analizados

- `src/backend/api/views.py` (434 LOC)
- `src/backend/api/urls.py`
- `src/backend/core/domain/entities/sensor_reading.py`
- `src/backend/contexts/telemetry/domain/entities/sensor_reading.py`
- `src/backend/core/domain/strategies/*.py`
- `src/backend/contexts/labs/domain/strategies/*.py`
- `src/backend/api/logic/domain/*.py`
- `src/backend/infrastructure/config/dependencies.py`
- `src/backend/contexts/telemetry/infrastructure/config/dependencies.py`
- `src/backend/sigct_backend/wiring.py`
- `src/backend/sigct_backend/settings.py`
- `src/frontend/src/App.jsx`
- `src/frontend/src/services/cloud.js`
- `src/frontend/src/services/cmscAdapters.js`
- `src/frontend/src/labs/SchematicEditor.jsx`
- `src/frontend/src/labs/ElectronicsLab.jsx`
- `src/ai_models/fastapi_app.py`

---

**Fin de auditoría. No se modificó código.**