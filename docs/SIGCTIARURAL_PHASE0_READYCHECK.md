# SIGCTiArural — PHASE 0 READY CHECK (Pre-descarga PlantVillage)

**Documento:** SIGCTIARURAL_PHASE0_READYCHECK
**Fecha:** 2026-09-22 · **Rama:** `feature/ubtn-biological-telemetry` · HEAD `86d545e`
**Tipo:** Validador de prontitud (ready check) de la ASUS para ejecutar la Fase 0 del Dataset V2.
**Modo:** SOLO LECTURA. No se implementó, no se descargó, no se modificó ningún archivo salvo este documento, no se commiteó.
**Regla suprema:** La documentación canónica es la fuente de verdad. Honestidad de estado. NADA DESAPARECE · TODO SE PRESERVA · TODO SE CONECTA · TODO EVOLUCIONA.
**Alcance honesto:** este agente ejecuta en la máquina de desarrollo (BagmDev). **No tiene acceso remoto a la ASUS.** Por eso este reporte separa (a) métricas **verificadas hoy** en el entorno de trabajo, y (b) gates que **Bernardo debe confirmar en terminal de la ASUS** con los comandos exactos aquí provistos.

---

## 1. Capacidad de almacenamiento

### Verificado hoy (entorno de trabajo del agente)
| Disco | Libre real | Usable estimado (85%) | Verdict |
|---|---|---|---|
| **C:** | **19.0 GB** | ~16.1 GB | ❌ por debajo de los 20 GB mínimos; sin margen seguro |

Este disco es el de desarrollo y **NO es la ASUS**. Se verifica por transparencia: la Fase 0 NO debe ejecutarse aquí.

### Por verificar en ASUS (comando exacto)
```powershell
Get-PSDrive C   # objetivo: Libre ≥ 20 GB (mínimo) / ≥ 30 GB (recomendado)
Get-PSDrive     # listar TODOS los discos; si existe D:/E: con más espacio, elegirlo
```

### Decisión de disco recomendada
1. **Preferido:** el disco de sistema de la ASUS si tiene ≥ 30 GB libres (SSD/NVMe ⇒ rendimiento de extracción y lectura de imágenes).
2. **Alterno:** disco de datos secundario (D:/) con ≥ 30 GB libres si el sistema está lleno — manteniendo la misma estructura relativa `data\datasets\...` dentro del repo clonado.
3. **Regla:** en ninguna condición ejecutar Fase 0 con < 20 GB libres reales al inicio.

---

## 2. Herramientas requeridas

### Verificado hoy (entorno de trabajo del agente)
| Herramienta | Estado | Evidencia |
|---|---|---|
| **Python** | ✅ presente | Python 3.11.9 |
| **pip** | ✅ presente | pip 24.0 |
| **git** | ✅ presente | git 2.55.0.windows.5 |
| **unzip/descompresor** | ✅ presente (bsdtar) | tar 3.8.8 / libarchive; compatible con zip |
| **kaggle CLI** | ❌ ausente | `kaggle` no reconocido |
| **Credencial Kaggle API** | ❌ ausente | no existe `%USERPROFILE%\.kaggle\kaggle.json` |

### Por verificar en ASUS (comandos exactos)
```powershell
python --version          # objetivo: 3.9+
pip --version             # objetivo: 20+
git --version             # objetivo: 2.3x+
tar --version | select -First 1   # bsdtar GNU o compatible zip
kaggle --version          # objetivo: responda sin error (si no: pip install kaggle)
Test-Path "$env:USERPROFILE\.kaggle\kaggle.json"   # objetivo: True
ls "$env:USERPROFILE\.kaggle" | Select-Object Name  # confirmar kaggle.json (un solo archivo)
```

---

## 3. Rutas

### Ruta exacta recomendada para el dataset
```
<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\
```
En la ASUS, con repo clonado en ruta libre de espacios-problemáticos (evitar caracteres `ñ`, emojis, rutas > 260 chars sin soporte long-path):

**Ejemplo ASUS (sistema):**
```
C:\Users\<usuarioASUS>\Development\sigcTiArural\data\datasets\agriculture_images_tomato-potato-corn\v1\
```

**Ruta de descarga temporal (zip + extracción):**
```
<repo>\data\_tmp_phase0\PlantVillage-Dataset-master\
```

| Elemento | Ruta final |
|---|---|
| RAW consolidado | `...\v1\RAW\` (16 carpetas `species__condition`) |
| Manifests locales | `...\v1\manifests\` (5 YAML) |
| Estructura vacía | `...\v1\{curated\{train,validation,test},split_lists,labels,holdout}` |
| Checksums | `...\v1\CHECKSUMS.sha256` |

**Verificación de ruta en ASUS:**
```powershell
Test-Path "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1"
git -C "<repo>" status --short data   # objetivo: vacío => data/ fuera de git (unchanged: .gitignore:62)
```

---

## 4. Riesgos (lo que puede salir mal durante Fase 0)

| Riesgo | Prob | Impacto | Mitigación hoy |
|---|---|---|---|
| **Disco ASUS < 20 GB** al iniciar | Media | Fallo de extracción a mitad | Gate 1: verificar `Get-PSDrive` antes; usar disco secundario |
| **`kaggle` CLI no instalado** en ASUS | Alta (cluster dev) | No se puede usar Vía A | `pip install kaggle` (autorizado por Bernardo) |
| **Credencial Kaggle inexistente** | Alta | Bloqueo Vía A | primera acción: crear/validar API key |
| **Kaggle requiere login/reCAPTCHA** en descarga masiva | Media | Vía A lenta o rechazada | Fallback Vía B (descarga manual/mirror GitHub spMohanty) |
| **Zip corrupto por corte** | Media | Datos ilegibles | SHA vs referencia publicada + re-descarga |
| **Extracción > 12 GB** no cabe en temporal | Media | Insuficiencia de espacio | Borrar zip+árbol temporal tras consolidar RAW |
| **Renombrado de 16 clases mal mapeado** | Media | Contaminación taxonómica | Verificar count por clase vs INVENTORY; nunca inventar nombres |
| **Incluir `Tomato___Spider_mites`** | Baja | Rompe 21.160 | Filtro explícito; gate 6 del checklist |
| **Red del laboratorio lenta/bloqueada** | Media | Descarga de horas | Reanudable: Kaggle CLI `download` reanuda; detalle de red de ASUS |
| **Antivirus marca zip/extract como falso positivo** | Baja | Eliminación parcial | Excluir `data\` de escaneo; verificar conteos tras extraer |

**Riesgo transversal:** ejecutar la Fase 0 con la lista de riesgos como checklist por descarga directa aumenta probabilidad de error — se respeta el orden de gates.

---

## 5. Checklist previo a descarga (ejecutable, en orden)

```powershell
# — GATE 1 · ALMACENAMIENTO —
Get-PSDrive   # ✅ al menos un disco con Libre GB ≥ 20
# — GATE 2 · HERRAMIENTAS —
python --version                          # ✅ 3.9+
pip --version                             # ✅ 20+
git --version                             # ✅ presente
tar --version | select -First 1           # ✅ descompresor zip
kaggle --version                          # ⚠️ si no responde: pip install kaggle (con orden)
Test-Path "$env:USERPROFILE\.kaggle\kaggle.json"   # ✅ True (Vía A)
# — GATE 3 · REPO COPY —
git -C "<repo>" status -sb                # ✅ rama feature/ubtn-biological-telemetry, limpio salvo conocidos
git -C "<repo>" rev-parse --short HEAD    # ✅ 86d545e
git -C "<repo>" status --short data       # ✅ vacío (data/ fuera de git)
# — GATE 4 · RED —
Test-NetConnection kaggle.com -Port 443   # ✅ True (Vía A)
Test-NetConnection github.com -Port 443   # ✅ True (Vía B)
# — GATE 5 · ESTRUCTURA —
New-Item -ItemType Directory -Force -Path `
 "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\RAW",`
 "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\curated\train",`
 "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\curated\validation",`
 "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\curated\test",`
 "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\split_lists",`
 "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\labels",`
 "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\holdout",`
 "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\manifests" | Out-Null
# ✅ 8 rutas creadas
# — GATE 6 · MANIFESTS LOCALES —
Copy-Item "docs\ai\manifests\*.yaml" `
  "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\manifests\" -Force
Get-ChildItem "<repo>\data\datasets\agriculture_images_tomato-potato-corn\v1\manifests" | Count   # ✅ 5
# — GATE 7 · DECISIÓN HUMANA —
# ✅ Confirmado por Bernardo: disco destino, tamaño, campo de trabajo (__tmp descartable)
```

Resultado esperado del checklist: **7/7 gates en verde ⇒ GO descarga.** Cualquier gate en rojo ⇒ corregir antes de descargar y re-comprobar esa gate únicamente.

---

## 6. State confirmado (contexto de la misión)

| Ítem | Estado |
|---|---|
| Dataset V2 diseñado / gobernado / documentado | ✅ (READINESS + EXECUTION_GUIDE + 5 manifests) |
| Fase 0 definida | ✅ (EXECUTION_GUIDE §5) |
| Dataset físico inexistente | ❌ confirmado: no hay `data/` |
| PlantVillage no descargado | ❌ confirmado en BagmDev; pendiente ASUS |
| Kaggle API no configurada | ❌ confirmado: no hay `kaggle.json`, `kaggle` CLI ausente |

---

## 7. RESPONDE la misión

1. **Estado ASUS:** **no verificable remotamente desde el entorno del agente.** Se proveen comandos exactos (§2–§3, §5) para que Bernardo certifique en terminal; en el entorno actual solo están garantizados Python 3.11.9, pip 24.0, git 2.55.0 y bsdtar 3.8.8; `kaggle` CLI y credencial están **ausentes**.
2. **Disco recomendado:** el disco con Libre GB ≥ 30 (ideal SSD sistema); con mínimo ≥ 20. En el entorno actual C: tiene 19.0 GB libres ⇒ **NO apto** si se tratara de ejecutar aquí.
3. **Herramientas faltantes:** `kaggle` CLI y `kaggle.json` (las únicas dos ausentes hoy en el entorno de trabajo; el resto presentes).
4. **Bloqueantes:** (1) credencial Kaggle inexistente, (2) `kaggle` CLI no instalado, (3) espacio ASUS sin confirmar ≥ 20 GB.
5. **GO / NO GO:** **NO GO** para la descarga inmediata por la vía canónica, hasta cumplir GATES 1–2 (espacio confirmado en ASUS + `kaggle.json` + `kaggle` CLI). Una vez verificado el checklist §5 al completo ⇒ **GO incondicional**.

---

## 8. PREGUNTA FINAL

**¿Puede Bernardo iniciar la descarga de PlantVillage hoy?**

## NO GO

**Justificación técnica breve:** no están dadas las dos precondiciones de la Vía A canónica — (1) credencial Kaggle API (`kaggle.json`) inexistente y `kaggle` CLI ausente en el entorno verificado, y (2) el espacio libre de ASUS (≥ 20 GB) no está confirmado. La primera acción de Bernardo permanece: **crear/validar la API key de Kaggle (`~\.kaggle\kaggle.json`) y verificar `Get-PSDrive` en la ASUS**; solo después de esas dos gates y de `pip install kaggle` (si procede) se habilita el GO de descarga por Vía A, o directamente la Vía B manual si se confirma la red.

---

*Ready check de la Fase 0 del Dataset V2. Modo SOLO LECTURA: sin implementación, sin descarga, sin modificación de archivos (solo creación de este documento), sin commits.*