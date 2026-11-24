"""Analista LLM opcional para resúmenes acústicos ya calculados.

Gobernanza (fuente: ``docs/``):
- C0: capa objetiva propia, única verdad evaluable de S81.
- C1: capa de referencia externa (``REF``); nunca se suma a C0 ni entra en splits.
- ``rules-v0``: heurística determinista; su estado es ``SIM``, nunca ``REAL-LOCAL``.
- ``dry_run=True``: reglas puras, sin red y sin credenciales; nunca simula un LLM.

Este módulo NO lee datasets crudos, NO ejecuta inferencia, NO descarga pesos.
Solo recibe resúmenes numéricos calculados previamente en Python y redacta un
informe estructurado. Si faltan credenciales en modo real, falla explícitamente.
"""
from __future__ import annotations

import json
import os
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from typing import Any, Literal

import requests
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StrictBool,
    StrictFloat,
    StrictInt,
    StrictStr,
    ValidationError,
    model_validator,
)
from tenacity import (
    Retrying,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

STRICT_MODEL = ConfigDict(extra="forbid", frozen=True, allow_inf_nan=False)

# Se reutiliza el proveedor ya gobernado por /assist; las variables específicas
# de acústica tienen prioridad y las de voz quedan como compatibilidad.
ENV_KEYS: dict[str, tuple[str, str]] = {
    "url": ("SIGCT_ACOUSTIC_LLM_URL", "SIGCT_VOICE_LLM_URL"),
    "model": ("SIGCT_ACOUSTIC_LLM_MODEL", "SIGCT_VOICE_LLM_MODEL"),
    "key": ("SIGCT_ACOUSTIC_LLM_KEY", "SIGCT_VOICE_LLM_KEY"),
}

# Campos de control: el LLM nunca puede fijarlos. Se descartan y se reconstruyen.
CONTROL_FIELDS = ("analysis_id", "mode", "llm_used", "rules_version", "model")


class LlmAcousticError(RuntimeError):
    """Error base del analista acústico."""


class LlmCredentialsMissingError(LlmAcousticError):
    """Faltan variables de entorno; el modo real no se inventa."""


class LlmTransportError(LlmAcousticError):
    """El proveedor LLM no respondió tras los reintentos."""


class LlmResponseInvalidError(LlmAcousticError):
    """La respuesta del proveedor no cumple el contrato estricto de salida."""


@dataclass(frozen=True)
class LlmCredentials:
    url: str
    model: str
    key: str


def load_llm_credentials(env: Mapping[str, str] | None = None) -> LlmCredentials:
    """Lee credenciales con ``os.getenv`` implícito y fallo explícito.

    No se registran valores, solo nombres de variables, para no filtrar claves.
    """
    source: Mapping[str, str] = os.environ if env is None else env
    resolved: dict[str, str] = {}
    missing: list[str] = []
    for field_name, names in ENV_KEYS.items():
        value = ""
        for name in names:
            raw = source.get(name, "")
            if raw is None:
                continue
            candidate = str(raw).strip()
            if candidate:
                value = candidate
                break
        if value:
            resolved[field_name] = value
        else:
            missing.extend(names)
    if missing:
        raise LlmCredentialsMissingError(
            "Credenciales LLM incompletas. Defina: "
            + ", ".join(sorted(set(missing)))
            + ". dry_run=True no requiere credenciales."
        )
    return LlmCredentials(**resolved)


class LayerCounts(BaseModel):
    """Conteos ya calculados de una capa del corpus."""

    model_config = STRICT_MODEL

    clips: StrictInt = Field(ge=0, description="Clips declarados en la capa")
    accepted: StrictInt = Field(ge=0)
    rejected: StrictInt = Field(ge=0)
    quarantine: StrictInt = Field(ge=0)

    @model_validator(mode="after")
    def _validate_totals(self) -> "LayerCounts":
        classified = self.accepted + self.rejected + self.quarantine
        if classified > self.clips:
            raise ValueError("accepted + rejected + quarantine no puede superar clips")
        return self


class C0Counts(LayerCounts):
    """Capa C0: propia, ``source=cmsc_logger``, única verdad evaluable."""


class C1Counts(LayerCounts):
    """Capa C1: externa, ``REF``; jamás entra en evaluación de S81."""


class AcousticMetrics(BaseModel):
    """Métricas calculadas aguas arriba; aquí solo se validan y se redactan."""

    model_config = STRICT_MODEL

    macro_f1: StrictFloat | None = Field(default=None, ge=0.0, le=1.0)
    ece: StrictFloat | None = Field(default=None, ge=0.0, le=1.0)
    balanced_accuracy: StrictFloat | None = Field(default=None, ge=0.0, le=1.0)
    weighted_f1: StrictFloat | None = Field(default=None, ge=0.0, le=1.0)

    def declared(self) -> list[tuple[str, float]]:
        return [
            (name, value)
            for name, value in (
                ("macro_f1", self.macro_f1),
                ("ece", self.ece),
                ("balanced_accuracy", self.balanced_accuracy),
                ("weighted_f1", self.weighted_f1),
            )
            if value is not None
        ]


class LlmAcousticAnalysisRequest(BaseModel):
    """Entrada estricta: solo resúmenes numéricos, nunca audio crudo."""

    model_config = STRICT_MODEL

    analysis_id: StrictStr = Field(min_length=1, max_length=120)
    dataset_version: StrictStr = Field(min_length=1, max_length=40)
    feature_schema: StrictStr = Field(
        default="acoustic.feat.window.v2", min_length=1, max_length=120
    )
    classification_method: Literal["rules-v0"] = "rules-v0"
    evaluation_layer: Literal["C0"] = "C0"
    metrics: AcousticMetrics
    eta2: StrictFloat = Field(
        ge=0.0, le=1.0, description="η² ya calculado; no se reestima aquí"
    )
    c0: C0Counts
    c1: C1Counts

    @model_validator(mode="after")
    def _validate_governance(self) -> "LlmAcousticAnalysisRequest":
        if self.evaluation_layer != "C0":
            raise ValueError("La evaluación de S81 solo puede usar C0")
        return self


class LlmAcousticAnalysisResult(BaseModel):
    """Salida estructurada y verificable del analista."""

    model_config = STRICT_MODEL

    analysis_id: StrictStr
    mode: Literal["dry_run", "live"]
    llm_used: StrictBool
    rules_version: Literal["rules-v0"] = "rules-v0"
    model: StrictStr | None = None
    hallazgos_clave: list[StrictStr] = Field(min_length=1)
    limitaciones_capas: list[StrictStr] = Field(min_length=1)
    advertencias_gobernanza: list[StrictStr] = Field(min_length=1)


def _format_metrics(request: LlmAcousticAnalysisRequest) -> str:
    declared = request.metrics.declared()
    if not declared:
        return "No hay métricas numéricas declaradas en el resumen."
    rendered = ", ".join(f"{name}={value:.4f}" for name, value in declared)
    return f"Métricas declaradas: {rendered}."


def build_rules_v0_result(
    request: LlmAcousticAnalysisRequest,
) -> LlmAcousticAnalysisResult:
    """Resumen determinista ``rules-v0``. Sin red, sin LLM, sin efectos."""
    if not isinstance(request, LlmAcousticAnalysisRequest):
        request = LlmAcousticAnalysisRequest.model_validate(request)

    hallazgos = [
        (
            f"Resumen {request.analysis_id}: dataset_version={request.dataset_version}, "
            f"feature_schema={request.feature_schema}."
        ),
        (
            f"C0 declara {request.c0.clips} clips ({request.c0.accepted} aceptados); "
            f"C1 declara {request.c1.clips} clips REF."
        ),
        _format_metrics(request),
        f"eta2={request.eta2:.4f} (calculado aguas arriba; no reestimado aquí).",
        (
            f"Método {request.classification_method}: heurística determinista; "
            f"capa de evaluación {request.evaluation_layer}."
        ),
    ]

    limitaciones = [
        (
            "C0 es la única capa objetiva: sus conteos y métricas son los únicos "
            "evaluables para S81."
        ),
        (
            "C1 es referencia externa (REF): pre-entrenamiento, bootstrap y "
            "negatives; nunca evalúa S81."
        ),
    ]
    if request.c1.clips:
        limitaciones.append(
            f"C1 contiene {request.c1.clips} clips; no se suman a C0 ni se promocionan "
            "a REAL-LOCAL."
        )
    if request.c0.clips == 0:
        limitaciones.append("C0 no tiene clips declarados: no hay respaldo evaluable propio.")

    advertencias = [
        "rules-v0 es determinista y no aprendido: su estado es SIM, nunca REAL-LOCAL.",
        "Prohibido mezclar C0 y C1 en train/validation/test o en métricas de S81.",
        (
            "El LLM, cuando se usa, solo redacta: no lee crudos, no ejecuta "
            "inferencia y no cambia estados."
        ),
    ]
    if request.c0.clips == 0 and request.metrics.declared():
        advertencias.append(
            "Métricas presentes sin clips C0: no atribuirlas a evaluación propia."
        )

    return LlmAcousticAnalysisResult(
        analysis_id=request.analysis_id,
        mode="dry_run",
        llm_used=False,
        rules_version="rules-v0",
        model=None,
        hallazgos_clave=hallazgos,
        limitaciones_capas=limitaciones,
        advertencias_gobernanza=advertencias,
    )


class LlmAcousticAnalyst:
    """Redactor opcional con fail-closed y modo determinista por defecto."""

    def __init__(
        self,
        *,
        timeout: float = 8.0,
        max_attempts: int = 3,
        post: Callable[..., Any] | None = None,
        env: Mapping[str, str] | None = None,
    ) -> None:
        if timeout <= 0:
            raise ValueError("timeout debe ser > 0")
        if max_attempts < 1:
            raise ValueError("max_attempts debe ser >= 1")
        self.timeout = float(timeout)
        self.max_attempts = int(max_attempts)
        self._post = post if post is not None else requests.post
        self._env = env

    def analyze(
        self,
        request: LlmAcousticAnalysisRequest | Mapping[str, Any],
        *,
        dry_run: bool = True,
    ) -> LlmAcousticAnalysisResult:
        normalized = (
            request
            if isinstance(request, LlmAcousticAnalysisRequest)
            else LlmAcousticAnalysisRequest.model_validate(request)
        )
        deterministic = build_rules_v0_result(normalized)
        if dry_run:
            return deterministic

        credentials = load_llm_credentials(self._env)
        try:
            raw_response = self._call_llm(normalized, deterministic, credentials)
        except requests.RequestException as exc:
            raise LlmTransportError(
                f"LLM no disponible tras {self.max_attempts} intento(s): "
                f"{exc.__class__.__name__}"
            ) from exc
        return self._parse_llm_response(raw_response, normalized, credentials)

    def _call_llm(
        self,
        request: LlmAcousticAnalysisRequest,
        deterministic: LlmAcousticAnalysisResult,
        credentials: LlmCredentials,
    ) -> Any:
        user_payload = {
            "resumen": request.model_dump(mode="json"),
            "salida_determinista": deterministic.model_dump(mode="json"),
            "instrucciones": (
                "Redacta en español los tres campos solicitados. Usa solo el resumen; "
                "no inventes datos, no ejecutes inferencia y no cambies estados. "
                "rules-v0 es SIM; C1 es REF y nunca se suma a C0."
            ),
        }
        body = {
            "model": credentials.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Analista acústico de SIGC&T Rural. Resumen estricto, sin "
                        "fabricación de métricas, señales ni fuentes."
                    ),
                },
                {
                    "role": "user",
                    "content": json.dumps(user_payload, ensure_ascii=False, sort_keys=True),
                },
            ],
            "temperature": 0,
            "response_format": {"type": "json_object"},
        }
        retrying = Retrying(
            stop=stop_after_attempt(self.max_attempts),
            wait=wait_exponential(multiplier=0.1, min=0.1, max=1.0),
            retry=retry_if_exception_type(requests.RequestException),
            reraise=True,
        )
        response = retrying(
            self._request_once, credentials.url, credentials, body
        )
        try:
            return response.json()
        except ValueError as exc:
            raise LlmResponseInvalidError("Respuesta LLM no es JSON válido") from exc

    def _request_once(
        self, url: str, credentials: LlmCredentials, body: dict[str, Any]
    ) -> Any:
        response = self._post(
            url,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {credentials.key}",
            },
            json=body,
            timeout=self.timeout,
        )
        response.raise_for_status()
        return response

    def _parse_llm_response(
        self,
        data: Any,
        request: LlmAcousticAnalysisRequest,
        credentials: LlmCredentials,
    ) -> LlmAcousticAnalysisResult:
        try:
            if not isinstance(data, Mapping):
                raise TypeError("la respuesta JSON debe ser un objeto")
            choices = data.get("choices")
            if not isinstance(choices, list) or not choices:
                raise KeyError("choices")
            first = choices[0]
            message = first.get("message") if isinstance(first, Mapping) else None
            content = message.get("content") if isinstance(message, Mapping) else None
            if isinstance(content, str):
                content = json.loads(content)
            if not isinstance(content, Mapping):
                raise TypeError("content debe ser un objeto JSON")

            payload = dict(content)
            for field in CONTROL_FIELDS:
                payload.pop(field, None)
            payload.update(
                {
                    "analysis_id": request.analysis_id,
                    "mode": "live",
                    "llm_used": True,
                    "rules_version": "rules-v0",
                    "model": credentials.model,
                }
            )
            return LlmAcousticAnalysisResult.model_validate(payload)
        except (KeyError, IndexError, TypeError, ValueError, ValidationError) as exc:
            raise LlmResponseInvalidError(
                f"Respuesta LLM inválida: {exc.__class__.__name__}"
            ) from exc


__all__ = [
    "AcousticMetrics",
    "C0Counts",
    "C1Counts",
    "CONTROL_FIELDS",
    "ENV_KEYS",
    "LlmAcousticAnalysisRequest",
    "LlmAcousticAnalysisResult",
    "LlmAcousticAnalyst",
    "LlmAcousticError",
    "LlmCredentials",
    "LlmCredentialsMissingError",
    "LlmResponseInvalidError",
    "LlmTransportError",
    "build_rules_v0_result",
    "load_llm_credentials",
]
