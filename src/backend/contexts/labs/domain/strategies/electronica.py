from .base import ProcesadorLaboratorioStrategy
from typing import Dict, Any, List
import random
from datetime import datetime, timedelta

class ProcesadorElectronica(ProcesadorLaboratorioStrategy):
    """
    Estrategia de Dominio para el laboratorio de Electrónica.
    Maneja la lógica de análisis de circuitos y gemelos digitales.
    """
    def procesar(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        # Simulación de análisis de topología de circuito
        nodos = datos.get("nodos", 0)
        componentes = datos.get("componentes", [])

        # Lógica de negocio: Análisis básico de Ley de Ohm / Kirchhoff simulado
        voltaje_total = sum([c.get("v", 0) for c in componentes])
        corriente_estimada = voltaje_total / max(len(componentes), 1)

        return {
            "estado": "simulado",
            "tipo": "electronica_circuit_analysis",
            "nodos_detectados": nodos,
            "corriente_estimada_ma": round(corriente_estimada * 1000, 2),
            "estabilidad": "Alta" if nodos < 10 else "Compleja"
        }

    def generar_historico_simulado(self, horas: int = 24) -> List[Dict[str, Any]]:
        """
        Genera datos de telemetría para instrumentación electrónica (Osciloscopio/Multímetro).
        """
        data = []
        now = datetime.now()
        for i in range(horas):
            time_slot = now - timedelta(hours=(horas - 1) - i)
            data.append({
                "time": time_slot.strftime("%H:%M"),
                "v_out": round(random.uniform(3.2, 3.4), 3),
                "i_load_ma": round(random.uniform(150, 450), 1),
                "temp_mosfet": round(random.uniform(40, 65), 1),
                "sensor": "DigitalTwin-V2"
            })
        return data
