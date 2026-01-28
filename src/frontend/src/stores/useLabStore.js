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
    params: {
      vinAmp: 0.1,
      vinFreq: 1000,
      vcc: 12,
      rc: 2000
    },
    lastUpdate: null
  },

  // ACCIONES
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
