# PILOT ACCEPTANCE CRITERIA

**Misión:** `CMSC_ORCHESTRATION_V2_FIELD_PILOT_EXECUTION`  
**Fecha:** 2026-10-05  
**Estado:** CRITERIOS · NO EJECUTADO  
**Base:** `AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` §5 + `FIELD_PILOT_EXECUTION_PLAN.md`

---

## 0. ESTADO HONESTO

| Elemento | Estado |
|---|---|
| Criterios definidos | ✅ |
| **PILOT-1..7 ejecutados** | ⏳ **PENDIENTE** |
| **100 muestras reales** | ⏳ **PENDIENTE** |

---

## 1. CRITERIOS DE ACEPTACIÓN DE PILOTO

| ID | Criterio | Umbral | Verificable |
|---|---|---|---|
| **PILOT-1** | Clips aceptados | ≥ 100 | `metadata.csv` |
| **PILOT-2** | Places distintos | ≥ 3 | `metadata.csv` |
| **PILOT-3** | Doble revisión | 100% | `metadata.csv` |
| **PILOT-4** | Sha256 únicos | 100% | AC-8 |
| **PILOT-5** | `capture_source_rate` + `resample_method` | 100% | `metadata.csv` |
| **PILOT-6** | Holdout sin fuga | 0 fugas | `split_report.json` |
| **PILOT-7** | `dataset_state` honesto | `CAPTADO_INICIAL` | `schema.json` |

---

## 2. EJECUCIÓN DE VALIDACIÓN

```bash
# 1. Estado del dataset
node tools/cmsc-data-logger/src/cli.js status

# 2. Gates
node tools/cmsc-data-logger/src/cli.js validate

# 3. Split
node tools/cmsc-data-logger/src/cli.js split --holdout-place site_c

# 4. Validación del piloto
node tools/cmsc-data-logger/src/cli.js pilot-validate
```

---

## 3. RESULTADO ESPERADO

```
  PASS PILOT-1: 100/100 clips aceptados
  PASS PILOT-2: 3/3 places distintos
  PASS PILOT-3: 100/100 doble revisados
  PASS PILOT-4: 100/100 sha256 unicos
  PASS PILOT-5: 100/100 con capture_source_rate + resample_method
  PASS PILOT-6: holdout=20, sin fuga=true
  PASS PILOT-7: dataset_state=CAPTADO_INICIAL
```

---

## 4. CRITERIOS DE NO ACEPTACIÓN

| Criterio | Acción |
|---|---|
| < 100 muestras aceptadas | No avanzar a Fase 3 |
| < 3 places | No ejecutar split |
| < 100% doble revisión | No ejecutar split |
| Cualquier PILOT FAIL | No avanzar a Fase 3 |

---

## 5. EVIDENCIA DE ACEPTACIÓN

| Artefacto | Qué prueba |
|---|---|
| `metadata.csv` | 100 muestras con metadata completa |
| `split_report.json` | Group split ejecutado sin fuga |
| `CHECKSUMS.sha256` | Integridad de los WAV |
| `pilot-validate` | PILOT-1..7 PASS |

---

## CONCLUSIÓN

**Los criterios están definidos. La infraestructura está lista. El campo decide.**

**NO se afirma que PILOT-1..7 están cumplidos. Se afirma que los criterios están listos para validarlos.**

---

**Estado del documento:** CRITERIOS · LISTO PARA EJECUCIÓN  
**No autoriza:** validación real, commits, push, merge  
**Próximo paso:** Ejecución del piloto en campo
