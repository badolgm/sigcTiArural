import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';
import { SIGNAL_CATALOG } from './signalCatalog.js';
import { AI_INFERENCE_URL, buildInfoFromOfficialResponse, getStatusPresentation } from '../AIPredictiva.jsx';

const S61 = SIGNAL_CATALOG.find((s) => s.signal_id === 'S61');
const S60 = SIGNAL_CATALOG.find((s) => s.signal_id === 'S60');

const ModelPredictCell = () => {
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setInfo(null);
    setError(null);
  };

  const run = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client_context', 'cmsc-v7');
    try {
      const response = await fetch(AI_INFERENCE_URL, { method: 'POST', body: formData });
      let data = null;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('La respuesta oficial de IA no es valida.');
      }
      if (!response.ok || data?.error) {
        throw new Error(data?.error?.message || data?.error?.detail || 'No fue posible completar la inferencia oficial.');
      }
      const built = buildInfoFromOfficialResponse(data);
      setInfo(built);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const message = new SpeechSynthesisUtterance(
          `Inferencia real finalizada. ${built.disease}. ${built.recommendation}`
        );
        message.lang = 'es-ES';
        window.speechSynthesis.speak(message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const presentation = info ? getStatusPresentation(info.status) : null;

  return (
    <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-200">Modelos y predicciones</h3>
          <p className="text-[10px] text-gray-500">operar inferencia real · S61</p>
        </div>
        {S61 && <HonestyBadge estado={S61.estado} confidence={S61.confianza} showConfidence={false} />}
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 px-2.5 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Inferencia oficial</span>
          <span className="text-[10px] text-gray-500 font-mono">POST {AI_INFERENCE_URL}</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" id="cmsc-predict-file" />
        <label
          htmlFor="cmsc-predict-file"
          className="mt-2 flex items-center justify-center gap-2 w-full py-4 rounded-lg border border-dashed border-gray-700 hover:border-cyan-500 hover:bg-cyan-900/10 transition-colors cursor-pointer"
        >
          <span className="text-lg">{preview ? '🖼️' : '📥'}</span>
          <span className="text-[11px] text-gray-300">{fileName || 'Cargar imagen de hoja (multipart)'}</span>
        </label>
        {preview && (
          <div className="mt-2 h-24 rounded-lg overflow-hidden border border-gray-800 bg-black flex items-center justify-center">
            <img src={preview} alt="muestra" className="h-full object-contain" />
          </div>
        )}
        <button
          type="button"
          onClick={run}
          disabled={!fileName || loading}
          className="mt-2 w-full py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: loading ? NEON.alert : NEON.primary,
            color: '#000'
          }}
        >
          {loading ? 'PROCESANDO...' : 'EJECUTAR ANÁLISIS'}
        </button>
        {error && (
          <p className="mt-2 text-[11px] font-semibold" style={{ color: NEON.alert }}>{error}</p>
        )}
      </div>

      {info && (
        <div className={`rounded-lg border px-2.5 py-2 ${presentation?.panelClass || ''}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold" style={{ color: presentation?.titleClass }}>
              {presentation?.badgeIcon} {presentation?.badgeLabel}
            </span>
            <span className="text-[10px] font-mono text-gray-300">
              {(Number(info.confidence || 0) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 mt-1 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${(Number(info.confidence || 0) * 100)}%`,
                backgroundColor: presentation?.confidenceColor
              }}
            />
          </div>
          <div className="mt-1.5 text-xs font-medium text-gray-200">{info.disease}</div>
          <div className="text-[10px] text-gray-500">{info.recommendation}</div>
          <div className="mt-1.5 text-[10px] font-mono text-gray-600">
            {info.predictionCode} · class {info.rawClassIndex} · {info.modelVersion} · {info.sourceMode}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold" style={{ color: NEON.secondary }}>S60</span>
        {S60 && <HonestyBadge estado={S60?.estado} confidence={null} showConfidence={false} />}
        <span className="text-[10px] text-gray-500">imagen hoja 224×224 · entrada real</span>
      </div>
      </div>

      <Link
        to="/ai-predictive"
        className="mt-1 px-3 py-1.5 rounded-md text-xs font-semibold border border-gray-700/70 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors text-center"
      >
        Abrir IA Predictiva completa →
      </Link>
    </section>
  );
};

export default ModelPredictCell;