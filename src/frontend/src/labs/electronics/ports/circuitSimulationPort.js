/**
 * Puerto de salida para cualquier fuente de simulación de circuitos del
 * Laboratorio de Electrónica (el editor de esquemas legado -- SchematicEditor
 * en cuarentena --, Falstad auto-hospedado, o cualquier reemplazo futuro).
 *
 * El Laboratorio de Matemáticas (Dr. Binary, AdvancedMathLabV2.jsx) y
 * cualquier otro consumidor futuro dependen SOLO de este contrato -- nunca
 * de si la señal viene de SchematicEditor o de Falstad. Ver el mapa de
 * conexiones real (docs/local, sesión Día 18 - migración Falstad) para la
 * evidencia de que hoy el único consumidor es AdvancedMathLabV2.jsx, leyendo
 * exclusivamente `electronicsData.simulationResults.history` vía
 * useLabStore.
 *
 * Estilo espejo de shared_kernel/event_bus/ports/event_bus.py (puerto
 * abstracto + objeto de valor inmutable que viaja a través de él) --
 * traducido a JS porque el consumidor real vive 100% en el frontend y hoy
 * NO pasa por el EventBusPort del backend (ese mecanismo es
 * Telemetría->Agricultura únicamente, no toca Electrónica/Matemáticas).
 *
 * IMPORTANTE (Fase A): SchematicEditor.jsx dispara su propia simulación
 * desde su propio botón RUN interno (ver SchematicEditor.jsx:1709,
 * `onRunSimulation`), con un contrato string-in/string-out (código Python
 * -> JSON crudo) que ningún adaptador basado en Falstad podría satisfacer.
 * Por eso este puerto se define de forma agnóstica (sin argumentos, sin
 * rastro de "Python") -- el adaptador legado NO puede implementarlo de
 * verdad todavía; ver legacySchematicEditorAdapter.js para el shim temporal
 * que resuelve esa tensión sin tocar la lógica interna de SchematicEditor.
 */
export class CircuitSimulationPort {
  /**
   * Ejecuta la simulación del circuito actualmente activo en la fuente que
   * implementa este puerto y devuelve el resultado listo para publicarse en
   * el store compartido (useLabStore.setSimulationResults).
   *
   * @returns {Promise<Readonly<CircuitSimulationResult>>}
   */
  async runSimulation() {
    throw new Error('CircuitSimulationPort.runSimulation() no implementado');
  }
}

/**
 * @typedef {Object} CircuitSimulationResult
 * @property {{ time: number[], [nodeLabel: string]: number[] }} history
 *   Serie temporal por nodo. Es exactamente la forma que
 *   AdvancedMathLabV2.jsx ya espera de `electronicsData.simulationResults.history`
 *   -- no cambia con este puerto.
 * @property {object|null} analysis
 *   Métricas de análisis (THD, espectro, etc.) del adaptador de origen, si
 *   las produce. Ningún consumidor externo a ElectronicsLab.jsx lo lee hoy
 *   (verificado por grep en toda la sesión de investigación) -- se conserva
 *   por paridad con la forma actual del store, no se inventa un uso nuevo.
 * @property {string|null} netlist
 *   Descripción/trazabilidad del circuito simulado (texto libre). Tampoco
 *   tiene lectores externos hoy.
 * @property {string} source
 *   Identificador del adaptador que produjo el resultado (ej.
 *   'legacy-schematic-editor', 'falstad'). Trazabilidad para debugging --
 *   useLabStore.setSimulationResults lo ignora (solo lee history/analysis/
 *   netlist), así que agregarlo no requiere tocar useLabStore.js.
 */

/**
 * Construye un CircuitSimulationResult inmutable. Único punto de
 * construcción válido -- cualquier adaptador debe pasar por acá en vez de
 * armar el objeto a mano, para que la forma quede garantizada.
 *
 * @param {{ history: object, analysis?: object|null, netlist?: string|null, source: string }} params
 * @returns {Readonly<CircuitSimulationResult>}
 */
export function createCircuitSimulationResult({ history, analysis = null, netlist = null, source }) {
  if (!history || !Array.isArray(history.time)) {
    throw new Error('createCircuitSimulationResult: history.time debe ser un array');
  }
  if (!source) {
    throw new Error('createCircuitSimulationResult: source es obligatorio (trazabilidad de qué adaptador produjo el resultado)');
  }
  return Object.freeze({
    history: Object.freeze({ ...history }),
    analysis,
    netlist,
    source,
  });
}
