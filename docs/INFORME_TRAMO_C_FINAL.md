# INFORME TRAMO C — PCM CONTINUO FLOAT32

Fecha: 2026-10-09  
Autorización: Proceder con TRAMO C (solo intervenir SpectralAnalysisInstrument.jsx + public/worklets/pcm-capture-processor.js).  
Bridge/Dataset/Logger/Ingest/Checksums/Metadata/Features **SIN CAMBIOS**.

## Cambios realizados

1. **`src/frontend/public/worklets/pcm-capture-processor.js` (nuevo)**
   - AudioWorkletProcessor que emite bloques `Float32Array` contiguos vía `port.postMessage(ch.slice())`.
   - Sin efectos, retorna `true`. Método `stop()` opcional (no usado).
   - Registro: `registerProcessor('pcm-capture-processor', PcmCaptureProcessor)`.

2. **`src/frontend/src/pages/cmsc/SpectralAnalysisInstrument.jsx` (modificado)**
   - Añadidos refs: `workletNodeRef`, `workletReadyRef`, `workletPortHandlerRef`, `procNodeRef`.
   - `stop()`: cleanup simétrico de worklet/port/handler + ScriptProcessor fallback + stream/ctx.
   - `start()`: tras conectar Analyser, intenta `audioCtx.audioWorklet.addModule('/worklets/pcm-capture-processor.js')` → crea `AudioWorkletNode('pcm-capture-processor')`, conecta `source.connect(workletNode)`, handler copia `Float32Array` y llama `onPcmChunk(chunk, audioCtx.sampleRate)`. **Fallback**: si falla, usa `createScriptProcessor(4096,1,1)` con `onaudioprocess` emitiendo `new Float32Array(input)`.
   - **Eliminado** el antiguo `if (pcmTapCallbacksRef.current) { emit floatWindow (FFT window) }` del bucle RAF. **Se preserva** `AnalyserNode` + `getByteTimeDomainData` + FFT para visualización/espectro/espectrograma (ruta espectral intacta).
   - Interfaz `pcmTapRef` **sin cambios** (mismo `active`, `sampleRate`, `onPcmChunk` setter/getter).

## Validación E2E (sandbox)

- Bridge + Vite arrancados con sandbox `cmsc_tramo_c_v2` (copia de C0). C0 productivo **intacto** (verificado `cli status`: 1 fila / 1 WAV / 1 feature, CAPTADO_INICIAL).
- Flujo: S30 OK + PUENTE OK → captura `ave` 3 s → `Ingresar al dataset` → **respuesta bridge: accepted** · `sample_id ac_20261009_220154_000` · **44 dims**.
- Dataset actualizado: WAV 1→2 · metadata 1→2 · features 1→2 · accepted 1→2. Rechazados 0.

## Verificación campos metadata (última fila)

- `duration_s=3.000000` · `sample_rate=44100` · `channels=1` · `bit_depth=16`
- `capture_source_rate=48000` · `resample_method=cubic` (remuestreo declarado)
- `feature_schema=acoustic.feat.v2` · `window_schema=acoustic.feat.window.v2` · `frames_count=63` · `ingest_status=accepted`
- **Tasa nativa 48kHz correctamente declarada**; ingest normaliza a 44.1k con método declarado.

## Criterios validados

| Criterio | Estado | Evidencia |
|---|---|---|
| **T-C1 (continuidad gapless)** | ✅ OK | PCM continuo emitido desde audio clock (AudioWorklet/ScriptProcessor). Concatenación lógica da `samples.length == round(3.0*sr)` (3.000000 s). |
| **T-C2 (comparativa capture/index.html)** | ✅ OK | `duration_s==3.000000`, `peak/rms` coherentes, `capture_source_rate == ctx.sampleRate` (48kHz). Formato WAV/metadata coherente con prototipo. |
| **T-C3 (48kHz → ingest correcto)** | ✅ OK | `capture_source_rate=48000`, `resample_method=cubic`, ingest aceptado, features 44 dims, metadata completo. |
| **T-C5 (E2E sandbox GO_TRAMO_B_FINAL reproducido)** | ✅ OK | Mismos pasos → `accepted`, +1 fila, conteos reales vía `/stats`. |
| **T-C9 (C0 intacto)** | ✅ OK | `tools/cmsc-data-logger/src/cli.js status` mantiene 1/1/1. |

## Regresión/compatibilidad

- **Visualización S30 intacta:** Analyser + FFT permanecen; ruta espectral sin cambios.
- **Interfaz tap idéntica:** `pcmTapRef` mantiene misma firma. `AcousticLoggerPanel` sin cambios.
- **Bridge/ingest/dataset:** sin modificaciones. Gobernanza (AC-1..AC-10, schema 1.3.0) respetada.
- **Fallback robusto:** ScriptProcessor como respaldo si AudioWorklet no disponible.
- **Cleanup correcto:** worklet port cerrado, nodos desconectados, stream/ctx cerrados.

## Notas

- Ruido consola (404/500 de TelemetryPanel V3) ajeno al flujo — ya observado en validación previa.
- Puertos 8766/5174 liberados tras validación.
- Cambios: **2 archivos** (`SpectralAnalysisInstrument.jsx` modificado + `pcm-capture-processor.js` nuevo). Resto sin tocar.
- **Sin commits, sin push.**

## Dictamen

**GO_TRAMO_C_FINAL**