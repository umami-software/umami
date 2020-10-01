import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LogoutPage() {
  const router = useRouter();
  const { basePath } = router;

  useEffect(() => {
    fetch(`${basePath}/api/auth/logout`).then(() => router.push('/login'));
  }, []);

  return null;
}
