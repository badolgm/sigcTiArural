# SIGC&T Rural — Revisión Canónica de Ingeniería

**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Tipo:** Auditoría profunda de ARQUITECTURA · DISEÑO · DOMINIO · CONTEXTOS · GOBERNANZA · TRAZABILIDAD.
**Principio supremo aplicado:** LA DOCUMENTACIÓN CANÓNICA ES LA FUENTE DE VERDAD. Toda contradicción observada se registra, no se corrige, no se modifica.
**Naturaleza:** revisión académica (Ingeniería de Software / Arquitectura Empresarial), con trazabilidad documental verificada en el repositorio (2026-09-15).

---

## 0. Alcance y método

Se auditaron los documentos canónicos enumerados por la misión y, por trazabilidad, sus dependencias directas: `README.md`, `SIGCT_RURAL_SYSTEM_BOOT.md`, `docs/MASTERDOC.md`, `docs/PLAN_MAESTRO.md`, la familia `docs/UBTN_*.md` (26 documentos), `docs/ECOSYSTEM_IDENTITY.md`, la guía ADSO hexagonal, los renderidos de ingeniería RC-2 (`SIGCTIARURAL_RC2_FREEZE/READINESS/CONSOLIDATION`), la visión científica (`SIGCTIARURAL_RESEARCH_PRODUCTION_VISION.md`) y la auditoría de arquitectura frontend (`SIGCTIARURAL_FRONTEND_ARCHITECTURE_AUDIT.md`).

Método: lectura sistemática + verificación cruzada de enumeraciones, reglas de precedencia, contradicciones de identidad, vacíos de trazabilidad y coherencia código↔documentación. Sin modificaciones.

---

## 1. Identidad del proyecto

### Qué ES
La definición canonical vigente (fuente: `docs/ECOSYSTEM_IDENTITY.md`) lo enuncia como:

> "Ecosistema vivo de conocimiento verificable donde formación, investigación, inteligencia artificial, laboratorios y telemetría convergen para transformar aprendizaje en evidencia, y evidencia en conocimiento — construido sobre Bounded Contexts, agnóstico de hardware y software."

`README.md:26-26` lo describe como ecosistema autónomo y agnóstico que integra IoT, IA, laboratorios interconectados y educación técnica para la agricultura sostenible e inclusión tecnológica rural de Colombia.

### Qué NO ES
- No plataforma, no aplicación, no dashboard aislado, no laboratorio, no IA (`ECOSYSTEM_IDENTITY.md:11`).
- No LMS (Principio 3) y no plataforma IoT (Principio 4 — IoT es instrumento, no identidad).

### Misión
Transformar aprendizaje en evidencia y evidencia en conocimiento verificable; operar como instrumento de I+D+i (caso SENA/ADSO) sobre entornos vivos rurales.

### Visión
El ecosistema demostrándose a sí mismo: **EIARC como primer caso de uso productivo real** — «el ecosistema funcionando como proyecto productivo», no como marco abstracto (identidad invertida: EIARC ya no es el paraguas; EIARC es la materialización productiva).

### Hallazgo registrado (no corregido)
- `README.md:348` todavía describe a SIGC&T como "evoluciona dentro de una línea arquitectónica más amplia llamada EIARC" — formulación **que la identidad canonical invirtió** (registrado en `SIGCT_RURAL_SYSTEM_BOOT.md:10-11`). Convivio en el repositorio de dos sentidos del término EIARC: (A) marco arquitectónico/7 contextos, (B) expansión productiva Fase 9 (0% avance).

---

## 2. Modelo arquitectónico (explicación académica)

### Patrón de referencia: Modular Monolith con límites hexagonales por bounded context
`docs/PLAN_MAESTRO.md:35` fija el objetivo: **Módulo monolítico con lógica por contexto, cada contexto con su propio dominio/puertos/aplicación/infraestructura**, compartiendo un runtime Django. Excepción declarada: el servicio de IA (FastAPI + TensorFlow) permanece como límite físico independiente (`PLAN_MAESTRO.md:37`).

**Fundamentación academica del patrón:**

- **DDD (Evans):** el dominio se organiza en **Bounded Contexts** con **Lenguaje Ubicuo**. Cada contexto delimita su modelo, evitando el Big Ball of Mud.
- **Hexagonal (Ports & Adapters / Cockburn):** el dominio es inocente de la infraestructura; la comunicación entra/sale por **puertos** (interfaces de la aplicación) y **adaptadores** (persistencia, HTTP, MQTT). Inversión de dependencias: el dominio no conoce a Django ni a PostgreSQL.
- **Estrategia de migración:** **Strangler Fig + Branch by Abstraction** (`MASTERDOC.md §2.5`) — se reemplaza el monolito V1 por pedazos hexagonales V3 sin cortar el servicio en un salto único.
- **Estado verificado de la refactorización:** `MASTERDOC.md §1.1` documenta **tres capas coexistentes** (V1 legado · V2 `@deprecated_legacy` · V3 hexagonal `core/domain/` + `infrastructure/`), **58 pruebas identificadas y 56 en verde**, con cobertura hexagonal estimada entre **15–25%**. Progreso general: **Fase 7 en 45%, Fase 8 en 15%, Fase 9 planificada (0%)** (`PLAN_MAESTRO.md:322-332`).

### Términos del modelo (estado real verificado)
| Término | Estado en el proyecto |
|---|---|
| Bounded Contexts | Existentes y enumerados (ver §3) |
| Agregados | Diseñados para UBTN (`UBTN_AGGREGATE_DESIGN.md`) — no implementados |
| Entidades / Value Objects | Modelados tácticamente en UBTN (`UBTN_DOMAIN_MODEL.md`) — diseño puro |
| Eventos | Event Storming documentado (`UBTN_EVENT_STORMING.md`); `EventBusPort` **MATERIALIZADO** (Día 16-17, `ADSO_GUIA...:193`); sin bus productivo |
| Repositorios | `SensorReadingRepositoryPort` existente (Telemetry); **protegido** (prohibido extenderlo para bioseñales, ADR-UBTN-01) |
| Casos de uso | Documentados (`UBTN_USE_CASES.md`) por especie — diseño |
| Infraestructura | Django (runtime principal) + FastAPI (IA) + PostgreSQL 15 + Docker Compose |

### Lectura académica
El proyecto transita de **etapa de consolidación de deuda** (V1/V2)V3) hacia **DDD táctico en los nuevos subdominios** (UBTN). El invariante que sostiene la transición es la **instrumentación `@deprecated_legacy`** (`MASTERDOC.md §2.4`): el código antiguo queda marcado, nunca eliminado — coherencia con el principio NADA DESAPARECE.

---

## 3. Mapa de Contextos

### Contextos existentes (conciliación técnica verificada — `ADSO_GUIA...:237-255`)
| Contexto | Naturaleza | Evidencia de código |
|---|---|---|
| **Telemetry** | Bounded Context (el más maduro) | Backing code documentado; Telemetry V3 |
| **Labs** | Bounded Context | Backing code documentado |
| **AI (`ai_advisory`)** | Bounded Context | Backing code + servicio FastAPI |
| **Identity** | Bounded Context | Diseño/parcial; **deuda: no existe como contexto materializado** (UBTN_AUDIT_REVIEW A-6) |
| **Knowledge** | Bounded Context (absorbe Cursos) | KH (51 docs registry) |
| **IoT** | Bounded Context (instrumento) | Diseño/documentación |
| **Conocimiento vs Cursos** | Cursos absorbidos por Knowledge (registrado, "contenido académico") | — |
| **Deployment** | NO contexto — infraestructura/DevOps | — |
| **Notifications** | NO contexto — shared_kernel transversal | — |
| **EIARC** | Meta-capa de gobernanza (no contexto par) | Audita y da coherencia |

### Contradicción registrada (sin corregir)
Existen **tres enumeraciones** en la documentación viva:
1. **7 contextos oficiales EIARC** (`docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md`: Telemetry, AI, Labs, Knowledge, Identity, IoT, Deployment).
2. **6 contextos reconciliados** (Día 6-7: Labs, Telemetry, AI, Knowledge, Identity, EIARC) — registrado en `SYSTEM_BOOT.md:28`.
3. **Conciliación técnica** (`ADSO_GUIA...`): Labs, Telemetry, AI, Identity, Knowledge, IoT + meta-capa EIARC.

En las tres, **Telemetry es contexto** — invariante estable.

### Flujo de información dominante
Señal (edge) → Telemetry Context (ingestión V3) → AI Context (inferencia) → Knowledge (evidencia documental) → Labs (experimentación) → decisión → producción. UBTN entra como contexto **hermano** `bio` de Telemetry (ADR-UBTN-01), consumiendo telemetría sin tocar `SensorReading`/`sensor_reading`.

---

## 4. Ciclo científico (lo que existe, lo en desarrollo, la visión)

```
SENSOR → SEÑAL → DATO → DATASET → MODELO → IA → DECISIÓN → PRODUCCIÓN
```

| Eslabón | Estado | Evidencia |
|---|---|---|
| SENSOR | ✅ Existe | BBB-01/02/03 + sensor road; catalog-data.js |
| SEÑAL | ✅ Existe | TelemetryPanel (MiniSparkline) + source_mode LIVE/SIM |
| DATO | ✅ Existe | `/api/v3/telemetry/history/` + Open-Meteo |
| DATASET | 🟡 En desarrollo (diseño) | 8 docs research_v2 (inventory, data_quality, label, split); sin dataset físico materializado |
| MODELO | 🟡 Demo | `binary_only` + `confidence`/`model_version` (AIPredictiva) |
| IA | 🟡 Demo real | Inferencia POST `/api/v3/ai/inference/` + SSE `/events` |
| DECISIÓN | 🟡 Diseño | `getStatusPresentation` (recomendación binaria) |
| PRODUCCIÓN | 🔴 Visión futura | 0 datos reales (grep: 0 matches producción/rendimiento/parcela) |

**Registro:** los eslabones 1-3 son instrumentación real; 4-7 son documentos/demos honestas; 8 es visión. La cinta del Dashboard (bloque 1a) pinta estos eslabones con su estado real — coherente con la visión.

---

## 5. IA y Machine Learning

### Estado actual
- **Inferencia real:** POST `/api/v3/ai/inference/` contra FastAPI; clasificación binaria saneada/enferma con `confidence`, `model_version`, `scientific_scope: binary_only`.
- **Telemetría:** V3 viva, contingencia simulada explícita; edge TFLite en BBB-02.
- **research_v2 (18 docs):** programa de investigación IA: dataset strategy, training pipeline, MLOps governance, benchmark readiness (GO sin dataset físico), prediction validation, scientific correction design.
- **Backing:** `ai_advisory` context; port `AIServicePort` (base para extender).

### Fortalezas
- Vocabulario científico honesto (`binary_only`, `source_mode`, "Escenario demostrativo").
- Auditabilidad: 18 docs de programa de investigación + 6 KB audits + 4 históricos.
- SSE de métricas en vivo (`DataScienceLab`): experimentación observable en el navegador.

### Limitaciones (registradas)
- Sin dataset físico → sin modelo entrenado → sin inferencia productiva.
- Scope binario (una sola dolencia, demo); sin multiclase, sin validación cross-dataset.
- El `benchmark_readiness` marca GO en artefactos pero **condicionado a la materialización del dataset**.

---

## 6. Investigación científica

### Fuentes y documentos
- 51 docs registry (18 `research_v2` + 6 KB + 13 EIARC-architecture + 4 históricos + core).
- Documentación de investigación formal en `docs/ai/research_v2/` (taxonomía, datasets, splits, ejecución).

### Labs
8 laboratorios reales: Robótica, Matemáticas Avanzadas (V1/V2), Embebidos, Telecom, Electrónica (Falstad), Ciencia de Datos (Pyodide) + laboratorios del catálogo UBTN.

### Datasets y experimentos
- Datasets: inventario y framework de calidad **documentados, no físicos**.
- Experimentos: registros SSE en DataScienceLab (confidence en vivo), demo AIPredictiva; sin registro persistente canónico.

### Líneas de trabajo
1. Agricultura-IA V2 (datasets, taxonomía, benchmark).
2. IA Pipeline + MLOps governance.
3. UBTN (bioseñal rural) — investigación/backlog (`UBTN_RESEARCH_BACKLOG`, `UBTN_RESEARCH_GAPS`).
4. Cielo completo (visión `RESEARCH_PRODUCTION_VISION.md`).

---

## 7. Producción — real vs. referencia vs. simulación vs. diseño

| Clase | Qué es | Evidencia |
|---|---|---|
| **Real** | Telemetría activa (cuando el backend entrega), labs edge, conocimiento/learning layer | BBB + registry + learning resources oficiales |
| **Referencia** | Catálogo de hardware (10 fichas `reference/construction`), Learning Layer | catalog-data.js |
| **Simulación** | source_mode `simulated`, escenarios demo AIPredictiva (conf 0.97/0.96), Pyodide tabs | AIPredictiva DEMO_SCENARIOS |
| **Diseño** | Producción agrícola (AGRICULTURA-INTELIGENTE), UBTN despliegue, datasets, Fase 9 | projects-data.js (`diseño`), UBTN docs |

**Veredicero:** producción agrícola = **diseño** deliberado y honesto; nada real ni simulado se presenta como productivo. Invariante de verdad.

---

## 8. Coherencia documental — contradicciones, duplicaciones, vocabulario

| # | Clase | Hallazgo (registrado, NO corregido) |
|---|---|---|
| D1 | Contradicción de identidad | README:348 "SIGCT dentro de EIARC" vs. ECOSYSTEM_IDENTITY (EIARC caso de uso de SIGCT) — inversión ya señalada en SYSTEM_BOOT |
| D2 | Contradicción de contexto | 3 enumeraciones de contextos (7 EIARC / 6 reconciliados / tabla ADSO) |
| D3 | Vocabulario divergente | "Cursos y contenido académico" (MASTERDOC §2.8) vs. "Knowledge absorbe cursos" (tabla ADSO) |
| D4 | Sinonimia EIARC | EIARC=marco arquitectónico (A) vs. EIARC=expansión productiva Fase 9 (B) — registrada en README:348 |
| D5 | Documentos superados | MASTERDOC/PLAN_MAESTRO llevan "DOCUMENTO SUPERADO (20-jul-2026)"; SYSTEM_BOOT trae tabla de vigencia sección a sección — coherencia gestionada |
| D6 | Duplicación de definición NEON_COLORS | ≥5 copias en frontend (reconocida en RC-2_READINESS) |
| D7 | Duplicación de identidad visual/header nav | TopNav vs. Sidebar Dashboard (triple navegación, reconocida) |

**Evaluación de la gestión:** las contradicciones **se documentan deliberadamente** (no se ocultan) — esto es un control de gobernanza válido, aunque añade coste de lectura. La duplicación estructural (D6/D7) es deuda de implementación, no de documentación.

---

## 9. Coherencia código ↔ documentación

| Verificación | Clasificación | Detalle |
|---|---|---|
| El código implementa la *visión* documentada (ecosistema, cadena honesta) | 🟡 AMARILLO | Frontend expone el ciclo; backend hexagonal V3 15-25% — la visión está **poblada pero no completa** |
| Telemetry Context: documento ↔ código | 🟢 VERDE | Menor madurez, evidencia consistente (11: evidence per change; backing code ok) |
| UBTN: documentos (26) ↔ código | 🟢 VERDE (diseño) | Diseño puro sin código nuevo — coherencia por construcción (U0 cerrada) |
| Knowledge Hub: spec ↔ registry (51 docs) | 🟢 VERDE | Registry generado, rutas funcionando |
| Learning Layer: `resources[]` ↔ fichas | 🟢 VERDE | 18 recursos oficiales verificados |
| Navegación: documentado ↔ implementado | 🟡 AMARILLO | Triple fuente de verdad (TopNav/Sidebar/DEBUG) + `initialNodes`×3 |
| Producción: visión ↔ código | 🔴 ROJO | Intencionalmente ausente (0 datos reales) — visión no se implementa hasta tener datos |
| Fase 7 (hexagonal) en código | 🟡 AMARILLO | 45% conforme MASTERDOC; tres capas coexistentes |

**Conclusión de la verificación:** el frontend implementa la visión documentada con fidelidad **descriptiva** (honestidad de estados, cadena visible). La brecha principal es de **profundidad** (hexagonal incompleto, produción ausente por diseño), no de contradicción de rumbo.

---

## 10. Riesgos futuros

### Arquitectónicos
- R1: Tres capas coexistentes V1/V2/V3 → riesgo de divergencia si la Fase 7 no avanza (45% estancada).
- R2: Deuda de Identity (ausente) bloquea modelos que exigen `FacilityId`/yaudi (UBTN_AUDIT_REVIEW A-6).
- R3: Triple enumeración de contextos → riesgo de implementar el modelo equivocado sin herencia explícita.

### Científicos
- R4: Dataset no materializado → el programa de investigación V2 (GO parcial de benchmark) exige datos físicos para sostener cualquier métrica.
- R5: `binary_only` el diseña no escala a revisión de campo multiclase sin reentrenamiento.

### Académicos (SENA/ADSO)
- R6: Entrega académica depende de evidencia trazable → la documentación viva es activo, pero la **inercia documental** (98 cambios sin commits en rama) es un riesgo de un solo punto de falla.
- R7: Progreso % (45/15/0) sin denuncia externa de línea base.

### Tecnológicos
- R8: `catch(() => [])` silencioso y fallbacks (initialNodes) pueden enmascarar degradación.
- R9: Dependencias CDN (Pyodide/Plotly) → offline rompe el data lab.

### Operativos
- R10: Runtime local no verificable (React 18 vs fiber/drei) — heteros independientes son la única referencia.
- R11: Modelo de sesión "Invitado" sin auth real activa en producción.

---

## Resultado final

### 1. ¿La documentación actual es suficiente para continuar el proyecto durante años?
**SÍ**, con matices. La profundidad documental (16 canónicos + 26 UBTN + ~10 auditorías RC) da continuidad operativa y gobernanza explicable; sin embargo, la continuidad a años exige **desatascar la deuda material** (hexagonal, dataset, Identity) y **normalizar el estado git** (98 entradas sin commit) como disciplina de largo plazo.

### 2. ¿Qué documento es el más importante?
**`docs/ECOSYSTEM_IDENTITY.md`** — es el único que resuelve la identidad (qué es / qué no es / EIARC) declarada como principio supremo; sustenta todas las demás decisiones de coherencia y precedencia. (En redes de precedencia, SYSTEM_BOOT es el índice; la identidad es el juicio.)

### 3. ¿Qué documentos son críticos?
1. `SIGCT_RURAL_SYSTEM_BOOT.md` (gobernanza + reglas de precedencia + prohibidos).
2. `docs/MASTERDOC.md` (bitácora única, estado hexagonal, decisiones).
3. `docs/PLAN_MAESTRO.md` (fases/roadmap, autoridad de fase).
4. `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md` (mapa de contextos).
5. `docs/ECOSYSTEM_IDENTITY.md` (identidad — vértice).
6. `docs/SIGCTIARURAL_RC2_FREEZE.md` (estado congelado actual + cómo retomar).

### 4. ¿Cuáles están duplicados?
- `NEON_COLORS` (≥5 archivos) — duplicación de implementación.
- Navegación (TopNav + Sidebar + DEBUG) — triple, reconocida.
- Enumeración de contextos (3 versiones) — duplicación documental de definición.
- `initialNodes` (App/Dashboard/TopNav) — 3 fallbacks.
- Nota: MASTERDOC/PLAN_MAESTRO duplican el aviso de "superado" (marcadores de advertencia), pero ambos remiten al mismo autoritativo — duplicación controlada.

### 5. ¿Cuál es la principal verdad arquitectónica de SIGCTiArural?
**"SIGCTiArural es un Ecosistema Vivo de Conocimiento Verificable construido sobre Bounded Contexts (DDD + Hexagonal), agnóstico de hardware, donde EIARC es su primer caso de uso productivo real, y donde la honestidad de estado (real/referencia/simulación/diseño) es un invariante de dominio, no una opción de UI."** Todo el resto (fases, contextos, ciclo científico, producción en diseño) desciende de esta verdad.

### 6. ¿Puede una IA futura continuar el proyecto sin perder el norte?
**SÍ.**

**Justificación técnica:**
- **Determinismo documental:** la cadena SYSTEM_BOOT → MASTERDOC → PLAN_MAESTRO → ECOSYSTEM_IDENTITY → RC2_FREEZE define identidad, gobernanza, precedencia y estado congelado, con reglas formales (régies de precedencia 1-5, prohibiciones §14). Una IA puede reconstruir el "por qué" sin ambigüedad sobre la identidad.
- **Trazabilidad de deuda:** contradicciones D1-D7 están *registradas con fuente y status* — no son trampas ocultas sino decisiones documentadas.
- **Trazabilidad de código:** frontend autocontenido (registry, catalog-data, App); invariantes de honestidad ejecutables en el código mismo.
- **Condiciones de certeza:** para que el "sí" sea robusto a años, (a) la IA debe leer el freeze + los 6 críticos antes de tocar código; (b) se debe normalizar el commit de la rama (98 entradas) bajo las reglas de consolidación RC-2; (c) la disciplina "documentar antes de divergir" (regla 8-9 SYSTEM_BOOT) debe mantenerse o el modelo evoluciona como teoría sin evidencia.

**Conclusión canónica:** **SÍ — la documentación es suficiente para mantener el norte y delegar continuidad a una IA futura, siempre que se respete la cadena de precedencia y se materialicen las deudas registradas (hexagonal 45%, dataset, Identity, estado git).**

---

*Documento de auditoría canónica. Ningún archivo de código ni documental fue modificado durante esta revisión. Sin commits.*