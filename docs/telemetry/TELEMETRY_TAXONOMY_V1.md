# TAXONOMÍA TELEMÉTRICA OFICIAL V1 — SIGCT-RURAL

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-20T21:44:20-05:00
> - Origen: misión `SIGCTIARURAL_TELEMETRY_GOVERNANCE_V1` (documento nuevo)
> - Destino: `docs/telemetry/TELEMETRY_TAXONOMY_V1.md` (NUEVO — visible para git, sin commit)
> - Nota: taxonomía declarativa de 24 métricas. Copia fiel del Masterplan §7.2; no crea streams, no calibra, no captura.

**Misión:** `SIGCTIARURAL_TELEMETRY_GOVERNANCE_V1`
**Naturaleza:** fuente de verdad del vocabulario telemétrico. Contrato **`DISENO`**: las 24 métricas existen como vocabulario, con **0 lecturas**.
**Fecha:** 2026-11-20 (America/Bogota, UTC-05:00) · **HEAD:** `ff5ae10`
**Autoridad:** `docs/telemetry/TELEMETRY_GOVERNANCE_V1.md` · **fuente literal:** `docs/governance/SIGCTIARURAL_MULTIMODAL_MASTERPLAN_V1.md` §7.2.
**No modifica:** el Masterplan, la plataforma de observaciones, `docs/acoustic/*`, `docs/vision/*` ni ningún dataset.

> **Regla suprema:** NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
> **Invariante:** **`NO_DATA` ≠ 0 · `NO_DATA` ≠ NULL** (TG-2).

---

# 0. Estado honesto

| Hecho | Valor |
|---|---|
| Métricas canónicas heredadas del Masterplan §7.2 | **24 — copiadas sin alterar unidad ni rango** |
| Familias exigidas por la misión | **6 — aditivas**, sin reemplazar los 8 dominios originales |
| Lecturas capturadas | **0** |
| Streams creados | **0** |
| Sensores calibrados | **0** |
| `posicion` sin rango de plausibilidad | **Declarado `—` en el Masterplan**; se goberna en §5.4, no se inventa rango |

---

# 1. Contrato de `metric_id`

| Propiedad | Regla |
|---|---|
| Tipo | Token `snake_case`, minúsculas, sin acentos ni espacios |
| Naturaleza | **Vocabulario**, no ID de ocurrencia (no lleva fecha ni secuencia) |
| Dominio | Enum cerrado de `telemetry_v1_taxonomy` (las 24 de §3) |
| Inmutabilidad | Un `metric_id` nunca se renombra; el cambio se gestiona con `alias_of` (TEL-9, MET-1) |
| Versionado | Toda lectura declara `taxonomy_version=telemetry_v1_taxonomy` |
| Extensiones | Aditivas por bump; ninguna métrica anterior se quita en < 2.0.0 |
| Estado | Toda métrica nace `DISENO` con 0 lecturas; `REAL` exige evidencia y gates |

---

# 2. Ejes: dominio original y familia aditiva

> **Decisión de no-pérdida.** La misión pide 6 familias; el Masterplan define 8 `telemetry_domain_id`. Se conservan **los 8** como eje original y se añade **`metric_family`** (6 valores) como eje de agregación. Ninguno sustituye al otro.

## 2.1 Eje A — `telemetry_domain_id` (Masterplan §7.1, intacto)

`AMBIENTAL` · `SUELO` · `AGUA` · `INFRAESTRUCTURA` · `MAQUINARIA` · `BIOLOGICO` · `DISPOSITIVO` · `EXTERNO`

## 2.2 Eje B — `metric_family` (nuevo, aditivo)

| Familia | Métricas | Total |
|---|---|---:|
| **AMBIENTE** | `temperatura_ambiente` · `humedad_relativa` · `luminosidad` · `lluvia_mm` · `presion_atmosferica` · `viento_velocidad` · `radiacion_uv` · `co2` | 8 |
| **SUELO** | `ph` · `conductividad` · `humedad_suelo` · `temperatura_suelo` | 4 |
| **AGUA** | `nivel_agua` · `temperatura_agua` · `oxigeno_disuelto` · `turbidez` · `caudal` | 5 |
| **ANIMAL** | `peso_colmena` · `actividad_vuelo` | 2 |
| **INFRAESTRUCTURA** | `movimiento` · `posicion` | 2 |
| **ENERGÍA** | `corriente` · `voltaje` · `bateria` | 3 |
| | **Total** | **24** |

## 2.3 Ejes C y D (heredados)

| Eje | Campo | Valores |
|---|---|---|
| C · Fuente | `source_tier` | `T0` manual · `T1` dispositivo · `T2` externa (`REF`) · `T3` especializada |
| D · Calidad | `quality_flag` | `ok` · `suspect` · **`NO_DATA`** (estado gobernado) |

## 2.4 Reglas de convivencia de ejes

| ID | Regla |
|---|---|
| EJE-1 | `metric_family` es **derivable** de `metric_id` por tabla; nunca se declara a mano contradiciéndola. |
| EJE-2 | `telemetry_domain_id` y `metric_family` pueden diferir legítimamente; ambos se conservan. |
| EJE-3 | Las métricas con doble dominio (`ph`, `conductividad`, `caudal`) guardan `domain_secondary[]`; el primero sigue siendo el del Masterplan. |
| EJE-4 | `BIOLOGICO` se agrega en `ANIMAL`; `MAQUINARIA`+`DISPOSITIVO` se reparten entre `ENERGÍA` e `INFRAESTRUCTURA` sin pérdida. |
| EJE-5 | Ninguna familia es un `class_id`, un `scene_id` ni un `event_type`. |

---

# 3. Las 24 métricas base (tabla canónica)

> **Unidad y rango copiados literalmente del Masterplan §7.2.** `—` significa que el Masterplan no declaró rango; no se inventa.

| # | `metric_id` | Unidad SI | Rango de plausibilidad | Tier típico | `telemetry_domain_id` | `metric_family` |
|---:|---|---|---|---|---|---|
| 1 | `temperatura_ambiente` | °C | −40 .. 80 | T0/T1/T2/T3 | AMBIENTAL | AMBIENTE |
| 2 | `humedad_relativa` | % | 0 .. 100 | T1/T2/T3 | AMBIENTAL | AMBIENTE |
| 3 | `luminosidad` | lux | 0 .. 200000 | T1/T3 | AMBIENTAL | AMBIENTE |
| 4 | `lluvia_mm` | mm/h | 0 .. 500 | T2/T3 | AMBIENTAL | AMBIENTE |
| 5 | `presion_atmosferica` | hPa | 800 .. 1100 | T1/T2/T3 | AMBIENTAL | AMBIENTE |
| 6 | `viento_velocidad` | m/s | 0 .. 100 | T2/T3 | AMBIENTAL | AMBIENTE |
| 7 | `radiacion_uv` | índice | 0 .. 15 | T3 | AMBIENTAL | AMBIENTE |
| 8 | `co2` | ppm | 300 .. 5000 | T3 | AMBIENTAL | AMBIENTE |
| 9 | `ph` | pH | 0 .. 14 | T0 manual / T3 | SUELO · AGUA | SUELO |
| 10 | `conductividad` | µS/cm | 0 .. 100000 | T0 manual / T3 | SUELO · AGUA | SUELO |
| 11 | `humedad_suelo` | % | 0 .. 100 | T3 | SUELO | SUELO |
| 12 | `temperatura_suelo` | °C | −10 .. 60 | T3 | SUELO | SUELO |
| 13 | `nivel_agua` | cm | 0 .. 1000 | T0 manual / T3 | AGUA | AGUA |
| 14 | `temperatura_agua` | °C | 0 .. 50 | T0 manual / T3 | AGUA | AGUA |
| 15 | `oxigeno_disuelto` | mg/L | 0 .. 20 | T3 | AGUA | AGUA |
| 16 | `turbidez` | NTU | 0 .. 1000 | T3 | AGUA | AGUA |
| 17 | `caudal` | L/s | 0 .. 1000 | T3 | AGUA · INFRAESTRUCTURA | AGUA |
| 18 | `peso_colmena` | kg | 0 .. 200 | T3 (aditivo) | BIOLOGICO | ANIMAL |
| 19 | `actividad_vuelo` | conteo/ventana | 0 .. 100000 | T0 visual / T3 | BIOLOGICO | ANIMAL |
| 20 | `corriente` | A | 0 .. 100 | T3 | MAQUINARIA | ENERGÍA |
| 21 | `voltaje` | V | 0 .. 500 | T3 | MAQUINARIA | ENERGÍA |
| 22 | `bateria` | % | 0 .. 100 | T1/T3 | DISPOSITIVO | ENERGÍA |
| 23 | `movimiento` | m/s² | −20 .. 20 | T1 | DISPOSITIVO | INFRAESTRUCTURA |
| 24 | `posicion` | lat/lon | — | T1 | DISPOSITIVO | INFRAESTRUCTURA |

## 3.1 Verificación de integridad de la copia

| Comprobación | Resultado |
|---|---|
| Métricas | **24 / 24** |
| Unidades idénticas al Masterplan §7.2 | **24 / 24** |
| Rangos idénticos al Masterplan §7.2 | **24 / 24** (incluido `posicion = —`) |
| Familias de la misión | **6 / 6** |
| Suma por familia | 8 + 4 + 5 + 2 + 2 + 3 = **24** |
| Métricas con dominio doble | 3 (`ph`, `conductividad`, `caudal`) — conservadas en `domain_secondary[]` |

---

# 4. Validación por rango y unidad

## 4.1 Clasificación de validación

| `quality_flag` | Condición | Acción |
|---|---|---|
| `ok` | Dentro de rango, unidad SI declarada, calibración vigente | Aceptar |
| `suspect` | Fuera de rango · calibración vencida · precisión excedida · sensor derivado | Conservar + nota; **nunca descartar** (TEL-2) |
| `NO_DATA` | No se midió | Estado gobernado con `no_data_reason` (§4.3 del padre) |
| `BLOCKED` | `null` · `0` disfrazado de ausencia · unidad desconocida · `prediction_id` | Rechazar con ID culpable |

## 4.2 Ejemplos de validación

| Métrica | Valor | `quality_flag` | Razón |
|---|---|---|---|
| `humedad_relativa` | 68 % | `ok` | Dentro de 0..100 |
| `humedad_relativa` | 142 % | `suspect` | Fuera de rango; no se descarta |
| `ph` | 7,1 | `ok` | Dentro de 0..14 |
| `temperatura_ambiente` | −45 °C | `suspect` | Fuera de −40..80 |
| `lluvia_mm` | 0 mm/h | `ok` | **Cero medido**, no `NO_DATA` |
| `lluvia_mm` | `NO_DATA` + `not_measured` | `NO_DATA` | No se leyó el pluviómetro |
| `voltaje` | 230 V con `calibration_id` vencido | `suspect` | CAL-2 |
| `co2` | 6000 ppm | `suspect` | Fuera de 300..5000 |

## 4.3 Casos especiales

| Métrica | Regla |
|---|---|
| `ph` · `conductividad` | Dominio dual SUELO/AGUA: la familia reportada la fija `surface_type`, **no se duplica la lectura**. |
| `caudal` | Dominio dual AGUA/INFRAESTRUCTURA: conservar `domain_secondary=[INFRAESTRUCTURA]`. |
| `actividad_vuelo` | Unidad `conteo/ventana`: exige `window_s` declarado; sin ventana ⇒ `BLOCKED`. |
| `posicion` | Sin rango en el Masterplan: se valida por formato lat/lon y se **redacta** en reportes públicos (§5.4). |
| `lluvia_mm` · `co2` | T2/T3: si vienen de fuente externa, `state=REF`; jamás verdad de campo (TEL-7). |
| `peso_colmena` · `oxigeno_disuelto` · `turbidez` | T3 aditivo: en T0 se declaran `NO_DATA` con `instrument_unavailable`, nunca `0`. |

---

# 5. Unidades SI y precisiones

## 5.1 Regla general (TEL-1, TEL-11)

| ID | Regla |
|---|---|
| UNI-1 | Toda lectura emite `unit_si` canónico según §3. |
| UNI-2 | Si el instrumento entrega otra unidad, se guarda `value_original` + `unit_original` + `conversion_factor`; `value` queda en SI. |
| UNI-3 | La precisión declarada limita los decimales; no se inventa precisión aguas arriba. |
| UNI-4 | `índice` (`radiacion_uv`) y `pH` son escalas dimensionadas: se reportan como índice, sin unidad física inventada. |
| UNI-5 | `µS/cm` y `m/s²` se conservan con su símbolo exacto; no se transliteran. |

## 5.2 Conversión gobernada

```
  value_original = 72
  unit_original  = °F
  conversion_factor = (v - 32) × 5/9
  value       = 22.222...   → redondeado según precision_declarada
  unit_si     = °C
  value_original y unit_original SE CONSERVAN (NADA DESAPARECE)
```

## 5.3 Precisión

| Familia | Precisión declarada típica | Nota |
|---|---|---|
| AMBIENTE | 1 decimal | Según instrumento; T0 manual declara la del medidor |
| SUELO | 0,01 para `ph`; 1 decimal para % y °C | — |
| AGUA | 1 decimal; `turbidez` entero | — |
| ANIMAL | entero / 0,1 kg | `actividad_vuelo` es conteo |
| INFRAESTRUCTURA | 6 decimales para lat/lon | Redacción en reportes |
| ENERGÍA | 1 decimal | — |

> Las precisiones son **declarativas** y se ajustan al instrumento real; no son un estándar medido en esta misión.

## 5.4 Privacidad de `posicion`

| ID | Regla |
|---|---|
| POS-1 | `posicion` es lat/lon de la **observación**, no un `scene_id`. |
| POS-2 | En paquetes para ACP/KH se reporta **redactada** a granularidad de `place_id`; las coordenadas exactas quedan en `obs_.../telemetry/`. |
| POS-3 | Sin consentimiento o en entornos urbanos con personas, se redacta y el veredicto es `PARTIAL`. |
| POS-4 | Nunca se infiere ubicación por EXIF ni por red: solo la declarada. |

---

# 6. Extensiones y alias

| ID | Regla |
|---|---|
| EXT-1 | Una métrica nueva entra por **bump aditivo** de `telemetry_v1_taxonomy` → siguiente versión (TEL-9). |
| EXT-2 | Ninguna métrica se renombra: se declara `alias_of` y el crosswalk se publica. |
| EXT-3 | Un alias sirve para **leer** versiones anteriores; no se asigna a lecturas nuevas. |
| EXT-4 | Toda extensión sincroniza `taxonomy_version` en la lectura y en la tabla en el **mismo cambio**. |
| EXT-5 | `lectura_desconocida` **no es una métrica** y por eso nunca entra en esta tabla (ver `TELEMETRY_OOD_POLICY_V1.md`). |

---

# 7. Fixtures de rechazo

| Fixture | Resultado esperado |
|---|---|
| `metric_id=humedad_del_suelo` (no canónico) | `BLOCKED` — usar `humedad_suelo` |
| `unit_si=Fahrenheit` | `BLOCKED` (UNI-1) |
| `value=null` | `BLOCKED` (ND-2 del padre) |
| `quality_flag=NO_DATA` con `value=0` | `BLOCKED` (TG-2) |
| `humedad_relativa=142 %` sin `suspect` | `REJECTED` → `suspect` (TEL-2) |
| `actividad_vuelo` sin `window_s` | `BLOCKED` (§4.3) |
| `ph` duplicado en dos familias | `BLOCKED` (EJE-1 / §4.3) |
| `metric_family=CLIMA` (fuera de 6) | `BLOCKED` (§2.2) |
| `posicion` sin redacción en paquete ACP | `PARTIAL` (POS-2/3) |

---

# 8. Gates (definidos, NO ejecutados)

| Gate | Condición | Estado |
|---|---|---|
| **G-TT-1** | 24 métricas idénticas al Masterplan §7.2 | `DISENO` |
| **G-TT-2** | 6 familias con suma 24 y 8 dominios conservados | `DISENO` |
| **G-TT-3** | Unidades y rangos verificados 24/24 | `DISENO` |
| **G-TT-4** | `NO_DATA` ≠ 0 ≠ NULL en fixtures | `DISENO` |
| **G-TT-5** | Doble dominio sin duplicación de lectura | `DISENO` |
| **G-TT-6** | `posicion` redactada en reportes | `DISENO` |

---

# 9. Cierre

La taxonomía fija 24 métricas **idénticas** a las del Masterplan, 6 familias aditivas exigidas por la misión y validación por unidad/rango con `NO_DATA` como estado gobernado. No se creó ninguna lectura, stream ni sensor.

**Estado honesto:** **`DISENO`**, 0 lecturas, 0 streams, 0 calibraciones. Sin modificar el Masterplan, la plataforma ni las gobernanzas de audio y visión. Sin commit, push, merge ni tag.

---

*Fin de la taxonomía telemétrica. Complementa —nunca sustituye— la gobernanza telemétrica V1 y el Masterplan V1 §7.*
