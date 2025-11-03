# Plan Maestro de Sesión — 2025-11-03

## Contexto y Principios
- Fuente de verdad: `docs/MASTERDOC_v4.2_DAS.md` (no se modifica).
- Portada técnica: `README.md` se ampliará sin resumir secciones clave.
- Conservación: nunca se elimina nada del PC; versiones viejas se mantienen locales.
- Git: versiones viejas no se suben; se dejan ignoradas en `.gitignore` y, si ya están trackeadas, se quitan del índice con `git rm --cached`.

## Objetivos de la Sesión
- Ampliar `README.md` con: Objetivos (IDs y criterios), Alcance/Límites, Actores/Roles, tres vistas C4 (Contexto, Contenedores, Despliegue) copiadas literalmente desde el MASTERDOC.
- Enlazar a documentación profunda existente en `docs/` sin modificar MASTERDOC.
- Ajustar `.gitignore` para ignorar `READMEV2.md`, `READMEV3.md` y `docs/session_plans/`.
- Preparar comandos Git para dejar el repo listo para push sin archivos viejos.

## Alcance Específico (Opción B aprobada)
1. Añadir secciones al `README.md` copiando texto literal del MASTERDOC:
   - Objetivos de negocio y técnicos (IDs, criterios de éxito).
   - Alcance y límites (Dentro/Fuera del Alcance).
   - Actores y roles.
   - Vistas C4: Contexto, Contenedores y Despliegue (diagramas mermaid tal cual).
2. Mantener el resto de detalle en `docs/` y enlazar desde `README.md`.
3. Ajustar `.gitignore` para ignorar:
   - `READMEV2.md`, `READMEV3.md`.
   - `docs/session_plans/`.
4. Proponer comandos:
   - Quitar seguimiento de `READMEV2.md` y `READMEV3.md` con `git rm --cached` (manteniendo archivos en disco).
   - Commit y push al remoto.

## Criterios de Aceptación
- El `README.md` contiene las secciones exactas (texto literal del MASTERDOC) y diagramas mermaid fieles.
- Todos los enlaces internos (`docs/*`) funcionan en GitHub.
- `.gitignore` evita que se suban `READMEV2.md`, `READMEV3.md` y `docs/session_plans/`.
- No se modifica `docs/MASTERDOC_v4.2_DAS.md`.
- Se presentan los comandos Git y se ejecutan solo tras tu aprobación.

## Riesgos y Mitigaciones
- Tamaño del README: puede volverse extenso. Mitigación: mantener navegación con índice y anchors.
- Diagramas mermaid: diferencias de render en GitHub. Mitigación: validar sintaxis y estilos tal como en MASTERDOC.
- Archivos ya versionados: requerir `git rm --cached`. Mitigación: usar bandera `--cached` para preservar en disco.

## Plan de Implementación Paso a Paso
1. Revisar y extraer secciones del MASTERDOC.
2. Ampliar `README.md` incorporando secciones y diagramas.
3. Actualizar `.gitignore` con patrones requeridos.
4. Validar anchors, enlaces y coherencia terminológica.
5. Proponer comandos Git (quitar seguimiento, commit, push) y esperar tu aprobación.

## Entregables de la Sesión
- `README.md` ampliado.
- `.gitignore` actualizado.
- Este plan guardado en `docs/session_plans/SESSION_PLAN_2025-11-03.md` (ignorado por Git).

## Notas de Gobernanza
- Mantener un plan maestro por sesión en `docs/session_plans/`.
- Registrar criterios de aceptación y cambios planeados antes de cualquier edición.