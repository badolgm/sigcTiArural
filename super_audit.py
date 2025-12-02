import os
import sys

# Configurar salida UTF-8 para evitar errores de consola en Windows
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def print_separator(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def check_file_content(filepath):
    """Lee un archivo y muestra un resumen de su estado."""
    try:
        if not os.path.exists(filepath):
            return "❌ NO EXISTE"
        
        size = os.path.getsize(filepath)
        if size == 0:
            return "⚠️ EXISTE PERO ESTÁ VACÍO (0 bytes)"
            
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            preview = content[:200].replace('\n', ' ')
            if len(content) > 200:
                preview += "..."
            return f"✅ OK ({size} bytes) - Inicio: {preview}"
    except Exception as e:
        return f"⚠️ Error al leer: {str(e)}"

def audit_project(root_dir):
    print_separator(f"AUDITORÍA FORENSE DEL PROYECTO: {os.path.basename(os.path.abspath(root_dir))}")
    
    # 1. Estructura de Directorios Esperada (Arquitectura Definida)
    expected_structure = {
        "Backend (Django)": [
            os.path.join("src", "backend", "manage.py"),
            os.path.join("src", "backend", "sigct_backend", "settings.py"),
            os.path.join("src", "backend", "api", "models.py"),
            os.path.join("src", "backend", "api", "views.py"),
        ],
        "Frontend (React+Vite)": [
            os.path.join("src", "frontend", "package.json"),
            os.path.join("src", "frontend", "vite.config.js"),
            os.path.join("src", "frontend", "index.html"), # En Vite suele estar en la raíz de frontend
            os.path.join("src", "frontend", "public"),     # Opcional en Vite si no hay assets
            os.path.join("src", "frontend", "src", "main.jsx"),
        ],
        "IA Service": [
            os.path.join("src", "backend", "ai_service", "fastapi_app.py"),
        ]
    }

    print("\n[1] VERIFICACIÓN DE ARCHIVOS CRÍTICOS:")
    for component, files in expected_structure.items():
        print(f"\n  -- {component} --")
        for rel_path in files:
            full_path = os.path.join(root_dir, rel_path)
            status = check_file_content(full_path)
            print(f"  [{'OK' if '✅' in status else 'MISSING'}] {rel_path:<45} -> {status}")

    # 2. Barrido Completo de Archivos Relevantes
    print_separator("[2] CONTENIDO DETALLADO DE ARCHIVOS DE CÓDIGO")
    
    ignore_dirs = {
        'node_modules', '.git', '__pycache__', 'venv', 'env', 
        '.idea', '.vscode', 'dist', 'build', 'migrations', 'static',
        'backups', 'preview', 'assets' # Ignoramos assets binarios
    }
    target_exts = {'.py', '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.sql'}

    for root, dirs, files in os.walk(root_dir):
        # Limpiar directorios ignorados
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for file in files:
            _, ext = os.path.splitext(file)
            if ext.lower() in target_exts:
                filepath = os.path.join(root, file)
                # Ignorar archivos raíz que no sean código fuente clave
                if root == root_dir and file not in ['README.md', 'docker-compose.yml']:
                     # Solo mostrar código dentro de src o configs
                     pass

                print(f"\n------ 📄 {filepath} ------")
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        if not content.strip():
                            print("   [VACÍO]")
                        else:
                            # Mostrar primeras 50 líneas o todo si es corto
                            lines = content.splitlines()
                            print(f"   Lineas: {len(lines)} | Tamaño: {os.path.getsize(filepath)} bytes")
                            print("   --------------------------------------------------")
                            print("\n".join(lines[:50])) 
                            if len(lines) > 50:
                                print(f"\n   ... [Continúan {len(lines)-50} líneas más] ...")
                except Exception as e:
                    print(f"   [ERROR DE LECTURA]: {e}")

if __name__ == '__main__':
    audit_project('.')