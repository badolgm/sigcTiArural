# CANONICAL PROJECT STATE — SIGCTiArural
**Fecha de generación:** 2026-11-09
**Fuente:** Estado extraído de commits, tags, documentación canónica y consensos de sesión.
**HEAD:** 004deb8 | **Rama:** feature/cmsc-f3c-v1-implementation | **Tag:** PRE_PUSH_VALIDATED_20261103
**Última revisión:** R1–R3 (G-03 · 2026-11-17) — reconciliación de gobernanza documental (CR-A/B/C/D). Referencias de `Documentacion/` reclasificadas a memoria técnica especializada TOSHIBA (ACTIVE CMSC REFERENCE); estado del benchmark actualizado a CERRADO (2026-10-14). Sin cambios de contenido histórico.

## 1. ESTADO EJECUTIVO DEL PROYECTO

| Item | Valor | Evidencia |
|---|---|---|
| Rama activa | feature/cmsc-f3c-v1-implementation | HEAD 83b6089 sobre eff39a8, 5 commits encima de origin |
| HEAD actual | 004deb8 | `docs(runtime): document conditional docker readiness validation` |
| Tags relevantes | PRE_PUSH_VALIDATED_20261103, PRE_R1_R4_EXECUTION, PRE_DOCKER_READY_DECISION, PRE_DOCKER_READY_CONDITIONAL, PRE_DOCKER_OFFICIAL_2026_10_13, POST_AI_R2_COMPLETE | Lista completa en `git tag -l` |
| Docker | READY_CONDITIONAL | `docker-compose.yml` validado (5 servicios: db postgres, backend, ai_service, frontend, db-mysql legacy). Healthchecks configurados. Sección canónica DEPLOYMENT.md L-5 (2026-10-30). |
| Frontend | Dual: 5173 + 5174 | 5173 = legacy Docker (referencia estable, nginx, build congelado). 5174 = Vite dev server evolución activa (HMR, puerto 5174 --strictPort). `vite build` OK comprobado. |
| Backend | Django 4.2 + DRF monorepo + hexagonal parcial | Cobertura hexagonal ~15-25% (solo TelemetryHistoryV2View y AICropAdviceView usan estructura hexagonal completa). `logic/` mayo 2026 como intento Strangler Fig. Sin simplejwt en requirements actuales. |
| IA Service | FastAPI puerto 8081 | `ai_service` container Up 8081. M1 baseline (MobileNetV2) congelado. M2 challenger (EfficientNet-B0) validado: macro-F1 0.9937 · balanced acc 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · epoch 32. Sin `/infer` endpoint expuesto formalmente. |

## 2. DECISIONES CERRADAS

| Decision | Estado | Evidencia | Documento |
|---|---|---|---|
| D-L1 | CERRADA | Vocabulario unificado a `HISTORICO` con `status_alias: HISTORICAL` | `DOCUMENTATION_GOVERNANCE_REVIEW.md` §1 |
| D-L1b | CERRADA | S74: solo `nota` + `model_status` separado; no re-etiquetar `estado` | `DOCUMENTATION_GOVERNANCE_REVIEW.md` §1 |
| D-L2 | CERRADA | `/health` siempre 200; alarma = valor del campo | `DOCUMENTATION_GOVERNANCE_REVIEW.md` §1 |
| D-L3 | CERRADA | `INFERENCIA REAL` → `ANÁLISIS CON MODELO` | `DOCUMENTATION_GOVERNANCE_REVIEW.md` §1 |
| CMSC_DISCLOSURE_ALIGNMENT | CERRADA | AC-L6/AC-L8 cerrados; V-17/V-18 PASS; ModelPredictCell alineado | `CMSC_DISCLOSURE_ALIGNMENT_REPORT.md` |
| Docker R1-R4 | EJECUTADO | Remediaciones aplicadas; readiness conditional validada | `DOCKER_READY_R1_R4_EXECUTION_PLAN.md` |
| H5_CLOSED | CERRADA | Governanza H5 definida y cerrada | `H5_AI_GOVERNANCE_CLOSURE_REPORT.md` |
| M2_RECOVERED | EJECUTADO OFICIAL | EfficientNet-B0 entrenado en Colab T4. Result: macro-F1 0.9937 · balanced acc 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · epoch 32 · ~4.66 h. Artefactos `runs/M2_efficientnet_b0/` | `M1_M2_GOVERNANCE_CLOSURE_REPORT.md` |
| M1_BASELINE_M2_CHALLENGER | **CERRADO (2026-10-14)** | M1 = baseline oficial congelado. M2 = challenger validado. Evaluación cerrada; la promoción de M2 **no procede** (no supera el discriminador primario ECE). Gate M1↔M2 cerrado. | `M1_M2_GOVERNANCE_CLOSURE_REPORT.md` |
| AI_CANON_HYBRID | ESTRATEGIA DEFINIDA | Estrategia híbrida dataset acústico (External + Local + Gobernanza SIGCT-Rural) en `AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` | `AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` |
| L1-L6 | VERIFICADO | Runtime disclosure + verification cerradas; suite logger 76/76; selftest 21/21 | `L1_L6_RUNTIME_VERIFICATION_REPORT.md` |

## 3. BACKLOG OFICIAL ABIERTO

### CRÍTICO

| Ítem | Bloqueo |
|---|---|
| Decisión benchmark M1 vs M2 | M1 baseline congelado · M2 challenger validado · decisión pendiente por diseño |
| Dataset acústico Fase 1 - captura masiva | Estructura preparada estado `PREPARADO_VACIO` (0 muestras); requiere Tramo C (PCM S30) |

### ALTO

| Ítem | Bloqueo |
|---|---|
| Integración PCM S30 → Logger | Contrato de captura PCM de solo lectura compartido; valida bridge técnico pero no autoriza captura productiva |
| Extensiones schema.json partition=reference | Bump 1.2.0→1.3.0 (D5); `partition=reference` y `source=audioset` añadidos; bloquea ingesta REF |
| Regeneración registry KH con Evidence Ledger | Procedimiento documentado; pendiente cierre columna KH en restructuring plan |

### MEDIO

| Ítem | Bloqueo |
|---|---|
| Saneo licencias datasets externos (FSD50K, ESC-50, etc.) | Governanza C1 definida; 6 fuentes propuestas para capa REF; pendiente decisión Bernardo |
| Mapeo class_id ↔ dir_name unificado | Pendiente D-3 en governance acústica (4 pendientes D-2, D-3, D-4) |
| Frontend 5174 a producción/Docker | Vite dev server activo en 5174; falta validación producción; 5173 mantiene referencia estable |

### BAJO

| Ítem | Observación |
|---|---|
| GeoGebra licencia verificación | Problema identificado (nov 2025); arquitectura NO depende de GeoGebra |
| JupyterLite vs Pyodide definitivación | Diseño asume Pyodide; JupyterLite diferido; no bloquea rutas activas |

## 4. DOCUMENTACIÓN CANÓNICA

### KEEP (4 documentos - conocimiento oficial adoptado)

| Documento | Ubicación | Justificación |
|---|---|---|
| `ARCHITECTURE_AUDIT_VALIDATION.md` | `docs/architecture/` | Evidencia técnica validación arquitectura; 76/76 suite logger; sustenta decisiones KEEP |
| `ARCHITECTURE_ACTION_MATRIX.md` | `docs/architecture/` | Matriz de priorización y trazabilidad; backlog oficial recalculado; 15 ítems alineados |
| `ARCHITECTURE_ACTION_REVIEW.md` | `docs/architecture/` | Registro cumplimiento y cierre; estado acciones KEEP/MERGE/ARCHIVE |
| `C02_EXECUTION_PACKAGE.md` | `docs/architecture/` | Paquete ejecución C-02; evidencia implementación y validación PASS; `schema.json` 1.3.0 |

### MERGE (1 fusión lógica)

| Origen | Destino | Justificación |
|---|---|---|
| `C02_IMPLEMENTATION_STRATEGY.md` | `HEXAGONAL_REFACTOR_PLAN.md` | Puntos estratégicos C-02 absorbidos en plan rector; archivo original in situ rol ARCHIVE. Requiere autorización explícita. |

### ARCHIVE (7 documentos - evidencia histórica)

| Documento | Ruta | Rol |
|---|---|---|
| `ARCHITECTURE_AUDIT.md` | `docs/architecture/ARCHITECTURE_AUDIT.md` | Auditoría completada — evidencia histórica |
| `TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | `docs/historical/TOSHIBA_AUDIT_SPRINT_CLOSURE.md` | Cierre administrativo sprint |
| `DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | `docs/historical/DOCUMENTATION_LANGUAGE_NORMALIZATION.md` | Normalización lenguaje completada |
| `DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | `docs/historical/DOCUMENTATION_LANGUAGE_REMEDIATION_REPORT.md` | Remediación lenguaje completada |
| `TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | `docs/historical/TOSHIBA_KNOWLEDGE_CONSOLIDATION_REVIEW.md` | Revisión consolidación sprint |
| `TOSHIBA_EXPORT_MANIFEST.md` | `docs/historical/TOSHIBA_EXPORT_MANIFEST.md` | Manifiesto paquetes exportados sprint |
| `TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` | `docs/historical/TOSHIBA_CONSOLIDATION_EXECUTION_PLAN.md` | Plan ejecución consolidación |

> **Nota de reconciliación LOTE-4A (2026-11-18):** 6 de estos documentos ARCHIVE fueron reubicados de `docs/` a `docs/historical/` mediante `git mv` (**sin commit**); `ARCHITECTURE_AUDIT.md` permanece en `docs/architecture/`. `ECOSYSTEM_IDENTITY.md` quedó **excluido** de LOTE-4A; **resuelto (2026-11-19)** por `ECOSYSTEM_IDENTITY_RECONCILIATION` como `REFERENCE` (fundacional), sin movimiento.

### LOCAL_EVIDENCE_ONLY (1 documento)

| Documento | Ubicación | Justificación |
|---|---|---|
| `ARCHITECTURE_GOVERNANCE_REVIEW.md` | Fuera de árbol GitHub | Revisión gobernanza sprint; uso interno; no publicada GitHub |

## 5. ARQUITECTURA ACTUAL

### Frontend

| Componente | Estado | Observación |
|---|---|---|
| Puerto 5173 | Legacy Docker (referencia estable) | Imagen 22-ago-2026, nginx, build congelado. Dashboard Edge, MQTT, BBB, TFLite, Telemetría histórica. **NO representa estado actual.** |
| Puerto 5174 | Vite evolución activa | `src/frontend/src` con HMR. Dashboard en evolución, Hardware, Proyectos, Conocimiento, Labs, IA Predictiva, Knowledge Hub. `vite build` OK. |
| 15 componentes reutilizables | Existentes | TopNav, VoiceAssistant, TelemetryPanel, GlobalChart, ClusterCard, KnowledgeHubLayout, MarkdownDocumentView, docLoader, TelecomLab FFT, AdvancedMathLabV2, mathHelpers, FalstadPanel, AIPredictiva, useLabStore, ErrorBoundary |
| 7 adaptadores mínimos | Creados | Saneo clima/BBB/robot R1-R3, signalRegistry declarativo, vista-catálogo mapa S01..S80 |
| Visual Freeze Aprobado | 2026-10-04 | §12 `CMSC_ORCHESTRATION_V2_DESIGN.md`. Sin autorizar implementación nueva. |

### Backend

| Capa | Estado | Observación |
|---|---|---|
| Django 4.2 + DRF | Operativo | 5 servicios docker-compose (db, db-mysql legacy, backend, ai_service, frontend). DEBUG=True por defecto. AllowAll universal (modo demo). |
| Capa hexagonal | Intentos parciales (~15-25%) | `logic/` mayo 2026 Strangler Fig. `contexts/{telemetry,labs}/` + `wiring.py` cableando Telemetry→Labs por eventos. `core/domain/` no totalmente consolidado. |
| AI adapter | FastAPI + fallback | `/assist` (voz+PG), `/health`. TensorFlow CPU 2.15. `production_models/plant_disease_mbv2.h5` → ROTO (doble normalización). |
| Tests | Characterización básica | Suite logger 76/76; selftest 21/21. Sin characterization tests extensos. |
| Drift docs-código | Identificado | Docs mencionan Channels, daphne, JWT real, /infer que no existen en requirements/settings actuales. |

### AI Service (puerto 8081)

| Endpoint | Estado | Observación |
|---|---|---|
| `/health` | 200 PASS | Valida D-L2 |
| `/assist` | Voz + PG | Modo mock cuando TF no disponible |
| `/analyze-circuit` | Disponible | Consumo por RealSignalAnalysis |
| `/infer` | **No expuesto** | Esperado por adapter/frontend; bloqueo deliberado hasta decisión |

### Bridge

| Componente | Estado | Observación |
|---|---|---|
| Node ESM server 127.0.0.1:8766 | Creado y validado | `BRIDGE_PORT=8766`, `BRIDGE_ORIGIN` whitelist localhost:5174/127.0.0.1:5174. `GET /health` · `GET /stats` · `POST /ingest` multipart. Reutiliza `ingestWav()` de `src/ingest.js`. |
| Validación functional dry_run | 84/84 suite logger OK | 44 dims features acoustic.feat.v2; 10 checks AC-1..10 verdes. C0 intacto 1/1/1 tras dry-run. |
| Modo producción | Bloqueado | `127.0.0.1:8765` = VALIDACIÓN TEMPORAL; descartado arquitectura final. Flujo oficial: S30 → Logger → Dataset → Validación → S81 → S82 → Knowledge Hub. |

### Knowledge Hub

| Elemento | Estado | Observación |
|---|---|---|
| Registry 51 docs | Operativo | `knowledgeRegistry.generated.json` en 6 categorías: project-core 7 · eiarc-architecture 13 · eiarc-foundation 3 · research-v2 18 · knowledge-base 6 · historical 4 |
| Evidence Ledger | DISEÑO | Bifurcación controlada doc. en `CMSC_F3E_KNOWLEDGE_INTEGRATION_STRATEGY_v1.md`. Sin escritura ad-hoc. |
| Knowledge Graph | Declarativo por lectura | Nodos: Señal/Evidencia/Documento/Modelo/Lab/Productor. Aristas: produce/evidencia/documenta/sustenta/modela/usa/reporta/impacta. |

### Labs

| Laboratorio | Estado | Observación |
|---|---|---|
| MathV2 | SIM | Simulador matemático; sin ejecución activa sin comando explícito. |
| ElectronicsLab | SIM | Falstad-based. CircuitSimulationPort + FalstadAdapter validados. |
| TelecomLab | REAL-LOCAL | Mic S30 con DSP local FFT radix-2 4096 + Hann. Señal real persistente. |
| RoboticsLab | SIM | RobotTelemetry S50 estado REAL; cliente localhost:8000 ROTO. |
| ACP | Determinista | Orquestador científico sin LLM. Núcleo H1-H10 honestidad. |

## 6. IA Y MODELOS

| Atributo | Valor | Evidencia |
|---|---|---|
| Modelo activo | M1 (MobileNetV2) baseline oficial | Congelado; no re-entrenar. `plant_disease_mbv2.h5` descalificado. |
| M2 (EfficientNet-B0) | Challenger validado | macro-F1 0.9937 · balanced acc 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · epoch 32. Artefactos `runs/M2_efficientnet_b0/`. |
| model_status | M1=CONGELADO, M2=VALIDADO | `model_card.md` no existe para modelos acústicos. |
| artifact_id | `plant_disease_mbv2.h5` (M1) / `M2_efficientnet_b0` (M2) | M1: ROTO (doble normalización `fastapi_app.py:192`). M2: checkpoint pth en `runs/`. |
| scientific_scope | Clasificación señales S01..S80 + 9 clases acústicas | SILENCIO, VIENTO, LLUVIA, AGUA, INSECTOS, AVE, VOZ, MOTOR, RUIDO DESCONOCIDO. |
| class_space | 9 clases + RUIDO DESCONOCIDO (OOD bucket) | `ruido_desconocido` = bucket OOD, no se captura a demanda. |
| ONNX | No exportado | Ni M1 ni M2 tienen versión ONNX/onnxruntime-web. `ml-v1-tabular` (HistGB/LogReg) reservado a V2. |
| Holdout | Dataset V2+ split 15.741/3.373/3.374 seed 42 | 22.488 imgs/16 clases/3 especies. `holdout/real_world_holdout_v1/` reservado. 0 muestras en vivo. |
| Riesgos científicos abiertos | 4 pendientes | 1) Captura masiva dataset acústico (G-DS-2). 2) `window_schema` dimensión S81 sin decidir (OBS-09). 3) Estructura misión vs A.7 (OBS-01/02). 4) Remuestreo no declarado (OBS-06). *(La decisión benchmark M1/M2 quedó **CERRADA** el 2026-10-14.)* |

## 7. DOCKER

| Estado | Evidencia |
|---|---|
| READY_CONDITIONAL | Commit `004deb8` valida `docker-compose.yml` con 5 servicios. Healthchecks: pg_isready (db), GET /api/health/ (backend). Sección canónica DEPLOYMENT.md L-5 (2026-10-30) declara despliegue real. **No es READY** por pending: D-L5 depende reescritura O-3, G-DS-1 FAIL por 7 mids UNVERIFIED, G-DS-2..6 PENDING. |
| READY | No alcanzado. Pendientes: reescritura DEPLOYMENT.md O-3, cierre G-DS-1, validación κ real sin etiquetas individuales. |
| NOT_READY | No aplica; docker funcional pero con deudas pending. |

## 8. GOBERNANZA

### Documento fundacional

| Ámbito | Autoridad | Referencia |
|---|---|---|
| Misión · visión · propósito · principios fundacionales | **CONSTITUCIÓN** | `docs/CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md` (v1.0.1) |
| Gobernanza de IA (reglas de actuación de toda inteligencia) | **CARTA IA** | `docs/CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md` (v1.0.1) |
| Navegación del ecosistema (componentes · capas · actores · flujos · dominios · roadmap) | **MAPA MAESTRO** | `docs/MAPA_MAESTRO_ECOSISTEMA_SIGCT_RURAL_V1.md` (v1.0) |
| Resolución de conflictos documentales | **D-003** | `docs/DOCUMENTATION_ARCHITECTURE_DECISION_V1.md` |

La Constitución es el documento fundacional del ecosistema: define misión, visión, propósito y principios fundacionales. **NO modifica D-003**; D-003 continúa siendo la autoridad para resolver conflictos documentales (jerarquía: `docs/` › `CANONICAL_PROJECT_STATE_20261109.md` › `AGENTS.md` › `DOCUMENTATION_GOVERNANCE_REVIEW.md` › `MASTERDOC.md` › `Documentacion/`). La prioridad de la Constitución aplica a los artefactos operativos (datasets, modelos IA, LLMs, dashboards, S81, laboratorios, integraciones futuras y agentes), nunca a la jerarquía entre documentos canónicos.

La **Carta de Gobernanza IA** es el documento canónico **subordinado** a la Constitución que gobierna la actuación de toda inteligencia del ecosistema. **Complementa** la Constitución; **no la sustituye, no la modifica y no altera D-003**. Cadena de autoridad: `CONSTITUCIÓN → CARTA IA → ACP → LLM / INTERPRETE → EVIDENCE LEDGER → KNOWLEDGE HUB`. Veredictos de respuesta unificados con el ACP (`RESOLVED` · `PARTIAL` · `NO_DATA` · `BLOCKED` · `UNANSWERABLE`); **`HIPÓTESIS`** = nuevo veredicto predictivo **PENDIENTE DE G-IA-1**, **no activo** y **no confundible con los 7 estados de honestidad**.

El **Mapa Maestro** es el documento canónico de **navegación** del ecosistema. **Solo describe** (componentes · capas · actores · flujos · dominios · roadmap); **no crea gobernanza nueva** y **no modifica** la Constitución, la Carta IA ni D-003. Reparto de autoridad: **CONSTITUCIÓN → misión · visión · propósito · principios** · **CARTA IA → gobernanza IA** · **MAPA MAESTRO → navegación del ecosistema** · **D-003 → conflictos documentales**.

### Fuentes de verdad (canónicas, priority 1)

| Documento | Rol | Ámbito |
|---|---|---|
| `CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md` | **Documento fundacional** (misión, visión, propósito, principios fundacionales) | Nivel ecosistema; norma superior frente a artefactos operativos |
| `CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md` | **Gobernanza de IA** (reglas de actuación de toda inteligencia) | Nivel ecosistema; subordinado a la Constitución; no altera D-003 |
| `MAPA_MAESTRO_ECOSISTEMA_SIGCT_RURAL_V1.md` | **Navegación** (componentes · capas · actores · flujos · dominios · roadmap) | Nivel ecosistema; descriptivo; sin gobernanza nueva |
| `AGENTS.md` | Identidad, estado git, decisiones, cadencias | Nivel proyecto general |
| `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` | Gobernancia dataset acústico | S30/S81/S82, features, splits, gates G-DS-1..6 |
| `DOCUMENTATION_GOVERNANCE_REVIEW.md` | Clasificación KEEP/MERGE/ARCHIVE/OBSOLETE | L1-L6 + Docker-ready |

> **Punto único de entrada oficial: `docs/`** (D-001). `Documentacion/` es **memoria técnica especializada TOSHIBA**; no es punto de entrada ni fuente normativa.

### Referencias legacy activas (memoria técnica especializada TOSHIBA — `Documentacion/`)

Documentos preservados de `Documentacion/` con valor operativo **no normativo**. Estado G-02: `ACTIVE` (ver D-006). Categoría de referencia: **ACTIVE CMSC REFERENCE**. No son punto de entrada, no son documentos canónicos y no son históricos.

| Documento | Estado | Rol |
|---|---|---|
| `CMSC_CANONICAL_STATE_v1.md` | ACTIVE CMSC REFERENCE | Arquitectura, labs, filosofía (memoria técnica especializada TOSHIBA) |
| `CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` | ACTIVE CMSC REFERENCE | Verificación de preparación; 6 condiciones bloqueantes, veredicto SÍ condicionado |

### Documentos secundarios (priority 2)

| Documento | Rol | Cuándo consultar |
|---|---|---|
| `AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` | Estrategia híbrida dataset | Decisiones C1/C2 fuentes externas |
| `CMSC_ORCHESTRATION_V2_DESIGN.md` | Arquitectura zona orquestación V2 | Visual freeze, pipeline fases F1→F5 |
| `DOCUMENTATION_CONSOLIDATION_PLAN.md` | Plan consolidación documental | Clasificación y ubicaciones actuales |
| `HEXAGONAL_REFACTOR_PLAN.md` | Plan refactor hexagonal | Fase 0-8, decisiones pendientes |
| `SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` | Arqueología ecosistema | Veredicto rescate, evolución cronológica |

### Flujo de consulta recomendado

**Onboarding canónico (en orden):**

1. Constitución: `CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md` (misión · visión · propósito · principios)
2. Carta IA: `CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md` (gobernanza IA)
3. Mapa Maestro: `MAPA_MAESTRO_ECOSISTEMA_SIGCT_RURAL_V1.md` (navegación del ecosistema)
4. Canonical Project State: `CANONICAL_PROJECT_STATE_20261109.md` (estado canónico del proyecto)
5. AGENTS: `AGENTS.md` (identidad, estado git, decisiones, cadencias)

**Consulta temática:**

6. CMSC general: `CMSC_CANONICAL_STATE_v1.md` (memoria técnica especializada TOSHIBA — ACTIVE CMSC REFERENCE)
7. Dataset acústico: `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` → `AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md`
8. Docker readiness: `DOCUMENTATION_GOVERNANCE_REVIEW.md` §7 + `DEPLOYMENT.md` L-5
9. Documentación clasificada: `DOCUMENTATION_CONSOLIDATION_PLAN.md` (tabla completa)
10. Implementación CMSC: `CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` (memoria técnica especializada TOSHIBA — ACTIVE CMSC REFERENCE) + `CMSC_F3A_INTERCONNECTION_BLUEPRINT_v1.md`

## 9. SIGUIENTE MISIÓN RECOMENDADA (por prioridad)

1. ~~**M1/M2 benchmark decisión definitiva**~~ **CERRADA (2026-10-14)** — M1 permanece baseline oficial congelado; M2 permanece challenger; la promoción de M2 **no procede** (no supera el discriminador primario ECE). Evidencia: `M1_M2_GOVERNANCE_CLOSURE_REPORT.md`.

2. **Tramo C - Captura masiva dataset acústico** (CRÍTICO)
   - Handoff CLI→Dataset contrato PCM S30
   - Validación G-DS-1 (7 mids UNVERIFIED) y G-DS-2 (100≠150/clase)
   - **Dependencia:** Puente bridge validado + decisiones D-1..D-4

3. **Saneamiento governance acústica pendientes D-2..D-4** (ALTO)
   - D-2: umbral near-dup; D-3: class_id↔dir_name; D-4: erratas `AI_ACOUSTIC_DATASET_V1_DESIGN.md`
   - **Dependencia:** Gates G-DS-1..6 estabilizados

4. **Frontend 5174 validación producción** (MEDIO)
   - Validar `vite build` producción
   - Migrar configuraciones 5173 → 5174
   - **Dependencia:** No bloquea backend/AI

5. **Régimen licencias datasets REF H2/H3** (MEDIO)
   - Definir vocabulario `schema.json` extensions (partition, source, license)
   - Aprobar/desechar fuentes: FSD50K, ESC-50, Xeno-canto, SONYC, Speech, BirdCLEF, AudioSet
   - **Dependencia:** Decisión Bernardo (3 bloques H0 condicionados)

**Ordenamiento:** Misiones 1 y 2 críticas y dependientes (no se pueden ejecutar 3 sin avance en 1/2). Misión 3 estabiliza gobernanza. Misiones 4 y 5 mejoras continuas no bloqueantes.

---
*Fotografía canónica verificada. HEAD `004deb8`; `stash@{0}` intacto. No se realizaron modificaciones al repositorio durante la redacción; solo extracción y presentación de estado existente sobre base de commits, tags, documentación canónica y consensos de sesión.*

## Referencia cruzada: Decision Arquitectonica V1
- Consulte docs/DOCUMENTATION_ARCHITECTURE_DECISION_V1.md para la decision oficial de governance documental.
