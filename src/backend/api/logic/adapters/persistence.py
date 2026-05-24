from ..ports.repositories import RepositoryInterface
from django.apps import apps
from typing import List, Any

class DjangoRepository(RepositoryInterface):
    """
    Adaptador de Persistencia que implementa RepositoryInterface usando el ORM de Django.
    """
    def listar_todos(self, modelo_nombre: str) -> List[Any]:
        # El nombre del modelo debe ser 'api.SensorReading' o similar
        app_label, model_name = modelo_nombre.split('.')
        model = apps.get_model(app_label, model_name)
        return list(model.objects.all())

    def obtener_por_id(self, modelo_nombre: str, id: Any) -> Any:
        app_label, model_name = modelo_nombre.split('.')
        model = apps.get_model(app_label, model_name)
        return model.objects.filter(pk=id).first()

    def guardar(self, objeto: Any) -> Any:
        # Aquí se asume que el objeto es una instancia de un modelo de Django
        # En una arquitectura hexagonal más estricta, mapearíamos de Entidad de Dominio a Modelo de Django
        objeto.save()
        return objeto
