import React, { useEffect, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_AI_API_BASE || 'https://sigct-backend.onrender.com'; // Cloud por defecto, local si defines VITE_AI_API_BASE
const TFJS_SRC = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.14.0/dist/tf.min.js';
const MOBILENET_SRC = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js';
// Modelos TFJS públicos (graph models) para pruebas sin hosting propio
const PRESET_MODELS = [
  {
    name: 'MobileNet V2 (1.0, 224)',
    url: 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v2_1.0_224/model.json',
    labels: '', // opcional; si no hay, mostrará clase_<index>
  },
  {
    name: 'MobileNet V1 (1.0, 224)',
    url: 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json',
    labels: '',
  },
];

const AIPredictiva = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('cloud'); // 'cloud' | 'browser'
  const [tfReady, setTfReady] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [labelsUrl, setLabelsUrl] = useState('');
  const [customModel, setCustomModel] = useState(null);
  const [customModelType, setCustomModelType] = useState(null); // 'graph' | 'layers'
  const [customLabels, setCustomLabels] = useState(null);
  const [modelReady, setModelReady] = useState(false);
  const [labelsSourceType, setLabelsSourceType] = useState('simple'); // 'simple' | 'imagenet'
  const imgRef = useRef(null);

  useEffect(() => {
    // Si el modo es navegador, cargar TFJS y MobileNet vía CDN
    if (mode !== 'browser' || tfReady) return;
    const s1 = document.createElement('script'); s1.src = TFJS_SRC; s1.async = true;
    const s2 = document.createElement('script'); s2.src = MOBILENET_SRC; s2.async = true;
    s1.onload = () => { document.body.appendChild(s2); };
    s2.onload = () => { setTfReady(true); };
    s1.onerror = () => { setError('No se pudo cargar TensorFlow.js'); };
    s2.onerror = () => { setError('No se pudo cargar MobileNet'); };
    document.body.appendChild(s1);
    return () => {
      try { document.body.removeChild(s1); } catch {}
      try { document.body.removeChild(s2); } catch {}
    };
  }, [mode, tfReady]);

  const handleInferCloud = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let res;
      if (file) {
        const form = new FormData();
        form.append('file', file);
        res = await fetch(`${API_BASE}/infer`, { method: 'POST', body: form });
      } else if (imageUrl.trim()) {
        res = await fetch(`${API_BASE}/infer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: imageUrl.trim() }),
        });
      } else {
        setError('Proporcione una URL o suba un archivo de imagen.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || `Error HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const inferInputSize = (model) => {
    try {
      // Para modelos tfjs-layers
      if (model?.inputs?.[0]?.shape) {
        const shape = model.inputs[0].shape; // [null, h, w, c]
        const h = shape[1] || 224; const w = shape[2] || 224;
        return { h, w };
      }
      // Para modelos tfjs-graph
      if (model?.executor?._graph?.inputs?.[0]?.shape) {
        const shape = model.executor._graph.inputs[0].shape; // [1, h, w, c]
        const h = shape[1] || 224; const w = shape[2] || 224;
        return { h, w };
      }
    } catch {}
    return { h: 224, w: 224 };
  };

  const preprocessImageToTensor = (imgEl, size) => {
    // eslint-disable-next-line no-undef
    const tf = window.tf;
    const { h, w } = size || { h: 224, w: 224 };
    return tf.tidy(() => {
      let t = tf.browser.fromPixels(imgEl);
      t = tf.image.resizeBilinear(t, [h, w]);
      t = t.toFloat().div(255.0);
      // Añadir batch dim
      return t.expandDims(0);
    });
  };

  const loadTfjsModelByUrl = async () => {
    try {
      setError(null); setResult(null); setModelReady(false);
      if (!tfReady) throw new Error('TensorFlow.js no está cargado aún.');
      if (!modelUrl.trim()) throw new Error('Proporcione la URL del modelo TFJS (model.json).');
      // eslint-disable-next-line no-undef
      const tf = window.tf;
      let model = null; let type = null;
      // Intentar graph model primero
      try {
        model = await tf.loadGraphModel(modelUrl.trim()); type = 'graph';
      } catch (e1) {
        // Fallback a layers
        model = await tf.loadLayersModel(modelUrl.trim()); type = 'layers';
      }
      setCustomModel(model);
      setCustomModelType(type);
      setModelReady(true);
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const fetchLabelsByUrl = async () => {
    try {
      setError(null);
      if (!labelsUrl.trim()) throw new Error('Proporcione la URL del archivo de etiquetas (JSON).');
      const res = await fetch(labelsUrl.trim());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (labelsSourceType === 'imagenet') {
        // Espera formato ImageNet class index: {"0": ["n01440764", "tench"], ...}
        const labels = [];
        for (const [k, v] of Object.entries(data)) {
          const idx = Number(k);
          const name = Array.isArray(v) ? (v[1] || String(v[0] || `clase_${idx}`)) : String(v);
          labels[idx] = name;
        }
        if (!labels.length) throw new Error('El JSON de ImageNet no contiene entradas válidas.');
        setCustomLabels(labels);
      } else {
        // Acepta formato {"labels":["...","..."]} o array directo
        const labels = Array.isArray(data) ? data : (data.labels || []);
        if (!labels.length) throw new Error('El JSON de etiquetas no contiene elementos.');
        setCustomLabels(labels);
      }
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const argTopK = (tensor, k = 3) => {
    // eslint-disable-next-line no-undef
    const tf = window.tf;
    return tf.tidy(() => {
      const t = tensor.squeeze();
      const values = t.arraySync();
      const arr = Array.from(values);
      const idx = arr.map((v, i) => ({ i, v })).sort((a, b) => b.v - a.v).slice(0, k);
      return idx.map(({ i, v }) => ({ index: i, prob: Number(v) }));
    });
  };

  const handleInferBrowser = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (!tfReady) throw new Error('TensorFlow.js no está cargado aún.');
      const useCustom = !!customModel && modelReady;
      // eslint-disable-next-line no-undef
      const mobilenetModel = useCustom ? null : await window.mobilenet.load({ version: 2, alpha: 1.0 });
      // Preparar imagen desde URL o archivo
      let src = imgSrc;
      if (!src) {
        if (file) {
          const fr = new FileReader();
          const frPromise = new Promise((resolve, reject) => {
            fr.onload = () => resolve(fr.result);
            fr.onerror = reject;
          });
          fr.readAsDataURL(file);
          src = await frPromise;
        } else if (imageUrl.trim()) {
          src = imageUrl.trim();
        } else {
          throw new Error('Proporcione una URL o suba un archivo de imagen.');
        }
      }
      await new Promise((resolve, reject) => {
        if (!imgRef.current) return reject(new Error('imgRef no disponible'));
        imgRef.current.crossOrigin = 'anonymous';
        imgRef.current.onload = () => resolve(true);
        imgRef.current.onerror = () => reject(new Error('No se pudo cargar la imagen en el navegador'));
        imgRef.current.src = src;
      });
      if (!useCustom) {
        const predictions = await mobilenetModel.classify(imgRef.current);
        const top = predictions[0] || { className: 'desconocido', probability: 0 };
        const out = {
          mode: 'browser_tfjs_mobilenet',
          top_class_label: top.className,
          confidence: Number(top.probability.toFixed(5)),
          top3: predictions.map(p => ({ label: p.className, prob: Number(p.probability.toFixed(5)) })),
        };
        setResult(out);
      } else {
        // Inferencia con modelo TFJS personalizado
        // eslint-disable-next-line no-undef
        const tf = window.tf;
        const size = inferInputSize(customModel);
        const input = preprocessImageToTensor(imgRef.current, size);
        let logits;
        if (customModelType === 'layers') {
          logits = customModel.predict(input);
        } else {
          logits = customModel.execute(input);
        }
        const topK = argTopK(logits, 3);
        const top = topK[0] || { index: 0, prob: 0 };
        const label = customLabels ? (customLabels[top.index] || `clase_${top.index}`) : `clase_${top.index}`;
        const out = {
          mode: `browser_tfjs_${customModelType}`,
          top_class_label: label,
          confidence: Number(top.prob.toFixed(5)),
          top3: topK.map(({ index, prob }) => ({ label: customLabels ? (customLabels[index] || `clase_${index}`) : `clase_${index}`, prob: Number(prob.toFixed(5)) })),
          input_size: size,
        };
        setResult(out);
        tf.dispose([input, logits]);
      }
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 p-6 min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center" style={{
          color: '#00FFFF',
          textShadow: '0 0 15px #00FFFF, 0 0 10px #00FFFFAA'
        }}>
          Diagnóstico por Inteligencia Artificial
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Prueba el servicio de inferencia: sube una imagen o pega una URL pública.
          El backend devuelve la clase top y la confianza del modelo.
        </p>

        <div className="bg-gray-900 bg-opacity-70 border-2 border-[#00FFFF] rounded-xl p-6 shadow-[0_0_15px_#00FFFF80]">
          <div className="mb-4">
            <label className="block mb-2">URL de imagen</label>
            <input
              className="w-full p-2 bg-black border border-gray-700 rounded"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">o subir archivo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null; setFile(f);
                if (f) { const r = new FileReader(); r.onload = () => setImgSrc(r.result); r.readAsDataURL(f); }
              }}
            />
          </div>

          {/* Selector de modo */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-400">Modo:</span>
            <button onClick={() => setMode('cloud')} className={`px-3 py-1 rounded text-sm border ${mode==='cloud'?'bg-gray-800':''}`} style={{ borderColor: '#00FFFF', color: '#e6edf3' }}>Nube</button>
            <button onClick={() => setMode('browser')} className={`px-3 py-1 rounded text-sm border ${mode==='browser'?'bg-gray-800':''}`} style={{ borderColor: '#39FF14', color: '#e6edf3' }}>Navegador (TFJS)</button>
            {mode === 'browser' && (
              <span className="text-xs ml-2" style={{ color: tfReady ? '#39FF14' : '#FF3131' }}>{tfReady ? 'TFJS listo' : 'Cargando TFJS...'}</span>
            )}
          </div>

          {/* Carga de modelo TFJS por URL */}
          {mode === 'browser' && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Selector de presets */}
              <div className="md:col-span-2">
                <label className="block mb-2">Modelos preconfigurados</label>
                <select
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    const p = PRESET_MODELS[idx];
                    if (p) { setModelUrl(p.url); if (p.labels) setLabelsUrl(p.labels); setModelReady(false); }
                  }}
                  defaultValue={''}
                >
                  <option value="" disabled>Selecciona un modelo...</option>
                  {PRESET_MODELS.map((p, i) => (
                    <option key={p.name} value={i}>{p.name}</option>
                  ))}
                </select>
              </div>
              {/* Fuente de etiquetas */}
              <div>
                <label className="block mb-2">Fuente de etiquetas</label>
                <div className="flex gap-3 items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="labelsSrc" checked={labelsSourceType==='simple'} onChange={() => setLabelsSourceType('simple')} />
                    Lista simple (labels.json)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="labelsSrc" checked={labelsSourceType==='imagenet'} onChange={() => setLabelsSourceType('imagenet')} />
                    ImageNet Class Index
                  </label>
                </div>
              </div>
              <div>
                <label className="block mb-2">URL modelo TFJS (model.json)</label>
                <input
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  placeholder="https://.../model.json"
                  value={modelUrl}
                  onChange={(e) => setModelUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2">URL etiquetas (JSON)</label>
                <input
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  placeholder={labelsSourceType==='imagenet' ? 'https://.../imagenet_class_index.json' : 'https://.../labels.json'}
                  value={labelsUrl}
                  onChange={(e) => setLabelsUrl(e.target.value)}
                />
              </div>
              <div className="flex gap-2 items-end">
                <button onClick={loadTfjsModelByUrl} className="px-3 py-2 rounded text-sm border" style={{ borderColor: '#39FF14', color: '#e6edf3' }}>Cargar Modelo</button>
                <button onClick={fetchLabelsByUrl} className="px-3 py-2 rounded text-sm border" style={{ borderColor: '#00FFFF', color: '#e6edf3' }}>Cargar Etiquetas</button>
                <span className="text-xs ml-2" style={{ color: modelReady ? '#39FF14' : '#FF3131' }}>{modelReady ? 'Modelo listo' : 'Esperando modelo...'}</span>
              </div>
            </div>
          )}
          <button
            onClick={mode==='cloud' ? handleInferCloud : handleInferBrowser}
            disabled={loading}
            className="px-6 py-2 rounded-full font-bold text-gray-900 bg-[#39FF14] shadow-[0_0_8px_#39FF14] hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? 'Analizando...' : 'Enviar a IA'}
          </button>

          {error && (
            <div className="mt-4 text-[#FF3131]">
              Error: {error}
              <div className="text-sm text-gray-400 mt-2">
                Verifique que el servicio esté corriendo en {API_BASE} y que exista un modelo en <code>src/ai_models/production_models</code>.
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#39FF14' }}>Resultado</h2>
              <pre className="bg-black p-4 rounded overflow-auto text-sm">
{JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>
            Recursos libres sugeridos: PlantVillage (dataset), TensorFlow CPU, IPFS para almacenamiento descentralizado de imágenes.
            La inferencia es real cuando se coloca un modelo entrenado (.h5/.keras) en <code>src/ai_models/production_models</code>.
          </p>
          <p className="mt-2">En modo navegador se usa MobileNet (pre-entrenado en ImageNet) vía CDN; también puedes cargar tu propio modelo TFJS por URL (model.json) y etiquetas JSON.</p>
        </div>
        {/* Imagen oculta para TFJS */}
        <img ref={imgRef} alt="tfjs-input" style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default AIPredictiva;