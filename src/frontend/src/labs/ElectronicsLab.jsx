import React, { useEffect, useRef, useState } from 'react';
import { useLabStore } from '../stores/useLabStore'; // Import Store Global
import SchematicEditor from './SchematicEditor'; // Importar nuevo editor

const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  warning: '#ffa502',
  danger: '#ff3742',
  darkBackground: '#0a0a0a',
};

const parallel = (a, b) => (a > 0 && b > 0) ? (a * b) / (a + b) : (a || b);

const CircuitCanvas = ({ vinAmp, vinFreq, useAm, fc, fm, mIndex, Vcc, Rc, Re, R1, R2, RL, emitterBypass, beta, Rdet, Cdet, tauLPms, specSource, useHann }) => {
  const ref = useRef(null);
  const [time, setTime] = useState(0);

  // Punto de operación aproximado (común emisor en región activa)
  const VT = 0.025; // 25 mV a temperatura ambiente
  const Vb = Vcc * (R2 / (R1 + R2));
  const Ve = Math.max(0, Vb - 0.7);
  const IcQ = Math.max(0.0005, Ve / Math.max(1, Re));
  const gm = IcQ / VT; // transconductancia
  const Re_small = emitterBypass ? 0 : Re;
  const Rc_eff = RL > 0 ? parallel(Rc, RL) : Rc;
  const Av = -(gm * Rc_eff) / (1 + gm * Re_small);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => t + 0.016), 16);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = NEON_COLORS.darkBackground; ctx.fillRect(0,0,W,H);

    // Señal de entrada senoidal o AM (acoplada a base)
    const baseCarrier = Math.sin(2 * Math.PI * (useAm ? fc : vinFreq) * time);
    const amEnv = useAm ? 1 + mIndex * Math.sin(2 * Math.PI * fm * time) : 1;
    const vin = vinAmp * amEnv * baseCarrier;
    // Salida aproximada (invertida)
    const vout = Av * vin;
    // Corrientes (visual): Ib y Ic en función de vin
    const ic = gm * vin + IcQ; // variación sobre IcQ
    const ib = ic / Math.max(1, beta);

    // Dibujo del circuito simplificado
    const cx = W * 0.5; const cy = H * 0.45;
    // Vcc y Rc arriba
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, 30); ctx.lineTo(cx, 60); // Vcc down
    ctx.lineTo(cx + 80, 60); // hacia Rc
    ctx.lineTo(cx + 80, 140); // Rc
    ctx.lineTo(cx, 140);
    ctx.stroke();
    // Transistor
    ctx.strokeStyle = '#6dd5ff';
    ctx.strokeRect(cx - 20, 140, 40, 60); // cuerpo
    // Re abajo
    ctx.strokeStyle = '#334155';
    ctx.beginPath(); ctx.moveTo(cx, 200); ctx.lineTo(cx, 240); ctx.lineTo(cx, 260); ctx.stroke();

    // Base con señal
    ctx.beginPath(); ctx.moveTo(cx - 100, 160); ctx.lineTo(cx - 20, 160); ctx.stroke();
    // Dibujo vin
    ctx.strokeStyle = NEON_COLORS.primary; ctx.beginPath();
    for (let x = cx - 100; x <= cx - 20; x += 4) {
      const t = (x - (cx - 100)) / 80; // 0..1
      const y = 160 + 8 * Math.sin(2 * Math.PI * t + time * 4);
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Flechas de corriente Ib y Ic
    const ibScale = Math.min(1, Math.abs(ib) / 0.00005); // escalar visual
    const icScale = Math.min(1, Math.abs(ic) / 0.01);
    ctx.strokeStyle = NEON_COLORS.secondary; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 20, 160); ctx.lineTo(cx - 20 - 30 * ibScale, 160); ctx.stroke(); // Ib
    ctx.strokeStyle = '#ff6b6b'; ctx.beginPath(); ctx.moveTo(cx, 140); ctx.lineTo(cx, 140 - 40 * icScale); ctx.stroke(); // Ic hacia Rc

    // Indicadores y texto
    ctx.fillStyle = '#b0b8c0'; ctx.font = '12px monospace';
    ctx.fillText(`Vcc=${Vcc}V Rc=${Rc}Ω RL=${RL}Ω Re=${Re}Ω β=${beta}`, 10, H - 18);
    ctx.fillStyle = NEON_COLORS.secondary; ctx.fillText(`Ib≈${(ib*1e6).toFixed(2)} µA`, 20, 28);
    ctx.fillStyle = '#ff6b6b'; ctx.fillText(`Ic≈${(ic*1e3).toFixed(2)} mA`, 120, 28);
    ctx.fillStyle = NEON_COLORS.primary; ctx.fillText(`Av≈${Av.toFixed(2)}  vout≈${vout.toFixed(2)} V`, 260, 28);

    // Mini osciloscopio de vin y vout
    const scopeX = 20, scopeY = H - 120, scopeW = W - 40, scopeH = 90;
    ctx.strokeStyle = '#223'; ctx.strokeRect(scopeX, scopeY, scopeW, scopeH);
    ctx.save(); ctx.beginPath(); ctx.rect(scopeX, scopeY, scopeW, scopeH); ctx.clip();
    const samples = 300;
    const vinScale = 30 / Math.max(0.01, vinAmp);
    const voutScale = 30 / Math.max(0.01, Math.abs(Av) * vinAmp * (useAm ? 1 + mIndex : 1));
    // Trazar vin
    ctx.strokeStyle = NEON_COLORS.primary; ctx.beginPath();
    for (let i = 0; i < samples; i++) {
      const t = time + i / samples * 0.02;
      const base = Math.sin(2 * Math.PI * (useAm ? fc : vinFreq) * t);
      const env = useAm ? 1 + mIndex * Math.sin(2 * Math.PI * fm * t) : 1;
      const y = scopeY + scopeH/2 - vinScale * (vinAmp * env * base);
      const x = scopeX + (i / (samples-1)) * scopeW;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Trazar vout
    ctx.strokeStyle = NEON_COLORS.secondary; ctx.beginPath();
    for (let i = 0; i < samples; i++) {
      const t = time + i / samples * 0.02;
      const base = Math.sin(2 * Math.PI * (useAm ? fc : vinFreq) * t);
      const env = useAm ? 1 + mIndex * Math.sin(2 * Math.PI * fm * t) : 1;
      const y = scopeY + scopeH/2 - voutScale * (Av * vinAmp * env * base);
      const x = scopeX + (i / (samples-1)) * scopeW;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Envolvente demodulada (rectificación ideal + filtro RC) y LP adicional
    const dt = 0.02 / samples; const tau = Math.max(1e-6, (Rdet || 10000) * (Cdet || 1e-6));
    const alpha = Math.exp(-dt / tau);
    const tauLP = Math.max(0, (tauLPms || 0) / 1000);
    const alphaLP = tauLP > 0 ? Math.exp(-dt / tauLP) : 0;
    let envRC = 0, envLP = 0;
    // RC (amarillo)
    ctx.strokeStyle = NEON_COLORS.warning; ctx.beginPath();
    for (let i = 0; i < samples; i++) {
      const t = time + i / samples * 0.02;
      const base = Math.sin(2 * Math.PI * (useAm ? fc : vinFreq) * t);
      const envIn = useAm ? 1 + mIndex * Math.sin(2 * Math.PI * fm * t) : 1;
      const rect = Math.abs(Av * vinAmp * envIn * base);
      envRC = alpha * envRC + (1 - alpha) * rect;
      const y = scopeY + scopeH/2 - 30 * envRC;
      const x = scopeX + (i / (samples-1)) * scopeW;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // LP adicional (rojo) para suavizar rizado
    ctx.strokeStyle = NEON_COLORS.danger; ctx.beginPath(); envLP = 0;
    for (let i = 0; i < samples; i++) {
      const t = time + i / samples * 0.02;
      const base = Math.sin(2 * Math.PI * (useAm ? fc : vinFreq) * t);
      const envIn = useAm ? 1 + mIndex * Math.sin(2 * Math.PI * fm * t) : 1;
      const rect = Math.abs(Av * vinAmp * envIn * base);
      envRC = alpha * envRC + (1 - alpha) * rect;
      envLP = alphaLP * envLP + (1 - alphaLP) * envRC;
      const y = scopeY + scopeH/2 - 30 * envLP;
      const x = scopeX + (i / (samples-1)) * scopeW;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // Mini espectro (DFT) para vin / vout / demod (envolvente LP)
    const specX = 20, specY = H - 220, specW = W - 40, specH = 90;
    ctx.strokeStyle = '#223'; ctx.strokeRect(specX, specY, specW, specH);
    const N = 512; const fs = 48000; const dtS = 1 / fs;
    const tauLP_spec = Math.max(0, (tauLPms || 0) / 1000);
    const alphaLP_spec = tauLP_spec > 0 ? Math.exp(-dtS / tauLP_spec) : 0;
    const sig = new Array(N);
    const hann = new Array(N);
    if (useHann) {
      for (let n = 0; n < N; n++) hann[n] = 0.5 * (1 - Math.cos(2 * Math.PI * n / (N - 1)));
    }
    let envLPfft = 0;
    for (let n = 0; n < N; n++) {
      const t = time + n * dtS;
      const base = Math.sin(2 * Math.PI * (useAm ? fc : vinFreq) * t);
      const envIn = useAm ? 1 + mIndex * Math.sin(2 * Math.PI * fm * t) : 1;
      const vinS = vinAmp * envIn * base;
      const voutS = Av * vinAmp * envIn * base;
      const rect = Math.abs(voutS);
      envLPfft = alphaLP_spec * envLPfft + (1 - alphaLP_spec) * rect; // aproximación de demod LP
      const raw = specSource === 'vout' ? voutS : specSource === 'env' ? envLPfft : vinS;
      sig[n] = useHann ? raw * hann[n] : raw;
    }
    const half = N / 2; const mags = new Array(half);
    let maxMag = 1e-9;
    for (let k = 0; k < half; k++) {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) {
        const ang = 2 * Math.PI * k * n / N;
        re += sig[n] * Math.cos(ang);
        im -= sig[n] * Math.sin(ang);
      }
      const mag = Math.sqrt(re*re + im*im) / N;
      mags[k] = mag; if (mag > maxMag) maxMag = mag;
    }
    // Dibujo del espectro como trazado continuo
    ctx.strokeStyle = NEON_COLORS.secondary; ctx.beginPath();
    for (let k = 0; k < half; k++) {
      const f = k * fs / N;
      const x = specX + (f / (fs/2)) * specW;
      const y = specY + specH - (mags[k] / maxMag) * (specH - 6);
      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Marcadores de frecuencias relevantes
    const drawMarker = (f, color) => {
      if (f <= 0 || f > fs/2) return;
      const x = specX + (f / (fs/2)) * specW;
      ctx.strokeStyle = color; ctx.beginPath();
      ctx.moveTo(x, specY + specH); ctx.lineTo(x, specY + 2); ctx.stroke();
    };
    if (useAm) {
      drawMarker(fc, NEON_COLORS.primary);
      drawMarker(fm, NEON_COLORS.warning);
      drawMarker(fc + fm, '#9932CC');
      drawMarker(fc - fm, '#9932CC');
    } else {
      drawMarker(vinFreq, NEON_COLORS.primary);
    }
    // Top picos (3)
    const peaks = [];
    for (let k = 2; k < half - 2; k++) {
      if (mags[k] > mags[k-1] && mags[k] > mags[k+1]) {
        peaks.push({ f: k * fs / N, m: mags[k] });
      }
    }
    peaks.sort((a,b) => b.m - a.m);
    const top = peaks.slice(0,3);
    ctx.fillStyle = '#b0b8c0'; ctx.font = '11px monospace';
    const labels = top.map(p => `${Math.round(p.f)}Hz`).join(' | ');
    ctx.fillText(`Espectro(${specSource})${useHann?' [Hann]':''}: ${labels}`, specX + 6, specY + 12);
    // Métricas numéricas y SNR para demod
    const binFm = Math.max(1, Math.round(fm * N / fs));
    if (specSource === 'env') {
      const signal = mags[binFm] || 1e-9;
      let noiseSum = 0, noiseCount = 0;
      const maxBand = Math.min(Math.round(5 * fm * N / fs), half - 1);
      for (let k = 1; k <= maxBand; k++) {
        if (Math.abs(k - binFm) <= 1) continue;
        noiseSum += mags[k]; noiseCount++;
      }
      const noise = (noiseSum / Math.max(1, noiseCount)) || 1e-9;
      const snrDb = 20 * Math.log10(signal / noise);
      ctx.fillText(`fc=${useAm?fc:vinFreq}Hz fm=${fm}Hz fc±fm=${useAm?`${fc-fm}/${fc+fm}`:'—'}Hz   SNR_demod≈${snrDb.toFixed(1)} dB`, specX + 6, specY + specH - 6);
    } else {
      ctx.fillText(`fc=${useAm?fc:vinFreq}Hz fm=${useAm?fm:'—'}Hz fc±fm=${useAm?`${fc-fm}/${fc+fm}`:'—'}Hz`, specX + 6, specY + specH - 6);
    }
  }, [time, vinAmp, vinFreq, useAm, fc, fm, mIndex, Vcc, Rc, Re, R1, R2, RL, emitterBypass, beta, Av, Rdet, Cdet, tauLPms, specSource, useHann]);

  return (
    <canvas ref={ref} width={680} height={320} className="w-full rounded" style={{ border: '1px solid ' + NEON_COLORS.primary + '40', background: '#0d0d1f' }} />
  );
};

const PythonSimPanel = ({ vinAmp, vinFreq, useAm, fc, fm, mIndex, Vcc, Rc, Re, R1, R2, RL, emitterBypass }) => {
  const [pyReady, setPyReady] = useState(false);
  const [pyLoading, setPyLoading] = useState(false);
  const [output, setOutput] = useState('');

  const ensurePyodide = async () => {
    if (pyReady) return true;
    try {
      setPyLoading(true);
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
          s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
        });
      }
      const py = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
      window.__py_elec = py; setPyReady(true); setPyLoading(false); return true;
    } catch (e) {
      setOutput('No se pudo cargar Pyodide: ' + e); setPyLoading(false); return false;
    }
  };

  const runSim = async () => {
    const ok = await ensurePyodide(); if (!ok) return;
    const code = `
# Simulación CE más realista (pequeña señal)
def parallel(a,b):
    return (a*b)/(a+b) if a>0 and b>0 else (a or b)
Vcc = ${Vcc}
Rc = ${Rc}
Re = ${Re}
R1 = ${R1}
R2 = ${R2}
RL = ${RL}
VT = 0.025
use_am = ${useAm ? 'True' : 'False'}
fc = ${fc}
fm = ${fm}
m = ${mIndex}
vin_amp = ${vinAmp}
vin_freq = ${vinFreq}

Vb = Vcc * (R2 / (R1 + R2))
Ve = max(0.0, Vb - 0.7)
IcQ = max(0.0005, Ve / max(Re, 1))
gm = IcQ / VT
Re_small = 0 if ${emitterBypass ? 'True' : 'False'} else Re
Rc_eff = parallel(Rc, RL) if RL>0 else Rc
Av = -(gm * Rc_eff) / (1 + gm * Re_small)

vout_amp = abs(Av) * vin_amp * (1+m if use_am else 1)
headroom = Vcc - (IcQ * Rc)
clipping = vout_amp > headroom * 0.9
res = f"IcQ≈{IcQ:.4f}A gm≈{gm:.3f}  Av≈{Av:.2f}  Vout_amp≈{vout_amp:.3f}V  Headroom≈{headroom:.2f}V  Clipping={clipping}"
res
`;
    try { const r = await window.__py_elec.runPythonAsync(code); setOutput(String(r)); }
    catch(e) { setOutput('Error en Python: ' + e); }
  };

  return (
    <div className="p-3 rounded border" style={{ borderColor: NEON_COLORS.secondary + '40' }}>
      <h4 className="text-sm font-semibold mb-2" style={{ color: NEON_COLORS.secondary }}>🧪 Simulación Python (Pyodide)</h4>
      <div className="flex gap-2 mb-2">
        <button onClick={runSim} className="px-3 py-2 text-xs rounded border" style={{ borderColor: NEON_COLORS.primary, color: NEON_COLORS.primary }}>
          {pyLoading ? 'Cargando…' : (pyReady ? 'Ejecutar de nuevo' : 'Cargar y ejecutar')}
        </button>
        {pyReady && <span className="text-xs" style={{ color: NEON_COLORS.gold }}>Pyodide listo</span>}
      </div>
      <div className="font-mono text-xs" style={{ color: '#e6edf3' }}>{output || 'Pulsa para calcular ganancia, headroom y clipping'}</div>
    </div>
  );
};

const ElectronicsLab = ({ onNavigate }) => {
  // Conexión al Store Global (Federated State) - CON FALLBACK SEGURO
  const setElectronicsSignal = useLabStore ? useLabStore((state) => state.setElectronicsSignal) : () => {};

  const [vinAmp, setVinAmp] = useState(0.1);
  const [vinFreq, setVinFreq] = useState(1000);
  const [useAm, setUseAm] = useState(true);
  const [fc, setFc] = useState(10000);
  const [fm, setFm] = useState(1000);
  const [mIndex, setMIndex] = useState(0.5);
  const [Vcc, setVcc] = useState(12);
  const [Rc, setRc] = useState(2000);
  const [Re, setRe] = useState(1000);
  const [R1, setR1] = useState(47000);
  const [R2, setR2] = useState(10000);
  const [RL, setRL] = useState(4000);
  const [emitterBypass, setEmitterBypass] = useState(false);
  const [beta, setBeta] = useState(100);
  const [Rdet, setRdet] = useState(10000);
  const [Cdet, setCdet] = useState(0.000001);
  const [tauLPms, setTauLPms] = useState(0);
  const [specSource, setSpecSource] = useState('vout');
  const [useHann, setUseHann] = useState(true);
  
  // Nuevo estado para alternar vistas
  const [viewMode, setViewMode] = useState('simulation'); // 'simulation' | 'schematic'

  // Sincronización automática con el "Bridge" (Store Global)
  useEffect(() => {
    // Simulamos que enviamos la señal actual al "Hub" cada vez que cambian los parámetros críticos
    // Esto permite que al navegar a Matemáticas, los datos ya estén allí.
    setElectronicsSignal({
      params: { vinAmp, vinFreq, Vcc, Rc },
      signals: {
        // En una implementación real, aquí iría el array de datos del osciloscopio
        description: "Señal de Amplificador Emisor Común"
      }
    });
  }, [vinAmp, vinFreq, Vcc, Rc, setElectronicsSignal]);

  return (
    <div className="min-h-screen p-6 pt-24" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER DASHBOARD UNIFICADO */}
        <header className="mb-8 border-b border-gray-800 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2"
                        style={{ 
                            background: `linear-gradient(to right, ${NEON_COLORS.primary}, ${NEON_COLORS.secondary})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.3))'
                        }}>
                        Estación de Ingeniería Rural
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                        <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-700">v3.0 INTEGRATED</span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            SISTEMA ONLINE
                        </span>
                        
                        {/* SELECTOR DE MODO */}
                        <div className="ml-4 flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                           <button 
                             onClick={() => setViewMode('simulation')}
                             className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'simulation' ? 'bg-cyan-900 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                           >
                             📊 SIMULACIÓN
                           </button>
                           <button 
                             onClick={() => setViewMode('schematic')}
                             className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'schematic' ? 'bg-purple-900 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                           >
                             ✏️ DISEÑO (BETA)
                           </button>
                        </div>
                    </div>
                </div>

                {/* BOTONES DE NAVEGACIÓN RÁPIDA (BRIDGE) */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => onNavigate && onNavigate('robotics')}
                        className="px-6 py-3 bg-gray-900 border border-gray-600 hover:border-cyan-400 text-cyan-400 font-mono text-sm font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] flex items-center gap-2"
                    >
                        🤖 Robótica
                    </button>
                    <button 
                        onClick={() => onNavigate && onNavigate('math')}
                        className="px-6 py-3 bg-green-900/30 border border-green-500 hover:bg-green-900/50 text-green-400 font-mono text-sm font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(57,255,20,0.6)] animate-pulse flex items-center gap-2"
                    >
                        🧮 Lab Matemático
                    </button>
                </div>
            </div>
        </header>

        {/* CONTENIDO PRINCIPAL (Switcheable) */}
        {viewMode === 'schematic' ? (
          <div className="animate-fadeIn">
             <SchematicEditor />
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMNA IZQUIERDA: INSTRUMENTACIÓN (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* 1. OSCILOSCOPIO PRINCIPAL */}
                <div className="p-1 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                    <div className="bg-[#050505] rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                                <span className="text-lg">📉</span> Osciloscopio Digital
                            </h3>
                            <div className="flex gap-4 text-xs font-mono text-gray-500">
                                <span>CH1: <span className="text-cyan-400">VIN</span></span>
                                <span>CH2: <span className="text-green-400">VOUT</span></span>
                            </div>
                        </div>
                        
                        <CircuitCanvas
                            vinAmp={vinAmp}
                            vinFreq={vinFreq}
                            useAm={useAm}
                            fc={fc}
                            fm={fm}
                            mIndex={mIndex}
                            Vcc={Vcc}
                            Rc={Rc}
                            Re={Re}
                            R1={R1}
                            R2={R2}
                            RL={RL}
                            emitterBypass={emitterBypass}
                            beta={beta}
                            Rdet={Rdet}
                            Cdet={Cdet}
                            tauLPms={tauLPms}
                            specSource={specSource}
                            useHann={useHann}
                        />
                    </div>
                </div>

                {/* 2. PANEL DE SIMULACIÓN PYTHON */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PythonSimPanel
                        vinAmp={vinAmp}
                        vinFreq={vinFreq}
                        useAm={useAm}
                        fc={fc}
                        fm={fm}
                        mIndex={mIndex}
                        Vcc={Vcc}
                        Rc={Rc}
                        Re={Re}
                        R1={R1}
                        R2={R2}
                        RL={RL}
                        emitterBypass={emitterBypass}
                    />
                    
                    {/* TARJETA DE ESTADO DEL PUENTE */}
                    <div className="p-4 rounded border border-gray-800 bg-[#0d0d0d]">
                        <h4 className="text-sm font-semibold mb-3 text-purple-400 uppercase tracking-widest">
                            🌉 Estado del Puente de Datos
                        </h4>
                        <div className="space-y-2 text-xs font-mono text-gray-400">
                            <div className="flex justify-between border-b border-gray-800 pb-1">
                                <span>Estado Global:</span>
                                <span className="text-green-400">ACTIVO</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-800 pb-1">
                                <span>Datos en Buffer:</span>
                                <span className="text-white">128 KB</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-800 pb-1">
                                <span>Latencia API:</span>
                                <span className="text-yellow-400">45ms</span>
                            </div>
                            <div className="mt-4 pt-2">
                                <button className="w-full py-2 bg-purple-900/20 border border-purple-500/50 text-purple-300 hover:bg-purple-900/40 transition-colors uppercase tracking-widest">
                                    Forzar Sincronización
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* COLUMNA DERECHA: CONTROLES (4/12) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-lg backdrop-blur-sm">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">
                        Parámetros de Entrada
                    </h2>
                    
                    <div className="space-y-6">
                        {/* GRUPO 1: SEÑAL */}
                        <div>
                            <label className="text-xs text-cyan-400 font-mono mb-2 block">GENERADOR DE FUNCIONES</label>
                            <div className="space-y-3 p-3 bg-black/40 rounded border border-gray-800">
                                <div>
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Amplitud (V)</span>
                                        <span>{vinAmp.toFixed(2)} V</span>
                                    </div>
                                    <input type="range" min={0.01} max={0.5} step={0.01} value={vinAmp} onChange={(e)=>setVinAmp(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Frecuencia (Hz)</span>
                                        <span>{vinFreq} Hz</span>
                                    </div>
                                    <input type="range" min={100} max={50000} step={10} value={vinFreq} onChange={(e)=>setVinFreq(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
                                </div>
                            </div>
                        </div>

                        {/* GRUPO 2: MODULACIÓN */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-green-400 font-mono">MODULACIÓN AM</label>
                                <input type="checkbox" checked={useAm} onChange={(e)=>setUseAm(e.target.checked)} className="accent-green-500" />
                            </div>
                            
                            {useAm && (
                                <div className="space-y-3 p-3 bg-black/40 rounded border border-gray-800 animate-fade-in">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Portadora (fc)</span>
                                            <span>{fc} Hz</span>
                                        </div>
                                        <input type="range" min={1000} max={50000} step={100} value={fc} onChange={(e)=>setFc(parseFloat(e.target.value))} className="w-full accent-green-500" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Moduladora (fm)</span>
                                            <span>{fm} Hz</span>
                                        </div>
                                        <input type="range" min={10} max={5000} step={10} value={fm} onChange={(e)=>setFm(parseFloat(e.target.value))} className="w-full accent-green-500" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Índice (m)</span>
                                            <span>{mIndex.toFixed(2)}</span>
                                        </div>
                                        <input type="range" min={0} max={1} step={0.01} value={mIndex} onChange={(e)=>setMIndex(parseFloat(e.target.value))} className="w-full accent-green-500" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* GRUPO 3: TRANSISTOR */}
                        <div>
                            <label className="text-xs text-yellow-400 font-mono mb-2 block">POLARIZACIÓN (Q-POINT)</label>
                            <div className="grid grid-cols-2 gap-2 p-3 bg-black/40 rounded border border-gray-800">
                                <div>
                                    <span className="text-[10px] text-gray-500 block">Vcc (V)</span>
                                    <input type="number" value={Vcc} onChange={(e)=>setVcc(parseFloat(e.target.value))} className="w-full bg-transparent border-b border-gray-700 text-white text-xs py-1 focus:border-yellow-500 outline-none" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 block">Beta (β)</span>
                                    <input type="number" value={beta} onChange={(e)=>setBeta(parseFloat(e.target.value))} className="w-full bg-transparent border-b border-gray-700 text-white text-xs py-1 focus:border-yellow-500 outline-none" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 block">Rc (Ω)</span>
                                    <input type="number" value={Rc} onChange={(e)=>setRc(parseFloat(e.target.value))} className="w-full bg-transparent border-b border-gray-700 text-white text-xs py-1 focus:border-yellow-500 outline-none" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 block">Re (Ω)</span>
                                    <input type="number" value={Re} onChange={(e)=>setRe(parseFloat(e.target.value))} className="w-full bg-transparent border-b border-gray-700 text-white text-xs py-1 focus:border-yellow-500 outline-none" />
                                </div>
                                <div className="col-span-2 pt-2">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={emitterBypass} onChange={(e)=>setEmitterBypass(e.target.checked)} className="accent-yellow-500" />
                                        <span className="text-xs text-gray-400">Capacitor de Desacople (Ce)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ElectronicsLab;