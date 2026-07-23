import type { Metadata } from 'next';
import { isPasswordAuthDisabled } from '@/lib/password-auth';
import { LoginPage } from './LoginPage';

export const dynamic = 'force-dynamic';

export default async function () {
  if (isPasswordAuthDisabled()) {
    return null;
  }

  return <LoginPage />;
}

export const metadata: Metadata = {
  title: 'Login',
};
