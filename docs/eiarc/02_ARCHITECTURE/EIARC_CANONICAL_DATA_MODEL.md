# EIARC Canonical Data Model

## Fecha

2026-07-12

## Versión

v1.0.0

## Objetivo

Definir el modelo canónico de datos de EIARC a partir del análisis estático de `schema_postgresql.sql`, `src/backend/api/models.py`, `src/backend/api/migrations/`, los contextos EIARC y los hallazgos de auditoría del proyecto, estableciendo estado actual, inconsistencias, entidades canónicas, ownership por contexto, agregados, riesgos, estrategia de transición y recomendación explícita de fuente de verdad.

## Referencias

- `schema_postgresql.sql`
- `src/backend/api/models.py`
- `src/backend/api/migrations/0001_initial.py`
- `src/backend/api/migrations/0002_robot_robotcommand_robottelemetry.py`
- `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md`
- `docs/project_knowledge_base/KB-006-PENDING-CHANGES-AUDIT.md`
- `docs/project_knowledge_base/KB-001-TRAE-INDEPENDENT-REPOSITORY-AUDIT.md`
- `docs/architect_master/02_SIGCTRURAL_CANONICAL_MODEL.md`
- `docs/architect_master/05_FINAL_ARCHITECTURE_BASELINE.md`

## Resumen ejecutivo

El estado real de datos del repositorio está desalineado entre tres fuentes:

- `schema_postgresql.sql` refleja una base muy reducida: `api_sensorreading` más tablas framework de Django
- `models.py` refleja un estado de dominio más avanzado: `SensorReading`, `Robot`, `RobotTelemetry`, `RobotCommand`
- las migraciones confirman ese estado más avanzado y lo ordenan temporalmente

Hallazgo principal:

- el **dump SQL está desactualizado** respecto a `models.py` y `migrations/`
- por lo tanto, **la fuente de verdad recomendada ya no debe ser `schema_postgresql.sql`**, sino **las migraciones** como verdad ejecutable del esquema del backend

## 1. Estado actual

### 1.1 Entidades que existen realmente

#### Verificadas en `models.py` y migraciones

1. `SensorReading`
2. `Robot`
3. `RobotTelemetry`
4. `RobotCommand`

Evidencia:

- [models.py:L4-L14](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/models.py#L4-L14)
- [models.py:L20-L39](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/models.py#L20-L39)
- [models.py:L41-L53](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/models.py#L41-L53)
- [models.py:L55-L83](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/models.py#L55-L83)
- [0001_initial.py:L15-L27](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/migrations/0001_initial.py#L15-L27)
- [0002_robot_robotcommand_robottelemetry.py:L15-L150](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/migrations/0002_robot_robotcommand_robottelemetry.py#L15-L150)

#### Verificadas solo en el dump SQL

1. `api_sensorreading`
2. tablas framework Django:
   - `auth_user`
   - `auth_group`
   - `auth_permission`
   - `auth_user_groups`
   - `auth_user_user_permissions`
   - `auth_group_permissions`
   - `django_admin_log`
   - `django_content_type`
   - `django_migrations`
   - `django_session`

Evidencia:

- [schema_postgresql.sql:L26-L38](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/schema_postgresql.sql#L26-L38)
- [schema_postgresql.sql:L55-L323](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/schema_postgresql.sql#L55-L323)

### 1.2 Lectura del estado actual

El backend ya evolucionó desde un modelo mínimo de telemetría (`SensorReading`) hacia una capacidad adicional de robótica (`Robot`, `RobotTelemetry`, `RobotCommand`), pero ese avance todavía no fue sincronizado en `schema_postgresql.sql`.

## 2. Inconsistencias encontradas

### 2.1 Inconsistencia principal

`schema_postgresql.sql` no contiene:

- `api_robot`
- `api_robottelemetry`
- `api_robotcommand`

Evidencia:

- presencia única de `api_sensorreading` en [schema_postgresql.sql:L26-L44](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/schema_postgresql.sql#L26-L44)
- ausencia de referencias `api_robot`, `api_robottelemetry`, `api_robotcommand` en el dump
- definición de esas entidades en [models.py:L20-L83](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/models.py#L20-L83) y [0002_robot_robotcommand_robottelemetry.py:L15-L150](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/src/backend/api/migrations/0002_robot_robotcommand_robottelemetry.py#L15-L150)

Conclusión:

- el dump SQL está **desactualizado**

### 2.2 Inconsistencia de autoridad

`architect_master` venía tratando `schema_postgresql.sql` como fuente canónica del modelo de datos, por ejemplo en [05_FINAL_ARCHITECTURE_BASELINE.md:L47-L53](file:///c:/Users/Devbadolgm/Development/research-ai/ProjectsAndDatasets/sigcTiArural/docs/architect_master/05_FINAL_ARCHITECTURE_BASELINE.md#L47-L53), pero el estado actual del repositorio demuestra drift con modelos y migraciones.

Conclusión:

- esa regla documental ya no es confiable sin sincronización

### 2.3 Inconsistencia semántica

Las entidades persistidas actuales cubren algo de `Telemetry`, algo de `IoT` y algo de `Identity`, pero no representan aún el contrato semántico de `AI Context` ni el resto de contexts EIARC.

## 3. Qué entidades están duplicadas

### Duplicación física verificada

No se detectan **entidades de negocio físicamente duplicadas** con nombres distintos dentro de los artefactos analizados.

### Duplicación de definición

Sí existe duplicación de definición de las mismas entidades entre:

- `models.py`
- migraciones
- `schema_postgresql.sql`

pero esa duplicación no es el problema principal; el problema real es que **ya no están sincronizadas**.

### Duplicación conceptual

Existe una duplicación conceptual potencial entre:

- `auth_user` como identidad técnica de Django
- el futuro `Actor`/`Role`/`Capability` del `Identity Context` EIARC

Hoy no hay tablas separadas para ese modelo EIARC, así que la duplicación todavía es **potencial/futura**, no física.

## 4. Qué entidades faltan

Para el modelo canónico EIARC faltan, como mínimo, estas entidades de negocio:

### Telemetry Context

- `TelemetryEvent`
- `TimeSeriesSnapshot`
- `DeviceStatus`

### AI Context

- `Prediction`
- `InferenceResult`
- `Recommendation`
- `ModelDescriptor`
- `SemanticContractRegistry`

### Identity Context

- `Actor`
- `Role`
- `Capability`
- `AccessScope`

### Labs Context

- `LabSession`
- `SimulationState`
- `DiagnosisView`

### IoT Context

- `Device`
- `Sensor`
- `EdgeNode`
- `Gateway`

### Deployment Context

- `Environment`
- `Topology`
- `ServicePlacement`
- `DeploymentMode`

### Knowledge Context

- `KnowledgeArtifact`
- `Taxonomy`
- `ArchitectureDecision`

Conclusión:

- el repositorio tiene hoy un modelo de datos operativo mínimo, no un modelo EIARC completo

## 5. Qué entidades son legacy

### Legacy o transicionales

1. `SensorReading` en su forma actual  
   Es útil, pero es una entidad plana y genérica. No referencia `Device`, `Sensor`, `Environment` ni ownership contextual más rico.

2. tablas framework `django_*`  
   Son necesarias a nivel técnico, pero no deben confundirse con entidades canónicas del dominio EIARC.

3. tablas `auth_*` como representación total de identidad  
   Son válidas como soporte actual, pero insuficientes como modelo canónico del `Identity Context`.

### No legacy, pero aún tácticas

1. `Robot`
2. `RobotTelemetry`
3. `RobotCommand`

Estas entidades sí representan avance real, pero todavía viven en una capa táctica del backend y no en un modelo canónico transversal por contextos.

## 6. Entidades canónicas propuestas

## 6.1 Canon mínimo inmediato

### Telemetry Context

- `SensorReading`
- `RobotTelemetry`

### IoT Context

- `Robot`
- futuro `Device`
- futuro `Sensor`

### Identity Context

- `UserAccount` como traducción transicional de `auth_user`
- `RoleAssignment` como traducción transicional de grupos/permisos

## 6.2 Canon objetivo EIARC

### Telemetry Context

- `TelemetryEvent`
- `SensorReading`
- `RobotTelemetry`
- `TimeSeriesSnapshot`

### IoT Context

- `Device`
- `Sensor`
- `Robot`
- `EdgeNode`
- `Gateway`

### AI Context

- `Prediction`
- `InferenceResult`
- `Recommendation`
- `ModelDescriptor`
- `SemanticContractVersion`

### Identity Context

- `Actor`
- `Role`
- `Capability`
- `AccessScope`

### Labs Context

- `LabSession`
- `SimulationState`

### Deployment Context

- `Environment`
- `Topology`
- `ServicePlacement`

### Knowledge Context

- `Taxonomy`
- `KnowledgeArtifact`
- `ArchitectureDecision`

## 7. Relación Entidad -> Contexto

| Entidad | Estado | Contexto principal | Contextos consumidores | Ownership recomendado |
|---|---|---|---|---|
| `SensorReading` | Existe | `Telemetry Context` | `AI`, `Labs`, `Knowledge` | `Telemetry` |
| `Robot` | Existe en ORM+migrations | `IoT Context` | `Telemetry`, `Labs` | `IoT` |
| `RobotTelemetry` | Existe en ORM+migrations | `Telemetry Context` | `IoT`, `Labs`, `AI` | `Telemetry` |
| `RobotCommand` | Existe en ORM+migrations | `IoT Context` | `Labs` | `IoT` |
| `auth_user` | Existe en SQL | `Identity Context` transicional | `Labs`, `Telemetry`, `AI` | `Identity` |
| `auth_group` / `auth_permission` | Existe en SQL | `Identity Context` transicional | `Labs`, `Deployment` | `Identity` |
| `Prediction` | Falta | `AI Context` | `Labs`, `Telemetry`, `Knowledge` | `AI` |
| `Recommendation` | Falta | `AI Context` | `Labs`, `Voice`, `Frontend` | `AI` |
| `ModelDescriptor` | Falta | `AI Context` | `Knowledge`, `Deployment` | `AI` |
| `Device` | Falta | `IoT Context` | `Telemetry`, `Deployment` | `IoT` |
| `Sensor` | Falta | `IoT Context` | `Telemetry` | `IoT` |
| `LabSession` | Falta | `Labs Context` | `Identity`, `AI`, `Telemetry` | `Labs` |
| `Environment` | Falta | `Deployment Context` | `IoT`, `AI`, `Telemetry` | `Deployment` |
| `Taxonomy` | Falta | `Knowledge Context` | `AI`, `Identity`, `Labs` | `Knowledge` |

## 8. Ownership de entidades

### Ownership actual

- `SensorReading`: de hecho opera como `Telemetry`
- `Robot`: semánticamente pertenece a `IoT`
- `RobotTelemetry`: semánticamente pertenece a `Telemetry`
- `RobotCommand`: semánticamente pertenece a `IoT`
- `auth_*` y `django_*`: pertenecen a infraestructura Django, aunque `auth_*` sirven de soporte transicional a `Identity`

### Ownership objetivo EIARC

- `Telemetry` posee eventos, lecturas y snapshots
- `IoT` posee dispositivos, robots, sensores y nodos físicos
- `AI` posee predicciones, inferencias, recomendaciones y metadatos de modelo
- `Identity` posee actores, roles y capacidades
- `Labs` posee sesiones y estados de simulación
- `Deployment` posee entornos, topologías y placement
- `Knowledge` posee taxonomías y artefactos canónicos

## 9. Agregados recomendados

### Agregado 1: SensorReading Aggregate

- raíz: `SensorReading`
- contexto: `Telemetry`
- observación: hoy es un agregado muy pobre; debería evolucionar para relacionarse con `Device`/`Sensor`

### Agregado 2: Robot Aggregate

- raíz: `Robot`
- contexto: `IoT`
- entidades relacionadas: `RobotCommand` por referencia
- observación: no debería absorber la telemetría histórica como colección interna completa

### Agregado 3: RobotTelemetry Aggregate

- raíz: `RobotTelemetry`
- contexto: `Telemetry`
- relación: referencia a `Robot`
- observación: separar telemetría de la entidad dispositivo reduce acoplamiento temporal

### Agregado 4: IdentityAccess Aggregate

- raíz transicional: `auth_user`
- contexto: `Identity`
- entidades relacionadas: grupos y permisos
- observación: es un agregado de infraestructura, no el agregado canónico final EIARC

### Agregados faltantes

- `Prediction Aggregate`
- `Recommendation Aggregate`
- `Device Aggregate`
- `LabSession Aggregate`
- `Environment Aggregate`
- `Taxonomy Aggregate`

## 10. Riesgos

1. **Seguir tratando `schema_postgresql.sql` como verdad principal**
   - riesgo de consolidar un modelo más viejo que el realmente implementado en backend

2. **Confundir tablas framework con dominio canónico**
   - riesgo de diseñar EIARC alrededor de artefactos técnicos de Django

3. **Persistir sin contexts**
   - riesgo de seguir agregando tablas sin ownership claro

4. **Introducir entidades AI sin contrato semántico**
   - riesgo de que el modelo de datos repita la ambigüedad ya detectada en IA

5. **No separar IoT de Telemetry**
   - riesgo de mezclar dispositivo, comando y evento como si fueran el mismo agregado

## 11. Estrategia de transición

### Etapa 1

Reconocer el estado actual como:

- `schema_postgresql.sql` = snapshot histórico desactualizado
- `models.py` = vista de código actual
- `migrations/` = secuencia ejecutable del esquema actual del backend

### Etapa 2

Establecer modelo transicional:

- `SensorReading`
- `Robot`
- `RobotTelemetry`
- `RobotCommand`
- `auth_user` y `auth_*` como soporte transicional de identidad

### Etapa 3

Introducir modelo canónico EIARC por contexts antes de crecer el esquema operativo:

- `Device`
- `Prediction`
- `Recommendation`
- `LabSession`
- `Environment`
- `Taxonomy`

### Etapa 4

Sincronizar artefactos:

- regenerar `schema_postgresql.sql` desde el esquema vigente
- alinear ERD oficial
- alinear documentación de datos y ownership contextual

## 12. Recomendaciones

1. **Adoptar las migraciones como fuente de verdad recomendada del esquema**
2. **Tratar `models.py` como fuente semántica de la capa ORM, no como autoridad única**
3. **Tratar `schema_postgresql.sql` como snapshot publicable, no como verdad primaria, hasta que se regenere**
4. **No considerar `django_*` como entidades canónicas del dominio EIARC**
5. **Introducir ownership por contexto antes de añadir nuevas tablas**
6. **Diseñar entidades AI solo después de fijar por completo el contrato semántico**
7. **Separar explícitamente IoT, Telemetry e Identity en el modelo futuro**

## 13. Fuente de verdad recomendada

### Recomendación clara

La **fuente de verdad recomendada** entre:

- `schema_postgresql.sql`
- `models.py`
- migraciones

es:

## **migraciones**

### Justificación

1. representan el historial ejecutable del esquema del backend
2. incluyen entidades más recientes que el dump SQL no contiene
3. permiten reconciliar `models.py` con evolución temporal verificable
4. el dump actual ya demostró estar desactualizado

### Orden recomendado de autoridad

1. **migraciones** como verdad primaria del esquema
2. **models.py** como verdad primaria de intención ORM actual
3. **schema_postgresql.sql** como snapshot derivado que debe regenerarse

## Conclusiones

- Hoy existen realmente cuatro entidades de negocio en backend: `SensorReading`, `Robot`, `RobotTelemetry` y `RobotCommand`, más tablas framework de Django.
- No se observan duplicados físicos de entidades de negocio; la duplicación es de autoridad documental y de sincronización entre artefactos.
- Faltan entidades críticas para `AI`, `Identity`, `Labs`, `IoT`, `Deployment` y `Knowledge` si el objetivo es EIARC.
- `SensorReading` y las tablas framework representan el núcleo más claramente legacy o transicional del estado actual.
- La transformación hacia EIARC requiere ownership por contexto, agregados explícitos y una decisión formal de fuente de verdad.
- Esa decisión, con la evidencia actual, debe ser: **migraciones**.
