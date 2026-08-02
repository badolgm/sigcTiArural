from typing import Any, Dict


CLASS_DEFINITIONS: Dict[int, Dict[str, Any]] = {
    0: {
        "diagnosis_alias": "enferma",
        "prediction_code": "plant_condition.binary.unhealthy",
        "prediction_label": "Condicion no saludable detectada",
        "plant_species": "unknown",
        "condition_name": "unhealthy",
        "condition_group": "binary_condition",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": (
            "Validar manualmente la muestra. El modelo actual solo clasifica "
            "condicion binaria enferma/sana y no identifica enfermedad especifica."
        ),
    },
    1: {
        "diagnosis_alias": "sana",
        "prediction_code": "plant_condition.binary.healthy",
        "prediction_label": "Condicion saludable detectada",
        "plant_species": "unknown",
        "condition_name": "healthy",
        "condition_group": "binary_condition",
        "health_state": "healthy",
        "severity": "none",
        "recommended_action": (
            "Mantener monitoreo preventivo. El modelo actual no identifica "
            "especie ni taxonomia especifica."
        ),
    },
}

UNKNOWN_FALLBACK: Dict[str, Any] = {
    "prediction_code": "plant_condition.unknown",
    "prediction_label": "Condicion de planta desconocida",
    "plant_species": "unknown",
    "condition_name": "unknown",
    "condition_group": "anomaly",
    "health_state": "unknown",
    "severity": "unknown",
    "recommended_action": (
        "Revisar la muestra manualmente. La salida no corresponde al espacio "
        "binario esperado del modelo actual."
    ),
}

_PREDICTION_FIELDS = (
    "prediction_code",
    "prediction_label",
    "plant_species",
    "condition_name",
    "condition_group",
    "health_state",
    "severity",
    "recommended_action",
)


class SemanticPredictionResolver:

    def resolve_prediction(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        diagnosis = str(raw_result.get("diagnosis") or "").strip()
        class_index = self._normalize_class_index(raw_result.get("class_index"))
        source_mode = self._resolve_source_mode(raw_result)
        prediction = self._resolve_semantic_prediction(diagnosis, class_index)

        prediction.update({
            "confidence": self._normalize_confidence(raw_result.get("confidence")),
            "model_id": "plant_disease_classifier",
            "model_version": self._normalize_model_version(raw_result.get("model")),
            "semantic_contract_version": "v1",
            "scientific_scope": "binary_only",
        })

        return {
            "source_mode": source_mode,
            "prediction": prediction,
        }

    def get_class_definitions(self) -> Dict[int, Dict[str, Any]]:
        """
        Fuente de las definiciones semanticas por clase (indexadas por class_index).

        TODO(Dia 13+ / multiclase): hoy devuelve CLASS_DEFINITIONS, un mapa fijo
        binario. Cuando exista un mecanismo para leer
        src/ai_models/production_models/model_metadata.json (via el ai_service
        o una config compartida -- sin montar src/ai_models/ directamente en el
        backend), este metodo es el unico punto que debe cambiar para resolver
        las clases dinamicamente en vez de este dict hardcodeado.
        """
        return CLASS_DEFINITIONS

    def _resolve_semantic_prediction(self, diagnosis: str, class_index: int) -> Dict[str, Any]:
        normalized = diagnosis.lower()
        class_definitions = self.get_class_definitions()

        for index, definition in class_definitions.items():
            if normalized == definition.get("diagnosis_alias") or class_index == index:
                return self._copy_prediction_fields(definition)

        return dict(UNKNOWN_FALLBACK)

    def _copy_prediction_fields(self, definition: Dict[str, Any]) -> Dict[str, Any]:
        return {field: definition[field] for field in _PREDICTION_FIELDS}

    def _resolve_source_mode(self, raw_result: Dict[str, Any]) -> str:
        model_name = str(raw_result.get("model") or "").lower()
        status = str(raw_result.get("status") or "").lower()

        if model_name == "mock":
            return "mock"
        if model_name == "fallback" or status == "error":
            return "fallback"
        return "cloud"

    def _normalize_confidence(self, value: Any) -> float:
        try:
            return round(float(value), 4)
        except (TypeError, ValueError):
            return 0.0

    def _normalize_class_index(self, value: Any) -> int:
        try:
            return int(value)
        except (TypeError, ValueError):
            return -1

    def _normalize_model_version(self, value: Any) -> str:
        model_name = str(value or "unknown").strip()
        if not model_name:
            return "unknown"
        if model_name.endswith(".h5"):
            return model_name[:-3]
        if model_name.endswith(".keras"):
            return model_name[:-6]
        return model_name
