import React from 'react';
import Layout from 'components/layout/Layout';
import useApi from 'hooks/useApi';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { setItem } from 'lib/web';
import { setUser } from 'store/app';
import { AUTH_TOKEN } from 'lib/constants';

export default function AuthPage({ loginDisabled }) {
  const { post } = useApi();
  const router = useRouter();

  useEffect(() => {
    const { auth_code } = router.query;
    const verifyyData = async () => {
      const { ok, data } = await post('/auth/token', { authCode: auth_code });

      if (ok) {
        setItem(AUTH_TOKEN, data.token);
        setUser(data.user);

        await router.push('/');

        return null;
      }
    };

    verifyyData().catch(async () => await router.push('/'));
  }, [post, router]);

  if (loginDisabled) {
    return null;
  }

  return <Layout title="auth" header={false} footer={false} center></Layout>;
}

export async function getServerSideProps() {
  return {
    props: { loginDisabled: !!process.env.DISABLE_LOGIN },
  };
}
