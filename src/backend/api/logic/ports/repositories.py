from abc import ABC, abstractmethod
from typing import List, Any

class RepositoryInterface(ABC):
    """
    Puerto de Salida para la persistencia de datos.
    Desacopla el dominio del ORM de Django.
    """
    @abstractmethod
    def listar_todos(self, modelo_nombre: str) -> List[Any]:
        pass

    @abstractmethod
    def obtener_por_id(self, modelo_nombre: str, id: Any) -> Any:
        pass

    @abstractmethod
    def guardar(self, objeto: Any) -> Any:
        pass
