"""
Entrenamiento rápido con MobileNetV2 sobre el dataset estandarizado.
Guarda el modelo en src/ai_models/production_models/plant_disease_mbv2.h5

Requiere: tensorflow-cpu, scikit-learn.
"""

import argparse
from pathlib import Path

import tensorflow as tf
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.keras import layers


def build_model(num_classes: int, img_size=224):
    base = tf.keras.applications.MobileNetV2(
        input_shape=(img_size, img_size, 3), include_top=False, weights='imagenet'
    )
    base.trainable = False
    inputs = tf.keras.Input(shape=(img_size, img_size, 3))
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    model = tf.keras.Model(inputs, outputs)
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--data-root', type=str, default='data/datasets/plant_disease', help='Raíz del dataset estandarizado')
    ap.add_argument('--epochs', type=int, default=5)
    ap.add_argument('--batch-size', type=int, default=32)
    ap.add_argument('--img-size', type=int, default=224)
    ap.add_argument('--out-model', type=str, default='src/ai_models/production_models/plant_disease_mbv2.h5')
    args = ap.parse_args()

    data_root = Path(args.data_root)
    train_dir = data_root / 'train'
    val_dir = data_root / 'val'

    train_ds = image_dataset_from_directory(
        train_dir, image_size=(args.img_size, args.img_size), batch_size=args.batch_size
    )
    val_ds = image_dataset_from_directory(
        val_dir, image_size=(args.img_size, args.img_size), batch_size=args.batch_size
    )

    num_classes = len(train_ds.class_names)
    model = build_model(num_classes, img_size=args.img_size)

    model.fit(train_ds, validation_data=val_ds, epochs=args.epochs)

    out_path = Path(args.out_model)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    model.save(str(out_path))
    print('Modelo guardado en', out_path)


if __name__ == '__main__':
    main()