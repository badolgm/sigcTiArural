import React, { useEffect, useRef, useState } from 'react';

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

  return (
    <div className="p-6 pt-20 min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 uppercase text-center" style={{ color: NEON_COLORS.primary, textShadow: `0 0 12px ${NEON_COLORS.primary}, 0 0 8px ${NEON_COLORS.primary}AA` }}>
          Electrónica y Circuitos — Transistor en Región Activa
        </h1>
        <p className="text-center text-gray-400 mb-6">Visualiza el flujo de corriente y la amplificación de un transistor NPN en etapa activa (común emisor). Conecta con la señal del ejemplo de Modulación AM.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg" style={{ borderColor: NEON_COLORS.primary + '40' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: NEON_COLORS.primary }}>🧩 Circuito y Corrientes</h3>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>Amplitud entrada (V)</label>
                  <input type="range" min={0.01} max={0.5} step={0.01} value={vinAmp} onChange={(e)=>setVinAmp(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{vinAmp.toFixed(2)} V</div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>Frecuencia (Hz)</label>
                  <input type="range" min={100} max={50000} step={10} value={vinFreq} onChange={(e)=>setVinFreq(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{vinFreq} Hz</div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>Usar entrada AM</label>
                  <input type="checkbox" checked={useAm} onChange={(e)=>setUseAm(e.target.checked)} />
                </div>
                {useAm && (
                  <>
                    <div>
                      <label className="text-xs" style={{ color: '#b0b8c0' }}>f_c (Hz)</label>
                      <input type="range" min={1000} max={50000} step={100} value={fc} onChange={(e)=>setFc(parseFloat(e.target.value))} />
                      <div className="text-xs" style={{ color: '#b0b8c0' }}>{fc} Hz</div>
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: '#b0b8c0' }}>f_m (Hz)</label>
                      <input type="range" min={10} max={5000} step={10} value={fm} onChange={(e)=>setFm(parseFloat(e.target.value))} />
                      <div className="text-xs" style={{ color: '#b0b8c0' }}>{fm} Hz</div>
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: '#b0b8c0' }}>Índice m</label>
                      <input type="range" min={0} max={1} step={0.01} value={mIndex} onChange={(e)=>setMIndex(parseFloat(e.target.value))} />
                      <div className="text-xs" style={{ color: '#b0b8c0' }}>{mIndex.toFixed(2)}</div>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>Vcc (V)</label>
                  <input type="range" min={5} max={18} step={1} value={Vcc} onChange={(e)=>setVcc(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{Vcc} V</div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>Rc (Ω)</label>
                  <input type="range" min={1000} max={5000} step={100} value={Rc} onChange={(e)=>setRc(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{Rc} Ω</div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>Re (Ω)</label>
                  <input type="range" min={500} max={3000} step={100} value={Re} onChange={(e)=>setRe(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{Re} Ω</div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>R1 (Ω)</label>
                  <input type="range" min={10000} max={100000} step={1000} value={R1} onChange={(e)=>setR1(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{R1} Ω</div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>R2 (Ω)</label>
                  <input type="range" min={5000} max={50000} step={1000} value={R2} onChange={(e)=>setR2(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{R2} Ω</div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>RL (Ω)</label>
                  <input type="range" min={0} max={10000} step={200} value={RL} onChange={(e)=>setRL(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{RL} Ω (0 = sin carga)</div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>Bypass emisor (C_E)</label>
                  <input type="checkbox" checked={emitterBypass} onChange={(e)=>setEmitterBypass(e.target.checked)} />
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>Rdet (Ω)</label>
                  <input type="range" min={1000} max={100000} step={1000} value={Rdet} onChange={(e)=>setRdet(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{Rdet} Ω</div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>Cdet (F)</label>
                  <input type="range" min={0.0000001} max={0.00001} step={0.0000001} value={Cdet} onChange={(e)=>setCdet(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{Cdet.toExponential(2)} F</div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>τ LP (ms)</label>
                  <input type="range" min={0} max={20} step={0.2} value={tauLPms} onChange={(e)=>setTauLPms(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{tauLPms.toFixed(1)} ms</div>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>Fuente espectro</label>
                  <select value={specSource} onChange={(e)=>setSpecSource(e.target.value)} className="text-black text-xs p-1 rounded">
                    <option value="vin">vin</option>
                    <option value="vout">vout</option>
                    <option value="env">demod</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>Ventana Hann</label>
                  <input type="checkbox" checked={useHann} onChange={(e)=>setUseHann(e.target.checked)} />
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#b0b8c0' }}>β (ganancia de corriente)</label>
                  <input type="range" min={50} max={200} step={5} value={beta} onChange={(e)=>setBeta(parseFloat(e.target.value))} />
                  <div className="text-xs" style={{ color: '#b0b8c0' }}>{beta}</div>
                </div>
              </div>
              <div className="mt-3 text-xs" style={{ color: '#b0b8c0' }}>Visual: líneas verdes (Ib) y rojas (Ic). La salida se invierte respecto a la entrada en CE. Ganancia afectada por Re (degeneración) y carga RL.</div>
            </div>

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
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg" style={{ borderColor: NEON_COLORS.secondary + '40' }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: NEON_COLORS.secondary }}>🔗 Señal AM y Enlace</h3>
              <p className="text-sm" style={{ color: '#aab2ba' }}>Este laboratorio se enlaza con el ejemplo “Ejemplo EM: Modulación AM y Demodulación”. Pulsa el botón para abrir la señal AM y ajustar <span className="font-mono">f_c</span>, <span className="font-mono">f_m</span> y el índice <span className="font-mono">m</span>. También puedes activar AM directamente aquí y observar la envolvente en el osciloscopio.</p>
              <button onClick={() => onNavigate && onNavigate('advanced-math-v2')} className="mt-2 px-3 py-2 text-xs rounded border" style={{ borderColor: NEON_COLORS.primary, color: NEON_COLORS.primary }}>
                Abrir Señal AM (Laboratorio Matemáticas V2)
              </button>
            </div>
            <div className="p-4 border rounded-lg" style={{ borderColor: NEON_COLORS.warning + '40' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: NEON_COLORS.warning }}>Notas de Teoría</h3>
              <ul className="text-xs space-y-1" style={{ color: '#c9d1d9' }}>
                <li>• Región activa: transistor NPN con polarización fija, amplifica sin saturar.</li>
                <li>• Ganancia aproximada: Av ≈ −gm·Rc; gm ≈ Ic/VT.</li>
                <li>• La modulación AM puede ser pre-amplificada antes de transmitir.</li>
                <li>• Este panel es educativo; para análisis preciso usa SPICE (LTspice/Falstad).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectronicsLab;