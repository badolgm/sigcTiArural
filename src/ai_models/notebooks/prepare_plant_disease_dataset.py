"""
Prepara datasets PlantVillage (GitHub/Kaggle) para entrenamiento.

Funciones principales:
- Unifica múltiples fuentes en una estructura estándar: data/datasets/plant_disease/{train,val,test}/{class}/img.jpg
- Genera manifiestos CSV con ruta y etiqueta.
- Opcional: descarga Kaggle si se configura el token (~/.kaggle/kaggle.json).

Uso rápido:
    python prepare_plant_disease_dataset.py --github-dir "data/datasets/PlantVillage-Dataset" \
        --kaggle-zip "data/datasets/plantdisease_kaggle.zip" --output-root "data/datasets/plant_disease"
"""

import argparse
import csv
import os
from pathlib import Path
from shutil import copy2
from sklearn.model_selection import train_test_split


def find_images(root: Path):
    exts = {'.jpg', '.jpeg', '.png'}
    for p in root.rglob('*'):
        if p.suffix.lower() in exts and p.is_file():
            yield p


def infer_label_from_path(p: Path) -> str:
    parts = [s.lower() for s in p.parts]
    # heurísticas comunes en PlantVillage
    for token in parts[::-1]:
        if '___' in token:
            # Formato "Tomato___Leaf_Mold"
            return token
    # fallback: usa nombre de carpeta superior
    return p.parent.name


def write_manifest(items, out_csv: Path):
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    with out_csv.open('w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['filepath', 'label'])
        for fp, label in items:
            w.writerow([str(fp), label])


def materialize_split(items, out_root: Path, split_name: str):
    split_dir = out_root / split_name
    for src, label in items:
        cls_dir = split_dir / label
        cls_dir.mkdir(parents=True, exist_ok=True)
        dst = cls_dir / src.name
        if not dst.exists():
            try:
                copy2(src, dst)
            except Exception:
                pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--github-dir', type=str, default='data/datasets/PlantVillage-Dataset', help='Ruta local del repositorio GitHub clonado')
    ap.add_argument('--kaggle-zip', type=str, default='data/datasets/plantdisease_kaggle.zip', help='Ruta del zip descargado de Kaggle (opcional)')
    ap.add_argument('--output-root', type=str, default='data/datasets/plant_disease', help='Directorio de salida estandarizado')
    ap.add_argument('--val-size', type=float, default=0.1)
    ap.add_argument('--test-size', type=float, default=0.1)
    args = ap.parse_args()

    sources = []
    github_dir = Path(args.github_dir)
    if github_dir.exists():
        sources.append(github_dir)

    kaggle_zip = Path(args.kaggle_zip)
    if kaggle_zip.exists():
        # Si el zip existe, descomprimir a carpeta hermana
        import zipfile
        out_dir = kaggle_zip.with_suffix('')
        if not out_dir.exists():
            out_dir.mkdir(parents=True, exist_ok=True)
            with zipfile.ZipFile(str(kaggle_zip), 'r') as z:
                z.extractall(str(out_dir))
        sources.append(out_dir)

    if not sources:
        print('No se encontraron fuentes. Proporcione --github-dir o --kaggle-zip')
        return

    items = []
    for src in sources:
        for img in find_images(src):
            label = infer_label_from_path(img)
            items.append((img, label))

    print(f'Imágenes encontradas: {len(items)}')
    out_root = Path(args.output_root)
    out_root.mkdir(parents=True, exist_ok=True)

    # Dividir en train/val/test
    train_items, tmp_items = train_test_split(items, test_size=args.val_size + args.test_size, random_state=42)
    rel_val = args.val_size / (args.val_size + args.test_size) if (args.val_size + args.test_size) > 0 else 0
    val_items, test_items = train_test_split(tmp_items, test_size=1 - rel_val, random_state=42)

    # Materializar
    materialize_split(train_items, out_root, 'train')
    materialize_split(val_items, out_root, 'val')
    materialize_split(test_items, out_root, 'test')

    # Manifiestos
    write_manifest(train_items, out_root / 'manifests' / 'train.csv')
    write_manifest(val_items, out_root / 'manifests' / 'val.csv')
    write_manifest(test_items, out_root / 'manifests' / 'test.csv')
    print('Dataset estandarizado en', out_root)


if __name__ == '__main__':
    main()