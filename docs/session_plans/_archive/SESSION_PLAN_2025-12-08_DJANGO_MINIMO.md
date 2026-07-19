# Plan de Trabajo — Backend Django mínimo (v2025-12-08)

Objetivo: habilitar arranque mínimo de Django y exponer la API `/api/telemetry/history/` sin afectar el resto del sistema.

Resumen de tareas:
- Crear rama de respaldo: `backup/feature-asistente-voz-20251208`.
- Implementar `urls.py` y `wsgi.py` en `src/backend/sigct_backend/`.
- Añadir dependencias a `src/backend/requirements.txt` (Django, DRF, CORS).
- Actualizar `.gitignore` para ignorar `auditoria_completa.txt` y este documento.
- Verificar con `manage.py` (migraciones y runserver) cuando se autorice.

Detalles técnicos:
- `urls.py` registra `admin/` y `api/` (incluye `api.urls`).
- `wsgi.py` configura `get_wsgi_application()` con `sigct_backend.settings`.
- Dependencias: `Django>=4.2`, `djangorestframework>=3.14`, `django-cors-headers>=4.4`.

Notas de seguridad:
- Mantener `DEBUG=True` solo en desarrollo.
- Restringir `ALLOWED_HOSTS` y `CORS` en producción.

Validación (pendiente de ejecución):
- `python -m venv venv && venv\\Scripts\\activate`.
- `pip install -r src\\backend\\requirements.txt`.
- `python manage.py migrate`.
- `python manage.py runserver 0.0.0.0:8000`.
- Probar `http://localhost:8000/api/telemetry/history/`.

Historial:
- 2025-12-08: versión inicial del plan, lista para ejecución.
- 2026-07-04: se agregó un fixture de pytest para `lab_service` en [src/backend/tests/conftest.py](src/backend/tests/conftest.py) para resolver la falla de tests de dominio; validación ejecutada con 50 tests pasados.
- 2026-07-04: se verificó la importación del microservicio de IA en [src/ai_models/fastapi_app.py](src/ai_models/fastapi_app.py); el servicio carga correctamente en modo mock cuando TensorFlow no está disponible en el entorno actual.
