import React from 'react';
import HonestyBadge from './HonestyBadge.jsx';

const RIVER_DOMAIN_MAP = {
  Sensores: ['Físicas'],
  Telemetría: ['Digitales', 'Lógicas'],
  Matemáticas: ['Matemáticas'],
  Señales: ['Acústicas', 'Espectrales', 'RF', 'Mecánicas'],
  IA: ['IA', 'Imágenes'],
  'Knowledge Hub': ['Documentales'],
  Agentes: [],
  Usuario: []
};

function aggEstado(list) {
  if (!list.length) return 'DISENO';
  if (list.every((s) => s.estado === 'ROTO' || s.estado === 'DISENO')) return list[0].estado;
  if (list.some((s) => s.estado === 'REAL')) return 'REAL';
  if (list.some((s) => s.estado === 'REAL-LOCAL')) return 'REAL-LOCAL';
  if (list.some((s) => s.estado === 'SIM')) return 'SIM';
  return list[0].estado;
}

const RiverSummary = ({ signals, onSelectSignal }) => {
  const stages = Object.entries(RIVER_DOMAIN_MAP).map(([label, dominios]) => {
    const inStage = (signals || []).filter((s) => dominios.includes(s.dominio));
    return { label, count: inStage.length, estado: aggEstado(inStage) };
  });

  return (
    <div className="rounded-xl border border-gray-800/70 bg-gray-900/20 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Resumen del río</span>
        <span className="text-[10px] text-gray-500">catálogo → eslabón</span>
      </div>
      <div className="space-y-1">
        {stages.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onSelectSignal && onSelectSignal(s.label)}
            className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded text-left transition-colors hover:bg-gray-800/60"
          >
            <span className="text-[11px] text-gray-200">{s.label}</span>
            <span className="flex items-center gap-2">
              <HonestyBadge estado={s.estado} showConfidence={false} />
              <span className="font-mono text-[11px] text-gray-300 tabular-nums">{s.count}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RiverSummary;