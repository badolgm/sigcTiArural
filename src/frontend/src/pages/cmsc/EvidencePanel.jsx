// EvidencePanel v2 · Dossier de investigación (CMSC_V4_KNOWLEDGE_AS_DISCOVERY).
// Madurez por dominio, vacíos de conocimiento, hallazgos y sustento documental.
// Lectura pura: registry como fuente, jamás escribe.
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';
import { docsBySignal } from '../../services/docsBySignal.js';
import { knowledgeStats, computedGaps, knowledgeTotals, CATEGORY_LABELS } from './knowledgeDiscovery.js';

const EvidencePanel = ({ stats, byCategory, signal, docs }) => {
  const domainStats = useMemo(() => knowledgeStats(), []);
  const gaps = useMemo(() => computedGaps(5), []);
  const totals = useMemo(() => knowledgeTotals(), []);
  const signalDocs = signal ? docs || docsBySignal(signal.signal_id) : [];

  const signalSustain = useMemo(
    () =>
      signal
        ? {
            count: signalDocs.length,
            docs: signalDocs.slice(0, 4),
            more: signalDocs.length > 4 ? signalDocs.length - 4 : 0,
            gap: signalDocs.length === 0
          }
        : null,
    [signal, signalDocs]
  );

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Dossier de investigación</span>
        <span className="text-[10px] text-gray-400">{totals.docs} docs · {totals.conEvidencia}/{totals.senales} señales</span>
      </div>

      {signal && signalSustain && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold" style={{ color: NEON.primary }}>{signal.signal_id}</span>
            <span className="text-[11px] text-gray-200 font-medium">{signal.name}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <HonestyBadge estado={signal.estado} confidence={signal.confianza} />
            <span className="text-[10px] text-gray-500">{signal.dominio} · {signal.puerto || 'sin puerto'}</span>
          </div>
          <div className="mt-1.5 space-y-0.5 text-[10px] text-gray-400">
            <div>{signal.consumidores ? `Consumidores · ${signal.consumidores}` : 'Consumidores · —'}</div>
            {signal.nota && <div>Nota · {signal.nota}</div>}
          </div>
          <div
            className="mt-2 px-2 py-1.5 rounded border text-[11px]"
            style={{
              borderColor: signalSustain.gap ? '#7f1d1d' : '#334155',
              color: signalSustain.gap ? '#f87171' : '#9CA3AF'
            }}
          >
            {signalSustain.gap
              ? 'Vacío de conocimiento · 0 docs en el KH'
              : `Sustento documental · ${signalSustain.count} docs en el KH`}
          </div>
          {signalSustain.docs.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {signalSustain.docs.map((d) => (
                <li key={d.id} className="text-[11px]">
                  <Link to={d.route} className="hover:underline" style={{ color: '#7dd3fc' }}>{d.title}</Link>
                  <span className="text-gray-600"> · {CATEGORY_LABELS[d.category] || d.category}</span>
                </li>
              ))}
              {signalSustain.more > 0 && <li className="text-[10px] text-gray-500">+ {signalSustain.more} más</li>}
            </ul>
          )}
        </div>
      )}

      <div>
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Madurez por dominio</span>
        <div className="mt-1 space-y-1">
          {domainStats.slice(0, 6).map((d, idx) => (
            <div key={d.dominio} className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400 w-24 truncate">{d.dominio}</span>
              <div className="flex items-center gap-1 flex-1 mx-2">
                <div className="h-1.5 rounded-full bg-gray-800 flex-1 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${
                        d.soporteDocs > 0 ? Math.min(100, (d.soporteDocs / (domainStats[0]?.soporteDocs || 1)) * 100) : 0
                      }%`,
                      backgroundColor: d.soporteDocs > 0 ? (idx === 0 ? NEON.primary : '#1e3a5f') : '#7f1d1d'
                    }}
                  />
                </div>
              </div>
              <span className="font-mono text-gray-200">{d.soporteDocs} docs · {d.conSustento}/{d.senales}</span>
            </div>
          ))}
          {domainStats.length > 6 && (
            <span className="text-[10px] text-gray-600">+ {domainStats.length - 6} dominios más</span>
          )}
        </div>
      </div>

      {!signal && gaps.length > 0 && (
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Vacíos de conocimiento</span>
          <div className="mt-1 space-y-1">
            {gaps.map((g) => (
              <div key={g.signal_id} className="flex items-center justify-between gap-2 text-[11px] px-2 py-1 rounded border border-gray-800 bg-gray-900/40">
                <span className="text-gray-300 truncate">{g.signal_id} · {g.name}</span>
                <span className="font-mono" style={{ color: g.estado === 'ROTO' ? '#f87171' : '#9CA3AF' }}>{g.estado}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {byCategory && byCategory.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {byCategory.map(({ category, count }) => (
            <span
              key={category}
              className="px-2 py-0.5 rounded text-[10px] border border-gray-700 text-gray-400"
            >
              {count} · {CATEGORY_LABELS[category] || category}
            </span>
          ))}
        </div>
      )}

      <Link
        to="/knowledge"
        className="block text-center text-[11px] px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 transition-colors hover:text-white hover:border-gray-500"
      >
        Abrir visor del KH →
      </Link>
    </div>
  );
};

export default EvidencePanel;