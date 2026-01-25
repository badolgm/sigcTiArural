import time
import math
import requests
import random
import sys

# Configuración
API_URL = "http://localhost:8000/api/robot-telemetry/"
ROBOT_ID = "PHYSICS-BOT-01"

print(f"🚀 Iniciando Simulación de Física para {ROBOT_ID}...")
print(f"📡 Enviando telemetría a: {API_URL}")

def generate_spiral_path(t):
    """Genera una trayectoria helicoidal ascendente (como un drone subiendo en espiral)"""
    radius = 10.0
    angular_speed = 0.5  # rad/s
    climb_speed = 0.2    # m/s
    
    x = radius * math.cos(angular_speed * t)
    y = radius * math.sin(angular_speed * t)
    z = climb_speed * t
    
    # Velocidad lineal tangencial (v = w * r)
    velocity = angular_speed * radius
    
    return x, y, z, velocity

try:
    start_time = time.time()
    battery = 100.0
    
    while True:
        current_time = time.time() - start_time
        
        # Calcular física
        x, y, z, velocity = generate_spiral_path(current_time)
        
        # Drenar batería basado en esfuerzo (subida consume más)
        battery -= 0.05 + (0.01 * z) 
        if battery < 0: battery = 0
        
        payload = {
            "robot": ROBOT_ID,
            "battery_level": round(battery, 2),
            "status_mode": "moving" if battery > 0 else "error",
            "position_x": round(x, 2),
            "position_y": round(y, 2),
            "position_z": round(z, 2),
            "velocity_linear": round(velocity, 2)
        }
        
        # Enviar al backend
        try:
            response = requests.post(API_URL, json=payload, timeout=1)
            if response.status_code == 201:
                sys.stdout.write(f"\r✅ Telemetría enviada: Pos({x:.1f}, {y:.1f}, {z:.1f}) | Bat: {battery:.1f}%")
                sys.stdout.flush()
            else:
                print(f"\n❌ Error API: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"\n⚠️ Error de conexión: {e}")
            
        time.sleep(1.0) # 1 Hz de frecuencia

except KeyboardInterrupt:
    print("\n🛑 Simulación detenida.")
