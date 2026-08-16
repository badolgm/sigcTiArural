import { CircuitSimulationPort } from '../ports/circuitSimulationPort';

/**
 * Adaptador que envuelve el editor de esquemas legado (SchematicEditor.jsx,
 * en cuarentena a partir de esta migración) y su ejecución de Python vía
 * Pyodide (ElectronicsLab.jsx). No reimplementa ninguna lógica: recibe por
 * inyección la función que YA existe en ElectronicsLab.jsx (hoy llamada
 * `runPythonCode`) y la reexpone tal cual, sin tocar una sola línea de su
 * cuerpo.
 *
 * TENSIÓN DE DISEÑO (documentada, no resuelta en Fase A -- ver
 * circuitSimulationPort.js): SchematicEditor.jsx:1709 llama a su prop
 * `onRunSimulation(solverCode)` con un string de código Python que él mismo
 * construye, y parsea el string JSON de vuelta POR SU CUENTA (líneas
 * 1710-1732) para dibujar su propio osciloscopio local -- independiente de
 * lo que ElectronicsLab.jsx hace con esa misma respuesta para el store
 * compartido. Ese contrato string-in/string-out es exclusivo de
 * SchematicEditor y no tiene sentido para Falstad (que no recibe código
 * Python, corre su propio motor). Por eso:
 *
 * - `runSimulation()` (el método real del puerto) NO está soportado todavía
 *   -- lanza un error explícito en vez de fingir un resultado. SchematicEditor
 *   sigue siendo quien dispara su propia simulación, no el puerto.
 * - `getLegacyRunCallback()` es un shim aparte, documentado como temporal,
 *   que reproduce exacto el contrato que SchematicEditor.jsx ya espera.
 *
 * RETIRO ESPERADO: cuando el botón RUN interno de SchematicEditor deje de
 * existir (fase posterior de esta migración, tras confirmar que Falstad
 * cubre todo el flujo de simulación), este shim se elimina junto con
 * SchematicEditor.jsx y `runSimulation()` pasa a ser la única vía real.
 */
export class LegacySchematicEditorAdapter extends CircuitSimulationPort {
  /**
   * @param {{ runLegacyPythonSimulation: (code: string) => Promise<string> }} deps
   *   `runLegacyPythonSimulation` es la función existente de
   *   ElectronicsLab.jsx (`runPythonCode`), inyectada tal cual.
   */
  constructor({ runLegacyPythonSimulation }) {
    super();
    if (typeof runLegacyPythonSimulation !== 'function') {
      throw new Error('LegacySchematicEditorAdapter: runLegacyPythonSimulation debe ser una función');
    }
    this._runLegacyPythonSimulation = runLegacyPythonSimulation;
  }

  async runSimulation() {
    throw new Error(
      'LegacySchematicEditorAdapter.runSimulation() no está soportado en Fase A: ' +
      'SchematicEditor sigue disparando su propia simulación desde su propio botón ' +
      'RUN interno (ver SchematicEditor.jsx:1709), no el puerto. Use ' +
      'getLegacyRunCallback() para conectarlo a la prop onRunSimulation de ' +
      'SchematicEditor mientras tanto.'
    );
  }

  /**
   * Shim temporal -- ver el docstring de la clase. Devuelve la MISMA
   * función inyectada, sin envolverla ni alterar su comportamiento.
   *
   * @returns {(code: string) => Promise<string>}
   */
  getLegacyRunCallback() {
    return this._runLegacyPythonSimulation;
  }
}
