// TAXONOMÍA AGRÍCOLA V2 · espejo de solo lectura para presentación en la UI.
//
// Autoridad: docs/ai/manifests/taxonomy_binding_manifest.agriculture_v2_taxonomy_v1.yaml
//            docs/ai/manifests/model_registry.agriculture_v2.yaml
//            src/backend/infrastructure/external/ai_service/semantic_prediction_resolver.py
//            src/ai_models/model_identity.py (M2_CLASS_LABELS)
//
// ESTE ARCHIVO NO ES FUENTE DE VERDAD. Es un espejo declarativo para mostrar
// etiquetas legibles cuando el backend declara `semantic_contract_version: v2`
// o un `canonical_class_id`. Si hay divergencia, mandan los manifests citados.
// Nunca inventa una clase: un id desconocido devuelve null y la UI conserva
// el texto crudo declarado por el servicio. No cambia procedencia, no promueve
// M2 sobre M1 y no convierte un resultado de investigación en diagnóstico de campo.

export const AGRICULTURE_TAXONOMY_VERSION = 'agriculture_v2_taxonomy_v1';
export const AGRICULTURE_CONTRACT_V2 = 'v2';

const SPECIES_LABELS = Object.freeze({
  corn: 'Maíz',
  potato: 'Papa',
  tomato: 'Tomate',
});

// Clave = canonical_class_id. Orden alfabético ImageFolder (idéntico a
// M2_CLASS_LABELS). `conditionLabel` es solo presentación en español.
const CLASS_DISPLAY = Object.freeze({
  'corn__cercospora_gray_leaf_spot': { species: 'corn', condition: 'cercospora_gray_leaf_spot', conditionLabel: 'Mancha gris por Cercospora', healthState: 'warning' },
  'corn__common_rust': { species: 'corn', condition: 'common_rust', conditionLabel: 'Roya común', healthState: 'warning' },
  'corn__healthy': { species: 'corn', condition: 'healthy', conditionLabel: 'Sano', healthState: 'healthy' },
  'corn__northern_leaf_blight': { species: 'corn', condition: 'northern_leaf_blight', conditionLabel: 'Tizón foliar del norte', healthState: 'warning' },
  'potato__early_blight': { species: 'potato', condition: 'early_blight', conditionLabel: 'Tizón temprano', healthState: 'warning' },
  'potato__healthy': { species: 'potato', condition: 'healthy', conditionLabel: 'Sano', healthState: 'healthy' },
  'potato__late_blight': { species: 'potato', condition: 'late_blight', conditionLabel: 'Tizón tardío', healthState: 'warning' },
  'tomato__bacterial_spot': { species: 'tomato', condition: 'bacterial_spot', conditionLabel: 'Mancha bacteriana', healthState: 'warning' },
  'tomato__early_blight': { species: 'tomato', condition: 'early_blight', conditionLabel: 'Tizón temprano', healthState: 'warning' },
  'tomato__healthy': { species: 'tomato', condition: 'healthy', conditionLabel: 'Sano', healthState: 'healthy' },
  'tomato__late_blight': { species: 'tomato', condition: 'late_blight', conditionLabel: 'Tizón tardío', healthState: 'warning' },
  'tomato__leaf_mold': { species: 'tomato', condition: 'leaf_mold', conditionLabel: 'Moho de la hoja', healthState: 'warning' },
  'tomato__mosaic_virus': { species: 'tomato', condition: 'mosaic_virus', conditionLabel: 'Virus del mosaico', healthState: 'warning' },
  'tomato__septoria_leaf_spot': { species: 'tomato', condition: 'septoria_leaf_spot', conditionLabel: 'Mancha foliar por Septoria', healthState: 'warning' },
  'tomato__target_spot': { species: 'tomato', condition: 'target_spot', conditionLabel: 'Mancha diana', healthState: 'warning' },
  'tomato__yellow_leaf_curl_virus': { species: 'tomato', condition: 'yellow_leaf_curl_virus', conditionLabel: 'Virus del rizado amarillo', healthState: 'warning' },
});

export const CANONICAL_CLASS_IDS = Object.freeze(Object.keys(CLASS_DISPLAY));

const clean = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
};

/** Fail-closed: un id no declarado jamás se inventa ni se reetiqueta. */
export const describeCanonicalClass = (canonicalClassId) => {
  const id = clean(canonicalClassId);
  const entry = id ? CLASS_DISPLAY[id] : null;
  if (!entry) return null;
  return Object.freeze({
    canonicalClassId: id,
    species: entry.species,
    speciesLabel: SPECIES_LABELS[entry.species] || entry.species,
    condition: entry.condition,
    conditionLabel: entry.conditionLabel,
    healthState: entry.healthState,
    taxonomyVersion: AGRICULTURE_TAXONOMY_VERSION,
  });
};

/**
 * Enriquece SOLO una respuesta v2 declarada. En v1 o sin canonical_class_id
 * devuelve null: la UI conserva el contrato binario histórico sin mezclarlo.
 */
export const buildTaxonomyView = (prediction = {}) => {
  const contract = String(prediction?.semantic_contract_version || '').toLowerCase();
  const declaredId = clean(prediction?.canonical_class_id);
  if (contract !== AGRICULTURE_CONTRACT_V2 && !declaredId) return null;
  const described = describeCanonicalClass(declaredId || prediction?.canonical_class_id);
  return {
    contractVersion: contract || null,
    declaredClassId: declaredId,
    resolved: Boolean(described),
    display: described,
    // TODO campaign: la taxonomía v2 tiene 61 clases gobernadas en docs/acoustic/;
    // este espejo cubre únicamente las 16 clases del contrato agrícola v2.
    scope: 'agriculture_multiclass16',
  };
};
