import React, { useEffect, useRef } from 'react';

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

// FFT en tiempo real usando WebAudio + Canvas (laboratorio DSP básico)
const Spectrum = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    let audioCtx, analyser, rafId;
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          analyser.getByteFrequencyData(dataArray);
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 1.8;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i];
            ctx.fillStyle = '#39FF14';
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
          rafId = requestAnimationFrame(draw);
        };
        draw();
      } catch (e) {
        // silencio, el navegador puede bloquear el micrófono
      }
    };
    init();
    return () => { cancelAnimationFrame(rafId); audioCtx && audioCtx.close(); };
  }, []);
  return <canvas ref={canvasRef} width={900} height={260} className="rounded-lg border" style={{ borderColor: '#334155' }} />;
};

const TelecomLab = () => {
  return (
    <div className="p-6 pt-20 min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 uppercase text-center" style={{ color: NEON_COLORS.primary, textShadow: `0 0 12px ${NEON_COLORS.primary}, 0 0 8px ${NEON_COLORS.primary}AA` }}>
          Laboratorio de Telecomunicaciones
        </h1>
        <p className="text-base text-center text-gray-400 mb-8 max-w-3xl mx-auto">
          Experimenta con DSP en tiempo real (FFT), y accede a receptores SDR online. Integración pensada para simulación y análisis de señales.
        </p>

        <Section title="Espectro en Tiempo Real (WebAudio FFT)">
          <p className="text-sm text-gray-400 mb-2">Permite visualizar el espectro de audio del micrófono, útil para prácticas de filtros y análisis espectral.</p>
          <Spectrum />
        </Section>

        <Section title="SDR Online (WebSDR)">
          <p className="text-sm text-gray-400 mb-2">Algunos servidores permiten incrustar el receptor, otros requieren abrir en pestaña nueva por políticas de seguridad.</p>
          <div className="rounded-lg overflow-hidden border mb-2" style={{ borderColor: '#334155' }}>
            <iframe title="WebSDR" src="http://websdr.ewi.utwente.nl:8901/" width="100%" height="480" frameBorder="0" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a className="px-3 py-2 text-sm rounded border neon-btn" style={{ borderColor: NEON_COLORS.primary }} href="https://www.websdr.org/" target="_blank" rel="noreferrer">Lista de WebSDR</a>
            <a className="px-3 py-2 text-sm rounded border neon-btn" style={{ borderColor: NEON_COLORS.primary }} href="https://wiki.gnuradio.org/index.php/Start" target="_blank" rel="noreferrer">GNU Radio Wiki</a>
          </div>
          <p className="text-xs text-gray-500 mt-2">Si el iframe no carga, abre el enlace en una pestaña nueva.</p>
        </Section>
      </div>
    </div>
  );
};

export default TelecomLab;