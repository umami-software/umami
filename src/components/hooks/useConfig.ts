import { useEffect } from 'react';
import { useApp, setConfig } from '@/store/app';
import { getConfig, Config } from '@/app/actions/getConfig';

export function useConfig(): Config {
  const { config } = useApp();

  async function loadConfig() {
    setConfig(await getConfig());
  }

  useEffect(() => {
    if (!config) {
      loadConfig();
    }
  }, []);

  return config;
}
