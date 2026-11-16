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


# ---------------------------------------------------------------------------
# Contrato semantico (AI-R4): modo v1 (binario) / modo v2 (multiclase 16)
# ---------------------------------------------------------------------------
# El resolver DETECTA el modo y nunca lo adivina: una senal ausente o
# desconocida cae siempre a v1 (fail-closed). Asi un ai_service antiguo o un
# artefacto binario jamas se interpretan como multiclase, y la activacion de
# M2 (AI_BACKEND=onnx) no puede etiquetar mal durante un despliegue escalonado.
CONTRACT_MODE_BINARY = "v1"
CONTRACT_MODE_MULTICLASS = "v2"

SEMANTIC_CONTRACT_VERSION_BINARY = "v1"
SEMANTIC_CONTRACT_VERSION_MULTICLASS = "v2"

SCIENTIFIC_SCOPE_BINARY = "binary_only"
SCIENTIFIC_SCOPE_MULTICLASS = "multiclass16"

# Eco del contrato del modelo servido. Debe coincidir con
# src/ai_models/fastapi_app.py (MODEL_CONTRACT_VERSION_TF / _ONNX).
MODEL_CONTRACT_VERSION_BINARY = "binary_only"
MODEL_CONTRACT_VERSION_MULTICLASS = "agriculture_v2_multiclass16"

# Espacio de clases del contrato v2 (orden ImageFolder; ver class_index_map
# en docs/ai/manifests/model_registry.agriculture_v2.yaml).
MULTICLASS_SPACE = 16
TAXONOMY_VERSION_MULTICLASS = "agriculture_v2_taxonomy_v1"


# ---------------------------------------------------------------------------
# Contrato v1 (binario) -- comportamiento historico, sin cambios
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# Contrato v2 (multiclase 16) -- AI-R4
# ---------------------------------------------------------------------------
# Fuente de verdad: taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml
# x class_index_map (orden ImageFolder, NO el orden del manifiesto). El indice
# 0..15 es la salida de M2; el puente es el indice, no el orden del YAML.
_ACTION_HEALTHY = (
    "Mantener monitoreo preventivo. Resultado de investigacion (PlantVillage); "
    "no sustituye inspeccion agronomica profesional."
)
_ACTION_DISEASE = (
    "Senal de alerta fitosanitaria: validar la muestra con inspeccion local. "
    "Resultado de investigacion (PlantVillage); no sustituye diagnostico profesional."
)

CLASS_DEFINITIONS_V2: Dict[int, Dict[str, Any]] = {
    0: {
        "diagnosis_alias": "class_0",
        "prediction_code": "agriculture.corn.disease.cercospora_gray_leaf_spot",
        "prediction_label": "Maiz - Cercospora (mancha gris)",
        "plant_species": "corn",
        "condition_name": "cercospora_gray_leaf_spot",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "corn__cercospora_gray_leaf_spot",
        "class_index": 0,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    1: {
        "diagnosis_alias": "class_1",
        "prediction_code": "agriculture.corn.disease.common_rust",
        "prediction_label": "Maiz - Roya comun",
        "plant_species": "corn",
        "condition_name": "common_rust",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "corn__common_rust",
        "class_index": 1,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    2: {
        "diagnosis_alias": "class_2",
        "prediction_code": "agriculture.corn.healthy.healthy",
        "prediction_label": "Maiz - Sana",
        "plant_species": "corn",
        "condition_name": "healthy",
        "condition_group": "healthy",
        "health_state": "healthy",
        "severity": "none",
        "recommended_action": _ACTION_HEALTHY,
        "canonical_class_id": "corn__healthy",
        "class_index": 2,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    3: {
        "diagnosis_alias": "class_3",
        "prediction_code": "agriculture.corn.disease.northern_leaf_blight",
        "prediction_label": "Maiz - Tizon foliar del norte",
        "plant_species": "corn",
        "condition_name": "northern_leaf_blight",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "corn__northern_leaf_blight",
        "class_index": 3,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    4: {
        "diagnosis_alias": "class_4",
        "prediction_code": "agriculture.potato.disease.early_blight",
        "prediction_label": "Papa - Tizon temprano",
        "plant_species": "potato",
        "condition_name": "early_blight",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "potato__early_blight",
        "class_index": 4,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    5: {
        "diagnosis_alias": "class_5",
        "prediction_code": "agriculture.potato.healthy.healthy",
        "prediction_label": "Papa - Sana",
        "plant_species": "potato",
        "condition_name": "healthy",
        "condition_group": "healthy",
        "health_state": "healthy",
        "severity": "none",
        "recommended_action": _ACTION_HEALTHY,
        "canonical_class_id": "potato__healthy",
        "class_index": 5,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    6: {
        "diagnosis_alias": "class_6",
        "prediction_code": "agriculture.potato.disease.late_blight",
        "prediction_label": "Papa - Tizon tardio",
        "plant_species": "potato",
        "condition_name": "late_blight",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "potato__late_blight",
        "class_index": 6,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    7: {
        "diagnosis_alias": "class_7",
        "prediction_code": "agriculture.tomato.disease.bacterial_spot",
        "prediction_label": "Tomate - Mancha bacteriana",
        "plant_species": "tomato",
        "condition_name": "bacterial_spot",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "tomato__bacterial_spot",
        "class_index": 7,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    8: {
        "diagnosis_alias": "class_8",
        "prediction_code": "agriculture.tomato.disease.early_blight",
        "prediction_label": "Tomate - Tizon temprano",
        "plant_species": "tomato",
        "condition_name": "early_blight",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "tomato__early_blight",
        "class_index": 8,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    9: {
        "diagnosis_alias": "class_9",
        "prediction_code": "agriculture.tomato.healthy.healthy",
        "prediction_label": "Tomate - Sana",
        "plant_species": "tomato",
        "condition_name": "healthy",
        "condition_group": "healthy",
        "health_state": "healthy",
        "severity": "none",
        "recommended_action": _ACTION_HEALTHY,
        "canonical_class_id": "tomato__healthy",
        "class_index": 9,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    10: {
        "diagnosis_alias": "class_10",
        "prediction_code": "agriculture.tomato.disease.late_blight",
        "prediction_label": "Tomate - Tizon tardio",
        "plant_species": "tomato",
        "condition_name": "late_blight",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "tomato__late_blight",
        "class_index": 10,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    11: {
        "diagnosis_alias": "class_11",
        "prediction_code": "agriculture.tomato.disease.leaf_mold",
        "prediction_label": "Tomate - Moho de la hoja",
        "plant_species": "tomato",
        "condition_name": "leaf_mold",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "tomato__leaf_mold",
        "class_index": 11,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    12: {
        "diagnosis_alias": "class_12",
        "prediction_code": "agriculture.tomato.disease.mosaic_virus",
        "prediction_label": "Tomate - Virus del mosaico",
        "plant_species": "tomato",
        "condition_name": "mosaic_virus",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "tomato__mosaic_virus",
        "class_index": 12,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    13: {
        "diagnosis_alias": "class_13",
        "prediction_code": "agriculture.tomato.disease.septoria_leaf_spot",
        "prediction_label": "Tomate - Mancha foliar por Septoria",
        "plant_species": "tomato",
        "condition_name": "septoria_leaf_spot",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "tomato__septoria_leaf_spot",
        "class_index": 13,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    14: {
        "diagnosis_alias": "class_14",
        "prediction_code": "agriculture.tomato.disease.target_spot",
        "prediction_label": "Tomate - Mancha diana",
        "plant_species": "tomato",
        "condition_name": "target_spot",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "tomato__target_spot",
        "class_index": 14,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
    15: {
        "diagnosis_alias": "class_15",
        "prediction_code": "agriculture.tomato.disease.yellow_leaf_curl_virus",
        "prediction_label": "Tomate - Virus del rizado amarillo",
        "plant_species": "tomato",
        "condition_name": "yellow_leaf_curl_virus",
        "condition_group": "disease",
        "health_state": "warning",
        "severity": "undetermined",
        "recommended_action": _ACTION_DISEASE,
        "canonical_class_id": "tomato__yellow_leaf_curl_virus",
        "class_index": 15,
        "taxonomy_version": TAXONOMY_VERSION_MULTICLASS,
    },
}

# Mapa de modos -> definiciones. El resolver nunca mezcla ambos espacios.
_CLASS_DEFINITIONS_BY_MODE: Dict[str, Dict[int, Dict[str, Any]]] = {
    CONTRACT_MODE_BINARY: CLASS_DEFINITIONS,
    CONTRACT_MODE_MULTICLASS: CLASS_DEFINITIONS_V2,
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
        "de clases esperado del modelo servido."
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
    # AI-R4: trazabilidad del contrato v2 (aditivos; None en modo v1).
    "canonical_class_id",
    "class_index",
    "taxonomy_version",
)


class SemanticPredictionResolver:

    def resolve_prediction(self, raw_result: Dict[str, Any]) -> Dict[str, Any]:
        diagnosis = str(raw_result.get("diagnosis") or "").strip()
        class_index = self._normalize_class_index(raw_result.get("class_index"))
        source_mode = self._resolve_source_mode(raw_result)
        contract_mode = self._resolve_contract_mode(raw_result)
        multiclass = contract_mode == CONTRACT_MODE_MULTICLASS
        prediction = self._resolve_semantic_prediction(diagnosis, class_index, contract_mode)

        prediction.update({
            "confidence": self._normalize_confidence(raw_result.get("confidence")),
            "model_id": "plant_disease_classifier",
            "model_version": self._normalize_model_version(raw_result.get("model")),
            "semantic_contract_version": (
                SEMANTIC_CONTRACT_VERSION_MULTICLASS if multiclass
                else SEMANTIC_CONTRACT_VERSION_BINARY
            ),
            "scientific_scope": (
                SCIENTIFIC_SCOPE_MULTICLASS if multiclass
                else SCIENTIFIC_SCOPE_BINARY
            ),
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
            # AI-R4: eco del modo para que el sobre V3 no quede fijo en v1.
            "contract_version": contract_mode,
            "model_contract_version": self._resolve_model_contract_version(contract_mode, raw_result),
            "prediction": prediction,
            # L-2: eje separado del resultado de la inferencia (D-L4).
            "trace": {
                "model_file": self._normalize_model_filename(raw_result.get("model")),
                "inference_executed": self._resolve_inference_executed(raw_result),
                "inference_origin": INFERENCE_ORIGIN_LOCAL,
            },
        }

    def get_class_definitions(self, contract_mode: str = CONTRACT_MODE_BINARY) -> Dict[int, Dict[str, Any]]:
        """
        Fuente de las definiciones semanticas por clase (indexadas por class_index).

        AI-R4: es el unico punto de extension y ahora es data-driven por modo.
        `CONTRACT_MODE_BINARY` (v1) devuelve el mapa binario historico;
        `CONTRACT_MODE_MULTICLASS` (v2) devuelve las 16 clases de M2. Un modo
        desconocido cae a v1 (fail-closed), nunca a multiclase.
        """
        return _CLASS_DEFINITIONS_BY_MODE.get(contract_mode, CLASS_DEFINITIONS)

    def _resolve_semantic_prediction(
        self, diagnosis: str, class_index: int, contract_mode: str
    ) -> Dict[str, Any]:
        normalized = diagnosis.lower()
        class_definitions = self.get_class_definitions(contract_mode)

        for index, definition in class_definitions.items():
            if normalized == definition.get("diagnosis_alias") or class_index == index:
                return self._copy_prediction_fields(definition)

        return self._copy_prediction_fields(UNKNOWN_FALLBACK)

    def _copy_prediction_fields(self, definition: Dict[str, Any]) -> Dict[str, Any]:
        # .get: en modo v1 los campos de trazabilidad v2 viajan como None para
        # conservar la forma del sobre sin inventar taxonomia.
        return {field: definition.get(field) for field in _PREDICTION_FIELDS}

    def _resolve_contract_mode(self, raw_result: Dict[str, Any]) -> str:
        """Detecta el espacio de clases del artefacto servido (fail-closed).

        Prioridad: declaracion explicita del servicio (`model_contract_version`,
        R4-PLU) y, si no viene, senales de respaldo que ya viajan en /infer
        (class_space, nombre del artefacto). Ausente o desconocido => v1.
        """
        declared = self._normalize_optional_text(raw_result.get("model_contract_version"))
        if declared:
            normalized = declared.lower()
            if normalized == MODEL_CONTRACT_VERSION_MULTICLASS:
                return CONTRACT_MODE_MULTICLASS
            if normalized == MODEL_CONTRACT_VERSION_BINARY:
                return CONTRACT_MODE_BINARY

        if self._normalize_class_space(raw_result.get("class_space")) == MULTICLASS_SPACE:
            return CONTRACT_MODE_MULTICLASS

        model_name = str(raw_result.get("model") or "").strip().lower()
        if model_name.endswith(".onnx"):
            return CONTRACT_MODE_MULTICLASS

        return CONTRACT_MODE_BINARY

    def _resolve_model_contract_version(
        self, contract_mode: str, raw_result: Dict[str, Any]
    ) -> str:
        declared = self._normalize_optional_text(raw_result.get("model_contract_version"))
        if declared:
            normalized = declared.lower()
            if normalized in (MODEL_CONTRACT_VERSION_MULTICLASS, MODEL_CONTRACT_VERSION_BINARY):
                return normalized
        return (
            MODEL_CONTRACT_VERSION_MULTICLASS if contract_mode == CONTRACT_MODE_MULTICLASS
            else MODEL_CONTRACT_VERSION_BINARY
        )

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
