# AGRICULTURE_AI_V2_DATA_QUALITY_FRAMEWORK

## Fecha

2026-07-16

## Objetivo

Definir el framework de calidad de datos para `Agriculture AI V2` que permita:

- detectar duplicados
- detectar near-duplicates
- detectar corrupción
- imponer resolución mínima
- bloquear clases inválidas
- identificar imágenes descartables

Este framework no ejecuta curación; define reglas, checks y criterios de aceptación.

---

## 1. Alcance

Dataset objetivo:

- `PlantVillage raw/color` filtrado a `16` clases y `21,160` imágenes

Fuentes de verdad:

- `AGRICULTURE_AI_V2_DATASET_INVENTORY.md`
- `AGRICULTURE_AI_V2_EXECUTION_PLAN.md`
- manifests en `docs/ai/manifests/`

---

## 2. Checks de integridad de archivo

## 2.1 Extensiones permitidas

- `.jpg`
- `.jpeg`
- `.png`

## 2.2 Reglas de rechazo inmediato

Rechazar si:

1. tamaño en bytes == `0`
2. falla la decodificación de imagen
3. el archivo no corresponde a un formato real de imagen

## 2.3 Reglas de warning

Marcar como warning si:

1. compresión extrema o artefactos severos
2. imagen excesivamente oscura o blanca (posible captura inválida)

---

## 3. Checks de resolución

## 3.1 Resolución mínima aceptable

- mínimo: `128x128`

## 3.2 Resolución recomendada para entrenamiento

- objetivo: `224x224` (con resize durante pipeline)

## 3.3 Regla

Una imagen debajo de `128x128` debe descartarse porque:

- tiende a borrar rasgos diagnósticos
- degrada la estabilidad de métricas por clase

---

## 4. Checks de clase y taxonomía

## 4.1 Clase válida

Una muestra es válida si:

1. su carpeta pertenece al set de `16` clases aprobadas
2. su `canonical_class_id` existe en `agriculture_v2_taxonomy_v1`

## 4.2 Clase inválida

Debe descartarse si:

1. pertenece a especie fuera de tomato/potato/corn
2. pertenece a `Tomato___Spider_mites Two-spotted_spider_mite`
3. no puede mapearse con el `taxonomy_binding_manifest`

---

## 5. Duplicados exactos

## 5.1 Definición

Dos imágenes son duplicados exactos si:

- tienen hash idéntico

## 5.2 Política

1. detectar duplicados exactos antes de split
2. agrupar duplicados exactos
3. no permitir duplicados en particiones diferentes

## 5.3 Regla

Si duplicados exactos existen, deben:

- eliminarse (conservando un representante) o
- manejarse como grupo indivisible para el split

La decisión debe registrarse en el `curation_manifest`.

---

## 6. Near-duplicates

## 6.1 Definición

Near-duplicate: misma hoja o captura casi idéntica con cambios mínimos:

- pequeño recorte
- leve cambio de brillo
- compresión distinta

## 6.2 Método recomendado

- perceptual hash (pHash)

## 6.3 Umbral recomendado

El umbral debe fijarse experimentalmente durante curación, pero la regla es:

- si el pHash indica similitud fuerte, se agrupan

## 6.4 Política

1. detectar near-duplicates antes de split
2. agruparlos
3. mantener grupos en una única partición

---

## 7. Corrupción y decodificación

## 7.1 Corrupción detectable

1. imagen truncada
2. headers inválidos
3. pixeles corruptos severos

## 7.2 Política

1. cualquier imagen que no decodifique es descartable
2. reportar conteo por clase de descartes por corrupción

---

## 8. Imágenes descartables (criterios)

Una imagen se marca como descartable si cumple cualquiera:

1. tamaño en 0 bytes o no decodifica
2. resolución < `128x128`
3. no pertenece a las `16` clases
4. no mapea a taxonomía V2 inicial
5. duplicado exacto (si se decide conservar solo un representante)

---

## 9. Outputs esperados del framework

Al ejecutar curación (fuera de este documento), se espera producir:

1. `data_quality_report.md`
2. `invalid_files.csv`
3. `duplicates_exact.csv`
4. `duplicates_near.csv`
5. `per_class_quality_summary.csv`

---

## 10. Conclusión

Este framework define los gates mínimos para que el dataset `Agriculture AI V2` pueda considerarse científicamente elegible para benchmark controlado sin fuga obvia, sin corrupción y sin clases inválidas.
