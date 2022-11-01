import { useEffect } from 'react';
import debug from 'debug';
import { useRouter } from 'next/router';
import { setItem } from 'next-basics';
import { AUTH_TOKEN } from 'lib/constants';
import useApi from 'hooks/useApi';
import { setUser } from 'store/app';

const log = debug('umami:sso');

export default function SingleSignOnPage() {
  const router = useRouter();
  const { get } = useApi();
  const { token, url } = router.query;

  useEffect(() => {
    async function verify() {
      setItem(AUTH_TOKEN, token);

      const { ok, data } = await get('/auth/verify');

      if (ok) {
        log(data);
        setUser(data);

        if (url) {
          await router.push(url);
        }
      }
    }

    if (token) {
      verify();
    }
  }, [token]);

  return null;
}
