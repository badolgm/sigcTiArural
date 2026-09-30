# SIGCTiArural · CMSC — Revisión de Preparación para Implementación (Readiness Review v1)

> **Categoría:** Documentación canónica de arquitectura · Revisión final de consistencia y preparación (puente MASTERPLAN F1→F4 · cadena F3A→F3E→F4).

| Campo | Valor |
|---|---|
| Documento | `CMSC_IMPLEMENTATION_READINESS_REVIEW_v1.md` |
| Fecha | 2026-09-28 |
| Misión | MISIÓN CRÍTICA — CMSC_IMPLEMENTATION_READINESS_REVIEW_v1 (revisión final de arquitectura) |
| Documentos analizados | los 12 canónicos CMSC (abajo, §3) + insumos cruzados |
| Verificación | lectura íntegra + cruce con disco/runtime + claims verificados por búsqueda |
| Estado | DISEÑO v1 · verificación documental completa · **cero código implementado** |
| Lema | el CMSC está preparado para implementación controlada **si** se respetan gates, saneos de honestidad y unidad de canon |
| **Decisión (respuesta única de la misión)** | **SÍ, condicionado** — veredicto completo en §14 |

## 1. Propósito y alcance

Esta revisión cierra el ciclo de diseño CMSC (F3A→F4) verificando la **coherencia interna de los 12 documentos canónicos** y respondiendo una SOLA pregunta: ¿está el CMSC preparado para iniciar implementación controlada?

Estructura del análisis (los 10 puntos de la misión):
1. **Contradicciones** entre documentos (§4).
2. **Duplicidades** entre documentos (§5).
3. **Conceptos repetidos** que deberían converger en fuente única (§6).
4. **Dependencias faltantes** entre documentos/fases (§7).
5. **Gates faltantes** en la cadena (§8).
6. **Riesgos arquitectónicos** (§9).
7. **Riesgos de implementación** (§10).
8. **Vacíos documentales** (§11).
9. **Elementos listos** para implementación controlada (§12).
10. **Elementos que deben esperar** (§13).

Cada hallazgo lleva ancla (documento:sección o documento:línea) para que la corrección sea trazable.

## 2. Método de verificación

1. **Lectura íntegra** de los 12 documentos canónicos (conteo de líneas en §3) más `CMSC_DASHBOARD_IMPLEMENTATION_STRATEGY_v1.md` y `FRONTEND_EXECUTION_STRATEGY.md` como insumos de cruce.
2. **Verificación en disco** (estado real, no diseño): `App.jsx` con 15 rutas; 16 componentes reutilizables; `useLabStore` federado; registry KH con 51 docs y 6 categorías; 3 señales reales (mic Telecom S30 `REAL-LOCAL`, `SensorReading` S10/S11 `REAL` sin consumidor en 5174, `RobotTelemetry` S50 `REAL` con cliente ROTO); clima etiquetado `telemetría` (deuda), cluster BBB fabricado (`SIM`).
3. **Verificación de claims específicos con búsqueda** en los 12 docs: artefactos M2, promesa de registry en F3B, conteos de componentes, canon de estados, typos (`Categoría KP`, `IAslabón`, `/cmsc/matem`).
4. **Cruce con fundamentos operativos**: benchmark M1/M2 (decisión PENDIENTE), frontends 5173 legacy vs 5174 en evolución, regla suprema NADA DESAPARECE.

## 3. Cuerpo documental analizado

| Documento | Líneas | Rol en el diseño | Observado vs esperado |
|---|---|---|---|
| `CMSC_MASTERPLAN_v1.md` | 265 | Visión, identidad, agnosticismo, multiagente, roadmap F1→F4 | coherente; numeración F1-F4 no reconciliada con F3x |
| `CMSC_SIGNAL_MAP_v1.md` | 344 | Inventario S01..S80, 12 tipos/dominios | fuente única de señales |
| `CMSC_UI_ARCHITECTURE_v1.md` | 406 | Experiencia del dashboard CMSC | header "Fase 2 CMSC" (colisión, ver C1) |
| `CMSC_CANONICAL_STATE_v1.md` | 271 | Punto único de recuperación | §11 F2 = mapa+UI+estado (colisión C1) |
| `SIGCTIARURAL_ECOSYSTEM_FORENSIC_AUDIT_v1.md` | 266 | Arqueología y veredicto de rescate | fuente de honestidad de labs |
| `CMSC_LABS_RESTRUCTURING_PLAN_v1.md` | 212 | Auditoría por lab, matriz KH, preservar/integrar | columna KH vacía = problema base de F3E |
| `CMSC_F3A_INTERCONNECTION_BLUEPRINT_v1.md` | 338 | Red completa Señal→Impacto, 19 fuentes, puertos P-*, R1-R3, G-01..G-06 | promesa registry en F3B (C7) |
| `CMSC_F3B_SIGNAL_PRODUCERS_ECOSYSTEM_v1.md` | 480 | 8 clases, 7 etapas life, Registry/Lifecycle/Governance/Metadata/Confidence, G-01..G-08 | "clase" = eje origen (C6) |
| `CMSC_F3C_DASHBOARD_CONSTRUCTION_STRATEGY_v1.md` | 423 | Construcción del dashboard envolvente, 17/15/16 piezas, termómetro, roadmap | conteos C8; "6 estados + REF" (C5) |
| `CMSC_F3D_SIGNAL_NAVIGATION_STRATEGY_v1.md` | 412 | Explorer/Trace/Journey, 10 familias, honestidad 7 estados, G-F3D-1..6 | "7 estados" (C5); typos |
| `CMSC_F3E_KNOWLEDGE_INTEGRATION_STRATEGY_v1.md` | 388 | Evidence Ledger, Hangar, puente docsBySignal, graph, gobernanza M1/M2, G-F3E-1..7 | reclamar Q7/Q12; typos |
| `CMSC_F4_ACP_ARCHITECTURE_v1.md` | 380 | ACP orquestador, 6 sub-agentes, H1-H10, instancia determinista, G-F4A..G-F4D | coherente con cadena |

## 4. Análisis 1 — Contradicciones entre documentos

| ID | Contradicción | Ancla | Impacto |
|---|---|---|---|
| C1 | **Doble numeración de fases**: MASTERPLAN define roadmap F1→F4 (gates F1..F4), mientras la cadena F3A→F3B→F3C→F3D→F3E→F4 usa su propia numeración y gates G-*; nunca reconciliada. Además "Fase 2" significa cosas distintas: MASTERPLAN §Fase2 = Cimientos del Lab Espectral; CANONICAL §11 F2 = Mapa+UI+Estado canónico; UI_ARCH header y cierre se autodeclaran "Fase 2 CMSC"; RESTRUCTURING:98 dice Lab Espectral "Fase 2 planificada — F3 del roadmap" | MASTERPLAN:206-226 · CANONICAL:219-220 · UI_ARCH:3 · RESTRUCTURING:98 | actas y gates con fases ambiguas |
| C2 | **Propietario de vistas envolventes sin definir**: `/cmsc/matematica` y `/cmsc/ia` aparecen en CANONICAL §10, UI_ARCH y F3C; F3C roadmap (F3C:376) las asigna a F3E; F3E no las construye (solo knowledge). La vista IA (mapa modelo→señal + estado benchmark) queda huérfana | F3C:376 · CANONICAL:118-119 · F3E §1-§2 | eslabones del río sin vista cuando llegue el momento |
| C3 | **Estado honesto divergente de DataScience**: F3A fila 8 lo describe con SSE en vivo mientras FORENSIC y CANONICAL lo reportan aislado/roto con modelo degenerado | F3A:60 · FORENSIC:126 · CANONICAL:51 | riesgo de presentar como REAL lo que no lo es |
| C4 | **Ubicación de artefactos M2**: F3E §8 afirma artefactos "en `runs/M2_efficientnet_b0/`" con implicación de repo, pero CANONICAL §2.3 declara que residen en Drive/Colab con repatriación pendiente; CORRECCIONES_PARA_M2 confirma OUT en Drive | F3E:213 · CANONICAL:45 · CORRECCIONES_PARA_M2:41 | fe en artefactos locales inexistentes |
| C5 | **Canon de estados de honestidad no unificado**: F3C §13 "6 estados + REF"; F3D "7 estados"; códigos reales usados: REAL/REAL-LOCAL/SIM/REF/DISEÑO/ROTO/HUÉRFANO | F3C:251 · F3D:379-380 · F3B §3-§6 | termómetro/badges sin enumerado único |
| C6 | **"clase" con dos significados**: F3B define "clase" = uno de 8 orígenes (REAL/REMOTA/...); SIGNAL_MAP/CANONICAL/UI_ARCH usan "clase/tipo" = 12 dominios (físicas, digitales, ...); F3B G-02 exige cruce sin aclarar el término | F3B:49,66 · SIGNAL_MAP:75 · CANONICAL:96 · UI_ARCH:114 | ficha de señal ambigua |
| C7 | **Promesa de registry no cumplida en la fase prometida**: F3A afirma que los docs `CMSC_*` "deben aparecer en el registry en F3B"; la regeneración real se diseña en F3E-Q7/Q12 | F3A:191 · F3E:118 | el mapa científico no refleja los docs mientras tanto |
| C8 | **Conteos de componentes reutilizables en F3C**: 17 piezas (§5.1 Q4), 15 componentes tal cual (§11) y 16 en el estado de disco (§7/§16) — tres cifras para un mismo universo | F3C:109 · F3C:299,410 · F3C:417 | inventario de reúso no exacto |

Hallazgos menores (typos/denominaciones): F3E:159 `Categoría KP` (debe ser KH), F3D:220 `IAslabón`, F3D:69 `/cmsc/matem` inconsistente con `/cmsc/matematica` del resto.

## 5. Análisis 2 — Duplicidades entre documentos

| ID | Duplicidad | Estado | Recomendación |
|---|---|---|---|
| D1 | FFT Telecom ↔ MathV2 (semilla real vs solver sintético) | documentada en RESTRUCTURING; Lab Espectral como capacidad transversal | al implementar, una sola capacidad `/cmsc/espectral`; jamás dos labs paralelos |
| D2 | `docsBySignal` definido en F3A, F3B, F3C y F3E | 4 definiciones del mismo selector | fuente única: F3B §11 registry ∩ mapa; lectura derivada, nunca escrita |
| D3 | Envelope Común de Señal repetido en F3B/F3C/F3D/F3E | convergente en espíritu | canon en F3B; F3C-F3E solo referencian |
| D4 | `signalRegistry` declarativo: F3B §11 (esquema) y F3C (rama nueva en `useLabStore`) | dos descripciones del mismo objeto | UN objeto: esquema F3B, materialización-leer F3C |
| D5 | Catálogo de labs vs inventario de señales (registry) | dos catálogos paralelos | registry = única fuente de señales; labs conservan su catálogo académico `/labs` |
| D6 | Códigos de honestidad replicados en F3A/F3B/F3C/F3D (badges, termómetro, trace) | mismo conjunto, conteo divergente (C5) | enumerado canónico único en apéndice común |

## 6. Análisis 3 — Conceptos que deben converger en fuente única

1. **Signal Registry (F3B §11)** — fuente de verdad de señales; Explorer/Trace/Journey/cinta río/ACP/mapa científico solo LEEN de él.
2. **Envelope Común de Señal (F3B)** — formato único de señal viva (señal+estado+clase+dominio+metadata+confianza).
3. **registry KH generado** — fuente única de documentos; nadie lo escribe ad-hoc.
4. **`docsBySignal`** — proyección derivada (registry ∩ mapa), sin punteros escritos en ninguno de los dos lados.
5. **Canon de honestidad** — enumerado único pendiente de unificar (C5) antes de codificar termómetro y badges.
6. **Taxonomía dual** — 8 clases de origen (F3B) y 12 dominios (SIGNAL_MAP) son ejes ORTOGONALES; necesitan tabla cruzada explícita (F3B G-02 ya la exige) con nombres distintos para evitar la colisión léxica C6.

## 7. Análisis 4 — Dependencias faltantes

| ID | Dependencia | Dónde se define | Dónde se cubre | Estado |
|---|---|---|---|---|
| DF1 | Regeneración del registry (quién/cómo/cuándo) | F3E Q7/Q12 (F3E:118) | proceso conceptual solo | **no operativa** |
| DF2 | Puertos P-* materializados | F3B:31 los difiere a F3C | F3C los condiciona a gates F3A/F3B + saneo R1-R3 | *de orden*: pendiente de misión F3C explícita |
| DF3 | `docsBySignal` con docs CMSC visibles | F3A:191 | exige registry regenerado | bloquea la vista de conocimiento completa |
| DF4 | Saneo honestidad R1-R3 (clima→`clima-externo`, BBB→`SIM`, robot→ROTO/host) | F3A R1-R3 | prerrequisito de construcción F3C (F3C:395) | **bloqueante del primer código** |
| DF5 | Artefactos M2 físicos en repo (o re-etiqueta honesta) | CANONICAL:45 | Drive/Colab pendiente | abierta (no bloquea diseño, sí fe) |
| DF6 | Decisión benchmark M1 vs M2 | ES PENDIENTE (regla respetada en F3A/F3E) | no hay gate en cadena (ver G1 §8) | **abierta** |

## 8. Análisis 5 — Gates faltantes en la cadena

| ID | Gate faltante | Razón | Posición recomendada |
|---|---|---|---|
| G1 | Decisión benchmark (M1 vs M2) | PENDIENTE sin hito; F3E promueve evidencia de modelos | antes de promover evidencia de modelos en F3E |
| G2 | Integración end-to-end del primer río | F3D G-F3D-3/4 y F3E G-F3E-1..7 cubren por pieza, no el conjunto | gate E2E "primera señal completa" (S30→ledger→KH→ACP/NO_DATA honesto) |
| G3 | Canon único de estados y de "clase" (C5/C6) | impide codificar badges/termómetro/ficha sin ambigüedad | previo a F3C implementación |
| G4 | Colisión de prefijos de gates | F3A G-01..G-06 y F3B G-01..G-08 comparten numeración | renombrar actas a F3A-G01/F3B-G01 (o tabla de equivalencia) |

Los gates existentes (F3A G-01..G-06 · F3B G-01..G-08 · G-F3D-1..6 · G-F3E-1..7 · G-F4A..G-F4D) son verificables por documento y suficientes estructuralmente; falta solo cerrar G1-G4.

## 9. Análisis 6 — Riesgos arquitectónicos

| ID | Riesgo | Base | Mitigación en los docs |
|---|---|---|---|
| RA1 | Doble numeración F1-F4 vs F3x (C1) | MASTERPLAN vs cadena de los F3x | tabla de equivalencia explícita (§15 de este review) |
| RA2 | Lab Espectral como lab independiente (repetición del error de labs huérfanos) | RESTRUCTURING:189 | regla aprobada: capacidad transversal `/cmsc/espectral`, nunca lab aislado |
| RA3 | Río con eslabones huecos | S10 sin consumidor en 5174; S50 host ROTO | conectar real S30+S10+clima en primer slice; etiquetar lo roto |
| RA4 | Canon de honestidad no único aplicado a componente nuevo (C5) | badges/termómetro dependen del enumerado | G3 antes de código |
| RA5 | Agnosticismo de proveedor (MASTERPLAN §6 / F4) vs canal de voz real dependiente de Google (`/assist` 8081 SF2/STT/TTS) | F4 mitiga con núcleo determinista + slot | declarar el canal real como dependiente hoy; el ACP progresa sin él |
| RA6 | Registry nunca regenerado → mapa científico incompleto | F3A:191 · F3E:118 | DF1 + G-F3E-3 con proceso operativo |

## 10. Análisis 7 — Riesgos de implementación

| ID | Riesgo | Regla preexistente | Guarda |
|---|---|---|---|
| RI1 | Confundir runtimes 5173 (legacy Docker) vs 5174 (evolución) | FRONTEND_EXECUTION_STRATEGY | implementar SOLO en `src/frontend/src` (5174); 5173 intocable |
| RI2 | Dañar clave de `useLabStore` | F3A regla aditiva | congelar claves; etiquetar `bridgeStatus` huérfano, no borrar; `signalRegistry` rama nueva |
| RI3 | Escritura ad-hoc al registry KH | F3E §4 | regeneración es proceso gobernado; lab jamás edita salida generada |
| RI4 | Romper 15 rutas de `App.jsx` | F3C §2 | `/dashboard-cmsc` ruta nueva envolvente; no interceptar `/lab-*` |
| RI5 | Desplegar modelo degenerado | CANONICAL:51 | etiquetar, no promocionar; respetar `binary_only` |
| RI6 | Tocar M1/M2 o reentrenar | regla benchmark | no se re-entrena; no se promueven artefactos sin decisión |
| RI7 | Incluir robot como REAL sin sanear host | F3A R3 | `localhost:8000` roto → etiquetar ROTO honesto o sanear operativo fuera del alcance CMSC |

## 11. Análisis 8 — Vacíos documentales

| ID | Vacío | Doc afectado | Necesidad |
|---|---|---|---|
| V1 | Regeneración del registry sin procedimiento operativo (script, responsable, cadencia) | F3E Q7/Q12 | anexar procedimiento antes de F3E implementación |
| V2 | Criterios operativos de promoción ledger→registry (revisor, firma, versión) | F3E §4 hangar | definir roles de gobernanza F3B §14 concretos |
| V3 | Pruebas de aceptación de F3C (fixtures/asserts) | F3C | F4 sí tiene fixtures de rechazo; F3C no documenta acceptance tests |
| V4 | Decisión benchmark M1 vs M2 | todos | G1 (§8) |
| V5 | Presencia física de artefactos M2 (Drive→repo) | CANONICAL §2.3 | repatriación o re-etiqueta honesta |
| V6 | Estrategia específica de la vista `/cmsc/ia` (mapa modelo→señal, estado benchmark) | C2 | definición al llegar a F3E/F4 |
| V7 | Tabla cruzada 8 clases × 12 dominios formalizada | F3B G-02 | evitar C6 en el mapa científico |

## 12. Análisis 9 — Elementos listos para implementación controlada

Con verificación previa de gates y MISIÓN EXPLÍCITA por pieza:

| Elemento | Base | Nota de alcance |
|---|---|---|
| Dashboard envolvente `/dashboard-cmsc` (cinta del río + termómetro + badges) | F3C §2-§6 | reúsa 15 componentes; añade solo capas de organización y adaptadores de lectura |
| Adaptadores de lectura P-LAB-01/02, P-BE-01, P-WEATHER-01 (S30 · S10/S11 · clima) | F3A §10 | saneo de etiquetas (clima→`clima-externo`) incluido (RI-R3) |
| `docsBySignal` v1 solo lectura | F3B §7/§12 · F3E §5 | muestra docs actuales del registry (51) sin exigir regeneración |
| Vista catálogo del mapa S01..S80 (lectura) | F3D N1·N2 | sin motor nuevo |
| `signalRegistry` declarativo como rama nueva de `useLabStore` | F3B §11 · F3C §7 | no toca claves existentes |
| Núcleo determinista del ACP (F4A) con fixtures de rechazo a señal/evidencia/confianza inventadas | F4 G-F4A | sin LLM; respuestas NO_DATA/DISEÑO honestas |
| Termómetro de honestidad mínimo (badge junto a valor + confidence) | F3C §13 · F3D §6 | requiere G3 (canon único) resuelto antes |

## 13. Análisis 10 — Elementos que deben esperar

| Elemento | Espera | Motivo |
|---|---|---|
| Lab Análisis Espectral (módulos FFT/STFT/Wavelets/Bioacústica) | priorización/hackathon | MASTERPLAN Fase 2; NO en el primer slice |
| Evidence Ledger con escritura operativa | F3E aprobada + gobernanza + proceso de regeneración (V1/V2) | cierra la columna KH vacía sin contaminar el registry |
| Regeneración del registry | definición operativa (V1) | no se regenera por decreto |
| Slot intérprete F4B y agentes F4C | F4A + F3E | multiagente se levanta sobre datos gobernados |
| Señales BBB (S25) / UBTN (S20-S24) / ESP32 / MQTT / RF / bioacústica | nacimiento real de la señal | entran por los 5 pasos F3B al existir |
| Saneo del host robot (`localhost:8000`) | decisión operativa (backend/robótica) | fuera del alcance CMSC; mientras tanto ROTO honesto |
| Promoción de M1/M2 (o M3 futuro) a estado oficial | decisión benchmark (G1) | prior y rígido a la regla PENDIENTE |

## 14. Veredicto — ¿Está el CMSC preparado para iniciar implementación controlada?

**SÍ, condicionado.** El diseño es estructuralmente competente para comenzar implementación controlada **por slices**, con la tesis central intacta y verificada: las señales son ciudadanas de primera clase, los laboratorios son sus servidores, la honestidad de estado es invariante, todo se envuelve y conecta en lugar de reescribirse, y las fases pueden proceder sin rediseñar el ecosistema.

Las contradicciones halladas (C1-C8) son de **numeración, terminología y promesas documentales** — no invalidan la arquitectura — pero exigen decisiones rápidas antes del primer código. Nada de lo hallado obliga a rediseñar; todo lo hallado se resuelve con apéndices, tablas de equivalencia y gates.

### Condiciones bloqueantes antes del primer código (orden estricto)
1. **Gates documentales**: F3A (G-01..G-06) y F3B (G-01..G-08) **aprobados por Bernardo** sobre los documentos.
2. **Saneo de honestidad R1-R3**: clima→`clima-externo` · cluster BBB→`SIM` · robot→`ROTO`/host saneado (F3A R1-R3 · F3C:395).
3. **Canon unificado** de estados de honestidad y de terminología "clase" (C5/C6) en un apéndice único común.
4. **Regeneración del registry con procedimiento operativo** (V1) definido antes de F3E implementación.
5. **Gate de decisión benchmark (G1)** fijado en el roadmap (recomendado: antes de promover evidencia de modelos en F3E).
6. **Cada pieza entra por MISIÓN EXPLÍCITA**: F3C implementación → F3D → F3E → F4A; jamás implementación global autorreferida.

### Primer slice recomendado (primera misión de código)
**F3C v1 implementación** (previa misión explícita): nacimiento de `/dashboard-cmsc` envolvente, cinta del río con las 3 señales reales (S30 + S10/S11 + clima `clima-externo`), termómetro de honestidad + badges (tras G3), adaptadores de lectura P-*, `docsBySignal` y catálogo del mapa S01..S80 en modo lectura, `signalRegistry` como rama nueva de `useLabStore`. Cero escritura al KH, cero cambios a rutas existentes, cero motors nuevos.

## 15. Tabla de equivalencia de fases (resolución C1/G4)

| Denominación emergente | Documento que la define | Equivalencia funcional |
|---|---|---|
| F1 Fundamentación (MASTERPLAN) | MASTERPLAN:206 | base de todo el diseño (aprobada) |
| F2 Mapa+UI+Estado canónico | CANONICAL §11 | = primer bloque documental (SIGNAL_MAP + UI_ARCH + CANONICAL) |
| F2 Lab Espectral (MASTERPLAN) | MASTERPLAN:208 | pendiente estratégico, NO iniciado |
| F3 Integración horizontal (MASTERPLAN) | MASTERPLAN:214 | = cadena F3A→F3B→F3C→F3D→F3E (esta revisión) |
| F4 Multiagente (MASTERPLAN) | MASTERPLAN:220 | = F4 del ACP (F4A→F4D) |
| Gates de cada F3x | F3A G-01.. · F3B G-01.. · G-F3D-· · G-F3E-· · G-F4A.. | prefijar actas: F3A-G01, F3B-G01, etc. |

## 16. Resumen de hallazgos (consolidación)

| Punto de análisis | Resultado | Acción |
|---|---|---|
| Contradicciones (C1-C8) | 8 hallazgos, ninguno estructural | apéndices de canon + decisiones de Bernardo |
| Duplicidades (D1-D6) | convergen en fuente única | registry + F3B como canon |
| Conceptos fuente única (6) | registry · envelope · KH · docsBySignal · canon · taxonomía | respetar lectura-derivada |
| Dependencias faltantes (DF1-DF6) | 6, dos bloqueantes (DF4, DF1) | saneo R1-R3 + proceso de regeneración |
| Gates faltantes (G1-G4) | 4 menores | cerrar benchmark, E2E, canon, prefijos |
| Riesgos arquitectónicos (RA1-RA6) | 6, gestionables | reglas ya existentes |
| Riesgos de implementación (RI1-RI7) | 7, todos con guarda | solo leer·envolver·etiquetar |
| Vacíos documentales (V1-V7) | 7 | 3 bloqueantes de F3E, 1 de F3C |
| Listos (12) | dashboard v1 · adaptadores lectura · docsBySignal · catálogo · signalRegistry · F4A determinista · termómetro | primera misión = F3C v1 |
| Deben esperar (8) | espectral · ledger escritura · regeneración · intérprete/agentes · señales futuras · robot · M1/M2 | nada de esto precede al slice F3C |

## 17. Cierre y honestidad de estado

- **Documento de DISEÑO v1 — revisión documental completa.** Cero código implementado, cero componentes modificados, cero commits.
- **No decide** el benchmark (M1 vs M2), no aprueba fases por sí mismo, no autoriza implementación: solo recomienda y condiciona a Bernardo.
- **Regla suprema preservada:** nada desaparece, todo se preserva, todo se conecta y todo evoluciona dentro de la cadena F3A→F3E→F4 con gates verificables por documento.
- **Lo que esta revisión NO hace:** implementar, modificar, crear rutas/páginas, tocar backend/Docker/Telemetry/SensorReading/RobotTelemetry/BBB/Labs/KH/IA, ni emitir decisiones de gobernanza del benchmark.
- **Salida:** este documento queda como puente entre el diseño (F3A→F4) y la primera implementación controlada (misión F3C v1), condicionada a los 6 puntos del §14.

*Documento de DISEÑO v1 — Revisión de preparación para implementación del CMSC. Sin código, sin commits. Vigente la regla suprema: NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.*