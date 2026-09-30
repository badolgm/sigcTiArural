import React, { useMemo, useState } from 'react';
import { SIGNAL_CATALOG } from './signalCatalog.js';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON, honestyMeta } from './honesty.js';

// Vista-catálogo S01..S80, solo lectura (derivada del SIGNAL_MAP).
// Acepta un filtro por estado de honestidad (desde el termómetro) y
// añade búsqueda + filtros de dominio y clase en la vista de catálogo.
const SignalCatalogView = ({ filter, onSelectSignal }) => {
  const [q, setQ] = useState('');
  const [dom, setDom] = useState('');
  const [cls, setCls] = useState('');

  const dominios = useMemo(() => [...new Set(SIGNAL_CATALOG.map((s) => s.dominio))].sort(), []);
  const clases = useMemo(() => [...new Set(SIGNAL_CATALOG.map((s) => s.clase_senal))].sort(), []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return SIGNAL_CATALOG.filter((s) => {
      if (filter && s.estado !== filter) return false;
      if (dom && s.dominio !== dom) return false;
      if (cls && s.clase_senal !== cls) return false;
      if (qq && !`${s.signal_id} ${s.name} ${s.origen} ${s.dominio}`.toLowerCase().includes(qq)) return false;
      return true;
    });
  }, [filter, q, dom, cls]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="buscar por S-id, nombre o fuente"
          className="flex-1 min-w-[160px] px-3 py-1.5 rounded-md bg-gray-900/60 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-gray-500"
        />
        <select
          value={dom}
          onChange={(e) => setDom(e.target.value)}
          className="px-2 py-1.5 rounded-md bg-gray-900/60 border border-gray-700 text-xs text-gray-200"
        >
          <option value="">Dominio: todos</option>
          {dominios.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={cls}
          onChange={(e) => setCls(e.target.value)}
          className="px-2 py-1.5 rounded-md bg-gray-900/60 border border-gray-700 text-xs text-gray-200"
        >
          <option value="">Clase: todas</option>
          {clases.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-100">Catálogo de señales S01..S80</h3>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">
          {filtered.length} de {SIGNAL_CATALOG.length} señales
          {filter ? ` · filtro ${honestyMeta(filter).label}` : ''}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((s) => (
          <button
            key={s.signal_id}
            type="button"
            onClick={() => onSelectSignal && onSelectSignal(s.signal_id)}
            className="text-left px-3 py-2 rounded-lg border border-gray-800 bg-gray-900/40 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold" style={{ color: NEON.primary }}>{s.signal_id}</span>
              <HonestyBadge estado={s.estado} confidence={s.confianza} showConfidence={false} />
            </div>
            <div className="text-xs text-gray-200 font-medium truncate">{s.name}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {s.dominio} · {s.clase_senal}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SignalCatalogView;