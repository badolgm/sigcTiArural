# 04_DIAGRAM_AUDIT

Auditoría estática de la documentación gráfica del proyecto SIGC&T Rural.
Fuente: `01_REPOSITORY_AUDIT.md`, `02_SIGCTRURAL_CANONICAL_MODEL.md`, `03_DOCUMENT_TRUTH_MATRIX.md`, y diagramas en `docs/diagrams/`, `docs/uml/`, `docs/database/`.

Formato por diagrama:
- Nombre
- Ubicación
- Tipo (C4 / UML / ER / Sequence / Other)
- Propósito (según nombre y contexto documental)
- Estado (ACTUALIZADO / PARCIAL / OBSOLETO)
- Consistencia con el modelo canónico (Sí / Parcial / No) + breve justificación

---

1) architecture.mmd
- Ubicación: docs/diagrams/architecture.mmd
- Tipo: C4 / Diagram (Mermaid)
- Propósito: Vista de arquitectura general (cloud + edge, contenedores y relaciones).
- Estado: ACTUALIZADO
- Consistencia: Sí — coincide con la visión híbrida Cloud/Edge documentada en `MASTERDOC.md` y `README.md`.

2) c4_context.mmd
- Ubicación: docs/diagrams/c4_context.mmd
- Tipo: C4 (Mermaid)
- Propósito: Vista de contexto (actores externos y límites del sistema).
- Estado: ACTUALIZADO
- Consistencia: Sí — refleja los actores (agricultor, estudiante, administrador) y fronteras descritas en el modelo canónico.

3) c4_containers.mmd / c4_containers.svg
- Ubicación: docs/diagrams/c4_containers.mmd
- Tipo: C4 - Contenedores
- Propósito: Mostrar servicios: frontend, backend, ai_service, db, edge gateways.
- Estado: PARCIAL
- Consistencia: Parcial — el diagrama incluye nodos Edge y servicios (coincide conceptualmente), pero el despliegue real en `docker-compose.yml` no incluye componentes MQTT/Edge; por tanto la implementación difiere del diagrama en la parte Edge.

4) c4_components.mmd / c4_components.svg
- Ubicación: docs/diagrams/c4_components.mmd
- Tipo: C4 - Componentes
- Propósito: Descomposición del backend en componentes principales (API, AI adapter, persistence, domain/core).
- Estado: ACTUALIZADO
- Consistencia: Sí — corresponde al objetivo de migración hexagonal y a la estructura `core/` + `infrastructure/` detectada en el código.

5) c4_deployment.mmd / c4_deployment.svg
- Ubicación: docs/diagrams/c4_deployment.mmd
- Tipo: C4 - Deployment
- Propósito: Describir despliegue Cloud vs Edge y contenedores.
- Estado: PARCIAL
- Consistencia: Parcial — refleja la intención de despliegue; sin embargo `docker-compose.yml` actual contiene artefactos legados (MySQL) y no orquesta nodos Edge, creando una brecha con el diagrama.

6) architecture_edge.svg
- Ubicación: docs/diagrams/architecture_edge.svg
- Tipo: Architecture / Edge diagram (SVG)
- Propósito: Visualizar el clúster BeagleBone Black y flujo Edge-to-Cloud.
- Estado: PARCIAL
- Consistencia: Parcial — la documentación describe Edge, y el diagrama lo muestra; no obstante, Edge no está materializado en el `docker-compose.yml`, por lo que existe una diferencia AS-IS vs TO-BE.

7) deployment_cloud_edge.svg
- Ubicación: docs/diagrams/deployment_cloud_edge.svg
- Tipo: Deployment diagram (SVG)
- Propósito: Mostrar despliegue cloud/edge (similar a C4 deployment).
- Estado: PARCIAL
- Consistencia: Parcial — coincide conceptualmente pero difiere en artefactos presentes en Compose.

8) banner.svg
- Ubicación: docs/diagrams/banner.svg
- Tipo: Imagen / branding
- Propósito: Banner gráfico del proyecto.
- Estado: ACTUALIZADO
- Consistencia: Sí — no aplica a arquitectura funcional.

9) class_backend.mmd / class_backend.svg
- Ubicación: docs/diagrams/class_backend.svg and docs/uml/class_backend.mmd / .svg
- Tipo: UML - Class diagram
- Propósito: Mostrar clases y estructura del backend (modelos, servicios).
- Estado: ACTUALIZADO
- Consistencia: Sí — complementa `schema_postgresql.sql` y la estructura de `src/backend/`.

10) class_db_models.mmd / class_db_models.svg
- Ubicación: docs/diagrams/class_db_models.svg and docs/database/class_db_models.mmd / .svg
- Tipo: UML / ER (class / data model)
- Propósito: Representación del modelo de datos y entidades.
- Estado: ACTUALIZADO
- Consistencia: Sí — consistente con `schema_postgresql.sql` y tablas detectadas (`api_sensorreading`, auth tables).

11) er_schema.mmd / er_schema.svg
- Ubicación: docs/diagrams/er_schema.svg and docs/database/er_schema.mmd / .svg
- Tipo: ER Diagram
- Propósito: Diagrama entidad-relación de la base de datos.
- Estado: ACTUALIZADO
- Consistencia: Sí — mapea las tablas encontradas en `schema_postgresql.sql`.

12) class_lab_catalog.mmd / class_lab_catalog.svg
- Ubicación: docs/diagrams/class_lab_catalog.mmd
- Tipo: UML - Class / catalog
- Propósito: Inventario y estructura de componentes de laboratorios.
- Estado: ACTUALIZADO
- Consistencia: Sí — apoya la sección de labs en el modelo canónico.

13) component_system.svg
- Ubicación: docs/diagrams/component_system.svg
- Tipo: Component diagram
- Propósito: Mostrar componentes de alto nivel y relaciones.
- Estado: ACTUALIZADO
- Consistencia: Sí — corresponde a la descomposición propuesta en el canónico.

14) package_layers.svg
- Ubicación: docs/diagrams/package_layers.svg and docs/uml/package_layers.mmd / .svg
- Tipo: Package / Layer diagram
- Propósito: Mostrar capas (domain, ports, adapters, infra).
- Estado: ACTUALIZADO
- Consistencia: Sí — alinea con la arquitectura hexagonal objetivo.

15) sequence_navigation.mmd / sequence_navigation.svg
- Ubicación: docs/diagrams/sequence_navigation.mmd
- Tipo: Sequence diagram
- Propósito: Flujo de navegación / user interactions
- Estado: ACTUALIZADO
- Consistencia: Sí — soporta la UX y flujos descritos en frontend y backend.

16) sequence_data_ingest.svg and docs/uml/sequence_data_ingest.mmd
- Ubicación: docs/diagrams/sequence_data_ingest.svg and docs/uml/sequence_data_ingest.mmd
- Tipo: Sequence diagram (data ingest)
- Propósito: Mostrar flujo de ingestión de datos desde sensores hasta persistencia e IA.
- Estado: ACTUALIZADO
- Consistencia: Parcial — el diagrama muestra ingestión Edge->Cloud, pero el orquestador actual no contiene broker MQTT; verificar implementación de ingestión real.

17) sequence_user_auth.svg / sequence_user_auth.mmd
- Ubicación: docs/diagrams/sequence_user_auth.svg and docs/uml/sequence_user_auth.mmd
- Tipo: Sequence diagram (authentication)
- Propósito: Flujo de autenticación / JWT
- Estado: PARCIAL
- Consistencia: Parcial — la documentación declara JWT como método de auth, pero la configuración y alcance en `settings.py` no fueron verificados como plenamente implementados.

18) state_alerting.svg / state_alerting.mmd
- Ubicación: docs/diagrams/state_alerting.svg and docs/uml/state_alerting.mmd
- Tipo: Sequence / Activity (alerting)
- Propósito: Flujos y estados de alertas y notificaciones.
- Estado: PARCIAL
- Consistencia: Parcial — el adaptador de notificaciones existe (console adapter), pero no hay evidencia de integración completa con notifiers externos en la orquestación.

19) use_cases.mmd / use_cases.svg
- Ubicación: docs/diagrams/use_cases.mmd and .svg
- Tipo: Use case diagram
- Propósito: Mostrar casos de uso principales del sistema.
- Estado: ACTUALIZADO
- Consistencia: Sí — corresponde con el listado de funcionalidades en README y modelo canónico.

20) activity_model_training.svg / docs/uml/activity_model_training.mmd
- Ubicación: docs/diagrams/activity_model_training.svg and docs/uml/activity_model_training.mmd
- Tipo: Activity diagram (ML pipeline)
- Propósito: Flujo de entrenamiento y preparación de modelos IA.
- Estado: ACTUALIZADO
- Consistencia: Sí — alinea con `src/ai_models/notebooks/` y la presencia de `production_models`.

21) component_system / duplicated entries in UML
- Ubicación: docs/diagrams/component_system.svg and docs/uml/component_system.mmd
- Tipo: Component diagram (duplicated across folders)
- Propósito: Misma representación de componentes con distintas extensiones.
- Estado: ACTUALIZADO
- Consistencia: Sí — redundancia aceptable si sincronizados; verificar unicidad de versión.

22) docs/database/ModelEER_Sigct-rural.mwb
- Ubicación: docs/database/ModelEER_Sigct-rural.mwb
- Tipo: MySQL Workbench model file (binary)
- Propósito: Modelo EER editable para DB diseño.
- Estado: ACTUALIZADO
- Consistencia: Sí — complemento del ERD y `schema_postgresql.sql` (requiere verificación de sincronía).

---

DIAGRAMAS_FALTANTES (priorizados por impacto)
1. Diagrama de mapeo código ↔ componentes (ALTO)
   - Propósito: Mostrar qué carpetas/archivos implementan cada componente (p. ej. `src/backend/core/` ↔ dominio, `src/backend/api/` ↔ adaptadores V1/V2/V3).
   - Justificación: Alto impacto para desarrolladores que retomen la refactorización y para la retirada de legacy.

2. Diagrama de despliegue Edge vs Cloud (DETALLADO) (ALTO)
   - Propósito: Especificar claramente qué se despliega en Docker Compose y qué corre en nodos Edge (MQTT, BBB), y cómo se sincronizan.
   - Justificación: Discrepancia AS-IS entre docs y Compose; alto riesgo operativo.

3. Diagrama de contratos API v3 (MEDIO-ALTO)
   - Propósito: Contrato de endpoints (path, method, payloads, respuestas) para APIs v3 establecidas.
   - Justificación: Facilita pruebas de integración y desmantelamiento de V1/V2.

4. Diagrama de seguridad y gestión de secretos (MEDIO)
   - Propósito: TLS/JWT/Secrets/Network boundaries.
   - Justificación: Documentar requisitos de producción observados en documentación pero no verificados en configuración.

5. Diagrama CI/CD y observabilidad (MEDIO)
   - Propósito: Pipelines, tests, deployments, monitoring (Prometheus/Grafana planificados).
   - Justificación: Planificado en docs; necesario para madurez operacional.

6. Diagrama de fallback y resiliencia IA (MEDIO)
   - Propósito: Mostrar comportamiento cuando el servicio IA no está disponible (mocks/fallbacks locales).
   - Justificación: Código muestra fallbacks silenciosos; documentar comportamiento esperado.

---

Observaciones finales:
- La mayoría de los diagramas fuente (`.mmd`) acompañados de `.svg` existen y están alineados conceptualmente con el modelo canónico. Sin embargo, las discrepancias más relevantes están en la capa de despliegue/Edge y en la implementación incremental del backend (V1/V2/V3).
- Recomendación inmediata: Priorizar los "DIAGRAMAS_FALTANTES" 1 y 2 para reducir la brecha entre documentación y ejecución, y registrar la fecha/autor de actualización en cada `.mmd`.

> Auditoría realizada en modo sólo lectura y basada en archivos existentes en `docs/diagrams/`, `docs/uml/` y `docs/database/`.