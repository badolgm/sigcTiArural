# REALITY RECONSTRUCTION AUDIT V1

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: docs/REALITY_RECONSTRUCTION_AUDIT_V1.md
> - Destino: docs/REALITY_RECONSTRUCTION_AUDIT_V1.md

**Fecha de corte:** 2026-11-09  
**Repositorio:** `badolgm/sigcTiArural`  
**HEAD inspeccionado:** `004deb852d08f84a4a67228b759d87e1b1abf653` (`docs(runtime): document conditional docker readiness validation`, 2026-10-30)  
**Rama activa:** `toshiba/c-02-composition-root`; comparte HEAD con `feature/cmsc-f3c-v1-implementation`, `origin/feature/cmsc-f3c-v1-implementation` y el tag `PRE_PUSH_VALIDATED_20261103`.

## Alcance y método

Se contrastaron commits, referencias Git, documentos primarios versionados, archivos fuente disponibles y, para el estado actual, la escucha local de los puertos 5173/5174 y la existencia de las rutas locales ignoradas de dataset y runs. La documentación se trató como evidencia de lo que declara haber ejecutado, no como sustituto de artefactos que ya no están presentes en este checkout.

`CANONICAL_PROJECT_STATE_20261109.md` se consultó únicamente para identificar las afirmaciones del backlog que debían contrastarse. No se usó como evidencia. `DOCUMENTATION_GOVERNANCE_REVIEW.md` no se usó. No se modificaron fuentes ni datos existentes; este informe es el único archivo creado por la auditoría.

**Límite importante:** el árbol de trabajo ya estaba sucio antes de la auditoría: contiene cambios y documentos sin seguimiento ajenos a este entregable. No se interpretaron como evidencia de estos cinco temas. Los WAV/schema acústicos y los runs están fuera de Git/ignorados; al corte, `data/`, `data/datasets/sigct_rural_acoustic/` y `benchmark/runs/{M1_mobilenetv2_001,M2_efficientnet_b0}/` no existen en el checkout inspeccionado. Por ello, sus estados físicos actuales no pudieron revalidarse; las conclusiones de esos puntos distinguen evidencia documental de archivos presentes.

## 1. M1 vs M2

### 1. Evidencia encontrada

- M1 (MobileNetV2) tiene resultados de validación documentados: macro-F1 0.9899, ECE 0.0313, balanced accuracy 0.9898 y weighted-F1 0.9902. Su notebook y dossiers conservan evidencia de entrenamiento, pero no sus checkpoints; el informe forense clasifica M1 como `M1_PARTIAL`.
- M2 (EfficientNet-B0) fue ejecutado oficialmente. Su benchmark de validación es macro-F1 0.9937, ECE 0.0332, balanced accuracy 0.9943 y weighted-F1 0.9956. El informe de recuperación documentó 13 artefactos verificados fuera del repositorio. La exportación ONNX y su paridad con PyTorch también se documentaron como `G-NEW-A = PASS`.
- Sí existe un dictamen explícito de gobernanza: **M1 sigue como baseline oficial congelado; M2 sigue como challenger y no se promueve**. El cierre justifica la decisión por ECE y coste edge, además de registrar que el test single-use no se ejecutó.
- Por tanto, hay una decisión documentada sobre el rol vigente, pero no un benchmark confirmatorio final sobre test ni evidencia de que se haya promovido M2. El propio contrato de promoción mantiene esas condiciones pendientes. El ONNX documentado está exportado, no servido ni promovido.
- La evidencia runtime posterior (2026-10-30) reporta `/health` y `/infer` operativos con `model_status=HISTORICO`, `artifact_id=plant_disease_mbv2@77b0efec`, espacio binario de 2 clases y `scientific_scope=binary_only`. Es evidencia de que se probó serving del `.h5` histórico, no de que M2 esté sirviéndose; esa misma verificación quedó `NOT_VERIFIED` por fallos de presentación/voz en la UI.
- En el checkout actual no están los directorios binarios de M1/M2. Los registros y la tarjeta sí están versionados; no se revalidó hoy la presencia del export/checkpoints externos.

### 2. Documentos revisados

- [M1_M2_GOVERNANCE_CLOSURE_REPORT.md](./M1_M2_GOVERNANCE_CLOSURE_REPORT.md)
- [M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md](./M2_ARTIFACT_FORENSIC_VALIDATION_REPORT.md)
- [M1_RECOVERY_AUDIT_REPORT.md](./M1_RECOVERY_AUDIT_REPORT.md)
- [M1_M2_ARTIFACT_RECOVERY_REPORT.md](./M1_M2_ARTIFACT_RECOVERY_REPORT.md), reemplazado para M2 por el informe forense posterior
- [M2_ARTIFACT_RECORD.md](./ai/artifacts/M2_ARTIFACT_RECORD.md)
- [M2_ONNX_EXPORT_RECORD.md](./ai/artifacts/M2_ONNX_EXPORT_RECORD.md)
- [M2_efficientnet_b0.model_card.md](./ai/artifacts/model_cards/M2_efficientnet_b0.model_card.md)
- [H5_AI_GOVERNANCE_CLOSURE_REPORT.md](./H5_AI_GOVERNANCE_CLOSURE_REPORT.md)
- [DOCKER_READY_FINAL_DECISION_REPORT.md](./DOCKER_READY_FINAL_DECISION_REPORT.md)
- [L1_L6_RUNTIME_VERIFICATION_REPORT.md](./L1_L6_RUNTIME_VERIFICATION_REPORT.md)
- [L1_L6_EXECUTION_REPORT.md](./L1_L6_EXECUTION_REPORT.md)
- [ESTADO_ACTUAL_BENCHMARKS.md](../Documentacion/IA/ESTADO_ACTUAL_BENCHMARKS.md)
- [TABLA_COMPARATIVA_M1_M5.md](../Documentacion/IA/Benchmark_M1_MobileNetV2/TABLA_COMPARATIVA_M1_M5.md)

### 3. Última evidencia cronológica encontrada

La decisión de gobernanza y los registros M2 están documentados el **2026-10-14**; la cadena Git incluye `20041da` (artefactos/gobernanza M2) y `d930a34` (cierre de gobernanza). La evidencia runtime posterior del **2026-10-30** (`492ee52` y [L1_L6_RUNTIME_VERIFICATION_REPORT.md](./L1_L6_RUNTIME_VERIFICATION_REPORT.md)) confirma serving probado del artefacto histórico, pero no cambia el rol ni la promoción M1/M2. No se encontró una decisión posterior de promoción ni un test single-use ejecutado hasta el HEAD inspeccionado.

### 4. Estado real

**PARCIAL**

Hay decisión formal y cierre de gobernanza del rol baseline/challenger. El benchmark disponible es de validación, no el cierre confirmatorio de test; M1 carece de pesos recuperados y M2 no está promovido ni servido. La afirmación «decisión final totalmente pendiente» es imprecisa: la decisión vigente de no promover M2 sí está documentada; las condiciones de promoción siguen abiertas.

## 2. Dataset acústico — Tramo C

### 1. Evidencia encontrada

- Tramo C sí se implementó: el historial Git registra `af65c4e` (`feat(cmsc): enable continuous PCM capture via AudioWorklet`) y `83e7af2` (`docs(cmsc): add bridge and tramo C validation reports`), ambos del 2026-10-11. El informe registra AudioWorklet con fallback ScriptProcessor y conservación de la ruta de visualización FFT de S30.
- La validación reportada recorrió el flujo de captura de 3 s, remuestreo declarado 48 kHz→44,1 kHz, ingesta aceptada y extracción de 44 dimensiones. La prueba de UI/e2e documenta el uso de **sandbox** y shim determinista; el dataset C0 productivo se declaró intacto con baseline de 1 fila, 1 WAV y 1 vector antes/después. Ese resultado no equivale a una campaña de captura de campo.
- La auditoría Tramo B/C identifica explícitamente como pendiente la validación con micrófono real en campo, la captura masiva y el cierre de gates de datos. El estado descrito es infraestructura/flujo validado, no dataset curado ni split/publicación.
- En el checkout actual no existe `data/` ni el árbol local del dataset. No es posible confirmar desde los archivos presentes si el baseline documental de 1 muestra sigue siendo el contenido físico actual.

### 2. Documentos revisados

- [INFORME_TRAMO_C_FINAL.md](./INFORME_TRAMO_C_FINAL.md)
- [AUDIT_TRAMO_BC.md](./AUDIT_TRAMO_BC.md)
- [INFORME_BRIDGE_E2E_UI.md](./INFORME_BRIDGE_E2E_UI.md)
- [EVIDENCIA_FLUJO_BRIDGE.md](./EVIDENCIA_FLUJO_BRIDGE.md)
- [FIELD_CAPTURE_RUN_001_REPORT.md](./FIELD_CAPTURE_RUN_001_REPORT.md)
- [INITIAL_CAPTURE_EVIDENCE.md](./INITIAL_CAPTURE_EVIDENCE.md)
- [DATASET_STATUS_REPORT.md](./DATASET_STATUS_REPORT.md)
- [AI_ACOUSTIC_CAPTURE_OPERATOR_GUIDE.md](./AI_ACOUSTIC_CAPTURE_OPERATOR_GUIDE.md)
- [AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md](./AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md)
- Fuentes de Tramo C: `src/frontend/src/pages/cmsc/SpectralAnalysisInstrument.jsx` y `src/frontend/public/worklets/pcm-capture-processor.js`

### 3. Última evidencia cronológica encontrada

La evidencia específica más reciente encontrada es el cierre de Tramo C y sus informes, fechados **2026-10-09** y versionados en la cadena de commits del **2026-10-11**. El informe distingue la validación en sandbox del C0 productivo. No se encontró una captura de campo ni un cierre posterior de los gates hasta el HEAD inspeccionado.

### 4. Estado real

**PARCIAL**

Tramo C (PCM continuo) fue implementado y validado en el alcance reportado; no está pendiente como prerrequisito técnico. La captura productiva/masiva, la verificación de campo, el curado/split y los gates de dataset siguen sin evidencia de cierre. La ruta de datos ignorada está ausente del checkout actual, así que el conteo físico presente no es verificable aquí.

## 3. Gobernanza acústica D-2, D-3 y D-4

### 1. Evidencia encontrada

- **D-2:** decisión documentada el 2026-10-06 para usar 0.98 como umbral **provisional** de near-duplicate y calibrarlo con 200 clips reales (FPR ≤1%, detección ≥95%). La calibración continúa siendo necesaria para cerrar G-DS-3; no se encontró evidencia de que se haya ejecutado.
- **D-3:** decisión documentada el 2026-10-06 de ratificar el binding `class_id=ruido_desconocido` ↔ `dir_name=desconocido`; se decidió no uniformar esos nombres. Se describe como cierre formal, no como trabajo pendiente.
- **D-4:** decisión documentada el 2026-10-06 de publicar §14 «Reconciliación y erratas» en el diseño y corregir la referencia CSV/Parquet en la gobernanza. El §14 existente declara la gobernanza como descripción de lo construido y conserva el diseño original como historial.
- La documentación misma distingue la resolución de D-2 de la aceptación final del gate: la falta de calibración con material real impide declarar G-DS-3 cerrado.

### 2. Documentos revisados

- [AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md](./AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md), en particular §§4, 7 y 7.1
- [AI_ACOUSTIC_DATASET_V1_DESIGN.md](./AI_ACOUSTIC_DATASET_V1_DESIGN.md), §14
- [DATASET_STATUS_REPORT.md](./DATASET_STATUS_REPORT.md)
- Registro Git del cambio `7bfa0c9` (`docs(acoustic): gobernanza schema 1.3.0 y trazabilidad D5`), que actualiza la gobernanza y el diseño

### 3. Última evidencia cronológica encontrada

Las decisiones D-2, D-3 y D-4 están fechadas **2026-10-06**. La última sincronización documental encontrada es el commit `7bfa0c9`, **2026-10-07**. Los informes posteriores de Tramo C no presentan una nueva decisión sobre estas D-items ni evidencia de la calibración real de D-2.

### 4. Estado real

**PARCIAL**

D-3 y D-4 tienen resolución documental formal. D-2 también tiene una decisión formal, pero provisional: la calibración especificada sigue pendiente para el cierre definitivo de G-DS-3. Por tanto, el backlog que presenta D-2, D-3 y D-4 indistintamente como decisiones pendientes quedó desactualizado; persiste el pendiente de validación/calibración de D-2.

## 4. Frontend 5174

### 1. Evidencia encontrada

- La convención documentada distingue 5173 (frontend legacy Docker) de 5174 (Vite de desarrollo); 5174 se inicia con `--port 5174 --strictPort`, mientras la configuración Vite conserva 5173 por defecto.
- Se documentó `npm run build` exitoso, build Docker exitoso y cuatro smoke tests aprobados en la fase de oficialización 2. La misma evidencia deja P5 (`manualChunks`) pospuesto y reporta que lint permanece rojo por errores preexistentes en módulos fuera de alcance. La prueba del endpoint `/api/health` devolvió 502, aceptado por el criterio de smoke test como comprobación del proxy, no de la disponibilidad funcional del backend.
- La auditoría de oficialización anterior también identifica validaciones aún necesarias para reemplazo/despliegue, como pruebas remotas y E2E en entorno servido.
- **Observación local al 2026-11-09:** no hay proceso escuchando ni en TCP 5174 ni en 5173. Esto prueba que el servidor dev no está activo en este checkout al momento de la inspección; no demuestra que la aplicación no pueda arrancar.

### 2. Documentos revisados

- [FRONTEND_EXECUTION_STRATEGY.md](../Documentacion/Arquitectura/FRONTEND_EXECUTION_STRATEGY.md)
- [SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT.md](./SIGCTIARURAL_FRONTEND_OFFICIALIZATION_AUDIT.md)
- [SIGCTIARURAL_FRONTEND_OFFICIALIZATION_PHASE1_REPORT.md](./SIGCTIARURAL_FRONTEND_OFFICIALIZATION_PHASE1_REPORT.md)
- [SIGCTIARURAL_FRONTEND_PHASE2_READINESS_REPORT.md](./SIGCTIARURAL_FRONTEND_PHASE2_READINESS_REPORT.md)
- [FRONTEND_OFFICIALIZATION_PHASE_2_REPORT.md](./FRONTEND_OFFICIALIZATION_PHASE_2_REPORT.md)
- [FRONTEND_OFFICIALIZATION_PHASE_2_EXECUTION_PLAN.md](./FRONTEND_OFFICIALIZATION_PHASE_2_EXECUTION_PLAN.md)
- Fuente de configuración: `src/frontend/vite.config.js`

### 3. Última evidencia cronológica encontrada

La última ejecución de oficialización documentada es **2026-10-13** (`FRONTEND_OFFICIALIZATION_PHASE_2_REPORT.md`; commit `9109050`). Las comprobaciones de puertos son una observación directa del checkout y runtime local el **2026-11-09**: 5174 y 5173 sin listener. El informe runtime del 2026-10-30 registra un build Docker posterior, pero no es una nueva validación de 5174 ni una prueba remota del frontend. No se encontró evidencia de una nueva fase de oficialización después de la fase 2.

### 4. Estado real

**PARCIAL**

La fase 2 y su build/smoke test quedaron ejecutados; el frontend no está corriendo ahora en 5174 y la readiness para un despliegue remoto no está cerrada por la evidencia revisada. La afirmación de que 5174 está «activo» es falsa para la observación actual. La línea de backlog de producción es parcialmente vigente, pero omite que ya hubo build Docker y smoke tests, y no debe confundirse el puerto dev con un puerto de producción.

## 5. Licencias de datasets REF

### 1. Evidencia encontrada

- La estrategia, catálogo y plan H0–H3 documentan decisiones y reglas por fuente: FSD50K se filtra por licencia de cada clip (lote mínimo CC0/CC-BY); ESC-50 es CC BY-NC con ESC-10 CC BY; Xeno-canto requiere verificación por grabación y excluye ND; SONYC-UST y Speech Commands se documentan CC BY; AudioSet se limita a ontología/anotaciones y nunca a audio.
- Las decisiones de alcance registradas el 2026-10-07 son: AudioSet solo ontología; BirdCLEF diferido; UrbanSound8K excluido; las fuentes C1 previstas son ESC-50, FSD50K, Xeno-canto, SONYC-UST y Speech Commands. En consecuencia, BirdCLEF no obliga actualmente a admitir CC-BY-NC-SA.
- El paquete D5 propone y la trazabilidad documental posterior registra `schema_version` 1.3.0, `partition=reference` y `source=audioset`. La licencia **no cambió**: el enum documentado conserva `PROPIO`, `CC0`, `CC-BY`, `CC-BY-SA`, `CC-BY-NC`; `CC Sampling+` queda fuera del lote mínimo y sin valor nuevo en el enum.
- La preparación H3 no equivale a ingesta: el plan y readiness indican que no se descargó material y que la ejecución requería decisiones/condiciones adicionales. En el checkout actual no existe `data/` ni el árbol `reference/`; no hay manifiestos REF ni archivos descargados presentes que permitan verificar licencias por archivo. El `schema.json` citado por hash tampoco está disponible aquí para comprobarlo byte a byte.

### 2. Documentos revisados

- [AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md](./AI_ACOUSTIC_HYBRID_DATASET_STRATEGY_V1.md)
- [AI_ACOUSTIC_REFERENCE_LAYER_ARCHITECTURE_V1.md](./AI_ACOUSTIC_REFERENCE_LAYER_ARCHITECTURE_V1.md)
- [AI_ACOUSTIC_REFERENCE_DATASET_CATALOG.md](./AI_ACOUSTIC_REFERENCE_DATASET_CATALOG.md)
- [AI_ACOUSTIC_REFERENCE_INGESTION_PLAN_V1.md](./AI_ACOUSTIC_REFERENCE_INGESTION_PLAN_V1.md)
- [AI_ACOUSTIC_H3_EXECUTION_READINESS_V1.md](./AI_ACOUSTIC_H3_EXECUTION_READINESS_V1.md)
- [AI_ACOUSTIC_H3_DECISION_PACKAGE_FINAL.md](./AI_ACOUSTIC_H3_DECISION_PACKAGE_FINAL.md)
- [AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md](./AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md), §11 (puntero y hashes de contrato)
- Commit `7bfa0c9` (trazabilidad documental D5; el schema material no está versionado en Git)

### 3. Última evidencia cronológica encontrada

El catálogo y los planes H0–H2 están fechados **2026-10-06**; el readiness H3, el paquete D5 y la actualización de la traza de esquema son del **2026-10-07**. La última decisión de alcance documentada es AudioSet solo ontología/BirdCLEF diferido. No se encontró una misión posterior de descarga, inventario o validación de licencias por archivo hasta el HEAD inspeccionado.

### 4. Estado real

**PARCIAL**

La política y las decisiones principales por licencia/fuente están documentadas; ya no es correcto describirlas solo como propuestas pendientes de Bernardo. La ingesta, la procedencia/checksum por archivo y el cierre operativo de H3 siguen sin evidencia. La ausencia actual de `data/` impide certificar en este checkout un schema o corpus REF materializado.

## Contraste del backlog

El backlog citado se contrastó solo después de reconstruir cada tema desde Git, documentos primarios y observaciones locales. Resultado:

| Afirmación de backlog contrastada | Resultado desde la evidencia |
|---|---|
| «Decisión final M1 vs M2 pendiente» | **Parcialmente desactualizada.** Existe decisión formal vigente: M1 baseline / M2 challenger, sin promoción. Sigue pendiente el test confirmatorio y cualquier promoción posterior. |
| «Captura masiva acústica requiere Tramo C» | **Desactualizada en la dependencia.** Tramo C está implementado y validado en sandbox; captura real/masiva y gates siguen pendientes. |
| «D-2, D-3 y D-4 pendientes» | **Desactualizada.** D-3 y D-4 cerradas; D-2 decidida provisionalmente, con calibración real pendiente. |
| «5174 activo; falta validar producción» | **Parcialmente desactualizada.** Fase 2, build Docker y smoke documentados; hoy 5174 no escucha. La validación remota/operativa completa no está demostrada. |
| «Licencias REF pendientes de decisión» | **Desactualizada respecto a decisiones de alcance/licencia; vigente respecto a ejecución.** Hay selección y filtros documentados, pero no ingesta ni verificación de licencias sobre archivos REF. |

**Conclusión global:** el backlog de `CANONICAL_PROJECT_STATE_20261109.md` no sigue siendo válido tal como está redactado para estos cinco temas. Está **parcialmente desactualizado**: mezcla trabajo ya ejecutado/cerrado con pendientes residuales que sí permanecen. La revisión de estados no permite afirmar que todo el backlog esté cerrado, ni que todas sus premisas originales sigan siendo ciertas. Los hechos actuales del benchmark binario, el dataset acústico y los artefactos REF tienen además el límite de que sus archivos externos/ignorados no están presentes en este checkout.
