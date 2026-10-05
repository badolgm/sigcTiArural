# AI ACOUSTIC FEATURE MAP — v1

**Misión:** CMSC_AI_ACOUSTIC_V1 · **FASE 1 · Auditoría de features**
**Fecha:** 2026-10-02 · **HEAD verificado:** `83b6089`
**Fuente auditada (código real, no memoria):**
- `src/frontend/src/pages/cmsc/SpectralAnalysisInstrument.jsx` (instrumento LIVE)
- `src/frontend/src/pages/cmsc/spectralEngine.js` (motor FFT/STFT)
- `src/frontend/src/pages/cmsc/signalCatalog.js` (S30 · REAL-LOCAL)

> Estado honesto: las features aquí listadas son **REALES-LOCALES**. El motor FFT, la ventana Hann
> y el análisis por frame están operativos y verificados en runtime (commit `83b6089`). Lo que
> **NO existe aún** es ningún modelo entrenado que consuma estas features (ver `AI_MODEL_INVENTORY.md`).

---

## 1. Arquitectura de captura (dónde nacen las features)

```
Micrófono local
  → navigator.mediaDevices.getUserMedia({audio:true})
  → AudioContext.createMediaStreamSource
  → AnalyserNode (fftSize = N_FFT = 4096, smoothingTimeConstant = 0.55)
  → analyser.getByteTimeDomainData(Uint8Array(4096))          [por frame rAF]
  → floatWindow[i] = (timeData[i] - 128) / 128                [dominio tiempo, [-1,1]]
        ├── frameLevelDb(floatWindow)                         → dBFS scalar
        └── analyzeFrame(floatWindow, sampleRate)             → frame completo (FFT radix-2 + ventana Hann)
     dBProfile(frame.db, minBin, maxBin, SPECTRUM_BUCKETS)    → perfil de 96 buckets
     history (rolling Float32Array 96×96)                     → espectrograma en vivo
  → dibujo en 3 canvas (tiempo, espectro, espectrograma)
  → throttle de UI: setStats/setLevelDb cada >150 ms
```

Complejidad computacional real por frame: `analyzeFrame` ejecuta una FFT radix-2 de 4096 puntos
(`spectralEngine.js:19`) + barrido de 2048 bins. Se ejecuta a la cadencia del `requestAnimationFrame`
(≈60 Hz), aunque la UI solo muestrea cada 150 ms.

---

## 2. Inventario completo de features disponibles HOY

### 2.1 Constantes del motor (`spectralEngine.js:1-6,8-12`)

| Constante | Valor | Rol para IA |
|---|---|---|
| `N_FFT` | 4096 | tamaño de ventana FFT; define resolución espectral |
| `DEFAULT_SAMPLE_RATE` | 44100 | fallback de `sampleRate` |
| `AUDIBLE_MIN_HZ` | 20 | cota inferior del análisis |
| `SPECTRUM_BUCKETS` | 96 | dimensión del perfil de espectro/espectrograma |
| `SPECTROGRAM_ROWS` | 96 | filas del historial STFT (≈96 frames de profundidad) |
| `SPECTROGRAM_DB_FLOOR` | 60 | rango dinámico del mapeo dB→uint8 |
| `FREQ_BANDS` | 3 bandas | Sub 20-250 · Medios 250-2k · Agudos 2k-20k |

### 2.2 Salida de `analyzeFrame(samples, sampleRate)` (`spectralEngine.js:126-139`)

| Feature | Tipo | Unidad | Rango típico | Línea | ¿Lista para IA? |
|---|---|---|---|---|---|
| `n` | number | muestras | 4096 | 76/127 | metadata |
| `sampleRate` | number | Hz | 44100 … 48000 | 128 | metadata |
| `binHertz` | number | Hz/bin | ≈10.77 @44.1k | 129 | metadata |
| `dominantFrequency` | number | Hz | 0 … Fs/2 | 130 | ✅ fuerte |
| `peakDb` | number | dB | −∞ … ~0 | 131 | ✅ |
| `spectralCentroid` | number | Hz | 0 … Fs/2 | 132 | ✅ fuerte |
| `spectralFlatness` | number | [0,1] | 0=tonal, 1=ruido | 133 | ✅ fuerte (VAD/ruido) |
| `totalEnergy` | number | potencia (Σ mag²) | ≥0 | 134 | ✅ (normalizar) |
| `rms` | number | amplitud | ≥0 | 135 | ✅ |
| `magnitudes` | Float32Array(2048) | magnitud | ≥0 | 136 | ✅ crudo (bins FFT) |
| `db` | Float32Array(2048) | dB | −∞ … ~0 | 137 | ✅ crudo (bins FFT) |
| `bandEnergy` | Array(3) | objeto | — | 138 | ✅ (ver 2.4) |

### 2.3 Nivel de señal (`frameLevelDb`, `spectralEngine.js:142-150`)

| Feature | Tipo | Unidad | Línea | Nota |
|---|---|---|---|---|
| `levelDb` | number | dBFS | 149 | nivel RMS global; usado en la UI ("−xx.x dBFS") |

### 2.4 Energía por bandas — `bandEnergy[i]` (`spectralEngine.js:104-124`)

3 objetos (Sub 20-250 · Medios 250-2k · Agudos 2k-20k):

| Sub-feature | Tipo | Unidad | Línea |
|---|---|---|---|
| `name` | string | — | 117 |
| `min` / `max` | number | Hz | 118 |
| `energy` | number | potencia (Σ mag²) | 119 |
| `pct` | number | [0,1] | 121 |
| `peakHz` | number | Hz | 122 |
| `peakDb` | number | dB | 123 |

### 2.5 Perfil espectral / pseudo-STFT (`dBProfile`, `spectralEngine.js:152-177`)

| Feature | Tipo | Dimensión | Línea | Nota |
|---|---|---|---|---|
| `profile` | Uint8Array | 96 (SPECTRUM_BUCKETS) | 162 | mapeo logarítmico dB→[0,255]; entrada directa de espectro y espectrograma |
| `maxDb` | number | escalar | 161 | pico del rango analizado |

### 2.6 Espectrograma rolling (buffer interno del instrumento)

| Feature | Tipo | Dimensión | Fuente | Nota honesta |
|---|---|---|---|---|
| `history` | Float32Array | 96×96 = 9216 | `SpectralAnalysisInstrument.jsx:62` (`sgramRef2`) | **roll de perfiles FFT, NO un STFT formal** (sin overlap-add ni ventana por columna) |
| `lastStatsTick` | ref | — | `:63` | throttle UI 150 ms (no afecta al cómputo) |

### 2.7 Estado derivado en la UI (`stats` / `levelDb`)

`stats` es el `frame` de `analyzeFrame`; `levelDb` es `frameLevelDb`. La UI presenta:
dominante, pico, centroide, planura, 3 bandas (pct + peakHz + peakDb) y dBFS.

---

## 3. Features NO disponibles hoy (gaps para el clasificador)

Ninguna de estas existe en el código auditado; se marcan como **derivables** (cálculo puro desde
`magnitudes`/`db`/`floatWindow`, sin nuevas fuentes) o **futuras** (requieren ventana/tiempo real).

| Feature | Estado | Cómo se derivaría |
|---|---|---|
| `spectralBandwidth` | **derivable** | `sqrt(Σ ((f−centroid)²·mag) / Σ mag)` sobre `magnitudes` |
| `spectralRolloff` (85%) | **derivable** | bin donde la energía acumulada supera el 85% del total |
| `zeroCrossingRate` (ZCR) | **derivable** | conteo de cambios de signo en `floatWindow` |
| `spectralFlux` | **derivable** | diferencia L2 entre `db` del frame actual y el anterior |
| `crestFactor` | **derivable** | `peak( |x| ) / rms` desde `floatWindow` |
| MFCC (13–40 coef.) | **futura** | DCT del log-mel; requiere banco mel y ventana |
| Chroma | **futura** | mapeo de bins a 12 clases de altura |
| Delta/delta-delta de features | **futura** | diferencias temporales entre frames |
| Embeddings CNN/CRNN | **futura** | modelo de audio (no existe; ver inventario) |

---

## 4. Contrato de datos crudos disponible para el extractor

Objeto `frame` que el instrumento ya calcula (una instancia por frame, `:124`):

```
frame = {
  n, sampleRate, binHertz,
  dominantFrequency, peakDb, spectralCentroid, spectralFlatness,
  totalEnergy, rms,
  magnitudes: Float32Array(2048),
  db: Float32Array(2048),
  bandEnergy: [ { name, min, max, energy, pct, peakHz, peakDb } × 3 ]
}
levelDb = frameLevelDb(floatWindow)   // dBFS escalar
history = Float32Array(96×96)          // espectrograma rolling
```

---

## 5. `profileEntropy`: revisión de 2026-10-05 (`acoustic.feat.v1` → `acoustic.feat.v2`)

**Decisión:** `acoustic.feat.v1` queda **CONGELADO**. `acoustic.feat.v2` corrige **solo** la feature 21.
Los 22 nombres, su orden y el contrato de 44 dims **no cambian**: cambian 2 valores.

### 5.1 Qué estaba mal

`profileEntropy` es la entropía de Shannon de la distribución de energía del espectro, normalizada
por `log(96)` para caer en `[0,1]`. La fórmula es correcta. **La implementación no lo era**, por dos
defectos independientes:

1. **Potencia equivocada.** Usaba `db[i] ** 2`. `db[i]` es un valor en **dBFS**, es decir una magnitud
   *logarítmica* ya normalizada. `db[i] ** 2` no es potencia: es el cuadrado de un logaritmo. Como
   `db[i]` se satura contra el suelo (`-120 dB`), la operación aplasta el espectro y reparte la
   energía casi por igual entre las 96 bandas. Resultado: **cualquier señal lejana o casi silenciosa
   obtenía entropía cercana a 1**, incluido el silencio digital.
2. **Truncamiento del espectro.** Repartía `2048 / 96 = 21,33` bins por banda usando
   `Math.floor(db.length / 96)` = **21** como tamaño, de modo que la última banda empezaba en el bin
   2016: los **32 bins de 21,71–22,05 kHz se descartaban** en silencio. Con 21 bins fijos en lugar de
   21,33 el error de reparto era de hasta 3,3 bins por banda.

Los dos efectos se suman en la misma dirección: v1 aplanaba el espectro y luego lo recortaba.

### 5.2 La corrección (v2)

- **Potencia lineal:** `magnitudes[i] ** 2`, no `db[i] ** 2`. `frame.magnitudes` es el módulo lineal de
  la FFT, que es donde vive la energía real.
- **Cobertura completa:** los 2048 bins se reparten en 96 bandas con **bordes fraccionarios**
  (`start = floor(b·2048/96)`, `end = floor((b+1)·2048/96)`). Se leen los 2048 bins, sin truncar.
- Rango, unidades y nombre se conservan: `[0,1]`, adimensional, `profileEntropy` en el índice 21.

### 5.3 Impacto medido

Valores de `profileEntropy` por frame (mediana de 63 frames, clip de 3 s, 44,1 kHz):

| Señal | v1 (congelado) | **v2 (vigente)** | Lectura |
|---|---|---|---|
| Silencio digital | 1,0000 | **0,0000** | v1 daba entropía **máxima** al silencio |
| Tono 1 kHz | 0,9893 | **0,0000** | v1 no distinguía un tono de ruido |
| Ruido blanco | 0,9979 | **0,9901** | correcto en ambas |
| Ruido rosa | 0,9218 | **0,5143** | v1 lo confundía casi con blanco |

**Por qué importa.** En v1 el silencio (1,00) y el ruido blanco (0,998) eran prácticamente idénticos:
la feature era **incorrelacionable con el tipo de señal**. Un clasificador no habría aprendido de la
señal, sino de un artefacto numérico. v2 separa tono (≈0) de ruido blanco (≈0,99) de forma rotunda,
y sitúa el ruido rosa en medio, que es donde le corresponde.

En las 44 dims solo cambian `mean_profileEntropy` (índice 21) y `std_profileEntropy` (índice 43).
Las otras **42 dims son idénticas carácter por carácter**. Verificado con
`tools/cmsc-data-logger/test/schema-v2.test.mjs` (test `v1 y v2 difieren EXCLUSIVAMENTE en el indice 21`).

### 5.4 Qué NO se tocó

`analyzeFrame()` no se modifica. `profileEntropyV2` solo **lee** `frame.magnitudes`; no muta `db`,
ni `magnitudes`, ni `rms`. La paridad con S30 (`test/parity.test.mjs`) sigue intacta, y el
espectro que se ve en `/dashboard-cmsc` es idéntico antes y después.

### 5.5 Reproducir el congelado

```bash
cd tools/cmsc-data-logger
node -e "import('./src/features.js').then(async m=>{
  const s=await import('./src/synth.js');
  const x=s.toneMix(s.clipLength(44100),44100,[{hz:1000,amp:0.6}]);
  const f=m.analyzeFrame(x,44100);
  console.log('tono 1kHz  v1',m.profileEntropyV1(f.db).toFixed(4),' v2',m.profileEntropyV2(f.magnitudes).toFixed(4));
})"
```

---

## 6. Notas de honestidad (invariante del ecosistema)

1. **La fuente es real:** S30 = micrófono local vía WebAudio; `clase_senal: LOCAL`, `estado: REAL-LOCAL`
   (`signalCatalog.js:26`). Es la única señal acústica real con DSP local del ecosistema.
2. **El "STFT" es un espectrograma rolling de FFT**, no un STFT con overlap-add/multi-resolución.
   Debe nombrarse con precisión al alimentar IA; no confundir profundidad temporal con resolución.
3. **El motor no usa librerías externas** (FFT radix-2 propia): cada feature es reproducible y auditable.
4. **`smoothingTimeConstant = 0.55`** del `AnalyserNode` introduce memoria temporal implícita:
   el primer frame no es independiente; para IA conviene documentar el estado del analizador.
5. **No hay modelo entrenado.** Estas features son materia prima; cualquier salida de IA deberá nacer
   en estado `DISENO` hasta que exista un clasificador validado (ver `AI_ACOUSTIC_ROADMAP_V1.md` y `AI_MODEL_INVENTORY.md`).
6. **La feature 21 tiene dos versiones y solo una es válida.** `acoustic.feat.v1` está CONGELADO con un
   defecto conocido (§5) y no debe usarse para entrenar. Si algún día aparece un modelo con features v1,
   su entrada está obsoleta por definición: el mismo silencio y el mismo ruido blanco recibían casi el mismo valor.
