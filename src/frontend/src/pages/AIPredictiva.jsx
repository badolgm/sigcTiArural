import React, { useState, useEffect } from 'react';

// Conector al backend local (Terminal 1)
const API_BASE = 'http://localhost:8000'; 

const AIPredictiva = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [robotMode, setRobotMode] = useState(false);

  // Función de Síntesis de Voz
  const speakResult = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRobotMode(false);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null); 
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE}/infer`, { 
        method: 'POST', 
        body: formData 
      });

      if (!response.ok) throw new Error("Servidor IA no responde.");

      const data = await response.json();
      setResult(data);
      
      // La IA habla según el diagnóstico
      const msg = data.diagnosis === 'enferma' 
        ? "Atención. Se ha detectado una anomalía. La planta está enferma." 
        : "Análisis completado. El cultivo se encuentra saludable.";
      speakResult(msg);

    } catch (err) {
      console.error(err);
      setError("Error de comunicación con el motor local.");
    } finally {
      setLoading(false);
    }
  };

  // Simulación de flujo automático de Robots
  useEffect(() => {
    let interval;
    if (robotMode) {
      const demoImages = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_leaf_late_blight.jpg/640px-Tomato_leaf_late_blight.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Tomato_leaf.jpg/640px-Tomato_leaf.jpg"
      ];
      let idx = 0;
      
      interval = setInterval(() => {
        setLoading(true);
        setTimeout(() => {
            const isSick = idx % 2 === 0;
            const simulatedData = {
                diagnosis: isSick ? 'enferma' : 'sana',
                confidence: 0.992,
                processing_time: '0.08s'
            };
            setPreview(demoImages[idx]);
            setResult(simulatedData);
            setLoading(false);
            
            speakResult(isSick ? "Alerta de Robot. Planta enferma detectada." : "Robot 1 reporta: Planta sana.");
            idx = (idx + 1) % demoImages.length;
        }, 1200);
      }, 7000);
    }
    return () => {
        clearInterval(interval);
        window.speechSynthesis.cancel();
    };
  }, [robotMode]);

  return (
    <div className="p-6 pt-24 min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-bold uppercase tracking-widest text-[#00FFFF]" style={{ textShadow: '0 0 10px #00FFFF' }}>
                Inteligencia Predictiva
                </h1>
                <p className="text-gray-400 text-sm">Laboratorio de Análisis Automatizado SIGC&T</p>
            </div>
            
            <button 
                onClick={() => setRobotMode(!robotMode)}
                className={`px-6 py-3 rounded-xl border-2 font-mono font-black transition-all ${
                    robotMode 
                    ? 'bg-[#FF3131] text-white border-[#FF3131] animate-pulse' 
                    : 'bg-transparent text-[#39FF14] border-[#39FF14] hover:bg-[#39FF14] hover:text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                }`}
            >
                {robotMode ? '🛑 DETENER NODO ROBOT' : '🤖 INICIAR MODO ROBOT'}
            </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* SECCIÓN DE ENTRADA (CÁMARA / ROBOT) */}
          <div className="p-8 rounded-2xl border border-gray-800 bg-gray-900 bg-opacity-60 relative">
            <h2 className="text-xl font-bold mb-6 text-[#39FF14] uppercase">Visión de Campo</h2>
            
            <div className="w-full h-80 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center bg-black overflow-hidden relative">
              {preview ? (
                <img src={preview} alt="Input" className="w-full h-full object-contain" />
              ) : (
                <div className="text-gray-600 text-center animate-pulse">
                    <p className="text-6xl mb-4">📡</p>
                    <p>SIN SEÑAL DE VIDEO</p>
                </div>
              )}
              {robotMode && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full border border-red-500">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-bold text-red-500">REC 00:42:15</span>
                </div>
              )}
            </div>

            {!robotMode && (
                <div className="mt-8 flex flex-col gap-4">
                    <label className="w-full py-4 bg-gray-800 text-center rounded-xl text-gray-400 border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors uppercase font-bold text-sm">
                        Cargar Muestra Manual
                        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || loading}
                        className={`w-full py-5 rounded-xl font-black text-xl uppercase tracking-widest transition-all ${
                            !selectedFile || loading 
                            ? 'bg-gray-800 text-gray-600' 
                            : 'bg-[#00FFFF] text-black hover:bg-[#39FF14] shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                        }`}
                    >
                        {loading ? 'Procesando...' : 'Analizar Muestra'}
                    </button>
                </div>
            )}
          </div>

          {/* SECCIÓN DE RESULTADOS (EL CEREBRO) */}
          <div className="p-8 rounded-2xl border border-gray-800 bg-gray-900 bg-opacity-60 flex flex-col justify-center items-center shadow-inner">
            {result ? (
              <div className="text-center w-full animate-fade-in">
                <span className="text-gray-500 uppercase text-xs tracking-[0.4em] mb-4 block">Resultado de Inferencia</span>
                
                <div className={`text-7xl font-black uppercase mb-10 py-6 border-b-4 ${result.diagnosis === 'enferma' ? 'text-red-500 border-red-500' : 'text-green-500 border-green-500'}`}
                     style={{ textShadow: `0 0 25px currentColor` }}>
                  {result.diagnosis}
                </div>

                <div className="bg-black/90 rounded-2xl p-8 border border-gray-800 w-full max-w-sm mx-auto shadow-2xl">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-400 text-xs font-bold">CONFIANZA DEL MODELO</span>
                        {/* SOLUCIÓN AL NaN%: Se usa Number() y un fallback a 0 */}
                        <span className="text-4xl font-mono font-black text-white">
                            {(Number(result.confidence || 0) * 100).toFixed(1)}%
                        </span>
                    </div>
                    
                    <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden border border-gray-700">
                        <div className="h-full transition-all duration-1000 ease-out"
                            style={{ 
                                width: `${Number(result.confidence || 0) * 100}%`,
                                backgroundColor: result.diagnosis === 'enferma' ? '#FF3131' : '#39FF14',
                                boxShadow: `0 0 15px ${result.diagnosis === 'enferma' ? '#FF3131' : '#39FF14'}`
                            }}
                        />
                    </div>
                    
                    <div className="flex justify-between mt-6 text-[10px] text-gray-500 font-mono">
                        <span>LATENCIA: {result.processing_time || '0.1s'}</span>
                        <span>SISTEMA: AUTOMATIZADO</span>
                    </div>
                </div>
                
                <p className="mt-8 text-xs text-gray-600 uppercase tracking-widest">
                    Inferencia realizada en servidor local SIGC&T
                </p>
              </div>
            ) : (
                 <div className="text-center">
                     <div className="w-32 h-32 border-4 border-gray-800 border-t-[#00FFFF] rounded-full animate-spin mb-6 mx-auto"></div>
                     <p className="text-gray-600 font-mono tracking-widest">MODO ESCUCHA ACTIVO</p>
                 </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictiva;