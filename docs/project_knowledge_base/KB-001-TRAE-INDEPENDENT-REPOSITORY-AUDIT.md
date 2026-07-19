# KB-001 - TRAE Independent Repository Audit

## Fecha

2026-07-12

## Objetivo

Registrar formalmente la auditoría estática integral del repositorio para reconstruir el estado real del sistema, priorizando el código sobre la documentación y clasificando implementación, planeación, obsolescencia y zonas no verificables.

## Fuente

- `TRAE_INDEPENDENT_REPOSITORY_AUDIT.md`

## Hallazgos

### Estado general

- El repositorio es un monorepo híbrido con backend Django/DRF, frontend React/Vite, microservicio FastAPI de IA y área `embedded`.
- El estado real es el de una plataforma ambiciosa pero incompleta, con mezcla de componentes funcionales, mocks, prototipos y documentación aspiracional.
- La carpeta `src/embedded` existe, pero sus artefactos principales están vacíos.
- `config/settings.ini` existe, pero no opera como fuente real de configuración.

### Arquitectura

- La arquitectura real es un monolito Django en transición, con capa legacy acoplada al ORM y una refactorización hexagonal parcial.
- Coexisten rutas y servicios legacy junto a capas `core` e `infrastructure`.
- La arquitectura documentada como plenamente hexagonal no coincide con el estado efectivo del código.

### Backend

- Existen modelos y endpoints reales para sensores, robots, telemetría y comandos.
- No existe autenticación JWT real, ni endpoints `/api/auth/*`, ni WebSockets operativos.
- La seguridad observada es débil para un entorno productivo: `DEBUG=True`, CORS abierto y `AllowAny` en recursos críticos.

### Frontend

- El frontend está ampliamente desarrollado y contiene laboratorios, dashboard, documentación embebida e interfaz de IA.
- Varias experiencias se apoyan en simulación, fallback o consumo de servicios externos.
- `AIPredictiva.jsx` está desalineado con el despliegue del servicio IA y con su semántica de salida.

### Inteligencia Artificial

- Existe un microservicio FastAPI funcional con `/health`, `/infer`, `/assist`, `/events` y `/analyze-circuit`.
- No existe `/suggest`, aunque otras capas del sistema lo suponen.
- El modelo y el frontend no comparten una semántica común: el servicio devuelve `class_N`, el metadato declara `enferma/sana` y el frontend espera nombres agrícolas reales.

### IoT y Edge

- La capa edge está ampliamente documentada, pero no implementada en código verificable.
- El ecosistema BBB/MQTT/TFLite aparece como intención o guía de despliegue, no como realidad operativa del repositorio.

### Infraestructura y base de datos

- `docker-compose.yml` existe y define `db`, `db-mysql`, `backend`, `ai_service` y `frontend`.
- El backend sigue arrancando con `runserver`, por lo que la infraestructura no está endurecida para producción.
- Existe drift entre `schema_postgresql.sql`, modelos ORM y migraciones.
- Se detectaron defaults inseguros en secretos/configuración; fueron reportados sin exponer valores completos.

### Documentación

- La documentación es extensa, pero una porción relevante está desactualizada respecto al código.
- Los documentos más confiables son los que reconocen transición, deuda técnica y refactor parcial.

## Conclusiones

- El estado real del sistema es: **monolito Django con refactorización hexagonal parcial + frontend React con fuerte componente demo/simulación + microservicio FastAPI de IA + edge documentado pero no implementado**.
- Los componentes más adelantados son backend, frontend e IA cloud.
- Los componentes más rezagados son autenticación real, edge operativo, endurecimiento de infraestructura y alineación documental.
- El principal riesgo transversal del repositorio es la desalineación entre contratos documentados, comportamiento real y expectativas entre módulos.

## Impacto para SIGCT-Rural

- SIGCT-Rural dispone de una base funcional para backend, frontend e IA cloud, pero no de una plataforma homogénea ni lista para operación confiable.
- La ausencia de auth real, la simulación en frontend y la falta de edge verificable afectan la credibilidad operativa del producto.
- La divergencia entre documentación y código puede inducir decisiones de despliegue o arquitectura equivocadas.

## Impacto para EIARC

- EIARC encuentra aquí un caso claro de necesidad de gobierno arquitectónico, especialmente en contratos, taxonomías y trazabilidad entre capas.
- El repositorio demuestra que sin una fuente de verdad compartida, distintas piezas pueden “existir” técnicamente y aun así no comportarse como un sistema coherente.
- Este hallazgo sustenta la necesidad de un modelo canónico para IA, contratos semánticos versionados y una estrategia multi-modelo gobernada centralmente.
