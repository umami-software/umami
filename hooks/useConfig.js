import { useEffect } from 'react';
import useStore, { setConfig } from 'store/app';
import useApi from 'hooks/useApi';

let fetched = false;

export default function useConfig() {
  const { config } = useStore();
  const { get } = useApi();

  async function loadConfig() {
    const { data } = await get('/config');
    setConfig(data);
  }

  useEffect(() => {
    if (!config && !fetched) {
      fetched = true;
      loadConfig();
    }
  }, []);

  return config || {};
}
