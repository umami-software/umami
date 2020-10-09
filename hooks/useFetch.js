import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { get } from 'lib/web';
import { updateQuery } from 'redux/actions/queries';
import { useRouter } from 'next/router';

export default function useFetch(url, params = {}, options = {}) {
  const dispatch = useDispatch();
  const [data, setData] = useState();
  const [status, setStatus] = useState();
  const [error, setError] = useState();
  const [loading, setLoadiing] = useState(false);
  const { basePath } = useRouter();
  const { update = [], onDataLoad = () => {}, disabled, headers, interval, delay = 0 } = options;

  async function loadData() {
    try {
      setLoadiing(true);
      setError(null);
      const time = performance.now();
      const { data, status } = await get(`${basePath}${url}`, params, headers);

      dispatch(updateQuery({ url, time: performance.now() - time, completed: Date.now() }));

      if (status >= 400) {
        setError(data);
        setData(null);
      } else {
        setData(data);
      }

      setStatus(status);
      onDataLoad(data);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoadiing(false);
    }
  }

  useEffect(() => {
    console.log('effect', params);
    if (url && !disabled) {
      if (!data) {
        setTimeout(() => loadData(), delay);
      }

      const id = interval ? setInterval(() => loadData(), interval) : null;

      return () => {
        clearInterval(id);
      };
    }
  }, [data, url, disabled, ...update]);

  return { data, status, error, loading };
}
