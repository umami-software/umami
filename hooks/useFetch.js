import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { get } from 'lib/web';
import { updateQuery } from 'redux/actions/queries';

export default function useFetch(url, params = {}, options = {}) {
  const dispatch = useDispatch();
  const [data, setData] = useState();
  const [error, setError] = useState();
  const [loading, setLoadiing] = useState(false);
  const keys = Object.keys(params)
    .sort()
    .map(key => params[key]);
  const { update = [], onDataLoad = () => {} } = options;

  async function loadData() {
    try {
      setLoadiing(true);
      setError(null);
      const time = performance.now();
      const data = await get(url, params);

      dispatch(updateQuery({ url, time: performance.now() - time, completed: Date.now() }));

      setData(data);
      onDataLoad(data);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoadiing(false);
    }
  }

  useEffect(() => {
    if (url) {
      const { interval, delay = 0 } = options;

      setTimeout(() => loadData(), delay);

      const id = interval ? setInterval(() => loadData(), interval) : null;

      return () => {
        clearInterval(id);
      };
    }
  }, [url, ...keys, ...update]);

  return { data, error, loading, loadData };
}
