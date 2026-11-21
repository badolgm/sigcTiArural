# PLATAFORMA DE OBSERVACIONES V1 — SIGCT-RURAL (PRIMER DISEÑO EJECUTABLE)

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T19:08:44-05:00
> - Origen: misión `SIGCTIARURAL_OBSERVATION_PLATFORM_V1` (documento nuevo)
> - Destino: `docs/governance/SIGCTIARURAL_OBSERVATION_PLATFORM_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: diseño ejecutable de captura multimodal. No crea código, modelos, datasets nuevos, IA ni entrenamiento.

**Misión:** `SIGCTIARURAL_OBSERVATION_PLATFORM_V1`
**Naturaleza:** arquitectura de **implementación declarativa**. Convierte la gobernanza y el masterplan en la primera plataforma operativa basada en `OBSERVATION_ID`.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Estado:** **OFICIAL — DISEÑO EJECUTABLE**. Define contratos, estructura física, flujo y gates. **No implementa**: cada fase requiere misión explícita.
**Base obligatoria:** `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1.md` · `SIGCTIARURAL_MULTIMODAL_MASTERPLAN_V1.md` · `multimodal_entity_model_v1.md` · `docs/acoustic/*` · Constitución V1.0.1 · Carta IA V1.0.1 · D-003.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante de honestidad:** los **7 estados canónicos** (`REAL` · `REAL-LOCAL` · `SIM` · `DISENO` · `ROTO` · `HUERFANO` · `REF`) no se amplían. Capturar no mejora un estado.

---

# 0. Regla de oro: qué es y qué NO es esta plataforma

**Es** el sistema operativo de evidencia digital rural en su primera encarnación: un aprendiz SENA, con una laptop, crea **una observación** con audio, imagen, video, telemetría manual y notas, y la entrega como un paquete completo, trazable y gobernado.

**NO es** —y este documento lo prohíbe explícitamente—:

| No es | Consecuencia |
|---|---|
| Un modelo | No se crea `model_id` de inferencia ni de clasificación. |
| Deep Learning | No hay YOLO, no hay CNN, no hay detección de objetos. |
| IA | No se invoca LLM, no se genera interpretación automática. |
| Entrenamiento | No se entrena, no se ajusta, no se valida ningún modelo. |
| Un dataset nuevo | No se crea `v2/` ni se escriben splits nuevos. El dataset acústico queda intacto. |
| Un módulo de audio | No sustituye al logger: lo envuelve y lo conecta. |

> **Límite conceptual (PL-0):** la plataforma **captura, identifica, empaqueta y entrega**. Todo lo que empiece con "clasificar", "detectar", "predecir" o "explicar" pertenece a una misión futura distinta, con gobernanza y gates propios. El `ObservationPackage` que aquí se produce es **combustible** para ACP/KH, no una respuesta.

## 0.1 Caso real de uso (ancla de todo el diseño)

> **Actor:** aprendiz SENA · **Dispositivo:** laptop con micrófono y webcam integrados · **Red:** opcional (funciona offline).
> **Acción:** registra una visita a un invernadero. Crea una observación, graba 3 s de audio del motor de la bomba, toma una foto de una hoja, graba 8 s de video del recorrido, anota temperatura 24 °C y humedad 68 % leídas en el medidor de la pared, escribe notas de campo, genera el paquete y lo envía al dataset.
> **Resultado esperado:** `obs_20261120_invernadero01_0001` existe, con 4 assets, 2 lecturas de telemetría, notas, huellas y un manifiesto de entrega. El dataset acústico original sigue con sus 7 muestras, sin una sola fila reescrita.

---

# 1. Hechos verificados (base honesta)

| Hecho | Verificación real | Implicación |
|---|---|---|
| Gobernanza multimodal V1 y Masterplan V1 existen | `docs/governance/` (3 documentos) | Se operacionalizan; no se redefinen |
| `OBSERVATION_ID`, `ASSET_ID`, `EVENT_ID` ratificados | Gobernanza §3 | Se reutilizan con el mismo formato |
| Dataset acústico operativo | `data/datasets/sigct_rural_acoustic/v1/` · 9 clases en `raw/` · `schema.json` 1.3.0 / 42 columnas · `metadata.csv` con 7 filas | **Intacto.** No se escribe en él |
| Formato real de `sample_id` | `ac_20261006_215109_000` · `ac_20261120_172557_000` | Base exacta para la envoltura de migración |
| Motor de ingesta único | `tools/cmsc-data-logger/src/ingest.js` → `ingestWav(opts)` · estados `accepted`/`quarantine`/`rejected` | El handoff de audio lo reutiliza; nunca se duplica |
| Captura rápida / experta / bridge | Frontend `AcousticQuickCapture.jsx`, `acousticBridge.js`, `bridge/server.js` | Patrón probado de T0; no se toca |
| ACP y Evidence Ledger | Arquitectura `DISENO` (F4 / F3E) | Consumidor futuro; no se afirma que ya operan |
| KH real | registry 51 documentos, 6 categorías | `docsByObservation` se deriva por lectura |

---

# 2. Principios de la plataforma

| ID | Principio | Consecuencia |
|---|---|---|
| **PL-1** | Identidad en el nacimiento | El `observation_id` se genera en el **paso 1**, antes de cualquier archivo. |
| **PL-2** | Raíz única, crecimiento aditivo | Audio, imagen, video y telemetría se **añaden** al mismo ID (OB-4). |
| **PL-3** | T0 primero | Laptop + webcam + micrófono + navegador. Sin hardware especializado. |
| **PL-4** | Sin IA en el ciclo de captura | No hay inferencia, detección ni clasificación automática. |
| **PL-5** | Paquete derivado, no duplicado | El `ObservationPackage` es una **vista inmutable**, no una copia de los bytes. |
| **PL-6** | Humedad del dato | `NO_DATA` ≠ 0; la telemetría no medida se declara ausente. |
| **PL-7** | Consentimiento antes que cámara | Personas → `consent_id` y redacción; sin biometría. |
| **PL-8** | Original intacto | Ninguna captura reescribe `v1/`, `taxonomy_v2`, `rules-v0`. |
| **PL-9** | Handoff por manifiesto | Al dataset se entrega un manifiesto con huellas, no una copia silenciosa. |
| **PL-10** | Huella o no hay evidencia | Todo asset lleva `sha256`; huella distinta ⇒ `BLOCKED`. |
| **PL-11** | Offline primero | Se captura sin red y se sincroniza después con la autoridad de IDs. |
| **PL-12** | Sin implementación sin misión | Este diseño habilita; no autoriza escribir código todavía. |

---

# 3. Experiencia completa: los 7 pasos

## 3.0 Vista general del flujo

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  APRENDIZ SENA · LAPTOP · WEBCAM + MIC INTEGRADOS · NAVEGADOR    │
  └───────────────────────────────┬──────────────────────────────────┘
                                  ▼
   [1] CREAR OBSERVACIÓN  ──► observation_id  (autoridad de IDs)
                                  │
   [2] AUDIO    ──► micrófono ──► audio_...   · WAV 44,1 kHz mono 16 bit
                                  │
   [3] IMAGEN   ──► webcam / archivo ──► image_...  · sha256 · EXIF saneado
                                  │
   [4] VIDEO    ──► webcam / archivo ──► video_...  · contenedor + keyframes
                                  │
   [5] TELEMETRÍA + NOTAS ──► temp / hum / observaciones  · NO_DATA ≠ 0
                                  │
   [6] OBSERVATION_PACKAGE ──► vista inmutable · verificación de integridad
                                  │
                                  ▼
   [7] ENTREGA AL DATASET ──► manifiesto de entrega · v1 intacto
                                  │
                    ┌─────────────┴──────────────┐
                    ▼                            ▼
             ACP / KH (futuro)          auditoría / curación (futuro)
             leen observation_id        sin reescribir el original
```

> El flujo es **lineal para el usuario** y **aditivo para el sistema**. El aprendiz ve 7 pasos; internamente cada paso añade un hijo a la misma raíz.

## 3.1 Paso 1 — Crear observación y generar `OBSERVATION_ID`

**Acción del usuario:** pulsa «Nueva observación», declara contexto mínimo (dominio, lugar, sesión, operador) y confirma.

| Elemento | Definición |
|---|---|
| ID generado | `obs_<YYYYMMDD>_<session_id>_<seq4>` — ej. `obs_20261120_invernadero01_0001` |
| Autoridad | Un único registro de IDs. El navegador **reserva** un bloque de secuencia; nunca inventa IDs libres (OBS-11). |
| Momento | Antes de abrir el micrófono o la cámara (PL-1). |
| Modo offline | Bloque reservado + sincronización diferida; colisión imposible por prefijo de autoridad + sesión. |
| Estado inicial | `REAL-LOCAL` si hay captura local verificable; se degrada nunca se mejora (MG-5). |
| Datos obligatorios | `captured_at` + `timezone` + `session_id` + `place_id` + `operator_id` + `capture_source`. |

**Reglas del paso:**

| ID | Regla |
|---|---|
| P1-1 | El ID se muestra al usuario y es **copiable**, pero **no editable**. |
| P1-2 | El usuario **no interpreta** el ID: los componentes son metadatos, no semántica (OBS-10). |
| P1-3 | Crear la observación **no crea archivos**: solo el contenedor lógico y su carpeta raíz vacía. |
| P1-4 | Si se aborta antes del paso 2, la observación queda `HUERFANO` con nota; **no se elimina** (P-1). |

**Criterio de aceptación:** existe un `observation_id` único, con procedencia completa y sin assets; la autoridad de IDs lo puede resolver por consulta.

## 3.2 Paso 2 — Capturar audio desde micrófono

**Acción del usuario:** pulsa «Grabar audio», habla o registra el sonido ambiental, detiene, escucha y acepta o repite.

| Elemento | Definición |
|---|---|
| Dispositivo | Micrófono integrado (T0). Sin hardware especializado. |
| Contrato de bytes | WAV PCM 16 bit · mono · 44.100 Hz · 3,0 s — **idéntico** al dataset acústico vivo. |
| ID del asset | `audio_<YYYYMMDD>_<HHmmss>_<seq3>` |
| Huella | `sha256` calculado sobre los bytes del WAV. |
| QC visible | duración, tasa, canales, recorte, umbral — AC-1..AC-10 ya gobernados. |
| Repetir | Crea un **nuevo** `audio_` asset; el anterior queda como `superseded` si se descarta, nunca borrado. |

**Reglas del paso:**

| ID | Regla |
|---|---|
| P2-1 | El formato de audio **debe** coincidir con `ingestWav()` para que el handoff exista sin adaptador de conversión. |
| P2-2 | El usuario puede **omitir** este paso: la observación sigue siendo válida (CAP-2). |
| P2-3 | El audio se guarda en `audio/` de la observación, **no** en `raw/<clase>/` del dataset v1. |
| P2-4 | No se asigna `class_id` aquí. La etiqueta pertenece a curación futura, no a captura (PL-4). |
| P2-5 | `capture_source_rate` y `resample_method` se declaran aunque el navegador entregue 44,1 kHz. |

**Criterio de aceptación:** WAV reproducible, con huella y campos de calidad; `ingestWav()` podría ingestarlo tal cual en el futuro.

## 3.3 Paso 3 — Capturar imagen desde webcam o archivo

**Acción del usuario:** pulsa «Tomar foto» (webcam) o «Subir imagen» (archivo), encuadra, confirma.

| Elemento | Definición |
|---|---|
| Dispositivo | Webcam integrada o cámara del celular (T0); también archivo existente. |
| ID del asset | `image_<YYYYMMDD>_<HHmmss>_<seq3>` |
| Campos | `sha256` · `mime_type` · `width` · `height` · `capture_source` · `source_tier`. |
| EXIF | Saneado por defecto: GPS y dispositivo pasan a metadata gobernada, no incrustados (`exif_policy`). |
| Personas | Si hay personas → `consent_id` obligatorio y redacción de rostro en reportes (VTX-9). |
| Taxonomía | **No se etiqueta.** La taxonomía visual está `DISENO` y requiere misión de gobernanza. |

**Reglas del paso:**

| ID | Regla |
|---|---|
| P3-1 | La imagen se guarda en `image/`, jamás en un dataset de imagen nuevo. |
| P3-2 | Subir un archivo conserva su `original_id` en `provenance`; no se sobrescribe. |
| P3-3 | Sin consentimiento, la imagen se marca `PARTIAL` y se excluye de paquetes para ACP. |
| P3-4 | No se crea `class_id`, no se detecta nada, no se usa visión por computador. |

**Criterio de aceptación:** imagen con huella, dimensiones y política de EXIF declarada; si contiene personas, consentimiento registrado.

## 3.4 Paso 4 — Capturar video desde webcam o archivo

**Acción del usuario:** pulsa «Grabar video» o «Subir video», graba un recorrido corto, detiene, confirma.

| Elemento | Definición |
|---|---|
| Dispositivo | Webcam integrada / cámara de celular (T0). |
| ID del asset | `video_<YYYYMMDD>_<HHmmss>_<seq3>` |
| Campos | `container` · `codec` · `fps` · `duration_s` · `resolution` · `keyframes[]` · `sha256`. |
| Pista de audio | Si existe, es un `audio_` **enlazado** (`audio_track_id`), no bytes duplicados (VID-1). |
| Cuadros | Se materializan solo cuando se consumen, con `derived_from=video_id`. **No** se generan ahora. |
| Tamaño | Límite configurable de duración/tamaño declarado; se reporta `BLOCKED` si se excede, nunca se trunca en silencio. |

**Reglas del paso:**

| ID | Regla |
|---|---|
| P4-1 | El video es un **contenedor de assets**, no una nueva observación ni una clase. |
| P4-2 | No se extraen cuadros automáticamente: hacerlo sería preprocessing, no captura. |
| P4-3 | El video se guarda en `video/`; su pista de audio apunta al `audio_` del paso 2 si coincide. |
| P4-4 | Sin video, la observación es igualmente válida (CAP-2). |

**Criterio de aceptación:** contenedor íntegro, con huella, keyframes declarados y sin duplicación de bytes.

## 3.5 Paso 5 — Registrar telemetría manual y notas

**Acción del usuario:** escribe en un formulario los valores que leyó en el medidor y sus observaciones de campo.

| Elemento | Definición |
|---|---|
| ID del asset | `telemetry_<YYYYMMDD>_<stream>_<seq>` por métrica. |
| Métricas mínimas del caso | `temperatura_ambiente` (°C) · `humedad_relativa` (%) — del masterplan §7.2. |
| Unidad | Canónica SI; si el medidor usa otra, se declara conversión y se conserva el valor original (TEL-1). |
| Calidad | `ok` · `suspect` · `NO_DATA`. **No medir se reporta `NO_DATA`, nunca `0`** (TEL-3). |
| Instrumento | `sensor_source=manual` + nombre del medidor; `calibration_id=N/A` declarado en T0 (TEL-5/6). |
| Notas | Texto libre del aprendiz, con `author` · `timestamp` · `note_id`. Es anotación, no etiqueta. |

**Reglas del paso:**

| ID | Regla |
|---|---|
| P5-1 | La telemetría manual es `REAL-LOCAL` con `source=manual`: **no es simulación**. |
| P5-2 | Los campos no medidos se dejan explícitamente como `NO_DATA`, no se rellenan con cero ni con promedios. |
| P5-3 | Fuera de rango de plausibilidad ⇒ `suspect`, nunca descartado en silencio (TEL-2). |
| P5-4 | Las notas no crean `event_id`: eso requiere decisión gobernada (EV-3). |
| P5-5 | La correlación con audio/imagen/video se hará en el futuro por `event_id`, no por proximidad de timestamps (AL-3). |

**Criterio de aceptación:** cada métrica tiene valor o `NO_DATA`, unidad, ventana, instrumento y marca de tiempo; las notas tienen autor y timestamp.

## 3.6 Paso 6 — Crear el `ObservationPackage` completo

**Acción del usuario:** pulsa «Generar paquete». El sistema compone y verifica.

> **Precisión necesaria.** El `ObservationPackage` **no es un registro nuevo** ni una copia de los bytes: es una **vista de lectura, inmutable y derivada** definida en el Masterplan §9.1. Aquí se *materializa como manifiesto* para que pueda viajar y verificarse. Si un asset cambia, se genera **otro** paquete; el anterior permanece.

| Bloque del paquete | Origen en la observación |
|---|---|
| Identidad | `observation_id` · `entity_model_version` · `governance_version` |
| Procedencia | `session_id` · `place_id` · `captured_at` · `timezone` · `operator_id` · `consent_id` |
| Honestidad | `state` (7 estados) · `confidence_declared` · distribución por asset |
| Assets | Descriptores de `audio_` · `image_` · `video_` · `telemetry_`: ID, modalidad, `sha256`, mime, atributos. **No bytes crudos por defecto.** |
| Notas | `note_id[]` con autor y timestamp |
| Eventos | `event_ids[]` — vacío en captura; se llenan en curación futura |
| Evidencia | `evidence_ids[]` — vacío ahora; nunca se inventa |
| Integridad | Tabla `asset_id → sha256 → tamaño` + `package_sha256` |
| Entrega | `delivery_manifest` con destino y estado `PENDING` |
| Presupuesto | Nivel `compact` / `full` declarado por el consumidor futuro |

**Verificaciones del paso 6:**

| ID | Verificación |
|---|---|
| P6-1 | Todo `asset_id` referenciado existe y su `sha256` coincide con el archivo en disco. |
| P6-2 | `modality_set` coincide con los assets presentes. |
| P6-3 | Ningún bloque de IA (predicción, evidencia, veredicto) fue rellenado por la plataforma. |
| P6-4 | Personas sin consentimiento ⇒ bloque omitido y `PARTIAL`. |
| P6-5 | Huella distinta ⇒ `BLOCKED`, con el ID del asset culpable. |
| P6-6 | El paquete es **inmutable**: se escribe una vez; cualquier cambio crea una nueva versión con `supersedes`. |

**Criterio de aceptación:** manifiesto legible, verificable por huella, sin contenido de IA, con `delivery_manifest` en `PENDING`.

## 3.7 Paso 7 — Enviar al dataset (handoff sin romper nada)

**Acción del usuario:** pulsa «Entregar al dataset». El sistema produce el manifiesto de entrega y reporta el resultado.

> **Este es el punto más delicado del diseño.** El envío **no escribe en `data/datasets/sigct_rural_acoustic/v1/`**. Es un **handoff por manifiesto** hacia una zona de entrada gobernada, que un futuro adaptador (bajo misión explícita) podrá presentar a `ingestWav()`.

```
  ObservationPackage (inmutable)
        │
        ▼
  delivery_manifest.yaml
    · observation_id
    · asset_audio: audio_... → sha256 → ruta en obs_.../audio/
    · audio_contract: WAV 44100/mono/16bit/3s   ← coincide con ingestWav()
    · legacy_hint: sample_id sugerido ac_YYYYMMDD_HHMMSS_000
    · estado: PENDING_ACCEPTANCE
        │
        ▼
  Zona de entrada gobernada (NO v1/)
  data/observations/inbox/v1/<observation_id>/
        │
        ▼ (MISIÓN FUTURA — no ejecutada aquí)
  adaptador → ingestWav() → accepted | quarantine | rejected
        │
        ▼
  dataset acústico v1  ← solo si se decide; hoy NO se toca
```

**Reglas del paso:**

| ID | Regla |
|---|---|
| P7-1 | El envío **nunca** modifica `metadata.csv`, `labels.csv`, `schema.json`, `rules-v0` ni los 7 WAV existentes. |
| P7-2 | El resultado del envío es `PENDING_ACCEPTANCE`, nunca `accepted`: la aceptación la hace el motor gobernado, no la UI. |
| P7-3 | El manifiesto lleva `legacy_hint` con el formato `ac_...` para que la futura migración pueda enlazar sin inventar correspondencias. |
| P7-4 | Reenviar crea un **nuevo** `delivery_manifest` con `supersedes`; no sobrescribe el anterior. |
| P7-5 | La UI muestra el estado real devuelto por el motor cuando exista; hoy muestra `PENDING` con honestidad. |

**Criterio de aceptación:** manifiesto de entrega generado, v1 con hash intacto antes y después, estado honesto reportado.

---

# 4. Estructura física propuesta

## 4.1 Respuesta directa al ejemplo de la misión

La misión propone `obs_20261120_0001/`. Se respeta la forma, con una precisión de gobernanza: el ID canónico incluye `session_id` (`obs_<YYYYMMDD>_<session_id>_<seq4>`). La carpeta usa el **ID completo**; la forma corta del ejemplo se conserva como notación ilustrativa.

```
data/observations/v1/obs_20261120_invernadero01_0001/
│
├── audio/
│   ├── audio_20261120_140312_000.wav        ← mic integrado, 44,1 kHz mono 16 bit, 3 s
│   └── audio_manifest.json                   ← sha256 · duración · tasa · QC
│
├── image/
│   ├── image_20261120_140501_001.jpg         ← webcam / archivo, EXIF saneado
│   └── image_manifest.json                   ← sha256 · dimensiones · exif_policy · consent_id
│
├── video/
│   ├── video_20261120_140610_000.webm        ← webcam / archivo, formato abierto preferido
│   └── video_manifest.json                   ← sha256 · fps · duración · keyframes · audio_track_id
│
├── telemetry/
│   ├── telemetry_20261120_temp.json          ← 24,0 °C · ok · manual · N/A calibración
│   ├── telemetry_20261120_hum.json           ← 68 % · ok · manual · N/A calibración
│   └── notes_20261120_140745.json            ← notas del aprendiz · autor · timestamp
│
├── metadata/
│   ├── observation.json                      ← observation_id · procedencia · estado · modality_set
│   ├── observation_package.json              ← vista inmutable del paso 6
│   └── delivery_manifest.yaml                ← paso 7 · PENDING_ACCEPTANCE
│
└── reports/
    ├── README.md                             ← carpeta RESERVADA: la captura NO escribe aquí
    └── docsByObservation.md                   ← vista derivada por lectura (futura, KH)
```

## 4.2 Reglas de la estructura física

| ID | Regla |
|---|---|
| FS-1 | **Un directorio por observación**, nombrado con el `observation_id` completo. |
| FS-3 | Cada modalidad tiene su propio subdirectorio; agregar una no reordena las demás. |
| FS-4 | Los `*_manifest.json` llevan la huella de cada archivo; el archivo nunca se renombra para corregirlo. |
| FS-5 | `metadata/observation.json` es la **única** fuente de la observación; los demás archivos la referencian por ID. |
| FS-6 | `reports/` está reservado a consumidores posteriores (ACP/KH). La captura **no** escribe reportes ni veredictos. |
| FS-7 | Todo el árbol vive bajo `data/`, que está fuera de git por política. Se versiona el **contrato**, no los bytes (REGLA de gobernanza acústica §11). |
| FS-8 | Formatos abiertos preferidos (WAV, JPEG, WebM, JSON, YAML). Sin formatos propietarios. |
| FS-9 | Una cura produce un archivo nuevo con `curated_from`; el original permanece en su sitio. |
| FS-10 | La estructura es **idéntica** en laptop y en celular: no hay una versión "ligera" incompatible. |

## 4.3 Raíces separadas (convivencia física)

```
data/
├── datasets/
│   └── sigct_rural_acoustic/
│       └── v1/                      ← INTACTO. 7 muestras. No se escribe aquí.
│
└── observations/
    ├── inbox/v1/                     ← entrega del paso 7 (PENDING_ACCEPTANCE)
    └── v1/
        └── obs_<session>_<seq4>/     ← observaciones gobernadas (esta plataforma)
```

> `observations/` y `datasets/` son **hermanos**, no anidados. Eso garantiza que un error en la plataforma no pueda corromper el dataset acústico.

---

# 5. Convivencia con `SIGCT_RURAL_ACOUSTIC` (sin romper nada)

## 5.1 Principio de no interferencia

La plataforma **no modifica** el dataset acústico. El audio que captura es compatible con él por contrato de bytes, no por escritura directa.

| Activo del dataset v1 | ¿Lo toca la plataforma? | Mecanismo |
|---|---|---|
| `raw/<9 clases>/` (7 WAV) | **NO** | El audio nuevo va a `observations/v1/.../audio/`. |
| `metadata/metadata.csv` (42 columnas, 7 filas) | **NO** | Solo se lee para validar el `legacy_hint`. |
| `metadata/schema.json` 1.3.0 | **NO** | Se respeta; un bump futuro requiere misión de gobernanza. |
| `metadata/labels.csv` (9 clases) | **NO** | La captura no asigna `class_id`. |
| `rules-v0.js` | **NO** | Intacto. |
| `ingestWav()` | **NO se duplica** | Se reutiliza en el futuro handoff; hoy solo se declara compatibilidad. |
| Captura rápida / experta / bridge | **NO se modifica** | Patrón T0 probado; la plataforma lo envuelve conceptualmente. |
| `taxonomy_v2.md` | **NO** | Se respeta como especialización de audio. |

## 5.2 Compatibilidad de contrato

| Dimensión | Dataset v1 | Plataforma V1 | Compatible |
|---|---|---|---|
| WAV | PCM 16 · mono · 44.100 Hz · 3,0 s | **Idéntico** | ✅ |
| Huella | `sha256` por clip | `sha256` por asset | ✅ |
| Sesión | `session_id` (ej. `S001`, `ses_20261120`) | `session_id` heredable | ✅ |
| Lugar | `place_id` (`site_a`, `campo_01`) | `place_id` heredable | ✅ |
| Clase | `class_id` obligatorio en v1 | **No se asigna en captura** | ✅ por omisión gobernada |
| ID | `sample_id = ac_...` | `observation_id = obs_...` | ✅ por envoltura (§6) |

## 5.3 Reglas de convivencia

| ID | Regla |
|---|---|
| CO-1 | La plataforma **nunca** escribe en `data/datasets/`. Solo produce manifiestos para `observations/inbox/`. |
| CO-2 | El `legacy_hint` es una **sugerencia**, no una asignación: no se crea un `sample_id` real hasta que el motor gobernado lo acepte. |
| CO-3 | Si el motor rechaza un audio (`quarantine`/`rejected`), la observación **permanece** con su estado degradado y nota; nada se borra. |
| CO-4 | Los 7 clips existentes son `REAL-LOCAL` y siguen siendo la única evaluación propia hasta nueva gobernanza. |
| CO-5 | Ningún asset de la plataforma entra a un split de v1 sin pasar por curación y gates (REFONLY / MP-9). |
| CO-6 | Un mismo WAV puede ser referenced por una observación y por su fila v1 **sin copiarse**: se enlaza por ID y huella. |

---

# 6. Migración `sample_id` → `observation_id` sin perder historia

## 6.1 Estrategia: envoltura, no conversión

La migración **no reescribe** la fila v1. Crea una observación envolvente que apunta al mismo audio por ID y huella.

```
  ANTES — fila v1 (INTACTA)
  ┌──────────────────────────────────────────────────────────────────┐
  │ sample_id   : ac_20261120_172557_000                             │
  │ file        : raw/lluvia/ac_20261120_172557_000_<sha>.wav        │
  │ sha256      : 7f9ed916...                                        │
  │ class_id    : lluvia · session_id: ses_20261120 · place_id: campo_01 │
  └──────────────────────────────┬───────────────────────────────────┘
                                 │ legacy_sample_id  (lectura, sin reescritura)
                                 ▼
  DESPUÉS — observación envolvente (NUEVA, ADITIVA)
  ┌──────────────────────────────────────────────────────────────────┐
  │ observation_id      : obs_20261120_campo_01_0001                 │
  │ legacy_sample_id    : ac_20261120_172557_000                     │
  │ entity_model_version: 1.0 · governance_version: 1.0              │
  │ modality_set        : [AUDIO]   (monomodal, válida)              │
  │ asset_ids           : [audio_20261120_172557_000]                │
  │ provenance          : original_id = ac_... · sha256 = 7f9ed916...│
  │ state               : REAL-LOCAL  (heredado, nunca mejorado)     │
  │ class_id            : NO se copia — vive en la anotación v1      │
  └──────────────────────────────────────────────────────────────────┘
```

## 6.2 Reglas de migración

| ID | Regla |
|---|---|
| MIG-1 | El `sample_id` original se guarda como `legacy_sample_id`; **no se renombra**. |
| MIG-2 | La huella `sha256` es el ancla de correspondencia. Si coincide, es el mismo audio; si no, es un asset distinto. |
| MIG-3 | La etiqueta v1 **no se copia** como `class_id` de la observación: se referencia como anotación heredada (`legacy_annotation_id`). Evita duplicar verdad. |
| MIG-4 | El estado `REAL-LOCAL` se **hereda**, nunca se promueve a `REAL` por migración. |
| MIG-5 | Los 9 `class_id` v1 sobreviven: 7 idénticos + 2 alias activos (`ruido_desconocido` → `evento_desconocido`; `aves` → alias de `ave`). |
| MIG-6 | Migrar una fila **no la mueve de split**; el `split_group_key` permanece. |
| MIG-7 | La migración es **por lotes verificables**: un manifiesto por lote con before/after hashes. |
| MIG-8 | Rollback = retirar la observación envolvente; la fila v1 sigue intacta. |
| MIG-9 | Esta misión **no ejecuta** la migración: solo fija el contrato. |

## 6.3 Verificación de no-pérdida

| Comprobación | Criterio |
|---|---|
| Fila v1 | Hash del `metadata.csv` idéntico antes y después |
| WAV | Los 7 `sha256` idénticos |
| Correspondencia | 1 `legacy_sample_id` ↔ 1 `observation_id`, sin duplicados |
| Historia | Toda observación envolvente declara `legacy_annotation_id` |
| Reversibilidad | Retirar envolturas deja el dataset exactamente como estaba |

---

# 7. Cómo ACP y Knowledge Hub consumen el `ObservationPackage`

## 7.1 Regla de oro

ACP y KH **no consumen muestras aisladas ni archivos**: consumen el `ObservationPackage` a través de `observation_id`. El paquete es la dieta; el ID es el ancla.

## 7.2 ACP

| ID | Regla |
|---|---|
| ACP-1 | Cada afirmación factual lleva `observation_id` como ancla. Sin ancla, se descarta (H5). |
| ACP-2 | El ACP **lee** Observation Registry → Evidence Ledger → KH registry, en ese orden. |
| ACP-3 | El ACP **no escribe** en el Ledger ni en el KH: produce `report_id`; el productor gobernado registra (C-5). |
| ACP-4 | Confianza = `MIN` de anclas × cobertura × penalidad por estado no-`REAL`. El ACP nunca la sube (N-2). |
| ACP-5 | Un bloque `NO_DATA` en el paquete se reporta como `NO_DATA` / `PARTIAL`, nunca se rellena con inferencia. |
| ACP-6 | Si hay personas sin consentimiento, el bloque se omite y el veredicto es `PARTIAL`. |
| ACP-7 | Veredictos permitidos: `RESOLVED` · `PARTIAL` · `NO_DATA` · `BLOCKED` · `UNANSWERABLE`. **No se crea ninguno nuevo.** |
| ACP-8 | **En esta misión el ACP no consume nada**: es consumidor futuro bajo misión y gates propios. |

## 7.3 Knowledge Hub

| ID | Regla |
|---|---|
| KH-1 | `docsByObservation(observation_id)` se **deriva por lectura** del registry: fuente única, sin doble escritura (MP-8). |
| KH-2 | La existencia de un paquete **no** convierte la evidencia en conocimiento verificado. Requiere promoción gobernada (Hangar de Autenticidad). |
| KH-3 | `doc_id` es una referencia al registry, nunca una copia del paquete. |
| KH-4 | Al regenerar el registry, el documento declara `observation_refs[]` derivados. |
| KH-5 | N:M derivado: una observación sustenta muchos documentos y un documento muchas observaciones. |
| KH-6 | El KH presenta los 7 estados honestos; jamás muestra un `DISENO` como `REAL`. |

## 7.4 Contrato de lectura (para una misión futura)

```
  ObservationPackage
        │  observation_id (ancla)
        ├──► Observation Registry  ──► resuelve existencia y estado
        ├──► Evidence Ledger      ──► evidence_id[] por observación (hoy vacío)
        └──► KH registry          ──► docsByObservation (derivado, fuente única)
                    │
                    ▼
        ACP: report_id { verdict, anclas[], confidence=MIN, state heredado }
                    │
                    ▼ (solo con gobernanza)
        KH: promoción a doc_id + regeneración de registry
```

---

# 8. Los 20 mayores riesgos de implementación real

> Ordenados por severidad. 🔴 bloqueante · 🟡 alto. Todos tienen mitigación declarada; ninguno se resuelve con IA.

| # | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| **R-01** | Confundir la plataforma con un sistema de clasificación/YOLO | 🔴 | PL-4: no hay inferencia en captura. Gate de rechazo: cualquier `prediction_id` en el paquete ⇒ `BLOCKED`. |
| **R-02** | Escribir accidentalmente en el dataset v1 | 🔴 | CO-1: raíces hermanas; `observations/` nunca apunta a `datasets/`. Verificación de hash antes/después. |
| **R-03** | Generar IDs locales en colisión (offline) | 🔴 | PL-1/PL-11: autoridad única con bloques reservados; prefijo de sesión; sin IDs libres. |
| **R-04** | Grabar audio con un contrato distinto a `ingestWav()` | 🔴 | P2-1: WAV 44,1 kHz mono 16 bit 3 s; verificación automática de contrato antes de aceptar. |
| **R-05** | Simular telemetría o rellenar con `0` lo no medido | 🔴 | TEL-3/P5-2: `NO_DATA` explícito; `0` solo si se midió; `suspect` fuera de rango. |
| **R-06** | Capturar personas sin consentimiento / biometría | 🔴 | PL-7/VTX-9/P3-3: `consent_id` obligatorio, redacción, sin reconocimiento, `PARTIAL` si falta. |
| **R-07** | Duplicar bytes del video en cuadros y pista de audio | 🔴 | VID-1/P4-1/P4-2: `derived_from` y `audio_track_id`; materialización perezosa, sin copias. |
| **R-08** | Crear `class_id` en la captura | 🔴 | P2-4/P3-4: la etiqueta pertenece a curación futura. Taxonomías visuales están `DISENO`. |
| **R-09** | Sobrecalificar el estado (`REAL` por capturar) | 🔴 | MG-5/CO-4/MIG-4: estado heredado o degradado, nunca mejorado. |
| **R-10** | Reescribir la fila v1 durante la migración | 🔴 | MIG-1/MIG-9: envoltura; hash de `metadata.csv` idéntico;rollback por retirada. |
| **R-11** | Copiar la etiqueta v1 como verdad duplicada | 🔴 | MIG-3: `legacy_annotation_id` por referencia, no copia de `class_id`. |
| **R-12** | Ideas falsas de "ya entregué" (`accepted` inventado) | 🔴 | P7-2: `PENDING_ACCEPTANCE`; el motor gobernado decide; la UI nunca afirma aceptación. |
| **R-13** | Huella calculada sobre bytes equivocados | 🔴 | P6-1/FS-4: `package_sha256` sobre manifiesto; verificación asset por asset; huella distinta ⇒ `BLOCKED`. |
| **R-14** | Dependencia de red para capturar | 🟡 | PL-11/CAP-6: captura offline y sincronización diferida con bloques de IDs. |
| **R-15** | EXIF con GPS/dispositivo filtrado en archivos | 🟡 | P3-1/`exif_policy`: saneado por defecto; GPS a metadata gobernada. |
| **R-16** | Explosión de tamaño por video en laptop | 🟡 | P4-4/FS-8: límite declarado, formato abierto, `BLOCKED` si excede; nunca truncado en silencio. |
| **R-17** | Doble escritura del puente KH ↔ observación | 🟡 | KH-1/MP-8: `docsByObservation` derivado; un solo índice. |
| **R-18** | Menores en observaciones con personas | 🔴 | R-06 + prohibición estricta sin consentimiento legal; redacción obligatoria. |
| **R-19** | Confundir `event_id` con `event_type` | 🟡 | EV-1/§3.5: la captura **no crea eventos**; `lluvia` es vocabulario, no ID de ocurrencia. |
| **R-20** | Interpretar el diseño como autorización de código | 🔴 | PL-12/§0: sin modelo, sin IA, sin entrenamiento, sin implementación sin misión explícita. |

## 8.1 Fixtures de rechazo (deben fallar)

| Fixture | Resultado esperado |
|---|---|
| Paquete con `prediction_id` | `BLOCKED` (R-01) |
| Captura que escribe en `datasets/v1/` | Impedido por diseño (R-02) |
| Telemetría con `NO_DATA` reportada como `0` | Rechazado (R-05) |
| Imagen con persona sin `consent_id` | `PARTIAL` + bloque omitido (R-06) |
| `sample_id` reescrito en migración | Rechazado (R-10) |
| Entrega reportada como `accepted` desde la UI | `BLOCKED` (R-12) |
| Huella que no coincide | `BLOCKED` con ID culpable (R-13) |

---

# 9. Arquitectura lógica de componentes (sin implementar)

> Se describen **responsabilidades**, no archivos ni código. Cada componente es una misión futura.

| Componente | Responsabilidad | NO hace |
|---|---|---|
| **Registro de IDs** | Asigna `observation_id` con bloques reservados | Interpretar el ID, generar IA |
| **Capturador T0** | Audio / imagen / video / telemetría manual / notas | Clasificar, detectar, predecir |
| **Verificador de integridad** | Calcula y valida `sha256` por asset y paquete | Corregir bytes silenciosamente |
| **Compositor de paquetes** | Materializa `ObservationPackage` inmutable | Rellenar evidencia o veredictos |
| **Entregador** | Produce `delivery_manifest` en `PENDING_ACCEPTANCE` | Escribir en el dataset v1 |
| **Adaptador de ingesta** (futuro) | Presenta audio a `ingestWav()` bajo misión | Duplicar el motor de ingesta |
| **Migrador** (futuro) | Crea observaciones envolventes con `legacy_sample_id` | Reescribir filas v1 |
| **Lector ACP/KH** (futuro) | Consume por `observation_id` | Escribir al Ledger o al KH |

## 9.1 Secuencia de estados del paquete

```
  DRAFT (pasos 1-5)
     │  todos los pasos completados
     ▼
  SEALED (paso 6 · inmutable · package_sha256)
     │  entrega generada
     ▼
  PENDING_ACCEPTANCE (paso 7 · manifiesto en inbox)
     │  (MISIÓN FUTURA) motor gobernado
     ├──► accepted      → observación referencia el sample_id aceptado
     ├──► quarantine    → estado degradado + nota, sin borrado
     └──► rejected      → observación conservada con nota
```

> `DRAFT`, `SEALED` y `PENDING_ACCEPTANCE` son **estados de proceso del paquete**, no estados de honestidad. Los 7 estados canónicos (`REAL`…`REF`) siguen gobernando la evidencia y **no se amplían**.

---

# 10. Cobertura obligatoria de dominios (casos reales T0)

> Cada fila es un escenario que el aprendiz SENA puede ejecutar **sin hardware especializado**.

| Dominio | Audio (mic) | Imagen (webcam) | Video (webcam) | Telemetría manual | Nota de honestidad |
|---|---|---|---|---|---|
| **Invernaderos** | Motor de bomba / riego | Hoja, malla, goteros | Recorrido de pasillo | Temp 24 °C · hum 68 % · luz observada | Caso ancla §0.1 |
| **Agricultura** | Viento en cultivo | Fruto, suelo, hoja | Parcela | Temp · hum · ph manual | Audio v2 ya gobernado |
| **Ganadería** | Vocalización bovina | Animal, pastura | Movimiento del hato | Temp · hum · agua | Sin collars (T3 opcional) |
| **Porcicultura** | Gruñidos, ventilador | Cerdo, corral | Recorrido de nave | Temp · hum · amonio `NO_DATA` si no se mide | Amonio es T3; se declara ausente |
| **Avicultura** | Cantío, ventilación | Pollo, nave | Recorrido | Temp · hum · luz | Sin sensores obligatorios |
| **Apicultura** | `abejas` (audio v2, `DISENO`) | Abeja en flor | Colmenar | Actividad de vuelo **visual** · temp | `peso_colmena` es T3 aditivo |
| **Acuicultura** | Bomba, agua | Pez en superficie | Estanque | Temp agua · ph · nivel · foto del medidor | OD/turbidez `NO_DATA` en T0 |
| **Forestal** | Ave, insectos, viento | Hoja, tronco | Sendero | Temp · hum · GPS T1 · clima T2 `REF` | Drone/SDR = T3 opcional |
| **Entornos rurales** | Lluvia, viento, ave | Cultivo, fauna | Parcela | Temp · hum · clima T2 `REF` | Audio operativo, resto `DISENO` |
| **Entornos urbanos** | Motor, alarma | Infraestructura | Calle | Clima T2 `REF` · ruido observado | **Privacidad crítica** (R-06/R-18) |

**Regla de dominio (DOM-1):** si un dominio solo puede observarse con T3, **no está cubierto** y se declara. Ninguno de los 10 depende de hardware especializado.

---

# 11. Gates de la plataforma (definidos, NO ejecutados)

| Gate | Condición | Estado hoy |
|---|---|---|
| **G-OP-1** | `observation_id` generado por autoridad única con bloques reservados | `DISENO` |
| **G-OP-2** | Captura T0 de audio con contrato idéntico a `ingestWav()` | `DISENO` (audio ya operativo, sin envoltura) |
| **G-OP-3** | Imagen y video con huella y EXIF saneado | `DISENO` |
| **G-OP-4** | Telemetría manual con `NO_DATA` ≠ 0 y rango de plausibilidad | `DISENO` |
| **G-OP-5** | `ObservationPackage` inmutable, verificado y sin IA | `DISENO` |
| **G-OP-6** | `delivery_manifest` en `PENDING_ACCEPTANCE` con v1 intacto | `DISENO` |
| **G-OP-7** | Migración de 1 lote con hash idéntico y rollback probado | `DISENO` |
| **G-OP-8** | Consentimiento y redacción verificados en escenarios con personas | `DISENO` |
| **G-OP-9** | Los 10 dominios ejecutables en T0 | `DISENO` |
| **G-OP-10** | Fixtures de rechazo (§8.1) pasan | `DISENO` |

> La existencia de este documento **no cierra ningún gate**.

---

# 12. Criterio de éxito y verificación

> **Primer diseño ejecutable de observaciones multimodales del ecosistema SIGCT-Rural.** No como dataset, no como audio, no como módulo: como **sistema operativo de evidencia digital rural**.

| # | Requisito de la misión | Sección | Estado |
|---|---|---|---|
| 1 | Paso 1: crear observación y generar ID | §3.1 | ✅ |
| 2 | Paso 2: audio desde micrófono | §3.2 | ✅ |
| 3 | Paso 3: imagen desde webcam/archivo | §3.3 | ✅ |
| 4 | Paso 4: video desde webcam/archivo | §3.4 | ✅ |
| 5 | Paso 5: telemetría manual + notas | §3.5 | ✅ |
| 6 | Paso 6: `ObservationPackage` completo | §3.6 | ✅ |
| 7 | Paso 7: envío al dataset | §3.7 | ✅ |
| 8 | Estructura física respondida | §4 | ✅ |
| 9 | Convivencia con `SIGCT_RURAL_ACOUSTIC` | §5 | ✅ |
| 10 | Migración `sample_id` → `observation_id` sin pérdida | §6 | ✅ |
| 11 | ACP y KH consumen el paquete | §7 | ✅ |
| 12 | 20 riesgos de implementación real | §8 | ✅ |
| 13 | 10 dominios obligatorios | §10 | ✅ |
| 14 | Sin modelos / DL / YOLO / IA / entrenamiento | §0 · PL-4 · R-01 | ✅ |

## 12.1 Límites declarados

- Sin código, sin implementación, sin modelos, sin IA, sin entrenamiento, sin datasets nuevos.
- Sin modificar audio actual, `taxonomy_v2`, `rules-v0`, dataset v1, captura rápida ni captura experta.
- Sin commit, push, merge ni tag.
- Los 7 estados canónicos y los 5 veredictos ACP permanecen intactos.
- `docs/governance/` ya es visible en git; no se requiere cambio adicional en `.gitignore`.

---

# 13. Cierre

La plataforma resuelve un problema concreto y estrecho: **el aprendiz SENA necesita producir evidencia multimodal gobernada desde una laptop, sin pedir permiso a un sensor, sin invocar un modelo y sin romper el audio que ya funciona.**

La respuesta es una raíz inmutable (`observation_id`), siete pasos lineales, una estructura física predecible, un handoff por manifiesto que deja el dataset v1 intacto, una migración por envoltura que conserva toda la historia, y veinte riesgos con mitigación explícita.

**Estado honesto:** **DISEÑO EJECUTABLE OFICIAL**. Los diez gates permanecen abiertos. La plataforma captura y empaqueta; **no piensa, no clasifica y no decide**. Eso —precisamente— es lo que la hace confiable.

---

*Fin del diseño de la plataforma de observaciones. Complementa —nunca sustituye— la gobernanza multimodal V1, el Masterplan V1, la gobernanza acústica V2, la Constitución, la Carta IA y D-003.*
