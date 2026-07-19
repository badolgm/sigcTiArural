# PRESENTACION SUSTENTACION

## 1. Propósito

Este documento organiza una sustentación técnica y académica completa para SIGC&T Rural como Proyecto Productivo ADSO. Está redactado como guion listo para exposición, revisión docente y defensa oral.

## 2. Datos de apertura

**Proyecto:** SIGC&T Rural  
**Programa:** ADSO  
**Institución:** SENA  
**Tipo de entrega:** Sustentación final de Proyecto Productivo  
**Duración objetivo:** 20 minutos + espacio para preguntas

## 3. Estructura recomendada de la sustentación

### Diapositiva 1. Portada

**Contenido**

- nombre del proyecto
- nombre del autor
- programa ADSO
- SENA
- fecha de presentación

**Guion**

Buenos días. Presento SIGC&T Rural, Sistema Integrado de Gestión en Ciencia y Tecnología Rural, desarrollado como Proyecto Productivo ADSO. Este trabajo integra software web, telemetría, inteligencia artificial, documentación técnica y una línea de despliegue híbrido Cloud/Edge orientada a contextos rurales y educativos.

### Diapositiva 2. Problema y contexto

**Contenido**

- necesidad de integrar observación, análisis y visualización en contextos rurales
- dificultad de unir hardware, software e interpretación técnica
- valor educativo del proyecto

**Guion**

El problema principal que aborda SIGC&T Rural es la falta de una plataforma integrada que permita capturar datos del entorno, analizarlos y presentarlos de forma útil para usuarios técnicos y formativos. El proyecto responde a esa necesidad mediante una arquitectura que une frontend, backend, inteligencia artificial y una línea edge documentada para BeagleBone Black.

### Diapositiva 3. Objetivo general

**Contenido**

- desarrollar una plataforma híbrida Cloud/Edge para telemetría, IA y educación técnica

**Guion**

El objetivo general fue desarrollar una plataforma híbrida que integre IoT, inteligencia artificial y educación técnica, cumpliendo con los requisitos del Proyecto Productivo ADSO y dejando evidencia técnica y documental suficiente para su continuidad.

### Diapositiva 4. Objetivos específicos

**Contenido**

- dashboard centralizado
- integración IA
- documentación técnica
- ruta de despliegue y continuidad
- componente edge documentado

**Guion**

Los objetivos específicos se orientaron a construir un dashboard centralizado, integrar un servicio de IA, consolidar la documentación técnica, establecer una ruta de despliegue y continuidad, y documentar el componente edge como parte del enfoque híbrido del proyecto.

### Diapositiva 5. Arquitectura general

**Contenido**

- frontend React/Vite
- backend Django/DRF
- PostgreSQL
- microservicio FastAPI
- edge BeagleBone Black

**Guion**

La arquitectura actual se compone de un frontend React, un backend Django con API REST, PostgreSQL como base de datos principal, un microservicio de IA en FastAPI y una capa edge documentada para BeagleBone Black. Esta arquitectura responde a una evolución gradual del sistema, con una línea de refactorización hacia bounded contexts y capas más desacopladas.

### Diapositiva 6. Componentes del sistema

**Contenido**

- Dashboard
- AIPredictiva
- microservicio IA
- telemetría
- laboratorios

**Guion**

Entre los componentes principales se encuentran el dashboard para visualización, la interfaz de diagnóstico IA, la capa de telemetría, el microservicio de inferencia y el conjunto de laboratorios educativos. Esto permite mostrar un proyecto integrador y no una aplicación aislada.

### Diapositiva 7. Stack tecnológico

**Contenido**

- Python
- Django
- React
- Vite
- PostgreSQL
- FastAPI
- TensorFlow
- Docker Compose

**Guion**

El stack combina tecnologías del ecosistema web moderno con librerías de IA y una capa de contenedores. Esto demuestra integración real entre desarrollo backend, frontend, persistencia, servicios especializados y despliegue local reproducible.

### Diapositiva 8. Estado de cumplimiento ADSO

**Contenido**

- O-01 Dashboard Centralizado: completado
- O-02 Modelo IA: completado
- O-03 Laboratorio Hardware: en progreso
- O-04 Biblioteca Educativa: en progreso
- O-05 Cumplimiento ADSO: en progreso

**Guion**

De acuerdo con la documentación base del proyecto, los objetivos académicos muestran avances concretos. El dashboard y el modelo de IA se reportan como completados. El laboratorio hardware, la biblioteca educativa y el cierre ADSO se encuentran en progreso, lo cual fue auditado y luego materializado mediante los artefactos de cierre.

### Diapositiva 9. Evidencia documental

**Contenido**

- MASTERDOC
- PLAN_MAESTRO
- inventario maestro
- auditoría de readiness
- EIARC
- knowledge base

**Guion**

Uno de los activos más fuertes del proyecto es su masa documental. Existen documentos maestros, matrices de evidencia, auditorías técnicas, base de conocimiento, línea arquitectónica EIARC y artefactos específicos de cierre. Esto fortalece la sustentación porque permite demostrar trazabilidad, gobierno documental y continuidad.

### Diapositiva 10. Evidencia de telemetría

**Contenido**

- endpoint V1
- endpoint V2
- endpoint V3
- Dashboard conectado

**Guion**

La telemetría está representada por una evolución de endpoints V1, V2 y V3. El proyecto cuenta con un slice V3 para historial de telemetría y un dashboard que consume esta capacidad, lo que permite sostener una demostración académica basada en datos y visualización.

### Diapositiva 11. Evidencia de IA

**Contenido**

- microservicio FastAPI
- endpoint `/health`
- endpoint `/infer`
- modelo `.h5`
- interfaz `AIPredictiva`

**Guion**

La capa de IA dispone de un microservicio FastAPI con endpoints de salud e inferencia, un modelo `.h5` presente en el repositorio y una interfaz frontend dedicada. Esta combinación constituye una evidencia clara de integración entre servicio especializado y consumo desde aplicación web.

### Diapositiva 12. Evidencia edge

**Contenido**

- 3 BBB documentadas
- gateway MQTT
- inferencia TFLite
- sensores
- flujo edge documentado

**Guion**

El componente edge está documentado alrededor de tres nodos BeagleBone Black: un gateway MQTT, un nodo de inferencia edge y un nodo de sensores. Esto permite demostrar que el proyecto contempla una ruta híbrida realista y no exclusivamente cloud.

### Diapositiva 13. Despliegue y continuidad

**Contenido**

- Docker Compose
- backend
- ai_service
- frontend
- db
- scripts de continuidad

**Guion**

El proyecto dispone de una ruta operativa local basada en Docker Compose y de scripts de continuidad que permiten verificar servicios, salud del microservicio de IA y pruebas del backend. Esto aporta solidez a la sustentación porque muestra reproducibilidad operativa.

### Diapositiva 14. Pruebas y validación

**Contenido**

- runbook de continuidad
- verify_refactor
- test_endpoints
- pytest backend

**Guion**

La validación se soporta en scripts de continuidad, pruebas de endpoints y una suite de pruebas en backend documentada con resultados registrados. Esto permite demostrar que el proyecto no solo fue construido, sino también verificado.

### Diapositiva 15. Impacto del proyecto

**Contenido**

- integración tecnológica
- aplicación rural
- valor educativo
- continuidad futura

**Guion**

SIGC&T Rural aporta valor en tres planos: técnico, porque integra múltiples capas; social, porque orienta la tecnología al contexto rural; y formativo, porque materializa competencias ADSO de diseño, desarrollo, integración, despliegue y documentación.

### Diapositiva 16. Cierre

**Contenido**

- síntesis del resultado
- estado del proyecto
- valor del repositorio y documentación

**Guion**

En conclusión, SIGC&T Rural queda presentado como un proyecto productivo con base técnica real, arquitectura documentada, integración funcional entre frontend, backend e IA, y un paquete documental suficiente para revisión académica, sustentación y continuidad.

## 4. Flujo sugerido de demo en vivo

1. Mostrar `README.md` como portada y contexto académico.
2. Mostrar `docs/MASTERDOC.md` y `docs/PLAN_MAESTRO.md` como fuentes de verdad.
3. Abrir el dashboard y evidenciar navegación principal.
4. Mostrar la vista de IA y el flujo de inferencia.
5. Mostrar evidencia del despliegue local con Docker.
6. Mostrar el runbook o resumen de continuidad.
7. Cerrar con la documentación SENA generada en `docs/sena_artifacts/`.

## 5. Respuestas técnicas breves para preguntas del instructor

### ¿Qué tecnologías principales integra el proyecto?

Django, React, FastAPI, PostgreSQL, TensorFlow, Docker Compose y documentación edge para BeagleBone Black.

### ¿Cuál es el valor académico principal?

Integrar análisis, arquitectura, desarrollo, despliegue, pruebas y documentación en un solo proyecto productivo.

### ¿Qué parte del proyecto está más consolidada?

Frontend, backend, microservicio de IA y documentación técnica.

### ¿Qué parte requiere más evidencia operativa?

El hardware real y la demostración física del clúster edge.

### ¿Qué deja el proyecto como activo más fuerte?

Una base funcional combinada con una documentación de alto nivel de detalle que permite continuidad real.

## 6. Cierre final sugerido para exposición oral

SIGC&T Rural demuestra que un proyecto ADSO puede ir más allá de una aplicación básica y consolidar un sistema con frontend, backend, IA, despliegue, telemetría, documentación formal y proyección de continuidad. El valor del trabajo no está solo en que el sistema exista, sino en que queda explicado, estructurado y sustentable académicamente.
