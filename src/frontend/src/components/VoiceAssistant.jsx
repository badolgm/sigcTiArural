import React, { useState, useRef } from 'react';

// La URL base de la API de IA, cargada desde variables de entorno
const API_BASE = import.meta.env.VITE_AI_API_BASE || 'http://localhost:8081';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Nuevo estado para la carga
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.start();
        
        mediaRecorder.current.ondataavailable = event => {
          audioChunks.current.push(event.data);
        };

        setIsListening(true);
      })
      .catch(err => {
        console.error("Error al acceder al micrófono:", err);
        alert("No se pudo acceder al micrófono. Por favor, verifica los permisos en tu navegador.");
      });
  };

  const stopRecordingAndProcess = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true); // Empezar a mostrar que está procesando

        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        audioChunks.current = [];

        const formData = new FormData();
        formData.append("audio_file", audioBlob, "recording.webm");

        try {
          const response = await fetch(`${API_BASE}/assist`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Error del servidor: ${response.statusText}`);
          }

          const responseAudioBlob = await response.blob();
          const responseAudioUrl = URL.createObjectURL(responseAudioBlob);
          const audio = new Audio(responseAudioUrl);
          audio.play();

        } catch (error) {
          console.error("Error al procesar el audio:", error);
          // Opcional: podrías usar TTS local para decir el error
        } finally {
          setIsProcessing(false); // Terminar la carga
        }
      };
      
      mediaRecorder.current.stop();
      setIsListening(false);

      // Detener el stream de audio para que el ícono del micrófono desaparezca del navegador
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleListen = () => {
    if (isListening) {
      stopRecordingAndProcess();
    } else {
      startRecording();
    }
  };

  const buttonState = isListening || isProcessing;
  const buttonColorClass = isListening 
    ? 'bg-red-900/80 border-red-500 animate-pulse scale-110' 
    : isProcessing
      ? 'bg-yellow-900/80 border-yellow-500 animate-spin scale-110'
      : 'bg-gray-900/90 border-cyan-400 hover:scale-110 hover:shadow-[0_0_20px_#00FFFF]';

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleListen}
        disabled={isProcessing}
        className={`
          flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300 shadow-2xl
          ${buttonColorClass}
        `}
      >
        {isProcessing ? (
          // Icono de carga
          <svg className="h-8 w-8 text-yellow-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.99988V5.99988M6.34277 6.34277L8.4641 8.4641M2.99988 12H5.99988M6.34277 17.6568L8.4641 15.5355M12 20.9999V17.9999M17.6568 17.6568L15.5355 15.5355M20.9999 12H17.9999M17.6568 6.34277L15.5355 8.4641" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          // Icono de micrófono
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;