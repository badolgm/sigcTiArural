# INITIAL METADATA AUDIT

**Fecha:** 2026-10-05  
**Dataset:** `sigct_rural_acoustic/v1`  
**Auditoría:** Inicial (pre-captura)

---

## 1. ESTADO DE METADATA

| Artefacto | Estado | Filas/Columnas |
|---|---|---|
| `metadata/metadata.csv` | ✅ Existe | 0 filas / 42 columnas |
| `metadata/labels.csv` | ✅ Existe | 9 filas |
| `metadata/schema.json` | ✅ Existe | v1.2.0 |
| `metadata/manifest.csv` | ✅ Existe | 0 filas (derivado) |
| `metadata/places.csv` | ✅ Existe | 0 filas (opcional) |

---

## 2. CABECERA VS ESQUEMA

| Verificación | Resultado |
|---|---|
| Columnas en cabecera | 42 |
| Columnas en esquema | 42 |
| Coincidencia | ✅ 42/42 |

---

## 3. MUESTRAS

| Métrica | Valor |
|---|---|
| Muestras totales | 0 |
| Muestras aceptadas | 0 |
| Muestras en cuarentena | 0 |
| Muestras rechazadas | 0 |

---

## 4. CLASES

| Clase | Muestras | Objetivo Piloto |
|---|---:|---:|
| `silencio` | 0 | 12 |
| `viento` | 0 | 12 |
| `lluvia` | 0 | 12 |
| `agua` | 0 | 13 |
| `insectos` | 0 | 13 |
| `ave` | 0 | 13 |
| `voz` | 0 | 13 |
| `motor` | 0 | 12 |
| **TOTAL** | **0** | **100** |

---

## 5. PLACES

| Place ID | Muestras | Rol |
|---|---|---|
| `site_a` | 0 | Train |
| `site_b` | 0 | Train + Validation |
| `site_c` | 0 | Holdout |

---

## 6. CONCLUSIÓN

**El metadata está preparado y vacío. No hay muestras reales. La estructura está lista para recibir capturas.**

---

**Estado:** 0 muestras · 42 columnas · 9 clases · 3 places  
**Última auditoría:** 2026-10-05
