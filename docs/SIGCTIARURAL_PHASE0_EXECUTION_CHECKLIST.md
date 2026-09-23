# SIGCTiArural — PHASE 0 EXECUTION CHECKLIST (Preparación de Ejecución Real)

**Documento:** SIGCTIARURAL_PHASE0_EXECUTION_CHECKLIST
**Fecha:** 2026-09-22 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `86d545e`
**Tipo:** Checklist operativo + procedimiento ASUS + comandos exactos + estrategia de recuperación + puente a Fase 1.
**Modo:** EJECUCIÓN CONTROLADA. Permitido: documentación, scripts auxiliares, estructura, checklist. Prohibido: descarga, entrenamiento, benchmark, commits.
**Regla suprema:** La documentación canónica es la fuente de verdad. Honestidad de estado. NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
**Base de lectura:** READINESS_REPORT · EXECUTION_GUIDE · READYCHECK (verificados).

---

## 1. Estado confirmado (punto de partida)

| Ítem | Estado |
|---|---|
| Dataset V2 diseñado + gobernado | ✅ (5 manifests, taxonomía, label schema, split) |
| Fase 0 definida y ready-checkeada | ✅ |
| Bloqueante Kaggle CLI | ❌ ausente → se instala en GATE 2 |
| Bloqueante kaggle.json | ❌ ausente → se crea manualmente (GATE 2) |
| Bloqueante espacio ASUS | ⚠️ sin confirmar → GATE 1 |
| Entorno dev verificado (Python 3.11.9 / pip 24.0 / git 2.55.0 / bsdtar 3.8.8) | ✅ |

**Identidad objetivo:** `agriculture_images_tomato-potato-corn` v1 · 21.160 imágenes · 16 clases · 3 especies · solo `raw/color` (sin grayscale/segmented/generated; excluye `Tomato___Spider_mites`).

---

## 2. Procedimiento ASUS — paso a paso operacional

Fases del procedimiento y su orden crítico:

| Fase | Nombre | Gates | Descargable |
|---|---|---|---|
| A | Preparación de entorno | GATE 1–2 | No |
| B | Estructura de datos | GATE 3–6 | No |
| C | Descarga y extracción | GATE 7 | **Sí (Vía A / Vía B)** |
| D | Consolidación y congelado | GATE 8–10 | No |
| E | Verificación final | GATE 11–12 | No |
| F | Transición a Fase 1 | — | No |

Regla de avance: **no se pasa a una fase hasta que su gate esté en verde.** Si un gate falla → rama de recuperación §5.

---

## 3. Checklist final (paso a paso operativo)

### GATE 1 · Almacenamiento (ASUS)
| # | Acción | Comando exacto | Criterio ✅ |
|---|---|---|---|
| 1.1 | Listar discos | `Get-PSDrive` | Aparece C: (o D:) con datos |
| 1.2 | Espacio libre real | `(Get-PSDrive C).Free / 1GB` | ≥ 20 GB (mínimo) / ≥ 30 GB (ideal) |
| 1.3 | Decidir disco | manual | Elegido disco con mayor LibreGB; anotado |
| 1.4 | Espacio utilizable | `[math]::Round(((Get-PSDrive C).Free * 0.85) / 1GB, 1)` | ≥ 17 GB tras reserva 15% |

### GATE 2 · Herramientas y credencial (ASUS)
| # | Acción | Comando exacto | Criterio ✅ |
|---|---|---|---|
| 2.1 | Python | `python --version` | 3.9+ presente |
| 2.2 | pip | `pip --version` | 20+ presente |
| 2.3 | git | `git --version` | presente |
| 2.4 | descompresor | `tar --version | Select-Object -First 1` | responde (bsdtar/GNU) |
| 2.5 | **instalar kaggle** | `pip install --user kaggle` | "Successfully installed kaggle" |
| 2.6 | verificar kaggle | `kaggle --version` | responde (ej. `1.6.x`) |
| 2.7 | credencial Kaggle | manual (navegador) — crear en `kaggle.com/settings/API → Create New Token` y colocar el `kaggle.json` en `C:\Users\<usuarioASUS>\.kaggle\` | `Test-Path "$env:USERPROFILE\.kaggle\kaggle.json"` = True |
| 2.8 | validar autenticación | `kaggle datasets list` | lista datasets (reto token activo) |

### GATE 3 · Repositorio (ASUS)
| # | Acción | Comando exacto | Criterio ✅ |
|---|---|---|---|
| 3.1 | rama | `git -C <repo> branch --show-current` | `feature/ubtn-biological-telemetry` |
| 3.2 | HEAD | `git -C <repo> rev-parse --short HEAD` | `86d545e` |
| 3.3 | estado | `git -C <repo> status --short` | limpio salvo elementos conocidos |
| 3.4 | data/ ajeno a git | `git -C <repo> status --short data` | sin salida (data/ ignorado, `.gitignore:62`) |

### GATE 4 · Red (ASUS)
| # | Acción | Comando exacto | Criterio ✅ |
|---|---|---|---|
| 4.1 | Kaggle reachable | `Test-NetConnection kaggle.com -Port 443` | TcpTestSucceeded True |
| 4.2 | GitHub reachable | `Test-NetConnection github.com -Port 443` | TcpTestSucceeded True (Vía B) |

### GATE 5 · Estructura (ASUS) — preparación de carpeta
| # | Acción | Comando exacto | Criterio ✅ |
|---|---|---|---|
| 5.1 | base | `New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\Development\sigcTiArural\data\datasets\agriculture_images_tomato-potato-corn\v1"` | directorio creado |
| 5.2 | subárbol | `New-Item -ItemType Directory -Force -Path <v1>\RAW,<v1>\curated\train,<v1>\curated\validation,<v1>\curated\test,<v1>\split_lists,<v1>\labels,<v1>\holdout,<v1>\manifests` | 8 rutas creadas |
| 5.3 | temp descarga | `New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\Development\sigcTiArural\data\_tmp_phase0"` | directorio temporal creado |

### GATE 6 · Manifiestos locales (ASUS)
| # | Acción | Comando exacto | Criterio ✅ |
|---|---|---|---|
| 6.1 | copiar | `Copy-Item "<repo>\docs\ai\manifests\*.yaml" <v1>\manifests\ -Force` | 5 archivos |
| 6.2 | contar | `(Get-ChildItem <v1>\manifests).Count` | 5 |

### GATE 7 · Descarga y extracción (ASUS) — LA ÚNICA PUERTA QUE DESCARGA
| # | Acción | Comando exacto | Criterio ✅ |
|---|---|---|---|
| 7.1 | **Vía A: descargar zip** | `kaggle datasets download -d abdallahalidev/plantvillage-dataset -p "<repo>\data\_tmp_phase0"` | zip presente, ~2.5–3.5 GB |
| 7.1b | **Vía B (fallback): espejo GitHub** | `Invoke-WebRequest -Uri "https://github.com/spMohanty/PlantVillage-Dataset/archive/refs/heads/master.zip" -OutFile "<repo>\data\_tmp_phase0\plantvillage.zip"` | zip presente |
| 7.2 | tamaño del zip | `(Get-Item <tmp>\plantvillage.zip).Length / 1GB` | ≥ 2 GB esperado (Vía A) / consistente |
| 7.3 | extras | `Expand-Archive -Path <tmp>\plantvillage.zip -DestinationPath <tmp>\PlantVillage-Dataset-master -Force` | `.raw\color\` accesible |
| 7.4 | localizar raw/color | `Get-ChildItem <tmp>\PlantVillage-Dataset-master\raw\color` | ≥ 16 carpetas de clase origen |

### GATE 8 · Consolidación (ASUS) — solo `raw/color`, 16 clases canónicas
| # | Acción | Criterio ✅ |
|---|---|---|
| 8.1 | mapear 16 clases PlantVillage → canónicas `species__condition` según taxonomy_binding_manifest | 16 mapeos documentados |
| 8.2 | copiar/renombrar cada clase inclusión a `<v1>\RAW\<canonical>\` | 16 carpetas |
| 8.3 | excluir `Tomato___Spider_mites Two-spotted_spider_mite` | ausente en RAW |
| 8.4 | descartar grayscale/segmented/generated | ausentes en RAW |
| 8.5 | verificar extensiones | `Get-ChildItem <v1>\RAW -Recurse -File | Group-Object Extension` → solo .jpg/.jpeg/.png |

### GATE 9 · Conteos e integridad (ASUS)
| # | Acción | Comando exacto | Criterio ✅ |
|---|---|---|---|
| 9.1 | recuento global | `(Get-ChildItem <v1>\RAW -Recurse -File).Count` | **21.160** |
| 9.2 | recuento por clase | `Get-ChildItem <v1>\RAW -Directory | ForEach-Object { "$($_.Name)=$((Get-ChildItem $_.FullName -File).Count)" }` | coincide con INVENTORY (min 152 potato__healthy; max 5.357 tomato__yellow_leaf_curl_virus) |
| 9.3 | el archivo types | 9.3 + extensión .png en clase corn__common_rust (origen usados en PlantVillage) | aceptado por arrastre de extensión |

### GATE 10 · Checksums y congelado (ASUS)
| # | Acción | Comando exacto | Criterio ✅ |
|---|---|---|---|
| 10.1 | generar hashes | `Get-ChildItem <v1>\RAW -Recurse -File | Get-FileHash -Algorithm SHA256 | Export-Csv -Path <v1>\CHECKSUMS.csv -NoTypeInformation` | CSV con Línea = 21.160 |
| 10.2 | propia línea de referencia | guardar suma global de CSV (SHA del .csv) | referencia anotada |
| 10.3 | inmutabilizar RAW | `Get-ChildItem <v1>\RAW -Recurse -File | ForEach-Object { $_.IsReadOnly = $true }` | RAW read-only |
| 10.4 | limpiar temporal | `Remove-Item "<repo>\data\_tmp_phase0" -Recurse -Force` | liberado el espacio (~3.5+10 GB) |

### GATE 11 · Verificación documento <-> artefacto (ASUS)
| # | Acción | Criterio ✅ |
|---|---|---|
| 11.1 | manifests locales == canónicos (hash YAML) | 5/5 iguales, salvo `source_root` real de ASUS en raw_source_manifest local |
| 11.2 | `source_root` local apunta a `<v1>\RAW` | ruta absoluta real |

### GATE 12 · Punto de retorno registrado (ASUS)
| # | Acción | Criterio ✅ |
|---|---|---|
| 12.1 | cerrar checklist en verde | 12/12 gates verdes |
| 12.2 | registrar en rondas de sincronización documental (misión separada, no hoy) | pendiente |

---

## 4. Comandos exactos (consolidado para ASUS)

```powershell
# ===== FASE A · ENTORNO =====
Get-PSDrive
[math]::Round((Get-PSDrive C).Free / 1GB, 1)
python --version
pip --version
git --version
tar --version | Select-Object -First 1
pip install --user kaggle
kaggle --version
# manual: kaggle.com/settings/API -> Create New Token -> colocar kaggle.json en ~/.kaggle/
Test-Path "$env:USERPROFILE\.kaggle\kaggle.json"
kaggle datasets list

# ===== FASE B · ESTRUCTURA =====
# definir variables
$repo = "$env:USERPROFILE\Development\sigcTiArural"
$v1   = "$repo\data\datasets\agriculture_images_tomato-potato-corn\v1"
$tmp  = "$repo\data\_tmp_phase0"
New-Item -ItemType Directory -Force -Path "$v1\RAW","$v1\curated\train","$v1\curated\validation","$v1\curated\test","$v1\split_lists","$v1\labels","$v1\holdout","$v1\manifests" | Out-Null
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
Copy-Item "$repo\docs\ai\manifests\*.yaml" "$v1\manifests\" -Force

# ===== FASE C · DESCARGA (Vía A) =====
kaggle datasets download -d abdallahalidev/plantvillage-dataset -p $tmp
Expand-Archive -Path "$tmp\plantvillage.zip" -DestinationPath "$tmp\PlantVillage-Dataset-master" -Force
Get-ChildItem "$tmp\PlantVillage-Dataset-master\raw\color"

# ===== FASE D · CONSOLIDACIÓN Y CONGELADO =====
# (por cada una de las 16 clases: copy + rename canónico)
# verificar:
(Get-ChildItem "$v1\RAW" -Recurse -File).Count                          # 21.160
Get-ChildItem "$v1\RAW" -Directory | ForEach-Object { "$($_.Name)=$((Get-ChildItem $_.FullName -File).Count)" }
Get-ChildItem "$v1\RAW" -Recurse -File | Get-FileHash -Algorithm SHA256 | Export-Csv -Path "$v1\CHECKSUMS.csv" -NoTypeInformation
Get-ChildItem "$v1\RAW" -Recurse -File | ForEach-Object { $_.IsReadOnly = $true }

# ===== FASE E · VERIFICACIÓN FINAL =====
git -C $repo status --short data
(Get-ChildItem "$v1\manifests").Count              # 5
Remove-Item $tmp -Recurse -Force
```

> Los comandos de consolidación de las 16 clases se entregarán como **script auxiliar** en la misión de ejecución (con la tabla de mapeo exacta del taxonomy_binding_manifest) — aquí se deja fijado el procedimiento.

---

## 5. Estrategia de recuperación (qué hacer si algo falla)

| Evento | Detección | Recuperación (punto de retorno Δ) |
|---|---|---|
| **Caída de descarga** | zip incompleto, `Expand-Archive` falla, tamaño < esperado | 🔁 Reanudar/re-descargar Vía A: `kaggle datasets download -d abdallahalidev/plantvillage-dataset -p $tmp` (el CLI re-descarrega íntegro). Vía B: `Invoke-WebRequest` reanudable con `-C` no soportada nativa → reintentar o usar `curl.exe -L -C -` |
| **Zip corrupto** | `Expand-Archive` error de CRC, hash no coincide | 🌐 Borrar zip (`Remove-Item $tmp\plantvillage.zip`) + re-descarga + re-hash. NO intentar reparar parcialmente |
| **Espacio insuficiente durante extracción** | error de disco en Expand-Archive | 1. Cancelar extracción · 2. liberar/borrar `$tmp` · 3. mover destino a disco con espacio (cambiar `$v1` a D:) · 4. retomar consolidación desde GATE 5 |
| **Falla de autenticación Kaggle (401)** | `kaggle datasets list` error | Z re-generar token en kaggle.com/settings/API, reemplazar `~/.kaggle/kaggle.json` y re-validar |
| **Conteo ≠ 21.160** | GATE 9.1 rojo | 🛑 STOP: revisar clases mapeadas (15/16/sobra), carpetas duplicadas, extensión invisible; corregir en RAW ANTES de checksums; nunca "parchear" conteos |
| **Conteo por clase ≠ INVENTORY** | GATE 9.2 rojo | Idem: verificar exclusión Spider_mites y clases con error de mapeo |
| **Antivirus elimina archivos durante extracción** | conteo menor tras GATE 9 | A agregar `data\` a exclusiones del AV + re-extracción limpia de ZIP |
| **Kaggle requiere condición/torneo** | descarga rechazada | B Fallback Vía B (espejo GitHub spMohanty) con el mismo árbol |

**Punto de retorno universal:** **GATE 5 con `$tmp` limpio.** Todo lo producido hasta GATE 4 (entorno + estructura) es re-ejecutable en ~1 minuto y no depende de red. La única acción que no tiene retorno automático es GATE 7 (descarga): se protege con hashes, re-intento y completo descarte del artefacto corrupto.

---

## 6. Preparación de la Fase 1 (posterior a la descarga, misión separada)

La Fase 1 (curación/labels) queda **diseñada pero no ejecutada hoy**. Puente ya definido:

| Entregable F1 | Depende de F0 | Entrada canónica |
|---|---|---|
| `labels_agriculture_v2_v1.csv` (21.160 filas) | GATES 8–10 verdes | `RAW/` + `taxonomy_v1` + `label_schema_v1` |
| Campos por fila: `image_filename, canonical_class_id, label, species, split, reviewed, split_origin` | GATES 8–10 | `taxonomy_binding_manifest` |
| `split_lists/{train,validation,test}.csv` (70/15/15, seed 42, stratified, anti-fuga) | GATES 8–10 | `split_manifest` |
| `dataset_card.md` + `split_report.md` | GATES 8–10 | perfiles por clase del INVENTORY |

Precondición operativa para abrir F1: `v1/RAW/` con 21.160 archivos, checksums firmados y read-only (GATE 10) + `source_root` local correcto (GATE 11).

---

## 7. RESPONDE la misión

1. **Checklist final:** tabla operativa por gates en §3 (GATE 1–12), con comando, criterio y rama de recuperación.
2. **Comandos exactos:** consolidado ejecutable en §4 (instalación kaggle, validación, espacio, árbol, descarga, consolidación, checksums, congelado).
3. **Punto de retorno:** GATE 5 con `$tmp` limpio (todo lo anterior es re-ejecutable en ~1 minuto sin red). La descarga (GATE 7) es la única sin retorno automático → protegida por hash + reintento + descarte completo de artefacto corrupto.
4. **GO / NO GO:** **NO GO hoy** — mantiene el bloqueante vigente de READYCHECK (kaggle.json + kaggle CLI + espacio ASUS sin confirmar). Este documento NO habilita descarga: habilita que Bernardo ejecute los gates 1–6 (todo lo que no descarga) de inmediato en ASUS y deje lista la puerta 7 para cuando se cumplan las precondiciones. **GO de descarga solo tras 6/6 gates A–B en verde + decisión explícita de Bernardo.**

---

## 8. PREGUNTA FINAL

**¿Cuál es el primer comando que ejecutará Bernardo en ASUS cuando inicie Fase 0?**

### `Get-PSDrive`

Justificación: es el GATE 1.1 del checklist §3 (validar almacenamiento) — la primera verificación que no depende de credenciales ni instalaciones y decide si la ASUS puede recibir la Fase 0 (objetivo: un disco con LibreGB ≥ 20, ideal ≥ 30). De él depende la elección de disco (`$repo`/`$v1` en C: o en D:) que parametriza todos los comandos posteriores.

---

*Checklist de ejecución de la Fase 0 del Dataset V2. Modo EJECUCIÓN CONTROLADA: documentación + estructura + checklist permitidos; descarga, entrenamiento, benchmark y commits prohibidos. Ejecución prevista en ASUS.*