// ScientificStatus v2 · Programa científico (CMSC_V4_KNOWLEDGE_AS_DISCOVERY).
// Superficie de investigación: líneas activas, resultados, incertidumbres y siguiente paso.
// Nada de minuta: las métricas quedan como detalle discreto, jamás como protagonista.
import React, { useMemo } from 'react';
import HonestyBadge from './HonestyBadge.jsx';
import { NEON } from './honesty.js';
import { researchBoard } from './knowledgeDiscovery.js';

const VERDICT_COLOR = {
  PENDIENTE: '#FFB300',
  DISENO: '#66A3FF'
};

const VerdictTag = ({ estado }) => {
  if (['REAL', 'REAL-LOCAL', 'ROTO', 'HUERFANO'].includes(estado)) {
    return <HonestyBadge estado={estado} confidence={null} showConfidence={false} />;
  }
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-semibold"
      style={{
        color: VERDICT_COLOR[estado] || '#9CA3AF',
        border: `1px solid ${(VERDICT_COLOR[estado] || '#9CA3AF')}55`
      }}
    >
      {estado}
    </span>
  );
};

const RESEARCH_LINES = [
  {
    id: 'linea-ia-agricola',
    titulo: 'IA para diagnóstico vegetal',
    estado: 'AVANZADA',
    resumen: 'Dataset congelado (22.488 imágenes, 16 clases) y dos modelos validados; falta fijar el estándar oficial.',
    detalle: 'M1 0.9899 · M2 0.9937 · decisión PENDIENTE'
  },
  {
    id: 'linea-espectral',
    titulo: 'Análisis espectral en vivo',
    estado: 'VIVA',
    resumen: 'Primer instrumento científico del CMSC: FFT propio, espectrograma y métricas sobre el micrófono real del laboratorio.',
    detalle: 'S30 · instrumento-espectral-cmsc-v4'
  },
  {
    id: 'linea-bioacustica',
    titulo: 'Bioacústica y fisiología animal',
    estado: 'DISENO',
    resumen: 'Líneas declaradas para UBTN, abejas y ganadería; sin captura real todavía. Oportunidad abierta.',
    detalle: 'S20 · S77 · en diseño'
  },
  {
    id: 'linea-telemetria',
    titulo: 'Telemetría del campo',
    estado: 'ACTIVA',
    resumen: 'Temperatura y humedad reales llegan y se persisten; la lectura del robot sigue rota.',
    detalle: 'S10/S11 reales · S50 ROTO'
  }
];

const ScientificStatus = () => {
  const board = useMemo(() => researchBoard(), []);

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-100">Programa científico</h3>
          <p className="text-[10px] text-gray-500">
            líneas de investigación · estados honestos · lo que sigue
          </p>
        </div>
        <VerdictTag estado={board.uncertainties.length > 0 ? 'PENDIENTE' : 'REAL'} />
      </div>

      <div className="flex flex-col gap-1.5 flex-1 justify-evenly">
        {RESEARCH_LINES.map((line) => (
          <div key={line.id} className="px-3 py-2 rounded-lg border border-gray-800 bg-gray-900/40 flex flex-col justify-between gap-1 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-200">{line.titulo}</span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-semibold"
                style={{
                  color: line.estado === 'DISENO' ? VERDICT_COLOR.DISENO : NEON.secondary,
                  border: `1px solid ${(line.estado === 'DISENO' ? VERDICT_COLOR.DISENO : NEON.secondary)}55`
                }}
              >
                {line.estado}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{line.resumen}</p>
            <div className="text-[10px] font-mono text-gray-600 mt-0.5">{line.detalle}</div>
          </div>
        ))}
      </div>

      {board.nextSteps.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Siguiente paso del programa</span>
          </div>
          <ol className="space-y-1">
            {board.nextSteps.slice(0, 2).map((n, idx) => (
              <li key={n.id} className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900/40 flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold" style={{ color: NEON.primary }}>{idx + 1}</span>
                <p className="text-[11px] text-gray-300 leading-relaxed flex-1">{n.frase}</p>
                <VerdictTag estado={n.veredicto} />
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
};

export default ScientificStatus;