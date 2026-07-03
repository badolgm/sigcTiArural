
class DomainException(Exception):
    """Excepción base para todas las excepciones de dominio."""
    pass


class InvalidTemperatureError(DomainException):
    """Excepción lanzada cuando la temperatura está fuera de rango."""
    pass


class InvalidHumidityError(DomainException):
    """Excepción lanzada cuando la humedad está fuera de rango."""
    pass


class InvalidSensorIdError(DomainException):
    """Excepción lanzada cuando el ID del sensor es inválido."""
    pass
