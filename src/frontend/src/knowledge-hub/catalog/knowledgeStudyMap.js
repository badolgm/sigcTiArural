// knowledgeStudyMap.js — mapa didáctico declarativo del Knowledge Hub (Corte A).
// Filosofía: ingeniería de software aplicada a sigcTiArural. Cinco capas de estudio,
// relaciones conceptuales (entidades / módulos / contratos) y un apéndice plegable
// para auditorías de herramienta. CERO contenido nuevo en Markdown y CERO borrados:
// las 51 entradas del registry siguen intactas; aquí sólo se reorganiza su lectura.
//
// Regla de honestidad: los estados (REAL / REAL-LOCAL / REF / SIM / DISENO) son
// etiquetas de procedencia, no publicidad. Lo que es DISEÑO no se presenta como operativo.

export const CATEGORY_ORDER = [
  'project-core',
  'eiarc-foundation',
  'eiarc-architecture',
  'research-v2',
  'knowledge-base',
  'historical',
];

export const CATEGORY_LABELS = {
  'project-core': 'Núcleo del proyecto',
  'eiarc-foundation': 'Fundación EIARC',
  'eiarc-architecture': 'Arquitectura y contratos',
  'research-v2': 'Investigación aplicada v2',
  'knowledge-base': 'Base de conocimiento (contexto)',
  historical: 'Histórico',
};

// Ruido de herramienta: 6 fichas KB + 3 duplicados históricos. NO se eliminan:
// se excluyen de la ruta principal y se muestran en un apéndice opcional.
export const AUDIT_NOISE_IDS = Object.freeze([
  'kb_001_trae_independent_repository_audit',
  'kb_002_readme_reality_check',
  'kb_003_ai_integration_audit',
  'kb_004_ai_semantic_contract_audit',
  'kb_005_eiarc_ai_canonical_model',
  'kb_006_pending_changes_audit',
  'historical_readme_reality_check',
  'historical_trae_ai_integration_audit',
  'historical_trae_independent_repository_audit',
]);

// Punto de partida: cómo se construyó el proyecto. Se muestra siempre, aunque
// estos documentos también aparecen en su capa correspondiente.
export const FOUNDATION = Object.freeze({
  id: 'fundamentos',
  title: 'Punto de partida',
  subtitle: 'Cómo se construyó sigcTiArural',
  docIds: [
    'readme',
    'masterdoc',
    'plan_maestro',
    'system_boot',
    'adso_guia',
    'api_reference',
    'edge_setup',
    'eiarc_mission',
    'eiarc_scope',
    'eiarc_vision',
  ],
});

// Cinco capas didácticas. Los docIds son IDs REALES del registry (51 docs).
export const STUDY_LAYERS = [
  {
    id: 'captura-senales',
    index: '01',
    title: 'Captura y señales',
    subtitle: 'Qué se mide y con qué instrumento',
    question: '¿Qué se mide, quién lo produce y bajo qué contrato entra al ecosistema?',
    outcomes: [
      'Distinguir señal real de señal simulada o de referencia',
      'Identificar productor, puerto y estado honesto de cada captura',
      'Leer un contrato de captura sin asumir datos que no existen',
    ],
    docIds: [
      'system_boot',
      'edge_setup',
      'eiarc_telemetry_context_implementation_guide',
      'eiarc_telemetry_context_refactor_plan',
    ],
    signals: ['S10', 'S11', 'S30', 'S50'],
    entities: ['ProductorDeSenal', 'Senal', 'Envelope de señal', 'Puerto de lectura'],
    modules: ['spectralEngine.js', 'AcousticLoggerPanel.jsx', 'bridge/server.js', 'Edge Setup (BBB)'],
    contracts: ['source_tier=T0', 'capture_source=usb_webcam', 'frame_ids[] perezoso', 'split_group_key=video_id'],
    prerequisites: [],
  },
  {
    id: 'transporte-telemetria',
    index: '02',
    title: 'Transporte y telemetría',
    subtitle: 'Cómo llega la señal al dashboard',
    question: '¿Qué capa transporta, persiste y expone la señal a los consumidores?',
    outcomes: [
      'Trazar el camino sensor → backend → frontend',
      'Leer un puerto (P-*) como contrato, no como una simple implementación',
      'Detectar un consumidor roto sin culpar al productor',
    ],
    docIds: [
      'api_reference',
      'eiarc_contexts',
      'eiarc_canonical_data_model',
      'eiarc_implementation_blueprint',
      'eiarc_transformation_plan',
      'eiarc_telemetry_database_diagnostic',
      'eiarc_telemetry_pr1_code_review',
    ],
    signals: ['S10', 'S11', 'S50', 'S63'],
    entities: ['TelemetryContext', 'SensorReading', 'RobotTelemetry', 'Puerto P-*'],
    modules: ['backend /api', 'useLabStore', 'TelemetryPanel.jsx', 'bridge 127.0.0.1:8766'],
    contracts: ['HTTP/V3 + /api/health', 'puertos P-BE-01 / P-LAB-02', 'estado REAL vs ROTO'],
    prerequisites: ['captura-senales'],
  },
  {
    id: 'datos-gobernanza',
    index: '03',
    title: 'Datos y gobernanza',
    subtitle: 'Cómo se convierte evidencia en dataset',
    question: '¿Qué reglas hacen que un dato sea comparable, trazable y reutilizable?',
    outcomes: [
      'Leer un esquema (42 columnas) y sus reglas de versión',
      'Separar universos REF y C0 sin mezclarlos',
      'Explicar por qué un gate abierto bloquea una conclusión',
    ],
    docIds: [
      'masterdoc',
      'plan_maestro',
      'adso_guia',
      'eiarc_canonical_principles',
      'research_v2_agriculture_ai_v2_label_schema',
      'research_v2_agriculture_ai_v2_taxonomy',
      'research_v2_agriculture_ai_v2_split_specification',
      'research_v2_agriculture_ai_v2_data_quality_framework',
      'research_v2_ai_dataset_strategy_v2',
      'research_v2_ai_dataset_discovery_and_audit',
      'research_v2_ai_mlops_and_training_governance_v2',
    ],
    signals: ['S70', 'S71', 'S79'],
    entities: ['Dataset', 'Schema/Contrato', 'Split', 'Gate G-DS'],
    modules: ['metadata/schema.json', 'metadata.csv', 'manifests/*.yaml', 'docsBySignal.js'],
    contracts: ['schema 1.3.0 · 42 columnas', 'REF ≠ C0', 'G-DS-1 FAIL · G-DS-2 incumplido'],
    prerequisites: ['transporte-telemetria'],
  },
  {
    id: 'modelos-inferencia',
    index: '04',
    title: 'Modelos e inferencia',
    subtitle: 'Cómo se entrena, se sirve y se gobierna',
    question: '¿Qué significa que un modelo exista, sirva tráfico y no por eso sea oficial?',
    outcomes: [
      'Diferenciar baseline oficial de challenger validado',
      'Leer un contrato de inferencia y sus límites (MIME, calibración)',
      'Aplicar la regla servir != promover',
    ],
    docIds: [
      'eiarc_ai_context_implementation_guide',
      'eiarc_ai_context_refactor_plan',
      'eiarc_ai_pr1_code_review',
      'eiarc_ai_semantic_contract',
      'research_v2_agriculture_ai_v2_execution_plan',
      'research_v2_agriculture_ai_v2_benchmark_readiness',
      'research_v2_agriculture_ai_v2_notebook_roadmap',
      'research_v2_ai_training_pipeline_v2',
      'research_v2_ai_prediction_validation_audit',
      'research_v2_ai_scientific_correction_design',
      'research_v2_sigct_rural_ai_research_program_v2',
    ],
    signals: ['S61', 'S63', 'S72', 'S73', 'S74'],
    entities: ['Modelo M1 (baseline)', 'Modelo M2 (challenger)', 'Contrato de inferencia', 'Predicción'],
    modules: ['fastapi_app.py', 'model_identity.py', 'BenchmarkCell.jsx', 'VoiceAssistant.jsx'],
    contracts: ['/v3/ai/inference/ (multipart file)', '/infer (sin validar MIME)', 'ECE 0.0313 vs 0.0332'],
    prerequisites: ['datos-gobernanza'],
  },
  {
    id: 'validacion-trazabilidad',
    index: '05',
    title: 'Validación y trazabilidad',
    subtitle: 'Cómo se sostiene el conocimiento',
    question: '¿Cómo se convierte una ejecución en evidencia verificable y conocimiento consultable?',
    outcomes: [
      'Aplicar los siete estados de honestidad sin inflarlos',
      'Explicar la cadena señal → evidencia → documento → respuesta',
      'Distinguir el asistente actual del ACP como evolución futura',
    ],
    docIds: [
      'readme',
      'eiarc_mission',
      'eiarc_scope',
      'eiarc_vision',
      'eiarc_canonical_principles',
      'historical_informe_analisis_y_plan_de_accion',
      'research_v2_ai_context_v2_architecture',
      'research_v2_ai_context_v2_implementation_audit',
      'research_v2_ai_context_v2_remediation_report',
    ],
    signals: ['S63', 'S79'],
    entities: ['Evidencia', 'Ledger (DISENO)', 'Documento', 'ACP (DISENO)'],
    modules: ['KnowledgeHubLayout.jsx', 'MarkdownDocumentView.jsx', 'knowledgeDiscovery.js', 'VoiceAssistant.jsx'],
    contracts: ['7 estados de honestidad', 'registry 51 docs · 6 categorías', 'NO_DATA antes que inventar'],
    prerequisites: ['modelos-inferencia'],
  },
];

// Grafo conceptual del sistema. Nodos = cosas del dominio / código / contratos.
export const ARCHITECTURE_NODES = Object.freeze([
  { id: 'laboratorio', label: 'Laboratorios (MMC · FFT · ...)', kind: 'herramienta', estado: 'SIM / REAL-LOCAL' },
  { id: 'productor', label: 'Productor de señal', kind: 'entrada', estado: 'REAL' },
  { id: 'senal', label: 'Señal', kind: 'dominio', estado: 'REAL-LOCAL' },
  { id: 'puerto', label: 'Puerto P-*', kind: 'contrato', estado: 'REF' },
  { id: 'datos', label: 'Dataset / esquema', kind: 'datos', estado: 'REF' },
  { id: 'modelo', label: 'Modelo M1 / M2', kind: 'IA', estado: 'REF' },
  { id: 'inferencia', label: 'Contrato de inferencia', kind: 'contrato', estado: 'REAL' },
  { id: 'evidencia', label: 'Evidencia / gates', kind: 'validacion', estado: 'DISENO' },
  { id: 'documento', label: 'Documento del KH', kind: 'conocimiento', estado: 'REAL' },
  { id: 'asistente', label: 'Asistente / ACP', kind: 'evolucion', estado: 'REAL / DISENO' },
]);

export const ARCHITECTURE_EDGES = Object.freeze([
  { from: 'laboratorio', to: 'senal', label: 'modela / mide' },
  { from: 'productor', to: 'senal', label: 'produce' },
  { from: 'senal', to: 'puerto', label: 'expone' },
  { from: 'puerto', to: 'datos', label: 'normaliza' },
  { from: 'datos', to: 'modelo', label: 'entrena / evalúa' },
  { from: 'modelo', to: 'inferencia', label: 'sirve (≠ promueve)' },
  { from: 'inferencia', to: 'evidencia', label: 'registra' },
  { from: 'evidencia', to: 'documento', label: 'documenta' },
  { from: 'documento', to: 'asistente', label: 'da contexto (futuro)' },
]);

const NOISE_SET = new Set(AUDIT_NOISE_IDS);

export function isAuditNoise(doc) {
  return Boolean(doc && NOISE_SET.has(doc.id));
}

export function studyDocs(docs = []) {
  return docs.filter((doc) => !isAuditNoise(doc));
}

export function noiseDocs(docs = []) {
  return docs.filter(isAuditNoise);
}

export function layerById(id) {
  return STUDY_LAYERS.find((layer) => layer.id === id) || STUDY_LAYERS[0];
}

export function docsForLayer(id, docs = []) {
  const layer = layerById(id);
  const ids = new Set(layer.docIds);
  return studyDocs(docs).filter((doc) => ids.has(doc.id));
}

export function categoriesForDocs(docs = []) {
  const counts = new Map();
  docs.forEach((doc) => counts.set(doc.category, (counts.get(doc.category) || 0) + 1));
  return CATEGORY_ORDER.filter((category) => counts.has(category)).map((category) => ({
    id: category,
    label: CATEGORY_LABELS[category] || category,
    count: counts.get(category),
  }));
}

export function studyTotals(docs = []) {
  const study = studyDocs(docs);
  return {
    total: docs.length,
    study: study.length,
    noise: docs.length - study.length,
    categories: new Set(study.map((doc) => doc.category)).size,
  };
}
