'use client';
import { Column } from '@umami/react-zen';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  if (process.env.disableLogin) {
    return null;
  }

  return (
    <Column justifyContent="center" alignItems="center" height="100vh" backgroundColor="2">
      <LoginForm />
    </Column>
  );
}
