import React, { useState, useEffect } from 'react';

const NEON = {
    blue: '#00FFFF',
    green: '#39FF14',
    red: '#FF3131',
    yellow: '#FCD34D',
    orange: '#F97316'
};

const DigitalDisplay = ({ label, value, unit, color, icon }) => (
    <div className="relative bg-black/60 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-between overflow-hidden group hover:border-opacity-100 transition-all duration-500 hover:scale-105"
         style={{ borderColor: `${color}40`, boxShadow: `inset 0 0 15px ${color}10` }}>
        
        {/* Efecto de barrido láser */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.03)] to-transparent opacity-0 group-hover:opacity-100 animate-scan pointer-events-none"></div>

        <div className="flex justify-between w-full mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{label}</span>
            <span className="text-lg opacity-80" style={{ color: color }}>{icon}</span>
        </div>
        
        <div className="flex items-baseline gap-1">
             {/* Fuente monoespaciada para efecto digital */}
            <span className="text-4xl sm:text-5xl font-mono font-black tracking-tighter tabular-nums" 
                  style={{ color: color, textShadow: `0 0 15px ${color}` }}>
                {value}
            </span>
            <span className="text-sm font-bold text-gray-500">{unit}</span>
        </div>

        {/* Indicador de actividad */}
        <div className="w-full h-1 bg-gray-800 mt-4 rounded-full overflow-hidden">
            <div className="h-full w-1/3 animate-pulse" style={{ backgroundColor: color }}></div>
        </div>
    </div>
);

const TelemetryPanel = () => {
    // Simulamos datos vivos que llegarían de los sensores/robots
    const [data, setData] = useState({ 
        temp: 24.5, 
        hum: 60, 
        soil: 7.2, 
        light: 850,
        co2: 420 
    });

    useEffect(() => {
        const interval = setInterval(() => {
            // Pequeñas variaciones para simular lectura real
            setData(prev => ({
                temp: (24 + Math.random()).toFixed(1),
                hum: (60 + Math.random() * 2 - 1).toFixed(0),
                soil: (7.0 + Math.random() * 0.2).toFixed(2),
                light: (850 + Math.random() * 20).toFixed(0),
                co2: (420 + Math.random() * 10).toFixed(0)
            }));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                    <div className="w-3 h-3 bg-[#39FF14] rounded-full"></div>
                    <div className="absolute top-0 left-0 w-3 h-3 bg-[#39FF14] rounded-full animate-ping"></div>
                </div>
                <h2 className="text-[#00FFFF] text-xl font-bold uppercase tracking-widest text-shadow-neon">
                    Telemetría en Tiempo Real (Nodo Central)
                </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <DigitalDisplay label="Temp. Aire" value={data.temp} unit="°C" color={NEON.blue} icon="🌡️" />
                <DigitalDisplay label="Humedad" value={data.hum} unit="%" color={NEON.green} icon="💧" />
                <DigitalDisplay label="pH Suelo" value={data.soil} unit="pH" color={NEON.yellow} icon="🌱" />
                <DigitalDisplay label="Radiación" value={data.light} unit="W/m²" color={NEON.orange} icon="☀️" />
                <DigitalDisplay label="Calidad Aire" value={data.co2} unit="PPM" color={NEON.red} icon="☁️" />
            </div>
        </div>
    );
};

export default TelemetryPanel;