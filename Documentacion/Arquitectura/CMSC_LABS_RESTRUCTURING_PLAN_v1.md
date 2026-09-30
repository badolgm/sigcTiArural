# CMSC — Plan de Reestructuración de Laboratorios (v1)

- **Fecha**: 2026-09-27
- **Naturaleza**: DISEÑO v1 · auditoría forense por laboratorio · plan de reorganización. SIN código.
- **Documento compañero**: `SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` (arqueología global), `CMSC_SIGNAL_MAP_v1.md` (S01..S80), `CMSC_MASTERPLAN_v1.md`, `CMSC_CANONICAL_STATE_v1.md`.
- **Regla rectora CMSC**: LA SEÑAL ES EL CENTRO, NO EL LABORATORIO. Un laboratorio solo es preservable si produce, procesa o interpreta señales verificables (estado real/simulación/diseño honesto).
- **Fuentes**: `src/frontend/src/labs/*.jsx`, `src/frontend/src/pages/*`, historial git (agente git), docs estratégicos (`ECOSYSTEM_IDENTITY.md`, `SIGCTIARURAL_VISION_ALIGNMENT.md`, `SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md`).

---

## 1. Propósito

Transformar la colección actual de laboratorios (V1/V2 huérfanos, avances 2026-08-17, cuarentenas) en una **estructura de laboratorios que alimente a CMSC**, respetando los invariantes: NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.

Este plan NO ordena implementar nada. Es el mapa de decisión (preservar/integrar/reorganizar/obsoletos) que cualquier misión futura usará antes de tocar un lab.

---

## 2. Leyenda de estado (honestidad invariante)

| Estado | Significado |
|---|---|
| `REAL` | Produce/se procesa señal real persistente (SensorReading, RobotTelemetry). |
| `REAL-LOCAL` | Señal real solo en vivo/navegador (micrófono→FFT Telecom). |
| `SIM` | Señal simulada. |
| `DISENO` | Solo documentación/diseño. |
| `ROTO` | No funciona pese a existir (motor legado, cadena rota). |
| `HUERFANO` | Existe, funciona, pero sin conexión con el resto del ecosistema. |

---

## 3. Mapa histórico por laboratorio (git)

| Laboratorio | Nacimiento | Última actividad | Commits | Estado | Período muerto |
|---|---|---|---|---|---|
| AdvancedMathLab.jsx | `7ddbb59` 2025-11-03 | `2eaa425` 2026-05-23 | 4 | V1 · `ROTO`/`HUERFANO` | 127 días |
| AdvancedMathLabV2.jsx | `6db9b69` 2025-11-04 | `7850d66` 2026-08-17 | 4 | V2 · `SIM` | 41 días |
| ElectronicsLab.jsx | `6db9b69` 2025-11-04 | `7850d66` 2026-08-17 | **11** | **el más activo** · `SIM`/`REAL` | 41 días |
| TelecomLab.jsx | `a21e65e` 2025-11-03 | `a21e65e` 2025-11-03 | 1 | `REAL-LOCAL` (mic→FFT) | **328 días** |
| RoboticsLab.jsx | `a21e65e` 2025-11-03 | `f75cd09` 2026-01-26 | 7 | `SIM`/`DISENO` | 244 días |
| EmbeddedLab.jsx | `a21e65e` 2025-11-03 | `a21e65e` 2025-11-03 | 1 | `DISENO` | **328 días** |
| SchematicEditor.jsx | `84a32ed` 2026-01-27 | `2434bbc` 2026-08-16 | 8 | **en cuarentena** | — |
| DataScienceLab.jsx | `f7821af` 2025-11-04 | — | 1 | `HUERFANO` | ~10 meses muerto |
| mathHelpers | — | — | — | soporte de V1/V2 | — |

**Patrones clave**:
- La oleada fundacional fue **2025-11-03/04** (4 labs nacen el mismo día, commits `7ddbb59`/`6db9b69`/`a21e65e`): construcción en masa, no orgánica.
- Solo **ElectronicsLab** tiene vida continua real (11 commits) y es quien cruza con Math V2 vía `useLabStore`.
- TelecomLab y EmbeddedLab **nunca evolucionaron** (1 commit, 328 días muertos): construcción-olvidada.
- La última actividad real en labs es **`7850d66` 2026-08-17** (avance Electronica/MathV2), y el merge-base con `main` es exactamente `7b3ff9f` 2026-08-17: **todo lo posterior no toca labs**.

---

## 4. Mapa de laboratorios actual (frontend)

| Lab | Ruta | Estado | Función |
|---|---|---|---|
| ElectronicsLab | `/lab-electronics` | `SIM`/`REAL` | Cruces lógicos, señal vía `useLabStore` |
| TelecomLab | `/lab-telecom` | `REAL-LOCAL` | Micrófono→WebAudio→FFT (única señal acústica real en vivo) |
| RoboticsLab | `/labs/robotics` | `SIM`/`DISENO` | Cinemática/simulación |
| EmbeddedLab | `/lab-embedded` | `DISENO` | BBB/telemetría planificada |
| DataScienceLab | `/data-science` | `HUERFANO` | Análisis de datos V2, sin conexión |
| AIPredictiva | `/ai-predictive` | `SIM`/`DISENO` | Modelo IA (degenerado `plant_disease_mbv2.h5`) |
| Knowledge Hub | `/knowledge` | `REAL` (repo) | 51 docs, solo visor |
| AdvancedMathLab V1 | — | `ROTO`/`HUERFANO` | Motor legado, `SHOW_LEGACY_ENGINE_TOGGLE=false` |
| AdvancedMathLab V2 | — | `SIM` | Motor moderno, activo |
| SchematicEditor | — | cuarentena | Editor de esquemáticos |

Accesos rápidos en `Dashboard.jsx:29-37` (`LAB_QUICK_ACCESS`); catálogo de labs con filtrado por categoría en LabCatalog (nótese que los labs se describen como categorías, ver hallazgo de duplicidad §9).

---

## 5. Mapa de señales (resumen desde SIGNAL_MAP v1)

- Inventario S01..S80, 12 tipos (canónico en `CMSC_SIGNAL_MAP_v1.md`).
- **Únicas señales reales persistentes**: temp/humedad (SensorReading V3, `RobotTelemetry`) — sin productor físico (`sensor_reader.py` = 0 bytes).
- **Única señal acústica real en vivo**: micrófono → FFT en TelecomLab (WebAudio), `REAL-LOCAL`.
- Resto: simulación o diseño. No hay broker MQTT ni WebSockets; `wire_all()` del EventBus nunca se invoca al arranque.
- M1 (MobileNetV2) congelado sin artefactos reconstruibles en disco; es la base epistemológica (el modelo IA no es fuente de señal viva).

---

## 6. Mapa de conocimiento (Knowledge Hub)

- 51 documentos, rol actual: **visor** (`HUERFANO` como nodo activo: no recibe evidencias nuevas).
- La cadena prevista (ECOSYSTEM_IDENTITY:31): Señales→Electrónica→Matemáticas→Telecom→…→**Conocimiento**: el KH es el sumidero final de evidencia.
- Hoy ningún lab escribe evidencia en el KH. Esta es la brecha estructural que CMSC debe cerrar (la evidencia de los 6 sub-agentes debe aterrizar ahí).

---

## 7. Mapa CMSC (cómo deben alimentarse los labs desde CMSC)

Clave de lectura: los laboratorios NO son destino; son **eslabones de la cadena de señal hacia CMSC**. La topología de referencia:

- Cadena de 10 eslabones (LAB_CONNECTIVITY_MODEL:19-32): Matemáticas→Física→Electrónica→Telecom→Embebidos→IoT→IA→Agricultura→Proyectos→Impacto.
- Cadena de 8 eslabones (VISION_ALIGNMENT:20-43): Conocimiento→Labs→Hardware→Protocolos→Telemetría→IA→Proyectos→Impacto.
- "4 laboratorios canónicos" (VISION_ALIGNMENT:67) marca el núcleo: los demás se cruzan con estos.
- CMSC agrega: Laboratorio de Análisis Espectral (FFT/STFT/Wavelets/Espectorama/Bioacústica/RF/Audio/Vibraciones) como **Fase 2 planificada — F3 del roadmap**, NO implementado.

**Gap**: ninguna de las 3 cadenas está cableada hoy (ver forense: solo 1 conexión real entre labs). El plan de reestructuración es la hoja de ruta para cablearlas — en diseño, no en código.

---

## 8. Clasificación preservar/integrar/reorganizar/obsoletos

| Categoría | Laboratorios | Justificación |
|---|---|---|
| **PRESERVAR** (RAÍZ) | ElectronicsLab, AdvancedMathLabV2 | Única conexión real viva (Electrónica→Math V2); motor moderno de cálculo. |
| **PRESERVAR** (SEÑAL) | TelecomLab | Única señal acústica real (mic→FFT); semilla viva del Lab Espectral. |
| **INTEGRAR** | EmbeddedLab, RoboticsLab, DataScienceLab | Nacieron como nodos de la cadena (embebidos/IoT) pero quedaron aislados; integrar = conectar, no rehacer. |
| **REORGANIZAR** | AIPredictiva, Knowledge Hub | Pasar de visor/aislado a consumidor-productor de evidencia CMSC (KH = sumidero final; IA Predictiva = subagente). |
| **OBSOLETOS** (preservar en archivo, NO borrar) | AdvancedMathLab V1, SchematicEditor (cuarentena) | Motor legado inalcanzable/`ROTO`; editor en cuarentena. Invariante NADA DESAPARECE: git las conserva. |

No hay ningún laboratorio propuesto para **borrado**: la regla suprema impide que desaparezcan.

---

## 9. Duplicidades detectadas (candidatas a unificación)

1. **FFT en dos lugares**: TelecomLab (WebAudio, real) y AdvancedMathLabV2 (matemática). En CMSC confluyen en el Lab Análisis Espectral: FFT real (Telecom) alimenta/contrasta FFT analítica (Math V2).
2. **Categorías vs laboratorios**: LabCatalog describe labs como categorías de documentación, dejando sin diferenciar docs de laboratorio frente a docs del KH (hallazgo de categoría en agente-frontend, ver §4).
3. **Simulación duplicada en señal**: modelo IA y simuladores repiten transformadas sin compartir pipeline; la señal debe ser bien central única (CMSC_MASTERPLAN: señal como bien central).

---

## 10. Dossier por laboratorio (12 preguntas)

Por cada lab se responde: estado real · qué señal produce/procesa · quién la consume · si su estado es honesto · origen histórico · si tiene conexión · si preservar · qué lo alimenta · qué emite · si es canónico · modelo/dependencia · veredicto.

### 10.1 ElectronicsLab — PRESERVAR (RAÍZ)
1. **Estado**: `SIM`/`REAL` (cruce de señal vía `useLabStore`). 2. **Señal**: simulada eléctrica/cruces lógicos; única real: herencia de SensorReading. 3. **Consumidores**: AdvancedMathLabV2 (conexión viva) y, en diseño, Lab Espectral. 4. **Honestidad**: sí (etiquetado). 5. **Origen**: `6db9b69` 2025-11-04. 6. **Conexión**: la ÚNICA real inter-lab. 7. **Preservar**: sí, es raíz. 8. **Entradas**: configs de usuario + señales sensor. 9. **Emisiones**: señal intermedia etiquetada. 10. **Canónico**: sí (arranque de cadena). 11. **Modelo**: JS, `useLabStore`. 12. **Veredicto**: nodo raíz a preservar y conectar a CMSC como productor tipo "Electrónica".

### 10.2 AdvancedMathLabV2 — PRESERVAR (RAÍZ)
1. **Estado**: `SIM`. 2. **Señal**: transformaciones matemáticas (sin FFT de audio salvo rutina propia). 3. **Consumidores**: ninguno directo hoy (solo interactivo). 4. **Honestidad**: sí. 5. **Origen**: `6db9b69` 2025-11-04, último `7850d66` 2026-08-17. 6. **Conexión**: recibe de Electrónica vía `useLabStore`. 7. **Preservar**: sí (motor moderno de cálculo). 8. **Entradas**: señal de Electrónica + param usuario. 9. **Emisiones**: resultados numéricos visibles. 10. **Canónico**: matemáticas = eslabón 1 de cadena 10. 11. **Modelo**: `mathHelpers`. 12. **Veredicto**: preservar como motor; duplicidad FFT a unificar con Lab Espectral (§9.1).

### 10.3 AdvancedMathLab V1 — OBSOLETO (archivo)
1. **Estado**: `ROTO`/`HUERFANO`, motor legado `SHOW_LEGACY_ENGINE_TOGGLE=false`. 2-12. **Veredicto**: preservar en git como referencia histórica (regla NADA DESAPARECE); NO migrar, NO desbloquear fuera de misión explícita. Su rol conceptual lo absorbe V2.

### 10.4 TelecomLab — PRESERVAR (SEÑAL)
1. **Estado**: `REAL-LOCAL` (mic→WebAudio→FFT). 2. **Señal**: acústica real en vivo; la única de todo el ecosistema. 3. **Consumidores**: ninguno (muere en el visor). 4. **Honestidad**: sí. 5. **Origen**: nació y murió en `a21e65e` 2025-11-03 (1 commit, 328 días muerto). 6. **Conexión**: ninguna. 7. **Preservar**: sí — es la semilla viva del Lab Espectral. 8. **Entradas**: micrófono del navegador. 9. **Emisiones**: espectro/FFT en vivo. 10. **Canónico**: telecom = eslabón 3 de cadena 10. 11. **Modelo**: WebAudio/AnalyserNode. 12. **Veredicto**: nodo SEÑAL por antonomasia; su FFT debe confluir en Lab Espectral (Fase 2 CMSC).

### 10.5 RoboticsLab — INTEGRAR
1. **Estado**: `SIM`/`DISENO`. 2. **Señal**: cinemática simulada. 3. **Consumidores**: ninguno. 4. **Honestidad**: sí. 5. **Origen**: `a21e65e` 2025-11-03, último `f75cd09` 2026-01-26 (244 días muerto). 6. **Conexión**: ninguna. 7. **Preservar**: sí, integrar a cadena (robótica/IoT). 8. **Entradas**: parámetros de usuario. 9. **Emisiones**: trayectorias simuladas. 10. **Canónico**: no eslabón directo; es consumidor de Electrónica y productor para IA. 11. **Modelo**: JS. 12. **Veredicto**: integrar en misión futura como productor de señales simuladas etiquetadas para el subagente.

### 10.6 EmbeddedLab — INTEGRAR
1. **Estado**: `DISENO`. 2. **Señal**: prevista (BBB/telemetría). 3-12. **Veredicto**: nació y murió en `a21e65e` (328 días muerto). Sin código físico (`sensor_reader.py` = 0 bytes). Integrar = conectar el diseño de telemetría UBTN (S73) a canal CMSC; el BBB real no existe aún. Preservar como diseño.

### 10.7 DataScienceLab — INTEGRAR
1. **Estado**: `HUERFANO`, ~10 meses sin commits desde `f7821af` 2025-11-04. 2. **Señal**: análisis de datos V2 (sin pipeline). 3-12. **Veredicto**: fue concebido para datos pero quedó aislado. Integrar como consumidor de señales CMSC y productor de evidencia para KH. NO reescribir; conectar.

### 10.8 AIPredictiva — REORGANIZAR
1. **Estado**: `SIM`/`DISENO`; modelo `plant_disease_mbv2.h5` degenerado (colapsa class_0). 2. **Señal**: prognosis de señales (predicción). 3. **Consumidores**: visor. 4. **Honestidad**: parcial (modelo degenerado no etiquetado como tal en UI). 5-12. **Veredicto**: reorganizar como subagente CMSC (predicción/clasificación) que consume señales del Lab Espectral y emite evidencia al KH. El modelo degenerado debe quedar documentado como referencia (M1 sin artefactos reconstruibles en disco).

### 10.9 Knowledge Hub — REORGANIZAR
1. **Estado**: `REAL` (repo, 51 docs), solo visor. 2. **Señal**: conocimiento/evidencia (no señal cruda). 3. **Consumidores**: usuarios. 4. **Honestidad**: sí. 5-12. **Veredicto**: reorganizar como sumidero final de evidencia CMSC: recibir salidas de labs/subagentes (cambio de rol, no de código).

### 10.10 SchematicEditor — OBSOLETO (cuarentena)
1. **Estado**: cuarentena (último `2434bbc` 2026-08-16, 8 commits). 2-12. **Veredicto**: sin producción de señal; preservar en git como herramienta, fuera de la cadena de señal CMSC salvo misión explícita.

---

## 11. Matriz de continuidad (Lab → Entradas → Procesamiento → Salidas → KH → Impacto)

| Lab | Entradas | Procesamiento | Salidas | KH | Impacto |
|---|---|---|---|---|---|
| ElectronicsLab | user config + sensor V3 | cruces/lógica | señal etiquetada | evidencia de cruce | raíz de cadena |
| AdvancedMathLab V2 | señal Electrónica | transformadas | nº analítico | evidencia de cálculo | eslabón Matemáticas |
| TelecomLab | micrófono | FFT (WebAudio) | espectro real | espectro como evidencia | semilla Lab Espectral |
| RoboticsLab | params | cinemática | trayectorias SIM | sim como referencia | consumidor Electrónica |
| EmbeddedLab | UBTN (diseño) | telemetría (diseño) | S73 (diseño) | telemetría real | puente hardware |
| DataScienceLab | señales CMSC | análisis V2 | datos/visual | evidencia analítica | consumidor central |
| AIPredictiva | señales + modelo | inferencia | prognosis | evidencia IA | subagente predictivo |
| Knowledge Hub | evidencia de todos | indexación | conocimiento | — (es el sumidero) | decisión |

En estado actual la columna **KH** está vacía para todos los labs: ese es el "cableado faltante" que el plan defiende (diseño, no implementación).

---

## 12. Sección especial: Laboratorio Matemático (A calculadora vs B modelador)

- **Forense concluye**: el lab NO es calculadora (rol rompido documentalmente 2026-05-23→freeze). Su definición en v3.2 (2026-01-28) es **modelador de señales**.
- **Veredicto del plan**: **OPCIÓN B — modelador**. Razones: (1) es la definición canónica original; (2) encaja con la señal como bien central; (3) la cadena de 10 eslabones lo ubica como modelador hacia Electrónica→Telecom; (4) integra el Lab Espectral como consumidor final.
- Consecuencia: las misiones futuras NO re-escribirán el lab matemático de cero (regla del masterplan); lo **conectarán** como modelador de señales dentro de CMSC. Prerrequisito irrenunciable: el plano `CMSC_SIGNAL_MAP_v1.md` ya existe; el plan de reestructuración lo usa como base.

---

## 13. Sección especial: Laboratorio de Análisis Espectral (encaje)

- **Decisión**: **transversal a CMSC, no lab independiente aislado**. Fase 2 del roadmap (F3), NO implementado.
- Razones: su entrada son las señales del mapa (S01..S80, con énfasis en acústica Telecom + futuras UBTN); su salida alimenta a los sub-agentes (clasificación/predicción/anomalías). Nacer como módulo transversal evita repetir el error de labs huérfanos.
- Relación con duplicidad §9.1: el FFT de TelecomLab y el de Math V2 son sus primeros insumos reales.

---

## 14. Sección especial: ACP (Agente Científico Principal) — qué lo alimenta

- **Fuentes**: sub-agentes Matrix/Clasificación/Predicción/Anomalías/Modelado/Interpretación (masterplan) consumen señales de labs.
- **Del mapa histórico** (quién debe alimentar de verdad): Electro (raíz) → Math (modelador) → Telecom (FFT real) → Embebido/UBTN (S73) → IA (prognosis) → KH (evidencia).
- **Del mapa de señales**: solo temp/hum + robot telemetry hoy; el resto SIM/DISENO — el ACP debe operar con honestidad de estado (señales de referencia y simulación marcadas).

---

## 15. Recomendación final

1. **Congelar la reorganización física de labs**: sin misión explícita no se mueve un `.jsx`.
2. **Prioridad de conexión en futuras misiones (solo diseño hasta nueva orden)**: (a) cablear Telecom→Lab Espectral (la única señal real viva lleva 328 días sin salida); (b) unificar FFT Matematical/Telecom; (c) definir contrato KH como sumidero de evidencia; (d) integrar DataScienceLab como consumidor; (e) tomar decisión benchmark M1 vs M2 (pendiente) que alimenta al subagente IA.
3. **Nada se borra**: V1, SchematicEditor y modelo degenerado quedan en git como referencia histórica.
4. **Este plan es la base de gate**: ninguna refactorización de labs sin pasar por este documento + `CMSC_SIGNAL_MAP_v1.md` (regla del masterplan).

---

*Documento de diseño. Sin implementación. HEAD de referencia: `18b95b1` (feature/ubtn-biological-telemetry, 2026-09-27).*