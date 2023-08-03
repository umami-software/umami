import { useEffect } from 'react';
import useStore, { setConfig } from 'store/app';
import useApi from 'hooks/useApi';

let loading = false;

export function useConfig() {
  const { config } = useStore();
  const { get } = useApi();

  async function loadConfig() {
    const data = await get('/config');
    loading = false;
    setConfig(data);
  }

  useEffect(() => {
    if (!config && !loading) {
      loading = true;
      loadConfig();
    }
  }, []);

  return config;
}

export default useConfig;
