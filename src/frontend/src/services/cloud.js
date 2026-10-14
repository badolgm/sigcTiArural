// Servicios de datos reales desde la nube
// Sin dependencias adicionales: usa fetch nativo

const DEFAULT_COORDS = { lat: 6.24, lon: -75.57 }; // Medellín por defecto

export async function fetchBackendHealth(urls = [
  // Ruta válida comprobada en Render
  'https://sigct-backend.onrender.com/health',
  // Fallback antiguo (puede retornar 404 o no resolver)
  'https://sigct-backend.onrender.com/api/health',
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
  const backendReachable = health.ok;
  const gatewayStatus = backendReachable ? 'online' : 'offline';
  const sourceLabel = backendReachable ? 'Gateway / Cloud (alcanzable)' : 'Gateway / Cloud (sin conexión)';
  // Estado honesto: solo se conoce el alcance del backend (health).
  // No se fabrican métricas de CPU, temperatura, red, diagnóstico ni humedad
  // porque no provienen de una fuente real de telemetría del clúster BBB.
  return [
    { id: 'BBB-01', name: sourceLabel, role: 'Gateway', status: gatewayStatus, data: {} },
    { id: 'BBB-02', name: 'IA Edge / TFLite', role: 'Analista', status: 'offline', data: {} },
    { id: 'BBB-03', name: 'Adquisición de Datos / IoT', role: 'Sensor', status: 'offline', data: {} },
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