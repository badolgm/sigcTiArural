# MAPA MAESTRO DEL ECOSISTEMA SIGCT-RURAL

> **Documento canónico de navegación.** Describe el ecosistema —componentes, relaciones, capas, actores, flujos, dominios, estado actual y roadmap— en un solo lugar. **No crea gobernanza nueva**: si algo aquí contradice la Constitución, la Carta IA o D-003, prevalecen esos documentos.

| Campo | Valor |
|---|---|
| Documento | `MAPA_MAESTRO_ECOSISTEMA_SIGCT_RURAL_V1.md` |
| Nivel | **Canónico · navegación · descriptivo** |
| Versión | 1.0 |
| Fecha | 2026-11-15 |
| Autor de la visión | Bernardo Adolfo Gómez Montoya |
| Naturaleza | Descripción y navegación. Sin gobernanza nueva, sin código, sin datasets, sin ETL, sin entrenamiento. |
| Repositorio | `docs/` (SOURCE OF TRUTH, Decisión D-001) |
| Depende de | `CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md` (v1.0.1) · `CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md` (v1.0.1) |
| Resolución de conflictos documentales | D-003 (`docs/DOCUMENTATION_ARCHITECTURE_DECISION_V1.md`) |
| Misión de origen | `MISIÓN ASUS – MAPA MAESTRO DEL ECOSISTEMA SIGCT-RURAL V1` |

**Regla de no-gobernanza.** Este Mapa **solo describe**. No introduce principios, reglas, estados ni gates nuevos; no modifica la Constitución, la Carta IA ni D-003; no autoriza implementación. Su valor es de **navegación**: orientar la lectura del ecosistema y señalar dónde vive cada cosa. En conflicto, la autoridad es la Constitución, la Carta IA y, en materia documental, **D-003**.

---

## 0. Vista ejecutiva

SIGCT-Rural es un **ecosistema vivo de conocimiento verificable** —no una plataforma, ni un dashboard, ni un LMS, ni un IoT genérico— construido sobre **Bounded Contexts** (DDD). Su propósito: **transformar aprendizaje en evidencia y evidencia en conocimiento**, con trazabilidad de extremo a extremo y honestidad de estado en cada eslabón. **EIARC** es su primer caso de uso productivo real, no un paraguas.

**Regla suprema:** `NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.`

### 0.1 El ecosistema de un vistazo

```
                 +--------------------------------------------------+
                 |   CONSTITUCIÓN V1.0.1   (misión · visión ·        |
                 |                          principios · gobernanza IA)|
                 |   CARTA IA V1.0.1       (reglas de actuación IA)  |
                 |   D-003                 (conflictos documentales) |
                 +--------------------------------------------------+
                                        |
        +-------------------+-----------+-----------+-------------------+
        |                   |                       |                   |
   +----------+        +----------+            +-----------+       +-----------+
   | ACTORES  |        |  CAPAS   |            |  FLUJOS   |       |  ESTADOS  |
   | humanos  |        | señal→.. |            | señal→    |       | 7 honestos|
   | + IA     |        | →impacto |            | impacto   |       | +veredictos|
   +----------+        +----------+            +-----------+       +-----------+
        |                   |                       |                   |
        +-------------------+-----------+-----------+-------------------+
                                        |
                    +---------------------------------------+
                    |   ESTADO REAL HOY  (resumen honesto)  |
                    |   · 2 señales reales persistentes     |
                    |   · 1 dataset agrícola congelado      |
                    |   · 1 dataset acústico CAPTADO_INICIAL|
                    |   · 1 baseline + 1 challenger IA      |
                    |   · KH operativo (51 docs / 6 categorías)|
                    |   · resto: simulación o diseño        |
                    +---------------------------------------+
```

### 0.2 Resumen de estado honesto

| Categoría | Estado honesto | Evidencia |
|---|---|---|
| Señales reales persistentes | `REAL` (×2) + `REAL-LOCAL` (micrófono) | `SensorReading` V3 (temp/hum) · `RobotTelemetry` (cliente ROTO) · mic S30 |
| Dataset agrícola | `REF` (congelado) | Dataset V2+ 22.488 imgs / 16 clases / 3 especies; split 15.741/3.373/3.374 seed 42 |
| Dataset acústico propio | `CAPTADO_INICIAL` | `sigct_rural_acoustic/v1` (fuera de git), 1 muestra `accepted` |
| Modelos IA | `REF` (baseline/challenger) | M1 MobileNetV2 `CONGELADO` · M2 EfficientNet-B0 `VALIDADO`; decisión **CERRADA 2026-10-14** (promoción no procede) |
| Modelo productivo en servicio | `ROTO` | `plant_disease_mbv2.h5` (doble normalización `fastapi_app.py:192`) |
| S81 / S82 | `DISENO` | Inteligencia acústica y detector de anomalías |
| Evidence Ledger | `DISENO` | Bifurcación controlada documentada |
| Knowledge Hub | Operativo (hub documental) | Registry 51 docs en 6 categorías |
| Bridge local | Validado (producción bloqueada) | Node ESM `127.0.0.1:8766`; 84/84 suite logger |
| Docker | `READY_CONDITIONAL` | 5 servicios; pendientes G-DS-1..6 y reescritura O-3 |

---

## 1. Capas del ecosistema

El ecosistema se organiza en capas conceptuales estables. Una capa superior usa las inferiores; ninguna capa nueva rompe los invariantes (C1–C6 / N1–N5).

| Capa | Función | Naturaleza | Estado típico hoy |
|---|---|---|---|
| **Señal / dato** | Materia prima trazable | Fuente de datos | `REAL` / `REAL-LOCAL` / `SIM` |
| **Laboratorios** | Exploración y producción de evidencia | Espacios de exploración | `SIM` / `REAL-LOCAL` / `DISENO` |
| **Repositorios (C0/C1/C2)** | Conservación y gobernanza de la materia prima | Memoria del ecosistema | `CAPTADO_INICIAL` / `REF` |
| **Modelos IA** | Herramienta de interpretación | Herramienta | `REF` / `ROTO` |
| **LLM / `Interprete`** | Herramienta de lenguaje intercambiable | Herramienta | Slot (opcional) |
| **Evidence Ledger** | Registro primario de evidencia | Memoria de gobernanza | `DISENO` |
| **Knowledge Hub** | Presentación del conocimiento verificado | Propósito | Operativo |
| **ACP** | Orquestación científica honesta | Integrador de lectura | Núcleo determinista |
| **Impacto** | Decisión de campo | Resultado | Agricultor / estudiante / investigador |

### 1.1 Pila de capas

```
        +-----------------------------------------------------+
  CAPA  |  IMPACTO        decisión de campo                    |
  9     |  (agricultor · estudiante · investigador)            |
        +-----------------------------------------------------+
  CAPA  |  ACP            orquesta · lee · agrega · degrada    |
  8     |  (NO escribe · NO ejecuta labs · NO decide)          |
        +-----------------------------------------------------+
  CAPA  |  KNOWLEDGE HUB  presenta conocimiento verificado     |
  7     |  (registry regenerado, nunca editado a mano)         |
        +-----------------------------------------------------+
  CAPA  |  EVIDENCE LEDGER  registro primario de evidencia     |
  6     |  (lo escribe el productor gobernado)                 |
        +-----------------------------------------------------+
  CAPA  |  LLM / INTERPRETE   lenguaje (slot intercambiable)   |
  5     |  (NO es fuente de verdad · fallback sin-LLM)         |
        +-----------------------------------------------------+
  CAPA  |  MODELOS IA     herramienta de interpretación        |
  4     |  (existe solo con métricas + model_card)             |
        +-----------------------------------------------------+
  CAPA  |  REPOSITORIOS   C0 corpus propio · C1 REF · C2 ontol.|
  3     |  (regla de no mezcla: C1 jamás entra en splits C0)   |
        +-----------------------------------------------------+
  CAPA  |  LABORATORIOS   exploración y producción de evidencia|
  2     |  (produce → ledger guarda → KH presenta)             |
        +-----------------------------------------------------+
  CAPA  |  SEÑAL / DATO   materia prima trazable               |
  1     |  (toda señal declara clase + dominio + estado)       |
        +-----------------------------------------------------+
```

---

## 2. Actores

### 2.1 Actores humanos

| Actor | Rol en el ecosistema | Estado / observación |
|---|---|---|
| **Productor / agricultor** | Destinatario de impacto; decide sobre el campo | Previsto (Constitución §5.4/§12); gobernanza de consentimiento = **V2** |
| **Investigador** | Traza métodos, resultados, errores y evidencia | Rol activo |
| **Estudiante / aprendiz SENA** | Produce evidencia aprendiendo ("formar haciendo") | Rol activo |
| **Autor de la visión (Bernardo)** | Decide gobernanza; aprueba gates y promociones | Rol de gobierno |
| **Cooperativas / asociaciones** | Agregación y adopción de datos | **V2** (no cubiertas hoy) |

### 2.2 Actores IA (sujetos gobernados por la Carta IA)

| ID | Sujeto | Naturaleza | Estado hoy |
|---|---|---|---|
| **IA-1** | ACP | Orquestador de lectura | Núcleo determinista |
| **IA-2** | LLM / `Interprete` | Herramienta de lenguaje | Slot opcional |
| **IA-3** | Sub-agentes (Matemático, Señales, Electrónica, Física, IA, Investigación) | Consultores | `DISENO` |
| **IA-4** | Agentes futuros (cauce F3B) | Sujeto a la Carta | Futuro |
| **IA-5** | Sistemas de razonamiento | Motor determinista | Parcial |
| **IA-6** | Modelos predictivos | Herramienta de interpretación | M1/M2 + forecasting |

### 2.3 Cauces de misión (no son IA)

| ID | Cauce | Qué es |
|---|---|---|
| **CM-1** | ASUS | Cauce/sprint de misión (trabajo documental/técnico) |
| **CM-2** | TOSHIBA | Cauce/sprint de misión (trabajo documental/técnico) |

### 2.4 Relación actores ↔ ecosistema

```
   HUMANOS                    IA / CAUCES                 ECOSISTEMA
   +-------------+            +--------------+            +----------------+
   | productor   |<--impacto--|              |            | señales        |
   | investigador|--consulta->|     ACP      |<--lectura--| datasets       |
   | estudiante  |--produce-->| (IA-1)       |            | labs           |
   | Bernardo    |--gobierna->|      |       |            | evidencia      |
   +-------------+            |      v       |            | conocimiento   |
                              | LLM/Interp.  |            +----------------+
                              | (IA-2)       |
                              +--------------+
                              sub-agentes (IA-3) · agentes futuros (IA-4)
                              razonamiento (IA-5) · modelos (IA-6)
                              cauces: ASUS (CM-1) · TOSHIBA (CM-2)
```

---

## 3. Flujos

### 3.1 Ciclo central (Constitución §5.1)

```
   Conocimiento → Investigación → IA → Laboratorios → Evidencia → Conocimiento
        ^                                                                |
        +----------------------------------------------------------------+
```

### 3.2 Cadena de valor de la evidencia (Constitución §5.2)

```
   Señal → Telemetría → Modelado → Señales → IA → Knowledge Hub → Impacto
```

### 3.3 Flujo operativo vigente CMSC (Constitución §5.3)

```
   S30 → Logger → Dataset → Validación → S81 → S82 → Knowledge Hub
   (mic) (captura)(C0)      (gates)       (acúst.)(anomalías)(presenta)
   REAL-LOCAL  CAPTADO_INICIAL   PENDING   DISENO  DISENO    operativo
```

El **ACP** es lector/explicador **posterior** de este flujo: no controla la captura ni inventa evidencia.

### 3.4 Cadena de la IA (Carta IA §14)

```
   LLM / INTERPRETE  →  redacta y cita; confianza ≤ MIN(anclas)   [no es fuente de verdad]
         v  (solo lectura / propuesta)
   ACP               →  orquesta, agrega, asigna veredicto        [no escribe]
         v  (el productor gobernado registra)
   EVIDENCE LEDGER   →  registro primario de evidencia            [no promociona solo]
         v  (promoción gobernada: Hangar de Autenticidad)
   KNOWLEDGE HUB     →  presenta conocimiento verificado          [no fabrica]
```

### 3.5 Recorrido de una señal por el ecosistema

```
   captura ──> laboratorio ──> repositorio ──> modelo ──> evidencia ──> KH ──> impacto
   (sensor)    (explora)       (C0/C1/C2)      (IA)       (Ledger)      (presenta) (decide)
      |            |                |             |           |            |         |
   estado      estado           estado        estado      estado       estado    humano
   honesto     honesto          honesto       honesto     honesto      honesto   decide
```

---

## 4. Laboratorios

Los laboratorios son **espacios de exploración**; producen evidencia, no contenido. Coexisten como **catálogo académico** (`/labs`) y como **mapa científico** (`/dashboard-cmsc`).

| Laboratorio | Rol | Estado | Observación |
|---|---|---|---|
| **MathV2** | Modelador | `SIM` | Simulador matemático; sin ejecución activa sin comando |
| **ElectronicsLab** | Modelador | `SIM` | Falstad-based; `CircuitSimulationPort` + `FalstadAdapter` validados |
| **TelecomLab** | Productor | `REAL-LOCAL` | Mic S30 con DSP local (FFT radix-2 4096 + Hann) |
| **RoboticsLab** | Productor | `SIM` | `RobotTelemetry` S50 `REAL`; cliente `localhost:8000` **ROTO** |
| **DataScienceLab** | Explorador | Pyodide | Sandbox Python en navegador (S40) |
| **Lab Espectral** | Capacidad transversal | `DISENO` | Vista `/cmsc/espectral`; no lab independiente |
| **ACP** | Orquestador | Núcleo determinista | H1–H10; sin LLM por defecto |

### 4.1 Mapa de laboratorios (productor → consumidor)

```
   PRODUCTORES              MODELADORES            CONSUMIDORES / SALIDAS
   +-------------+          +-------------+        +----------------------+
   | TelecomLab  |--señal-->| MathV2      |        | IA Predictiva        |
   | (S30, REAL- |          | Electronics |        | Knowledge Hub        |
   |  LOCAL)     |          | DataScience |        | ACP (orquesta)       |
   +-------------+          +-------------+        +----------------------+
   | RoboticsLab |----+           ^                       ^
   | (ROTO)      |    |           |                       |
   +-------------+    +-----------+-----------------------+  (por lectura)
```

---

## 5. IA

### 5.1 Modelos

| Modelo | Estado | Métricas | Artefactos |
|---|---|---|---|
| **M1** MobileNetV2 (baseline) | `CONGELADO` | macro-F1 0.9899 · ECE 0.0313 · balanced_acc 0.9898 | Sin artefactos reconstruibles en disco |
| **M2** EfficientNet-B0 (challenger) | `VALIDADO` | macro-F1 0.9937 · balanced_acc 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · epoch 32 · ~4.66 h | `runs/M2_efficientnet_b0/` |
| **`plant_disease_mbv2.h5`** (servicio) | `ROTO` | Doble normalización | Descalificado (`fastapi_app.py:192`) |

**Decisión M1 vs M2: CERRADA (2026-10-14).** M1 permanece baseline oficial congelado y M2 permanece challenger; la promoción de M2 no procede (no supera el discriminador primario ECE). Gate M1↔M2 cerrado — `docs/ai/M1_M2_GOVERNANCE_CLOSURE_REPORT.md`.

### 5.2 Datos

| Capa | Nombre | Uso | Estado |
|---|---|---|---|
| **C0** | Corpus propio | Única base de evaluación/entrenamiento del modelo propio | Acústico `CAPTADO_INICIAL` (1 muestra); agrícola congelado |
| **C1** | Referencia (`REF`) | Pre-entrenamiento / bootstrap; jamás en splits de C0 | Fuentes propuestas (FSD50K, ESC-50, Xeno-canto, SONYC, Speech, AudioSet) |
| **C2** | Ontológica | Vocabulario y representación; nunca audio crudo | AudioSet ontología + YAMNet |

### 5.3 Servicios e infraestructura IA

| Componente | Puerto | Estado |
|---|---|---|
| AI Service (FastAPI) | 8081 | `/health` PASS · `/assist` voz+PG · `/analyze-circuit` · `/infer` **no expuesto** |
| Bridge local (Node ESM) | 8766 | `GET /health` · `GET /stats` · `POST /ingest`; producción bloqueada |
| Frontend legacy | 5173 | Referencia estable (Docker, build congelado) |
| Frontend evolución | 5174 | Vite dev server activo (HMR) |

### 5.4 Diagrama IA

```
   DATOS (C0/C1/C2)  -->  FEATURES  -->  MODELO  -->  SALIDA (clase_ml)
        |                    |              |              |
   estado honesto       método/versión   model_card     confianza
        |                    |              |         (ortogonal al estado)
        +--------------------+--------------+--------------+
                                   |
                              EVIDENCIA --> EVIDENCE LEDGER --> KH
```

---

## 6. Gobernanza

### 6.1 Jerarquía documental

```
   docs/                              (SOURCE OF TRUTH · D-001)
     |
     +-- CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md   (norma superior)
     +-- CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md        (gobernanza IA, subordinada)
     +-- DOCUMENTATION_ARCHITECTURE_DECISION_V1.md    (D-001 / D-003)
     +-- CANONICAL_PROJECT_STATE_20261109.md
     +-- AGENTS.md
     +-- DOCUMENTATION_GOVERNANCE_REVIEW.md
     +-- MASTERDOC.md
   Documentacion/                     (legacy de arquitectura, preservado)
```

**Precedencia (D-003):** `docs/` › `CANONICAL_PROJECT_STATE_20261109.md` › `AGENTS.md` › `DOCUMENTATION_GOVERNANCE_REVIEW.md` › `MASTERDOC.md` › `Documentacion/`.

### 6.2 Los 7 estados de honestidad

```
   REAL · REAL-LOCAL · SIM · DISENO · ROTO · HUERFANO · REF
   (eje de ESTADO — no mejora por navegación)
```

### 6.3 Veredictos de respuesta (Carta IA §13)

```
   RESOLVED · PARTIAL · NO_DATA · BLOCKED · UNANSWERABLE   (canónicos ACP)
   HIPÓTESIS   ->  nuevo veredicto predictivo · PENDIENTE DE G-IA-1 · NO activo
                   (NO es un estado de honestidad)
```

### 6.4 Gates (referencia; el detalle vive en sus documentos)

| Familia | Documento | Estado |
|---|---|---|
| **G-DS-1..6** | `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` | G-DS-1 `FAIL` (7 mids `UNVERIFIED`); G-DS-2..6 `PENDING` |
| **G-IA-1..8** | `CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md` | G-IA-1 `PENDIENTE`; resto por activar |
| **G-REF-1..6** | `AI_ACOUSTIC_REFERENCE_LAYER_ARCHITECTURE_V1.md` | `PLANIFICADO` |
| **G-F3C..G-F4** | Documentos CMSC F3x/F4 | Diseño |

---

## 7. Dominios productivos

Dominios que el ecosistema sirve o sirvirá. Hoy la mayoría no tiene rango constitucional propio (eso es materia de **Roadmap V2**, §8); este mapa solo declara su cobertura y estado.

| Dominio | Cobertura actual | Estado honesto | Dónde vive hoy |
|---|---|---|---|
| **Agricultura** | Parcial | Benchmark agrícola congelado (M1/M2); dataset V2+ | `CANONICAL_PROJECT_STATE` §6; `AGENTS.md` |
| **Ganadería** | No cubierta | Línea UBTN bovinos (diseño) | `AGENTS.md` F3B (futuro) |
| **Piscicultura** | No cubierta | UBTN (OD/pH/turbidez, diseño) | `AGENTS.md` F3B (futuro) |
| **Apicultura** | Parcial | "abejas" = candidata a clase acústica (taxonomy v2); escenario ACP | `AGENTS.md` H0/H3 |
| **Porcicultura** | No cubierta | Bioacústica porcinos (S77, diseño) | `AGENTS.md` S77 |
| **Seguridad alimentaria** | No cubierta | — | Pendiente V2 |
| **Producción sostenible** | Parcial | Valor fundacional (README); no medida | `docs/ECOSYSTEM_IDENTITY.md` |
| **Inteligencia ecosistémica** | Parcial | ACP + Knowledge Graph (diseño/parcial) | `CMSC_F4`, `CMSC_F3E` |
| **Gemelos digitales** | Solo mención | Disciplina futura | Constitución §3.4 |
| **Predicción agronómica/ambiental** | Parcial | S82 anomalías (`DISENO`); clima-externo | `AGENTS.md` S82 |

---

## 8. Roadmap V2 (de la Constitución del ecosistema)

Clasificación de temas a **elevar a rango constitucional** en una futura `CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V2`. La V1.0.1 queda **congelada**; la V2 **complementa**, no sustituye. Roadmap, no gobernanza vigente.

### 8.1 V2-CRÍTICO

| Tema | Motivo |
|---|---|
| **Agricultura** | Dominio fundacional; EIARC y benchmark agrícola dependen de su rango |
| **Ganadería** | Línea UBTN real y bioacústica bovina existentes, sin amparo constitucional |
| **Productores reales** | Actor humano primario; sin gobernanza de consentimiento/propiedad no se toca campo |
| **Inteligencia ecosistémica** | Promesa diferencial (ACP + Knowledge Graph) sin rango hoy |

### 8.2 V2-IMPORTANTE

| Tema | Motivo |
|---|---|
| **Piscicultura** | Caso UBTN con señales de agua; requiere contrato propio |
| **Apicultura** | Colmena + `abejas` (taxonomy v2) + escenario ACP; línea viva |
| **Seguridad alimentaria** | Resultado de propósito; exige principio y criterios verificables |
| **Producción sostenible** | Valor fundacional; debe declararse medible |
| **Cooperativas** | Actor organizacional de agregación y adopción |
| **Asociaciones** | Actor organizacional; mismo tratamiento |
| **Predicción agronómica** | Capacidad de decisión de campo; hoy solo clasificación |
| **Predicción ambiental** | S82 (`DISENO`) + clima-externo |
| **Gemelos digitales** | Necesitan rol y estado honesto propios |

### 8.3 V2-DESEABLE

| Tema | Motivo |
|---|---|
| **Porcicultura** | Solo etiqueta de bioacústica (S77); sin línea propia |

### 8.4 Temas adicionales detectados (recomendados para V2)

| Tema | Clasificación | Motivo |
|---|---|---|
| Ética y sesgo en modelos que afectan decisiones productivas | V2-IMPORTANTE | V1 cubre honestidad métrica, no sesgo/impacto |
| Privacidad y ciberseguridad del dato rural | V2-IMPORTANTE | Dato sensible (ubicación, producción) |
| Trazabilidad de la cadena agroalimentaria | V2-DESEABLE | Extensión de §7/§10 |
| Interoperabilidad con sistemas/gremios agropecuarios | V2-DESEABLE | Escala institucional |
| Georreferenciación y escala territorial | V2-DESEABLE | Contexto de campo |

### 8.5 Secuencia recomendada

```
   V2-A  Capa de dominio      (agricultura · ganadería · piscicultura ·
                               apicultura · porcicultura)              CRÍTICO
   V2-B  Capa de actores      (productores · cooperativas · asociaciones) CRÍTICO
   V2-C  Inteligencia ecosistémica + predicción                         CRÍTICO/IMPORTANTE
   V2-D  Sostenibilidad · seguridad alimentaria · gemelos digitales     IMPORTANTE
   V2-E  Temas adicionales    (ética/sesgo · privacidad · trazabilidad) IMPORTANTE/DESEABLE
```

---

## 9. Estado actual consolidado

| Ámbito | Estado honesto | Bloqueo / nota |
|---|---|---|
| Constitución | Vigente (v1.0.1) | Congelada |
| Carta IA | Vigente (v1.0.1) | `HIPÓTESIS` pendiente de G-IA-1 |
| D-003 | Vigente | Autoridad de conflictos documentales |
| Señales reales persistentes | `REAL` (×2) | `RobotTelemetry` con cliente ROTO |
| Señal acústica | `REAL-LOCAL` | Mic S30 + DSP local |
| Dataset agrícola | Congelado | 22.488 imgs / 16 clases |
| Dataset acústico (C0) | `CAPTADO_INICIAL` | 1 muestra; G-DS-1 `FAIL` |
| Modelo baseline M1 | `CONGELADO` | Sin artefactos en disco |
| Modelo challenger M2 | `VALIDADO` | Decisión M1/M2 **CERRADA 2026-10-14** (promoción no procede) |
| Modelo en servicio | `ROTO` | `.h5` descalificado |
| S81 / S82 | `DISENO` | Requieren gates |
| Evidence Ledger | `DISENO` | Sin escritura ad-hoc |
| Knowledge Hub | Operativo | 51 docs / 6 categorías |
| Bridge | Validado | Producción bloqueada |
| Docker | `READY_CONDITIONAL` | Pendientes G-DS y O-3 |

---

## 10. Referencias

| Documento | Rol |
|---|---|
| `docs/CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md` | Documento fundacional (misión, visión, principios) |
| `docs/CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md` | Gobernanza de IA |
| `docs/DOCUMENTATION_ARCHITECTURE_DECISION_V1.md` | D-001 / D-003 |
| `docs/CANONICAL_PROJECT_STATE_20261109.md` | Estado canónico del proyecto |
| `AGENTS.md` | Identidad, estado git, decisiones, cadencias |
| `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` | Gobernanza dataset acústico (G-DS-1..6) |
| `docs/ai/H5_AI_GOVERNANCE_CLOSURE_REPORT.md` | Línea canónica de IA (M1/M2) |
| `Documentacion/Arquitectura/CMSC_F4_ACP_ARCHITECTURE_v1.md` | Arquitectura del ACP |
| `Documentacion/Arquitectura/CMSC_F3E_KNOWLEDGE_INTEGRATION_STRATEGY_v1.md` | Evidence Ledger y Knowledge Graph |
| `Documentacion/Arquitectura/CMSC_ORCHESTRATION_V2_DESIGN.md` | Flujo operativo S30 → … → KH |

---

## Vigencia y cierre

Este Mapa Maestro es un documento canónico **descriptivo y de navegación**. No crea gobernanza, no modifica la Constitución, la Carta IA ni D-003, y no autoriza implementación. Su vigencia se mantiene mientras describa fielmente el ecosistema; cuando un componente cambie de estado, se actualiza su descripción sin alterar los documentos de gobernanza.

La regla suprema lo atraviesa entero: **NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.**

---

*Documento canónico de navegación v1.0. Solo descripción: sin gobernanza nueva, sin código, sin datasets, sin ETL, sin entrenamiento, sin commits. Autor de la visión: Bernardo Adolfo Gómez Montoya.*
