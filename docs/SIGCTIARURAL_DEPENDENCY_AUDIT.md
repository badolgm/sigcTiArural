# SIGC&T Rural — Auditoría de Dependencias Frontend (U1.1)

- Fecha: 2026-09-15
- Alcance exclusivo: `package.json`, `package-lock.json`, `@react-three/fiber`, `@react-three/drei`, `React`, `ReactDOM`, `Vite`, `ReactFlow`.
- Método: solo lectura. Prohibido tocar código, modificar `package.json`, instalar paquetes o actualizar React — **cumplido en su totalidad** (ningún cambio aplicado).
- Referencias en el repo objeto de la auditoría: `src/frontend/package.json`, `src/frontend/package-lock.json`, `package-lock.json` (raíz, tooling de docs), `src/package-lock.json` (stub vacío 88 B).

---

## 1. Estado actual (declarado vs resuelto vs peers)

| Paquete | `package.json` (declarado) | Lock resuelto | Peer exigido por la versión resuelta | Compatible con React 18 |
|---|---|---|---|---|
| react | `^18.2.0` | `18.3.1` | — | ✅ |
| react-dom | `^18.2.0` | `18.3.1` | — | ✅ |
| @react-three/fiber | `^9.5.0` | `9.5.0` | `react >=19 <19.3` (lock L1118-1119) | ❌ |
| @react-three/drei | `^10.7.7` | `10.7.7` | `react ^19` (lock L1086-1087) | ❌ |
| three | `^0.182.0` | `0.182.0` | `>=0.156` / `>=0.159` | ✅ |
| vite | `^5.2.0` | `5.4.21` | — | ✅ |
| @vitejs/plugin-react | `^4.2.1` | `4.7.0` | React 18 soportado | ✅ |
| reactflow (React Flow) | `^11.11.4` | `11.11.4` | `react >=17` | ✅ |
| react-router-dom | `^6.28.0` | — | React 16.8+ (fijado por CVE en `e621e7f`) | ✅ |

`lockfileVersion: 3`.

El lock contiene **simultáneamente** `react 18.3.1` + `fiber 9.5.0` (peer react 19) + `drei 10.7.7` (peer react 19): una combinación imposible de resolver en modo estricto; solo pudo generarse ignorando peers (`--legacy-peer-deps` o npm < 7).

---

## 2. Pregunta 1 — Versión de `@react-three/drei` correcta para React 18

La línea actual (drei 10.7.x + fiber 9.5.x) exige React 19. La línea compatible con React 18 verificada en el registry:

- `@react-three/fiber@8.18.0` — peer `react >=18 <19`, `three >=0.133`.
- `@react-three/drei@9.122.0` — peer `react ^18`, `@react-three/fiber ^8`, `three >=0.137`.

Con `three 0.182.0` cumplen ambas. **Único consumidor en el código**: `src/frontend/src/components/Telemetry3DScene.jsx` importa solo `Canvas` (fiber) y `OrbitControls` (drei): API idénticas en v8/v9 → **cero cambios de código**.

## 3. Pregunta 2 — ¿El problema viene de `package.json` o `package-lock.json`?

**Viene de `src/frontend/package.json`**, que declara a la vez `react ^18.2.0` con `@react-three/fiber ^9.5.0` y `@react-three/drei ^10.7.7` (ambos de la línea React 19). Es una contradicción declarativa. El `package-lock.json` no inventa el conflicto: lo *refleja* porque fue generado ignorando peers; por eso contiene react 18.3.1 junto a fiber 9.5.0/drei 10.7.7. En `npm install`/`npm ci` estricto → **ERESOLVE** (y es la causa de que el primer build en este workspace fallara: `vite` no instalable sin pasar por este conflicto). Los locks de raíz y `src/` son irrelevantes para el frontend (tooling de docs / stub vacío).

## 4. Pregunta 3 — ¿Fue desarrollado originalmente sobre React 18?

**Sí.** Evidencia: `src/frontend/src/main.jsx` usa `ReactDOM.createRoot` + `React.StrictMode` (idioma React 18); stack React 18 nativo (`react-router-dom` v6, `reactflow` v11, `recharts` v2); `git log` de `src/frontend/package.json` muestra `react ^18.2.0` en **todos** los commits, incluido el más antiguo (`d46e5dd`). La incompatibilidad fiber/drei es histórica (presente desde ese mismo commit) y sobrevivió porque la instalación previa usó `--legacy-peer-deps`/npm < 7 (por eso el entorno original "funcionaba" y el Dashboard se ejecutaba con React 18).

## 5. Pregunta 4 — Cambio mínimo para `npm install` sin alterar el Dashboard actual

Descender fiber/drei a la línea React 18 deja **todo lo demás igual**: react 18.3.1, react-dom 18.3.1, vite 5.4.x, @vitejs/plugin-react 4.7.x, reactflow 11.11.4, three 0.182.0, react-router-dom 6.28.0. El Dashboard no cambia: consume los mismos paquetes con las mismas versiones; el único archivo tocado por three/drei (`Telemetry3DScene.jsx`) no se modifica.

> **Nota de gobernanza:** el cambio descrito a continuación es **recomendación**; no fue aplicado (prohibido en esta misión). Requiere aprobación del dueño para ejecutarse.

---

## 6. CONCLUSIÓN ÚNICA — RECOMENDACIÓN EXACTA

1. En `src/frontend/package.json`, reemplazar **exclusivamente dos líneas**:
   - `"@react-three/fiber": "^9.5.0"` → `"@react-three/fiber": "^8.18.0"`
   - `"@react-three/drei": "^10.7.7"` → `"@react-three/drei": "^9.122.0"`
2. Eliminar `src/frontend/package-lock.json` (regeneración limpia, evita resoluciones stale).
3. Ejecutar desde la raíz del repo:
   ```powershell
   cd src/frontend
   npm install
   ```
4. Verificar: `npm run build`, luego `npm run dev` y en el navegador comprobar `/labs/robotics` (escena 3D con `Telemetry3DScene`) y `/dashboard` intactos.

**Impacto:** 2 líneas de dependencias + re-creación del lock. Cero cambios de código. Dashboard, Telemetría, Labs, Knowledge Hub e IA permanecen idénticos. React se mantiene en 18.3.1 (no se actualiza).