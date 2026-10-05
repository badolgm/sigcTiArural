/**
 * FFT radix-2 in-place + ventana Hann.
 *
 * PARIDAD: `fftRadix2` es una reimplementacion literal de `spectralEngine.js:19-55`
 * (mismo bit-reversal, mismo twiddle recursion). `hann()` reproduce `spectralEngine.js:14-17`.
 * `test/parity.test.mjs` verifica igualdad numerica contra el motor del frontend.
 */

import { N_FFT } from './constants.js';

// Float32Array a proposito: el frontend tambien guarda HANN en Float32Array
// (spectralEngine.js:14), asi que la paridad numerica es exacta y no por tolerancia.
const HANN = (() => {
  const w = new Float32Array(N_FFT);
  for (let i = 0; i < N_FFT; i++) {
    w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N_FFT - 1)));
  }
  return w;
})();

export function hann() {
  return HANN;
}

/** FFT radix-2 in-place. `re` e `im` deben tener longitud potencia de 2. */
export function fftRadix2(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    const wR = Math.cos(angle);
    const wI = Math.sin(angle);
    const half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let curR = 1;
      let curI = 0;
      for (let k = 0; k < half; k++) {
        const a = re[i + k];
        const b = im[i + k];
        const c = re[i + k + half];
        const d = im[i + k + half];
        const vR = c * curR - d * curI;
        const vI = c * curI + d * curR;
        re[i + k] = a + vR;
        im[i + k] = b + vI;
        re[i + k + half] = a - vR;
        im[i + k + half] = b - vI;
        const nR = curR * wR - curI * wI;
        curI = curR * wI + curI * wR;
        curR = nR;
      }
    }
  }
}

/**
 * Aplica la ventana Hann a `samples` y devuelve los arrays reales/imaginarios listos para FFT.
 * Los samples por debajo de la longitud de la ventana se rellenan con cero.
 */
export function windowed(samples, offset = 0) {
  // Float32Array como `spectralEngine.js:67-68`. El redondeo del buffer de entrada ANTES de la
  // FFT es lo que fija la paridad: con Float64 aqui el espectro entero se desvía lo bastante
  // como para mover spectralCentroid ~6e-3 Hz. La paridad exige la misma precision, no una
  // mayor.
  const re = new Float32Array(N_FFT);
  const im = new Float32Array(N_FFT);
  const n = Math.min(samples.length - offset, N_FFT);
  for (let i = 0; i < n; i++) {
    re[i] = (samples[offset + i] || 0) * HANN[i];
  }
  return { re, im, n };
}