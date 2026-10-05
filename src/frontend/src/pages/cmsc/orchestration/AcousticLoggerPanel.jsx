import React, { useState } from 'react';

// Franja B · columna izquierda del Visual Freeze (§12.2): Logger expandible.
// Colapsado en reposo (no hay sesión activa). La captura NO está habilitada en Fase 1.
//
// HARD CONSTRAINT (roadmap §13 Fase 1 + §12.6.7):
//   Este componente NO llama a getUserMedia. La adquisición de audio sigue siendo exclusiva
//   de S30 (SpectralAnalysisInstrument). Abrir un segundo permiso de micrófono en paralelo
//   está prohibido por diseño (§6: "Restricción de integración").
//   Verificado en Gate F1: 0 llamadas ejecutables a getUserMedia en los componentes nuevos
//   (las únicas menciones de la API están en comentarios, como estos).
//
// Copy oficial aprobado por Bernardo 2026-10-05 (NO es error, NO es falla, NO está roto:
// capacidad planificada y bloqueada por diseño según el roadmap aprobado).

const COPY_PRINCIPAL = 'Captura no habilitada en Fase 1.';
const COPY_SUBTEXTO = 'Integración S30 prevista para Fase 2. CMSC_DATA_LOGGER_V1 según roadmap aprobado.';

// Contrato de captura. Valores copiados de tools/cmsc-data-logger/capture/captureContract.js
// (CAPTURE_DURATION_S = 3) y de metadata/schema.json 1.2.0 -> clip_contract.
// Se muestran como referencia del contrato; NO son una captura en curso.
const CONTRATO = [
  { k: 'Duración', v: '3,0 s' },
  { k: 'Canales', v: 'mono' },
  { k: 'Muestreo', v: 'PCM 16-bit' },
  { k: 'Frecuencia destino', v: '44.100 Hz' },
  { k: 'Frames por clip', v: '63' }
];

const AcousticLoggerPanel = () => {
  const [detalleAbierto, setDetalleAbierto] = useState(false);

  return (
    <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-200">Captura · CMSC_DATA_LOGGER_V1</h3>
          <p className="text-[10px] text-gray-500">
            etapa de adquisición del flujo · sin sesión activa
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-gray-500 shrink-0">
          en reposo
        </span>
      </div>

      {/* Estado de la capacidad, no estado de error. Sin icono de fallo. */}
      <div className="rounded-lg border border-gray-800 bg-gray-950/50 px-3 py-2.5">
        <p className="text-[11px] font-semibold text-gray-300 leading-snug">{COPY_PRINCIPAL}</p>
        <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{COPY_SUBTEXTO}</p>
      </div>

      {/* Control deshabilitado y visible: un onClick que no hace nada y aparenta funcionar
          sería una mentira de estado. Aquí no hay manejador porque no hay nada que manejar. */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled
          aria-disabled="true"
          title={COPY_PRINCIPAL + ' ' + COPY_SUBTEXTO}
          className="px-3 py-1.5 rounded-md border border-gray-700 bg-gray-900/60 text-[10px] font-semibold text-gray-500 cursor-not-allowed"
        >
          Iniciar captura
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="px-3 py-1.5 rounded-md border border-gray-700 bg-gray-900/60 text-[10px] font-semibold text-gray-500 cursor-not-allowed"
        >
          Detener
        </button>
        <span className="text-[10px] font-mono text-gray-500 tabular-nums" title="Muestras requeridas para un clip de 3,0 s a 44.100 Hz">
          0 / 132.300 muestras
        </span>
      </div>

      <p className="text-[10px] text-gray-500 leading-snug">
        El campo de captura no se renderiza en Fase 1: la adquisición de audio sigue siendo
        exclusiva de <span className="text-gray-400">S30</span>. El panel se habilita cuando exista
        el contrato de PCM de solo lectura aprobado.
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-widest text-gray-500">Contrato de clip</span>
        {CONTRATO.map((c) => (
          <span key={c.k} className="text-[10px] px-1.5 py-0.5 rounded border border-gray-800 bg-gray-900/40 text-gray-400">
            {c.k}: <span className="font-mono text-gray-300">{c.v}</span>
          </span>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setDetalleAbierto((v) => !v)}
          aria-expanded={detalleAbierto}
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          {detalleAbierto ? '▾ Ocultar estado del prototipo' : '▸ Estado del prototipo'}
        </button>
        {detalleAbierto && (
          <div className="mt-1.5 rounded-lg border border-gray-800 bg-gray-950/40 px-3 py-2 space-y-1">
            <p className="text-[10px] text-gray-400 leading-snug">
              Prototipo técnico <span className="font-mono">tools/cmsc-data-logger/capture/</span> validado
              aparte. Captura exacta de 3 s, metadata de sesión y clip, cola de tomas, WAV PCM16,
              manifiesto JSON, QC y hashes.
            </p>
            <p className="text-[10px] text-gray-500 leading-snug">
              Estado en el prototipo: validado técnicamente. Estado en el CMSC: no integrado.
              Ambas afirmaciones son verdaderas y no se mezclan.
            </p>
            <p className="text-[10px] text-gray-500 leading-snug">
              Toma actual: ninguna. Cola de tomas: 0. No hay audio en memoria en esta página.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AcousticLoggerPanel;