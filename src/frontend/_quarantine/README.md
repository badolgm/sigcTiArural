# _quarantine — código deprecado preservado (NO parte del build)

**Creado:** 2026-10-12 · `FRONTEND_OFFICIALIZATION_IMPLEMENTATION_PHASE_1` (P3)

Regla suprema: **NADA DESAPARECE**. Este directorio conserva código que dejó de
usarse pero cuya historia se preserva en el repositorio (movido con `git mv`, no
borrado). **No se importa desde `src/`** y **Vite no lo incluye en el build** (no
hay arista de import). ESLint lo ignora (`_quarantine` en `.eslintrc.cjs`).

## `pages_deprecated/` (ex `src/frontend/src/pages/_deprecated/`)

5 páginas con **0 referencias** en `App.jsx` ni en ningún otro módulo del
frontend. Dependían de CDNs externos en tiempo de ejecución
(`raw.githubusercontent.com`, `cdn.jsdelivr.net`) y quedaron reemplazadas por el
Knowledge Hub (`/knowledge`).

| Archivo | Estado | Motivo de cuarentena |
|---|---|---|
| `DocsApiReference.jsx` | deprecado | sin referencias; contenido absorbido por Knowledge Hub |
| `DocsEdgeSetup.jsx` | deprecado | sin referencias; contenido absorbido por Knowledge Hub |
| `DocsMasterdoc.jsx` | deprecado | sin referencias; contenido absorbido por Knowledge Hub |
| `DocsPlanMaestro.jsx` | deprecado | sin referencias; contenido absorbido por Knowledge Hub |
| `DocsReadme.jsx` | deprecado | sin referencias; contenido absorbido por Knowledge Hub |

## Política de salida

- **Reactivar:** solo con una misión explícita que defina su ruta y su fuente de
  datos (no volver a CDN externo).
- **Retirar definitivamente:** solo con orden explícita de Bernardo; incluso
  entonces, la historia permanece en git.
