# SIGCTiArural — Guardarraíles de la Refactorización (qué no se rompe)

> **Estado:** U0.5 (Gate 0). Diseño. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-14
> **Familia:** Refactorización Global (Gate U0.5)

---

## 1. Propósito

Definir **qué NO puede romperse** durante la refactorización del dashboard, el Hardware Catalog y la navegación. Cada guardarraíl incluye **cómo verificar** que no se rompió (criterio objetivo).

Este documento no autoriza romper nada "temporalmente": un guardarraíl es una barrera física, no una sugerencia.

---

## 2. Guardarraíles

### GR-01 — Integridad de la Arquitectura Hexagonal
- **Qué:** las capas domain/application/infrastructure de los contexts `telemetry`, `labs`, `ai`, etc. se mantienen; las dependencias apuntan hacia adentro.
- **Verificación:** `git diff` sobre `src/backend/contexts/*` = vacío durante todo el trabajo U0.5; suite de tests de dominio intacta (58 tests).

### GR-02 — Integridad DDD
- **Qué:** entidades, value objects, agregados y eventos de dominio existentes no cambian; los bounded contexts hermanos (UBTN) declaran puertos propios.
- **Verificación:** `SensorReading`, `Temperature`, `Humidity`, `SensorId`, `LabSignal` y `wiring.py` sin cambios (regla ADR-UBTN-01..20).

### GR-03 — Telemetry Context y `SensorReading`
- **Qué:** la señal `sensor_reading` del `EventBusPort` sigue significando telemetría ambiental; ninguna biometría se reutiliza sobre ella (mandato UBTN).
- **Verificación:** sin nuevas suscripciones a `sensor_reading` para bioseñales fuera del flujo agrícola; API V1/V2/V3 intactas (`api/views.py`).

### GR-04 — Los 4 laboratorios canónicos
- **Qué:** Agricultura, Electrónica, Robótica y Telecomunicaciones siguen siendo estrategias del pattern Strategy/Factory (presentes en `contexts/labs/domain/strategies`), con evidencia real.
- **Verificación:** `laboratorio_factory.py` sin cambios; ningún lab se oculta o fusiona en la navegación futura.

### GR-05 — Conocimiento / Knowledge Hub
- **Qué:** el portal documental local (51 docs) sigue siendo la fuente de dotación gobernada (base del RAG de Knowledge AI).
- **Verificación:** `knowledgeRegistry.generated.json` sigue generado por `scripts/generate_knowledge_registry.py`; el render de `/knowledge/*` no cambia de fuente.

### GR-06 — Aprendizaje STEM y evidencia del estudiante
- **Qué:** la interfaz favorece generar evidencia (lab→proyecto) antes que consumir contenido; el piso STEM sigue conectado a los labs.
- **Verificación:** ninguna página nueva oculta el flujo "evidencia"; los labs siguen siendo el corazón de la navegación.

### GR-07 — Agnosticismo de hardware (capacidad ≠ portador)
- **Qué:** ninguna capacidad se liga a una marca en la UI ni en el modelo de datos (aplicar Misión 5).
- **Verificación:** revisión de wireframes: no existen tarjetas nombradas "BBB-01/02/03" como primera clase.

### GR-08 — Honestidad del estado (no regresión de honestidad)
- **Qué:** el sistema no presenta infra "referencia/0 bytes" como operativa; etiquetas de estado veraces.
- **Verificación:** estado por capacidad usa el vocabulario `operativo / referencia / diseño / vacío` (GR aplica a Misión 3 §7).

### GR-09 — Compatibilidad de contratos de datos
- **Qué:** contratos JSON existentes (`robotics_contracts.md`, envelope V4 / V1-V3 de telemetría, contratos UBTN diseño) no se rompen.
- **Verificación:** ningún contrato publicado cambia de schema sin ADR + versionado.

### GR-10 — Gobernanza de documentos
- **Qué:** `SIGCT_RURAL_SYSTEM_BOOT.md`, `docs/MASTERDOC.md`, `docs/PLAN_MAESTRO.md` y las familias (UBTN, eiarc, ai) mantienen precedencia y bitácoras actualizadas.
- **Verificación:** reglas de precedencia (REGLA 1-4 del SYSTEM_BOOT) intactas; este trabajo solo añade docs al mapa, no los reescribe.

### GR-11 — Prohibición de sobre-ingeniería
- **Qué:** el diseño no introduce complejidad sin demanda (micro-frontends, BFFs, nueva BD) solo para "modernizar".
- **Verificación:** toda adición propuesta responde a un flujo de persona (Misión 4) y a una capacidad (Misión 5). Si no, se rechaza.

### GR-12 — No-regresión funcional de los flujos coexistentes
- **Qué:** V1/V2/V3 de telemetría y los flujos del frontend (dashboard, labs, IA predictiva, knowledge) siguen operando.
- **Verificación:** smoke test manual de rutas existentes después de cualquier cambio de IA/navegación.

---

## 3. Tabla rápida de verificación de la refactorización

| Guardarraíl | Archivos custodiados | Comando/evidencia de verificación |
|---|---|---|
| GR-01 | `src/backend/contexts/*`, `src/backend/core/*` | `git status` sin cambios en `src/` |
| GR-02 | `contexts/telemetry/domain/**`, `shared_kernel/event_bus/**` | diff vacío |
| GR-03 | `api/views.py`, `api/urls.py`, `wiring.py` | diff vacío + tests 58 |
| GR-04 | `contexts/labs/domain/strategies/**`, `laboratorio_factory.py` | diff vacío |
| GR-05 | `knowledge-hub/registry/*.json`, generator script | `scripts/generate_knowledge_registry.py` sin cambios |
| GR-06..08 | diseño (wireframes, Misión 7) | revisión de IA en auditoría (Misión 8) |
| GR-09 | `docs/architecture/robotics_contracts.md`, contratos UBTN | sin cambios de schema sin ADR |
| GR-10 | boot/docs/bitácoras | entradas nuevas al final, nunca reescritura |
| GR-12 | rutas frontend | smoke tests |

---

## 4. Relación con UBTN

- Los guardarraíles GR-02/03 son **idénticos** a las prohibiciones UBTN (no tocar `SensorReading`, no reutilizar `sensor_reading`; ADR-UBTN-01).
- La navegación nueva incorpora UBTN como eslabón "Bioseñal" sin crear un bounded context paralelo al actual (diseño, U0). Mi Misión 2 GLC-05 es el punto de amarre.

---

## 5. Referencias

- [`SIGCTIARURAL_VISION_ALIGNMENT.md`](SIGCTIARURAL_VISION_ALIGNMENT.md) — no negociables (sección 4).
- [`docs/UBTN_ADR_INDEX.md`](UBTN_ADR_INDEX.md) — ADR-UBTN-01..20 (prohibiciones de contexto).
- [`docs/HEXAGONAL_REFACTOR_PLAN.md`](HEXAGONAL_REFACTOR_PLAN.md) — base de la arquitectura hexagonal.
- [`docs/ECOSYSTEM_IDENTITY.md`](ECOSYSTEM_IDENTITY.md) — identidad (principios 1-4).