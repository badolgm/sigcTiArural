# 05_FINAL_ARCHITECTURE_BASELINE

> **Nota de obsolescencia (FASE 5C — migración documental V8):** este documento es un artefacto histórico de auditoría previo a la consolidación arquitectónica V8. Las decisiones "Conservar/Actualizar/Reemplazar/Eliminar" registradas aquí para diagramas en `docs/diagrams/`, `docs/uml/` y `docs/database/` fueron reevaluadas en la auditoría FASE 5 / 5A / 5B. La fuente vigente de diagramas canónicos es `docs/eiarc/03_DIAGRAMS/*_V8.mmd`. Este documento se conserva intacto por trazabilidad histórica.

Documento: línea base final de diagramas oficiales para SIGC&T Rural.
Fuentes: `01_REPOSITORY_AUDIT.md`, `02_SIGCTRURAL_CANONICAL_MODEL.md`, `03_DOCUMENT_TRUTH_MATRIX.md`, `04_DIAGRAM_AUDIT.md` y diagramas en `docs/`.

Objetivo: decidir qué diagramas serán la fuente gráfica oficial para README.md, MASTERDOC.md, Documentación SENA, Guía 10, Guía 11 y Sustentación ADSO.

Reglas aplicadas:
- "Conservar": diagrama alineado con AS-IS y TO-BE; publicado como oficial sin cambios inmediatos.
- "Actualizar": diagrama valioso pero requiere sincronización (metadatos, leyenda, versión, o pequeñas correcciones).
- "Reemplazar": concepto correcto, pero la fuente debe rehacerse (señalado para la fase de redacción de diagramas futuros).
- "Eliminar": duplicado innecesario o irrelevante.


DIAGRAMA — DECISIONES

1) architecture.mmd (docs/diagrams/architecture.mmd)
- Conservar: Sí
- Acción: Conservar como diagrama oficial de contexto/arquitectura (incluir versión y fecha en el archivo `.mmd`).
- Razon: Alineado con visión Cloud/Edge y con `MASTERDOC`.

2) c4_context.mmd (docs/diagrams/c4_context.mmd)
- Conservar: Sí
- Acción: Conservar; añadir nota de versión y referencia a `02_SIGCTRURAL_CANONICAL_MODEL.md`.

3) c4_containers.mmd (docs/diagrams/c4_containers.mmd)
- Conservar: Parcial
- Acción: "Actualizar" — alinear con `docker-compose.yml` (marcar componentes Edge como planificados si no están en Compose). Mantener como oficial tras actualización.
- Razon: necesario para despliegue y README; actualmente hay discrepancias.

4) c4_components.mmd (docs/diagrams/c4_components.mmd)
- Conservar: Sí
- Acción: Conservar; es la referencia para la descomposición interna del backend.

5) c4_deployment.mmd (docs/diagrams/c4_deployment.mmd)
- Conservar: Parcial
- Acción: "Actualizar" — precisar artefactos reales (db, backend, ai_service, frontend) y marcar Edge como externo/planificado.

6) architecture_edge.svg (docs/diagrams/architecture_edge.svg)
- Conservar: Parcial
- Acción: "Actualizar" o mover a sección "Edge (Planificado)" hasta que exista despliegue reproducible.

7) deployment_cloud_edge.svg (docs/diagrams/deployment_cloud_edge.svg)
- Conservar: Parcial
- Acción: Actualizar similar a c4_deployment; usar para MASTERDOC después de sincronizar.

8) er_schema.mmd / er_schema.svg (docs/database/er_schema.mmd)
- Conservar: Sí
- Acción: Conservar como ERD oficial; anotar fecha y versión. Fuente canonical del modelo de datos: `schema_postgresql.sql`.

9) class_db_models.mmd / class_db_models.svg (docs/database/class_db_models.mmd)
- Conservar: Sí
- Acción: Conservar; vincular explícitamente a `er_schema` y `schema_postgresql.sql`.

10) class_backend.mmd / class_backend.svg (docs/uml/class_backend.mmd)
- Conservar: Sí
- Acción: Conservar; revisar alineación con `src/backend/core` y `src/backend/api/logic`.

11) package_layers.mmd / package_layers.svg (docs/diagrams/package_layers.svg)
- Conservar: Sí
- Acción: Conservar como diagrama oficial de capas (útil para Guía 10 y Guía 11).

12) component_system.svg / docs/uml/component_system.mmd
- Duplicado detectado (docs/diagrams/ and docs/uml/)
- Conservar: Conservar una copia maestra en `docs/diagrams/component_system.mmd` y eliminar/archivar la duplicada en `docs/uml/` (o convertirla en referencia transcodificada).
- Acción: Consolidar única fuente `.mmd` y añadir metadatos.

13) sequence_data_ingest.mmd / sequence_data_ingest.svg
- Conservar: Parcial
- Acción: "Actualizar" — validar flujo Edge->Broker->API->DB vs realidad en Compose; marcar cambios.

14) sequence_navigation.mmd / sequence_navigation.svg
- Conservar: Sí
- Acción: Conservar para README y MASTERDOC (UX flows).

15) sequence_user_auth.mmd / sequence_user_auth.svg
- Conservar: Parcial
- Acción: "Actualizar" — verificar que JWT y endpoints listados correspondan con `settings.py` y `urls`.

16) state_alerting.mmd / state_alerting.svg
- Conservar: Parcial
- Acción: Actualizar y documentar adaptadores (console adapter vs external notifiers).

17) use_cases.mmd / use_cases.svg
- Conservar: Sí
- Acción: Conservar (ideal para SENA y sustentación ADSO).

18) activity_model_training.mmd / activity_model_training.svg
- Conservar: Sí
- Acción: Conservar como diagrama oficial del pipeline IA (útil en MASTERDOC y AI docs).

19) class_lab_catalog.mmd / class_lab_catalog.svg
- Conservar: Sí
- Acción: Conservar para documentación de labs (SENA).

20) class_backend.svg (already above) — ensure single canonical source: `docs/uml/class_backend.mmd`.

21) banner.svg
- Conservar: Sí (branding) — no técnico.

22) ModelEER_Sigct-rural.mwb (docs/database)
- Conservar: Sí (fuente editable), pero anotar compatibilidad y versiones (MySQL Workbench vs Postgres SQL). Reconciliar antes de usar para despliegue.


INCONSISTENCIAS PRINCIPALES (resumen)
- Edge vs Compose: `c4_containers`, `c4_deployment`, `architecture_edge` y `sequence_data_ingest` muestran Edge y brokers que no aparecen en `docker-compose.yml`.
- Legacy DB: `docker-compose.yml` incluye `db-mysql` que no es referenciado por código; diagramas de despliegue no siempre marcan este servicio como legado.
- API versions: diagramas de componentes y deployments no siempre distinguen V1/V2/V3 (riesgo de confusión durante la migración).
- Duplicados: `component_system` y `class_backend` aparecen en `docs/diagrams/` y `docs/uml/` — requieren consolidación.


DIAGRAMAS_OFICIALES_SIGCTRURAL (lista final priorizada)
(orden por prioridad de inclusión en README / MASTERDOC / SENA / Guías)

Prioridad ALTA (esenciales en README y MASTERDOC):
- docs/diagrams/architecture.mmd (Contexto / arquitectura)
- docs/diagrams/c4_context.mmd (Context)
- docs/diagrams/c4_components.mmd (Componentes)
- docs/database/er_schema.mmd (ERD oficial)
- docs/database/class_db_models.mmd (Modelos DB)
- docs/diagrams/package_layers.mmd (Capas / Hexagonal)

Prioridad MEDIA (incluir en MASTERDOC y Guías tras sincronización):
- docs/diagrams/c4_containers.mmd (Containers) — actualizar antes de uso
- docs/diagrams/c4_deployment.mmd (Deployment) — actualizar
- docs/diagrams/sequence_data_ingest.mmd — verificar ingest
- docs/diagrams/sequence_user_auth.mmd — verificar auth
- docs/diagrams/component_system.mmd — consolidar fuente `.mmd`

Prioridad BAJA (apoyos, SENA, IA):
- docs/diagrams/use_cases.mmd
- docs/uml/activity_model_training.mmd (ML pipeline)
- docs/diagrams/class_lab_catalog.mmd
- docs/uml/class_backend.mmd (unificar con docs/diagrams if duplicated)

Recomendaciones de acción inmediata (prioridad):
1. Consolidar duplicados: elegir una carpeta canónica (`docs/diagrams/` preferida) y archivar las copias redundantes en `docs/uml/` o viceversa.
2. Actualizar `c4_containers.mmd` y `c4_deployment.mmd` para reflejar el estado real de `docker-compose.yml` y marcar claramente qué nodos Edge son planificados.
3. Etiquetar cada `.mmd` con: autor, fecha, versión, estado (AS-IS / TO-BE) y enlace al ticket/PR que valide la sincronización.
4. Publicar la lista `DIAGRAMAS_OFICIALES_SIGCTRURAL` en `README.md` y `MASTERDOC.md` con enlaces relativos y versión.

---

Documento generado mediante auditoría estática; no se han modificado archivos existentes.