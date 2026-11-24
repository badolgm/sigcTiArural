import { create } from 'zustand';
import {
  SIGNAL_CATALOG,
  LIVE_SIGNAL_IDS,
  SANE_ENTRIES,
  HUERFANO_ENTRY
} from '../pages/cmsc/signalCatalog.js';

/**
 * Snapshot por defecto de S35. NO publicado: es el mismo escenario SIM que el
 * Hero mostraba antes de la conexión, conservado como fallback honesto cuando
 * el núcleo MMC no está montado. `published:false` impide presentarlo como vivo.
 * El estado usa el canon de 7 estados; `LOCAL` es una clase de señal, no estado.
 */
const DEFAULT_MATH_LIVE_SIGNAL = {
  published: false,
  id: 'S35',
  expression: 'y(t)=2*sin(2*pi*100*t)',
  sourceLabel: 'Escenario base del MMC (no publicado)',
  sourceKind: null,
  fs: 2000,
  sampleCount: 41,
  t0: 0,
  t1: 0.02,
  estado: 'SIM',
  clase_senal: 'GENERADA',
  dominio: 'Matemático',
  min: null,
  max: null,
  rms: null,
  metrics: null,
  samples: [],
  updatedAt: null
};

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

  // RAMA DECLARATIVA signalRegistry (F3B §11 · F3C §6) — modo lectura.
  // Se puebla a partir del SIGNAL_MAP; no toca claves existentes.
  // bridgeStatus se congela y se etiqueta HUERFANO en el registry, sin borrarse.
  signalRegistry: {
    revision: 1,
    generated_from: 'CMSC_SIGNAL_MAP_v1',
    catalog: SIGNAL_CATALOG,
    liveIds: LIVE_SIGNAL_IDS,
    sane: SANE_ENTRIES,
    huerfano: HUERFANO_ENTRY
  },

  // RAMA VIVA S35 — snapshot publicado por MmcMathematicsCore. No sustituye al
  // signalRegistry (catálogo declarativo): es la señal activa que el laboratorio
  // matemático produce en tiempo real. Solo lectura para los consumidores.
  mathLiveSignal: DEFAULT_MATH_LIVE_SIGNAL,

  setMathLiveSignal: (snapshot) => set((state) => ({
    mathLiveSignal: {
      ...state.mathLiveSignal,
      ...snapshot,
      id: 'S35',
      published: snapshot?.published !== false,
      updatedAt: new Date().toISOString()
    }
  })),

  reset: () => set({ electronicsData: { active: false, signals: {}, params: {}, lastUpdate: null } })
}));
