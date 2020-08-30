import { useState, useEffect } from 'react';
import { get } from 'lib/web';

export default function useFetch(url, params = {}, options = {}) {
  const [data, setData] = useState();
  const [error, setError] = useState();
  const keys = Object.keys(params)
    .sort()
    .map(key => params[key]);
  const { update = [], onDataLoad = () => {} } = options;

  async function loadData() {
    try {
      setError(null);
      const data = await get(url, params);
      setData(data);
      onDataLoad(data);
    } catch (e) {
      console.error(e);
      setError(e);
    }
  }

  useEffect(() => {
    if (url) {
      const { interval } = options;

      loadData();

      const id = interval ? setInterval(() => loadData(), interval) : null;

      return () => {
        clearInterval(id);
      };
    }
  }, [url, ...keys, ...update]);

  return { data, error };
}
