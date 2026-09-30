import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HonestyBadge from './HonestyBadge.jsx';
import { SIGNAL_CATALOG } from './signalCatalog.js';
import {
  readMicSpectrumStatus,
  readRobotStatus,
  readTelemetryV3
} from '../../services/cmscAdapters.js';

const DOORS = [
  { to: '/lab-telecom', label: 'Telecom · FFT', signalId: 'S30', port: 'P-LAB-02', adapter: 'readMicSpectrumStatus' },
  { to: '/advanced-math-v2', label: 'Motor de Modelado Científico', signalId: 'S35', port: null, adapter: null },
  { to: '/lab-electronics', label: 'Electrónica · Falstad + solver', signalId: 'S32', port: 'P-LAB-01', adapter: null },
  { to: '/labs/robotics', label: 'Robótica', signalId: 'S50', port: 'P-LAB-03', adapter: 'readRobotStatus' },
  { to: '/lab-embedded', label: 'Sistemas Embebidos', signalId: 'S39', port: null, adapter: null },
  { to: '/data-science', label: 'Ciencia de Datos', signalId: 'S40', port: null, adapter: 'readTelemetryV3' },
  { to: '/ai-predictive', label: 'IA Predictiva', signalId: 'S61', port: 'P-IA-01', adapter: null },
  { to: '/knowledge', label: 'Knowledge Hub', signalId: 'S79', port: 'P-KH-01', adapter: null },
  { to: null, label: 'Física · pendiente', signalId: null, port: null, adapter: null }
];

const ADAPTERS = {
  readMicSpectrumStatus,
  readRobotStatus,
  readTelemetryV3
};

const LabDoors = () => {
  const [live, setLive] = useState({});
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  const probe = useCallback(async (door) => {
    const fn = ADAPTERS[door.adapter];
    if (!fn || !door.signalId) return null;
    try {
      const result = await fn();
      const signalId = result.signalId || door.signalId;
      return {
        doorId: door.label,
        ok: result.ok,
        estado: result.estado,
        nota: result.nota || '',
        label: signalId === 'S10' ? 'S10/S11' : signalId
      };
    } catch (err) {
      return { doorId: door.label, ok: false, estado: 'ROTO', nota: 'lectura fallida', label: door.signalId };
    }
  }, []);

  const probeAll = useCallback(async () => {
    const doorsWithAdapter = DOORS.filter((d) => d.adapter && d.signalId);
    setChecking(true);
    const results = await Promise.allSettled(doorsWithAdapter.map(probe));
    const map = {};
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value) map[r.value.doorId] = r.value;
    });
    setLive(map);
    setLastCheck(new Date().toISOString().slice(11, 19));
    setChecking(false);
  }, [probe]);

  useEffect(() => {
    probeAll();
  }, [probeAll]);

  const signalOf = (id) => SIGNAL_CATALOG.find((s) => s.signal_id === id);
  const liveCount = Object.values(live).filter((l) => l.ok).length;
  const probed = Object.keys(live).length;

  return (
    <section className="rounded-xl border border-gray-800/70 bg-gray-900/25 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-200">Laboratorios vinculados</h3>
          <p className="text-[10px] text-gray-500">puertos de lectura · estado en vivo</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] text-gray-500 font-mono">
            {probed > 0 ? `${liveCount}/${probed}` : ''}
            {lastCheck && ` · ${lastCheck}`}
          </span>
          <button
            type="button"
            onClick={probeAll}
            disabled={checking}
            className="px-2 py-1 rounded text-[10px] font-semibold border border-gray-700 text-gray-300 hover:border-gray-500 disabled:opacity-40 transition-colors"
          >
            {checking ? '…' : '↻ reproducar'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {DOORS.map((d) => {
          const sig = signalOf(d.signalId);
          const liveProbe = live[d.label] || null;
          const estadoVivo = liveProbe ? liveProbe.estado : null;
          const estadoVisible = estadoVivo || (d.signalId ? sig?.estado : 'DISENO');
          const ref = d.signalId
            ? `${liveProbe?.label || d.signalId}${d.port ? ` · ${d.port}` : ''}`
            : 'sin ruta · sin laboratorio aún';
          const title = [
            d.label,
            liveProbe?.nota || '',
            d.adapter ? `${d.adapter}() · lectura real` : ''
          ].filter(Boolean).join(' — ');
          const inner = (
            <span className="flex items-center justify-between gap-2 min-w-0" title={title}>
              <span className="min-w-0">
                <span className="text-[11px] font-medium text-gray-200 truncate block">{d.label}</span>
                <span className="text-[10px] text-gray-500 font-mono block">{ref}</span>
              </span>
              <span className="flex-shrink-0">
                <HonestyBadge estado={estadoVisible} confidence={null} showConfidence={false} />
              </span>
            </span>
          );
          return d.to ? (
            <Link
              key={d.label}
              to={d.to}
              className="block px-2 py-1 rounded transition-colors hover:bg-gray-800/60"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={d.label}
              className="block px-2 py-1 rounded opacity-70"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LabDoors;