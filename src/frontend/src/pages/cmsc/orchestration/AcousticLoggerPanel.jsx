import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BRIDGE_URL, bridgeHealth, postIngest, encodeWavPcm16 } from './acousticBridge.js';

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
  const [bridgeUp, setBridgeUp] = useState(null);
  const [ingesting, setIngesting] = useState(false);

  const chunksRef = useRef([]);
  const capturedRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef(0);
  const capturingRef = useRef(false);

  useEffect(() => {
    const checkActive = () => {
      if (pcmTapRef?.current) {
        setS30Active(pcmTapRef.current.active);
      }
    };
    checkActive();
    const interval = setInterval(checkActive, 500);
    return () => clearInterval(interval);
  }, [pcmTapRef]);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const up = await bridgeHealth();
      if (alive) setBridgeUp(up);
    };
    tick();
    const interval = setInterval(tick, 3000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

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
    capturingRef.current = true;

    const onPcm = (chunk, sampleRate) => {
      if (!capturingRef.current) return;
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
  }, [pcmTapRef, missingFields]);

  const stopCapture = useCallback(() => {
    setCapturing(false);
    capturingRef.current = false;
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
    const dir = `cmsc_capture_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const manifest = {
      schema: 'cmsc.acoustic.batch.v1',
      dataset: dir,
      clips: queue.map((q) => q.packet)
    };
    const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    const a = document.createElement('a');
    a.href = manifestUrl;
    a.download = `${dir}_manifest.json`;
    a.click();
    URL.revokeObjectURL(manifestUrl);

    queue.forEach((q) => {
      const wavBuf = encodeWavPcm16(q.samples, q.packet.capture_source_rate);
      const wavBlob = new Blob([wavBuf], { type: 'audio/wav' });
      const wavUrl = URL.createObjectURL(wavBlob);
      const link = document.createElement('a');
      link.href = wavUrl;
      link.download = `${q.packet.class_id}_${q.packet.session_id}_${String(q.packet.take_index).padStart(2, '0')}.wav`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(wavUrl), 4000);
    });
  }, [queue]);

  // Tramo B: ingesta real vía bridge local. El bridge ejecuta el MISMO motor que el CLI
  // (ingestWav) y devuelve su veredicto. La UI NUNCA inventa accepted/rejected.
  const handleIngest = useCallback(async () => {
    if (ingesting || queue.length === 0) return;
    setIngesting(true);
    setCliResponse(null);
    const batch = [];
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.ingestState !== INGEST_STATES.PENDING) continue;
      const wavBytes = encodeWavPcm16(item.samples, item.packet.capture_source_rate);
      const res = await postIngest(wavBytes, item.packet);
      batch.push(res);
      setQueue((q) =>
        q.map((it, idx) => {
          if (idx !== i) return it;
          const state = res.ok && res.verdict
            ? INGEST_STATES[String(res.verdict).toUpperCase()] || INGEST_STATES.PENDING
            : INGEST_STATES.PENDING;
          return { ...it, ingestState: state, serverResponse: res };
        })
      );
    }
    setCliResponse(batch[batch.length - 1] || { ok: false, error: 'sin tomas pendientes' });
    setIngesting(false);
  }, [queue, ingesting]);

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
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] uppercase tracking-widest shrink-0 ${s30Active ? 'text-green-400' : 'text-gray-500'}`}>
            {s30Active ? 'S30 OK' : 'S30_NOT_ACTIVE'}
          </span>
          <span
            className={`text-[10px] uppercase tracking-widest shrink-0 ${bridgeUp ? 'text-cyan-400' : bridgeUp === null ? 'text-gray-600' : 'text-yellow-400'}`}
            title={bridgeUp ? `Puente local ${BRIDGE_URL}` : `Puente ${BRIDGE_URL} sin respuesta`}
          >
            {bridgeUp ? 'PUENTE OK' : bridgeUp === null ? 'CONECTANDO…' : 'SIN_PUENTE'}
          </span>
        </div>
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
        <div className="rounded-lg border border-gray-800 bg-gray-950/50 px-3 py-2 space-y-2">
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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleIngest}
              disabled={!bridgeUp || ingesting || queue.length === 0}
              className="px-2.5 py-1 rounded-md border text-[10px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-cyan-800 bg-cyan-950/30 text-cyan-300 hover:text-cyan-100 hover:border-cyan-600"
            >
              {ingesting ? 'Ingiriendo…' : 'Ingresar al dataset'}
            </button>
            <button
              type="button"
              onClick={handleSavePacket}
              className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              Descargar paquete (WAV + JSON)
            </button>
          </div>
        </div>
      )}

      {queue.length > 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-950/40 px-2.5 py-1.5">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="uppercase tracking-widest text-gray-500">Progreso del piloto</span>
            <span className="font-mono text-gray-500">{queue.length}/{PILOT_TARGET}</span>
          </div>
          <div className="flex items-center gap-1">
            {PILOT_CLASSES.map((c) => {
              const count = queue.filter((q) => q.packet.class_id === c.id).length;
              const pct = Math.min(100, Math.round((count / c.target) * 100));
              return (
                <div
                  key={c.id}
                  className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden"
                  title={`${c.id}: ${count}/${c.target}`}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#39FF14' : '#00FFFF' }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {cliResponse && cliResponse.ok === false && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/20 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-red-400 mb-1">Error al ingresar</p>
          <p className="text-[10px] text-red-300 font-mono">
            {cliResponse.error}
            {cliResponse.reason ? ` · ${cliResponse.reason}` : ''}
          </p>
        </div>
      )}

      {cliResponse && cliResponse.ok && (
        <div className="rounded-lg border border-gray-800 bg-gray-950/40 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
            Respuesta del bridge (CLI ingest)
          </p>
          <div className="space-y-1">
            {cliResponse.dryRun && (
              <div className="text-[9px] text-yellow-400 font-mono">DRY RUN · no se escribió nada</div>
            )}
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
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400">features</span>
              <span className="font-mono text-gray-300">{cliResponse.features44} dims</span>
            </div>
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
