# SIGCTiArural · CMSC — F3D Estrategia de Navegación por Señales (Blueprint v1)

| Campo | Valor |
|---|---|
| Estado del documento | **DISEÑO v1 · Arquitectura UX** — sin implementación |
| Fase | **F3D (Signal Navigation)** del roadmap CMSC (F3C→F3D→F3E→F4) |
| Fecha | 2026-09-27 |
| Rama | `feature/ubtn-biological-telemetry` (HEAD `18b95b1`, sin commits) |
| Modo | SOLO DISEÑAR Y DOCUMENTAR — NO implementar, NO modificar código, NO commits, NO tocar componentes |
| Documentos base | `CMSC_F3C_DASHBOARD_CONSTRUCTION_STRATEGY_v1.md` (mapa de navegación, Signal Navigation) · `CMSC_F3B_SIGNAL_PRODUCERS_ECOSYSTEM_v1.md` (Registry, Lifecycle, Confidence) · `CMSC_SIGNAL_MAP_v1.md` (S01..S80) · `CMSC_UI_ARCHITECTURE_v1.md` |
| Regla final | **NO REEMPLAZAR · NO REESCRIBIR · NO BORRAR · SOLO ORGANIZAR, CONECTAR, EVOLUCIONAR** |
| Tesis | **Las señales son ciudadanos de primera clase. El usuario navega señales; los laboratorios son herramientas.** |

---

## 1. Propósito y alcance de F3D

F3C diseñó el **lienzo** (layout del Dashboard CMSC, cinta del río, paneles) y definió el concepto de Signal Navigation (lectura + enlace + envoltura). F3D completa la **estrategia de interacción por señales**: cómo un usuario encuentra una señal, la modela, la envía a IA, la registra en el KH y la lleva al ACP — navegando **señales, no laboratorios, no tecnologías, no componentes**.

Este documento responde a la pregunta de la misión: ¿cómo navega un usuario cuando tiene **Audio, RF, Temperatura, Humedad, RobotTelemetry, Video, Bioacústica, Vibración, Imágenes y Datos IA**?

### 1.1 Contrato de navegación (principio único)

> Toda pantalla CMSC comienza por la **señal**; los laboratorios aparecen como **destinos herramienta** (enlaces), nunca como puertas de entrada exclusivas. Una señal se encuentra, se inspecciona, se modela, se interpreta y se registra **desde la señal misma**.

### 1.2 Qué NO hace F3D
- NO implementa pestañas, selectores ni vistas.
- NO toca componentes, rutas ni stores.
- NO reemplaza el catálogo de labs (`/labs`) — lo **usa** como herramienta.
- NO modifica el Signal Registry de F3B (es su **fuente de datos**, no su tema de edición).

---

## 2. Q1 — Mapa completo de navegación por señal

### 2.1 Las familias de señales que un usuario puede navegar

| Familia (lo que el usuario percibe) | Señales representativas | Estado real hoy | Demonio navegable |
|---|---|---|---|
| **Audio / Acústica** | S30 micrófono, S62 voz, S77 bioacústica (diseño) | S30 `REAL-LOCAL` | Espectro, señal de origen |
| **RF / Radio** | S31 WebSDR, S34 telecom sintética | S31 `REAL` externa, S34 `SIM` | Espectro de banda |
| **Temperatura** | S10, S33 sim, S03 clima | S10 `REAL`, S03 `REAL-LOCAL` | Serie + PSD |
| **Humedad** | S11, S03 (clima) | S11 `REAL` | Serie + PSD |
| **RobotTelemetry** | S50 pose/batería, S51 trayectoria synth | S50 `REAL` (cliente roto), S51 `SIM` | Serie + 3D + periodo |
| **Video / Imágenes** | S60 imagen hoja, S70/S71 dataset, S62(voz no) | S60 `REAL`, S70/S71 `HISTORICA` | Inferencia + dataset |
| **Bioacústica** | S77 (diseño) | `DISENO` | — |
| **Vibración / Mecánica** | S21-IMU (diseño), S50 pose | `DISENO` / `REAL` | Firma mecánica |
| **Datos IA** | S61/S63 inferencias, S72/S73 M1/M2 | `REAL`/`SIM` por modo | Benchmark + confidence |
| **Señales eléctricas** | S32/S33 voltaje/corriente, S35 series | `SIM`/`GENERADA` | Modelado |

### 2.2 Mapa de navegación por señal (UX)

```
 ENTRADA DEL USUARIO (concepto que quiere resolver)
    "tengo audio" · "hace frío" · "mi robot" · "esta hoja" · "el micrófono"...
        │
        ▼
   FAMILIA DE SEÑAL (Audio, Temperatura, Humedad, Robot, Imagen, IA, ...)
        │
        ▼
   VISTA CATÁLOGO  /cmsc/senales  (Signal Explorer — Q4)
        │  lista de señales de la familia con badge de honestidad
        ▼
   FICHA DE SEÑAL  (tarjeta canónica — F3B §14)
        │  origen · estado · dominio · class · confidence · lifecycle
        ├───────────────┬────────────────┬─────────────────┬──────────────┐
        ▼               ▼                ▼                 ▼              ▼
   MODELAR         ANALIZAR IA      VER EVIDENCIA     VER EN LAB     PREGUNTAR ACP
   /cmsc/matem     /cmsc/ia         /cmsc/knowledge   /lab-*        /cmsc/acp
   (Q8)            (Q9)             (Q10)             (Q13)         (Q11, inerte)
```

Regla F3D-1: **ninguna familia obliga a conocer el lab antes de navegar la señal**; los labs aparecen en la ficha como destino final de la señal.

---

## 3. Q2 — Jerarquía visual de señales

Las señales se organizan en **4 niveles de jerarquía** (de lo abstracto a lo concreto):

```
 N1  FAMILIA        Audio · RF · Temperatura · Humedad · Robot · Video/Imagen
                    · Bioacústica · Vibración · Eléctrica · Datos IA
 N2  SEÑAL          S30 · S10 · S11 · S50 · S60 · ...  (S-IDs del mapa)
      con badge     REAL / REAL-LOCAL / SIM / REF / DISEÑO / ROTO / HUÉRFANO
 N3  FICHA          origen · cadencia · dominio · confidence · lifecycle ·
                    consumers · metadata (F3B tarjeta canónica)
 N4  ACCIONES       Modelar · Analizar IA · Ver evidencia · Ver en lab · ACP
```

### Reglas visuales de la jerarquía
1. **N1 visible siempre** como pestañas/filtros en `/cmsc/senales`; N2 debajo en grid; N3 en panel de evidencia; N4 como botones de acción de la ficha.
2. **Familias no se esconden**: una familia `DISENO` (Bioacústica, Vibración) se muestra con contorno difuminado y su roadmap — no desaparece.
3. **Un mismo S-30 aparece una sola vez** (fuente única); los labs que la consumen son enlaces, no duplicados.
4. **La familia NO es un lab**: "Audio" agrupa señales acústicas de varios labs; el lab es una etiqueta de N4.

Regla F3D-2: **la jerarquía refleja el Signal Registry, no el organigrama de labs.**

---

## 4. Q3 — Signal Registry → UX

El **Signal Registry declarativo** (F3B §11) es el **modelo de datos** de toda la navegación por señales. Mapeo campo → UX:

| Campo registry | Uso en UX |
|---|---|
| `signal_id` (`S10`) | Identificador visible, buscable (`#S10`) |
| `name` | Título de tarjeta / resultado |
| `class` | Agrupación "origen" en filtros (REAL/SIM/…) + iconografía |
| `domain` | Pestaña de familia (Físicas/Acústicas/RF/…) |
| `status` | Badge de honestidad (§12) |
| `origin` | Línea de detalle de la ficha |
| `cadence` | Indicador de cadencia (`time-based` / `event-based` / `on-demand`) |
| `port` | Trazabilidad de conexión (P-* de F3A) |
| `consumers` | Enlaces a labs/tools que la consumen (§13) |
| `metadata_ref` | Enlace a ficha completa del SIGNAL_MAP |
| `confidence` | % con descriptor textual (§12) |
| `docsBySignal` | Anclas KH en la ficha (§10) |
| `lifecycle` | Badge de etapa de vida (§5) |
| `revision` | Versión de la ficha (transparencia de gobernanza) |

Regla F3D-3: **la UX lee el registry, jamás lo escribe** (escritura = gobernanza F3B). Si un campo falta, la UI muestra `—` (honestidad, no inventos).

---

## 5. Q4 — Signal Explorer

**Definición:** el **Signal Explorer** es la superficie principal de navegación por señales (vista `/cmsc/senales`) — el "buscador del científico".

### 5.1 Componentes UX del Explorer

| Zona | Contenido |
|---|---|
| **Buscador** | Texto libre (nombre, S-*id, origen) |
| **Filtros** | Familia · class · status · dominio · lab consumidor · IA aplicable |
| **Grid de señales** | Tarjeta por señal: nombre + S-ID + badge honestidad + último valor si existe + confianza |
| **Panel de ficha** | Detalle de la señal seleccionada (N3/N4) |
| **Vista familia** | Agrupación por dominio (Audio, RF, Temperatura…) con contadores |

### 5.2 Interacciones del Explorer
1. **Click en tarjeta** → abre ficha en el panel (sin salir de la vista).
2. **Doble click / botón "abrir"** → salta a la mejor vista de la señal (espectro para S30, serie para S10, inferencia para S60).
3. **Filtro persistente por contexto** → la señal visitada desde la cinta del río llega pre-filtrada a la familia correspondiente.
4. **Ordenación** por: nombre, S-ID, honestidad (reales primero), confianza, actualización.

### 5.3 Reglas
- El Explorer **presenta el inventario completo** S01..S80 (nada se oculta; lo `DISENO` se ve como diseño).
- El Explorer **no duplica** fuentes: lee registry + mapa + `fetchTelemetry*` + `useRoboticsApi` (productores vivos) tal cual.

---

## 6. Q5 — Signal Trace

**Definición:** el **Signal Trace** es la **traza del ciclo de vida** de una señal individual — traducción UX del Signal Lifecycle de F3B (§12) y del Lifecycle de 7 etapas (F3B §4).

### 6.1 Representación del trace (por señal)

```
 S10 · Temperatura     status: REAL · confidence: 0.90
   Nacimiento  ☉ productor SensorReading V3 (backend 8010)      ✓
   Captura     ☉ puerto P-BE-01 · Envelope Común de Señal       ✓
   Procesado   ☉ normalización (unidades, timestamps)            ✓
   Modelado    ☉ pendiente — no hay modelo paramétrico          ⬚
   IA          ☉ umbrales de conversación (S65, reglas)          ✓
   Conocimiento☉ docsBySignal: knowledge-base (enlace)          ✓
   Impacto     ☉ ACP: disponible cuando F4                       ⬚
```

### 6.2 Interacciones
- Cada etapa del trace es **clicable** a su vista (Modelado → `/cmsc/matematica`; IA → `/cmsc/ia`; Conocimiento → `/cmsc/knowledge`).
- Etapa sin ejecutar se muestra **hueca** (`⬚`) y clicable a la vista donde podría ejecutarse — con badge `DISEÑO` si el motor no existe.

### 6.3 Regla
El trace **nunca inventa etapas**: si no hay modelo IA, la etapa IA muestra "—" con enlace al mapa de modelos (no fabrica un resultado).

---

## 7. Q6 — Signal Journey

**Definición:** el **Signal Journey** es la **visión panorámica de una señal a través del ecosistema** — el viaje completo de una misma señal desde su nacimiento hasta su impacto, cruzando productor → cauce → labs → IA → KH → ACP → usuario (F3B mapa universal §11).

### 7.1 Pantalla de Journey (modal/panel desplegable de la ficha)

```
 [Temperatura S10] ── REAL ──► cauce CMSC ──► MathV2 (modelo pendiente)
                                               │
   Dashboard CMSC ◄── telemetría ◄── backend ◄──┘
        │                                     │
        ▼                                    ▼
   Knowledge Hub ◄── evidencia ◄── IA (umbrales S65)
        │
        ▼
   ACP (interpretación futura) ──► Usuario (impacto)
```

### 7.2 Contenido del Journey
1. **Productor** — quién da nacimiento (producer_id, origen, cadencia).
2. **Puertos recorridos** — qué puertos F3A toca (P-BE-01, P-LAB-02…).
3. **Labs que atraviesan** — cómo la transforman (labels = herramientas).
4. **IA** — modelado/o modelos que la interpretan o no (`—` honesto).
5. **KH** — documentos que la evidencian (`docsBySignal`).
6. **ACP** — estado de interpretación (futuro, `DISEÑO` si no implementado).

### 7.3 Regla
El Journey es **navegación de lectura**: recorre lo que ya existe (registry, puertos, labs, KH), no ejecuta nada nuevo.

---

## 8. Q7 — Cómo encontrar una señal

Técnicas de descubrimiento (todas de lectura, ninguna requiere conocer un lab):

| Técnica | Cómo funciona | Ejemplo |
|---|---|---|
| **Buscar por concepto** | El buscador mapea términos naturales a señales | "hace frío" → S10/S11 + S03 |
| **Buscar por ID** | `#S30`, `S10` | identificación directa |
| **Buscar por producto** | nombre del productor | "micrófono" → S30; "robot" → S50/S51 |
| **Navegar por familia** | pestaña Audio/Temperatura/Robot/… | listar todas las acústicas |
| **Navegar por honesty** | filtro `Solo reales` / `Incluir diseño` | separar lo vivo de lo prometido |
| **Desde la cinta del río** | cada eslabón lleva a las señales de ese eslabón | IAslabón "Señales" → S30/S35 |
| **Desde un lab** | el lab presenta sus señales → enlace a ficha | `/lab-telecom` → S30 |

Regla F3D-4: **el usuario llega a la señal sin pasar por la tecnología**; el lab aparece solo como contexto de la ficha.

---

## 9. Q8 — Cómo modelar una señal

Desde la ficha de la señal → acción **Modelar**:

### 9.1 Flujo
```
 Ficha de señal ──► Modelar ──► /cmsc/matematica (vista matemática, envoltura)
                                    │
                                    ├── técnica aplicable a la señal (del SIGNAL_MAP §5)
                                    │     FFT · STFT · wavelets · series · correlación
                                    ├── botón "Abrir Dr. Binary con esta señal"
                                    │     → /advanced-math-v2 (intacto)
                                    └── resultados de la transformada, si existen
                                          (SIM/GENERADA según origen)
```

### 9.2 Reglas
1. **La técnica se sugiere desde el mapa de señales** (qué se le puede aplicar), no se inventa en la UI.
2. La matemática **delega en AdvancedMathLabV2** (lectura/enlace); la vista no reimplementa Fourier.
3. Si la señal viene de un live (mic S30), el modelado usa el **buffer local actual** (nunca se sube un `REAL-LOCAL`).

---

## 10. Q9 — Cómo enviar una señal a IA

Desde la ficha → acción **Analizar con IA**:

### 10.1 Flujo
```
 Ficha de señal ──► Analizar IA ──► /cmsc/ia
     │
     ├── ¿existe modelo para esta señal?
     │       S01 no · S10 umbrales S65
     │       S60 imagen → /api/v3/ai/inference/ (AIPredictiva)
     │       S61/S63 salidas IA → mostrar confidence + source_mode
     │       S62 voz → STT/TTS
     │       S77 bioacústica → "sin modelo (diseño research_v2)" — honestidad
     │
     └── salida: resultado + confidence + badge real/sim/demo (modos AIPredictiva)
```

### 10.2 Reglas
1. **Solo llega a IA lo que tiene modelo**: señal sin modelo muestra `NO HAY MODELO` (encadenado al research_v2 como diseño).
2. El envío usa **exactamente los mismos endpoints** que hoy consume el frontend (cero cliente nuevo).
3. La salida IA se etiqueta con `confidence` (§12) y con su **modo honesto** (real/sim/demo).

---

## 11. Q10 — Cómo enviar una señal al KH

Desde la ficha → acción **Ver evidencia**:

### 11.1 Flujo
```
 Ficha de señal ──► Ver evidencia ──► /cmsc/knowledge
     └── docsBySignal(signal_id) del registry
           → lista de documentos que evidencian la señal
           → cada doc abre /knowledge/doc/:id (visor KH intacto)
```

### 11.2 Reglas
1. **Sin escritura**: la acción solo **lee y enlaza**; la publicación de evidencias es gobernanza F3B/F3E.
2. Si la señal no tiene documentos → `— (sin evidencia registrada)`.
3. La misma señal puede enlazar a su ficha del SIGNAL_MAP (`metadata_ref`) y a sus benchmarks (S72/S73).

---

## 12. Q11 — Cómo llegará la señal al ACP

### 12.1 Principio
El ACP **consumirá el envelope de la señal** (F3B: señal + estado + clase + dominio + metadata + confianza) — no una foto suelta. Por eso la navegación por señales ya entrega al ACP (futuro, F4) lo que necesita: **señal etiquetada y traza completa**.

### 12.2 Flujo (diseño F4, hoy inerte)
```
 Ficha/Explorer ──► Preguntar al ACP ──► /cmsc/acp (vista DISEÑO, inerte)
     │  envía: señal_id + clase + status + confidence + lifecycle
     └── respuesta futura del ACP: interpretación con traza de agentes + anclas KH
     └── hoy: respuesta honesta "DISEÑO — sin implementación" + fallback voz actual
```

### 12.3 Regla F3D-5
La UI ya **prepara el contrato** (qué datos pasará al ACP) sin implementar el motor; cuando F4 autorice el ACP, la navegación por señales será su canal de entrada natural y el fallback (`VoiceAssistant` + `routeMap`) queda preservado.

---

## 13. Q12 — Cómo se preserva la honestidad

### 13.1 Badge de estado (presente en cada nivel de la jerarquía)

| Estado | Visual | Acompaña |
|---|---|---|
| `REAL` | círculo sólido cian/verde + etiqueta | valor + confianza |
| `REAL-LOCAL` | círculo sólido + borde local | valor + confianza (mic, clima externo etiquetado) |
| `SIM` | contorno punteado + etiqueta | valor «simulado» visible |
| `REF` | ícono de libro/docs | dataset, manifiesto, doc del KH |
| `DISEÑO` | contorno difuminado + "pendiente" | roadmap/gate |
| `ROTO` | rojo plasma + etiqueta | causa aparente (host mal configurado, SSE caído) |
| `HUÉRFANO` | gris intermitente + "sin dueño" | no hay consumidor/productor |

### 13.2 Reglas de honestidad en la navegación
1. **Todo valor de señal lleva badge**: el Explorer, la ficha, el trace y el journey muestran el estado en cada render.
2. **Confianza junto al estado**: `confidence: 0.90 (calibrada)` o `0.80 (instrumento nativo sin calibración)`.
3. **Nunca se "mejora" de estado por navegación**: SIM no sube a REAL; REAL degradado se marca `ROTO`.
4. **Fuentes del badge**: registry + envelope F3B (status/confidence) — un único origen de verdad.
5. **Familia completa visible**: familias `DISEÑO` (bioacústica, vibración) se muestran difuminadas con su gate, no desaparecen del Explorer.

---

## 14. Q13 — Cómo se conecta con los laboratorios

La conexión es **de la señal hacia el lab** (nunca el lab presenta señales ajenas como suyas). Matriz de conexión:

| Señal | Lab herramienta (destino de N4) | Rendición esperada |
|---|---|---|
| S30 micrófono | `TelecomLab` (espectro FFT) | vista espectral real + enlace `/lab-telecom` |
| S32/S33 eléctrica | `ElectronicsLab` (Falstad, THD) | modelado de circuito + enlace `/lab-electronics` |
| S35 series | `AdvancedMathLabV2` (Dr. Binary) | matemática aplicada + enlace `/advanced-math-v2` |
| S50/S51 robot | `RoboticsLab` (+ `Telemetry3DScene`) | telemetría 3D + periodo + `/labs/robotics` |
| S60 imagen hoja | `AIPredictiva` | inferencia + confidence + `/ai-predictive` |
| Datasets/experimentos | `DataScienceLab` (Pyodide) | análisis exploratorio + `/data-science` |
| S79 docs | `KnowledgeHubLayout` | visor de docs + `/knowledge` |
| Señal cualquiera | Lab que la consume (según registry.consumers) | enlace declarado por `consumers` |

### Mecanismo de conexión (solo organización)
1. `consumers` del registry determina los **enlaces de la ficha** a los labs/herramientas.
2. La vista CMSC **abre el lab intacto** (navigate a la ruta real); no incrusta ni duplica.
3. Si `consumers` está vacío → el lab no aparece (honestidad de soberanía de la señal).
4. `routeMap` de voz (App.jsx) se extiende aditivamente (futuro, sin tocar claves actuales).

---

## 15. Q14 — Roadmap de implementación visual

### 15.1 Sub-fases de F3D (todas bajo misión explícita futura)

```
 F3D-1  Explorer básico        vista /cmsc/senales leyendo el SIGNAL_MAP + registry
        · buscador · filtros · grid con badges · panel de ficha (lee, no escribe)
 F3D-2  Ficha canónica         tarjeta completa (registry → UX) + enlaces N4
        · Modelar · Analizar IA · Ver evidencia · Ver en lab · Preguntar ACP
 F3D-3  Trace y Journey        traza de lifecycle por señal + viaje panorámico
        · etapas clicables · etapas huecas honestas
 F3D-4  Integración global     selector de señal en el layout huésped + pre-filtrado
        · desde cinta del río · desde labs · 404 honrado
```

### 15.2 Gates F3D (verificables por documento)

| Gate | Criterio |
|---|---|
| `G-F3D-1` | Explorer especificado sobre datos existentes (mapa + registry + producers vivos) |
| `G-F3D-2` | Ficha de señal con las 5 acciones de salida hacia labs/IA/KH/ACP — sin motores nuevos |
| `G-F3D-3` | Trace y Journey derivados del Signal Lifecycle de F3B (7 etapas, estados honestos) |
| `G-F3D-4` | Honestidad codificada (7 estados) en Explorer, ficha, trace, journey y termómetro |
| `G-F3D-5` | Conexión a los 7 labs/herramientas por enlace (cero duplicidad), routeMap intacto |
| `G-F3D-6` | Sin commits · HEAD `18b95b1` intacto · working tree solo documental |

Aprobado F3D ⇒ se habilita **F3E (Knowledge Integration: envoltura de evidencia, docsBySignal, búsqueda marcada DISEÑO)** con orden explícita.

---

## 16. Resultado final — Las señales, ciudadanas de primera clase

| Criterio de la misión | Cómo lo cumple F3D |
|---|---|
| Usuario navega señales | Entrada por familia/concepto → Explorer → ficha → acciones (§2, §5, §8) |
| Laboratorios = herramientas | Labs aparecen solo como destino de N4, por enlace (§14) |
| Audio/RF/Temp/Humedad/Robot/Video/Bioacústica/Vibración/Imágenes/Datos IA | Cada familia tiene camino de navegación propio (§2.1) con la misma mecánica |
| La señal sigue siendo el centro | Registry como modelo de datos (§4) · trace/journey por señal (§6-§7) · honestidad en cada píxel (§13) |
| Sin romper nada | Lexplorer **lee**; ningún lab se duplica ni se reescribe (§14, §9-§11) |
| Preservar historia | S-IDs, rutas, routeMap y registry intactos (§13 mapas) |

**Estrategia en una frase:** F3D convierte el Signal Registry en una **Mapa de Navegación Vivo** donde el usuario entra por la señal, la inspecciona (ficha), la sigue (trace/journey), la modela, la lleva a IA, la registra en KH y la pregunta al ACP — **con los laboratorios como herramientas a las que la señal les pierde el miedo a ser navegada.**

---

## 17. Honestidad final y próximo paso

- **Lo que F3D no hace:** no implementa el Explorer, no toca código, no modifica componentes, no hace commits.
- **Estado real de señales navegables hoy:** S30 (mic, real-local), S10/S11 (temp/humedad, real), S50 (robot, real, cliente roto), S03 (clima, real-local externa), S60 (imagen/IA, real), S70/S71 (dataset, histórica), resto SIM/DISENO — todo ello ya leíble por el Explorer sin un solo cambio de código.
- **Prerrequisitos de implementación:** gates F3C (G-F3C), saneo R1-R3 de F3A, y **misión explícita F3D de implementación**.
- **Próximo entregable documental:** ninguno adicional salvo orden de Bernardo.

---

*Fin de la estrategia F3D v1 — en el CMSC, la señal es el ciudadano: se encuentra, se traza, se modela, se interpreta y se registra — y los laboratorios son sus herramientas. NO REEMPLAZAR · NO REESCRIBIR · NO BORRAR · SOLO ORGANIZAR, CONECTAR, EVOLUCIONAR.*