import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Colores Neón definidos
const NEON_COLORS = {
  primary: '#00FFFF', // Azul Ciber
  secondary: '#39FF14', // Verde Neón (para datos de temperatura/humedad)
  alert: '#FF3131', 
  darkBackground: '#0a0a0a',
};

// Datos simulados para el gráfico (Series de tiempo de 24 horas)
const chartData = [
  { time: '00:00', temp: 20, humidity: 65, sensor: 'BBB-03' },
  { time: '04:00', temp: 18, humidity: 70, sensor: 'BBB-03' },
  { time: '08:00', temp: 24, humidity: 60, sensor: 'BBB-03' },
  { time: '12:00', temp: 30, humidity: 50, sensor: 'BBB-03' },
  { time: '16:00', temp: 28, humidity: 55, sensor: 'BBB-03' },
  { time: '20:00', temp: 22, humidity: 68, sensor: 'BBB-03' },
  { time: '24:00', temp: 21, humidity: 67, sensor: 'BBB-03' },
];

/**
 * GlobalChart: Muestra gráficos de series de tiempo para telemetría general (Temperatura y Humedad).
 * Implementa la Fase 2.2 del Plan Maestro.
 */
const GlobalChart = ({ data = chartData }) => {
  return (
    <div className="w-full h-96 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {/* Fondo del gráfico (transparente) */}
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" /> 
          
          {/* Eje X (Tiempo) */}
          <XAxis dataKey="time" stroke={NEON_COLORS.primary} />
          
          {/* Eje Y (Temperatura) - Izquierda */}
          <YAxis yAxisId="left" stroke={NEON_COLORS.secondary} label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: NEON_COLORS.secondary }} />
          
          {/* Eje Y (Humedad) - Derecha */}
          <YAxis yAxisId="right" orientation="right" stroke={NEON_COLORS.primary} label={{ value: 'Hum. (%)', angle: 90, position: 'insideRight', fill: NEON_COLORS.primary }} />
          
          {/* Tooltip personalizado (Muestra datos al pasar el ratón) */}
          <Tooltip 
            contentStyle={{ backgroundColor: NEON_COLORS.darkBackground, border: `1px solid ${NEON_COLORS.primary}80`, color: NEON_COLORS.primary }}
          />
          
          {/* Leyenda */}
          <Legend wrapperStyle={{ color: 'white' }} />
          
          {/* Línea de Temperatura */}
          <Line yAxisId="left" type="monotone" dataKey="temp" stroke={NEON_COLORS.secondary} activeDot={{ r: 8 }} name="Temperatura (°C)" />
          
          {/* Línea de Humedad */}
          <Line yAxisId="right" type="monotone" dataKey="humidity" stroke={NEON_COLORS.primary} activeDot={{ r: 8 }} name="Humedad (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GlobalChart;
