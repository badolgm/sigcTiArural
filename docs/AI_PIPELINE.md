# Pipeline de IA para Diagnóstico de Enfermedades de Plantas (SIGC&T Rural)

Este documento resume un flujo gratuito y replicable para **entrenar** y **servir** modelos de IA con datos reales, usando recursos abiertos.

## Objetivos
- Generar diagnósticos reales a partir de imágenes (sin inventar resultados).
- Usar datasets y modelos abiertos cuando sea posible (p.ej., PlantVillage).
- Facilitar la investigación, documentación y crecimiento de la comunidad.

## Componentes
- **Dataset**: PlantVillage (y otros), disponible en GitHub/Kaggle.
- **Almacenamiento**: Local, IPFS (Kubo), o MinIO (S3-compatible).
- **Entrenamiento**: TensorFlow/Keras; notebooks en `src/ai_models/notebooks`.
- **Inferencia**: Microservicio FastAPI (`src/ai_models/fastapi_app.py`).
- **Frontend**: Página de prueba `AIPredictiva` para enviar imágenes y ver resultados.

## Cómo ejecutar inferencia local
1. Instalar dependencias en `src/ai_models/requirements.txt` (FastAPI + TensorFlow CPU opcional).
2. Colocar un modelo entrenado `.h5` o `.keras` en `src/ai_models/production_models/`.
3. Ejecutar el servicio:
   ```bash
   cd src/ai_models
   python fastapi_app.py
   ```
4. Probar desde el frontend `http://localhost:5174/` → "Agricultura + IA" → "🧪 Abrir Diagnóstico IA".

## Endpoints
- `GET /health`: Verifica estado y modelos disponibles.
- `GET /models`: Lista de archivos de modelo detectados.
- `POST /infer`: Recibe `image_url` o `file` y devuelve `{top_class_index, confidence, raw}`.

## Entrenamiento
- Usar notebooks en `src/ai_models/notebooks` para:
  - Descargar/limpiar dataset.
  - Definir arquitectura (p.ej., MobileNetV2 fine-tuning) y métricas.
  - Exportar modelo a `.h5` / `.keras`.

## Buenas prácticas
- Registrar inferencias en `data/logs/infer_log.jsonl` para auditoría.
- Versionar modelos por fecha y métrica (ej. `plant_village_mbv2_acc91.h5`).
- Documentar hiperparámetros y enlaces a artículos/repos relevantes.

## Recursos abiertos
- PlantVillage: https://github.com/smartgarden-community/PlantVillage-Dataset
- Kaggle PlantVillage: https://www.kaggle.com/datasets/emmarex/plantdisease
- TensorFlow: https://www.tensorflow.org/
- FastAPI: https://fastapi.tiangolo.com/
- IPFS (Kubo): https://github.com/ipfs/kubo
- MinIO: https://min.io/

---
Este pipeline está orientado a la reproducibilidad y uso real en campo, además de servir como base para investigación y extensiones Web3.