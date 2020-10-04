import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function useForceSSL(enabled) {
  const router = useRouter();

  useEffect(() => {
    if (enabled && typeof window !== 'undefined' && /^http:\/\//.test(location.href)) {
      router.push(location.href.replace(/^http:\/\//, 'https://'));
    }
  }, [enabled]);

  return null;
}
