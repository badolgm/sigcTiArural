import React, { useState, useEffect, useRef } from 'react';

// Conector al backend local (Terminal 1)
const API_BASE = 'http://localhost:8000'; 

// --- BASE DE CONOCIMIENTO AGRÍCOLA (SISTEMA EXPERTO) ---
const PLANT_DISEASE_DB = {
  'Tomato_Late_blight': {
    label: 'Tomato Late Blight',
    plant: 'Tomate (Solanum lycopersicum)',
    disease: 'Tizón Tardío (Phytophthora infestans)',
    status: 'critical',
    recommendation: 'AISLAR INMEDIATAMENTE. Aplicar fungicidas a base de cobre (Caldo Bordeles). Reducir humedad foliar y mejorar ventilación del cultivo.',
    description: 'Hongo oomiceto destructivo. Causa manchas necróticas acuosas en hojas y tallos que se extienden rápidamente.'
  },
  'Tomato_Early_blight': {
    label: 'Tomato Early Blight',
    plant: 'Tomate (Solanum lycopersicum)',
    disease: 'Tizón Temprano (Alternaria solani)',
    status: 'warning',
    recommendation: 'Podar hojas inferiores afectadas. Aplicar fungicida orgánico (Bacillus subtilis). Rotación de cultivos para la próxima temporada.',
    description: 'Manchas concéntricas (anillos) en hojas viejas. Puede causar defoliación severa si no se trata.'
  },
  'Tomato_Healthy': {
    label: 'Tomato Healthy',
    plant: 'Tomate (Solanum lycopersicum)',
    disease: 'Ninguna (Planta Saludable)',
    status: 'healthy',
    recommendation: 'Mantener programa de riego por goteo. Continuar monitoreo semanal. Fertilización balanceada (N-P-K).',
    description: 'Tejido foliar verde intenso, turgente y sin anomalías visibles. Desarrollo óptimo.'
  },
  'Potato_Early_blight': {
    label: 'Potato Early Blight',
    plant: 'Papa (Solanum tuberosum)',
    disease: 'Tizón Temprano (Alternaria)',
    status: 'warning',
    recommendation: 'Aplicar fungicidas preventivos. Evitar riego por aspersión. Eliminar restos de cosecha anterior.',
    description: 'Lesiones marrones con anillos concéntricos en el follaje. Reduce el rendimiento del tubérculo.'
  }
};

const NEON_COLORS = {
  primary: '#00FFFF', // Cyan
  secondary: '#39FF14', // Neon Green
  alert: '#FF3131', // Plasma Red
  warning: '#FFD32A', // Neon Yellow
  darkBackground: '#050505',
  panelBg: '#0F0F0F',
};

const AIPredictiva = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [detailedInfo, setDetailedInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [robotMode, setRobotMode] = useState(false);
  
  // Referencia para scroll automático a resultados
  const resultsRef = useRef(null);

  // Función de Síntesis de Voz Mejorada
  const speakResult = (info) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      let text = '';
      if (info.status === 'healthy') {
        text = `Análisis finalizado. Planta detectada: ${info.plant}. Estado: Saludable. ${info.recommendation}`;
      } else {
        text = `Alerta fitosanitaria. Detección positiva en ${info.plant}. Patología identificada: ${info.disease}. Recomendación prioritaria: ${info.recommendation}`;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.pitch = 1.0; // Voz más natural y autoritaria
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
    setDetailedInfo(null);
    setError(null);
  };

  const processDiagnosis = (rawDiagnosis, confidence) => {
    // Intentar mapear la respuesta cruda a nuestra DB
    // Si el backend devuelve "Tomato_Late_blight", lo buscamos.
    // Si devuelve algo genérico, hacemos un fallback inteligente.
    
    let info = PLANT_DISEASE_DB[rawDiagnosis];
    
    // Fallback si la llave no existe exactamente
    if (!info) {
        if (rawDiagnosis.toLowerCase().includes('healthy') || rawDiagnosis.toLowerCase().includes('sana')) {
            info = PLANT_DISEASE_DB['Tomato_Healthy']; // Default healthy
        } else {
            // Default sick (Generic)
            info = {
                plant: 'Cultivo Desconocido',
                disease: rawDiagnosis || 'Anomalía Detectada',
                status: 'warning',
                recommendation: 'Consultar agrónomo. Aislar muestra.',
                description: 'Patología no registrada en base de datos local.'
            };
        }
    }
    
    setDetailedInfo(info);
    return info;
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

      if (!response.ok) throw new Error("Servidor IA Offline (Usando simulación de respaldo...)");

      const data = await response.json();
      setResult(data);
      const info = processDiagnosis(data.diagnosis, data.confidence);
      speakResult(info);

    } catch (err) {
      console.warn("Backend offline, switch to mock mode for UI testing");
      // Fallback para demo si no hay backend
      setTimeout(() => {
          const mockDiagnosis = 'Tomato_Early_blight';
          const mockConf = 0.88;
          setResult({ diagnosis: mockDiagnosis, confidence: mockConf, processing_time: '0.12s' });
          const info = processDiagnosis(mockDiagnosis, mockConf);
          speakResult(info);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  // Simulación de flujo automático de Robots (MODO ROBOT)
  useEffect(() => {
    let interval;
    if (robotMode) {
      const demoScenarios = [
        { 
            img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_leaf_late_blight.jpg/640px-Tomato_leaf_late_blight.jpg",
            code: 'Tomato_Late_blight'
        },
        { 
            img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Tomato_leaf.jpg/640px-Tomato_leaf.jpg",
            code: 'Tomato_Healthy' 
        },
        {
            img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Alternaria_solani_01.jpg/640px-Alternaria_solani_01.jpg",
            code: 'Tomato_Early_blight'
        }
      ];
      let idx = 0;
      
      interval = setInterval(() => {
        setLoading(true);
        // Simular tiempo de procesamiento
        setTimeout(() => {
            const scenario = demoScenarios[idx];
            
            // Datos simulados
            const simulatedResult = {
                diagnosis: scenario.code,
                confidence: 0.96 + (Math.random() * 0.03),
                processing_time: '0.04s'
            };

            setPreview(scenario.img);
            setResult(simulatedResult);
            
            const info = processDiagnosis(scenario.code, simulatedResult.confidence);
            speakResult(info); // El robot habla
            
            setLoading(false);
            idx = (idx + 1) % demoScenarios.length;
        }, 1500); // Tiempo de "análisis"
      }, 12000); // Tiempo entre muestras (más largo para leer recomendaciones)
    }
    return () => {
        clearInterval(interval);
        window.speechSynthesis.cancel();
    };
  }, [robotMode]);

  return (
    <div className="min-h-screen p-6 pt-24 font-sans text-gray-100" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER CYBERPUNK */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-800 pb-8">
            <div className="mb-6 md:mb-0 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2"
                    style={{ 
                        background: `linear-gradient(to right, ${NEON_COLORS.primary}, ${NEON_COLORS.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.3))'
                    }}>
                    IA Predictiva v5.0
                </h1>
                <div className="flex items-center gap-3 text-gray-400 font-mono text-sm">
                    <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">MODULO: FITOSANITARIO</span>
                    <span className="text-[#39FF14]">● SISTEMA ONLINE</span>
                </div>
            </div>
            
            <button 
                onClick={() => setRobotMode(!robotMode)}
                className={`group relative px-8 py-4 rounded-none skew-x-[-10deg] border transition-all duration-300 ${
                    robotMode 
                    ? 'bg-red-900/30 border-red-500 text-red-500 hover:bg-red-900/50' 
                    : 'bg-cyan-900/30 border-cyan-500 text-cyan-400 hover:bg-cyan-900/50'
                }`}
            >
                <div className="skew-x-[10deg] flex items-center gap-3 font-bold tracking-widest">
                    <span className="text-2xl">{robotMode ? '⏹' : '▶'}</span>
                    {robotMode ? 'DETENER MODO AUTO' : 'INICIAR MODO ROBOT'}
                </div>
                {/* Glow Effect */}
                <div className={`absolute inset-0 opacity-20 blur-md transition-all ${robotMode ? 'bg-red-500' : 'bg-cyan-500'} group-hover:opacity-40`}></div>
            </button>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: VISION INPUT (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
                <div className="relative group rounded-xl overflow-hidden border border-gray-800 bg-[#0F0F0F]">
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 z-10"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500 z-10"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500 z-10"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500 z-10"></div>

                    <div className="h-[400px] bg-black relative flex items-center justify-center overflow-hidden">
                         {preview ? (
                            <>
                                <img src={preview} alt="Analysis Target" className="w-full h-full object-contain" />
                                {/* Scanning Overlay */}
                                {loading && (
                                    <div className="absolute inset-0 bg-cyan-500/10 z-20">
                                        <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#00FFFF] animate-scan-vertical"></div>
                                    </div>
                                )}
                            </>
                         ) : (
                            <div className="text-center text-gray-700">
                                <div className="text-6xl mb-4 animate-pulse opacity-50">📷</div>
                                <p className="font-mono text-xs tracking-widest">NO SIGNAL SOURCE</p>
                            </div>
                         )}
                         
                         {/* Live Badge */}
                         {robotMode && (
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded border border-red-500/50">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                <span className="text-xs font-mono text-red-400 font-bold">LIVE FEED</span>
                            </div>
                         )}
                    </div>

                    {/* Controls */}
                    {!robotMode && (
                        <div className="p-6 border-t border-gray-800">
                             <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-cyan-900/10 transition-all group">
                                <span className="text-gray-400 group-hover:text-cyan-400 font-mono text-sm">📥 CARGAR IMAGEN DE MUESTRA</span>
                                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                            </label>
                            
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || loading}
                                className={`mt-4 w-full py-4 font-bold uppercase tracking-widest transition-all ${
                                    !selectedFile 
                                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                    : 'bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                                }`}
                            >
                                {loading ? 'PROCESANDO...' : 'EJECUTAR ANÁLISIS'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: DIAGNOSTIC CORE (7 cols) */}
            <div className="lg:col-span-7">
                {detailedInfo ? (
                    <div className="h-full animate-fade-in-up">
                        {/* 1. MAIN DIAGNOSIS CARD */}
                        <div className={`relative p-8 rounded-xl border-2 mb-6 overflow-hidden ${
                            detailedInfo.status === 'healthy' 
                            ? 'border-green-500/50 bg-green-900/10' 
                            : detailedInfo.status === 'warning'
                            ? 'border-yellow-500/50 bg-yellow-900/10'
                            : 'border-red-500/50 bg-red-900/10'
                        }`}>
                             {/* Background Texture */}
                             <div className="absolute inset-0 opacity-10" 
                                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}>
                             </div>

                             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-gray-400 text-xs font-mono uppercase tracking-[0.2em] mb-1">Diagnóstico Principal</h3>
                                    <h2 className={`text-3xl md:text-4xl font-black uppercase leading-tight ${
                                        detailedInfo.status === 'healthy' ? 'text-[#39FF14]' : 
                                        detailedInfo.status === 'warning' ? 'text-[#FFD32A]' : 'text-[#FF3131]'
                                    }`} style={{ textShadow: '0 0 20px currentColor' }}>
                                        {detailedInfo.disease}
                                    </h2>
                                </div>
                                <div className={`px-4 py-2 rounded font-bold uppercase text-sm border ${
                                     detailedInfo.status === 'healthy' ? 'bg-green-500/20 border-green-500 text-green-400' : 
                                     'bg-red-500/20 border-red-500 text-red-400'
                                }`}>
                                    {detailedInfo.status === 'healthy' ? '✅ SALUDABLE' : '⚠️ ALERTA PATÓGENO'}
                                </div>
                             </div>

                             {/* CONFIDENCE BAR */}
                             <div className="mb-6">
                                <div className="flex justify-between text-xs font-mono text-gray-400 mb-2">
                                    <span>CERTEZA DEL MODELO</span>
                                    <span className="text-white">{(Number(result?.confidence || 0) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-1000 ease-out"
                                        style={{ 
                                            width: `${(Number(result?.confidence || 0) * 100)}%`,
                                            backgroundColor: detailedInfo.status === 'healthy' ? '#39FF14' : '#FF3131'
                                        }}
                                    ></div>
                                </div>
                             </div>

                             {/* PLANT TYPE */}
                             <div className="flex items-center gap-3 p-4 bg-black/40 rounded-lg border border-gray-700/50">
                                <span className="text-2xl">🌿</span>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Variedad Detectada</p>
                                    <p className="text-lg font-medium text-gray-200">{detailedInfo.plant}</p>
                                </div>
                             </div>
                        </div>

                        {/* 2. DETAILS & RECOMMENDATIONS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* DESCRIPTION PANEL */}
                            <div className="p-6 rounded-xl bg-[#111] border border-gray-800 hover:border-cyan-500/30 transition-colors">
                                <h4 className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-sm mb-4">
                                    <span>📝</span> Análisis Patológico
                                </h4>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {detailedInfo.description}
                                </p>
                            </div>

                            {/* RECOMMENDATION PANEL */}
                            <div className="p-6 rounded-xl bg-[#111] border border-gray-800 hover:border-yellow-500/30 transition-colors">
                                <h4 className="flex items-center gap-2 text-yellow-400 font-bold uppercase text-sm mb-4">
                                    <span>🛡️</span> Protocolo de Acción
                                </h4>
                                <p className="text-gray-300 text-sm leading-relaxed font-medium">
                                    {detailedInfo.recommendation}
                                </p>
                            </div>

                        </div>
                    </div>
                ) : (
                    /* IDLE STATE */
                    <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-800 rounded-xl bg-[#0a0a0a]">
                        <div className="w-24 h-24 mb-6 rounded-full border-4 border-gray-800 flex items-center justify-center">
                            <span className="text-4xl animate-pulse">🧠</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-2">Sistema en Espera</h3>
                        <p className="text-gray-600 text-sm text-center max-w-md">
                            Cargue una imagen o inicie el modo robot para comenzar el diagnóstico fitosanitario en tiempo real.
                        </p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default AIPredictiva;
