import { create } from 'zustand';

/**
 * useLabStore
 * -----------
 * Store global (Federated State) para la integración v3.0 de los laboratorios.
 * Actúa como "mochila de datos" que persiste el estado cuando el usuario navega entre laboratorios.
 */
export const useLabStore = create((set) => ({
  // ESTADO DEL LABORATORIO DE ELECTRÓNICA
  electronicsData: {
    active: false,
    signals: {
      vin: [],
      vout: [],
      time: []
    },
    schematic: {
      nodes: (() => {
        try {
          if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('lab_electronics_schematic');
            if (raw) return JSON.parse(raw).nodes || [];
          }
        } catch {}
        return [];
      })(),
      edges: (() => {
        try {
          if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('lab_electronics_schematic');
            if (raw) return JSON.parse(raw).edges || [];
          }
        } catch {}
        return [];
      })()
    },
    // Generic simulation results (Pyodide/SPICE)
    simulationResults: {
      history: null,
      analysis: null,
      netlist: null
    },
    params: {
      vinAmp: 0.1,
      vinFreq: 1000,
      vcc: 12,
      rc: 2000
    },
    lastUpdate: null
  },

  // ACCIONES
  setSimulationResults: (results) => set((state) => ({
    electronicsData: {
      ...state.electronicsData,
      active: true,
      simulationResults: {
        history: results.history,
        analysis: results.analysis,
        netlist: results.netlist
      },
      lastUpdate: new Date().toISOString()
    }
  })),

  setSchematic: (data) => {
    set((state) => ({
      electronicsData: {
        ...state.electronicsData,
        active: true,
        schematic: {
          nodes: data.nodes || [],
          edges: data.edges || []
        },
        lastUpdate: new Date().toISOString()
      }
    }));
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lab_electronics_schematic', JSON.stringify({
          nodes: data.nodes || [],
          edges: data.edges || []
        }));
      }
    } catch {}
  },

  setElectronicsSignal: (data) => set((state) => ({
    electronicsData: {
      ...state.electronicsData,
      active: true,
      signals: data.signals,
      params: { ...state.electronicsData.params, ...data.params },
      lastUpdate: new Date().toISOString()
    }
  })),

  // ESTADO DEL SISTEMA DE PUENTE (BRIDGE)
  bridgeStatus: {
    connected: true,
    latency: 0,
    syncRequired: false
  },

  setBridgeStatus: (status) => set((state) => ({
    bridgeStatus: { ...state.bridgeStatus, ...status }
  })),

  reset: () => set({ electronicsData: { active: false, signals: {}, params: {}, lastUpdate: null } })
}));
