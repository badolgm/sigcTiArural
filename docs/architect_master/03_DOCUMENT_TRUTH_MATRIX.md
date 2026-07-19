# 03_DOCUMENT_TRUTH_MATRIX

Matriz de verdad — fuente oficial por aspecto del sistema.
Basado exclusivamente en: `01_REPOSITORY_AUDIT.md`, `02_SIGCTRURAL_CANONICAL_MODEL.md`, `README.md`, `docs/MASTERDOC.md`, `docs/PLAN_MAESTRO.md`, `docs/HEXAGONAL_REFACTOR_PLAN.md`.

Formato por categoría:
- Documento principal
- Documento secundario
- Riesgo de inconsistencia (Alto/Medio/Bajo) — breve justificación
- Acción recomendada (concisa)

---

Arquitectura
- Documento principal: docs/MASTERDOC.md
- Documento secundario: docs/HEXAGONAL_REFACTOR_PLAN.md
- Riesgo de inconsistencia: Medio — el `MASTERDOC` describe estado verificado y objetivo, pero el código muestra coexistencia de V1/V2/V3 y fallback silencioso.
- Acción recomendada: Alinear `MASTERDOC.md` con el código actual; añadir una sección AS-IS/TO-BE clara y checklist de verificación por endpoint (v1/v2/v3).

Infraestructura
- Documento principal: README.md (secciones de despliegue y docker-compose referencia)
- Documento secundario: docs/PLAN_MAESTRO.md
- Riesgo de inconsistencia: Medio — `docker-compose.yml` contiene servicios legados (MySQL) y la documentación menciona Edge no desplegado.
- Acción recomendada: Consolidar la política de infraestructura en `docs/DEPLOYMENT.md` (o sección dedicada en `MASTERDOC.md`), documentar servicios activos y justificar o eliminar legados.

IA
- Documento principal: docs/MASTERDOC.md
- Documento secundario: src/ai_models/fastapi_app.py (código) and docs/AI_PIPELINE.md
- Riesgo de inconsistencia: Medio — documentación describe IA Cloud+Edge, pero el código IA contiene dependencias y conexiones que pueden no ser reproducibles en todos los entornos.
- Acción recomendada: Publicar contrato de API (endpoints, formatos, timeouts) y definir SLAs/fallbacks; separar ciclo de despliegue del servicio IA.

IoT
- Documento principal: README.md (sección Edge) / docs/EDGE_SETUP.md
- Documento secundario: docs/MASTERDOC.md
- Riesgo de inconsistencia: Alto — la documentación describe Edge y MQTT, pero `docker-compose.yml` no incluye broker ni configuración de Edge.
- Acción recomendada: Decidir patrón de despliegue Edge (fuera del Compose o integrado); actualizar `README` y `MASTERDOC` para reflejar la decisión y anotar pruebas de integración requeridas.

Base de datos
- Documento principal: schema_postgresql.sql (esquema) and docs/MASTERDOC.md
- Documento secundario: docker-compose.yml / README.md
- Riesgo de inconsistencia: Bajo-Medio — el esquema está en el repo; la orquestación expone Postgres, pero existe un servicio MySQL legado.
- Acción recomendada: Establecer `schema_postgresql.sql` y `docs/MASTERDOC.md` como fuente de verdad para el modelo de datos; eliminar o documentar MySQL legado en Compose.

Frontend
- Documento principal: src/frontend/package.json y README.md (secciones UI)
- Documento secundario: docs/MASTERDOC.md
- Riesgo de inconsistencia: Bajo — el frontend está presente con configuración y dependencias; documentación describe su rol.
- Acción recomendada: Mantener `src/frontend/` como fuente de verdad; añadir en `MASTERDOC` la lista de endpoints de API esperados (v3) y contratos de UI.

Backend
- Documento principal: src/backend/ (código) and docs/MASTERDOC.md
- Documento secundario: docs/HEXAGONAL_REFACTOR_PLAN.md
- Riesgo de inconsistencia: Alto — coexistencia de V1/V2/V3 y fallbacks condicionales crean riesgos de comportamiento divergente.
- Acción recomendada: Marcar `src/backend/` (con `core/` y `api/`) como fuente de verdad del comportamiento; crear un plan de retirada de legacy en `HEXAGONAL_REFACTOR_PLAN.md` con hitos verificables.

Despliegue
- Documento principal: docs/PLAN_MAESTRO.md
- Documento secundario: README.md / docker-compose.yml
- Riesgo de inconsistencia: Medio — Plan maestro describe fases, pero el `docker-compose.yml` contiene artefactos legados.
- Acción recomendada: Publicar un playbook de despliegue (docs/DEPLOYMENT.md) sincronizado con `PLAN_MAESTRO.md` y `docker-compose.yml`; agregar pasos verificables y variables de entorno obligatorias.

Seguridad
- Documento principal: docs/MASTERDOC.md (secciones de seguridad) / README.md
- Documento secundario: src/backend/sigct_backend/settings.py (código de configuración)
- Riesgo de inconsistencia: Medio-Alto — la documentación menciona JWT, HTTPS y CORS, pero no hay verificación en código ni políticas de producción explícitas.
- Acción recomendada: Definir controles de seguridad mínimos requeridos (JWT config, CORS, TLS, secrets management) y validar implementaciones en `settings.py` y Docker files.

Refactorización
- Documento principal: docs/HEXAGONAL_REFACTOR_PLAN.md
- Documento secundario: docs/MASTERDOC.md
- Riesgo de inconsistencia: Bajo-Medio — el plan de refactorización es detallado, pero el código está en estado intermedio; la rama `feature/refactor-modular-contexts` es la referencia.
- Acción recomendada: Usar `docs/HEXAGONAL_REFACTOR_PLAN.md` como contrato técnico; publicar checkpoints y criterios de aceptación vinculados a PRs en la rama de trabajo.

---

Resumen de acciones transversales prioritarias:
- Centralizar la fuente de verdad por categoría (MASTERDOC/HEXAGONAL/PLAN) y referenciarla desde `README.md`.
- Eliminar o documentar servicios legados (MySQL) en `docker-compose.yml`.
- Publicar contratos API (v3) y playbook de despliegue; adicionar tests de integración para verificar documentación vs. código.

Documento generado a partir de los archivos solicitados y `01_REPOSITORY_AUDIT.md`/`02_SIGCTRURAL_CANONICAL_MODEL.md`.
