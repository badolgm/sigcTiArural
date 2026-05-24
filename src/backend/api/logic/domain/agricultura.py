from .interfaces import ProcesadorLaboratorioStrategy
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random

class ProcesadorAgricultura(ProcesadorLaboratorioStrategy):
    """
    Estrategia de Dominio para el laboratorio de Agricultura + IA.
    Contiene la lógica de negocio para análisis de cultivos y variables agronómicas.
    """
    def procesar(self, datos: Dict[str, Any]) -> Dict[str, Any]:
        temp = datos.get("temperature", 0)
        hum = datos.get("humidity", 0)
        imagen_analizada = datos.get("imagen_analizada", False)
        
        # Lógica de negocio: Evaluación de estrés hídrico/térmico
        estres = "Bajo"
        enfermedad_detectada = None
        
        if temp > 35 or hum < 30:
            estres = "Crítico"
        elif temp > 30 or hum < 45:
            estres = "Moderado"

        # Simulación de detección de enfermedades específicas (Roya, Tizón, etc.)
        # En una integración real, esto vendría del adaptador de IA
        if imagen_analizada:
            # Ejemplo de identificación de patógenos específicos
            posibles_patogenos = ["Roya del Café", "Tizón Tardío", "Cacao: Moniliasis", "Sana"]
            enfermedad_detectada = random.choice(posibles_patogenos)

        return {
            "estado": "analizado",
            "tipo": "agricultura_analisis",
            "nivel_estres": estres,
            "enfermedad": enfermedad_detectada,
            "sugerencia_riego": hum < 50,
            "timestamp_analisis": datetime.now().isoformat()
        }

    def generar_historico_simulado(self, horas: int = 24) -> List[Dict[str, Any]]:
        """
        Genera datos históricos específicos para el sector agrícola.
        """
        data = []
        now = datetime.now()
        # Valores base típicos de un cultivo de café o cacao
        temp, hum = 22.0, 75.0
        for i in range(horas):
            time_slot = now - timedelta(hours=(horas - 1) - i)
            # Simulación de ciclo circadiano (más calor al mediodía)
            hora_del_dia = time_slot.hour
            calor_solar = 5 * (1 - abs(hora_del_dia - 13) / 12)
            
            current_temp = temp + calor_solar + random.uniform(-1, 1)
            current_hum = hum - (calor_solar * 2) + random.uniform(-2, 2)
            
            data.append({
                "time": time_slot.strftime("%H:%M"),
                "temp": round(current_temp, 1),
                "humidity": round(current_hum, 1),
                "sensor": "AgroNode-Sim (Domain v2)"
            })
        return data
