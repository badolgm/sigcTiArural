# VALIDACIÓN DEL CANONICAL OBSERVATION PACKAGE V1

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-21T16:41:00-05:00
> - Origen: misión `SIGCTIARURAL_CANONICAL_OBSERVATION_PACKAGE_V1` (documento nuevo)
> - Destino: `docs/governance/CANONICAL_PACKAGE_VALIDATION_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: validación **contractual**. No ejecuta validadores, no crea archivos, no implementa API.

**Complemento de:** `CANONICAL_OBSERVATION_PACKAGE_V1.md` y `CANONICAL_PACKAGE_STRUCTURE_V1.md`
**Caso:** tomate · `OBS-0001` … `DOC-0001`
**Convención:** la numeración de reglas, fixtures y riesgos es enumeración documental, **no** identificadores de dominio ni códigos de gobernanza.

---

# 0. Principio de validación

> **Un paquete se valida por sus anclas, no por su apariencia.** Todo campo obligatorio ausente es `BLOCKED`. Todo campo obligatorio presente con `NO_DATA` es válido pero degrada el veredicto a `PARTIAL`. Nunca se imputa un dato ausente (ND-2).

**Resultado global del paquete de referencia:** `PARTIAL` por `sha256=NO_DATA`, `evidence_version_ids=NO_DATA` y KH@T0 sin publicación previa. **0 rupturas estructurales.**

---

# 1. Reglas de integridad

| # | Regla | Umbral de fallo |
|---|---|---|
| 1 | Los 7 archivos del paquete están declarados en `manifest.json`. | 1 archivo no declarado ⇒ `BLOCKED` |
| 2 | `observation_ref` es idéntico en `observation`, `assets`, `events`, `evidence`, `report` y `manifest`. | 1 divergencia ⇒ `BLOCKED` |
| 3 | Existe **un solo** `observation_ref` por paquete. | 2 valores distintos ⇒ `BLOCKED` |
| 4 | Cada referencia (`asset_ref`, `event_ref`, `evidence_ref`, `report_ref`, `doc_ref`) se define una vez y se cita solo desde su dueño. | 1 duplicado ⇒ `BLOCKED` |
| 5 | Toda huella requerida está presente; si no hay bytes reales, su valor es `NO_DATA`. | 1 campo ausente ⇒ `BLOCKED` |
| 6 | Campo obligatorio ausente ≠ campo con `NO_DATA`. El primero bloquea; el segundo degrada. | 1 omisión ⇒ `BLOCKED` |
| 7 | Ningún hijo declara un `state` superior al de su padre. | 1 mejora ⇒ `BLOCKED` |
| 8 | `evidence_version_ids` está explícitamente presente, aunque sea `NO_DATA`. | 1 omisión ⇒ `BLOCKED` |
| 9 | `verdict` pertenece al vocabulario permitido; `RESOLVED` exige versiones de evidencia reales. | 1 infracción ⇒ `BLOCKED` |

---

# 2. Reglas de trazabilidad

| # | Regla | Umbral de fallo |
|---|---|---|
| 1 | `assets.json` referencia `OBS-0001`. | 1 asset huérfano ⇒ `BLOCKED` |
| 2 | `events.json` referencia `OBS-0001` y `ASSET-0001`. | 1 enlace ausente ⇒ `BLOCKED` |
| 3 | `evidence.json` referencia observación + asset + evento. | 1 ancla ausente ⇒ `BLOCKED` |
| 4 | `report.json` referencia `EVIDENCE-0001` y `OBS-0001`. | 1 ancla ausente ⇒ `BLOCKED` |
| 5 | `document.json` referencia `REPORT-0001`. | 1 enlace ausente ⇒ `BLOCKED` |
| 6 | Retroceso posible: `DOC-0001 → REPORT-0001 → EVIDENCE-0001 → OBS-0001`. | 1 salto roto ⇒ `BLOCKED` |
| 7 | ACP lee `T0` cerrado; KH publica en `T1`. `T1` nunca realimenta `T0`. | 1 reintroducción ⇒ `BLOCKED` |
| 8 | No se permiten saltos: sin evidencia no hay reporte; sin reporte no hay documento. | 1 salto ⇒ `BLOCKED` |

---

# 3. Reglas de custodia, exportación e importación

## 3.1 Custodia

| # | Regla | Umbral de fallo |
|---|---|---|
| 1 | El paquete es inmutable: un cambio crea otra versión con `supersedes`. | 1 reescritura ⇒ `BLOCKED` |
| 2 | Las huellas se verifican antes de interpretar cualquier archivo. | 1 huella no verificable ⇒ `BLOCKED` |
| 3 | `package_sha256` se recalcula si cambia cualquiera de los 7 archivos. | 1 desactualización ⇒ `BLOCKED` |
| 4 | `manifest.json` excluye su propia huella (`manifest_sha256_excludes_self=true`). | 1 autorreferencia ⇒ `BLOCKED` |
| 5 | `delivery_state` permanece `PENDING` hasta gate de aceptación. | 1 `ACCEPTED` sin gate ⇒ `BLOCKED` |
| 6 | Sin punteros mutables ni URLs externas: el paquete es autocontenido. | 1 puntero externo ⇒ `BLOCKED` |
| 7 | La versión anterior se conserva: NADA DESAPARECE. | 1 borrado ⇒ `BLOCKED` |

## 3.2 Exportación

| # | Regla | Umbral de fallo |
|---|---|---|
| 1 | No se exportan bytes crudos ni `base64`. | 1 campo ⇒ `BLOCKED` |
| 2 | No se exporta IA en bloques de captura: `prediction`/`verdict` solo existen en `report.json`. | 1 aparición fuera de lugar ⇒ `BLOCKED` |
| 3 | No se exportan embeddings ni vectores. | 1 campo ⇒ `BLOCKED` |
| 4 | Los 7 estados canónicos se conservan; no se renombran. | 1 estado inventado ⇒ `BLOCKED` |
| 5 | `NO_DATA` nunca se codifica como `0`, `null` ni fila ausente. | 1 imputación ⇒ `BLOCKED` |
| 6 | `class_ids` y `scene_id` provienen solo del vocabulario canónico vigente. | 1 valor inventado ⇒ `BLOCKED` |

## 3.3 Importación

| # | Regla | Umbral de fallo |
|---|---|---|
| 1 | El importador no emite `obs_` ni ningún ID raíz. | 1 emisión ⇒ `BLOCKED` |
| 2 | El importador no crea taxonomías ni modalidades. | 1 creación ⇒ `BLOCKED` |
| 3 | El importador no mejora estados ni confianza. | 1 mejora ⇒ `BLOCKED` |
| 4 | El importador no escribe en Registry, Ledger ni KH. | 1 escritura ⇒ `BLOCKED` |
| 5 | El importador no reprocesa `T1` dentro de `T0`. | 1 reproceso ⇒ `BLOCKED` |
| 6 | Un paquete que reemplaza a otro debe declarar `supersedes`. | 1 ausencia ⇒ `REJECTED` |

---

# 4. Diez fixtures de rechazo

| # | Entrada inválida | Resultado esperado | Regla aplicada |
|---|---|---|---|
| 1 | Paquete sin `observation_ref` en `observation.json` | `BLOCKED` | Integridad 2 · Trazabilidad 1 |
| 2 | Paquete sin `evidence_ref` (archivo ausente o campo omitido) | `BLOCKED` | Integridad 8 · Trazabilidad 8 |
| 3 | Paquete con `ASSET-0001` definido dos veces | `BLOCKED` | Integridad 4 |
| 4 | `EVIDENCE-0001` sin `observation_ref` | `BLOCKED` | Trazabilidad 3 |
| 5 | `REPORT-0001` con `verdict=RESOLVED` y `evidence_version_ids=NO_DATA` | `BLOCKED` | Integridad 9 · REP-8 |
| 6 | `DOC-0001` emitiendo `obs_...` o `evd_...` | `BLOCKED` | Importación 1 · KCN-14 / KEL-1 |
| 7 | Resultado de `T1` reintroducido en `T0` | `BLOCKED` | Trazabilidad 7 · SNP-05 |
| 8 | `sha256=0` o `sha256=null` en `assets.json` | `BLOCKED` | Exportación 5 · ND-2 |
| 9 | `state=REAL` en un nodo cuyo padre es `DISENO` | `BLOCKED` | Integridad 7 · INS-06 |
| 10 | `sha256` con valor inventado para un archivo inexistente | `BLOCKED` | Custodia 2 · Integridad 5 |

**Nota sobre el fixture 2:** en captura, Platform permite `evidence_ids[]` vacío. En el **paquete canónico de transporte** el campo `evidence_ref` debe existir; si no hay evidencia derivada, se declara con `NO_DATA` y el veredicto global pasa a `PARTIAL`. Omitirlo es `BLOCKED`.

---

# 5. Los 20 riesgos más importantes del paquete canónico

| # | Riesgo | Severidad | Umbral | Mitigación |
|---|---|---|---|---|
| 1 | Ausencia de la raíz `OBS-0001` | 🔴 | 1 paquete sin `observation_ref` | Validación de integridad 2 antes de cualquier lectura |
| 2 | Duplicidad de identificadores de referencia | 🔴 | 1 duplicado | Índice único por tipo de referencia en `manifest.json` |
| 3 | Evidencia huérfana sin anclas | 🔴 | 1 ancla ausente | Exigir observación + asset + evento en `evidence.json` |
| 4 | Veredicto inflado a `RESOLVED` | 🔴 | 1 sin versiones de evidencia | REP-8: forzar `PARTIAL` |
| 5 | Autoría prohibida (`acp`/`kh`/`llm` como productor de evidencia) | 🔴 | 1 campo `produced_by` inválido | Prohibición explícita en `evidence.json`; fixture 5/6 |
| 6 | Ciclo snapshot `T1 → T0` | 🔴 | 1 reintroducción | Frontera `T0` inmutable; SNP-05 |
| 7 | KH emitiendo `obs_` o `evd_` | 🔴 | 1 emisión | KCN-14 / KEL-1; verificación de salida |
| 8 | Huella falsa o no verificable | 🔴 | 1 `sha256` inventado | `NO_DATA` obligatorio sin bytes; custodia 2 |
| 9 | `NO_DATA` imputado como `0`/`null` | 🔴 | 1 imputación | ND-2; fixture 8 |
| 10 | Mejora de estado por decreto | 🔴 | 1 hijo superior al padre | Integridad 7; INS-06 |
| 11 | Bytes crudos o `base64` dentro del paquete | 🟡 | 1 campo | Exportación 1; descriptores, nunca copias |
| 12 | Campo prohibido presente | 🟡 | 1 aparición | Tablas por archivo en el documento de estructura |
| 13 | `manifest.json` incompleto | 🟡 | 1 archivo no listado | Integridad 1 |
| 14 | Reemplazo sin `supersedes` | 🟡 | 1 reemplazo | Custodia 1 · importación 6 |
| 15 | Modalidad no ratificada | 🟡 | 1 valor fuera del conjunto vigente | USO exclusivo de `image` en este caso |
| 16 | `event_type` usado como identificador | 🟡 | 1 ocurrencia | INS-05; NSP-03 |
| 17 | Confianza numérica inventada | 🟡 | 1 número sin base | Expresión simbólica en `report.json` |
| 18 | `delivery_state=ACCEPTED` sin gate | 🟡 | 1 aparición | Custodia 5; Platform G-OP-6 |
| 19 | Escritura del importador en fuentes canónicas | 🟡 | 1 escritura | Importación 4; solo lectura |
| 20 | Audio sin `observation_id` nativo (H-01) | 🟢 | 0 ejercitado en este paquete | Fuera de alcance; misión propia con `supersedes` |

---

# 6. Recorrido extremo a extremo validado

| Paso | Archivo | Capa | Entrada → Salida | Resultado |
|---|---|---|---|---|
| 1 | `observation.json` | Observation Platform | captura → `OBS-0001` | ✅ raíz, sin ancla previa |
| 2 | `assets.json` | Platform / Multimodal | `OBS-0001` → `ASSET-0001` | ✅ asset hijo, sin bytes |
| 3 | `events.json` | Multimodal / dominio | `ASSET-0001` → `EVENT-0001` | ✅ ocurrencia ≠ vocabulario |
| 4 | `evidence.json` | Evidence Ledger | anclas → `EVIDENCE-0001` | ✅ estado heredado |
| 5 | `report.json` | ACP (`T0`) | evidencia → `REPORT-0001` | ✅ `PARTIAL` honesto |
| 6 | `document.json` | KH (`T1`) | reporte → `DOC-0001` | ✅ sin realimentación |
| 7 | `manifest.json` | Transporte | 7 archivos → huella declarada | ✅ orden y `supersedes` declarados |

**7/7 pasos · 0 rupturas · 1 raíz · 10 fixtures · 20 riesgos gobernados.**

---

# 7. Veredicto

> **SÍ — el paquete puede transportar la observación completa desde Observation Platform hasta Knowledge Hub sin romper `OBSERVATION_ID` ni la trazabilidad del Foundation Stack V1.**

**Precisiones finales:** el paquete no existe en disco; huellas y versiones reales son `NO_DATA`; el veredicto transportado es `PARTIAL`; no se crearon IDs, gobernanzas ni taxonomías; no se ejecutaron validadores ni operaciones Git.

---

*Fin de la validación del Canonical Observation Package V1. Complementa el documento rector y la estructura sin modificar los cinco documentos canónicos protegidos.*
