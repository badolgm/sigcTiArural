# SIGC&T Rural — Visión de la Capa Científica (Investigación · Experimentación · ML · Producción)

**Fecha:** 2026-09-15 · **Rama:** `feature/ubtn-biological-telemetry`
**Tipo:** VISIÓN / DISEÑO — no se implementó, creó ni modificó ningún archivo de código.
**Complementa:** `SIGCTIARURAL_RESEARCH_PRODUCTION_LAYER.md` (primitivas) y `SIGCTIARURAL_ECOSYSTEM_MATURITY_AUDIT.md` (vacíos). Esta visión UNIFICA el ciclo en una sola representación.

> Regla suprema: no más hardware, no más proyectos, no más dashboard, no más KPIs, no más mapas. **El objetivo real es hacer VISIBLE el ciclo científico que ya existe en los datos.**

---

## La tesis

SIGCTiArural ya tiene las materias primas científicas:
- **Seriales/datos:** talimetría real V3 + Open-Meteo (SEÑAL → DATO).
- **Labs:** 8 laboratorios (ciencia aplicada + experimentación).
- **Conocimiento:** 51 docs, **18 research_v2** (investigación → datasets → pipelines).
- **Aprendizaje:** Learning Layer oficial en 5 fichas de hardware.
- **IA:** inferencia real con `confidence`/`model_version`/`binary_only` (MODELO → IA).

**Lo que falta NO es contenido: es que el CIERRE del ciclo sea visible.** La visión propone una sola pieza unificadora: la **Cinta del Ciclo Científico** — un flujo de 8 eslabones, cada uno enlazado a una ruta REAL, sin agregar nada.

---

## La representación unificada: "Cinta del Ciclo Científico"

```
 SENSOR ──► SEÑAL ──► DATO ──► DATASET ──► MODELO ──► IA ──► DECISIÓN ──► PRODUCCIÓN
   │           │         │        │           │        │       │            │
 BBB-03     spark      history  research     ficha   inference  consejo   estado
 (estado    linea     API v3   v2 docs   v2.3.1     conf 97%   con conf   diseño→
  real)    telemetry  gráfico   dataset   binary    class idx  evidencia   futuro
```

Cada eslabón: un chip/card con **estado real** (verde activo / ámbar diseño / gris ausente `—`) y **enlace a la página completa existente**. La cinta revela dónde está el ecosistema verdadero: los primeros eslabones activos, el medio en desarrollo, el final en diseño — **honestidad en construcción, no demo**.

---

## Respuestas

### 1. Cómo representar visualmente una INVESTIGACIÓN
**Como Expediente en fase** (no un "doc más").
- Etiqueta de ciclo: `hipótesis → diseño → datos → modelo → validación → publicación`.
- Dominio (🌱 agricultura / 🧠 IA / 📊 MLOps) y enlace `→ /knowledge/doc/research_v2_*`.
- **Estado de verdad:** si es diseño → lo dice; si es ejecución → lo dice. Nunca neutral.

### 2. Cómo representar un EXPERIMENTO
**Como Registro de Ejecución real**, alimentado del SSE `/events` existente.
- `run_id` + timestamp + badge de modo (`INFERENCIA REAL / SIMULACION / ROBOT DEMO` — ANALYSIS_MODES real).
- Métricas `confidence` y `top_class_index` (que ya envía el SSE) con veredicto `pass/fail/revisar`.
- Mini-tendencia con `MiniSparkline` (componente existente). Sin buffer nuevo.

### 3. Cómo representar un DATASET
**Como Ficha de Conjunto** anclado a los 8 docs `_dataset_inventory`/`_data_quality_framework`/`_label_schema`.
- Campos reales: `n_muestras`, `n_clases`, `split`, `calidad`; campo ausente → `—`.
- **Barra de balance de clases** (CSS, no librería) → comunica desbalance honesto.
- Enlace al inventario.

### 4. Cómo representar un MODELO ML
**Como Ficha de Modelo con el contrato real de la inferencia.**
- `model_version` · `scientific_scope: binary_only` (honesto: no prometer multiclase) · runtime (TFLite edge / JETSON / TinyML según ficha).
- Confianza media del último experimento (SSE) o `—`.
- Enlaces `/ai-predictive` + docs `_training_pipeline` / `_model_governance`.

### 5. Cómo representar una RECOMENDACIÓN IA
**Como Consejo Técnico con confianza explícita** (nunca oráculo).
- Veredicto 🟢/🟡/🔴 (reutiliza `getStatusPresentation`), `confidence %` siempre visible y coloreada.
- Acción (1 línea) + evidencia (experimento/doc) + **límite** ("Escenario demostrativo" / "sin despliegue productivo hoy").

### 6. Cómo representar PRODUCCIÓN REAL sin inventar datos
**Como Terminal de Estado honesto (hoy), con pipeline futuro condicional.**
- Estado: `🚜 AGRICULTURA-INTELIGENTE · diseño` (así figura en projects-data.js) + contador de datasets de investigación (real).
- **Prohibido** representar rendimiento/parcelas/riego (0 fuentes reales). La terminal se activa como dato productivo SOLO si algún día existe despliegue UBTN real.
- Eslabón final de la cinta: visible en gris/ámbar con la etiqueta "en diseño", no eliminado ni fingido.

### 7. Cómo hacer VISIBLE el ciclo completo
**Con la Cinta del Ciclo Científico como única pieza nueva visible** — no es un módulo más de Dashboard, sino la **capa unificadora**:
- 8 eslabones → 8 enlaces a rutas REALES existentes (Mapa/Telemetría/Labs/Knowledge/AIPredictiva/Proyectos).
- Sin rutas nuevas, sin stores, sin datos, sin endpoints; cada eslabón lee el contrato existente por props.
- Estado por color por eslabón: el usuario "recorre" el ciclo y ve exactamente qué está vivo y qué está en diseño.
- Se inserta como franja del patrón visual ya validado (U4.1/U4.3): `<details>`/chips/franja ejecutiva — SIN tocar backend/Docker/telemetría/labs/KH/IA.

---

## Análisis de activos científicos ya disponibles (para el ciclo)

| Eslabón | Activo real existente | Ruta que sirve |
|---|---|---|
| SENSOR | BBB-03 · `sensor_id` · estados por nodo | Dashboard Mapa Grupo A |
| SEÑAL | MiniSparkline Temp/Hum + `source_mode` | TelemetryPanel |
| DATO | `telemetryItems` + `/api/v3/telemetry/history/` | Dashboard telemetría |
| DATASET | 8 docs research_v2 (inventory/calidad/label/split) | `/knowledge/doc/research_v2_*` |
| MODELO | `model_version` + `binary_only` + TFLite (BBB-02) | `/ai-predictive` |
| IA | Inferencia real + SSE `confidence`/`top_class_index` | `/ai-predictive` + `/data-science` |
| DECISIÓN | `getStatusPresentation` (sana/preventiva/crítica) | AIPredictiva |
| PRODUCCIÓN | Proyecto agrícola en `diseño` (sin despliegue) | `/proyectos` |

**Conclusión del análisis:** todos los eslabones del ciclo YA tienen datos y rutas reales menos el último (producción, honestamente en diseño). La visión no requiere construir contenido nuevo — **requiere hacer visible el flujo que ya existe**.

---

## Filosofía de la visión

1. **El ecosistema se LEERÁ como ciclo, no como lista.** El visitante recorre SENSOR→PRODUCCIÓN y entiende el flujo científico, no una página con módulos.
2. **Honestidad como lenguaje visual:** el color del eslabón ES el estado ("esta pieza está viva", "esta está en diseño", "esta aún no existe"). Sin estado falso.
3. **Cero redundancia:** una sola cinta; cada pieza enlaza, no repite (lección U4.2/U4.3: el Mapa no se duplica en módulos).
4. **Progresión sin agresión:** la cinta evoluciona con el proyecto: cuando haya dataset real→eslabón se pinta verde; producción real→último eslabón se activa. La visión es un **carril en crecimiento**, no un snapshot.
5. **Sin tocar lo sagrado:** backend, Docker, telemetría, labs, Knowledge Hub e IA existente permanecen intactos; la capa es presentación pura.

**Estado:** visión/diseño. Ningún archivo de código modificado, sin commits. Implementación esperará la decisión de Bernardo tras el checkpoint RC-2.