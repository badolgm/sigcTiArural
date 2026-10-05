/**
 * Aceptacion de ingesta (AC-1..AC-10) y quality gates del dataset (G-DS-1..G-DS-6).
 *
 * REGLA DE HORA: un gate devuelve PASS | FAIL | PENDING, nunca "parece bien".
 *   PASS   = criterio verificado con evidencia en metadata.csv
 *   FAIL   = criterio violado, con el detalle del numero que lo incumple
 *   PENDING = no hay evidencia suficiente todavia (0 muestras). NO es PASS.
 *
 * Rechazar es una decision automatica: `evaluateClip` devuelve `verdict` y quien ingiere
 * escribe la fila con ingest_status correspondiente. Una muestra invalida NUNCA entra
 * como accepted, pero TAMPOCO se borra: va a quarantine/rejected con su motivo (NADA DESAPARECE).
 */

import {
  CLIP_CONTRACT,
  N_FFT,
  AUDIBLE_MIN_HZ,
  AUDIBLE_SHARE_MIN,
  DC_OFFSET_MAX,
  SILENCE_PEAK_FLOOR,
  CLIPPING_RATIO_MAX,
  NEAR_DUPLICATE_CORRELATION,
  KAPPA_MIN,
  TARGET_PER_CLASS,
  BALANCE_RATIO_MAX,
  FRAMES_PER_CLIP,
  LIVE_CLASSES,
  ALL_CLASSES,
  WINDOW_SCHEMA_DIMS,
  DBFS_FLOOR,
  DBFS_CEIL
} from './constants.js';
import { signalStats } from './wav.js';

export const PASS = 'PASS';
export const FAIL = 'FAIL';
export const PENDING = 'PENDING';

/* ------------------------------------------------- AC-1..AC-10 (por clip) */

/**
 * Evalua los acceptance checks de un clip.
 *
 * SEPARACION IMPORTANTE: se evalua el artefacto que se va a ESCRIBIR (ya normalizado a
 * 44100 Hz), pero tambien se_declara_ la transformacion que llevo desde la tasa nativa del
 * microfono (OBS-06). Por eso AC-1 no mira `decoded.sampleRate` del fichero entrante:
 * si lo hiciera, una captura legitima de 48 kHz —la que entrega el navegador— seria
 * rechazada aunque el remuestreo este declarado y hecho.
 *
 * @param {object} args
 * @param {object} args.stored    {sampleRate, channels, bitDepth, durationS} del artefacto destino
 * @param {object} args.source    {sampleRate, durationS} de la captura entrante
 * @param {object} args.fit       {trimmed, padded, wasExact} del ajuste a la duracion
 * @param {Float64Array} args.samples muestras ya remuestreadas
 * @param {string} args.file ruta relativa dentro de raw/
 * @param {string} args.classId
 * @param {string} args.dirName carpeta esperada
 * @param {string} args.sha256
 * @param {Set<string>} args.existingSha256 hashes ya presentes en el dataset
 * @param {number[][]} args.frames features por frame (AC-9)
 * @param {number[][]} args.previousEnvelopes sobres de energia de clips anteriores (AC-9)
 * @param {number|null} args.audibleEnergyShare cuota media de energia en banda audible (AC-7)
 * @param {number} args.spreadToleranceS tolerancia de desajuste entre fuente y destino
 * @returns {{verdict:'accepted'|'quarantine'|'rejected', checks: Array, stats: object}}
 */
export function evaluateClip(args) {
  const {
    stored, source, fit, samples, file, classId, dirName, sha256,
    existingSha256, frames = [], previousEnvelopes = [],
    audibleEnergyShare = null, spreadToleranceS = 0.001
  } = args;
  const stats = signalStats(samples);
  const checks = [];

  const add = (id, ok, detail, onFail = 'quarantine') => {
    checks.push({ id, ok, detail, on_fail: onFail });
    return ok;
  };

  // AC-1 tasa del artefacto + remuestreo declarado (cierra OBS-06)
  const rateOk = stored.sampleRate === CLIP_CONTRACT.sampleRate;
  const declared = source.sampleRate === stored.sampleRate
    ? 'tasa nativa, sin remuestreo'
    : `remuestreo DECLARADO ${source.sampleRate} -> ${stored.sampleRate}`;
  add('AC-1', rateOk && declared.length > 0,
    `almacenado=${stored.sampleRate} Hz; fuente=${source.sampleRate} Hz; ${declared}`);

  // AC-2 canales
  add('AC-2', stored.channels === CLIP_CONTRACT.channels,
    `channels=${stored.channels} (esperado ${CLIP_CONTRACT.channels})`);

  // AC-3 duracion: el ajuste no puede fabricar ni recortar audio.
  // Un clip relleno con ceros NO es una captura real: se rechaza aunque mida 3,0 s.
  const durOk = Math.abs(stored.durationS - CLIP_CONTRACT.durationS) <= CLIP_CONTRACT.durationToleranceS;
  const spread = Math.abs(source.durationS - stored.durationS);
  const expectedSourceSamples = Math.round(CLIP_CONTRACT.durationS * source.sampleRate);
  const sourceSampleCountOk = source.sampleCount === expectedSourceSamples;
  const exactFit = fit.wasExact && !fit.trimmed && !fit.padded;
  const durOkReal = durOk && spread <= spreadToleranceS && sourceSampleCountOk && exactFit;
  add('AC-3', durOkReal,
    `almacenado=${stored.durationS.toFixed(4)}s; fuente=${source.durationS.toFixed(4)}s; ` +
    `desajuste=${(spread * 1000).toFixed(1)} ms (max ${(spreadToleranceS * 1000).toFixed(0)} ms)` +
    `; muestras_fuente=${source.sampleCount ?? 'ausente'}/${expectedSourceSamples}` +
    (fit.padded ? ' | RELLENADO CON CEROS: no es una captura completa' : '') +
    (fit.trimmed ? ' | recortado al contract' : '') +
    (!sourceSampleCountOk ? ' | conteo de muestras no exacto' : '') +
    (!exactFit ? ' | artefacto recortado o rellenado' : ''));

  // AC-4 profundidad de bits
  add('AC-4', stored.bitDepth === CLIP_CONTRACT.bitDepth,
    `bit_depth=${stored.bitDepth} (esperado ${CLIP_CONTRACT.bitDepth})`);

  // AC-5 no mudo
  add('AC-5', stats.peak > SILENCE_PEAK_FLOOR,
    `peak=${stats.peak.toExponential(3)} (piso ${SILENCE_PEAK_FLOOR})`);

  // AC-6 sin clipping
  add('AC-6', stats.saturatedRatio < CLIPPING_RATIO_MAX,
    `saturacion=${(stats.saturatedRatio * 100).toFixed(3)}% (max ${(CLIPPING_RATIO_MAX * 100)}%)`);

  // AC-7 coherencia espectral: la energia debe vivir dentro de la banda audible.
  //
  // CRITERIO CAMBIADO respecto al borrador, con evidencia medida (probe sobre las senales
  // de referencia del selftest, N_FFT 4096 / hop 2048 / 44,1 kHz):
  //   senal              cuota_audible   pico_dominante
  //   ruido rosa 1/f         0,712          15,7 Hz
  //   ruido blanco           0,906       10.593 Hz
  //   tono 1 kHz             1,000       1.001 Hz
  // El borrador exigia "el pico dominante cae en 20 Hz-20 kHz". Con esos numeros ese
  // criterio rechaza ruido rosa (su pico en 15,7 Hz es lo correcto para un spectrum 1/f) y
  // deja pasar el ruido blanco gracias a su pico aleatorio. Medir la CUOTA de energia
  // audible si discrimina lo que importa: contenido ultrasonico, zumbido de reloj, offset DC.
  // AC-5 sigue siendo la que separa el silencio; AC-7 no la duplica.
  const share = audibleEnergyShare;
  const shareOk = share === null ? false : share >= AUDIBLE_SHARE_MIN;
  const dcOk = Math.abs(stats.dcOffset) <= DC_OFFSET_MAX;
  const ac7Ok = shareOk && dcOk;
  const audBlock = share === null
    ? 'no evaluable: 0 frames'
    : `cuota_audible=${(share * 100).toFixed(1)}% (min ${(AUDIBLE_SHARE_MIN * 100).toFixed(0)}%)`;
  add('AC-7', ac7Ok,
    `${audBlock}; offset_dc=${stats.dcOffset.toExponential(2)} (max ${DC_OFFSET_MAX})`);

  // AC-8 sha256 unico
  const dup = existingSha256 ? existingSha256.has(sha256) : false;
  add('AC-8', !dup, dup ? `sha256 duplicado en el dataset: ${sha256.slice(0, 12)}...` : 'sha256 unico', 'rejected');

  // AC-9 near-duplicate por correlacion del sobre de energia por frame.
  // Sin referencias es PROVISIONAL (D-2 sigue sin calibrar): no bloquea, pero el detalle
  // lo dice para que nadie lo lea como una verificacion hecha.
  let ac9;
  if (frames.length === 0 || previousEnvelopes.length === 0) {
    ac9 = add('AC-9', true,
      `PROVISIONAL Accepted: ${previousEnvelopes.length} referencia(s) de sobre disponibles; ` +
      `umbral ${NEAR_DUPLICATE_CORRELATION} PROPUESTO sin calibrar (D-2 abierta)`);
  } else {
    const current = energyEnvelope(frames);
    let best = -1;
    for (const prev of previousEnvelopes) best = Math.max(best, pearson(current, prev));
    ac9 = add('AC-9', !(best > NEAR_DUPLICATE_CORRELATION),
      `correlacion_max=${best.toFixed(4)} vs ${previousEnvelopes.length} referencia(s) ` +
      `(umbral ${NEAR_DUPLICATE_CORRELATION}, PROPUESTO sin calibrar)`);
  }

  // AC-10 coherencia de ruta: la carpeta debe corresponder a la clase declarada
  const expectedPrefix = `raw/${dirName}/`;
  const routeOk = file.startsWith(expectedPrefix);
  add('AC-10', routeOk,
    routeOk ? `ruta coherente con ${classId}` : `ruta '${file}' no corresponde a la carpeta '${dirName}'`);

  const failed = checks.filter((c) => !c.ok);
  let verdict = 'accepted';
  if (failed.some((c) => c.on_fail === 'rejected')) verdict = 'rejected';
  else if (failed.length > 0) verdict = 'quarantine';

  return { verdict, checks, stats, framesCount: frames.length };
}

/** Sobre de energia: rms por frame, la firma temporal que define "el mismo sonido". */
export function energyEnvelope(frames) {
  const idx = 4; // rms dentro de acoustic.feat.v1
  return frames.map((f) => f[idx]);
}

/** Correlacion de Pearson. Devuelve 0 si alguna serie es constante (evita NaN). */
export function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let sa = 0, sb = 0;
  for (let i = 0; i < n; i++) { sa += a[i]; sb += b[i]; }
  const ma = sa / n, mb = sb / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    num += x * y; da += x * x; db += y * y;
  }
  if (da === 0 || db === 0) return 0;
  return num / Math.sqrt(da * db);
}

/* ------------------------------------------------- G-DS-1..G-DS-6 (dataset) */

/**
 * Evalua los 6 quality gates sobre el estado actual del dataset.
 *
 * @param {object} ctx
 * @param {Array} ctx.rows filas de metadata.csv
 * @param {object} ctx.schema schema.json
 * @param {string[]} ctx.classIds class_ids presentes
 * @param {number} ctx.totalWavs WAVs en disco
 * @returns {Array<{id, nombre, veredicto, criterio, evidencia, bloqueantes}>}
 */
export function evaluateGates(ctx) {
  const rows = ctx.rows ?? [];
  const accepted = rows.filter((r) => r.ingest_status === 'accepted' && r.qc_status === 'pass');
  const perClass = countBy(accepted, 'class_id');
  const live = LIVE_CLASSES;
  const gates = [];

  /* G-DS-1 · Taxonomia y esquema aprobados */
  {
    const windowOk = ctx.schema?.window_schema_status?.startsWith('APROBADO');
    const midsPending = (ctx.midsUnverified ?? 0) > 0;
    const missing = ctx.missingRequiredColumns ?? [];

    // BUG D (corregido 2026-10-05). Antes este gate solo miraba `midsUnverified`, que se
    // derivaba de `labels.length` con un `existsSync` que hacia fallback a `[]`. Con
    // labels.csv AUSENTE, `labels = []` -> `midsUnverified = 0` -> el gate daba PASS
    // pese a declarar "9 clases enlazadas" en su criterio. Un gate de taxonomia que pasa
    // con el diccionario de clases borrado es un falso verde: permitia ingestar clips
    // cuya clase no se podia resolver. Ahora la integridad del diccionario es un
    // bloqueante por si mismo y no se puede degradar a PENDING.
    const labelsPresent = ctx.labelsPresent === true;
    const labels = ctx.labels ?? [];
    const expectedClasses = LIVE_CLASSES.length + 1; // 8 vivas + 1 bucket OOD
    const noDirName = labelsPresent
      ? labels.filter((r) => !String(r.dir_name ?? '').trim()).map((r) => r.class_id || '?')
      : [];
    const unknownClass = labelsPresent
      ? labels.filter((r) => !ALL_CLASSES.includes(r.class_id)).map((r) => r.class_id || '?')
      : [];

    const problems = [];
    if (!windowOk) problems.push(`window_schema_status=${ctx.schema?.window_schema_status ?? 'AUSENTE'} (debe estar APROBADO)`);
    if (missing.length) problems.push(`columnas obligatorias ausentes: ${missing.join(', ')}`);
    if (midsPending) problems.push(`${ctx.midsUnverified} mids AudioSet sin verificar`);
    if (!labelsPresent) problems.push('metadata/labels.csv AUSENTE: no se puede verificar la taxonomia');
    else if (labels.length !== expectedClasses) {
      problems.push(`labels.csv declara ${labels.length} clases, se esperan ${expectedClasses}`);
    }
    if (noDirName.length) problems.push(`clases sin dir_name: ${noDirName.join(', ')}`);
    if (unknownClass.length) problems.push(`class_id fuera de la taxonomia: ${unknownClass.join(', ')}`);

    gates.push({
      id: 'G-DS-1',
      nombre: 'Taxonomia y esquema aprobados',
      veredicto: problems.length === 0 ? PASS : FAIL,
      criterio: `labels.csv presente con ${expectedClasses} clases y dir_name en todas, schema 1.1.0+ con operator_id, window_schema APROBADO (44 dims), mids verificados`,
      evidencia: `labels=${labelsPresent ? labels.length : 'AUSENTE'}/${expectedClasses}; sin_dir_name=${noDirName.length}; window_schema=${ctx.schema?.window_schema_status}; cols=${ctx.schema?.columns?.length ?? 0}; mids_sin_verificar=${ctx.midsUnverified ?? 0}`,
      bloqueantes: problems
    });
  }

  /* G-DS-2 · >= 150 clips/clase, QC verde, balanceado */
  {
    const counts = live.map((c) => perClass.get(c) ?? 0);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const ratio = min === 0 ? Infinity : max / min;
    const complete = counts.every((c) => c >= TARGET_PER_CLASS);
    const balanced = min > 0 && ratio <= BALANCE_RATIO_MAX;
    const ownOnly = accepted.every((r) => r.source === 'cmsc_logger' && r.license === 'PROPIO');

    const problems = [];
    if (!complete) problems.push(`clases bajo objetivo: ${live.filter((c, i) => counts[i] < TARGET_PER_CLASS).join(', ')}`);
    if (!balanced) problems.push(`balance max/min=${ratio === Infinity ? 'INF' : ratio.toFixed(2)} (max ${BALANCE_RATIO_MAX})`);
    if (!ownOnly) problems.push('hay material que no es PROPIO/cmsc_logger');

    gates.push({
      id: 'G-DS-2',
      nombre: `${TARGET_PER_CLASS} clips/clase propios, balanceados, QC verde`,
      veredicto: accepted.length === 0 ? PENDING : (problems.length === 0 ? PASS : FAIL),
      criterio: `count(class) >= ${TARGET_PER_CLASS} en las 8 clases vivas, qc_status=pass, max/min <= ${BALANCE_RATIO_MAX}`,
      evidencia: `total_aceptadas=${accepted.length}; por_clase={${live.map((c) => `${c}:${perClass.get(c) ?? 0}`).join(',')}}; balance=${ratio === Infinity ? 'INF' : ratio.toFixed(2)}`,
      bloqueantes: problems
    });
  }

  /* G-DS-3 · Split sin fuga + holdout reservado */
  {
    const groups = new Map();
    for (const r of accepted) {
      const key = r.split_group_key || `${r.session_id}|${r.place_id}`;
      if (!groups.has(key)) groups.set(key, new Set());
      groups.get(key).add(r.partition);
    }
    const leaking = [...groups.entries()].filter(([, parts]) => parts.size > 1);

    const dupHashes = findDuplicateHashes(accepted);
    const holdoutCount = ctx.holdoutWavs ?? 0;
    const splitExecuted = ctx.splitExecuted === true;

    const problems = [];
    if (leaking.length) problems.push(`${leaking.length} grupos con clips en varias particiones`);
    if (dupHashes.length) problems.push(`${dupHashes.length} sha256 presentes en mas de una fila`);
    if (!splitExecuted) problems.push('el split no se ha ejecutado todavia');

    gates.push({
      id: 'G-DS-3',
      nombre: 'Split sin fuga, holdout reservado',
      veredicto: accepted.length === 0 ? PENDING : (problems.length === 0 ? PASS : FAIL),
      criterio: 'ningun (session_id, place_id) en dos particiones; sha256 unico; holdout excluido de los ratios',
      evidencia: `grupos_con_fuga=${leaking.length}; sha256_duplicados=${dupHashes.length}; split_ejecutado=${splitExecuted}; holdout=${holdoutCount}`,
      bloqueantes: problems
    });
  }

  /* G-DS-4 · Gobernanza completa y verificable */
  {
    const missingFiles = (ctx.requiredFiles ?? []).filter((f) => !ctx.fileExists(f));
    const rowsSane = ctx.schema && (ctx.schema.columns?.length ?? 0) === ctx.headerLength;
    const checksumsSane = (ctx.totalWavs ?? 0) === 0 || (ctx.checksumLines ?? 0) === (ctx.totalWavs ?? 0);
    const problems = [];
    if (missingFiles.length) problems.push(`artefactos ausentes: ${missingFiles.join(', ')}`);
    if (!rowsSane) problems.push('cabecera de metadata.csv != columnas del schema');
    if (!checksumsSane) problems.push(`CHECKSUMS tiene ${ctx.checksumLines} lineas para ${ctx.totalWavs} WAV`);
    if ((ctx.totalWavs ?? 0) === 0) problems.push('no hay WAV: la gobernanza esta declarada pero no ejercitada');

    gates.push({
      id: 'G-DS-4',
      nombre: 'Gobernanza completa y verificable',
      veredicto: problems.length === 0 ? PASS : ((ctx.totalWavs ?? 0) === 0 ? PENDING : FAIL),
      criterio: 'schema + labels + card + checksums por WAV + 5 manifiestos + split lists presentes y parseables',
      evidencia: `artefactos_ok=${(ctx.requiredFiles ?? []).length - missingFiles.length}/${(ctx.requiredFiles ?? []).length}; header=${ctx.headerLength} vs schema=${ctx.schema?.columns?.length ?? 0}; wavs=${ctx.totalWavs}`,
      bloqueantes: problems
    });
  }

  /* G-DS-5 · Licencias verificadas */
  {
    const allowed = new Set(['PROPIO', 'CC0', 'CC-BY', 'CC-BY-SA', 'CC-BY-NC']);
    const bad = accepted.filter((r) => !allowed.has(r.license));
    const unknown = accepted.filter((r) => !r.license || r.license === 'ND' || r.license.toLowerCase().includes('desconoc'));
    // v1 es corpus PROPIO por definicion del dataset design. Las licencias CC son valores
    // validos del enum parafuturas versiones, no para v1: aceptarlas aqui abriria la puerta
    // a material externo en un dataset cuyo manifiesto dice 100% propio.
    const notOwn = accepted.filter((r) => r.license !== 'PROPIO' || r.source !== 'cmsc_logger');
    const problems = [];
    if (bad.length) problems.push(`${bad.length} filas con licencia fuera de la lista cerrada`);
    if (unknown.length) problems.push(`${unknown.length} filas sin licencia o con ND`);
    if (notOwn.length) {
      const detail = [...new Set(notOwn.map((r) => `${r.license ?? 'VACIA'}/${r.source ?? '?'}`))].join(', ');
      problems.push(`${notOwn.length} filas no son PROPIO/cmsc_logger en v1 (${detail})`);
    }

    gates.push({
      id: 'G-DS-5',
      nombre: 'Licencias verificadas por clip',
      veredicto: accepted.length === 0 ? PENDING : (problems.length === 0 ? PASS : FAIL),
      criterio: 'v1: license=PROPIO y source=cmsc_logger en el 100% de las aceptadas; ND prohibida',
      evidencia: `licencias={${[...new Set(accepted.map((r) => r.license || 'VACIA'))].join(', ') || 'ninguna'}}; fuentes={${[...new Set(accepted.map((r) => r.source || '?'))].join(', ') || 'ninguna'}}`,
      bloqueantes: problems
    });
  }

  /* G-DS-6 · Acuerdo de anotacion */
  {
    // Los tres valores validos cuentan como "doble revision completada".
    // Omitir `disputed_resolved` haria que una discrepancia RESUELTA por un tercero
    // contara como no revisada y el gate nunca podria cerrarse.
    const REVIEWED = new Set(['double_reviewed_agree', 'double_reviewed_disagree', 'disputed_resolved']);
    const reviewed = accepted.filter((r) => REVIEWED.has(r.agreement));
    const agreementRate = accepted.length ? reviewed.length / accepted.length : 0;
    const kappaValues = ctx.kappaByClass ? Object.values(ctx.kappaByClass).filter((v) => typeof v === 'number') : [];
    const kappaOk = kappaValues.length > 0 && kappaValues.every((k) => k >= KAPPA_MIN);
    const problems = [];
    const pendingReasons = [];
    if (accepted.length && agreementRate < 1) problems.push(`doble revision en ${(agreementRate * 100).toFixed(1)}% de las muestras (exigido 100%)`);
    if (accepted.length && kappaValues.length === 0) pendingReasons.push('Cohen kappa no calculable: faltan etiquetas individuales por anotador y clase');
    if (accepted.length && kappaValues.length > 0 && !kappaOk) {
      problems.push(`kappa por debajo de ${KAPPA_MIN} (min ${Math.min(...kappaValues)})`);
    }

    gates.push({
      id: 'G-DS-6',
      nombre: '100% doble revision, kappa >= 0,70',
      veredicto: accepted.length === 0 || (problems.length === 0 && pendingReasons.length > 0)
        ? PENDING
        : (problems.length === 0 ? PASS : FAIL),
      criterio: 'agreement in {double_reviewed_agree, double_reviewed_disagree, disputed_resolved} al 100% y Cohen kappa >= 0,70',
      evidencia: `aceptadas=${accepted.length}; doble_revisadas=${reviewed.length} (${(agreementRate * 100).toFixed(1)}%); kappa=${JSON.stringify(ctx.kappaByClass ?? {})} ${kappaValues.length ? '' : '(sin estimacion utilizable)'}`,
      bloqueantes: [...problems, ...pendingReasons]
    });
  }

  return gates;
}

/* ------------------------------------------------------------------ util */

function countBy(rows, key) {
  const m = new Map();
  for (const r of rows) {
    const k = r[key];
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

function findDuplicateHashes(rows) {
  const seen = new Map();
  for (const r of rows) {
    if (!r.sha256) continue;
    if (seen.has(r.sha256)) return [r.sha256];
    seen.set(r.sha256, true);
  }
  return [];
}

/** Coherencia entre frames y el clip contract, usada tras extraer features. */
export function checkFrameContract(frameCount) {
  return {
    esperado: FRAMES_PER_CLIP,
    obtenido: frameCount,
    ok: frameCount === FRAMES_PER_CLIP,
    nota: `${N_FFT} samples + hop 2048 sobre 3,0 s a 44,1 kHz`
  };
}

/** Rango util de dBFS para detectar capturas en silencio digital. */
export const DB_RANGE = { floor: DBFS_FLOOR, ceil: DBFS_CEIL, dims: WINDOW_SCHEMA_DIMS };