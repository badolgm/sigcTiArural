# FIELD PILOT EXECUTION PLAN

**Misión:** `CMSC_ORCHESTRATION_V2_FIELD_PILOT_EXECUTION`  
**Fecha:** 2026-10-05  
**Estado:** PLAN OPERATIVO · NO EJECUTADO  
**Base:** `CMSC_ORCHESTRATION_V2_DESIGN.md` + `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` §5  
**Infraestructura:** Fase 1 + 2A + 2B + 2C implementadas y auditadas

---

## 0. ESTADO HONESTO

| Elemento | Estado |
|---|---|
| Infraestructura de captura | ✅ Implementada |
| Group split | ✅ Implementado |
| Holdout de sitio | ✅ Implementado |
| Doble revisión | ✅ Implementada |
| Validación PILOT-1..7 | ✅ Implementada |
| **Evidencia de campo** | ⏳ **PENDIENTE** |
| **100 muestras reales** | ⏳ **PENDIENTE** |
| **Ejecución real de PILOT-1..7** | ⏳ **PENDIENTE** |

**Este plan NO afirma que PILOT-1..7 están cumplidos. Afirma que la infraestructura está lista.**

---

## 1. CLASES OBJETivo

8 clases vivas (excluye `ruido_desconocido` por diseño: es bucket OOD, no se captura a demanda).

| # | Clase | Descripción | Criterio de inclusión |
|---|---|---|---|
| 1 | `silencio` | Piso de ruido del entorno | Sin evento dominante > 0.05 en 3s |
| 2 | `viento` | Flujo audible continuo, banda ancha baja | Sin lluvia/agua/voz dominantes |
| 3 | `lluvia` | Precipitación audible | **Jamás simular con aspersor** |
| 4 | `agua` | Goteo, curso u oleaje | Sin precipitación dispersa simultánea |
| 5 | `insectos` | Estruidulación audible | `hour_local` obligatorio (típicamente nocturno) |
| 6 | `ave` | Vocalización | Sin estruidulación dominante |
| 7 | `voz` | Habla, no música | **Consentimiento obligatorio** |
| 8 | `motor` | Motor/maquinaria en operación | Sin voz/lluvia dominantes |

---

## 2. DISTRIBUCIÓN DE MUESTRAS POR CLASE

| Clase | Aceptados | Vacantes (×1,5) | Sesiones | Lugares distintos |
|---|---:|---:|---:|---:|
| `silencio` | 12 | 18 | 2 | 2 |
| `viento` | 12 | 18 | 2 | 2 |
| `lluvia` | 12 | 18 | 2 | 2 |
| `agua` | 13 | 20 | 2 | 2 |
| `insectos` | 13 | 20 | 2 | 2 |
| `ave` | 13 | 20 | 2 | 2 |
| `voz` | 13 | 20 | 2 | 2 |
| `motor` | 12 | 18 | 2 | 2 |
| **TOTAL** | **100** | **152** | **16** | **≥3** |

**Presupuesto de audio:** 152 vacantes × 3,0s ≈ 7,6 min de audio bruto.  
**Tiempo real estimado:** ~12 min por sesión → ~3h campo + ~3h etiquetado/QC.

---

## 3. SITIOS

| Site ID | Rol | Uso en split |
|---|---|---|
| `site_a` | Train | 70% de sus clips |
| `site_b` | Train + Validation | 70% train, 15% validation (por grupo de sesión) |
| `site_c` | **HOLDOUT** | 100% reservado, jamás entra en train |

**Regla dura:** `site_c` queda reservado desde el día 1. Ningún clip de `site_c` entra en train/validation/test. El holdout evalúa generalización a sitio no visto.

---

## 4. ESTRATEGIA DE HOLDOUT

```
site_a → train (70%)
site_b → train (70%) + validation (15% por grupo de sesión)
site_c → HOLDOUT (100% reservado)
```

**Group split:** Por `(session_id, place_id)`. Todas las tomas de una sesión en un lugar quedan en la misma partición. Esto previene fuga de datos.

**Validation:** Sale de un grupo de sesión (no de un sitio), para no perder el único lugar no usado en holdout.

---

## 5. ESTRATEGIA DE DOBLE REVISIÓN

| Ronda | Anotador | Qué hace |
|---|---|---|
| 1 | `operator_id` | Captura + etiqueta inicial |
| 2 | `review_annotator_id` | Revisa etiqueta sin ver la ronda 1 |

**Agreement:**
- `double_reviewed_agree` → Ambos coinciden
- `double_reviewed_disagree` → No coinciden, se resuelve
- `disputed_resolved` → Discrepancia resuelta por tercero

**En el piloto: 100% doble revisión obligatoria.**

---

## 6. CONVENCIÓN DE SESSION_ID

```
pilot_YYYY_MM_DD_<lugar>_<secuencia>
```

**Ejemplos:**
- `pilot_2026_10_05_site_a_01`
- `pilot_2026_10_05_site_b_01`
- `pilot_2026_10_06_site_c_01`

**Reglas:**
- Una sesión = un lugar + un momento + un operador.
- Múltiples clases por sesión permitidas.
- `take_index` correlativo dentro de la sesión.

---

## 7. CONVENCIÓN DE PLACE_ID

```
site_a · site_b · site_c
```

**Reglas:**
- `place_id` es obligatorio en cada toma.
- `place_id` determina el split (train/holdout).
- Múltiples sesiones por lugar permitidas.

---

## 8. CONVENCIÓN DE OPERATOR_ID

```
<nombre_o_codigo>
```

**Ejemplos:**
- `bernardo`
- `asistente_01`

**Reglas:**
- `operator_id` es obligatorio en cada toma.
- `annotator_id` = `operator_id` en ronda 1.
- `review_annotator_id` = diferente en ronda 2.

---

## 9. CRONOGRAMA DE CAPTURA

| Día | Actividad | Site | Sesiones | Muestras objetivo |
|---|---|---|---|---|
| 1 | Silencio + viento | site_a | 2 | 24 |
| 2 | Lluvia + agua | site_a | 2 | 25 |
| 3 | Insectos (noche) | site_a | 2 | 26 |
| 4 | Ave + voz | site_b | 2 | 25 |
| 5 | Motor + silencio | site_b | 2 | 24 |
| 6 | Lluvia + agua | site_b | 2 | 25 |
| 7 | Insectos (noche) | site_b | 2 | 26 |
| 8 | Ave + voz | site_b | 2 | 25 |
| 9 | Motor + silencio | site_c | 2 | 24 |
| 10 | Lluvia + agua | site_c | 2 | 25 |
| 11 | Insectos (noche) | site_c | 2 | 26 |
| 12 | Ave + voz | site_c | 2 | 25 |
| 13 | Motor + silencio | site_c | 2 | 24 |
| 14 | Buffer/reintentos | Cualquiera | 2 | — |

**Total:** 14 días · 16 sesiones · 100 muestras aceptadas objetivo.

---

## 10. RIESGOS DE CAMPO

| ID | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| **RC-1** | Lluvia no ocurre naturalmente | Alta | Media | **Jamás simular.** Reprogramar sesión. |
| **RC-2** | Insectos no escuchan de noche | Media | Media | Tener plan B (otro sitio o noche alternativa). |
| **RC-3** | Voz sin consentimiento | Baja | Crítica | **Jamás capturar voz sin consentimiento explícito.** |
| **RC-4** | Micrófono no disponible | Baja | Crítica | Tener micrófono de respaldo. |
| **RC-5** | Batería agotada | Media | Media | Baterías extra + power bank. |
| **RC-6** | Ruido de fondo no deseado | Alta | Baja | Anotar en `notes`, marcar `contaminated` si aplica. |
| **RC-7** | Clima adverso (viento extrema) | Media | Baja | Reprogramar, no forzar. |
| **RC-8** | Anotador no disponible para ronda 2 | Media | Media | Tener 2 anotadores entrenados. |

---

## 11. CHECKLIST DE CAPTURA

Ver `PILOT_CAPTURE_CHECKLIST.md`.

---

## 12. CHECKLIST DE REVISIÓN

Ver `PILOT_REVIEW_CHECKLIST.md`.

---

## 13. CHECKLIST DE INGESTA

Ver `PILOT_ACCEPTANCE_CRITERIA.md`.

---

## 14. CHECKLIST DE VALIDACIÓN

```bash
# 1. Verificar conteos
node tools/cmsc-data-logger/src/cli.js status

# 2. Verificar gates
node tools/cmsc-data-logger/src/cli.js validate

# 3. Ejecutar split
node tools/cmsc-data-logger/src/cli.js split --holdout-place site_c

# 4. Validar piloto
node tools/cmsc-data-logger/src/cli.js pilot-validate
```

**Resultado esperado:** PILOT-1..7 PASS.

---

## 15. CRITERIOS DE NO AVANCE

| Criterio | Acción |
|---|---|
| < 100 muestras aceptadas | No avanzar a Fase 3 |
| < 3 places | No ejecutar split |
| < 100% doble revisión | No ejecutar split |
| Cualquier PILOT FAIL | No avanzar a Fase 3 |

---

## CONCLUSIÓN

**El plan está listo. La infraestructura está lista. El campo decide.**

**NO se afirma que PILOT-1..7 están cumplidos. Se afirma que todo está preparado para ejecutarlos.**

**El piloto no es una simulación. Es una ejecución real con evidencia real.**

---

**Estado del documento:** PLAN OPERATIVO · LISTO PARA EJECUCIÓN  
**No autoriza:** captura real, commits, push, merge  
**Próximo paso:** Ejecución del piloto en campo + misión explícita de captura
