import os
import shutil
from pathlib import Path

# --- CONFIGURACIÓN ---
ROOT_DIR = Path.cwd()

# 1. MOVER ARCHIVOS A SU LUGAR (Arquitectura)
MOVES = {
    "fastapi_app.py": "src/ai_models/fastapi_app.py",
    "train_plant_disease_mobilenet.py": "src/ai_models/train_plant_disease_mobilenet.py",
    "prepare_plant_disease_dataset.py": "src/ai_models/prepare_plant_disease_dataset.py",
    "map_project.py": "docs/architecture/map_project.py" # Si existe, lo guardamos en docs
}

# 2. BORRAR BASURA (Limpieza)
# Estos archivos se eliminarán para limpiar tu entorno.
TRASH = [
    "master_setup.py",
    "dataset_loader.py",
    "check_project_health.py",
    "super_audit.py",
    "audit_project.py",
    "auditoria_completa.txt",
    "reporte_codigo.txt",
    "fix_docs_mermaid.mjs", # Si ya cumplió su función
    "generate_readme.mjs"   # Si ya cumplió su función
]

# Script que se DEBE CONSERVAR
KEEP = "super_audit_forense.py"

class Colors:
    HEADER = '\033[95m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'

def main():
    print(f"{Colors.HEADER}=== LIMPIEZA Y REPARACIÓN DE ESTRUCTURA ==={Colors.ENDC}")
    
    # 1. Crear carpetas si no existen
    os.makedirs(ROOT_DIR / "src" / "ai_models", exist_ok=True)
    os.makedirs(ROOT_DIR / "docs" / "architecture", exist_ok=True)

    # 2. Mover archivos mal ubicados
    print(f"\n{Colors.OKGREEN}>>> Organizando Archivos...{Colors.ENDC}")
    for src_name, dest_rel in MOVES.items():
        src = ROOT_DIR / src_name
        dest = ROOT_DIR / dest_rel
        
        if src.exists():
            try:
                shutil.move(str(src), str(dest))
                print(f" ✅ Movido: {src_name} -> {dest_rel}")
            except Exception as e:
                print(f" ❌ Error moviendo {src_name}: {e}")
        else:
            # Si no está en la raíz, verificamos si ya está en el destino
            if dest.exists():
                print(f" ℹ️  {src_name} ya estaba en su lugar.")
            else:
                print(f" ⚠️  No se encontró {src_name} en la raíz.")

    # 3. Eliminar scripts basura
    print(f"\n{Colors.WARNING}>>> Eliminando Scripts Obsoletos...{Colors.ENDC}")
    for item in TRASH:
        path = ROOT_DIR / item
        if path.exists():
            try:
                if path.is_dir():
                    shutil.rmtree(path)
                else:
                    os.remove(path)
                print(f" 🗑️  Eliminado: {item}")
            except Exception as e:
                print(f" ❌ Error eliminando {item}: {e}")
    
    print(f"\n{Colors.OKGREEN}>>> CONSERVANDO: {KEEP} (Tu auditor oficial){Colors.ENDC}")
    print("\n✅ Limpieza completada.")
    print("👉 Ahora ejecuta: python super_audit_forense.py")

if __name__ == "__main__":
    main()