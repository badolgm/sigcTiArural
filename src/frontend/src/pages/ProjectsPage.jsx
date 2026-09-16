import React from 'react';
import { Link } from 'react-router-dom';
import { ecosystemProjects } from '../data/projects-data.js';
import { NEON_COLORS } from '../data/lab-data.js';

const STATUS_STYLE = {
  operativo: { borderColor: '#39FF14', label: '🟢 Operativo', color: '#39FF14' },
  diseño:    { borderColor: '#f59e0b', label: '🔷 Diseño',    color: '#f59e0b' },
  marco:     { borderColor: '#818cf8', label: '📐 Marco',     color: '#818cf8' },
};

const CHAIN_LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Proyectos', to: '/proyectos', current: true },
  { label: 'Hardware', to: '/hardware-catalog' },
  { label: 'Conocimiento', to: '/knowledge' },
  { label: 'Laboratorios', to: '/labs' },
];

const ProyectoCard = ({ project }) => {
  const st = STATUS_STYLE[project.status] || STATUS_STYLE.operativo;

  return (
    <div
      className="p-5 rounded-xl border-2 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] flex flex-col"
      style={{ borderColor: `${st.borderColor}50`, boxShadow: `0 0 12px ${st.borderColor}20` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: st.color }}>
          <span>{project.icon}</span> {project.name}
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: `${st.borderColor}60`, color: st.color }}>
          {st.label}
        </span>
      </div>
      <p className="text-xs font-mono text-gray-500 mb-2 uppercase">{project.role}</p>

      {/* Descripción */}
      <p className="text-sm text-gray-300 mb-4">{project.description}</p>

      {/* Enlaces */}
      <div className="space-y-3 mt-auto">
        {/* Conocimiento */}
        {project.knowledge.length > 0 && (
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">📚 Conocimiento</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {project.knowledge.map((k) => (
                <Link key={k.to} to={k.to} className="px-2 py-0.5 text-[10px] rounded border text-center transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: NEON_COLORS.primary }}>
                  {k.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Laboratorios */}
        {project.labs.length > 0 && (
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">🧬 Laboratorios</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {project.labs.map((l) => (
                <Link key={l.to} to={l.to} className="px-2 py-0.5 text-[10px] rounded border text-center transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.secondary}60`, color: '#e6edf3' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Hardware */}
        {project.hardware.length > 0 && (
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">⚙️ Hardware</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {project.hardware.map((h) => (
                <Link key={h.to} to={h.to} className="px-2 py-0.5 text-[10px] rounded border text-center transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: '#e6edf3' }}>
                  {h.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Links externos */}
        {project.links.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-800 mt-2">
            {project.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="px-2 py-0.5 text-[10px] rounded border text-center transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}40`, color: '#e6edf3' }}>
                ↗ {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectsPage = () => (
  <div className="p-6 pt-24 min-h-screen text-white font-sans" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter" style={{ color: NEON_COLORS.primary, textShadow: `0 0 15px ${NEON_COLORS.primary}, 0 0 10px ${NEON_COLORS.primary}AA` }}>
            📋 Proyectos Reales
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">
            Proyectos activos y en diseño del ecosistema SIGC&T Rural. Cada proyecto se conecta con conocimiento, laboratorios y hardware. Los estados reflejan la realidad: operativo / diseño.
          </p>
        </div>
      </div>

      {/* Cadena de contexto: Proyectos ↔ Hardware ↔ Conocimiento ↔ Labs */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ecosystemProjects.map((p) => (
          <ProyectoCard key={p.id} project={p} />
        ))}
      </div>

      <div className="mt-10 p-4 rounded-xl border-2 bg-gray-900 bg-opacity-70" style={{ borderColor: '#334155' }}>
        <h2 className="text-lg font-bold uppercase mb-2" style={{ color: '#e6edf3' }}>Estado honesto</h2>
        <p className="text-sm text-gray-400">
          Este espacio representa <strong>proyectos reales y propuestos</strong>. Los estados <code>operativo</code> y <code>diseño</code> son vocabulario vivo. No se ofrece ninguna vista de proyecto con datos falsos.
        </p>
      </div>
    </div>
  </div>
);

export default ProjectsPage;