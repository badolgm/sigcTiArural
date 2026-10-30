<!--
  L-5 (2026-10-30): sección canónica antepuesta. El contenido original de este
  documento (2026-08-21) se conserva íntegro más abajo como HISTÓRICO, porque
  contiene afirmaciones hoy falsas (p. ej. "el repositorio no incluye
  docker-compose.yml"). NADA DESAPARECE: se corrige por delante, no se borra.
-->

# Despliegue — Desarrollo Local y Opciones Cloud

> ## ⚠️ ESTADO CANÓNICO (2026-10-30)
>
> **Esta sección prevalece sobre el resto del documento.** Lo que sigue bajo el
> marcador `HISTÓRICO` describe el repositorio tal como estaba el 2026-08-21 y se
> mantiene solo como registro.

## 1. El despliegue real de hoy es `docker-compose.yml` (existe en la raíz)

El documento original decía que el repositorio no incluía `docker-compose.yml`.
**Hoy sí lo incluye** y es la vía de ejecución validada:

| Servicio (compose) | Imagen / build | Puerto host → interno | Healthcheck |
|---|---|---|---|
| `db` | `postgres:15` | `5544` → `5432` | `pg_isready` |
| `backend` | `./src/backend` | `8010` → `8000` | `GET /api/health/` |
| `ai_service` | `./src/ai_models` | `8081` → `8081` | `GET /health` cada 10 s → **exige 200** |
| `frontend` | `./` + `src/frontend/Dockerfile` | `5173` → `80` | `wget --spider /` |
| `db-mysql` | `mysql:8.0` | `3316` → `3306` | solo con `--profile legacy` |

El servicio de base de datos se llama **`db`** (contenedor
`sigctiarural_postgres_db`), no `postgres`. `db-mysql` es residuo pre-Postgres,
apartado bajo el perfil `legacy`: **no arranca** con `docker compose up`.

`frontend` declara `depends_on` de `backend` **y** de `ai_service`, ambos con
`condition: service_healthy`, por lo que **un `/health` distinto de 200 en
`ai_service` impide arrancar el frontend**.

## 2. Contrato de procedencia del artefacto (L-1 / L-2)

`ai_service` publica en `GET /health` —**siempre 200**, las alertas viajan como
campos— y en el envelope de `/api/v3/ai/inference/`:

| Campo | Significado |
|---|---|
| `model_status` | `HISTORICO` \| `CANONICO` \| `NO_DECLARADO` \| `INCONSISTENTE` \| `NO_DISPONIBLE` |
| `model_sha256` | SHA-256 del binario servido (minúsculas) |
| `artifact_id` | `<archivo>@<8 hex>` |
| `class_space` | número de clases del espacio de salida |
| `scientific_scope` | `binary_only` u otro alcance declarado |
| `trace.inference_executed` | si la petición ejecutó realmente el modelo |
| `trace.inference_origin` | `local_container` (corrige `source_mode: "cloud"`, que es factualmente falso) |

**Diagnóstico de despliegue:** si `model_status` es `NO_DECLARADO`, el `.h5` que
se está sirviendo no figura en el registro de procedencia
(`src/ai_models/model_identity.py`). **No es un error de arranque**: el servicio
responde 200 y la UI pinta "PROCEDENCIA NO DECLARADA". Registrar el hash es el
remedio, no reiniciar el contenedor.

## 3. Rutas de la aplicación (aclaración)

- `5173` = frontend dockerizado (referencia estable).
- `5174` = Vite dev server (laboratorio activo de desarrollo).
Referencia canónica: `Documentacion/Arquitectura/FRONTEND_EXECUTION_STRATEGY.md`.

---

# HISTÓRICO (2026-08-21) — contenido original sin modificar


Guía para ejecutar el sistema en desarrollo local y preparar un despliegue a Cloud. Esta guía evita enlaces rotos y se basa en lo que existe hoy en el repositorio.

## Desarrollo Local

### Backend (Django)

```bash
cd src/backend
python -m venv venv
# Linux/Mac
source venv/bin/activate
# Windows
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend (React + Vite)

```bash
cd src/frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
# App disponible en http://localhost:5173
```

### Edge (opcional)

Consulta `docs/EDGE_SETUP.md` para levantar los servicios en BeagleBone (Gateway MQTT, IA TFLite y Sensores).

## Base de Datos

Por defecto, el proyecto puede iniciar con SQLite. Si deseas PostgreSQL:

```ini
# Ejemplo de variables (ajusta en tu entorno)
DB_NAME=sigct_rural_db
DB_USER=sigct_user
DB_PASSWORD=tu-password
DB_HOST=localhost
DB_PORT=5432
```

Habilita credenciales y configuración en `config/settings.ini` o variables de entorno.

## Variables de entorno

Copia `.env.example` desde la raíz y crea `.env` adaptado a tu entorno. Variables recomendadas:

```ini
DEBUG=True
SECRET_KEY=tu-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

## Despliegue Cloud (Plan)

> Esta sección se habilitará cuando se agreguen los manifiestos y scripts de despliegue.

Opciones previstas:

- Render / Railway para el backend Django
- Vercel / Netlify para el frontend Vite
- Nginx como reverse proxy

## Docker (Plan)

> El repositorio actual no incluye `docker-compose.yml`. Cuando se añada, se documentará aquí con servicios para backend, frontend y base de datos.

Ejemplo de comandos (referencia futura):

```bash
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

## CI/CD (Plan)

> Se publicará una guía y workflows cuando se integren pruebas automatizadas y despliegue continuo.