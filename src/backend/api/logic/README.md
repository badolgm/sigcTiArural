# Arquitectura Hexagonal - SIGC&T-Rural

Este paquete contiene la implementación de la **Arquitectura Hexagonal (Puertos y Adaptadores)** para el backend del proyecto.

## Estructura de Capas

### 1. Dominio (`/domain`)
Contiene las reglas de negocio puras. Es **Python Puro**, lo que significa que no debe importar nada de Django, bases de datos o librerías externas de infraestructura.
- `interfaces.py`: Contratos de dominio.
- `services.py`: Servicios que coordinan la lógica.
- `robotica.py`, `agricultura.py`, etc: Implementaciones de lógica específica.

### 2. Puertos (`/ports`)
Interfaces que definen cómo el dominio se comunica con el mundo exterior (Entrada/Salida).
- `repositories.py`: Interfaz para persistencia de datos.
- `ai_service.py`: Interfaz para el servicio de Inteligencia Artificial.

### 3. Adaptadores (`/adapters`)
Implementaciones concretas de los puertos. Aquí es donde se integra con la tecnología.
- `persistence.py`: Implementación usando el ORM de Django.
- `ai_service.py`: Implementación usando peticiones HTTP a FastAPI.

## Cómo extender el sistema
Para añadir un nuevo laboratorio:
1. Crea una nueva clase en `domain/` que herede de `ProcesadorLaboratorioStrategy`.
2. Regístrala en `domain/factories.py`.
3. ¡Listo! El sistema la reconocerá automáticamente sin tocar las vistas de Django.

## Guía de Estilo (Clean Code)
- Mantén el dominio libre de dependencias externas.
- Usa inyección de dependencias (puertos) para hablar con la infraestructura.
- Cada clase debe tener una única responsabilidad.
