# DOCKER_READY_CONDITIONAL_DECISION_REPORT

**Misión:** `DOCKER_READY_CONDITIONAL_DECISION`
**Fecha:** 2026-10-30
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `d930a34` · árbol limpio
**Modo:** decisión ejecutiva. Sin modificar código, sin commits, sin push.

---

## 0. Veredicto en una línea

> **`DOCKER_READY_CONDITIONAL` es una categoría legítima y es el destino correcto.**
> **Pero no puede declararse hoy**, porque el runtime **no etiqueta el artefacto como HISTÓRICO** y el asistente de voz **lo narra como "inferencia real"**.
> **Hoy = `DOCKER_NOT_READY`.** Con una misión de etiquetado acotada (**L-1..L-6**) pasa a **`DOCKER_READY_CONDITIONAL`**.

Declararlo hoy sin ese etiquetado sería convertir una decisión honesta en un **atajo narrativo**, y eso viola el invariante de dominio.

---

## 0.1 ¿Es legítima la categoría? (criterio de aceptación del propio concepto)

`DOCKER_READY_CONDITIONAL` es aceptable **si y sólo si** cumple los cinco requisitos siguientes. Si falla uno, es `DOCKER_NOT_READY` con otro nombre.

| # | Requisito | Hoy |
|---|---|---|
| C-1 | La condición es **verificable por máquina**, no retórica (`/health` y `/infer` la exponen) | ❌ |
| C-2 | La condición es **visible para el usuario final**, no sólo en el panel técnico | ⚠️ parcial |
| C-3 | La condición está **registrada en el canon** como estado de gate, con dueño y fecha | ❌ |
| C-4 | La condición tiene **caducidad y disparador** de salida (no es permanente) | ❌ |
| C-5 | La condición **no se extiende** a OCI ni a ninguna exposición pública | ✅ (no hay OCI) |

**Hoy: 1/5 cumplidos.** De ahí el veredicto.

---

## 0.2 Lo que el runtime YA declara (crédito donde corresponde)

Esto es importante y no debe ignorarse: el sistema **no está mintiendo** en el canal de datos.

| Dato declarado | Dónde | Valor |
|---|---|---|
| `scientific_scope` | `prediction` (resolver) | `"binary_only"` |
| `semantic_contract_version` | `prediction` | `"v1"` |
| `plant_species` | `prediction` | `"unknown"` |
| `severity` | `prediction` | `"undetermined"` / `"none"` |
| Texto explícito | `recommended_action` | *"El modelo actual solo clasifica condición binaria enferma/sana y no identifica enfermedad específica."* |
| `model_version` | `prediction` | nombre del artefacto (`plant_disease_mbv2.h5`) |
| `source_mode` | envelope | `live` / `simulated` / `fallback` |
| `upstream_status` / `upstream_detail` | `trace` | trazabilidad del salto |

**Conclusión:** la honestidad **semántica** ya está implementada. Lo que falta es la honestidad **de procedencia y de estado**: que el sistema diga *"este artefacto es HISTÓRICO"*, no sólo *"el alcance es binario"*.

---

## 1. Riesgos de declarar `DOCKER_READY_CONDITIONAL`

| # | Riesgo | Severidad | Por qué es real | Mitigación obligatoria |
|---|---|---|---|---|
| **R1** | **Normalización de la excepción**: "condicional" se vuelve permanente y R3+R4 nunca se ejecuta | 🔴 Alta | Es el destino natural de toda excepción sin fecha | **Caducidad dura** en el registro (C-4) + trigger explícito |
| **R2** | **"READY" se lee, "CONDITIONAL" se ignora**: un tercero entiende "listo" | 🟠 Alta | La palabra CONDITIONAL sólo existe en el documento, no en la UI | Badge **en la tarjeta principal**, no en el detalle técnico (C-2) |
| **R3** | **Contradicción voz/dato**: el panel dice `scientific_scope: binary_only`, pero la voz dice *"Inferencia real finalizada"* | 🟠 Alta | **Ocurre hoy** (N7, `AIPredictiva.jsx:142` y `:190`). Un dato honesto narrado como real es peor que un dato honesto | **L-4 obligatorio**: `mode` derivado de `source_mode` |
| **R4** | **Fuga científica**: el 99 %/62 % se cita como precisión del modelo | 🟠 Alta | Sin holdout (G-3b = 0) no hay precisión. La confianza por-frame es seductora | Texto fijo junto a `confidence`: *"confianza por imagen, NO precisión validada"* |
| **R5** | **Fuga a OCI**: alguien despliega el condicional con `DJANGO_DEBUG=true` | 🟠 Alta | N3 sigue abierto | CONDITIONAL **no** ampara OCI; `DEBUG=false` obligatorio antes de cualquier exposición |
| **R6** | **Contradicción con el canon**: `AI_CANON_HYBRID` dice ONNX; servir `.h5` histórico "como oficial" rompe la coherencia | 🟠 Media-Alta | `H5_CLOSED` lo clasificó HISTÓRICO | El etiquetado **explícito** es precisamente lo que resuelve la contradicción: no se sirve *como si fuera* canónico, se sirve *diciendo* que es histórico |
| **R7** | **Evidencia no persistida** (N2/N9): el condicional se usa para "demostrar" algo que no queda registrado | 🟡 Media | No existe ni un `infer_log.jsonl` en host | Volumen de logs **antes** de cualquier campaña de validación |
| **R8** | **Deuda disfrazada**: cerrar N1–N5 no cambia el veredicto y se celebra como avance | 🟡 Media | Ya demostrado en el informe anterior | Declarar explícitamente que N1–N5 **no** cierran el gate |
| **R9** | **Puerta a "READY pleno" sin R3+R4**: una vez condicional, se salta a pleno sin ejecutar nada | 🟠 Alta | Presión natural a cerrar el tema | `DOCKER_READY` pleno exige F5 cerrado por ejecución o por etiquetado permanente y auditado |

**Riesgo dominante:** **R1 + R3**. Sin caducidad, la excepción se vuelve canon. Sin L-4, el sistema se contradice a sí mismo en el mismo request.

---

## 2. Qué debe declararse (texto normativo exacto)

### 2.1 Declaración de estado (una sola frase canónica)

> **"El despliegue está oficialmente listo para operar en entorno local controlado, sirviendo un clasificador binario histórico (`plant_disease_mbv2.h5`) cuyo alcance es enferma/sana, sin identificación de especie ni enfermedad, y sin validación de campo. No es un modelo canónico ni está validado científicamente."**

### 2.2 Declaración de alcance del gate

> **"`DOCKER_READY_CONDITIONAL` ampara únicamente el stack local de 4 servicios (`db`, `backend`, `ai_service`, `frontend`) con serving histórico declarado. NO ampara OCI, NO ampara exposición pública, NO ampara captura acústica (bridge host-local, Tramo C), NO valida desempeño científico."**

### 2.3 Declaración de frontera (la que hoy no existe - N8)

> **"Docker Oficial comprende `db`, `backend`, `ai_service` y `frontend`. La captura acústica (bridge `127.0.0.1:8766`) es host-local y queda fuera de Docker Oficial hasta Tramo C. Sin bridge, la UI muestra `SIN_PUENTE`, estado honesto y no fallo."**

### 2.4 Campos que deben existir en el runtime (C-1)

**`GET :8081/health`** — hoy devuelve `{status, tensorflow, voice, model_loaded}`. Debe añadir:

| Campo | Valor esperado |
|---|---|
| `model_status` | `"HISTORICO"` |
| `model_sha256` | `77B0EFECD602F95FD31846C3058B4D45E41289155438FBD22738BCE0640219C0` |
| `scientific_scope` | `"binary_only"` |
| `class_space` | `2` |

**Envelope de `/api/v3/ai/inference/` → `prediction`** — debe añadir `model_status: "HISTORICO"` (hoy tiene `scientific_scope` pero no estado del artefacto).

**Motivo:** sin `model_sha256` en `/health` un auditor no puede probar **qué artefacto exacto** está corriendo. `model_id: "plant_disease_classifier"` es genérico: dos `.h5` distintos producen el mismo `model_id`.

### 2.5 Lo que debe verse en la UI (C-2)

| Ubicación | Contenido |
|---|---|
| **Tarjeta principal** (no el grid técnico) | Badge visible: `MODELO HISTÓRICO · BINARIO · SIN HOLDOUT` |
| Junto a `confidence` | Nota fija: *"confianza por imagen — no es precisión validada"* |
| Canal de voz | Si `source_mode != 'live'` → **"Modo degradado"**, nunca "inferencia real" |

---

## 3. Qué debe etiquetarse HISTÓRICO (conjunto exacto de artefactos)

La etiqueta no es un adjetivo suelto: es un **conjunto cerrado**. Etiquetar de menos deja ambigüedad; etiquetar de más destruye el canon.

| Artefacto | Etiqueta | Justificación |
|---|---|---|
| `src/ai_models/production_models/plant_disease_mbv2.h5` (9 431 432 B · SHA-256 `77B0EFEC…19C0` · 2026-08-21) | **HISTÓRICO** | `H5_CLOSED`; sirve por `D-serve`; binario; sin holdout |
| `src/ai_models/production_models/model_metadata.json` (`classes: ["enferma","sana"]`) | **HISTÓRICO** | Contrato del artefacto histórico |
| Contrato semántico **v1** (`scientific_scope: "binary_only"`, `semantic_contract_version: "v1"`) | **HISTÓRICO / a reemplazar por v2** | R4 lo sustituye por multiclase 16 |
| `benchmark/runs/M2_efficientnet_b0/exports/model.onnx` (SHA `4BD657B3…74EC3`) | **NO histórico — CHALLENGER CANÓNICO, listo y no activado** | `M2_RECOVERED` + `AI_R2_COMPLETE` |
| M1 MobileNetV2 (sin artefacto en disco) | **NO histórico — BASELINE OFICIAL, sin artefacto** | `M1_PARTIAL`; etiquetarlo histórico sería falso |
| M2 `.pth` (`best.pth`, `last.pth`) | **NO histórico — challenger, pesos de entrenamiento** | Fuente del ONNX |

**Regla dura:** **no se etiqueta HISTÓRICO lo que es canon.** M1 es baseline oficial; M2 es challenger validado. El único histórico es el `.h5` y su contrato v1. Confundirlos reescribiría `M1_BASELINE_M2_CHALLENGER`.

---

## 4. Qué deuda técnica queda (asumida y declarada)

| Deuda | Por qué es aceptable en CONDITIONAL | Trigger de pago |
|---|---|---|
| **N1** bridge fuera de compose | No participa del stack oficial; captura acústica bloqueada por Tramo C | Antes de Tramo C o uso multiequipo |
| **N2/N9** `infer_log` sin volumen | No afecta al camino feliz | **Antes de cualquier campaña de captura o validación** |
| **N3** `DJANGO_DEBUG=true` | Entorno local controlado | **Bloqueante absoluto antes de OCI** |
| **N5** `AI_SERVICE_URL` ausente | Default `http://ai_service:8081` es el correcto en compose | Al documentar el modo dev híbrido |
| **F8** de-cloud `cloud.js` | Fallback de disponibilidad, no camino crítico | Al salir de red local |
| **G-3b** holdout vacío | Gate **científico**, no de despliegue | Antes de publicar cualquier métrica |
| **R3+R4** ONNX + contrato 16 clases | Evolución planificada con diseño listo | **Caducidad de CONDITIONAL** |

**Deuda NO aceptable (se convierte en requisito de CONDITIONAL, no en deuda):**
- **N7** (`mode:'real'` hardcodeado) → **L-4 obligatorio**. Un condicional que se narra como real no es condicional.
- **N8** (frontera no escrita) → **L-5 obligatorio**. Sin frontera, el alcance es indefinido.

---

## 5. Qué trabajo pasa al backlog

| # | Trabajo | Prioridad | Bloquea |
|---|---|---|---|
| **B-1** | Misión `AI-R3+R4` (ONNX + contrato multiclase 16) | **Siguiente ciclo** | Cierre de la condición |
| **B-2** | Volumen de `data/logs` en `ai_service` (N2) | Alta | Evidencia de campañas |
| **B-3** | Containerizar el bridge o declararlo definitivamente fuera (N1) | Media | Tramo C |
| **B-4** | Endurecer `.env` para OCI (`DEBUG=false`, secretos reales) | **Bloqueante de OCI** | Publicación |
| **B-5** | `AI_SERVICE_URL` explícito en `.env.example` (N5) | Baja | Documentación dev |
| **B-6** | De-cloud `cloud.js` / `lab-data.js` (F8) | Baja | Salida de red local |
| **B-7** | Misión `AI-R5` (captura de holdout real) | Alta (científica) | G-3b / métricas |
| **B-8** | Corregir `localhost:8000` del cliente de robótica | Media | Honestidad de lab |

**No pasa al backlog (obligatorio ahora):** L-1..L-6.

---

## 6. La condición: misión `DOCKER_READY_CONDITIONAL_LABELING` (diseño, no ejecutada)

| ID | Entrega | Archivo | Criterio de aceptación verificable |
|---|---|---|---|
| **L-1** | `/health` expone `model_status`, `model_sha256`, `scientific_scope`, `class_space` | `src/ai_models/fastapi_app.py` | `curl :8081/health` → 4 campos presentes y correctos |
| **L-2** | `prediction` expone `model_status: "HISTORICO"` | `semantic_prediction_resolver.py` | respuesta de `/api/v3/ai/inference/` contiene el campo |
| **L-3** | Badge visible en tarjeta principal + nota junto a `confidence` | `AIPredictiva.jsx` | captura: badge legible sin abrir el detalle técnico |
| **L-4** | `mode` derivado de `source_mode`; voz no dice "real" en fallback | `AIPredictiva.jsx:142,190` | test: fallback forzado → voz dice "modo degradado" |
| **L-5** | `DEPLOYMENT.md` con las 3 declaraciones (§2.1–2.3) | `docs/DEPLOYMENT.md` | documento existe y contiene la frontera del bridge |
| **L-6** | Registro de estado `deployment_readiness.yaml` con dueño, fecha, caducidad y trigger | `docs/ai/manifests/` | YAML válido; trigger apunta a B-1 |

**Naturaleza:** etiquetado y procedencia. **Cero trabajo de ML, cero reentrenamiento, cero migración de datos.**
**Estimación:** 3 archivos de código + 2 documentos + 1 manifest.
**Riesgo de la misión:** bajo; no toca el camino de inferencia (sólo añade campos y textos).

### 6.1 Gate de cierre de CONDITIONAL

```
CONDITIONAL se declara cuando:  L-1..L-6  +  O-2 (G2/G4/G8/G13/G15)  +  O-3 (tag, DEPLOYMENT, resolved)  +  O-4 (16 capturas)  +  O-5 (F4)
CONDITIONAL NO requiere:        R3+R4 ejecutados · G-3b · N1/N2/N3/N5 · F8
CONDITIONAL NO habilita:        OCI · exposición pública · captura acústica · ninguna afirmación de precisión
```

---

## 7. Qué NO es `DOCKER_READY_CONDITIONAL` (para evitar el mal uso)

| No es | Por qué |
|---|---|
| Un sinónimo amable de `DOCKER_NOT_READY` | Si no hay etiquetado runtime, es `NOT_READY`. Punto. |
| Un permiso permanente | Caduca con B-1 (R3+R4) |
| Una validación científica | G-3b sigue abierto; el 99 %/62 % sigue siendo anecdótico |
| Una autorización para OCI | `DEBUG=true` (N3) lo impide expresamente |
| Una excusa para no ejecutar R3+R4 | Es lo contrario: fija su fecha |
| Un cierre de F5 | F5 se cierra **por etiquetado explícito**, no por olvido |

---

## 8. Clasificación final

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  ESTADO ACTUAL (d930a34, sin cambios)                                            │
│  CONDICIONES DE LEGITIMIDAD:  1/5  (C-2 parcial)                                 │
│  →  DOCKER_NOT_READY                                                             │
│                                                                                  │
│  TRAS  L-1..L-6 + O-2 + O-3 + O-4 + O-5                                          │
│  CONDICIONES DE LEGITIMIDAD:  5/5                                                │
│  →  DOCKER_READY_CONDITIONAL                                                     │
│                                                                                  │
│  TRAS  AI-R3 + AI-R4 + AI-R5 (G-3b)                                              │
│  →  DOCKER_READY  (pleno)                                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Justificación explícita

1. **La categoría es aceptable** porque resuelve una contradicción real: el sistema sirve un artefacto que el canon clasificó como histórico, y lo hace con honestidad semántica pero **sin honestidad de procedencia**. CONDITIONAL nombra esa situación en vez de esconderla.
2. **No es declarable hoy** porque faltan C-1 (campo verificable), C-3 (registro), C-4 (caducidad) y, sobre todo, porque **R3/N7 produce una contradicción interna**: el dato dice `binary_only` y la voz dice "inferencia real".
3. **El coste de hacerlo bien es bajo y acotado** (L-1..L-6), y **no incluye investigación ni ML**.
4. **El coste de hacerlo mal es alto**: una excepción sin caducidad se convierte en canon, y un "READY" que narra un fallback como real destruye la credibilidad del resto del ecosistema, que es precisamente su activo principal.

---

## 9. Recomendación ejecutiva

**Aprobar `DOCKER_READY_CONDITIONAL` como objetivo, no como estado.**

Orden propuesto:
1. **L-1..L-6** (misión corta de etiquetado) — sin esto no hay condicional honesto.
2. **O-3** (tag + `DEPLOYMENT.md` + `compose.resolved.yml`) — sin código.
3. **O-2 + O-4** (verificación G2/G4/G8/G13/G15 + 16 capturas) — requiere Docker arriba.
4. **O-5** (decisión registry vs OCI).
5. Declarar **`DOCKER_READY_CONDITIONAL`** con caducidad = **B-1**.
6. Backlog: B-1..B-8, con **B-4 bloqueante de OCI** y **B-2 antes de cualquier campaña de evidencia**.

**Sin modificar código · sin commits · sin push.**
