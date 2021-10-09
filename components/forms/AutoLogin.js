import React from 'react';
import { useRouter } from 'next/router';
import usePost from 'hooks/usePost';

export default function AutoLogin({ hash = null }) {
  const post = usePost();
  const router = useRouter();

  const handleAutologin = async ({ hash }) => {
    const autologin = await post('/api/auth/hash', {
      hash,
    });

    if (autologin.ok) {
      return router.push('/');
    }
  };

  if (hash) {
    handleAutologin({ hash });
  }

  return <div />;
}
