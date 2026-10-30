# DOCKER_BLOCKERS_EXECUTIVE_REVIEW_REPORT

**Misión:** `DOCKER_BLOCKERS_EXECUTIVE_REVIEW`
**Fecha:** 2026-10-30
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `d930a34` · árbol limpio
**Modo:** SOLO DECISIÓN EJECUTIVA. Cero implementación, cero código, cero commits, cero push, cero OCI.

---

## 0. Respuesta directa a la pregunta de la misión

> **N1, N2, N3 y N5 NO son bloqueadores de `DOCKER_READY`.**
> Ninguno de los cuatro impide que el stack oficial de 4 servicios (`db`, `backend`, `ai_service`, `frontend`) arranque, sirva la IA, hable por voz y pase sus healthchecks.
> **Los cuatro pueden ir a backlog.**
> **Pero `DOCKER_READY` sigue siendo `DOCKER_NOT_READY`**, por causas **distintas** a estos cuatro (ver §6 y §8).

Esto es importante: si se cierran N1–N5 y nada más, **el veredicto no cambia**. Cerrarlos daría una falsa sensación de avance.

---

## 1. Marco: qué significa cada gate (para no confundir cuatro cosas distintas)

La confusión de fondo es tratar `DOCKER_READY` como un único gate. Son cuatro:

| Gate | Pregunta que responde | Definición operativa |
|---|---|---|
| **DOCKER OFICIAL** | ¿El stack de 4 servicios arranca y funciona? | `docker compose up` → 4 healthy → IA + voz + KH + dashboard servidos |
| **OCI** | ¿Puede publicarse fuera de la máquina de Bernardo? | imágenes versionadas + secretos reales + `DEBUG=false` + registry/tag |
| **OPERACIÓN DIARIA** | ¿Bernardo puede trabajar mañana sin fricción? | el modo documentado (compose) o el modo dev (5174 + host) |
| **DOCKER_READY (gate formal)** | ¿Podemos *declarar* el despliegue como oficial y reproducible? | F1–F8 + verificaciones G2/G4/G8/G13/G15 + pasada visual |

`DOCKER_READY` es **un gate de despliegue**, no de calidad científica. Esta distinción se desarrolla en §7 (corrección de alcance sobre G-3b).

---

## 2. Tabla maestra de clasificación

### 2.1 Criticidad

| Hallazgo | Criticidad | Razón en una línea |
|---|---|---|
| **N1** Bridge fuera de compose / `127.0.0.1:8766` | **MEDIO** | Herramienta de laboratorio, local-only por diseño; no participa en el arranque ni en la IA ni en la voz |
| **N2** `infer_log.jsonl` sin volumen | **MEDIO** | No rompe nada funcional; sí rompe la trazabilidad de evidencia (regla "NADA DESAPARECE") |
| **N3** `DJANGO_DEBUG=true` | **MEDIO** (local) / **ALTO** (OCI) | Inofensivo en local; inaceptable en cualquier exposición real |
| **N5** `AI_SERVICE_URL` ausente | **BAJO** | Dentro de compose el default `http://ai_service:8081` es **el valor correcto** |
| *(derivado)* **N7** `mode:'real'` hardcodeado en fallback | **MEDIO** | El fallback degradado se narra como "inferencia real". Deuda de honestidad, no de despliegue |

### 2.2 Matriz de impacto por escenario

| Hallazgo | ¿Impide DOCKER OFICIAL? | ¿Impide OCI? | ¿Impide OPERACIÓN DIARIA? | ¿Puede ir a backlog? |
|---|---|---|---|---|
| **N1** | **NO** | **NO** | **SI** — solo si se opera desde **otra máquina** o multiequipo | **SI**, condicionado a declarar la frontera (§6.2) |
| **N2** | **NO** | **NO** | **NO** | **SI** |
| **N3** | **NO** | **SI** | **NO** | **SI** para local · **NO** para OCI |
| **N5** | **NO** | **NO** | **NO** en compose · **SI** en modo híbrido (backend en host) | **SI** |

> **Nota de precisión sobre N1:** `127.0.0.1:8766` **sí funciona** en el escenario normal de una sola máquina, porque el navegador corre en el mismo host que el proceso Node. El fallo aparece **solo** cuando el operador accede desde otro equipo. Eso rebaja N1 de "bloqueador acústico" a "limitación declarada de alcance local".

---

## 3. Análisis individual

### N1 — Bridge no incluido en `docker-compose.yml` · `BRIDGE_URL = 127.0.0.1:8766`

**Qué es realmente:** `tools/cmsc-data-logger/bridge/server.js` es una **herramienta de laboratorio** con `bind 127.0.0.1` deliberado. No es un servicio del producto: es el puente entre el navegador y el motor de ingesta canónico mientras el **Tramo C** (PCM continuo de S30) no exista.

**Por qué no bloquea Docker Oficial**
1. Ningún servicio del compose lo referencia (`depends_on` no lo menciona).
2. La UI degrada **honestamente**: sin bridge muestra `SIN_PUENTE`, no un error.
3. La ingesta productiva ya estaba bloqueada por diseño (Tramo C), no por el bridge.
4. El stack de 4 servicios arranca y opera sin él.

**Por qué sí afecta la operación**
- En Docker, el navegador del operador corre en el host → `127.0.0.1:8766` **resuelve bien** *si* el proceso Node está levantado (`npm run bridge`).
- Desde **otra máquina** (tablet, celular, SENA), `127.0.0.1` apunta al dispositivo del usuario → **no hay puente**. Es una limitación real, pero **consistente con "local-only"**, no un defecto oculto.

**Veredicto:** **MEDIO · no bloquea · backlog SI**, con una condición no negociable: **declarar la frontera** — "Docker Oficial no incluye captura acústica; el bridge es host-local hasta Tramo C". Hoy esa frontera **no está escrita en ningún documento de despliegue**, y esa omisión es peor que el hallazgo.

---

### N2 — `infer_log.jsonl` no persiste

**Qué es realmente:** `fastapi_app.py` escribe en `ROOT_DIR/data/logs/infer_log.jsonl`, dentro del contenedor. Sin volumen, se pierde al recrear.

**Por qué no bloquea**
- La inferencia funciona igual; sólo se pierde el rastro.

**Por qué importa más de lo que parece**
- Contradice el invariante supremo (**"NADA DESAPARECE · TODO SE PRESERVA"**).
- **Hoy no existe ni un solo `infer_log.jsonl` en el host**, lo que confirma que las pruebas manuales de Bernardo generaron evidencia que **se perdió**. Es exactamente el tipo de pérdida que la gobernanza prohíbe.
- Sin log persistido no se puede demostrar *qué* se infirió, con *qué* modelo, ni *cuándo*.

**Veredicto:** **MEDIO · no bloquea · backlog SI**, pero **prioridad alta dentro del backlog** por gobernanza, no por despliegue. Coste de cierre: ~2 líneas de volumen en compose.

---

### N3 — `DJANGO_DEBUG=true`

**Qué es realmente:** un valor en `.env` local (gitignored, no versionado) que `docker-compose.yml:69` propaga al backend.

**Por qué no bloquea Docker Oficial**
- Django arranca y sirve con `DEBUG=true`. Verificado: el compose lo toma como variable, no lo valida.

**Por qué es ALTO para OCI**
- `DEBUG=true` expone tracebacks con rutas, settings y fragmentos de código; cambia el manejo de errores y el serving de estáticos.
- **Ningún despliegue expuesto puede salir con `DEBUG=true`.** Para OCI es un **bloqueador real**.

**Veredicto:** **MEDIO local / ALTO OCI · no bloquea Docker Oficial · bloquea OCI · backlog SI para local, NO para OCI.**

---

### N5 — `AI_SERVICE_URL` ausente + **N7** fallback parcialmente silencioso

**Qué es realmente:** `FastAPIAIAdapter` usa `os.environ.get('AI_SERVICE_URL', 'http://ai_service:8081')`.

**Por qué NO bloquea (y de hecho está bien así)**
- Dentro de compose, `ai_service` **es** el nombre DNS correcto. El default es **exactamente lo que debe ser**. La ausencia de la variable no es un defecto: es una dependencia de un default correcto.
- El fallo sólo aparece si el backend corre **en el host** (fuera de la red compose), donde `ai_service` no resuelve.

**El hallazgo real es otro: N7.** El backend **sí es honesto** (devuelve `source_mode: "fallback"` y `upstream_status`), pero el frontend **no lo narra**:
- `AIPredictiva.jsx:142` → `mode: 'real'` **hardcodeado**.
- `AIPredictiva.jsx:190` → si `info.mode === 'real'`, la voz dice **"Inferencia real finalizada."**

Resultado: cuando el modelo está caído pero no devuelve `error` (respuesta 200 con `source_mode: "fallback"` y `health_state: "unknown"`), la UI **muestra el fallback en el panel técnico** (`source_mode`, línea 555) **pero lo anuncia por voz como inferencia real**. Es una **fuga de honestidad en el canal de voz**, no en el de datos.

**Veredicto:** **N5 = BAJO · no bloquea · backlog SI.** **N7 = MEDIO · no bloquea despliegue · deuda de honestidad de prioridad alta** (el invariante de honestidad de estado es de dominio, no estético).

---

## 4. Q6 — ¿Qué debe resolverse OBLIGATORIAMENTE antes de declarar `DOCKER_READY`?

**Nada de N1/N2/N3/N5.** La lista obligatoria es esta, y sólo esta:

| # | Obligatorio | Por qué es obligatorio | Tipo |
|---|---|---|---|
| **O-1** | **F5 — alinear el serving con el canon** (`AI_CANON_HYBRID`) | El contenedor sirve un `.h5` **HISTÓRICO**; declarar "Docker Ready" sirviendo un artefacto que el canon clasificó como histórico es una contradicción de gobernanza. **Único bloqueador sustantivo.** | Código **o** etiquetado explícito |
| **O-2** | **F6 — G2/G4/G8/G13/G15 en verde** | Sin build formal, migraciones, `/infer` real, imagen limpia y smoke del frontend, "Ready" es una opinión. | Verificación |
| **O-3** | **F1+F2+F3 — tag + `DEPLOYMENT.md` + `compose.resolved.yml`** | "Reproducible" es la definición misma de Ready. **No requiere código.** | Ops/Doc |
| **O-4** | **F7 — pasada visual (16 capturas + DevTools)** | Condición de honestidad ya declarada. Hoy **no ejecutada** (Docker apagado). | Humana |
| **O-5** | **F4 — decisión registry vs OCI** | Bloquea R6 por definición de alcance. | Bernardo |

**Camino de mínimo esfuerzo real:** O-3 (sin código) + O-2 (verificación) + O-4 (humana) + O-1 (**la única con trabajo técnico**) + O-5 (decisión).

---

## 5. Q7 — ¿Qué puede quedar como deuda técnica?

| Deuda | Justificación para diferir | Riesgo aceptado | Disparador obligatorio de pago |
|---|---|---|---|
| **N1** bridge fuera de compose | No participa del stack oficial; el flujo acústico productivo está bloqueado por Tramo C | Sin captura acústica en Docker | **Antes de Tramo C** o de cualquier uso multiequipo |
| **N2** log sin volumen | Funcionalmente inocuo | Pérdida de evidencia de inferencia | **Antes de la primera campaña de captura real** (G-3b) |
| **N3** `DEBUG=true` | Sólo afecta local | Exposición de tracebacks | **Bloqueante absoluto antes de OCI** |
| **N5** `AI_SERVICE_URL` | El default es correcto en compose | Fallback silencioso en modo híbrido | Al documentar el modo dev |
| **N7** `mode:'real'` hardcodeado | No rompe el camino feliz | **Narra un fallback como real** | **Antes de mostrar la IA a terceros** (viola honestidad de dominio) |
| **F8** de-cloud `cloud.js` | Opcional por diseño | Dependencia de hosts externos como fallback | Al desplegar fuera de la red local |

---

## 6. Q8 — Reclasificación

# ❌ DOCKER_NOT_READY (se mantiene)

### 6.1 Justificación explícita

**Se mantiene NO por N1–N5, sino por O-1 a O-5.**

| Causa | ¿Es de los hallazgos N? | Estado |
|---|---|---|
| F5 — serving histórico vs canon | ❌ No | **Abierto** |
| F6 — verificaciones G2/G4/G8/G13/G15 | ❌ No | **Abierto** (requiere runtime) |
| F1/F2/F3 — tag, `DEPLOYMENT.md`, `compose.resolved.yml` | ❌ No | **Abierto** |
| F4 — registry vs OCI | ❌ No | **Decisión de Bernardo** |
| F7 — pasada visual | ❌ No | **Abierto** (Docker apagado) |
| N1/N2/N3/N5 | ✅ Sí | **No bloquean** |

**Test de coherencia:** si mañana se cierran N1–N5 completos, el veredicto **sigue siendo `DOCKER_NOT_READY`**. Eso demuestra que no eran bloqueadores.

### 6.2 Qué cambia en el backlog

**N1–N5 pasan a deuda técnica declarada**, con **una excepción no negociable**: la **declaración de frontera**. No es código, es una frase en `DEPLOYMENT.md`:

> "Docker Oficial comprende `db`, `backend`, `ai_service` y `frontend`. La captura acústica (bridge `127.0.0.1:8766`) es **host-local** y **queda fuera** de Docker Oficial hasta Tramo C. Sin bridge, la UI muestra `SIN_PUENTE` (estado honesto, no fallo)."

Sin esa frase, **N1 no es deuda: es un vacío de alcance**.

### 6.3 Opciones ejecutivas para Bernardo (no ejecutadas)

| Opción | Contenido | Resultado | Coste |
|---|---|---|---|
| **A — Cierre formal completo** | O-1 (ONNX R3+R4) + O-2 + O-3 + O-4 + O-5 | `DOCKER_READY` pleno | Alto (misión de código + verificación) |
| **B — `DOCKER_READY_CONDICIONADO`** | O-3 + O-2 + O-4 + O-5, y **O-1 se cumple por etiquetado**: `/health` y `/infer` declaran `model_status: HISTORICO`, `scientific_scope: binary_only` | `DOCKER_READY` con serving histórico **explícito** | Medio (etiquetado mínimo) |
| **C — Sin cambios** | Nada | `DOCKER_NOT_READY` | Cero |

**Recomendación ejecutiva:** **B**. Cumple la letra del canon (no se sirve un histórico *como si fuera* canónico: se sirve *diciendo* que es histórico), desbloquea R6 sin una misión de código grande, y deja R3+R4 como evolución planificada. La opción A es la correcta a medio plazo; B es la honesta a corto.

---

## 7. Corrección de alcance: G-3b **no** es bloqueador de Docker

En el informe anterior incluí G-3b en la lista de faltantes. **Precisión ejecutiva:**

- **G-3b** (`real_world_holdout_v1` = 0) bloquea **declarar el desempeño del modelo** (99 %/62 % son anecdóticos).
- **No** bloquea que el stack se despliegue. Un sistema puede estar `DOCKER_READY` con un modelo de validez científica pendiente, **siempre que lo declare**.

**Consecuencia:** G-3b sale del gate Docker y pertenece al gate científico. Mantenerlo dentro del gate Docker mezcla dos decisiones y retrasa innecesariamente el despliegue.

---

## 8. Nuevos hallazgos de esta revisión

| # | Hallazgo | Severidad | Naturaleza |
|---|---|---|---|
| **N7** | `mode:'real'` hardcodeado (`AIPredictiva.jsx:142`) narra un fallback como "inferencia real" por voz | **MEDIO** | Honestidad |
| **N8** | Frontera "bridge fuera de Docker" **no escrita** en ningún documento | **MEDIO** | Gobernanza |
| **N9** | Evidencia de las pruebas manuales de Bernardo **perdida** (sin `infer_log.jsonl` en host) | **MEDIO** | Trazabilidad |

N7, N8 y N9 **tampoco bloquean Docker**. Son deuda de gobernanza, y las tres son baratas de pagar.

---

## 9. Veredicto final

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  N1  Bridge fuera de compose        MEDIO   NO bloquea Docker   → backlog     │
│  N2  infer_log sin volumen          MEDIO   NO bloquea Docker   → backlog ⚠   │
│  N3  DJANGO_DEBUG=true              MEDIO   NO bloquea Docker   → backlog     │
│      └─ para OCI                    ALTO    SÍ bloquea OCI      → antes de OCI│
│  N5  AI_SERVICE_URL ausente         BAJO    NO bloquea Docker   → backlog     │
│      └─ N7 fallback narrado real    MEDIO   NO bloquea Docker   → deuda ⚠     │
│                                                                               │
│  BLOQUEADORES REALES:   F5 · F6 · F1/F2/F3 · F4 · F7                          │
│  G-3b:                  NO es bloqueador de Docker (gate científico aparte)   │
│                                                                               │
│  CLASIFICACIÓN:         DOCKER_NOT_READY  (por F1–F7, no por N1–N5)           │
│  OPCIÓN RECOMENDADA:    B — DOCKER_READY_CONDICIONADO (serving histórico      │
│                         etiquetado + O-2/O-3/O-4/O-5)                         │
└───────────────────────────────────────────────────────────────────────────────┘
```

**En una frase:** los cuatro hallazgos son **deuda real pero no bloqueante**; el gate sigue cerrado por **F5 (serving canónico), F6 (verificación), F1/F2/F3 (release reproducible), F4 (decisión) y F7 (pasada visual)** — y la decisión de mayor impacto no es arreglar N1–N5, sino **elegir entre ejecutar R3+R4 (opción A) o etiquetar el serving histórico y declarar `DOCKER_READY_CONDICIONADO` (opción B)**.

**Sin implementación · sin cambios de código · sin commits · sin push · sin OCI.**
