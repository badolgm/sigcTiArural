import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000/api';

export const useRoboticsApi = (robotId) => {
  const [telemetry, setTelemetry] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchTelemetry = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/robot-telemetry/?robot__robot_id=${robotId}&ordering=-timestamp&limit=1`);
        
        if (!response.ok) {
          throw new Error('Error fetching telemetry');
        }
        
        const data = await response.json();
        
        if (isMounted && data.results && data.results.length > 0) {
          setTelemetry(data.results[0]);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Robotics API Warning:", err);
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Polling cada 1 segundo (1000ms)
    const intervalId = setInterval(fetchTelemetry, 1000);
    
    // Primera llamada inmediata
    fetchTelemetry();

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [robotId]);

  return { telemetry, error, loading };
};
