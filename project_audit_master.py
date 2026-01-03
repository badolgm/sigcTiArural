import os
import sys
from pathlib import Path
import json

# Colores ANSI para terminal (Git Bash / Linux / Mac)
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_status(component, status, message=""):
    if status == "OK":
        symbol = f"{Colors.GREEN}✅ OK{Colors.ENDC}"
    elif status == "WARNING":
        symbol = f"{Colors.WARNING}⚠️  ADVERTENCIA{Colors.ENDC}"
    elif status == "FAIL":
        symbol = f"{Colors.FAIL}❌ CRÍTICO{Colors.ENDC}"
    else:
        symbol = f"{Colors.BLUE}ℹ️  INFO{Colors.ENDC}"
    
    print(f"{symbol:<20} | {Colors.BOLD}{component:<30}{Colors.ENDC} | {message}")

def check_file_integrity(path_str, min_size_bytes=10, critical_content=None):
    p = Path(path_str)
    if not p.exists():
        return "FAIL", "No existe"
    
    try:
        size = p.stat().st_size
        if size < min_size_bytes:
            return "FAIL", f"Archivo vacío o corrupto ({size} bytes)"
        
        if critical_content:
            with open(p, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if critical_content not in content:
                    return "WARNING", f"Falta contenido clave: '{critical_content}'"
        
        return "OK", f"Válido ({size} bytes)"
    except Exception as e:
        return "FAIL", f"Error de lectura: {str(e)}"

def main():
    ROOT = Path.cwd()
    print(f"{Colors.HEADER}{'='*80}")
    print(f"   AUDITORÍA DE INGENIERÍA DE SOFTWARE: SIGC&T RURAL")
    print(f"   Ruta: {ROOT}")
    print(f"{'='*80}{Colors.ENDC}\n")

    overall_health = True

    # --- 1. AUDITORÍA DEL BACKEND (DJANGO) ---
    print(f"{Colors.CYAN}--- [1] BACKEND (DJANGO) ---{Colors.ENDC}")
    
    # manage.py
    status, msg = check_file_integrity("src/backend/manage.py", min_size_bytes=50, critical_content="execute_from_command_line")
    print_status("manage.py", status, msg)
    if status == "FAIL": overall_health = False

    # settings.py
    status, msg = check_file_integrity("src/backend/sigct_backend/settings.py", min_size_bytes=100, critical_content="INSTALLED_APPS")
    print_status("settings.py", status, msg)

    # requirements.txt
    status, msg = check_file_integrity("src/backend/requirements.txt", min_size_bytes=20, critical_content="django")
    print_status("requirements.txt", status, msg)
    
    # Entorno Virtual
    if (ROOT / "venv").exists() or (ROOT / ".venv").exists():
        print_status("Entorno Virtual (venv)", "OK", "Detectado")
    else:
        print_status("Entorno Virtual (venv)", "WARNING", "No detectado en la raíz")

    # --- 2. AUDITORÍA DE INTELIGENCIA ARTIFICIAL ---
    print(f"\n{Colors.CYAN}--- [2] MOTOR DE IA (TENSORFLOW) ---{Colors.ENDC}")
    
    # Script de entrenamiento
    status, msg = check_file_integrity("src/ai_models/train_plant_disease_mobilenet.py", min_size_bytes=100)
    print_status("Script Entrenamiento", status, msg)

    # Servicio FastAPI
    status, msg = check_file_integrity("src/ai_models/fastapi_app.py", min_size_bytes=100, critical_content="FastAPI")
    print_status("Servicio FastAPI", status, msg)

    # Modelo Entrenado (.h5)
    model_path = Path("src/ai_models/production_models/plant_disease_mbv2.h5")
    if model_path.exists():
        size_mb = model_path.stat().st_size / (1024 * 1024)
        if size_mb > 1:
            print_status("Modelo .h5", "OK", f"Encontrado ({size_mb:.2f} MB)")
        else:
            print_status("Modelo .h5", "WARNING", f"Tamaño sospechoso ({size_mb:.2f} MB)")
    else:
        print_status("Modelo .h5", "FAIL", "No se encuentra el modelo entrenado")
        overall_health = False

    # --- 3. AUDITORÍA DEL FRONTEND (REACT) ---
    print(f"\n{Colors.CYAN}--- [3] FRONTEND (REACT + VITE) ---{Colors.ENDC}")
    
    # package.json
    status, msg = check_file_integrity("src/frontend/package.json", min_size_bytes=50, critical_content="vite")
    print_status("package.json", status, msg)

    # App.jsx
    status, msg = check_file_integrity("src/frontend/src/App.jsx", min_size_bytes=50)
    print_status("App.jsx", status, msg)

    # Dashboard.jsx
    status, msg = check_file_integrity("src/frontend/src/pages/Dashboard.jsx", min_size_bytes=50)
    print_status("Dashboard.jsx", status, msg)

    # Node Modules
    if (ROOT / "src/frontend/node_modules").exists():
        print_status("Dependencias (node_modules)", "OK", "Instaladas")
    else:
        print_status("Dependencias (node_modules)", "FAIL", "Faltan (Ejecutar 'npm install')")
        overall_health = False

    # --- 4. CONTROL DE VERSIONES E HIGIENE ---
    print(f"\n{Colors.CYAN}--- [4] GESTIÓN DE CONFIGURACIÓN ---{Colors.ENDC}")
    
    # .gitignore
    status, msg = check_file_integrity(".gitignore", min_size_bytes=10)
    print_status(".gitignore", status, msg)

    # Carpetas de datos
    data_dir = ROOT / "data"
    if data_dir.exists():
        print_status("Directorio Data", "OK", "Existe")
    else:
        print_status("Directorio Data", "WARNING", "No existe")

    print(f"\n{Colors.HEADER}{'='*80}{Colors.ENDC}")
    
    if overall_health:
        print(f"{Colors.GREEN}✅ ESTADO DEL SISTEMA: SALUDABLE{Colors.ENDC}")
        print("   El sistema está listo para agregar nuevas características (Voz/Robótica).")
    else:
        print(f"{Colors.FAIL}❌ ESTADO DEL SISTEMA: REQUIERE ATENCIÓN{Colors.ENDC}")
        print("   Revisa los elementos marcados como CRÍTICO antes de continuar.")
        print("   Específicamente, revisa si 'manage.py' está vacío o si falta 'node_modules'.")

if __name__ == "__main__":
    main()