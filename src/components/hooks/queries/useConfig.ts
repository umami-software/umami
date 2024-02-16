import { useEffect } from 'react';
import useStore, { setConfig } from 'store/app';
import { useApi } from './useApi';

let loading = false;

export function useConfig() {
  const { config } = useStore();
  const { get } = useApi();
  const configUrl = process.env.configUrl;

  async function loadConfig() {
    const data = await get(configUrl);
    loading = false;
    setConfig(data);
  }

  useEffect(() => {
    if (!config && !loading && configUrl) {
      loading = true;
      loadConfig();
    }
  }, []);

  return config;
}

export default useConfig;
