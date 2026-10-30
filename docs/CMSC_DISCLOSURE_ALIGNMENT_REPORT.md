# CMSC_DISCLOSURE_ALIGNMENT_REPORT

**Misión:** `CMSC_DISCLOSURE_ALIGNMENT` — cerrar AC-L6 y AC-L8 y eliminar las últimas inconsistencias visuales.
**Fecha:** 2026-10-30 (runtime verificado sobre imagen frontend reconstruida).
**Alcance de archivos tocados:** únicamente `src/frontend/src/pages/cmsc/ModelPredictCell.jsx`. `AcpCell.jsx` y `signalCatalog.js` se revisaron y no requirieron cambio (sin literales "inferencia real finalizada" ni badges de procedencia faltantes). Sin commits, sin push, sin stage.

## 1. Cambios exactos aplicados (ModelPredictCell.jsx)

| # | Línea(s) | Cambio |
|---|---|---|
| 1 | 6 | Importación ampliada: `getProvenancePresentation`, `buildNarrationPrefix` desde `../AIPredictiva.jsx`. |
| 2 | 52-54 | TTS: `` `Inferencia real finalizada. ${built.disease}. ${built.recommendation}` `` → `` `${buildNarrationPrefix(built)} ${built.disease}. ${built.recommendation}` ``. |
| 3 | 65-66 | Añadido `const provenancePresentation = info ? getProvenancePresentation(info) : null;`. |
| 4 | 117-124 | Render del badge de procedencia (`provenancePresentation.label` + `className` + `title`) bajo el badge de salud, idéntico al de AIPredictiva. |
| 5 | 72 | Subtítulo: `operar inferencia real · S61` → `inferencia declarada · S61`. |
| 6 | 135 | Footer alineado: añadidos `modelStatus`, `scientificScope` e `inferenceExecuted` (texto `inferencia ejecutada`/`sin inferencia`). |

## 2. Literales reemplazados / eliminados

- `"Inferencia real finalizada"` → **0 ocurrencias** en `src/frontend/src` (AC-L6 cerrado). Evidencia: `Select-String … "Inferencia real finalizada"` → `count=0`.
- `operar inferencia real` → `inferencia declarada` (1 ocurrencia en ModelPredictCell.jsx).

## 3. Alineación de `model_status` / `scientific_scope` / `inference_executed` con la UI

- `model_status` se muestra en el footer de la tarjeta de resultado de ModelPredictCell (`{info.modelStatus}`, p. ej. `HISTORICO`) y en el badge de procedencia (`MODELO HISTÓRICO · BINARIO · SIN HOLDOUT`).
- `scientific_scope` se muestra en el footer (`{info.scientificScope}`, p. ej. `binary_only`) y en el bloque "ALCANCE CIENTIFICO" (sin cambios, ya existía).
- `inference_executed` se muestra en el footer como texto honesto (`inferencia ejecutada` / `sin inferencia`) y alimenta `buildNarrationPrefix`, que para `HISTORICO` narra "Inferencia ejecutada con modelo histórico binario. No identifica enfermedad específica." (nunca "inferencia real").
- El badge de salud (`⚠️ ALERTA PREVENTIVA`) se mantiene por separado (estado de salud de la planta), coherente con AIPredictiva.

## 4. Eliminación de "Inferencia real finalizada" cuando no corresponda

- La voz del dashboard ahora usa `buildNarrationPrefix(built)`, idéntico a AIPredictiva. Para `model_status=HISTORICO` narra "modelo histórico binario"; nunca "inferencia real". AC-L6 cerrado.

## 5. Qué debe mostrar CMSC (ModelPredictCell)

- Subtítulo: `inferencia declarada · S61` (no "inferencia real").
- Badge de salud (estado de la planta): `⚠️ ALERTA PREVENTIVA` / `SALUDABLE` / etc.
- Badge de procedencia (nuevo, idéntico a AIPredictiva): `MODELO HISTÓRICO · BINARIO · SIN HOLDOUT`.
- Footer: `predictionCode · class · modelVersion · modelStatus · scientificScope · inferencia ejecutada/sin inferencia · sourceMode`.
- Narración TTS: `buildNarrationPrefix` (histórico binario, nunca "inferencia real").

## 6. Qué debe mostrar ACP (AcpCell)

- ACP permanece `DISEÑO` (`HonestyBadge estado="DISENO"`) — orquestador de lectura, no ejecuta laboratorios ni fabrica evidencia.
- S62 (`Voz del asistente`) se muestra con su estado real (`REAL`) y su confianza.
- No se añadió badge de procedencia de modelo porque ACP no ejecuta inferencia; solo lee fuentes (Registry, Ledger, Knowledge Hub). Sin literales "inferencia real finalizada" (verificado).
- El asistente de voz (`useAiVoiceAssist`) sigue operando vía `/assist` sin cambios.

## 7. Qué debe mostrar Signal Catalog (signalCatalog.js)

- S60 (`Imagen hoja 224x224`): `REAL`, entrada real de imagen — sin cambio.
- S61 (`Inferencia /infer`): `REAL`, endpoint FastAPI 8081, `diagnosis, class_index, confidence` — sin cambio (el estado del *señal* es REAL porque el endpoint corre; la procedencia del *artefacto* se gestiona en `/health` y en el badge de procedencia, no en el catálogo de señales).
- S62 (`Voz del asistente`): `REAL` — sin cambio.
- Sin literales "inferencia real finalizada" en signalCatalog.js (verificado).

## 8. Validación de no-rotura

| Componente | Resultado | Evidencia |
|---|---|---|
| Dashboard (CMSC) | PASS | `/dashboard-cmsc` carga completo; badge de procedencia ahora visible (`MODELO HISTÓRICO · BINARIO · SIN HOLDOUT`) tras análisis; footer con `HISTORICO · binary_only · inferencia ejecutada`. |
| Knowledge Hub | PASS | `/knowledge` carga 51 documentos indexados. |
| Voice Assistant | PASS | Componente intacto (sin cambios en `VoiceAssistant.jsx`); `/assist` no tocado. |
| Bridge | PASS (sin cambios) | No se tocó código del bridge; `cmsc-data-logger` intacto. |
| Labs | PASS | `/labs` carga; rutas de laboratorios intactas. |
| AIPredictiva | PASS | `/ai-predictive` sigue mostrando el badge de procedencia; TTS sin "inferencia real". |
| `/health` | PASS | `200`, `model_status=HISTORICO`, `model_sha256=77b0efec…`. |
| AC-L6 | PASS | 0 literales "Inferencia real finalizada" en `src/frontend/src`. |
| AC-L8 | PASS | ModelPredictCell muestra el mismo badge de procedencia que AIPredictiva. |

## 9. Clasificación final

**READY_FOR_DOCKER_READY_CONDITIONAL**

AC-L6 y AC-L8 cerrados; V-17 y V-18 ahora pasan (badge idéntico en `/ai-predictive` y `/dashboard-cmsc`; narración sin "inferencia real"). Runtime de servicios, contrato de procedencia y suites sin regresión.

## 10. Evidencia textual clave

- DOM `/dashboard-cmsc` (post-análisis): `⚠️ ALERTA PREVENTIVA` + `MODELO HISTÓRICO · BINARIO · SIN HOLDOUT` + footer `plant_condition.binary.unhealthy · class 0 · plant_disease_mbv2 · HISTORICO · binary_only · inferencia ejecutada · cloud`.
- `Select-String "Inferencia real finalizada"` → `count=0`.
- Build frontend: `✓ built in 57.72s` (5485 módulos), sin errores.
- `/health`: `status=ok`, `model_status=HISTORICO`.

## 11. Restricciones respetadas

- Solo se tocó `ModelPredictCell.jsx`. `AcpCell.jsx` y `signalCatalog.js` revisados, sin cambios necesarios.
- Sin commits, sin push, sin stage. HEAD `d930a34`. `stash@{0}` intacto. `.h5` sin cambios.
