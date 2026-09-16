# SIGCTiArural — Auditoría Crítica de la Refactorización (Misión 8 + Final)

> **Estado:** U0.5 (Gate 0). Diseño. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-14
> **Familia:** Refactorización Global (Gate U0.5)

---

## 1. Metodología

Se auditan las 7 propuestas (Misiones 1-7) contra la realidad del repositorio (frontend real, backend hexagonal, Knowledge Hub operativo, BBB 0 bytes) y contra la identidad canónica (`docs/ECOSYSTEM_IDENTITY.md`). El auditor es el mismo autor: se busca **destruir** las propuestas, no defenderlas.

---

## 2. Veredicto resumen

**El diseño es correcto en dirección, pero contiene 5 contradicciones internas, 2 errores conceptuales, 2 duplicidades, riesgo de sobre-ingeniería y un riesgo educativo serio.** No está listo como spec sin reconciliación. La dirección (capacidades ≠ hardware, cadena visible, honestidad de estado) es genuina y se conserva; los detalles se corrigen abajo.

---

## 3. Contradicciones

| ID | Contradicción | Docs implicados | Corrección aplicada |
|---|---|---|---|
| C-01 | "Conocimiento" se lista como **laboratorio** (Lab table 3.2) PERO la cadena lo define como raíz/origen (Conocimiento → Laboratorios). Knowledge Hub no es un lab | M2 §3.2, M1 §2, M7 §5 | Conocimiento = raíz de la cadena + portal documental; se retira de la lista de labs de experiencia (queda como eslabón raíz) |
| C-02 | M2 §4 mezcla **grafo actual + objetivo** en un solo diagrama, mientras GLC-06 afirma que Ciencia de Datos está **desconectado** → el diagrama pinta conexiones que no existen | M2 §4 vs M2 §6 GLC-06 | El grafo pasa a rotularse "objetivo" y cada conexión futura se marca `futuro` |
| C-03 | M7 propone rutas nuevas `/laboratorios`, `/conocimiento`, `/telemetria` mientras el frontend real usa `/labs`, `/knowledge`, `/dashboard` → doble nomenclatura = deuda de aprendizaje y riesgo de romper enlaces (GR-09/12) | M7 §9, M4 | Se retiene la nomenclatura real; M7 solo cambia contenido, no rutas |
| C-04 | La cadena pedagógica coloca **UBTN como eslabón de laboratorio** (Math→…→IA→Agricultura→UBTN→Proyectos) PERO UBTN es un **dominio/línea productiva**, no un lab de prerrequisito pedagógico → el breadcrumb implicaría prerrequisitos inexistentes | M2 §2/§4, M4 §3 | UBTN se representa como **capacidad/proyecto** que consume la cadena; no como eslabón de labs |
| C-05 | Personas: M4 define 5 personas y M7 solo muestra el selector "Estudiante" en el wireframe → cobertura inconsistente | M4 §2 vs M7 §3 | Wireframe del selector enumera las 5 personas (Estudiante, Instructor, Investigador, Agricultor, Desarrollador) |

---

## 4. Errores conceptuales

| ID | Error | Detalle | Corrección |
|---|---|---|---|
| CE-01 | GHL-01 afirmaba STM32/Jetson/FPGA/Mini PC con **"cero menciones"** de hardware | En realidad existen como links educativos (`/lab-embedded`: FPGA/HDL/RTOS) y placeholders (`FPGA-X`, `RPI-05`) — no hay inventario ni rol, pero sí menciones | Reformular: "sin rol definido / sin inventario" |
| CE-02 | Persona **Agricultor** presentada como navegable hoy | Hoy no hay despliegue productivo real (BBB 0 bytes, UBTN en diseño) → darle una vista "operativa de la finca" es **oferta falsa de valor** | Agricultor = persona **objetivo futuro**, gated por la existencia de un MVP real (UBTN o Agricultura V2) |

---

## 5. Duplicidades

| ID | Duplicidad | Riesgo | Corrección |
|---|---|---|---|
| D-01 | M4 (navegación/flujos) y M7 (wireframes/páginas) comparten IA y flujos de persona | derivación lenta, divergencia | M4 = IA canónica; M7 = spec visual que **cita** M4, sin repetir flujos |
| D-02 | M1 §4 no-negociables y M6 guardarraíles GR-01..12 solapan prohibiciones | dos lugares para la misma barrera | M6 es la fuente operativa (verificación); M1 se queda con la declaración de identidad. Referencias cruzadas; sin reescribir duplicado |

---

## 6. Complejidad innecesaria (riesgo de sobre-ingeniería, GR-11)

| ID | Propuesta sospechosa | Juicio |
|---|---|---|
| SO-01 | M7 mantiene 9 páginas en la spec + selector de persona | Justificado por personas reales (M4). Se reduce a rutas existentes + 2 nuevas (`/hardware-catalog`, `/proyectos`) |
| SO-02 | M2 GLC-02 propone "formalizar etapa IoT" como nodo | **Riesgo de alcance:** convertir el diseño en un proyecto educativo nuevo. Se declara como etapa conceptual en el modelo, **no** como build del refactor |
| SO-03 | M5 "modelo formal" (diagrama formal de capacidades) | Conceptualmente bien, implementable como convención de UI; **no** justifica nueva BD ni BFF. Reitera GR-11 |

---

## 7. Riesgos de mantenimiento

| ID | Riesgo | Mitigación |
|---|---|---|
| MR-01 | 8 docs nuevos → más superficie de coherencia | Registro ligero en `SIGCT_RURAL_SYSTEM_BOOT.md` (mapa de continuidad) y `PLAN_MAESTRO.md` (referencias). Bitácora en MASTERDOC. Esta auditoría se re-ejecuta en cada cambio de IA |
| MR-02 | IA compartida entre M4/M7 puede divergir | M4 canónico; M7 solo wireframes; cambio de página = actualizar M4 + M7 + auditoría |
| MR-03 | El vocabulario de estado (`operativo/referencia/diseño/vacío`) debe ser único | Se define en M3 §7 y se reutiliza en M5 §6 y M7 — sin variantes |

---

## 8. Riesgos educativos

| ID | Riesgo | Gravedad |
|---|---|---|
| ER-01 | "Evidencia reciente" en el dashboard puede incentivar **evidencia falsa** (jugar al progreso, no aprender) | 🔴 |
| ER-02 | Breadcrumb de cadena puede volverse **propaganda** si no hay señal real detrás (los 0 bytes de BBB) | 🟠 |
| ER-03 | Ladder de hardware (M3) puede inducir "etiquetar estudiantes por plataforma" en vez de por competencia | 🟡 |

**Mitigaciones ER-01/02:** la evidencia exige `método + procedencia` (nunca vacía); el estado veraz se muestra siempre (sin "online" cosmético). ER-03: el ladder es orientativo; el énfasis está en la competencia demostrada.

---

## 9. Riesgos de identidad y honestidad

- ✅ Frente a Grafana/ThingsBoard/Home Assistant: la dirección del diseño (capacidades, conocimiento, laboratorios) rechaza la copia de IA de plataformas IoT.
- ⚠️ Riesgo real: si el dashboard "evidencia/proyectos" se vuelve el foco, se desliza hacia LMS — vallado por P3 y ER-01.
- ✅ La honestidad de estado (referencia/diseño) es el correctivo al "último estado" falso del dashboard actual (BBB "online/alert" con scripts de 0 bytes — problema real documentado en el código).

---

## 10. Matriz de reconciliación aplicada

| Hallazgo | Acción | Estado |
|---|---|---|
| C-01 | Editar M2 §3.2 (retirar Conocimiento de labs) | ✅ hecho |
| C-02 | Rotular grafo M2 §4 como objetivo + marcar conexiones futuras | ✅ hecho |
| C-03 | M7 §9 y M4: mantener rutas reales (`/labs`, `/knowledge`, `/dashboard`) | ✅ hecho |
| C-04 | M2 §2/§4 y M4 §3: UBTN fuera de la cadena de labs, como capacidad/proyecto | ✅ hecho |
| C-05 | M7 §3: selector de 5 personas | ✅ hecho |
| CE-01 | M3 GHL-01: reformular "sin rol/inventario" | ✅ hecho |
| CE-02 | M4 §2 + M7: Agricultor = futuro, gated | ✅ hecho |
| D-01/D-02 | notas de canonicidad añadidas | ✅ hecho |
| MR-01 | registro en SYSTEM_BOOT/PLAN_MAESTRO/MASTERDOC | ✅ hecho |

---

## 11. Respuesta final (Misión Final)

> **¿Estamos construyendo una interfaz bonita o una plataforma científica sostenible?**

**La respuesta es clara y ya era verdad en la identidad del repositorio:** se construye la **plataforma científica sostenible**. La refactorización es únicamente el conducto para exponer ese corazón (Conocimiento → … → Proyectos Reales) sin convertirlo en un dashboard genérico.

**Condición de sostenibilidad (llave de cierre):** cualquier propuesta que sacrifique educación, investigación, trazabilidad, laboratorios o conocimiento **se rechaza**. Y una propuesta que *apenas* añade belleza sin eslabón de la cadena, igualmente se rechaza (valla del árbol de alineación de M1 §6).

**La prueba no es la interfaz, es la cadena**: cada dato que el usuario ve debe poder trazar hasta una fuente real. Mientras eso sea verdad, la interfaz puede (y debe) evolucionar. Cuando deja de serlo, la interfaz es decoración. **Cero código, cero commits, cero push; `main` y `src/` intactos.**

---

## 12. Referencias

- [`SIGCTIARURAL_VISION_ALIGNMENT.md`](SIGCTIARURAL_VISION_ALIGNMENT.md) — identidad y no-negociables.
- [`SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md`](SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md) — grafo de labs.
- [`SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md`](SIGCTIARURAL_HARDWARE_LEARNING_MODEL.md) — modelo de aprendizaje por plataforma.
- [`SIGCTIARURAL_DASHBOARD_NAVIGATION_MODEL.md`](SIGCTIARURAL_DASHBOARD_NAVIGATION_MODEL.md) — IA canónica.
- [`SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md`](SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md) — hardware ≠ capacidad.
- [`SIGCTIARURAL_REFACTORING_GUARDRAILS.md`](SIGCTIARURAL_REFACTORING_GUARDRAILS.md) — qué no se rompe.
- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — spec visual.
- [`docs/ECOSYSTEM_IDENTITY.md`](ECOSYSTEM_IDENTITY.md) — identidad canónica.