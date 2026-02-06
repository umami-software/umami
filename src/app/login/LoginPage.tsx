'use client';
import { Column } from '@umami/react-zen';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  return (
    <Column alignItems="center" height="100vh" backgroundColor="surface-raised" paddingTop="12">
      <LoginForm />
    </Column>
  );
}
