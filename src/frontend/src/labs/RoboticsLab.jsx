import React, { useEffect, useRef, useState } from 'react';

const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14',
  alert: '#FF3131',
  darkBackground: '#0a0a0a',
};

const Section = ({ title, children }) => (
  <div className="p-4 rounded-xl border mb-6" style={{ borderColor: NEON_COLORS.primary + '55', boxShadow: `0 0 12px ${NEON_COLORS.primary}40` }}>
    <h2 className="text-xl font-bold mb-3 uppercase" style={{ color: NEON_COLORS.primary, textShadow: `0 0 10px ${NEON_COLORS.primary}80` }}>{title}</h2>
    {children}
  </div>
);

// Carga roslib desde CDN para evitar añadir dependencias al proyecto
const useRosbridgeStatus = () => {
  const [status, setStatus] = useState('desconectado');
  const [error, setError] = useState(null);
  const rosRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/roslib/build/roslib.min.js';
    script.async = true;
    script.onload = () => {
      setStatus('listo');
    };
    script.onerror = () => setError('No se pudo cargar roslib desde CDN');
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      if (rosRef.current && rosRef.current.isConnected) rosRef.current.close();
    };
  }, []);

  const connect = (url = 'ws://localhost:9090') => {
    try {
      // eslint-disable-next-line no-undef
      const ros = new window.ROSLIB.Ros({ url });
      ros.on('connection', () => setStatus('conectado'));
      ros.on('error', (e) => { setError(String(e)); setStatus('error'); });
      ros.on('close', () => setStatus('cerrado'));
      rosRef.current = ros;
    } catch (e) {
      setError(String(e));
      setStatus('error');
    }
  };

  return { status, error, connect };
};

const RoboticsLab = () => {
  const { status, error, connect } = useRosbridgeStatus();

  return (
    <div className="p-6 pt-20 min-h-screen" style={{ backgroundColor: NEON_COLORS.darkBackground }}>
      <div className="max-w-7xl mx-auto text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 uppercase text-center" style={{ color: NEON_COLORS.primary, textShadow: `0 0 12px ${NEON_COLORS.primary}, 0 0 8px ${NEON_COLORS.primary}AA` }}>
          Laboratorio de Robótica
        </h1>
        <p className="text-base text-center text-gray-400 mb-8 max-w-3xl mx-auto">
          Integración con simuladores reales: Webots (player web), visor URDF y conexión opcional a ROSBridge para interactuar con robots.
        </p>

        <Section title="Simulador Webots (Player Web)">
          <p className="text-sm text-gray-400 mb-2">Ejecuta mundos reales de Webots directamente en el navegador.</p>
          <div className="rounded-lg overflow-hidden border" style={{ borderColor: '#334155' }}>
            <iframe
              title="Webots Player"
              src="https://webots.cloud/run?url=https://github.com/cyberbotics/webots/blob/release/projects/robots/robotis/darwin-op/worlds/darwin-op.wbt"
              width="100%"
              height="480"
              frameBorder="0"
              allowFullScreen
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">Fuente: Cyberbotics Webots Player. Si el dominio está bloqueado por red/DNS, usa el botón para abrir en pestaña.</div>
          <div className="mt-2">
            <a
              className="px-3 py-2 text-xs rounded border"
              style={{ borderColor: NEON_COLORS.primary, color: '#e6edf3' }}
              href="https://webots.cloud/run?url=https://github.com/cyberbotics/webots/blob/release/projects/robots/robotis/darwin-op/worlds/darwin-op.wbt"
              target="_blank"
              rel="noreferrer"
            >Abrir Webots Cloud</a>
          </div>
        </Section>

        <Section title="Visor URDF (Three.js)">
          <p className="text-sm text-gray-400 mb-2">Visualiza modelos URDF de robots industriales (UR5 de Universal Robots como ejemplo).</p>
          <div className="rounded-lg overflow-hidden border" style={{ borderColor: '#334155' }}>
            <iframe
              title="URDF Viewer"
              src="https://gkjohnson.github.io/urdf-loaders/javascript/example/index.html"
              width="100%"
              height="420"
              frameBorder="0"
              allowFullScreen
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">Visor URDF público con ejemplos integrados. Si necesitas cargar URDF externos con meshes, abre en pestaña y usa el selector de paquetes.</div>
          <div className="mt-2">
            <a
              className="px-3 py-2 text-xs rounded border"
              style={{ borderColor: NEON_COLORS.primary, color: '#e6edf3' }}
              href="https://gkjohnson.github.io/urdf-loaders/javascript/example/index.html"
              target="_blank"
              rel="noreferrer"
            >Abrir URDF Viewer</a>
          </div>
        </Section>

        <Section title="Conexión ROSBridge (Opcional)">
          <p className="text-sm text-gray-400 mb-3">Estado: <span style={{ color: status === 'conectado' ? NEON_COLORS.secondary : NEON_COLORS.alert }}>{status}</span>{error ? ` • ${error}` : ''}</p>
          <button
            className="px-4 py-2 rounded-md font-bold neon-btn"
            style={{ backgroundColor: NEON_COLORS.secondary, color: '#0a0a0a', boxShadow: `0 0 8px ${NEON_COLORS.secondary}` }}
            onClick={() => connect('ws://localhost:9090')}
          >
            Conectar a ws://localhost:9090
          </button>
          <p className="text-xs text-gray-500 mt-2">Requiere que tengas rosbridge-server ejecutándose localmente. Con la conexión podrás publicar/escuchar tópicos desde el navegador.</p>
        </Section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <a className="px-3 py-2 text-sm rounded border neon-btn" style={{ borderColor: NEON_COLORS.primary }} href="https://wiki.ros.org/rosbridge_suite" target="_blank" rel="noreferrer">rosbridge_suite</a>
          <a className="px-3 py-2 text-sm rounded border neon-btn" style={{ borderColor: NEON_COLORS.primary }} href="https://cyberbotics.com/" target="_blank" rel="noreferrer">Cyberbotics Webots</a>
          <a className="px-3 py-2 text-sm rounded border neon-btn" style={{ borderColor: NEON_COLORS.primary }} href="https://github.com/gkjohnson/urdf-loaders" target="_blank" rel="noreferrer">URDF Loaders</a>
          <a className="px-3 py-2 text-sm rounded border neon-btn" style={{ borderColor: NEON_COLORS.primary }} href="https://gazebosim.org/" target="_blank" rel="noreferrer">Gazebo / Ignition</a>
        </div>
      </div>
    </div>
  );
};

export default RoboticsLab;