# SIGCTiArural · CMSC — F3C v1 Blueprint de Alistamiento para el Primer Slice de Implementación

| Campo | Valor |
|---|---|
| Estado del documento | **DISEÑO v1 · Alistamiento de implementación controlada** — cero código |
| Fase | Primer slice implementable **F3C v1** del roadmap CMSC (F3C→F3D→F3E→F4) |
| Fecha | 2026-09-29 |
| Rama | `feature/ubtn-biological-telemetry` (HEAD `18b95b1`, sin commits) |
| Modo | SOLO DISEÑAR Y DOCUMENTAR — NO implementar, NO modificar código, NO commits, NO refactorizar |
| Documentos base | `CMSC_IMPLEMENTATION_READINESS_REVIEW_v1` (veredicto SÍ condicionado · slice F3C v1) · `CMSC_F3C_DASHBOARD_CONSTRUCTION_STRATEGY_v1` (Q1-Q14 · roadmap · gates) · `CMSC_F3A_INTERCONNECTION_BLUEPRINT_v1` (puertos P-* · R1-R3 · G-01..G-06) · `CMSC_F3B_SIGNAL_PRODUCERS_ECOSYSTEM_v1` (Signal Registry §11 · ECS · 5 pasos · G-01..G-08) · `CMSC_F3E_KNOWLEDGE_INTEGRATION_STRATEGY_v1` (docsBySignal · zero-write · G-F3E) · `CMSC_UI_ARCHITECTURE_v1` · `CMSC_SIGNAL_MAP_v1` (S01..S80) · `FRONTEND_EXECUTION_STRATEGY` (5173/5174) |
| Pregunta única de la misión | ¿Cuál es el slice de implementación más pequeño y seguro que inicia el CMSC sin poner en riesgo a SIGCTiArural? |
| Regla del slice | MÁXIMO VALOR · MÍNIMO RIESGO · CERO ESCRITURA · CERO SUSTITUCIÓN · MISIÓN EXPLÍCITA |
| Veredicto previo | READINESS_REVIEW §14: SÍ, condicionado — primer slice recomendado = F3C v1 |
| Veredicto de este blueprint | F3C v1 es el primer slice seguro **si y solo si** se cumplen las 6 condiciones bloqueantes (§5) y se respeta la lista EXCLUIDO (§3) |

---

## 0. Contexto canónico (heredado, sin re-abrir)

- El ciclo de diseño F3A→F4 está **cerrado y estable** (READINESS_REVIEW: COMPLETED · veredicto SÍ condicionado; PHILOSOPHY_EVOLUTION: COMPLETED · totalmente compatible). Este blueprint **no revisa conceptos**: convierte las conclusiones aprobadas en un slice de implementación operable.
- Verificación en disco (2026-09-29): `App.jsx` con 15 rutas de contenido (`/dashboard`, `/labs`, `/ai-predictive`, `/data-science`, `/hardware-catalog`, `/hardware/:id`, `/proyectos`, `/labs/robotics`, `/advanced-math`, `/advanced-math-v2`, `/lab-embedded`, `/lab-telecom`, `/lab-electronics`, `/knowledge`, `/knowledge/doc/:docId`); `useLabStore` con claves congeladas y `bridgeStatus` huérfano; registry `knowledgeRegistry.generated.json` con **51 docs** en 6 categorías (project-core 7 · eiarc-architecture 13 · eiarc-foundation 3 · research-v2 18 · knowledge-base 6 · historical 4); `cloud.js` con `fetchClusterNodesReal` (BBB fabricado) y `fetchTelemetrySeriesReal` (Open-Meteo); `useRoboticsApi.js:3` con `API_BASE_URL = http://localhost:8000/api` (ROTO; backend real 8010); sin `.env` en `src/frontend`.
- 3 señales reales verificadas: S30 mic Telecom (`REAL-LOCAL`) · S10/S11 SensorReading V3 (`REAL`, sin consumidor en 5174) · S03 clima Open-Meteo (`REAL-LOCAL`, etiquetada clima-externo). El resto es `SIM`, `DISENO` o `HUERFANO`.
- Gates documentales aún por aprobar por Bernardo: F3A G-01..G-06 y F3B G-01..G-08 (condiciones §5.1). El canon de estados (C5) y la terminología "clase" (C6) requieren apéndice único (§5.3).

---

## 1. Alcance exacto de F3C v1

F3C v1 es **el nacimiento del Dashboard CMSC como envoltura aditiva y reversible**. Alcance textual:

1. **Ruta nueva** `/dashboard-cmsc` (aditiva): import del componente envoltura `CmscDashboard` + una `<Route>` nueva en `App.jsx`. Las otras 15 rutas quedan intactas.
2. **Layout huésped** `CmscDashboard` (nuevo, por composición): `TopNav` existente + cinta del río + contenido de la vista + panel lateral de evidencia + `VoiceAssistant` existente. Reglas F3C-1/2/3 (envoltura pura; invitado, no rey; capas de organización jamás calculan ciencia).
3. **Cinta del río científico**: 8 eslabones canónicos `Sensores › Telemetría › Matemáticas › Señales › IA › Knowledge Hub › Agentes › Usuario`; cada eslabón clicable, con mini-badge agregado de honestidad. Un eslabón sin vista viva se muestra como `DISEÑO`/enlace pendiente, jamás "vivo".
4. **Panel señales vivas**: las **3 señales reales** conectadas por adaptadores de lectura — P-BE-01 (S10/S11), P-WEATHER-01 (S03 clima re-etiquetada) y P-LAB-02 (S30 mic en vivo cuando la vista esté activa).
5. **Termómetro de honestidad**: contadores agregados `real · real-local · sim · ref · diseño · roto · huérfano`, derivados **solo** del catálogo S01..S80 y de los estados de las señales vivas; cada cuenta actúa como filtro de la misma vista.
6. **Badges junto a valor**: todo valor numérico de señal lleva estado + `confidence` (requiere canon único, §5.3).
7. **Catálogo de señales S01..S80** en modo lectura (vista-catálogo derivada del SIGNAL_MAP, tipo lector).
8. **`signalRegistry` declarativo**: rama nueva de `useLabStore` (poblada por lectura del mapa, sin tocar claves existentes).
9. **`docsBySignal` v1**: selector de lectura registry ± mapa que muestra los 51 docs actuales (sin regeneración).
10. **Puertas de laboratorios**: enlaces a las rutas de labs existentes (ningún motor nuevo).
11. **404 honrado** para rutas `/cmsc/*` desconocidas y `ErrorBoundary` que envuelve el huésped.

Lema del slice: **nace envolviendo y leyendo; no escribe, no sustituye, no se propaga más allá de su lista de archivos (§10).**

---

## 2. INCLUIDO en F3C v1

| # | Pieza del slice | Naturaleza | Ancla canónica |
|---|---|---|---|
| 1 | Ruta `/dashboard-cmsc` (aditiva) | 1 import + 1 Route | F3C §2.2 |
| 2 | Layout huésped `CmscDashboard` | Envoltura de composición | F3C §2.3 · UI_ARCH §5 |
| 3 | Cinta del río de 8 eslabones | Capa de organización visual | F3C §6 · UI_ARCH §1.2 |
| 4 | Panel señales vivas (3 reales) | Lectura por puertos | F3A §10 · F3C §4 |
| 5 | Termómetro de honestidad | Capa visual derivada del mapa | F3C §10.2 · F3C §5.2 |
| 6 | Badges de honestidad + confidence | Componente visual junto a valor | F3C §10.1 · F3D §6 |
| 7 | Catálogo S01..S80 (vista lectora) | Vista tipo lector del SIGNAL_MAP | F3C §12 (adaptador mapa) · F3D N1/N2 |
| 8 | `signalRegistry` declarativo | Rama nueva de `useLabStore` | F3B §11 · F3C §12 F3C:312 |
| 9 | `docsBySignal` v1 | Selector de lectura registry ± mapa | F3E §5 · F3B §7/§12 |
| 10 | Puertas de laboratorios | Enlaces a rutas existentes | F3C §4 · F3C §13 |
| 11 | Panel lateral de evidencia | Tarjetas de contexto por señal | F3C §5.2 · F3E §5 |
| 12 | 404 honrado + ErrorBoundary | Guardarraíles del huésped | F3C §13 · F3C Q1 |
| 13 | Saneo de honestidad R1-R3 en UI | Re-etiquetas de clima/BBB/robot | F3A §12 · F3A G-04 |

Regla de inclusión: **todo lo incluido es nuevo (aditivo) o de lectura; nada modifica el comportamiento de lo existente.**

---

## 3. EXCLUIDO de F3C v1 (límites duros del slice)

| # | Excluido | Razón canónica | Se implementa en |
|---|---|---|---|
| 1 | Lab Análisis Espectral (`/cmsc/espectral`, FFT/STFT/Wavelets/Bioacústica) | Fase 2 estratégica, NO del primer slice | Misión futura (hackathon) |
| 2 | Vistas `/cmsc/matematica`, `/cmsc/ia`, `/cmsc/knowledge` | F3C roadmap las asigna a F3E | F3E |
| 3 | Vista `/cmsc/acp` (siquiera inerte) | F4 define la superficie | F4/F3E |
| 4 | Motor del ACP, slot intérprete, sub-agentes | F4 + F3E | F4A..F4D |
| 5 | Evidence Ledger con escritura | F3E; el slice es solo lectura | F3E-1 |
| 6 | Regeneración del registry KH | F3E-Q7/Q12 con procedimiento (V1) | F3E-2 |
| 7 | Escritura ad-hoc a `knowledgeRegistry.generated.json` | Regla F3E §4: jamás por un lab/vista | nunca |
| 8 | Saneo operativo del host robot (`useRoboticsApi`) | Decisión backend/robótica fuera del alcance CMSC | fuera del slice (v1 lo etiqueta ROTO) |
| 9 | Decisión benchmark M1 vs M2 | Gate G1 PENDIENTE; se muestra como dato de gobernanza | gobernanza |
| 10 | Modificar `/labs`, `LabCatalog`, ruteMap de voz | Regla RI4 · F3C §2/§3 | nunca |
| 11 | Cualquier cambio a las otras 15 rutas y a los 16 componentes restantes | Aditividad pura | nunca en este slice |
| 12 | Frontend legacy Docker 5173 · backend · Docker · BBB · SensorReading/RobotTelemetry · IA · KH | Regla suprema del AGENTS | nunca |
| 13 | Búsqueda/RAG/grafo de conocimiento | Marcadas DISEÑO | F3E-4 |
| 14 | Segunda instancia de ningún lab dentro de `/cmsc/*` | F3C §7.2 (puente de enlace, no duplicado) | nunca |

Regla de exclusión: **todo lo que no está en §2 está fuera del slice.** Si una implementación futura requiere algo excepcional, se detiene y se pide misión nueva; no se expande el slice sobre la marcha (guarda RS1, §13).

---

## 4. Dependencias requeridas

### 4.1 Dependencias documentales (previas y verificables)

| Dependencia | Estado hoy | Forma de cierre |
|---|---|---|
| Gates F3A (G-01..G-06) aprobados | abiertos | aprobación de Bernardo sobre F3A |
| Gates F3B (G-01..G-08) aprobados | abiertos | aprobación de Bernardo sobre F3B |
| Canon único de estados de honestidad (C5) | 6+REF vs 7 sin unificar | apéndice único antes de badges/termómetro |
| Terminología "clase" (C6: 8 orígenes vs 12 dominios) | colisión léxica | tabla cruzada explícita (F3B G-02) |
| Proceso de regeneración del registry (V1) | conceptual | definición operativa (requisito de F3E, no del slice) |
| `SIGNAL_MAP` como fuente del catálogo S01..S80 | listo | lectura directa |

### 4.2 Dependencias de frontend (existentes, verificadas en disco)

| Dependencia | Evidencia |
|---|---|
| `react-router-dom` (Router/Routes/Route) | `App.jsx` |
| `TopNav.jsx` · `VoiceAssistant.jsx` | `components/` (composición, sin tocar) |
| `TelemetryPanel.jsx` · `GlobalChart.jsx` · `ClusterCard.jsx` | `components/` |
| `KnowledgeHubLayout.jsx` · `MarkdownDocumentView.jsx` · `docLoader.js` · `markdownRenderUtils.js` | `knowledge-hub/` |
| `useLabStore.js` (mochila federada) | `stores/` |
| `ErrorBoundary.jsx` | `components/` |
| `knowledgeRegistry.generated.json` (51 docs, 6 categorías) | `knowledge-hub/registry/` |
| `services/cloud.js` (`fetchTelemetrySeriesReal` · `fetchClusterNodesReal`) | `services/` |
| `labs/TelecomLab.jsx` (`AnalyserNode` fftSize=2048, S30) | `labs/` |

### 4.3 Dependencias de servicio y entorno

| Dependencia | Puerto/entidad | Uso en el slice |
|---|---|---|
| Backend FastAPI up (SensorReading V3) | 8010 | lectura por P-BE-01 (existe; no se toca) |
| Servicio `ai_service` | 8081 | NO requerido en F3C v1 |
| Vite Dev Server | 5174 (estricto) | única superficie de desarrollo permitida |
| Frontend legacy Docker | 5173 | intocable (referencia) |
| Política `VITE_API_URL` | config | solo si se autoriza el adaptador robot (v1 por defecto lo muestra ROTO, sin config) |
| Navegador (micrófono) | `getUserMedia` | S30 en vivo dentro de la vista espectral-enlace (solo lectura) |

---

## 5. Condiciones bloqueantes antes del primer código

Orden estricto, heredado del READINESS_REVIEW §14 y re-verificado para este slice:

| # | Condición | Verificación | Bloqueo si no se cumple |
|---|---|---|---|
| 1 | Gates F3A (G-01..G-06) y F3B (G-01..G-08) **aprobados por Bernardo** | acta de aprobación sobre documentos | NO implementar |
| 2 | **Saneo de honestidad R1-R3** (clima→`clima-externo` · BBB→`SIM` · robot→`ROTO`/host) | re-etiquetas especificadas en el slice (§9) | NO presentar señal con etiqueta falsa |
| 3 | **Canon unificado** de estados y de "clase" (C5/C6) en apéndice único | apéndice aprobado | badgets/termómetro/ficha con enumerado ambiguo = NO |
| 4 | Proceso operativo de **regeneración del registry** (V1) definido | procedimiento (script/responsable/cadencia) | el slice NO regenera, pero exige el procedimiento para no heredar C7 |
| 5 | **Gate de decisión benchmark** (G1) fijado en el roadmap | posición acordada | el Dashboard muestra PENDIENTE como dato (no bloquea mostrar, sí promocionar) |
| 6 | **Misión explícita** por pieza (F3C implementación ordenada por Bernardo) | orden escrita | ninguna línea de código sin esta orden |

Condiciones adicionales propias del slice (aditivas a las 6):

| # | Condición | Alcance |
|---|---|---|
| 7 | Permiso de escritura **solo en 5174** y **solo en la lista de archivos §10** | prohibido tocar cualquier otro archivo |
| 8 | Snapshot documental estable previo al código | respaldo de los 16 docs + estado actualizado (base del rollback §14) |

Sin estas 8 condiciones cumplidas, F3C v1 **no debe iniciarse**; el valor del slice es condicional, no incondicional.

---

## 6. Requisitos del Signal Registry

Base canónica: F3B §11 (esquema declarativo) + F3C §12 (rama `signalRegistry` en `useLabStore`).

1. **Esquema por registro** (14 campos de F3B §11): `signal_id` (S01..S80 + nuevas), `name`, `producer_id`, `class` (8 orígenes), `domain` (12 dominios), `status` (canon honestidad), `origin`, `cadence`, `port` (P-*), `consumers`, `metadata_ref`, `confidence`, `docsBySignal`, `lifecycle`, `revision`.
2. **Materialización v1 = rama declarativa nueva** de `useLabStore`, poblada a partir del SIGNAL_MAP (estados honestos del mapa, sin fabricación). No se toca ninguna clave existente; `bridgeStatus` se congela y se etiqueta `HUERFANO` (no se borra).
3. **Modo lectura**: el slice no opera transiciones de Lifecycle; solo puebla y consulta.
4. **Entradas obligatorias v1**: S30 · S03 · S10/S11 · S50 (las 3 señales reales + la ROTO honesta) y el resto del catálogo S01..S80 con su estado del mapa.
5. **Reglas F3B**: no borrar (señal obsoleta → `HISTORICA` etiquetada); single source of truth; alta de señales nuevas solo por los 5 pasos F3B (identificar→clasificar→etiquetar→conectar→registrar).
6. **Confianza** (F3B §15): heredada y ortogonal a la honestidad; acompañada siempre de descriptor textual; `DISENO`/`ROTO`/`HUERFANO` reportan ausencia (sin número).
7. **Guardarraíl**: el registry es la única fuente de "de dónde viene la señal"; labs, catálogo, DOC y ACP lo consultan, jamás lo duplican.

---

## 7. Requisitos de `docsBySignal`

Base canónica: F3B §7/§12 · F3E §5 (puente Signal↔KH) · F3C §8.

1. **Definición**: `docsBySignal(signal_id)` = intersección por lectura entre registry KH (`documents[]` del `knowledgeRegistry.generated.json`) y el mapa de señales (S-IDs). **Única fuente; nunca se escriben punteros en ninguno de los dos lados** (F3E-3).
2. **v1 del slice**: lee los 51 docs actuales (6 categorías: project-core 7 · eiarc-architecture 13 · eiarc-foundation 3 · research-v2 18 · knowledge-base 6 · historical 4) y los cruza con señales vía `tags`/`category`/`canonical_path` y la tabla señal→documento derivada. **Sin regeneración del registry.**
3. **Presentación**: en la ficha de señal, bloque "Evidencia" con (a) docs asociados; en el visor KH, "Señales relacionadas" como vista derivada (no escrita).
4. **Límite honesto (C7/DF3)**: los docs de la serie CMSC aún no figuran en el registry generado; el slice muestra los 51 actuales y **no infla** resultados. La visibilidad de los docs CMSC llega con la regeneración gobernada (F3E), no antes.
5. **Regla F3E-6**: el KH muestra el estado del benchmark (aprobado/challenger/pendiente) como dato de gobernanza, no como resultado inflado.
6. **Zero-write**: el slice jamás escribe, crea ni reorganiza el registry ni el visor.

---

## 8. Requisitos del shell del Dashboard CMSC

Base canónica: F3C §2/§3/§6/§10 · UI_ARCH §5.

1. **Layout huésped por composición**: `CmscDashboard` recibe `TopNav` y `VoiceAssistant` existentes mediante composición; no los modifica (Regla F3C-1).
2. **Estructura**: `TopNav · cinta del río · contenido · panel lateral de evidencia · VoiceAssistant`.
3. **Cinta del río**: 8 eslabones clicables; mini-badge agregado de honestidad por eslabón; **un eslabón cuya señal es `DISENO` jamás se muestra vivo** (Regla F3C-4).
4. **Termómetro y badges comparten una única leyenda** en el layout huésped (§10.3 F3C).
5. **Conjabilidad de rutas**: `/cmsc/*` solo existe dentro del espacio CMSC; no intercepta `/lab-*`, `/advanced-math*`, `/knowledge*` (F3C §7.3).
6. **404 honrado** para rutas `/cmsc/*` desconocidas (patrón actual de `App.jsx`), nunca redirección por defecto a `/dashboard`.
7. **ErrorBoundary** envuelve el huésped (guarda de errores de todo el host).
8. **Retrocompatibilidad del ruteMap de voz**: las claves actuales quedan intactas; la extensión CMSC es aditiva y futura (no se toca en v1).
9. **`/dashboard-cmsc` es invitado, no rey**: su ausencia jamás rompe `/labs` ni las demás rutas (F3C-2).
10. **Cero estado compartido nuevo persistente**: la selección de señal vive en memoria local de la vista; no se ensucia `useLabStore` más allá de la rama declarativa `signalRegistry`.

---

## 9. Adaptadores requeridos

Base canónica: F3A §10 (contrato P-*) · F3C §12 (7 adaptadores mínimos). F3C v1 materializa el subconjunto de lectura que conecta lo real y sane lo roto:

| Puerto | Origen | Qué lee | Salida del adaptador (v1) |
|---|---|---|---|
| P-BE-01 | Backend 8010 · `SensorReading` | temp/humedad V3 (S10/S11) | serie `REAL` con badge + confidence + timestamp; si no responde `ROTO`/`DISENO` jamás fabrica |
| P-WEATHER-01 | `cloud.js fetchTelemetrySeriesReal` | Open-Meteo (S03) | serie `REAL-LOCAL` **re-etiquetada `clima-externo`** (sanea R1, NO telemetría rural) |
| P-LAB-02 | `TelecomLab AnalyserNode` | espectro S30 | serie acústica `REAL-LOCAL` + FFT disponible (solo cuando la vista esté activa) |
| P-KH-01 | `knowledgeRegistry.generated.json` | `docsBySignal(signalId)` | lista de `document.id` vinculados (ver §7) |
| Saneo R2 | `cloud.js fetchClusterNodesReal` | cluster BBB | salida etiquetada `SIM` (métricas fabricadas nunca como reales) |
| Saneo R3 | `useRoboticsApi` (host `localhost:8000`) | telemetría robot (S50) | envuelto como `ROTO` honesto en v1; la corrección de host queda fuera del slice |

Reglas del contrato (F3A §10): (1) cada puerto devuelve señal + estado + trazabilidad; (2) ningún puerto escribe en el store, que es solo lectura; (3) si el origen no responde → estado `ROTO`/`DISENO`, jamás fabrica. Los adaptadores **envuelven, no reescriben** (F3C-8).

Los puertos P-LAB-01 (electronicsData SIM), P-LAB-03 (robot real) y P-IA-01 (inferencia) **no entran en v1** — pertenecen a eslabones del río posteriores (ver EXCLUIDO §3).

---

## 10. Impacto en Frontend

### 10.1 Archivos NUEVOS (5174)

| Archivo | Contenido |
|---|---|
| `src/frontend/src/pages/CmscDashboard.jsx` | Shell envoltura (layout huésped): TopNav + cinta + contenido + side evidencia + VoiceAssistant |
| `src/frontend/src/pages/cmsc/` (nuevo) | Capas de organización visual tipo lector: cinta del río, termómetro, badges, catálogo S01..S80, ficha de señal, panel evidencia |
| `src/frontend/src/services/cmscAdapters.js` (nuevo) | Adaptadores de lectura P-BE-01 · P-WEATHER-01 · P-LAB-02 · P-KH-01 (envuelven, no reescriben) |
| `src/frontend/src/services/docsBySignal.js` (nuevo) | Selector de lectura registry ± mapa (única fuente) |
| registro declarativo `signalRegistry` en `useLabStore` | rama nueva (§6) |

### 10.2 Modificaciones MÍNIMAS (5174, aditivas)

| Archivo | Cambio aditivo |
|---|---|
| `src/frontend/src/App.jsx` | +1 import de `CmscDashboard` + 1 `<Route path="/dashboard-cmsc">` + 404 honrado ya cubierto por el patrón actual |
| `src/frontend/src/components/TopNav.jsx` | +1 item "CMSC Científico" apuntando a `/dashboard-cmsc` (aditivo a los 6 navItems) |
| `src/frontend/src/stores/useLabStore.js` | +rama declarativa `signalRegistry` (sin tocar claves existentes; `bridgeStatus` congelado) |

### 10.3 Arquitectura JAMÁS tocada

- Los 16 componentes restantes, las 15 rutas existentes, `/labs`, ruteMap de voz, registry KH, `knowledge-hub/`, `labs/`, `hooks/useRoboticsApi.js`, `DOM schema` del layout legacy (5173).
- Prohibición operativa: **implementar SOLO en `src/frontend/src` (5174)**; el frontend Docker 5173 es intocable (RI1).
- Riesgos RI1-RI7 (READINESS §10) con guarda: RI2 (aditividad del store) · RI3 (cero escritura al registry) · RI4 (rutas intactas) · RI5 (modelo degenerado etiquetado, no promocionado) · RI6 (M1/M2 no se tocan) · RI7 (robot `ROTO`, no REAL).

---

## 11. Impacto en Backend

**CERO.** El slice apenas envuelve y lee; no muta el mundo de servidores:

- No se modifica FastAPI (8010), `ai_service` (8081), PostgreSQL, Docker, BBB, `SensorReading`, `RobotTelemetry` ni scripts.
- P-BE-01 **lee el endpoint existente** de SensorReading V3 desde el navegador (mismo contrato que usan las vistas actuales); si el endpoint no está disponible, la UI muestra estado `ROTO`/`DISENO` honesto.
- Honestidad de integración: no se crean endpoints nuevos, no se toca CORS (verificarlo al implementar como lectura, no como cambio), no se persiste nada.
- La regla suprema del AGENTS (no tocar backend/Docker/Telemetry/BBB) queda intacta por diseño.

---

## 12. Impacto en el Knowledge Hub

**CERO escritura; solo una lectura adicional:**

- `knowledgeRegistry.generated.json` no se modifica (hash inmutable durante el slice).
- `docsBySignal` es un selector de lectura (§7); el KH "presenta" pero el CMSC solo cruza.
- No se crea Evidence Ledger, no hay hangar de autenticidad y no hay regeneración (todo es F3E).
- El Dashboard muestra los 51 docs actuales con sus 6 categorías como **dato del registro**, sin inflación ni duplicación (F3E-3 y F3E-6).
- Los docs de la serie CMSC se visibilizarán en la ficha de señal únicamente cuando el registry se regenere por gobernanza (F3E), nunca por hack de vista.

---

## 13. Evaluación de riesgos

### 13.1 Riesgos de la cadena F3A (R1-R10) gestionados por el slice

| ID | Riesgo | Severidad | Mitigación en F3C v1 | Residual |
|---|---|---|---|---|
| R1 | Clima presentado como telemetría rural | Alta | P-WEATHER-01 re-etiqueta `clima-externo` REAL-LOCAL (saneo en UI) | bajo |
| R2 | Cluster BBB fabricado como real | Alta | Saneo R2: etiqueta `SIM` visible | bajo |
| R3 | Host robot `localhost:8000` | Alta | v1 lo muestra `ROTO` honesto; corrección de host fuera del slice | bajo (no se finge) |
| R4 | SchematicEditor legado | Media | No se toca (ya tras toggle) | nulo (no aparece) |
| R5 | Duplicidad FFT Telecom ↔ MathV2 | Media | v1 solo envuelve S30 lectura; la capacidad transversal es posterior | bajo |
| R6 | `bridgeStatus` huérfano | Media | Congelado + etiquetado HUERFANO, no borrado | controlado |
| R7 | 5174 sin señales reales conectadas | Alta | El slice conecta 3 reales por puertos de lectura | resuelto en v1 (objetivo) |
| R8 | Escritura al KH sin delimitación | Media | Regla cero-escritura absoluta (§12); permisos del slice | nulo |
| R9 | Demo IA leída como oficial | Media | No entra en v1 (solo lectura de datos existentes) | nulo |
| R10 | Fractura del store | Baja | Aditividad estricta: rama nueva, una clave sin tocar | controlado |

### 13.2 Riesgos específicos del slice

| ID | Riesgo | Guarda |
|---|---|---|
| RS1 | Expansión del alcance sobre la marcha (scope creep) | Lista EXCLUIDO §3 es dura; cualquier añadido pide misión nueva |
| RS2 | Badges/termómetro con canon sin unificar (C5) | Bloqueo hasta apéndice de canon (§5.3) |
| RS3 | Ejecutar el desarrollo en 5173 por error de puerto | Implementación SOLO en 5174; 5173 intocable (RI1) |
| RS4 | La cinta muestra un eslabón "vivo" sin señal real | Regla F3C-4: eslabón DISENO nunca se pinta vivo |
| RS5 | `docsBySignal` induce a escribir relationes en el registry | Regla F3E-3: vista derivada; cero punteros escritos |

Residual total del slice: **bajo**, con condición de que rijan las 8 condiciones §5 y las reglas de exclusión §3.

---

## 14. Estrategia de rollback

El slice es **aditivo puro**, por lo que la reversibilidad es estructural (no requiere migración):

1. **Reversión básica**: eliminar `CmscDashboard.jsx` + capas `pages/cmsc/` + `cmscAdapters.js` + `docsBySignal.js`; revertir las 3 modificaciones aditivas de `App.jsx`, `TopNav.jsx` y `useLabStore.js` (quitar rama `signalRegistry`). El árbol queda idéntico al anterior: no existe lógica restante.
2. **Cero migración de datos**: el slice no escribe, no persiste y no altera claves existentes; no hay datos que migrar ni back-out de esquema.
3. **Blanco de reversión del registry**: propositivamente cero — el registro queda exactamente igual; verificable por hash del archivo.
4. **Puntos de restauración**: HEAD `18b95b1` (cadena de commits vigente) · `stash@{0}` `PRE_MULTI_AGENT_2026_09_29` (respaldo temporal de seguridad arquitectónica, conservado por decisión de Bernardo) · snapshot documental estable (condición §5.8).
5. **Prueba de reversibilidad (gate de aceptación)**: al implementar, un `git status` tras revertir las modificaciones debe mostrar solo los archivos NUEVOS sin rastro en lo existente; smoke test de las 15 rutas y `/labs` en 5174 antes y después.
6. **Nunca** se revierte sobre datos: la regla NADA DESAPARECE aplica igual en el back-out — revertir el slice no borra componente, señal ni doc existentes.

El rollback del slice es, en la práctica, **retirar una envoltura**: cero coste de ruptura, cero deuda estructural.

---

## 15. Criterios de éxito (acceptance del slice)

| # | Criterio | Verificación |
|---|---|---|
| 1 | `/dashboard-cmsc` responde y las 15 rutas existentes siguen intactas | smoke en 5174 + revisión de `App.jsx` |
| 2 | 404 honrado para `/cmsc/desconocida` (sin caer a `/dashboard`) | navegación manual |
| 3 | Termómetro de honestidad derivado solo del mapa: reales = 3 (S30 `REAL-LOCAL` · S10/S11 `REAL` · S03 `clima-externo` `REAL-LOCAL`); cluster BBB `SIM`; robot `ROTO` | contadores vs SIGNAL_MAP |
| 4 | Todo valor numérico de señal lleva badge + confidence; nunca solo el número | inspección del shell |
| 5 | Clima no se muestra como telemetría rural (R1 sanado); BBB no como real (R2) | revisión P-WEATHER-01/P-LAB-02 |
| 6 | Catálogo S01..S80 muestra los estados honestos del mapa, sin inventar | contraste catálogo vs SIGNAL_MAP |
| 7 | `docsBySignal` devuelve los 51 docs actuales correctamente cruzados | conteo + muestreo por categoría |
| 8 | `signalRegistry` declarativo sin tocar ninguna clave existente de `useLabStore` | diff de `stores/useLabStore.js` |
| 9 | Cero escritura: hash del `knowledgeRegistry.generated.json` idéntico · backend sin cambios · sin commits · HEAD `18b95b1` intacto | hash + `git status` + `git log` |
| 10 | E2E de la primera señal (gate G2 en su versión de lectura): S10 → cinta → termómetro → badge → ficha → `docsBySignal` | recorrido manual en 5174 |
| 11 | Regla suprema: nada desaparece, todo se preserva, todo se conecta | las 15 rutas y los 16 componentes siguen en pie |
| 12 | 5173 (legacy) no presenta ningún cambio | diff excluye 5173 |

Un criterio fallido = el slice se considera incompleto y se corrige antes de considerar cerrada la misión F3C v1.

---

## 16. Respuesta a la pregunta final

> Si la implementación empieza mañana, ¿cuál es el slice más seguro que aporta valor y preserva todos los invariantes arquitectónicos?

**F3C v1, exactamente como este blueprint lo delimita**: el nacimiento del Dashboard CMSC como envoltura aditiva y reversible — con la cinta del río, las 3 señales reales conectadas por lectura (S30 · S10/S11 · clima `clima-externo`), termómetro de honestidad, badges junto a valor, catálogo S01..S80, `signalRegistry` declarativo y `docsBySignal` de lectura — **cero escritura al KH, cero backend, cero sustituciones, cero fases nuevas, una sola ruta nueva en `App.jsx` (5174)**.

Por qué es el más seguro:
1. **Aditivo puro**: 1 import + 1 ruta + envoltura + lectores; el rollback es retirar una envoltura (§14).
2. **Valor inmediato y honesto**: el usuario ve por primera vez el ecosistema como red con estado real declarado (3 señales reales, el resto etiquetado) sin fabricar nada.
3. **Invariantes preservados**: NADA DESAPARECE (nada se borra ni se sustituye); honestidad de estado (todo valor con badge, canon doble corregido en UI); fuente única (registry/`docsBySignal` por lectura); rangos de pureza (solo se implementa en 5174 y en los archivos §10).
4. **Sin propagación**: no habilita fases subsecuentes por sí mismo; F3D/F3E/F4 requieren órdenes nuevas (condición 6, §5).
5. **Condicionado, no incondicional**: no inicia sin las 8 condiciones §5 (gates F3A/F3B, saneo R1-R3, canon C5/C6, regeneración definida, gate benchmark, misión explícita, permiso de archivos, snapshot).

Síntesis: **el slice más pequeño, completo y seguro es la envoltura que convierte el ecosistema existente en mapa científico legible, con las 3 señales reales conectadas y toda honestidad declarada — sin escribir ni sustituir una sola pieza.**

---

## 17. Honestidad final y próximo paso

- **Lo que este blueprint NO hace:** implementa, modifica código, crea rutas, toca backend/IA/Telemetry/BBB/Labs/KH o emite decisiones de gobernanza (benchmark, reprobación de gates). Es DISEÑO v1 de alistamiento.
- **Estado real del slice hoy (2026-09-29):** los 16 docs de Arquitectura están untracked en el repositorio (working tree), con respaldo en `stash@{0}`; HEAD `18b95b1`; **sin commits realizados**. Todo lo anterior es la base de la condición §5.8 (snapshot estable).
- **Secuencia operativa hacia el código:** (1) aprobar gates F3A/F3B; (2) apéndice de canon (C5/C6); (3) definir regeneración (V1) y gate benchmark (G1); (4) misión explícita de implementación F3C v1 del slice §2; (5) ejecutar solo en 5174 y en los archivos §10; (6) validar acceptance §15; (7) cerrar según las reglas vigentes (commits solo con orden explícita).
- **Regla suprema preservada:** nada desaparece, todo se preserva, todo se conecta y todo evoluciona — el primer código CMSC será la envoltura de algo que ya existe, jamás el reemplazo de algo que funciona.

*Documento de DISEÑO v1 — alistamiento del primer slice F3C v1. Sin código, sin commits, sin cambios de fases. Vigente la regla suprema: NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.*