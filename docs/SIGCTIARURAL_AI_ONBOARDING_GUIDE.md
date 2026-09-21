# SIGCTiArural — Guía de Incorporación para IA y Nuevos Ingenieros

**Documento:** SIGCTIARURAL_AI_ONBOARDING_GUIDE
**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Naturaleza:** Documento definitivo de transferencia de conocimiento e incorporación técnica (MISIÓN FINAL RC-2).
**Principio supremo:** La documentación canónica es la fuente de verdad. Toda afirmación se rastrea a documentos existentes. No inventar. No completar huecos. No asumir.

> Cómo leer este documento: es una carta de navegación. Cada sección señala los documentos que debes leer antes de tomar decisiones. Nada sustituye la lectura de los canónicos; esto solo los ordena.

---

## 1. Resumen Ejecutivo

### ¿Qué es SIGCTiArural?
Un **ecosistema autónomo y agnóstico de hardware/software** (código abierto) que integra sensores, robots, sistemas de IA, laboratorios interconectados y personas como nodos cooperantes, orientado a observar, cuidar, aprender y actuar sobre entornos vivos de manera sostenible, resiliente y educativa.
Fuente: `README.md:68`; definición de cierre en `docs/ECOSYSTEM_IDENTITY.md:63` — "ecosistema vivo de conocimiento verificable donde formación, investigación, IA, laboratorios y telemetría convergen para transformar aprendizaje en evidencia, y evidencia en conocimiento".

### ¿Qué no es?
- No es una plataforma ni un dashboard aislado (es un ecosistema construido sobre Bounded Contexts).
- No es un LMS (Principio 3, `ECOSYSTEM_IDENTITY.md:35`).
- No es una plataforma IoT (IoT es instrumento, no identidad — Principio 4, `ECOSYSTEM_IDENTITY.md:39`).
- No es EIARC en sentido deja de serlo: EIARC es **su caso de uso productivo real**, no un paraguas superior (identidad invertida, registrada en `SIGCT_RURAL_SYSTEM_BOOT.md:10-11`).

### ¿Por qué existe?
1. **Propósito técnico:** transformar aprendizaje en evidencia y evidencia en conocimiento verificable (formación, investigación, IA, laboratorios, telemetría).
2. **Propósito social:** agricultura sostenible e inclusión tecnológica rural en Colombia.
3. **Propósito institucional:** caso de I+D+i formal ante el SENA (línea ADSO), demostrando que lo aprendido internamente (señales, matemáticas, telecomunicaciones, IA) se convierte en solución real para población vulnerable.
4. **Norte científico:** un ciclo completo SENSOR → … → PRODUCCIÓN, honesto en cada eslabón.

---

## 2. Historia arquitectónica (cronológica)

### V1 — Plataforma monolítica (Fases 1–4, 02-Nov-2025 → dic-2025)
Django monolítico empírico; toda lógica centralizada; sin límites arquitectónicos formales.
Fuente: `docs/MASTERDOC.md` §5 bitácora (Fases 1–4, 100% completadas).

### V2 — Strangler Fig en marcha (enero-2026 en adelante)
Se introduce la estrategia estrangulamiento por ramas + Branch by Abstraction. El código V1 se instrumenta con `@deprecated_legacy` para marcar lo heredado **sin eliminarlo** (principio NADA DESAPARECE).
Fuente: `MASTERDOC.md §2.4`, `§2.5`.

### V3 — Hexagonal real (julio-2026)
`core/domain/` + `infrastructure/` + puertos materializados (ej. `SensorReadingRepositoryPort`, `AIServicePort`, `EventBusPort`). Conviven **tres capas** (V1 legado, V2 @deprecated, V3 hexagonal). Estado: **58 pruebas identificadas, 56 en verde; cobertura hexagonal aproximada 15–25%.**
Fuente: `MASTERDOC.md §1.1`; `ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`.

### UBTN — Diseño científico (Universo Biológico, 20-jul-2026)
Familia documental de 26 documentos: `BiologicalTelemetry` como **bounded context hermano `bio`** del Telemetry Context. **Cierre fase U0 en diseño, 0 líneas de código nuevo.**
Fuente: `docs/UBTN_INDEX.md`, `UBTN_ARCHITECTURE.md`, `UBTN_ADR_INDEX.md` (ADR-UBTN-01..20).

### EIARC — Meta-capa e caso de uso (12-jul-2026 → vigente)
Dos significados que deben leerse por separado (`README.md:348`):
- (A) Marco arquitectónico y de gobernanza: Contextos delimitados + contratos semánticos en `docs/eiarc/`.
- (B) Expansión productiva futura: Fase 9 (Apicultura, Piscicultura, Ganadería/Avicultura, Invernaderos), **0% de avance, explícitamente posterior a Fases 7–8** (`README.md:361-369`).
Con la inversión de identidad (20-jul-2026), EIARC es la demostración productiva del ecosistema, no su marco abstracto.

### Estado actual (ACTUALIZADO 2026-09-21 · STATE SYNCHRONIZATION)
Fase 7 (Hexagonal) **45% en progreso** · Fase 8 (Observabilidad/Hardening) **15% en preparación** · Fase 9 **0% planificada** · UBTN **U0 cerrada en diseño**. La rama ya no está congelada con 98 cambios: se commiteó por misión explícita hasta **HEAD `0989ec9`** (backend F1 en `941a55d`; queda pendiente el diff RC-2/UX de `Dashboard.jsx` + `dashboard_rc2_ui.patch`). Estado git vivo: `AGENTS.md`.

> El bloque de estado original AL 15-sep-2026 ("Rama congelada: ~98 cambios sin commit (4 docs M, 4 código M, 5 código ?, ~88 docs untracked)") se conservó en este mismo documento en el commit `3ae504d`; se sustituye aquí por el estado real. Fuente histórica: `docs/SIGCTIARURAL_RC2_FREEZE.md` §8.

---

## 3. Modelo DDD

### Contextos — tres enumeraciones que conviven (registradas, no corregir)
| Fuente | Enumeración |
|---|---|
| `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` | 7 oficiales: Telemetry, AI, Labs, Knowledge, Identity, IoT, Deployment |
| Día 6-7 (en `SYSTEM_BOOT.md:28`) | 6 reconciliados: Labs, Telemetry, AI, Knowledge, Identity, EIARC |
| `ADSO_GUIA...:237-255` (tabla técnica) | Labs, Telemetry, AI, Identity, Knowledge, IoT + meta-capa EIARC |

**Invariables en las tres:** Telemetry es contexto · Labs es contexto · AI es contexto · Knowledge es contexto · Identity es contexto. **Deployment NO es contexto** (infraestructura) · **Notifications NO es contexto** (shared_kernel transversal) · **EIARC es meta-capa de gobernanza**, no contexto par.

### Context Map (`docs/UBTN_CONTEXT_MAP.md`)
- **Telemetry Context:** el slice más maduro del proyecto (mayor evidencia de implementación; `README.md:129`, `SYSTEM_BOOT.md §10:621-623`). Relación *Customer/Supplier* con los consumidores.
- **`bio` (BiologicalTelemetry):** contexto hermano (sibling) de Telemetry — nunca extiende `SensorReadingRepositoryPort` (ADR-UBTN-01).
- **Knowledge (Knowledge Hub):** absorbe Cursos/contenido académico; registry de 51 documentos (18 research_v2).
- **Labs:** 8 laboratorios reales (Robótica, Matemáticas Avanzadas V1/V2, Embebidos, Telecom, Electrónica, Ciencia de Datos + laboratorios UBTN); trata eventos bio como no-agregados.
- **AI (`ai_advisory`):** servicio independiente (FastAPI + TensorFlow); extiende por `AIServicePort` (`PLAN_MAESTRO.md:56`).

### Lenguaje Ubicuo (vocabulario sancionado)
| Término | Significado sancionado |
|---|---|
| Ecosistema | Sistema plural de nodos cooperantes (no plataforma, no app) |
| Nodo cooperante | Sensor, robot, IA o persona que participa |
| Evidencia / Conocimiento verificable | Dato con trazabilidad y estado honesto |
| Estado honesto | `real` / `referencia` / `simulación` / `diseño` — nunca disfrazado |
| `source_mode` | Origen de señal: `real` o `simulation` |
| `confidence` | Probabilidad del modelo en una inferencia |
| `binary_only` | Alcance científico del modelo actual (clasificación binaria) |
| Escenario demostrativo | Ejecución que NO pretende ser producción real |

### Shared Kernels
Clases/nociones compartidas por varios contextos: estructura del proyecto documental, `@deprecated_legacy` como marcador transversal, y notificaciones como infraestructura. La instrumentación de backoffice académico comparte rutinas con los contextos productivos.

---

## 4. Modelo Hexagonal

Patrón objetivo: **Modular Monolith con límites hexagonales por bounded context** (`PLAN_MAESTRO.md:35`); excepción: AI service como límite físico independiente (`.md:37`).

### Piezas
| Pieza | Qué es | Dónde vive / evidencia |
|---|---|---|
| Dominio | Entidades, value objects, reglas puras — inocente de infraestructura | `core/domain/` (V3) |
| Puertos (ports) | Interfaces de entrada/salida del dominio | `SensorReadingRepositoryPort`, `AIServicePort`, `EventBusPort` |
| Adaptadores | Implementaciones concretas (Django ORM, FastAPI, MQTT, HTTP) | `infrastructure/` |
| Aplicación | Casos de uso, orquestación | Capa aplicación del contexto |
| Infraestructura | Frameworks, DB, buses | Django runtime + PostgreSQL 15 + Docker Compose |

### Dónde está cada cosa (verificado)
- Runtime principal: **Django**; runtime IA: **FastAPI**; DB: **PostgreSQL 15** (decisión 2.1 `MASTERDOC §2`); cola/MQTT: diseño UBTN (`UBTN_MQTT_ARCHITECTURE.md`); frontend: **React 18** + Three.js + Pyodide/Plotly (CDN) en `src/frontend/`.
- Migración: Strangler Fig + Branch by Abstraction; `schema_postgresql.sql` **no es la única verdad** (decisión 2.9).
- Estado: tres capas coexisten (V1/V2/V3); hexagonal 15–25%, 56/58 pruebas en verde.

---

## 5. Inventario de implementación

### ✅ Implementado (real)
- Telemetry V3 + History (`/api/v3/telemetry/history/`) + Open-Meteo.
- IA inferencia: POST `/api/v3/ai/inference/` (confidence, model_version, `binary_only`); SSE `/events`; modos real/simulación/robot_demo.
- Backend BBB-01/02/03 (edge), sensor real/simulado.
- Frontend completo heredado: Dashboard Ganadora (720 líneas, Cinta del Ciclo Científico, Mapa único, chips capacidades, micro-chips hardware), TopNav Ganadora (194 líneas), TelemetryPanel ejecutivo (DigitalDisplay + MiniSparkline), Knowledge Hub registrado (51 docs), Learning Layer (18 recursos oficiales `resources[]`), catálogo hardware (10 plataformas), proyectos (7), laboratorios 8.
- Knowledge Hub operational: registry real con rutas funcionando.
- Documentación canónica + 26 UBTN + ~10 auditorías RC.

### 🟡 Parcial (referencia / demostración / deuda)
- Hexagonal: 3 capas coexistentes, V3 al 15–25%.
- Identity Context: **no materializado** (deuda abierta — `UBTN_AUDIT_REVIEW` A-6: `FacilityId` bloqueado hasta Identity).
- Dataset físico: **no existe** (18 docs de diseño research_v2, sin datos entrenable).
- Modelo IA: `binary_only`, demo, sin validación cross-dataset.
- Navegación: triple fuente de verdad (TopNav/Sidebar/DEBUG) — deuda reconocida.
- `NEON_COLORS` duplicado ≥5 archivos; `initialNodes` ×3 copias; `catch(() => [])` silencioso — deudas experimentales reconocidas.
- Producción agrícola: solo diseño (0 datos reales).

### 🔵 Diseñado (no implementado)
- UBTN (toda la familia: contratos, agregados, MQTT, seguridad, runbook, campo) — U0 cerrada en diseño, 0 código.
- Datasets V2, pipeline de entrenamiento, MLOps governance.
- Fase 8 (observabilidad/hardening) y Fase 9 (EIARC productivo).
- Cinta del ciclo: eslabones DATASET/MODELO/DECISIÓN/PRODUCCIÓN como visión.

### ⛔ Prohibido tocar (`SYSTEM_BOOT.md §14`, 13 ítems)
1. Re-auditar el repositorio desde cero.
2. Regenerar arquitectura EIARC aprobada.
3. Regenerar spec/plan/migración del Knowledge Hub.
4. Reabrir diagnóstico forense del AI Service.
5. Tratar `schema_postgresql.sql` como única verdad de esquema.
6. Romper Dashboard/Telemetría/navegación.
7. Modificar `SensorReading` o reutilizar `sensor_reading` para biometrías (ADR-UBTN-01..20).
8–13. (resto de restricciones más refinadas de §14 — leer completo antes de tocar).
**Además:** NO commits/push/merge/rebase a `main`; NO cambiar regla suprema NADA DESAPARECE.

---

## 6. Verdades Canónicas (reglas que nunca deben romperse)

1. **NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.**
2. **La honestidad de estado (real/referencia/simulación/diseño) es un invariante de dominio**, no una opción de UI.
3. **La documentación canónica es la fuente de verdad;** el código es evidencia, no autoridad.
4. **MASTERDOC.md §5 es la única bitácora canónica** (REGLA 1).
5. **PLAN_MAESTRO.md gobierna fases/roadmap** (REGLA 3); en discrepancia, MASTERDOC prevalece (REGLA 2).
6. **No Fase 9 antes de cerrar Fases 7 y 8** (decisión 2.3); UBTN sin tocar `SensorReading`/`sensor_reading`.
7. **EIARC es el caso de uso real del ecosistema** — no su marco superior (identidad invertida).
8. **Telemetry es contexto** — en toda enumeración; es el slice más maduro.
9. **Sin dataset físico, sin modelo entrenado, sin producción real.** La IA demo `binary_only` no es productiva.
10. **Precedencia documental:** doc más reciente/específico del tema → `docs/eiarc/02_ARCHITECTURE/` → código/migraciones → inventarios → históricos (regla §18.8-9).

---

## 7. Flujo Científico (técnicamente)

```
SENSOR → SEÑAL → DATO → DATASET → MODELO → IA → DECISIÓN → PRODUCCIÓN
```

| Eslabón | Artefacto técnico | Estado |
|---|---|---|
| SENSOR | BBB-01/02/03, sensor road, catalog-data.js (10 plataformas) | ✅ real/apto |
| SEÑAL | source_mode real/sim, TelemetryPanel (DigitalDisplay + MiniSparkline) | ✅ real |
| DATO | `/api/v3/telemetry/history/` + Open-Meteo | ✅ real |
| DATASET | 18 docs research_v2 (inventory, data_quality, label, split) | 🟡 diseño — **sin datos físicos** |
| MODELO | `binary_only`, `model_version`, `confidence` | 🟡 demo |
| IA | POST `/api/v3/ai/inference/` + SSE `/events` (FastAPI) | 🟡 demo real |
| DECISIÓN | `getStatusPresentation` (clasificación binaria) | 🟡 diseño/recomendación |
| PRODUCCIÓN | proyectos-data.js (`diseño`), Fase 9 | 🔴 visión, 0 datos |

**Regla operativa del ciclo:** ningún eslabón puede presentarse como el siguiente. DATASET solo se entrena cuando exista; PRODUCCIÓN solo reporta cuando haya datos.

---

## 8. Machine Learning e IA

### Estado actual
- Inferencia real vía API sobre FastAPI; clasificación binaria `binary_only`; `confidence` y `model_version` expuestos.
- Edge: TFLite en BBB-02; telemetría V3 con contingencia simulada explícita.
- Programa de investigación `research_v2` (18 docs): dataset strategy, training pipeline, MLOps governance, benchmark readiness (GO **condicionado** a dataset físico), prediction validation, scientific correction design.

### Limitaciones
- Sin dataset físico → sin entrenamiento real → sin métricas productivas.
- Alcance binario (una dolencia, demo); sin multiclase ni validación cross-dataset.
- No confundir "Escenario demostrativo" (UI) con producción.

### Roadmap
1. Materializar dataset físico (research_v2) → 2. Entrenar/validar modelo → 3. Extender scope científico → 4. Decisión asistida → 5. Producción (solo con datos reales). Todo subordinado a cierre de Fases 7–8.

---

## 9. UBTN (Universal Biological Telemetry Node)

### Motivación
Extender la telemetría existente a señales biológicas (multiespecie) sin romper el Telemetry Context ni su modelo `SensorReading` — una necesidad científica (Fase 9) anticipada con diseño puro.

### Arquitectura
Bounded context hermano `bio`, modelado DDD táctico: dominio (`UBTN_DOMAIN_MODEL.md`), agregados (`UBTN_AGGREGATE_DESIGN.md`), casos de uso (`UBTN_USE_CASES.md`), event storming (`UBTN_EVENT_STORMING.md`), MQTT (`UBTN_MQTT_ARCHITECTURE.md`), edge (`UBTN_BBB_EDGE_GATEWAY.md`, `UBTN_EDGE_AI_STRATEGY.md`), seguridad (`UBTN_SECURITY_MODEL.md`), despliegue (`UBTN_FIELD_DEPLOYMENT_GUIDE.md`, `UBTN_OPERATIONS_RUNBOOK.md`), evolución (`UBTN_TELEMETRY_EVOLUTION_STRATEGY.md`, `UBTN_DATABASE_EVOLUTION.md`, `UBTN_FRONTEND_UX_STRATEGY.md`).

### Restricciones
- ADR-UBTN-01..20: NUNCA modificar `SensorReading` ni reutilizar `sensor_reading` para biometrías.
- Bioseñal debe declarar `source_context`: `bio`, `telemetry`, …
- Todo señal declara `source_context`. Labs trata eventos bio como opcionales, no agregados.
- U0 cerrada en diseño; implementación (U1+) subordinada al cierre de Fases 7–8.

### ADR y backlog científico
26 ADR (índice en `UBTN_ADR_INDEX.md`); investigación en `UBTN_RESEARCH_BACKLOG.md` y gaps en `UBTN_RESEARCH_GAPS.md`. Hardware roadmap V1–V4 (`UBTN_HARDWARE_ROADMAP.md`).

---

## 10. Mapa completo de documentos (qué leer para cada duda)

| Duda | Documento |
|---|---|
| ¿Qué es esto y por qué existe? | `README.md`, `docs/ECOSYSTEM_IDENTITY.md` |
| ¿Cómo gobierno y qué está prohibido? | `SIGCT_RURAL_SYSTEM_BOOT.md` (§14, §18.8-9) |
| Estado técnico real / bitácora | `docs/MASTERDOC.md` (§1, §5) |
| Fases y roadmap | `docs/PLAN_MAESTRO.md` |
| Contextos oficiales | `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` |
| Refactor hexagonal en detalle | `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` |
| Estado congelado / cómo retomar | `docs/SIGCTIARURAL_RC2_FREEZE.md`, `RC2_READINESS.md`, `RC2_CONSOLIDATION.md` |
| Raíz conceptual (auditoría canónica) | `docs/SIGCTIARURAL_CANONICAL_ENGINEERING_REVIEW.md` |
| Visión de toda la cadena científica | `docs/SIGCTIARURAL_RESEARCH_PRODUCTION_VISION.md`, `_LAYER.md`, `_EXPERIMENTATION_LAYER.md` |
| Familia UBTN (índice) | `docs/UBTN_INDEX.md` (árbol + trazabilidad) |
| UBTN arquitectura / dominio / ADR | `UBTN_ARCHITECTURE.md`, `UBTN_DOMAIN_MODEL.md`, `UBTN_ADR_INDEX.md` |
| Auditar coherencia frontend-código | `docs/SIGCTIARURAL_FRONTEND_ARCHITECTURE_AUDIT.md` |
| Auditorías institucionales/EIARC | `docs/eiarc/`, `docs/INDICE_PROYECTO.md` |
| Data lab / ciencia de datos | `docs/ai/research_v2/` (18 docs) |
| Documentos oficiales SENA/ADSO | `docs/MASTER_PROJECT_INVENTORY_AUDIT.md` (ruta en BOOT §3), gobernanza |

---

## 11. Errores que una IA futura NO debe cometer

1. **Tratar `README.md:348` como vigente literal** ("SIGCT dentro de EIARC") — fue invertido; leer `ECOSYSTEM_IDENTITY.md`.
2. **Elegir una sola enumeración de contextos** — las tres conviven; usar la tabla técnica `ADSO_GUIA...:237-255` para decisiones de código.
3. **Ofrecer "arreglar" las contradicciones D1-D7** — están registradas deliberadamente; corregir es violar NADA DESAPARECE.
4. **Implementar la cinta científica** con datos falsos — PRODUCCIÓN sin datos = violación del invariante de honestidad.
5. **Entrenar/desplegar IA productiva** sin dataset físico materializado (9ª verdad canónica).
6. **Extender `SensorReading`** o reutilizar `sensor_reading` para UBTN.bio (ADR-UBTN-01).
7. **Hacer commits/push/merge o tocar `main`** — la rama está congelada con ~98 cambios pendientes de consolidar bajo RC-2.
8. **Lanzar "heroicos" refactors frontend** (Tailwind, DDD, "clean architecture") sin pasar por la auditoría y el checklist RC-2 FREEZE.
9. **Borrar/mover Cinta del Ciclo, chips o micro-chips** del Dashboard argumentando estética — son la representación de la visión científica.
10. **Asumir que `schema_postgresql.sql` o cualquier archivo es "la verdad"** sin seguir la cadena de precedencia.
11. **Regenerar specs/arquitectura/forenses** ya aprobados (Knowledge Hub, EIARC architecture, AI Service diagnosis).
12. **Ignorar las deudas experimentales** (DEBUG bar, `catch(() => [])`, `initialNodes`×3) tratándolas como definitivas en vez de reconocerlas.

---

## 12. Preguntas frecuentes

### FAQ técnica
- **¿Cómo valido sintaxis sin runtime?** balance de `{`/`}` y `(`/`)` (diff=0); runtime solo vía Docker 5173 (referencia estable) / 5174 (laboratorio).
- **¿Qué lenguaje corre la IA?** Python (FastAPI + TensorFlow). **¿El frontend?** React 18 + Three.js + Pyodide (CDN).
- **¿Hay base de datos?** PostgreSQL 15 (decisión 2.1), esquema en migraciones, no solo SQL.
- **¿Qué es `binary_only`?** Alcance actual del modelo: clasificación binaria (una dolencia, demo).

### FAQ arquitectónica
- **¿Modular Monolith o microservicios?** Modular Monolith hexagonal; solo el AI service es runtime independiente.
- **¿Puedo añadir un contexto?** No sin pasar por gobernanza (§18.8-9) y sin violar §14.
- **¿Qué es EIARC?** Con dos sentidos (marco + Fase 9); canónicamente, el caso de uso productivo del ecosistema.
- **¿Dónde está Identity?** No materializado — deuda conocida que bloquea `FacilityId`.

### FAQ científica
- **¿El modelo es productivo?** No; es demostración `binary_only`.
- **¿Hay datasets?** Diseño (18 docs), sin datos físicos entrenable.
- **¿Qué es la Cinta del Ciclo?** Representación visual de los 8 eslabones con estado honesto (bloque 1a del Dashboard).
- **¿Puedo cambiar el vocabulario?** No — el lenguaje ubicuo es sancionado por las Verdades Canónicas.

---

## 13. Estado RC-2

### Qué quedó terminado
- Auditoría frontal completa (V2 perfomance/a11y/código) con 12 verificaciones (🟡/✅).
- Auditoría de contenido (U4.2) y compactación del Dashboard (chips capacidades, micro-chips hardware, módulo 5 ejecutivo, Header Ganadora, Cinta del Ciclo Científico).
- Encadenamiento de auditorías: Ecosistema (percepción 80%), Madurez (≈82% global), Readiness (6 listos / 4 experimentales), Consolidation (plan C1–C5), FREEZE (7 preguntas respondidas; resultado SÍ para que otra IA continúe; checklist de 9 ítems).
- Revisión Canónica de Ingeniería (10 áreas, 6 respuestas, contradicciones D1-D7, riesgos R1-R11).

### Qué quedó pendiente
- Consolidación en commits lógicos C1 (heritage) → C2 (core) → C3 (registry) → C4 (pages) → C5 (consolidación).
- Deudas reconocidas: DEBUG bar, `catch(() => [])`, `initialNodes`×3, `NEON_COLORS`, Identity, dataset físico, hexagonal 45→100%.
- Decisiones de Bernardo: implementación de la capa científica visual (research/datasets/producción) post-freeze.

### Qué sigue después
1. Validar el checklist RC-2 FREEZE (9 ítems) con Bernardo.
2. Consolidar commits C1–C5.
3. Fases 7 → 8 (cierre hexagonal, observabilidad/hardening).
4. Materializar dataset V2 → entrenar → recién entonces decidir producción.
5. UBTN U1+ (solo tras Fases 7–8).

---

## 14. Hoja de ruta académica (estudiante ADSO)

**Primero — comprender el porqué:** `README.md` + `docs/ECOSYSTEM_IDENTITY.md` (identidad, qué NO es).
**Segundo — marco del sistema:** `SIGCT_RURAL_SYSTEM_BOOT.md` + `docs/PLAN_MAESTRO.md` (fases) + `docs/MASTERDOC.md` §1 (estado hexagonal).
**Tercero — contextos:** `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` + `ADSO_GUIA...` tabla técnica.
**Cuarto — profundizar la cadena científica:** `docs/SIGCTIARURAL_RESEARCH_PRODUCTION_VISION.md` + research_v2.

**Laboratorios para dominar:**
1. Matemáticas Avanzadas V1→V2 (fundamento: por qué los mapas/rotaciones).
2. Embebidos + BBB (SENSOR→SEÑAL real).
3. Telecomunicaciones (SEÑAL→DATO: transporte edge-to-cloud).
4. Electrónica + Ciencia de Datos (DATO→DATASET: Pyodide, calidad).
5. Robótica (DECISIÓN: actuación).
6. DataScienceLab + AIPredictiva (MODELO→IA: confidence en vivo).

**Conceptos a dominar (orden de dificultad):** Bounded Context · Lenguaje Ubicuo · Context Map · Puertos/Adaptadores (hexagonal) · Strangler Fig · Event Storming · Strangler por contexto · Dataset engineering · Modelos con confianza calibrada · Honestidad de estado (real/simulación/diseño) · Meta-capa de gobernanza (EIARC).

---

## 15. Conclusión

### ¿Puede una IA continuar sola?
**SÍ**, bajo estas condiciones (verificado en la Revisión Canónica):
1. Leer en orden: RC2_FREEZE → RC2_READINESS → RC2_CONSOLIDATION → ECOSYSTEM_IDENTITY → CANONICAL_ENGINEERING_REVIEW → SYSTEM_BOOT.
2. Respetar la cadena de precedencia (§18.8-9.
3. No tocar código ni git hasta consolidar C1–C5.
4. Mantener la disciplina "documentar antes de divergir".

### ¿Qué información es imprescindible?
(1) Identidad (`ECOSYSTEM_IDENTITY.md`), (2) gobernanza y prohibiciones (`SYSTEM_BOOT.md`), (3) estado real (`MASTERDOC.md`), (4) fases (`PLAN_MAESTRO.md`), (5) contextos (`EIARC_CONTEXTS.md`), (6) freeze RC-2 (7) auditoría canónica (8) visión científica (9) índices UBTN y research_v2 (10) auditoría frontend.

### ¿Qué información puede ignorarse?
- Historicidad de `docs/historical/` y fragmentos V1/V2 (solo contexto).
- Detalies de instrumentación de backoffice pre-V3.
- Doctrina "no documentar"/borrado en docs superados (leer SOLO como advertencia de identidad, no como verdad).
- Experimentos abandonados sin trazabilidad a la cadena canónica.

---

## Resultado Final (respuestas a la Misión)

1. **Tiempo de comprensión para un nuevo ingeniero:** con esta guía + los 6 críticos, **2–4 días hábiles** para entender el norte; **1–2 semanas** para operar con confianza (contextos, hexagonal, ciclo); **1 mes** para aportar sin romper nada (gobernanza + deudas + investigación).
2. **Los 10 documentos más importantes:**
   1. `docs/ECOSYSTEM_IDENTITY.md`
   2. `SIGCT_RURAL_SYSTEM_BOOT.md`
   3. `docs/MASTERDOC.md`
   4. `docs/PLAN_MAESTRO.md`
   5. `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md`
   6. `docs/SIGCTIARURAL_RC2_FREEZE.md`
   7. `docs/SIGCTIARURAL_RC2_READINESS.md`
   8. `docs/SIGCTIARURAL_RC2_CONSOLIDATION.md`
   9. `docs/SIGCTIARURAL_CANONICAL_ENGINEERING_REVIEW.md`
   10. `docs/SIGCTIARURAL_RESEARCH_PRODUCTION_VISION.md`
3. **Las 10 verdades canónicas:** (las de la Sección 6, en orden).
4. **Mayor riesgo de perder el norte:** la **inversión de identidad** (leer EIARC como paraguas en vez de como caso de uso) sumada a la **triple enumeración de contextos** — ambos pueden hacer que una IA "arregle" lo que está deliberadamente registrado y rompa NADA DESAPARECE.
5. **Esencia en una sola frase:**
   > "SIGCTiArural es un ecosistema vivo de conocimiento verificable, agnóstico de hardware, construido sobre Bounded Contexts hexagonales, que convierte aprendizaje en evidencia y evidencia en producción — honesta en cada eslabón, con EIARC como su primer caso de uso real."

---

*Documento de transferencia y onboarding. Generado en la MISIÓN FINAL RC-2. Sin modificar código, arquitectura ni documentos existentes.*