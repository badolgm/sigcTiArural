import React from 'react';
import { HONESTY_STATES, honestyMeta } from './honesty.js';

// Termómetro de honestidad v1.
// Base: señales vivas del panel (3 reales · BBB SIM · robot ROTO · bridgeStatus HUERFANO).
// Cada estado actúa como filtro de la vista de catálogo cuando se dispone de onFilter.
const HonestyThermometer = ({ liveEntries, catalogCounts, activeFilter, onFilter }) => {
  const liveCounts = { REAL: 0, 'REAL-LOCAL': 0, SIM: 0, DISENO: 0, ROTO: 0, HUERFANO: 0, REF: 0 };
  liveEntries.forEach((entry) => {
    if (liveCounts[entry.estado] !== undefined) {
      liveCounts[entry.estado] += 1;
    }
  });

  const renderRow = (estado) => {
    const meta = honestyMeta(estado);
    const live = liveCounts[estado] || 0;
    const catalog = (catalogCounts && catalogCounts[estado]) || 0;
    const active = activeFilter === estado;
    const content = (
      <>
        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span className="ml-auto font-mono text-[11px] text-gray-300 tabular-nums">
          {live}<span className="text-gray-600"> | {catalog}</span>
        </span>
      </>
    );
    return onFilter ? (
      <button
        type="button"
        key={estado}
        onClick={() => onFilter(activeFilter === estado ? null : estado)}
        className={'flex items-center gap-2 px-2 py-1 rounded transition-colors ' + (active ? 'bg-gray-800' : 'hover:bg-gray-800/60')}
      >
        {content}
      </button>
    ) : (
      <div key={estado} className="flex items-center gap-2 px-2 py-1 rounded">
        {content}
      </div>
    );
  };

  const realTotal = (liveCounts.REAL || 0) + (liveCounts['REAL-LOCAL'] || 0);

  return (
    <div className="rounded-xl border border-gray-800/70 bg-gray-900/20 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Termómetro de honestidad</span>
        <span className="text-[10px] text-gray-500">vivas {realTotal} · v1.1</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {HONESTY_STATES.map((estado) => renderRow(estado))}
      </div>
      <div className="mt-2 text-[10px] text-gray-500 border-t border-gray-800/70 pt-2">
        <span className="text-gray-400">Vivas</span>: panel de señales conectadas en v1.1 (S10/S11 · S30 · S03) ·
        <span className="text-gray-500"> el catálogo completo S01..S80 se explora en la pestaña Catálogo.</span>
      </div>
    </div>
  );
};

export default HonestyThermometer;