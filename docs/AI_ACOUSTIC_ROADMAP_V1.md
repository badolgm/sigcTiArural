# AI ACOUSTIC ROADMAP — V1

**Misión:** CMSC_AI_ACOUSTIC_V1 · **FASE 7**
**Fecha:** 2026-10-02 · **HEAD:** `83b6089` · **Estado:** DISEÑO (sin implementación)
**Objetivo macro:** convertir `LIVE · ANÁLISIS ESPECTRAL` (S30) en la primera fuente de IA alimentada por
**señal física real** del ecosistema, sin romper nada existente.

**Documentos rectores:**
- `docs/AI_ACOUSTIC_FEATURE_MAP.md` (qué se puede extraer hoy)
- `docs/AI_ACOUSTIC_ARCHITECTURE_V1.md` (contratos, S81, S82, integración, riesgos)
- `docs/AI_MODEL_INVENTORY.md` (qué IA existe realmente)

**Invariantes en todo el roadmap**
- `NO tocar`: Hero, Workbench V6, Dashboard, estilos, `useLabStore`, TelecomLab, `signalCatalog` existente, `App.jsx`.
- Todo es **aditivo**; la cadena S30→features→clasificador→presentación es de **solo lectura**.
- Honestidad: sin modelo validado, S81/S82 = `DISENO`. Nunca resultados de adorno.
- Cadencia del clasificador acotada (2–5 Hz), nunca por `requestAnimationFrame`.

---

## Sprint 1 · Arquitectura (Fundaciones)

**Entregables**
- Congelar `acoustic.feat.v2` (22 features · orden inmutable · normalización por feature). `v1` queda CONGELADO como histórico, solo para reproducibilidad.
- ADR de `featureExtractor` / `AcousticClassifier` / `AnomalyDetector` (contratos de `AI_ACOUSTIC_ARCHITECTURE_V1.md`).
- Diseño del **punto de enganche de solo lectura** (hook/evento) — sin tocar el instrumento.
- Protocolo de **dataset acústico etiquetado**: 9 clases, entorno real, metadatos (lugar, hora, mic, SR), consentimiento.

**Gate S1:** esquema y contratos aprobados por Bernardo; cero código en Hero/WB/Dashboard.
**Esfuerzo:** 2–3 días.

---

## Sprint 2 · Feature Extraction

**Entregables**
- `acoustic/featureExtractor.js` (puro, determinista, finite-safe, versionado).
- Features derivadas: `spectralBandwidth`, `spectralRolloff`, `zeroCrossingRate`, `crestFactor`, `spectralFlux`, `profileEntropy`.
- **Tests golden** con `frame` sintético de referencia (frecuencia/semilla fijas) → vector estable.
- Validación de finitud y de rango de cada dimensión.
- **Sin modelo, sin UI, sin backend.**

**Gate S2:** vector reproducible y estable; `schemaSize` y orden congelados; 0 dependencias nuevas.
**Esfuerzo:** 3–4 días.

---

## Sprint 3 · Clasificación básica

**Entregables**
- `acoustic/AcousticClassifier.js` con `ModelBackend` intercambiable.
- Backend `rules-v0` determinista (umbrales sobre features: VAD por `levelDb`/`flatness`, bandas de energía,
  ZCR/centroide) → 9 clases con `method:'rules-v0'`, estado visible **`SIM`**.
- `S81` registrada (aditivo) + panel de presentación honesto (`label`, `confidence`, `sourceMode`).
- **No** se declara "IA real": es heurística etiquetada como tal.

**Gate S3:** clasificación en vivo estable a 2–5 Hz; FPS del instrumento sin degradación; badge honesto.
**Esfuerzo:** 4–5 días.

---

## Sprint 4 · Predicción avanzada (primer modelo ML real)

**Entregables**
- Dataset acústico etiquetado y balanceado (del Sprint 1) + split con seed fijo + manifiesto.
- Entrenamiento `ml-v1` (p. ej. modelo sobre `acoustic.feat.v2`, o CNN/CRNN sobre mel si el dataset lo permite).
- Evaluación con métricas del pipeline existente (`benchmark/src/metrics.py`: F1, balanced acc, ECE/calibración).
- Integración de inferencia **cliente** (import dinámico, sin engordar el bundle global) o endpoint
  `/classify-audio` en `ai_service` (reutilizando el contrato EIARC/`source_mode`).
- `S81` pasa a `method:'ml-v1'`, estado **`REAL-LOCAL`** **solo si** supera el gate de validación.

**Gate S4:** métricas ≥ umbral acordado en validación cruzada + holdout de entornos; sin sobreajuste al mic de lab;
decisión de promoción de estado documentada (patrón del gate M1/M2).
**Esfuerzo:** 8–12 días + recolección de campo.

---

## Sprint 5 · Anomaly Detection (S82)

**Entregables**
- `acoustic/anomaly.js`: baseline incremental (media/σ rodante) → `IsolationForest`/autoencoder ligero si procede.
- `S82` registrada (aditivo), estado **`DISENO`/EXPERIMENTAL**.
- `baselineState` (`cold-start`→`ready`): **cero alertas** durante calibración.
- Verdictos: `ANOMALÍA` · `EVENTO NUEVO` · `PATRÓN RARO`, con `score` y `threshold` reales.

**Gate S5:** baseline reproducible; tasa de falsos positivos acotada en sesión de reposo; cold-start silencioso.
**Esfuerzo:** 6–8 días.

---

## Sprint 6 · Knowledge Hub

**Entregables**
- Evidencia acústica (S81/S82) → **Evidence Ledger** (lectura/registro local) → presentación en KH por `docsBySignal`.
- Enlace de la clasificación a documentos (regla F3E-3: una sola fuente, vista derivada).
- Dieta del ACP: solo conocimiento verificado; respuestas `NO_DATA/DISEÑO` cuando no hay evidencia.
- Panel de evidencia: método, versión de modelo, esquema de features, confianza heredada (jamás mejorada).

**Gate S6:** trazabilidad completa señal→feature→clasificación→evidencia→documento; cero punteros duplicados.
**Esfuerzo:** 4–6 días.

---

## Resumen de gates y estados

| Sprint | Foco | Estado de S81/S82 al cerrar |
|---|---|---|
| 1 | Arquitectura | DISEÑO |
| 2 | Feature Extraction | DISEÑO |
| 3 | Clasificación básica (rules-v0) | S81 = SIM (heurística) |
| 4 | Modelo ML real | S81 = REAL-LOCAL (solo si gate) · S82 = DISEÑO |
| 5 | Anomaly Detection | S82 = EXPERIMENTAL (cold-start controlado) |
| 6 | Knowledge Hub | evidencia trazable, sin cambio de estado |

## Dependencias críticas
1. **Datos acústicos etiquetados** (brecha #1; hoy no existe ninguno). Sin ellos, el Sprint 4 no puede cerrar.
2. **Punto de enganche de solo lectura** del instrumento (habilitado por misión de implementación explícita).
3. **Decisión de inferencia** cliente (on-device) vs servicio (`/classify-audio` en 8081).
4. **Gobernanza de promoción de estado** (patrón del gate benchmark M1/M2), para pasar S81 de `SIM` a `REAL-LOCAL`.

## Fuera de alcance (explícito)
- Sustituir o duplicar TelecomLab/`S30`/"Lab espectral".
- Tocar Hero, Workbench V6, Dashboard, estilos o la arquitectura existente.
- Entrenar o importar modelos en esta misión (SOLO DISEÑO).

## Próximo paso recomendado
Ejecutar **Sprint 1** (congelar esquema + protocolo de dataset + diseño del hook). Ver
`AI_ACOUSTIC_ARCHITECTURE_V1.md` §"Próximo paso recomendado".
