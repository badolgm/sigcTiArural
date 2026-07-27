# PROJECT RECORDS REGISTER

## Fecha

2026-07-15

## Objetivo

Clasificar los registros incluidos en el respaldo archivistico para reconstruccion tecnica, historica y documental de SIGCT-Rural.

## Registro documental y tecnico

| Grupo | Ejemplos incluidos | Clasificacion | Justificacion |
|---|---|---|---|
| Identidad del proyecto | `README.md`, `INDICE_PROYECTO.md` | CRITICO | Explican proposito, alcance y navegacion general del proyecto. |
| Entrega y continuidad | `HANDOFF_TRAE_sigcTiArual.md` | CRITICO | Conserva contexto operativo y transferencia de conocimiento. |
| Auditorias TRAE | `TRAE_INDEPENDENT_REPOSITORY_AUDIT.md`, `TRAE_AI_INTEGRATION_AUDIT.md` | HISTORICO | Registran evidencia y decisiones de auditoria independientes. |
| Documentacion EIARC y base de conocimiento | `docs/eiarc/`, `docs/project_knowledge_base/` | CRITICO | Constituyen la memoria arquitectonica y de gobierno del proyecto. |
| Documentacion adicional del arbol `docs/` | `docs/architecture/`, `docs/uml/`, `docs/reports/`, `docs/database/` | IMPORTANTE | Complementan diseño, diagramas, reportes y referencia tecnica. |
| Codigo fuente backend | `src/backend/` sin entornos virtuales | CRITICO | Contiene la logica principal del sistema y sus pruebas. |
| Codigo fuente frontend | `src/frontend/` | CRITICO | Conserva la interfaz y clientes operativos del sistema. |
| Modelos y servicio IA local | `src/ai_models/` | CRITICO | Permite reconstruir el servicio IA y su estado funcional actual. |
| Codigo embebido | `src/embedded/` | IMPORTANTE | Preserva material vinculado a integracion edge/robotica. |
| Configuracion | `config/`, `docker-compose.yml`, `package.json`, `package-lock.json` | CRITICO | Necesario para reproducir entorno y dependencias declaradas. |
| Automatizacion y utilidades | `scripts/`, `run_local_*`, `check_tools.py`, `test_endpoints.py` | IMPORTANTE | Aportan operacion local, validacion y tareas de soporte. |
| Datos y esquema exportado | `schema_postgresql.sql`, `create_test_data.py`, `import_local_dataset.py` | IMPORTANTE | Documentan el estado del esquema y flujos de preparacion de datos. |
| Preview y material de apoyo | `preview/` | HISTORICO | Conserva evidencia visual y apoyo documental del proyecto. |
| Artefactos temporales excluidos | `venv`, `.venv`, `__pycache__`, `build`, `dist`, `.cache`, `node_modules` | TEMPORAL | Son regenerables y no son fuente de verdad del proyecto. |

## Criterio de clasificacion

- `CRITICO`: indispensable para reconstruir el sistema y su gobierno tecnico.
- `IMPORTANTE`: aporta reproducibilidad, trazabilidad y comprension operativa.
- `HISTORICO`: preserva historia documental, auditorias y evidencia evolutiva.
- `TEMPORAL`: artefactos regenerables o de cache excluidos del archivo principal.
