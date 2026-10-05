/**
 * WAV PCM 16-bit: lectura, escritura y validacion contra el clip contract.
 *
 * Solo se soporta lo que el dataset declara: PCM 16-bit little-endian, mono, 44100 Hz.
 * Un WAV de otro formato NO se "adapta" en silencio: se rechaza con el motivo exacto.
 */

import { CLIP_CONTRACT } from './constants.js';

const RIFF = 0x46464952; // "RIFF" en little-endian
const WAVE = 0x45564157; // "WAVE"
const FMT = 0x20746d66; // "fmt "
const DATA = 0x61746164; // "data"

export class WavError extends Error {
  constructor(message, detail = {}) {
    super(message);
    this.name = 'WavError';
    this.detail = detail;
  }
}

function readTag(view, offset) {
  return view.getUint32(offset, true);
}

/**
 * Parsea un buffer WAV PCM16.
 *
 * @param {Buffer} buffer
 * @returns {{sampleRate:number, channels:number, bitDepth:number, numSamples:number, samples:Float64Array, durationS:number}}
 */
export function decodeWav(buffer) {
  if (!Buffer.isBuffer(buffer)) throw new WavError('decodeWav: se esperaba un Buffer');
  if (buffer.length < 44) throw new WavError('decodeWav: buffer demasiado corto para un WAV', { bytes: buffer.length });

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  if (readTag(view, 0) !== RIFF) throw new WavError('decodeWav: no es un archivo RIFF');
  if (readTag(view, 8) !== WAVE) throw new WavError('decodeWav: no es un archivo WAVE');

  let fmt = null;
  let dataOffset = -1;
  let dataLength = 0;
  let offset = 12;

  while (offset + 8 <= buffer.length) {
    const chunkId = readTag(view, offset);
    const chunkSize = view.getUint32(offset + 4, true);
    const body = offset + 8;

    if (chunkId === FMT) {
      fmt = {
        audioFormat: view.getUint16(body, true),
        channels: view.getUint16(body + 2, true),
        sampleRate: view.getUint32(body + 4, true),
        byteRate: view.getUint32(body + 8, true),
        blockAlign: view.getUint16(body + 12, true),
        bitDepth: view.getUint16(body + 14, true)
      };
    } else if (chunkId === DATA) {
      dataOffset = body;
      dataLength = Math.min(chunkSize, buffer.length - body);
    }

    // Los chunks se alinean a pares: un chunk impar lleva 1 byte de relleno.
    offset = body + chunkSize + (chunkSize % 2);
  }

  if (!fmt) throw new WavError('decodeWav: falta el chunk "fmt "');
  if (dataOffset < 0) throw new WavError('decodeWav: falta el chunk "data"');

  if (fmt.audioFormat !== 1) {
    throw new WavError('decodeWav: solo se admite audioFormat=1 (PCM lineal)', { audioFormat: fmt.audioFormat });
  }
  if (fmt.bitDepth !== 16) {
    throw new WavError('decodeWav: solo se admite bitDepth=16 (PCM s16le)', { bitDepth: fmt.bitDepth });
  }

  const bytesPerFrame = fmt.channels * 2;
  const numSamples = Math.floor(dataLength / bytesPerFrame);

  const samples = new Float64Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    if (fmt.channels === 1) {
      samples[i] = view.getInt16(dataOffset + i * 2, true) / 32768;
    } else {
      // Downmix a mono promediando canales: el dataset es mono por contrato.
      let acc = 0;
      for (let c = 0; c < fmt.channels; c++) {
        acc += view.getInt16(dataOffset + (i * fmt.channels + c) * 2, true) / 32768;
      }
      samples[i] = acc / fmt.channels;
    }
  }

  return {
    sampleRate: fmt.sampleRate,
    channels: fmt.channels,
    bitDepth: fmt.bitDepth,
    numSamples,
    samples,
    durationS: numSamples / fmt.sampleRate,
    dataOffset,
    dataLength
  };
}

/**
 * Escribe un WAV PCM 16-bit mono.
 *
 * @param {Float64Array} samples en [-1, 1]
 * @param {number} sampleRate
 * @returns {Buffer}
 */
export function encodeWav(samples, sampleRate = CLIP_CONTRACT.sampleRate) {
  const numSamples = samples.length;
  const dataBytes = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  view.setUint32(0, RIFF, true);
  view.setUint32(4, 36 + dataBytes, true);
  view.setUint32(8, WAVE, true);
  view.setUint32(12, FMT, true);
  view.setUint32(16, 16, true); // tamaño del chunk fmt
  view.setUint16(20, 1, true); // audioFormat = PCM
  view.setUint16(22, 1, true); // canales = mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byteRate
  view.setUint16(32, 2, true); // blockAlign
  view.setUint16(34, 16, true); // bits por muestra
  view.setUint32(36, DATA, true);
  view.setUint32(40, dataBytes, true);

  for (let i = 0; i < numSamples; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    // Asimétrico: -32768 .. 32767
    const s = v < 0 ? Math.round(v * 32768) : Math.round(v * 32767);
    view.setInt16(44 + i * 2, s, true);
  }

  return buffer;
}

/** Metricas de senal usadas por las acceptance checks. */
export function signalStats(samples) {
  let peak = 0;
  let sumSq = 0;
  let sum = 0;
  let saturated = 0;
  let crossings = 0;
  let prev = samples[0] ?? 0;

  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];
    const a = Math.abs(v);
    if (a > peak) peak = a;
    sumSq += v * v;
    sum += v;
    // Saturacion = valor a +-1.0 tras cuantizacion a 16 bits.
    if (a >= 0.999969) saturated++;
    if (i > 0 && (v >= 0) !== (prev >= 0)) crossings++;
    prev = v;
  }

  const n = samples.length || 1;
  return {
    peak,
    rms: Math.sqrt(sumSq / n),
    // Offset DC: un microfono con ganancia mal puesta deja una componente continua.
    // No es "sonido" y se cuela en el espectro como un pico artificial en el bin 0.
    dcOffset: sum / n,
    // v1 de este logger lo llamaba `meanAbs` pero devolvia sumSq/n, que es la POTENCIA
    // media, no la media del valor absoluto. El nombre mentia sobre la magnitud, lo cual
    // es peligroso en una plataforma donde el nombre de una columna es su contrato.
    // Renombrado (sin cambio de valor) para que el nombre describa lo que se calcula.
    // Si alguna vez hace falta mean(|x|), debe anadirse como estadistica nueva y explicita.
    meanPower: sumSq / n,
    saturatedCount: saturated,
    saturatedRatio: samples.length ? saturated / samples.length : 0,
    zeroCrossings: crossings,
    numSamples: samples.length
  };
}

/** Indica si el WAV cumple el clip contract. Devuelve el detalle de cada incumplimiento. */
export function checkClipContract(decoded) {
  const problems = [];
  const c = CLIP_CONTRACT;

  if (decoded.sampleRate !== c.sampleRate) {
    problems.push(`AC-1 sample_rate ${decoded.sampleRate} != ${c.sampleRate}`);
  }
  if (decoded.channels !== c.channels) {
    problems.push(`AC-2 channels ${decoded.channels} != ${c.channels}`);
  }
  if (Math.abs(decoded.durationS - c.durationS) > c.durationToleranceS) {
    problems.push(
      `AC-3 duration ${decoded.durationS.toFixed(4)}s fuera de ${c.durationS} +-${c.durationToleranceS}`
    );
  }
  if (decoded.bitDepth !== c.bitDepth) {
    problems.push(`AC-4 bit_depth ${decoded.bitDepth} != ${c.bitDepth}`);
  }

  return problems;
}