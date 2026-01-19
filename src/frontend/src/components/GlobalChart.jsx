import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const NEON_COLORS = {
  primary: '#00FFFF',
  secondary: '#39FF14', 
  darkBackground: '#0a0a0a',
};

const GlobalChart = ({ data, compact }) => {
  const safeData = data || [
      { time: '00:00', temp: 0, humidity: 0 },
  ];

  return (
    <div className={`w-full ${compact ? 'h-48' : 'h-80'} transition-all duration-500`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={safeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" /> 
          <XAxis dataKey="time" stroke={NEON_COLORS.primary} tick={{fill: NEON_COLORS.primary, fontSize: 10}} />
          <YAxis yAxisId="left" stroke={NEON_COLORS.secondary} tick={{fill: NEON_COLORS.secondary, fontSize: 10}} label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: NEON_COLORS.secondary, fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke={NEON_COLORS.primary} tick={{fill: NEON_COLORS.primary, fontSize: 10}} label={{ value: 'Hum. (%)', angle: 90, position: 'insideRight', fill: NEON_COLORS.primary, fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: NEON_COLORS.darkBackground, border: `1px solid ${NEON_COLORS.primary}80`, color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: 'white', fontSize: '12px' }} />
          <Line yAxisId="left" type="monotone" dataKey="temp" stroke={NEON_COLORS.secondary} strokeWidth={2} dot={{r: 4, fill: NEON_COLORS.secondary}} activeDot={{ r: 6 }} name="Temperatura (°C)" animationDuration={1500} />
          <Line yAxisId="right" type="monotone" dataKey="humidity" stroke={NEON_COLORS.primary} strokeWidth={2} dot={{r: 4, fill: NEON_COLORS.primary}} name="Humedad (%)" animationDuration={1500} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GlobalChart;