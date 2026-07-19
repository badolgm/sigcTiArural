# DEPLOYMENT FINAL

## 1. Propósito

Documentar la forma final de despliegue y arranque de SIGC&T Rural para revisión académica, demostración local y entrega técnica ADSO, usando el estado real del repositorio como fuente.

## 2. Alcance operativo cubierto

Este documento cubre:

- despliegue local con Docker Compose
- estructura de servicios principal
- puertos y variables de entorno
- validaciones mínimas de arranque
- continuidad operativa
- relación entre entorno cloud/local y línea edge documentada

## 3. Arquitectura operativa de despliegue

La topología local definida actualmente en `docker-compose.yml` incluye cinco servicios:

1. `db`  
   PostgreSQL 15 como base de datos principal.
2. `db-mysql`  
   Servicio legado documentado como residual de migración.
3. `backend`  
   Aplicación Django.
4. `ai_service`  
   Microservicio FastAPI de inferencia.
5. `frontend`  
   Aplicación web publicada desde el contenedor de frontend.

## 4. Puertos operativos

| Servicio | Puerto contenedor | Puerto host por defecto |
|---|---:|---:|
| PostgreSQL | 5432 | 5544 |
| MySQL legado | 3306 | 3316 |
| Backend Django | 8000 | 8010 |
| AI Service | 8081 | 8081 |
| Frontend | 80 | 5173 |

## 5. Variables de entorno utilizadas en Compose

El archivo `docker-compose.yml` utiliza las siguientes variables:

- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `POSTGRES_PORT`
- `BACKEND_PORT`
- `AI_PORT`
- `FRONTEND_PORT`

## 6. Requisitos previos

### Software

- Docker Desktop o motor Docker compatible
- Docker Compose

### Artefactos del repositorio

- `docker-compose.yml`
- `src/backend/`
- `src/frontend/`
- `src/ai_models/`

### Datos y modelo

- Base de datos PostgreSQL inicializable por migraciones Django
- Modelo IA ubicado en `src/ai_models/production_models/`

## 7. Procedimiento de arranque local

Ubicarse en la raíz del proyecto y ejecutar:

```bash
docker compose up -d db backend ai_service frontend
```

Si se requiere levantar todos los servicios definidos, incluyendo el legado MySQL:

```bash
docker compose up -d
```

## 8. Validación mínima posterior al arranque

### 8.1 Backend

Validar respuesta del backend:

```bash
curl http://localhost:8010/api/telemetry/history/
```

### 8.2 AI Service

Validar salud del servicio de IA:

```bash
curl http://localhost:8081/health
```

### 8.3 Frontend

Validar disponibilidad web:

```text
http://localhost:5173
```

## 9. Endpoints mínimos de validación para entrega

### Backend

- `GET /api/telemetry/history/`
- `GET /api/v2/telemetry/history/`
- `GET /api/v3/telemetry/history/`
- `GET /api/v2/ai/crop-advice/`
- `GET /api/v3/ai/crop-advice/`
- `POST /api/v3/ai/inference/`

### AI Service

- `GET /health`
- `POST /infer`

## 10. Procedimiento de continuidad recomendado

El proyecto ya tiene una ruta operativa formal para continuidad:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\continuity_check.ps1
```

Validaciones complementarias:

```powershell
.\scripts\verify_refactor.ps1
```

```bash
./scripts/verify_refactor.sh
```

## 11. Relación con el componente edge

El despliegue local de `docker-compose.yml` no materializa el componente edge dentro de Compose. La línea edge está documentada aparte en `docs/EDGE_SETUP.md` y contempla:

- BBB-01 Gateway MQTT
- BBB-02 IA Edge con TensorFlow Lite
- BBB-03 Sensores

Por tanto, para la entrega final, el despliegue debe entenderse en dos capas:

1. **capa local reproducible en Docker:** backend, IA, frontend y base de datos
2. **capa edge documentada:** hardware y flujo BBB/MQTT/TFLite fuera de Compose

## 12. Servicios y artefactos asociados por capa

| Capa | Artefactos principales |
|---|---|
| Backend | `src/backend/`, `docker-compose.yml` |
| Frontend | `src/frontend/`, `docker-compose.yml` |
| IA | `src/ai_models/`, `docker-compose.yml` |
| Datos | PostgreSQL + migraciones Django + `schema_postgresql.sql` |
| Edge | `docs/EDGE_SETUP.md`, `src/embedded/` |

## 13. Validación funcional sugerida para demostración

1. levantar servicios con Docker
2. validar `/health` del AI Service
3. validar historial de telemetría
4. abrir frontend
5. demostrar dashboard
6. demostrar IA desde interfaz o vía `/infer`

## 14. Riesgos operativos ya documentados

Tomados de la base documental existente:

- coexistencia V1, V2 y V3 en backend
- contrato API V3 todavía sin OpenAPI formal
- despliegue edge no reproducible dentro de Compose
- existencia de `db-mysql` como servicio legado

Estos riesgos ya forman parte del estado técnico del repositorio y no invalidan este documento de despliegue final para entrega académica.

## 15. Fuentes utilizadas

- `docker-compose.yml`
- `docs/DEPLOYMENT.md`
- `docs/CONTINUITY_RUNBOOK.md`
- `docs/EDGE_SETUP.md`
- `docs/MASTERDOC.md`
- `docs/PLAN_MAESTRO.md`
- `src/backend/api/urls.py`
- `src/backend/api/views.py`
- `src/ai_models/fastapi_app.py`

## 16. Declaración final

SIGC&T Rural dispone de una ruta de despliegue local clara basada en Docker Compose para backend, frontend, base de datos e IA, complementada por una línea edge documentada para BeagleBone Black. Este documento deja materializada la forma de arranque y validación que debe acompañar la entrega final ADSO.
