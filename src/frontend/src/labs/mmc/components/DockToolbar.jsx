import React from 'react';

const DOCK_TABS = [
  { id: '2d',        label: '2D',       icon: '▭',  hint: 'Vista 2D · Stage principal' },
  { id: '3d',        label: '3D',       icon: '◈',   hint: 'Vista 3D · DISENO' },
  { id: 'fourier',   label: 'Fourier',  icon: 'ℱ',   hint: 'Análisis espectral' },
  { id: 'dsp',       label: 'DSP',      icon: '≋',   hint: 'Procesamiento digital de señal' },
  { id: 'signals',   label: 'Signals',  icon: '📡',  hint: 'Generadores de señal' },
  { id: 'geometry',  label: 'Geometry', icon: '△',   hint: 'Geometría y rotaciones' },
  { id: 'workspace', label: 'Workspace', icon: '💾', hint: 'workspace.model · workspace.signal' }
];

const DockToolbar = ({ active, onSelect }) => {
  return (
    <nav className="mmc-dock" aria-label="Dock de herramientas matemáticas">
      <div className="mmc-dock-h" aria-hidden="true">
        Dock · herramientas
      </div>
      <div className="mmc-dock-tabs" role="tablist">
        {DOCK_TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              title={t.hint}
              onClick={() => onSelect(t.id)}
              className={
                'mmc-dock-tab ' +
                (isActive ? 'mmc-dock-tab-active ' : '') +
                'mmc-dock-tab-' + t.id
              }
            >
              <span className="mmc-dock-tab-icon" aria-hidden="true">{t.icon}</span>
              <span className="mmc-dock-tab-label">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export { DOCK_TABS };
export default DockToolbar;
