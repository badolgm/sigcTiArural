# SIGCTiArural · MMC — Scientific Workbench v1 (Diseño Canónico)

| Campo | Valor |
|---|---|
| Estado del documento | **DISEÑO v1 · arquitectura congelada** — sin implementación |
| Misión | `MMC_WORKBENCH_V1_CANONICAL_DOCUMENT` |
| Fecha | 2026-09-30 |
| Rama | `feature/cmsc-f3c-v1-implementation` (HEAD `eff39a8`, sin commits) |
| Modo | **SOLO DOCUMENTAR** — NO implementar F1 · NO crear ruta `/mmc` · NO extraer archivos · NO modificar código · NO commits |
| Objeto | Congelar el diseño del Scientific Workbench del Motor de Modelado Científico (MMC) antes de tocar arquitectura |
| Corpus verificado | `src/frontend/src/labs/AdvancedMathLabV2.jsx` (1018 líneas) · `App.jsx` (19 rutas) · `stores/useLabStore.js` · `pages/cmsc/MathModelingCell.jsx` · `labs/electronics/ports/circuitSimulationPort.js` · `pages/cmsc/signalCatalog.js` |
| Canon de estados | `CMSC_CANONICAL_STATES_APPENDIX_V1` (7 estados) + terminología `clase_senal` / `dominio` / `clase_ml` |
| Documentos que NO sustituye | `CMSC_F3C_DASHBOARD_CONSTRUCTION_STRATEGY_v1` · `CMSC_F3D_SIGNAL_NAVIGATION_STRATEGY_v1` · `CMSC_LABS_RESTRUCTURING_PLAN_v1` · `FRONTEND_EXECUTION_STRATEGY` |
| Invariante rector | **NO REEMPLAZAR · NO REESCRIBIR · NO BORRAR · CONSERVAR los 8 instrumentos existentes** |
| Decisiones abiertas | §15 (4 ítems, 2 bloqueantes para F0/F1) |

---

## 0. Alcance y método

Este documento **congela un diseño**. No autoriza implementación, no crea la ruta `/mmc`, no extrae archivos y no modifica una línea de código. Su función es que la fase de construcción futura no tenga que re-inventar la arquitectura, y que cualquier implementación sea verificable contra gates objetivos.

Todo el análisis de este documento es **de solo lectura y verificado contra el código actual**. Las afirmaciones estructurales citan archivo y línea; las afirmaciones de comportamiento están marcadas como verificadas en runtime o como pendientes de verificación. Donde el código y la interfaz discrepan, el código manda y la discrepancia se reporta como hallazgo.

**Lo que este documento no hace:** no reetiqueta estados existentes, no modifica `signalCatalog`, no toca ACP, benchmark, Knowledge Hub ni los estados de señal del ecosistema. Señala discrepancias de honestidad (§11.3) como ítems de gobernanza, no como correcciones silenciosas.

---

## 1. Problema actual

El MMC no es un laboratorio: es **una página de scroll con 8 instrumentos sueltos**. La distinción importa porque un laboratorio es un espacio de trabajo y una página de scroll es un documento largo.

Evidencia estructural (`AdvancedMathLabV2.jsx`, 1018 líneas, 53 KB):

| Instrumento | Líneas | Estado local | Exportado |
|---|---|---|---|
| `AdvancedMathLabV2` (shell) | 4–164 | — | default (L165) |
| `downloadCSV` | 107–123 | — | no |
| `PhasePortraitPlot` | 124–164 | — | no |
| `MmcTag` | 173–185 | — | no |
| `DynamicSections` | 186–199 | — | no |
| `RealSignalAnalysis` | 202–540 (**339**) | 5 | **no** |
| `IntegralsInteractive` | 541–683 | 6 | sí |
| `EigenvaluesInteractive` | 684–713 | 4 | sí |
| `DiffEqInteractive` | 714–769 | 2 | sí |
| `GeometryInteractive` | 770–817 | 1 | sí |
| `SignalsInteractive` | 818–955 | 5 | sí |
| `ComplexInteractive` | 956–983 | 1 | sí |
| `FormulasPanel` | 984–1018 | 1 | no |

Los 8 instrumentos se renderizan en `DynamicSections` (L189–196) como una lista plana, siempre todos visibles, en un único orden fijo.

**El problema de fondo: no existe kernel.** El estado de cada instrumento es `useState` local e independiente. No hay:

- **workspace** compartido (cada instrumento ve solo sus propios parámetros);
- **historial** (no se puede reproducir, comparar ni volver atrás una ejecución);
- **bus de datos** (ningún instrumento puede consumir la salida de otro);
- **registro** (los metadatos de cada instrumento están escritos a mano, tres veces — ver §3.4);
- **navegación por estado** (la navegación es salto por ancla `id` sobre un documento largo).

Comparado con las cuatro referencias del encargo, la diferencia es exactamente una:

| Referencia | Lo que aporta | ¿Existe hoy en el MMC? |
|---|---|---|
| **Mathematica** | Kernel con workspace de variables globales persistente | no |
| **GNU Octave** | Workspace + historial de comandos reproducible | no |
| **MATLAB** | Workspace por sesión + motor gráfico compartido | no |
| **JupyterLab** | Kernel al que las celdas envían código y reciben resultado | no |

El MMC tiene 4 de las 4 piezas de **cálculo** (los instrumentos) y 0 de las 4 piezas de **workbench** (kernel, workspace, historial, celdas). Ese es el gap completo, y es la razón de ser de este diseño.

---

## 2. Limitaciones actuales

### 2.1 Limitaciones de arquitectura

| # | Limitación | Evidencia |
|---|---|---|
| L1 | Estado 100% local por componente; cero estado compartido | 27 `useState` en 8 componentes, ninguno compartido |
| L2 | Sin workspace: un instrumento no puede consumir la salida de otro | `DynamicSections` (L186–199) pasa solo `electronicsData` |
| L3 | Sin historial ni reproducibilidad: no existe "volver a ejecutar" ni "comparar" | no hay celdas, no hay registro de parámetros |
| L4 | Sin registro: metadatos escritos a mano y triplicados | ver §3.4 |
| L5 | Navegación por ancla `id` sobre documento largo | 5 botones de índice (L~50–70) |
| L6 | Módulos solicitados por la misión sin instrumento alguno | Optimización, IA, Telecom vacíos (§12) |
| L7 | Acoplamiento de store en la import del componente raíz | `AdvancedMathLabV2.jsx:5` importa `useLabStore` a nivel de módulo |

### 2.2 Limitaciones de reutilización

| # | Limitación | Evidencia |
|---|---|---|
| L8 | 4 de los componentes más útiles **no están exportados** | `RealSignalAnalysis` (339 líneas), `PhasePortraitPlot`, `MmcTag`, `downloadCSV` |
| L9 | El archivo ya es **módulo compartido por 2 rutas** → moverlo rompe a otros | `App.jsx:11` (default) + `MathModelingCell.jsx:6` (4 named) |
| L10 | 12 ocurrencias de `<svg>` con 0 `<canvas>` y matemática de escala duplicada | 12 `<svg` en el código; `recharts@2.12.7` instalado y sin usar por el MMC |
| L11 | `mathHelpers.js` (84 líneas) es **huérfana** respecto al MMC | `AdvancedMathLabV2.jsx` no la importa (solo importa `react` y `useLabStore`, L4–5) |

### 2.3 Limitaciones de cobertura funcional

| # | Limitación | Evidencia |
|---|---|---|
| L12 | 2 instrumentos son inalcanzables por navegación | `DiffEqInteractive` y `GeometryInteractive` no tienen `id` de sección |
| L13 | `downloadCSV` es inalcanzable sin señal externa activa | early return en `RealSignalAnalysis` (L218) oculta el botón |
| L14 | 2 instrumentos bridan a referencia y se presentan como instrumento | `ComplexInteractive` (mapeo visual), `GeometryInteractive` (autovalor de una rotación) |
| L15 | 1 de los 7 módulos solicitados no tiene ni equivalente conceptual | Optimización |

---

## 3. Hallazgos de auditoría

Todos los hallazgos son **verificados por lectura del código**. Ninguno fue corregido: esta misión no modifica código.

### 3.1 H1 — El instrumento más potente no se puede reutilizar

`RealSignalAnalysis` son 339 líneas (L202–540): la mayor pieza del archivo, la única que consume señal externa, y **no está exportada** (L168 exporta solo 6 componentes). Cualquier workbench que quiera la señal real debe primero resolver su visibilidad.

**Consecuencia de diseño:** F0 debe exportarla, o el workbench no puede consumir la única señal real del laboratorio.

### 3.2 H2 — `id` triplicado en ramas excluyentes

`id="section-real-signal"` aparece en **3 ramas `early return` mutuamente excluyentes** de `RealSignalAnalysis` (L220, y 2 ramas posteriores). Como son excluyentes, **no hay `id` duplicado en el DOM renderizado en un instante dado** — no es un bug activo de navegación. Sí es HTML inválido por reuso del identificador y una fragilidad de mantenimiento: cualquier refactor que saque una rama del condicional introduce duplicación silenciosa.

**Estado honesto:** `SIM` (no es un bug vivo). Se documenta como deuda, no como incidente.

### 3.3 H3 — Lectura muerta de `signals.description`

`AdvancedMathLabV2.jsx:89` lee `electronicsData.signals.description`. El store define `signals: { vin: [], vout: [], time: [] }` (`useLabStore.js:19–23`) y **ningún escritor** crea `description` (verificado: las únicas coincidencias de `description:` en `src/frontend/src` están en `data/catalog-data.js`, catálogo de hardware, sin relación).

**Consecuencia:** la expresión cae siempre al fallback `'Laboratorio de Electrónica'`. El código muerto sugiere una capacidad de etiquetado que no existe.

### 3.4 H4 — Metadatos de instrumento triplicados

La misma información de un instrumento aparece en tres lugares sin fuente única:

1. **9× `MmcTag`** (L173–185) embebido dentro de cada componente, renderizado en el DOM como texto explicativo;
2. **`signalCatalog.js:31`** — S35 «Series Fourier y Wavelets», `estado: 'SIM'`, `clase_senal: 'SIMULADA'`, `dominio: 'Matemáticas'`, `puerto: null`, `consumidores: 'AdvancedMathLabV2'`;
3. **texto de las celdas** de `MathModelingCell.jsx` (`/dashboard-cmsc`).

Tres copias, sin registro que las generates. Con 7 módulos esto deja de sostenerse: es el argumento central de §5.

### 3.5 H5 — Dos escritores, y ninguno mide un circuito real

Los **únicos dos** escritores de `electronicsData.simulationResults.history` son simuladores de circuito:

| Escritor | Ruta | Naturaleza |
|---|---|---|
| `ElectronicsLab.jsx:545` → `setSimulationResults` | SPICE/Pyodide (comentario `useLabStore.js:44`: *"Generic simulation results (Pyodide/SPICE)"*) | simulación de circuito |
| `FalstadPanel.jsx:887` → `falstadAdapter.js:186` | Falstad, vía `FalstadAdapter extends CircuitSimulationPort` (`falstadAdapter.js:51`) | simulación de circuito |

Los sensores físicos del ecosistema (`SensorReading` temp/hum V3, `RobotTelemetry`) **no llegan a este laboratorio**; el store no tiene puerto para ellos. `signals: { vin, vout, time }` queda en arrays vacíos y sin escritor.

**Consecuencia de honestidad:** la etiqueta actual de la UI dice **«señal real · Electrónica»** (`AdvancedMathLabV2.jsx:80`) y **«señal entrante · Electrónica»** (L48) para un dato que es salida de un simulador de circuito. Según el canon de 7 estados, eso es `SIM`, no `REAL`. Ver §11.3 — es un ítem de gobernanza, no una corrección silenciosa.

### 3.6 H6 — El puerto ya está diseñado; el store descarta su trazabilidad

`circuitSimulationPort.js` define un contrato maduro y ya implementado por dos adaptadores:

```
CircuitSimulationResult = { history, analysis, netlist, source }   // Object.freeze
createCircuitSimulationResult({ history, analysis, netlist, source })
  · valida que history.time sea array
  · exige source (trazabilidad obligatoria)
```

Observaciones verificadas:

- `history` tiene la forma `{ time: number[], [nodeLabel]: number[] }` — exactamente lo que el MMC consume (L109–110, L212).
- `analysis` (THD, espectro) y `netlist` (trazabilidad del circuito) **no tienen ningún lector** en el ecosistema.
- `source` es obligatorio en el puerto pero **`setSimulationResults` lo descarta** (`useLabStore.js:60–71` copia solo `history`/`analysis`/`netlist`).

**Consecuencia de diseño:** existe un contrato de puerto maduro sin consumidor completo. El workbench es el consumidor natural de `analysis` y `netlist` (§7), y `fuente` del workspace (§7.2) recupera la trazabilidad que hoy se pierde.

### 3.7 H7 — Acoplamiento de store a nivel de import

`AdvancedMathLabV2.jsx:5` importa `useLabStore` a nivel de módulo y lo consume en el shell (L46, L80–89) y lo pasa por props a `DynamicSections` → `RealSignalAnalysis` (L189, L202). El componente raíz de un laboratorio de matemáticas no debería depender del store de Electrónica.

**Consecuencia:** la lectura de señal externa debe entrar por el workspace (§7), no por import directo. F3 lo resuelve; no es bloqueante para F0–F2.

### 3.8 H8 — Contenido embebido en componente

`FormulasPanel` (L984–1018) declara un array `formulas` de 6 entradas con enlaces académicos (L985–992: MIT OCW, UNAL, UMN, UNR, sp4comm) **dentro del cuerpo del componente**. Es contenido documental, no lógica de render.

### 3.9 H9 — Huérfanos en `mathHelpers.js`

`mathHelpers.js` exporta 3 grupos: un simulador de qubits (`getInitialQubits`, `appendGateToQubit`, `resetQubitGates`, L18–47), `generateWaveData` (L57) y `getTransformationMatrix` (L74). **El MMC no la importa** (L4–5 solo importan `react` y `useLabStore`). El grupo de qubits pertenece a un simulador cuántico que no existe en el ecosistema.

### 3.10 H10 — Cobertura de navegación

Los botones de índice apuntan a `section-integrals` (L603), `section-eigen` (L694), `section-signals` (L862), `section-complex` (L965) y `section-real-signal`. **`DiffEqInteractive`, `GeometryInteractive` y `FormulasPanel` no tienen `id`**: existen, se renderizan, y no son alcanzables por índice.

---

## 4. Kernel MMC

### 4.1 Principio

El kernel es la pieza que convierte 4 cálculos en 1 workbench. Sin él, el MMC seguirá siendo 8 widgets que comparten un archivo. La afirmación de diseño es una sola:

> **El workbench se define por tener un kernel con workspace compartido, no por tener más instrumentos.**

### 4.2 Arquitectura en 3 capas

```
┌─ L3  SHELL ────────────────────────────────────────────────────────┐
│  ruta /mmc (propuesta) · rail de módulos · canvas · inspector     │
│  notebook de celdas  ← lo que hace que sea workbench y no dashboard│
└────────────────────────────┬────────────────────────────────────────┘
                             │ renderiza desde el registro
┌─ L2  REGISTRO ──────────────┴────────────────────────────────────────┐
│  descriptor declarativo por instrumento (§5)                        │
│  { id, módulo, ecuación, params, produce, hacia, estado, vacío }  │
│  fuente ÚNICA de: rail, ecuación del inspector, chips de salida,  │
│  contrato del kernel, estado honesto y docs de referencia           │
└────────────────────────────┬────────────────────────────────────────┘
                             │ ejecuta
┌─ L1  KERNEL ────────────────┴────────────────────────────────────────┐
│  mmcStore (zustand)                                                 │
│  · sesion      — parámetros por instrumento (§4.3)                  │
│  · workspace   — señal activa normalizada (§7)                      │
│  · historial   — celdas ejecutadas (§8)                             │
│  · honestidad  — estado por celda (§11)                            │
└─────────────────────────────────────────────────────────────────────┘
```

**Por qué el registro (L2) es la pieza crítica:** hoy la verdad de cada instrumento está triplicada (H4). Con 7 módulos y ~8 instrumentos, el rail, la documentación, los chips de salida, el contrato del kernel y el estado honesto deben salir **de una sola tabla**. El registro no es documentación: es un artefacto de runtime del que se derivan la navegación, el inspector y la política de honestidad.

### 4.3 Forma del kernel

Mismo patrón que el store existente (`useLabStore` usa `create` de `zustand@5.0.10`). Propuesta de forma, no de código:

```js
{
  sesion: {
    // parámetros por instrumento, con defaults tomados del registro
    [instrumentId]: { [paramKey]: valor },
    setParam, resetInstrument, resetAll
  },

  workspace: {
    señal: null,   // envoltura normalizada — §7.1
    nodos:  [],    // Object.keys(history).filter(k => k !== 'time')  (equivalente a L212)
    fuente: null,  // 'spice' | 'falstad' | 'local' | null  — §7.2
    setWorkspace
  },

  historial: {
    celdas: [],    // { id, instrumento, params, señal, veredicto, estado, ts } — §8
    ejecutar, limpiarCeldas
  },

  honestidad: {
    global: 'SIM',            // estado agregado del workbench — §11
    porInstrumento: {}        // estado declarado en el registro
  }
}
```

### 4.4 Reglas del kernel

- **K1 — el kernel no inventa datos.** Todo lo que entra al workspace viene de un productor declarado. No hay valores por defecto que se presenten como medidos.
- **K2 — el estado jamás mejora por navegación** (regla 2 del apéndice de estados). Entrar a `/mmc` no convierte un `SIM` en `REAL`.
- **K3 — fuente y estado son campos distintos.** `fuente` responde *de dónde viene*; `estado` responde *qué tan honesto es*. Un dato de Falstad con fuente `falstad` y estado `SIM` son dos afirmaciones, no una.
- **K4 — `confidence` es ortogonal al estado** (regla 3 del apéndice). Se puede mostrar `SIM` con confianza alta.
- **K5 — el kernel no muta `useLabStore`.** Lee `electronicsData` como fuente externa y publica solo en su propio slice. El store compartido no se toca en F0–F6 sin misión propia.
- **K6 — un instrumento sin descriptor en el registro no se renderiza.** Impide que aparezca capacidad no declarada.

---

## 5. Registro declarativo

### 5.1 Forma del descriptor

```js
{
  id: 'real-signal',
  modulo: 'electronica',
  titulo: 'Señal real entrante',
  ecuacion: 'V(t) · FFT → |X(f)| · Bode · fase',
  estado: 'SIM',                  // canon de 7 estados
  clase_senal: 'SIMULADA',        // 8 orígenes (F3B)
  dominio: 'Electrónica',         // 12 dominios (SIGNAL_MAP)
  fuente: 'useLabStore.electronicsData.simulationResults',
  produce: ['espectro', 'fase', 'transferencia'],
  hacia: ['espectral', 'optimizacion', 'ia'],
  params: [
    { k: 'selectedNode', etiq: 'Nodo',    tipo: 'select' },
    { k: 'inputNode',    etiq: 'Entrada', tipo: 'select' }
  ],
  metricas: ['THD', 'pico', 'RMS'],
  implementacion: 'RealSignalAnalysis.jsx',
  vacio: false
}
```

### 5.2 Las 8 filas reales

| id | módulo | estado | clase_senal | produce | implementa | nota |
|---|---|---|---|---|---|---|
| `real-signal` | Electrónica | `SIM`¹ | SIMULADA | espectro, fase, transferencia | `RealSignalAnalysis` L202–540 | único que consume señal externa |
| `integrals` | Simulación | `SIM` | SIMULADA | valor, error | `IntegralsInteractive` L541–683 | Simpson + Romberg |
| `difode` | Simulación | `SIM` | SIMULADA | solución, campo | `DiffEqInteractive` L714–769 | Runge-Kutta 4 |
| `eigen` | Modelos | `SIM` | SIMULADA | λ, autovectores, tipo | `EigenvaluesInteractive` L684–713 | determinista |
| `geometry` | Modelos | `SIM` | SIMULADA | R(θ), autovalor | `GeometryInteractive` L770–817 | bridar a Referencia (§12.2) |
| `signals` | Señales | `SIM` | GENERADA | AM, 4 subgráficas | `SignalsInteractive` L818–955 | generador local |
| `complex` | Referencia | `REF` | SIMULADA | f(z)=z² | `ComplexInteractive` L956–983 | visual, no cálculo |
| `formulas` | Referencia | `REF` | REFERENCIA | 6 fórmulas + enlaces | `FormulasPanel` L984–1018 | documentación |

¹ **Por `SIM` y no `REAL`:** los dos únicos escritores son simuladores de circuito (H5). La decisión de la etiqueta de UI es de gobernanza (§15, ítem 3); el registro se congela en el valor que la evidencia sostiene.

### 5.3 Qué resuelve el registro

| Duplicación actual (H4) | Cómo la resuelve el registro |
|---|---|
| `MmcTag` × 9 dentro de cada componente | el descriptor `produce` / `hacia` genera los chips |
| `signalCatalog.js:31` (S35) | el descriptor `estado` / `clase_senal` / `dominio` es la fuente; la catálogo se alinea, no se edita a mano |
| texto de las celdas CMSC | `ecuacion` + `params` generan la descripción de la celda |
| índice de navegación (5 botones, 2 huecos) | el registro **es** la navegación: sin `id`, sin anclas, sin huecos |
| estado honesto repetido por componente | `estado` en el descriptor, leído por el shell y el termómetro |

### 5.4 Reglas del registro

- **R1 — fuente única.** Un instrumento tiene exactamente un descriptor. Un descriptor, un instrumento.
- **R2 — nada fuera del registro.** Un instrumento sin fila no existe para el workbench (K6).
- **R3 — el registro no sustituye a `signalCatalog`.** El catálogo sigue siendo el índice de señales del ecosistema; el registro es el de instrumentos del MMC. Se alinean por `id`, sin escritura doble (principio de bifurcación controlada de F3E).
- **R4 — `vacio: true` es una capacidad de primera clase**, no una ausencia. Ver §12.
- **R5 — el registro no declara capacidades que no existen.** Prohibido registrar un instrumento futuro como si estuviera disponible.

---

## 6. Contrato de celda

### 6.1 Principio

La celda es la primitiva que hace que *modelar* sea una **acción** y no una lectura. Es lo que el MMC comparte con JupyterLab y Octave, y lo que el MMC actual no tiene en ninguna forma.

### 6.2 Contrato

```js
// un instrumento es una función respecto de sus parámetros y del workspace
run({ instrumento, params, workspace })
  → { señal, métricas, ecuaciónResuelta, estado, veredicto }
```

**Entradas:** `params` (del slice `sesion`, con defaults del registro) y `workspace` (el estado compartido, §7).

**Salidas:** `señal` (envoltura normalizada o `null`), `métricas` (THD, pico, RMS, valor, error…), `ecuaciónResuelta` (string), `estado` (canon de 7 estados), `veredicto` (`APROBADO` / `RECHAZADO` / `PARCIAL`, o el dominio del instrumento).

### 6.3 Reproducibilidad

La propiedad que define la celda: **mismos `params` + mismo `workspace` → misma `señal`**. De ahí salen, sin código adicional:

| Capacidad | Cómo se obtiene |
|---|---|
| Reproducir | reejecutar con los `params` capturados |
| Comparar | dos celdas con mismo instrumento, `params` distintos |
| Exportar | serializar la `señal` de una celda (CSV vía `downloadCSV`, JSON, imagen) |
| Enseñar | el historial es la lección; el Kernel del workbench es auditable |

### 6.4 Relación con el `MmcTag`

`MmcTag` (L173–185) es un texto de dos líneas que declara `produce` y `hacia`. El descriptor del registro contiene esa misma información como datos. El texto se **genera** desde el descriptor y deja de estar escrito dentro del componente.

**Lo que `MmcTag` sí conserva:** ser el modelo de la honestidad declarativa visible. El workbench no lo borra como intención — lo convierte en un componente presentacional alimentado por el registro, con una línea por descriptor en vez de nueve copias codificadas a mano.

---

## 7. Workspace

### 7.1 Envoltura de señal normalizada

El workspace es el estado compartido: la señal sobre la que todos los instrumentos trabajan. Se normaliza a una envoltura única, coherente con la Envelope Común de Señal de F3B.

```js
señal = {
  id,        // identidad de la señal en el workbench
  t: [],     // eje temporal — de history.time
  ch: {},    // { [etiquetaNodo]: number[] } — de history[nodeLabel]
  unit,      // 'V' | 'rad' | 'adim' | …
  estado,    // canon de 7 estados — §11
  clase_senal, dominio,
  ts         // timestamp de captura
}
```

**La normalización no inventa nada.** Adopta la forma que `history` ya tiene (`{ time: number[], [nodeLabel]: number[] }`, exactamente el `CircuitSimulationResult` del puerto). `t` y `ch` son una reescritura de nombres, no una transformación de datos.

### 7.2 Nodos y fuente

| Campo | Origen | Propósito |
|---|---|---|
| `workspace.nodos` | `Object.keys(history).filter(k => k !== 'time')` (equivalente a L212) | lista de nodos seleccionable por el inspector |
| `workspace.fuente` | recovering `source` del puerto | `'spice'` \| `'falstad'` \| `'local'` \| `null` |

**`fuente` resuelve una pérdida real.** El puerto exige `source` para trazabilidad (`circuitSimulationPort.js:74–77`) pero `setSimulationResults` lo descarta (`useLabStore.js:60–71`). El workbench lo recupera desde el workspace y lo muestra en el status bar, cerrando la brecha sin tocar el store.

Consecuencia de honestidad: `fuente: 'falstad'` + `estado: 'SIM'` es la afirmación correcta. `fuente: 'falstad'` + `estado: 'REAL'` es un overclaim (H5, §11.3).

### 7.3 Entradas del workspace

Tres procedencias, todas declaradas:

| Procedencia | Productor | `fuente` | `estado` |
|---|---|---|---|
| Señal externa de circuito | `useLabStore.electronicsData.simulationResults` (SPICE/Falstad) | `spice` \| `falstad` | `SIM` (H5) |
| Generador local | instrumento generador (`SignalsInteractive`) | `local` | `SIM` |
| Sin señal | — | `null` | `SIM` + instrumento en modo local |

### 7.4 Salidas del workspace

Lo que un instrumento publica en el workspace y otro puede consumir:

| Salida | Disponible hoy | Consumidor propuesto |
|---|---|---|
| `señal` normalizada | sí (implícito) | todos los instrumentos |
| espectro (`analysis`) | en el puerto, **sin lector** (H6) | `real-signal` → Espectral |
| `netlist` | en el puerto, **sin lector** (H6) | trazabilidad de Electrónica |
| `THD`, pico, RMS | calculado en `RealSignalAnalysis` | el registro ya los declara como `metricas` |
| estado de la ejecución | nuevo (celda) | termómetro de honestidad |

`analysis` y `netlist` son **lectores naturales** del workbench, no capacidades inventadas: el contrato ya existe y ya valida sus invariantes.

### 7.5 Reglas del workspace

- **W1 — fuente única de verdad.** Un solo `workspace` por sesión; las señales de instrumentos locales se publican en él, no en estado privado.
- **W2 — lectura, nunca escritura.** El workbench lee `useLabStore`; no escribe en él (K5).
- **W3 — sin señal no hay simulación de señal.** Un instrumento que necesite señal externa y no la tiene, lo declara; no la sintetiza.
- **W4 — normalización en el borde.** La conversión a `señal` ocurre una vez, en el borde del workspace, no en cada instrumento.

---

## 8. Historial

### 8.1 Forma

```js
celda = {
  id,           // identidad de la celda
  instrumento,   // id del registro (§5)
  params,       // parámetros capturados al ejecutar
  señal,        // envoltura resultante (§7.1) o null
  veredicto,
  estado,       // canon de 7 estados (§11)
  ts
}
```

`historial.celdas` es un array ordenado de esas celdas.

### 8.2 Qué habilita

| Capacidad | Descripción |
|---|---|
| Reproducir | reejecutar una celda con sus `params` |
| Comparar | diff de dos celdas (mismo instrumento, params distintos) |
| Rastrear | qué señal, con qué fuente, produjo qué resultado |
| Limpiar | vaciar el historial sin perder la sesión de parámetros |
| **Enseñar** | el historial documenta el razonamiento, como el kernel de JupyterLab |

### 8.3 Diferencia con la navegación por anclas

La navegación actual (5 botones → `id` de sección) es un índice de documento. El historial es un **registro de ejecución**: responde qué se ejecutó, con qué datos y con qué resultado, no dónde está un título en la página.

El historial es lo que le da al workbench su diferencia de fondo frente a una página larga: en la página larga, recargar pierde todo; en el workbench, la sesión es un objeto inspeccionable.

### 8.4 Reglas del historial

- **H1′ — el historial registra, no juzga.** Guarda el estado de honestidad de cada celda; no lo mejora.
- **H2′ — limpiar el historial no borra la evidencia.** Borra la sesión de trabajo, no los datos del ecosistema.
- **H3′ — el historial no es el ledger.** No es el `Evidence Ledger` de F3E: es estado de sesión local, volátil, sin valor de evidencia.
- **H4′ — el historial no se persiste en el Knowledge Hub.** Fuera de alcance; requeriría gobernanza de evidencia.

---

## 9. Fases F0–F6

**Ninguna fase está autorizada por este documento.** F0 es el punto de partida técnico; la autorización de implementación es una misión explícita y separada (§15).

| Fase | Alcance | Cambia comportamiento | Toca `/dashboard-cmsc` | Toca rutas |
|---|---|---|---|---|
| **F0** | Exportar lo que falta: `RealSignalAnalysis`, `PhasePortraitPlot`, `downloadCSV`, `MmcTag`, `FormulasPanel`, `DynamicSections`. Snapshot previo. | **no** | no | no |
| **F1** | Extraer a `mmc/instruments/*.jsx` con barrel `mmc/index.js`; `AdvancedMathLabV2.jsx` **conserva los re-exports**. | no | no | no |
| **F2** | `mmc/registry.js` declarativo; el shell pasa a renderizar desde el registro. | no | no | no |
| **F3** | `mmcStore`: `sesion`, `workspace`, `historial`, `honestidad`. Instrumentos reciben `params` por props. | **sí** (parametrización) | no | no |
| **F4** | `mmc/plot/`: `linearScale`, `pathFrom`, `axes`, `<Plot>`. Migrar los 12 `<svg>`. | no (visual) | no | no |
| **F5** | Shell `/mmc`: rail + canvas + inspector + celdas. | **sí** | no | **ruta nueva** |
| **F6** | Módulos vacíos con estado declarado y enlaces (§12). | no | no | no |

**Invariante de orden:** extraer → registrar → kernel → shell → ruta. Ninguna fase avanza sin pasar su gate (§14).

**Invariante de reversibilidad:** F0–F4 no cambian comportamiento observable; revertir cualquiera es un `git revert` sin migración de datos. F5 es la primera fase que introduce superficie de UI, y es aditiva: `/advanced-math-v2` y `/dashboard-cmsc` permanecen intactas.

**F6 no implementa instrumentos.** Declare los 3 módulos vacíos con su estado honesto y su enlace. Si en el futuro se implementa Optimización, es un instrumento nuevo con descriptor nuevo, no un reetiquetado (§15, ítem 1).

---

## 10. Wireframe completo

### 10.1 Vista principal de `/mmc` (propuesta, no implementada)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ● EN VIVO   f 1.00 kHz   a 0.10 V   n 1024   fuente falstad   [SIM]   3 ⌫ │  ← status bar
├───────────┬──────────────────────────────────────────────┬───────────────────┤
│ MÓDULOS   │  CANVAS / NOTEBOOK                            │ INSPECTOR         │
│           │                                              │                   │
│ ▸ Modelos │  ┌─ celda 1 ─────────────── [modelo] ─ ✕ ─┐  │ ECUACIÓN          │
│   λ Eigen │  │ dy/dx + y = eˣ                          │  │ dy/dx + y = eˣ   │
│   ∠ Geom  │  │ ┌───────────┐  ┌─────────┐ ┌────────┐   │  │                  │
│           │  │ │  params   │  │ gráfica │ │ lectura │   │  │ PARÁMETROS       │
│ ▸ Señales │  │ │ y(0) ▬▬●  │  │  ╱‾‾╲   │ │ y(5)   │   │  │ y(0)  [ 1.00 ]  │
│   ℱ Fourier│  │ │ x    ▬▬●  │  │ ╱    ╲  │ │ 148.4  │   │  │ x    [ 5 ]     │
│   ℱ AM    │  │ └───────────┘  └─────────┘ └────────┘   │  │                  │
│   ℂ Comple│  │ señal: TRAZEDIA   resultado: solución    │  │ SALIDA           │
│           │  └────────────────────────────────────────┘  │ [CSV] [→Espectral]│
│ ▸ Simulac.│  [+ nueva celda]                            │                   │
│   ∂ EDO   │                                              │ DESTINOS          │
│   ∫ Integr│  ┌─ celda 2 ─────────────── [señal] ─ ✕ ─┐  │ [Electrónica]     │
│           │  │ s(t)=(1+m·cos2πf_m t)·cos2πf_c t       │  │ [Telecom]        │
│ ▸ Optimiz.│  │ (gráfica 380×200)                        │  │ [IA] [KH]        │
│   ⚠ VACÍO │  │ señal: AM  ·  4 gráficas  ·  1600px ▼  │  │                  │
│ ▸ Electr. │  └────────────────────────────────────────┘  │ HISTORIAL         │
│   ⚡ Señal │                                              │ ▸ celda 1  ✓ SIM  │
│ ▸ IA      │                                              │ ▸ celda 2  ✓ SIM  │
│   ⚠ VACÍO │                                              │                   │
│ ▸ Telecom │                                              │ [Ejecutar ▸]      │
│   ⚠ VACÍO │                                              │                   │
│   Ref. ⑥ │                                              │                   │
└───────────┴──────────────────────────────────────────────┴───────────────────┘
```

### 10.2 Rail de módulos

Cada entrada del rail es un módulo del registro:

| Elemento | Contenido | Comportamiento |
|---|---|---|
| nombre de módulo | Modelos, Señales, Simulación, Optimización, Electrónica, IA, Telecom, Referencia | filtro del canvas |
| contador de instrumentos | nº de filas no vacías del módulo | 2 · 2 · 2 · 1 · 1 · 0 · 0 · 2 |
| estado del módulo | `SIM` / `REF` / `DISENO` | badge del canon |
| marca de vacío | `⚠ VACÍO` | solo si `vacio: true` en todas sus filas |

**Invariante:** el rail no puede mostrar un módulo con instrumentos que no existan. El contador y el estado se leen del registro; no se escriben a mano.

### 10.3 Estados de una celda

La celda es la unidad de la propuesta. Estados de renderizado, derivados de `workspace.fuente`, `instrumento.estado` y `vacio`:

```
celda de instrumento:
  · sin señal externa        → banner "modo local · instrumentos SIM"
  · con señal, sin nodo      → selector de nodo   (estado sin-nodo, H3 §13)
  · con nodo                 → gráfica + lectura
      ├─ sub-vista E.Dif.    → ecuación diferencial
      └─ sub-vista Transfer. → función de transferencia

celda de módulo vacío:
  · estado DISENO            → "sin instrumento · estado DISENO" + enlace de salida
```

`downloadCSV` (L107–123) pasa a estar disponible en **todos** los estados con historial, no solo cuando hay señal activa ( hoy está inalcanzable, L13).

### 10.4 Inspector

Contexto bajo demanda, no explicación previa (regla de orden de lectura del §11 del diseño):

1. **Ecuación** — del registro, no escrita a mano.
2. **Parámetros** — del esquema `params` del registro.
3. **Salida** — CSV, exportar JSON, enviar a destino.
4. **Destinos** — del campo `hacia` del registro.
5. **Historial** — las celdas de la sesión.

### 10.5 Responsive y coexistencia

- `> 1440px`: 3 paneles completos.
- `1024–1440px`: 3 paneles, inspector colapsable.
- `< 1024px`: rail colapsable + canvas + inspector en cajón.

La propuesta **no altera** el layout de `/advanced-math-v2` ni el de `/dashboard-cmsc`; son superficies separadas (F5 es aditivo).

---

## 11. Estados honestos

### 11.1 Canon aplicado

El workbench usa el canon unificado de 7 estados de `CMSC_CANONICAL_STATES_APPENDIX_V1`, sin estados nuevos:

| Estado | Uso en el MMC |
|---|---|
| `REAL` | (ninguno hoy) |
| `REAL-LOCAL` | (ninguno hoy) |
| `SIM` | los 6 instrumentos que generan datos deterministas + la señal de circuito |
| `DISENO` | los 3 módulos vacíos |
| `ROTO` | `AdvancedMathLab` V1 (existente, fuera de este trabajo) |
| `HUERFANO` | (ninguno tras la migración; hoy `bridgeStatus` del store) |
| `REF` | `ComplexInteractive`, `FormulasPanel` |

### 11.2 Reglas de presentación

1. **Badge junto al valor**, nunca solo (regla 1 del apéndice).
2. **El estado no mejora por navegación** (K2).
3. **`confidence` es ortogonal** y se muestra aparte (K4).
4. **El estado viaja con la señal**: cada celda muestra el estado de la señal que consume, no el del instrumento.
5. **Sin dato no hay estado**: un instrumento sin señal externa se declara en modo local, no `REAL` por omisión.

### 11.3 Discrepancia detectada: «señal real» sobre datos simulados

**Este documento no cambia la etiqueta.** Lo reporta como ítem de gobernanza.

| Elemento | Valor actual | Lectura según evidencia | Fuente |
|---|---|---|---|
| Status bar, señal activa | «señal real · Electrónica» (`L80`) | `SIM` | los 2 escritores son simuladores de circuito (H5) |
| Status bar, sin señal | «sin señal · generadores locales» (`L80`) | correcto | generadores deterministas |

**La evidencia (H5):** los únicos escritores de `history` son `ElectronicsLab.jsx:545` (SPICE/Pyodide) y `FalstadPanel.jsx:887` (Falstad). Ningún sensor físico alimenta este laboratorio; el store no expone puerto para `SensorReading` ni `RobotTelemetry`.

**Por qué no se corrige en este documento:** cambiar una etiqueta de estado de la UI es un cambio de canon y una misión de gobernanza, no una línea de código en un diseño. §15, ítem 3.

**Qué sí se congela:** el descriptor `real-signal` se declara `estado: 'SIM'` con `fuente` dinámica, que es lo que la evidencia sostiene. Si Bernardo decide que la etiqueta de UI debe decir otra cosa, se ajusta como ítem de gobernanza y el descriptor se alinea.

### 11.4 Lo que este diseño NO hace con la honestidad

- **No etiqueta un instrumento vacío como capacidad.** (§12)
- **No infiere estado por navegación ni por contexto.** Un instrumento no se vuelve `REAL` porque haya otro en la misma pantalla.
- **No fabrica `confidence`.** Sin dato de confianza, el campo queda vacío, no en 1.0.
- **No improve el estado de S35 ni de ninguna señal del catálogo.** El MMC es consumidor, no juez.

---

## 12. Módulos vacíos

### 12.1 Los tres módulos sin instrumento

La misión pide 7 módulos. **Tres no tienen ningún instrumento hoy.** Esto se declara, no se disimula.

| módulo | instrumentos | estado | fila en registro | salida declarada |
|---|---|---|---|---|
| **Optimización** | 0 | `DISENO` | `optimization`, `vacio: true` | — |
| **IA** | 0 | `DISENO` | `ia`, `vacio: true` | `/ai-predictive` |
| **Telecom** | 0 | `DISENO` | `telecom`, `vacio: true` | `/lab-telecom` |

**Por qué esto importa más de lo que parece:** la petición original («optimización, IA, telecom») sugiere capacidades que el MMC no tiene. Un workbench que muestra un panel de «Optimización» con un gráfico decorativo, o que «integraría IA» sin un solo modelo conectado, es exactamente el simulacro que el canon del proyecto prohíbe. La respuesta correcta es que el módulo exista **declarado y vacío**, con su estado y su salida, y que llenar la capacidad requiera un instrumento nuevo con descriptor nuevo.

### 12.2 Reclasificación de dos instrumentos a Referencia

Dos instrumentos no son cálculos: son vistas. Reclasificarlos no los elimina (invariante de conservación) pero evita contarlos como capacidad.

| instrumento | hoy | propuesto | razón |
|---|---|---|---|
| `GeometryInteractive` | módulo Modelos | módulo Referencia (bridge) | muestra R(θ) y su autovalor; no calcula geometría |
| `ComplexInteractive` | módulo Señales | módulo Referencia | mapeo visual de f(z)=z²; no resuelve variable compleja |

`FormulasPanel` y `ComplexInteractive` quedan en Referencia con `estado: REF`.

### 12.3 La regla que impide el simulacro

> **Un módulo sin instrumento se renderiza como estado, nunca como instrumento.**
>
> `vacio: true` en el descriptor → el shell dibuja estado + enlace de salida. Nunca una gráfica, nunca un «placeholder que parece dato».

Es la regla R4 del registro y la gate G-F6 (§14).

---

## 13. Riesgos

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| **R1** | **Extraer rompe `/dashboard-cmsc`.** `MathModelingCell.jsx:6` importa 4 named de `AdvancedMathLabV2.jsx` | **alta** | alto | F1 conserva re-exports; gate G-F1 |
| **R2** | **Hacer `/mmc` en lugar de `/advanced-math-v2`** sacrifica el único acceso a los instrumentos | media | alto | F5 es aditivo; `/advanced-math-v2` intacta |
| **R3** | **F3 deja un control muerto**: instrumento con estado local que no lee `params` → slider que no hace nada | **alta** | medio | gate G-F3: todo control escribe y lee el store |
| **R4** | **Etiquetas de honestidad ambiguas**: `SIM` de generador local vs `SIM` de circuito simulado se muestran igual | media | **alto** | K3 separa `fuente` de `estado`; ambos visibles en el status bar |
| **R5** | **La discrepancia «señal real» (H5) se propaga al registro** | **alta** si no se decide | **alto** | §11.3 congela `SIM`; ítem 3 de §15 bloqueante |
| **R6** | **Pérdida de `source`** al cruzar el store impide trazar la señal | alta | medio | `workspace.fuente` recupera la trazabilidad (H6) |
| **R7** | **Un módulo vacío se rellena con un adorno** y pasa por capacidad | media | **alto** | R4 + gate G-F6 |
| **R8** | **Dependencia circular**: MMC ↔ IA ↔ Electrónica ↔ Telecom | media | alto | MMCC no importa labs; solo renderiza enlaces; K5 (no muta el store) |
| **R9** | **Migrar los 12 SVG altera la lectura de una gráfica validada** | media | medio | F4 con gate de paridad visual por gráfica |
| **R10** | **El registro se desincroniza del código** al extraer instrument (`implementacion` apunta a rutas movidas) | media | medio | gate G-F2 verifica que cada fila resuelve a un archivo existente |
| **R11** | **Granularidad de F0–F6 mal calibrada**: F0 «solo exports» toca 6 símbolos públicos | media | bajo | F0 es el gate más barato; si falla, se detiene ahí |
| **R12** | **Confundir `/mmc` con el catálogo de `/labs`** y duplicar navegación | baja | medio | `/mmc` es workbench; `/labs` es catálogo académico; ambos se mantienen |

**Riesgo dominante: R5.** La discrepancia de honestidad de §11.3 no es un detalle de UI: si se congela el diseño con la etiqueta actual, el registro hereda un `REAL` sin respaldo y el canon queda roto en el punto de entrada del workbench.

---

## 14. Gates de validación

### 14.1 Gates por fase

Cada fase pasa o se detiene. Ninguna fase avanza sin su gate.

| Gate | Fase | Criterio de paso | Cómo se verifica |
|---|---|---|---|
| **G-F0** | F0 | Los 6 símbolos nuevos exportados; **0 cambio de comportamiento** | build + `/advanced-math-v2` y `/dashboard-cmsc` renderizan igual; los 8 instrumentos visibles |
| **G-F1** | F1 | `/dashboard-cmsc` **intacto**; barrel resuelve los 6 exports | build + render de `/dashboard-cmsc` sin errores + import de `MathModelingCell.jsx:6` sin modificar |
| **G-F2** | F2 | 0 strings de metadatos duplicados; cada fila del registro resuelve a un archivo existente | grep de metadatos + resolución de cada `implementacion` |
| **G-F3** | F3 | Todo control escribe y lee `mmcStore`; el estado es reproducible | prueba por instrumento: cambiar `params` cambia el resultado de forma determinista |
| **G-F4** | F4 | Paridad visual de las 12 gráficas migradas | captura antes/después de cada instrumento |
| **G-F5** | F5 | `/mmc` renderiza los 7 módulos + Referencia; `/advanced-math-v2` y `/dashboard-cmsc` intactas | build + las 19 rutas existentes responden |
| **G-F6** | F6 | Los 3 módulos vacíos se renderizan como estado, no como instrumento; sus enlaces resuelven | inspección del rail: `⚠ VACÍO` presente, 0 gráficas en módulos vacíos |

### 14.2 Gates transversales (todas las fases)

| Gate | Criterio |
|---|---|
| **GT-1 Invariante de conservación** | Los 8 instrumentos siguen renderizando y funcionando en `/advanced-math-v2`. Ninguno se elimina. |
| **GT-2 Invariante de honestidad** | Todo valor visible lleva estado del canon. Ningún estado mejora por navegación. Sin dato no hay estado. |
| **GT-3 Invariante de aditividad** | 0 rutas modificadas hasta F5; 0 cambios en `/dashboard-cmsc` en F0–F4. |
| **GT-4 Invariante de build** | `npm run build` sin errores ni warnings nuevos. |
| **GT-5 Invariante de store** | `useLabStore` no se muta (K5). Lectura únicamente. |
| **GT-6 Invariante de rutas existentes** | Las 19 rutas de `App.jsx` responden. `/advanced-math-v2` y `/dashboard-cmsc` intactas. |
| **GT-7 Invariante de alcance** | 0 cambios en backend, ACP, benchmark, Knowledge Hub, canon de estados y `signalCatalog`. |

### 14.3 Gate de gobernanza previo a F0

**G-GOV:** antes de autorizar F0, Bernardo debe resolver los ítems 1 y 2 de §15. El ítem 3 (`SIM` vs `REAL`) no bloquea F0 (que no cambia etiquetas) pero sí bloquea F2 (que congela `estado` en el registro).

---

## 15. Decisiones abiertas (ítems de gobernanza)

Ninguna se resuelve en este documento. Todas requieren decisión de Bernardo.

| # | Decisión | Opciones | Bloquea | Recomendación técnica |
|---|---|---|---|---|
| **1** | **Optimización vacío** | (a) estado honesto `DISENO` con mensaje; (b) reetiquetar `DiffEqInteractive` como «optimización dinámica» | F6 | **(a)** — (b) es un reetiquetado sin evidencia, prohibido por el canon |
| **2** | **Barrel en F1** | (a) `mmc/index.js` con re-exports, CMSC intacto; (b) actualizar el import de `MathModelingCell.jsx:6` en la misma fase | **F0/F1** | **(a)** — más conservador; mete al CMSC en la migración es un riesgo adicional innecesario |
| **3** | **Etiqueta de `real-signal`** | (a) `SIM` (lo que sostiene la evidencia, H5); (b) `REAL` | **F2** | **(a)** — la evidencia dice `SIM`; (b) requiere una misión de gobernanza que justifique un cambio de canon |
| **4** | **Alcance de la etiqueta real** | (a) `signalCatalog` se alinea al registro en F2; (b) se alinea después | F2 | (a) si se autoriza F2; (b) si el CMSC no debe tocarse nunca |

**Nota sobre el ítem 4:** R3 del registro dice que el registro no sustituye a `signalCatalog`. La alineación es por `id`, sin escritura doble. Si se prefiere que el MMC nunca escriba en el catálogo, la alineación es de una sola dirección y se documenta como tensión conocida.

---

## 16. Cierre

Con este documento queda **congelado** el diseño del Scientific Workbench del MMC:

- **Problema y límites** (§1–2) verificados contra 1018 líneas de código real.
- **10 hallazgos de auditoría** (§3), ninguno corregido, incluido el más importante: la señal que la UI llama «real» es salida de un simulador de circuito (H5).
- **El kernel** (§4) como la pieza que convierte 4 cálculos en 1 workbench, con 6 reglas.
- **El registro** (§5) que elimina la triplicación de metadatos (H4), con 8 filas reales y 3 vacías.
- **El contrato de celda** (§6) que hace que *modelar* sea una acción reproducible.
- **Workspace** (§7) e **historial** (§8) como las dos primitivas del trabajo científico.
- **F0–F6** (§9) con invariante de orden y de reversibilidad.
- **Wireframe completo** (§10) con 3 paneles y estados de celda declarados.
- **Estados honestos** (§11) con la discrepancia «señal real» reportada, no corregida.
- **3 módulos vacíos** (§12) declarados como tales, con la regla que impide rellenarlos de adorno.
- **12 riesgos** (§13), con R5 como dominante.
- **7 gates de fase + 7 gates transversales** (§14), verificables sin subjetividad.

**Lo que este documento NO autoriza:** implementar F0–F6, crear la ruta `/mmc`, extraer archivos, modificar código, reetiquetar estados, alinear `signalCatalog` o tocar ACP, benchmark, Knowledge Hub o backend.

**El diseño está congelado. La implementación es una misión aparte, con orden explícito.**

---

*Documento canónico de arquitectura · SOLO DISEÑO · sin código · sin commits · sin push.*
*Rama `feature/cmsc-f3c-v1-implementation` · HEAD `eff39a8` · `stash@{0}` `PRE_MULTI_AGENT_2026_09_29` intacto.*
