import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALLOWED_ESTADOS,
  CALCULUS_VERSION,
  RealSeriesCalculusError,
  analyzeRealSeries,
  computeDerivative,
  computeIntegral,
  computeVectorCalculus,
  sanitizeSeries,
  scalarFieldGradient,
  vectorFieldCalculus,
  __internals
} from './realSeriesCalculus.js';

const range = (n) => Array.from({ length: n }, (_, i) => i);
const source = (time, values, extra = {}) => ({
  time,
  values,
  estado: 'REAL-LOCAL',
  layer: 'C0',
  sourceKind: 'envelope',
  sourceLabel: 'fixture-C0',
  ...extra
});

test('derivadas first/second-order sobre serie uniforme limpia', () => {
  const h = 0.005;
  const time = range(2514).map((i) => i * h); // dos períodos completos (≈12.57 s)
  const values = time.map(Math.sin);
  const first = computeDerivative(source(time, values), { order: 1 });
  const second = computeDerivative(source(time, values), { order: 2 });

  assert.equal(first.ok, true);
  assert.equal(first.provenance.estado, 'REAL-LOCAL');
  for (const i of [0, 1, 314, 628, 942, 2513]) {
    // Los extremos usan stencil unilateral (orden menor): tolerancia mayor y
    // declarada, no un número inventado para que el test pase.
    const tolD1 = i === 0 || i === 2513 ? 5e-3 : 1e-4;
    const tolD2 = i === 0 || i === 2513 ? 5e-3 : 1e-4;
    assert.ok(Math.abs(first.d1[i] - Math.cos(time[i])) < tolD1, `d1 en i=${i}`);
    assert.ok(Math.abs(second.d2[i] + Math.sin(time[i])) < tolD2, `d2 en i=${i}`);
  }
  assert.ok(first.metrics.criticalCount >= 1);
});

test('derivada exacta sobre rejilla irregular (recta)', () => {
  const time = [0, 0.1, 0.35, 0.4, 0.9];
  const values = time.map((t) => 2 * t + 1);
  const result = computeDerivative(source(time, values));
  for (let i = 0; i < time.length; i += 1) {
    assert.ok(Math.abs(result.d1[i] - 2) < 1e-9, `d1 irregular en i=${i}`);
    assert.ok(Math.abs(result.d2[i]) < 1e-9, `d2 irregular en i=${i}`);
  }
});

test('integración Simpson/trapecio, energía y norma L2', () => {
  const time = range(101).map((i) => (i * 2 * Math.PI) / 100);
  const values = time.map(Math.sin);
  const integral = computeIntegral(source(time, values), { method: 'auto' });
  assert.equal(integral.method, 'simpson-compuesto');
  assert.ok(Math.abs(integral.defined) < 1e-6);
  assert.ok(Math.abs(integral.energy - Math.PI) < 1e-3);
  assert.ok(Math.abs(integral.normL2 - Math.sqrt(Math.PI)) < 1e-3);
  assert.ok(Math.abs(integral.meanPower - 0.5) < 1e-3);
  assert.equal(integral.cumulative.length, values.length);

  const quadTime = range(5).map((i) => i / 4);
  const quad = computeIntegral(source(quadTime, quadTime.map((t) => t * t)));
  assert.equal(quad.method, 'simpson-compuesto');
  assert.ok(Math.abs(quad.defined - 1 / 3) < 1e-12);
});

test('integración con número impar de intervalos declara el trapecio residual', () => {
  const time = range(6).map((i) => i / 5);
  const values = time.map((t) => t * t + 0.3 * Math.sin(9 * t));
  const integral = computeIntegral(source(time, values), { method: 'simpson' });
  assert.equal(integral.simpsonSegments, 2);
  assert.equal(integral.trapezoidSegments, 1);
  assert.ok(Number.isFinite(integral.defined));
});

test('limpieza real: NaN/Inf, huecos y outliers se reportan, no se inventan', () => {
  const time = range(8).map((i) => i * 0.01);
  const values = [0, 0.1, NaN, -0.1, Infinity, 0.05, -0.05, 50];
  const clean = sanitizeSeries(source(time, values));
  assert.equal(clean.ok, true);
  assert.equal(clean.diagnostics.inputCount, 8);
  assert.equal(clean.diagnostics.outputCount, 8);
  assert.equal(clean.diagnostics.droppedNonFinite, 2);
  assert.equal(clean.diagnostics.interpolatedGaps, 2);
  assert.equal(clean.diagnostics.clippedOutliers, 1);
  assert.equal(clean.provenance.estado, 'REAL-LOCAL');
  assert.equal(clean.provenance.layer, 'C0');
  assert.equal(clean.provenance.inheritsState, true);
  assert.ok(clean.values.every(Number.isFinite));
});

test('cálculo vectorial: fase (x, x′, x″), normas, punto y cruz finitos', () => {
  const time = range(80).map((i) => i * 0.01);
  const values = time.map((t) => Math.sin(2 * Math.PI * 5 * t) + 0.02 * Math.cos(97 * t));
  const vector = computeVectorCalculus(source(time, values));
  assert.equal(vector.ok, true);
  assert.equal(vector.phaseVectors.length, values.length);
  assert.equal(vector.magnitude.length, values.length);
  assert.ok(vector.magnitude.every(Number.isFinite));
  assert.ok(vector.crossPrev.every((v) => Number.isFinite(v) && v >= 0));
  assert.ok(vector.metrics.maxMagnitude > 0);
  assert.equal(vector.provenance.estado, 'REAL-LOCAL');

  const a = [1, 0, 0];
  const b = [0, 1, 0];
  assert.equal(__internals.dot3(a, b), 0);
  assert.deepEqual(__internals.cross3(a, b), [0, 0, 1]);
  assert.equal(__internals.norm3([3, 4, 0]), 5);
});

test('gradiente escalar, divergencia y rotacional en grilla', () => {
  const dx = 0.5;
  const dy = 0.25;
  const field = range(5).map((i) => range(4).map((j) => (j * dx) ** 2 + (i * dy) ** 2));
  const gradient = scalarFieldGradient(field, { dx, dy });
  assert.ok(Math.abs(gradient.gx[2][2] - 2 * (2 * dx)) < 1e-12);
  assert.ok(Math.abs(gradient.gy[2][2] - 2 * (2 * dy)) < 1e-12);
  assert.ok(gradient.magnitude.every((row) => row.every(Number.isFinite)));

  const u = range(5).map(() => range(4).map((j) => j * dx));
  const v = range(5).map((i) => range(4).map(() => -(i * dy)));
  const fieldCalculus = vectorFieldCalculus(u, v, { dx, dy });
  for (const row of fieldCalculus.divergence) {
    for (const value of row) assert.ok(Math.abs(value) < 1e-12);
  }
  for (const row of fieldCalculus.curlZ) {
    for (const value of row) assert.ok(Math.abs(value) < 1e-12);
  }
  assert.throws(
    () => vectorFieldCalculus(u, range(5).map(() => [0, 1]), {}),
    RealSeriesCalculusError
  );
});

test('detección de críticos y saltos sobre dato ruidoso', () => {
  const time = range(101).map((i) => i * 0.01);
  const values = time.map((t, i) => -((t - 0.5) ** 2) + 0.003 * Math.sin(251 * t) + (i === 70 ? 4 : 0));
  const result = analyzeRealSeries(source(time, values));
  assert.equal(result.ok, true);
  assert.ok(result.differential.criticalPoints.some((p) => p.kind === 'maximo' && Math.abs(p.t - 0.5) < 0.02));
  assert.ok(result.differential.jumps.some((j) => Math.abs(j.t - 0.7) < 0.02));
  assert.ok(result.summary.rmsD1 > 0);
});

test('fail-closed: muestras cortas, tiempo no monótono, dimensiones y huecos enormes', () => {
  const cases = [
    [source([0, 1], [1, 2]), 'TOO_SHORT'],
    [source([0, 1, 1, 2], [1, 2, 3, 4]), 'NON_MONOTONIC_TIME'],
    [source([0, 1, 2], [1, 2]), 'DIMENSION_MISMATCH'],
    [source([0, 1, 2, 100], [1, 2, 3, 4]), 'GAP_TOO_LARGE'],
    [source([0, 1, 2, 3], [NaN, NaN, NaN, NaN]), 'TOO_FEW_AFTER_CLEAN']
  ];
  for (const [input, code] of cases) {
    const result = analyzeRealSeries(input);
    assert.equal(result.ok, false, `debe fallar: ${code}`);
    assert.equal(result.code, code);
    assert.ok(result.error.length > 0);
  }
});

test('provenancia nunca se eleva: SIM sigue SIM y estados desconocidos degradan', () => {
  const time = range(20).map((i) => i * 0.01);
  const values = time.map((t) => Math.sin(t));
  const sim = computeDerivative(source(time, values, { estado: 'SIM', layer: 'rules-v0' }));
  assert.equal(sim.provenance.estado, 'SIM');
  assert.equal(sim.provenance.layer, 'rules-v0');
  assert.equal(sim.provenance.operator, CALCULUS_VERSION);

  const unknown = computeIntegral(source(time, values, { estado: 'REAL', layer: 'C9' }));
  assert.equal(unknown.provenance.estado, 'NO_DATA');
  assert.equal(unknown.provenance.layer, 'LOCAL');
  assert.ok(ALLOWED_ESTADOS.includes(sim.provenance.estado));
});
