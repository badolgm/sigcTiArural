# DOCKER_READY_REMEDIATION_PLAN

## Plan de remediación para convertir `DOCKER_NOT_READY` → `DOCKER_READY`

- **Misión:** `DOCKER_READY_REMEDIATION_PLAN`
- **Naturaleza:** SOLO PLAN. NO implementar · NO dockerizar · NO modificar código · NO commits · NO push · NO OCI · NO Memory · **NO Qdrant**.
- **Método:** NO se re-audita. Se usan **exclusivamente** los hallazgos ya documentados.
- **Base (documentos, no re-descubrimiento):** `docs/DOCKER_OFFICIAL_EXECUTION_PLAN.md` (fuente de las 10 brechas H1–H10) · `docs/GO_NO_GO_EXECUTIVE_REVIEW.md` (§9 "Qué falta para Docker Oficial") · `docs/PRE_DOCKER_VISUAL_VALIDATION_REPORT.md` (`GO_DOCKER_OFFICIAL_PREPARATION` + validación visual humana pendiente) · `docs/FRONTEND_OFFICIALIZATION_PHASE_2_REPORT.md` (`GO_PHASE_2_COMPLETED`) · `docs/CANONICAL_ARCHITECTURE_FINAL_REPORT.md` (§F.1 "Antes de Docker Oficial") · `docs/AI_CANONICAL_STRATEGY_DECISION_REPORT.md` (`AI_CANON_HYBRID`).
- **HEAD de referencia:** `9109050` (`feature/cmsc-f3c-v1-implementation`).
- **Naturaleza:** SOLO PLAN. NO implementar · NO dockerizar · NO commits · NO OCI.

---

## 0. Dictamen

# `DOCKER_READY_POSSIBLE`

Los 10 bloqueos (`H1`–`H10`) tienen **ruta de remediación concreta y verificable**. Ninguno es irresoluble, ninguno exige rediseño arquitectónico, y ninguno toca los activos congelados. La secuencia completa se ejecuta en **8 pasos (R0–R7)** y culmina en verificación de runtime. La única condicionalidad fuerte es **H5 (IA canónica)**, que depende de una decisión de gobernanza pendiente (gate M1/M2) y admite cierre honesto alternativo.

---

## 1. Las 10 brechas (evidencia documentada · sin re-auditar)

| ID | Brecha | Evidencia documental | Naturaleza | Criticidad |
|---|---|---|---|---|
| **H1** | `backend` arranca con `manage.py runserver` (servidor de desarrollo) | `src/backend/Dockerfile:17`; `GO_NO_GO` §9 | **Código** (+ imagen) | 🔴 Crítico |
| **H2** | `backend`/`ai_service`/`frontend` **sin healthcheck** (solo `db`) | `docker-compose.yml` §1.1 del plan; `GO_NO_GO` §9 (nginx 🟡) | **Configuración** | 🟠 Medio |
| **H3** | Orden de arranque incompleto (`frontend.depends_on` sin `condition`) | `docker-compose.yml:98-99` | **Configuración** | 🟡 Bajo |
| **H4** | Backend monta `./src/backend:/app` → rompe inmutabilidad de imagen | `docker-compose.yml:50-51` | **Configuración** | 🟠 Medio |
| **H5** | `ai_service` sirve el `.h5` **histórico** (degenerado); canon = M1/M2 | `AI_CANONICAL_STRATEGY_DECISION_REPORT` (`AI_CANON_HYBRID`); `PLANT_DISEASE_MODEL_RECOVERY_REPORT` (`MODEL_RETRAIN_REQUIRED`) | **Código** + gobernanza | 🔴 Crítico |
| **H6** | nginx **no proxya `/assist`** (Voice) ni rutas IA fuera de `/api/` | `src/frontend/Dockerfile:43-57`; `VoiceAssistant.jsx:6-8,83` | **Configuración** (imagen) | 🟠 Medio |
| **H7** | Bundle hornea URLs `localhost` (`VITE_*`) → solo válido mismo host | `.env` VITE_*; `docker-compose.yml:91-94`; `FRONTEND §H` (D-1) | **Configuración de build** | 🔴 Crítico |
| **H8** | `.env` fuera de git; `.env.example` con URLs cloud; `SECRET_KEY` obligatoria con `DEBUG=false` | `settings.py:23-36`; `.env.example` | **Configuración/Ops** | 🟠 Medio |
| **H9** | `db-mysql` residuo en el stack | `docker-compose.yml:24-42`; `CANONICAL_ARCHITECTURE_FINAL_REPORT §D` (RF-3) | **Configuración** | 🟡 Bajo |
| **H10** | Sin registry, sin tag reproducible, sin docs de despliegue; daemon no verificado | `GO_NO_GO` §9; `CANONICAL_ARCHITECTURE_FINAL_REPORT` §F.1.2 | **Ops/Documental** | 🔴 Crítico (para *declarar*) |

> **No bloquean `Docker_READY`** (fuera de alcance por regla): Auth `QUARANTINED` · OCI · SIGCT Memory/Qdrant · `db-mysql` como dato histórico (solo se retira del stack activo) · deuda de lint en módulos congelados · Bridge/Dataset local-only (se declaran no-oficiales, no se dockerizan).

---

## 1bis. Respuestas solicitadas

### 1. ¿Cuáles son reales?

**Las 10 son reales** (todas con evidencia en archivo/reporte, no supuestos). Distinción de realidad operativa:
- **Reales y activas hoy**: H1, H2, H3, H4, H6, H7, H8, H9, H10.
- **Real pero condicionada a una decisión externa:** **H5** (existe y es real, pero su cierre depende del gate M1/M2, hoy `PENDIENTE`; `AI_CANON_HYBRID` ya decidió el rumbo).

### Q2. Cuáles son críticos

🔴 **Críticos (4):** **H1** (servidor de desarrollo no es oficial), **H5** (sirve un modelo degenerado/incorrecto), **H7** (el bundle solo funciona en el mismo host), **H10** (sin tag/registry/docs no se puede *declarar* oficial).

> Sin H1, H7 y H10 no hay "Docker Oficial". H5 es crítico de **honestidad y corrección**; tiene salida condicionada (§R5).

### Q3. Cuáles son documentales

- **Documentales puras:** **H10** (parte: `docs/DEPLOYMENT.md` + estrategia de tag) — y **H3** (orden de arranque se resuelve documentando/declarando en compose).
- **Documentales de gobernanza:** **H5** (la decisión M1/M2 y la política de serving).
- Todo lo demás es técnico. Contraste con `GO_NO_GO`: quedan además 2 pendientes documentales menores (C-5, A-5) que **no bloquean** Docker Oficial pero conviene cerrar (fuera de alcance de esta misión).

### Q4. Cuáles requieren código

| ID | Requiere código | Qué |
|---|---|---|
| **H1** | ✅ | Añadir WSGI (gunicorn/uvicorn) a `requirements.txt` + cambiar `CMD`. |
| **H5** | ✅ | Serving alineado al contrato neutral (export ONNX de M1/M2 + adapter), o etiquetado honesto de "modelo histórico". |
| **H6** | ⚠️ parcial | `default.conf` de nginx se **genera dentro del Dockerfile** → tocar la imagen (config embebida, no lógica de app). |
| **H7** | ⚠️ parcial | Cambiar defaults de build/Vite a mismo-origen; requiere coordinación con `endpoints.js`. |
| Resto | ❌ | Solo compose/env/ops. |

### Q5. Cuáles requieren configuración

**H2** (healthchecks), **H3** (`depends_on` + `condition`), **H4** (quitar volumen), **H6** (nginx), **H7** (build args/`.env`), **H8** (secretos/`.env`), **H9** (retirar `db-mysql`). Todas son de `docker-compose.yml`, `.env`, `.dockerignore` o `Dockerfile` — **sin lógica de aplicación**.

### Q6–Q8 → §3 (orden, dependencias y riesgo por bloqueo)

---

## 3. Orden exacto, dependencias y riesgo por bloqueo

### 3.1 Grafo de dependencias

```
H10 (registry+docs) ◄── depende de TODO lo demás (se cierra al final)
H2 (healthchecks) ◄── H1 (el healthcheck apunta al server de producción)
H1 (WSGI)         ◄── independiente (Dockerfile+requirements)
H6 (/assist)      ◄── H7 (mismo-origen necesita el proxy)
H7 (VITE mismo-origen) ◄── H6 (para que el navegador alcance /assist vía nginx)
H5 (IA canónica)  ◄── GATE externo: promoción M1/M2 (PENDIENTE) — NO controlable por este plan
H4, H8, H9, H3    ◄── independientes entre sí
```

### 3.2 Orden de remediación (exacto)

1. **H9** `db-mysql` (higiene del stack, sin riesgo) →
2. **H4** quitar volumen de código →
3. **H2 + H3** healthchecks + orden de arranque →
4. **H1** backend a producción (WSGI) →
5. **H7 + H6** mismo-origen VITE + proxy nginx `/assist` →
6. **H8** secretos/`.env` →
7. **H5** alineación IA (condicionado al gate M1/M2) →
8. **H10** tag + registry + docs de despliegue →
9. Verificación E2E → declarar `DOCKER_READY`.

### 3.3 Riesgo por bloqueo

| ID | Riesgo si NO se remedia | Sev. | Mitigación |
|---|---|---|---|
| H1 | Fuga/instabilidad de `runserver`; no apto para producción | 🔴 | WSGI con N workers + `restart`. |
| H2 | Arranques sin readiness; `depends_on` ciego | 🟠 | `healthcheck` por servicio + `condition: service_healthy`. |
| H3 | `frontend` arranca antes de `backend`; arranques intermitentes | 🟡 | `condition` en `frontend.depends_on`. |
| H4 | Imagen no inmutable; drift host↔contenedor | 🟠 | Quitar `./src/backend:/app`; reconstruir imagen. |
| H5 | Se sirve un modelo degenerado **como si fuera oficial** (rompe honestidad) | 🔴 | ONNX M1/M2 **o** etiqueta `HISTÓRICO` explícita en `/infer` + docs. |
| H6 | Voice Assistant 404 en contenedor nginx | 🟠 | `location /assist` → `ai_service:8081`. |
| H7 | Bundle solo funciona en el mismo host; despliegue remoto roto | 🔴 | Defaults mismo-origen (`/api…`); `VITE_*` relativas. |
| H8 | Secretos débiles/expuestos; `DEBUG=false` sin `SECRET_KEY` **rompe arranque** | 🟠 | `.env` gestionado fuera de git + `SECRET_KEY` real. |
| H9 | Servicio residuo consume recursos y confunde el stack | 🟡 | Retirar del compose activo conservando `mysql_data`. |
| H10 | Imposible reproducir/desplegar ni declarar oficial | 🔴 | Tag semver+SHA, `docker push`, `DEPLOYMENT.md`. |

---

## 4. Roadmap de remediación (R1 → R9)

> Cada R = unidad atómica autorizable. **NO se ejecuta aquí.** Cada R cierra uno o más H.

### R1 — Higiene del stack (H9, H4)
- Retirar `db-mysql` del compose activo (conservar volumen `mysql_data`; regla NADA DESAPARECE → mover a perfil/legacy, no borrar datos).
- Quitar `./src/backend:/app`; imagen inmutable.
- **Riesgo:** bajo · **Depende de:** nada.

### R2 — Orden de arranque y readiness (H2, H3)
- `healthcheck` en `backend` (`GET` a un endpoint de salud), `ai_service` (`GET /health`), `frontend` (`GET /`).
- `depends_on` con `condition: service_healthy`; `restart: unless-stopped` en los 3.
- **Riesgo:** bajo-medio · **Depende de:** R1 (compose estable) y R3 (endpoint de salud del backend).

### R3 — Backend de producción (H1)
- Añadir WSGI (`gunicorn`/`uvicorn`) a `requirements.txt`; `CMD` de producción (N workers); exponer `8000` igual.
- Exponer/definir endpoint de salud real para R2.
- **Riesgo:** medio (cambio de imagen) · **Depende de:** nada (habilita R2).

### R3bis — Secretos y entorno (H8)
- Estrategia de `.env` fuera de git; `SECRET_KEY` real; `DEBUG=false`; `ALLOWED_HOSTS`/`CORS` por entorno.
- **Riesgo:** medio · **Depende de:** nada.

### R4 — Mismo-origen y proxy (H7, H6)
- Defaults de `VITE_*` a **mismo-origen** (`/api/v3/ai/inference/`, `/assist`, `/api`) — coordinar con `config/endpoints.js`.
- Añadir `location /assist` (+ rutas IA necesarias) a nginx → `ai_service:8081`.
- **Riesgo:** medio · **Depende de:** R2 (red interna de compose lista).

### R5 — Alineación IA canónica (H5) — **CONDICIONADO**
- **Vía A (canónica):** export ONNX de M1/M2 + adapter neutral en `ai_service`. **Bloqueada** hasta que el gate de promoción M1/M2 se resuelva (PENDIENTE, fuera de este plan).
- **Vía B (honesta, desbloquea ya):** dejar el `.h5` pero etiquetarlo `HISTÓRICO` en `/infer` y en `docs`, y **no** presentarlo como oficial.
- **Riesgo:** alto de gobernanza · **Depende de:** decisión de Bernardo / gate M1-M2.

### R6 — Versionado, registry y documentación (H10)
- Estrategia de tag (`semver` + `git SHA`); `docker tag` + `docker push` a registry elegido (GHCR/ECR/…).
- `docs/DEPLOYMENT.md` (puertos, env, volúmenes, backup/rollback).
- **Nota:** esto es lo mínimo de "Docker Oficial"; firma/SBOM/SBOM escaneo = **OCI** (fuera de alcance).
- **Riesgo:** bajo · **Depende de:** R1–R5.

### R7 — Verificación E2E (§G del plan original, con daemon UP)
- `docker compose config` · build 4 servicios · healthchecks · migraciones · `/api` vía nginx · `/health`+`/infer` → `/assist` → SPA 200 → persistencia (sin `down -v`) → sin binarios en imagen → no-regresión multi-proyecto → sistemas congelados intactos · smoke 4/4.
- **Riesgo:** bajo · **Depende de:** R1–R6 + daemon Docker UP.

### R7.5 — Validación visual humana (pendiente de `PRE_DOCKER_VISUAL_VALIDATION_REPORT`)
- 16 capturas §J + DevTools. **No bloquea técnicamente**, pero es la condición de honestidad declarada antes de etiquetar "validado visualmente".

### R8 — Declarar oficial (H10 cierre)
- Tag de release + `DEPLOYMENT.md` publicado → **`DOCKER_READY`**.

### R9 — (Futuro, fuera de alcance) OCI · SIGCT Memory · Qdrant
- Explícitamente **excluidos** por esta misión.

---

## 5. Cuándo se alcanza el estado

```
DOCKER_NOT_READY
   │
   ├─ R1 higiene (H9,H4)
   ├─ R2 arranque/readiness (H2,H3)
   ├─ R3 backend prod (H1)
   ├─ R4 mismo-origen + /assist (H7,H6)
   ├─ R5 IA canónica (H5) ──► [GATE M1/M2 | o etiqueta HISTÓRICO]
   ├─ R6 tag + registry + docs (H10)
   ├─ R7 verificación E2E
   └─ R8 declarar ──► DOCKER_READY
```

Bloqueador único no controlable: **R5/H5** (decisión M1/M2). Con la Vía B (etiquetado honesto) el camino queda **desbloqueado** y `DOCKER_READY` es alcanzable sin esperar al gate.

---

## 6. Veredicto

# `DOCKER_READY_POSSIBLE`

- Las 10 brechas tienen remediación concreta, atómica y sin tocar módulos congelados.
- Orden óptimo: **R1→R8** (higiene → arranque → backend prod → red/origen → IA → versionado → verificación → declaración).
- Único condicionante: **H5** (gate M1/M2), con salida alternativa honesta (etiquetar el `.h5` como `HISTÓRICO`).
- Fuera de alcance por diseño: OCI, SIGCT Memory, Qdrant, Auth.

**NO se implementó · NO se dockerizó · NO se modificó código · NO hubo commits ni push.**
