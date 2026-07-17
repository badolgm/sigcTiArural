# AI SERVICE EXECUTION READINESS

## Fecha

2026-07-16

## Objetivo

Determinar si el proyecto está listo para ejecutar la recuperación real del `AI Service`, usando exclusivamente el estado actual de:

- `docker-compose.yml`
- `src/ai_models/Dockerfile`
- `src/ai_models/requirements.txt`
- estado actual de `git`

Este documento no repite auditorías previas, no reabre la causa raíz y no redefine el recovery plan. Solo evalúa si existe condición de ejecución segura para iniciar la recuperación real.

---

## 1. Resumen ejecutivo

### Decisión final

**NO-GO**

### Motivo principal

No se detecta un bloqueo técnico estructural en `docker-compose.yml`, `Dockerfile` o `requirements.txt` que impida ejecutar recovery. El bloqueo actual es **operacional y de control de cambio**:

- el árbol local tiene cambios sin congelar
- dos de esos cambios impactan directamente el recovery real:
  - `docker-compose.yml`
  - `src/ai_models/fastapi_app.py`

Por lo tanto, ejecutar recovery en este momento sería reconstruir el servicio sobre una baseline local todavía no fijada formalmente.

### Lectura ejecutiva

- **Técnicamente:** casi listo
- **Operacionalmente:** todavía no listo
- **Decisión:** `NO-GO` hasta congelar o respaldar explícitamente la baseline local que se va a usar

---

## 2. Estado revisado

## 2.1 `docker-compose.yml`

Hallazgos relevantes:

- el servicio `ai_service` sigue definido con:
  - `context: ./src/ai_models`
  - `dockerfile: Dockerfile`
  - `container_name: sigctiarural_ai_service`
  - `ports: "${AI_PORT:-8081}:8081"`
  - dependencia de `db` por healthcheck

Lectura:

- la definición es coherente con el recovery plan existente
- no hay un cambio estructural peligroso en la orquestación del servicio
- el cambio local observado en git es parametrización de puertos, no un rediseño del servicio

## 2.2 `src/ai_models/Dockerfile`

Hallazgos relevantes:

- usa `python:3.11-slim`
- instala dependencias del sistema
- instala dependencias Python con:
  - `pip install --upgrade pip setuptools wheel`
  - `pip install --default-timeout=1000 --no-cache-dir -r requirements.txt`
- copia el microservicio a `/app`
- arranca con:
  - `uvicorn fastapi_app:app --host 0.0.0.0 --port 8081`

Lectura:

- el `Dockerfile` es consistente con el recovery plan ya definido
- no presenta un bloqueo nuevo para ejecutar `docker compose build --no-cache ai_service`

## 2.3 `src/ai_models/requirements.txt`

Hallazgos relevantes:

- `fastapi==0.115.5`
- `uvicorn[standard]==0.32.0`
- `tensorflow-cpu>=2.15.0`
- dependencias de voz y conectividad ya conocidas

Lectura:

- el archivo no muestra cambios locales activos en git respecto a lo revisado
- no aparece un bloqueo nuevo de dependencias a nivel de archivo fuente

## 2.4 Estado actual de git

### Cambios modificados rastreados

Se detectaron cambios en:

- `docker-compose.yml`
- `src/ai_models/fastapi_app.py`
- múltiples archivos backend/frontend no directamente parte del build del microservicio IA

### Archivos no rastreados relevantes

Se detectan documentos de diagnóstico y continuidad no versionados, entre ellos:

- `AI_SERVICE_FORENSIC_AUDIT.md`
- `AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`
- `AI_SERVICE_RECOVERY_PLAN.md`
- `SIGCT_RURAL_SYSTEM_BOOT.md`

Lectura:

- los documentos no bloquean el recovery
- el riesgo real está en reconstruir la imagen usando un `fastapi_app.py` local modificado y un `docker-compose.yml` local modificado sin congelación previa

---

## 3. ¿Existe alguna condición bloqueante para ejecutar recovery?

### Respuesta

**Sí. Existe una condición bloqueante operacional.**

### Condición bloqueante identificada

No está congelada formalmente la baseline del recovery que se va a ejecutar.

Esto importa porque:

1. `docker compose build --no-cache ai_service` reconstruirá usando el árbol local actual
2. `src/ai_models/fastapi_app.py` está modificado localmente
3. `docker-compose.yml` está modificado localmente
4. si el recovery sale bien o mal, el resultado quedará mezclado con cambios locales no cerrados formalmente

### Qué no es bloqueante

No se identificó como bloqueante, con la evidencia revisada:

- la estructura del `Dockerfile`
- el contenido actual de `requirements.txt`
- la definición base del servicio `ai_service` en Compose

### Conclusión

El bloqueo no es técnico de infraestructura, sino de **control de ejecución y trazabilidad del baseline**.

---

## 4. ¿Existe algún archivo que deba respaldarse antes?

### Respuesta

**Sí.**

### Archivos que deben respaldarse o congelarse antes del recovery

1. `src/ai_models/fastapi_app.py`
2. `docker-compose.yml`

### Motivo

Son parte directa de la baseline que se usaría en una reconstrucción real:

- `fastapi_app.py` entra al build del microservicio
- `docker-compose.yml` gobierna la ejecución del servicio y sus puertos

### Archivos que conviene preservar como evidencia, aunque no bloquean

1. `AI_SERVICE_FORENSIC_AUDIT.md`
2. `AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`
3. `AI_SERVICE_RECOVERY_PLAN.md`

### Lectura operacional

El respaldo no es para evitar pérdida por `docker rm` o `docker rmi`. Es para asegurar que la baseline del recovery quede explícita y reproducible.

---

## 5. ¿Los cambios actuales en git representan riesgo?

### Respuesta

**Sí, representan riesgo operacional medio.**

### Riesgo 1. Ambigüedad de baseline

Si se ejecuta recovery ahora, no quedará claro si el resultado observado corresponde:

- al recovery del incidente Docker
- o a efectos combinados con cambios locales no congelados

### Riesgo 2. Build sobre código no formalizado

`src/ai_models/fastapi_app.py` tiene un cambio local relevante en resolución de `MODELS_DIR`.

Lectura:

- el cambio parece funcional y alineado con correcciones previas
- pero sigue siendo un cambio local no congelado formalmente

### Riesgo 3. Contaminación de resultado

Si la recuperación falla, el análisis posterior quedará mezclado con:

- el incidente original de imagen corrupta
- la baseline local modificada

### Riesgo 4. Riesgo bajo en cambios no relacionados

Los cambios backend/frontend fuera del AI Service no parecen entrar directamente al build de `ai_service`, por lo que su riesgo sobre el recovery puntual es bajo.

### Conclusión

Los cambios actuales en git **no impiden físicamente** ejecutar recovery, pero **sí reducen la confiabilidad del resultado** si no se congelan antes.

---

## 6. ¿Es seguro ejecutar `docker rm`, `docker rmi`, `docker compose build --no-cache`?

## 6.1 `docker rm`

### Evaluación

**Sí, es seguro a nivel de archivos del repositorio.**

### Alcance real

- elimina contenedor Docker
- no modifica archivos del proyecto
- no altera git

### Riesgo residual

- pérdida del contenedor actual como artefacto de inspección si no se considera suficiente la evidencia ya recolectada

## 6.2 `docker rmi`

### Evaluación

**Sí, es seguro a nivel de árbol git, pero destruye la imagen local dañada.**

### Alcance real

- elimina imagen local Docker
- no modifica archivos del repositorio
- no altera git

### Riesgo residual

- elimina el artefacto exacto que contenía la corrupción, por lo que la evidencia forense debe considerarse ya suficientemente preservada en documentos

## 6.3 `docker compose build --no-cache ai_service`

### Evaluación

**Técnicamente sí, operacionalmente no todavía.**

### Motivo

El comando es seguro respecto al repositorio en el sentido de que no edita archivos. Sin embargo:

- sí consume el estado actual del árbol local
- sí construye usando `fastapi_app.py` modificado
- sí construye usando `docker-compose.yml` modificado

### Conclusión

`docker compose build --no-cache ai_service` es seguro **solo después** de congelar o respaldar la baseline local.

---

## 7. Checklist exacto de pre-ejecución

La ejecución real del recovery no debe empezar hasta completar este checklist:

1. confirmar que la evidencia forense y de recovery ya está preservada:
   - `AI_SERVICE_FORENSIC_AUDIT.md`
   - `AI_SERVICE_BUILD_ROOT_CAUSE_ANALYSIS.md`
   - `AI_SERVICE_RECOVERY_PLAN.md`
2. congelar o respaldar explícitamente:
   - `docker-compose.yml`
   - `src/ai_models/fastapi_app.py`
3. confirmar que el operador acepta reconstruir sobre la baseline local actual
4. confirmar que no se requiere preservar el contenedor o imagen dañada para más análisis
5. verificar que el recovery se ejecutará solo sobre `ai_service`
6. verificar que el objetivo no es cambiar código, sino recuperar runtime
7. confirmar disponibilidad de variables de entorno necesarias para Compose
8. confirmar que la base `db` puede cumplir su `healthcheck`
9. confirmar que el puerto `AI_PORT` esperado no entra en conflicto operativo local
10. confirmar que la salida esperada del recovery será validada contra:
   - integridad Python
   - `/health`
   - `/infer`
   - integración con `AIPredictiva`

---

## 8. Checklist exacto de post-ejecución

Después del recovery real, no debe declararse éxito hasta completar este checklist:

1. verificar que `sigctiarural_ai_service` queda `Up`
2. verificar que no sale con `ExitCode=1`
3. validar `uvicorn.main.main`
4. validar `typing_extensions.Sentinel`
5. validar importación de `fastapi`, `uvicorn` y `pydantic`
6. verificar que archivos críticos en `site-packages` ya no estén en `0 bytes`
7. validar `GET /health`
8. validar que `model_loaded` sea coherente con el modelo disponible
9. validar `POST /infer`
10. revisar logs finales del contenedor
11. validar que `AIPredictiva` no quede degradada por disponibilidad del AI Service
12. registrar si el incidente quedó:
   - resuelto
   - parcialmente resuelto
   - no resuelto

---

## 9. Definición de GO / NO-GO

## 9.1 Definición de GO

Se puede declarar `GO` únicamente si:

1. la baseline local de recovery ya quedó congelada o respaldada
2. el operador acepta reconstruir sobre el `fastapi_app.py` actual
3. no se necesita conservar el contenedor o imagen dañada para más forensia
4. están claras las validaciones post-ejecución

## 9.2 Definición de NO-GO

Se debe declarar `NO-GO` si ocurre cualquiera de estas condiciones:

1. no se ha respaldado o congelado `docker-compose.yml`
2. no se ha respaldado o congelado `src/ai_models/fastapi_app.py`
3. no está aceptado formalmente que el build se hará con cambios locales
4. todavía se quiere conservar imagen o contenedor dañados para inspección adicional
5. no existe capacidad para ejecutar validación post-recovery completa

---

## 10. Decisión final

### Decisión

**NO-GO**

### Justificación final

El proyecto está muy cerca de quedar listo para ejecutar recovery real del `AI Service`, pero todavía no debe iniciarlo porque la baseline local que entrará al build no está congelada formalmente.

Punto exacto que falta para cambiar a `GO`:

- respaldar o congelar `docker-compose.yml`
- respaldar o congelar `src/ai_models/fastapi_app.py`
- aceptar explícitamente que esa baseline es la que se va a reconstruir

### Cambio de estado esperado

Una vez completado ese control previo, la decisión puede cambiar de:

- `NO-GO`

a:

- `GO`

sin necesidad de reabrir auditoría, root cause ni recovery plan.
