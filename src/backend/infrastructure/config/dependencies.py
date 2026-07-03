
from core.ports.repositories import SensorReadingRepositoryPort
from core.ports.services import AIServicePort, NotificationPort
from infrastructure.persistence.django.repositories.django_sensor_reading_repository import (
    DjangoSensorReadingRepository,
)
from infrastructure.external.ai_service.fastapi_ai_adapter import FastAPIAIAdapter
from infrastructure.external.notifications.console_notification_adapter import (
    ConsoleNotificationAdapter,
)


def get_sensor_reading_repository() -> SensorReadingRepositoryPort:
    return DjangoSensorReadingRepository()


def get_ai_service() -> AIServicePort:
    return FastAPIAIAdapter()


def get_notification_service() -> NotificationPort:
    return ConsoleNotificationAdapter()
