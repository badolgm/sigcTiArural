# PROYECTO FORMATIVO FINAL

## 1. Identificación general

**Nombre del proyecto:** SIGC&T Rural  
**Nombre completo:** Sistema Integrado de Gestión en Ciencia y Tecnología Rural  
**Programa académico:** Tecnología en Análisis y Desarrollo de Software (ADSO)  
**Institución:** SENA  
**Naturaleza:** Proyecto Productivo ADSO  
**Clasificación:** Técnico, académico y open source

## 2. Resumen ejecutivo

SIGC&T Rural es una plataforma web híbrida orientada al sector rural que integra telemetría, inteligencia artificial, visualización web y material educativo técnico. El proyecto articula un backend en Django, un frontend en React, un microservicio de IA en FastAPI con TensorFlow y una línea de trabajo edge basada en BeagleBone Black.

La propuesta académica y técnica del proyecto consiste en demostrar que una solución de software puede integrar captura de datos, análisis asistido por IA y experiencias educativas bajo una arquitectura modular en evolución, con potencial de aplicación en agricultura sostenible, inclusión tecnológica y formación práctica.

El proyecto, además, dio origen a una línea de formalización arquitectónica más amplia documentada como EIARC, sin que ello cambie el alcance del entregable ADSO principal: SIGC&T Rural como sistema funcional, documentado y sustentable académicamente.

## 3. Problema que aborda

SIGC&T Rural responde a una necesidad concreta: disponer de una plataforma que permita observar variables del entorno, interpretar información técnica y convertirla en apoyo útil para actividades rurales y formativas.

El problema abordado tiene varias dimensiones:

- fragmentación entre hardware, software y visualización
- ausencia de integración clara entre telemetría, análisis y experiencia de usuario
- necesidad de herramientas educativas accesibles para formación técnica contextualizada
- necesidad de evidenciar un proyecto productivo ADSO con integración de software, datos, IA y documentación formal

## 4. Justificación

El proyecto se justifica por cuatro razones principales:

1. **Académica:** permite integrar análisis, diseño, desarrollo, despliegue, documentación y sustentación en un solo producto.
2. **Tecnológica:** demuestra articulación entre frontend, backend, base de datos, Docker, IA y edge computing.
3. **Social:** orienta el uso de tecnología hacia contextos rurales, sostenibilidad y apropiación del conocimiento.
4. **Formativa:** materializa competencias ADSO en arquitectura, programación, pruebas, integración y documentación técnica.

## 5. Objetivo general

Desarrollar SIGC&T Rural como una plataforma híbrida Cloud/Edge que integre telemetría, inteligencia artificial y educación técnica para apoyar escenarios rurales y cumplir con los requisitos del Proyecto Productivo ADSO.

## 6. Objetivos específicos

1. Implementar una interfaz web capaz de visualizar datos y flujos operativos del sistema.
2. Integrar un servicio de inteligencia artificial para diagnóstico a partir de imágenes.
3. Estructurar una base documental técnica suficiente para operación, continuidad y sustentación.
4. Consolidar una línea de telemetría compatible con backend, frontend y demostración académica.
5. Documentar el componente edge con BeagleBone Black como soporte del enfoque híbrido.
6. Organizar el proyecto bajo criterios de continuidad, trazabilidad y cierre académico.

## 7. Alcance del proyecto

### Alcance funcional actual

El alcance efectivo del proyecto, sustentado en el repositorio, incluye:

- frontend React/Vite con dashboard, laboratorios e interfaz IA
- backend Django/DRF con endpoints V1, V2 y V3
- microservicio FastAPI de IA con endpoints `/health` y `/infer`
- persistencia principal en PostgreSQL
- documentación técnica amplia de arquitectura, datos, despliegue y continuidad
- documentación edge para BeagleBone Black, sensores y flujo MQTT/TFLite

### Alcance académico

Como proyecto formativo ADSO, SIGC&T Rural integra:

- análisis de requisitos
- arquitectura de software
- modelado de datos
- desarrollo backend
- desarrollo frontend
- integración con IA
- pruebas y continuidad operativa
- documentación para revisión, cierre y sustentación

### Fuera del alcance del cierre ADSO

Queda fuera del alcance del cierre principal:

- expansión EIARC Fase 9
- nuevos dominios agropecuarios adicionales
- nuevos contextos de negocio no implementados
- rediseños arquitectónicos adicionales

## 8. Arquitectura y stack tecnológico

### Arquitectura operativa

La base técnica actual corresponde a:

- backend Django/DRF con coexistencia V1, V2 y V3
- microservicio IA independiente en FastAPI
- frontend React + Vite
- PostgreSQL 15 como base de datos principal
- Docker Compose para orquestación local de servicios principales

### Stack principal

- Python 3.10+
- Django 4.2+
- Django REST Framework
- React 18+
- Vite
- PostgreSQL 15
- FastAPI
- TensorFlow / TensorFlow Lite
- Docker Compose
- BeagleBone Black Rev C

## 9. Componentes principales del sistema

### 9.1 Backend

Ubicado en `src/backend/`, concentra:

- modelos de datos
- vistas API
- rutas REST
- capa legacy y capa en transición hexagonal
- pruebas y componentes de infraestructura

### 9.2 Frontend

Ubicado en `src/frontend/`, concentra:

- dashboard
- laboratorios
- interfaz de diagnóstico IA
- visualización y componentes UI

### 9.3 Microservicio de IA

Ubicado en `src/ai_models/`, concentra:

- servicio FastAPI
- carga de modelos `.h5`
- inferencia de imágenes
- recursos de entrenamiento y notebooks

### 9.4 Componente edge

Documentado en `docs/EDGE_SETUP.md` y estructurado en `src/embedded/`, contempla:

- BBB-01 como gateway MQTT
- BBB-02 como inferencia edge con TensorFlow Lite
- BBB-03 como adquisición de sensores

## 10. Resultados consolidados del proyecto

Con base en el material existente del repositorio, se consideran consolidados los siguientes resultados:

1. Plataforma web funcional con frontend y backend integrados.
2. Microservicio de IA funcional y documentado.
3. Dashboard centralizado documentado como objetivo académico cumplido.
4. Base documental extensa para arquitectura, despliegue, continuidad y sustentación.
5. Modelo de datos, diagramas y documentación de contexto suficientes para revisión técnica.
6. Ruta operativa de continuidad mediante scripts y runbook.

## 11. Estado de cumplimiento académico

De acuerdo con la documentación base del proyecto:

- **O-01 Dashboard Centralizado:** completado
- **O-02 Modelo de IA:** completado
- **O-03 Laboratorio Hardware:** en progreso
- **O-04 Biblioteca Educativa:** en progreso
- **O-05 Cumplimiento ADSO:** en progreso al momento de la auditoría de graduación

## 12. Entregables académicos asociados

Este proyecto formativo se soporta en los siguientes artefactos:

- `README.md`
- `docs/MASTERDOC.md`
- `docs/PLAN_MAESTRO.md`
- `docs/API_REFERENCE.md`
- `docs/DEPLOYMENT.md`
- `docs/CONTINUITY_RUNBOOK.md`
- `docs/EDGE_SETUP.md`
- `docs/AI_PIPELINE.md`
- `docs/eiarc/`
- `docs/project_knowledge_base/`
- `docs/architect_master/`

## 13. Impacto esperado

### Impacto técnico

- demuestra integración entre varias capas tecnológicas
- fortalece competencias de arquitectura, backend, frontend, IA y despliegue
- deja trazabilidad suficiente para continuidad del proyecto

### Impacto formativo

- articula desarrollo real con documentación formal
- permite sustentación técnica basada en evidencia
- ofrece un caso integral de proyecto productivo ADSO

### Impacto social

- orienta tecnología a contextos rurales
- promueve apropiación de herramientas digitales e inteligencia artificial
- vincula sostenibilidad, innovación y formación aplicada

## 14. Fuentes de verdad utilizadas para este documento

- `README.md`
- `docs/MASTERDOC.md`
- `docs/PLAN_MAESTRO.md`
- `INDICE_PROYECTO.md`
- `MASTER_PROJECT_INVENTORY_AUDIT.md`
- `SENA_GRADUATION_READINESS_AUDIT.md`
- `docs/architect_master/06_EVIDENCE_STATUS_MATRIX.md`
- `docs/eiarc/`
- `docs/project_knowledge_base/`

## 15. Declaración final

SIGC&T Rural queda formalizado como Proyecto Formativo ADSO con una base técnica real, una documentación robusta y un conjunto verificable de componentes funcionales que permiten su presentación académica, su revisión por instructor y su sustentación como proyecto productivo.
