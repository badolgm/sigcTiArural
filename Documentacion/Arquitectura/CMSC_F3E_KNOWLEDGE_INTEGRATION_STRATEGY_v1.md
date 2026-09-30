# SIGCTiArural · CMSC — F3E Estrategia de Integración del Conocimiento (Blueprint v1)

| Campo | Valor |
|---|---|
| Estado del documento | **DISEÑO v1 · Arquitectura de conocimiento** — sin implementación |
| Fase | **F3E (Knowledge Integration)** del roadmap CMSC (F3C→F3D→F3E→F4) |
| Fecha | 2026-09-27 |
| Rama | `feature/ubtn-biological-telemetry` (HEAD `18b95b1`, sin commits) |
| Modo | SOLO DISEÑAR Y DOCUMENTAR — NO implementar, NO modificar código, NO commits, NO tocar componentes |
| Documentos base | `CMSC_F3A_*` (puertos, docsBySignal) · `CMSC_F3B_*` (Registry, Lifecycle, Governance, Confidence) · `CMSC_F3C_*` (Knowledge Navigation, envoltura) · `CMSC_F3D_*` (Explorer, Trace, Journey) · `CMSC_SIGNAL_MAP_v1` (S01..S80) · registry KH (51 docs, 6 categorías) |
| Regla final | **NO REEMPLAZAR · NO DUPLICAR · NO REESCRIBIR · SOLO CONECTAR EL CONOCIMIENTO YA EXISTENTE** |

---

## 1. Propósito y alcance de F3E

Las fases previas conectaron **productores, señales, navegación, labs e IA**. Falta la conexión oficial con el **Knowledge Hub**: diseñar el puente por el que **una señal se convierte en conocimiento, el conocimiento en evidencia, la evidencia alimenta al ACP y el ACP ayuda al usuario** — sin duplicar, sin reescribir y sin reemplazar el KH real (registry de 51 docs, 6 categorías, visor MVP).

### 1.1 El vacío que cierra F3E
El hallazgo original del RESTRUCTURING_PLAN y de F3A (§5/Q5, §7): **la columna KH del ecosistema está vacía** — ningún laboratorio escribe en el KH hoy. El registry es un **grafo de lectura**, no un destino de escritura. F3E diseña la **arquitectura de escritura controlada** (evidencia) que cierra esa columna **sin contaminar** el contenido canónico.

### 1.2 Qué NO hace F3E
- NO implementa la escritura al registry, el grafo ni el ACP.
- NO modifica `knowledgeRegistry.generated.json` ni `KnowledgeHubLayout`.
- NO crea un segundo KH.
- NO cambia categorías ni borra docs.

---

## 2. Q1 — ¿Cómo nace un conocimiento?

El conocimiento **no nace por decreto**: nace como **subproducto verificable de la cadena señal → evidencia → registro**. La cadena tiene 4 eslabones conceptuales:

```
 SEÑAL          estado honesto + clase + dominio + confidence (F3B)
   │  (network Trace/Journey de F3D)
   ▼
 EVIDENCIA      artefacto reproducible atado a señal_id + traza + timestamp
   │  (Q2)
   ▼
 CONOCIMIENTO   interpretación organizada: doc/registro del KH que la sustenta
   │  (Q3)
   ▼
 CONTEXTO       el ACP y el usuario consumen el conocimiento para decidir/actuar
```

### 2.1 Grados de conocimiento (escala honesta)

| Grado | Naturaleza | Dónde vive |
|---|---|---|
| **Dato** | señal cruda o transformada | puertos / labs |
| **Evidencia** | artefacto reproducible (espectro, métrica, inferencia, log) | Evidence Ledger (§3/§5) |
| **Conocimiento** | interpretación organizada y verificable | registry KH (docs canónicos) |
| **Contexto** | respuesta del ACP con traza y anclas | `/cmsc/acp` (F4), fallback hoy |

Regla F3E-1: **el conocimiento solo sube de grado si es reproducible y traza su señal de origen**; lo que no es reproducible permanece evidencia o dato, jamás se infla a documento.

---

## 3. Q2 — ¿Cómo una señal genera evidencia?

### 3.1 Definición de evidencia
**Evidencia** es un artefacto que (a) se produce a partir de una o más señales, (b) es **reproducible** (datos + método + versión), y (c) lleva **traza** (señal de origen, estado honesto, confidence, timestamp, puertos recorridos).

### 3.2 Tipos de evidencia que puede generar una señal

| Tipo | Ejemplo | Señal típica | Clase resultante |
|---|---|---|---|
| Espectro/transformada | FFT mic, espectrograma, wavelets | S30, S35 | GENERADA / REAL-LOCAL |
| Métrica derivada | f0, SNR, ancho de banda, THD | S30, S37, S34 | GENERADA |
| Serie/modelo paramétrico | ajuste de curva, PSD | S10/S11, S50 | MODELADA |
| Inferencia IA | diagnosis + confidence + source_mode | S60, S61 | IA |
| Benchmark/model card | macro-F1, ECE, artefactos M1/M2 | S70-S73 | IA / HISTÓRICA |
| Alerta/umbral | temperatura sobre límite (S65) | S10 | IA (reglas) |
| Experimento | protocolo + resultados reproducibles | S75-S78 | EXPERIMENTAL |
| Documento | análisis, dossier, reseña | S79, S80 | DOCUMENTAL |

### 3.3 Envelope de evidencia (mínimo verifiable)

```
 evidence_id      (identificador único)
 signal_id        (S-ID origen)            · eces de una señal
 status / class   (honestidad + clase)     · heredado de la señal
 trace            (etapas recorridas)      · Lifecycle F3B
 confidence       (Signal Confidence F3B)  · heredada, nunca elevada
 method / version (técnica + versión)      · reproducibilidad
 produced_by      (lab/motor que la creó)  · autoría
 timestamp        (momento de generación)
```

Regla F3E-2: **la evidencia no mejora el estado de la señal** — hereda su `status` y su `confidence` y los muestra tal cual.

---

## 4. Q3 — ¿Cómo llega una evidencia al KH?

### 4.1 El problema: registry = fuente de verdad, no vertedero
El registry (`knowledgeRegistry.generated.json`) es generado y categorizado; **no debe ser escrito de forma ad-hoc** por un lab. F3E introduce la **bifurcación controlada**:

```
 EVIDENCIA generada por labs/IA/experimentos
        │
        ├──► EVIDENCE LEDGER (bitácora de evidencia, destino primario)
        │        · registro ligero de toda evidencia (sin ser doc canónico)
        │        · consultable (Explorer/Trace/Journey)
        │        · jamás toca el registry generado
        │
        └──► HANGAR DE AUTENTICIDAD (revisión)
                 · promoción óptima de evidencia → entrada en registry
                 · gobernanza: qué sube de categoría y cuándo
                 · categorías destino: knowledge-base, research-v2,
                   eiarc-architecture (según la revisión)
```

### 4.2 Reglas de ingreso (ausentismo de duplicidad)
1. El KH **no se reescribe**: la evidencia nueva se registra en el **Evidence Ledger**; el registry actual no se modifica por escritura de labs.
2. La **promoción** de evidencia a documento canónico es **evento de gobernanza** (F3B §14) con revisión de autenticidad.
3. El registry se **regenera** (proceso F3E-Q7/Q12) para incorporar docs canónicos nuevos (como este PDF de la serie CMSC) **manteniendo la integridad** — nunca se edita la salida generada a mano.
4. **Referencias cruzadas** (`docsBySignal`) se derivan por lectura (registry + mapa), no por escritura.

### 4.3 Flujo completo evidencia→KH (diseño)

```
 lab produce evidencia ──► Evidence Ledger (registro) ──► [revisión]
        │                        │
        │                        ▼
        └──► si es canónica  ──► regeneración del registry ──► visor KH
        └──► si es evidencia ──► consultable por su signal_id (sin doc)
```

---

## 5. Q4 — Signal Registry / Explorer / Trace / Journey ↔ Knowledge Hub

Conexión bidireccional, todo por lectura:

| Constructo F3D/F3B | Rol frente al KH | Referencia |
|---|---|---|
| Signal Registry | índice fuente de la señal; incluye `docsBySignal` | F3B §11 |
| Signal Explorer | muestra, por señal, sus anclas KH (`docsBySignal`) | F3D §5 |
| Signal Trace | la etapa **Conocimiento** del life cycle enlaza a los docs | F3D §6 |
| Signal Journey | terminal del viaje = KH (evidencia documentada) | F3D §7 |
| Knowledge Hub (real) | destino de evidencia, fuente de contexto | registry 51 docs |

### Mecanismo
1. `docsBySignal(signal_id)` = intersección de registry (docs) y mapa (señal) — única fuente.
2. En la ficha de señal: bloque "**Evidencia**" con (a) docs asociados y (b) evidencias del ledger (sin doc canónico aún).
3. En el visor KH: cada doc expone "**Señales relacionadas**" (derivado, no escrito).
4. **Nunca se escriben punteros en ambos lados**: la relación vive en una vista derivada.

Regla F3E-3: **el KH es neutro; F3E le añade contexto sin cambiar su contenido.**

---

## 6. Q5 — Qué artefactos deben registrarse

Inventario de artefactos que merecen registro (por categoría KH existente):

| Categoría KP | Artefactos registrables |
|---|---|
| `project-core` | README, MASTERDOC, plan maestro (ya presentes) |
| `eiarc-architecture` | planes de arquitectura (serie CMSC_F3x), forenses, mapas |
| `eiarc-foundation` | fundamentos EIARC, identidad, conexiones |
| `research-v2` | resultados de investigación, benchmarks, líneas IA |
| `knowledge-base` | evidencias de labs promocionadas, resúmenes |
| `historical` | telemetría histórica documentada, legado 5173 |

### Artefactos mínimos por tipo de señal (Q5 respuesta)

| Produto señal | Artefacto a registrar |
|---|---|
| Señal acústica (S30) | espectro/feature + método + versión de WebAudio |
| Eléctrica (S32/S33) | simulación + solver + THD |
| Temperatura/Humedad (S10/S11) | serie + PSD + resumen de período |
| IA imagen (S60) | inferencia + confidence + modelo + scope |
| Benchmark (S70-S73) | dataset card + split + modelo + métricas |
| Experimento (S75-S78) | protocolo + resultados + entorno |

Regla F3E-4: **todo artefacto entra al ledger con su envelope de evidencia (§3.3)**; solo algunos ascienden a doc canónico (§4).

---

## 7. Q6 — Cómo se documentan experimentos

### 7.1 Formato de experimento (diseño, compatible con research_v2 y hackathons)

```
 EXPERIMENT_ID
 objetivo         · pregunta científica clara
 señales          · S-IDs de entrada + estados honestos
 método           · técnica + versión (FFT, CNN, modelo paramétrico...)
 entorno          · software, versión, hardware, seed (reproducibilidad)
 resultados       · métricas + artefactos (plot, json, tensor)
 concluyencia     · interpretación + límites (qué no cubre)
 veredicto        · APROBADO / RECHAZADO / PARCIAL · gobernanza
 relación         · dónde más culmina (issue, doc, manifiesto)
```

### 7.2 Flujo de documentación del experimento
1. El experimento se especifica **antes** (protocolo visible).
2. Se ejecuta produciendo **evidencia** (ledger).
3. La revisión de autenticidad (F3E-T) decide: promueve a `research-v2`, a `knowledge-base`, o queda como evidencia.
4. Si promueve → se integra en la regeneración del registry (cada experimento aprobado enriquece el grafo, no reemplaza nada).

Regla F3E-5: **un experimento sin señales de origen, sin método reproducible o sin veredicto no es conocimiento**: se conserva como evidencia.

---

## 8. Q7 — Cómo conectar M1, M2 y M3 futuros con el KH

### 8.1 Estado científico actual (real, ya documentado)
- **M1 MobileNetV2** = baseline oficial congelado (macro-F1 0.9899 · ECE 0.0313) — artefactos no reconstruibles en disco.
- **M2 EfficientNet-B0** = ejecutado oficialmente como challenger validado (macro-F1 0.9937 · balanced_acc 0.9943 · ECE 0.0332 · weighted-F1 0.9956 · best epoch 32) — artefactos en `runs/M2_efficientnet_b0/`.
- **Decisión final benchmark (M1 vs M2) PENDIENTE**; **M3+ futuros** por definir bajo nueva misión.

### 8.2 Puente benchmark → KH (read + promoción limitada)

| M | Señal(s) | Evidencia | Estado KH hoy | Puente F3E |
|---|---|---|---|---|
| M1 | S72 | manifiesto, dossier MobileNetV2 | research-v2 potencial | enlazable vía `docsBySignal(S72)` |
| M2 | S73 | manifiesto, validation_metrics, M2_VS_M1 | research-v2 potencial | enlazable vía `docsBySignal(S73)` |
| M3+ | (futuro) | nuevo manifiesto + comparativa | — | entrará por el mismo puente |

### 8.3 Mecanismo
1. Los manifold viven en `Documentacion/IA/*` y `runs/*`; el **registry los referencia** (id + canonical_path), no los embebe.
2. La decisión final benchmark (M1 vs M2) se registrará como **evidencia de gobernanza** (ledger) con vínculo a estatus de decisión.
3. La tabla comparativa M1 vs M2 (PENDIENTE) se conecta al KH como `research-v2` cuando exista, sin duplicar métricas en el visor.

Regla F3E-6: **el KH muestra el estado del benchmark (aprobado/challenger/pendiente) como dato de gobernanza, no como resultado inflado.**

---

## 9. Q8 — Cómo conectar TelecomLab, ElectronicsLab y MathLabV2 con KH

### 9.1 Conexión por evidencia (cierra la columna KH vacía del RESTRUCTURING_PLAN)

| Lab | Señal | Evidencia generable | Categoría destino |
|---|---|---|---|
| TelecomLab | S30 (FFT real local) | espectro/features/voz | knowledge-base (local) |
| ElectronicsLab | S32/S33/S37 | simulación + THD + esquema | knowledge-base |
| MathLabV2 | S35 + señales del ecosistema | transformadas, modelos parametrizados | knowledge-base / research-v2 |
| DataScienceLab | datasets/experimentos | análisis con resultado reproducible | research-v2 / knowledge-base |

### 9.2 Mecanismo (sin duplicar el lab)
1. El lab genera la evidencia (misma ejecución que hoy, **más registro en el ledger**).
2. El ledger referencia `signal_id` + `produced_by` + `method` + `status` (env: envelope).
3. La **presentación** no duplica el lab: la evidencia se ve desde Explorer/Trace/Journey (enlaces), el lab sigue siendo la única casa de la señal.
4. Ninguna evidencia de lab **reescribe** `research-v2` sin revisión de gobernanza (§6).

Regla F3E-7: **lab produce → ledger guarda → KH presenta; dos capas, un solo contenido, cero duplicidad.**

---

## 10. Q9 — Cómo construir el Knowledge Graph CMSC

### 10.1 Naturaleza del grafo (declarativo, de lectura)
El **Knowledge Graph CMSC** se **deriva por lectura** de lo existente; no es un nuevo almacén. Nodos y aristas:

| Nodo | Identidad |
|---|---|
| Señal | S-IDs (S01..S80) |
| Evidencia | evidence_id del ledger |
| Documento | doc del registry KH |
| Modelo | M1, M2, M3+ (fichas de benchmark) |
| Lab/herramienta | nombres de labs |
| Productor | producer_id (F3B) |

| Arista | Origen → Destino | Fuente |
|---|---|---|
| `produce` | Productor → Señal | Signal Registry |
| `evidencia` | Señal → Evidencia | Evidence Ledger |
| `documenta` | Evidencia → Documento | promoción gobernada |
| `sustenta` | Señal → Documento | `docsBySignal` |
| `modela` | Modelo → Señal | mapa modelo→señal |
| `usa` | Lab → Señal | `consumers` del registry |
| `reporta` | Doc → Documento (cita) | tags/categorías |
| `impacta` | Documento → ACP/Usuario | (F4) |

### 10.2 Proyección en UI (sin motor de grafo)
- En la ficha de señal: navegación por **nodos vecinos** (docs, evidencias, modelos, labs).
- En el visor KH: cada doc muestra sus **señales relacionadas** y **evidencias asociadas**.
- Filtro "grafo" en el Explorer: expandir vecinos de una señal (recursión de 1-2 saltos).
- El grafo **no se persiste en paralelo**: es una **proyección consultable** sobre registry+ledger+mapa.

Regla F3E-8: **el grafo se consulta, no se duplica — un solo grafo lógico sobre datos ya existentes.**

---

## 11. Q10 — Qué consumirá el ACP

El ACP (F4, hoy diseño) consumirá **solo conocimiento verificado** — la capa de señales + KH, jamás datos sueltos:

### 11.1 Dieta del ACP (input)
| Fuente | Qué aporta |
|---|---|
| Envelope de señal | señal + estado + clase + dominio + confidence (F3B) |
| Signal Registry | qué señales existen y su condición |
| Evidence Ledger | evidencias recientes de esa señal |
| Registry KH | docs que la sustentan (`docsBySignal`) |
| Mapa modelo→señal | qué IA la interpreta |
| Trace/Journey | contexto del ciclo de vida |

### 11.2 Regla de consumo
- **Nunca consume fabricaciones**: si la señal es `DISENO` o no hay evidencia → respuesta `DISENO / no-data`.
- **Confianza acotada por la fuente**: la respuesta consolidada no supera el mínimo de confianza de las señales usadas (F3B §15).
- **Anclas obligatorias**: toda afirmación lleva referencia (`signal_id`, `evidence_id` o `doc_id`) o un `—`.

---

## 12. Q11 — Qué producirá el ACP

### 12.1 Salidas del ACP (diseño F4)
| Producto | Naturaleza | Registro |
|---|---|---|
| **Interpretación** | respuesta consolidada con traza de agentes | se muestra en `/cmsc/acp` |
| **Resumen** | síntesis de evidencias y docs | presentación (no persiste innecesariamente) |
| **Recomendación** | acción sugerida con limite (honestidad) | se registra como evidencia IA |
| **Pregunta abierta** | si falta evidencia, la plantea al usuario | honestidad `DISENO` |
| **Consulta de decisión** | "cambiar a M2" etc. | evidencia de gobernanza |

### 12.2 Ciclo de realimentación (ACP productor)
1. La respuesta del ACP se construye sobre evidencia existente (entrada).
2. Si genera nueva interpretación reproducible → pasa al **Evidence Ledger** como evidencia con `produced_by = acp`, `class = IA`.
3. Solo si el usuario/gobernanza la promueve → se documenta en KH (mismo hangar de autenticidad).
4. **El ACP no escribe al KH directamente**: nunca contamina contenido canónico sin revisión.

Regla F3E-9: **el ACP produce interpretación, el ledger la guarda y el KH la canónica solo por gobernanza.**

---

## 13. Q12 — Roadmap hacia F4

### 13.1 Sub-fases F3E (bajo misión explícita futura)

```
 F3E-1  Evidence Ledger        bitácora ligera de evidencia + envelope (§3)
        · registro de lo que ya producen los labs (sin tocar labs)
 F3E-2  Puente Signal↔KH       docsBySignal en Explorer/Trace/Journey + bloque Evidencia
        · regeneración controlada del registry para docs canónicos nuevos
 F3E-3  Experimentos           protocolo + veredicto + promoción gobernada (§6)
        · M1/M2/M3 conectados por evidencia de gobernanza (§8)
 F3E-4  Knowledge Graph        proyección de lectura (nodos/aristas) en UI (§10)
        · prepara la dieta del ACP (§11) y su ciclo (§12)
```

### 13.2 Gates F3E (verificables por documento y por adjustment)

| Gate | Criterio |
|---|---|
| `G-F3E-1` | Evidence Ledger definido como destino de toda evidencia (sin tocar registry) |
| `G-F3E-2` | puente `docsBySignal` operativo por lectura (Explorer/Trace/Journey ↔ KH) |
| `G-F3E-3` | hangar de autenticidad + regeneración del registry sin escritura manual ad-hoc |
| `G-F3E-4` | M1/M2/M3+ conectados como evidencia de gobernanza, ilusiones PENDIENTE respetadas |
| `G-F3E-5` | Knowledge Graph CMSC definido declarativamente (nodos/aristas, lectura) |
| `G-F3E-6` | ACP: dieta y ciclo definidos; **sin implementación de ACP** |
| `G-F3E-7` | sin commits · HEAD `18b95b1` intacto · working tree solo documental |

Aprobado F3E ⇒ se habilita **F4 (ACP: motor multiagente agnóstico sobre el grafo de conocimiento + superficie texto/voz conectadas, con fallback preservado)** bajo misión explícita.

---

## 14. Resultado final — Una señal se convierte en conocimiento

| Requisito de la misión | Cómo lo cumple F3E |
|---|---|
| Señal → conocimiento | Cadena señal→evidencia→registro→contexto (Q1, Q2) |
| Conocimiento → evidencia | Envelope de evidencia reproducible + trace + confidence (Q2-Q3) |
| Evidencia alimenta ACP | Dieta verificada de la capa de señales + KH + ledger (Q10) |
| ACP ayuda al usuario | Interpretación con anclas, confianza acotada, honestidad (Q11) |
| Sin duplicar | Registry intocable, ledger separado, grafo por lectura (Q3, Q9) |
| Sin reescribir | Hangar de autenticidad + regeneración gobernada (Q3-Q4) |
| Solo conectar lo existente | `docsBySignal`, `consumers`, promoción M1/M2/M3, labs (Q4-Q9) |

**Estrategia en una frase:** F3E convierte el KH en el **corazón de conocimiento del ecosistema** añadiendo un **Evidence Ledger** bajo un **hangar de autenticidad** — para que cada señal deje evidencia verificable, las evidencias sean sublimes como documentos, y el ACP (F4) interprete desde conocimiento real, jamás inventado.

---

## 15. Honestidad final y próximo paso

- **Lo que F3E no hace:** no implementa ledger, grafo, regeneración ni ACP; no toca el registry; no hace commits.
- **Estado real del KH hoy:** 51 docs, 6 categorías (`project-core` 7 · `eiarc-architecture` 13 · `eiarc-foundation` 3 · `research-v2` 18 · `knowledge-base` 6 · `historical` 4); grafo de lectura sin escritura desde labs (columna KH vacía). El puente F3E es **cero código**: solo conecta lo que ya existe.
- **Deuda de conocimiento pendiente (no fabricada):** la decisión M1 vs M2 sigue `PENDIENTE`; M3+ sin definir; búsqueda/RAG del KH como `DISEÑO`.
- **Prerrequisitos de implementación:** gates F3C/F3D + saneo R1-R3 de F3A + **misión explícita F3E de implementación**.
- **Próximo entregable documental:** ninguno adicional salvo orden de Bernardo.

---

*Fin de la estrategia F3E v1 — el conocimiento del ecosistema se conecta, no se inventa: señal → evidencia → registro → contexto, con el KH como fuente de verdad intocable y el ACP como intérprete honesto. NO REEMPLAZAR · NO DUPLICAR · NO REESCRIBIR · SOLO CONECTAR.*