import { useEffect } from 'react';
import { useApp, setConfig } from '@/store/app';
import { useApi } from '@/components/hooks/useApi';

export type Config = {
  cloudMode: boolean;
  faviconUrl?: string;
  linksUrl?: string;
  pixelsUrl?: string;
  privateMode: boolean;
  telemetryDisabled: boolean;
  trackerScriptName?: string;
  updatesDisabled: boolean;
};

export function useConfig(): Config {
  const { config } = useApp();
  const { get } = useApi();

  async function loadConfig() {
    const data = await get(`/config`);

    setConfig(data);
  }

  useEffect(() => {
    if (!config) {
      loadConfig();
    }
  }, []);

  return config;
}
