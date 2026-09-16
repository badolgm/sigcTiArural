# SIGCTIARURAL_U1_BOOTSTRAP — Plan de ejecución de U1 (preparación de la implementación)

> **Familia:** Refactorización Global · **Gate:** U1 · **Estado:** `referencia` (plan de ejecución — sin código)
> **Fecha:** 14 de septiembre 2026 · **Rama:** `feature/ubtn-biological-telemetry`
> **Regla suprema:** NADA DESAPARECE. TODO SE PRESERVA. TODO SE CONECTA. TODO EVOLUCIONA.
> **Alcance:** responder exactamente las 12 preguntas del bootstrap de U1. NO se crea roadmap, visión, ADR ni teoría. La Dashboard Ganadora está aprobada; esto es el plan de aterrizaje.
> **Hechos de código verificados (solo lectura):** archivo, rutas y duplicaciones citados abajo fueron confirmados contra `src/frontend` antes de escribir.

---

## 0. Mapa de hechos (base del plan)

| Pieza | Archivo | Nota verificada |
|---|---|---|
| Constante de los 5 tiles | `src/frontend/src/pages/Dashboard.jsx:58` (`futureNodes`) | `RPI-05`, `FPGA-X`, `ARDUINO-UNO-Q`, `ALEXA-IOT`, `DRONE-NAV`, todos `status:'construction'` y `banner:'Placeholder de integración'` |
| Nodos BBB (copia de Dashboard) | `Dashboard.jsx:17-19` (`initialNodes`) | `BBB-01 Gateway`, `BBB-02 IA Edge/TFLite`, `BBB-03 Adquisición/IoT` |
| Nodos BBB (copia de App) | `App.jsx:39-41` (estado `nodes`) | Otra duplicación |
| Nodos BBB (copia de TopNav) | `TopNav.jsx:13-15` | Tercera duplicación |
| Nodos BBB (servicio) | `src/frontend/src/services/cloud.js:30-32` | BBB-01/02/03 construidos desde `fetchTelemetryEnvelope()` |
| Precedente de "verdad pedagógica" | `src/frontend/src/data/lab-data.js` | Único módulo de datos existente; patrón a replicar |
| Rutas existentes | `App.jsx:105-141` | `/dashboard`, `/labs`, `/ai-predictive`, `/data-science`, `/labs/robotics`, `/advanced-math`, `/advanced-math-v2`, `/lab-embedded`, `/lab-telecom`, `/lab-electronics`, `/knowledge`, `/knowledge/doc/:docId`, `/` (redirect), `*` = **14 rutas** |
| Índice del Knowledge Hub | `src/frontend/src/knowledge-hub/registry/knowledgeRegistry.generated.json` | Consumido por `docLoader.js` y `KnowledgeHubLayout.jsx` |
| 3D | `components/Telemetry3DScene.jsx` | Solo lo importa `RoboticsLab.jsx` (lazy) |

**Conclusión clave:** BBB-01/02/03 y los 5 tiles **ya están duplicados en múltiples capas**. El plan de U1 **no añade una cuarta capa que escriba**: añade una **copia de lectura** en el catálogo, y el Dashboard sigue siendo la fuente viva. Esto respeta NADA DESAPARECE y evita regresión.

---

## 1. ¿Qué archivo React sería el PRIMERO que tocarías?

**`src/frontend/src/data/catalog-data.js`** (nuevo módulo de datos estático; precedente `lab-data.js`).

- Crea con el contenido **copiado** de los 5 tiles de `futureNodes` + copias de lectura de BBB-01/02/03 + las 7 plataformas (ESP32, STM32, Arduino, Raspberry, Jetson, FPGA, MiniPC) con sus enlaces oficiales.
- Es un archivo **nuevo**: no toca ningún componente, página, servicio ni lógica existente.
- Primer archivo existente que se modifica (y único en U1.1): **`src/frontend/src/App.jsx`** — solo para **registrar la ruta** `/hardware-catalog` (import + una línea de `<Route>`).

## 2. ¿Por qué ese archivo es el primero?

- Es **100 % aditivo**: crear un módulo de datos no puede romper nada (nada lo importa todavía).
- Establece la **fuente de verdad aprobada por D-D** (módulo estático, patrón `lab-data.js`) antes de existir la vista que lo consume.
- Aplica **R-12 (copiar antes de realojar)**: la copia se hace ahora; el realojo del Dashboard (U1.3) se hará solo con paridad comprobada.
- Aísla el riesgo total de U1.1 en "archivos nuevos + 1 línea de ruta": si algo falla, se borran 2 archivos y la línea.

## 3. ¿Qué riesgo existe?

| Riesgo | Severidad | Mitigación |
|---|---|---|
| **Fuente dual** (`futureNodes` vs `catalog-data.js`) divergen entre U1.1 y U1.3 | Media (temporal, acotada) | Checklist de paridad en U1.3 antes de realojar; el catálogo es la referencia y el Dashboard queda intacto |
| **Enlaces rotos** heredados de `futureNodes` (href) | Baja | Copia idéntica de hrefs + prueba manual de clic en U1.1 |
| **Duplicación de BBB en 5 capas** (4 existentes + catálogo) | Baja | La copia del catálogo es de **lectura**; ninguna capa escribe; se unifica solo en U1.3 sin borrar ninguna fuente viva |
| **Ruta nueva sin alcanzable** (si la nav no se tocará hasta U1.2) | Baja (temporal) | U1.1 valida por URL directa; U1.2 añade el enlace de TopNav |

## 4. ¿Cómo revertirlo?

Todo lo de U1.1 es **aditivo → revertir = restar**:

1. Borrar `src/frontend/src/data/catalog-data.js`.
2. Borrar `src/frontend/src/pages/HardwareCatalogPage.jsx` (creado en U1.1).
3. Quitar del `App.jsx` el import y la línea de ruta `/hardware-catalog` añadidos.

No hay lógica existente alterada, por lo que **no existe un "estado roto" que restaurar**: la
reversión es completa en 3 pasos, sin commits y sin tocar `main`. (La restauración de U1.2-U1.4
sigue el mismo principio: quitar solo lo añadido.)

## 5. ¿Qué snapshot debe hacerse antes?

Antes del **primer archivo** (primer paso real de U1.0):

- **Copia** (no git, sin tocar el repo) hacia `C:\Users\BagmDev\AppData\Local\Temp\opencode\sigctiarural-u1-snapshot\` de:
  `src/frontend/src/App.jsx`, `src/frontend/src/pages/Dashboard.jsx`, `src/frontend/src/components/TopNav.jsx`, `src/frontend/src/data/lab-data.js`, `src/frontend/src/services/cloud.js`, `src/frontend/src/components/ClusterCard.jsx`, `src/frontend/src/labs/RoboticsLab.jsx`, `src/frontend/src/components/Telemetry3DScene.jsx`.
- **Regresión baseline** documentada en el snapshot: 14 rutas cargando, 3BBB con sus estados, gráficos del Dashboard, 3D de `/labs/robotics`, docs de `/knowledge` resolviendo, 12 comandos de voz respondiendo.

## 6. ¿Qué pruebas manuales deben ejecutarse?

**Baseline (antes de U1.1):**
1. Recorrer las 14 rutas; ninguna cae en error.
2. `/labs/robotics` renderiza la escena 3D (`Telemetry3DScene`).
3. Dashboard muestra las 3 BBB con sus estados (online/alert/offline) y los 5 tiles placeholders.
4. `/knowledge` y `/knowledge/doc/:docId` resuelven (docLoader sin `docId` roto).
5. Los 12 comandos de voz responden igual.
6. Consola sin errores.

**U1.1 (tras el cambio):**
1. `/hardware-catalog` renderiza: 5 tiles copiados (`construction`) + 3 BBB (`operativo`, copia lectura) + 7 plataformas (`diseño`).
2. Clic en cada enlace externo (Raspberry/AMD/Yosys/Arduino/Alexa/PX4/ArduPilot/STM/Jetson…) abre **sin 404**.
3. Dashboard **idéntico pixel a pixel** (mismo screenshot pre/post).
4. Regresión de las 14 rutas repetida.

## 7. ¿Qué rutas deben verificarse?

La **14 existentes** (App.jsx): `/dashboard`, `/labs`, `/ai-predictive`, `/data-science`, `/labs/robotics`, `/advanced-math`, `/advanced-math-v2`, `/lab-embedded`, `/lab-telecom`, `/lab-electronics`, `/knowledge`, `/knowledge/doc/:docId`, `/` (redirige a `/dashboard`), `*`.
La **1 nueva añadida en U1.1**: `/hardware-catalog`.

## 8. ¿Qué componentes NO deben tocarse en U1.1?

- `Dashboard.jsx` (incluido `futureNodes`, `initialNodes`, `chartData`, `LoginModal`, telemetría) — **intacto**.
- `TopNav.jsx` (voz/estado de BBB) — intacto (el enlace de catálogo se añade en U1.2).
- `ClusterCard.jsx`, `LoginModal.jsx`.
- `RoboticsLab.jsx` y `Telemetry3DScene.jsx` (Uso aditivo recién en U1.3, decisión R-13).
- Todas las páginas lab: `EmbeddedLab`, `TelecomLab`, `ElectronicsLab`, `DataScienceLab`, `AIPredictiva`, `AdvancedMathLab`, `AdvancedMathLabV2`, `LabCatalog`.
- Servicios: `cloud.js`, telemetría, EventBus — intactos.
- Knowledge Hub (registry JSON, `docLoader.js`, layouts) — intacto hasta U1.4.
- **Cualquier archivo de `src/backend`** y los contextos `Telemetry`/`SensorReading`/`RobotTelemetry`: prohibidos por restricción.

## 9. ¿Cómo introducir Hardware Catalog sin romper el Dashboard actual?

1. **Paso A — datos (U1.1a):** crear `catalog-data.js` con **copia íntegra** (ids originales `RPI-05`, `FPGA-X`, `ARDUINO-UNO-Q`, `ALEXA-IOT`, `DRONE-NAV`, mismos hrefs, `status:'construction'`) + `fase:'diseño'|'operativo'` explícita. Los 5 tiles del Dashboard **no se tocan**.
2. **Paso B — vista (U1.1b):** crear `HardwareCatalogPage.jsx` que solo lee `catalog-data.js` y `lab-data.js`.
3. **Paso C — ruta (U1.1c):** añadir únicamente el `Route` `/hardware-catalog` en `App.jsx`.
4. **Regla de paridad (U1.3):** el realojo del Dashboard **borra los 5 tiles** solo tras verificar que el catálogo contiene los mismos ids/enlaces (R-12). Mientras tanto conviven: Dashboard muestra los placeholders (como hoy) y el catálogo actúa como versión estructurada — **sin desconectar nada**.

## 10. ¿Cómo mantener BBB-01/BBB-02/BBB-03 visibles y funcionales?

- **No se toca ninguna de sus 4 ubicaciones actuales** (`App.jsx:39-41`, `Dashboard.jsx:17-19`, `TopNav.jsx:13-15`, `cloud.js:30-32`).
- El catálogo incorpora una **copia de lectura** de los 3 BBB (fase `operativo`) con enlace a la telemetría del Dashboard.
- La **funcionalidad sigue saliendo de la fuente viva**: el payload real proviene de `fetchTelemetryEnvelope()`/`cloud.js` y del estado `nodes` de App; el catálogo **nunca escribe** y no interfiere.
- Resultado: BBB se ven en el Dashboard (como hoy) **y** en el catálogo, sin regresión y sin código nuevo de telemetría.

## 11. ¿Cómo incorporar ESP32, STM32, Arduino, Raspberry, Jetson, FPGA, MiniPC sin alterar la lógica existente?

Como **datos puros** dentro de `catalog-data.js`, con la **misma forma** de los tiles existentes:

- Campos: `id`, `name`, `role`, `status`, `fase`, `icon`, `banner` (honesto: `diseño`/`operativo`), `links` (docs oficiales preservadas), `labs: []` que **apuntan a rutas de lab ya existentes** (Electrónica/Programación/IA/Telecom), sin crear ninguna ruta nueva.
- No se añade ningún componente, servicio, endpoint ni contexto. El catálogo es solo presentación + datos; la lógica de labs y telemetría queda intacta.

## 12. Plan exacto U1.1-U1.4 (criterio de éxito y rollback)

### U1.1 — Hardware Catalog (fuente de verdad + vista + ruta)
- **Archivos:** `catalog-data.js` (nuevo), `HardwareCatalogPage.jsx` (nuevo); `App.jsx` (1 línea de ruta).
- **Éxito:** `/hardware-catalog` muestra 5+3+7 tarjetas con enlaces sin 404; Dashboard idéntico; 14 rutas OK; consola limpia.
- **Rollback:** borrar 2 archivos + quitar la línea de ruta (resta total).

### U1.2 — Navegación y voz
- **Archivos:** `TopNav.jsx` (añadir enlace de catálogo; sin tocar comandos existentes); opcional comando de voz nuevo a `/hardware-catalog`.
- **Éxito:** enlace visible y activo; retroceso y navegación funcionan; los 12 comandos previos intactos.
- **Rollback:** quitar el enlace/alias añadidos.

### U1.3 — Transición del Dashboard (realojo honesto)
- **Archivos:** `Dashboard.jsx` (realojar `futureNodes` hacia catálogo tras **chequeo de paridad**; relabel del banner a estado honesto D-B; sección Telemetría con instancia **aditiva** de `Telemetry3DScene` R-13).
- **Éxito:** checklist de paridad superado; placeholders reubicados/convertidos en tarjetas enlazadas al catálogo; BBB y gráficos intactos; 3D de Robótica intacto; banner honesto.
- **Rollback:** restaurar el bloque `futureNodes` en `Dashboard.jsx` (resta del realojo; las copias del catálogo quedan intactas) y revertir el relabel.

### U1.4 — Amplificación del Knowledge Hub
- **Archivos:** `knowledgeRegistry.generated.json` (**aditivo**: registrar los docs nuevos de la familia SIGCTIARURAL/UBTN con su schema, sin generador D-C).
- **Éxito:** `/knowledge` y `/knowledge/doc/:docId` resuelven cada `docId` nuevo; sin tarjetas rotas.
- **Rollback:** quitar las entradas añadidas del JSON.

**Orden de bloqueo:** U1.1 requiere D-D firmada; U1.2 requiere D-A (latente) aprobada; U1.3 requiere D-B + R-13 + snapshot; U1.4 requiere D-C (diferido) aprobado.

---

## Resultado final

# **GO** — para comenzar U1.1.

**Justificación:** la Dashboard Ganadora está aprobada; los 6 bloqueantes tienen decisión firmable
(`SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md`); este plan muestra que el primer archivo es un **módulo
nuevo de datos** (no toca ningún componente), que todo lo de U1.1 es **aditivo y reversible por
resta**, y que BBB-01/02/03 y las 14 rutas se conservan al 100 %.

**Condiciones para ejecutar U1.1 (no para aprobar el plan):**
1. El dueño **firma las 6 decisiones** (D-A/D-B/D-C/D-D/D-A-7/R-13) — en especial **D-D** (fuente de verdad `catalog-data.js`).
2. Se confirma el **gate U1** (Fases 7-8 o acto de paso, según `DASHBOARD_REIMAGINED_V2` §11).
3. Se ejecuta el **snapshot y la regresión baseline** (§5-§6) justo antes del primer archivo.

No se escribió código. No se modificó `src/`. Sin commits, sin push. El único documento nuevo es este.

---

## Referencias
- [`SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md`](SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md) — decisiones D-A..R-13.
- [`SIGCTIARURAL_U1_GO_NO_GO.md`](SIGCTIARURAL_U1_GO_NO_GO.md) — auditoría original (NO GO).
- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — §10/§11.
- [`SIGCTIARURAL_REFACTORING_GUARDRAILS.md`](SIGCTIARURAL_REFACTORING_GUARDRAILS.md) — GR-08/09/11/12.
- Hechos verificados: `Dashboard.jsx` (futureNodes/initialNodes), `App.jsx` (rutas/nodes), `TopNav.jsx`, `cloud.js`, `data/lab-data.js`, `RoboticsLab.jsx`/`Telemetry3DScene.jsx`, `knowledge-hub/registry/`.