import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { get } from 'lib/web';

export default function LogoutPage() {
  const router = useRouter();
  const { basePath } = router;

  useEffect(() => {
    get(`${basePath}/api/auth/logout`).then(() => router.push('/login'));
  }, []);

  return null;
}
