import React from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';
import { SIGNAL_CATALOG } from './signalCatalog.js';
import { useAiVoiceAssist } from '../../components/VoiceAssistant.jsx';

const S62 = SIGNAL_CATALOG.find((s) => s.signal_id === 'S62');

const SUB_AGENTES = ['Matemático', 'Señales', 'Electrónica', 'Física', 'IA', 'Investigación'];
const FUENTES = ['Registry', 'Ledger', 'Knowledge Hub'];

const AcpCell = () => {
  const voice = useAiVoiceAssist();

  return (
    <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-200">Agente Científico Principal · ACP</h3>
          <p className="text-[10px] text-gray-500">orquestador del ecosistema · arquitectura F4 aprobada en diseño</p>
        </div>
        <HonestyBadge estado="DISENO" confidence={null} showConfidence={false} />
      </div>

      <p className="text-[11px] text-gray-300 leading-snug">
        Orquestador científico de <span className="text-gray-100">lectura</span>: consulta fuentes de verdad y{' '}
        <span className="text-gray-100">jamás</span> ejecuta laboratorios ni fabrica evidencia.
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-widest text-gray-500">Fuentes de verdad</span>
        {FUENTES.map((f) => (
          <span key={f} className="text-[10px] px-1.5 py-0.5 rounded border border-gray-800 bg-gray-900/40 text-gray-400">
            {f}
          </span>
        ))}
        <span className="ml-auto text-[10px] text-gray-500">
          intérprete: <span className="text-gray-300">fallback determinista (sin LLM)</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {SUB_AGENTES.map((a) => (
          <span
            key={a}
            className="text-[10px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-900/60 text-gray-400 uppercase tracking-widest"
          >
            {a}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold" style={{ color: NEON.secondary }}>S62</span>
          {S62 && <HonestyBadge estado={S62.estado} confidence={S62.confianza} showConfidence={false} />}
          <button
            type="button"
            onClick={voice.toggle}
            disabled={voice.isProcessing}
            className={
              'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors disabled:opacity-50 ' +
              (voice.isListening
                ? 'border-red-600 text-red-400 animate-pulse'
                : voice.isProcessing
                  ? 'border-yellow-600 text-yellow-400'
                  : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white')
            }
          >
            <span>{voice.isProcessing ? '⏳' : voice.isListening ? '⏹' : '🎤'}</span>
            {voice.isListening ? 'ESCUCHANDO' : voice.isProcessing ? 'PROCESANDO' : 'Canal de voz'}
          </button>
          <Link to="/ai-predictive" className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
            ampliar →
          </Link>
        </span>
      </div>
    </section>
  );
};

export default AcpCell;
