# BACKLOG REALITY CHECK V1

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: docs/BACKLOG_REALITY_CHECK_V1.md
> - Destino: docs/BACKLOG_REALITY_CHECK_V1.md

## M1 vs M2
Estado:
ABIERTO
Evidencia:
`docs/CANONICAL_PROJECT_STATE_20261109.md`, sección DECISIONES CERRADAS, fila M1_BASELINE_M2_CHALLENGER: "CONGELADO/DECISIÓN PENDIENTE · M1 baseline congelado · M2 challenger validado · decisión pendiente por diseño". Fuente adicional: `docs/ESTADO_ACTUAL_BENCHMARKS.md` § "Decisión benchmark final PENDIENTE". Aunque `docs/M1_M2_GOVERNANCE_CLOSURE_REPORT.md` (2026-10-14) declara "Gate M1↔M2: CERRADO" para el componente de status/arquitectura, es documentación anterior al CANONICAL_PROJECT_STATE_20261109.md (2026-11-09) y no existe evidencia documental posterior al canónico que cierre la decisión definitiva de promoción M1 vs M2. El test single-use confirmatorio permanece reservado sin ejecutar.

## Dataset acústico Tramo C
Estado:
ABIERTO
Evidencia:
`docs/CANONICAL_PROJECT_STATE_20261109.md`, sección BACKLOG OFICIAL ABIERTO, CRÍTICO: "Dataset acústico Fase 1 - captura masiva · Estructura preparada estado PREPARADO_VACIO (0 muestras); requiere Tramo C (PCM S30)". Aunque `docs/INFORME_TRAMO_C_FINAL.md` (2026-10-09) declara "GO_TRAMO_C_FINAL" con validación en sandbox `cmsc_tramo_c_v2`, el informe aclara "C0 productivo intacto" y no hay evidencia documental posterior al CANONICAL_PROJECT_STATE_20261109.md (2026-11-09) que cierre la captura masiva productiva ni actualice el estado de 0 muestras. El canónico del 9-noviembre mantiene explícitamente que requiere Tramo C.

## Gobernanza acústica D-2 D-3 D-4
Estado:
ABIERTO
Evidencia:
`docs/CANONICAL_PROJECT_STATE_20261109.md`, sección BACKLOG OFICIAL ABIERTO, BAJO: "Mapeo class_id ↔ dir_name unificado · Pendiente D-3 en governance acústica (4 pendientes D-2, D-3, D-4)". Aunque `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md` (2026-10-04, revisión 2026-10-06) declara D-2, D-3 y D-4 como CERRADAS en su §7 (tabla DECISIONES PENDIENTES DE BERNARDO), es documentación anterior al CANONICAL_PROJECT_STATE_20261109.md (2026-11-09) y no existe evidencia documental posterior al canónico que cierre D-2, D-3, D-4. El canónico del 9-noviembre mantiene explícitamente los 4 como pendientes.

## Frontend 5174 producción
Estado:
ABIERTO
Evidencia:
`docs/CANONICAL_PROJECT_STATE_20261109.md`, sección BACKLOG OFICIAL ABIERTO, MEDIO: "Frontend 5174 a producción/Docker · Vite dev server activo en 5174; falta validación producción; 5173 mantiene referencia estable". Aunque `docs/FRONTEND_OFFICIALIZATION_PHASE_2_REPORT.md` (2026-10-13) declara "GO_PHASE_2_EXECUTED" con build Docker exitoso y smoke tests 4/4 PASS, es documentación anterior al CANONICAL_PROJECT_STATE_20261109.md (2026-11-09) y no existe evidencia documental posterior al canónico que cierre la validación de producción del frontend 5174. El canónico del 9-noviembre mantiene explícitamente "falta validación producción".

## Licenciamiento datasets REF
Estado:
PARCIAL
Evidencia:
`docs/CANONICAL_PROJECT_STATE_20261109.md`, sección BACKLOG OFICIAL ABIERTO, ALTO: "Extensiones schema.json partition=reference · Bump 1.2.0→1.3.0 (D5); partition=reference y source=audioset añadidos; bloquea ingesta REF". `docs/AI_ACOUSTIC_REFERENCE_DATASET_CATALOG.md` (2026-10-06) documenta licencias verificadas por fuente (FSD50K, ESC-50, Xeno-canto, SONYC-UST, Speech Commands, BirdCLEF, AudioSet) y declara "Sin descarga · sin implementación · sin modificación de datasets/v1/ · sin commits ni push". `docs/AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md` (2026-10-06) declara que las extensiones de vocabulario `partition`, `source`, `license` requieren decisión de Bernardo y bump de schema.json, y que "no las declara implementadas". Hay avance documentado (catálogo de licencias, schema.json v1.3.0 referenciado en `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md`), pero no existe cierre explícito de la ingesta REF: el CANONICAL_PROJECT_STATE_20261109.md declara que D5 "bloquea ingesta REF", y no hay evidencia documental posterior al canónico que libere ese bloqueo.

## Conclusión

Lista final:

| Ítem | Estado |
|---|---|
| M1 vs M2 | ABIERTO |
| Dataset acústico Tramo C | ABIERTO |
| Gobernanza acústica D-2 D-3 D-4 | ABIERTO |
| Frontend 5174 producción | ABIERTO |
| Licenciamiento datasets REF | PARCIAL |