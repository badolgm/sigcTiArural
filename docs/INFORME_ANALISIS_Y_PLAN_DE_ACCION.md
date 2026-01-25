


📑 BITÁCORA DE INTERVENCIÓN TÉCNICA - SIGC&T RURAL📋 ÍNDICE DE INTERVENCIONES16 de Enero 2026 - Corrección dj_database_url18 de Enero 2026 (09:00 AM) - Auditoría Forense y .gitignore18 de Enero 2026 (13:45 PM) - Rescate de Infraestructura y Compactación de Disco<a name="18-de-enero-2026-tarde"></a>🟢 SESIÓN: 18 de Enero 2026 | 13:45 PMIngeniero de Sistemas: Gemini AI & bagm2 (IRTELC01/badolgm)Rama: rescue/ia-voz-completa1. RESUMEN DE ACCIONES REALIZADASSe ejecutó un plan de rescate de infraestructura debido al colapso del sistema Docker por falta de almacenamiento físico en el Host (Windows) y conflictos de puertos.A. Limpieza y Recuperación de Espacio (Docker)Qué se hizo: Se ejecutó docker system prune -f y docker builder prune -a -f.Por qué era necesario: El disco virtual de Docker (ext4.vhdx) se expandió hasta ocupar todo el espacio disponible (19GB consumidos), impidiendo la creación de nuevas capas de IA (TensorFlow/FFmpeg).Qué afectó: Eliminó capas de construcción obsoletas y contenedores huérfanos. No afectó el código fuente.B. Compactación Física del Disco Virtual (WSL2)Qué se hizo: Se utilizó la herramienta diskpart de Windows para compactar el archivo ext4.vhdx.Metodología:Cierre total de Docker Desktop y wsl --shutdown.Selección del vdisk en la ruta: C:\Users\bagm2\AppData\Local\Docker\wsl\main\ext4.vhdx.Comandos: attach vdisk readonly -> compact vdisk -> detach vdisk.Resultado: Se recuperó el "aire" dentro del disco virtual, permitiendo que Windows respire y Docker tenga espacio para el nuevo build.C. Resolución de Conflictos de RedAcción: Re-mapeo del puerto de MySQL de 3306:3306 a 3307:3306 en docker-compose.yml.Necesidad: El puerto 3306 estaba bloqueado por un servicio local de Windows (MySQL nativo).2. ANÁLISIS DETALLADO DE ESTADOMóduloEstadoDetalle TécnicoInfraestructura🟢 ESTABLEDocker operativo. Puerto 3307 libre. Disco con 19GB libres.Frontend🟡 EN CONSTRUCCIÓNDashboard funcional. Pendiente migrar captura de voz al navegador.Backend (Django)🟢 COMPLETADOConexión a DB corregida. API REST operativa.IA Service🔴 CRÍTICORequiere ffmpeg para procesar audio WebM. Pendiente actualización de Dockerfile.Nodos (3xBBB)🟡 DISEÑOArquitectura reducida de 7 a 3 nodos para el piloto.3. SCRIPT DE AUDITORÍA DE ESTRUCTURA (SIGC&T-Status.py)He diseñado este script para que lo ejecutes en la raíz. Te dirá qué falta y qué está listo.Pythonimport os
from pathlib import Path

def check_project_status():
    print("--- AUDITORÍA DE PROYECTO SIGC&T RURAL ---")
    
    checkpoints = {
        "Base de Datos (MySQL)": "docker-compose.yml",
        "Configuración Django": "src/backend/sigct_backend/settings.py",
        "Rutas Frontend (Router)": "src/frontend/src/App.jsx",
        "Modelos de IA": "src/ai_models/train_plant_disease_mobilenet.py",
        "Asistente de Voz": "src/ai_models/fastapi_app.py"
    }

    for name, path in checkpoints.items():
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"[OK] {name:<25} | Tamaño: {size} bytes")
        else:
            print(f"[FALTA] {name:<25} | ERROR: Archivo no encontrado")

    # Verificación de ramas y git
    print("\n--- ESTADO DE GIT ---")
    os.system("git branch --show-current")
    
if __name__ == "__main__":
    check_project_status()
4. COMANDOS UTILIZADOSBash# Limpieza de Docker
docker system prune -f
docker builder prune -a -f

# Diagnóstico de archivos
ls -lh ~/AppData/Local/Docker/wsl/main/ext4.vhdx

# Operación Git (Limpieza de índice para restaurar .gitignore)
git rm -r --cached .
git add .
5. LO QUE HACE FALTA (PLAN DE ACCIÓN)Commit de Estabilización: Debemos consolidar los cambios del git status actual. Como eliminamos archivos en el índice por error al vaciar el .gitignore, debemos hacer un git add . para que Git reconozca los archivos en sus nuevas rutas.Inyección de IA: Actualizar el Dockerfile de IA con ffmpeg para que el asistente de voz deje de quedarse mudo.Puente de Datos: Conectar la IA con src/backend/api/models.py (Pendiente envío del usuario).Nota para el historial: No se han realizado fusiones (merges) de ramas. El trabajo continúa exclusivamente en rescue/ia-voz-completa para garantizar la seguridad del código maestro.







# INFORME DE ANÁLISIS Y PLAN DE ACCIÓN - PROYECTO sigcTiArural

**Fecha:** 16 de Enero de 2026

## 1. Análisis del Problema

Se ha identificado un error que impide la ejecución del backend de Django. Al ejecutar los comandos `python manage.py migrate` y `python manage.py runserver`, el sistema arroja el siguiente error:

```
ModuleNotFoundError: No module named 'dj_database_url'
```

Este error indica que la librería `dj_database_url`, que es esencial para configurar la conexión a la base de datos de forma dinámica (como se especifica en `src/backend/sigct_backend/settings.py`), no está instalada en el entorno virtual del backend.

El análisis del `git status` también muestra:
- Un archivo modificado: `src/backend/sigct_backend/settings.py`.
- Varios archivos nuevos no rastreados (`analisis_y_plan.md`, `reporte_estructura_proyecto.txt`, etc.).

## 2. Solución Implementada

Para resolver el `ModuleNotFoundError` y mejorar la robustez del entorno de desarrollo, se han realizado las siguientes acciones:

1.  **Modificación de `src/backend/requirements.txt`**: Se ha actualizado el archivo de dependencias para incluir las librerías necesarias para la base de datos y la gestión del entorno.

    ```diff
    +# ======================================================
    +# Base de Datos y Entorno
    +# ======================================================
    +dj-database-url  # Para leer config de BD desde URL
    +psycopg2-binary  # Driver para PostgreSQL
    +mysqlclient      # Driver para MySQL
    +python-dotenv    # Para leer variables de entorno desde .env
    ```

    - **dj-database-url**: Resuelve directamente el error `ModuleNotFoundError`.
    - **psycopg2-binary** y **mysqlclient**: Se añaden para dar soporte a las bases de datos PostgreSQL y MySQL, que están contempladas en el archivo `settings.py`.
    - **python-dotenv**: Facilita la gestión de variables de entorno locales (como `DATABASE_URL`) a través de un archivo `.env`.

## 3. Plan de Acción y Próximos Pasos (¡Acción Requerida!)

Para que los cambios surtan efecto y el backend pueda funcionar, es **indispensable** realizar el siguiente paso manualmente:

1.  **Instalar las dependencias actualizadas**: Abre tu terminal, asegúrate de tener el entorno virtual del backend activado (`source venv/Scripts/activate` o similar) y ejecuta el siguiente comando:

    ```bash
    pip install -r src/backend/requirements.txt
    ```

2.  **Continuar con la ejecución**: Una vez finalizada la instalación, los comandos de Django deberían funcionar correctamente. Los siguientes pasos a seguir son:
    - `python manage.py migrate`
    - `python manage.py runserver`

## 4. Gestión de Cambios en Git

Todos los cambios (el `requirements.txt` actualizado) y los nuevos archivos (este informe, etc.) serán añadidos al área de "staging" de Git para preparar un nuevo commit que organice el proyecto. Se asumirá que las modificaciones existentes en `src/backend/sigct_backend/settings.py` son intencionales y correctas.

---
**Fecha:** 17 de Enero de 2026

## 5. Re-Análisis del Proyecto y Ejecución con Docker

Se ha realizado un análisis completo de la estructura del proyecto, las tecnologías y la configuración de Docker para establecer una línea base clara para el desarrollo.

### 5.1. Resumen de la Arquitectura

*   **Frontend:** React (con Vite) y Tailwind CSS, servido en producción por Nginx.
*   **Backend:** Django con Django REST Framework.
*   **Servicio de IA:** FastAPI con TensorFlow, incluyendo capacidades de procesamiento de audio.
*   **Orquestación:** Todo el sistema está containerizado con Docker y se gestiona a través de `docker-compose.yml`.

### 5.2. Problemas Identificados y Soluciones Aplicadas

1.  **Error de Mapeo de Puertos en Frontend:** Se detectó que `docker-compose.yml` intentaba mapear el puerto de desarrollo de Vite (`5173`) en lugar del puerto de producción de Nginx (`80`).
    *   **Solución:** Se ha corregido el mapeo a `"5173:80"` en el archivo `docker-compose.yml` para permitir que el frontend sea accesible.

2.  **Dependencias Innecesarias en Backend:** El archivo `src/backend/requirements.txt` contiene dependencias que pertenecen al servicio de IA (TensorFlow, FastAPI), aumentando el tamaño de la imagen y el tiempo de construcción.
    *   **Plan de Acción Futuro:** Se recomienda limpiar este archivo en una futura tarea de refactorización para optimizar el contenedor del backend.

### 5.3. Próximos Pasos

1.  **Ejecución Local del Entorno Completo:** Levantar todo el entorno utilizando Docker Compose.
2.  **Validación de la Funcionalidad:** Realizar pruebas para asegurar que la comunicación entre frontend, backend y el servicio de IA funciona como se espera.
3.  **Limpieza de Dependencias:** Agendar la tarea para refactorizar `src/backend/requirements.txt`.

---
**Fecha:** sábado, 17 de enero de 2026, 04:22 p.m.

## 6. Diagnóstico y Corrección del Despliegue con Docker

Continuando con el trabajo, se procedió a ejecutar `docker-compose up -d` para levantar el entorno.

### 6.1. Análisis del Error de Docker

Durante el proceso de construcción (`build`), se presentó un error crítico que detuvo el despliegue:

```
ERROR: Could not install packages due to an OSError: [Errno 5] Input/output error
...
target backend: failed to receive status: rpc error: code = Unavailable desc = error reading from server: EOF
```

El análisis determinó que el error `[Errno 5] Input/output error` se produce por agotamiento de recursos del sistema (espacio en disco o memoria) durante la instalación de las dependencias de Python con `pip`.

La causa raíz fue identificada como una **configuración incorrecta de dependencias**: el archivo `src/backend/requirements.txt` contenía la librería `tensorflow` y otras dependencias del servicio de IA, las cuales son muy pesadas. Esto provocaba que Docker intentara instalar estas librerías dos veces (una para el servicio de IA y otra, innecesariamente, para el backend), llevando al colapso del sistema.

### 6.2. Solución Aplicada

Se procedió a **corregir el archivo `src/backend/requirements.txt`**, eliminando `tensorflow` y todas las demás librerías no relacionadas con Django. Esta acción da cumplimiento a la tarea de refactorización que se había agendado en la sección "5.3. Próximos Pasos".

Con esta corrección, el contenedor del backend es ahora significativamente más ligero, y el error de agotamiento de recursos no debería volver a ocurrir.

### 6.3. Acción Requerida: Verificación de la Solución Docker

Debido a restricciones del entorno de ejecución actual, no es posible ejecutar comandos de Docker para verificar la solución. Por lo tanto, **debes realizar la verificación final** ejecutando el siguiente comando en tu terminal:

```bash
docker-compose up -d --build
```

La opción `--build` es fundamental para que Docker reconstruya los contenedores con los cambios que se han aplicado.

## 7. Plan de Ejecución Manual (Alternativa a Docker)

Mientras se valida y estabiliza el entorno de Docker, la aplicación puede ser ejecutada de forma local utilizando tres terminales (por ejemplo, Git Bash).

**Requisito Previo:** Asegúrate de tener Python y Node.js instalados en tu sistema.

### Terminal 1: Ejecutar el Backend (Django)

1.  **Navega al directorio del backend:**
    ```bash
    cd src/backend
    ```
2.  **Crea y activa un entorno virtual** (si no existe):
    ```bash
    python -m venv venv
    source venv/Scripts/activate
    ```
3.  **Instala las dependencias de Python:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Ejecuta el servidor de Django:** (El puerto por defecto es 8000)
    ```bash
    python manage.py runserver
    ```

### Terminal 2: Ejecutar el Servicio de IA (FastAPI)

1.  **Navega al directorio del servicio de IA:**
    ```bash
    cd src/ai_models
    ```
2.  **Crea y activa un entorno virtual** (si no existe):
    ```bash
    python -m venv venv
    source venv/Scripts/activate
    ```
3.  **Instala las dependencias de Python:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Ejecuta el servidor de FastAPI:** (El puerto configurado es 8081)
    ```bash
    uvicorn fastapi_app:app --host 0.0.0.0 --port 8081 --reload
    ```

### Terminal 3: Ejecutar el Frontend (React)

1.  **Navega al directorio del frontend:**
    ```bash
    cd src/frontend
    ```
2.  **Instala las dependencias de Node.js:**
    ```bash
    npm install
    ```
3.  **Ejecuta el servidor de desarrollo de Vite:** (El puerto por defecto es 5173)
    ```bash
    npm run dev
    ```

Después de seguir estos pasos, podrás acceder a la aplicación en `http://localhost:5173`.

## 8. Próximos Pasos Consolidados

1.  **Acción Inmediata:** Ejecutar `docker-compose up -d --build` para validar la corrección.
2.  **Validación Funcional:** Una vez que los servicios se ejecuten (ya sea con Docker o manualmente), realizar pruebas de la funcionalidad completa de la aplicación.
3.  **Migración de Base de Datos:** Una vez estabilizado el entorno, el siguiente gran paso es planificar y ejecutar la migración de la base de datos de MySQL a PostgreSQL, lo cual requerirá:
    - Ajustar la configuración en `settings.py`.
    - Asegurar que el driver `psycopg2-binary` funcione correctamente.
    - Realizar el proceso de volcado de datos y restauración en la nueva base de datos.

## 🟢 Control de Estabilidad - 18 de Enero 2026
- **Infraestructura:** Docker Desktop operativo con WSL2 compactado.
- **Servicios:** Los 4 contenedores (DB, AI, Backend, Frontend) están en estado 'Running'.
- **Red:** Acceso confirmado al Dashboard. Puerto MySQL 3307 operativo.
- **Ajuste de Proyecto:** Confirmada arquitectura de 3 nodos (BBB) para el piloto.

## 🤖 Evolución de IA: Asistente con Contexto de Nodos
- **Estado Actual:** Asistente de voz limitado a respuestas estáticas y bloqueado por hardware en Docker.
- **Objetivo:** Migrar la captura de audio al Frontend y conectar el motor de respuesta a un LLM con acceso a la telemetría de los 3 nodos BBB.
- **Arquitectura:** Se implementará un puente de datos entre Django (Base de Datos) y FastAPI (Motor IA).


📑 BITÁCORA DE INTERVENCIÓN TÉCNICA - SIGC&T RURAL📋 ÍNDICE DE INTERVENCIONES16 de Enero 2026 - Corrección dj_database_url18 de Enero 2026 (09:00 AM) - Auditoría Forense y .gitignore18 de Enero 2026 (13:45 PM) - Rescate de Infraestructura y Compactación de Disco<a name="18-de-enero-2026-tarde"></a>🟢 SESIÓN: 18 de Enero 2026 | 13:45 PMIngeniero de Sistemas: Gemini AI & bagm2 (IRTELC01/badolgm)Rama: rescue/ia-voz-completa1. RESUMEN DE ACCIONES REALIZADASSe ejecutó un plan de rescate de infraestructura debido al colapso del sistema Docker por falta de almacenamiento físico en el Host (Windows) y conflictos de puertos.A. Limpieza y Recuperación de Espacio (Docker)Qué se hizo: Se ejecutó docker system prune -f y docker builder prune -a -f.Por qué era necesario: El disco virtual de Docker (ext4.vhdx) se expandió hasta ocupar todo el espacio disponible (19GB consumidos), impidiendo la creación de nuevas capas de IA (TensorFlow/FFmpeg).Qué afectó: Eliminó capas de construcción obsoletas y contenedores huérfanos. No afectó el código fuente.B. Compactación Física del Disco Virtual (WSL2)Qué se hizo: Se utilizó la herramienta diskpart de Windows para compactar el archivo ext4.vhdx.Metodología:Cierre total de Docker Desktop y wsl --shutdown.Selección del vdisk en la ruta: C:\Users\bagm2\AppData\Local\Docker\wsl\main\ext4.vhdx.Comandos: attach vdisk readonly -> compact vdisk -> detach vdisk.Resultado: Se recuperó el "aire" dentro del disco virtual, permitiendo que Windows respire y Docker tenga espacio para el nuevo build.C. Resolución de Conflictos de RedAcción: Re-mapeo del puerto de MySQL de 3306:3306 a 3307:3306 en docker-compose.yml.Necesidad: El puerto 3306 estaba bloqueado por un servicio local de Windows (MySQL nativo).2. ANÁLISIS DETALLADO DE ESTADOMóduloEstadoDetalle TécnicoInfraestructura🟢 ESTABLEDocker operativo. Puerto 3307 libre. Disco con 19GB libres.Frontend🟡 EN CONSTRUCCIÓNDashboard funcional. Pendiente migrar captura de voz al navegador.Backend (Django)🟢 COMPLETADOConexión a DB corregida. API REST operativa.IA Service🔴 CRÍTICORequiere ffmpeg para procesar audio WebM. Pendiente actualización de Dockerfile.Nodos (3xBBB)🟡 DISEÑOArquitectura reducida de 7 a 3 nodos para el piloto.3. SCRIPT DE AUDITORÍA DE ESTRUCTURA (SIGC&T-Status.py)He diseñado este script para que lo ejecutes en la raíz. Te dirá qué falta y qué está listo.Pythonimport os
from pathlib import Path

def check_project_status():
    print("--- AUDITORÍA DE PROYECTO SIGC&T RURAL ---")
    
    checkpoints = {
        "Base de Datos (MySQL)": "docker-compose.yml",
        "Configuración Django": "src/backend/sigct_backend/settings.py",
        "Rutas Frontend (Router)": "src/frontend/src/App.jsx",
        "Modelos de IA": "src/ai_models/train_plant_disease_mobilenet.py",
        "Asistente de Voz": "src/ai_models/fastapi_app.py"
    }

    for name, path in checkpoints.items():
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"[OK] {name:<25} | Tamaño: {size} bytes")
        else:
            print(f"[FALTA] {name:<25} | ERROR: Archivo no encontrado")

    # Verificación de ramas y git
    print("\n--- ESTADO DE GIT ---")
    os.system("git branch --show-current")
    
if __name__ == "__main__":
    check_project_status()
4. COMANDOS UTILIZADOSBash# Limpieza de Docker
docker system prune -f
docker builder prune -a -f

# Diagnóstico de archivos
ls -lh ~/AppData/Local/Docker/wsl/main/ext4.vhdx

# Operación Git (Limpieza de índice para restaurar .gitignore)
git rm -r --cached .
git add .
5. LO QUE HACE FALTA (PLAN DE ACCIÓN)Commit de Estabilización: Debemos consolidar los cambios del git status actual. Como eliminamos archivos en el índice por error al vaciar el .gitignore, debemos hacer un git add . para que Git reconozca los archivos en sus nuevas rutas.Inyección de IA: Actualizar el Dockerfile de IA con ffmpeg para que el asistente de voz deje de quedarse mudo.Puente de Datos: Conectar la IA con src/backend/api/models.py (Pendiente envío del usuario).Nota para el historial: No se han realizado fusiones (merges) de ramas. El trabajo continúa exclusivamente en rescue/ia-voz-completa para garantizar la seguridad del código maestro.


📑 BITÁCORA DE INTERVENCIÓN TÉCNICA - SIGC&T RURAL📋 ÍNDICE DE INTERVENCIONES16 de Enero 2026 - Corrección dj_database_url18 de Enero 2026 (09:00 AM) - Auditoría Forense y .gitignore18 de Enero 2026 (14:30 PM) - Rescate de Infraestructura y Saneamiento de Git<a name="18-de-enero-2026-tarde"></a>🟢 SESIÓN: 18 de Enero 2026 | 14:30 PMIngeniero de Sistemas: Gemini AI & bagm2 (badolgm)Rama: rescue/ia-voz-completa1. RESUMEN DE ACCIONES REALIZADASSe ejecutó un plan de rescate de infraestructura y saneamiento del repositorio para corregir el colapso de almacenamiento y la inconsistencia en el rastreo de archivos.A. Saneamiento del Índice de Git (.gitignore)Qué se hizo: Se restauró el .gitignore profesional y se ejecutó git rm -r --cached ..Por qué era necesario: Git estaba rastreando carpetas pesadas (node_modules, venv, __pycache__) y archivos de respaldo locales (backups/, _local_docs_backup/), lo que inflaba el repositorio y causaba conflictos de estado.Qué afectó: Eliminó todos los archivos del índice temporal de Git para re-filtrarlos. No borró archivos físicos; ahora están en estado "Untracked" listos para ser añadidos limpiamente.B. Recuperación de Espacio y Compactación (Docker/WSL2)Qué se hizo: Limpieza de imágenes/cache con docker system prune y compactación del disco virtual ext4.vhdx con diskpart.Metodología: Se utilizó el comando compact vdisk en diskpart tras apagar el motor WSL2 para reducir el tamaño físico del archivo en Windows.Resultado: Recuperación de 13.22 GB internos y estabilización del host con 19 GB libres.C. Resolución de Conflictos de PuertoQué se hizo: Cambio de mapeo de puertos en docker-compose.yml de 3306:3306 a 3307:3306.Motivo: Conflicto con un servicio MySQL nativo instalado en el host del desarrollador.2. ANÁLISIS DETALLADO DE ESTADOMóduloEstadoDetalle TécnicoInfraestructura🟢 ESTABLEDocker Desktop operativo. Contenedores corriendo con 19GB de margen.Repositorio🟡 SANEANDOÍndice limpio. Pendiente git add selectivo para ignorar basura.Frontend🟢 FUNCIONALDashboard visible en puerto 5173. Router validado en App.jsx.IA Service🔴 CRÍTICOPendiente build con ffmpeg para habilitar el asistente de voz.Base de Datos🟢 ESTABLECorriendo en puerto 3307. Volumen mysql_data persistente.3. SCRIPT DE AUDITORÍA DE ESTRUCTURA (SIGC&T-Status.py)Este script verifica que los componentes críticos estén en su lugar después de la reestructuración.Pythonimport os
from pathlib import Path

def check_project_status():
    print("--- 🔍 AUDITORÍA DE ESTRUCTURA SIGC&T RURAL ---")
    
    # Estructura que DEBE existir para éxito del proyecto SENA 2026
    checkpoints = {
        "Base de Datos (Config)": "docker-compose.yml",
        "Core Backend": "src/backend/manage.py",
        "Configuración Django": "src/backend/sigct_backend/settings.py",
        "Frontend App": "src/frontend/src/App.jsx",
        "Asistente de Voz (IA)": "src/ai_models/fastapi_app.py",
        "Git Ignore (Saneado)": ".gitignore"
    }

    print(f"{'COMPONENTE':<25} | {'ESTADO':<8} | {'INFO'}")
    print("-" * 50)
    
    for name, path in checkpoints.items():
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"{name:<25} | 🟢 OK     | {size} bytes")
        else:
            print(f"{name:<25} | 🔴 FALTANTE | Revisar ubicación")

    # Verificación de carpetas ignoradas
    ignored_dirs = ["node_modules", "venv", "backups", "__pycache__"]
    print("\n--- 🛡️ VERIFICACIÓN DE LIMPIEZA ---")
    for d in ignored_dirs:
        found = list(Path(".").rglob(d))
        if found:
            print(f"[!] {d:<15} detectado en {len(found)} ubicaciones (Correcto: Ignorado por git)")

if __name__ == "__main__":
    check_project_status()
4. COMANDOS DE SANEAMIENTO UTILIZADOSBash# Saneamiento del índice Git
git rm -r --cached .
git add .
# (Nota: El comando git add . ahora respeta el nuevo .gitignore y no subirá basura)

# Compactación de disco virtual
wsl --shutdown
diskpart > select vdisk file="..." > compact vdisk
5. PENDIENTES (PRÓXIMOS PASOS)Commit Limpio: Ejecutar git commit -m "infra: saneamiento de repositorio y corrección de puertos".Inyección de Audio: Reconstruir ai_service con el nuevo Dockerfile (FFmpeg).Inteligencia Real: Conectar fastapi_app.py con los modelos de Django (Necesario: src/backend/api/models.py).🛠️ ¿Qué hacemos con los archivos "deleted" de git status?No te preocupes por el mensaje de "deleted". Git simplemente te está diciendo: "He quitado estos archivos de mi lista de seguimiento antigua". Como ya tienes el .gitignore correcto, ahora debemos volver a añadirlos de forma oficial.¿Deseas que te dé los comandos exactos para hacer el commit de limpieza ahora mismo y que tu git status quede impecable? (Solo subiríamos lo necesario, dejando fuera los backups y la basura). Pásame también el archivo src/backend/api/models.py para empezar a trabajar en la inteligencia de los 3 nodos.

<a name="18-de-enero-2026-final"></a>
## 🔵 SESIÓN: 18 de Enero 2026 | 15:15 PM
**Ingeniero:** Gemini AI & bagm2
**Rama:** `rescue/ia-voz-completa`

### 1. PROTECCIÓN DE ACTIVOS LOCALES
- Se ha verificado que `docs/reports/` e `INFORME_ANALISIS_Y_PLAN_DE_ACCION.md` están fuera del radar de Git.
- Los scripts de auditoría y reportes HTML/PDF se mantienen exclusivamente en el host local.

### 2. ANÁLISIS DE MODELOS DE DATOS
- Archivo `src/backend/api/models.py` analizado con éxito.
- Entidad detectada: `SensorReading` (ID, Temp, Hum, Timestamp).
- Estrategia: La IA consumirá estas lecturas para generar respuestas contextuales ("Inteligencia Real" vs "Asistente Estático").

### 3. ESTADO DE RAMA
- Se procedió a realizar un `git add .` global tras el saneamiento del .gitignore.
- Los archivos en estado 'deleted' han sido re-indexados correctamente según la nueva estructura limpia.

<a name="18-de-enero-2026-mapa"></a>
## 🗺️ SESIÓN: 18 de Enero 2026 | 16:30 PM
**Objetivo:** Localización y blindaje de componentes críticos.

### 🔍 ARCHIVOS IDENTIFICADOS PARA MODIFICACIÓN:
1. `src/ai_models/Dockerfile`: Inserción de dependencias binarias (ffmpeg).
2. `src/ai_models/requirements.txt`: Inserción de conectores de datos y audio.
3. `src/ai_models/fastapi_app.py`: Reescritura del endpoint de voz para integración con modelos de Django.

### 🛡️ ESTADO DE PROTECCIÓN:
- Se confirma que los reportes de `docs/reports/` y la bitácora maestra están excluidos de cualquier operación de `git push`.
- Los cambios se mantienen en la rama `rescue/ia-voz-completa` de forma aislada.

<a name="18-de-enero-2026-limpieza-pre-build"></a>
## ⚠️ SESIÓN: 18 de Enero 2026 | 17:45 PM
**Estado Crítico de Disco:** 16 GB disponibles en Host. 
**Acción:** Purga total de sistema (`prune -a`) para asegurar margen de maniobra durante la instalación de TensorFlow y Postgres.
**Observación Técnica:** Se identifica comportamiento de expansión dinámica de WSL2 (archivo vhdx) como causa de la discrepancia en el Explorador de Windows.

<a name="18-de-enero-2026-timeout-ia"></a>
## ⚠️ SESIÓN: 18 de Enero 2026 | 19:15 PM
**Incidencia:** Error `ReadTimeoutError` durante la instalación de TensorFlow (620MB) en el contenedor `ai_service`.
**Diagnóstico:** Agotamiento de tiempo de respuesta de `pip` debido al tamaño del paquete.
**Estado de Infraestructura:** - `sigct_db` (Postgres): ✅ Pulled & Ready.
- `sigct_backend`: ✅ Built.
- `sigct_frontend`: ✅ Built.
**Acción:** Reintento de construcción con incremento de timeout en el gestor de paquetes.

<a name="18-de-enero-2026-exito-migracion"></a>
## 🏆 SESIÓN: 18 de Enero 2026 | 19:45 PM
**Hito Alcanzado:** Construcción exitosa del ecosistema SIGC&T Rural sobre PostgreSQL.

### ✅ LOGROS TÉCNICOS:
- **AI Service:** Imagen construida con TensorFlow (620MB) y FFmpeg tras superar errores de Timeout.
- **Base de Datos:** Migración física de MySQL a PostgreSQL 15 completada en Docker.
- **Soporte Dual:** El código de la IA y el Backend ahora son capaces de detectar entornos Docker y locales automáticamente.

### 📊 ESTADO DE DISCO:
- El proceso finalizó exitosamente con los 16 GB de margen iniciales, optimizando el uso interno del VHDX de WSL2.

<a name="18-de-enero-2026-estabilizacion"></a>
## 🛠️ SESIÓN: 18 de Enero 2026 | 20:30 PM
**Incidencia:** Errores de ruteo 404 en Frontend y falta de respuesta en AI Service post-migración.
**Diagnóstico:** Desconexión entre contenedores por falta de archivos estáticos y ruteo Nginx mal configurado.
**Acción Realizada:** Inyección de datos semilla en PostgreSQL (api_sensorreading).
**Plan de Mejora:** Integración de API de inferencia LLM para transformar respuestas estáticas en consejos técnicos agroindustriales.

<a name="18-de-enero-2026-saneamiento-backend"></a>
## ✅ SESIÓN: 18 de Enero 2026 | 20:20 PM
**Hito:** Construcción exitosa de la imagen Backend con soporte nativo para PostgreSQL.
**Resolución:** Se eliminó la dependencia conflictiva `mysqlclient` y se restauró la conectividad con los repositorios de Debian.
**Estado Actual:** - Backend: Operativo (Django + Psycopg2)
- DB: Operativa (PostgreSQL 15)
- IA: Construida y en espera de integración con LLM.


<a name="18-de-enero-2026-timeout-final"></a>
## ⚠️ SESIÓN: 18 de Enero 2026 | 21:10 PM
**Incidencia:** `ReadTimeoutError` persistente en el paquete `grpcio` del AI Service.
**Acción:** Incremento del parámetro `--default-timeout` a 1000s en el Dockerfile.
**Estado de Red:** Forzando modo `--network=host` para estabilizar la descarga de librerías pesadas.



<a name="22-de-enero-2026-contexto"></a>
# 🟢 SESIÓN: 22 de Enero 2026 | Implementación de Inteligencia Conversacional
**Ingeniero:** Gemini AI & bagm2
**Rama:** `feature/ia-voz-inteligente-2026`

## 1. Diagnóstico de "Funcionamiento Incorrecto"
El usuario reportó que la IA "no funciona correctamente" o "no dice nada" útil. Tras el análisis del código `fastapi_app.py`, se identificó:
- **Amnesia Total:** La IA no tenía memoria. Cada frase era independiente. Si preguntabas "Temperatura" y luego "¿Es alta?", no sabía de qué hablabas.
- **Lógica Rígida:** Solo respondía a palabras clave exactas sin contexto.

## 2. Plan de Acción: Inyección de Contexto (Context Injection)
Se implementará un sistema de **Memoria de Corto Plazo** en el backend para simular una conversación fluida.

### Estrategia de Programación
1.  **Clase `ConversationMemory`:** Singleton para almacenar el estado de la última interacción.
2.  **Contexto de Datos:** Guardar los últimos valores de sensores leídos (temp/humedad) para responder preguntas de seguimiento ("¿Eso es malo?").
3.  **Manejo de Ambigüedad:** Si el usuario dice "¿Y la humedad?", la IA sabrá que se refiere al mismo nodo del que habló hace 10 segundos.

### Comandos y Cambios
- **Archivo:** `src/ai_models/fastapi_app.py`
- **Lógica:**
  - Se añadirá variable global `SESSION_CONTEXT`.
  - Se mejorará el parser de texto para detectar intenciones secundarias ("evaluación", "repetición").

## 3. Estado del Repositorio
- Se ha realizado limpieza de `git status`.
- Se han ignorado archivos temporales de audio (`.mp3`, `.webm`).
- Se mantiene la rama `feature/ia-voz-inteligente-2026` activa hasta validación final.

---
## 4. Cierre de Fase: IA de Voz Inteligente
**Fecha:** 22 de Enero de 2026
**Estado:** ✅ Estable y Sincronizado en GitHub
**Rama:** `feature/ia-voz-inteligente-2026`

Se ha completado el ciclo de desarrollo de la IA de voz con las siguientes capacidades:
- Conexión robusta a base de datos (Docker/Local).
- Captura de audio compatible con múltiples navegadores.
- Memoria contextual para conversaciones fluidas.

El repositorio ha sido limpiado y estabilizado. Se han ignorado datasets locales (`data/`) para no saturar el control de versiones.

---

<a name="plan-laboratorios-integracion"></a>
# 🚀 NUEVA FASE: Integración de Laboratorios (SENA 2026)

**Objetivo General:** Integrar los subsistemas físicos (Robótica) con la plataforma de software (SIGC&T Rural), asegurando que la telemetría y el control fluyan bidireccionalmente.

## 1. Estrategia de Ramificación
Para mantener la integridad del código, se creará una nueva rama dedicada a esta fase de integración física.
- **Rama Origen:** `feature/ia-voz-inteligente-2026` (Última versión estable).
- **Nueva Rama:** `feature/laboratorios-integracion-2026`.

## 2. Plan de Ejecución: Laboratorio de Robótica (Fase 1)
Este laboratorio se centrará en la interacción con el hardware robótico (brazo/móvil) simulado o real.

### Paso 1: Definición de Interfaces
- Definir contratos de datos (JSON) para comandos de movimiento.
- Crear endpoints en FastAPI para recibir telemetría del robot.

### Paso 2: Integración de Telemetría
- **Hardware:** ESP32 / Arduino (Simulado o Físico).
- **Protocolo:** MQTT o HTTP Post.
- **Tarea:** Lograr que el robot envíe su "Estado" (Batería, Posición) al Dashboard.

### Paso 3: Control por Voz (Sinergia)
- Utilizar la IA de voz recién estabilizada para enviar comandos al robot.
- Ej: "Activar riego en sector 1" -> Comando al Robot.

## 3. Próximos Pasos Inmediatos
1.  Crear la rama `feature/laboratorios-integracion-2026`.
2.  Diseñar el esquema de base de datos para "Actuadores" (Robots).
3.  Actualizar documentación de arquitectura si es necesario.

<a name="23-de-enero-2026-limpieza-repositorio"></a>
# 🧹 SESIÓN: 23 de Enero 2026 | Saneamiento de Repositorio
**Ingeniero:** Gemini AI & bagm2
**Rama Activa:** `feature/laboratorios-integracion-2026`

## 1. Acción de Limpieza Profunda
Se ha realizado una limpieza estructural de ramas en Git para evitar confusiones y errores de documentación fragmentada.

- **Fusión (Merge):** La rama `feature/ia-voz-inteligente-2026` (IA completada) ha sido fusionada en `main`.
- **Eliminación:** Se han borrado ramas antiguas (`feature/asistente-voz`, `docs/cleanup-masterdoc`, etc.) para dejar un área de trabajo limpia.
- **Unificación:** Ahora existe una **ÚNICA** rama de desarrollo activa: `feature/laboratorios-integracion-2026`, que contiene todo el historial previo + los nuevos planes.

## 2. Estado Actual
- **Rama Main:** Contiene la versión estable de la IA de Voz.
- **Rama Laboratorios:** Es la rama actual de trabajo. Todo cambio futuro (código o documentación) se hará **SOLO** aquí.

# Informe de Análisis y Plan de Acción: Integración Robótica Segura
**Fecha:** 24 de Enero 2026
**Autor:** Bernardo Adolfo Gómez Montoya + Gemini AI
**Contexto:** Recuperación tras incidente de `.gitignore` y plan de integración controlada.

---

## 1. Análisis de Situación Actual

### 1.1 Estado del Repositorio
- **Rama Actual:** `feature/laboratorios-integracion-2026`
- **Dashboard:** ✅ Restaurado y funcional (todas las tarjetas visibles).
- **Backend:** ✅ Modelos de Robótica (`Robot`, `RobotTelemetry`, `RobotCommand`) implementados pero NO integrados al frontend.
- **Frontend:** ⚠️ `RoboticsLab.jsx` está en modo "aislado" (Standalone), usando datos simulados o conexión directa a ROSBridge local, sin consumir la API de Django aún.
- **Docker:** ✅ Limpieza realizada (10GB recuperados). Contenedores operando correctamente con PostgreSQL.

### 1.2 Riesgos Identificados
1.  **Corrupción de UI:** Modificar componentes compartidos (`LabCatalog`, `lab-data.js`) puede romper otras secciones (como sucedió hoy).
2.  **Pérdida de Datos:** Reinicios de contenedores sin volúmenes persistentes o migraciones fallidas.
3.  **Conflictos de Red:** La comunicación Frontend (Browser) -> ROSBridge (Localhost:9090) vs Frontend -> Backend (Docker:8000) puede generar problemas de CORS o Mixed Content.

---

## 2. Metodología de Desarrollo: "Integración Defensiva"

Para evitar nuevos incidentes, adoptaremos una estrategia de **"Integración Defensiva"** basada en 3 pilares:

1.  **Aislamiento de Cambios:** Todo cambio de Robótica se hará en archivos NUEVOS o ESPECÍFICOS, tocando lo mínimo posible los archivos globales (`lab-data.js`).
2.  **Feature Flags (Banderas de Características):** El frontend detectará si la API de backend está disponible; si falla, degradará suavemente a modo "Simulación" sin romper la pantalla blanca (White Screen of Death).
3.  **Verificación Incremental:** Cada paso se verificará con comandos `curl` (Backend) y prueba visual (Frontend) ANTES de hacer commit.

---

## 3. Plan de Acción Detallado

### Fase 1: Verificación de Cimientos (Backend)
**Objetivo:** Asegurar que el Backend responda correctamente a las peticiones de robots antes de conectar el frontend.

**Comandos de Verificación:**
```bash
# 1. Verificar estado del servidor
curl -I http://localhost:8000/api/health/

# 2. Listar robots existentes (debe devolver lista vacía [] o datos previos)
curl http://localhost:8000/api/robots/

# 3. Crear un robot de prueba "RBT-TEST-01"
curl -X POST http://localhost:8000/api/robots/ \
     -H "Content-Type: application/json" \
     -d '{"robot_id": "RBT-TEST-01", "name": "Test Robot", "type": "ground", "status": "active"}'
```

### Fase 2: Integración Frontend Segura (Hook Personalizado)
**Estrategia:** No modificaremos `RoboticsLab.jsx` directamente con lógica compleja. Crearemos un "Hook" de React separado (`useRoboticsApi.js`) que maneje la comunicación.

**Pasos:**
1.  Crear `src/frontend/src/hooks/useRoboticsApi.js`.
2.  Implementar lógica de `fetch` con manejo de errores (Try/Catch).
3.  Importar este hook en `RoboticsLab.jsx` solo para LEER datos, sin borrar la funcionalidad actual de ROSBridge.

### Fase 3: Prueba de Humo (Smoke Test)
**Procedimiento:**
1.  Levantar entorno: `docker-compose up -d --no-deps frontend` (reconstrucción rápida).
2.  Abrir navegador en `http://localhost:5173/lab-robotics`.
3.  Verificar consola de desarrollador (F12) buscando errores rojos.
4.  Confirmar que aparece el robot de prueba creado en la Fase 1.

---

## 4. Comandos de Referencia (Bitácora)

### Gestión de Ramas y Guardado
```bash
# Verificar estado antes de empezar
git status

# Guardar progreso parcial (Backend verificado)
git add src/backend/api/
git commit -m "feat(backend): Verify robotics API endpoints"

# Guardar progreso parcial (Frontend Hook)
git add src/frontend/src/hooks/
git commit -m "feat(frontend): Add useRoboticsApi hook for safe integration"
```

### Recuperación de Emergencia (Si algo falla)
```bash
# Descartar cambios en frontend (volver al último commit seguro)
git restore src/frontend/src/labs/RoboticsLab.jsx

# Reconstruir contenedor frontend limpio
docker-compose up -d --build --force-recreate --no-deps frontend
```

---


# INFORME DE ANÁLISIS Y PLAN DE ACCIÓN - RECUPERACIÓN Y ROBÓTICA
**Fecha:** 24 de Enero 2026  
**Rama:** `feature/laboratorios-integracion-2026`  
**Estado:** RECUPERADO / EN PROCESO DE INTEGRACIÓN  

---

## 1. Resumen del Incidente Crítico (Dashboard y .gitignore)

### 🚨 El Problema
Durante la sesión de trabajo, se detectó una corrupción masiva en el Dashboard principal. Desaparecieron tarjetas de laboratorios (Telecomunicaciones, Agricultura, Cursos, etc.) y se perdieron enlaces.

**Causa Raíz Identificada:**
1.  **Mala Configuración de .gitignore:** La regla `data/` en `.gitignore` estaba ignorando no solo la carpeta raíz de datasets (intencional), sino también `src/frontend/src/data/` (accidental), donde reside `lab-data.js`.
2.  **Pérdida de `lab-data.js`:** Al no ser rastreado por Git, cambios locales o resets accidentales eliminaron el contenido completo de este archivo, dejando solo una versión truncada.

### ✅ Acciones de Recuperación Ejecutadas
1.  **Corrección de .gitignore:**
    *   **Antes:** `data/` (Ignoraba cualquier carpeta llamada "data" en cualquier nivel).
    *   **Ahora:** `/data/` (Solo ignora la carpeta "data" en la raíz del proyecto).
    *   **Comando:** Edición directa y verificación.
2.  **Restauración de `lab-data.js`:**
    *   Se reconstruyó manualmente el archivo con las **11 categorías** de laboratorios originales.
    *   Se reasignaron los colores NEÓN y los iconos correspondientes.
3.  **Limpieza de Disco Docker:**
    *   Se liberaron **10GB+** de espacio en disco.
    *   **Comando:** `docker system prune -f`
    *   **Método WSL2:** `diskpart` > `select vdisk` > `compact vdisk`.

---

## 2. Plan de Acción: Integración Laboratorio de Robótica

Para evitar futuros incidentes y asegurar una integración robusta ("Simulation-First"), se ha procedido con la siguiente metodología:

### 🛠 Metodología Implementada
1.  **Simulación Primero (Simulation-First):** Antes de conectar robots reales, creamos un "Gemelo Digital" básico mediante scripts de física.
2.  **Backend como Fuente de Verdad:** El estado del robot (batería, posición) reside en Django/PostgreSQL, no en el frontend.
3.  **Visualización Reactiva:** El frontend solo "escucha" y renderiza, no calcula física.

### 📋 Pasos Técnicos Realizados (Estado Actual)

#### A. Backend (Django)
*   **Modelos:** Verificados `Robot`, `RobotTelemetry`, `RobotCommand`.
*   **API:** Endpoint `/api/robot-telemetry/` funcional y probado.

#### B. Script de Simulación (`scripts/physics_sim.py`)
*   **Función:** Simula un robot (`PHYSICS-BOT-01`) realizando una trayectoria helicoidal (espiral ascendente).
*   **Física:** Calcula posición (x,y,z) y descarga de batería realista.
*   **Conexión:** Inyecta datos vía HTTP POST a la API local cada 1 segundo.

#### C. Frontend (React + Three.js)
*   **Librerías:** Se instalaron `three`, `@react-three/fiber`, `@react-three/drei`.
*   **Componente 3D:** `Telemetry3DScene.jsx` creado.
    *   Renderiza el robot como una esfera 3D.
    *   Dibuja la estela de la trayectoria en tiempo real.
    *   Muestra HUD con datos de telemetría (Batería, Velocidad).
*   **Integración:** Se añadió la sección "Telemetría en Vivo" a `RoboticsLab.jsx`.

---

## 3. Comandos de Referencia (Bitácora)

### Restauración de Entorno (Docker)
Si los cambios no se reflejan, ejecutar este ciclo de limpieza y reconstrucción:
```bash
# Detener todo
docker-compose down

# Reconstruir frontend (especialmente si hay nuevas librerías npm)
docker-compose build frontend

# Iniciar en segundo plano
docker-compose up -d
```

### Ejecución de Simulación
Para ver el robot moverse en el laboratorio, ejecutar el script generador de datos:
```bash
python scripts/physics_sim.py
```
*(Mantener esta terminal abierta mientras se prueba el dashboard)*


# Informe de Análisis de Incidente y Plan de Acción
**Fecha:** 2026-01-25
**Incidente:** Bloqueo total del Dashboard (White Screen) y pérdida de visibilidad de componentes.

## 1. Análisis de Causa Raíz
- **Síntoma:** El frontend mostraba una pantalla en blanco/negro. La consola del navegador reportaba `Uncaught TypeError: Cannot read properties of undefined (reading 's')` en el bundle minificado.
- **Diagnóstico:** El error se originó en la integración reciente de la librería de visualización 3D (`@react-three/drei` / `three.js`). Al renderizar el componente `Telemetry3DScene`, una propiedad interna (posiblemente `scene`, `style` o `size`) no estaba definida, provocando un fallo en cascada que desmontaba toda la aplicación React (`App.jsx`).
- **Factor Contribuyente:** Posible conflicto de versiones entre `react@18` y las dependencias de `three` instaladas con `--legacy-peer-deps`.

## 2. Acciones Correctivas Inmediatas (Plan de Rescate)
1.  **Aislamiento del Fallo:** Se deshabilitó temporalmente el componente `Telemetry3DScene` en `src/frontend/src/labs/RoboticsLab.jsx` para detener el bloqueo de la aplicación.
2.  **Verificación de Datos:** Se auditó `src/frontend/src/data/lab-data.js` para garantizar que la estructura JSON de las categorías (Robótica, Telecomunicaciones, etc.) estuviera intacta (11 categorías confirmadas).
3.  **Limpieza de Entorno:** Se ejecutó `docker system prune -f` y compactación de disco WSL2 para descartar problemas de recursos.

## 3. Metodología de Desarrollo y Estabilización
- **Principio de "Append-Only" para Docs:** `MASTERDOC.md` es sagrado; solo se adiciona información, nunca se borra historial.
- **Verificación de Pasos Atómicos:** No realizar commits ("save points") hasta verificar visualmente que la aplicación compila y renderiza correctamente en el navegador (`localhost`).
- **Manejo de Ramas:** Las características experimentales (como motores 3D pesados) deben desarrollarse en ramas aisladas (`feature/robotics-3d`) antes de integrarse en `main` o `develop`.

## 4. Plan de Acción Futuro
1.  Estabilizar el Dashboard actual (prioridad crítica).
2.  Investigar la compatibilidad de `three.js` en un entorno aislado.
3.  Reactivar la visualización 3D solo cuando se garantice que no bloquea el hilo principal de renderizado (usar `Lazy Loading` estricto).

## 5. Comandos de Referencia
- Restauración de dependencias limpias: `rm -rf node_modules && npm install`
- Verificación de logs en tiempo real: `docker logs -f sigct_frontend`
- Compactación de disco (WSL): `diskpart -> select vdisk ... -> compact vdisk`
**Firma:**
*Bernardo Adolfo Gómez Montoya*
*Líder de Desarrollo - Proyecto SIGC&T Rural*

