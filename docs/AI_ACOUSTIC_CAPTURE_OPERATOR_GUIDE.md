# AI_ACOUSTIC_CAPTURE_OPERATOR_GUIDE — Guía operativa C0 (captura REAL-LOCAL)

| Campo | Valor |
|---|---|
| **Versión** | 1.0.0 |
| **Fecha** | 2026-10-09 |
| **Estado** | CANÓNICO · GO_CAPTURE (condicionado a la vía validada) |
| **Fuente de verdad** | `metadata/metadata.csv` (tabla maestra). `features/` y `manifest.csv` son **derivados regenerables**. Esta guía describe **procedimiento**; los **contratos** viven en el código del logger (ver "Fuentes de código"). |

> Esta guía convierte en documento canónico el flujo operativo validado para **generar muestras REAL-LOCAL de C0**.
> Vía validada: `tools/cmsc-data-logger/capture/index.html` + `tools/cmsc-data-logger/src/cli.js ingest`.
> **NO** entrenar · **NO** `ml-v1` · **NO** descargar datasets REF · **NO** tocar S81/S82. Solo captura e ingesta.

---

## 0. Preparación (una vez por jornada)

Ejecutar desde la **raíz del repo** (el logger resuelve su ruta de dataset de forma absoluta, `src/dataset.js:24-26`; el `cwd` no importa):

```powershell
node tools/cmsc-data-logger/src/cli.js doctor     # debe dar 0 problemas bloqueantes
node tools/cmsc-data-logger/src/cli.js selftest   # pipeline OK (no toca el dataset real)
```

`doctor` confirma: 9 carpetas de clase · `schema.json` **1.3.0** (42 columnas) · contrato de clip · `window_schema` aprobado (**44 dims**).

---

## 1. Cómo abrir `capture/index.html`

El micrófono exige **contexto seguro** (`http://localhost`), nunca `file://`. Servir la carpeta `capture/`:

```powershell
python -m http.server 5500 --directory tools/cmsc-data-logger/capture
```

Abrir en el navegador: **`http://localhost:5500/`** — dejar la terminal abierta durante toda la captura.

---

## 2. Cómo capturar cada clase

Cada toma dura **3,0 s**. Usar `class_id` en minúsculas (¡`ave`, no "aves"!). Protocolos:

| `class_id` | Cuándo / cómo | Qué anotar en `notes` |
|---|---|---|
| `lluvia` | **Oportunista**: solo con lluvia real; 2–3 intensidades si se puede | intensidad, superficie (techo/hoja), `weather_note` |
| `motor` | Maquinaria en marcha; **≥3 regímenes/máquinas** (ralentí, carga) | motor, rpm aprox., `hour_local` |
| `voz` | **Consentimiento previo**; guion fijo corto; **sin habla identificable retenida** | "consentimiento registrado", idioma, distancia al mic |
| `ave` | **Amanecer 05:00–09:00**; vocalización limpia | especie si se identifica, hora |
| `insectos` | **Noche 18:00–23:00** | ubicación/geo; avisar si hay ave de fondo |

Pasos en la página, por cada clase:
1. **Pedir micrófono** → verificar "mic: ACTIVO".
2. Rellenar identidad (§3), elegir **clase** y **entorno**.
3. **● Grabar** → se detiene solo a los 3,0 s.
4. Repetir para cada toma (sube `take_index`).
5. Al cerrar el bloque: **Guardar WAV + JSON** (descarga **todos** los WAV de la cola + 1 manifest).
6. Al cambiar de clase/lugar, **cambiar `session_id`** (una sesión = una clase + un lugar).

---

## 3. Qué campos llenar

**Obligatorios** (sin ellos la ingesta rechaza):
- `class_id` (desplegable de 9 clases)
- `session_id` → ej. `c0s1_lluvia_20261009_a`
- `place_id` → ej. `finca_patio` · `via_vereda_km2` · `site_c` (reservar `site_c` como holdout)
- `operator_id` · `device_id` → ej. `mic_s30_laptop01`

**Recomendados** (se registran en metadata): `environment` (`campo` | `invernadero` | `lab` | `interior`) · `hour_local` (0–23) · `weather_note` · `notes` · `take_index` (automático).

### Convenciones de identificación
- `session_id`: `c0s<N>_<clase>_<YYYYMMDD>_<letra>` (bloque continuo en un lugar) → `c0s1_ave_20261010_a`
- `place_id`: identificador estable del sitio; **uno reservado como holdout** (`site_c`).
- `device_id` y `operator_id`: fijos por jornada.
- Regla de oro: **una sesión = una clase + un lugar**.

---

## 4. Qué hace el CLI `ingest`

```powershell
node tools/cmsc-data-logger/src/cli.js ingest <wav...> --class <id> --session <s> --place <p> --operator <o> --device <mic> --environment campo --resample cubic
```

Por cada WAV:
1. **Decodifica** en memoria (si no es WAV legible → `rejected`, **no escribe nada**).
2. **Remuestrea** a 44.100 Hz y **lo declara** (`capture_source_rate`, `resample_method`) — los navegadores suelen entregar 48 kHz.
3. **Ajusta a 3,0 s** (recorta/rellena; relleno con ceros → cuarentena).
4. **Valida AC-1..AC-10** (formato, duración, saturación, `sha256` duplicado, cuasi-duplicado por envolvente, etc.).
5. **Extrae 44 features** (22 `mean_*` + 22 `std_*`, `frame_count=63`) con `acoustic.feat.window.v2`.
6. **Escribe el WAV** en `raw/<clase>/<sample_id>_<sha256>.wav`.
7. **Añade 1 fila atómica** a `metadata/metadata.csv`.
8. **Añade la fila** de features a `features/acoustic_features_v2.csv` + actualiza la cache de envelopes (AC-9).
9. **Reconstruye** `CHECKSUMS.sha256`.

> `--dry-run` valida y calcula **sin escribir nada**.

---

## 5. Cómo verificar `metadata.csv` y `acoustic_features_v2.csv`

Rutas reales (fuera de git, `.gitignore:68`):
- `data/datasets/sigct_rural_acoustic/v1/metadata/metadata.csv`
- `data/datasets/sigct_rural_acoustic/v1/features/acoustic_features_v2.csv`

```powershell
(Get-Content data\datasets\sigct_rural_acoustic\v1\metadata\metadata.csv).Count               # cabecera + N
Get-Content data\datasets\sigct_rural_acoustic\v1\metadata\metadata.csv -Tail 11             # sample_id / class_id / ingest_status
Get-Content data\datasets\sigct_rural_acoustic\v1\features\acoustic_features_v2.csv -Tail 11 # frame_count=63 y 44 dims
```

Cada nueva muestra debe aparecer **una vez** en `metadata.csv` y **una vez** en `acoustic_features_v2.csv`, con el **mismo `sample_id`**.

---

## 6. Cómo verificar `accepted` / `rejected`

- Columna **`ingest_status`** en `metadata.csv`: `accepted` | `quarantine` | `rejected`.
  > Un archivo que **ni decodifica no crea fila**: ese rechazo solo aparece en la salida del CLI.
- La salida del CLI imprime por archivo `ACCEPTED | QUARANTINE | REJECTED` y el detalle de cada AC fallido, más un resumen `N accepted · N quarantine · N rejected`.
- Conteo directo (ajustar al orden real de columnas):

```powershell
Select-String -Path data\datasets\sigct_rural_acoustic\v1\metadata\metadata.csv -Pattern ',accepted,' | Measure-Object | Select-Object Count
```

Interpretación: `quarantine` = guardado pero **no cuenta** para el corpus (ej. relleno con ceros, frames mal); revisar `notes` de la fila.

---

## 7. Cómo medir progreso por clase

```powershell
node tools/cmsc-data-logger/src/cli.js status      # barra n/150 por clase viva (objetivo G-DS-2)
node tools/cmsc-data-logger/src/cli.js validate    # G-DS-1..6 (PASS/FAIL/PENDING)
node tools/cmsc-data-logger/src/cli.js checksums   # reconstruye el índice si hiciera falta
```

`status` muestra por clase viva el conteo frente al objetivo **G-DS-2 = 150/clase** y el estado consolidado + gates.

---

## 8. Ejemplo de sesión completa (10 muestras de lluvia)

```powershell
# 1) Preparación
node tools/cmsc-data-logger/src/cli.js doctor
python -m http.server 5500 --directory tools/cmsc-data-logger/capture   # terminal abierta

# 2) En http://localhost:5500/ : identidad + clase=lluvia + 10 tomas + "Guardar WAV + JSON"
#    → Descargas: lluvia_c0s1_lluvia_20261009_a_01..10.wav

# 3) Ingesta en bloque
node tools/cmsc-data-logger/src/cli.js ingest "$env:USERPROFILE\Downloads\lluvia_c0s1_lluvia_20261009_a_*.wav" --class lluvia --session c0s1_lluvia_20261009_a --place finca_patio --operator bernardo --device mic_s30_laptop01 --environment campo

# 4) Verificación
node tools/cmsc-data-logger/src/cli.js status
node tools/cmsc-data-logger/src/cli.js validate
Get-Content data\datasets\sigct_rural_acoustic\v1\metadata\metadata.csv -Tail 11

# 5) Doble revisión (100% para cerrar G-DS-6), por cada sample_id aceptado
node tools/cmsc-data-logger/src/cli.js review --sample <sample_id> --annotator <revisor> --agreement double_reviewed_agree
```

---

## 9. Checklist de calidad

- [ ] **Un evento dominante por clip.** Si es ambiguo, no forzarlo a clase viva: descartarlo o reservarlo para `ruido_desconocido`.
- [ ] Sin saturación (pico > 0.98) ni silencios muertos (pico < 0.001).
- [ ] No mezclar clases dentro de un mismo `session_id`.
- [ ] `capture_source_rate` + `resample_method` declarados (lo hace el CLI automáticamente).
- [ ] `class_id` correcto en minúsculas y coherente con la carpeta `raw/<dir_name>/`.
- [ ] `session_id`/`place_id` correctos y ≥3 `place_id` distintos en el conjunto (uno reservado como `site_c`).
- [ ] Cada muestra aceptada aparece en `metadata.csv` **y** en `acoustic_features_v2.csv` con el mismo `sample_id`.
- [ ] `frame_count = 63` y 44 dims (22 `mean_*` + 22 `std_*`).
- [ ] Doble revisión registrada (`review ... --agreement double_reviewed_agree`).
- [ ] No entrenar · no `ml-v1` · no descargar REF · no tocar S81/S82.

---

## 10. Go / No-Go

- **GO_CAPTURE** — por la vía validada: `capture/index.html` + CLI `ingest`.
- **NO-GO** — usar el panel del dashboard (`AcousticLoggerPanel`) como herramienta de ingesta: solo descarga el paquete WAV+JSON y **no escribe en el dataset**; su respuesta del CLI no está cableada.

---

## Fuentes de código (contratos; no se describen aquí para no duplicar la verdad)

- CLI y contrato de clip: `tools/cmsc-data-logger/src/cli.js`
- Ingesta (AC, features, escritura atómica): `tools/cmsc-data-logger/src/ingest.js`
- Rutas del dataset y raíz por defecto: `tools/cmsc-data-logger/src/dataset.js`
- Constantes (esquemas de features/ventana, clases): `tools/cmsc-data-logger/src/constants.js`
- Página de captura validada: `tools/cmsc-data-logger/capture/index.html`
- Contrato de captura (S30 → Logger): `tools/cmsc-data-logger/capture/captureContract.js`
- Gobernanza del dataset y gates G-DS: `docs/AI_ACOUSTIC_DATASET_GOVERNANCE_V1.md`
