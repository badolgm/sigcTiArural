import React, { useMemo } from 'react';
import { MODEL_ESTADO } from '../workspace/modelContract.js';

const fmt = (n, digits = 3) => {
  if (n === null || n === undefined || !Number.isFinite(n)) return '--';
  return Number(n).toFixed(digits);
};

const Row = ({ k, v, mono }) => (
  <div className="mmc-dock-row">
    <span className="mmc-dock-k">{k}</span>
    <span className={'mmc-dock-v ' + (mono ? 'mmc-dock-v-mono' : '')}>{v}</span>
  </div>
);

const ChipEstado = ({ estado }) => {
  const cls =
    estado === MODEL_ESTADO.SIM || estado === 'SIM'
      ? 'mmc-dock-chip mmc-dock-chip-sim'
      : estado === MODEL_ESTADO.REAL || estado === 'REAL'
      ? 'mmc-dock-chip mmc-dock-chip-real'
      : estado === 'DISENO'
      ? 'mmc-dock-chip mmc-dock-chip-diseno'
      : estado === 'PREPARADO' || estado === 'PARCIAL'
      ? 'mmc-dock-chip mmc-dock-chip-prep'
      : 'mmc-dock-chip';
  return <span className={cls}>{estado}</span>;
};

const DockPanel2D = () => (
  <div className="mmc-dock-panel">
    <div className="mmc-dock-ph mmc-dock-ph-2d">
      2D · Stage principal
      <ChipEstado estado={MODEL_ESTADO.SIM} />
    </div>
    <div className="mmc-dock-banner mmc-dock-banner-ok">
      Esta es la vista dominante. El Stage ocupa el 76% del ancho en escritorio.
    </div>
    <Row k="Gráfica" v="JSXGraph 1.13.3 · setBoundingBox(false)" mono />
    <Row k="Alto" v="clamp(340px, 52vh, 760px)" mono />
    <Row k="Autoescalado" v="activo · 15% padding Y" mono />
    <Row k="Muestreo" v="rejilla uniforme · fs explícito" mono />
    <a href="#section-mmc-core" className="mmc-dock-anchor">
      ⤴ Ir al Stage 2D
    </a>
  </div>
);

const DockPanel3D = () => (
  <div className="mmc-dock-panel">
    <div className="mmc-dock-ph mmc-dock-ph-3d">
      3D · Vista volumétrica
      <ChipEstado estado="DISENO" />
    </div>
    <div className="mmc-dock-banner mmc-dock-banner-warn">
      Motor 3D sin conectar. La licencia R1 de GeoGebra (EUPL v1.2 + NC por servicios +
      language files CC BY-NC-SA 4.0) requiere decisión de gobernanza antes de integrar.
    </div>
    <Row k="Motor futuro" v="GeoGebra · vendorizado /public/vendor/" mono />
    <Row k="Alternativa" v="Pyodide + matplotlib 3D · DISENO" mono />
    <Row k="Persistencia" v="IDBFS syncfs() · DISENO" mono />
    <Row k="Integración" v="Slot Interprete (ACP F4B) · DISENO" mono />
  </div>
);

const DockPanelFourier = () => (
  <div className="mmc-dock-panel">
    <div className="mmc-dock-ph mmc-dock-ph-f">
      ℱ · Análisis espectral
      <ChipEstado estado={MODEL_ESTADO.SIM} />
    </div>
    <div className="mmc-dock-banner mmc-dock-banner-ok">
      Los componentes ya existen en el laboratorio. Este Dock es SOLO un ancla visual.
    </div>
    <Row k="Espectro discreto" v="SignalsInteractive · buildSpec()" mono />
    <Row k="FFT cliente (real)" v="RealSignalAnalysis · calculateFFT()" mono />
    <Row k="Armónicos" v="ventana Hann · K hasta 100 bins" mono />
    <Row k="Bode / H(s)" v="RealSignalAnalysis · 2 nodos · dB clamp ±20/-60" mono />
    <div className="mmc-dock-anchors">
      <a href="#section-signals" className="mmc-dock-anchor">
        ⤵ Abrir panel Fourier (Serie de Fourier simple)
      </a>
      <a href="#section-real-signal" className="mmc-dock-anchor">
        ⤵ Abrir panel Señal Real (FFT + Bode)
      </a>
    </div>
  </div>
);

const DockPanelDSP = () => (
  <div className="mmc-dock-panel">
    <div className="mmc-dock-ph mmc-dock-ph-dsp">
      ≋ · Procesamiento digital
      <ChipEstado estado="PARCIAL" />
    </div>
    <div className="mmc-dock-banner mmc-dock-banner-info">
      La instrumentación mínima ya está calculada. Filtros FIR/IIR = DISENO.
    </div>
    <Row k="describeSeries()" v="min / max / peakToPeak · Vpp" mono />
    <Row k="THD" v="RealSignalAnalysis · K armónicos (Hann)" mono />
    <Row k="fs vs Nyquist" v="calculado: samples/periodo = ⌊fs/f⌋" mono />
    <Row k="Downsample" v="DISENO" />
    <Row k="Filtros FIR / IIR" v="DISENO" />
  </div>
);

const DockPanelSignals = () => (
  <div className="mmc-dock-panel">
    <div className="mmc-dock-ph mmc-dock-ph-s">
      📡 · Generadores de señal
      <ChipEstado estado={MODEL_ESTADO.SIM} />
    </div>
    <div className="mmc-dock-banner mmc-dock-banner-ok">
      Instrumentos existentes. Generan señales sintéticas en el navegador.
    </div>
    <Row k="Suma armónica" v="a₁·sin(f₁ t) + a₃·sin(f₃ t)" mono />
    <Row k="AM + demodulación" v="portadora f_c · mensaje f_m · profundidad m" mono />
    <Row k="Motor gráfico" v="4× MmcJsxGraphBoard (onda / espectro / AM / envolvente)" mono />
    <a href="#section-signals" className="mmc-dock-anchor">
      ⤵ Abrir panel Signals (Fourier + AM)
    </a>
  </div>
);

const DockPanelGeometry = () => (
  <div className="mmc-dock-panel">
    <div className="mmc-dock-ph mmc-dock-ph-g">
      △ · Geometría 2D
      <ChipEstado estado="PREPARADO" />
    </div>
    <div className="mmc-dock-banner mmc-dock-banner-info">
      Cuadrado rotado con punto arrastrable P. Matriz R(θ) = [cos -sin; sin cos].
    </div>
    <Row k="Motor" v="MmcJsxGraphBoard · polygon() flat list" mono />
    <Row k="θ" v="[0°, 180°] · step 1°" mono />
    <Row k="Punto arrastrable" v="P · coordenadas mostradas por tooltip" mono />
    <a href="#section-geometry" className="mmc-dock-anchor">
      ⤵ Abrir panel Geometría (Rotación 2D)
    </a>
  </div>
);

const DockPanelWorkspace = ({ workspaceModel, workspaceSignal, stats }) => {
  const shape = useMemo(() => {
    if (!workspaceModel) return null;
    const wm = workspaceModel;
    const m = wm.implementation || {};
    return {
      id: wm.id?.slice(0, 16) + (wm.id?.length > 16 ? '…' : '') || '--',
      kind: wm.kind || '--',
      label: wm.label || '--',
      expression: wm.expression || '--',
      params: Object.keys(wm.parameters || {}).length,
      dominio: wm.domain ? `[${fmt(wm.domain.t0, 4)}, ${fmt(wm.domain.t1, 4)}] @ ${wm.domain.fs} Hz` : '--',
      estado: wm.estado || '--',
      clase: wm.clase_senal || '--',
      conf: typeof wm.confianza === 'number' ? fmt(wm.confianza, 2) : '--',
      engine: `${m.engine || '--'} ${m.version || ''}`.trim(),
      license: m.license || '--',
      created: wm.metadata?.createdAt?.slice(11, 19) || '--'
    };
  }, [workspaceModel]);

  const signalShape = useMemo(() => {
    if (!workspaceSignal) return null;
    return {
      sampleCount: workspaceSignal.sampleCount || 0,
      samplesT: workspaceSignal.time?.length || 0,
      samplesV: workspaceSignal.values?.length || 0,
      fs: workspaceSignal.fs || '--'
    };
  }, [workspaceSignal]);

  return (
    <div className="mmc-dock-panel">
      <div className="mmc-dock-ph mmc-dock-ph-w">
        💾 · Workspace compartido
        <ChipEstado estado={workspaceModel?.estado || MODEL_ESTADO.SIM} />
      </div>
      <div className="mmc-dock-banner mmc-dock-banner-ok">
        <b>SOLO LECTURA.</b> Lee <code>workspace.model</code> y <code>workspace.signal</code>
        que el núcleo matemático ya produce. NO escribe en ningún store.
      </div>

      <div className="mmc-dock-section-h">workspace.model</div>
      {shape ? (
        <>
          <Row k="id" v={shape.id} mono />
          <Row k="kind" v={shape.kind} mono />
          <Row k="estado" v={<ChipEstado estado={shape.estado} />} mono={false} />
          <Row k="clase_senal" v={shape.clase} mono />
          <Row k="confianza" v={shape.conf} mono />
          <Row k="expresión" v={<span className="mmc-dock-mono-dim">{shape.expression}</span>} mono={false} />
          <Row k="parámetros" v={`${shape.params} activos`} mono />
          <Row k="dominio" v={shape.dominio} mono />
          <Row k="motor" v={shape.engine} mono />
          <Row k="licencia" v={shape.license} mono />
        </>
      ) : (
        <div className="mmc-dock-nodata">Sin modelo. Compila una ecuación válida.</div>
      )}

      <div className="mmc-dock-section-h">workspace.signal</div>
      {signalShape ? (
        <>
          <Row k="muestras" v={`${signalShape.sampleCount} ptos`} mono />
          <Row k="time[]" v={`Float64Array(${signalShape.samplesT})`} mono />
          <Row k="values[]" v={`Float64Array(${signalShape.samplesV})`} mono />
          <Row k="fs" v={`${signalShape.fs} Hz`} mono />
          {stats && (
            <>
              <Row k="min" v={fmt(stats.min)} mono />
              <Row k="max" v={fmt(stats.max)} mono />
              <Row k="Vpp" v={fmt(stats.peakToPeak)} mono />
            </>
          )}
        </>
      ) : (
        <div className="mmc-dock-nodata">Sin señal. La serie no está disponible todavía.</div>
      )}

      <div className="mmc-dock-section-h">Integración (DISENO)</div>
      <Row k="→ Evidence Ledger" v="DISENO" mono />
      <Row k="→ Electrónica" v="fuera de alcance (restricción)" mono />
      <Row k="→ Telecom" v="fuera de alcance (restricción)" mono />
      <Row k="→ IA Predictiva" v="fuera de alcance (restricción)" mono />
    </div>
  );
};

const DockPanel = ({ activeTab, workspaceModel, workspaceSignal, stats }) => {
  switch (activeTab) {
    case '2d':        return <DockPanel2D />;
    case '3d':        return <DockPanel3D />;
    case 'fourier':   return <DockPanelFourier />;
    case 'dsp':       return <DockPanelDSP />;
    case 'signals':   return <DockPanelSignals />;
    case 'geometry':  return <DockPanelGeometry />;
    case 'workspace': return <DockPanelWorkspace workspaceModel={workspaceModel} workspaceSignal={workspaceSignal} stats={stats} />;
    default:          return <div className="mmc-dock-panel">—</div>;
  }
};

export default DockPanel;
