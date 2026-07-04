import warnings
import functools

def deprecated_legacy(message="Esta funcionalidad pertenece a la estructura legacy y será refactorizada."):
    """Decorador para marcar funciones o clases como legacy/deprecated."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            warnings.warn(f"DEPRECATED: {message}", category=DeprecationWarning, stacklevel=2)
            return func(*args, **kwargs)
        return wrapper
    return decorator
