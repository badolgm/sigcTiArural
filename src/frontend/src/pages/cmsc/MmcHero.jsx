import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON, honestyMeta } from './honesty.js';
import { SIGNAL_CATALOG } from './signalCatalog.js';
import { VISUAL_ENGINE } from '../../labs/mmc/engines.js';

const S35 = SIGNAL_CATALOG.find((s) => s.signal_id === 'S35');

const ACTIVE_SIGNAL = {
  id: 'S35',
  expr: 'y(t)=2·sin(2π·100t)',
  fs: 2000,
  N: 41,
  clase: 'GENERADA',
  dominio: 'Matemático'
};

const ENGINE_STATES = ['LISTO', 'CARGANDO', 'ROTO'];
const WORKSPACE_ROWS = ['workspace.model', 'workspace.signal'];
const WORKSPACE_STATES = ['PREPARADO', 'CONECTADO', 'DESACOPLADO'];

const CAPABILITIES = [
  { label: 'Funciones', estado: 'ok' },
  { label: 'Fourier', estado: 'ok' },
  { label: 'Signals', estado: 'ok' },
  { label: 'DSP', estado: 'parcial' },
  { label: 'Geometry', estado: 'preparado' },
  { label: 'Workspace', estado: 'preparado' },
  { label: '3D', estado: 'diseno' }
];

const CAP_COLOR = {
  ok: '#39FF14',
  parcial: '#FFB300',
  preparado: '#66A3FF',
  diseno: '#9CA3AF'
};

const DESTINOS = [
  { label: 'Electrónica', to: '/lab-electronics', estado: 'REAL' },
  { label: 'Telecom', to: '/lab-telecom', estado: 'REAL-LOCAL' },
  { label: 'IA', to: '/ai-predictive', estado: 'REAL' },
  { label: 'FFT', to: null, estado: 'DISENO' },
  { label: 'Knowledge Hub', to: '/knowledge', estado: 'REAL' }
];

const SPARK = (() => {
  const w = 300;
  const h = 96;
  const amp = 2;
  const cycles = 2;
  const N = 41;
  const top = 10;
  const bottom = h - 10;
  const mid = h / 2;
  const scale = (bottom - top) / (2 * amp);
  const pts = [];
  for (let i = 0; i < N; i++) {
    const phase = (i / (N - 1)) * 2 * Math.PI;
    const y = amp * Math.sin(phase * cycles);
    const x = (i / (N - 1)) * w;
    pts.push(`${x.toFixed(1)},${(mid - y * scale).toFixed(1)}`);
  }
  const line = pts.join(' ');
  const area = `0,${mid} ${line} ${w},${mid}`;
  return { w, h, mid, line, area };
})();

const engineColor = (state) =>
  state === 'LISTO' ? '#39FF14' : state === 'ROTO' ? '#FF3131' : '#FFB300';

const MmcHero = () => {
  const [engine, setEngine] = useState('CARGANDO');
  const version = VISUAL_ENGINE?.version ?? '1.13.3';
  const license = VISUAL_ENGINE?.licenseBranch ?? 'MIT';

  useEffect(() => {
    let alive = true;
    let tries = 0;
    const check = () => {
      if (!alive) return;
      if (typeof window !== 'undefined' && window.JXG) {
        setEngine('LISTO');
        return;
      }
      tries += 1;
      if (tries < 8) {
        window.setTimeout(check, 400);
      } else {
        setEngine('ROTO');
      }
    };
    check();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section
      data-mmc-hero
      className="rounded-xl border border-cyan-500/60 bg-gray-900/50 p-2.5 flex flex-col gap-2"
      style={{ boxShadow: '0 0 0 1px rgba(0,255,255,0.12), 0 0 30px -8px rgba(0,255,255,0.45)' }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">⚙</span>
          <h3 className="text-lg xl:text-xl font-extrabold tracking-tight text-gray-50">
            Motor de Modelado Científico
          </h3>
          <span
            className="text-sm font-mono font-bold px-1.5 py-0.5 rounded"
            style={{ color: NEON.primary, backgroundColor: 'rgba(0,255,255,0.08)' }}
          >
            {ACTIVE_SIGNAL.id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            data-engine-state={engine}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
            style={{ color: engineColor(engine) }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: engineColor(engine), boxShadow: `0 0 6px ${engineColor(engine)}` }}
            />
            {engine}
          </span>
          <span className="text-[10px] font-mono text-gray-500">
            jsxgraph {version} · {license}
          </span>
          <HonestyBadge estado="SIM" confidence={null} showConfidence={false} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <div className="lg:col-span-5 rounded-lg border border-cyan-900/50 bg-gray-950/50 px-3 py-2 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-[.14em] uppercase text-cyan-400/80">
              Señal activa · {ACTIVE_SIGNAL.id}
            </span>
            {S35 && <HonestyBadge estado={S35.estado} confidence={S35.confianza} showConfidence={false} />}
          </div>
          <div className="font-mono text-lg text-cyan-300 leading-tight">{ACTIVE_SIGNAL.expr}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] font-mono text-gray-400">
            <span>fs {ACTIVE_SIGNAL.fs} Hz</span>
            <span>N {ACTIVE_SIGNAL.N}</span>
            <span>clase {ACTIVE_SIGNAL.clase}</span>
            <span>dominio {ACTIVE_SIGNAL.dominio}</span>
          </div>
          <div className="text-[9px] text-gray-600 mt-0.5">
            escenario SIM por defecto (no vivo)
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-lg border border-gray-800 bg-gray-950/40 px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-[.14em] uppercase text-gray-400">
                Estado del motor
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                jsxgraph {version} · {license}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {ENGINE_STATES.map((s) => {
                const active = engine === s;
                const color = engineColor(s);
                return (
                  <span key={s} className="flex items-center gap-1 text-[11px] font-mono">
                    <span style={{ color: active ? color : '#374151' }}>{active ? '●' : '○'}</span>
                    <span style={{ color: active ? color : '#4b5563' }}>{s}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-950/40 px-3 py-2">
            <div className="text-[10px] font-bold tracking-[.14em] uppercase text-gray-400 mb-1">
              Workspace
            </div>
            <div className="flex items-center gap-3">
              {WORKSPACE_ROWS.map((r) => (
                <span key={r} className="flex items-center gap-1 text-[11px]">
                  <span className="font-mono text-gray-400">{r}</span>
                  <span className="font-mono text-[9px] text-amber-400">PREPARADO</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] font-bold tracking-[.14em] uppercase text-gray-500 mr-1">
          Capacidades
        </span>
        {CAPABILITIES.map((c) => (
          <span
            key={c.label}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono"
            style={{ borderColor: `${CAP_COLOR[c.estado]}55`, color: CAP_COLOR[c.estado] }}
          >
            {c.label}
            <span className="opacity-70">·{c.estado}</span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] font-bold tracking-[.14em] uppercase text-gray-500 mr-1">
          Destinos
        </span>
        {DESTINOS.map((d) =>
          d.to ? (
            <Link
              key={d.label}
              to={d.to}
              className="px-2 py-0.5 rounded text-[10px] border border-gray-700 bg-gray-900/60 text-gray-300 hover:border-cyan-600 hover:text-cyan-300 transition-colors"
            >
              {d.label} →
            </Link>
          ) : (
            <span
              key={d.label}
              title="La vista FFT es una celda del dashboard, no una ruta"
              className="px-2 py-0.5 rounded text-[10px] border border-gray-800 bg-gray-900/30"
              style={{ color: honestyMeta(d.estado).color, borderColor: '#1f2937' }}
            >
              {d.label} · {d.estado}
            </span>
          )
        )}
        <Link
          to="/advanced-math-v2"
          className="ml-auto px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors"
          style={{ borderColor: '#00FFFF99', color: '#00FFFF', backgroundColor: 'rgba(0,255,255,0.08)' }}
        >
          Abrir Workbench →
        </Link>
      </div>
    </section>
  );
};

export default MmcHero;
