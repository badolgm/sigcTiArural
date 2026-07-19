# 08_DEVELOPMENT_ROADMAP_2026_2027

Hoja de ruta de desarrollo SIGC&T Rural 2026-2027
Basado en los documentos generados `01_REPOSITORY_AUDIT.md` al `07_ARCHITECT_MASTER_SUMMARY.md`.

## Estado actual

- Rama activa: `feature/refactor-modular-contexts`.
- Repositorio con base técnica sólida y documentada, pero con migración parcial a arquitectura hexagonal.
- Backend Django con V1 legacy, V2 Strangler Fig y V3 hexagonal parcial.
- Frontend React implementado; IA FastAPI presente; Edge diseñado pero no desplegado en el orquestador central.
- PostgreSQL 15 como base de datos principal; servicio MySQL legado presente en Compose.
- Documentación extensa en `docs/`, diagramas auditados y evidencia parcial de arquitectura.

## Estado objetivo

- Arquitectura modular hexagonal consolidada.
- API V3 estable y contractualmente definida.
- Backend con dominio puro y adaptadores claramente separados.
- IA como microservicio operativo y resiliente.
- Edge definido como nodo respetado o integrado bajo una política clara de despliegue.
- Infraestructura reproducible con CI/CD y controles de seguridad.
- Documentación y diagramas oficiales sincronizados con el código.

## Arquitectura objetivo

- Modular Monolith con bounded contexts.
- Docker Compose para servicios Cloud principales; Edge fuera del orquestador o definido explícitamente.
- `core/domain`, `application`, `ports`, `infrastructure/adapters`, `interfaces/web`.
- API V3 como contrato único para frontend, IA y clientes externos.
- PostgreSQL 15 como base de datos definitiva; MySQL legado eliminado o archivado.

---

# FASE 1 — Consolidación de la base técnica

## Épicas
- Estabilizar la referencia de arquitecturas y diagramas oficiales.
- Asegurar que el backend tenga un camino hexadecimal claro.
- Definir contratos API iniciales para V3.

## Entregables
- `docs/diagrams/` oficiales sincronizados y versionados.
- `src/backend/core/` con dominio puro consolidado.
- `src/backend/api/` reducido a adaptadores y controladores.
- Documentación de `DIAGRAMAS_OFICIALES_SIGCTRURAL` en README y MASTERDOC.
- Primer borrador de contratos API V3.

## Dependencias
- Alineación de `docker-compose.yml` con diagramas de despliegue.
- Revisión del código `src/backend/api/views.py` y `src/backend/api/urls.py`.
- Documentos: `05_FINAL_ARCHITECTURE_BASELINE.md`, `06_ARCHITECT_MASTER_SUMMARY.md`.

## Riesgos
- Persistencia de V1/V2 sin plan de retirada claro.
- Diferencias entre `docs/` y la implementación real.

## Prioridades
1. Consolidar diagramas oficiales.
2. Definir y documentar contratos API V3.
3. Reforzar la estructura `core/domain` y adaptadores.

---

# FASE 2 — Estabilización del backend y despliegue

## Épicas
- Limpiar deuda técnica en el backend.
- Estabilizar despliegue y configuración.
- Formalizar la base de datos y migraciones.

## Entregables
- Backend con pruebas unitarias centradas en dominio y adaptadores.
- `docker-compose.yml` revisado sin servicios legados innecesarios.
- `.env.example` y settings documentados.
- `schema_postgresql.sql` alineado con ERD oficial.

## Dependencias
- Revisión de tablas y estructuras en `schema_postgresql.sql`.
- Diagramas `er_schema.mmd`, `class_db_models.mmd`, `package_layers.mmd`.
- Documentos: `03_DOCUMENT_TRUTH_MATRIX.md`, `04_DIAGRAM_AUDIT.md`.

## Riesgos
- Migraciones inconsistentes si el esquema no se aplica correctamente.
- Configuración insegura o incompleta en entornos staging/producción.

## Prioridades
1. Eliminar `db-mysql` o justificar su existencia con evidencia.
2. Asegurar que la BD PostgreSQL sea la fuente única de verdad.
3. Añadir pruebas de integración básicas para el backend.

---

# FASE 3 — Operacionalización de IA y Edge

## Épicas
- Poner en producción el servicio IA de forma robusta.
- Definir el patrón de despliegue Edge vs Cloud.
- Integrar flujos de telemetría y diagnóstico.

## Entregables
- Servicio `ai_service` validado con SLAs y fallback.
- Política de despliegue Edge documentada y validada.
- Flujo de ingestión de datos sincronizado: sensores → API → DB.
- Diagrama `docs/eiarc/03_DIAGRAMS/TELEMETRY_IOT_ARCHITECTURE_V8.mmd` actualizado (sustituye a `docs/diagrams/sequence_data_ingest.mmd`, `architecture_edge.svg` — migración FASE 5C).

## Dependencias
- Código `src/ai_models/fastapi_app.py` y adaptadores IA.
- `src/embedded/` y `docs/edge/`.
- Documentos: `02_SIGCTRURAL_CANONICAL_MODEL.md`, `07_ARCHITECT_MASTER_SUMMARY.md`.

## Riesgos
- Edge incompleto o no reproducible.
- IA no resiliente ante fallos de red o de modelo.

## Prioridades
1. Definir claramente si Edge se despliega dentro de Compose o como nodo externo.
2. Validar conectividad de IA con PostgreSQL y el backend.
3. Actualizar diagramas de ingestión y despliegue.

---

# FASE 4 — Seguridad, QA y documentación avanzada

## Épicas
- Asegurar calidad y seguridad del sistema.
- Completar documentación ejecutable.
- Preparar el sistema para sustentación y evaluaciones.

## Entregables
- Pipeline CI/CD básico implementado.
- Documentación de seguridad y autenticación.
- Pruebas automatizadas y calidad de código.
- `DIAGRAMAS_OFICIALES_SIGCTRURAL` publicados con versión.

## Dependencias
- Documentos: `06_EVIDENCE_STATUS_MATRIX.md`, `07_ARCHITECT_MASTER_SUMMARY.md`.
- Código: `src/backend/sigct_backend/settings.py`, pruebas `src/backend/tests/`.
- Diagrama de seguridad y policies (por generar).

## Riesgos
- Sin CI/CD, los cambios no se integran de forma confiable.
- La seguridad declarada puede permanecer sin implementación práctica.

## Prioridades
1. Implementar pipeline de build/test/lint.
2. Añadir controles de seguridad mínimos en el backend.
3. Publicar documentación de despliegue y runbooks.

---

# FASE 5 — Producción estable y entrega

## Épicas
- Completar la transición a una versión productiva estable.
- Alinear el sistema con sustentación ADSO y Guías.
- Entregar un proyecto mantenible y documentado.

## Entregables
- Versión estable desplegable de SIGC&T Rural.
- Documentación consolidada para README, MASTERDOC, SENA, Guías 10 y 11.
- Evaluación de riesgos reducida a niveles operables.

## Dependencias
- Entregables previos de fases 1-4.
- Validaciones de usuario y pruebas de aceptación.

## Riesgos
- Persistencia de deuda técnica no eliminada.
- Faltas de sincronización final entre docs y código.

## Prioridades
1. Validar producción con pruebas end-to-end.
2. Publicar resumen ejecutivo y diagramas oficiales en READMEs.
3. Cerrar roadmap con fecha y entregables claros.

---

## Resumen final

Este roadmap orienta la evolución de SIGC&T Rural desde su estado actual hasta una versión productiva estable en 2026-2027. El foco principal es consolidar la arquitectura hexagonal, alinear diagramas y documentación con la implementación real, y establecer procesos de calidad y despliegue. Prioriza la eliminación controlada de legado, la definición de contratos API y la operacionalización de IA/Edge.

Documento generado únicamente a partir de los archivos 01-07 y la auditoría del repositorio. No se han ejecutado ni modificado otras partes del proyecto.
