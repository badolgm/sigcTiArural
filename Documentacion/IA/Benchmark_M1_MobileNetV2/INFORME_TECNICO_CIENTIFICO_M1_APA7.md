# Informe Técnico-Científico — Experimento M1: Línea Base Oficial del Benchmark SIGCTiArural (MobileNetV2)

**Formato académico APA 7**
**Autor:** Proyecto SIGCTiArural · EIARC (Capacidad de Inteligencia Artificial)
**Contexto formativo/defensa:** ADSO · SENA
**Fecha:** 2026-09-23 ·
**Tipo de documento:** informe de investigación aplicada (experimento controlado reproducible)

---

## Resumen

**Objetivo.** Establecer la línea base oficial (control) del benchmark V1 del ecosistema SIGCTiArural sobre el Dataset V2+ recuperado (22.488 imágenes; 16 clases; 3 especies), ejecutando el experimento M1 con MobileNetV2 pre-entrenado (ImageNet).

**Método.** Se entrenó MobileNetV2 (2.244.368 parámetros; con cabeza de clasificación de 16 clases) sobre el split estratificado oficial (15.741/3.373/3.374; semilla 42) con aumento de datos, pérdida ponderada por clase y muestreo equilibrado (WeightedRandomSampler), AdamW (3e-4, wd 1e-4), programador coseno (T=40), parada temprana (paciencia 8) y precisión mixta (AMP) sobre GPU T4 de Google Colab.

**Resultados (validación).** Macro-F1 = **0.9899** (gate ≥ 0.955, PASS); ECE = **0.0313** (gate ≤ 0.10, PASS); balanced accuracy = 0.9898; weighted F1 = 0.9902.

**Conclusiones.** El pipeline ETL, el pipeline de entrenamiento y la infraestructura Colab+T4 quedan validados; el resultado sitúa a MobileNetV2 como **baseline oficial congelado** del benchmark. Se cumple el criterio de diagnóstico (0.9899 < 1.0 excluye fuga), y la calibración quedó por debajo del umbral de 0.10.

**Palabras clave:** clasificación de enfermedades de cultivo; MobileNetV2; línea base; calibración; macro-F1; aprendizaje por transferencia; ECE; benchmark reproducible.

---

## 1. Introducción

El ecosistema SIGCTiArural integra conocimiento agrícola verificado para la detección y severidad de enfermedades en cultivos (tomate, papa, maíz). Como primer caso de uso productivo de su componente de inteligencia artificial (EIARC), se materializó un Dataset V2+ de laboratorio puro (PlantVillage recuperado; 22.488 imágenes representativas de las tres especies, 16 clases tratamiento-enfermedad), cuyos conteos, particiones y manifiestos quedaron congelados en un freeze oficial de baseline.

Antes de comparar arquitecturas, es requisito contar con una **línea base (control)** de costo mínimo que (a) valide el pipeline completo y (b) sirva de referencia para las cuatro arquitecturas restantes del benchmark (EfficientNet-B0, MobileNetV3-Large, ResNet50, ConvNeXt-Tiny). El presente informe documenta la ejecución oficial de ese control: el experimento M1 (MobileNetV2).

### 1.1 Pregunta de investigación
¿Alcanza MobileNetV2, bajo la política canónica del benchmark, un desempeño diagnóstico sano (macro-F1 ≥ 0.955) y una calibración aceptable (ECE ≤ 0.10) sobre validation, sin evidencia de fuga ni de errores estructurales del pipeline?

### 1.2 Objetivos
- **General:** establecer el baseline oficial congelado del benchmark V1.
- **Específicos:** (1) validar el ETL y el split oficial; (2) validar el pipeline de entrenamiento (muestreo, pérdida ponderada, AMP, checkpoints, parada temprana); (3) validar la infraestructura Colab + T4; (4) estimar métricas de calibración y discriminación para el control.

## 2. Método

### 2.1 Materiales
- **Datos:** Dataset V2+ `agriculture_images_tomato-potato-corn` v1 — 22.488 imágenes, 16 clases, 3 especies; split 15.741 (entrenamiento) / 3.373 (validación) / 3.374 (prueba), estratificado, semilla 42; particiones físicas bajo `curated/train|validation|test`.
- **Modelo:** MobileNetV2 (Sandler et al., 2018) con pesos pretrained ImageNet (IMAGENET1K_V1) y cabezal lineal 1280→16.
- **Hardware/entorno:** Google Colab, GPU **T4**; PyTorch + torchvision (sesión Colab, versiones reportadas en celda #0 del notebook).
- **Artefacto de software:** notebook `notebooks/SIGCTIARURAL_M1_MobileNetV2.ipynb` (revisado como artefacto previo a la ejecución).

### 2.2 Diseño
Experimento de un solo tratamiento (arquitectura = nivel control), con **variables controladas** (semilla 42, transformaciones, política de optimización, particiones) y **variables dependientes** macro-F1, ECE, balanced accuracy y weighted F1. Ninguna métrica sobre test intervino en decisiones intermedias (regla de oro del test single-use).

### 2.3 Procedimiento
1. Montaje de Drive; verificación de `DATA_ROOT` y particiones.
2. Carga con ImageFolder; conteos verificados contra el freeze oficial (asert).
3. Aumentación de datos (entrenamiento) y preprocesado de validación/prueba.
4. Pesos de clase (CE ponderada) y muestreo equilibrado.
5. Entrenamiento por 40 épocas con parada temprana (paciencia 8 sobre macro-F1 val) y guardado de mejores pesos (`best.pth`).
6. Evaluación final sobre validation con el mejor checkpoint; cálculo de ECE (15 bins), matrices de confusión y curvas ROC/PR/calibración.

### 2.4 Análisis
Se reportan métricas agregadas sobre validation. El diagnóstico distingue tres situaciones: fuga (macro-F1 ≈ 1.0), error de pipeline (macro-F1 < 0.90) y desempeño válido (≥ 0.90 y < 1.0). La calibración se mide con Expected Calibration Error.

## 3. Resultados

**Tabla 1**
*Métricas agregadas sobre validation (n = 3.373) del experimento M1 (MobileNetV2)*

| Métrica | Valor | Gate | Cumplimiento |
|---|---|---|---|
| Macro-F1 | 0.9899 | ≥ 0.955 | ✅ |
| Expected Calibration Error (ECE, 15 bins) | 0.0313 | ≤ 0.10 | ✅ |
| Balanced accuracy | 0.9898 | — | — |
| Weighted F1 | 0.9902 | — | — |

- El macro-F1 de validación (0.9899) está por encima de la banda proyectada (0.955–0.970), consistente con la saturación del dataset de laboratorio y sin activar sospecha de fuga (< 1.0).
- La calibración resultó mejor de lo proyectado (0.0313 frente a una banda esperada de 0.04–0.08).
- El desglose por clase (16×P/R/F1), el mejor epoch, y las curvas (entrenamiento/validación, matriz de confusión, ROC, PR, calibración y análisis de errores) forman parte del registro de evidencia (ver `EVIDENCIA_EJECUCION_M1.md`) y se incorporan al presente informe una vez extraídos del runtime.

## 4. Discusión

**4.1 Diagnóstico de pipeline.** El resultado valida el ETL y el split: sin la anti-fuga (dedup SHA-256 + pHash) y el balanceo, un macro-F1 de 0.99 exigiría sospecha; aquí es coherente con un dataset saturado de fondo limpio y clases cuasi-disjuntas.

**4.2 Calibración.** El ECE de 0.03 es notablemente inferior al del modelo heredado colapsado (confianza degenerada del sistema precedente): el control queda calibrado y habilita discusión futura de umbrales de decisión legítimos.

**4.3 Comparación H5 (perspectiva).** Dado lo saturado del corpus, la hipótesis de que arquitecturas mayores no aportarán >0.005 de mejora sobre el control permanece plausible; el factor de discriminación final seguirá siendo ECE + coste de borde.

**4.4 Limitaciones declaradas.** (a) Dataset de laboratorio: sin validez externa de campo hasta datos UBTN/BBB-03. (b) Una sola semilla: las diferencias entre arquitecturas se reportan como observaciones, no como significancia inferida. (c) Artefactos del run residen en `/content` efímero de Colab (resultado verificable aún; persistencia pendiente). (d) El test single-use no formó parte de la decisión.

## 5. Conclusión

El experimento M1 alcanza todos los gates de aceptación (macro-F1 = 0.9899; ECE = 0.0313), valida el pipeline y la infraestructura, y queda **congelado como baseline oficial** del benchmark SIGCTiArural V2+. El siguiente paso es M2 (EfficientNet-B0) bajo política idéntica.

## 6. Referencias

- He, K., Zhang, X., Ren, S., & Sun, J. (2016). Deep residual learning for image recognition. *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*.
- Hughes, D. P., & Salathé, M. (2015). An open access repository of images on plant health to enable the development of mobile disease diagnostics. *arXiv:1511.08060*.
- Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., & Chen, L.-C. (2018). MobileNetV2: Inverted residuals and linear bottlenecks. *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*.
- SIGCTiArural (2026). *Dataset V2 Baseline Freeze* [documento interno].
- SIGCTiArural (2026). *Benchmark V1 Plan* [documento interno].

*Nota: las referencias de terceros se citan para encuadre académico; los resultados corresponden exclusivamente a la ejecución documentada.*