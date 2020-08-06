import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DefaultPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, []);

  return null;
}
