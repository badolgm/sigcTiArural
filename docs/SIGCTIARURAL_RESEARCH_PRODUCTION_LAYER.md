# SIGC&T Rural — Capa de Investigación, Experimentación, ML y Producción (U5 — diseño)

**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Tipo:** DISEÑO — no se implementó, creó ni modificó ningún archivo de código.
**Contratos base (verificados en código, NO inventados):** `/api/v3/ai/inference/` (AIPredictiva) · `EventSource /events` (DataScienceLab) · `/api/v3/telemetry/history/` + Open-Meteo (cloud.js) · registry 51 docs (18 research_v2) · catalog-data.js (10 + 5 roadmap) · projects-data.js (7, estados operativo/diseño).

> Este documento CONTINÚA y profundiza `SIGCTIARURAL_RESEARCH_EXPERIMENTATION_LAYER.md` (primitivas) y cierra el vacío de producción señalado en `SIGCTIARURAL_ECOSYSTEM_MATURITY_AUDIT.md`. SOLO DISEÑO.

---

## Principio de diseño (regla imborrable)

> Cada representación lee datos **ya existentes** a través de primitivas de presentación. No se crean stores, rutas, endpoints, archivos de datos ni módulos nuevos. Todo campo sin dato real se pinta `—`. El vocabulario honesto (`operativo / diseño / referencia`, `confidence`, `source_mode`, "Escenario demostrativo") es obligatorio en cada primitiva.

---

## 1. ¿Cómo representar una INVESTIGACIÓN?

**Primitiva: Expediente Científico** (card compacta, patrón `<details>`/chip ya establecido).

- **Identidad:** `RES-<dominio>-<n>` (p. ej. `RES-AGRI-02`), derivado del registry.
- **Fase del ciclo:** una etiqueta de 6 estados → `hipótesis → diseño → datos → modelo → validación → publicación`. Mapa con docs existentes (research_v2 taxonomy/split/execution_plan).
- **Dominio:** chip 🌱 agricultura / 🧠 IA / 📊 MLOps.
- **Evidencia:** enlace `→ /knowledge/doc/research_v2_*` (ruta real existente).
- **Estado honesto:** si el doc es de diseño (no ejecutado), el expediente lo dice explícitamente.

```
┌─ Expediente RES-AGRI-02 ────────────────────────┐
│ 🧭 fase: datos · [🌱 agricultura] [📊 MLOps]    │
│ 📄 8 docs research_v2 vinculados               │
│ [→ abrir investigación]                        │
└─────────────────────────────────────────────────┘
```

**Fuente:** `knowledgeRegistry.generated.json` (solo lectura de categoría research_v2).

## 2. ¿Cómo representar un EXPERIMENTO?

**Primitiva: Registro de Ejecución** — reutiliza el flujo SSE REAL de DataScienceLab (`/events`).

- `run_id` corto (EXP-###), timestamp.
- **Métricas reales:** `confidence` y `top_class_index` (que ya envía el SSE).
- **Modo:** badge `INFERENCIA REAL / SIMULACION / ROBOT DEMO` (ANALYSIS_MODES existente).
- **Veredicto honesto:** `pass / fail / revisar` según umbral de `confidence` contra clase esperada (regla a definir en datos, no visual decorativo).
- **Mini-tendencia:** reutiliza `MiniSparkline` (TelemetryPanel) sobre la serie de confidence.

```
┌─ EXP-017 ───────────────────────────────────────┐
│ INFERENCIA REAL · confidence 0.97 · class_1     │
│ [veredicto: PASS]  ── MiniSparkline de la serie │
└─────────────────────────────────────────────────┘
```

**Fuente:** única lectura del SSE; sin buffer propio.

## 3. ¿Cómo representar un DATASET?

**Primitiva: Ficha de Conjunto de Datos**, anclada a los 8 docs `_dataset_inventory`, `_data_quality_framework`, `_label_schema`.

- Campos que existan: `n_muestras`, `n_clases`, `split` (train/val/test), `calidad`.
- **Barra de balance de clases** (proporción simple) — comunica desbalance honesto.
- Enlace `→ /knowledge/doc/research_v2_*_dataset_inventory`.
- Campo ausente → `—` (nunca inventar).
- Sin gráfico nuevo: la barra es CSS, no librería.

```
┌─ Dataset AGRICULTURE-v2 ────────────────────────┐
│ muestras 12 400 · clases 2 · split 70/15/15      │
│ ████████░░ balance: 82/18 (desbalanceado)       │
│ [→ inventory]                                   │
└─────────────────────────────────────────────────┘
```

## 4. ¿Cómo representar un MODELO ML?

**Primitiva: Ficha de Modelo**, contrato ya desplegado en AIPredictiva.

- `model_version` (del response real).
- **Scope honesto:** `scientific_scope: binary_only` — no prometer multiclase.
- **Runtime:** clasificador binario · edge (TFLite en BBB-02) · JETSON (CUDA) / ESP32-S3 (TinyML) según ficha.
- **Confianza:** media del último experimento (SSE) o `—`.
- Enlaces: `/ai-predictive` (ruta existente) + docs `_training_pipeline`, `_model_governance`.

```
┌─ Modelo ML ─────────────────────────────────────┐
│ v2.3.1 · [binary_only] · runtime TFLite/edge    │
│ confianza avg 0.96 (último EXP-017)             │
│ [→ panel IA] [→ training pipeline]              │
└─────────────────────────────────────────────────┘
```

## 5. ¿Cómo representar PRECISIÓN y MÉTRICAS?

**Primitiva: Cinta de Métricas** (barra única de KPIs científicos), sin librerías.

- `accuracy` / `precision` / `recall` por clase → visibles SOLO si existen en el dataset/modelo actual; si no → `—`.
- `confidence` media del flujo SSE (en vivo).
- `ejecuciones` totales del experimento (contador local del SSE, honesto).
- `dataset: split + n` (de la Ficha 3).
- Representación: mini-barras CSS simples (0-100%) con umbrales por color (`≥0.95 verde · ≥0.85 amarillo · <0.85 rojo`) — umbral configurable, no embellecido.

```
┌─ Cinta de métricas ─────────────────────────────┐
│ acc 0.94 · prec 0.95 · rec 0.91 · conf 0.96 (SSE)│
│ ████████░░ precision · █████▌░░░ recall         │
└─────────────────────────────────────────────────┘
```

**Regla:** toda métrica sin fuente real se pinta `—`. Nunca "100%".

## 6. ¿Cómo representar RECOMENDACIONES IA?

**Primitiva: Consejo Técnico con Confianza explícita**, sobre `getStatusPresentation` de AIPredictiva (sin duplicarlo).

- **Veredicto:** 🟢 sana / 🟡 preventiva / 🔴 crítica (colores estándar del ecosistema).
- **Confianza SIEMPRE visible** (`confidence %`), coloreada por umbral.
- **Acción (1 línea)** + **evidencia** (experimento/doc) + **límite** (p. ej. "Escenario demostrativo", "sin despliegue productivo hoy").
- **Honestidad obligatoria:** reciclar el texto real de los DEMO_SCENARIOS existentes (confianza 0.97 enferma / 0.96 sana con la nota "No corresponde a inferencia científica oficial").

```
┌─ Recomendación IA ──────────────────────────────┐
│ ⚠️ ALERTA PREVENTIVA · confianza 97%            │
│ acción: revisar condición foliar en campo       │
│ evidencia: EXP-017 · límite: escenario demo     │
└─────────────────────────────────────────────────┘
```

## 7. ¿Cómo representar PRODUCCIÓN AGRÍCOLA REAL?

**El punto más delicado** (madurez actual 5%). Reglas no negociables:

- **Nunca** representar datos productivos que no existen (rendimiento, parcelas, riego). Sería mentira.
- La producción se representa EN DOS FORMAS seccionadas:

**A) Producción como ESTADO (hoy):**
```
┌─ Terminal de Producción ────────────────────────┐
│ 🚜 AGRICULTURA-INTELIGENTE · estado: DISEÑO     │
│ (sin despliegue productivo hoy)                 │
│ [→ proyecto] [→ datasets] [→ execution plan]    │
└─────────────────────────────────────────────────┘
```
Misma semántica de proyectos (`operativo / diseño`); el proyecto agrícola YA dice "diseño" en projects-data.js.

**B) Producción como PIPELINE (cuando existan datos):**
`señal foliar + clima → modelo → recomendación → acción de campo` — el mismo flujo de la cadena, donde el ÚLTIMO eslabón se activa solo al haber dato real y estado operativo.

**Regla de veracidad:** la terminal muestra `estado` y `n_parcelas/muestras` SOLO desde fuente real (p. ej. futuro despliegue UBTN); hoy muestra "en diseño" + contador de datasets de investigación (real).

## 8. El CICLO COMPLETO visible

```
 SENSOR ──► SEÑAL ──► DATO ──► DATASET ──► MODELO ──► IA ──► DECISIÓN ──► PRODUCCIÓN
   │         │          │        │           │        │        │           │
BBB-03    telemetría  history  inventory  model     inference  consejo   estado
IoT/Sensor LIVE/SIM   API v3    research   ficha     confident  acción    diseño→
(sensor_id)  sparkline mini      v2 docs    v2.3.1    class idx  conf +   futuro
            panel     gráfico             binary     reporte   límite    real
```

**Representación: una "Cinta de Ciclo Científico"** (franja horizontal de 8 eslabones) donde cada eslabón:

1. Se pinta CON color/estado honesto (activo: verde/cyan · diseño: ámbar · ausente: gris `—`).
2. Es un chip/link a la página completa existente del eslabón (Dashboard/TelemetryPanel/Labs/AIPredictiva/knowledge).
3. Deja ver **dónde está el ciclo verdadero**: hoy mostraría SENSOR→SEÑAL→DATO activos, DATASET/MODELO parciales, DECISIÓN→PRODUCCIÓN en diseño — un ecosistema honesto en construcción, nunca fake.

**Sin romper arquitectura:** la cinta es un componente de presentación; cada eslabón enlaza a rutas existentes; los datos se leen de los mismos contratos; la cinta NO crea nuevas fuentes de verdad y NO toca backend/Docker/telemetría/labs/KH/IA.

---

## Mapa de implementación futuro (SOLO diseño, no ejecutado)

| Eslabón | Primitiva | Ruta existente que sirve |
|---|---|---|
| Sensor | chip + estado BBB | Dashboard Mapa Grupo A |
| Señal | MiniSparkline | TelemetryPanel |
| Dato | DigitalDisplay + history | `/api/v3/telemetry/history/` |
| Dataset | Ficha dataset | research_v2 docs |
| Modelo | Ficha modelo | `/ai-predictive` |
| IA | Consejo + confianza | `/ai-predictive` + SSE |
| Decisión | Reporte accionable | Next (visual, sola) |
| Producción | Terminal estado (diseño hoy) | `/proyectos` AGRICULTURA-INTELIGENTE |

**Módulos sugeridos (futuros) en patrón ya existente `<details>`/franjas:** 🔬 Investigación activa · 🧪 Experimentos recientes · 🗂️ Datasets · 🦠 Modelo vigente · 🌡️ Señales · 🌱 Recomendación IA · 🚜 Terminal de Producción.

**Verificación de no-regresión (diseño):** cero endpoints/stores/rutas/datos nuevos · primitivas de presentación tipo TelemetryPanel/GlobalChart/ClusterCard · producción solo estado-honesto · reutilización total de componentes y contratos verificados.

**Estado:** documento de diseño. Ningún archivo de código modificado, sin commits.