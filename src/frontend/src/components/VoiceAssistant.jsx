import React, { useState, useEffect } from 'react';

// Recibimos 'onNavigate' como prop para conectarnos con tu App.jsx
const VoiceAssistant = ({ onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');

  // Verificar soporte del navegador
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const synthesis = window.speechSynthesis;

  // Si no hay soporte, no renderizamos nada (para no causar errores)
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'es-CO';

  const speak = (text) => {
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-CO';
    synthesis.speak(utterance);
  };

  const handleCommand = (command) => {
    const lower = command.toLowerCase();
    setLastCommand(command);

    // --- CEREBRO COMPATIBLE CON TU MENÚ ---
    
    // 1. Navegación (Usando las claves de tu switch en App.jsx)
    if (lower.includes('dashboard') || lower.includes('inicio')) {
      speak('Yendo al Dashboard.');
      onNavigate('dashboard');
    }
    else if (lower.includes('laboratorio')) {
      speak('Abriendo catálogo de laboratorios.');
      onNavigate('labs');
    }
    else if (lower.includes('matemática')) {
      speak('Abriendo matemáticas avanzadas.');
      onNavigate('advanced-math');
    }
    else if (lower.includes('inteligencia') || lower.includes('ia')) {
      speak('Abriendo módulo de predicción.');
      onNavigate('ai');
    }
    else if (lower.includes('documentación') || lower.includes('docs')) {
      speak('Abriendo documentación maestra.');
      onNavigate('docs-masterdoc');
    }

    // 2. Comandos Generales
    else if (lower.includes('hola')) {
      speak('Hola Bernardo. Sistema listo. ¿A dónde vamos?');
    }
    else if (lower.includes('estado')) {
      speak('El sistema está operativo. Revisa el dashboard para detalles.');
    }
    else {
      speak('No reconocí ese comando. Intenta decir: Ir al Dashboard.');
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        speak('Te escucho...');
      } catch (error) {
        setIsListening(false);
      }
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setIsListening(false);
    handleCommand(transcript);
  };

  recognition.onend = () => setIsListening(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {lastCommand && (
        <div className="bg-black/90 text-cyan-400 px-4 py-2 rounded-lg border border-cyan-500/50 text-sm backdrop-blur mb-2 animate-bounce">
          " {lastCommand} "
        </div>
      )}
      
      <button
        onClick={toggleListen}
        className={`
          flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300 shadow-2xl
          ${isListening 
            ? 'bg-red-900/80 border-red-500 animate-pulse scale-110' 
            : 'bg-gray-900/90 border-cyan-400 hover:scale-110 hover:shadow-[0_0_20px_#00FFFF]'
          }
        `}
      >
        {/* Icono Micrófono */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
    </div>
  );
};

export default VoiceAssistant;