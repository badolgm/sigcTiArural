# R6_R7_EXECUTION_PLAN

**Misión:** `R6_R7_EXECUTION_PLAN`
**Naturaleza:** SOLO PLAN. **NO implementa · NO dockeriza · NO modifica código · NO crea tag · NO commits · NO push · NO `down -v` · NO `up --build` sin servicios explícitos · NO OCI · NO Memory · NO Qdrant.**
**Base:** `docs/DOCKER_READY_CLOSURE_REPORT.md` (`DOCKER_NOT_READY`; R1–R4 ✅ · H5-gobernanza ✅ · R6 ❌ · R7 ⚠️/❌).
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `9109050`
**Fecha:** 2026-10-13 (America/Bogota)

---

## 0. Dictamen

# `READY_FOR_R6_R7_EXECUTION`

Con **dos condiciones declaradas** (§8): (C1) R6 se define **sin registry push** — el push a registry es **OCI**, explícitamente fuera de alcance (`DOCKER_OFFICIAL_EXECUTION_PLAN §B6/§H7` + esta misión "NO OCI"); (C2) misión de ejecución explícita de Bernardo. **Advertencia de honestidad:** cerrar R6+R7 **no** produce `DOCKER_READY` global — queda **R5/H5-código** (serving) como bloqueo independiente (§1.0).

---

## 1.0 Precondición de estado (fuera de R6/R7 pero bloqueante de `DOCKER_READY`)

- **R5/H5-código ABIERTO:** `:8081/health` reporta `"model_loaded":"plant_disease_mbv2.h5"` (histórico). `H5_CLOSED` cerró **gobernanza**, no *serving*.
- **Implicación:** al cerrar R6+R7 el resultado es **`DOCKER_READY_PARTIAL`** (sin R5). Para `DOCKER_READY` global hace falta R5 (ONNX M1/M2 **o** etiqueta `HISTÓRICO` explícita en runtime). **Fuera del alcance de R6/R7; se registra para no confundir el veredicto.**

---

## 1. Plan exacto para resolver R6

> R6 = **tag reproducible + docs de despliegue** (+ artefacto resuelto). **Excluye registry/firma/SBOM (= OCI).**

### Paso R6.1 — Tag de release reproducible
1. Confirmar árbol estable y `HEAD` (`git rev-parse HEAD`).
- Crear tag **anotado** con esquema `docker-oficial-<semver>` + SHA en el mensaje:
  `git tag -a docker-official-v1.0.0 -m "Docker Oficial R1-R7 · HEAD <sha>"`.
- **No** push (prohibido). Tag local.
- **Semver propuesto:** `1.0.0` (primer Docker Oficial); ajustar solo si Bernardo indica base.
- **No** reutilizar tags `PRE_*` (son backups; se preservan).

## 1.2 Artefacto de composición resuelto
- `docker compose config > compose.resolved.yml` (artefacto §1.1/FASE-4 del plan oficial).
- Queda **untracked/versionable** (se decide en ejecución si se versiona o se gitignora; ver §3).

## 1.3 `docs/DEPLOYMENT.md` — reescritura oficial

Sustituir contenido obsoleto (21/08/2026; dice "no incluye `docker-compose.yml`") por secciones:
1. **Servicios (4 activos):** `db`(Postgres 15 · `5544→5432`) · `backend`(Django+gunicorn · `8010→8000`) · `ai_service`(FastAPI · `8081`) · `frontend`(nginx · `5173→80`). `db-mysql` = **perfil `legacy`**, no arranca por defecto.
2. **Readiness:** `healthcheck` + `restart: unless-stopped`; `frontend.depends_on` → `backend`/`ai_service` `service_healthy`; nota `127.0.0.1` (IPv4) en healthchecks.
3. **Mismo-origen:** `VITE_API_URL=/api`, `VITE_AI_API_BASE=`, `VITE_AI_INFERENCE_URL=/api/v3/ai/inference/`; nginx proxya `/api/`→`backend:8000` y `location = /assist`→`ai_service:8081`.
4. **Entorno:** `.env` (fuera de git) vs `.env.example`; `SECRET_KEY`/`DJANGO_DEBUG`/`ALLOWED_HOSTS`/`CORS_ALLOWED_ORIGINS`.
5. **Operación:** arranque (`up -d <servicios explícitos>`), logs, `down` (**nunca `-v`**).
6. **Backup/Rollback:** tag `PRE_R1_R4_EXECUTION` + `pg_dump -Fc`; `pg_restore`; reconstruir.
7. **Honestidad IA:** declarar `model_loaded` histórico (enlace a `H5_AI_GOVERNANCE_CLOSURE_REPORT`).
8. **Versión/tag:** documentar el tag de release de §1 (SHA).

**Observaciones de consistencia (menores, dentro de R6 docs):**
- `docs/sena_artifacts/DEPLOYMENT_FINAL.md` §3 afirma *"cinco servicios"* → precisar **4 activos + 1 legacy (perfil)**.
- `docs/DEPLOYMENT_AWS.md` → añadir nota "varía del Docker Oficial (mismo-origen)" o marcar como guía cloud separada.

**R6 = 3 entregables:** tag de release · `compose.resolved.yml` · `docs/DEPLOYMENT.md` reescrito.

---

## 2. Plan exacto para resolver R7

> R7 = **verificación E2E (§G) + validación visual humana (R7.5)**. Con daemon UP y **servicios explícitos**.

### 2.1 Checklist §G — pruebas faltantes (las ya verdes se re-confirman, no se repiten a fondo)

| # | Prueba | Comando exacto | Criterio PASS |
|---|---|---|---|
| G2 | Build 4 servicios | `docker compose build db ai_service backend frontend` | exit 0 (servicios explícitos) |
| G4 | Migraciones | `docker compose exec backend python manage.py migrate --plan` + `makemigrations --check --dry-run` | sin pendientes · "No changes detected" |
| G8 | `ai_service` infer | `curl -F file=@<img sintética> http://localhost:8081/infer` | 200 JSON (declarar `model_loaded` histórico) |
| G13 | Sin binarios/datasets en imagen | `docker run --rm --entrypoint sh sigctiarural_frontend -c "ls /usr/share/nginx/html | head"` + inspección de contexto | sin `data/datasets`, sin `node_modules` |
| G15 | Smoke frontend | `pwsh src/frontend/scripts/smoke-frontend.ps1` | 4/4 PASS |

**Re-confirmación rápida (ya ✅ en R1–R4):** G1 `config` · G3 `db` healthy · G5 `/api/v3/*` · G6 proxy `/api` · G7 `/health` · G9 `/`+`<div id=root>` · G10 `/assist` · G11 ajenos intactos · G12 persistencia (`down` sin `-v`) · G14 congelados.

**Reglas de ejecución:**
- `docker compose up -d backend frontend ai_service db` (**explícito**), nunca `up --build` global.
- **`down -v` PROHIBIDO** (destruye `postgres_data`/`mysql_data`, riesgo R12).
- `smoke-frontend.ps1` hace `down frontend` en su *teardown* → tras G15, re-`up -d frontend` si se necesita la UI viva.
- Antes de G2: `git tag` de respaldo (`PRE_R6_R7_EXECUTION`) + `pg_dump` (mismo patrón que R1–R4).

### 2.2 R7.5 — Validación visual humana (no automatizable aquí)

- Ejecutar las **16 capturas §J** de `PRE_DOCKER_VISUAL_VALIDATION_REPORT` + DevTools (consola sin excepciones; Network por proxy).
- Verificar en vivo: `/assist` (voz), badge `SIN_PUENTE` del Bridge (bridge local apagado = correcto), Logger/Dataset reales o `—`.
- Adjuntar capturas al expediente. **Condición de honestidad** antes de etiquetar "validado visualmente".

**R7 = 2 entregables:** §G completo en verde (con evidencia) + acta/capturas de la pasada visual §J.

---

## 3. Archivos involucrados

| Archivo | R6/R7 | Acción | Estado git |
|---|---|---|---|
| `docs/DEPLOYMENT.md` | R6 | **Reescribir** (oficial) | tracked |
| `compose.resolved.yml` | R6 | **Crear** (artefacto) | nuevo (decidir track vs ignore) |
| `docs/sena_artifacts/DEPLOYMENT_FINAL.md` | R6 | Ajuste menor ("4+legacy") | tracked |
| `docs/DEPLOYMENT_AWS.md` | R6 | Nota de divergencia | tracked |
| *(git)* tag `R6_R7_*`/release | R6 | **Crear tag** | repo |
| `docs/R6_R7_EXECUTION_REPORT.md` | R6+R7 | **Informe de ejecución** (futuro) | nuevo |
| `docs/<ACTA_VISUAL>.md` + capturas | R7.5 | Evidencia humana | nuevo |
| `docker-compose.yml` · Dockerfiles · `.env(.example)` | — | **NO TOCAR** (ya resueltos en R1–R4) | — |

**No se tocan** (por misión): CMSC · Dashboard · Knowledge Hub · Hardware · Labs · Bridge · Dataset · Memory · OCI · Qdrant. **CERO cambios de código de aplicación.**

---

## 4. Riesgos

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| RR1 | **Tag mal ubicado** (apuntando a HEAD equivocado) | Baja | `git rev-parse HEAD` antes; tag **anotado** (`-a`) con SHA en el mensaje; borrable con `git tag -d`. |
| RR2 | **`DEPLOYMENT.md` documenta algo no verificado** (rompe honestidad) | Media | Redactar **solo** sobre hechos de R1–R4/§G; lo no probado se marca `PENDIENTE`. |
| RR3 | **`compose.resolved.yml` versionado por accidente** con valores locales | Baja | No hacer `git add`; decidir track/ignore; nunca imprime secretos (usa `${}`). |
| RR4 | **G2 build pesado** (`ai_service` TensorFlow >1 GB) en host multi-proyecto | Media | Servicios explícitos; verificar RAM/CPU; no reconstruir lo no tocado si no hace falta. |
| RR5 | **`smoke-frontend.ps1` detiene `frontend`** (teardown `down frontend`) | Baja | Re-`up -d frontend` al terminar; **nunca** `-v`. |
| RR6 | **`down -v` accidental** → destruye `postgres_data`/`mysql_data` | **Crítica** | Regla dura; backup `pg_dump` + tag antes; `-v` prohibido. |
| RR7 | **Colisión de puertos** con Vite dev (5173) / otros proyectos | Media | No arrancar `frontend` si 5173 ocupado; puertos `sigctiarural_*` no solapan (5544/8010/8081/5173). |
| RR8 | **G8 `/infer` responde con modelo histórico** y se interpreta como correcto | Media | Registrar `model_loaded`; declarar honestidad; enlazar a R5. |
| RR9 | **Confundir "R6+R7 cerrados" con `DOCKER_READY`** | Media | Este plan declara que **R5 sigue abierto**; veredicto final = `DOCKER_READY_PARTIAL` hasta R5. |
| RR10 | **Pasada visual humana** no ejecutable en este entorno | Media | R7.5 se entrega como **acta + capturas** de Bernardo; no se finge validación visual. |

---

## 5. Rollback

**Reversible por diseño; sin tocar datos ni volúmenes.**

| Elemento | Rollback |
|---|---|
| Tag de release creado | `git tag -d <tag>` (nunca `push`, no hay remoto afectado). |
| `compose.resolved.yml` | `Remove-Item` (artefacto derivado; regenerable con `docker compose config`). |
| `docs/DEPLOYMENT.md` (tracked) | `git checkout HEAD -- docs/DEPLOYMENT.md` (restaura la versión 21/08/2026). |
| `DEPLOYMENT_FINAL.md` / `DEPLOYMENT_AWS.md` | `git checkout HEAD -- <archivo>`. |
| Contenedores alterados por §G | `docker compose up -d <servicios explícitos>` para restaurar; **jamás `down -v`**. |
| Base de datos | No se modifica. Si algo falla: tag `PRE_R6_R7_EXECUTION` + `pg_restore` del dump. |
| Estado previo global | Tag `PRE_R1_R4_EXECUTION` (`9109050`) intacto como referencia estable. |

---

## 6. Tiempo estimado

| Bloque | Trabajo | Estimado |
|---|---|---|
| R6.1 | Tag de release | 5 min |
| R6.2 | `compose.resolved.yml` | 5 min |
| R6.3 | `DEPLOYMENT.md` reescritura + ajustes docs | 60–90 min |
| R7.1 | §G faltantes (G2 build + G4/G8/G13/G15) | 30–60 min |
| R7.2 | Re-confirmación rápida §G verdes | 10–15 min |
| R7.5 | Pasada visual humana §J (16 capturas + DevTools) | 45–90 min |
| — | **Informe `R6_R7_EXECUTION_REPORT`** | 20–30 min |
| **Total** | **R6+R7 (sin humano)** | **≈ 2.5–3.5 h** |
| **Total** | **+ R7.5 humano** | **≈ 3.5–5 h** |

---

## 7. Validaciones (criterios de aceptación)

**R6 aprobado si:**
- Existe tag **anotado** de release con SHA verificable (`git show <tag>`).
- `compose.resolved.yml` generado (`rc=0`) y su contenido refleja 4 servicios + perfil legacy.
- `docs/DEPLOYMENT.md` reescrito cubre §1.1–§1.8 y **no** contiene afirmaciones no verificadas.

**R7 aprobado si:**
- §G: **G1–G15 todas PASS** (o PASS-con-observación justificado y **no bloqueante**; p.ej. residuales V8 `localhost:8081`/`onrender.com`/`localhost:8010` ya declarados).
- Persistencia confirmada (`down` sin `-v` + `up` → datos intactos).
- **No-regresión:** contenedores ajenos intactos; `git status` sin cambios en CMSC/Dashboard/KH/Hardware/Labs/Bridge/Dataset/Memory.
- R7.5: acta + 16 capturas + DevTools adjuntas.

**Veredicto esperado tras ejecución:** **`DOCKER_READY_PARTIAL`** (`R1–R4 + R6 + R7` ✅). **`DOCKER_READY` global sólo tras R5.**

---

## 8. Condiciones del dictamen

- **C1 (definición de R6):** registry push = **OCI**, excluido ⇒ R6 = tag + docs (+ `compose.resolved.yml`). Si Bernardo exigiera registry, R6 colisiona con "NO OCI" → requeriría decisión y re-`NOT_READY`.
- **C2 (autorización):** ejecución requiere misión explícita de Bernardo (crear tag y modificar `DEPLOYMENT.md`).
- **Requisitos de entorno ya satisfechos:** Docker Desktop **UP**; `db` healthy; puertos `sigctiarural_*` sin solape.
- **Fuera de alcance por diseño:** R5/H5-código · OCI · Memory · Qdrant · de-cloud (`cloud.js`/`lab-data.js`, residual V8).

---

## 9. Veredicto

```
┌──────────────────────────────────────────────────────────────────────┐
│  R6 = tag release + compose.resolved.yml + DEPLOYMENT.md  →  ~1.5–2 h  │
│  R7 = §G (G2/G4/G8/G13/G15) + R7.5 visual humana          →  ~1.5–3 h  │
│  Rollback reversible · sin tocar datos · sin `down -v`                 │
│                                                                        │
│  CLASIFICACIÓN:  READY_FOR_R6_R7_EXECUTION                             │
│  (condicionado a C1 registry=OCI y C2 autorización explícita)          │
│  ADVERTENCIA: no produce DOCKER_READY global — R5 sigue abierto        │
└──────────────────────────────────────────────────────────────────────┘
```

---

**Sin implementar · sin dockerizar · sin modificar código · sin crear tag · sin commits · sin push · sin OCI · sin Memory · sin Qdrant.**
