import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ClusterCard from '../components/ClusterCard.jsx';
import { hardwareCatalogEntries } from '../data/catalog-data.js';

const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  alert: '#FF3131',
  darkBackground: '#0a0a0a',
};

const STATUS_LABEL = {
  reference: { text: 'Referencia', color: NEON_COLORS.primary },
  construction: { text: 'En construcción', color: '#FBBF24' },
  operativo: { text: 'Operativo', color: NEON_COLORS.secondary },
  diseño: { text: 'En diseño', color: '#FBBF24' },
};

// Tipos de recursos educativos de la Learning Layer (U3.4)
const RESOURCE_TYPES = [
  { type: 'course',   icon: '🎓', label: 'Curso' },
  { type: 'video',    icon: '🎬', label: 'Video' },
  { type: 'research', icon: '📄', label: 'Investigación' },
  { type: 'dataset',  icon: '📊', label: 'Dataset' },
  { type: 'repo',     icon: '📦', label: 'Repositorio' },
];

const CHAIN_LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Proyectos', to: '/proyectos' },
  { label: 'Hardware', to: '/hardware-catalog' },
  { label: 'Conocimiento', to: '/knowledge' },
  { label: 'Laboratorios', to: '/labs' },
];

const HardwareDetailPage = () => {
  const { id } = useParams();
  const entry = hardwareCatalogEntries.find((e) => e.id === id);

  if (!entry) {
    return <Navigate to="/hardware-catalog" replace />;
  }

  const statusInfo = STATUS_LABEL[entry.status] || STATUS_LABEL.reference;
  const faseInfo = STATUS_LABEL[entry.fase] || null;

  return (
    <div className="min-h-screen bg-black text-white relative" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0,255,255,0.15), transparent 60%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* CADENA DE NAVEGACIÓN */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-gray-500">
          {CHAIN_LINKS.map((link, i) => (
            <React.Fragment key={link.to}>
              {i > 0 && <span>/</span>}
              {link.to === '/hardware-catalog' ? (
                <span className="text-[#00FFFF] font-semibold">Hardware</span>
              ) : (
                <Link to={link.to} className="hover:text-[#00FFFF] transition-colors">{link.label}</Link>
              )}
            </React.Fragment>
          ))}
          <span>/</span>
          <span className="text-gray-300">{entry.name}</span>
        </div>

        {/* VOLVER AL CATÁLOGO */}
        <Link to="/hardware-catalog" className="inline-flex items-center gap-1 text-xs mb-4 transition-colors" style={{ color: NEON_COLORS.primary }}>
          ← Volver al catálogo completo
        </Link>

        {/* HEADER DE LA PLATAFORMA */}
        <div className="mb-8 p-6 rounded-xl border bg-gray-900 bg-opacity-70" style={{ borderColor: `${NEON_COLORS.primary}50`, boxShadow: `0 0 15px ${NEON_COLORS.primary}20` }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-5xl">{entry.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-wider flex items-center gap-3 flex-wrap" style={{ color: NEON_COLORS.primary, textShadow: `0 0 8px ${NEON_COLORS.primary}60` }}>
                    {entry.name}
                  </h1>
                  <p className="text-sm mt-1">
                    <span className="text-gray-400">{entry.role}</span>
                    <span className="text-gray-600"> · </span>
                    <span style={{ color: NEON_COLORS.secondary }}>{entry.vendor}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-1 rounded border" style={{ borderColor: `${statusInfo.color}60`, color: statusInfo.color }}>
                {statusInfo.text}
              </span>
              {faseInfo && (
                <span className="text-xs font-mono px-2 py-1 rounded border" style={{ borderColor: `${faseInfo.color}60`, color: faseInfo.color }}>
                  {faseInfo.text}
                </span>
              )}
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <p className="mt-4 text-gray-300 leading-relaxed">{entry.description}</p>

          {/* PROTOCOLOS */}
          {entry.protocols?.length > 0 && (
            <div className="mt-4">
              <span className="text-xs uppercase tracking-widest text-gray-500">Protocolos:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {entry.protocols.map((p) => (
                  <span key={p} className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400 font-mono">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TARJETA RESUMEN (reutiliza ClusterCard tal cual) */}
        <div className="mb-6">
          <ClusterCard id={entry.id} name={entry.name} role={entry.role} status={entry.status} icon={entry.icon} banner={entry.banner} links={entry.links} data={entry.data} />
        </div>

        {/* BARRA DE ECOSISTEMA (U3.5 — cadena viva, unifica Hardware → Knowledge → Labs → Projects → Aprende) */}
        <div className="mb-6 p-4 rounded-xl border bg-gray-900 bg-opacity-70 flex flex-wrap items-center gap-2" style={{ borderColor: `${NEON_COLORS.primary}40` }}>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mr-1">Ecosistema del dispositivo:</span>
          <Link to="/hardware-catalog" className="px-2.5 py-1 text-[11px] rounded border transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: NEON_COLORS.primary }}>
            🛒 Hardware
          </Link>
          <span className="text-gray-600 text-xs">→</span>
          <Link to="/knowledge" className="px-2.5 py-1 text-[11px] rounded border transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: NEON_COLORS.primary }}>
            📚 Knowledge {entry.knowledge?.length > 0 ? `(${entry.knowledge.length})` : ''}
          </Link>
          <span className="text-gray-600 text-xs">→</span>
          <Link to="/labs" className="px-2.5 py-1 text-[11px] rounded border transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.secondary}60`, color: NEON_COLORS.secondary }}>
            🧬 Labs {entry.labs?.length > 0 ? `(${entry.labs.length})` : ''}
          </Link>
          <span className="text-gray-600 text-xs">→</span>
          <Link to="/proyectos" className="px-2.5 py-1 text-[11px] rounded border transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.secondary}60`, color: NEON_COLORS.secondary }}>
            📋 Projects
          </Link>
          <span className="text-gray-600 text-xs">→</span>
          <Link to="/knowledge" className="px-2.5 py-1 text-[11px] rounded border transition-all hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: '#e6edf3' }}>
            🎓 Aprende {entry.resources?.length > 0 ? `(${entry.resources.length})` : ''}
          </Link>
        </div>

        {/* CONEXIONES DEL ECOSISTEMA */}
        <div className="grid gap-4 mb-6">
          {/* KNOWLEDGE */}
          {entry.knowledge?.length > 0 && (
            <div className="p-5 rounded-xl border bg-gray-900 bg-opacity-60">
              <h2 className="text-sm uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: NEON_COLORS.primary }}>
                📚 Knowledge Hub
              </h2>
              <div className="flex flex-wrap gap-2">
                {entry.knowledge.map((k) => (
                  <Link key={k.to} to={k.to} className="px-3 py-1.5 text-xs rounded border transition-all duration-200 hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: NEON_COLORS.primary }}>
                    📘 {k.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* LEARNING LAYER (U3.4 — aditivo, honesto) */}
          <div className="p-5 rounded-xl border bg-gray-900 bg-opacity-60">
            <h2 className="text-sm uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: NEON_COLORS.primary }}>
              🎓 Aprende
            </h2>
            {entry.resources?.length > 0 ? (
              <div className="space-y-2">
                {RESOURCE_TYPES.map((rt) => {
                  const items = entry.resources.filter((r) => r.type === rt.type);
                  if (items.length === 0) return null;
                  return (
                    <div key={rt.type}>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{rt.icon} {rt.label} ({items.length})</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {items.map((item, i) => (
                          <a key={`${rt.type}-${i}`} href={item.href} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs rounded border transition-all duration-200 hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: NEON_COLORS.primary }}>
                            {rt.icon} {item.label} ↗
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono text-gray-500">Pendiente de integración</p>
            )}
          </div>

          {/* LABORATORIOS */}
          {entry.labs?.length > 0 && (
            <div className="p-5 rounded-xl border bg-gray-900 bg-opacity-60">
              <h2 className="text-sm uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: NEON_COLORS.secondary }}>
                ⛁ Laboratorios
              </h2>
              <div className="flex flex-wrap gap-2">
                {entry.labs.map((lab) => (
                  <Link key={lab.to} to={lab.to} className="px-3 py-1.5 text-xs rounded border transition-all duration-200 hover:scale-105" style={{ borderColor: `${NEON_COLORS.secondary}60`, color: '#e6edf3' }}>
                    {lab.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ENLACES EXTERNOS / FABRICANTE */}
          {entry.links?.length > 0 && (
            <div className="p-5 rounded-xl border bg-gray-900 bg-opacity-60">
              <h2 className="text-sm uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#e6edf3' }}>
                🌐 Documentación oficial
              </h2>
              <div className="flex flex-wrap gap-2">
                {entry.officialUrl && (
                  <a href={entry.officialUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs rounded border transition-all duration-200 hover:scale-105 font-semibold" style={{ borderColor: `${NEON_COLORS.primary}60`, color: '#e6edf3' }}>
                    Sitio oficial ↗
                  </a>
                )}
                {entry.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs rounded border border-gray-700 text-gray-300 transition-all duration-200 hover:scale-105">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* EN CARRERA DEL ECOSISTEMA (BBB — solo para la plataforma matriz) */}
          {entry.id === 'BBB' && (
            <div className="p-5 rounded-xl border bg-gray-900 bg-opacity-60">
              <h2 className="text-sm uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: NEON_COLORS.secondary }}>
                💠 En el ecosistema SIGCTiArural
              </h2>
              <div className="flex flex-wrap gap-2">
                <Link to="/dashboard" className="px-3 py-1.5 text-xs rounded border transition-all duration-200 hover:scale-105" style={{ borderColor: `${NEON_COLORS.secondary}60`, color: '#e6edf3' }}>
                  🖥️ BBB-01 Gateway / MQTT
                </Link>
                <Link to="/dashboard" className="px-3 py-1.5 text-xs rounded border transition-all duration-200 hover:scale-105" style={{ borderColor: `${NEON_COLORS.secondary}60`, color: '#e6edf3' }}>
                  🧠 BBB-02 IA Edge / TFLite
                </Link>
                <Link to="/dashboard" className="px-3 py-1.5 text-xs rounded border transition-all duration-200 hover:scale-105" style={{ borderColor: `${NEON_COLORS.secondary}60`, color: '#e6edf3' }}>
                  🌱 BBB-03 Sensores IoT
                </Link>
              </div>
            </div>
          )}

          {/* PROYECTOS RELACIONADOS */}
          <div className="p-5 rounded-xl border bg-gray-900 bg-opacity-60">
            <h2 className="text-sm uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#e6edf3' }}>
              📋 Proyectos que lo integran
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link to="/proyectos" className="px-3 py-1.5 text-xs rounded border transition-all duration-200 hover:scale-105" style={{ borderColor: `${NEON_COLORS.primary}60`, color: '#e6edf3' }}>
                🌾 SIGCTiArural
              </Link>
            </div>
          </div>
        </div>

        {/* ESTADO HONESTO */}
        <div className="p-4 rounded-xl border-2 bg-gray-900 bg-opacity-70" style={{ borderColor: '#334155' }}>
          <h2 className="text-sm font-bold uppercase mb-2" style={{ color: '#e6edf3' }}>Estado honesto</h2>
          <p className="text-xs text-gray-400">
            Página derivada de <span className="font-mono">catalog-data.js</span> — misma fuente que el catálogo y el Mapa de Dispositivos. Si la plataforma está en diseño, su estado se muestra como tal: <span style={{ color: '#FBBF24' }}>En construcción</span>. Los enlaces dirigen a documentación oficial del fabricante y al ecosistema interno.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HardwareDetailPage;