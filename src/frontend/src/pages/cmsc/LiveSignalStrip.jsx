import React from 'react';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';

const LIVE_LABEL = {
  S10: 'Temperatura V3',
  S11: 'Humedad V3',
  S03: 'Clima externo',
  S30: 'Espectro mic Telecom',
  S04: 'Cluster BBB',
  S50: 'RobotTelemetry'
};

function lastTimestamp(items) {
  const last = items && items.length ? items[items.length - 1] : null;
  if (!last || last.timestamp === undefined) return '—';
  const raw = String(last.timestamp);
  return raw.includes('T') ? raw.slice(11, 16) : raw;
}

function detailOf(entry) {
  if (entry.items) {
    return `${entry.count || entry.items.length} lecturas · última ${lastTimestamp(entry.items)} · ${entry.sourceMode || 'unknown'}`;
  }
  if (entry.entries) {
    return `clima-externo · ${entry.points || entry.entries.length} puntos`;
  }
  if (entry.nodes) {
    return `${entry.nodes.length} nodos etiquetados SIM`;
  }
  return entry.nota || 'solo lectura';
}

const LiveSignalStrip = ({ entries, loading }) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
        <div className="text-xs text-gray-500">Cargando puertos de lectura...</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Señales vivas</span>
        <span className="text-[10px] text-gray-400">lectura por puertos</span>
      </div>
      <div className="space-y-1.5">
        {entries.map((entry) => {
          const name =
            LIVE_LABEL[entry.signalId] ||
            (entry.signalIds || []).map((s) => LIVE_LABEL[s]).filter(Boolean).join(' y ') ||
            entry.signalId;
          return (
            <div key={entry.signalId} className="px-3 py-2 rounded-lg border border-gray-800 bg-gray-900/40">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold" style={{ color: NEON.primary }}>{entry.signalId}</span>
                <HonestyBadge estado={entry.estado} confidence={null} />
              </div>
              <div className="text-xs text-gray-200 font-medium mt-1">{name}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 truncate">{detailOf(entry)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveSignalStrip;