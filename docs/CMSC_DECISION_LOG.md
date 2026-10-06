# CMSC DECISION LOG

**Proyecto:** CMSC Orquestación V2  
**Fecha:** 2026-10-05  
**Estado:** CONGELAMIENTO DOCUMENTAL

---

## 1. DECISIONES APROBADAS

| # | Decisión | Fecha | Activo |
|---|---|---|---|
| A-1 | Logger como etapa de la Zona V2 en `/dashboard-cmsc` | 2026-10-04 | ✅ |
| A-2 | `8765` descartado como arquitectura | 2026-10-04 | ✅ |
| A-3 | Flujo: S30 → Logger → Dataset → Validación → S81 → S82 → KH | 2026-10-04 | ✅ |
| A-4 | Visual Freeze §12 | 2026-10-04 | ✅ |
| A-5 | Contrato S30→Logger (PCM de solo lectura) | 2026-10-05 | ✅ |
| A-6 | `acoustic.feat.v2` / `window.v2` (44 dims) | 2026-10-05 | ✅ |
| A-7 | `dataset_state` con máquina de 5 estados | 2026-10-04 | ✅ |
| A-8 | Group split por `(session_id, place_id)` | 2026-10-04 | ✅ |
| A-9 | Holdout de sitio (`site_c`) | 2026-10-05 | ✅ |
| A-10 | 100% doble revisión en el piloto | 2026-10-04 | ✅ |
| A-11 | `ruido_desconocido` como bucket OOD (no se captura) | 2026-10-04 | ✅ |
| A-12 | Piloto de 100 muestras en 8 clases vivas | 2026-10-04 | ✅ |
| A-13 | Sin backend: handoff vía CLI local | 2026-10-05 | ✅ |
| A-14 | Manifiestos se copian a `docs/ai/manifests/` al liberar (G-DS-4) | 2026-10-05 | ✅ |

---

## 2. DECISIONES DESCARTADAS

| # | Decisión | Motivo de descarte |
|---|---|---|
| D-1 | Logger como aplicación/página independiente | Restricción canónica: todo dentro de `/dashboard-cmsc` |
| D-2 | `8765` como puerto de producción | Entorno temporal de validación, descartado |
| D-3 | Reconstruir WAV desde frames FFT | El contrato exige PCM crudo |
| D-4 | Abrir segundo `getUserMedia` en el Logger | Contrato de source compartido de solo lectura |
| D-5 | Simular lluvia con aspersor | Dato falso en un dataset científico |
| D-6 | Capturar voz sin consentimiento | Privacidad |
| D-7 | Entrenar modelos sin G-DS + G-M | Gobernanza |
| D-8 | Implementar S81/S82 sin dataset validado | Gobernanza |
| D-9 | Publicar evidencia cruda como conocimiento | Requiere Ledger/Hangar |
| D-10 | Aproximar Cohen κ desde `agreement` | Exige tabla de contingencia real |

---

## 3. RESTRICCIONES PERMANENTES

| # | Restricción | Origen |
|---|---|---|
| P-1 | NO crear rutas nuevas | Visual Freeze |
| P-2 | NO crear dashboards nuevos | Visual Freeze |
| P-3 | NO crear laboratorios nuevos | Visual Freeze |
| P-4 | NO crear backend nuevo | Contrato S30→Logger |
| P-5 | NO modificar componentes congelados | Visual Freeze |
| P-6 | NO tocar Hero, ACP, Workbench, Benchmark, KH | Visual Freeze |
| P-7 | NO entrenar modelos sin G-DS + G-M | Gobernanza |
| P-8 | NO implementar S81/S82 sin dataset validado | Gobernanza |
| P-9 | NO alterar contratos aprobados | Gobernanza |
| P-10 | NO declarar gates PASS sin evidencia real | Honestidad |
| P-11 | NO afirmar capturas reales sin evidencia | Honestidad |
| P-12 | NO avanzar a Fase 3 sin PILOT-1..7 | Gobernanza |

---

## 4. VISUAL FREEZE

**Aprobado:** 2026-10-04 21:51:22 (America/Bogota, UTC-05:00)

| Franja | Contenido | Estado |
|---|---|---|
| A | Cabecera + stepper de 7 etapas | ✅ Congelada |
| B | Logger (7/12) + Dataset/Validación (5/12) | ✅ Congelada |
| C | Consumidores S81/S82/KH | ✅ Congelada |
| D | Supervisión: ACP | ✅ Congelada |

**Fuera de la Zona (conservados):**
- MmcHero
- SpectralAnalysisInstrument (S30)
- SignalExplorerAccordion
- ModelPredictCell
- LabDoors
- BenchmarkCell
- Accesos a KH / Roadmap / Gobernanza

---

## 5. GOBERNANZA ACÚSTICA

| Decisión | Estado |
|---|---|
| `schema.json` 1.2.0 (42 columnas) | ✅ Aprobado |
| `acoustic.feat.v2` / `window.v2` (44 dims) | ✅ Aprobado |
| `acoustic.feat.v1` / `window.v1` | ✅ Congelado |
| `dataset_state` con máquina de 5 estados | ✅ Aprobado |
| Group split + holdout | ✅ Aprobado |
| 100% doble revisión en piloto | ✅ Aprobado |
| `ruido_desconocido` como bucket OOD | ✅ Aprobado |
| Manifiestos se copian al liberar (G-DS-4) | ✅ Aprobado |
| Contratos fuera de git (solo huella en docs) | ✅ Aprobado |

---

## 6. ESTADO HONESTO

| Elemento | Estado |
|---|---|
| Dataset | `PREPARADO_VACIO` |
| Muestras reales | 0 |
| `metadata.csv` | 0 filas |
| WAV | 0 |
| PILOT-1..7 | PENDING |
| G-DS-1 | FAIL |
| G-DS-2..4, G-DS-6 | PENDING |
| G-DS-5 | CUMPLIBLE |
| S81 | BLOQUEADO |
| S82 | BLOQUEADO |
| Training | BLOQUEADO |

---

## CONCLUSIÓN

**Las decisiones están registradas. Las restricciones son permanentes. El estado es honesto.**

**Para reanudar:** leer `CMSC_CONTINUATION_PROMPT.md`.

---

**Estado del documento:** CONGELAMIENTO DOCUMENTAL  
**Fecha:** 2026-10-05
