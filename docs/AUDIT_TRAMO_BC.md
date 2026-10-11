# TRAMO_BC_VISUAL_AUDIT

## 1. S30
- **Estado:** REAL-LOCAL (activo). 
- **Tap PCM:** AudioWorklet + fallback ScriptProcessor implementados (Tramo C). Emite bloques Float32 contiguos gapless cuando hay suscriptor.
- **Visualización:** Analyser + FFT intactos (espectro/espectrograma/métricas) sin cambios.
- **Botón "Iniciar adquisición":** activa tap + visualización. Badge "S30 OK" visible cuando activo.

## 2. AcousticLoggerPanel
- **Estado:** REAL (motor ingestWav + bridge).
- **Formulario:** completo (clase, entorno, session/place/operator/device, hora). Validación de campos obligatorios correcta.
- **Captura:** 3 s desde PCM TAP continuo. Cola muestra toma con estado `ingest_pending`.
- **Ingesta:** botón "Ingresar al dataset" habilitado con puente OK. Envía por POST /ingest.
- **Respuesta bridge:** muestra `accepted`, `sample_id`, `features 44 dims`. No inventa estados.
- **Descarga paquete (WAV + JSON):** disponible.

## 3. Estado del bridge
- **Puente:** UP en 127.0.0.1:8766 (`GET /health`, `GET /stats`, `POST /ingest`).
- **Orígenes permitidos:** localhost:5174/127.0.0.1:5174 (CORS correcto).
- **Reutiliza:** exclusivamente `ingestWav()` (motor único CLI+UI).
- **Sandbox usado:** `cmsc_bc_audit_v1` (copia de C0). C0 productivo intacto.

## 4. Contadores del Dataset Panel
- **Baseline → Final (audit):** WAV 1→2 · metadata.csv 1→2 · features 1→2 · accepted 1→2 · rejected 0→0.
- **Clase:** `ave` pasó 0→1 aceptada.
- **Badge:** `REAL` + `PUENTE OK` cuando datos provienen de `/stats`.
- **Sin puente:** muestra `—` (no inventa). Correcto.

## 5. GET /stats
- **Lectura real:** desde `metadata.csv` / `raw/` / `features/` vía bridge.
- **Poll cada 3s:** actualiza automáticamente tras ingest.
- **Coherente con disco:** conteos coinciden con sandbox.

## 6. Flujo completo UI
1. Carga `/dashboard-cmsc` → Zona V2 visible.
2. "Iniciar adquisición" S30 → `S30 OK` + `PUENTE OK`.
3. Llenar formulario → "Iniciar captura" → cola `ave · 3s · ingest_pending`.
4. "Ingresar al dataset" → bridge responde `accepted` (44 dims).
5. Dataset Panel actualiza a +1 fila vía `/stats` (REAL).

## 7. Estados visuales
- **S30:** REAL-LOCAL (tap activo + visualización).
- **Logger:** REAL (bridge + ingestWav).
- **Dataset Panel:** REAL (conteos en vivo `/stats`).
- **Bridge:** REAL operativo.
- **Gates G-DS-1..6:** FAIL/PENDING (honestos, sin maquillar PASS). Coherente con gobernanza.
- **S81/S82/KH/ACP:** DISEÑO (no promueven evidencia). Correcto.

## A. Capturas
`C:\Users\BagmDev\AppData\Local\Temp\opencode\e2e_ui\`:  
`00_pagina_entera.png`, `01_zone_activa.png` (S30 OK + PUENTE OK, baseline), `02_cola_captura.png`, `03_respuesta_bridge.png` (accepted + 44 dims), `04_dataset_actualizado.png` (1→2).  
`_transcripcion.txt`, `_resultado.json` disponibles.

## B. Componentes funcionando
- S30 (PCM continuo Float32, AudioWorklet + fallback)
- AcousticLoggerPanel (cola, ingest vía bridge, respuesta real)
- Bridge 8766 (/health,/stats,/ingest)
- AcousticDatasetPanel (/stats poll 3s, badge REAL, conteos reales)
- OrchestrationZoneV2 layout + stepper coherente
- Motor único ingestWav

## C. Componentes pendientes (fuera de Tramo BC)
- Tramo C ya implementado. Siguientes: captura masiva productiva depende de PCM de S30 en uso real (validado con shim) — no bloquea Tramo BC.
- S81/S82 → DISEÑO (requiere reglas/features validados + dataset suficiente).
- Gates completos → requieren muestras/clasificación cruzada (G-DS-2..6 mayoritariamente PENDING).

## D. Riesgos restantes
- **Ruido consola 404/500:** TelemetryPanel V3 (`/api/v3/telemetry/history/`) ajeno a flujo acústico — no afecta Tramo B+C.
- **AudioWorklet en algunos navegadores:** fallback ScriptProcessor existe y funcionó.
- **PCM real vs shim:** validación UI con shim determinista OK. Validación con mic real recomendada en campo (mismo contrato).
- **AC-3 estricto:** con PCM continuo real más correcto; legítimas pasaron.

## E. Dictamen
**GO_TRAMO_BC_PRODUCTION**

Tramo B + Tramo C integrados y validados visualmente extremo a extremo. Solo sandbox, C0 productivo intacto. Sin código modificado fuera de lo autorizado. Sin commits/push.