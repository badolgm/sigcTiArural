import React, { useState, useEffect } from 'react';

const AI_INFERENCE_URL = import.meta.env.VITE_AI_INFERENCE_URL?.trim() || '/api/v3/ai/inference/';

const ANALYSIS_MODES = {
  real: 'INFERENCIA REAL',
  simulation: 'SIMULACION',
  robot_demo: 'ROBOT DEMO',
};

const DEMO_SCENARIOS = [
  {
    id: 'demo-unhealthy',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_leaf_late_blight.jpg/640px-Tomato_leaf_late_blight.jpg',
    rawDiagnosis: 'class_0',
    rawClassIndex: 0,
    confidence: 0.9721,
    status: 'warning',
    title: 'Condicion no saludable detectada',
    classification: 'Clasificacion binaria simulada: enferma',
    plant: 'Cultivo de demostracion',
    recommendation: 'Escenario demostrativo. No corresponde a inferencia cientifica oficial.',
  },
  {
    id: 'demo-healthy',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Tomato_leaf.jpg/640px-Tomato_leaf.jpg',
    rawDiagnosis: 'class_1',
    rawClassIndex: 1,
    confidence: 0.9644,
    status: 'healthy',
    title: 'Condicion saludable detectada',
    classification: 'Clasificacion binaria simulada: sana',
    plant: 'Cultivo de demostracion',
    recommendation: 'Escenario demostrativo. No corresponde a inferencia cientifica oficial.',
  },
];

const NEON_COLORS = {
  primary: '#00FFFF', // Cyan
  secondary: '#39FF14', // Neon Green
  alert: '#FF3131', // Plasma Red
  warning: '#FFD32A', // Neon Yellow
  darkBackground: '#050505',
  panelBg: '#0F0F0F',
};

const SPECIES_LABELS = {
  unknown: 'Cultivo no determinado',
};

const getOfficialStatus = (healthState) => {
  if (healthState === 'healthy') return 'healthy';
  if (healthState === 'critical') return 'critical';
  if (healthState === 'warning') return 'warning';
  return 'unknown';
};

const getClassificationLabel = (rawClassIndex) => {
  if (Number(rawClassIndex) === 0) return 'Clasificacion binaria del modelo: enferma';
  if (Number(rawClassIndex) === 1) return 'Clasificacion binaria del modelo: sana';
  return 'Clasificacion binaria del modelo: no determinada';
};

const getStatusPresentation = (status) => {
  if (status === 'healthy') {
    return {
      panelClass: 'border-green-500/50 bg-green-900/10',
      titleClass: 'text-[#39FF14]',
      badgeClass: 'bg-green-500/20 border-green-500 text-green-400',
      badgeLabel: 'SALUDABLE',
      badgeIcon: '✅',
      confidenceColor: '#39FF14',
    };
  }

  if (status === 'warning') {
    return {
      panelClass: 'border-yellow-500/50 bg-yellow-900/10',
      titleClass: 'text-[#FFD32A]',
      badgeClass: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
      badgeLabel: 'ALERTA PREVENTIVA',
      badgeIcon: '⚠️',
      confidenceColor: '#FFD32A',
    };
  }

  if (status === 'critical') {
    return {
      panelClass: 'border-red-500/50 bg-red-900/10',
      titleClass: 'text-[#FF3131]',
      badgeClass: 'bg-red-500/20 border-red-500 text-red-400',
      badgeLabel: 'ALERTA CRITICA',
      badgeIcon: '🚨',
      confidenceColor: '#FF3131',
    };
  }

  return {
    panelClass: 'border-cyan-500/40 bg-cyan-900/10',
    titleClass: 'text-cyan-300',
    badgeClass: 'bg-cyan-500/20 border-cyan-500 text-cyan-300',
    badgeLabel: 'ESTADO INDETERMINADO',
    badgeIcon: 'ℹ️',
    confidenceColor: '#67E8F9',
  };
};

const getModePresentation = (mode) => {
  if (mode === 'simulation') {
    return {
      label: ANALYSIS_MODES.simulation,
      className: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    };
  }

  if (mode === 'robot_demo') {
    return {
      label: ANALYSIS_MODES.robot_demo,
      className: 'bg-red-500/20 border-red-500 text-red-300',
    };
  }

  return {
    label: ANALYSIS_MODES.real,
    className: 'bg-cyan-500/20 border-cyan-500 text-cyan-300',
  };
};

const buildInfoFromOfficialResponse = (data) => {
  const prediction = data?.prediction || {};
  const trace = data?.trace || {};
  const healthState = String(prediction?.health_state || 'unknown').toLowerCase();
  const rawClassIndex = Number(trace?.raw_class_index ?? -1);

  return {
    plant: SPECIES_LABELS[String(prediction?.plant_species || 'unknown').toLowerCase()] || prediction?.plant_species || 'Cultivo Desconocido',
    disease: prediction?.prediction_label || 'Resultado oficial',
    classification: getClassificationLabel(rawClassIndex),
    status: getOfficialStatus(healthState),
    recommendation: prediction?.recommended_action || 'Sin recomendacion oficial disponible.',
    description: 'El modelo actual solo soporta clasificacion binaria saludable/no saludable y no identifica enfermedad especifica.',
    mode: 'real',
    rawDiagnosis: trace?.raw_diagnosis || 'unknown',
    rawClassIndex,
    confidence: Number(prediction?.confidence ?? 0),
    modelVersion: prediction?.model_version || 'unknown',
    scientificScope: prediction?.scientific_scope || 'binary_only',
    semanticContractVersion: prediction?.semantic_contract_version || 'unknown',
    sourceMode: data?.source_mode || 'unknown',
    predictionCode: prediction?.prediction_code || 'unknown',
    conditionGroup: prediction?.condition_group || 'unknown',
  };
};

const buildDemoInfo = (scenario, mode) => {
  return {
    plant: scenario.plant,
    disease: scenario.title,
    classification: scenario.classification,
    status: scenario.status,
    recommendation: scenario.recommendation,
    description: 'Escenario sintetico de demostracion. El resultado visual no proviene de inferencia cientifica oficial.',
    mode,
    rawDiagnosis: scenario.rawDiagnosis,
    rawClassIndex: scenario.rawClassIndex,
    confidence: scenario.confidence,
    modelVersion: 'demo-simulator',
    scientificScope: 'demonstration_only',
    semanticContractVersion: 'demo-v1',
    sourceMode: mode,
    predictionCode: `demo.${scenario.id}`,
    conditionGroup: 'demonstration',
  };
};

const AIPredictiva = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [detailedInfo, setDetailedInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('real');
  const statusPresentation = detailedInfo ? getStatusPresentation(detailedInfo.status) : null;
  const modePresentation = getModePresentation(detailedInfo?.mode || analysisMode);

  const speakResult = (info) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const prefix = info.mode === 'real'
        ? 'Inferencia real finalizada.'
        : `${getModePresentation(info.mode).label}.`;
      const text = `${prefix} ${info.disease}. ${info.classification}. ${info.recommendation}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAnalysisMode('real');
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setDetailedInfo(null);
    setError(null);
  };

  const processOfficialPrediction = (data) => {
    const info = buildInfoFromOfficialResponse(data);
    setDetailedInfo(info);
    return info;
  };

  const activateMode = (mode) => {
    setAnalysisMode(mode);
    setSelectedFile(null);
    setError(null);
    setResult(null);
    setDetailedInfo(null);
    if (mode !== 'real') {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || analysisMode !== 'real') return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('client_context', 'aipredictiva');

    try {
      const response = await fetch(AI_INFERENCE_URL, { 
        method: 'POST', 
        body: formData 
      });

      let data = null;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('La respuesta oficial de IA no es valida.');
      }

      if (!response.ok || data?.error) {
        throw new Error(
          data?.error?.message ||
          data?.error?.detail ||
          'No fue posible completar la inferencia oficial.'
        );
      }

      setResult(data);
      const info = processOfficialPrediction(data);
      speakResult(info);

    } catch (err) {
      console.warn('AI Context PR1 error:', err);
      setResult(null);
      setDetailedInfo(null);
      setError(err.message || 'No fue posible completar la inferencia oficial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (analysisMode === 'simulation' || analysisMode === 'robot_demo') {
      let idx = 0;
      interval = setInterval(() => {
        setLoading(true);
        setTimeout(() => {
          const scenario = DEMO_SCENARIOS[idx];
          const info = buildDemoInfo(scenario, analysisMode);
          const simulatedResult = {
            prediction: {
              confidence: info.confidence,
              model_version: info.modelVersion,
              scientific_scope: info.scientificScope,
              semantic_contract_version: info.semanticContractVersion,
              prediction_code: info.predictionCode,
              condition_group: info.conditionGroup,
            },
            trace: {
              raw_diagnosis: info.rawDiagnosis,
              raw_class_index: info.rawClassIndex,
            },
          };

          setPreview(scenario.img);
          setError(null);
          setResult(simulatedResult);
          setDetailedInfo(info);
          speakResult(info);

          setLoading(false);
          idx = (idx + 1) % DEMO_SCENARIOS.length;
        }, 1200);
      }, analysisMode === 'simulation' ? 9000 : 12000);
    }

    return () => {
      clearInterval(interval);
      window.speechSynthesis.cancel();
    };
  }, [analysisMode]);

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

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => activateMode('real')}
                    className={`px-5 py-3 border font-bold tracking-widest ${analysisMode === 'real' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                >
                    INFERENCIA REAL
                </button>
                <button
                    onClick={() => activateMode(analysisMode === 'simulation' ? 'real' : 'simulation')}
                    className={`px-5 py-3 border font-bold tracking-widest ${analysisMode === 'simulation' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                >
                    {analysisMode === 'simulation' ? 'DETENER SIMULACION' : 'INICIAR SIMULACION'}
                </button>
                <button
                    onClick={() => activateMode(analysisMode === 'robot_demo' ? 'real' : 'robot_demo')}
                    className={`px-5 py-3 border font-bold tracking-widest ${analysisMode === 'robot_demo' ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                >
                    {analysisMode === 'robot_demo' ? 'DETENER ROBOT DEMO' : 'INICIAR ROBOT DEMO'}
                </button>
            </div>
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
                         {analysisMode !== 'real' && (
                            <div className={`absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded border ${analysisMode === 'robot_demo' ? 'border-red-500/50' : 'border-yellow-500/50'}`}>
                                <div className={`w-2 h-2 rounded-full animate-ping ${analysisMode === 'robot_demo' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                                <span className={`text-xs font-mono font-bold ${analysisMode === 'robot_demo' ? 'text-red-400' : 'text-yellow-300'}`}>{getModePresentation(analysisMode).label}</span>
                            </div>
                         )}
                    </div>

                    {/* Controls */}
                    {analysisMode === 'real' && (
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
                            {error && (
                                <p className="mt-3 text-sm font-semibold text-[#FF3131]">
                                    {error}
                                </p>
                            )}
                        </div>
                    )}
                    {analysisMode !== 'real' && (
                        <div className="p-6 border-t border-gray-800">
                            <div className="rounded-lg border border-gray-700 bg-black/30 p-4 text-sm text-gray-300">
                                <p className="font-bold uppercase tracking-widest text-gray-400 mb-2">{getModePresentation(analysisMode).label}</p>
                                <p>
                                    Este modo es demostrativo y no corresponde a inferencia cientifica oficial. Los resultados se generan a partir de escenarios sinteticos controlados.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: DIAGNOSTIC CORE (7 cols) */}
            <div className="lg:col-span-7">
                {detailedInfo ? (
                    <div className="h-full animate-fade-in-up">
                        {/* 1. MAIN DIAGNOSIS CARD */}
                        <div className={`relative p-8 rounded-xl border-2 mb-6 overflow-hidden ${statusPresentation?.panelClass || 'border-cyan-500/40 bg-cyan-900/10'}`}>
                             {/* Background Texture */}
                             <div className="absolute inset-0 opacity-10" 
                                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}>
                             </div>

                             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-gray-400 text-xs font-mono uppercase tracking-[0.2em] mb-1">Resultado Principal</h3>
                                    <h2 className={`text-3xl md:text-4xl font-black uppercase leading-tight ${statusPresentation?.titleClass || 'text-cyan-300'}`} style={{ textShadow: '0 0 20px currentColor' }}>
                                        {detailedInfo.disease}
                                    </h2>
                                    <p className="mt-2 text-sm font-mono text-gray-300">{detailedInfo.classification}</p>
                                </div>
                                <div className="flex flex-col gap-2 items-start md:items-end">
                                    <div className={`px-4 py-2 rounded font-bold uppercase text-sm border ${statusPresentation?.badgeClass || 'bg-cyan-500/20 border-cyan-500 text-cyan-300'}`}>
                                        {statusPresentation?.badgeIcon || 'ℹ️'} {statusPresentation?.badgeLabel || 'ESTADO INDETERMINADO'}
                                    </div>
                                    <div className={`px-4 py-2 rounded font-bold uppercase text-xs border ${modePresentation.className}`}>
                                        {modePresentation.label}
                                    </div>
                                </div>
                             </div>

                             {/* CONFIDENCE BAR */}
                             <div className="mb-6">
                                <div className="flex justify-between text-xs font-mono text-gray-400 mb-2">
                                    <span>CERTEZA DEL MODELO</span>
                                    <span className="text-white">{(Number(detailedInfo?.confidence ?? 0) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-1000 ease-out"
                                        style={{ 
                                            width: `${(Number(detailedInfo?.confidence ?? 0) * 100)}%`,
                                            backgroundColor: statusPresentation?.confidenceColor || '#67E8F9'
                                        }}
                                    ></div>
                                </div>
                             </div>

                             {/* PLANT TYPE */}
                             <div className="flex items-center gap-3 p-4 bg-black/40 rounded-lg border border-gray-700/50">
                                <span className="text-2xl">🌿</span>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Especie Reportada</p>
                                    <p className="text-lg font-medium text-gray-200">{detailedInfo.plant}</p>
                                </div>
                             </div>
                        </div>

                        {/* 2. DETAILS & RECOMMENDATIONS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* DESCRIPTION PANEL */}
                            <div className="p-6 rounded-xl bg-[#111] border border-gray-800 hover:border-cyan-500/30 transition-colors">
                                <h4 className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-sm mb-4">
                                    <span>📝</span> Alcance Cientifico
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

                            {/* TRACEABILITY PANEL */}
                            <div className="p-6 rounded-xl bg-[#111] border border-gray-800 hover:border-fuchsia-500/30 transition-colors">
                                <h4 className="flex items-center gap-2 text-fuchsia-400 font-bold uppercase text-sm mb-4">
                                    <span>🧬</span> Trazabilidad
                                </h4>
                                <div className="space-y-3 text-sm font-mono">
                                    <div>
                                        <p className="text-gray-500 uppercase text-xs">prediction_code</p>
                                        <p className="text-gray-200 break-all">{detailedInfo.predictionCode}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase text-xs">raw_diagnosis</p>
                                        <p className="text-gray-200 break-all">{String(detailedInfo.rawDiagnosis)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase text-xs">raw_class_index</p>
                                        <p className="text-gray-200">{String(detailedInfo.rawClassIndex)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase text-xs">condition_group</p>
                                        <p className="text-gray-200">{detailedInfo.conditionGroup}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase text-xs">confidence</p>
                                        <p className="text-gray-200">{Number(detailedInfo.confidence).toFixed(4)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase text-xs">model_version</p>
                                        <p className="text-gray-200">{detailedInfo.modelVersion}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase text-xs">scientific_scope</p>
                                        <p className="text-gray-200">{detailedInfo.scientificScope}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase text-xs">semantic_contract_version</p>
                                        <p className="text-gray-200">{detailedInfo.semanticContractVersion}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase text-xs">source_mode</p>
                                        <p className="text-gray-200">{detailedInfo.sourceMode}</p>
                                    </div>
                                </div>
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
                            Seleccione inferencia real, simulacion o robot demo para iniciar el analisis.
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
