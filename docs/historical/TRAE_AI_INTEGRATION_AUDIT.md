# TRAE AI Integration Audit

## Alcance

Auditoría funcional estática, en modo solo lectura, de:

- `src/frontend/src/pages/AIPredictiva.jsx`
- `src/ai_models/fastapi_app.py`

Objetivo: verificar el contrato real de integración entre el frontend de IA predictiva y el microservicio FastAPI.

## Respuestas directas

### 1. ¿Qué endpoint consume realmente el frontend?

- El frontend consume **`POST http://localhost:8000/infer`**.
- Evidencia:
  - `src/frontend/src/pages/AIPredictiva.jsx:4` define `const API_BASE = 'http://localhost:8000';`
  - `src/frontend/src/pages/AIPredictiva.jsx:129-132` ejecuta `fetch(`${API_BASE}/infer`, { method: 'POST', body: formData })`

### 2. ¿Qué endpoint expone realmente FastAPI?

- FastAPI expone realmente **`POST /infer`**.
- Evidencia:
  - `src/ai_models/fastapi_app.py:206-207`
  - Firma real: `async def infer(file: Optional[UploadFile] = File(default=None))`

### 3. ¿Coinciden?

- **Coinciden solo en la ruta relativa `/infer`, pero no necesariamente en el host/puerto del servicio real.**
- El frontend llama a `localhost:8000`, que normalmente corresponde al backend Django.
- El microservicio FastAPI define la ruta `/infer`, pero este archivo no indica aquí su puerto; en el repo, el servicio de IA se arranca aparte y no forma parte del mismo proceso que `AIPredictiva.jsx`.
- Conclusión funcional:
  - **Ruta:** sí coincide (`/infer`)
  - **Destino real:** **potencialmente no coincide**

### 4. ¿Qué formato devuelve FastAPI?

- FastAPI devuelve **JSON**.
- En la rama exitosa devuelve:

```json
{
  "diagnosis": "class_0 o Tomato_Early_blight",
  "confidence": 0.87,
  "class_index": 0,
  "model": "nombre_modelo_o_mock",
  "processing_time": "0.12s",
  "status": "ok"
}
```

- Evidencia:
  - `src/ai_models/fastapi_app.py:237-244`
- En la rama de excepción devuelve también JSON:

```json
{
  "diagnosis": "Tomato_Early_blight",
  "confidence": 0.5,
  "class_index": 0,
  "model": "fallback",
  "processing_time": "0.12s",
  "status": "error"
}
```

- Evidencia:
  - `src/ai_models/fastapi_app.py:258-265`

### 5. ¿Qué formato espera el frontend?

- El frontend espera:
  - una respuesta **JSON**
  - con al menos estas claves:
    - `diagnosis`
    - `confidence`
- Evidencia:
  - `src/frontend/src/pages/AIPredictiva.jsx:136-139`
  - `setResult(data)`
  - `processDiagnosis(data.diagnosis, data.confidence)`

- Además:
  - el frontend envía `multipart/form-data`
  - con el campo **`file`**
- Evidencia:
  - `src/frontend/src/pages/AIPredictiva.jsx:125-126`

## 6. ¿Existe incompatibilidad?

- **Sí, existe incompatibilidad potencial y también desalineación semántica.**

### 6.1 Compatibilidad de transporte

- **Compatible** en este punto:
  - frontend envía `multipart/form-data`
  - FastAPI espera `file: UploadFile`
- Evidencia:
  - Frontend: `AIPredictiva.jsx:125-132`
  - FastAPI: `fastapi_app.py:206-223`

### 6.2 Incompatibilidad de destino

- **Incompatible o al menos riesgoso**:
  - el frontend llama a `http://localhost:8000/infer`
  - el microservicio FastAPI es un servicio separado
  - si FastAPI no está escuchando exactamente en `8000`, la llamada fallará aunque FastAPI esté levantado en otro puerto

### 6.3 Incompatibilidad semántica de `diagnosis`

- El frontend está optimizado para códigos como:
  - `Tomato_Late_blight`
  - `Tomato_Early_blight`
  - `Tomato_Healthy`
  - `Potato_Early_blight`
- Evidencia:
  - `src/frontend/src/pages/AIPredictiva.jsx:7-39`

- Pero FastAPI, cuando usa modelo real, devuelve:
  - `diagnosis = f"class_{idx}"`
- Evidencia:
  - `src/ai_models/fastapi_app.py:225-230`

- Eso significa que:
  - el frontend **no recibe una clase semántica agrícola**
  - recibe una etiqueta genérica tipo `class_0`
  - y entra en fallback visual con:
    - `plant: 'Cultivo Desconocido'`
    - `disease: rawDiagnosis`
    - recomendación genérica
- Evidencia:
  - `src/frontend/src/pages/AIPredictiva.jsx:99-115`

## 7. ¿La funcionalidad puede fallar aunque ambos servicios estén levantados?

- **Sí, puede fallar aunque ambos servicios estén levantados.**

## Modos de fallo detectados

### A. FastAPI levantado en otro puerto

- Si FastAPI está operativo, pero no en `localhost:8000`, el frontend no lo alcanzará.
- Resultado:
  - entra al `catch`
  - activa simulación local
- Evidencia:
  - `src/frontend/src/pages/AIPredictiva.jsx:129-150`

### B. FastAPI responde bien, pero con clases `class_N`

- Aunque la respuesta sea `200 OK`, el frontend no podrá mapear correctamente la enfermedad.
- Resultado:
  - diagnóstico mostrado como genérico
  - cultivo desconocido
  - recomendación genérica
- Evidencia:
  - Frontend fallback semántico: `AIPredictiva.jsx:101-113`
  - FastAPI clase genérica: `fastapi_app.py:225-230`

### C. Falla silenciosa en UX

- Incluso si la integración HTTP falla, la página **simula éxito** con mock local:
  - `Tomato_Early_blight`
  - `confidence: 0.88`
- Evidencia:
  - `src/frontend/src/pages/AIPredictiva.jsx:141-150`

- Implicación:
  - el usuario puede creer que el sistema está funcionando
  - cuando en realidad está corriendo en modo fallback

## Contrato real observado

### Request real del frontend

- Método: `POST`
- URL: `http://localhost:8000/infer`
- Content-Type: `multipart/form-data`
- Campo: `file`

### Response real de FastAPI

- Content-Type efectivo: JSON
- Campos:
  - `diagnosis`
  - `confidence`
  - `class_index`
  - `model`
  - `processing_time`
  - `status`

## Veredicto final

- **1. Endpoint frontend:** `POST http://localhost:8000/infer`
- **2. Endpoint FastAPI:** `POST /infer`
- **3. ¿Coinciden?:** parcialmente; coincide la ruta, no está garantizado el mismo host/puerto
- **4. Formato FastAPI:** JSON con `diagnosis`, `confidence`, `class_index`, `model`, `processing_time`, `status`
- **5. Formato esperado por frontend:** JSON con `diagnosis` y `confidence`, enviado mediante `multipart/form-data` con campo `file`
- **6. ¿Existe incompatibilidad?:** sí, principalmente de destino y de semántica de `diagnosis`
- **7. ¿Puede fallar aunque ambos estén levantados?:** sí

## Conclusión técnica

- La integración **no es confiable end-to-end** aunque los dos servicios existan.
- El principal problema no es el payload HTTP básico, porque ese sí es compatible.
- Los problemas reales son:
  - **posible puerto/host incorrecto en el frontend**
  - **desalineación semántica entre `class_N` y etiquetas agrícolas esperadas**
  - **fallback del frontend que enmascara fallos reales**
