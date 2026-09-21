# SIGCTiArural — AGENTS / Estado del Proyecto

## Identidad
Ecosistema vivo de conocimiento verificable (no plataforma, no dashboard) sobre Bounded Contexts hexagonales; EIARC es su primer caso de uso productivo real, no un paraguas.

## Regla suprema
NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA. Honestidad de estado (real/referencia/simulación/diseño) es invariante de dominio. La documentación canónica es la fuente de verdad.

## Prohibido
- Commits/push/merge/rebase a `main`; tocar backend, Docker, Telemetry Context, SensorReading/RobotTelemetry, BBB, Labs, Knowledge Hub, IA existente.
- NO implementar, NO modificar código, NO crear rutas/páginas/frontend salvo misión explícita que lo ordene (las últimas misiones fueron SOLO DISEÑAR Y DOCUMENTAR).

## Estado git (2026-09-21)
- Rama `feature/ubtn-biological-telemetry`. HEAD `0989ec9`. Cadena de commits vigente:
  - `0989ec9` docs(ai): telemetry readiness, ai forensic audit y dataset inventory (libres: `AI_RECOVERY_PLAN`, `AI_V5_FORENSIC_AUDIT`, `DATASET_V2_INVENTORY`).
  - `941a55d` **feat(f1): enable first real sensor ingestion pipeline** (cierra F1: código backend + 5 docs F1: `F1_FIRST_REAL_SENSOR`, `BBB_TELEMETRY_READINESS`, `BBB03_DEPLOYMENT_GUIDE`, `BBB03_EXECUTION_PLAYBOOK`, `F1_PRECOMMIT_REVIEW`, `F1_COMMIT_PLAN`).
  - `3694e5d` docs(ai): dataset v2 execution plan + state of the art · `3ae504d` docs(rc2): canonical review + onboarding · `87fc001` feat(rc2): freeze dashboard.
- Working tree: **1 archivo M** (`src/frontend/src/pages/Dashboard.jsx`) + `dashboard_rc2_ui.patch` (??). El diff de Dashboard es **UX RC-2** (accordions: +157/−119, 0 símbolos V3) — NO es F1; queda pendiente de commit separado.
- Runtime (2026-09-21): `postgres` Up (healthy) · `backend` **Up en 8010** · `ai_service` Exited (3 días) · `frontend` Exited (3 días).

## Decisiones de la sesión IA/ML (cuadro rector)
- Cuello de botella = **DATA**. Dataset V2 bootstrap (21.160/16/3, GO condicionado a laboratorio) = siguiente paso.
- F1 (primer dato real de sensor) **ya es realidad**: endpoint de ingesta V3 commiteado, backend sirviendo en 8010, Dashboard LIVE-ready.

## Cómo retomar mañana
1. Verificar `git status` (pendiente: commit RC-2/UX de `Dashboard.jsx` y `dashboard_rc2_ui.patch` si Bernardo decide).
2. Leer en orden: RC2_FREEZE (con bloque de actualización) → ECOSYSTEM_IDENTITY → CANONICAL_ENGINEERING_REVIEW → AI_ML_STATE_OF_THE_ART → DATASET_V2_MASTERPLAN.
3. Próximos pasos candidatos (no empezar sin confirmar): **task de campo BBB-03** (ejecutar el playbook para datos físicos reales), materializar Dataset V2 (Fases 1-3 Execution Plan), o ampliar plan científico para UBTN (P0 rangos fisiológicos).

## Cadencias operativas
- Validar sintaxis: balance `{`/`}` y `(`/`)` = 0; runtime solo vía Docker 5173/5174.
- Commits solo con orden explícita de Bernardo.