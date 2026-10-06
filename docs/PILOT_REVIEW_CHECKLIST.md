# PILOT REVIEW CHECKLIST

**Misión:** `CMSC_ORCHESTRATION_V2_FIELD_PILOT_EXECUTION`  
**Fecha:** 2026-10-05  
**Estado:** CHECKLIST · NO EJECUTADO  
**Base:** `FIELD_PILOT_EXECUTION_PLAN.md` + `FIELD_DATA_COLLECTION_PROTOCOL.md`

---

## 0. ESTADO HONESTO

| Elemento | Estado |
|---|---|
| Checklist definido | ✅ |
| **Revisiones ejecutadas** | ⏳ **PENDIENTE** |
| **100% doble revisión** | ⏳ **PENDIENTE** |

---

## 1. PRE-REVISIÓN

- [ ] Muestra capturada y aceptada por CLI
- [ ] `sample_id` identificado
- [ ] `review_annotator_id` asignado (diferente de `operator_id`)
- [ ] Revisor no ha visto la etiqueta de ronda 1

---

## 2. REVISIÓN DE CLASE

- [ ] Clase de la muestra verificada
- [ ] Criterio de inclusión cumplido
- [ ] Criterio de exclusión no cumplido
- [ ] `secondary_classes` anotadas (si aplica)
- [ ] `contaminated` marcado (si aplica)

---

## 3. REGISTRO DE AGREEMENT

- [ ] `review_annotator_id` registrado
- [ ] `agreement` seleccionado:
  - [ ] `double_reviewed_agree` → Ambos coinciden
  - [ ] `double_reviewed_disagree` → No coinciden
  - [ ] `disputed_resolved` → Resuelto por tercero
- [ ] `notes` con justificación (si aplica)

---

## 4. COMANDO DE REVISIÓN

```bash
node tools/cmsc-data-logger/src/cli.js review \
  --sample <sample_id> \
  --annotator <review_annotator_id> \
  --agreement <agreement>
```

---

## 5. VERIFICACIÓN

- [ ] `agreement` ≠ `single_reviewed`
- [ ] `review_annotator_id` ≠ `operator_id`
- [ ] `notes` completadas (si aplica)

---

## 6. CASOS ESPECIALES

### 6.1 Discrepancia

- [ ] `double_reviewed_disagree` registrado
- [ ] Tercer anotador asignado
- [ ] `disputed_resolved` con resolución documentada

### 6.2 Muestra dudosa

- [ ] `contaminated` marcado
- [ ] `secondary_classes` anotadas
- [ ] `notes` con descripción del problema

---

## 7. FIN DE REVISIÓN

- [ ] Todas las muestras de la sesión revisadas
- [ ] 100% doble revisión completada
- [ ] `pilot-validate` ejecutado

---

## CONCLUSIÓN

**El checklist está definido. La infraestructura está lista. El campo decide.**

**NO se afirma que las revisiones existen. Se afirma que el checklist está listo para ejecutarlas.**

---

**Estado del documento:** CHECKLIST · LISTO PARA EJECUCIÓN  
**No autoriza:** revisión real, commits, push, merge  
**Próximo paso:** Ejecución del piloto en campo
