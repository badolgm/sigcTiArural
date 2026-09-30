# SIGCTiArural · CMSC — F4 Arquitectura del Agente Científico Principal ACP (v1)

| Campo | Valor |
|---|---|
| Estado del documento | **DISEÑO v1 · Arquitectura conceptual** — sin implementación |
| Fase | **F4 (Agente Científico Principal ACP)** del roadmap CMSC (F3C→F3D→F3E→F4) |
| Fecha | 2026-09-27 |
| Rama | `feature/ubtn-biological-telemetry` (HEAD `18b95b1`, sin commits) |
| Modo | SOLO DISEÑAR Y DOCUMENTAR — NO implementar, NO commits, NO frontend, NO backend, NO IA, NO agentes, NO frameworks |
| Documentos base | F3A (puertos) · F3B (Registry, Lifecycle, Governance, Confidence) · F3C (Dashboard, ACP inerte) · F3D (Explorer, Trace, Journey, `/cmsc/acp`) · F3E (Evidence Ledger, Hangar de Autenticidad, diet) | 
| Regla de oro | **ACP NO es un chatbot. ACP NO es GPT/Claude/Copilot. ACP ES el ORQUESTADOR CIENTÍFICO DEL ECOSISTEMA.** |

---

## 1. Propósito y alcance de F4

F3A-F3E cerraron el ecosistema de contexto: **productores, señales, Signal Registry, Journey, Explorer, labs, Evidence Ledger, Knowledge Hub y Knowledge Graph** ya tienen su estrategia. F4 diseña por completo el **Agente Científico Principal ACP**: el orquestador que conecta todas esas capas para **responder, explicar y recomendar sobre señales y conocimiento reales, sin inventar nada y sin depender de un único proveedor de IA**.

### 1.1 Regla de oro desglosada
- **ACP NO es un chatbot**: no es un bloque de conversación; es una **arquitectura de orquestación** con contratos, honestidad y verificación.
- **ACP NO es GPT/Claude/Copilot**: no usa un LLM como **fuente de verdad**; el LLM, como mucho, es un **redactor opcional** limitado por anclas.
- **ACP ES el ORQUESTADOR CIENTÍFICO**: delega, verifica, compone y presenta — leyendo capas, sin poseer datos.

### 1.2 Qué NO hace F4
- NO crea agentes, NO instala frameworks, NO toca frontend/backend/IA/labs.
- NO implementa el slot de intérprete ni conecta proveedores.
- NO escribe al KH ni al registry; el ciclo productor sigue siendo F3E (ledger → gobernanza).

---

## 2. Q1 — ¿Qué es ACP?

**ACP = Orquestador Científico del Ecosistema**: el componente lógico que recibe una **intención del usuario** sobre el ecosistema (texto o voz), la descompone en **preguntas de dominio**, delega en **sub-agentes especializados**, verifica cada hallazgo contra **señales reales, evidencias y documentos**, compone una **respuesta anclada y honesta** y, si corresponde, **deja nueva evidencia** bajo el ciclo gobernado de F3E.

Características esenciales:
1. **Orquestador, no oráculo**: decide el *camino* de consulta; no decide la *verdad*.
2. **Capas de lectura + verificación**: todo lo que dice queda anclado a una fuente de la capa (signal_id, evidence_id, doc_id).
3. **Agnóstico de proveedor**: el "intérprete" del orquestador es un **slot intercambiable** con modo determinista de línea base (§16).
4. **Extensión por dominios**: 6 agentes expertos siguen el catálogo científico CMSC (§6), no conversación libre.
5. **Siempre honesto**: estados REAL/SIM/DISEÑO/ROTO/HUÉRFANO se muestran tal cual (§8-§10).

---

## 3. Q2 — ¿Qué NO es ACP?

| Afirmación | Realidad ACP |
|---|---|
| Chatbot libre de temas | Solo responde sobre el ecosistema y sus señales |
| Fuente de verdad | **La fuente de verdad es el KH + Registry + Ledger**; ACP solo compone |
| Productor de conocimiento espontáneo | Su conocimiento es evidencia sustentada, nada espontáneo |
| Sustituto de labs/herramientas | **Orquesta**; el lab sigue siendo la única casa de la señal |
| Monolito acoplado a un LLM | Slot intercambiable; resiste plan sin proveedor (§16) |
| Escriba directo del KH | Sigue el ciclo F3E (ledger → gobernanza) |
| Dueño de datos | Usuario y ecosistema; el ACP es transparente y efímero |
| Decide por el usuario | **Ayuda a decidir** con evidencia; la decisión es del usuario |
| Omnisciente | Conoce límites y dice "no tengo evidencia" cuando es preciso |

---

## 4. Q3 — Qué consume ACP

Consumo **por lectura** (read-only sobre las capas) y **por contrato** (§7):

| Input | Descripción |
|---|---|
| Intención del usuario | texto/voz normalizada (pregunta, orden, escenario) |
| Signal Registry | inventario S-IDs, estados honestos, clase, dominio, confidence |
| Evidence Ledger | evidencias (evidencia reproducible y traza) |
| Registry KH / `docsBySignal` | documentos y su relación con señales (F3E) |
| Knowledge Graph proyección | nodos y aristas por lectura (no duplicado) |
| Mapa modelo↔señal | qué IA interpreta qué señal (F3B) |
| Capacidades/estado de labs | qué puede y qué no cada lab, qué señales le tocan |
| Contexto de sesión | historial acotado de la conversación científica |
| Preferencias de rol del usuario | rol (investigador/operador), idioma, profunidad |

---

## 5. Q4 — Qué NO consume ACP

| NO consume | Motivo |
|---|---|
| Datos no registrados sin estado honesto | violarían el envelope de señal (F3B) |
| Inferencias IA sin confidence/class | no verificables |
| Contenido fuera del registry KH | no es conocimiento del ecosistema |
| Respuestas de otros LLM como verdad | solo contexto auxiliar, jamás fuente |
| Fabricaciones o aserciones sin ancla | regla de oro §8 |
| Streams en vivo sin metadatos | inciertos de estado/procedencia |
| Memoria infinita | sesión acotada, sin biografía persistente |
| Dashboard/UI como evidencia | UI es presentación, no fuente |

---

## 6. Q5 — Qué información obtiene de cada constructo

| Constructo | Qué aporta al ACP | Rol en la orquestación | Honestidad aplicada |
|---|---|---|---|
| **Signal Registry** | S-IDs, estados, clases, dominios, confidence | inventario; qué preguntar | estado expuesto siempre |
| **Signal Explorer** | ficha de señal + anclas + evidencias | localizar y precisar la señal | confidence/unidad visible |
| **Signal Trace** | etapas del Lifecycle (F3B) por señal | qué pasos ya ocurrieron | etapas huecas honestas |
| **Signal Journey** | panorama productor→cauce→labs→IA→KH→ACP | contextualizar el viaje completo | pasos DISEÑO señalados |
| **Knowledge Hub** | docs canónicos + `docsBySignal` | sustento documental de aserciones | cita `doc_id` |
| **Evidence Ledger** | evidencias con traza y veredicto | prueba reproducible de lo afirmado | `evidence_id` + status |
| **Labs** | capacidades, señales de su competencia, límites | saber a quién delegar y qué no prometer | estado ROTO/DISEÑO |

---

## 7. Q6 — Arquitectura multiagente

```
 USUARIO (texto/voz)
    │
    ▼
  +---------------------+
  |   ACP ORQUESTADOR   |   router · agenda · verificador · compositor · honestidad
  +---------------------+
    │            (delega por dominio, con contrato §7)
    ▼
  +---------------------------------------------------------------------------+
  | Sustratos de dominio (sub-agentes consultores, NO ejecutan labs)          |
  |                                                                            |
  |  Agente Matemático       Agente Electrónica       Agente IA                |
  |  Agente Señales          Agente Física            Agente Investigación     |
  +---------------------------------------------------------------------------+
    │
    ▼  verifican contra (read-only)
  Registry · Ledger · KH · Graph (proyección) · Labs · Mapa modelo↔señal
```

### 7.1 Papel de los sub-agentes
Cada agente es una **interfaz de dominio** que interpreta y valida dentro de su especialidad: **no ejecuta** el lab, no abre puertos, no escribe — solo **consulta, cruza y devuelve hallazgos anclados** al orquestador.

| Agente | Dominio | Ejemplo de pregunta | Fuentes que consulta |
|---|---|---|---|
| Agente Matemático | transformadas, modelos, series, PSD, Fourier | "¿qué tendencia muestran las series S10?" | MathV2, AdvancedMathLab |
| Agente Señales | registry, trace, journey, streams | "¿qué estado tiene la señal S30?" | Signal Registry, Explorer, Trace |
| Agente Electrónica | circuitos, sensores, THD, telecom | "¿qué muestra el circuito de S32?" | ElectronicsLab, TelecomLab |
| Agente Física | fenómenos, magnitudes, unidades, bioacústica | "¿qué frecuencia típica tienen las abejas?" | mapa de señales, S35 |
| Agente IA | modelos, benchmarks, inferencias IA | "¿qué dice el modelo M2 sobre S71?" | AIPredictiva, manifiestos M1/M2 |
| Agente Investigación | KH, literatura, experimentos, gobernanza | "¿qué evidencias sustentan X en KH?" | registry KH, Evidence Ledger |

---

## 8. Q7 — Contratos

### 8.1 Contrato de tarea (ACP → sub-agente)

```
 task_id            · identificador de la sub-tarea
 intencion_normal   · objetivo canónico del usuario
 referencias        · señal_ids, doc_ids, evidence_ids pertinentes
 scope              · dominios permitidos (matematica, senales, ...)
 profunidad         · saltos en el grafo 1 ó 2
 honestidad_base    · estados/confidence que se DEBEN respetar (heredados)
 idioma             · idioma del usuario
```
Envelope de entrada tipo F3E: `task = {tarea, referencias, scope, profunidad, honestidad, idioma}`.

### 8.2 Contrato de resultado (sub-agente → ACP)

```
 status             · RESOLVED | PARTIAL | NO_DATA | BLOCKED
 hallazgos          · [{tipo: señala/evidencia/doc, id, contenido_resumen}]
 confidence         · heredada (nunca sube de la fuente; puede bajar)
 method             · técnica/versión usada para el hallazgo
 limites            · qué NO pudo verificar
 estado_honesto     · consolidado del subconjunto usado
 siguiente_sugerido · pasos que el ACP puede ofrecer al usuario
```

### 8.3 Contrato de respuesta final (ACP → usuario)

```
 intencion          · qué pregunta se está respondiendo
 veredicto          · RESOLVED | PARTIAL | NO_DATA | BLOCKED | UNANSWERABLE
 respuestas         · afirmaciones + ancla por afirmación
 confianza_total    · mínimo honesto del conjunto (§9)
 honestidad         · estado de cada señal/evidencia/doc citado
 next_steps         · acciones clicables (Explorer, Journey, KH, lab)
 disclaimer         · qué no se pudo saber y por qué
```

---

## 9. Q8 — Reglas de honestidad

El ACP **jamás puede**: **inventar señales, inventar evidencias, aumentar confianza.**

| Regla | Enunciado |
|---|---|
| H-1 | Solo cita `signal_id` existentes en el Registry |
| H-2 | Solo cita `evidence_id` existentes en el Ledger |
| H-3 | Solo cita `doc_id` existentes en el Registry KH |
| H-4 | **Nunca sube confidence**; como máximo la hereda; puede bajarla por límites |
| H-5 | Toda afirmación factual lleva ancla, o no existe |
| H-6 | Estado `DISENO`/`SIM`/`ROTO`/`HUERFANO` se declara en la respuesta |
| H-7 | No causalidad sin arista del grafo/evidencia: "sospecha" ≠ "causa" |
| H-8 | Errores del redactor se detectan en verificación determinista (anclas existentes) |
| H-9 | No promete precisión inexistente; "no sé" con explicación es válido |
| H-10 | Preferencias: disponible y efectividad, no memorias fabricadas |

Umbral de violación H = el ACP **descarta la afirmación** o responde `NO_DATA`.

---

## 10. Q9 — Sistema de confianza

Confianza del ACP = **propagación conservadora** desde las fuentes:

```
 C(respuesta) = MIN( C_fuente de cada ancla usada ) × cobertura × penalidad

 cobertura    = nº de anclas independientes que la sustentan (1..k)
 penalidad    = factor < 1 si algún ancla proviene de estado no-REAL
```

| Banda | Valor | Significado |
|---|---|---|
| ALTA | 0.85..1.00 | anclas REAL/REAL-LOCAL múltiples y verificadas |
| MODERADA | 0.60..0.84 | anclas reales únicas o mixtas |
| BAJA | 0.30..0.59 | evidencias parciales, modelos en challenger |
| SIN CONFIANZA | < 0.30 / sin ancla | cae a `NO_DATA`/`DISEÑO` según el caso |

- **Termómetro del ecosistema** (F3C): el ACP muestra el mínimo del conjunto usado, no la media.
- **Deltas**: si los sub-agentes discrepan, la confianza baja al mínimo honesto y se expone el conflicto.
- **Degradación automática**: falta de ancla ⇒ `DISEÑO/no-data`.

---

## 11. Q10 — Respuestas sin evidencia

Plantilla honesta de respuesta cuando no hay evidencia:

```
 "No tengo evidencia registrada para [intencion]."
  · Qué se buscó:  registry KH, Evidence Ledger, Graph, labs relevantes
  · Qué existe cerca: [señales/doc/evidencias vecinos, si los hay]
  · Qué falta para responder: [experimento, señal, misión, dato pendiente]
  · Sugerencia: [enlaces a Explorer/Journey/KH para explorar, o registro de
    un experimento gobernado]
  · Veredicto: NO_DATA
```

Veredictos especiales:
| Veredicto | Condición |
|---|---|
| NO_DATA | sin anclas, pero dominio localizable |
| PARTIAL | hay anclas pero faltan datos decisivos |
| BLOCKED | depende de una fuente no disponible (p. ej. RobotTelemetry ROTO) |
| UNANSWERABLE | pregunta fuera del ecosistema (se indica, sin rellenar) |

**Autolimitación extra**: conocimiento general no verificado en SIGCTiArural solo se menciona **como aislamiento explícito**, nunca como respuesta.

---

## 12. Q11 — Integración futura con Texto, Voz, KH y Dashboard CMSC

| Canal | Integración | Fase |
|---|---|---|
| **Texto** | entrada en `/cmsc/acp`; respuesta compuesta con anclas clicables | F4B |
| **Voz** | `VoiceAssistant` como **canal de voz del ACP**: captura audio → transcripción → pregunta al ACP → texto de respuesta → TTS (véase Q13) | F4B |
| **Knowledge Hub** | lectura en vivo de registry + `docsBySignal`; el ACP abre docs en el visor KH | F4B |
| **Dashboard CMSC** | panel `/cmsc/acp` integrado a la cinta del río: interpretación del estado global (termómetro, brechas de evidencia, top-señales) | F4C/D |

Regla F4-1: **todas las integraciones son aditivas y por lectura; el canal no añade fuente de verdad.**

---

## 13. Q12 — Navegación ACP

1. **Entrada**: vista `/cmsc/acp` (preventa) y preguntas desde Explorer ("preguntar al ACP sobre esta señal" con prefill).
2. El ACP **navega las capas internamente** por contratos read-only (Registry→Trace→Journey→Evidencia→KH) y entrega **breadcrumbs de referencia** al usuario.
3. Respuesta final con **rutas clicables**: a las vistas (Explorer, Trace, Journey, KH, lab involucrado).
4. **Navegación inversa**: desde Explorer/Journal/KH → prefill de pregunta al ACP conservando el contexto de señal/doc.
5. Voz: flujo hands-free por VoiceAssistant; el ACP devuelve la ruta como lectura por TTS.

---

## 14. Q13 — ACP vs VoiceAssistant

| Dimensión | VoiceAssistant (hoy) | ACP (diseño F4) |
|---|---|---|
| Naturaleza | cliente de voz thin: graba WEBM → POST `/assist` (ai_service 8081) → reproduce audio | orquestador científico multiagente |
| Fuente de verdad | servidor de IA del canal | Registry + Ledger + KH + Graph |
| Honestidad | no gestiona estados | estados REAL/SIM/DISEÑO/ROTO/HUÉRFANO siempre explícitos |
| Dominio | canal de audio | capas de señales/evidencia/conocimiento |
| Relación | canal de entrada/salida de voz del ecosistema | consumidor del canal; nunca lo sustituye |
| Estado | **funcionando** (5174) | **diseño** en `/cmsc/acp` (vista inerte, fallback preservado) |

**Conclusión**: VoiceAssistant no se reemplaza; se **conecta como canal** (audio→texto→ACP→texto→TTS). El ACP es lógica de orquestación; VoiceAssistant es interfaz de voz.

---

## 15. Q14 — Escenarios

| Escenario | Pregunta | Agentes | Fuentes | Respuesta honesta tipo |
|---|---|---|---|---|
| **Abejas** (bioacústica UBTN S35) | "¿qué patrón de actividad hay?" | Física + Señales + IA + Investigación | S35, espectros, literatura KH | patrón descrito si hay evidencia; si no, `NO_DATA` + qué experimento falta |
| **RF** (S34) | "¿qué señales RF encontramos?" | Electrónica + Física + Señales | S34, TelecomLab | bandas si han sido modeladas; si no, declara `DISEÑO` |
| **Telemetría** (S10/S11) | "¿una alarma de temperatura?" | Señales + Matemático + IA | S10/S11, PSD, reglas | alerta con confidence heredada; umbrales reales si están registrados |
| **Robótica** (S50) | "¿qué envía el robot?" | Señales + Electrónica | RobotTelemetry | **estado ROTO del cliente** (localhost:8000) declarado; sin fabricar telemetría |
| **Agricultura** (S60/S70) | "¿qué recomienda el modelo IA?" | IA + Investigación | dataset V2, M1/M2 | modelo degenerado (colapso clase 0) señalado; no recomienda clase no válida |
| **Investigación** (S75-S78) | "¿qué modelo es mejor?" | IA + Investigación | manifiestos M1/M2, gobernanza | presenta ambos, **no elige**; decisión `PENDIENTE` respetada |

---

## 16. Q15 — Roadmap hacia el ACP implementable

```
 F4A  Núcleo orquestador (sin LLM)
      router determinista · contratos · capas read-only · honestidad H1-H10
      respuestas ancladas con Registry/Ledger/KH · veredictos NO_DATA etc.
      (funciona sin NINGÚN proveedor)
        │ gate G-F4A
        ▼
 F4B  Slot de intérprete agnóstico
      interfaz `Interprete` (texto/voz) · adaptadores intercambiables
      redacción de respuestas limitada por anclas · VoiceAssistant como canal
        │ gate G-F4B
        ▼
 F4C  Agentes de dominio completos + ciclo productor
      6 agentes con fuentes deep · interpretación de la capa · nueva evidencia
      al Ledger (gobernada) · integración en Dashboard CMSC
        │ gate G-F4C
        ▼
 F4D  Navegación y decisiones
      multi-salto en Graph · cierre de escenarios · ACP = asesor de decisiones
      con evidencias completas · memoria de sesión acotada
```

---

## 17. Q16 — Gates de implementación

| Gate | Criterio verificable |
|---|---|
| `G-F4A-1` | orquestador responde por anclas SIN LLM; fixture "inventar señal" se rechaza |
| `G-F4A-2` | fixture "inventar evidencia" se rechaza; fixture "subir confianza" se rechaza |
| `G-F4A-3` | capas conectadas **solo en lectura**: registry, ledger, KH, labs (read-only) |
| `G-F4A-4` | ningún commit · ninguno de los frameworks se instala aún |
| `G-F4B-1` | interfaz `Interprete` definida; al menos un adaptador cambiable por config |
| `G-F4B-2` | respuesta redactada no excede las anclas (verificación automática) |
| `G-F4B-3` | VoiceAssistant conectado como canal de voz (sin cambiar App.jsx de forma sustantiva) |
| `G-F4C-1` | 6 agentes con fuentes deep y contratos cumplidos ida/vuelta |
| `G-F4C-2` | ciclo productor: interpretación→ledger→gobernanza (jamás escritura directa KH) |
| `G-F4D-1` | navegación multi-salto y paneles `/cmsc/acp` en Dashboard (aditivos) |
| `G-F4D-2` | escenarios (abejas/RF/telemetría/robótica/agricultura/investigación) responden honestos |
| `G-F4D-3` | sin dependencia de proveedor único: el ecosistema funciona en modo sin-LLM |

---

## 18. Resultado final — Pregunta síntesis

**¿Cómo puede existir un Agente Científico Principal capaz de navegar el ecosistema completo sin destruir la filosofía CMSC y sin depender de un único proveedor de IA?**

**(a) Sin destruir la filosofía CMSC**
- El ACP **orquesta, no posee**: Registry, Ledger, KH y Graph siguen siendo la fuente de verdad intocable (F3E: hangar de autenticidad).
- Se construye sobre F3A-F3E por **adición y lectura**; los labs y componentes se conservan (envolver y conectar, jamás sustituir).
- **Honestidad invariante**: estados y confidence se heredan y exponen; lo no real se declara REAL/SIM/DISEÑO/ROTO; lo no sabido se dice.
- El ACP **produce evidencia bajo gobernanza**, nunca verdad espontánea — el ecosistema mantiene la cadena señal→evidencia→conocimiento→contexto.

**(b) Sin depender de un único proveedor de IA**
- El núcleo del ACP es **determinista** (F4A): router, contratos, honestidad y verificación por anclas funcionan **sin LLM**.
- El "intérprete" es un **slot intercambiable** (interfaz `Interprete`): el redactor puede ser null (respuestas honestas y ascéticas con anclas), un proveedor interno, u otro — configurable, sin acoplamiento.
- **Agnosticismo total del MASTERPLAN**: señal, evidencia y conocimiento son agnósticos de hardware/software/modelo; el ACP presenta, no decide por el proveedor.
- Fallback preservado: si el proveedor falla, el modo sin-LLM responde con veredictos `NO_DATA`/`PARTIAL` y rutas clicables — **el ecosistema sigue siendo útil e íntegro**.

**Criterio de éxito**: ACP consumirá *Señales → Evidencias → Conocimiento → Contexto* y ayudará al usuario a decidir con aserciones ancladas, **sin inventar nada** y manteniendo la honestidad del ecosistema SIGCTiArural.

---

## 19. Honestidad final y próximo paso

- **Lo que F4 NO hace**: no implementa; no crea agentes o frameworks; no toca frontend/backend/IA/labs; no hace commits.
- **Estado real**: F3E/EI motivan candidatura; el ACP vive solo en diseño; `/cmsc/acp` es una vista inerte con fallback de voz preservado; M1 vs M2 `PENDIENTE`.
- **Prerrequisitos de implementación**: gates F3C/F3D/F3E + saneo R1-R3 de F3A + **misión explícita** de Bernardo para F4A.
- **Próximo entregable**: ninguno documental adicional salvo orden explícita.

---

*Fin de la arquitectura conceptual F4 v1 — ACP es el ORQUESTADOR CIENTÍFICO: lee el ecosistema, verifica con anclas, responde honesto y queda sin acoplamiento. NO ES CHATBOT · NO ES GPT · NO ES CLAUDE · NO ES COPILOT · ES EL ORQUESTADOR.*