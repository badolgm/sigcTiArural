# 📑 BITÁCORA DE INTERVENCIÓN TÉCNICA - SIGC&T RURAL

> **Proyecto:** [sigcTiArural](https://github.com/badolgm/sigcTiArural.git)
> **Autor:** Bernardo Adolfo Gómez Montoya
> **Metodología de Documentación:** Append-Only (nunca se elimina historial)

---

## 📋 ÍNDICE DE INTERVENCIONES

## 2026-07-04 — Reordenación documental y alineación arquitectónica

### Resumen ejecutivo
Se realizó una intervención de documentación y alineación técnica para dejar claro el rumbo del refactor: el proyecto se está reconduciendo hacia un **Modular Monolith** con **bounded contexts hexagonales**, manteniendo Django como proceso principal y separando aquellos servicios que requieren su propio runtime físico, como el servicio de IA en FastAPI/TensorFlow.

### Resultado
- **Estado:** Positivo con observaciones.
- **Razón de éxito:** Se consolidó la intención arquitectónica, se dejó trazabilidad del estado actual y se evitó borrar ni desordenar la documentación histórica.
- **Razón de intervención:** Evitar que la refactorización se vuelva ambigua o frágil, especialmente ante cambios de puertos, credenciales de base de datos, entornos virtuales y despliegues de Docker.

### Evidencia y observaciones técnicas
- Se mantuvo la bitácora como registro histórico, sin eliminar entradas previas.
- Se documentó la separación lógica entre contextos del negocio y servicios con frontera física real.
- Se registró que los conflictos de puertos, autenticación de PostgreSQL y aislamiento de entornos pueden bloquear una ejecución inicial, pero no invalidan la ruta de refactorización si se gestionan con orden y trazabilidad.
- Se dejó claro que la documentación debe servir como punto de continuidad para la IA, el equipo técnico y el proceso de migración.

### Conclusión operativa
La documentación del proyecto quedó más coherente para comprender dónde está el proceso, qué se está transformando, qué se conserva y cómo se debe continuar sin perder seguridad ni consistencia.

---

| Fecha | Sesión | Descripción |
|-------|--------|-------------|
| [16 de Enero 2026](#16-de-enero-2026) | Única | Corrección `dj_database_url` |
| [18 de Enero 2026 — 09:00 AM](#18-de-enero-2026--0900-am) | Mañana | Auditoría Forense y `.gitignore` |
| [18 de Enero 2026 — 13:45 PM](#18-de-enero-2026--1345-pm) | Tarde | Rescate de Infraestructura y Compactación de Disco |
| [18 de Enero 2026 — 14:30 PM](#18-de-enero-2026--1430-pm) | Tarde | Rescate de Infraestructura y Saneamiento de Git |
| [18 de Enero 2026 — 15:15 PM](#18-de-enero-2026--1515-pm) | Tarde | Protección de Activos y Análisis de Modelos |
| [18 de Enero 2026 — 16:30 PM](#18-de-enero-2026--1630-pm) | Tarde | Localización y Blindaje de Componentes |
| [18 de Enero 2026 — 17:45 PM](#18-de-enero-2026--1745-pm) | Noche | Purga de Sistema Pre-Build |
| [18 de Enero 2026 — 19:15 PM](#18-de-enero-2026--1915-pm) | Noche | Incidencia Timeout TensorFlow |
| [18 de Enero 2026 — 19:45 PM](#18-de-enero-2026--1945-pm) | Noche | Hito: Construcción Exitosa sobre PostgreSQL |
| [18 de Enero 2026 — 20:20 PM](#18-de-enero-2026--2020-pm) | Noche | Construcción Exitosa Backend con PostgreSQL |
| [18 de Enero 2026 — 20:30 PM](#18-de-enero-2026--2030-pm) | Noche | Estabilización Post-Migración |
| [18 de Enero 2026 — 21:10 PM](#18-de-enero-2026--2110-pm) | Noche | Incidencia Timeout `grpcio` |
| [22 de Enero 2026](#22-de-enero-2026) | Única | Implementación de Inteligencia Conversacional |
| [23 de Enero 2026](#23-de-enero-2026) | Única | Saneamiento de Repositorio |
| [24 de Enero 2026 — Plan](#24-de-enero-2026--plan) | Mañana | Integración Robótica Segura — Plan |
| [24 de Enero 2026 — Recuperación](#24-de-enero-2026--recuperación) | Tarde | Recuperación y Robótica |
| [25 de Enero 2026](#25-de-enero-2026) | Única | Análisis de Incidente — White Screen |
| [27 de Enero 2026](#27-de-enero-2026) | Única | Sincronización de Ingeniería — Fase Electrónica |
| [17 de Febrero 2026 — Refactorización](#17-de-febrero-2026--refactorización) | Mañana | Refactorización `AdvancedMathLab` y Consolidación de Rama |
| [17 de Febrero 2026 — Auditoría IA](#17-de-febrero-2026--auditoría-ia) | Tarde | Auditoría Técnica Completa — Por Qué No Predice la IA |
| [17 de Febrero 2026 — Arquitectura](#17-de-febrero-2026--arquitectura-de-ejecución) | Tarde | Decisión de Arquitectura: Desarrollo Local vs Docker |
| [23 de Mayo 2026 — Refactorización Arquitectónica](#23-de-mayo-2026--refactorización-arquitectónica) | Mañana | Validación de Arquitectura Hexagonal y Plan de Refactorización Maestro |
| [23 de Mayo 2026 — Implementación Hexagonal](#23-de-mayo-2026--implementación-hexagonal) | Tarde | Creación de Capas de Dominio, Puertos y Adaptadores para Robótica y Telecom |
| [23 de Mayo 2026 — Saneamiento y Expansión](#23-de-mayo-2026--saneamiento-y-expansión) | Noche | Limpieza de redundancias y migración completa de laboratorios al dominio puro |
| [23 de Mayo 2026 — Evolución IA y Mensajería](#23-de-mayo-2026--evolución-ia-y-mensajería) | Noche | Plan de expansión de Datasets, Notificaciones y Arquitectura de Mensajería |

---

## 16 de Enero 2026

### INFORME DE ANÁLISIS Y PLAN DE ACCIÓN — PROYECTO sigcTiArural

**Fecha:** 16 de Enero de 2026

#### 1. Análisis del Problema

Se ha identificado un error que impide la ejecución del backend de Django. Al ejecutar los comandos `python manage.py migrate` y `python manage.py runserver`, el sistema arroja el siguiente error:

```
ModuleNotFoundError: No module named 'dj_database_url'
```

Este error indica que la librería `dj_database_url`, que es esencial para configurar la conexión a la base de datos de forma dinámica (como se especifica en `src/backend/sigct_backend/settings.py`), no está instalada en el entorno virtual del backend.

El análisis del `git status` también muestra:
- Un archivo modificado: `src/backend/sigct_backend/settings.py`.
- Varios archivos nuevos no rastreados (`analisis_y_plan.md`, `reporte_estructura_proyecto.txt`, etc.).

#### 2. Solución Implementada

1. **Modificación de `src/backend/requirements.txt`**: Se ha actualizado el archivo de dependencias para incluir las librerías necesarias.

```diff
+# ======================================================
+# Base de Datos y Entorno
+# ======================================================
+dj-database-url  # Para leer config de BD desde URL
+psycopg2-binary  # Driver para PostgreSQL
+mysqlclient      # Driver para MySQL
+python-dotenv    # Para leer variables de entorno desde .env
```

- **`dj-database-url`**: Resuelve directamente el error `ModuleNotFoundError`.
- **`psycopg2-binary`** y **`mysqlclient`**: Soporte para PostgreSQL y MySQL.
- **`python-dotenv`**: Gestión de variables de entorno locales desde `.env`.

#### 3. Plan de Acción y Próximos Pasos *(Acción Requerida)*

```bash
# 1. Instalar las dependencias actualizadas
pip install -r src/backend/requirements.txt

# 2. Continuar con la ejecución
python manage.py migrate
python manage.py runserver
```

#### 4. Gestión de Cambios en Git

Todos los cambios serán añadidos al área de *staging* de Git para preparar un nuevo commit que organice el proyecto.

---

**Fecha:** 17 de Enero de 2026

#### 5. Re-Análisis del Proyecto y Ejecución con Docker

##### 5.1. Resumen de la Arquitectura

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React (con Vite) y Tailwind CSS, servido en producción por Nginx |
| **Backend** | Django con Django REST Framework |
| **Servicio de IA** | FastAPI con TensorFlow, incluyendo capacidades de procesamiento de audio |
| **Orquestación** | Docker + `docker-compose.yml` |

##### 5.2. Problemas Identificados y Soluciones Aplicadas

1. **Error de Mapeo de Puertos en Frontend:** Corregido el mapeo a `"5173:80"` en `docker-compose.yml`.
2. **Dependencias Innecesarias en Backend:** `requirements.txt` del backend contenía TensorFlow y FastAPI. Planificada limpieza futura.

##### 5.3. Próximos Pasos

1. Levantar todo el entorno utilizando Docker Compose.
2. Realizar pruebas de comunicación entre frontend, backend y servicio de IA.
3. Refactorizar `src/backend/requirements.txt`.

---

**Fecha:** Sábado, 17 de Enero de 2026 — 04:22 p.m.

#### 6. Diagnóstico y Corrección del Despliegue con Docker

##### 6.1. Análisis del Error

```
ERROR: Could not install packages due to an OSError: [Errno 5] Input/output error
target backend: failed to receive status: rpc error: code = Unavailable desc = error reading from server: EOF
```

**Causa raíz:** `requirements.txt` del backend contenía `tensorflow` y otras dependencias del servicio de IA, provocando que Docker intentara instalarlas dos veces hasta colapsar el sistema.

##### 6.2. Solución Aplicada

Se eliminó `tensorflow` y todas las librerías no relacionadas con Django de `src/backend/requirements.txt`.

##### 6.3. Verificación de la Solución

```bash
docker-compose up -d --build
```

> **Nota:** La opción `--build` es fundamental para que Docker reconstruya los contenedores con los cambios aplicados.

#### 7. Plan de Ejecución Manual (Alternativa a Docker)

> **Requisito Previo:** Python y Node.js instalados en el sistema.

**Terminal 1 — Backend (Django):**
```bash
cd src/backend
python -m venv venv && source venv/Scripts/activate
pip install -r requirements.txt
python manage.py runserver
```

**Terminal 2 — Servicio de IA (FastAPI):**
```bash
cd src/ai_models
python -m venv venv && source venv/Scripts/activate
pip install -r requirements.txt
uvicorn fastapi_app:app --host 0.0.0.0 --port 8081 --reload
```

**Terminal 3 — Frontend (React):**
```bash
cd src/frontend
npm install
npm run dev
```

Aplicación disponible en `http://localhost:5173`.

#### 8. Próximos Pasos Consolidados

1. Ejecutar `docker-compose up -d --build` para validar la corrección.
2. Realizar pruebas de funcionalidad completa.
3. Planificar la migración de MySQL a PostgreSQL.

---

### 🟢 Control de Estabilidad — 18 de Enero 2026

| Área | Estado |
|------|--------|
| **Infraestructura** | Docker Desktop operativo con WSL2 compactado |
| **Servicios** | Los 4 contenedores (DB, AI, Backend, Frontend) en estado 'Running' |
| **Red** | Acceso confirmado al Dashboard. Puerto MySQL 3307 operativo |
| **Ajuste de Proyecto** | Confirmada arquitectura de 3 nodos (BBB) para el piloto |

### 🤖 Evolución de IA: Asistente con Contexto de Nodos

| Ítem | Detalle |
|------|---------|
| **Estado Actual** | Asistente de voz limitado a respuestas estáticas y bloqueado por hardware en Docker |
| **Objetivo** | Migrar la captura de audio al Frontend y conectar el motor de respuesta a un LLM con acceso a la telemetría de los 3 nodos BBB |
| **Arquitectura** | Puente de datos entre Django (Base de Datos) y FastAPI (Motor IA) |

---

## 18 de Enero 2026 — 09:00 AM

*(Sesión registrada como "Auditoría Forense y .gitignore" — ver detalles en la sesión de 13:45 PM)*

---

## 18 de Enero 2026 — 13:45 PM

### 🟢 SESIÓN: Rescate de Infraestructura y Compactación de Disco

| Campo | Valor |
|-------|-------|
| **Autor** | Bernardo Adolfo Gómez Montoya |
| **Rama** | `rescue/ia-voz-completa` |

#### 1. Resumen de Acciones Realizadas

**A. Limpieza y Recuperación de Espacio (Docker)**

- `docker system prune -f` y `docker builder prune -a -f`.
- El disco virtual (`ext4.vhdx`) había consumido los 19GB disponibles, impidiendo nuevas capas de IA.
- **No afectó el código fuente.**

**B. Compactación Física del Disco Virtual (WSL2)**

1. Cierre total de Docker Desktop y `wsl --shutdown`.
2. Vdisk: `C:\Users\bagm2\AppData\Local\Docker\wsl\main\ext4.vhdx`.
3. Comandos: `attach vdisk readonly` → `compact vdisk` → `detach vdisk`.

**C. Resolución de Conflictos de Red**

- Puerto de MySQL re-mapeado de `3306:3306` a `3307:3306` en `docker-compose.yml`.
- Motivo: Puerto `3306` bloqueado por MySQL nativo en Windows.

#### 2. Análisis Detallado de Estado

| Módulo | Estado | Detalle Técnico |
|--------|--------|-----------------|
| **Infraestructura** | 🟢 ESTABLE | Docker operativo. Puerto 3307 libre. Disco con 19GB libres. |
| **Frontend** | 🟡 EN CONSTRUCCIÓN | Dashboard funcional. Pendiente migrar captura de voz al navegador. |
| **Backend (Django)** | 🟢 COMPLETADO | Conexión a DB corregida. API REST operativa. |
| **IA Service** | 🔴 CRÍTICO | Requiere `ffmpeg` para procesar audio WebM. Pendiente actualización de Dockerfile. |
| **Nodos (3xBBB)** | 🟡 DISEÑO | Arquitectura reducida de 7 a 3 nodos para el piloto. |

#### 3. Script de Auditoría de Estructura — `SIGC&T-Status.py`

```python
import os

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

    print("\n--- ESTADO DE GIT ---")
    os.system("git branch --show-current")

if __name__ == "__main__":
    check_project_status()
```

#### 4. Comandos Utilizados

```bash
docker system prune -f
docker builder prune -a -f
ls -lh ~/AppData/Local/Docker/wsl/main/ext4.vhdx
git rm -r --cached .
git add .
```

#### 5. Lo Que Hace Falta (Plan de Acción)

- **Commit de Estabilización:** `git add .` para que Git reconozca archivos en sus nuevas rutas.
- **Inyección de IA:** Actualizar Dockerfile de IA con `ffmpeg`.
- **Puente de Datos:** Conectar la IA con `src/backend/api/models.py`.
- **Nota:** No se han realizado merges. El trabajo continúa en `rescue/ia-voz-completa` para proteger el código maestro.

---

## 18 de Enero 2026 — 14:30 PM

### 🟢 SESIÓN: Rescate de Infraestructura y Saneamiento de Git

| Campo | Valor |
|-------|-------|
| **Autor** | Bernardo Adolfo Gómez Montoya |
| **Rama** | `rescue/ia-voz-completa` |

#### 1. Resumen de Acciones Realizadas

**A. Saneamiento del Índice de Git (.gitignore)**

- Se restauró el `.gitignore` profesional y se ejecutó `git rm -r --cached .`.
- Git rastreaba `node_modules`, `venv`, `__pycache__`, `backups/`, `_local_docs_backup/`, inflando el repositorio.
- **No borró archivos físicos**; ahora están "Untracked" listos para ser añadidos limpiamente.

**B. Recuperación de Espacio:** Recuperación de **13.22 GB internos** y estabilización del host con 19 GB libres.

**C. Resolución de Conflictos de Puerto:** `docker-compose.yml` de `3306:3306` a `3307:3306`.

#### 2. Análisis Detallado de Estado

| Módulo | Estado | Detalle Técnico |
|--------|--------|-----------------|
| **Infraestructura** | 🟢 ESTABLE | Docker Desktop operativo. Contenedores corriendo con 19GB de margen. |
| **Repositorio** | 🟡 SANEANDO | Índice limpio. Pendiente `git add` selectivo. |
| **Frontend** | 🟢 FUNCIONAL | Dashboard visible en puerto 5173. Router validado en `App.jsx`. |
| **IA Service** | 🔴 CRÍTICO | Pendiente build con `ffmpeg`. |
| **Base de Datos** | 🟢 ESTABLE | Corriendo en puerto 3307. Volumen `mysql_data` persistente. |

#### 3. Script de Auditoría — `SIGC&T-Status.py` (v2)

```python
import os
from pathlib import Path

def check_project_status():
    print("--- 🔍 AUDITORÍA DE ESTRUCTURA SIGC&T RURAL ---")
    
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

    ignored_dirs = ["node_modules", "venv", "backups", "__pycache__"]
    print("\n--- 🛡️ VERIFICACIÓN DE LIMPIEZA ---")
    for d in ignored_dirs:
        found = list(Path(".").rglob(d))
        if found:
            print(f"[!] {d:<15} detectado en {len(found)} ubicaciones (Correcto: Ignorado por git)")

if __name__ == "__main__":
    check_project_status()
```

#### 4. Comandos de Saneamiento

```bash
git rm -r --cached .
git add .
# git add . ahora respeta el nuevo .gitignore y no subirá basura

wsl --shutdown
diskpart > select vdisk file="..." > compact vdisk
```

#### 5. Pendientes

- **Commit Limpio:** `git commit -m "infra: saneamiento de repositorio y corrección de puertos"`.
- **Inyección de Audio:** Reconstruir `ai_service` con Dockerfile + FFmpeg.
- **Inteligencia Real:** Conectar `fastapi_app.py` con modelos de Django.

> 🛠️ **Sobre los archivos "deleted" en `git status`:** No hay que preocuparse. Git indica que los archivos salieron de su índice de seguimiento antiguo. Con el `.gitignore` correcto ya en su lugar, basta con `git add .` para re-indexarlos limpiamente.

---

## 18 de Enero 2026 — 15:15 PM

### 🔵 SESIÓN: Protección de Activos y Análisis de Modelos

| Campo | Valor |
|-------|-------|
| **Autor** | Bernardo Adolfo Gómez Montoya |
| **Rama** | `rescue/ia-voz-completa` |

- `docs/reports/` e `INFORME_ANALISIS_Y_PLAN_DE_ACCION.md` confirmados fuera del radar de Git.
- Archivo `src/backend/api/models.py` analizado: entidad `SensorReading` (ID, Temp, Hum, Timestamp) detectada.
- Estrategia: La IA consumirá estas lecturas para generar respuestas contextuales ("Inteligencia Real" vs "Asistente Estático").
- `git add .` global ejecutado; archivos 'deleted' re-indexados correctamente.

---

## 18 de Enero 2026 — 16:30 PM

### 🗺️ SESIÓN: Localización y Blindaje de Componentes Críticos

#### Archivos Identificados para Modificación

| # | Archivo | Acción |
|---|---------|--------|
| 1 | `src/ai_models/Dockerfile` | Inserción de dependencias binarias (ffmpeg) |
| 2 | `src/ai_models/requirements.txt` | Inserción de conectores de datos y audio |
| 3 | `src/ai_models/fastapi_app.py` | Reescritura del endpoint de voz para integración con modelos de Django |

- Reportes de `docs/reports/` y la bitácora maestra excluidos de cualquier operación de `git push`.
- Cambios mantenidos en la rama `rescue/ia-voz-completa` de forma aislada.

---

## 18 de Enero 2026 — 17:45 PM

### ⚠️ SESIÓN: Purga de Sistema Pre-Build

| Campo | Valor |
|-------|-------|
| **Estado Crítico de Disco** | 16 GB disponibles en Host |
| **Acción** | Purga total de sistema (`prune -a`) para asegurar margen durante la instalación de TensorFlow y Postgres |
| **Observación Técnica** | Se identifica comportamiento de expansión dinámica de WSL2 (`.vhdx`) como causa de la discrepancia en el Explorador de Windows |

---

## 18 de Enero 2026 — 19:15 PM

### ⚠️ SESIÓN: Incidencia Timeout TensorFlow

| Campo | Valor |
|-------|-------|
| **Incidencia** | `ReadTimeoutError` durante la instalación de TensorFlow (620MB) en `ai_service` |
| **Diagnóstico** | Agotamiento de tiempo de respuesta de `pip` |
| **Acción** | Reintento con incremento de timeout en el gestor de paquetes |

**Estado de Infraestructura:**

| Servicio | Estado |
|----------|--------|
| `sigct_db` (Postgres) | ✅ Pulled & Ready |
| `sigct_backend` | ✅ Built |
| `sigct_frontend` | ✅ Built |

---

## 18 de Enero 2026 — 19:45 PM

### 🏆 SESIÓN: Hito — Construcción Exitosa sobre PostgreSQL

#### ✅ Logros Técnicos

- **AI Service:** Imagen construida con TensorFlow (620MB) y FFmpeg tras superar errores de Timeout.
- **Base de Datos:** Migración física de MySQL a PostgreSQL 15 completada en Docker.
- **Soporte Dual:** IA y Backend capaces de detectar entornos Docker y locales automáticamente.
- Proceso finalizado exitosamente con 16 GB de margen, optimizando el uso interno del VHDX de WSL2.

---

## 18 de Enero 2026 — 20:20 PM

### ✅ SESIÓN: Construcción Exitosa Backend con PostgreSQL

| Hito | Construcción exitosa de la imagen Backend con soporte nativo para PostgreSQL |
|------|-----------------------------------------------------------------------------|
| **Resolución** | Se eliminó la dependencia conflictiva `mysqlclient` y se restauró la conectividad con los repositorios de Debian |

| Servicio | Estado |
|----------|--------|
| Backend | Operativo (Django + Psycopg2) |
| DB | Operativa (PostgreSQL 15) |
| IA | Construida y en espera de integración con LLM |

---

## 18 de Enero 2026 — 20:30 PM

### 🛠️ SESIÓN: Estabilización Post-Migración

| Campo | Valor |
|-------|-------|
| **Incidencia** | Errores de ruteo 404 en Frontend y falta de respuesta en AI Service post-migración |
| **Diagnóstico** | Desconexión entre contenedores por falta de archivos estáticos y ruteo Nginx mal configurado |
| **Acción Realizada** | Inyección de datos semilla en PostgreSQL (`api_sensorreading`) |
| **Plan de Mejora** | Integración de API de inferencia LLM para transformar respuestas estáticas en consejos técnicos agroindustriales |

---

## 18 de Enero 2026 — 21:10 PM

### ⚠️ SESIÓN: Incidencia Timeout `grpcio`

| Campo | Valor |
|-------|-------|
| **Incidencia** | `ReadTimeoutError` persistente en el paquete `grpcio` del AI Service |
| **Acción** | Incremento del parámetro `--default-timeout` a `1000s` en el Dockerfile |
| **Estado de Red** | Forzando modo `--network=host` para estabilizar la descarga de librerías pesadas |

---

## 22 de Enero 2026

### 🟢 SESIÓN: Implementación de Inteligencia Conversacional

| Campo | Valor |
|-------|-------|
| **Autor** | Bernardo Adolfo Gómez Montoya |
| **Rama** | `feature/ia-voz-inteligente-2026` |

#### 1. Diagnóstico de "Funcionamiento Incorrecto"

- **Amnesia Total:** La IA no tenía memoria entre frases — sin contexto de conversación.
- **Lógica Rígida:** Solo respondía a palabras clave exactas.

#### 2. Plan de Acción: Inyección de Contexto (Context Injection)

**Estrategia — Memoria de Corto Plazo:**

1. **Clase `ConversationMemory`:** Singleton para almacenar el estado de la última interacción.
2. **Contexto de Datos:** Últimos valores de sensores guardados para responder preguntas de seguimiento.
3. **Manejo de Ambigüedad:** Si el usuario dice "¿Y la humedad?", la IA sabrá el nodo al que se refiere.

**Cambios aplicados en `src/ai_models/fastapi_app.py`:**
- Variable global `SESSION_CONTEXT`.
- Parser mejorado para detectar intenciones secundarias ("evaluación", "repetición").

#### 3. Cierre de Fase: IA de Voz Inteligente

**Estado:** ✅ Estable y Sincronizado en GitHub

Se ha completado el ciclo de desarrollo de la IA de voz con:
- Conexión robusta a base de datos (Docker / Local).
- Captura de audio compatible con múltiples navegadores.
- Memoria contextual para conversaciones fluidas.
- Datasets locales (`data/`) ignorados en Git para no saturar el control de versiones.

---

## 🚀 Nueva Fase: Integración de Laboratorios (SENA 2026)

**Objetivo General:** Integrar los subsistemas físicos (Robótica) con la plataforma de software (SIGC&T Rural), con telemetría y control bidireccionalmente.

| Rama Origen | Rama Nueva |
|-------------|------------|
| `feature/ia-voz-inteligente-2026` | `feature/laboratorios-integracion-2026` |

**Plan de Ejecución — Laboratorio de Robótica (Fase 1):**

1. **Definición de Interfaces:** Contratos de datos (JSON) y endpoints en FastAPI para telemetría.
2. **Integración de Telemetría:** Hardware ESP32/Arduino. Protocolo: MQTT o HTTP Post.
3. **Control por Voz:** *"Activar riego en sector 1"* → Comando al Robot.

---

## 23 de Enero 2026

### 🧹 SESIÓN: Saneamiento de Repositorio

| Campo | Valor |
|-------|-------|
| **Autor** | Bernardo Adolfo Gómez Montoya |
| **Rama Activa** | `feature/laboratorios-integracion-2026` |

#### 1. Acción de Limpieza Profunda

- **Fusión (Merge):** `feature/ia-voz-inteligente-2026` fusionada en `main`.
- **Eliminación:** Ramas antiguas (`feature/asistente-voz`, `docs/cleanup-masterdoc`, etc.) borradas.
- **Unificación:** Ahora existe una **ÚNICA** rama de desarrollo activa: `feature/laboratorios-integracion-2026`.

| Rama | Estado |
|------|--------|
| **Main** | Contiene la versión estable de la IA de Voz |
| **Laboratorios** | Rama actual de trabajo — todo cambio futuro se hará **SOLO** aquí |

---

## 24 de Enero 2026 — Plan

### INFORME: Integración Robótica Segura — Plan de Acción

**Fecha:** 24 de Enero 2026 | **Autor:** Bernardo Adolfo Gómez Montoya

#### 1. Análisis de Situación Actual

| Componente | Estado | Detalle |
|-----------|--------|---------|
| **Dashboard** | ✅ Restaurado | Todas las tarjetas visibles |
| **Backend** | ✅ Implementado | Modelos `Robot`, `RobotTelemetry`, `RobotCommand` implementados — NO integrados al frontend aún |
| **Frontend** | ⚠️ Aislado | `RoboticsLab.jsx` en modo "standalone" con datos simulados |
| **Docker** | ✅ Operativo | 10GB recuperados. PostgreSQL operativo |

**Riesgos identificados:** Corrupción de UI al modificar `LabCatalog` o `lab-data.js`, pérdida de datos por reinicios de contenedores, conflictos CORS entre ROSBridge y Backend.

#### 2. Metodología: "Integración Defensiva"

1. **Aislamiento de Cambios:** Todo cambio de Robótica en archivos nuevos o específicos.
2. **Feature Flags:** Frontend degrada suavemente a modo "Simulación" si el backend no responde.
3. **Verificación Incremental:** `curl` + prueba visual ANTES de hacer commit.

#### 3. Plan de Acción Detallado

**Fase 1 — Verificación de Cimientos:**
```bash
curl -I http://localhost:8000/api/health/
curl http://localhost:8000/api/robots/
curl -X POST http://localhost:8000/api/robots/ \
     -H "Content-Type: application/json" \
     -d '{"robot_id": "RBT-TEST-01", "name": "Test Robot", "type": "ground", "status": "active"}'
```

**Fase 2 — Hook Personalizado:** Crear `src/frontend/src/hooks/useRoboticsApi.js` con fetch + manejo de errores. Importarlo en `RoboticsLab.jsx` solo para lectura.

**Fase 3 — Smoke Test:** `http://localhost:5173/lab-robotics` → F12 → verificar ausencia de errores rojos.

#### 4. Comandos de Referencia

```bash
git add src/backend/api/
git commit -m "feat(backend): Verify robotics API endpoints"

git add src/frontend/src/hooks/
git commit -m "feat(frontend): Add useRoboticsApi hook for safe integration"

# Recuperación de emergencia
git restore src/frontend/src/labs/RoboticsLab.jsx
docker-compose up -d --build --force-recreate --no-deps frontend
```

---

## 24 de Enero 2026 — Recuperación

### INFORME: Recuperación y Robótica

**Rama:** `feature/laboratorios-integracion-2026` | **Estado:** RECUPERADO / EN PROCESO DE INTEGRACIÓN

#### 1. Incidente Crítico — Dashboard y .gitignore

##### 🚨 El Problema

Desaparecieron tarjetas de laboratorios del Dashboard (Telecomunicaciones, Agricultura, Cursos, etc.).

**Causa Raíz:**
1. Regla `data/` en `.gitignore` ignoraba accidentalmente `src/frontend/src/data/` donde reside `lab-data.js`.
2. Al no estar rastreado por Git, un reset accidental eliminó el contenido del archivo.

##### ✅ Acciones de Recuperación

| Acción | Detalle |
|--------|---------|
| **Corrección `.gitignore`** | `data/` → `/data/` (solo ignora la raíz del proyecto) |
| **Restauración `lab-data.js`** | Reconstruido con las 11 categorías, colores NEÓN e iconos originales |
| **Limpieza Docker** | 10GB+ liberados (`docker system prune -f` + compactación WSL2) |

#### 2. Plan de Acción: Integración Laboratorio de Robótica

**Metodología — Simulation-First:**

| Pilar | Descripción |
|-------|-------------|
| **Gemelo Digital primero** | Scripts de física antes de conectar robots reales |
| **Backend como Fuente de Verdad** | Estado del robot en Django/PostgreSQL, no en el frontend |
| **Visualización Reactiva** | Frontend solo escucha y renderiza |

**Pasos Técnicos Realizados:**

| Módulo | Componente | Estado |
|--------|-----------|--------|
| Backend | Modelos `Robot`, `RobotTelemetry`, `RobotCommand` + endpoint `/api/robot-telemetry/` | ✅ |
| Script | `scripts/physics_sim.py` — Trayectoria helicoidal + batería realista | ✅ |
| Frontend | Librerías `three`, `@react-three/fiber`, `@react-three/drei` | ✅ |
| Frontend | `Telemetry3DScene.jsx` — Esfera 3D + estela + HUD de telemetría | ✅ |

```bash
# Restauración de entorno
docker-compose down && docker-compose build frontend && docker-compose up -d

# Ejecución de simulación (mantener abierto mientras se prueba el dashboard)
python scripts/physics_sim.py
```

---

## 25 de Enero 2026

### INFORME: Análisis de Incidente — White Screen of Death

**Incidente:** Bloqueo total del Dashboard, pérdida de visibilidad de componentes.

#### 1. Análisis de Causa Raíz

- **Síntoma:** `Uncaught TypeError: Cannot read properties of undefined (reading 's')`.
- **Diagnóstico:** Error en `Telemetry3DScene` con `@react-three/drei` / `three.js` provocó fallo en cascada que desmontaba toda la aplicación React.
- **Factor Contribuyente:** Conflicto de versiones `react@18` vs dependencias de `three` instaladas con `--legacy-peer-deps`.

#### 2. Acciones Correctivas

1. **Aislamiento:** `Telemetry3DScene` deshabilitado temporalmente en `RoboticsLab.jsx`.
2. **Verificación de Datos:** `lab-data.js` auditado — 11 categorías intactas.
3. **Limpieza:** `docker system prune -f` + compactación WSL2.

#### 3. Principios Establecidos

- **Append-Only para Docs:** `MASTERDOC.md` es sagrado; solo se adiciona, nunca se borra historial.
- **Verificación Atómica:** No hacer commits hasta verificar visualmente que la aplicación compila y renderiza.
- **Manejo de Ramas:** Características experimentales (motores 3D pesados) deben desarrollarse en ramas aisladas antes de integrarse.

#### 4. Plan de Acción Futuro

1. Estabilizar el Dashboard (prioridad crítica).
2. Investigar compatibilidad de `three.js` en entorno aislado.
3. Reactivar visualización 3D solo con `Lazy Loading` estricto garantizado.

```bash
rm -rf node_modules && npm install
docker logs -f sigct_frontend
```

---

## 27 de Enero 2026

### 🛠️ SESIÓN: Sincronización de Ingeniería — Fase Electrónica

| Campo | Valor |
|-------|-------|
| **Metodología** | Inyección de código No-Destructiva (Append-Only) |
| **Cambio** | Adición de endpoint `/analyze-circuit` para soporte de Gemelo Digital |
| **Integridad** | Se preservan las 333 líneas de lógica de voz, sensores y visión artificial |
| **Verificación** | `wc -l src/ai_models/fastapi_app.py` debe reportar aprox. 365 líneas tras el anexo |

#### 📓 Arquitectura: Dashboard de Electrónica como Gemelo Digital Rural

| Etapa | Descripción |
|-------|-------------|
| **Entrada** | Parámetros físicos (sensores en campo / sliders) |
| **Procesamiento Local** | Simulación en tiempo real (Osciloscopio / Canvas) |
| **Procesamiento de IA** | Microservicio FastAPI (`fastapi_app.py`) analizando topología |
| **Salida / Escalado** | Bridge hacia tarjetas especializadas o motores externos (potencia, FFT, etc.) |

```bash
npm install zustand lucide-react reactflow
curl -X GET http://localhost:8081/health
git commit -m "ARCH: Implementación de arquitectura de tránsito de datos para sigcTiArural"
```

#### 🚀 Próximos Pasos

- **Unificación de la UI:** Reconstruir `ElectronicsLab.jsx` como marco maestro donde las 11 tarjetas puedan "conectarse".
- **Lógica de "Bridge":** Programar botones de "Análisis Superior" para enviar datos a APIs de matemáticas avanzadas o sitios de ingeniería libre.

#### Registro de Mantenimiento — `ext4.vhdx`

| Campo | Valor |
|-------|-------|
| **Incidencia** | `ext4.vhdx` no reduce su tamaño tras el borrado de imágenes |
| **Ruta** | `~/AppData/Local/Docker/wsl/main/ext4.vhdx` |
| **Procedimiento** | `diskpart` → `select vdisk` → `compact vdisk` |
| **Estado** | Infraestructura recuperada para el desarrollo del Dashboard de Ingeniería |

---

*Bernardo Adolfo Gómez Montoya — Líder de Desarrollo, Proyecto SIGC&T Rural*

---

## 17 de Febrero 2026 — Refactorización

### 🟢 SESIÓN: Refactorización de AdvancedMathLab y Consolidación de Rama Feature

| Campo | Valor |
|-------|-------|
| **Autor** | Bernardo Adolfo Gómez Montoya |
| **Rama Activa** | `feature/laboratorios-integracion-2026` |
| **Objetivo Principal** | Refactorizar `AdvancedMathLab.jsx` con Framer Motion y consolidar commits en GitHub de forma segura |

#### 1. Diagnóstico Inicial

```
On branch feature/laboratorios-integracion-2026
Your branch is up to date with 'origin/feature/laboratorios-integracion-2026'.

Changes not staged for commit:
        modified:   src/frontend/package-lock.json
        modified:   src/frontend/package.json
        modified:   src/frontend/src/labs/AdvancedMathLab.jsx

Untracked files:
        src/frontend/src/labs/AdvancedMathLab.backup.jsx
```

| Archivo | Cambio |
|---------|--------|
| `package.json` | +1 línea (`framer-motion` agregada) |
| `package-lock.json` | +49 líneas (actualización automática por npm) |
| `AdvancedMathLab.jsx` | -1723 líneas, +593 netas (refactorización mayor) |
| `AdvancedMathLab.backup.jsx` | Respaldo local — eliminado al final |

#### 2. Instalación de Dependencias

**Intento 1:** ❌ `npm install` → Error ERESOLVE (React 18 vs peer dependency React 19 de `@react-three/drei`)

**Solución:**
```bash
npm install --legacy-peer-deps
# ✅ up to date, audited 500 packages in 3s
```

#### 3. Validación Local

```bash
npm run dev
# VITE v5.4.21  ready in 438 ms  ➜  http://localhost:5174/
```

| Validación | Estado |
|-----------|--------|
| Aplicación React cargó | ✅ |
| `AdvancedMathLab.jsx` renderizó sin errores | ✅ |
| Animaciones Framer Motion funcionan | ✅ |
| Consola del navegador limpia | ✅ |
| Interfaz responsive | ✅ |

#### 4. Consolidación en Git

```bash
git add src/frontend/package.json src/frontend/package-lock.json
git add src/frontend/src/labs/AdvancedMathLab.jsx
git commit -m "feat(labs): Refactor AdvancedMathLab component with framer-motion animations"
git push origin feature/laboratorios-integracion-2026  # ✅ Exitoso
rm src/frontend/src/labs/AdvancedMathLab.backup.jsx
git status
# nothing to commit, working tree clean ✅
```

#### 5. Decisión Estratégica — No Mergear Todavía

**Razón:** Continuar desarrollando todos los laboratorios restantes en la misma rama para hacer un único merge consolidado y seguro a `main`.

| # | Laboratorio Pendiente |
|---|----------------------|
| 1 | Physics Lab |
| 2 | Chemistry Lab |
| 3 | Integración IA / Voice Assistant |
| 4 | Testing comprehensivo |
| **5** | **Merge único a `main`** |

#### 6. Comandos de Referencia para Futuras Sesiones

```bash
# Arranque
cd src/frontend && npm install --legacy-peer-deps && npm run dev

# Guardar cambios
git add <archivos>
git commit -m "descripcion coherente"
git push origin feature/laboratorios-integracion-2026

# Rollback sin perder cambios
git reset --soft HEAD~1

# Rollback descartando cambios
git reset --hard HEAD
```

---

## 17 de Febrero 2026 — Auditoría IA

### 🔍 AUDITORÍA TÉCNICA COMPLETA: Por Qué No Predice la IA

**Estado:** Crítico — Diagnóstico y Plan de Corrección

#### 1. Inventario — Lo que SÍ Existe y Está Correcto

| Componente | Ubicación | Estado |
|-----------|-----------|--------|
| **Modelo Entrenado** | `src/ai_models/production_models/plant_disease_mbv2.h5` | ✅ EXISTE |
| **Metadata del Modelo** | `src/ai_models/production_models/model_metadata.json` | ✅ EXISTE |
| **Script de Entrenamiento** | `src/ai_models/train_plant_disease_mobilenet.py` | ✅ EXISTE |
| **API FastAPI Inferencia** | `src/backend/ai_service/fastapi_app.py` | ✅ EXISTE |
| **Endpoint `/infer`** | Línea ~150 en `fastapi_app.py` | ✅ FUNCIONAL |
| **Endpoint `/health`** | Verifica modelo cargado | ✅ FUNCIONAL |
| **Datos Locales** | `data/datasets/plant_disease` (364 MB) | ✅ PROTEGIDO por `.gitignore` |

> ⚠️ **Advertencia:** El script `import_local_dataset.py` en la raíz **elimina los datos de `plant_disease` al ejecutarse**. No ejecutar. Mover a `tools/` o eliminar del repositorio.

#### 2. Mapa de Arquitectura del Repositorio

```
sigcTiArural/
├── src/
│   ├── ai_models/                        [Entrenamiento & Modelos]
│   │   ├── production_models/
│   │   │   ├── plant_disease_mbv2.h5     ✅ Modelo entrenado (MobileNetV2)
│   │   │   └── model_metadata.json       ✅ Clases: ["enferma", "sana"]
│   │   ├── train_plant_disease_mobilenet.py
│   │   ├── fastapi_app.py                (Asistente de voz v2.0)
│   │   └── requirements.txt              TensorFlow, FastAPI, gTTS...
│   │
│   ├── backend/                          [API & Base de Datos]
│   │   ├── ai_service/                   [Servicio de Inferencia]
│   │   │   └── fastapi_app.py            ✅ Endpoint /infer
│   │   ├── api/
│   │   │   ├── models.py                 (Robot, Sensor, Telemetría)
│   │   │   ├── views.py / serializers.py / urls.py
│   │   ├── sigct_backend/                (Django settings)
│   │   └── requirements.txt              Django, DRF, PostgreSQL
│   │
│   ├── frontend/                         [React + Vite]
│   │   ├── src/labs/AdvancedMathLab.jsx  ✅ Refactorizado 17-Feb
│   │   └── package.json                  React 18.x, Vite 5.4.21
│   │
│   └── embedded/                         [Edge Computing]
│       ├── bbb_01_gateway/
│       ├── bbb_02_ia_edge/
│       └── bbb_03_sensors/
│
├── data/                                 [LOCAL — NO en GitHub]
│   ├── datasets/
│   │   ├── plant_disease/ (364 MB)       ✅ train/{enferma,sana} + val/{enferma,sana}
│   │   ├── cafe/ cacao/ trigo/ platano/  (vacíos — listos para datos)
│   └── logs/infer_log.jsonl              ✅ Histórico de predicciones
│
├── docker-compose.yml                    ✅ PostgreSQL, Nginx, Servicios
└── .gitignore                            ✅ /data/ no rastreado

❌ Archivos en raíz a limpiar:
   check_tools.py / create_subdirs.sh / run_local_ai.ps1 / run_local_ai.sh
   ⚠️ import_local_dataset.py → PELIGROSO (borra datos de plant_disease)
```

#### 3. Problemas Identificados

##### 🔴 Problema 1 — API devuelve índice de clase, no su nombre

**Código actual (incorrecto):**
```python
preds = model.predict(arr)
top_idx = int(np.argmax(preds))          # Devuelve 0 o 1
confidence = float(np.max(preds))
result = {
    "top_class_index": top_idx,          # ❌ Frontend no sabe si es "sana" o "enferma"
    "confidence": round(confidence, 5),
}
```

##### 🔴 Problema 2 — TensorFlow podría no estar instalado

```bash
python -c "import tensorflow as tf; print(tf.__version__)"
# Si falla → FastAPI devuelve HTTP 503 y /infer no responde
```

##### 🔴 Problema 3 — API FastAPI podría no estar corriendo

```
http://localhost:8081/health   → Debe retornar JSON con estado del modelo
```

##### 🟡 Problema 4 — Inconsistencia de preprocesamiento Training ↔ Inference

| Paso | Escalado |
|------|---------|
| Training | `Rescaling(1./127.5, offset=-1)` → `[-1, 1]` |
| Inference actual | `/255.0` → `[0, 1]` |

El modelo recibe datos con distribución diferente a la que aprendió. Puede funcionar, pero no es óptimo.

#### 4. Correcciones Requeridas

##### Fix 4.1 — Cargar y devolver nombres de clases en `/infer`

**Archivo:** `src/backend/ai_service/fastapi_app.py`

```python
import json
from typing import List

def load_class_names() -> List[str]:
    """Carga nombres de clases desde model_metadata.json."""
    metadata_path = MODELS_DIR / "model_metadata.json"
    if metadata_path.exists():
        try:
            with metadata_path.open(encoding="utf-8") as f:
                return json.load(f).get("classes", ["unknown"])
        except Exception:
            return ["unknown"]
    return ["unknown"]

_CLASS_NAMES = load_class_names()
```

**Modificar respuesta del endpoint `/infer`:**
```python
preds = model.predict(arr)[0].tolist()
top_idx = int(np.argmax(preds))
confidence = float(np.max(preds))
class_name = _CLASS_NAMES[top_idx] if top_idx < len(_CLASS_NAMES) else "unknown"

result = {
    "model": _MODEL_NAME,
    "top_class_index": top_idx,
    "class_name": class_name,                   # ✅ NUEVO: "sana" o "enferma"
    "confidence": round(confidence, 5),
    "raw": preds,
    "classes": list(enumerate(_CLASS_NAMES))    # ✅ [(0, "enferma"), (1, "sana")]
}
```

**Respuesta esperada después del fix:**
```json
{
  "source": {"type": "upload", "filename": "hoja.jpg"},
  "result": {
    "model": "plant_disease_mbv2.h5",
    "top_class_index": 1,
    "class_name": "sana",
    "confidence": 0.9834,
    "raw": [0.0166, 0.9834],
    "classes": [[0, "enferma"], [1, "sana"]]
  }
}
```

##### Fix 4.2 — Unificar preprocesamiento Training ↔ Inference

```python
def preprocess_image(img: Image.Image, target_size: int = 224) -> np.ndarray:
    """Preprocesa imagen IDÉNTICO al training."""
    img = img.convert("RGB").resize((target_size, target_size))
    arr = np.asarray(img).astype(np.float32)
    arr = (arr / 127.5) - 1.0   # ✅ Training: Rescaling(1./127.5, offset=-1) → [-1, 1]
    return np.expand_dims(arr, axis=0)
```

#### 5. Plan de Verificación y Aplicación

**Fase 1 — Diagnóstico:**
```bash
.\venv\Scripts\Activate.ps1

# Verificar TensorFlow
python -c "import tensorflow as tf; print('TF', tf.__version__)"

# Verificar archivos del modelo
dir src\ai_models\production_models
type src\ai_models\production_models\model_metadata.json

# Iniciar AI Service
cd src\backend\ai_service
uvicorn fastapi_app:app --host 0.0.0.0 --port 8081 --reload

# Health check (otra terminal)
curl http://localhost:8081/health
```

**Fase 2 — Corrección:** Aplicar Fix 4.1 y Fix 4.2 en `fastapi_app.py`.

**Fase 3 — Validación:**
```bash
curl -X POST "http://localhost:8081/infer" -F "file=@ruta/a/imagen.jpg"
# Respuesta debe incluir "class_name" y "confidence"
```

#### 6. Resumen Ejecutivo

| Acción | Impacto | Tiempo Est. | Dificultad |
|--------|---------|-------------|-----------|
| Instalar TensorFlow (si falta) | 🔴 Crítico | 2 min | 🟢 Fácil |
| Fix 4.1: Devolver nombre de clase | 🔴 Crítico | 15 min | 🟢 Fácil |
| Fix 4.2: Unificar preprocesamiento | 🟡 Importante | 10 min | 🟢 Fácil |
| Testing manual de inferencia | 🟡 Importante | 30 min | 🟡 Medio |
| Integración con Frontend | 🔴 Crítico | 2 horas | 🟡 Medio |

**Tiempo total estimado:** 4-5 horas para tener la IA prediciendo correctamente con resultados legibles.

#### 7. Roadmap de IA — Próximas Semanas

| Semana | Tarea |
|--------|-------|
| **Semana 1** | Diagnóstico + Fix 4.1 y 4.2 + testing manual |
| **Semana 2-3** | Datasets de café, cacao, trigo, plátano + nuevos modelos |
| **Semana 4** | Endpoint `/infer-multicrop` + interfaz web completa con histórico |

---

## 17 de Febrero 2026 — Arquitectura de Ejecución

### 🏗️ DECISIÓN TÉCNICA: Desarrollo Local vs Docker Completo

**Contexto:** El proyecto tiene dos modos de ejecución funcionales. En la sesión de hoy se validó y documentó cuál es más conveniente para la etapa actual de desarrollo activo de laboratorios.

> **Conclusión validada:** La **arquitectura híbrida** (PostgreSQL en Docker + los tres servicios corriendo localmente) es la estrategia óptima para desarrollo. Docker completo ya está operativo y funciona correctamente, pero se reserva para producción o testing de integración completo. No es necesario realizar cambios en la configuración de Docker.

#### 1. Las Dos Opciones Disponibles

##### Opción A — Arquitectura Híbrida ✅ RECOMENDADA PARA DESARROLLO

```
Tu PC Windows
├── Terminal 1: npm run dev (Frontend)          → localhost:5174  ← hot-reload Vite
├── Terminal 2: python manage.py runserver      → localhost:8000  ← hot-reload Django
├── Terminal 3: uvicorn fastapi_app:app         → localhost:8081  ← hot-reload FastAPI
└── Terminal 4: docker-compose up -d db        → localhost:5432  ← PostgreSQL estable
```

**Por qué es la mejor opción durante el desarrollo activo:**

| Ventaja | Detalle |
|---------|---------|
| ✅ Hot-reload instantáneo | Cambio de código → recarga automática en < 1 segundo |
| ✅ Errores transparentes | Visibles directamente en la terminal, sin capas de Docker |
| ✅ Debugging con DevTools | F12 del navegador funciona sin complicaciones |
| ✅ Sin rebuilds | No requiere reconstruir imágenes Docker por cada cambio de código |
| ✅ Iteración ágil | Ideal para desarrollo rápido de laboratorios (Physics, Chemistry, etc.) |

##### Opción B — Docker Completo *(Para Producción o Testing de Integración)*

```
Docker Container 1: PostgreSQL
Docker Container 2: Backend Django   (Gunicorn)
Docker Container 3: AI Service       (Uvicorn)
Docker Container 4: Frontend         (Nginx)
```

**Cuándo usar Docker completo:**
- ✅ Preparando despliegue a producción
- ✅ Reproduciendo un error que solo ocurre en el ambiente Docker
- ✅ Testing de integración completo del stack
- ❌ NO durante desarrollo activo — cada cambio de código exige reconstruir la imagen (~30 segundos de espera)

#### 2. Estado Actual del Docker (Ya Funciona — Sin Cambios Necesarios)

El stack Docker fue construido y probado exitosamente durante las sesiones del 18 de Enero. La configuración en `docker-compose.yml` está operativa y probada. **No hay que modificar nada en Docker** para continuar el desarrollo; simplemente se trabaja con los servicios locales para agilizar el ciclo de cambios.

#### 3. Guía de Arranque — Modo Desarrollo Híbrido

```bash
# Paso 1: Iniciar SOLO la base de datos en Docker
cd C:\Users\bagm2\workspace_toshiba\Clone\sigcTiArural
docker-compose up -d db
docker ps   # Verificar: sigct_db → postgres:15-alpine en estado 'Up'

# Paso 2: Terminal 1 — Frontend (React + Vite)
cd src\frontend
npm install --legacy-peer-deps   # Solo si hay cambios en package.json
npm run dev
# → http://localhost:5174  (hot-reload activo)

# Paso 3: Terminal 2 — Backend (Django)
.\venv\Scripts\Activate.ps1
cd src\backend
python manage.py migrate         # Solo si hay nuevas migraciones
python manage.py runserver 0.0.0.0:8000
# → http://localhost:8000

# Paso 4: Terminal 3 — AI Service (FastAPI)
.\venv\Scripts\Activate.ps1
cd src\backend\ai_service
pip install fastapi uvicorn tensorflow-cpu numpy pillow   # Si no están instaladas
uvicorn fastapi_app:app --port 8081 --reload
# → http://localhost:8081

# Verificación del stack completo
curl http://localhost:5174          # Frontend
curl http://localhost:8000/admin    # Django
curl http://localhost:8081/health   # AI Service
```

#### 4. Flujo de Trabajo con Hot-Reload Activo

| Tipo de Cambio | Acción Requerida | Tiempo |
|---------------|-----------------|--------|
| Editar cualquier `.jsx` | Solo guardar el archivo | < 1 segundo |
| Editar `views.py`, `models.py` Django | Solo guardar el archivo | < 2 segundos |
| Editar `fastapi_app.py` | Solo guardar el archivo | < 2 segundos |
| Agregar tabla nueva a la BD | `python manage.py makemigrations && migrate` | ~5 segundos |
| Cambio en `docker-compose.yml` | `docker-compose down && up -d db` | ~15 segundos |

#### 5. Comparativa Final

| Aspecto | Desarrollo Híbrido | Docker Completo |
|---------|-------------------|-----------------|
| PostgreSQL | Docker (5432) | Docker (5432) |
| Frontend | `npm run dev` → 5174 | Docker / Nginx → 80 |
| Backend | `runserver` → 8000 | Docker / Gunicorn |
| AI Service | `uvicorn --reload` → 8081 | Docker / Uvicorn |
| Hot-reload | ✅ Sí (< 1 segundo) | ❌ No |
| Velocidad de cambios | ⚡ Inmediata | 🐢 ~30 segundos por rebuild |
| Debugging | ✅ Terminal + DevTools | 🤔 `docker logs -f` |
| **Recomendado para** | **Desarrollo de laboratorios** | **Entrega / Producción** |

---

**Documento Actualizado:** 17 de Febrero 2026
**Estado General:** Sesión completada exitosamente — refactorización validada, auditoría de IA documentada, arquitectura de desarrollo definida
**Próximas Acciones:**
1. Aplicar Fix 4.1 y Fix 4.2 en `src/backend/ai_service/fastapi_app.py`
2. Desarrollar Physics Lab siguiendo el patrón de `AdvancedMathLab`
3. Iniciar con arquitectura híbrida para desarrollo ágil

---

## 23 de Mayo 2026 — Refactorización Arquitectónica

### 🟢 SESIÓN: Validación de Arquitectura Hexagonal y Plan de Refactorización Maestro

1. Validación de la arquitectura actual y detección de cuellos de botella.
2. Diseño de la nueva arquitectura de capas (Domain, Ports, Adapters).
3. Documentar los contratos de datos entre la IA y el nuevo núcleo de dominio.

---

## 23 de Mayo 2026 — Implementación Hexagonal

### 🛠️ SESIÓN: Creación de Capas de Dominio, Puertos y Adaptadores

| Campo | Valor |
|-------|-------|
| **Autor** | Bernardo Adolfo Gómez Montoya |
| **Metodología** | Strangler Fig Pattern (Migración en paralelo) |
| **Estado** | Estructura Base Funcional (v2) |

#### 1. Logros Técnicos Alcanzados

**A. Creación de la Estructura de Carpetas (`src/backend/api/logic/`)**
- `/domain`: Lógica de negocio pura (Python Puro).
- `/ports`: Interfaces que definen contratos de comunicación.
- `/adapters`: Implementaciones concretas (Django ORM, HTTP Requests).

**B. Implementación del Patrón Strategy y Factory**
- Se crearon las estrategias `ProcesadorRobotica` y `ProcesadorTelecomunicaciones`.
- Se implementó `LaboratorioStrategyFactory` para permitir la selección dinámica de laboratorios mediante parámetros de URL (ej: `?tipo=TELECOMUNICACIONES`).

**C. Desacoplamiento de Servicios Externos (IA)**
- Se creó un puerto para el servicio de IA y un adaptador que se comunica con FastAPI.
- **Resiliencia:** Se implementó un mecanismo de *fallback* local que proporciona sugerencias básicas de cultivo si el servicio de IA no está disponible.

#### 2. Verificación de Cero Roturas
- Los endpoints originales `/api/telemetry/history/` siguen operando con el código antiguo.
- Los nuevos endpoints `/api/v2/telemetry/history/` y `/api/v2/ai/crop-advice/` han sido validados exitosamente mediante `curl`.

#### 3. Próximos Pasos
- Migrar el laboratorio de Agricultura al dominio puro.
- Iniciar la limpieza de la carpeta duplicada `src/backend/ai_service/` (rezago técnico).
- Documentar los diagramas de secuencia del nuevo flujo hexagonal.

---

## 23 de Mayo 2026 — Saneamiento y Expansión

### 🧹 SESIÓN: Limpieza de redundancias y migración completa de laboratorios

| Campo | Valor |
|-------|-------|
| **Autor** | Bernardo Adolfo Gómez Montoya |
| **Acción** | Saneamiento de Backend y Finalización de Estrategias |
| **Impacto** | Alta Sanidad del Repositorio |

#### 1. Saneamiento del Repositorio
- **Backup de Seguridad:** Se movió la carpeta redundante `src/backend/ai_service/` a `_deprecated_backups/ai_service_old`.
- **Desvinculación:** Se eliminó `'ai_service'` de `INSTALLED_APPS` en `settings.py` para evitar carga de código obsoleto.

#### 2. Migración de Laboratorios al Dominio (Python Puro)
- **Agricultura + IA:** Implementada en `domain/agricultura.py`. Incluye lógica de estrés hídrico y simulación circadiana.
- **Electrónica:** Implementada en `domain/electronica.py`. Incluye lógica de análisis de topología y gemelo digital.
- **Factoría:** Actualizada para soportar los 4 tipos de laboratorios principales: `ROBOTICA`, `TELECOMUNICACIONES`, `AGRICULTURA`, `ELECTRONICA`.

#### 3. Estado de la Infraestructura
- Todos los servicios Docker están **activos y verificados**.
- La base de datos PostgreSQL está sincronizada y operando con los nuevos adaptadores de persistencia.

#### 4. Próximos Pasos (Cierre de Fase)
- Actualizar diagramas visuales en el `MASTERDOC`.
- Realizar pruebas de carga sobre el adaptador de persistencia.
- Planificar la migración del Frontend para consumir exclusivamente los endpoints `/api/v2/`.

---

## 23 de Mayo 2026 — Evolución IA y Mensajería

### 📡 SESIÓN: Expansión de Inteligencia y Sistema de Notificaciones

| Campo | Valor |
|-------|-------|
| **Autor** | Bernardo Adolfo Gómez Montoya |
| **Tema** | Messaging, Datasets y Notificaciones |
| **Decisión** | Uso de Redis/RabbitMQ para Mensajería |

#### 1. Evolución del Dataset de IA
Se identifica que el uso exclusivo de **PlantVillage** es solo el punto de partida (Línea Base).
- **Limitación Actual:** Clasificación binaria (Sana/Enferma).
- **Plan de Expansión:** Integrar datasets específicos para **Roya del Café**, **Moniliasis del Cacao** y **Tizón del Tomate**.
- **Acción:** Se ha modificado el Dominio (`ProcesadorAgricultura`) para soportar múltiples clases de patógenos. El modelo .h5 debe ser re-entrenado con estas nuevas categorías.

#### 2. Arquitectura de Mensajería y Notificaciones
Se analiza la necesidad de notificar al usuario en tiempo real cuando la IA detecta una anomalía.


- **RabbitMQ (RECOMENDADO):** Ideal para sistemas de microservicios como SIGC&T Rural. Permite una entrega de mensajes fiable y ligera.
- **Redis (ALTERNATIVA LIGHT):** Si el entorno es muy limitado (Edge), Redis Pub/Sub es la opción más rápida y sencilla de implementar.



#### 3. Sistema de Notificaciones (Push/Mobile)
Para que el usuario reciba alertas en el móvil o dashboard:
1. **Frontend:** Uso de **WebSockets** (Django Channels) para alertas instantáneas en el navegador.
2. **Mobile:** Integración con **Firebase Cloud Messaging (FCM)** mediante un nuevo Adaptador Hexagonal.
3. **Trigger:** Cuando el `LaboratorioService` detecta un nivel de estrés "Crítico", dispara una llamada al `NotificationPort`.

#### 4. Implementación Inmediata
- Se ha creado el **`NotificationPort`** en `ports/notifications.py`.
- Se ha creado un **`ConsoleNotificationAdapter`** para pruebas iniciales sin dependencias externas.
- El Dominio de Agricultura ahora es capaz de identificar patógenos específicos (simulados) preparando el camino para el modelo multiclase.

---

## 23 de Mayo 2026 — Cierre de Fase de Reingeniería

### 🏁 CONCLUSIÓN: Transición Exitosa a Arquitectura de Alto Nivel

| Indicador | Estado |
|-------|-------|
| **Arquitectura** | Hexagonal (Puertos y Adaptadores) |
| **Calidad de Código** | Clean Code & SOLID Principles |
| **Resiliencia** | Fallback de IA implementado |
| **Sanidad** | Rezagos eliminados y respaldados |

#### Resumen Final de la Fase
Se ha transformado el backend de un modelo monolítico acoplado a una arquitectura distribuida y modular. El **Dominio** del proyecto (Robótica, Agricultura, Telecom, Electrónica) es ahora independiente de la tecnología, garantizando que el software pueda evolucionar, escalar y migrar sin riesgo de pérdida de lógica de negocio.

**SIGC&T-Rural** cumple ahora con los estándares internacionales de ingeniería de software para proyectos de alto impacto social y tecnológico.

---

*Fin del documento — INFORME_ANALISIS_Y_PLAN_DE_ACCION.md es un documento vivo. Nunca se elimina historial.*


