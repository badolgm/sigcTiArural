/**
 * Cargador del bundle UMD de JSXGraph, auto-hospedado y servido verbatim desde
 * `public/vendor/jsxgraph/jsxgraphcore.js`.
 *
 * Por que NO se usa la via ESM del paquete (`import('jsxgraph')`):
 *   el paquete declara `exports` hacia `src/index.js`, y ese grafo de ESM
 *   NUNCA resuelve en runtime bajo Vite: la promesa queda pendiente para
 *   siempre, sin resolver ni rechazar (verificado en navegador). Tampoco
 *   compila `import('jsxgraph/distrib/jsxgraphcore.js')` por `exports` sin
 *   subrutas. El UMD publica `window.JXG` de forma sincrona al ejecutarse.
 *
 * Por que vive en `public/` y no en `src/`:
 *   servido como modulo, Vite lo transforma (inyecta HMR) y el UMD deja de
 *   publicar el global. Desde `public/` se sirve byte-identico al original.
 *
 * El bundle se declara en `index.html`, de modo que este modulo solo espera a
 * que el global exista. La inyeccion dinamica se conserva como red de
 * seguridad por si el motor se usa fuera del shell principal (pruebas).
 */

let enginePromise = null;
let engineInstance = null;
let scriptInjected = false;

const SCRIPT_SRC = '/vendor/jsxgraph/jsxgraphcore.js';
const LOAD_TIMEOUT_MS = 20000;

function injectScript() {
  if (scriptInjected) return;
  scriptInjected = true;

  const script = document.createElement('script');
  script.src = SCRIPT_SRC;
  script.async = false;
  script.onload = () => {
    window.__JXG_RESOLVED__ = true;
  };
  script.onerror = () => {
    window.__JXG_FAILED__ = true;
  };
  document.head.appendChild(script);
}

function jxgReady() {
  return !!(window.JXG && window.JXG.JSXGraph);
}

/**
 * Resuelve el namespace de JSXGraph una sola vez y lo cachea para el resto de
 * la sesion. Idempotente y seguro bajo doble montaje de React.
 *
 * @returns {Promise<object>} namespace global de JSXGraph
 */
export function loadEngine() {
  if (engineInstance) return Promise.resolve(engineInstance);
  if (enginePromise) return enginePromise;

  // El bundle ya viene en el HTML: no hay red que esperar, solo el parseo.
  if (jxgReady()) {
    engineInstance = window.JXG;
    return Promise.resolve(engineInstance);
  }

  enginePromise = new Promise((resolve, reject) => {
    injectScript();

    const startedAt = Date.now();
    const check = () => {
      if (jxgReady()) {
        engineInstance = window.JXG;
        resolve(engineInstance);
        return;
      }
      if (window.__JXG_FAILED__) {
        enginePromise = null;
        reject(new Error('MMC/jsxgraph: no se pudo cargar jsxgraphcore.js'));
        return;
      }
      if (Date.now() - startedAt > LOAD_TIMEOUT_MS) {
        enginePromise = null;
        reject(new Error('MMC/jsxgraph: timeout esperando el motor JSXGraph'));
        return;
      }
      setTimeout(check, 10);
    };
    check();
  });

  enginePromise.catch(() => {
    enginePromise = null;
  });

  return enginePromise;
}

/**
 * ¿El motor ya esta en memoria? Permite pintar la UI sin esperar la carga.
 * @returns {boolean}
 */
export function isEngineReady() {
  return engineInstance !== null;
}