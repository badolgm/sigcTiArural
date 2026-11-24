"""Cálculo numérico verificable sobre series reales e imperfectas (MMC).

Gobernancia (fuente: ``docs/``):
- La procedencia se HEREDA de la entrada. Este módulo es un operador
  determinista (`numeric-v1`): jamás eleva `LOCAL`/`SIM` a `REAL-LOCAL`.
- `C0` = captura propia; `C1` = referencia externa (`REF`); `rules-v0` = heurística
  SIM. Ninguna capa se mezcla ni se promedia aquí.
- Fail-closed: datos no finitos, time no monótono, huecos excesivos o cotas
  rotas producen `RealSeriesCalculusError` con `code`, nunca números falsos.

Solo stdlib + Pydantic: NO añade numpy/scipy al backend.
"""
from __future__ import annotations

import math
import statistics
from typing import Any, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StrictFloat,
    StrictInt,
    StrictStr,
    ValidationError,
    model_validator,
)

STRICT_MODEL = ConfigDict(extra="forbid", frozen=True, allow_inf_nan=False)
CALCULUS_VERSION = "real-series-calculus-v1"
ALLOWED_ESTADOS = frozenset({"REAL-LOCAL", "LOCAL", "SIM", "ROTO", "NO_DATA"})
ALLOWED_LAYERS = frozenset({"C0", "C1", "rules-v0", "LOCAL"})


class RealSeriesCalculusError(RuntimeError):
    """Fallo explícito y tipado del operador numérico."""

    def __init__(self, message: str, code: str = "INVALID_SERIES") -> None:
        super().__init__(message)
        self.message = message
        self.code = code


def _fail(message: str, code: str) -> None:
    raise RealSeriesCalculusError(message, code)


class SeriesPayload(BaseModel):
    """Serie time/value con procedencia declarada. `null` = hueco real."""

    model_config = STRICT_MODEL

    time: list[StrictFloat] = Field(min_length=3, max_length=5000)
    values: list[StrictFloat | None] = Field(min_length=3, max_length=5000)
    estado: StrictStr = "SIM"
    layer: StrictStr = "LOCAL"
    sourceKind: StrictStr | None = None
    sourceLabel: StrictStr | None = None

    @model_validator(mode="after")
    def _same_length(self) -> "SeriesPayload":
        if len(self.time) != len(self.values):
            raise ValueError("time y values deben tener la misma longitud")
        return self


class SanitizeOptions(BaseModel):
    """Política de limpieza: todo cambio se declara en `diagnostics`."""

    model_config = STRICT_MODEL

    minSamples: StrictInt = Field(default=3, ge=3)
    maxInterpolateRun: StrictInt = Field(default=3, ge=0)
    maxGapFactor: StrictFloat = Field(default=8.0, gt=0)
    outlierSigma: StrictFloat = Field(default=6.0, ge=0)
    outlierPolicy: Literal["clip", "reject", "keep"] = "clip"


class CalculusRequest(BaseModel):
    model_config = STRICT_MODEL

    series: SeriesPayload
    options: SanitizeOptions = Field(default_factory=SanitizeOptions)
    order: Literal[1, 2] = 1
    method: Literal["auto", "trapecio", "simpson"] = "auto"


class ProvenanceOut(BaseModel):
    model_config = STRICT_MODEL

    estado: StrictStr
    layer: StrictStr
    sourceKind: StrictStr | None = None
    sourceLabel: StrictStr | None = None
    operator: StrictStr = CALCULUS_VERSION
    inheritsState: bool = True


class DiagnosticsOut(BaseModel):
    model_config = STRICT_MODEL

    inputCount: StrictInt
    outputCount: StrictInt
    droppedNonFinite: StrictInt
    interpolatedGaps: StrictInt
    droppedGapSamples: StrictInt
    clippedOutliers: StrictInt
    rejectedOutliers: StrictInt
    outlierCenter: StrictFloat
    outlierSigma: StrictFloat
    outlierLimit: StrictFloat
    outlierPolicy: StrictStr
    monotonic: bool = True


class CriticalPoint(BaseModel):
    model_config = STRICT_MODEL

    index: StrictInt
    t: StrictFloat
    value: StrictFloat
    kind: StrictStr
    d2: StrictFloat


class Jump(BaseModel):
    model_config = STRICT_MODEL

    index: StrictInt
    t: StrictFloat
    jump: StrictFloat
    value: StrictFloat


class DifferentialOut(BaseModel):
    model_config = STRICT_MODEL

    method: StrictStr
    order: StrictInt
    d1: list[StrictFloat]
    d2: list[StrictFloat]
    criticalPoints: list[CriticalPoint]
    jumps: list[Jump]
    maxAbsD1: StrictFloat
    rmsD1: StrictFloat
    maxAbsD2: StrictFloat
    rmsD2: StrictFloat
    criticalCount: StrictInt
    jumpCount: StrictInt
    sigmaD1: StrictFloat


class IntegralOut(BaseModel):
    model_config = STRICT_MODEL

    method: StrictStr
    simpsonSegments: StrictInt
    trapezoidSegments: StrictInt
    defined: StrictFloat
    cumulative: list[StrictFloat]
    cumulativeEnergy: list[StrictFloat]
    energy: StrictFloat
    normL2: StrictFloat
    meanPower: StrictFloat | None
    duration: StrictFloat


class VectorOut(BaseModel):
    model_config = STRICT_MODEL

    maxMagnitude: StrictFloat
    meanMagnitude: StrictFloat
    maxCrossMagnitude: StrictFloat
    minDotPrev: StrictFloat
    phaseVectors: list[list[StrictFloat]]


class CalculusResponse(BaseModel):
    model_config = STRICT_MODEL

    ok: bool = True
    version: StrictStr = CALCULUS_VERSION
    provenance: ProvenanceOut
    diagnostics: DiagnosticsOut
    n: StrictInt
    differential: DifferentialOut
    integral: IntegralOut
    vector: VectorOut


def _provenance(series: SeriesPayload) -> dict[str, Any]:
    return {
        "estado": series.estado if series.estado in ALLOWED_ESTADOS else "NO_DATA",
        "layer": series.layer if series.layer in ALLOWED_LAYERS else "LOCAL",
        "sourceKind": series.sourceKind,
        "sourceLabel": series.sourceLabel,
    }


def _robust_std(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    center = statistics.median(values)
    mad = statistics.median([abs(v - center) for v in values])
    return 1.4826 * mad


def sanitize_series(series: SeriesPayload, options: SanitizeOptions) -> dict[str, Any]:
    time = list(series.time)
    raw: list[float | None] = list(series.values)
    n = len(time)
    if n < options.minSamples:
        _fail(f"se necesitan al menos {options.minSamples} muestras", "TOO_SHORT")
    if any(not math.isfinite(t) for t in time):
        _fail("el vector de tiempo contiene valores no finitos", "NON_FINITE_TIME")
    if any(not time[i] > time[i - 1] for i in range(1, n)):
        _fail("tiempo no estrictamente creciente", "NON_MONOTONIC_TIME")
    dt_median = statistics.median([time[i] - time[i - 1] for i in range(1, n)])
    if not dt_median > 0:
        _fail("paso de tiempo no positivo", "BAD_SAMPLING")

    dropped_non_finite = 0
    work: list[float | None] = []
    for v in raw:
        if v is None or not math.isfinite(v):
            dropped_non_finite += 1
            work.append(None)
        else:
            work.append(v)

    interpolated_gaps = 0
    dropped_gap_samples = 0
    i = 0
    while i < n:
        if work[i] is not None:
            i += 1
            continue
        end = i
        while end < n and work[end] is None:
            end += 1
        run = end - i
        if 0 < i and end < n and run <= options.maxInterpolateRun:
            left = work[i - 1]
            right = work[end]
            assert left is not None and right is not None
            for k in range(i, end):
                u = (time[k] - time[i - 1]) / (time[end] - time[i - 1])
                work[k] = left + u * (right - left)
            interpolated_gaps += run
        else:
            for k in range(i, end):
                work[k] = None
            dropped_gap_samples += run
        i = end

    kept_time = [time[i] for i in range(n) if work[i] is not None]
    kept_values = [work[i] for i in range(n) if work[i] is not None]
    if len(kept_values) < options.minSamples:
        _fail("quedan demasiadas muestras válidas", "TOO_FEW_AFTER_CLEAN")

    center = statistics.median(kept_values)
    sigma = _robust_std(kept_values)
    limit = options.outlierSigma * sigma
    clipped = 0
    rejected = 0
    final_time: list[float] = []
    final_values: list[float] = []
    for t, v in zip(kept_time, kept_values):
        is_outlier = sigma > 0 and abs(v - center) > limit
        if is_outlier and options.outlierPolicy == "reject":
            rejected += 1
            continue
        if is_outlier and options.outlierPolicy == "clip":
            clipped += 1
            final_values.append(center + limit if v > center else center - limit)
        else:
            final_values.append(v)
        final_time.append(t)
    if len(final_values) < options.minSamples:
        _fail("outliers eliminaron demasiadas muestras", "TOO_FEW_AFTER_OUTLIERS")

    diffs = [final_time[i] - final_time[i - 1] for i in range(1, len(final_time))]
    max_gap = max(diffs)
    if max_gap > options.maxGapFactor * dt_median:
        _fail("hueco mayor al factor declarado", "GAP_TOO_LARGE")

    return {
        "time": final_time,
        "values": final_values,
        "dtMedian": dt_median,
        "diagnostics": DiagnosticsOut(
            inputCount=n,
            outputCount=len(final_values),
            droppedNonFinite=dropped_non_finite,
            interpolatedGaps=interpolated_gaps,
            droppedGapSamples=dropped_gap_samples,
            clippedOutliers=clipped,
            rejectedOutliers=rejected,
            outlierCenter=center,
            outlierSigma=sigma,
            outlierLimit=limit,
            outlierPolicy=options.outlierPolicy,
        ),
        "provenance": _provenance(series),
    }


def _lagrange_weights(nodes: list[float], k: int) -> list[float]:
    weights = [0.0, 0.0, 0.0]
    for i in range(3):
        if i == k:
            weights[i] = sum(1 / (nodes[k] - t) for j, t in enumerate(nodes) if j != k)
        else:
            product = 1.0
            for j in range(3):
                if j != i and j != k:
                    product *= (nodes[k] - nodes[j]) / (nodes[i] - nodes[j])
            weights[i] = product / (nodes[i] - nodes[k])
    return weights


def _second_weights(nodes: list[float]) -> list[float]:
    weights = []
    for i, t in enumerate(nodes):
        product = 1.0
        for j, node in enumerate(nodes):
            if j != i:
                product *= t - node
        weights.append(2 / product)
    return weights


def compute_derivative(clean: dict[str, Any], *, jump_sigma: float = 8.0) -> dict[str, Any]:
    time = clean["time"]
    values = clean["values"]
    n = len(values)
    if n < 3:
        _fail("se necesitan al menos 3 muestras para derivar", "TOO_SHORT")
    d1: list[float] = []
    d2: list[float] = []
    for i in range(n):
        start, k = (0, 0) if i == 0 else ((n - 3, 2) if i == n - 1 else (i - 1, 1))
        nodes = time[start : start + 3]
        w1 = _lagrange_weights(nodes, k)
        w2 = _second_weights(nodes)
        d1.append(sum(w1[j] * values[start + j] for j in range(3)))
        d2.append(sum(w2[j] * values[start + j] for j in range(3)))
    if not all(math.isfinite(v) for v in d1 + d2):
        _fail("la derivada produjo valores no finitos", "NON_FINITE_DERIVATIVE")

    tol = 1e-9 * max(1.0, max(abs(v) for v in d1))
    critical: list[CriticalPoint] = []
    for i in range(1, n - 1):
        up = d1[i - 1] < -tol and d1[i] >= -tol
        down = d1[i - 1] > tol and d1[i] <= tol
        if up or down:
            critical.append(
                CriticalPoint(
                    index=i,
                    t=time[i],
                    value=values[i],
                    kind="minimo" if up else "maximo",
                    d2=d2[i],
                )
            )
    sigma_d1 = _robust_std(d1)
    jumps: list[Jump] = []
    if sigma_d1 > 0:
        for i in range(n):
            if abs(d1[i]) > jump_sigma * sigma_d1:
                jumps.append(Jump(index=i, t=time[i], jump=d1[i], value=values[i]))

    return {
        "d1": d1,
        "d2": d2,
        "criticalPoints": critical,
        "jumps": jumps,
        "metrics": {
            "maxAbsD1": max(abs(v) for v in d1),
            "rmsD1": math.sqrt(sum(v * v for v in d1) / n),
            "maxAbsD2": max(abs(v) for v in d2),
            "rmsD2": math.sqrt(sum(v * v for v in d2) / n),
            "criticalCount": len(critical),
            "jumpCount": len(jumps),
            "sigmaD1": sigma_d1,
        },
    }


def compute_integral(clean: dict[str, Any], method: str) -> dict[str, Any]:
    time = clean["time"]
    values = clean["values"]
    n = len(values)
    if n < 2:
        _fail("se necesitan al menos 2 muestras para integrar", "TOO_SHORT")
    diffs = [time[i] - time[i - 1] for i in range(1, n)]
    uniform = max(diffs) - min(diffs) <= 1e-9 * max(1.0, clean["dtMedian"])
    cumulative = [0.0] * n
    energy_cumulative = [0.0] * n
    for i in range(1, n):
        h = time[i] - time[i - 1]
        cumulative[i] = cumulative[i - 1] + h * (values[i] + values[i - 1]) / 2
        energy_cumulative[i] = energy_cumulative[i - 1] + h * (
            values[i] * values[i] + values[i - 1] * values[i - 1]
        ) / 2

    simpson_segments = 0
    trapezoid_segments = 0
    defined = cumulative[-1]
    use_simpson = method == "simpson" or (method == "auto" and uniform)
    if use_simpson and uniform and n >= 3:
        h = time[1] - time[0]
        pairs = (n - 1) // 2
        simpson = 0.0
        for p in range(pairs):
            i = 2 * p
            simpson += (h / 3) * (values[i] + 4 * values[i + 1] + values[i + 2])
        if (n - 1) - 2 * pairs == 1:
            i = n - 2
            simpson += (time[i + 1] - time[i]) * (values[i] + values[i + 1]) / 2
            trapezoid_segments = 1
        simpson_segments = pairs
        defined = simpson
    else:
        trapezoid_segments = n - 1

    duration = time[-1] - time[0]
    energy = energy_cumulative[-1]
    if not all(math.isfinite(v) for v in (defined, energy, duration)):
        _fail("integral no finita", "NON_FINITE_INTEGRAL")
    return {
        "method": "simpson-compuesto" if use_simpson and uniform and n >= 3 else "trapecio",
        "simpsonSegments": simpson_segments,
        "trapezoidSegments": trapezoid_segments,
        "defined": defined,
        "cumulative": cumulative,
        "cumulativeEnergy": energy_cumulative,
        "energy": energy,
        "normL2": math.sqrt(max(0.0, energy)),
        "meanPower": energy / duration if duration > 0 else None,
        "duration": duration,
    }


def compute_vector(clean: dict[str, Any], derivative: dict[str, Any]) -> dict[str, Any]:
    phase = [
        [clean["values"][i], derivative["d1"][i], derivative["d2"][i]]
        for i in range(len(clean["values"]))
    ]
    if len(phase) < 2:
        _fail("se necesitan al menos 2 vectores de fase", "TOO_SHORT")
    magnitude = [math.sqrt(sum(c * c for c in p)) for p in phase]
    dot_prev = [0.0]
    cross_prev = [0.0]
    for i in range(1, len(phase)):
        a, b = phase[i], phase[i - 1]
        dot_prev.append(sum(a[j] * b[j] for j in range(3)))
        cross = [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ]
        cross_prev.append(math.sqrt(sum(c * c for c in cross)))
    return {
        "phaseVectors": phase,
        "maxMagnitude": max(magnitude),
        "meanMagnitude": sum(magnitude) / len(magnitude),
        "maxCrossMagnitude": max(cross_prev),
        "minDotPrev": min(dot_prev[1:]),
    }


def analyze_series(request: CalculusRequest) -> CalculusResponse:
    """Calcula todo y devuelve un contrato estricto; falla cerrado."""
    clean = sanitize_series(request.series, request.options)
    differential_raw = compute_derivative(clean)
    integral_raw = compute_integral(clean, request.method)
    vector_raw = compute_vector(clean, differential_raw)
    metrics = differential_raw["metrics"]
    return CalculusResponse(
        provenance=ProvenanceOut(**clean["provenance"]),
        diagnostics=clean["diagnostics"],
        n=len(clean["values"]),
        differential=DifferentialOut(
            method="lagrange-3-point-finite-differences",
            order=request.order,
            d1=differential_raw["d1"],
            d2=differential_raw["d2"],
            criticalPoints=differential_raw["criticalPoints"],
            jumps=differential_raw["jumps"],
            **metrics,
        ),
        integral=IntegralOut(**integral_raw),
        vector=VectorOut(**vector_raw),
    )


def analyze_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """Adaptador HTTP: valida el JSON, calcula y serializa (fail-closed)."""
    try:
        request = CalculusRequest.model_validate(payload)
    except ValidationError as exc:
        raise RealSeriesCalculusError(
            "payload inválido: " + "; ".join(e["msg"] for e in exc.errors(include_url=False)[:5]),
            "SCHEMA_INVALID",
        ) from exc
    return analyze_series(request).model_dump()
