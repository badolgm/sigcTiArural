# CMSC AI ACOUSTIC — RULES-V0 (DISEÑO)

- **Misión:** `ACOUSTIC_E4_RULES_V0_DESIGN`
- **Fecha:** 2026-10-06
- **Estado:** `DISEÑO` — **NO IMPLEMENTADO**
- **Clasificador:** `rules-v0` · método **determinista** (heurística), NO ML
- **Entrada:** vector de 44 dims (`acoustic.feat.window.v2`, mean+std de 22 features)
- **Fuentes (solo estas):** `labels.csv` · `metadata/schema.json` · `features/acoustic_features_v2.csv` · `tools/cmsc-data-logger/src/features.js`
- **Referencia canónica de salida:** `docs/AI_ACOUSTIC_ARCHITECTURE_V1.md` §4.1 (`AcousticClassification`)
- **Prohibido por misión:** entrenar, crear modelos ML, tocar S81/S82, crear endpoints. Este documento es diseño puro.

---

## 0. Regla de honestidad (heredada de la arquitectura §4.2)

> Con clasificador determinista (Sprint 3) → `method:'rules-v0'`, estado visible **`SIM`** (es heurística, no
> aprendizaje). Solo ML validado sobre datos reales etiquetados → `method:'ml-v1'`, estado `REAL-LOCAL`.

- rules-v0 **nunca** se presenta como `REAL-LOCAL` ni como IA.
- rules-v0 **no** produce probabilidades reales: produce **scores de regla** (0..1) que el contrato expone como
  `confidence`, siempre acompañados de `method:'rules-v0'` y `degraded` honesto.
- Con `sourceMode:'no-model'` (sin clasificador activo) S81 sigue en `DISENO`. Este diseño define rules-v0;
  su activación es misión de implementación futura.

---

## 1. Reglas propuestas

rules-v0 es un **árbol de decisión determinista por umbrales**: va de lo más general a lo más específico.
Toda condición usa exclusivamente columnas de `acoustic_features_v2.csv` (44 dims). No hay estado
acumulativo fuera del vector; el clasificador es **puro**: mismo vector → misma salida.

### 1.1 Etapa 0 — Puerta de señal (siempre primero)

| # | Regla | Condición (todas las AND) | Acción |
|---|---|---|---|
| R0.1 | Audio muerto / sin señal | `mean_rms < 0.0005` Y `mean_logEnergy < 0.5` Y `mean_zeroCrossingRate < 0.001` ⚠️ AC-5 actúa antes en ingesta; aquí es clasificación en vivo | → `silencio` con `confidence` baja + nota `degraded` |
| R0.2 | Saturado / clipping | `std_peakDbNorm < 0.02` Y `mean_peakDbNorm >= 0.99` Y `mean_crestFactor < 1.5` ⚠️ AC-6 actúa antes en ingesta | → `motor` NO: es artefacto, no clase. → `ruido_desconocido` |
| R0.3 | Nivel global insuficiente | `mean_levelDb < 0.20` Y `mean_peakDbNorm < 0.35` | solo silencioso si `R1` confirma; si no, indeterminado |

### 1.2 Etapa 1 — SILENCIO

| Condición (todas AND) | Racional físico |
|---|---|
| `mean_levelDb < 0.45` | piso de ruido bajo |
| `mean_peakDbNorm < 0.70` | sin pico episódico fuerte |
| `mean_rms < 0.10` | energía espectral mínima |
| `mean_spectralFlux < 0.9` | sin variación de espectro entre frames |
| `std_spectralFlux < 0.5` | sin ráfagas |
| `mean_profileEntropy < 0.30` | baja entropía: no hay "contenido" que repartir (v2 mide potencia; silencio ≈ 0) |

> Ancla real disponible: el único clip del dataset hoy (`ac_20261006_215109_000`, silencio real validado).
> Sus medias: `mean_levelDb=0.714`, `mean_rms≈1.61`. → **el umbral `levelDb < 0.45` es LAXO de modo
> provisional** y debe recalibrarse contra el piso del lugar de captura (site_a al menos). La condición de
> entropía y flux es la discriminante, no el nivel.

### 1.3 Etapa 2 — MOTOR

| Condición (todas AND) | Racional físico |
|---|---|
| `mean_levelDb >= 0.45` | señal sostenida (contrapunto de silencio) |
| `mean_bandPctLow >= 0.55` | energía concentrada en 20–250 Hz |
| `mean_centroidNorm < 0.25` | centro de masa espectral grave |
| `std_bandPctLow < 0.15` | el grave es estacionario, no parpadea |
| `std_spectralFlux < 2.5` | maquinaria estacionaria: poco cambio frame-a-frame |
| `mean_zeroCrossingRate < 0.10` | contenido tonal grave |

### 1.4 Etapa 3 — VIENTO

| Condición (todas AND) | Racional físico |
|---|---|
| `mean_bandPctLow >= 0.35` | rugosidad de banda ancha con energía grave |
| `mean_bandPctHigh < 0.08` | sin estructura aguda dominante |
| `mean_profileEntropy >= 0.30` | es ruido, no tono → entropía real |
| `std_profileEntropy >= 0.10` | el carácter ruidoso varía (rafagas de viento) |
| `mean_crestFactor < 4.0` | flujo continuo, no impulsos |
| `mean_spectralRolloffNorm < 0.5` | espectro sin cola aguda prominente |

### 1.5 Etapa 4 — AGUA

| Condición (todas AND) | Racional físico |
|---|---|
| `mean_bandPctLow < 0.60` | menos grave que motor |
| `mean_bandPctHigh >= 0.05` | presencia de chasquido agudo (goteo/oleaje) |
| `mean_profileEntropy >= 0.35` | contenido ruidoso real |
| `std_spectralFlux >= 0.8` | variación por salpicadura |
| `mean_crestFactor >= 1.8` | micro-impulsos (gota) elevan el crest |

> **Confusión conocida con lluvia:** agua y lluvia comparten banda ancha. Discriminante adicional declarado:
> **temporalidad**. Agua (goteo/curso) tiende a mayor `std_crestFactor` relativa y menor `mean_bandPctMid`
> que lluvia. Umbral provisional: `mean_bandPctMid < 0.45` sesga a agua; `>= 0.45` sesga a lluvia.

### 1.6 Etapa 5 — LLUVIA

| Condición (todas AND) | Racional físico |
|---|---|
| `mean_bandPctLow < 0.60` | no es motor |
| `mean_bandPctHigh >= 0.06` | impacto de gota en banda alta |
| `mean_profileEntropy >= 0.45` | lluvia es el ruido más "plano" del corpus |
| `std_profileEntropy >= 0.10` | cambiante (chubascos) |
| `mean_bandPctMid >= 0.45` | discriminante vs agua (provisional) |
| `mean_spectralFlux >= 1.5` | muchas micro-transiciones |

### 1.7 Etapa 6 — INSECTOS

| Condición (todas AND) | Racional físico |
|---|---|
| `mean_centroidNorm >= 0.30` | estridulación = energía en agudos |
| `mean_bandPctHigh >= 0.10` | ocupación de banda alta |
| `mean_profileEntropy < 0.45` | tono + pulsos repetitivos → entropía moderada |
| `std_dominantHzNorm < 0.08` | tono estable (no barrido) |
| `std_bandPeakHighNorm < 0.12` | el pico agudo no viaja mucho |

### 1.8 Etapa 7 — AVE

| Condición (todas AND) | Racional físico |
|---|---|
| `mean_bandPctHigh >= 0.05` | vozido agudo |
| `mean_profileEntropy >= 0.25` | no es tono puro: hay armónicos + trino |
| `std_bandPctHigh >= 0.10` | la ocupación aguda varía (trinos/golpes) |
| `std_spectralFlux >= 1.5` | fraseo: mucha variación entre frames |
| `mean_crestFactor < 6.0` | no es impulso eléctrico puro |

> **Confusión declarada con insectos (nota taxonómica de `labels.csv`):** registros nocturnos. Discriminante
> provisional: insectos tiene `std_dominantHzNorm` bajo (tono fijo); ave tiene `std_bandPctHigh` alto
> (fraseo variable). La regla **no resuelve** un clip de ave muy tonal; en ese caso debe caer en indeciso
> (íp. §6).

### 1.9 Etapa 8 — VOZ

| Condición (todas AND) | Racional físico |
|---|---|
| `mean_bandPctMid >= 0.35` | formantes en 250–2.000 Hz |
| `mean_profileEntropy >= 0.20` | habla no es tono puro |
| `mean_zeroCrossingRate >= 0.05` | sibilantes y consonantes (cruces altos) |
| `std_spectralFlux >= 0.8` | silabeo: variación continua |
| `std_levelDb >= 0.05` | prosodia (modulación de amplitud) |

### 1.10 Etapa 9 — INDECISO / OOD

Si **ninguna** regla 1..8 dispara, o la ventaja sobre la segunda mejor es `<= 0.10`:

```
label = 'ruido_desconocido'   (bucket OOD — no se fuerza a una clase viva)
```

Regla de protección (heredada de `labels.csv`): "NUNCA se fuerza un clip ambiguo a una clase viva".

---

## 2. Features utilizadas

Vector completo: **44 dims** (`acoustic.feat.window.v2` = `mean_<f>` + `std_<f>` para cada una de las 22
features, en el orden inmutable de `FEATURE_SCHEMA_V2`). Mapa de feature → dimensiones de CSV:

| # col (0-based) | Feature | Rol en rules-v0 |
|---|---|---|
| 0,22 | `dominantHzNorm` | INSECTOS/AVE: estabilidad del tono (std) |
| 1,23 | `peakDbNorm` | puerta R0.2/R0.3, SILENCIO |
| 2,24 | `centroidNorm` | MOTOR(grave) vs INSECTOS/AVE(agudo) |
| 3,25 | `flatness` | distinguir ruido (alto) de tono (bajo) — apoyo |
| 4,26 | `rms` | SILENCIO, ACTIVE puerta |
| 5,27 | `logEnergy` | puerta R0.1 |
| 6,28 | `levelDb` | SILENCIO, MOTOR, puertas |
| 7–9, 29–31 | `bandPctLow/Mid/High` | espina dorsal espectral por clase |
| 10–12, 32–34 | `bandPeakLow/Mid/HighNorm` | localización exacta de picos por banda |
| 13–15, 35–37 | `bandPeakDb*` | confirmar presencia/ausencia de energía por banda |
| 16,38 | `spectralBandwidthNorm` | apoyo (ancho del espectro) — no usado primario |
| 17,39 | `spectralRolloffNorm` | VIENTO (cola aguda), apoyo |
| 18,40 | `zeroCrossingRate` | MOTOR bajo vs VOZ/LLUVIA alto |
| 19,41 | `crestFactor` | AGUA/impulsos (alto) vs VIENTO/flujo (bajo) |
| 20,42 | `spectralFlux` | SILENCIO (≈0) vs frases (AVE/VOZ) vs estacionario (MOTOR) |
| 21,43 | `profileEntropy` | ruido real (≥0,3) vs tono/silencio (<0,3) — discriminante clave, v2 |

**Uso real:** las reglas tocan ~22 de las 44 dims; el resto queda disponible para calibración de `ml-v1`
futuro. **Todas** las condiciones se evalúan sobre el vector de 44 → el CSV es la única fuente de entrada.

---

## 3. Clase objetivo

Single-label, 9 clases (binding `labels.csv`):

| class_index | class_id | dir_name | OOD | rules-v0 destinación |
|---|---|---|---|---|
| 0 | `silencio` | silencio | no | etapa 1 (directa) |
| 1 | `viento` | viento | no | etapa 3 |
| 2 | `lluvia` | lluvia | no | etapa 5 |
| 3 | `agua` | agua | no | etapa 4 |
| 4 | `insectos` | insectos | no | etapa 6 |
| 5 | `ave` | ave | no | etapa 7 |
| 6 | `voz` | voz | no | etapa 8 |
| 7 | `motor` | motor | no | etapa 2 |
| 8 | `ruido_desconocido` | desconocido | **sí** | etapa 9 (OOD) |

Nota: `ruido_desconocido` **no se captura a demanda**, pero sí es destino de clasificación en vivo (todo lo
que no satisface 1..8 cae ahí; no debe forzarse). Etiqueta es el único `class_id` (no `dir_name`) — respetar
`AcousticClassification.label` = `class_id` mayúsculas para las 8 vivas y `RUIDO DESCONOCIDO` para OOD
(ver §7).

---

## 4. Confidence

- `confidence` = **score de la regla ganadora**, calculado como **mínimo de las condiciones satisfechas**
  (closure conservadora, coherente con el canon de confianza del ecosistema: C = MIN de anclas).
- Por condición umbral se computa una **membresía** `m ∈ [0,1]`:
  - Condición comparativa típica `x < T`: `m = clamp01(1 - (x - T) / (margen))` con margen declarado por umbral.
  - `m = 0` si la condición falla.
- `confidence = min(m1, m2, ..., mk)` de la regla que dispara. → una condición justo en el umbral da
  confianza baja (correcto: el punto de frontera es dudoso).
- **Margin de decisión:** `d = confidence_1st - confidence_2nd`. Si `d <= 0.10` → etapa 9 (OOD), aunque la
  1ª regla haya disparado: **heurística que duda es honesta, que adivina es ruido**.
- Escala: [0,1]. Sin calibración garantizada: rules-v0 **no produce probabilidades**; `confidence` es un
  score de regla y así debe leerse en la UI.

---

## 5. Casos OOD

| Caso | Señal tipo | Cómo lo ve rules-v0 | Destino |
|---|---|---|---|
| Saturado/clipping | amplitud plana a 1,0 | R0.2 dispara | `RUIDO DESCONOCIDO` (arte Facto, no clase) |
| Audio muerto en vivo | todo ≈0 | R0.1 dispara | `silencio` con `degraded` (puerta de señal, no clase aprendida) |
| Música | banda ancha estructurada armónica | no satisface 1..8 (alta entropía + formantes no-fonológicos) | `RUIDO DESCONOCIDO` |
| Evento rural nuevo (tractor, campana, zumbido eléctrico) | no en el árbol | ninguna regla dispara o margin < 0,10 | `RUIDO DESCONOCIDO` |
| Voz con música de fondo | mezcla | condiciones de VOZ se diluyen (entropía alta) | `RUIDO DESCONOCIDO` |
| Ave muy tonal vs insecto nocturno | tono agudo sostenido | `std_bandPctHigh` bajo acerca a insectos pero `std_dominantHzNorm` alto lo contradice | `RUIDO DESCONOCIDO` (ver §1.8) |

**Regla dura:** OOD nunca forcejea a una clase viva. `RUIDO DESCONOCIDO` es el bucket de rechazo legítimo.

---

## 6. Fixtures de prueba

Diseño de fixture: **generar WAV PCM sintético determinista → `features.js` → vector 44 → expectativa**.
Esto valida (a) que el árbol dispara, (b) que la implementación es determinista. **Sin entrenar**; son
plantillas de validación, no datos de captura.

| Fixture | Señal sintética (3 s, 44.100 Hz) | Expectativa rules-v0 |
|---|---|---|
| F01 silencio ancla | repetición del clip real `silencio` (ya en dataset) | `silencio` |
| F02 silencio digital | zeros; husillo AC-5 lo rechazaría en ingesta, aquí solo clasifica | `silencio` + `degraded` |
| F03 motor | tono 60 Hz + armónicos 120/180/240 Hz, envolvente estable | `motor` |
| F04 viento | ruido rosa filtrado 20–1.000 Hz, AM lenta | `viento` |
| F05 lluvia | ruido blanco filtrado 500–10.000 Hz, AM irregular | `lluvia` |
| F06 agua | ruido blanco + impulsos periódicos 8 Hz (goteo) | `agua` |
| F07 insectos | tono 6.500 Hz AM a 180 Hz (estridulación) | `insectos` |
| F08 ave | chirps de barrido 1→6 kHz en ráfagas de 180 ms | `ave` |
| F09 voz | voz de referencia no-identificable (u/i/a con silabeo) | `voz` |
| F10 saturado | sine 1 kHz a full-scale con clipping | `RUIDO DESCONOCIDO` |
| F11 música | acorde sintético 440+554+659 Hz (no fonológico) | `RUIDO DESCONOCIDO` |
| F12 OOD revuelto | mezcla tono+ruido con margin < 0,10 | `RUIDO DESCONOCIDO` |

Cada fixture declara también `confidence` esperada (rango) y `margin` esperado. Son el contrato de oro de
rules-v0; cualquier cambio de regla debe reprobarlos.

> Advertencia honesta: F01 es el **único** fixture con materia real. Los demás son síntesis y no prueban el
> mundo rural real; sirven para el **mecanismo**, no para el **rendimiento**. El rendimiento real se mide
> contra el piloto de 100 muestras (G-DS-2/G-DS-6), pendiente.

---

## 7. Contrato de salida

Alineado con `AI_ACOUSTIC_ARCHITECTURE_V1.md` §4.1 (`AcousticClassification`), `method:'rules-v0'`:

```js
{
  signalId: 'S81',
  label: 'SILENCIO',            // class_id mayúscula de las 8 vivas, o 'RUIDO DESCONOCIDO'
  confidence: 0.72,             // score de regla 0..1 (NO es probabilidad; leer §4)
  probabilities: {              // scores por clase (no prob.): solo la ganadora > 0, resto 0
    'SILENCIO': 0.72, 'VIENTO': 0, 'LLUVIA': 0, 'AGUA': 0,
    'INSECTOS': 0, 'AVE': 0, 'VOZ': 0, 'MOTOR': 0, 'RUIDO DESCONOCIDO': 0
  },
  modelVersion: 'acoustic-rules-v0',
  method: 'rules-v0',           // determinista, heurística
  sourceMode: 'live' | 'fallback' | 'no-model',
  degraded: false,              // true si sourceMode != 'live'
  featureMeta: {
    schema: 'acoustic.feat.v2',
    schemaSize: 22,
    window: 'acoustic.feat.window.v2',
    windowDims: 44,
    frames: 63,
    sampleRate: 44100,
    nFft: 4096,
    hop: 2048
  }
}
```

- `label`/`confidence` nunca se fabrican: si **ninguna** regla dispara → `label:'RUIDO DESCONOCIDO'`,
  `confidence` = mejor candidato (o 0), `degraded:true`.
- `sourceMode` honesto: `no-model` → `confidence:null`, estado `DISENO`; `rules-v0` activo → `live` con
  estado `SIM`. Nunca `REAL-LOCAL`.
- Sin endpoint: la Fase 1 acústica es 100 % cliente (browser). El endpoint es evolución posterior (Sprint 4+).

---

## 8. Límites declarados

1. Los umbrales de 1..8 son **provisionales**, fijados por física + el único ancla real (silencio). Deben
   recalibrarse con el piloto de 100 muestras.
2. rules-v0 **no** es un modelo productivo: su propósito es dar una base determinista, auditable y sincera
   antes de `ml-v1-tabular`. No se presenta como IA.
3. Agua/lluvia, ave/insectos nocturno y mezclas son fronteras conocidas (§1.5, §1.8): la regla prefiere OOD
   a clase forzada.
4. Los Fixtures F02..F12 son síntesis: validan el mecanismo, no el mundo rural real.

---

## 9. Salida a implementación (futura, NO en esta misión)

- Registro S81 `clase_senal:IA`, estado `SIM` (no `REAL-LOCAL`).
- `src/frontend/src/pages/cmsc/acoustic/rules-v0.js` (árbol puro + membresías).
- Panel de presentación honesta (`ModelPredictCell` compatible).
- Punto de enganche `useSpectralFrame()` (aditivo, sin tocar `SpectralAnalysisInstrument` interno).
- tests de contracto con los 12 fixtures (§6).
- Calibración de umbrales contra piloto 100 (G-DS-2) antes de cualquier paso a `ml-v1`.