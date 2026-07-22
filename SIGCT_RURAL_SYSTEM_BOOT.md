# SIGCT_RURAL_SYSTEM_BOOT

> **⚠️ DOCUMENTO PARCIALMENTE SUPERADO (21-jul-2026):** el estado
> operativo inmediato de este documento fue reemplazado por
> `CLAUDE.md`, `PLAN_20_DIAS.md` y `RECOVERY_BOOT_MASTER.md`. En
> particular: el incidente del AI Service (Secciones 8, 11, 13) está
> resuelto — verificado en vivo el 21-jul-2026, sin evidencia del
> problema descrito. El Knowledge Hub (Sección 12) está implementado
> y operativo (49/49 documentos). El modelo de identidad de la
> Sección 1 (SIGCT-Rural como subconjunto de EIARC) fue invertido —
> ver `docs/ECOSYSTEM_IDENTITY.md`. Ver tabla de vigencia sección por
> sección abajo. El checklist de cierre de sesión (Sección 16) y las
> reglas de precedencia documental (Sección 18, puntos 8-9) SIGUEN
> VIGENTES — también extraídas en `docs/GOVERNANCE_RULES.md`. Este
> documento se conserva íntegro como referencia histórica, no como
> fuente de verdad operativa.

## Tabla de vigencia sección por sección (auditoría 21-jul-2026)

| # | Sección | Veredicto |
|---|---|---|
| — | Encabezado (fecha, propósito) | Parcialmente superado — el rol de "fuente de verdad de estado operativo inmediato" lo cumplen hoy `CLAUDE.md`/`PLAN_20_DIAS.md`/`RECOVERY_BOOT_MASTER.md`. |
| 1 | Qué es SIGCT-Rural | Superado — contradicción de identidad, no solo de dato. Ver `docs/ECOSYSTEM_IDENTITY.md`, definición vigente. |
| 2 | Estado actual consolidado | Superado en 3 de 4 puntos (Knowledge Hub, Telemetry V3, AI Service). |
| 3 | Documentos canónicos obligatorios | Válido como mapa — los 15 archivos existen físicamente (verificado). La cadena de "verdad arquitectónica" que citan depende en parte de `EIARC_MISSION/SCOPE/VISION.md`, ya marcados como superados en Día 2. |
| 4 | Orden exacto de lectura | Parcialmente superado — la "Fase 4: Incidente crítico vigente" ya no describe nada vigente. |
| 5 | Arquitectura documental (Niveles 1-6) | Válido — taxonomía de carpetas, no depende de estado operativo. |
| 6 | Arquitectura técnica | Superado en la sub-sección "Contextos EIARC" — lista 7 contextos (incluye IoT, Deployment) que contradicen la lista reconciliada en Día 6-7 (`Labs, Telemetry, AI, Knowledge, Identity, EIARC`). Estado de madurez de Labs/Telemetry desactualizado. |
| 7 | Problemas resueltos | Válido — registro histórico de diseño/diagnóstico ya cerrado, no reabierto. |
| 8 | Incidentes abiertos | Superado en #1 (AI Service) y #2 (Knowledge Hub). Parcial en #3 (Docs v5.0 — las 5 páginas específicas ya se archivaron en Día 4) y #4 (consolidación de contextos — 2 ya tienen scaffold+tests). |
| 9 | Estado actual de Dashboard | Válido — sin evidencia de cambio. |
| 10 | Estado actual de Telemetry | Superado — necesita reescritura, no parche. V3 tenía 0 tests hasta el 20-jul y un bug de producción real (naive vs. aware datetime) sin detectar hasta esta sesión. |
| 11 | Estado actual de AI Service | Superado — verificado en vivo 21-jul-2026, sin evidencia del incidente descrito. |
| 12 | Estado actual de Knowledge Hub | Superado — implementado y operativo (49/49 documentos) desde Día 3-5. |
| 13 | Próxima acción obligatoria | Superado — no hay nada que recuperar en el AI Service. |
| 14 | Acciones prohibidas | Válido, mayormente — compatible en espíritu con las reglas de oro de `CLAUDE.md`. Puntos 5-6 (AI Service) sin objeto hoy. |
| 15 | Checklist de inicio de sesión | Válido, con un paso huérfano — el paso 2 ("confirmar incidente activo actual") no tiene respuesta fija hoy. |
| 16 | Checklist de cierre de sesión | **Válido — vigente, también extraído en `docs/GOVERNANCE_RULES.md`.** |
| 17 | Mapa de continuidad del proyecto | Parcialmente superado — el mapa de documentos existe, pero "entrar por AI Service" ya no aplica. |
| 18.1-7 | Fuente de verdad (puntos 1-7) | Punto 1 superado. Puntos 3 y 5 apuntan a documentos con contenido interno desactualizado, aunque el principio de "esto manda sobre ese tema" siga siendo razonable. |
| 18.8 | Regla final de precedencia | **Válido — vigente, también extraído en `docs/GOVERNANCE_RULES.md`.** |
| 18.9 | Reglas 1-4 de gobernanza documental | **Válido — vigente, también extraído en `docs/GOVERNANCE_RULES.md`.** |
| — | Cierre operativo | Superado en puntos 3-4 (AI Service, Knowledge Hub como próximos frentes). Válido en espíritu en 1-2-5. |

---

## Fecha

2026-07-16

## Propósito

Este documento es el punto único de entrada para cualquier IA o desarrollador que ingrese al repositorio sin contexto previo. Su función no es auditar, rediseñar ni reabrir decisiones cerradas, sino **consolidar el conocimiento ya producido**, establecer el orden obligatorio de lectura, fijar la fuente de verdad vigente y evitar que se repitan trabajos ya terminados.

---

## SECCIÓN 1

## Qué es SIGCT-Rural

SIGCT-Rural es un proyecto productivo ADSO - SENA que evolucionó desde una plataforma SIGCT-Rural funcional hacia una línea arquitectónica más amplia denominada **EIARC**.

En términos prácticos, el sistema actual combina:

- backend `Django`
- frontend `React`
- persistencia `PostgreSQL`
- infraestructura `Docker`
- microservicio de IA con `FastAPI` y `TensorFlow`
- documentación técnica extensa y estructurada

SIGCT-Rural ya no debe entenderse solo como una aplicación web aislada. Debe leerse como:

1. un sistema de software operativo con varios slices funcionales
2. un corpus documental grande y ya consolidado
3. una base de transición arquitectónica hacia EIARC
4. un proyecto académico y técnico con artefactos finales de cierre

---

## SECCIÓN 2

## Estado actual consolidado

El estado consolidado del repositorio es el siguiente:

- existe una línea documental amplia y ya formalizada en raíz, `docs/eiarc/`, `docs/project_knowledge_base/` y `docs/sena_artifacts/`
- existe un baseline arquitectónico EIARC ya definido
- existe un plan completo del Knowledge Hub, pero **todavía no implementado**
- `Dashboard` y `Telemetry` quedaron funcionalmente encaminados y Telemetry V3 fue recuperado operacionalmente
- el `AI Service` tiene una incidencia crítica abierta: la imagen local quedó corrupta a nivel de dependencias Python
- el proyecto ya dispone de artefactos de cierre académico SENA materializados

Lectura de estado global:

- la continuidad documental está fuerte
- la continuidad arquitectónica está fuerte
- la continuidad operacional está parcial
- el principal bloqueo técnico activo es el `AI Service`

---

## SECCIÓN 3

## Documentos canónicos obligatorios

Los documentos canónicos que una nueva IA debe considerar obligatorios son estos:

1. `SIGCT_RURAL_SYSTEM_BOOT.md`
2. `MASTER_PROJECT_INVENTORY_AUDIT.md`
3. `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md`
4. `docs/eiarc/02_ARCHITECTURE/EIARC_IMPLEMENTATION_BLUEPRINT.md`
5. `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md`
6. `KNOWLEDGE_HUB_ARCHITECTURE.md`
7. `KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md`
8. `KNOWLEDGE_HUB_MIGRATION_PLAN.md`
9. `AI_SERVICE_FORENSIC_AUDIT.md`
10. `AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`
11. `AI_SERVICE_RECOVERY_PLAN.md`
12. `AI_SERVICE_EXECUTION_READINESS.md` — determina si el proyecto está listo para ejecutar la recuperación real del AI Service; se lee junto con los tres documentos anteriores como una sola familia de incidente
13. `docs/MASTERDOC.md`
14. `docs/PLAN_MAESTRO.md`
15. `INDICE_PROYECTO.md`
16. `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` — **documentación operativa oficial** (guía de continuidad, backlog técnico detallado y estructura objetivo de contextos para la refactorización hexagonal; ver regla de precedencia REGLA 4 en SECCIÓN 18)

Documentos de soporte de alta prioridad:

- `docs/project_knowledge_base/KB-001-TRAE-INDEPENDENT-REPOSITORY-AUDIT.md`
- `docs/project_knowledge_base/KB-006-PENDING-CHANGES-AUDIT.md`
- `docs/eiarc/02_ARCHITECTURE/TELEMETRY_DATABASE_DIAGNOSTIC.md`
- `SENA_GRADUATION_READINESS_AUDIT.md`
- `docs/sena_artifacts/PROYECTO_FORMATIVO_FINAL.md`
- `docs/sena_artifacts/EVIDENCIAS_ADSO_MASTER.md`
- `docs/sena_artifacts/PRESENTACION_SUSTENTACION.md`
- `docs/sena_artifacts/DEPLOYMENT_FINAL.md`
- `docs/sena_artifacts/API_DELIVERY_PACKAGE.md`

Programa oficial de I+D (vigente, en diseño — no implementado, no absorbido aún por `docs/eiarc/`):

- `docs/ai/research_v2/SIGCT_RURAL_AI_RESEARCH_PROGRAM_V2.md` — programa rector de investigación aplicada de IA (Agriculture AI, Animal Health AI, Telemetry AI, Audio/Signal Intelligence, Knowledge AI, Multimodal Fusion). Reúne `AI_CONTEXT_V2_*`, `AI_DATASET_*`, `AI_MLOPS_AND_TRAINING_GOVERNANCE_V2.md`, `AI_PREDICTION_VALIDATION_AUDIT.md`, `AI_SCIENTIFIC_CORRECTION_DESIGN.md`, `AI_TRAINING_PIPELINE_V2.md` y la familia `AGRICULTURE_AI_V2_*` (primera línea de ejecución). Diseñado para converger con EIARC a medida que cada línea madure, pero es un track paralelo, no una duplicación.

Documentación histórica (gobernada, no canónica — ver REGLA 2 en SECCIÓN 18):

- `docs/historical/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md` — bitácora de sesiones de trabajo (ene-may 2026), secundaria a `docs/MASTERDOC.md` §5. Contiene eventos históricos únicos (sesiones de 17-feb y 23-may-2026) no registrados en MASTERDOC; ante cualquier discrepancia con MASTERDOC.md, prevalece MASTERDOC.md.
- `docs/historical/TRAE_INDEPENDENT_REPOSITORY_AUDIT.md` y `docs/historical/TRAE_AI_INTEGRATION_AUDIT.md` — auditorías estáticas independientes ya absorbidas como fuente de `docs/project_knowledge_base/KB-001` y `KB-003` respectivamente. Sin valor operativo remanente; se conservan por trazabilidad.
- `docs/historical/README_REALITY_CHECK.md` — comparación README-vs-código ya absorbida como fuente de `docs/project_knowledge_base/KB-002`. Sin valor operativo remanente; se conserva por trazabilidad.

---

## SECCIÓN 4

## Orden exacto de lectura

Una IA nueva no debe leer el repositorio de forma caótica. Debe seguir este orden exacto:

### Fase 1. Arranque

1. `SIGCT_RURAL_SYSTEM_BOOT.md`
2. `MASTER_PROJECT_INVENTORY_AUDIT.md`
3. `INDICE_PROYECTO.md`

### Fase 2. Verdad arquitectónica

4. `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md`
5. `docs/eiarc/02_ARCHITECTURE/EIARC_IMPLEMENTATION_BLUEPRINT.md`
6. `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md`

### Fase 3. Continuidad documental

7. `KNOWLEDGE_HUB_ARCHITECTURE.md`
8. `KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md`
9. `KNOWLEDGE_HUB_MIGRATION_PLAN.md`

### Fase 4. Incidente crítico vigente

10. `AI_SERVICE_FORENSIC_AUDIT.md`
11. `AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`
12. `AI_SERVICE_RECOVERY_PLAN.md`
13. `AI_SERVICE_EXECUTION_READINESS.md`

### Fase 5. Contexto general del proyecto

13. `docs/MASTERDOC.md`
14. `docs/PLAN_MAESTRO.md`
15. `docs/project_knowledge_base/`
16. `docs/sena_artifacts/`

Regla operacional:

- no saltar directamente a implementación sin haber leído al menos hasta la Fase 4

---

## SECCIÓN 5

## Arquitectura documental

La arquitectura documental consolidada del proyecto está organizada por niveles:

### Nivel 1. Raíz del proyecto

Contiene documentos de arranque, auditoría maestra, continuidad, recuperación e índices globales.

### Nivel 2. Documentación base del producto

Ubicación principal:

- `docs/MASTERDOC.md`
- `docs/PLAN_MAESTRO.md`
- `docs/API_REFERENCE.md`
- `docs/DEPLOYMENT.md`
- `docs/EDGE_SETUP.md`
- `docs/AI_PIPELINE.md`

### Nivel 3. Base formal de conocimiento

Ubicación:

- `docs/project_knowledge_base/`

Rol:

- preserva hallazgos de auditoría y decisiones ya consolidadas

### Nivel 4. Línea arquitectónica EIARC

Ubicación:

- `docs/eiarc/01_FOUNDATION/`
- `docs/eiarc/02_ARCHITECTURE/`
- `docs/eiarc/03_DIAGRAMS/`

Rol:

- fijar visión, contextos, modelo de datos, blueprint y planes de transformación

### Nivel 5. Cierre académico SENA

Ubicación:

- `docs/sena_artifacts/`

Rol:

- contener los entregables finales de cierre ADSO y sustentación

### Nivel 6. Respaldo, archivo y retención

Ubicación principal:

- `PROJECT_ARCHIVE_MANIFEST.md`
- `PROJECT_RECORDS_REGISTER.md`
- `DOCUMENT_RETENTION_POLICY.md`
- `PROJECT_STRUCTURE_SNAPSHOT.md`
- `PROJECT_BACKUP_MANIFEST.md`
- `BACKUP_CONTENT_INDEX.md`
- `BACKUP_VERIFICATION_REPORT.md`

Conclusión:

- la documentación ya no está dispersa informalmente; existe una arquitectura documental real y debe tratarse como parte del sistema

---

## SECCIÓN 6

## Arquitectura técnica

La arquitectura técnica consolidada puede resumirse así:

### Backend

- `Django` como backend principal
- presencia de estratos legacy y núcleo hexagonal parcial
- persistencia real gobernada por `models.py` y `migrations/`

### Frontend

- `React` como frontend principal
- mezcla de dashboard, laboratorios, IA predictiva y sistema documental actual `Docs v5.0`

### IA

- microservicio independiente en `src/ai_models/`
- runtime esperado con `FastAPI`, `uvicorn`, `TensorFlow`
- integración con backend mediante adaptadores del `AI Context`

### Infraestructura

- `docker-compose.yml` como orquestación local
- contenedores principales:
  - `db`
  - `backend`
  - `ai_service`
  - `frontend`

### Contextos EIARC

Los contextos oficiales vigentes son:

1. `Telemetry Context`
2. `AI Context`
3. `Labs Context`
4. `Knowledge Context`
5. `Identity Context`
6. `IoT Context`
7. `Deployment Context`

Estado de madurez relativo:

- más alineado: `Telemetry Context`
- existente pero con incidencia activa: `AI Context`
- muy fuerte en documentación: `Knowledge Context`
- todavía heterogéneo: `Labs Context`
- débil o incompleto: `Identity`, `IoT`, `Deployment` en su visión objetivo completa

---

## SECCIÓN 7

## Problemas resueltos

Los siguientes problemas ya no deben ser re-auditados como si siguieran abiertos:

### 1. Inventario maestro del proyecto

Ya resuelto mediante:

- `MASTER_PROJECT_INVENTORY_AUDIT.md`

### 2. Preparación de cierre académico ADSO

Ya resuelto mediante:

- `SENA_GRADUATION_READINESS_AUDIT.md`
- `docs/sena_artifacts/*`

### 3. Baseline arquitectónico EIARC

Ya resuelto mediante:

- `docs/eiarc/01_FOUNDATION/*`
- `docs/eiarc/02_ARCHITECTURE/*`
- `docs/eiarc/03_DIAGRAMS/*`

### 4. Orden de implementación por contextos

Ya resuelto mediante:

- `docs/eiarc/02_ARCHITECTURE/EIARC_IMPLEMENTATION_BLUEPRINT.md`

Conclusión cerrada:

- el primer contexto de implementación es `Telemetry Context`

### 5. Diagnóstico estructural de Telemetry V3

Ya resuelto mediante:

- `docs/eiarc/02_ARCHITECTURE/TELEMETRY_DATABASE_DIAGNOSTIC.md`

Conclusión cerrada:

- el error `api_sensorreading does not exist` no era un defecto de diseño del endpoint, sino una falta de migraciones aplicadas

### 6. Diseño del Knowledge Hub

Ya resuelto a nivel de diseño, especificación y migración mediante:

- `KNOWLEDGE_HUB_ARCHITECTURE.md`
- `KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md`
- `KNOWLEDGE_HUB_MIGRATION_PLAN.md`

Conclusión cerrada:

- no debe volver a rediseñarse la arquitectura del portal documental

### 7. Diagnóstico forense del arranque del AI Service

Ya resuelto a nivel de causa inmediata mediante:

- `AI_SERVICE_FORENSIC_AUDIT.md`

Conclusión cerrada:

- el fallo inmediato no está en `fastapi_app.py`
- la imagen local tiene dependencias Python corruptas

### 8. Causa probable del build corrupto del AI Service

Ya resuelto mediante:

- `AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`

Conclusión cerrada:

- la causa más probable es corrupción local de la capa `pip install` o de la materialización local del layer

---

## SECCIÓN 8

## Incidentes abiertos

Los incidentes que siguen abiertos y no deben darse por cerrados son estos:

### 1. AI Service no operativo en el estado local actual

Estado:

- abierto

Base documental:

- `AI_SERVICE_FORENSIC_AUDIT.md`
- `AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`
- `AI_SERVICE_RECOVERY_PLAN.md`
- `AI_SERVICE_EXECUTION_READINESS.md`

Descripción:

- la imagen local `sigctiarural-ai_service` contiene archivos críticos en `0 bytes`
- el contenedor falla al arrancar

### 2. Knowledge Hub no implementado todavía

Estado:

- abierto

Base documental:

- `KNOWLEDGE_HUB_ARCHITECTURE.md`
- `KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md`
- `KNOWLEDGE_HUB_MIGRATION_PLAN.md`

Descripción:

- el diseño está cerrado
- la implementación React aún no debe asumirse como existente

### 3. Gobernanza documental aún dependiente del sistema Docs v5.0 en frontend

Estado:

- abierto

Descripción:

- el portal definitivo no está en producción
- la continuidad documental ya está definida, pero la experiencia local todavía depende del sistema previo

### 4. Consolidación completa de contextos EIARC en código

Estado:

- abierto

Descripción:

- existe blueprint y orden de migración
- no todos los contextos están implementados como bounded slices reales

---

## SECCIÓN 9

## Estado actual de Dashboard

Estado consolidado:

- `Dashboard` debe considerarse **operativo**

Lectura práctica:

- no es el incidente crítico vigente
- no debe ser el primer foco de intervención

Restricción:

- cualquier trabajo futuro sobre documentación o Knowledge Hub no debe romper `Dashboard`

Conclusión operativa:

- el dashboard no requiere re-auditoría general antes de tratar el incidente del AI Service

---

## SECCIÓN 10

## Estado actual de Telemetry

Estado consolidado:

- `Telemetry Context` es el slice más maduro del proyecto
- el diagnóstico del fallo de base ya fue resuelto
- Telemetry V3 debe tratarse como el primer contexto implementado o casi implementado de la línea EIARC

Hechos cerrados:

- el problema `api_sensorreading does not exist` ya fue explicado
- la causa fue operacional, no estructural

Regla de continuidad:

- no reabrir el diagnóstico de Telemetry V3 salvo que aparezca una evidencia nueva distinta

Conclusión operativa:

- `Telemetry` no es el foco prioritario actual
- debe preservarse como slice de referencia para futuras migraciones de contexto

---

## SECCIÓN 11

## Estado actual de AI Service

Estado consolidado:

- **crítico**

Diagnóstico vigente:

- la imagen local del AI Service está corrupta a nivel de dependencias Python
- `uvicorn/main.py` y `typing_extensions.py` quedaron en `0 bytes`
- el problema no está atribuido a `fastapi_app.py` como causa primaria

Lectura obligatoria antes de cualquier acción:

1. `AI_SERVICE_FORENSIC_AUDIT.md`
2. `AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`
3. `AI_SERVICE_RECOVERY_PLAN.md`

Decisión ya cerrada:

- no volver a auditar la causa raíz inmediata
- no volver a redactar recovery plan

Conclusión operativa:

- el AI Service es el incidente prioritario número uno del estado local actual

---

## SECCIÓN 12

## Estado actual de Knowledge Hub

Estado consolidado:

- **diseñado y especificado, pero no implementado**

Hechos ya cerrados:

- la causa raíz del fallo documental actual ya fue identificada
- el problema es la dependencia de `raw.githubusercontent.com` y CDNs externos
- la arquitectura futura ya fue definida
- la especificación técnica ya fue definida
- el plan de migración controlada ya fue definido

Qué no debe hacerse:

- no rediseñar el hub
- no volver a producir arquitectura alternativa
- no reanalizar el problema de fondo como si estuviera abierto

Conclusión operativa:

- el Knowledge Hub no es un vacío de definición; es un backlog de implementación controlada

---

## SECCIÓN 13

## Próxima acción obligatoria

La próxima acción obligatoria del proyecto es:

- **ejecutar recuperación controlada del `AI Service` siguiendo `AI_SERVICE_RECOVERY_PLAN.md`, precedida por las validaciones adicionales definidas en `AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`**

Motivo:

1. es el incidente técnico activo más crítico
2. bloquea la continuidad operacional del slice de IA
3. ya existe diagnóstico suficiente; seguir auditando sería repetición improductiva

Regla:

- no iniciar implementación del Knowledge Hub antes de estabilizar el AI Service local, salvo que se abra explícitamente una línea de trabajo puramente documental o de diseño

---

## SECCIÓN 14

## Acciones prohibidas

Las siguientes acciones quedan prohibidas para futuras IA salvo autorización explícita:

1. re-auditar el repositorio completo desde cero
2. regenerar arquitectura EIARC ya aprobada
3. regenerar especificación del Knowledge Hub
4. regenerar plan de migración del Knowledge Hub
5. reabrir el diagnóstico forense del AI Service como si no existiera
6. reescribir recovery plan del AI Service sin evidencia nueva
7. tratar `schema_postgresql.sql` como única fuente de verdad del esquema
8. romper `Dashboard`, `Telemetry` o navegación principal por cambios documentales
9. modificar documentos existentes sin necesidad explícita
10. introducir nuevas arquitecturas paralelas no solicitadas
11. confundir documentos históricos con fuente de verdad vigente
12. reiniciar trabajo ya cerrado solo por pérdida de contexto conversacional

---

## SECCIÓN 15

## Checklist de inicio de sesión para futuras IA

Toda IA que entre al proyecto debe ejecutar mentalmente este checklist:

1. leer `SIGCT_RURAL_SYSTEM_BOOT.md`
2. confirmar cuál es el incidente activo actual
3. identificar si la tarea es de auditoría, diseño, implementación o recovery
4. revisar si la tarea ya tiene documento canónico existente
5. verificar restricciones de no modificación antes de actuar
6. leer `MASTER_PROJECT_INVENTORY_AUDIT.md` si necesita contexto global
7. leer `docs/eiarc/02_ARCHITECTURE/EIARC_IMPLEMENTATION_BLUEPRINT.md` si la tarea toca código por contexto
8. leer documentos del incidente específico antes de proponer acciones
9. distinguir entre problema resuelto, incidente abierto y backlog de implementación
10. no ejecutar trabajo duplicado por pérdida de contexto

---

## SECCIÓN 16

## Checklist de cierre de sesión

Antes de terminar una sesión, cualquier IA debe verificar:

1. si dejó evidencia persistida en archivos nuevos o actualizados
2. si el resultado quedó materializado físicamente en el repositorio
3. si documentó con claridad qué quedó resuelto
4. si documentó con claridad qué sigue abierto
5. si dejó explícita la siguiente acción recomendada
6. si evitó dejar decisiones ambiguas o dobles lecturas
7. si el estado final quedó alineado con las restricciones del usuario
8. si no abrió una nueva línea arquitectónica innecesaria

---

## SECCIÓN 17

## Mapa de continuidad del proyecto

El mapa de continuidad operativo es este:

### Continuidad de entrada

- `SIGCT_RURAL_SYSTEM_BOOT.md`

### Continuidad global

- `MASTER_PROJECT_INVENTORY_AUDIT.md`
- `INDICE_PROYECTO.md`

### Continuidad arquitectónica

- `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_IMPLEMENTATION_BLUEPRINT.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md`

### Continuidad documental

- `KNOWLEDGE_HUB_ARCHITECTURE.md`
- `KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md`
- `KNOWLEDGE_HUB_MIGRATION_PLAN.md`

### Continuidad de incidentes

- `AI_SERVICE_FORENSIC_AUDIT.md`
- `AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`
- `AI_SERVICE_RECOVERY_PLAN.md`
- `AI_SERVICE_EXECUTION_READINESS.md`

### Continuidad académica y de entrega

- `SENA_GRADUATION_READINESS_AUDIT.md`
- `docs/sena_artifacts/*`

Lectura sintética del mapa:

- si la tarea es general, entrar por `SYSTEM_BOOT`
- si la tarea es de arquitectura, entrar por `docs/eiarc/`
- si la tarea es documental, entrar por `Knowledge Hub`
- si la tarea es operativa crítica, entrar por `AI Service`

---

## SECCIÓN 18

## Definición oficial de fuente de verdad

La fuente de verdad oficial del proyecto queda definida por capas:

### 1. Fuente de verdad para estado operativo inmediato

- `SIGCT_RURAL_SYSTEM_BOOT.md`

### 2. Fuente de verdad para inventario y clasificación general

- `MASTER_PROJECT_INVENTORY_AUDIT.md`

### 3. Fuente de verdad para arquitectura y contextos

- `docs/eiarc/02_ARCHITECTURE/`

En particular:

- `EIARC_CONTEXTS.md`
- `EIARC_IMPLEMENTATION_BLUEPRINT.md`
- `EIARC_CANONICAL_DATA_MODEL.md`

### 4. Fuente de verdad para esquema backend

- `src/backend/api/migrations/`
- `src/backend/api/models.py`

Regla explícita:

- `schema_postgresql.sql` es histórico y útil como referencia, pero **no debe tratarse como fuente de verdad única del esquema actual**

### 5. Fuente de verdad para incidentes AI Service

- `AI_SERVICE_FORENSIC_AUDIT.md`
- `AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`
- `AI_SERVICE_RECOVERY_PLAN.md`
- `AI_SERVICE_EXECUTION_READINESS.md`

### 6. Fuente de verdad para continuidad documental futura

- `KNOWLEDGE_HUB_ARCHITECTURE.md`
- `KNOWLEDGE_HUB_IMPLEMENTATION_SPEC.md`
- `KNOWLEDGE_HUB_MIGRATION_PLAN.md`

### 7. Fuente de verdad para cierre académico

- `SENA_GRADUATION_READINESS_AUDIT.md`
- `docs/sena_artifacts/`

### 8. Regla final de precedencia

Si dos fuentes parecen contradecirse, la precedencia correcta es:

1. documento específico más reciente del tema
2. documentos canónicos `docs/eiarc/02_ARCHITECTURE/`
3. código real y migraciones cuando el tema es comportamiento o esquema ejecutable
4. inventarios y auditorías generales
5. documentos históricos o dumps desactualizados

### 9. Reglas de gobernanza documental — bitácora técnica y refactorización hexagonal (FASE 7L/7M)

Estas reglas resuelven de forma definitiva el conflicto de gobernanza identificado entre `docs/MASTERDOC.md` y `docs/historical/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md`, y formalizan el rol de `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`:

**REGLA 1** — `docs/MASTERDOC.md` (en particular su Sección 5, "Bitácora de Intervenciones Técnicas") es la **bitácora oficial** del proyecto. No existe otra bitácora con estatus canónico equivalente.

**REGLA 2** — Ante cualquier discrepancia entre `docs/MASTERDOC.md` y `docs/historical/INFORME_ANALISIS_Y_PLAN_DE_ACCION.md` (por ejemplo, cifras o cronologías divergentes sobre el mismo evento), **prevalece `docs/MASTERDOC.md`**. `INFORME_ANALISIS_Y_PLAN_DE_ACCION.md` se conserva como documentación histórica secundaria por su valor de continuidad (contiene sesiones de trabajo, como las de 17-feb y 23-may-2026, no registradas en MASTERDOC), pero no tiene estatus de fuente de verdad.

**REGLA 3** — `docs/PLAN_MAESTRO.md` manda sobre el roadmap y el estado de fases del proyecto (qué fase está activa, completada o planificada).

**REGLA 4** — `docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` manda sobre el detalle técnico de implementación de la refactorización hexagonal (backlog granular, estructura objetivo de `contexts/`, guía de reanudación) cuando ese detalle no está cubierto o es más granular que `docs/PLAN_MAESTRO.md`. Ante conflicto entre ambos sobre el **estado de una fase**, prevalece PLAN_MAESTRO.md (REGLA 3); ante conflicto sobre el **detalle técnico de una tarea**, prevalece ADSO_GUIA_TECNICA (REGLA 4).

---

## Cierre operativo

Si una IA nueva entra mañana sin contexto, debe asumir esto:

1. el proyecto ya tiene arquitectura, inventario y línea documental consolidados
2. no debe reiniciar trabajos de diagnóstico ya cerrados
3. el incidente activo principal es el `AI Service`
4. el siguiente frente mayor, una vez estabilizado el AI Service, es la implementación controlada del `Knowledge Hub`
5. la continuidad del proyecto ya no depende de memoria conversacional, sino de esta cadena documental canónica
