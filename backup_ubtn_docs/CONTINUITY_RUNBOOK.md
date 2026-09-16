# Runbook de continuidad — SIGC&T Rural

## Objetivo

Este documento permite que cualquier persona o agente retome el proyecto sin repetir trabajo ni depender de memoria operativa. La documentación debe ser suficiente para identificar el estado real, ejecutar la verificación, entender el siguiente paso y continuar de forma segura.

## Estado actual verificado (2026-07-04)

- La capa de dominio de laboratorios está validada con pytest: 50 tests pasaron.
- El microservicio de IA importa correctamente y queda en modo mock de forma segura cuando TensorFlow no está disponible en el entorno actual.
- El proyecto conserva una ruta de continuidad basada en verificación reproducible y documentación actualizada.

## Punto de chequeo obligatorio

Ejecutar desde la raíz del proyecto:

- Comando único de continuidad: `./scripts/continuity_check.ps1`
- Verificación manual: `./scripts/verify_refactor.ps1`
- Bash: `./scripts/verify_refactor.sh`

El comando único de continuidad levanta lo mínimo necesario, espera a que backend y AI estén listos y luego ejecuta la verificación completa.

El chequeo ejecuta:

1. Verificación de servicios relevantes y estado de Docker.
2. Smoke test del microservicio de IA.
3. Ejecución de los tests de dominio del backend.
4. Generación de un resumen en [docs/reports/continuity_status.md](docs/reports/continuity_status.md).

## Resultado esperado

- El chequeo debe terminar con un resumen claro de OK, warnings y errores.
- Si hay fallos, el script debe indicar exactamente qué validar y qué comando reintentar.
- La documentación debe reflejar la última intervención y el siguiente paso concreto.

## Siguiente paso recomendado ahora

1. Revisar el resumen generado en [docs/reports/continuity_status.md](docs/reports/continuity_status.md).
2. Si todo está en verde, avanzar a la siguiente mejora de infraestructura o integración (por ejemplo healthchecks de Docker o validación de endpoints reales).
3. Si hay errores, corregir el bloque afectado y volver a ejecutar el chequeo antes de seguir.

## Archivos clave para continuar

- [docs/HEXAGONAL_REFACTOR_PLAN.md](docs/HEXAGONAL_REFACTOR_PLAN.md)
- [docs/MASTERDOC.md](docs/MASTERDOC.md)
- [scripts/verify_refactor.ps1](scripts/verify_refactor.ps1)
- [scripts/verify_refactor.sh](scripts/verify_refactor.sh)
- [src/backend/tests/conftest.py](src/backend/tests/conftest.py)
- [src/ai_models/fastapi_app.py](src/ai_models/fastapi_app.py)
