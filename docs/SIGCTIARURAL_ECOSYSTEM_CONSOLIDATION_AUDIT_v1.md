# SIGCTIARURAL_ECOSYSTEM_CONSOLIDATION_AUDIT_v1

**Fecha:** 2026-10-11
**Alcance:** SOLO AUDITORIA FINAL (documental, sin modificar codigo, sin commits, sin push)
**Rama actual:** feature/cmsc-f3c-v1-implementation (25 commits ahead de origin/feature/cmsc-f3c-v1-implementation)
**Estado Git:** limpio (0 cambios pendientes tras commits locales de Tramo B+C)

## 1. CONTEXTO CONFIRMADO
- ? GO_TRAMO_B_FINAL / GO_TRAMO_C_FINAL
- ? Bridge implementado y validado
- ? PCM continuo AudioWorklet + fallback ScriptProcessor
- ? Notebook acustico oficial V1
- ? Dataset C0 funcional (gobernanza 1.3.0)
- ? Dataset REF (ESC-50) inventariado
- ? BBB recuperada por USB (192.168.7.2)
- ? Frontend Vite = fuente actual de verdad
- ? Git limpio tras consolidacion Tramo B+C

## 2. MÓDULOS (1-15)


### 1. FRONTEND VITE (src/frontend)
| Campo | Valor |
|---|---|
| Estado | REAL |
| Evidencia | src/frontend/package.json, Vite config, CMSC pages (5174 dev), build OK |
| Dependencias | node_modules, puerto 5174 |
| Riesgos | n/a (dev/local) |
| Accion requerida | Solo documentación. Build estable.


### 2. FRONTEND DOCKER
| Campo | Valor |
|---|---|
| Estado | PARCIAL (legacy) |
| Evidencia | docker-compose.yml -> frontend (nginx) en 5173, Dockerfile src/frontend/Dockerfile |
| Dependencias | imagen nginx, build estático |
| Riesgos | Desfasado vs Vite evolutivo (5174) |
| Accion requerida | Revisar sincronización cuando se defina release. NO actualizar ahora.


### 3. CMSC
| Campo | Valor |
|---|---|
| Estado | REAL (evolutivo) |
| Evidencia | src/frontend/src/pages/cmsc/*, OrchestrationZoneV2, SpectralAnalysisInstrument |
| Dependencias | Bridge, S30, stores locales |
| Riesgos | Bajo. Diseño preservado (envolver, no sustituir) |
| Accion requerida | Consolidado (Tramos B+C). Mantener puertas aditivas.


### 4. KNOWLEDGE HUB
| Campo | Valor |
|---|---|
| Estado | REAL (documental) |
| Evidencia | src/frontend/src/pages/KnowledgeHub, knowledgeRegistry/generated.json (51 docs) |
| Dependencias | docs/, visor Markdown |
| Riesgos | No indexado vectorial aún |
| Accion requerida | Sin tocar. Potencial candidato para SIGCT Memory (lectura).


### 5. IA PREDICTIVA
| Campo | Valor |
|---|---|
| Estado | PARCIAL |
| Evidencia | src/frontend/src/pages/AIPredictiva, src/ai_models (plant_disease_mbv2.h5 referenciado) |
| Dependencias | ai_service (FastAPI, Dockerfile presente) |
| Riesgos | Modelo real descalificado según inventario; no bloquea acústica |
| Accion requerida | Sin modificar. Marcar estado honesto (sigue vigente).


### 6. WORKBENCH (MMC Scientific Workbench)
| Campo | Valor |
|---|---|
| Estado | REAL (diseño+UI) |
| Evidencia | MMC_WORKBENCH_V1.md, MathModelingCell, JSXGraph vendorizado |
| Dependencias | CMSC layout, stores locales |
| Riesgos | GeoGebra pendiente (licencia) — ya documentado |
| Accion requerida | Sin implementar ahora. Solo documental.


### 7. TELEMETRÍA
| Campo | Valor |
|---|---|
| Estado | PARCIAL |
| Evidencia | TelemetryPanel, usoLabStore, sensores V3 / RobotTelemetry (verificados) |
| Dependencias | Backend (Django) + endpoints existentes |
| Riesgos | Cliente RobotTelemetry marcado ROTO según inventario — respetar etiqueta |
| Accion requerida | NO sanear forzado. Respetar honestidad de estado.


### 8. BRIDGE (ACOUSTIC)
| Campo | Valor |
|---|---|
| Estado | REAL (validado) |
| Evidencia | tools/cmsc-data-logger/bridge/server.js, acousticBridge.js, package.json bridge script |
| Dependencias | Node 24, 127.0.0.1:8766, ingestWav() (único motor) |
| Riesgos | Solo local. CORS restringido. Fuera de Docker productivo |
| Accion requerida | OK. Mantener fuera de contenedores.


### 9. LOGGER (CMSC DATA LOGGER)
| Campo | Valor |
|---|---|
| Estado | REAL (validado) |
| Evidencia | tools/cmsc-data-logger/src/cli.js, stats.js, bridge, manifest/checksums |
| Dependencias | ingestWav(), schema 1.3.0, dataset v1 |
| Riesgos | Herramienta CLI local. No desplegable |
| Accion requerida | OK. Integrado vía Bridge (Tramo B).


### 10. S30
| Campo | Valor |
|---|---|
| Estado | REAL-LOCAL |
| Evidencia | SpectralAnalysisInstrument.jsx (AudioWorklet + fallback), TelecomLab FFT, spectralEngine |
| Dependencias | micrófono local, AudioContext, Worklet |
| Riesgos | Permisos mic (navegador). Validado. |
| Accion requerida | OK. Tap PCM continuo operativo.


### 11. S61
| Campo | Valor |
|---|---|
| Estado | DISENO/PARCIAL (según inventario) |
| Evidencia | CMSC_SIGNAL_MAP_v1.md, rutas/acceso definido |
| Dependencias | IA Predictiva, salidas IA |
| Riesgos | No implementado como productor activo |
| Accion requerida | Mantener DISENO. No implementar ahora.


### 12. S62
| Campo | Valor |
|---|---|
| Estado | DISENO |
| Evidencia | CMSC_SIGNAL_MAP_v1.md |
| Dependencias | pipeline IA/Telem |
| Riesgos | Sin código activo |
| Accion requerida | Mantener DISENO.


### 13. S81 (ACOUSTIC INTELLIGENCE)
| Campo | Valor |
|---|---|
| Estado | DISENO |
| Evidencia | AI_ACOUSTIC_ARCHITECTURE_V1.md, AI_ACOUSTIC_ROADMAP_V1.md, dataset C0+REF |
| Dependencias | Dataset C0 curado+spliteado, features v2, Logger, S30 |
| Riesgos | Depende cumplimiento gates G-DS-1..6 + decisión M1/M2 acústico |
| Accion requerida | No iniciar implementación. Completar Fase 1 dataset primero.


### 14. S82 (ENVIRONMENTAL ANOMALY DETECTOR)
| Campo | Valor |
|---|---|
| Estado | DISENO |
| Evidencia | AI_ACOUSTIC_ROADMAP_V1.md, CMSC_SIGNAL_MAP_v1.md |
| Dependencias | S81 baseline, Ledger/Evidencia |
| Riesgos | Cold-start explícito |
| Accion requerida | Diferido (post-S81).


### 15. ACP (AGENTE CIENTÍFICO PRINCIPAL)
| Campo | Valor |
|---|---|
| Estado | DISENO (conceptual) |
| Evidencia | CMSC_F4_ACP_ARCHITECTURE_v1.md, MASTERDOC.md (ACP 152px) |
| Dependencias | Signal Registry + Evidence Ledger + KH (lectura) + slots agnósticos |
| Riesgos | No implementar como chatbot. Debe ser orquestador determinista + slot intérprete |
| Accion requerida | Sin código. F4A núcleo determinista cuando misión explícita.


## 3. DOCKER vs 
pm run dev (1-5)

### 1. Diferencias
| Aspecto | npm run dev (Vite) | docker compose up |
|---|---|---|
| Frontend | 5174 (HMR, strictPort, evolución) | 5173 (nginx, build estático) |
| Origen | src/frontend local (dev) | Imagen build (src/frontend/Dockerfile) |
| Actualidad | Fuente actual de verdad (evolución) | Legacy/contenedorizado (referencia estable) |
| Bridge/Logger | Node local CLI/bridge (127.0.0.1:8766) — NO en compose | No presentes en servicios docker-compose.yml |
| Hot Reload | Sí | No (build estático) |

### 2. Contenedor atrasado
**Frontend** (sigctiarural_frontend) en 5173 puede estar desfasado vs cambios locales en rama feature/cmsc-f3c-v1-implementation (Tramos B+C). No es crítico para desarrollo.

### 3. Qué debe actualizarse
- Solo cuando se decida hacer release estable: rebuild imagen frontend con contenido actual. NO ahora (desarrollo activo).

### 4. Servicios válidos
- Backend (Django), DB (Postgres), frontend (nginx 5173). ai_service presente en repo (Dockerfile) pero no listado en docker-compose.yml actual. MySQL residual (db-mysql) según inventario.

### 5. Qué puede eliminarse
- Nada. No eliminar. db-mysql mantener solo si dependencias reales existen (documentado). No intervenir.


## 4. REPOSITORIO (1-4)

### 1. Ramas que pueden fusionarse
- **feature/cmsc-f3c-v1-implementation** ? consolidada localmente (Tramos B+C + docs). Lista para merge hacia main SOLO con autorización explícita (25 commits ahead). Revisar diff vs origin antes de fusionar.
- **feature/dia18-fix-lab-electronica** ? independiente. Evaluar estado antes de fusionar.
- **feature/ubtn-biological-telemetry** ? benchmark/UBTN. Ya con commits según AGENTS.md. Evaluar antes de fusionar.

### 2. Ramas que pueden cerrarse
- Ninguna sin autorización. Mantener abiertas hasta integración validada.

### 3. Documentación obsoleta (potencial)
- Revisar documentos que hacen referencia a 127.0.0.1:8765 como destino final (fue validación temporal; arquitectura final 8766 vía Bridge). Existe en diseño histórico — **NO BORRAR** (histórico). Solo aclarar en MASTERDOC si se desea.

### 4. Documentación canónica
- MASTERDOC.md, AGENTS.md, Documentacion/Arquitectura/*.md (CMSC_*), AI_ACOUSTIC_*.md, docs/AUDIT_TRAMO_BC.md + informes bridge/tramo C (recién agregados), MMC_WORKBENCH_V1.md.


## 5. SIGCT MEMORY (Qdrant + On Device Memory) (1-4)

### 1. Qué artefactos indexar (recomendado)
- **Knowledge Hub**: knowledgeRegistry.generated.json + docs/ Markdown canónicos (51 docs) — evidencia verificable, lectura.
- **Gobernanza IA acústica**: AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md, AI_ACOUSTIC_ARCHITECTURE_V1.md, AI_ACOUSTIC_FEATURE_MAP.md.
- **CMSC arquitectura**: CMSC_F3A/F3B/F3C/F3D/F3E/F4, CMSC_SIGNAL_MAP_v1.md, CMSC_ECOSYSTEM_ASSET_INVENTORY_v1.md.
- **Evidencias Tramo B+C**: AUDIT_TRAMO_BC.md, EVIDENCIA_FLUJO_BRIDGE.md, INFORME_TRAMO_C_FINAL.md (trazabilidad).
- **Manifiestos gobernados**: manifests YAML (no WAV, solo metadatos).

### 2. Qué NO indexar
- **Audio/WAV/RAW** (nunca).
- **Datos binarios/weights** (.h5, .pth, .onnx voluminosos).
- **Archivos temporales/sandboxes** (AppData/Temp).
- **Secrets/.env**. Nunca.
- **Código fuente completo masivo** (indexar solo documentación canónica + contratos).

### 3. Qué componentes alimentarán la memoria
- **Knowledge Hub** (origen primario documental).
- **Evidence Ledger** (futuro, S81/S82) — solo cuando operativo (ahora DISENO).
- **Signal Registry** (declarativo).
- **Logger/Bridge** (metadatos + manifests, no binarios).
- **ACP** (lector, no escritor directo al vector store).

### 4. Arquitectura recomendada (terreno, SIN IMPLEMENTAR)
- **Capa 1 (Documental):** Chunks Markdown + metadatos (fuente, sección, tags).
- **Capa 2 (Evidencia):** Evidence Ledger items (JSON) con status/honestidad/confianza.
- **Almacenamiento:** Qdrant (vector) + On Device Memory (cache local) + fuente única (docs/KH) (lectura, never-write-to-source).
- **Ingest controlado:** batch por tipo (docs primero). Reindex gobernado (regeneración explícita).
- **Principio:** indexar lo verificable (evidencia), NO generar conocimiento. ACP consulta; escritura vectorial solo tras gates.


## 6. PLAN DE CONSOLIDACIÓN
1. **Documental** (hecho): 5 informes en docs/ + 3 commits locales consolidados.
2. **Bridge/Logger** (hecho): infra validada, fuera de Docker.
3. **Tramo C** (hecho): AudioWorklet+fallback, S30 operativo.
4. **Sincronización ramas**: evaluar feature/* vs main cuando autorizado.
5. **Docker release**: solo rebuild frontend si despliegue; NO ahora.
6. **SIGCT Memory**: terreno preparado (artefactos + arquitectura), sin implementación.
7. **Dataset/S81**: priorizar cumplimiento G-DS-1..6 antes de S81.


## 7. ROADMAP SIGUIENTE (sin código)
1. **Dataset Fase 1**: capturar muestras conforme guía + gates.
2. **Curación + split**: reproducible (session_id/place_id), holdout.
3. **S81**: solo tras dataset CURADO/SPLITEADO + features v2 válidas.
4. **S82**: diferido.
5. **ACP F4A**: núcleo determinista + slot intérprete (misión explícita).
6. **SIGCT Memory**: POC documental/contratos primero.


## 8. PRÓXIMO CUELLO DE BOTELLA ÚNICO
**Cumplimiento de gates dataset acústico (G-DS-1..6)**. Sin cerrar estos gates, S81 permanece DISENO. Todo lo demás (Bridge/Tramo C/CMSC/UI) está consolidado y validado.

## 9. ENTREGABLE RESUMEN
- **A. Mapa completo:** 15 módulos con estados documentados.
- **B. Estado real:** mayoría REAL/PARCIAL según evidencia; S81/S82/ACP = DISENO.
- **C. Plan consolidación:** 7 pasos (documentados).
- **D. Docker oficial:** diferencia Vite 5174 vs nginx 5173, frontend atrasado relativo, bridge/logger fuera.
- **E. Roadmap:** dataset?S81?S82/ACP/Memory.
- **F. Cuello botella único:** gates G-DS-1..6.

**SIN MODIFICAR CÓDIGO. SIN COMMITS. SIN PUSH. SOLO AUDITORÍA FINAL.**
