import type { Metadata } from 'next';
import { LoginTwoFactorPage } from './LoginTwoFactorPage';
import { LoginPageWrapper } from '@/app/login/LoginPage';

export default async function () {
  if (process.env.DISABLE_LOGIN || process.env.CLOUD_MODE) {
    return null;
  }

  return (
    <LoginPageWrapper>
      <LoginTwoFactorPage />
    </LoginPageWrapper>
  );
}

export const metadata: Metadata = {
  title: 'Two-factor authentication',
};
