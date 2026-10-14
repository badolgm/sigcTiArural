# PRE_DOCKER_VISUAL_VALIDATION_REPORT

**Misión:** `PRE_DOCKER_VISUAL_VALIDATION`
**Proyecto:** SIGCT-Rural · **Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `415ee2b`
**Fecha:** 2026-10-13
**Naturaleza:** SOLO VALIDACIÓN. **Sin modificar código · sin commits · sin push · sin R2 · sin SIGCT Memory · sin Qdrant.**

---

## 0. MÉTODO Y LÍMITE HONESTO

Esta validación se ejecutó **sin navegador**. No es posible observar píxeles, layout ni
consola desde este entorno; por tanto **no se realiza una validación *visual* en sentido estricto**.
Lo que sí se verificó, con evidencia objetiva:

| Prueba | Herramienta | Resultado |
|---|---|---|
| Compilación de los 15 módulos | `npm run build` | **EXIT 0** · `✓ built in 1m 3s` |
| Integridad de imports/JSX (no hay imports rotos) | el propio build | OK (0 errores de resolución) |
| Calidad estática | `npm run lint` | 133 problemas (**13 errores**, 120 warnings) — todos preexistentes en módulos congelados |
| Arranque de la SPA y ruteo | `vite preview` + HTTP GET | `/` y **14 rutas** → **200**; `<div id="root">` presente |
| Overlay `SYSTEM DEBUG` en build oficial | inspección del HTML servido | **ausente** ✅ |
| Refs a cuarentena sin romper build | grep | **0** referencias a `_deprecated`/`_quarantine` |
| Diffs de Phase 2 | `git diff` | 5 archivos, +23/-12 (localizado, aditivo) |

> **Conclusión de método:** la validación es **estática + de build + de arranque/ruteo**. La
> confirmación *visual* (layout, colores, solapes, textos) **queda pendiente de una pasada humana
> en navegador** (§J lista las capturas). Esto se declara por la invariante de honestidad de estado.

### Cambios auditados (Phase 2)
| Archivo | Cambio | Riesgo visual |
|---|---|---|
| `services/cloud.js` | `fetchClusterNodesReal()` deja de fabricar métricas; `data: {}` | Ninguno (no toca layout) |
| `hooks/useRoboticsApi.js` | `localhost:8000` → `resolveEndpoint(...,'/api')` | Ninguno (solo URL) |
| `pages/DataScienceLab.jsx` | `onrender.com` → `resolveEndpoint(...,'/api')` | Ninguno (solo URL) |
| `pages/Dashboard.jsx` | `futureNodes[].banner`: "Placeholder…" → "Roadmap · no integrado" (×5) | Ninguno (texto) |
| `config/endpoints.js` | Helper `resolveEndpoint` (nuevo) | Ninguno |
| `_quarantine/pages_deprecated/*` (×5) | Movidos desde `_deprecated/` | Ninguno (0 refs) |

---

## A. MÓDULOS VISUALMENTE CORRECTOS (verificación estática)

Todos compilan, su ruta responde `200` y sus imports resuelven. Sin evidencia de rotura por los
cambios de Phase 2:

| # | Módulo | Ruta | Estado estático |
|---|---|---|---|
| 1 | Dashboard | `/dashboard` | ✅ OK — banner honesto; clúster ahora honesto (`data:{}`) |
| 2 | CMSC | `/dashboard-cmsc` | ✅ Compila/rutea (warnings de lint preexistentes) |
| 3 | Knowledge Hub | `/knowledge` | ✅ OK (51 docs) |
| 4 | Hardware Catalog | `/hardware-catalog` | ✅ OK |
| 5 | Hardware Detail | `/hardware/:id` | ✅ OK (requiere `:id` válido) |
| 6 | Workbench (MMC) | embebido en CMSC | OK (componentes `labs/mmc/**` compilan) |
| 7 | Laboratorios | — | OK (ver detalle abajo) |
| 7a | RoboticsLab | `/labs/robotics` | ✅ **mejora**: host `/api` (antes roto) |
| 7b | EmbeddedLab | `/lab-embedded` | ✅ |
| 7c | TelecomLab | `/lab-telecom` | ✅ |
| 8 | ElectronicsLab | `/lab-electronics` | ✅ estructura (lint preexistente, §I) |
| 6b | DataScienceLab | `/data-science` | ✅ estructura (SSE 404 esperado, §E) |
| 6c | AdvancedMathLab | `/advanced-math` · `/advanced-math-v2` | ✅ estructura (hooks preexistentes, §I) |
| 8 | IA Predictiva | `/ai-predictive` | ✅ |
| 9 | Navegación global | 18 routes | ✅ (14/14 probadas → 200) |
| 10 | Menú principal (TopNav) | global | ✅ (sin cambios) |
| 11 | Banner principal | Hero/Dashboard | ✅ (sin cambios) |
| 12 | Voice Assistant | global | ✅ (`resolveEndpoint`, sin cambios de layout) |
| 13 | Bridge UI | CMSC/Orchestration | ✅ estructura; mostrará `SIN_PUENTE` (bridge local apagado) — honesto, no roto |
| 14 | Dataset acústico UI | CMSC/Orchestration | ✅ estructura; `—` sin puente |
| 15 | Orchestration V2 | CMSC | ✅ compila/rutea |

---

## B. MÓDULOS CON ERRORES

**Ninguno atribuible a los cambios de Phase 2.** Los 13 errores de lint residen en módulos
**congelados** (no tocados) y son deuda preexistente:

| Archivo | Error lint | ¿Phase 2? |
|---|---|---|
| `labs/AdvancedMathLabV2.jsx` (×3) | Hooks condicionales (`useMemo`) + directiva `eslint-disable` sobrante | No |
| `labs/ElectronicsLab.jsx` (×2) | Hooks condicionales (`useLabStore`) | No |
| `labs/SchematicEditor.jsx` (×2) | Hook condicional (`useReactFlow`) + **`useCluster` no definido** | No |
| `pages/cmsc/LatestEvidence.jsx` (×5) | `children` como prop | No |
| `pages/DataScienceLab.jsx` (×1) | Directiva `eslint-disable` sobrante (línea 41) | No (preexistente; el cambio de Phase 2 es la línea 2/8) |

> El error `useCluster is not defined` (SchematicEditor.jsx:1755) es el único con potencial de
> excepción en runtime, pero en un módulo congelado y ajeno a los cambios.

---

## C. RUTAS ROTAS

**Ninguna.** `/`, `/dashboard`, `/dashboard-cmsc`, `/knowledge`, `/hardware-catalog`, `/labs`,
`/data-science`, `/ai-predictive`, `/lab-electronics`, `/lab-telecom`, `/lab-embedded`,
`/labs/robotics`, `/advanced-math`, `/advanced-math-v2`, `/proyectos` → **HTTP 200**.
El ruteo `*` (404 honrado) existe en `App.jsx:142`.

---

## D. COMPONENTES ROTOS

**Ninguno detectado por build/arranque.** Único activo con riesgo latente (ajeno a Phase 2):

- `SchematicEditor.jsx:1755` — referencia a `useCluster` no definido (posible `ReferenceError` si se
  alcanza esa rama).

No hay imports rotos tras mover los 5 archivos a `_quarantine/` (0 referencias residuales).

---

## E. ERRORES DE CONSOLA VISIBLES

No verificables sin navegador. **Esperados y manejados** (no son regresiones de Phase 2):

| Origen | Mensaje esperado | Manejo |
|---|---|---|
| `DataScienceLab` SSE | `GET /api/events` → 404 (backend sin SSE) | `onerror` cierra `EventSource`; no inventa datos |
| `RoboticsLab` | `/api/robot-telemetry/` puede fallar si backend/tabla no disponible | Hook maneja `error`+`loading` |
| Dashboard/CMSMC | fetch a `/api/v3/...` si backend apagado | Fallback honesto (`source_mode`, `—`) |
| Bridge | `GET http://127.0.0.1:8766/health` falla si no hay bridge | Badge `SIN_PUENTE` |

---

## E/F. PROBLEMAS DE RENDERIZADO  (F)

No observables sin navegador. **Sin evidencia de rotura**: build EXIT 0 (todo el JSX compila),
SPA monta `#root`, 14 rutas sirven. No se introdujeron cambios de estructura ni CSS en Phase 2.

---

## G. NAVEGACIÓN

Correcta y **sin cambios**: `App.jsx` conserva sus 18 `<Route>`; el enlace raíz `→ /dashboard`
sigue; la ruta `*` honra el 404. Las URLs relativas (`/api`) no afectan el enrutado del cliente.

---

## H. CSS

**Sin cambios.** Phase 2 no modificó hojas de estilo ni `index.html`. Los estilos (`mmcWorkbench.css`
y el resto) se empaquetan sin error en el build.

---

## I. REACT

- Sin errores de compilación ni de montaje detectables.
- Violaciones de reglas de hooks **preexistentes** en `AdvancedMathLabV2`, `ElectronicsLab`,
  `SchematicEditor` (congelados). No fueron introducidas por los cambios de Phase 2 y no bloquearon
  el build.
- Advertencia de dependencias de hook en `AcousticLoggerPanel.jsx` (CMSC, congelado).
- El cambio `futureNodes[].banner` es solo dato estático → sin impacto React.
- `resolveEndpoint` es una función pura sin efectos → sin impacto React.

---

## E′. ERRORES DE CONSOLA — ACCIONABLE

No verificables sin navegador. Los esperados (§E) están **manejados** (catch/estado honesto), no
deberían producir excepciones no capturadas. Se recomienda confirmar en la pasada visual.

---

## J. CAPTURAS RECOMENDADAS (pasada humana requerida)

| # | Captura | Ruta | Qué verificar |
|---|---|---|---|
| 1 | Dashboard (clúster + chart) | `/dashboard` | Nodos BBB sin métricas inventadas; `futureNodes` = "Roadmap · no integrado" |
| 2 | CMSC Hero + SignalRiver | `/dashboard-cmsc` | Layout 1920, chips de estado |
| 3 | Orchestration V2 (Logger/Dataset) | `/dashboard-cmsc` | Badge `PUENTE OK/SIN_PUENTE`; conteos reales o `—` |
| 4 | Knowledge Hub | `/knowledge` | 51 docs, 6 categorías, listado |
| 5 | Hardware Catalog | `/hardware-catalog` | Tarjetas y estados |
| 6 | Hardware Detail | `/hardware/:id` | Página derivada sin error |
| 7 | Workbench (MMC) | `/dashboard-cmsc` | Tabs M01–M04, gráfica jsxgraph |
| 8 | RoboticsLab | `/labs/robotics` | "Esperando flujo" honesto (o datos si backend) |
| 9 | EmbeddedLab | `/lab-embedded` | iframe/consola |
| 10 | TelecomLab | `/lab-telecom` | Analizador FFT (mic) |
| 11 | ElectronicsLab | `/lab-electronics` | Falstad + panel Python |
| 12 | DataScienceLab | `/data-science` | Botón SSE → vuelve a "Conectar" sin inventar datos |
| 13 | AdvancedMathLab (V1 y V2) | `/advanced-math(-v2)` | Render de gráficas |
| 14 | IA Predictiva | `/ai-predictive` | Upload imagen + modos real/simulación |
| 15 | Navegación + VoiceAssistant | global | TopNav, menú, asistente |
| 16 | 404 honrado | `/ruta-inexistente` | Página 404, no pantalla en blanco |

**Además, con DevTools abierto:** (a) consola sin excepciones rojas no manejadas; (b) Network:
`/api/*` vía proxy (no `localhost:8000` ni `onrender.com`).

---

## DICTAMEN

```
┌──────────────────────────────────────────────────────────────┐
│  GO_DOCKER_OFFICIAL_PREPARATION (validación estática)         │
│  + VALIDACIÓN VISUAL HUMANA PENDIENTE (no ejecutada aquí)     │
└──────────────────────────────────────────────────────────────┘
```

### Justificación
- **Build EXIT 0** y **14/14 rutas 200**: ningún cambio de Phase 2 rompió la compilación, los
  imports, la cuarentena ni el arranque de la SPA.
- Los cambios son **mínimos, localizados y sin impacto de layout** (URLs, un texto, un objeto de
  datos vacío).
- Los **13 errores de lint son preexistentes** en módulos congelados (CMSC/Labs) y no provienen de
  Phase 2.
- El overlay `SYSTEM DEBUG` está **ausente** en el build oficial.

### Condición (honestidad)
No se ejecutó **validación visual real** (sin navegador). Antes de etiquetar `Docker Oficial` como
"validado visualmente", se requiere la **pasada humana §J** (16 capturas + DevTools). Hasta
entonces, el veredicto es **GO para preparación de Docker**, no "GO visual confirmado".

### Recomendaciones (no ejecutadas — solo registro)
1. Pasada visual humana según §J y adjuntar capturas al expediente.
2. Deuda de lint (13 errores) en módulos congelados: **documentada**, fuera de alcance sin misión.
3. `SchematicEditor.jsx:1755` (`useCluster`): vigilar; congelado.

---

**Sin modificar código · sin commits · sin push · sin R2 · sin SIGCT Memory · sin Qdrant.**
