# 📘 MASTERDOC v6.0 - SIGC&T RURAL
## Documento Maestro de Arquitectura de Software

**Sistema Integrado de Gestión del Conocimiento y Tecnología Rural**

---

## 📋 Información del Documento

| Campo | Valor |
|-------|-------|
| **Versión** | 6.0 (Completa y Consolidada) |
| **Fecha Creación** | 24 de Enero 2026 |
| **Última Actualización** | 24 de Enero 2026 |
| **Autor Principal** | Bernardo Adolfo Gómez Montoya |
| **Institución** | SENA - Tecnología en ADSO |
| **Estado** | Documento Vivo - Actualización Continua |
| **Clasificación** | Técnico - Académico - Open Source |
| **Licencia** | MIT License |

---

## 📑 TABLA DE CONTENIDOS MAESTRA

### VOLUMEN I: FUNDAMENTOS Y CONTEXTO

#### PARTE 1: VISIÓN GENERAL DEL PROYECTO
1. [Introducción al Proyecto](#1-introduccion)
2. [Historia y Evolución Cronológica](#2-historia-cronologica)
3. [Visión, Misión y Objetivos](#3-vision-mision)
4. [Impacto Social y ODS](#4-impacto-social)
5. [Actores y Roles del Sistema](#5-actores-roles)

#### PARTE 2: ARQUITECTURA DE SOFTWARE
6. [Modelo C4 - Vistas de Arquitectura](#6-arquitectura-c4)
7. [Stack Tecnológico Completo](#7-stack-tecnologico)
8. [Patrones y Decisiones Arquitectónicas](#8-decisiones-arquitectonicas)

### VOLUMEN II: IMPLEMENTACIÓN TÉCNICA

#### PARTE 3: BASE DE DATOS
9. [Migración MySQL → PostgreSQL](#9-migracion-postgresql)
10. [Schema de PostgreSQL Completo](#10-schema-postgresql)
11. [Modelo de Datos Detallado](#11-modelo-datos)

#### PARTE 4: INFRAESTRUCTURA DOCKER
12. [Arquitectura Docker Compose](#12-docker-compose)
13. [Configuración de Contenedores](#13-contenedores)
14. [Troubleshooting Docker](#14-troubleshooting-docker)
15. [Compactación WSL2 (VHDX)](#15-compactacion-wsl2)

#### PARTE 5: INTELIGENCIA ARTIFICIAL
16. [IA de Voz Conversacional](#16-ia-voz)
17. [Modelo de Clasificación de Plantas](#17-modelo-plantas)
18. [Edge Computing con TFLite](#18-edge-computing)

### VOLUMEN III: DESARROLLO Y EVOLUCIÓN

#### PARTE 6: LABORATORIOS TÉCNICOS
19. [Laboratorio de Robótica](#19-laboratorio-robotica)
20. [Laboratorio de Matemáticas Avanzadas](#20-laboratorio-matematicas)
21. [Laboratorio de Ciencia de Datos](#21-laboratorio-datos)

#### PARTE 7: BITÁCORA DE INTERVENCIONES
22. [Timeline Completo (16-24 Enero 2026)](#22-timeline-completo)
23. [Comandos Ejecutados Detallados](#23-comandos-detallados)
24. [Lecciones Aprendidas](#24-lecciones-aprendidas)

#### PARTE 8: GESTIÓN DEL PROYECTO
25. [Estrategia de Ramas Git](#25-estrategia-ramas)
26. [Plan de Merge y Consolidación](#26-plan-merge)
27. [Roadmap Futuro (2026)](#27-roadmap-2026)

### APÉNDICES
A. [Glosario Técnico](#apendice-a)
B. [Comandos de Referencia Rápida](#apendice-b)
C. [Enlaces y Referencias](#apendice-c)
D. [Configuraciones Completas](#apendice-d)

---

<a name="1-introduccion"></a>
## 1. INTRODUCCIÓN AL PROYECTO

### 1.1 ¿Qué es SIGC&T Rural?

**SIGC&T Rural** (Sistema Integrado de Gestión del Conocimiento y Tecnología Rural) es una **plataforma web híbrida Cloud/Edge** de código abierto que integra **Internet de las Cosas (IoT)**, **Inteligencia Artificial** y **educación técnica** para impulsar la agricultura sostenible y la inclusión tecnológica en zonas rurales de Colombia.

#### Características Distintivas

- 🌐 **Arquitectura Híbrida**: Combina procesamiento en la nube (Cloud) con computación en el borde (Edge)
- 🤖 **IA Dual**: Inferencia en servidor (TensorFlow) y en dispositivos embebidos (TensorFlow Lite)
- 📚 **Educación Abierta**: Laboratorios virtuales y recursos técnicos gratuitos
- 🔬 **Enfoque Científico**: Integración de robótica, matemáticas avanzadas y ciencia de datos
- 🌾 **Impacto Social**: Alineado con los ODS de la ONU

### 1.2 Contexto Académico

Este proyecto nace como **Proyecto Productivo** del programa **Tecnología en Análisis y Desarrollo de Software (ADSO)** del **SENA** (Servicio Nacional de Aprendizaje de Colombia).

#### Objetivos Académicos

| ID | Objetivo | Descripción | Estado |
|----|----------|-------------|--------|
| **O-01** | Dashboard Centralizado | Visualización web de datos de sensores en tiempo real | ✅ Completado |
| **O-02** | Modelo de IA | Clasificación de enfermedades de plantas (>85% accuracy) | ✅ Completado |
| **O-03** | Laboratorio Hardware | Clúster de 3 BeagleBone Black operacional | 🟡 En Progreso |
| **O-04** | Biblioteca Educativa | Repositorio de 20+ recursos curados | 🟡 En Progreso |
| **O-05** | Cumplimiento ADSO | Entregables completos del Proyecto Productivo | 🟡 En Progreso |

### 1.3 Alcance del Proyecto

#### ✅ Dentro del Alcance

**Cloud (Plataforma Web):**
- Frontend React responsive (mobile-first)
- Backend Django con API RESTful
- Base de datos PostgreSQL 15
- Sistema de autenticación JWT
- Dashboard con gráficos en tiempo real
- Sistema de alertas
- Módulo de IA (inferencia cloud)
- CRUD de contenido académico

**Edge (Laboratorio Físico):**
- Clúster 3x BeagleBone Black Rev C
- Broker MQTT (Mosquitto)
- Sensores IoT (DHT22, humedad de suelo)
- Captura de imágenes (cámara USB)
- Inferencia local con TensorFlow Lite
- Sincronización cloud automática
- Lógica "store-and-forward"

**Inteligencia Artificial:**
- Modelo CNN para clasificación de enfermedades
- Dataset PlantVillage (tomate, papa)
- Transfer Learning con MobileNetV2
- Modelos .h5 (cloud) y .tflite (edge)
- IA de voz conversacional con memoria contextual

**Laboratorios Técnicos:**
- Robótica (Integración con Webots/Hardware)
- Matemáticas Avanzadas (Dr. Binary v2)
- Ciencia de Datos (Plotly.js, Pyodide)
- Telecomunicaciones (GNU Radio, SDR)

#### ❌ Fuera del Alcance

- Creación de hardware personalizado (PCBs propios)
- Aplicación móvil nativa (iOS/Android) - solo web responsive
- Integración directa con SofiaPlus del SENA (fase futura)
- Comercialización del producto
- Procesamiento de pagos / e-commerce
- Soporte 24/7 en producción
- Despliegue en dispositivos FPGA (referencia futura)

---

<a name="2-historia-cronologica"></a>
## 2. HISTORIA Y EVOLUCIÓN CRONOLÓGICA

### 2.1 Línea de Tiempo General

```
2025-11-02 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2026-01-24

   NOV        DIC        ENE-16    ENE-18    ENE-22    ENE-23    ENE-24
    │          │           │         │         │         │         │
    ▼          ▼           ▼         ▼         ▼         ▼         ▼
  Fase 1     Fase 2     Migr.    Rescate    IA Voz   Robótica  Docs
  (Arq.)   (Protot.)    MySQL    Docker    Intelig.  Integr.   Final
```

### 2.2 Fase 1: Fundamentos y Arquitectura (02-15 Nov 2025)

**Objetivo**: Definir y validar la arquitectura completa del sistema.

#### Hitos Principales
- ✅ Análisis de requisitos SENA
- ✅ Definición de stack tecnológico
- ✅ Desarrollo de MASTERDOC v4.2 (DAS)
- ✅ Diagramas Mermaid (Contexto, Contenedores, Despliegue)
- ✅ Diccionario de Datos completo
- ✅ Aprobación de arquitectura

**Duración**: 2 semanas  
**Estado**: ✅ 100% Completado

### 2.3 Fase 2: Prototipo "Hola Mundo" (12-25 Nov 2025)

**Objetivo**: Validar comunicación Backend ↔ Frontend ↔ Edge.

#### Hitos Principales
- ✅ Backend Django inicializado
- ✅ Frontend React con Vite + TailwindCSS
- ✅ Endpoint `/api/health/` funcional
- ✅ Configuración BeagleBone Black (Debian 11)
- ✅ Red local estática configurada

**Duración**: 2 semanas  
**Estado**: ✅ 100% Completado

### 2.4 Fase 3: Flujo de Datos Edge-to-Cloud (26 Nov - 09 Dic 2025)

**Objetivo**: Pipeline completo Sensor → BBB → Cloud → Dashboard.

#### Hitos Principales
- ✅ Implementación MQTT (Mosquitto en BBB-01)
- ✅ Script `sensor_reader.py` (BBB-03)
- ✅ Endpoint POST `/api/v1/readings/`
- ✅ Dashboard con gráficos en tiempo real
- ✅ WebSockets (parcial)

**Duración**: 2 semanas  
**Estado**: ✅ 100% Completado

### 2.5 Fase 4: Integración de IA (10-31 Dic 2025)

**Objetivo**: Implementar clasificación de enfermedades (Cloud + Edge).

#### Hitos Principales
- ✅ Dataset PlantVillage descargado
- ✅ Notebook EDA y entrenamiento
- ✅ Modelo MobileNetV2 entrenado (92.5% accuracy)
- ✅ Conversión a TensorFlow Lite
- ✅ API Cloud `/api/ia/classify/`
- ✅ API Edge `tflite_api.py` (BBB-02)

**Duración**: 3 semanas  
**Estado**: ✅ 100% Completado

---

### 2.6 ENERO 2026 - MES CRÍTICO DE CONSOLIDACIÓN

Este mes marca el punto de inflexión del proyecto, con múltiples intervenciones técnicas que transformaron la arquitectura y estabilizaron el sistema.

---

#### 📅 **16 de Enero 2026 | 10:30 AM**
**Sesión**: Corrección de Dependencias Backend  
**Responsable**: Bernardo Gómez + Gemini AI  
**Rama**: `rescue/ia-voz-completa`

##### Problema Identificado
```
ModuleNotFoundError: No module named 'dj_database_url'
```

##### Análisis
El archivo `settings.py` intentaba usar `dj_database_url` para configuración dinámica de base de datos, pero la librería no estaba instalada en el entorno virtual.

##### Solución Aplicada

**Paso 1**: Actualizar `src/backend/requirements.txt`

```diff
+# ======================================================
+# Base de Datos y Entorno
+# ======================================================
+dj-database-url  # Para leer config de BD desde URL
+psycopg2-binary  # Driver para PostgreSQL
+python-dotenv    # Para leer variables de entorno desde .env
```

**Paso 2**: Instalar dependencias

```bash
cd src/backend
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt
```

**Resultado**: ✅ Backend funcional, migraciones aplicadas correctamente

##### Lección Aprendida
> "La configuración dinámica de base de datos con `dj_database_url` es esencial para soportar múltiples entornos (local, Docker, producción) sin modificar código."

---

#### 📅 **17 de Enero 2026 | 16:00 PM**
**Sesión**: Análisis y Configuración Docker  
**Responsable**: Bernardo Gómez + Gemini AI  
**Rama**: `rescue/ia-voz-completa`

##### Problema Identificado
Error al construir contenedores Docker:
```
ERROR: Could not install packages due to an OSError: [Errno 5] Input/output error
target backend: failed to receive status: rpc error: code = Unavailable
```

##### Análisis Técnico

**Causa Raíz**: El archivo `src/backend/requirements.txt` contenía dependencias del servicio de IA (TensorFlow, FastAPI), provocando:
1. Instalación duplicada de librerías pesadas
2. Agotamiento de espacio en disco
3. Colapso del proceso de build

**Diagnóstico de Espacio**:
- Disco virtual Docker (ext4.vhdx): **19 GB consumidos** de 20 GB disponibles
- Contenedores huérfanos: **~5 GB**
- Capas de construcción obsoletas: **~3 GB**

##### Solución Aplicada

**Paso 1**: Limpieza de `requirements.txt`

```bash
# Eliminar TensorFlow y dependencias de IA del backend
# Mantener solo:
Django>=4.2
djangorestframework>=3.14
django-cors-headers>=4.4
dj-database-url
psycopg2-binary
python-dotenv
```

**Paso 2**: Reconstruir contenedores

```bash
docker-compose up -d --build
```

**Resultado**: ✅ Build exitoso, contenedores operativos

---

---

#### 📅 **18 de Enero 2026 | 09:00 AM**
**Sesión**: Auditoría Forense y Saneamiento de .gitignore  
**Responsable**: Bernardo Gómez + Gemini AI  
**Rama**: `rescue/ia-voz-completa`

##### Problema Identificado

```bash
$ git status
# Salida mostraba cientos de archivos no deseados:
# - node_modules/ (>15,000 archivos)
# - venv/ (>5,000 archivos)
# - __pycache__/ (múltiples carpetas)
# - backups/ (archivos binarios grandes)
# - _local_docs_backup/ (reportes HTML/PDF)
```

##### Análisis
Git estaba rastreando carpetas que nunca deberían estar en el repositorio, causando:
1. Commits lentos (>30 segundos)
2. Repo inflado (>500 MB)
3. Conflictos al hacer merge
4. Push fallidos por tamaño

##### Solución Aplicada

**Paso 1**: Crear `.gitignore` profesional

```bash
# Entornos virtuales Python
venv/
env/
*.pyc
__pycache__/

# Dependencias Node.js
node_modules/
package-lock.json

# Archivos locales
backups/
_local_docs_backup/
*.local
.env

# Archivos temporales
*.tmp
*.log
.DS_Store
```

**Paso 2**: Limpiar índice de Git

```bash
# IMPORTANTE: Este comando NO borra archivos físicos
# Solo los quita del seguimiento de Git
git rm -r --cached .

# Re-añadir archivos respetando el nuevo .gitignore
git add .

# Verificar
git status
```

**Paso 3**: Commit de saneamiento

```bash
git commit -m "infra: saneamiento de repositorio - actualizar .gitignore"
```

**Resultado**: 
- ✅ Repositorio reducido de 500 MB a 85 MB
- ✅ Git status limpio
- ✅ Solo archivos fuente rastreados

##### Lección Aprendida
> "Un `.gitignore` bien configurado desde el inicio ahorra horas de limpieza posterior. Las carpetas `node_modules/` y `venv/` NUNCA deben subirse a Git."

---

#### 📅 **18 de Enero 2026 | 13:45 PM**
**Sesión**: Rescate de Infraestructura - Compactación de Disco WSL2  
**Responsable**: Bernardo Gómez + Gemini AI  
**Rama**: `rescue/ia-voz-completa`  
**🔴 SESIÓN CRÍTICA**: Sistema al borde del colapso

##### Problema Identificado

**Error al construir contenedores Docker**:
```
ERROR: No space left on device
docker: Error response from daemon: write /var/lib/docker/...: no space left on device
```

**Diagnóstico de Espacio (Windows Host)**:
```powershell
# Espacio total en C:\
Total: 127 GB
Usado: 108 GB
Libre: 19 GB ❌ CRÍTICO

# Archivo problemático:
C:\Users\bagm2\AppData\Local\Docker\wsl\main\ext4.vhdx
Tamaño: 89.2 GB (de un máximo teórico de 256 GB)
```

##### Análisis Técnico

**¿Por qué el disco virtual WSL2 crece descontroladamente?**

WSL2 utiliza un **disco virtual dinámico** (`ext4.vhdx`) que:
1. ✅ **Crece automáticamente** cuando necesitas espacio
2. ❌ **NO se reduce automáticamente** cuando borras archivos dentro de WSL2
3. 🔴 **Conserva "aire"** (espacio marcado como usado pero vacío)

**Metáfora**: Es como un globo que se infla pero nunca se desinfla solo.

**Impacto**:
- Docker no podía crear nuevas capas para TensorFlow (620 MB)
- Builds fallando a mitad del proceso
- Sistema Windows lento por falta de espacio

##### Solución Aplicada - PARTE A: Limpieza de Docker

**Paso 1**: Eliminar contenedores huérfanos

```bash
# Detener todos los contenedores
docker-compose down

# Limpiar sistema Docker
docker system prune -f
```

**Salida esperada**:
```
Deleted Containers:
sigct_backend_old_1
sigct_frontend_old_1
...
Total reclaimed space: 4.2 GB
```

**Paso 2**: Eliminar capas de construcción obsoletas

```bash
docker builder prune -a -f
```

**Salida esperada**:
```
Deleted build cache:
layer-sha256:abc123...
layer-sha256:def456...
...
Total: 3.8 GB
```

**Resultado Parcial**: ✅ 8 GB liberados dentro de Docker

##### Solución Aplicada - PARTE B: Compactación Física del VHDX

Este es el proceso **crítico** que recupera el espacio real en Windows.

**⚠️ ADVERTENCIA IMPORTANTE**:
Este procedimiento requiere:
1. Cerrar completamente Docker Desktop
2. Apagar WSL2
3. Usar `diskpart` con privilegios de administrador
4. **NO interrumpir el proceso** (puede corromper el disco virtual)

**Paso 1**: Apagar todos los servicios

```bash
# En PowerShell (Administrador)

# Detener Docker Desktop (desde la GUI)
# Esperar a que el ícono desaparezca de la bandeja

# Apagar WSL2
wsl --shutdown

# Verificar que no haya procesos WSL activos
wsl --list --running
# Debe mostrar: "No hay distribuciones en ejecución"
```

**Paso 2**: Usar `diskpart` para compactar

```powershell
# Abrir diskpart
diskpart

# Dentro de diskpart, ejecutar estos comandos:
```

```diskpart
# 1. Seleccionar el disco virtual
select vdisk file="C:\Users\bagm2\AppData\Local\Docker\wsl\main\ext4.vhdx"

# Salida esperada:
# "El archivo de disco virtual se ha seleccionado correctamente."

# 2. Adjuntar en modo solo lectura (para seguridad)
attach vdisk readonly

# Salida esperada:
# "Se adjuntó correctamente el archivo de disco virtual."

# 3. Compactar el disco (ESTE ES EL COMANDO CLAVE)
compact vdisk

# Salida esperada:
# "  0 por ciento completado"
# " 10 por ciento completado"
# " 20 por ciento completado"
# ...
# "100 por ciento completado"
# "Se compactó correctamente el archivo de disco virtual."

# 4. Separar el disco
detach vdisk

# Salida esperada:
# "Se separó correctamente el archivo de disco virtual."

# 5. Salir de diskpart
exit
```

**Tiempo de Ejecución**: ~5-10 minutos (dependiendo del tamaño del VHDX)

**Resultado**:
```
Antes:  ext4.vhdx = 89.2 GB
Después: ext4.vhdx = 76.0 GB
Espacio recuperado: 13.2 GB ✅
```

**Paso 3**: Verificar en Windows

```powershell
# Verificar tamaño del archivo
Get-Item "C:\Users\bagm2\AppData\Local\Docker\wsl\main\ext4.vhdx" | Select-Object Length

# Verificar espacio libre en C:\
Get-PSDrive C
```

**Resultado Final**:
```
Disco C:\
Libre: 19 GB → 32.2 GB ✅ RESPIRO RECUPERADO
```

**Paso 4**: Reiniciar Docker Desktop

```powershell
# Iniciar Docker Desktop desde el menú de Windows
# Esperar a que inicie completamente

# Verificar que funciona
docker --version
docker-compose --version

# Levantar servicios
docker-compose up -d
```

##### Lección Aprendida
> **Comando de Mantenimiento Mensual**:
> ```powershell
> # 1. Apagar WSL2
> wsl --shutdown
> 
> # 2. Compactar (automatizado)
> diskpart
> select vdisk file="C:\Users\bagm2\AppData\Local\Docker\wsl\main\ext4.vhdx"
> attach vdisk readonly
> compact vdisk
> detach vdisk
> exit
> 
> # 3. Reiniciar Docker Desktop
> ```
> 
> "Este procedimiento debería ejecutarse mensualmente o cuando el espacio libre en C:\ sea menor a 20 GB."

---

#### 📅 **18 de Enero 2026 | 14:30 PM**
**Sesión**: Resolución de Conflictos de Red  
**Responsable**: Bernardo Gómez + Gemini AI  
**Rama**: `rescue/ia-voz-completa`

##### Problema Identificado

```bash
$ docker-compose up -d
Error: port 3306 is already allocated
```

##### Análisis
El puerto `3306` (MySQL estándar) estaba bloqueado por un servicio MySQL nativo instalado directamente en Windows.

**Verificación**:
```powershell
# Ver qué proceso usa el puerto 3306
netstat -ano | findstr :3306

# Salida:
# TCP  0.0.0.0:3306  0.0.0.0:0  LISTENING  4532
```

##### Solución Aplicada

**Opción Elegida**: Re-mapear puerto en Docker

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"  # PostgreSQL usa puerto estándar
```

**Nota**: En este punto aún se trabajaba con MySQL, que se cambió a PostgreSQL más tarde. El puerto se mapeó a `3307:3306` temporalmente.

**Resultado**: ✅ Contenedor de base de datos iniciado sin conflictos

---

#### 📅 **18 de Enero 2026 | 17:45 PM - 19:45 PM**
**Sesión**: Migración de MySQL a PostgreSQL  
**Responsable**: Bernardo Gómez + Gemini AI  
**Rama**: `rescue/ia-voz-completa`  
**🔴 DECISIÓN ARQUITECTÓNICA MAYOR**

##### Contexto de la Decisión

**¿Por qué migrar de MySQL a PostgreSQL?**

| Criterio | MySQL | PostgreSQL | Ganador |
|----------|-------|------------|---------|
| **Integridad Referencial** | Básica | Avanzada (DEFERRABLE) | 🟢 PostgreSQL |
| **Tipos de Datos** | Limitados | Extensos (JSONB, Arrays, UUID) | 🟢 PostgreSQL |
| **Compatibilidad Django** | Buena | Excelente | 🟢 PostgreSQL |
| **Ventanas y CTEs** | Limitadas | Completas | 🟢 PostgreSQL |
| **Texto Completo** | FULLTEXT | tsvector + GIN | 🟢 PostgreSQL |
| **Licencia** | GPL (dual) | PostgreSQL License (MIT-like) | 🟢 PostgreSQL |
| **Documentación** | Buena | Excelente | 🟢 PostgreSQL |

**Decisión**: ✅ Migrar a PostgreSQL 15

##### Problemas Encontrados Durante la Migración

**Problema 1**: Error de Timeout en TensorFlow

```
ERROR: ReadTimeoutError during installation of tensorflow==2.15.0
target ai_service: failed to build
```

**Causa**: Paquete TensorFlow pesa 620 MB. El timeout por defecto de `pip` (15s) era insuficiente.

**Solución**:
```dockerfile
# src/ai_models/Dockerfile
RUN pip install --default-timeout=1000 tensorflow>=2.15.0
```

**Problema 2**: Conflicto de dependencias `mysqlclient` en Backend

```
ERROR: Could not find mysqlclient for debian:bullseye
```

**Causa**: El `requirements.txt` aún tenía `mysqlclient` (driver de MySQL).

**Solución**:
```diff
# src/backend/requirements.txt
-mysqlclient      # Driver para MySQL
+psycopg2-binary  # Driver para PostgreSQL
```

##### Proceso de Migración (Paso a Paso)

**Paso 1**: Actualizar `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:15-alpine  # ← Cambio de mysql:8 a postgres:15
    container_name: sigct_db
    environment:
      POSTGRES_DB: sigct_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:  # ← Nuevo volumen
```

**Paso 2**: Actualizar `settings.py`

```python
# src/backend/sigct_backend/settings.py
import dj_database_url

# Lógica dual: Docker vs Local
database_url = os.environ.get('DATABASE_URL')

if database_url:
    # Caso A: Docker con PostgreSQL
    DATABASES = {
        'default': dj_database_url.config(
            default=database_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Caso B: Local
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'sigct_db'),
            'USER': os.environ.get('DB_USER', 'user'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'password'),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }
```

**Paso 3**: Reconstruir contenedores

```bash
# Detener todo
docker-compose down

# Eliminar volumen antiguo de MySQL (si existe)
docker volume rm sigctiArural_mysql_data

# Reconstruir con PostgreSQL
docker-compose up -d --build

# Esperar a que PostgreSQL inicie
docker-compose logs -f db
```

**Salida esperada**:
```
sigct_db  | LOG: database system is ready to accept connections
```

**Paso 4**: Aplicar migraciones

```bash
# Ejecutar migraciones dentro del contenedor
docker-compose exec backend python manage.py migrate

# Salida esperada:
# Running migrations:
#   Applying contenttypes.0001_initial... OK
#   Applying auth.0001_initial... OK
#   Applying admin.0001_initial... OK
#   ...
#   Applying api.0001_initial... OK
```

**Paso 5**: Verificar tablas creadas

```bash
docker exec -it sigct_db psql -U user -d sigct_db -c "\dt"
```

**Salida**:
```
                  List of relations
 Schema |            Name            | Type  | Owner
--------+----------------------------+-------+-------
 public | api_sensorreading          | table | user
 public | auth_group                 | table | user
 public | auth_permission            | table | user
 public | auth_user                  | table | user
 public | django_admin_log           | table | user
 public | django_content_type        | table | user
 public | django_migrations          | table | user
 public | django_session             | table | user
(11 rows)
```

**Resultado Final**: ✅ Migración exitosa a PostgreSQL 15

##### Estado del Sistema Post-Migración

```bash
$ docker-compose ps
NAME                IMAGE                    STATUS
sigct_ai_service    sigctiArural-ai_service  Up 2 hours
sigct_backend       sigctiArural-backend     Up 2 hours
sigct_db            postgres:15-alpine       Up 2 hours
sigct_frontend      sigctiArural-frontend    Up 2 hours
```

**Verificación de Funcionalidad**:
```bash
# Backend
curl http://localhost:8000/api/health/
# {"status": "ok", "database": "connected"}

# Frontend
# Navegador: http://localhost:5173
# ✅ Dashboard carga correctamente

# IA Service
curl http://localhost:8081/health
# {"status": "ready"}
```

##### Lección Aprendida
> "PostgreSQL no es solo 'otra base de datos'. Sus capacidades avanzadas (JSONB, Arrays, Ventanas) son esenciales para análisis de telemetría IoT y futuras features de IA contextual."

---


##  Diario de Trabajo - 2026-01-24

###  Integración y Despliegue de Laboratorios
**Objetivo**: Habilitar visualización de datos de robótica y asegurar persistencia en PostgreSQL.

#### Cambios Realizados
1. **Infraestructura Backend**:
   - Corrección crítica en settings.py: FORCE_SQLITE = False para habilitar PostgreSQL.
   - Diagnóstico y resolución de Connection refused en servicio backend (reinicio y verificación de secuencia de arranque).
   - Verificación de migraciones exitosas en contenedor db.

2. **Frontend React**:
   - Solución a error de compilación: Creación de archivo faltante src/data/lab-data.js.
   - Implementación de sistema de colores neón y categorías de laboratorio para LabCatalog.jsx.
   - Verificación de renderizado en RoboticsLab.jsx con fallback a datos simulados si la API falla.

3. **Verificación**:
   - Pila completa (Full Stack) desplegada y operativa.
   - Servicios accesibles: Frontend (5173), Backend (8000), DB (5432).

#### Próximos Pasos
- Validar flujo de datos real desde Webots a través del endpoint de telemetría.
- Refinar visualización de métricas en tiempo real.

---

#### 📅 **24 de Enero 2026 | 10:45 AM - INCIDENTE CRÍTICO**
**Sesión**: Recuperación de Integridad del Repositorio (.gitignore)
**Responsable**: Bernardo Gómez + Gemini AI
**Rama**: `feature/laboratorios-integracion-2026`

##### 🚨 Problema Crítico Identificado
Se detectó que la carpeta vital `src/frontend/src/data/` (que contiene `lab-data.js`) estaba siendo ignorada por Git de forma silenciosa. Esto causó que el dashboard perdiera las tarjetas de los laboratorios al desplegarse en otros entornos, ya que el archivo de datos no se subía.

**Causa Raíz**:
Una regla en `.gitignore` estaba mal formulada por exceso de celo:
```gitignore
# INCORRECTO:
data/
```
Esta regla es recursiva e ignora **cualquier** carpeta llamada "data" en todo el proyecto, bloqueando inadvertidamente la del frontend.

##### ✅ Solución Aplicada (Recuperación)
Se modificó la regla en `.gitignore` para usar una **ruta absoluta** ("anclada" a la raíz):

```gitignore
# CORRECTO:
/data/
```

**Resultado de la Intervención**:
1.  **Seguridad**: La carpeta pesada de datasets (`/data/` en la raíz) sigue protegida y no se sube.
2.  **Integridad**: La carpeta del frontend (`src/frontend/src/data/`) ahora es rastreada correctamente por Git.
3.  **Corrección**: Se restauró `lab-data.js` al control de versiones.

##### 💡 Lección Aprendida (Para Sección 24)
> "Al configurar `.gitignore`, siempre usar la barra inicial (`/carpeta/`) cuando se quiera ignorar algo solo en la raíz. Omitir la barra hace que la regla sea 'greedy' (codiciosa) y elimine carpetas homónimas en subdirectorios vitales."

#### 📅 **24 de Enero 2026 | 11:30 AM - INTEGRACIÓN ROBÓTICA 3D**
**Sesión**: Implementación de Gemelo Digital (Simulation-First)
**Responsable**: Bernardo Gómez + Gemini AI
**Rama**: `feature/laboratorios-integracion-2026`

##### Logros Técnicos
1. **Recuperación Total del Dashboard**: Se restauraron las 11 categorías de laboratorios y se corrigió el `.gitignore` para prevenir futuras pérdidas.
2. **Simulación Física (`scripts/physics_sim.py`)**: Se creó un generador de telemetría que simula un drone en trayectoria helicoidal, alimentando el backend con datos realistas (Batería, Posición X/Y/Z).
3. **Visualización 3D (Frontend)**: Se integró `Three.js` + `React Three Fiber` en `RoboticsLab.jsx`.
   - Renderizado en tiempo real de la posición del robot.
   - Traza de estela de movimiento.
   - HUD de telemetría.
4. **Despliegue Exitoso**: Contenedor frontend reconstruido con nuevas dependencias y comunicación verificada con Backend.

**Estado**: ✅ Sistema estable y funcional. Visualización 3D operativa.
📓 REGISTRO PARA LA BITÁCORA (INGENIERÍA)
Fecha: 27 de Enero 2026 Proyecto: sigcTiArural Fase: Integración de Laboratorios de Alta Fidelidad.

Análisis Técnico: Se define que la Dashbord de Electrónica debe ser el punto de entrada para el Gemelo Digital Rural.

Entrada: Parámetros físicos (sensores en campo/sliders).

Procesamiento Local: Simulación en tiempo real (Osciloscopio/Canvas).

Procesamiento de IA: Microservicio FastAPI (fastapi_app.py) analizando topología.

Salida/Escalado: Si el análisis requiere cálculo matemático como de potencia o transformada de Fourier compleja,etc,  se habilita el "Bridge" hacia las tarjetas especializadas o motores externos.

Comandos de Control:

Bash
# Sincronización de dependencias para el Hub
npm install zustand lucide-react reactflow

# Verificación de integridad del microservicio IA
curl -X GET http://localhost:8081/health

# Registro de Hito en Git
git commit -m "ARCH: Implementación de arquitectura de tránsito de datos para sigcTiArural"
🚀 PRÓXIMOS PASOS (PLAN DE ACCIÓN)
Unificación de la UI: Reconstruir el return de ElectronicsLab.jsx para que sea el marco maestro (Dashboard) donde las otras 11 tarjetas puedan "conectarse".

Lógica de "Bridge": Programar los botones de "Análisis Superior" para que codifiquen los datos actuales y los envíen a las APIs de matemáticas avanzadas o sitios de ingeniería libre.

Sincronización Masterdoc: Pegar este análisis en el documento para que el equipo (o yo en futuras sesiones) no pierda el contexto de sigcTiArural.

Registro para el MASTERDOC.md (Mantenimiento de sigcTiArural)
Incidencia: El archivo ext4.vhdx de Docker/WSL no reduce su tamaño tras el borrado de imágenes. Ruta detectada: ~/AppData/Local/Docker/wsl/main/ext4.vhdx. Procedimiento: Parada total de instancias WSL2 y ejecución de compact vdisk mediante la utilidad diskpart de Windows. Estado: Infraestructura recuperada para el desarrollo de la Dashboard de Ingeniería.

---

<a name="28-integracion-estado-federado"></a>
#### **28. BITÁCORA DE ACTUALIZACIÓN - INTEGRACIÓN ESTADO FEDERADO (27-28 Enero 2026)**

**Resumen Ejecutivo:**
Se ha completado la transición hacia la **Arquitectura v3.0 (Estado Federado)**, unificando los laboratorios de Electrónica y Matemáticas bajo un sistema de estado global compartido. Se ha resuelto la inestabilidad del frontend (pantalla blanca) y se ha desplegado la primera versión del **Editor de Esquemas de Circuitos**.

**1. Arquitectura "Estado Federado" e Implementación del Bridge**
*   **Concepto:** Se abandonó el modelo de componentes aislados. Ahora, `useLabStore` (Zustand) actúa como la "Constitución" central que sincroniza los datos entre laboratorios.
*   **Mecanismo "Bridge":** 
    *   **Origen:** El usuario configura parámetros o diseña circuitos en el *Laboratorio de Electrónica*.
    *   **Transmisión:** Al pulsar el botón "Lab Matemático", los datos (señales, netlists) se "empaquetan" y envían al Store Global.
    *   **Destino:** El *Laboratorio de Matemáticas* detecta la llegada de datos y activa automáticamente sus paneles de análisis.
*   **Código Clave:**
    ```javascript
    // Sincronización automática en ElectronicsLab
    useEffect(() => {
        setElectronicsSignal({ params: { vinAmp, vinFreq }, signals: { ... } });
    }, [vinAmp, vinFreq]);
    ```

**2. Nuevo Dashboard de Electrónica (`ElectronicsLab.jsx`)**
*   **Estructura Unificada:** Se consolidaron `CircuitCanvas`, `PythonSimPanel` y los nuevos controles en una sola interfaz responsiva (Grid 12 columnas).
*   **Modo Dual:** Se implementó un toggle para cambiar entre:
    *   **📊 SIMULACIÓN:** Visualización en tiempo real con controles deslizantes.
    *   **✏️ DISEÑO (BETA):** Nuevo lienzo interactivo para dibujar diagramas esquemáticos.
*   **Componentes de UI:** Botones de navegación "Bridge" con retroalimentación visual (neón/pulso) para indicar flujo de datos activo.

**3. Implementación del Editor de Esquemas (`SchematicEditor.jsx`)**
*   **Tecnología:** Integración de la librería `reactflow` para manejo de nodos y aristas.
*   **Biblioteca de Componentes:**
    *   Pasivos: Resistencias, Capacitores, Bobinas (Inductores).
    *   Activos: Transistores, Diodos, Fuentes (AC/DC).
    *   Instrumentación: Osciloscopios.
*   **Funcionalidad:** Drag-and-drop (simulado), conexión de nodos, visualización de valores.

**4. Resolución de Incidencias Críticas**
*   **Pantalla Blanca en `/lab-electronics`:**
    *   *Causa:* Conflicto de dependencias (`reactflow` vs React 19) y errores silenciosos en el renderizado.
    *   *Solución:* Instalación de `reactflow` con `--legacy-peer-deps` y encapsulamiento de rutas en `<ErrorBoundary>`.
*   **Contenedores Zombie:**
    *   *Causa:* Contenedor `sigct_frontend` antiguo bloqueando el puerto y sirviendo archivos cacheados.
    *   *Solución:* `docker stop/rm` y limpieza de procesos Node huérfanos.
*   **Rutas de Navegación:** Corrección del mapeo en `App.jsx` para dirigir `/lab-electronics` y `/advanced-math-v2` correctamente.

**5. Procedimiento de Mantenimiento de Espacio en Disco (Docker/WSL)**
Para liberar espacio consumido por el disco virtual de Docker (`ext4.vhdx`), ejecutar periódicamente:

1.  **Limpieza Rápida (Desde Terminal):**
    ```bash
    docker system prune -f
    ```
2.  **Compactación Profunda (Requiere PowerShell Administrador):**
    *   Cerrar Docker Desktop y WSL:
        ```powershell
        wsl --shutdown
        ```
    *   Ejecutar Diskpart:
        ```powershell
        diskpart
        # Dentro de diskpart:
        select vdisk file="C:\Users\bagm2\AppData\Local\Docker\wsl\data\ext4.vhdx"
        compact vdisk
        exit
        ```
    *   Reiniciar Docker Desktop.

**Próximos Pasos Inmediatos:**
*   Generación de Netlist SPICE desde el Editor de Esquemas.
*   Integración de `ngspice` (vía Pyodide) para simular los circuitos dibujados.

## 29. Actualización v3.1: Motor de Simulación y Análisis de Circuitos (2026-01-28)

**1. Motor de Simulación (Python/Pyodide)**
*   Implementación de un solver de circuitos en Python puro (`circuit_solver.py` integrado en JS) que ejecuta análisis transitorios usando el método de **Newton-Raphson**.
*   Soporte para componentes lineales (R, L, C, Fuentes) y no lineales (Diodos, Transistores BJT).
*   **Modelo Ebers-Moll**: Simulación realista de transistores NPN con parámetros configurables (Beta, Is, Vt).

**2. Visualización y Métricas**
*   **Osciloscopio Digital**: Gráficas interactivas de voltaje vs. tiempo para múltiples nodos.
*   **Métricas de Ingeniería**: Cálculo automático de Vmax, Vmin, Vpp, Vrms, Frecuencia y THD (Distorsión Armónica Total).
*   **Tabla de Resultados**: Visualización dinámica de datos en el panel inferior, con soporte para copiar a portapapeles.

## 30. Actualización v3.2: Integración de Laboratorios y Análisis Espectral (2026-01-28)

**1. Bridge (Puente) de Datos Global**
*   Uso de `Zustand` para compartir el estado de la simulación (`electronicsData`) entre el Laboratorio de Electrónica y el de Matemáticas Avanzadas.
*   Persistencia de datos: El diseño del circuito y los resultados de simulación sobreviven a la navegación entre pestañas.

**2. Análisis Espectral (FFT)**
*   Implementación de Transformada Rápida de Fourier (FFT) en el motor de simulación.
*   Visualización del espectro de frecuencia (Magnitud vs. Frecuencia) en el panel de resultados.
*   Cálculo de THD basado en los armónicos detectados.

**3. Laboratorio de Matemáticas Avanzadas (`AdvancedMathLabV2`)**
*   Nueva pestaña dedicada al análisis matemático profundo de señales provenientes de electrónica.
*   Herramientas de visualización: Retrato de Fase (V vs dV/dt) y Análisis de Señal Real.

## 31. Actualización v3.3: Mejoras de Usabilidad en Diagramación (2026-01-28)

**1. Herramientas de Edición Geométrica**
*   **Rotación de Componentes**: Implementación de rotación de 90° para cualquier componente seleccionado (botón "Rotar").
*   **Espejo/Reflexión**: Nueva función "Espejo" para invertir componentes horizontalmente (útil para transistores y configuración de circuitos complejos).
*   **Manejo de Conexiones**:
    *   **Alternancia de Estilo de Línea**: Opción para cambiar entre líneas curvas (Bezier) y líneas rectas ortogonales (estilo Ingeniería/Manhattan) para mejorar la legibilidad de diagramas profesionales.
    *   **Mejora de Handles**: Aumento del área de interacción de los puertos de conexión (handles) para facilitar el cableado.

**2. Persistencia de Preferencias**
*   El estado del estilo de línea (Recta/Curva) se infiere automáticamente al cargar un esquema guardado para mantener la consistencia visual.
