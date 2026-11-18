# DOCKER_READY_CLOSURE_REPORT

**Misión:** `R6_R7_DOCKER_READY_CLOSURE`
**Naturaleza:** SOLO CIERRE · evaluación y clasificación. **NO modifica código · NO dockeriza · NO commits · NO push · NO `down -v` · NO `up --build` · NO OCI · NO SIGCT Memory · NO Qdrant.**
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`
**Fecha:** 2026-10-13 (America/Bogota)
**Cadena:** `DOCKER_OFFICIAL_EXECUTION_PLAN` (`DOCKER_NOT_READY`) → `DOCKER_READY_REMEDIATION_PLAN` (`DOCKER_READY_POSSIBLE`) → `DOCKER_READY_R1_R4_EXECUTION_PLAN` (`SAFE_TO_EXECUTE`) → `DOCKER_READY_R1_R4_REPORT` (`DOCKER_READY_R1R4`) → `H5_AI_GOVERNANCE_CLOSURE_REPORT` (`H5_CLOSED`) → **este cierre (R6/R7)**.
**Regla:** toda afirmación se ancla a archivo/reporte/estado git. Sin suposiciones.

---

## 0. Dictamen

# `DOCKER_NOT_READY`

El tramo **R1–R4 quedó ejecutado y verificado** (`DOCKER_READY_R1R4`), y **H5 cerró a nivel de gobernanza** (`H5_CLOSED`). Sin embargo, **R6 y R7 NO están cerrados** y la brecha de *serving* de IA (R5/H5-código) sigue abierta. Por tanto **no puede declararse `DOCKER_READY` global**.

| Ámbito | Estado | Motivo |
|---|---|---|
| R1–R4 (higiene + readiness + backend prod + mismo-origen) | ✅ **CERRADO** | `DOCKER_READY_R1R4` |
| H5 (gobernanza IA) | ✅ **CERRADO (gobernanza)** | `H5_CLOSED` |
| R5 (serving IA canónico) | ❌ **ABIERTO** | `ai_service` sigue sirviendo el `.h5` histórico |
| **R6** (tag release + registry + docs despliegue) | ❌ **NO CERRADO** | sin tag de release, sin `compose.resolved.yml`, `DEPLOYMENT.md` obsoleto |
| **R7** (§G E2E) | ⚠️ **PARCIAL** | falta G2 formal, G4, G8, G13, G15 |
| **R7.5** (validación visual humana) | ❌ **PENDIENTE** | 16 capturas §J de `PRE_DOCKER_VISUAL_VALIDATION_REPORT` no ejecutadas |

**Clasificación final: `DOCKER_NOT_READY`** (bloqueadores: R5/H5-serving · R6 incompleto · R7 incompleto · R7.5 pendiente).

---

## 1. Estado de R6 — tag reproducible + registry + docs de despliegue

> R6 (rem. plan §4) = *"tag semver+SHA · `docker push` · `DEPLOYMENT.md`"*. Mínimo de oficialización según `DOCKER_OFFICIAL_EXECUTION_PLAN §H7` = **tag reproducible + docs de despliegue** (registry/firma/SBOM quedan como **OCI**, fuera de alcance §B6).

### 1.1 Tag reproducible — ❌ NO CUMPLE

| Tag existente | Tipo | SHA | ¿Release? |
|---|---|---|---|
| `PRE_DOCKER_OFFICIAL_2026_10_13` | Congelamiento pre-cambios | — | No (pre) |
| `PRE_R1_R4_EXECUTION` | Backup pre-R1–R4 | `9109050148fdd89c11a4066c6e0b61f52e49af6d` | No (pre) |

- `git tag -l` filtrado a `v[0-9]|release|DOCKER_READY|docker-official` → **vacío**. **No existe tag de release/semver.**
- Los tags presentes son de **congelamiento/backup**, no de release reproducible.

### 1.2 Registry — ❌ NO CUMPLE (y en tensión de alcance)

- No hay `docker push` ni referencia a registry (GHCR/ECR) operativa en el repo; solo ruido en `.env.example`/`.gitignore`.
- **Tensión declarada:** `DOCKER_READY_REMEDIATION_PLAN §H10/§3.3` incluye `docker push` en R6, mientras `DOCKER_OFFICIAL_EXECUTION_PLAN §B6/§H7` clasifica registry/firma/SBOM como **OCI (iniciativa posterior, fuera de alcance)**. **Decisión requerida por Bernardo:** ¿R6 incluye push a registry o basta tag+docs (registry = OCI)?

### 1.3 Documentación de despliegue — ❌ NO CUMPLE (documento obsoleto)

- `docs/DEPLOYMENT.md` (2.213 B · **21/08/2026**) dice textualmente (línea 74): *"El repositorio actual no incluye `docker-compose.yml`…"* — **FALSO hoy**.
- No documenta: los 4 servicios (`db`/`backend`/`ai_service`/`frontend`), healthchecks, `restart`, gunicorn, mismo-origen (`/api`, `/assist`), perfil `legacy` de `db-mysql`, ni los healthchecks con `127.0.0.1`.
- Documentos relacionados: `docs/DEPLOYMENT_AWS.md`, `docs/sena_artifacts/DEPLOYMENT_FINAL.md`, backups en `backup_ubtn_docs/` (contexto, no sustitutos del doc oficial Docker).
- `compose.resolved.yml` (artefacto §1.1/FASE-4 paso 11 del plan oficial) → **NO existe**.

### 1.4 Argumentos (artefactos) — ⚠️

- `docker-compose.yml` es la única fuente de composición; **no hay** artefacto resuelto (`compose.resolved.yml`) versionado.

**R6 = ❌ NO CERRADO.**

---

## 2. Estado de R7 — verificación E2E (§G) + validación visual

### 2.1 Checklist §G (pruebas obligatorias) — ⚠️ PARCIAL

Estado derivado de `DOCKER_READY_R1_R4_REPORT` (V2–V11 + runtime) y `PRE_DOCKER_VISUAL_VALIDATION_REPORT` (build/ruteo):

| # | Prueba | Criterio | Estado | Evidencia |
|---|---|---|---|---|
| G1 | `docker compose config` | válido | ✅ | V2 `rc=0` |
| G2 | Build de los 4 servicios | exit 0 | ⚠️ **parcial** | R1–R4 reconstruyó `backend`/`frontend`; `ai_service`/`db` no re-build formal |
| G3 | `db` healthcheck | healthy | ✅ | V6 |
| G4 | Migraciones (`migrate --plan`, `makemigrations --check`) | sin pendientes | ❌ **no verificado** | R1–R4 solo corrió `manage.py check` (V4) |
| G5 | Backend endpoints | 200 | ✅ | V5 (`/api/health/`) + `/api/robots/` 200 |
| G6 | Proxy frontend→backend | 200 | ✅ | V5 (`:5173/api/health/`) |
| G7 | `ai_service` health | `{status:ok}` | ✅ | `:8081/health` 200 |
| G8 | `ai_service` infer | 200 JSON | ❌ **no verificado** | `POST /infer` no ejecutado en R1–R4 |
| G9 | Frontend estático | 200 + `#root` | ✅ | raíz 200 text/html; PRE_DOCKER §C |
| G10 | Voz `/assist` | alcanzable | ✅ | **antes fallaba (R9)**; ahora GET 405 JSON / POST 200 FastAPI |
| G11 | No-regresión multi-proyecto | vetna/eiarc/servsoft intactos | ✅ | V10 (17 contenedores; ajenos intactos) |
| G12 | Inmutabilidad de datos | `down`(sin `-v`)+`up` persiste | ✅ | V9 (huella `md5 faff5c7f…` idéntica) |
| G13 | Sin binarios en imagen | `docker run … ls` sin `data/datasets` | ❌ **no verificado** | — |
| G14 | Sistemas congelados | `git status` sin cambios | ✅ | V11 |
| G15 | Smoke frontend | `smoke-frontend.ps1` 4/4 | ❌ **no ejecutado** | script existe en `src/frontend/scripts/smoke-frontend.ps1` |

**Resumen §G: 9 ✅ · 1 ⚠️ (G2) · 4 ❌ (G4, G8, G13) + G15.** No hay GO en verde completo.

### 2.2 Validación visual humana (R7.5) — ❌ PENDIENTE

- `docs/PRE_DOCKER_VISUAL_VALIDATION_REPORT.md` declara explícitamente: **"VALIDACIÓN VISUAL HUMANA PENDIENTE (no ejecutada aquí)"**, con **§J = 16 capturas + DevTools**.
- Veredicto del propio reporte: `GO_DOCKER_OFFICIAL_PREPARATION`, **no** "GO visual confirmado".

### 2.2 Residuales no bloqueantes del tramo R1–R4 (V8)

- Bundle conserva `localhost:8081` (literal DEV muerto `VoiceAssistant.jsx:6`), `onrender.com` (`cloud.js:8,10` probe activo pre-existente + `lab-data.js:352`) y `localhost:8010` (texto de docs embebidos). **No son regresión de R4**; ligados a "de-cloud" (fuera de R6/R7).

**R7 (formal) NO CERRADO · R7.5 PENDIENTE.**

---

## 3. Evidencias existentes (reutilizables)

- **Ejecutado y verificado:** `docs/DOCKER_READY_R1_R4_REPORT.md` (cambios R1–R4, V2–V11, D1/D2, runtime). Rollback: tag `PRE_R1_R4_EXECUTION` + `pg_dump` (39.396 B · SHA-256 `FEF4A7C9A0371E580A679F08E3BBECB6EC179D1589B5A198B62238447F1FE1BB`).
- **Gobernanza IA:** `docs/H5_AI_GOVERNANCE_CLOSURE_REPORT.md` (`H5_CLOSED`; canon vs histórico).
- **Validación estática + build/ruteo:** `docs/PRE_DOCKER_VISUAL_VALIDATION_REPORT.md` (build EXIT 0, 14/14 rutas 200, overlay ausente).
- **Config vigente:** `.env.example` ya en **mismo-origen** (`VITE_API_URL=/api`, `VITE_AI_API_BASE=`, `VITE_AI_INFERENCE_URL=/api/v3/ai/inference/`) + guía `SECRET_KEY`/`DEBUG`/`ALLOWED_HOSTS`.
- **Artefacto de smoke disponible (no ejecutado):** `src/frontend/scripts/smoke-frontend.ps1`.
- **Estado git:** 8 modificados (R1–R4 + 2 pre-existentes) + `src/backend/api/health.py` nuevo + docs untracked. **Sin commits.**

---

## 4. Faltantes para `DOCKER_READY`

| # | Faltante | Bloquea | Naturaleza |
|---|---|---|---|
| F1 | Tag de release reproducible (semver+SHA) | R6 | Ops |
| F2 | `docs/DEPLOYMENT.md` oficial (4 servicios, healthchecks, gunicorn, mismo-origen, `/assist`, perfiles, secretos) | R6 | Documental |
| F3 | `compose.resolved.yml` como artefacto | R6 | Ops |
| F4 | Decisión: registry push ¿R6 o OCI? | R6 | Gobernanza |
| F5 | R5/H5-código: serving canónico (ONNX M1/M2) o etiquetado `HISTÓRICO` explícito en runtime | Global | Código |
| F6 | G2/G4/G8/G13/G15 ejecutadas y verdes | R7 | Verificación |
| F7 | Validación visual humana §J (16 capturas + DevTools) | R7.5 | Humana |
| F8 | (Opcional, ligado) de-cloud `cloud.js`/`lab-data.js` | residual V8 | Código |

---

## 5. Documentación a generar (Q5)

1. **`docs/DEPLOYMENT.md` (reescritura oficial)** — sustituir el contenido obsoleto (21/08/2026) por: arquitectura de 4 servicios (`db`/`backend`/`ai_service`/`frontend`), puertos host (`5544/8010/8081/5173`), `healthcheck`+`restart`, `gunicorn`, mismo-origen (`/api`, `/assist`), perfil `legacy` (`db-mysql`), variables `.env` (mismo-origen + `SECRET_KEY`/`DJANGO_DEBUG`/`ALLOWED_HOSTS`), y procedimiento de **despliegue/rollback** (tag+`pg_dump`, nunca `down -v`).
2. **`compose.resolved.yml`** generado con `docker compose config` como artefacto versionado.
3. **Nota de cierre R6/R7** (este documento) + actualización de la cadena de reportes.
4. **Registro del tag de release** (nombre semver + SHA) en la documentación de despliegue (sin crear el tag en esta misión).
5. *(Sugerido)* `docs/DEPLOYMENT_AWS.md` / `docs/sena_artifacts/DEPLOYMENT_FINAL.md`: alinear o marcar como referencia histórica para evitar dos fuentes de verdad.

---

## 6. Pruebas E2E faltantes (Q6)

Detalle de las §G pendientes del tramo formal:

| # | Prueba faltante | Cómo verificar |
|---|---|---|
| G2 | **Build formal de los 4 servicios** | `docker compose build db backend ai_service frontend` (servicios explícitos, **nunca** build global sin args) → exit 0 |
| G4 | **Migraciones** | `docker compose exec backend python manage.py migrate --plan` (sin pendientes) + `makemigrations --check` = No changes |
| G8 | **`ai_service` infer** | `POST :8081/infer` con imagen sintética → 200 JSON (declarar `model_loaded` histórico) |
| G13 | **Sin binarios/datasets en imagen** | `docker run --rm --entrypoint ls <img> /app` → sin `data/datasets` |
| G15 | **Smoke frontend** | `pwsh src/frontend/scripts/smoke-frontend.ps1` → 4/4 PASS |

*(G1, G3, G5, G6, G7, G9, G10, G11, G12, G14 ya verificadas en R1–R4.)*

---

## 7. Validación humana pendiente (Q7)

- **R7.5 — Pasada visual en navegador** según `PRE_DOCKER_VISUAL_VALIDATION_REPORT §J`: **16 capturas** (Dashboard, CMSC Hero+SignalRiver, Orchestration V2 Logger/Dataset, Knowledge Hub, Hardware Catalog/Detail, Workbench MMC, RoboticsLab, EmbeddedLab, TelecomLab, ElectronicsLab, DataScienceLab, AdvancedMathLab V1/V2, IA Predictiva, Navegación+VoiceAssistant, 404) + **DevTools** (consola sin excepciones no manejadas; Network `/api/*` vía proxy, sin `localhost:8000`/`onrender.com`).
- **No bloquea técnicamente**, pero es la **condición de honestidad** declarada antes de etiquetar "validado visualmente".
- Pendiente además: confirmar en navegador el runtime de `/assist` (voz) y el estado honesto de `SIN_PUENTE` del Bridge (bridge local apagado, correcto por diseño).

---

## 8. Veredicto

```
┌────────────────────────────────────────────────────────────────────┐
│  R1–R4:  ✅ CERRADO (DOCKER_READY_R1R4)                              │
│  H5:     ✅ CERRADO (gobernanza) — R5/serving sigue ABIERTO          │
│  R6:     ❌ NO CERRADO  (tag release · registry? · DEPLOYMENT.md)   │
│  R7:     ⚠️ PARCIAL     (§G: G2/G4/G8/G13/G15 pendientes)           │
│  R7.5:   ❌ PENDIENTE   (validación visual humana · 16 capturas)     │
│                                                                      │
│  CLASIFICACIÓN GLOBAL:  DOCKER_NOT_READY                             │
└──────────────────────────────────────────────────────────────┘
```

### Vía de cierre (no ejecutada — solo registro)
1. **R5/H5-código** (F5): ONNX M1/M2 **o** etiqueta `HISTÓRICO` explícita en `/infer` + docs.
2. **R6** (F1–F4): tag release semver+SHA · `compose.resolved.yml` · `DEPLOYMENT.md` oficial · decidir registry vs OCI.
3. **R7** (F6): ejecutar §G faltantes (G2/G4/G8/G13/G15) con daemon UP y servicios explícitos.
4. **R7.5** (F7): pasada visual humana §J.
5. **R8** (rem. plan): declarar → **`DOCKER_READY`**.

### Nota de honestidad
`H5_CLOSED` cierra la **gobernanza** de IA (qué es canónico/histórico), **no** el *serving*: el contenedor continúa reportando `model_loaded":"plant_disease_mbv2.h5"` (`:8081/health`). Mientras no se cierre R5, el stack **no** está alineado al canon `AI_CANON_HYBRID` y `DOCKER_READY` no puede declararse.

---

**Sin modificar código · sin commits · sin push · sin dockerizar · sin `down -v` · sin OCI · sin SIGCT Memory · sin Qdrant.**
