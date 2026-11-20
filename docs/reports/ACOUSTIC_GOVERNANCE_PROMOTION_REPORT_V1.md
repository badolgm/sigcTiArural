# INFORME DE PROMOCIÓN DE LA GOBERNANZA ACÚSTICA V2

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T18:17:38-05:00
> - Origen: misión `SIGCTIARURAL_ACOUSTIC_GOVERNANCE_PROMOTION_V1`
> - Destino: `docs/reports/ACOUSTIC_GOVERNANCE_PROMOTION_REPORT_V1.md` (REPORT; carpeta ya visible en git)
> - Nota: registra validación, diff de `.gitignore`, archivos promovidos, riesgos, compatibilidad y próximos pasos. Sin commit.

**Misión:** `SIGCTIARURAL_ACOUSTIC_GOVERNANCE_PROMOTION_V1`
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `c5bcaeb` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Naturaleza:** promoción documental. Sin código, sin dataset, sin commit, sin push, sin merge, sin tag.
**Veredicto:** **GO_PROMOTION** ✅

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.

---

# 1. Validaciones realizadas (ANTES de modificar nada)

## 1.1 Interpretación de `BAGM_GOBERNANZA`

No existe en el repositorio ningún archivo ni cadena literal `BAGM_GOBERNANZA` (búsqueda recursiva por nombre y contenido: 0 resultados). Se interpreta —de forma declarada y honesta— como el **corpus canónico de gobernanza cuyo autor de la visión es Bernardo Adolfo Gómez Montoya (BAGM)**:

| Documento | Rol |
|---|---|
| `docs/CONSTITUCION_ECOSISTEMA_SIGCT_RURAL_V1.md` (v1.0.1) | Norma superior; regla suprema, 7 estados, P-1..P-13 |
| `docs/CARTA_GOBERNANZA_IA_SIGCT_RURAL_V1.md` (v1.0.1) | Gobernanza IA; veredictos ACP, P-IA-1..7 |
| `docs/DOCUMENTATION_ARCHITECTURE_DECISION_V1.md` (D-003) | Jerarquía documental y conflictos |
| `AGENTS.md` | Estado operativo y reglas de la sesión |

La validación §1.5 se ejecutó contra ese corpus. **No se creó un documento `BAGM_GOBERNANZA`**: cualquier creación habría sido una decisión documental no autorizada.

## 1.2 V1 · Los 6 documentos existen y no están vacíos

| Documento | Bytes | Líneas | SHA-256 (16) |
|---|---:|---:|---|
| `docs/acoustic/taxonomy_v2.md` | 25.388 | 418 | `0D0DF682F2412437` |
| `docs/acoustic/labeling_policy_v2.md` | 10.055 | 173 | `71C9D57BC1127908` |
| `docs/acoustic/secondary_classes_v2.md` | 8.916 | 166 | `1A10BFFEB5C7AB3B` |
| `docs/acoustic/ood_policy_v2.md` | 9.050 | 157 | `0EFA56BE19033F28` |
| `docs/acoustic/annotation_protocol_v2.md` | 11.967 | 204 | `198998105352F619` |
| `docs/acoustic/dataset_v2_roadmap.md` | 12.871 | 265 | `E54DF9764E7E9F9C` |

**Resultado:** ✅ 6/6 existen, 6/6 con contenido, 6/6 con cabecera D-004.6 y marca «listo para promoción futura».

## 1.3 V2 · No son duplicados

- **Hashes:** 6 archivos → **6 hashes únicos**.
- **Colisiones de nombre en todo el repositorio** (excluido `.git`): cada nombre aparece **1 vez**.
- **Cercas Markdown:** balanceadas (0 o 2 por archivo).
- **Tokens idiomáticos erróneos** (caracteres CJK, palabras sueltas en italiano/inglés, referencias incompletas): **0**.

## 1.4 V3 · No rompen la estructura documental existente

| Comprobación | Resultado |
|---|---|
| `docs/` antes de la misión | 20 subdirectorios canónicos (`ai`, `reports`, `historical`, `architecture`, …) |
| `docs/acoustic/` | Nuevo subdirectorio **hermano**, sin renombrar ni absorber ninguno |
| Documentos canónicos sobrescritos | **0** — `git status` inicial no mostraba ningún `docs/` modificado |
| Colisiones con `docs/ai/`, `docs/reports/`, `docs/historical/` | **0** |
| Excepción propuesta en `.gitignore` | Aislada a `docs/acoustic/`; no abre ni cierra otras rutas |
| D-003 | No se modifica; los documentos se ubican en `docs/` (nivel superior de la jerarquía) |

## 1.5 V4 · Coherencia con el corpus de gobernanza (BAGM)

| Principio / norma | Comprobación | Resultado |
|---|---|---|
| P-1 regla suprema | Presente en los 6 documentos | ✅ |
| P-2 honestidad de estado | Presente en los 6; **0 estados inventados** | ✅ |
| 7 estados canónicos | `REAL` · `REAL-LOCAL` · `SIM` · `DISENO` · `ROTO` · `HUERFANO` · `REF` — los 7 aparecen, ninguno nuevo (`REAL_V2`, `IMPLEMENTADO`, `OPERATIVO` = 0) | ✅ |
| P-5 envolver y conectar | Aditividad, `v2/` hermano, sin reescritura | ✅ |
| P-12 fuente única de verdad | Cada doc declara su fuente y subordinación | ✅ |
| Carta IA · veredictos ACP | `ood_policy_v2.md` usa `NO_DATA` · `PARTIAL` · `BLOCKED` · `UNANSWERABLE` | ✅ |
| Carta IA · no fabricación | Las clases nuevas nacen `DISENO` con 0 clips; ACP no inventa clases | ✅ |
| D-004.6 | Cabecera en los 6 + README + este informe | ✅ |
| `rules-v0` | 21 referencias, todas de preservación; 0 modificaciones | ✅ |

**Dictamen de validación:** ✅ **VALIDACIÓN EXITOSA** — se autoriza la implementación de la excepción en `.gitignore`.

---

# 2. Cambios ejecutados

| # | Acción | Estado |
|---|---|---|
| 1 | Excepción `!docs/acoustic/` + `!docs/acoustic/**` en `.gitignore` | ✅ aplicada |
| 2 | `docs/acoustic/README.md` (índice de los 6 documentos) | ✅ generado |
| 3 | `docs/reports/ACOUSTIC_GOVERNANCE_PROMOTION_REPORT_V1.md` | ✅ generado |
| 4 | `git add` | ⛔ **NO ejecutado** |
| 5 | `commit` / `push` / `merge` / `tag` | ⛔ **NO ejecutados** |
| 6 | Código, dataset, `labels.csv`, `schema.json`, `metadata.csv`, `acoustic_features_v2.csv`, `rules-v0`, captura rápida/experta | ⛔ **Intactos** |

**Nota sobre «lista para commit»:** se interpreta como *visible para git y sin conflictos*, no como *staged*. No se ejecutó `git add` para no alterar el índice sin autorización explícita (regla `AGENTS.md`: no `git add -A` sin permiso).

---

# 3. Diff exacto de `.gitignore`

## 3.1 Antes (estado en `HEAD=c5bcaeb`, líneas 194–197)

```text
# Historical Documentation (FASE 7M — bitácoras secundarias archivadas, gobernanza V8)
!docs/historical/
!docs/historical/**

# Diagram archive (FASE 6B — archivos retirados de docs/diagrams/ sin equivalente V8)
```

## 3.2 Después (líneas 194–203)

```text
# Historical Documentation (FASE 7M — bitácoras secundarias archivadas, gobernanza V8)
!docs/historical/
!docs/historical/**

# Acoustic Governance V2 (taxonomía, etiquetado, universales, OOD, anotación y roadmap)
# Misión SIGCTIARURAL_ACOUSTIC_GOVERNANCE_PROMOTION_V1 — mismo patrón que docs/ai/, docs/reports/, docs/historical/
!docs/acoustic/
!docs/acoustic/**

# Diagram archive (FASE 6B — archivos retirados de docs/diagrams/ sin equivalente V8)
```

## 3.3 Diff literal (`git diff -- .gitignore`)

```diff
diff --git a/.gitignore b/.gitignore
index 0618796..eb7ad8a 100644
--- a/.gitignore
+++ b/.gitignore
@@ -195,6 +195,11 @@ docs/sena_artifacts/PnatallasReadme_Vistas.docx
 !docs/historical/
 !docs/historical/**
 
+# Acoustic Governance V2 (taxonomía, etiquetado, universales, OOD, anotación y roadmap)
+# Misión SIGCTIARURAL_ACOUSTIC_GOVERNANCE_PROMOTION_V1 — mismo patrón que docs/ai/, docs/reports/, docs/historical/
+!docs/acoustic/
+!docs/acoustic/**
+
 # Diagram archive (FASE 6B — archivos retirados de docs/diagrams/ sin equivalente V8)
 # docs/diagrams/ no tenía excepción previa (solo visible por archivos ya trackeados);
 # git no permite re-incluir una ruta si su directorio padre sigue excluido, por eso
```

El patrón replica exactamente el de `docs/ai/` (183–184), `docs/reports/` (187–188) y `docs/historical/` (195–196): **una entrada para el directorio + una para su contenido**.

---

# 4. Archivos promovidos (visibles para git)

| Archivo | `check-ignore -q` | Visibilidad |
|---|---|---|
| `docs/acoustic/taxonomy_v2.md` | no ignorado (regla `!docs/acoustic/**`) | ✅ |
| `docs/acoustic/labeling_policy_v2.md` | no ignorado | ✅ |
| `docs/acoustic/secondary_classes_v2.md` | no ignorado | ✅ |
| `docs/acoustic/ood_policy_v2.md` | no ignorado | ✅ |
| `docs/acoustic/annotation_protocol_v2.md` | no ignorado | ✅ |
| `docs/acoustic/dataset_v2_roadmap.md` | no ignorado | ✅ |
| `docs/acoustic/README.md` | no ignorado | ✅ |
| `docs/reports/ACOUSTIC_GOVERNANCE_PROMOTION_REPORT_V1.md` | no ignorado (regla `!docs/reports/**`, preexistente) | ✅ |

`git status --short` tras la promoción:

```text
 M .gitignore
 M src/frontend/src/pages/cmsc/orchestration/AcousticFirstResultCard.jsx
 M src/frontend/src/pages/cmsc/orchestration/OrchestrationZoneV2.jsx
 M src/frontend/src/pages/cmsc/orchestration/acousticBridge.js
 M tools/cmsc-data-logger/bridge/server.js
?? docs/acoustic/
?? src/frontend/src/pages/cmsc/orchestration/AcousticQuickCapture.jsx
```

- `docs/acoustic/` pasó de **`!!` (ignorado)** a **`??` (visible)** → **promoción demostrada**.
- Los 4 archivos `M` y `AcousticQuickCapture.jsx` son **preexistentes** a esta misión y no fueron tocados.
- El informe en `docs/reports/` ya era visible por la excepción preexistente.

**Conteo con `--untracked-files=all`:** 8 archivos nuevos bajo `docs/` (6 + README + informe), todos listados individualmente.

---

# 5. Riesgos detectados

| ID | Riesgo | Severidad | Mitigación aplicada / recomendada |
|---|---|---|---|
| R-1 | `docs/*` podía volver a ocultar la carpeta | 🔴 | Excepción con patrón idéntico a las demás carpetas canónicas; verificada con `check-ignore` |
| R-2 | `BAGM_GOBERNANZA` no existe como documento | 🟡 | Interpretación declarada contra el corpus canónico; no se creó documento falso |
| R-3 | Veredictos de anotación vs veredictos ACP podrían confundirse | 🟡 | Son ejes distintos; `ood_policy_v2.md` usa explícitamente el vocabulario ACP de la Carta IA |
| R-4 | Cohen κ simulado | 🔴 | `PENDING` obligatorio (AN-4 / AN-16); ninguna aproximación |
| R-5 | Confusión `ave` / `aves`, `ruido_desconocido` / `evento_desconocido` | 🟡 | Alias con `alias_of`; `is_ood_bucket=true` y `dir_name=desconocido` preservados |
| R-6 | `git add` podía incluir cambios ajenos | 🔴 | No se ejecutó `git add`; se deja la decisión a Bernardo |
| R-7 | Promoción malinterpretada como autorización de implementación | 🔴 | README e informe declaran explícitamente que `v2/` no existe y que cada fase requiere misión propia |
| R-8 | Archivos preexistentes modificados mezclados en el commit | 🟡 | Se listan por separado; se recomienda commit selectivo por ruta `docs/acoustic/` + `.gitignore` + informe |

---

# 6. Compatibilidad v1 / v2

| Garantía | Estado |
|---|---|
| `v1/` intacto (7 muestras, hashes sin cambio) | ✅ |
| 9 `class_id` v1 sobreviven (7 idénticos + 2 alias) | ✅ |
| `labels.csv`, `schema.json`, `metadata.csv`, `acoustic_features_v2.csv` sin tocar | ✅ |
| `rules-v0` vigente; `rules-v1` no implementado | ✅ |
| `secondary_classes` sin columna nueva | ✅ |
| OOD: `ruido_desconocido` alias activo + `evento_desconocido` sucesor | ✅ |
| Capa universal multi-label opcional, sin clases combinadas | ✅ |
| `v2/` **no creado** | ✅ (por diseño) |

---

# 7. Verificación extra · ¿es suficiente la taxonomía v2 para gobernanza multimodal?

**Pregunta:** ¿audio + imagen + telemetría pueden gobernarse solo con `docs/acoustic/`?

**Dictamen:** **NO — se requiere un documento padre `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1`.**

Razones (fundadas en el propio corpus):

1. **Ámbito de la taxonomía v2 es audio.** Sus ejes (`class_id`, `parent_id`, `secondary_classes`, `scope`) gobiernan eventos acústicos. La imagen y la telemetría no tienen `class_id` análogo aquí.
2. **La escena está explícitamente excluida.** `paisaje rural` se declaró *escena/contexto* (decisión H3 D4) y se relega a `environment` / futuro `scene_id`. Ese `scene_id` **no está definido** en la gobernanza v2.
3. **Faltan contratos de cruce.** No hay identidad de señal entre modalidades, alineación temporal audio↔imagen↔telemetría, reglas de fusión, proveniencia multimodal ni promoción a Evidence Ledger/Knowledge Hub para evidencia compuesta.
4. **Los fondos conceptuales no son canónicos en `docs/`.** `CMSC_F3B_SIGNAL_PRODUCERS_ECOSYSTEM_v1.md` (taxonomía de 8 clases de señal, Envelope Común) y `CMSC_F3D_SIGNAL_NAVIGATION_STRATEGY_v1.md` viven en `Documentacion/Arquitectura/` — repositorio legacy, **por debajo de `docs/` en D-003** y con estado `DISENO`. No pueden servir de padre canónico.
5. **La Constitución exige escala sin rediseño** (P-3, visión pilar 4), pero no ha radioficado un contrato multimodal en `docs/`. El documento padre debe hacerlo.

**Cómo quedaría la jerarquía (DISEÑO — no creado hoy):**

```text
SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1   ← padre (misión futura, docs/)
        ├── docs/acoustic/              ← especialización audio (esta misión)
        ├── (futuro) docs/image/
        └── (futuro) docs/telemetry/
```

La taxonomía v2 es **necesaria y compatible** con ese padre: aporta el vocabulario acústico y el patrón `parent_id`/`secondary_classes`/OOD que el padre podría generalizar. Pero **no lo sustituye**. **No se crea el documento padre en esta misión**: requeriría una misión de gobernanza explícita con su propia validación D-003.

---

# 8. Próximos pasos

| # | Paso | Requiere |
|---|---|---|
| 1 | Revisión y `git add` selectivo de `.gitignore`, `docs/acoustic/` y el informe | Decisión de Bernardo |
| 2 | Commit de promoción (sin push hasta orden explícita) | Orden explícita |
| 3 | Misión futura `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1` | Decisión de gobernanza + validación D-003 |
| 4 | Fase 1 del roadmap: `labels.csv` v2 (61 IDs) + bump con huella sincronizada | Misión explícita |
| 5 | Fase 2: crear `v2/` como directorio hermano | Misión explícita |
| 6 | G-DS-1 adaptado y G-DS-6 con κ real | Evidencia, no simulación |
| 7 | `rules-v1` (no tocar `rules-v0`) | Misión de implementación |

---

# 9. Veredicto final

# GO_PROMOTION

**Justificación:** los 6 documentos existen, no están vacíos, no son duplicados, no rompen la estructura documental y son coherentes con el corpus de gobernanza (Constitución, Carta IA, D-003). La excepción en `.gitignore` replica el patrón canónico y convierte `docs/acoustic/` de ignorado (`!!`) en visible (`??`). Se generaron el índice y este informe. No se tocó código, dataset ni contratos; no hubo `git add`, commit, push, merge ni tag. La gobernanza acústica v2 queda **lista para commit**.

**Único condicionamiento (no bloqueante):** se requiere documento padre `SIGCTIARURAL_MULTIMODAL_GOVERNANCE_V1` para audio + imagen + telemetría; es una misión futura, no un defecto de esta promoción.
