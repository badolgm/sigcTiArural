from django.urls import path
from .views import TelemetryHistoryView

urlpatterns = [
    path('telemetry/history/', TelemetryHistoryView.as_view(), name='telemetry-history'),
]