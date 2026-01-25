import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Sphere, Line } from '@react-three/drei';

const RobotModel = ({ position, color = '#00FFFF' }) => {
  return (
    <group position={position}>
      {/* Cuerpo principal */}
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
      {/* Indicador de dirección (frente) */}
      <mesh position={[0.4, 0, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
};

const TrajectoryLine = ({ points, color }) => {
  const lineGeometry = useMemo(() => {
    return new Float32Array(points.flat());
  }, [points]);

  if (points.length < 2) return null;

  return (
    <Line
      points={points} 
      color={color}
      lineWidth={2} 
      dashed={false}
    />
  );
};

const Telemetry3DScene = ({ telemetryData }) => {
  // Historial de posiciones para dibujar la estela
  const [history, setHistory] = React.useState([]);

  // Actualizar historial cuando llega nueva telemetría
  React.useEffect(() => {
    if (telemetryData) {
      const newPoint = [telemetryData.position_x, telemetryData.position_z, telemetryData.position_y]; // Intercambio Y/Z para Three.js (Y es arriba)
      setHistory(prev => {
        const newHist = [...prev, newPoint];
        if (newHist.length > 50) newHist.shift(); // Mantener solo últimos 50 puntos
        return newHist;
      });
    }
  }, [telemetryData]);

  const currentPos = telemetryData 
    ? [telemetryData.position_x, telemetryData.position_z, telemetryData.position_y] // Three.js Y-up
    : [0, 0, 0];

  return (
    <div style={{ width: '100%', height: '400px', background: '#050505', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [15, 15, 15], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        
        {/* Iluminación */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Grilla y Ejes */}
        <Grid args={[20, 20]} cellSize={1} cellThickness={1} cellColor="#333" sectionSize={5} sectionThickness={1.5} sectionColor="#00FFFF" fadeDistance={30} />
        <axesHelper args={[2]} />
        
        {/* Texto de Ejes */}
        <Text position={[2.2, 0, 0]} fontSize={0.5} color="red">X</Text>
        <Text position={[0, 2.2, 0]} fontSize={0.5} color="green">Z (Alt)</Text>
        <Text position={[0, 0, 2.2]} fontSize={0.5} color="blue">Y</Text>

        {/* Robot y Trayectoria */}
        <RobotModel position={currentPos} color={telemetryData?.status_mode === 'error' ? '#FF3131' : '#00FFFF'} />
        <TrajectoryLine points={history} color="#00FFFF" />

        <OrbitControls makeDefault />
      </Canvas>
      
      {/* Overlay de Datos HUD */}
      <div style={{
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        color: '#00FFFF', 
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '4px',
        pointerEvents: 'none'
      }}>
        <div>ID: {telemetryData?.robot || 'N/A'}</div>
        <div>BAT: {telemetryData?.battery_level}%</div>
        <div>POS: [{currentPos.map(n => n.toFixed(1)).join(', ')}]</div>
        <div>VEL: {telemetryData?.velocity_linear} m/s</div>
      </div>
    </div>
  );
};

export default Telemetry3DScene;
