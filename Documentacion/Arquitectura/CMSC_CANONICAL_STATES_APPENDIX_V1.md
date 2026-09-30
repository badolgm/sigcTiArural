# CMSC — Apéndice de Canon Unificado: Estados de Honestidad y Terminología (v1)

| Campo | Valor |
|---|---|
| Documento | CMSC_CANONICAL_STATES_APPENDIX_v1 |
| Fecha | 2026-09-29 |
| Misión | CMSC_GOVERNANCE_GATE_CLOSURE_V1 |
| Naturaleza | Gobernanza · apéndice canónico único. Sin código, sin commits. |
| Resuelve | Contradicción C5 (canon de estados 6+REF vs 7) y C6 (doble sentido de "clase") del READINESS_REVIEW:67 |
| Estatus | APENDICE que complementa, NO sustituye, a los 12 documentos canónicos CMSC |

---

## 1. Objeto

Unificar en un solo canon, aplicable a badges, termómetro, fichas de señal y vistas CMSC, (1) los estados de honestidad y (2) la terminología de "clase" frente a "dominio". Row de cierre para las condiciones 3 del Blueprint §5 (C5/C6) y F3B G-02.

## 2. Canon de estados de honestidad (único, 7 estados)

Los 7 estados válidos, con significado y uso (fuente base: RESTRUCTURING_PLAN:21-28 y F3C_DASHBOARD:honestidad unificada):

| Estado | Significado | Ejemplo verificado |
|---|---|---|
| `REAL` | Señal/evidencia real persistente con trazabilidad | `SensorReading` temp/hum V3 (S10/S11) · `RobotTelemetry` (S50) |
| `REAL-LOCAL` | Señal real solo en vivo o en el navegador | FFT micrófono Telecom (S30) · clima externo Open-Meteo (S03) |
| `SIM` | Señal o dato simulado, etiquetado | strategies backend (S33/S34/S54) · physics_sim (S51) · cluster fabricado (S04) |
| `DISENO` | Solo documentación, 0% código ejecutable | UBTN (S20-S25) · Lab Análisis Espectral Fase 2 |
| `ROTO` | Existe pero su cadena no funciona | cliente robot `localhost:8000` (S53) · AdvancedMathLab V1 |
| `HUERFANO` | Existe y funciona pero sin conexión al ecosistema | `bridgeStatus` del `useLabStore` · DataScienceLab |
| `REF` | Referencia externa o de gobernanza (benchmark, dataset congelado, manifiesto) | Dataset V2+ 22.488 imgs (S70/S71) · M1 baseline (S72) |

Reglas de uso del canon:

1. Todo valor mostrado en UI CMSC lleva badge de estado del canon (7 estados) junto a su confidence.
2. El estado jamás mejora por navegación: `SIM` no sube a `REAL`; `REAL` degradado se marca `ROTO` (F3D reglas de honestidad).
3. La `confidence` es ortogonal al estado: un `REAL` puede tener confidence baja; un `SIM` puede tener confidence alta y se muestra como simulación.
4. El termómetro agregado del dashboard resume la distribución de estados del ecosistema sin inventar ninguno.

## 3. Terminología única: clase y dominio

Descarga la colisión C6 (READINESS:167): "clase" tenía dos significados. Canon terminológico único:

| Término | Significado | Fuente | Ejemplo |
|---|---|---|---|
| `clase_senal` | Uno de los **8 orígenes** de la señal (eje origen F3B) | F3B §3 | REAL · REMOTA · LOCAL · SIMULADA · HISTORICA · IA · GENERADA · EXPERIMENTAL |
| `dominio` | Uno de los **12 dominios** del SIGNAL_MAP (eje de naturaleza) | SIGNAL_MAP §2 | Físicas · Digitales · Lógicas · Biológicas · Acústicas · Espectrales · RF · Mecánicas · Imágenes · Matemáticas · Documentales · IA |
| `clase_ml` | Etiqueta de salida de un modelo de aprendizaje (evita toda colisión) | Dataset V2+ / M1 / M2 | 16 clases del dataset · 2 clases del modelo productivo (enferma/sana) |

Clase y dominio son **ejes ortogonales**: toda señal tiene exactamente una `clase_senal`, un `dominio` y, si aplica modelo, `clase_ml`. No existe ambigüedad en fichas, badges o filtros.

## 4. Tabla cruzada clase x dominio (formalización de F3B G-02)

| clase_senal | Dominios frecuentes | Ejemplo de señal |
|---|---|---|
| REAL | Físicas, Mecánicas, Acústicas, Digitales | S10/S11, S50, S30 |
| REAL-LOCAL | Acústicas, Físicas, Digitales, IA | S30, S03, S62 |
| REMOTA | RF, Clima | S31 (WebSDR), S03 |
| SIMULADA | Espectrales, Matemáticas, Mecánicas, RF | S33/S34/S35/S51 |
| HISTORICA | Delegado a gobernanza | M1 baseline, manifiestos |
| IA | IA, Documentales | S61, S63 |
| GENERADA | Delegado a gobernanza | dataset curado, split |
| EXPERIMENTAL | Delegado a gobernanza | experiments SSE infer log |

## 5. Vigencia y alcance

1. Este canon aplica a todo el ecosistema CMSC a partir de su emisión: UI, fichas, termómetro, signalRegistry y documentación nueva.
2. Los documentos previos que usaban "clase" en sentido de dominio o de etiqueta ML se leen conforme al §3, sin reescribirlos.
3. Ningún estado ni término adicional entra sin misión de gobernanza explícita.

## 6. Cierre

Con este apéndice quedan cerradas las condiciones C5 y C6 del READINESS y el requisito F3B G-02, habilitando badges, termómetro y fichas sin enumerado ambiguo.

---

*Apéndice de gobernanza. Complementa, no sustituye. Sin código. HEAD `18b95b1` intacto.*