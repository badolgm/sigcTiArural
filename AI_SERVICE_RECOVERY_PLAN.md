# AI SERVICE RECOVERY PLAN

## Fecha

2026-07-16

## Objetivo

Definir el plan de recuperación controlada del servicio `sigctiarural_ai_service` a partir del diagnóstico consolidado en `AI_SERVICE_FORENSIC_AUDIT.md`, sin implementar todavía cambios ni correcciones.

---

## 1. Base del plan

### Estado confirmado

El diagnóstico forense ya determinó que:

- el servicio falla al arrancar con `ImportError` desde `uvicorn.main`
- la imagen Docker contiene módulos truncados en `0 bytes`
- el problema es de integridad del entorno Python dentro de la imagen
- `fastapi_app.py` no es la causa primaria

### Alcance del plan

Este plan cubre únicamente la recuperación controlada del microservicio IA definido en:

- `docker-compose.yml`
- `src/ai_models/Dockerfile`
- `src/ai_models/requirements.txt`

No cubre modificaciones de:

- backend Django
- frontend React
- AI Context backend integrador
- documentación EIARC

---

## 2. Hipótesis más probable de corrupción de dependencias

### Hipótesis principal

La hipótesis más probable es una **construcción defectuosa de la imagen Docker del AI Service**, en la que la capa de instalación de dependencias Python quedó materialmente corrupta o incompleta, generando archivos de librería en `0 bytes` dentro de `site-packages`.

### Fundamentos de esta hipótesis

1. la metadata de las distribuciones existe:
   - `uvicorn-0.32.0.dist-info`
   - `typing_extensions-4.16.0.dist-info`
2. los módulos reales no están íntegros:
   - `uvicorn/main.py` = `0 bytes`
   - `typing_extensions.py` = `0 bytes`
3. no existe sombra local del paquete en el repositorio:
   - no hay `uvicorn.py`
   - no hay paquete local `uvicorn/`
4. el crash ocurre antes de importar `fastapi_app`

### Mecanismos plausibles dentro de esa hipótesis

Sin reabrir auditoría, el mecanismo más plausible es uno de estos:

1. instalación parcial o corrupta durante `pip install`
2. reutilización de una capa de build local dañada
3. artefacto local de imagen previamente construido con estado inconsistente

### Conclusión operacional

La recuperación debe asumir que la imagen actual no es confiable y que el punto de control correcto no es “reiniciar el contenedor”, sino **reconstruir limpiamente la imagen del servicio y validar la integridad del runtime**.

---

## 3. Plan de recuperación mínimo

### Objetivo

Restablecer operatividad del servicio con el menor número de acciones y sin tocar código fuente.

### Plan mínimo

1. detener y eliminar el contenedor actual del AI Service
2. eliminar la imagen local `sigctiarural-ai_service`
3. reconstruir la imagen desde `src/ai_models/Dockerfile`
4. levantar solo `ai_service`
5. validar integridad del runtime Python
6. validar `/health`
7. validar `/infer`
8. validar consumo funcional desde `AIPredictiva`

### Criterio de éxito del plan mínimo

Se considera exitoso solo si simultáneamente se cumple:

- el contenedor queda `Up`
- `/health` responde `200`
- `/infer` responde sin `ImportError`
- `AIPredictiva` puede completar inferencia oficial

---

## 4. Plan de recuperación ideal

### Objetivo

No solo recuperar el servicio, sino dejar controlada la reincidencia del mismo tipo de fallo.

### Plan ideal

1. ejecutar el plan mínimo completo
2. añadir validaciones de integridad inmediatamente después del build
3. validar imports críticos dentro de la imagen antes del `up`
4. validar carga de modelo y respuesta real de inferencia
5. validar integración del frontend
6. conservar punto de rollback y evidencia de comandos ejecutados

### Qué agrega el plan ideal frente al mínimo

- detección temprana de imagen corrupta
- validación previa a exponer el puerto del servicio
- menor probabilidad de falso cierre operativo

---

## 5. Secuencia exacta de comandos

## 5.1 Secuencia mínima de recuperación

### Paso 1. Verificar estado actual

```bash
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

### Paso 2. Detener el contenedor si estuviera en ejecución

```bash
docker stop sigctiarural_ai_service
```

Si ya está detenido, este paso puede devolver error controlado y continuar.

### Paso 3. Eliminar el contenedor dañado

```bash
docker rm sigctiarural_ai_service
```

### Paso 4. Eliminar la imagen local del AI Service

```bash
docker rmi sigctiarural-ai_service
```

### Paso 5. Reconstruir la imagen sin caché

```bash
docker compose build --no-cache ai_service
```

### Paso 6. Levantar únicamente el servicio IA

```bash
docker compose up -d ai_service
```

### Paso 7. Confirmar que el contenedor quedó arriba

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

### Paso 8. Revisar logs inmediatos

```bash
docker logs --tail 200 sigctiarural_ai_service
```

---

## 5.2 Validación de integridad post-build

Estas validaciones deben ejecutarse antes de dar por recuperado el servicio.

### Validación A. `uvicorn.main.main`

```bash
docker run --rm --entrypoint python sigctiarural-ai_service -c "import uvicorn.main; print(hasattr(uvicorn.main, 'main'))"
```

Resultado esperado:

```text
True
```

### Validación B. `typing_extensions.Sentinel`

```bash
docker run --rm --entrypoint python sigctiarural-ai_service -c "import typing_extensions as te; print(hasattr(te, 'Sentinel'))"
```

Resultado esperado:

```text
True
```

### Validación C. Importación de FastAPI

```bash
docker run --rm --entrypoint python sigctiarural-ai_service -c "import fastapi; import uvicorn; import pydantic; print('ok')"
```

Resultado esperado:

```text
ok
```

### Validación D. Integridad de tamaño de archivos críticos

```bash
docker run --rm --entrypoint sh sigctiarural-ai_service -lc "wc -c /usr/local/lib/python3.11/site-packages/uvicorn/main.py /usr/local/lib/python3.11/site-packages/typing_extensions.py"
```

Resultado esperado:

- ambos archivos con tamaño mayor que `0`

---

## 5.3 Validación funcional posterior

### `/health`

```bash
curl http://localhost:8081/health
```

Resultado esperado:

- `HTTP 200`
- JSON válido
- `status = ok`

### `/infer` con imagen de prueba

```bash
curl -F "file=@src/ai_models/test_leaf.jpg" http://localhost:8081/infer
```

Resultado esperado:

- `HTTP 200`
- JSON válido
- sin `ImportError`
- sin fallo estructural del runtime

### Logs finales

```bash
docker logs --tail 200 sigctiarural_ai_service
```

Resultado esperado:

- arranque normal de `uvicorn`
- sin trazas de importación fallida

---

## 6. Validaciones posteriores requeridas

## 6.1 Validación de `/health`

Debe comprobarse:

1. `HTTP 200`
2. `status = ok`
3. `tensorflow` coherente
4. `voice` coherente
5. `model_loaded` no nulo si el modelo está disponible

## 6.2 Validación de `/infer`

Debe comprobarse:

1. aceptación de `multipart/form-data`
2. inferencia funcional con imagen de prueba del repositorio
3. ausencia de `ImportError`
4. ausencia de fallback por rotura del entorno
5. respuesta JSON estructurada

## 6.3 Validación de `AIPredictiva`

Debe comprobarse:

1. que la vista pueda disparar inferencia sin error de disponibilidad
2. que el flujo oficial use el backend/AI Service sin colapso
3. que no aparezcan errores funcionales de integración
4. que el resultado llegue con contrato usable para el frontend

---

## 7. Plan de validación por capas

### Capa 1. Runtime Python

Validar:

- `uvicorn`
- `typing_extensions`
- `fastapi`
- `pydantic`

### Capa 2. Proceso del contenedor

Validar:

- contenedor `Up`
- `ExitCode != 1`
- logs de arranque normales

### Capa 3. Servicio HTTP

Validar:

- `/health`
- `/infer`

### Capa 4. Integración funcional

Validar:

- `AIPredictiva`

---

## 8. Rollback completo

### Objetivo del rollback

Volver al estado operativo anterior sin introducir cambios de código si la recuperación falla o genera un comportamiento peor.

### Escenarios de rollback

#### Escenario 1. La imagen reconstruida sigue corrupta

Acción:

1. detener el nuevo contenedor
2. eliminar el contenedor nuevo
3. conservar logs y evidencia del intento
4. no promover esa imagen a uso operativo

Comandos:

```bash
docker stop sigctiarural_ai_service
docker rm sigctiarural_ai_service
```

#### Escenario 2. El servicio arranca pero `/health` falla

Acción:

1. detener el contenedor
2. conservar logs
3. volver al estado de servicio detenido hasta aplicar recuperación de siguiente nivel

Comandos:

```bash
docker logs --tail 300 sigctiarural_ai_service
docker stop sigctiarural_ai_service
docker rm sigctiarural_ai_service
```

#### Escenario 3. `/health` funciona pero `/infer` falla

Acción:

1. preservar la imagen como recuperación parcial no promovible
2. detener exposición operativa si la inferencia oficial sigue rota

### Nota importante de rollback

Como el estado actual ya es fallido, el rollback completo no implica volver a una operación sana anterior, sino volver a un punto controlado desde el que no se confunda una recuperación parcial con una recuperación completa.

---

## 9. Riesgos

### Riesgo 1. Falso positivo de recuperación

El contenedor puede quedar `Up` pero seguir roto a nivel de imports o inferencia.

### Riesgo 2. Persistencia de corrupción en build local

Si la causa subyacente está asociada al entorno local de build, una nueva imagen puede volver a salir dañada.

### Riesgo 3. Recuperación incompleta

Corregir solo el arranque de `uvicorn` no garantiza que FastAPI/Pydantic estén sanos.

### Riesgo 4. Servicio sano, modelo no cargado

Incluso recuperando el runtime, todavía debe validarse que el modelo cargue correctamente y que `/infer` no quede en modo degradado.

### Riesgo 5. Ruptura de integración con `AIPredictiva`

Aunque el microservicio recupere `/health` y `/infer`, la integración visible solo se confirma cuando el frontend consume el flujo sin error.

---

## 10. Orden recomendado de ejecución

### Secuencia exacta de recuperación

1. verificar estado actual del contenedor
2. eliminar contenedor fallido
3. eliminar imagen local dañada
4. reconstruir `ai_service` sin caché
5. validar integridad del runtime Python
6. levantar el servicio
7. validar `/health`
8. validar `/infer`
9. validar `AIPredictiva`
10. cerrar el incidente solo si todas las capas pasan

---

## 11. Criterio de cierre del incidente

El incidente solo puede cerrarse si se cumple simultáneamente:

1. el contenedor arranca y permanece `Up`
2. `uvicorn.main.main` existe
3. `typing_extensions.Sentinel` existe
4. FastAPI importa correctamente
5. `/health` responde `200`
6. `/infer` responde funcionalmente
7. `AIPredictiva` puede operar sin error de disponibilidad

Si cualquiera de esos puntos falla, la recuperación debe considerarse incompleta.

---

## 12. Conclusión

La recuperación correcta del AI Service no debe enfocarse en reiniciar el contenedor, sino en **reconstruir de forma controlada y verificar la integridad del runtime Python antes de validar el servicio HTTP**. El plan mínimo permite restaurar el servicio con el menor cambio operativo. El plan ideal añade controles para evitar reincidencia y reducir el riesgo de declarar recuperación cuando la imagen sigue dañada.
