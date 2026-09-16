# SIGCTIARURAL_U1_BLOCKERS_RESOLUTION — Resolución de los bloqueantes NO GO → GO

> **Familia:** Refactorización Global · **Gate:** U1
> **Estado:** `referencia` (resolución de decisiones — sin código)
> **Fecha:** 14 de septiembre 2026 · **Rama:** `feature/ubtn-biological-telemetry`
> **Alcance:** resolver EXCLUSIVAMENTE D-A, D-B, D-C, D-D, D-A-7 y R-13.
> **Regla:** no se crean roadmaps, visiones ni familias nuevas. No se escribe código.

---

## Resumen ejecutivo

| Bloqueante | Estado tras análisis | Exigencia para U1 |
|---|---|---|
| **D-A** (Auth) | **NO bloquea** U1.1-U1.4: latente es la decisión correcta | Firma del dueño (mantener latente) |
| **D-B** (Banner) | **NO bloquea** U1.1-U1.2: relabel honesto en U1.3 | Firma del dueño (relabel) |
| **D-C** (Registry Generator) | **Diferible** por completo; el script no existe en el repo | Firma del dueño (diferir) |
| **D-D** (catalog-data.js) | **BLOQUEA U1.1**: fuente = módulo JS estático (patrón `lab-data.js`) | Firma del dueño |
| **D-A-7** (MVP UBTN) | **BLOQUEA U1.7** (no U1.1-U1.3): señal = **Temperatura (DS18B20)** | Firma del dueño |
| **R-13** (Telemetry3DScene) | **NO bloquea** si se adopta el uso aditivo; hoy SOLO vive en Robótica | Firma del dueño |

---

## 1. D-A — Auth

### Estado
**No es bloqueante para arrancar U1 (fases aditivas).** Hechos verificados: `LoginModal` +
`onRequireAuth` están anclados **solo en `Dashboard.jsx`** (gate de acciones de `ClusterCard` tipo
"activar"); `Login.jsx`, `Register.jsx`, `Admin2FA.jsx`, `AuthContext.jsx`, `AuthGuard.jsx` son
**latentes** (sin rutas). Ningún componente de catálogo/navegación de U1.1-U1.2 requiere autenticación.

### Decisión que debe tomar Bernardo
Confirmar la política de auth para U1. **Opción recomendada (única): mantener la auth LATENTE,
sin rutear `/login|register|admin-2fa` durante U1.** El selector de persona arranca en `General`
(sin login); `Agricultor*` sigue gated por MVP real (UBTN o Agricultura V2), que no existe hoy.

- **Ventajas:** cero impacto en U1.1-U1.2 (catálogo, navegación); no abre una superficie de
  seguridad sin MVP que la justifique; `LoginModal` sigue funcionando tal cual en el Dashboard;
  respeta GR-11 (nada de complejidad sin flujo de persona real).
- **Desventajas:** el contenido "por persona" queda limitado a General hasta que exista un MVP
  gateado.
- **Riesgos:** el único es hacer lo contrario (rutear auth sin producto que la respalde): apertura
  de superficie, mantenimiento de 3 páginas no usadas y coordola con D-B. Riesgo de la opción
  recomendada: nulo.

### Riesgo residual
Ninguno para U1.1-U1.2. Solo se reabre en U1.5 (persona gateada), con decisión posterior.

### Decisión requerida del dueño
- [ ] **D-A: aceptar "auth latente, sin rutas en U1"** — o expresar lo contrario.

---

## 2. D-B — Banner

### Estado
No bloquea U1.1-U1.2. El banner `SYSTEM ONLINE` (debug) se escribió como artefacto de depuración;
`PRESERVATION_STRATEGY` §3.6 lo preserva "salvo decisión explícita del dueño" — **esta misión es
ese momento de decisión**. Hechos: no aporta señal real (no deriva de telemetría), contradice
GR-08/GR-09 (honestidad de estado) si se muestra como "online" sin procedencia.

### ¿Preservarse, actualizarse o cómo?
- **U1.1-U1.2:** se **preserva tal cual** (nada de esta fase lo toca).
- **U1.3 (reorganización del Dashboard):** se **actualiza a un rótulo honesto** derivado de datos
  reales — p. ej. `Entorno: Desarrollo — Datos de Referencia` o un estado de servicios leído de
  los endpoints de telemetría/clúster. Nunca "SYSTEM ONLINE" inventado.
- El cambio es **solo presentación** dentro del trabajo de U1.3; no toca lógica.

### Impacto real
Cosmético/depuración: bajo. No afecta rutas, labs, telemetría ni catálogo.

### Riesgo residual
Si se hace el relabel sin derivarlo de fuente real, reaparece el mismo problema (estado sin
procedencia). Mitigación: el relabel se hace con el mismo vocabulario honesto
(`operativo/referencia/diseño/vacío`).

### Decisión requerida del dueño
- [ ] **D-B: aprobar "relabel del banner a estado honesto durante U1.3"** (preservado hasta U1.3).

---

## 3. D-C — Registry Generator

### Estado / qué problema resuelve
`knowledge-hub/registry/knowledgeRegistry.generated.json` es el **índice del Knowledge Hub**:
`docLoader.js` y `KnowledgeHubLayout.jsx` lo importan directamente para resolver docs por `docId`.
El "generador" (`scripts/generate_knowledge_registry.py`, citado por GR-05) **no existe en el
repositorio** (verificado por búsqueda global). El JSON actual fue producido fuera del repo (por el
dueño/herramienta privada).

### Por qué existe
Para que el Knowledge Hub sea **gobernado** (índice estable y auditable) en vez de listas escritas a
mano por página. Es una utilidad de mantenimiento, **no una pieza de runtime**: el runtime solo
consume el JSON.

### ¿Es obligatorio?
**No para U1.1-U1.2** (catálogo y navegación no dependen del registry).

### ¿Puede diferirse?
**Sí, por completo.** Solo es útil si se quiere **ampliar el índice** (añadir familias UBTN /
SIGCTIARURAL) en U1.4. Para ese momento existen dos caminos, ambos aditivos sobre el JSON existente:
(a) edición aditiva manual del JSON respetando su schema (verificado por `docLoader`); (b) si el
dueño localiza/proporciona su script, usarlo. **No se exige escribir un generador nuevo** (GR-11:
no ingeniería sin demanda). D-C deja de bloquear.

### Riesgo residual
Si en U1.4 se edita el JSON sin validar contra `docLoader`, un `docId` roto rompe tarjetas.
Mitigación: regresión de `/knowledge` en la misma fase.

### Decisión requerida del dueño
- [ ] **D-C: aceptar "diferir el generador; ampliación del índice aditiva y manual en U1.4".**
      (Si el dueño conoce su ubicación, puede compartirla; no bloquea.)

---

## 4. D-D — Fuente de verdad de `catalog-data.js`

### Estado
BLOQUEA U1.1 (el primer componente). Hechos: hoy los datos de los 5 tiles viven como constante
`futureNodes` dentro de `Dashboard.jsx` (línea 58) y se renderizan en línea; no existe ningún otro
repositorio de hardware. `lab-data.js` (módulo JS estático) es el precedente vigente de "verdad
pedagógica".

### Respuesta: ¿cuál debe ser la fuente de verdad?

**Recomendación única: un módulo JS estático frontend — `catalog-data.js` — colocado en
`src/frontend/src/data/`**, siguiendo el patrón exacto de `lab-data.js`.

Justificación de descartar las demás:

| Opción | Veredicto | Razón |
|---|---|---|
| **Repositorio (`catalog-data.js`)** | ✅ **RECOMENDADA** | Coincide con el patrón vigente (`lab-data.js`, 13 categorías); sin dependencias; offline; educativo; sin schema migration; nada que mantener en runtime; cero cambios en `src/backend` |
| JSON suelto | ❌ | Añade indirección (fetch/import externo) sin ganar nada sobre un módulo; duplica patrones |
| Base de datos / backend | ❌ | Violenta GR-01/GR-11; no hay demanda de persona ni de concurrencia para hardware estático; se reserva como evolución futura SI el dueño la pide (sin roadmap nuevo) |
| Markdown | ❌ | Mezcla contenido (docs) con datos; rompe la separación Knowledge/UI; re-render fragile |
| Knowledge Hub | ❌ | Acopla el catálogo a `docLoader`/registry; añade riesgo de `docId` roto a un componente que no lo necesita |

El contenido se **copia** (no se mueve) desde `futureNodes` (enlaces externos intactos:
raspberrypi.com, amd.com/yosys, docs.arduino.cc, Alexa, PX4/ArduPilot) + entradas BBB-01/02/03
(`referencia`) + ESP32/STM32/Arduino/RPi/Jetson/FPGA/MiniPC con `fase` honesta. `lab-data.js` y
`futureNodes` no se modifican hasta U1.3 (regla R-12: copia antes de realojar).

### Riesgo residual
Dos fuentes de la verdad si `futureNodes` y `catalog-data.js` divergen entre U1.1 y U1.3.
Mitigación: el realojo de U1.3 **borra `futureNodes` del Dashboard solo después** de verificar
paridad exacta; mientras tanto, el catálogo es la referencia y el Dashboard queda para esa fase.

### Decisión requerida del dueño
- [ ] **D-D: aprobar `catalog-data.js` (módulo estático frontend, patrón `lab-data.js`) como
      fuente de verdad del Hardware Catalog.** (Respuesta binaria: sí, o especificar otra).

---

## 5. D-A-7 — MVP UBTN (señal inicial)

### Posición técnica (única, sin opciones múltiples)

**Recomendación única: TEMPERATURA CORPORAL con sensor DS18B20 (1-Wire) como señal MVP de UBTN.**

Análisis comparado:

| Criterio | 🌡 Temperatura (DS18B20) | ❤️ HR/RR (MAX30102, PPG) | 🏃 Actividad (IMU) |
|---|---|---|---|
| Costo/sensibilidad al ruido | ~1-2 USD; digital 1-Wire, inmune a pelo/movimiento/contacto | óptico; **se degrada con pelo, movimiento y presión de contacto** en collares animales | depende del DSP; alta |
| Señal clínica | **fiebre = señal primaria de enfermedad** en ganado (desviación de línea base) | válida pero ruidosa; requiere contacto estable en piel | comportamiento, no señal de salud primaria |
| Consumo / batería en collar | lectura puntual + deep-sleep largo en ESP32 ✅ | PPG necesita ventanas de muestreo largas y más potencia | muestreo continuo o eventos; moderado |
| Complejidad de firmware (MVP) | mínima (1-Wire, sin filtros) | alta (DSP, artefactos) | media (calibración) |
| Ver eslabón de la cadena | directo: señal → MQTT (BBB) → read-model → alerta simple | posible fase posterior | complementaria (comportamiento) |

**Ratio señal/valor/esfuerzo del MVP favorece inequívocamente la temperatura.** HR/actividad se
agregan después, como fases gateadas del UBTN (sin roadmap nuevo; es backlog existente).

**Integración honesta:** la señal biológica se emite en un **canal propio del subdominio
`BiologicalTelemetry`** (nunca sobre `sensor_reading` ni el Telemetry Context existente;
ADR-UBTN-01 / GR-03). Se muestra como `diseño` hasta que el MVP exista (regla de honestidad GR-08).

### Riesgo residual
Si el hardware de temperatura no captura variación significativa en el form factor del collar
(contacto piel), el MVP puede necesitar re-sitio (lubricación de oído / axilar). Mitigación:
criterio de aceptación del MVP incluir prueba de contacto en un total de 3 jornadas.

### Decisión requerida del dueño
- [ ] **D-A-7: aprobar "MVP UBTN = temperatura corporal con DS18B20".** (Única; alternativas solo
      si el dueño aporta restricción de hardware ya comprado).

---

## 6. R-13 — Telemetry3DScene (uso dual)

### Dependencias reales (verificadas en código)
`Telemetry3DScene.jsx` es **importado SOLO por `RoboticsLab.jsx`** (vía `React.lazy`), recibiendo
`telemetry` como prop y renderizándolo en la escena 3D del lab. **Hoy NO está en el Dashboard** ni
en ninguna otra vista.

### Respuestas
- **¿Debe vivir en Robótica?** Sí — es su único consumidor actual; su importación y props quedan
  intactas (regla NADA DESAPARECE; GR-12).
- **¿Debe vivir en Telemetría?** Puede **aparecer** (uso aditivo) en la Sección Telemetría de la
  Ganadora en U1.3, **sin arrancarla de Robótica**.
- **¿Debe compartirse?** Sí, **por instanciación aditiva**: el mismo componente se importa y se
  renderiza en la nueva sección; nunca se "mueve" la referencia de Robótica. Esto es lo que la
  matriz intentó decir con "(o Robotics que ya lo use)" y ahora queda explícito.
- **¿Cómo evitar regresiones?** (1) No tocar `RoboticsLab.jsx`; (2) al crear la sección Telemetría,
  importar `Telemetry3DScene` como segunda instancia aislada (mismo props contract); (3) regresión
  manual de `/labs/robotics` en cada fase que toque dashboard (GR-12).

### Riesgo residual
Bajo. El único escenario de regresión sería "sustituir la importación de Robótica por la de
Telemetría" — prohibido explícitamente. Con instanciación aditiva, Robótica conserva su 3D.

### Decisión requerida del dueño
- [ ] **R-13: aprobar "uso aditivo de `Telemetry3DScene` (instancia adicional en Telemetría durante
      U1.3; Robótica intacta)".**

---

## 7. Veredicto final

# **GO CON CONDICIONES**

**Justificación técnica:** los 6 bloqueantes son **decisiones del dueño**, no defectos de diseño.
Cada uno tiene una **recomendación única y verificada en código** (D-A latente; D-B relabel honesto
en U1.3; D-C diferido; D-D módulo estático patrón `lab-data.js`; D-A-7 temperatura DS18B20; R-13
uso aditivo). Con esas 6 firmas, **U1 puede comenzar**. Un `GO` incondicional sería incorrecto
mientras el dueño no firme; un `NO GO` ya no se sostiene: el diseño está cerrado y los hechos de
código confirmaron que nada de lo analizado rompe rutas, labs, telemetría, `SensorReading` ni
`Telemetry` (todos intactos, sin cambios en `src/`).

### Condiciones para empezar a tocar React

1. **Firma del dueño** de las 6 decisiones de las secciones 1-6 (checklist abajo).
2. **Confirmación formal del gate U1** (requisito de `DASHBOARD_REIMAGINED_V2` §11 sobre
   Fases 7-8): el dueño acepta que esta misión constituye su acto de paso del gate — o cerrar
   Fases 7-8 primero. Sin esa declaración expresa, no se toca código.
3. **U1.0 obligatorio antes de cualquier cambio:** snapshot funcional + regresión baseline
   (14 rutas, 12 comandos de voz, V3 telemetría, `/labs/robotics` con su 3D).
4. **U1.1-U1.2 abiertos tras 1-3:** Hardware Catalog (`catalog-data.js` aprobado) + ampliación
   TopNav/voice.
5. **U1.3 (reorganización Dashboard) condicionado además a:** snapshot confirmado, relabel del
   banner (D-B), uso aditivo 3D (R-13) y realojo de tiles con copia previa (R-12).

### Checklist de cierre para el dueño

- [ ] D-A: auth latente (sin rutas) en U1.
- [ ] D-B: relabel del banner a estado honesto durante U1.3.
- [ ] D-C: generador diferido; ampliación del índice aditiva y manual en U1.4.
- [ ] D-D: `catalog-data.js` (módulo JS estático, patrón `lab-data.js`) como fuente de verdad.
- [ ] D-A-7: MVP UBTN = temperatura corporal (DS18B20); HR/actividad como fases posteriores.
- [ ] R-13: `Telemetry3DScene` con instancia aditiva en Telemetría; Robótica intacta.
- [ ] Confirma gate U1 (cierre/override de Fases 7-8 o acto de paso explícito).

---

## 8. Sin cambios (verificación de restricciones)

| Restricción | Estado |
|---|---|
| `git commit/push/merge/rebase` | No ejecutados |
| `main` | Intacto |
| `src/backend`, `src/frontend`, `src/embedded` | **Sin modificaciones** (solo lectura para verificar hechos) |
| Código escrito | Ninguno |
| `Dashboard_REIMAGINED_V2`, UBTN_Architecture, Telemetry, SensorReading | Intactos |
| Documentos nuevos | **Solo** este `SIGCTIARURAL_U1_BLOCKERS_RESOLUTION.md` |

---

## 9. Referencias

- [`SIGCTIARURAL_U1_GO_NO_GO.md`](SIGCTIARURAL_U1_GO_NO_GO.md) — auditoría que emitió el NO GO.
- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — §10/§11.
- [`SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md`](SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md) — §2.
- [`SIGCTIARURAL_MIGRATION_AUDIT.md`](SIGCTIARURAL_MIGRATION_AUDIT.md) — §5/§6.
- [`SIGCTIARURAL_REFACTORING_GUARDRAILS.md`](SIGCTIARURAL_REFACTORING_GUARDRAILS.md) — GR-05/08/09/11/12.
- [`SIGCTIARURAL_PRESERVATION_STRATEGY.md`](SIGCTIARURAL_PRESERVATION_STRATEGY.md) — §3.6.
- Hechos de código verificados (lectura): `Dashboard.jsx` (futureNodes, LoginModal),
  `RoboticsLab.jsx` (Telemetry3DScene lazy), `components/Telemetry3DScene.jsx`,
  `docLoader.js`/`KnowledgeHubLayout.jsx` (registry JSON), ausencia global de
  `generate_knowledge_registry.py`.