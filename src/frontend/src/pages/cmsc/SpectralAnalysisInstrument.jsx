// SpectralAnalysisInstrument v1 · primer instrumento científico real del CMSC (v4).
// Regla: NO sustituye ni duplica TelecomLab — TelecomLab produce, aquí se analiza.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';
import { SIGNAL_CATALOG } from './signalCatalog.js';
import { docsBySignal } from '../../services/docsBySignal.js';
import {
  N_FFT,
  SPECTRUM_BUCKETS,
  SPECTROGRAM_ROWS,
  AUDIBLE_MIN_HZ,
  DEFAULT_SAMPLE_RATE,
  FREQ_BANDS,
  binsForHz,
  analyzeFrame,
  frameLevelDb,
  dBProfile
} from './spectralEngine.js';

const S30 = SIGNAL_CATALOG.find((s) => s.signal_id === 'S30');

const fmtHz = (hz) => {
  if (!hz || !Number.isFinite(hz)) return '—';
  return hz >= 1000 ? `${(hz / 1000).toFixed(2)} kHz` : `${Math.round(hz)} Hz`;
};

const fmtDb = (db) => {
  if (!Number.isFinite(db)) return '—';
  return `${db.toFixed(1)} dB`;
};

const canvasStyle = (height) => ({
  width: '100%',
  height,
  display: 'block',
  borderRadius: '0.5rem',
  border: '1px solid #334155',
  backgroundColor: '#050505'
});

const StatCell = ({ label, value, color }) => (
  <div className="rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-2">
    <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
    <div className="text-sm font-mono mt-0.5" style={{ color: color || NEON.primary }}>{value}</div>
  </div>
);

const SpectralAnalysisInstrument = () => {
  const [status, setStatus] = useState('idle');
  const [stats, setStats] = useState(null);
  const [levelDb, setLevelDb] = useState(null);
  const [error, setError] = useState(null);

  const waveRef = useRef(null);
  const specRef = useRef(null);
  const sgramRef = useRef(null);
  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const rafRef = useRef(0);
  const sgramRef2 = useRef(new Float32Array(SPECTROGRAM_ROWS * SPECTRUM_BUCKETS));
  const lastStatsTick = useRef(0);

  const docs = useMemo(() => docsBySignal('S30'), []);
  const signal = useMemo(() => S30 || null, []);

  const timestamp = useMemo(
    () => new Date().toISOString(),
    []
  );

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator?.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      setError('El navegador no expone getUserMedia. La adquisición local es indisponible.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = N_FFT;
      analyser.smoothingTimeConstant = 0.55;
      source.connect(analyser);

      streamRef.current = stream;
      ctxRef.current = audioCtx;
      const sampleRate = audioCtx.sampleRate || DEFAULT_SAMPLE_RATE;
      const timeData = new Uint8Array(analyser.fftSize);
      const floatWindow = new Float32Array(analyser.fftSize);
      const { minBin, maxBin } = binsForHz(AUDIBLE_MIN_HZ, sampleRate / 2, sampleRate);

      setStatus('running');

      const waveCtx = waveRef.current?.getContext('2d');
      const specCtx = specRef.current?.getContext('2d');
      const sgramCtx = sgramRef.current?.getContext('2d');
      const history = sgramRef2.current;
      history.fill(0);

      const loop = () => {
        analyser.getByteTimeDomainData(timeData);
        for (let i = 0; i < timeData.length; i++) {
          floatWindow[i] = (timeData[i] - 128) / 128;
        }
        const frame = analyzeFrame(floatWindow, sampleRate);
        const level = frameLevelDb(floatWindow);

        if (waveCtx && waveRef.current) {
          const w = waveRef.current.width;
          const h = waveRef.current.height;
          waveCtx.fillStyle = '#050505';
          waveCtx.fillRect(0, 0, w, h);
          waveCtx.strokeStyle = NEON.secondary;
          waveCtx.lineWidth = 1.5;
          waveCtx.beginPath();
          for (let i = 0; i < timeData.length; i++) {
            const x = (i / timeData.length) * w;
            const y = h / 2 + floatWindow[i] * (h / 2 - 4);
            if (i === 0) waveCtx.moveTo(x, y);
            else waveCtx.lineTo(x, y);
          }
          waveCtx.stroke();
        }

        if (specCtx && specRef.current) {
          const { profile } = dBProfile(frame.db, minBin, maxBin, SPECTRUM_BUCKETS);
          const w = specRef.current.width;
          const h = specRef.current.height;
          specCtx.fillStyle = '#050505';
          specCtx.fillRect(0, 0, w, h);
          const barW = w / profile.length;
          for (let i = 0; i < profile.length; i++) {
            const bh = (profile[i] / 255) * (h - 6);
            specCtx.fillStyle = `rgba(0,255,255,${0.25 + 0.75 * (profile[i] / 255)})`;
            specCtx.fillRect(i * barW + 1, h - bh, Math.max(1, barW - 1), bh);
          }
        }

        if (sgramCtx && sgramRef.current) {
          const { profile } = dBProfile(frame.db, minBin, maxBin, SPECTRUM_BUCKETS);
          history.copyWithin(0, SPECTRUM_BUCKETS);
          for (let i = 0; i < SPECTRUM_BUCKETS; i++) {
            history[history.length - SPECTRUM_BUCKETS + i] = profile[i];
          }
          const w = sgramRef.current.width;
          const h = sgramRef.current.height;
          const colW = w / SPECTRUM_BUCKETS;
          const rowH = h / SPECTROGRAM_ROWS;
          sgramCtx.fillStyle = '#050505';
          sgramCtx.fillRect(0, 0, w, h);
          for (let row = 0; row < SPECTROGRAM_ROWS; row++) {
            for (let col = 0; col < SPECTRUM_BUCKETS; col++) {
              const v = history[row * SPECTRUM_BUCKETS + col] / 255;
              if (v < 0.02) continue;
              sgramCtx.fillStyle = `rgba(0,200,255,${v.toFixed(2)})`;
              sgramCtx.fillRect(col * colW, h - (row + 1) * rowH, Math.max(1, colW), Math.max(1, rowH));
            }
          }
        }

        const now = performance.now();
        if (now - lastStatsTick.current > 150) {
          lastStatsTick.current = now;
          setStats(frame);
          setLevelDb(level);
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      stop();
      setStatus('denied');
      setError('Permiso de micrófono denegado o sin dispositivo de audio.');
    }
  }, [stop]);

  const handleToggle = () => {
    if (status === 'running') {
      stop();
      setStatus('idle');
      setStats(null);
      setLevelDb(null);
    } else {
      start();
    }
  };

  const bands = useMemo(() => (stats ? FREQ_BANDS.map((b) => stats.bandEnergy.find((be) => be.name === b.name)) : []), [stats]);

  return (
    <section
      className={
        'rounded-xl border p-3 flex flex-col gap-2 ' +
        (status === 'running' ? 'border-gray-600' : 'border-gray-800 bg-gray-900/40')
      }
      style={
        status === 'running'
          ? {
              borderColor: NEON.secondary,
              background: `linear-gradient(160deg, rgba(0,255,255,0.08), rgba(10,10,10,0.7))`,
              boxShadow: `0 0 24px ${NEON.secondary}33`
            }
          : undefined
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-100">
            {status === 'running' ? (
              <span style={{ color: NEON.secondary }}>LIVE · </span>
            ) : (
              'INSTRUMENTO · '
            )}
            ANÁLISIS ESPECTRAL
          </h3>
          <p className="text-[10px] text-gray-500">
            primer instrumento científico real · FFT radix-2 N=4096 · ventana Hann · STFT en vivo
          </p>
        </div>
        <div className="flex items-center gap-2">
          {signal && <HonestyBadge estado={signal.estado} confidence={null} />}
          <button
            type="button"
            onClick={handleToggle}
            className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
            style={{
              backgroundColor: status === 'running' ? NEON.alert : NEON.primary,
              color: '#0a0a0a'
            }}
          >
            {status === 'running' ? 'Detener' : 'Iniciar adquisición'}
          </button>
        </div>
      </div>

      {status === 'idle' && (
        <p className="text-xs text-gray-400 border border-dashed border-gray-700 rounded-lg p-3">
          El instrumento captura el micrófono local (S30 · REAL-LOCAL), aplica su propio motor FFT y
          entrega espectro, espectrograma y métricas espectrales. TelecomLab sigue siendo el productor;
          este instrumento lee y analiza. El registro en Ledger/KH permanece en DISEÑO (F3E).
        </p>
      )}

      {(status === 'denied' || status === 'unsupported') && (
        <p className="text-xs text-red-400 border border-red-900 rounded-lg p-3">
          {error}
        </p>
      )}

      {status === 'running' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Señal en el tiempo</span>
                <span className="text-[10px] font-mono" style={{ color: NEON.secondary }}>
                  {levelDb === null ? '—' : `${levelDb.toFixed(1)} dBFS`}
                </span>
              </div>
              <canvas ref={waveRef} width={720} height={120} style={canvasStyle(120)} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Espectro (20 Hz – Fs/2)</span>
                <span className="text-[10px] font-mono text-gray-500">{N_FFT} puntos</span>
              </div>
              <canvas ref={specRef} width={720} height={120} style={canvasStyle(120)} />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-500">Espectrograma STFT en vivo</span>
              <span className="text-[10px] font-mono" style={{ color: NEON.primary }}>
                {stats ? fmtHz(stats.dominantFrequency) : '—'} dominante
              </span>
            </div>
            <canvas ref={sgramRef} width={1440} height={180} style={canvasStyle(180)} />
          </div>

          {stats && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                <StatCell label="Frec. dominante" value={fmtHz(stats.dominantFrequency)} />
                <StatCell label="Pico" value={fmtDb(stats.peakDb)} color={NEON.alert} />
                <StatCell label="Centroide espectral" value={fmtHz(stats.spectralCentroid)} color={NEON.secondary} />
                <StatCell label="Planura" value={stats.spectralFlatness.toFixed(3)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {bands.map((b) => (
                  <div key={b?.name || b} className="rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2">
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500">{b?.name}</span>
                      <span className="text-[10px] font-mono text-gray-400">{(b?.pct * 100 || 0).toFixed(1)}%</span>
                    </div>
                    <div className="text-xs font-mono mt-0.5" style={{ color: NEON.primary }}>
                      pico {fmtHz(b?.peakHz)} · {fmtDb(b?.peakDb)}
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-800 mt-1 overflow-hidden">
                      <div
                        className="h-full"
                        style={{ width: `${Math.min(100, (b?.pct || 0) * 100)}%`, backgroundColor: NEON.primary }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">Rasgos para IA</span>
                  <HonestyBadge estado="DISENO" confidence={null} showConfidence={false} />
                </div>
                <p className="text-[11px] text-gray-400 mt-1 font-mono">
                  {fmtHz(stats.dominantFrequency)} · C={fmtHz(stats.spectralCentroid)} · F={stats.spectralFlatness.toFixed(3)} · las bandas
                  de energía alimentarían S35/S80 (modelado predictor = DISEÑO, Signal Map).
                </p>
              </div>
            </>
          )}

          <div className="mt-2 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-500">
                Envelope evidencia (S30 · REAL-LOCAL)
              </span>
              <span className="text-[10px] text-gray-500">registro Ledger/KH = DISEÑO (F3E) · cero escritura</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-1 font-mono">
              method: fft-hann-4096 · produced_by: instrumento-espectral-cmsc-v4 · ts: {timestamp}
            </div>
            {docs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {docs.slice(0, 3).map((d) => (
                  <Link
                    key={d.id}
                    to={d.route}
                    className="text-[11px] px-2 py-1 rounded border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
                  >
                    {d.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default SpectralAnalysisInstrument;