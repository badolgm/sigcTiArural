import os
import sys
import json
import numpy as np
from pathlib import Path

# Intentar importar TensorFlow (suprimiendo logs molestos)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
try:
    import tensorflow as tf
except ImportError:
    print("❌ ERROR CRÍTICO: TensorFlow no está instalado en este entorno.")
    print("   Ejecuta: pip install tensorflow-cpu")
    sys.exit(1)

def check_brain():
    print("\n🧠 --- AUDITORÍA DE CEREBRO IA (SIGC&T) ---")
    
    # 1. Revisar Estructura de Datos
    data_path = Path("data/datasets/plant_disease")
    print(f"\n📂 Revisando datos en: {data_path}")
    
    if not data_path.exists():
        print("   ❌ La carpeta data/datasets/plant_disease NO EXISTE.")
        print("      Conclusión: No hay datos preparados. Debes correr 'prepare_plant_disease_dataset.py' primero.")
    else:
        for split in ['train', 'val']:
            split_path = data_path / split
            if split_path.exists():
                classes = [d.name for d in split_path.iterdir() if d.is_dir()]
                print(f"   Subcarpeta '{split}': Encontradas {len(classes)} clases.")
                total_imgs = sum([len(list(d.glob('*'))) for d in split_path.iterdir() if d.is_dir()])
                print(f"      Total imágenes: {total_imgs}")
                if len(classes) < 2:
                    print(f"      ⚠️ ALERTA: Se necesitan al menos 2 clases para entrenar (Sana vs Enferma). Tienes {len(classes)}.")
                if total_imgs == 0:
                    print("      ⚠️ ALERTA: No hay imágenes. El modelo entrenó con 'aire'.")
            else:
                print(f"   ❌ Subcarpeta '{split}' no encontrada.")

    # 2. Revisar el Modelo .h5
    model_path = Path("src/ai_models/production_models/plant_disease_mbv2.h5")
    print(f"\n💾 Revisando modelo: {model_path}")
    
    if not model_path.exists():
        print("   ❌ El archivo .h5 NO EXISTE.")
    else:
        size_mb = model_path.stat().st_size / (1024 * 1024)
        print(f"   Tamaño: {size_mb:.2f} MB")
        
        try:
            model = tf.keras.models.load_model(model_path)
            print("   ✅ El modelo carga correctamente en TensorFlow.")
            
            # Prueba de cordura (Sanity Check)
            print("   🧪 Ejecutando prueba de inferencia simulada...")
            dummy_input = np.random.rand(1, 224, 224, 3).astype(np.float32)
            prediction = model.predict(dummy_input, verbose=0)
            print(f"      Predicción cruda: {prediction}")
            
            if np.isnan(prediction).any():
                print("      💀 DIAGNÓSTICO: 'NaN' DETECTADO. El modelo está corrupto.")
                print("      Causa probable: Entrenamiento con 0 imágenes o tasa de aprendizaje explosiva.")
            else:
                print("      ✅ DIAGNÓSTICO: El modelo responde números válidos.")
                
        except Exception as e:
            print(f"   ❌ El modelo está corrupto o es ilegible. Error: {e}")

if __name__ == "__main__":
    check_brain()