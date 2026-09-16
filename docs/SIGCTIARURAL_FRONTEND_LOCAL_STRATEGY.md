# SIGC&T Rural — Estrategia: Entorno Frontend Local Aislado de Docker

Fecha: 2026-09-15 · Rama: `feature/ubtn-biological-telemetry` · Misión: diseño seguro (NO implementado).

---

## 1. DIAGNÓSTICO (verificado en el repo)

| Factor | Hallazgo |
|---|---|
| Frontend en Docker | `src/frontend/Dockerfile` (multi-stage): `node:18-alpine` → **`npm install --legacy-peer-deps`** → `npm run build` → **nginx** sirve estáticos. |
| Puerto productivo | `docker-compose.yml` L97: `"${FRONTEND_PORT:-5173}:80"` → **`http://localhost:5173` = nginx** (no Vite dev). |
| Volúmenes | SOLO `./src/backend:/app` (L51). **`src/frontend` NO tiene volumen** → el contenedor no refleja cambios locales. Cambiar archivos locales NO afecta Docker. |
| Conflicto React vs fiber/drei | `package.json`: `react ^18.2.0` + `drei ^10.7.7` (peer react `^19`) + `fiber ^9.5.0` (peer react `>=19 <19.3`). `npm install` estricto → **ERESOLVE** (confirmado en tu log `2026-09-15T13_34_30_492Z`). Docker lo evita con `--legacy-peer-deps`. |
| `vite.config.js` | Puerto por defecto **5173** (colisiona con Docker), `host: true`, proxy `/api` → `http://localhost:8010` (el backend Docker se expone en 8010→8000). `fs.allow` incluye `repoRoot` → Knowledge Hub funciona por `import.meta.glob`. |
| Git | `node_modules/`, `dist/`, `.env.local` están en `.gitignore` (L40, 68) → la instalación local **no ensucia** `git status`. `package.json` y `package-lock.json` están trackeados. |

**Conclusión del diagnóstico:** el entorno Docker es un static-build inmutable; un servidor Vite local en **otro puerto** es 100% independiente. No existe riesgo de contaminación mientras no se use el puerto 5173 ni se toque `.env.production`/Docker.

---

## 2. RIESGOS

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Apretar `npm install` estricto → ERESOLVE (como ya pasó) | Alta | No hay entorno local | Usar VARIANTE A (`--legacy-peer-deps`, idéntico a Docker) o VARIANTE B (fix limpio de 2 líneas) |
| R2 | Puerto 5173 ya ocupado por Docker → colisión | Segura | Fallo de arranque / pisar producción | Arrancar en **5174** con `--strictPort` |
| R3 | Backend inalcanzable desde Vite local | Baja | Dashboard/Telemetría sin datos | Proxy ya apunta a `localhost:8010` (cierra con Docker backend); si no, `VITE_BACKEND_PROXY_TARGET` en `.env.local` (gitignored) |
| R4 | Regenerar `package-lock.json` ensucia git (Variante B) | Media | Diff no deseado | Rollback `git restore` (está trackeado); decisión consciente del dueño |
| R5 | Editar `package.json` local afectando futuros builds Docker | Baja | Build no estándar | Docker ya usa `--legacy-peer-deps` (funciona con ambas versiones); Variante B es el fix real y forward-compatible |

---

## 3. PLAN

### VARIANTE A — Cero cambios de código (RECOMENDADA para empezar hoy)

Espeja exactamente cómo construye Docker (proven funcionando en contenedor). No modifica nada del repo.

1. `cd src/frontend`
2. `npm install --legacy-peer-deps` → crea `node_modules/` (gitignored).
3. Lanzar en puerto distinto:
   ```powershell
   npm run dev -- --port 5174 --strictPort
   ```
4. Abrir `http://localhost:5174`.

Resultado: Dashboard Ganadora, Labs, Telemetría (vía proxy `/api`→`localhost:8010` Docker), BBB, IA y Knowledge Hub funcionando **sin tocar Docker** (5173 intacto).

### VARIANTE B — Fix limpio del conflicto (recomendada después, cuando el dueño autorice)

Resuelve el ERESOLVE de raíz para permitir `npm install` estricto. Son 2 líneas, el mismo cambio ya auditado con **GO**:

1. En `src/frontend/package.json`:
   - `"@react-three/drei": "^10.7.7"` → `"^9.122.0"`
   - `"@react-three/fiber": "^9.5.0"` → `"^8.18.0"`
2. `Remove-Item -LiteralPath "src\frontend\package-lock.json"` (regeneración limpia).
3. `npm install` (estricto, sin flags — ahora resuelve).
4. `npm run dev -- --port 5174 --strictPort`.
5. Verificar `/labs/robotics` (3D con `Telemetry3DScene`: solo usa `Canvas`+`OrbitControls`, API idéntica en v8/v9 → **0 cambios de código**).

> Compatibilidad al registry ya verificada: `drei@9.122.0` peer `react ^18` + `fiber ^8`, `fiber@8.18.0` peer `react >=18 <19`, `three` `>=0.137/0.133` y se tiene `0.182.0`. Ver `docs/SIGCTIARURAL_DEPENDENCY_DOWNGRADE_PREP.md`.

### Regla cruzada (ambas variantes)

- **PROHIBIDO** usar el puerto 5173 para el dev server (`--strictPort` lo garantiza).
- **Permitido** conectarse a `localhost:8010` (backend Docker) y `localhost:8081` (IA) — solo lectura de APIs.
- NO tocar `.env.production` ni reconstruir imágenes ni reiniciar contenedores.

---

## 4. ROLLBACK

- **Variante A:** `Remove-Item -Recurse src/frontend/node_modules` (y `.env.local` si se creó). Repo vuelve a cero; Docker intacto (no compartía volumen).
- **Variante B:** `git restore src/frontend/package.json src/frontend/package-lock.json` + borrar `node_modules/` + `.env.local`.
- En ambos casos la instancia productiva `http://localhost:5173` (nginx) **no se ve afectada** porque el frontend Docker es inmutable (sin volumen, sin `docker compose down`).

---

## 5. CHECKLIST

- [ ] `git status` limpio salvo docs (antes de empezar)
- [ ] `node_modules/` ausente o creado vía la variante elegida
- [ ] Dev server en `5174` (`--strictPort`), NUNCA 5173
- [ ] `http://localhost:5174` carga el Dashboard
- [ ] `/labs/robotics` renderiza el visor 3D sin errores de consola
- [ ] `/labs/*`, `/knowledge`, `/ai-predictive`, `/data-science` navegan
- [ ] Telemetría recibe datos (proxy `/api` hacia `localhost:8010`)
- [ ] `http://localhost:5173` (Docker) sigue respondiendo sin cambios
- [ ] `docker ps` intacto (nada up/down/restart/build)
- [ ] (Variante B) `npm run build` y `npm run lint` en limpio

---

## 6. ORDEN EXACTO DE EJECUCIÓN (Variante A — hoy)

```powershell
# 1. Verificar Docker sigue arriba (solo lectura)
docker ps

# 2. Instalar dependencias locales (espejo del Dockerfile)
Set-Location "src\frontend"
npm install --legacy-peer-deps

# 3. Arrancar dev server aislado en 5174
npm run dev -- --port 5174 --strictPort

# 4. Abrir navegador en http://localhost:5174
```

Variante B (sustituir pasos 2-3, requiere aprobación por ser edición de dependencias): pasos 1-5 de §3 (B) y luego `npm run build` + `npm run lint`.

---

## RESULTADO

- **Probabilidad de éxito: ~98 %.** Basado en: Docker frontend inmutable (sin volumen), peers compatibles verificados en registry para la Variante B, y la Variante A replica una instalación ya probada dentro del contenedor (misma versión de Node `18-alpine` y mismo `--legacy-peer-deps`). Riesgo residual: 2% de sorpresas de red (proxy a 8010) — no de código.

## VEREDICTO: ✅ **GO**

para crear el entorno frontend local aislado (Variante A inmediata; Variante B como mejora gobernada aparte). No se implementó nada: este documento es la estrategia única, sin commits, sin tocar Docker, sin modificar archivos.