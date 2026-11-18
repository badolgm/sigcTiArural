# GDS2_CAPTURE_PLAN_V1

> **Metadatos de migración — D-004.6**
> - Autor: Bernardo Adolfo Gómez Montoya
> - Timestamp: 2026-11-17T22:45:56-05:00
> - Origen: GDS2_CAPTURE_PLAN_V1.md
> - Destino: docs/GDS2_CAPTURE_PLAN_V1.md

## 1. Estrategia de captura por clase

| Clase | Fuente de captura | Método de captura con S30 | Notas |
|-------|------------------|---------------------------|-------|
| silencio | Interior de laboratorio sin fuentes sonoras activas | Mic S30 en recinto cerrado, equipos apagados | Captar 3,0 s de silencio ambiente real |
| viento | Exterior con corriente de aire natural | Mic S30 en exterior, sin protección parabólica directa | Evitar saturación por ráfagas fuertes |
| lluvia | Exterior durante precipitación natural | Mic S30 expuesto a lluvia, protegido de salpicaduras directas | Captar solo sonido de caída de gotas |
| agua | Arroyo, fuente o grifo con flujo continuo | Mic S30 cerca de superficie de agua en movimiento | Evitar sumergir el micrófono |
| insectos | Zona vegetada con actividad de insectos (crepúsculo) | Mic S30 en exterior cerca de vegetación | Captar zumbidos y stridulación natural |
| ave | Zona con presencia de aves (mañana temprano) | Mic S30 en exterior, dirección opuesta a tráfico | Filtrar post-captura si hay voz humana de fondo |
| voz | Persona hablando a distancia controlada | Mic S30 en interior, hablante a 1-3 m | Idioma español, conversación natural |
| motor | Motor de combustión o eléctrico en funcionamiento | Mic S30 cerca de máquina/vehículo en marcha | Evitar saturación por proximidad excesiva |

**Nota:** `ruido_desconocido` es bucket OOD, no se captura a demanda por diseño.

## 2. Número recomendado de sesiones

**16 sesiones de captura.**

Rationale: La experiencia del piloto de 100 muestras utilizó 16 sesiones para 8 clases vivas. Para alcanzar 8×150 = 1.200 clips aceptados se mantiene la misma granularidad de sesión, distribuyendo la carga en días distintos para variar condiciones ambientales (luz, humedad, temperatura, tráfico de fondo).

## 3. Número recomendado de clips por sesión

**75 clips por sesión** (aproximadamente 9-10 clips por clase viva por sesión).

Cálculo: 1.200 clips aceptados ÷ 16 sesiones = 75 clips/sesión. Con 8 clases vivas, esto implica ~9-12 clips por clase por sesión, permitiendo repetición y descarte en campo sin comprometer el objetivo diario.

## 4. Estrategia usando S30 + CMSC Logger

1. **S30 (micrófono local)** captura audio real en WAV PCM 16-bit, mono, 44.100 Hz, segmento de 3,0 s.
2. **CMSC Logger** (`src/cli.js ingest`) ingiere cada toma con validación AC-1..AC-10 y generación de features (44 dims, `acoustic.feat.v2`).
3. Cada toma se registra con `session_id`, `place_id` y `class_id` según el binding de `labels.csv`.
4. El split se realiza por `(session_id, place_id)` para evitar fuga de datos entre particiones.
5. Se requieren al menos 3 `place_id` diferentes a lo largo de las 16 sesiones.
6. Cada clip aceptado pasa revisión doble (100 %) antes de contabilizarse hacia las 150 por clase.
7. Los clips rechazados o en cuarentena no se borran; se mantienen con su estado de ingesta correspondiente.

## 5. Cronograma estimado para llegar a 150 clips por clase

| Fase | Sesiones | Clips aceptados acumulados | Clips por clase (meta) | Duración estimada |
|------|----------|---------------------------|------------------------|-------------------|
| Piloto (ya ejecutado) | 16 | 100 | 12-13 | Completado |
| Ampliación a 80 por clase | 32 | 640 | 80 | ~4 semanas (2 sesiones/semana) |
| Ampliación a 150 por clase | 48 | 1.200 | 150 | ~4 semanas adicionales (2 sesiones/semana) |
| **Total** | **48** | **1.200** | **150** | **~8 semanas** |

Alternativa acelerada: 4 sesiones/semana → ~4 semanas totales.

## 6. Riesgos de captura

- **Condiciones ambientales no controladas:** viento excesivo, tráfico de fondo, voz humana inesperada en exteriores puede invalidar tomas de clases específicas (lluvia, insectos, ave).
- **Saturación del micrófono S30:** fuentes sonoras intensas (motor cercano, lluvia fuerte) pueden producir clipping y rechazo por AC-7/AC-8.
- **Disponibilidad de operador:** 16 sesiones requieren presencia humana para cambiar lugar y supervisar cada captura.
- **Clase silencio:** dificil de capturar sin ruido de fondo residual en interiores urbanos.
- **Clase ave:** baja predictibilidad de presencia vocal en la ventana de captura de 3,0 s.
- **Remuestreo no declarado:** si el navegador entrega 48 kHz, debe declararse `capture_source_rate` y `resample_method` antes de contar el clip como válido.

## 7. Plan mínimo viable: 1 → 80 → 150 clips por clase

### Paso A: 1 → 80 clips por clase (intermedio)
- Objetivo: 8 clases × 80 = 640 clips aceptados.
- Sesiones necesarias: 32 (75 clips/sesión).
- Acción: repetir estrategia de captura en 2 sesiones adicionales por clase, usando los mismos `place_id` ya validados más uno nuevo.
- Criterio de parada: cada clase viva alcanza 80 clips con `qc_status=pass`.

### Paso B: 80 → 150 clips por clase (final)
- Objetivo: 8 clases × 150 = 1.200 clips aceptados (cumple G-DS-2).
- Sesiones necesarias: 16 adicionales (75 clips/sesión).
- Acción: completar hasta 150 por clase con sesiones distribuidas en ≥3 `place_id` totales.
- Criterio de parada: cada clase viva alcanza 150 clips con `qc_status=pass` y balance max/min ≤ 1,5.

**Resultado esperado:** dataset acústico SIGCT-Rural v1 pasa de estado `CAPTADO_INICIAL` a `CAPTADO_INICIAL` con 1.200 muestras aceptadas, listo para validar G-DS-2.
