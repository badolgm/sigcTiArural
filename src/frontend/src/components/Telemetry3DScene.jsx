import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Componente simple para el robot
const RobotModel = ({ position, color = '#00FFFF' }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
};

// Trayectoria usando puntos simples (cubos) para evitar problemas con Line/Shaders complejos
const TrajectoryPoints = ({ points, color }) => {
    return (
        <group>
            {points.map((p, i) => (
                <mesh key={i} position={p}>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <meshBasicMaterial color={color} opacity={0.5 + (i/50)*0.5} transparent />
                </mesh>
            ))}
        </group>
    )
}

const Telemetry3DScene = ({ telemetryData }) => {
  // Historial de posiciones
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    if (telemetryData) {
      // Y-up convention: x, z(height), y
      // Validamos que sean números
      const x = Number(telemetryData.position_x) || 0;
      const y = Number(telemetryData.position_y) || 0;
      const z = Number(telemetryData.position_z) || 0;
      
      const newPoint = [x, z, y];
      setHistory(prev => {
        const newHist = [...prev, newPoint];
        if (newHist.length > 50) newHist.shift();
        return newHist;
      });
    }
  }, [telemetryData]);

  const currentPos = telemetryData 
    ? [Number(telemetryData.position_x)||0, Number(telemetryData.position_z)||0, Number(telemetryData.position_y)||0] 
    : [0, 0, 0];

  return (
    <div style={{ width: '100%', height: '400px', background: '#050505', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Suelo simple (Wireframe) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[20, 20, 20, 20]} />
            <meshBasicMaterial color="#333" wireframe />
        </mesh>

        <axesHelper args={[2]} />

        <RobotModel position={currentPos} color={telemetryData?.status_mode === 'error' ? '#FF3131' : '#00FFFF'} />
        <TrajectoryPoints points={history} color="#00FFFF" />

        <OrbitControls />
      </Canvas>
      
      {/* HUD HTML Overlay (Seguro) */}
      <div style={{
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        color: '#00FFFF', 
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <div style={{fontWeight:'bold', borderBottom:'1px solid #333', marginBottom:'4px'}}>VISUALIZADOR 3D v2 (SAFE)</div>
        <div>ID: {telemetryData?.robot || 'Esperando datos...'}</div>
        <div>POS: [{currentPos.map(n => n.toFixed(1)).join(', ')}]</div>
        <div>BAT: {telemetryData?.battery_level || '--'}%</div>
      </div>
    </div>
  );
};

export default Telemetry3DScene;
