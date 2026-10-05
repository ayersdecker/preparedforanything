import { useEffect, useState } from 'react';
import type { Geometry } from 'geojson';

export interface WeatherAlert {
  id: string;
  geometry: Geometry | null;
  properties: {
    event: string;
    headline: string;
    description: string;
    instruction: string | null;
    areaDesc: string;
    severity: string;
    sent: string;
    expires: string;
  };
}

export function useWeatherAlerts(state: string | undefined) {
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<{
    state?: string;
    alerts: WeatherAlert[];
    status: 'loading' | 'ready' | 'error';
    checkedAt?: Date;
  }>({ alerts: [], status: 'loading' });

  useEffect(() => {
    if (!state) return;
    const interval = window.setInterval(() => setRefresh(value => value + 1), 300000);
    return () => window.clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let active = true;
    fetch(`https://api.weather.gov/alerts/active?area=${state}`, { signal: controller.signal, headers: { Accept: 'application/geo+json' } })
      .then(response => {
        if (!response.ok) throw new Error('Alerts unavailable');
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data.features)) throw new Error('Invalid alert response');
        if (active) setResult({ state, alerts: data.features.filter((alert: WeatherAlert) => new Date(alert.properties.expires).getTime() > Date.now()), status: 'ready', checkedAt: new Date() });
      })
      .catch(() => {
        if (active) setResult({ state, alerts: [], status: 'error' });
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [state, refresh]);

  return {
    alerts: result.state === state ? result.alerts : [],
    status: result.state === state ? result.status : 'loading' as const,
    checkedAt: result.state === state ? result.checkedAt : undefined,
    refresh: () => {
      setResult({ state, alerts: [], status: 'loading' });
      setRefresh(value => value + 1);
    },
  };
}