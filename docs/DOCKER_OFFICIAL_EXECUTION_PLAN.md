# DOCKER_OFFICIAL_EXECUTION_PLAN

## Plan de ejecución — Docker Oficial SIGCT-Rural

- **Misión:** `DOCKER_OFFICIAL_EXECUTION_PLAN`
- **Naturaleza:** SOLO plan. NO se dockeriza · NO se modifica código · NO se tocan Dockerfiles/compose · NO commits · NO push.
- **HEAD auditado:** `9109050` (`feature/cmsc-f3c-v1-implementation`)
- **Decisiones congeladas respetadas:** M1 baseline · M2 challenger · `v1` dataset canónico · `plant_disease_mbv2.h5` histórico (`AI_CANON_HYBRID`).
- **Regla:** toda afirmación se ancla a evidencia (archivo:línea, doc, commit). El daemon Docker estaba **caído** durante esta auditoría (`npipe://…dockerDesktopLinuxEngine`, no verificable en vivo); los hechos de runtime provienen de reportes validados (`DOCKER_RUNTIME_AND_DATABASE_VALIDATION_REPORT`, `FRONTEND_OFFICIALIZATION_PHASE_2_REPORT`).

---

## 0. Veredicto

# CLASIFICACIÓN: `DOCKER_NOT_READY`

**El stack compone y se validó parcialmente, pero NO está listo para declararse "Docker Oficial" de producción.** El **plan de ejecución (§C) sí es ejecutable** una vez cerrados los bloqueadores (§D/§H). La diferencia entre "el stack arranca" (probado) y "es oficial de producción" (no probado) es la brecha que este plan cierra.

Bloqueadores de oficialización (detalle en §H):
1. `backend` corre con **`manage.py runserver`** (servidor de desarrollo), no WSGI de producción.
2. **Sin healthchecks** en `backend`, `ai_service`, `frontend` (solo `db` los tiene).
3. **Sin registry, tags reproducibles ni firma** (eso es OCI, iniciativa posterior — pero "Docker Oficial" exige al menos tag + docs de despliegue).
4. **Secretos**: `.env` no versionado y `.env.example` apunta a URLs cloud; `SECRET_KEY` obligatoria con `DEBUG=false`.
5. **`db-mysql` = residuo** todavía en el stack.
6. **AI canónico híbrido vs contenedor**: el `ai_service` sirve el `.h5` **histórico** (degenerado); la línea oficial es M1/M2 (contrato neutral).
7. **Gaps de proxy nginx + URLs horneadas**: `/assist` (Voice) no está proxyado y el bundle fija `http://localhost:8010` / `:8081` (solo válido mismo host).
8. **Daemon no disponible** al auditar; contenedores Docker **no verificados en vivo**.

---

## 1. Inventario Docker real (evidencia)

### 1.1 `docker-compose.yml` (5 servicios)

| Servicio | Imagen/Build | `container_name` | Puerto host→cont | Volumen | Healthcheck | restart |
|---|---|---|---|---|---|---|
| `db` | `postgres:15` | `sigctiarural_postgres_db` | `5544:5432` | `postgres_data` | ✅ `pg_isready` | unless-stopped |
| `db-mysql` | `mysql:8.0` | `sigctiarural_mysql_db` | `3316:3306` | `mysql_data` | ✅ ping | unless-stopped · **residuo** |
| `backend` | build `./src/backend` | `sigctiarural_backend` | `8010:8000` | **`./src/backend:/app`** | ❌ | ❌ |
| `ai_service` | build `./src/ai_models` | `sigctiarural_ai_service` | `8081:8081` | — | ❌ | ❌ |
| `frontend` | build raíz + `src/frontend/Dockerfile` | `sigctiarural_frontend` | `5173:80` | — | ❌ | ❌ |

- `depends_on`: `backend`→`db` (healthy), `ai_service`→`db` (healthy), `frontend`→`backend`.
- Volúmenes nombrados: `postgres_data`, `mysql_data`.

### Dockerfiles
- **backend** (`src/backend/Dockerfile`): `python:3.11-slim-bullseye` + libpq/gcc; `CMD runserver 0.0.0.0:8000` (dev server).
- **ai_service** (`src/ai_models/Dockerfile`): `python:3.11-slim` + `ffmpeg`, `libespeak`; `uvicorn fastapi_app:app --port 8081`; crea `/app/production_models`, `/app/data/logs`.
- **frontend** (`src/frontend/Dockerfile`): multi-stage `vite build` → `nginx:alpine`; contexto = **raíz del repo**; nginx proxya **solo** `/api/` → `http://backend:8000/api/`; SPA fallback `try_files … /index.html`.

### `.dockerignore` (raíz)
Contexto de build del frontend **restringido por whitelist**: `src/frontend/**`, `README.md`, `SIGCT_RURAL_SYSTEM_BOOT.md`, `docs/**`, `tools/cmsc-data-logger/src/**`. Excluye backend, ai_models, node_modules, dist. **Motivo:** el Knowledge Hub (`docLoader.js`) lee `README.md`/`SIGCT_RURAL_SYSTEM_BOOT.md`/`docs/**` vía `import.meta.glob` **en build**; y `AcousticFirstResultCard.jsx` importa `tools/cmsc-data-logger/src/rules-v0.js`.

### Entorno / DB
- `.env` (no versionado): `DB_NAME=sigctiarural_db`, `DB_USER=sigct_user`, `DB_HOST=localhost`, `DB_PORT=5544`, `POSTGRES_PORT=5544`; además **`VITE_API_URL=http://localhost:8010`, `VITE_AI_API_BASE=http://localhost:8081`, `VITE_AI_INFERENCE_URL=http://localhost:8010/api/v3/ai/inference/`** (ver §D R14).
- `.env.example` (referencia): mismas claves pero apuntando a cloud (`api.sigct-rural.com`, `sigct-backend.onrender.com`).
- `DATABASE_URL` **no definida** → rama manual de `settings.py:108-128` activa (`DB_HOST` default `localhost`).
- `settings.py:23-194`: `DEBUG` desde `DJANGO_DEBUG` (`:23`); `SECRET_KEY` vacía por default y **obligatoria si `DEBUG=false`** (`:30-36`); `ALLOWED_HOSTS` (`:40`); `CORS_ALLOWED_ORIGINS` (`:172`); endurecimiento HTTP condicionado a `not DEBUG` (`:186-194`).

### Estado validado (reportes)
- **DB:** `DATABASE_RECONCILED` — Postgres 15.19 vivo, migraciones `0001`/`0002` aplicadas, 4 tablas de dominio vacías, 0 divergencias.
- **Frontend:** Phase 2 `GO_PHASE_2_COMPLETED` — build verde, `docker compose build frontend` OK, smoke 4/4 PASS.
- **GO_NO_GO:** `GO_FRONTEND_OFFICIALIZATION_CONDICIONADO`; "Docker Oficial" pendiente de **registry + docs de despliegue**; OCI y SIGCT Memory no iniciados.

---

## 1bis. Respuestas solicitadas

### A. Servicios que SÍ deben entrar al Docker Oficial

| # | Servicio | Justificación |
|---|---|---|
| 1 | **`db` (PostgreSQL 15)** | Runtime canónico de persistencia (`DATABASE_RECONCILED`); healthcheck presente. |
| 2 | **`backend` (Django)** | API canónica (`/api/v3/*`); consumidor principal de la DB. **Requiere endurecer a producción.** |
| 3 | **`ai_service` (FastAPI)** | Serving oficial de IA. **Debe servir la línea `AI_CANON_HYBRID`**, no el `.h5` histórico. |
| 4 | **`frontend` (nginx)** | UI oficial; build estático validado + proxy `/api`. Incluye CMSC, Dashboard, Labs, Hardware, Knowledge Hub. |

**Stack oficial = 4 servicios.**

### B. Servicios/artefactos que deben quedar FUERA

| # | Fuera | Razón (evidencia) |
|---|---|---|
| 1 | **`db-mysql`** | Residuo pre-Postgres; sin driver `mysqlclient/PyMySQL` en `requirements.txt` ni referencias en código (comentario en `docker-compose.yml:24-26`). Preservar datos por regla NADA DESAPARECE. |
| 2 | **`tools/cmsc-data-logger/` (bridge/stats)** | Tooling local `127.0.0.1:8766`; no desplegable (`RECOMMENDATIONS_CONSOLIDATION.md:25`). Solo `rules-v0.js` sale en el bundle. |
| 3 | **`data/datasets/**`** | Fuera de git por política; **jamás** dentro de una imagen. |
| 4 | **`notebooks/`, `benchmark/`, `runs/`** | Desarrollo/entrenamiento, no runtime. |
| 5 | **SIGCT Memory (Qdrant/Ollama)** | No implementado (`SIGCT_MEMORY_M0_DECISION_ACTA`); misión futura. |
| 6 | **OCI (registry/firma/SBOM)** | Iniciativa posterior a "Docker Oficial" (`GO_NO_GO_EXECUTIVE_REVIEW §10`). |
| 7 | **Vite dev server (5173/5174)** | Herramienta de desarrollo; el runtime oficial es nginx (contenedor `frontend`). |
| 8 | **Worklets** (`public/worklets/`) | Parte del bundle del frontend, no contenedor aparte. |

### C. Orden exacto de migración

```
[FASE -1] PRE-FLIGHT (read-only + backups)
  0.1  Verificar Docker Desktop UP (hoy: DOWN) y `docker compose config` válido
  0.2  Verificar recursos del host (16 contenedores de 4 proyectos activos)
  0.3  git tag de congelamiento (R-a) + `git rev-parse HEAD`
  0.4  pg_dump de sigctiarural_db (R-b) + hash; backup de `.env` (seguro)
  0.5  Confirmar `stash@{0}` intacto; NO tocar

[FASE 0] PERSISTENCIA (ya en curso / validar)
  1.   `db` UP → healthcheck pg_isready → `migrate --plan` sin pendientes

[FASE 1] BACKEND
  2.   build `backend` → `up -d backend` → migrate → GET /api/v3/* 200
  3.   Endurecer: WSGI producción + healthcheck + quitar volumen de código (misión de código)

[FASE 2] SERVICIO IA
  4.   build `ai_service` (TensorFlow, pesado) → `up -d ai_service`
  5.   GET :8081/health → {status:ok} ; POST /infer (imagen sintética) → 200
  6.   (Posterior) alinear al contrato `AI_CANON_HYBRID` (ONNX M1/M2)

[FASE 3] FRONTEND
  7.   build `frontend` (contexto raíz) → `up -d frontend`
  8.   GET / → 200 + `<div id="root">` ; proxy `/api` → backend 200
  9.   Completar proxy nginx para `/assist` (Voice) — misión de código

[FASE 4] OFICIALIZACIÓN (tag + docs)
  10.  Tag reproducible (git SHA + semver); redactar docs de despliegue
  11.  `docker compose config > compose.resolved.yml` como artefacto
  12.  (Fuera de alcance) registry / firma / SBOM = OCI

[FASE 5] DECLARAR DOCKER_READY
  13.  Checklist §G completa en verde → re-clasificar a DOCKER_READY
```

Regla de oro: **nunca** `docker compose up -d --build` sin args; **nunca** `docker compose down -v`.

### D. Riesgos

| ID | Riesgo | Sev. | Evidencia / Mitigación |
|---|---|---|---|
| R1 | **Daemon Docker DOWN** durante la auditoría | ALTA | No verificable en vivo; verificar `Docker Desktop UP` antes de Fase -1. |
| R2 | **Host multi-proyecto (16 contenedores / 4 proyectos)** | ALTA | `IA_PREDICTIVA_EXECUTION_READINESS_REPORT §9.3`; contención de RAM/CPU con `ai_service` (TF >1 GB). Verificar recursos. |
| R3 | **Colisión de puertos** (Vetna/EIARC/servsoft ocupan 3000-3003, 4200, 5432-5434, 5672, 6379, 8002) | MEDIA | `sigctiarural_*` usa 5544/3316/8010/8081/5173 sin solape; **no arrancar `frontend` si 5173 está tomado por Vite dev**. |
| R4 | **`backend` en `runserver`** (no producción) | ALTA | `src/backend/Dockerfile:17`; migrar a gunicorn/uvicorn workers. |
| R5 | **Sin healthchecks** en backend/ai/frontend | MEDIA | Añadir `healthcheck` + `restart: unless-stopped`. |
| R6 | **Secretos**: `.env` no versionado; `.env.example` con URLs cloud | MEDIA | No commitear `.env`; generar `SECRET_KEY` real; gestionar secretos fuera de git. |
| R7 | **`db-mysql` residuo** | BAJA | Retirar del stack activo conservando `mysql_data`. |
| R8 | **Mismatch IA**: el contenedor sirve el `.h5` **histórico** (degenerado) | ALTA | `AI_CANON_HYBRID`: el runtime oficial debe servir M1/M2 vía contrato neutral; hoy sirve `MODEL_RETRAIN_REQUIRED`. |
| R9 | **Proxy nginx incompleto**: `/assist` (Voz) no proxya a `ai_service` | MEDIA | `src/frontend/Dockerfile:43-57` solo proxya `/api/`; `VoiceAssistant.jsx` en prod llama `/assist`. |
| R10 | **Volumen de código** `./src/backend:/app` rompe inmutabilidad de imagen | MEDIA | Quitar en oficial (imagen inmutable). |
| R11 | **Binarios/datasets dentro de imagen** | BAJA | Mitigado por `.dockerignore` whitelist; verificar con `docker run ... ls`. |
| R12 | **`down -v`** destruye `postgres_data`/`mysql_data` | CRÍTICA | Prohibido; respaldo `pg_dump` antes de cualquier cambio. |
| R13 | **Build frontend depende del contenido del repo** (docs/README) | BAJA | Contexto raíz whitelisted; reproducible solo si el repo no cambia entre builds. |
| R14 | **URLs `localhost` horneadas en la imagen** | ALTA | `.env` define `VITE_API_URL=http://localhost:8010`, `VITE_AI_API_BASE=http://localhost:8081`, `VITE_AI_INFERENCE_URL=http://localhost:8010/api/v3/ai/inference/`; compose las inyecta como `build.args` → quedan fijas en el bundle. Solo funciona **mismo host**; en despliegue remoto el navegador llama a *su* localhost. Debe usarse mismo-origen (`/api...`). |

### E. Backups necesarios

1. **Git:** `git tag` de congelamiento (p.ej. `pre-docker-official`) + registrar `HEAD`. `stash@{0}` **intacto, no tocar**.
2. **Base de datos:** `pg_dump -Fc sigctiarural_db` (formato custom) + `sha256` + almacenamiento fuera del contenedor.
2bis. **Esquema:** `docs/database/er_schema_v8.mmd` + `migrations/0001`,`0002` (ya en repo).
3. **Config/secretos:** backup **seguro** de `.env` (no a git).
3. **Compose/Dockerfiles:** exportar `docker-compose.yml` + los 3 Dockerfiles + `.dockerignore` (§D R13).
4. **Imágenes (opcional):** `docker save` de las imágenes validadas para rollback sin rebuild.
5. **Artefactos de estado:** `docker compose config` resuelto.

### F. Rollback

```
1. Detener SIN borrar volúmenes:   docker compose stop ; docker compose down   (NUNCA -v)
2. Restaurar compose/Dockerfiles desde el tag git (git checkout <tag> -- docker-compose.yml ...)
   (o restaurar los backups de Fase -1)
3. Si la DB quedó inconsistente: recrear `db` y `pg_restore` del dump R-b
2bis. Rebuild desde el commit taggeado: docker compose build
3. Re-levantar solo los servicios afectados, con args explícitos
4. Referencia estable: el frontend legacy (5173 Vite/Docker previo) permanece como comparación
5. Verificar no-regresión: `git status` sin cambios en CMSC/Dashboard/Labs/Hardware/KH/Dataset/Bridge
```

Rollback **reversible por diseño**: compose es declarativo, volúmenes nombrados persisten, datos respaldados por `pg_dump`.

### F bis. Pruebas obligatorias (checklist §G)

| # | Prueba | Criterio PASS |
|---|---|---|
| G1 | `docker compose config` | válido, sin warnings de esquema |
| G2 | Build de los 4 servicios | exit 0 |
| G3 | `db` healthcheck | `pg_isready` healthy |
| G4 | Migraciones | `migrate --plan` sin pendientes; `makemigrations --check` = No changes |
| G5 | Backend endpoints | `GET /api/v3/*` → 200 |
| G6 | Proxy frontend→backend | `GET /api/...` a través de nginx → 200 |
| G7 | `ai_service` health | `GET :8081/health` → `{status:ok, model_loaded:…}` |
| G8 | `ai_service` infer | `POST :8081/infer` (imagen sintética) → 200 JSON (declarar honestidad: modelo histórico) |
| G9 | Frontend estático | `GET /` → 200 + `<div id="root">` |
| G10 | Voz (si aplica) | `POST /assist` alcanzable — hoy **falla** (R9) |
| G11 | No-regresión multi-proyecto | `docker ps` no muestra cambios en vetna/eiarc/servsoftbagm |
| G12 | Inmutabilidad de datos | `down` (sin `-v`) + `up` → datos persisten |
| G13 | Sin binarios en imagen | `docker run --rm <img> ls` sin `data/datasets` |
| G14 | Sistemas congelados | `git status` sin cambios en CMSC/Dashboard/Labs/Hardware/KH/Dataset/Bridge/Auth |
| G15 | Smoke frontend | `smoke-frontend.ps1` 4/4 PASS |

### H. Go / No-Go

**NO-GO a declarar `Docker Oficial` hoy.** Condiciones de promoción a `DOCKER_READY` (cada una = misión de código/ops explícita y separada):

| ID | Condición | Tipo |
|---|---|---|
| H1 | Endurecer `backend` a WSGI de producción (quitar `runserver`) | Código |
| H2 | Añadir healthchecks + `restart` a backend/ai_service/frontend | Código |
| H3 | Retirar `db-mysql` del stack activo (conservando volumen) | Compose |
| H4 | Gestión de secretos (`.env` fuera de git, `SECRET_KEY` real, `DEBUG=false`) | Ops |
| H5 | Alinear `ai_service` al contrato `AI_CANON_HYBRID` (ONNX M1/M2) | Código |
| H6 | Completar proxy nginx (`/assist`) para Voz | Código |
| H7 | Tag reproducible + docs de despliegue (mínimo para "Docker Oficial") | Ops |
| H8 | Quitar volumen de código del backend (inmutabilidad) | Compose |
| H9 | Ejecutar §G completo en verde con daemon UP | Verificación |
| H10 | Eliminar URLs `localhost` horneadas (usar mismo-origen `/api…` + proxy nginx) | Código/Compose |

**GO condicionado a ejecutar solo la FASE -1 (pre-flight + backups)** cuando Bernardo autorice y Docker Desktop esté UP.

### H bis. Compatibilidad con los sistemas oficiales

| Sistema | Estado en Docker Oficial | Nota |
|---|---|---|
| **CMSC** | **Incluido** en el bundle frontend (congelado) | Solo `.dockerignore` afecta el contexto de build. |
| **Knowledge Hub** | **Incluido**; requiere `README.md`+`docs/**` en build | Registro 51 docs intacto. |
| **Voice Assistant** | **Parcial** | `VoiceAssistant.jsx:6-8,83` → `${VITE_AI_API_BASE}/assist` (horneado `localhost:8081`, R14); nginx no proxya `/assist` (R9). |
| **Servicio IA** | **Presente pero desalineado** | `AIPredictiva.jsx:3` usa `VITE_AI_INFERENCE_URL` (horneado `localhost:8010`, R14); el canon es `AI_CANON_HYBRID`, pero el contenedor sirve el `.h5` histórico (R8/H5). |
| **OCI** | **Fuera** | Iniciativa posterior; sin registry/firma/SBOM. |
| **SIGCT Memory** | **Fuera** | No implementado; espera su misión (Qdrant + BC). |

---

## 2. Referencias (evidencia)

- `docker-compose.yml:1-103` · `src/backend/Dockerfile` · `src/ai_models/Dockerfile` · `src/frontend/Dockerfile:1-61` · `.dockerignore` · `.env.example`.
- `src/backend/sigct_backend/settings.py:23-194` (210 líneas; `DATABASE_URL` opcional, rama manual `:108-128`).
- `docs/DOCKER_RUNTIME_AND_DATABASE_VALIDATION_REPORT.md` (`DATABASE_RECONCILED`).
- `docs/FRONTEND_OFFICIALIZATION_PHASE_2_REPORT.md` (`GO_PHASE_2_COMPLETED`, smoke 4/4, docker build).
- `docs/GO_NO_GO_EXECUTIVE_REVIEW.md §9-§10` (Docker Oficial/OCI pendientes).
- `docs/IA_PREDICTIVA_EXECUTION_READINESS_REPORT.md §9.3` (host multi-proyecto, 16 contenedores).
- `docs/RECOMMENDATIONS_CONSOLIDATION.md` (qué entra/queda fuera).
- `docs/SIGCT_MEMORY_M0_DECISION_ACTA.md` (Memory no implementado).
- `docs/AI_CANONICAL_STRATEGY_DECISION_REPORT.md` (`AI_CANON_HYBRID`).

---

Fin del plan. Ningún archivo de código, Dockerfile, compose o configuración fue modificado; no hubo commits ni push.
