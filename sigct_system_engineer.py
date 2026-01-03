import os
import sys
import json
import hashlib
from pathlib import Path
from datetime import datetime

# ==========================================
# CONFIGURACIÓN DE ARQUITECTURA ESPERADA
# ==========================================
# Aquí definimos las "Firmas Digitales" de una estructura correcta.
# No es solo que el archivo esté, es que tenga lo que debe tener.

EXPECTED_STRUCTURE = {
    "BACKEND_CORE": {
        "path": "src/backend/manage.py",
        "critical_keywords": ["django", "execute_from_command_line", "os.environ"],
        "min_size": 200  # bytes
    },
    "BACKEND_SETTINGS": {
        "path": "src/backend/sigct_backend/settings.py",
        "critical_keywords": ["INSTALLED_APPS", "DATABASES", "SECRET_KEY"],
        "min_size": 500
    },
    "FRONTEND_ROUTER": {
        "path": "src/frontend/src/App.jsx",
        "critical_keywords": ["Router", "Routes", "Route", "return", "export default"],
        "min_size": 100
    },
    "FRONTEND_CONFIG": {
        "path": "src/frontend/package.json",
        "critical_keywords": ["vite", "react", "dependencies"],
        "min_size": 100
    },
    "AI_MODEL_PRODUCTION": {
        "path": "src/ai_models/production_models/plant_disease_mbv2.h5",
        "is_binary": True,
        "min_size": 1_000_000  # Al menos 1MB para ser un modelo real
    },
    "AI_TRAINING_SCRIPT": {
        "path": "src/ai_models/train_plant_disease_mobilenet.py",
        "critical_keywords": ["tensorflow", "keras", "ImageDataGenerator", "fit"],
        "min_size": 500
    }
}

# Colores para terminal
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def analyze_file(key, config):
    path = Path(config["path"])
    
    # 1. Existencia
    if not path.exists():
        return {"status": "MISSING", "msg": f"Archivo crítico no encontrado: {path}"}
    
    # 2. Tamaño
    size = path.stat().st_size
    if size < config.get("min_size", 0):
        return {"status": "CORRUPT", "msg": f"Archivo sospechosamente pequeño ({size}b): {path}"}
    
    # 3. Análisis de Contenido (si no es binario)
    if not config.get("is_binary", False):
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                missing_keywords = []
                for kw in config.get("critical_keywords", []):
                    if kw not in content:
                        missing_keywords.append(kw)
                
                if missing_keywords:
                    return {"status": "INVALID_LOGIC", "msg": f"Falta lógica clave {missing_keywords} en {path}"}
        except Exception as e:
            return {"status": "READ_ERROR", "msg": f"No se pudo leer {path}: {str(e)}"}

    return {"status": "OK", "msg": f"Validado correctamente ({size} bytes)."}

def generate_report(results):
    report_path = "PROJECT_ENGINEERING_REPORT.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(f"# 🏗️ REPORTE DE INGENIERÍA SIGC&T\n")
        f.write(f"**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("## 1. Resumen Ejecutivo\n")
        errors = [r for r in results if r['status'] != 'OK']
        if not errors:
            f.write("✅ **ESTADO: ESTABLE.** La arquitectura base cumple con los patrones de diseño esperados.\n")
        else:
            f.write(f"❌ **ESTADO: CRÍTICO.** Se encontraron {len(errors)} violaciones de integridad.\n")
        
        f.write("\n## 2. Auditoría Detallada\n| Componente | Estado | Detalle |\n|---|---|---|\n")
        for r in results:
            icon = "✅" if r['status'] == 'OK' else "❌"
            f.write(f"| {r['component']} | {icon} {r['status']} | {r['msg']} |\n")
        
        f.write("\n## 3. Recomendaciones Técnicas\n")
        if not errors:
            f.write("- Proceder con la integración del módulo `VoiceAssistant`.\n")
            f.write("- Proceder con la integración del módulo `RobotLab`.\n")
            f.write("- Ejecutar pruebas de regresión tras la integración.\n")
        else:
            f.write("- 🛑 **DETENER DESARROLLO.** No agregar nuevas características hasta resolver los errores.\n")
            for err in errors:
                f.write(f"- Reparar `{err['component']}`: {err['msg']}\n")

    return report_path

def main():
    print(f"{Colors.HEADER}=================================================={Colors.ENDC}")
    print(f"{Colors.HEADER}   SIGC&T RURAL - SISTEMA DE INGENIERÍA V1.0      {Colors.ENDC}")
    print(f"{Colors.HEADER}=================================================={Colors.ENDC}")
    print("Iniciando análisis estático de código y estructura...\n")

    results = []
    
    # Ejecutar análisis
    for key, config in EXPECTED_STRUCTURE.items():
        print(f"🔍 Analizando {key}...", end="\r")
        result = analyze_file(key, config)
        result['component'] = key
        results.append(result)
        
        if result['status'] == 'OK':
            print(f"{Colors.OKGREEN}✅ {key:<20} -> OK{Colors.ENDC}")
        else:
            print(f"{Colors.FAIL}❌ {key:<20} -> {result['status']}{Colors.ENDC}")
            print(f"   └── {result['msg']}")

    # Generar entregable
    report_file = generate_report(results)
    
    print(f"\n{Colors.OKBLUE}📄 Reporte de Ingeniería generado: {report_file}{Colors.ENDC}")
    
    # Veredicto final
    if any(r['status'] != 'OK' for r in results):
        print(f"\n{Colors.FAIL}⛔ ALERTA: El sistema NO está listo para escalar.{Colors.ENDC}")
        print("Por favor, revisa el reporte y corrige los archivos marcados antes de solicitar nuevo código.")
    else:
        print(f"\n{Colors.OKGREEN}🚀 LUZ VERDE: Integridad estructural confirmada.{Colors.ENDC}")
        print("La base de código es sólida. Podemos proceder a inyectar los módulos de Voz y Robótica.")

if __name__ == "__main__":
    main()