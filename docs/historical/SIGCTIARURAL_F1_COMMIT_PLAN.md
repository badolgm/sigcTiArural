# SIGCTiArural — F1 COMMIT STRATEGY (Plan de Commit F1)

Estado: **DISEÑO / PLAN DE STAGING** · Fecha: 2026-09-21 · Rama: `feature/ubtn-biological-telemetry`
Regla: **NO IMPLEMENTAR · NO MODIFICAR · NO HACER COMMIT.** Este documento SOLO clasifica y entrega los comandos exactos. Su ejecución queda a orden explícita de Bernardo.
Baseline verificado: `git status -sb` sobre `3694e5d` (HEAD = docs(ai) + RC-2 freeze `87fc001`/`3ae504d`).

---

## 0. Clasificación de los 13 archivos

| # | Archivo | Estado git | Clasificación |
|---|---|---|---|
| 1 | `src/backend/api/urls.py` | `M` (+1 ruta) | **F1_CORE** |
| 2 | `src/backend/api/views.py` | `M` (+140) | **F1_CORE** |
| 3 | `src/backend/contexts/telemetry/infrastructure/config/dependencies.py` | `M` (+28) | **F1_CORE** |
| 4 | `src/backend/tests/api/test_telemetry_ingest_v3_view.py` | `??` | **F1_CORE** |
| 5 | `src/frontend/src/pages/Dashboard.jsx` | `M` (+276/−120) | **RC2_UX** |
| 6 | `docs/SIGCTIARURAL_AI_RECOVERY_PLAN.md` | `??` | **NO INCLUIR** |
| 7 | `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` | `??` | **NO INCLUIR** |
| 8 | `docs/SIGCTIARURAL_BBB03_DEPLOYMENT_GUIDE.md` | `??` | **F1_DOCS** |
| 9 | `docs/SIGCTIARURAL_BBB03_EXECUTION_PLAYBOOK.md` | `??` | **F1_DOCS** |
| 10 | `docs/SIGCTIARURAL_BBB_TELEMETRY_READINESS.md` | `??` | **F1_DOCS** |
| 11 | `docs/SIGCTIARURAL_DATASET_V2_INVENTORY.md` | `??` | **NO INCLUIR** |
| 12 | `docs/SIGCTIARURAL_F1_FIRST_REAL_SENSOR.md` | `??` | **F1_DOCS** |
| 13 | `docs/SIGCTIARURAL_F1_PRECOMMIT_REVIEW.md` | `??` | **F1_DOCS** |

### Criterios aplicados
- **F1_CORE** = código fuente y tests de la implementación de ingesta V3 (adaptador HTTP, comando, event bus, route, tests).
- **F1_DOCS** = documentación que soporta y describe la fase F1 (plan F1, readiness previo, guía y playbook BBB-03, auditoría pre-commit).
- **RC2_UX** = frontend cuyo diff pendiente pertenece a misiones RC-2/UX (accordions, mapa colapsable, reordenamiento), NO a F1.
- **NO INCLUIR** = documentación de alcance IA/ML y Dataset V2 (sesión IA pre-commit distinta), a commitear aparte cuando Bernardo lo ordene.

---

## 1. COMMIT 1 — F1 LIMPIO (código + tests)

```bash
git add src/backend/api/urls.py
git add src/backend/api/views.py
git add src/backend/contexts/telemetry/infrastructure/config/dependencies.py
git add src/backend/tests/api/test_telemetry_ingest_v3_view.py
```

Mensaje sugerido (estilo repo):
```bash
git commit -m "feat(f1): ingest real sensor readings via v3 telemetry endpoint"
```

Contenido del commit 1 (verificado en sesión F1/F1.1):
- `TelemetryIngestV3View` (POST `/api/v3/telemetry/readings/`, sobre V3 + `source_mode` live/fallback).
- Reutiliza `RegistrarLecturaSensorCommand` y `SensorReadingRepositoryPort` sin tocar dominio.
- `get_telemetry_event_bus()` en `dependencies.py` (EventBusPort + `wire_all` idempotente).
- 17 tests de caracterización + bordes F1.1 → suite 60/60.

---

## 2. COMMIT 2 — DOCUMENTACIÓN F1

```bash
git add docs/SIGCTIARURAL_F1_FIRST_REAL_SENSOR.md
git add docs/SIGCTIARURAL_BBB_TELEMETRY_READINESS.md
git add docs/SIGCTIARURAL_BBB03_DEPLOYMENT_GUIDE.md
git add docs/SIGCTIARURAL_BBB03_EXECUTION_PLAYBOOK.md
git add docs/SIGCTIARURAL_F1_PRECOMMIT_REVIEW.md
```

Mensaje sugerido:
```bash
git commit -m "docs(f1): first real sensor plan, readiness, BBB-03 guide/playbook and pre-commit review"
```

> Sugerido (NO bloqueante): si Bernardo quiere traza completa del plan de commit, incluir también `docs/SIGCTIARURAL_F1_COMMIT_PLAN.md` en este COMMIT 2.

---

## 3. Dashboard.jsx — ¿entra o queda aparte? → **QUEDA APARTE (commit separado)**

**Respuesta: NO debe entrar al commit F1.** Justificación técnica:

1. **Alcance distinto.** El diff pendiente de `Dashboard.jsx` (+276/−120, vía `git diff HEAD`) consiste en cambios RC-2/UX: `AccordionSection` colapsable, Mapa de Dispositivos en 3 paneles, reordenamiento de bloques. **No contiene ni un símbolo de la telemetría V3 ni de la ingesta F1** (verificado: `git diff HEAD -- Dashboard.jsx | grep -E 'fetchTelemetryEnvelope|telemetry-ingest|telemetry-history-v3|source_mode'` → 0 coincidencias).
2. **El frontend ya consumía V3 desde RC-2.** El contrato `fetchTelemetryEnvelope`/`telemetry-history-v3`/`source_mode` quedó congelado en el commit `87fc001` (feat(rc2): freeze dashboard complete). El F1 es 100% backend; Dashboard.jsx no depende del working tree para funcionar con lecturas reales.
3. **Un commit = un alcance** (regla del repo). Mezclar backend de ingesta con reordenamiento visual de RC-2 rompe el criterio, dificulta revert y contamina la trazabilidad del RC.
4. **Riesgo de revert.** Si mañana hay que deshacer el proxy/endpoint F1, el commit debería poder revertirse sin arrastrar cambios visuales no relacionados.

**Decisión de staging recomendada:** crear un tercera commit `feat(rc2): dashboard accordions UX` con `git add src/frontend/src/pages/Dashboard.jsx` (orden de Bernardo) — o dejarlo SIN commitear hasta entonces. En ningún caso junto a F1.

---

## 4. Resumen ejecutivo

| Commit | Qué incluye | Alcance | Estado |
|---|---|---|---|
| **1 · F1 LIMPIO** | 4 archivos backend + tests | F1_CORE | listo, sin etapa |
| **2 · DOCUMENTACIÓN F1** | 5 (o 6) docs F1 | F1_DOCS | listo, sin etapa |
| **3 · RC-2 UX (opcional, aparte)** | `Dashboard.jsx` | RC2_UX | espera orden de Bernardo |
| — · IA/ML + Dataset V2 | 3 docs | NO INCLUIR | commit separado futuro |

**Garantía del plan:** el COMMIT 1 y el COMMIT 2 pueden ejecutarse en cualquier orden; ambos son independientes entre sí. `Dashboard.jsx`, `AI_RECOVERY_PLAN`, `AI_V5_FORENSIC_AUDIT` y `DATASET_V2_INVENTORY` permanecen en el working tree sin tocar.