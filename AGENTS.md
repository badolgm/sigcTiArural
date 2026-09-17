# SIGCTiArural — AGENTS / Estado del Proyecto

## Identidad
Ecosistema vivo de conocimiento verificable (no plataforma, no dashboard) sobre Bounded Contexts hexagonales; EIARC es su primer caso de uso productivo real, no un paraguas.

## Regla suprema
NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA. Honestidad de estado (real/referencia/simulación/diseño) es invariante de dominio. La documentación canónica es la fuente de verdad.

## Prohibido
- Commits/push/merge/rebase a `main`; tocar backend, Docker, Telemetry Context, SensorReading/RobotTelemetry, BBB, Labs, Knowledge Hub, IA existente.
- NO implementar, NO modificar código, NO crear rutas/páginas/frontend salvo misión explícita que lo ordene (las últimas misiones fueron SOLO DISEÑAR Y DOCUMENTAR).

## Estado git (2026-09-15)
- Rama `feature/ubtn-biological-telemetry`. Working tree Casi limpio:
  - RC-2 commitado: `3ae504d` (canonical review + onboarding guide) sobre `87fc001` (freeze dashboard).
  - **2 docs SIN commitear** (de hoy): `docs/SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md`, `docs/SIGCTIARURAL_DATASET_V2_MASTERPLAN.md`.
- Decisiones de la sesión IA/ML actual: cuello de botella = **DATA**; Dataset V2 bootstrap (21.160/16/3, GO condicionado a laboratorio) = el siguiente paso.

## Otorgados en sesión IA/ML
1. `docs/SIGCTIARURAL_AI_ML_STATE_OF_THE_ART.md` — auditoría: 1 modelo binario colapsado (crítico), 0 datasets físicos, MLOps diseño, UBTN 0%.
2. `docs/SIGCTIARURAL_DATASET_V2_MASTERPLAN.md` — plan 90 días: materializar dataset V1 + split_v1 + benchmark (EfficientNet-B0/MobileNetV3/ResNet50/ConvNeXt-Tiny, macro-F1 + ECE) + pipa de captura propia.

## Cómo retomar mañana
1. Verificar `git status` (faltan 2 docs por commitear si Bernardo decide).
2. Leer en orden: RC2_FREEZE → ECOSYSTEM_IDENTITY → CANONICAL_ENGINEERING_REVIEW → AI_ML_STATE_OF_THE_ART → DATASET_V2_MASTERPLAN.
3. Próximos pasos candidatos (no empezar sin confirmar): materializar Dataset V2 (Fases 1-3 Execution Plan), o ampliar plan científico para UBTN (P0 rangos fisiológicos).

## Cadencias operativas
- Validar sintaxis: balance `{`/`}` y `(`/`)` = 0; runtime solo vía Docker 5173/5174.
- Commits solo con orden explícita de Bernardo.