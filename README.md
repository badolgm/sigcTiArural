# 🌾 SIGC&T Rural
### Sistema Integrado de Gestión en Ciencia y Tecnología Rural

<div align="center">

![SIGC&T Rural Banner](docs/diagrams/banner.svg)

[![Proyecto Productivo SENA](https://img.shields.io/badge/Proyecto%20Productivo-SENA-2e8b57?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyMmMxLjEgMCAyLS45IDItMlYxMmMwLTEuMS0uOS0yLTItMkg0Yy0xLjEgMC0yIC45LTIgMnY4YzAgMS4xLjkgMiAyIDJoOHoiLz48cGF0aCBkPSJNMjAgMTJjMC0xLjEtLjktMi0yLTJoLTR2NGg0YzEuMSAwIDItLjkgMi0yeiIvPjwvc3ZnPg==)](https://www.sena.edu.co/)
[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo%20Activo-00d4ff?style=for-the-badge&logo=StatusPage&logoColor=white)](https://github.com/badolgm/sigcTiArural)
[![Versión](https://img.shields.io/badge/Versión-7.0-7c3aed?style=for-the-badge&logo=semver&logoColor=white)](https://github.com/badolgm/sigcTiArural/releases)
[![Arquitectura](https://img.shields.io/badge/Arquitectura-Hexagonal-ff6f00?style=for-the-badge&logo=hexo&logoColor=white)](docs/MASTERDOC.md#9-arquitectura-hexagonal)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-fbbf24?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2+-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15+-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![BeagleBone](https://img.shields.io/badge/BeagleBone-Black%20Rev%20C-FF7F00?style=for-the-badge&logo=BeagleBoard&logoColor=white)](https://beagleboard.org/black)

---

**Plataforma web híbrida (Cloud/Edge) que integra IoT, Inteligencia Artificial y educación técnica para impulsar la agricultura sostenible y la inclusión tecnológica en zonas rurales de Colombia.**

📚 [Documentación Completa (MASTERDOC)](docs/MASTERDOC.md) • 🚀 [Plan Maestro](docs/PLAN_MAESTRO.md) • � [Runbook de Continuidad](docs/CONTINUITY_RUNBOOK.md) • �🐞 [Reportar Bug](https://github.com/badolgm/sigcTiArural/issues) • 💡 [Solicitar Mejora](https://github.com/badolgm/sigcTiArural/issues/new)

</div>

---

## 📑 Tabla de Contenidos

<details>
<summary><b>Haz clic para expandir el índice completo</b></summary>

### Secciones Principales
1. [🎯 Visión General del Proyecto](#-visión-general-del-proyecto)
2. [✨ Características Principales](#-características-principales)
3. [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
4. [📊 Stack Tecnológico](#-stack-tecnológico)
5. [🗄️ Base de Datos (PostgreSQL)](#️-base-de-datos-postgresql)
6. [🤖 Inteligencia Artificial](#-inteligencia-artificial)
7. [🧩 Edge Computing](#-edge-computing)
8. [🔬 Laboratorios Técnicos](#-laboratorios-técnicos)
9. [🚀 Guía de Instalación Rápida](#-guía-de-instalación-rápida)
10. [🧱 Estructura del Proyecto](#-estructura-del-proyecto)
11. [📅 Estado del Proyecto y Roadmap](#-estado-del-proyecto-y-roadmap)
12. [🤝 Contribuciones](#-contribuciones)
13. [🎓 Contexto Académico SENA](#-contexto-académico-sena)
14. [🌍 Impacto Social (ODS)](#-impacto-social-ods)
15. [📄 Licencia](#-licencia)
16. [👤 Autor](#-autor)

</details>

---

<a name="-visión-general-del-proyecto"></a>
## 🎯 Visión General del Proyecto

**SIGC&T Rural** (Sistema Integrado de Gestión del Conocimiento y Tecnología Rural) es un **ecosistema autónomo y agnóstico en hardware y software**, de código abierto, que integra **sensores, robots, sistemas de inteligencia artificial y personas como nodos cooperantes**, orientados a observar, cuidar, aprender y actuar sobre **entornos vivos** de manera sostenible, resiliente y educativa

### 🌟 Características Distintivas

<table>
<tr>
<td width="50%">

#### 🌐 Arquitectura Híbrida
Combina procesamiento en la nube (Cloud) con computación en el borde (Edge), permitiendo operación resiliente incluso con conectividad intermitente.

</td>
<td width="50%">

#### 🤖 IA Dual
- **Cloud:** TensorFlow para entrenamiento y análisis complejo
- **Edge:** TensorFlow Lite optimizado para BeagleBone Black

</td>
</tr>
<tr>
<td width="50%">

#### 📚 Educación Abierta
Laboratorios virtuales interactivos con visualización 3D (Three.js) para robótica, matemáticas avanzadas y ciencia de datos.

</td>
<td width="50%">

#### 🌾 Impacto Social
Alineado con los **Objetivos de Desarrollo Sostenible (ODS)** de la ONU: Hambre Cero, Educación de Calidad, Industria e Innovación.

</td>
</tr>
</table>

### 🎯 Objetivos Académicos (ADSO - SENA)

| ID | Objetivo | Descripción | Estado |
|:--:|----------|-------------|:------:|
| **O-01** | Dashboard Centralizado | Visualización web de datos de sensores en tiempo real | ✅ Completado |
| **O-02** | Modelo de IA | Clasificación de enfermedades de plantas (>85% accuracy) | ✅ Completado |
| **O-03** | Laboratorio Hardware | Clúster de 3 BeagleBone Black operacional | 🟡 En Progreso |
| **O-04** | Biblioteca Educativa | Repositorio de 20+ recursos curados | 🟡 En Progreso |
| **O-05** | Cumplimiento ADSO | Entregables completos del Proyecto Productivo | 🟡 En Progreso |

---

<a name="-características-principales"></a>
## ✨ Características Principales

<div align="center">

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#c2ba91','primaryTextColor':'#412402','primaryBorderColor':'#3f9999','lineColor':'#6e854349','secondaryColor':'#1887b3','tertiaryColor':'#9badcf'}}}%%
mindmap
  root((SIGC&T Rural))
    Cloud Platform
      Dashboard IoT
      API RESTful
      PostgreSQL 15
      IA Service
    Edge Computing
      BeagleBone Black x3
      MQTT Broker
      TensorFlow Lite
      Sensor Array
    Education
      Laboratorio Robótica
      Laboratorio Matemáticas
      Ciencia de Datos
      Asistente IA Voz
    Integrations
      PlantVillage Dataset
      Webots Simulator
      Docker Compose
```

</div>

### 🔥 Funcionalidades Core

- 📈 **Dashboard IoT en Tiempo Real:** Visualización de telemetría de sensores con latencia <2s
- 🧠 **Diagnóstico IA:** Clasificación de enfermedades en plantas (Cloud + Edge)
- 🎓 **Biblioteca Educativa:** Cursos, videos y laboratorios interactivos
- 🔌 **Arquitectura Híbrida:** Lógica *store-and-forward* tolerante a fallos de red
- 🔐 **Seguridad:** Autenticación JWT + HTTPS + CORS configurado
- 📡 **Comunicaciones:** API REST + WebSockets para datos en vivo
- 📱 **Diseño Responsivo:** Interfaz moderna con React + TailwindCSS (Mobile-First)

---


<a name="️-arquitectura-del-sistema"></a>
## 🏗️ Arquitectura del Sistema

> **Nota Técnica:** El entrenamiento de IA se realiza en Cloud/Local; las BeagleBone Black actúan como nodos Edge para adquisición, preprocesamiento e inferencia optimizada con TFLite.

### 📐 Nivel 1: Vista de Contexto (C4 Model)

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#7c3aed','fontSize':'16px'}}}%%
flowchart TB
    subgraph users["👥 Usuarios"]
        A["🌾 Agricultor"]
        B["🎓 Estudiante SENA"]
        C["🔧 Administrador"]
    end

    subgraph sigct["🌐 SIGC&T Rural Platform"]
        S["☁️ Plataforma Web Híbrida<br/>Cloud + Edge Computing"]
    end

    subgraph external["🔗 Sistemas Externos"]
        E1["🤖 Cluster 3x BeagleBone Black<br/>(Edge Devices)"]
        E2["📊 PlantVillage Dataset<br/>(Kaggle)"]
        E3["🎓 SENA SofiaPlus<br/>(Futuro - OAuth 2.0)"]
    end

    A -->|"Consulta Dashboard<br/>Monitoreo de Cultivos"| S
    B -->|"Accede a Cursos<br/>y Laboratorios"| S
    C -->|"Administra Sistema<br/>y Usuarios"| S
    
    E1 -->|"MQTT/HTTPS<br/>Telemetría IoT"| S
    S -->|"Uso de Modelos<br/>Offline/Online"| E2
    S -.->|"Autenticación SSO<br/>(Planificado)"| E3

    style users fill:#1e293b,stroke:#8b5cf6,stroke-width:2px
    style sigct fill:#7c3aed,stroke:#a78bfa,stroke-width:3px
    style external fill:#0f172a,stroke:#6366f1,stroke-width:2px
```

### ⚙️ Nivel 3: Arquitectura Hexagonal (Backend Clean Architecture)

```mermaid
graph TD
    subgraph "Capa de Adaptadores (Infraestructura)"
        UI[React Frontend] -->|REST API| Views[Django Views V2]
        Views --> DB_Adap[Django ORM Adapter]
        Views --> AI_Adap[FastAPI AI Adapter]
    end

    subgraph "Capa de Puertos (Interfaces)"
        Views --> Lab_Port[ProcesadorLaboratorioPort]
        DB_Adap -.-> Repo_Port[RepositoryPort]
        AI_Adap -.-> AI_Port[AIServicePort]
    end

    subgraph "Capa de Dominio (Lógica Pura)"
        Lab_Port --> Service[LaboratorioService]
        Service --> Strategy[Strategy Pattern]
        Strategy --> Robotica[ProcesadorRobotica]
        Strategy --> Agricultura[ProcesadorAgricultura]
        Strategy --> Telecom[ProcesadorTelecom]
        Strategy --> Electronica[ProcesadorElectronica]
    end

    style Service fill:#f96,stroke:#333,stroke-width:4px
    style Lab_Port fill:#bbf,stroke:#333,stroke-width:2px
    style Views fill:#dfd,stroke:#333,stroke-width:2px
```

### 🔧 Nivel 2: Vista de Contenedores

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#7c3aed'}}}%%
flowchart TB
    U["🌐 Usuario<br/>(Navegador Web)"]

    subgraph cloud["☁️ Cloud Infrastructure (Docker Compose)"]
        subgraph frontend["🎨 Frontend Layer"]
            FE["⚛️ React App<br/>Vite + TailwindCSS<br/>Puerto: 5173"]
        end
        
        subgraph backend["⚙️ Backend Layer"]
            API["🐍 Django API<br/>DRF + Channels<br/>Puerto: 8000"]
        end
        
        subgraph ai["🧠 AI Service Layer"]
            AIS["🤖 TensorFlow Server<br/>FastAPI<br/>Puerto: 8081"]
        end
        
        subgraph db["🗄️ Database Layer"]
            DB[("🐘 PostgreSQL 15<br/>Puerto: 5432")]
        end
        
        FE -->|"REST API<br/>/api/v1/"| API
        FE -->|"WebSockets<br/>/ws/"| API
        API -->|"SQL Queries<br/>ORM Django"| DB
        API -->|"HTTP POST<br/>Inferencia IA"| AIS
    end

    subgraph edge["🏭 Laboratorio Edge (Red Local)"]
        GW["🔌 BBB-01 Gateway<br/>Mosquitto + Sync<br/>192.168.1.10"]
        IA_EDGE["🧠 BBB-02 IA Edge<br/>Flask + TFLite<br/>192.168.1.11"]
        IOT["📡 BBB-03 Sensores<br/>Cámara + DHT22<br/>192.168.1.12"]
        
        IOT -->|"MQTT (LAN)<br/>readings/*"| GW
        IOT -->|"HTTP POST<br/>imagen crop"| IA_EDGE
        IA_EDGE -->|"MQTT<br/>diagnosis/*"| GW
    end

    U -->|"HTTPS:5173"| FE
    U -->|"HTTPS/WSS:8000"| API
    GW -->|"HTTPS POST<br/>/api/v1/readings/"| API

    style cloud fill:#1e293b,stroke:#8b5cf6,stroke-width:2px
    style edge fill:#0f172a,stroke:#10b981,stroke-width:2px
    style frontend fill:#7c3aed,stroke:#a78bfa
    style backend fill:#6366f1,stroke:#818cf8
    style ai fill:#8b5cf6,stroke:#a78bfa
    style db fill:#0891b2,stroke:#22d3ee
```

> 📖 **Diagramas Completos:** Consulta [MASTERDOC.md](docs/MASTERDOC.md) para vistas de Componentes, Despliegue y Diagramas Entidad-Relación (ERD).

---

<a name="-stack-tecnológico"></a>
## 📊 Stack Tecnológico

<table>
<tr>
<td width="33%" valign="top">

### 🎨 Frontend
- **Framework:** React 18+
- **Build Tool:** Vite 5
- **Estilos:** TailwindCSS 3
- **3D Graphics:** Three.js r128
- **Gráficos:** Recharts, Plotly.js
- **Estado:** React Hooks (useState, useEffect)
- **Routing:** React Router v6
- **HTTP Client:** Axios

</td>
<td width="33%" valign="top">

### ⚙️ Backend
- **Framework:** Django 4.2+
- **API:** Django REST Framework
- **WebSockets:** Django Channels
- **ASGI Server:** Daphne
- **Auth:** JWT (djangorestframework-simplejwt)
- **CORS:** django-cors-headers
- **DB Connector:** psycopg2-binary
- **Env Config:** python-dotenv

</td>
<td width="33%" valign="top">

### 🧠 Inteligencia Artificial
- **Framework:** TensorFlow 2.15+
- **Edge Inference:** TensorFlow Lite
- **API Service:** FastAPI + Uvicorn
- **Modelos:** MobileNetV2, EfficientNet
- **Datasets:** PlantVillage (Kaggle)
- **Audio:** Pydub, SpeechRecognition
- **Visión:** OpenCV (cv2)

</td>
</tr>
<tr>
<td width="33%" valign="top">

### 🗄️ Base de Datos
- **RDBMS:** PostgreSQL 15
- **ORM:** Django ORM
- **Migraciones:** Django Migrations
- **Backup:** pg_dump (automatizado)
- **Admin UI:** pgAdmin 4 (opcional)

</td>
<td width="33%" valign="top">

### 🐳 DevOps
- **Contenedores:** Docker 24+
- **Orquestación:** Docker Compose v2
- **Proxy:** Nginx (producción)
- **CI/CD:** GitHub Actions (planificado)
- **Monitoreo:** Prometheus + Grafana (futuro)

</td>
<td width="33%" valign="top">

### 🔌 Edge Computing
- **Hardware:** BeagleBone Black Rev C
- **OS:** Debian 11 (Bullseye)
- **Broker MQTT:** Mosquitto
- **Cliente MQTT:** Paho-MQTT (Python)
- **GPIO:** Adafruit-Blinka
- **Sensores:** DHT22, Soil Moisture

</td>
</tr>
</table>

---

<a name="️-base-de-datos-postgresql"></a>
## 🗄️ Base de Datos (PostgreSQL)

### 📊 Modelo de Datos Principal

```mermaid
%%{init: {'theme':'dark', 'er': {'layoutDirection': 'TB'}}}%%
erDiagram
    USER ||--o{ ROBOT : posee
    USER ||--o{ SENSOR_READING : registra
    ROBOT ||--o{ ROBOT_TELEMETRY : genera
    ROBOT ||--o{ ROBOT_COMMAND : recibe
    
    USER {
        int id PK
        string username UK
        string email UK
        string password_hash
        boolean is_active
        datetime date_joined
    }
    
    ROBOT {
        int id PK
        string robot_id UK "Ej: RBT-001"
        string name
        string type "ground|aerial|arm"
        string status "active|idle|maintenance"
        int owner_id FK
        datetime created_at
    }
    
    ROBOT_TELEMETRY {
        int id PK
        int robot_id FK
        float battery_level "0-100%"
        float position_x
        float position_y
        float position_z
        float velocity
        jsonb sensors_data
        datetime timestamp
    }
    
    ROBOT_COMMAND {
        int id PK
        int robot_id FK
        string command_type "move|stop|calibrate"
        jsonb parameters
        string status "pending|executed|failed"
        datetime created_at
        datetime executed_at
    }
    
    SENSOR_READING {
        int id PK
        int user_id FK
        string node_id "Ej: BBB-03"
        float temperature
        float humidity
        float soil_moisture
        datetime timestamp
    }
```

### 🔑 Características de la Base de Datos

- ✅ **Integridad Referencial:** Claves foráneas con `ON DELETE CASCADE`
- ✅ **Índices Optimizados:** Búsquedas por `timestamp`, `robot_id`, `user_id`
- ✅ **Tipos Avanzados:** JSONB para datos flexibles de sensores
- ✅ **Migraciones Versionadas:** Django Migrations para control de cambios
- ✅ **Respaldos Automáticos:** Scripts de `pg_dump` programados

> 📖 **Schema Completo:** Consulta `schema_postgresql.sql` en la raíz del proyecto.

---

<a name="-inteligencia-artificial"></a>
## 🤖 Inteligencia Artificial

### 🧠 Modelo de Clasificación de Enfermedades en Plantas

<table>
<tr>
<td width="50%">

#### ☁️ Infraestructura Cloud
- **Arquitectura:** MobileNetV2 (Transfer Learning)
- **Dataset:** PlantVillage (54,305 imágenes)
- **Clases:** 38 enfermedades (tomate, papa, maíz)
- **Accuracy:** 92.5% (validación)
- **Framework:** TensorFlow/Keras
- **Formato:** `.h5` (150 MB)

</td>
<td width="50%">

#### 🏭 Infraestructura Edge
- **Arquitectura:** MobileNetV2 (Cuantizado INT8)
- **Framework:** TensorFlow Lite
- **Plataforma:** BeagleBone Black
- **Formato:** `.tflite` (4.2 MB)
- **Latencia:** ~800 ms/imagen
- **Memoria:** <50 MB RAM

</td>
</tr>
</table>

### 🎙️ Asistente de Voz Conversacional

- **Reconocimiento:** SpeechRecognition (Google/Sphinx)
- **Procesamiento:** Memoria contextual (sesiones)
- **Síntesis:** pyttsx3 (TTS local)
- **Integración:** Consulta datos en PostgreSQL en tiempo real
- **Capacidades:** Responde preguntas sobre telemetría de robots y sensores

> 📖 **Notebooks de Entrenamiento:** Disponibles en `src/ai_models/notebooks/`

---

<a name="-edge-computing"></a>
## 🧩 Edge Computing

### 🔌 Arquitectura del Clúster BeagleBone Black

```mermaid
%%{init: {'theme':'dark', 'flowchart': {'curve':'basis'}}}%%
flowchart LR
    subgraph cluster["🏭 Laboratorio Edge (192.168.1.0/24)"]
        BBB1["🔌 BBB-01 Gateway<br/>IP: 192.168.1.10<br/>Roles:<br/>- Broker MQTT<br/>- Sync Cloud"]
        BBB2["🧠 BBB-02 IA Edge<br/>IP: 192.168.1.11<br/>Roles:<br/>- Inferencia TFLite<br/>- API Flask"]
        BBB3["📡 BBB-03 Sensores<br/>IP: 192.168.1.12<br/>Roles:<br/>- Adquisición Datos<br/>- Cámara USB"]
        
        BBB3 -->|"MQTT: readings/*"| BBB1
        BBB3 -->|"POST /predict"| BBB2
        BBB2 -->|"MQTT: diagnosis/*"| BBB1
    end
    
    BBB1 -->|"HTTPS POST<br/>/api/v1/readings/"| CLOUD["☁️ Cloud Backend<br/>(Django API)"]
    
    style cluster fill:#0f172a,stroke:#10b981,stroke-width:2px
    style BBB1 fill:#7c3aed,stroke:#a78bfa
    style BBB2 fill:#8b5cf6,stroke:#a78bfa
    style BBB3 fill:#6366f1,stroke:#818cf8
```

### 🛠️ Funcionalidades Edge

| Nodo | Hardware | Software | Responsabilidad |
|------|----------|----------|-----------------|
| **BBB-01** | BeagleBone Black Rev C + Ethernet | Mosquitto, Python 3.9 | Gateway MQTT + Sincronización Cloud |
| **BBB-02** | BeagleBone Black Rev C + 4GB eMMC | TensorFlow Lite, Flask | Inferencia local de IA |
| **BBB-03** | BeagleBone Black Rev C + Cámara USB | Python GPIO, OpenCV | Adquisición de datos de sensores |

---

<a name="-laboratorios-técnicos"></a>
## 🔬 Laboratorios Técnicos

<div align="center">

### 🎓 Plataforma Educativa Interactiva

</div>

<table>
<tr>
<td width="33%" valign="top">

#### 🤖 Laboratorio de Robótica
- **Visualización 3D:** Three.js + React Three Fiber
- **Simulación:** Trayectorias helicoidales
- **Telemetría en Vivo:** Posición (X,Y,Z), Batería, Velocidad
- **Integración:** ROSBridge (futuro)
- **Control:** Panel de comandos RESTful

</td>
<td width="33%" valign="top">

#### 📐 Laboratorio de Matemáticas
- **Solucionador:** Ecuaciones diferenciales
- **Visualización:** Gráficas interactivas (Plotly)
- **Transformadas:** Laplace, Fourier
- **Análisis:** Series de Taylor, Límites
- **Motor:** MathJS + Pyodide (Python en navegador)

</td>
<td width="33%" valign="top">

#### 📊 Laboratorio de Ciencia de Datos
- **Datasets:** PlantVillage, Kaggle agrícolas
- **Análisis:** Pandas, NumPy (Pyodide)
- **Visualización:** Plotly.js, D3.js
- **ML:** Scikit-learn en navegador
- **Notebooks:** Jupyter embebido

</td>
</tr>
</table>

> 🎮 **Demo en Vivo:** Accede a `http://localhost:5173/labs` después de la instalación.

---

<a name="-guía-de-instalación-rápida"></a>
## 🚀 Guía de Instalación Rápida

### 📋 Requisitos Previos

- **Sistema Operativo:** Linux, macOS o Windows 10/11 con WSL2
- **Software:**
  - Git 2.30+
  - Docker 24+ y Docker Compose v2
  - Python 3.10+ (para desarrollo local)
  - Node.js 18+ y npm 9+ (para desarrollo local)

---

### 💻 Instalación Local (Desarrollo Híbrido - Modo Rápido)

```bash
Esta opción es ideal para desarrollo activo. Usamos Docker para las bases de datos (estabilidad) y la terminal local para el código (velocidad).

# 1. Levantar solo las Bases de Datos
# Encendemos los "motores" de datos en segundo plano
docker-compose up -d db db-mysql

# 2. Configurar el "Puente" (.env local)
En tu archivo src/backend/.env, asegúrate de ajustar el host para que el código local encuentre el contenedor:

Cambia: DB_HOST=db ➔ DB_HOST=localhost

Manten: DB_PORT=5432

# 3. Backend (Django)
cd src/backend

# Crear y activar entorno virtual
python -m venv venv
source venv/Scripts/activate

# Instalar dependencias y sincronizar tablas
pip install -r requirements.txt
python manage.py migrate

# Iniciar servidor de desarrollo
python manage.py runserver

# 4. Frontend (React + Vite)
cd src/frontend

# Instalar y arrancar interfaz
npm install
npm run dev

```

### ⚡ Instalación con Docker (Recomendado para producción)

```bash
# 1. Clonar el repositorio
git clone https://github.com/badolgm/sigcTiArural.git
cd sigcTiArural

# 2. Configurar variables de entorno
## Copiamos el ejemplo para crear nuestro archivo real
cp .env.example .env
# Editar .env con tus configuraciones (opcional para desarrollo local)

# 3. Levantar todos los servicios
## El flag --build asegura que se construyan las imágenes con los últimos cambios
docker-compose up -d --build

# 4. Verificar que los contenedores estén corriendo
docker-compose ps

# Salida esperada:
# NAME                IMAGE                    STATUS
# sigct_backend       sigctiArural-backend     Up
# sigct_db            postgres:15-alpine       Up
# sigct_frontend      sigctiArural-frontend    Up
# sigct_ai_service    sigctiArural-ai_service  Up

# 5. CONFIGURACIÓN INICIAL DE BASE DE DATOS (Solo la primera vez)
# Importante: Los contenedores deben estar en estado "Up"

Una vez que los contenedores estén corriendo, es necesario preparar la estructura de la base de datos (Migraciones) y, opcionalmente, crear un superusuario para el panel de administración.

# A. Construir las tablas en PostgreSQL (Migraciones):
docker exec -it sigct_backend python manage.py migrate

## Crear usuario administrador para el panel de Django (Opcional):
docker exec -it sigct_backend python manage.py createsuperuser

## Nota: Estos pasos solo se ejecutan cuando clonas el proyecto por primera vez o si borras los volúmenes de Docker.

```
### 🌐 Acceder a la Aplicación

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Interfaz de usuario principal |
| **Backend API** | http://localhost:8000 | API RESTful (Django) |
| **API Docs** | http://localhost:8000/api/docs/ | Documentación interactiva |
| **AI Service** | http://localhost:8081 | Servicio de IA (FastAPI) |
| **Admin Django** | http://localhost:8000/admin/ | Panel de administración |

> 🔐 **Usuario Admin por Defecto:** Ejecuta `docker-compose exec backend python manage.py createsuperuser` para crear un usuario administrador.

### 🔧 Detener y Limpiar Servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ BORRA LA BASE DE DATOS)
docker-compose down -v

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
```

---

### 💻 Instalación Local (Desarrollo Sin Docker)

Esta opción es más larga que el Desarrollo Híbrido (Modo Rápido) , también es  ideal para **desarrollo activo** donde necesitas hacer cambios frecuentes en el código.

#### 📦 Paso 1: Backend (Django)

```bash
# Navegar al directorio del backend
cd src/backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows (Git Bash):
source venv/Scripts/activate
# En Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

# Configurar base de datos local (PostgreSQL debe estar instalado)
# Opción 1: Usar PostgreSQL local
createdb sigct_db
# Opción 2: Usar el contenedor de Docker solo para la BD
# Encender el motor (Docker)
docker-compose up -d db

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de BD local

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor de desarrollo (Puerto 8000)
python manage.py runserver
```

```bash
# En otra terminal, probar la API
curl http://localhost:8000/api/health/
# Salida esperada: {"status": "ok", "database": "connected"}
```

#### ⚛️ Paso 2: Frontend (React + Vite)

```bash
# En una NUEVA terminal, navegar al directorio del frontend
cd src/frontend

# Instalar dependencias de Node.js
npm install

# Configurar variables de entorno
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Iniciar servidor de desarrollo (Puerto 5173)
npm run dev
```
---
**Verificación:**
- Abre tu navegador en `http://localhost:5173`
- Deberías ver el Dashboard principal con las 12 categorías de laboratorios

---

#### 🤖 Paso 3: Servicio de IA (FastAPI) - Opcional

```bash
# En una NUEVA terminal, navegar al directorio de IA
cd src/ai_models

# Crear entorno virtual independiente
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows

# Instalar dependencias (⚠️ Esto puede tardar varios minutos por TensorFlow)
pip install -r requirements.txt

# Configurar variables de entorno
export DATABASE_URL="postgresql://user:password@localhost:5432/sigct_db"

# Ejecutar servidor FastAPI (Puerto 8081)
uvicorn fastapi_app:app --host 0.0.0.0 --port 8081 --reload
```

**Verificación:**
```bash
curl http://localhost:8081/health
# Salida esperada: {"status": "ready", "model": "loaded"}
```

---

#### 🎯 Resumen de Puertos en Modo Local

| Servicio | Puerto | Comando | Estado Requerido |
|----------|--------|---------|------------------|
| **Backend Django** | 8000 | `python manage.py runserver` | ✅ Obligatorio |
| **Frontend React** | 5173 | `npm run dev` | ✅ Obligatorio |
| **AI Service** | 8081 | `uvicorn fastapi_app:app --reload` | 🟡 Opcional |
| **PostgreSQL** | 5432 | `docker-compose up -d db` | ✅ Obligatorio |

> 💡 **Consejo:** Usa **terminales separadas** para cada servicio o herramientas como `tmux` (Linux/Mac) o Windows Terminal con pestañas.

---

### 🐛 Solución de Problemas Comunes

<details>
<summary><b>❌ Error: "Port 8000 already in use"</b></summary>

```bash
# Identificar el proceso usando el puerto
# En Linux/Mac:
lsof -i :8000
# En Windows:
netstat -ano | findstr :8000

# Matar el proceso (reemplaza PID con el número del proceso)
kill -9 PID  # Linux/Mac
taskkill /PID PID /F  # Windows
```

</details>

<details>
<summary><b>❌ Error: "ModuleNotFoundError: No module named 'django'"</b></summary>

Esto significa que el entorno virtual no está activado o las dependencias no se instalaron correctamente.

```bash
# Verifica que el entorno virtual esté activado (deberías ver (venv) en tu terminal)
source venv/bin/activate  # Linux/Mac
source venv/Scripts/activate  # Windows Git Bash

# Reinstala las dependencias
pip install -r requirements.txt
```

</details>

<details>
<summary><b>❌ Error: "Connection refused" en PostgreSQL</b></summary>

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps db

# Si no está corriendo, iniciarlo
docker-compose up -d db

# Verificar la conexión
docker exec -it sigct_db psql -U user -d sigct_db -c "SELECT 1;"
```

</details>

<details>
<summary><b>❌ Frontend muestra pantalla blanca</b></summary>

```bash
# Limpiar caché de Node.js y reinstalar
cd src/frontend
rm -rf node_modules package-lock.json
npm install

# Limpiar caché de Vite
rm -rf .vite

# Reiniciar servidor
npm run dev
```

</details>

---

<a name="-estructura-del-proyecto"></a>
## 🧱 Estructura del Proyecto

```
sigcTiArural/
│
├── 📄 README.md                          # Este archivo
├── 📄 LICENSE                            # Licencia MIT
├── 📄 docker-compose.yml                 # Orquestación de contenedores
├── 📄 schema_postgresql.sql              # Schema de base de datos
├── 📄 .gitignore                         # Archivos ignorados por Git
├── 📄 .env.example                       # Plantilla de variables de entorno
│
├── 📁 docs/                              # Documentación técnica
│   ├── 📄 MASTERDOC.md                   # Documento maestro de arquitectura
│   ├── 📄 PLAN_MAESTRO.md                # Cronograma y fases del proyecto
│   ├── 📁 diagrams/                      # Diagramas de arquitectura
│   │   ├── 🖼️ banner.svg                 # Banner del proyecto
│   │   ├── 🖼️ architecture_c4.svg        # Diagrama C4
│   │   └── 🖼️ database_erd.svg           # Diagrama Entidad-Relación
│   └── 📁 reports/                       # Reportes técnicos (local only)
│
├── 📁 src/                               # Código fuente
│   │
│   ├── 📁 backend/                       # Backend Django
│   │   ├── 📁 api/                       # Aplicación de API REST
│   │   │   ├── 📁 logic/                 # ⬢ ARQUITECTURA HEXAGONAL (Core)
│   │   │   │   ├── 📁 domain/            # Lógica de Negocio (Python Puro)
│   │   │   │   ├── 📁 ports/             # Interfaces y Contratos
│   │   │   │   └── 📁 adapters/          # Implementaciones (Django ORM, AI, Notificaciones)
│   │   │   ├── 📄 models.py              # Modelos de BD (Legacy/Persistence)
│   │   │   ├── 📄 serializers.py         # Serializadores DRF
│   │   │   ├── 📄 views.py               # Vistas de API (V1 y V2 Hexagonal)
│   │   │   └── 📄 urls.py                # Rutas de API
│   │   ├── 📁 sigct_backend/             # Configuración del proyecto
│   │   └── 📄 manage.py                  # CLI de Django
│   │
│   ├── 📁 frontend/                      # Frontend React
│   │   ├── 📁 src/                       # Código fuente React
│   │   │   ├── 📁 components/            # Componentes reutilizables
│   │   │   ├── 📁 pages/                 # Páginas de la aplicación (Dashboard, Labs, etc.)
│   │   │   ├── 📁 labs/                  # Módulos de laboratorios especializados
│   │   │   ├── 📁 data/                  # Datos estáticos (lab-data.js)
│   │   │   ├── 📁 hooks/                 # Custom React Hooks
│   │   │   └── 📄 App.jsx                # Router y raíz
│   │   └── 📄 vite.config.js             # Configuración de Vite
│   │
│   ├── 📁 ai_models/                     # Microservicio de IA (FastAPI)
│   │   ├── 📁 production_models/         # Modelos entrenados (.h5, .keras)
│   │   ├── 📁 notebooks/                 # Entrenamiento y experimentación
│   │   ├── 📄 fastapi_app.py             # API de Inferencia y Voz
│   │   └── 📄 conversation_context.py    # Memoria contextual
│   │
│   └── 📁 embedded/                      # Edge Computing (BeagleBone Black)
│       ├── 📁 bbb_01_gateway/            # Gateway MQTT y Sincronización
│       ├── 📁 bbb_02_ia_edge/            # Inferencia local TFLite
│       └── 📁 bbb_03_sensors/            # Adquisición de datos y cámara
│
├── 📁 scripts/                           # Automatización y Simulación
│   ├── 📄 physics_sim.py                 # Simulador de drones y telemetría
│   └── 📄 generate-diagrams.mjs          # Generación de documentación visual
│
└── 📁 docs/                              # Documentación Maestra
    ├── 📄 MASTERDOC.md                   # DAS y Arquitectura
    ├── 📄 PLAN_MAESTRO.md                # Roadmap v7.0
    └── 📄 INFORME_ANALISIS_Y_PLAN_DE_ACCION.md # Bitácora de reingeniería
```

> 📝 **Nota:** Las carpetas `data/`, `backups/`, `venv/` y `node_modules/` están excluidas del control de versiones mediante `.gitignore`.

---

<a name="-estado-del-proyecto-y-roadmap"></a>
## 📅 Estado del Proyecto y Roadmap

### 🎯 Estado Actual (Enero 2026)

<table>
<tr>
<td width="50%">

#### ✅ Completado
- [x] Arquitectura C4 completa
- [x] Backend Django con API RESTful
- [x] Frontend React responsive
- [x] Migración a PostgreSQL 15
- [x] Modelo de IA (92.5% accuracy)
- [x] Conversión a TensorFlow Lite
- [x] Sistema de autenticación JWT
- [x] Dashboard con visualización 3D
- [x] Integración Docker Compose
- [x] Asistente de voz conversacional
- [x] Documentación técnica completa

</td>
<td width="50%">

#### 🟡 En Progreso
- [ ] Integración física con BeagleBone Black
- [ ] Sistema de alertas en tiempo real
- [ ] Biblioteca educativa completa
- [ ] Panel de administración avanzado
- [ ] Tests unitarios y de integración
- [ ] Monitoreo con Prometheus/Grafana

#### 🔴 Planificado
- [ ] Integración con SofiaPlus (SENA)
- [ ] App móvil nativa (React Native)
- [ ] CI/CD con GitHub Actions
- [ ] Kubernetes para producción

</td>
</tr>
</table>

---

### 🗓️ Roadmap 2026

```mermaid
%%{init: {'theme':'dark', 'gantt': {'fontSize': '14px'}}}%%
gantt
    title SIGC&T Rural - Roadmap 2026
    dateFormat YYYY-MM-DD
    section Infraestructura
    Migración PostgreSQL       :done, infra1, 2026-01-16, 3d
    Optimización Docker        :done, infra2, 2026-01-20, 2d
    Cluster BeagleBone        :active, infra3, 2026-01-25, 15d
    
    section Inteligencia Artificial
    Modelo Plantas (Cloud)     :done, ia1, 2025-12-10, 21d
    Conversión TFLite         :done, ia2, 2025-12-28, 4d
    Asistente de Voz          :done, ia3, 2026-01-22, 2d
    Integración LLM           :active, ia4, 2026-01-26, 10d
    
    section Frontend
    Dashboard Principal        :done, fe1, 2025-11-15, 10d
    Laboratorios 3D           :done, fe2, 2026-01-24, 1d
    Sistema de Alertas        :active, fe3, 2026-01-27, 7d
    Biblioteca Educativa      :milestone, fe4, 2026-02-10, 0d
    
    section Backend
    API RESTful               :done, be1, 2025-11-20, 5d
    WebSockets                :active, be2, 2026-01-25, 5d
    Sistema de Backup         :active, be3, 2026-01-28, 3d
    
    section Producción
    Tests Unitarios           :milestone, prod1, 2026-02-15, 0d
    CI/CD GitHub Actions      :milestone, prod2, 2026-03-01, 0d
    Despliegue Producción     :milestone, prod3, 2026-04-01, 0d
```

---

<a name="-contribuciones"></a>
## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Este es un proyecto **open source** con fines educativos y de impacto social.

### 📝 Cómo Contribuir

1. **Fork** el proyecto
2. Crea una **rama** para tu feature (`git checkout -b feature/amazing-feature`)
3. **Commit** tus cambios (`git commit -m 'feat: add amazing feature'`)
4. **Push** a la rama (`git push origin feature/amazing-feature`)
5. Abre un **Pull Request**

### 🎨 Estándares de Código

- **Python:** Seguir PEP 8, usar `black` para formateo
- **JavaScript/React:** Seguir Airbnb Style Guide, usar ESLint
- **Commits:** Usar Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **Documentación:** Actualizar MASTERDOC.md si cambias arquitectura

### 🐛 Reportar Bugs

Usa el [Issue Tracker](https://github.com/badolgm/sigcTiArural/issues) de GitHub. Incluye:
- Descripción detallada del problema
- Pasos para reproducir
- Screenshots (si aplica)
- Logs de error
- Sistema operativo y versión

---

<a name="-contexto-académico-sena"></a>
## 🎓 Contexto Académico SENA

Este proyecto es el **Proyecto Productivo** del programa **Tecnología en Análisis y Desarrollo de Software (ADSO)** del **SENA** (Servicio Nacional de Aprendizaje de Colombia).

### 🏫 Información del Programa

- **Institución:** SENA - Regional Antioquia
- **Centro:** Centro de Logística y Promoción Ecoturística del MAgdalena
- **Programa:** Tecnología en Análisis y Desarrollo de Software (ADSO)
- **Ficha:** 3070388
- **Duración:** 24 meses (2024-2026)
- **Instructor Líder:** Ing. Carlos Alberto Estuwe Roldan

### 🎯 Competencias Desarrolladas

| Código | Competencia | Estado |
|--------|-------------|--------|
| 220501046 | Construir el sistema según el diseño establecido | ✅ Completado |
| 220501013 | Implementar la estructura de la BD | ✅ Completado |
| 220501014 | Desarrollar software con programación orientada a objetos | ✅ Completado |
| 220501032 | Aplicar buenas prácticas de calidad | 🟡 En Progreso |
| 220501048 | Integrar sistemas siguiendo estándares de interoperabilidad | 🟡 En Progreso |

---

<a name="-impacto-social-ods"></a>
## 🌍 Impacto Social (ODS)

SIGC&T Rural contribuye a los **Objetivos de Desarrollo Sostenible** de la ONU:

<table>
<tr>
<td width="25%" align="center">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Sustainable_Development_Goal_2.png/150px-Sustainable_Development_Goal_2.png" width="100px" alt="ODS 2">
<br><b>ODS 2: Hambre Cero</b>
<br><small>Optimización productiva mediante diagnóstico temprano de enfermedades</small>
</td>
<td width="25%" align="center">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Sustainable_Development_Goal_4.png/150px-Sustainable_Development_Goal_4.png" width="100px" alt="ODS 4">
<br><b>ODS 4: Educación de Calidad</b>
<br><small>Acceso abierto a formación técnica avanzada</small>
</td>
<td width="25%" align="center">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Sustainable_Development_Goal_9.png/150px-Sustainable_Development_Goal_9.png" width="100px" alt="ODS 9">
<br><b>ODS 9: Industria e Innovación</b>
<br><small>Infraestructura tecnológica en contextos rurales</small>
</td>
<td width="25%" align="center">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Sustainable_Development_Goal_17.png/150px-Sustainable_Development_Goal_17.png" width="100px" alt="ODS 17">
<br><b>ODS 17: Alianzas</b>
<br><small>Articulación academia–agricultura–tecnología</small>
</td>
</tr>
</table>

---

<a name="-licencia"></a>
## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License** - consulta el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2026 Bernardo Adolfo Gómez Montoya

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
```

---

<a name="-autor"></a>
## 👤 Autor

<div align="center">

### **Bernardo Adolfo Gómez Montoya**

<img src="https://github.com/badolgm.png" width="150px" style="border-radius: 50%;" alt="Bernardo Gómez">

**Tecnólogo en Análisis y Desarrollo de Software**  
**SENA - Medellín, Colombia**

[![Email](https://img.shields.io/badge/Email-badolfogm%40gmail.com-red?style=for-the-badge&logo=gmail&logoColor=white)](mailto:badolfogm@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-badolgm-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/badolgm)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/bernardo-gomez)

</div>

---

<div align="center">

### 🌟 Si este proyecto te resulta útil, considera darle una ⭐ en GitHub

**Hecho con ❤️ en Colombia. Para la comunidad rural y educativa del mundo.**

[![GitHub stars](https://img.shields.io/github/stars/badolgm/sigcTiArural?style=social)](https://github.com/badolgm/sigcTiArural/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/badolgm/sigcTiArural?style=social)](https://github.com/badolgm/sigcTiArural/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/badolgm/sigcTiArural?style=social)](https://github.com/badolgm/sigcTiArural/watchers)

---

**SIGC&T Rural** © 2024-2026 | Proyecto Productivo SENA | Licencia MIT

</div>