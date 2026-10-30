"""Identidad de artefactos de modelo derivada de sus bytes (SHA-256).

Modulo de **stdlib pura**: no importa TensorFlow, FastAPI, Django ni PyYAML.
Eso permite probar el nucleo (hash -> estado -> cross-check) sin contenedor,
sin framework y sin cargar el modelo.

Principio de diseno (L-1 ../docs/L1_L6_EXECUTION_PLAN.md):

    identidad por bytes -> etiqueta -> default fail-closed

``HISTORICO`` jamas es un valor por defecto: si el hash del artefacto servido no
esta en ``KNOWN_ARTIFACTS`` el estado es ``NO_DECLARADO``.

Por que el registro vive aqui y no en docs/ai/manifests/:
``src/ai_models/Dockerfile`` hace ``COPY . .`` del directorio del microservicio,
por lo que el contenedor NO contiene ``docs/``. El manifiesto canónico
(``docs/ai/manifests/model_registry.agriculture_v2.yaml``) sigue siendo la fuente
documental; este diccionario es el espejo de ejecucion y AC-L13 exige que ambos
hashes coincidan.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# ---------------------------------------------------------------------------
# Vocabulario cerrado de procedencia (D-L1)
# ---------------------------------------------------------------------------

STATUS_HISTORICO = "HISTORICO"
STATUS_CANONICO = "CANONICO"
STATUS_NO_DECLARADO = "NO_DECLARADO"
STATUS_INCONSISTENTE = "INCONSISTENTE"
STATUS_NO_DISPONIBLE = "NO_DISPONIBLE"

MODEL_STATUS_VALUES = (
    STATUS_HISTORICO,
    STATUS_CANONICO,
    STATUS_NO_DECLARADO,
    STATUS_INCONSISTENTE,
    STATUS_NO_DISPONIBLE,
)

# Unico alias documental aceptado (D-L1). El runtime siempre emite HISTORICO.
MODEL_STATUS_ALIASES = {"HISTORICAL": STATUS_HISTORICO}

# Default fail-closed: un estado ausente o desconocido NUNCA se eleva a historico.
MODEL_STATUS_DEFAULT = STATUS_NO_DECLARADO

DECLARED_IN = "src/ai_models/model_identity.py"
SEMANTIC_CONTRACT_VERSION = "v1"

IDENTITY_SOURCE_REGISTRY = "sha256_registry"
IDENTITY_SOURCE_HASH_ONLY = "sha256_only"
IDENTITY_SOURCE_NONE = "none"

_CHUNK_SIZE = 1024 * 1024
_METADATA_FILENAME = "model_metadata.json"

# ---------------------------------------------------------------------------
# Registro de procedencia (espejo de ejecucion del manifiesto canónico)
# ---------------------------------------------------------------------------
# Clave = sha256 en minusculas del contenido binario del artefacto.
# Un artefacto nuevo (hash desconocido) => NO_DECLARADO. Sin excepciones.

KNOWN_ARTIFACTS: Dict[str, Dict[str, Any]] = {
    "77b0efecd602f95fd31846c3058b4d45e41289155438fbd22738bce0640219c0": {
        "model_status": STATUS_HISTORICO,
        "scientific_scope": "binary_only",
        "class_space": 2,
        "class_labels": ["enferma", "sana"],
        "superseded_by": "M2_efficientnet_b0_001",
        "declared_at": "2026-10-30",
        "expires_on": "AI-R3+R4",
        "reason": (
            "Clasificador binario enferma/sana. Sin holdout de campo (G-3b). "
            "No identifica especie ni enfermedad especifica."
        ),
    },
}

# Cache por (ruta, tamano, mtime_ns, output_dim): el healthcheck de compose
# sondea /health cada 10 s y re-hashear ~9.4 MB en cada sondeo seria IO regalado.
_CACHE: Dict[str, Any] = {"key": None, "value": None}


# ---------------------------------------------------------------------------
# Hash
# ---------------------------------------------------------------------------


def hash_file(path: Path, chunk_size: int = _CHUNK_SIZE) -> str:
    """SHA-256 de un archivo en streaming (no carga el binario en memoria)."""
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for block in iter(lambda: handle.read(chunk_size), b""):
            digest.update(block)
    return digest.hexdigest()


# ---------------------------------------------------------------------------
# Normalizadores (comparten semantica con el resolver del backend)
# ---------------------------------------------------------------------------


def normalize_status(value: Any) -> str:
    """Normaliza un estado de procedencia al vocabulario cerrado.

    Acepta el enum en cualquier capitalizacion y el alias documental
    ``HISTORICAL``. Cualquier otra cosa (None, "", "OK", "historico-?") cae a
    ``NO_DECLARADO``: fail-closed.
    """
    if not isinstance(value, str):
        return MODEL_STATUS_DEFAULT
    candidate = value.strip().upper()
    candidate = MODEL_STATUS_ALIASES.get(candidate, candidate)
    if candidate in MODEL_STATUS_VALUES:
        return candidate
    return MODEL_STATUS_DEFAULT


def normalize_sha256(value: Any) -> Optional[str]:
    """Devuelve el hash en minusculas si tiene forma de SHA-256, si no None."""
    if not isinstance(value, str):
        return None
    candidate = value.strip().lower()
    if len(candidate) != 64:
        return None
    if any(ch not in "0123456789abcdef" for ch in candidate):
        return None
    return candidate


# ---------------------------------------------------------------------------
# Lectura de metadatos del artefacto
# ---------------------------------------------------------------------------


def read_artifact_metadata(artifact_path: Path) -> Dict[str, Any]:
    """Lee ``model_metadata.json`` junto al artefacto.

    Devuelve ``{"class_space": int|None, "class_labels": list, "source": str|None}``.
    Nunca lanza: un metadato ilegible se declara ausente, no se inventa.
    """
    result: Dict[str, Any] = {"class_space": None, "class_labels": [], "source": None}
    metadata_path = Path(artifact_path).parent / _METADATA_FILENAME
    if not metadata_path.is_file():
        return result
    try:
        with open(metadata_path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except (OSError, ValueError):
        return result
    if not isinstance(payload, dict):
        return result

    labels = payload.get("classes")
    if isinstance(labels, list) and labels and all(isinstance(item, str) for item in labels):
        result["class_labels"] = [str(item) for item in labels]
        result["class_space"] = len(result["class_labels"])
        result["source"] = str(metadata_path.name)
    return result


# ---------------------------------------------------------------------------
# Identidad
# ---------------------------------------------------------------------------


def _empty_identity(status: str = STATUS_NO_DISPONIBLE) -> Dict[str, Any]:
    return {
        "model_file": None,
        "model_sha256": None,
        "model_bytes": None,
        "model_mtime": None,
        "model_status": status,
        "artifact_id": None,
        "identity_source": IDENTITY_SOURCE_NONE,
        "class_space": None,
        "class_labels": [],
        "scientific_scope": "unknown",
        "superseded_by": None,
        "declared_in": DECLARED_IN,
        "expires_on": None,
        "semantic_contract_version": SEMANTIC_CONTRACT_VERSION,
    }


def _candidate_files(models_dir: Path) -> List[Path]:
    directory = Path(models_dir)
    if not directory.is_dir():
        return []
    files = list(directory.glob("*.h5")) + list(directory.glob("*.keras"))
    return [path for path in files if path.is_file()]


def _iso_utc(timestamp: float) -> str:
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def compute_identity(models_dir: Path, output_dim: Optional[int] = None) -> Dict[str, Any]:
    """Identidad completa del artefacto servible mas reciente de ``models_dir``.

    La regla de seleccion es la misma que usa ``load_latest_model()`` en
    ``fastapi_app.py``: el archivo de mayor ``mtime``. Se replica a proposito para
    que la etiqueta describa exactamente el archivo que se sirve.
    """
    files = _candidate_files(models_dir)
    if not files:
        return _empty_identity(STATUS_NO_DISPONIBLE)

    latest = max(files, key=lambda path: path.stat().st_mtime_ns)
    stats = latest.stat()
    sha256 = hash_file(latest)
    metadata = read_artifact_metadata(latest)
    declared = KNOWN_ARTIFACTS.get(sha256)

    identity = _empty_identity(STATUS_NO_DECLARADO)
    identity.update(
        {
            "model_file": latest.name,
            "model_sha256": sha256,
            "model_bytes": stats.st_size,
            "model_mtime": _iso_utc(stats.st_mtime),
            "artifact_id": f"{latest.stem}@{sha256[:8]}",
            "class_labels": metadata["class_labels"],
        }
    )

    if declared is None:
        # Hash no registrado: se describe lo que hay, sin afirmar procedencia.
        identity["identity_source"] = IDENTITY_SOURCE_HASH_ONLY
        identity["class_space"] = metadata["class_space"] or (
            int(output_dim) if isinstance(output_dim, int) and output_dim > 0 else None
        )
        return identity

    declared_space = declared.get("class_space")
    identity.update(
        {
            "model_status": normalize_status(declared.get("model_status")),
            "identity_source": IDENTITY_SOURCE_REGISTRY,
            "class_space": declared_space,
            "class_labels": declared.get("class_labels") or metadata["class_labels"],
            "scientific_scope": declared.get("scientific_scope") or "unknown",
            "superseded_by": declared.get("superseded_by"),
            "expires_on": declared.get("expires_on"),
        }
    )

    # Cross-check de tres fuentes: registro vs metadatos vs grafo cargado.
    inconsistent = False
    if isinstance(declared_space, int):
        if metadata["class_space"] is not None and metadata["class_space"] != declared_space:
            inconsistent = True
        if isinstance(output_dim, int) and output_dim > 0 and output_dim != declared_space:
            inconsistent = True
    if inconsistent:
        identity["model_status"] = STATUS_INCONSISTENTE

    return identity


def refresh_model_identity(models_dir: Path, output_dim: Optional[int] = None) -> Dict[str, Any]:
    """``compute_identity`` con cache por (ruta, tamano, mtime_ns, output_dim)."""
    files = _candidate_files(models_dir)
    if not files:
        _CACHE["key"] = None
        _CACHE["value"] = None
        return _empty_identity(STATUS_NO_DISPONIBLE)

    latest = max(files, key=lambda path: path.stat().st_mtime_ns)
    stats = latest.stat()
    key = (str(latest.resolve()), stats.st_size, stats.st_mtime_ns, output_dim)

    if _CACHE["key"] == key and _CACHE["value"] is not None:
        return dict(_CACHE["value"])

    value = compute_identity(models_dir, output_dim=output_dim)
    _CACHE["key"] = key
    _CACHE["value"] = value
    return dict(value)


def reset_cache() -> None:
    """Limpia la cache en memoria (pruebas y cambio de directorio de modelos)."""
    _CACHE["key"] = None
    _CACHE["value"] = None
