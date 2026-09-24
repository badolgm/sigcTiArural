# SIGCTiArural — AGENTS / Estado del Proyecto

## Identidad
Ecosistema vivo de conocimiento verificable (no plataforma, no dashboard) sobre Bounded Contexts hexagonales; EIARC es su primer caso de uso productivo real, no un paraguas.

## Regla suprema
NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA. Honestidad de estado (real/referencia/simulación/diseño) es invariante de dominio. La documentación canónica es la fuente de verdad.

## Prohibido
- Commits/push/merge/rebase a `main`; tocar backend, Docker, Telemetry Context, SensorReading/RobotTelemetry, BBB, Labs, Knowledge Hub, IA existente.
- NO implementar, NO modificar código, NO crear rutas/páginas/frontend salvo misión explícita que lo ordene (las últimas misiones fueron SOLO DISEÑAR Y DOCUMENTAR).

## Estado git (2026-09-23)
- Rama `feature/ubtn-biological-telemetry`. HEAD `fa8e6a4`. Working tree **limpio**.
- Cadena de commits vigente (2026-09-23, benchmark IA):
  - `fa8e6a4` **fix(m2): fallback `SimpleNamespace`** (bug `class_weights`/`evaluate` resuelto).
  - `91dc25e` **feat(m2): notebook EfficientNet-B0** (`SIGCTIARURAL_M2_EfficientNetB0.ipynb`).
  - `d6744f0` docs(m1): dossier MobileNetV2 · `c148e86`/`902e55e`/`5a079f4` docs(dataset-v2) · `9aebcb4` feat(benchmark) · `4520451` docs(governance).
  - Contexto previo F1/RC2 (2026-09-21): `0989ec9`, `941a55d`, etc.
- Estado del benchmark: **M1 APROBADO/CONGELADO (baseline oficial)** · **M2 generado, auditado, corregido, smoke-test OK, listo para corrida Colab T4**.
- Runtime (2026-09-21, no revalidado hoy): `postgres` Up · `backend` Up 8010 · `ai_service`/`frontend` Exited.

## Decisiones de la sesión IA/ML (cuadro rector)
- Dataset V2+ **recuperado y validado** (22.488/16/3, split 15.741/3.373/3.374, seed 42) — congelado.
- **M1 (MobileNetV2) = BASELINE OFICIAL**: macro-F1 0.9899 · ECE 0.0313 · balanced_acc 0.9898. Congelado, no se re-entrena.
- **M2 (EfficientNet-B0)** = siguiente experimento: misma política canónica + correcciones G (torch.amp, persistencia Drive, guardado automático).

## Cómo retomar mañana
1. Leer primero: `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` (documento de continuidad consolidado).
2. **P1 — Corrida oficial M2**: ejecutar `notebooks/SIGCTIARURAL_M2_EfficientNetB0.ipynb` en Colab T4 con Dataset V2+ real (notebook ya validado por smoke test).
3. **P2** — Recopilar artefactos desde `runs/M2_efficientnet_b0/` (config.json, validation_metrics.json, M2_VS_M1.json/.md, best/last.pth, metrics.csv, PNG).
4. **P3/P4** — Análisis científico M2 vs M1 y decisión: ¿EfficientNet-B0 supera a MobileNetV2? Documentar en `TABLA_COMPARATIVA_M1_M5.md` + manifiestos al aprobar.
5. Contexto previo (si se retoma otra área): RC2_FREEZE → ECOSYSTEM_IDENTITY → CANONICAL_ENGINEERING_REVIEW → AI_ML_STATE_OF_THE_ART → DATASET_V2_MASTERPLAN; task BBB-03 pendiente de confirmar.

## Cadencias operativas
- Validar sintaxis: balance `{`/`}` y `(`/`)` = 0; runtime solo vía Docker 5173/5174.
- Commits solo con orden explícita de Bernardo.