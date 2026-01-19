import sys
import importlib.util

# Lista de herramientas críticas del "Cerebro" (Backend/IA)
TOOLS = {
    "tensorflow": "Motor de IA",
    "fastapi": "API del Backend",
    "uvicorn": "Servidor Web",
    "PIL": "Procesamiento de Imágenes (Pillow)",
    "numpy": "Cálculo Matemático",
    "django": "Gestión de Usuarios (Opcional)"
}

def check_installation():
    print(f"\n🔍 DIAGNÓSTICO DE HERRAMIENTAS - SIGC&T RURAL")
    print(f"   Python actual: {sys.executable}")
    print("-" * 50)
    
    all_good = True
    
    for package, name in TOOLS.items():
        # Truco para verificar si está instalado sin importar todo (es más rápido)
        spec = importlib.util.find_spec(package)
        if spec is not None:
            print(f"✅ {name:<30} -> INSTALADO")
        else:
            print(f"❌ {name:<30} -> FALTA")
            all_good = False
            
    print("-" * 50)
    
    if all_good:
        print("🚀 ¡TODO LISTO! No necesitas instalar nada más.")
        print("   Siguiente paso: Entrenar la IA o Iniciar el Servidor.")
    else:
        print("⚠️ FALTAN HERRAMIENTAS.")
        print("   Por favor ejecuta: pip install -r src/backend/requirements.txt")

if __name__ == "__main__":
    check_installation()