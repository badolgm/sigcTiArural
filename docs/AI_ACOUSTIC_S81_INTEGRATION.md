# AI ACOUSTIC — S81 INTEGRATION & GOVERNANCE (DISEÑO)

**Misión:** CMSC_ACOUSTIC_DATASET_AND_MODEL_V1 · **FASE 7 · Integración de S81 en el ecosistema**
**Fecha:** 2026-10-02 · **HEAD:** `83b6089` · **Estado:** SOLO DISEÑO — sin código, sin rutas nuevas, sin tocar UI
**Regla de honestidad:** S81 **no existe** como señal activa hoy. Se registra como diseño aditivo; su estado
visible es `DISENO` hasta que exista un modelo validado (FASE 4/5, gate G-M-2 ∧ G-DS-2).

**Hereda de:**
- `docs/AI_ACOUSTIC_ARCHITECTURE_V1.md` (S81/S82, hook, riesgos)
- `docs/AI_ACOUSTIC_DATASET_V1_DESIGN.md` (dataset + logger)
- `docs/AI_ACOUSTIC_MODEL_BENCHMARK.md` (Model V1 + gate de promoción)
- `CMSC_CANONICAL_STATES_APPENDIX_V1.md` (7 estados + terminología `clase_senal`/`dominio`)
- `CMSC_F3E_KNOWLEDGE_INTEGRATION_STRATEGY_v1.md` (regla F3E-3: `docsBySignal` fuente única)

---

## 1. Registro de S81 (aditivo, NO se implementa aquí)

Ficha propuesta para añadir a `signalCatalog.js` **en misión de implementación explícita** (sin tocar las
entradas S01..S80 existentes):

| Campo | Valor |
|---|---|
| `signal_id` | **S81** |
| `name` | ACOUSTIC INTELLIGENCE |
| `short` | Clasificación ambiental sobre micrófono local |
| `clase_senal` | `IA` |
| `dominio` | `Acústicas` |
| `estado` (declarado objetivo) | `REAL-LOCAL` |
| `estado` (honesto actual) | ⚠️ `DISENO` — degradación automática sin modelo |
| `origen` | `featureExtractor` + `AcousticClassifier` sobre **S30** |
| `fuente` | S30 (micrófono local) |
| `cadencia` | 2–5 Hz (acotada, NO por `rAF`) |
| `puerto` | `P-LAB-02` |
| `consumidores` | `ModelPredictCell` · Knowledge Hub · ACP |
| `clases` | `SILENCIO · VIENTO · LLUVIA · AGUA · INSECTOS · AVE · VOZ · MOTOR · RUIDO DESCONOCIDO` |
| `metodo` | `none` \| `rules-v0` \| `ml-v1` |
| `confianza` | probabilidad calibrada 0..1 (o `null`) |
| `metadata_ref` | `SIGNAL_MAP 1.7 · AI_ACOUSTIC_ARCHITECTURE_V1 · AI_ACOUSTIC_MODEL_BENCHMARK` |

**S82** (ENVIRONMENTAL ANOMALY DETECTOR) sigue el mismo patrón: `clase_senal:'EXPERIMENTAL'`,
`estado:'DISENO'`, `origen` = modelo no supervisado sobre `acoustic.feat.v2`, puerto `P-LAB-02`.

---

## 2. Cadena de integración (solo lectura)

```
SpectralAnalysisInstrument (S30 · REAL-LOCAL)
      │  frame + levelDb + timeDomain + history           [hook de solo lectura, aditivo]
      ▼
featureExtractor.js  (acoustic.feat.v2 → acoustic.feat.window.v2)
      ▼
AcousticClassifier   (backend: none | rules-v0 | ml-v1)
      ▼
S81 AcousticClassification  (+ S82 AcousticAnomaly)
      ▼
ModelPredictCell  (presentación honesta: label + confidence + estado + método)
      ▼
Knowledge Hub  (Evidence Ledger → docsBySignal; SOLO lectura/presentación)
      ▼
ACP  (dieta: solo conocimiento verificado; respuestas NO_DATA/DISEÑO sin evidencia)
```

### 2.1 Principios (NO romper)
1. **Solo lectura de S30:** el clasificador observa; nunca modifica loop, canvas ni TelecomLab.
2. **Aditivo puro:** módulos nuevos en `pages/cmsc/acoustic/`; **no** se toca Hero, Workbench V6, Dashboard,
   estilos, `useLabStore`, `signalCatalog` existente ni las 15 rutas de `App.jsx`.
3. **Desacople por cadencia:** 2–5 Hz, no por `requestAnimationFrame`.
4. **Hook sin reescribir el instrumento:** prop/emit opcional `onFrame`; el instrumento no conoce al clasificador.
5. **Honestidad:** usa `HonestyBadge`/`sourceMode` existentes (igual que `ModelPredictCell` con S61).
6. **KH sin duplicar:** enlace por lectura (`docsBySignal`); nunca punteros en ambos lados (F3E-3).
7. **Sin backend en Fase 1:** inferencia 100% cliente. Un `/classify-audio` en `ai_service` (8081) es
   evolución posterior, reutilizando el contrato EIARC/`source_mode`.

---

## 3. Contrato de presentación (`AcousticClassification`)

```js
/**
 * @typedef {Object} AcousticClassification
 * @property {'S81'} signalId
 * @property {string} label                      // una de las 9 clases
 * @property {number|null} confidence            // calibrada 0..1, null si no hay modelo
 * @property {Record<string,number>} probabilities
 * @property {string} modelVersion               // 'none' | 'acoustic-clf-v1'
 * @property {'none'|'rules-v0'|'ml-v1'} method
 * @property {'live'|'fallback'|'no-model'} sourceMode
 * @property {boolean} degraded                  // true si sourceMode != 'live'
 * @property {FeatureMeta} featureMeta
 */
```

**Regla de UI:** el badge de estado va **siempre** junto al valor (`label`+`confidence`), nunca un label
sin su procedencia. Sin modelo → `label:'—'`, `confidence:null`, badge `DISENO`.

---

## 4. Inferencia en cliente (diseño de despliegue)

| Aspecto | Decisión de diseño |
|---|---|
| Runtime | `onnxruntime-web` (WASM) para `ml-v1-tabular`; TF.js/TFLite-WASM para `ml-v1-cnn-mel`/YAMNet |
| Carga | `import()` dinámico en el momento de activar S81; **no** en el bundle inicial |
| Tamaño | ≤ 15 MB (gate G-M-4); el modelo actual no debe engordar el entrypoint |
| Ejecución | WebWorker opcional para no competir con el rAF del instrumento |
| Fallback | `onnxruntime-web` no disponible → `rules-v0` (SIM) o `no-model` (DISENO) |
| Normalización | `mean/std` por feature versionados junto al modelo (`acoustic.feat.window.v2`) |
| Privacidad | sin subir audio; sin persistir crudo; inferencia local |

> **Sin dependencias nuevas todavía.** Este es el diseño; añadir `onnxruntime-web` u otra librería requiere
> misión de implementación explícita y control del bundle (riesgo R6/DM4).

---

## 5. Evidence Ledger → Knowledge Hub

1. Cada clasificación (`S81`) con `method:'ml-v1'` produce una **evidencia** con envelope F3E:
   `evidence_id`, `signal_id:'S81'`, `status` heredado, `trace` (frame→features→modelo), `confidence`
   **heredada sin mejora**, `method:'ml-v1'`, `model_version`, `produced_by`, `timestamp`.
2. La evidencia entra al **Evidence Ledger** (destino primario; no toca el registry generado).
3. La promoción a `knowledge-base`/`research-v2` ocurre vía **Hangar de Autenticidad** con gobernanza
   (no escritura ad-hoc).
4. El puente señal↔documento es `docsBySignal` (lectura; vista derivada; fuente única).
5. **Regla dura:** la evidencia **jamás** mejora el estado de la señal; solo lo documenta.

---

## 6. Dieta del ACP

- El ACP solo consume **conocimiento verificado** (Ledger/KH). Nunca fabrica señales ni evidencias.
- Sin evidencia acústica → respuesta `NO_DATA` / `DISEÑO` ("qué se buscó / qué falta"), nunca un label inventado.
- Confianza acotada por propagación conservadora (`C = MIN de anclas × cobertura × penalidad no-REAL`).
- El ACP puede **explicar** una clasificación (`label`, `confidence`, método, features dominantes) pero
  **no** modifica el modelo ni escribe al KH directamente (ciclo productor F3E).

---

## 7. Rollout por fases (cada una con gate)

| Fase | Entregable | Estado S81 | Gate |
|---|---|---|---|
| **I0** | Registro S81/S82 + panel placeholder honesto (`DISENO`) | `DISENO` | no tocar UI existente; build verde |
| **I1** | `featureExtractor` + `window.v2` + hook de lectura | `DISENO` | tests golden; FPS sin degradación |
| **I2** | `AcousticClassifier` con `rules-v0` | `SIM` | clasificación estable 2–5 Hz; badge honesto |
| **I3** | `ml-v1-tabular` sobre dataset propio | `REAL-LOCAL` | G-DS-2 ∧ G-M-2..6 |
| **I4** | `ml-v1-cnn-mel` (opcional) | `REAL-LOCAL` | supera a tabular en macro-F1 y ECE |
| **I5** | Evidencia → KH → ACP | (según modelo) | G-F3E; cero punteros duplicados |
| **I6** | S82 anomaly detection | `DISENO`/`EXPERIMENTAL` | cold-start silencioso; FPR acotado |

> Cada fase requiere **misión explícita de Bernardo**. Este documento no habilita código.

---

## 8. Qué debe hacer una misión de implementación (checklist)

1. Añadir S81/S82 a `signalCatalog.js` (aditivo, sin tocar S01..S80).
2. Crear `pages/cmsc/acoustic/{featureExtractor,AcousticClassifier,anomaly}.js`.
3. Añadir un hook de lectura `onFrame` **opcional** a `SpectralAnalysisInstrument` (1 prop, aditivo).
4. Panel de presentación honesta (sin alterar el layout global del dashboard).
5. Registrar keywords en `docsBySignal` (lectura).
6. Cargar el modelo por `import()` dinámico; **no** en el bundle inicial.
7. Añadir tests golden del vector de features y fixtures de rechazo (señal/confianza inventadas).
8. **NO** tocar Hero, Workbench V6, Dashboard, estilos, `useLabStore` ni `App.jsx`.

---

## 9. Riesgos específicos de integración

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| SI1 | Presentar heurística/aleatorio como IA real | 🔴 | badge `DISENO`/`SIM`; `sourceMode`+`confidence` reales; fixtures |
| SI2 | Engordar el bundle con runtime ML | 🟠 | `import()` dinámico; límite 15 MB; WebWorker |
| SI3 | Acoplar y tocar el instrumento/Workbench/Dashboard | 🟠 | hook aditivo; cero cambios fuera de `acoustic/` |
| SI4 | Duplicar evidencia en señal y KH | 🟠 | `docsBySignal` fuente única (F3E-3) |
| SI5 | Falsos positivos de S82 erosionan confianza | 🟠 | cold-start sin alertas; umbral calibrado; histéresis |
| SI6 | Privacidad de voz | 🔴 | inferencia local; sin retención; sin subida |
| SI7 | Estado S81 "promocionado" sin artefactos | 🔴 | gate G-M-2 + `validation_metrics.json` + model card |

---

## 10. Síntesis

> S81/S82 entran al CMSC por **adición pura**: se registran, se alimentan de S30 en solo lectura, se
> presentan con honestidad y se conectan al KH/ACP sin duplicar. **Hoy no existe modelo ni dataset**:
> por eso su estado visible es `DISENO`. La ruta para subir de estado está definida, gateada y medida —
> no narrada.

## Próximo paso

FASE 6 (`notebooks/CMSC_AI_ACOUSTIC_V1.ipynb`): notebook maestro de diseño que materializa (sin ejecutar)
el pipeline dataset → features → benchmark → modelo → artefactos descrito en estas fases.
