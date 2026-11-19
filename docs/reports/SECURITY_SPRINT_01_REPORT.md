# SECURITY-SPRINT-01 — Auditoría de dependencias y plan priorizado

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-18T22:10:46-05:00
> - Origen: docs/SECURITY_SPRINT_01_REPORT.md
> - Destino: docs/reports/SECURITY_SPRINT_01_REPORT.md (REPORT)

**Misión:** `SECURITY-SPRINT-01` — reducir deuda técnica de dependencias y vulnerabilidades sin afectar funcionalidad.
**Naturaleza:** SOLO auditoría y plan. **NO** modifica código · **NO** actualiza paquetes · **NO** commit · **NO** push · **NO** rebuild Docker.
**Fecha:** 2026-11-17 (America/Bogota)
**Rama:** `feature/cmsc-f3c-v1-implementation` · **HEAD:** `5308d79`
**Regla:** toda afirmación anclada a fichero/lockfile/registro de avisos; lo no evidenciado se declara como tal.

---

## 0. Metodología y alcance

### 0.1 Ficheros analizados (los 4 del alcance + 1 adyacente)

| # | Fichero | Rol |
|---|---|---|
| 1 | `package.json` (raíz) | Tooling de documentación (Mermaid/PDF/http-server) |
| 2 | `src/backend/requirements.txt` | Backend Django (imagen `sigctiarural_backend`) |
| 3 | `src/ai_models/requirements.txt` | AI Service FastAPI (imagen `sigctiarural_ai_service`) |
| 4 | `benchmark/requirements.txt` | Benchmark IA (offline, Colab/local) |
| 5 | `src/frontend/package.json` **(adyacente)** | App React/Vite — **no estaba en la lista, pero es la mayor superficie npm del repo**; se incluye por rigor |

### 0.2 Herramientas usadas (solo lectura)

- `npm audit --json` sobre `src/frontend` (lockfile) y raíz (lockfile). Resultados reales del registry configurado.
- **OSV.dev API** (`/v1/query`) por paquete+versión Python, con severidad de `database_specific.severity` (GHSA).
- Extracción de **versiones resueltas** de `src/frontend/package-lock.json` y `package-lock.json`.
- `grep` de uso real de dependencias sospechosas en el código.

### 0.3 Caveats declarados

1. Los conteos de Python son **avisos que afectan a esa versión exacta** según OSV; no equivalen a "explotables".
2. Las dependencias **sin pin** (`tensorflow-cpu`, `Pillow`, `numpy`, `requests`, `python-multipart`, `SpeechRecognition`, `gTTS`, `pydub`, `psycopg2-binary`, `mysql-connector-python`, `lcapy`) resuelven a la **última versión en tiempo de build** → no deterministas; se evalúa el caso anclado y se marca el riesgo de reproducibilidad.
3. Las bases de avisos (OSV/GHSA/npm) son **point-in-time**; los números reflejan la consulta del 2026-11-17.
4. `src/package-lock.json` (88 B) es un **stub vacío** sin efecto.

---

## 1. Inventario de versiones resueltas

### 1.1 `package.json` (raíz) — tooling

| Paquete | Declarado | Resuelto | Tipo |
|---|---|---|---|
| grip | `^1.6.0` | 1.6.0 (**deprecado**) | dep (runtime) |
| @mermaid-js/mermaid-cli | `^11.12.0` | 11.12.0 | dev |
| http-server | `^14.1.1` | 14.1.1 | dev |
| marked | `^17.0.0` | 17.0.0 | dev |
| md-to-pdf | `^5.2.4` | 5.2.4 | dev |
| puppeteer | `^24.43.1` | 24.43.1 | dev |

### 1.2 `src/frontend/package.json` — app (adyacente)

| Paquete | Declarado | Resuelto | Nota |
|---|---|---|---|
| react / react-dom | `^18.2.0` | **18.3.1** | React 18 |
| @react-three/fiber | `^9.5.0` | **9.5.0** | **exige React 19** |
| @react-three/drei | `^10.7.7` | **10.7.7** | **exige React 19** |
| three | `^0.182.0` | 0.182.0 | peer de fiber |
| react-router-dom | `^6.28.0` | 6.30.4 | v6 |
| vite | `^5.2.0` | 5.4.21 | dev/build |
| eslint | `^8.57.0` | 8.57.1 | **EOL** |
| tailwindcss | `^3.4.3` | 3.4.18 | v3 |
| postcss | `^8.4.38` | 8.5.6 | build |
| esbuild | (transitivo de vite) | 0.21.5 | dev |
| recharts | `^2.12.7` | 2.15.4 | runtime |
| mermaid | `^11.16.0` | 11.16.0 | runtime |
| katex | `^0.18.9` | 0.18.9 | runtime |
| reactflow | `^11.11.4` | 11.11.4 | **deprecado** |
| jsxgraph | `^1.13.3` | 1.13.3 | runtime (import dinámico) |
| zustand | `^5.0.10` | 5.0.10 | runtime |
| lucide-react | `^0.563.0` | 0.563.0 | runtime |
| framer-motion | `^12.29.2` | 12.29.2 | runtime |
| marked | `^18.0.6` | 18.0.6 | runtime |

### 1.3 `src/backend/requirements.txt`

Anclados: `asgiref 3.11.1` · `certifi 2026.5.20` · `charset-normalizer 3.4.7` · `colorama 0.4.6` · `coverage 7.14.1` · `dj-database-url 3.1.2` · **`Django>=4.2.16,<5.0`** · `django-cors-headers 4.9.0` · `djangorestframework 3.17.1` · `djangorestframework-simplejwt 5.5.1` · `idna 3.18` · `iniconfig 2.3.0` · `packaging 26.2` · `pluggy 1.6.0` · `psycopg2-binary 2.9.12` · `Pygments 2.20.0` · `pytest 9.0.3` · `pytest-django 4.12.0` · `python-dotenv 1.2.2` · `requests 2.34.2` · `sqlparse 0.5.5` · `tzdata 2026.2` · `urllib3 2.7.0` · `black 24.8.0` · `flake8 7.1.1` · `mypy 1.11.2` · `types-requests 2.32.0.20240914` · `tenacity 9.0.0` · `gunicorn 23.0.0`.
**Único rango:** `Django>=4.2.16,<5.0` → pip instala la **última 4.2.x disponible (hoy 4.2.30)**.

### 1.4 `src/ai_models/requirements.txt`

Anclados: `fastapi 0.115.5` · `uvicorn[standard] 0.32.0` · `onnxruntime 1.31.0`.
**Sin pin (7):** `python-multipart` · `requests>=2.31` · `numpy>=1.24` · `Pillow>=10.0` · `tensorflow-cpu>=2.15.0` · `SpeechRecognition` · `gTTS` · `pydub` · `mysql-connector-python` · `psycopg2-binary` · `lcapy`.

### 1.5 `benchmark/requirements.txt`

`torch 2.5.1` · `torchvision 0.20.1` · `scikit-learn 1.6.1` · `numpy 2.1.3` · `pandas 3.0.5` · `pillow 12.3.0` · `matplotlib 3.11.2` · `pyyaml>=6.0`.

---

## 2. Resumen ejecutivo de vulnerabilidades

| Ecosistema | Total | CRITICAL | HIGH | MODERATE | LOW |
|---|---|---|---|---|---|
| **npm — `src/frontend`** | **24** | **1** | **13** | 8 | 2 |
| **npm — raíz (tooling)** | **39** | **1** | **31** | 6 | 1 |
| Python — `src/backend` (versión resuelta) | 85 | **1** (solo en el suelo 4.2.16) | 16 | 15 | 15 |
| Python — `benchmark` | 85 | **6** | 25 | 17 | 5 |
| Python — `src/ai_models` | 0 (versiones ancladas) | 0 | 0 | 0 | 0 |

> **Nota crítica:** las dependencias **sin pin** de `ai_models` (`Pillow>=10.0`, `tensorflow-cpu`, `numpy`, …) hacen que ese "0" **no sea garantía**: la imagen se construyó el **2026-10-30** y resolverá lo que hubiera entonces. El riesgo de `ai_models` es de **reproducibilidad**, no de un pin conocido.

---

## 3. Top 20 dependencias de mayor riesgo

Orden por **riesgo compuesto** = exposición (runtime/red > runtime interno > dev) × severidad × anclaje (pin controlable) × fixabilidad.

| # | Dependencia | Fichero | Directa | Perfil de avisos | Exposición | Fix |
|---|---|---|---|---|---|---|
| 1 | **pillow 12.3.0** | benchmark (+ `Pillow` sin pin en ai_models) | Sí | **5 CRIT · 24 HIGH** | **Runtime, decodifica imágenes subidas en `/infer`** | **13.0.0 → 0** |
| 2 | **certifi 2026.5.20** | backend | Sí | **1 CRIT** (CA comprometida) | Runtime TLS saliente | **2026.10.23 → 0** |
| 3 | **torch 2.5.1** | benchmark | Sí | **1 CRIT · 1 HIGH** | Offline (checkpoints locales) | **2.15.0 → 0** |
| 4 | **Django (4.2.16–4.2.30)** | backend | Sí | **1 CRIT en el suelo** · 1 HIGH en 4.2.30 | **Runtime, API pública `/api`** | 4.2.30 (1 HIGH) · 6.1.3 → 0 |
| 5 | **djangorestframework 3.17.1** | backend | Sí | **3 HIGH** | **Runtime, API pública** | **3.18.3 → 0** |
| 6 | **dompurify** (transitivo vía mermaid) | frontend | No | **1 CRIT** | Runtime (render de Markdown KH) | subir mermaid/`npm audit fix` |
| 7 | **md-to-pdf 5.2.4** | raíz | Sí | **1 CRIT** | **Dev** (front-matter ⇒ RCE) | 5.2.5+ |
| 8 | **urllib3 2.7.0** | backend | Sí | **2 HIGH** | Runtime (HTTP saliente) | **2.8.0 → 0** |
| 9 | **sqlparse 0.5.5** | backend | Sí | **3 HIGH** | Runtime (DoS) | **0.6.1 → 0** |
| 10 | **vite 5.4.21** (+ esbuild 0.21.5) | frontend | Sí | 9 avisos (HIGH/MOD) | **Dev-server** (no prod: nginx sirve `dist`) | vite 8.3.8 (major) |
| 11 | **react-router-dom 6.30.4** | frontend | Sí | 1 MOD (open redirect/XSS) | Runtime | 7.18.0 (major) |
| 12 | **mermaid 11.16.0** | frontend | Sí | 5 MOD (proto-pollution/CSS-inj/DoS) | Runtime | 11.16.1 |
| 13 | **puppeteer 24.43.1** | raíz | Sí | HIGH transitivos (basic-ftp, extract-zip, …) | Dev | 25.18.1 (major) |
| 14 | **postcss 8.5.6** | frontend | Sí | HIGH (path traversal) | Build | patch |
| 15 | **black 24.8.0** | backend | Sí | **2 HIGH** | Dev | **26.10.1 → 0** |
| 16 | **tensorflow-cpu** (sin pin) | ai_models | Sí | 0 conocido en 2.15; **superficie enorme** | Runtime | 2.21.0 + pin |
| 17 | **fastapi 0.115.5 / uvicorn 0.32.0** | ai_models | Sí | 0 conocido | Runtime | 0.163.2 / 0.54.0 |
| 18 | **glob/minimatch/brace-expansion/nanoid/picomatch/lodash/js-yaml** | frontend (transitivos) | No | Múltiples HIGH (DoS) | Build/dev | `npm audit fix` |
| 19 | **react 18.3.1 vs fiber 9.5/drei 10.7** | frontend | Sí | (no CVE — **conflicto de peers**) | Runtime/build | ver §7 |
| 20 | **katex 0.18.9** | frontend | Sí | 1 LOW (proto-pollution) | Runtime | 0.18.2+ |

---

## 4. Vulnerabilidades críticas y altas **realmente explotables**

Se distinguen por **superficie de ataque real** (runtime expuesto por nginx `/api` y `/assist`, o `/infer` del AI service).

### 4.1 Críticas explotables

| ID | Paquete | Descripción | Explotabilidad |
|---|---|---|---|
| **CVE-2026-112398** (GHSA-5x8w-8jj5-q52h) | pillow | Heap buffer overflow en decodificación **FlashPix/FPX** → ejecución de código | **ALTA** — `/infer` acepta imágenes; una imagen FPX maliciosa compromete el proceso. |
| **CVE-2026-112403** (GHSA-8g5g-8vmr-9782) | pillow | Heap buffer overflow en **ImagingJpegDecode** | **ALTA** — JPEG es el formato más habitual en `/infer`. |
| **CVE-2026-112900** (GHSA-w889-685w-c8fh) | pillow | **Argument injection en llamada a Ghostscript** → RCE | **ALTA** si se procesan EPS/PDF; media si no. |
| **CVE-2026-96639** (GHSA-v9pv-5gc8-w2m6) | pillow | Reutilización de almacenamiento nativo tras transición de modo | **MEDIA-ALTA** |
| **GHSA-6q48-6c7w-9gw2** | certifi | Bundlea **raíces emSign con claves intermedias comprometidas** | **ALTA** — MITM de **todo** el TLS saliente (backend→ai_service, llamadas externas). |
| **CVE-2025-64459** (GHSA-frmv-pr5f-9mcr) | Django | **SQL injection** vía `_connector` en `QuerySet`/`Q` | **ALTA solo si el pin se quedó en el suelo 4.2.16**; **corregida en 4.2.30** (versión que pip instala hoy). |
| **CVE-2025-32434** (GHSA-53q9-r3pm-6pq6) | torch | `torch.load(weights_only=True)` → **RCE** | **BAJA** — benchmark offline con checkpoints propios. |
| **GHSA-547r-qmjm-8hvw** | md-to-pdf | Ejecución arbitraria de JS al parsear **front matter** | **BAJA** — herramienta **dev**, documentos del propio repo. |
| **GHSA-cg2g-xh64-v4q7** | dompurify | Bypass de `SAFE_FOR_TEMPLATES` → XSS | **BAJA-MEDIA** — render de Markdown del Knowledge Hub (documentos locales de confianza). |

### 4.2 Altas explotables

| ID | Paquete | Descripción | Explotabilidad |
|---|---|---|---|
| CVE-2026-114138 | djangorestframework | `Accept` con muchos parámetros consume ~19 s CPU/req | **ALTA** — DoS remoto trivial contra `/api`. |
| CVE-2026-114136 | djangorestframework | `JSONParser` aplica codec nombrado por el atacante | **MEDIA-ALTA** |
| CVE-2026-97687 | urllib3 | Config TLS de proxy HTTPS ignorada/sobreescrita | **MEDIA-ALTA** — MITM saliente. |
| CVE-2026-97689 | urllib3 | `stream()`/`read_chunked()` bufferiza línea de tamaño sin límite | **MEDIA** — DoS. |
| CVE-2026-15307 | Django | GeoDjango/GDAL: escrituras de fichero y peticiones salientes | **BAJA** — solo si se usa GeoDjango/GDAL (no evidenciado). |
| CVE-2026-24747 | torch | RCE vía checkpoints no confiables | **BAJA** — offline. |
| CVE-2026-96643 / 112406 / 112894 | pillow | DoS cuadrático (PNG eXIf, PDF page-tree) | **MEDIA** — DoS en `/infer`. |
| CVE-2026-97689 (variante) | sqlparse | ReDoS / DoS cuadrático | **BAJA** — requiere SQL no confiable. |
| GHSA-587h-7wmj-h5pm / -9jrq-… | vite | `launch-editor` / middleware personalizado | **BAJA** — **dev-server**; producción = nginx estático. |
| CVE-2026-32274 | black | Escrituras arbitrarias desde input no saneado | **BAJA** — dev. |

---

## 5. Dependencias obsoletas

| Dependencia | Versión actual | Estado | Alternativa |
|---|---|---|---|
| Django (línea 4.2, pin `<5.0`) | 4.2.x | **Línea en sunset** (ext. support hasta abr-2026) | 5.2 LTS / 6.x |
| eslint | 8.57.1 | **EOL** (v8 sin soporte) | 9.x (flat config) |
| vite | 5.4.21 | v5 superada | 7.x/8.x |
| tailwindcss | 3.4.18 | v3 superada | 4.x |
| reactflow | 11.11.4 | **Deprecado** (renombrado) | `@xyflow/react` |
| react-router-dom | 6.30.4 | v6 superada | 7.x |
| recharts | 2.15.4 | v2 superada | 3.x |
| md-to-pdf | 5.2.4 | Sin mantenimiento activo | puppeteer directo |
| puppeteer | 24.43.1 | 1 major por detrás | 25.x |
| marked | 17.0.0 (raíz) vs 18.0.6 (front) | **Duplicado/desalineado** | unificar 18.x |
| black / flake8 / mypy | 24.8.0 / 7.1.1 / 1.11.2 | Desactualizados | 26.x / 8.x / 1.2x |
| fastapi / uvicorn | 0.115.5 / 0.32.0 | Antiguas | 0.163.2 / 0.54.0 |
| numpy (benchmark) | 2.1.3 | Antigua | 2.5.5 |
| torch (benchmark) | 2.5.1 | Muy antigua | 2.15.0 |
| pillow (benchmark) | 12.3.0 | 1 major por detrás | 13.0.0 |

---

## 6. Dependencias sin uso aparente

| Dependencia | Fichero | Evidencia | Acción |
|---|---|---|---|
| **grip 1.6.0** | `package.json` (raíz) | **Deprecado**; **ningún** script lo referencia (`grep` sin usos) | Eliminar |
| **mysql-connector-python** | `src/ai_models/requirements.txt` | **Cero** imports de `mysql`/`mysql.connector` en el repo | Eliminar |
| **lcapy** | `src/ai_models/requirements.txt` | **Cero** imports de `lcapy` (solo aparece en el propio requirements y en docs) | Eliminar |

**Verificados como usados** (no eliminar): `psycopg2` (`fastapi_app.py:41-42,147-152`), `tensorflow` (`fastapi_app.py:202`), `SpeechRecognition` (`fastapi_app.py:38`), `gTTS`/`pydub` (`fastapi_app.py:39-40,531,634`), `tenacity` (adaptador IA), `simplejwt` (auth), `jsxgraph` (import dinámico en `jsxgraphAdapter.js`).

---

## 7. Dependencias bloqueadas por compatibilidad

| Bloqueo | Detalle | Desbloqueo |
|---|---|---|
| **@react-three/fiber 9.5.0 + drei 10.7.7 vs React 18.3.1** | fiber/drei **exigen React 19**; el proyecto es React 18. Lock generado con `--legacy-peer-deps`; en `npm ci` estricto → **ERESOLVE**. Único consumidor: `Telemetry3DScene.jsx` (`Canvas`, `OrbitControls`). | **Bajar** fiber→`^8.18.0` y drei→`^9.122.0` (**cero cambios de código**) — ya recomendado en `SIGCTIARURAL_DEPENDENCY_AUDIT.md`. Alternativa: subir React a 19 (mayor riesgo). |
| **react-router-dom** | El aviso moderado (open redirect) solo se corrige en **7.18.0** (major) | Salto 6→7 con pruebas de rutas |
| **vite / esbuild** | El aviso de esbuild se cierra solo con **vite 8** (major) | Salto 5→8 + plugins |
| **eslint 8→9** | Config plana obligatoria | Migración `.eslintrc`→`eslint.config.js` |
| **tailwind 3→4** | Reescritura de config/postcss | Salto mayor |
| **recharts 2→3** | API cambiada | Salto mayor |
| **reactflow → @xyflow/react** | Renombrado de paquete | Cambiar imports |
| **Django `<5.0`** | El cap impide 5.x/6.x | Evaluar con suite backend (240 tests) |

---

## 8. Quick wins de bajo riesgo

> Todos son **bumps de parche/menor** o **eliminaciones**, sin cambio de API. Ejecutables sin tocar código fuente.

| # | Acción | Fichero | Riesgo | Resultado |
|---|---|---|---|---|
| 1 | `certifi` → `2026.10.23` | backend | Muy bajo | Elimina **CRITICAL** (CA comprometida) |
| 2 | `urllib3` → `2.8.0` | backend | Muy bajo | Elimina 2 HIGH |
| 3 | `sqlparse` → `0.6.1` | backend | Muy bajo | Elimina 3 HIGH |
| 4 | `djangorestframework` → `3.18.3` | backend | Bajo | Elimina 3 HIGH |
| 5 | `black` → `26.10.1` | backend | Muy bajo (dev) | Elimina 2 HIGH |
| 6 | `pillow` (benchmark) → `13.0.0` | benchmark | Bajo | Elimina **5 CRIT + 24 HIGH** |
| 7 | `torch` (benchmark) → `2.15.0` | benchmark | Medio (benchmark) | Elimina **1 CRIT + 1 HIGH** |
| 8 | **Anclar** `python-multipart`, `requests`, `numpy`, `Pillow`, `tensorflow-cpu`, `SpeechRecognition`, `gTTS`, `pydub`, `psycopg2-binary` | ai_models | Muy bajo | Reproducibilidad + elimina el "0 no garantizado" |
| 9 | **Eliminar** `grip`, `mysql-connector-python`, `lcapy` | raíz / ai_models | Muy bajo | Menos superficie, imagen más pequeña |
| 10 | `npm audit fix` (sin `--force`) en `src/frontend` y raíz | ambos | Bajo | Cierra la mayoría de HIGH/MOD **no-major** |
| 11 | Unificar `marked` a `18.x` (raíz) | raíz | Muy bajo | Elimina duplicidad |
| 12 | Bajar `@react-three/fiber`→`^8.18.0` y `drei`→`^9.122.0` | frontend | Bajo (sin cambio de código) | Resuelve ERESOLVE |

**No son quick wins** (requieren misión de código): vite 8, eslint 9, tailwind 4, react-router 7, recharts 3, reactflow→@xyflow/react, Django 5.x/6.x.

---

## 9. Roadmap de actualización

### P0 — Inmediato (sin cambio funcional) · *1 sesión*
1. Bumps de parche/menor: `certifi`, `urllib3`, `sqlparse`, `djangorestframework`, `black` (backend); `pillow`, `torch` (benchmark).
2. Anclar las dependencias sin pin de `ai_models`.
3. Eliminar `grip`, `mysql-connector-python`, `lcapy`.
4. `npm audit fix` (no-major) en `src/frontend` y raíz; unificar `marked`.
5. Bajar fiber/drei a la línea React 18 (sin tocar código).
6. Verificar: suite backend (240), suite logger, `vite build`, `/health` (tf) intacto.

### P1 — Corto plazo · *1–2 sesiones*
7. Evaluar **Django** fuera de `<5.0` (5.2 LTS / 6.x) con la suite de 240 tests; nota: en el DB actual, 4.2.30 retiene **1 HIGH** (GeoDjango) y 5.2.9 aún 6 HIGH; **6.1.3 = 0**.
8. `md-to-pdf` bump (o retirar en favor de puppeteer directo) y `puppeteer` 25 (major dev).
9. `mermaid` 11.16.1 (arrastra el fix de dompurify) y `react-router-dom` → 7.18 con pruebas de rutas.
10. Reconstruir imágenes **solo** con orden explícita (rollback = `AI_BACKEND=tf` documentado en `ONNX_DEPLOY_01_REGISTER.md`).

### P2 — Medio plazo · *varias sesiones*
11. Mayores frontend: **vite 8**, **eslint 9** (flat config), **tailwind 4**, **recharts 3**, **reactflow → @xyflow/react**.
12. Decisión de plataforma React: **18 (bajar fiber/drei)** vs **19 (subir React)** — cerrar el conflicto de peers de forma definitiva.
13. Actualizar toolchain Python: `fastapi` 0.163, `uvicorn` 0.54, `numpy` 2.5.5 (benchmark), `flake8`/`mypy`.

### P3 — Estructural (deuda preventiva)
14. **Política de pin**: prohibir dependencias sin versión en `requirements*.txt` y `package.json`.
15. **Gate CI**: `npm audit --audit-level=high` + `pip-audit`/OSV en el pipeline; fallar el build ante CRITICAL/HIGH.
16. **SBOM** + revisión trimestral de dependencias.
17. Eliminar la duplicidad `Documentacion/` vs `docs/` de inventarios de dependencias (referenciar este informe como único).

---

## 10. Confirmación de no-cambios

- **NO** se modificó código fuente (`src/backend`, `src/ai_models`, `src/frontend`, `benchmark` intactos).
- **NO** se actualizó ni instaló ningún paquete (`npm audit`/OSV son de solo lectura).
- **NO** se modificaron `requirements*.txt` ni `package.json`/lockfiles.
- **NO** se reconstruyó ninguna imagen Docker; contenedores no tocados.
- **NO** hubo commit ni push.
- **Único entregable:** este archivo (`docs/SECURITY_SPRINT_01_REPORT.md`).

### Anclas de evidencia

| Ancla | Valor |
|---|---|
| Rama / HEAD | `feature/cmsc-f3c-v1-implementation` · `5308d79` |
| Fecha de consulta | 2026-11-17 (America/Bogota) |
| npm audit (frontend) | 24 vulns (1 crit, 13 high) |
| npm audit (raíz) | 39 vulns (1 crit, 31 high) |
| OSV críticos confirmados | `certifi` (CA comprometida) · `pillow` (×5) · `torch` (CVE-2025-32434) · `Django 4.2.16` (CVE-2025-64459, corregida en 4.2.30) |
| Fix más limpio | `pillow 13.0.0` · `torch 2.15.0` · `djangorestframework 3.18.3` · `urllib3 2.8.0` · `certifi 2026.10.23` · `sqlparse 0.6.1` → **0 avisos** |

---

**Registro:** `SECURITY-SPRINT-01` = auditoría completada · plan P0–P3 propuesto · **sin cambios aplicados** · sin commit · sin push.
