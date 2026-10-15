# DOCKER_READY_R1_R4_REPORT

**Misión:** `DOCKER_READY_R1_R4_EXECUTION`
**Plan base:** `docs/DOCKER_READY_R1_R4_EXECUTION_PLAN.md` (`SAFE_TO_EXECUTE`, condicionado)
**Plan raíz:** `docs/DOCKER_READY_REMEDIATION_PLAN.md` (`DOCKER_READY_POSSIBLE`)
**Diagnóstico raíz:** `docs/DOCKER_OFFICIAL_EXECUTION_PLAN.md` (`DOCKER_NOT_READY`)
**HEAD de referencia:** `9109050` · **Rama:** `feature/cmsc-f3c-v1-implementation`
**Fecha de ejecución:** 2026-10-13 (America/Bogota)

---

## 0. Dictamen

# `R1–R4 EJECUTADO ✅` — Verificación completa

| Ámbito | Resultado |
|---|---|
| **Tramo R1–R4** (higiene + readiness + backend prod + mismo-origen) | **`DOCKER_READY_R1R4`** — aplicado y verificado end-to-end |
| **"Docker Oficial" global** | **`DOCKER_READY_PARTIAL`** — aún **NO** `DOCKER_READY` |

**Por qué no es `DOCKER_READY` global todavía:**
- **H5 (IA canónica) sigue ABIERTO** — fuera del alcance de R1–R4 por diseño. El `ai_service` continúa sirviendo el `.h5` histórico (`model_loaded":"plant_disease_mbv2.h5"`), **declarado honestamente** en `/health`. Depende del gate de gobernanza M1/M2 (R5).
- **R6** (versionado/registry/docs) y **R7** (verificación E2E formal + validación visual humana) permanecen **PENDING**.
- **V8** deja residuales **no bloqueantes** (ver §5): la app llama por rutas relativas, pero el bundle conserva cadenas `localhost:8081` (literal DEV muerto), `onrender.com` (`cloud.js` probe activo pre-existente) y `localhost:8010` (**texto de documentación embebida** del Knowledge Hub). Ninguno es regresión de R4.

**Sin regresiones:** módulos congelados intactos (V11) · contenedores ajenos intactos (V10) · datos de DB persistidos (V9).

---

## 1. Pre-flight (V0–V2)

| ID | Validación | Resultado |
|---|---|---|
| V0 | `docker info` / `docker ps` | Daemon **caído** al primer intento (`npipe ... dockerDesktopLinuxEngine`), **UP tras reintento (~25 s)**. `db` **healthy** (Puerto 5544). Contenedores ajenos intactos. **✅** |
| V1 | `git tag` + `pg_dump -Fc` | Tag **`PRE_R1_R4_EXECUTION`** → `9109050148fdd89c11a4066c6e0b61f52e49af6d`. Dump **`sigctiarural_db_PRE_R1_R4.dump`** (39.396 B) · **SHA-256 `FEF4A7C9A0371E580A679F08E3BBECB6EC179D1589B5A198B62238447F1FE1BB`** copiado a `C:\Users\BagmDev\AppData\Local\Temp\opencode\sigct_r1r4_backup\`. **✅** |
| V2 | `docker compose config --quiet` | `rc=0` · válido (pre y post cambios de healthcheck). **✅** |

---

## 2. Cambios aplicados (R1–R4)

### R1 — Higiene del stack (H9, H4)
**`docker-compose.yml`**
- `db-mysql`: añadido **`profiles: ["legacy"]`** + comentario. No arranca con `up`; volumen `mysql_data` **intacto**.
- `backend`: **eliminado** el montaje `volumes: - ./src/backend:/app` (imagen inmutable). Volumen `postgres_data` intacto.

### R2 — Orden de arranque y readiness (H2, H3)
**`docker-compose.yml`** — añadido a `backend`, `ai_service`, `frontend`:
`restart: unless-stopped` + `healthcheck`. `frontend.depends_on` ahora condicional:
`backend: service_healthy` + `ai_service: service_healthy`.

### R3 — Backend producción (H1)
| Archivo | Cambio |
|---|---|
| `src/backend/requirements.txt` | `+ gunicorn==23.0.0` |
| `src/backend/Dockerfile` | `CMD` `runserver` → `gunicorn sigct_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120 --access-logfile - --error-logfile -` |
| `src/backend/api/health.py` | **nuevo** — `health()` → `JsonResponse({"status": "ok"})` |
| `src/backend/api/urls.py` | `+ path('health/', health, name='health')` → `/api/health/` |

### R4 — Mismo-origen + `/assist` (H7, H6)
| Archivo | Cambio |
|---|---|
| `docker-compose.yml` | `frontend.build.args` a mismo-origen (`/api`, `''`, `/api/v3/ai/inference/`) |
| `.env` (gitignored) | `VITE_API_URL=/api` · `VITE_AI_API_BASE=` · `VITE_AI_INFERENCE_URL=/api/v3/ai/inference/` |
| `.env.example` | alineado a mismo-origen (ya no apunta a `onrender.com`/`api.sigct-rural.com`) |
| `src/frontend/Dockerfile` | `location = /assist { client_max_body_size 25m; proxy_pass http://ai_service:8081/assist; ... }` |

---

## 2bis. Desviaciones del plan (documentadas)

| ID | Desviación | Motivo |
|---|---|---|
| **D1** | Los tres `healthcheck` usan **`127.0.0.1`** en vez de `localhost`. | En `nginx:alpine`, `wget localhost` resuelve a **IPv6 `[::1]:80`** → `Connection refused` → `frontend` quedaba **`unhealthy`**. `127.0.0.1` fuerza IPv4 (donde escucha nginx). Se aplicó a backend/ai_service por consistencia (mismos contenedores). |
| **D2** | `db-mysql` (pre-existente, corriendo) fue **detenido** y luego removido por `docker compose down`. | Coherencia con R1 (no pertenece al stack activo). Volumen `sigctiarural_mysql_data` **intacto**; el contenedor se recrea solo con `--profile legacy`. |

---

## 3. Validaciones post-ejecución (V2–V11)

| ID | Validación | Evidencia | Resultado |
|---|---|---|---|
| V2 | `docker compose config` | `rc=0` | ✅ |
| V3 | Servicios por defecto | `db, ai_service, backend, frontend` (sin `db-mysql`; presente solo con `--profile legacy`) | ✅ |
| V4 | `python manage.py check` (en imagen) | `System check identified no issues (0 silenced).` · `gunicorn (version 23.0.0)` | ✅ |
| V5 | `GET /api/health/` | `{"status": "ok"}` 200 — directo `:8010` **y** vía nginx `:5173` | ✅ |
| V6 | `docker compose ps` | `db`, `backend`, `ai_service`, `frontend` → **healthy** | ✅ |
| V7 | `nginx -t` (en frontend) | `syntax is ok` / `test is successful` | ✅ |
| V8 | `grep dist` sin hosts horneados | **PASS con observación** — ver §5 | ⚠️ |
| V9 | `down` (sin `-v`) + `up` → persistencia | `django_migrations=20`, `auth_permission=40`, huella `md5=faff5c7f4989ce5284212102c28358c1` **idénticos** antes/después; volúmenes `sigctiarural_postgres_data` + `sigctiarural_mysql_data` preservados | ✅ |
| V10 | No-regresión multi-proyecto | `vetna_*` (8), `eiarc_*` (3), `servsoftbagm-db-1` intactos; **17** contenedores en el host | ✅ |
| V11 | Congelados sin cambios | `git status` solo con archivos R1–R4 + 2 pre-existentes (`.dockerignore`, `src/ai_models/fastapi_app.py`); **0** cambios en CMSC/Dashboard/Labs/KH/Hardware/Dataset/Bridge/Auth | ✅ |

---

## 3bis. Pruebas funcionales (runtime)

| Prueba | Comando | Resultado |
|---|---|---|
| Frontend raíz | `GET :5173/` | **200** `text/html` |
| Proxy backend | `GET :5173/api/health/` | **200** `{"status": "ok"}` |
| Endpoint existente | `GET :5173/api/robots/` | **200** |
| **`/assist` enrutado a FastAPI** | `GET :5173/assist` | **405** `application/json` `{"detail":"Method Not Allowed"}` → **enrutado a `ai_service` (NO 404 de nginx)** |
| `/assist` con cuerpo | `POST :5173/assist` (vacío) | **200** `{"error":"400: No se recibió archivo de audio..."}` (respuesta de FastAPI) |
| AI health | `GET :8081/health` | **200** `{"status":"ok","tensorflow":true,"voice":true,"model_loaded":"plant_disease_mbv2.h5"}` |
| nginx `location=/assist` | `nginx -t` | ok (V7) |

> `/assist` **no devuelve la SPA** (`text/html` 200 de `try_files`): devuelve `405/JSON` de FastAPI → prueba de que el `location = /assist` **sí** proxya a `ai_service`. ✅

---

## 4. Evidencia de rollback (disponible, no ejecutado)

1. `git tag PRE_R1_R4_EXECUTION` → `9109050148fdd89c11a4066c6e0b61f52e49af6d`.
2. `pg_dump` → `…\Temp\opencode\sigct_r1r4_backup\sigctiarural_db_PRE_R1_R4.dump` (39.396 B · SHA-256 `FEF4A7C9A0371E580A679F08E3BBECB6EC179D1589B5A198B62238447F1FE1BB`).
3. Rollback de código: `git checkout PRE_R1_R4_EXECUTION -- docker-compose.yml src/backend/{Dockerfile,requirements.txt,api/urls.py} src/frontend/Dockerfile .env.example` + borrar `src/backend/api/health.py`. **Nunca `down -v`.**

---

## 4bis. H5 — declaración honesta (NO tocado)

`H5` (IA canónica) **no formó parte de R1–R4** y **no se modificó**. Evidencia en runtime: `GET :8081/health` reporta `model_loaded":"plant_disease_mbv2.h5"` (artefacto **HISTÓRICO**). El cierre honesto de H5 (R5: gate M1/M2 · o etiquetado `HISTÓRICO`) queda pendiente por gobernanza.

---

## 5. Observaciones residuales (V8) — NO bloqueantes

El bundle (`/usr/share/nginx/html/assets/index-*.js`) conserva tres literales, **ninguno es regresión de R4**:

| Cadena | Origen | Naturaleza | Riesgo |
|---|---|---|---|
| `localhost:8081` | `VoiceAssistant.jsx:6` — `import.meta.env.DEV ? 'http://localhost:8081' : ''` | **literal DEV muerto en prod** (la rama `DEV` es `false`; runtime usa `''` → `/assist`) | Bajo |
| `localhost:8010` | **Documentación embebida** del Knowledge Hub (`docLoader.js` hace `import.meta.glob('../../../../../docs/**/*.md')`) — incluye los propios docs Docker | **texto**, no endpoint ejecutable | Nulo |
| `onrender.com` | `services/cloud.js:8,10` (**probe activo** de salud cloud) · `data/lab-data.js:352` (link de UI) · docs embebidos | probe/link **pre-existente**, fuera del alcance R1–R4 | Bajo |

**Verificado (V8b):** el bundle **sí** contiene las rutas relativas desplegadas — `/api/v3/ai/inference/` y `/assist` — y la app llama a su propia API por `/api` (`resolveEndpoint`). El criterio estricto de V8 ("sin los literales") **no se cumple** por las razones anteriores; el criterio de **intención** (sin host horneado para la propia API) **sí**.

**Recomendación (fuera de R1–R4, ligada a R6/R7):** abordar `cloud.js` (probe `onrender`) y `lab-data.js:352` en la fase de de-cloud; opcionalmente eliminar el literal DEV de `VoiceAssistant.jsx`.

---

## 6. Alcance respetado

- **NO** se tocó: H5 · M1/M2 · SIGCT Memory · OCI · Qdrant · Auth · CMSC · Dashboard · Labs · Knowledge Hub · Hardware · Dataset · Bridge · Workbench · `settings.py` · `src/frontend/src/**`.
- **NO** hubo `down -v` · **NO** `up --build` sin args (siempre servicios explícitos) · **NO** commits · **NO** push.

---

## 7. Próximos pasos

1. **R5 (H5)** — gate de gobernanza M1/M2 o etiquetado honesto `HISTÓRICO` (habilita `DOCKER_READY` global).
2. **R6** — tag de release, registry y docs.
3. **R7** — verificación E2E formal + validación visual humana (`PRE_DOCKER_VISUAL_VALIDATION_REPORT`).
4. **De-cloud** — `cloud.js`/`lab-data.js` (residual V8).

**Veredicto:** `R1–R4 EJECUTADO ✅` · **`DOCKER_READY_R1R4`** · global **`DOCKER_READY_PARTIAL`** (bloqueador único restante: **H5**).
