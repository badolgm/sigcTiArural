import React from 'react';
import AcousticFlowStepper from './AcousticFlowStepper.jsx';
import AcousticLoggerPanel from './AcousticLoggerPanel.jsx';
import AcousticDatasetPanel from './AcousticDatasetPanel.jsx';
import AcousticConsumersStrip from './AcousticConsumersStrip.jsx';
import AcpCell from '../AcpCell.jsx';

// Zona de Orquestación Científica V2 · freeze APROBADO 2026-10-04 21:51:22 (America/Bogota)
// en CMSC_ORCHESTRATION_V2_DESIGN.md §12. Esta es su ÚNICA implementación.
//
// Regla de este archivo: ENVOLVER Y CONECTAR. No sustituye ninguna pieza existente del shell.
//
// Franjas congeladas (§12.2):
//   A · Cabecera + stepper de 7 etapas .............. AcousticFlowStepper
//   B · Logger (7/12) + Dataset/Validación (5/12) . AcousticLoggerPanel · AcousticDatasetPanel
//   C · Consumidores S81/S82/KH .................... AcousticConsumersStrip
//   D · Supervisión: ACP en su lugar conceptual .... <AcpCell /> (importado, NO reescrito)
//
// Lo que este componente NO hace, y no debe hacer nunca sin misión nueva:
//   · no llama a getUserMedia (adquisición exclusiva de S30; §6 y §12.6.7)
//   · no crea rutas, páginas, dashboards ni laboratorios
//   · no escribe en el Dataset ni en /data
//   · no duplica SignalRiver, S30, el trío agrícola ni el Knowledge Hub global
//   · no inventa conteos, gates, métricas ni promoted evidence
//
// Fuera de la Zona y conservados sin cambios en CmscDashboard.jsx:
//   MmcHero · SpectralAnalysisInstrument (S30) · SignalExplorerAccordion ·
//   ModelPredictCell · LabDoors · BenchmarkCell · accesos a KH / Roadmap / Gobernanza

const OrchestrationZoneV2 = () => (
  <section className="space-y-2" aria-label="Zona de Orquestación Científica V2">
    <div className="flex items-baseline justify-between border-b border-gray-800 pb-1 gap-2">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
        Zona de Orquestación Científica V2 · acústica
      </h2>
      <span className="text-[10px] text-gray-600">Logger en reposo · Dataset PREPARADO_VACIO · 0 muestras</span>
    </div>

    {/* Franja A · siempre visible */}
    <AcousticFlowStepper />

    {/* Franja B · dos columnas. min-w-0 en ambos lados para que flex-1 no reviente el grid de 12 */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      <div className="lg:col-span-7 min-w-0">
        <AcousticLoggerPanel />
      </div>
      <div className="lg:col-span-5 min-w-0">
        <AcousticDatasetPanel />
      </div>
    </div>

    {/* Franja C · consumidores, siempre resumidos */}
    <div className="space-y-1">
      <span className="text-[10px] uppercase tracking-widest text-gray-500">Consumidores acústicos</span>
      <AcousticConsumersStrip />
    </div>

    {/* Franja D · ACP en su lugar conceptual actual. Se reutiliza entero; no se mueve ni se reescribe. */}
    <div className="space-y-1">
      <span className="text-[10px] uppercase tracking-widest text-gray-500">
        Supervisión · ACP (no controla la captura)
      </span>
      <AcpCell />
    </div>
  </section>
);

export default OrchestrationZoneV2;