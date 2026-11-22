# CANONICAL OBSERVATION PACKAGE V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-21T16:37:21-05:00
> - Origen: misión `SIGCTIARURAL_CANONICAL_OBSERVATION_PACKAGE_V1` (documento nuevo)
> - Destino: `docs/governance/CANONICAL_OBSERVATION_PACKAGE_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: especificación contractual. **No crea el directorio `observation_package/` ni ninguno de los siete archivos JSON.** No modifica los cinco documentos canónicos enumerados en la misión.

**Misión:** `SIGCTIARURAL_CANONICAL_OBSERVATION_PACKAGE_V1`
**Base:** Foundation Stack V1 · rama/tag `foundation-stack-v1` · HEAD `c371d4f`
**Caso de referencia:** cultivo de tomate · `FIRST_REFERENCE_FLOW_REPORT_V1.md`
**Instancia reutilizada:** `FOUNDATION_REFERENCE_INSTANCE_V1.md`

| Documento | Autoridad |
|---|---|
| `CANONICAL_OBSERVATION_PACKAGE_V1.md` | Identidad del paquete, estructura oficial, alcance y veredicto |
| `CANONICAL_PACKAGE_STRUCTURE_V1.md` | Contenido mínimo de los 7 archivos: obligatorio / opcional / prohibido |
| `CANONICAL_PACKAGE_VALIDATION_V1.md` | Reglas de integridad, trazabilidad, custodia, exportación e importación; 10 fixtures; 20 riesgos |

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Documentos nuevos creados | **3** (solo Markdown) |
| Directorio `observation_package/` creado en disco | **NO** |
| Archivos `observation.json` · `assets.json` · `events.json` · `evidence.json` · `report.json` · `document.json` · `manifest.json` creados | **0** |
| Código / API / BD / UI / esquemas ejecutables | **0** |
| IDs raíz nuevos | **0** |
| Gobernanzas / taxonomías / modalidades nuevas | **0** |
| Documentos canónicos prohibidos modificados | **0** |
| `git add` / `commit` / `push` / `merge` / `tag` | **0** |

> Los siete nombres de archivo son **nombres de contrato**, no archivos existentes. Los seis valores `OBS-0001` … `DOC-0001` son las **etiquetas de referencia ya definidas**, no IDs emitidos. No se materializa ninguno.

---

# 1. Qué es el paquete canónico

El **Canonical Observation Package V1** es la **serialización de transporte mínima y verificable** del `ObservationPackage` descrito en Observation Platform V1 §3.6, para que una observación completa pueda viajar desde Observation Platform hasta Knowledge Hub sin perder `observation_id` ni trazabilidad.

**No es:**

- un nuevo registro, un nuevo ledger, un nuevo ACP ni un nuevo Knowledge Hub;
- una copia de los bytes de los assets (PL-5: es vista inmutable, no duplicado);
- una gobernanza nueva: se subordina a los cinco documentos que la misión prohíbe modificar;
- una implementación: es solo contrato y especificación.

**Es:**

- una **vista inmutable derivada**;
- un **sobre de transporte** con siete documentos JSON declarados;
- una **frontera verificable** entre captura,Registry, Ledger, ACP y KH.

## 1.1 Compatibilidad con Platform V1 (sin modificarlo)

| Platform V1 | Paquete canónico V1 | Relación |
|---|---|---|
| §3.6 bloques Identidad · Procedencia · Honestidad | `observation.json` | Misma semántica, serializada |
| §3.6 bloque Assets | `assets.json` | Descriptores, nunca bytes |
| §3.6 bloque Eventos | `events.json` | `event_ids[]` vacío en captura; aquí se documenta el evento de curación de referencia |
| §3.6 bloque Evidencia | `evidence.json` | En captura queda vacío; el paquete de referencia lo declara con `NO_DATA` explícito |
| §3.6 bloque Entrega + ACP | `report.json` | Vista del reporte, no contenido generado por la plataforma |
| §3.6 bloque Integridad | `manifest.json` | Índice de transporte; **no sustituye** `delivery_manifest.yaml` |
| — | `document.json` | Vista del resultado KH en `T1` |
| §4.1 `metadata/observation_package.json` | `manifest.json` | Serialización de transporte derivada; la vista de origen permanece intacta |

> No se crea un `observation_package.json` nuevo: el nombre exigido por la misión es `manifest.json`, con rol de índice de transporte. `delivery_manifest.yaml` sigue en `PENDING_ACCEPTANCE` según Platform P6-6/G-OP-6.

---

# 2. Estructura oficial

```
observation_package/                    ← CONTENEDOR LÓGICO (no materializado)
│
├── observation.json                    ← raíz · identidad · procedencia · honestidad
├── assets.json                         ← descriptores de asset (sin bytes)
├── events.json                         ← ocurrencias vinculadas
├── evidence.json                       ← evidencia mínima derivada
├── report.json                         ← reporte ACP bajo snapshot T0
├── document.json                       ← documento KH en publicación T1
└── manifest.json                       ← índice · huellas · orden · supersedes
```

**Orden canónico de lectura:** `observation → assets → events → evidence → report → document → manifest`.
**Orden de validación:** `manifest` verifica primero; luego se recorre el orden canónico.

> El orden de lectura es obligatorio: ningún consumidor puede interpretar `evidence.json` antes de haber resuelto `observation.json`.

---

# 3. Los seis nodos reutilizados

| Etiqueta | Archivo que la transporta | Rol | Estado |
|---|---|---|---|
| `OBS-0001` | `observation.json` · `manifest.json` | Raíz única | `DISENO` |
| `ASSET-0001` | `assets.json` | Asset de imagen (tomate + síntoma foliar) | `DISENO` |
| `EVENT-0001` | `events.json` | Ocurrencia de síntoma foliar | `DISENO` |
| `EVIDENCE-0001` | `evidence.json` | Evidencia mínima, anclas heredadas | `DISENO` |
| `REPORT-0001` | `report.json` | Reporte ACP, veredicto `PARTIAL` | `DISENO` |
| `DOC-0001` | `document.json` | Documento KH de referencia | `DISENO` |

**Regla de oro del paquete:** las seis etiquetas aparecen, se enlazan y se retrotraen. No se genera ninguna séptima etiqueta. En producción, cada etiqueta se sustituiría por el ID emitido por su dueño; en este paquete de referencia se conservan literalmente.

---

# 4. Contenido mínimo (resumen)

| Archivo | Obligatorio (mínimo) | Opcional | Prohibido |
|---|---|---|---|
| `observation.json` | referencia raíz · versión de modelo · versión de gobernanza · procedencia · `state` · `modality_set` | notas · `consent_id` | evidencia · veredicto · predicción · embedding |
| `assets.json` | referencia de asset · referencia a la raíz · modalidad · `sha256` · `mime_type` · `state` | `bbox` · dimensiones · `exif_policy` | bytes · base64 · IDs de evidencia/reporte |
| `events.json` | referencia de evento · raíz · assets vinculados · `event_type` · ventana temporal | `scene_id` · `place_id` | usar `event_type` como ID · generar `evt_` nuevo |
| `evidence.json` | referencia de evidencia · anclas · afirmación · `state` heredado · `evidence_version_ids` | confianza declarada · método | `produced_by=acp/kh/llm` · mejorar estado |
| `report.json` | referencia de reporte · snapshot leído · anclas · veredicto · `evidence_version_ids` | expresión de confianza | `RESOLVED` sin versiones · escritura en Ledger/KH |
| `document.json` | referencia de documento · reporte de origen · snapshot de publicación · título · `state` | clasificación sugerida | emitir `obs_`/`evd_` · `REAL` por decreto |
| `manifest.json` | lista de 7 archivos · huellas · orden · `package_sha256` · `supersedes` · estado de entrega | nivel de presupuesto | huellas falsas · punteros mutables · URL externa |

El detalle campo por campo está en `CANONICAL_PACKAGE_STRUCTURE_V1.md`.

---

# 5. Familias de reglas

| Familia | Objeto | Resumen |
|---|---|---|
| Integridad | que el paquete esté completo y no se contradiga | 9 reglas |
| Trazabilidad | que cada nodo pueda retroceder hasta `OBS-0001` | 8 reglas |
| Custodia | que el paquete sea inmutable, versionado y verificable | 7 reglas |
| Exportación | que salga sin bytes, sin IA y con estado honesto | 6 reglas |
| Importación | que entre sin crear entidades ni mejorar estados | 6 reglas |

**Umbral global:** cualquier incumplimiento de una regla de integridad o trazabilidad ⇒ `BLOCKED`. Un incumplimiento de custodia/exportación/importación ⇒ `PARTIAL` o `BLOCKED` según se indica en `CANONICAL_PACKAGE_VALIDATION_V1.md`.

---

# 6. Recorrido validado

| Paso | Archivo | Capa | Resultado |
|---|---|---|---|
| 1 | `observation.json` | Observation Platform | ✅ raíz emitida, sin ancla previa |
| 2 | `assets.json` | Platform / Multimodal | ✅ `ASSET-0001` cuelga de `OBS-0001` |
| 3 | `events.json` | Multimodal / dominio | ✅ `EVENT-0001` ≠ `event_type` |
| 4 | `evidence.json` | Evidence Ledger | ✅ estado heredado, sin nueva raíz |
| 5 | `report.json` | ACP (`T0`) | ✅ `PARTIAL` por `evidence_version_ids=NO_DATA` |
| 6 | `document.json` | KH (`T1`) | ✅ sin realimentación de `T0` |
| 7 | `manifest.json` | Transporte | ✅ orden y huellas declarados (huellas reales `NO_DATA`) |

**Resultado: 7/7 pasos recorridos, 0 rupturas estructurales.**

---

# 7. Fixtures y riesgos

- **10 fixtures de rechazo** en `CANONICAL_PACKAGE_VALIDATION_V1.md` §4: paquete sin raíz, sin evidencia, IDs duplicados, trazabilidad rota, `RESOLVED` sin versiones, KH emitiendo `obs_`, ciclo `T1→T0`, `NO_DATA=0`, estado mejorado y huella falsa.
- **20 riesgos** con severidad, umbral y mitigación en `CANONICAL_PACKAGE_VALIDATION_V1.md` §5.

---

# 8. Veredicto

> **SÍ — existe la primera especificación oficial del Canonical Observation Package V1, capaz de transportar una observación completa desde Observation Platform hasta Knowledge Hub sin romper `OBSERVATION_ID` ni la trazabilidad del Foundation Stack V1.**

**Precisiones obligatorias:**

- El paquete **no existe en disco**: solo su contrato.
- Los seis valores son etiquetas de referencia, no IDs de dominio.
- Las huellas criptográficas son `NO_DATA`: no se fabrica un `sha256` sin bytes.
- El veredicto de transporte es `PARTIAL` allí donde el dato falta; nunca `RESOLVED` por decreto.
- No se modificaron Observation Platform V1, Registry V1, Ledger V1, ACP V1 ni KH V1.

---

*Fin del Canonical Observation Package V1. Complementa —nunca sustituye ni modifica— la línea base canónica, la instancia de referencia y el primer flujo documental.*
