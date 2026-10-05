# AI ACOUSTIC ARCHITECTURE — v1 (DISEÑO)

**Misión:** CMSC_AI_ACOUSTIC_V1 · **FASES 2, 4, 5 y 6**
**Fecha:** 2026-10-02 · **HEAD:** `83b6089` · **Estado:** SOLO DISEÑO — sin implementación
**Regla de honestidad:** módulo sin modelo entrenado = `DISENO`, nunca un resultado de adorno.
**Filosofía:** NADA DESAPARECE · integrar sobre lo existente · NO reemplazar.

> Esta es la arquitectura de la primera fuente de IA alimentada por **señal física real** (S30 · micrófono)
> del ecosistema SIGCT-Rural. No se toca Hero, Workbench V6, Dashboard, estilos ni arquitectura existente.

---

## FASE 2 · `featureExtractor.js` (contrato)

**Ubicación propuesta (a crear en Sprint 2, NO ahora):**
`src/frontend/src/pages/cmsc/acoustic/featureExtractor.js`

**Responsabilidad única:** convertir el `frame` de `analyzeFrame` (+ nivel, + ventana temporal) en un
**vector numérico de longitud fija** y versionado, listo para un modelo. No clasifica, no dibuja, no decide.

### 2.1 Tipado (JSDoc typedefs — contrato)

```js
/**
 * @typedef {Object} RawFrame                      // ya existe (spectralEngine.analyzeFrame)
 * @property {number} n
 * @property {number} sampleRate
 * @property {number} binHertz
 * @property {number} dominantFrequency            // Hz
 * @property {number} peakDb                       // dB
 * @property {number} spectralCentroid             // Hz
 * @property {number} spectralFlatness             // [0,1]
 * @property {number} totalEnergy                  // Σ mag²
 * @property {number} rms
 * @property {Float32Array} magnitudes             // 2048
 * @property {Float32Array} db                     // 2048
 * @property {Array<{name:string,min:number,max:number,energy:number,pct:number,peakHz:number,peakDb:number}>} bandEnergy
 */

/**
 * @typedef {Object} ExtractContext
 * @property {number} levelDb                      // frameLevelDb(floatWindow)
 * @property {Float32Array} timeDomain             // floatWindow [-1,1], N_FFT
 * @property {Float32Array} history                 // rolling 96×96 (opcional)
 * @property {RawFrame} [prevFrame]                 // para flux
 * @property {number} sampleRate
 * @property {number} timestampMs
 */

/**
 * @typedef {Object} FeatureMeta
 * @property {string} schema                        // 'acoustic.feat.v2'
 * @property {number} schemaSize                    // longitud del vector
 * @property {number} sampleRate
 * @property {number} timestampMs
 * @property {number} dominantFrequency
 * @property {string} sourceId                      // 'S30'
 * @property {'REAL-LOCAL'} sourceEstado
 * @property {string} method                        // 'fft-hann-4096 + derived-v2'
 */

/**
 * @typedef {Object} FeatureVector
 * @property {Float32Array} values                  // longitud fija = FEATURE_SCHEMA_V1.length
 * @property {Record<string, number>} named         // acceso por nombre (debug/tests)
 * @property {FeatureMeta} meta
 */

/**
 * @param {RawFrame} frame
 * @param {ExtractContext} ctx
 * @returns {FeatureVector}
 */
export function extract(frame, ctx) { /* diseño */ }
```

### 2.2 Esquema canónico de features `acoustic.feat.v2`

> **REVISIÓN 2026-10-05.** Este documento nació describiendo `acoustic.feat.v1`. Ese esquema queda
> **CONGELADO con un defecto conocido en su feature 21** (`profileEntropy`) y **no debe usarse para
> entrenar**. El esquema vigente es `acoustic.feat.v2`. Los 22 nombres y su orden **no cambian**:
> la corrección afecta al cálculo de la feature 21, no al contrato. Detalle completo y cifras en
> `AI_ACOUSTIC_FEATURE_MAP.md` §5.

Vector de **longitud fija** (orden = contrato inmutable; cambiar el orden = nueva versión de esquema).
Todas las features se **normalizan** al rango de entrenamiento (media/σ por feature, fijadas al entrenar).

| # | Nombre | Origen | Normalización propuesta |
|---:|---|---|---|
| 0 | `dominantHzNorm` | `dominantFrequency / (Fs/2)` | [0,1] |
| 1 | `peakDbNorm` | `peakDb` | (dB − min)/rango |
| 2 | `centroidNorm` | `spectralCentroid / (Fs/2)` | [0,1] |
| 3 | `flatness` | `spectralFlatness` | ya [0,1] |
| 4 | `rms` | `rms` | log + z-score |
| 5 | `logEnergy` | `log10(totalEnergy + ε)` | z-score |
| 6 | `levelDb` | `levelDb` (dBFS) | (dB+100)/100 |
| 7 | `bandPctLow` | `bandEnergy[0].pct` | [0,1] |
| 8 | `bandPctMid` | `bandEnergy[1].pct` | [0,1] |
| 9 | `bandPctHigh` | `bandEnergy[2].pct` | [0,1] |
| 10 | `bandPeakLowNorm` | `bandEnergy[0].peakHz` | /(Fs/2) |
| 11 | `bandPeakMidNorm` | `bandEnergy[1].peakHz` | /(Fs/2) |
| 12 | `bandPeakHighNorm` | `bandEnergy[2].peakHz` | /(Fs/2) |
| 13 | `bandPeakDbLow` | `bandEnergy[0].peakDb` | (dB+100)/100 |
| 14 | `bandPeakDbMid` | `bandEnergy[1].peakDb` | (dB+100)/100 |
| 15 | `bandPeakDbHigh` | `bandEnergy[2].peakDb` | (dB+100)/100 |
| 16 | `spectralBandwidthNorm` | **derivada** | /(Fs/2) |
| 17 | `spectralRolloffNorm` | **derivada** (85%) | /(Fs/2) |
| 18 | `zeroCrossingRate` | **derivada** sobre `timeDomain` | [0,1] |
| 19 | `crestFactor` | **derivada** | log + z-score |
| 20 | `spectralFlux` | **derivada** (vs `prevFrame.db`) | log |
| 21 | `profileEntropy` | **derivada**: entropía de Shannon del espectro de **potencia** (`magnitudes²`) en 96 bandas de cobertura completa | [0,1] |

**`FEATURE_SCHEMA_V2`** es el array ordenado de nombres; `schemaSize = 22`. Es **idéntico** a
`FEATURE_SCHEMA_V1` en nombres y orden. Cualquier cambio de *nombres u orden* → `acoustic.feat.v3`
y re-entrenamiento. Es un **contrato congelado** (misma disciplina que el split seed 42 del dataset).

**Historial de versiones:**

| Versión | Estado | Diferencia |
|---|---|---|
| `acoustic.feat.v1` | **CONGELADO** (2026-10-05) | `profileEntropy` sobre `db[i]²` (dBFS al cuadrado) y 96 bandas de 21 bins fijos: solo leía 2016 de 2048 bins. Sirve **solo** para reproducir artefactos históricos. |
| `acoustic.feat.v2` | **VIGENTE** | `profileEntropy` sobre `magnitudes[i]²` (potencia lineal) y 96 bandas con bordes fraccionarios: lee los 2048 bins. Solo cambia la feature 21. |

Consecuencia práctica: en las 44 dims, `mean_profileEntropy` (índice 21) y `std_profileEntropy`
(índice 43) **no son comparables entre un modelo entrenado con v1 y otro con v2**. Las otras 42 sí lo son.

### 2.3 Invariantes del extractor
1. **Puro y determinista:** mismo input → mismo output; sin estado global (el `prevFrame` entra por `ctx`).
2. **Sin dependencias externas:** solo `spectralEngine` (ya disponible).
3. **Finite-safe:** todo `NaN/Infinity` se sanea a 0 (o al valor de piso) antes de salir.
4. **Versionado:** `meta.schema` viaja con cada vector.
5. **Barato:** O(2048) sobre arreglos ya calculados; apto para cadencia acotada (ver §R5).

### 2.4 Salida de ejemplo (conceptual)

```json
{
  "values": [0.017, 0.42, 0.13, 0.08, 0.0031, ...],
  "named": { "dominantHzNorm": 0.017, "flatness": 0.08 },
  "meta": { "schema": "acoustic.feat.v2", "schemaSize": 22, "sourceId": "S30",
            "sourceEstado": "REAL-LOCAL", "method": "fft-hann-4096 + derived-v2",
            "sampleRate": 44100, "timestampMs": 1760000000000 }
}
```

---

## FASE 4 · S81 — ACOUSTIC INTELLIGENCE (diseño de señal)

Salida del clasificador acústico: **clasificación ambiental sobre señal real**.

| Campo | Valor propuesto |
|---|---|
| `signal_id` | **S81** |
| `name` | ACOUSTIC INTELLIGENCE |
| `clase_senal` | `IA` |
| `dominio` | `Acústicas` |
| `estado` **declarado (misión)** | `REAL-LOCAL` |
| `estado` **honesto actual** | ⚠️ `DISENO` — no existe clasificador entrenado; se degrada automáticamente |
| `origen` | `featureExtractor` + `AcousticClassifier` sobre S30 (mic local) |
| `cadencia` | acotada (2–5 Hz), NO por rAF |
| `puerto` | `P-LAB-02` (reutiliza el puerto de S30) |
| `consumidores` | `ModelPredictCell`, Knowledge Hub, ACP |
| `confianza` | probabilidad del clasificador (0..1) — nunca inventada |
| `metadata_ref` | `SIGNAL_MAP 1.7 / AI_ACOUSTIC_ARCHITECTURE_V1` |

**Clases iniciales (9):** `SILENCIO · VIENTO · LLUVIA · AGUA · INSECTOS · AVE · VOZ · MOTOR · RUIDO DESCONOCIDO`.

### 4.1 Contrato de salida (`AcousticClassification`)

```js
/**
 * @typedef {Object} AcousticClassification
 * @property {'S81'} signalId
 * @property {string} label                      // una de las 9 clases
 * @property {number} confidence                 // 0..1 real (o null si no hay modelo)
 * @property {Record<string,number>} probabilities
 * @property {string} modelVersion               // 'none' | 'acoustic-clf-v1'
 * @property {'rules-v0'|'ml-v1'} method
 * @property {'live'|'fallback'|'no-model'} sourceMode
 * @property {boolean} degraded                  // true si sourceMode != 'live'
 * @property {FeatureMeta} featureMeta
 */
```

### 4.2 Regla de honestidad para S81
- Sin modelo entrenado → `sourceMode:'no-model'`, `confidence:null`, estado visible **`DISENO`**.
- Con clasificador determinista (Sprint 3) → `method:'rules-v0'`, estado **`SIM`** (es heurística, no aprendizaje).
- Solo con modelo ML validado sobre datos reales etiquetados → `method:'ml-v1'`, estado **`REAL-LOCAL`** (el que la misión declara como objetivo).

---

## FASE 5 · S82 — ENVIRONMENTAL ANOMALY DETECTOR (diseño)

Aprende el **comportamiento acústico normal** del entorno y marca desviaciones.

| Campo | Valor propuesto |
|---|---|
| `signal_id` | **S82** |
| `name` | ENVIRONMENTAL ANOMALY DETECTOR |
| `clase_senal` | `EXPERIMENTAL` |
| `dominio` | `Acústicas` |
| `estado` | `DISENO` (experimental) |
| `origen` | modelo no supervisado sobre `acoustic.feat.v2` |
| `cadencia` | 1 Hz |
| `puerto` | `P-LAB-02` |
| `consumidores` | Knowledge Hub, ACP, alertas |

**Objetivo:** aprender la distribución normal del ambiente (por franja horaria) y detectar:
`ANOMALÍA`, `EVENTO NUEVO`, `PATRÓN RARO`.

### 5.1 Contrato de salida (`AcousticAnomaly`)

```js
/**
 * @typedef {Object} AcousticAnomaly
 * @property {'S82'} signalId
 * @property {'normal'|'anomaly'} verdict
 * @property {'ANOMALÍA'|'EVENTO NUEVO'|'PATRÓN RARO'|null} kind
 * @property {number} score                       // distancia/anomaly score
 * @property {number|null} threshold              // umbral calibrado
 * @property {'cold-start'|'ready'} baselineState
 * @property {FeatureMeta} featureMeta
 */
```

### 5.2 Enfoque propuesto (sin entrenar aún)
- Baseline incremental: media/σ rodante por feature (ventana temporal), o `IsolationForest`/`autoencoder`
  ligero más adelante (Sprint 5).
- **Cold-start explícito:** durante la ventana de calibración, `baselineState:'cold-start'` y **cero alertas**
  (evita falsos positivos que erosionan la confianza).
- **Regla dura:** jamás reportar anomalía sin baseline listo (honestidad > novedad).

---

## FASE 6 · Integración CMSC (diseño, sin romper nada)

Cadena objetivo:

```
SpectralAnalysisInstrument  (S30 · REAL-LOCAL, motor FFT/STFT real)
        ↓  (frame + levelDb + timeDomain + history)   [suscripción de solo lectura]
featureExtractor.js          (acoustic.feat.v2, puro)
        ↓  FeatureVector
AcousticClassifier           (ModelBackend: none | rules-v0 | ml-v1)
        ↓  S81 AcousticClassification  (+ S82 AcousticAnomaly)
ModelPredictCell             (presentación honesta: label + confidence + estado)
        ↓
Knowledge Hub                (evidencia → ledger → docs; SOLO lectura/presentación)
```

### 6.1 Principios de integración (NO romper)
1. **Solo lectura de S30:** el clasificador **observa** el `frame`; nunca modifica el loop, los canvas ni
   TelecomLab (`TelecomLab produce, aquí se analiza`).
2. **Desacople por cadencia:** el clasificador corre a 2–5 Hz, **no** en el `requestAnimationFrame`
   (el rAF ya ejecuta FFT 4096 por frame; ver riesgo R5).
3. **Aditivo puro:** nuevos módulos en `pages/cmsc/acoustic/`; **no** se toca Hero, Workbench V6, Dashboard,
   estilos, `useLabStore`, `signalCatalog` existente ni rutas de `App.jsx`.
4. **Punto de enganche sin reescribir el instrumento:** exponer el `frame` por un **hook de suscripción**
   (`useSpectralFrame()` o event bus in-process) que el instrumento emite de forma opcional. El instrumento
   no conoce al clasificador.
5. **Estado honesto en la UI:** usa el sistema existente (`HonestyBadge`, `sourceMode`), igual que `ModelPredictCell`
   con S61. Sin resultados inventados.
6. **Knowledge Hub sin duplicar:** la evidencia acústica se vincula por lectura (`docsBySignal`), nunca se
   escriben punteros en ambos lados (regla F3E-3).
7. **Sin tocar backend ahora:** la inferencia es **100% cliente** en Fase 1 acústica (browser). Un endpoint
   `/classify-audio` en el `ai_service` es evolución posterior (Sprint 4+), reutilizando el contrato existente.

### 6.2 Qué requiere una misión futura de implementación
- Habilitar el punto de enganche en `SpectralAnalysisInstrument` (1 prop/emit opcional, aditivo).
- Crear `acoustic/featureExtractor.js`, `acoustic/AcousticClassifier.js`, `acoustic/anomaly.js`.
- Añadir un panel de presentación (sin alterar layout global del dashboard).
- Registrar S81/S82 en `signalCatalog.js` (aditivo) y `docsBySignal` (keywords).

---

## RIESGOS

| ID | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| R1 | **Deshonestidad**: presentar heurística/aleatorio como IA real | 🔴 Alta | estado `DISENO`/`SIM` hasta modelo validado; `sourceMode` + `confidence` reales; fixtures de rechazo |
| R2 | **Sin datos de audio etiquetados** para las 9 clases | 🔴 Alta | protocolo de grabación etiquetada (Sprint 1–2); clases balanceadas; consentimiento |
| R3 | **Domain shift**: micrófono/entorno/SR distintos a entrenamiento | 🟠 Media | fijar `sampleRate` y mic de referencia; aumentación; validación por entorno |
| R4 | **Drift de esquema** features↔modelo | 🟠 Media | `acoustic.feat.v2` congelado + tests golden; esquema viaja en `meta` |
| R5 | **Rendimiento**: FFT 4096 + clasificador por frame baja FPS | 🟠 Media | clasificador a 2–5 Hz (no por rAF); throttle ya existente; WebWorker opcional |
| R6 | **Peso/offline** de runtime ML (ONNX/TF.js) en el bundle | 🟡 Baja | `import()` dinámico; no añadir a deps globales; mantener bundle actual |
| R7 | **Privacidad**: audio del entorno (voces) | 🔴 Alta | sin almacenamiento de audio crudo; inferencia local; no subir fragmentos |
| R8 | **Acoplamiento**: tocar el instrumento/Workbench/Dashboard | 🟠 Media | hook de suscripción aditivo; cero cambios en Hero/WB/Dashboard/estilos |
| R9 | **Duplicar** TelecomLab/S30/"Lab espectral" | 🟠 Media | consumir S30; nunca reimplementar el motor ni reemplazar labs |
| R10 | **Falsos positivos** de anomalías (S82) | 🟠 Media | cold-start sin alertas; umbral calibrado; histéresis |

---

## ESFUERZO ESTIMADO (referencial, 1 desarrollador)

| Sprint | Entregable | esfuerzo |
|---|---|---|
| 1 | Arquitectura + esquema `acoustic.feat.v2` congelado + protocolo de dataset | 2–3 días |
| 2 | `featureExtractor.js` + tests golden (sin modelos) | 3–4 días |
| 3 | `AcousticClassifier` determinista (rules-v0) + panel + S81 `DISENO`/`SIM` | 4–5 días |
| 4 | Dataset acústico etiquetado + entrenamiento `ml-v1` (cliente o servicio) | 8–12 días |
| 5 | S82 anomaly detection + baseline/cold-start | 6–8 días |
| 6 | Evidencia → Knowledge Hub + ACP + gobernanza | 4–6 días |
| **Total** | | **≈ 27–38 días de desarrollo** + recolección de datos en campo |

---

## PRÓXIMO PASO RECOMENDADO

**Sprint 1 — Arquitectura, sin modelo:**
1. Congelar `FEATURE_SCHEMA_V1` y su normalización en este documento/ADR.
2. Diseñar el protocolo de captura de audio etiquetado (9 clases; entorno real; consentimiento).
3. Definir el punto de enganche de solo lectura (hook) sin tocar Hero/Workbench/Dashboard.

**Explicitamente NO hacer todavía:** entrenar, añadir dependencias ML, tocar el instrumento o el dashboard.

> Regla final: mientras no exista un modelo entrenado y validado, S81/S82 permanecen en **`DISENO`**.
> Preferimos una IA que aún no existe a un gráfico de adorno (invariante del ecosistema).
