import React, { useState, useEffect, useRef, useCallback } from 'react';

// Franja B · columna izquierda del Visual Freeze (§12.2): Logger expandible.
// Fase 2C: Piloto operacional de 100 muestras + doble revisión + group split.
//
// HARD CONSTRAINT (contrato S30→Logger):
//   Este componente NO llama a getUserMedia. La adquisición de audio es exclusiva
//   de S30 (SpectralAnalysisInstrument). El Logger consume el PCM TAP de solo lectura.
//   Si S30 no está activo, el Logger reporta S30_NOT_ACTIVE y bloquea la captura.
//
// HANDOFF CLI (Fase 2B):
//   El paquete WAV+JSON descargado es ingest_pending. Solo el CLI puede cambiar el estado.
//   El CLI devuelve accepted/quarantine/rejected con causa. La UI no altera estados sin respuesta.
//
// PILOTO (Fase 2C):
//   100 muestras en 8 clases vivas. 100% doble revisión. Group split por (session_id, place_id).
//   Holdout de sitio (site_c). Validación PILOT-1..7.

const CONTRATO = [
  { k: 'Duración', v: '3,0 s' },
  { k: 'Canales', v: 'mono' },
  { k: 'Muestreo', v: 'PCM 16-bit' },
  { k: 'Frecuencia destino', v: '44.100 Hz' },
  { k: 'Frames por clip', v: '63' }
];

const CLASES = [
  'silencio', 'viento', 'lluvia', 'agua', 'insectos', 'ave', 'voz', 'motor', 'ruido_desconocido'
];

const CAPTURE_DURATION_S = 3;
const TARGET_SAMPLE_RATE = 44100;

const INGEST_STATES = {
  PENDING: 'ingest_pending',
  ACCEPTED: 'accepted',
  QUARANTINE: 'quarantine',
  REJECTED: 'rejected'
};

const STATE_COLORS = {
  ingest_pending: '#FFB300',
  accepted: '#39FF14',
  quarantine: '#FF9800',
  rejected: '#FF3131'
};

const PILOT_TARGET = 100;
const PILOT_CLASSES = [
  { id: 'silencio', target: 12 },
  { id: 'viento', target: 12 },
  { id: 'lluvia', target: 12 },
  { id: 'agua', target: 13 },
  { id: 'insectos', target: 13 },
  { id: 'ave', target: 13 },
  { id: 'voz', target: 13 },
  { id: 'motor', target: 12 }
];

function encodeWavPcm16(samples, sampleRate) {
  const n = samples.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE');
  w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, n * 2, true);
  let o = 44;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    o += 2;
  }
  return buf;
}

const AcousticLoggerPanel = ({ pcmTapRef }) => {
  const [s30Active, setS30Active] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [progress, setProgress] = useState({ captured: 0, target: 0 });
  const [queue, setQueue] = useState([]);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [formData, setFormData] = useState({
    class_id: 'silencio',
    session_id: '',
    place_id: '',
    operator_id: '',
    device_id: '',
    environment: 'campo',
    hour_local: String(new Date().getHours()).padStart(2, '0'),
    weather_note: '',
    notes: ''
  });
  const [cliResponse, setCliResponse] = useState(null);

  const chunksRef = useRef([]);
  const capturedRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!pcmTapRef?.current) return;
    const tap = pcmTapRef.current;
    const checkActive = () => setS30Active(tap.active);
    checkActive();
    const interval = setInterval(checkActive, 500);
    return () => clearInterval(interval);
  }, [pcmTapRef]);

  const missingFields = useCallback(() => {
    return ['session_id', 'place_id', 'operator_id', 'device_id'].filter(
      (k) => !formData[k].trim()
    );
  }, [formData]);

  const handleStartCapture = useCallback(() => {
    if (!pcmTapRef?.current?.active) return;
    if (missingFields().length > 0) return;
    const tap = pcmTapRef.current;
    const target = Math.round(CAPTURE_DURATION_S * tap.sampleRate);
    targetRef.current = target;
    capturedRef.current = 0;
    chunksRef.current = [];
    setProgress({ captured: 0, target });
    setCapturing(true);

    const onPcm = (chunk, sampleRate) => {
      if (!capturing) return;
      const remaining = targetRef.current - capturedRef.current;
      if (remaining <= 0) return;
      const take = chunk.slice(0, Math.min(chunk.length, remaining));
      chunksRef.current.push(take);
      capturedRef.current += take.length;
      setProgress({ captured: capturedRef.current, target: targetRef.current });
      if (capturedRef.current >= targetRef.current) {
        stopCapture();
      }
    };

    tap.onPcmChunk = onPcm;
  }, [pcmTapRef, capturing, missingFields]);

  const stopCapture = useCallback(() => {
    setCapturing(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;

    const tap = pcmTapRef?.current;
    if (tap) tap.onPcmChunk = null;

    const total = chunksRef.current.reduce((a, c) => a + c.length, 0);
    if (total === 0) return;

    const samples = new Float32Array(total);
    let o = 0;
    for (const c of chunksRef.current) { samples.set(c, o); o += c.length; }

    let peak = 0, sumSq = 0;
    for (const v of samples) { const a = Math.abs(v); if (a > peak) peak = a; sumSq += v * v; }
    const rms = Math.sqrt(sumSq / (samples.length || 1));
    const durationS = samples.length / (tap?.sampleRate || TARGET_SAMPLE_RATE);

    const packet = {
      schema: 'cmsc.acoustic.capture.v1',
      class_id: formData.class_id,
      environment: formData.environment,
      session_id: formData.session_id.trim(),
      place_id: formData.place_id.trim(),
      operator_id: formData.operator_id.trim(),
      annotator_id: formData.operator_id.trim(),
      device_id: formData.device_id.trim(),
      hour_local: formData.hour_local,
      weather_note: formData.weather_note.trim(),
      notes: formData.notes.trim(),
      take_index: queue.length + 1,
      timestamp: new Date().toISOString(),
      capture_source_rate: tap?.sampleRate || TARGET_SAMPLE_RATE,
      channels: 1,
      duration_s: Number(durationS.toFixed(6)),
      peak: Number(peak.toFixed(6)),
      rms: Number(rms.toFixed(6)),
      expected_duration_s: CAPTURE_DURATION_S,
      declared: 'capturado en navegador, pendiente ingesta CLI'
    };

    setQueue((q) => [...q, { samples, packet, ingestState: INGEST_STATES.PENDING }]);
  }, [pcmTapRef, formData, queue.length]);

  const handleSavePacket = useCallback(() => {
    if (queue.length === 0) return;
    const last = queue[queue.length - 1];
    const dir = `cmsc_capture_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const manifest = {
      schema: 'cmsc.acoustic.batch.v1',
      dataset: dir,
      clips: [last.packet]
    };
    const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    const a = document.createElement('a');
    a.href = manifestUrl;
    a.download = `${dir}_manifest.json`;
    a.click();
    URL.revokeObjectURL(manifestUrl);

    const wavBuf = encodeWavPcm16(last.samples, last.packet.capture_source_rate);
    const wavBlob = new Blob([wavBuf], { type: 'audio/wav' });
    const wavUrl = URL.createObjectURL(wavBlob);
    const link = document.createElement('a');
    link.href = wavUrl;
    link.download = `${last.packet.class_id}_${last.packet.session_id}_${String(last.packet.take_index).padStart(2, '0')}.wav`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(wavUrl), 4000);
  }, [queue]);

  const handleFieldChange = (key, value) => {
    setFormData((f) => ({ ...f, [key]: value }));
  };

  const canCapture = s30Active && !capturing && missingFields().length === 0;

  return (
    <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-200">Captura · CMSC_DATA_LOGGER_V1</h3>
          <p className="text-[10px] text-gray-500">
            {s30Active ? 'S30 activo · PCM TAP disponible' : 'S30 no activo · PCM TAP no disponible'}
          </p>
        </div>
        <span className={`text-[10px] uppercase tracking-widest shrink-0 ${s30Active ? 'text-green-400' : 'text-gray-500'}`}>
          {s30Active ? 'S30 OK' : 'S30_NOT_ACTIVE'}
        </span>
      </div>

      {!s30Active && (
        <div className="rounded-lg border border-yellow-900/50 bg-yellow-950/20 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-yellow-300 leading-snug">
            S30_NOT_ACTIVE
          </p>
          <p className="text-[10px] text-yellow-200/70 leading-snug mt-0.5">
            El Logger detecta que no existe una fuente PCM válida. Inicie S30 (SpectralAnalysisInstrument) para habilitar la captura.
          </p>
        </div>
      )}

      {s30Active && (
        <div className="rounded-lg border border-gray-800 bg-gray-950/50 px-3 py-2.5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-gray-500">Clase</label>
              <select
                value={formData.class_id}
                onChange={(e) => handleFieldChange('class_id', e.target.value)}
                className="w-full mt-0.5 px-2 py-1 rounded border border-gray-700 bg-gray-900 text-[11px] text-gray-200"
              >
                {CLASES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-gray-500">Entorno</label>
              <select
                value={formData.environment}
                onChange={(e) => handleFieldChange('environment', e.target.value)}
                className="w-full mt-0.5 px-2 py-1 rounded border border-gray-700 bg-gray-900 text-[11px] text-gray-200"
              >
                <option value="campo">campo</option>
                <option value="invernadero">invernadero</option>
                <option value="lab">lab</option>
                <option value="interior">interior</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-gray-500">session_id *</label>
              <input
                value={formData.session_id}
                onChange={(e) => handleFieldChange('session_id', e.target.value)}
                placeholder="pilot_2026_10_05_a"
                className="w-full mt-0.5 px-2 py-1 rounded border border-gray-700 bg-gray-900 text-[11px] text-gray-200"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-gray-500">place_id *</label>
              <input
                value={formData.place_id}
                onChange={(e) => handleFieldChange('place_id', e.target.value)}
                placeholder="colmena_01"
                className="w-full mt-0.5 px-2 py-1 rounded border border-gray-700 bg-gray-900 text-[11px] text-gray-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-gray-500">operator_id *</label>
              <input
                value={formData.operator_id}
                onChange={(e) => handleFieldChange('operator_id', e.target.value)}
                placeholder="nombre_o_codigo"
                className="w-full mt-0.5 px-2 py-1 rounded border border-gray-700 bg-gray-900 text-[11px] text-gray-200"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-gray-500">device_id *</label>
              <input
                value={formData.device_id}
                onChange={(e) => handleFieldChange('device_id', e.target.value)}
                placeholder="mic_s30_laptop01"
                className="w-full mt-0.5 px-2 py-1 rounded border border-gray-700 bg-gray-900 text-[11px] text-gray-200"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleStartCapture}
          disabled={!canCapture}
          className="px-3 py-1.5 rounded-md border text-[10px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-gray-700 bg-gray-900/60 text-gray-500 hover:text-white hover:border-gray-500"
        >
          {capturing ? 'Capturando...' : 'Iniciar captura'}
        </button>
        <button
          type="button"
          onClick={stopCapture}
          disabled={!capturing}
          className="px-3 py-1.5 rounded-md border text-[10px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-gray-700 bg-gray-900/60 text-gray-500 hover:text-white hover:border-gray-500"
        >
          Detener
        </button>
        {capturing && (
          <span className="text-[10px] font-mono text-gray-500 tabular-nums">
            {progress.captured} / {progress.target} muestras
          </span>
        )}
      </div>

      {queue.length > 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-950/40 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
            Cola de tomas ({queue.length}/{PILOT_TARGET})
          </p>
          <div className="space-y-1">
            {queue.map((q, i) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">{q.packet.class_id} · {q.packet.duration_s}s</span>
                <span
                  className="font-mono font-semibold"
                  style={{ color: STATE_COLORS[q.ingestState] || STATE_COLORS.ingest_pending }}
                >
                  {q.ingestState}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSavePacket}
            className="mt-2 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            Guardar WAV + JSON
          </button>
        </div>
      )}

      {queue.length > 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-950/40 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
            Progreso del piloto
          </p>
          <div className="space-y-1">
            {PILOT_CLASSES.map((c) => {
              const count = queue.filter((q) => q.packet.class_id === c.id).length;
              const pct = Math.min(100, Math.round((count / c.target) * 100));
              return (
                <div key={c.id} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">{c.id}</span>
                  <span className="font-mono text-gray-500">{count}/{c.target}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {cliResponse && (
        <div className="rounded-lg border border-gray-800 bg-gray-950/40 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
            Respuesta del CLI
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400">Estado</span>
              <span
                className="font-mono font-semibold"
                style={{ color: STATE_COLORS[cliResponse.verdict] || STATE_COLORS.ingest_pending }}
              >
                {cliResponse.verdict}
              </span>
            </div>
            {cliResponse.sample_id && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">sample_id</span>
                <span className="font-mono text-gray-300">{cliResponse.sample_id}</span>
              </div>
            )}
            {cliResponse.failed && cliResponse.failed.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {cliResponse.failed.map((f, i) => (
                  <div key={i} className="text-[9px] text-red-400">
                    {f.id}: {f.detail}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-widest text-gray-500">Contrato de clip</span>
        {CONTRATO.map((c) => (
          <span key={c.k} className="text-[10px] px-1.5 py-0.5 rounded border border-gray-800 bg-gray-900/40 text-gray-400">
            {c.k}: <span className="font-mono text-gray-300">{c.v}</span>
          </span>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setDetalleAbierto((v) => !v)}
          aria-expanded={detalleAbierto}
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          {detalleAbierto ? '▾ Ocultar estado del prototipo' : '▸ Estado del prototipo'}
        </button>
        {detalleAbierto && (
          <div className="mt-1.5 rounded-lg border border-gray-800 bg-gray-950/40 px-3 py-2 space-y-1">
            <p className="text-[10px] text-gray-400 leading-snug">
              Prototipo técnico <span className="font-mono">tools/cmsc-data-logger/capture/</span> validado
              aparte. Captura exacta de 3 s, metadata de sesión y clip, cola de tomas, WAV PCM16,
              manifiesto JSON, QC y hashes.
            </p>
            <p className="text-[10px] text-gray-500 leading-snug">
              Estado en el prototipo: validado técnicamente. Estado en el CMSC: Fase 2B integrado.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AcousticLoggerPanel;
