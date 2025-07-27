import { useEffect } from 'react';
import useStore, { setConfig } from '@/store/app';
import { getConfig, Config } from '@/app/actions/getConfig';

export function useConfig(): Config {
  const { config } = useStore();

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

export default useConfig;
