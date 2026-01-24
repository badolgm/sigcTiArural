from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TelemetryHistoryView, RobotViewSet, RobotTelemetryViewSet, RobotCommandViewSet

router = DefaultRouter()
router.register(r'robots', RobotViewSet)
router.register(r'robot-telemetry', RobotTelemetryViewSet)
router.register(r'robot-commands', RobotCommandViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('telemetry/history/', TelemetryHistoryView.as_view(), name='telemetry-history'),
]