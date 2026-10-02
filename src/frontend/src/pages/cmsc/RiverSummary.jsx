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
    <div className="rounded-xl border border-gray-800/70 bg-gray-900/20 p-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Resumen del río</span>
        <span className="text-[10px] text-gray-500">flujo Sensor → Usuario · catálogo → eslabón</span>
      </div>
      <div className="flex items-stretch gap-1 overflow-x-auto">
        {stages.map((s, i) => (
          <React.Fragment key={s.label}>
            <button
              type="button"
              onClick={() => onSelectSignal && onSelectSignal(s.label)}
              className="flex-1 min-w-[92px] flex flex-col items-center justify-center gap-1 rounded-md border border-gray-800 bg-gray-900/40 px-1.5 py-1 text-center transition-colors hover:border-gray-600"
            >
              <span className="w-full flex items-center justify-between gap-1">
                <span className="truncate text-[10px] text-gray-200">{s.label}</span>
                <span className="font-mono text-[10px] text-gray-400 tabular-nums">{s.count}</span>
              </span>
              <HonestyBadge estado={s.estado} showConfidence={false} />
            </button>
            {i < stages.length - 1 && (
              <span aria-hidden="true" className="self-center text-[10px] text-gray-600">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default RiverSummary;
