import React from 'react';

const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  darkBackground: '#0a0a0a',
};

const Section = ({ title, children }) => (
  <div className="p-4 rounded-xl border mb-6" style={{ borderColor: NEON_COLORS.primary + '55', boxShadow: `0 0 12px ${NEON_COLORS.primary}40` }}>
    <h2 className="text-xl font-bold mb-3 uppercase" style={{ color: NEON_COLORS.primary, textShadow: `0 0 10px ${NEON_COLORS.primary}80` }}>{title}</h2>
    {children}
  </div>
);

const EmbeddedLab = () => {
  return (
    <div className="p-6 pt-20 min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 uppercase text-center" style={{ color: NEON_COLORS.primary, textShadow: `0 0 12px ${NEON_COLORS.primary}, 0 0 8px ${NEON_COLORS.primary}AA` }}>
          Laboratorio de Sistemas Embebidos
        </h1>
        <p className="text-base text-center text-gray-400 mb-8 max-w-3xl mx-auto">
          Simulación de microcontroladores y prototipos con herramientas abiertas. Ejemplos totalmente interactivos en el navegador.
        </p>

        <Section title="Arduino/Wokwi (Simulador Web)">
          <p className="text-sm text-gray-400 mb-2">Simula placas Arduino, ESP32 y más. Ejemplo: Blink + Servo.</p>
          <div className="rounded-lg overflow-hidden border" style={{ borderColor: '#334155' }}>
            <iframe
              title="Wokwi Simulator"
              src="https://wokwi.com/projects/334616299649228242?embed=1"
              width="100%"
              height="560"
              frameBorder="0"
              allowFullScreen
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">Fuente: Wokwi Playground (open-source). Puedes cargar tus propios proyectos.</div>
        </Section>

        <Section title="FPGA / HDL (Yosys + EDA Playground)">
          <p className="text-sm text-gray-400 mb-2">Explora síntesis y simulación HDL en la nube.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a className="px-3 py-2 text-sm rounded border neon-btn" style={{ borderColor: NEON_COLORS.primary }} href="https://www.edaplayground.com/" target="_blank" rel="noreferrer">EDA Playground</a>
            <a className="px-3 py-2 text-sm rounded border neon-btn" style={{ borderColor: NEON_COLORS.primary }} href="https://yosyshq.net/yosys/" target="_blank" rel="noreferrer">Yosys HQ</a>
          </div>
        </Section>

        <Section title="RTOS / Emulación">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a className="px-3 py-2 text-sm rounded border neon-btn" style={{ borderColor: NEON_COLORS.primary }} href="https://zephyrproject.org/" target="_blank" rel="noreferrer">Zephyr RTOS</a>
            <a className="px-3 py-2 text-sm rounded border neon-btn" style={{ borderColor: NEON_COLORS.primary }} href="https://renode.io/" target="_blank" rel="noreferrer">Renode (Emulación HW)</a>
          </div>
          <p className="text-xs text-gray-500 mt-2">Para integración avanzada se recomienda usar Renode con scripts .resc y exponer control vía WebSocket para el navegador.</p>
        </Section>
      </div>
    </div>
  );
};

export default EmbeddedLab;