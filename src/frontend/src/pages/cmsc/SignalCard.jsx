import React from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON, formatConfidence } from './honesty.js';

// Ficha de señal (N3). Solo lectura: lectura del mapa + evidencia del KH.
// Las puertas de laboratorio son enlaces a rutas existentes, jamás copias.
const SIGNAL_LAB_DOOR = {
  S30: { to: '/lab-telecom', label: 'Ir a TelecomLab' },
  S35: { to: '/advanced-math-v2', label: 'Ir a Matemáticas v2' },
  S50: { to: '/labs/robotics', label: 'Ir a Robótica' },
  S61: { to: '/ai-predictive', label: 'Ir a IA Predictiva' },
  S79: { to: '/knowledge', label: 'Ir a Knowledge Hub' }
};

const SignalCard = ({ signal, docs }) => (
  <div className="px-4 py-3 rounded-xl border border-gray-800 bg-gray-900/40">
    <div className="flex flex-wrap items-center gap-2 mb-2">
      <span className="text-sm font-mono font-bold" style={{ color: NEON.primary }}>{signal.signal_id}</span>
      <h4 className="text-sm font-bold text-gray-100">{signal.name}</h4>
      <HonestyBadge estado={signal.estado} confidence={signal.confianza} />
    </div>
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-400 mt-1">
      <div>Dominio</div><div className="text-gray-200">{signal.dominio}</div>
      <div>Clase</div><div className="text-gray-200">{signal.clase_senal}</div>
      <div>Origen</div><div className="text-gray-200">{signal.origen || '—'}</div>
      <div>Cadencia</div><div className="text-gray-200">{signal.cadencia || '—'}</div>
      <div>Puerto</div><div className="text-gray-200">{signal.puerto || '—'}</div>
      <div>Consumidores</div><div className="text-gray-200">{signal.consumidores || '—'}</div>
      <div>Confianza</div><div className="text-gray-200 font-mono">{formatConfidence(signal.confianza)}</div>
      <div>Ancla</div><div className="text-gray-200 truncate">{signal.metadata_ref || '—'}</div>
    </dl>
    {signal.nota && <p className="text-[11px] text-gray-500 mt-2 italic">{signal.nota}</p>}
    {SIGNAL_LAB_DOOR[signal.signal_id] && (
      <Link
        to={SIGNAL_LAB_DOOR[signal.signal_id].to}
        className="inline-block mt-3 text-[11px] px-3 py-1.5 rounded-md border text-gray-200 hover:text-white transition-colors"
        style={{ borderColor: NEON.primary, color: NEON.primary }}
      >
        {SIGNAL_LAB_DOOR[signal.signal_id].label} →
      </Link>
    )}
    {docs && docs.length > 0 && (
      <div className="mt-3 pt-2 border-t border-gray-800">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Evidencia KH</span>
        <ul className="mt-1 space-y-0.5">
          {docs.slice(0, 4).map((d) => (
            <li key={d.id} className="text-[11px]">
              <Link to={d.route} className="hover:underline" style={{ color: '#7dd3fc' }}>{d.title}</Link>
              <span className="text-gray-600"> · {d.category}</span>
            </li>
          ))}
          {docs.length > 4 && <li className="text-[10px] text-gray-500">+ {docs.length - 4} más</li>}
        </ul>
      </div>
    )}
  </div>
);

export default SignalCard;