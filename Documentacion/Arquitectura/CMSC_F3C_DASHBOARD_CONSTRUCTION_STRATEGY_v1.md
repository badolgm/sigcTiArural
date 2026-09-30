# SIGCTiArural · CMSC — F3C Estrategia de Construcción del Dashboard CMSC (Blueprint v1)

| Campo | Valor |
|---|---|
| Estado del documento | **DISEÑO v1 · Arquitectura de construcción** — sin implementación |
| Fase | **F3C (Construcción del Dashboard CMSC)** del roadmap CMSC (F3C→F3D→F3E→F4) |
| Fecha | 2026-09-27 |
| Rama | `feature/ubtn-biological-telemetry` (HEAD `18b95b1`, sin commits) |
| Modo | SOLO DISEÑAR Y DOCUMENTAR — NO implementar, NO modificar código, NO commits, NO refactorizar componentes |
| Imagen objetivo | `CMSC_UI_ARCHITECTURE_v1.md` (contrato de experiencia del Dashboard CMSC) |
| Documentos analizados | `CMSC_MASTERPLAN_v1` · `CMSC_SIGNAL_MAP_v1` (S01..S80) · `CMSC_UI_ARCHITECTURE_v1` · `CMSC_CANONICAL_STATE_v1` · `CMSC_LABS_RESTRUCTURING_PLAN_v1` · `CMSC_F3A_INTERCONNECTION_BLUEPRINT_v1` · `CMSC_F3B_SIGNAL_PRODUCERS_ECOSYSTEM_v1` · `SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1` |
| Regla final | **NO REEMPLAZAR · NO REESCRIBIR · NO BORRAR · SOLO ENVOLVER, ORGANIZAR, CONECTAR Y EVOLUCIONAR** |

---

## 1. Propósito y alcance de F3C

F3A definió la **red** (cómo se conecta el ecosistema) y F3B el **ecosistema de productores** (de dónde nace cada señal). F3C es la tercera capa: **cómo aparece todo lo ya descubierto en una única experiencia de usuario** — el Dashboard CMSC de la imagen objetivo (`CMSC_UI_ARCHITECTURE_v1`).

Esta fase **no diseña laboratorios, no descubre señales y no hace arqueología**: organiza lo hallado en pantalla, sin destruir ningún laboratorio, sin perder conocimiento, sin crear duplicidades y preservando la historia del ecosistema.

### Qué hace F3C
- Responde las 14 preguntas de la misión (Q1..Q14): nacimiento de `/dashboard-cmsc`, convivencia con `/labs`, reutilización, piezas existentes vs capas visuales, representación del flujo, navegación por señales/conocimiento, ACP futuro, honestidad, componentes a usar tal cual o con adaptadores mínimos, mapa de navegación y roadmap.
- Fija la **estrategia exacta de construcción** (qué se añade, qué se envuelve, qué se enlaza) verificada contra el código actual (`App.jsx`, `components/`, `labs/`, `pages/`, `knowledge-hub/`, `stores/`, `hooks/`, `services/`).

### Qué NO hace F3C
- NO implementa la ruta ni los paneles (la construcción es una misión futura con orden explícita).
- NO toca `App.jsx`, `TopNav`, labs, stores, servicios ni registry.
- NO reemplaza `/dashboard` ni `/labs`; no borra nada.

---

## 2. Q1 — ¿Cómo nace la nueva ruta `/dashboard-cmsc`?

### 2.1 Principio de nacimiento: **ruta aditiva, cero conflicto**

`/dashboard-cmsc` nace como una **ruta nueva**, independiente y envolvente. No ocupa el lugar de ninguna ruta existente. En el árbol actual de `App.jsx` (15 rutas: `/dashboard`, `/labs`, `/ai-predictive`, `/data-science`, `/hardware-catalog`, `/hardware/:id`, `/proyectos`, `/labs/robotics`, `/advanced-math`, `/advanced-math-v2`, `/lab-embedded`, `/lab-telecom`, `/lab-electronics`, `/knowledge`, `/knowledge/doc/:docId`) **todas se mantienen intactas**.

### 2.2 Diseño del nacimiento (cuando la misión de construcción autorice el cambio)

| Paso | Qué se añade | Qué NO se toca |
|---|---|---|
| 1 | Import del componente `CmscDashboard` nuevo (envoltura, en `pages/`) | Nada existente |
| 2 | Ruta `<Route path="/dashboard-cmsc" element={<CmscDashboard/>} />` agregada al bloque `Routes` | Las otras 15 rutas |
| 3 | Enlace de entrada (item `CMSC Científico` en TopNav, solo al autorizarse) apuntando a `/dashboard-cmsc` | los 6 navItems actuales tal cual |
| 4 | Redirección segura: ruta inexistente de CMSC → 404 honrado (patrón actual de `App.jsx`), nunca a `/dashboard` por defecto | fallback routeMap de voz preservado |

### 2.3 Estructura del layout huésped (concepto de `CmscDashboard`)

```
<CmscDashboard>                      (nuevo)
├── TopNav existente                (reutilizado, sin tocar)
├── Cinta del río científico        (capa de organización visual — §6)
├── Contenido de la vista CMSC      (panel principal)
│     └── Panel de evidencia side   (capa de organización visual)
├── VoiceAssistant existente        (reutilizado, sin tocar)
└── Enlaces a /labs (catálogo académico) y rutas existentes
```

Regla F3C-1: **el layout huésped es envoltura pura**; reutiliza `TopNav` y `VoiceAssistant` por composición (no los modifica) y añade únicamente capas de organización.

---

## 3. Q2 — ¿Cómo convive `/labs` con `/dashboard-cmsc` sin romper nada?

### 3.1 Separación de identidades (veredicto consolidado de la sesión)

| Ruta | Rol | Naturaleza |
|---|---|---|
| `/labs` (`LabCatalog`) | **Catálogo académico** de laboratorios (Cards + atajos) | Preservado intacto |
| `/dashboard-cmsc` (nuevo) | **Mapa científico** del ecosistema (río, señales, evidencia, honestidad) | Envoltura nueva |

No compiten: son dos **entradas** al mismo cuerpo de laboratorios. El laboratorio sigue existiendo una sola vez; ambos caminos **conducen a las mismas rutas** (`/lab-electronics`, `/advanced-math-v2`, `/lab-telecom`, `/labs/robotics`, `/lab-embedded`, `/data-science`, `/ai-predictive`).

### 3.2 Mecanismos de convivencia

1. **Rutas disjuntas**: `/labs` y `/dashboard-cmsc` no comparten path parent.
2. **Enlaces cruzados**: la cinta del río de CMSC incluye un eslabón "Laboratorios académicos" → `/labs`; el `LabCatalog` conserva su enlace actual.
3. **Cero estado compartido en la navegación**: cada ruta carga su propio estado; `useLabStore` sigue siendo la mochila federada de datos del lab (no de navegación).
4. **Retrocompatibilidad**: el `routeMap` de voz (App.jsx:72-88) queda intacto y no requiere nueva clave para que el ecosistema funcione.

Regla F3C-2: **`/dashboard-cmsc` es invitado, no rey**: existe porque envuelve; su ausencia jamás rompe `/labs`.

---

## 4. Q3 — ¿Qué paneles del Dashboard pueden construirse reutilizando componentes existentes?

De la imagen objetivo (§2.1 de UI_ARCH: Resumen del río, Señales vivas, Última evidencia, Puertas de laboratorios, Termómetro de honestidad) y de sus vistas:

| Panel CMSC | Componentes existentes reutilizados | Verificado en |
|---|---|---|
| Resumen del río (tarjetas por eslabón) | `Dashboard.jsx`, `TelemetryPanel.jsx`, `ClusterCard.jsx`, `GlobalChart.jsx` | `components/` + `pages/Dashboard.jsx` |
| Señales vivas (grid con badge) | `TelemetryPanel.jsx` + `GlobalChart.jsx` + `useRoboticsApi` + `fetchTelemetrySeriesReal` | `components/` + `hooks/` + `services/cloud.js` |
| Última evidencia | `KnowledgeHubLayout.jsx` + `MarkdownDocumentView.jsx` + registry `knowledgeRegistry.generated.json` | `knowledge-hub/` |
| Puertas de laboratorios | Enlaces a rutas existentes (ningún motor nuevo) | `App.jsx:123-129` |
| Termómetro de honestidad | Vista nueva que **lee** el mapa S01..S80 (§5) — capa visual | `CMSC_SIGNAL_MAP_v1` §1 |
| Vista espectral | `TelecomLab.jsx` (Spectrum FFT real), `mathHelpers.js` (wavelets), serie de `TelemetryPanel` | `labs/`, `labs/mathHelpers.js` |
| Vista matemática | `AdvancedMathLabV2.jsx` (Dr. Binary) por envoltura/enlace + `useLabStore` | `labs/AdvancedMathLabV2.jsx` |
| Vista IA | `AIPredictiva.jsx` (modos real/sim/demo + confidence) + panel benchmark (lectura) | `pages/AIPredictiva.jsx` |
| Vista Knowledge | `KnowledgeHubLayout.jsx` + `docLoader.js` + `markdownRenderUtils.js` | `knowledge-hub/services/` |
| Vista ACP | Superficie inerte (§9): sin motor; usa contenido honesto `DISEÑO` | — |

**Resultado Q3:** todos los paneles del dashboard ganador **se construyen por composición de componentes ya existentes**; únicamente las capas de organización (§5) y la vista del mapa de señales son piezas nuevas de tipo **lector**.

---

## 5. Q4 y Q5 — Piezas que ya existen hoy vs. capas de organización visual

### 5.1 Q4 — Piezas del dashboard ganador que YA existen (verificadas en disco)

| # | Pieza | Archivo verificable |
|---|---|---|
| 1 | Barra de navegación superior (neón, cluster status, identidad) | `components/TopNav.jsx` |
| 2 | Dashboard real con telemetría y cluster | `pages/Dashboard.jsx` |
| 3 | Panel de telemetría (series V3) | `components/TelemetryPanel.jsx` |
| 4 | Gráficos globales (chart área/line) | `components/GlobalChart.jsx` |
| 5 | Tarjeta de cluster/nodo | `components/ClusterCard.jsx` |
| 6 | Telemetría 3D del robot | `components/Telemetry3DScene.jsx` |
| 7 | Dr. Binary / matemática avanzada (series, FFT, wavelets) | `labs/AdvancedMathLabV2.jsx` + `mathHelpers.js` |
| 8 | Espectro FFT real del micrófono | `labs/TelecomLab.jsx` (WebAudio `AnalyserNode`) |
| 9 | Electrónica interactiva (Falstad + solver Python) | `labs/ElectronicsLab.jsx` + `labs/electronics/FalstadPanel.jsx` + `adapters/falstadAdapter.js` |
| 10 | Mochila federada de datos de labs | `stores/useLabStore.js` |
| 11 | Modelado de robótica y metadatos del robot | `hooks/useRoboticsApi.js` |
| 12 | Inferencia IA con modos honestos (real/sim/demo) | `pages/AIPredictiva.jsx` |
| 13 | Consola Python/Plotly en navegador | `pages/DataScienceLab.jsx` |
| 14 | Knowledge Hub MVP (51 docs, visor, categorías) | `knowledge-hub/` (layout + document view + registry) |
| 15 | Asistente de voz (STT/TTS, fallback routeMap) | `components/VoiceAssistant.jsx` |
| 16 | Laboratorios completos (Embedded, Robotics internals, catálogo) | `labs/` + `pages/LabCatalog.jsx` |
| 17 | Guardarraíl de errores | `components/ErrorBoundary.jsx` |

**Conclusión Q4:** la **totalidad de los motores** del dashboard ganador ya existe. El dashboard ganador **no agrega motor alguno**, solo los organiza.

### 5.2 Q5 — Piezas que son SOLO capas de organización visual (nuevas, sin lógica)

| Capa | Naturaleza | Datos que lee |
|---|---|---|
| Cinta del río científico | Barra horizontal de eslabones clicables | Mapa fijo (masterplan §3) |
| Layout huésped (shell) | Marco de composición TopNav + contenido + side + VoiceAssistant | Nada propio |
| Panel de evidencia (side) | Tarjetas de contexto por señal | `CMSC_SIGNAL_MAP_v1`, registry KH |
| Badge de honestidad | Componente visual `REAL/SIM/REF/DISEÑO/ROTO/HUÉRFANO` | estado de la señal |
| Termómetro de honestidad | Contadores agregados reales vs simulados | derivado del mapa S01..S80 |
| Tabla/catálogo de señales | Vista de lectura del mapa (filtros y búsqueda) | `CMSC_SIGNAL_MAP_v1` §1-§3 |
| Mapa modelo→señal | Matriz de modelos IA por señal | `ESTADO_ACTUAL_BENCHMARKS` + mapa |
| Filtros de domicilio/tipo | UI de filtrado sobre datos ya existentes | catálogo de señales |
| Ficha de señal | Tarjeta informativa (origen/destino/frecuencia…) | ficha del mapa §3 |

Regla F3C-3: **una capa de organización jamás calcula ciencia**: transforma presentación, no estado. Si necesitara calcular algo (FFT, inferencia), delega en el lab/motor existente.

---

## 6. Q6 — ¿Cómo representar visualmente el flujo Señal→Telemetría→Modelado→IA→KH→Impacto?

### 6.1 La cinta del río (hilo conductor, UI_ARCH §1.2)

```
Sensores › Telemetría › Matemáticas › Señales › IA › Knowledge Hub › Agentes › Usuario
```

El flujo pedido por la misión (Señal→Telemetría→Modelado→IA→KH→Impacto) es la **proyección directa** de esta cinta canónica del masterplan:

| Eslabón de la misión | Eslabón de la cinta CMSC | Vista destino |
|---|---|---|
| Señal | Sensores / Señales | `/cmsc/senales` |
| Telemetría | Telemetría | `/dashboard-cmsc` (señales vivas) |
| Modelado | Matemáticas | `/cmsc/matematica` |
| IA | IA | `/cmsc/ia` |
| Knowledge Hub | Knowledge Hub | `/cmsc/knowledge` |
| Impacto | Agentes / Usuario | `/cmsc/acp` + dashboard |

### 6.2 Representación en el dashboard principal

1. **Cinta horizontal fija** bajo el TopNav: eslabones iluminados según la vista activa; cada eslabón es clicable.
2. **Doble carrera visual**: sobre cada eslabón, mini-badge de estado agregado (cuántas señales `REAL` / `SIM` / `DISENO` entre sus señales).
3. **Tarjetas eslabón en el dashboard**: cada tarjeta resume su eslabón (contador + último valor + badge) y enlaza a su vista. Nada es decorativo.
4. **Río vertical en preferencia del usuario**: versión desplegable (detalle por eslabón) sin romper la cinta horizontal.

Regla F3C-4: la cinta refleja **estado honesto + navegación**; jamás muestra un eslabón "vivo" si su señal es `DISENO`.

---

## 7. Q7 — ¿Cómo introducir Signal Navigation sin romper laboratorios?

### 7.1 Definición
La **Signal Navigation** es la capacidad del usuario de entrar **desde la señal** (no desde el laboratorio): elegir una señal S-ID y ver su ficha, su estado, sus labs consumidores, sus modelos y sus anclas KH — con enlaces de salida a los labs.

### 7.2 Mecanismo (lectura + enlace + envoltura, jamás sustitución)

| Capa | Qué hace | Impacto en labs |
|---|---|---|
| Selector global de señal (en el layout huésped) | Navega entre S-IDs | Ninguno (lectura del mapa) |
| Vista `/cmsc/senales` (catálogo) | Lista S01..S80 con filtros | Ninguno (lectura) |
| Ficha de señal | Tarjeta `origen·destino·frecuencia·contexto·labs·modelos` | Ninguno (lectura) |
| **Puente de salida Signal→Lab** | La ficha muestra "ver en lab" → `navigate('/lab-telecom')` etc. | Lab intacto, solo recibe navegación |
| Traza de señal | Muestra etapa del Lifecycle (F3B §13) por señal | Ninguno |

Regla F3C-5: **el lab sigue siendo la única casa de la señal que vive en él**; la navegación por señales es una **puerta de entrada adicional**, nunca un duplicado del lab. No se crea una segunda instancia de `TelecomLab` dentro de `/cmsc/senales`; se **enlaza**.

### 7.3 Guardarraíl
- El selector global no intercepta rutas de labs (`/lab-*`, `/advanced-math*`) — solo opera dentro del espacio `/dashboard-cmsc` y `/cmsc/*`.
- No se añade estado persistente nuevo al `routes/global`: la posición de la señal seleccionada puede vivir en memoria local de la vista (para no ensuciar `useLabStore`).

---

## 8. Q8 — ¿Cómo introducir Knowledge Navigation sin duplicar Knowledge Hub?

### 8.1 Definición
La **Knowledge Navigation** conecta cada elemento CMSC (señal, panel, evidencia) con los documentos del KH que lo sustentan — sin duplicar el visor ni los documentos.

### 8.2 Fuente única (cero duplicidad)
- El contenido sigue siendo el registry `knowledgeRegistry.generated.json` (51 docs, 6 categorías) y el visor `KnowledgeHubLayout` + `MarkdownDocumentView`.
- `docLoader.js` y `markdownRenderUtils.js` permanecen como única vía de carga.
- La vista `/cmsc/knowledge` es una **envoltura de presentación** que reordena/enriquece esa misma lectura con cross-references (qué señal documenta cada doc, qué análisis la sustenta) derivadas del SIGNAL_MAP y del `docsBySignal` de F3B (§9/§12).

### 8.3 Mecanismo

| Capacidad | Implementación futura (F3E) | Dependencia |
|---|---|---|
| Docs conectados a señales | Selector `docsBySignal(signalId)` leyendo registry + mapa | Registro actual (0 duplicación) |
| "Evidencias de este tema" | Filtros por categoría (`research-v2`, `eiarc-architecture`…) | categorías actuales del registry |
| Búsqueda/RAG/grafo | **Marcadas `DISEÑO`** (no se implementan; UI_ARCH §7.1) | — |
| Enlace doc→señal y volver | Navegación bidireccional `/knowledge/doc/:id` ↔ ficha de señal | rutas existentes |

Regla F3C-6: **problemas de contenido → resueltos en el KH; problemas de enlace → resueltos en vista CMSC**. Nunca se escribe un segundo knowledge hub.

---

## 9. Q9 — ¿Cómo introducir el ACP como vista futura sin implementarlo?

### 9.1 Naturaleza
`/cmsc/acp` nace como **vista inerte y honesta**: muestra la superficie (layout, contrato de visualización de agentes, traza) pero **sin motor**. Es totalmente `DISEÑO` (0% implementación), alineado con UI_ARCH §8.4 y el MASTERPLAN (multiagente agnóstico, fase 4).

### 9.2 Qué muestra mientras es inerte

| Bloque | Estado |
|---|---|
| Entrada única multimodal (texto + micrófono) | Presente pero **deshabilitada** (o con aviso `DISEÑO`) |
| Panel de orquestación (Agente · técnica · resultado · estado · ancla) | Render de **filas placeholder vacías** con contrato visual listo |
| Respuesta consolidada + confidence | Never; muestra "—" honesto |
| Fallback a voz/keywords existentes | **Preservado**: mientras no haya ACP, la voz actual (`VoiceAssistant` + routeMap) sigue operando |

### 9.3 Puerta de F4
Cuando la misión F4 autorice el ACP, la vista ya tiene: layout, contrato de filas por agente, y patrón de fallback — el motor se **enchufa detrás** sin rehacer la UI. El badge `DISEÑO` se mantiene hasta que exista implementación real.

Regla F3C-7: **la UI del ACP nunca finge estar activa**: presenta su estado honesto y delega en el fallback existente.

---

## 10. Q10 — ¿Cómo representar la honestidad del ecosistema?

### 10.1 Código de estado unificado (lenguaje visual global)
Basado en UI_ARCH §14, ampliado al canon de estado de F3A/F3B (6 estados + REF):

| Estado | Código visual | Regla semántica |
|---|---|---|
| `REAL` | Círculo sólido cian/verde + etiqueta | Señal verificada de instrumento real |
| `REAL-LOCAL` | Círculo sólido + borde local | Real generada en el entorno local (mic, clima externo etiquetado) |
| `SIM` | Contorno punteado + etiqueta | Producida por simulación/mock |
| `REF` | Ícono de libro/documento | Referencia externa o dataset |
| `DISEÑO` | Contorno difuminado + "pendiente" | Prometida, no operativa (UBTN, RF, ACP vista) |
| `ROTO` | Rojo plasma `#FF3131` + etiqueta | Enlace/consumidor roto (cliente robot `localhost:8000`) |
| `HUÉRFANO` | Gris intermitente + "sin dueño" | Reclama conexión inexistente (`bridgeStatus`) |

### 10.2 Termómetro de honestidad (dashboard principal)
- Contadores agregados: `real: n · real-local: n · sim: n · ref: n · diseño: n · roto: n · huérfano: n`.
- Derivado **solo** de la tabla de inventario del SIGNAL_MAP (nunca de inventos).
- Cada cuenta del termómetro es un **filtro** de la señales de la misma vista.

### 10.3 Reglas de presentación (invariantes)
1. Todo valor numérico de señal lleva badge; **nunca solo el número**.
2. `source_mode` del backend se muestra tal cual (no se recomputa, F3A §12).
3. Clima externo NO se etiqueta telemetría rural (§F3A R1). Cluster BBB fabricado se etiqueta `SIM` (§F3A R2).
4. Si no hay modelo para la señal → `—` (nunca inventar).
5. El termómetro y los badges comparten una **única leyenda** en el layout huésped.

---

## 11. Q11 — Componentes que pueden usarse **tal y como están hoy**

Verificación por lectura de archivos:

| Componente | Uso en CMSC (directo) | Evidencia |
|---|---|---|
| `TopNav.jsx` | Barra superior del layout huésped (composición) | `components/TopNav.jsx` |
| `VoiceAssistant.jsx` | Superficie de voz (composición, fallback actual) | `components/VoiceAssistant.jsx` |
| `Dashboard.jsx` | Patrones de tarjetas, cluster, telemetría (referencia) | `pages/Dashboard.jsx` |
| `TelemetryPanel.jsx` | Panel de señales vivas | `components/TelemetryPanel.jsx` |
| `GlobalChart.jsx` | Gráficas de series | `components/GlobalChart.jsx` |
| `ClusterCard.jsx` | Nodos del clúster/BBB | `components/ClusterCard.jsx` |
| `KnowledgeHubLayout.jsx` + `MarkdownDocumentView.jsx` | Vista knowledge (envoltura de lectura) | `knowledge-hub/` |
| `docLoader.js` + `markdownRenderUtils.js` | Carga y render de docs (única vía) | `knowledge-hub/services/` |
| `TelecomLab.jsx` (módulo Spectrum) | FFT real del micrófono (vista espectral) | `labs/TelecomLab.jsx` |
| `AdvancedMathLabV2.jsx` + `mathHelpers.js` | Modelado matemático (vista matemática) | `labs/` |
| `ElectronicsLab.jsx` + `FalstadPanel.jsx` | Electrónica interactiva (vista asociada) | `labs/electronics/` |
| `AIPredictiva.jsx` | Inferencia + modos honestos (vista IA) | `pages/AIPredictiva.jsx` |
| `useLabStore.js` | Mochila federada de datos de labs | `stores/useLabStore.js` |
| `ErrorBoundary.jsx` | Guarda de errores de todo el host | `components/ErrorBoundary.jsx` |
| `knowledgeRegistry.generated.json` | Fuente única del KH | `registry/` |

**Conclusión Q11:** **15 componentes se usan tal cual, por composición/es enlace**, sin una línea de cambio.

---

## 12. Q12 — Componentes que requieren **adaptadores mínimos**

Un adaptador es un **lector/flexible** (F3A §10: morfología-lectura) que estandariza la salida de un componente a la capa de señales — sin tocar al componente.

| Componente | Dificultad | Adaptador requerido | Qué arregla |
|---|---|---|---|
| `services/cloud.js` (`fetchTelemetrySeriesReal`) | Saneamiento de honestidad | Re-etiquetar salida como `REAL-LOCAL` clima-externo (F3A R1) | — Evita presentar clima como telemetría rural |
| `services/cloud.js` (`fetchClusterNodesReal`) | Saneamiento de honestidad | Etiquetar salida `SIM` (F3A R2) | — Evita presentar métricas fabricadas como reales |
| `hooks/useRoboticsApi.js` | Host erróneo | Política de entorno `VITE_API_URL` → `8010` (no `localhost:8000`) (F3A R3) | — Restaura telemetría robot `REAL` |
| `stores/useLabStore.js` | Extensión aditiva | `signalRegistry` declarativo (F3B §11) como rama nueva | — Da de alta señales sin tocar claves |
| `knowledge-hub/registry` | Lectura cruzada | Selector `docsBySignal(signalId)` (F3B §7/§12) | — Conecta señal↔documento sin duplicar |
| Mapa S01..S80 (documental) | Datos en Markdown | **Vista-catálogo de señales** que lo lee (nuevo, tipo lector) | — Habilita el catálogo vivo desde el SIGNAL_MAP |
| `AIPredictiva.jsx` | Presentación | Envoltorio que muestra `confidence` + badge real/sim/demo en la vista IA | — Honestidad de inferencia consistente |

Regla F3C-8: los adaptadores **envuelven, no reescriben**; cada uno es una función de lectura que añade metadata/estado sin mutar el componente de origen.

---

## 13. Q13 — Mapa completo de navegación CMSC

```
                              TOPNAV (existente, preservado)
   ┌────────┬────────┬────────┬─────────┬─────────┬──────────┐
   │Dashboard│Laborat│Hardware│IA Pred. │Proyectos│Conocim.  │
   └────────┴────────┴────────┴─────────┴─────────┴──────────┘
                    (+ item CMSC Científico, aditivo, futuro)
                                   │
                                   ▼
   ┌────────────────── /dashboard-cmsc (NUEVO) ──────────────────┐
   │  CINTA DEL RÍO: Sensores › Telemetría › Matemáticas › Señales│
   │                › IA › KH › Agentes › Usuario                 │
   │  [Resumen del río] [Señales vivas] [Última evidencia]        │
   │  [Puertas de laboratorios] [Termómetro de honestidad]        │
   └──────────────┬────────────────┬──────────────┬──────────────┘
                  │                │              │
        ┌─────────┴──────┐  ┌──────┴──────┐  ┌────┴──────┐
        ▼ /cmsc/senales  ▼ /cmsc/espectral ▼ /cmsc/matemática
   Signal Navigation   Lab Espectral     Envoltura Dr. Binary
   catálogo S01..S80   FFT/STFT/wav      envoltura + mathHelpers
        │                 │               │
        ▼                 ▼               ▼
   /cmsc/ia        /cmsc/knowledge   /cmsc/acp        /labs académico
   Vista IA        Envoltura KH      ACP DISEÑO       LabCatalog intacto
   inferencia      docsBySignal      layout inerte           ▼
   benchmark       sin duplicar      fallback voz      rutas de labs existentes
                                                      /lab-electronics
                                                      /advanced-math-v2
                                                      /lab-telecom
                                                      /labs/robotics
                                                      /lab-embedded
                                                      /data-science
                                                      /ai-predictive
```

Reglas de navegación:
1. **Todo lo existente permanece enlazable** desde el árbol; nada desaparece.
2. Las rutas `/cmsc/*` solo existen dentro del espacio CMSC; las rutas de labs conservan su camino directo.
3. El `routeMap` de voz (App.jsx:72-88) sigue funcionando y puede **extenderse aditivamente** (futuro: `cmsc`, `dashboard-cmsc`, `senales`) sin romper las claves actuales.
4. Ruta desconocida → 404 honrado (patrón actual), no atasco a `/dashboard`.

---

## 14. Q14 — Roadmap visual de construcción

### 14.1 Fases (según la misión)

```
F3C  Dashboard CMSC          layout huésped + cinta del río + dashboard principal
│    + término de honestidad + puertas de laboratorios (todas leídas de lo existente)
▼
F3D  Signal Navigation       /cmsc/senales (catálogo S01..S80) + selector global + ficha
│    + puente Signal→Lab (enlaces, sin duplicar labs)
▼
F3E  Knowledge Integration   /cmsc/knowledge (envoltura docsBySignal) + /cmsc/matematica
│    + /cmsc/ia + /cmsc/espectral (cada vista envuelve al lab ya existente)
▼
F4   ACP                     /cmsc/acp activo + superficie texto/voz conectadas al ACP
     (motor agnóstico, fallback preservado) → CMSC estable candidato a dockerizar
```

### 14.2 Gates por fase (verificables por documento, no por código)

| Fase | Gate |
|---|---|
| `G-F3C` | Layout huésped + cinta + dashboard principal + termómetro especificados sobre componentes 100% existentes; cero modificaciones de código autorizadas hoy |
| `G-F3D` | Catálogo de señales + selector + ficha + puente Signal→Lab especificados sin crear segunda instancia de ningún lab |
| `G-F3E` | Envolturas de Knowledge/Math/IA/Espectral especificadas **sin duplicar** KH ni matemáticas |
| `G-F4` | Vista ACP + voz/texto conectadas con fallback preservado; candidato a dockerizar 5174 |

### 14.3 Orden de ejecución e integridad
- **Cada fase es una misión explícita nueva**; ninguna se ejecuta por este documento.
- **Secuencia estricta F3C→F3D→F3E→F4** (la navegación por señales necesita el layout de F3C; la envoltura de conocimiento necesita las anclas de F3D).
- Antes de implementar F3C, se requiere: gates F3A (G-01..G-06) y F3B (G-01..G-08) **aprobados** + sanear los 3 riesgos de honestidad (clima/BBB/robot, F3A R1-R3) como prerequisito de construcción.

---

## 15. Resultado final — El Dashboard CMSC sin destruir nada

| Requisito de la misión | Cómo lo cumple F3C |
|---|---|
| Sin destruir laboratorios | Todos se preservan; el dashboard los envuelve, enlaza y organiza (§7, §13) |
| Sin perder conocimiento | Todo doc/evidencia sigue viviendo en el KH; el CMSC solo lo lee (§8) |
| Sin crear duplicidades | Cero segundo KH, cero segundo Dr. Binary, cero segundo store (§4, §8, §11) |
| Preservando la historia | Rutas, `routeMap`, registry, labs, estética neón: intocadas (§2, §3, §13) |
| Honestidad visible | Badges + termómetro + leyenda única en cada píxel (§10) |
| Experiencia única | Una sola cinta del río, un solo layout huésped, un solo dashboard científico (§2, §6) |

**Estrategia en una frase:** el Dashboard CMSC nace como **una envoltura de composición** que reutiliza 15 componentes tal cual, añade solo capas de organización y adaptadores de lectura, y muestra el flujo Señal→Telemetría→Modelado→IA→KH→Impacto con honestidad en cada pixel — **sin reemplazar, reescribir ni borrar nada.**

---

## 16. Honestidad final y próximo paso

- **Lo que F3C no hace:** no implementa la ruta, no toca código, no modifica componentes, no hace commits, no duplica estado.
- **Estado verificado hoy (disco):** `App.jsx` con 15 rutas; 16 componentes reutilizables; `useLabStore` federado; registry KH 51 docs; 3 señales reales (mic S30, SensorReading, RobotTelemetry con host roto); deuda de honestidad anotada (clima etiquetado telemetría, cluster BBB fabricado, host robot).
- **Prerrequisito de construcción real:** aprobar gates F3A/F3B, sanear riesgos R1-R3, y recibir **misión explícita F3C de implementación**.
- **Próximo entregable documental:** ninguno adicional salvo orden de Bernardo.

---

*Fin de la estrategia F3C v1 — el Dashboard CMSC aparecerá envolviendo, organizando y conectando lo que ya existe, con honestidad en cada píxel y la historia del ecosistema intacta. NO REEMPLAZAR · NO REESCRIBIR · NO BORRAR.*