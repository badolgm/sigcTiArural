# SIGCTIARURAL_U1_GO_NO_GO — Auditoría Final del Gate U1

> **Familia:** Refactorización Global · **Gate:** U0.5 → **U1**
> **Estado:** `referencia` (auditoría final — solo lectura de los 9 documentos autorizados)
> **Fecha:** 14 de septiembre 2026 · **Rama:** `feature/ubtn-biological-telemetry`
> **Nota de nomenclatura:** la misión solicitó `SIGCTIARUAL_U1_GO_NO_GO.md`; se respeta la
> convención de la familia (`SIGCTIARURAL_*`) ya establecida en `PLAN_MAESTRO`/`MASTERDOC`/`SYSTEM_BOOT`.

---

## ⚠️ VEREDICTO

# **NO GO**

para "empezar a tocar React" en el sentido amplio (modificar/reorganizar componentes existentes,
en particular el Dashboard).

**La razón NO es calidad de diseño — el diseño es coherente y completo.**
La razón es **gobernanza y decisiones pendientes**, que el propio canon exige antes de tocar código:

1. `DASHBOARD_REIMAGINED_V2` §11 condiciona la implementación de U1 a **"previa Fases 7-8 del
   PLAN_MAESTRO"**; `PLAN_MAESTRO` v8.5 declara hoy **Fase 7 en Progreso + Fase 8 en Preparación**.
   Esa precondición **no está cumplida**.
2. La misión anterior ya dejó **5 decisiones del dueño pendientes** que los documento declaran
   bloqueantes del gate U1 (no del diseño): **D-A, D-B, D-C, D-A-7 y D-D**.
3. Quedan **2 hallazgos nuevos sin resolver** detectados en esta auditoría (R-13 y R-14),
   uno de ellos con riesgo de regresión real (GR-12).

Esto no es "nunca tocar React": es **el estado del gate HOY**. El momento en que se cierren
(a) decisión del dueño sobre Fases 7-8/gate U1, (b) D-A/D-B/D-C/D-A-7/D-D y (c) R-13,
el veredicto pasa a **GO** para las fases aditivas.

---

## 1. Respuesta a la pregunta 1 — ¿La Dashboard Ganadora preserva TODO lo existente?

**Sí, en el papel. La cobertura es total en los 4 documentos que la definen**
(`DASHBOARD_REIMAGINED_V2` §10/§10.1/§10.2, `PRESERVATION_STRATEGY` §3, `PAGE_MAPPING` §1 y
`COMPONENT_MIGRATION_MATRIX` §2), con matices que se detallan abajo.

### Qué se preserva (lista exacta)

| Grupo | Contenido preservado | Fuente |
|---|---|---|
| **BBB-01/02/03** | Rol, ID, tarjeta, datos/fallback, dot de estado TopNav, acceso a telemetría V3; visibles en **Operación** y como entradas `referencia` del catálogo | V2 §10/§10.1/§10.2; HW-Plan §2.2 |
| **Telemetría** | `TelemetryPanel`, `GlobalChart`, `Telemetry3DScene`, gráfica V3, fallback; contrato `{context:'telemetry', items[]}` intacto (V1/V2/V3) | V2 §10; PRESERVACIÓN §3.2/§3.3 |
| **IA Predictiva** | Ruta `/ai-predictive` + función | V2 §10.2 |
| **Laboratorios canónicos + STEM** | Agricultura, Electrónica, Robótica, Telecomunicaciones, AdvancedMath V1/V2, DataScience, Embedded, SchematicEditor/Falstad, Robotics — todos con ruta y categoría `lab-data.js` | LAB-STRATEGY §2/§3 |
| **Knowledge Hub** | `/knowledge`, `/knowledge/doc/:docId`, 51 docs operativos, registro generado, renderer | V2 §5/§10.2; GR-05 |
| **Tiles Integraciones Futuras (5)** | RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV → entradas del catálogo con identidad/ícono/rol/**enlaces externos intactos** | V2 §10; HW-Plan §3 |
| **VoiceAssistant + routeMap** | 12 comandos vigentes; solo se amplía (nunca se reduce) | V2 §10.2; PRESERVACIÓN §3.4 |
| **Auth latente** | Login, Register, Admin2FA, AuthContext, AuthGuard, LoginModal — preservados, sin rutear (D-A) | V2 §10.2; PRESERVACIÓN §3.5.1 |
| **Legado** | `_deprecated/*` (5), banner `SYSTEM ONLINE` (hasta decisión D-B), docs históricos | PRESERVACIÓN §3.6 |
| **Rutas** | 14 congeladas + `/` ya existente; 404 → `/dashboard` | ROUTE_EVOLUTION §1 |
| **Backend/dominio (inviolable por Misión)** | `SensorReading`, `Telemetry` (V1-V3), `RobotTelemetry`, `EventBus`/`wiring.py`, `laboratorio_factory.py`, `agricultura.py`, contexts `labs/telemetry/ai/shared_kernel` | PRESERVACIÓN §3.2/§3.3; GR-01..05 |

### Qué PODRÍA perderse (riesgos abiertos reales, no teóricos)

| # | Riesgo | Dónde | Estado |
|---|---|---|---|
| R-01 | `initialNodes` BBB duplicado en `Dashboard.jsx` + `TopNav.jsx`; reorganizar puede romper el estado de clúster | Fase 3 | **Mitigado-solo-en-diseño** (consolidar en módulo de datos del catálogo); requiere snapshot + regresión |
| R-03 | `public/vendor/circuitjs1/**` y puerto/adapters (NO TOCAR) se desincronizan si algo los toca | Electrónica | NO TOCAR activo; riesgo si alguien lo ignora |
| R-04 | V3/env si se reescribe el frontend sin respetar el contrato | Telemetría | Contrato documentado |
| **R-13 (NUEVO)** | **`Telemetry3DScene` tiene uso dual: Robótica la usa hoy Y el mapa la realoja a la sección Telemetría.** La propia matriz lo reconoce con "…o Robotics que ya lo use" sin resolver la decisión. Si se mueve una sola instancia: **regresión GR-12 en Robótica**. | Fase 3 | **SIN DECISIÓN — riesgo de regresión real** |
| R-06 | `useRoboticsApi`/`RobotTelemetry` tocados por integración de telemetría | IA/Robótica | Prohibido (GR-05/Preservación) |
| R-12 | Mover tiles → catálogo si `Dashboard.jsx` se toca antes de copiar (no mover) sus datos | Fase 3 | Mitigado en plan (copia) |

### Qué DEBE corregirse antes de un GO global

1. **R-13 (nuevo):** decidir el destino de `Telemetry3DScene` — recomendación: **instanciación aditiva** (reusar el mismo componente en ambas vistas; NO mover la importación de Robótica). Registrarlo en la matriz y en `LAB_PRESERVATION_STRATEGY` Área 5 antes de U1.3.
2. **GR-07 vs BBB visibles:** el guardarraíl exige que BBB no sean "tarjetas de primera clase"; el diseño las deja en **Operación subordinada** + catálogo `referencia`. Es coherente con la intención, pero **debe interpretarse por escrito** (ADR breve) para que el revisor de wireframes no bloquee el diseño final.
3. **Consolidación de fuente BBB (R-01):** aprobar el plan de "una sola fuente de datos" ANTES de U1.3.
4. **D-D (fuente de `catalog-data.js`):** sin esta decisión, el primer componente del catálogo no tiene especificación de origen.

---

## 2. Respuesta a la pregunta 2 — Componentes React que sobreviven (PRESERVAR)

Lista exacta desde `COMPONENT_MIGRATION_MATRIX` §2 (44 archivos catastrados; todos sobreviven):

- **Núcleo:** `main.jsx`, `vite.config.js`, `tailwind.config.js`.
- **Páginas:** `AIPredictiva.jsx`, `DataScienceLab.jsx`, `Login.jsx`, `Register.jsx`, `Admin2FA.jsx` (auth latente).
- **Laboratorios:** `RoboticsLab.jsx`, `EmbeddedLab.jsx`, `TelecomLab.jsx`, `ElectronicsLab.jsx`,
  `SchematicEditor.jsx`, `electronics/FalstadPanel.jsx`, `AdvancedMathLab.jsx`,
  `AdvancedMathLabV2.jsx`, `labs/mathHelpers.js`, `labs/math-resources/README.md`.
- **Componentes:** `ClusterCard.jsx`, `GlobalChart.jsx`, `TelemetryPanel.jsx`,
  `Telemetry3DScene.jsx`, `LoginModal.jsx`, `AuthGuard.jsx`, `ErrorBoundary.jsx`.
- **Hooks/stores/servicios/datos/auth:** `hooks/useRoboticsApi.js`, `stores/useLabStore.js`,
  `services/cloud.js`, `data/lab-data.js`, `data/ADDING_LABS.md`, `auth/AuthContext.jsx`.
- **Knowledge Hub:** `knowledge-hub/services/docLoader.js`,
  `knowledge-hub/services/markdownRenderUtils.js`,
  `knowledge-hub/pages/KnowledgeHubLayout.jsx`,
  `knowledge-hub/components/MarkdownDocumentView.jsx`.
- **Legado (no se borran):** `pages/_deprecated/Docs*.jsx` (5) → clasificación `DEPRECAR`.
- **Nota:** `VoiceAssistant.jsx` se conserva intacto como componente; lo que se amplía es su mapa
  de comandos (vive en `App.jsx`). **Ninguno de los 44 se borra.**

---

## 3. Respuesta a la pregunta 3 — Componentes que deben ampliarse (AMPLIAR)

Lista exacta (cambios **aditivos**; jamás se quita nada):

| Componente | Qué se le añade | Fase |
|---|---|---|
| `App.jsx` | Rutas `/hardware-catalog` y `/proyectos`; ampliación `routeMap` (voz); feature-flag sombra | U1.1/U1.2 |
| `TopNav.jsx` | Items `Hardware` y `Proyectos` (dot de clúster intacto, sin reordenar) | U1.2 |
| `Dashboard.jsx` | Reorganización interna aditiva → secciones **Operación + Telemetría** (preserva `initialNodes`, `defaultChartData`, endpoints V3+fallback, `onRequireAuth`) | U1.3 |
| `index.css` | Clases aditivas (neón actual intacto) | U1.1+ |
| `knowledge-hub/registry/knowledgeRegistry.generated.json` | Ampliación aditiva (schema bn/json compatible); generador preservado | U1.4 |

---

## 4. Respuesta a la pregunta 4 — Componentes que NO deben tocarse (NO TOCAR)

Lista exacta + justificación:

| Archivo | Por qué |
|---|---|
| `src/frontend/public/vendor/circuitjs1/**` | Falstad **vendored** del que depende `FalstadPanel` (iframe); GR-07/R-03 |
| `src/frontend/src/labs/electronics/ports/circuitSimulationPort.js` | Puerto hexagonal del simulador; NO TOCAR |
| `src/frontend/src/labs/electronics/adapters/falstadAdapter.js` | Adapter hexagonal; NO TOCAR |
| `src/frontend/src/labs/electronics/adapters/legacySchematicEditorAdapter.js` | Adapter hexagonal (legacy via port); NO TOCAR |
| (Backend — inviolable por Misión, no en matriz) `SensorReading`, Telemetry V1-V3 (`api/views.py`), `RobotTelemetry`, `EventBus`/`wiring.py`, `laboratorio_factory.py`, `agricultura.py`, `scripts/generate_knowledge_registry.py` | Prohibiciones explícitas de la Misión + GR-01..05/09 |

Justificación transversal: GR-01 (arquitectura hexagonal), GR-02/03 (DDD + SensorReading),
GR-04 (4 labs canónicos), GR-09 (contratos), GR-12 (no-regresión). Y por regla suprema:
**mantener intactos** `lab-data.js`, `useLabStore.js`, `cloud.js`, `_deprecated/*`.

---

## 5. Respuesta a la pregunta 5 — PRIMER componente a construir en U1

**`/hardware-catalog` + módulo de datos `catalog-data.js`** (nuevo, 100% aditivo).

Justificación:
- Es **código nuevo**, no toca ningún archivo existente (salvo la edición aditiva del router en
  `App.jsx`, que es la más baja de riesgo posible: añadir una ruta).
- Es la **base que Fase 3 necesita** para realojar los tiles → catálogo (R-12), por lo que
  construirlo primero invierte la dependencia: no se toca `Dashboard.jsx` hasta que su contenido
  ya tenga casa.
- Ejercita el feature-flag/rollback y el plomaje de ruta con el menor frente de regresión (GR-12).
- **Requisito previo bloqueante:** resolución de **D-D** (¿fuente `catalog-data.js` en frontend o
  generada por backend?) + ADR + snapshot previo. Mientras D-D y el gate U1 (Fases 7-8) no estén
  resueltos, **nada se construye**.

---

## 6. Respuesta a la pregunta 6 — Orden óptimo de implementación

| Fase | Alcance | Precondición | Sin tocar código hasta |
|---|---|---|---|
| **U1.0** | Snapshot funcional + suite de regresión (14 rutas, 12 comandos voz, V3 telemetría) | Gate dueño sobre Fases 7-8 u override explícito | Autorización formal U1 |
| **U1.1** | `/hardware-catalog` + `catalog-data.js` (13 entradas) + página base con filtros (2a/2b) | **D-D** resuelta | — |
| **U1.2** | TopNav (items Hardware/Proyectos) + `routeMap` voz ampliado | U1.1 en QA | — |
| **U1.3** | Reorganización `/dashboard` (Operación + Telemetría) + realojo tiles → catálogo + breadcrumb cadena | **R-13** decidido, **D-B** (banner), snapshot confirmado (R-01/R-12) | — |
| **U1.4** | Ampliación índice Knowledge Hub (`knowledgeRegistry`) + breadcrumb de labs (`lab-data.js` intacto) | D-C (localizar generador) | — |
| **U1.5** | Persona selector (default General; Agricultor* gated) | **D-A** (auth) | — |
| **U1.6** | `/proyectos` (proyectos reales) | — | — |
| **U1.7** | UBTN vista conceptual + rutas auth | **D-A-7**, **D-A**, **D-C** | — |

Orden consistente con `ROUTE_EVOLUTION` (Fases 2/3/5/6), `HARDWARE_CATALOG` (2a/2b ⇒ 3 ⇒ 6) y la
sección §7 de `MIGRATION_AUDIT`. Las fases U1.1-U1.2 son las únicas **aditivas de bajo riesgo**; todo
lo demás está condicionado a las decisiones pendientes.

---

## 7. Respuesta a la pregunta 7 — Bloqueantes, riesgos, dependencias (del veredicto)

### Bloqueantes (por qué NO GO hoy)

1. **Gate formal no cumplido:** `DASHBOARD_REIMAGINED_V2` §11 + `PRESERVATION_STRATEGY` §8
   condicionan U1 a "previa Fases 7-8 del PLAN_MAESTRO"; `PLAN_MAESTRO` v8.5 registra Fase 7 en
   Progreso y Fase 8 en Preparación. El dueño debe: cerrar/aprobar esas fases **o** emitir un
   override explícito (ADR) de gate U1.
2. **Decisiones del dueño pendientes (heredadas de la misión anterior):**
   - **D-A** — política Auth (rutear login/register/admin-2fa, gate de persona, banner: ver D-B).
   - **D-B** — banner debug `SYSTEM ONLINE` (hasta entonces se preserva por regla suprema).
   - **D-C** — localizar el script generador de `knowledgeRegistry.generated.json`.
   - **D-A-7** — MVP UBTN (NTC/DS18B20 vs HR/RR MAX30102); bloquea U1.7.
   - **D-D** — fuente de `catalog-data.js`; **bloquea al PRIMER componente (U1.1)**.
3. **R-13 (nuevo):** uso dual de `Telemetry3DScene` (Robótica + Telemetría) sin decisión —
   riesgo de regresión GR-12.

### Riesgos (heredados + nuevos)

- Altos: R-01 (doble fuente BBB), R-02 (bifurcación si no se hace la Ganadora = `/dashboard` sin
  ruta paralela), R-03 (Falstad), R-04 (V3). Nuevos: **R-13** (dual-use 3D), **R-14** (nota).
- **R-14 (nuevo, nota no bloqueante):** `DASHBOARD_REIMAGINED_V2` §9 dice "únicas rutas nuevas
  propuestas: `/hardware-catalog` y `/proyectos`"; `ROUTE_EVOLUTION` añade candidatas sujetas a
  decisión (`/telemetry`, `/ubtn`, auth). No es contradicción si se leen como **propuestas vs
  contingentes**, pero conviene alinear la redacción de §9 para evitar doble lectura.
- GR-07: interpretación pendiente (BBB visibles como `referencia`, no como capacidad de primera
  clase) — resolver con ADR breve para evitar fricción en review.

### Dependencias pendientes

- Decisiones del dueño: D-A, D-B, D-C, D-A-7, D-D (todas de 1-2 líneas de respuesta).
- Técnicas: snapshot funcional previo a U1.3; suite de regresión en cada fase; ADR para R-13.

### Checklist final (para pasar de NO GO a GO)

- [ ] Dueño: cierra/acepta Fases 7-8 **o** emite override de gate U1 (ADR).
- [ ] Dueño: responde **D-A, D-B, D-C, D-A-7 y D-D**.
- [ ] Auditor: resuelve **R-13** (instanciación aditiva de `Telemetry3DScene`) y registra en matriz.
- [ ] Auditor: ADR breve GR-07 (BBB subordinados, no primera clase).
- [ ] Auditor: alinear redacción V2 §9 con `ROUTE_EVOLUTION` (R-14, nota editorial).
- [ ] Práctica: snapshot funcional + regresión baseline (U1.0) antes de cualquier cambio.
- [ ] Gobernanza: entrada en `SYSTEM_BOOT`/`MASTERDOC`/`PLAN_MAESTRO` del veredicto GO (bitácoras).

---

## 8. Referencias (solo los 9 documentos autorizados)

- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — §9/§10/§10.2/§11.
- [`SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md`](SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md) — §2/§3.
- [`SIGCTIARURAL_PAGE_MAPPING.md`](SIGCTIARURAL_PAGE_MAPPING.md) — §1/§4.
- [`SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN.md`](SIGCTIARURAL_HARDWARE_CATALOG_IMPLEMENTATION_PLAN.md) — §2/§3/§6.
- [`SIGCTIARURAL_ROUTE_EVOLUTION.md`](SIGCTIARURAL_ROUTE_EVOLUTION.md) — §1/§2.
- [`SIGCTIARURAL_LAB_PRESERVATION_STRATEGY.md`](SIGCTIARURAL_LAB_PRESERVATION_STRATEGY.md) — §2/§3.
- [`SIGCTIARURAL_MIGRATION_AUDIT.md`](SIGCTIARURAL_MIGRATION_AUDIT.md) — §2/§5/§6.
- [`SIGCTIARURAL_REFACTORING_GUARDRAILS.md`](SIGCTIARURAL_REFACTORING_GUARDRAILS.md) — GR-01..12.
- [`SIGCTIARURAL_PRESERVATION_STRATEGY.md`](SIGCTIARURAL_PRESERVATION_STRATEGY.md) — §3/§4/§5/§8.