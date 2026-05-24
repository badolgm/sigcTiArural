/**
 * mathHelpers.js
 * Funciones matemáticas puras e independientes para el laboratorio avanzado.
 * Optimiza la complejidad lógica sin afectar la renderización de React.
 */

// ==========================================
// 1. COMPONENTES Y LOGÍSICA CUÁNTICA (PRESERVADOS)
// ==========================================

// Matriz de Identidad para cálculos de compuertas
export const INDENTITY_MATRIX = [
  [{ r: 1, i: 0 }, { r: 0, i: 0 }],
  [{ r: 0, i: 0 }, { r: 1, i: 0 }]
];

// Definición inicial de los Qubits base del simulador
export const getInitialQubits = () => [
  { id: 0, label: 'q[0]', state: '|0⟩', gates: [], probability0: 100, probability1: 0 },
  { id: 1, label: 'q[1]', state: '|0⟩', gates: [], probability0: 100, probability1: 0 },
  { id: 2, label: 'q[2]', state: '|0⟩', gates: [], probability0: 100, probability1: 0 }
];

// Helper puro para agregar compuertas a un qubit específico
export const appendGateToQubit = (qubitsList, targetId, gateType) => {
  return qubitsList.map(q => {
    if (q.id === targetId) {
      return {
        ...q,
        gates: [...q.gates, gateType]
      };
    }
    return q;
  });
};

// Helper puro para limpiar el circuito
export const resetQubitGates = (qubitsList) => {
  return qubitsList.map(q => ({
    ...q,
    gates: [],
    probability0: 100,
    probability1: 0,
    state: '|0⟩'
  }));
};

// ==========================================
// 2. INTEGRACIÓN: TRANSFORMACIONES VECTORIALES Y ONDAS
// ==========================================

/**
 * Genera un set de datos analíticos para visualización de ondas sinusoidales y cosenoidales
 * Saca este bucle pesado del render de React.
 * @param {number} step - Incremento en grados para el muestreo (por defecto 5)
 */
export const generateWaveData = (step = 5) => {
  const data = [];
  for (let i = 0; i <= 360; i += step) {
    const rad = (i * Math.PI) / 180;
    data.push({
      angle: i,
      sin: Math.sin(rad),
      cos: Math.cos(rad)
    });
  }
  return data;
};

/**
 * Calcula las propiedades dinámicas de una matriz de transformación lineal R2
 * Evita recálculos redundantes en cada ciclo del canvas.
 */
export const getTransformationMatrix = (rotation, scale) => {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad) * scale;
  const sin = Math.sin(rad) * scale;
  return {
    c11: cos.toFixed(2),
    c12: (-sin).toFixed(2),
    c21: sin.toFixed(2),
    c22: cos.toFixed(2)
  };
};