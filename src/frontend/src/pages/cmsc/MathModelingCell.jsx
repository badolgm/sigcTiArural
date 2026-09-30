import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';
import { SIGNAL_CATALOG } from './signalCatalog.js';
import { IntegralsInteractive, EigenvaluesInteractive, DiffEqInteractive, SignalsInteractive } from '../../labs/AdvancedMathLabV2.jsx';

const S35 = SIGNAL_CATALOG.find((s) => s.signal_id === 'S35');

const TABS = [
  {
    id: 'calculo',
    code: 'M01',
    label: 'Modelado numérico',
    icon: '∫',
    Component: IntegralsInteractive,
    note: 'derivadas · integrales · TFC · curva de referencia'
  },
  {
    id: 'algebra',
    code: 'M02',
    label: 'Álgebra y geometría',
    icon: 'λ',
    Component: EigenvaluesInteractive,
    note: 'eigenvalores · eigenvectores 2×2 · estabilidad'
  },
  {
    id: 'simulacion',
    code: 'M03',
    label: 'Optimización',
    icon: '∂',
    Component: DiffEqInteractive,
    note: 'EDO · dinámica · ciclos límite'
  },
  {
    id: 'senales',
    code: 'M04',
    label: 'Análisis de señales',
    icon: 'ℱ',
    Component: SignalsInteractive,
    note: 'Fourier · AM · demodulación · espectro'
  }
];

const OUTPUTS = [
  'modelos matemáticos',
  'señales sintéticas',
  'simulaciones numéricas',
  'señales de prueba',
  'escenarios experimentales',
  'transformaciones analíticas',
  'validaciones teóricas'
];

const DESTINOS = [
  { label: 'Análisis espectral', estado: 'DISENO' },
  { label: 'Electrónica', estado: 'REAL' },
  { label: 'Telecomunicaciones', estado: 'DISENO' },
  { label: 'Hardware BBB', estado: 'DISENO' },
  { label: 'Sistemas embebidos', estado: 'DISENO' },
  { label: 'IA Predictiva', estado: 'DISENO' },
  { label: 'Knowledge Hub', estado: 'DISENO' }
];

const CADENA = ['Teoría', 'Simulación', 'Implementación', 'Medición real', 'Conocimiento'];

const MathModelingCell = () => {
  const [tab, setTab] = useState('calculo');
  const active = TABS.find((t) => t.id === tab);

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 flex flex-col gap-2">
      <style>{`
        .cmsc-mathlab .interactive-section { border:1px solid #00ffff44; border-radius:10px; padding:10px; }
        .cmsc-mathlab .controls { display:grid; grid-template-columns:repeat(auto-fit, minmax(110px,1fr)); gap:8px; margin:8px 0; }
        .cmsc-mathlab .ctrl { display:flex; flex-direction:column; gap:4px; }
        .cmsc-mathlab .ctrl label { font-size:10px; color:#9aa4b0; text-transform:uppercase; letter-spacing:.5px; }
        .cmsc-mathlab .ctrl input { width:100%; accent-color:#00ffff; }
        .cmsc-mathlab .ctrl span { font-size:10px; color:#cbd5e1; }
        .cmsc-mathlab .matrix { display:grid; grid-template-columns:repeat(2, 64px); gap:6px; margin-top:8px; }
        .cmsc-mathlab .matrix div { background:#0d0d1f; border:1px solid #00ffff55; padding:5px; text-align:center; border-radius:6px; font-size:11px; color:#cbd5e1; font-family:monospace; }
        .cmsc-mathlab .svg-wrap { background:#050509; border:1px solid #00ffff33; border-radius:8px; padding:6px; overflow:hidden; }
        .cmsc-mathlab .svg-wrap svg { width:100%; height:auto; }
        .cmsc-mathlab p { font-size:10px; color:#9aa4b0; }
        .cmsc-mathlab a { color:#00ffff; }
      `}</style>

      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-100">Modelado científico</h3>
          <p className="text-[10px] text-gray-500">Motor de Modelado Científico (MMC)</p>
        </div>
        {S35 && <HonestyBadge estado={S35.estado} confidence={S35.confianza} showConfidence={false} />}
      </div>

      <p className="text-[11px] text-gray-400">
        El MMC es el motor matemático y experimental del ecosistema. Genera modelos matemáticos,
        señales sintéticas, simulaciones numéricas y escenarios experimentales utilizados por el CMSC.
      </p>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Qué produce</p>
        <div className="flex flex-wrap gap-1">
          {OUTPUTS.map((o) => (
            <span
              key={o}
              className="text-[10px] px-1.5 py-0.5 rounded border border-cyan-900/60 bg-cyan-950/30 text-cyan-300"
            >
              {o}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
          A dónde puede dirigirse
        </p>
        <div className="flex flex-wrap gap-1">
          {DESTINOS.map((d) => (
            <span
              key={d.label}
              className="text-[10px] px-1.5 py-0.5 rounded border border-gray-800 bg-gray-900/60 text-gray-400"
              title={
                d.estado === 'REAL'
                  ? 'Conexión activa: el MMC lee señales reales del Laboratorio de Electrónica'
                  : 'Destino de integración declarado en la arquitectura CMSC, sin cableado activo'
              }
            >
              {d.label}
              <span
                className="ml-1 font-mono text-[9px]"
                style={{ color: d.estado === 'REAL' ? '#39FF14' : '#6b7280' }}
              >
                {d.estado}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">
          Por qué existe
        </p>
        <div className="flex items-center gap-1 flex-wrap">
          {CADENA.map((c, i) => (
            <React.Fragment key={c}>
              {i > 0 && <span className="text-gray-600 text-[10px]">→</span>}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-900/70 border border-gray-800 text-gray-300">
                {c}
              </span>
            </React.Fragment>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          La teoría no siempre coincide con el comportamiento físico real. Por eso el MMC existe.
        </p>
      </div>

      <p className="text-[11px] text-gray-400 border-t border-gray-800 pt-2">
        Instrumento S35 · <span style={{ color: '#FFB300' }}>SIM</span>: el Motor de Modelado Científico produce
        modelos matemáticos, simulaciones controladas y señales sintéticas que alimentan el ecosistema CMSC.
        Sus resultados pueden dirigirse hacia análisis espectral, electrónica y filtrado, telecomunicaciones,
        hardware experimental, Inteligencia Artificial y Knowledge Hub, permitiendo validar diferencias entre
        teoría, simulación y comportamiento real.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              'px-1 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-tight leading-tight border transition-colors ' +
              (tab === t.id
                ? 'bg-gray-800 text-white border-gray-500'
                : 'text-gray-400 border-gray-800 hover:border-gray-600')
            }
            style={tab === t.id ? { color: NEON.primary } : undefined}
          >
            <span className="block text-[9px] leading-none font-mono opacity-70">{t.code}</span>
            <span className="block leading-tight">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="cmsc-mathlab max-h-[430px] overflow-y-auto rounded-lg border border-gray-800/60 bg-gray-950/40 p-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
            {active.code} · {active.icon} {active.label}
          </span>
          <span className="text-[10px] text-gray-500">{active.note}</span>
        </div>
        {active.Component ? <active.Component /> : null}
      </div>

      <Link
        to="/advanced-math-v2"
        className="mt-1 px-3 py-1.5 rounded-md text-xs font-semibold border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors text-center"
        style={{ borderColor: '#00FFFF66', color: '#00FFFF', backgroundColor: 'rgba(0,255,255,0.06)' }}
      >
        Abrir Motor de Modelado Científico →
      </Link>
    </section>
  );
};

export default MathModelingCell;