import React from 'react';
import HonestyBadge from '../HonestyBadge.jsx';

// Franja A del Visual Freeze (CMSC_ORCHESTRATION_V2_DESIGN.md §12.2).
// Subflujo de trabajo ACÚSTICO de 7 etapas. NO es un segundo río global:
// SignalRiver (CmscDashboard.jsx L119) sigue siendo el río del ecosistema y no se replica aquí.
//
// Los estados son literales y NO editables desde la UI. Fuentes de verdad:
//   - S30      -> CMSC_ORCHESTRATION_V2_DESIGN.md §14.2 (REAL-LOCAL)
//   - Dataset  -> metadata/schema.json 1.2.0 -> dataset_state = PREPARADO_VACIO
//   - S81/S82  -> CMSC_ORCHESTRATION_V2_DESIGN.md §14.2 (DISEÑO)
//   - KH       -> CMSC_ORCHESTRATION_V2_DESIGN.md §14.2 (sin evidencia acústica promovida)
// Este componente NO calcula ningún estado: solo presenta el canon congelado.
// La lectura real del Dataset llega en Fase 3 (roadmap §13), no aquí.

const STEPS = [
  { id: 'S30', label: 'S30', detail: 'Micrófono local', estado: 'REAL-LOCAL', nota: 'Productor único de la señal acústica' },
  { id: 'LOGGER', label: 'Logger', detail: 'CMSC_DATA_LOGGER_V1', estado: 'DISENO', nota: 'Captura no habilitada en Fase 1 · integración S30 prevista en Fase 2' },
  { id: 'DATASET', label: 'Dataset', detail: 'sigct_rural_acoustic/v1', estado: 'DISENO', nota: 'PREPARADO_VACIO · 0 muestras' },
  { id: 'VALIDACION', label: 'Validación', detail: 'G-DS-1..6', estado: 'DISENO', nota: 'G-DS-1 FAIL · G-DS-2..6 PENDING' },
  { id: 'S81', label: 'S81', detail: 'Acoustic Intelligence', estado: 'DISENO', nota: 'Bloqueada: Dataset + modelo + validación' },
  { id: 'S82', label: 'S82', detail: 'Anomaly Detector', estado: 'DISENO', nota: 'Bloqueada: baseline + thresholds + validación' },
  { id: 'KH', label: 'Knowledge Hub', detail: 'Evidencia acústica', estado: 'DISENO', nota: 'Sin evidencia acústica promovida · Ledger en diseño' }
];

const AcousticFlowStepper = () => (
  <div className="rounded-xl border border-gray-800/70 bg-gray-900/20 p-1.5">
    <div className="flex items-center justify-between mb-1.5 gap-2">
      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
        Flujo acústico de adquisición
      </span>
      <span className="text-[10px] text-gray-500">S30 → Logger → Dataset → Validación → S81 → S82 → Knowledge Hub</span>
    </div>

    {/* overflow-x-auto: el stepper nunca debe romper el grid de 12 columnas del shell */}
    <div className="flex items-stretch gap-1 overflow-x-auto">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div
            className="flex-1 min-w-[104px] flex flex-col items-center justify-center gap-1 rounded-md border border-gray-800 bg-gray-900/40 px-1.5 py-1.5 text-center"
            title={s.nota}
          >
            <span className="w-full flex items-center justify-between gap-1">
              <span className="truncate text-[10px] text-gray-200">{s.label}</span>
            </span>
            <span className="truncate text-[9px] text-gray-500 w-full">{s.detail}</span>
            <HonestyBadge estado={s.estado} showConfidence={false} />
          </div>
          {i < STEPS.length - 1 && (
            <span aria-hidden="true" className="self-center text-[10px] text-gray-600">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default AcousticFlowStepper;