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
    CLASS_DEFINITIONS_V2,
    MODEL_CONTRACT_VERSION_MULTICLASS,
    TAXONOMY_VERSION_MULTICLASS,
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


# ---------------------------------------------------------------------------
# AI-R4: coexistencia de contratos v1 (binario) y v2 (multiclase 16)
# ---------------------------------------------------------------------------


def _v2_raw_result(**overrides):
    """Payload tipico de /infer cuando el ai_service sirve M2 (ONNX, 16 clases)."""
    raw = {
        "diagnosis": "class_5",
        "class_index": 5,
        "confidence": 0.88,
        "model": "model.onnx",
        "status": "ok",
        "model_contract_version": MODEL_CONTRACT_VERSION_MULTICLASS,
        "class_space": 16,
        "model_status": "NO_DECLARADO",
        "scientific_scope": "unknown",
        "class_labels": [],
    }
    raw.update(overrides)
    return raw


def test_catalogo_v2_tiene_16_clases_y_respeta_el_orden_imagefolder():
    """El mapa v2 debe tener 16 clases en el orden verificado (class_index_map)."""
    assert len(CLASS_DEFINITIONS_V2) == 16
    assert CLASS_DEFINITIONS_V2[0]["canonical_class_id"] == "corn__cercospora_gray_leaf_spot"
    assert CLASS_DEFINITIONS_V2[2]["canonical_class_id"] == "corn__healthy"
    assert CLASS_DEFINITIONS_V2[5]["canonical_class_id"] == "potato__healthy"
    assert CLASS_DEFINITIONS_V2[9]["canonical_class_id"] == "tomato__healthy"
    assert CLASS_DEFINITIONS_V2[15]["canonical_class_id"] == "tomato__yellow_leaf_curl_virus"


def test_v1_sin_declaracion_de_contrato_sigue_siendo_binario():
    """Sin model_contract_version ni class_space, el modo cae a v1 (fail-closed)."""
    resolver = SemanticPredictionResolver()
    raw_result = {"diagnosis": "class_0", "class_index": 0, "confidence": 0.99, "model": "plant_disease_mbv2.h5", "status": "ok"}

    resolved = resolver.resolve_prediction(raw_result)
    prediction = resolved["prediction"]

    assert resolved["contract_version"] == "v1"
    assert resolved["model_contract_version"] == "binary_only"
    assert prediction["semantic_contract_version"] == "v1"
    assert prediction["scientific_scope"] == "binary_only"
    assert prediction["prediction_code"] == "plant_condition.binary.unhealthy"


def test_v1_explicito_binary_only_no_se_asciende_a_multiclase():
    """model_contract_version=binary_only mantiene v1 aunque llegue class_space=16."""
    resolver = SemanticPredictionResolver()
    raw_result = {
        "diagnosis": "class_0",
        "class_index": 0,
        "model": "plant_disease_mbv2.h5",
        "status": "ok",
        "model_contract_version": "binary_only",
        "class_space": 16,
    }

    resolved = resolver.resolve_prediction(raw_result)

    assert resolved["contract_version"] == "v1"
    assert resolved["prediction"]["scientific_scope"] == "binary_only"


def test_v2_por_model_contract_version_resuelve_clase_real():
    """class_index=5 => potato__healthy con semantica v2 completa."""
    resolver = SemanticPredictionResolver()

    resolved = resolver.resolve_prediction(_v2_raw_result())
    prediction = resolved["prediction"]

    assert resolved["contract_version"] == "v2"
    assert resolved["model_contract_version"] == MODEL_CONTRACT_VERSION_MULTICLASS
    assert prediction["prediction_code"] == "agriculture.potato.healthy.healthy"
    assert prediction["prediction_label"] == "Papa - Sana"
    assert prediction["plant_species"] == "potato"
    assert prediction["condition_name"] == "healthy"
    assert prediction["condition_group"] == "healthy"
    assert prediction["health_state"] == "healthy"
    assert prediction["canonical_class_id"] == "potato__healthy"
    assert prediction["class_index"] == 5
    assert prediction["taxonomy_version"] == TAXONOMY_VERSION_MULTICLASS
    assert prediction["semantic_contract_version"] == "v2"
    assert prediction["scientific_scope"] == "multiclass16"


def test_v2_resuelve_enfermedad_especifica():
    """class_index=15 => virus del rizado amarillo del tomate."""
    resolver = SemanticPredictionResolver()

    resolved = resolver.resolve_prediction(_v2_raw_result(diagnosis="class_15", class_index=15))
    prediction = resolved["prediction"]

    assert prediction["prediction_code"] == "agriculture.tomato.disease.yellow_leaf_curl_virus"
    assert prediction["plant_species"] == "tomato"
    assert prediction["condition_group"] == "disease"
    assert prediction["health_state"] == "warning"
    assert prediction["canonical_class_id"] == "tomato__yellow_leaf_curl_virus"


def test_v2_por_class_space_sin_declaracion_de_contrato():
    """R4-PLU: class_space=16 basta para detectar v2 aunque falte el eco."""
    resolver = SemanticPredictionResolver()
    raw_result = {"diagnosis": "class_9", "class_index": 9, "model": "model.onnx", "status": "ok", "class_space": 16}

    resolved = resolver.resolve_prediction(raw_result)

    assert resolved["contract_version"] == "v2"
    assert resolved["prediction"]["canonical_class_id"] == "tomato__healthy"


def test_v2_por_extension_onnx_sin_class_space():
    """Sin class_space, el nombre .onnx sigue declarando el modo multiclase."""
    resolver = SemanticPredictionResolver()
    raw_result = {"diagnosis": "class_2", "class_index": 2, "model": "model.onnx", "status": "ok"}

    resolved = resolver.resolve_prediction(raw_result)

    assert resolved["contract_version"] == "v2"
    assert resolved["prediction"]["canonical_class_id"] == "corn__healthy"


def test_v2_por_diagnosis_alias_sin_class_index():
    """Si falta class_index, el alias class_<n> del mapa v2 resuelve igual."""
    resolver = SemanticPredictionResolver()
    raw_result = _v2_raw_result(diagnosis="class_13", class_index=None)

    resolved = resolver.resolve_prediction(raw_result)

    assert resolved["contract_version"] == "v2"
    assert resolved["prediction"]["canonical_class_id"] == "tomato__septoria_leaf_spot"


def test_v2_class_index_fuera_de_rango_cae_a_unknown_fallback():
    """En v2, un indice desconocido cae al fallback (no inventa clase)."""
    resolver = SemanticPredictionResolver()

    resolved = resolver.resolve_prediction(_v2_raw_result(diagnosis="class_99", class_index=99))
    prediction = resolved["prediction"]

    assert resolved["contract_version"] == "v2"
    assert prediction["prediction_code"] == "plant_condition.unknown"
    assert prediction["condition_group"] == "anomaly"
    assert prediction["health_state"] == "unknown"
    assert prediction["canonical_class_id"] is None


def test_trazabilidad_v2_presente_y_v1_null():
    """Los 3 campos de trazabilidad existen en ambos modos; en v1 viajan null."""
    resolver = SemanticPredictionResolver()

    v2 = resolver.resolve_prediction(_v2_raw_result())["prediction"]
    v1 = resolver.resolve_prediction(
        {"diagnosis": "class_0", "class_index": 0, "model": "plant_disease_mbv2.h5", "status": "ok"}
    )["prediction"]

    for field in ("canonical_class_id", "class_index", "taxonomy_version"):
        assert field in v2
        assert field in v1

    assert v1["canonical_class_id"] is None
    assert v1["class_index"] is None
    assert v1["taxonomy_version"] is None
    assert set(_PREDICTION_FIELDS).issubset(v1.keys())
    assert set(_PREDICTION_FIELDS).issubset(v2.keys())


def test_sobre_v2_no_se_confunde_con_binario():
    """Regresion R-EXEC-1: un indice 0/1 en v2 NO debe etiquetarse como enferma/sana."""
    resolver = SemanticPredictionResolver()

    resolved = resolver.resolve_prediction(_v2_raw_result(diagnosis="class_0", class_index=0))
    prediction = resolved["prediction"]

    assert prediction["prediction_code"] == "agriculture.corn.disease.cercospora_gray_leaf_spot"
    assert prediction["prediction_code"] != "plant_condition.binary.unhealthy"
    assert prediction["canonical_class_id"] == "corn__cercospora_gray_leaf_spot"
