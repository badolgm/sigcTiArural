"""
Entrenamiento rápido con MobileNetV2 sobre el dataset estandarizado.
Guarda el modelo en src/ai_models/production_models/plant_disease_mbv2.h5

Requiere: tensorflow-cpu, scikit-learn.
"""

import argparse
from pathlib import Path
import os

# Desactivar logs de GPU si no se usa
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.keras import layers


def build_model(num_classes: int, img_size=224):
    # Cargar base pre-entrenada MobileNetV2
    base = tf.keras.applications.MobileNetV2(
        input_shape=(img_size, img_size, 3), 
        include_top=False, 
        weights='imagenet'
    )
    base.trainable = False # Congelar capas base para Transfer Learning
    
    inputs = tf.keras.Input(shape=(img_size, img_size, 3))
    
    # Preprocesamiento específico de MobileNetV2
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
    
    # Pasar por la base
    x = base(x, training=False)
    
    # Capas de clasificación propias
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    model = tf.keras.Model(inputs, outputs)
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model


def main():
    ap = argparse.ArgumentParser()
    # Rutas por defecto ajustadas a la estructura del proyecto
    ap.add_argument('--data-root', type=str, default='data/datasets/plant_disease', help='Raíz del dataset')
    ap.add_argument('--epochs', type=int, default=5)
    ap.add_argument('--batch-size', type=int, default=32)
    ap.add_argument('--img-size', type=int, default=224)
    # Ruta de salida del modelo
    ap.add_argument('--out-model', type=str, default='src/ai_models/production_models/plant_disease_mbv2.h5')
    args = ap.parse_args()

    data_root = Path(args.data_root)
    train_dir = data_root / 'train'
    val_dir = data_root / 'val'

    print(f"🚀 Iniciando entrenamiento...")
    print(f"   Datos: {data_root}")
    print(f"   Modelo Salida: {args.out_model}")

    if not train_dir.exists():
        print(f"❌ Error: No existe el directorio de entrenamiento: {train_dir}")
        print("   Ejecuta primero 'python universal_manager.py' o 'python dataset_loader.py'")
        return

    # Cargar Datasets
    try:
        train_ds = image_dataset_from_directory(
            train_dir, image_size=(args.img_size, args.img_size), batch_size=args.batch_size
        )
        val_ds = image_dataset_from_directory(
            val_dir, image_size=(args.img_size, args.img_size), batch_size=args.batch_size
        )
    except ValueError as e:
        print(f"❌ Error cargando imágenes: {e}")
        return

    class_names = train_ds.class_names
    print(f"✅ Clases detectadas: {class_names}")

    # Construir y Entrenar
    model = build_model(len(class_names), args.img_size)
    print("🧠 Modelo construido. Entrenando...")s
    
    history = model.fit(train_ds, validation_data=val_ds, epochs=args.epochs)

    # Guardar
    out_path = Path(args.out_model)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    model.save(out_path)
    print(f"💾 Modelo guardado exitosamente en: {out_path}")
    print("✨ ¡Listo para inferencia!")

if __name__ == '__main__':
    main()