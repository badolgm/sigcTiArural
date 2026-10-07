import React, { useMemo } from 'react';
import HonestyBadge from '../HonestyBadge.jsx';
import { formatConfidence } from '../honesty.js';
import {
  classifyAcoustic,
  RULES_V0_COLUMN_NAMES,
  RULES_V0_VERSION
} from '../../../../../../tools/cmsc-data-logger/src/rules-v0.js';

// Misión ACOUSTIC_E5_FIRST_VISIBLE_RESULT · primer resultado acústico visible.
//
// Dónde vive: Franja B2 de la Zona de Orquestación Científica V2 (§12.2), ADITIVA.
// Qué presenta: la clasificación de la ÚNICA muestra real del dataset (E1) ejecutada
// por el MISMO clasificador determinista del logger (tools/.../rules-v0.js). No hay
// duplicación de lógica: este panel importa y ejecuta el módulo canónico.
//
// DISCIPLINA DE HONESTIDAD (heredada de rules-v0.js y AI_ACOUSTIC_ARCHITECTURE_V1 §4.2):
//   - rules-v0 es heurística determinista, NO aprendizaje: estado visible SIEMPRE SIM,
//     jamás REAL-LOCAL, aunque el WAV de entrada sea real ("simulación" = el resultado
//     de clasificar es una simulación de la inteligencia acústica, no la inteligencia).
//   - S81 / S82 NO se promueven: esta tarjeta es un PREVIEW; el strip de consumidores
//     y el registro de señales siguen mostrando S81=DISENO exactamente como antes.
//   - Si el CSV de features no está disponible en el entorno (data/ está fuera de git,
//     .gitignore:68), el panel se degrada a NO_DATA. Nunca se inventa un resultado.
//
// Lectura del CSV: snapshot en build-time vía import.meta.glob(?raw), el MISMO patrón
// que docLoader.js usa para docs/*.md. Sin backend, sin endpoints, sin fetch en runtime.
// El valor embebido refleja el fichero `acoustic_features_v2.csv` en el momento del build.

const TARGET_SAMPLE = 'ac_20261006_215109_000';

// Desde src/frontend/src/pages/cmsc/orchestration/, la raíz del repo está 6 niveles
// arriba (orchestration -> cmsc -> pages -> src -> frontend -> src -> repo root).
const CSV_MODULES = import.meta.glob(
  '../../../../../../data/datasets/sigct_rural_acoustic/v1/features/acoustic_features_v2.csv',
  { query: '?raw', import: 'default', eager: true }
);
const csvRaw = Object.values(CSV_MODULES)[0] ?? null;

const NO_DATA = Object.freeze({
  kind: 'no_data',
  detail: 'acoustic_features_v2.csv no disponible en este entorno (data/ fuera de git).'
});

function parseRow(raw, sampleId) {
  if (!raw) return null;
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length < 2) return null;
  const header = lines[0].split(',');
  const idx = header.indexOf('sample_id');
  if (idx === -1) return null;
  const line = lines
    .slice(1)
    .map((l) => l.split(','))
    .find((cells) => cells[idx] === sampleId);
  if (!line) return null;
  const obj = {};
  header.forEach((h, i) => {
    obj[h] = line[i];
  });
  return obj;
}

function buildVector(row, columnNames) {
  const vector = columnNames.map((name) => Number(row[name]));
  if (vector.length !== 44 || !vector.every(Number.isFinite)) return null;
  return vector;
}

const AcousticFirstResultCard = () => {
  const state = useMemo(() => {
    const row = parseRow(csvRaw, TARGET_SAMPLE);
    if (!row) return NO_DATA;
    const vector = buildVector(row, RULES_V0_COLUMN_NAMES);
    if (!vector) {
      return {
        kind: 'invalid',
        detail: 'El vector extraído del CSV no es de 44 dims finitas; no se clasifica.'
      };
    }
    try {
      const result = classifyAcoustic(vector);
      return { kind: 'result', row, vector, result };
    } catch (err) {
      return { kind: 'invalid', detail: err.message };
    }
  }, []);

  const header = (
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="text-sm font-bold text-gray-200">Primer resultado acústico visible</h3>
        <p className="text-[10px] text-gray-500 font-mono">rules-v0 · S81 preview · E5</p>
      </div>
      {state.kind === 'result' ? (
        <HonestyBadge estado="SIM" confidence={state.result.confidence} />
      ) : (
        <HonestyBadge estado="DISENO" showConfidence={false} />
      )}
    </div>
  );

  if (state.kind !== 'result') {
    return (
      <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3 flex flex-col gap-2.5">
        {header}
        <div className="rounded-lg border border-dashed border-gray-700 bg-gray-950/40 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-gray-300">
            {state.kind === 'no_data' ? 'NO_DATA' : 'VECTOR INVALIDO'}
          </p>
          <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{state.detail}</p>
        </div>
        <p className="text-[10px] text-gray-600 leading-snug">
          Sin datos no hay resultado: este panel jamás fabrica una clasificación.
        </p>
      </section>
    );
  }

  const { row, result } = state;
  const dims = result.featureMeta.windowDims;

  return (
    <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3 flex flex-col gap-2.5">
      {header}

      <div className="rounded-lg border border-gray-800 bg-gray-950/50 px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] uppercase tracking-widest text-gray-500">class_id</span>
          <span className="text-[10px] text-gray-600 font-mono">S81 · preview</span>
        </div>
        <p className="text-lg font-bold text-gray-100 leading-tight">{result.label}</p>
        <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{result.note}</p>
      </div>

      <dl className="grid grid-cols-2 gap-1.5">
        {[
          { k: 'confidence', v: formatConfidence(result.confidence), u: 'score de regla · no probabilidad' },
          { k: 'sourceMode', v: result.sourceMode, u: 'origen del vector de features' },
          { k: 'method', v: result.method, u: result.modelVersion },
          { k: 'dims', v: `${dims}`, u: `${row.frame_count} frames · feat.v2/window.v2` }
        ].map((m) => (
          <div key={m.k} className="rounded-md border border-gray-800 bg-gray-900/40 px-2 py-1.5">
            <dt className="text-[9px] uppercase tracking-widest text-gray-500 truncate">{m.k}</dt>
            <dd className="text-sm font-mono font-bold text-gray-300 tabular-nums">{m.v}</dd>
            <dd className="text-[9px] text-gray-600 leading-tight mt-0.5">{m.u}</dd>
          </div>
        ))}
      </dl>

      <div className="text-[10px] text-gray-500 leading-snug space-y-0.5">
        <p className="font-mono">{row.sample_id}</p>
        <p>
          Valores embebidos en build desde <span className="font-mono">acoustic_features_v2.csv</span> · heurística
          determinista <span className="font-mono">({result.method})</span>, no es un modelo entrenado.
        </p>
      </div>

      <p className="text-[10px] text-gray-600 leading-snug border-t border-gray-800/70 pt-1.5">
        Badge <span className="font-mono">SIM</span>: el resultado de clasificar es una simulación de S81. S81/S82
        siguen <span className="font-mono">DISENO</span> y no se promueven con este preview.
      </p>
    </section>
  );
};

export default AcousticFirstResultCard;