"""
Módulo de Contexto Conversacional para IA de Voz

Este módulo maneja el estado y contexto de las conversaciones con el asistente de voz,
permitiendo interacciones más naturales y personalizadas.
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, List
from dataclasses import dataclass, asdict

@dataclass
class UserContext:
    """Contexto del usuario para personalizar la experiencia"""
    name: str = ""
    current_page: str = "dashboard"
    last_interaction: float = 0.0
    preferences: Dict = None
    conversation_history: List[Dict] = None
    
    def __post_init__(self):
        if self.preferences is None:
            self.preferences = {}
        if self.conversation_history is None:
            self.conversation_history = []

class ConversationManager:
    """Gestiona el contexto conversacional de los usuarios"""
    
    def __init__(self, context_file: Path):
        self.context_file = context_file
        self.contexts: Dict[str, UserContext] = {}
        self.load_contexts()
    
    def load_contexts(self):
        """Carga los contextos desde el archivo"""
        if self.context_file.exists():
            try:
                with open(self.context_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for user_id, context_data in data.items():
                        self.contexts[user_id] = UserContext(**context_data)
            except Exception as e:
                print(f"Error cargando contextos: {e}")
                self.contexts = {}
    
    def save_contexts(self):
        """Guarda los contextos en el archivo"""
        try:
            data = {user_id: asdict(context) for user_id, context in self.contexts.items()}
            with open(self.context_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error guardando contextos: {e}")
    
    def get_or_create_context(self, user_id: str = "default") -> UserContext:
        """Obtiene o crea el contexto de un usuario"""
        if user_id not in self.contexts:
            self.contexts[user_id] = UserContext()
        return self.contexts[user_id]
    
    def update_context(self, user_id: str, **kwargs):
        """Actualiza el contexto del usuario"""
        context = self.get_or_create_context(user_id)
        for key, value in kwargs.items():
            if hasattr(context, key):
                setattr(context, key, value)
        context.last_interaction = time.time()
        self.save_contexts()
    
    def add_to_history(self, user_id: str, user_input: str, assistant_response: str):
        """Agrega una interacción al historial"""
        context = self.get_or_create_context(user_id)
        interaction = {
            "timestamp": time.time(),
            "user_input": user_input,
            "assistant_response": assistant_response
        }
        context.conversation_history.append(interaction)
        
        # Mantener solo las últimas 50 interacciones
        if len(context.conversation_history) > 50:
            context.conversation_history = context.conversation_history[-50:]
        
        self.save_contexts()
    
    def get_greeting_by_time(self) -> str:
        """Obtiene un saludo según la hora del día"""
        current_hour = datetime.now().hour
        
        if 6 <= current_hour < 12:
            return "¡Buenos días!"
        elif 12 <= current_hour < 18:
            return "¡Buenas tardes!"
        else:
            return "¡Buenas noches!"
    
    def get_personalized_greeting(self, user_id: str = "default") -> str:
        """Obtiene un saludo personalizado para el usuario"""
        context = self.get_or_create_context(user_id)
        base_greeting = self.get_greeting_by_time()
        
        if context.name:
            return f"{base_greeting} {context.name}, ¿en qué puedo ayudarte hoy?"
        else:
            return f"{base_greeting} Soy tu asistente de SIGC&T Rural. ¿Qué necesitas?"

# Comandos de navegación del dashboard
NAVIGATION_COMMANDS = {
    "dashboard": [
        "dashboard", "inicio", "página principal", "home", "menú principal",
        "ir al dashboard", "ve al dashboard", "muéstrame el dashboard"
    ],
    "plants": [
        "plantas", "cultivos", "vegetales", "ver plantas", "muéstrame las plantas",
        "ir a plantas", "lista de plantas", "mis plantas"
    ],
    "laboratory": [
        "laboratorio", "laboratorio de ciencia", "ciencia de datos", "lab",
        "ir al laboratorio", "muéstrame el laboratorio", "análisis de datos"
    ],
    "map": [
        "mapa", "mapa de cultivos", "ubicación", "ver mapa", "muéstrame el mapa",
        "ir al mapa", "mapa de plantas"
    ],
    "statistics": [
        "estadísticas", "estadísticas", "gráficos", "métricas", "datos",
        "ver estadísticas", "muéstrame estadísticas", "panel de control"
    ],
    "settings": [
        "configuración", "ajustes", "preferencias", "configurar", "settings",
        "ir a configuración", "muéstrame configuración"
    ]
}

# Comandos de análisis y diagnóstico
ANALYSIS_COMMANDS = {
    "analyze_plant": [
        "analizar planta", "analizar esta planta", "diagnóstico", "qué enfermedad es",
        "identificar enfermedad", "analizar imagen", "revisar planta"
    ],
    "treatment": [
        "tratamiento", "cómo tratar", "qué hacer", "solución", "curar",
        "cómo curar", "tratamiento para", "medicina"
    ],
    "history": [
        "historial", "historial de análisis", "análisis anteriores", "ver historial",
        "qué he analizado", "mis análisis"
    ]
}

# Comandos sociales y de ayuda
SOCIAL_COMMANDS = {
    "greeting": [
        "hola", "buenos días", "buenas tardes", "buenas noches", "saludos"
    ],
    "goodbye": [
        "adiós", "hasta luego", "nos vemos", "chao", "bye", "hasta pronto"
    ],
    "thanks": [
        "gracias", "muchas gracias", "te agradezco", "gracias por tu ayuda"
    ],
    "help": [
        "ayuda", "ayúdame", "qué puedes hacer", "en qué me ayudas", "funciones"
    ],
    "name": [
        "me llamo", "mi nombre es", "soy", "mi nombre", "llámame"
    ]
}

# Respuestas motivacionales
MOTIVATIONAL_RESPONSES = [
    "Tu trabajo está ayudando a mejorar la vida de los campesinos de tu región.",
    "Recuerda que cada planta que analizas nos acerca a una agricultura más inteligente.",
    "¡Excelente trabajo! Sigue así, estás haciendo la diferencia.",
    "Tu dedicación al análisis de cultivos es fundamental para el éxito del proyecto.",
    "Gracias por usar SIGC&T Rural para mejorar la agricultura de tu comunidad."
]

# Respuestas de agradecimiento
THANKS_RESPONSES = [
    "¡Con gusto! Si necesitas algo más, aquí estoy para ayudarte.",
    "No hay problema, es un placer ayudarte en tu trabajo.",
    "¡Gracias a ti por usar SIGC&T Rural! ¿Algo más en lo que pueda colaborar?",
    "Para eso estoy. ¿Qué más necesitas saber?",
    "¡Es un honor ayudarte! ¿Qué más te gustaría saber?"
]

# Funciones auxiliares
def get_time_context() -> str:
    """Obtiene el contexto temporal actual"""
    current_hour = datetime.now().hour
    
    if 6 <= current_hour < 12:
        return "mañana"
    elif 12 <= current_hour < 18:
        return "tarde"
    else:
        return "noche"

def get_seasonal_context() -> str:
    """Obtiene el contexto de temporada (si aplica)"""
    month = datetime.now().month
    
    if month in [3, 4, 5]:
        return "primavera"
    elif month in [6, 7, 8]:
        return "verano"
    elif month in [9, 10, 11]:
        return "otoño"
    else:
        return "invierno"

def classify_intent(text: str) -> tuple[str, float]:
    """
    Clasifica la intención del usuario
    Retorna: (intent_type, confidence)
    """
    text_lower = text.lower().strip()
    
    # Verificar comandos de navegación
    for section, commands in NAVIGATION_COMMANDS.items():
        for command in commands:
            if command in text_lower:
                return f"navigate_{section}", 0.9
    
    # Verificar comandos de análisis
    for analysis_type, commands in ANALYSIS_COMMANDS.items():
        for command in commands:
            if command in text_lower:
                return f"analyze_{analysis_type}", 0.9
    
    # Verificar comandos sociales
    for social_type, commands in SOCIAL_COMMANDS.items():
        for command in commands:
            if command in text_lower:
                return f"social_{social_type}", 0.8
    
    # Si no se identifica ninguna intención clara
    return "unknown", 0.5

# Crear instancia global del administrador de contexto
CONVERSATION_MANAGER = None

def get_conversation_manager() -> ConversationManager:
    """Obtiene la instancia global del administrador de contexto"""
    global CONVERSATION_MANAGER
    if CONVERSATION_MANAGER is None:
        context_file = Path(__file__).parent / "conversation_contexts.json"
        CONVERSATION_MANAGER = ConversationManager(context_file)
    return CONVERSATION_MANAGER