# EIARC Transformation Plan

## Fecha

2026-07-12

## Versión

v1.0.0

## Objetivo

Definir formalmente cómo SIGCT-Rural debe transformarse en EIARC, partiendo del estado real auditado del repositorio y estableciendo un plan de evolución controlada, por fases, prioridades y dependencias, sin romper la continuidad operativa ni el significado de negocio.

## Referencias

- `docs/eiarc/01_FOUNDATION/EIARC_VISION.md`
- `docs/eiarc/01_FOUNDATION/EIARC_MISSION.md`
- `docs/eiarc/01_FOUNDATION/EIARC_SCOPE.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_CANONICAL_PRINCIPLES.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_CONTEXTS.md`
- `docs/eiarc/02_ARCHITECTURE/EIARC_AI_SEMANTIC_CONTRACT.md`
- `docs/project_knowledge_base/KB-001-TRAE-INDEPENDENT-REPOSITORY-AUDIT.md`
- `docs/project_knowledge_base/KB-004-AI-SEMANTIC-CONTRACT-AUDIT.md`
- `docs/project_knowledge_base/KB-005-EIARC-AI-CANONICAL-MODEL.md`
- `docs/project_knowledge_base/KB-006-PENDING-CHANGES-AUDIT.md`
- `docs/architect_master/02_SIGCTRURAL_CANONICAL_MODEL.md`
- `docs/architect_master/05_FINAL_ARCHITECTURE_BASELINE.md`

## 1. Estado actual del proyecto

SIGCT-Rural se encuentra en un estado de transición intermedia:

- monorepo híbrido con backend Django/DRF, frontend React/Vite, microservicio FastAPI de IA y área edge documentada
- arquitectura parcialmente hexagonal con coexistencia de capas legacy, V2 y V3
- frontend funcional pero con zonas de simulación, fallback y contratos no plenamente alineados
- servicio IA operativo a nivel técnico, pero sin contrato semántico único
- despliegue principal por Docker Compose, con brechas entre realidad operativa y documentación cloud/edge
- documentación extensa, pero con desalineación parcial frente al código real

Diagnóstico sintetizado:

- **fortalezas**: backend funcional, frontend rico, microservicio IA existente, base documental amplia
- **debilidades**: contratos semánticos inconsistentes, edge no operativo, legacy no encapsulado, testing aún no formalizado por capas
- **riesgo transversal**: coexistencia de varias “verdades” entre código, README, docs históricas y arquitectura objetivo

## 2. Estado objetivo EIARC

EIARC debe ser el marco arquitectónico que gobierne la evolución de SIGCT-Rural hacia un sistema:

- organizado por contextos
- gobernado por contratos semánticos versionados
- desacoplado de detalles internos de implementación
- compatible entre cloud y edge
- preparado para múltiples modelos de IA y múltiples dominios productivos
- soportado por una base de conocimiento trazable y canónica

Estado objetivo resumido:

- SIGCT-Rural pasa a ser una solución de dominio construida sobre EIARC
- EIARC pasa a ser la autoridad arquitectónica sobre contextos, contratos, datos, despliegue y evolución

## 3. Brechas arquitectónicas existentes

### 3.1 Brechas de conocimiento

- no existe todavía una única cadena formal entre auditoría, principios, contratos, roadmap y ejecución
- persisten documentos aspiracionales que compiten con la realidad del código

### 3.2 Brechas de contextos

- los contextos ya están definidos documentalmente, pero no gobiernan aún el layout real del sistema
- módulos técnicos y bounded contexts todavía no coinciden de forma estable

### 3.3 Brechas de IA

- el ecosistema IA no comparte una semántica única
- coexisten `class_N`, `enferma/sana`, etiquetas agrícolas del frontend y narrativa ampliada del README

### 3.4 Brechas de datos

- hay drift entre `schema_postgresql.sql`, modelos ORM, migraciones y diagramas
- no existe todavía un modelo canónico de datos alineado con contextos

### 3.5 Brechas de implementación

- coexisten V1/V2/V3 y adaptadores legacy con rutas de composición aún incompletas
- la estrategia de tests no está completamente asentada por capa y propósito

### 3.6 Brechas cloud/edge

- edge aparece ampliamente documentado, pero no existe como despliegue reproducible y verificable
- la equivalencia semántica cloud/edge sigue siendo aspiracional

## 4. Roadmap de transformación

La transformación propuesta se divide en siete fases consecutivas, con solapamiento controlado y dependencias explícitas.

### Tabla de fases

| Fase | Nombre | Tiempo estimado relativo | Impacto | Complejidad | Riesgo |
|---|---|---:|---|---|---|
| 1 | Consolidación del conocimiento | Corto | Muy alto | Baja | Bajo |
| 2 | Consolidación de contextos | Corto-Medio | Muy alto | Media | Medio |
| 3 | Contrato semántico IA | Medio | Muy alto | Media-Alta | Medio |
| 4 | Modelo canónico de datos | Medio | Alto | Alta | Medio-Alto |
| 5 | Implementación modular | Medio-Largo | Muy alto | Alta | Alto |
| 6 | Arquitectura Cloud/Edge | Largo | Alto | Alta | Alto |
| 7 | EIARC Operativo | Largo | Muy alto | Alta | Medio-Alto |

## 5. Fases de implementación

## FASE 1

### Consolidación del conocimiento

**Objetivo**  
Convertir la documentación ya generada en la base oficial de transformación.

**Resultados esperados**

- línea base arquitectónica EIARC consistente
- trazabilidad entre auditoría, diagnóstico, principios, contratos y diagramas
- separación clara entre AS-IS y TO-BE

**Entregables clave**

- knowledge base consolidada
- catálogo de documentos canónicos
- matriz de dependencias arquitectónicas

**Tiempo estimado relativo**  
Corto

**Impacto**  
Muy alto

**Complejidad**  
Baja

**Riesgo**  
Bajo

## FASE 2

### Consolidación de contextos

**Objetivo**  
Pasar de una lectura por módulos técnicos a una lectura gobernada por contextos EIARC.

**Resultados esperados**

- mapeo SIGCT-Rural -> contexts EIARC
- delimitación inicial de responsabilidades por contexto
- priorización de contextos críticos: Knowledge, AI, Telemetry, Deployment

**Entregables clave**

- mapas de contexto oficiales
- inventario de responsabilidades por contexto
- backlog de migración de módulos a contextos

**Tiempo estimado relativo**  
Corto-Medio

**Impacto**  
Muy alto

**Complejidad**  
Media

**Riesgo**  
Medio

## FASE 3

### Contrato semántico IA

**Objetivo**  
Establecer una única verdad semántica para IA y eliminar la dependencia de `class_index` y contratos implícitos.

**Resultados esperados**

- taxonomía canónica de predicciones
- contrato oficial versionado
- estrategia de compatibilidad cloud/edge/fallback/mock

**Entregables clave**

- semantic registry inicial
- catálogo de `prediction_code`
- reglas de compatibilidad y versionado

**Tiempo estimado relativo**  
Medio

**Impacto**  
Muy alto

**Complejidad**  
Media-Alta

**Riesgo**  
Medio

## FASE 4

### Modelo canónico de datos

**Objetivo**  
Alinear persistencia, diagramas, contexto y semántica operativa bajo un modelo de datos canónico.

**Resultados esperados**

- reconciliación entre ORM, `schema_postgresql.sql` y ERD
- clasificación de entidades por contexto
- definición de ownership y límites de agregados

**Entregables clave**

- canonical data model
- matriz entidad-contexto
- baseline de compatibilidad entre datos legacy y canónicos

**Tiempo estimado relativo**  
Medio

**Impacto**  
Alto

**Complejidad**  
Alta

**Riesgo**  
Medio-Alto

## FASE 5

### Implementación modular

**Objetivo**  
Traducir contexts y contratos a una implementación modular real en backend, integraciones y puntos de entrada.

**Resultados esperados**

- legacy encapsulado o retirado gradualmente
- composition root más robusto
- pruebas organizadas por capa y propósito
- adaptadores finos y contratos explícitos

**Entregables clave**

- plan de retirada V1/V2
- slices o módulos por contexto
- estrategia de pruebas por dominio, integración y contrato

**Tiempo estimado relativo**  
Medio-Largo

**Impacto**  
Muy alto

**Complejidad**  
Alta

**Riesgo**  
Alto

## FASE 6

### Arquitectura Cloud/Edge

**Objetivo**  
Formalizar la topología futura de EIARC y cerrar la brecha entre edge documentado y edge verificable.

**Resultados esperados**

- patrón oficial de despliegue cloud/edge
- responsabilidades por entorno
- equivalencia semántica entre inferencia cloud y edge

**Entregables clave**

- topology baseline cloud/edge
- policy de source modes
- estrategia de sincronización y observabilidad edge

**Tiempo estimado relativo**  
Largo

**Impacto**  
Alto

**Complejidad**  
Alta

**Riesgo**  
Alto

## FASE 7

### EIARC Operativo

**Objetivo**  
Consolidar EIARC como arquitectura viva, operativa, gobernada y sostenible.

**Resultados esperados**

- EIARC usado como referencia real de decisiones
- gobierno continuo de conocimiento, contratos, datos y despliegue
- SIGCT-Rural operando como consumidor estable de EIARC

**Entregables clave**

- baseline operativa EIARC
- tablero de madurez arquitectónica
- política de evolución controlada

**Tiempo estimado relativo**  
Largo

**Impacto**  
Muy alto

**Complejidad**  
Alta

**Riesgo**  
Medio-Alto

## 6. Prioridades

### Prioridad 1

Knowledge, AI semantic contract y contexts.

Justificación:

- sin estas tres piezas, cualquier modularización corre el riesgo de codificar incoherencias actuales

### Prioridad 2

Canonical data model y baseline de despliegue.

Justificación:

- permiten que contexts y contratos se sostengan sobre persistencia y topología reales

### Prioridad 3

Modularización real y estrategia cloud/edge.

Justificación:

- son fases de alto impacto, pero requieren definición previa para no producir más deuda estructural

## 7. Riesgos

### Riesgos principales

1. **Codificar antes de consolidar conocimiento**
   - riesgo de trasladar inconsistencias actuales a una nueva estructura

2. **Modularizar por carpetas y no por contextos**
   - riesgo de renombrar el problema sin resolverlo

3. **Tratar el contrato IA como detalle técnico**
   - riesgo de perpetuar desacoplamiento débil entre frontend, FastAPI y modelos

4. **Diseñar cloud/edge sin source of truth semántica**
   - riesgo de divergencia funcional entre entornos

5. **Mantener legacy sin criterio de salida**
   - riesgo de congelar la transición en un estado híbrido permanente

6. **No separar estrategia de tests por capa**
   - riesgo de contaminar pruebas de dominio con bootstrap global innecesario

## 8. Dependencias

### Dependencias estructurales

- base de conocimiento canónica
- context map oficial
- contrato semántico IA versionado
- baseline oficial de datos
- baseline oficial de despliegue cloud/edge

### Dependencias de orden

- FASE 2 depende de FASE 1
- FASE 3 depende de FASE 1 y FASE 2
- FASE 4 depende de FASE 2 y FASE 3
- FASE 5 depende de FASE 2, FASE 3 y FASE 4
- FASE 6 depende de FASE 3, FASE 4 y FASE 5
- FASE 7 depende de todas las anteriores

## 9. Quick Wins

1. declarar formalmente el set de documentos canónicos EIARC y su jerarquía
2. cerrar el vocabulario oficial de contexts y usarlo de forma consistente
3. consolidar el contrato semántico IA como referencia oficial única
4. etiquetar explícitamente qué piezas son AS-IS, TO-BE y legacy
5. priorizar la reconciliación entre diagramas de despliegue y `docker-compose.yml`
6. separar documentalmente pruebas de dominio, integración y contrato

## 10. Orden exacto recomendado

1. consolidar la base de conocimiento existente como fuente oficial de transformación
2. fijar el contexto `Knowledge` como autoridad transversal
3. estabilizar el lenguaje oficial de contexts EIARC
4. mapear SIGCT-Rural actual a esos contexts
5. formalizar el contrato semántico único de IA
6. definir la taxonomía inicial de predicciones y compatibilidad
7. reconciliar el modelo de datos con contexts y contratos
8. definir ownership de entidades y límites de agregados
9. diseñar el plan de retiro controlado de V1/V2 y adapters legacy
10. organizar la implementación modular por contexto
11. fijar la estrategia oficial de testing por capa
12. definir la topología cloud/edge objetivo
13. alinear `source_mode`, despliegue y observabilidad
14. establecer baseline operativa de EIARC
15. gobernar la evolución continua mediante conocimiento, contratos y métricas de madurez

## Lectura ejecutiva

SIGCT-Rural no debe transformarse en EIARC mediante un salto directo de código.  
Debe hacerlo en este orden:

- primero conocimiento
- después contexts
- luego semántica
- después datos
- luego modularización
- y solo entonces topología cloud/edge y operación completa

Ese orden reduce el riesgo de reconstruir el sistema sobre contratos ambiguos o sobre una documentación que no gobierna la realidad.

## Conclusiones

- EIARC no es un cambio de nombre ni una reorganización de carpetas; es una transformación de gobierno arquitectónico.
- La transformación debe iniciar por conocimiento y contextos, no por refactorización mecánica.
- El contrato semántico IA es el pivote más crítico para pasar de SIGCT-Rural actual a un EIARC coherente.
- El éxito del plan depende de mantener el principio de evolución controlada: convivir con el estado actual mientras se reduce gradualmente su ambigüedad.
