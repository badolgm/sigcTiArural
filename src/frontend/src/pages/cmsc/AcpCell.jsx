import React from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';
import { SIGNAL_CATALOG } from './signalCatalog.js';
import { useAiVoiceAssist } from '../../components/VoiceAssistant.jsx';

const S62 = SIGNAL_CATALOG.find((s) => s.signal_id === 'S62');

const SUB_AGENTES = ['Matemático', 'Señales', 'Electrónica', 'Física', 'IA', 'Investigación'];

const AcpCell = () => {
  const voice = useAiVoiceAssist();

  return (
    <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-200">
            Agente Científico Principal · ACP
          </h3>
          <p className="text-[10px] text-gray-500">
            orquestador del ecosistema · arquitectura F4 aprobada en diseño
          </p>
        </div>
        <HonestyBadge estado="DISENO" confidence={null} showConfidence={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 px-2.5 py-2 lg:col-span-2">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Rol honesto</div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            El ACP es un orquestador científico de lectura que consulta fuentes de verdad
            (Registry + Ledger + Knowledge Hub) y <span className="text-gray-100">jamás</span> ejecuta laboratorios o
            fabrica evidencia. Hoy está en estado <span style={{ color: '#66A3FF' }}>DISEÑO</span>: la arquitectura
            está aprobada, pero no hay agente operativo.
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {SUB_AGENTES.map((a) => (
              <span key={a} className="text-[10px] px-2 py-1 rounded border border-gray-700 bg-gray-900/60 text-gray-400 uppercase tracking-widest">
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900/50 px-2.5 py-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Canal de voz real</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono font-bold" style={{ color: NEON.secondary }}>S62</span>
                {S62 && <HonestyBadge estado={S62.estado} confidence={S62.confianza} showConfidence={false} />}
              </div>
            </div>
            <button
              type="button"
              onClick={voice.toggle}
              disabled={voice.isProcessing}
              className={
                'flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all ' +
                (voice.isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : voice.isProcessing
                    ? 'bg-yellow-600 text-white'
                    : 'border-2 text-[#0a0a0a]')
              }
              style={
                !voice.isListening && !voice.isProcessing
                  ? { backgroundColor: '#00FFFF', boxShadow: '0 0 12px #00FFFF55' }
                  : undefined
              }
            >
              <span>{voice.isProcessing ? '⏳' : voice.isListening ? '⏹' : '🎤'}</span>
              {voice.isListening ? 'ESCUCHANDO' : voice.isProcessing ? 'PROCESANDO' : 'PREGUNTAR AL ACP'}
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
            Usa el mismo endpoint <span className="font-mono text-gray-400">/assist</span> del asistente (S62 · REAL):
            graba, transcribe y responde por voz. El ACP-orquestador sigue en DISEÑO; esto es el canal existente, no un agente nuevo.
          </p>
          <Link
            to="/ai-predictive"
            className="mt-2 block text-[11px] px-2.5 py-1.5 rounded-md border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors text-center"
          >
            Probar canal de voz completo →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AcpCell;