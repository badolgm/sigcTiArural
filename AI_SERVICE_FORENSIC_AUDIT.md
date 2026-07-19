# AI SERVICE FORENSIC AUDIT

## Fecha

2026-07-16

## Objetivo

Determinar la causa raíz exacta del fallo de arranque del servicio `sigctiarural_ai_service`, cuya salida registrada es:

```text
ImportError: cannot import name 'main'
from uvicorn.main
```

Este documento es estrictamente forense. No implementa correcciones.

---

## 1. Resumen ejecutivo

### Hallazgo principal

La causa raíz exacta del fallo no está en `fastapi_app.py`, ni en FastAPI como framework, ni en el comando `CMD` como diseño. La causa raíz es una **instalación corrupta de dependencias Python dentro de la imagen Docker del AI Service**.

La evidencia directa muestra que:

- `/usr/local/lib/python3.11/site-packages/uvicorn/main.py` existe pero está en **0 bytes**
- `/usr/local/lib/python3.11/site-packages/typing_extensions.py` existe pero está en **0 bytes**

Consecuencia:

1. el script `/usr/local/bin/uvicorn` intenta ejecutar:

```python
from uvicorn.main import main
```

2. como `uvicorn/main.py` está vacío, `main` no existe
3. el proceso aborta inmediatamente con `ImportError`

### Hallazgo secundario crítico

Aunque se corrigiera solo el problema visible de `uvicorn.main`, la imagen seguiría teniendo un fallo latente adicional:

- `typing_extensions.py` está truncado en `0 bytes`
- por eso FastAPI/Pydantic fallan con:

```text
ImportError: cannot import name 'Sentinel' from 'typing_extensions'
```

Por tanto, el fallo del AI Service es un problema de **integridad del entorno Python dentro de la imagen**, no un error funcional del archivo `fastapi_app.py`.

---

## 2. Evidencia recolectada

### 2.1 Estado del contenedor

Comando:

```bash
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

Resultado relevante:

```text
sigctiarural_ai_service    sigctiarural-ai_service    Exited (1)
```

### 2.2 Logs del fallo

Comando:

```bash
docker logs --tail 120 sigctiarural_ai_service
```

Resultado:

```text
Traceback (most recent call last):
  File "/usr/local/bin/uvicorn", line 3, in <module>
    from uvicorn.main import main
ImportError: cannot import name 'main' from 'uvicorn.main' (/usr/local/lib/python3.11/site-packages/uvicorn/main.py)
```

### 2.3 Comando de arranque real del contenedor

Comando:

```bash
docker inspect sigctiarural_ai_service --format "Name={{.Name}} Status={{.State.Status}} ExitCode={{.State.ExitCode}} StartedAt={{.State.StartedAt}} FinishedAt={{.State.FinishedAt}} Image={{.Config.Image}} Cmd={{json .Config.Cmd}} Entrypoint={{json .Config.Entrypoint}} Restart={{.HostConfig.RestartPolicy.Name}}"
```

Resultado relevante:

```text
Cmd=["uvicorn","fastapi_app:app","--host","0.0.0.0","--port","8081"]
Entrypoint=null
ExitCode=1
Restart=no
```

### 2.4 Revisión del script real `uvicorn`

Comando:

```bash
head -n 20 /usr/local/bin/uvicorn
```

Resultado:

```python
#!/usr/local/bin/python3.11
import sys
from uvicorn.main import main
if __name__ == '__main__':
    sys.argv[0] = sys.argv[0].removesuffix('.exe')
    sys.exit(main())
```

Este script es coherente con el uso normal del ejecutable `uvicorn`. El problema no es el script en sí, sino el módulo de destino.

### 2.5 Validación del módulo `uvicorn.main`

Comando:

```bash
docker run --rm --entrypoint python sigctiarural-ai_service -c "import inspect, uvicorn.main; import uvicorn; print('has_main', hasattr(uvicorn.main,'main')); print('module', uvicorn.main.__file__); print('attrs', [a for a in ('main','run','Server','Config') if hasattr(uvicorn.main,a)])"
```

Resultado:

```text
has_main False
module /usr/local/lib/python3.11/site-packages/uvicorn/main.py
attrs []
```

### 2.6 Verificación forense de tamaño de archivos

Comando:

```bash
wc -c /usr/local/lib/python3.11/site-packages/uvicorn/main.py /usr/local/lib/python3.11/site-packages/typing_extensions.py
```

Resultado:

```text
0 /usr/local/lib/python3.11/site-packages/uvicorn/main.py
0 /usr/local/lib/python3.11/site-packages/typing_extensions.py
0 total
```

Esto confirma truncamiento real de archivos de librería dentro de la imagen.

### 2.7 Evidencia del fallo latente de FastAPI/Pydantic

Comando:

```bash
docker run --rm --entrypoint python sigctiarural-ai_service -c "import sys,uvicorn,fastapi; print('python',sys.version); print('uvicorn', uvicorn.__version__); print('fastapi', fastapi.__version__)"
```

Resultado:

```text
ImportError: cannot import name 'Sentinel' from 'typing_extensions'
```

### 2.8 Estado real de `typing_extensions`

Comando:

```bash
docker run --rm --entrypoint python sigctiarural-ai_service -c "import typing_extensions as te; print('file', te.__file__); print('has_Sentinel', hasattr(te,'Sentinel')); print('version_attr', getattr(te,'__version__',None))"
```

Resultado:

```text
file /usr/local/lib/python3.11/site-packages/typing_extensions.py
has_Sentinel False
version_attr None
```

### 2.9 Metadata encontrada en la imagen

Hallazgos en `site-packages`:

- `fastapi-0.115.5.dist-info`
- `pydantic-2.13.4.dist-info`
- `pydantic_core-2.46.4.dist-info`
- `typing_extensions-4.16.0.dist-info`
- `uvicorn-0.32.0.dist-info`

Esto indica que las distribuciones fueron registradas, pero los módulos reales clave quedaron corruptos o truncados.

---

## 3. Análisis técnico

### 3.1 Versión de `uvicorn` requerida

En `src/ai_models/requirements.txt`:

```text
uvicorn[standard]==0.32.0
```

### 3.2 Versión de `uvicorn` realmente instalada

La imagen contiene:

- `uvicorn-0.32.0.dist-info`

Pero el módulo funcional no está íntegro:

- `uvicorn/main.py` está en `0 bytes`

Conclusión:

- la metadata de versión existe
- la instalación efectiva está dañada

### 3.3 Compatibilidad entre FastAPI, Uvicorn y Python

Según la configuración del repositorio:

- Python base: `python:3.11-slim`
- FastAPI: `0.115.5`
- Uvicorn: `0.32.0`

No aparece evidencia de incompatibilidad estructural entre estas versiones como causa primaria del crash observado.

La incompatibilidad real observada es otra:

- `typing_extensions.py` está corrupto
- eso rompe el stack `fastapi -> pydantic -> pydantic_core`

### 3.4 CMD / ENTRYPOINT

En `src/ai_models/Dockerfile`:

```dockerfile
CMD ["uvicorn", "fastapi_app:app", "--host", "0.0.0.0", "--port", "8081"]
```

Este CMD es válido y esperable para FastAPI.

La falla ocurre antes de que `fastapi_app:app` llegue a importarse.

### 3.5 Conflictos de dependencias

No se encontró evidencia de:

- archivo local `uvicorn.py`
- paquete local que sobrescriba `uvicorn`
- conflicto de nombres en el código fuente del repositorio

Sí se encontró evidencia de **corrupción simultánea en al menos dos módulos instalados**:

- `uvicorn.main`
- `typing_extensions`

### 3.6 Posibles paquetes que sobrescriben `uvicorn`

No se detectó en el repositorio:

- `uvicorn.py`
- paquete local `uvicorn/`
- sombra local en `src/ai_models/`

Conclusión:

El problema no proviene del árbol fuente del proyecto.

### 3.7 Cambios recientes en `fastapi_app.py`

`git diff -- src/ai_models/fastapi_app.py` muestra un cambio reciente en la resolución del directorio del modelo:

- antes: `MODELS_DIR = ROOT_DIR / "src" / "ai_models" / "production_models"`
- ahora: selección entre `CONTAINER_MODELS_DIR` y `REPO_MODELS_DIR`

Este cambio es operativo respecto a la carga del modelo, pero **no es causal del fallo de arranque actual**, porque el proceso se detiene antes de importar `fastapi_app`.

---

## 4. Causa raíz exacta

### Causa raíz exacta

La causa raíz exacta es una **corrupción de la instalación de dependencias Python dentro de la imagen Docker `sigctiarural-ai_service`**, producida en la capa de instalación generada por `src/ai_models/Dockerfile`.

La evidencia crítica es:

- `uvicorn/main.py` = `0 bytes`
- `typing_extensions.py` = `0 bytes`

El fallo visible del arranque ocurre porque:

1. el contenedor ejecuta `/usr/local/bin/uvicorn`
2. ese script hace `from uvicorn.main import main`
3. `uvicorn/main.py` está vacío
4. `main` no existe
5. el proceso aborta con `ImportError`

Adicionalmente, incluso si ese primer fallo no existiera, el servicio seguiría sin poder levantar FastAPI porque `typing_extensions.py` también está truncado y rompe la cadena de importación de Pydantic/FastAPI.

---

## 5. Componente responsable

### Componente responsable primario

La **imagen Docker del AI Service**, específicamente la capa derivada de:

- `src/ai_models/Dockerfile`
- `pip install --default-timeout=1000 --no-cache-dir -r requirements.txt`

### Componente responsable secundario

El estado actual del artefacto Docker local:

- `sigctiarural-ai_service`

### Componente no responsable

No hay evidencia de que el responsable primario sea:

- `fastapi_app.py`
- `docker-compose.yml`
- backend Django
- frontend React

---

## 6. Severidad

### Nivel de severidad

**Critical**

### Justificación

1. el servicio no arranca
2. `/health` no puede responder
3. `/infer` no puede responder
4. `AIPredictiva` y cualquier integración dependiente del servicio quedan degradadas o fallan
5. la corrupción afecta más de una dependencia crítica

---

## 7. Archivos implicados

### Archivos del repositorio

- `docker-compose.yml`
- `src/ai_models/Dockerfile`
- `src/ai_models/requirements.txt`
- `src/ai_models/fastapi_app.py`

### Archivos dentro de la imagen Docker

- `/usr/local/bin/uvicorn`
- `/usr/local/lib/python3.11/site-packages/uvicorn/main.py`
- `/usr/local/lib/python3.11/site-packages/typing_extensions.py`

---

## 8. Corrección mínima recomendada

### Recomendación mínima

Regenerar la imagen del AI Service y forzar reinstalación íntegra de dependencias, validando explícitamente la integridad de:

- `uvicorn.main`
- `typing_extensions.Sentinel`
- importación de `fastapi`

### Justificación

El código de aplicación no es la causa primaria. La reparación mínima debe restaurar un `site-packages` consistente.

---

## 9. Corrección ideal recomendada

### Recomendación ideal

Además de reconstruir la imagen, endurecer el proceso de build con validaciones de integridad posteriores a `pip install`, por ejemplo:

1. verificar imports críticos en build
2. verificar atributos esperados:
   - `uvicorn.main.main`
   - `typing_extensions.Sentinel`
3. validar que `fastapi_app` importa correctamente
4. fallar el build si cualquier módulo crítico está truncado o incompleto

### Objetivo de la corrección ideal

Evitar que una imagen aparentemente construida quede publicada con dependencias corruptas.

---

## 10. Riesgos asociados

### Riesgo 1. Falso cierre si se corrige solo `uvicorn`

Si se corrige solo el primer error visible del log, el contenedor seguirá fallando después al intentar importar FastAPI debido a `typing_extensions.py` truncado.

### Riesgo 2. Repetición del problema al reconstruir

Si la causa subyacente del truncamiento no se controla, la reconstrucción puede volver a generar una imagen dañada.

### Riesgo 3. Validación superficial insuficiente

Levantar solo el contenedor no basta; debe verificarse:

- importación real del app
- `/health`
- `/infer`
- integración con `AIPredictiva`

---

## 11. Validaciones posteriores requeridas

### 11.1 Validación de arranque

- el contenedor `sigctiarural_ai_service` debe quedar `Up`
- no debe salir inmediatamente con `ExitCode=1`

### 11.2 Validación de `/health`

Se requiere:

- `HTTP 200`
- respuesta JSON válida
- `status: ok`
- `tensorflow: true/false` coherente
- `model_loaded` coherente con el modelo disponible

### 11.3 Validación de `/infer`

Se requiere:

- `HTTP 200` o `HTTP 400` funcional si falta archivo
- inferencia real sobre imagen de prueba si el modelo está cargado
- ausencia de `ImportError`
- ausencia de fallback por fallo estructural del runtime

### 11.4 Validación de `AIPredictiva`

Se requiere:

- que la vista pueda invocar el flujo oficial sin error de disponibilidad
- que no quede degradada por caída del AI Service
- que el contrato recibido sea consistente con lo esperado por el backend integrador

---

## 12. Conclusión final

La falla crítica del AI Service no proviene del código de negocio ni de la definición del endpoint FastAPI. La causa raíz exacta es la **corrupción del entorno Python dentro de la imagen Docker**, con al menos dos módulos esenciales truncados en `0 bytes`:

- `uvicorn/main.py`
- `typing_extensions.py`

El error visible:

```text
ImportError: cannot import name 'main' from uvicorn.main
```

es solo la primera manifestación del problema. El servicio tiene un segundo fallo latente igualmente crítico que impediría importar FastAPI/Pydantic incluso si el entrypoint de `uvicorn` quedara resuelto.

Diagnóstico final:

- **causa raíz:** instalación corrupta de dependencias en la imagen del AI Service
- **componente responsable:** build/runtime Docker del microservicio IA
- **severidad:** Critical
- **archivo de aplicación no causal:** `src/ai_models/fastapi_app.py`
