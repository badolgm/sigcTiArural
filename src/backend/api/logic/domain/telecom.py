from .interfaces import ProcesadorLaboratorioStrategy
from typing import Dict, Any, List
import math
import random
from datetime import datetime, timedelta

class ProcesadorTelecomunicaciones(ProcesadorLaboratorioStrategy):
    """
    Estrategia concreta para el procesamiento de datos de Telecomunicaciones.
    Incluye lógica de simulación de señales y análisis de espectro.
    """
    def procesar(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        # Simulación de análisis de señal (FFT o similar)
        senales = datos.get("senales", [])
        resultado = {
            "estado": "analizado",
            "tipo": "telecom_spectrum",
            "frecuencia_dominante": random.uniform(2.4, 5.8),
            "snr": random.uniform(10, 40)
        }
        return resultado

    def generar_historico_simulado(self, horas: int = 24) -> List[Dict[str, Any]]:
        """
        Genera datos de señales de telecomunicaciones para el dashboard.
        """
        data = []
        now = datetime.now()
        for i in range(horas):
            time_slot = now - timedelta(hours=(horas - 1) - i)
            data.append({
                "time": time_slot.strftime("%H:%M"),
                "signal_strength": round(random.uniform(-90, -30), 1),
                "noise_floor": round(random.uniform(-110, -95), 1),
                "sensor": "SDR-Simulated (Domain v2)"
            })
        return data
