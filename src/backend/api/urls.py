from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TelemetryHistoryView, 
    TelemetryHistoryV2View,
    AICropAdviceView,
    RobotViewSet, 
    RobotTelemetryViewSet, 
    RobotCommandViewSet
)

router = DefaultRouter()
router.register(r'robots', RobotViewSet)
router.register(r'robot-telemetry', RobotTelemetryViewSet)
router.register(r'robot-commands', RobotCommandViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('telemetry/history/', TelemetryHistoryView.as_view(), name='telemetry-history'),
    path('v2/telemetry/history/', TelemetryHistoryV2View.as_view(), name='telemetry-history-v2'),
    path('v2/ai/crop-advice/', AICropAdviceView.as_view(), name='ai-crop-advice-v2'),
]

# ==============================================================================
# V3 ENDPOINTS (HEXAGONAL COMPLETA)
# ==============================================================================
try:
    from .views import TelemetryHistoryV3View, AICropAdviceV3View
    urlpatterns += [
        path('v3/telemetry/history/', TelemetryHistoryV3View.as_view(), name='telemetry-history-v3'),
        path('v3/ai/crop-advice/', AICropAdviceV3View.as_view(), name='ai-crop-advice-v3'),
    ]
except ImportError:
    pass

try:
    from .views import AIInferenceV3View
    urlpatterns += [
        path('v3/ai/inference/', AIInferenceV3View.as_view(), name='ai-inference-v3'),
    ]
except ImportError:
    pass
