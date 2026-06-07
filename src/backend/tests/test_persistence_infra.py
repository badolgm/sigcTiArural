import pytest
from api.logic.adapters.persistence import DjangoRepository
from api.models import SensorReading 

@pytest.mark.django_db
def test_django_repository_guardar_y_obtener():
    repo = DjangoRepository()
    modelo_nombre = "api.SensorReading"
    
    # Creamos usando los campos reales
    objeto_original = SensorReading.objects.create(
        sensor_id="ROBOT-001", 
        temperature=20.0, 
        humidity=45.0
    )
    
    # 1. Probar obtener_por_id
    recuperado = repo.obtener_por_id(modelo_nombre, objeto_original.pk)
    assert recuperado is not None
    assert recuperado.sensor_id == "ROBOT-001"
    
    # 2. Probar guardar (actualización)
    recuperado.temperature = 50.0
    repo.guardar(recuperado)
    
    confirmado = SensorReading.objects.get(pk=objeto_original.pk)
    assert confirmado.temperature == 50.0

@pytest.mark.django_db
def test_django_repository_listar_todos():
    repo = DjangoRepository()
    modelo_nombre = "api.SensorReading"
    
    SensorReading.objects.all().delete()
    SensorReading.objects.create(sensor_id="TEST-001", temperature=10.0, humidity=20.0)
    
    lista = repo.listar_todos(modelo_nombre)
    assert len(lista) == 1
    assert lista[0].sensor_id == "TEST-001"