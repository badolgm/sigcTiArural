import React, { useState, useRef } from 'react';
import { resolveEndpoint } from '../config/endpoints.js';

// S62 /assist: en dev usa el servicio IA local (:8081); en build se normaliza a
// relativo (P2) para no hornear localhost en el artefacto desplegable.
const API_BASE = resolveEndpoint(
  import.meta.env.VITE_AI_API_BASE,
  import.meta.env.DEV ? 'http://localhost:8081' : ''
);

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // L-4 (2026-10-30): el fallo del asistente era solo `console.error`. Un canal que
  // falla en silencio no es auditable: ahora el error se declara en pantalla.
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    // 1. Limpieza absoluta antes de empezar
    audioChunks.current = [];
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Detectar el mejor tipo MIME soportado
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
      
      let selectedMimeType = 'audio/webm'; // Fallback
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }
      
      console.log(`🎙️ Usando formato de grabación: ${selectedMimeType}`);
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: selectedMimeType });
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
          console.log(`📦 Datos capturados: ${event.data.size} bytes`);
        }
      };

      // 2. CAMBIO VITAL: Solicitamos datos cada 500ms (no esperamos al final)
      mediaRecorder.current.start(500);
      setIsListening(true);
      console.log("🎙️ Micrófono activado y escuchando...");
    } catch (err) {
      console.error("❌ Error al abrir micrófono:", err);
      setIsListening(false);
      // L-4: el fallo se declara junto al botón (antes solo había un alert bloqueante).
      setError('Micrófono no disponible: revise los permisos del navegador.');
    }
  };

  const stopRecordingAndProcess = () => {
    if (mediaRecorder.current && isListening) {
      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true);
        
        // 3. Verificación de seguridad: ¿Hay audio?
        if (audioChunks.current.length === 0) {
          console.error("⚠️ El buffer de audio está vacío. Abortando...");
          setError('No se capturó audio. Intente de nuevo.');
          setIsProcessing(false);
          return;
        }

        // Usar el tipo MIME del recorder o fallback
        const mimeType = mediaRecorder.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        console.log(`📤 Enviando archivo de ${audioBlob.size} bytes (${mimeType}) a la IA...`);

        const formData = new FormData();
        // Extensión dinámica según el tipo
        const extension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
        formData.append("audio", audioBlob, `grabacion.${extension}`);

        try {
          const response = await fetch(`${API_BASE}/assist`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const resAudioBlob = await response.blob();
            console.log("✅ Respuesta de voz recibida del servidor.");
            const audioUrl = URL.createObjectURL(resAudioBlob);
            const audio = new Audio(audioUrl);
            
            // Forzamos la reproducción e indicamos éxito
            await audio.play();
            setError(null);
          } else {
            console.error("❌ Error en la IA:", response.statusText);
            setError(`Asistente de voz no disponible (HTTP ${response.status}).`);
          }
        } catch (error) {
          console.error("❌ Fallo de conexión:", error);
          setError('Asistente de voz no disponible: sin conexión con el servicio.');
        } finally {
          setIsProcessing(false);
          audioChunks.current = []; // Reset total
        }
      };

      mediaRecorder.current.stop();
      setIsListening(false);
      // Liberar el micrófono físicamente
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleListen = () => isListening ? stopRecordingAndProcess() : startRecording();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {error && (
        <div
          role="alert"
          className="max-w-[260px] flex items-start gap-2 rounded-lg border border-amber-500/60 bg-gray-900/95 px-3 py-2 text-[11px] leading-snug text-amber-200 shadow-lg"
        >
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="shrink-0 text-gray-400 hover:text-white"
            aria-label="Descartar aviso"
          >
            ✕
          </button>
        </div>
      )}
      <button
        onClick={toggleListen}
        disabled={isProcessing}
        className={`w-16 h-16 rounded-full border-2 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
          isListening ? 'bg-red-600 animate-pulse border-white' : 
          isProcessing ? 'bg-yellow-600 border-yellow-400' : 'bg-gray-900 border-cyan-400'
        }`}
      >
        <span className="text-white text-xl">{isProcessing ? '⏳' : isListening ? '⏹️' : '🎤'}</span>
      </button>
    </div>
  );
};

export default VoiceAssistant;
// Reutilización aditiva para CMSC_V7_LOWER_HALF_ACTIVATION · mismo /assist real (S62).
// Sin cambios sobre el componente flotante: solo un hook compartido para la celda ACP.
export function useAiVoiceAssist() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const start = async () => {
    audioChunks.current = [];
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let selectedMimeType = 'audio/webm';
      for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']) {
        if (MediaRecorder.isTypeSupported(t)) { selectedMimeType = t; break; }
      }
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: selectedMimeType });
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) audioChunks.current.push(event.data);
      };
      mediaRecorder.current.start(500);
      setIsListening(true);
    } catch (err) {
      console.error('ACP voz · error al abrir micrófono:', err);
      setIsListening(false);
      setError('Micrófono no disponible: revise los permisos del navegador.');
    }
  };

  const stop = () => {
    if (!mediaRecorder.current || !isListening) return;
    mediaRecorder.current.onstop = async () => {
      setIsProcessing(true);
      if (audioChunks.current.length === 0) {
        setError('No se capturó audio. Intente de nuevo.');
        setIsProcessing(false);
        return;
      }
      const mimeType = mediaRecorder.current?.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunks.current, { type: mimeType });
      const extension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
      const formData = new FormData();
      formData.append('audio', audioBlob, `grabacion.${extension}`);
      try {
        const response = await fetch(`${API_BASE}/assist`, { method: 'POST', body: formData });
        if (response.ok) {
          const resAudioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(resAudioBlob);
          await new Audio(audioUrl).play();
          setError(null);
        } else {
          console.error('ACP voz · error en la IA:', response.statusText);
          setError(`Asistente de voz no disponible (HTTP ${response.status}).`);
        }
      } catch (error) {
        console.error('ACP voz · fallo de conexión:', error);
        setError('Asistente de voz no disponible: sin conexión con el servicio.');
      } finally {
        setIsProcessing(false);
        audioChunks.current = [];
      }
    };
    mediaRecorder.current.stop();
    setIsListening(false);
    mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
  };

  // `error` se expone para que el consumidor lo pinte (L-4c en AcpCell: NO ejecutado
  // en esta misión por la prohibición de tocar CMSC).
  return { isListening, isProcessing, error, toggle: () => (isListening ? stop() : start()) };
}