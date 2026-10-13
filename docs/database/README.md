# 🗄️ Gestión de Base de Datos — SIGC&T Rural

Este documento detalla el esquema de datos y la evolución de la persistencia en el proyecto.

## 1. Stack de Datos
- **Motor:** PostgreSQL 15.16 (Docker)
- **ORM:** Django ORM
- **Driver:** `psycopg2-binary`

## 2. Diagrama Entidad-Relación (ERD)

El ERD canónico del proyecto vive en [`er_schema_v8.mmd`](er_schema_v8.mmd) — generado y verificado campo por campo directamente contra `src/backend/api/models.py` y `src/backend/api/migrations/` (Fase 2B de la consolidación arquitectónica V8).

Este README no reproduce el diagrama inline para evitar que existan dos representaciones del mismo esquema divergiendo con el tiempo — `er_schema_v8.mmd` es la única fuente de verdad del esquema de datos. Entidades cubiertas: `Robot`, `RobotTelemetry`, `RobotCommand`, `SensorReading`.

## 3. Historia de Migración
- **Enero 2026**: Migración exitosa de MySQL 8.0 a PostgreSQL 15.
- **Motivo**: Mejor soporte para tipos de datos complejos (JSONB), mayor integridad referencial y compatibilidad superior con Django.
- **Procedimiento**: Saneamiento de `requirements.txt` y reconstrucción de imágenes Docker con soporte nativo para `libpq-dev`.

## 4. Adaptador Hexagonal de Persistencia

El backend coexiste actualmente en dos capas de persistencia relevantes (ver `docs/MASTERDOC.md` §1.1):

- **V2 (Strangler Fig, en proceso de deprecación):** `DjangoRepository`, ubicado en `src/backend/api/logic/adapters/persistence.py`, instrumentado con el decorador `@deprecated_legacy`.
- **V3 (Hexagonal real):** `infrastructure/persistence/django/` implementa los puertos definidos en `core/ports/repositories/`, con inyección de dependencias vía `infrastructure/config/dependencies.py`. Es la capa objetivo actual, expuesta en `/api/v3/*`.

En ambas capas el dominio no habla directamente con el ORM — la diferencia es que V3 lo logra sin ninguna dependencia de Django en el dominio, mientras V2 es una capa de transición.

## 5. Artefactos obsoletos (F1 — consolidación arquitectónica 2026-10)

Los siguientes artefactos se conservan por trazabilidad histórica (regla: *nada desaparece*), pero **NO deben usarse como referencia**. Están marcados con una nota `OBSOLETO` en su cabecera cuando el formato lo permite, y su estado canónico se registra en `docs/CANONICAL_DIAGRAM_MANIFEST.md`.

| Artefacto | Motivo | Sustituto vigente |
| :--- | :--- | :--- |
| `er_schema.svg` | Modela entidades retiradas (USER/PROJECT/TELEMETRY/COURSE) | `er_schema_v8.mmd` |
| `class_db_models.svg` | Modela User/Project/Telemetry/ImageSample, ajenos al esquema | `er_schema_v8.mmd` |
| `ModelEER_Sigct-rural.mwb` | MySQL Workbench; el stack migró a PostgreSQL 15 | `er_schema_v8.mmd` |
| `docs/uml/class_backend.svg` | Modela User/Project/Telemetry/ImageSample/Course (retirados) | `er_schema_v8.mmd` |

> Fuente de verdad del esquema: `er_schema_v8.mmd` derivado de `src/backend/api/models.py` + `src/backend/api/migrations/` (ver `docs/MASTERDOC.md` §2.9). `schema_postgresql.sql` es un volcado histórico, no la fuente de verdad.

---
*Bernardo Adolfo Gómez Montoya — 2026*
