import React, { useState } from 'react';
import HonestyBadge from '../HonestyBadge.jsx';

// Franja B · columna derecha del Visual Freeze (§12.2): Dataset + Validación.
//
// Los conteos y estados son LITERALES verificados contra el disco, NO leídos del filesystem:
// el navegador no puede leer data/datasets/ (fuera de git, .gitignore:68) sin un backend, y
// Fase 1 no autoriza backend. Toda lectura real llega en Fase 3 (roadmap §13), vía CLI.
//
// Fuente de cada valor:
//   dataset_state = PREPARADO_VACIO  -> metadata/schema.json 1.2.0
//   0 WAV / 0 filas / 0 features    -> verificado en disco 2026-10-05
//   G-DS-1 FAIL (7 mids UNVERIFIED) -> taxonomy_binding_manifest + labels.csv (audi_set_status)
//   G-DS-2..6 PENDING              -> ausencia de muestras; NUNCA PASS por ausencia

// Orden de taxonomía de labels.csv (9 clases). Se listan aunque no tengan muestras:
// una clase con 0 es información; una clase ausente es ignorancia.
const CLASES = [
  'silencio',
  'viento',
  'lluvia',
  'agua',
  'insectos',
  'ave',
  'voz',
  'motor',
  'ruido_desconocido'
];

const GATES = [
  { id: 'G-DS-1', nombre: 'Taxonomía y esquema', resultado: 'FAIL', motivo: '7 mids AudioSet sin verificar (UNVERIFIED)' },
  { id: 'G-DS-2', nombre: '≥150 clips/clase', resultado: 'PENDING', motivo: '0 muestras · el piloto de 100 no cumple el mínimo' },
  { id: 'G-DS-3', nombre: 'Split sin fuga + holdout', resultado: 'PENDING', motivo: 'NO_EJECUTADO · leakage sin medir' },
  { id: 'G-DS-4', nombre: 'Gobernanza verificable', resultado: 'PENDING', motivo: 'Faltan artefactos de liberación y checksums reales' },
  { id: 'G-DS-5', nombre: 'Licencias verificadas', resultado: 'PENDING', motivo: 'Sin clips que licenciar' },
  { id: 'G-DS-6', nombre: 'Acuerdo de anotación', resultado: 'PENDING', motivo: 'Cohen κ exige etiquetas individuales por anotador' }
];

// Color del resultado del gate. FAIL y PENDING son DISTINTOS a propósito:
// PENDING no es FAIL, y ningún uno se maquilla como PASS.
const RESULTADO_COLOR = { PASS: '#39FF14', FAIL: '#FF3131', PENDING: '#FFB300' };

const AcousticDatasetPanel = () => {
  const [gatesAbiertos, setGatesAbiertos] = useState(false);
  const [clasesAbiertas, setClasesAbiertas] = useState(false);

  return (
    <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-200">Dataset acústico</h3>
          <p className="text-[10px] text-gray-500 font-mono">sigct_rural_acoustic / v1</p>
        </div>
        <HonestyBadge estado="DISENO" showConfidence={false} />
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-950/50 px-3 py-2.5">
        <p className="text-[11px] font-semibold text-gray-300">PREPARADO_VACIO</p>
        <p className="text-[10px] text-gray-500 leading-snug mt-0.5">
          Estructura y gobernanza preparadas. El dataset aún no existe como activo científico.
        </p>
      </div>

      {/* Conteos con UNIDAD explícita. Nunca porcentajes: no hay denominador que los sostenga. */}
      <dl className="grid grid-cols-3 gap-1.5">
        {[
          { k: 'WAV', v: 0, u: 'clips' },
          { k: 'metadata.csv', v: 0, u: 'filas' },
          { k: 'features', v: 0, u: 'vectores' }
        ].map((m) => (
          <div key={m.k} className="rounded-md border border-gray-800 bg-gray-900/40 px-2 py-1.5">
            <dt className="text-[9px] uppercase tracking-widest text-gray-500 truncate">{m.k}</dt>
            <dd className="text-sm font-mono font-bold text-gray-300 tabular-nums">
              {m.v} <span className="text-[9px] font-normal text-gray-500">{m.u}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div>
        <button
          type="button"
          onClick={() => setClasesAbiertas((v) => !v)}
          aria-expanded={clasesAbiertas}
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          {clasesAbiertas ? '▾' : '▸'} Conteo por clase (9 clases · 0 en todas)
        </button>
        {clasesAbiertas && (
          <div className="mt-1.5 flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-950/40 px-2 py-1.5">
            {CLASES.map((c) => (
              <span key={c} className="flex items-center gap-1 text-[10px]">
                <span className="text-gray-400">{c}</span>
                <span className="font-mono text-gray-600">0</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-950/40 px-2.5 py-2">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
          Gates de validación
        </p>
        <div className="flex flex-wrap gap-1">
          {GATES.map((g) => (
            <span
              key={g.id}
              title={`${g.nombre} — ${g.motivo}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wide"
              style={{
                borderColor: RESULTADO_COLOR[g.resultado],
                color: RESULTADO_COLOR[g.resultado],
                backgroundColor: 'rgba(0,0,0,0.4)'
              }}
            >
              <span className="font-mono">{g.id}</span>
              {g.resultado}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setGatesAbiertos((v) => !v)}
          aria-expanded={gatesAbiertos}
          className="mt-1.5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          {gatesAbiertos ? '▾ Ocultar motivos' : '▸ Ver gates y motivos'}
        </button>
        {gatesAbiertos && (
          <ul className="mt-1.5 space-y-1">
            {GATES.map((g) => (
              <li key={g.id} className="text-[10px] leading-snug">
                <span className="font-mono font-semibold" style={{ color: RESULTADO_COLOR[g.resultado] }}>
                  {g.id} {g.resultado}
                </span>{' '}
                <span className="text-gray-500">{g.nombre} — </span>
                <span className="text-gray-400">{g.motivo}</span>
              </li>
            ))}
            <li className="text-[10px] text-gray-500 leading-snug pt-1 border-t border-gray-800/70">
              Ningún gate pasa por ausencia de datos. G-DS-6 permanece PENDING: κ real exige
              tabla de contingencia, no un campo de acuerdo agregado.
            </li>
          </ul>
        )}
      </div>
    </section>
  );
};

export default AcousticDatasetPanel;