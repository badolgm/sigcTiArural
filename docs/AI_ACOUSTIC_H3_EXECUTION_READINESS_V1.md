# REFERENCE ACOUSTIC CORPUS — H3 EXECUTION READINESS v1

**Misión:** `ACOUSTIC_H3_EXECUTION_READINESS` · **Fecha:** 2026-10-07 · **HEAD:** `a125a66` · **Estado:** SOLO PREPARACIÓN — NO descargar nada todavía
**Base (canonos heredados):**
- `docs/AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` (C0/C1/C2 aprobada) ·
  `docs/AI_ACOUSTIC_REFERENCE_LAYER_ARCHITECTURE_V1.md` (H0, G-REF-1..6, 4 barreras) ·
  `docs/AI_ACOUSTIC_REFERENCE_DATASET_CATALOG.md` (H1, prioridades) ·
  `docs/AI_ACOUSTIC_REFERENCE_INGESTION_PLAN_V1.md` (H2, pipeline 7 pasos + AC-REF + lote mínimo).

**Decisiones aprobadas por Bernardo (2026-10-07, cerradas):**
- ✅ **AudioSet = Ontología únicamente** — C2 solo tablas/anotaciones/YAMNet; jamás audio.
- ✅ **BirdCLEF = diferido** — sin decisión de fuente ⇒ **no se ingesta en H3**; Xeno-canto cubre AVE/INSECTOS.
- ✅ **Abejas = taxonomy v2** — clase futura, fuera de `labels.csv` v1; no entra en C1 ni C0 ahora.
- ✅ **Paisaje rural = taxonomy v2** — idem; no entra en C1 ni C0 ahora.

---

# 0. RESUMEN EJECUTIVO

Con las 4 decisiones de alcance cerradas, H3 queda **sin bloqueos de alcance**. Este documento entrega
la **lista exacta** de fuentes a incorporar, el **lote recomendado**, el **espacio estimado**, los **riesgos
de licencia**, la **secuencia operativa**, el **checklist de arranque** y el **dictamen**. La descarga sigue
prohibida hasta misión de ejecución explícita (H3-EXECUTION).

Fuentes C1 activas (5) + C2 (1): **ESC-50 · FSD50K · Xeno-canto · SONYC-UST · Speech Commands · AudioSet (ontología)**.
Fuera de H3: BirdCLEF (diferido), UrbanSound8K (excluido), `abejas`/`paisaje rural` (taxonomy v2).

---

# 1. LISTA EXACTA DE DATASETS A INCORPORAR PRIMERO (respuesta 1)

| Orden | Fuente | Rol en el ecosistema | Estado tras lote |
|---|---|---|---|
| 1 | **ESC-50** | bootstrap + smoke test pipeline features/modelo | `CONSUMIBLE` |
| 2 | **FSD50K** (subconjunto filtrado) | pretrain 6-7 clases + negatives | `CONSUMIBLE` |
| 3 | **Xeno-canto** | pretrain profundo AVE/INSECTOS + negatives | `CONSUMIBLE` |
| 4 | **SONYC-UST v2.3** | MOTOR + seeds OOD urbano | `CONSUMIBLE` |
| 5 | **Speech Commands v2** | VAD/VOZ + negatives | `CONSUMIBLE` |
| 6 | **AudioSet** (C2) | ontología + YAMNet class map + anotaciones | ontología disponible |

**NO se incorporan en H3:** BirdCLEF (diferido por decisión) · UrbanSound8K (excluido, consolidado) ·
`abejas`/`paisaje rural` (taxonomy v2, no existen en v1) · cualquier grabación de AudioSet (audio no distribuido).

---

# 2. VOLUMEN RECOMENDADO INICIAL (respuesta 2)

Lote mínimo C1 = **≈9.500 clips contratados** + **C2 tablas/ontología** (sin clips).

| Fuente | Clips consumidos | Clips descargados (bruto) | Licencia objetivo del lote |
|---|---|---:|---:|---|
| ESC-50 | **2.000** | 2.000 (completo) | NC marcado (ESC-10 CC BY) |
| FSD50K | **3.500** | solo clips de la lista filtrada ≈3.500 | CC0 · CC-BY únicamente |
| Xeno-canto | **1.000** | ≈1.000 seleccionados | excl. `ND`; NC/SA marcados |
| SONYC-UST | **2.000** | subconjunto (priorizar 1.385 verificadas) | CC BY 4.0 |
| Speech Commands | **1.000** | 1.000 (muestra balanceada 35 palabras) | CC BY 4.0 |
| AudioSet (C2) | — | ontología + class_map | CC BY / CC BY-SA |
| **Total C1** | **9.500** | **≈9.500 usados + descargas oficiales** | — |

Regla: cada clip pasa **AC-REF 1..8** antes de `FILTRADO`; con manifest + checksums pasa a `INVENTARIADO`;
con gobernanza schema lista, a `CONSUMIBLE`. Nada se ingiere "por defecto": solo lo de la tabla.

---

# 3. ESPACIO APROXIMADO REQUERIDO (respuesta 3)

Estimaciones del WAV PCM16 mono; las cifras **bruto origen** están marcadas como **ESTIMADO** (verificar
huella/tamaño real durante la descarga) salvo `verificado`.

| Fuente | Bruto descarga origen | Consumido (lote) | Verificado |
|---|---|---|---:|---|
| ESC-50 | 0,4–0,5 GB | ≈0,44 GB (2.000×~220 KB) | verificado (~430 MB) |
| FSD50K (selectivo) | ~1,0–1,5 GB | ≈0,9 GB (3.500 ventanas 3 s) | ESTIMADO |
| FSD50K (dev completo) | ~60–70 GB | idem | ESTIMADO |
| Xeno-canto | 0,3–1,0 GB | ≈0,26 GB (1.000×~264 KB) | ESTIMADO (variable) |
| SONYC-UST v2.3 | ~15–20 GB | ≈0,5 GB (2.000×~264 KB) | **NO VERIFICADO** (H1) |
| Speech Commands v2 | ~3,8 GB tar.gz | ≈0,09 GB (1.000×~88 KB) | verificado (~3,8 GB) |
| AudioSet (C2) | ~0,1 GB | ~0,1 GB | ESTIMADO |
| Features `feat.window.v2` | — | ~0,5–1,0 GB | ESTIMADO |

**Recomendación de espacio:**
- **Ruta recomendada (FSD50K selectivo):** ≈ **22–25 GB** de disco libre (descarga bruta + consumido + features).
- Ruta alternativa (FSD50K dev completo): ≈ **80–90 GB**; solo si el ancho de banda y el almacenamiento la justifican.
- El `reference/` final (audio consumido + features + manifests) cabe en **≈3–4 GB**.

---

# 4. RIESGOS DE LICENCIA (respuesta 4)

| Fuente | Riesgo | Mitigación |
|---|---|---|
| ESC-50 | `NC` global ⇒ modelo derivado **no comercial** | marcar `nc` en manifest; aislar de cualquier consumo comercial |
| FSD50K | `CC Sampling+` / `NC` en parte de clips | lote mínimo **solo CC0/CC-BY**; resto apartado; decisión de vocabulario pendiente |
| Xeno-canto | licencia **por grabación**; `ND` + mezclas | filtro por clip; **excluir `ND`**; `NC`/`SA` marcados (G-REF-2) |
| SONYC-UST | `CC BY` ⇒ **atribución obligatoria** | registrar autor/DOI en `provenance` de cada clip |
| Speech Commands | `CC BY` ⇒ atribución | idem |
| AudioSet (C2) | ontología `CC BY-SA` ⇒ **derivados SA** | C2 **aislado** de C0 y de modelos evaluables; solo tablas |
| Transversal | features/weights entrenados con REF **heredan** restricciones (NC/SA/Sampling+) | honestidad de reporting; modelo REF nunca se promueve a `REAL-LOCAL` |
| Transversal | atribuciones perdidas en batch | `provenance` por clip obligatorio antes de `FILTRADO`; checksum por fuente |

---

# 5. SECUENCIA OPERATIVA (respuesta 5)

Orden derivado del catálogo H1 (con BirdCLEF eliminado), ejecutable por lotes:

```
H3.0  PRERREQUISITOS      → checklist §6 completado + orden de ejecución
H3.1  ESC-50              → valida el pipeline completo de punta a punta (descarga→manifest→features)
H3.2  FSD50K (selectivo)  → lote solo CC0/CC-BY; ventanas de features 3,0 s
H3.3  Xeno-canto          → GBIF pre-selección + descarga por cuotas (Anubis); filtro ND
H3.4  SONYC-UST v2.3      → subconjunto (inicio: 1.385 verificadas  → llenado MOTOR)
H3.5  Speech Commands v2  → muestra balanceada; `_background_noise_` NO es silencio (OOD)
H3.6  AudioSet (C2)       → ontología + YAMNet class map (jamás audio)
H3.7  CIERRE DE LOTE      → 5 manifest_ref + `reference_manifest.yaml` + checksums + tarjeta del corpus
```

Cada fuente: `PLANIFICADO → DESCARGADO → VALIDADO → FILTRADO → INVENTARIADO → CONSUMIBLE`, con evidencia
(hash, manifest, AC-REF) en cada transición (G-REF-1..6). Nada salta a `CONSUMIBLE` sin `schema.json` listo
para `partition=reference` (precondición D5 del §6).

---

# 6. CHECKLIST H3 (respuesta 6)

**Alcance cerrado (✅ hoy):**
- [x] **D1** AudioSet = ontología únicamente
- [x] **D2** BirdCLEF = diferido (sin fuente ⇒ no se ingesta)
- [x] **D3** Abejas = taxonomy v2 (fuera de v1)
- [x] **D4** Paisaje rural = taxonomy v2 (fuera de v1)

**Pendientes de Bernardo antes de ejecutar (no de diseño):**
- [ ] **D5** Extensiones `schema.json` v1 (vocabulario `partition=reference`, `source`, `CC Sampling+`/`SA`): **bloquea `INVENTARIADO`/`CONSUMIBLE`, NO la descarga** (H0 §10 / H2 §10)
- [ ] **D6** Aprobación del lote mínimo §2 (~9.500 clips C1 + C2) y del presupuesto de espacio §3 (~22–25 GB, ruta recomendada)
- [ ] **D7** Credenciales/estrategia de cuotas de **Xeno-canto (Anubis)** y confirmar ancho de banda/alojamiento
- [ ] **D8** Autorización de descarga explícita (**H3-EXECUTION**), que habilita escribir `ingest/<source_id>/` y descargar
- [ ] **D9** Confirmación de integridad: huella del autor de cada artefacto al momento real de la descarga

**No-acciones H3 (invariantes):** sin commits · sin tocar CMSC/S30/S81/S82 · sin `reference/` creado hoy ·
sin entrenamiento · sin promoción de REF a C0.

---

# 7. DICTAMEN (respuesta 7)

> ## GO_H3 — CONDICIONADO ✅
>
> La **preparación** de H3 está lista: lista exacta, lote, espacio, licencias, secuencia y checklist definidos,
> y las 4 decisiones de alcance están cerradas. El dictamen es **GO condicionado a**:
>
> 1. **D5** — extensiones de vocabulario `schema.json` (prerrequisito de consumo REF; NO de descarga).
> 2. **D6** — aprobación del lote ~9.500 y del espacio ~22–25 GB.
> 3. **D7** — credenciales Xeno-canto + capacidad de almacenamiento/red.
> 4. **D8** — orden explícita de **H3-EXECUTION** (esta misión NO autoriza descargar).
> 5. **D9** — verificación de integridad al momento real.
>
> Ejecución bloqueada por diseño hasta completar D5–D9. **Sin estos gates: NO_GO para la descarga.**

---

# 8. NO-ACCIONES CONFIRMADAS Y TRAZABILIDAD

**Confirmado hoy:** no se descargó nadío; el árbol `reference/` no existe en disco; no se tocó `schema.json`,
`labels.csv`, manifiestos, gobernanza C0, CMSC, S30, S81, S82, frontend ni backend; sin commits.

| Decisión de la misión | Estado |
|---|---|
| AudioSet = ontología | ✅ cerrada (C2 exclusivo) |
| BirdCLEF = diferido | ✅ cerrada (0 clips en H3) |
| Abejas = taxonomy v2 | ✅ cerrada (no entra en v1) |
| Paisaje rural = taxonomy v2 | ✅ cerrada (no entra en v1) |
| Lote mínimo H3 | ★ §2 (**_pendiente D6_**) |
| Espacio recomendado | ★ §3 (**_pendiente D6_**) |
| Veredicto | ★ GO_H3 CONDICIONADO (**_pendiente D5–D9_**) |

Próxima misión sugerida: **`H3_EXECUTION`** (resolver D5–D9 → autorizar descarga → pipeline H3.1..H3.7).
Cadena previa: STRATEGY → H0 → H1 → H2 → **H3 (readiness, este documento)**.