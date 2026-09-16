import React from 'react';
import { Link } from 'react-router-dom';
import ClusterCard from '../components/ClusterCard.jsx';
import { hardwareCatalogEntries } from '../data/catalog-data.js';
import { NEON_COLORS } from '../data/lab-data.js';

const CHAIN_LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Proyectos', to: '/proyectos' },
  { label: 'Hardware', to: '/hardware-catalog', current: true },
  { label: 'Conocimiento', to: '/knowledge' },
  { label: 'Laboratorios', to: '/labs' },
];

const HardwareCatalogPage = () => {
  return (
    <div className="p-6 pt-24 min-h-screen text-white font-sans" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter" style={{ color: NEON_COLORS.primary, textShadow: `0 0 15px ${NEON_COLORS.primary}, 0 0 10px ${NEON_COLORS.primary}AA` }}>
              🛒 Hardware Catalog
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
              Inventario de plataformas de hardware del ecosistema (referencia y diseño). No reemplaza el Dashboard ni la telemetría: los BBB con estado en vivo viven en el Dashboard.
            </p>
          </div>
        </div>

        {/* Cadena de contexto: Proyectos → Hardware → Conocimiento → Labs */}
        <div className="mb-8 p-4 rounded-xl border bg-gray-900 bg-opacity-70 flex flex-wrap items-center gap-2" style={{ borderColor: `${NEON_COLORS.primary}40` }}>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mr-1">Cadena:</span>
          {CHAIN_LINKS.map((link, i) => (
            <React.Fragment key={link.label}>
              {i > 0 && <span className="text-gray-600 text-xs">→</span>}
              {link.current ? (
                <span className="px-2 py-0.5 text-[11px] rounded border font-semibold" style={{ borderColor: NEON_COLORS.primary, color: NEON_COLORS.primary, backgroundColor: `${NEON_COLORS.primary}15` }}>
                  {link.label}
                </span>
              ) : (
                <Link to={link.to} className="px-2 py-0.5 text-[11px] rounded border text-center transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}40`, color: '#e6edf3' }}>
                  {link.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bloque relacional: Proyectos que usan este hardware */}
        <div className="mb-8 p-4 rounded-xl border bg-gray-900 bg-opacity-70" style={{ borderColor: `${NEON_COLORS.secondary}40` }}>
          <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">📋 Proyectos que conectan con este hardware</h3>
          <div className="flex flex-wrap gap-2">
            <Link to="/proyectos" className="px-3 py-1.5 text-xs rounded border transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.secondary}60`, color: '#e6edf3' }}>
              Ver todos los Proyectos
            </Link>
            <Link to="/proyectos" className="px-3 py-1.5 text-xs rounded border transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: '#e6edf3' }}>
              📋 SIGCTiArural
            </Link>
            <Link to="/proyectos" className="px-3 py-1.5 text-xs rounded border transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: '#e6edf3' }}>
              🩺 UBTN
            </Link>
            <Link to="/proyectos" className="px-3 py-1.5 text-xs rounded border transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: '#e6edf3' }}>
              🚜 Agricultura IA
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hardwareCatalogEntries.map((entry) => (
            <div key={entry.id} className="flex flex-col">
              <ClusterCard id={entry.id} name={entry.name} role={entry.role} status={entry.status} icon={entry.icon} banner={entry.banner} links={entry.links} data={entry.data} />
              <div className="mt-2 p-4 rounded-xl border bg-gray-900 bg-opacity-60 text-sm space-y-1">
                <p className="text-gray-300">
                  <span className="text-gray-500 uppercase mr-1">Descripción:</span>
                  {entry.description}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500 uppercase mr-1">Fabricante:</span>
                  {entry.vendor}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500 uppercase mr-1">Protocolos:</span>
                  {entry.protocols.join(' · ')}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a href={entry.officialUrl} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs rounded border text-center transition-all duration-200 hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: '#e6edf3' }}>
                    Sitio oficial
                  </a>
                  {entry.labs.map((lab) => (
                    <Link key={lab.to} to={lab.to} className="px-2 py-1 text-xs rounded border text-center transition-all duration-200 hover:scale-105" style={{ borderColor: `${NEON_COLORS.secondary}60`, color: '#e6edf3' }}>
                      {lab.label}
                    </Link>
                  ))}
                  {entry.knowledge?.map((k) => (
                    <Link key={k.to} to={k.to} className="px-2 py-1 text-xs rounded border text-center transition-all duration-200 hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: NEON_COLORS.primary }}>
                      📚 {k.label}
                    </Link>
                  ))}
                </div>
                <Link to={`/hardware/${entry.id}`} className="block mt-3 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded border text-center transition-all duration-200 hover:scale-[1.02]" style={{ borderColor: `${NEON_COLORS.primary}70`, color: NEON_COLORS.primary, backgroundColor: `${NEON_COLORS.primary}15`, boxShadow: `0 0 10px ${NEON_COLORS.primary}30` }}>
                  🔍 Ver ficha de {entry.name} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-4 rounded-xl border-2 bg-gray-900 bg-opacity-70" style={{ borderColor: '#334155' }}>
          <h2 className="text-lg font-bold uppercase mb-2" style={{ color: '#e6edf3' }}>Estado honesto</h2>
          <p className="text-sm text-gray-400">
            Este catálogo es una fuente de <strong>datos de referencia</strong>: no modifica el Dashboard, la telemetría, los laboratorios ni el Knowledge Hub. Los estados siguen el vocabulario <code>operativo / referencia / diseño</code>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HardwareCatalogPage;