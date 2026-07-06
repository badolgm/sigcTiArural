🚀 PLAN MAESTRO v5.0 - SIGC&T Rural ADSO
<div align="center">
Fases de Implementación Basadas en Arquitectura
Roadmap Completo del Proyecto Productivo
</div>

## 📋 Información del Plan
| Campo | Valor |
|---|---|
| Versión | 8.0 (Sincronizado Julio 2026) |
| Estado | Fase 7 en Progreso + Fase 8 en Preparación |
| Fecha Inicio | 02-Nov-2025 |
| Fecha Estimada Final | 31-Jul-2026 (continuidad y consolidación) |
| Responsable | B. Gómez |
| Metodología | Iterativa, Incremental y Segura |

## 🎯 Visión General del Proyecto
### Objetivo Principal
Desarrollar SIGC&T Rural como plataforma web híbrida (Cloud/Edge) que integra IoT, IA y educación técnica para el sector agrícola, cumpliendo con todos los requisitos del Proyecto Productivo ADSO - SENA.

### Entregables Finales
- ✅ Plataforma web funcional (React + Django) desplegada en Cloud
- ✅ Clúster de 3 BeagleBone Black operacional con sensores
- ✅ Modelo de IA entrenado (>85% accuracy) con inferencia Cloud/Edge
- ✅ Biblioteca educativa con 20+ recursos curados
- ✅ Documentación técnica completa (MASTERDOC, APIs, Despliegue, bitácoras)
- ✅ Artefactos SENA (Proyecto Formativo, Evidencias, Presentación)

### Declaración Arquitectónica Actual (2026-07-04)
El proyecto se está reconduciendo hacia un enfoque de Modular Monolith con límites hexagonales por bounded context. La intención es que cada contexto del negocio —laboratorios, telemetría, IA, cursos, usuarios y administración— tenga su propia estructura interna de dominio, puertos, aplicación e infraestructura, pero que todos compartan el mismo proceso principal de Django como runtime común.

La excepción técnica son los componentes con frontera física real y ciclo de vida independiente, como el servicio de IA en FastAPI + TensorFlow, que continúa operando aparte por sus propias dependencias y despliegue. Esto permite mantener coherencia, seguridad y trazabilidad en la refactorización sin convertir prematuramente el sistema en una arquitectura distribuida compleja.

### Principios de Continuidad y Gobernanza
- La documentación jamás se elimina; se conserva de forma histórica y se actualiza con fecha, hora, resultado, causas y observaciones.
- La refactorización debe ser quirúrgica, incremental y verificable. No se rompen funcionalidades existentes para avanzar.
- Cada cambio debe dejar evidencia operativa: pruebas, logs, validación de puertos, verificación de entorno y registro en bitácora.
- La migración y el rediseño deben mantener coherencia entre arquitectura, implementación, infraestructura y documentación.

## 📊 Resumen de Fases
```mermaid
gantt
    title Plan Maestro SIGC&T Rural - Timeline 2025-2026
    dateFormat  YYYY-MM-DD
    section Fase 1
    Diseño Arquitectura           :done, f1, 2025-11-02, 7d
    Aprobación Arquitectura        :done, f1a, 2025-11-09, 3d
    section Fase 2
    Backend Django                 :done, f2a, 2025-11-12, 10d
    Frontend React                 :done, f2b, 2025-11-12, 10d
    Configuración BBB              :done, f2c, 2025-11-18, 5d
    section Fase 3
    Edge IoT                       :done, f3a, 2025-11-23, 12d
    Cloud Recepción                :done, f3b, 2025-11-28, 7d
    Dashboard Visualización        :done, f3c, 2025-12-01, 7d
    section Fase 4
    Entrenamiento IA               :done, f4a, 2025-12-08, 14d
    Despliegue Cloud IA            :done, f4b, 2025-12-18, 5d
    Despliegue Edge IA             :done, f4c, 2025-12-22, 7d
    section Fase 5
    Contenido Académico            :active, f5a, 2025-12-29, 10d
    UI/UX Pulido                   :active, f5b, 2026-01-05, 10d
    Documentación Final            :active, f5c, 2026-01-12, 15d
    section Fase 6
    Integración Robótica           :done, f6a, 2026-01-23, 14d
    section Fase 7
    Refactorización Hexagonal      :active, f7a, 2026-05-23, 30d
    Presentación Final             :milestone, 2026-06-30, 1d
```

## 🟢 FASE 1: Fundamentos y Arquitectura
**Estado:** ✅ Completado (100%)
**Duración:** 2 semanas (02-Nov → 15-Nov)
**Objetivo:** Definir y validar la arquitectura de software completa como "plano" del proyecto.

### 📝 Tareas
#### 1.1 Revisión de Requisitos
- [x] Analizar README.md original (Responsable: B. Gómez)
- [x] Revisar requisitos SENA para Proyecto Productivo ADSO
- [x] Definir stack tecnológico final (Django/React/PostgreSQL/BBB/TensorFlow)

#### 1.2 Diseño de Arquitectura
- [x] Desarrollar MASTERDOC_v4.2_DAS.md
- [x] Crear diagramas Mermaid (Contexto, Contenedores, Despliegue, Casos de Uso, E-R)
- [x] Definir Diccionario de Datos completo
- [x] Especificar APIs (Backend) y Componentes (Frontend/Edge)

#### 1.3 Hito de Aprobación (Revisión)
- [x] Revisar MASTERDOC.md en GitHub
- [x] Validar con instructor SENA

**GATE:** ✅ APROBADO PARA FASE 2

## 🟡 FASE 2: Prototipo "Hola Mundo" (Cloud)
**Estado:** ✅ Completado (100%)
**Duración:** 2 semanas (12-Nov → 25-Nov)
**Objetivo:** Asegurar que Backend y Frontend se comunican correctamente en la nube.

### 📝 Tareas
#### 2.1 Backend (Django)
- [x] Inicializar proyecto Django
- [x] Configurar settings.py (PostgreSQL, CORS, DRF, Channels)
- [x] Crear modelos iniciales (Users, API)
- [x] Crear endpoint /api/health/
- [x] Desplegar en Render/Docker

#### 2.2 Frontend (React)
- [x] Inicializar proyecto React con Vite
- [x] Configurar TailwindCSS
- [x] Crear página que consuma /api/health/
- [x] Desplegar en Render (Static Site)

#### 2.3 Configuración Edge (BBB)
- [x] Instalar Debian en las 3 BeagleBone Black
- [x] Instalar dependencias Python Edge
- [x] Configurar red local estática
- [x] Configurar SSH para acceso remoto

## 🟠 FASE 3: Flujo de Datos "Humo" (Edge-to-Cloud)
**Estado:** ✅ Completado (100%)
**Duración:** 2 semanas (26-Nov → 09-Dic)
**Objetivo:** Probar el pipeline completo: Sensor → BBB → Cloud → Dashboard.

### 📝 Tareas
#### 3.1 Edge (Sensores y MQTT)
- [x] Implementar sensor_reader.py (BBB-03)
- [x] Instalar y configurar Mosquitto (BBB-01)
- [x] Implementar mqtt_broker.py (BBB-01)

#### 3.2 Cloud (Recepción y Almacenamiento)
- [x] Crear modelos completos en api/models.py
- [x] Crear endpoint POST /api/v1/readings/
- [x] Test E2E

#### 3.3 Cloud (Visualización)
- [x] Crear componente Dashboard.jsx
- [x] Crear componente SensorCard.jsx
- [x] Implementar WebSocket (Opcional/Parcial)

## 🔵 FASE 4: Integración de IA
**Estado:** ✅ Completado (100%)
**Duración:** 3 semanas (10-Dic → 31-Dic)
**Objetivo:** Implementar pipeline de IA híbrido (Cloud + Edge) y Voz Inteligente.

### 📝 Tareas
#### 4.1 Entrenamiento (Offline)
- [x] Descargar dataset PlantVillage
- [x] Desarrollar Notebook EDA
- [x] Desarrollar Notebook Entrenamiento
- [x] Convertir a TensorFlow Lite
- [x] Evaluar modelo (>85% acc)

#### 4.2 Despliegue (Cloud)
- [x] Crear ia_service/inference.py
- [x] Crear endpoint POST /api/ia/classify/
- [x] Crear página LaboratorioIA.jsx
- [x] Implementar IA de Voz con Memoria Contextual (Nueva Feature 2026)

#### 4.3 Despliegue (Edge)
- [x] Implementar tflite_api.py (BBB-02)
- [x] Implementar camera_capture.py (BBB-03)
- [x] Lógica de clúster

## ⚫ FASE 5: Contenido Académico y Pulido Final
**Estado:** ✅ Completado (100%)
**Duración:** 6 semanas (01-Ene → 15-Feb)
**Objetivo:** Completar módulos educativos, UI/UX premium y documentación SENA.

### 📝 Tareas
#### 5.1 Backend (Contenido Académico)
- [x] Crear modelo Contenido_Academico
- [x] Poblar BD con contenido inicial (20+ recursos)

#### 5.2 Frontend (Biblioteca)
- [x] Crear página Biblioteca.jsx
- [x] Crear página LaboratoriosVirtuales.jsx

#### 5.3 UI/UX Pulido
- [x] Refactorizar CSS a TailwindCSS
- [x] Agregar animaciones
- [x] Responsive design

#### 5.4 Documentación Final (SENA)
- [x] Completar artefactos ADSO
- [x] Crear API_REFERENCE.md
- [x] Crear DEPLOYMENT.md
- [x] Actualizar README.md

## 🟣 FASE 6: Laboratorio de Robótica e Integración (SENA 2026)
**Estado:** ✅ Completado (100%)
**Duración:** Enero 2026 - Febrero 2026
**Objetivo:** Integrar actuadores robóticos y control por voz contextual.

### 📝 Tareas
#### 6.1 Integración Robótica
- [x] Definir contratos de datos (JSON) para comandos
- [x] Integrar telemetría de actuadores (ESP32/Arduino)
- [x] Implementar Control por Voz para actuadores

## 🔴 FASE 7: Refactorización Arquitectónica Hexagonal (Mayo - Julio 2026)
**Estado:** 🟡 En Progreso
**Duración:** Mayo 2026 - Julio 2026
**Objetivo:** Desacoplar el dominio del framework (Django) y consolidar un diseño modular con límites hexagonales por bounded context, preservando estabilidad operativa.

### 📝 Tareas
#### 7.1 Definición de Capas de Dominio
- [x] Consolidar la intención arquitectónica del proyecto como Modular Monolith con bounded contexts
- [x] Documentar la diferencia entre contextos que comparten runtime y servicios con frontera física real
- [ ] Migrar progresivamente la lógica de negocio a estructuras de dominio más limpias y aisladas
- [ ] Definir contratos claros entre dominio, puertos, aplicación e infraestructura

#### 7.2 Implementación de Estrategias y Contextos
- [x] Identificar bounded contexts principales: laboratorios, telemetría, IA, usuarios, contenidos y administración
- [ ] Refactorizar la lógica de procesamiento de laboratorios usando patrones Strategy/Factory y límites claros de contexto
- [ ] Separar las reglas de negocio de la generación de datos y de la presentación en vistas
- [ ] Establecer un patrón de adaptación para persistencia y servicios externos

#### 7.3 Adaptadores, API y Seguridad
- [x] Alinear la configuración de puertos y variables de entorno con Docker y Django
- [x] Cargar variables de entorno desde el archivo de proyecto para evitar errores por entorno local
- [ ] Completar la integración del servicio de IA con el backend sin romper el flujo actual
- [ ] Fortalecer la seguridad de configuración y evitar dependencias rígidas a variables hardcodeadas

#### 7.4 Continuidad Documental
- [x] Actualizar bitácoras con fecha, hora, resultado y causa de intervención
- [x] Mantener la documentación histórica sin borrado de líneas ni pérdida de contexto
- [ ] Completar una guía operativa de continuidad para que la IA o cualquier desarrollador retome el proyecto sin ambigüedad

## 🟢 FASE 8: Continuidad Operativa, Observabilidad y Hardening
**Estado:** 🟡 En Preparación
**Duración:** Julio 2026
**Objetivo:** Dejar el proyecto estable, verificable y listo para avanzar sin riesgo de pérdida de contexto ni rotura funcional.

### 📝 Tareas
- [ ] Establecer un flujo de arranque seguro: DB → migraciones → backend → IA → frontend
- [ ] Definir un checklist de verificación por entorno (Docker, venv, puertos, variables de entorno)
- [ ] Implementar observabilidad mínima: logs estructurados, health checks y trazabilidad de errores
- [ ] Asegurar que los cambios de puertos no rompan la ejecución de otros proyectos locales
- [ ] Mantener la documentación como fuente única de continuidad del proceso de refactorización

## 📊 Seguimiento de Progreso
### Dashboard de Estado
| Fase | Progreso | Estado |
|---|---|---|
| Fase 1 | ██████████ 100% | ✅ Completado |
| Fase 2 | ██████████ 100% | ✅ Completado |
| Fase 3 | ██████████ 100% | ✅ Completado |
| Fase 4 | ██████████ 100% | ✅ Completado |
| Fase 5 | ██████████ 100% | ✅ Completado |
| Fase 6 | ██████████ 100% | ✅ Completado |
| Fase 7 | ████░░░░░░ 45% | 🟢 En Progreso |
| Fase 8 | ██░░░░░░░░ 15% | 🟡 En Preparación |

### ⚠️ Riesgos y Mitigaciones
| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Hardware BBB defectuoso | Media | Alto | Tener BBB de repuesto, documentar proceso de reemplazo |
| Dataset insuficiente para IA | Baja | Alto | Usar PlantVillage (54K imágenes), augmentation agresivo |
| Despliegue Cloud falla | Media | Medio | Tener backup en Railway/Heroku, scripts automatizados |
| Retraso en Integración Robótica | Alta | Alto | Simplificar comandos, usar simuladores si hardware falla |

## 🎯 Criterios de Aceptación Global
### Para Aprobar el Proyecto ADSO
- **Funcionalidad:** Sistema completo funcionando end-to-end
- **IA:** Modelo con accuracy >85% demostrable
- **Hardware:** Clúster 3-BBB operativo con video demostrativo
- **Código:** Repositorio GitHub con commits consistentes
- **Documentación:** MASTERDOC, APIs, Despliegue completos
- **Artefactos SENA:** Proyecto Formativo, Evidencias, Presentación
- **Presentación:** Defensa oral de 20 minutos con demo en vivo

## 📞 Soporte y Comunicación
**Canales**
- GitHub Issues: Para bugs y features
- Email: badolgm@gmail.com
- Instructor SENA: [Nombre y contacto]

**Reuniones**
- Weekly Sync: Cada lunes 9:00 AM (autoevaluación de progreso)
- Sprint Review: Al final de cada fase (demo de funcionalidades)

## 📚 Referencias Rápidas
| Documento | Enlace | Propósito |
|---|---|---|
| MASTERDOC.md | docs/MASTERDOC.md | Arquitectura completa |
| robotics_contracts.md | docs/architecture/robotics_contracts.md | Contratos JSON Robótica |
| README.md | Raíz del proyecto | Introducción y setup |
| API_REFERENCE.md | docs/API_REFERENCE.md | Documentación de APIs |
| DEPLOYMENT.md | docs/DEPLOYMENT.md | Guía de despliegue |

<div align="center">
🌱 "El éxito es la suma de pequeños esfuerzos repetidos día tras día."
— Proyecto SIGC&T Rural

Última actualización: 23 de Mayo, 2026
Próxima revisión: 30 de Mayo, 2026
Versión: 7.0
</div>
