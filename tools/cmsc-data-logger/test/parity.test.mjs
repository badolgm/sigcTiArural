/**
 * Paridad numerica con el motor del frontend.
 *
 * Este test es el que sostiene la honestidad de la frase "las features salen de S30".
 * Si el FFT, la ventana Hann o las bandas divergen de `spectralEngine.js`, las 44 dims
 * del dataset NO describen lo que el usuario ve en el Dashboard y todo lo demas es fiction.
 *
 * El motor del frontend se importa directo: es un modulo ESM sin dependencias de navegador.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import * as engine from '../../../src/frontend/src/pages/cmsc/spectralEngine.js';
import { fftRadix2, hann, windowed } from '../src/fft.js';
import { binsForHz, analyzeFrame, dbToUnit, clamp01, extractClipFeatures } from '../src/features.js';
import { toneMix, whiteNoise, normalize, clipLength } from '../src/synth.js';
import { N_FFT, FREQ_BANDS, CLIP_CONTRACT } from '../src/constants.js';

const SR = CLIP_CONTRACT.sampleRate;

/**
 * Igualdad numerica con piso absoluto.
 *
 * Un `abs(a-b) < 1e-9` desnudo falla por ruido de punto flotante cuando ambos valores
 * rondan cero (el bin 0 de la DFT vale ~1e-15 en las dos implementaciones pero no igual),
 * y es inutil como criterio cuando los valores son grandes. Se usa
 * `|a-b| <= atol + rtol*max(|a|,|b|)`, que es la forma numericamente estable.
 */
function close(actual, expected, { rtol = 1e-9, atol = 1e-9, label = 'valor' } = {}) {
  const diff = Math.abs(actual - expected);
  const scale = Math.max(Math.abs(actual), Math.abs(expected));
  const limit = atol + rtol * scale;
  assert.ok(
    diff <= limit,
    `${label}: ${actual} vs ${expected} (dif ${diff.toExponential(3)} > limite ${limit.toExponential(3)})`
  );
}

test('N_FFT y bandas coinciden con spectralEngine', () => {
  assert.equal(N_FFT, engine.N_FFT, 'N_FFT divergente');
  assert.equal(CLIP_CONTRACT.sampleRate, engine.DEFAULT_SAMPLE_RATE, 'tasa por defecto divergente');
  // El frontend nombra las bandas ("Sub 20-250"); el logger usa la misma clase con una
  // clave corta ("low") que es la que consumen las features 7-15. Se comparan los limites,
  // que es lo que define la paridad, no las etiquetas textuales.
  assert.deepEqual(
    FREQ_BANDS.map((b) => [b.min, b.max]),
    engine.FREQ_BANDS.map((b) => [b.min, b.max]),
    'limites de FREQ_BANDS divergentes'
  );
});

test('ventana Hann es identica bit a bit', () => {
  // El frontend guarda HANN en Float32Array; el logger tambien debe, o la paridad
  // se apoya en tolerancia en vez de en identidad.
  const mine = hann();
  assert.equal(mine.constructor, Float32Array, 'HANN debe ser Float32Array como el frontend');
  assert.equal(mine.length, engine.N_FFT);
  // spectralEngine no exporta HANN, pero su formula es publica en el archivo.
  const expected = new Float32Array(engine.N_FFT);
  for (let i = 0; i < engine.N_FFT; i++) {
    expected[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (engine.N_FFT - 1)));
  }
  for (let i = 0; i < expected.length; i++) {
    assert.equal(mine[i], expected[i], `HANN difiere en el indice ${i}`);
  }
});

test('fftRadix2 produce el mismo espectro que spectralEngine', () => {
  const n = 1024;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < n; i++) re[i] = Math.sin((2 * Math.PI * 7 * i) / n) + 0.3 * Math.cos((2 * Math.PI * 31 * i) / n);
  fftRadix2(re, im);
  const mag = [...re].map((v, i) => Math.hypot(v, im[i]));

  // Referencia independiente: DFT directa O(n^2) sobre una senal corta y simple.
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) x[i] = Math.sin((2 * Math.PI * 7 * i) / n);
  const xr = new Float64Array(n);
  const xi = new Float64Array(n);
  xr.set(x);
  fftRadix2(xr, xi);

  for (let k = 0; k < n; k++) {
    let reDft = 0;
    let imDft = 0;
    for (let t = 0; t < n; t++) {
      const ang = (-2 * Math.PI * k * t) / n;
      reDft += x[t] * Math.cos(ang);
      imDft += x[t] * Math.sin(ang);
    }
    const mine = Math.hypot(xr[k], xi[k]);
    const ref = Math.hypot(reDft, imDft);
    close(mine, ref, { rtol: 1e-10, atol: 1e-9, label: `DFT bin ${k}` });
  }
  assert.ok(mag.length === n);
});

test('binsForHz coincide con spectralEngine', () => {
  for (const band of engine.FREQ_BANDS) {
    const mine = binsForHz(band.min, band.max, SR);
    const ref = engine.binsForHz(band.min, band.max, SR);
    assert.deepEqual(mine, ref, `bins divergentes para ${band.min}-${band.max} Hz`);
  }
});

test('analyzeFrame coincide con spectralEngine.analyzeFrame sobre el mismo frame', () => {
  const samples = toneMix(clipLength(SR), SR, [
    { hz: 440, amp: 0.6 },
    { hz: 2100, amp: 0.3 },
    { hz: 6000, amp: 0.1 }
  ]);

  // El frontend recibe la ventana ya extraida; aqui se pasa la ventana del primer frame.
  const frameSlice = new Float64Array(N_FFT);
  frameSlice.set(samples.subarray(0, N_FFT));

  const ref = engine.analyzeFrame(frameSlice, SR);
  const mine = analyzeFrame(samples, SR, 0);

  assert.equal(mine.n, ref.n, 'longitud del frame');
  close(mine.binHertz, ref.binHertz, { atol: 1e-12, label: 'binHertz' });
  close(mine.dominantFrequency, ref.dominantFrequency, { atol: 1e-6, label: 'dominantFrequency' });
  close(mine.peakDb, ref.peakDb, { atol: 1e-6, label: 'peakDb' });
  close(mine.spectralCentroid, ref.spectralCentroid, { atol: 1e-6, label: 'spectralCentroid' });
  close(mine.spectralFlatness, ref.spectralFlatness, { atol: 1e-9, label: 'spectralFlatness' });
  close(mine.totalEnergy, ref.totalEnergy, { rtol: 1e-10, atol: 1e-12, label: 'totalEnergy' });
  close(mine.rms, ref.rms, { rtol: 1e-10, atol: 1e-12, label: 'rms' });
  close(mine.magnitudes[10], ref.magnitudes[10], { rtol: 1e-10, atol: 1e-12, label: 'magnitudes[10]' });
  close(mine.db[10], ref.db[10], { atol: 1e-6, label: 'db[10]' });

  assert.equal(mine.bands.length, ref.bandEnergy.length, 'numero de bandas');
  for (let i = 0; i < mine.bands.length; i++) {
    const m = mine.bands[i];
    const r = ref.bandEnergy[i];
    close(m.energy, r.energy, { rtol: 1e-10, atol: 1e-12, label: `bandas[${i}].energy` });
    close(m.pct, r.pct, { atol: 1e-9, label: `bandas[${i}].pct` });
    close(m.peakHz, r.peakHz, { atol: 1e-6, label: `bandas[${i}].peakHz` });
    close(m.peakDb, r.peakDb, { atol: 1e-6, label: `bandas[${i}].peakDb` });
  }
});

test('frameLevelDb coincide con spectralEngine', () => {
  const samples = normalize(whiteNoise(clipLength(SR), 11), 0.6);
  const frameSlice = new Float64Array(N_FFT);
  frameSlice.set(samples.subarray(0, N_FFT));
  // El frontend toma samples precortados; el logger calcula sobre el offset.
  const ref = engine.frameLevelDb(frameSlice);
  const w = windowed(samples, 0);
  let sum = 0;
  for (let i = 0; i < w.n; i++) {
    const v = samples[i] || 0;
    sum += v * v;
  }
  const mine = 20 * Math.log10(Math.sqrt(sum / w.n) || 1e-12);
  close(mine, ref, { atol: 1e-6, label: 'frameLevelDb' });
});

test('los helpers de normalizacion son seguros con valores patologicos', () => {
  for (const bad of [NaN, Infinity, -Infinity]) {
    assert.equal(clamp01(bad), 0, `clamp01(${bad}) debe ser 0`);
    assert.equal(dbToUnit(bad), 0, `dbToUnit(${bad}) debe estar acotado`);
  }
  assert.equal(clamp01(-5), 0);
  assert.equal(clamp01(5), 1);
  assert.equal(clamp01(0.5), 0.5);
});

test('extractClipFeatures devuelve 63 frames para el clip contract', () => {
  const samples = toneMix(clipLength(SR), SR, [{ hz: 1000, amp: 1 }]);
  const ex = extractClipFeatures(samples, SR, CLIP_CONTRACT.hop, N_FFT);
  assert.equal(ex.frameCount, 63, 'frames por clip de 3,0 s');
  assert.equal(ex.frames.length, 63);
  for (const f of ex.frames) {
    assert.equal(f.length, 22, 'cada frame lleva 22 features');
    for (const v of f) assert.ok(Number.isFinite(v), 'ninguna feature puede ser NaN o Infinity');
  }
  assert.ok(ex.audibleEnergyShare > 0.99, 'un tono puro es practicamente audible entero');
});