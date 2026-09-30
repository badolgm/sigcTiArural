import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';
import { SIGNAL_CATALOG } from './signalCatalog.js';
import { docsBySignal } from '../../services/docsBySignal.js';
import { researchBoard } from './knowledgeDiscovery.js';

const S72 = SIGNAL_CATALOG.find((s) => s.signal_id === 'S72');
const S73 = SIGNAL_CATALOG.find((s) => s.signal_id === 'S73');

const METRICAS = {
  M1: { ece: 0.0313, balanced: 0.9898, weighted: 0.9899, label: 'baseline oficial', sig: S72, accent: '#9CA3AF' },
  M2: { ece: 0.0332, balanced: 0.9943, weighted: 0.9956, label: 'challenger validado', sig: S73, accent: NEON.primary }
};

const BenchmarkCell = () => {
  const board = useMemo(() => researchBoard(), []);
  const decision = board.nextSteps.find((n) => n.id === 'n-benchmark');
  const [focus, setFocus] = useState(null);

  const docsM1 = useMemo(() => docsBySignal('S72'), []);
  const docsM2 = useMemo(() => docsBySignal('S73'), []);

  const toggle = (id) => setFocus((f) => (f === id ? null : id));

  const metricRow = (label, fn) => {
    const values = ['M1', 'M2'].map((k) => METRICAS[k][fn]);
    const lowerIsBetter = fn === 'ece';
    const winner = lowerIsBetter
      ? values[0] < values[1] ? 'M1' : values[1] < values[0] ? 'M2' : '='
      : values[0] > values[1] ? 'M1' : values[1] > values[0] ? 'M2' : '=';
    return { label, values, winner };
  };

  const ROWS = [
    metricRow('Balanced accuracy', 'balanced'),
    metricRow('Weighted-F1', 'weighted'),
    metricRow('ECE (menor mejor)', 'ece')
  ];

  const focused = focus ? METRICAS[focus] : null;
  const focusedDocs = focus === 'M1' ? docsM1 : focus === 'M2' ? docsM2 : [];

  return (
    <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-200">Estado del benchmark</h3>
          <p className="text-[10px] text-gray-500">dataset v2 congelado · 16 clases · comparar M1 ↔ M2</p>
        </div>
        <HonestyBadge estado="REF" confidence={null} showConfidence={false} />
      </div>

      <div className="flex items-center gap-1.5">
        {['M1', 'M2'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => toggle(k)}
            className={
              'flex-1 px-2 py-1.5 rounded-md border text-[10px] font-semibold uppercase tracking-wide transition-colors ' +
              (focus === k ? 'bg-gray-800' : 'bg-gray-900/40 hover:border-gray-600')
            }
            style={{
              borderColor: focus === k ? METRICAS[k].accent : '#1f2937',
              color: METRICAS[k].accent
            }}
          >
            {k} · {METRICAS[k].sig?.confianza?.toFixed(4)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        {ROWS.map((r) => {
          const max = Math.max(...r.values);
          return (
            <div key={r.label} className="px-1 py-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">{r.label}</span>
                {r.winner !== '=' && (
                  <span className="text-[10px] font-bold" style={{ color: METRICAS[r.winner].accent }}>
                    + {r.winner}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {['M1', 'M2'].map((k, i) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-6 text-[10px] font-mono font-bold" style={{ color: METRICAS[k].accent }}>{k}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (r.values[i] / max) * 100)}%`,
                          backgroundColor: METRICAS[k].accent,
                          boxShadow: r.winner === k ? `0 0 8px ${METRICAS[k].accent}66` : undefined
                        }}
                      />
                    </div>
                    <span className="w-14 text-right text-[10px] font-mono tabular-nums" style={{ color: r.winner === k ? METRICAS[k].accent : '#9CA3AF' }}>
                      {r.values[i].toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {focused && (
        <div className="rounded-lg border border-gray-700 bg-gray-900/60 px-2.5 py-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-mono font-bold" style={{ color: focused.accent }}>
              {focused.sig.signal_id} · {focused.sig.name}
            </span>
            <HonestyBadge estado={focused.sig?.estado} confidence={focused.sig?.confianza} showConfidence={false} />
          </div>
          <p className="text-[11px] text-gray-400">
            {focused.label} · macro-F1 {focused.sig?.confianza?.toFixed(4)} · ECE {focused.ece.toFixed(4)} · bal. acc {focused.balanced.toFixed(4)}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {focusedDocs.length > 0 ? (
              focusedDocs.slice(0, 3).map((d) => (
                <Link
                  key={d.id}
                  to={d.route}
                  className="text-[10px] px-2 py-1 rounded border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
                >
                  {d.title}
                </Link>
              ))
            ) : (
              <span className="text-[10px] text-gray-600">{focused.signal_id} sin docs registrados en el KH</span>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-700 bg-gray-900/60 px-2.5 py-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Decisión</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide"
            style={{ borderColor: '#FFB300', color: '#FFB300', backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FFB300' }} />
            Pendiente
          </span>
        </div>
        <p className="text-[11px] text-gray-300">
          {decision ? decision.frase : 'Decidir el estándar oficial de IA entre M1 y M2 con acta de gobernanza.'}
        </p>
        <div className="text-[10px] text-gray-500 mt-1">
          M1 aprobado y congelado · M2 ejecutado oficialmente · F3E antes del gate
        </div>
      </div>
    </section>
  );
};

export default BenchmarkCell;