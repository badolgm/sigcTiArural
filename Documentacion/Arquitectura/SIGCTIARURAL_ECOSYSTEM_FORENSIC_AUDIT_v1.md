# SIGCTiArural · Auditoría Forense del Ecosistema (Arqueología Arquitectónica)

**Versión:** v1 · **Fecha:** 2026-09-27 · **Rama:** `feature/ubtn-biological-telemetry` · **Modo:** SOLO LECTURA (no se implementó, no se modificó código, no se crearon commits).
**Propósito:** reconstruir la evolución completa del ecosistema (visión original → implementación → desviaciones → construido-y-olvidado) para responder una única pregunta: **¿dónde se desvió la visión original y qué debemos rescatar?**

> **Honestidad de estado:** este documento es **arqueología**, no diseño. Primero descubre qué ya había sido diseñado/construido; no inventa nada nuevo. Cada afirmación está citada (ruta:línea). La numeración de señales `S##` es del canónico `Documentacion/Arquitectura/CMSC_SIGNAL_MAP_v1.md`.

---

## 1. Resumen ejecutivo

1. **La visión original nunca fue "una calculadora" ni "un dashboard": fue una cadena pedagógica de laboratorios por los que fluye la señal como evidencia.** El README fundacional la describe como "ecosistema autónomo y agnóstico de hardware/software que integra IoT, IA, laboratorios interconectados y educación técnica para impulsar la agricultura sostenible" (`README.md:26`). El principio rector que sostiene hasta hoy: la señal capturada por un lab debe poder seguirse por **Señales → Electrónica → Matemáticas → Telecomunicaciones** y modelarse en cada eslabón (`docs/ECOSYSTEM_IDENTITY.md:31`).
2. **El laboratorio matemático fue diseñado en NOV 2025 como la experiencia interactiva (Dr. Binary), y en ENE 2026 — por la actualización v3.2 — se le dio explícitamente el papel de MODELADOR DE SEÑALES provenientes de Electrónica** (FFT + retrato de fase) (`docs/MASTERDOC.md:1257-1270`). Es decir: **no fue diseñado originalmente como calculadora pura; la calculadora era su cara pedagógica y el modelado de señales era su papel en el ecosistema.**
3. **La continuidad se rompió en TRES momentos distintos:**
   - **Ruptura documental** (2026-01-03, `6b4c798`): borra —sin bitácora de reemplazo— `MASTERDOC_v4.2_DAS.md` y 6 archivos más (-10.779 líneas), destruyendo la genealogía v3.1→v4.2. Violación directa de "NADA DESAPARECE".
   - **Ruptura de catálogo** (2026-01-18, `14d2013`): borra 11 paths incluyendo `src/frontend/src/data/lab-data.js` y los session-plans de creación de labs.
   - **Ruptura de rol** (2026-05-23 → freeze 2026-09-15): la refactorización hexagonal congeló `AdvancedMathLab` como "calculadora" (declaración canónica) mientras el código seguía consumiendo señales de Electrónica vía `useLabStore`, y `DataScienceLab.jsx` quedó 10 meses sin un solo commit (`f7821af`, 2025-11-04).
4. **Solo existe UNA conexión real de datos entre labs en todo el frontend:** Electrónica → Matemáticas Avanzadas V2 vía estado federado Zustand (`src/frontend/src/stores/useLabStore.js:11-51`; `AdvancedMathLabV2.jsx:5`). Todos los demás labs están aislados.
5. **Solo hay 2 señales persistentes y reales en el backend** (temp/humedad `SensorReading` y `RobotTelemetry`), ninguna con productor físico operativo; la excepción acústica real es el micrófono→FFT de Telecom (efímera en navegador). El catálogo completo de señales vive en `CMSC_SIGNAL_MAP_v1.md` (S01..S80, 12 tipos).
6. **Lo más valioso ya está construido y semifuncional (o no conectado): el contrato `source_mode` (live/simulated/fallback), el bus de eventos `LabSignal`, el solucionador FFT+Hann del lab matemático, y los 51 docs del Knowledge Hub.** Lo que falta no es "diseñar más": es **conectar lo ya construido** y **repoblar el eslabón de productores de señal** (`src/embedded/bbb_03_sensors/sensor_reader.py` = 0 bytes).

---

## 2. Q1 — ¿Cuál era la visión original del ecosistema?

**Visióm documentada en capas:**

| Capa | Visión | Fuente |
|---|---|---|
| **README vigente** | "Ecosistema autónomo y agnóstico de hardware/software que integra IoT, Inteligencia Artificial, laboratorios interconectados y educación técnica para impulsar la agricultura sostenible y la inclusión tecnológica en zonas rurales de Colombia." | `README.md:26` |
| **DAS v4.2 (2025-11-02)** | "Plataforma web híbrida (Cloud/Edge) diseñada para actuar como ecosistema de gestión del conocimiento y tecnología para el sector rural" con 5 objetivos O-01..O-05 (dashboard centralizado, modelo IA, laboratorio hardware clúster 3-BBB, biblioteca de recursos educativos, cumplimiento de artefactos ADSO) y 6 actores (Agricultor, Estudiante SENA, Administrador, Clúster BBB, PlantVillage, SENA SofiaPlus). | blob histórico `d946694` (archivo borrado) |
| **Identidad canónica (2026-07-20)** | "La palabra clave es ECOSISTEMA. No plataforma. No aplicación. No dashboard. No laboratorio. No IA." Ecosistema sobre Bounded Contexts (DDD) hexagonales donde Conocimiento, Investigación, IA, Laboratorios, Telemetría y Gobernanza colaboran para producir **evidencia verificable** y transformarla de nuevo en conocimiento. | `docs/ECOSYSTEM_IDENTITY.md:9-17` |
| **Origen narrado** | "El proyecto nació como monitoreo agrícola con IoT… Evolucionó porque su autor no quería un simple sistema clasificador de enfermedades, sino una plataforma donde… se pudiera investigar ciencia de datos… usando como dominio variables agropecuarias pero sin quedar limitado a ellas." | `docs/ECOSYSTEM_IDENTITY.md:21` |

**Resumen:** visión original = **monitoreo agrícola IoT evolucionado a ecosistema de conocimiento tecnológico rural** con 3 pilares: (a) laboratorios interconectados por los que fluye la señal como evidencia, (b) agnosticismo total de hardware/software, (c) educación técnica con evidencia verificable (no LMS, no dashboard pasivo). El concepto EIARC nació después como línea arquitectónica (≈marco), luego **fue invertido** a "caso de uso real del ecosistema" (`docs/ECOSYSTEM_IDENTITY.md:43`) — dos sentidos coexistieron (`docs/SIGCTIARURAL_CANONICAL_ENGINEERING_REVIEW.md:40`).

---

## 3. Q2 — ¿Cuál fue la evolución cronológica?

200 commits (178 no-merge + 22 merge), `2024-12-23` → `2026-09-23`. Sintetizado en fases:

| Fase | Rango fechas | Dominancia | Hitos (hash) |
|---|---|---|---|
| **F0 · Génesis** | 2024-12-23 | Repo huérfano | `d01d6a2` Initial commit |
| **F1 · Nacimiento DAS** | 2025-11-02 → 03 | Documentación + scaffold | `d946694` v3.1→v4.2 DAS (Mermaid); `fc180f2` README+API/DEPLOYMENT/EDGE, scaffold React/Vite; **labs desde el 1er día**: `7ddbb59` (AdvancedMathLab), `a21e65e` (Telecom/Robotics/Embedded) |
| **F2 · Construcción labs + IA** | 2025-11-03 → 04 | Frontend + backend | `6db9b69` (AdvancedMathLabV2, Electrónica, auth); `f7821af` (DataScienceLab, Docker, labs IA); `a21e65e` nacen SYSTEM_BOOT + gobernanza |
| **F3 · Fases 1-4 plan maestro** | nov 2025 → ene 2026 | Arquitectura, prototipo, flujo Edge-to-Cloud MQTT, IA Cloud+Edge MobileNetV2 92.5% | `docs/MASTERDOC.md:361-429`; SESSION_PLAN Django mínimo (2025-12-08) |
| **F4 · RUPTURA DOCUMENTAL** | 2026-01-03 | Consolidación agresiva | `6b4c798` -10.779 líneas (borra DAS v4.2 y 6 archivos) |
| **F5 · Mes crítico** | 2026-01-18 → 29 | Recuperación + labs | `14d2013` -11 paths; `0883870` restauración crítica dashboard/robótica; `84a32ed` **estado federado Elect-Math**; v3.2 integración labs + análisis espectral; incidente crítico 01-29 |
| **F6 · Refactor frontend** | 2026-02-17 | Frontend | Refactor `AdvancedMathLab` (framer-motion) |
| **F7 · Refactor hexagonal** | 2026-05-23 | Backend | CLI hexagonal; `AdvancedMathLab.jsx` deja de tocarse |
| **F8 · Identidad + Mónada modular** | 2026-07-04 → 27 | Gobernanza/identidad | `672f40c` borra guía ADSO; `9392cbf` borra `sigcti-autonomous-core`; `00b5641`/`0ee868b` degradan CLAUDE/RECOVERY/PLAN_20_DIAS a local-only; `docs/ECOSYSTEM_IDENTITY.md` (07-20) |
| **F9 · Señal de Bus + freeze** | 2026-08-11 → 09-15 | Interconexión + gobernanza | `4006f67`/`0dc99c5` **LabSignal** (event bus) + fallback; `87fc001` freeze dashboard + capa científica (RC2, 09-14/15) |
| **F10 · IA/Benchmark** | 2026-09-21 → 27 | Ciencia | `9aebcb4` benchmark; `91dc25e` M2 notebook; `fa8e6a4` fix; `18b95b1` docs; M2 ejecutado (27) |
| **F11 · CMSC diseño** | 2026-09-25 | Arquitectura (diseño) | 5 docs CMSC sin commit (MASTERPLAN, SIGNAL_MAP, UI_ARCHITECTURE, CANONICAL_STATE, FRONTEND_EXECUTION_STRATEGY) |

**Nota honesta:** `PLAN_MAESTRO.md:1,10-21` declara fin estimado **julio 2026** con trabajo aún activo en septiembre 2026; y `main` quedó **congelada 2 meses atrás** con los últimos 17+ commits aislados en la feature `ubtn-biological-telemetry` (ver §8).

---

## 4. Q3 / Q4 / Q5 — El laboratorio matemático: origen, papel, ¿calculadora o modelador de señales?

### Q3. ¿Cuándo apareció el concepto?
- **En el diseño original (v3.1 ADSO, nov 2025):** los "laboratorios virtuales de física, electrónica y matemáticas" ya estaban en la primera arquitectura.
- **Primer archivo:** `AdvancedMathLab.jsx` = commit `7ddbb59` (2025-11-03, "feat(frontend): añadir AdvancedMathLab… corregir fórmulas Laplace"). V2 (`AdvancedMathLabV2.jsx`, "Dr. Binary") = `6db9b69` (2025-11-04).
- **Congelación:** ambas rutas marcadas **CONGELADA** (`docs/SIGCTIARURAL_ROUTE_EVOLUTION.md:19-20`); ambos componentes **PRESERVAR** (`docs/SIGCTIARURAL_COMPONENT_MIGRATION_MATRIX.md:59-60`).

### Q4. ¿Qué papel desempeñaba originalmente?
Tres papeles superpuestos en el tiempo:
1. **Experiencia interactiva:** 8 subáreas (cuántico, EDs, variable compleja, álgebra lineal, tensores, transformadas, lógica/conjuntos) con Qiskit/PennyLane/Cirq reales (`docs/SIGCTIARURAL_ECOSYSTEM_MATURITY_AUDIT.md:13-14`). Fue su cara "Dr. Binary".
2. **Modelador de señales (2026-01-28, v3.2):** "Nueva pestaña dedicada al análisis matemático profundo de **señales provenientes de electrónica**" con retrato de fase (V vs dV/dt) y análisis de señal real (`docs/MASTERDOC.md:1268-1270`). En código: FFT con ventana Hann, primeros K armónicos (`AdvancedMathLabV2.jsx:234-262`), demodulación AM/portadoras (:834,862).
3. **Núcleo de la cadena (identidad canónica, 2026-07-20):** la señal "se modela matemáticamente en el laboratorio de Matemáticas" (`docs/ECOSYSTEM_IDENTITY.md:31`). El CMSC (diseño 2026-09-25) lo reafirma: "posicionar las matemáticas como **centro de modelado (no calculadora)**… envuelve la experiencia de Dr. Binary sin tocar `AdvancedMathLab*`" (`Documentacion/Arquitectura/CMSC_UI_ARCHITECTURE_v1.md:162,167`).

### Q5. ¿Calculadora o modelador de señales? — **VEREDICTO**
**Ambos, pero el modelo de señales era el papel ecosistémico.** La evidencia:
- El código **consumió de verdad** señales de Electrónica vía `useLabStore` desde 2026-01-27 (`84a32ed`) y tiene FFT/Hann/phase portrait implementados (matemática real).
- El freeze canónico posterior lo describió como "calculadora" (`docs/SIGCTIARURAL_LAB_PRESERVATION_STRATEGY.md:96`), **contradiciendo el propio código que lo hacía consumidor de señales** — contradicción vigente (informe forense v1.1: "el código dice una cosa, el freeze otra, CMSC una tercera").
- La señal S35 (Fourier/Laplace/Wavelets/phase portraits) es **simulación matemática en navegador** (no señal real persistida) (`CMSC_SIGNAL_MAP_v1.md:64`).

**Conclusión:** nació como herramienta interactiva + se le asignó el rol de **modelador de señales** en el ecosistema; la ruptura de rol ocurrió cuando el inventario canónico lo volvió "calculadora" mientras su única conexión de datos real seguía siendo la señal del circuito.

---

## 5. Q6 — ¿Cuándo se rompió la continuidad?

Tres rupturas con evidencia:

| # | Ruptura | Fecha | Evidencia | Impacto |
|---|---|---|---|---|
| R1 | **Documental**: borrado masivo sin bitácora | 2026-01-03 | `6b4c798` borra `MASTERDOC_v3.1/v4.2`, `MASTERDOCV2`, `MASTERDOC_legacy`, `MASTER_STATUS_REPORT.html`, `MASTERDOC.html`, `README_HEADER.md` | Pierde la genealogía DAS v3.1→v4.2; contradice "NADA DESAPARECE" |
| R2 | **Catálogo de labs**: borrado de `lab-data.js` y session-plans | 2026-01-18 | `14d2013` borra 11 paths (incluye `src/frontend/src/data/lab-data.js`, `docs/session_plans/SESSION_PLAN_2025-11-03*.md`) | 6 días de historia del catálogo y del session-plan que documentó la creación del lab matemático |
| R3 | **Rol del lab matemático**: hexagonal↔freeze | 2026-05-23 → 2026-09-14 | `AdvancedMathLab.jsx` deja de tocarse (2026-05-23); `ROUTE_EVOLUTION.md` lo congela; `LAB_PRESERVATION_STRATEGY.md:96` lo declara "calculadora"; `87fc001` freeze dashboard (RC2) | El lab que modelaba señales queda declarado calculadora, top-level fuera de la sección Labs (`docs/SIGCTIARURAL_PRESERVATION_AUDIT.md:93`) |

Rupturas adicionales de confianza detectadas:
- **Inversión de identidad EIARC no propagada:** `README.md:348` y `SIGCT_RURAL_SYSTEM_BOOT.md:61` aún dicen que SIGCT-Rural "evoluciona dentro de una línea más amplia llamada EIARC", mientras `ECOSYSTEM_IDENTITY.md:43` —vigente— dice lo contrario (`docs/SIGCTIARURAL_CANONICAL_ENGINEERING_REVIEW.md:40`).
- **Código vivo con diseño inaccesible (hallazgo N-2):** `src/backend/shared_kernel/event_bus/domain/lab_signal.py:14` cita `docs/local/PLAN_DIA16-17_INTERCONEXION.md`, ruta **que no existe ni está en git**. El único objeto de señal del backend no es reviewable.
- **Continuidad degradada a local-only:** `CLAUDE.md`, `RECOVERY_BOOT_MASTER.md`, `PLAN_20_DIAS.md` fueron des-trackeados (local-only) (`00b5641` 07-22, `0ee868b` 07-27).
- **Configuración clave borrada (2026-07-19, `0d81b06`):** 6 scripts operativos + 2 configs (`run_local_ai.ps1/.sh`, `run_local_backend.ps1`, `test_endpoints.py`, `create_test_data.py`, `import_local_dataset.py`, `config/settings.ini`) → **el arranque local no es reproducible desde el repo tal como está.**

---

## 6. Q7 / Q8 — Laboratorios: los que debían comunicarse y los que siguen aislados

### Q7. ¿Qué laboratorios debían comunicarse?
La **cadena conceptual** del currículo oculto (`docs/SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md:19-32`):

```
Matemáticas → Física → Electrónica → Telecomunicaciones → Embebidos → IoT → IA → Agricultura → Proyectos Reales → Impacto
```

Y la descripción narrativa de identidad (`docs/ECOSYSTEM_IDENTITY.md:31`): *"si un laboratorio captura una señal… verse en el espectro de frecuencias en el laboratorio de Señales, estudiarse como circuito en Electrónica, modelarse matemáticamente en el laboratorio de Matemáticas, transmitirse en el de Telecomunicaciones."*

Faltantes en el inventario vivo respecto a la cadena: **laboratorio de Física** (GLC-01) y **laboratorio de IoT** (GLC-02) no existen como espacio propio (`LAB_CONNECTIVITY_MODEL.md:121-122`).

### Q8. ¿Qué laboratorios están aislados hoy (2026-09-27)?

| Lab | Conectividad real | Evidencia |
|---|---|---|
| **Electrónica → Matemáticas V2** | ✅ **ÚNICA conexión de datos real entre labs** (estado federado Zustand) | `ElectronicsLab.jsx:493-494,655` → `useLabStore` → `AdvancedMathLabV2.jsx:5` |
| **Matemáticas V1/V2** | Sola conexión: la anterior (entrada = señal simulada de circuito, no señal persistida) | `AdvancedMathLabV2.jsx:234-267` |
| **Telecom** | Aislado: FFT del micrófono queda en el navegador, nunca sale | `TelecomLab.jsx:23-36` |
| **DataScience** | **Aislado y roto:** `EventSource(API_BASE/events)` con `API_BASE` por defecto = Django en vez de ai_service (8081); 10 meses sin commits | `DataScienceLab.jsx:5,65`; `f7821af` (2025-11-04) |
| **Robótica** | Aislado y mal cableado: hook apunta a `localhost:8000` (canónico 8010); sin componente backend real consumido | `useRoboticsApi.js:3,15,37-41`; `docker-compose.yml:45-54` |
| **Embebidos** | Aislado: iframe Wokwi, links (referencia externa) | `EmbeddedLab.jsx:27-37` |
| **IA Predictiva** | Conectado al backend (ruta funcional) pero modelo degenerado; escenarios demo correctamente etiquetados | `AIPredictiva.jsx:11-34,239` |
| **Knowledge Hub** | **No es lab, es la raíz**, pero aislado de los labs: no hay trazabilidad lab→KH (sin RAG/grafo/timeline) | `CMSC_SIGNAL_MAP_v1.md:187-192` |
| **Agricultura (backend)** | Fachada: consume `sensor_reading` sin productor físico; no recibe retroalimentación de UBTN ni IA (GLC-04) | `LAB_CONNECTIVITY_MODEL.md:46,124` |

**Gaps de conectividad documentados:** GLC-01 (Física ausente), GLC-02 (IoT difuso), GLC-03 (sin modelo de evidencia transversal), GLC-04 (Agricultura sin circularidad), GLC-06 (DataScience desconectado) (`LAB_CONNECTIVITY_MODEL.md:117-127`).

---

## 7. Q9 / Q10 — Señales reales vs previstas-nunca-integradas

### Q9. ¿Qué señales reales ya existen?

**Persistentes (backend + BD):**
| Señal | Origen → Destino | Evidencia |
|---|---|---|
| **S10/S11** Temp/Humedad (`SensorReading` V3) | `POST /api/v3/telemetry/readings/` → PostgreSQL (endpoint **sin productor físico:** `sensor_reader.py` = 0 bytes) | `api/models.py:4-14`; `views.py:201-285` |
| **S15** LabSignal (evento de dominio) | Bus en memoria → `OnSensorReadingHandler` → Lab Agricultura | `shared_kernel/event_bus/domain/lab_signal.py:9-34` |
| **S50** RobotTelemetry | `RobotTelemetryViewSet` (AllowAny) → PostgreSQL; productor = sim `physics_sim.py` (puerto equivocado) | `api/models.py:41-52`; `scripts/physics_sim.py:8-64` |
| **S60/S61** Imagen hoja → inferencia binaria | FastAPI `/infer` → `plant_disease_mbv2.h5` → resolver EIARC; **modelo degenerado (colapsa class_0 ~0.99)** | `fastapi_app.py:171-278`; `SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md:98-101` |
| **S62** Voz /assist | MediaRecorder → STT Google → TTS gTTS (real, depende de Google) | `fastapi_app.py:293-395` |
| **S63** Inferencia log SSE | `infer_log.jsonl` → `GET /events`; **consumidor mal cableado** (SSE apunta a Django) | `fastapi_app.py:397-411`; `DataScienceLab.jsx:5,65` |
| **S70-S73** Dataset/benchmark | 22.488 imgs/16 clases/3 especies, split 15.741/3.373/3.374 seed 42; M1 baseline, M2 ejecutado oficialmente | `data/datasets/.../split_report.md`; `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` |
| **S79** Knowledge Hub | 51 docs (18 research_v2) en bundle build-time, visor | `knowledge-hub/services/docLoader.js:15-30` |

**Efímeras/única real acústica:** **S30** micrófono → FFT/Canvas en Telecom (`TelecomLab.jsx:23-36`) — el único DSP en vivo real del ecosistema.

**Señales "reales pero fabricadas":** clima externo Open-Meteo (fuera del proyecto), estado CPU/temp de los 3 BBB = **constantes moldesadas** (mock) (`services/cloud.js:25-39`), trayectoria robótica = helicoidal sintética (`S51`).

### Q10. ¿Qué señales estaban previstas y nunca se integraron?

| Bloque | Señales | Estado |
|---|---|---|
| **UBTN biológico (S20-S25)** | BODY_TEMP, HR, RR, SpO2, ECG/PPG, IMU, rumia, actividad, colmena, MQTT 5, contrato lectura, ráfagas object storage | **diseño 0% código** (`docs/UBTN_DOMAIN_MODEL.md:90-119`; `src/embedded/bbb_*.py` vacíos) |
| **Series temporales (S76)** | Prophet, ARIMA/SARIMA, XGBoost, LSTM, GRU, TCN, TFT | diseño (`…_MLOPS…:672-700`) |
| **Audio/bioacústica (S77)** | CNN/CRNN + MFCC + espectrogramas (bovinos/porcinos/aves/abejas) | diseño (`…_MLOPS…:585-668`) |
| **Signal Intelligence (S78)** | wavelets vs FFT, change points | diseño (`…_MLOPS…:549-581`) — **puente diseño→lab matemático abandonado 66 días y nunca enlazado** (hallazgo D.3) |
| **Lab Análisis Espectral** | FFT/STFT/Wavelets/Espectrogramas/Bioacústica/RF/Audio/Vibraciones (semilla Hackathon, Fase 2 CMSC) | **CERO labs:** búsqueda por `signal|spectr|wavelet|fft` sobre todo el repo = solo `DataScienceLab.jsx` y `lab_signal.py` |
| **TFLite edge (BBB-02)** | `.tflite` runtime | **no existe ningún archivo**; `tflite_api.py` vacío |
| **Comunicaciones** | MQTT real, WebSockets (ingest) | **sin broker** en compose; sin paho/channels; MQTT solo texto hardcodeado |
| **Benchmark → runtime** | Promover M1/M2 a producción | M1 sin artefactos en disco; holdout `real_world_holdout_v1` **vacío** |
| **3D** | Simulaciones 3D de visión original | **deshabilitado** por fallo (`91dd42b` "disable faulty 3D") |

---

## 8. Q11 — Relación original del laboratorio matemático con los demás dominios

| Dominio | Relación original (diseñada) | Estado real hoy |
|---|---|---|
| **Electrónica** | **Integración de datos real** — estado federado compartido (`MASTERDOC.md:1259-1261`); el lab matemático analiza las señales del circuito (FFT/THD/retrato de fase) | ✅ ÚNICA conexión viva (Zustand) — pero insumo es **simulación** Pyodide, no señal persistida |
| **Telecomunicaciones** | Demodulación de señales, portadoras AM (V2) | Parcial: funciones implementadas sobre datos sintéticos; sin recibir el espectro del micrófono de Telecom |
| **IoT** | Eslabón de la cadena (Embebidos→IoT→IA) | Nota: Matemáticas no toca IoT en absoluto (cero código) — dependencia conceptual vía cadena |
| **Robótica** | (no documentada explícitamente en origen) | Nula: trayectoria robot nunca llega a módulo matemático |
| **IA** | Diseño: Signal Intelligence (wavelets/FFT change points) y Qiskit/PennyLane | Solo bibliotecas de visor en V1; el puente research_v2 Signal→lab matemático fue **abandonado** (último toque `6d68c27` 07-19, nunca enlazado) |
| **Knowledge Hub** | La evidencia de los labs debe registrarse/recuperarse desde KH | No existe trazabilidad lab→KH (KH es solo visor de 51 docs) |
| **Cadena completa** | Señal → Señales → Electrónica → **Matemáticas** → Telecom (`ECOSYSTEM_IDENTITY.md:31`) | Último eslabón (Señales) **nunca existió**; Matemáticas solo recibe señal simulada de Electrónica |

---

## 9. Q12 — Partes ya implementadas y olvidadas dentro del código

### Frontend
| Pieza | Estado | Evidencia |
|---|---|---|
| `pages/Login.jsx`, `Register.jsx`, `Admin2FA.jsx`, `components/AuthGuard.jsx` | No enrutados (login real = `LoginModal` embebido en Dashboard) | `App.jsx:110-149`; `Dashboard.jsx:4,749` |
| `pages/DataScienceLab.jsx` | 10 meses sin commits, ruta viva, SSE roto | `f7821af` (2025-11-04); `DataScienceLab.jsx:5,65` |
| `pages/_deprecated/` (5 Docs*) | Preservados pero sin ruta (reemplazados por KH) | `pages/_deprecated/DocsMasterdoc.jsx:5-21` |
| Motor legado de circuitos (SchematicEditor + adapter) | `SHOW_LEGACY_ENGINE_TOGGLE=false` → inalcanzable por UI | `ElectronicsLab.jsx:8-14,582,649` |
| `labs/math-resources/` | README promete `HTML/simulations/assets` que **no existen** | `labs/math-resources/README.md:5-11` |
| Enlaces rotos: `lab-data.js:23` → `/docs/...` (404); alias `docs-*` → caen a `/dashboard` | Navegación silenciosamente rota | `data/lab-data.js:23,323,347-351` |
| `setBridgeStatus` (store), `ErrorBoundary` y `ClusterCard` (imports) | Muertos | `useLabStore.js:106`; `App.jsx:4`; `Dashboard.jsx:3` |

### Backend / IA / Datos
| Pieza | Estado | Evidencia |
|---|---|---|
| Telemetría V1 y V2 | Sin consumidor frontend (solo V3); simulación sin marca `source_mode` | `api/urls.py:22-24`; `views.py:33-66,404-470` |
| `robot-commands`, `/robots`, `crop-advice`, `auth/refresh` | Endpoints sin consumidor | barrido de 15 rutas |
| **EventBus completo sin conectar al arranque** | `wire_all()` existe, **nunca se invoca** desde wsgi/asgi/settings/apps | `sigct_backend/wiring.py:26-30` |
| 3 copias de estrategia Agricultura | `core/domain/strategies/agriculture_strategy.py`, `api/logic/domain/agricultura.py`, `contexts/labs/.../agricultura.py` | duplicación divadida |
| Violación frontera hexagonal | `contexts/labs/domain/services/laboratorio_service.py:9` → `api.logic.ports.ai_service` | — |
| 2 repositorios para el mismo modelo | historia usa infra global; ingest usa contexto | `views.py:115` vs `:254` |
| `except ImportError: pass` | Oculta desaparición silenciosa de endpoints V3 | `urls.py:37-38,45-46`; `views.py:89-99` |
| `deprecated_legacy()` | Nunca aplicado | `utils/deprecation.py:4-12` |
| `benchmark/runs/` | Directorios vacíos frente al README que declara artefactos | `benchmark/README.md` |
| MySQL residual | En `docker-compose.yml`, no usado por Django | `docker-compose.yml:24-42` |
| Selección de modelo por `mtime` | `load_latest_model()` elige el `.h5` **más reciente por fecha**, no por config **— riesgo de reproducibilidad de primer orden** | `fastapi_app.py:171-183` |

---

## 10. Veredicto final — ¿Dónde se desvió la visión original y qué debemos rescatar?

### Dónde se desvió (desviaciones acumuladas vs la visión de la "cadena de señal como evidencia")

1. **La cadena de valor se fracturó en el eslabón de producción de señal.** La visión exige que la señal fluya desde la captura; hoy **no existe productor físico** (`sensor_reader.py` = 0 bytes, sin llamador del endpoint de ingest), el bus de eventos está **desconectado** (`wire_all()` no se invoca en producción), y la única conexión inter-lab fluye de un **simulador** (Pyodide) no de una señal real. *El ecosistema tiene tuberías brillantes y vacías.*
2. **El rol del laboratorio matemático fue abruptamente redefinido por el inventario canónico** (de "modelador de señales" a "calculadora") mientras su código seguía siendo consumidor de señales — y luego fue congelado top-level fuera de Labs. La desviación no fue de diseño: fue de **narrativa de estado vs realidad de código**.
3. **La memoria documental se borró tres veces** (`6b4c798`, `14d2013`, `0d81b06`) y tres documentos de continuidad quedaron local-only; el diseño del único evento de señal (`PLAN_DIA16-17_INTERCONEXION`) ni siquiera está versionado. Un proyecto cuyo invariante es "NADA DESAPARECE" tiene **5 commits con pérdida real de información**.
4. **La producción de IA quedó desconectada de la ciencia**: el benchmark (16 clases) nunca alimenta al producto (binario), el modelo productivo está **degenerado**, y el modelo se elige por `mtime`. *La ciencia existe; el pipeline científico→producto no.*
5. **Lo construido-comunicante se arrinconó**: `DataScienceLab` (10 meses muerto, SSE roto), el motor legado de circuitos (inalcanzable), TFLite (0 archivos), vibraciones/espectro (0 código). El proyecto **se bloqueó correctamente** a refactorizar el lab matemático sin plano (regla de `CMSC_SIGNAL_MAP_v1.md:337`) — pero ese auto-bloqueo también detuvo cualquier avance.

### Qué debemos rescatar (orden de prioridad, sin decisiones de implementación)

| # | Rescate | Naturaleza | Fundamento |
|---|---|---|---|
| 1 | **Existe vivo el contrato `source_mode` (live/simulated/fallback)** propagado al UI (`● LIVE` condicional) | Real, funcional | `views.py:131-137`; `Dashboard.jsx:370` — es la honestidad como invariante materializada |
| 2 | **`LabSignal` + bus de eventos + `wire_all()`** ya escritos | Real, **desconectado** | `lab_signal.py`; `wiring.py:26-30` — activar/registrar el wiring al arranque cierra la cadena telemetría→labs |
| 3 | **Puente Electrónica→Matemáticas (Zustand) + FFT/Hann/phase portrait** | Real, único inter-lab | `useLabStore.js`; `AdvancedMathLabV2.jsx:234-267` — es el núcleo de la cadena "señal→modelado" |
| 4 | **Micrófono→FFT de Telecom** | Real, única señal acústica en vivo | `TelecomLab.jsx:23-36` — el insumo natural del futuro Lab Análisis Espectral **ya existe** (efímero) |
| 5 | **Knowledge Hub: 51 docs, 0 rutas rotas, registry build-time** | Real, subestimado | `docLoader.js:15-30` — base del Agente Investigación/RAG (diseño) |
| 6 | **Benchmark M1/M2 (gates PASS) + dataset V2+ congelado** | Real, científico | `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` — única ciencia con gates del ecosistema |
| 7 | **Productor de señal faltante** (`sensor_reader.py`/cliente de ingest) | Vacío, crítico | `src/embedded/bbb_03_sensors/sensor_reader.py` (0 bytes) — sin él no hay señal real nueva |
| 8 | **Recuperación documental**: `PLAN_DIA16-17_INTERCONEXION.md`, `CLAUDE.md`, `RECOVERY_BOOT_MASTER.md`, `PLAN_20_DIAS.md`, scripts de arranque local | Borrados/degradados | N-2; `0d81b06`; `00b5641` — restaurar la memoria y la reproducibilidad |
| 9 | **Narrativa de estado sincronizada**: lab matemático = "consumidor de señal de Electrónica" (lo que el código hace) | Decisión de estado | Informe forense v1.1: código vs freeze vs CMSC divergen |

### Respuesta a la pregunta única

> **La visión original se desvió al separar la señal de su cadena de laboratorios: se construyeron transformadores matemáticos potentes (FFT, Laplace, wavelets), conectores (Zustand, event bus) y honestidad (source_mode), pero el PRODUCTOR, el MEDIO (bus conectado) y el LAB de SEÑALES quedaron sin implementar, mientras la narrativa canónica congeló esa cadena a medias. Debemos rescatar lo ya construido y conectarlo — no diseñar desde cero: reactivar `wire_all()`, dar productor real a `sensor_reader.py`, dar el micrófono de Telecom al análisis espectral, re-sincronizar el rol declarado del lab matemático con su código, y repatriar la memoria documental borrada (PLAN_DIA16-17, runbooks, guías ADSO). El CMSC no es una expansión: es la restauración honesta de la cadena original "señal → Señales → Electrónica → Matemáticas → Telecom → IA → Conocimiento".**

---

## 11. Limitaciones de esta auditoría

- Lectura estática: no se ejecutó la app ni se consultó PostgreSQL/runtime (las afirmaciones "real/persiste" se refieren a código+esquema verificados, no a conteos de filas).
- La degeneración de `plant_disease_mbv2.h5` es evidencia documental (`AI_V5_FORENSIC_AUDIT.md`), no re-ejecución propia.
- Los blobs del DAS v4.2 fueron leídos vía git histórico (archivo borrado por `6b4c798`).
- Algunas fechas de borrado aparecen repetidas por ramas divergentes (`--all`); el ledger de borrados del addendum forense (v1.1) distingue borrado real vs re-expresión en otra rama.

---

## 12. Referencias clave

- `docs/ECOSYSTEM_IDENTITY.md` — identidad y Principio 2 (labs comunicados).
- `docs/SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md` — cadena conceptual, inventario y gaps GLC.
- `docs/MASTERDOC.md:1257-1270` — v3.2, estado federado Elect-Math y análisis espectral.
- `docs/SIGCTIARURAL_AI_V5_FORENSIC_AUDIT.md` — degeneración del modelo productivo.
- `Documentacion/Arquitectura/CMSC_SIGNAL_MAP_v1.md` — inventario S01..S80.
- `Documentacion/Arquitectura/CMSC_CANONICAL_STATE_v1.md` — estado canónico de recuperación.
- `Documentacion/Arquitectura/CMSC_MASTERPLAN_v1.md` — núcleo científico (diseño).
- `Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md` — M1 baseline / M2 challenger.

---

*AUDITORÍA FORENSE v1 · Arqueología arquitectónica realizada el 2026-09-27 en modo SOLO LECTURA. No se implementó, no se modificó código, no se crearon commits. Honestidad de estado: las citas son verificables en repo y documentos referenciados.*