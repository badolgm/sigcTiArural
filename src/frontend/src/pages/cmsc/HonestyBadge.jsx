import React from 'react';
import { honestyMeta, formatConfidence } from './honesty.js';

// Badge de honestidad + confidence, siempre junto al valor numérico.
// Un badge jamás mejora el estado por navegación: solo presenta el canon.
const HonestyBadge = ({ estado, confidence, showConfidence = true, className = '' }) => {
  const meta = honestyMeta(estado);
  return (
    <span
      className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ' + className}
      style={{ borderColor: meta.color, color: meta.color, backgroundColor: 'rgba(0,0,0,0.4)' }}
      title={`Estado honesto: ${meta.label}`}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
      {meta.label}
      {showConfidence && estado !== 'DISENO' && estado !== 'ROTO' && estado !== 'HUERFANO' && (
        <span className="opacity-80 normal-case font-mono">conf {formatConfidence(confidence)}</span>
      )}
    </span>
  );
};

export default HonestyBadge;