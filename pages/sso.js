import { useEffect } from 'react';
import { Loading } from 'react-basics';
import { useRouter } from 'next/router';
import { setClientAuthToken } from 'lib/client';
import useApi from '../hooks/useApi';

export default function SingleSignOnPage() {
  const { post } = useApi();
  const router = useRouter();
  const { token, url } = router.query;

  useEffect(() => {
    const signOn = async token => {
      setClientAuthToken(token);

      const data = await post('/auth/sso');

      setClientAuthToken(data.token);

      await router.push(url);
    };

    if (url && token) {
      setClientAuthToken(token);

      signOn();
    }
  }, [url, token]);

  return <Loading size="xl" />;
}
