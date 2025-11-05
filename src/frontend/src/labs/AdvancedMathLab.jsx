import React, { useState, useEffect, useRef } from 'react';

const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  quantum: '#ff3cc7',
  warning: '#ffa502',
  danger: '#ff3742',
  alert: '#FF3131',
  gold: '#FFD700',
  orange: '#FF8C00',
  purple: '#9932CC',
  darkBackground: '#0a0a0a',
};

const MathVisualization = ({ type, parameters }) => {
  const canvasRef = useRef(null);
  const canvas3dRef = useRef(null);
  const [selectedFunction, setSelectedFunction] = useState('complex');
  const [mathParameters, setMathParameters] = useState({ a: 1, b: 1, c: 0 });
  const [view3D, setView3D] = useState(false);
  // Controles de la vista 3D
  const [scaleXY3D, setScaleXY3D] = useState(1);   // multiplicador de escala en plano XY
  const [scaleZ3D, setScaleZ3D] = useState(1);     // multiplicador de altura Z
  const [originY3D, setOriginY3D] = useState(80);  // altura base de la proyección

  const save3DImage = () => {
    const canvas = canvas3dRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'manta3d.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const functions = {
    complex: {
      name: 'Función Compleja',
      formula: 'f(z) = z² + c',
      description: 'Mapeo conforme en el plano complejo',
      color: NEON_COLORS.quantum
    },
    mandelbrot: {
      name: 'Conjunto de Mandelbrot',
      formula: 'z_{n+1} = z_n² + c',
      description: 'Fractal generado por iteración compleja',
      color: NEON_COLORS.purple
    },
    wave: {
      name: 'Ecuación de Onda',
      formula: '∂²u/∂t² = c²∇²u',
      description: 'Propagación de ondas en medios continuos',
      color: NEON_COLORS.orange
    },
    heat: {
      name: 'Ecuación de Calor',
      formula: '∂u/∂t = α∇²u',
      description: 'Difusión térmica en materiales',
      color: NEON_COLORS.alert
    }
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 400;
    const height = canvas.height = 300;
    
    // Clear canvas
    ctx.fillStyle = NEON_COLORS.darkBackground;
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    // Draw mathematical function based on type
    ctx.strokeStyle = NEON_COLORS.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 20;
    
    // Usar la selección del panel para controlar la visualización
    const currentType = selectedFunction;

    switch (currentType) {
      case 'fourier':
        for (let x = 0; x < width; x++) {
          const t = (x - centerX) / scale;
          let y = 0;
          for (let n = 1; n <= parameters.harmonics; n++) {
            y += Math.sin(n * t * parameters.frequency) / n;
          }
          y = centerY - y * scale * parameters.amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        break;
        
      case 'complex':
        // Complex function visualization
        for (let x = 0; x < width; x++) {
          const real = (x - centerX) / scale;
          const imag = parameters.imaginary;
          const magnitude = Math.sqrt(real * real + imag * imag);
          const phase = Math.atan2(imag, real);
          const y = centerY - magnitude * Math.cos(phase + parameters.phase) * scale;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        break;
        
      case 'wave':
        // Ecuación de onda 1D: u(x,t) ≈ A sin(kx - ωt)
        const A = parameters.amplitude || 1;
        const freq = parameters.frequency || 1;
        for (let x = 0; x < width; x++) {
          const t = (x - centerX) / scale;
          const y = centerY - Math.sin(freq * t + (parameters.phase || 0)) * scale * A;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        break;

      case 'heat': {
        // Ecuación de calor 1D (difusión): u_t = α u_xx
        const N = 120;
        const alpha = 0.15; // coeficiente de difusión
        let u = new Array(N).fill(0);
        // Condición inicial: pulso/gaussiana en el centro
        const center = Math.floor(N / 2);
        for (let i = 0; i < N; i++) {
          const d = (i - center) / (N / 12);
          u[i] = Math.exp(-d * d);
        }
        // Avanzar unas iteraciones para mostrar difusión
        const steps = 180;
        for (let s = 0; s < steps; s++) {
          const next = u.slice();
          for (let i = 1; i < N - 1; i++) {
            next[i] = u[i] + alpha * (u[i - 1] - 2 * u[i] + u[i + 1]);
          }
          u = next;
        }
        // Dibujar perfil de temperatura
        ctx.strokeStyle = NEON_COLORS.alert;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const x = (i / (N - 1)) * width;
          const y = centerY - u[i] * scale * 0.8;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        break;
      }

      case 'differential':
        // Simple differential equation solution
        let y = parameters.initial;
        ctx.moveTo(0, centerY - y * scale);
        for (let x = 1; x < width; x++) {
          const t = x / scale;
          const dydt = parameters.coefficient * y;
          y += dydt * 0.1;
          ctx.lineTo(x, centerY - y * scale);
        }
        break;
        
      default:
        // Default sine wave
        for (let x = 0; x < width; x++) {
          const t = (x - centerX) / scale;
          const y = centerY - Math.sin(t * parameters.frequency) * scale * parameters.amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // Add glow effect
    ctx.shadowColor = NEON_COLORS.primary;
    ctx.shadowBlur = 10;
    ctx.stroke();
    
  }, [type, parameters, selectedFunction]);

  // Render 3D (wireframe simple) para la ecuación de onda
  useEffect(() => {
    if (!view3D) return;
    const canvas = canvas3dRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 520; const H = canvas.height = 300;
    ctx.fillStyle = NEON_COLORS.darkBackground; ctx.fillRect(0,0,W,H);

    if (selectedFunction !== 'wave') {
      ctx.fillStyle = '#aab2ba';
      ctx.font = '12px monospace';
      ctx.fillText('Vista 3D disponible para “Ecuación de Onda”.', 16, 24);
      return;
    }

    const A = parameters?.amplitude || 1;
    const freq = parameters?.frequency || 1;
    const phase = parameters?.phase || 0;

    const NX = 25, NY = 16;
    const scaleXY = 10 * scaleXY3D;
    const scaleZ = 24 * scaleZ3D;
    const originX = W/2, originY = originY3D;
    const k = freq * 0.4;

    const projectIso = (X, Y, Z) => {
      const px = originX + (X - Y) * scaleXY;
      const py = originY + (X + Y) * (scaleXY * 0.6) - Z * scaleZ;
      return [px, py];
    };

    ctx.strokeStyle = NEON_COLORS.primary; ctx.lineWidth = 1;
    for (let iy = 0; iy < NY; iy++) {
      ctx.beginPath();
      for (let ix = 0; ix < NX; ix++) {
        const Z = A * Math.sin(k * (ix + iy) + phase);
        const [px, py] = projectIso(ix, iy, Z);
        if (ix === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = NEON_COLORS.secondary;
    for (let ix = 0; ix < NX; ix++) {
      ctx.beginPath();
      for (let iy = 0; iy < NY; iy++) {
        const Z = A * Math.sin(k * (ix + iy) + phase);
        const [px, py] = projectIso(ix, iy, Z);
        if (iy === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.fillStyle = '#aab2ba';
    ctx.font = '12px monospace';
    ctx.fillText(`u(x,y)=A·sin(k(x+y)+phase) | A=${A.toFixed(2)} k=${k.toFixed(2)}`, 16, H-18);
  }, [view3D, selectedFunction, parameters, scaleXY3D, scaleZ3D, originY3D]);
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border-2" style={{ borderColor: NEON_COLORS.gold }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: NEON_COLORS.gold }}>
        📈 Visualización Matemática Avanzada
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Control */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: NEON_COLORS.primary }}>
              Función Matemática:
            </label>
            <select
              value={selectedFunction}
              onChange={(e) => setSelectedFunction(e.target.value)}
              className="w-full p-3 bg-gray-800 border rounded text-white"
              style={{ borderColor: NEON_COLORS.primary }}
            >
              {Object.entries(functions).map(([key, func]) => (
                <option key={key} value={key}>{func.name}</option>
              ))}
            </select>
            <div className="mt-3 flex items-center gap-2">
              <input
                id="view3d"
                type="checkbox"
                checked={view3D}
                onChange={(e)=>{ const v = e.target.checked; setView3D(v); if (v && selectedFunction !== 'wave') setSelectedFunction('wave'); }}
              />
              <label htmlFor="view3d" className="text-sm" style={{ color: NEON_COLORS.secondary }}>Ver en 3D (wireframe)</label>
            </div>
          </div>
          
          <div className="p-4 bg-gray-800 rounded space-y-3">
            <h4 className="font-semibold" style={{ color: functions[selectedFunction].color }}>
              {functions[selectedFunction].name}
            </h4>
            <p className="font-mono text-sm" style={{ color: NEON_COLORS.secondary }}>
              {functions[selectedFunction].formula}
            </p>
            <p className="text-xs text-gray-400">
              {functions[selectedFunction].description}
            </p>
          </div>

          {/* Parámetros */}
          <div className="space-y-3">
            <h4 className="font-semibold" style={{ color: NEON_COLORS.primary }}>Parámetros:</h4>
            {['a', 'b', 'c'].map(param => (
              <div key={param}>
                <label className="block text-xs mb-1" style={{ color: NEON_COLORS.gold }}>
                  {param.toUpperCase()}: {mathParameters[param]}
                </label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={mathParameters[param]}
                  onChange={(e) => setMathParameters({...mathParameters, [param]: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Área de Visualización */}
        <div className="lg:col-span-2 space-y-4">
          <canvas
            ref={canvasRef}
            className="border rounded-lg w-full"
            style={{ borderColor: NEON_COLORS.primary + '40' }}
          />

          {view3D && (
            <div className="space-y-3">
              <canvas
                ref={canvas3dRef}
                className="border rounded-lg w-full"
                style={{ borderColor: NEON_COLORS.secondary + '40' }}
              />

              {/* Controles de la vista 3D */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: NEON_COLORS.secondary }}>
                    Escala XY: {scaleXY3D.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.6"
                    max="2"
                    step="0.1"
                    value={scaleXY3D}
                    onChange={(e)=>setScaleXY3D(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: NEON_COLORS.orange }}>
                    Escala Z (altura): {scaleZ3D.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.6"
                    max="2"
                    step="0.1"
                    value={scaleZ3D}
                    onChange={(e)=>setScaleZ3D(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: NEON_COLORS.primary }}>
                    Altura origen (Y): {originY3D}
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    step="2"
                    value={originY3D}
                    onChange={(e)=>setOriginY3D(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={()=>setOriginY3D(150)}
                    className="px-2 py-1 text-xs rounded border"
                    style={{ borderColor: NEON_COLORS.secondary, color: NEON_COLORS.secondary }}
                  >
                    Centrar
                  </button>
                  <button
                    onClick={save3DImage}
                    className="px-2 py-1 text-xs rounded border"
                    style={{ borderColor: NEON_COLORS.primary, color: NEON_COLORS.primary }}
                  >
                    Guardar imagen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Información Matemática */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800 rounded">
              <h5 className="font-semibold mb-2" style={{ color: NEON_COLORS.secondary }}>
                Propiedades Matemáticas:
              </h5>
              <ul className="text-xs space-y-1 text-gray-300">
                <li>• Dominio: ℂ (números complejos)</li>
                <li>• Continuidad: Analítica por partes</li>
                <li>• Singularidades: Polos simples</li>
                <li>• Comportamiento asintótico: O(|z|²)</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-800 rounded">
              <h5 className="font-semibold mb-2" style={{ color: NEON_COLORS.orange }}>
                Aplicaciones Reales:
              </h5>
              <ul className="text-xs space-y-1 text-gray-300">
                {selectedFunction === 'wave' && (
                  <>
                    <li>• Acústica y vibraciones mecánicas</li>
                    <li>• Ondas en cuerdas y membranas</li>
                    <li>• Telecomunicaciones y modulación</li>
                    <li>
                      <a className="underline" href="https://en.wikipedia.org/wiki/Wave_equation" target="_blank" rel="noreferrer">Referencia: Ecuación de Onda</a>
                    </li>
                  </>
                )}
                {selectedFunction === 'heat' && (
                  <>
                    <li>• Transferencia de calor en suelos y materiales</li>
                    <li>• Modelado térmico de dispositivos</li>
                    <li>
                      <a className="underline" href="https://en.wikipedia.org/wiki/Heat_equation" target="_blank" rel="noreferrer">Referencia: Ecuación de Calor</a>
                    </li>
                  </>
                )}
                {selectedFunction === 'complex' && (
                  <>
                    <li>• Mapeos conformes y potenciales</li>
                    <li>• Visualización de funciones complejas</li>
                    <li>
                      <a className="underline" href="https://en.wikipedia.org/wiki/Complex_analysis" target="_blank" rel="noreferrer">Referencia: Análisis Complejo</a>
                    </li>
                  </>
                )}
                {selectedFunction === 'mandelbrot' && (
                  <>
                    <li>• Fractales y sistemas dinámicos</li>
                    <li>• Generación procedural de texturas</li>
                    <li>
                      <a className="underline" href="https://en.wikipedia.org/wiki/Mandelbrot_set" target="_blank" rel="noreferrer">Referencia: Conjunto de Mandelbrot</a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Fórmulas Relacionadas */}
          <div className="p-4 bg-gray-800 rounded">
            <h5 className="font-semibold mb-2" style={{ color: NEON_COLORS.quantum }}>
              Fórmulas Relacionadas:
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p style={{ color: NEON_COLORS.primary }}>Derivada Compleja:</p>
                <p className="font-mono text-xs">f'(z) = lim[h→0] (f(z+h)-f(z))/h</p>
              </div>
              <div>
                <p style={{ color: NEON_COLORS.primary }}>Integral de Contorno:</p>
                <p className="font-mono text-xs">∮_C f(z)dz = 2πi Σ Res(f,zₖ)</p>
              </div>
              <div>
                <p style={{ color: NEON_COLORS.primary }}>Serie de Laurent:</p>
                <p className="font-mono text-xs">f(z) = Σ aₙ(z-z₀)ⁿ</p>
              </div>
              <div>
                <p style={{ color: NEON_COLORS.primary }}>Transformada Z:</p>
                <p className="font-mono text-xs">X(z) = Σ x[n]z⁻ⁿ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuantumSimulator = () => {
  const [qubits, setQubits] = useState([{ state: '|0⟩', probability: 1.0, alpha: 1.0, beta: 0.0 }]);
  const [gates, setGates] = useState([]);
  const [entanglement, setEntanglement] = useState(0);
  
  const addQubit = () => {
    setQubits([...qubits, { state: '|0⟩', probability: 1.0, alpha: 1.0, beta: 0.0 }]);
  };
  
  const applyGate = (gateType) => {
    setGates([...gates, { type: gateType, timestamp: Date.now() }]);
    // Advanced gate simulation with complex amplitudes
    setQubits(qubits.map(q => {
      let newAlpha = q.alpha, newBeta = q.beta;
      switch(gateType) {
        case 'H': // Hadamard gate
          newAlpha = (q.alpha + q.beta) / Math.sqrt(2);
          newBeta = (q.alpha - q.beta) / Math.sqrt(2);
          break;
        case 'X': // Pauli-X gate
          [newAlpha, newBeta] = [q.beta, q.alpha];
          break;
        case 'Y': // Pauli-Y gate
          newAlpha = -q.beta;
          newBeta = q.alpha;
          break;
        case 'Z': // Pauli-Z gate
          newBeta = -q.beta;
          break;
        case 'T': // T gate (π/8 rotation)
          // Nota: JavaScript no soporta números complejos nativamente.
          // Para evitar errores de sintaxis, aproximamos el efecto de fase
          // manteniendo la magnitud y anotando el cambio de fase implícito.
          // Si se desea una simulación compleja real, habría que almacenar
          // partes real e imaginaria por amplitud.
          const phaseScale = Math.cos(Math.PI / 4); // ≈ 0.7071
          newBeta = q.beta * phaseScale;
          break;
      }
      const prob0 = Math.abs(newAlpha) ** 2;
      const prob1 = Math.abs(newBeta) ** 2;
      const normalization = Math.sqrt(prob0 + prob1);
      return {
        ...q,
        state: gateType === 'H' ? '|+⟩' : gateType === 'X' ? '|1⟩' : gateType === 'Y' ? 'i|1⟩' : q.state,
        probability: prob0,
        alpha: newAlpha / normalization,
        beta: newBeta / normalization
      };
    }));
    
    // Calculate entanglement for multi-qubit systems
    if (qubits.length > 1) {
      const totalEntanglement = qubits.reduce((acc, q) => 
        acc + 2 * Math.abs(q.alpha * q.beta), 0) / qubits.length;
      setEntanglement(totalEntanglement);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg" style={{ borderColor: NEON_COLORS.quantum + '40' }}>
      <h3 className="text-lg font-bold mb-4" style={{ color: NEON_COLORS.quantum }}>
        🔬 Simulador Cuántico
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: NEON_COLORS.secondary }}>
            Estados de Qubits
          </h4>
          {qubits.map((qubit, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <span className="text-xs" style={{ color: NEON_COLORS.primary }}>
                Q{i}:
              </span>
              <span className="font-mono text-sm" style={{ color: NEON_COLORS.quantum }}>
                {qubit.state}
              </span>
              <div className="text-xs space-y-1">
                <div style={{ color: NEON_COLORS.gold }}>
                  P(|0⟩) = {qubit.probability.toFixed(3)}
                </div>
                <div style={{ color: NEON_COLORS.orange }}>
                  P(|1⟩) = {(1 - qubit.probability).toFixed(3)}
                </div>
                <div style={{ color: NEON_COLORS.secondary }}>
                  α = {qubit.alpha.toFixed(3)}, β = {qubit.beta.toFixed(3)}
                </div>
              </div>
            </div>
          ))}
          
          {qubits.length > 1 && (
            <div className="mt-3 p-2 bg-gray-800 rounded">
              <div className="text-xs" style={{ color: NEON_COLORS.purple }}>
                Entrelazamiento del Sistema: {(entanglement * 100).toFixed(1)}%
              </div>
              <div className="text-xs" style={{ color: NEON_COLORS.warning }}>
                Dimensión del Espacio de Hilbert: 2^{qubits.length} = {Math.pow(2, qubits.length)}
              </div>
            </div>
          )}
          
          <button
            onClick={addQubit}
            className="mt-2 px-3 py-1 text-xs rounded border"
            style={{ borderColor: NEON_COLORS.secondary, color: NEON_COLORS.secondary }}
          >
            + Agregar Qubit
          </button>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: NEON_COLORS.secondary }}>
            Compuertas Cuánticas
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {['H', 'X', 'Y', 'Z', 'CNOT', 'T'].map(gate => (
              <button
                key={gate}
                onClick={() => applyGate(gate)}
                className="px-2 py-1 text-xs rounded border transition-all hover:scale-105"
                style={{ borderColor: NEON_COLORS.quantum, color: NEON_COLORS.quantum }}
              >
                {gate}
              </button>
            ))}
          </div>
          
          <div className="mt-3">
            <h5 className="text-xs font-semibold mb-1" style={{ color: NEON_COLORS.warning }}>
              Circuito Aplicado:
            </h5>
            <div className="text-xs font-mono" style={{ color: NEON_COLORS.primary }}>
              {gates.map(g => g.type).join(' → ') || 'Ninguno'}
            </div>
          </div>

          {/* Guía y laboratorios reales */}
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <h5 className="text-xs font-semibold mb-2" style={{ color: NEON_COLORS.quantum }}>
              Guía Rápida y Laboratorios Cuánticos Reales
            </h5>
            <ul className="text-xs space-y-1" style={{ color: '#b0b8c0' }}>
              <li>• Experimento 1: Superposición — Aplica H a |0⟩ y mide.</li>
              <li>• Experimento 2: Entrelazamiento — Crea dos qubits, aplica H a Q0 y luego CNOT(Q0→Q1).</li>
              <li>• Experimento 3: Fases — Aplica Z o T y observa cambios en probabilidades tras H.</li>
            </ul>
            <div className="text-xs mt-2" style={{ color: NEON_COLORS.secondary }}>Recursos:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {[
                { label: 'IBM Quantum Experience', href: 'https://quantum-computing.ibm.com/' },
                { label: 'Qiskit (Python)', href: 'https://qiskit.org/' },
                { label: 'PennyLane (Quantum ML)', href: 'https://pennylane.ai/' },
                { label: 'Google Cirq', href: 'https://quantumai.google/cirq' },
              ].map((r) => (
                <a key={r.href} href={r.href} target="_blank" rel="noreferrer"
                   className="block p-2 rounded border transition-all hover:scale-105"
                   style={{ borderColor: NEON_COLORS.quantum, background: NEON_COLORS.quantum + '22', color: '#e6edf3' }}>
                  <div className="text-xs font-semibold">{r.label}</div>
                  <div className="text-[10px] font-mono" style={{ color: NEON_COLORS.primary }}>{r.href}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Panel derecho: visualización cuántica (Esfera de Bloch, medición y banners)
const QuantumRightPanel = () => {
  const [theta, setTheta] = useState(Math.PI / 3); // 60°
  const [phi, setPhi] = useState(0); // fase relativa (visual)
  const [lastMeasure, setLastMeasure] = useState(null);
  const canvasRef = useRef(null);

  // Probabilidades según |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩
  const p0 = Math.cos(theta / 2) ** 2;
  const p1 = Math.sin(theta / 2) ** 2;

  const drawBloch = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.38;
    ctx.clearRect(0,0,W,H);
    // Fondo
    ctx.fillStyle = NEON_COLORS.darkBackground; ctx.fillRect(0,0,W,H);
    // Esfera (proyección)
    ctx.strokeStyle = NEON_COLORS.quantum; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.stroke();
    // Ejes
    ctx.strokeStyle = NEON_COLORS.secondary; ctx.beginPath();
    ctx.moveTo(cx-R, cy); ctx.lineTo(cx+R, cy); // X
    ctx.moveTo(cx, cy-R); ctx.lineTo(cx, cy+R); // Z
    ctx.stroke();
    // Vector de estado en coordenadas de Bloch: (x,y,z)
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    // Proyección simple (y comprimida) para sensación 3D
    const k = 0.6; // factor de compresión del eje Y
    const px = cx + R * x;
    const py = cy - R * (z + k*y*0); // mantenemos plano XZ para evitar confundir fase compleja
    // Vector
    ctx.strokeStyle = NEON_COLORS.primary; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    // Punta
    ctx.fillStyle = NEON_COLORS.primary; ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI*2); ctx.fill();
    // Texto
    ctx.fillStyle = '#b0b8c0'; ctx.font = '12px monospace';
    ctx.fillText(`θ = ${(theta*180/Math.PI).toFixed(1)}°`, 12, 18);
    ctx.fillText(`φ = ${(phi*180/Math.PI).toFixed(1)}°`, 12, 34);
    ctx.fillText(`P(0) ≈ ${p0.toFixed(3)}`, 12, 52);
    ctx.fillText(`P(1) ≈ ${p1.toFixed(3)}`, 12, 68);
  };

  useEffect(() => { drawBloch(); }, [theta, phi]);

  const measure = () => {
    const r = Math.random();
    const outcome = r < p0 ? 0 : 1;
    setLastMeasure(outcome);
  };

  const GateCard = ({ name, matrix, effect, color }) => (
    <div className="p-3 rounded border" style={{ borderColor: color, backgroundColor: color + '22' }}>
      <div className="flex items-center justify-between">
        <span className="font-bold" style={{ color }}>{name}</span>
        <span className="text-xs" style={{ color: '#b0b8c0' }}>Operador</span>
      </div>
      <div className="mt-2 text-xs font-mono" style={{ color: '#e6edf3' }}>{matrix}</div>
      <div className="mt-1 text-xs" style={{ color: '#b0b8c0' }}>{effect}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg" style={{ borderColor: NEON_COLORS.primary + '40' }}>
        <h3 className="text-lg font-bold mb-3" style={{ color: NEON_COLORS.primary }}>🧭 Esfera de Bloch</h3>
        <canvas ref={canvasRef} width={480} height={300} className="w-full rounded" style={{ border: '1px solid ' + NEON_COLORS.primary + '40', background: '#0d0d1f' }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div>
            <label className="text-xs" style={{ color: '#b0b8c0' }}>Ángulo θ</label>
            <input type="range" min={0} max={Math.PI} step={0.01} value={theta} onChange={(e)=>setTheta(parseFloat(e.target.value))} />
          </div>
          <div>
            <label className="text-xs" style={{ color: '#b0b8c0' }}>Fase φ (visual)</label>
            <input type="range" min={0} max={Math.PI*2} step={0.01} value={phi} onChange={(e)=>setPhi(parseFloat(e.target.value))} />
          </div>
          <div className="flex items-end">
            <button onClick={measure} className="px-3 py-2 text-xs rounded border" style={{ borderColor: NEON_COLORS.secondary, color: NEON_COLORS.secondary }}>Medir Estado</button>
          </div>
        </div>
        <div className="mt-2 text-xs" style={{ color: lastMeasure===null? '#b0b8c0' : (lastMeasure===0? NEON_COLORS.secondary : NEON_COLORS.quantum) }}>
          Resultado de medición: {lastMeasure===null? '—' : lastMeasure===0? '|0⟩' : '|1⟩'}
        </div>
      </div>

      <div className="p-4 border rounded-lg" style={{ borderColor: NEON_COLORS.quantum + '40' }}>
        <h3 className="text-lg font-bold mb-3" style={{ color: NEON_COLORS.quantum }}>🎌 Compuertas Cuánticas — Banners</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <GateCard name="H (Hadamard)" color={NEON_COLORS.secondary}
            matrix="(1/√2) · [[1, 1], [1, -1]]"
            effect="Crea superposición: |0⟩ → (|0⟩ + |1⟩)/√2; |1⟩ → (|0⟩ − |1⟩)/√2" />
          <GateCard name="X (Pauli-X)" color={NEON_COLORS.primary}
            matrix="[[0, 1], [1, 0]]"
            effect="Invierte bit: |0⟩ ↔ |1⟩" />
          <GateCard name="Y (Pauli-Y)" color={NEON_COLORS.orange}
            matrix="[[0, -i], [i, 0]]"
            effect="Rotación con fase: |0⟩ → i|1⟩, |1⟩ → −i|0⟩" />
          <GateCard name="Z (Pauli-Z)" color={NEON_COLORS.purple}
            matrix="[[1, 0], [0, -1]]"
            effect="Aplica fase a |1⟩: |1⟩ cambia de signo" />
          <GateCard name="T (π/8)" color={NEON_COLORS.gold}
            matrix="[[1, 0], [0, e^{iπ/4}]]"
            effect="Añade fase de π/4 al estado |1⟩" />
          <GateCard name="CNOT (control)" color={NEON_COLORS.warning}
            matrix="4×4: actúa como NOT sobre el objetivo si control es |1⟩"
            effect="Sobre dos qubits: crea y manipula entrelazamiento" />
        </div>
      </div>
    </div>
  );
};

// Simulador de Transformada de Fourier
const FourierSimulator = () => {
  const [signalFreq, setSignalFreq] = useState(2);
  const [fourierData, setFourierData] = useState([]);
  const canvasRef = useRef(null);
  
  const generateSignal = () => {
    const points = 100;
    const data = [];
    for (let i = 0; i < points; i++) {
      const t = (i / points) * 4 * Math.PI;
      const signal = Math.sin(signalFreq * t) + 0.5 * Math.sin(3 * signalFreq * t) + 0.3 * Math.cos(2 * signalFreq * t);
      data.push({ t, signal, frequency: signalFreq });
    }
    setFourierData(data);
  };

  useEffect(() => {
    generateSignal();
  }, [signalFreq]);

  // Dibujo de señal y espectro (DFT) de forma automática
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || fourierData.length === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    // Fondo
    ctx.fillStyle = '#0d0d1f';
    ctx.fillRect(0, 0, width, height);
    // Señal temporal (arriba)
    ctx.strokeStyle = NEON_COLORS.orange;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const maxAmp = Math.max(...fourierData.map(d => Math.abs(d.signal))) || 1;
    for (let x = 0; x < width; x++) {
      const idx = Math.floor((x / width) * fourierData.length);
      const yVal = fourierData[idx].signal / maxAmp; // normalizado
      const y = height * 0.25 - yVal * (height * 0.2);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Espectro de frecuencias básico (DFT)
    const N = fourierData.length;
    const maxK = Math.min(30, Math.floor(N / 2));
    const amplitudes = new Array(maxK).fill(0);
    for (let k = 0; k < maxK; k++) {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) {
        const x = fourierData[n].signal;
        const angle = (2 * Math.PI * k * n) / N;
        re += x * Math.cos(angle);
        im -= x * Math.sin(angle);
      }
      amplitudes[k] = Math.sqrt(re * re + im * im) / N;
    }
    const maxSpec = Math.max(...amplitudes) || 1;
    // Barras del espectro (abajo)
    const baseY = height * 0.75;
    const barWidth = width / (maxK + 2);
    ctx.fillStyle = NEON_COLORS.primary;
    for (let k = 0; k < maxK; k++) {
      const amp = amplitudes[k] / maxSpec;
      const barH = amp * (height * 0.22);
      const x = (k + 1) * barWidth;
      ctx.fillRect(x, baseY - barH, barWidth * 0.7, barH);
    }

    // Etiquetas simples
    ctx.fillStyle = '#b0b8c0';
    ctx.font = '12px monospace';
    ctx.fillText('Señal (tiempo)', 10, 14);
    ctx.fillText('Espectro (DFT)', 10, baseY + 14);
  }, [fourierData]);

  return (
    <div className="bg-gray-900 p-6 rounded-lg border-2" style={{ borderColor: NEON_COLORS.orange }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: NEON_COLORS.orange }}>
        📊 Transformada de Fourier & Análisis de Señales
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: NEON_COLORS.primary }}>
              Frecuencia Principal: {signalFreq} Hz
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={signalFreq}
              onChange={(e) => setSignalFreq(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="p-4 bg-gray-800 rounded space-y-2">
            <p style={{ color: NEON_COLORS.secondary }}>
              Señal: f(t) = sin({signalFreq}t) + 0.5sin(3×{signalFreq}t) + 0.3cos(2×{signalFreq}t)
            </p>
            <p className="text-xs" style={{ color: '#b0b8c0' }}>Notación: ω = 2πf; aquí se usa f en Hz.</p>
            <p style={{ color: NEON_COLORS.gold }}>
              Componentes de Frecuencia:
            </p>
            <ul className="text-xs space-y-1" style={{ color: NEON_COLORS.primary }}>
              <li>• Fundamental: {signalFreq} Hz (Amplitud: 1.0)</li>
              <li>• Armónico 3°: {3 * signalFreq} Hz (Amplitud: 0.5)</li>
              <li>• Armónico 2°: {2 * signalFreq} Hz (Amplitud: 0.3)</li>
            </ul>
          </div>
        </div>
        <div className="space-y-3">
          <canvas 
            ref={canvasRef}
            width="300" 
            height="200" 
            className="border rounded bg-gray-800"
            style={{ borderColor: NEON_COLORS.orange }}
          />
          <div className="text-xs p-3 bg-gray-800 rounded">
            <p style={{ color: NEON_COLORS.quantum }}>
              Aplicaciones Reales:
            </p>
            <ul className="space-y-1" style={{ color: NEON_COLORS.secondary }}>
              <li>• Procesamiento de Audio Digital</li>
              <li>• Análisis de Vibraciones Mecánicas</li>
              <li>• Compresión de Imágenes (JPEG)</li>
              <li>• Comunicaciones Inalámbricas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simulador de Transformaciones Vectoriales
const VectorTransformSimulator = () => {
  const [vector, setVector] = useState([3, 4]);
  const [transformMatrix, setTransformMatrix] = useState([[1, 0], [0, 1]]);
  // Ángulo inicial 1° (θ); usar radianes internamente
  const [angle, setAngle] = useState(Math.PI / 180);
  const [currentTransform, setCurrentTransform] = useState('rotation');
  const [pivot, setPivot] = useState([0, 0]); // centro de rotación (x,y) en unidades del plano
  const canvasRef = useRef(null);
  
  const applyTransformation = (type) => {
    setCurrentTransform(type);
    let matrix;
    switch(type) {
      case 'rotation':
        matrix = [[Math.cos(angle), -Math.sin(angle)], [Math.sin(angle), Math.cos(angle)]];
        break;
      case 'scaling':
        matrix = [[2, 0], [0, 0.5]];
        break;
      case 'shear':
        matrix = [[1, 0.5], [0, 1]];
        break;
      case 'reflection':
        matrix = [[1, 0], [0, -1]];
        break;
      default:
        matrix = [[1, 0], [0, 1]];
    }
    setTransformMatrix(matrix);
  };

  // Actualizar matriz en tiempo real al mover el ángulo si la transformación activa es rotación
  useEffect(() => {
    if (currentTransform === 'rotation') {
      setTransformMatrix([[Math.cos(angle), -Math.sin(angle)], [Math.sin(angle), Math.cos(angle)]]);
    }
  }, [angle, currentTransform]);

  const transformedVector = [
    transformMatrix[0][0] * vector[0] + transformMatrix[0][1] * vector[1],
    transformMatrix[1][0] * vector[0] + transformMatrix[1][1] * vector[1]
  ];

  const determinant = transformMatrix[0][0] * transformMatrix[1][1] - transformMatrix[0][1] * transformMatrix[1][0];

  // Dibujo geométrico en canvas: eje, cuadrado y vector transformado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 520;
    const height = canvas.height = 360;
    const cx = width / 2;
    const cy = height / 2;
    const scale = 60; // Unidades -> píxeles

    // Fondo y grilla
    ctx.fillStyle = NEON_COLORS.darkBackground;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Ejes
    ctx.strokeStyle = NEON_COLORS.primary;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();

    // Funciones de ayuda
    const toCanvas = (p) => [cx + p[0] * scale, cy - p[1] * scale];
    const applyPoint = (p) => {
      if (currentTransform === 'rotation') {
        const px = pivot[0], py = pivot[1];
        const x = p[0] - px, y = p[1] - py;
        const xr = transformMatrix[0][0] * x + transformMatrix[0][1] * y;
        const yr = transformMatrix[1][0] * x + transformMatrix[1][1] * y;
        return [xr + px, yr + py];
      }
      return [
        transformMatrix[0][0] * p[0] + transformMatrix[0][1] * p[1],
        transformMatrix[1][0] * p[0] + transformMatrix[1][1] * p[1],
      ];
    };

    // Cuadrado unidad centrado en el origen
    const square = [
      [-1, -1], [1, -1], [1, 1], [-1, 1]
    ];
    const squareT = square.map(applyPoint);

    // Dibujo del cuadrado original
    ctx.strokeStyle = NEON_COLORS.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let p0 = toCanvas(square[0]);
    ctx.moveTo(p0[0], p0[1]);
    for (let i = 1; i <= square.length; i++) {
      const p = toCanvas(square[i % square.length]);
      ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();

    // Dibujo del cuadrado transformado
    ctx.strokeStyle = NEON_COLORS.quantum;
    ctx.lineWidth = 2;
    ctx.beginPath();
    p0 = toCanvas(squareT[0]);
    ctx.moveTo(p0[0], p0[1]);
    for (let i = 1; i <= squareT.length; i++) {
      const p = toCanvas(squareT[i % squareT.length]);
      ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();

    // Vector original y transformado
    const v = vector;
    const vt = applyPoint(v);
    const vPix = toCanvas(v);
    const vtPix = toCanvas(vt);

    // Flecha helper
    const drawArrow = (from, to, color) => {
      const headlen = 10;
      const dx = to[0] - from[0];
      const dy = to[1] - from[1];
      const angle = Math.atan2(dy, dx);
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(to[0], to[1]); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(to[0], to[1]);
      ctx.lineTo(to[0] - headlen * Math.cos(angle - Math.PI / 6), to[1] - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(to[0] - headlen * Math.cos(angle + Math.PI / 6), to[1] - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath(); ctx.fill();
    };

    drawArrow([cx, cy], vPix, NEON_COLORS.secondary); // original
    drawArrow([cx, cy], vtPix, NEON_COLORS.quantum);   // transformado

    // Rótulos
    ctx.fillStyle = NEON_COLORS.secondary; ctx.font = '12px monospace';
    ctx.fillText('Original', vPix[0] + 6, vPix[1] - 6);
    ctx.fillStyle = NEON_COLORS.quantum; ctx.fillText('Transformado', vtPix[0] + 6, vtPix[1] - 6);

    // Marca del pivote (centro de rotación)
    if (currentTransform === 'rotation') {
      const pvt = toCanvas(pivot);
      ctx.strokeStyle = NEON_COLORS.gold; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pvt[0] - 6, pvt[1]); ctx.lineTo(pvt[0] + 6, pvt[1]); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pvt[0], pvt[1] - 6); ctx.lineTo(pvt[0], pvt[1] + 6); ctx.stroke();
      ctx.fillStyle = NEON_COLORS.gold; ctx.font = '12px monospace';
      ctx.fillText('Pivot', pvt[0] + 8, pvt[1] - 8);
    }
  }, [vector, transformMatrix]);

  return (
    <div className="bg-gray-900 p-6 rounded-lg border-2" style={{ borderColor: NEON_COLORS.purple }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: NEON_COLORS.purple }}>
        🔄 Transformaciones Vectoriales & Álgebra Lineal
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: NEON_COLORS.primary }}>
              Vector Original: [{vector[0]}, {vector[1]}]
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={vector[0]}
                onChange={(e) => setVector([parseFloat(e.target.value) || 0, vector[1]])}
                className="w-20 p-2 bg-gray-800 border rounded text-white text-center"
                style={{ borderColor: NEON_COLORS.primary }}
              />
              <input
                type="number"
                value={vector[1]}
                onChange={(e) => setVector([vector[0], parseFloat(e.target.value) || 0])}
                className="w-20 p-2 bg-gray-800 border rounded text-white text-center"
                style={{ borderColor: NEON_COLORS.primary }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['rotation', 'scaling', 'shear', 'reflection'].map(type => (
              <button
                key={type}
                onClick={() => applyTransformation(type)}
                className="px-3 py-2 rounded text-xs font-semibold transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: NEON_COLORS.purple,
                  color: NEON_COLORS.darkBackground,
                  boxShadow: `0 0 5px ${NEON_COLORS.purple}`
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {/* Controles de rotación (θ y pivote) */}
          <div className="p-4 bg-gray-800 rounded space-y-2">
            <p className="text-sm font-semibold" style={{ color: NEON_COLORS.primary }}>Ángulo θ: {(angle * 180 / Math.PI).toFixed(1)}°</p>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={Math.round(angle * 180 / Math.PI)}
              onChange={(e) => setAngle((parseFloat(e.target.value) || 0) * Math.PI / 180)}
              className="w-full"
            />
            <div className="text-xs" style={{ color: '#999' }}>La rotación se aplica en tiempo real al mover el slider.</div>
            {/* Pivote: centro de rotación */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-xs" style={{ color: NEON_COLORS.gold }}>Pivot X: {pivot[0]}</label>
                <input type="number" value={pivot[0]} onChange={(e) => setPivot([parseFloat(e.target.value) || 0, pivot[1]])} className="w-full p-2 bg-gray-900 border rounded text-white text-center" style={{ borderColor: NEON_COLORS.gold }} />
              </div>
              <div>
                <label className="block text-xs" style={{ color: NEON_COLORS.gold }}>Pivot Y: {pivot[1]}</label>
                <input type="number" value={pivot[1]} onChange={(e) => setPivot([pivot[0], parseFloat(e.target.value) || 0])} className="w-full p-2 bg-gray-900 border rounded text-white text-center" style={{ borderColor: NEON_COLORS.gold }} />
              </div>
            </div>
          </div>
          {/* Área negra para simulación geométrica */}
          <canvas
            ref={canvasRef}
            className="border rounded w-full bg-gray-900"
            style={{ borderColor: NEON_COLORS.purple + '40' }}
          />
          <div className="p-4 bg-gray-800 rounded space-y-2">
            <p style={{ color: NEON_COLORS.secondary }}>
              Matriz de Transformación:
            </p>
            <div className="font-mono text-sm" style={{ color: NEON_COLORS.gold }}>
              [{transformMatrix[0][0].toFixed(2)}, {transformMatrix[0][1].toFixed(2)}]<br/>
              [{transformMatrix[1][0].toFixed(2)}, {transformMatrix[1][1].toFixed(2)}]
            </div>
            <p style={{ color: NEON_COLORS.orange }}>
              Vector Transformado: [{transformedVector[0].toFixed(2)}, {transformedVector[1].toFixed(2)}]
            </p>
            <p style={{ color: NEON_COLORS.quantum }}>
              Determinante: {determinant.toFixed(3)}
            </p>
            <p className="text-xs" style={{ color: NEON_COLORS.primary }}>
              {determinant > 0 ? 'Preserva orientación' : 'Invierte orientación'}
              {Math.abs(determinant) > 1 ? ' • Expande área' : ' • Contrae área'}
            </p>
          </div>
          <div className="text-xs p-3 bg-gray-800 rounded">
            <p style={{ color: NEON_COLORS.secondary }}>Aplicaciones:</p>
            <ul className="space-y-1" style={{ color: NEON_COLORS.primary }}>
              <li>• Gráficos por Computadora 3D</li>
              <li>• Robótica y Cinemática</li>
              <li>• Procesamiento de Imágenes</li>
              <li>• Análisis de Tensores</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo 3D simple: cubo rotante con proyección en perspectiva
const ThreeDDemo = () => {
  const [thetaX, setThetaX] = useState(0.3);
  const [thetaY, setThetaY] = useState(0.6);
  const [autoRotate, setAutoRotate] = useState(false);
  const canvasRef = useRef(null);

  const draw = (W, H) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = NEON_COLORS.darkBackground; ctx.fillRect(0,0,W,H);

    // Cubo en 3D centrado
    const size = 1;
    const verts = [
      [-size,-size,-size], [size,-size,-size], [size,size,-size], [-size,size,-size],
      [-size,-size, size], [size,-size, size], [size,size, size], [-size,size, size]
    ];

    const rotX = (p) => {
      const [x,y,z] = p; const cy = Math.cos(thetaX), sy = Math.sin(thetaX);
      return [x, y*cy - z*sy, y*sy + z*cy];
    };
    const rotY = (p) => {
      const [x,y,z] = p; const cx = Math.cos(thetaY), sx = Math.sin(thetaY);
      return [x*cx + z*sx, y, -x*sx + z*cx];
    };
    const apply = (p) => rotY(rotX(p));

    // Proyección en perspectiva con escala dinámica para que no se desborde
    const scale = Math.min(W, H) * 0.25;
    const proj = (p) => {
      const [x,y,z] = p; const d = 3.5; const f = 220; // distancia y factor
      const k = f / (z + d);
      return [W/2 + x*k*scale, H/2 - y*k*scale];
    };

    const edges = [
      [0,1],[1,2],[2,3],[3,0], [4,5],[5,6],[6,7],[7,4], [0,4],[1,5],[2,6],[3,7]
    ];
    const tverts = verts.map(apply);
    ctx.strokeStyle = NEON_COLORS.primary; ctx.lineWidth = 2.2;
    edges.forEach(([i,j]) => {
      const a = proj(tverts[i]); const b = proj(tverts[j]);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    });

    ctx.fillStyle = NEON_COLORS.secondary; ctx.font = '12px monospace';
    ctx.fillText(`θx=${(thetaX*180/Math.PI).toFixed(1)}°, θy=${(thetaY*180/Math.PI).toFixed(1)}°`, 12, 20);
  };

  // Redibujar ante cambios de ángulo y también al resize
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const parentW = Math.max(320, Math.floor(canvas.parentElement?.clientWidth || 520));
    const targetW = Math.min(parentW, 420);
    const W = canvas.width = targetW; const H = canvas.height = Math.floor(targetW * 0.62);
    draw(W, H);
  }, [thetaX, thetaY]);

  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current; if (!canvas) return;
      const parentW = Math.max(320, Math.floor(canvas.parentElement?.clientWidth || 520));
      const targetW = Math.min(parentW, 420);
      const W = canvas.width = targetW; const H = canvas.height = Math.floor(targetW * 0.62);
      draw(W, H);
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Animación de rotación suave (modo flotante)
  useEffect(() => {
    if (!autoRotate) return;
    let raf;
    const step = () => {
      setThetaX(tx => (tx + 0.01) % (Math.PI * 2));
      setThetaY(ty => (ty + 0.008) % (Math.PI * 2));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [autoRotate]);

  return (
    <div className="bg-gray-900 p-6 rounded-lg border-2" style={{ borderColor: NEON_COLORS.purple }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: NEON_COLORS.purple }}>
        ◻️ Demo 3D: Cubo Rotante
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="p-4 bg-gray-800 rounded">
            <label className="block text-sm font-semibold mb-2" style={{ color: NEON_COLORS.primary }}>Ángulo θx</label>
            <input type="range" min={-180} max={180} step={1} value={Math.round(thetaX*180/Math.PI)} onChange={(e)=>setThetaX((parseFloat(e.target.value)||0)*Math.PI/180)} className="w-full" />
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <label className="block text-sm font-semibold mb-2" style={{ color: NEON_COLORS.primary }}>Ángulo θy</label>
            <input type="range" min={-180} max={180} step={1} value={Math.round(thetaY*180/Math.PI)} onChange={(e)=>setThetaY((parseFloat(e.target.value)||0)*Math.PI/180)} className="w-full" />
          </div>
          <div className="p-4 bg-gray-800 rounded flex items-center gap-2">
            <input id="autorotate" type="checkbox" checked={autoRotate} onChange={(e)=>setAutoRotate(e.target.checked)} />
            <label htmlFor="autorotate" className="text-sm" style={{ color: NEON_COLORS.secondary }}>Auto rotación (flotante)</label>
          </div>
        </div>
        <div>
          <canvas ref={canvasRef} className="border rounded w-full bg-gray-900" style={{ borderColor: NEON_COLORS.purple + '40' }} />
          <div className="text-xs p-3 bg-gray-800 rounded mt-3">
            <p style={{ color: NEON_COLORS.secondary }}>Notas:</p>
            <ul className="space-y-1" style={{ color: NEON_COLORS.primary }}>
              <li>• Rotaciones compuestas Rx(θx) y Ry(θy).</li>
              <li>• Proyección en perspectiva simple: k = f/(z + d).</li>
              <li>• Útil para visualizar matrices 3×3 y transformaciones 3D.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
const EquationSolver = () => {
  const [equation, setEquation] = useState('d²y/dx² + y = 0');
  const [solution, setSolution] = useState('');
  const [explanation, setExplanation] = useState('');
  const [method, setMethod] = useState('analytical');
  const [pyLoading, setPyLoading] = useState(false);
  const [pyReady, setPyReady] = useState(false);
  const [pyOutput, setPyOutput] = useState('');
  
  const solveEquation = () => {
    // Simulate equation solving
    const solutions = {
      'analytical': 'y(x) = C₁cos(x) + C₂sin(x)',
      'numerical': 'Solución numérica: y ≈ e^(-0.1x)cos(x)',
      'laplace': 'L{y} = s²Y(s) - sy(0) - y\'(0) + Y(s) = 0'
    };
    setSolution(solutions[method] || 'Solución no encontrada');
    setExplanation('');
  };

  // Cargar Pyodide opcionalmente y ejecutar ejemplo de Laplace con SymPy
  const ensurePyodide = async () => {
    if (pyReady) return true;
    try {
      setPyLoading(true);
      // Inyectar loader si no existe
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
          s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
        });
      }
      const pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
      // Instalar SymPy vía micropip
      await pyodide.loadPackage(['micropip']);
      await pyodide.runPythonAsync(`
import micropip
try:
    await micropip.install('sympy==1.12')
except Exception as e:
    pass
`);
      window.__pyodide = pyodide;
      setPyReady(true);
      setPyLoading(false);
      return true;
    } catch (err) {
      console.warn('Pyodide no disponible:', err);
      setPyLoading(false);
      setPyOutput('No se pudo cargar Pyodide/SymPy. Se muestra resultado simbólico por defecto.');
      return false;
    }
  };

  const runPyLaplace = async () => {
    const ok = await ensurePyodide();
    if (!ok || !window.__pyodide) return;
    try {
      const code = `
from sympy import symbols, laplace_transform, exp
t, s, a = symbols('t s a', positive=True)
f = exp(-a*t)
F = laplace_transform(f, t, s)
str(F)
`;
      const res = await window.__pyodide.runPythonAsync(code);
      setPyOutput(String(res));
    } catch (e) {
      setPyOutput('Error ejecutando SymPy en Pyodide: ' + e);
    }
  };
  
  // Ejemplo avanzado: y'' - y = e^x (particular + homogénea con resonancia)
  const advancedExample = () => {
    const eq = "y'' - y = e^x";
    setEquation(eq);
    const full = 'y(x) = C₁ e^x + C₂ e^{-x} + (1/2) x e^x';
    setSolution(full);
    setMethod('analytical');
    setExplanation(
      'Ecuación: y" - y = e^x.\n' +
      '1) Ecuación homogénea: r² - 1 = 0 ⇒ r = ±1 ⇒ y_h = C₁ e^x + C₂ e^{-x}.\n' +
      '2) Forzamiento e^x produce resonancia con e^x de y_h. Intento particular: y_p = B x e^x.\n' +
      '   y_p\' = B e^x + B x e^x, y_p\" = 2B e^x + B x e^x.\n' +
      '   Sustituyendo en y\" - y: (2B e^x + B x e^x) - (B x e^x) = 2B e^x = e^x ⇒ B = 1/2.\n' +
      '   ⇒ y_p = (1/2) x e^x.\n' +
      '3) Solución general: y = y_h + y_p = C₁ e^x + C₂ e^{-x} + (1/2) x e^x.'
    );
  };

  // Ejemplo de Laplace: y' + y = e^t, y(0)=0
  const laplaceExample = () => {
    const eq = "y' + y = e^t, y(0)=0";
    setEquation(eq);
    setMethod('laplace');
    const sol = 'y(t) = (1/2)(e^{t} - e^{-t})';
    setSolution(sol);
    setExplanation([
      'Ejemplo Laplace:',
      '1) Aplicar Laplace: L{y′} = sY(s) − y(0).  L{y′} + L{y} = L{e^t}.',
      '   Con y(0)=0: (s + 1)Y(s) = 1/(s − 1).',
      '2) Entonces: Y(s) = 1/((s − 1)(s + 1)).',
      '3) Fracciones parciales: Y(s) = 1/2 [1/(s − 1) − 1/(s + 1)].',
      '4) Inversa: y(t) = (1/2)(e^t − e^{−t}).'
    ].join('\n'));
  };
  
  return (
    <div className="p-4 border rounded-lg" style={{ borderColor: NEON_COLORS.warning + '40' }}>
      <h3 className="text-lg font-bold mb-4" style={{ color: NEON_COLORS.warning }}>
        ∫ Solucionador de Ecuaciones
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: NEON_COLORS.secondary }}>
            Ecuación Diferencial:
          </label>
          <input
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-transparent border rounded"
            style={{ borderColor: NEON_COLORS.warning + '60', color: '#e6edf3' }}
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: NEON_COLORS.secondary }}>
            Método de Solución:
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-transparent border rounded"
            style={{ borderColor: NEON_COLORS.warning + '60', color: '#e6edf3', backgroundColor: NEON_COLORS.darkBackground }}
          >
            <option value="analytical">Analítico</option>
            <option value="numerical">Numérico (Runge-Kutta)</option>
            <option value="laplace">Transformada de Laplace</option>
          </select>
        </div>
        
        <button
          onClick={solveEquation}
          className="w-full px-4 py-2 text-sm rounded border transition-all hover:scale-105"
          style={{ borderColor: NEON_COLORS.warning, color: NEON_COLORS.warning }}
        >
          🧮 Resolver Ecuación
        </button>

        <button
          onClick={advancedExample}
          className="w-full px-4 py-2 text-sm rounded border transition-all hover:scale-105"
          style={{ borderColor: NEON_COLORS.primary, color: NEON_COLORS.primary }}
        >
          ⚙️ Caso avanzado: y" - y = e^x
        </button>

        <button
          onClick={laplaceExample}
          className="w-full px-4 py-2 text-sm rounded border transition-all hover:scale-105"
          style={{ borderColor: NEON_COLORS.secondary, color: NEON_COLORS.secondary }}
        >
          ℒ Laplace: y' + y = e^t, y(0)=0
        </button>
        
        {solution && (
          <div className="mt-3 p-3 rounded border" style={{ borderColor: NEON_COLORS.primary + '40' }}>
            <h4 className="text-xs font-semibold mb-1" style={{ color: NEON_COLORS.primary }}>
              Solución:
            </h4>
            <div className="font-mono text-sm" style={{ color: NEON_COLORS.secondary }}>
              {solution}
            </div>
          </div>
        )}

        {explanation && (
          <div className="mt-2 p-3 rounded border text-xs" style={{ borderColor: NEON_COLORS.secondary + '40', color: '#c9d1d9' }}>
            <div className="font-semibold mb-1" style={{ color: NEON_COLORS.secondary }}>Explicación:</div>
            <pre className="font-mono whitespace-pre-wrap">{explanation}</pre>
          </div>
        )}

        {method === 'laplace' && (
          <div className="mt-3 p-3 rounded border" style={{ borderColor: NEON_COLORS.secondary + '40' }}>
            <h4 className="text-xs font-semibold mb-2" style={{ color: NEON_COLORS.secondary }}>
              🧪 Pyodide (beta): Laplace de e^(-a t)
            </h4>
            <div className="flex gap-2">
              <button onClick={runPyLaplace} className="px-3 py-2 text-xs rounded border" style={{ borderColor: NEON_COLORS.primary, color: NEON_COLORS.primary }}>
                {pyLoading ? 'Cargando…' : (pyReady ? 'Ejecutar de nuevo' : 'Cargar y ejecutar')}
              </button>
              {pyReady && <span className="text-xs" style={{ color: NEON_COLORS.gold }}>Pyodide listo</span>}
            </div>
            {pyOutput && (
              <div className="mt-2 font-mono text-xs" style={{ color: '#e6edf3' }}>
                {pyOutput}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AdvancedMathLab = () => {
  const [activeTab, setActiveTab] = useState('quantum');
  const [autoMode, setAutoMode] = useState(false);
  const [mathParams, setMathParams] = useState({
    frequency: 1,
    amplitude: 1,
    harmonics: 5,
    imaginary: 0.5,
    phase: 0,
    initial: 1,
    coefficient: -0.1
  });
  
  const tabs = [
    { id: 'quantum', label: '🔬 Cuántico', color: NEON_COLORS.quantum },
    { id: 'fourier', label: '📊 Transformada de Fourier', color: NEON_COLORS.orange },
    { id: 'vectors', label: '🔄 Transformaciones Vectoriales', color: NEON_COLORS.purple },
    { id: 'differential', label: '∂ Ecuaciones Dif.', color: NEON_COLORS.warning },
    { id: 'complex', label: 'ℂ Variable Compleja', color: NEON_COLORS.primary },
  ];
  
  // Modo demostración automática A–D: recorre pestañas y ajusta parámetros
  useEffect(() => {
    if (!autoMode) return;
    const order = ['fourier', 'complex', 'differential', 'vectors'];
    let idx = 0;
    setActiveTab(order[idx]);
    const timer = setInterval(() => {
      idx = (idx + 1) % order.length;
      setActiveTab(order[idx]);
      // Oscilar parámetros suavemente
      setMathParams((p) => ({
        ...p,
        frequency: (p.frequency % 5) + 0.5,
        amplitude: p.amplitude > 2.5 ? 0.8 : p.amplitude + 0.3,
        harmonics: ((p.harmonics + 2) % 20) || 5,
        imaginary: Math.sin((p.imaginary + 0.3))
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, [autoMode]);
  
  return (
    <div className="p-6 pt-20 min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto text-white">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-6 uppercase text-center"
          style={{ color: NEON_COLORS.primary, textShadow: `0 0 12px ${NEON_COLORS.primary}` }}
        >
          🧮 Laboratorio de Matemáticas Avanzadas
        </h1>
        
        <p className="text-center text-gray-400 mb-4 max-w-3xl mx-auto">
          Simulaciones cuánticas, ecuaciones diferenciales, análisis complejo y transformadas matemáticas en tiempo real.
        </p>
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setAutoMode((v) => !v)}
            className="px-4 py-2 text-sm rounded border"
            style={{ borderColor: NEON_COLORS.primary, color: NEON_COLORS.primary }}
          >
            {autoMode ? '⏸️ Pausar Auto Demo' : '▶️ Iniciar Auto Demo'}
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm rounded border transition-all ${
                activeTab === tab.id ? 'scale-105' : 'opacity-70'
              }`}
              style={{ 
                borderColor: tab.color, 
                color: tab.color,
                backgroundColor: activeTab === tab.id ? `${tab.color}20` : 'transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Interactive Controls */}
          <div className="space-y-6">
            {activeTab === 'quantum' && <QuantumSimulator />}
            {activeTab === 'fourier' && <FourierSimulator />}
            {activeTab === 'vectors' && <VectorTransformSimulator />}
            {activeTab === 'differential' && <EquationSolver />}
            
            {(activeTab === 'complex' || activeTab === 'fourier') && (
              <div className="p-4 border rounded-lg" style={{ borderColor: NEON_COLORS.primary + '40' }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: NEON_COLORS.primary }}>
                  ⚙️ Parámetros de Simulación
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: NEON_COLORS.secondary }}>
                      Frecuencia: {mathParams.frequency}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={mathParams.frequency}
                      onChange={(e) => setMathParams({...mathParams, frequency: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: NEON_COLORS.secondary }}>
                      Amplitud: {mathParams.amplitude}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={mathParams.amplitude}
                      onChange={(e) => setMathParams({...mathParams, amplitude: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  {activeTab === 'fourier' && (
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: NEON_COLORS.secondary }}>
                        Armónicos: {mathParams.harmonics}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={mathParams.harmonics}
                        onChange={(e) => setMathParams({...mathParams, harmonics: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {activeTab === 'complex' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: NEON_COLORS.secondary }}>
                          Parte Imaginaria: {mathParams.imaginary}
                        </label>
                        <input
                          type="range"
                          min="-2"
                          max="2"
                          step="0.1"
                          value={mathParams.imaginary}
                          onChange={(e) => setMathParams({...mathParams, imaginary: parseFloat(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: NEON_COLORS.secondary }}>
                          Fase: {mathParams.phase.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="6.28"
                          step="0.1"
                          value={mathParams.phase}
                          onChange={(e) => setMathParams({...mathParams, phase: parseFloat(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Panel - Visualization */}
          <div className="space-y-6">
            {activeTab === 'quantum' && (
              <QuantumRightPanel />
            )}
            {(activeTab === 'complex' || activeTab === 'fourier' || activeTab === 'differential') && (
              <div className="p-4 border rounded-lg" style={{ borderColor: NEON_COLORS.primary + '40' }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: NEON_COLORS.primary }}>
                  📊 Visualización Matemática
                </h3>
                <MathVisualization type={activeTab} parameters={mathParams} />
              </div>
            )}

            {activeTab === 'vectors' && (
              <div className="space-y-6">
                <ThreeDDemo />
              </div>
            )}
            
            {/* Mathematical Formulas */}
            <div className="p-5 border rounded-lg" style={{ borderColor: NEON_COLORS.secondary, boxShadow: '0 0 16px ' + NEON_COLORS.secondary + '55', background: NEON_COLORS.darkBackground }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: NEON_COLORS.secondary }}>
                📐 Fórmulas Relevantes
              </h3>
              
              <div className="space-y-2 text-sm font-mono">
                {activeTab === 'quantum' && (
                  <>
                    <div style={{ color: NEON_COLORS.quantum }}>|ψ⟩ = α|0⟩ + β|1⟩</div>
                    <div style={{ color: NEON_COLORS.primary }}>H|0⟩ = (|0⟩ + |1⟩)/√2</div>
                    <div style={{ color: NEON_COLORS.warning }}>⟨ψ|ψ⟩ = |α|² + |β|² = 1</div>
                    <div style={{ color: NEON_COLORS.primary }}>{'X = \\begin{bmatrix}0 & 1\\\\ 1 & 0\\end{bmatrix}'}</div>
                    <div style={{ color: NEON_COLORS.primary }}>{'Z = \\begin{bmatrix}1 & 0\\\\ 0 & -1\\end{bmatrix}'}</div>
                    <div style={{ color: NEON_COLORS.gold }}>Prob(|1⟩) = |β|² (Regla de Born)</div>
                  </>
                )}
                
                {activeTab === 'differential' && (
                  <>
                    <div style={{ color: NEON_COLORS.warning }}>d²y/dx² + ω²y = 0</div>
                    <div style={{ color: NEON_COLORS.primary }}>y(x) = C₁e^(rx) + C₂e^(-rx)</div>
                    <div style={{ color: NEON_COLORS.secondary }}>{'L{f′(t)} = sF(s) - f(0)'}</div>
                    <div style={{ color: NEON_COLORS.primary }}>{'L{f(t)} = ∫₀^∞ f(t)e^{-st} dt'}</div>
                    <div style={{ color: NEON_COLORS.quantum }}>{'L^{-1}{F(s)} = \\frac{1}{2πi}∮ F(s)e^{st} ds'}</div>
                    <div style={{ color: NEON_COLORS.gold }}>y(x) = y_h + y_p (principio de superposición)</div>
                  </>
                )}
                
                {activeTab === 'complex' && (
                  <>
                    <div style={{ color: NEON_COLORS.primary }}>z = x + iy = re^(iθ)</div>
                    <div style={{ color: NEON_COLORS.quantum }}>f(z) = u(x,y) + iv(x,y)</div>
                    <div style={{ color: NEON_COLORS.warning }}>∮_C f(z)dz = 2πi∑Res(f,zₖ)</div>
                    <div style={{ color: NEON_COLORS.primary }}>Cauchy–Riemann: u_x = v_y, u_y = −v_x</div>
                    <div style={{ color: NEON_COLORS.gold }}>Serie de Laurent: f(z) = ∑ a_n (z − z₀)^n</div>
                  </>
                )}
                
                {activeTab === 'fourier' && (
                  <>
                    <div style={{ color: NEON_COLORS.secondary }}>F(ω) = ∫f(t)e^(-iωt)dt</div>
                    <div style={{ color: NEON_COLORS.primary }}>f(t) = ∑aₙe^(inωt)</div>
                    <div style={{ color: NEON_COLORS.quantum }}>X[k] = ∑x[n]e^(-2πikn/N)</div>
                    <div style={{ color: NEON_COLORS.primary }}>Parseval: ∫|f|² dt = ∫|F|² dω</div>
                    <div style={{ color: NEON_COLORS.gold }}>{'Convolución: F{f*g} = F{f}·F{g}'}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMathLab;