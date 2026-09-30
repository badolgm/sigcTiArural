import React from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';

const NAV_ITEMS = [
  { label: 'Centro CMSC', route: null, action: 'overview', estado: 'REAL', note: 'escena científica' },
  { label: 'Matemáticas', route: '/advanced-math-v2', estado: 'SIM', note: 'MMC · motor' },
  { label: 'Señales', route: null, action: 'catalog', estado: 'REAL', note: 'catálogo S01..S80' },
  { label: 'Electrónica', route: '/lab-electronics', estado: 'SIM', note: 'Falstad + solver' },
  { label: 'Física', route: null, estado: 'DISENO', note: 'sin ruta aún' },
  { label: 'Química / Fisicoquímica', route: null, estado: 'DISENO', note: 'sin ruta aún' },
  { label: 'Telecomunicaciones', route: '/lab-telecom', estado: 'REAL-LOCAL', note: 'micro FFT en vivo' },
  { label: 'Robótica', route: '/labs/robotics', estado: 'ROTO', note: 'cliente localhost:8000' },
  { label: 'Sistemas Embebidos', route: '/lab-embedded', estado: 'DISENO', note: 'Wokwi/Pyodide REF' },
  { label: 'IA / Machine Learning', route: '/ai-predictive', estado: 'REAL', note: 'clasificación binaria' },
  { label: 'Knowledge Hub', route: '/knowledge', estado: 'REAL', note: '51 docs, 6 categorías' }
];

const CmscSideNav = ({ view, onNav }) => {
  return (
    <nav className="rounded-xl border border-gray-800 bg-gray-900/40 p-2.5">
      <div className="px-1.5 pb-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-gray-800 mb-2">
        Navegación CMSC
      </div>
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.action === 'overview' && view === 'overview';
          const inner = (
            <>
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] text-gray-200 truncate">{item.label}</span>
                <span className="ml-auto shrink-0">
                  <HonestyBadge estado={item.estado} confidence={null} showConfidence={false} />
                </span>
              </span>
              <span className="text-[10px] text-gray-500 truncate">{item.note}</span>
            </>
          );
          if (item.route) {
            return (
              <li key={item.label}>
                <Link
                  to={item.route}
                  className="block px-2.5 py-1.5 rounded-md border border-gray-800 bg-gray-900/50 hover:border-gray-600 transition-colors"
                >
                  {inner}
                </Link>
              </li>
            );
          }
          if (item.estado === 'DISENO') {
            return (
              <li key={item.label}>
                <button
                  type="button"
                  disabled
                  title={item.note}
                  className="w-full text-left px-2.5 py-1.5 rounded-md border border-gray-800 bg-gray-900/30 cursor-not-allowed opacity-80"
                >
                  {inner}
                </button>
              </li>
            );
          }
          return (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => onNav && onNav(item.action)}
                className={
                  'w-full text-left px-2.5 py-1.5 rounded-md border transition-colors ' +
                  (active
                    ? 'border-gray-500 bg-gray-800'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-600')
                }
                style={active ? { color: NEON.primary } : undefined}
              >
                {inner}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default CmscSideNav;