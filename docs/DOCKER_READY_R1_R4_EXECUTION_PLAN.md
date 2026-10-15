# DOCKER_READY_R1_R4_EXECUTION_PLAN

## Plan de ejecución técnica de R1–R4 (preparación; SIN implementar)

- **Misión:** `DOCKER_READY_R1_R4_EXECUTION_PLAN`
- **Base:** `DOCKER_READY_REMEDIATION_PLAN` (dictamen `DOCKER_READY_POSSIBLE`).
- **Alcance exclusivo:** R1 (higiene) · R2 (arranque/readiness) · R3 (backend producción) · R4 (mismo-origen + `/assist`).
- **Naturaleza:** SOLO PLAN. **NO implementar · NO dockerizar · NO commits · NO push.**
- **NO tocar:** H5 · M1/M2 · SIGCT Memory · OCI · Auth · CMSC · Dashboard · Labs · Knowledge Hub · Hardware · Dataset · Bridge · Workbench.
- **HEAD de referencia:** `9109050`.
- **Estado verificado de partida:** contenedores `backend`/`ai_service`/`frontend` **Exited**; `db` healthy (Puerto 5544). Daemon Docker **había estado caído**; debe confirmarse UP antes de ejecutar (§Validaciones V0).

---

## 0. Dictamen

# `SAFE_TO_EXECUTE` — condicionado

R1–R4 son **acotados, reversibles y no tocan módulos congelados**. Cambian únicamente: `docker-compose.yml`, `src/backend/{Dockerfile,requirements.txt}` (+ un endpoint de salud aditivo), `src/frontend/Dockerfile`, y `.env`/`.env.example` (solo valores VITE). Todo es recuperable por `git` + backups. Condición dura: **daemon Docker UP** y **tag/backup previos**; y **nunca `down -v`** ni `up` sin args.

---

## 1. Archivos exactos que se tocarán

| # | Archivo | R | Tracked | Tipo de cambio |
|---|---|---|---|---|
| 1 | `docker-compose.yml` | R1, R2, R4 | ✅ | Perfil legacy `db-mysql`; quitar volumen backend; healthchecks/restart/depends_on; build args mismo-origen |
| 2 | `src/backend/Dockerfile` | R3 | ✅ | `CMD` → gunicorn |
| 3 | `src/backend/requirements.txt` | R3 | ✅ | añadir `gunicorn` |
| 4 | `src/backend/api/health.py` | R3 | ➕ nuevo | vista de salud (aditiva) |
| 5 | `src/backend/api/urls.py` | R3 | ✅ | registrar `/api/health/` |
| 6 | `src/frontend/Dockerfile` | R4 | ✅ | `location /assist` en nginx |
| 7 | `.env` | R4 | ❌ (gitignored) | VITE_* a mismo-origen |
| 8 | `.env.example` | R4 | ✅ | VITE_* a mismo-origen |

> **No se toca:** `src/backend/sigct_backend/settings.py` · ningún módulo de `src/frontend/src/**` (los endpoints ya normalizan localhost vía `config/endpoints.js`) · `src/ai_models/**` · `.dockerignore`.

---

## 2. Cambios exactos (propuesta — NO aplicada)

### R1 — Higiene del stack (H9, H4)

**`docker-compose.yml`**
- `db-mysql`: **no se borra** (regla NADA DESAPARECE); se aparta bajo perfil para que `up` no lo arranque:
  ```yaml
  db-mysql:
    image: mysql:8.0
    container_name: sigctiarural_mysql_db
    profiles: ["legacy"]        # <-- AÑADIR: no arranca por defecto; datos intactos
    ...
  ```
- `backend`: **eliminar** el montaje de código (volumen `mysql_data` se conserva):
  ```yaml
  # backend:
  #   volumes:
  #     - ./src/backend:/app     <-- ELIMINAR (inmutabilidad de imagen)
  ```

### R2 — Orden de arranque y readiness (H2, H3)

**`docker-compose.yml`** — añadir a `backend`, `ai_service`, `frontend`:

```yaml
backend:
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "python", "-c", "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/api/health/').status==200 else 1)"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 20s
```

```yaml
ai_service:
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "python", "-c", "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8081/health').status==200 else 1)"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 20s
```

```yaml
frontend:
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 15s
  depends_on:
    backend:
      condition: service_healthy
    ai_service:
      condition: service_healthy
```

> Nota: `python:3.11-slim` y `python:3.11-slim-bullseye` **no traen `curl`** → se usa `python -c urllib`. `nginx:alpine` incluye `wget` (busybox).

### R3 — Backend producción (H1)

**`src/backend/requirements.txt`** — añadir (pin estable a verificar):
```
gunicorn==23.0.0
```

**`src/backend/Dockerfile`** (línea 17):
```dockerfile
# ANTES:
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
# DESPUÉS:
CMD ["gunicorn", "sigct_backend.wsgi:application", \
     "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", \
     "--access-logfile", "-", "--error-logfile", "-"]
```
> WSGI confirmado: `WSGI_APPLICATION = 'sigct_backend.wsgi.application'` (`settings.py:101`) y `src/backend/sigct_backend/wsgi.py` existe. (No hay `asgi.py`.)

**`src/backend/api/health.py`** (nuevo, aditivo):
```python
from django.http import JsonResponse

def health(request):
    return JsonResponse({"status": "ok"})
```

**`src/backend/api/urls.py`** (añadir):
```python
from .health import health
...
urlpatterns = [
    path('health/', health, name='health'),   # -> /api/health/
    ...
]
```

> **Alternativa sin código nuevo (si se prefiere):** usar como healthcheck del backend un endpoint existente de solo lectura (`GET /api/robots/`). Se documenta pero se recomienda `/api/health/` por ser explícito.

### R4 — Mismo-origen + `/assist` (H7, H6)

**`docker-compose.yml`** — `frontend.build.args` a mismo-origen:
```yaml
args:
  VITE_AI_INFERENCE_URL: ${VITE_AI_INFERENCE_URL:-/api/v3/ai/inference/}
  VITE_AI_API_BASE: ${VITE_AI_API_BASE:-}
  VITE_API_URL: ${VITE_API_URL:-/api}
```

**`.env`** (local) — sustituir valores absolutos por relativos:
```dotenv
VITE_API_URL=/api
VITE_AI_API_BASE=
VITE_AI_INFERENCE_URL=/api/v3/ai/inference/
```

**`.env.example`** — alinear a mismo-origen (dejar de apuntar a `onrender.com`/`api.sigct-rural.com` como default).

**`src/frontend/Dockerfile`** — dentro del bloque `server {}` (echo de `default.conf`, líneas 43-57), añadir:
```nginx
location = /assist {
    proxy_pass http://ai_service:8081/assist;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

> Trazado verificado: `VoiceAssistant.jsx:6-8,83` → `resolveEndpoint(VITE_AI_API_BASE, DEV? 'http://localhost:8081' : '')` → en prod `''` → `${''}/assist` = **`/assist`** (mismo-origen) → lo sirve nginx. `AIPredictiva.jsx:3` usa `VITE_AI_INFERENCE_URL` **sin** normalizar → se resuelve con el valor relativo del build arg. `DataScienceLab`/`cloud.js`/`useRoboticsApi` ya usan `resolveEndpoint` (no requieren cambio).

---

## 3. Riesgos

| ID | Riesgo | Sev. | Mitigación |
|---|---|---|---|
| E1 | Daemon Docker caído → nada verificable | ALTA | Confirmar Docker Desktop UP **antes** de empezar (V0). |
| R2.1 | Host multi-proyecto (16 contenedores) → contención al recrear backend/ai/frontend | MEDIA | Verificar RAM/CPU libres; recrear servicios **uno a uno** con args explícitos. |
| R2.2 | Healthcheck con `start_period` corto → `frontend` no arranca por dependencia | MEDIA | `start_period` holgado (20s) y `depends_on` condicional. |
| R3.1 | `gunicorn` rompe algo que `runserver` toleraba (ej. rutas estáticas) | MEDIA | `python manage.py check` + smoke de endpoints; rollback de 1 línea. |
| R3.2 | Healthcheck del backend apunta a endpoint inexistente → servicio `unhealthy` | MEDIA | Añadir `/api/health/` (R3) **antes** de cablear el healthcheck (R2). |
| R4.1 | `location = /assist` mal formado en `default.conf` → nginx no arranca | MEDIA | `docker compose config` + `nginx -t` dentro de la imagen; prueba HTTP real. |
| R4.2 | `.env` local con VITE_* absolutas **pisa** los defaults relativos del compose | MEDIA | Cambiar `.env` (R4) además de los defaults del compose. |
| R4.3 | `VITE_AI_API_BASE` vacío cambia el comportamiento de algún consumidor | BAJA | Ya normalizado por `resolveEndpoint` (fallbacks `/api` y `''`); verificar en pruebas. |
| R1.1 | Perfil `legacy` no soportado en versiones viejas de compose | BAJA | Compose v5.5.1 reportado → soporta `profiles`. |
| Gral | `down -v` destruye `postgres_data`/`mysql_data` | CRÍTICA | Prohibido; backup `pg_dump` antes (R-b). |
| Gral | Tocar módulos congelados por accidente | ALTA | `git status` acotado; revisar diff antes de cada paso. |

---

## 3bis. Rollback

1. **Sin borrar volúmenes:** `docker compose stop` → `docker compose down` (**NUNCA `-v`**).
2. **Código/config:** restaurar desde tag/commit: `git checkout <pre-r1-tag> -- docker-compose.yml src/backend/Dockerfile src/backend/requirements.txt src/backend/api/urls.py src/frontend/Dockerfile .env.example`; borrar `src/backend/api/health.py`.
3. **`.env`:** restaurar la copia de respaldo (no versionado).
3. **Reconstruir/relanzar:** `docker compose build <servicio>` y `up -d <servicio>` con args explícitos.
4. **Si la DB quedó inconsistente:** `pg_restore` del dump R-b (no se esperaba tocar datos; preventivo).
4. **Verificación:** `git status` sin cambios en rutas congeladas; `db` sigue healthy.

---

## 4. Dependencias (entre R1–R4)

```
R3 (añade /api/health/) ──► R2 (healthcheck backend lo usa)
R1 ── independiente
R4 ── independiente (usa ai_service:8081 de la red de compose)
R2.depends_on frontera: frontend -> backend(healthy) + ai_service(healthy)
```
- **Orden recomendado:** **R1 → R3 → R2 → R4.**
- Sin dependencias externas. **H5/M1-M2 NO participan** en R1–R4.

---

## 4bis. Validaciones (pre/post)

| ID | Momento | Validación | Criterio |
|---|---|---|---|
| V0 | Antes | `docker info` / `docker ps` | daemon UP; `db` healthy; contenedores ajenos intactos |
| V1 | Antes | `git tag pre-docker-r1r4` + `pg_dump -Fc sigctiarural_db` | tag + dump con hash |
| V2 | Antes | `docker compose config` | válido |
| V3 | R1 | `docker compose config --services` | `db-mysql` ya no listado por defecto |
| V4 | R3 | `python manage.py check` (dentro del contenedor/imagen) | sin errores |
| V5 | R3 | `GET /api/health/` | `200 {"status":"ok"}` |
| V6 | R2 | `docker compose ps` | `db/backend/ai_service/frontend` **healthy** |
| V7 | R4 | `nginx -t` (dentro de la imagen) | `syntax is ok` |

---

## 4ter. Pruebas (obligatorias al ejecutar)

1. `docker compose build` (4 servicios) → exit 0.
| `docker compose up -d` (con args) → todos `Up (healthy)`.
3. Backend: `GET /api/health/` → 200; `GET /api/robots/` → 200.
4. AI: `GET :8081/health` → 200; `POST /infer` (imagen sintética) → 200 (nota: sirve el `.h5` histórico — se declara honesto; **H5 no se toca aquí**).
5. Frontend: `GET /` → 200 + `<div id="root">`.
6. Proxy: `GET /api/...` vía nginx → 200 (backend).
| V7 | **`POST /assist`** vía nginx (`http://<host>:5173/assist`) | alcanza `ai_service` (no 404) |
| V8 | Bundle | `grep` del `dist` → **sin** `localhost:8010`/`localhost:8081`/`onrender.com` |
| V9 | Persistencia | `down` (sin `-v`) + `up` → datos de DB persisten |
| V10 | No-regresión | `docker ps` no altera vetna/eiarc/servsoftbagm |
| V11 | Congelados | `git status` sin cambios en CMSC/Dashboard/Labs/KH/Hardware/Dataset/Bridge/Auth |

---

## 5. Tiempo estimado

| Paso | Trabajo | Estimado |
|---|---|---|
| V0–V2 | pre-flight + tag + `pg_dump` | 15–25 min |
| R1 | compose (db-mysql legacy, volumen) | 10–15 min |
| R3 | requirements + Dockerfile + health endpoint + rebuild backend | 30–45 min |
| R2 | healthchecks + depends_on + recreate | 25–35 min |
| R4 | nginx `/assist` + VITE mismo-origen + rebuild frontend (~2 min build) | 30–45 min |
| V3–V11 | validaciones + pruebas | 30–60 min |
| **Total** | | **≈2 h 20 min – 4 h 05 min** |

---

## 6. Clasificación

# `SAFE_TO_EXECUTE`

**Condiciones ineludibles (si se viola alguna → `NOT_SAFE_TO_EXECUTE`):**
1. Daemon Docker **UP** y `db` healthy antes de empezar.
2. `git tag` + `pg_dump` previos (V1).
3. **Nunca** `docker compose up --build` sin args; **nunca** `down -v`.
4. **No tocar** H5 · M1/M2 · SIGCT Memory · OCI · Auth · módulos congelados.
5. Recrear servicios **uno a uno**; verificar no-regresión multi-proyecto (V10).

**NO se implementó · NO se dockerizó · NO se modificó código · NO hubo commits ni push.**
