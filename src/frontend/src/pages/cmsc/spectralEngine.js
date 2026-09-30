export const N_FFT = 4096;
export const DEFAULT_SAMPLE_RATE = 44100;
export const AUDIBLE_MIN_HZ = 20;
export const SPECTRUM_BUCKETS = 96;
export const SPECTROGRAM_ROWS = 96;
export const SPECTROGRAM_DB_FLOOR = 60;

export const FREQ_BANDS = [
  { name: 'Sub 20-250', min: 20, max: 250 },
  { name: 'Medios 250-2k', min: 250, max: 2000 },
  { name: 'Agudos 2k-20k', min: 2000, max: 20000 }
];

const HANN = new Float32Array(N_FFT);
for (let i = 0; i < N_FFT; i++) {
  HANN[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N_FFT - 1)));
}

export function fftRadix2(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i]; re[i] = re[j]; re[j] = tr;
      const ti = im[i]; im[i] = im[j]; im[j] = ti;
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

export function binsForHz(minHz, maxHz, sampleRate = DEFAULT_SAMPLE_RATE) {
  const binHertz = sampleRate / N_FFT;
  return {
    minBin: Math.max(0, Math.round(minHz / binHertz)),
    maxBin: Math.min(N_FFT >> 1, Math.round(maxHz / binHertz))
  };
}

function windowSamples(samples) {
  const n = Math.min(samples.length, N_FFT);
  const re = new Float32Array(N_FFT);
  const im = new Float32Array(N_FFT);
  for (let i = 0; i < n; i++) {
    re[i] = (samples[i] || 0) * HANN[i];
  }
  return { re, im, n };
}

export function analyzeFrame(samples, sampleRate = DEFAULT_SAMPLE_RATE) {
  const { re, im, n } = windowSamples(samples);
  fftRadix2(re, im);
  const half = N_FFT >> 1;
  const binHertz = sampleRate / N_FFT;
  const magnitudes = new Float32Array(half);
  const db = new Float32Array(half);
  let maxDb = -Infinity;
  let maxIdx = 0;
  let sumAmp = 0;
  let sumAmpHz = 0;
  let sumSq = 0;
  let sumLogMag = 0;
  for (let i = 0; i < half; i++) {
    const mag = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    magnitudes[i] = mag;
    const level = 20 * Math.log10(mag + 1e-9);
    db[i] = level;
    if (level > maxDb) {
      maxDb = level;
      maxIdx = i;
    }
    sumAmp += mag;
    sumAmpHz += mag * i * binHertz;
    sumSq += mag * mag;
    sumLogMag += Math.log(mag + 1e-9);
  }
  const meanMag = sumAmp / half || 1e-9;
  const flatness = Math.exp(sumLogMag / half) / meanMag;
  const bandEnergy = FREQ_BANDS.map((band) => {
    const { minBin, maxBin } = binsForHz(band.min, band.max, sampleRate);
    let energy = 0;
    let peak = -Infinity;
    let peakBin = minBin;
    for (let i = minBin; i < maxBin; i++) {
      energy += magnitudes[i] * magnitudes[i];
      if (db[i] > peak) {
        peak = db[i];
        peakBin = i;
      }
    }
    return {
      name: band.name,
      min: band.min,
      max: band.max,
      energy,
      pct: sumSq > 0 ? energy / sumSq : 0,
      peakHz: peakBin * binHertz,
      peakDb: peak === -Infinity ? 0 : peak
    };
  });
  return {
    n,
    sampleRate,
    binHertz,
    dominantFrequency: maxIdx * binHertz,
    peakDb: maxDb,
    spectralCentroid: sumAmpHz / (sumAmp || 1),
    spectralFlatness: flatness,
    totalEnergy: sumSq,
    rms: Math.sqrt(sumSq / half),
    magnitudes,
    db,
    bandEnergy
  };
}

export function frameLevelDb(samples) {
  const n = Math.min(samples.length, N_FFT);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const v = samples[i] || 0;
    sum += v * v;
  }
  return 20 * Math.log10(Math.sqrt(sum / n) || 1e-9);
}

export function dBProfile(db, minBin, maxBin, buckets, floorDb = SPECTROGRAM_DB_FLOOR) {
  const n = db.length;
  const lo = Math.max(0, minBin || 0);
  const hi = Math.min(n, maxBin || n);
  const count = Math.max(1, buckets || hi - lo);
  let peak = -Infinity;
  for (let i = lo; i < hi; i++) {
    if (db[i] > peak) peak = db[i];
  }
  const maxDb = peak === -Infinity ? 0 : peak;
  const profile = new Uint8Array(count);
  for (let b = 0; b < count; b++) {
    const s = lo + Math.floor((b * (hi - lo)) / count);
    const e = lo + Math.floor(((b + 1) * (hi - lo)) / count) - 1;
    let p = -Infinity;
    for (let i = s; i <= e; i++) {
      if (db[i] > p) p = db[i];
    }
    if (p === -Infinity) {
      profile[b] = 0;
    } else {
      const v = (p - (maxDb - floorDb)) / floorDb;
      profile[b] = Math.max(0, Math.min(255, Math.round(v * 255)));
    }
  }
  return { profile, maxDb };
}