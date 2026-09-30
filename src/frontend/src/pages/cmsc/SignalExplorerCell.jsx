import React, { useMemo, useState } from 'react';
import LiveSignalStrip from './LiveSignalStrip.jsx';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON, honestyMeta } from './honesty.js';
import { SIGNAL_CATALOG } from './signalCatalog.js';

const PREVIEW_N = 8;

const SignalExplorerCell = ({ liveEntries, loading, onOpenCatalog, onSelectSignal }) => {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [cursor, setCursor] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const counts = useMemo(() => {
    const c = {};
    SIGNAL_CATALOG.forEach((s) => {
      c[s.estado] = (c[s.estado] || 0) + 1;
    });
    return c;
  }, []);

  const total = SIGNAL_CATALOG.length;
  const vivas = SIGNAL_CATALOG.filter((s) => s.estado === 'REAL' || s.estado === 'REAL-LOCAL').length;

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const list = SIGNAL_CATALOG.filter((s) => {
      if (estado && s.estado !== estado) return false;
      if (qq && !`${s.signal_id} ${s.name} ${s.dominio}`.toLowerCase().includes(qq)) return false;
      return true;
    });
    return list.sort((a, b) => a.signal_id.localeCompare(b.signal_id));
  }, [q, estado]);

  const page = filtered.slice(cursor * PREVIEW_N, cursor * PREVIEW_N + PREVIEW_N);
  const maxPage = Math.max(0, Math.ceil(filtered.length / PREVIEW_N) - 1);
  const stateLabel = (s) => honestyMeta(s.estado).label;

  const pick = (s) => {
    setSelectedId(s.signal_id);
    if (onSelectSignal) onSelectSignal(s.signal_id);
  };

  const prevPage = () => setCursor((c) => Math.max(0, c - 1));
  const nextPage = () => setCursor((c) => Math.min(maxPage, c + 1));
  const clearState = () => {
    setEstado('');
    setCursor(0);
  };

  const STATE_ORDER = ['REAL', 'REAL-LOCAL', 'SIM', 'DISENO', 'ROTO', 'HUERFANO', 'REF'];

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-100">Explorador de señales</h3>
          <p className="text-[10px] text-gray-500">catálogo S01..S80 · lectura</p>
        </div>
        <span className="text-[10px] font-mono text-gray-400 tabular-nums">{total} señales</span>
      </div>

      <LiveSignalStrip entries={liveEntries} loading={loading} />

      <div className="grid grid-cols-1 gap-1">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500">
          <span>Estado honesto</span>
          <span className="font-mono normal-case">{vivas} vivas</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {STATE_ORDER.map((e) => {
            const n = counts[e] || 0;
            const meta = honestyMeta(e);
            const active = estado === e;
            return (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setEstado(active ? '' : e);
                  setCursor(0);
                }}
                className={
                  'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border transition-colors ' +
                  (active ? 'bg-gray-800' : 'bg-gray-900/40 hover:border-gray-600')
                }
                style={{ borderColor: active ? meta.color : '#1f2937', color: meta.color }}
              >
                {meta.label} · {n}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setCursor(0);
          }}
          placeholder="buscar por id, nombre, dominio..."
          className="flex-1 min-w-[140px] px-2 py-1.5 rounded-md bg-gray-900/60 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-gray-500"
        />
        {estado && (
          <button
            type="button"
            onClick={clearState}
            className="text-[10px] px-1.5 py-1 rounded border border-gray-700 text-gray-400 hover:text-white"
          >
            × quitar filtro
          </button>
        )}
      </div>

      <ul className="grid grid-cols-1 gap-1.5">
        {page.map((s) => {
          const isSel = selectedId === s.signal_id;
          return (
            <li key={s.signal_id}>
              <button
                type="button"
                onClick={() => pick(s)}
                className={
                  'w-full text-left px-2.5 py-1.5 rounded-lg border transition-colors ' +
                  (isSel ? 'border-gray-400 bg-gray-800' : 'border-gray-800 bg-gray-900/50 hover:border-gray-600')
                }
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: isSel ? '#ffffff' : NEON.primary }}
                  >
                    {s.signal_id}
                  </span>
                  <HonestyBadge estado={s.estado} confidence={s.confianza} showConfidence={false} />
                  {isSel && <span className="ml-auto text-[10px] font-bold text-white">▲ seleccionada</span>}
                </div>
                <div className="text-xs text-gray-200 font-medium truncate">{s.name}</div>
                <div className="text-[10px] text-gray-500 truncate">{s.dominio} · {s.origen}</div>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="text-[11px] text-gray-500 px-2 py-3 text-center border border-dashed border-gray-800 rounded-lg">
            Sin señales para {q ? `"${q}"` : stateLabel(estado)}. Limpia el filtro.
          </li>
        )}
      </ul>

      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={prevPage}
            disabled={cursor === 0}
            className="px-2 py-1 rounded border border-gray-700 text-xs text-gray-300 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← prev
          </button>
          <button
            type="button"
            onClick={nextPage}
            disabled={cursor >= maxPage}
            className="px-2 py-1 rounded border border-gray-700 text-xs text-gray-300 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            next →
          </button>
        </div>
        <span className="text-[10px] text-gray-500 font-mono tabular-nums">
          {filtered.length} filtrada · {maxPage + 1} pág/{cursor + 1}
        </span>
        <button
          type="button"
          onClick={onOpenCatalog}
          className="px-2.5 py-1.5 rounded-md font-semibold border text-[10px] transition-colors"
          style={{ borderColor: '#00FFFF66', color: '#00FFFF', backgroundColor: 'rgba(0,255,255,0.06)' }}
        >
          Ver catálogo completo →
        </button>
      </div>
    </section>
  );
};

export default SignalExplorerCell;