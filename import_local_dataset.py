import os
import shutil
import random
from pathlib import Path

# --- CONFIGURACIÓN ---
PROJECT_ROOT = Path.cwd()
DEST_DIR = PROJECT_ROOT / "data" / "datasets" / "plant_disease"
TARGET_CROP = "Tomato"

# --- DETECCIÓN AUTOMÁTICA DE TU RUTA ---
# Convertimos la ruta de Git Bash (~) a ruta de Windows (C:\Users\bagm2)
USER_HOME = Path.home()

# Buscamos en la ubicación exacta que nos diste
POSSIBLE_PATHS = [
    USER_HOME / "workspace_toshibaKingston" / "projectsbadolgm" / "PlantVillage-Dataset-master" / "raw" / "color",
    # Por si acaso la ruta varía ligeramente en Windows
    Path("C:/Users/bagm2/workspace_toshibaKingston/projectsbadolgm/PlantVillage-Dataset-master/raw/color")
]

class Colors:
    HEADER = '\033[95m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'

def clean_destination():
    """Limpia la carpeta de destino del proyecto para empezar de cero."""
    if DEST_DIR.exists():
        print(f"{Colors.WARNING}🧹 Limpiando datos antiguos en {DEST_DIR}...{Colors.ENDC}")
        shutil.rmtree(DEST_DIR)
    
    # Crear estructura limpia
    for split in ['train', 'val']:
        for label in ['sana', 'enferma']:
            (DEST_DIR / split / label).mkdir(parents=True, exist_ok=True)

def import_data(source_path):
    source = Path(source_path)
    if not source.exists():
        print(f"{Colors.FAIL}❌ No encuentro la carpeta en: {source}{Colors.ENDC}")
        print("Verifica que la ruta sea correcta.")
        return

    print(f"\n🔍 Leyendo imágenes desde: {Colors.OKGREEN}{source}{Colors.ENDC}")
    
    count_sana = 0
    count_enferma = 0
    
    # Recorrer carpetas de PlantVillage
    for folder in source.iterdir():
        if not folder.is_dir(): continue
        
        folder_name = folder.name
        
        # 1. Filtramos solo Tomates (ignoramos papa, pimentón, etc.)
        if not folder_name.startswith(f"{TARGET_CROP}___"):
            continue

        # 2. Clasificamos: ¿Es sana o enferma?
        if "healthy" in folder_name.lower():
            target_class = "sana"
        else:
            target_class = "enferma"

        print(f"   Procesando carpeta: {folder_name} -> {target_class}")

        # Listar todas las imágenes jpg/JPG
        images = list(folder.glob("*.jpg")) + list(folder.glob("*.JPG"))
        random.shuffle(images) # Mezclar para que el entrenamiento sea aleatorio

        # Copiar imágenes
        for i, img_path in enumerate(images):
            # Regla de Oro: 80% para Entrenar, 20% para Validar
            split = "train" if i < (len(images) * 0.8) else "val"
            
            # Nombre único para evitar conflictos
            new_filename = f"{folder_name}_{img_path.name}"
            dest_file = DEST_DIR / split / target_class / new_filename
            
            try:
                shutil.copy2(img_path, dest_file)
                if target_class == "sana": count_sana += 1
                else: count_enferma += 1
            except Exception as e:
                print(f"   Error copiando {img_path.name}: {e}")

    print(f"\n{Colors.HEADER}=== ¡ÉXITO! IMPORTACIÓN COMPLETADA ==={Colors.ENDC}")
    print(f"🍅 Imágenes Sanas: {count_sana}")
    print(f"🦠 Imágenes Enfermas: {count_enferma}")
    print(f"📂 Datos listos en: {DEST_DIR}")
    print(f"\n👉 Siguiente paso: Entrenar la IA.")

def main():
    print(f"{Colors.HEADER}📥 IMPORTADOR DE DATASET PLANTVILLAGE{Colors.ENDC}")
    
    # Intentar detectar tu ruta automáticamente
    detected_path = None
    for p in POSSIBLE_PATHS:
        if p.exists():
            detected_path = p
            break
    
    if detected_path:
        print(f"\n{Colors.OKGREEN}✅ He detectado tus datos automáticamente en:{Colors.ENDC}")
        print(f"{detected_path}")
        confirm = input("\n¿Proceder con la importación desde aquí? (s/n): ").lower()
        if confirm == 's':
            clean_destination()
            import_data(detected_path)
            return

    # Si falla la detección automática
    print(f"\n{Colors.WARNING}⚠️ No pude acceder automáticamente a la ruta.{Colors.ENDC}")
    print("Por favor, pega la ruta manualmente:")
    source_input = input("> ").strip().replace('"', '').replace("'", "")
    
    if source_input:
        clean_destination()
        import_data(source_input)

if __name__ == "__main__":
    main()