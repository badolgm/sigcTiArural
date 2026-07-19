import os
import django
import pytest
from django.conf import settings

from api.logic.domain.services import LaboratorioService


def pytest_configure():
    if not settings.configured:
        # Asegúrate de que 'sigct_backend.settings' sea el nombre correcto de tu carpeta de settings
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigct_backend.settings')
        django.setup()


@pytest.fixture
def lab_service():
    return LaboratorioService("ROBOTICA")
