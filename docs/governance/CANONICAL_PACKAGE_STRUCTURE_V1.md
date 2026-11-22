# ESTRUCTURA DEL CANONICAL OBSERVATION PACKAGE V1

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-21T16:39:00-05:00
> - Origen: misión `SIGCTIARURAL_CANONICAL_OBSERVATION_PACKAGE_V1` (documento nuevo)
> - Destino: `docs/governance/CANONICAL_PACKAGE_STRUCTURE_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: contrato de contenido. **No crea los siete archivos JSON ni el directorio.** Los ejemplos son ilustrativos.

**Complemento de:** `CANONICAL_OBSERVATION_PACKAGE_V1.md`
**Caso:** tomate · etiquetas `OBS-0001` … `DOC-0001`

---

# 0. Convenciones

| Término | Significado |
|---|---|
| **OBLIGATORIO** | El campo debe estar presente. Si no hay dato real, su valor es `NO_DATA` explícito: nunca se omite, nunca es `0`, nunca es `null`. |
| **OPCIONAL** | Puede omitirse. Si se incluye, debe ser verificable y no introducir entidad nueva. |
| **PROHIBIDO** | Su presencia invalida el paquete: `BLOCKED`. |
| `NO_DATA` | Estado gobernado de ausencia. No se imputa (ND-2). |
| Etiqueta `*-0001` | Referencia de la misión anterior. No es un ID de dominio emitido. |

> **Regla de ausencia:** un campo obligatorio con `NO_DATA` es **válido pero debilita el veredicto**. Un campo obligatorio **ausente** es `BLOCKED`.

---

# 1. `observation.json`

**Rol:** ancla raíz del paquete. Sin este archivo no hay paquete.

| Campo | Clasificación | Valor de referencia | Nota |
|---|---|---|---|
| `observation_ref` | OBLIGATORIO | `OBS-0001` | Raíz. No se genera aquí. |
| `entity_model_version` | OBLIGATORIO | `v1` | Versión del modelo de entidades ya existente. |
| `governance_version` | OBLIGATORIO | `foundation-stack-v1` | Línea base congelada. |
| `session_id` | OBLIGATORIO | `NO_DATA` | No se emite sesión nueva. |
| `place_id` | OBLIGATORIO | `parcela_tomate_01` | Contexto reutilizado del primer flujo. |
| `captured_at` | OBLIGATORIO | `2026-11-21T10:15:00-05:00` | Valor de ejemplo, no registro real. |
| `timezone` | OBLIGATORIO | `-05:00` | America/Bogota. |
| `operator_id` | OBLIGATORIO | `NO_DATA` | Sin operador materializado. |
| `consent_id` | OBLIGATORIO | `NO_DATA` | Sin consentimiento documentado. |
| `state` | OBLIGATORIO | `DISENO` | Uno de los 7 estados canónicos. |
| `confidence_declared` | OBLIGATORIO | `NO_DATA` | No se inventa confianza. |
| `modality_set` | OBLIGATORIO | `["image"]` | Modalidad ya ratificada; no se crea otra. |
| `note_ids` | OPCIONAL | `[]` | Solo referencias existentes. |
| `legacy_sample_id` | OPCIONAL | `NO_DATA` | Puente acústico; fuera de este caso. |
| `evidence_id` | PROHIBIDO | — | La raíz no contiene evidencia. |
| `report_id` | PROHIBIDO | — | La raíz no contiene reporte. |
| `doc_id` | PROHIBIDO | — | La raíz no contiene conocimiento. |
| `prediction` / `verdict` / `embedding` / `vector` | PROHIBIDO | — | La plataforma no rellena IA (P6-3). |

---

# 2. `assets.json`

**Rol:** descriptores de bytes observados. **Nunca bytes.**

| Campo | Clasificación | Valor de referencia | Nota |
|---|---|---|---|
| `asset_ref` | OBLIGATORIO | `ASSET-0001` | Etiqueta reutilizada. |
| `observation_ref` | OBLIGATORIO | `OBS-0001` | Enlace a la raíz. |
| `modality` | OBLIGATORIO | `image` | Una de las modalidades ratificadas. |
| `sha256` | OBLIGATORIO | `NO_DATA` | Sin archivo real; no se fabrica huella. |
| `mime_type` | OBLIGATORIO | `image/jpeg` | Declarado. |
| `size_bytes` | OBLIGATORIO | `NO_DATA` | Sin bytes. |
| `state` | OBLIGATORIO | `DISENO` | Heredado de la observación. |
| `class_ids` | OBLIGATORIO | `["tomate", "sintoma_foliar"]` | Vocabulario canónico de VISION_TAXONOMY_V1. |
| `bbox` | OPCIONAL | `NO_DATA` | Requerida solo si hay píxeles reales. |
| `dimensions` | OPCIONAL | `NO_DATA` | Alto × ancho. |
| `exif_policy` | OPCIONAL | `sanitized` | Política declarada, no EXIF real. |
| `raw_bytes` / `base64` | PROHIBIDO | — | El paquete es vista, no copia (PL-5). |
| `evidence_id` / `report_id` | PROHIBIDO | — | Un asset no produce evidencia por sí solo. |
| `new_asset_id` | PROHIBIDO | — | No se emiten IDs nuevos. |

**Regla ENF-1 aplicada:** `tomate` y `sintoma_foliar` van como dos `class_ids` separados; `tomate_con_manchas` queda prohibido.

---

# 3. `events.json`

**Rol:** ocurrencia real vinculada a la observación. No es vocabulario.

| Campo | Clasificación | Valor de referencia | Nota |
|---|---|---|---|
| `event_ref` | OBLIGATORIO | `EVENT-0001` | Etiqueta reutilizada. |
| `observation_ref` | OBLIGATORIO | `OBS-0001` | Raíz. |
| `asset_refs` | OBLIGATORIO | `["ASSET-0001"]` | Asset que sustenta la ocurrencia. |
| `event_type` | OBLIGATORIO | `sintoma_foliar` | Vocabulario, **no** ID. |
| `time_window.start` | OBLIGATORIO | `2026-11-21T10:15:00-05:00` | Ejemplo. |
| `time_window.end` | OBLIGATORIO | `NO_DATA` | Sin duración medida. |
| `state` | OBLIGATORIO | `DISENO` | Heredado. |
| `scene_id` | OPCIONAL | `scene_cultivo` | `scene_id` canónico; nunca `class_id`. |
| `place_id` | OPCIONAL | `parcela_tomate_01` | Contexto. |
| `VISUAL_EVENT_ID` | PROHIBIDO | — | Es vista, no entidad con ID (NSP-03). |
| ID construido con `lluvia` / `plaga` / `sintoma_foliar` | PROHIBIDO | — | Confunde `event_type` con ocurrencia (INS-05). |
| `evt_` emitido por el paquete | PROHIBIDO | — | El prefijo pertenece al productor autorizado. |

---

# 4. `evidence.json`

**Rol:** evidencia mínima derivada. Estado y confianza **heredados**, nunca mejorados.

| Campo | Clasificación | Valor de referencia | Nota |
|---|---|---|---|
| `evidence_ref` | OBLIGATORIO | `EVIDENCE-0001` | Etiqueta reutilizada. |
| `observation_ref` | OBLIGATORIO | `OBS-0001` | Ancla raíz. |
| `asset_refs` | OBLIGATORIO | `["ASSET-0001"]` | Soporte. |
| `event_refs` | OBLIGATORIO | `["EVENT-0001"]` | Ocurrencia. |
| `assertion` | OBLIGATORIO | "Se observa un síntoma foliar en un cultivo de tomate en `scene_cultivo`." | Afirmación mínima. |
| `class_ids` | OBLIGATORIO | `["sintoma_foliar"]` | No se asciende a patógeno. |
| `state` | OBLIGATORIO | `DISENO` | Idéntico al de la observación. |
| `confidence` | OBLIGATORIO | `NO_DATA` | Sin doble revisión. |
| `evidence_version_ids` | OBLIGATORIO | `NO_DATA` | Presente pero vacío de dato; obliga a `PARTIAL` (REP-8). |
| `source` | OBLIGATORIO | `Evidence Ledger (lectura)` | Orden de consumo, no autoría. |
| `pathogen` | OPCIONAL | `NO_DATA` | `mildiu`/`roya` no confirmados. |
| `produced_by = acp` / `kh` / `llm` | PROHIBIDO | — | Ninguno crea evidencia. |
| `state` superior al de la observación | PROHIBIDO | — | Mejora por decreto. |
| `obs_` emitido desde evidencia | PROHIBIDO | — | La evidencia no es raíz. |

---

# 5. `report.json`

**Rol:** interpretación anclada del ACP bajo snapshot `T0`.

| Campo | Clasificación | Valor de referencia | Nota |
|---|---|---|---|
| `report_ref` | OBLIGATORIO | `REPORT-0001` | Etiqueta reutilizada. |
| `materialization` | OBLIGATORIO | `acprep_` | Un reporte, dos representaciones (NSP-06). |
| `snapshot_read` | OBLIGATORIO | `T0` | Registry + Ledger + KH@T0. |
| `anchors` | OBLIGATORIO | `["EVIDENCE-0001", "OBS-0001"]` | Sin anclas no hay reporte válido. |
| `evidence_version_ids` | OBLIGATORIO | `NO_DATA` | Presente; por eso el veredicto es `PARTIAL`. |
| `verdict` | OBLIGATORIO | `PARTIAL` | Vocabulario unificado de la Carta. |
| `confidence_expression` | OBLIGATORIO | `MIN(anclas) × cobertura × penalización no-REAL` | Simbólica; sin número inventado. |
| `kh_snapshot_segment` | OBLIGATORIO | `NO_DATA` | KH@T0 sin publicación previa. |
| `verdicts_allowed` | OBLIGATORIO | `RESOLVED · PARTIAL · NO_DATA · BLOCKED · UNANSWERABLE` | No se crea uno nuevo. |
| `reason` | OPCIONAL | "Sin versión de evidencia; sin publicación KH previa." | Explicación honesta. |
| `verdict = RESOLVED` con `evidence_version_ids=NO_DATA` | PROHIBIDO | — | REP-8. |
| Escritura en Ledger o KH | PROHIBIDO | — | ACP-3 / `IA:C-5`. |
| Creación de `evd_` | PROHIBIDO | — | El ACP no crea evidencia. |
| Veredicto `HIPÓTESIS` | PROHIBIDO | — | No activo; pendiente de G-IA-1. |

---

# 6. `document.json`

**Rol:** vista del resultado del Knowledge Hub en publicación `T1`.

| Campo | Clasificación | Valor de referencia | Nota |
|---|---|---|---|
| `doc_ref` | OBLIGATORIO | `DOC-0001` | Etiqueta reutilizada. |
| `source_report_ref` | OBLIGATORIO | `REPORT-0001` | Candidato de promoción. |
| `publication_snapshot` | OBLIGATORIO | `T1` | Posterior a `T0`; sin realimentación. |
| `title` | OBLIGATORIO | "Observación de síntoma foliar en cultivo de tomate — caso de referencia V1" | — |
| `state` | OBLIGATORIO | `DISENO` | No se declara `REAL` por existir. |
| `promotion_executed` | OBLIGATORIO | `false` | Sin decisión gobernada. |
| `registry_regenerated` | OBLIGATORIO | `false` | No se escribió el registry generado. |
| `classification` | OPCIONAL | `ACTIVE` | Sugerida, no gobernanza nueva. |
| `docsByObservation_view` | OPCIONAL | `NO_DATA` | Vista derivada por lectura; no escrita. |
| `obs_` o `evd_` emitido | PROHIBIDO | — | KCN-14 / KEL-1. |
| `state = REAL` por decreto | PROHIBIDO | — | La promoción no mejora estado. |
| Escritura directa en `knowledgeRegistry.generated.json` | PROHIBIDO | — | Fuente única, vistas derivadas (MP-8). |

---

# 7. `manifest.json`

**Rol:** índice de transporte, huellas y orden. Verifica primero.

| Campo | Clasificación | Valor de referencia | Nota |
|---|---|---|---|
| `package_root` | OBLIGATORIO | `observation_package/` | Contenedor lógico, no materializado. |
| `files` | OBLIGATORIO | 7 entradas | Una por archivo del paquete. |
| `files[].name` | OBLIGATORIO | nombres de los 7 archivos | Sin rutas externas. |
| `files[].sha256` | OBLIGATORIO | `NO_DATA` | Sin archivos reales. |
| `package_sha256` | OBLIGATORIO | `NO_DATA` | Huella del conjunto declarado. |
| `manifest_sha256_excludes_self` | OBLIGATORIO | `true` | Evita autorreferencia imposible. |
| `order` | OBLIGATORIO | `observation → assets → events → evidence → report → document` | Orden canónico. |
| `supersedes` | OBLIGATORIO | `NO_DATA` | Nueva versión si el paquete cambia. |
| `delivery_state` | OBLIGATORIO | `PENDING` | Platform: `PENDING_ACCEPTANCE`. |
| `budget_level` | OPCIONAL | `compact` | Nivel declarado por el consumidor. |
| `governance_baseline` | OPCIONAL | `foundation-stack-v1` | Línea base congelada. |
| Huella inventada | PROHIBIDO | — | `NO_DATA` antes que falsedad. |
| Puntero mutable / URL externa | PROHIBIDO | — | El paquete debe ser autocontenido. |
| `delivery_state = ACCEPTED` sin gate | PROHIBIDO | — | Requiere aceptación gobernada. |

---

# 8. Esqueleto ilustrativo (NO es un archivo creado)

```text
observation_package/
├── observation.json    { observation_ref: OBS-0001, state: DISENO, ... }
├── assets.json         { asset_ref: ASSET-0001, sha256: NO_DATA, ... }
├── events.json         { event_ref: EVENT-0001, event_type: sintoma_foliar, ... }
├── evidence.json       { evidence_ref: EVIDENCE-0001, evidence_version_ids: NO_DATA, ... }
├── report.json         { report_ref: REPORT-0001, verdict: PARTIAL, snapshot_read: T0, ... }
├── document.json       { doc_ref: DOC-0001, publication_snapshot: T1, ... }
└── manifest.json       { package_root: observation_package/, files: [7], ... }
```

> Este bloque es **texto de especificación**. No se ejecutó ningún comando de creación de archivos ni directorios.

---

# 9. Cierre

**7 archivos descritos · 1 estructura oficial · 0 archivos creados · 0 IDs nuevos · 0 taxonomías nuevas.** Los seis nodos reutilizados conservan sus etiquetas y sus anclas. El detalle de validación, fixtures y riesgos está en `CANONICAL_PACKAGE_VALIDATION_V1.md`.

---

*Fin de la estructura del Canonical Observation Package V1. Complementa el documento rector sin modificar los cinco documentos canónicos protegidos.*
