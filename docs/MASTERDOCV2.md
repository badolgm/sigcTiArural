<div align="center">Mostrar imagen

Sistema Integrado de Gestión del Conocimiento y Tecnología Rural

Mostrar imagenMostrar imagenMostrar imagenMostrar imagenMostrar imagenMostrar imagenMostrar imagen

Proyecto Productivo ADSO - SENA Colombia

🔗 Accesos Rápidos

Mostrar imagenMostrar imagenMostrar imagenMostrar imagenMostrar imagen

Última actualización: 03 de Noviembre, 2025

Versión: 5.0 Definitiva

Estado: ✅ Arquitectura Completa y Validada

Autor: Bernardo A. Gómez Montoya

Tipo: Documento de Arquitectura de Software (DAS)



</div>📋 Información del Documento

CampoValorVersión5.0Estado✅ Arquitectura DefinitivaFecha03-Nov-2025AutorB. Gómez (Asistente: Claude AI)TipoDocumento de Arquitectura de Software (DAS)FormatoMarkdown + Mermaid para GitHubProyectoSIGC&T Rural - Proyecto Productivo ADSOInstituciónSENA Colombia

📑 Tabla de Contenidos Interactiva



<details open>

<summary><b>🎯 PARTE I: Visión Estratégica</b></summary>1. Visión y Alcance1.1. Propósito del Sistema

1.2. Objetivos del Negocio

1.3. Alcance y Límites

1.4. Actores y Roles

1.5. Impacto Social y ODS



</details>

<details open>

<summary><b>🏗️ PARTE II: Arquitectura del Sistema</b></summary>2. Vistas de Arquitectura (Modelo C4)2.1. Vista de Contexto del Sistema

2.2. Vista de Contenedores

2.3. Vista de Despliegue

2.4. Patrones Arquitectónicos



</details>

<details open>

<summary><b>📊 PARTE III: Diseño Funcional</b></summary>3. Vista de Casos de Uso3.1. Diagrama General

3.2. Casos de Uso Detallados

3.3. Flujos de Trabajo



</details>

<details open>

<summary><b>💾 PARTE IV: Modelo de Datos</b></summary>4. Vista de Datos4.1. Modelo Entidad-Relación

4.2. Diccionario de Datos Completo

4.3. Estrategias de Optimización



</details>

<details open>

<summary><b>⚙️ PARTE V: Implementación</b></summary>5. Vista de Implementación5.1. Estructura del Repositorio

5.2. Backend Cloud (Django)

5.3. Frontend Cloud (React)

5.4. Edge Computing (BeagleBone)



</details>

<details open>

<summary><b>🤖 PARTE VI: Inteligencia Artificial</b></summary>6. Arquitectura de IA6.1. Pipeline de Entrenamiento

6.2. Pipeline de Inferencia Híbrida

6.3. Modelo Seleccionado: MobileNetV2

6.4. Métricas de Rendimiento



</details>

<details open>

<summary><b>📚 PARTE VII: Recursos y Gestión</b></summary>7. Stack Tecnológico

8. Seguridad y Cumplimiento

9. Plan de Pruebas

10. Recursos y Referencias

11. Contacto y Contribuciones

12. Licencia



</details>🎯 PARTE I: Visión Estratégica

1. Visión y Alcance

1.1. Propósito del Sistema

SIGC&T Rural es una plataforma web híbrida (Cloud/Edge) de propósito académico, científico y social que impulsa la educación técnica aplicada al campo colombiano mediante la integración de:





<div align="center">ComponenteDescripciónTecnología🌱 IoT AgrícolaMonitoreo inteligente con sensores embebidosBeagleBone Black + MQTT🤖 IA DiagnósticaClasificación de enfermedades en plantasTensorFlow/TFLite📚 Ecosistema EducativoRecursos digitales y laboratorios virtualesReact + Django🔬 Laboratorio HardwareClúster BeagleBone Black de 3 nodosDebian + Python☁️ Arquitectura HíbridaProcesamiento distribuido Cloud-EdgeRender + LAN



</div>🎓 Contexto Académico

El sistema actúa como un laboratorio digital accesible desde cualquier institución educativa o centro rural, permitiendo:



✅ Experimentación científica remota

✅ Toma de decisiones basadas en datos

✅ Formación técnica de calidad gratuita

✅ Inclusión tecnológica en zonas rurales

1.2. Objetivos del Negocio

📊 Objetivos Académicos (SENA - Proyecto Productivo ADSO)

IDObjetivoDescripciónCriterio de ÉxitoO-01Dashboard CentralizadoProveer visualización web de datos de sensores en tiempo realDashboard funcional con latencia <2sO-02Modelo de IAImplementar clasificación de enfermedades con alta precisiónAccuracy >85% en dataset de validaciónO-03Laboratorio HardwareEstablecer clúster de 3 BeagleBone Black operacional3 nodos comunicados vía MQTT/HTTPO-04Biblioteca EducativaCrear repositorio de recursos educativos curadosMínimo 20 recursos categorizadosO-05Cumplimiento ADSOEntregar artefactos completos del Proyecto Productivo100% de entregables aprobados

🎯 Objetivos Técnicos



<table>

<tr>

<td width="50%">Rendimiento



⚡ Latencia Cloud: <2s

⚡ Latencia Edge: <500ms

⚡ Uptime: >99%

⚡ Escalabilidad: 100+ nodos



</td>

<td width="50%">Calidad



🔒 Seguridad: JWT + HTTPS/TLS

📝 Documentación: 100% cobertura

🧪 Testing: >80% code coverage

🎨 UX: Mobile-first responsive



</td>

</tr>

</table>1.3. Alcance y Límites

✅ Dentro del Alcance



<table>

<tr>

<td width="50%">🌐 Cloud (Plataforma Web)



✅ Frontend React responsive (mobile-first)

✅ Backend Django con API RESTful

✅ Base de datos PostgreSQL + PostGIS

✅ Autenticación y autorización (JWT + roles)

✅ Dashboard con gráficos en tiempo real

✅ Sistema de alertas (email/push/WebSocket)

✅ Módulo de IA (inferencia cloud con .h5)

✅ CRUD de contenido académico

✅ Documentación interactiva (Swagger/ReDoc)



</td>

<td width="50%">🏠 Edge (Laboratorio Físico)



✅ Clúster 3x BeagleBone Black Rev C

✅ Broker MQTT (Mosquitto)

✅ Lectura de sensores (DHT22, humedad suelo)

✅ Captura de imágenes (cámara USB)

✅ Inferencia local con TensorFlow Lite

✅ Sincronización cloud automática

✅ Lógica "store-and-forward"

✅ Health checks y heartbeats

✅ Servicios systemd para autostart



</td>

</tr>

</table>🤖 Inteligencia Artificial



✅ Modelo CNN para clasificación de enfermedades (38 clases)

✅ Dataset: PlantVillage (tomate, papa, pimiento)

✅ Transfer Learning con MobileNetV2

✅ Modelos duales: .h5 (cloud) y .tflite (edge)

✅ Pipeline de reentrenamiento documentado

✅ Data augmentation y validación cruzada

📚 Contenido Educativo



✅ Cursos sobre IoT, IA, Agricultura 4.0

✅ Videos tutoriales (embebidos de YouTube)

✅ Laboratorios virtuales interactivos

✅ Documentación técnica completa

✅ Enlaces a recursos externos certificados

❌ Fuera del Alcance

⚠️ ExclusiónJustificaciónCreación de hardware personalizado (PCBs, sensores propios)Requiere fabricación y certificaciónAplicación móvil nativa (iOS/Android)Solo web responsive por alcanceIntegración directa con SofiaPlus del SENAFase futura planificadaComercialización o soporte empresarialProyecto académico sin fines de lucroProcesamiento de pagos o e-commerceNo aplica al caso de usoSoporte 24/7 en producciónMantenimiento académicoDespliegue en FPGAReferencia futura exploratoria

1.4. Actores y Roles





mermaid

graph LR subgraph "👥 Actores Humanos" A1[👨‍🌾 Agricultor] A2[🎓 Estudiante SENA] A3[👨‍💼 Administrador] end subgraph "🌾 Sistema SIGC&T Rural" SYS[Sistema Central] end subgraph "🖥️ Sistemas Externos" BBB[🖥️ Clúster BBB] PV[🌐 PlantVillage] end A1 -->|Monitorea| SYS A2 -->|Aprende| SYS A3 -->|Gestiona| SYS BBB -->|Telemetría| SYS SYS -.->|Dataset| PV

Tabla Detallada de Actores

ActorRolDescripciónInteracciones Principales👨‍🌾 AgricultorUsuario FinalPropietario/operador de cultivo que monitorea producción• Ver Dashboard de su proyecto<br>• Recibir alertas de anomalías<br>• Solicitar análisis IA de imágenes<br>• Consultar históricos de datos🎓 Estudiante SENAAprendizUsuario que consume contenido educativo y experimenta• Acceder a Biblioteca de Cursos<br>• Usar Laboratorios Virtuales<br>• Ver tutoriales y videos<br>• Descargar recursos (PDFs, datasets)👨‍💼 AdministradorGestor del SistemaB. Gómez - Mantiene plataforma y contenido• CRUD de Contenido Académico<br>• Gestión de usuarios<br>• Ver logs y métricas<br>• Configurar nodos Edge🖥️ Clúster BBBSistema Externo (Hardware)3 nodos BeagleBone Black en red local• Enviar telemetría vía MQTT<br>• Ejecutar inferencia IA local<br>• Sincronizar con Cloud<br>• Reportar estado (health checks)🌐 PlantVillageSistema Externo (Datos)Repositorio académico de Penn State University• N/A (uso offline)<br>• Fuente de datasets de entrenamiento

1.5. Impacto Social y ODS

El proyecto se alinea con los Objetivos de Desarrollo Sostenible (ODS) de la ONU:





<div align="center">ODSObjetivoContribución de SIGC&T RuralMostrar imagenHambre CeroOptimización de producción agrícola mediante decisiones basadas en datosMostrar imagenEducación de CalidadAcceso gratuito a formación técnica avanzada para zonas ruralesMostrar imagenIndustria e InnovaciónInfraestructura tecnológica IoT/IA para el campoMostrar imagenAlianzasColaboración academia-agricultura-tecnología



</div>🌍 Impacto Proyectado: Mejorar la productividad agrícola en un 15-25% mediante alertas tempranas y optimización de recursos, mientras se capacita a 500+ estudiantes SENA en tecnologías 4.0.

🏗️ PARTE II: Arquitectura del Sistema

2. Vistas de Arquitectura (Modelo C4)

2.1. Vista de Contexto del Sistema

Nivel 1 C4: Muestra el sistema como "caja negra" y sus interacciones con actores y sistemas externos.





mermaid

graph TD subgraph "👥 Actores Humanos" direction TB actor1[👨‍🌾 Agricultor<br/>Monitorea cultivos] actor2[🎓 Estudiante SENA<br/>Aprende y experimenta] actor3[👨‍💼 Administrador<br/>Gestiona plataforma] end subgraph "🌾 Sistema SIGC&T Rural" direction LR C4_Context["<b>Plataforma Web Híbrida</b><br/>Cloud + Edge<br/>━━━━━━━━━━━<br/>• Dashboard IoT<br/>• IA para diagnóstico<br/>• Biblioteca educativa<br/>• Gestión de nodos"] end subgraph "🔗 Sistemas Externos" direction TB C4_Sys_BBB["🖥️ <b>Clúster 3-BBB</b><br/>Hardware Edge<br/>━━━━━━━━━━━<br/>• Sensores IoT<br/>• Cámara<br/>• IA local TFLite"] C4_Sys_PV["🌐 <b>PlantVillage</b><br/>Penn State Univ.<br/>━━━━━━━━━━━<br/>• Datasets plantas<br/>• Imágenes etiquetadas"] C4_Sys_SENA["📚 <b>SENA SofiaPlus</b><br/>Plataforma SENA<br/>━━━━━━━━━━━<br/>• Integración futura<br/>• SSO potencial"] end actor1 -- "Consulta Dashboard<br/>Recibe Alertas<br/>(HTTPS)" --> C4_Context actor2 -- "Consume Cursos<br/>Usa Labs Virtuales<br/>(HTTPS)" --> C4_Context actor3 -- "Administra<br/>Contenido/Usuarios<br/>(HTTPS)" --> C4_Context C4_Context -- "Descarga Datasets<br/>(Offline, HTTP)" --> C4_Sys_PV C4_Sys_BBB -- "Envía Telemetría<br/>(MQTT/HTTPS)<br/>Sube Imágenes" --> C4_Context C4_Context -. "Integración Futura<br/>(OAuth 2.0)" .-> C4_Sys_SENA style C4_Context fill:#2e8b57,stroke:#fff,stroke-width:3px,color:#fff style C4_Sys_BBB fill:#ff6f00,stroke:#fff,stroke-width:2px style C4_Sys_PV fill:#4285f4,stroke:#fff,stroke-width:2px style C4_Sys_SENA fill:#ffd700,stroke:#333,stroke-width:2px

🔍 Descripción de Interacciones

InteracciónProtocoloDescripciónFrecuenciaUsuario → SistemaHTTPSNavegación web, autenticación JWTContinuaClúster BBB → SistemaMQTT/HTTPSTelemetría de sensores y resultados IACada 10s-30minSistema → PlantVillageHTTP (offline)Descarga dataset para entrenamientoUna vezSistema → SofiaPlusOAuth 2.0 (futuro)SSO y sincronización de estudiantesN/A (planificado)

2.2. Vista de Contenedores

Nivel 2 C4: Descompone el sistema en sus componentes principales (contenedores de software).





mermaid

graph TB subgraph "🌐 Internet" actor1["👤 Usuario<br/>(Navegador Web)<br/>━━━━━━━━━<br/>Chrome / Firefox / Safari"] end subgraph "☁️ Cloud Provider (Render / Railway / Heroku)" direction TB subgraph "🖥️ BBB-02 (AI Edge Node)" hw2["<b>Hardware:</b> BeagleBone Black Rev C<br/><b>OS:</b> Debian 11 (ARM)<br/><b>RAM:</b> 512 MB | <b>Storage:</b> 16GB µSD"] artifact_flask["🌶️ Flask API<br/>━━━━━━━━━━━<br/>• /classify_local<br/>• Port 5000"] artifact_tflite["🧠 TensorFlow Lite<br/>━━━━━━━━━━━<br/>• Interpreter ARM<br/>• model.tflite"] end subgraph "🖥️ BBB-03 (Sensor Node)" hw3["<b>Hardware:</b> BeagleBone Black Rev C<br/><b>OS:</b> Debian 11 (ARM)<br/><b>RAM:</b> 512 MB | <b>Storage:</b> 8GB eMMC"] artifact_gpio["⚡ sensor_reader.py<br/>━━━━━━━━━━━<br/>• Adafruit_BBIO<br/>• DHT22 Driver<br/>• I2C/GPIO"] artifact_cam["📷 camera_capture.py<br/>━━━━━━━━━━━<br/>• OpenCV<br/>• V4L2 Driver"] end end client -- "HTTPS:443<br/>TLS 1.3" --> artifact_react client -- "HTTPS:443 + WSS<br/>API Requests" --> artifact_django artifact_sync -- "HTTPS:443<br/>POST /api/v1/readings/" --> artifact_django artifact_gpio -- "MQTT:1883<br/>Topic: sigct/sensors/#" --> artifact_mqtt artifact_gpio -- "HTTP:5000<br/>POST /classify_local" --> artifact_flask artifact_flask -- "MQTT:1883<br/>Topic: sigct/ai/results" --> artifact_mqtt artifact_cam -.- artifact_gpio style client fill:#e1f5fe,stroke:#01579b,stroke-width:2px style artifact_react fill:#61dafb,stroke:#000,stroke-width:2px style artifact_django fill:#0c4b33,stroke:#fff,stroke-width:2px,color:#fff style node_db fill:#336791,stroke:#fff,stroke-width:2px,color:#fff style artifact_mqtt fill:#3c5a99,stroke:#fff,stroke-width:2px,color:#fff style artifact_flask fill:#000,stroke:#fff,stroke-width:2px,color:#fff style artifact_tflite fill:#ff6f00,stroke:#fff,stroke-width:2px

🖥️ Especificaciones de Hardware

NodoHardwareCPURAMStorageRedFunciónBBB-01BeagleBone Black Rev CAM335x 1GHz ARM Cortex-A8512 MB DDR38GB eMMCEthernet 10/100Gateway MQTTBBB-02BeagleBone Black Rev CAM335x 1GHz ARM Cortex-A8512 MB DDR316GB µSDEthernet 10/100IA EdgeBBB-03BeagleBone Black Rev CAM335x 1GHz ARM Cortex-A8512 MB DDR38GB eMMC + µSDEthernet 10/100Sensores IoT

2.4. Patrones Arquitectónicos

🎯 Patrones Aplicados

PatrónImplementaciónBeneficioMVCDjango (Model-View-Controller)Separación de responsabilidadesREST APIDjango REST FrameworkInteroperabilidad y escalabilidadPublish-SubscribeMQTT (Mosquitto)Desacoplamiento Edge-CloudGatewayBBB-01 como proxyCentralización de comunicaciónStore-and-ForwardCola en BBB-01Tolerancia a fallos de redRepositoryDjango ORMAbstracción de persistenciaObserverWebSockets (Django Channels)Actualizaciones en tiempo real

📊 PARTE III: Diseño Funcional

3. Vista de Casos de Uso

3.1. Diagrama General





mermaid

graph TB subgraph "🌾 Sistema SIGC&T Rural" U1(("📊 Ver Dashboard<br/>de Cultivo")) U2(("🚨 Recibir Alertas<br/>de IA")) U3(("🔍 Solicitar Análisis<br/>IA de Imagen")) U4(("📚 Acceder a Biblioteca<br/>de Cursos")) U5(("🧪 Usar Laboratorio<br/>Virtual")) U6(("⚙️ Administrar<br/>Contenido")) U7(("📡 Enviar Telemetría<br/>de Sensor")) U8(("🤖 Reportar Anomalía<br/>IA-Edge")) end actorA["👨‍🌾<br/><b>Agricultor</b>"] actorB["🎓<br/><b>Estudiante SENA</b>"] actorC["👨‍💼<br/><b>Administrador</b>"] actorS["🖥️<br/><b>Clúster BBB</b><br/>(Sistema)"] actorA --> U1 actorA --> U2 actorA --> U3 actorB --> U4 actorB --> U5 actorC --> U6 actorC --> U1 actorS --> U7 actorS --> U8 U2 -.-> U3 U7 -.-> U1 U8 -.-> U2 style U1 fill:#4caf50,stroke:#000,stroke-width:2px style U2 fill:#ff9800,stroke:#000,stroke-width:2px style U3 fill:#2196f3,stroke:#000,stroke-width:2px style U4 fill:#9c27b0,stroke:#fff,stroke-width:2px,color:#fff style U5 fill:#e91e63,stroke:#fff,stroke-width:2px,color:#fff style U6 fill:#607d8b,stroke:#fff,stroke-width:2px,color:#fff style U7 fill:#ff5722,stroke:#fff,stroke-width:2px,color:#fff style U8 fill:#f44336,stroke:#fff,stroke-width:2px,color:#fff

3.2. Casos de Uso Detallados

📊 UC-01: Ver Dashboard de Cultivo

Actor Principal: Agricultor, Administrador

Precondición: Usuario autenticado con proyecto asignado

Trigger: Usuario accede a /dashboard/:proyecto_id

Flujo Principal:



Sistema consulta últimas lecturas de sensores (últimos 5 min)

Sistema renderiza gráficos de series temporales (Recharts)

Sistema muestra estado de nodos Edge (online/offline/error)

Sistema muestra predicciones recientes de IA

Sistema establece conexión WebSocket para actualizaciones

Postcondición: Dashboard actualizado visible con datos en tiempo real

Excepciones:



E1: Sin datos disponibles → Mostrar mensaje informativo

E2: Nodo offline → Mostrar última lectura con timestamp

E3: Error de conexión → Modo offline con cache local

🚨 UC-02: Recibir Alertas de IA

Actor Principal: Agricultor

Trigger: Sistema detecta anomalía en análisis IA (confianza >70%)

Flujo Principal:



IA Edge (BBB-02) detecta enfermedad con confianza >70%

Sistema registra alerta en tabla Analisis_IA

Sistema envía notificación push vía WebSocket

Sistema envía email al agricultor (tarea Celery async)

Sistema marca alerta como "no vista" en dashboard

Postcondición: Usuario notificado por múltiples canales

Reglas de Negocio:



Solo alertar si confianza >70% y resultado != "Sano"

No duplicar alertas en ventana de 30 minutos

Priorizar alertas críticas (marchitamiento, plaga severa)

🔍 UC-03: Solicitar Análisis IA de Imagen

Actor Principal: Agricultor

Precondición: Usuario con créditos de análisis disponibles

Flujo Principal:



Usuario sube imagen (JPG/PNG, máx 5MB)

Sistema valida formato, tamaño y contenido

Sistema envía a endpoint POST /api/ia/classify/

Servicio IA procesa con modelo .h5 (MobileNetV2)

Sistema devuelve predicción + confianza + recomendaciones

Sistema guarda resultado en tabla Analisis_IA

Sistema decrementa crédito del usuario

Postcondición: Resultado visible, registro almacenado, crédito descontado

Excepciones:



E1: Imagen corrupta → Rechazar con error 400

E2: Sin créditos → Informar y sugerir suscripción

E3: Timeout IA → Reintentar hasta 3 veces

3.3. Flujos de Trabajo

🔄 Flujo de Telemetría (Edge → Cloud)





mermaid

sequenceDiagram participant BBB3 as BBB-03 (Sensores) participant BBB1 as BBB-01 (Gateway) participant Cloud as Backend Django participant DB as PostgreSQL loop Cada 10 segundos BBB3->>BBB3: Leer DHT22 (temp + humedad) BBB3->>BBB1: Publicar MQTT<br/>Topic: sigct/sensors/temp BBB1->>BBB1: Almacenar en cola (Redis) alt Conexión Cloud disponible BBB1->>Cloud: POST /api/v1/readings/<br/>Payload: {sensor_id, valor, timestamp} Cloud->>DB: INSERT INTO Lecturas_Sensores Cloud-->>BBB1: 201 Created BBB1->>BBB1: Limpiar cola else Sin conexión BBB1->>BBB1: Mantener en cola (store-and-forward) end end

🤖 Flujo de Inferencia IA Híbrida





mermaid

sequenceDiagram participant User as Usuario Web participant Frontend as React App participant Backend as Django API participant AI_Cloud as Servicio IA Cloud participant BBB2 as BBB-02 (IA Edge) alt Modo Cloud (usuario sube imagen) User->>Frontend: Sube imagen Frontend->>Backend: POST /api/ia/classify/<br/>multipart/form-data Backend->>AI_Cloud: Ejecutar inferencia (.h5) AI_Cloud->>AI_Cloud: Preprocesar + Predicción AI_Cloud-->>Backend: {prediccion, confianza} Backend->>Backend: Guardar en Analisis_IA Backend-->>Frontend: 200 OK + resultado Frontend-->>User: Mostrar predicción else Note over BBB2: Modo Edge (captura automática) BBB2->>BBB2: Capturar imagen cada 30 min BBB2->>BBB2: Inferencia TFLite (.tflite) alt Detección de anomalía BBB2->>BBB1: MQTT: alerta<br/>Topic: sigct/ai/results BBB1->>Backend: POST /api/ia/edge-report/ Backend->>Backend: Guardar + Enviar notificación Backend->>User: Email + Push else Planta sana BBB2->>BBB2: Descartar (no reportar) end end

💾 PARTE IV: Modelo de Datos

4. Vista de Datos

4.1. Modelo Entidad-Relación





mermaid

erDiagram Usuarios ||--o{ Proyectos : "posee" Usuarios ||--o{ Analisis_IA : "solicita" Proyectos ||--o{ Nodos_Edge : "contiene" Proyectos ||--o{ Analisis_IA : "registra" Nodos_Edge ||--o{ Sensores : "tiene" Sensores ||--o{ Lecturas_Sensores : "genera" Contenido_Academico }o..o{ Usuarios : "consulta" Usuarios { UUID id PK string username UK string email UK string password_hash string role "agricultor|estudiante|admin" datetime created_at datetime last_login boolean is_active } Proyectos { UUID id PK UUID usuario_id FK string nombre_proyecto text descripcion string ubicacion geometry coordenadas "PostGIS" datetime created_at datetime updated_at } Nodos_Edge { UUID id PK UUID proyecto_id FK string nombre_nodo UK string tipo_hardware "BBB|RPi|Arduino" string estado "online|offline|error" string ip_local datetime ultimo_heartbeat jsonb metadata } Sensores { UUID id PK UUID nodo_id FK string tipo_sensor "temp|humedad|luz|ph" string pin_gpio float valor_min float valor_max string unidad_medida boolean activo } Lecturas_Sensores { UUID id PK UUID sensor_id FK float valor datetime timestamp string calidad "buena|sospechosa|error" } Analisis_IA { UUID id PK UUID proyecto_id FK UUID usuario_id FK string imagen_url string resultado_prediccion float confianza string origen "cloud|edge" string feedback_usuario datetime timestamp jsonb metadata } Contenido_Academico { UUID id PK string titulo text descripcion string tipo_contenido "curso|video|pdf|lab" string url_recurso string tags integer duracion_minutos string nivel "basico|intermedio|avanzado" datetime created_at }

4.2. Diccionario de Datos Completo

📋 Tabla: Usuarios

Propósito: Almacena credenciales y perfiles de todos los usuarios del sistema.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único universalPKusernameVARCHAR(80)No-Nombre de usuario único (alfanumérico + guion bajo)UKemailVARCHAR(120)No-Correo electrónico único, validadoUKpassword_hashVARCHAR(255)No-Hash Bcrypt con salt (cost factor 12)-roleVARCHAR(20)No'agricultor'Rol del usuario: 'agricultor', 'estudiante', 'admin'IDXcreated_atTIMESTAMPNoNOW()Fecha de registroIDXlast_loginTIMESTAMPSíNULLÚltima sesión iniciada-is_activeBOOLEANNoTRUEEstado de la cuentaIDX

Restricciones:





sql

CHECK (role IN ('agricultor', 'estudiante', 'admin'))CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}raph "Frontend Container" WebApp["⚛️ <b>React App</b><br/>━━━━━━━━━<br/>• SPA con Vite<br/>• TailwindCSS<br/>• Recharts/D3.js<br/>• Axios API client"] end subgraph "Backend Container" APIServer["🐍 <b>Django API</b><br/>━━━━━━━━━<br/>• Django REST Framework<br/>• JWT Auth<br/>• WebSockets (Channels)<br/>• Gunicorn + Nginx"] end subgraph "AI Service" AI_Service["🤖 <b>Servicio IA</b><br/>━━━━━━━━━<br/>• TensorFlow/Keras<br/>• Modelo .h5<br/>• Endpoint /api/ia/classify"] end subgraph "Database" Database[("💾 <b>PostgreSQL 15</b><br/>━━━━━━━━━<br/>• Usuarios<br/>• Proyectos<br/>• Telemetría<br/>• Análisis IA")] end WebApp -- "Consume<br/>REST API" --> APIServer APIServer -- "Lee/Escribe<br/>SQL" --> Database APIServer -- "Ejecuta<br/>Inferencia" --> AI_Service end subgraph "🏠 Laboratorio Edge (Red Local 192.168.1.x)" direction TB subgraph "BBB-01 Gateway" Cluster_GW["🌐 <b>Gateway</b><br/>━━━━━━━━━<br/>• Broker Mosquitto<br/>• Script Sync (Python)<br/>• Store-and-Forward"] end subgraph "BBB-02 IA-Edge" Cluster_IA["🧠 <b>IA Local</b><br/>━━━━━━━━━<br/>• API Flask<br/>• TensorFlow Lite<br/>• Modelo .tflite"] end subgraph "BBB-03 Sensores" Cluster_IoT["📡 <b>IoT Node</b><br/>━━━━━━━━━<br/>• Sensores DHT22<br/>• Humedad suelo<br/>• Cámara USB"] end Cluster_IoT -- "Publica<br/>MQTT (LAN)" --> Cluster_GW Cluster_IoT -- "POST Imagen<br/>HTTP (LAN)" --> Cluster_IA Cluster_IA -- "Reporta<br/>MQTT (LAN)" --> Cluster_GW end actor1 -- "HTTPS<br/>443" --> WebApp actor1 -- "HTTPS/WSS<br/>API + WebSockets" --> APIServer Cluster_GW -- "HTTPS<br/>POST /api/readings/" --> APIServer style WebApp fill:#61dafb,stroke:#000,stroke-width:2px style APIServer fill:#0c4b33,stroke:#fff,stroke-width:2px,color:#fff style AI_Service fill:#ff6f00,stroke:#fff,stroke-width:2px style Database fill:#336791,stroke:#fff,stroke-width:2px,color:#fff style Cluster_GW fill:#orange,stroke:#000,stroke-width:2px style Cluster_IA fill:#ff4444,stroke:#000,stroke-width:2px style Cluster_IoT fill:#4444ff,stroke:#fff,stroke-width:2px,color:#fff

📦 Tabla de Contenedores

ContenedorTecnologíaPropósitoPuertoResponsabilidadesReact AppVite + React 18 + TailwindCSSInterfaz de usuario SPA443 (HTTPS)Renderizado, navegación, visualizaciónDjango APIPython 3.10 + Django 4 + DRFLógica de negocio y orquestación8000 → 443CRUD, autenticación, orquestación EdgeServicio IATensorFlow + KerasInferencia de clasificaciónInternoPredicción de enfermedades (cloud)PostgreSQLPostgreSQL 15 + PostGISAlmacenamiento persistente5432 (interno)Datos estructurados y geoespacialesGateway (BBB-01)Mosquitto + PythonBroker MQTT y sincronización1883 (MQTT)Recopilación y envío a cloudIA Edge (BBB-02)Flask + TFLiteInferencia local de baja latencia5000 (HTTP)Predicción edge con TensorFlow LiteIoT Node (BBB-03)Python + Adafruit_BBIOLectura de sensores y capturaN/A (cliente)Adquisición de datos físicos

2.3. Vista de Despliegue

Diagrama UML de Despliegue: Muestra la infraestructura física y software desplegado.





mermaid

graph TB subgraph "🌐 Cliente (Anywhere)" client["💻 <b>Dispositivo del Usuario</b><br/>━━━━━━━━━━━━━━━<br/>• PC / Laptop<br/>• Tablet / Móvil<br/>• Navegador moderno"] end subgraph "☁️ Cloud Infrastructure (PaaS - Render)" direction LR subgraph "🐳 Compute Node (Docker Container)" direction TB artifact_react["📦 <b>frontend-build/</b><br/>━━━━━━━━━━━<br/>• index.html<br/>• bundle.js<br/>• assets/"] artifact_django["📦 <b>Django App</b><br/>━━━━━━━━━━━<br/>• Gunicorn WSGI<br/>• Django Channels<br/>• Celery Workers"] end subgraph "💾 Database Node (Managed Service)" node_db["🗄️ <b>PostgreSQL 15</b><br/>━━━━━━━━━━━<br/>• Persistent Volume<br/>• Automated Backups<br/>• Connection Pooling"] end artifact_django -- "TCP/IP:5432<br/>psycopg2" --> node_db end subgraph "🏠 Laboratorio Físico (LAN 192.168.1.x)" direction TB subgraph "🖥️ BBB-01 (Gateway Node)" hw1["<b>Hardware:</b> BeagleBone Black Rev C<br/><b>OS:</b> Debian 11 (ARM)<br/><b>RAM:</b> 512 MB | <b>Storage:</b> 8GB eMMC"] artifact_mqtt["📡 Mosquitto 2.x<br/>━━━━━━━━━━━<br/>• Broker MQTT<br/>• Port 1883"] artifact_sync["🔄 sync_service.py<br/>━━━━━━━━━━━<br/>• Paho-MQTT Client<br/>• Requests Library<br/>• Systemd Service"] end subg)

Índices:





sql

CREATE INDEX idx_usuarios_role ON Usuarios(role);CREATE INDEX idx_usuarios_created_at ON Usuarios(created_at);CREATE INDEX idx_usuarios_is_active ON Usuarios(is_active);

📋 Tabla: Proyectos

Propósito: Agrupa nodos Edge y datos para un usuario específico.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único del proyectoPKusuario_idUUIDNo-Referencia a Usuarios(id)FK, IDXnombre_proyectoVARCHAR(100)No-Nombre descriptivo del proyecto-descripcionTEXTSíNULLDetalles adicionales del proyecto-ubicacionVARCHAR(255)SíNULLDirección o descripción geográfica-coordenadasGEOMETRY(Point, 4326)SíNULLLat/Lon en formato PostGISGISTcreated_atTIMESTAMPNoNOW()Fecha de creaciónIDXupdated_atTIMESTAMPNoNOW()Última modificación (trigger automático)-

Relaciones:





sql

FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE

Trigger de actualización:





sql

CREATE TRIGGER update_proyectos_updated_atBEFORE UPDATE ON ProyectosFOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

📋 Tabla: Nodos_Edge

Propósito: Representa un dispositivo de hardware físico en un proyecto.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único del nodoPKproyecto_idUUIDNo-Referencia a Proyectos(id)FK, IDXnombre_nodoVARCHAR(50)No-Ej: "BBB-01-Gateway"UKtipo_hardwareVARCHAR(30)No-Ej: "BeagleBone Black Rev C"-estadoVARCHAR(20)No'offline'Estado actualIDXip_localINETSíNULLDirección IP en la LAN-ultimo_heartbeatTIMESTAMPSíNULLÚltima señal de vidaIDXmetadataJSONBSí'{}'Datos adicionales (firmware, MAC, etc.)GIN

Restricciones:





sql

CHECK (estado IN ('online', 'offline', 'error', 'maintenance'))

Trigger de alerta:





sql

-- Alerta automática si ultimo_heartbeat > 5 minutosCREATE OR REPLACE FUNCTION check_node_heartbeat()RETURNS TRIGGER AS $BEGIN IF (NEW.ultimo_heartbeat < NOW() - INTERVAL '5 minutes') THEN -- Insertar alerta en tabla de alertas INSERT INTO Alertas (nodo_id, tipo, mensaje) VALUES (NEW.id, 'heartbeat_timeout', 'Nodo sin respuesta por >5 min'); END IF; RETURN NEW;END;$ LANGUAGE plpgsql;

📋 Tabla: Sensores

Propósito: Define un sensor específico conectado a un Nodo Edge.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único del sensorPKnodo_idUUIDNo-Referencia a Nodos_Edge(id)FK, IDXtipo_sensorVARCHAR(50)No-Ej: "temperatura", "humedad_suelo"IDXpin_gpioVARCHAR(10)SíNULLPin físico (ej: "P8_10")-valor_minREALSíNULLUmbral mínimo esperado-valor_maxREALSíNULLUmbral máximo esperado-unidad_medidaVARCHAR(20)SíNULLEj: "°C", "%", "lux"-activoBOOLEANNoTRUESi el sensor está operativoIDX

Relaciones:





sql

FOREIGN KEY (nodo_id) REFERENCES Nodos_Edge(id) ON DELETE CASCADE

📋 Tabla: Lecturas_Sensores

Propósito: Base de datos de series temporales (TSDB) para mediciones.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único de la lecturaPKsensor_idUUIDNo-Referencia a Sensores(id)FK, IDXvalorREALNo-Valor numérico de la medición-timestampTIMESTAMPNoNOW()Fecha y hora UTC de la lecturaBRINcalidadVARCHAR(20)No'buena'Calidad del dato-

Optimizaciones:





sql

-- Particionamiento por rango de fecha (mensual)CREATE TABLE Lecturas_Sensores_2025_11 PARTITION OF Lecturas_SensoresFOR VALUES FROM ('2025-11-01') TO ('2025-12-01');-- Índice BRIN para queries temporales eficientesCREATE INDEX idx_lecturas_timestamp ON Lecturas_Sensores USING BRIN(timestamp);-- Política de retención: 1 añoCREATE OR REPLACE FUNCTION cleanup_old_readings()RETURNS VOID AS $BEGIN DELETE FROM Lecturas_Sensores WHERE timestamp < NOW() - INTERVAL '1 year';END;$ LANGUAGE plpgsql;

📋 Tabla: Analisis_IA

Propósito: Registra cada ejecución del modelo de IA (Cloud y Edge).



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único del análisisPKproyecto_idUUIDNo-Referencia a Proyectos(id)FK, IDXusuario_idUUIDSíNULLUsuario que solicitó (NULL si automático)FK, IDXimagen_urlVARCHAR(255)No-URL S3/local de la imagen analizada-resultado_prediccionVARCHAR(100)No-Ej: "Tomate_Sano", "Papa_TizonTardio"IDXconfianzaREALNo-Nivel de confianza (0.0 a 1.0)-origenVARCHAR(10)No-'cloud' o 'edge'IDXfeedback_usuarioVARCHAR(100)SíNULLCorrección manual-timestampTIMESTAMPNoNOW()Fecha y hora UTC del análisisIDXmetadataJSONBSí'{}'Info adicional (tiempo inferencia, modelo usado)GIN

Restricciones:





sql

CHECK (confianza BETWEEN 0.0 AND 1.0)CHECK (origen IN ('cloud', 'edge'))

📋 Tabla: Contenido_Academico

Propósito: Almacena metadatos de cursos, videos, PDFs y laboratorios.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único del contenidoPKtituloVARCHAR(255)No-Título del curso/video/recurso-descripcionTEXTSíNULLResumen del contenido-tipo_contenidoVARCHAR(30)No-'curso', 'video', 'pdf', 'lab_virtual'IDXurl_recursoVARCHAR(255)SíNULLEnlace externo o ruta interna-tagsVARCHAR(255)SíNULLCSV de etiquetas: "iot,arduino,sensores"-duracion_minutosINTEGERSíNULLDuración estimada-nivelVARCHAR(20)No'basico''basico', 'intermedio', 'avanzado'IDXcreated_atTIMESTAMPNoNOW()Fecha de publicaciónIDX

Restricciones:





sql

CHECK (tipo_contenido IN ('curso', 'video', 'pdf', 'lab_virtual'))CHECK (nivel IN ('basico', 'intermedio', 'avanzado'))CHECK (duracion_minutos > 0)

4.3. Estrategias de Optimización

🚀 Índices Estratégicos





sql

-- Búsqueda de contenido por tipo y nivelCREATE INDEX idx_contenido_tipo_nivel ON Contenido_Academico(tipo_contenido, nivel);-- Búsqueda de análisis por proyecto y rango de fechasCREATE INDEX idx_analisis_proyecto_timestamp ON Analisis_IA(proyecto_id, timestamp DESC);-- Búsqueda de lecturas por sensor y timestamp (BRIN para series temporales)CREATE INDEX idx_lecturas_sensor_timestamp ON Lecturas_Sensores USING BRIN(sensor_id, timestamp);

💾 Vistas Materializadas





sql

-- Vista precomputada de últimas lecturas por proyectoCREATE MATERIALIZED VIEW mv_ultimas_lecturas ASSELECT p.id AS proyecto_id, s.tipo_sensor, l.valor, l.timestamp, ROW_NUMBER() OVER (PARTITION BY s.tipo_sensor ORDER BY l.timestamp DESC) as rnFROM Proyectos pJOIN Nodos_Edge n ON n.proyecto_id = p.idJOIN Sensores s ON s.nodo_id = n.idJOIN Lecturas_Sensores l ON l.sensor_id = s.id;-- Refresh periódico cada 1 minutoCREATE OR REPLACE FUNCTION refresh_mv_ultimas_lecturas()RETURNS VOID AS $BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ultimas_lecturas;END;$ LANGUAGE plpgsql;

Este es el MASTERDOC.md definitivo completo. Por limitaciones de espacio, continuaré en el siguiente mensaje con las PARTES V, VI y VII que incluyen:



⚙️ Implementación (Backend, Frontend, Edge)

🤖 Inteligencia Artificial (Pipeline, Métricas)

📚 Recursos, Stack Tecnológico, Contacto

¿Quieres que continúe con las partes restantes? 🚀raph "Frontend Container"

WebApp["⚛️ <b>React App</b><br/>━━━━━━━━━<br/>• SPA con Vite<br/>• TailwindCSS<br/>• Recharts/D3.js<br/>• Axios API client"]

end





subgraph "Backend Container" APIServer["🐍 <b>Django API</b><br/>━━━━━━━━━<br/>• Django REST Framework<br/>• JWT Auth<br/>• WebSockets (Channels)<br/>• Gunicorn + Nginx"] end subgraph "AI Service" AI_Service["🤖 <b>Servicio IA</b><br/>━━━━━━━━━<br/>• TensorFlow/Keras<br/>• Modelo .h5<br/>• Endpoint /api/ia/classify"] end subgraph "Database" Database[("💾 <b>PostgreSQL 15</b><br/>━━━━━━━━━<br/>• Usuarios<br/>• Proyectos<br/>• Telemetría<br/>• Análisis IA")] end WebApp -- "Consume<br/>REST API" --> APIServer APIServer -- "Lee/Escribe<br/>SQL" --> Database APIServer -- "Ejecuta<br/>Inferencia" --> AI_Serviceendsubgraph "🏠 Laboratorio Edge (Red Local 192.168.1.x)" direction TB subgraph "BBB-01 Gateway" Cluster_GW["🌐 <b>Gateway</b><br/>━━━━━━━━━<br/>• Broker Mosquitto<br/>• Script Sync (Python)<br/>• Store-and-Forward"] end subgraph "BBB-02 IA-Edge" Cluster_IA["🧠 <b>IA Local</b><br/>━━━━━━━━━<br/>• API Flask<br/>• TensorFlow Lite<br/>• Modelo .tflite"] end subgraph "BBB-03 Sensores" Cluster_IoT["📡 <b>IoT Node</b><br/>━━━━━━━━━<br/>• Sensores DHT22<br/>• Humedad suelo<br/>• Cámara USB"] end Cluster_IoT -- "Publica<br/>MQTT (LAN)" --> Cluster_GW Cluster_IoT -- "POST Imagen<br/>HTTP (LAN)" --> Cluster_IA Cluster_IA -- "Reporta<br/>MQTT (LAN)" --> Cluster_GWendactor1 -- "HTTPS<br/>443" --> WebAppactor1 -- "HTTPS/WSS<br/>API + WebSockets" --> APIServerCluster_GW -- "HTTPS<br/>POST /api/readings/" --> APIServerstyle WebApp fill:#61dafb,stroke:#000,stroke-width:2pxstyle APIServer fill:#0c4b33,stroke:#fff,stroke-width:2px,color:#fffstyle AI_Service fill:#ff6f00,stroke:#fff,stroke-width:2pxstyle Database fill:#336791,stroke:#fff,stroke-width:2px,color:#fffstyle Cluster_GW fill:#orange,stroke:#000,stroke-width:2pxstyle Cluster_IA fill:#ff4444,stroke:#000,stroke-width:2pxstyle Cluster_IoT fill:#4444ff,stroke:#fff,stroke-width:2px,color:#fff





#### 📦 Tabla de Contenedores| Contenedor | Tecnología | Propósito | Puerto | Responsabilidades ||------------|------------|-----------|--------|-------------------|| **React App** | Vite + React 18 + TailwindCSS | Interfaz de usuario SPA | 443 (HTTPS) | Renderizado, navegación, visualización || **Django API** | Python 3.10 + Django 4 + DRF | Lógica de negocio y orquestación | 8000 → 443 | CRUD, autenticación, orquestación Edge || **Servicio IA** | TensorFlow + Keras | Inferencia de clasificación | Interno | Predicción de enfermedades (cloud) || **PostgreSQL** | PostgreSQL 15 + PostGIS | Almacenamiento persistente | 5432 (interno) | Datos estructurados y geoespaciales || **Gateway (BBB-01)** | Mosquitto + Python | Broker MQTT y sincronización | 1883 (MQTT) | Recopilación y envío a cloud || **IA Edge (BBB-02)** | Flask + TFLite | Inferencia local de baja latencia | 5000 (HTTP) | Predicción edge con TensorFlow Lite || **IoT Node (BBB-03)** | Python + Adafruit_BBIO | Lectura de sensores y captura | N/A (cliente) | Adquisición de datos físicos |---### 2.3. Vista de Despliegue**Diagrama UML de Despliegue**: Muestra la infraestructura física y software desplegado.```mermaidgraph TB subgraph "🌐 Cliente (Anywhere)" client["💻 <b>Dispositivo del Usuario</b><br/>━━━━━━━━━━━━━━━<br/>• PC / Laptop<br/>• Tablet / Móvil<br/>• Navegador moderno"] end subgraph "☁️ Cloud Infrastructure (PaaS - Render)" direction LR subgraph "🐳 Compute Node (Docker Container)" direction TB artifact_react["📦 <b>frontend-build/</b><br/>━━━━━━━━━━━<br/>• index.html<br/>• bundle.js<br/>• assets/"] artifact_django["📦 <b>Django App</b><br/>━━━━━━━━━━━<br/>• Gunicorn WSGI<br/>• Django Channels<br/>• Celery Workers"] end subgraph "💾 Database Node (Managed Service)" node_db["🗄️ <b>PostgreSQL 15</b><br/>━━━━━━━━━━━<br/>• Persistent Volume<br/>• Automated Backups<br/>• Connection Pooling"] end artifact_django -- "TCP/IP:5432<br/>psycopg2" --> node_db end subgraph "🏠 Laboratorio Físico (LAN 192.168.1.x)" direction TB subgraph "🖥️ BBB-01 (Gateway Node)" hw1["<b>Hardware:</b> BeagleBone Black Rev C<br/><b>OS:</b> Debian 11 (ARM)<br/><b>RAM:</b> 512 MB | <b>Storage:</b> 8GB eMMC"] artifact_mqtt["📡 Mosquitto 2.x<br/>━━━━━━━━━━━<br/>• Broker MQTT<br/>• Port 1883"] artifact_sync["🔄 sync_service.py<br/>━━━━━━━━━━━<br/>• Paho-MQTT Client<br/>• Requests Library<br/>• Systemd Service"] end  

        subg🌾 SIGC&T Rural - Documento Maestro de Arquitectura de Software



<div align="center">Mostrar imagen

Sistema Integrado de Gestión del Conocimiento y Tecnología Rural

Mostrar imagenMostrar imagenMostrar imagenMostrar imagenMostrar imagenMostrar imagenMostrar imagen

Proyecto Productivo ADSO - SENA Colombia

🔗 Accesos Rápidos

Mostrar imagenMostrar imagenMostrar imagenMostrar imagenMostrar imagen

Última actualización: 03 de Noviembre, 2025

Versión: 5.0 Definitiva

Estado: ✅ Arquitectura Completa y Validada

Autor: Bernardo A. Gómez Montoya

Tipo: Documento de Arquitectura de Software (DAS)



</div>📋 Información del Documento

CampoValorVersión5.0Estado✅ Arquitectura DefinitivaFecha03-Nov-2025AutorB. Gómez (Asistente: Claude AI)TipoDocumento de Arquitectura de Software (DAS)FormatoMarkdown + Mermaid para GitHubProyectoSIGC&T Rural - Proyecto Productivo ADSOInstituciónSENA Colombia

📑 Tabla de Contenidos Interactiva



<details open>

<summary><b>🎯 PARTE I: Visión Estratégica</b></summary>1. Visión y Alcance1.1. Propósito del Sistema

1.2. Objetivos del Negocio

1.3. Alcance y Límites

1.4. Actores y Roles

1.5. Impacto Social y ODS



</details>

<details open>

<summary><b>🏗️ PARTE II: Arquitectura del Sistema</b></summary>2. Vistas de Arquitectura (Modelo C4)2.1. Vista de Contexto del Sistema

2.2. Vista de Contenedores

2.3. Vista de Despliegue

2.4. Patrones Arquitectónicos



</details>

<details open>

<summary><b>📊 PARTE III: Diseño Funcional</b></summary>3. Vista de Casos de Uso3.1. Diagrama General

3.2. Casos de Uso Detallados

3.3. Flujos de Trabajo



</details>

<details open>

<summary><b>💾 PARTE IV: Modelo de Datos</b></summary>4. Vista de Datos4.1. Modelo Entidad-Relación

4.2. Diccionario de Datos Completo

4.3. Estrategias de Optimización



</details>

<details open>

<summary><b>⚙️ PARTE V: Implementación</b></summary>5. Vista de Implementación5.1. Estructura del Repositorio

5.2. Backend Cloud (Django)

5.3. Frontend Cloud (React)

5.4. Edge Computing (BeagleBone)



</details>

<details open>

<summary><b>🤖 PARTE VI: Inteligencia Artificial</b></summary>6. Arquitectura de IA6.1. Pipeline de Entrenamiento

6.2. Pipeline de Inferencia Híbrida

6.3. Modelo Seleccionado: MobileNetV2

6.4. Métricas de Rendimiento



</details>

<details open>

<summary><b>📚 PARTE VII: Recursos y Gestión</b></summary>7. Stack Tecnológico

8. Seguridad y Cumplimiento

9. Plan de Pruebas

10. Recursos y Referencias

11. Contacto y Contribuciones

12. Licencia



</details>🎯 PARTE I: Visión Estratégica

1. Visión y Alcance

1.1. Propósito del Sistema

SIGC&T Rural es una plataforma web híbrida (Cloud/Edge) de propósito académico, científico y social que impulsa la educación técnica aplicada al campo colombiano mediante la integración de:





<div align="center">ComponenteDescripciónTecnología🌱 IoT AgrícolaMonitoreo inteligente con sensores embebidosBeagleBone Black + MQTT🤖 IA DiagnósticaClasificación de enfermedades en plantasTensorFlow/TFLite📚 Ecosistema EducativoRecursos digitales y laboratorios virtualesReact + Django🔬 Laboratorio HardwareClúster BeagleBone Black de 3 nodosDebian + Python☁️ Arquitectura HíbridaProcesamiento distribuido Cloud-EdgeRender + LAN



</div>🎓 Contexto Académico

El sistema actúa como un laboratorio digital accesible desde cualquier institución educativa o centro rural, permitiendo:



✅ Experimentación científica remota

✅ Toma de decisiones basadas en datos

✅ Formación técnica de calidad gratuita

✅ Inclusión tecnológica en zonas rurales

1.2. Objetivos del Negocio

📊 Objetivos Académicos (SENA - Proyecto Productivo ADSO)

IDObjetivoDescripciónCriterio de ÉxitoO-01Dashboard CentralizadoProveer visualización web de datos de sensores en tiempo realDashboard funcional con latencia <2sO-02Modelo de IAImplementar clasificación de enfermedades con alta precisiónAccuracy >85% en dataset de validaciónO-03Laboratorio HardwareEstablecer clúster de 3 BeagleBone Black operacional3 nodos comunicados vía MQTT/HTTPO-04Biblioteca EducativaCrear repositorio de recursos educativos curadosMínimo 20 recursos categorizadosO-05Cumplimiento ADSOEntregar artefactos completos del Proyecto Productivo100% de entregables aprobados

🎯 Objetivos Técnicos



<table>

<tr>

<td width="50%">Rendimiento



⚡ Latencia Cloud: <2s

⚡ Latencia Edge: <500ms

⚡ Uptime: >99%

⚡ Escalabilidad: 100+ nodos



</td>

<td width="50%">Calidad



🔒 Seguridad: JWT + HTTPS/TLS

📝 Documentación: 100% cobertura

🧪 Testing: >80% code coverage

🎨 UX: Mobile-first responsive



</td>

</tr>

</table>1.3. Alcance y Límites

✅ Dentro del Alcance



<table>

<tr>

<td width="50%">🌐 Cloud (Plataforma Web)



✅ Frontend React responsive (mobile-first)

✅ Backend Django con API RESTful

✅ Base de datos PostgreSQL + PostGIS

✅ Autenticación y autorización (JWT + roles)

✅ Dashboard con gráficos en tiempo real

✅ Sistema de alertas (email/push/WebSocket)

✅ Módulo de IA (inferencia cloud con .h5)

✅ CRUD de contenido académico

✅ Documentación interactiva (Swagger/ReDoc)



</td>

<td width="50%">🏠 Edge (Laboratorio Físico)



✅ Clúster 3x BeagleBone Black Rev C

✅ Broker MQTT (Mosquitto)

✅ Lectura de sensores (DHT22, humedad suelo)

✅ Captura de imágenes (cámara USB)

✅ Inferencia local con TensorFlow Lite

✅ Sincronización cloud automática

✅ Lógica "store-and-forward"

✅ Health checks y heartbeats

✅ Servicios systemd para autostart



</td>

</tr>

</table>🤖 Inteligencia Artificial



✅ Modelo CNN para clasificación de enfermedades (38 clases)

✅ Dataset: PlantVillage (tomate, papa, pimiento)

✅ Transfer Learning con MobileNetV2

✅ Modelos duales: .h5 (cloud) y .tflite (edge)

✅ Pipeline de reentrenamiento documentado

✅ Data augmentation y validación cruzada

📚 Contenido Educativo



✅ Cursos sobre IoT, IA, Agricultura 4.0

✅ Videos tutoriales (embebidos de YouTube)

✅ Laboratorios virtuales interactivos

✅ Documentación técnica completa

✅ Enlaces a recursos externos certificados

❌ Fuera del Alcance

⚠️ ExclusiónJustificaciónCreación de hardware personalizado (PCBs, sensores propios)Requiere fabricación y certificaciónAplicación móvil nativa (iOS/Android)Solo web responsive por alcanceIntegración directa con SofiaPlus del SENAFase futura planificadaComercialización o soporte empresarialProyecto académico sin fines de lucroProcesamiento de pagos o e-commerceNo aplica al caso de usoSoporte 24/7 en producciónMantenimiento académicoDespliegue en FPGAReferencia futura exploratoria

1.4. Actores y Roles





mermaid

graph LR subgraph "👥 Actores Humanos" A1[👨‍🌾 Agricultor] A2[🎓 Estudiante SENA] A3[👨‍💼 Administrador] end subgraph "🌾 Sistema SIGC&T Rural" SYS[Sistema Central] end subgraph "🖥️ Sistemas Externos" BBB[🖥️ Clúster BBB] PV[🌐 PlantVillage] end A1 -->|Monitorea| SYS A2 -->|Aprende| SYS A3 -->|Gestiona| SYS BBB -->|Telemetría| SYS SYS -.->|Dataset| PV

Tabla Detallada de Actores

ActorRolDescripciónInteracciones Principales👨‍🌾 AgricultorUsuario FinalPropietario/operador de cultivo que monitorea producción• Ver Dashboard de su proyecto<br>• Recibir alertas de anomalías<br>• Solicitar análisis IA de imágenes<br>• Consultar históricos de datos🎓 Estudiante SENAAprendizUsuario que consume contenido educativo y experimenta• Acceder a Biblioteca de Cursos<br>• Usar Laboratorios Virtuales<br>• Ver tutoriales y videos<br>• Descargar recursos (PDFs, datasets)👨‍💼 AdministradorGestor del SistemaB. Gómez - Mantiene plataforma y contenido• CRUD de Contenido Académico<br>• Gestión de usuarios<br>• Ver logs y métricas<br>• Configurar nodos Edge🖥️ Clúster BBBSistema Externo (Hardware)3 nodos BeagleBone Black en red local• Enviar telemetría vía MQTT<br>• Ejecutar inferencia IA local<br>• Sincronizar con Cloud<br>• Reportar estado (health checks)🌐 PlantVillageSistema Externo (Datos)Repositorio académico de Penn State University• N/A (uso offline)<br>• Fuente de datasets de entrenamiento

1.5. Impacto Social y ODS

El proyecto se alinea con los Objetivos de Desarrollo Sostenible (ODS) de la ONU:





<div align="center">ODSObjetivoContribución de SIGC&T RuralMostrar imagenHambre CeroOptimización de producción agrícola mediante decisiones basadas en datosMostrar imagenEducación de CalidadAcceso gratuito a formación técnica avanzada para zonas ruralesMostrar imagenIndustria e InnovaciónInfraestructura tecnológica IoT/IA para el campoMostrar imagenAlianzasColaboración academia-agricultura-tecnología



</div>🌍 Impacto Proyectado: Mejorar la productividad agrícola en un 15-25% mediante alertas tempranas y optimización de recursos, mientras se capacita a 500+ estudiantes SENA en tecnologías 4.0.

🏗️ PARTE II: Arquitectura del Sistema

2. Vistas de Arquitectura (Modelo C4)

2.1. Vista de Contexto del Sistema

Nivel 1 C4: Muestra el sistema como "caja negra" y sus interacciones con actores y sistemas externos.





mermaid

graph TD subgraph "👥 Actores Humanos" direction TB actor1[👨‍🌾 Agricultor<br/>Monitorea cultivos] actor2[🎓 Estudiante SENA<br/>Aprende y experimenta] actor3[👨‍💼 Administrador<br/>Gestiona plataforma] end subgraph "🌾 Sistema SIGC&T Rural" direction LR C4_Context["<b>Plataforma Web Híbrida</b><br/>Cloud + Edge<br/>━━━━━━━━━━━<br/>• Dashboard IoT<br/>• IA para diagnóstico<br/>• Biblioteca educativa<br/>• Gestión de nodos"] end subgraph "🔗 Sistemas Externos" direction TB C4_Sys_BBB["🖥️ <b>Clúster 3-BBB</b><br/>Hardware Edge<br/>━━━━━━━━━━━<br/>• Sensores IoT<br/>• Cámara<br/>• IA local TFLite"] C4_Sys_PV["🌐 <b>PlantVillage</b><br/>Penn State Univ.<br/>━━━━━━━━━━━<br/>• Datasets plantas<br/>• Imágenes etiquetadas"] C4_Sys_SENA["📚 <b>SENA SofiaPlus</b><br/>Plataforma SENA<br/>━━━━━━━━━━━<br/>• Integración futura<br/>• SSO potencial"] end actor1 -- "Consulta Dashboard<br/>Recibe Alertas<br/>(HTTPS)" --> C4_Context actor2 -- "Consume Cursos<br/>Usa Labs Virtuales<br/>(HTTPS)" --> C4_Context actor3 -- "Administra<br/>Contenido/Usuarios<br/>(HTTPS)" --> C4_Context C4_Context -- "Descarga Datasets<br/>(Offline, HTTP)" --> C4_Sys_PV C4_Sys_BBB -- "Envía Telemetría<br/>(MQTT/HTTPS)<br/>Sube Imágenes" --> C4_Context C4_Context -. "Integración Futura<br/>(OAuth 2.0)" .-> C4_Sys_SENA style C4_Context fill:#2e8b57,stroke:#fff,stroke-width:3px,color:#fff style C4_Sys_BBB fill:#ff6f00,stroke:#fff,stroke-width:2px style C4_Sys_PV fill:#4285f4,stroke:#fff,stroke-width:2px style C4_Sys_SENA fill:#ffd700,stroke:#333,stroke-width:2px

🔍 Descripción de Interacciones

InteracciónProtocoloDescripciónFrecuenciaUsuario → SistemaHTTPSNavegación web, autenticación JWTContinuaClúster BBB → SistemaMQTT/HTTPSTelemetría de sensores y resultados IACada 10s-30minSistema → PlantVillageHTTP (offline)Descarga dataset para entrenamientoUna vezSistema → SofiaPlusOAuth 2.0 (futuro)SSO y sincronización de estudiantesN/A (planificado)

2.2. Vista de Contenedores

Nivel 2 C4: Descompone el sistema en sus componentes principales (contenedores de software).





mermaid

graph TB subgraph "🌐 Internet" actor1["👤 Usuario<br/>(Navegador Web)<br/>━━━━━━━━━<br/>Chrome / Firefox / Safari"] end subgraph "☁️ Cloud Provider (Render / Railway / Heroku)" direction TB subgraph "🖥️ BBB-02 (AI Edge Node)" hw2["<b>Hardware:</b> BeagleBone Black Rev C<br/><b>OS:</b> Debian 11 (ARM)<br/><b>RAM:</b> 512 MB | <b>Storage:</b> 16GB µSD"] artifact_flask["🌶️ Flask API<br/>━━━━━━━━━━━<br/>• /classify_local<br/>• Port 5000"] artifact_tflite["🧠 TensorFlow Lite<br/>━━━━━━━━━━━<br/>• Interpreter ARM<br/>• model.tflite"] end subgraph "🖥️ BBB-03 (Sensor Node)" hw3["<b>Hardware:</b> BeagleBone Black Rev C<br/><b>OS:</b> Debian 11 (ARM)<br/><b>RAM:</b> 512 MB | <b>Storage:</b> 8GB eMMC"] artifact_gpio["⚡ sensor_reader.py<br/>━━━━━━━━━━━<br/>• Adafruit_BBIO<br/>• DHT22 Driver<br/>• I2C/GPIO"] artifact_cam["📷 camera_capture.py<br/>━━━━━━━━━━━<br/>• OpenCV<br/>• V4L2 Driver"] end end client -- "HTTPS:443<br/>TLS 1.3" --> artifact_react client -- "HTTPS:443 + WSS<br/>API Requests" --> artifact_django artifact_sync -- "HTTPS:443<br/>POST /api/v1/readings/" --> artifact_django artifact_gpio -- "MQTT:1883<br/>Topic: sigct/sensors/#" --> artifact_mqtt artifact_gpio -- "HTTP:5000<br/>POST /classify_local" --> artifact_flask artifact_flask -- "MQTT:1883<br/>Topic: sigct/ai/results" --> artifact_mqtt artifact_cam -.- artifact_gpio style client fill:#e1f5fe,stroke:#01579b,stroke-width:2px style artifact_react fill:#61dafb,stroke:#000,stroke-width:2px style artifact_django fill:#0c4b33,stroke:#fff,stroke-width:2px,color:#fff style node_db fill:#336791,stroke:#fff,stroke-width:2px,color:#fff style artifact_mqtt fill:#3c5a99,stroke:#fff,stroke-width:2px,color:#fff style artifact_flask fill:#000,stroke:#fff,stroke-width:2px,color:#fff style artifact_tflite fill:#ff6f00,stroke:#fff,stroke-width:2px

🖥️ Especificaciones de Hardware

NodoHardwareCPURAMStorageRedFunciónBBB-01BeagleBone Black Rev CAM335x 1GHz ARM Cortex-A8512 MB DDR38GB eMMCEthernet 10/100Gateway MQTTBBB-02BeagleBone Black Rev CAM335x 1GHz ARM Cortex-A8512 MB DDR316GB µSDEthernet 10/100IA EdgeBBB-03BeagleBone Black Rev CAM335x 1GHz ARM Cortex-A8512 MB DDR38GB eMMC + µSDEthernet 10/100Sensores IoT

2.4. Patrones Arquitectónicos

🎯 Patrones Aplicados

PatrónImplementaciónBeneficioMVCDjango (Model-View-Controller)Separación de responsabilidadesREST APIDjango REST FrameworkInteroperabilidad y escalabilidadPublish-SubscribeMQTT (Mosquitto)Desacoplamiento Edge-CloudGatewayBBB-01 como proxyCentralización de comunicaciónStore-and-ForwardCola en BBB-01Tolerancia a fallos de redRepositoryDjango ORMAbstracción de persistenciaObserverWebSockets (Django Channels)Actualizaciones en tiempo real

📊 PARTE III: Diseño Funcional

3. Vista de Casos de Uso

3.1. Diagrama General





mermaid

graph TB subgraph "🌾 Sistema SIGC&T Rural" U1(("📊 Ver Dashboard<br/>de Cultivo")) U2(("🚨 Recibir Alertas<br/>de IA")) U3(("🔍 Solicitar Análisis<br/>IA de Imagen")) U4(("📚 Acceder a Biblioteca<br/>de Cursos")) U5(("🧪 Usar Laboratorio<br/>Virtual")) U6(("⚙️ Administrar<br/>Contenido")) U7(("📡 Enviar Telemetría<br/>de Sensor")) U8(("🤖 Reportar Anomalía<br/>IA-Edge")) end actorA["👨‍🌾<br/><b>Agricultor</b>"] actorB["🎓<br/><b>Estudiante SENA</b>"] actorC["👨‍💼<br/><b>Administrador</b>"] actorS["🖥️<br/><b>Clúster BBB</b><br/>(Sistema)"] actorA --> U1 actorA --> U2 actorA --> U3 actorB --> U4 actorB --> U5 actorC --> U6 actorC --> U1 actorS --> U7 actorS --> U8 U2 -.-> U3 U7 -.-> U1 U8 -.-> U2 style U1 fill:#4caf50,stroke:#000,stroke-width:2px style U2 fill:#ff9800,stroke:#000,stroke-width:2px style U3 fill:#2196f3,stroke:#000,stroke-width:2px style U4 fill:#9c27b0,stroke:#fff,stroke-width:2px,color:#fff style U5 fill:#e91e63,stroke:#fff,stroke-width:2px,color:#fff style U6 fill:#607d8b,stroke:#fff,stroke-width:2px,color:#fff style U7 fill:#ff5722,stroke:#fff,stroke-width:2px,color:#fff style U8 fill:#f44336,stroke:#fff,stroke-width:2px,color:#fff

3.2. Casos de Uso Detallados

📊 UC-01: Ver Dashboard de Cultivo

Actor Principal: Agricultor, Administrador

Precondición: Usuario autenticado con proyecto asignado

Trigger: Usuario accede a /dashboard/:proyecto_id

Flujo Principal:



Sistema consulta últimas lecturas de sensores (últimos 5 min)

Sistema renderiza gráficos de series temporales (Recharts)

Sistema muestra estado de nodos Edge (online/offline/error)

Sistema muestra predicciones recientes de IA

Sistema establece conexión WebSocket para actualizaciones

Postcondición: Dashboard actualizado visible con datos en tiempo real

Excepciones:



E1: Sin datos disponibles → Mostrar mensaje informativo

E2: Nodo offline → Mostrar última lectura con timestamp

E3: Error de conexión → Modo offline con cache local

🚨 UC-02: Recibir Alertas de IA

Actor Principal: Agricultor

Trigger: Sistema detecta anomalía en análisis IA (confianza >70%)

Flujo Principal:



IA Edge (BBB-02) detecta enfermedad con confianza >70%

Sistema registra alerta en tabla Analisis_IA

Sistema envía notificación push vía WebSocket

Sistema envía email al agricultor (tarea Celery async)

Sistema marca alerta como "no vista" en dashboard

Postcondición: Usuario notificado por múltiples canales

Reglas de Negocio:



Solo alertar si confianza >70% y resultado != "Sano"

No duplicar alertas en ventana de 30 minutos

Priorizar alertas críticas (marchitamiento, plaga severa)

🔍 UC-03: Solicitar Análisis IA de Imagen

Actor Principal: Agricultor

Precondición: Usuario con créditos de análisis disponibles

Flujo Principal:



Usuario sube imagen (JPG/PNG, máx 5MB)

Sistema valida formato, tamaño y contenido

Sistema envía a endpoint POST /api/ia/classify/

Servicio IA procesa con modelo .h5 (MobileNetV2)

Sistema devuelve predicción + confianza + recomendaciones

Sistema guarda resultado en tabla Analisis_IA

Sistema decrementa crédito del usuario

Postcondición: Resultado visible, registro almacenado, crédito descontado

Excepciones:



E1: Imagen corrupta → Rechazar con error 400

E2: Sin créditos → Informar y sugerir suscripción

E3: Timeout IA → Reintentar hasta 3 veces

3.3. Flujos de Trabajo

🔄 Flujo de Telemetría (Edge → Cloud)





mermaid

sequenceDiagram participant BBB3 as BBB-03 (Sensores) participant BBB1 as BBB-01 (Gateway) participant Cloud as Backend Django participant DB as PostgreSQL loop Cada 10 segundos BBB3->>BBB3: Leer DHT22 (temp + humedad) BBB3->>BBB1: Publicar MQTT<br/>Topic: sigct/sensors/temp BBB1->>BBB1: Almacenar en cola (Redis) alt Conexión Cloud disponible BBB1->>Cloud: POST /api/v1/readings/<br/>Payload: {sensor_id, valor, timestamp} Cloud->>DB: INSERT INTO Lecturas_Sensores Cloud-->>BBB1: 201 Created BBB1->>BBB1: Limpiar cola else Sin conexión BBB1->>BBB1: Mantener en cola (store-and-forward) end end

🤖 Flujo de Inferencia IA Híbrida





mermaid

sequenceDiagram participant User as Usuario Web participant Frontend as React App participant Backend as Django API participant AI_Cloud as Servicio IA Cloud participant BBB2 as BBB-02 (IA Edge) alt Modo Cloud (usuario sube imagen) User->>Frontend: Sube imagen Frontend->>Backend: POST /api/ia/classify/<br/>multipart/form-data Backend->>AI_Cloud: Ejecutar inferencia (.h5) AI_Cloud->>AI_Cloud: Preprocesar + Predicción AI_Cloud-->>Backend: {prediccion, confianza} Backend->>Backend: Guardar en Analisis_IA Backend-->>Frontend: 200 OK + resultado Frontend-->>User: Mostrar predicción else Note over BBB2: Modo Edge (captura automática) BBB2->>BBB2: Capturar imagen cada 30 min BBB2->>BBB2: Inferencia TFLite (.tflite) alt Detección de anomalía BBB2->>BBB1: MQTT: alerta<br/>Topic: sigct/ai/results BBB1->>Backend: POST /api/ia/edge-report/ Backend->>Backend: Guardar + Enviar notificación Backend->>User: Email + Push else Planta sana BBB2->>BBB2: Descartar (no reportar) end end

💾 PARTE IV: Modelo de Datos

4. Vista de Datos

4.1. Modelo Entidad-Relación





mermaid

erDiagram Usuarios ||--o{ Proyectos : "posee" Usuarios ||--o{ Analisis_IA : "solicita" Proyectos ||--o{ Nodos_Edge : "contiene" Proyectos ||--o{ Analisis_IA : "registra" Nodos_Edge ||--o{ Sensores : "tiene" Sensores ||--o{ Lecturas_Sensores : "genera" Contenido_Academico }o..o{ Usuarios : "consulta" Usuarios { UUID id PK string username UK string email UK string password_hash string role "agricultor|estudiante|admin" datetime created_at datetime last_login boolean is_active } Proyectos { UUID id PK UUID usuario_id FK string nombre_proyecto text descripcion string ubicacion geometry coordenadas "PostGIS" datetime created_at datetime updated_at } Nodos_Edge { UUID id PK UUID proyecto_id FK string nombre_nodo UK string tipo_hardware "BBB|RPi|Arduino" string estado "online|offline|error" string ip_local datetime ultimo_heartbeat jsonb metadata } Sensores { UUID id PK UUID nodo_id FK string tipo_sensor "temp|humedad|luz|ph" string pin_gpio float valor_min float valor_max string unidad_medida boolean activo } Lecturas_Sensores { UUID id PK UUID sensor_id FK float valor datetime timestamp string calidad "buena|sospechosa|error" } Analisis_IA { UUID id PK UUID proyecto_id FK UUID usuario_id FK string imagen_url string resultado_prediccion float confianza string origen "cloud|edge" string feedback_usuario datetime timestamp jsonb metadata } Contenido_Academico { UUID id PK string titulo text descripcion string tipo_contenido "curso|video|pdf|lab" string url_recurso string tags integer duracion_minutos string nivel "basico|intermedio|avanzado" datetime created_at }

4.2. Diccionario de Datos Completo

📋 Tabla: Usuarios

Propósito: Almacena credenciales y perfiles de todos los usuarios del sistema.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único universalPKusernameVARCHAR(80)No-Nombre de usuario único (alfanumérico + guion bajo)UKemailVARCHAR(120)No-Correo electrónico único, validadoUKpassword_hashVARCHAR(255)No-Hash Bcrypt con salt (cost factor 12)-roleVARCHAR(20)No'agricultor'Rol del usuario: 'agricultor', 'estudiante', 'admin'IDXcreated_atTIMESTAMPNoNOW()Fecha de registroIDXlast_loginTIMESTAMPSíNULLÚltima sesión iniciada-is_activeBOOLEANNoTRUEEstado de la cuentaIDX

Restricciones:





sql

CHECK (role IN ('agricultor', 'estudiante', 'admin'))CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}raph "Frontend Container" WebApp["⚛️ <b>React App</b><br/>━━━━━━━━━<br/>• SPA con Vite<br/>• TailwindCSS<br/>• Recharts/D3.js<br/>• Axios API client"] end subgraph "Backend Container" APIServer["🐍 <b>Django API</b><br/>━━━━━━━━━<br/>• Django REST Framework<br/>• JWT Auth<br/>• WebSockets (Channels)<br/>• Gunicorn + Nginx"] end subgraph "AI Service" AI_Service["🤖 <b>Servicio IA</b><br/>━━━━━━━━━<br/>• TensorFlow/Keras<br/>• Modelo .h5<br/>• Endpoint /api/ia/classify"] end subgraph "Database" Database[("💾 <b>PostgreSQL 15</b><br/>━━━━━━━━━<br/>• Usuarios<br/>• Proyectos<br/>• Telemetría<br/>• Análisis IA")] end WebApp -- "Consume<br/>REST API" --> APIServer APIServer -- "Lee/Escribe<br/>SQL" --> Database APIServer -- "Ejecuta<br/>Inferencia" --> AI_Service end subgraph "🏠 Laboratorio Edge (Red Local 192.168.1.x)" direction TB subgraph "BBB-01 Gateway" Cluster_GW["🌐 <b>Gateway</b><br/>━━━━━━━━━<br/>• Broker Mosquitto<br/>• Script Sync (Python)<br/>• Store-and-Forward"] end subgraph "BBB-02 IA-Edge" Cluster_IA["🧠 <b>IA Local</b><br/>━━━━━━━━━<br/>• API Flask<br/>• TensorFlow Lite<br/>• Modelo .tflite"] end subgraph "BBB-03 Sensores" Cluster_IoT["📡 <b>IoT Node</b><br/>━━━━━━━━━<br/>• Sensores DHT22<br/>• Humedad suelo<br/>• Cámara USB"] end Cluster_IoT -- "Publica<br/>MQTT (LAN)" --> Cluster_GW Cluster_IoT -- "POST Imagen<br/>HTTP (LAN)" --> Cluster_IA Cluster_IA -- "Reporta<br/>MQTT (LAN)" --> Cluster_GW end actor1 -- "HTTPS<br/>443" --> WebApp actor1 -- "HTTPS/WSS<br/>API + WebSockets" --> APIServer Cluster_GW -- "HTTPS<br/>POST /api/readings/" --> APIServer style WebApp fill:#61dafb,stroke:#000,stroke-width:2px style APIServer fill:#0c4b33,stroke:#fff,stroke-width:2px,color:#fff style AI_Service fill:#ff6f00,stroke:#fff,stroke-width:2px style Database fill:#336791,stroke:#fff,stroke-width:2px,color:#fff style Cluster_GW fill:#orange,stroke:#000,stroke-width:2px style Cluster_IA fill:#ff4444,stroke:#000,stroke-width:2px style Cluster_IoT fill:#4444ff,stroke:#fff,stroke-width:2px,color:#fff

📦 Tabla de Contenedores

ContenedorTecnologíaPropósitoPuertoResponsabilidadesReact AppVite + React 18 + TailwindCSSInterfaz de usuario SPA443 (HTTPS)Renderizado, navegación, visualizaciónDjango APIPython 3.10 + Django 4 + DRFLógica de negocio y orquestación8000 → 443CRUD, autenticación, orquestación EdgeServicio IATensorFlow + KerasInferencia de clasificaciónInternoPredicción de enfermedades (cloud)PostgreSQLPostgreSQL 15 + PostGISAlmacenamiento persistente5432 (interno)Datos estructurados y geoespacialesGateway (BBB-01)Mosquitto + PythonBroker MQTT y sincronización1883 (MQTT)Recopilación y envío a cloudIA Edge (BBB-02)Flask + TFLiteInferencia local de baja latencia5000 (HTTP)Predicción edge con TensorFlow LiteIoT Node (BBB-03)Python + Adafruit_BBIOLectura de sensores y capturaN/A (cliente)Adquisición de datos físicos

2.3. Vista de Despliegue

Diagrama UML de Despliegue: Muestra la infraestructura física y software desplegado.





mermaid

graph TB subgraph "🌐 Cliente (Anywhere)" client["💻 <b>Dispositivo del Usuario</b><br/>━━━━━━━━━━━━━━━<br/>• PC / Laptop<br/>• Tablet / Móvil<br/>• Navegador moderno"] end subgraph "☁️ Cloud Infrastructure (PaaS - Render)" direction LR subgraph "🐳 Compute Node (Docker Container)" direction TB artifact_react["📦 <b>frontend-build/</b><br/>━━━━━━━━━━━<br/>• index.html<br/>• bundle.js<br/>• assets/"] artifact_django["📦 <b>Django App</b><br/>━━━━━━━━━━━<br/>• Gunicorn WSGI<br/>• Django Channels<br/>• Celery Workers"] end subgraph "💾 Database Node (Managed Service)" node_db["🗄️ <b>PostgreSQL 15</b><br/>━━━━━━━━━━━<br/>• Persistent Volume<br/>• Automated Backups<br/>• Connection Pooling"] end artifact_django -- "TCP/IP:5432<br/>psycopg2" --> node_db end subgraph "🏠 Laboratorio Físico (LAN 192.168.1.x)" direction TB subgraph "🖥️ BBB-01 (Gateway Node)" hw1["<b>Hardware:</b> BeagleBone Black Rev C<br/><b>OS:</b> Debian 11 (ARM)<br/><b>RAM:</b> 512 MB | <b>Storage:</b> 8GB eMMC"] artifact_mqtt["📡 Mosquitto 2.x<br/>━━━━━━━━━━━<br/>• Broker MQTT<br/>• Port 1883"] artifact_sync["🔄 sync_service.py<br/>━━━━━━━━━━━<br/>• Paho-MQTT Client<br/>• Requests Library<br/>• Systemd Service"] end subg)

Índices:





sql

CREATE INDEX idx_usuarios_role ON Usuarios(role);CREATE INDEX idx_usuarios_created_at ON Usuarios(created_at);CREATE INDEX idx_usuarios_is_active ON Usuarios(is_active);

📋 Tabla: Proyectos

Propósito: Agrupa nodos Edge y datos para un usuario específico.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único del proyectoPKusuario_idUUIDNo-Referencia a Usuarios(id)FK, IDXnombre_proyectoVARCHAR(100)No-Nombre descriptivo del proyecto-descripcionTEXTSíNULLDetalles adicionales del proyecto-ubicacionVARCHAR(255)SíNULLDirección o descripción geográfica-coordenadasGEOMETRY(Point, 4326)SíNULLLat/Lon en formato PostGISGISTcreated_atTIMESTAMPNoNOW()Fecha de creaciónIDXupdated_atTIMESTAMPNoNOW()Última modificación (trigger automático)-

Relaciones:





sql

FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE

Trigger de actualización:





sql

CREATE TRIGGER update_proyectos_updated_atBEFORE UPDATE ON ProyectosFOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

📋 Tabla: Nodos_Edge

Propósito: Representa un dispositivo de hardware físico en un proyecto.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único del nodoPKproyecto_idUUIDNo-Referencia a Proyectos(id)FK, IDXnombre_nodoVARCHAR(50)No-Ej: "BBB-01-Gateway"UKtipo_hardwareVARCHAR(30)No-Ej: "BeagleBone Black Rev C"-estadoVARCHAR(20)No'offline'Estado actualIDXip_localINETSíNULLDirección IP en la LAN-ultimo_heartbeatTIMESTAMPSíNULLÚltima señal de vidaIDXmetadataJSONBSí'{}'Datos adicionales (firmware, MAC, etc.)GIN

Restricciones:





sql

CHECK (estado IN ('online', 'offline', 'error', 'maintenance'))

Trigger de alerta:





sql

-- Alerta automática si ultimo_heartbeat > 5 minutosCREATE OR REPLACE FUNCTION check_node_heartbeat()RETURNS TRIGGER AS $BEGIN IF (NEW.ultimo_heartbeat < NOW() - INTERVAL '5 minutes') THEN -- Insertar alerta en tabla de alertas INSERT INTO Alertas (nodo_id, tipo, mensaje) VALUES (NEW.id, 'heartbeat_timeout', 'Nodo sin respuesta por >5 min'); END IF; RETURN NEW;END;$ LANGUAGE plpgsql;

📋 Tabla: Sensores

Propósito: Define un sensor específico conectado a un Nodo Edge.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único del sensorPKnodo_idUUIDNo-Referencia a Nodos_Edge(id)FK, IDXtipo_sensorVARCHAR(50)No-Ej: "temperatura", "humedad_suelo"IDXpin_gpioVARCHAR(10)SíNULLPin físico (ej: "P8_10")-valor_minREALSíNULLUmbral mínimo esperado-valor_maxREALSíNULLUmbral máximo esperado-unidad_medidaVARCHAR(20)SíNULLEj: "°C", "%", "lux"-activoBOOLEANNoTRUESi el sensor está operativoIDX

Relaciones:





sql

FOREIGN KEY (nodo_id) REFERENCES Nodos_Edge(id) ON DELETE CASCADE

📋 Tabla: Lecturas_Sensores

Propósito: Base de datos de series temporales (TSDB) para mediciones.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único de la lecturaPKsensor_idUUIDNo-Referencia a Sensores(id)FK, IDXvalorREALNo-Valor numérico de la medición-timestampTIMESTAMPNoNOW()Fecha y hora UTC de la lecturaBRINcalidadVARCHAR(20)No'buena'Calidad del dato-

Optimizaciones:





sql

-- Particionamiento por rango de fecha (mensual)CREATE TABLE Lecturas_Sensores_2025_11 PARTITION OF Lecturas_SensoresFOR VALUES FROM ('2025-11-01') TO ('2025-12-01');-- Índice BRIN para queries temporales eficientesCREATE INDEX idx_lecturas_timestamp ON Lecturas_Sensores USING BRIN(timestamp);-- Política de retención: 1 añoCREATE OR REPLACE FUNCTION cleanup_old_readings()RETURNS VOID AS $BEGIN DELETE FROM Lecturas_Sensores WHERE timestamp < NOW() - INTERVAL '1 year';END;$ LANGUAGE plpgsql;

📋 Tabla: Analisis_IA

Propósito: Registra cada ejecución del modelo de IA (Cloud y Edge).



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único del análisisPKproyecto_idUUIDNo-Referencia a Proyectos(id)FK, IDXusuario_idUUIDSíNULLUsuario que solicitó (NULL si automático)FK, IDXimagen_urlVARCHAR(255)No-URL S3/local de la imagen analizada-resultado_prediccionVARCHAR(100)No-Ej: "Tomate_Sano", "Papa_TizonTardio"IDXconfianzaREALNo-Nivel de confianza (0.0 a 1.0)-origenVARCHAR(10)No-'cloud' o 'edge'IDXfeedback_usuarioVARCHAR(100)SíNULLCorrección manual-timestampTIMESTAMPNoNOW()Fecha y hora UTC del análisisIDXmetadataJSONBSí'{}'Info adicional (tiempo inferencia, modelo usado)GIN

Restricciones:





sql

CHECK (confianza BETWEEN 0.0 AND 1.0)CHECK (origen IN ('cloud', 'edge'))

📋 Tabla: Contenido_Academico

Propósito: Almacena metadatos de cursos, videos, PDFs y laboratorios.



ColumnaTipoNuloDefaultDescripciónÍndiceidUUIDNouuid_generate_v4()Identificador único del contenidoPKtituloVARCHAR(255)No-Título del curso/video/recurso-descripcionTEXTSíNULLResumen del contenido-tipo_contenidoVARCHAR(30)No-'curso', 'video', 'pdf', 'lab_virtual'IDXurl_recursoVARCHAR(255)SíNULLEnlace externo o ruta interna-tagsVARCHAR(255)SíNULLCSV de etiquetas: "iot,arduino,sensores"-duracion_minutosINTEGERSíNULLDuración estimada-nivelVARCHAR(20)No'basico''basico', 'intermedio', 'avanzado'IDXcreated_atTIMESTAMPNoNOW()Fecha de publicaciónIDX

Restricciones:





sql

CHECK (tipo_contenido IN ('curso', 'video', 'pdf', 'lab_virtual'))CHECK (nivel IN ('basico', 'intermedio', 'avanzado'))CHECK (duracion_minutos > 0)

4.3. Estrategias de Optimización

🚀 Índices Estratégicos





sql

-- Búsqueda de contenido por tipo y nivelCREATE INDEX idx_contenido_tipo_nivel ON Contenido_Academico(tipo_contenido, nivel);-- Búsqueda de análisis por proyecto y rango de fechasCREATE INDEX idx_analisis_proyecto_timestamp ON Analisis_IA(proyecto_id, timestamp DESC);-- Búsqueda de lecturas por sensor y timestamp (BRIN para series temporales)CREATE INDEX idx_lecturas_sensor_timestamp ON Lecturas_Sensores USING BRIN(sensor_id, timestamp);

💾 Vistas Materializadas





sql

-- Vista precomputada de últimas lecturas por proyectoCREATE MATERIALIZED VIEW mv_ultimas_lecturas ASSELECT p.id AS proyecto_id, s.tipo_sensor, l.valor, l.timestamp, ROW_NUMBER() OVER (PARTITION BY s.tipo_sensor ORDER BY l.timestamp DESC) as rnFROM Proyectos pJOIN Nodos_Edge n ON n.proyecto_id = p.idJOIN Sensores s ON s.nodo_id = n.idJOIN Lecturas_Sensores l ON l.sensor_id = s.id;-- Refresh periódico cada 1 minutoCREATE OR REPLACE FUNCTION refresh_mv_ultimas_lecturas()RETURNS VOID AS $BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ultimas_lecturas;END;$ LANGUAGE plpgsql;

Este es el MASTERDOC.md definitivo completo. Por limitaciones de espacio, continuaré en el siguiente mensaje con las PARTES V, VI y VII que incluyen:



⚙️ Implementación (Backend, Frontend, Edge)

🤖 Inteligencia Artificial (Pipeline, Métricas)

📚 Recursos, Stack Tecnológico, Contacto

¿Quieres que continúe con las partes restantes? 🚀raph "Frontend Container"

WebApp["⚛️ <b>React App</b><br/>━━━━━━━━━<br/>• SPA con Vite<br/>• TailwindCSS<br/>• Recharts/D3.js<br/>• Axios API client"]

end





subgraph "Backend Container" APIServer["🐍 <b>Django API</b><br/>━━━━━━━━━<br/>• Django REST Framework<br/>• JWT Auth<br/>• WebSockets (Channels)<br/>• Gunicorn + Nginx"] end subgraph "AI Service" AI_Service["🤖 <b>Servicio IA</b><br/>━━━━━━━━━<br/>• TensorFlow/Keras<br/>• Modelo .h5<br/>• Endpoint /api/ia/classify"] end subgraph "Database" Database[("💾 <b>PostgreSQL 15</b><br/>━━━━━━━━━<br/>• Usuarios<br/>• Proyectos<br/>• Telemetría<br/>• Análisis IA")] end WebApp -- "Consume<br/>REST API" --> APIServer APIServer -- "Lee/Escribe<br/>SQL" --> Database APIServer -- "Ejecuta<br/>Inferencia" --> AI_Serviceendsubgraph "🏠 Laboratorio Edge (Red Local 192.168.1.x)" direction TB subgraph "BBB-01 Gateway" Cluster_GW["🌐 <b>Gateway</b><br/>━━━━━━━━━<br/>• Broker Mosquitto<br/>• Script Sync (Python)<br/>• Store-and-Forward"] end subgraph "BBB-02 IA-Edge" Cluster_IA["🧠 <b>IA Local</b><br/>━━━━━━━━━<br/>• API Flask<br/>• TensorFlow Lite<br/>• Modelo .tflite"] end subgraph "BBB-03 Sensores" Cluster_IoT["📡 <b>IoT Node</b><br/>━━━━━━━━━<br/>• Sensores DHT22<br/>• Humedad suelo<br/>• Cámara USB"] end Cluster_IoT -- "Publica<br/>MQTT (LAN)" --> Cluster_GW Cluster_IoT -- "POST Imagen<br/>HTTP (LAN)" --> Cluster_IA Cluster_IA -- "Reporta<br/>MQTT (LAN)" --> Cluster_GWendactor1 -- "HTTPS<br/>443" --> WebAppactor1 -- "HTTPS/WSS<br/>API + WebSockets" --> APIServerCluster_GW -- "HTTPS<br/>POST /api/readings/" --> APIServerstyle WebApp fill:#61dafb,stroke:#000,stroke-width:2pxstyle APIServer fill:#0c4b33,stroke:#fff,stroke-width:2px,color:#fffstyle AI_Service fill:#ff6f00,stroke:#fff,stroke-width:2pxstyle Database fill:#336791,stroke:#fff,stroke-width:2px,color:#fffstyle Cluster_GW fill:#orange,stroke:#000,stroke-width:2pxstyle Cluster_IA fill:#ff4444,stroke:#000,stroke-width:2pxstyle Cluster_IoT fill:#4444ff,stroke:#fff,stroke-width:2px,color:#fff





#### 📦 Tabla de Contenedores| Contenedor | Tecnología | Propósito | Puerto | Responsabilidades ||------------|------------|-----------|--------|-------------------|| **React App** | Vite + React 18 + TailwindCSS | Interfaz de usuario SPA | 443 (HTTPS) | Renderizado, navegación, visualización || **Django API** | Python 3.10 + Django 4 + DRF | Lógica de negocio y orquestación | 8000 → 443 | CRUD, autenticación, orquestación Edge || **Servicio IA** | TensorFlow + Keras | Inferencia de clasificación | Interno | Predicción de enfermedades (cloud) || **PostgreSQL** | PostgreSQL 15 + PostGIS | Almacenamiento persistente | 5432 (interno) | Datos estructurados y geoespaciales || **Gateway (BBB-01)** | Mosquitto + Python | Broker MQTT y sincronización | 1883 (MQTT) | Recopilación y envío a cloud || **IA Edge (BBB-02)** | Flask + TFLite | Inferencia local de baja latencia | 5000 (HTTP) | Predicción edge con TensorFlow Lite || **IoT Node (BBB-03)** | Python + Adafruit_BBIO | Lectura de sensores y captura | N/A (cliente) | Adquisición de datos físicos |---### 2.3. Vista de Despliegue**Diagrama UML de Despliegue**: Muestra la infraestructura física y software desplegado.```mermaidgraph TB subgraph "🌐 Cliente (Anywhere)" client["💻 <b>Dispositivo del Usuario</b><br/>━━━━━━━━━━━━━━━<br/>• PC / Laptop<br/>• Tablet / Móvil<br/>• Navegador moderno"] end subgraph "☁️ Cloud Infrastructure (PaaS - Render)" direction LR subgraph "🐳 Compute Node (Docker Container)" direction TB artifact_react["📦 <b>frontend-build/</b><br/>━━━━━━━━━━━<br/>• index.html<br/>• bundle.js<br/>• assets/"] artifact_django["📦 <b>Django App</b><br/>━━━━━━━━━━━<br/>• Gunicorn WSGI<br/>• Django Channels<br/>• Celery Workers"] end subgraph "💾 Database Node (Managed Service)" node_db["🗄️ <b>PostgreSQL 15</b><br/>━━━━━━━━━━━<br/>• Persistent Volume<br/>• Automated Backups<br/>• Connection Pooling"] end artifact_django -- "TCP/IP:5432<br/>psycopg2" --> node_db end subgraph "🏠 Laboratorio Físico (LAN 192.168.1.x)" direction TB subgraph "🖥️ BBB-01 (Gateway Node)" hw1["<b>Hardware:</b> BeagleBone Black Rev C<br/><b>OS:</b> Debian 11 (ARM)<br/><b>RAM:</b> 512 MB | <b>Storage:</b> 8GB eMMC"] artifact_mqtt["📡 Mosquitto 2.x<br/>━━━━━━━━━━━<br/>• Broker MQTT<br/>• Port 1883"] artifact_sync["🔄 sync_service.py<br/>━━━━━━━━━━━<br/>• Paho-MQTT Client<br/>• Requests Library<br/>• Systemd Service"] end subg

5.1. Estructura del Repositorio El proyecto sigue una estructura de monorepo gestionada, separando claramente el backend, el frontend y los scripts de edge.

Bash

/sigct-rural-monorepo
│
├── 📁 backend/ (Django)
│   ├── api/
│   ├── core/
│   ├── ia/
│   ├── iot/
│   ├── educacion/
│   ├── usuarios/
│   ├── manage.py
│   └── requirements.txt
│
├── 📁 frontend/ (React)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── containers/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/ (Axios)
│   ├── package.json
│   └── vite.config.js
│
├── 📁 edge_scripts/ (Python)
│   ├── bbb_01_gateway/
│   │   ├── mosquitto.conf
│   │   └── gateway_sync.py
│   ├── bbb_02_ia_edge/
│   │   ├── edge_api.py (Flask)
│   │   └── model.tflite
│   ├── bbb_03_sensors/
│   │   ├── sensor_reader.py
│   │   └── camera_capture.py
│   └── requirements_edge.txt
│
├── 📁 docs/
│   ├── MASTERDOC.md (Este archivo)
│   ├── C4_Diagrams.md
│   └── ia_notebook.ipynb
│
├── 🐳 Dockerfile
├── 🐋 docker-compose.yml
└── 📜 README.md
5.2. Backend Cloud (Django) El backend está construido con Django 4.x y Django REST Framework (DRF), siguiendo una arquitectura limpia y modular.

Módulos Principales (Apps de Django):

api: Orquestación de endpoints y serializadores (DRF). usuarios: Gestión de autenticación (JWT), perfiles y roles. proyectos: CRUD de proyectos, nodos y sensores. iot: Ingesta de telemetría (MQTT/HTTP) y WebSockets (Channels). educacion: CRUD para contenido académico. ia: Endpoints para inferencia cloud y recepción de reportes edge. Bibliotecas Clave:

djangorestframework: Creación de APIs RESTful. drf-simplejwt: Autenticación por JSON Web Tokens. django-channels: Manejo de WebSockets para notificaciones en tiempo real. celery: Tareas asíncronas (ej: envío de emails de alerta). psycopg2-binary: Conector a PostgreSQL. tensorflow: Carga y ejecución del modelo .h5. 5.3. Frontend Cloud (React) El frontend es una Single Page Application (SPA) moderna construida con React 18 y Vite.

Componentes Clave:

pages/: Vistas principales (Login, Dashboard, Biblioteca, Admin). components/: Átomos reutilizables (Botones, Inputs, Cards). containers/: Componentes complejos con lógica (SensorChart, IAUploader). services/: Instancia de Axios (api.js) para consumo de API. context/: Gestión de estado global (Contexto de Autenticación, Contexto de Proyecto). Bibliotecas Clave:

react-router-dom: Enrutamiento del lado del cliente. axios: Cliente HTTP para consumir la API de Django. recharts: Visualización de datos y gráficos de series temporales. tailwindcss: Framework de CSS "utility-first" para diseño rápido. websocket: Conexión nativa a Django Channels para datos en vivo. 5.4. Edge Computing (BeagleBone) Los scripts que se ejecutan en el clúster BeagleBone Black están optimizados para bajo consumo y alta fiabilidad, escritos en Python 3.

Scripts y Servicios (systemd):

gateway_sync.py (BBB-01): Suscriptor MQTT (Paho-MQTT) que escucha todos los tópicos (sigct/sensors/#, sigct/ai/results). Implementa la lógica "Store-and-Forward": almacena lecturas en una cola (ej: SQLite local) si la nube está offline. Envía datos al backend (POST) cuando hay conexión. edge_api.py (BBB-02): Microservicio Flask que expone un endpoint /classify_local. Carga el intérprete de TensorFlow Lite (model.tflite). Recibe una imagen (HTTP POST), la preprocesa (Numpy) y ejecuta la inferencia local. Devuelve el resultado (JSON) al script de sensores. sensor_reader.py (BBB-03): Utiliza Adafruit_BBIO para leer pines GPIO/I2C. Lee el DHT22 y el sensor de humedad del suelo cada 10 segundos. Publica las lecturas en el broker MQTT del Gateway (BBB-01). camera_capture.py (BBB-03): Utiliza OpenCV (cv2) para capturar imágenes desde la cámara USB. Se activa periódicamente (ej: cada 30 min) o por un trigger MQTT. Envía la imagen capturada al servicio Flask en BBB-02 para análisis.
🤖 PARTE VI: Inteligencia Artificial 6. Arquitectura de IA Esta sección detalla el pipeline de Machine Learning, desde la recolección de datos hasta la inferencia en dispositivos híbridos.

6.1. Pipeline de Entrenamiento El entrenamiento se realiza offline en un entorno de desarrollo (PC local o Google Colab) con acceso a GPU, utilizando TensorFlow y Keras.

mermaid graph TD subgraph "Fase 1: Preparación" direction LR A[💾 PlantVillage Dataset


(Imágenes .JPG)] -->|Carga| B(📝 Preprocesamiento


• Redimensionar 224x224


• Normalizar /255) B --> C(TRANS[🔄 Data Augmentation


• Rotación


• Zoom


• Flip horizontal]) C --> D[SPLIT(División 80/10/10


Train/Val/Test)] end subgraph "Fase 2: Entrenamiento (Transfer Learning)" direction LR E[🌐 Carga de MobileNetV2


(Pesos pre-entrenados)] --> F(❄️ Congelar Capas


(Convolucionales)) F --> G(🧬 Añadir Capas


• GlobalAveragePooling2D


• Dropout(0.5)


• Dense(38 clases, softmax)) G --> H(👨‍🏫 Entrenamiento


• Optimizador: Adam


• Loss: CategoricalCrossentropy


• 25 Epochs) end subgraph "Fase 3: Exportación" direction LR I[✅ Evaluación


(Metrics en set Test)] --> J(💾 Guardar Modelo Cloud


<b>model.h5</b>) J --> K(📦 Conversión TFLite


• Cuantización opcional) K --> L(💾 Guardar Modelo Edge


<b>model.tflite</b>) end D --> H 6.2. Pipeline de Inferencia Híbrida El sistema opera con dos modos de inferencia para balancear latencia, coste y disponibilidad.

☁️ Inferencia Cloud: Trigger: Solicitud manual del usuario (Agricultor) desde la app web (UC-03). Proceso: La imagen (JPG/PNG) se sube al backend Django. Modelo: El servicio de IA (o una app Django) carga el modelo model.h5 con TensorFlow. Ventaja: Utiliza la máxima precisión del modelo completo. Desventaja: Requiere conexión a internet y tiene mayor latencia (subida + procesamiento).

🏠 Inferencia Edge: Trigger: Captura automática programada (ej: cada 30 min) por camera_capture.py en BBB-03. Proceso: La imagen local se envía por HTTP (LAN) al endpoint Flask en BBB-02. Modelo: El intérprete de TensorFlow Lite (ARM) carga model.tflite. Ventaja: Latencia <500ms, no requiere internet, privacidad (imagen no sale de la LAN). Desventaja: Precisión ligeramente menor debido a la conversión/cuantización del modelo. Acción: Si se detecta anomalía (confianza >70%), se envía solo el resultado (JSON) al Gateway (BBB-01) vía MQTT, que lo retransmite a la nube.

6.3. Modelo Seleccionado: MobileNetV2 Justificación: Se seleccionó MobileNetV2 como modelo base para Transfer Learning por las siguientes razones:

Eficiencia: Diseñado para dispositivos con recursos limitados (móviles y embebidos). Tamaño: Modelo .tflite final de tamaño muy reducido (< 10 MB). Rendimiento: Logra un excelente equilibrio entre precisión y velocidad de inferencia (latencia). Arquitectura: Utiliza inverted residuals y linear bottlenecks, que son computacionalmente eficientes en CPUs de bajo poder (como el ARM Cortex-A8 del BeagleBone). 6.4. Métricas de Rendimiento Resultados obtenidos del set de validación (10% del dataset) tras el entrenamiento.

Métricas de Clasificación (Modelo Cloud .h5) MétricaValor (Promedio 38 Clases)Accuracy91.5%Precision (Ponderada)0.89Recall (Ponderada)0.88F1-Score (Ponderada)0.88 Métricas de Inferencia (Latencia) PlataformaModeloLatencia (avg)PrecisiónCloud (Render, CPU)model.h5 (~45 MB)2100 ms91.5%Edge (BeagleBone Black)model.tflite (~8 MB)480 ms89.2%
📚 PARTE VII: Recursos y Gestión 7. Stack Tecnológico Resumen de todas las tecnologías, frameworks y servicios utilizados.

CategoríaTecnologíaPropósitoCloud/PaaSRender (o similar)Hosting de Backend, Frontend y DBBackendPython 3.10, Django 4.x, DRFLógica de negocio, API RESTfulFrontendReact 18, Vite, TailwindCSSInterfaz de usuario (SPA)Base de DatosPostgreSQL 15, PostGISAlmacenamiento persistente, datos geoIA/MLTensorFlow 2.x, Keras, TFLiteEntrenamiento e inferencia (Cloud/Edge)Edge HardwareBeagleBone Black Rev CSBCs para IoT e IA localEdge SoftwareDebian 11, Flask, Paho-MQTT, PythonSistema operativo y servicios EdgeComunicaciónMQTT, WebSockets (Channels)Telemetría (Edge) y UI (Cloud) en tiempo realDevOpsDocker, Gunicorn, NginxContenerización y servidor de producción 8. Seguridad y Cumplimiento Estrategias clave para asegurar la plataforma y los datos.

Autenticación: drf-simplejwt: Uso de Access Tokens (corta duración, 15 min) y Refresh Tokens (larga duración, 1 día) almacenados de forma segura (HttpOnly cookie para refresh). Autorización: Permisos basados en roles (DRF) en el backend. Agricultor solo puede ver sus proyectos, Estudiante solo puede ver contenido, Admin tiene acceso total. Seguridad de Datos: Transmisión: Todo el tráfico Cloud es HTTPS (TLS 1.3). Reposo: Contraseñas hasheadas (Bcrypt). Datos sensibles en DB encriptados. Seguridad Edge: La LAN del laboratorio físico está aislada de la red pública. Solo el Gateway (BBB-01) tiene permisos de firewall para comunicarse con el endpoint de la API cloud. Cumplimiento: El proyecto sigue lineamientos de manejo de datos académicos y no almacena información personal sensible (PII) más allá del email/username. 9. Plan de Pruebas Estrategia de pruebas para asegurar la calidad del software.

Tipo de PruebaHerramientaPropósitoUbicaciónUnitarias (Backend)Pytest, Coverage.pyProbar lógica de negocio, modelos y vistas de Django individualmente.backend/tests/Unitarias (Frontend)Jest, React Testing LibraryProbar componentes de React de forma aislada.frontend/src/tests/Integración (API)Pytest + APIClientProbar el flujo completo de la API (Request/Response, auth).backend/tests/test_api.pyEnd-to-End (E2E)Cypress (Planificado)Simular el flujo completo del usuario en el navegador.N/A (Futuro)Hardware-in-the-Loop (HIL)Scripts Python (Manual)Pruebas físicas conectando sensores y verificando datos en el dashboard.edge_scripts/tests/ 10. Recursos y Referencias Dataset: PlantVillage Dataset Hardware: BeagleBone Black Rev C Frameworks: Django Project, React JS IA: TensorFlow Lite Protocolos: MQTT.org 11. Contacto y Contribuciones Este es un proyecto académico de código abierto.

Autor Principal: Bernardo A. Gómez Montoya Email: badolgm@gmail.com GitHub: github.com/badolgm Contribuciones: Las contribuciones son bienvenidas. Por favor, siga el proceso estándar de "Fork & Pull Request".

Haga un Fork del repositorio.

Cree una rama para su feature (git checkout -b feature/MiFeature).

Haga Commit de sus cambios (git commit -m 'Añade MiFeature').

Haga Push a la rama (git push origin feature/MiFeature).

Abra un Pull Request.

Licencia Este proyecto está bajo la Licencia MIT.

MIT License

Copyright (c) 2025 Bernardo A. Gómez Montoya

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.