🌾 SIGC&T Rural - Documento de Arquitectura de Software (DAS) v4.2Sistema Integrado de Gestión del Conocimiento y Tecnología RuralProyecto Productivo ADSO - SENA (Formato: Mermaid para GitHub)VersiónEstadoFechaAutorv4.2Borrador de Arquitectura (Mermaid)02-Nov-2025B. Gómez (Asist. Gemini)📋 ÍNDICE DEL DOCUMENTOSECCIÓN 1: VISIÓN Y ALCANCE1.1. Propósito del Sistema 1.2. Objetivos del Negocio (Académicos y Productivos) 1.3. Alcance y Límites del Sistema 1.4. Actores y RolesSECCIÓN 2: VISTAS DE ARQUITECTURA (MODELO C4)2.1. [Diagrama] Vista de Contexto del Sistema (Nivel 1) 2.2. [Diagrama] Vista de Contenedores (Nivel 2) 2.3. [Diagrama] Vista de Despliegue (UML)SECCIÓN 3: VISTA DE CASOS DE USO (UML)3.1. [Diagrama] Casos de Uso PrincipalesSECCIÓN 4: VISTA DE DATOS4.1. [Diagrama] Modelo Entidad-Relación (E-R) 4.2. Diccionario de Datos (Expandido)SECCIÓN 5: VISTA DE IMPLEMENTACIÓN (EXPANDIDA)5.1. Estructura General del Repositorio 5.2. Especificación: Backend (Cloud) 5.3. Especificación: Frontend (Cloud) 5.4. Especificación: Edge (Laboratorio)SECCIÓN 6: ARQUITECTURA DE INTELIGENCIA ARTIFICIAL (EXPANDIDA)6.1. Pipeline de Entrenamiento (Offline) 6.2. Pipeline de Inferencia (Híbrido: Cloud + Edge) 6.3. Modelo SeleccionadoSECCIÓN 1: VISIÓN Y ALCANCE(Esta sección permanece igual que la v4.1, ya que define la visión del proyecto)1.1. Propósito del SistemaSIGC&T Rural es una plataforma web híbrida (Cloud/Edge) diseñada para actuar como un ecosistema de gestión del conocimiento y tecnología para el sector rural...1.2. Objetivos(O-01) Proveer un dashboard web centralizado...(O-02) Implementar un modelo de IA...(O-03) Establecer un laboratorio de hardware (Clúster 3-BBB)...(O-04) Crear una biblioteca de recursos educativos...(O-05) Cumplir con todos los artefactos del Proyecto Productivo ADSO.1.3. Alcance y LímitesDENTRO DEL ALCANCE: Desarrollo de la plataforma Cloud (React/Django), configuración del Clúster 3-BBB...FUERA DEL ALCANCE: Creación de hardware personalizado, app móvil nativa...1.4. Actores y RolesActorRolDescripciónInteracciones ClaveAgricultorUsuario FinalPropietario de cultivo...Ver Dashboard, Recibir Alertas...Estudiante SENAAprendizUsuario que consume contenido...Acceder a Cursos, Usar Labs...AdministradorMantenimiento(Rol de B. Gómez)...CRUD de Cursos, Ver Logs...Clúster BBBSistema ExternoEl hardware "Edge"...Enviar Telemetría (MQTT)...PlantVillageSistema ExternoFuente de datos para IA...N/A (Usado en entrenamiento).SECCIÓN 2: VISTAS DE ARQUITECTURA (Mermaid)2.1. [Diagrama] Vista de Contexto del Sistema (Nivel 1)Este diagrama muestra el sistema como una caja negra y sus interacciones. GitHub lo renderizará.graph TD
    subgraph "Actores Humanos"
        direction TB
        actor1[Agricultor]
        actor2[Estudiante SENA]
        actor3[Administrador]
    end

    subgraph "Sistema SIGC&T Rural"
        direction LR
        C4_Context[Plataforma Web Híbrida<br><b>SIGC&T Rural</b><br>(Software como Servicio)]
    end

    subgraph "Sistemas Externos"
        direction TB
        C4_Sys_BBB(<b>Clúster 3-BBB</b><br>Hardware "Edge" que envía<br>datos de sensores e imágenes)
        C4_Sys_PV(<b>PlantVillage / Kaggle</b><br>Fuentes de datos<br>para entrenamiento de IA)
        C4_Sys_SENA(<b>SENA SofiaPlus</b><br>Plataforma académica<br>(Integración Futura))
    end

    actor1 -- "Consulta Dashboard/Alertas (HTTPS)" --> C4_Context
    actor2 -- "Consume Cursos/Labs (HTTPS)" --> C4_Context
    actor3 -- "Administra Contenido (HTTPS)" --> C4_Context
    C4_Context -- "Obtiene datos de<br>entrenamiento (Offline)" --> C4_Sys_PV
    C4_Sys_BBB -- "Envía Datos (MQTT)<br>Envía Imágenes (API)" --> C4_Context
2.2. [Diagrama] Vista de Contenedores (Nivel 2)Desglosa el sistema en sus componentes principales (contenedores de software).graph TD
    actor1(Usuario<br>Agricultor / Estudiante<br>[Navegador Web])

    subgraph "Sistema SIGC&T Rural (Desplegado en Proveedor CLOUD, ej. Render)"
        direction TB
        WebApp[<b>Frontend (React App)</b><br>Sirve la UI/UX estática<br>al navegador del usuario]
        APIServer[<b>Backend (Django API)</b><br>API REST, Lógica de<br>negocio, Auth, WebSockets]
        Database[(<b>Base de Datos (PostgreSQL)</b><br>Almacena usuarios, cursos,<br>telemetría, análisis.)]
        AI_Service[<b>Servicio de Inferencia IA (Cloud)</b><br>Endpoint `/api/ia/classify`<br>Ejecuta modelo .h5]

        WebApp -- "Consume (API)" --> APIServer
        APIServer -- "Lee/Escribe" --> Database
        APIServer -- "Ejecuta" --> AI_Service
    end

    subgraph "Laboratorio 'Edge' (Clúster Físico en Red Local)"
        direction TB
        Cluster_GW(<b>Gateway (BBB-01)</b><br>Broker MQTT, Sincronización<br>con Cloud)
        Cluster_IA(<b>IA Edge (BBB-02)</b><br>API Flask + TFLite<br>para inferencia local)
        Cluster_IoT(<b>Sensores (BBB-03)</b><br>Scripts de Python<br>para leer GPIO + Cámara)

        Cluster_IoT -- "Publica (MQTT/LAN)" --> Cluster_GW
        Cluster_IoT -- "Envía Imagen (HTTP/LAN)" --> Cluster_IA
        Cluster_IA -- "Reporta (MQTT/LAN)" --> Cluster_GW
    end

    actor1 -- "Visita (HTTPS)" --> WebApp
    Cluster_GW -- "Envía Datos (MQTT/HTTPS)" --> APIServer
2.3. [Diagrama] Vista de Despliegue (UML)Muestra el hardware físico y el software que se ejecuta en ellos.graph TD
    subgraph "Internet (Cliente)"
        actor1(<b>Cliente (Navegador)</b><br>PC / Móvil)
    end

    subgraph "Cloud (Proveedor: Render - PaaS)"
        direction LR
        subgraph "Nodo de Cómputo (Contenedor Docker)"
            artifact_react[Frontend (React/Vite)]
            artifact_django[Backend (Django/Gunicorn)]
        end

        subgraph "Nodo de BD (Servicio)"
            node_db[<b>(Base de Datos)</b><br>PostgreSQL 15]
        end

        artifact_django -- "Conecta (TCP/IP)" --> node_db
    end

    subgraph "Laboratorio Físico (Red Local - LAN)"
        direction TB
        subgraph "<b>Nodo 1: BBB-01 (Gateway)</b><br>Debian OS"
            artifact_mqtt[Broker Mosquitto]
            artifact_sync[Script Sync (Python)]
        end

        subgraph "<b>Nodo 2: BBB-02 (IA-Edge)</b><br>Debian OS"
            artifact_flask[API (Flask)]
            artifact_tflite[Runtime TFLite]
        end

        subgraph "<b>Nodo 3: BBB-03 (Sensores)</b><br>Debian OS"
            artifact_gpio[Script Sensores (Python)]
            artifact_cam[Driver Cámara]
        end
    end

    actor1 -- "HTTPS" --> artifact_react
    actor1 -- "HTTPS (API/WSS)" --> artifact_django
    artifact_sync -- "MQTT/HTTPS (API)" --> artifact_django
    artifact_gpio -- "MQTT (LAN)" --> artifact_mqtt
    artifact_gpio -- "HTTP (LAN)" --> artifact_flask
    artifact_flask -- "MQTT (LAN)" --> artifact_mqtt
SECCIÓN 3: VISTA DE CASOS DE USO (UML)3.1. [Diagrama] Casos de Uso Principalesgraph TD
    subgraph "Sistema SIGC&T Rural"
        U1(<b>(Ver Dashboard de Cultivo)</b>)
        U2(<b>(Recibir Alertas de IA)</b>)
        U3(<b>(Solicitar Análisis IA de Imagen)</b>)
        U4(<b>(Acceder a Biblioteca de Cursos)</b>)
        U5(<b>(Usar Laboratorio Virtual)</b>)
        U6(<b>(Administrar Contenido)</b>)
        U7(<b>(Enviar Telemetría de Sensor)</b>)
        U8(<b>(Reportar Anomalía IA-Edge)</b>)
    end

    actorA[Agricultor]
    actorB[Estudiante SENA]
    actorC[Administrador]
    actorS[<b>(Sistema)</b><br>Clúster BBB]

    actorA -- " " --> U1
    actorA -- " " --> U2
    actorA -- " " --> U3
    actorB -- " " --> U4
    actorB -- " " --> U5
    actorC -- " " --> U6
    actorC -- " " --> U1
    actorS -- " " --> U7
    actorS -- " " --> U8
SECCIÓN 4: VISTA DE DATOS4.1. [Diagrama] Modelo Entidad-Relación (E-R)Este es el diseño de la base de datos principal en PostgreSQL.erDiagram
    Usuarios {
        UUID id PK
        string username
        string email
        string password_hash
        string role
    }

    Proyectos {
        UUID id PK
        UUID usuario_id FK
        string nombre_proyecto
        string descripcion
        string ubicacion
    }

    Nodos_Edge {
        UUID id PK
        UUID proyecto_id FK
        string nombre_nodo
        string tipo_hardware "ej: 'BBB-01', 'RPi-01'"
        string estado "ej: 'online', 'offline'"
        string ip_local
    }

    Sensores {
        UUID id PK
        UUID nodo_id FK
        string tipo_sensor "ej: 'temperatura', 'humedad_suelo'"
        string pin_gpio
    }

    Lecturas_Sensores {
        UUID id PK
        UUID sensor_id FK
        string valor
        datetime timestamp
    }

    Analisis_IA {
        UUID id PK
        UUID proyecto_id FK
        string imagen_url
        string resultado_prediccion
        float confianza
        string feedback_usuario
        datetime timestamp
    }

    Contenido_Academico {
        UUID id PK
        string titulo
        string descripcion
        string tipo_contenido "ej: 'Curso', 'Video', 'PDF'"
        string url_recurso
        string tags
    }

    Usuarios ||--o{ Proyectos : "Posee"
    Proyectos ||--o{ Nodos_Edge : "Contiene"
    Nodos_Edge ||--o{ Sensores : "Tiene"
    Sensores ||--o{ Lecturas_Sensores : "Genera"
    Proyectos ||--o{ Analisis_IA : "Registra"
    Usuarios ||--o{ Analisis_IA : "Solicita"
    Contenido_Academico }|..|{ Usuarios : "Consulta (opcional)"
4.2. Diccionario de Datos (Expandido)Tabla: UsuariosAlmacena las credenciales y roles de todos los usuarios del sistema.| Columna | Tipo | Nulo | Descripción || :--- | :--- | :--- | :--- || id (PK) | UUID | No | Identificador único universal. || username | string(80) | No | Nombre de usuario único. || email | string(120) | No | Correo único. || password_hash | string(255) | No | Hash de la contraseña (Bcrypt). || role | string(20) | No | Rol: 'agricultor', 'estudiante', 'admin'. |Tabla: ProyectosUn proyecto agrupa nodos y datos para un usuario (ej. "Invernadero Tomates").| Columna | Tipo | Nulo | Descripción || :--- | :--- | :--- | :--- || id (PK) | UUID | No | Identificador único del proyecto. || usuario_id (FK) | UUID | No | Referencia a Usuarios(id). || nombre_proyecto | string(100) | No | Nombre descriptivo del proyecto. || descripcion | text | Si | Detalles del proyecto. || ubicacion | string(255) | Si | Coordenadas o dirección. |Tabla: Nodos_EdgeRepresenta un dispositivo de hardware físico (BBB, RPi) en un proyecto.| Columna | Tipo | Nulo | Descripción || :--- | :--- | :--- | :--- || id (PK) | UUID | No | Identificador único del nodo. || proyecto_id (FK)| UUID | No | Referencia a Proyectos(id). || nombre_nodo | string(50) | No | Ej: "BBB-01-Gateway", "BBB-03-Sensores". || tipo_hardware | string(30) | No | Ej: "BBB RevC", "RPi 4", "Arduino Uno". || estado | string(20) | No | Ej: "online", "offline", "error". || ip_local | string(45) | Si | IP en la LAN del laboratorio. |Tabla: SensoresDefine un sensor específico conectado a un Nodo Edge.| Columna | Tipo | Nulo | Descripción || :--- | :--- | :--- | :--- || id (PK) | UUID | No | Identificador único del sensor. || nodo_id (FK) | UUID | No | Referencia a Nodos_Edge(id). || tipo_sensor | string(50) | No | Ej: "temperatura", "humedad_suelo", "camara". || pin_gpio | string(10) | Si | Pin físico (ej: "P8_10", "GPIO4"). |Tabla: Lecturas_SensoresBase de datos de series temporales (TSDB) que almacena todas las lecturas.| Columna | Tipo | Nulo | Descripción || :--- | :--- | :--- | :--- || id (PK) | UUID | No | Identificador único de la lectura. || sensor_id (FK) | UUID | No | Referencia a Sensores(id). || valor | string(50) | No | Valor del sensor (se guarda como string). || timestamp | datetime | No | Fecha y hora (UTC) de la lectura. |Tabla: Analisis_IARegistra cada ejecución del modelo de IA, ya sea del Cloud o del Edge.| Columna | Tipo | Nulo | Descripción || :--- | :--- | :--- | :--- || id (PK) | UUID | No | Identificador único del análisis. || proyecto_id (FK)| UUID | No | Referencia a Proyectos(id). || imagen_url | string(255) | No | URL (bucket S3 o local) de la imagen analizada. || resultado_prediccion | string(100)| No | Ej: "Tomate_Sano", "Tomate_Tizon_Tardio". || confianza | float | No | Nivel de confianza (0.0 a 1.0) de la predicción. || feedback_usuario | string(100)| Si | Corrección del usuario (ej: "Error, era Tizon_Temprano"). || timestamp | datetime | No | Fecha y hora (UTC) del análisis. |Tabla: Contenido_AcademicoAlmacena los metadatos de los cursos, videos y laboratorios.| Columna | Tipo | Nulo | Descripción || :--- | :--- | :--- | :--- || id (PK) | UUID | No | Identificador único del contenido. || titulo | string(255) | No | Título del curso o video. || descripcion | text | Si | Resumen del contenido. || tipo_contenido | string(30) | No | Ej: "Curso", "Video", "PDF", "Lab_Virtual". || url_recurso | string(255) | Si | Enlace al recurso (YouTube, PDF, o ruta interna). || tags | string(255) | Si | Ej: "fisica, electronica, bbb". |SECCIÓN 5: VISTA DE IMPLEMENTACIÓN (EXPANDIDA)5.1. Estructura General del RepositoriosigcTiArural/
├── config/              # Configuración (settings.ini, .env.example)
├── data/                # Datasets (CSV, logs)
├── docs/                # Documentación (MASTERDOC, UML, etc.)
├── src/                 # CÓDIGO FUENTE
│   ├── ai_models/       # Notebooks (.ipynb) y Modelos (.h5, .tflite)
│   ├── backend/         # Proyecto Django (Cloud)
│   ├── embedded/        # Scripts Python (Edge/BBB)
│   └── frontend/        # Proyecto React (Cloud)
└── tests/               # Pruebas unitarias
5.2. Especificación: Backend (Cloud)Ruta: src/backend/Tecnología: Python 3.10+, Django 4+, Django Rest Framework (DRF)Punto de Entrada: manage.py / sigct_backend/wsgi.pyApps Clave:sigct_backend/: Configuración central (settings.py, urls.py principal).users/: Modelo Usuario personalizado. Autenticación (JWT o Token).api/: Lógica de negocio.models.py: Define todas las tablas (Proyectos, Nodos, Sensores, etc.).views.py: Contiene las Vistas de API (DRF ViewSets).ProyectoViewSet: CRUD para Proyectos.SensorReadingCreateView: Endpoint que recibe POST desde el Edge.LatestReadingsListView: Endpoint para el Dashboard (GET).AnalysisRequestView: Endpoint para subir imagen y ejecutar IA.ContenidoViewSet: CRUD para Cursos.serializers.py: Serializadores para models.py (convertir a JSON).urls.py: Enrutador para los endpoints de la API (/api/v1/...).5.3. Especificación: Frontend (Cloud)Ruta: src/frontend/Tecnología: React 18+, Vite, TailwindCSSPunto de Entrada: index.html -> src/main.jsx -> src/App.jsxComponentes Clave:src/pages/:Dashboard.jsx: Vista principal, consume LatestReadingsListView.ProyectoDetail.jsx: Vista detallada de un proyecto.LaboratorioIA.jsx: Contiene el formulario para AnalysisRequestView.Biblioteca.jsx: Consume ContenidoViewSet.Login.jsx: Página de inicio de sesión.src/components/:NavBar.jsx: Navegación principal.SensorCard.jsx: Tarjeta individual para mostrar una lectura.Chart.jsx: Gráfico de series temporales (usando Chart.js o Recharts).UploadWidget.jsx: Componente para subir la imagen.src/services/api.js: Instancia de Axios configurada con la URL base del backend y manejo de tokens de autenticación.5.4. Especificación: Edge (Laboratorio)Ruta: src/embedded/Tecnología: Python 3.9+ (Debian), Flask, Paho-MQTT, Adafruit_BBIONodo 1: bbb_01_gateway/mqtt_broker.py: Script principal.Se conecta al broker Mosquitto local (o lo hostea).Se suscribe a tópicos (ej. sigct/+/sensores).En un bucle, recibe mensajes, los agrupa (ej. cada 1 min) y los envía vía requests.post() a la API de Django (/api/v1/readings/).Maneja reconexión y lógica de "store-and-forward" si el Cloud no está disponible.Nodo 2: bbb_02_ia_edge/tflite_api.py: API local ligera (Flask).Define un endpoint (ej. /classify_local).Carga el modelo model.tflite al iniciar.Recibe una imagen (POST), la pre-procesa (resize, normalize) y ejecuta interpreter.invoke().Devuelve un JSON con la predicción.Nodo 3: bbb_03_sensors/sensor_reader.py: Script principal (ejecutado como servicio).Configura Paho-MQTT para conectarse al Broker de BBB-01.En un bucle infinito (ej. cada 10 seg):Lee Adafruit_BBIO.GPIO para DHT22, humedad, etc.Publica los datos en JSON al tópico MQTT (ej. sigct/bbb03/sensores).camera_capture.py: Script (puede ser parte del sensor_reader).Captura imagen de la cámara USB (usando OpenCV).Envía la imagen (POST) a la API de BBB-02 (/classify_local).Recibe la respuesta JSON y la publica en MQTT (ej. sigct/bbb03/analisis).SECCIÓN 6: ARQUITECTURA DE INTELIGENCIA ARTIFICIAL (EXPANDIDA)6.1. Pipeline de Entrenamiento (Offline)Este proceso se ejecuta localmente (en tu PC o en Google Colab) y se documenta en src/ai_models/notebooks/plant_disease_training.ipynb.Adquisición de Datos: Descargar y combinar datasets de Kaggle y PlantVillage.Pre-procesamiento:Aumentación de Datos (Data Augmentation): Rotación, zoom, flip horizontal/vertical para aumentar la variabilidad.Redimensionar imágenes (ej. 224x224 px).Normalizar píxeles (valores de 0-255 a 0-1).Definición del Modelo:Usar Transfer Learning (Aprendizaje por Transferencia) con un modelo pre-entrenado como MobileNetV2 (eficiente para Edge).Congelar las capas base (no re-entrenarlas).Añadir un "Head" (cabeza) personalizado: Capas GlobalAveragePooling2D, Dropout (para evitar overfitting) y Dense (con activación softmax) del tamaño del número de clases (enfermedades).Compilación: Usar optimizador Adam y categorical_crossentropy como función de pérdida.Entrenamiento: Entrenar el modelo, guardando "checkpoints" del mejor modelo basado en val_accuracy.Exportación:Guardar el modelo completo de alta precisión: model.h5.Convertir y guardar el modelo ligero: model.tflite.6.2. Pipeline de Inferencia (Híbrido: Cloud + Edge)A. Inferencia Cloud (Alta Precisión)Trigger: Usuario sube una imagen al LaboratorioIA.jsx (React).Flujo:React envía la imagen al endpoint /api/ia/classify/ (Django).Django carga el modelo completo (model.h5).Procesa la imagen y devuelve una predicción JSON de alta confianza.El resultado se guarda en la tabla Analisis_IA.B. Inferencia Edge (Rápida / Alerta Temprana)Trigger: Script camera_capture.py en BBB-03 (ej. cada 30 min).Flujo:BBB-03 captura imagen.BBB-03 envía la imagen a la API de BBB-02 (/classify_local).BBB-02 (Flask) carga el modelo model.tflite y ejecuta la inferencia.Decisión:Si el resultado es "Sano" (confianza > 90%), se descarta.Si el resultado es "Enfermo" (o confianza baja), se publica el resultado + imagen a un tópico MQTT (ej. sigct/alerta/ia).BBB-01 (Gateway) recibe este mensaje de alerta y envía la imagen y el resultado a la API de Django (Cloud) para registro permanente en Analisis_IA.6.3. Modelo SeleccionadoArquitectura: MobileNetV2Por qué: Es una Red Neuronal Convolucional (CNN) diseñada para ser extremadamente ligera y rápida, ideal para dispositivos con recursos limitados como la BeagleBone Black (al convertirla a TFLite). Ofrece un excelente balance entre precisión y eficiencia computacional.