# SIGC&T Rural — Preparación de Cambio: React 18 + fiber 8.18 + drei 9.122

- Fecha: 2026-09-15 · Misión: U1.1-Sec (Dependencias)
- Estado: **PREPARADO — NO APLICADO** (este documento es el plan exacto; nada se cambió, nada se instaló, nada se comiteó).
- Respeta la restricción de la misión: "sin aplicarlo".

---

## Contexto auditado (verificado, no supuesto)

| Archivo | Hallazgo |
|---|---|
| `src/frontend/package.json` (línea 13-14) | `"@react-three/drei": "^10.7.7"`, `"@react-three/fiber": "^9.5.0"` |
| `src/frontend/package-lock.json` (resuelto) | drei `10.7.7`, fiber `9.5.0`, react `18.3.1`, react-dom `18.3.1`, three `0.182.0`, disponible `scheduler 0.27.0` |
| `src/frontend/src/components/Telemetry3DScene.jsx` | **Único consumidor** de `@react-three/*`: `import { Canvas } from '@react-three/fiber'` (L2) y `import { OrbitControls } from '@react-three/drei'` (L3). API v8/v9 idéntica → **cero cambios de código**. |
| `src/frontend/src/labs/RoboticsLab.jsx` | **Único importador** de Telemetry3DScene vía `React.lazy` (L6) + `<Telemetry3DScene telemetry={...} />`. No importa drei/fiber directamente. |

> Verificación de compatibilidad por registry (npm view):
> - `@react-three/drei@9.122.0` → peer `react ^18`, `@react-three/fiber ^8`, `three >=0.137` ✓
> - `@react-three/fiber@8.18.0` → peer `react >=18 <19` (`>=18`, `<19`), `three >=0.133` ✓
> - three `0.182.0` presente satisface ambos rangos ✓
> - Vite `5.4.x`, `@vitejs/plugin-react 4.7.x`, `reactflow 11.11.4`, Router 6 → **no se tocan**.

---

## 1. Riesgos reales

| # | Riesgo | Prob. | Impacto | Mitigación en el plan |
|---|---|---|---|---|
| R1 | Regenerar `package-lock.json` podría arrastrar/hacer fallback de peers (npm strict → ERESOLVE si algún paquete exige React 19). | Baja | Bloquea `npm install` | Borrar el lock y regenerar con `npm install` limpio; si npm 7+ rechaza peers, usar `--legacy-peer-deps` SOLO como respaldo documentado (no deseado). |
| R2 | fiber 8/drei 9 requieren three ≥0.133/≥0.137 y React 18: si `three` fuera <0.137 fallaría. | Muy baja | Error en runtime 3D | Verificado: three 0.182.0 → OK. No se modifica. |
| R3 | `OrbitControls` o `Canvas` con API distinta en v8/v9. | Nula | Regresión visual en Robótica 3D | Ambos exports existen y son equivalentes en v8 y v9; sin código que tocar. |
| R4 | Vite/ESLint deps instaladas localmente de forma incompleta (node_modules ausente). | Media | Build/lint no confirmables aquí | Los comandos de validación quedan listados (Paso 5); build se ejecutará con node_modules presentes. |

## 2. Archivos afectados

**Modificar (2 líneas):**
- `src/frontend/package.json` — únicamente 2 líneas:
  - `"@react-three/fiber": "^9.5.0"` → `"^8.18.0"`
  - `"@react-three/drei": "^10.7.7"` → `"^9.122.0"`

**Regenerar (no editar a mano):**
- `src/frontend/package-lock.json` — borrar y regenerar vía `npm install` (Paso 4).

**NO tocados (invariantes):**
- `Telemetry3DScene.jsx`, `RoboticsLab.jsx`, `Dashboard.jsx`, `TopNav.jsx`, `services/cloud.js`, restante de `labs/`, `pages/`, `knowledge-hub/`, `components/`.
- `react`, `react-dom`, `three`, `vite`, `@vitejs/plugin-react`, `reactflow`, `react-router-dom` → versiones sin cambio.

## 3. Compatibilidad
- **React 18.3.1** + **fiber 8.18.0** + **drei 9.122.0** + **three 0.182.0**: matriz de peers verificada ✓ (sección "Contexto"). Compatible con el Dashboard actual (React 18 idiom: `createRoot`+`StrictMode`, Fiber v8, drei v9, drei drei-`OrbitControls`).
- Sin cambios de import ni de API en ninguno de los 2 archivos JSX (R3 → nula).

## 4. Rollback
1. Revertir las 2 líneas de `package.json` a `^9.5.0` / `^10.7.7`.
2. Borrar `package-lock.json` regenerado y volver al original (`git checkout -- src/frontend/package-lock.json` si estuvo committed, o restaurar respaldo).
3. `npm install` (opcional con `--legacy-peer-deps`).
4. Verificar `/labs/robotics` y `/dashboard`; si algo se rompe, el estado previo queda restaurado porque ningún JSX fue tocado.

## 5. Probabilidad de éxito
**~99%** — los peers fueron verificados contra el registry y el único consumidor (`Telemetry3DScene`) usa únicamente `Canvas`+`OrbitControls`, ambos con API idéntica entre v8/v9. La única fuente de incertidumbre (R4) es el entorno local sin `node_modules`, no el código.

---

## VEREDICTO: **GO para ejecutar** (según este plan, cuando el dueño autorice NO-GO/GO y el entorno tenga deps)

Comandos exactos (a ejecutar por el dueño, NO ejecutados en esta misión):
```powershell
# 1. Aplicar las 2 líneas en src/frontend/package.json (único paso manual de edición)
# 2. Limpiar el lock stale
Remove-Item -LiteralPath "src\frontend\package-lock.json" -Force
# 3. Regenerar lock + instalar
Set-Location "src\frontend"; npm install
# 4. Validar
npm run build
npm run lint
npm run dev
```
Resultado esperado: build/lint sin errores; `/labs/robotics` con escena 3D intacta; Dashboard, Telemetría, Labs, Knowledge Hub e IA sin cambios.
