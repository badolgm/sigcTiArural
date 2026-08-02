"""
Tests del resolver semantico de IA (Dia 13 - contrato escalable).

Certifica el comportamiento data-driven de SemanticPredictionResolver
(infrastructure/external/ai_service/semantic_prediction_resolver.py),
aislado de HTTP: se instancia directo y se le pasan payloads crudos
como los que devuelve el ai_service.
"""

from infrastructure.external.ai_service.semantic_prediction_resolver import (
    SemanticPredictionResolver,
    _PREDICTION_FIELDS,
)


def test_class_index_0_resuelve_condicion_no_saludable():
    """class_index=0 debe resolver a plant_condition.binary.unhealthy, warning."""
    resolver = SemanticPredictionResolver()
    raw_result = {"diagnosis": "class_0", "class_index": 0, "confidence": 0.99, "model": "plant_disease_mbv2.h5", "status": "ok"}

    resolved = resolver.resolve_prediction(raw_result)
    prediction = resolved["prediction"]

    assert prediction["prediction_code"] == "plant_condition.binary.unhealthy"
    assert prediction["prediction_label"] == "Condicion no saludable detectada"
    assert prediction["health_state"] == "warning"


def test_class_index_1_resuelve_condicion_saludable():
    """class_index=1 debe resolver a plant_condition.binary.healthy, healthy."""
    resolver = SemanticPredictionResolver()
    raw_result = {"diagnosis": "class_1", "class_index": 1, "confidence": 0.95, "model": "plant_disease_mbv2.h5", "status": "ok"}

    resolved = resolver.resolve_prediction(raw_result)
    prediction = resolved["prediction"]

    assert prediction["prediction_code"] == "plant_condition.binary.healthy"
    assert prediction["prediction_label"] == "Condicion saludable detectada"
    assert prediction["health_state"] == "healthy"


def test_class_index_fuera_de_rango_cae_a_unknown_fallback():
    """class_index=99 (fuera del mapa) debe caer al fallback plant_condition.unknown."""
    resolver = SemanticPredictionResolver()
    raw_result = {"diagnosis": "class_99", "class_index": 99, "confidence": 0.5, "model": "plant_disease_mbv2.h5", "status": "ok"}

    resolved = resolver.resolve_prediction(raw_result)
    prediction = resolved["prediction"]

    assert prediction["prediction_code"] == "plant_condition.unknown"
    assert prediction["condition_group"] == "anomaly"
    assert prediction["health_state"] == "unknown"


def test_diagnosis_alias_no_se_filtra_en_la_salida():
    """diagnosis_alias es metadato interno de lookup y no debe aparecer en la salida."""
    resolver = SemanticPredictionResolver()
    raw_result = {"diagnosis": "class_0", "class_index": 0, "confidence": 0.99, "model": "plant_disease_mbv2.h5", "status": "ok"}

    resolved = resolver.resolve_prediction(raw_result)
    prediction = resolved["prediction"]

    assert "diagnosis_alias" not in prediction
    assert set(_PREDICTION_FIELDS).issubset(prediction.keys())
