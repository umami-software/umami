import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { get } from 'lib/web';
import { updateQuery } from 'redux/actions/queries';
import { useRouter } from 'next/router';

export default function useFetch(url, options = {}, update = []) {
  const dispatch = useDispatch();
  const [response, setResponse] = useState();
  const [error, setError] = useState();
  const [loading, setLoadiing] = useState(false);
  const [count, setCount] = useState(0);
  const { basePath } = useRouter();
  const { params = {}, disabled, headers, delay = 0, interval, onDataLoad } = options;

  async function loadData(params) {
    try {
      setLoadiing(true);
      setError(null);
      const time = performance.now();
      const { data, status, ok } = await get(`${basePath}${url}`, params, headers);

      dispatch(updateQuery({ url, time: performance.now() - time, completed: Date.now() }));

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
