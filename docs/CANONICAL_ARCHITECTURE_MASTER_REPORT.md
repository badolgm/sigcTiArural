# CANONICAL_ARCHITECTURE_MASTER_REPORT

> **Documento único y canónico de la arquitectura SIGCT-Rural.**
> **Misión:** `CANONICAL_ARCHITECTURE_MASTER_REPORT`.
> **Naturaleza:** consolidación de **verdad verificada**. No es una auditoría nueva, ni diseño, ni hipótesis.
> **Regla suprema:** solo se afirma lo verificado en las fuentes fijadas; lo demás queda marcado `DISEÑO` / `SIN EVIDENCIA`.
> **Sin modificar código · sin commits · sin push · sin diagramas nuevos.**

**Fuentes (exclusivas):**
`ARCHITECTURE_EVIDENCE_FREEZE_REPORT` · `REAL_ARCHITECTURE_REPORT` · `G1_SCHEMA_CONSISTENCY_REPORT` · `R1_DEPENDENCY_INVERSION_AUDIT` · `SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT` · `MASTERDOC.md` · `EIARC_CONTEXTS.md` · `SIGCT_RURAL_CONTEXT_MAP_V8.mmd` · `er_schema_v8.mmd`.
Fuentes de apoyo citadas solo para los temas no cubiertos por las anteriores: `AGENTS.md`, `SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN.md`, `SIGCTIARURAL_BBB_TELEMETRY_READINESS.md`.

**Convención de estado honesto:** `REAL` (existe y se ejecuta) · `REAL-LOCAL` (existe solo en la máquina local) · `IMPLEMENTADO-NO-CABLEADO` · `TRANSICIÓN` · `LEGACY` · `DISEÑO` · `REFERENCIA` · `ROTO` · `SIN EVIDENCIA`.

**Precedencia:** cuando este documento y un artefacto anterior difieran, gana el **código** (`models.py` + `migrations/`, árbol `src/`) y, para el esquema, `MASTERDOC.md §2.9`.

**Nota de entorno:** el daemon Docker estaba caído (`npipe:////./pipe/dockerDesktopLinuxEngine`) durante las auditorías → ninguna afirmación sobre contenedores en ejecución está verificada (se deriva de archivos de definición).

---

## 0. Estado oficial consolidado (2026-10-12)

- ✅ **Arquitectura:** congelada.
- ✅ **Fuentes de verdad:** definidas.
- ✅ **Frontend:** `GO_FRONTEND_OFICIAL_CONDICIONADO`.
- ✅ **CMSC:** operativo.
- ✅ **Bridge:** operativo.
- ✅ **SIGCT Memory:** diseñado (F00–F06.5).
- ✅ **Git:** consolidado.
- ⏸️ **R2:** en pausa.
- ⏸️ **Docker replacement:** en pausa.
- ❌ **Qdrant:** no implementado.

**Ajustes de honestidad de estado (no se registra versión literal):**

- **Tramo C:** con **evidencia pendiente de cierre formal según auditoría**. Existe implementación PCM continuo y validaciones realizadas, pero se conserva el estado reflejado por la evidencia congelada.
- **Dataset acústico:** **pipeline acústico operativo** (Bridge + Logger + Dataset UI + Stats). Dataset C0 en estado `CAPTADO_INICIAL`. `G-DS-1 FAIL`. `G-DS-2..G-DS-6 PENDING`. Cuello de botella vigente: `G-DS-2`.
- **BBB:** **parcialmente recuperada**. Conectividad SSH validada. IP `192.168.7.2` operativa. **Pendientes F2–F7** de integración Edge.

**Preservación (todo se conserva):** CMSC · Dashboard · Laboratorios · Hardware · IA Predictiva · Knowledge Hub. **Ningún laboratorio o funcionalidad validada desaparece.**

---

## 1. Arquitectura actual (AS-IS)

Hoy conviven **dos arquitecturas hexagonales paralelas** y una capa de entrada con tres generaciones de endpoints (REAL_ARCHITECTURE_REPORT §1, §11).

- **Hexagonal NUEVA (destino):** `contexts/telemetry` (REAL, usado por endpoints V3) + `contexts/labs` (IMPLEMENTADO-NO-CABLEADO, se activa solo vía bus) + `shared_kernel/event_bus` (`EventBusPort` + `InMemoryEventBus`, REAL en proceso).
- **Hexagonal LEGACY:** `api/logic/**` (primer intento, solo lo consume V2 y tests) y `core/**` (segunda capa intermedia, usada por V3 e `infrastructure/`).
- **Persistencia compartida:** `api/models.py` es la **única** capa de persistencia y la consumen **ambas** hexágonos (G1 §3.3).
- **Entrada HTTP:** `api/urls.py` monta V1 + V2 + V3 en paralelo (REAL_ARCHITECTURE_REPORT §8).
- **Servicio IA:** microservicio FastAPI externo (`src/ai_models/`, :8081), desacoplado por HTTP (`/infer`, `/suggest`).
- **Frontend:** Vite + React 18 (`src/frontend/`), dev 5173 (config) / 5174 (`--strictPort` por CLI).
- **Herramienta local:** `tools/cmsc-data-logger` (Logger CLI + Bridge local `127.0.0.1:8766`), no contenerizada.

**Integración entre contextos:** pub/sub **en proceso** con `LabSignal` (Published Language) + `InMemoryEventBus`; el acoplamiento Telemetry → Labs es event-driven y unidireccional (`wiring.py`, REAL_ARCHITECTURE_REPORT §2). **Composition root `wire_all()` NO se invoca en el arranque de Django** (G3; se cablea de forma indirecta al construir el bus de telemetry).

**Modelo de datos:** 4 modelos Django (`SensorReading`, `Robot`, `RobotTelemetry`, `RobotCommand`) declarados en código + migración `0002`; el **dump publicado** `schema_postgresql.sql` solo materializa `api_sensorreading` + 10 tablas built-in de Django (G1 §1.1, D-1).

---

## 2. Arquitectura objetivo (TO-BE)

**Decisión (derivada del grafo, no de preferencia):** *converger a `contexts` + `shared_kernel`; absorber `core`; retirar `api/logic`* (SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT §1, §6.1).

```
src/backend/
├── shared_kernel/            # lo genuinamente compartido (event_bus, contratos base)      [REAL]
├── contexts/
│   ├── telemetry/            # BC Telemetría: domain + application + ports + infra          [REAL]
│   └── labs/                 # BC Labs: domain(estrategias) + application(handlers)         [REAL]
├── infrastructure/           # adaptadores de salida compartidos (AI, notif, ORM)           [TRANSICIÓN]
├── api/                      # Django: models (persistencia) + urls + views (entrada)        [REAL]
└── (core/, api/logic/)       # ABSORBIDOS y desaparecidos
```

**Matiz honesto:** el TO-BE **no existe todavía**; existe su **núcleo** (`contexts` + `shared_kernel`) rodeado de dos capas incompatibles. `contexts/*` **no es autosuficiente hoy**: `contexts/labs` importa el puerto legacy `api.logic.ports.ai_service` (`laboratorio_service.py:9`, dependencia invertida) y `contexts/telemetry` importa directamente `api.models` (acoplamiento de infraestructura aceptable pero **duplicado** con `core`+`infrastructure`).

**Forma objetivo oficial EIARC (lenguaje de contexto):** el sistema se organiza en **7 contextos oficiales** (EIARC_CONTEXTS): Telemetry, AI, Labs, Knowledge, Identity, IoT, Deployment. EIARC es el **objetivo**; `contexts/` es la **realización parcial** (2 de 7 materializados). Ambos planos no son excluyentes (ARCHITECTURE_EVIDENCE_FREEZE_REPORT §E.3).

---

## 3. Bounded Contexts canónicos

### 3.1 Materializados en código (REAL)

| BC | Carpeta | Estado | Rol |
|---|---|---|---|
| **Telemetry** | `contexts/telemetry/` | REAL | Lecturas de sensores (VOs + entidad + puerto + repos); publica `sensor_reading` |
| **Labs** | `contexts/labs/` | REAL (vía bus) | Consumidor; estrategias por dominio (agro/electrónica/robótica/telecom) |
| **Shared Kernel / EventBus** | `shared_kernel/event_bus/` | REAL | Transporte inter-contexto (`LabSignal`, `EventBusPort`, `InMemoryEventBus`); neutral, sin depender de contextos |
| **Composition root** | `sigct_backend/wiring.py` | REAL | Cablea Telemetry→Labs por eventos; no invocado en arranque |

### 3.2 Contextos oficiales EIARC (lenguaje arquitectónico, TO-BE)

`EIARC_CONTEXTS.md` define **7 contextos oficiales**: Telemetry, AI, Labs, Knowledge, Identity, IoT, Deployment. Son el vocabulario con el que evoluciona SIGCT-Rural; solo Telemetry y Labs tienen realización en carpetas `contexts/`.

### 3.3 No-contextos / fuera de taxonomía vigente

- **`core/`** y **`api/logic/`** son **capas**, no bounded contexts (se absorben / se retiran).
- **AI** en código es un **microservicio** (`src/ai_models/`), **no** `contexts/ai/` (no existe).
- **IoT / Identity / Deployment / Knowledge** son contextos EIARC, con materialización parcial o documental (Identity: `users/` vacía; IoT: hardware no construido; Knowledge: Hub documental).
- **BiologicalTelemetry / UBTN**: **DISEÑO** (sin código ni tablas).

---

## 4. Context Map canónico

**Fuentes canónicas del mapa:**
- **Raíz (identidad completa):** `docs/eiarc/03_DIAGRAMS/SIGCT_RURAL_CONTEXT_MAP_V8.mmd` — convención de 3 niveles (🟢 implementado · 🔷 objetivo oficial · ⚪ especulativo).
- **7 contextos EIARC:** `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` + `EIARC_CONTEXT_MAP.mmd` / `EIARC_CONTEXT_INTERACTION.mmd`.
- **Código→contexto:** `docs/eiarc/03_DIAGRAMS/EIARC_CODE_TO_CONTEXT_MAP.mmd` (**v1.1.0**, incluye `contexts/**` + `shared_kernel/**`).
- **AS-IS real (código):** descrito en REAL_ARCHITECTURE_REPORT §2 y SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT §0-bis (no existe aún un `.mmd` AS-IS — ver riesgo RF-1).

**Relación verificada en código:** `Customer/Supplier` con **Published Language = `LabSignal`**; Telemetry publica `sensor_reading`, Labs se suscribe (`OnSensorReadingHandler`). El enrutamiento de entrada es `Django api.urls → V3 (contexts/core) | V2 (api/logic) | V1 (ORM directo)`.

**Atomicidad:** no hay transacción entre contextos; la integración es por eventos en proceso.

---

## 5. Fuente de verdad de esquema

**Orden de prelación (G1 §8, MASTERDOC §2.9):**

1. **`src/backend/api/models.py` + `src/backend/api/migrations/`** → **fuente de verdad del esquema objetivo** (4 modelos; estado = aplicar migraciones en orden).
2. **`docs/database/er_schema_v8.mmd`** → **ERD canónico** derivado campo por campo del código; regla "discrepancia se resuelve a favor del código".
3. **`docs/MASTERDOC.md §2.9`** → decisión explícita del proyecto que ratifica lo anterior.
4. **`docker-compose.yml` + `settings.py`** → fuente de verdad de **cómo** se conecta (Postgres 15; `DB_HOST=db`; puerto 5432 interno).
5. **`views.py`/`serializers.py`/`urls.py`** → verdad de **exposición**; **repos/puertos/adapters** → verdad de **acceso**.

**NO es fuente de verdad:** `schema_postgresql.sql` (raíz) → volcado histórico (`pg_dump 15.15`, schema-only) **anterior a `0002`**; documenta 1 tabla de dominio de 4. **NO contradictorio: desactualizado** (G1 §11).

**Obsoletos de esquema** (marcados en el archivo): `er_schema.svg` (USER/PROJECT/TELEMETRY/COURSE), `class_db_models.svg` (User/Project/Telemetry/ImageSample), `uml/class_backend.svg`, `ModelEER_Sigct-rural.mwb`.

---

## 6. Fuente de verdad de contexto

| Tema | Fuente de verdad | Sustituye a |
|---|---|---|
| **Context Map raíz** | `SIGCT_RURAL_CONTEXT_MAP_V8.mmd` | — |
| **Definición de contextos EIARC** | `EIARC_CONTEXTS.md` (+ `EIARC_CONTEXT_MAP.mmd`, `EIARC_CONTEXT_INTERACTION.mmd`) | — |
| **Modelo de datos EIARC (TO-BE)** | `EIARC_CANONICAL_DATA_MODEL.md` + `.mmd` | — |
| **Hexagonal AS-IS** | `MASTERDOC.md §1` + SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT + REAL_ARCHITECTURE_REPORT | `docs/architecture/README.md` (describe hex V2) |
| **Contrato de refactor** | `HEXAGONAL_REFACTOR_PLAN.md` + `ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` | — |
| **Índice de diagramas** | `docs/CANONICAL_DIAGRAM_MANIFEST.md` | `architect_master/04..06` (históricos) |
| **ESQUEMA (↔ §5)** | `models.py` + `migrations/` (`MASTERDOC §2.9`) | `schema_postgresql.sql` |

**Contradicciones zanjadas:** (a) esquema → gana `models.py`+`migrations/`; `architect_master/03` **corregido** (era `schema_postgresql.sql`). (b) ERD → gana `er_schema_v8.mmd`; el README raíz **corregido**. (c) EIARC (7 contextos TO-BE) vs `contexts/` (2 REAL) → no excluyentes, se declaran por separado.

---

## 7. Componentes que sobreviven

| Componente | Veredicto | Estado |
|---|---|---|
| `contexts/*` (telemetry, labs) | **SOBREVIVE** → arquitectura objetivo | REAL (2 acoplamientos a corregir) |
| `shared_kernel/event_bus` | **SOBREVIVE** | REAL |
| `infrastructure/*` | **SOBREVIVE reubicado** (adaptadores de salida) | TRANSICIÓN |
| `api/views.py` V3 + `api/urls.py` | **SOBREVIVE** → adaptadores de entrada | REAL |
| `api/models.py` | **SOBREVIVE** (persistencia compartida) | REAL |
| `src/ai_models/` (microservicio AI) | **SOBREVIVE** (runtime independiente) | REAL |
| `tools/cmsc-data-logger` (Logger + Bridge) | **SOBREVIVE** (herramienta local) | REAL-LOCAL |
| `src/frontend/` (Vite) | **SOBREVIVE** (fuente oficial de desarrollo) | REAL |

---

## 8. Componentes legacy

| Componente | Motivo | Evidencia |
|---|---|---|
| `api/logic/**` (domain/ports/adapters) | Autocontenido; solo V2 + tests; sin bus | `views.py:407-470`; `tests/conftest.py:6` |
| `api/views.py` V1 (`TelemetryHistoryView`) | ORM directo + mock si vacío | `views.py:33-66` |
| ViewSets `Robot*` | ORM directo, sin puerto/adaptador; `Robot*` huérfanas (G1) | `views.py:16-31`; `urls.py:13-16` |
| Rutas `/api/v2/` | Sirven `api/logic` | `urls.py:23-24` |
| `interfaces/web/api/**` | Carpetas **vacías** (0 bytes); nunca usadas | árbol `interfaces/` |

> "LEGACY" = **descriptivo** (anterior, en retirada), no juicio de calidad.

---

## 9. Componentes de transición

| Componente | Rol de transición | Destino |
|---|---|---|
| `core/**` | Define puertos/entidades/VOs/estrategias que deben vivir en `contexts`/`shared_kernel`; usado por V3 e `infrastructure` | **SE ABSORBE** |
| `infrastructure/**` | Adaptadores de salida (AI HTTP, notif, ORM) que aún usan puertos de `core` | **SOBREVIVE reubicado** |
| `api/logic → contexts` (arista invertida) | `contexts/labs → api.logic` (type-hint muerto) | **SE CORTA en R1** |

---

## 10. Roadmap aprobado

> **Aprobado en diseño · NO en ejecución.** Ningún paso se ejecuta sin orden explícita de Bernardo.

### 10.1 Reconciliación de código (R0–R5)

`R0` congelar/medir · **`R1` curar dependencia invertida (BLOQUEANTE)** → `contexts` sin importar `api.logic` · **R2** absorber `core` en `contexts`/`shared_kernel` → 0 imports `core.*` fuera de `core/` · **R3** retirar `api/logic` (re-apuntar V2, migrar tests) → 0 imports `api/logic` · **R3b** resolver `Robot*` (depende de G1) · **R4** limpieza estructural (`interfaces/`, `core/` vacío, `api/logic/`) · **R5** reubicar adaptadores de salida.

**R1 (diseñado, no ejecutado):** la arista `contexts/labs → api.logic` es una **dependencia de tipo muerta** (el puerto importado nunca se usa). Corrección de bajo riesgo: contrato único en **`shared_kernel/services/ai_service_port.py`**; secuencia *aditivo → repunte adaptador infra → cortar import muerto de labs → migrar `tests/contexts/labs/test_services.py` (único test acoplado)*. R1 cubre pasos 0–4; 5–6 son de R2/R3.

**Gate global:** cada fase termina con (a) suite verde, (b) grafo de dependencias sin la arista eliminada, (c) `git status` sin cambios no intencionales.

| Fase | Acción | Criterio de salida | Estado |
|---|---|---|---|
| R0 | Congelar baseline + grafo | suite registrada | HECHO (documental) |
| **R1** | Curar dependencia invertida (bloqueante) | `contexts/*` no importa `api.logic` | DISEÑADO |
| R2 | Absorber `core` | 0 imports `core.*` fuera de `core/` | NO ejecutado |
| R3 | Retirar `api/logic` | 0 imports `api/logic`; `/v2/` repunte o deprecado | NO ejecutado |
| R3b | Resolver `Robot*` (depende de G1) | `ports/`+`adapters/` o retiro | PENDIENTE G1 |
| R4 | Limpieza estructural (`interfaces/`) | una sola capa de puertos | PENDIENTE |
| R5 | Reubicar adaptadores de salida | una sola fuente IA/notif/ORM | PENDIENTE |

### 10.2 Consolidación documental (F0–F6) — ejecutada

F0 (freeze) + **F1** obsoletos marcados · **F2** `MASTERDOC §1.1/§1.2` + `README §BD` alineados · **F3** `EIARC_CODE_TO_CONTEXT_MAP` → v1.1.0 · **F4** `architect_master/03` corregido · **F5** `CANONICAL_DIAGRAM_MANIFEST.md` publicado · **F6** `CONTINUITY_MASTER §12`. **F7** (diagramas nuevos) queda **fuera y no autorizado**.

---

## 11. Riesgos vigentes

**De reconciliación (SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT §5):**

| # | Riesgo | Sev. |
|---|---|---|
| R-1 | Divergencia de comportamiento (copias de estrategias/servicios) | 🔴 Alta |
| R-2 | **Dependencia invertida nueva→legacy** `contexts/labs → api.logic` | 🔴 Alta |
| R-3 | Acoplamiento directo al ORM en `contexts/telemetry` | 🟠 Media |
| R-4 | V3 mezcla dos arquitecturas (`core` + `contexts`) | 🟠 Media |
| R-5 | Retiro prematuro de legacy rompe V2/tests | 🟠 Media |
| R-5b | Retiro de `core` primero rompe V3 + `infrastructure` | 🔴 Alta |
| R-6 | Estructura fantasma `interfaces/` (0 bytes) | 🟡 Baja |
| R-7 | Tests como ancla de legacy (`tests/domain/*`) | 🟠 Media |
| R-8 | Riesgo de "big bang" al eliminar 2 capas a la vez | 🔴 Alta |

**Riesgos de esquema (G1 §7):** R-1 🔴 la BD viva puede no tener tablas `Robot*`; R-2 🟠 el dump puede tomarse como verdad; R-8 🟠 decisión sin datos (Docker caído).

**Riesgos de gobierno/artefactos:** RF-1 falta el **Context Map AS-IS** y el **ERD reconciliado** (brecha G1); RF-2 contratos de gobernanza acústica viven fuera de git; RF-3 `db-mysql` residuo en compose; RF-4 `users` en `INSTALLED_APPS` sin código; RF-5 endpoints V3 en `try/except ImportError` (pueden desaparecer sin error). **Bloqueo transversal:** daemon Docker caído → sin verificación de runtime ni de la BD real.

---

## 12. Estado del frontend

**Dictamen: `GO_FRONTEND_OFICIAL_CONDICIONADO` · `NO_GO` al reemplazo del contenedor** hasta cerrar D y E (SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT §H).

- **GO** para declarar `src/frontend/` (Vite) como **fuente oficial de desarrollo**: build local OK (44.45s), 18 rutas (`App.jsx`), 93 archivos / 16.984 líneas; CMSC, KH, Workbench, Bridge/Dataset funcionales.
- **NO_GO** al **despliegue oficial** (reemplazo del Docker 5173) porque: build Docker no ejecutado (daemon caído); URLs absolutas a `localhost` (`VITE_API_URL`/`VITE_AI_INFERENCE_URL`) rompen acceso remoto; Bridge/Dataset es **local-only** (`127.0.0.1:8766`); auth inerte y `_deprecated` sin resolver.
- **Coexistencia:** **5173 = legacy Docker (referencia) · 5174 = evolución (laboratorio activo)** (`--strictPort` por CLI; `vite.config.js` por defecto 5173).
- **Placeholders honestos:** clúster fabricado en `services/cloud.js` (fallback si no hay backend); overlay `SYSTEM DEBUG` (`App.jsx:99-104`); IA Predictiva con 3 modos mezclados.
- **Condiciones de cierre bloqueantes:** D-1..D-7 + pruebas E-1..E-9.

---

## 13. Estado de CMSC

**CMSC = Centro de Modelado, Simulación y Ciencias Computacionales** — núcleo científico del ecosistema (`CMSC_MASTERPLAN_v1.md`). Ubicación oficial: `/dashboard-cmsc` (Zona de Orquestación Científica, `CMSC_ORCHESTRATION_V2` **APROBADO**, Visual Freeze 2026-10-04).

- **Flujo oficial:** **S30 → Logger → Dataset → Validación → S81 → S82 → Knowledge Hub**. El ACP es lector/explicador posterior, no controla captura ni inventa evidencia.
- **S30 = `REAL-LOCAL`:** micrófono local + `spectralEngine.js` (FFT radix-2 4096 + Hann); su "STFT" es espectrograma rolling.
- **S81 (Acoustic Intelligence) = `DISEÑO`; S82 (Anomaly Detector) = `DISEÑO`** (cold-start sin alertas).
- **Logger (Tramo B) = `VALIDADO`:** CLI `tools/cmsc-data-logger` + Bridge local `127.0.0.1:8766`; reutiliza `ingestWav()`; `GET /health`, `GET /stats`, `POST /ingest`.
- **Pipeline acústico = operativo** (Bridge + Logger + Dataset UI + Stats). **Dataset C0 `sigct_rural_acoustic/v1` = `CAPTADO_INICIAL`** (1 muestra real, E1 accepted), **fuera de git**; `schema.json` 1.3.0; `acoustic.feat.v2` / `window.v2` (44 dims); **`G-DS-1 FAIL`** (7 mids UNVERIFIED), **`G-DS-2..6 PENDING`**; cuello de botella vigente: **`G-DS-2`**.
- **Tramo C (PCM continuo de S30):** **evidencia pendiente de cierre formal según auditoría**. Existe implementación PCM continuo y validaciones realizadas, pero se conserva el estado reflejado por la evidencia congelada.
- **Frontend CMSC:** `CmscDashboard.jsx` + `pages/cmsc/**` (25 archivos), `SignalRiver`, `SignalCatalogView`, `SpectralAnalysisInstrument`, `OrchestrationZoneV2`, trío `ModelPredictCell`/`LabDoors`/`BenchmarkCell`.
- Modo local-only: `127.0.0.1:8765` clasificado como **validación temporal**, descartado como arquitectura final.

---

## 14. Estado de los laboratorios

- **Capa real (`contexts/labs`):** **REAL (vía bus)** — estrategias por dominio (`agricultura`, `electronica`, `robotica`, `telecom`) + `OnSensorReadingHandler`. No cableado al arranque (recibe señales solo al construir el bus de telemetry). `LaboratorioService` conserva un import muerto a `api.logic` (R1).
- **Capa legacy (`api/logic`):** servicios/factories por dominio, consumidos por V2 y tests → **LEGACY**.
- **Backend Labs = IMPLEMENTADO-NO-CABLEADO** en el sentido de que `wire_all()` no se dispara en arranque (REAL_ARCHITECTURE_REPORT §1).
- **Frontend:** laboratorios expuestos por enlaces (`/lab-*`, `/labs/robotics`); hay **duplicidad de recorrido** nueva (`/labs/robotics`) vs legacy (`/lab-*`) sin consolidar en el mapa de navegación.
- **Instrumentos:** FFT Telecom (mic → espectro) = semilla de señal viva; Math V2 + `mathHelpers` + Falstad; V1 de Math = ROTO. `RealSignalAnalysis` (339 líneas) no exportada; MMC las envuelve.
- **Regla vigente:** labs = **herramientas**; envolver y conectar, jamás sustituir.

---

## 15. Estado de Knowledge Hub

- **Estado: `REAL` (documental).** `KnowledgeHubLayout.jsx` + `docLoader.js` + `registry/knowledgeRegistry.generated.json` = **51 docs / 6 categorías** (coincide con AGENTS): `project-core` 7 · `eiarc-architecture` 13 · `eiarc-foundation` 3 · `research-v2` 18 · `knowledge-base` 6 · `historical` 4.
- Cargado por `import.meta.glob` en build; visor operacional; build no rompe si faltan docs.
- **DISEÑO (no implementado):** Evidence Ledger, Hangar de Autenticidad, `docsBySignal`, Knowledge Graph consultable, RAG. El **ACP** es vista inerte `DISEÑO` y, cuando exista, será lector (dieta de conocimiento verificado).
- La memoria persistente (SIGCT Memory) se diseña como **repositorio de lectura derivada** que alimenta KH/ACP, nunca fuente primaria (ver §17).

---

## 16. Estado de BBB

**Fuente:** `SIGCTIARURAL_BBB_TELEMETRY_READINESS.md` (auditoría 2026-09-20, actualizada 2026-09-21) + REAL_ARCHITECTURE_REPORT.

- **Estado: parcialmente recuperada.** Conectividad SSH validada. IP `192.168.7.2` operativa. **Pendientes F2–F7** de integración Edge.
- **Cadena BBB → Dashboard:** históricamente **rota** en el eslabón de ingesta. La brecha **F1** ("no existe endpoint de ingesta") **quedó cerrada** el 2026-09-21 con `TelemetryIngestV3View` (`POST /api/v3/telemetry/readings/`, commit `941a55d`).
- **Brechas vigentes:** F2/MQTT (sin adaptador `paho-mqtt`), F3 bridge (`ubtn_bridge.py` **no existe**), F4 broker (no hay Mosquitto del cluster en compose; `eiarc_mqtt` es de otro stack), F5 `wire_all()` no en arranque, F6/F7 nodos BBB.
- **Scripts edge `bbb_*/` = 0 bytes** (`mqtt_broker.py`, `tflite_api.py`, `sensor_reader.py`); **firmware BBB = 0 bytes**.
- **Nodos en la Dashboard** (BBB-01/02/03 con `initialNodes`) están **hardcodeados/simulados** (`Dashboard.jsx:48-52`).
- **BBB-03:** depende de ejecutar `SIGCTIARURAL_BBB03_EXECUTION_PLAYBOOK.md`; **pendiente de confirmar**.
- **UBTN / BiologicalTelemetry:** **DISEÑO** (contratos V4, `context:'bio'`) — no implementar.

---

## 17. Estado de SIGCT Memory

**Fuente:** `SIGCT_MEMORY_V1_EXECUTION_MASTERPLAN.md`, `SIGCT_MEMORY_IMPLEMENTATION_01.md`, `SIGCT_MEMORY_F01..F06.5` (2026-10-11).

> **Nota de estado (honestidad):** SIGCT Memory está **diseñado (F00–F06.5)**, no implementado.

- **Estado: `DISEÑO` (planeado, NO implementado).** Sin código, sin Qdrant instalado, sin Ollama, sin commits.
- **Identidad:** `SIGCT Memory V1` = **memoria episódica persistente** del ecosistema (bounded context de soporte `sigct.memory`), inspirada en DeepLearning.AI + Qdrant On-Device Memory, adaptada a DDD + Hexagonal.
- **Principio:** **repositorio de lectura derivada** (evidencia + documentación), **nunca fuente de verdad primaria**; indexado gobernado por batch; no modifica docs/KH/BCs.
- **Arquitectura:** `MemoryQueryPort` (lectura, para ACP/KH) + `MemoryIndexPort` (indexado controlado); `Infrastructure: Qdrant (6333/6334) + On-Device Memory`; colecciones por dominio (docs, evidence, manifests).
- **MVP mínimo:** Qdrant local + embeddings `Ollama nomic-embed-text-v2-moe` + ingesta batch P0 → `docs_core` + API read-only + staging `.staging/*.jsonl`; **sin admin expuesto**.
- **Alimentan:** KH registry (51 docs), AGENTS/MASTERDOC, docs AI_ACOUSTIC/CMSC, notebook V1, metadatos C0/C1, M1/M2 (sin pesos). **NO alimentan:** pesos (`.h5/.pth/.onnx`), WAV/binarios, secrets.
- **Fases F01–F06.5: validadas (documental).** BBB (192.168.7.2) = on-device cache **futuro**, no bloquea MVP.

---

## Anexo A — Artefactos canónicos por tema

| Tema | Artefacto canónico |
|---|---|
| Esquema (ERD) | `docs/database/er_schema_v8.mmd` (+ `models.py`+`migrations/`) |
| Context Map raíz | `docs/eiarc/03_DIAGRAMS/SIGCT_RURAL_CONTEXT_MAP_V8.mmd` |
| Contextos EIARC | `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` |
| Índice de diagramas | `docs/CANONICAL_DIAGRAM_MANIFEST.md` |
| Canon maestro | `docs/MASTERDOC.md` |
| Continuidad | `docs/CONTINUITY_MASTER.md` |
| Contrato de refactor | `docs/HEXAGONAL_REFACTOR_PLAN.md` + `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` |
| Auditorías base | `docs/{REAL_ARCHITECTURE_REPORT, G1_SCHEMA_CONSISTENCY_REPORT, SIGCTIARURAL_ARCHITECTURE_RECONCILIATION_AUDIT, R1_DEPENDENCY_INVERSION_AUDIT, ARCHITECTURE_EVIDENCE_FREEZE_REPORT, SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT}.md` |

## Anexo B — Invariantes

1. El **código gana** sobre el diagrama; `models.py`+`migrations/` gobiernan el esquema.
2. Una sola **fuente de verdad por tema**; un tema = un artefacto canónico.
3. **Adición antes de retiro**; cada paso de reconciliación con suite verde.
4. La **memoria/evidencia derivada** nunca supera el estado de su fuente.
5. **Honestidad de estado** obligatoria: `REAL`/`DISEÑO`/`ROTO` visibles; nada de progreso ficticio.
6. **NADA DESAPARECE:** lo obsoleto se marca y se conserva; no se borra.

---

**Sin modificaciones de código · sin commits · sin push · sin diagramas nuevos.**
*Bernardo Adolfo Gómez Montoya — 2026*
