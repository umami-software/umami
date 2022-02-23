import { useState, useEffect } from 'react';
import { saveQuery } from 'store/queries';
import useApi from './useApi';

export default function useFetch(url, options = {}, update = []) {
  const [response, setResponse] = useState();
  const [error, setError] = useState();
  const [loading, setLoadiing] = useState(false);
  const [count, setCount] = useState(0);
  const { get } = useApi();
  const { params = {}, headers = {}, disabled, delay = 0, interval, onDataLoad } = options;

  async function loadData(params) {
    try {
      setLoadiing(true);
      setError(null);
      const time = performance.now();

      const { data, status, ok } = await get(url, params, headers);

      await saveQuery(url, { time: performance.now() - time, completed: Date.now() });

      if (status >= 400) {
        setError(data);
        setResponse({ data: null, status, ok });
      } else {
        setResponse({ data, status, ok });
      }

      onDataLoad?.(data);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoadiing(false);
    }
  }

  useEffect(() => {
    if (url && !disabled) {
      const id = setTimeout(() => loadData(params), delay);

      return () => {
        clearTimeout(id);
      };
    }
  }, [url, !!disabled, count, ...update]);

  useEffect(() => {
    if (interval && !disabled) {
      const id = setInterval(() => setCount(state => state + 1), interval);

      return () => {
        clearInterval(id);
      };
    }
  }, [interval, !!disabled]);

  return { ...response, error, loading };
}
