// LatestEvidence v3 · Descubrimiento de conocimiento (CMSC_V4_KNOWLEDGE_AS_DISCOVERY).
// Frase humana primero · ID/métrica/documento como soporte discreto.
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';
import { docsBySignal } from '../../services/docsBySignal.js';
import { researchBoard } from './knowledgeDiscovery.js';

const VERDICT_COLOR = {
  PENDIENTE: '#FFB300',
  DISENO: '#66A3FF'
};

const VerdictTag = ({ estado }) => {
  if (['REAL', 'REAL-LOCAL', 'ROTO', 'HUERFANO'].includes(estado)) {
    return <HonestyBadge estado={estado} confidence={null} showConfidence={false} />;
  }
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-semibold"
      style={{
        color: VERDICT_COLOR[estado] || '#9CA3AF',
        border: `1px solid ${(VERDICT_COLOR[estado] || '#9CA3AF')}55`
      }}
    >
      {estado}
    </span>
  );
};

const SectionTitle = ({ children, hint, tone }) => (
  <div className="flex items-center gap-2 mb-1">
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: tone || NEON.primary }}
    />
    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{children}</span>
    {hint && <span className="text-[10px] text-gray-600">{hint}</span>}
  </div>
);

const AnchorRow = ({ ancla, docCount }) => (
  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
    <span className="text-[10px] font-mono text-gray-600">{ancla.join(' · ')}</span>
    {docCount !== undefined && (
      <span className="text-[10px] text-gray-600">{docCount > 0 ? `${docCount} docs de respaldo` : 'sin respaldo documental'}</span>
    )}
  </div>
);

const LatestEvidence = () => {
  const board = useMemo(() => researchBoard(), []);

  const support = useMemo(() => {
    const picks = [];
    ['S30', 'S10', 'S61', 'S72', 'S73'].forEach((id) => {
      docsBySignal(id).forEach((d) => {
        if (!picks.some((p) => p.id === d.id)) picks.push(d);
      });
    });
    return picks.slice(0, 4);
  }, []);

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-100">Descubrimiento de conocimiento</h3>
          <p className="text-[10px] text-gray-500">
            lo que el ecosistema sabe y lo que aún no · {board.totals.docs} docs · {board.totals.senales} señales
          </p>
        </div>
        <VerdictTag estado={board.uncertainties.length > 0 ? 'PENDIENTE' : 'REAL'} />
      </div>

      <div className="flex flex-col gap-3 flex-1 justify-between">
        <div>
          <SectionTitle children="Lo que sabemos" hint="conclusiones verificables" />
          <div className="space-y-1.5">
            {board.conclusions.map((c) => (
              <div key={c.id} className="px-3 py-2 rounded-lg border border-gray-800 bg-gray-900/40">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-gray-200 leading-relaxed">{c.frase}</p>
                  <VerdictTag estado={c.veredicto} />
                </div>
                <AnchorRow ancla={c.ancla} docCount={c.docCount} />
              </div>
            ))}
          </div>
        </div>

        {board.uncertainties.length > 0 && (
          <div>
            <SectionTitle children="Lo que no sabemos" hint="incertidumbres abiertas" tone="#FFB300" />
            <ul className="space-y-1">
              {board.uncertainties.map((u) => (
                <li key={u.id} className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900/40">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] text-gray-300 leading-relaxed">{u.frase}</p>
                    <VerdictTag estado={u.veredicto} />
                  </div>
                  <AnchorRow ancla={u.ancla} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {board.opportunities.length > 0 && (
          <div>
            <SectionTitle children="Dónde investigar" hint="oportunidades declaradas" tone={NEON.secondary} />
            <ul className="space-y-1">
              {board.opportunities.map((o) => (
                <li key={o.id} className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900/40">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] text-gray-300 leading-relaxed">{o.frase}</p>
                    <VerdictTag estado={o.veredicto} />
                  </div>
                  <AnchorRow ancla={o.ancla} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <SectionTitle children="Siguiente paso" hint="prioridad de investigación" tone="#AA66FF" />
          <ol className="space-y-1">
            {board.nextSteps.map((n, idx) => (
              <li key={n.id} className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900/40 flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold" style={{ color: NEON.primary }}>{idx + 1}</span>
                <p className="text-[11px] text-gray-300 leading-relaxed flex-1">{n.frase}</p>
                <VerdictTag estado={n.veredicto} />
              </li>
            ))}
          </ol>
        </div>

        <div className="pt-1 border-t border-gray-800">
          <SectionTitle children="Soporte documental" hint="detrás de cada conclusión · KH" tone="#9CA3AF" />
          <div className="mt-1 space-y-1">
            {support.map((d) => (
              <Link
                key={d.id}
                to={d.route}
                className="block px-2 py-1 rounded text-[11px] text-gray-400 hover:text-white transition-colors"
              >
                <span style={{ color: '#7dd3fc' }}>{d.title}</span>
                <span className="text-gray-600"> · {d.category}</span>
              </Link>
            ))}
          </div>
        </div>

        <Link
          to="/knowledge"
          className="block text-center text-[11px] px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 transition-colors hover:text-white hover:border-gray-500"
        >
          Abrir visor del KH →
        </Link>
      </div>
    </section>
  );
};

export default LatestEvidence;