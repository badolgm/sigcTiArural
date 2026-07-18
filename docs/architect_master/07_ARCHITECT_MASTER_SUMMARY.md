 # 07_ARCHITECT_MASTER_SUMMARY

> **Nota de obsolescencia (FASE 5C — migración documental V8):** este documento es un artefacto histórico de auditoría previo a la consolidación arquitectónica V8. Las prioridades de diagramas citadas (`docs/diagrams/*`) fueron reevaluadas en la auditoría FASE 5 / 5A / 5B. La fuente vigente de diagramas canónicos es `docs/eiarc/03_DIAGRAMS/*_V8.mmd`. Este documento se conserva intacto por trazabilidad histórica.

Resumen maestro de conocimiento arquitectónico — SIGC&T Rural
(Resumen ejecutivo, estado, decisiones y recomendaciones técnicas).

1. Resumen ejecutivo

SIGC&T Rural es una plataforma híbrida Cloud–Edge que integra telemetría IoT, servicios de inferencia de IA y una interfaz educativa interactiva. El repositorio evidencia una migración en curso hacia una Arquitectura Hexagonal (Ports & Adapters), con componentes legacy coexistiendo con implementaciones V2/V3. Este documento sintetiza el estado verificado, los elementos estratégicos, riesgos y prioridades para tomar decisiones técnicas claras y ejecutables.

2. Estado actual del proyecto

- Rama de trabajo: `feature/refactor-modular-contexts`.
- Código y documentación disponibles: ~306 archivos, documentación extensa en `docs/` (~74 archivos).
- Implementación: Backend Django con tres generaciones coexistentes (V1 legacy, V2 Strangler Fig, V3 core/domain hexagonal parcial); servicio IA en FastAPI; frontend en React+Vite; PostgreSQL 15 como BD principal; orquestación por `docker-compose.yml` con un servicio MySQL legado.
- Modo de trabajo: inspección estática — no se ejecutó ni modificó código.

3. Visión general de SIGC&T Rural

Plataforma educativa y productiva que aporta:
- Captura y visualización de telemetría (sensores / robots).
- Diagnóstico asistido por IA (Cloud + Edge TFLite).
- Laboratorios educativos y simulaciones 3D.
- Operación tolerante a conectividad intermitente mediante estrategia Edge/Cloud.

4. Arquitectura actual (AS-IS)

- Frontend: React 18 + Vite, visualizaciones 3D (Three.js), desplegable por Docker.
- Backend: Django 4.2+ con DRF y capa de refactorización (`src/backend/core/` y `src/backend/api/logic/`). Endpoints V1/V2/V3 expuestos en paralelo; composition root simple en `infrastructure/config/dependencies.py`.
- IA: FastAPI microservicio con modelos `.h5` y notebooks de entrenamiento en `src/ai_models/`.
- IoT: Código para BeagleBone Black en `src/embedded/`; documentación Edge abundante, pero no materializada en Compose.
- BD: PostgreSQL 15; `schema_postgresql.sql` y ERD disponibles.
- Infra: Docker Compose orquesta `db`, `db-mysql` (legado), `backend`, `ai_service`, `frontend`.

5. Arquitectura objetivo (TO-BE)

- Modular Monolith con bounded contexts y Arquitectura Hexagonal estratificada: `core/domain`, `application`/use-cases, `ports`, `infrastructure/adapters`, `interfaces/web`.
- IA como microservicio independiente con SLAs y ciclo de despliegue propio.
- Edge como nodos autónomos (MQTT/BBB) documentados y decididos si quedan fuera o integrados al orquestador.
- Eliminación controlada de V1/V2; exposición estable de API V3 con contratos formales (OpenAPI).
- CI/CD y controles de seguridad en repositorio para despliegue reproducible.

6. Componentes principales

- Frontend
  - Estado: Implementado (90%). Requiere contratos API v3.
  - Fuente: `src/frontend/`.
- Backend
  - Estado: Implementado parcial; coexistencia V1/V2/V3.
  - Riesgo: Necesita consolidación del dominio en `src/backend/core/`.
- IA
  - Estado: Modelos y servicio de inferencia presentes (75%).
  - Riesgo: Operacionalización y SLAs incompletos.
- IoT
  - Estado: Diseño y código Edge presentes (40%), despliegue no reproducible.
- Base de datos
  - Estado: Modelo completo (95%), ERD y SQL disponibles.
- Infraestructura
  - Estado: Orquestación por Compose disponible; CI/CD ausente; presencia de servicios legados.

7. Estado de la refactorización hexagonal

- Presencia de `src/backend/core/` (dominio puro), `src/backend/api/logic/` (V2) y adaptadores en `src/backend/infrastructure/`.
- V3 disponible condicionalmente; fallback silencioso a versiones previas detectado — riesgo crítico para observabilidad de fallos.
- Recomendación técnica: consolidar composition root con inyección explícita y tests de contrato para cada puerto.

8. Diagramas oficiales seleccionados

Lista priorizada (síntesis):
- Alta prioridad: `docs/diagrams/architecture.mmd`, `c4_context.mmd`, `c4_components.mmd`, `docs/database/er_schema.mmd`, `docs/database/class_db_models.mmd`, `package_layers.mmd`.
- Media prioridad: `c4_containers.mmd`, `c4_deployment.mmd`, `sequence_data_ingest.mmd`, `sequence_user_auth.mmd`, `component_system.mmd`.

Como directiva: cada `.mmd` oficial debe contener metadatos (autor, fecha, versión, estado AS-IS/TO-BE).

9. Riesgos técnicos principales

- Migración parcial: coexistencia V1/V2/V3 genera inconsistencia funcional y costos de mantenimiento.
- Falta de contratos API formales para V3 — fricción entre frontend, IA y adaptadores Edge.
- Discrepancias Edge vs Compose: decisiones de despliegue no consolidadas.
- Ausencia de pipeline CI/CD: riesgo elevado para integraciones y despliegues.
- Dependencias pesadas en IA (TensorFlow) y manejo de secretos/configuración incompleta.

10. Riesgos documentales principales

- Desalineación entre diagramas de despliegue y `docker-compose.yml`.
- Duplicados de diagramas en `docs/diagrams/` y `docs/uml/` sin consolidación de autoría/versión.
- Documentación aspiracional (planes) que necesita verificación práctica AS-IS.

11. Prioridades de desarrollo

(1) Consolidar API V3 y publicar contratos OpenAPI (alto impacto).
(2) Consolidar dominio en `src/backend/core/` y retirar V1/V2 según criterios de aceptación.
(3) Sincronizar diagramas de despliegue con `docker-compose.yml` y decidir patrón Edge (fuera/integrado).
(4) Establecer CI/CD básico (build, tests, lint, despliegue staging).
(5) Operacionalizar IA: SLAs, carga de modelos automátizada y endpoints resilientes.

12. Prioridades de documentación

(1) Publicar `DIAGRAMAS_OFICIALES_SIGCTRURAL` en `README.md` y `MASTERDOC.md` con versiones.
(2) Añadir contrato API y playbook de despliegue a `docs/DEPLOYMENT.md`.
(3) Consolidar y etiquetar diagramas duplicados; añadir metadatos en cada `.mmd`.
(4) Documentar criterios de retirada de legacy y checklist de migración.

13. Recomendaciones estratégicas para continuar el proyecto

- Decisión de gobernanza: asignar responsables (arquitecto técnico, owner de IA, owner de Edge, owner de Docs).
- Adoptar contratos explícitos: OpenAPI para backend, contratos gRPC/REST para IA cuando aplique.
- Implementar CI/CD con gates de calidad y despliegue canario para migraciones.
- Priorizar la eliminación controlada de legacy y la visibilidad de fallos (no ocultar ImportError fallbacks).
- Definir política de despliegue Edge: documentación de playbooks y, si fuera necesario, incluir broker MQTT o definir integración externa.

14. Conclusión ejecutiva

SIGC&T Rural cuenta con una base técnica y documental sólida para avanzar hacia producción, pero exige decisiones concretas de consolidación: contratos API, consolidación del dominio hexagonal, sincronización de despliegue Edge/Cloud y establecimiento de pipeline y políticas de seguridad. Ejecutar las prioridades listadas reducirá riesgos operativos y permitirá aprovechar el valor educativo y productivo del proyecto.

---

Documento generado exclusivamente a partir de los artefactos verificados en la auditoría técnica; no incluye ejecuciones ni modificaciones al código.
