# 🌾 SIGC&T Rural
### Sistema Integrado de Gestión en Ciencia y Tecnología Rural

<div align="center">

![SIGC&T Rural Banner](docs/diagrams/banner.svg)

[![Proyecto Productivo SENA](https://img.shields.io/badge/Proyecto%20Productivo-SENA-2e8b57?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyMmMxLjEgMCAyLS45IDItMlYxMmMwLTEuMS0uOS0yLTItMkg0Yy0xLjEgMC0yIC45LTIgMnY4YzAgMS4xLjkgMiAyIDJoOHoiLz48cGF0aCBkPSJNMjAgMTJjMC0xLjEtLjktMi0yLTJoLTR2NGg0YzEuMSAwIDItLjkgMi0yeiIvPjwvc3ZnPg==)](https://www.sena.edu.co/)
[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo%20Activo-00d4ff?style=for-the-badge&logo=StatusPage&logoColor=white)](https://github.com/badolgm/sigcTiArural)
[![Versión](https://img.shields.io/badge/Versión-7.0-7c3aed?style=for-the-badge&logo=semver&logoColor=white)](https://github.com/badolgm/sigcTiArural/releases)
[![Arquitectura](https://img.shields.io/badge/Arquitectura-En%20Transición%20V1→V3-ff6f00?style=for-the-badge&logo=hexo&logoColor=white)](docs/HEXAGONAL_REFACTOR_PLAN.md)
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

📚 [Documentación Completa (MASTERDOC)](docs/MASTERDOC.md) • 🧭 [Punto de Entrada del Proyecto (SYSTEM BOOT)](SIGCT_RURAL_SYSTEM_BOOT.md) • 🚀 [Plan Maestro](docs/PLAN_MAESTRO.md) • 🩺 [Runbook de Continuidad](docs/CONTINUITY_RUNBOOK.md) • 🐞 [Reportar Bug](https://github.com/badolgm/sigcTiArural/issues) • 💡 [Solicitar Mejora](https://github.com/badolgm/sigcTiArural/issues/new)

</div>

---

## 📑 Tabla de Contenidos

<details>
<summary><b>Haz clic para expandir el índice completo</b></summary>

### Secciones Principales
1. [🎯 Visión General del Proyecto](#-visión-general-del-proyecto)
2. [⚠️ Estado Operativo Actual](#-estado-operativo-actual)
3. [✨ Características Principales](#-características-principales)
4. [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
5. [🌐 EIARC — Evolución Arquitectónica](#-eiarc--evolución-arquitectónica)
6. [📊 Stack Tecnológico](#-stack-tecnológico)
7. [🗄️ Base de Datos (PostgreSQL)](#️-base-de-datos-postgresql)
8. [🤖 Inteligencia Artificial](#-inteligencia-artificial)
9. [🧩 Edge Computing](#-edge-computing)
10. [🔬 Laboratorios Técnicos](#-laboratorios-técnicos)
11. [🚀 Guía de Instalación Rápida](#-guía-de-instalación-rápida)
12. [🧱 Estructura del Proyecto](#-estructura-del-proyecto)
13. [📅 Estado del Proyecto y Roadmap](#-estado-del-proyecto-y-roadmap)
14. [🗺️ Mapa Documental](#️-mapa-documental)
15. [🤝 Contribuciones](#-contribuciones)
16. [🎓 Contexto Académico SENA](#-contexto-académico-sena)
17. [🏆 Entregables Académicos SENA](#-entregables-académicos-sena)
18. [🌍 Impacto Social (ODS)](#-impacto-social-ods)
19. [📄 Licencia](#-licencia)
20. [👤 Autor](#-autor)

</details>

---

<a name="-visión-general-del-proyecto"></a>
## 🎯 Visión General del Proyecto

**SIGC&T Rural** (Sistema Integrado de Gestión del Conocimiento y Tecnología Rural) es un **ecosistema autónomo y agnóstico en hardware y software**, de código abierto, que integra **sensores, robots, sistemas de inteligencia artificial y personas como nodos cooperantes**, orientados a observar, cuidar, aprender y actuar sobre **entornos vivos** de manera sostenible, resiliente y educativa.

### 🌟 Características Distintivas

<table>
<tr>
<td width="50%">

#### 🌐 Arquitectura Híbrida
Combina procesamiento en la nube (Cloud) con computación en el borde (Edge), permitiendo operación resiliente incluso con conectividad intermitente.

</td>
<td width="50%">

#### 🤖 IA en Evolución
- **Estado actual:** clasificación binaria (sano/enfermo) implementada
- **En diseño:** arquitectura multimodal V2 (ver [Inteligencia Artificial](#-inteligencia-artificial))

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
| **O-02** | Modelo de IA | Clasificación binaria de estado de planta (sano/enfermo) implementada; evolución a clasificación multiclase en planificación (ver [Agriculture AI V2](#-inteligencia-artificial)) | 🟡 En Progreso |
| **O-03** | Laboratorio Hardware | Clúster de 3 BeagleBone Black (arquitectura de referencia definida, integración física en progreso) | 🟡 En Progreso |
| **O-04** | Biblioteca Educativa | Repositorio de recursos curados | 🟡 En Progreso |
| **O-05** | Cumplimiento ADSO | Entregables de cierre generados (ver [Entregables Académicos SENA](#-entregables-académicos-sena)) | 🟡 En Progreso |

---

<a name="-estado-operativo-actual"></a>
## ⚠️ Estado Operativo Actual

Este proyecto está en desarrollo activo, con componentes en distintos niveles de madurez. Esta sección documenta el estado real y conocido — no aspiracional — para que cualquier persona que clone el repositorio sepa qué esperar.

> *Nota metodológica: los estados descritos a continuación se basan en inspección del código y en documentación de auditoría del propio proyecto; no se realizó una prueba de ejecución en vivo del sistema completo como parte de esta revisión.*

### ✅ Componentes con implementación verificable en el repositorio
- Dashboard IoT (React)
- Backend Django (API REST)
- Base de datos PostgreSQL (esquema y migraciones definidos)
- Telemetry Context — documentado y auditado como el contexto con mayor evidencia de implementación (ver [`TELEMETRY_DATABASE_DIAGNOSTIC.md`](docs/eiarc/02_ARCHITECTURE/TELEMETRY_DATABASE_DIAGNOSTIC.md))
- Laboratorios técnicos (Robótica, Matemáticas, Ciencia de Datos)

### 🔴 Incidente conocido: AI Service
El contenedor Docker local `ai_service` puede fallar al iniciar. La causa diagnosticada es una imagen local con archivos de dependencias Python corruptos (0 bytes), **no** un defecto en `fastapi_app.py`. Este incidente está acotado al microservicio de IA — no afecta Dashboard, Backend, Frontend ni Telemetry.

- Diagnóstico forense: [`AI_SERVICE_FORENSIC_AUDIT.md`](AI_SERVICE_FORENSIC_AUDIT.md)
- Causa raíz probable: [`AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`](AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md)
- Plan de recuperación: [`AI_SERVICE_RECOVERY_PLAN.md`](AI_SERVICE_RECOVERY_PLAN.md)

### 🟡 Componentes diseñados pero no implementados
- **Knowledge Hub** (portal documental local) — diseñado y documentado, pero no implementado actualmente. Ver [`KNOWLEDGE_HUB_ARCHITECTURE.md`](KNOWLEDGE_HUB_ARCHITECTURE.md).
- Integración física completa del clúster BeagleBone Black
- Sistema de alertas en tiempo real (WebSockets/Channels)

> Para el estado operativo detallado y ordenado por prioridad, consulta [`SIGCT_RURAL_SYSTEM_BOOT.md`](SIGCT_RURAL_SYSTEM_BOOT.md).

---

<a name="-características-principales"></a>
## ✨ Características Principales

<div align="center">

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#c2ba91','primaryTextColor':'#412402','primaryBorderColor':'#3f9999','lineColor':'#6e854349','secondaryColor':'#1887b3','tertiaryColor':'#9badcf'}}}%%
mindmap
  root((SIGCT-Rural<br/>🟢 Implementado · 🔷 Objetivo Oficial · ⚪ Especulativo))
    🟢 Laboratorios
      Motor Strategy/Factory reutilizable
      🟢 Agricultura
      🟢 Electrónica
      🟢 Robótica
      🟢 Telecomunicaciones
      🟢 Sistemas Embebidos
      🟢 Matemáticas Avanzadas
      🟢 Ciencia de Datos
    🔷 Academic and Research Community
      🔷 Cursos / Biblioteca Educativa
      🔷 Investigación
      🔷 Recursos Académicos / Documentación
    🟢🔷 AI Context
      🟢 Clasificador binario MobileNetV2
      🟢 Semantic Resolution Layer
      🔷 Pipeline multi-modal V2 imagen-audio-telemetria-series
      🔷 Recommendation Engine / Knowledge AI Layer
    🟢🔷 Telemetría e IoT
      🟢 Input Port backend PostgreSQL Dashboard
      🟢 BeagleBone Black referencia código vacío
      🔷 LoRaWAN ilustrativo
      ⚪ Fuente real hoy generador simulado
    🔷 Knowledge Hub
      🔷 Diseñado no implementado
      🔷 Puente con AI Context
      ⚪ Vectorización búsqueda semántica asistente
    🟢🔷 Contextos Productivos
      🟢 Agricultura Electrónica Robótica Telecom
      🔷 Ganadería Porcicultura Apicultura Piscicultura Invernaderos
      🔷 Investigación transversal
    🟢🔷 EIARC
      🟢 Gobernanza parcial implementada
      🔷 Expansión productiva Fase 9 sin avance
```

**Leyenda:** 🟢 Implementado en el repositorio · 🔷 Objetivo oficial (diseñado, aún no completamente implementado) · ⚪ Especulativo / ilustrativo

</div>

### 🔥 Funcionalidades Core

- 📈 **Dashboard IoT en Tiempo Real:** Visualización de telemetría de sensores
- 🧠 **Diagnóstico IA:** Clasificación binaria del estado de la planta (Cloud); evolución multiclase en diseño
- 🎓 **Biblioteca Educativa:** Cursos, videos y laboratorios interactivos
- 🔌 **Arquitectura Híbrida:** Lógica *store-and-forward* orientada a tolerancia a fallos de red
- 🔐 **Seguridad:** HTTPS + CORS configurado
- 📡 **Comunicaciones:** API REST (WebSockets planificados)
- 📱 **Diseño Responsivo:** Interfaz moderna con React + TailwindCSS (Mobile-First)

---

<a name="️-arquitectura-del-sistema"></a>
## 🏗️ Arquitectura del Sistema

> **Nota Técnica:** El entrenamiento de IA se realiza en Cloud/Local; las BeagleBone Black actúan como nodos Edge para adquisición, preprocesamiento e inferencia optimizada con TFLite (arquitectura de referencia — ver [Edge Computing](#-edge-computing)).

### 📐 Nivel 1: Vista de Contexto (C4 Model)

```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#7c3aed','fontSize':'16px'}}}%%
flowchart TB
    subgraph users["👥 Usuarios Principales"]
        A["🌾 Actores de Contextos Productivos<br/>(Agricultor/Técnico — multi-dominio)"]
        B["🎓 Estudiantes e Investigadores SENA"]
        C["🔧 Administrador"]
    end

    ROOT(("🌐 SIGCT-Rural<br/>Agnóstico en hardware y en dominio"))

    subgraph core["🏛️ Pilares de la Plataforma"]
        direction TB
        ARC["🔷 Academic &amp; Research Community<br/>Cursos · Biblioteca Educativa · Documentación"]
        PRODCTX["🟢🔷 Contextos Productivos<br/>Agricultura/Electrónica/Robótica/Telecom implementados<br/>Ganadería/Apicultura/Piscicultura/Invernaderos diseñados"]
        RESEARCH["🔷 Investigación<br/>dominio transversal, no un contexto más"]
        KHUB["🔷 Knowledge Hub<br/>diseñado, no implementado"]
        EIARC["🟢🔷 EIARC<br/>Gobernanza (parcial) + Expansión productiva (Fase 9)"]
    end

    subgraph external["🔗 Sistemas Externos Reales"]
        direction TB
        DATA["📊 Fuentes de datos de dominio<br/>(ej. PlantVillage/Kaggle — una entre varias)"]
        SENAX["🎓 SENA SofiaPlus<br/>(integración futura, no central)"]
        IOTX["📡 Hardware IoT vía Input Port<br/>(agnóstico, no BBB como identidad)"]
    end

    users --> ROOT
    ROOT --> core
    ROOT -.->|"consume/integra"| external

    style ROOT fill:#7c3aed,stroke:#a78bfa,stroke-width:3px
    style users fill:#1e293b,stroke:#8b5cf6,stroke-width:2px
    style core fill:#0f172a,stroke:#6366f1,stroke-width:2px
    style external fill:#0f172a,stroke:#10b981,stroke-width:2px
    style PRODCTX fill:#052e16,stroke:#4ade80
    style EIARC fill:#052e16,stroke:#4ade80
    style ARC fill:#1e3a8a,stroke:#60a5fa
    style RESEARCH fill:#1e3a8a,stroke:#60a5fa
    style KHUB fill:#1e3a8a,stroke:#60a5fa
```

### ⚙️ Nivel 3: Arquitectura Backend — Estado Real de Migración

El backend **no es un único estilo arquitectónico**: coexisten tres generaciones de API mientras avanza una migración progresiva hacia arquitectura hexagonal. La cobertura hexagonal real se estima en **~15–25%** (ver [`docs/HEXAGONAL_REFACTOR_PLAN.md`](docs/HEXAGONAL_REFACTOR_PLAN.md)).

```mermaid
flowchart TB
    Frontend["⚛️ React Frontend"] --> V1
    Frontend --> V2
    Frontend --> V3

    subgraph V1["🔴 V1 — Legacy"]
        V1views["api/views.py<br/>(vistas originales)"]
        V1models["api/models.py"]
    end

    subgraph V2["🟡 V2 — Strangler Fig"]
        V2logic["api/logic/<br/>(capa de transición)"]
    end

    subgraph V3["🟢 V3 — Hexagonal (núcleo objetivo)"]
        Domain["core/domain/<br/>entidades · servicios · estrategias"]
        Ports["core/ports/<br/>contratos"]
        Infra["infrastructure/<br/>adapters: Django ORM, IA, persistencia"]
        Domain --- Ports
        Ports -.-> Infra
    end

    V3 -.->|"migración progresiva"| V2
    V2 -.->|"migración progresiva"| V1

    style V1 fill:#450a0a,stroke:#f87171,stroke-width:2px
    style V2 fill:#451a03,stroke:#fbbf24,stroke-width:2px
    style V3 fill:#052e16,stroke:#4ade80,stroke-width:2px
```

> Las tres generaciones son código real y activo, no solo histórico. Para el plan de retiro progresivo de V1/V2, ver [`docs/HEXAGONAL_REFACTOR_PLAN.md`](docs/HEXAGONAL_REFACTOR_PLAN.md).

### 🔧 Nivel 2: Vista de Contenedores

```mermaid
%%{init: {'theme':'dark', 'flowchart': {'curve':'basis', 'subGraphTitleMargin': {'top': 12, 'bottom': 18}}}}%%
flowchart TB
    U["🌐 Usuario<br/>(Navegador Web)"]

    subgraph cloud["☁️ Cloud Infrastructure (Docker Compose)"]
        direction TB
        subgraph frontend["🎨 Frontend Layer"]
            FE["⚛️ React App<br/>Vite + TailwindCSS<br/>Puerto: 5173"]
        end

        subgraph backend["⚙️ Backend Layer"]
            API["🐍 Django API<br/>DRF<br/>Puerto: 8000"]
        end

        subgraph ai["🧠 AI Service Layer ⚠️"]
            AIS["🤖 TensorFlow Server<br/>FastAPI<br/>Puerto: 8081<br/>(incidente conocido, ver §2)"]
        end

        subgraph db["🗄️ Database Layer"]
            DB[("🐘 PostgreSQL 15<br/>Puerto: 5432")]
        end

        FE -->|"REST API<br/>/api/v1/"| API
        API -->|"SQL Queries<br/>ORM Django"| DB
        API -->|"HTTP POST<br/>Inferencia IA"| AIS
    end

    subgraph edge["🧪 Laboratorio Edge de Referencia<br/>(agnóstico en hardware — demostrador)"]
        GW["🔌 Nodo Gateway<br/>(ejemplo: BeagleBone Black)"]
        IA_EDGE["🧠 Nodo IA Edge<br/>Inferencia local TFLite<br/>(ejemplo: BeagleBone Black)"]
        IOT["📡 Nodo Adquisición de Señales<br/>Sensores intercambiables<br/>(ejemplo: BeagleBone Black)"]
    end

    U -->|"HTTPS:5173"| FE
    U -->|"HTTPS:8000"| API

    style cloud fill:#1e293b,stroke:#8b5cf6,stroke-width:2px
    style edge fill:#0f172a,stroke:#10b981,stroke-width:2px
    style ai fill:#7c2d12,stroke:#f97316
```

> 📖 **Diagramas Completos:** Consulta [MASTERDOC.md](docs/MASTERDOC.md) para vistas ampliadas de Componentes, Despliegue y Diagramas Entidad-Relación (ERD).

---

<a name="-eiarc--evolución-arquitectónica"></a>
## 🌐 EIARC — Evolución Arquitectónica

SIGC&T Rural evoluciona dentro de una línea arquitectónica más amplia llamada **EIARC**. El nombre se usa en la documentación del proyecto con **dos significados distintos** que deben leerse por separado:

### A) EIARC como marco arquitectónico y de gobernanza *(vigente, parcialmente implementado)*

Documentado en [`docs/eiarc/`](docs/eiarc/). Define:
- Contratos semánticos de IA — la resolución binaria `prediction_code` / `health_state` está implementada en [`semantic_prediction_resolver.py`](src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py)
- Contextos delimitados: `Telemetry`, `AI`, `Labs`, `Knowledge`, `Identity`, `IoT`, `Deployment`
- Reglas de gobernanza documental y de precedencia entre fuentes

Según la autoevaluación documentada en [`SIGCT_RURAL_SYSTEM_BOOT.md`](SIGCT_RURAL_SYSTEM_BOOT.md), la madurez relativa por contexto es: **Telemetry** (más avanzado) > **AI** (con incidente activo) > **Knowledge** (fuerte en documentación, sin implementar) > **Labs** (heterogéneo) > **Identity / IoT / Deployment** (incompletos frente a la visión objetivo). Esta clasificación es una autoevaluación del propio proyecto, no una medición externa independiente.

→ Entrada: [`docs/eiarc/01_FOUNDATION/EIARC_VISION.md`](docs/eiarc/01_FOUNDATION/EIARC_VISION.md)

### B) EIARC como visión futura de expansión productiva *(planificada — Fase 9, sin fecha de cierre)*

Documentada principalmente en [`docs/PLAN_MAESTRO.md`](docs/PLAN_MAESTRO.md) (Fase 9). Contempla futuras líneas de dominio más allá de agricultura, usando la misma nomenclatura que el plan maestro:
- Apicultura
- Piscicultura
- Ganadería/Avicultura
- Invernaderos

Esta fase es explícitamente posterior al cierre de las Fases 7–8 del refactor hexagonal actual y **no tiene fecha de inicio definida** (0% de avance registrado).

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
- **WebSockets:** Django Channels (planificado)
- **ASGI Server:** Daphne
- **CORS:** django-cors-headers
- **DB Connector:** psycopg2-binary
- **Env Config:** python-dotenv

</td>
<td width="33%" valign="top">

### 🧠 Inteligencia Artificial
- **Framework:** TensorFlow 2.15+
- **Edge Inference:** TensorFlow Lite
- **API Service:** FastAPI + Uvicorn
- **Modelo actual:** MobileNetV2 (binario)
- **Datasets:** PlantVillage (Kaggle)
- **Audio:** Pydub, SpeechRecognition, gTTS
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

> **Diagrama pendiente de validación contra modelos y migraciones reales.**
>
> El diagrama entidad-relación anterior fue retirado porque no coincidía de forma verificable con `src/backend/api/models.py`. No se genera un ERD alternativo hasta validarlo directamente contra los modelos y migraciones activos.

### 🔑 Características de la Base de Datos

- **Integridad Referencial:** Claves foráneas con `ON DELETE CASCADE`
- **Índices:** Búsquedas por `timestamp`, `robot_id`
- **Tipos Avanzados:** Campos `JSONField` para parámetros de comandos de robot
- **Migraciones Versionadas:** Django Migrations para control de cambios (ver nota de Telemetry Context sobre aplicación de migraciones)
- Se documentan scripts de respaldo con `pg_dump` (programación/automatización no verificada en esta revisión)

> 📖 **Fuente de verdad del esquema:** `src/backend/api/migrations/` y `src/backend/api/models.py`. El archivo `schema_postgresql.sql` en la raíz se conserva como **referencia histórica**, pero no debe tratarse como fuente única del esquema actual (ver [`SIGCT_RURAL_SYSTEM_BOOT.md`](SIGCT_RURAL_SYSTEM_BOOT.md)).

---

<a name="-inteligencia-artificial"></a>
## 🤖 Inteligencia Artificial

La IA de SIGC&T Rural se documenta en tres niveles distintos, que **no deben confundirse entre sí**: lo que está implementado hoy, la arquitectura objetivo conceptual, y un plan de ejecución concreto todavía sin entrenar.

### 8.1 Estado Actual de IA *(implementado en el repositorio)*

- **Modelo:** `plant_disease_mbv2.h5` — MobileNetV2, clasificación **binaria**
- **Clases:** `enferma` / `sana` (no diagnostica enfermedades específicas)
- **Servicio:** implementado (código verificado en `src/ai_models/fastapi_app.py`); sujeto al incidente descrito en [Estado Operativo Actual](#-estado-operativo-actual)
- **Asistente de voz conversacional:** reconocimiento de voz (SpeechRecognition), memoria contextual de sesión, síntesis por voz con **gTTS** (Google Text-to-Speech — requiere conexión a internet, no es síntesis local), consulta datos de telemetría en PostgreSQL (sujeto a que las migraciones de la tabla de sensores estén aplicadas — ver Telemetry Context en §2)

> 📖 **Notebooks de Entrenamiento:** Disponibles en `src/ai_models/notebooks/`

### 8.2 AI Context V2 *(arquitectura objetivo — conceptual, no implementada)*

Diseño de una plataforma de IA multimodal en ocho bloques coordinados (Agriculture, Animal Health, Telemetry, Feature Engineering, Computer Vision, Time Series, Recommendation Engine, Knowledge AI). **Este es un diseño arquitectónico: no implica cambios de código, entrenamiento de modelos ni descarga de datasets.**

→ Ver [`docs/ai/research_v2/AI_CONTEXT_V2_ARCHITECTURE.md`](docs/ai/research_v2/AI_CONTEXT_V2_ARCHITECTURE.md)

### 8.3 Agriculture AI V2 *(plan concreto de evolución — no entrenado, no desplegado)*

Plan de ejecución para un baseline multiclase de agricultura (tomate, papa, maíz): 16 clases sobre un subconjunto auditado de 21,160 imágenes RGB (PlantVillage), con `EfficientNet-B0` como arquitectura candidata y benchmark contra `MobileNetV3-Large`, `ResNet50` y `ConvNeXt-Tiny`, usando `macro-F1` como métrica principal. **Explícitamente sin entrenar y sin pipelines implementados.**

→ Ver [`docs/ai/research_v2/AGRICULTURE_AI_V2_EXECUTION_PLAN.md`](docs/ai/research_v2/AGRICULTURE_AI_V2_EXECUTION_PLAN.md)

### 8.4 AI Research Program V2 *(programa rector de I+D — diseño, no implementación)*

`docs/ai/research_v2/` reúne el programa completo de investigación aplicada de IA para SIGC&T Rural V2: arquitectura multimodal, estrategia y auditoría de datasets, gobierno científico/MLOps, validación de predicción, corrección científica y el plan de entrenamiento — incluyendo la línea Agriculture AI V2 de las secciones 8.2 y 8.3 como su primera línea de ejecución. **Este programa no entrena, no implementa código y no descarga datasets: solo diseña la hoja de ruta científica.** Está pensado para converger con EIARC a medida que cada línea madure, pero hoy es un track de I+D independiente y paralelo a `docs/eiarc/`.

→ Punto de entrada: [`docs/ai/research_v2/SIGCT_RURAL_AI_RESEARCH_PROGRAM_V2.md`](docs/ai/research_v2/SIGCT_RURAL_AI_RESEARCH_PROGRAM_V2.md)

---

<a name="-edge-computing"></a>
## 🧩 Edge Computing

> **Estado:** arquitectura de referencia de laboratorio. Las direcciones IP y roles descritos a continuación corresponden a la configuración objetivo, no a un despliegue productivo activo — la integración física completa está marcada 🟡 En Progreso (ver [Roadmap](#-estado-del-proyecto-y-roadmap)).

### 🔌 Arquitectura de Referencia del Clúster BeagleBone Black

```mermaid
%%{init: {'theme':'dark', 'flowchart': {'curve':'basis'}}}%%
flowchart LR
    subgraph cluster["🏭 Laboratorio Edge (Referencia — 192.168.1.0/24)"]
        BBB1["🔌 BBB-01 Gateway<br/>IP: 192.168.1.10<br/>Roles:<br/>- Broker MQTT<br/>- Sync Cloud"]
        BBB2["🧠 BBB-02 IA Edge<br/>IP: 192.168.1.11<br/>Roles:<br/>- Inferencia TFLite<br/>- API Flask"]
        BBB3["📡 BBB-03 Sensores<br/>IP: 192.168.1.12<br/>Roles:<br/>- Adquisición Datos<br/>- Cámara USB"]

        BBB3 -->|"MQTT: readings/*"| BBB1
        BBB3 -->|"POST /predict"| BBB2
        BBB2 -->|"MQTT: diagnosis/*"| BBB1
    end

    BBB1 -->|"HTTPS POST<br/>/api/v1/readings/"| CLOUD["☁️ Cloud Backend<br/>(Django API)"]

    style cluster fill:#0f172a,stroke:#10b981,stroke-width:2px
```

### 🛠️ Funcionalidades Edge (Diseño de Referencia)

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

> ⚠️ **Antes de empezar:** el contenedor `ai_service` tiene un incidente conocido en el entorno Docker local actual (ver [Estado Operativo Actual](#-estado-operativo-actual)). El resto de la plataforma (backend, frontend, base de datos) no se ve afectado — puedes continuar la instalación con normalidad.

---

### 💻 Instalación Local (Desarrollo Híbrido - Modo Rápido)

```bash
# Esta opción es ideal para desarrollo activo. Usamos Docker para las bases de datos (estabilidad) y la terminal local para el código (velocidad).

# 1. Levantar solo las Bases de Datos
docker-compose up -d db db-mysql

# 2. Configurar el "Puente" (.env local)
# En tu archivo src/backend/.env, ajusta el host:
# Cambia: DB_HOST=db ➔ DB_HOST=localhost
# Mantén: DB_PORT=5432

# 3. Backend (Django)
cd src/backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 4. Frontend (React + Vite)
cd src/frontend
npm install
npm run dev
```

### ⚡ Instalación con Docker (Recomendado para producción)

```bash
# 1. Clonar el repositorio
git clone https://github.com/badolgm/sigcTiArural.git
cd sigcTiArural

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Levantar todos los servicios
docker-compose up -d --build

# 4. Verificar que los contenedores estén corriendo
docker-compose ps
# Nota: ai_service puede fallar al iniciar por el incidente conocido — ver §2 y AI_SERVICE_RECOVERY_PLAN.md

# 5. CONFIGURACIÓN INICIAL DE BASE DE DATOS (Solo la primera vez)
docker exec -it sigct_backend python manage.py migrate
docker exec -it sigct_backend python manage.py createsuperuser
```

### 🌐 Acceder a la Aplicación

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Interfaz de usuario principal |
| **Backend API** | http://localhost:8000 | API RESTful (Django) |
| **API Docs** | http://localhost:8000/api/docs/ | Documentación interactiva |
| **AI Service** | http://localhost:8081 | Servicio de IA (⚠️ ver incidente conocido) |
| **Admin Django** | http://localhost:8000/admin/ | Panel de administración |

### 🔧 Detener y Limpiar Servicios

```bash
docker-compose down
docker-compose down -v   # ⚠️ BORRA LA BASE DE DATOS
docker-compose logs -f
docker-compose logs -f backend
```

---

### 💻 Instalación Local (Desarrollo Sin Docker)

#### 📦 Paso 1: Backend (Django)

```bash
cd src/backend
python -m venv venv
source venv/bin/activate       # Linux/Mac
source venv/Scripts/activate   # Windows (Git Bash)
pip install --upgrade pip
pip install -r requirements.txt
createdb sigct_db
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

```bash
curl http://localhost:8000/api/health/
# Salida esperada: {"status": "ok", "database": "connected"}
```

#### ⚛️ Paso 2: Frontend (React + Vite)

```bash
cd src/frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

#### 🤖 Paso 3: Servicio de IA (FastAPI) — Opcional, sujeto al incidente conocido

```bash
cd src/ai_models
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://user:password@localhost:5432/sigct_db"
uvicorn fastapi_app:app --host 0.0.0.0 --port 8081 --reload
```

```bash
curl http://localhost:8081/health
```

### 🐛 Solución de Problemas Comunes

<details>
<summary><b>❌ Error: "Port 8000 already in use"</b></summary>

```bash
lsof -i :8000                    # Linux/Mac
netstat -ano | findstr :8000     # Windows
kill -9 PID                      # Linux/Mac
taskkill /PID PID /F              # Windows
```
</details>

<details>
<summary><b>❌ Error: "ModuleNotFoundError: No module named 'django'"</b></summary>

```bash
source venv/bin/activate
pip install -r requirements.txt
```
</details>

<details>
<summary><b>❌ AI Service no inicia / falla el contenedor</b></summary>

Este es el incidente conocido descrito en [Estado Operativo Actual](#-estado-operativo-actual). Consulta [`AI_SERVICE_RECOVERY_PLAN.md`](AI_SERVICE_RECOVERY_PLAN.md) antes de intentar rebuilds manuales repetidos.
</details>

<details>
<summary><b>❌ Frontend muestra pantalla blanca</b></summary>

```bash
cd src/frontend
rm -rf node_modules package-lock.json
npm install
rm -rf .vite
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
├── 📄 LICENSE
├── 📄 docker-compose.yml
├── 📄 schema_postgresql.sql              # Referencia histórica (ver §7)
├── 📄 .env.example
├── 📄 SIGCT_RURAL_SYSTEM_BOOT.md         # Punto de entrada documental (ver §14)
├── 📁 [40+ documentos de auditoría/arquitectura en raíz] → ver Mapa Documental (§14)
│
├── 📁 docs/
│   ├── 📄 MASTERDOC.md                   # Documento maestro de arquitectura
│   ├── 📄 PLAN_MAESTRO.md                # Roadmap y fases del proyecto
│   ├── 📄 HEXAGONAL_REFACTOR_PLAN.md     # Plan técnico de migración V1→V3
│   ├── 📁 eiarc/                         # Marco arquitectónico EIARC
│   │   ├── 01_FOUNDATION/
│   │   ├── 02_ARCHITECTURE/
│   │   └── 03_DIAGRAMS/
│   ├── 📁 architect_master/              # Auditoría de arquitectura (01-08)
│   ├── 📁 project_knowledge_base/        # Registro de auditoría KB-001..006
│   ├── 📁 sena_artifacts/                # Entregables de cierre ADSO (ver §17)
│   ├── 📁 ai/manifests/                  # Manifiestos YAML dataset/entrenamiento
│   ├── 📁 diagrams/ · uml/ · database/ · edge/
│   └── 📁 reports/
│
├── 📁 src/
│   ├── 📁 backend/                       # Backend Django
│   │   ├── 📁 api/                       # V1 (models/views legacy) + V2 (api/logic/)
│   │   ├── 📁 core/                      # V3 — Núcleo Hexagonal
│   │   │   ├── domain/                   # Entidades, servicios, estrategias
│   │   │   ├── application/
│   │   │   └── ports/                    # Contratos
│   │   ├── 📁 infrastructure/            # Adapters: Django ORM, IA, persistencia
│   │   ├── 📁 interfaces/web/
│   │   └── 📄 manage.py
│   │
│   ├── 📁 frontend/                      # Frontend React
│   │   └── src/{components,pages,labs,data,hooks,services,stores}
│   │
│   ├── 📁 ai_models/                     # Microservicio de IA (FastAPI)
│   │   ├── 📁 production_models/         # Modelo binario actual (.h5)
│   │   ├── 📁 notebooks/
│   │   └── 📄 fastapi_app.py
│   │
│   └── 📁 embedded/                      # Edge Computing (BeagleBone Black)
│       ├── bbb_01_gateway/
│       ├── bbb_02_ia_edge/
│       └── bbb_03_sensors/
│
└── 📁 scripts/                           # Automatización y simulación
```

> 📝 **Nota:** Las carpetas `data/`, `venv/` y `node_modules/` están excluidas del control de versiones mediante `.gitignore`. El repositorio contiene más de 40 documentos de auditoría/arquitectura en la raíz — no se listan individualmente aquí; ver [Mapa Documental](#️-mapa-documental).

---

<a name="-estado-del-proyecto-y-roadmap"></a>
## 📅 Estado del Proyecto y Roadmap

> Reemplaza el roadmap por fechas fijas anterior por un resumen de estado — más confiable dado el ritmo real de avance del proyecto.

### ✅ Implementado

- Arquitectura C4 documentada
- Backend Django con API RESTful (V1/V2 implementados)
- Núcleo hexagonal V3 real (`core/domain`, `core/ports`, `infrastructure/`) — cobertura parcial
- Frontend React responsive
- PostgreSQL 15 como motor de base de datos (aplicación de migraciones sujeta a verificación por entorno — ver Telemetry Context)
- Clasificación binaria de IA (sano/enfermo) implementada (sujeta al incidente del AI Service, ver §2)
- Asistente de voz conversacional
- Dashboard con visualización 3D
- Integración Docker Compose
- Telemetry Context documentado y auditado como el contexto más maduro del proyecto
- Baseline arquitectónico EIARC definido
- Artefactos de cierre académico SENA materializados

### 🟡 En Progreso

- Recuperación del AI Service (incidente conocido, ver §2)
- Migración hexagonal completa (fases 0–8, ver `HEXAGONAL_REFACTOR_PLAN.md`)
- Implementación controlada del Knowledge Hub (diseño cerrado, código pendiente)
- Integración física del clúster BeagleBone Black
- Sistema de alertas en tiempo real (WebSockets)
- Consolidación completa de los 7 contextos EIARC en código

### 🔵 Próximos Pasos

1. Ejecutar recuperación del AI Service siguiendo `AI_SERVICE_RECOVERY_PLAN.md`
2. Iniciar implementación del Knowledge Hub (Fase 0 de `KNOWLEDGE_HUB_MIGRATION_PLAN.md`)
3. Continuar fases 0–8 del refactor hexagonal antes de abordar EIARC como expansión productiva
4. Ejecutar el baseline de entrenamiento de Agriculture AI V2 (aún no iniciado)

> Estado detallado y priorizado: [`SIGCT_RURAL_SYSTEM_BOOT.md`](SIGCT_RURAL_SYSTEM_BOOT.md) §§7–13.

---

<a name="️-mapa-documental"></a>
## 🗺️ Mapa Documental

> 🧭 **Punto de entrada principal para orientación completa del proyecto — humanos e IA:** [`SIGCT_RURAL_SYSTEM_BOOT.md`](SIGCT_RURAL_SYSTEM_BOOT.md)

Este README es un documento de entrada público, **no** un reemplazo de la documentación técnica extensa del proyecto. La documentación está organizada en niveles:

| Nivel | Contenido | Ubicación |
|---|---|---|
| 1. Arranque y auditoría maestra | Continuidad, recuperación, inventario global | Raíz del proyecto, `SIGCT_RURAL_SYSTEM_BOOT.md` |
| 2. Documentación base del producto | Arquitectura, despliegue, API | `docs/MASTERDOC.md`, `docs/PLAN_MAESTRO.md`, `docs/API_REFERENCE.md`, `docs/DEPLOYMENT.md` |
| 2.1 Documentación operativa — refactorización hexagonal | Backlog técnico detallado, estructura objetivo de contextos, guía de reanudación | [`docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md`](docs/ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md) |
| 3. Base formal de conocimiento | Hallazgos de auditoría y decisiones consolidadas | `docs/project_knowledge_base/` (KB-001 a KB-006) |
| 4. Línea arquitectónica EIARC | Visión, contextos, modelo de datos, blueprint | `docs/eiarc/` |
| 5. Cierre académico SENA | Entregables finales ADSO | `docs/sena_artifacts/` |
| 6. Respaldo, archivo y retención | Manifiestos de backup, política de retención | `PROJECT_ARCHIVE_MANIFEST.md`, `DOCUMENT_RETENTION_POLICY.md` |
| 7. Documentación histórica | Bitácoras secundarias de sesiones de trabajo, no canónicas (ver regla de precedencia en `SIGCT_RURAL_SYSTEM_BOOT.md` §18.9); incluye auditorías TRAE y README Reality Check ya absorbidas por `docs/project_knowledge_base/` | `docs/historical/` (`INFORME_ANALISIS_Y_PLAN_DE_ACCION.md`, `TRAE_INDEPENDENT_REPOSITORY_AUDIT.md`, `TRAE_AI_INTEGRATION_AUDIT.md`, `README_REALITY_CHECK.md`) |
| 8. Programa de I+D — IA V2 | Arquitectura multimodal, estrategia de datasets, MLOps, línea Agriculture AI V2 (planificado, converge con EIARC) | [`docs/ai/research_v2/SIGCT_RURAL_AI_RESEARCH_PROGRAM_V2.md`](docs/ai/research_v2/SIGCT_RURAL_AI_RESEARCH_PROGRAM_V2.md) |

Si tu objetivo es entender el estado real del proyecto en profundidad —o continuar el trabajo como colaborador o como IA sin contexto previo— empieza siempre por `SIGCT_RURAL_SYSTEM_BOOT.md`; ese documento define el orden de lectura obligatorio y la fuente de verdad vigente por categoría.

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
- **Documentación:** Actualizar `MASTERDOC.md` si cambias arquitectura

> 🧭 Si tu contribución afecta la arquitectura o la documentación técnica del proyecto, consulta primero [`docs/eiarc/`](docs/eiarc/) y [`SIGCT_RURAL_SYSTEM_BOOT.md`](SIGCT_RURAL_SYSTEM_BOOT.md) antes de proponer cambios estructurales.

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

> ℹ️ **Información institucional pendiente de validación independiente.** Los siguientes datos provienen únicamente del README original del proyecto; no se encontró corroboración adicional en otros documentos del repositorio.

### 🏫 Información del Programa

- **Institución:** SENA - Regional Antioquia
- **Centro:** Centro de Logística y Promoción Ecoturística del Magdalena
- **Programa:** Tecnología en Análisis y Desarrollo de Software (ADSO)
- **Ficha:** 3070388 *(pendiente de validación independiente)*
- **Duración:** 24 meses (2024-2026)
- **Instructor Líder:** Ing. Carlos Alberto Estuwe Roldan *(pendiente de validación independiente)*

### 🎯 Competencias Desarrolladas

| Código | Competencia | Estado |
|--------|-------------|--------|
| 220501046 | Construir el sistema según el diseño establecido | ✅ Completado |
| 220501013 | Implementar la estructura de la BD | ✅ Completado |
| 220501014 | Desarrollar software con programación orientada a objetos | ✅ Completado |
| 220501032 | Aplicar buenas prácticas de calidad | 🟡 En Progreso |
| 220501048 | Integrar sistemas siguiendo estándares de interoperabilidad | 🟡 En Progreso |

---

<a name="-entregables-académicos-sena"></a>
## 🏆 Entregables Académicos SENA

Los artefactos de cierre formal del Proyecto Productivo ADSO están consolidados en [`docs/sena_artifacts/`](docs/sena_artifacts/):

| Documento | Contenido |
|---|---|
| [`PROYECTO_FORMATIVO_FINAL.md`](docs/sena_artifacts/PROYECTO_FORMATIVO_FINAL.md) | Documento formativo final del proyecto |
| [`EVIDENCIAS_ADSO_MASTER.md`](docs/sena_artifacts/EVIDENCIAS_ADSO_MASTER.md) | Registro maestro de evidencias ADSO |
| [`PRESENTACION_SUSTENTACION.md`](docs/sena_artifacts/PRESENTACION_SUSTENTACION.md) | Material de sustentación |
| [`DEPLOYMENT_FINAL.md`](docs/sena_artifacts/DEPLOYMENT_FINAL.md) | Estado final de despliegue |
| [`API_DELIVERY_PACKAGE.md`](docs/sena_artifacts/API_DELIVERY_PACKAGE.md) | Paquete de entrega de API |

> Estado de preparación para graduación: [`SENA_GRADUATION_READINESS_AUDIT.md`](SENA_GRADUATION_READINESS_AUDIT.md)

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
