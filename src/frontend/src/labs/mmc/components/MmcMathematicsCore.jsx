import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../theme/mmcWorkbench.css';
import MmcJsxGraphBoard from './MmcJsxGraphBoard.jsx';
import MmcEquation from './MmcEquation.jsx';
import DockToolbar from './DockToolbar.jsx';
import DockPanel from './DockPanel.jsx';
import {
  ENGINE_ID,
  describeSeries,
  engineVersion,
  plotFunctionCurve,
  sampleFunctionUniform
} from '../adapters/jsxgraphAdapter.js';
import { VISUAL_ENGINE } from '../engines.js';
import { compileEquation, equationToTex } from '../parse/equationParser.js';
import { MODEL_ESTADO, MODEL_INTEGRATION_POINTS, buildWorkspaceModel } from '../workspace/modelContract.js';

// MMC — Núcleo matemático visual: el pilar del laboratorio.
//
// REGLA FUNDAMENTAL QUE IMPLEMENTA: el estudiante modela SIN PROGRAMAR. Escribe
// una ecuación, mueve deslizadores, ve la curva y la serie. Pyodide queda como
// motor computacional para el CAS futuro; aquí no se escribe Python.
//
// SEPARACIÓN DE PODERES:
//   1. equationParser traduce texto a función numérica. Sin motor gráfico.
//   · jsxgraphAdapter dibuja y muestrea. Sin interpretar texto.
//   · React + KaTeX  son dueños del texto. JSXGraph es dueño de la geometría.
//
// ESTADO HONESTO: todo lo que produce este panel es SIMULACIÓN. Se etiqueta
// junto al valor, nunca se disimula. La serie `time[]/values[]` se calcula en
// rejilla uniforme con fs explícito, nunca leyendo los puntos adaptativos que el
// motor usa para dibujar: esos sirven para el dibujo, no para la ciencia.

const DEFAULT_EXPRESSION = 'y(t)=2*sin(2*pi*100*t)';

// Parametrización equivalente al escenario por defecto. Es la misma ecuación con
// los literales promovidos a parámetros deslizantes: 2 -> A, 100 -> f.
const PARAMETRIC_EXPRESSION = 'y(t)=A*sin(2*pi*f*t)+offset';

// Deslizadores del instrumento. `unit` solo es informativo.
const PARAM_DEFS = [
  { name: 'A', label: 'Amplitud A', min: 0, max: 5, step: 0.1, value: 2, unit: '' },
  { name: 'f', label: 'Frecuencia f', min: 1, max: 500, step: 1, value: 100, unit: 'Hz' },
  { name: 'offset', label: 'Desplazamiento', min: -2, max: 2, step: 0.05, value: 0, unit: '' }
];

// Capacidades declaradas. Las que no están implementadas lo dicen: es preferible
// un `preparado` explícito que un botón que no hace nada.
const CAPACIDADES = [
  { id: 'funciones', label: 'Funciones', estado: 'OPERACIONAL' },
  { id: 'senales', label: 'Señales', estado: 'OPERACIONAL' },
  { id: 'matrices', label: 'Matrices', estado: 'PREPARADO' },
  { id: 'geometria', label: 'Geometría', estado: 'PREPARADO' },
  { id: 'sistemas', label: 'Sistemas', estado: 'PREPARADO' },
  { id: 'exportar', label: 'Exportar', estado: 'OPERACIONAL' }
];

const formatTime = (s) => (Math.abs(s) >= 1 ? s.toFixed(3) : s.toFixed(6));

/**
 * Alto nominal del plot. Es un valor de reserva, no el que manda: el CSS lo
 * sobrescribe con `clamp(340px, 52vh, 760px)` para que el gráfico crezca con la
 * ventana. Se pasa igual porque el componente del tablero necesita una altura
 * numérica para dimensionar su host antes de que CSS aplique.
 */
const PLOT_HEIGHT = 460;

const MmcMathematicsCore = () => {
  const [expression, setExpression] = useState(DEFAULT_EXPRESSION);
  const [params, setParams] = useState(() =>
    PARAM_DEFS.reduce((acc, p) => ({ ...acc, [p.name]: p.value }), {})
  );
  const [t0, setT0] = useState(0);
  const [t1, setT1] = useState(0.02);
  const [fs, setFs] = useState(2000);
  const [engineState, setEngineState] = useState('CARGANDO');
  const [activeTab, setActiveTab] = useState('2d');
  const inputRef = useRef(null);
  const curveRef = useRef(null);

  // Compilación: única fuente de verdad de la función. Si el parser falla, el
  // error se muestra y NO se dibuja nada: preferimos un hueco honesto a una
  // curva que no corresponde con lo escrito.
  const compiled = useMemo(() => {
    try {
      const out = compileEquation(expression, params);
      return { ok: true, fn: out.fn, free: out.free, tex: equationToTex(expression), error: null };
    } catch (err) {
      return { ok: false, fn: null, free: [], tex: null, error: err.message };
    }
  }, [expression, params]);

  // Muestreo en rejilla uniforme. Es el registro científico: fs explícito,
  // tiempo t0 + i/fs. Se recalcula solo; no depende del tablero.
  const series = useMemo(() => {
    if (!compiled.ok) return null;
    return sampleFunctionUniform(compiled.fn, { fs, t0, t1 });
  }, [compiled, fs, t0, t1]);

  const stats = useMemo(() => (series ? describeSeries(series) : null), [series]);

  // Encuadre: se deriva de los datos muestreados, no de constantes mágicas.
  // El eje Y se adapta al rango real de la señal, sin recortar nunca.
  const boundingbox = useMemo(() => {
    if (!stats || !Number.isFinite(stats.min) || !Number.isFinite(stats.max)) {
      return [t0, 3, t1, -3];
    }
    const span = Math.max(stats.max - stats.min, 1e-6);
    const pad = span * 0.15;
    const yMin = stats.min - pad;
    const yMax = stats.max + pad;
    return [t0, yMax, t1, yMin];
  }, [stats, t0, t1]);

  // Parámetros que la ecuación realmente usa. Distingue "declarado" de "usado":
  // un literal 100 no se puede deslizar, y decirlo evita la falsa impresión de
  // que el deslizador de frecuencia está vinculado al modelo.
  const activeParams = useMemo(() => {
    if (!compiled.ok) return [];
    const used = new Set(compiled.free);
    return PARAM_DEFS.filter((p) => used.has(p.name)).map((p) => p.name);
  }, [compiled]);

  // Envelope de workspace.model. Se construye para que el contrato quede visible
  // y probado, pero NO se escribe en ningún store, registro ni destino: eso es
  // una fase posterior con su propia misión.
  const workspaceModel = useMemo(() => {
    if (!compiled.ok || !series) return null;
    return buildWorkspaceModel({
      id: `mmc-model-${Date.now()}`,
      kind: 'numeric-plot',
      label: 'Modelo del núcleo matemático',
      expression,
      parameters: params,
      domain: { t0, t1, fs },
      implementation: {
        engine: ENGINE_ID,
        version: engineVersion(),
        adapter: VISUAL_ENGINE?.adapter ?? null,
        license: VISUAL_ENGINE?.licenseBranch ?? null
      },
      signal: series,
      estado: MODEL_ESTADO.SIM,
      clase_senal: 'GENERADA',
      dominio: 'matematico',
      confianza: series.finite ? 1 : 0.5,
      metadata: {
        producedBy: 'MmcMathematicsCore',
        provenance: 'ecuación escrita por el usuario, vía parser MMC, hacia adapter JSXGraph'
      }
    });
  }, [compiled, series, expression, params, t0, t1, fs]);

  // El rebuild necesita la función vigente sin capturarla en el deps del board.
  const modelRef = useRef(null);
  modelRef.current = { compiled, boundingbox, t0, t1 };

  const buildBoard = useCallback((board, ctx) => {
    const { compiled: c, boundingbox: bbox } = modelRef.current;
    if (!c.ok) return;
    board.setBoundingBox(bbox, false);
    curveRef.current = plotFunctionCurve(board, c.fn, {
      t0: modelRef.current.t0,
      t1: modelRef.current.t1,
      color: ctx.theme.cyan,
      name: null
    });
  }, []);

  const rebuildBoard = useCallback((board, ctx) => {
    const { compiled: c, boundingbox: bbox } = modelRef.current;
    if (!c.ok) return;
    // Eliminar TODOS los objetos del tablero antes de redibujar.
    // `removeObject` puede fallar si el objeto ya fue eliminado o si hay
    // referencias cruzadas. La forma más segura es eliminar todo.
    try {
      const objects = board.objectsList || [];
      for (let i = objects.length - 1; i >= 0; i--) {
        try { board.removeObject(objects[i]); } catch (e) { /* ya eliminado */ }
      }
    } catch (e) { /* board vacío */ }
    curveRef.current = null;
    board.setBoundingBox(bbox, false);
    curveRef.current = plotFunctionCurve(board, c.fn, {
      t0: modelRef.current.t0,
      t1: modelRef.current.t1,
      color: ctx.theme.cyan,
      name: null
    });
  }, []);

  // Al desmontar el instrumento, el board se libera en el propio board bridge.
  // Aquí solo se suelta la referencia a la curva para no retenerla.
  useEffect(() => () => {
    curveRef.current = null;
  }, []);

  const rebuildKey = `${expression}|${JSON.stringify(params)}|${t0}|${t1}|${fs}`;

  const insertParam = (name) => {
    const el = inputRef.current;
    if (!el) return;
    const token = name;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = `${el.value.slice(0, start)}${token}${el.value.slice(end)}`;
    setExpression(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + token.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const exportCsv = () => {
    if (!series) return;
    const rows = ['index,time_s,value'];
    for (let i = 0; i < series.sampleCount; i += 1) {
      rows.push(`${i},${series.time[i]},${series.values[i]}`);
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mmc_modelo.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const samplesPerPeriod = useMemo(() => {
    if (!activeParams.includes('f') || !params.f) return null;
    return params.f > 0 ? fs / params.f : null;
  }, [activeParams, params.f, fs]);

  const statusChip = () => {
    if (engineState === 'ROTO') return <span className="mmc-wb-status-roto">ROTO</span>;
    if (engineState === 'LISTO') return <span className="mmc-wb-status-ok">motor listo</span>;
    return <span className="mmc-wb-status-load">cargando motor</span>;
  };

return (
    <div className="mmc-workbench">
      {/* ---------- Estado del motor: una línea, sin marco ---------- */}
      <div className="mmc-wb-status">
        <span className="mmc-wb-status-id">M00 · Núcleo matemático</span>
        {statusChip()}
        <span className="mmc-wb-status-sim">SIM · simulación</span>
        <span className="mmc-wb-status-meta">jsxgraph {engineVersion()}</span>
        <span className="mmc-wb-status-meta">{VISUAL_ENGINE?.licenseBranch ?? 'MIT'}</span>
        <span className="mmc-wb-status-count">
          {CAPACIDADES.filter((c) => c.estado === 'OPERACIONAL').length}/{CAPACIDADES.length} capacidades
        </span>
      </div>

      {/*
        Dos columnas y una sola regla: el raíl instrumenta, el escenario dibuja.

        En escritorio el reparto es 24% / 76%. Antes el workbench apilaba
        ecuación, gráfica y controles en una columna, de modo que la curva
        quedaba comprimida en el ancho de un texto y había que desplazarse
        para verla. Con la gráfica en su propia columna, el grafo es lo primero
        que se ve al llegar y los controles quedan a la vista, al lado, sin
       _scroll.

        Por debajo de 980 px el raíl colapsa a una columna: a ese ancho un 24%
        son menos de 240 px y los deslizadores dejan de poder manipularse. Ese
        mismo umbral protege la celda del CMSC, que anda por los 406 px.
      */}
      <div className="mmc-wb-body">
        <div className="mmc-wb-rail">
      <div className="mmc-wb-equation">
        <input
          ref={inputRef}
          className={`mmc-wb-input${compiled.ok ? '' : ' mmc-wb-input-bad'}`}
          value={expression}
          spellCheck={false}
          autoComplete="off"
          aria-label="Ecuación matemática"
          onChange={(e) => setExpression(e.target.value)}
        />
        {compiled.ok ? (
          <MmcEquation tex={compiled.tex} ariaLabel="Ecuación renderizada" />
        ) : (
          <span className="mmc-wb-msg mmc-wb-msg-bad">{compiled.error}</span>
        )}
      </div>

      {/* ---------- Instrumentación: raíl izquierdo, 24% en escritorio ---------- */}
      <div className="mmc-wb-controls">
        {PARAM_DEFS.map((p) => (
          <div className="mmc-wb-ctrl" key={p.name}>
            <label htmlFor={`mmc-param-${p.name}`}>
              {p.label}
              {activeParams.includes(p.name) ? ' (activo)' : ''}
            </label>
            <span className="mmc-wb-ctrl-val">
              {params[p.name]}
              {p.unit}
            </span>
            <input
              id={`mmc-param-${p.name}`}
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={params[p.name]}
              onChange={(e) => setParams((prev) => ({ ...prev, [p.name]: Number(e.target.value) }))}
            />
          </div>
        ))}
        <div className="mmc-wb-ctrl">
          <label htmlFor="mmc-t0">t0 · inicio</label>
          <input id="mmc-t0" type="number" step="0.001" value={t0} onChange={(e) => setT0(Number(e.target.value))} />
        </div>
        <div className="mmc-wb-ctrl">
          <label htmlFor="mmc-t1">t1 · fin</label>
          <input id="mmc-t1" type="number" step="0.001" value={t1} onChange={(e) => setT1(Number(e.target.value))} />
        </div>
        <div className="mmc-wb-ctrl">
          <label htmlFor="mmc-fs">fs</label>
          <span className="mmc-wb-ctrl-val">N={series ? series.sampleCount : '--'}</span>
          <input
            id="mmc-fs"
            type="number"
            step="100"
            min="2"
            value={fs}
            onChange={(e) => setFs(Math.max(2, Number(e.target.value)))}
          />
        </div>
      </div>

      <div className="mmc-wb-actions">
        <button type="button" className="mmc-wb-btn" onClick={() => setExpression(PARAMETRIC_EXPRESSION)}>
          parametrizar
        </button>
        <button type="button" className="mmc-wb-btn" onClick={() => setExpression(DEFAULT_EXPRESSION)}>
          escenario base
        </button>
        <button type="button" className="mmc-wb-btn" onClick={exportCsv} disabled={!series}>
          exportar csv
        </button>
        <span style={{ flex: '1 1 12px' }} />
        {PARAM_DEFS.map((p) => (
          <button key={p.name} type="button" className="mmc-wb-btn" onClick={() => insertParam(p.name)}>
            +{p.name}
          </button>
        ))}
      </div>

      <DockToolbar active={activeTab} onSelect={setActiveTab} />
      <DockPanel
        activeTab={activeTab}
        workspaceModel={workspaceModel}
        workspaceSignal={series}
        stats={stats}
      />
        </div>

        {/* ---------- El escenario: 76% del ancho, aquí vive la gráfica ---------- */}
        <div className="mmc-wb-stage">
      <div className="mmc-wb-plot">
        {compiled.ok ? (
          <MmcJsxGraphBoard
            build={buildBoard}
            rebuild={rebuildBoard}
            rebuildKey={rebuildKey}
            boundingbox={boundingbox}
            height={PLOT_HEIGHT}
            ariaLabel="Curva de la ecuación modelada"
            onReady={({ estado }) => setEngineState(estado === 'ROTO' ? 'ROTO' : 'LISTO')}
          />
        ) : (
          <div className="mmc-board-fail" style={{ height: PLOT_HEIGHT }}>
            <strong>ECUACIÓN NO VÁLIDA</strong>
            <span>No se dibuja nada mientras la expresión no compile.</span>
          </div>
        )}
      </div>

      {/* ---------- Lecturas: columnas de texto ---------- */}
      {series ? (
        <>
          <div className="mmc-wb-series">
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">muestras</span>
              <span className="mmc-wb-metric-v">{series.sampleCount}</span>
            </div>
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">fs</span>
              <span className="mmc-wb-metric-v">{series.fs} Hz</span>
            </div>
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">min</span>
              <span className="mmc-wb-metric-v">{Number.isFinite(stats.min) ? stats.min.toFixed(3) : '--'}</span>
            </div>
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">max</span>
              <span className="mmc-wb-metric-v">{Number.isFinite(stats.max) ? stats.max.toFixed(3) : '--'}</span>
            </div>
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">Vpp</span>
              <span className="mmc-wb-metric-v">{Number.isFinite(stats.peakToPeak) ? stats.peakToPeak.toFixed(3) : '--'}</span>
            </div>
            <div className="mmc-wb-metric">
              <span className="mmc-wb-metric-k">finita</span>
              <span className="mmc-wb-metric-v">{series.finite ? 'sí' : 'NO'}</span>
            </div>
          </div>

          <details className="mmc-wb-details">
            <summary>time[] / values[]</summary>
            <pre className="mmc-wb-peek">
              {`i      time[s]     value\n` +
                Array.from({ length: Math.min(12, series.sampleCount) }, (_, i) =>
                  `${String(i).padEnd(4)} ${formatTime(series.time[i]).padEnd(12)} ${series.values[i].toFixed(6)}`
                ).join('\n') +
                (series.sampleCount > 12 ? `\n(+${series.sampleCount - 12} muestras más)` : '')}
            </pre>
          </details>

          {workspaceModel && (
            <details className="mmc-wb-details">
              <summary>workspace.model</summary>
              <pre className="mmc-wb-peek">
                {`// workspace.model — PREPARADO, NO CONECTADO\n` +
                  `estado      : ${workspaceModel.estado}\n` +
                  `clase_senal : ${workspaceModel.clase_senal}\n` +
                  `confianza   : ${workspaceModel.confianza}\n` +
                  `dominio     : ${workspaceModel.domain ? JSON.stringify(workspaceModel.domain) : '--'}\n` +
                  `engine      : ${workspaceModel.implementation.engine} ${workspaceModel.implementation.version}\n` +
                  `licencia    : ${workspaceModel.implementation.license}\n` +
                  `signal.time : Float64Array(${workspaceModel.signal?.time?.length ?? 0})\n` +
                  `signal.vals : Float64Array(${workspaceModel.signal?.values?.length ?? 0})`}
              </pre>
            </details>
          )}
        </>
      ) : (
        <div className="mmc-wb-msg mmc-wb-msg-info">Sin serie: la ecuación no compila.</div>
      )}
        </div>
      </div>

      {/* ---------- Honestidad: una línea al pie ---------- */}
      <div className="mmc-wb-honest">
        <div>
          <b>SIM</b> · simulación · <code>time[]</code>/<code>values[]</code> en rejilla uniforme con <code>fs</code> explícito
          {samplesPerPeriod ? ` · ${samplesPerPeriod.toFixed(1)} muestras/periodo a ${params.f} Hz` : ''}
        </div>
        <details style={{ marginTop: 2 }}>
          <summary style={{ cursor: 'pointer', fontSize: 10, color: '#475569' }}>
            capacidades {CAPACIDADES.filter((c) => c.estado === 'OPERACIONAL').length}/{CAPACIDADES.length} · integración
          </summary>
          <div style={{ marginTop: 4, display: 'grid', gap: 2 }}>
            {CAPACIDADES.map((c) => (
              <div key={c.id} style={{ fontSize: 10, color: '#475569' }}>
                {c.label} · {c.estado === 'OPERACIONAL' ? 'ok' : 'preparado'}
              </div>
            ))}
            {MODEL_INTEGRATION_POINTS.map((p) => (
              <div key={p.id} style={{ fontSize: 10, color: '#374151' }}>
                {p.destino} · {p.estado}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default MmcMathematicsCore;
