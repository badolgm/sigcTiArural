
from .lab_strategy import LabStrategy
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random


class RoboticsStrategy(LabStrategy):
    """
    Estrategia concreta para el procesamiento de datos del laboratorio de Robótica.
    """

    def procesar(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "estado": "procesado",
            "tipo": "robotica_telemetria",
            "resultado": datos
        }

    def generar_historico_simulado(self, horas: int = 24) -> List[Dict[str, Any]]:
        data = []
        now = datetime.now()
        temp, hum = 24.0, 65.0
        for i in range(horas):
            time_slot = now - timedelta(hours=(horas - 1) - i)
            temp += random.uniform(-1, 1)
            hum += random.uniform(-2, 2)
            data.append({
                "time": time_slot.strftime("%H:%M"),
                "temp": round(temp, 1),
                "humidity": round(hum, 1),
                "sensor": "Simulado (Domain v2)"
            })
        return data
