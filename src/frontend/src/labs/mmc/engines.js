// MMC · Registro declarativo de motores matemáticos.
//
// Cada fila declara QUÉ motor es, DÓNDE está su adapter, con qué licencia y
// qué sabe hacer. El registro es la fuente de verdad de qué motor está detrás de
// cada instrumento: los adapters son intercambiables y ninguno se invoca
// directamente desde un componente.
//
// Regla de honestidad: una fila sin adapter operativo NO se declara OPERACIONAL.
// Los estados son los del canon (CMSC_CANONICAL_STATES_APPENDIX_V1):
// OPERACIONAL / PARCIAL / DISENO / DESCARTADO.

/**
 * Estados canónicos aplicados a motores del MMC.
 * OPERACIONAL · PARCIAL · DISENO · DESCARTADO
 */
export const MMC_ESTADO = {
  OPERACIONAL: 'OPERACIONAL',
  PARCIAL: 'PARCIAL',
  DISENO: 'DISENO',
  DESCARTADO: 'DESCARTADO'
};

export const MMC_ENGINE_REGISTRY = [
  {
    id: 'math-jsxgraph',
    label: 'Motor visual matemático',
    engine: 'jsxgraph',
    adapter: './adapters/jsxgraphAdapter.js',
    // Verificado en node_modules/jsxgraph/package.json el 2026-09-30.
    version: '1.13.3',
    license: 'MIT OR LGPL-3.0-or-later',
    licenseBranch: 'MIT',
    vendor: 'src/vendor/jsxgraph',
    offline: true,
    // Qué resuelve el motor, con veracidad.
    capabilities: [
      'curvas de función y paramétricas',
      'curvas polares e implícitas',
      'data plots con arrays crudos',
      'geometría dinámica (puntos, rectas, circunferencias, polígonos)',
      'transformaciones y matrices de transformación',
      'sampling in-process (curve.X/curve.Y)',
      'zoom y pan nativos'
    ],
    // Lo que NO resuelve. Declararlo aquí evita prometer CAS.
    limits: [
      'no es un CAS: sin simplify, solve ni derivación simbólica cerrada',
      'no renderiza LaTeX de forma nativa',
      'sin toolbox DSP: sin FFT, STFT ni wavelets',
      'los puntos que dibuja son adaptativos, no una rejilla temporal'
    ],
    estado: MMC_ESTADO.OPERACIONAL
  },
  {
    id: 'math-pyodide',
    label: 'Motor computacional',
    engine: 'pyodide',
    adapter: null,
    version: 'verificar en runtime',
    license: 'MIT / PSF',
    licenseBranch: null,
    vendor: null,
    offline: false,
    capabilities: [
      'SymPy · álgebra simbólica (CAS)',
      'NumPy · álgebra numérica',
      'SciPy · señal, optimización e integración',
      'registro como motor computacional, nunca como interfaz principal'
    ],
    limits: [
      'NO es interfaz principal: el usuario no debe escribir Python para modelar',
      'descarga el runtime desde CDN: sin offline en la fase actual',
      'la integración existente (S40) está parcial y sin reparación'
    ],
    // Declarado, no conectado por este pilar. La conexión es una fase posterior.
    estado: MMC_ESTADO.PARCIAL
  },
  {
    id: 'math-sympy',
    label: 'CAS simbólico',
    engine: 'sympy',
    adapter: null,
    version: null,
    license: 'MIT',
    licenseBranch: 'MIT',
    vendor: null,
    offline: false,
    capabilities: ['simplify', 'solve', 'dsolve', 'integrate simbólica'],
    limits: ['requiere Pyodide como runtime'],
    // Declarado para que la frontera quede escrita. NO implementado.
    estado: MMC_ESTADO.DISENO
  },
  {
    id: 'math-geogebra',
    label: 'Geometría y CAS assistidos',
    engine: 'geogebra',
    adapter: null,
    version: null,
    license: 'EUPL-1.2 (código) · producto solo no comercial',
    licenseBranch: null,
    vendor: null,
    offline: false,
    capabilities: ['geometría constructiva', 'CAS símbolo'],
    limits: [
      'el producto y sus servicios web se distribuyen solo para uso no comercial',
      'language files bajo CC BY-NC-SA 4.0',
      'no alineado con la dirección futura de SIGCT-Rural'
    ],
    // Fuera del camino crítico por licencia. No es un pendiente: es una decisión.
    estado: MMC_ESTADO.DESCARTADO
  },
  {
    id: 'math-jupyterlite',
    label: 'Notebooks en el navegador',
    engine: 'jupyterlite',
    adapter: null,
    version: null,
    license: 'BSD-3-Clause',
    licenseBranch: null,
    vendor: null,
    offline: false,
    capabilities: ['celdas, shell Python, notebooks'],
    limits: ['sitio pre-construido', 'corre en WebWorker', 'no manipula el DOM'],
    // Diferido. Pyodide va primero.
    estado: MMC_ESTADO.DISENO
  }
];

/** Motores con adapter operativo, indexados por id. */
export const MMC_ACTIVE_ENGINES = MMC_ENGINE_REGISTRY
  .filter((e) => e.estado === MMC_ESTADO.OPERACIONAL && e.adapter)
  .reduce((acc, e) => ({ ...acc, [e.id]: e }), {});

export const getEngine = (id) => MMC_ENGINE_REGISTRY.find((e) => e.id === id) || null;

/**
 * Fila que describe el motor visual oficial del Laboratorio Matemático.
 * Los componentes la importan en vez de hardcodear nombres de motor.
 */
export const VISUAL_ENGINE = getEngine('math-jsxgraph');

/** Motores declarados sin adapter: lo que el MMC todavía NO puede hacer. */
export const DECLARED_ONLY_ENGINES = MMC_ENGINE_REGISTRY.filter((e) => !e.adapter);

export default MMC_ENGINE_REGISTRY;