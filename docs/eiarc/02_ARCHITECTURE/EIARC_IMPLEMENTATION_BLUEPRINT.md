# EIARC Implementation Blueprint

## Fecha

2026-07-12

## Versión

v1.0.0

## Objetivo

Mapear el código actual del repositorio hacia los Contextos EIARC y definir una hoja de implementación modular para FASE 5, identificando qué código pertenece a cada contexto, qué piezas están alineadas, qué piezas siguen siendo legacy, cuáles son las prioridades y cuál debe ser el orden exacto de migración.

## Referencias

- `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_DATA_MODEL.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_TRANSFORMATION_PLAN.md`
- `docs/project_knowledge_base/KB-001-TRAE-INDEPENDENT-REPOSITORY-AUDIT.md`
- `docs/project_knowledge_base/KB-004-AI-SEMANTIC-CONTRACT-AUDIT.md`
- `docs/project_knowledge_base/KB-005-EIARC-AI-CANONICAL-MODEL.md`
- `docs/project_knowledge_base/KB-006-PENDING-CHANGES-AUDIT.md`
- `docs/architect_master/02_SIGCTRURAL_CANONICAL_MODEL.md`
- `docs/architect_master/05_FINAL_ARCHITECTURE_BASELINE.md`

## Resumen ejecutivo

El repositorio actual no está implementado por Contextos EIARC; está organizado por tecnologías y por fases de refactorización. Aun así, ya existen núcleos claros que pueden mapearse así:

- `Telemetry Context`: el núcleo más maduro del backend modular
- `AI Context`: existente pero semánticamente desalineado
- `Labs Context`: muy amplio en frontend, con fuerte presencia demo/simulación
- `Knowledge Context`: muy fuerte en documentación, casi inexistente como slice de aplicación
- `Identity Context`: débil y parcialmente mockeado
- `IoT Context`: parcialmente modelado en backend, muy incompleto en edge real
- `Deployment Context`: existente como Compose y Dockerfiles, pero todavía híbrido y no gobernado por contextos

Conclusión principal para FASE 5:

- el **primer contexto a implementar en código debe ser `Telemetry Context`**
- no porque sea el más “importante” conceptualmente, sino porque es el que ya posee:
  - entidad de dominio
  - puertos
  - repositorio
  - mapper
  - adaptador Django
  - endpoints V3
  - consumidores directos en frontend

Eso lo convierte en el mejor punto de entrada para una implementación modular de bajo riesgo relativo.

## 1. Estado actual de implementación

El repositorio muestra cuatro estratos simultáneos:

1. **legacy acoplado a Django ORM**
   - `src/backend/api/models.py`
   - `src/backend/api/views.py`
   - `src/backend/api/serializers.py`
   - `src/backend/api/logic/**`

2. **núcleo hexagonal parcial**
   - `src/backend/core/**`
   - `src/backend/infrastructure/**`

3. **microservicio IA independiente**
   - `src/ai_models/**`

4. **frontend React con fuerte mezcla entre UX real, simulación y documentación embebida**
   - `src/frontend/src/**`

Esto significa que FASE 5 no puede ser una migración “por carpetas”; debe ser una migración por bounded slices de comportamiento.

## 2. Mapa código actual -> Contextos EIARC

## 2.1 AI Context

### Código principal

- `src/ai_models/fastapi_app.py`
- `src/ai_models/production_models/model_metadata.json`
- `src/ai_models/train_plant_disease_mobilenet.py`
- `src/ai_models/conversation_context.py`
- `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`
- `src/backend/core/ports/services/ai_service_port.py`
- `src/backend/api/logic/adapters/ai_service.py`
- `src/backend/api/logic/ports/ai_service.py`
- `src/frontend/src/pages/AIPredictiva.jsx`
- `src/frontend/src/components/VoiceAssistant.jsx`
- `src/frontend/src/pages/DataScienceLab.jsx`

### Estado

- **parcialmente alineado**

### Motivo

- existe servicio dedicado de inferencia
- existen adaptadores backend hacia FastAPI
- existen consumidores frontend
- pero no existe contrato semántico único
- conviven `class_N`, fallback, mock y expectativas semánticas distintas

### Código legacy o problemático

- `src/backend/api/logic/adapters/ai_service.py`
- `src/backend/api/logic/ports/ai_service.py`
- el contrato implícito en `src/frontend/src/pages/AIPredictiva.jsx`
- la salida técnica en `src/ai_models/fastapi_app.py`

### Código más alineado con EIARC

- `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`
- `src/backend/core/ports/services/ai_service_port.py`
- la existencia del microservicio dedicado `src/ai_models/fastapi_app.py`

## 2.2 Telemetry Context

### Código principal

- `src/backend/api/models.py` (`SensorReading`, `RobotTelemetry`)
- `src/backend/api/views.py` (`TelemetryHistoryView`, `TelemetryHistoryV2View`, `TelemetryHistoryV3View`)
- `src/backend/api/serializers.py`
- `src/backend/core/domain/entities/sensor_reading.py`
- `src/backend/core/domain/value_objects/*`
- `src/backend/core/ports/repositories/sensor_reading_repository.py`
- `src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py`
- `src/backend/infrastructure/persistence/django/mappers/sensor_reading_mapper.py`
- `src/backend/infrastructure/persistence/in_memory/in_memory_sensor_reading_repository.py`
- `src/backend/infrastructure/config/dependencies.py`
- `src/frontend/src/components/TelemetryPanel.jsx`
- `src/frontend/src/components/Telemetry3DScene.jsx`
- `src/frontend/src/services/cloud.js`
- `src/frontend/src/pages/Dashboard.jsx`
- `src/frontend/src/hooks/useRoboticsApi.js`

### Estado

- **el más alineado**

### Motivo

- ya existe entidad de dominio canónica (`SensorReading`)
- ya existen puertos y adaptadores
- ya existen endpoints V3
- ya existen consumidores frontend explícitos
- la telemetría funciona como puente natural entre IoT, AI y Labs

### Código legacy o problemático

- `src/backend/api/views.py` todavía mezcla V1, V2 y V3 en el mismo archivo
- `src/frontend/src/components/TelemetryPanel.jsx` usa simulación pura local
- `src/frontend/src/services/cloud.js` consume OpenMeteo y health remotos, no telemetría canónica del backend

### Código más alineado con EIARC

- `src/backend/core/domain/entities/sensor_reading.py`
- `src/backend/core/ports/repositories/sensor_reading_repository.py`
- `src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py`
- `src/backend/infrastructure/config/dependencies.py`

## 2.3 Labs Context

### Código principal

- `src/frontend/src/pages/LabCatalog.jsx`
- `src/frontend/src/stores/useLabStore.js`
- `src/frontend/src/labs/AdvancedMathLab.jsx`
- `src/frontend/src/labs/AdvancedMathLabV2.jsx`
- `src/frontend/src/labs/RoboticsLab.jsx`
- `src/frontend/src/labs/EmbeddedLab.jsx`
- `src/frontend/src/labs/TelecomLab.jsx`
- `src/frontend/src/labs/ElectronicsLab.jsx`
- `src/frontend/src/labs/SchematicEditor.jsx`
- `src/backend/core/domain/services/lab_service.py`
- `src/backend/core/domain/strategies/*`
- `src/backend/core/domain/factories/lab_factory.py`
- `src/backend/api/logic/domain/*`
- `src/backend/api/logic/domain/services.py`

### Estado

- **funcional pero heterogéneo**

### Motivo

- el frontend de laboratorios es extenso
- existe una noción de servicio/estrategias de laboratorio en backend
- pero la organización mezcla experiencias educativas, simulación, fuentes externas y lógica de dominio

### Código legacy o problemático

- `src/backend/api/logic/domain/*`
- `src/backend/api/logic/domain/services.py`
- buena parte de `src/frontend/src/labs/*` opera como isla funcional sin contrato de contexto explícito

### Código más alineado con EIARC

- `src/backend/core/domain/services/lab_service.py`
- `src/backend/core/domain/strategies/*`
- `src/frontend/src/stores/useLabStore.js`

## 2.4 Knowledge Context

### Código principal

- `docs/architect_master/**`
- `docs/project_knowledge_base/**`
- `docs/eiarc/**`
- `src/frontend/src/pages/DocsMasterdoc.jsx`
- `src/frontend/src/pages/DocsReadme.jsx`
- `src/frontend/src/pages/DocsPlanMaestro.jsx`
- `src/frontend/src/pages/DocsEdgeSetup.jsx`
- `src/frontend/src/pages/DocsApiReference.jsx`

### Estado

- **muy fuerte documentalmente, casi no implementado como contexto de aplicación**

### Motivo

- existe abundante gobierno documental
- existe visualización en frontend de documentación remota
- pero no hay un slice de aplicación que gestione taxonomías, truth sources o knowledge registry

### Código legacy o problemático

- páginas frontend que renderizan documentación remota desde GitHub en vez de consumir una fuente canónica interna

### Código más alineado con EIARC

- `docs/eiarc/**`
- `docs/project_knowledge_base/**`

## 2.5 Identity Context

### Código principal

- `src/frontend/src/auth/AuthContext.jsx`
- `src/frontend/src/components/AuthGuard.jsx`
- `src/frontend/src/components/LoginModal.jsx`
- `src/frontend/src/pages/Login.jsx`
- `src/frontend/src/pages/Register.jsx`
- `src/backend/sigct_backend/settings.py` por el uso de `django.contrib.auth`
- tablas `auth_*` y `users` como soporte técnico

### Estado

- **débil y mayormente mockeado**

### Motivo

- existe una intención de autenticación en frontend
- el backend usa auth de Django
- pero no existen endpoints reales `/api/auth/*`
- el login cae a demo-token o a modal mock

### Código legacy o problemático

- `src/frontend/src/components/LoginModal.jsx`
- `src/frontend/src/auth/AuthContext.jsx`
- `src/frontend/src/pages/Login.jsx`
- `src/frontend/src/pages/Register.jsx`

### Código más alineado con EIARC

- `src/frontend/src/components/AuthGuard.jsx` como intención de boundary
- soporte técnico de Django auth en `src/backend/sigct_backend/settings.py`

## 2.6 IoT Context

### Código principal

- `src/backend/api/models.py` (`Robot`, `RobotCommand`)
- `src/backend/api/views.py` (`RobotViewSet`, `RobotCommandViewSet`)
- `src/backend/api/serializers.py`
- `src/frontend/src/hooks/useRoboticsApi.js`
- `src/frontend/src/labs/RoboticsLab.jsx`
- `src/embedded/bbb_01_gateway/mqtt_broker.py`
- `src/embedded/bbb_02_ia_edge/tflite_api.py`
- `src/embedded/bbb_03_sensors/sensor_reader.py`
- `scripts/physics_sim.py`
- `scripts/newton_bridge.py`

### Estado

- **parcial y muy mezclado entre realidad, simulación y placeholder**

### Motivo

- existen modelos y endpoints de robots/comandos
- existe consumidor de telemetría robótica en frontend
- los artefactos `embedded` están vacíos
- el puente Newton y el simulador son scripts conceptuales de desarrollo

### Código legacy o problemático

- `src/embedded/**` vacío
- `scripts/physics_sim.py`
- `scripts/newton_bridge.py`
- consumo frontend de telemetría sin contrato IoT explícito

### Código más alineado con EIARC

- `src/backend/api/models.py` para `Robot` y `RobotCommand`
- `src/backend/api/serializers.py`

## 2.7 Deployment Context

### Código principal

- `docker-compose.yml`
- `src/backend/Dockerfile`
- `src/frontend/Dockerfile`
- `src/ai_models/Dockerfile`
- `src/backend/sigct_backend/settings.py`
- `scripts/*` relacionados con generación/soporte

### Estado

- **existente pero no canónico**

### Motivo

- hay topología Compose real
- hay contenedores separados para backend, frontend e IA
- persisten residuos (`db-mysql`)
- el runtime sigue mezclando defaults inseguros y entorno local

### Código legacy o problemático

- `docker-compose.yml` por la convivencia de `db-mysql`
- `src/backend/sigct_backend/settings.py` por `DEBUG=True`, `ALLOWED_HOSTS=['*']` y CORS abierto

### Código más alineado con EIARC

- existencia de servicios separados y parametrización de puertos en `docker-compose.yml`
- separación de Dockerfiles por capacidad

## 3. Código alineado vs código legacy

## 3.1 Código más alineado con EIARC

### Backend modular

- `src/backend/core/domain/entities/sensor_reading.py`
- `src/backend/core/domain/services/lab_service.py`
- `src/backend/core/ports/repositories/sensor_reading_repository.py`
- `src/backend/core/ports/services/ai_service_port.py`
- `src/backend/infrastructure/config/dependencies.py`
- `src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py`
- `src/backend/infrastructure/persistence/django/mappers/sensor_reading_mapper.py`
- `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`

### IA

- `src/ai_models/fastapi_app.py` como servicio separado
- `src/ai_models/production_models/*`

### Conocimiento

- `docs/eiarc/**`
- `docs/project_knowledge_base/**`

## 3.2 Código claramente legacy o transicional

- `src/backend/api/views.py`
- `src/backend/api/logic/**`
- `src/frontend/src/components/TelemetryPanel.jsx`
- `src/frontend/src/services/cloud.js`
- `src/frontend/src/auth/AuthContext.jsx`
- `src/frontend/src/components/LoginModal.jsx`
- `src/embedded/**`
- `scripts/physics_sim.py`
- `scripts/newton_bridge.py`

## 4. Prioridades de implementación

### Prioridad 1

`Telemetry Context`

Razón:

- ya tiene slice backend casi separable
- es consumido por Dashboard, Labs e IA
- es el punto menos ambiguo para empezar modularización real

### Prioridad 2

`AI Context`

Razón:

- es el contexto con mayor impacto semántico
- hoy es funcional pero desalineado
- depende de telemetría e integra hacia Labs

### Prioridad 3

`Labs Context`

Razón:

- es el mayor consumidor de Telemetry e AI
- hoy concentra mucha experiencia, pero muy dispersa

### Prioridad 4

`Identity Context`

Razón:

- es importante, pero hoy casi todo está en modo mock
- conviene tratarlo después de estabilizar flujos de negocio

### Prioridad 5

`IoT Context`

Razón:

- el código real aún es parcial
- necesita primero Telemetry y Deployment más claros

### Prioridad 6

`Deployment Context`

Razón:

- debe consolidarse sobre slices ya más claros
- si se fija demasiado pronto, se corre el riesgo de congelar la topología híbrida actual

### Prioridad 7

`Knowledge Context` en código

Razón:

- ya existe como gobierno documental
- su implementación en aplicación puede esperar; hoy no es el cuello de botella técnico de FASE 5

## 5. Orden exacto recomendado de migración

1. extraer y estabilizar `Telemetry Context` en backend
2. alinear consumidores frontend de telemetría con ese contrato
3. desacoplar `AI Context` del contrato actual `class_N`
4. mover integración IA del frontend y backend a contrato semántico único
5. reorganizar `Labs Context` para que consuma `Telemetry` y `AI` como contexts, no como utilidades dispersas
6. retirar gradualmente `api/logic/**`
7. formalizar `Identity Context` y eliminar fallback de autenticación demo
8. consolidar `IoT Context` sobre entidades y comandos reales
9. alinear `Deployment Context` con la nueva segmentación
10. dejar `Knowledge Context` como gobierno continuo y no como último parche documental

## 6. Orden exacto recomendado por archivos para iniciar FASE 5

### Primer corte: Telemetry Context

#### Backend

1. `src/backend/api/views.py`
2. `src/backend/api/urls.py`
3. `src/backend/api/models.py`
4. `src/backend/api/serializers.py`
5. `src/backend/infrastructure/config/dependencies.py`
6. `src/backend/infrastructure/persistence/django/repositories/django_sensor_reading_repository.py`
7. `src/backend/infrastructure/persistence/django/mappers/sensor_reading_mapper.py`
8. `src/backend/core/domain/entities/sensor_reading.py`
9. `src/backend/core/ports/repositories/sensor_reading_repository.py`

#### Frontend consumidor inmediato

10. `src/frontend/src/components/TelemetryPanel.jsx`
11. `src/frontend/src/pages/Dashboard.jsx`
12. `src/frontend/src/services/cloud.js`
13. `src/frontend/src/hooks/useRoboticsApi.js`
14. `src/frontend/src/components/Telemetry3DScene.jsx`

### Segundo corte: AI Context

15. `src/ai_models/fastapi_app.py`
16. `src/ai_models/production_models/model_metadata.json`
17. `src/backend/infrastructure/external/ai_service/fastapi_ai_adapter.py`
18. `src/backend/core/ports/services/ai_service_port.py`
19. `src/frontend/src/pages/AIPredictiva.jsx`
20. `src/frontend/src/components/VoiceAssistant.jsx`
21. `src/frontend/src/pages/DataScienceLab.jsx`

### Tercer corte: Labs Context

22. `src/backend/core/domain/services/lab_service.py`
23. `src/backend/core/domain/strategies/*`
24. `src/frontend/src/pages/LabCatalog.jsx`
25. `src/frontend/src/stores/useLabStore.js`
26. `src/frontend/src/labs/*`

### Cuarto corte: Identity Context

27. `src/frontend/src/auth/AuthContext.jsx`
28. `src/frontend/src/components/AuthGuard.jsx`
29. `src/frontend/src/components/LoginModal.jsx`
30. `src/frontend/src/pages/Login.jsx`
31. `src/frontend/src/pages/Register.jsx`
32. `src/backend/sigct_backend/urls.py`
33. `src/backend/sigct_backend/settings.py`

### Quinto corte: IoT + Deployment

34. `src/backend/api/models.py` (slice `Robot` / `RobotCommand`)
35. `src/backend/api/views.py` (slice robótica)
36. `src/embedded/**`
37. `scripts/physics_sim.py`
38. `scripts/newton_bridge.py`
39. `docker-compose.yml`
40. `src/backend/Dockerfile`
41. `src/ai_models/Dockerfile`
42. `src/frontend/Dockerfile`

## 7. Riesgo y complejidad por contexto

| Contexto | Riesgo | Complejidad | Comentario |
|---|---|---|---|
| `Telemetry` | Medio | Media | Es el más maduro; el mayor riesgo es romper consumidores legacy al separar V1/V2/V3 |
| `AI` | Alto | Alta | Tiene el mayor drift semántico del repositorio |
| `Labs` | Medio-Alto | Alta | Gran superficie frontend y mucha simulación dispersa |
| `Identity` | Medio | Media | La mayor parte está mockeada; requiere definir contrato real |
| `IoT` | Alto | Alta | Hay poca implementación real y mucha intención |
| `Deployment` | Medio-Alto | Media-Alta | Existe topología, pero no está gobernada por contexts |
| `Knowledge` | Bajo | Baja | Ya está fuerte como documentación |

## 8. Recomendación para iniciar FASE 5

### Recomendación concreta

Iniciar FASE 5 con un **vertical slice de `Telemetry Context`**, no con AI ni con auth.

### Qué significa eso

- tomar un único flujo: lectura de sensores / telemetría histórica / consumo en dashboard
- consolidarlo en V3 como ruta oficial
- dejar V1/V2 como compatibilidad temporal, pero ya no como centro del sistema

### Por qué este inicio es el correcto

1. es el slice más maduro del backend modular
2. es compartido por Dashboard, Labs e IA
3. reduce riesgo comparado con empezar por auth o por el contrato semántico IA
4. crea una base observable para seguir con `AI Context`

### Qué no conviene hacer primero

- no empezar por `Identity Context`, porque hoy está demasiado mockeado
- no empezar por `IoT Context`, porque aún carece de implementación edge verificable
- no empezar por `Deployment Context`, porque consolidaría una topología todavía híbrida

## 9. Blueprint de implementación inicial

### Iteración 1

Consolidar `Telemetry Context`:

- definir endpoint oficial de telemetría
- hacer que Dashboard y paneles consuman ese endpoint
- reducir simulación local en `TelemetryPanel.jsx`

### Iteración 2

Conectar `AI Context` a telemetría ya estabilizada:

- alinear adaptadores backend
- alinear `AIPredictiva.jsx`
- eliminar dependencia conceptual de `class_N`

### Iteración 3

Reorganizar `Labs Context` como consumidor de contexts:

- laboratorios dejan de llamar utilidades dispersas y pasan a depender de contexts explícitos

## Conclusiones

- El repositorio actual ya contiene semillas reales de implementación por contextos, pero siguen mezcladas con legacy, mocks y slices técnicos.
- `Telemetry Context` es el mejor punto de entrada para FASE 5 porque combina madurez, valor transversal y riesgo controlable.
- `AI Context` es el siguiente contexto crítico, pero necesita apoyarse primero sobre telemetría y contrato estable.
- `Labs Context` debe reorganizarse después de estabilizar `Telemetry` y `AI`, no antes.
- La modularización EIARC debe ejecutarse por slices de comportamiento, no por renombre de carpetas ni por reorganización superficial del repo.
