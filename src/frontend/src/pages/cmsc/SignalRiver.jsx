import React from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';

// Cinta del río científico: 8 eslabones canónicos.
// Regla F3C-4: un eslabón sin señal viva se muestra DISENO o como enlace pendiente,
// jamás como vivo.
const RIVER_LINKS = [
  { label: 'Sensores', path: null, live: true, note: 'señal real o diseño', estado: 'REAL' },
  { label: 'Telemetría', path: null, live: true, note: 'bus de evidencia', estado: 'REAL' },
  { label: 'Matemáticas', path: '/advanced-math-v2', live: true, note: 'modelado', estado: 'SIM' },
  { label: 'Señales', path: '/lab-telecom', live: true, note: 'features espectrales', estado: 'REAL-LOCAL' },
  { label: 'IA', path: '/ai-predictive', live: false, note: 'interpretación con confianza', estado: 'SIM' },
  { label: 'Knowledge Hub', path: '/knowledge', live: true, note: 'evidencia registrada', estado: 'REAL' },
  { label: 'Agentes', path: null, live: false, note: 'ACP, diseño', estado: 'DISENO' },
  { label: 'Usuario', path: null, live: true, note: 'texto, voz, API', estado: 'REAL' }
];

const SignalRiver = ({ onSelectSignal }) => {
  return (
    <nav className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900/60">
      {RIVER_LINKS.map((link, index) => (
        <React.Fragment key={link.label}>
          {index > 0 && (
            <span className="text-gray-600 select-none">›</span>
          )}
          {link.path ? (
            <Link
              to={link.path}
              className={
                'px-3 py-1 rounded-md text-xs font-medium transition-colors ' +
                (link.live
                  ? 'text-gray-100 hover:text-white border border-gray-600 bg-gray-800/60'
                  : 'text-gray-500 hover:text-gray-300 border border-gray-800 bg-gray-900/40')
              }
              title={link.note}
            >
              <span className="flex flex-col gap-1">
                <span>{link.label}</span>
                <HonestyBadge estado={link.estado} showConfidence={false} />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onSelectSignal && onSelectSignal(link.label)}
              className={
                'px-3 py-1 rounded-md text-xs font-medium transition-colors ' +
                (link.live
                  ? 'text-gray-100 hover:text-white border border-gray-600 bg-gray-800/60'
                  : 'text-gray-500 hover:text-gray-300 border border-gray-800 bg-gray-900/40')
              }
              title={link.note}
            >
              <span className="flex flex-col gap-1">
                <span>{link.label}</span>
                <HonestyBadge estado={link.estado} showConfidence={false} />
              </span>
            </button>
          )}
        </React.Fragment>
      ))}
      <span className="ml-auto text-[10px] text-gray-500 uppercase tracking-widest">
        río científico CMSC
      </span>
    </nav>
  );
};

export default SignalRiver;