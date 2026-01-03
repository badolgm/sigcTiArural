"""
Entrenamiento rápido con MobileNetV2 sobre el dataset estandarizado.
CORRECCIÓN APLICADA: Uso de layers.Rescaling para evitar el error 'Unknown layer: TrueDivide'.
Guarda el modelo en src/ai_models/production_models/plant_disease_mbv2.h5
"""

import argparse
import os
from pathlib import Path

# Suprimir logs de TF
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.keras import layers

def build_model(num_classes: int, img_size=224):
    inputs = tf.keras.Input(shape=(img_size, img_size, 3))
    
    # --- CORRECCIÓN CRÍTICA ---
    # En lugar de usar mobilenet_v2.preprocess_input() directamente (que causa el error de TrueDivide),
    # usamos una capa explícita de Keras que hace lo mismo:
    # MobileNetV2 espera valores entre -1 y 1.
    # Entrada [0, 255] -> Rescaling(1./127.5, offset=-1) -> Salida [-1, 1]
    x = layers.Rescaling(scale=1./127.5, offset=-1)(inputs)
    # --------------------------

    base = tf.keras.applications.MobileNetV2(
        input_shape=(img_size, img_size, 3), 
        include_top=False, 
        weights='imagenet'
    )
    base.trainable = False
    
    x = base(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    model = tf.keras.Model(inputs, outputs)
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

def main():
    print("🚀 INICIANDO PROTOCOLO DE ENTRENAMIENTO (CORREGIDO)...")
    ap = argparse.ArgumentParser()
    ap.add_argument('--data-root', type=str, default='data/datasets/plant_disease')
    ap.add_argument('--epochs', type=int, default=3) # 3 épocas es suficiente para probar rápido
    ap.add_argument('--batch-size', type=int, default=32)
    ap.add_argument('--img-size', type=int, default=224)
    ap.add_argument('--out-model', type=str, default='src/ai_models/production_models/plant_disease_mbv2.h5')
    args = ap.parse_args()

    data_root = Path(args.data_root)
    train_dir = data_root / 'train'
    val_dir = data_root / 'val'

    if not train_dir.exists():
        print(f"❌ Error: No se encuentra {train_dir}")
        return

    print(f"📂 Cargando datos desde: {data_root}")

    train_ds = image_dataset_from_directory(
        train_dir, image_size=(args.img_size, args.img_size), batch_size=args.batch_size
    )
    val_ds = image_dataset_from_directory(
        val_dir, image_size=(args.img_size, args.img_size), batch_size=args.batch_size
    )

    class_names = train_ds.class_names
    print(f"✅ Clases detectadas: {class_names}")

    # Guardar metadatos
    import json
    meta_path = Path(args.out_model).parent / 'model_metadata.json'
    with open(meta_path, 'w') as f:
        json.dump({'classes': class_names, 'framework': 'tensorflow_fixed'}, f)

    model = build_model(len(class_names), args.img_size)
    print("🧠 Modelo construido. Iniciando entrenamiento...")
    
    model.fit(train_ds, validation_data=val_ds, epochs=args.epochs)
    
    print(f"💾 Guardando modelo en: {args.out_model}")
    model.save(args.out_model)
    print("✨ ¡ENTRENAMIENTO COMPLETADO Y GUARDADO CORRECTAMENTE!")

if __name__ == '__main__':
    main()