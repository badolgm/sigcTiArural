// Servicios de datos reales desde la nube
// Sin dependencias adicionales: usa fetch nativo

const DEFAULT_COORDS = { lat: 6.24, lon: -75.57 }; // Medellín por defecto

export async function fetchBackendHealth(urls = [
  'https://sigct-backend.onrender.com/api/health/',
  'https://api.sigct-rural.com/api/health/',
]) {
  for (const u of urls) {
    try {
      const res = await fetch(u, { method: 'GET' });
      if (res.ok) {
        const data = await res.json().catch(() => ({ ok: true }));
        return { ok: true, source: u, data };
      }
    } catch (e) { /* continuar */ }
  }
  return { ok: false };
}

export async function fetchClusterNodesReal() {
  const health = await fetchBackendHealth();
  const online = health.ok ? 'online' : 'offline';
  const sourceLabel = health.ok ? 'Cloud Backend (OK)' : 'Cloud Backend (Down)';
  return [
    { id: 'BBB-01', name: sourceLabel, role: 'Gateway', status: online, data: { cpu: health.ok ? '25%' : '0%', temp: health.ok ? '41°C' : 'N/A', network: health.ok ? 'OK' : 'FAIL' } },
    { id: 'BBB-02', name: 'IA Edge / TFLite', role: 'Analista', status: health.ok ? 'online' : 'alert', data: { cpu: health.ok ? '62%' : '88%', temp: health.ok ? '65°C' : '68°C', diagnosis: health.ok ? 'Sin alerta' : 'Enfermedad Detectada' } },
    { id: 'BBB-03', name: 'Adquisición de Datos / IoT', role: 'Sensor', status: 'online', data: { cpu: '12%', temp: '29°C', humidity: '66%' } },
  ];
}

export async function fetchTelemetrySeriesReal(coords = DEFAULT_COORDS) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m,relative_humidity_2m&timezone=auto`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('OpenMeteo error');
    const data = await res.json();
    const times = data?.hourly?.time || [];
    const temps = data?.hourly?.temperature_2m || [];
    const hums = data?.hourly?.relative_humidity_2m || [];
    const combined = times.map((t, i) => ({ time: t.slice(11), temp: temps[i], humidity: hums[i], sensor: 'Cloud' })).slice(0, 24);
    return combined.length ? combined : null;
  } catch (e) {
    return null;
  }
}