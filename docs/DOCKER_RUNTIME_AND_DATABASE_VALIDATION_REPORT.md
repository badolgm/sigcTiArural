# DOCKER_RUNTIME_AND_DATABASE_VALIDATION_REPORT

**Misión:** `DOCKER_RUNTIME_AND_DATABASE_VALIDATION`
**Fecha:** 2026-10-12 (America/Bogota)
**Alcance:** validación de runtime real + reconciliación de la BD viva contra la arquitectura canónica. **Solo lectura/validación.**
**Sin cambios de código · sin migraciones generadas · sin commits · sin push.**

---

## A. Estado Docker

| Ítem | Resultado |
| :--- | :--- |
| Docker Desktop / Engine | **UP** — Server `29.7.2` (Docker Desktop `docker-desktop`) |
| `docker compose` | v5.5.1 (disponible) |
| Contenedores del proyecto `sigctiarural` (compose `db`/`db-mysql`) | `sigctiarural_postgres_db` **Up (healthy)** · `sigctiarural_mysql_db` **Up (healthy)** |
| Backend / AI / Frontend (compose) | **Detenidos** — `sigctiarural_backend` (Exited 0, 3d) · `sigctiarural_ai_service` (Exited 137, 3d) · `sigctiarural_frontend` (Exited 0, 3d) |
| Contenedores ajenos al proyecto | Presentes (ven/tna/eiarc/servsoft) — **no afectan** la validación |

---

## A.1. Estado PostgreSQL (B)

- **Contenedor:** `sigctiarural_postgres_db` — imagen `postgres:15`, **Up (healthy)**, `0.0.0.0:5544->5432/tcp`.
- **Motor:** `PostgreSQL 15.19 (Debian 15.19-1.pgdg13+2)`, x86_64.
- **Base / usuario:** `sigctiarural_db` / `sigct_user` (coincide con `POSTGRES_DB`/`POSTGRES_USER` del contenedor y con `.env`).
- **Alcance:** el PostgreSQL vivo es el runtime **canónico** del proyecto (`docker-compose.yml` servicio `db`).

---

## B. Migraciones aplicadas (C)

`django_migrations` (`app=api`):

| Migración | Aplicada | Fecha |
| :--- | :--- | :--- |
| `api.0001_initial` | ✅ | 2026-07-30 23:34:49 |
| `api.0002_robot_robotcommand_robottelemetry` | ✅ | 2026-07-30 23:34:49 |

- `python manage.py showmigrations api` → ambas `[X]` (ninguna pendiente).
- `python manage.py makemigrations --check --dry-run` → **"No changes detected"** ⇒ `models.py` **no** tiene cambios sin migrar.
- No existe `0003` ni migración «fake».

---

## C. Tablas reales (D)

14 tablas en `public`: **4 de dominio `api_*`** + 10 built-in de Django (`auth_*`, `django_*`). **Sin tablas legacy/espurias** (no hay `api_lab`, `api_user`, `api_course`, etc.).

| Tabla | Columnas reales | Conteo filas |
| :--- | :--- | :--- |
| `api_sensorreading` | id, sensor_id, temperature, humidity, timestamp | 0 |
| `api_robot` | robot_id(PK), name, type, status, created_at | 0 |
| `api_robottelemetry` | id, battery_level, status_mode, position_x/y/z, velocity_linear, timestamp, robot_id(FK) | 0 |
| `api_robotcommand` | id, command_type, payload(jsonb), priority, status, created_at, executed_at, result_log, robot_id(FK) | 0 |

- FKs verificadas: `api_robotcommand.robot_id → api_robot(robot_id)` y `api_robottelemetry.robot_id → api_robot(robot_id)` (DEFERRABLE INITIALLY DEFERRED).
- Tipos y longitudes coinciden con `models.py`: `varchar(50/100/20)`, `double precision` (`FloatField`), `jsonb` (`JSONField`), `timestamptz`.
- Las 4 tablas están **vacías** (0 filas) — consistente con un despliegue sin ingesta.

---

## D. Estado de 0001 / 0002 (6,7)

- **0001** = `SensorReading` (id, sensor_id, temperature, humidity, timestamp). Aplicada; tabla `api_sensorreading` presente y conforme.
- **0002** = `Robot`, `RobotCommand`, `RobotTelemetry`. Aplicada; las 3 tablas presentes y conformes (incl. FKs a `api_robot`).

---

## E. Variables de entorno (8,9)

- `.env`: `DB_NAME=sigctiarural_db`, `DB_USER=sigct_user`, `DB_PASSWORD=***redactado***`, `DB_HOST=localhost`, `DB_PORT=5544`, `POSTGRES_PORT=5544`.
- **`DATABASE_URL` NO está definida** en `.env`, `.env.example` ni `docker-compose.yml`.
- Consecuencia verificada en `settings.py`: la rama `os.environ.get('DATABASE_URL')` **no se ejecuta** ⇒ el proyecto usa la **rama manual** (`DB_NAME/DB_USER/DB_PASSWORD/DB_HOST/DB_PORT`).
- Dentro de la red Docker el backend usa `DB_HOST=db` y el puerto interno `5432` (default de `settings.py`), correcto respecto a `5544:5432` del host. **Observación**, no divergencia de esquema.

---

## F. Divergencias (E)

**Ninguna divergencia de esquema.**
Reconciliación tripartita `models.py` ↔ `migrations/` ↔ `er_schema_v8.mmd` contra la BD viva: **coinciden 1:1** (entidades, columnas, tipos, longitudes, nullabilidad, PK/FK, defaults).

Observaciones (no divergencias):
1. Backend/AI/Frontend **detenidos**; la reconciliación de esquema no los requiere (validada con `manage.py` sobre la BD viva).
- `db-mysql` (residuo pre-PostgreSQL) sigue **corriendo**; documentado como residuo, no usado por Django.
- `DATABASE_URL` ausente (rama manual activa).

---

## F. Cierre definitivo de C-2 (F)

**C-2 · ERD reconciliado contra BD viva — CERRADO (definitivo).**
El ERD canónico `docs/database/er_schema_v8.mmd` queda **reconciliado** contra el PostgreSQL vivo (`sigctiarural_postgres_db`, 15.19): tablas, columnas, tipos, longitudes, constraints y migraciones coinciden 1:1 con `models.py` + `migrations/`. Se levanta la condición de bloqueo por entorno (Docker/PostgreSQL ahora disponibles y verificados).

---

## G. Dictamen (G)

```
DATABASE_RECONCILED  ✅
```

**Justificación:** la base de datos viva coincide **exactamente** con la arquitectura canónica de persistencia (`models.py` + `migrations/` + `er_schema_v8.mmd`); migraciones `0001` y `0002` aplicadas, sin migraciones pendientes ni cambios de modelo detectados, sin tablas espurias. Divergencias: **ninguna**.

> Observaciones no bloqueantes: backend/ai/frontend detenidos; MySQL residuo arriba; `DATABASE_URL` sin definir (rama manual de `settings.py` en uso).

---

**Sin commits · sin push · sin modificar código · sin generar migraciones.**
*Bernardo Adolfo Gómez Montoya — 2026*
