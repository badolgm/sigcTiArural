# Correcciones para la Siguiente Versión — Benchmark V1 (objetivo: M2)

**Documento:** CORRECCIONES_PARA_M2 (G)
**Alcance:** correcciones de robustez detectadas en la auditoría de software del notebook M1. **Se aplican a la versión del notebook que usarán M2–M5** (p. ej. copia `SIGCTIARURAL_M2_EfficientNetB0.ipynb`). **No modifican el artefacto M1 ya ejecutado ni sus resultados congelados.**

---

## 1. Warnings AMP deprecados

**Causa.** En torch ≥ 2.3, `torch.cuda.amp.autocast`/`GradScaler` emiten advertencias de deprecación recomendando `torch.amp`. Adicionalmente, en CPU el `autocast(enabled=True)` por defecto produce warnings de device.

**Corrección mínima (celda #8, `run_one_epoch`):** condicionar AMP al device y usar la API no deprecada:

```python
# en lugar de:
#   from torch.cuda.amp import autocast, GradScaler
# usar (celda #1):
use_amp = DEVICE == "cuda"
if use_amp:
    from torch.amp import autocast, GradScaler
else:
    autocast = gradscaler_nop  # passthrough en CPU
```

y en el forward:

```python
with autocast(device_type=DEVICE, dtype=torch.float16, enabled=use_amp):
    logits = model(images); loss = criterion(logits, targets)
```

**Impacto:** ninguno sobre resultados; elimina warnings y unifica comportamiento CPU/GPU.

## 2. Persistencia de artefactos en Drive

**Causa.** M1 guardó todo en `/content/M1_mobilenetv2_001` (VM efímera). Un reset de runtime pierde `best.pth`, `metrics.csv` y los PNG.

**Corrección mínima (celda #9 y herederas):** ruta de salida dentro de Drive:

```python
OUT = "/content/drive/MyDrive/SIGCTiArural/runs/M2_efficientnet_b0"
os.makedirs(OUT, exist_ok=True)
```

Con `OUT_BEST`, `OUT_LAST` como helpers de checkpoint si se quiere organizar subcarpetas. **Guardado automático** (mismo comportamiento que M1, ahora persistente): `best.pth` en mejora, `last.pth` por epoch, `metrics.csv` al cierre de cada epoch (flush).

**Impacto:** solo persistencia; no altera pipeline, semillas ni métricas.

## 3. Guardado automático de checkpoints + CSV incremental

**Causa.** En M1, `metrics.csv` se escribía al final del loop: un crash a mitad de run perdía el registro por epochs, aunque `best.pth` ya existiera.

**Corrección mínima (celda #9):** abrir el CSV en modo `a`/reconstruir cabecera una vez, y escribir por epoch con `flush=True`; guardar `best.pth` (mejora) y `last.pth` (cada epoch) siempre en Drive (§2).

```python
with open(os.path.join(OUT, "metrics.csv"), "a", newline="") as f:  # "w" solo primera vez
    w = csv.writer(f)
    w.writerow(row); f.flush()
```

**Impacto:** resumibilidad del registro; sin efectos en la métrica final.

## 4. Otras mejoras recomendadas (menores, opcionales)

| # | Mejora | Beneficio |
|---|---|---|
| 4.1 | Guard de dependencia: verificar `torchvision ≥ 0.13` antes de `models.MobileNet_V2_Weights` con mensaje claro | evita `AttributeError` opaco en entornos viejos |
| 4.2 | Derivar especies por mapeo taxonómico en EDA en vez de `split('__')[0]` (o advertir si `len(species) != 3`) | precisión del dataset card visual |
| 4.3 | Guards de orden de ejecución (p. ej. `if "rows" not in globals(): raise RuntimeError("ejecutar células en orden")`) | error UX en re-ejecución parcial |
| 4.4 | `np.maximum(counts, 1)` en `class_weights` | blinda división por cero a futuro |

## 5. Validación de impacto sobre M1 y Dataset V2+

- M1 ejecutado y **congelado**: ninguna corrección altera su resultado ni sus gates.
- Dataset V2+ intocado: split, manifiestos y hash FROZEN no cambian.
- Las correcciones son **aditivas de robustez** en el notebook M2+, coherentes con la política idéntica entre arquitecturas.
- Verificación posterior obligatoria: al construir el notebook M2, re-validar sintaxis (JSON), compilación y la celda de arquitectura con `torch`, como se hizo para M1.