import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';
import { SIGNAL_CATALOG } from './signalCatalog.js';
import { IntegralsInteractive, EigenvaluesInteractive, DiffEqInteractive, SignalsInteractive } from '../../labs/AdvancedMathLabV2.jsx';

const S35 = SIGNAL_CATALOG.find((s) => s.signal_id === 'S35');

// Ficha de cada instrumento. Todo el copy es verificable contra el código de
// AdvancedMathLabV2.jsx: los valores de referencia corresponden a los valores
// iniciales de los controles (ver useState). Ningún dato es inventado.
const MODULES = {
  calculo: {
    code: 'M01',
    label: 'Modelado numérico',
    icon: '∫',
    sistema: 'Integración numérica de una función',
    ecuacion: 'F(x) = ∫ₐᵇ f(x) dx',
    ecuacion2: 'f(x) = amp · sin(ω x)',
    params: ['Función f(x)', 'Amplitud', 'Frecuencia ω', 'Límite a', 'Límite b', 'N pasos'],
    resultado: 'área calculada · derivada',
    referencia: 'Referencia inicial: ∫₀^π sin(x) dx = 2 · trapezoid con N = 200',
    senalTipo: 'CONTINUA',
    senalDesc: 'Integral de f(x): curva suave, base para filtros paso bajo.',
    emiteSenal: true
  },
  algebra: {
    code: 'M02',
    label: 'Álgebra y geometría',
    icon: 'λ',
    sistema: 'Modelo lineal 2×2',
    ecuacion: 'det(A − λI) = 0',
    ecuacion2: 'A = [ a b ; c d ]',
    params: ['Matriz A', 'Elementos a, b, c, d'],
    resultado: 'eigenvalores · estabilidad',
    referencia: 'Referencia inicial: A = identidad → λ = 1 doble, sistema no amortiguado.',
    senalTipo: 'SIN SEÑAL',
    senalDesc: 'Modelo algebraico: no emite señal. Habilita el criterio de resonancia frente a M01.',
    emiteSenal: false
  },
  simulacion: {
    code: 'M03',
    label: 'Optimización',
    icon: '∂',
    sistema: 'EDO lineal de primer orden',
    ecuacion: 'dy/dx + y = eˣ',
    ecuacion2: 'solución general: y = (x/2 + 1) eˣ + C e⁻ˣ',
    params: ['Condición inicial y(0)', 'Rango x'],
    resultado: 'solución numérica · ciclo límite',
    referencia: 'Referencia inicial: y(0) = 1 sobre x ∈ [0, 5].',
    senalTipo: 'TRAZEDIA',
    senalDesc: 'Recorrido V vs dV/dt: dinámica de un sistema en el espacio de fases.',
    emiteSenal: true
  },
  senales: {
    code: 'M04',
    label: 'Análisis de señales',
    icon: 'ℱ',
    sistema: 'Generador de señales de prueba moduladas',
    ecuacion: 'y(t) = a₁ sin(f₁t) + a₃ sin(f₃t)',
    ecuacion2: 's(t) = (1 + m·cos(2πf_m t)) · cos(2πf_c t)',
    params: ['f₁, f₃', 'a₁, a₃', 'f_c portadora', 'f_m mensaje', 'm profundidad'],
    resultado: 'espectro · portadora + bandas',
    referencia: 'Referencia inicial: 2 tonos en 1 y 3 Hz · portadora 10 Hz · mensaje 1 Hz · m = 0.7',
    senalTipo: 'AM',
    senalDesc: 'Suma de 2 sinusoides modulada en AM, con demodulación por rectificación y filtro.',
    emiteSenal: true
  }
};

const TABS = Object.entries(MODULES).map(([id, m]) => ({
  id,
  code: m.code,
  label: m.label,
  icon: m.icon,
  ...m
}));

// Destinos con ruta real = botones funcionales. Sin ruta = bloque con estado honesto.
const DESTINOS = [
  { label: 'Electrónica', to: '/lab-electronics', estado: 'REAL' },
  { label: 'Telecom', to: '/lab-telecom', estado: 'REAL-LOCAL' },
  { label: 'IA', to: '/ai-predictive', estado: 'REAL' },
  { label: 'KH', to: '/knowledge', estado: 'REAL' },
  { label: 'Espectral', to: null, estado: 'DISENO' }
];

const SENALES_PENDIENTES = ['FM', 'Ruido', 'Impulso', 'Escalón'];

const CADENA = ['Teoría', 'Simulación', 'Implementación', 'Medición real', 'Conocimiento'];

const MathModelingCell = () => {
  const [tab, setTab] = useState('calculo');
  // Incrementa para remontar el instrumento y devolver los controles a su estado inicial.
  const [run, setRun] = useState(0);
  const active = MODULES[tab];
  const labRef = useRef(null);
  const [stats, setStats] = useState({ graficas: 0, controles: 0, alto: 0, visible: 0 });
  const [lectura, setLectura] = useState([]);

  // Display de instrumento: lee los valores REALES del control montado.
  // No hay cifras escritas a mano. El MutationObserver hace que el readout
  // siga vivo cuando el usuario mueve un slider dentro del instrumento.
  useEffect(() => {
    const el = labRef.current;
    if (!el) return;

    let frame = 0;
    // El display es un panel de instrumentos, no un volcado de texto: 5 valores,
    // numeros redondeados y nada de parrafos ni enlaces de referencia.
    const fmt = (s) =>
      s
        .replace(/[-+]?\d+\.\d{4,}/g, (n) => String(Number(Number(n).toFixed(2))))
        .replace(/\s+/g, ' ')
        .trim();
    const leer = () => {
      const ctrls = [...el.querySelectorAll('.ctrl')].filter((c) => {
        if (c.querySelector('a')) return false;
        const t = c.textContent;
        return t.length <= 60 && !/Wolfram|MATLAB|SciPy|Recursos/i.test(t);
      });
      const filas = ctrls.map((c) => {
        const k = c.querySelector('label')?.textContent.trim() || '';
        const rango = c.querySelector('input[type=range]');
        const sel = c.querySelector('select');
        const num = c.querySelector('input[type=number]');
        let v = '';
        if (rango) v = rango.value;
        else if (sel) v = sel.selectedOptions[0]?.textContent.trim() || '';
        else if (num) v = num.value;
        else v = c.textContent.replace(k, '').trim();
        return { k, v: fmt(v) };
      }).filter((f) => f.v && f.v.length <= 24).slice(0, 5);
      return filas;
    };
    const read = () => {
      setLectura(leer());
      setStats({
        graficas: el.querySelectorAll('svg').length,
        controles: el.querySelectorAll('input, select').length,
        alto: el.scrollHeight,
        visible: el.parentElement ? el.parentElement.clientHeight : 0
      });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(read);
    };

    read();
    const obs = new MutationObserver(schedule);
    obs.observe(el, { subtree: true, childList: true, characterData: true, attributes: true });
    return () => {
      obs.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [tab, run]);

  return (
    <section className="@container rounded-xl border border-gray-800 bg-gray-900/40 p-3 flex flex-col gap-2">
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
        /* dentro de la celda el titulo y las etiquetas del laboratorio sobran:
           la ecuacion ya esta en la barra y la senal/destino en sus zonas */
        .cmsc-mathlab .mmc-tag { display:none; }
        .cmsc-mathlab .interactive-section > h3 { font-size:10px !important; font-weight:600 !important; letter-spacing:.1em; text-transform:uppercase; color:#0e7490 !important; margin:0 0 4px; }
        .mmc-zone { border:1px solid #1f2937; border-radius:8px; padding:6px 8px; background:#0b0f14; }
        .mmc-zone-h { font-size:8px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#6b7280; margin-bottom:3px; }
        .mmc-eqbar { border:1px solid #00ffff33; border-radius:8px; padding:5px 8px; background:rgba(0,255,255,.04); }
        .mmc-eqbar-l { display:block; font-size:8px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#0e7490; margin-bottom:1px; }
        .mmc-readout { display:flex; flex-wrap:nowrap; gap:6px; overflow:hidden; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:9px; line-height:1.1; }
        .mmc-readout-i { white-space:nowrap; }
        .mmc-readout-k { color:#4b5563; }
        .mmc-readout-v { color:#22d3ee; }
        .mmc-act { display:inline-flex; align-items:center; justify-content:center; width:18px; height:16px; font-size:10px; line-height:1; border:1px solid #164e63; border-radius:4px; color:#67e8f9; background:rgba(8,145,178,.12); }
        .mmc-act:hover { background:rgba(8,145,178,.3); }
        .mmc-eq { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px; font-weight:600; color:#00ffff; letter-spacing:.01em; word-break:break-word; }
        .mmc-eq-alt { font-size:10px; color:#7dd3fc; opacity:.75; }
        .mmc-console { border:1px solid #00ffff33; border-radius:10px; overflow:hidden; }
        .mmc-console-h { display:flex; align-items:center; justify-content:space-between; gap:6px; padding:4px 8px; background:rgba(0,255,255,.06); border-bottom:1px solid #00ffff22; }
        .mmc-cap summary { cursor:pointer; font-size:9px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#6b7280; list-style:none; }
        .mmc-cap summary::-webkit-details-marker { display:none; }
        .mmc-flash { animation:mmcFlash .9s ease-out; }
        @keyframes mmcFlash { 0%{ border-color:#00ffff; box-shadow:0 0 0 2px rgba(0,255,255,.35);} 100%{ border-color:#1f2937; box-shadow:none; } }
      `}</style>

      {/* identidad: una sola línea, sin explicación */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold tracking-[.1em] uppercase text-gray-300">
          Motor de Modelado Científico <span className="text-cyan-700 font-mono">S35</span>
        </h3>
        {S35 && <HonestyBadge estado={S35.estado} confidence={S35.confianza} showConfidence={false} />}
      </div>

      {/* A · Módulos (prioridad visual 1) */}
      <div className="grid grid-cols-2 @2xl:grid-cols-4 gap-1">
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
            <span className="block leading-tight">
              {t.icon} {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* B · Modelo + ecuación: 2 líneas, sin párrafos */}
      <div className="mmc-eqbar">
        <span className="mmc-eqbar-l">
          {active.code} · {active.sistema}
        </span>
        <span className="mmc-eq">
          {active.ecuacion}
          <span className="mmc-eq-alt"> · {active.ecuacion2}</span>
        </span>
      </div>

      {/* C+D+F · Display + gráfica */}
      <div className="mmc-console">
        <div className="mmc-console-h">
          <span className="text-[9px] font-bold tracking-[.14em] uppercase text-cyan-300">● En vivo</span>
          <span className="mmc-readout">
            {lectura.length === 0 ? (
              <span className="text-cyan-900">—</span>
            ) : (
              lectura.map((f, i) => (
                <span key={f.k + i} className="mmc-readout-i">
                  {!f.v.startsWith(f.k) && <span className="mmc-readout-k">{f.k} </span>}
                  <span className="mmc-readout-v">{f.v}</span>
                </span>
              ))
            )}
          </span>
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setRun((r) => r + 1)}
              title="Devuelve los controles a su valor inicial"
              className="mmc-act"
            >
              ↻
            </button>
            <a href="#mmc-senal" title="Ir a la señal producida" className="mmc-act">
              ↓
            </a>
          </div>
        </div>
        <div className="max-h-[560px] overflow-y-auto p-2">
          <div className="cmsc-mathlab" ref={labRef}>
            {tab === 'calculo' && <IntegralsInteractive key={`${tab}-${run}`} />}
            {tab === 'algebra' && <EigenvaluesInteractive key={`${tab}-${run}`} />}
            {tab === 'simulacion' && <DiffEqInteractive key={`${tab}-${run}`} />}
            {tab === 'senales' && <SignalsInteractive key={`${tab}-${run}`} />}
          </div>
        </div>
        {stats.alto > stats.visible && (
          <div className="px-2 py-1 text-[9px] text-cyan-700 border-t border-cyan-900/40">
            ↓ {stats.graficas} gráficas · {Math.round(stats.alto / 100) * 100}px de trazado
          </div>
        )}
      </div>

      {/* E+G · Resultado y señal en una sola banda */}
      <div className="grid grid-cols-2 gap-1" id="mmc-senal">
        <div className="mmc-zone">
          <div className="mmc-zone-h">Resultado</div>
          <div className="text-[10px] text-cyan-300 leading-tight">{active.resultado}</div>
        </div>
        <div className="mmc-zone">
          <div className="mmc-zone-h">Señal producida</div>
          <div
            className="text-[11px] font-bold font-mono leading-tight"
            style={{ color: active.emiteSenal ? '#00ffff' : '#6b7280' }}
          >
            {active.senalTipo}
          </div>
          <div className="text-[8px] text-gray-600 leading-tight mt-0.5">
            no impl.: {SENALES_PENDIENTES.join(' · ')}
          </div>
        </div>
      </div>

      {/* Destinos como botones (rutas reales = funcionales) */}
      <div className="mmc-zone">
        <div className="mmc-zone-h">Destinos</div>
        <div className="flex flex-wrap gap-1">
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
                title="La vista Espectral es una celda del dashboard, no una ruta: sin enlace directo"
                className="px-2 py-0.5 rounded text-[10px] border border-gray-800 bg-gray-900/30 text-gray-600"
              >
                {d.label} · {d.estado}
              </span>
            )
          )}
        </div>
      </div>

      {/* Capacidades del MMC: los 3 bloques narrativos, compactados y plegables */}
      <details className="mmc-cap mmc-zone">
        <summary>Capacidades del MMC</summary>
        <div className="mt-1.5 space-y-1.5 text-[10px] text-gray-400">
          <div className="text-gray-500">
            <span className="uppercase tracking-wider">Referencia analítica</span> · {active.referencia}
          </div>
          <div>
            <span className="text-gray-500 uppercase tracking-wider">Produce</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {['modelos matemáticos', 'señales sintéticas', 'simulaciones numéricas', 'señales de prueba', 'escenarios experimentales', 'transformaciones analíticas', 'validaciones teóricas'].map((o) => (
                <span key={o} className="px-1.5 py-0.5 rounded border border-cyan-900/60 bg-cyan-950/30 text-cyan-300">
                  {o}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-gray-500 uppercase tracking-wider">Cadena</span>
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              {CADENA.map((c, i) => (
                <React.Fragment key={c}>
                  {i > 0 && <span className="text-gray-600">→</span>}
                  <span className="px-1.5 py-0.5 rounded bg-gray-900/70 border border-gray-800 text-gray-300">{c}</span>
                </React.Fragment>
              ))}
            </div>
            <div className="mt-1 text-gray-500">
              La teoría no siempre coincide con el comportamiento físico real. Por eso el MMC existe.
            </div>
          </div>
          <div className="border-t border-gray-800 pt-1.5 text-gray-400">
            Instrumento S35 · <span style={{ color: '#FFB300' }}>SIM</span>: modelos matemáticos,
            simulaciones controladas y señales sintéticas que alimentan el ecosistema CMSC, permitiendo validar
            diferencias entre teoría, simulación y comportamiento real.
          </div>
        </div>
      </details>

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
