/**
 * MMC — Cálculo numérico sobre series reales e imperfectas.
 *
 * Contrato de honestidad (invariante del ecosistema):
 *   · Este módulo es una TRANSFORMACIÓN determinista. Nunca cambia la procedencia
 *     de la señal: una serie SIM sigue siendo SIM; una captura C0/REAL-LOCAL
 *     sigue siendo C0/REAL-LOCAL. El campo `operator` identifica al operador
 *     numérico, NO es un estado de honestidad y NO puede elevar una fuente.
 *   · Todo fallo es explícito (fail-closed): hay un `code` y un mensaje, nunca
 *     un array relleno de ceros ni una métrica inventada.
 *   · Los valores NO finitos, los huecos y los outliers se reportingan en
 *     `diagnostics`; no se corrigen en silencio.
 *
 * Es ESM puro, sin React, sin DOM y sin red: se ejecuta igual en el navegador
 * que en `node --test`.
 */

export const CALCULUS_VERSION = 'real-series-calculus-v1';

export const ALLOWED_ESTADOS = Object.freeze(['REAL-LOCAL', 'LOCAL', 'SIM', 'ROTO', 'NO_DATA']);
export const ALLOWED_LAYERS = Object.freeze(['C0', 'C1', 'rules-v0', 'LOCAL']);

export class RealSeriesCalculusError extends Error {
  constructor(message, code = 'INVALID_SERIES') {
    super(message);
    this.name = 'RealSeriesCalculusError';
    this.code = code;
  }
}

const fail = (message, code) => {
  throw new RealSeriesCalculusError(message, code);
};

const median = (sorted) => {
  const n = sorted.length;
  if (!n) return NaN;
  const mid = n >> 1;
  return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const robustStd = (values) => {
  const finite = values.filter(Number.isFinite);
  if (finite.length < 2) return 0;
  const m = median([...finite].sort((a, b) => a - b));
  const mad = median(finite.map((v) => Math.abs(v - m)).sort((a, b) => a - b));
  return 1.4826 * mad;
};

const provenanceOf = (input = {}) => ({
  estado: ALLOWED_ESTADOS.includes(input.estado) ? input.estado : 'NO_DATA',
  layer: ALLOWED_LAYERS.includes(input.layer) ? input.layer : 'LOCAL',
  sourceKind: input.sourceKind ?? null,
  sourceLabel: input.sourceLabel ?? null,
  operator: CALCULUS_VERSION,
  inheritsState: true
});

/**
 * Limpieza explícita y verificable.
 *
 * @param {{time:Array|Float64Array, values:Array|Float64Array, estado?:string,
 *          layer?:string, sourceKind?:string, sourceLabel?:string}} input
 * @param {{minSamples?:number, maxInterpolateRun?:number, maxGapFactor?:number,
 *          outlierSigma?:number, outlierPolicy?:'clip'|'reject'|'keep'}} options
 */
export function sanitizeSeries(input, options = {}) {
  const {
    minSamples = 3,
    maxInterpolateRun = 3,
    maxGapFactor = 8,
    outlierSigma = 6,
    outlierPolicy = 'clip'
  } = options;
  if (!input || typeof input !== 'object') fail('serie ausente', 'NO_SERIES');
  if (!['clip', 'reject', 'keep'].includes(outlierPolicy)) fail('outlierPolicy no válida', 'BAD_OPTIONS');

  const time = Array.from(input.time ?? []);
  const raw = Array.from(input.values ?? []);
  if (time.length !== raw.length) {
    fail(`dimensiones divergentes: time=${time.length}, values=${raw.length}`, 'DIMENSION_MISMATCH');
  }
  if (time.length < minSamples) fail(`se necesitan al menos ${minSamples} muestras`, 'TOO_SHORT');
  if (time.some((t) => !Number.isFinite(t))) fail('el vector de tiempo contiene valores no finitos', 'NON_FINITE_TIME');
  for (let i = 1; i < time.length; i += 1) {
    if (!(time[i] > time[i - 1])) fail(`tiempo no estrictamente creciente en i=${i}`, 'NON_MONOTONIC_TIME');
  }

  const diffs = time.slice(1).map((t, i) => t - time[i]).sort((a, b) => a - b);
  const dtMedian = median(diffs);
  if (!(dtMedian > 0)) fail('paso de tiempo no positivo', 'BAD_SAMPLING');

  let droppedNonFinite = 0;
  const work = raw.map((v) => {
    if (!Number.isFinite(v)) {
      droppedNonFinite += 1;
      return null;
    }
    return v;
  });

  // Huecos: se interpolan solo tramos INTERIORES cortos y se declaran. Los
  // tramos largos o en los extremos se descartan: rellenarlos sería inventar
  // datos con los que además se calcularían derivadas falsas.
  let interpolatedGaps = 0;
  let droppedGapSamples = 0;
  for (let i = 0; i < work.length;) {
    if (work[i] !== null) { i += 1; continue; }
    let end = i;
    while (end < work.length && work[end] === null) end += 1;
    const run = end - i;
    const canInterpolate = i > 0 && end < work.length && run <= maxInterpolateRun;
    if (canInterpolate) {
      const left = work[i - 1];
      const right = work[end];
      for (let k = i; k < end; k += 1) {
        const u = (time[k] - time[i - 1]) / (time[end] - time[i - 1]);
        work[k] = left + u * (right - left);
      }
      interpolatedGaps += run;
    } else {
      for (let k = i; k < end; k += 1) work[k] = undefined;
      droppedGapSamples += run;
    }
    i = end;
  }

  let keptTime = [];
  let keptValues = [];
  for (let i = 0; i < work.length; i += 1) {
    if (work[i] !== null && work[i] !== undefined) {
      keptTime.push(time[i]);
      keptValues.push(work[i]);
    }
  }
  if (keptValues.length < minSamples) {
    fail(`quedan ${keptValues.length} muestras válidas (mínimo ${minSamples})`, 'TOO_FEW_AFTER_CLEAN');
  }

  // Outliers robustos (MAD): se recorta o se descarta, nunca se promedia en
  // silencio. `keep` existe para inspeccionar el dato tal cual llegó.
  const center = median([...keptValues].sort((a, b) => a - b));
  const sigma = robustStd(keptValues);
  const limit = outlierSigma * sigma;
  let clippedOutliers = 0;
  let rejectedOutliers = 0;
  const finalTime = [];
  const finalValues = [];
  for (let i = 0; i < keptValues.length; i += 1) {
    const v = keptValues[i];
    const isOutlier = sigma > 0 && Math.abs(v - center) > limit;
    if (isOutlier && outlierPolicy === 'reject') {
      rejectedOutliers += 1;
      continue;
    }
    if (isOutlier && outlierPolicy === 'clip') {
      clippedOutliers += 1;
      finalTime.push(keptTime[i]);
      finalValues.push(v > center ? center + limit : center - limit);
      continue;
    }
    finalTime.push(keptTime[i]);
    finalValues.push(v);
  }
  if (finalValues.length < minSamples) fail('outliers eliminaron demasiadas muestras', 'TOO_FEW_AFTER_OUTLIERS');

  const finalDiffs = finalTime.slice(1).map((t, i) => t - finalTime[i]);
  const maxGapSeconds = Math.max(...finalDiffs);
  if (maxGapSeconds > maxGapFactor * dtMedian) {
    fail(
      `hueco de ${maxGapSeconds.toFixed(6)} s supera ${maxGapFactor}× el paso mediano ${dtMedian.toFixed(6)} s`,
      'GAP_TOO_LARGE'
    );
  }

  return {
    ok: true,
    time: Float64Array.from(finalTime),
    values: Float64Array.from(finalValues),
    dtMedian,
    maxGapSeconds,
    diagnostics: {
      inputCount: raw.length,
      outputCount: finalValues.length,
      droppedNonFinite,
      interpolatedGaps,
      droppedGapSamples,
      clippedOutliers,
      rejectedOutliers,
      outlierCenter: center,
      outlierSigma: sigma,
      outlierLimit: limit,
      outlierPolicy,
      monotonic: true
    },
    provenance: provenanceOf(input)
  };
}

const asSanitized = (input, options) => {
  if (input && input.ok && input.time && input.values && input.diagnostics) return input;
  return sanitizeSeries(input, options);
};

/** Derivada de Lagrange de 3 nodos en el nodo k (k = 0 | 1 | 2). */
const lagrangeWeights = (nodes, k) => {
  const w = new Array(3);
  for (let i = 0; i < 3; i += 1) {
    if (i === k) {
      w[i] = nodes.reduce((sum, t, j) => (j === k ? sum : sum + 1 / (nodes[k] - t)), 0);
    } else {
      let product = 1;
      for (let j = 0; j < 3; j += 1) {
        if (j !== i && j !== k) product *= (nodes[k] - nodes[j]) / (nodes[i] - nodes[j]);
      }
      w[i] = product / (nodes[i] - nodes[k]);
    }
  }
  return w;
};

/** Segunda derivada de una parábola definida por 3 nodos (constante). */
const secondDerivativeWeights = (nodes) => nodes.map((t, i) => {
  let product = 1;
  for (let j = 0; j < 3; j += 1) if (j !== i) product *= t - nodes[j];
  return 2 / product;
});

const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
const norm3 = (v) => Math.hypot(v[0], v[1], v[2]);

/**
 * Derivadas numéricas first/second-order sobre rejilla uniforme o irregular.
 * Tres puntos por stencil: exacto para polinomios de grado 2, con pesos de
 * Lagrange calculados a partir de los tiempos reales (no asume dt constante).
 */
export function computeDerivative(input, options = {}) {
  const { order = 1, jumpSigma = 8, zeroTolerance = 1e-9 } = options;
  if (order !== 1 && order !== 2) fail('order debe ser 1 o 2', 'BAD_ORDER');
  const clean = asSanitized(input, options);
  const n = clean.values.length;
  if (n < 3) fail('se necesitan al menos 3 muestras para derivar', 'TOO_SHORT');

  const d1 = new Float64Array(n);
  const d2 = new Float64Array(n);
  for (let i = 0; i < n; i += 1) {
    let start;
    let k;
    if (i === 0) { start = 0; k = 0; }
    else if (i === n - 1) { start = n - 3; k = 2; }
    else { start = i - 1; k = 1; }
    const nodes = [clean.time[start], clean.time[start + 1], clean.time[start + 2]];
    const w1 = lagrangeWeights(nodes, k);
    const w2 = secondDerivativeWeights(nodes);
    let v1 = 0;
    let v2 = 0;
    for (let j = 0; j < 3; j += 1) {
      v1 += w1[j] * clean.values[start + j];
      v2 += w2[j] * clean.values[start + j];
    }
    d1[i] = v1;
    d2[i] = v2;
  }
  if (Array.from(d1).some((v) => !Number.isFinite(v)) || Array.from(d2).some((v) => !Number.isFinite(v))) {
    fail('la derivada produjo valores no finitos', 'NON_FINITE_DERIVATIVE');
  }

  // Puntos críticos: cruce de cero de d1 con histerésis tolerante.
  const scale = Math.max(1, ...Array.from(d1, Math.abs));
  const tol = zeroTolerance * scale;
  const criticalPoints = [];
  for (let i = 1; i < n - 1; i += 1) {
    const prev = d1[i - 1];
    const curr = d1[i];
    const crossedUp = prev < -tol && curr >= -tol;
    const crossedDown = prev > tol && curr <= tol;
    if (!crossedUp && !crossedDown) continue;
    criticalPoints.push({
      index: i,
      t: clean.time[i],
      value: clean.values[i],
      kind: crossedUp ? 'minimo' : 'maximo',
      d2: d2[i]
    });
  }

  // Saltos: derivada extrema respecto a la dispersión robusta de la propia d1.
  const sigmaD1 = robustStd(Array.from(d1));
  const jumps = [];
  if (sigmaD1 > 0) {
    for (let i = 0; i < n; i += 1) {
      if (Math.abs(d1[i]) > jumpSigma * sigmaD1) {
        jumps.push({ index: i, t: clean.time[i], jump: d1[i], value: clean.values[i] });
      }
    }
  }

  const values = order === 1 ? d1 : d2;
  return {
    ok: true,
    order,
    method: 'lagrange-3-point-finite-differences',
    time: clean.time,
    values,
    d1,
    d2,
    criticalPoints,
    jumps,
    metrics: {
      maxAbsD1: Math.max(...Array.from(d1, Math.abs)),
      rmsD1: Math.sqrt(Array.from(d1).reduce((s, v) => s + v * v, 0) / n),
      maxAbsD2: Math.max(...Array.from(d2, Math.abs)),
      rmsD2: Math.sqrt(Array.from(d2).reduce((s, v) => s + v * v, 0) / n),
      criticalCount: criticalPoints.length,
      jumpCount: jumps.length,
      sigmaD1
    },
    provenance: clean.provenance
  };
}

/**
 * Integración definida y acumulada: trapecio / Simpson compuesto, energía ∫x²dt,
 * norma L² y potencia media. Devuelve el método REALMENTE usado y sus conteos.
 */
export function computeIntegral(input, options = {}) {
  const { method = 'auto' } = options;
  if (!['auto', 'trapecio', 'simpson'].includes(method)) fail('method no válido', 'BAD_METHOD');
  const clean = asSanitized(input, options);
  const n = clean.values.length;
  if (n < 2) fail('se necesitan al menos 2 muestras para integrar', 'TOO_SHORT');

  const t = clean.time;
  const v = clean.values;
  const cumulative = new Float64Array(n);
  const cumulativeEnergy = new Float64Array(n);
  let simpsonSegments = 0;
  let trapezoidSegments = 0;
  const uniform = n >= 3 && Math.max(...t.slice(1).map((x, i) => x - t[i]))
    - Math.min(...t.slice(1).map((x, i) => x - t[i])) <= 1e-9 * Math.max(1, clean.dtMedian);
  const useSimpson = method === 'simpson' || (method === 'auto' && uniform);

  for (let i = 1; i < n; i += 1) {
    const h = t[i] - t[i - 1];
    cumulative[i] = cumulative[i - 1] + h * (v[i] + v[i - 1]) / 2;
    cumulativeEnergy[i] = cumulativeEnergy[i - 1] + h * (v[i] * v[i] + v[i - 1] * v[i - 1]) / 2;
  }

  let defined = cumulative[n - 1];
  if (useSimpson && uniform && n >= 3) {
    const h = t[1] - t[0];
    const pairs = Math.floor((n - 1) / 2);
    let simpson = 0;
    for (let p = 0; p < pairs; p += 1) {
      const i = 2 * p;
      simpson += (h / 3) * (v[i] + 4 * v[i + 1] + v[i + 2]);
    }
    const remainder = (n - 1) - 2 * pairs;
    if (remainder === 1) {
      const i = n - 2;
      simpson += (t[i + 1] - t[i]) * (v[i] + v[i + 1]) / 2;
      trapezoidSegments = 1;
    }
    simpsonSegments = pairs;
    defined = simpson;
  } else {
    trapezoidSegments = n - 1;
  }

  const duration = t[n - 1] - t[0];
  const energy = cumulativeEnergy[n - 1];
  if (![defined, energy, duration].every(Number.isFinite)) fail('integral no finita', 'NON_FINITE_INTEGRAL');
  return {
    ok: true,
    method: useSimpson && uniform && n >= 3 ? 'simpson-compuesto' : 'trapecio',
    simpsonSegments,
    trapezoidSegments,
    cumulative,
    cumulativeEnergy,
    defined,
    energy,
    normL2: Math.sqrt(Math.max(0, energy)),
    meanPower: duration > 0 ? energy / duration : null,
    duration,
    provenance: clean.provenance
  };
}

/**
 * Cálculo vectorial sobre la ventana deslizante (x, x′, x″).
 * Todas las magnitudes derivan de la serie original: ninguna se sintetiza.
 */
export function computeVectorCalculus(input, options = {}) {
  const derivative = computeDerivative(input, { ...options, order: 2 });
  const clean = asSanitized(input, options);
  const phaseVectors = [];
  for (let i = 0; i < clean.values.length; i += 1) {
    phaseVectors.push([clean.values[i], derivative.d1[i], derivative.d2[i]]);
  }
  if (phaseVectors.length < 2) fail('se necesitan al menos 2 vectores de fase', 'TOO_SHORT');

  const magnitude = phaseVectors.map(norm3);
  const dotPrev = [0];
  const crossPrev = [0];
  for (let i = 1; i < phaseVectors.length; i += 1) {
    dotPrev.push(dot3(phaseVectors[i], phaseVectors[i - 1]));
    crossPrev.push(norm3(cross3(phaseVectors[i], phaseVectors[i - 1])));
  }
  return {
    ok: true,
    time: clean.time,
    phaseVectors,
    magnitude,
    dotPrev,
    crossPrev,
    metrics: {
      maxMagnitude: Math.max(...magnitude),
      meanMagnitude: magnitude.reduce((s, m) => s + m, 0) / magnitude.length,
      maxCrossMagnitude: Math.max(...crossPrev),
      minDotPrev: Math.min(...dotPrev.slice(1))
    },
    provenance: clean.provenance
  };
}

const validateField = (field, name) => {
  if (!Array.isArray(field) || field.length < 2) fail(`${name} debe tener al menos 2 filas`, 'BAD_FIELD');
  const cols = field[0]?.length;
  if (!Number.isInteger(cols) || cols < 2) fail(`${name} debe tener al menos 2 columnas`, 'BAD_FIELD');
  for (const row of field) {
    if (!Array.isArray(row) || row.length !== cols || row.some((v) => !Number.isFinite(v))) {
      fail(`${name} no es rectangular o contiene valores no finitos`, 'BAD_FIELD');
    }
  }
  return cols;
};

const gridPartial = (field, axis, dx) => field.map((row, i) => row.map((value, j) => {
  const n = field.length;
  const m = row.length;
  if (axis === 'x') {
    if (j === 0) return (field[i][1] - field[i][0]) / dx;
    if (j === m - 1) return (field[i][m - 1] - field[i][m - 2]) / dx;
    return (field[i][j + 1] - field[i][j - 1]) / (2 * dx);
  }
  if (i === 0) return (field[1][j] - field[0][j]) / dx;
  if (i === n - 1) return (field[n - 1][j] - field[n - 2][j]) / dx;
  return (field[i + 1][j] - field[i - 1][j]) / (2 * dx);
}));

/** Gradiente numérico de un campo escalar en grilla (u,v). */
export function scalarFieldGradient(field, options = {}) {
  const { dx = 1, dy = 1, provenance = provenanceOf({ estado: 'SIM', layer: 'rules-v0' }) } = options;
  if (!(dx > 0) || !(dy > 0)) fail('dx y dy deben ser positivos', 'BAD_GRID');
  validateField(field, 'field');
  const gx = gridPartial(field, 'x', dx);
  const gy = gridPartial(field, 'y', dy);
  const magnitude = gx.map((row, i) => row.map((value, j) => Math.hypot(value, gy[i][j])));
  return { ok: true, gx, gy, magnitude, provenance };
}

/** Divergencia y rotacional (z) de un campo vectorial 2D en grilla. */
export function vectorFieldCalculus(u, v, options = {}) {
  const { dx = 1, dy = 1, provenance = provenanceOf({ estado: 'SIM', layer: 'rules-v0' }) } = options;
  if (!(dx > 0) || !(dy > 0)) fail('dx y dy deben ser positivos', 'BAD_GRID');
  const cols = validateField(u, 'u');
  if (validateField(v, 'v') !== cols || v.length !== u.length) {
    fail('los campos u y v deben tener las mismas dimensiones', 'DIMENSION_MISMATCH');
  }
  const dudx = gridPartial(u, 'x', dx);
  const dvdy = gridPartial(v, 'y', dy);
  const dvdx = gridPartial(v, 'x', dx);
  const dudy = gridPartial(u, 'y', dy);
  const divergence = dudx.map((row, i) => row.map((value, j) => value + dvdy[i][j]));
  const curlZ = dvdx.map((row, i) => row.map((value, j) => value - dudy[i][j]));
  return { ok: true, divergence, curlZ, provenance };
}

/** Operación compuesta usada por la UI y por el contrato HTTP. */
export function analyzeRealSeries(input, options = {}) {
  try {
    const clean = sanitizeSeries(input, options);
    const differential = computeDerivative(clean, options);
    const integral = computeIntegral(clean, options);
    const vector = computeVectorCalculus(clean, options);
    return {
      ok: true,
      version: CALCULUS_VERSION,
      provenance: clean.provenance,
      diagnostics: clean.diagnostics,
      n: clean.values.length,
      differential: {
        method: differential.method,
        order: differential.order,
        criticalPoints: differential.criticalPoints,
        jumps: differential.jumps,
        metrics: differential.metrics
      },
      integral: {
        method: integral.method,
        simpsonSegments: integral.simpsonSegments,
        trapezoidSegments: integral.trapezoidSegments,
        defined: integral.defined,
        cumulative: Array.from(integral.cumulative),
        cumulativeEnergy: Array.from(integral.cumulativeEnergy),
        energy: integral.energy,
        normL2: integral.normL2,
        meanPower: integral.meanPower,
        duration: integral.duration
      },
      vector: vector.metrics,
      summary: {
        rmsD1: differential.metrics.rmsD1,
        rmsD2: differential.metrics.rmsD2,
        criticalCount: differential.metrics.criticalCount,
        jumpCount: differential.metrics.jumpCount,
        quadrature: integral.method,
        energy: integral.energy,
        normL2: integral.normL2,
        maxMagnitude: vector.metrics.maxMagnitude
      }
    };
  } catch (err) {
    return {
      ok: false,
      version: CALCULUS_VERSION,
      error: err.message,
      code: err.code ?? 'CALCULUS_FAILED',
      provenance: provenanceOf(input)
    };
  }
}

// Los arrays completos se dejan en las funciones individuales: la UI decide
// qué muestra y qué publica en S35 (siempre acotado).
export const __internals = { lagrangeWeights, secondDerivativeWeights, dot3, cross3, norm3, robustStd };
