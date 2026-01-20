import React, { useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_AI_API_BASE || 'http://localhost:8081';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    // 1. Limpieza absoluta antes de empezar
    audioChunks.current = [];
    
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
      alert("Revisa que el navegador tenga permiso para usar el micrófono.");
    }
  };

  const stopRecordingAndProcess = () => {
    if (mediaRecorder.current && isListening) {
      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true);
        
        // 3. Verificación de seguridad: ¿Hay audio?
        if (audioChunks.current.length === 0) {
          console.error("⚠️ El buffer de audio está vacío. Abortando...");
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
          } else {
            console.error("❌ Error en la IA:", response.statusText);
          }
        } catch (error) {
          console.error("❌ Fallo de conexión:", error);
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
    <div className="fixed bottom-6 right-6 z-50">
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