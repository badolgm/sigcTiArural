import React from 'react';

const NEON = {
    blue: '#00FFFF',
    green: '#39FF14',
    red: '#FF3131',
    yellow: '#FCD34D',
    orange: '#F97316'
};

// Mini sparkline SVG (sin dependencias): misma serie de datos, lectura ejecutiva
const MiniSparkline = ({ values, color, label, unit }) => {
    const safe = (values || []).filter((v) => Number.isFinite(Number(v))).map(Number);
    if (safe.length < 2) {
        return (
            <div className="text-[10px] font-mono text-gray-500">Pendiente de lecturas</div>
        );
    }
    const min = Math.min(...safe);
    const max = Math.max(...safe);
    const range = (max - min) || 1;
    const points = safe
        .map((v, i) => `${(i / (safe.length - 1)) * 100},${28 - ((v - min) / range) * 26}`)
        .join(' ');
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color }}>{label}</span>
                <span className="text-[10px] font-mono" style={{ color }}>
                    {safe[safe.length - 1]}{unit}
                </span>
            </div>
            <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="w-full h-8">
                <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
            </svg>
        </div>
    );
};

const DigitalDisplay = ({ label, value, unit, color, icon, compact }) => (
    <div className="relative bg-black/60 border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-between overflow-hidden group hover:border-opacity-100 transition-all duration-500 hover:scale-105"
         style={{ borderColor: `${color}40`, boxShadow: `inset 0 0 15px ${color}10` }}>

        {/* Efecto de barrido láser */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.03)] to-transparent opacity-0 group-hover:opacity-100 animate-scan pointer-events-none"></div>

        <div className="flex justify-between w-full mb-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold truncate">{label}</span>
            <span className="text-sm opacity-80" style={{ color: color }}>{icon}</span>
        </div>

        <div className="flex items-baseline gap-1">
            <span className={`${compact ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'} font-mono font-black tracking-tighter tabular-nums`}
                  style={{ color: color, textShadow: `0 0 15px ${color}` }}>
                {value}
            </span>
            {unit && <span className="text-xs font-bold text-gray-500">{unit}</span>}
        </div>

        {/* Indicador de actividad */}
        <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
            <div className="h-full w-1/3 animate-pulse" style={{ backgroundColor: color }}></div>
        </div>
    </div>
);

const TelemetryPanel = ({ items = [], sourceMode = 'unknown', loading = false, error = null }) => {
    const latestReading = items.length ? items[items.length - 1] : null;
    const timestampLabel = latestReading?.timestamp
        ? (String(latestReading.timestamp).includes('T')
            ? String(latestReading.timestamp).slice(11, 16)
            : String(latestReading.timestamp))
        : '--:--';
    // Estado de verdad (FASE 9A): mismo lenguaje 🟢/⚪ ya establecido en README.md
    // (etiqueta corta para no desbordar el tile de fuente grande de DigitalDisplay)
    const sourceLabel = sourceMode === 'live'
        ? '🟢 LIVE'
        : sourceMode === 'simulated'
            ? '⚪ SIM'
            : '⚪ N/D';
    const sourceColor = sourceMode === 'live' ? NEON.green : NEON.orange;

    // Series para mini gráficas ejecutivas (mismos datos de `items`, sin inventar)
    const tempSeries = items.map((r) => r?.temperature);
    const humSeries = items.map((r) => r?.humidity);

    return (
        <div className="w-full mb-8 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-l-4 border-[#00FFFF] pl-3">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-3 h-3 bg-[#39FF14] rounded-full"></div>
                        <div className="absolute top-0 left-0 w-3 h-3 bg-[#39FF14] rounded-full animate-ping"></div>
                    </div>
                    <h2 className="text-[#00FFFF] text-lg font-bold uppercase tracking-widest text-shadow-neon">
                        Telemetría en Tiempo Real (Nodo Central)
                    </h2>
                </div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    {items.length} lecturas · última {timestampLabel} · {sourceLabel}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <DigitalDisplay compact
                    label="Temp. Aire"
                    value={loading ? '...' : latestReading?.temperature ?? '--'}
                    unit="°C"
                    color={NEON.blue}
                    icon="🌡️"
                />
                <DigitalDisplay compact
                    label="Humedad"
                    value={loading ? '...' : latestReading?.humidity ?? '--'}
                    unit="%"
                    color={NEON.green}
                    icon="💧"
                />
                <DigitalDisplay compact
                    label="Sensor"
                    value={loading ? '...' : latestReading?.sensor_id ?? '--'}
                    unit=""
                    color={NEON.yellow}
                    icon="🛰️"
                />
                <DigitalDisplay compact
                    label="Fuente"
                    value={loading ? '...' : sourceLabel}
                    unit=""
                    color={loading ? NEON.orange : sourceColor}
                    icon="📡"
                />
                <DigitalDisplay compact
                    label="Lectura"
                    value={loading ? '...' : error ? 'ERR' : timestampLabel}
                    unit=""
                    color={NEON.red}
                    icon={error ? '⚠️' : '⏱️'}
                />
            </div>

            {/* Lectura ejecutiva: mini tendencias de la misma serie (U3.7) */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border bg-black/40" style={{ borderColor: `${NEON.blue}30` }}>
                    <MiniSparkline values={tempSeries} color={NEON.blue} label="Tendencia Temp." unit="°C" />
                </div>
                <div className="p-3 rounded-xl border bg-black/40" style={{ borderColor: `${NEON.green}30` }}>
                    <MiniSparkline values={humSeries} color={NEON.green} label="Tendencia Hum." unit="%" />
                </div>
                <div className="p-3 rounded-xl border bg-black/40 flex items-center justify-between" style={{ borderColor: '#334155' }}>
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Modo fuente</span>
                    <span className="text-xs font-mono" style={{ color: sourceColor }}>{sourceLabel} · {sourceMode}</span>
                </div>
                <div className="p-3 rounded-xl border bg-black/40 flex items-center justify-between" style={{ borderColor: '#334155' }}>
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Estado panel</span>
                    <span className="text-xs font-mono" style={{ color: error ? NEON.red : NEON.green }}>
                        {loading ? 'Cargando...' : error ? '⚠ Error' : 'OK'}
                    </span>
                </div>
            </div>
            {error && (
                <div className="mt-4 text-sm font-semibold text-[#FF3131]">
                    Error de telemetria oficial: {error}
                </div>
            )}
        </div>
    );
};

export default TelemetryPanel;