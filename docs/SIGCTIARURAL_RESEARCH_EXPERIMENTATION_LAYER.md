# SIGC&T Rural — Capa de Investigación y Experimentación (diseño)

**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Tipo:** DISEÑO — no se implementó nada, no se tocó ningún archivo de código.
**Anclaje:** todas las primitivas usan contratos, endpoints y componentes YA EXISTENTES (verificación previa). No se inventan APIs.

---

## Contexto real que debe respetarse (evidencia)

| Recurso existente | Ubicación | Contrato real |
|---|---|---|
| Inferencia IA | `pages/AIPredictiva.jsx` | POST `/api/v3/ai/inference/` · `confidence` · `model_version` · `class_0/class_1` · `ANALYSIS_MODES` (real/simulation/robot_demo) |
| SSE en vivo | `pages/DataScienceLab.jsx` | `EventSource /events` · `result.confidence` · `result.top_class_index` |
| Telemetría | `services/cloud.js`, `components/TelemetryPanel.jsx` | `/api/v3/telemetry/history/` · `source_mode` (live/sim) · Open-Meteo |
| Señales | `stores/useLabStore.js` | puente señales electrónica/schema |
| Hardware | `data/catalog-data.js` | 10 fichas · `resources[]` (learning layer) · `fase` (operativo/diseño) |
| Conocimiento | `knowledgeRegistry.generated.json` | 51 docs (18 `research_v2`) |
| Bates honestos | Dashboard | `operativo / referencia / diseño` · `●/▲/○` |

**Principio rector:** una primitiva de investigación NO puede mentir. Todo lo que se visualice con `confidence`, `source_mode` o `fase` debe mostrar su estatuto real.

---

## Primitivas de representación

### 1. ¿Cómo se representa una INVESTIGACIÓN?

**Propuesta:** como un **Expediente Científico** (card de investigación), anclada a los 18 docs `research_v2` ya existentes.

- Título: ID del doc (p. ej. `RES-AGRICULTURE-AI-v2`).
- Línea de estado: `fase` del ciclo — **hipótesis → diseño → datos → modelo → validación → publicación** (mapa a `_taxonomy`, `_split_specification`, `_execution_plan`).
- Chip de dominio: 🌱 agricultura · 🧠 IA · 📊 MLOps (según doc).
- Enlace: `→ /knowledge/doc/research_v2_*`.
- Sin NUEVOS archivos de datos: lee el registry existente.

`EXPEDIENTE = estado(fase) + dominio + evidencia(docs) + enlace`

### 2. ¿Cómo se representa un EXPERIMENTO?

**Propuesta:** como **Registro de Ejecución** reutilizando el flujo SSE ya real de `DataScienceLab`.

- `run_id` corto (p. ej. `EXP-017`), visible.
- Métricas reales ya disponibles: `confidence`, `top_class_index`, timestamp.
- Badge de modo (reutiliza `ANALYSIS_MODES`): `INFERENCIA REAL` / `SIMULACION` / `ROBOT DEMO`.
- Verdict honesto: `pass/fail/revisar` según umbral de `confidence` y coherencia con clase esperada (definible).
- Mini-sparkline reutiliza `MiniSparkline` (componente ya existente en TelemetryPanel).

`EXPERIMENTO = run_id + modo + metricas + veredicto(mini-series)`

### 3. ¿Cómo se representa un DATASET?

**Propuesta:** como **Ficha de Conjunto de Datos** anclada a los 8 docs `_dataset_inventory`, `_data_quality_framework`, `_label_schema`.

- Campos reales propuestos (los que existan en el registry): `n_muestras`, `n_clases`, `split` (train/val/test), `calidad` (de `_data_quality_framework`).
- Chip de balance de clases (barra simple, no gráfico nuevo): proporción entre clases — comunica desbalance honestamente.
- Enlace al doc `_dataset_inventory`.
- Si un campo no existe en datos, se muestra `—` (no inventar).

`DATASET = ficha(n, clases, split, calidad) + barra de balance`

### 4. ¿Cómo se representa una SEÑAL?

**Propuesta:** como **Serie Temporal viva** — la señal es el bien más preciado del ecosistema y ya existe en `TelemetryPanel` (Temp/Hum) y `useLabStore`.

- **Señal del sistema:** mini-gráfica compacta (reutiliza `MiniSparkline`/`GlobalChart compact`) con `source_mode` visible (LIVE/SIM).
- **Señal de laboratorio:** la onda del `useLabStore` (generador de señales) — misma primitiva, distinto origen.
- **Metadata honesta:** `frecuencia(s)` · `ultimo valor` · `estado (● operativo / ▲ alerta / ○ offline)`.
- La señal se visualiza SIEMPRE como gráfica, nunca solo como número.

`SEÑAL = series(mini-gráfica) + metadata(fs, último, estado)`

### 5. ¿Cómo se representa un MODELO ML?

**Propuesta:** como **Ficha de Modelo** con el contrato ya desplegado en AIPredictiva.

- `model_version` (ya existe en responses).
- `scope científico`: `binary_only` (ya existe como `scientific_scope`) → honesto: no prometer multiclase.
- `confidence` media del último experimento (SSE) o `—`.
- Arquitectura/tipo: clasificador binario · edge (TFLite en BBB-02) · tipollama.
- Enlace: `/ai-predictive` y docs `_training_pipeline`, `_model_governance`.
- Badge de modo: REAL/SIM como en primitivas anteriores.

`MODELO = ficha(version, scope, confianza, runtime)`

### 6. ¿Cómo se representa una RECOMENDACIÓN IA?

**Propuesta:** como **Consejo Técnico con Confianza explícita** — la recomendación es un output con evidencia, no un oráculo.

- Verdict visual: 🟢 sana / 🟡 preventiva / 🔴 crítica (reutiliza la tabla `getStatusPresentation` de AIPredictiva, sin duplicarla).
- **Confianza SIEMPRE visible** (`confidence` %), coloreada según umbral; si no hay inferencia → `—` (nunca "100%").
- **Recomendación accionable:** `accion (1 línea) + evidencia (doc/experimento) + limite ("Escenario demostrativo")`.
- Honestidad obligada: los escenarios demo ya se reportan como tales; la primitiva debe mantener ese texto.

`RECOMENDACION IA = verdict + confidence% + accion + evidencia + limite`

---

## Diagrama de conexión sin romper arquitectura

```
┌─ HARDWARE ─────────────────────────────────────────────┐
│  catalog-data.js (fichas+fase) · BBB-01/02/03 (estado) │
└───────────────────────────┬────────────────────────────┘
                            │ 1 capa de datos ya integrada
                            ▼
┌─ TELEMETRÍA ───────────────────────────────────────────┐
│  /api/v3/telemetry/history/ · source_mode · Open-Meteo │
│  TelemetryPanel (MiniSparkline) · GlobalChart compact  │
└───────────────────────────┬────────────────────────────┘
                            │ 2 (mismo pipeline fetch)
                            ▼
┌─ LABS ─────────────────────────────────────────────────┐
│  labs reales: DataScienceLab (Pyodide) · AdvancedMath  │
│  useLabStore (señales) · 8 rutas existentes            │
└───────────────────────────┬────────────────────────────┘
                            │ 3 (misma herramienta: Python en navegador)
                            ▼
┌─ MACHINE LEARNING ─────────────────────────────────────┐
│  /api/v3/ai/inference/ · SSE /events · binary_only     │
│  AIPredictiva (confidence/model_version) · research_v2 │
└───────────────────────────┬────────────────────────────┘
                            │ 4 (mismas respuestas de inferencia)
                            ▼
┌─ PRODUCCIÓN (diseño, no implementado) ─────────────────┐
│  proposta futura: leer SALIDA de ML + telemetría       │
│  (p. ej. signo foliar + clima → recomendación de campo │
└────────────────────────────────────────────────────────┘
```

### Reglas de acoplamiento (para no romper la arquitectura)

1. **Una sola fuente de verdad por dato:** catálogo → `catalog-data.js`; telemetría → `fetchTelemetry*`; inferencia → AIPredictiva/SSE; docs → registry. **Ninguna primitiva de esta capa crea su propio dataset.**
2. **Las primitivas son componentes de PRESENTACIÓN** (reciben data por props/context ya existente), igual que `TelemetryPanel`, `GlobalChart` o `ClusterCard`. No agregan stores, no agregan rutas, no agregan endpoints.
3. **Contextos existentes se reutilizan:** `useLabStore` para señales de laboratorio; `fetchTelemetryEnvelope()` para señales del sistema.
4. **Frontera Dashboard:** la capa se insertaría como nuevas *franjas/módulos* del mismo patrón actual (`<details>`/grid) en Dashboard.jsx, SIEMPRE referenciando (nunca duplicando) Mapa, KPIs y Hardware (lección de U4.2/U4.3).
5. **Vocabulario honesto obligatorio** en cada primitiva: `source_mode`, `fase`, `confidence`, `Escenario demostrativo` — un mismo campo se pinta siempre con su formato de verdad.
6. **Producción queda como VÍNCULO, no como módulo falso:** en esta fase solo puede conectarse como `recomendación con limite` (los datasets agrícolas y el campo están en diseño), jamás como dato productivo real.

---

## Propuesta de módulos resultantes (futuros, no implementados)

| Módulo | Primitivas | Contenido real de datos |
|---|---|---|
| 🔬 Investigación activa | Expediente | 18 docs research_v2 del registry |
| 🧪 Experimentos recientes | Registro + sparkline | SSE `/events` del DataScienceLab |
| 🗂️ Datasets | Ficha + barra balance | docs `_dataset_inventory` / `_data_quality_framework` |
| 🦠 Modelo vigente | Ficha ML | response `confidence`/`model_version` de inferencia |
| 🌡️ Señales en vivo | Serie temporal | TelemetryPanel + useLabStore |
| 🌱 Recomendación IA | Consejo con confianza | AIPredictiva (verdict + conf + límite) |

Todos siguen el patrón "resumen ejecutivo compacto" ya establecido (U4.1/U4.3): franjas de chips/módulos colapsables que **referencian** las páginas completas.

---

## Verificaciones de no-regresión del diseño

- ✅ Sin nuevos endpoints, stores, rutas ni archivos de datos.
- ✅ Contractos de inferencia/telemetría/documentos leídos tal cual.
- ✅ Componentes existentes (MiniSparkline, GlobalChart, ClusterCard, getStatusPresentation) reutilizados, no duplicados.
- ✅ Mapa sigue siendo la ventana única de hardware (ninguna primitiva re-listifica BBB/catálogo).
- ✅ Todo campo sin dato real se muestra `—`, nunca inventado.
- ✅ Backend, Docker, Telemetry Context, BBB, Learning Layer, Labs, Knowledge, IA: sin tocar por diseño.

**Estado:** documento de diseño. No se modificó ningún archivo de código.