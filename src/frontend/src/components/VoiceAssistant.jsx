import React, { useEffect, useMemo, useRef, useState } from 'react';
import { VOICE_ASSIST_BASE, buildVoiceContext, postVoiceAudio } from '../services/voiceContext.js';
import { useVisionEvidence } from '../services/visionEvidence.js';
import { useLabStore } from '../stores/useLabStore.js';

// S62 /assist: en dev usa el servicio IA local (:8081); en build se normaliza a
// relativo (P2) para no hornear localhost en el artefacto desplegable.
// La resolucion vive en voiceContext.js para que widget y hook usen la misma base.
const API_BASE = VOICE_ASSIST_BASE;

const pickMimeType = () => {
  for (const type of ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return 'audio/webm';
};

/** Reproduce la respuesta y libera el ObjectURL al terminar o al desmontar. */
const playVoiceAudio = (blob, urlsRef) => {
  const url = URL.createObjectURL(blob);
  if (urlsRef) urlsRef.current.add(url);
  const audio = new Audio(url);
  const release = () => {
    URL.revokeObjectURL(url);
    if (urlsRef) urlsRef.current.delete(url);
  };
  audio.addEventListener('ended', release, { once: true });
  audio.addEventListener('error', release, { once: true });
  return audio.play().catch((playError) => {
    release();
    throw playError;
  });
};

const useVoiceCapture = ({ onNavigate } = {}) => {
  // Selectores ligeros: solo la rama viva S35 y el snapshot de vision.
  // Ninguno de los dos stores se modifica desde aqui.
  const mathLiveSignal = useLabStore((state) => state.mathLiveSignal);
  const visionEvidence = useVisionEvidence();
  const context = useMemo(
    () => buildVoiceContext({ signal: mathLiveSignal, vision: visionEvidence }),
    [mathLiveSignal, visionEvidence]
  );

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [trace, setTrace] = useState(null);
  const [navigatedTo, setNavigatedTo] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioUrls = useRef(new Set());

  useEffect(() => () => {
    const urls = audioUrls.current;
    urls.forEach((url) => URL.revokeObjectURL(url));
    urls.clear();
  }, []);

  const start = async () => {
    audioChunks.current = [];
    setError(null);
    setTrace(null);
    setNavigatedTo(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      console.log(`🎙️ Usando formato de grabación: ${mimeType}`);
      mediaRecorder.current = new MediaRecorder(stream, { mimeType });
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) audioChunks.current.push(event.data);
      };
      mediaRecorder.current.start(500);
      setIsListening(true);
    } catch (err) {
      console.error('❌ Error al abrir micrófono:', err);
      setIsListening(false);
      // L-4: el fallo se declara junto al botón (antes solo había un alert bloqueante).
      setError('Micrófono no disponible: revise los permisos del navegador.');
    }
  };

  const stop = () => {
    if (!mediaRecorder.current || !isListening) return;
    mediaRecorder.current.onstop = async () => {
      setIsProcessing(true);
      try {
        if (audioChunks.current.length === 0) {
          setError('No se capturó audio. Intente de nuevo.');
          return;
        }

        const mimeType = mediaRecorder.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        console.log(`📤 Enviando ${audioBlob.size} bytes (${mimeType}) a ${API_BASE}/assist con contexto ${context.version}`);

        const result = await postVoiceAudio({
          audioBlob,
          mimeType,
          context,
          onNavigate,
        });
        setTrace(result.trace);
        setNavigatedTo(result.navigatedTo);
        setError(null);
        try {
          await playVoiceAudio(result.audio, audioUrls);
        } catch {
          setError('Respuesta recibida; el navegador bloqueó la reproducción automática.');
        }
      } catch (err) {
        console.error('❌ Fallo del asistente de voz:', err);
        setError(err?.message || 'Asistente de voz no disponible: sin conexión con el servicio.');
        if (err?.trace) setTrace(err.trace);
      } finally {
        setIsProcessing(false);
        audioChunks.current = [];
      }
    };

    mediaRecorder.current.stop();
    setIsListening(false);
    mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
  };

  return {
    isListening,
    isProcessing,
    error,
    setError,
    trace,
    navigatedTo,
    context,
    toggle: () => (isListening ? stop() : start()),
  };
};

const TracePanel = ({ trace, navigatedTo }) => {
  if (!trace) return null;
  const rows = [
    ['MODO', trace.mode],
    ['LLM', `${trace.llmUsed ? 'usado' : 'no usado'} · ${trace.llmStatus}`],
    ['CONTEXTO', trace.contextStatus],
    ['INTENCIÓN', trace.intent],
    ['RUTA', navigatedTo || (trace.navigate ? 'propuesta no aceptada' : 'sin navegación')],
  ];
  // Trazas del clip local (X-SIGCT-Clip-*): solo cuando el servicio las devolvió.
  if (trace.clipStatus && trace.clipStatus !== 'absent') {
    rows.push(['CLIP', `${trace.clipStatus} · ${trace.clipFrames || '—'} frames`]);
    if (trace.clipMotion) rows.push(['MOVIMIENTO', trace.clipMotion]);
    if (trace.clipSha256) rows.push(['CLIP SHA', String(trace.clipSha256).slice(0, 12)]);
  }
  return (
    <div className="max-w-[260px] rounded-lg border border-cyan-800/60 bg-gray-900/95 px-3 py-2 text-[10px] leading-snug text-gray-300 shadow-lg">
      <div className="mb-1 font-semibold uppercase tracking-widest text-cyan-400">S62 · traza</div>
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-2">
          <span className="shrink-0 text-gray-500">{label}</span>
          <span className="truncate text-right font-mono" title={String(value)}>{value || '—'}</span>
        </div>
      ))}
      {trace.transcript && (
        <div className="mt-1 border-t border-gray-800 pt-1 text-gray-400" title={trace.transcript}>
          Escuché: {trace.transcript.slice(0, 90)}
        </div>
      )}
    </div>
  );
};

const VoiceAssistant = ({ onNavigate } = {}) => {
  const voice = useVoiceCapture({ onNavigate });

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {voice.error && (
        <div
          role="alert"
          className="max-w-[260px] flex items-start gap-2 rounded-lg border border-amber-500/60 bg-gray-900/95 px-3 py-2 text-[11px] leading-snug text-amber-200 shadow-lg"
        >
          <span className="flex-1">{voice.error}</span>
          <button
            onClick={() => voice.setError(null)}
            className="shrink-0 text-gray-400 hover:text-white"
            aria-label="Descartar aviso"
          >
            ✕
          </button>
        </div>
      )}
      <TracePanel trace={voice.trace} navigatedTo={voice.navigatedTo} />
      <button
        onClick={voice.toggle}
        disabled={voice.isProcessing}
        className={`w-16 h-16 rounded-full border-2 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
          voice.isListening ? 'bg-red-600 animate-pulse border-white' :
          voice.isProcessing ? 'bg-yellow-600 border-yellow-400' : 'bg-gray-900 border-cyan-400'
        }`}
      >
        <span className="text-white text-xl">{voice.isProcessing ? '⏳' : voice.isListening ? '⏹️' : '🎤'}</span>
      </button>
    </div>
  );
};

export default VoiceAssistant;
// Reutilización aditiva para CMSC_V7_LOWER_HALF_ACTIVATION · mismo /assist real (S62).
// Sin cambios sobre el componente flotante: solo un hook compartido para la celda ACP.
export function useAiVoiceAssist() {
  const voice = useVoiceCapture();
  return {
    isListening: voice.isListening,
    isProcessing: voice.isProcessing,
    error: voice.error,
    trace: voice.trace,
    mode: voice.trace?.mode || 'KEYWORD_RULE',
    llmUsed: voice.trace?.llmUsed === true,
    contextStatus: voice.trace?.contextStatus || 'absent',
    toggle: voice.toggle,
  };
}
