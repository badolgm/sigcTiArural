# AI SERVICE BUILD ROOT CAUSE ANALYSIS

## Fecha

2026-07-16

## Objetivo

Determinar la causa más probable por la cual los archivos:

- `/usr/local/lib/python3.11/site-packages/uvicorn/main.py`
- `/usr/local/lib/python3.11/site-packages/typing_extensions.py`

terminaron en `0 bytes` dentro de la imagen local del servicio `sigctiarural-ai_service`, sin reconstruir, sin corregir y sin repetir la auditoría forense ni el plan de recovery ya existentes.

---

## 1. Resumen ejecutivo

La evidencia disponible apunta a que el problema no fue causado por el código fuente del proyecto ni por un `COPY . .` que sobrescribiera paquetes del sistema. La causa más probable es una **corrupción durante la construcción o materialización local de la capa `pip install` del AI Service**, dejando una instalación Python parcialmente escrita dentro de la imagen.

La hipótesis dominante es:

- **corrupción de la capa local generada por `RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt`**, probablemente asociada al almacenamiento Docker local sobre `overlayfs` y su backing store en el entorno local

La razón principal es que:

1. existen los `dist-info` de los paquetes
2. faltan o están truncados los módulos `.py` críticos
3. los archivos dañados pertenecen a paquetes distintos y no relacionados entre sí
4. no existe en el repositorio un mecanismo evidente que copie archivos hacia `/usr/local/lib/python3.11/site-packages`
5. el `COPY . .` del Dockerfile solo impacta `/app`, no `site-packages`

Diagnóstico probabilístico final:

- **más probable:** corrupción local de la capa de instalación Python durante build
- **segundo más probable:** reutilización de una imagen o capa local previamente dañada
- **menos probable:** problema de dependencias declaradas o incompatibilidad semántica entre paquetes
- **muy poco probable:** sobrescritura por archivos del proyecto

---

## 2. Evidencia considerada

## 2.1 Evidencia ya consolidada en la auditoría forense

Hallazgos confirmados en `AI_SERVICE_FORENSIC_AUDIT.md`:

- `uvicorn/main.py` = `0 bytes`
- `typing_extensions.py` = `0 bytes`
- existen:
  - `uvicorn-0.32.0.dist-info`
  - `typing_extensions-4.16.0.dist-info`
  - `fastapi-0.115.5.dist-info`
  - `pydantic-2.13.4.dist-info`
  - `pydantic_core-2.46.4.dist-info`
- el contenedor falla antes de importar `fastapi_app`
- no se encontró sombra local de `uvicorn`

## 2.2 Dockerfile del AI Service

El build actual en `src/ai_models/Dockerfile` hace:

1. `FROM python:3.11-slim`
2. instalación de paquetes del sistema
3. `COPY requirements.txt .`
4. `RUN pip install --upgrade pip setuptools wheel`
5. `RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt`
6. `COPY . .`

Implicación clave:

- la instalación Python ocurre **antes** del `COPY . .`
- `site-packages` queda bajo `/usr/local/lib/python3.11/site-packages`
- el código del proyecto queda bajo `/app`
- por diseño, `COPY . .` no debería truncar archivos dentro de `/usr/local/lib/python3.11/site-packages`

## 2.3 `.dockerignore`

El archivo `src/ai_models/.dockerignore` solo ignora:

- `venv/`
- `__pycache__/`
- `*.pyc`
- `.pytest_cache/`
- `.env`

Implicación:

- no existe una exclusión que explique instalación parcial de `uvicorn` o `typing_extensions`
- tampoco hay indicio de que se copien artefactos locales de un `venv` sobre la imagen

## 2.4 Historial reciente relevante

`git log` sobre `src/ai_models/Dockerfile`, `src/ai_models/requirements.txt` y `docker-compose.yml` muestra actividad reciente en orquestación y Docker, pero no evidencia de un cambio puntual que explique que dos módulos de `site-packages` queden en `0 bytes`.

Hallazgo importante:

- el commit `c885ced` en esos archivos solo mostró cambio en `docker-compose.yml`, no en `Dockerfile` ni en `requirements.txt`

Implicación:

- el comportamiento corrupto observado no queda bien explicado por una modificación reciente del Dockerfile o del set de dependencias

## 2.5 Motor Docker local

Evidencia local:

- `ServerVersion=29.5.3`
- `Driver=overlayfs`
- `Warnings=null`

Implicación:

- no hay warning directo del daemon
- el almacenamiento usa `overlayfs`, que introduce una capa de persistencia local donde un write incompleto o un layer dañado sí puede materializar archivos truncados aunque el Dockerfile sea correcto

## 2.6 Historia de la imagen construida

La imagen local inspeccionada:

- fue creada el `2026-07-13T05:21:02Z`
- contiene una capa `RUN pip install ...` de gran tamaño
- fue construida con `buildkit`

Implicación:

- la corrupción quedó incorporada a la imagen local resultante del build
- no hay evidencia de que el truncamiento ocurriera después, por un volumen montado o por un `docker compose up`

---

## 3. Qué mecanismo pudo producir archivos de 0 bytes

## 3.1 Mecanismo más probable

El mecanismo más probable es:

- **escritura incompleta o materialización corrupta de archivos dentro de la capa `pip install` durante el build local**, dejando metadata de paquetes correctamente registrada pero algunos módulos físicos truncados en `0 bytes`

Cómo ocurre este patrón:

1. `pip` resuelve e instala el paquete
2. la metadata `dist-info` queda creada
3. durante la extracción, copia o commit de la capa del build, algunos archivos `.py` quedan materializados vacíos
4. la imagen final parece construida, pero el runtime queda corrupto

Este patrón encaja mejor con los hallazgos porque:

- hay múltiples paquetes afectados
- el daño no sigue una lógica de incompatibilidad semántica
- el daño es físico, no lógico
- el código fuente del proyecto no apunta a sobrescritura de esos paths

## 3.2 Mecanismo alternativo plausible

- **reutilización local de una capa o imagen ya dañada**

Si un layer local previo quedó corrupto, el sistema pudo seguir reusándolo como base efectiva del contenedor actual, incluso aunque la configuración del proyecto no haya cambiado de forma relevante.

## 3.3 Mecanismo menos probable

- **descarga corrupta de artefactos desde índice de paquetes**

Esto es menos probable porque:

1. afectó módulos de paquetes diferentes
2. los `dist-info` quedaron consistentes
3. el daño observado es truncamiento a `0 bytes`, no un archivo sintácticamente inválido o una versión equivocada

## 3.4 Mecanismo muy poco probable

- **sobrescritura por el árbol del proyecto**

Esto es muy improbable porque:

1. no existe `uvicorn.py` local ni paquete `uvicorn/`
2. `typing_extensions.py` no existe como archivo del proyecto
3. `COPY . .` copia a `/app`, no a `/usr/local/lib/python3.11/site-packages`

---

## 4. Probabilidad de cada hipótesis

## 4.1 Hipótesis A. Corrupción local durante la capa `pip install`

### Probabilidad estimada

**Alta: 60%**

### Justificación

- coincide con el punto exacto del Dockerfile donde se crean esos archivos
- explica que existan `dist-info` pero no módulos íntegros
- explica que el problema afecte a más de un paquete
- no requiere asumir bug funcional en el código fuente

## 4.2 Hipótesis B. Reutilización de imagen o capa local previamente dañada

### Probabilidad estimada

**Media: 25%**

### Justificación

- el artefacto local ya está corrupto
- Docker/BuildKit puede reutilizar layers locales si no se fuerzan invalidaciones
- el recovery plan previo ya consideró esta vía como mecanismo plausible

## 4.3 Hipótesis C. Corrupción del backing store Docker local

### Probabilidad estimada

**Media-baja: 10%**

### Justificación

- la presencia de `overlayfs` hace técnicamente posible daño en materialización local
- el patrón de archivos `0 bytes` es compatible con corrupción de almacenamiento
- no hay warning del daemon, por eso no sube a hipótesis dominante aislada

Nota:

- esta hipótesis puede coexistir con A o B; no es totalmente excluyente

## 4.4 Hipótesis D. Artefacto descargado corrupto o bug de `pip`/índice

### Probabilidad estimada

**Baja: 4%**

### Justificación

- no hay evidencia de un incidente upstream
- el patrón observado no parece de resolución de versiones, sino de truncamiento físico

## 4.5 Hipótesis E. Sobrescritura por el código del proyecto o por `COPY . .`

### Probabilidad estimada

**Muy baja: 1%**

### Justificación

- el layout del Dockerfile no lo soporta
- no hay archivos del proyecto que apunten a esos paths

---

## 5. Riesgos de reconstruir sin investigar

Reconstruir sin cerrar la investigación mínima tiene estos riesgos:

### Riesgo 1. Repetir exactamente la misma corrupción

Si el problema está en el almacenamiento local Docker o en una capa dañada, una reconstrucción rápida puede reproducir el fallo.

### Riesgo 2. Falso cierre

Si el contenedor arranca pero otro módulo queda truncado, se puede declarar recuperación prematuramente.

### Riesgo 3. Pérdida de trazabilidad

Si se reconstruye sin conservar evidencia del estado actual, se pierde la posibilidad de confirmar si la corrupción estaba en la imagen, en la caché o en el entorno local.

### Riesgo 4. Recuperación parcial engañosa

Eliminar solo el síntoma visible de `uvicorn.main` no garantiza que el resto de `site-packages` esté sano.

### Riesgo 5. Diagnóstico incompleto del entorno

Si existe problema subyacente en Docker Desktop, overlayfs o backing store WSL2, el incidente puede reincidir más adelante sobre otros servicios.

---

## 6. ¿`build --no-cache` es suficiente?

## 6.1 Respuesta corta

**No es suficiente por sí solo, aunque sí es una medida necesaria dentro del recovery mínimo.**

## 6.2 Por qué no basta

`--no-cache` elimina reutilización de cache de build, pero no elimina por sí mismo:

- una imagen local ya dañada que aún se use como referencia operativa
- un problema del almacenamiento local Docker
- una corrupción del backing store subyacente
- una incidencia transitoria del motor durante escritura de capas

## 6.3 Cuándo sí podría bastar

Podría bastar únicamente si la causa fue:

- una capa cacheada dañada
- o una ejecución puntual fallida del `pip install`

## 6.4 Conclusión operativa

`docker compose build --no-cache ai_service` es **necesario**, pero debe ir acompañado de:

- invalidación del artefacto local previo
- validaciones de integridad post-build
- comprobación explícita de imports críticos antes de dar por sano el servicio

---

## 7. Riesgo de corrupción local del entorno Docker

## 7.1 Evaluación

**Sí existe riesgo, y es material.**

## 7.2 Nivel estimado

**Medio**

## 7.3 Justificación

- el patrón de truncamiento a `0 bytes` es compatible con corrupción local del artefacto construido
- el daño afecta archivos de distintos paquetes
- no hay una explicación mejor en el código fuente o en el Dockerfile

## 7.4 Qué reduce esa probabilidad

- `docker info` no reporta warnings
- no hay evidencia de un fallo generalizado en otros contenedores del proyecto

---

## 8. Riesgo de corrupción de capas

## 8.1 Evaluación

**Sí existe, y es alto para la imagen actual.**

## 8.2 Nivel estimado

**Alto**

## 8.3 Justificación

- la imagen actual ya demuestra una capa inconsistente
- la capa más sospechosa es la de `RUN pip install ...`
- el patrón `dist-info` presente + módulo vacío encaja con corrupción de layer materializado

## 8.4 Conclusión

Aunque no se haya demostrado corrupción del daemon completo, sí hay evidencia suficiente para afirmar **corrupción efectiva del layer de dependencias del artefacto local actual**.

---

## 9. Riesgo asociado a WSL2

## 9.1 Evaluación

**Sí existe riesgo asociado a WSL2 como factor contribuyente, pero no como causa primaria demostrada.**

## 9.2 Nivel estimado

**Bajo a medio**

## 9.3 Justificación

En Docker Desktop sobre Windows, WSL2 suele actuar como backing environment del almacenamiento Linux. Si hubo:

- presión de disco
- inconsistencia del VHDX
- interrupción del daemon
- fallo transitorio del filesystem subyacente

podría explicar corrupción de capas.

## 9.4 Por qué no se clasifica como causa principal

- no se recolectó evidencia directa de error WSL2
- no hay logs del kernel o del daemon que lo confirmen
- por ahora es un factor de riesgo sistémico, no un hallazgo causal cerrado

---

## 10. Validaciones adicionales que deben ejecutarse antes del recovery

Antes de aplicar recovery operativo, deberían ejecutarse estas validaciones de solo diagnóstico:

## 10.1 Validación de integridad de la imagen actual

- listar tamaños de archivos críticos adicionales en `site-packages`
- comprobar si el daño se limita a dos archivos o si hay más módulos truncados

## 10.2 Validación de imagen base y artefacto local

- inspeccionar si otras imágenes Python recientes construidas localmente presentan anomalías similares
- confirmar si el problema es exclusivo de `sigctiarural-ai_service`

## 10.3 Validación de almacenamiento Docker

- revisar estado de `docker system df`
- revisar espacio disponible del backend Docker/WSL2
- revisar eventos o errores recientes del daemon si están accesibles

## 10.4 Validación de consistencia del layer sospechoso

- comparar imports críticos dentro de la imagen actual:
  - `uvicorn.main.main`
  - `typing_extensions.Sentinel`
  - import de `fastapi`
  - import de `pydantic`

## 10.5 Validación de historial operativo

- confirmar si la última imagen funcional del AI Service fue construida con el mismo Dockerfile y mismas versiones
- confirmar si la corrupción apareció después de un rebuild reciente y no después de un cambio de dependencias

## 10.6 Validación del alcance real del daño

- revisar si existen otros archivos `0 bytes` bajo `/usr/local/lib/python3.11/site-packages`
- si aparecen más, aumenta la probabilidad de corrupción de layer o backing store

---

## 11. Señales que confirmarían cada hipótesis

## 11.1 Hipótesis A. Corrupción local durante `pip install`

### Señales confirmatorias

- tras reconstrucción controlada, el problema desaparece completamente
- no reaparece en otros servicios
- no se detectan errores del daemon ni de WSL2
- el build nuevo genera archivos íntegros y tamaños correctos

## 11.2 Hipótesis B. Reutilización de capa o imagen dañada

### Señales confirmatorias

- al eliminar la imagen dañada y forzar `--no-cache`, el problema desaparece
- no se detectan otros síntomas de almacenamiento dañado
- la nueva imagen queda sana sin más intervención

## 11.3 Hipótesis C. Corrupción del almacenamiento Docker local

### Señales confirmatorias

- aparecen más archivos `0 bytes` o truncados en la misma imagen
- otras imágenes locales presentan daño similar
- reaparece el problema incluso tras `--no-cache`
- se detectan errores de almacenamiento, espacio o daemon

## 11.4 Hipótesis D. Riesgo WSL2 subyacente

### Señales confirmatorias

- eventos de error en WSL2 o Docker Desktop
- reincidencia del problema en reconstrucciones limpias
- problemas de lectura/escritura en otras imágenes Linux locales

## 11.5 Hipótesis E. Sobrescritura por el proyecto

### Señales confirmatorias

Serían necesarias señales que hoy no existen, por ejemplo:

- archivos del repositorio con nombre y ruta capaces de invadir `site-packages`
- instrucciones Docker que copien explícitamente sobre `/usr/local/lib/python3.11/site-packages`

Como esas señales no aparecen, esta hipótesis queda prácticamente descartada.

---

## 12. Conclusión final

La causa más probable del build corrupto no está en `fastapi_app.py`, ni en `docker-compose.yml`, ni en un conflicto nominal del proyecto. La evidencia apunta a una **corrupción local de la capa de instalación Python del AI Service durante el build o durante la materialización local de esa capa**, afectando el artefacto Docker final.

Conclusión probabilística consolidada:

- **hipótesis dominante:** corrupción en la capa `pip install` del build local
- **hipótesis secundaria:** reutilización de layer o imagen local ya corrupta
- **hipótesis sistémica posible:** problema de almacenamiento Docker/overlayfs con WSL2 como factor contribuyente
- **hipótesis descartada casi por completo:** sobrescritura desde el árbol del proyecto

Respuesta ejecutiva a los puntos clave:

- mecanismo más probable: truncamiento físico de archivos en la capa `pip install`
- reconstruir sin investigar tiene riesgo de reincidencia y falso cierre
- `--no-cache` es necesario pero no suficiente por sí solo
- sí existe riesgo local de corrupción Docker
- sí existe evidencia de corrupción de capas en la imagen actual
- WSL2 representa riesgo contribuyente, no causa primaria demostrada
- antes del recovery deben ejecutarse validaciones de integridad y alcance del daño

Diagnóstico final:

- **causa más probable del build corrupto:** corrupción local de la capa de dependencias Python del AI Service
- **severidad:** Critical
- **nivel de confianza:** Alto
