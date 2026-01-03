🚀 PLAN MAESTRO v4.2 - SIGC&T Rural ADSO
<div align="center">
Fases de Implementación Basadas en Arquitectura
Roadmap Completo del Proyecto Productivo
Mostrar imagen
Mostrar imagen
Mostrar imagen
</div>

📋 Información del Plan
CampoValorVersión4.2 (Sincronizado con MASTERDOC v4.2)EstadoFase 1 en ProgresoFecha Inicio02-Nov-2025Fecha Estimada Final15-Feb-2026ResponsableB. GómezMetodologíaIterativa e Incremental

🎯 Visión General del Proyecto
Objetivo Principal
Desarrollar SIGC&T Rural como plataforma web híbrida (Cloud/Edge) que integra IoT, IA y educación técnica para el sector agrícola, cumpliendo con todos los requisitos del Proyecto Productivo ADSO - SENA.
Entregables Finales

✅ Plataforma web funcional (React + Django) desplegada en Cloud
✅ Clúster de 3 BeagleBone Black operacional con sensores
✅ Modelo de IA entrenado (>85% accuracy) con inferencia Cloud/Edge
✅ Biblioteca educativa con 20+ recursos curados
✅ Documentación técnica completa (MASTERDOC, APIs, Despliegue)
✅ Artefactos SENA (Proyecto Formativo, Evidencias, Presentación)


📊 Resumen de Fases
mermaidgantt
    title Plan Maestro SIGC&T Rural - Timeline
    dateFormat  YYYY-MM-DD
    section Fase 1
    Diseño Arquitectura           :done, f1, 2025-11-02, 7d
    Aprobación Arquitectura        :active, f1a, 2025-11-09, 3d
    section Fase 2
    Backend Django                 :f2a, 2025-11-12, 10d
    Frontend React                 :f2b, 2025-11-12, 10d
    Configuración BBB              :f2c, 2025-11-18, 5d
    section Fase 3
    Edge IoT                       :f3a, 2025-11-23, 12d
    Cloud Recepción                :f3b, 2025-11-28, 7d
    Dashboard Visualización        :f3c, 2025-12-01, 7d
    section Fase 4
    Entrenamiento IA               :f4a, 2025-12-08, 14d
    Despliegue Cloud IA            :f4b, 2025-12-18, 5d
    Despliegue Edge IA             :f4c, 2025-12-22, 7d
    section Fase 5
    Contenido Académico            :f5a, 2025-12-29, 10d
    UI/UX Pulido                   :f5b, 2026-01-05, 10d
    Documentación Final            :f5c, 2026-01-12, 15d
    Presentación SENA              :milestone, 2026-02-15, 1d

🟢 FASE 1: Fundamentos y Arquitectura
Estado: 🟡 En Progreso (85% completado)
Duración: 2 semanas (02-Nov → 15-Nov)
Objetivo: Definir y validar la arquitectura de software completa como "plano" del proyecto.
📝 Tareas
1.1 Revisión de Requisitos

 Tarea: Analizar README.md original

Responsable: B. Gómez
Fecha: 02-Nov-2025
Resultado: Requisitos funcionales extraídos


 Tarea: Revisar requisitos SENA para Proyecto Productivo ADSO

Responsable: B. Gómez
Fecha: 02-Nov-2025
Resultado: Checklist de artefactos obligatorios


 Tarea: Definir stack tecnológico final

Responsable: B. Gómez
Fecha: 02-Nov-2025
Decisión: Django/React/PostgreSQL/BBB/TensorFlow



1.2 Diseño de Arquitectura

 Tarea: Desarrollar MASTERDOC_v4.2_DAS.md

Responsable: B. Gómez + Asistente IA
Fecha: 02-Nov-2025
Estado: ✅ Completado
Archivo: docs/MASTERDOC.md


 Tarea: Crear diagramas Mermaid

Lista:

 Vista de Contexto (C4 Nivel 1)
 Vista de Contenedores (C4 Nivel 2)
 Vista de Despliegue (UML)
 Casos de Uso (UML)
 Modelo Entidad-Relación (E-R)


Estado: ✅ Todos integrados en MASTERDOC


 Tarea: Definir Diccionario de Datos completo

Tablas documentadas: 7/7

Usuarios, Proyectos, Nodos_Edge, Sensores, Lecturas_Sensores, Analisis_IA, Contenido_Academico


Estado: ✅ Completado


 Tarea: Especificar APIs (Backend) y Componentes (Frontend/Edge)

Backend: ViewSets, Serializers, Endpoints documentados
Frontend: Páginas, Componentes, Servicios documentados
Edge: Scripts Python para 3 nodos BBB documentados
Estado: ✅ Completado



1.3 Hito de Aprobación (Revisión)

 Tarea: Revisar MASTERDOC.md en GitHub

Responsable: B. Gómez
Fecha Límite: 10-Nov-2025
Checklist:

 Todos los diagramas se visualizan correctamente
 Diccionario de datos es exhaustivo
 Especificaciones técnicas son implementables
 No hay inconsistencias entre secciones




 Tarea: Validar con instructor SENA (opcional)

Responsable: B. Gómez
Fecha: 12-Nov-2025


 GATE: ⚠️ NO PASAR A FASE 2 HASTA APROBACIÓN 100%

📈 Métricas de Éxito

✅ Documento MASTERDOC.md completo y aprobado
✅ Todos los diagramas renderizados en GitHub
✅ Stack tecnológico validado y sin cambios futuros
✅ Equipo (tú) comprende completamente la arquitectura


🟡 FASE 2: Prototipo "Hola Mundo" (Cloud)
Estado: 🔴 Pendiente
Duración: 2 semanas (12-Nov → 25-Nov)
Objetivo: Asegurar que Backend y Frontend se comunican correctamente en la nube.
📝 Tareas
2.1 Backend (Django)

 Tarea: Inicializar proyecto Django

bash  cd src/backend/
  django-admin startproject sigct_backend .
  python manage.py startapp users
  python manage.py startapp api
  python manage.py startapp ia_service

Fecha: 12-Nov-2025
 Tarea: Configurar settings.py

Database: PostgreSQL
CORS: Permitir origen frontend
Django REST Framework
Django Channels (WebSockets)


 Tarea: Crear modelos iniciales

users/models.py: Modelo CustomUser
api/models.py: Modelos Proyecto, NodoEdge (sin sensores aún)
Ejecutar: makemigrations y migrate


 Tarea: Crear endpoint /api/health/

Respuesta: {"status": "ok", "timestamp": "..."}
Test: curl https://api.sigct-rural.com/api/health/


 Tarea: Desplegar en Render

Crear servicio Web + PostgreSQL
Configurar variables de entorno (.env)
Verificar: https://sigct-backend.onrender.com/api/health/



2.2 Frontend (React)

 Tarea: Inicializar proyecto React con Vite

bash  cd src/frontend/
  npm create vite@latest . -- --template react
  npm install axios react-router-dom
  npx tailwindcss init

 Tarea: Configurar TailwindCSS

tailwind.config.js
Importar en index.css


 Tarea: Crear página que consuma /api/health/

src/pages/HealthCheck.jsx
Mostrar "✅ Backend Conectado" o "❌ Error de Conexión"


 Tarea: Desplegar en Render (Static Site)

Build command: npm run build
Publish directory: dist
Verificar: https://sigct-rural.onrender.com/



2.3 Configuración Edge (BBB)

 Tarea: Instalar Debian en las 3 BeagleBone Black

Actualizar sistema: apt update && apt upgrade
Instalar Python 3.9+: apt install python3 python3-pip


 Tarea: Instalar dependencias Python Edge

bash  pip3 install paho-mqtt Adafruit_BBIO flask tensorflow-lite pillow

 Tarea: Configurar red local estática

BBB-01: 192.168.1.100
BBB-02: 192.168.1.101
BBB-03: 192.168.1.102
Verificar ping entre nodos


 Tarea: Configurar SSH para acceso remoto

Generar claves SSH
Deshabilitar password login (solo keys)



📈 Métricas de Éxito

✅ Backend responde a /api/health/ desde la nube
✅ Frontend se comunica con Backend sin errores CORS
✅ 3 BBB accesibles vía SSH desde red local
✅ PostgreSQL operacional con conexión desde Django


🟠 FASE 3: Flujo de Datos "Humo" (Edge-to-Cloud)
Estado: 🔴 Pendiente
Duración: 2 semanas (26-Nov → 09-Dic)
Objetivo: Probar el pipeline completo: Sensor → BBB → Cloud → Dashboard.
📝 Tareas
3.1 Edge (Sensores y MQTT)

 Tarea: Implementar sensor_reader.py (BBB-03)

Leer sensor DHT22 (temperatura + humedad)
Publicar en MQTT: sigct/sensors/bbb03/temperatura
Intervalo: cada 10 segundos


 Tarea: Instalar y configurar Mosquitto (BBB-01)

bash  apt install mosquitto mosquitto-clients
  systemctl enable mosquitto

Configurar listeners en mosquitto.conf
Test: mosquitto_sub -t sigct/#
 Tarea: Implementar mqtt_broker.py (BBB-01)

Suscribirse a sigct/sensors/#
Agrupar lecturas (buffer de 1 min)
Enviar vía POST a /api/v1/readings/



3.2 Cloud (Recepción y Almacenamiento)

 Tarea: Crear modelos completos en api/models.py

Sensores: con FKs a Nodos_Edge
Lecturas_Sensores: con FKs a Sensores
Ejecutar migraciones


 Tarea: Crear endpoint POST /api/v1/readings/

Autenticación: API Key en header X-API-Key
Validación: Serializer DRF
Guardar en PostgreSQL
Emitir evento WebSocket (opcional en esta fase)


 Tarea: Test E2E

bash  # Desde BBB-03
  python3 sensor_reader.py
  # Verificar en Django Admin que hay datos
3.3 Cloud (Visualización)

 Tarea: Crear componente Dashboard.jsx

Fetch a GET /api/v1/latest-readings/:proyecto_id/
Mostrar última temperatura en <SensorCard />


 Tarea: Crear componente SensorCard.jsx

Props: { tipo, valor, unidad, timestamp }
Diseño: Tarjeta con ícono y valor grande


 Tarea: Implementar WebSocket (opcional)

Backend: Django Channels
Frontend: Conectar a wss://api.../ws/proyecto/:id/
Actualizar dashboard en tiempo real



📈 Métricas de Éxito

✅ Sensor físico envía datos cada 10s
✅ Datos llegan a PostgreSQL en <2 segundos
✅ Dashboard muestra última lectura correctamente
✅ Sistema funciona 24h sin errores


🔵 FASE 4: Integración de IA
Estado: 🔴 Pendiente
Duración: 3 semanas (10-Dic → 31-Dic)
Objetivo: Implementar pipeline de IA híbrido (Cloud + Edge).
📝 Tareas
4.1 Entrenamiento (Offline)

 Tarea: Descargar dataset PlantVillage

Fuente: https://github.com/spMohanty/PlantVillage-Dataset
Almacenar en data/datasets/plantvillage/


 Tarea: Desarrollar Notebook EDA

Archivo: src/ai_models/notebooks/01_EDA.ipynb
Análisis: Distribución de clases, imágenes corruptas


 Tarea: Desarrollar Notebook Entrenamiento

Archivo: src/ai_models/notebooks/02_Training.ipynb
Arquitectura: MobileNetV2 + Transfer Learning
Augmentation: Rotación, zoom, flip
Epochs: 50 (con early stopping)
Guardar: production_models/model_v1.h5


 Tarea: Convertir a TensorFlow Lite

Script: src/ai_models/scripts/convert_tflite.py
Optimizaciones: Quantización
Guardar: production_models/model_v1.tflite


 Tarea: Evaluar modelo

Test accuracy: >85%
Matriz de confusión
Guardar métricas en metadata.json



4.2 Despliegue (Cloud)

 Tarea: Crear ia_service/inference.py

Cargar model_v1.h5 al iniciar
Función predict(image_bytes) -> dict


 Tarea: Crear endpoint POST /api/ia/classify/

Recibir imagen (multipart/form-data)
Ejecutar inferencia
Guardar en tabla Analisis_IA
Devolver JSON con predicción


 Tarea: Crear página LaboratorioIA.jsx

Componente <UploadWidget />
Mostrar resultado con confianza
Permitir feedback del usuario



4.3 Despliegue (Edge)

 Tarea: Implementar tflite_api.py (BBB-02)

API Flask en puerto 5000
Endpoint /classify_local
Cargar model_v1.tflite
Inferencia con TF Lite Interpreter


 Tarea: Implementar camera_capture.py (BBB-03)

Captura con OpenCV (USB camera)
Enviar imagen a BBB-02 vía HTTP POST
Recibir predicción


 Tarea: Lógica de clúster

Si BBB-02 detecta anomalía (no "Sano" o confianza <90%):

Publicar en MQTT sigct/ai/results
BBB-01 recibe y envía a Cloud


Si "Sano" con alta confianza: Descartar



📈 Métricas de Éxito

✅ Modelo Cloud con accuracy >92%
✅ Modelo Edge con accuracy >88%
✅ Inferencia Cloud: <5s
✅ Inferencia Edge: <500ms
✅ Sistema de alertas funcional


⚫ FASE 5: Contenido Académico y Pulido Final
Estado: 🔴 Pendiente
Duración: 6 semanas (01-Ene → 15-Feb)
Objetivo: Completar módulos educativos, UI/UX premium y documentación SENA.
📝 Tareas
5.1 Backend (Contenido Académico)

 Tarea: Crear modelo Contenido_Academico

Migración y CRUD completo


 Tarea: Poblar BD con contenido inicial

Mínimo 20 recursos (cursos, videos, PDFs)
Categorías: IoT, IA, Agricultura 4.0, Embebidos



5.2 Frontend (Biblioteca)

 Tarea: Crear página Biblioteca.jsx

Grid de tarjetas de contenido
Filtros: Tipo, Nivel, Tags
Enlaces a recursos externos


 Tarea: Crear página LaboratoriosVirtuales.jsx

Simuladores interactivos (ej: simulador de sensor DHT22)
Tutoriales paso a paso



5.3 UI/UX Pulido

 Tarea: Refactorizar CSS a TailwindCSS

Estética "flotante" con sombras (shadow-lg, shadow-2xl)
Colores: Verde SENA (#2e8b57), Azul tecnológico


 Tarea: Agregar animaciones

Transiciones suaves (transition, duration-300)
Loading skeletons
Toast notifications


 Tarea: Responsive design

Testear en móvil, tablet, desktop
Breakpoints: sm:, md:, lg:, xl:



5.4 Documentación Final (SENA)

 Tarea: Completar artefactos ADSO

docs/sena_artifacts/proyecto_formativo.pdf
docs/sena_artifacts/evidencias/ (screenshots, videos)
docs/sena_artifacts/presentacion.pptx


 Tarea: Crear API_REFERENCE.md

Documentar todos los endpoints
Ejemplos de requests/responses (cURL, Postman)


 Tarea: Crear DEPLOYMENT.md

Guía paso a paso para despliegue
Configuración de producción


 Tarea: Actualizar README.md

Screenshots del sistema funcionando
Badges de estado
Instrucciones de instalación



📈 Métricas de Éxito

✅ 20+ recursos educativos publicados
✅ UI moderna y responsive
✅ Documentación SENA 100% completa
✅ Presentación lista para sustentación


📊 Seguimiento de Progreso
Dashboard de Estado
FaseProgresoEstadoFecha InicioFecha Fin EstimadaFase 1████████░░ 85%🟡 En Progreso02-Nov-202515-Nov-2025Fase 2░░░░░░░░░░ 0%🔴 Pendiente12-Nov-202525-Nov-2025Fase 3░░░░░░░░░░ 0%🔴 Pendiente26-Nov-202509-Dic-2025Fase 4░░░░░░░░░░ 0%🔴 Pendiente10-Dic-202531-Dic-2025Fase 5░░░░░░░░░░ 0%🔴 Pendiente01-Ene-202615-Feb-2026
Hitos Críticos
mermaidgantt
    title Hitos Críticos del Proyecto
    dateFormat  YYYY-MM-DD
    section Aprobaciones
    Aprobación Arquitectura       :milestone, m1, 2025-11-10, 1d
    Backend + Frontend Funcional   :milestone, m2, 2025-11-25, 1d
    Pipeline IoT Completo          :milestone, m3, 2025-12-09, 1d
    Modelo IA Desplegado           :milestone, m4, 2025-12-31, 1d
    Documentación SENA Lista       :milestone, m5, 2026-02-10, 1d
    Sustentación Final             :crit, milestone, m6, 2026-02-15, 1d

⚠️ Riesgos y Mitigaciones
RiesgoProbabilidadImpactoMitigaciónHardware BBB defectuosoMediaAltoTener BBB de repuesto, documentar proceso de reemplazoDataset insuficiente para IABajaAltoUsar PlantVillage (54K imágenes), augmentation agresivoDespliegue Cloud fallaMediaMedioTener backup en Railway/Heroku, scripts automatizadosRetraso en Fase 4 (IA)AltaAltoIniciar entrenamiento en paralelo con Fase 3Cambio de requisitos SENABajaMedioMantener comunicación con instructor, arquitectura modular

🎯 Criterios de Aceptación Global
Para Aprobar el Proyecto ADSO

 Funcionalidad: Sistema completo funcionando end-to-end
 IA: Modelo con accuracy >85% demostrable
 Hardware: Clúster 3-BBB operativo con video demostrativo
 Código: Repositorio GitHub con commits consistentes
 Documentación: MASTERDOC, APIs, Despliegue completos
 Artefactos SENA: Proyecto Formativo, Evidencias, Presentación
 Presentación: Defensa oral de 20 minutos con demo en vivo


📞 Soporte y Comunicación
Canales

GitHub Issues: Para bugs y features
Email: badolgm@gmail.com
Instructor SENA: [Nombre y contacto]

Reuniones

Weekly Sync: Cada lunes 9:00 AM (autoevaluación de progreso)
Sprint Review: Al final de cada fase (demo de funcionalidades)


📚 Referencias Rápidas
DocumentoEnlacePropósitoMASTERDOC.mddocs/MASTERDOC.mdArquitectura completaREADME.mdRaíz del proyectoIntroducción y setupAPI_REFERENCE.mddocs/API_REFERENCE.mdDocumentación de APIsDEPLOYMENT.mddocs/DEPLOYMENT.mdGuía de despliegue

<div align="center">
🌱 "El éxito es la suma de pequeños esfuerzos repetidos día tras día."
— Proyecto SIGC&T Rural

Mostrar imagen
Mostrar imagen
Mostrar imagen

Última actualización: 02 de Noviembre, 2025
Próxima revisión: 10 de Noviembre, 2025
Versión: 4.2
</div>