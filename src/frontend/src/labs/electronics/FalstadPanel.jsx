import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FalstadAdapter } from './adapters/falstadAdapter';

const FALSTAD_URL = '/vendor/circuitjs1/circuitjs.html';

/**
 * Panel de UI para el adaptador Falstad -- SOLO conoce el puerto
 * (FalstadAdapter.runSimulation() -> CircuitSimulationResult), nunca los
 * detalles internos de CircuitJS1. `onSimulationResult` es responsabilidad
 * de quien lo use (ElectronicsLab.jsx ya sabe publicar al store compartido
 * vía useLabStore.setSimulationResults -- este componente no lo toca
 * directamente, mismo principio que ya separa SchematicEditor de esa
 * llamada).
 *
 * El adaptador se construye en el callback `ref` del <iframe>, no en un
 * useEffect: `iframe.contentWindow.oncircuitjsloaded` debe asignarse lo más
 * sincrónicamente posible respecto a la creación del elemento (ver
 * falstadAdapter.js, limitación #2 documentada ahí, confirmada empíricamente
 * antes de escribir este archivo) -- un useEffect corre después del commit,
 * con más margen para perder la carrera contra la navegación del iframe.
 *
 * `isVisible`: desde la migración a Opción (b) (Día 18, Fase B cierre), este
 * componente queda SIEMPRE montado en ElectronicsLab.jsx -- la pestaña
 * DISEÑO se oculta con CSS (display:none), no se desmonta, para que el
 * circuito/etiquetas del usuario dejen de perderse al cambiar de pestaña
 * (causa raíz confirmada: el iframe se destruía y recreaba desde cero en
 * cada cambio). Con el componente siempre vivo, `isVisible` es la única
 * forma de saber si el usuario está mirando el panel ahora mismo -- se usa
 * solo para pausar el muestreo de fondo cuando no lo está viendo (no gastar
 * CPU en una simulación que nadie ve); nunca fuerza reanudarla al volver a
 * mostrarse.
 */
const FalstadPanel = ({ onSimulationResult, isVisible = true }) => {
  const adapterRef = useRef(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);

  const setIframeRef = useCallback((node) => {
    if (node && !adapterRef.current) {
      adapterRef.current = new FalstadAdapter({ iframe: node });
    }
  }, []);

  useEffect(() => {
    if (!isVisible) {
      adapterRef.current?.pause();
    }
  }, [isVisible]);

  const handleRun = async () => {
    if (!adapterRef.current) return;
    setStatus('running');
    setErrorMsg(null);
    try {
      const result = await adapterRef.current.runSimulation();
      onSimulationResult && onSimulationResult(result);
      setStatus('idle');
    } catch (e) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center px-3 py-2 bg-gray-900 border-b border-gray-800">
        <span className="text-[10px] text-orange-400 font-mono uppercase tracking-widest">
          Falstad Circuit Simulator
        </span>
        <button
          onClick={handleRun}
          disabled={status === 'running'}
          className="px-3 py-1 text-xs font-bold rounded border border-green-600 text-green-400 hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-wait"
        >
          {status === 'running' ? '⌛ Muestreando…' : '▶ Sincronizar con Bridge'}
        </button>
      </div>
      {errorMsg && (
        <div className="px-3 py-2 bg-red-900/30 border-b border-red-500 text-red-300 text-xs font-mono">
          ⚠️ {errorMsg}
        </div>
      )}
      <iframe
        ref={setIframeRef}
        src={FALSTAD_URL}
        title="Falstad Circuit Simulator"
        className="flex-grow w-full border-0"
      />
    </div>
  );
};

export default FalstadPanel;
