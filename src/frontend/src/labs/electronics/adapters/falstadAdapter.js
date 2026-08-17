import { CircuitSimulationPort, createCircuitSimulationResult } from '../ports/circuitSimulationPort';

/**
 * Adaptador que envuelve Falstad Circuit Simulator (CircuitJS1) auto-hospedado
 * en /vendor/circuitjs1/circuitjs.html, vía su interfaz JS documentada (ver
 * public/vendor/circuitjs1/jsinterface.html -- el ejemplo real del propio
 * proyecto, no una reconstrucción de memoria: este adaptador replica ese
 * mismo patrón de wiring, verificado en vivo contra el simulador auto-
 * hospedado antes de escribir este archivo, ver docs/local/MOVEMENT_LOG.md).
 *
 * LIMITACIONES REALES CONFIRMADAS (verificadas con Playwright contra el
 * simulador auto-hospedado, no supuestas):
 *
 * 1. `getNodeVoltage(label)` SOLO funciona para nodos con una etiqueta
 *    explícita puesta por quien dibujó el circuito DENTRO de Falstad
 *    (elemento `LabeledNodeElm`, herramienta "Draw Labeled Node" del propio
 *    editor). A diferencia del solver legado (que numera automáticamente
 *    TODOS los nets), Falstad no expone voltaje de nodos sin etiquetar por
 *    nombre -- solo por `getElements()[i].getVoltageDiff()/getCurrent()`
 *    (por elemento de 2 terminales, no por nodo). Las claves de `history`
 *    que este adaptador produce dependen enteramente de qué nodos el
 *    usuario etiquetó dentro de Falstad, no de un esquema automático como
 *    el legado.
 * 2. `iframe.contentWindow.oncircuitjsloaded` DEBE asignarse ANTES de que
 *    el iframe termine de cargar, o el callback nunca se dispara -- un
 *    primer intento que lo asignaba de forma asíncrona, después de que el
 *    iframe ya hubiera cargado, nunca resolvió (confirmado por
 *    experimentación directa). `_waitUntilReady()` se protege revisando si
 *    `CircuitJS1` ya existe al construirse (cubre el caso de iframe ya
 *    cargado) y además intentando la asignación inmediata.
 * 3. `getElements()` llamado inmediatamente al disparar `oncircuitjsloaded`
 *    devuelve una lista VACÍA (0 elementos, sin lanzar error -- falla
 *    silenciosa) -- recién queda poblado después de que `onanalyze` dispare
 *    al menos una vez. `_waitUntilReady()` espera explícitamente por esto:
 *    primero revisa si `getElements()` ya trae datos (cubre el caso de un
 *    iframe que ya llevaba un rato cargado y analizado), y si no, espera al
 *    primer `onanalyze`.
 * 4. `onupdate()` se dispara en cada refresco de pantalla (~60/s observado
 *    en la máquina de desarrollo), no en cada paso interno del solver (eso
 *    es `ontimestep`) -- se usa aquí como punto de muestreo para construir
 *    `history.time`, igual que el ejemplo oficial (`jsinterface.html`).
 *
 * `runSimulation()` es zero-arg (contrato del puerto, ver
 * circuitSimulationPort.js): la fuente de "qué circuito" es siempre lo que
 * esté actualmente cargado/corriendo dentro del iframe inyectado -- este
 * adaptador no elige ni carga un circuito por su cuenta, solo observa el
 * que ya está activo (igual que el usuario interactúa hoy con
 * SchematicEditor: edita el circuito en vivo, después pide simular "lo que
 * hay ahora").
 */
export class FalstadAdapter extends CircuitSimulationPort {
  /**
   * @param {{ iframe: HTMLIFrameElement, sampleDurationMs?: number }} deps
   *   `iframe` debe apuntar (o estar por apuntar) a circuitjs.html servido
   *   desde nuestro propio origen (/vendor/circuitjs1/circuitjs.html) --
   *   mismo-origen es un requisito duro del navegador, no de Falstad, para
   *   poder leer `iframe.contentWindow.CircuitJS1`.
   *   `sampleDurationMs`: cuánto tiempo (real, de reloj) muestrear
   *   `onupdate` antes de resolver. 3000ms por defecto -- arbitrario pero
   *   suficiente para varios ciclos de una señal típica de audio/control en
   *   las pruebas manuales; no hay un valor "correcto" documentado por
   *   Falstad, se deja configurable a propósito.
   */
  constructor({ iframe, sampleDurationMs = 3000 }) {
    super();
    if (!iframe) {
      throw new Error('FalstadAdapter: se requiere una referencia al <iframe> de circuitjs.html');
    }
    this._iframe = iframe;
    this._sampleDurationMs = sampleDurationMs;
    this._sim = null;
    this._readyPromise = this._waitUntilReady().then((sim) => { this._sim = sim; return sim; });
  }

  /**
   * Pausa la simulación si ya está lista, sin esperar (`_readyPromise` puede
   * seguir sin resolver si el iframe todavía está cargando -- en ese caso no
   * hay nada corriendo todavía, así que no-opear es correcto, no un error
   * silenciado). Extra del adaptador, no parte de `CircuitSimulationPort`
   * -- pensado para que el panel de UI pueda pausar el muestreo de fondo
   * cuando el usuario no está mirando el panel de Falstad (pestaña DISEÑO
   * oculta con CSS pero montada), sin gastar CPU en una simulación que
   * nadie ve. No fuerza reanudar al volver a mostrarse -- respeta si el
   * usuario la había pausado por su cuenta desde la propia UI de Falstad.
   */
  pause() {
    if (this._sim) {
      this._sim.setSimRunning(false);
    }
  }

  _getWindowIfNavigable() {
    try {
      return this._iframe.contentWindow || null;
    } catch (e) {
      throw new Error(
        'FalstadAdapter: no se pudo acceder a iframe.contentWindow -- ¿el iframe no está sirviendo ' +
        'desde nuestro propio origen? ' + e.message
      );
    }
  }

  /**
   * Resuelve cuando (a) `CircuitJS1` existe en el iframe Y (b) `getElements()`
   * ya trae datos reales (ver limitación #3 del docstring de la clase).
   */
  _waitUntilReady() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('FalstadAdapter: timeout (20s) esperando a que Falstad cargue y analice el circuito'));
      }, 20000);

      const waitForAnalysis = (sim) => {
        if (sim.getElements().length > 0) {
          clearTimeout(timeout);
          resolve(sim);
          return;
        }
        const previousOnAnalyze = sim.onanalyze;
        sim.onanalyze = (s) => {
          if (typeof previousOnAnalyze === 'function') previousOnAnalyze(s);
          clearTimeout(timeout);
          resolve(s);
        };
      };

      const win = this._getWindowIfNavigable();
      if (win && win.CircuitJS1) {
        waitForAnalysis(win.CircuitJS1);
        return;
      }

      const attachLoadedHook = () => {
        const w = this._getWindowIfNavigable();
        if (!w) return false;
        w.oncircuitjsloaded = () => waitForAnalysis(w.CircuitJS1);
        return true;
      };

      if (!attachLoadedHook()) {
        this._iframe.addEventListener('load', () => {
          if (!attachLoadedHook()) {
            clearTimeout(timeout);
            reject(new Error('FalstadAdapter: el iframe cargó pero no expone contentWindow (¿origen distinto?)'));
          }
        }, { once: true });
      }
    });
  }

  async runSimulation() {
    const sim = await this._readyPromise;

    const elements = sim.getElements();
    const labeledNodeNames = elements
      .filter((e) => e.getType() === 'LabeledNodeElm')
      .map((e) => e.getLabelName());

    if (labeledNodeNames.length === 0) {
      throw new Error(
        'FalstadAdapter.runSimulation(): el circuito actualmente cargado en Falstad no tiene ningún ' +
        'nodo etiquetado (LabeledNodeElm) -- no hay nada que muestrear por nombre. Etiquetar al menos ' +
        'un nodo dentro del editor de Falstad (herramienta "Draw Labeled Node") antes de simular.'
      );
    }

    const history = { time: [] };
    labeledNodeNames.forEach((name) => { history[name] = []; });

    await new Promise((resolve) => {
      const previousOnUpdate = sim.onupdate;
      sim.onupdate = (s) => {
        if (typeof previousOnUpdate === 'function') previousOnUpdate(s);
        history.time.push(s.getTime());
        labeledNodeNames.forEach((name) => {
          history[name].push(s.getNodeVoltage(name));
        });
      };
      sim.setSimRunning(true);
      setTimeout(() => {
        sim.setSimRunning(false);
        resolve();
      }, this._sampleDurationMs);
    });

    return createCircuitSimulationResult({
      history,
      analysis: null,
      netlist: null,
      source: 'falstad',
    });
  }
}
