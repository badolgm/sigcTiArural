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
  const [selectedFunction, setSelectedFunction] = useState('complex');
  const [mathParameters, setMathParameters] = useState({ a: 1, b: 1, c: 0 });
  
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
    
    switch (type) {
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
    
  }, [type, parameters]);
  
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
                <li>• Mecánica Cuántica</li>
                <li>• Procesamiento de Señales</li>
                <li>• Dinámica de Fluidos</li>
                <li>• Teoría de Control</li>
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
  
  const applyTransformation = (type) => {
    let matrix;
    switch(type) {
      case 'rotation':
        const angle = Math.PI / 4; // 45 grados
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

  const transformedVector = [
    transformMatrix[0][0] * vector[0] + transformMatrix[0][1] * vector[1],
    transformMatrix[1][0] * vector[0] + transformMatrix[1][1] * vector[1]
  ];

  const determinant = transformMatrix[0][0] * transformMatrix[1][1] - transformMatrix[0][1] * transformMatrix[1][0];

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

const EquationSolver = () => {
  const [equation, setEquation] = useState('d²y/dx² + y = 0');
  const [solution, setSolution] = useState('');
  const [method, setMethod] = useState('analytical');
  
  const solveEquation = () => {
    // Simulate equation solving
    const solutions = {
      'analytical': 'y(x) = C₁cos(x) + C₂sin(x)',
      'numerical': 'Solución numérica: y ≈ e^(-0.1x)cos(x)',
      'laplace': 'L{y} = s²Y(s) - sy(0) - y\'(0) + Y(s) = 0'
    };
    setSolution(solutions[method] || 'Solución no encontrada');
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
      </div>
    </div>
  );
};

const AdvancedMathLab = () => {
  const [activeTab, setActiveTab] = useState('quantum');
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
  
  return (
    <div className="p-6 pt-20 min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto text-white">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-6 uppercase text-center"
          style={{ color: NEON_COLORS.primary, textShadow: `0 0 12px ${NEON_COLORS.primary}` }}
        >
          🧮 Laboratorio de Matemáticas Avanzadas
        </h1>
        
        <p className="text-center text-gray-400 mb-8 max-w-3xl mx-auto">
          Simulaciones cuánticas, ecuaciones diferenciales, análisis complejo y transformadas matemáticas en tiempo real.
        </p>
        
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
            {(activeTab === 'complex' || activeTab === 'fourier' || activeTab === 'differential') && (
              <div className="p-4 border rounded-lg" style={{ borderColor: NEON_COLORS.primary + '40' }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: NEON_COLORS.primary }}>
                  📊 Visualización Matemática
                </h3>
                <MathVisualization type={activeTab} parameters={mathParams} />
              </div>
            )}
            
            {/* Mathematical Formulas */}
            <div className="p-4 border rounded-lg" style={{ borderColor: NEON_COLORS.secondary + '40' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: NEON_COLORS.secondary }}>
                📐 Fórmulas Relevantes
              </h3>
              
              <div className="space-y-2 text-sm font-mono">
                {activeTab === 'quantum' && (
                  <>
                    <div style={{ color: NEON_COLORS.quantum }}>|ψ⟩ = α|0⟩ + β|1⟩</div>
                    <div style={{ color: NEON_COLORS.primary }}>H|0⟩ = (|0⟩ + |1⟩)/√2</div>
                    <div style={{ color: NEON_COLORS.warning }}>⟨ψ|ψ⟩ = |α|² + |β|² = 1</div>
                  </>
                )}
                
                {activeTab === 'differential' && (
                  <>
                    <div style={{ color: NEON_COLORS.warning }}>d²y/dx² + ω²y = 0</div>
                    <div style={{ color: NEON_COLORS.primary }}>y(x) = C₁e^(rx) + C₂e^(-rx)</div>
                    <div style={{ color: NEON_COLORS.secondary }}>L{'{'}f′(t){'}'} = sF(s) - f(0)</div>
                  </>
                )}
                
                {activeTab === 'complex' && (
                  <>
                    <div style={{ color: NEON_COLORS.primary }}>z = x + iy = re^(iθ)</div>
                    <div style={{ color: NEON_COLORS.quantum }}>f(z) = u(x,y) + iv(x,y)</div>
                    <div style={{ color: NEON_COLORS.warning }}>∮_C f(z)dz = 2πi∑Res(f,zₖ)</div>
                  </>
                )}
                
                {activeTab === 'fourier' && (
                  <>
                    <div style={{ color: NEON_COLORS.secondary }}>F(ω) = ∫f(t)e^(-iωt)dt</div>
                    <div style={{ color: NEON_COLORS.primary }}>f(t) = ∑aₙe^(inωt)</div>
                    <div style={{ color: NEON_COLORS.quantum }}>X[k] = ∑x[n]e^(-2πikn/N)</div>
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