# SIGCT-Rural — RECOVERY BOOT MASTER

**Propósito:** este es el documento que CUALQUIER asistente de IA (Claude, Trae, Gemini, u otro) debe leer PRIMERO, antes de cualquier otra cosa, al iniciar una sesión de trabajo en este repositorio — especialmente después de una interrupción, un reinicio del sistema, un error, o cualquier situación donde el estado del proyecto no esté claro.

Es el equivalente de la BIOS: arranca lo más básico primero, confirma que el terreno es seguro, y solo entonces permite continuar con el trabajo normal.

---

## PASO 0 — Regla de oro antes de leer nada más

**No toques ningún archivo. No ejecutes ningún comando de escritura. No hagas git add/commit/push/merge/reset. Este documento es de solo lectura hasta el PASO 5.**

---

## PASO 1 — Confirmar dónde estás parado

Ejecuta, en este orden, y compara contra lo esperado:

```bash
pwd
# Esperado: termina en .../ProjectsAndDatasets/sigcTiArural

git status
# Esperado (a la fecha de este documento): rama main, N commits
# adelante de origin/main, sin push. 5 archivos untracked:
# CLAUDE.md, PLAN_20_DIAS.md, docs/CONTINUITY_MASTER.md,
# docs/ECOSYSTEM_IDENTITY.md, docs/sena_artifacts/PnatallasReadme_Vistas.docx

git log --oneline -1
# Confirma el último commit real — compáralo contra la sección
# "ÚLTIMO ESTADO CONOCIDO" más abajo en este mismo documento.
```

Si `git status` muestra algo que este documento no anticipa (archivos modificados que no deberían estarlo, una rama distinta a `main`, commits que no aparecen en la lista de abajo), **DETENTE** y repórtalo al usuario antes de continuar. No asumas que está bien.

---

## PASO 2 — Leer la memoria de proyecto, en este orden exacto

1. **`CLAUDE.md`** (raíz del repo) — reglas de oro, identidad del ecosistema, estado técnico verificado, modo de operación (Arquitecto de Software Senior).
2. **`PLAN_20_DIAS.md`** (raíz del repo) — en qué día/semana del plan estamos, qué sigue.
3. **`docs/ECOSYSTEM_IDENTITY.md`** — la identidad canónica completa, si la tarea del día la necesita.
4. **Este mismo archivo** (`RECOVERY_BOOT_MASTER.md`) hasta el final, para conocer los puntos de restauración disponibles.

No empieces ninguna tarea sin haber leído al menos `CLAUDE.md` y `PLAN_20_DIAS.md`.

---

## PASO 3 — Puntos de restauración disponibles (backups reales, verificados)

### Backup pre-Día 8 (scaffold de `contexts/`)

Creado: 20-jul-2026, ~21:48-21:49, antes de crear la carpeta `contexts/labs/`.

| Mecanismo | Nombre/ruta exacta | Qué protege |
|---|---|---|
| Tag de git | `pre-contexts-labs-scaffold-20jul2026` | Todo el historial de commits hasta `981a3f0` inclusive |
| Rama de respaldo | `backup/pre-day8-20jul2026` | Mismo punto que el tag, accesible como rama |
| Bundle de git | `../BACKUP_sigcTiArural_pre_day8_20jul2026.bundle` (≈40.7 MB, un nivel arriba del repo) | Historial completo de git, todas las ramas, en un solo archivo portable |
| Copia de archivos untracked | `../BACKUP_untracked_pre_day8_20jul2026/` (un nivel arriba del repo) | `CLAUDE.md`, `PLAN_20_DIAS.md`, `docs/CONTINUITY_MASTER.md`, `docs/ECOSYSTEM_IDENTITY.md`, `docs/local/`, `docs/sena_artifacts/` — todo lo que git NO rastrea todavía |

**Último commit conocido bueno antes del scaffold:** `981a3f0` — "docs(architecture): correct labs migration source from V3 to V2, with evidence (Día 8 prep)"

### Cómo restaurar (solo si el usuario lo autoriza explícitamente — NUNCA automático)

**Opción A — Volver el working directory al estado exacto de antes del Día 8:**
```bash
git status   # revisa qué hay que perder antes de hacerlo
git reset --hard pre-contexts-labs-scaffold-20jul2026
```

**Opción B — Si el repo local está corrupto o irrecuperable, restaurar desde el bundle en una carpeta nueva:**
```bash
git clone ../BACKUP_sigcTiArural_pre_day8_20jul2026.bundle sigcTiArural_restaurado
cd sigcTiArural_restaurado
cp ../BACKUP_untracked_pre_day8_20jul2026/CLAUDE.md .
cp ../BACKUP_untracked_pre_day8_20jul2026/PLAN_20_DIAS.md .
cp ../BACKUP_untracked_pre_day8_20jul2026/ECOSYSTEM_IDENTITY.md docs/
cp ../BACKUP_untracked_pre_day8_20jul2026/CONTINUITY_MASTER.md docs/
cp -r ../BACKUP_untracked_pre_day8_20jul2026/local docs/
cp -r ../BACKUP_untracked_pre_day8_20jul2026/sena_artifacts docs/
```

**Opción C — Solo recuperar los archivos untracked sin tocar git:**
```bash
cp ../BACKUP_untracked_pre_day8_20jul2026/* . 
# y las carpetas según corresponda, ver Opción B
```

---

## PASO 4 — Historial de commits verificados de la sesión del 20-jul-2026

En orden, con hash real (para ubicarte si `git log` muestra algo distinto):

```
981a3f0 docs(architecture): correct labs migration source from V3 to V2, with evidence (Día 8 prep)
5a49e7f docs(architecture): reconcile bounded contexts into a single definitive list (Día 6-7)
7457b20 docs(diagrams): add implementation-maturity annotations to 8 legacy diagrams (Día 5, Parte 2)
5a2504d docs(assets): fix Knowledge Hub status, container ports, and archive duplicate diagrams (Día 5, Parte 1)
dc13162 refactor(knowledge-hub): incorporate EDGE_SETUP/API_REFERENCE and retire remaining legacy Docs*.jsx (Día 4, Fase B)
c090a4e refactor(frontend): retire 3 low-risk legacy Docs*.jsx pages (Día 4, Fase A)
fc36f39 docs(readme): align README with verified project reality (Día 3)
fb98e4f docs(eiarc): mark legacy EIARC identity definitions as superseded
8b22f3e feat(fase-9): consolidate knowledge hub, docker deployment and ecosystem UX  ← commit de origin/main
```

Ninguno de estos 8 commits (fb98e4f a 981a3f0) ha sido pusheado a GitHub todavía — existen solo localmente. Si algún día `git log` no muestra alguno de estos hashes, algo se perdió y hay que investigar antes de continuar.

---

## PASO 5 — Ahora sí, continuar

Una vez completado el PASO 1-4 sin sorpresas, retoma la tarea indicada en `PLAN_20_DIAS.md` para el día correspondiente. Antes de ejecutar cualquier cambio, sigue las reglas de oro de `CLAUDE.md` (autorización explícita para git, mostrar git status antes/después, nunca borrar del disco).

---

## Mantenimiento de este documento

Cada vez que se cree un nuevo punto de restauración (nuevo tag/rama/bundle antes de una fase de riesgo), este documento debe actualizarse agregando una nueva entrada en el PASO 3, sin borrar las anteriores — mismo principio de "se corrige, no se oculta" que rige el resto del proyecto.
