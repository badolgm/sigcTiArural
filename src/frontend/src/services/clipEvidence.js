// CLIP LOCAL · extracción multi-frame determinista, en memoria y solo lectura.
//
// Propósito: el pipeline oficial de inferencia acepta UNA imagen por petición
// (/api/v3/ai/inference/ -> :8081/infer). Este módulo NO sustituye al modelo:
// añade métricas temporales calculadas en el navegador sobre un clip WebM local
// (media/variación de luminancia, energía de bordes y diferencia entre frames)
// y permite enviar frames explícitamente autorizados al endpoint oficial.
//
// Reglas:
//   - NUNCA copia, mueve ni escribe el archivo original;
//   - NUNCA emite REAL: un clip cargado desde disco es LOCAL aunque haya
//     inferencia ejecutada;
//   - los frames se mantienen SOLO en memoria y se descartan al desmontar;
//   - sha256 (cuando WebCrypto está disponible) identifica los bytes leídos;
//   - la cabecera EBML es solo una pista diagnóstica: la autoridad es la
//     decodificación real (metadatos, frames, dimensiones y duración).

export const BACKUP_CLIP_PATH = '.local_backups/c54e2191-6ce1-4c59-9b42-d1a6c05fd54e.webm';
export const BACKUP_CLIP_FILE_NAME = 'c54e2191-6ce1-4c59-9b42-d1a6c05fd54e.webm';
export const CLIP_ANALYSIS_VERSION = 'clip-evidence-v1';
export const CLIP_ANALYSIS_KIND = 'DETERMINISTIC_LOCAL';

const EBML_MAGIC = [0x1a, 0x45, 0xdf, 0xa3];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, digits = 4) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(digits)) : null;
};
const mean = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);
const std = (values) => {
  const avg = mean(values);
  if (avg === null) return null;
  return Math.sqrt(mean(values.map((v) => (v - avg) ** 2)));
};

export const sha256Blob = async (blob) => {
  try {
    if (!globalThis.crypto?.subtle || typeof blob.arrayBuffer !== 'function') return null;
    const digest = await globalThis.crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
};

/** Pista diagnóstica: ¿comienza con la magia EBML? No decide por sí sola la validez. */
export const isEbmlWebm = async (blob) => {
  if (!blob || typeof blob.slice !== 'function' || blob.size < 4) return false;
  try {
    const bytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
    return EBML_MAGIC.every((byte, index) => bytes[index] === byte);
  } catch {
    return false;
  }
};

/** Lectura read-only de la ruta declarada. El decode decide; la cabecera solo se registra. */
export const fetchDeclaredClip = async (path = BACKUP_CLIP_PATH) => {
  const url = new URL(path, window.location.origin);
  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status} al leer ${path}`);
  const blob = await response.blob();
  if (!blob || blob.size === 0) throw new Error(`La ruta ${path} devolvió un cuerpo vacío.`);
  return blob;
};

const loadVideo = (video, url) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => finish(new Error('Tiempo de espera al cargar los metadatos del clip.')), 15000);
  const finish = (error) => {
    clearTimeout(timer);
    video.removeEventListener('loadedmetadata', onReady);
    video.removeEventListener('error', onError);
    if (error) reject(error);
    else resolve();
  };
  const onReady = () => finish(null);
  const onError = () => finish(new Error('El navegador no pudo decodificar el clip WebM.'));
  video.addEventListener('loadedmetadata', onReady, { once: true });
  video.addEventListener('error', onError, { once: true });
  video.src = url;
  video.load();
});

/**
 * Muestrea frames durante la reproducción acelerada. Los WebM de MediaRecorder
 * no suelen tener Cues/SeekHead, así que saltar por `currentTime` es frágil:
 * reproducir en silencio y capturar frames presentados es determinista y no
 * depende de índices de búsqueda. Los frames se conservan SOLO en memoria.
 */
const sampleFramesByPlayback = ({ video, canvas, context, width, height, maxFrames }) => (
  new Promise((resolve, reject) => {
    const collected = [];
    const maxCollected = Math.max(120, maxFrames * 12);
    const maxWallMs = 30000;
    const started = Date.now();
    let lastCapture = 0;
    let settled = false;

    const cleanup = () => {
      video.onended = null;
      video.onerror = null;
      try { video.pause(); } catch { /* el clip ya terminó */ }
    };
    const finish = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) reject(error);
      else resolve(collected);
    };
    const schedule = () => {
      if (typeof video.requestVideoFrameCallback === 'function') {
        video.requestVideoFrameCallback(() => { void capture(); });
      } else {
        requestAnimationFrame(() => { void capture(); });
      }
    };
    const capture = async () => {
      if (settled) return;
      try {
        const now = Date.now();
        if (now - lastCapture >= 100 && collected.length < maxCollected && video.readyState >= 2) {
          lastCapture = now;
          context.drawImage(video, 0, 0, width, height);
          const pixels = context.getImageData(0, 0, width, height).data;
          collected.push({
            timeSec: round(video.currentTime, 3),
            pixels,
            blob: await canvasToBlob(canvas),
          });
        }
        if (collected.length >= maxCollected || now - started > maxWallMs || video.ended) {
          finish(null);
          return;
        }
        schedule();
      } catch (error) {
        finish(error);
      }
    };

    video.onended = () => finish(null);
    video.onerror = () => finish(new Error('El navegador no pudo decodificar el clip durante la reproducción.'));
    try { video.playbackRate = 8; } catch { /* se conserva la velocidad nativa */ }
    video.play().then(schedule).catch(() => finish(
      new Error('El navegador bloqueó la reproducción del clip local.')
    ));
  })
);

const canvasToBlob = (canvas) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo extraer el frame del clip.'))), 'image/jpeg', 0.9);
});

const frameMetrics = (pixels, width, height) => {
  const count = width * height;
  const luma = new Float32Array(count);
  let sumLuma = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  for (let i = 0; i < count; i += 1) {
    const offset = i * 4;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    const value = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    luma[i] = value;
    sumLuma += value;
    sumR += r;
    sumG += g;
    sumB += b;
  }
  let edge = 0;
  let edgeCount = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 1; x < width; x += 1) {
      edge += Math.abs(luma[y * width + x] - luma[y * width + x - 1]);
      edgeCount += 1;
    }
  }
  return {
    luma,
    meanLuma: round(sumLuma / count),
    lumaStd: round(Math.sqrt(mean(Array.from(luma, (v) => (v - sumLuma / count) ** 2)))),
    edgeEnergy: round(edgeCount ? edge / edgeCount : 0),
    meanR: round(sumR / count / 255),
    meanG: round(sumG / count / 255),
    meanB: round(sumB / count / 255),
  };
};

const meanAbsDiff = (a, b) => {
  if (!a || !b || a.length !== b.length) return null;
  let total = 0;
  for (let i = 0; i < a.length; i += 1) total += Math.abs(a[i] - b[i]);
  return total / a.length;
};

const trendOf = (series) => {
  if (series.length < 2) return 'INSUFICIENTE';
  const xs = series.map((_, index) => index);
  const xMean = mean(xs);
  const yMean = mean(series);
  const numerator = xs.reduce((acc, x, index) => acc + (x - xMean) * (series[index] - yMean), 0);
  const denominator = xs.reduce((acc, x) => acc + (x - xMean) ** 2, 0);
  const slope = denominator ? numerator / denominator : 0;
  if (slope > 0.004) return 'CRECIENTE';
  if (slope < -0.004) return 'DECRECIENTE';
  return 'ESTABLE';
};

/**
 * Analiza N frames repartidos por el clip. Devuelve un `summary` serializable
 * (para visionEvidence / voiceContext) y los frames Blob en memoria (para el
 * envío autorizado al endpoint oficial).
 */
export const analyzeClip = async ({
  blob,
  declaredPath = BACKUP_CLIP_PATH,
  fileName = BACKUP_CLIP_FILE_NAME,
  frameCount = 8,
} = {}) => {
  if (!blob || typeof blob.size !== 'number' || blob.size === 0) {
    throw new Error('No hay clip local para analizar.');
  }
  // Sin rechazo por cabecera: un WebM decodificable manda, aunque el contenedor
  // no exponga la magia EBML en los primeros 4 bytes del response.blob().
  const ebmlHeader = await isEbmlWebm(blob);
  const digest = await sha256Blob(blob);
  const url = URL.createObjectURL(blob);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  try {
    try {
      await loadVideo(video, url);
    } catch (error) {
      // Solo se menciona la cabecera si la decodificación REAL falló.
      throw new Error(ebmlHeader
        ? error.message
        : `${error.message} (cabecera EBML no detectada)`);
    }
    if (!video.videoWidth || !video.videoHeight) {
      throw new Error('El clip no expone dimensiones utilizables.');
    }

    const analyzedFrames = clamp(Number(frameCount) || 8, 2, 24);
    const width = Math.min(160, video.videoWidth);
    const height = Math.max(1, Math.round((width * video.videoHeight) / video.videoWidth));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('El navegador no permitió crear el contexto 2D del clip.');

    const collected = await sampleFramesByPlayback({
      video, canvas, context, width, height, maxFrames: analyzedFrames,
    });
    if (collected.length < 2) {
      throw new Error('El clip no entregó suficientes frames decodificables para medir temporalidad.');
    }
    // Muestreo equiespaciado sobre los frames presentados (sin depender de Cues).
    const picked = [];
    for (let index = 0; index < analyzedFrames; index += 1) {
      const position = collected.length <= analyzedFrames
        ? index
        : Math.round((index * (collected.length - 1)) / (analyzedFrames - 1));
      if (collected[position]) picked.push(collected[position]);
    }

    const frames = [];
    const perFrame = [];
    const lumaArrays = [];
    const timestamps = [];
    picked.forEach((sample, index) => {
      const metrics = frameMetrics(sample.pixels, width, height);
      lumaArrays.push(metrics.luma);
      timestamps.push(sample.timeSec);
      perFrame.push({
        index,
        timeSec: sample.timeSec,
        meanLuma: metrics.meanLuma,
        lumaStd: metrics.lumaStd,
        edgeEnergy: metrics.edgeEnergy,
        meanR: metrics.meanR,
        meanG: metrics.meanG,
        meanB: metrics.meanB,
      });
      frames.push({ index, timeSec: sample.timeSec, blob: sample.blob });
    });

    // Duration estimada solo cuando el WebM no declara duración (típico en MediaRecorder).
    const declaredDuration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : null;
    const durationEstimated = declaredDuration === null;
    const duration = declaredDuration ?? (picked.length ? picked[picked.length - 1].timeSec : 0) ?? 0;

    const deltas = [];
    for (let index = 1; index < lumaArrays.length; index += 1) {
      const delta = meanAbsDiff(lumaArrays[index - 1], lumaArrays[index]);
      if (delta !== null) deltas.push(delta);
    }
    const lumaSeries = perFrame.map((frame) => frame.meanLuma);
    const summary = {
      version: CLIP_ANALYSIS_VERSION,
      analysisKind: CLIP_ANALYSIS_KIND,
      llmUsed: false,
      // Un archivo local es LOCAL: jamás se eleva a REAL-LOCAL ni a REAL.
      status: 'LOCAL',
      source: {
        declaredPath,
        fileName,
        bytes: blob.size,
        mimeType: blob.type || 'video/webm',
        ebmlHeader,
        sha256: digest,
        durationSec: round(duration, 3),
        durationEstimated,
        width: video.videoWidth,
        height: video.videoHeight,
      },
      sampling: {
        method: 'PLAYBACK_ACCELERATED',
        requestedFrames: Number(frameCount) || 8,
        collectedFrames: collected.length,
        analyzedFrames: picked.length,
        timestampsSec: timestamps,
        downsample: { width, height },
      },
      metrics: {
        meanLuma: round(mean(lumaSeries)),
        lumaStd: round(std(lumaSeries)),
        meanEdgeEnergy: round(mean(perFrame.map((frame) => frame.edgeEnergy))),
        meanFrameDelta: round(mean(deltas)),
        maxFrameDelta: round(deltas.length ? Math.max(...deltas) : null),
        changingPairRatio: round(deltas.length ? deltas.filter((delta) => delta > 0.02).length / deltas.length : null),
        temporalVariation: round(std(lumaSeries)),
        lumaTrend: trendOf(lumaSeries),
        perFrame,
      },
      limitations: [
        'Métricas deterministas locales: NO son inferencia, NO son un LLM y NO validan la escena agrícola.',
        'El clip original solo se lee: no se copia, se mueve ni se escribe en data/.',
        'Los frames se muestrean en memoria durante la reproducción; el WebM sin Cues no permite saltos exactos por segundo.',
        ...(durationEstimated
          ? ['El WebM no declara duración: el valor reportado es el último frame observado (estimado, no exacto).']
          : []),
        'Los frames viajan al endpoint oficial solo tras autorización explícita; cada inferencia describe esa muestra.',
      ],
      updatedAt: new Date().toISOString(),
    };
    return { summary, frames };
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
};

/** Resume inferencias por frame sin inventar etiquetas ni confiar en promedios falsos. */
export const summarizeFrameInferences = (results = []) => {
  const executed = results.filter((result) => result.executed === true);
  const confidences = executed.map((result) => Number(result.confidence)).filter(Number.isFinite);
  const labels = executed.map((result) => String(result.label || 'sin etiqueta'));
  return {
    requestedFrames: results.length,
    executedFrames: executed.length,
    distinctLabels: Array.from(new Set(labels)),
    labelChanges: Math.max(0, labels.length - 1 - labels.slice(1).filter((label, i) => label === labels[i]).length),
    confidenceMin: confidences.length ? round(Math.min(...confidences)) : null,
    confidenceMax: confidences.length ? round(Math.max(...confidences)) : null,
    confidenceDelta: confidences.length > 1 ? round(Math.max(...confidences) - Math.min(...confidences)) : null,
    results: results.map((result) => ({
      index: result.index,
      timeSec: result.timeSec,
      executed: result.executed === true,
      label: String(result.label || 'sin etiqueta'),
      confidence: Number.isFinite(Number(result.confidence)) ? round(result.confidence) : null,
      modelStatus: String(result.modelStatus || 'NO_DECLARADO'),
    })),
  };
};

/** Selecciona frames repartidos para no saturar el endpoint con los 8 frames. */
export const pickRepresentativeFrames = (frames = [], maxFrames = 3) => {
  if (frames.length <= maxFrames) return frames;
  const picked = [];
  for (let i = 0; i < maxFrames; i += 1) {
    const index = Math.round((i * (frames.length - 1)) / (maxFrames - 1));
    if (frames[index]) picked.push(frames[index]);
  }
  return picked;
};

export const clipDigestLabel = (sha256) => (sha256 ? `${sha256.slice(0, 16)}…` : 'no disponible');
