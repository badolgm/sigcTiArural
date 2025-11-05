import React, { useState } from 'react';
import { labCategories, NEON_COLORS } from '../data/lab-data';

const SubSection = ({ title, accent, links, onNavigate }) => (
  <div className="mb-4 p-3 rounded-lg border border-opacity-30" style={{ borderColor: accent }}>
    <h4 className="text-sm font-semibold mb-2 uppercase" style={{ color: accent, textShadow: `0 0 4px ${accent}60` }}>
      {title}
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {links.map((l) => (
        l.internal && l.to ? (
          <button
            key={l.label}
            onClick={() => onNavigate && onNavigate(l.to)}
            className="px-2 py-1 text-xs rounded border transition-all duration-200 hover:scale-105"
            style={{ borderColor: `${accent}40`, color: '#e6edf3', backgroundColor: `${accent}10` }}
          >
            {l.label}
          </button>
        ) : (
          <a
            key={l.href || l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="px-2 py-1 text-xs rounded border transition-all duration-200 hover:scale-105"
            style={{ borderColor: `${accent}40`, color: '#e6edf3', backgroundColor: `${accent}10` }}
          >
            {l.label}
          </a>
        )
      ))}
    </div>
  </div>
);

const Card = ({ title, accent, links, sections, icon, isExpanded, onNavigate }) => {
  const [expanded, setExpanded] = useState(isExpanded || false);
  
  return (
    <div
      className="card-float rounded-lg p-4 transition-all duration-300"
      style={{ 
        boxShadow: `0 0 8px ${accent}40`, 
        borderColor: `${accent}50`,
        border: `1px solid ${accent}30`
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-lg font-bold uppercase flex items-center gap-2"
          style={{ color: accent, textShadow: `0 0 6px ${accent}70` }}
        >
          <span className="text-xl">{icon}</span>
          {title}
        </h3>
        {sections && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs px-2 py-1 rounded border transition-all"
            style={{ borderColor: accent, color: accent }}
          >
            {expanded ? '▼' : '▶'}
          </button>
        )}
      </div>
      
      {sections ? (
        <div className={`transition-all duration-300 ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-28 opacity-80 overflow-hidden'}`}>
          {sections.map((section) => (
            <SubSection key={section.title} {...section} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {links.map((l) => (
            l.internal && l.to ? (
              <button
                key={l.label}
                onClick={() => onNavigate && onNavigate(l.to)}
                className="px-3 py-2 text-sm rounded border neon-btn transition-all duration-200 hover:scale-105"
                style={{ borderColor: `${accent}60`, color: '#e6edf3' }}
              >
                {l.label}
              </button>
            ) : (
              <a
                key={l.href || l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 text-sm rounded border neon-btn transition-all duration-200 hover:scale-105"
                style={{ borderColor: `${accent}60`, color: '#e6edf3' }}
              >
                {l.label}
              </a>
            )
          ))}
        </div>
      )}
    </div>
  );
};

const LabCatalog = ({ onNavigate }) => {
  // Orden preferido para mejorar agrupación temática en el grid
  const desiredOrder = [
    'Robótica',
    'Sistemas Embebidos',
    'Física y Electrónica',
    'Telecomunicaciones',
    'Agricultura + IA',
    'Ciencia de Datos',
    'Matemáticas Avanzadas',
    'Cursos',
    'SENA y Universidades / OCW',
    'Documentación Técnica',
    'Web3 & Blockchain',
  ];
  const sortedCategories = [...labCategories].sort((a, b) => {
    const ia = desiredOrder.indexOf(a.title);
    const ib = desiredOrder.indexOf(b.title);
    const ra = ia === -1 ? 999 : ia;
    const rb = ib === -1 ? 999 : ib;
    return ra - rb;
  });
  return (
    <div className="p-6 pt-20 min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto text-white">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-6 uppercase text-center"
          style={{ color: NEON_COLORS.primary, textShadow: `0 0 12px ${NEON_COLORS.primary}, 0 0 8px ${NEON_COLORS.primary}AA` }}
        >
          🧬 Recursos Académicos y Laboratorios Científicos Avanzados
        </h1>
        <p className="text-base text-center text-gray-400 mb-8 max-w-3xl mx-auto">
          Recursos académicos científicos y simulaciones matemáticas avanzadas y laboratorios virtuales para investigación científica de alto nivel.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedCategories.map((c) => (
            <Card key={c.title} {...c} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabCatalog;