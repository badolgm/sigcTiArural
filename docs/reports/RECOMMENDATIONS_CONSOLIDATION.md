# RECOMENDACIONES — SIGCTIARURAL ECOSYSTEM FORENSIC CONSOLIDATION

## Hallazgos clave
- **Rama activa:** `feature/cmsc-f3c-v1-implementation` (25 commits adelantados vs origin/feature/cmsc-f3c-v1-implementation). Tiene documentación CMSC extensa + Tramos B/C integrados localmente.
- **Cambios locales no commiteados:** 7 modificados (AGENTS.md, SpectralAnalysisInstrument.jsx, 4 paneles orquestación, package.json logger) + 4 untracked (worklets/, acousticBridge.js, bridge/, stats.js) — corresponde a Tramo B+C ya validados.
- **Docker:** varios servicios corriendo (vetna/eiarc/otros). Backend local (5173) y Vite dev (5174) no levantados ahora. Bridge/logger son herramientas CLI+UI locales (no dockerizados).
- **Datasets acústicos:** C0 productivo intacto (1/1/1). Sandbox usado para validación.
- **AI service:** FastAPI en repo (puede ejecutarse local o Docker). Modelos M1/M2 referenciados/documentados.

## Qué ramas pueden fusionarse
- **NO fusionar aún** `feature/cmsc-f3c-v1-implementation` → contiene trabajo CMSC/Tramos B+C no commiteados. Recomendado hacer commit atómico de Tramos B+C tras revisión + push a rama remota.
- `feature/kimi-forensic-code-audit` — revisión forense independiente; evaluar diff vs main antes de fusionar.
- `feature/ubtn-biological-telemetry` — ya tiene commits de benchmark según AGENTS.md; verificar estado vs origin antes de fusionar.

## Qué ramas pueden cerrarse
- Ninguna sin validar. Mantener abiertas hasta integrar lo necesario. Cerrar solo tras merge aprobado.

## Qué debe entrar al contenedor oficial
- **Frontend:** build estático (Vite build OK) → puede ir a contenedor nginx (5173 legacy es referencia; 5174 evolución). CMSC es parte del frontend.
- **Backend (Django):** ya en `src/backend` con Dockerfile; debe permanecer en stack oficial.
- **AI service (FastAPI):** `src/ai_models` con Dockerfile → mantener si se usa en despliegue.
- **Postgres:** ya definido. MySQL (`db-mysql`) marcado como residuo; mantener solo si hay dependencias externas reales.

## Qué debe quedar fuera
- **Bridge/logger local (`tools/cmsc-data-logger/`):** herramienta de ingesta/validación (CLI + bridge HTTP local 127.0.0.1:8766). No es servicio desplegable; debe quedar fuera de contenedores productivos.
- **Worklets públicos (`src/frontend/public/worklets/`):** sirven desde Vite/build estático; forman parte del frontend bundle (NO contenedor aparte).
- **Datasets (`data/datasets/` fuera de git según política):** nunca versionar ni meter en imagen.
- **Notebooks/runs:** desarrollo/benchmark, no runtime productivo.
- **Sandbox temp:** nunca commitear.

## Recomendaciones inmediatas (sin implementar)
1. Consolidar Tramos B+C en commit(s) atómicos con mensaje claro (sin push aún).
2. Validar diff vs origin/feature/cmsc-f3c-v1-implementation (103 archivos) — revisar cambios no relacionados.
3. Decidir estrategia: merge progresivo hacia main o mantener rama CMSC como integración.
4. No incluir bridge/stats en contenedores; mantener como tooling local.
5. Para OCI/Qdrant/Memoria/S81/S82: definir contratos primero (no código).
