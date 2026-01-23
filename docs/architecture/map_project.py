import os

def print_tree(startpath):
    # Carpetas a ignorar
    IGNORE_DIRS = {
        'node_modules', '.git', '__pycache__', 'venv', 'env', 
        '.idea', '.vscode', 'dist', 'build', 'migrations', 'static'
    }
    
    # Archivos a ignorar
    IGNORE_FILES = {
        '.DS_Store', 'package-lock.json', 'yarn.lock', '.gitignore'
    }

    print(f"📂 RUTA: {os.path.abspath(startpath)}")

    for root, dirs, files in os.walk(startpath):
        # Filtrar carpetas ignoradas
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        level = root.replace(startpath, '').count(os.sep)
        indent = '    ' * level
        
        # Imprimir carpeta
        print(f"{indent}📁 {os.path.basename(root)}/")
        
        # Imprimir archivos
        subindent = '    ' * (level + 1)
        for f in files:
            if f not in IGNORE_FILES:
                print(f"{subindent}├── {f}")

if __name__ == '__main__':
    print_tree('.')