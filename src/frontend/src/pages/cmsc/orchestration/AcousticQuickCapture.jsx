import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BRIDGE_URL,
  bridgeHealth,
  postIngest,
  encodeWavPcm16,
  getLastFeatures
} from './acousticBridge.js';
import AcousticFirstResultCard from './AcousticFirstResultCard.jsx';
import { ALL_CLASSES } from '../../../../../../tools/cmsc-data-logger/src/constants.js';

// MODO CAPTURA RÁPIDA · SIGCTIARURAL_ACOUSTIC_QUICK_CAPTURE_IMPLEMENTATION_V1
// Componente ADITIVO. No sustituye a AcousticLoggerPanel, AcousticDatasetPanel ni
// AcousticFirstResultCard. Reutiliza el MISMO postIngest() del puente, por lo que el
// sample_id lo sigue creando ingestWav() y la trazabilidad del dataset es idéntica.
//
// Los cuatro campos NO desaparecen: se autocompletan aqui y viajan en el manifiesto.
// El modo experto (OrchestrationZoneV2) sigue usando los componentes originales intactos.
//
// TAXONOMÍA: los 5 botones son ACCESOS RÁPIDOS, no un filtro. `MÁS SONIDOS` abre el
// selector completo derivado de ALL_CLASSES (fuente de verdad del logger), por lo que
// cualquier clase existente —incluida `ruido_desconocido`— sigue siendo capturable.
// Una clase nueva en el contrato aparece sola; aquí no se duplica la taxonomía.

const SONIDOS = [
  { id: 'lluvia', etiqueta: '🌧 LLUVIA' },
  { id: 'voz', etiqueta: '🗣 VOZ' },
  { id: 'agua', etiqueta: '💧 AGUA' },
  { id: 'ave', etiqueta: '🐦 AVES' },
  { id: 'insectos', etiqueta: '🐝 INSECTOS' }
];

const ETIQUETAS_CLASE = Object.freeze({
  silencio: '🔇 SILENCIO',
  viento: '💨 VIENTO',
  lluvia: '🌧 LLUVIA',
  agua: '💧 AGUA',
  insectos: '🐝 INSECTOS',
  ave: '🐦 AVES',
  voz: '🗣 VOZ',
  motor: '⚙️ MOTOR',
  ruido_desconocido: '❓ RUIDO DESCONOCIDO'
});

const TODAS_LAS_CLASES = ALL_CLASSES.map((id) => ({
  id,
  etiqueta: ETIQUETAS_CLASE[id] || id.replace(/_/g, ' ').toUpperCase()
}));

// Renombrado EXCLUSIVO del modo rápido (el modo experto conserva sus textos).
const ETIQUETAS = Object.freeze({
  sinPuente: 'No se puede guardar todavía',
  sinMicrofono: 'Activa el micrófono para capturar',
  guardando: 'Guardando...',
  guardado: 'Guardado',
  sinRegla: 'Todavía no se reconoce el sonido',
  guardarGrabacion: 'Guardar grabación'
});

const CAPTURE_DURATION_S = 3;
const CAPTURE_TIMEOUT_MS = 10000;
const pad = (n) => String(n).padStart(2, '0');

function defaultsDeCaptura() {
  const d = new Date();
  return {
    session_id: `ses_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`,
    place_id: 'campo_01',
    operator_id: 'operador_local',
    device_id: 'mic_s30_browser',
    environment: 'campo',
    hour_local: pad(d.getHours())
  };
}

const AcousticQuickCapture = () => {
  const [sonido, setSonido] = useState(null);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [fase, setFase] = useState('idle'); // idle | capturando | guardando | guardado | error
  const [muestras, setMuestras] = useState(0);
  const [objetivo, setObjetivo] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [sampleId, setSampleId] = useState(null);
  const [bridgeUp, setBridgeUp] = useState(null);
  const [liveRow, setLiveRow] = useState(null);
  const [verResultado, setVerResultado] = useState(false);

  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const capturandoRef = useRef(false);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const up = await bridgeHealth();
      if (alive) setBridgeUp(up);
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const cerrarAudio = useCallback(() => {
    capturandoRef.current = false;
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* best-effort */ }
    streamRef.current = null;
    try { ctxRef.current?.close(); } catch { /* best-effort */ }
    ctxRef.current = null;
  }, []);

  useEffect(() => () => cerrarAudio(), [cerrarAudio]);

  // CLIC 2: graba 3 s y guarda automaticamente por el mismo POST /ingest del experto.
  const capturar = useCallback(async () => {
    if (fase === 'capturando' || fase === 'guardando') return;
    if (!sonido) { setMensaje('Elige un sonido para capturar'); return; }
    if (bridgeUp === false) { setMensaje(ETIQUETAS.sinPuente); return; }
    if (bridgeUp === null) { setMensaje('Comprobando si se puede guardar…'); return; }

    setMensaje('');
    setSampleId(null);
    setLiveRow(null);
    setVerResultado(false);

    let audioCtx = null;
    let source = null;
    let proc = null;
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error(ETIQUETAS.sinMicrofono);
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = audioCtx;
      source = audioCtx.createMediaStreamSource(stream);
      proc = audioCtx.createScriptProcessor(4096, 1, 1);

      const chunks = [];
      const target = Math.round(CAPTURE_DURATION_S * audioCtx.sampleRate);
      setObjetivo(target);
      setMuestras(0);
      capturandoRef.current = true;
      setFase('capturando');

      proc.onaudioprocess = (ev) => {
        if (!capturandoRef.current) return;
        const input = ev.inputBuffer.getChannelData(0);
        const llevadas = chunks.reduce((a, c) => a + c.length, 0);
        const falta = target - llevadas;
        if (falta <= 0) return;
        chunks.push(new Float32Array(input.slice(0, Math.min(input.length, falta))));
        const total = llevadas + chunks[chunks.length - 1].length;
        setMuestras(total);
        if (total >= target) capturandoRef.current = false;
      };
      // R1 FIX · SIGCTIARURAL_ACOUSTIC_QUICK_CAPTURE_REGRESSION_FIX_V1
      // El ScriptProcessorNode solo procesa si su salida llega a destination. Un
      // GainNode huérfano (sin conectar a destination) deja el grafo sin "tirar" y
      // onaudioprocess dispara 0 veces: la captura terminaba sin muestras.
      // Ganancia 0 = silencio en altavoces (sin realimentación); el PCM se lee
      // ÚNICAMENTE desde inputBuffer, nunca desde el canal de salida.
      const silencio = audioCtx.createGain();
      silencio.gain.value = 0;
      source.connect(proc);
      proc.connect(silencio);
      silencio.connect(audioCtx.destination);

      const deadline = Date.now() + CAPTURE_TIMEOUT_MS;
      while (capturandoRef.current && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (capturandoRef.current) throw new Error(ETIQUETAS.sinMicrofono);

      proc.onaudioprocess = null;
      try { source.disconnect(); proc.disconnect(); } catch { /* best-effort */ }

      const total = chunks.reduce((a, c) => a + c.length, 0);
      if (!total) throw new Error(ETIQUETAS.sinMicrofono);
      const samples = new Float32Array(total);
      let o = 0;
      for (const c of chunks) { samples.set(c, o); o += c.length; }
      let peak = 0;
      let sumSq = 0;
      for (const v of samples) {
        const a = Math.abs(v);
        if (a > peak) peak = a;
        sumSq += v * v;
      }

      const d = defaultsDeCaptura();
      const packet = {
        schema: 'cmsc.acoustic.capture.v1',
        class_id: sonido,
        environment: d.environment,
        session_id: d.session_id,
        place_id: d.place_id,
        operator_id: d.operator_id,
        annotator_id: d.operator_id,
        device_id: d.device_id,
        hour_local: d.hour_local,
        notes: 'captura rápida · guardado automático',
        take_index: 1,
        timestamp: new Date().toISOString(),
        capture_source_rate: audioCtx.sampleRate,
        channels: 1,
        duration_s: Number((total / audioCtx.sampleRate).toFixed(6)),
        peak: Number(peak.toFixed(6)),
        rms: Number(Math.sqrt(sumSq / total).toFixed(6)),
        expected_duration_s: CAPTURE_DURATION_S,
        declared: 'capturado en navegador, pendiente ingesta CLI'
      };

      const wav = encodeWavPcm16(samples, audioCtx.sampleRate);
      cerrarAudio();

      setFase('guardando');
      setMensaje(ETIQUETAS.guardando);
      const res = await postIngest(wav, packet);
      if (!res.ok) {
        setFase('error');
        setMensaje(res.error || 'No se pudo guardar la grabación');
        return;
      }
      setSampleId(res.sample_id ?? null);
      setFase('guardado');
      setMensaje(ETIQUETAS.guardado);
    } catch (e) {
      cerrarAudio();
      setFase('error');
      setMensaje(e?.name === 'NotAllowedError' ? ETIQUETAS.sinMicrofono : (e.message || ETIQUETAS.sinMicrofono));
    }
  }, [sonido, bridgeUp, fase, cerrarAudio]);

  // CLIC 3: lee la ultima fila REAL del dataset y la pasa a la tarjeta existente.
  const mostrarResultado = useCallback(async () => {
    try {
      const data = await getLastFeatures();
      if (data?.row) setLiveRow(data.row);
    } catch { /* conserva la ultima fila conocida; nunca inventa datos */ }
    setVerResultado(true);
  }, []);

  const estadoGuardado = bridgeUp === false
    ? ETIQUETAS.sinPuente
    : bridgeUp === null
      ? 'Comprobando…'
      : ETIQUETAS.guardarGrabacion;

  return (
    <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3 flex flex-col gap-2.5" aria-label="Captura rápida de sonido">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-200">Capturar sonido</h3>
          <p className="text-[10px] text-gray-500">Elige un sonido, captura y guarda. Sin campos ni opciones.</p>
        </div>
        <span
          className={`text-[10px] uppercase tracking-widest shrink-0 text-right ${bridgeUp ? 'text-green-400' : bridgeUp === false ? 'text-yellow-400' : 'text-gray-600'}`}
          title={bridgeUp ? `Puente local ${BRIDGE_URL}` : `Puente ${BRIDGE_URL} sin respuesta`}
        >
          {estadoGuardado}
        </span>
      </div>

      {/* CLIC 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {SONIDOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { setSonido(s.id); setMensaje(''); }}
            aria-pressed={sonido === s.id}
            className={`px-2 py-2.5 rounded-lg border text-[11px] font-semibold transition-colors ${
              sonido === s.id
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                : 'border-gray-700 bg-gray-900/60 text-gray-300 hover:border-gray-500'
            }`}
          >
            {s.etiqueta}
          </button>
        ))}
      </div>

      {/* Los 5 accesos rápidos NO restringen la taxonomía: el selector completo está
          a un clic y se deriva de ALL_CLASSES (incluye ruido_desconocido). */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMostrarTodas((v) => !v)}
          aria-expanded={mostrarTodas}
          aria-label="Ver todas las clases disponibles"
          className="px-2.5 py-1.5 rounded-lg border border-gray-700 bg-gray-900/60 text-gray-300 text-[10px] font-bold tracking-wider transition-colors hover:border-cyan-600 hover:text-cyan-200"
        >
          {mostrarTodas ? 'MENOS SONIDOS' : 'MÁS SONIDOS'}
        </button>
        {sonido && (
          <span className="text-[10px] text-cyan-300/80">
            Seleccionado: {(TODAS_LAS_CLASES.find((c) => c.id === sonido) || {}).etiqueta || sonido}
          </span>
        )}
      </div>

      {mostrarTodas && (
        <div className="rounded-lg border border-gray-800 bg-gray-950/40 p-2" aria-label="Selector completo de clases">
          <p className="text-[10px] text-gray-500 mb-2">
            Todas las clases del dataset · {TODAS_LAS_CLASES.length} disponibles
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {TODAS_LAS_CLASES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setSonido(c.id); setMensaje(''); }}
                aria-pressed={sonido === c.id}
                data-class-id={c.id}
                className={`px-2 py-1.5 rounded-md border text-[10px] font-semibold transition-colors ${
                  sonido === c.id
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                    : 'border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                {c.etiqueta}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CLIC 2 y CLIC 3 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={capturar}
          disabled={fase === 'capturando' || fase === 'guardando'}
          aria-label={ETIQUETAS.guardarGrabacion}
          className="px-4 py-2 rounded-lg border border-cyan-700 bg-cyan-950/40 text-cyan-200 text-[11px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyan-500"
        >
          {fase === 'capturando'
            ? `Grabando… ${muestras}/${objetivo}`
            : fase === 'guardando'
              ? ETIQUETAS.guardando
              : '● CAPTURAR'}
        </button>
        <button
          type="button"
          onClick={mostrarResultado}
          disabled={fase !== 'guardado'}
          className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-900/60 text-gray-300 text-[11px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-500"
        >
          VER RESULTADO
        </button>
      </div>

      {fase === 'capturando' && (
        <p className="text-[10px] text-cyan-300">Grabando 3 segundos…</p>
      )}
      {fase === 'guardando' && (
        <p className="text-[10px] text-cyan-300">{ETIQUETAS.guardando}</p>
      )}
      {fase === 'guardado' && (
        <div className="rounded-lg border border-green-800/60 bg-green-950/20 px-3 py-2">
          <p className="text-[11px] font-bold text-green-300">MUESTRA GUARDADA</p>
          <p className="text-[10px] text-green-200/70">
            {ETIQUETAS.guardado}{sampleId ? ` · ${sampleId}` : ''}
          </p>
        </div>
      )}
      {fase === 'error' && (
        <div className="rounded-lg border border-yellow-800/60 bg-yellow-950/20 px-3 py-2">
          <p className="text-[11px] font-semibold text-yellow-300">{mensaje}</p>
        </div>
      )}
      {fase === 'idle' && mensaje && (
        <p className="text-[10px] text-yellow-300">{mensaje}</p>
      )}

      {verResultado && (
        <div>
          <AcousticFirstResultCard liveRow={liveRow} quickMode />
        </div>
      )}
    </section>
  );
};

export default AcousticQuickCapture;
