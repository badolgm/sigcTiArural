from typing import Any, Dict, Optional


# ---------------------------------------------------------------------------
# Procedencia del artefacto (L-2, D-L1 / D-L4)
# ---------------------------------------------------------------------------
# Vocabulario cerrado. Cualquier valor ausente o desconocido cae a
# NO_DECLARADO: el backend nunca eleva un artefacto a historico ni a canonico
# por su cuenta.
MODEL_STATUS_HISTORICO = "HISTORICO"
MODEL_STATUS_CANONICO = "CANONICO"
MODEL_STATUS_NO_DECLARADO = "NO_DECLARADO"
MODEL_STATUS_INCONSISTENTE = "INCONSISTENTE"
MODEL_STATUS_NO_DISPONIBLE = "NO_DISPONIBLE"

MODEL_STATUS_VALUES = (
    MODEL_STATUS_HISTORICO,
    MODEL_STATUS_CANONICO,
    MODEL_STATUS_NO_DECLARADO,
    MODEL_STATUS_INCONSISTENTE,
    MODEL_STATUS_NO_DISPONIBLE,
)
MODEL_STATUS_DEFAULT = MODEL_STATUS_NO_DECLARADO

# Unico alias documental aceptado (D-L1). El runtime emite siempre HISTORICO.
MODEL_STATUS_ALIASES = {"HISTORICAL": MODEL_STATUS_HISTORICO}

INFERENCE_ORIGIN_LOCAL = "local_container"


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
            # L-2: procedencia del artefacto (nunca se infiere del nombre de archivo)
            "model_status": self._normalize_model_status(raw_result.get("model_status")),
            "model_sha256": self._normalize_sha256(raw_result.get("model_sha256")),
            "artifact_id": self._normalize_artifact_id(raw_result.get("artifact_id")),
            "class_space": self._normalize_class_space(raw_result.get("class_space")),
            "class_labels": self._normalize_class_labels(raw_result.get("class_labels")),
            "superseded_by": self._normalize_optional_text(raw_result.get("superseded_by")),
        })

        return {
            "source_mode": source_mode,
            "prediction": prediction,
            # L-2: eje separado del resultado de la inferencia (D-L4).
            "trace": {
                "model_file": self._normalize_model_filename(raw_result.get("model")),
                "inference_executed": self._resolve_inference_executed(raw_result),
                "inference_origin": INFERENCE_ORIGIN_LOCAL,
            },
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

    # ------------------------------------------------------------------
    # L-2: normalizadores de procedencia (fail-closed)
    # ------------------------------------------------------------------

    def _normalize_model_status(self, value: Any) -> str:
        """Estado de procedencia dentro del vocabulario cerrado.

        Acepta el enum en cualquier capitalizacion y el alias documental
        HISTORICAL (D-L1). Todo lo demas -- None, "", "OK", "real" -- cae a
        NO_DECLARADO, de modo que un ai_service antiguo nunca se interpreta
        como historico.
        """
        if not isinstance(value, str):
            return MODEL_STATUS_DEFAULT
        candidate = value.strip().upper()
        candidate = MODEL_STATUS_ALIASES.get(candidate, candidate)
        if candidate in MODEL_STATUS_VALUES:
            return candidate
        return MODEL_STATUS_DEFAULT

    def _normalize_sha256(self, value: Any) -> Optional[str]:
        if not isinstance(value, str):
            return None
        candidate = value.strip().lower()
        if len(candidate) != 64:
            return None
        if any(ch not in "0123456789abcdef" for ch in candidate):
            return None
        return candidate

    def _normalize_artifact_id(self, value: Any) -> Optional[str]:
        text = self._normalize_optional_text(value)
        if not text or "@" not in text:
            return None
        return text

    def _normalize_class_space(self, value: Any) -> Optional[int]:
        try:
            number = int(value)
        except (TypeError, ValueError):
            return None
        return number if number > 0 else None

    def _normalize_class_labels(self, value: Any) -> list:
        if not isinstance(value, (list, tuple)):
            return []
        return [str(item) for item in value if isinstance(item, str) and item.strip()]

    def _normalize_optional_text(self, value: Any) -> Optional[str]:
        if not isinstance(value, str):
            return None
        text = value.strip()
        return text or None

    def _normalize_model_filename(self, value: Any) -> Optional[str]:
        """Nombre de archivo del artefacto, o None si no es un nombre real."""
        text = self._normalize_optional_text(value)
        if not text:
            return None
        lowered = text.lower()
        if lowered in {"fallback", "mock", "unavailable", "unknown"}:
            return None
        return text

    def _resolve_inference_executed(self, raw_result: Dict[str, Any]) -> bool:
        """Eje separado de la procedencia (D-L4).

        Se prefiere la declaracion explicita del ai_service; si no viene (servicio
        antiguo), se deriva de campos que ya existian para no degradar la UI
        durante un despliegue por partes.
        """
        declared = raw_result.get("inference_executed")
        if isinstance(declared, bool):
            return declared

        diagnosis = str(raw_result.get("diagnosis") or "").strip().lower()
        status = str(raw_result.get("status") or "").strip().lower()
        class_index = self._normalize_class_index(raw_result.get("class_index"))
        if not diagnosis or diagnosis == "unknown":
            return False
        if status == "error":
            return False
        return class_index >= 0

