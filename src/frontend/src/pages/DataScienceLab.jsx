import React, { useEffect, useRef, useState } from 'react';

const PYODIDE_SRC = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
const PLOTLY_SRC = 'https://cdn.plot.ly/plotly-2.27.0.min.js';
const API_BASE = import.meta.env.VITE_AI_API_BASE || 'https://sigct-backend.onrender.com';

const DataScienceLab = () => {
  const [pyodide, setPyodide] = useState(null);
  const [loadingPy, setLoadingPy] = useState(false);
  const [code, setCode] = useState(`# Ejemplo: cargar CSV público y contar filas
import js
import micropip
await micropip.install(['pandas'])
import pandas as pd
url = 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv'
df = pd.read_csv(url)
print('Filas:', len(df))
print(df.head())
`);
  const [consoleOut, setConsoleOut] = useState('');
  const chartRef = useRef(null);
  const [eventsConnected, setEventsConnected] = useState(false);

  useEffect(() => {
    // Cargar Plotly
    const s1 = document.createElement('script');
    s1.src = PLOTLY_SRC;
    s1.async = true;
    document.body.appendChild(s1);
    return () => { document.body.removeChild(s1); };
  }, []);

  const loadPyodide = async () => {
    if (pyodide || loadingPy) return;
    setLoadingPy(true);
    const s = document.createElement('script');
    s.src = PYODIDE_SRC;
    s.async = true;
    s.onload = async () => {
      // eslint-disable-next-line no-undef
      const py = await window.loadPyodide();
      setPyodide(py);
      setLoadingPy(false);
    };
    s.onerror = () => { setLoadingPy(false); };
    document.body.appendChild(s);
  };

  const runCode = async () => {
    if (!pyodide) { setConsoleOut('Pyodide no cargado. Pulsa "Cargar Python".'); return; }
    try {
      // Capturar stdout
      let buffer = '';
      pyodide.setStdout({ write: (s) => { buffer += s; } });
      await pyodide.runPythonAsync(code);
      setConsoleOut(buffer);
    } catch (e) {
      setConsoleOut(String(e));
    }
  };

  const connectEvents = () => {
    if (eventsConnected) return;
    try {
      const es = new EventSource(`${API_BASE}/events`);
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          const conf = data?.result?.confidence || 0;
          const idx = String(data?.result?.top_class_index ?? 'N/A');
          // Actualizar gráfico
          if (window.Plotly && chartRef.current) {
            window.Plotly.extendTraces(chartRef.current, { y: [[conf]] }, [0]);
            const counts = chartRef.current.__counts || {}; counts[idx] = (counts[idx] || 0) + 1; chartRef.current.__counts = counts;
            const barX = Object.keys(counts); const barY = barX.map(k => counts[k]);
            window.Plotly.react(chartRef.current, [
              { y: [], type: 'scatter', name: 'Confianza', yaxis: 'y1' },
              { x: barX, y: barY, type: 'bar', name: 'Clases', yaxis: 'y2' },
            ], { grid: { rows: 2, columns: 1, pattern: 'independent' }, height: 480, paper_bgcolor: '#0a0a0a', plot_bgcolor: '#0a0a0a', font: { color: '#e6edf3' } });
          }
        } catch {}
      };
      es.onerror = () => { es.close(); setEventsConnected(false); };
      setEventsConnected(true);
      // Bootstrap gráfico vacío
      setTimeout(() => {
        if (window.Plotly && chartRef.current) {
          window.Plotly.newPlot(chartRef.current, [ { y: [], type: 'scatter', name: 'Confianza', yaxis: 'y1' } ], { height: 480, paper_bgcolor: '#0a0a0a', plot_bgcolor: '#0a0a0a', font: { color: '#e6edf3' } });
        }
      }, 400);
    } catch {}
  };

  return (
    <div className="pt-24 p-6 min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#00FFFF', textShadow: '0 0 15px #00FFFF, 0 0 10px #00FFFFAA' }}>Ciencia de Datos (Experimentos)</h1>
        <p className="text-gray-400 mb-6">Ejecuta Python en el navegador (Pyodide), analiza datos públicos y observa métricas de IA en vivo via SSE.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 bg-opacity-70 border-2 border-[#00FFFF] rounded-xl p-4">
            <div className="flex gap-2 mb-3">
              <button onClick={loadPyodide} className="px-3 py-2 rounded font-bold text-gray-900" style={{ backgroundColor: '#39FF14', boxShadow: '0 0 8px #39FF14' }}>{loadingPy ? 'Cargando...' : 'Cargar Python'}</button>
              <button onClick={runCode} className="px-3 py-2 rounded font-bold text-gray-900" style={{ backgroundColor: '#39FF14', boxShadow: '0 0 8px #39FF14' }}>Ejecutar</button>
            </div>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} className="w-full h-48 bg-black text-gray-200 p-2 rounded" spellCheck={false} />
            <div className="mt-3 p-2 bg-black rounded text-sm" style={{ color: '#e6edf3' }}>
              <strong>Salida:</strong>
              <pre className="mt-2 whitespace-pre-wrap">{consoleOut}</pre>
            </div>
          </div>

          <div className="bg-gray-900 bg-opacity-70 border-2 border-[#00FFFF] rounded-xl p-4">
            <div className="flex gap-2 mb-3">
              <button onClick={connectEvents} className="px-3 py-2 rounded font-bold text-gray-900" style={{ backgroundColor: '#39FF14', boxShadow: '0 0 8px #39FF14' }}>{eventsConnected ? 'Conectado' : 'Conectar métricas (SSE)'}</button>
              <a href={`${API_BASE}/metrics`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded border" style={{ borderColor: '#39FF14', color: '#e6edf3' }}>Ver /metrics</a>
            </div>
            <div ref={chartRef} className="w-full" style={{ height: 480 }} />
            <p className="text-xs text-gray-400 mt-2">Actualiza con las inferencias que realices en “Diagnóstico IA”.</p>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <p>Recursos abiertos recomendados: PlantVillage (GitHub/Kaggle), Pyodide, Plotly, TensorFlow CPU.</p>
        </div>
      </div>
    </div>
  );
};

export default DataScienceLab;