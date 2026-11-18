from django.apps import AppConfig


class SigctBackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sigct_backend'

    def ready(self):
        from contexts.telemetry.infrastructure.config.dependencies import (
            get_telemetry_event_bus,
        )

        get_telemetry_event_bus()
