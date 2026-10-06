import React from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from '../HonestyBadge.jsx';

// Franja C del Visual Freeze (§12.2): consumidores acústicos, siempre resumidos en línea.
//
// Regla dura: aquí NO se embebe el Knowledge Hub, NO se llama al ACP y NO se ejecuta ninguna
// inferencia. Solo se declara el estado y el bloqueo. El acceso global al Hub sigue en
// CmscDashboard.jsx L174-181 y el ACP se renderiza entero en la Franja D.
//
// Estados literales frozen por CMSC_ORCHESTRATION_V2_DESIGN.md §14.2.

const CONSUMIDORES = [
  {
    id: 'S81',
    nombre: 'S81 · Acoustic Intelligence',
    estado: 'DISENO',
    motivo: 'Dataset + modelo + validación',
    detalle: 'Sin clasificador acústico entrenado. Un modelo no existe sin validation_metrics.json + model_card.md.'
  },
  {
    id: 'S82',
    nombre: 'S82 · Anomaly Detector',
    estado: 'DISENO',
    motivo: 'baseline + thresholds + validación',
    detalle: 'Cold-start: cero alertas. Operar sin baseline validado produciría falsas alarmas.'
  },
  {
    id: 'KH',
    nombre: 'Knowledge Hub',
    estado: 'DISENO',
    motivo: 'sin evidencia acústica promovida',
    detalle: 'Hub documental operativo. El Ledger acústico está en diseño; no hay nada que promover.'
  }
];

const AcousticConsumersStrip = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
    {CONSUMIDORES.map((c) => (
      <div
        key={c.id}
        className="rounded-lg border border-gray-800/70 bg-gray-900/25 px-2.5 py-1.5 flex flex-col gap-0.5 min-w-0"
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-[10px] font-bold text-gray-300 truncate">{c.nombre}</span>
          <HonestyBadge estado={c.estado} showConfidence={false} className="shrink-0" />
        </div>
        <span className="text-[9px] text-gray-500 leading-snug" title={c.detalle}>
          bloqueada: {c.motivo}
        </span>
      </div>
    ))}
  </div>
);

export default AcousticConsumersStrip;