"""Endpoints V3 del CMSC para cálculo numérico sobre series reales.

Contrato de honestidad:
- ``GET  /api/v3/cmsc/acoustic-envelopes/`` expone el catálogo C0 REAL-LOCAL del
  dataset acústico propio. Es SOLO LECTURA: nunca escribe en ``data/``.
- ``POST /api/v3/cmsc/real-series-calculus/`` calcula derivadas, integrales y
  vectores sobre la serie que envía el cliente. La procedencia se hereda del
  payload; el servidor no eleva SIM/LOCAL a REAL-LOCAL ni inventa métricas.
"""
from __future__ import annotations

import json
import math
import os
from pathlib import Path

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from services.real_series_calculus import RealSeriesCalculusError, analyze_payload

ENVELOPE_SCHEMA = "cmsc.acoustic.envelopes.v1"
ENVELOPE_RELATIVE_PATH = Path(
    "data/datasets/sigct_rural_acoustic/v1/features/acoustic_envelopes_v1.json"
)
ACOUSTIC_SAMPLE_RATE = 44100
ACOUSTIC_FRAME_HOP = 2048
FRAME_SECONDS = ACOUSTIC_FRAME_HOP / ACOUSTIC_SAMPLE_RATE


def resolve_envelope_path() -> Path:
    """Ruta gobernada del catálogo C0; sobreescribible solo por entorno explícito."""
    override = os.environ.get("SIGCT_ACOUSTIC_ENVELOPES_PATH", "").strip()
    if override:
        return Path(override)
    project_root = getattr(settings, "PROJECT_ROOT", None)
    if project_root is None:
        project_root = Path(__file__).resolve().parents[3]
    return Path(project_root) / ENVELOPE_RELATIVE_PATH


def load_envelope_catalog() -> dict:
    """Lee y valida el catálogo. Nunca lo modifica."""
    path = resolve_envelope_path()
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RealSeriesCalculusError("catálogo de envolventes no disponible", "NO_DATA") from exc
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RealSeriesCalculusError("catálogo de envolventes ilegible", "BROKEN_SOURCE") from exc
    if not isinstance(payload, dict) or payload.get("schema") != ENVELOPE_SCHEMA:
        raise RealSeriesCalculusError(f"se esperaba el schema {ENVELOPE_SCHEMA}", "BROKEN_SOURCE")
    envelopes = payload.get("envelopes")
    if not isinstance(envelopes, dict) or not envelopes:
        raise RealSeriesCalculusError("catálogo sin envolventes", "NO_DATA")
    return {"payload": payload, "envelopes": envelopes, "path": path}


def validate_envelope(sample_id: str, raw: object) -> list[float]:
    if not isinstance(raw, list) or len(raw) < 2:
        raise RealSeriesCalculusError("muestra no disponible", "NO_DATA")
    values = []
    for item in raw:
        if isinstance(item, bool) or not isinstance(item, (int, float)) or not math.isfinite(item):
            raise RealSeriesCalculusError("envolvente con valores no finitos", "BROKEN_SOURCE")
        values.append(float(item))
    return values


class AcousticEnvelopesView(APIView):
    """Catálogo C0 REAL-LOCAL (o una muestra concreta) para el núcleo MMC."""

    permission_classes = [AllowAny]

    def get(self, request):
        try:
            catalog = load_envelope_catalog()
        except RealSeriesCalculusError as exc:
            return Response({"ok": False, "error": exc.message, "code": exc.code}, status=503)

        envelopes = catalog["envelopes"]
        sample_id = request.query_params.get("sample_id")
        if sample_id:
            if sample_id not in envelopes:
                return Response(
                    {"ok": False, "error": f"muestra {sample_id} no existe", "code": "NO_DATA"},
                    status=404,
                )
            try:
                values = validate_envelope(sample_id, envelopes[sample_id])
            except RealSeriesCalculusError as exc:
                return Response(
                    {"ok": False, "error": exc.message, "code": exc.code},
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )
            return Response(
                {
                    "ok": True,
                    "schema": ENVELOPE_SCHEMA,
                    "estado": "REAL-LOCAL",
                    "layer": "C0",
                    "sourceKind": "envelope",
                    "sourceLabel": sample_id,
                    "sourcePath": str(ENVELOPE_RELATIVE_PATH).replace("\\", "/"),
                    "sampleRate": ACOUSTIC_SAMPLE_RATE,
                    "frameHop": ACOUSTIC_FRAME_HOP,
                    "sample_id": sample_id,
                    "time": [i * FRAME_SECONDS for i in range(len(values))],
                    "values": values,
                }
            )

        samples = []
        for key, raw in envelopes.items():
            if not isinstance(raw, list) or len(raw) < 2:
                continue
            try:
                values = validate_envelope(key, raw)
            except RealSeriesCalculusError:
                continue
            rms = math.sqrt(sum(v * v for v in values) / len(values))
            samples.append(
                {
                    "id": key,
                    "n": len(values),
                    "duration_s": round((len(values) - 1) * FRAME_SECONDS, 6),
                    "rms": round(rms, 6),
                }
            )
        return Response(
            {
                "ok": True,
                "schema": ENVELOPE_SCHEMA,
                "estado": "REAL-LOCAL",
                "layer": "C0",
                "sourcePath": str(ENVELOPE_RELATIVE_PATH).replace("\\", "/"),
                "count": len(samples),
                "declaredCount": catalog["payload"].get("count"),
                "samples": samples,
            }
        )


class RealSeriesCalculusView(APIView):
    """Operador numérico fail-closed; sin persistencia, sin red, sin pesos."""

    permission_classes = [AllowAny]

    def post(self, request):
        try:
            result = analyze_payload(request.data)
        except RealSeriesCalculusError as exc:
            return Response(
                {"ok": False, "error": exc.message, "code": exc.code},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        return Response(result)
