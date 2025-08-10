'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export function LogoutPage() {
  const router = useRouter();
  const disabled = process.env.cloudMode;

  useEffect(() => {
    async function logout() {
      await signOut({ redirect: false });
    }

    if (!disabled) {
      logout();
      router.push('/login');
    }
  }, [disabled, router]);

  return null;
}

export default LogoutPage;
