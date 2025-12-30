import os
import sys
from pathlib import Path
import subprocess

# --- CONFIGURACIÓN DE FILTROS ---
# Archivos que NO queremos ver en el reporte (ruido)
IGNORE_FILES = {
    'super_audit.py', 'audit_project.py', 'master_setup.py', 
    'check_project_health.py', 'dataset_loader.py', 'super_audit_forense.py',
    'package-lock.json', 'yarn.lock', '.DS_Store', 'Thumbs.db'
}

# Carpetas que NO vamos a escanear recursivamente
IGNORE_DIRS = {
    'node_modules', 'venv', 'env', '.git', '__pycache__', 
    '.vscode', '.idea', 'dist', 'build', 'migrations'
}

# Estructura Esperada del Proyecto SIGC&T Rural
REQUIRED_STRUCTURE = {
    "CORE": [
        "README.md",
        ".gitignore",
        "docker-compose.yml" # Opcional por ahora
    ],
    "BACKEND (Django)": [
        "src/backend/manage.py",
        "src/backend/requirements.txt",
        "src/backend/sigct_backend/settings.py",
        "src/backend/sigct_backend/urls.py",
        "src/backend/api/views.py",
        "src/backend/api/models.py"
    ],
    "FRONTEND (React)": [
        "src/frontend/package.json",
        "src/frontend/vite.config.js",
        "src/frontend/src/main.jsx", # O index.jsx
        "src/frontend/src/App.jsx"
    ],
    "IA & DATA": [
        "src/ai_models/fastapi_app.py", # O en src/backend/ai_service
        "src/ai_models/train_plant_disease_mobilenet.py"
    ]
}

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_section(title):
    print(f"\n{Colors.HEADER}{'='*60}")
    print(f" {title}")
    print(f"{'='*60}{Colors.ENDC}")

def check_file_health(filepath):
    path = Path(filepath)
    if not path.exists():
        return f"{Colors.FAIL}[FALTA]{Colors.ENDC} No existe"
    
    if path.is_file():
        size = path.stat().st_size
        if size == 0:
            return f"{Colors.FAIL}[CRÍTICO]{Colors.ENDC} EXISTE PERO ESTÁ VACÍO (0 bytes)"
        return f"{Colors.OKGREEN}[OK]{Colors.ENDC} ({size} bytes)"
    return f"{Colors.OKBLUE}[OK]{Colors.ENDC} Directorio presente"

def audit_structure():
    print_section("1. VERIFICACIÓN DE ARQUITECTURA CRÍTICA")
    
    issues_found = []

    for section, files in REQUIRED_STRUCTURE.items():
        print(f"\n{Colors.BOLD}--- {section} ---{Colors.ENDC}")
        for f in files:
            status = check_file_health(f)
            print(f" {status:<40} {f}")
            if "CRÍTICO" in status or "FALTA" in status:
                issues_found.append((section, f, status))
    
    return issues_found

def scan_project_root():
    print_section("2. ESCANEO DE LIMPIEZA (Raíz)")
    print("Buscando archivos basura o mal ubicados en la raíz...")
    
    root = Path('.')
    garbage_found = False
    
    for item in root.iterdir():
        if item.is_file():
            if item.name in IGNORE_FILES:
                continue # Es un script de auditoria, lo ignoramos
            if item.name.endswith('.py') and item.name not in IGNORE_FILES:
                print(f" {Colors.WARNING}[?] Script Python suelto:{Colors.ENDC} {item.name} (¿Debería estar en src/?)")
                garbage_found = True
            elif item.name.endswith('.txt') and item.name != 'requirements.txt':
                print(f" {Colors.WARNING}[?] Texto suelto:{Colors.ENDC} {item.name}")
    
    if not garbage_found:
        print(f" {Colors.OKGREEN}Raíz limpia de archivos extraños.{Colors.ENDC}")

def check_git_status():
    print_section("3. ESTADO DEL CONTROL DE VERSIONES")
    if not Path('.git').exists():
        print(f"{Colors.FAIL}NO ES UN REPOSITORIO GIT{Colors.ENDC}")
        return

    try:
        # Check branch
        branch = subprocess.check_output("git branch --show-current", shell=True).decode().strip()
        print(f"🌿 Rama Actual: {Colors.BOLD}{branch}{Colors.ENDC}")
        
        # Check status
        status = subprocess.check_output("git status --short", shell=True).decode().strip()
        if status:
            print(f"\n{Colors.WARNING}Archivos Modificados (Sin guardar):{Colors.ENDC}")
            for line in status.split('\n'):
                print(f"  {line}")
        else:
            print(f"\n{Colors.OKGREEN}✨ El árbol de trabajo está limpio.{Colors.ENDC}")
            
    except Exception:
        print("Error ejecutando git.")

def main():
    print(f"{Colors.BOLD}AUDITORÍA FORENSE - SIGC&T RURAL v2.0{Colors.ENDC}")
    print(f"Directorio: {os.getcwd()}")
    
    # 1. Chequeo Estructural
    issues = audit_structure()
    
    # 2. Chequeo de Limpieza
    scan_project_root()
    
    # 3. Git
    check_git_status()
    
    # 4. RESUMEN Y ACCIONES
    print_section("4. DIAGNÓSTICO Y PLAN DE ACCIÓN")
    
    if not issues:
        print(f"{Colors.OKGREEN}✅ LA ESTRUCTURA PARECE SANA.{Colors.ENDC}")
        print("Puedes proceder a subir el código o entrenar la IA.")
    else:
        print(f"{Colors.FAIL}🛑 SE ENCONTRARON PROBLEMAS CRÍTICOS:{Colors.ENDC}")
        for sec, f, stat in issues:
            print(f" - {sec}: {f} -> {stat}")
        
        print(f"\n{Colors.BOLD}🔧 PASOS RECOMENDADOS:{Colors.ENDC}")
        
        # Lógica inteligente de sugerencias
        for sec, f, stat in issues:
            if "manage.py" in f and "VACÍO" in stat:
                print(f"   [1] REPARAR MANAGE.PY: El archivo existe pero está vacío.")
                print(f"       -> Copia el contenido estándar de Django manage.py o bórralo y regenera el proyecto.")
            if "fastapi_app.py" in f and "FALTA" in stat:
                print(f"   [2] UBICAR IA: Mueve 'fastapi_app.py' a 'src/ai_models/' o 'src/backend/ai_service/'.")
            if "node_modules" not in str(issues) and os.path.exists("src/frontend/package.json"):
                 # Check if node_modules exists
                 if not os.path.exists("src/frontend/node_modules"):
                     print(f"   [3] INSTALAR FRONTEND: cd src/frontend && npm install")

if __name__ == "__main__":
    main()