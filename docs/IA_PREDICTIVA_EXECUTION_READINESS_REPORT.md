# IA PREDICTIVA — EXECUTION READINESS REPORT

> **Proyecto:** SIGCT-Rural
> **Misión:** `IA_PREDICTIVA_RECOVERY_EXECUTION_READINESS`
> **Base:** `IA_PREDICTIVA_REALITY_REPORT` (**`IA_NO_OPERATIVA`**) + `IA_PREDICTIVA_RECOVERY_EXECUTION_PLAN` (**`MEDIUM_FIX`**)
> **Naturaleza:** SOLO ANÁLISIS. **NO implementar. NO modificar código. NO commits. NO push.**
> **Fecha:** 2026-10-13

## DICTAMEN: `SAFE_TO_EXECUTE` (condicionado)

El plan de recuperación es **seguro de ejecutar** porque es **aislado** (solo toca `src/ai_models` y el arranque de contenedores), **reversible** y **no toca ningún sistema protegido**. Sujeto a **5 condiciones obligatorias** (ver Dictamen final). Sin esas condiciones → `NOT_SAFE_TO_EXECUTE`.

---

## 1. Riesgo real de ejecutar el plan de recuperación

**Riesgo global: BAJO** (con 3 riesgos concretos y mitigables).

| Clase | Riesgo | Severidad | Detalle |
|-------|--------|:--------:|---------|
| **A. Código compartido** | **Ninguno** | — | El fix futuro vive en `src/ai_models/fastapi_app.py`, que **solo** sirve al contenedor `ai_service`. Ningún otro módulo lo importa. |
| **B. Contenedores** | `docker compose up -d --build` **sin args** recrearía/rebuildaría TODO (incl. `frontend`), y `docker compose down -v` **destruiría el volumen `postgres_data`** | Alto | **Mitigación dura:** usar **siempre** argumentos explícitos (`db`, `backend`, `ai_service`). Nunca `down -v`. |
| **C. Base de datos** | `manage.py migrate` aplica migraciones pendientes sobre el volumen compartido `postgres_data` | Medio | Solo hay 2 migraciones (`0001_initial`, `0002_robot_*`), casi con seguridad ya aplicadas (BD reconciliada). **Gate:** `migrate --plan` + `pg_dump` antes. |
| **D. Runtime compartido** | Rebuild de `backend`/`ai_service` provoca un **blip** de segundos | Bajo | `backend` monta `./src/backend` (edit→restart, sin rebuild); `ai_service` sin volumen. |
| **E. Honestidad científica** | Publicar `confidence` del modelo degenerado como válida | Alto (si se ignora) | El fix de normalización es requisito para que los resultados sean creíbles; sin él, no publicar. |

---

## 2. Impacto sobre los sistemas protegidos

| Sistema | Impacto esperado | Justificación |
|---------|:---------------:|---------------|
| **Dashboard** | **Nulo / positivo** | `Dashboard.jsx` (frontend) consume backend `:8010`. Levantar el backend **restaura** telemetría; no rompe. Blip de segundos en rebuild. |
| **CMSC** | **Nulo (vigilar) ⚠️** | `pages/cmsc/ModelPredictCell.jsx` importa **exports** de `AIPredictiva` (`AI_INFERENCE_URL`, `buildInfoFromOfficialResponse`, `getStatusPresentation`). El fix vive en `ai_service` (Python) y **no cambia el contrato** JSON ⇒ CMSC intacto. Cualquier cambio de contrato sería **fuera de alcance**. |
| **Knowledge Hub** | **Nulo** | 100 % frontend (`docLoader` + registry). No toca backend ni `ai_service`. |
| **Laboratorios** | **Nulo** | Labs son frontend; los que usan IA/telemetría pasan por `:8010` (se restaura, no se rompe). |
| **Hardware** | **Nulo** | Frontend estático; sin dependencia del pipeline acústico/IA. |
| **Dataset** | **Nulo** | Vive en `data/` (fuera de git, file-based). El recovery no lee ni escribe dataset. |
| **Bridge** | **Nulo** | `tools/cmsc-data-logger/bridge/server.js` (Node, `:8766`) es un proceso aparte. No comparte contenedor ni código con `ai_service`. |

> **Ninguno de los 7 sistemas comparte código con el punto de corrección (`src/ai_models/fastapi_app.py`).** El único recurso compartido es el **volumen PostgreSQL**, tocado solo por `migrate`.

---

## 3. Archivos que SERÍAN modificados (por la futura corrección F4)

| Archivo | Tipo de cambio | ¿Rebuild? |
|---------|----------------|:---------:|
| `src/ai_models/fastapi_app.py` (`preprocess_image`, `:187-195`) | **Primario y único obligatorio**: quitar `mobilenet_v2.preprocess_input` (`:192`) | **Sí** (`ai_service`) |
| `src/ai_models/production_models/model_metadata.json` | **Opcional** (metadatos: `input_range`) | No |
| `src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py` (`:116`) | **Opcional cosmético** (`source_mode`) | No (volumen) |
| `src/ai_models/train_plant_disease_mobilenet.py` | **Solo si MAJOR_FIX** (reentrenar) | Sí |

**En fase read-only (esta misión): CERO archivos.** En F4: **1 archivo de código**.

---

## 4. Archivos que NO serán modificados

- **CMSC:** `pages/cmsc/**` (`ModelPredictCell.jsx`, `AcpCell.jsx`, `EvidencePanel.jsx`, `signalCatalog.js`, `honesty.js`, …).
- **Dashboard:** `pages/Dashboard.jsx`, `pages/cmsc/*Dashboard*`.
- **Laboratorios:** `pages/DataScienceLab.jsx`, `ElectronicsLab.jsx`, `TelecomLab.jsx`, `AdvancedMathLabV2.jsx`, `pages/cmsc/*Cell*`.
- **Hardware:** páginas y componentes hardware.
- **Knowledge Hub:** `knowledge-hub/**`, `docLoader.js`, `knowledgeRegistry.generated.json`.
- **Dataset:** `data/datasets/sigct_rural_acoustic/**`, `tools/cmsc-data-logger/**` (incl. `src/ingest.js`), `metadata/**`.
- **Bridge:** `tools/cmsc-data-logger/bridge/server.js`, `src/stats.js`.
- **Infra/otros:** `docker-compose.yml` (salvo `AI_SERVICE_URL` para host), `.env`, `.dockerignore`, `plant_disease_mbv2.h5` (el artefacto **no** se sobreescribe), `src/frontend/**`, `AuthContext.jsx` (QUARANTINED).
- **Ninguna migración** nueva de BD.

---

## 5. Validaciones obligatorias ANTES de tocar código

| # | Validación | Criterio |
|---|-----------|----------|
| P1 | **Read-only F0–F3 completas** | Servicios arriba, modelo carga, colapso reproducido **antes** de editar nada. |
| P2 | **Estado base sano** | `frontend :5173` responde `200`; `backend` endpoints responden; los 7 sistemas verificados siguen OK tras levantar servicios. |
| P3 | **Migraciones inspeccionadas** | `manage.py showmigrations --plan` → confirmar que **no** hay migraciones destructivas pendientes. |
| P4 | **Backup de BD** | `pg_dump` del volumen antes de cualquier `migrate` (ver §7). |
| P5 | **Snapshot de código** | `git status` limpio **del archivo** `src/ai_models/fastapi_app.py` (committed, sin ediciones locales) + tag en HEAD (ver §7). |
| P6 | **Aislamiento confirmado** | `docker compose config` sin `volumes` compartidos entre `ai_service` y otros salvo la BD. |
| P7 | **Gate de decisión F3** | Dos imágenes → mismo `raw_class_index` (confirma el bug a corregir). |

**Sin P1–P7 en verde, NO se pasa a F4.**

---

## 6. Rollback requerido

| Capa | Procedimiento | Reversible |
|------|---------------|:---------:|
| **Código (F4)** | `git checkout -- src/ai_models/fastapi_app.py` + `docker compose up -d --build ai_service` | Sí (1 archivo) |
| **Contenedor** | `docker compose stop ai_service` / `docker compose rm -f ai_service` (no destructivo) | Sí |
| **BD (solo si `migrate`)** | Restaurar el `pg_dump` de P4: `docker compose exec -T db psql -U $DB_USER -d $DB_NAME < backup.sql` | Sí (con backup) |
| **Frontend / 7 sistemas** | **No requiere rollback** (no se tocaron) | N/A |
| **PROHIBIDO** | `docker compose down -v` (borra `postgres_data`) · `git reset --hard` sobre trabajo no respaldado · `stash drop` | — |

---

## 7. ¿Es suficiente el backup actual?

**Respuesta: SUFICIENTE PARA CÓDIGO · INSUFICIENTE PARA BD. Añadir 2 refuerzos.**

**Existe y verificado:**
- `tag PRE_DOCKER_OFFICIAL_2026_10_13` → `415ee2b` ✅
- `branch backup/pre_frontend_phase2_execution` → `415ee2b` ✅
- `stash@{0} PRE_MULTI_AGENT_2026_09_29` (rama `feature/ubtn-biological-telemetry`) → **intacto, NO tocar** ✅

**Brechas detectadas:**
1. **Los respaldos apuntan a `415ee2b` (2026-10-12 22:01), NO al HEAD actual `9109050` (2026-10-13 20:08).** El commit de frontend `9109050` está en historia (recuperable), y el archivo a corregir (`fastapi_app.py`) está **committed y limpio** ⇒ rollback de código garantizado vía git. **Pero** el estado no está "congelado" en un tag.
2. **No existe backup de la BD** (solo `schema_postgresql.sql` = esquema, sin datos). Si `migrate` aplica algo, no hay punto de restauración de datos.
3. El `.dockerignore` modificado (uncommitted) **no** está en los respaldos — **irrelevante** para este recovery (afecta al build del *frontend*, que no se toca).

**Refuerzos recomendados antes de F4:**
- **(R-a)** `git tag PRE_IA_RECOVERY_2026_10_13 HEAD` (congelar el estado real).
- **(R-b)** `docker compose exec -T db pg_dump -U $DB_USER $DB_NAME > .local_backups/ia_recovery_pg_2026_10_13.sql` (BD).
- Ambos fuera de git (`.local_backups/` ignorado).

**Veredicto de backup:** los respaldos existentes **bastan para revertir el único archivo de código** que se tocaría; **no bastan para la BD**. Con (R-a)+(R-b) ⇒ **cobertura completa**.

---

## 8. Verificación EN VIVO (read-only, 2026-10-13)

Comprobación no mutante ejecutada para confirmar los supuestos de este reporte. **No se arrancó ningún servicio ni se modificó nada.**

### 9.1 Respaldos — CONFIRMADOS ✅
- `tag PRE_DOCKER_OFFICIAL_2026_10_13` → `415ee2b` ✅
- `branch backup/pre_frontend_phase2_execution` → `415ee2b` ✅
- `stash@{0} PRE_MULTI_AGENT_2026_09_29` (**rama `feature/ubtn-biological-telemetry`**) → **intacto, NO tocar** ✅

### 9.2 Puertos (host) — SIN CONFLICTO con el recovery
| Puerto | Servicio | Estado | Relevancia |
|:------:|----------|:------:|------------|
| `8010` | backend SIGCT | **CLOSED** | Libre → sin conflicto al levantar `backend` ✅ |
| `8081` | ai_service SIGCT | **CLOSED** | Libre → sin conflicto al levantar `ai_service` ✅ |
| `5173` | Vite dev (SIGCT) | **OPEN** | ⚠️ Ocupado por Vite; **no** levantar `sigctiarural_frontend` (mapea `5173:80`) |
| `8766` | bridge CMSC | **CLOSED** | Bridge apagado; recuperación IA no lo necesita |

### 9.3 ⚠️ HALLAZGO NUEVO — el host Docker es **MULTI-PROYECTO**

`docker ps` muestra **16 contenedores de 4 proyectos distintos** corriendo simultáneamente:

| Proyecto | Contenedores | Puertos |
|----------|--------------|---------|
| **SIGCT-Rural** (este repo) | `sigctiarural_postgres_db`, `sigctiarural_mysql_db` | `5544`, `3316` |
| **Vetna** | `vetna_frontend`, `vetna_ai`, `vetna_gateway`, `vetna_usuarios`, `vetna_pedidos`, `vetna_tiendas`, `vetna_postgres`, `vetna_rabbitmq`, `vetna_redis` | `4200`, `3003`, `8080`, `3000-3002`, `5432`, `5672/15672`, `6379` |
| **EIARC** | `eiarc_api`, `eiarc_mqtt`, `eiarc_db` | `8002`, `1883/9001`, `5434` |
| **servsoftbagm** | `servsoftbagm-db-1` | `5433` |

**Implicaciones para el recovery:**
1. **Contención de recursos (riesgo nuevo):** hay 16 contenedores activos; el build/arranque de `ai_service` (TensorFlow-CPU, imagen >1 GB, alto consumo de RAM/CPU) compite por recursos del host. **Verificar RAM/CPU disponibles antes de F1.3.**
2. **Aislamiento de `docker compose`:** los servicios de este repo usan `container_name` explícito (`sigctiarural_*`) y volumen propio (`postgres_data`); un `up` con args explícitos **no** toca Vetna/EIARC/servsoftbagm. Un `up` sin args **solo** afectaría al proyecto SIGCT (por el `docker-compose.yml` local), pero arrancaría `frontend` → **colisión en `:5173`**.
3. **Contenedores homónimos parcial:** existen `eiarc_api`/EIARC ↔ relación mencionada en `AGENTS.md`; **no confundir** esos contenedores con los de SIGCT-Rural (`sigctiarural_*`).
4. **Instancias Postgres:** 4 instancias en puertos distintos (`5432/5433/5434/5544`); `sigctiarural_postgres_db` en `5544` **sin solapamiento** ✅.

> Conclusión de 9.3: el hallazgo **no invalida** el dictamen, pero **añade una condición #5** (recursos del host + no arrancar `frontend`).

---

## 9. Evidencia a recopilar durante la corrección

1. `git tag` de congelamiento (R-a) + `git rev-parse HEAD`.
2. `pg_dump` de la BD (R-b) y su tamaño/hash.
3. `docker compose ps` **antes** (solo db/db-mysql) y **después** (backend+ai_service `Up`).
4. `migrate --plan` (sin pendientes destructivas) y salida de `migrate`.
5. `GET :8081/health` → `{status:"ok", model_loaded:"plant_disease_mbv2.h5"}`.
6. **Pre-fix:** dos inferencias (2 imágenes) → mismo `raw_class_index` (colapso).
7. **Post-fix:** las mismas 2 inferencias → `raw_class_index` **distintos**.
8. `git diff` exacto del fix (`fastapi_app.py`, 1 archivo).
9. `infer_log.jsonl` con checkpoint temporal (no mezclar pre/post).
10. Verificación de no-regresión: `frontend :5173 = 200`, `backend` endpoints, y **confirmación explícita de que CMSC/Dashboard/Labs/Hardware/KH/Dataset/Bridge siguen intactos** (`git status` sin cambios en esas rutas).
11. Captura de UI del modo `real` (validación humana).
12. Estado honesto declarado: `binary_only` / no validado científicamente.

---

## Dictamen

## `SAFE_TO_EXECUTE` — condicionado

**El plan es seguro:** aislado (1 archivo en `ai_service`), reversible (git + stop de contenedor), y **no toca ningún sistema protegido** (CMSC, Dashboard, Laboratorios, Hardware, Knowledge Hub, Dataset, Bridge comparten **cero** código con `src/ai_models/fastapi_app.py`).

**Condiciones ineludibles:**
1. Ejecutar **solo** F0–F3 y F5 read-only; **F4 en misión de código aparte**.
2. **Nunca** `docker compose up -d --build` sin args; **nunca** `docker compose down -v`.
3. Antes de `migrate`: `--plan` + `pg_dump` (R-b); y `git tag` en HEAD (R-a).
4. **NO tocar** `stash@{0}`, `.dockerignore` (uncommitted, ajeno), ni rutas de los 7 sistemas.
5. **(Nueva, §8.3)** Verificar RAM/CPU libres del host **multi-proyecto** (16 contenedores activos) antes de build/arranque de `ai_service`; **no** arrancar `sigctiarural_frontend` (colisión `:5173`).

**Con estas 5 condiciones ⇒ `NOT_SAFE_TO_EXECUTE` no aplica.** Si se viola cualquiera (en especial #2, #3 o #5), el dictamen cambia a `NOT_SAFE_TO_EXECUTE`.

**Confirmación en vivo (2026-10-13):** los supuestos del dictamen fueron re-verificados de forma no mutante — respaldos presentes, puertos `8010`/`8081` libres, `5173` ocupado por Vite, y host multi-proyecto detectado (§8). Dictamen **ratificado: `SAFE_TO_EXECUTE` (condicionado)**.

*NADA DESAPARECE. Solo análisis; sin código, sin commits, sin push.*
