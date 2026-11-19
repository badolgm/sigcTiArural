# MAPA DE NAVEGACIÓN Y ACCIÓN (SIGC&T RURAL)

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-18T20:34:31-05:00
> - Origen: docs/INDICE_PROYECTO.md
> - Destino: docs/historical/INDICE_PROYECTO.md
Este archivo es el índice operativo del proyecto. Sirve para retomar el trabajo con contexto y sin improvisar.

## 1. Documentos maestros
- [docs/MASTERDOC.md](./docs/MASTERDOC.md): fuente de verdad técnica y de arquitectura.
- [docs/PLAN_MAESTRO.md](./docs/PLAN_MAESTRO.md): roadmap y fases del proyecto.
- [docs/API_REFERENCE.md](./docs/API_REFERENCE.md): referencia de endpoints y contratos de integración.
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md): guía de despliegue y arranque local.

## 2. Continuidad y operación
- [docs/CONTINUITY_RUNBOOK.md](./docs/CONTINUITY_RUNBOOK.md): guía de reanudación del proyecto.
- [docs/WORKFLOW_GUIDE.md](./docs/WORKFLOW_GUIDE.md): flujo de trabajo operativo para continuar sin volver a preguntar.
- [docs/reports/continuity_status.md](./docs/reports/continuity_status.md): estado actual de verificación.
- [scripts/continuity_check.ps1](./scripts/continuity_check.ps1): comando único de continuidad.

## 3. Refactorización y arquitectura
- [docs/HEXAGONAL_REFACTOR_PLAN.md](./docs/HEXAGONAL_REFACTOR_PLAN.md): plan progresivo de refactorización.
- [src/backend/tests](./src/backend/tests): suite de tests de dominio e infraestructura.

## 4. Estado actual
- Rama de trabajo: main
- Estado: línea base verificada y flujo de continuidad operativo.
- Estructura: modular monolith con bounded contexts y servicio de IA independiente.


