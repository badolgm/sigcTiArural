// MMC · Contrato de workspace.model — ARQUITECTURA PREPARADA, NO IMPLEMENTADA.
//
// ESTE FICHERO NO IMPLEMENTA EL WORKSPACE. Define la FORMA que tendrá un modelo
// matemático cuando exista, y el constructor que produce un objeto con esa
// forma. Intencionalmente NO hace ninguna de estas cosas:
//
//   · no escribe en useLabStore ni en ningún store
//   · no escribe en el Knowledge Hub ni en ningún registro
//   · no crea señales, ni ledger, ni documentos
//   · no se conecta con Electrónica, Telecom ni IA
//
// Por qué así: el MMC produce hoy SIMULACIÓN. El modelo es la unidad que un día
// ha de viajar por el ecosistema, y su forma debe quedar escrita ANTES de que
// exista un solo consumidor. Declarar la forma ahora evita que el día que se
// conecte cada instrumento invente la suya.
//
// La fuente de verdad del modelo es el MMC, no el motor: `implementation`
// declara qué motor lo dibujó, pero no lo ata. Un modelo calculado en JSXGraph y
// el mismo calculado en SymPy deben producir el mismo envelope.

/** Estados canónicos. Aplicar a `estado`. */
export const MODEL_ESTADO = {
  SIM: 'SIM',
  REAL: 'REAL',
  REAL_LOCAL: 'REAL-LOCAL',
  DISENO: 'DISENO',
  ROTO: 'ROTO',
  HUERFANO: 'HUERFANO',
  REF: 'REF'
};

/**
 * Forma del envelope. Documental y declarativa: la documentación vive junto al
 * código para que no se desincronice.
 */
export const WORKSPACE_MODEL_SHAPE = {
  id: 'string · identificador único del modelo',
  kind: 'string · function | signal | matrix | geometry | system | numeric-plot | symbolic',
  label: 'string · nombre legible',
  expression: 'string · expresión tal como la escribió el usuario',
  parameters: 'object · parámetros nombrados que la fijan',
  domain: '{ t0:number, t1:number, fs:number } · dominio y rejilla de muestreo',
  implementation: {
    engine: 'string · id del registro de motores (mmc/engines.js)',
    version: 'string · versión del motor',
    adapter: 'string · módulo adapter que lo produjo',
    license: 'string · rama de licencia del motor'
  },
  reproducibility: {
    deterministic: 'boolean · misma entrada ⇒ misma salida',
    seed: 'number|null · semilla si el modelo es estocástico',
    artifact: 'string|null · referencia al artefacto si existe'
  },
  signal: {
    // YA CALCULADO por el adapter. Se adjunta, no se promete: si el modelo no
    // emite señal, `signal` es null y punto.
    time: 'Float64Array|null · eje temporal uniforme',
    values: 'Float64Array|null · valores en la misma rejilla',
    fs: 'number|null · frecuencia de muestreo en Hz',
    sampleCount: 'number · longitud de ambas arrays'
  },
  estado: 'string · canon de 7 estados',
  clase_senal: 'string · REAL | REMOTA | LOCAL | SIMULADA | HISTORICA | IA | GENERADA | EXPERIMENTAL',
  dominio: 'string · dominio científico del modelo',
  confianza: 'number 0..1 · ortogonal al estado; nunca lo sube',
  metadata: {
    createdAt: 'string · ISO 8601',
    producedBy: 'string · instrumento que lo produjo',
    provenance: 'string · cadena de derivación legible',
    evidence_id: 'string|null · ancla de evidencia si llega a existir'
  }
};

/**
 * Construye un envelope de modelo.
 *
 * No valida contra un esquema externo ni normaliza: solo fija las claves y
 * aplicaDefaults explícitos para que un consumidor futuro no adivine.
 *
 * @param {object} input
 * @returns {object} envelope con la forma de WORKSPACE_MODEL_SHAPE
 */
export function buildWorkspaceModel(input = {}) {
  const {
    id,
    kind = 'numeric-plot',
    label = 'Modelo sin etiqueta',
    expression = '',
    parameters = {},
    domain = { t0: 0, t1: 1, fs: 1000 },
    implementation = {},
    reproducibility = {},
    signal = null,
    estado = MODEL_ESTADO.SIM,
    clase_senal = 'GENERADA',
    dominio: dominioCientifico = 'matematico',
    confianza = 1,
    metadata = {}
  } = input;

  const now = new Date().toISOString();

  return {
    id,
    kind,
    label,
    expression,
    parameters: { ...parameters },
    domain: {
      t0: domain.t0,
      t1: domain.t1,
      fs: domain.fs
    },
    implementation: {
      engine: implementation.engine ?? null,
      version: implementation.version ?? null,
      adapter: implementation.adapter ?? null,
      license: implementation.license ?? null
    },
    reproducibility: {
      deterministic: reproducibility.deterministic ?? true,
      seed: reproducibility.seed ?? null,
      artifact: reproducibility.artifact ?? null
    },
    signal: signal
      ? {
          time: signal.time ?? null,
          values: signal.values ?? null,
          fs: signal.fs ?? null,
          sampleCount: signal.sampleCount ?? null
        }
      : null,
    estado,
    clase_senal: clase_senal,
    dominio: dominioCientifico,
    confianza,
    metadata: {
      createdAt: now,
      producedBy: metadata.producedBy ?? 'mmc',
      provenance: metadata.provenance ?? '',
      evidence_id: metadata.evidence_id ?? null
    }
  };
}

/**
 * Puntos de integración futuros. Declarados, NO implementados.
 *
 * Sirven como contrato con las fases posteriores: cada destino sabe qué espera
 * recibir, y hoy nadie lo consume. Que esten escritos evita la integración
 * speculativa.
 */
export const MODEL_INTEGRATION_POINTS = [
  {
    id: 'workspace.signal',
    destino: 'evidence ledger',
    estado: 'DISENO',
    requiere: 'time[] y values[] en rejilla uniforme',
    disponible: true,
    nota: 'los adapters ya entregan las arrays; falta el ledger'
  },
  {
    id: 'knowledge-hub',
    destino: 'registro de conocimiento',
    estado: 'DISENO',
    requiere: 'evidence_id + provenance',
    disponible: false,
    nota: 'prohibido escribir al KH hasta la misión de gobernanza'
  },
  {
    id: 'electronica',
    destino: 'comparación teoría vs medición',
    estado: 'DISENO',
    requiere: 'estado SIM explícito y clase_senal',
    disponible: false,
    nota: 'fuera de esta misión por restricción explícita'
  },
  {
    id: 'telecom',
    destino: 'análisis espectral',
    estado: 'DISENO',
    requiere: 'fs declarado y muestreo uniforme',
    disponible: true,
    nota: 'fuera de esta misión por restricción explícita'
  },
  {
    id: 'ia-predictiva',
    destino: 'features y ground truth',
    estado: 'DISENO',
    requiere: 'reproducibilidad y estado de datos',
    disponible: false,
    nota: 'fuera de esta misión por restricción explícita'
  }
];

/** Lo que el MMC todavía NO puede hacer, escrito para no prometerlo. */
export const MODEL_NOT_IMPLEMENTED = [
  'workspace.signal completo',
  'evidence ledger',
  'regeneración del knowledge registry',
  'conexión con Electrónica, Telecom o IA',
  'motor CAS (SymPy)',
  'MMC Workbench completo'
];

export default WORKSPACE_MODEL_SHAPE;