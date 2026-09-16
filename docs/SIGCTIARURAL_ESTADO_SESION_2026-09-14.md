# SIGCTIARURAL — Estado de sesión y pendientes para la próxima jornada

> **Familia:** Refactorización Global · **Fase:** U1 (preparación de implementación)
> **Fecha:** 14 de septiembre 2026 · **Rama:** `feature/ubtn-biological-telemetry` (sin commits/push)
> **Propósito:** guardar el estado exacto al terminar la jornada, para retomar mañana sin perder contexto. Solo documentación; `src/` intacto.

---

## 1. Dónde estamos (línea de tiempo del gate U1)

```
NO GO (auditoría final) ──► GO CON CONDICIONES (bloqueantes resueltos) ──► GO para U1.1 (plan de ejecución)
   SIGCTIARURAL_U1_GO_NO_GO.md     SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md     SIGCTIARURAL_U1_BOOTSTRAP.md
```

**Estado del máquina hoy:** diseño **cerrado**, decisiones **recomendadas y firmables**, plan de
implementación **listo**. Falta únicamente la **firma del dueño** (checklist abajo) y la lectura
del orden de arranque (abajo) para empezar a tocar React.

## 2. Qué se hizo hoy (entregables únicos por misión)

| Misión | Documento generado (único) | Veredicto |
|---|---|---|
| Auditoría final del gate U1 (9 docs revisados) | `docs/SIGCTIARURAL_U1_GO_NO_GO.md` | **NO GO** documentado |
| Resolución de bloqueantes (D-A/D-B/D-C/D-D/D-A-7/R-13) | `docs/SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md` | **GO CON CONDICIONES** |
| Bootstrap U1 real (plan de ejecución) | `docs/SIGCTIARURAL_U1_BOOTSTRAP.md` | **GO para U1.1** |

**Decisiones recomendadas (resueltas en código, solo lectura):**

| Bloqueante | Resolución recomendada |
|---|---|
| D-A Auth | Latente, sin rutas en U1 (solo vive en `Dashboard.jsx`). |
| D-B Banner | Preservado hasta U1.3; ahí relabel honesto (dato real, GR-08/09). |
| D-C Registry Gen. | Diferido: `generate_knowledge_registry.py` **no existe en el repo**; ampliación del JSON aditiva en U1.4. |
| D-D Fuente catálogo | **`catalog-data.js`** (módulo JS estático, patrón `lab-data.js`). |
| D-A-7 MVP UBTN | **Temperatura corporal (DS18B20)**; HR/actividad como fases posteriores. |
| R-13 Telemetry3DScene | Solo lo importa `RoboticsLab.jsx`. Uso **aditivo** (instancia extra en Telemetría en U1.3); Robótica intacta. |

## 3. Qué toca mañana (orden exacto para arrancar U1)

1. **Cerrar con el dueño el checklist de paso (firma de 6 decisiones + gate U1).**
   - [ ] D-A latente · [ ] D-B relabel · [ ] D-C diferido · [ ] D-D `catalog-data.js` · [ ] D-A-7 DS18B20 · [ ] R-13 aditivo
   - [ ] Confirmación del gate U1 (Fases 7-8 u override explícito del dueño, `DASHBOARD_REIMAGINED_V2` §11).
2. **U1.0 — snapshot + regresión baseline** ANTES del primer archivo:
   - Copiar a `C:\Users\BagmDev\AppData\Local\Temp\opencode\sigctiarural-u1-snapshot\`: `App.jsx`, `Dashboard.jsx`, `TopNav.jsx`, `data/lab-data.js`, `services/cloud.js`, `components/ClusterCard.jsx`, `labs/RoboticsLab.jsx`, `components/Telemetry3DScene.jsx`.
   - Regresión manual: 14 rutas, `/labs/robotics` 3D, 3 BBB, `/knowledge`, 12 comandos de voz, consola limpia.
3. **U1.1 — Hardware Catalog (único componente nuevo):**
   - Crear `src/frontend/src/data/catalog-data.js` (copiar íntegro `futureNodes` de `Dashboard.jsx:58` → RPI-05, FPGA-X, ARDUINO-UNO-Q, ALEXA-IOT, DRONE-NAV; copia de lectura BBB-01/02/03; plataformas ESP32/STM32/Arduino/Raspberry/Jetson/FPGA/MiniPC con enlaces oficiales y `fase` honesta).
   - Crear `src/frontend/src/pages/HardwareCatalogPage.jsx` (solo lee `catalog-data.js` y `lab-data.js`).
   - Modificar únicamente `App.jsx`: import + ruta `/hardware-catalog`.
   - **Prohibido tocar en U1.1:** `Dashboard.jsx`, `TopNav.jsx`, `ClusterCard.jsx`, `LoginModal.jsx`, `RoboticsLab.jsx`, `Telemetry3DScene.jsx`, labs, `cloud.js`, Knowledge Hub.
   - Criterio de éxito: `/hardware-catalog` renderiza 5+3+7 tarjetas, enlaces sin 404, Dashboard idéntico, 14 rutas OK.
   - Rollback: borrar los 2 archivos nuevos y la línea de ruta ("revertir por resta").

## 4. U1.2-U1.4 (backlog inmediato, referencias)

- **U1.2** Navegación: enlace de TopNav al catálogo (+ alias de voz opcional). Sin tocar comandos existentes.
- **U1.3** Realojo del Dashboard: solo tras **chequeo de paridad** con `catalog-data.js` (R-12); relabel del banner (D-B); Telemetría con instancia aditiva de `Telemetry3DScene` (R-13).
- **U1.4** Knowledge Hub: registrar aditivamente los docs SIGCTIARURAL en `knowledgeRegistry.generated.json` (sin generador); validar `/knowledge` y `/knowledge/doc/:docId`.

Detalle completo: `SIGCTIARURAL_U1_BOOTSTRAP.md` (§12).

## 5. Hechos verificados en código (para no re-explorar mañana)

- `futureNodes` = 5 tiles en `pages/Dashboard.jsx:58` (luego render en :223), todos `construction`.
- BBB-01/02/03 duplicados en 4 capas: `App.jsx:39-41`, `Dashboard.jsx:17-19`, `TopNav.jsx:13-15`, `services/cloud.js:30-32` (solo lectura; ninguna capa escribe).
- `Telemetry3DScene` importado SOLO por `labs/RoboticsLab.jsx:6` (lazy).
- `LoginModal`/`onRequireAuth` solo en `Dashboard.jsx`.
- Rutas (=14): `/dashboard`, `/labs`, `/ai-predictive`, `/data-science`, `/labs/robotics`, `/advanced-math`, `/advanced-math-v2`, `/lab-embedded`, `/lab-telecom`, `/lab-electronics`, `/knowledge`, `/knowledge/doc/:docId`, `/` (redirect), `*`.
- Único módulo de datos vigente: `data/lab-data.js` (patrón para `catalog-data.js`).
- `generate_knowledge_registry.py` no existe en el repo; registry consumido por `docLoader.js` y `KnowledgeHubLayout.jsx`.

## 6. Bitácoras actualizadas hoy

- `docs/MASTERDOC.md` → **v8.7** (nueva entrada de bitácora U1 + 3 referencias en Apéndice A).
- `docs/PLAN_MAESTRO.md` → **v8.6** (header, tabla de referencias +3, footer).
- `SIGCT_RURAL_SYSTEM_BOOT.md` → bloque de continuidad U1, ítems 65-67 de la Fase 6, nota de Fase 6.
- `README.md` → bullet "Preparación de U1" y fila 13 del Mapa Documental.

## 7. Restricciones que siguen vigentes mañana (hasta nueva orden)

- Prohibido: `git commit/push/merge/rebase`, modificar `main`, `src/backend`, `Telemetry Context`, `SensorReading`, `RobotTelemetry`.
- Nada se toca sin: firmas del dueño + gate U1 confirmado + snapshot U1.0.
- Regla suprema: **NADA DESAPARECE. TODO SE PRESERVA. TODO SE CONECTA. TODO EVOLUCIONA.**

## 8. Referencias rápidas

- [`SIGCTIARURAL_U1_GO_NO_GO.md`](SIGCTIARURAL_U1_GO_NO_GO.md)
- [`SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md`](SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md)
- [`SIGCTIARURAL_U1_BOOTSTRAP.md`](SIGCTIARURAL_U1_BOOTSTRAP.md)
- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) (§10/§11)
- [`SIGCTIARURAL_REFACTORING_GUARDRAILS.md`](SIGCTIARURAL_REFACTORING_GUARDRAILS.md) (GR-01..12)